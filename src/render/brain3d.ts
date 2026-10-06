// The brain above the cord in the scene: brainstem, thalamus, capsule and the two cortical
// strips, the long tracts through them, and a mark on every part that turns to the lesion
// colour when the lesion takes it. Nothing here decides a finding.
import * as THREE from 'three';
import type { BrainMap } from '../engine/brain.ts';
import type { Findings } from '../engine/forward.ts';
import { allParts, cranialCourses, partPoint, targetPoint } from '../geometry/brain.ts';
import type { Kb, RenderKb } from '../kb/types.ts';
import { BODY_REGIONS, CRANIAL_TARGETS, SIDES, type BodyRegion, type BrainLevel, type CranialTarget, type Side } from '../kb/vocab.ts';
import { basic, glass, lit, tint } from './materials.ts';
import type { Label, Palette } from './scene.ts';

const v3 = (p: { x: number; y: number; z: number }): THREE.Vector3 => new THREE.Vector3(p.x, p.y, p.z);

export type BrainScene = {
  readonly root: THREE.Group;
  readonly labels: Label[];
  setLesion(bmap: BrainMap): void;
  /** P37: colours each end organ by its finding; null clears them. */
  setFindings(f: Findings | null): void;
};

/** P37: what each end organ is called on the stage. */
const TARGET_WORD: Record<CranialTarget, string> = {
  eye: 'eye',
  lacrimal: 'tear gland',
  forehead: 'forehead · V1',
  cheek: 'cheek · V2',
  jaw_skin: 'jaw · V3',
  jaw_muscle: 'jaw muscles',
  ear: 'ear',
  tongue: 'tongue',
  tongue_front: 'taste, front',
  tongue_back: 'tongue, back',
  palate: 'palate',
  shoulder: 'shoulder',
};

/** P37: the short name each course carries on the stage. */
const COURSE_WORD: Record<string, string> = {
  'V motor': 'V motor',
  'VII tears': 'gr. petrosal',
  'VII stapedius': 'n. to stapedius',
  'VII taste': 'chorda tympani',
};

/** P37: whether the finding an end organ shows is abnormal on side `x` — 2 lost or present, 1 partly or unsettled, 0 normal. */
function organState(f: Findings, t: CranialTarget, x: Side): 0 | 1 | 2 {
  const c = f.cranial[x];
  const any = (...signs: (keyof typeof c)[]): 0 | 1 | 2 =>
    signs.some((s) => c[s] === 'present') ? 2 : signs.some((s) => c[s] === 'indeterminate') ? 1 : 0;
  const skin = (d: 'V1' | 'V2' | 'V3'): 0 | 1 | 2 => {
    const s = f.faceDivision[x][d];
    return s === 'lost' ? 2 : s === 'intact' ? 0 : 1;
  };
  switch (t) {
    case 'eye':
      return any('oculomotor_palsy', 'abduction_weakness', 'superior_oblique_weakness', 'adduction_weakness', 'elevation_weakness', 'ptosis');
    case 'lacrimal':
      return any('tear_loss');
    case 'forehead':
      return skin('V1');
    case 'cheek':
      return skin('V2');
    case 'jaw_skin':
      return skin('V3');
    case 'jaw_muscle':
      return any('jaw_deviation');
    case 'ear':
      return any('hearing_loss', 'hyperacusis');
    case 'tongue':
      return any('tongue_weakness');
    case 'tongue_front':
      return any('taste_loss');
    case 'tongue_back':
      return any('posterior_tongue_loss');
    case 'palate':
      return any('palate_weakness');
    case 'shoulder':
      return any('accessory_weakness');
  }
}

const LEVEL_WORD: Record<BrainLevel, string> = {
  medulla: 'medulla',
  pons: 'pons',
  midbrain: 'midbrain',
  thalamus: 'thalamus',
  capsule: 'internal capsule',
  cortex: 'cortex',
  cerebellum: 'cerebellum',
};

export function buildBrain(kb: Kb, render: RenderKb, palette: Palette, layer: HTMLElement): BrainScene {
  const root = new THREE.Group();
  const labels: Label[] = [];
  const layout = render.brainLayout;
  const label = (text: string, at: THREE.Vector3, cls = 'lbl lbl-brain', close = false): void => {
    const el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    layer.append(el);
    labels.push({ el, at, brain: true, close });
  };
  const tube = (pts: readonly THREE.Vector3[], radius: number, colour: string, opacity: number): THREE.Mesh =>
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...pts], false, 'centripetal'), Math.max(8, pts.length * 8), radius, 10, false),
      lit(colour, opacity),
    );

  // The brainstem as one lathe whose radius follows the three levels.
  const stem: BrainLevel[] = ['medulla', 'pons', 'midbrain'];
  const profile: THREE.Vector2[] = [new THREE.Vector2(0.75, 0)];
  for (const l of stem) {
    const { y, height, radius } = layout.levels[l];
    profile.push(new THREE.Vector2(radius * 0.9, y - height / 2 + 0.05), new THREE.Vector2(radius, y), new THREE.Vector2(radius * 0.9, y + height / 2 - 0.05));
  }
  root.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 40), glass(palette.cord, 0.02, 0.32)));
  for (const l of stem) {
    const { y, height } = layout.levels[l];
    label(LEVEL_WORD[l], new THREE.Vector3(-(layout.levels[l].radius + 0.5), y, 0));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(layout.levels[l].radius, 0.012, 6, 48), basic(palette.rule, 0.35));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y + height / 2;
    root.add(ring);
  }

  // P11: the cerebellum as two faint lobes behind the pons and medulla, joined by the vermis.
  {
    const c = layout.levels.cerebellum;
    for (const side of SIDES) {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), glass(palette.cord, 0.02, 0.3));
      lobe.scale.set(1.25, 0.85, 0.9);
      lobe.position.set((side === 'L' ? -1 : 1) * 1.3, c.y, 2.2);
      root.add(lobe);
    }
    label(LEVEL_WORD.cerebellum, new THREE.Vector3(-2.9, c.y - 0.9, 2.2));
  }

  // Thalamus and capsule as faint forms on either side; the cortex as two shells.
  for (const side of SIDES) {
    const s = side === 'L' ? -1 : 1;
    const th = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 20), glass(palette.cord, 0.03, 0.34));
    th.scale.set(1.3, 0.7, 1);
    th.position.set(s * 0.95, layout.levels.thalamus.y, 0.1);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 1.3), basic(palette.cord, 0.06));
    cap.position.set(s * 1.55, layout.levels.capsule.y, 0.1);
    cap.rotation.z = s * 0.35;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), glass(palette.cord, 0.015, 0.26));
    shell.scale.set(3.4, 2.6, 4.2);
    shell.position.set(s * 1.9, layout.levels.cortex.y - 1.4, 0);
    root.add(th, cap, shell);
  }
  label(LEVEL_WORD.thalamus, new THREE.Vector3(-2.3, layout.levels.thalamus.y, 0));
  label(LEVEL_WORD.capsule, new THREE.Vector3(-2.6, layout.levels.capsule.y, 0));

  // The two strips, drawn through the homunculus, and the regions named on the left.
  const order: BodyRegion[] = ['leg', 'trunk', 'neck', 'arm', 'face'];
  for (const side of SIDES) {
    for (const [c, colour] of [
      ['motor_cortex', palette.cst],
      ['sensory_cortex', palette.dc],
    ] as const) {
      root.add(tube(order.map((r) => v3(partPoint(render, 'cortex', c, side, r))), 0.06, colour, 1));
    }
  }
  for (const r of BODY_REGIONS) {
    const p = partPoint(render, 'cortex', 'motor_cortex', 'L', r);
    label(r, new THREE.Vector3(p.x, p.y + 0.35, p.z - 0.2), 'lbl lbl-brain lbl-homunculus');
  }
  label('motor', v3(partPoint(render, 'cortex', 'motor_cortex', 'R', 'face')).add(new THREE.Vector3(0.2, -0.4, -0.2)));
  label('sensory', v3(partPoint(render, 'cortex', 'sensory_cortex', 'R', 'face')).add(new THREE.Vector3(0.2, -0.7, 0.3)));

  // The long tracts, drawn through their own step lists (arm fibres stand for all).
  const tract = (steps: readonly { level: BrainLevel; compartment: Parameters<typeof partPoint>[2] }[], side: Side, colour: string): void => {
    root.add(tube(steps.map((s) => v3(partPoint(render, s.level, s.compartment, side, 'arm'))), 0.03, colour, 1));
  };
  for (const side of SIDES) {
    tract([...kb.brain.corticospinal.steps], side, palette.cst);
    tract([...kb.brain.lemniscal.steps], side, palette.dc);
    tract([...kb.brain.spinothalamic.steps], side, palette.stt);
  }
  // The decussations, as an X at the bottom of the medulla.
  const y = layout.decussationY;
  for (const s of [-1, 1]) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(s * 0.5, y + 0.35, -0.5), new THREE.Vector3(-s * 0.5, y - 0.1, -0.5)]),
      new THREE.LineBasicMaterial({ color: palette.cst, transparent: true, opacity: 0.6 }),
    );
    root.add(line);
  }
  label('pyramidal decussation', new THREE.Vector3(1.1, y, -0.5), 'lbl lbl-brain lbl-land');

  // A mark for every part; the lesion colours the ones it takes.
  const marks = allParts(render).map((p) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.level === 'cortex' ? 0.13 : 0.075, 16, 12), lit(palette.grey, 0.4));
    mesh.position.copy(v3(p.at));
    root.add(mesh);
    return { ...p, mesh };
  });
  const f = layout.face;
  for (const side of SIDES) {
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), glass(palette.cord, 0.05, 0.45));
    face.position.set((side === 'L' ? 1 : -1) * f[0], f[1], f[2]);
    root.add(face);
  }
  label('face', new THREE.Vector3(f[0], f[1] + 0.45, f[2]), 'lbl lbl-brain lbl-land');

  // P37: every cranial nerve as a strand from its origin to its end organ, built from the same
  // step lists the engine reads (geometry/brain.ts), and a mark on each end organ.
  for (const side of SIDES) {
    for (const c of cranialCourses(kb, render, side)) {
      if (c.points.length < 2) continue;
      root.add(tube(c.points.map(v3), 0.016, c.dir === 'motor' ? palette.nerve : palette.nervePost, 1));
      // Name each nerve once, on the patient's left, beside the part nearest its organ.
      if (side === 'L') {
        const at = c.dir === 'motor' ? c.points[c.points.length - 2] : c.points[1];
        if (at) label(COURSE_WORD[c.id] ?? c.id, new THREE.Vector3(at.x - 0.18, at.y + 0.12, at.z), 'lbl lbl-brain lbl-nerve', true);
      }
    }
  }
  const organs = new Map<string, THREE.Mesh>();
  for (const side of SIDES) {
    for (const t of CRANIAL_TARGETS) {
      const at = v3(targetPoint(render, t, side));
      const big = t === 'eye' || t === 'shoulder' || t === 'ear';
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(big ? 0.2 : 0.11, 24, 16), lit(palette.cord, 0.5));
      mesh.position.copy(at);
      root.add(mesh);
      organs.set(`${side}|${t}`, mesh);
      if (side === 'L') label(TARGET_WORD[t], new THREE.Vector3(at.x - 0.28, at.y - 0.02, at.z), 'lbl lbl-brain lbl-land', true);
    }
  }

  return {
    root,
    labels,
    setLesion(bmap) {
      for (const m of marks) {
        const d = bmap.damage(m.level, m.compartment, m.side, m.region);
        tint(m.mesh, d > 0 ? palette.lesion : palette.grey, d === 2 ? 0.95 : d === 1 ? 0.6 : 0.4);
        m.mesh.scale.setScalar(d > 0 ? 1.8 : 1);
      }
    },
    setFindings(findings) {
      for (const side of SIDES) {
        for (const t of CRANIAL_TARGETS) {
          const mesh = organs.get(`${side}|${t}`);
          if (!mesh) continue;
          const s = findings ? organState(findings, t, side) : 0;
          tint(mesh, s === 2 ? palette.lesion : s === 1 ? palette.stt : palette.cord, s === 2 ? 0.95 : s === 1 ? 0.7 : 0.5);
          mesh.scale.setScalar(s === 2 ? 1.25 : 1);
        }
      }
    },
  };
}
