// P42: walking along a nerve. The camera leaves its orbit and rides the strand a little above
// it, looking ahead, from one stop to the next. Each stop is a ring to pass through; the lesion's
// ring is closed. Nothing here decides anything: the walk says where the stops are and where the
// signal is cut (walks.ts).
import * as THREE from 'three';
import type { Palette } from './scene.ts';
import type { Walk } from './walks.ts';

const FOV_WALK = 64;
/** How far above the strand the eye rides, and how far ahead it looks, in scene units. */
const LIFT = 0.34;
const AHEAD = 1.1;
/** Scene units a second at normal speed, and seconds spent at a stop when playing. */
const PACE = 1.25;
const DWELL = 2.2;
/** A stretch between two stops never takes longer than this at normal speed. */
const LONGEST = 5;

export type WalkFrame = { readonly stop: number; readonly progress: number; readonly playing: boolean; readonly arrived: boolean };

export type WalkView = {
  readonly active: boolean;
  /** Where along the walk each stop lies, 0 to 1. */
  readonly stopProgress: readonly number[];
  /** Where each stop's name is shown. */
  readonly anchors: readonly THREE.Vector3[];
  start(walk: Walk, camera: THREE.PerspectiveCamera, fromStop: number, still: boolean): void;
  stop(camera: THREE.PerspectiveCamera): void;
  /** The point of the walk at which the lesion stops the signal, or -1. */
  setCut(point: number): void;
  setStill(still: boolean): void;
  update(dt: number, camera: THREE.PerspectiveCamera): WalkFrame;
  goTo(stop: number): void;
  step(by: 1 | -1): void;
  setPlaying(on: boolean): void;
  setSpeed(factor: number): void;
  /** Moves along by a fraction of the whole walk; stops playing. */
  nudge(fraction: number): void;
  setProgress(progress: number): void;
  /** Turns the head: radians right and up. */
  look(yaw: number, pitch: number): void;
  release(): void;
};

export function buildWalkView(scene: THREE.Scene, palette: Palette): WalkView {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  let walk: Walk | null = null;
  let curve: THREE.CatmullRomCurve3 | null = null;
  let length = 1;
  let stopU: number[] = [];
  let anchors: THREE.Vector3[] = [];
  let gates: { ring: THREE.Mesh; wall: THREE.Mesh; point: number }[] = [];
  let u = 0;
  let target = 0;
  let playing = false;
  let still = false;
  let speed = 1;
  let dwell = 0;
  let yaw = 0;
  let pitch = 0;
  let held = false;
  let savedFov = 38;
  let settled = false;
  const up = new THREE.Vector3(0, 1, 0);
  const eye = new THREE.Vector3();
  const aim = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const right = new THREE.Vector3();

  const clear = (): void => {
    for (const child of [...group.children]) {
      group.remove(child);
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      for (const one of Array.isArray(m) ? m : m ? [m] : []) one.dispose();
    }
    gates = [];
  };

  /** Keeps `up` square to the direction of travel, turning it as little as the strand turns. */
  const carryUp = (t: THREE.Vector3): void => {
    up.addScaledVector(t, -up.dot(t));
    if (up.lengthSq() < 1e-6) {
      // Travelling straight along the old up: any perpendicular will do; prefer the patient's back.
      up.set(0, 0, 1).addScaledVector(t, -t.z);
      if (up.lengthSq() < 1e-6) up.set(1, 0, 0);
    }
    up.normalize();
  };

  const currentStop = (): number => {
    let at = 0;
    stopU.forEach((s, i) => {
      if (s <= u + 1e-4) at = i;
    });
    return at;
  };

  const stopNear = (v: number): number => {
    let best = 0;
    stopU.forEach((s, i) => {
      if (Math.abs(s - v) < Math.abs((stopU[best] ?? 0) - v)) best = i;
    });
    return best;
  };

  return {
    get active() {
      return walk !== null;
    },
    get stopProgress() {
      return stopU;
    },
    get anchors() {
      return anchors;
    },

    start(w, camera, fromStop, isStill) {
      clear();
      walk = w;
      still = isStill;
      // Points that coincide would break the curve; each walk point maps to a vertex of it.
      const vertices: THREE.Vector3[] = [];
      const vertexOf: number[] = [];
      for (const p of w.points) {
        const v = new THREE.Vector3(p.x, p.y, p.z);
        const lastV = vertices[vertices.length - 1];
        if (!lastV || lastV.distanceToSquared(v) > 1e-6) vertices.push(v);
        vertexOf.push(vertices.length - 1);
      }
      if (vertices.length < 2) vertices.push((vertices[0] ?? new THREE.Vector3()).clone().add(new THREE.Vector3(0, 0, 0.01)));
      const per = 40;
      curve = new THREE.CatmullRomCurve3(vertices, false, 'centripetal');
      curve.arcLengthDivisions = (vertices.length - 1) * per;
      const lengths = curve.getLengths();
      length = Math.max(1e-3, lengths[lengths.length - 1] ?? 1);
      const uOfPoint = (point: number): number => (lengths[(vertexOf[point] ?? 0) * per] ?? 0) / length;
      stopU = w.stops.map((s) => uOfPoint(s.point));

      // The strand itself, lit from within so the way ahead can be seen through the fog.
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(24, vertices.length * 24), 0.018, 8, false),
        new THREE.MeshBasicMaterial({ color: palette.cord, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      group.add(tube);

      // A ring at every stop, square to the strand; the lesion's ring gets a wall across it.
      anchors = [];
      w.stops.forEach((s, i) => {
        const at = curve ? curve.getPointAt(stopU[i] ?? 0) : new THREE.Vector3();
        const t = curve ? curve.getTangentAt(Math.min(1, Math.max(0, stopU[i] ?? 0))) : new THREE.Vector3(0, 0, 1);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.016, 8, 48), new THREE.MeshBasicMaterial({ color: palette.cord, transparent: true, opacity: 0.8, depthWrite: false }));
        const wall = new THREE.Mesh(
          new THREE.CircleGeometry(0.42, 40),
          new THREE.MeshBasicMaterial({ color: palette.lesion, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }),
        );
        for (const mesh of [ring, wall]) {
          mesh.position.copy(at);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), t);
          group.add(mesh);
        }
        wall.visible = false;
        gates.push({ ring, wall, point: s.point });
        anchors.push(at.clone());
      });

      // Motes around the strand: they slide past as the eye moves, which is what gives depth.
      const motes: number[] = [];
      let seed = 11;
      const rnd = (): number => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const count = Math.min(1400, Math.round(length * 26));
      for (let i = 0; i < count; i++) {
        const p = curve.getPointAt(rnd());
        const r = 0.7 + rnd() * 2.4;
        const a = rnd() * Math.PI * 2;
        const b = Math.acos(2 * rnd() - 1);
        motes.push(p.x + r * Math.sin(b) * Math.cos(a), p.y + r * Math.cos(b), p.z + r * Math.sin(b) * Math.sin(a));
      }
      const dust = new THREE.BufferGeometry();
      dust.setAttribute('position', new THREE.Float32BufferAttribute(motes, 3));
      group.add(new THREE.Points(dust, new THREE.PointsMaterial({ color: palette.rule, size: 0.014, sizeAttenuation: true, transparent: true, opacity: 0.8, depthWrite: false })));

      group.visible = true;
      savedFov = camera.fov;
      camera.fov = FOV_WALK;
      camera.updateProjectionMatrix();
      u = stopU[Math.min(stopU.length - 1, Math.max(0, fromStop))] ?? 0;
      target = u;
      playing = false;
      dwell = 0;
      yaw = 0;
      pitch = 0;
      settled = false;
      up.set(0, 1, 0);
    },

    stop(camera) {
      clear();
      walk = null;
      curve = null;
      group.visible = false;
      camera.fov = savedFov;
      camera.up.set(0, 1, 0);
      camera.updateProjectionMatrix();
    },

    setCut(point) {
      for (const g of gates) {
        const cut = point >= 0 && g.point === point;
        const past = point >= 0 && g.point > point;
        g.wall.visible = cut;
        const m = g.ring.material as THREE.MeshBasicMaterial;
        m.color.set(cut ? palette.lesion : past ? palette.grey : palette.cord);
        m.opacity = past ? 0.4 : 0.85;
        g.ring.scale.setScalar(cut ? 1.15 : 1);
      }
    },

    setStill(on) {
      still = on;
      if (on) playing = false;
    },

    update(dt, camera) {
      if (!curve || !walk) return { stop: 0, progress: 0, playing: false, arrived: true };
      // Move toward the target: the next stop when playing, or wherever the walker asked to be.
      if (playing && Math.abs(target - u) < 1e-4) {
        dwell += dt;
        const here = currentStop();
        if (here >= stopU.length - 1) playing = false;
        else if (dwell >= DWELL / speed) {
          dwell = 0;
          target = stopU[here + 1] ?? 1;
        }
      }
      const gap = target - u;
      if (Math.abs(gap) > 1e-5) {
        if (still) u = target;
        else {
          // Units a second, raised on a long stretch so it never drags, eased into the stop.
          const stretch = Math.abs(gap) * length;
          const v = Math.max(PACE, stretch / LONGEST) * speed * Math.min(1, 0.25 + stretch * 1.5);
          const stepU = (v * dt) / length;
          u = Math.abs(gap) <= stepU ? target : u + Math.sign(gap) * stepU;
        }
      }

      tangent.copy(curve.getTangentAt(Math.min(1, Math.max(0, u))));
      carryUp(tangent);
      const wantEye = tmp.copy(curve.getPointAt(Math.min(1, Math.max(0, u)))).addScaledVector(up, LIFT);
      const k = still || !settled ? 1 : 1 - Math.exp(-dt * 9);
      eye.lerp(wantEye, k);
      const aheadU = u + AHEAD / length;
      const wantAim = aheadU <= 1 ? curve.getPointAt(aheadU).addScaledVector(up, LIFT * 0.15) : curve.getPointAt(1).addScaledVector(tangent, AHEAD).addScaledVector(up, LIFT * 0.15);
      aim.lerp(wantAim, k);
      settled = true;

      // The head turns while it is held, and comes back when let go.
      if (!held) {
        const back = still ? 0 : Math.exp(-dt * 3.5);
        yaw *= back;
        pitch *= back;
      }
      const dir = tmp.copy(aim).sub(eye);
      right.crossVectors(dir, up).normalize();
      dir.applyAxisAngle(up, -yaw).applyAxisAngle(right, pitch);
      camera.position.copy(eye);
      camera.up.copy(up);
      camera.lookAt(eye.x + dir.x, eye.y + dir.y, eye.z + dir.z);

      const here = currentStop();
      gates.forEach((g, i) => {
        if (!g.wall.visible) g.ring.scale.setScalar(i === here ? 1.12 : 1);
      });
      return { stop: here, progress: u, playing, arrived: Math.abs(target - u) < 1e-4 };
    },

    goTo(stop) {
      target = stopU[Math.min(stopU.length - 1, Math.max(0, stop))] ?? 0;
      dwell = 0;
    },
    step(by) {
      // From between two stops, "back" goes to the one behind and "on" to the one ahead.
      const here = currentStop();
      const atStop = Math.abs((stopU[here] ?? 0) - u) < 1e-4;
      let next = by === 1 ? here + 1 : atStop ? here - 1 : here;
      // Stops that share a place are passed together.
      while (next > 0 && next < stopU.length - 1 && Math.abs((stopU[next] ?? 0) - u) < 1e-4) next += by;
      playing = false;
      this.goTo(next);
    },
    setPlaying(on) {
      playing = on && !still;
      dwell = DWELL;
      if (playing && u >= 1 - 1e-4) {
        // Played from the end: start again.
        u = 0;
        target = 0;
        settled = false;
      }
    },
    setSpeed(factor) {
      speed = factor;
    },
    nudge(fraction) {
      playing = false;
      target = Math.min(1, Math.max(0, target + fraction));
    },
    setProgress(progress) {
      playing = false;
      target = Math.min(1, Math.max(0, progress));
      // A scrub that lands beside a stop takes it.
      const near = stopNear(target);
      if (Math.abs((stopU[near] ?? 0) - target) < 0.012) target = stopU[near] ?? target;
    },
    look(dYaw, dPitch) {
      held = true;
      yaw = Math.min(2.4, Math.max(-2.4, yaw + dYaw));
      pitch = Math.min(1.2, Math.max(-1.2, pitch + dPitch));
    },
    release() {
      held = false;
    },
  };
}
