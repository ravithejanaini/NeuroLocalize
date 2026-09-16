import { BOUNDARY_CASES } from './boundaries.ts';
import { CASES } from './cases.ts';
import type { Case } from './types.ts';

/** Every frozen case: the original fifteen, then the boundary cases of amendment A2. */
export const ALL_CASES: readonly Case[] = [...CASES, ...BOUNDARY_CASES];
