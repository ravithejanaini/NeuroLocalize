// Signals in motion. Each pulse follows a path from the geometry layer and stops where
// fate() — the engine's own route judgement — says it stops (D18). Pulses to and from the
// arm run the same cord route, then the plexus route limbPath() builds from the engine's
// (D27), and stop at the first place the plexus lesion cuts.
import * as THREE from 'three';
import { crossingOffsets, type LesionMap } from '../engine/forward.ts';
import { isSacral } from '../engine/forward.ts';
import {
  cmPerUnit,
  fate,
  motorPath,
  sensoryPath,
  speedOf,
  type Fate,
  type Path,
  type PathOptions,
} from '../geometry/paths.ts';
import { mapBrain, type BrainMap } from '../engine/brain.ts';
import { disputedSegments, mapPlexus, type PlexusMap } from '../engine/limb.ts';
import { faceMotorPath, faceSensoryPath } from '../geometry/brain.ts';
import { limbFate, limbPath, suppliesOf, TARGETS, type LimbPath, type Target } from '../geometry/plexus.ts';
import type { Kb, RenderKb, Span } from '../kb/types.ts';
import { MUSCLES, SEGMENTS, type Muscle, type Segment, type Side, type SkinArea } from '../kb/vocab.ts';
import type { Palette } from './scene.ts';

/** Real conduction crosses the cord in milliseconds; everything is slowed by this (D15). */
export const DILATION = 333;

type Kind = 'pain' | 'posterior' | 'motor' | 'face-sense' | 'face-motor';

/** The arm part of a pulse: where its plexus route sits within the whole path. */
type LimbLeg = {
  readonly dir: 'motor' | 'sense';
  readonly lp: LimbPath;
  readonly side: Side;
  /** Index in the whole path of the limb path's first point. */
  readonly offset: number;
};

type Pulse = {
  readonly kind: Kind;
  readonly path: Path;
  readonly times: readonly number[];
  readonly sacral: boolean;
  readonly limb?: LimbLeg;
  t: number;
  fate: Fate;
  flashed: boolean;
};

const spanSegs = (span: Span | null | undefined): Segment[] =>
  span ? SEGMENTS.slice(SEGMENTS.indexOf(span[0]), SEGMENTS.indexOf(span[1]) + 1) : [];

type Flash = { mesh: THREE.Mesh; age: number };

const FLASH_LIFE = 0.7;

function timeline(render: RenderKb, path: Path): number[] {
  const times = [0];
  const speedAt = (i: number): number => {
    const leg = path.legs.find((l) => i >= l.from && i < l.to) ?? path.legs[path.legs.length - 1];
    return leg ? speedOf(render, leg.speed) : 1;
  };
  for (let i = 1; i < path.points.length; i++) {
    const a = path.points[i - 1];
    const b = path.points[i];
    const prev = times[i - 1] ?? 0;
    if (!a || !b) {
      times.push(prev);
      continue;
    }
    const metres = (Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) * cmPerUnit(render)) / 100;
    times.push(prev + (metres / speedAt(i - 1)) * DILATION);
  }
  return times;
}

function positionAt(p: Pulse, out: THREE.Vector3): void {
  const { times, path } = p;
  let i = 1;
  while (i < times.length - 1 && (times[i] ?? 0) < p.t) i++;
  const t0 = times[i - 1] ?? 0;
  const t1 = times[i] ?? t0;
  const a = path.points[i - 1];
  const b = path.points[i];
  if (!a || !b) return;
  const f = t1 > t0 ? Math.min(1, Math.max(0, (p.t - t0) / (t1 - t0))) : 1;
  out.set(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.z + (b.z - a.z) * f);
}

export class PulseField {
  private readonly pulses: Pulse[] = [];
  private readonly flashes: Flash[] = [];
  private readonly mesh: THREE.InstancedMesh;
  private readonly cache = new Map<string, { path: Path; times: number[] }>();
  private map: LesionMap | null = null;
  private pmap: PlexusMap = mapPlexus([]);
  private bmap: BrainMap;
  private readonly limbCache = new Map<string, { path: Path; times: number[]; limb: LimbLeg } | null>();
  private options: PathOptions = { model: 'classical', painFibre: 'adelta' };
  private frozen = false;
  private readonly tmp = new THREE.Object3D();
  private readonly colour = new THREE.Color();

  private readonly scene: THREE.Scene;
  private readonly kb: Kb;
  private readonly render: RenderKb;
  private readonly palette: Palette;
  private readonly max: number;

  constructor(scene: THREE.Scene, kb: Kb, render: RenderKb, palette: Palette, max = 180) {
    this.scene = scene;
    this.kb = kb;
    this.render = render;
    this.palette = palette;
    this.max = max;
    this.bmap = mapBrain(kb, []);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), material, max);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }

  setLesion(map: LesionMap, pmap: PlexusMap = mapPlexus([]), bmap: BrainMap = mapBrain(this.kb, [])): void {
    this.map = map;
    this.pmap = pmap;
    this.bmap = bmap;
    for (const p of this.pulses) {
      p.fate = this.fateOf(p.path, p.sacral, p.limb);
      p.flashed = false;
    }
    if (this.frozen) this.seedStill();
  }

  /** The cord's verdict and the plexus's, in the order the pulse meets them. */
  private fateOf(path: Path, sacral: boolean, limb?: LimbLeg): Fate {
    const map = this.map;
    if (!map) return { diesAtPoint: -1, dimmed: false };
    const cord = fate(map, this.kb, path, sacral, this.bmap);
    if (!limb) return cord;
    const arm = limbFate(this.pmap, limb.lp, limb.side);
    if (limb.dir === 'motor') {
      if (cord.diesAtPoint >= 0) return cord;
      return { diesAtPoint: arm.diesAt >= 0 ? arm.diesAt + limb.offset : -1, dimmed: cord.dimmed || arm.dimmed };
    }
    // A sensory pulse meets the most distal cut first.
    const n = limb.lp.points.length;
    const cut = [...limb.lp.sitePoint.entries()]
      .filter(([site]) => this.pmap.damage(site, limb.side) === 2)
      .sort((a, b) => b[1] - a[1])[0];
    if (cut) return { diesAtPoint: n - 1 - cut[1], dimmed: arm.dimmed };
    return { diesAtPoint: cord.diesAtPoint, dimmed: cord.dimmed || arm.dimmed };
  }

  setOptions(options: PathOptions): void {
    this.options = options;
    this.cache.clear();
    this.limbCache.clear();
    this.pulses.length = 0;
    if (this.frozen) this.seedStill();
  }

  /** Reduced motion: a fixed field of pulses, placed along their paths and held still. */
  setFrozen(frozen: boolean): void {
    this.frozen = frozen;
    this.pulses.length = 0;
    if (frozen) this.seedStill();
  }

  private pathFor(kind: Kind, side: Side, s: number, offset: number): { path: Path; times: number[] } {
    const key = `${kind}|${side}|${s}|${offset}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const path =
      kind === 'motor'
        ? motorPath(this.kb, this.render, side, s, this.options)
        : sensoryPath(this.kb, this.render, side, kind === 'pain' ? 'pain_temperature' : 'posterior_column', s, offset, this.options);
    const entry = { path, times: timeline(this.render, path) };
    this.cache.set(key, entry);
    return entry;
  }

  private spawn(kind: Kind, side: Side, s: number, offset: number, t = 0): void {
    if (!this.map || this.pulses.length >= this.max) return;
    const { path, times } = this.pathFor(kind, side, s, offset);
    const sacral = kind !== 'motor' && isSacral(this.kb, s);
    this.pulses.push({ kind, path, times, sacral, t, fate: this.fateOf(path, sacral), flashed: false });
  }

  /** A pulse between the cord and a muscle or patch of skin, through one root and one nerve. */
  private limbPathFor(target: Target, supplyIndex: number, root: Segment, side: Side): { path: Path; times: number[]; limb: LimbLeg } | null {
    const key = `${target}|${supplyIndex}|${root}|${side}`;
    if (this.limbCache.has(key)) return this.limbCache.get(key) ?? null;
    const supply = suppliesOf(this.kb, target)[supplyIndex];
    const lp = supply ? limbPath(this.kb, this.render, supply, root, target, side) : null;
    let entry: { path: Path; times: number[]; limb: LimbLeg } | null = null;
    if (lp) {
      const s = SEGMENTS.indexOf(root);
      if ((MUSCLES as readonly string[]).includes(target)) {
        const mp = motorPath(this.kb, this.render, side, s, this.options);
        const offset = mp.points.length - 1;
        const points = [...mp.points.slice(0, offset), ...lp.points];
        const legs = mp.legs.map((l, i) => (i === mp.legs.length - 1 ? { ...l, to: points.length - 1 } : l));
        const path: Path = { points, legs, elementPoint: mp.elementPoint, route: mp.route, brain: mp.brain };
        entry = { path, times: timeline(this.render, path), limb: { dir: 'motor', lp, side, offset } };
      } else {
        const sp = sensoryPath(this.kb, this.render, side, 'posterior_column', s, 0, this.options);
        const n = lp.points.length;
        const points = [...[...lp.points].reverse(), ...sp.points.slice(1)];
        const path: Path = {
          points,
          legs: [
            { from: 0, to: n, speed: 'abeta' },
            { from: n, to: points.length - 1, speed: 'illustrative' },
          ],
          elementPoint: sp.elementPoint.map((i) => i - 1 + n),
          route: sp.route,
          brain: sp.brain.map((e) => ({ ...e, point: e.point - 1 + n })),
        };
        entry = { path, times: timeline(this.render, path), limb: { dir: 'sense', lp, side, offset: 0 } };
      }
    }
    this.limbCache.set(key, entry);
    return entry;
  }

  private spawnLimb(t = 0, pick = Math.random): void {
    if (!this.map || this.pulses.length >= this.max) return;
    const target = TARGETS[Math.floor(pick() * TARGETS.length)];
    if (!target) return;
    const row = (MUSCLES as readonly string[]).includes(target)
      ? this.kb.plexus.muscles[target as Muscle]
      : this.kb.plexus.skin[target as SkinArea];
    const roots = [...spanSegs(row.roots), ...disputedSegments(row)];
    const root = roots[Math.floor(pick() * roots.length)];
    const supplies = suppliesOf(this.kb, target);
    const supplyIndex = Math.floor(pick() * supplies.length);
    const side: Side = pick() < 0.5 ? 'L' : 'R';
    if (!root) return;
    const entry = this.limbPathFor(target, supplyIndex, root, side);
    if (!entry) return;
    const kind: Kind = entry.limb.dir === 'motor' ? 'motor' : 'posterior';
    this.pulses.push({
      kind,
      path: entry.path,
      times: entry.times,
      sacral: false,
      limb: entry.limb,
      t,
      fate: this.fateOf(entry.path, false, entry.limb),
      flashed: false,
    });
  }

  /** A pulse to or from the face, through the trigeminal or facial routes. */
  private spawnFace(t = 0, pick = Math.random): void {
    if (!this.map || this.pulses.length >= this.max) return;
    const side: Side = pick() < 0.5 ? 'L' : 'R';
    const kind: Kind = pick() < 0.5 ? 'face-sense' : 'face-motor';
    const key = `face|${kind}|${side}`;
    let entry = this.cache.get(key);
    if (!entry) {
      const g = kind === 'face-sense' ? faceSensoryPath(this.kb, this.render, side) : faceMotorPath(this.kb, this.render, side);
      const path: Path = {
        points: g.points,
        legs: [{ from: 0, to: g.points.length - 1, speed: kind === 'face-sense' ? 'abeta' : 'corticospinal' }],
        elementPoint: [],
        route: { elements: [], crossesAt: -1 },
        brain: g.elements,
      };
      entry = { path, times: timeline(this.render, path) };
      this.cache.set(key, entry);
    }
    this.pulses.push({ kind, path: entry.path, times: entry.times, sacral: false, t, fate: this.fateOf(entry.path, false), flashed: false });
  }

  private spawnRandom(): void {
    const roll = Math.random();
    if (roll < 0.12) {
      this.spawnFace();
      return;
    }
    if (roll < 0.42) {
      this.spawnLimb();
      return;
    }
    const r = Math.random();
    const kind: Kind = r < 0.42 ? 'pain' : r < 0.74 ? 'posterior' : 'motor';
    const side: Side = Math.random() < 0.5 ? 'L' : 'R';
    const s = Math.floor(Math.random() * SEGMENTS.length);
    const offsets = crossingOffsets(this.kb);
    const offset = offsets[Math.floor(Math.random() * offsets.length)] ?? 1;
    this.spawn(kind, side, s, offset);
  }

  private seedStill(): void {
    this.pulses.length = 0;
    this.clearFlashes();
    // A fixed, repeatable spread of arm pulses, held part-way along.
    let seed = 7;
    const pick = (): number => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 6; i++) {
      const before = this.pulses.length;
      this.spawnFace(0, pick);
      const p = this.pulses[before];
      if (p) p.t = (p.times[p.times.length - 1] ?? 0) * (0.3 + pick() * 0.6);
    }
    for (let i = 0; i < 40; i++) {
      const before = this.pulses.length;
      this.spawnLimb(0, pick);
      const p = this.pulses[before];
      if (p) p.t = (p.times[p.times.length - 1] ?? 0) * (0.3 + pick() * 0.6);
    }
    const offsets = crossingOffsets(this.kb);
    const mid = offsets[Math.floor(offsets.length / 2)] ?? 1;
    for (let s = 0; s < SEGMENTS.length; s += 2) {
      for (const side of ['L', 'R'] as const) {
        for (const kind of ['pain', 'posterior', 'motor'] as const) {
          const { times } = this.pathFor(kind, side, s, mid);
          const total = times[times.length - 1] ?? 0;
          this.spawn(kind, side, s, mid, total * (0.35 + ((s * 7) % 5) * 0.1));
        }
      }
    }
  }

  private flash(at: THREE.Vector3, colour: string): void {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.06, 0.09, 24),
      new THREE.MeshBasicMaterial({ color: colour, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    );
    mesh.position.copy(at);
    this.scene.add(mesh);
    this.flashes.push({ mesh, age: 0 });
  }

  private hue(kind: Kind): string {
    return kind === 'pain' || kind === 'face-sense' ? this.palette.stt : kind === 'posterior' ? this.palette.dc : this.palette.cst;
  }

  update(dt: number, camera: THREE.Camera): void {
    if (!this.frozen) {
      const births = Math.min(6, Math.floor(dt * 40 + Math.random()));
      for (let i = 0; i < births; i++) this.spawnRandom();
    }

    const pos = new THREE.Vector3();
    let n = 0;
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      if (!p) continue;
      if (!this.frozen) p.t += dt;
      const deathTime = p.fate.diesAtPoint >= 0 ? (p.times[p.fate.diesAtPoint] ?? 0) : Infinity;
      const end = p.times[p.times.length - 1] ?? 0;

      if (p.t >= deathTime) {
        if (!p.flashed) {
          const at = p.path.points[p.fate.diesAtPoint];
          if (at) this.flash(new THREE.Vector3(at.x, at.y, at.z), this.hue(p.kind));
          p.flashed = true;
        }
        if (!this.frozen) this.pulses.splice(i, 1);
        continue;
      }
      if (p.t >= end) {
        if (!this.frozen) this.pulses.splice(i, 1);
        continue;
      }
      if (n >= this.max) continue;
      positionAt(p, pos);
      this.tmp.position.copy(pos);
      this.tmp.scale.setScalar(p.fate.dimmed ? 0.7 : 1);
      this.tmp.updateMatrix();
      this.mesh.setMatrixAt(n, this.tmp.matrix);
      this.colour.set(this.hue(p.kind)).multiplyScalar(p.fate.dimmed ? 0.35 : 1);
      this.mesh.setColorAt(n, this.colour);
      n++;
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      if (!f) continue;
      f.mesh.quaternion.copy(camera.quaternion);
      if (!this.frozen) f.age += dt;
      const life = f.age / FLASH_LIFE;
      f.mesh.scale.setScalar(1 + life * 2.5);
      (f.mesh.material as THREE.MeshBasicMaterial).opacity = this.frozen ? 0.9 : Math.max(0, 1 - life);
      if (!this.frozen && life >= 1) {
        this.scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE.Material).dispose();
        this.flashes.splice(i, 1);
      }
    }
  }

  /** Remove held flashes, for when the frozen field is rebuilt. */
  clearFlashes(): void {
    for (const f of this.flashes) {
      this.scene.remove(f.mesh);
      f.mesh.geometry.dispose();
      (f.mesh.material as THREE.Material).dispose();
    }
    this.flashes.length = 0;
  }
}
