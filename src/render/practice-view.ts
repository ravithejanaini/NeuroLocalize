// Practice mode as HTML strings: a generated case, the answer and its working, and where
// the student is weakest. No DOM, so it is tested under Node.
import type { Hypothesis } from '../engine/hypotheses.ts';
import { explain, type Observation } from '../engine/reverse.ts';
import type { RenderKb } from '../kb/types.ts';
import { choiceLabel, isCorrect, sameChoice, type PracticeCase } from '../practice/generate.ts';
import { PATHWAY_NAME, type Pathway } from '../practice/pathways.ts';
import { dueCount, weakest, type Progress } from '../practice/schedule.ts';
import { slotLabel, valueWord } from './examine.ts';

const escape = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

type Heading = 'Head and eyes' | 'Sensation' | 'Strength' | 'Reflexes and signs';
const heading = (o: Observation): Heading => {
  switch (o.kind) {
    case 'face_sensation':
    case 'face_weakness':
    case 'cranial':
    case 'ataxia':
    case 'vertigo':
      return 'Head and eyes';
    case 'sensory':
    case 'skin':
      return 'Sensation';
    case 'strength':
    case 'muscle':
      return 'Strength';
    default:
      return 'Reflexes and signs';
  }
};
const ORDER: readonly Heading[] = ['Head and eyes', 'Sensation', 'Strength', 'Reflexes and signs'];
const QUIET = new Set(['normal', 'absent']);

/** The examination as a clinician would read it out, grouped and in words. */
export function findingsHtml(render: RenderKb, c: PracticeCase): string {
  return ORDER.map((h) => {
    const rows = c.observations.filter((o) => heading(o) === h);
    if (rows.length === 0) return '';
    const items = rows
      .map(
        (o) =>
          `<li class="pf${QUIET.has(o.value) ? ' pf-quiet' : ''}"><span class="pf-what">${escape(slotLabel(render, o))}</span><span class="pf-value">${escape(valueWord(o.value))}</span></li>`,
      )
      .join('');
    return `<section class="pf-group"><h4>${h}</h4><ul>${items}</ul></section>`;
  }).join('');
}

/** Revealed once an option is chosen or the presenter reveals it without choosing. */
export type Stage = { readonly chosen: number | null; readonly revealed: boolean; readonly present: boolean };

export function caseHtml(render: RenderKb, c: PracticeCase, stage: Stage, answer: Hypothesis | undefined, chosenRep: Hypothesis | undefined): string {
  const decided = stage.revealed;
  const options = c.options
    .map((o, i) => {
      const state = !decided ? '' : sameChoice(o, c.answer) ? ' is-right' : i === stage.chosen ? ' is-wrong' : ' is-other';
      return `<li><button type="button" class="po${state}" data-choice="${i}"${decided ? ' disabled' : ''}><span class="po-key">${i + 1}</span><span class="po-label">${escape(choiceLabel(o))}</span></button></li>`;
    })
    .join('');
  const verdict = !decided
    ? ''
    : stage.chosen === null
      ? `<p class="pv">It is <b>${escape(choiceLabel(c.answer))}</b>.</p>`
      : isCorrect(c, stage.chosen)
        ? '<p class="pv pv-right">Right.</p>'
        : `<p class="pv pv-wrong">Not this one. It is <b>${escape(choiceLabel(c.answer))}</b>.</p>`;
  const hint = stage.present
    ? `<p class="grp-note">Keys 1–${c.options.length} choose · R reveals · N or → next · Esc leaves. Answers given here are not added to your progress.</p>`
    : `<p class="grp-note">Keys 1–${c.options.length} choose. Every option but one is contradicted by something shown.</p>`;
  return `<p class="pq">One lesion explains this examination. Where is it?</p>
    <div class="pfs">${findingsHtml(render, c)}</div>
    <ol class="pos">${options}</ol>
    ${verdict}
    ${decided ? workingHtml(render, c, stage, answer, chosenRep) : `${hint}${stage.present ? '<div class="row"><button type="button" class="btn" id="practice-reveal">Reveal</button></div>' : ''}`}`;
}

function workingHtml(render: RenderKb, c: PracticeCase, stage: Stage, answer: Hypothesis | undefined, chosenRep: Hypothesis | undefined): string {
  const out: string[] = [];
  if (answer) {
    const decisive = explain(answer, c.observations, c.timepoint).filter((v) => !QUIET.has(v.observation.value));
    out.push(
      `<h4>Why it is here</h4><ul class="working">${decisive
        .map((v) => `<li class="w w-fits"><span class="w-tag">fits</span><span class="w-what">${escape(slotLabel(render, v.observation))}: ${escape(valueWord(v.observation.value))}</span><span class="w-why">${escape(v.because)}</span></li>`)
        .join('')}</ul>`,
    );
  }
  if (chosenRep && stage.chosen !== null && !isCorrect(c, stage.chosen)) {
    const against = explain(chosenRep, c.observations, c.timepoint).filter((v) => v.verdict === 'conflicts');
    out.push(
      `<h4>Why not your answer</h4><ul class="working">${against
        .map((v) => `<li class="w w-conflicts"><span class="w-tag">refutes</span><span class="w-what">${escape(slotLabel(render, v.observation))}: ${escape(valueWord(v.observation.value))} <span class="quiet">(it predicts ${escape(valueWord(v.predicted))})</span></span><span class="w-why">${escape(v.because)}</span></li>`)
        .join('')}</ul>`,
    );
  }
  out.push(`<p class="pw">Pathways in this case: ${c.pathways.map((p) => `<span class="pchip${p === c.target ? ' is-target' : ''}">${PATHWAY_NAME[p].name}</span>`).join(' ')}</p>`);
  out.push(`<div class="row"><button type="button" class="btn btn-strong" id="practice-next">Next case</button><button type="button" class="btn" id="practice-show">Show it on the model</button></div>`);
  return `<div class="pwork">${out.join('')}</div>`;
}

const pct = (x: number): string => `${Math.round(x * 100)}%`;

export function progressHtml(p: Progress, now: number): string {
  const answered = p.history.length;
  const right = p.history.filter((a) => a.correct).length;
  const due = dueCount(p, now);
  const rows = weakest(p)
    .map((w) => {
      const n = PATHWAY_NAME[w.pathway];
      const bar = w.seen === 0 ? 0 : w.accuracy;
      const when = w.due === null ? 'not yet tried' : w.due <= now ? 'due now' : `due in ${Math.max(1, Math.round((w.due - now) / 86_400_000))} d`;
      return `<li class="pp${w.seen === 0 ? ' pp-new' : ''}" title="${escape(n.what)}">
        <span class="pp-name">${n.name}</span>
        <span class="pp-bar" aria-hidden="true"><i style="width:${(bar * 100).toFixed(0)}%"></i></span>
        <span class="pp-stat">${w.seen === 0 ? '—' : `${pct(w.accuracy)} of ${w.seen}`} · ${when}</span></li>`;
    })
    .join('');
  return `<p class="pstat"><b>${answered}</b> answered${answered ? ` · <b>${pct(right / answered)}</b> right` : ''} · <b>${due}</b> ${due === 1 ? 'pathway' : 'pathways'} due</p>
    <ol class="pps">${rows}</ol>
    <p class="grp-note">Weakest first. A miss brings a pathway back at once; each right answer pushes it further off — 1, 3, 7, 14, then 30 days. The next case is built for the weakest pathway that is due.</p>`;
}

/** The pathway a case was built for, in words, for the status line. */
export const targetText = (t: Pathway): string => PATHWAY_NAME[t].name.toLowerCase();
