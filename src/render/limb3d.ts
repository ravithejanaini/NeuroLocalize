// The brachial and lumbosacral plexuses and the limbs in the scene: strands from the geometry
// layer, the landmarks they are drawn against, and a mark on every muscle and patch of skin
// that takes the colour of its finding. Nothing here decides a finding.
import * as THREE from 'three';
import type { Findings } from '../engine/forward.ts';
import { legStrands, mirror, plexusStrands, siteAnchor, targetPoint, type Strand, type Target } from '../geometry/plexus.ts';
import type { Kb, LimbPoint, RenderKb } from '../kb/types.ts';
import { MUSCLES, SIDES, SKIN_AREAS, type PlexusSite, type SensoryState, type Side } from '../kb/vocab.ts';
import type { Label, Palette } from './scene.ts';

const v3 = (p: { x: number; y: number; z: number }): THREE.Vector3 => new THREE.Vector3(p.x, p.y, p.z);
const basic = (color: string, opacity: number): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });

export type Limb = {
  readonly root: THREE.Group;
  readonly labels: Label[];
  setFindings(f: Findings | null): void;
  setLesions(sites: readonly { readonly site: PlexusSite; readonly side: Side }[]): void;
};

const STRAND_STYLE: Record<Strand['kind'], { radius: number; opacity: number }> = {
  root: { radius: 0.035, opacity: 0.55 },
  trunk: { radius: 0.06, opacity: 0.75 },
  division: { radius: 0.04, opacity: 0.6 },
  cord: { radius: 0.055, opacity: 0.75 },
  nerve: { radius: 0.035, opacity: 0.6 },
  branch: { radius: 0.014, opacity: 0.4 },
};

export function buildLimb(kb: Kb, render: RenderKb, palette: Palette, layer: HTMLElement): Limb {
  const root = new THREE.Group();
  const labels: Label[] = [];
  const layout = render.limb;

  const tube = (pts: readonly THREE.Vector3[], radius: number, colour: string, opacity: number): THREE.Mesh => {
    const curve = pts.length > 2 ? new THREE.CatmullRomCurve3([...pts], false, 'centripetal') : new THREE.LineCurve3(pts[0] ?? new THREE.Vector3(), pts[1] ?? new THREE.Vector3());
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(4, pts.length * 6), radius, 6, false), basic(colour, opacity));
  };
  const line = (pts: readonly LimbPoint[], side: Side, colour: string, opacity: number): THREE.Line =>
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts.map((p) => v3(mirror(p, side)))),
      new THREE.LineBasicMaterial({ color: colour, transparent: true, opacity }),
    );
  const label = (text: string, at: THREE.Vector3, cls = 'lbl lbl-limb'): void => {
    const el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    layer.append(el);
    labels.push({ el, at, limb: true });
  };

  for (const side of SIDES) {
    for (const s of plexusStrands(kb, render, side)) {
      const style = STRAND_STYLE[s.kind];
      const colour = s.kind === 'root' ? palette.grey : s.division === 'posterior' ? palette.nervePost : palette.nerve;
      root.add(tube(s.points.map(v3), style.radius, colour, style.opacity));
    }
    root.add(line(layout.clavicle, side, palette.rule, 0.8));
    root.add(tube(layout.clavicle.map((p) => v3(mirror(p, side))), 0.09, palette.rule, 0.25));
    root.add(line(layout.firstRib, side, palette.rule, 0.6));
    root.add(tube(layout.artery.map((p) => v3(mirror(p, side))), 0.06, palette.artery, 0.4));
    for (const scalene of [layout.scalenes.anterior, layout.scalenes.middle]) root.add(line(scalene, side, palette.rule, 0.35));
    for (const bone of layout.bones) root.add(line(bone, side, palette.rule, 0.5));
    // P7: the leg.
    for (const s of legStrands(kb, render, side)) {
      const style = STRAND_STYLE[s.kind];
      root.add(tube(s.points.map(v3), style.radius, s.kind === 'root' ? palette.grey : palette.nerve, style.opacity));
    }
    root.add(line(render.leg.inguinalLigament, side, palette.rule, 0.7));
    for (const bone of render.leg.bones) root.add(line(bone, side, palette.rule, 0.5));
  }

  // Names on the patient's left only, so the right arm stays clean.
  const L = (p: LimbPoint | undefined, dx = 0, dy = 0): THREE.Vector3 => {
    const q = mirror(p ?? [0, 0, 0], 'L');
    return new THREE.Vector3(q.x + dx, q.y + dy, q.z);
  };
  label('upper trunk', L(layout.trunks.upper[0], -0.1, 0.25));
  label('middle', L(layout.trunks.middle[0], -0.15, 0.1));
  label('lower', L(layout.trunks.lower[0], -0.15, -0.1));
  label('lateral cord', L(layout.cords.lateral[1], -0.3, 0.15));
  label('posterior', L(layout.cords.posterior[1], 0.1, 0.25));
  label('medial', L(layout.cords.medial[1], 0.25, -0.2));
  label('clavicle', L(layout.clavicle[1], 0, 0.2), 'lbl lbl-limb lbl-land');
  label('first rib', L(layout.firstRib[0], 0.1, -0.2), 'lbl lbl-limb lbl-land');
  label('radial', L(layout.nerves.radial[2]?.at, -0.2));
  label('median', L(layout.nerves.median[1]?.at, 0.15));
  label('ulnar', L(layout.nerves.ulnar[1]?.at, 0.2, -0.3));
  label('musculocutaneous', L(layout.nerves.musculocutaneous[1]?.at, -0.3));
  label('axillary', L(layout.nerves.axillary[1]?.at, -0.3, 0.2));
  label('long thoracic', L(layout.nerves.long_thoracic[2]?.at, 0.2));
  const leg = render.leg;
  label('lumbar plexus', L(leg.parts.lumbar[0], -0.2, 0.25));
  label('sacral plexus', L(leg.parts.sacral[1], 0.2, -0.1));
  label('inguinal ligament', L(leg.inguinalLigament[1], 0, 0.25), 'lbl lbl-limb lbl-land');
  label('femoral', L(leg.nerves.femoral[3]?.at, -0.3));
  label('obturator', L(leg.nerves.obturator[2]?.at, 0.3, -0.9));
  label('sciatic', L(leg.nerves.sciatic[2]?.at, 0.3));
  label('tibial', L(leg.nerves.tibial[1]?.at, 0.5, -0.9));
  label('common fibular', L(leg.nerves.common_fibular[1]?.at, -0.3));
  label('fibular neck', L(leg.nerves.common_fibular[1]?.at, -0.3, 0.55), 'lbl lbl-limb lbl-land');

  // A mark on every muscle and patch; its colour is its finding.
  const marks = new Map<string, THREE.Mesh>();
  const muscleGeo = new THREE.SphereGeometry(0.11, 12, 8);
  const skinGeo = new THREE.OctahedronGeometry(0.1);
  for (const side of SIDES) {
    for (const t of [...MUSCLES, ...SKIN_AREAS] as Target[]) {
      const isMuscle = (MUSCLES as readonly string[]).includes(t);
      const mesh = new THREE.Mesh(isMuscle ? muscleGeo : skinGeo, basic(palette.grey, 0.35));
      mesh.position.copy(v3(mirror(targetPoint(render, t), side)));
      root.add(mesh);
      marks.set(`${side}|${t}`, mesh);
    }
  }

  const lesions = new THREE.Group();
  root.add(lesions);

  const sensoryColour = (s: SensoryState): [string, number] =>
    s === 'lost' ? [palette.lesion, 0.95] : s === 'impaired' ? [palette.lesion, 0.55] : s === 'indeterminate' ? [palette.stt, 0.6] : [palette.grey, 0.3];

  return {
    root,
    labels,
    setFindings(f) {
      for (const side of SIDES) {
        for (const m of MUSCLES) {
          const mesh = marks.get(`${side}|${m}`);
          if (!mesh) continue;
          const s = f?.muscles[side][m] ?? 'normal';
          const [c, o] = s === 'weak' ? [palette.lesion, 0.95] : s === 'indeterminate' ? [palette.stt, 0.6] : [palette.grey, 0.35];
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.color.set(c);
          mat.opacity = o;
          mesh.scale.setScalar(s === 'weak' ? 1.35 : 1);
        }
        for (const a of SKIN_AREAS) {
          const mesh = marks.get(`${side}|${a}`);
          if (!mesh) continue;
          const p = f?.skin[side].pain_temperature[a] ?? 'intact';
          const v = f?.skin[side].posterior_column[a] ?? 'intact';
          const worst = [p, v].includes('lost') ? 'lost' : [p, v].includes('impaired') ? 'impaired' : [p, v].includes('indeterminate') ? 'indeterminate' : 'intact';
          const [c, o] = sensoryColour(worst);
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.color.set(c);
          mat.opacity = o;
          mesh.scale.setScalar(worst === 'intact' ? 1 : 1.3);
        }
      }
    },
    setLesions(sites) {
      for (const child of lesions.children) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      lesions.clear();
      for (const { site, side } of sites) {
        const at = v3(siteAnchor(render, site, side));
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 40), basic(palette.lesion, 0.95));
        ring.position.copy(at);
        const halo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), basic(palette.lesion, 0.32));
        halo.position.copy(at);
        lesions.add(ring, halo);
      }
    },
  };
}
