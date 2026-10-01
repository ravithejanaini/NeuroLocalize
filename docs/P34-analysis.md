# P34 — Horner syndrome by the neurone: first, second and third order

Written on 2026-10-01 before any P34 code. Sources were read in full in the browser (NCBI
Bookshelf); every quotation below is verbatim.

## Why

The model gave a Horner syndrome as one finding, present or absent, from the brainstem, the cord,
the T1 root and (since P30) the cavernous sinus. It could not say which of the three neurones was
cut, it had no place for the two lesions students are taught to fear behind a Horner syndrome — the
lung apex and the carotid artery in the neck — and it had nothing for the finding that tells the
three apart at the bedside: where sweating is lost.

## What each source states

**The three neurones** (S16). "The first-order neurons originate in the hypothalamus and descend
uncrossed through the midbrain and pons, terminating in the intermediolateral cell columns at the C8
through T2 levels of the spinal cord, known as the ciliospinal center of Budge. Second-order
preganglionic neurons exit the spinal cord at the T1 level and enter the cervical sympathetic chain,
where they ascend to synapse in the superior cervical ganglion at the C3 through C4 levels. Third-order
postganglionic fibers divide into sudomotor and vasomotor branches that follow the external carotid
artery and innervate the sweat glands and blood vessels of the face. The remaining fibers ascend
within the carotid plexus along the internal carotid artery and enter the cavernous sinus".

**Sweating, by neurone** (S16, S176). S16: "First-order neuron lesions may cause anhidrosis involving
the ipsilateral side of the body because these fibers arise centrally. Second-order neuron lesions
typically affect the ipsilateral face. Third-order postganglionic neuron lesions produce limited
facial anhidrosis, usually confined to the area adjacent to the ipsilateral brow, because the
vasomotor and sudomotor fibers have already branched from the pathway." S176: "First-order neuron
lesions (Preganglionic): … anhidrosis affects the entire half of the body ipsilateral to the lesion."
"Second-order neuron lesions (Preganglionic): … anhidrosis (distribution is localized only to the
ipsilateral head and neck)." "Lesions proximal to the superior cervical ganglion will have anhidrosis
of the entire ipsilateral head and neck. In contrast, lesions distal to the superior cervical
ganglion will present with anhidrosis limited only to the ipsilateral forehead and nose."

**Which lesions belong to which neurone** (S16, S176). S16, first order: "Lateral medullary syndrome",
"Syringomyelia", "Spinal trauma above the T2 through T3 levels", "Spinal cord tumors". Second order:
"Malignant neoplasms involving the lung apex, including Pancoast tumors", "Trauma to the brachial
plexus". Third order: "in close proximity to the internal carotid artery and cavernous sinus" —
"Internal carotid artery dissection or an aneurysm". S176 gives the same examples: Wallenberg
syndrome and cord lesions first; "Pancoast tumors" second; "carotid dissection, skull base/orbital
lesions, parasellar lesions" third.

**The lung apex** (S177). "Pancoast syndrome describes the clinical manifestations resulting from a
superior sulcus lesion involving the brachial plexus and sympathetic chain." "Extension of the tumor
to C8 and T1 nerve roots results in weakness and atrophy of the intrinsic muscles of the hand or pain
and paresthesia of the fourth and fifth digits and the medial aspect of the arm and forearm." "Horner
syndrome (resection of the stellate ganglion and sympathetic chain)".

**The carotid artery in the neck** (S178, S16). S178: "A Horner syndrome may be present if a hematoma
of the cervical artery compresses the adjacent sympathetic nerve fibers." S16 lists internal carotid
artery dissection under the third-order neurone.

## Design

- A new finding on each side: **where sweating is lost** — nowhere, the brow, the face, or the face
  and that half of the body. It follows the most central neurone cut on that side: first order the
  half body, second the face, third the brow. The rule is one row of the knowledge base.
- The engine sorts every Horner lesion it already has by neurone, as the sources do: the brainstem
  and the cord — its descending fibres and the ciliospinal centre itself — are first order (S16 lists
  syringomyelia and cord lesions above T2 there); the T1 root is second order; the carotid plexus in
  the cavernous sinus is third order.
- Two new parts: the **cervical sympathetic chain** with the stellate ganglion (second order) and
  the **carotid plexus in the neck** (third order).
- Two new places: the **lung apex** — the chain with the lower trunk of the brachial plexus, so a
  Horner syndrome with a weak, numb ulnar side of the hand — and the **internal carotid artery in the
  neck**, a Horner syndrome with sweating lost only at the brow.
- The examination records where sweating is lost on each side.

## Conflicts and limits

- **C92 — Proximal and distal to the ganglion.** S176 gives a postganglionic lesion "proximal to the
  superior cervical ganglion" the whole head and neck, and S16 puts the sudomotor fibres' departure
  on the external carotid. The model's third-order parts are both distal to it — on the internal
  carotid — so both give the brow.
- **C93 — "Face" and "head and neck".** S16 says the face, S176 the head and neck, for the second
  neurone; the model's word is the face.
- **C94 — The lung apex and the C8–T1 roots look alike.** A lesion of the C8 and T1 roots themselves
  gives the same hand and the same second-order Horner syndrome; nothing examined separates them
  (pain, the shoulder and imaging are not modelled). The examination expects both to lead.
- **C95 — The pharmacological tests** (cocaine, apraclonidine, hydroxyamphetamine) and the pupil's
  size are not modelled; nor are pain, harlequin flushing or the ciliospinal reflex.
- **C96 — "May".** S16 says first-order lesions "may cause" half-body anhidrosis, and S178 that a
  Horner syndrome "may be present" in dissection. The model's places are complete lesions and give
  the stated pattern.
