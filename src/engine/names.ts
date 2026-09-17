// Plain names for candidate families and where a group of candidates sits. Shared by the
// examination panel and by practice cases, so both say the same thing.
import type { LesionFamily, Place, Segment } from '../kb/vocab.ts';
import { SITE_NAME } from './reverse.ts';

export const FAMILY_NAME: Record<LesionFamily, string> = {
  complete: 'Complete transection',
  hemicord_left: 'Left hemicord',
  hemicord_right: 'Right hemicord',
  anterior: 'Anterior two-thirds',
  posterior: 'Posterior columns',
  central_small: 'Central, commissure only',
  central_cord: 'Central cord',
  root_left: 'Left root',
  root_right: 'Right root',
  roots_bilateral: 'Cauda equina, both sides',
  posterolateral: 'Posterior + lateral columns',
  dorsal_root_column: 'Dorsal roots + columns',
  motor_neuron: 'Anterior horns + corticospinal',
  plexus_left: 'Left brachial plexus',
  plexus_right: 'Right brachial plexus',
  nerve_left: 'Left peripheral nerve',
  nerve_right: 'Right peripheral nerve',
  brainstem_left: 'Left brainstem',
  brainstem_right: 'Right brainstem',
  hemisphere_left: 'Left hemisphere',
  hemisphere_right: 'Right hemisphere',
};

export type Placed = {
  readonly family: LesionFamily;
  readonly rostral: readonly [Segment, Segment];
  readonly caudal: readonly [Segment, Segment];
  readonly sites: readonly Place[];
  /** How many candidates the group holds. */
  readonly size: number;
};

/** Where a group of candidates sits: its places, or its level range. */
export function levelText(g: Placed): string {
  if (g.sites.length > 3) return `any of ${g.sites.length} places — ${g.sites.slice(0, 2).map((s) => SITE_NAME[s]).join(', ')}, …`;
  if (g.sites.length > 0) return g.sites.map((s) => SITE_NAME[s]).join(' or ');
  if (['posterolateral', 'dorsal_root_column', 'motor_neuron'].includes(g.family)) return 'fixed distribution';
  const [ra, rb] = g.rostral;
  const [ca, cb] = g.caudal;
  if (g.size === 1) return ra === ca ? `at ${ra}` : `${ra}–${ca}`;
  return `upper end ${ra === rb ? ra : `${ra}–${rb}`}, lower end ${ca === cb ? ca : `${ca}–${cb}`}`;
}
