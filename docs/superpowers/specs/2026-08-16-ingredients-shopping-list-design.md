# Ingredients Shopping List — split "Ingredients" into two tabs

## Context

Creating or editing a recipe lets you add an ingredient that doesn't exist yet; doing so silently creates a permanent row in the `ingredients` table at quantity 0 so the recipe can reference it. Today that row is indistinguishable from a real pantry item on the Ingredients page — it clutters "what do I actually have" with things you've never bought. There's also no view that tells you, across every recipe, what you'd need to buy to make them.

## Decision

### Two tabs on the existing Ingredients page

- **My Ingredients** — the same list/table as today, now filtered to ingredients with `quantity > 0`. An ingredient that exists only because a recipe references it (created at qty 0, or used down to 0 by cooking) drops off this tab automatically — a display filter on existing data, no new "hidden" flag. A one-line note appears when at least one ingredient is hidden this way, naming them and pointing at the Shopping List tab.
- **Shopping List** (new) — every ingredient referenced by at least one recipe, each showing total quantity needed across all recipes vs. quantity you have. Rows where you're short are listed first, with a quantity input pre-filled with the missing amount and an "Add to stock" button; rows where you already have enough show a plain "in stock" badge instead. "Add to stock" adds the entered amount to the ingredient's existing quantity — it is additive, not a new ingredient-creation flow.

The tab switcher reuses the existing `.btn`/`.btn-active` toggle pattern already used for the Meal Planner's week switcher — no new UI pattern introduced.

This was validated with a live mockup (both tab states, the needed/have layout, the add-to-stock control, and the "hidden ingredients" note) before writing this spec; the mockup was approved as-is.

### Backend: one new read endpoint

`GET /api/ingredients/needed` — joins `recipe_ingredients` to `ingredients`, grouped by ingredient, returning each ingredient's full record plus a `needed` field (the sum of `recipe_ingredients.quantity` across every recipe that uses it). The service layer adds a computed `missing = max(0, needed - quantity)` and sorts missing-first, then alphabetically. No schema changes — this is a new query over existing tables, following the app's existing routes → controller → service → repository layering.

No unit conversion: exactly like the existing `canCook`/`hasEnough` logic elsewhere in the app (`recipesService.js`), needed vs. have is compared directly without converting between units. This is a pre-existing, accepted limitation of the data model, not something this feature introduces or is responsible for fixing.

"Add to stock" reuses the existing `PUT /api/ingredients/:id` endpoint — the frontend computes `newQuantity = have + enteredAmount` and sends a normal update with the ingredient's existing fields. No new write endpoint.

### Frontend

- `client/src/views/Ingredients.vue` becomes the tab container: fetches both `api.ingredients.list()` and the new `api.ingredients.needed()` on load, holds `activeTab` state (`'mine' | 'shopping'`), and re-fetches both lists after any mutating action (add/edit/delete ingredient, add-to-stock).
- `myIngredients` is a computed filter: `ingredients.value.filter(i => i.quantity > 0)`.
- New component `client/src/components/NeededIngredientRow.vue` — one row of the Shopping List: name, "need X unit — have Y unit", and either the quantity-input + "Add to stock" button (when `missing > 0`) or an "✔ in stock" badge (when `missing <= 0`). Emits `add-stock` with the entered amount; the view owns the actual API call and refresh.
- Existing `IngredientRow.vue`, `IngredientFormModal.vue`, and the "+ Add Ingredient" flow are unchanged — creating or editing an ingredient directly from "My Ingredients" still works exactly as today.

### Copy

- Tab labels: **My Ingredients** / **Shopping List**.
- Shopping List row text: "need 400 g — have 0 g".
- Action button: "Add to stock".
- In-stock badge: "✔ in stock".
- "My Ingredients" hidden-items note (only shown when at least one ingredient is hidden): names the hidden ingredients and points at the Shopping List tab.
- Shopping List empty state (no recipe references any ingredient yet): "Nothing needed yet — add ingredients to a recipe and they'll show up here."

## Scope

**Backend:** `server/repositories/ingredientsRepository.js`, `server/services/ingredientsService.js`, `server/controllers/ingredientsController.js`, `server/routes/ingredients.js`, `server/__tests__/ingredients.test.js`.

**Frontend:** `client/src/api.js`, `client/src/views/Ingredients.vue`, new `client/src/components/NeededIngredientRow.vue`.

## Out of scope

- Unit conversion between a recipe's requested unit and the ingredient's stock unit.
- Scoping the Shopping List to only meal-planned recipes — explicitly decided to cover all recipes, not just currently scheduled ones.
- Any change to how ingredients get created while building a recipe — still created at quantity 0; that behavior is intentional and unchanged. The two-tab split is what makes it non-disruptive, not a change to the creation flow itself.
- Any change to the Recipes/RecipeDetail pages' existing per-recipe stock-check (`canCook`/`missingCount`) logic.

## Verification

Backend: Jest/Supertest tests for `GET /api/ingredients/needed` covering the empty case (no recipes reference any ingredient), the missing-quantity case, and the fully-stocked case. Manual check of both tabs and the add-to-stock flow in the browser at desktop and mobile widths — this app has no frontend component test suite.
