// Signals in motion. Each pulse follows a path from the geometry layer and stops where
// fate() — the engine's own route judgement — says it stops (D18).
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
import type { Kb, RenderKb } from '../kb/types.ts';
import { SEGMENTS, type Side } from '../kb/vocab.ts';
import type { Palette } from './scene.ts';

/** Real conduction crosses the cord in milliseconds; everything is slowed by this (D15). */
export const DILATION = 333;

type Kind = 'pain' | 'posterior' | 'motor';

type Pulse = {
  readonly kind: Kind;
  readonly path: Path;
  readonly times: readonly number[];
  readonly sacral: boolean;
  t: number;
  fate: Fate;
  flashed: boolean;
};

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

  setLesion(map: LesionMap): void {
    this.map = map;
    for (const p of this.pulses) {
      p.fate = fate(map, this.kb, p.path, p.sacral);
      p.flashed = false;
    }
    if (this.frozen) this.seedStill();
  }

  setOptions(options: PathOptions): void {
    this.options = options;
    this.cache.clear();
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
    this.pulses.push({ kind, path, times, sacral, t, fate: fate(this.map, this.kb, path, sacral), flashed: false });
  }

  private spawnRandom(): void {
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
    return kind === 'pain' ? this.palette.stt : kind === 'posterior' ? this.palette.dc : this.palette.cst;
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
