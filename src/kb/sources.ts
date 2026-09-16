// Registry of sources. Must match the table in docs/SOURCES.md exactly; a test compares
// ids, titles and links, so neither can drift from the other.
import type { SourceId } from './vocab.ts';

export const SOURCE_IDS: readonly SourceId[] = [
  'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12',
  'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S23',
  'S24', 'S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32',
];

export type SourceRecord = { readonly id: SourceId; readonly title: string; readonly url: string };

export const SOURCES: readonly SourceRecord[] = [
  { id: 'S01', title: 'StatPearls — Brown-Séquard Syndrome', url: 'https://www.ncbi.nlm.nih.gov/books/NBK538135/' },
  { id: 'S02', title: 'StatPearls — Spinal Shock', url: 'https://www.ncbi.nlm.nih.gov/books/NBK448163/' },
  { id: 'S03', title: 'StatPearls — Neurogenic Shock', url: 'https://www.ncbi.nlm.nih.gov/books/NBK459361/' },
  { id: 'S04', title: 'StatPearls — Autonomic Dysreflexia', url: 'https://www.ncbi.nlm.nih.gov/books/NBK482434/' },
  { id: 'S05', title: 'MSD Manual Professional — Table: Spinal Cord Syndromes', url: 'https://www.msdmanuals.com/professional/multimedia/table/spinal-cord-syndromes' },
  { id: 'S06', title: 'StatPearls — Central Cord Syndrome', url: 'https://www.ncbi.nlm.nih.gov/books/NBK441932/' },
  { id: 'S07', title: 'StatPearls — Anterior Spinal Artery Syndrome', url: 'https://www.ncbi.nlm.nih.gov/books/NBK560731/' },
  { id: 'S08', title: 'StatPearls — Syringomyelia', url: 'https://www.ncbi.nlm.nih.gov/books/NBK537110/' },
  { id: 'S09', title: 'StatPearls — Cauda Equina and Conus Medullaris Syndromes', url: 'https://www.ncbi.nlm.nih.gov/books/NBK537200/' },
  { id: 'S10', title: 'StatPearls — Spinal Cord Subacute Combined Degeneration', url: 'https://www.ncbi.nlm.nih.gov/books/NBK560728/' },
  { id: 'S11', title: 'StatPearls — Neuroanatomy, Anterior White Commissure', url: 'https://www.ncbi.nlm.nih.gov/books/NBK546614/' },
  { id: 'S12', title: 'StatPearls — Deep Tendon Reflexes', url: 'https://www.ncbi.nlm.nih.gov/books/NBK531502/' },
  { id: 'S13', title: 'StatPearls — Tabes Dorsalis', url: 'https://www.ncbi.nlm.nih.gov/books/NBK557891/' },
  { id: 'S14', title: 'StatPearls — Neuroanatomy, Conus Medullaris', url: 'https://www.ncbi.nlm.nih.gov/books/NBK545227/' },
  { id: 'S15', title: 'StatPearls — Spinal Cord Injuries', url: 'https://www.ncbi.nlm.nih.gov/books/NBK560721/' },
  { id: 'S16', title: 'StatPearls — Horner Syndrome', url: 'https://www.ncbi.nlm.nih.gov/books/NBK500000/' },
  { id: 'S17', title: 'StatPearls — Amyotrophic Lateral Sclerosis', url: 'https://www.ncbi.nlm.nih.gov/books/NBK556151/' },
  { id: 'S18', title: 'StatPearls — Motor Neuron Disease', url: 'https://www.ncbi.nlm.nih.gov/books/NBK560774/' },
  { id: 'S19', title: 'StatPearls — Cervical Radiculopathy', url: 'https://www.ncbi.nlm.nih.gov/books/NBK441828/' },
  { id: 'S20', title: 'StatPearls — Neurogenic Bladder', url: 'https://www.ncbi.nlm.nih.gov/books/NBK560617/' },
  { id: 'S21', title: 'StatPearls — Anatomy, Skin, Dermatomes', url: 'https://www.ncbi.nlm.nih.gov/books/NBK535401/' },
  { id: 'S22', title: 'StatPearls — Anatomy, Abdomen and Pelvis, Pudendal Nerve', url: 'https://www.ncbi.nlm.nih.gov/books/NBK554736/' },
  { id: 'S23', title: 'Brain Communications 2025 — The human spinothalamic tract: lessons from cordotomy', url: 'https://academic.oup.com/braincomms/article/7/3/fcaf237/8165923' },
  { id: 'S24', title: 'StatPearls — Neuroanatomy, Spinal Cord Morphology', url: 'https://www.ncbi.nlm.nih.gov/books/NBK545206/' },
  { id: 'S25', title: 'StatPearls — Neuroanatomy, Touch Receptor', url: 'https://www.ncbi.nlm.nih.gov/books/NBK547731/' },
  { id: 'S26', title: 'Neuroscience Online (UTHealth) — Anatomy of the Spinal Cord, ch. 3', url: 'https://nba.uth.tmc.edu/neuroscience/m/s2/chapter03.html' },
  { id: 'S27', title: 'StatPearls — Neuroanatomy, Posterior Column', url: 'https://www.ncbi.nlm.nih.gov/books/NBK507888/' },
  { id: 'S28', title: 'StatPearls — Neuroanatomy, Unmyelinated Nerve Fibers', url: 'https://www.ncbi.nlm.nih.gov/books/NBK554461/' },
  { id: 'S29', title: 'Snooks & Swash, JNNP 1985 — Motor conduction velocity in the human spinal cord', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1028573/' },
  { id: 'S30', title: 'Radiopaedia — Spinal cord', url: 'https://radiopaedia.org/articles/spinal-cord' },
  { id: 'S31', title: 'StatPearls — Physiology, Spinal Cord', url: 'https://www.ncbi.nlm.nih.gov/books/NBK544267/' },
  { id: 'S32', title: 'StatPearls — Cervical Injury', url: 'https://www.ncbi.nlm.nih.gov/books/NBK448146/' },
];
