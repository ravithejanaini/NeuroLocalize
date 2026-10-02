// Amendment A41. Reverse inference for the facial nerve by segment, written from
// docs/P35-analysis.md before any P35 engine code. Each expectation is a property of the ranking,
// never a number. The three examinations share a whole-face palsy and differ in tears, the
// stapedius and taste, as S51 separates the segments.
import type { CranialSign, Side, SignObservation } from '../../src/kb/vocab.ts';
import type { BrainObservation, BrainReverseCase } from './reverse-brain.ts';

const cn = (side: Side, sign: CranialSign, value: SignObservation): BrainObservation => ({ kind: 'cranial', side, sign, value });
const power = (side: Side, at: 'C6' | 'L3', value: 'normal' | 'weak'): BrainObservation => ({ kind: 'strength', side, span: [at, at], value });
const palsy: BrainObservation[] = [
  { kind: 'face_weakness', side: 'L', value: 'whole' },
  cn('L', 'abduction_weakness', 'absent'),
  cn('L', 'hearing_loss', 'absent'),
  power('L', 'C6', 'normal'), power('R', 'C6', 'normal'), power('L', 'L3', 'normal'), power('R', 'L3', 'normal'),
];
const branches = (tears: boolean, stapedius: boolean, taste: boolean): BrainObservation[] => [
  cn('L', 'tear_loss', tears ? 'present' : 'absent'),
  cn('L', 'hyperacusis', stapedius ? 'present' : 'absent'),
  cn('L', 'taste_loss', taste ? 'present' : 'absent'),
];

export const FACIAL_CANAL_REVERSE_CASES: readonly BrainReverseCase[] = [
  {
    id: 'reverse-facial-above-geniculate',
    title: 'Whole left face weak; the left eye dry, sounds too loud on the left, taste lost on the front of the tongue on the left',
    observations: [...palsy, ...branches(true, true, true)],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['facial_above_geniculate'] }],
    cite: ['S51', 'S179'],
    basis: 'stated',
    note: 'Tears lost too puts the lesion above the greater petrosal nerve, between the internal acoustic meatus and the geniculate ganglion (S51).',
  },
  {
    id: 'reverse-facial-above-stapedius',
    title: 'Whole left face weak; sounds too loud on the left, taste lost on the left; the eye waters normally',
    observations: [...palsy, ...branches(false, true, true)],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['facial_above_stapedius'] }],
    cite: ['S51', 'S179'],
    basis: 'stated',
    note: 'Tears kept, the stapedius and taste lost: between the geniculate ganglion and the nerve to stapedius (S51).',
  },
  {
    id: 'reverse-facial-above-chorda',
    title: 'Whole left face weak; taste lost on the left; hearing comfortable and the eye waters normally',
    observations: [...palsy, ...branches(false, false, true)],
    expectations: [{ timepoint: 'chronic', topFamily: 'cranial_nerve_left', topPlaces: ['facial_above_chorda'] }],
    cite: ['S51', 'S179'],
    basis: 'stated',
    note: 'Only taste lost with the face: between the nerve to stapedius and the chorda tympani (S51).',
  },
];
