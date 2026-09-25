// Examination mode, as HTML strings: entering findings, the ranked candidates, the next test
// and the working. No DOM and no Three.js, so it is tested under Node.
import type { Group, Observation, ReverseResult, Slot, Verdict } from '../engine/reverse.ts';
import { FAMILY_NAME, levelText as placedText } from '../engine/names.ts';
import { SITE_NAME, slotKey } from '../engine/reverse.ts';
import type { RenderKb } from '../kb/types.ts';
import { fieldChart } from './vision.ts';
import {
  ARM_MUSCLES,
  CRANIAL_SIGNS,
  DORSAL_MIDBRAIN_SIGNS,
  LANGUAGE_SIGNS,
  LEG_MUSCLES,
  REFLEXES,
  SEGMENTS,
  SIDES,
  type CranialSign,
  type DorsalMidbrainSign,
  type FieldSector,
  type LanguageSign,
  type Muscle,
  type SensoryModality,
  type Side,
  type SkinArea,
} from '../kb/vocab.ts';

export type Findings = ReadonlyMap<string, Observation>;

export { FAMILY_NAME } from '../engine/names.ts';

const SIDE_WORD: Record<Side, string> = { L: 'Left', R: 'Right' };

/** Each muscle by the movement it is tested with, then its name. */
export const MUSCLE_NAME: Record<Muscle, { readonly movement: string; readonly muscle: string }> = {
  rhomboids: { movement: 'scapular retraction', muscle: 'rhomboids' },
  serratus_anterior: { movement: 'scapula held to the chest wall', muscle: 'serratus anterior' },
  supraspinatus: { movement: 'shoulder abduction, first degrees', muscle: 'supraspinatus' },
  deltoid: { movement: 'shoulder abduction', muscle: 'deltoid' },
  biceps: { movement: 'elbow flexion, supinated', muscle: 'biceps' },
  triceps: { movement: 'elbow extension', muscle: 'triceps' },
  brachioradialis: { movement: 'elbow flexion, mid-prone', muscle: 'brachioradialis' },
  wrist_extensors: { movement: 'wrist extension', muscle: 'extensor carpi radialis' },
  thumb_extensor: { movement: 'thumb extension', muscle: 'extensor pollicis longus' },
  wrist_flexor_ulnar: { movement: 'wrist flexion to the ulnar side', muscle: 'flexor carpi ulnaris' },
  finger_flexor_superficial: { movement: 'finger flexion at the PIP joint', muscle: 'flexor digitorum superficialis' },
  finger_flexor_ulnar: { movement: 'little finger flexion at the DIP joint', muscle: 'flexor digitorum profundus, ulnar half' },
  thumb_abductor: { movement: 'thumb abduction', muscle: 'abductor pollicis brevis' },
  interossei: { movement: 'finger abduction', muscle: 'first dorsal interosseous' },
  iliopsoas: { movement: 'hip flexion', muscle: 'iliopsoas' },
  hip_adductors: { movement: 'hip adduction', muscle: 'adductors (obturator)' },
  quadriceps: { movement: 'knee extension', muscle: 'quadriceps femoris' },
  gluteus_medius: { movement: 'hip abduction', muscle: 'gluteus medius' },
  gluteus_maximus: { movement: 'hip extension', muscle: 'gluteus maximus' },
  hamstrings: { movement: 'knee flexion', muscle: 'hamstrings' },
  tibialis_anterior: { movement: 'ankle dorsiflexion', muscle: 'tibialis anterior' },
  toe_extensor: { movement: 'great toe extension', muscle: 'extensor hallucis longus' },
  fibularis: { movement: 'ankle eversion', muscle: 'fibularis longus' },
  tibialis_posterior: { movement: 'ankle inversion', muscle: 'tibialis posterior' },
  gastrocnemius: { movement: 'ankle plantar flexion', muscle: 'gastrocnemius' },
};

/** P13: signs of both eyes together, named for their abnormal state. */
export const EYES_NAME: Record<DorsalMidbrainSign, string> = {
  upgaze_palsy: 'Both eyes cannot look up',
  light_near_dissociation: 'Pupils: poor to light, constrict to near',
  convergence_retraction_nystagmus: 'Convergence–retraction nystagmus on looking up',
};

/** P16: some or all of the four — the complete tetrad is rare (S128, C51). */
export const GERSTMANN_NAME = 'Gerstmann signs (finger agnosia, acalculia, agraphia, left–right confusion)';

/** P10: each facet of language, named for its abnormal state. */
export const LANGUAGE_NAME: Record<LanguageSign, string> = {
  nonfluent_speech: 'Speech non-fluent (effortful, few words)',
  impaired_comprehension: 'Comprehension impaired',
  impaired_repetition: 'Repetition impaired',
};

export const CRANIAL_NAME: Record<CranialSign, string> = {
  oculomotor_palsy: 'third nerve palsy (ptosis, eye down and out)',
  abduction_weakness: 'eye does not abduct',
  gaze_palsy: 'gaze palsy toward this side',
  tongue_weakness: 'tongue weak (deviates to this side)',
  palate_weakness: 'palate weak (uvula deviates away)',
  adduction_weakness: 'this eye does not adduct',
  abducting_nystagmus: 'nystagmus of this eye as it abducts',
  ptosis: 'lid droops on this side',
  elevation_weakness: 'this eye does not elevate (superior rectus)',
  hearing_loss: 'hearing reduced in this ear',
  superior_oblique_weakness: 'this eye rides high, worse looking down (superior oblique)',
  jaw_deviation: 'jaw deviates to this side on opening',
};

/** Each sector of one eye's field, as it is asked about. */
export const SECTOR_NAME: Record<FieldSector, string> = {
  temporal_superior: 'upper outer quadrant (temporal)',
  temporal_inferior: 'lower outer quadrant (temporal)',
  nasal_superior: 'upper inner quadrant (nasal)',
  nasal_inferior: 'lower inner quadrant (nasal)',
  central_left: 'centre, to the patient’s left',
  central_right: 'centre, to the patient’s right',
};

export const AREA_NAME: Record<SkinArea, string> = {
  shoulder_badge: 'lateral shoulder (regimental badge)',
  lateral_forearm: 'lateral forearm',
  dorsal_web: 'back of the first web space',
  thumb: 'thumb',
  middle_finger: 'middle finger',
  little_finger: 'little finger',
  medial_forearm: 'medial forearm',
  anterior_thigh: 'anterior thigh',
  medial_thigh: 'medial thigh',
  lateral_thigh: 'lateral thigh',
  medial_leg: 'medial leg, to the medial malleolus',
  lateral_leg: 'anterolateral leg',
  dorsum_foot: 'dorsum of the foot',
  first_web: 'first web space of the foot',
  lateral_foot: 'lateral foot (sural)',
  sole: 'sole of the foot',
  perineum: 'perineum (the saddle)',
};
const escape = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** The cycle a control steps through on each press; undefined means not tested. */
export const CYCLE: Record<Slot['kind'], readonly string[]> = {
  sensory: ['normal', 'abnormal'],
  strength: ['normal', 'weak'],
  reflex: ['normal', 'reduced', 'brisk'],
  babinski: ['absent', 'present'],
  horner: ['absent', 'present'],
  romberg: ['absent', 'present'],
  bladder: ['normal', 'overactive', 'retention'],
  muscle: ['normal', 'weak'],
  skin: ['normal', 'abnormal'],
  face_sensation: ['normal', 'abnormal'],
  face_weakness: ['normal', 'lower', 'whole'],
  cranial: ['absent', 'present'],
  ataxia: ['absent', 'present'],
  hemiballismus: ['absent', 'present'],
  vertigo: ['absent', 'present'],
  truncal_ataxia: ['absent', 'present'],
  eyes: ['absent', 'present'],
  field: ['normal', 'abnormal'],
  rapd: ['absent', 'present'],
  language: ['absent', 'present'],
  gerstmann: ['absent', 'present'],
  neglect: ['absent', 'present'],
};

export function nextValue(slot: Slot, current: string | undefined): string | undefined {
  const cycle = CYCLE[slot.kind];
  if (current === undefined) return cycle[0];
  const i = cycle.indexOf(current);
  return i < 0 || i === cycle.length - 1 ? undefined : cycle[i + 1];
}

export function slotLabel(render: RenderKb, s: Slot): string {
  switch (s.kind) {
    case 'sensory': {
      const [a, b] = s.span;
      const at = a === b ? a : `${a}–${b}`;
      const mark =
        render.dermatomeLandmarks.landmarks.find((l) => l.segment === a && a === b)?.place ??
        (a === render.saddle.span[0] ? render.saddle.place : '');
      return `${SIDE_WORD[s.side]} ${s.modality === 'pain_temperature' ? 'pain' : 'vibration'} · ${mark ? `${mark} ` : ''}(${at})`;
    }
    case 'strength': {
      const row = render.myotomes.rows.find((r) => r.span[0] === s.span[0] && r.span[1] === s.span[1]);
      const at = s.span[0] === s.span[1] ? s.span[0] : `${s.span[0]}–${s.span[1]}`;
      return `${SIDE_WORD[s.side]} ${row?.movement ?? 'strength'} (${at})`;
    }
    case 'reflex':
      return `${SIDE_WORD[s.side]} ${s.reflex} reflex`;
    case 'babinski':
      return `${SIDE_WORD[s.side]} Babinski sign`;
    case 'horner':
      return `${SIDE_WORD[s.side]} Horner syndrome`;
    case 'romberg':
      return 'Romberg test';
    case 'bladder':
      return 'Bladder';
    case 'muscle':
      return `${SIDE_WORD[s.side]} ${MUSCLE_NAME[s.muscle].movement} (${MUSCLE_NAME[s.muscle].muscle})`;
    case 'skin':
      return `${SIDE_WORD[s.side]} ${AREA_NAME[s.area]}`;
    case 'face_sensation':
      return `${SIDE_WORD[s.side]} face, sensation`;
    case 'face_weakness':
      return `${SIDE_WORD[s.side]} face, strength`;
    case 'cranial':
      return `${SIDE_WORD[s.side]} ${CRANIAL_NAME[s.sign]}`;
    case 'ataxia':
      return `${SIDE_WORD[s.side]} limb ataxia`;
    case 'hemiballismus':
      return `${SIDE_WORD[s.side]} arm and leg fling involuntarily (hemiballismus)`;
    case 'vertigo':
      return 'Vertigo and nystagmus';
    case 'truncal_ataxia':
      return 'Truncal ataxia (unsteady sitting or standing)';
    case 'eyes':
      return EYES_NAME[s.sign];
    case 'field':
      return `${SIDE_WORD[s.eye]} eye · ${SECTOR_NAME[s.sector]}`;
    case 'rapd':
      return `${SIDE_WORD[s.side]} pupil, afferent defect`;
    case 'language':
      return LANGUAGE_NAME[s.sign];
    case 'gerstmann':
      return GERSTMANN_NAME;
    case 'neglect':
      return `Neglect of the ${SIDE_WORD[s.side].toLowerCase()} side of space`;
  }
}

const VALUE_WORD: Record<string, string> = {
  normal: 'normal',
  abnormal: 'abnormal',
  weak: 'weak',
  reduced: 'reduced or absent',
  lower: 'lower face weak',
  whole: 'whole face weak',
  brisk: 'brisk',
  present: 'present',
  absent: 'absent',
  overactive: 'overactive',
  retention: 'retention',
  lost: 'lost',
};
export const valueWord = (v: string): string => VALUE_WORD[v] ?? v;

const cell = (key: string, value: string | undefined, label: string): string =>
  `<button type="button" class="ex ex-${value ?? 'untested'}" data-slot="${escape(key)}" aria-label="${escape(label)}: ${value ? valueWord(value) : 'not tested'}">${value ? valueWord(value) : '·'}</button>`;

// ── entry ────────────────────────────────────────────────────────────────

/** The body map as an input: each landmark dot is a button that cycles its finding. */
export function examBodySvg(render: RenderKb, findings: Findings, modality: SensoryModality, body: string): string {
  const dots: string[] = [];
  for (const side of SIDES) {
    const x = (v: number): number => (side === 'L' ? v : 200 - v);
    const marks = [
      ...render.dermatomeLandmarks.landmarks.map((l) => ({ span: [l.segment, l.segment] as const, points: l.at, diamond: false })),
      { span: render.saddle.span, points: [render.saddle.at], diamond: true },
    ];
    for (const [area, p] of Object.entries(render.skinPatches.at) as [SkinArea, { x: number; y: number }][]) {
      const slot: Slot = { kind: 'skin', side, area };
      const key = slotKey(slot);
      const v = findings.get(key)?.value;
      const label = `${slotLabel(render, slot)}, any sensation: ${v ? valueWord(v) : 'not tested'}`;
      dots.push(
        `<g class="exdot patch ex-${v ?? 'untested'}" role="button" tabindex="0" data-slot="${escape(key)}" aria-label="${escape(label)}"><title>${escape(label)}</title><rect x="${x(p.x) - 5}" y="${p.y - 5}" width="10" height="10" rx="2"/></g>`,
      );
    }
    for (const m of marks) {
      const slot: Slot = { kind: 'sensory', side, modality, span: m.span };
      const key = slotKey(slot);
      const v = findings.get(key)?.value;
      const label = `${slotLabel(render, slot)}: ${v ? valueWord(v) : 'not tested'}`;
      for (const p of m.points) {
        const shape = m.diamond
          ? `<rect x="${x(p.x) - 5}" y="${p.y - 5}" width="10" height="10" transform="rotate(45 ${x(p.x)} ${p.y})"/>`
          : `<circle cx="${x(p.x)}" cy="${p.y}" r="6"/>`;
        dots.push(
          `<g class="exdot ex-${v ?? 'untested'}" role="button" tabindex="0" data-slot="${escape(key)}" aria-label="${escape(label)}"><title>${escape(label)}</title>${shape}</g>`,
        );
      }
    }
  }
  return body.replace('</svg>', `${dots.join('')}</svg>`);
}

export function examTables(render: RenderKb, findings: Findings): string {
  const get = (s: Slot): string | undefined => findings.get(slotKey(s))?.value;
  const strength = render.myotomes.rows
    .map((r) => {
      const name = r.span[0] === r.span[1] ? r.span[0] : `${r.span[0]}–${r.span[1]}`;
      const cells = SIDES.map((side) => {
        const s: Slot = { kind: 'strength', side, span: r.span };
        return `<td>${cell(slotKey(s), get(s), slotLabel(render, s))}</td>`;
      }).join('');
      return `<tr><th>${name}</th><td class="mv">${r.movement}</td>${cells}</tr>`;
    })
    .join('');
  const reflexes = REFLEXES.map((reflex) => {
    const cells = SIDES.map((side) => {
      const s: Slot = { kind: 'reflex', side, reflex };
      return `<td>${cell(slotKey(s), get(s), slotLabel(render, s))}</td>`;
    }).join('');
    return `<tr><th colspan="2">${reflex}</th>${cells}</tr>`;
  }).join('');
  const sided = (kind: 'babinski' | 'horner', name: string): string =>
    `<tr><th colspan="2">${name}</th>${SIDES.map((side) => {
      const s: Slot = { kind, side };
      return `<td>${cell(slotKey(s), get(s), slotLabel(render, s))}</td>`;
    }).join('')}</tr>`;
  const single = (s: Slot, name: string): string =>
    `<tr><th colspan="2">${name}</th><td colspan="2">${cell(slotKey(s), get(s), slotLabel(render, s))}</td></tr>`;
  const muscleRows = (list: readonly Muscle[]): string =>
    list
      .map((muscle) => {
        const cells = SIDES.map((side) => {
          const s: Slot = { kind: 'muscle', side, muscle };
          return `<td>${cell(slotKey(s), get(s), slotLabel(render, s))}</td>`;
        }).join('');
        const n = MUSCLE_NAME[muscle];
        return `<tr><th class="mus" colspan="2">${n.movement}<span class="mus-name">${n.muscle}</span></th>${cells}</tr>`;
      })
      .join('');
  const arm = muscleRows(ARM_MUSCLES);
  const leg = muscleRows(LEG_MUSCLES);
  const entered = new Map([...findings].map(([k, o]) => [k, o.value] as const));
  const eyes = SIDES.map((eye) => `<div class="fchart">${fieldChart(eye, () => 'normal', entered)}</div>`).join('');
  const pupils = `<tr><th colspan="2">Afferent pupillary defect</th>${SIDES.map((side) => {
    const s: Slot = { kind: 'rapd', side };
    return `<td>${cell(slotKey(s), get(s), slotLabel(render, s))}</td>`;
  }).join('')}</tr>`;
  const headRow = (label: string, slotOf: (side: 'L' | 'R') => Slot): string =>
    `<tr><th colspan="2">${label}</th>${SIDES.map((side) => {
      const s = slotOf(side);
      return `<td>${cell(slotKey(s), get(s), slotLabel(render, s))}</td>`;
    }).join('')}</tr>`;
  const head = [
    headRow('Face, sensation', (side) => ({ kind: 'face_sensation', side })),
    headRow('Face, strength', (side) => ({ kind: 'face_weakness', side })),
    ...CRANIAL_SIGNS.map((sign) => headRow(CRANIAL_NAME[sign], (side) => ({ kind: 'cranial', side, sign }))),
    headRow('Limb ataxia', (side) => ({ kind: 'ataxia', side })),
    headRow('Hemiballismus', (side) => ({ kind: 'hemiballismus', side })),
  ].join('');
  // P10: language belongs to the patient, not a side; neglect is recorded by the side of space.
  const language = LANGUAGE_SIGNS.map((sign) => single({ kind: 'language', sign }, LANGUAGE_NAME[sign])).join('');
  const neglect = headRow('Neglect of that side of space', (side) => ({ kind: 'neglect', side }));
  const gerstmann = single({ kind: 'gerstmann' }, 'Gerstmann signs');
  return `<table class="extable"><thead><tr><th colspan="2">Language and attention</th><th colspan="2"></th></tr></thead><tbody>${language}${gerstmann}${neglect}</tbody>
    <thead><tr><th colspan="2">Head and eyes</th><th>Left</th><th>Right</th></tr></thead><tbody>${head}
    ${single({ kind: 'vertigo' }, 'Vertigo, nystagmus')}${single({ kind: 'truncal_ataxia' }, 'Truncal ataxia')}${DORSAL_MIDBRAIN_SIGNS.map((sign) => single({ kind: 'eyes', sign }, EYES_NAME[sign])).join('')}</tbody>
    <thead><tr><th colspan="2">Strength</th><th>Left</th><th>Right</th></tr></thead><tbody>${strength}</tbody>
    <thead><tr><th colspan="2">Arm, muscle by muscle</th><th>Left</th><th>Right</th></tr></thead><tbody>${arm}</tbody>
    <thead><tr><th colspan="2">Leg, muscle by muscle</th><th>Left</th><th>Right</th></tr></thead><tbody>${leg}</tbody>
    <thead><tr><th colspan="2">Visual fields</th><th>Left eye</th><th>Right eye</th></tr></thead>
    <tbody><tr><td colspan="4"><div class="fcharts exam-fields">${eyes}</div></td></tr>${pupils}</tbody>
    <thead><tr><th colspan="2">Reflexes and signs</th><th>Left</th><th>Right</th></tr></thead><tbody>${reflexes}
    ${sided('babinski', 'Babinski')}${sided('horner', 'Horner')}
    ${single({ kind: 'romberg' }, 'Romberg')}${single({ kind: 'bladder' }, 'Bladder')}</tbody></table>`;
}

// ── results ──────────────────────────────────────────────────────────────

export function levelText(g: Pick<Group, 'family' | 'rostral' | 'caudal' | 'members' | 'sites'>): string {
  return placedText({ ...g, size: g.members.length });
}

export function candidatesHtml(result: ReverseResult, selected: number, tested: number): string {
  if (tested === 0) {
    return '<p class="quiet">Record findings on the body map and in the tables. Anything left untested counts for nothing.</p>';
  }
  const banner = result.unexplained
    ? '<p class="banner">No single lesion in this model explains every finding. Consider two lesions, a peripheral cause, or a finding worth re-examining.</p>'
    : '';
  const rows = result.groups
    .slice(0, 6)
    .map((g, i) => {
      const pct = g.posterior * 100;
      const share = pct >= 99.95 ? '>99.9' : pct < 0.05 ? '<0.1' : pct.toFixed(1);
      return `<li><button type="button" class="cand" data-cand="${i}" aria-pressed="${i === selected}">
        <span class="cand-name">${FAMILY_NAME[g.family]}</span>
        <span class="cand-level">${levelText(g)}</span>
        <span class="cand-bar" aria-hidden="true"><i style="width:${Math.max(1, Math.min(100, pct)).toFixed(1)}%"></i></span>
        <span class="cand-stats"><b>${share}%</b> · fits ${g.fits}${g.mismatches ? ` · <em>conflicts ${g.mismatches}</em>` : ''}${g.open ? ` · open ${g.open}` : ''}</span>
      </button></li>`;
    })
    .join('');
  return `${banner}<ol class="cands">${rows}</ol>
    <p class="grp-note">Shares are relative to the other candidates in this model, not probabilities of disease. Candidates the examination cannot tell apart are shown as one, with a level range.</p>`;
}

export function suggestionHtml(render: RenderKb, result: ReverseResult, tested: number): string {
  if (tested === 0) return '';
  const s = result.suggestion;
  if (!s) return '<p class="quiet">No remaining test on the map would change the ranking much — the findings already settle it.</p>';
  const outcomes = s.outcomes
    .map((o) => {
      const lead = o.leader
        ? o.leader.site
          ? `${FAMILY_NAME[o.leader.family]}: ${SITE_NAME[o.leader.site]}`
          : `${FAMILY_NAME[o.leader.family]}, upper end ${o.leader.rostral}`
        : 'no clear leader';
      return `<li><b>${valueWord(o.value)}</b> <span class="quiet">(${(o.probability * 100).toFixed(0)}%)</span> → ${escape(lead)}</li>`;
    })
    .join('');
  const why = s.confirmsLeader
    ? 'Every result leaves the same candidate first: this would confirm, not change, the leading place.'
    : s.separatesTopTwo
      ? 'The two leading candidates predict different results here.'
      : 'The most informative test left.';
  return `<p class="next"><button type="button" class="next-go" data-goto="${escape(slotKey(s.slot))}">${escape(slotLabel(render, s.slot))}</button></p>
    <p class="grp-note">${why} Expected to teach ${s.informationBits.toFixed(2)} bits.</p>
    <ul class="outcomes">${outcomes}</ul>`;
}

export function workingHtml(render: RenderKb, verdicts: readonly Verdict[], group: Group | undefined): string {
  if (!group || verdicts.length === 0) return '';
  const order = { conflicts: 0, fits: 1, open: 2 } as const;
  const rows = [...verdicts]
    .sort((a, b) => order[a.verdict] - order[b.verdict])
    .map(
      (v) => `<li class="w w-${v.verdict}"><span class="w-tag">${v.verdict}</span>
        <span class="w-what">${escape(slotLabel(render, v.observation))}: ${valueWord(v.observation.value)}${
          v.verdict === 'conflicts' ? ` <span class="quiet">(predicted ${valueWord(v.predicted)})</span>` : ''
        }</span>
        <span class="w-why">${escape(v.because)}</span></li>`,
    )
    .join('');
  const rep = group.members[0];
  const at = rep?.site
    ? `at the ${SITE_NAME[rep.site]}`
    : rep
    ? rep.rostral === rep.caudal
      ? `at ${SEGMENTS[rep.rostral] ?? ''}`
      : `${SEGMENTS[rep.rostral] ?? ''}–${SEGMENTS[rep.caudal] ?? ''}`
    : '';
  return `<p class="grp-note">Worked through for one member of the group: ${FAMILY_NAME[group.family].toLowerCase()}, ${at}.</p><ul class="working">${rows}</ul>`;
}
