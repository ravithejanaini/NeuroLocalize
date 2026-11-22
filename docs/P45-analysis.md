# P45 — The walk, given back to the scene

Written on 2026-11-22. The owner sent a screenshot of a walk along the left V1 and said it feels
cramped, and that the app is to be deployed for use. On the screen they sent, on a stage about
880 by 860 pixels, the walk's own controls took most of it.

## What was measured on that screen

- **Six bands of controls**, stacked: the title; the stop's card, open to its full length and
  about half the stage's width; the offers to step across (two lines each); a row to move and
  turn; the strip of stops; a row to play and scrub; and a line of keys. The scene showed between
  them in a strip about a third of the stage's height.
- **Names in the scene lay under the card**, and ran off the stage's right edge. Declutter (P44)
  thinned the station names but not the walk's own: the stop names and the step-across signposts.

## What was done

| Before | After |
|---|---|
| The card open at every stop | Folded to "Stop n of N" and the stop's name; **More** opens it, and it stays as the walker left it. A lesion line is always shown. |
| Two rows of controls, with words | One bar: ◀ Play ▶, the scrubber, ▲ ▼ ⟲ Ahead, pace, **Stops**, **?** — each button named for a screen reader and with its key in its title |
| The strip of stops always shown | Behind **Stops** |
| The line of keys always shown | Behind **?** |
| Offers on two lines | One line: number, name, and what the step is, in small type after it; the whole in the button's title |
| Where the walker faces, a row of its own | After the subtitle |
| Walk names placed without regard to anything | Thinned by `declutter()` with the walk's own controls given in as boxes that always win; ranked signposts first, then stops in the order they come; held inside the stage; at most 44 characters wide, or the phone's width |

On a phone the pace menu is put away, as it was, and the bar wraps to the scrubber over the
buttons.

## Checked

Eight walks — the first of each group and the left V1 — were stepped through, six stops each, and
at each stop every name shown on the stage was read from the page:

| Screen | Stops looked at | Names shown | Overlapping pairs | Under a control | Off the stage |
|---|---|---|---|---|---|
| 375 × 812 | 40 | 112 | 0 | 0 | 0 |
| 1280 × 800 | 40 | 136 | 0 | 0 | 0 |

Before the last two corrections the same check found one name under the card (the card's height
had changed with the stop's name and was not re-measured) and 40 signposts wider than a phone's
stage. More, Stops and ? were each opened and closed and their state read. `npm run verify`: 515
tests pass.

## Limits

- The check reads the page; it was not done with a person's eye on a real phone.
- The preview pane captures only part of the page, so the screenshots were taken with the page
  scaled down by a style set from the console for the purpose, which is not part of the app.
- Nothing the engine reads changed, so no examination's leader can have moved; no mutation run.
