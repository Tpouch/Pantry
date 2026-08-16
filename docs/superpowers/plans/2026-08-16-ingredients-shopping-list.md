# Ingredients Shopping List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the Ingredients page into two tabs — "My Ingredients" (what you actually have in stock) and "Shopping List" (everything your recipes need, with what's missing and a quick way to add it to stock) — so ingredients auto-created while building a recipe stop cluttering the stock view.

**Architecture:** One new read-only backend endpoint aggregates `recipe_ingredients` against `ingredients` to compute what's needed vs. what's in stock; the frontend adds a tab switcher to the existing Ingredients view, filters the existing stock list client-side, and renders the new aggregated list through a new row component. No schema changes, no new write endpoint — "adding to stock" reuses the existing ingredient update endpoint.

**Tech Stack:** Node.js + Express + better-sqlite3 (backend), Vue 3 `<script setup>` + Vite (frontend), Jest + Supertest (backend tests).

## Global Constraints

- Follow the existing backend layering: routes → controllers → services → repositories. Each new backend piece goes in the file for its layer.
- No unit conversion between a recipe's requested unit and the ingredient's stock unit — compare quantities directly, exactly like the existing `canCook`/`hasEnough` logic in `server/services/recipesService.js`.
- No schema changes. No new write endpoint — "Add to stock" reuses the existing `PUT /api/ingredients/:id`.
- Tab labels, exactly: **My Ingredients** / **Shopping List**. Action button, exactly: **Add to stock**. In-stock badge, exactly: **✔ in stock**.
- Do not change how ingredients get created from the recipe editor (still creates at quantity 0 — that's intentional and unchanged).
- Do not change the Recipes/RecipeDetail pages' existing `canCook`/`missingCount` logic.
- This app has no frontend component test framework — frontend verification is manual, via the running dev server, consistent with the rest of the codebase.

---

## Task 1: Backend — `GET /api/ingredients/needed`

**Files:**
- Modify: `server/repositories/ingredientsRepository.js`
- Modify: `server/services/ingredientsService.js`
- Modify: `server/controllers/ingredientsController.js`
- Modify: `server/routes/ingredients.js`
- Modify: `server/__tests__/ingredients.test.js`

**Interfaces:**
- Produces: `GET /api/ingredients/needed` → `200` with a JSON array. Each element is a full ingredient row (`id`, `name`, `quantity`, `unit`, `expiration_date`, `category`, `created_at`) plus two computed fields: `needed` (Number — sum of `recipe_ingredients.quantity` across every recipe using this ingredient) and `missing` (Number — `Math.max(0, needed - quantity)`). Sorted with `missing > 0` items first, then alphabetically by `name` (case-insensitive) within each group. Only ingredients referenced by at least one recipe appear in the response.

- [ ] **Step 1: Write the failing tests**

Replace the top of `server/__tests__/ingredients.test.js` (the `beforeEach` block) so it also cleans the tables this new endpoint's tests need — mirroring the pattern already used in `server/__tests__/recipes.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const db = require('../db')

beforeEach(() => {
  db.prepare('DELETE FROM recipe_ingredients').run()
  db.prepare('DELETE FROM recipes').run()
  db.prepare('DELETE FROM ingredients').run()
})
```

Then append this new `describe` block at the end of the file:

```js
describe('GET /api/ingredients/needed', () => {
  it('returns empty array when no recipe references any ingredient', async () => {
    const res = await request(app).get('/api/ingredients/needed')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns needed, have, and missing for an ingredient short on stock', async () => {
    const { lastInsertRowid: ingId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Flour', 100, 'g')").run()
    const { lastInsertRowid: recipeId } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Bread', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 150, 'g')").run(recipeId, ingId)

    const res = await request(app).get('/api/ingredients/needed')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Flour')
    expect(res.body[0].needed).toBe(150)
    expect(res.body[0].quantity).toBe(100)
    expect(res.body[0].missing).toBe(50)
  })

  it('sums quantity needed across multiple recipes using the same ingredient', async () => {
    const { lastInsertRowid: ingId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Eggs', 2, 'pieces')").run()
    const { lastInsertRowid: r1 } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Omelette', '[]')").run()
    const { lastInsertRowid: r2 } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Cake', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 2, 'pieces')").run(r1, ingId)
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 3, 'pieces')").run(r2, ingId)

    const res = await request(app).get('/api/ingredients/needed')
    expect(res.body).toHaveLength(1)
    expect(res.body[0].needed).toBe(5)
    expect(res.body[0].missing).toBe(3)
  })

  it('sets missing to 0 when fully stocked, and sorts short items before fully-stocked ones', async () => {
    const { lastInsertRowid: applesId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Apples', 10, 'pieces')").run()
    const { lastInsertRowid: zucchiniId } = db.prepare("INSERT INTO ingredients (name, quantity, unit) VALUES ('Zucchini', 0, 'pieces')").run()
    const { lastInsertRowid: recipeId } = db.prepare("INSERT INTO recipes (name, steps) VALUES ('Salad', '[]')").run()
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 4, 'pieces')").run(recipeId, applesId)
    db.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, 2, 'pieces')").run(recipeId, zucchiniId)

    const res = await request(app).get('/api/ingredients/needed')
    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('Zucchini')
    expect(res.body[0].missing).toBe(2)
    expect(res.body[1].name).toBe('Apples')
    expect(res.body[1].missing).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && pnpm test -- ingredients.test.js`
Expected: FAIL — `GET /api/ingredients/needed` returns 404, since the route doesn't exist yet.

- [ ] **Step 3: Add the repository query**

In `server/repositories/ingredientsRepository.js`, add this function (after `findRecent`, before `create`):

```js
function findNeeded() {
  return db.prepare(`
    SELECT i.*, SUM(ri.quantity) as needed
    FROM recipe_ingredients ri
    JOIN ingredients i ON i.id = ri.ingredient_id
    GROUP BY i.id
    ORDER BY i.name COLLATE NOCASE ASC
  `).all()
}
```

Update the `module.exports` line at the bottom to include it:

```js
module.exports = { findAll, findById, findExpiringSoon, findRecent, findNeeded, create, update, remove, deductQuantity }
```

- [ ] **Step 4: Add the service function**

In `server/services/ingredientsService.js`, add this function (after `getRecent`, before `createIngredient`):

```js
function getNeededIngredients() {
  const rows = repo.findNeeded()
  const withMissing = rows.map(r => ({ ...r, missing: Math.max(0, r.needed - r.quantity) }))
  withMissing.sort((a, b) => {
    const aShort = a.missing > 0 ? 0 : 1
    const bShort = b.missing > 0 ? 0 : 1
    if (aShort !== bShort) return aShort - bShort
    return a.name.localeCompare(b.name)
  })
  return withMissing
}
```

Update the `module.exports` line at the bottom:

```js
module.exports = { listIngredients, getExpiringSoon, getRecent, getNeededIngredients, createIngredient, updateIngredient, deleteIngredient, applyDeductions }
```

- [ ] **Step 5: Add the controller action**

In `server/controllers/ingredientsController.js`, add this function (after `list`, before `create`):

```js
function listNeeded(req, res) {
  res.json(service.getNeededIngredients())
}
```

Update the `module.exports` line at the bottom:

```js
module.exports = { list, listNeeded, create, update, remove }
```

- [ ] **Step 6: Add the route**

In `server/routes/ingredients.js`, add the new route after the existing `router.get('/', ctrl.list)` line:

```js
router.get('/', ctrl.list)
router.get('/needed', ctrl.listNeeded)
router.post('/', ctrl.create)
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd server && pnpm test -- ingredients.test.js`
Expected: PASS — all tests in the file green, including the 4 new ones.

Then run the full suite to confirm nothing else broke:

Run: `pnpm test` (from the repo root)
Expected: PASS — all suites green (this was 28/28 before this task; expect 32/32 after, 4 new tests added).

- [ ] **Step 8: Commit**

```bash
git add server/repositories/ingredientsRepository.js server/services/ingredientsService.js server/controllers/ingredientsController.js server/routes/ingredients.js server/__tests__/ingredients.test.js
git commit -m "feat: add GET /api/ingredients/needed endpoint"
```

---

## Task 2: Frontend — `NeededIngredientRow.vue` component

**Files:**
- Create: `client/src/components/NeededIngredientRow.vue`

**Interfaces:**
- Consumes: an `ingredient` object shaped like Task 1's endpoint response (`id`, `name`, `quantity`, `unit`, `needed`, `missing` — the fields this component actually reads).
- Produces: `NeededIngredientRow` component. Props: `ingredient: Object` (required). Emits: `add-stock` with payload `{ id: Number, amount: Number }` when the user clicks "Add to stock" with a positive amount entered.

- [ ] **Step 1: Create the component**

```vue
<template>
  <div class="trow need-row">
    <div class="need-name">
      <span class="trow-name">{{ ingredient.name }}</span>
    </div>
    <div class="need-qty">
      need <b>{{ ingredient.needed }} {{ ingredient.unit }}</b> — have <b>{{ ingredient.quantity }} {{ ingredient.unit }}</b>
    </div>
    <div class="need-action">
      <template v-if="ingredient.missing > 0">
        <input
          type="number"
          class="need-input"
          min="0"
          step="any"
          v-model.number="amount"
        />
        <button class="btn btn-sm btn-green" @click="onAddStock">Add to stock</button>
      </template>
      <span v-else class="badge badge-green">✔ in stock</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ ingredient: Object })
const emit = defineEmits(['add-stock'])

const amount = ref(props.ingredient.missing)

watch(() => props.ingredient.missing, (v) => { amount.value = v })

function onAddStock() {
  if (!amount.value || amount.value <= 0) return
  emit('add-stock', { id: props.ingredient.id, amount: amount.value })
}
</script>

<style scoped>
.need-row { gap: 14px; }
.need-name { flex: 2; }
.need-qty { flex: 1.6; font-family: 'Special Elite', monospace; font-size: 0.78rem; color: var(--text-dim); }
.need-qty b { color: var(--text-bright); font-family: inherit; }
.need-action { flex: 1.6; display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
.need-input { width: 70px; background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.85rem; padding: 5px 8px; }

@media (max-width: 767px) {
  .need-row { flex-wrap: wrap; }
  .need-qty { flex: 1 1 100%; order: 3; }
}
</style>
```

This reuses the app's existing shared classes: `.trow` (the standard list-row layout/divider from `client/src/styles/theme.css`), `.trow-name`, `.btn`/`.btn-sm`/`.btn-green`, and `.badge`/`.badge-green` — no new global CSS needed.

- [ ] **Step 2: Verify it compiles**

Run: `pnpm run dev` from the repo root (or confirm it's already running).
Expected: no compile errors in the Vite/terminal output. This component isn't used anywhere yet, so there's nothing to see in the browser — that happens in Task 3.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/NeededIngredientRow.vue
git commit -m "feat: add NeededIngredientRow component"
```

---

## Task 3: Frontend — tab switcher and wiring in `Ingredients.vue`

**Files:**
- Modify: `client/src/api.js`
- Modify: `client/src/views/Ingredients.vue`

**Interfaces:**
- Consumes: `GET /api/ingredients/needed` via a new `api.ingredients.needed()` client method (Task 1's endpoint); `NeededIngredientRow` (Task 2), receiving one item of the `needed` list as its `ingredient` prop and handling its `add-stock` event.

- [ ] **Step 1: Add the API client method**

In `client/src/api.js`, update the `ingredients` block:

```js
  ingredients: {
    list: () => request('GET', '/ingredients'),
    needed: () => request('GET', '/ingredients/needed'),
    create: (data) => request('POST', '/ingredients', data),
    update: (id, data) => request('PUT', `/ingredients/${id}`, data),
    remove: (id) => request('DELETE', `/ingredients/${id}`)
  },
```

- [ ] **Step 2: Replace `client/src/views/Ingredients.vue` in full**

```vue
<template>
  <div class="page">
    <PageHeader title="Ingredients">
      <button class="btn btn-sm btn-green" @click="openAdd">+ Add Ingredient</button>
    </PageHeader>

    <div class="tab-switch">
      <button class="btn btn-sm" :class="{ 'btn-active': activeTab === 'mine' }" @click="activeTab = 'mine'">My Ingredients</button>
      <button class="btn btn-sm" :class="{ 'btn-active': activeTab === 'shopping' }" @click="activeTab = 'shopping'">Shopping List</button>
    </div>

    <div class="panel ing-list" v-if="activeTab === 'mine'">
      <div class="trow header-row">
        <div class="col-name" style="flex:2">Name</div>
        <div class="col-qty" style="flex:1">Quantity</div>
        <div class="col-cat" style="flex:1">Category</div>
        <div class="col-exp" style="flex:1">Expires</div>
        <div class="col-actions" style="flex:0 0 80px">Actions</div>
      </div>
      <IngredientRow
        v-for="ing in myIngredients"
        :key="ing.id"
        :ingredient="ing"
        @edit="openEdit"
        @delete="confirmDelete"
      />
      <div class="trow" v-if="!myIngredients.length" style="color:var(--text-muted)">No ingredients yet. Add some!</div>
      <div class="trow hidden-note" v-if="hiddenIngredients.length">
        {{ hiddenIngredients.length }} ingredient{{ hiddenIngredients.length !== 1 ? 's' : '' }} hidden because you have none in stock ({{ hiddenIngredients.map(i => i.name).join(', ') }}) — see Shopping List.
      </div>
    </div>

    <div class="panel ing-list" v-else>
      <div class="trow header-row">
        <div style="flex:2">Name</div>
        <div style="flex:1.6">Needed / Have</div>
        <div style="flex:1.6"></div>
      </div>
      <NeededIngredientRow
        v-for="ing in needed"
        :key="ing.id"
        :ingredient="ing"
        @add-stock="onAddStock"
      />
      <div class="trow" v-if="!needed.length" style="color:var(--text-muted)">Nothing needed yet — add ingredients to a recipe and they'll show up here.</div>
    </div>

    <IngredientFormModal
      v-if="showForm"
      :editing="editing"
      @close="showForm = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import PageHeader from '../components/PageHeader.vue'
import IngredientRow from '../components/IngredientRow.vue'
import NeededIngredientRow from '../components/NeededIngredientRow.vue'
import IngredientFormModal from '../components/IngredientFormModal.vue'

const ingredients = ref([])
const needed = ref([])
const activeTab = ref('mine')
const showForm = ref(false)
const editing = ref(null)

onMounted(load)

async function load() {
  ingredients.value = await api.ingredients.list()
  needed.value = await api.ingredients.needed()
}

const myIngredients = computed(() => ingredients.value.filter(i => i.quantity > 0))
const hiddenIngredients = computed(() => ingredients.value.filter(i => i.quantity <= 0))

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(ing) {
  editing.value = ing
  showForm.value = true
}

function onSaved() {
  showForm.value = false
  load()
}

async function confirmDelete(ing) {
  if (!confirm(`Delete "${ing.name}"?`)) return
  await api.ingredients.remove(ing.id)
  await load()
}

async function onAddStock({ id, amount }) {
  const ing = ingredients.value.find(i => i.id === id)
  if (!ing) return
  await api.ingredients.update(id, {
    name: ing.name,
    quantity: ing.quantity + amount,
    unit: ing.unit,
    expiration_date: ing.expiration_date,
    category: ing.category
  })
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 8px; }
.tab-switch { display: flex; gap: 4px; }
.ing-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.hidden-note { color: var(--text-faint); font-size: 0.76rem; cursor: default !important; }

@media (max-width: 767px) {
  .header-row { display: none; }
  .col-cat, .col-exp { display: none !important; }
  .col-actions { flex: 0 0 72px !important; }
  .trow { min-height: 44px; }
}
</style>
```

Note: `ing.id` in the `needed` array is the same ingredient `id` as in the main `ingredients` array (Task 1's query selects `i.*`), so `onAddStock` can look the ingredient up directly in the already-loaded `ingredients` list without a second fetch.

- [ ] **Step 3: Manual verification**

With `pnpm run dev` running (both `server` on :3000 and Vite on :5173, or the built app on :3000), open the Ingredients page in a browser and check:

- "My Ingredients" tab shows only ingredients with quantity > 0. If you have an ingredient at quantity 0 (create one via a recipe's ingredient editor, or set one to 0 by editing it), confirm it disappears from this tab and the hidden-items note appears naming it.
- Switch to "Shopping List". Confirm it lists every ingredient used by at least one recipe, with correct "need X — have Y" text, missing-first sort order, and a quantity input pre-filled with the missing amount for short items, or a "✔ in stock" badge for fully-stocked ones.
- Enter an amount and click "Add to stock" on a short item. Confirm the request succeeds, both lists refresh, the item either drops off the Shopping List (if now fully stocked) or shows a smaller missing amount, and the item now appears in "My Ingredients" if its quantity is now > 0.
- Check mobile width (<767px): tabs and both list layouts remain usable, no horizontal overflow.
- Confirm the existing "+ Add Ingredient" button still opens the creation modal and works as before, and editing/deleting from "My Ingredients" still works.

- [ ] **Step 4: Commit**

```bash
git add client/src/api.js client/src/views/Ingredients.vue
git commit -m "feat: add Shopping List tab to Ingredients page"
```

---

## Self-Review Notes

- **Spec coverage:** backend aggregation endpoint → Task 1; row component → Task 2; tab switcher, "My Ingredients" filtering, hidden-items note, Shopping List wiring, add-to-stock → Task 3. Copy strings (tab labels, button text, badge text, empty states) all appear verbatim in Task 3's template, matching the spec's Copy section. Out-of-scope items (unit conversion, meal-plan scoping, recipe-editor changes, `canCook` changes) are untouched by all three tasks.
- **Type/interface consistency:** Task 1's response fields (`needed`, `missing`, plus the full ingredient row) are exactly what Task 2's component destructures and exactly what Task 3 passes through unmodified. `NeededIngredientRow`'s `add-stock` payload shape (`{ id, amount }`) matches what Task 3's `onAddStock` destructures.
- **Scope check:** three tasks, each independently testable/verifiable (Task 1 has its own passing test suite; Task 2 compiles standalone; Task 3 is the only one needing live manual verification, and it's the last task, so nothing downstream depends on unverified frontend code).
