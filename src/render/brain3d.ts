// The brain above the cord in the scene: brainstem, thalamus, capsule and the two cortical
// strips, the long tracts through them, and a mark on every part that turns to the lesion
// colour when the lesion takes it. Nothing here decides a finding.
import * as THREE from 'three';
import type { BrainMap } from '../engine/brain.ts';
import { allParts, partPoint } from '../geometry/brain.ts';
import type { Kb, RenderKb } from '../kb/types.ts';
import { BODY_REGIONS, SIDES, type BodyRegion, type BrainLevel, type Side } from '../kb/vocab.ts';
import type { Label, Palette } from './scene.ts';

const v3 = (p: { x: number; y: number; z: number }): THREE.Vector3 => new THREE.Vector3(p.x, p.y, p.z);
const basic = (color: string, opacity: number): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });

export type BrainScene = {
  readonly root: THREE.Group;
  readonly labels: Label[];
  setLesion(bmap: BrainMap): void;
};

const LEVEL_WORD: Record<BrainLevel, string> = {
  medulla: 'medulla',
  pons: 'pons',
  midbrain: 'midbrain',
  thalamus: 'thalamus',
  capsule: 'internal capsule',
  cortex: 'cortex',
};

export function buildBrain(kb: Kb, render: RenderKb, palette: Palette, layer: HTMLElement): BrainScene {
  const root = new THREE.Group();
  const labels: Label[] = [];
  const layout = render.brainLayout;
  const label = (text: string, at: THREE.Vector3, cls = 'lbl lbl-brain'): void => {
    const el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    layer.append(el);
    labels.push({ el, at, brain: true });
  };
  const tube = (pts: readonly THREE.Vector3[], radius: number, colour: string, opacity: number): THREE.Mesh =>
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...pts], false, 'centripetal'), Math.max(8, pts.length * 8), radius, 6, false),
      basic(colour, opacity),
    );

  // The brainstem as one lathe whose radius follows the three levels.
  const stem: BrainLevel[] = ['medulla', 'pons', 'midbrain'];
  const profile: THREE.Vector2[] = [new THREE.Vector2(0.75, 0)];
  for (const l of stem) {
    const { y, height, radius } = layout.levels[l];
    profile.push(new THREE.Vector2(radius * 0.9, y - height / 2 + 0.05), new THREE.Vector2(radius, y), new THREE.Vector2(radius * 0.9, y + height / 2 - 0.05));
  }
  root.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 40), basic(palette.cord, 0.05)));
  for (const l of stem) {
    const { y, height } = layout.levels[l];
    label(LEVEL_WORD[l], new THREE.Vector3(-(layout.levels[l].radius + 0.5), y, 0));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(layout.levels[l].radius, 0.012, 6, 48), basic(palette.rule, 0.35));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y + height / 2;
    root.add(ring);
  }

  // Thalamus and capsule as faint forms on either side; the cortex as two shells.
  for (const side of SIDES) {
    const s = side === 'L' ? -1 : 1;
    const th = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 14), basic(palette.cord, 0.07));
    th.scale.set(1.3, 0.7, 1);
    th.position.set(s * 0.95, layout.levels.thalamus.y, 0.1);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 1.3), basic(palette.cord, 0.06));
    cap.position.set(s * 1.55, layout.levels.capsule.y, 0.1);
    cap.rotation.z = s * 0.35;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), basic(palette.cord, 0.045));
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
      root.add(tube(order.map((r) => v3(partPoint(render, 'cortex', c, side, r))), 0.06, colour, 0.35));
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
    root.add(tube(steps.map((s) => v3(partPoint(render, s.level, s.compartment, side, 'arm'))), 0.03, colour, 0.3));
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
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.level === 'cortex' ? 0.13 : 0.075, 12, 8), basic(palette.grey, 0.3));
    mesh.position.copy(v3(p.at));
    root.add(mesh);
    return { ...p, mesh };
  });
  const f = layout.face;
  for (const side of SIDES) {
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10), basic(palette.cord, 0.12));
    face.position.set((side === 'L' ? 1 : -1) * f[0], f[1], f[2]);
    root.add(face);
  }
  label('face', new THREE.Vector3(f[0], f[1] + 0.45, f[2]), 'lbl lbl-brain lbl-land');

  return {
    root,
    labels,
    setLesion(bmap) {
      for (const m of marks) {
        const d = bmap.damage(m.level, m.compartment, m.side, m.region);
        const mat = m.mesh.material as THREE.MeshBasicMaterial;
        mat.color.set(d > 0 ? palette.lesion : palette.grey);
        mat.opacity = d === 2 ? 0.95 : d === 1 ? 0.6 : 0.3;
        m.mesh.scale.setScalar(d > 0 ? 1.8 : 1);
      }
    },
  };
}
