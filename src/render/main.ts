// Entry point: state, controls, camera and the render loop.
import * as THREE from 'three';
import { forward, mapLesion, type LesionRegion } from '../engine/forward.ts';
import { spanOf, toRegions, type Shape } from '../geometry/lesion3d.ts';
import { segmentMid, segmentsBetween } from '../geometry/ruler.ts';
import { KB } from '../kb/kb.ts';
import { RENDER } from '../kb/render.ts';
import { SEGMENTS, TIMEPOINTS, VERTEBRAE, type Timepoint } from '../kb/vocab.ts';
import { Panel, sliceSvg } from './panel.ts';
import { PRESETS, type Preset } from './presets.ts';
import { DILATION, PulseField } from './pulses.ts';
import { buildAnatomy, lesionMidY, type Palette } from './scene.ts';

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

// ── camera: a small orbit with named stations and eased moves ───────────
type View = { theta: number; phi: number; radius: number; y: number };
const view: View = { theta: -0.55, phi: 1.32, radius: 34, y: -11 };
let tween: { from: View; to: View; start: number; ms: number } | null = null;
const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function station(name: string): View {
  const y = lesionMidY(RENDER, currentSegments);
  switch (name) {
    case 'lesion':
      return { theta: -0.7, phi: 1.2, radius: 9, y };
    case 'axial':
      return { theta: 0, phi: 0.06, radius: 5.5, y };
    case 'side':
      return { theta: -Math.PI / 2, phi: Math.PI / 2, radius: 12, y };
    default:
      return { theta: -0.55, phi: 1.32, radius: 34, y: -11 };
  }
}

function go(name: string): void {
  const to = station(name);
  if (reduced) {
    Object.assign(view, to);
    return;
  }
  tween = { from: { ...view }, to, start: performance.now(), ms: 900 };
  document.querySelectorAll<HTMLButtonElement>('[data-station]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.station === name));
  });
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

let dragging: { x: number; y: number } | null = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY };
  renderer.domElement.setPointerCapture(e.pointerId);
  tween = null;
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - dragging.x;
  const dy = e.clientY - dragging.y;
  dragging = { x: e.clientX, y: e.clientY };
  if (e.shiftKey) {
    view.y += dy * 0.03 * (view.radius / 20);
  } else {
    view.theta -= dx * 0.008;
    view.phi = Math.min(Math.PI - 0.05, Math.max(0.05, view.phi - dy * 0.008));
  }
});
renderer.domElement.addEventListener('pointerup', () => (dragging = null));
renderer.domElement.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    view.radius = Math.min(60, Math.max(2.5, view.radius * (1 + Math.sign(e.deltaY) * 0.08)));
  },
  { passive: false },
);

// ── state → everything ───────────────────────────────────────────────────
let currentSegments: number[] = [];

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

  anatomy.setLesion(lesion.shape, lesion.top, lesion.bottom, lesion.shape ? currentSegments : []);
  const mid = currentSegments[Math.floor(currentSegments.length / 2)] ?? null;
  anatomy.setSlice(lesion.shape ? mid : null);
  pulses.setLesion(map);
  panel.update(findings);

  $('#slice').innerHTML = mid !== null && lesion.shape ? sliceSvg(RENDER, lesion.shape, mid) : '<p class="quiet">This pattern selects tracts rather than occupying a place, so there is no single slice.</p>';
  $('#slice-cap').textContent = mid !== null && lesion.shape ? `Axial slice at ${SEGMENTS[mid]}` : 'No slice';
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

// ── controls ─────────────────────────────────────────────────────────────
const presetList = $('#presets');
presetList.innerHTML = PRESETS.map((p, i) => {
  const heading =
    PRESETS[i - 1]?.kind === p.kind
      ? ''
      : `<div class="divider">${p.kind === 'focal' ? 'Placed in space' : 'Selects tracts'}</div>`;
  return `${heading}<button type="button" class="preset" data-preset="${p.id}" aria-pressed="false">
    <span class="preset-label">${p.label}</span><span class="preset-pattern">${p.pattern}</span></button>`;
}).join('');
presetList.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-preset]');
  const p = PRESETS.find((x) => x.id === btn?.dataset.preset);
  if (!p) return;
  state.preset = p;
  if (p.kind === 'focal') {
    state.byVertebra = false;
    $<HTMLInputElement>('#by-vertebra').checked = false;
    state.level = SEGMENTS.indexOf(p.level);
    state.extent = p.extent;
  }
  syncPresets();
  apply();
  if (p.kind === 'focal') go('lesion');
  else go('whole');
});
function syncPresets(): void {
  presetList.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.preset === state.preset.id));
  });
}

$<HTMLInputElement>('#level').addEventListener('input', (e) => {
  state.level = Number((e.target as HTMLInputElement).value);
  apply();
  go('lesion');
});
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

const timeInputs = $('#time');
timeInputs.innerHTML = TIMEPOINTS.map(
  (t, i) => `<label class="tick"><input type="radio" name="time" value="${t}" ${t === state.timepoint ? 'checked' : ''}>
    <span class="tick-name">${t}</span><span class="tick-when">${['0–24 h', '1–3 d', '4 d–1 mo', '> 1 mo'][i]}</span></label>`,
).join('');
timeInputs.addEventListener('change', (e) => {
  state.timepoint = (e.target as HTMLInputElement).value as Timepoint;
  apply();
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

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motionQuery.matches;
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

syncPresets();
pulses.setOptions({ model: state.model, painFibre: state.painFibre });
if (reduced) pulses.setFrozen(true);
apply();
resize();
go('lesion');
requestAnimationFrame(frame);
