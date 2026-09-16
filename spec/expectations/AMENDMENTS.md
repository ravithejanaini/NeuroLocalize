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

_No amendments._
