// Entry point: state, controls, camera and the render loop.
import * as THREE from 'three';
import { forward, mapLesion, type LesionRegion } from '../engine/forward.ts';
import { spanOf, toRegions, type Shape } from '../geometry/lesion3d.ts';
import { segmentMid, segmentsBetween } from '../geometry/ruler.ts';
import { KB } from '../kb/kb.ts';
import { RENDER } from '../kb/render.ts';
import { SEGMENTS, TIMEPOINTS, VERTEBRAE, type SensoryModality, type Timepoint } from '../kb/vocab.ts';
import { Panel } from './panel.ts';
import { PRESETS, type Preset } from './presets.ts';
import { DILATION, PulseField } from './pulses.ts';
import { buildAnatomy, lesionMidY, type Palette } from './scene.ts';
import { sliceSvg } from './svg.ts';

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

type State = {
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
};

const first = PRESETS[0];
if (!first) throw new Error('No lesion presets.');
const state: State = {
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
};

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

// ── state → everything ───────────────────────────────────────────────────
function lesionNow(): { regions: LesionRegion[]; shape: Shape | null; top: number; bottom: number } {
  const p = state.preset;
  if (p.kind === 'system') return { regions: [...p.regions], shape: null, top: 0, bottom: 0 };
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

function apply(): void {
  const lesion = lesionNow();
  const map = mapLesion(lesion.regions, KB);
  currentSegments = lesion.shape ? segmentsBetween(RENDER, lesion.top, lesion.bottom) : [...map.segments];
  const findings = forward(lesion.regions, state.timepoint, { laminationModel: state.model });

  const k = sliceLevel();
  state.slice = k;
  const inside = lesion.shape !== null && currentSegments.includes(k);
  anatomy.setLesion(lesion.shape, lesion.top, lesion.bottom, lesion.shape ? currentSegments : []);
  anatomy.setSlice(k, inside);
  pulses.setLesion(map);
  panel.update(findings, state.bodyModality);

  $('#slice').innerHTML = sliceSvg(RENDER, k, state.model, inside ? lesion.shape : null);
  $('#slice-cap').textContent = `${SEGMENTS[k] ?? ''} — ${
    lesion.shape ? (inside ? 'inside the lesion' : 'outside the lesion') : 'this pattern selects tracts, not a place'
  }`;
  const sliceInput = $<HTMLInputElement>('#slice-level');
  sliceInput.value = String(k);
  $<HTMLInputElement>('#slice-follow').checked = state.followSlice;
  $('#level-readout').textContent = levelReadout();
  $('#status').textContent = `${state.preset.label} · ${state.preset.pattern} · ${state.timepoint}`;

  const focal = state.preset.kind === 'focal';
  for (const id of ['#level', '#extent', '#by-vertebra']) ($(id) as HTMLInputElement).disabled = !focal;
  const level = $<HTMLInputElement>('#level');
  level.max = String((state.byVertebra ? VERTEBRAE.length : SEGMENTS.length) - 1);
  level.value = String(state.level);
  $<HTMLInputElement>('#extent').value = String(state.extent);
  $('#extent-out').textContent = `${state.extent} ${state.byVertebra ? 'vertebra' : 'segment'}${state.extent > 1 ? 's' : ''}`;
  if (currentStation === 'axial') go('axial');
}

// ── controls ─────────────────────────────────────────────────────────────
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
  // Keep the lesion where it was: convert the level between the two rulers.
  state.level = on
    ? Math.floor(segmentMid(RENDER, state.level))
    : (segmentsBetween(RENDER, state.level, state.level + 1)[0] ?? state.level);
  state.byVertebra = on;
  apply();
});

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

// The body-map toggle is re-rendered with the findings, so listen on the container.
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
  else if (e.key === '[' && state.preset.kind === 'focal') setLevel(state.level - 1);
  else if (e.key === ']' && state.preset.kind === 'focal') setLevel(state.level + 1);
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

pulses.setOptions({ model: state.model, painFibre: state.painFibre });
if (reduced) pulses.setFrozen(true);
choose(first);
resize();
requestAnimationFrame(frame);
