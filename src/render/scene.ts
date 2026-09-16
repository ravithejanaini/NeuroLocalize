// Static anatomy and the lesion, drawn from the geometry layer. Nothing here decides a
// finding; it only shows where things are.
import * as THREE from 'three';
import { place, radiusAt } from '../geometry/paths.ts';
import { segmentBounds, segmentMid, segmentTop } from '../geometry/ruler.ts';
import { CORD_COMPARTMENTS, discAt } from '../geometry/section.ts';
import type { Shape } from '../geometry/lesion3d.ts';
import { outline } from '../geometry/outline.ts';
import type { RenderKb } from '../kb/types.ts';
import { SEGMENTS, SIDES, VERTEBRAE, type Compartment, type Side } from '../kb/vocab.ts';

export type Palette = {
  readonly stage: string;
  readonly cord: string;
  readonly rule: string;
  readonly grey: string;
  readonly dc: string;
  readonly stt: string;
  readonly cst: string;
  readonly lesion: string;
};

export const TRACT_COLOUR = (p: Palette, c: Compartment): string =>
  c === 'dorsal_column' ? p.dc : c === 'anterolateral' ? p.stt : c === 'lateral_cst' ? p.cst : p.grey;

const v3 = (p: { x: number; y: number; z: number }): THREE.Vector3 => new THREE.Vector3(p.x, p.y, p.z);
const basic = (color: string, opacity: number): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
const lineMat = (color: string, opacity: number): THREE.LineBasicMaterial =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity });

export type Label = { readonly el: HTMLElement; readonly at: THREE.Vector3 };

export type Anatomy = {
  readonly root: THREE.Group;
  readonly labels: Label[];
  readonly maxRadius: number;
  setLesion(shape: Shape | null, top: number, bottom: number, segments: readonly number[]): void;
  setSlice(at: number | null, insideLesion: boolean): void;
};

function label(text: string, className: string): HTMLElement {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

export function buildAnatomy(render: RenderKb, palette: Palette, layer: HTMLElement): Anatomy {
  const root = new THREE.Group();
  const labels: Label[] = [];
  const last = SEGMENTS.length - 1;
  const r = (k: number): number => radiusAt(render, Math.max(0, Math.min(last, Math.floor(k))));
  const maxRadius = Math.max(...SEGMENTS.map((_, k) => radiusAt(render, k)));

  // Cord surface: a lathe whose profile follows the drawn radius, closing at the conus.
  const profile: THREE.Vector2[] = [];
  for (let k = 0; k <= SEGMENTS.length; k += 0.25) {
    const radius = k >= SEGMENTS.length ? 0.001 : (r(k) + r(k - 0.25)) / 2;
    profile.push(new THREE.Vector2(radius, -segmentTop(render, k)));
  }
  profile.unshift(new THREE.Vector2(r(0), 0.9));
  root.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 48), basic(palette.cord, 0.06)));

  // A ring at every segment boundary: the cord's own ruler.
  const segmentLabels: HTMLElement[] = [];
  for (let k = 0; k < SEGMENTS.length; k++) {
    const pts = Array.from({ length: 49 }, (_, i) => {
      const a = (2 * Math.PI * i) / 48;
      return new THREE.Vector3(Math.cos(a) * r(k), -segmentTop(render, k), Math.sin(a) * r(k));
    });
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(palette.rule, 0.35)));
    const seg = SEGMENTS[k];
    if (seg) {
      const el = label(seg, 'lbl lbl-seg');
      layer.append(el);
      segmentLabels[k] = el;
      labels.push({ el, at: new THREE.Vector3(maxRadius + 0.45, -segmentMid(render, k), 0) });
    }
  }

  // Long tracts and grey matter as tubes through each compartment's centre.
  const tube = (c: Compartment, side: Side, colour: string, radius: number, opacity: number): void => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < SEGMENTS.length; k++) {
      const d = discAt(render, c, side, k);
      if (d) pts.push(v3(place(render, k, d)));
    }
    if (pts.length < 2) return;
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, radius, 6, false);
    root.add(new THREE.Mesh(geo, basic(colour, opacity)));
  };
  for (const side of SIDES) {
    for (const c of ['dorsal_column', 'lateral_cst', 'anterolateral'] as const) tube(c, side, TRACT_COLOUR(palette, c), 0.045, 0.3);
    for (const c of ['dorsal_horn', 'anterior_horn'] as const) tube(c, side, palette.grey, 0.03, 0.22);
    tube('intermediolateral', side, palette.grey, 0.018, 0.3);
  }

  // Vertebral bodies, ventral to the cord, and their labels on the far side.
  const body = new THREE.BoxGeometry(0.95, 0.8, 0.6);
  const edges = new THREE.EdgesGeometry(body);
  VERTEBRAE.forEach((v, i) => {
    const y = -(i + 0.5);
    const z = -(maxRadius + 0.75);
    const mesh = new THREE.Mesh(body, basic(palette.rule, 0.08));
    mesh.position.set(0, y, z);
    const rim = new THREE.LineSegments(edges, lineMat(palette.rule, 0.4));
    rim.position.copy(mesh.position);
    root.add(mesh, rim);
    const el = label(v, 'lbl lbl-vert');
    layer.append(el);
    labels.push({ el, at: new THREE.Vector3(-(maxRadius + 0.7), y, z) });
  });

  // Roots run from their segment to their exit: C1–C7 above the same-numbered vertebra,
  // C8 below C7 (S26), and caudally below the same-numbered vertebra. Schematic below L5.
  const exitAt = (k: number): number => {
    const seg = SEGMENTS[k] ?? '';
    if (seg.startsWith('C')) return Math.min(k, 6) + (k === 7 ? 1 : 0);
    const v = VERTEBRAE.indexOf(seg as (typeof VERTEBRAE)[number]);
    return v >= 0 ? v + 1 : VERTEBRAE.length + 0.5 + (k - SEGMENTS.indexOf('S1')) * 0.45;
  };
  for (const side of SIDES) {
    const sx = side === 'L' ? -1 : 1;
    for (let k = 0; k < SEGMENTS.length; k++) {
      const from = new THREE.Vector3(sx * r(k), -segmentMid(render, k), 0);
      const to = new THREE.Vector3(sx * (maxRadius + 0.35), -exitAt(k), -0.1);
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), lineMat(palette.grey, 0.28)));
    }
  }

  // The lesion volume and a live axial slice at its level.
  let lesionMesh: THREE.Object3D | null = null;
  const slice = new THREE.Group();
  root.add(slice);
  let sliceShape: Shape | null = null;

  const drawSlice = (k: number | null, insideLesion: boolean): void => {
    slice.clear();
    if (k === null) return;
    const radius = r(k);
    const y = -segmentMid(render, k);
    const flat = (g: THREE.BufferGeometry): THREE.BufferGeometry => g.rotateX(-Math.PI / 2);
    const disc = new THREE.Mesh(flat(new THREE.CircleGeometry(radius, 64)), basic(palette.stage, 0.85));
    disc.position.y = y;
    slice.add(disc);
    for (const side of SIDES) {
      for (const c of CORD_COMPARTMENTS) {
        const d = discAt(render, c, side, k);
        if (!d) continue;
        const m = new THREE.Mesh(flat(new THREE.CircleGeometry(d.r * radius, 24)), basic(TRACT_COLOUR(palette, c), 0.75));
        m.position.set(d.x * radius, y + 0.004, d.z * radius);
        slice.add(m);
      }
    }
    if (sliceShape && insideLesion) {
      const pts = outline(sliceShape).map((p) => new THREE.Vector3(p.x * radius, y + 0.01, p.z * radius));
      const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat(palette.lesion, 1));
      slice.add(ring);
    }
  };

  return {
    root,
    labels,
    maxRadius,
    setLesion(shape, top, bottom, segments) {
      if (lesionMesh) {
        root.remove(lesionMesh);
        lesionMesh = null;
      }
      for (const el of segmentLabels) el.classList.remove('is-hit');
      for (const k of segments) segmentLabels[k]?.classList.add('is-hit');
      sliceShape = shape;
      if (!shape || segments.length === 0) return;
      const radius = Math.max(...segments.map((k) => r(k)));
      const s2 = new THREE.Shape(outline(shape).map((p) => new THREE.Vector2(p.x * radius, p.z * radius)));
      const geo = new THREE.ExtrudeGeometry(s2, { depth: bottom - top, bevelEnabled: false });
      geo.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, basic(palette.lesion, 0.22));
      mesh.position.y = -top;
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineMat(palette.lesion, 0.8));
      rim.position.y = -top;
      const group = new THREE.Group();
      group.add(mesh, rim);
      lesionMesh = group;
      root.add(group);
    },
    setSlice(k, insideLesion) {
      drawSlice(k, insideLesion);
    },
  };
}

export const lesionMidY = (render: RenderKb, segments: readonly number[]): number => {
  if (segments.length === 0) return -10;
  const first = segments[0] ?? 0;
  const lastSeg = segments[segments.length - 1] ?? first;
  return -(segmentBounds(render, first)[0] + segmentBounds(render, lastSeg)[1]) / 2;
};
