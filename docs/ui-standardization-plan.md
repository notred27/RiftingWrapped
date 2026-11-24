# UI standardization plan

Goal: every font size and spacing value comes from the tokens in
`public/index.html` (`--fs-*`, `--space-*`, `--radius-*`). No new tokens unless a
value is used often and has no close match.

## Phase 1 — Font sizes (this branch, done)

Baseline: 129 of 137 CSS `font-size` declarations already used tokens. The 3
`fontSize` hits in `PillPreviewCard.js` are commented-out code and were ignored.

| Location | Was | Now | Note |
|---|---|---|---|
| `src/components/common/TableEntry.css:69` `.compact-entry-date` | `11px` | `var(--fs-2xs)` | +1px |
| `src/components/layout/SiteFooter.css:104` `.site-footer__desc` | `10px` | `var(--fs-2xs)` | +2px |
| `src/components/slides/styles.css:551` `.month-chart__value/__label` (≤400px) | `10px` | removed | Base is already `--fs-2xs` |
| `src/components/slides/styles.css:458` `.slide-title` (≤640px) | `clamp(34px, 11vw, 48px)` | removed | Falls back to base `--fs-display-lg`; ~+4px on phones, up to 64px on 450–640px |
| `src/components/slides/styles.css:462` `.slide-title--quiet` (≤640px) | `clamp(26px, 8vw, 34px)` | removed | Falls back to base `--fs-display-md`; ~−2px on phones |
| `src/components/slides/styles.css:617` share-slide `.slide-title` (≤640px) | `clamp(30px, 9.5vw, 40px)` | `var(--fs-display-md)` | ~−7px on phones |
| `src/components/slides/styles.css:644` `.slide-title` (short phones) | `clamp(30px, 9.5vw, 38px)` | `var(--fs-display-md)` | ~−7px on phones |
| `src/pages/Weekly/WeeklyRecap.css:71` `.wk-tag` | `0.6em` | `var(--fs-xs)` | Was relative to the name; now fixed 14/15px |

## Phase 2 — Spacing (margin / padding / gap) (this branch, done)

Scale: 4, 8, 12, 16, 24, 32, 48px (`--space-1`..`--space-7`).

Rule applied: every px/rem length in a `margin*`, `padding*`, `gap`, `row-gap` or
`column-gap` value goes to the **nearest token, ties round up** (6→8, 10→12, 14→16,
20→24, 28→32, 40→48; 2/3/5→4). Kept raw on purpose:
- ≤1px (hairlines) and ≥50px (layout sizes, e.g. `clamp(..., 64px)` maxes)
- negative values, `%`, `vw`/`vh`, `auto`
- `top/left/right/bottom` positioning offsets
- Chart.js `padding` options (`ChampGraph.js`, `KDAgraph.js`) — canvas config, can't take CSS vars

Result: 165 CSS declarations across 13 files + 19 inline JS style values.

Verified (A/B against master): every slide's bottom edge moved −2 to +9px at 375×667,
all slides still fit one screen; no horizontal overflow on Home, FAQ or slides.

To spot new raw values later:
`grep -rnE '(margin|padding|gap)[a-z-]*\s*:[^;]*[0-9]px' src --include=*.css`

## Phase 3 — Other tokens (later)

- `border-radius`: raw values → `--radius-sm/md/lg/pill`
- Audit `line-height` and `letter-spacing` and add tokens only if a few values repeat

## Guardrail

When done, add a stylelint rule (`declaration-property-value-disallowed-list`) that
flags raw px in `font-size`, `margin`, `padding` and `gap` so values don't drift again.
