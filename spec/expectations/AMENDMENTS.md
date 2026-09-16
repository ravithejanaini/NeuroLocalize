# Amendments to frozen expectations

The expectations in this directory were written from `docs/SOURCES.md` and frozen at the
git tag `expectations-frozen`, before any engine code existed. That ordering is what makes
them a specification rather than a restatement of the engine.

Changing an expectation afterwards is permitted only by adding an entry here, in the same
diff. `npm run check:freeze` fails otherwise.

An amendment must say:

- which case and assertion changed, and from what to what;
- the **source** that justifies it — a source that was read, listed in `SOURCES.md`;
- why the knowledge base could not be corrected instead.

"The engine produces something different" is never on its own a reason. That is the
situation the freeze exists to catch.

---

## A1 — 2026-09-16 — case `central-cord-C4-C6`, qualifier `upper_limb_predominant_weakness`

- **Changed:** `cite: ['S06', 'S05']` → `cite: ['S06']`. The expected value (`present: true`)
  is unchanged.
- **Why:** conflict C4 in `DECISIONS.md` excludes S05's central-cord row, because two
  separate queries reported it placing the syndrome in the thoracic cord and its raw text
  could not be checked. Citing a row the project has declared unusable is a contradiction.
  Found while auditing knowledge-base citations, before any engine code ran.
- **Source still supporting the assertion:** S06, which states the upper-limb predominance
  directly.
- **Why the knowledge base could not be corrected instead:** the error was in the
  expectation's citation, not in any fact the engine uses.
