// The instrument panel: findings written for a clinician, each group carrying the
// knowledge-base rows that produced it and the sources behind those rows.
import type { Findings } from '../engine/forward.ts';
import { SOURCES } from '../kb/sources.ts';
import type { Kb, Meta, RenderKb } from '../kb/types.ts';
import { RENDER } from '../kb/render.ts';
import { REFLEXES, SEGMENTS, SIDES, type Segment, type SensoryModality, type SensoryState, type Side } from '../kb/vocab.ts';
import { ARM, deformityChips, LEG, limbAffected, muscleTable, skinTable } from './arm.ts';
import { visionAffected, visionPanel } from './vision.ts';
import { headHtml, languageHtml } from './head.ts';
import { bodyMapSvg, myotomeTable, sensoryLevelText } from './svg.ts';

const SIDE_NAME: Record<Side, string> = { L: 'Left', R: 'Right' };

function escape(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
}

function rowsById(root: object): Map<string, Meta> {
  const out = new Map<string, Meta>();
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const rec = node as Record<string, unknown>;
    const meta = rec.meta as Meta | undefined;
    if (meta && typeof meta.id === 'string') out.set(meta.id, meta);
    for (const [k, v] of Object.entries(rec)) if (k !== 'meta') visit(v);
  };
  visit(root);
  return out;
}

/** Runs of consecutive segments sharing a state, skipping the quiet ones. */
export function runs<S extends string>(column: Readonly<Record<Segment, S>>, quiet: readonly S[]): { state: S; from: Segment; to: Segment }[] {
  const out: { state: S; from: Segment; to: Segment }[] = [];
  for (const seg of SEGMENTS) {
    const state = column[seg];
    if (quiet.includes(state)) continue;
    const prev = out[out.length - 1];
    const prevIdx = prev ? SEGMENTS.indexOf(prev.to) : -2;
    if (prev && prev.state === state && prevIdx === SEGMENTS.indexOf(seg) - 1) prev.to = seg;
    else out.push({ state, from: seg, to: seg });
  }
  return out;
}

const span = (r: { from: Segment; to: Segment }): string => (r.from === r.to ? r.from : `${r.from}–${r.to}`);

const SENSORY_WORD: Record<SensoryState, string> = {
  intact: 'intact',
  impaired: 'reduced',
  lost: 'lost',
  indeterminate: 'uncertain',
};

type Group = { title: string; drivers: readonly string[]; body: string; note?: string };

export class Panel {
  private readonly meta: Map<string, Meta>;
  private readonly findingsEl: HTMLElement;

  constructor(kb: Kb, findingsEl: HTMLElement) {
    this.meta = new Map([...rowsById(kb), ...rowsById(RENDER)]);
    this.findingsEl = findingsEl;
  }

  private cite(drivers: readonly string[]): string {
    const rows = drivers.map((d) => this.meta.get(d)).filter((m): m is Meta => m !== undefined);
    const ids = [...new Set(rows.flatMap((m) => m.sources))];
    const chips = ids
      .map((id) => {
        const s = SOURCES.find((x) => x.id === id);
        return s
          ? `<a class="chip" href="${escape(s.url)}" target="_blank" rel="noopener" title="${escape(s.title)}">${id}</a>`
          : '';
      })
      .join('');
    const flags: string[] = [];
    if (rows.some((m) => m.tier === 'T3')) flags.push('<span class="flag flag-t3" title="Sources disagree on part of this">contested</span>');
    if (rows.some((m) => m.pendingSource)) flags.push('<span class="flag flag-pending" title="Part of this rests on a modelling convention">convention</span>');
    return `<span class="cites">${chips}${flags.join('')}</span>`;
  }

  private sensoryLine(f: Findings, x: Side, m: 'pain_temperature' | 'posterior_column'): string {
    const rs = runs(f.sensory[x][m], ['intact']);
    if (rs.length === 0) return '<span class="quiet">intact</span>';
    return rs.map((r) => `<span class="st st-${r.state}">${SENSORY_WORD[r.state]}</span> ${span(r)}`).join(' · ');
  }

  private motorLine(f: Findings, x: Side): string {
    const column = Object.fromEntries(
      SEGMENTS.map((seg) => [seg, `${f.motor[x][seg].lesion}|${f.motor[x][seg].tone}`]),
    ) as Record<Segment, string>;
    const rs = runs(column, ['none|normal']);
    if (rs.length === 0) return '<span class="quiet">no weakness</span>';
    const word: Record<string, string> = {
      umn: 'upper-motor-neuron weakness',
      lmn: 'lower-motor-neuron weakness',
      umn_lmn: 'mixed upper and lower',
    };
    const tone: Record<string, string> = {
      increased: 'spastic',
      reduced: 'tone reduced',
      indeterminate: 'tone not yet settled',
      normal: '',
    };
    return rs
      .map((r) => {
        const [lesion = '', t = ''] = r.state.split('|');
        const extra = tone[t] ? ` <span class="quiet">${tone[t]}</span>` : '';
        return `<span class="st st-${lesion}">${word[lesion] ?? lesion}</span> ${span(r)}${extra}`;
      })
      .join('<br>');
  }

  update(f: Findings, bodyModality: SensoryModality, render: RenderKb = RENDER): void {
    const reflexWord: Record<string, string> = {
      normal: 'normal',
      reduced: 'reduced',
      absent: 'absent',
      brisk: 'brisk',
      indeterminate: 'unsettled',
    };
    const sided = (fn: (x: Side) => string): string =>
      SIDES.map((x) => `<div class="kv"><span class="k">${SIDE_NAME[x]}</span><span class="v">${fn(x)}</span></div>`).join('');

    const reflexRows = REFLEXES.map((r) => {
      const cells = SIDES.map((x) => {
        const s = f.reflexes[x][r];
        return `<td class="st st-${s}">${reflexWord[s] ?? s}</td>`;
      }).join('');
      return `<tr><th>${r}</th>${cells}</tr>`;
    }).join('');

    const sign = (s: string): string => `<span class="st st-sign-${s}">${s === 'indeterminate' ? 'unsettled' : s}</span>`;
    const bladder: Record<string, string> = {
      normal: 'normal',
      suprasacral: 'overactive — lesion above the sacral centre',
      sacral: 'underactive, with retention',
      impaired_in_spinal_shock: 'impaired during spinal shock',
    };
    const shock: Record<string, string> = {
      expected: 'expected',
      possible: 'possible — it can last four to five weeks',
      not_expected: 'not expected',
      not_applicable: 'not expected after the first month',
    };
    const dys: Record<string, string> = {
      susceptible: 'at risk',
      possible: 'possible',
      rare: 'rare at this level',
      not_yet: 'not in the first month',
      none: 'not at risk',
    };

    const patterns: string[] = [];
    if (f.qualifiers.upper_limb_predominant_weakness) patterns.push('Arms weaker than legs, most of all the hands.');
    if (f.qualifiers.sacral_sparing) patterns.push('Sacral sensation spared — the mark of a lesion inside the cord.');

    const modalityName = bodyModality === 'pain_temperature' ? 'pain and temperature' : 'vibration and position';
    const groups: Group[] = [
      {
        title: 'Body map',
        drivers: ['render.dermatome-landmarks', 'render.saddle', 'render.skin-patches'],
        body:
          `<div class="bodymap"><div class="bodymap-svg">${bodyMapSvg(render, f, bodyModality)}</div>` +
          `<div class="bodymap-side"><div class="seg bm-toggle" role="radiogroup" aria-label="Body map sensation">` +
          `<label><input type="radio" name="bodymap" value="pain_temperature"${bodyModality === 'pain_temperature' ? ' checked' : ''}>Pain</label>` +
          `<label><input type="radio" name="bodymap" value="posterior_column"${bodyModality === 'posterior_column' ? ' checked' : ''}>Vibration</label></div>` +
          sided((x) => sensoryLevelText(render, f, x, bodyModality)) +
          `<p class="grp-note">Dots mark sourced landmarks for ${modalityName}: ■ lost, ◧ reduced, dashed uncertain, hollow intact. The diamond is the saddle, whose segments are a convention. Small squares are nerve territories; on the arm, the landmarks are read through their nerves too.</p></div></div>`,
      },
      {
        title: 'Pain and temperature',
        drivers: ['pathway.spinothalamic', 'compartment.dorsal-root', 'observation.sacral-sparing'],
        body: sided((x) => this.sensoryLine(f, x, 'pain_temperature')),
        note: '“Uncertain” marks the one-to-three-segment band where the crossing point decides.',
      },
      {
        title: 'Vibration, position, fine touch',
        drivers: ['pathway.posterior-column', 'compartment.dorsal-root'],
        body: sided((x) => this.sensoryLine(f, x, 'posterior_column')),
      },
      {
        title: 'Motor',
        drivers: ['pathway.corticospinal', 'compartment.lower-motor-neuron', 'observation.chronic-umn', 'observation.lmn', 'render.myotomes'],
        body: sided((x) => this.motorLine(f, x)) + myotomeTable(render, f),
      },
      {
        title: 'Head and brainstem',
        drivers: [
          'brain.face-nucleus',
          'brain.face-ascending',
          'brain.corticobulbar-face',
          'brain.upper-face-bilateral',
          'brain.facial-nucleus',
          'brain.oculomotor',
          'brain.abduction',
          'brain.hypoglossal',
          'brain.corticobulbar-tongue',
          'brain.ambiguus',
          'brain.corticobulbar-palate',
          'brain.ataxia',
          'brain.vertigo',
          // P9: eye movements; P11: the cerebellum; P12: the ear.
          'brain.gaze',
          'brain.adduction',
          'brain.adduction-gaze',
          'brain.abducting-nystagmus',
          'brain.ptosis-nuclear',
          'brain.elevation',
          'brain.truncal-ataxia',
          'brain.truncal-after-hemisphere',
          'brain.hearing',
          // P13: the dorsal midbrain.
          'brain.upgaze',
          'brain.light-near',
          'brain.convergence-retraction',
          // P14.
          'brain.trochlear',
          // P15.
          'brain.ballismus',
          'brain.jaw',
          // P16: the frontal eye field, whose gaze palsy fades.
          'brain.gaze-cortex',
        ],
        body: headHtml(f),
        note: 'A gaze palsy from the pons is on the side of the lesion and lasts; one from the frontal eye field is toward the side away from the lesion — the eyes deviate toward it — and fades within days (S130, S131). Change the timepoint to see it go.',
      },
      {
        title: 'Language and attention',
        drivers: ['brain.dominance', 'brain.fluency', 'brain.comprehension', 'brain.repetition', 'brain.gerstmann', 'brain.neglect'],
        body: languageHtml(f),
        note: 'Language is read from the left hemisphere, dominant in most people; how often it is not rises with left-handedness (S108). Neglect is recorded by the side of space, opposite the lesion. Gerstmann signs come from the dominant inferior parietal lobule and mean some or all of the four; the complete tetrad is rare (S128). Not modelled: the transcortical and anomic aphasias, reading, apraxia, anosognosia, and the four Gerstmann signs apart.',
      },
      {
        title: 'Arm',
        drivers: [
          'plexus.trunks',
          'plexus.cords',
          'nerve.radial',
          'nerve.median',
          'nerve.ulnar',
          'deformity.winged-scapula',
          'deformity.waiters-tip',
          'deformity.wrist-drop',
          'deformity.claw-hand',
          'deformity.ape-hand',
        ],
        body: limbAffected(f, ARM)
          ? `${deformityChips(f, ARM)}<details class="arm-more" open><summary>Muscle by muscle</summary>${muscleTable(f, ARM)}</details>` +
            `<details class="arm-more"><summary>Nerve territories</summary>${skinTable(f, ARM)}</details>`
          : '<p class="quiet">Every arm muscle strong and every territory intact.</p>',
        note: 'Uncertain marks a root the sources disagree about; a deformity is only called after lower-motor-neuron weakness.',
      },
      {
        title: 'Vision',
        drivers: [
          'vision.optic-nerve',
          'vision.chiasm',
          'vision.optic-tract',
          'vision.meyer-loop',
          'vision.parietal-radiation',
          'vision.calcarine-lower',
          'vision.calcarine-upper',
          'vision.occipital-pole',
        ],
        body: visionAffected(f)
          ? visionPanel(f)
          : '<p class="quiet">Both visual fields full, both pupils equal.</p>',
        note: 'Each eye’s field is drawn as the patient sees it: the temporal half away from the nose, the centre split at fixation. Not modelled: acuity, colour, congruity (C26), and the lateral geniculate nucleus as a place of its own.',
      },
      {
        title: 'Leg',
        drivers: [
          'plexus.leg-parts',
          'nerve.femoral',
          'nerve.sciatic',
          'nerve.common-fibular',
          'nerve.tibial',
          'deformity.foot-drop',
          'deformity.trendelenburg',
        ],
        body: limbAffected(f, LEG)
          ? `${deformityChips(f, LEG)}<details class="arm-more" open><summary>Muscle by muscle</summary>${muscleTable(f, LEG)}</details>` +
            `<details class="arm-more"><summary>Nerve territories</summary>${skinTable(f, LEG)}</details>`
          : '<p class="quiet">Every leg muscle strong and every territory intact.</p>',
        note: 'Uncertain marks a root no source settles, or a muscle with a second nerve still intact. Not modelled: the pudendal and posterior femoral cutaneous nerves, the tarsal tunnel, and deep and superficial fibular lesions apart.',
      },
      {
        title: 'Reflexes',
        drivers: ['compartment.reflex-arc', 'observation.spinal-shock', 'observation.chronic-umn', ...REFLEXES.map((r) => `reflex.${r}`)],
        body: `<table class="reflexes"><thead><tr><th></th><th>Left</th><th>Right</th></tr></thead><tbody>${reflexRows}</tbody></table>`,
      },
      {
        title: 'Signs',
        drivers: ['observation.babinski-level', 'autonomic.ciliospinal', 'observation.romberg'],
        body:
          `<div class="kv"><span class="k">Babinski</span><span class="v">${sign(f.babinski.L)} left · ${sign(f.babinski.R)} right</span></div>` +
          `<div class="kv"><span class="k">Horner</span><span class="v">${sign(f.horner.L)} left · ${sign(f.horner.R)} right</span></div>` +
          `<div class="kv"><span class="k">Romberg</span><span class="v">${sign(f.romberg)}</span></div>`,
      },
      {
        title: 'Autonomic',
        drivers: ['autonomic.micturition-centre', 'autonomic.bladder-control', 'observation.bladder', 'observation.neurogenic-shock', 'observation.dysreflexia'],
        body:
          `<div class="kv"><span class="k">Bladder</span><span class="v">${bladder[f.bladder] ?? f.bladder}</span></div>` +
          `<div class="kv"><span class="k">Neurogenic shock</span><span class="v">${shock[f.neurogenicShock] ?? f.neurogenicShock}</span></div>` +
          `<div class="kv"><span class="k">Dysreflexia</span><span class="v">${dys[f.dysreflexia] ?? f.dysreflexia}</span></div>`,
      },
    ];
    if (patterns.length > 0) {
      groups.unshift({
        title: 'Pattern',
        drivers: ['observation.arm-predominance', 'observation.sacral-sparing'],
        body: patterns.map((p) => `<p class="pattern">${p}</p>`).join(''),
      });
    }

    this.findingsEl.innerHTML = groups
      .map(
        (g) => `<section class="grp">
          <header class="grp-h"><h3>${g.title}</h3>${this.cite(g.drivers)}</header>
          ${g.body}
          ${g.note ? `<p class="grp-note">${g.note}</p>` : ''}
        </section>`,
      )
      .join('');
  }
}
