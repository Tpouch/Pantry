# Pantry design system — "Larder"

This is the reference for Pantry's visual identity. It documents the design system as decided; see `docs/superpowers/specs/2026-08-08-larder-visual-redesign-design.md` for the reasoning and rollout scope behind it.

The identity is built from actual pantry material culture — hand-labeled jars, recipe index cards, a kitchen ledger — rather than a generic "warm app" look. The signature idea: **every discrete piece of data is a label stuck to the page.**

## Palette

| Token | Hex | Role |
|---|---|---|
| `ink` | `#2a2119` | Page background |
| `wood` | `#3a2f26` | Panel / toolbar background |
| `label` | `#f1e6cf` | Paper surface — stat blocks, recipe cards, the login card |
| `brass` | `#c08a2e` | Accent — active nav, focus rings, primary buttons |
| `sage` | `#74923c` | Positive status — in stock, ready to cook |
| `paprika` | `#a8402f` | Negative status — low stock, expiring, destructive actions |

Text on `ink` / `wood`: `#ece0c8` (primary), `#b8a888` (secondary/muted).
Text on `label`: `#2a2119`.

`sage` and `paprika` each need a "text-safe" shade in addition to their saturated "accent-safe" dot/icon shade — verify WCAG AA contrast against both `ink` and `label` before shipping, since the same status color is used on both dark and light surfaces.

## Typography

| Face | Role |
|---|---|
| **Fraunces** | Display — recipe names, panel/section titles, the login title. Titles and names only, never body copy. |
| **Karla** | Body — paragraphs, form inputs, nav labels, general UI text. |
| **Special Elite** | Utility/typewriter — quantities, statuses, timestamps, uppercase tags. Reads like text struck onto a label-maker tag. This is the replacement for the old "HUD data" monospace role. |

## The signature element: the pantry label

A stat block, a recipe card, an ingredient badge, and the login form are all the same object underneath: cream (`label`) paper, a small die-cut tab at the top edge, a soft drop shadow suggesting it's physically stuck to the page. This motif is what should be reached for whenever a new self-contained piece of data or a new card-like surface is added — it's the one thing this app should be recognized by, so don't dilute it by inventing a second "card" style elsewhere.

Structural rule: dashed lines ("tear lines") separate rows and sections instead of hard borders.

## Icons

A single-stroke, single-color line-icon set (currentColor, ~1.6px stroke) — house, jar, open book, ribbon/bookmark, calendar — replaces the colorful emoji that used to appear in nav and primary actions (🚪 📋 📅 🍳 🍽). Icons stay quiet and monochrome on purpose: the label motif carries the visual interest, icons should never compete with it. Plain inline glyphs used for inline status (✓ ✗ ▲) stay as-is.

## Navigation

Desktop nav tabs are cut like index-card dividers (angled top-left corner) on the `wood` toolbar; the active tab renders in `label`. Mobile bottom nav keeps the existing icon-over-label structure with the new icon set and `brass` for the active state.

## View-specific notes

- **Login** — a `label` card (same die-cut tab as every other label) on `ink`, Fraunces title reading "Pantry", Karla input, brass button.
- **Dashboard** — plain-language masthead and status line ("Well stocked" / "3 expiring soon") instead of tech-console phrasing ("SYSTEM NOMINAL"). No pulsing LEDs.
- **Ingredients** — dashed-divider rows; category shown as a small typewriter tag, not a colored chip.
- **Recipes / recipe detail** — full label treatment on recipe cards; the detail view's info panel is a recipe-card-styled sidebar; the "no photo" placeholder reads as an index-card corner, not an emoji.
- **Cook Log** — a plain ledger: dashed row dividers, typewriter-styled dates.
- **Meal Planner** — a `wood`-panel grid with one small label per filled slot. Deliberately not a literal corkboard/pinboard texture — charming once, noisy across 14 cells.

## Motion & accessibility

- No pulsing/blinking status indicators — say the status in plain language instead.
- One subtle "label placed" entrance animation for cards (slight scale + shadow settle) is the only motion in the system; it's skipped entirely under `prefers-reduced-motion: reduce`.
- Every interactive element has a visible `:focus-visible` outline in `brass`.
- Mobile tap targets stay at 40px+ minimum.

## Adding something new

Before adding a new visual pattern, ask: is this a label (a self-contained piece of data)? If yes, use the existing label treatment rather than inventing a new surface. If it's chrome (nav, toolbar, dividers) match the `wood`/dashed-line/index-tab vocabulary already in use. Reach for `sage`/`paprika` only for status, `brass` only for the one accent role — don't add new accent colors.
