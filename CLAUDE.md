# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git commits

Do not add a "Co-Authored-By" or any footer to commit messages.

## Commands

```bash
# Development (Express on :3000, Vite on :5173 with /api proxy)
npm run dev

# Run all backend tests
npm test

# Run a single test file
cd server && npm test -- --testPathPattern=ingredients
cd server && npm test -- --testPathPattern=recipes
cd server && npm test -- --testPathPattern=cookLog

# Production build (compiles Vue into server/public/)
npm run build

# Start production server (serves API + built frontend on :3000)
NODE_ENV=production npm start
```

## Architecture

This is a monorepo with two packages that run as one process in production.

**server/** — Node.js + Express + better-sqlite3  
**client/** — Vue 3 + Vue Router + Vite

In dev, Vite (`localhost:5173`) proxies `/api/*` to Express (`localhost:3000`). In production, `npm run build` compiles the frontend into `server/public/` and Express serves it as static files — one port, one process.

### Backend layers (routes → controllers → services → repositories)

Each domain (ingredients, recipes, cookLog, dashboard) has its own file at each layer:

- **routes/** — Express routers, maps HTTP verbs to controller functions
- **controllers/** — thin HTTP layer, calls service, maps thrown errors to status codes
- **services/** — business logic and validation; throws `Error` on failure
- **repositories/** — all SQL via better-sqlite3; never called directly from controllers

`server/db.js` exports a singleton better-sqlite3 instance. It runs `CREATE TABLE IF NOT EXISTS` on require, so importing it initializes the schema automatically.

`recipes.steps` is stored as a JSON string in SQLite. Every repository function that reads recipes calls `JSON.parse(r.steps)` before returning.

### Key business logic

- **Stock check** — `recipesService.checkStock(id)` joins `recipe_ingredients` with `ingredients`, compares required qty vs current qty. Returns `canCook` (boolean) and `missingCount`. `GET /api/recipes` includes these fields on every recipe. `GET /api/recipes/:id` additionally returns per-ingredient `hasEnough` and full stock details.
- **Cook deduction** — `POST /api/cook-log` accepts `{ recipeId, cookedAt, deductions: [{ ingredientId, quantityUsed }] }`. The service logs the entry then calls `ingredientsService.applyDeductions()` which runs `UPDATE ingredients SET quantity = MAX(0, quantity - ?)` per deduction. No deduction history is stored.
- **Dashboard** — `GET /api/dashboard` aggregates recent ingredients, expiring ingredients (within 14 days), recent recipes (merged from cook log + recently created), and stats. Computed fresh on each request.

### Frontend

`client/src/api.js` is the single API client — a thin `fetch` wrapper. All components import from it as `import { api } from '../api'`. Never use raw `fetch` in components.

#### Component discipline

Views in `client/src/views/` must stay thin. Any self-contained piece of UI — a modal, a form, a list row, a reusable display element — goes in `client/src/components/` instead of being inlined in the view. Concretely:

- **Modals** are always their own component (`XxxModal.vue`), never an inline `<div class="overlay">` inside a view.
- **Repeated UI patterns** (a table row type, a card, a badge variant, a form field widget) are extracted as components once they appear in more than one place.
- **Complex form sub-sections** (e.g. an ingredient editor list, a step editor list) are components even when used in a single view, if they own non-trivial state or logic.

A view should ideally contain only layout, data-fetching, and wiring between components.

`client/src/styles/theme.css` defines all CSS variables. The design is Factorio-inspired dark grey:

- `--accent: #e0a020` (orange) is used **only** for the active nav tab underline and the step progress bar fill — not as a general highlight color
- `--green: #5ab830` / `--red: #c83020` for stock/expiry status
- Panels and buttons get the embossed look via `box-shadow: var(--bevel-hi), var(--bevel-lo)`
- Body has a subtle horizontal scanline texture via `repeating-linear-gradient`

The router uses hash history (`createWebHashHistory`), so URLs are `/#/ingredients`, `/#/recipes/:id`, etc.

### Data persistence

All state must be persisted server-side in SQLite. Never use localStorage or any client-side storage for application data.

### Tests

Tests in `server/__tests__/` use Jest + Supertest against the real SQLite database (not mocked). Each `beforeEach` deletes rows in FK dependency order. Running tests mutates `server/pantry.db`.
