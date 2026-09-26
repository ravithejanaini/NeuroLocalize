# P32 — The superior orbital fissure and the orbital apex

Written on 2026-09-27 before any P32 code. S171 was read in full in the browser (NCBI
Bookshelf); every quotation below is verbatim.

## Why

The cavernous sinus (P30) is one of three orbital syndromes taught together, and the other two are
told apart from it — and from each other — by exactly two findings: the cheek and the eye's vision.
S171: "Orbital syndromes include orbital apex, superior orbital fissure, and cavernous sinus
syndrome."

## What the sources state

**The fissure** (S171). "The middle portion of the superior orbital fissure contains the cranial
nerves III, IV, and VI and the ophthalmic division of the trigeminal nerve (V1)." "The superior
orbital fissure syndrome (SOF), also known as the Rochen- Duvigneaud syndrome, is characterized by
the involvement of the III, IV, VI, and the ophthalmic division of the trigeminal nerve." "Still, it
differs from OAS with the sparing of the optic nerve."

**The apex** (S171). "The orbital apex consists of the superior orbital fissure and the optic canal
with its contents." "The contents of the optic canal include the optic nerve, ophthalmic artery, and
the postganglionic sympathetic fibers from the carotid plexus." "The clinical signs of orbital apex
syndrome are due to the involvement of the optic nerve, oculomotor nerve, trochlear nerve, abducens
nerve, and the ophthalmic branch of the trigeminal nerve." The signs include "defective vision, a
relative afferent pupillary defect due to involvement of the optic nerve, restricted ocular movement
due to the involvement of the oculomotor, trochlear, and abducens nerve, facial pain and paresthesia
over the forehead and the upper lid due to the involvement of the ophthalmic division of trigeminal
nerve, and anisocoria due to the involvement of the pupillary fibers."

**What the sinus adds** (S171, S122). S171: "The cavernous sinus syndrome, besides the features of
the OAS, is characterized by the involvement of the maxillary division of the trigeminal nerve and
the oculosympathetic fibers." S122: V2 is "the only cranial nerve within the cavernous sinus that
bypasses the superior orbital fissure".

**Each nerve's way into the orbit** (S61, S70, S122). The third, fourth and sixth nerves and V1 all
enter the orbit through the superior orbital fissure (S70, S61, S122).

## Design

- One new part: V1 alone in the fissure. The route to the face by division becomes a list of rows —
  V1 and V2 in the sinus (P30), V1 alone in the fissure.
- Two places, each taking the third, fourth and sixth nerves: the **superior orbital fissure**, with
  V1; and the **orbital apex**, with V1 and the optic nerve of the same eye (the visual part P8
  already has). Both rank with the cranial nerves.
- The three syndromes then differ where the sources say: the cheek (V2) only in the sinus; the eye's
  vision and a relative afferent pupillary defect only at the apex.

## Conflicts and limits

- **C84 — The sympathetic fibres at the apex.** S171 puts postganglionic sympathetic fibres in the
  optic canal and lists "anisocoria due to the involvement of the pupillary fibers" at the apex, yet
  names the oculosympathetic fibres as what the sinus adds. Neither apex nor fissure asserts a Horner
  syndrome either way.
- **C85 — A continuum.** S171: the three "may represent a continuum of the same spectrum". The model
  draws three whole places; partial and spreading lesions are not places (as C78).
- **C86 — Proptosis and pain** are not modelled.
