# Larder — visual redesign of Pantry's frontend

## Context

Pantry's current UI is a Factorio-inspired industrial control-panel look (embossed dark-grey panels, scanline texture, monospace HUD readouts, pulsing status LEDs, orange accent — see `client/src/styles/theme.css`). It's distinctive and consistently applied almost everywhere, with one break: the login screen (`client/src/views/Login.vue`) is a plain rounded dark-gradient card that matches nothing else, and still reads "Let Me Cook" from before the project was renamed to Pantry.

Reviewing the app surfaced that the industrial-HUD identity, while well executed, feels cold and overly technical for what is fundamentally a home kitchen/pantry tool used about equally from a phone while cooking and a desktop while planning meals. This spec replaces it with a warmer identity, "Larder," grounded in actual pantry material culture — hand-labeled jars, recipe cards, a pantry ledger — rather than a generic "warm redesign" (no cream-background/serif/terracotta cliché, no near-black/acid-accent cliché).

Two directions were sketched and compared in a live mockup: a refined version of the current industrial HUD, and Larder. Larder was chosen, along with follow-up mockups for navigation, mobile nav, and the login screen. All three were approved.

## Decision: adopt "Larder"

### Palette (named hex values)

| Name | Hex | Use |
|---|---|---|
| `ink` | `#2a2119` | Page background |
| `wood` | `#3a2f26` | Panel/toolbar background |
| `label` | `#f1e6cf` | Paper card/tag surface (stat blocks, recipe cards, login card) |
| `brass` | `#c08a2e` | Accent — active nav, focus rings, primary buttons |
| `sage` | `#74923c` | Positive status — in stock, ready to cook |
| `paprika` | `#a8402f` | Negative status — low stock, expiring, delete |

Text on `ink`/`wood`: warm parchment (`#ece0c8`) primary, muted tan (`#b8a888`) secondary. Text on `label`: dark ink (`#2a2119`).

Contrast on both `ink` and `label` backgrounds must be verified (WCAG AA) for `sage` and `paprika` before finalizing exact shades — they may need separate "text-safe" variants from the "accent-safe" variants used for dots/icons.

### Typography

- **Fraunces** (display) — recipe names, panel/section titles, login title. Used with restraint: titles and names only, never body copy.
- **Karla** (body) — paragraphs, form inputs, nav labels, general UI text.
- **Special Elite** (utility/typewriter) — quantities, statuses, timestamps, uppercase tags. Reads like text struck onto a label-maker tag — this is what replaces the old Share Tech Mono "HUD data" role.

### Signature element: the pantry label

Every discrete unit of data — a dashboard stat, a recipe card, an ingredient badge, the login form itself — renders as a label stuck to the page: cream paper, a small die-cut tab at the top edge, a soft drop shadow suggesting it's physically affixed. This one motif unifies the dashboard, recipe list, and login screen, which is what makes it a signature rather than a decoration. Everything else (dividers, icons, chrome) stays quiet so this reads clearly.

Structural devices: dashed rules (a "tear line") replace hard borders between list rows and sections.

### Icons

Colorful emoji currently used for primary chrome (🚪 logout, 📋 cook log, 📅 plan, 🍳 log-cook action, 🍽 empty-state photo placeholder) are replaced by a single-stroke, single-color line-icon set (currentColor, ~1.6px stroke): house, jar, open book, ribbon/bookmark, calendar. These stay quiet and monochrome by design — the label motif is where the visual interest lives, not the icons. Existing plain glyphs used for inline status (✓ ✗ ▲) are kept as-is; they already read fine in a single color.

### Navigation

Desktop nav tabs are cut like index-card dividers (angled top-left corner) sitting on the `wood` toolbar, with the active tab rendered as a `label`-colored tab. Mobile bottom nav keeps the current icon-over-label layout structure, swapping in the new icon set and `brass` for the active state.

### Login

Full rewrite to match: a `label`-styled card (with the same die-cut tab as every other label in the app) on an `ink` background, Fraunces title reading "Pantry" (fixing the stale "Let Me Cook" branding), Karla input, brass button.

### View-by-view application

- **Dashboard**: header masthead becomes plain-language instead of tech-speak — "The Larder" title, and a status line like "Well stocked" / "3 expiring soon" instead of "SYSTEM NOMINAL". Stats and recipe readiness use the label card treatment already validated in the mockup.
- **Ingredients**: list rows keep a dashed-divider layout; category shown as a small typewriter-font tag rather than a colored chip.
- **Recipes / Recipe detail**: recipe cards get the full label treatment (tab + shadow); the detail view's left info panel is restyled as a recipe-card sidebar, and the "no photo" placeholder reads as an index-card corner instead of a plate emoji.
- **Cook Log**: rendered as a plain ledger — dashed row dividers, typewriter-styled dates.
- **Meal Planner**: week grid is a `wood`-panel background with one small label per filled slot. Explicitly not a literal corkboard/pinboard texture — that reads as charming once but noisy repeated across 14 cells.

### Motion & accessibility

- Remove the pulsing-LED status indicators entirely (they were part of the tech-console metaphor that's being dropped) in favor of the plain-language status line above.
- Add one subtle "label placed" entrance animation for cards (slight scale + shadow settle), skipped entirely under `prefers-reduced-motion: reduce`.
- Add real `:focus-visible` outlines (brass) on all interactive elements — currently missing from the whole app.
- Preserve existing mobile touch-target sizing (40px+ tap targets) already present in the current CSS.

## Scope

CSS and markup only — no backend, routing, or business-logic changes.

**Central (cascades to most of the app):**
- `client/src/styles/theme.css` — full token replacement, shared class restyle (`.panel`, `.btn`, `.trow`, `.badge`, `.section-label`), new `:focus-visible` rules, font imports.

**Direct rework needed (bespoke markup, hardcoded colors, or emoji):**
- `client/src/App.vue` (nav shape, icon set, mobile nav)
- `client/src/views/Login.vue` (full rewrite)
- `client/src/views/Dashboard.vue`, `client/src/components/DashboardHudHeader.vue`, `client/src/components/StatBlock.vue` (drop LED/pulse, plain-language status)
- `client/src/components/RecipeCard.vue`, `client/src/components/ExpiryRow.vue`, `client/src/components/IngredientRow.vue`
- `client/src/views/RecipeDetail.vue` (inline styles currently in the template move into scoped classes as part of this pass), `client/src/components/RecipeStockBar.vue`, `client/src/components/StepList.vue`
- `client/src/views/MealPlanner.vue`, `client/src/components/MealDayCell.vue`, `client/src/components/MealSlot.vue`
- New: a small icon set (single Vue component or a handful of inline-SVG icon components) for house/jar/book/ribbon/calendar

**Expected to need little or no change** (inherit shared classes, no bespoke visuals): modals (`AppModal.vue` and the specific modal components), `IngredientSearchDropdown.vue`, `UnitSelect.vue`, `StockBadge.vue`, `ExpiryBadge.vue`, `PageHeader.vue`, `Ingredients.vue`, `Recipes.vue`, `CookLog.vue` — verify visually once the central tokens land, adjust only what looks wrong.

## Out of scope

- Any new features or data model changes.
- Recipe photo upload (the "no photo" placeholder is restyled, not implemented).
- Renaming component files (e.g. `DashboardHudHeader.vue`) — content changes, filenames stay, to keep the diff reviewable.

## Verification

Manual visual check of every view at desktop and mobile widths (this app has no visual regression tooling). No backend tests are affected; run `npm test` to confirm no incidental breakage.
