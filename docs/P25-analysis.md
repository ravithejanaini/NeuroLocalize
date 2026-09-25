# P25 — Muscle roots from their own anatomy articles: analysis

Written before the model changed; the frozen cases for it (`answered.ts`, A30) were run red
first. Every fact below was read, verbatim, on 2026-09-25 through the NCBI Bookshelf.

| Id | Source |
|---|---|
| S152 | StatPearls — Anatomy, Shoulder and Upper Limb, Triceps Muscle (Tiwana, Sinkler, Bordoni; 2023-08-28) |
| S153 | StatPearls — Anatomy, Shoulder and Upper Limb, Forearm Brachioradialis Muscle (Lung, Ekblad, Bisogno; 2024-01-30) |
| S154 | StatPearls — Anatomy, Bony Pelvis and Lower Limb: Thigh Adductor Magnus Muscle (Jeno, Launico, Schindler; 2023-10-24) |

## 1. Why this phase

Four reviewer questions ask which roots supply a muscle — R12 (the interossei), R14 (the
triceps), R18 (the brachioradialis) and R28 (the hip adductors). Since P1 the model took muscles'
roots from the key-muscle tables (S19, S31), which name one key root per movement, not all of a
muscle's roots. Each muscle has its own StatPearls anatomy article.

## 2. What the sources state

| Muscle | Verbatim | Source |
|---|---|---|
| Triceps | "The provision of nerve supply to the triceps is by the radial nerve (root C6, C7, and C8)." | S152 |
| Triceps reflex | "This reflex tests spinal nerves C6 and C7, predominately C7." | S152 |
| Brachioradialis | the radial nerve "receives contributions from the C5 to C7 spinal roots, although most of the neural input to the brachioradialis comes from C5 and C6" | S153 |
| Adductors | "The adductor portion of the adductor magnus is innervated by the posterior division of the obturator nerve (L2-L4)"; the obturator nerve "innervates most muscles in the adductor compartment" | S154 |

## 3. Design

- **Triceps:** C7 stays its certain root (the key muscle, S19, S31); C6 and C8 become disputed.
  A C6 or C8 root lesion now leaves the triceps unsettled, not strong.
- **Brachioradialis:** C5 and C6 become its certain roots and C7 disputed. A C5 root lesion now
  weakens it; a C7 one leaves it unsettled. Its roots are no longer borrowed from its reflex, so the
  muscle row drops conflict C3, which stays on the reflex's row.
- **Hip adductors:** unchanged. S154 gives the nerve's roots, L2–L4, which the model already uses as
  the adductors' possible roots; no source read gives any one root's share (R28 stays open).
- **Interossei:** unchanged. C8 has been a disputed root since A9, which is R12's answer.

## 4. What else changed, and why

Seven older frozen assertions said the triceps (six) or the brachioradialis (one) was strong after
a lesion now reaching one of its disputed roots. All seven were **composed** from the key-muscle
tables; none was stated by a source for that lesion. They now say unsettled (A30). No stated
assertion conflicts: the one case where a source states the triceps spared (the ulnar nerve at the
elbow, S36) involves no root and is unchanged.
