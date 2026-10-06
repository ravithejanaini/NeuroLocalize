// Entry point: state, controls, camera and the render loop, in three modes — placing a lesion
// and seeing its findings, entering findings and seeing where the lesion could be, or
// practising on generated cases scheduled by the pathways answered wrongly.
import * as THREE from 'three';
import { forward, isBrain, isCord, isPlexus, isVision, mapLesion, type AnyRegion, type PlexusRegion } from '../engine/forward.ts';
import { mapBrain } from '../engine/brain.ts';
import { territoryRegions } from '../engine/hypotheses.ts';
import { mapPlexus } from '../engine/limb.ts';
import { hypotheses, type Hypothesis } from '../engine/hypotheses.ts';
import { mapVision, placeRegions } from '../engine/vision.ts';
import { sympatheticCourse, sympatheticFate } from '../geometry/sympathetic.ts';
import { rootExit, siteAnchor } from '../geometry/plexus.ts';
import { place, radiusAt } from '../geometry/paths.ts';
import { discAt } from '../geometry/section.ts';
import { describePart, partCardHtml, partName, refKey, type PartRef } from './describe.ts';
import { buildWalkView } from './walk-view.ts';
import { allWalks, lesionAt, WALK_GROUPS, type Walk, type WalkLesion } from './walks.ts';
import {
  explain,
  isPrepared,
  predict,
  prepare,
  reverse,
  SITE_NAME,
  slotKey,
  type Observation,
} from '../engine/reverse.ts';
import { spanOf, SHAPES, toRegions, type Shape } from '../geometry/lesion3d.ts';
import { segmentMid, segmentsBetween } from '../geometry/ruler.ts';
import { KB } from '../kb/kb.ts';
import { RENDER } from '../kb/render.ts';
import {
  COMPARTMENTS,
  OUTSIDE_BRAINSTEM,
  LEG_SITES,
  PLEXUS_SITES,
  SEGMENTS,
  SIDES,
  TIMEPOINTS,
  VERTEBRAE,
  type Compartment,
  type LesionFamily,
  type SensoryModality,
  type Side,
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
import { buildStage } from './materials.ts';
import { DILATION, PulseField } from './pulses.ts';
import { buildAnatomy, lesionMidY, type Palette } from './scene.ts';
import { buildBrain } from './brain3d.ts';
import { buildLimb } from './limb3d.ts';
import { registerOffline, saveFile } from './offline.ts';
import { caseHtml, progressHtml, targetText } from './practice-view.ts';
import { exportText, importText, loadProgress, saveProgress } from './progress-store.ts';
import { generateCase, hasPathway, isCorrect, type PracticeCase } from '../practice/generate.ts';
import { PATHWAYS } from '../practice/pathways.ts';
import { rng } from '../practice/rng.ts';
import { nextPathway, record } from '../practice/schedule.ts';
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
  nerve: css('--nerve-glow', '#e3cf8f'),
  nervePost: css('--nerve-post', '#b9a36b'),
  artery: css('--artery', '#b8565a'),
  autonomic: css('--autonomic', '#5fc9a7'),
};

type Mode = 'place' | 'examine' | 'practise';

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
  /** The arm a limb preset is placed on. */
  limbSide: Side;
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
  limbSide: 'L',
};

const practice = {
  progress: loadProgress(),
  kept: true,
  current: null as PracticeCase | null,
  chosen: null as number | null,
  revealed: false,
  present: false,
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
// P36: a lamp on the camera and a fog in the stage's colour, for depth.
const stage = buildStage(scene, camera, renderer, palette.stage);
const anatomy = buildAnatomy(RENDER, palette, labelLayer);
scene.add(anatomy.root);
const limb = buildLimb(KB, RENDER, palette, labelLayer);
scene.add(limb.root);
const brain = buildBrain(KB, RENDER, palette, labelLayer);
scene.add(brain.root);
const allLabels = [...anatomy.labels, ...limb.labels, ...brain.labels];
/** The side the arm station looks at. */
let armSide: Side = 'L';
/** Whether the limb in view is the leg (P7). */
const LEG_PLACES: ReadonlySet<string> = new Set<string>(LEG_SITES);
const limbStationFor = (site: string | undefined): 'arm' | 'leg' => (site && LEG_PLACES.has(site) ? 'leg' : 'arm');
let lastRepLimb: 'arm' | 'leg' | null = null;
const pulses = new PulseField(scene, KB, RENDER, palette);
const panel = new Panel(KB, $('#findings'));

let currentSegments: number[] = [];
let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── camera: a small orbit with named stations and eased moves ───────────
type View = { theta: number; phi: number; radius: number; y: number; x: number };
const view: View = { theta: -0.55, phi: 1.32, radius: 34, y: -11, x: 0 };
let tween: { from: View; to: View; start: number; ms: number } | null = null;
let currentStation = 'lesion';
const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const sliceLevel = (): number => {
  const mid = currentSegments[Math.floor(currentSegments.length / 2)];
  return state.followSlice && mid !== undefined ? mid : state.slice;
};

/** P41: on a stage narrower than it is tall — a phone — the long views stand further back. */
const tall = (): number => (viewport.clientWidth < viewport.clientHeight * 1.2 ? 1.3 : 1);

function station(name: string): View {
  const y = lesionMidY(RENDER, currentSegments);
  switch (name) {
    case 'lesion':
      return { theta: -0.7, phi: 1.2, radius: 9, y, x: 0 };
    case 'axial':
      return { theta: 0, phi: 0.06, radius: 5.5, y: -segmentMid(RENDER, sliceLevel()), x: 0 };
    case 'side':
      return { theta: -Math.PI / 2, phi: Math.PI / 2, radius: 12, y, x: 0 };
    case 'brain':
      // From the front, as the body map is drawn.
      return { theta: Math.PI + 0.35, phi: 1.45, radius: 30, y: 4.6, x: 0 };
    case 'head':
      // P37: close on the brainstem and the face, from the front and a little to one side, where
      // the cranial nerves and their end organs can be told apart and named.
      return { theta: Math.PI + 0.3, phi: 1.4, radius: 14, y: 4.2, x: 0 };
    case 'sympathetic':
      // P40: from the front and a little to one side, far enough back to hold the whole loop —
      // down the cord to T1 and up the neck to the eye.
      return { theta: Math.PI + 0.45, phi: 1.45, radius: 27 * tall(), y: -1.4, x: 0 };
    case 'vision':
      // P38: from above and in front, so the pathway runs away from the eyes to the back of the
      // head and the crossing at the chiasm is plain. Not so steep that the cord's cut-away starts.
      return { theta: Math.PI + 0.25, phi: 0.62, radius: 16 * tall(), y: 6.2, x: 0 };
    case 'leg':
      // From the front, like the arm: the whole lower limb, turned a little toward the chosen side.
      return { theta: Math.PI + (armSide === 'L' ? 0.3 : -0.3), phi: 1.5, radius: 40, y: -35, x: armSide === 'L' ? -2.6 : 2.6 };
    case 'arm':
      // From the front, as the body map is drawn: the patient's left on the viewer's right,
      // turned a little toward the chosen arm.
      return { theta: Math.PI + (armSide === 'L' ? 0.28 : -0.28), phi: 1.5, radius: 26, y: -12, x: armSide === 'L' ? -3.4 : 3.4 };
    default:
      return { theta: -0.55, phi: 1.32, radius: 34, y: -11, x: 0 };
  }
}

function go(name: string): void {
  currentStation = name;
  const to = station(name);
  document.querySelectorAll<HTMLButtonElement>('[data-station]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.station === name));
    // P41: on a phone the stations are one row that scrolls; keep the chosen one in sight.
    if (b.dataset.station === name) b.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  });
  if (reduced) {
    Object.assign(view, to);
    tween = null;
    return;
  }
  tween = { from: { ...view }, to, start: performance.now(), ms: 900 };
}

function placeCamera(): void {
  const { theta, phi, radius, y, x } = view;
  camera.position.set(
    x + radius * Math.sin(phi) * Math.sin(theta),
    y + radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta),
  );
  camera.lookAt(x, y, 0);
  // Looking down the cord (the axial station), cut away what lies above the slice.
  stage.update(radius, phi < 0.5 ? -segmentMid(RENDER, sliceLevel()) + 0.03 : null);
}

// P42: walking along a nerve. While a walk is on, the camera belongs to it.
const walks = allWalks(KB, RENDER);
const walkView = buildWalkView(scene, palette);
let walking: Walk | null = null;
let walkLesion: WalkLesion = { map: mapLesion([], KB), bmap: mapBrain(KB, []), pmap: mapPlexus([]), vmap: mapVision(KB, []), fields: null };
let walkStop = -1;
let walkLabels: HTMLElement[] = [];
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The walk whose drawn line passes nearest a point of the screen, within reach of a finger. */
function walkAt(clientX: number, clientY: number): Walk | null {
  const box = canvas.getBoundingClientRect();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  let best: Walk | null = null;
  let bestD = 14;
  for (const w of walks) {
    for (let i = 1; i < w.points.length; i++) {
      const p = w.points[i - 1];
      const q = w.points[i];
      if (!p || !q) continue;
      a.set(p.x, p.y, p.z).project(camera);
      b.set(q.x, q.y, q.z).project(camera);
      if (a.z >= 1 || b.z >= 1) continue;
      const ax = ((a.x + 1) / 2) * box.width + box.left;
      const ay = ((1 - a.y) / 2) * box.height + box.top;
      const bx = ((b.x + 1) / 2) * box.width + box.left;
      const by = ((1 - b.y) / 2) * box.height + box.top;
      const len2 = (bx - ax) ** 2 + (by - ay) ** 2;
      const t = len2 > 0 ? Math.min(1, Math.max(0, ((clientX - ax) * (bx - ax) + (clientY - ay) * (by - ay)) / len2)) : 0;
      const d = Math.hypot(ax + (bx - ax) * t - clientX, ay + (by - ay) * t - clientY);
      if (d < bestD) {
        bestD = d;
        best = w;
      }
    }
  }
  return best;
}

/** What the walk's panel says at one stop: the part's card under the stop's own name, and the lesion. */
function renderWalkStop(i: number): void {
  const w = walking;
  const s = w?.stops[i];
  if (!w || !s) return;
  walkStop = i;
  $('#walk-count').textContent = `Stop ${i + 1} of ${w.stops.length}`;
  const where = lesionAt(w, i, walkLesion);
  const line = $('#walk-lesion');
  line.hidden = where === 'clear';
  line.dataset.state = where;
  line.textContent =
    where === 'here'
      ? 'The lesion cuts this pathway here. Nothing travels past this point.'
      : where === 'beyond'
        ? 'Past the lesion: the signal does not reach here.'
        : where === 'weakened'
          ? 'The lesion weakens the signal on this pathway.'
          : '';
  const card = s.ref ? partCardHtml(describePart(RENDER, s.ref, state.timepoint)).replace(/<h3>[\s\S]*?<\/h3>/, '') : '';
  $('#walk-body').innerHTML = `<h3>${esc(s.label)}</h3>${s.note ? `<p class="walk-note">${esc(s.note)}</p>` : ''}${card}`;
  $('#walk-body').scrollTop = 0;
  document.querySelectorAll<HTMLButtonElement>('#walk-route button').forEach((b, j) => {
    if (j === i) {
      b.setAttribute('aria-current', 'step');
      b.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    } else b.removeAttribute('aria-current');
  });
}

/** Marks the stops the lesion closes, on the stage and in the list of stops. */
function refreshWalkLesion(): void {
  const w = walking;
  if (!w) return;
  const cut = w.fate(walkLesion).diesAt;
  walkView.setCut(cut);
  document.querySelectorAll<HTMLButtonElement>('#walk-route button').forEach((b, j) => {
    const point = w.stops[j]?.point ?? 0;
    b.dataset.cut = cut >= 0 && point === cut ? 'here' : cut >= 0 && point > cut ? 'beyond' : '';
  });
  if (walkStop >= 0) renderWalkStop(walkStop);
}

function startWalk(w: Walk, fromStop = 0): void {
  if (walking) endWalk();
  showPart(null);
  walking = w;
  walkStop = -1;
  tween = null;
  document.body.dataset.walk = 'true';
  $('#walk').hidden = false;
  $('#walk-name').textContent = w.name;
  $('#walk-runs').textContent = `Walking ${w.runs}.`;
  $('#walk-route').innerHTML = w.stops.map((s, i) => `<li><button type="button" data-stop="${i}"><b>${i + 1}</b> ${esc(s.label)}</button></li>`).join('');
  $<HTMLSelectElement>('#walk-pick').value = w.id;
  walkView.start(w, camera, fromStop, reduced);
  $<HTMLButtonElement>('#walk-play').disabled = reduced;
  for (const l of allLabels) l.el.style.visibility = 'hidden';
  walkLabels = w.stops.map((s, i) => {
    const el = document.createElement('span');
    el.className = 'lbl lbl-walk';
    el.textContent = `${i + 1} · ${s.label}`;
    labelLayer.append(el);
    return el;
  });
  refreshWalkLesion();
  renderWalkStop(Math.min(w.stops.length - 1, Math.max(0, fromStop)));
  $<HTMLButtonElement>('#walk-next').focus();
}

function endWalk(): void {
  if (!walking) return;
  walking = null;
  walkStop = -1;
  walkView.stop(camera);
  for (const el of walkLabels) el.remove();
  walkLabels = [];
  delete document.body.dataset.walk;
  $('#walk').hidden = true;
  $<HTMLSelectElement>('#walk-pick').value = '';
  setPlayingLabel(false);
}

const setPlayingLabel = (on: boolean): void => {
  const b = $<HTMLButtonElement>('#walk-play');
  b.textContent = on ? 'Pause' : 'Play';
  b.setAttribute('aria-pressed', String(on));
};

/** Each frame of a walk: the panel follows the stop, the scrubber the position, the names the stops ahead. */
function walkFrame(f: { stop: number; progress: number; playing: boolean }): void {
  if (f.stop !== walkStop) renderWalkStop(f.stop);
  const scrub = $<HTMLInputElement>('#walk-scrub');
  if (document.activeElement !== scrub) scrub.value = String(Math.round(f.progress * 1000));
  if ($('#walk-play').getAttribute('aria-pressed') !== String(f.playing)) setPlayingLabel(f.playing);
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  walkLabels.forEach((el, i) => {
    const at = walkView.anchors[i];
    if (!at) return;
    const far = camera.position.distanceTo(at);
    projected.copy(at).project(camera);
    // Only the stops ahead and near: the rest would pile up.
    const visible = projected.z < 1 && Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && far < 9 && far > 0.5 && i >= f.stop;
    el.style.visibility = visible ? 'visible' : 'hidden';
    if (visible) {
      el.style.opacity = String(Math.min(1, Math.max(0.25, 1.3 - far / 7)));
      el.style.transform = `translate(${((projected.x + 1) / 2) * w + 14}px, ${((1 - projected.y) / 2) * h}px)`;
    }
  });
}

// Pointer: one finger turns (shift moves along the cord), two fingers pinch to zoom.
const pointers = new Map<number, { x: number; y: number }>();
let pinch = 0;
const canvas = renderer.domElement;
// P39: a tap that does not drag names the part under it. P41: beyond the brain — the roots, the
// places of the plexus and nerves, and the parts of the cord at the slice.
let tapStart: { x: number; y: number; at: number } | null = null;
type Pickable = { readonly ref: PartRef; readonly at: { readonly x: number; readonly y: number; readonly z: number }; /** How near a tap must fall, in pixels; 16 unless said. */ readonly reach?: number };
const rootPickables: Pickable[] = SIDES.flatMap((side) =>
  SEGMENTS.map((_, k) => {
    // Midway along the drawn root, between the cord's edge and where the root leaves.
    const out = rootExit(RENDER, k, side);
    const x = ((side === 'L' ? -1 : 1) * radiusAt(RENDER, k) + out.x) / 2;
    return { ref: { kind: 'root' as const, side, k }, at: { x, y: (-segmentMid(RENDER, k) + out.y) / 2, z: out.z / 2 } };
  }),
);
const plexusPickables: Pickable[] = SIDES.flatMap((side) =>
  PLEXUS_SITES.flatMap((site) => {
    try {
      return [{ ref: { kind: 'plexus' as const, site, side }, at: siteAnchor(RENDER, site, side) }];
    } catch {
      return [];
    }
  }),
);
const cordAt = (compartment: Compartment, side: Side, k: number): Pickable['at'] =>
  place(RENDER, k, discAt(RENDER, compartment, side, k) ?? { x: 0, z: 0 });
const cordPickables = (): Pickable[] => {
  const k = sliceLevel();
  // A part of the cord is drawn as a disc, far wider than a mark: a tap anywhere on it counts.
  return SIDES.flatMap((side) => COMPARTMENTS.map((compartment) => ({ ref: { kind: 'cord' as const, compartment, side, k }, at: cordAt(compartment, side, k), reach: 30 })));
};
/** Where a part is drawn. */
const whereIs = (ref: PartRef): Pickable['at'] | null => {
  if (ref.kind === 'cord') return cordAt(ref.compartment, ref.side, ref.k);
  const key = refKey(ref);
  return [...brain.pickables, ...rootPickables, ...plexusPickables].find((p) => refKey(p.ref) === key)?.at ?? null;
};
const pickAt = (clientX: number, clientY: number): PartRef | null => {
  const nearBrain = currentStation === 'brain' || currentStation === 'head' || currentStation === 'vision' || (view.y > 0 && view.radius < 34);
  const nearArm = currentStation === 'arm' || currentStation === 'leg' || view.radius < 20;
  // Looking down the cord, everything along the limbs falls on top of the slice: only the slice
  // can be told apart there.
  const down = view.phi < 0.5 && !nearBrain;
  const candidates: Pickable[] = [
    ...(nearBrain ? brain.pickables : []),
    ...(nearArm && !down ? plexusPickables : []),
    ...(view.radius < 30 && !nearBrain && !down ? rootPickables : []),
    // The parts of the cord are a few pixels apart until the camera is close.
    ...(view.radius < 12 && !nearBrain ? cordPickables() : []),
  ];
  const box = canvas.getBoundingClientRect();
  const p = new THREE.Vector3();
  let best: PartRef | null = null;
  let bestD = 1;
  for (const k of candidates) {
    p.set(k.at.x, k.at.y, k.at.z).project(camera);
    if (p.z >= 1) continue;
    const d = Math.hypot(((p.x + 1) / 2) * box.width + box.left - clientX, ((1 - p.y) / 2) * box.height + box.top - clientY);
    // Nearest in proportion to its reach, so a wide disc does not take a tap meant for a mark.
    const ratio = d / (k.reach ?? 16);
    if (ratio < bestD) {
      bestD = ratio;
      best = k.ref;
    }
  }
  return best;
};
/** Every part in the list by name. A part of the cord there has no segment: it is taken at the slice. */
const listed: { readonly group: string; readonly label: string; readonly ref: PartRef }[] = [
  ...brain.pickables.map((k) => ({
    group: k.ref.kind === 'vision' ? 'visual pathway' : k.ref.kind === 'organ' ? 'end organs of the cranial nerves' : k.ref.kind === 'brain' ? k.ref.level : '',
    label: partName(k.ref),
    ref: k.ref,
  })),
  ...SIDES.flatMap((side) =>
    COMPARTMENTS.map((compartment) => {
      const ref: PartRef = { kind: 'cord', compartment, side, k: -1 };
      return { group: 'cord, at the slice', label: partName(ref).replace(/ at $/, ''), ref };
    }),
  ),
  ...rootPickables.map((k) => ({ group: 'roots', label: partName(k.ref), ref: k.ref })),
  ...plexusPickables.map((k) => ({ group: 'plexus and nerves', label: partName(k.ref), ref: k.ref })),
];
const listKey = (ref: PartRef): string => refKey(ref.kind === 'cord' ? { ...ref, k: -1 } : ref);
let chosenPart: PartRef | null = null;
function showPart(ref: PartRef | null): void {
  chosenPart = ref;
  brain.selectAt(ref ? whereIs(ref) : null, ref?.kind === 'cord' ? 0.45 : 1);
  const card = $('#part-card');
  card.hidden = ref === null;
  if (ref) {
    // P42: the walks that pass this part, to set off along from here.
    const key = refKey(ref);
    const through = walks.filter((w) => w.stops.some((s) => s.ref && refKey(s.ref) === key)).slice(0, 4);
    const offer = through.length
      ? `<h4>Walk along</h4><p class="pc-walks">${through.map((w) => `<button type="button" data-walk-id="${esc(w.id)}">${esc(w.name)} →</button>`).join('')}</p>`
      : '';
    $('#part-card-body').innerHTML = partCardHtml(describePart(RENDER, ref, state.timepoint)) + offer;
  }
  const pick = $<HTMLSelectElement>('#part-pick');
  pick.value = ref ? String(listed.findIndex((l) => listKey(l.ref) === listKey(ref))) : '';
}
canvas.addEventListener('pointerdown', (e) => {
  tapStart = pointers.size === 0 ? { x: e.clientX, y: e.clientY, at: performance.now() } : null;
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
  if (!prev) {
    // P39: a mouse over a part that can be named shows it.
    if (e.pointerType === 'mouse' && !walking) canvas.style.cursor = pickAt(e.clientX, e.clientY) ? 'pointer' : '';
    return;
  }
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
  if (walking) {
    // P42: on a walk a drag turns the head, as if the scene were held and pulled.
    walkView.look(-dx * 0.005, dy * 0.004);
    return;
  }
  if (e.shiftKey) view.y += dy * 0.03 * (view.radius / 20);
  else {
    view.theta -= dx * 0.008;
    view.phi = Math.min(Math.PI - 0.05, Math.max(0.05, view.phi - dy * 0.008));
  }
});
const release = (e: PointerEvent): void => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = 0;
  if (pointers.size === 0) walkView.release();
};
canvas.addEventListener('pointerup', (e) => {
  const tap = tapStart;
  tapStart = null;
  if (walking || !tap || Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 6 || performance.now() - tap.at > 600) return;
  // P42: a second tap in the same place, soon after, walks the nerve under it.
  const now = performance.now();
  const twice = lastTap !== null && now - lastTap.at < 420 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30;
  lastTap = twice ? null : { x: e.clientX, y: e.clientY, at: now };
  window.clearTimeout(naming);
  const ref = pickAt(e.clientX, e.clientY);
  if (twice) {
    const w = walkAt(e.clientX, e.clientY);
    if (w) startWalk(w);
    else if (ref) showPart(ref);
    return;
  }
  // The name waits a moment, so that a second tap finds the stage and not the card that the first put there.
  if (ref) naming = window.setTimeout(() => showPart(ref), 300);
});
let lastTap: { x: number; y: number; at: number } | null = null;
let naming = 0;
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    if (walking) {
      // P42: on a walk the wheel moves along the nerve — away from you is onward.
      walkView.nudge(-Math.sign(e.deltaY) * 0.025);
      return;
    }
    view.radius = Math.min(60, Math.max(2.5, view.radius * (1 + Math.sign(e.deltaY) * 0.08)));
  },
  { passive: false },
);

// P39: the same parts by name, for the keyboard and for parts too small to tap.
{
  const pick = $<HTMLSelectElement>('#part-pick');
  const groups = new Map<string, string[]>();
  listed.forEach((l, i) => {
    const list = groups.get(l.group) ?? [];
    list.push(`<option value="${i}">${l.label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</option>`);
    groups.set(l.group, list);
  });
  pick.innerHTML = `<option value="">Name a part…</option>${[...groups].map(([g, o]) => `<optgroup label="${g}">${o.join('')}</optgroup>`).join('')}`;
  pick.addEventListener('change', () => {
    const l = listed[Number(pick.value)];
    if (pick.value === '' || !l) {
      showPart(null);
      return;
    }
    const ref: PartRef = l.ref.kind === 'cord' ? { ...l.ref, k: sliceLevel() } : l.ref;
    showPart(ref);
    // Fly to where the part can be seen, unless the camera is already there.
    const atBrain = currentStation === 'brain' || currentStation === 'head' || currentStation === 'vision';
    if (ref.kind === 'vision' && !atBrain) go('vision');
    else if (ref.kind === 'organ' && !atBrain) go('head');
    else if (ref.kind === 'brain' && !atBrain) go(OUTSIDE_BRAINSTEM.includes(ref.compartment) ? 'head' : 'brain');
    else if (ref.kind === 'plexus') {
      armSide = ref.side;
      go(limbStationFor(ref.site));
    } else if (ref.kind === 'cord' && view.radius > 12) go('axial');
    else if (ref.kind === 'root') {
      state.followSlice = false;
      setSlice(ref.k);
      go('axial');
    }
  });
  $('#part-card-close').addEventListener('click', () => showPart(null));
  $('#part-card-body').addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-walk-id]') : null;
    const w = b ? walks.find((x) => x.id === b.dataset.walkId) : undefined;
    const key = chosenPart ? refKey(chosenPart) : '';
    if (w) startWalk(w, Math.max(0, w.stops.findIndex((s) => s.ref && refKey(s.ref) === key)));
  });
}

// P42: the walks by name, and the walk's own controls.
{
  const pick = $<HTMLSelectElement>('#walk-pick');
  pick.innerHTML = `<option value="">Walk along a nerve…</option>${WALK_GROUPS.map(
    (g) => `<optgroup label="${g}">${walks.filter((w) => w.group === g).map((w) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}</optgroup>`,
  ).join('')}`;
  pick.addEventListener('change', () => {
    const w = walks.find((x) => x.id === pick.value);
    if (w) startWalk(w);
    else endWalk();
  });
  $('#walk-exit').addEventListener('click', endWalk);
  $('#walk-prev').addEventListener('click', () => walkView.step(-1));
  $('#walk-next').addEventListener('click', () => walkView.step(1));
  $('#walk-play').addEventListener('click', () => walkView.setPlaying($('#walk-play').getAttribute('aria-pressed') !== 'true'));
  $('#walk-speed').addEventListener('change', (e) => walkView.setSpeed(Number((e.target as HTMLSelectElement).value) || 1));
  $('#walk-scrub').addEventListener('input', (e) => walkView.setProgress(Number((e.target as HTMLInputElement).value) / 1000));
  $('#walk-route').addEventListener('click', (e) => {
    const b = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-stop]') : null;
    if (b) {
      walkView.setPlaying(false);
      walkView.goTo(Number(b.dataset.stop));
    }
  });
}

// ── drawing a lesion, whichever mode chose it ────────────────────────────
type Shown = { regions: readonly AnyRegion[]; shape: Shape | null; top: number; bottom: number };

function showLesion(lesion: Shown): void {
  const cord = lesion.regions.filter(isCord);
  const plexus = lesion.regions.filter((r): r is PlexusRegion => isPlexus(r));
  const bmap = mapBrain(KB, lesion.regions.filter(isBrain));
  brain.setLesion(bmap);
  // P38: the visual pathway's own lesion, and the fields the engine reads from it.
  const vision = lesion.regions.filter(isVision);
  const vmap = mapVision(KB, vision);
  brain.setVision(vmap);
  pulses.setVision(vmap, vision.length ? forward(lesion.regions, state.timepoint).fields : null);
  const map = mapLesion(cord, KB);
  // P40: where the sympathetic strand stops on each side, for the marks at the centre and the root.
  brain.setSympathetic({
    L: sympatheticFate(map, bmap, sympatheticCourse(KB, RENDER, 'L')).diesAt,
    R: sympatheticFate(map, bmap, sympatheticCourse(KB, RENDER, 'R')).diesAt,
  });
  limb.setLesions(plexus.flatMap((r) => r.sides.map((side) => ({ site: r.plexus, side }))));
  currentSegments = lesion.shape ? segmentsBetween(RENDER, lesion.top, lesion.bottom) : [...map.segments];
  const k = sliceLevel();
  state.slice = k;
  const inside = lesion.shape !== null && currentSegments.includes(k);
  anatomy.setLesion(lesion.shape, lesion.top, lesion.bottom, lesion.shape ? currentSegments : []);
  anatomy.setSlice(k, inside);
  pulses.setLesion(map, mapPlexus(plexus), bmap);
  // P42: a walk in progress hears of the lesion too.
  walkLesion = { map, bmap, pmap: mapPlexus(plexus), vmap, fields: vision.length ? forward(lesion.regions, state.timepoint).fields : null };
  refreshWalkLesion();

  $('#slice').innerHTML = sliceSvg(RENDER, k, state.model, inside ? lesion.shape : null);
  $('#slice-cap').textContent = `${SEGMENTS[k] ?? ''} — ${
    lesion.shape
      ? inside
        ? 'inside the lesion'
        : 'outside the lesion'
      : plexus.length && !cord.length
        ? 'this lesion lies beyond the roots; the cord is untouched'
        : !cord.length && lesion.regions.some(isBrain)
          ? 'this lesion lies above the cord; every segment here is intact, and what it carries is cut higher up'
        : 'this lesion selects tracts or roots, not a place in the cord'
  }`;
  $<HTMLInputElement>('#slice-level').value = String(k);
  $<HTMLInputElement>('#slice-follow').checked = state.followSlice;
  if (currentStation === 'axial') go('axial');
}

// ── place mode ───────────────────────────────────────────────────────────
function placedLesion(): Shown {
  const p = state.preset;
  if (p.kind === 'system') return { regions: p.regions, shape: null, top: 0, bottom: 0 };
  if (p.kind === 'limb') {
    return { regions: [{ plexus: p.site, sides: [state.limbSide], severity: 'complete' }], shape: null, top: 0, bottom: 0 };
  }
  if (p.kind === 'brain') return { regions: territoryRegions(KB, p.territory, state.limbSide), shape: null, top: 0, bottom: 0 };
  if (p.kind === 'vision') return { regions: placeRegions(KB, p.place, state.limbSide), shape: null, top: 0, bottom: 0 };
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
  if (state.preset.kind === 'limb') return `${state.limbSide === 'L' ? 'Left' : 'Right'} ${SITE_NAME[state.preset.site]} — beyond the roots`;
  if (state.preset.kind === 'brain') {
    // P17: a midline place takes both sides, so it has no side to name (the vermis, the dorsal midbrain too).
    const midline = KB.brain.territories[state.preset.territory].midline === true;
    return `${midline ? 'The' : state.limbSide === 'L' ? 'Left' : 'Right'} ${SITE_NAME[state.preset.territory]} — above the cord`;
  }
  if (state.preset.kind === 'vision') {
    const midline = KB.vision.places[state.preset.place].midline === true;
    return `${midline ? 'The' : state.limbSide === 'L' ? 'Left' : 'Right'} ${SITE_NAME[state.preset.place]} — the visual pathway`;
  }
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
  limb.setFindings(findings);
  brain.setFindings(findings);
  $('#level-readout').textContent = levelReadout();
  $('#status').textContent = `${state.preset.label} · ${state.preset.pattern} · ${state.timepoint}`;

  const focal = state.preset.kind === 'focal';
  for (const id of ['#level', '#extent', '#by-vertebra']) ($(id) as HTMLInputElement).disabled = !focal;
  $('#limb-side-row').hidden =
    state.preset.kind !== 'limb' &&
    !(state.preset.kind === 'brain' && KB.brain.territories[state.preset.territory].midline !== true) &&
    !(state.preset.kind === 'vision' && KB.vision.places[state.preset.place].midline !== true);
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
let lastRepIsBrain = false;
/**
 * P37: the station for a lesion above the cord — the Head, close on the nerves and their organs,
 * when every part it takes lies outside the brainstem; otherwise the whole Brain.
 */
const brainStation = (regions: readonly AnyRegion[]): 'brain' | 'head' | 'vision' => {
  // P38: a lesion of the visual pathway alone is seen from the Vision station.
  if (regions.some(isVision) && !regions.some(isBrain)) return 'vision';
  const parts = regions.filter(isBrain).flatMap((r) => r.compartments);
  return parts.length > 0 && parts.every((c) => OUTSIDE_BRAINSTEM.includes(c)) ? 'head' : 'brain';
};
let lastRepStation: 'brain' | 'head' | 'vision' = 'brain';

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
    limb.setFindings(forward(rep.regions, t));
    brain.setFindings(forward(rep.regions, t));
    const at = rep.regions.find(isPlexus);
    if (at?.sides[0]) armSide = at.sides[0];
    lastRepIsBrain = rep.regions.some((r) => isBrain(r) || isVision(r));
    lastRepStation = brainStation(rep.regions);
    lastRepLimb = at ? limbStationFor(at.plexus) : null;
  } else {
    showLesion({ regions: [], shape: null, top: 0, bottom: 0 });
    limb.setFindings(null);
    brain.setFindings(null);
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

// ── practise mode ────────────────────────────────────────────────────────
const PRACTICE_TIME: Timepoint = 'chronic';
const random = rng((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0);
const hypothesisById = (id: string | undefined): Hypothesis | undefined =>
  id === undefined ? undefined : hypotheses().find((h) => h.id === id);

function newCase(): void {
  const due = nextPathway(practice.progress, Date.now(), random);
  // The scheduled pathway first; any other if no case can be built for it.
  practice.current = null;
  for (const target of [due, ...PATHWAYS.filter((p) => p !== due)]) {
    if (!hasPathway(target)) continue;
    try {
      practice.current = generateCase(Math.floor(random() * 2 ** 31), target, SLOTS);
      break;
    } catch {
      // No solvable case from that seed; try the next pathway.
    }
  }
  practice.chosen = null;
  practice.revealed = false;
}

function answer(index: number): void {
  const c = practice.current;
  if (!c || practice.revealed || index < 0 || index >= c.options.length) return;
  practice.chosen = index;
  practice.revealed = true;
  // A presenter answers for the room, so presenting never touches the schedule.
  if (!practice.present) {
    practice.progress = record(practice.progress, c.pathways, isCorrect(c, index), Date.now(), c.seed);
    practice.kept = saveProgress(practice.progress);
  }
  apply();
  showVerdict();
}

function reveal(): void {
  if (!practice.current || practice.revealed) return;
  practice.revealed = true;
  apply();
  showVerdict();
}

function showVerdict(): void {
  document.querySelector('#practice-case .pv')?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
}

const EMPTY: Shown = { regions: [], shape: null, top: 0, bottom: 0 };

function applyPractise(): void {
  $('#practice-progress').innerHTML = progressHtml(practice.progress, Date.now());
  $('#practice-kept').hidden = practice.kept;
  if (!isPrepared(PRACTICE_TIME)) {
    $('#practice-case').innerHTML = '<p class="quiet" id="prep-p">Working through the candidate lesions…</p>';
    $('#status').textContent = 'Practice · preparing';
    preparing ??= prepare(PRACTICE_TIME, {
      onProgress: (done, total) => {
        const p = document.querySelector('#prep-p') ?? document.querySelector('#prep');
        if (p) p.textContent = `Working through the candidate lesions… ${done} of ${total}`;
      },
    }).then(() => {
      preparing = null;
      if (state.mode !== 'place') apply();
    });
    showLesion(EMPTY);
    return;
  }
  if (!practice.current) newCase();
  const c = practice.current;
  if (!c) {
    $('#practice-case').innerHTML = '<p class="banner">No case could be built this time.</p><div class="row"><button type="button" class="btn btn-strong" id="practice-next">Try again</button></div>';
    return;
  }
  const truth = hypothesisById(c.hypothesisId);
  const chosenRep = practice.chosen === null ? undefined : hypothesisById(c.options[practice.chosen]?.memberIds[0]);
  $('#practice-case').innerHTML = caseHtml(
    RENDER,
    c,
    { chosen: practice.chosen, revealed: practice.revealed, present: practice.present },
    truth,
    chosenRep,
  );
  // The model stays empty until the answer is out, so it cannot give the answer away.
  if (practice.revealed && truth) {
    state.followSlice = true;
    showLesion(hypothesisLesion(truth));
    limb.setFindings(forward(truth.regions, PRACTICE_TIME));
    brain.setFindings(forward(truth.regions, PRACTICE_TIME));
    const at = truth.regions.find(isPlexus);
    if (at?.sides[0]) armSide = at.sides[0];
  } else {
    showLesion(EMPTY);
    limb.setFindings(null);
    brain.setFindings(null);
  }
  document.body.dataset.revealed = String(practice.revealed);
  $('#status').textContent = `Practice · ${targetText(c.target)} · ${c.observations.length} findings${
    practice.present ? ' · presenting' : ''
  }`;
}

function showTruth(): void {
  const truth = hypothesisById(practice.current?.hypothesisId);
  if (!truth || !practice.revealed) return;
  const place = truth.regions.find(isPlexus);
  go(truth.regions.some((r) => isBrain(r) || isVision(r)) ? brainStation(truth.regions) : place ? limbStationFor(place.plexus) : 'lesion');
}

function nextCase(): void {
  newCase();
  apply();
  go('whole');
  document.querySelector<HTMLElement>('#practice-case .po')?.focus();
}

function setPresent(on: boolean): void {
  practice.present = on;
  document.body.dataset.present = String(on);
  $('#present-exit').hidden = !on;
  if (on) {
    showTab('lesion');
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  } else if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => undefined);
  }
  apply();
  resize();
}

/** True when the key belonged to the practice card. */
function practiceKey(e: KeyboardEvent): boolean {
  const c = practice.current;
  if (state.mode !== 'practise' || !c) return false;
  const k = e.key.toLowerCase();
  const n = Number(e.key);
  if (!practice.revealed && Number.isInteger(n) && n >= 1 && n <= c.options.length) answer(n - 1);
  else if (practice.revealed && (k === 'n' || k === 'arrowright')) nextCase();
  else if (!practice.revealed && k === 'r' && practice.present) reveal();
  else if (practice.revealed && k === 'm') showTruth();
  else if (k === 'escape' && practice.present) setPresent(false);
  else return false;
  return true;
}

function apply(): void {
  if (state.mode === 'place') applyPlace();
  else if (state.mode === 'examine') applyExamine();
  else applyPractise();
}

function setMode(mode: Mode): void {
  state.mode = mode;
  document.body.dataset.mode = mode;
  document.querySelectorAll<HTMLElement>('[data-mode]').forEach((el) => {
    if (el !== document.body) el.hidden = !(el.dataset.mode ?? '').split(' ').includes(mode);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-tab-btn]').forEach((b) => {
    const label = mode === 'examine' ? b.dataset.examLabel : mode === 'practise' ? b.dataset.practiseLabel : b.dataset.placeLabel;
    if (label) b.textContent = label;
  });
  state.followSlice = true;
  if (mode !== 'practise' && practice.present) setPresent(false);
  apply();
  go(mode === 'practise' || (mode === 'examine' && state.exam.size === 0) ? 'whole' : 'lesion');
}

// ── controls: place ──────────────────────────────────────────────────────
const presetList = $('#presets');
presetList.innerHTML = PRESETS.map((p, i) => {
  const prev = PRESETS[i - 1];
  const legOf = (q: Preset | undefined): boolean => q?.kind === 'limb' && q.leg === true;
  const heading =
    prev?.kind === p.kind && legOf(prev) === legOf(p)
      ? ''
      : `<div class="divider">${
          p.kind === 'focal'
            ? 'Placed in space'
            : p.kind === 'system'
              ? 'Selects tracts or roots'
              : p.kind === 'limb'
                ? legOf(p)
                  ? 'The leg, beyond the roots'
                  : 'The arm, beyond the roots'
                : p.kind === 'vision'
                  ? 'The visual pathway'
                  : 'Above the cord'
        }</div>`;
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
  if (p.kind === 'limb') armSide = state.limbSide;
  apply();
  go(
    p.kind === 'focal'
      ? 'lesion'
      : p.kind === 'limb'
        ? p.leg
          ? 'leg'
          : 'arm'
        : p.kind === 'brain'
          ? brainStation(placedLesion().regions)
          : p.kind === 'vision'
            ? 'vision'
          : p.leg
            ? 'leg'
            : 'whole',
  );
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
  if (chosenPart) showPart(chosenPart);
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
bindToggle('limb-side', (v) => {
  state.limbSide = v as Side;
  armSide = state.limbSide;
  apply();
  if (currentStation === 'arm' || currentStation === 'leg') go(currentStation);
});
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
  // Follow a lead that moves into the brain, but only from the default views.
  if (lastRepIsBrain && (currentStation === 'whole' || currentStation === 'lesion')) go(lastRepStation);
  else if (lastRepLimb === 'leg' && (currentStation === 'whole' || currentStation === 'lesion')) go('leg');
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
  const observations = [...state.exam.values()];
  const group = isPrepared(state.timepoint) ? reverse(observations, state.timepoint, SLOTS).groups[state.candidate] : undefined;
  const site = group?.members[0]?.site;
  go(lastRepIsBrain ? lastRepStation : site ? limbStationFor(site) : 'lesion');
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

// ── controls: practise ───────────────────────────────────────────────────
$('#practice-case').addEventListener('click', (e) => {
  const el = e.target as Element;
  const choice = el.closest<HTMLButtonElement>('[data-choice]');
  if (choice) answer(Number(choice.dataset.choice));
  else if (el.closest('#practice-next')) nextCase();
  else if (el.closest('#practice-show')) showTruth();
  else if (el.closest('#practice-reveal')) reveal();
});
$('#practice-present').addEventListener('click', () => setPresent(true));
$('#present-exit').addEventListener('click', () => setPresent(false));
$('#practice-export').addEventListener('click', () => {
  const day = new Date().toISOString().slice(0, 10);
  void saveFile(`neurolocalize-progress-${day}.json`, exportText(practice.progress)).then((ok) => {
    $('#practice-io').textContent = ok ? 'Offered as a file to save.' : 'This page could not offer a file here.';
  });
});
$<HTMLInputElement>('#practice-import').addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  void file.text().then((text) => {
    const p = importText(text);
    if (!p) {
      $('#practice-io').textContent = 'That file is not progress saved by this page; nothing changed.';
      return;
    }
    practice.progress = p;
    practice.kept = saveProgress(p);
    $('#practice-io').textContent = `Loaded ${p.history.length} ${p.history.length === 1 ? 'answer' : 'answers'}.`;
    apply();
  });
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
const STATIONS = ['whole', 'lesion', 'axial', 'side', 'arm', 'leg', 'brain', 'head', 'vision', 'sympathetic'];
window.addEventListener('keydown', (e) => {
  const typing = e.target instanceof Element && e.target.closest('input, textarea, select') !== null;
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
  if (walking) {
    // P42: on a walk the arrows move between stops, space plays, Escape leaves.
    if (e.key === 'Escape') endWalk();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') walkView.step(1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') walkView.step(-1);
    else if (e.key === 'Home') walkView.goTo(0);
    else if (e.key === 'End') walkView.goTo(walking.stops.length - 1);
    else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) walkView.setPlaying($('#walk-play').getAttribute('aria-pressed') !== 'true');
    else return;
    e.preventDefault();
    return;
  }
  if (practiceKey(e)) {
    e.preventDefault();
    return;
  }
  // The tenth station is on the 0 key.
  const station = STATIONS[e.key === '0' ? 9 : Number(e.key) - 1];
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
  walkView.setStill(on);
  $<HTMLButtonElement>('#walk-play').disabled = on;
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
  const nearArm = currentStation === 'arm' || currentStation === 'leg' || view.radius < 20;
  const nearBrain = currentStation === 'brain' || currentStation === 'head' || currentStation === 'vision' || (view.y > 0 && view.radius < 34);
  const close = nearBrain && view.radius < 21;
  for (const l of allLabels) {
    projected.copy(l.at).project(camera);
    const visible =
      (!l.limb || nearArm) &&
      (!l.brain || nearBrain) &&
      (!l.close || close) &&
      (l.only ? currentStation === l.only : !(l.close && (currentStation === 'vision' || currentStation === 'sympathetic'))) &&
      projected.z < 1 &&
      Math.abs(projected.x) < 1.05 &&
      Math.abs(projected.y) < 1.05;
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
    view.x = from.x + (to.x - from.x) * k;
    if (t >= 1) tween = null;
  }
  if (walking) {
    // P42: the walk holds the camera; the fog closes in, so what is far is faint.
    const f = walkView.update(dt, camera);
    stage.update(4, null);
    pulses.update(dt, camera);
    renderer.render(scene, camera);
    walkFrame(f);
    requestAnimationFrame(frame);
    return;
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
registerOffline(() => {
  $('#offline-note').textContent = 'A newer version has been saved for offline use; it opens next time.';
});
