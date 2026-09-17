// Entry point: state, controls, camera and the render loop, in two modes — placing a lesion
// and seeing its findings, or entering findings and seeing where the lesion could be.
import * as THREE from 'three';
import { forward, mapLesion, type LesionRegion } from '../engine/forward.ts';
import { hypotheses, type Hypothesis } from '../engine/hypotheses.ts';
import {
  explain,
  isPrepared,
  predict,
  prepare,
  reverse,
  slotKey,
  type Observation,
} from '../engine/reverse.ts';
import { spanOf, SHAPES, toRegions, type Shape } from '../geometry/lesion3d.ts';
import { segmentMid, segmentsBetween } from '../geometry/ruler.ts';
import { KB } from '../kb/kb.ts';
import { RENDER } from '../kb/render.ts';
import {
  SEGMENTS,
  TIMEPOINTS,
  VERTEBRAE,
  type LesionFamily,
  type SensoryModality,
  type Timepoint,
} from '../kb/vocab.ts';
import {
  candidatesHtml,
  examBodySvg,
  FAMILY_NAME,
  examTables,
  nextValue,
  suggestionHtml,
  workingHtml,
} from './examine.ts';
import { Panel } from './panel.ts';
import { PRESETS, type Preset } from './presets.ts';
import { DILATION, PulseField } from './pulses.ts';
import { buildAnatomy, lesionMidY, type Palette } from './scene.ts';
import { examSlots } from './slots.ts';
import { bodySilhouetteSvg, sliceSvg } from './svg.ts';

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element ${sel}`);
  return el;
};

const css = (name: string, fallback: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const palette: Palette = {
  stage: css('--stage', '#0e1118'),
  cord: css('--stage-cord', '#c9cfdc'),
  rule: css('--stage-rule', '#6f7888'),
  grey: css('--stage-grey', '#9aa3b2'),
  dc: css('--dc-glow', '#7f98ea'),
  stt: css('--stt-glow', '#d6a63e'),
  cst: css('--cst-glow', '#e8674b'),
  lesion: css('--lesion', '#e8674b'),
};

type Mode = 'place' | 'examine';

type State = {
  mode: Mode;
  preset: Preset;
  level: number;
  extent: number;
  byVertebra: boolean;
  timepoint: Timepoint;
  model: 'classical' | 'revised';
  painFibre: 'adelta' | 'c';
  bodyModality: SensoryModality;
  slice: number;
  followSlice: boolean;
  exam: Map<string, Observation>;
  examModality: SensoryModality;
  candidate: number;
};

const first = PRESETS[0];
if (!first) throw new Error('No lesion presets.');
const state: State = {
  mode: 'place',
  preset: first,
  level: first.kind === 'focal' ? SEGMENTS.indexOf(first.level) : 0,
  extent: first.kind === 'focal' ? first.extent : 1,
  byVertebra: false,
  timepoint: 'chronic',
  model: 'classical',
  painFibre: 'adelta',
  bodyModality: 'pain_temperature',
  slice: 0,
  followSlice: true,
  exam: new Map(),
  examModality: 'pain_temperature',
  candidate: 0,
};

const SLOTS = examSlots(RENDER);
const SLOT_BY_KEY = new Map(SLOTS.map((s) => [slotKey(s), s]));

// ── scene ────────────────────────────────────────────────────────────────
const viewport = $<HTMLDivElement>('#viewport');
const labelLayer = $<HTMLDivElement>('#labels');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(palette.stage);
viewport.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
const anatomy = buildAnatomy(RENDER, palette, labelLayer);
scene.add(anatomy.root);
const pulses = new PulseField(scene, KB, RENDER, palette);
const panel = new Panel(KB, $('#findings'));

let currentSegments: number[] = [];
let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── camera: a small orbit with named stations and eased moves ───────────
type View = { theta: number; phi: number; radius: number; y: number };
const view: View = { theta: -0.55, phi: 1.32, radius: 34, y: -11 };
let tween: { from: View; to: View; start: number; ms: number } | null = null;
let currentStation = 'lesion';
const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const sliceLevel = (): number => {
  const mid = currentSegments[Math.floor(currentSegments.length / 2)];
  return state.followSlice && mid !== undefined ? mid : state.slice;
};

function station(name: string): View {
  const y = lesionMidY(RENDER, currentSegments);
  switch (name) {
    case 'lesion':
      return { theta: -0.7, phi: 1.2, radius: 9, y };
    case 'axial':
      return { theta: 0, phi: 0.06, radius: 5.5, y: -segmentMid(RENDER, sliceLevel()) };
    case 'side':
      return { theta: -Math.PI / 2, phi: Math.PI / 2, radius: 12, y };
    default:
      return { theta: -0.55, phi: 1.32, radius: 34, y: -11 };
  }
}

function go(name: string): void {
  currentStation = name;
  const to = station(name);
  document.querySelectorAll<HTMLButtonElement>('[data-station]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.station === name));
  });
  if (reduced) {
    Object.assign(view, to);
    tween = null;
    return;
  }
  tween = { from: { ...view }, to, start: performance.now(), ms: 900 };
}

function placeCamera(): void {
  const { theta, phi, radius, y } = view;
  camera.position.set(
    radius * Math.sin(phi) * Math.sin(theta),
    y + radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta),
  );
  camera.lookAt(0, y, 0);
}

// Pointer: one finger turns (shift moves along the cord), two fingers pinch to zoom.
const pointers = new Map<number, { x: number; y: number }>();
let pinch = 0;
const canvas = renderer.domElement;
canvas.addEventListener('pointerdown', (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  canvas.setPointerCapture(e.pointerId);
  tween = null;
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    if (a && b) pinch = Math.hypot(a.x - b.x, a.y - b.y);
  }
});
canvas.addEventListener('pointermove', (e) => {
  const prev = pointers.get(e.pointerId);
  if (!prev) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    if (!a || !b) return;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinch > 0) view.radius = Math.min(60, Math.max(2.5, (view.radius * pinch) / d));
    pinch = d;
    return;
  }
  const dx = e.clientX - prev.x;
  const dy = e.clientY - prev.y;
  if (e.shiftKey) view.y += dy * 0.03 * (view.radius / 20);
  else {
    view.theta -= dx * 0.008;
    view.phi = Math.min(Math.PI - 0.05, Math.max(0.05, view.phi - dy * 0.008));
  }
});
const release = (e: PointerEvent): void => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = 0;
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    view.radius = Math.min(60, Math.max(2.5, view.radius * (1 + Math.sign(e.deltaY) * 0.08)));
  },
  { passive: false },
);

// ── drawing a lesion, whichever mode chose it ────────────────────────────
type Shown = { regions: readonly LesionRegion[]; shape: Shape | null; top: number; bottom: number };

function showLesion(lesion: Shown): void {
  const map = mapLesion(lesion.regions, KB);
  currentSegments = lesion.shape ? segmentsBetween(RENDER, lesion.top, lesion.bottom) : [...map.segments];
  const k = sliceLevel();
  state.slice = k;
  const inside = lesion.shape !== null && currentSegments.includes(k);
  anatomy.setLesion(lesion.shape, lesion.top, lesion.bottom, lesion.shape ? currentSegments : []);
  anatomy.setSlice(k, inside);
  pulses.setLesion(map);

  $('#slice').innerHTML = sliceSvg(RENDER, k, state.model, inside ? lesion.shape : null);
  $('#slice-cap').textContent = `${SEGMENTS[k] ?? ''} — ${
    lesion.shape ? (inside ? 'inside the lesion' : 'outside the lesion') : 'this lesion selects tracts or roots, not a place in the cord'
  }`;
  $<HTMLInputElement>('#slice-level').value = String(k);
  $<HTMLInputElement>('#slice-follow').checked = state.followSlice;
  if (currentStation === 'axial') go('axial');
}

// ── place mode ───────────────────────────────────────────────────────────
function placedLesion(): Shown {
  const p = state.preset;
  if (p.kind === 'system') return { regions: p.regions, shape: null, top: 0, bottom: 0 };
  let top: number;
  let bottom: number;
  if (state.byVertebra) {
    top = state.level;
    bottom = Math.min(VERTEBRAE.length, state.level + state.extent);
  } else {
    const lastIdx = Math.min(SEGMENTS.length - 1, state.level + state.extent - 1);
    const from = SEGMENTS[state.level] ?? 'C1';
    const to = SEGMENTS[lastIdx] ?? from;
    ({ top, bottom } = spanOf(RENDER, from, to));
  }
  return { regions: toRegions(RENDER, [{ shape: p.shape, top, bottom }]), shape: p.shape, top, bottom };
}

function levelReadout(): string {
  if (state.preset.kind === 'system') return 'Set by the pattern';
  if (state.byVertebra) {
    const v = VERTEBRAE[state.level] ?? '';
    const segs = currentSegments.map((k) => SEGMENTS[k]);
    const range = segs.length ? `${segs[0]}${segs.length > 1 ? `–${segs[segs.length - 1]}` : ''}` : 'none';
    return `${v} vertebra${state.extent > 1 ? ` + ${state.extent - 1}` : ''} → cord segments ${range}`;
  }
  const seg = SEGMENTS[state.level] ?? '';
  const vert = VERTEBRAE[Math.floor(segmentMid(RENDER, state.level))] ?? '';
  return `${seg} segment${state.extent > 1 ? ` + ${state.extent - 1}` : ''} — lies at the ${vert} vertebra`;
}

function applyPlace(): void {
  const lesion = placedLesion();
  showLesion(lesion);
  const findings = forward(lesion.regions, state.timepoint, { laminationModel: state.model });
  panel.update(findings, state.bodyModality);
  $('#level-readout').textContent = levelReadout();
  $('#status').textContent = `${state.preset.label} · ${state.preset.pattern} · ${state.timepoint}`;

  const focal = state.preset.kind === 'focal';
  for (const id of ['#level', '#extent', '#by-vertebra']) ($(id) as HTMLInputElement).disabled = !focal;
  const level = $<HTMLInputElement>('#level');
  level.max = String((state.byVertebra ? VERTEBRAE.length : SEGMENTS.length) - 1);
  level.value = String(state.level);
  $<HTMLInputElement>('#extent').value = String(state.extent);
  $('#extent-out').textContent = `${state.extent} ${state.byVertebra ? 'vertebra' : 'segment'}${state.extent > 1 ? 's' : ''}`;
}

// ── examine mode ─────────────────────────────────────────────────────────
const FAMILY_SHAPE: Partial<Record<LesionFamily, Shape>> = {
  complete: SHAPES.complete,
  hemicord_left: SHAPES.hemisectionLeft,
  hemicord_right: SHAPES.hemisectionRight,
  anterior: SHAPES.anterior,
  posterior: SHAPES.posterior,
  central_small: SHAPES.syrinx,
  central_cord: SHAPES.centralCord,
};

function hypothesisLesion(h: Hypothesis): Shown {
  const shape = FAMILY_SHAPE[h.family] ?? null;
  const from = SEGMENTS[h.rostral] ?? 'C1';
  const to = SEGMENTS[h.caudal] ?? from;
  const { top, bottom } = spanOf(RENDER, from, to);
  return { regions: h.regions, shape, top: shape ? top : 0, bottom: shape ? bottom : 0 };
}

let preparing: Promise<void> | null = null;

function applyExamine(): void {
  const t = state.timepoint;
  const observations = [...state.exam.values()];
  $('#exam-body').innerHTML = examBodySvg(
    RENDER,
    state.exam,
    state.examModality,
    bodySilhouetteSvg('Examination body map — select a landmark to record a finding'),
  );
  $('#exam-tables').innerHTML = examTables(RENDER, state.exam);
  $('#exam-count').textContent = `${observations.length} finding${observations.length === 1 ? '' : 's'} recorded`;

  if (!isPrepared(t)) {
    $('#cands').innerHTML = '<p class="quiet" id="prep">Working through the candidate lesions…</p>';
    $('#next').innerHTML = '';
    $('#working').innerHTML = '';
    $('#status').textContent = `Examination · ${t} · preparing`;
    preparing ??= prepare(t, {
      onProgress: (done, total) => {
        const p = document.querySelector('#prep');
        if (p) p.textContent = `Working through the candidate lesions… ${done} of ${total}`;
      },
    }).then(() => {
      preparing = null;
      if (state.mode === 'examine') applyExamine();
    });
    return;
  }

  const result = reverse(observations, t, SLOTS);
  const groups = result.groups;
  if (state.candidate >= Math.min(6, groups.length)) state.candidate = 0;
  const group = observations.length ? groups[state.candidate] : undefined;
  const rep = group?.members[0];

  $('#cands').innerHTML = candidatesHtml(result, state.candidate, observations.length);
  $('#next').innerHTML = suggestionHtml(RENDER, result, observations.length);
  $('#working').innerHTML = rep && group ? workingHtml(RENDER, explain(rep, observations, t), group) : '';

  if (rep) {
    state.followSlice = true;
    showLesion(hypothesisLesion(rep));
  } else {
    showLesion({ regions: [], shape: null, top: 0, bottom: 0 });
  }
  $('#status').textContent = `Examination · ${observations.length} findings · ${t}${
    group ? ` · leading: ${FAMILY_NAME[group.family].toLowerCase()}` : ''
  }`;
}

function exampleExam(): Map<string, Observation> {
  // An examination consistent with a left hemicord lesion, derived from the engine itself.
  const h = hypotheses().find((x) => x.id === 'hemicord_left:T8-T8');
  const out = new Map<string, Observation>();
  if (!h) return out;
  const f = forward(h.regions, 'chronic');
  const wanted = [
    'sensory|L|posterior_column|T6-T6', 'sensory|L|posterior_column|T10-T10', 'sensory|L|posterior_column|L4-L4',
    'sensory|R|posterior_column|L4-L4', 'sensory|R|pain_temperature|T4-T4', 'sensory|R|pain_temperature|L4-L4',
    'sensory|L|pain_temperature|L4-L4', 'strength|L|L3-L3', 'strength|R|L3-L3', 'strength|L|C6-C6',
    'reflex|L|achilles', 'reflex|R|achilles', 'babinski|L', 'babinski|R', 'bladder',
  ];
  for (const key of wanted) {
    const slot = SLOT_BY_KEY.get(key);
    if (!slot) continue;
    const v = predict(f, slot);
    if (v !== 'unknown') out.set(key, { ...slot, value: v } as Observation);
  }
  return out;
}

function apply(): void {
  if (state.mode === 'place') applyPlace();
  else applyExamine();
}

function setMode(mode: Mode): void {
  state.mode = mode;
  document.body.dataset.mode = mode;
  document.querySelectorAll<HTMLElement>('[data-mode]').forEach((el) => {
    if (el !== document.body) el.hidden = el.dataset.mode !== mode;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-tab-btn]').forEach((b) => {
    const label = mode === 'examine' ? b.dataset.examLabel : b.dataset.placeLabel;
    if (label) b.textContent = label;
  });
  state.followSlice = true;
  apply();
  go(mode === 'examine' && state.exam.size === 0 ? 'whole' : 'lesion');
}

// ── controls: place ──────────────────────────────────────────────────────
const presetList = $('#presets');
presetList.innerHTML = PRESETS.map((p, i) => {
  const heading =
    PRESETS[i - 1]?.kind === p.kind
      ? ''
      : `<div class="divider">${p.kind === 'focal' ? 'Placed in space' : 'Selects tracts'}</div>`;
  return `${heading}<button type="button" class="preset" data-preset="${p.id}" aria-pressed="false" aria-label="${p.label} — ${p.pattern}">
    <span class="preset-label">${p.label}</span><span class="preset-pattern">${p.pattern}</span></button>`;
}).join('');

function choose(p: Preset): void {
  state.preset = p;
  if (p.kind === 'focal') {
    state.byVertebra = false;
    $<HTMLInputElement>('#by-vertebra').checked = false;
    state.level = SEGMENTS.indexOf(p.level);
    state.extent = p.extent;
  }
  state.followSlice = true;
  presetList.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.preset === p.id));
  });
  apply();
  go(p.kind === 'focal' ? 'lesion' : 'whole');
}
presetList.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-preset]');
  const p = PRESETS.find((x) => x.id === btn?.dataset.preset);
  if (p) choose(p);
});

function setLevel(value: number): void {
  const max = (state.byVertebra ? VERTEBRAE.length : SEGMENTS.length) - 1;
  state.level = Math.max(0, Math.min(max, value));
  state.followSlice = true;
  apply();
  if (currentStation !== 'axial') go('lesion');
}
$<HTMLInputElement>('#level').addEventListener('input', (e) => setLevel(Number((e.target as HTMLInputElement).value)));
$<HTMLInputElement>('#extent').addEventListener('input', (e) => {
  state.extent = Number((e.target as HTMLInputElement).value);
  apply();
});
$<HTMLInputElement>('#by-vertebra').addEventListener('change', (e) => {
  const on = (e.target as HTMLInputElement).checked;
  state.level = on
    ? Math.floor(segmentMid(RENDER, state.level))
    : (segmentsBetween(RENDER, state.level, state.level + 1)[0] ?? state.level);
  state.byVertebra = on;
  apply();
});

// ── controls: shared ─────────────────────────────────────────────────────
function setSlice(value: number): void {
  state.slice = Math.max(0, Math.min(SEGMENTS.length - 1, value));
  state.followSlice = false;
  apply();
}
$<HTMLInputElement>('#slice-level').addEventListener('input', (e) => setSlice(Number((e.target as HTMLInputElement).value)));
$<HTMLInputElement>('#slice-follow').addEventListener('change', (e) => {
  state.followSlice = (e.target as HTMLInputElement).checked;
  apply();
});

const timeInputs = $('#time');
timeInputs.innerHTML = TIMEPOINTS.map(
  (t, i) => `<label class="tick"><input type="radio" name="time" value="${t}" ${t === state.timepoint ? 'checked' : ''}>
    <span class="tick-name">${t}</span><span class="tick-when">${['0–24 h', '1–3 d', '4 d–1 mo', '> 1 mo'][i]}</span></label>`,
).join('');
timeInputs.addEventListener('change', (e) => {
  state.timepoint = (e.target as HTMLInputElement).value as Timepoint;
  apply();
});

$('#findings').addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  if (input.name !== 'bodymap') return;
  state.bodyModality = input.value as SensoryModality;
  apply();
  document.querySelector<HTMLInputElement>(`input[name="bodymap"][value="${state.bodyModality}"]`)?.focus();
});

function bindToggle(name: string, onChange: (value: string) => void): void {
  document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) onChange(input.value);
    });
  });
}
bindToggle('model', (v) => {
  state.model = v as State['model'];
  pulses.setOptions({ model: state.model, painFibre: state.painFibre });
  apply();
});
bindToggle('fibre', (v) => {
  state.painFibre = v as State['painFibre'];
  pulses.setOptions({ model: state.model, painFibre: state.painFibre });
  apply();
});
bindToggle('mode', (v) => setMode(v as Mode));
bindToggle('exam-modality', (v) => {
  state.examModality = v as SensoryModality;
  apply();
});

// ── controls: examine ────────────────────────────────────────────────────
function cycleSlot(key: string): void {
  const slot = SLOT_BY_KEY.get(key);
  if (!slot) return;
  const next = nextValue(slot, state.exam.get(key)?.value);
  if (next === undefined) state.exam.delete(key);
  else state.exam.set(key, { ...slot, value: next } as Observation);
  state.candidate = 0;
  apply();
  const again = document.querySelector<HTMLElement>(`[data-slot="${CSS.escape(key)}"]`);
  again?.focus();
}

const examPanel = $('#exam-panel');
examPanel.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-slot]');
  if (el?.dataset.slot) cycleSlot(el.dataset.slot);
});
examPanel.addEventListener('keydown', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('g[data-slot]');
  if (el?.dataset.slot && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    cycleSlot(el.dataset.slot);
  }
});
$('#exam-example').addEventListener('click', () => {
  state.exam = exampleExam();
  state.candidate = 0;
  apply();
  go('lesion');
});
$('#exam-clear').addEventListener('click', () => {
  state.exam = new Map();
  state.candidate = 0;
  apply();
  go('whole');
});

$('#cands').addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-cand]');
  if (!btn) return;
  state.candidate = Number(btn.dataset.cand);
  state.followSlice = true;
  apply();
  go('lesion');
});
$('#next').addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-goto]');
  const key = btn?.dataset.goto;
  if (!key) return;
  const slot = SLOT_BY_KEY.get(key);
  if (slot?.kind === 'sensory' && slot.modality !== state.examModality) {
    state.examModality = slot.modality;
    const radio = document.querySelector<HTMLInputElement>(`input[name="exam-modality"][value="${slot.modality}"]`);
    if (radio) radio.checked = true;
    apply();
  }
  showTab('lesion');
  const target = document.querySelector<HTMLElement>(`[data-slot="${CSS.escape(key)}"]`);
  if (target) {
    target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    target.classList.add('is-asked');
    target.focus();
    window.setTimeout(() => target.classList.remove('is-asked'), 2400);
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-station]').forEach((b) => {
  b.addEventListener('click', () => go(b.dataset.station ?? 'whole'));
});

// Phone tabs (D22). On wide screens the CSS shows every section and hides the tab bar.
const panelEl = $('#panel');
function showTab(name: string): void {
  panelEl.dataset.tab = name;
  document.querySelectorAll<HTMLButtonElement>('[data-tab-btn]').forEach((b) => {
    const on = b.dataset.tabBtn === name;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
}
document.querySelectorAll<HTMLButtonElement>('[data-tab-btn]').forEach((b) => {
  b.addEventListener('click', () => showTab(b.dataset.tabBtn ?? 'lesion'));
});
showTab('lesion');

// Keyboard: 1–4 stations, [ ] move the lesion, , . move the slice.
const STATIONS = ['whole', 'lesion', 'axial', 'side'];
window.addEventListener('keydown', (e) => {
  const typing = e.target instanceof Element && e.target.closest('input, textarea, select') !== null;
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
  const station = STATIONS[Number(e.key) - 1];
  if (station) go(station);
  else if (e.key === '[' && state.mode === 'place' && state.preset.kind === 'focal') setLevel(state.level - 1);
  else if (e.key === ']' && state.mode === 'place' && state.preset.kind === 'focal') setLevel(state.level + 1);
  else if (e.key === ',') setSlice(state.slice - 1);
  else if (e.key === '.') setSlice(state.slice + 1);
  else return;
  e.preventDefault();
});

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = $<HTMLInputElement>('#still');
motionToggle.checked = reduced;
function setReduced(on: boolean): void {
  reduced = on;
  pulses.setFrozen(on);
  apply();
}
motionToggle.addEventListener('change', () => setReduced(motionToggle.checked));
motionQuery.addEventListener('change', () => {
  motionToggle.checked = motionQuery.matches;
  setReduced(motionQuery.matches);
});

document.querySelectorAll('.dilation').forEach((el) => (el.textContent = `${DILATION}×`));

// ── loop ─────────────────────────────────────────────────────────────────
function resize(): void {
  const { clientWidth: w, clientHeight: h } = viewport;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);

const projected = new THREE.Vector3();
function placeLabels(): void {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  for (const l of anatomy.labels) {
    projected.copy(l.at).project(camera);
    const visible = projected.z < 1 && Math.abs(projected.x) < 1.05 && Math.abs(projected.y) < 1.05;
    l.el.style.visibility = visible ? 'visible' : 'hidden';
    if (visible) l.el.style.transform = `translate(${((projected.x + 1) / 2) * w}px, ${((1 - projected.y) / 2) * h}px)`;
  }
}

let last = performance.now();
function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (tween) {
    const t = Math.min(1, (now - tween.start) / tween.ms);
    const k = ease(t);
    const { from, to } = tween;
    view.theta = from.theta + (to.theta - from.theta) * k;
    view.phi = from.phi + (to.phi - from.phi) * k;
    view.radius = from.radius + (to.radius - from.radius) * k;
    view.y = from.y + (to.y - from.y) * k;
    if (t >= 1) tween = null;
  }
  placeCamera();
  pulses.update(dt, camera);
  renderer.render(scene, camera);
  placeLabels();
  requestAnimationFrame(frame);
}

// Examination opens with a worked example rather than an empty form.
state.exam = exampleExam();
pulses.setOptions({ model: state.model, painFibre: state.painFibre });
if (reduced) pulses.setFrozen(true);
setMode('place');
choose(first);
resize();
requestAnimationFrame(frame);
