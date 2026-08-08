# Larder Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Pantry's industrial-HUD visual identity with the "Larder" identity (warm pantry-ledger palette, Fraunces/Karla/Special Elite type, the "pantry label" signature motif) as decided in `docs/superpowers/specs/2026-08-08-larder-visual-redesign-design.md` and documented in `DESIGN.md`.

**Architecture:** This is a CSS-and-markup-only pass. Almost every component reads color/spacing from CSS custom properties defined once in `client/src/styles/theme.css`, so most of the app reskins automatically once those tokens change (Task 1). Remaining tasks handle the pieces with bespoke markup, hardcoded hex colors, or emoji that tokens alone can't fix — the nav, login, dashboard header/stats, recipe cards, and a few smaller components.

**Tech Stack:** Vue 3 (`<script setup>`, scoped CSS), Vite, no build-time CSS preprocessor — plain CSS custom properties only.

## Global Constraints

- No visual regression tooling exists in this repo. Verification for every task is a manual check in the browser at a desktop width (~1280px) and a mobile width (<767px), per `docs/superpowers/specs/2026-08-08-larder-visual-redesign-design.md`'s Verification section. Run `npm run dev` once at the start of this work and keep it running; reload the browser after each task's changes.
- CSS-and-markup only. Do not change routes, API calls, or business logic in any file touched here.
- Do not rename component files (e.g. `DashboardHudHeader.vue` keeps its name even though its content changes) — this is called out explicitly as out of scope in the spec, to keep the diff reviewable.
- Every new/changed color must come from a `var(--token)` defined in `client/src/styles/theme.css` — never hardcode a hex value in a component file.
- Palette tokens (must match exactly): `--bg #2a2119`, `--panel #3a2f26`, `--label #f1e6cf`, `--accent #c08a2e` (brass), `--green #74923c` (sage), `--red #a8402f` (paprika).
- Fonts (must match exactly): **Fraunces** for titles/names, **Karla** for body/UI text, **Special Elite** for quantities/statuses/timestamps/uppercase tags.
- Respect `prefers-reduced-motion: reduce` for every new animation.
- Every interactive element must have a visible `:focus-visible` outline.

---

## Task 1: Core design tokens, fonts, and shared classes

This is the foundational task. It changes the value of every existing CSS custom property to the Larder palette (keeping the same variable *names*, so every component that already reads `var(--panel)`, `var(--text-bright)`, `var(--green)`, etc. recolors for free) and adds the handful of new tokens/utility classes the later tasks need.

**Files:**
- Modify: `client/index.html:12-14` (font links)
- Modify: `client/src/styles/theme.css` (entire file)
- Modify: `CLAUDE.md` (Frontend section — the current doc describes the old "Factorio-inspired dark grey" theme and a rule that `--accent` is used only for the nav underline/step bar, which the new design intentionally supersedes)

**Interfaces:**
- Produces: all existing CSS custom properties (`--bg`, `--bg-mid`, `--panel`, `--panel-alt`, `--header`, `--header-mid`, `--border`, `--border-dim`, `--text`, `--text-dim`, `--text-faint`, `--accent`, `--green`, `--red`, `--bevel-hi`, `--bevel-lo`, `--toolbar`, `--text-muted`, `--text-bright`, `--row-alt`, `--row-hover`, `--green-bg`, `--green-border`, `--red-bg`, `--red-border`, `--yellow`, `--yellow-bg`, `--yellow-border`, `--border-dark`, `--accent-dark`) repointed to Larder hex values; five new tokens `--label`, `--label-tab`, `--ink`, `--green-on-label`, `--red-on-label`; a new `.label-card` / `.label-card::before` utility (the pantry-label signature motif) with a reduced-motion-safe `label-place` entrance animation; a global `:focus-visible` rule; `.trow` and `.section-label` bottom borders changed from solid to dashed; `.badge` given `font-family: 'Special Elite', monospace`.
- Consumed by: every other task in this plan.

- [ ] **Step 1: Update the Google Fonts link in `client/index.html`**

Replace line 14:

```html
    <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
```

with:

```html
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Karla:wght@400;500;600;700&family=Special+Elite&display=swap" rel="stylesheet" />
```

Also update line 7 (`theme-color`, used for the mobile browser chrome color) from `#363636` to `#423527`.

- [ ] **Step 2: Replace `client/src/styles/theme.css` in full**

```css
:root {
  --bg: #2a2119;
  --bg-mid: #241c15;
  --panel: #3a2f26;
  --panel-alt: #332921;
  --header: #423527;
  --header-mid: #332921;
  --border: #6b5a44;
  --border-dim: #4a3c2e;
  --text: #ece0c8;
  --text-dim: #b8a888;
  --text-faint: #7a6a4e;
  --accent: #c08a2e;
  --green: #74923c;
  --red: #a8402f;
  --bevel-hi: inset 1px 1px 0 rgba(255,232,190,0.10);
  --bevel-lo: inset -1px -1px 0 rgba(0,0,0,0.38);
  /* aliases for component compatibility */
  --toolbar: #423527;
  --text-muted: #b8a888;
  --text-bright: #ece0c8;
  --row-alt: rgba(255,232,190,0.035);
  --row-hover: rgba(255,232,190,0.06);
  --green-bg: #1e2810;
  --green-border: #4f6b28;
  --red-bg: #2a1510;
  --red-border: #7a2e21;
  --yellow: #c08a2e;
  --yellow-bg: #2a2011;
  --yellow-border: #8a6522;
  --border-dark: #4a3c2e;
  --accent-dark: #8a6522;
  /* Larder additions: the pantry-label surface and its text-safe status colors */
  --label: #f1e6cf;
  --label-tab: #c9b98f;
  --ink: #2a2119;
  --green-on-label: #4f6b28;
  --red-on-label: #7a2e21;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--bg);
  background-image: radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px);
  background-size: 7px 7px;
  color: var(--text);
  font-family: 'Karla', 'Trebuchet MS', sans-serif;
  font-size: 15px;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-mid); }
::-webkit-scrollbar-thumb { background: var(--border); border: 1px solid var(--border-dim); }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.btn {
  background: var(--panel);
  border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
  color: var(--text-dim);
  font-family: inherit; font-size: 0.88rem; padding: 0 16px;
  cursor: pointer; height: 32px;
  display: inline-flex; align-items: center; gap: 5px;
  touch-action: manipulation;
}

@media (max-width: 767px) {
  .btn { min-height: 40px; }
  .btn-sm { min-height: 36px; font-size: 0.85rem; }
}
.btn:hover { background: var(--panel-alt); color: var(--text); border-color: var(--border); }
.btn-sm { font-size: 0.82rem; padding: 0 12px; height: 28px; }
.btn-active {
  background: var(--panel-alt);
  border-color: var(--border);
  color: var(--text);
  font-weight: 600;
  border-bottom: 2px solid var(--accent);
}
.btn-green { background: var(--green-bg); border-color: var(--green-border); color: var(--green); }
.btn-green:hover { background: #263612; border-color: var(--green-border); color: var(--green); }
.btn-danger { background: var(--red-bg); border-color: var(--red-border); color: var(--red); }
.btn-danger:hover { background: #351a14; border-color: var(--red-border); color: var(--red); }

.panel {
  background: var(--panel);
  border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
}
.panel-title {
  background: var(--header-mid);
  border-bottom: 1px solid var(--border-dim);
  padding: 6px 12px; font-weight: 700; font-size: 0.85rem; color: var(--text-bright);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}

.trow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 12px; border-bottom: 1px dashed var(--border-dim); font-size: 0.85rem;
}
.trow:nth-child(even) { background: var(--row-alt); }
.trow:hover { background: var(--row-hover); }
.trow-name { color: var(--text-bright); font-weight: 600; }
.trow-meta { color: var(--text-dim); font-size: 0.75rem; margin-top: 2px; }

.badge {
  font-size: 0.68rem; padding: 2px 7px;
  font-family: 'Special Elite', monospace;
  font-weight: 400; letter-spacing: 0.5px; white-space: nowrap;
  border: 1px solid;
}
.badge-red { background: var(--red-bg); border-color: var(--red-border); color: var(--red); }
.badge-yellow { background: var(--yellow-bg); border-color: var(--yellow-border); color: var(--yellow); }
.badge-green { background: var(--green-bg); border-color: var(--green-border); color: var(--green); }
.badge-grey { background: var(--panel-alt); border-color: var(--border-dim); color: var(--text-dim); }

.section-label {
  padding: 4px 12px; background: var(--panel-alt); border-bottom: 1px dashed var(--border-dim);
  font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint);
}

/* Larder signature motif: a piece of data rendered as a label stuck to the page */
.label-card {
  background: var(--label);
  color: var(--ink);
  border-radius: 2px;
  box-shadow: 0 3px 0 rgba(0,0,0,0.28);
  position: relative;
  animation: label-place 0.25s ease-out;
}
.label-card::before {
  content: '';
  position: absolute; top: 0; left: 14px;
  width: 26px; height: 8px;
  background: var(--label-tab);
  border-radius: 0 0 3px 3px;
}
@keyframes label-place {
  from { transform: scale(0.96) translateY(2px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .label-card { animation: none; }
}
```

- [ ] **Step 3: Update `CLAUDE.md`'s Frontend section**

Find this paragraph (in the `### Frontend` section, under the `#### Component discipline` block):

```
`client/src/styles/theme.css` defines all CSS variables. The design is Factorio-inspired dark grey:

- `--accent: #e0a020` (orange) is used **only** for the active nav tab underline and the step progress bar fill — not as a general highlight color
- `--green: #5ab830` / `--red: #c83020` for stock/expiry status
- Panels and buttons get the embossed look via `box-shadow: var(--bevel-hi), var(--bevel-lo)`
- Body has a subtle horizontal scanline texture via `repeating-linear-gradient`
```

Replace it with:

```
`client/src/styles/theme.css` defines all CSS variables. The design is "Larder" — a warm pantry-ledger identity; see `DESIGN.md` for the full system (palette, type, the pantry-label signature motif, icon rules). In short:

- `--accent: #c08a2e` (brass) is the app's one accent color — used for the active nav tab, focus rings, and primary buttons
- `--green: #74923c` (sage) / `--red: #a8402f` (paprika) for stock/expiry status, with `--green-on-label` / `--red-on-label` darker variants for text placed on `--label` (cream) surfaces
- Any self-contained piece of data (a stat, a recipe, an ingredient, the login form) uses the `.label-card` utility class rather than a new bespoke "card" style
```

- [ ] **Step 4: Manual verification**

With `npm run dev` running, open the app in a browser:
- Every page's background should now be warm dark brown (`#2a2119`), not near-black grey.
- Tab through the login page (or any page) with the keyboard — every focused button/input should show a visible brass outline.
- On the Ingredients page, list rows should be separated by dashed lines, not solid ones.
- Open devtools, force `prefers-reduced-motion: reduce` (Rendering tab in Chrome devtools), confirm no console errors (the `.label-card` class isn't used by any component yet, so there's nothing to visually check for it here — that comes in Task 5).

- [ ] **Step 5: Commit**

```bash
git add client/index.html client/src/styles/theme.css CLAUDE.md
git commit -m "feat: replace industrial-HUD tokens with Larder palette and type"
```

---

## Task 2: Icon set component

Replaces the colorful emoji used in primary navigation (🚪, 📋, 📅) with a single-stroke, single-color line-icon set, per `DESIGN.md`'s Icons section.

**Files:**
- Create: `client/src/components/Icon.vue`

**Interfaces:**
- Produces: `Icon` component, prop `name: String` (one of `'home' | 'jar' | 'book' | 'ribbon' | 'calendar'`), renders an inline `<svg>` sized by its parent's `font-size`/explicit CSS, colored via `currentColor`.
- Consumed by: Task 3 (`App.vue` nav).

- [ ] **Step 1: Create `client/src/components/Icon.vue`**

```vue
<template>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="paths[name]" />
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })

const paths = {
  home: 'M4 11 12 4l8 7M6 10v9h12v-9',
  jar: 'M9 3v4M15 3v4M6 7h12l-1 13H7L6 7Z',
  book: 'M5 4h11l3 3v13H5V4Z M16 4v3h3',
  ribbon: 'M6 3h12v18l-6-3-6 3V3Z',
  calendar: 'M4 5h16v15H4V5Z M4 9h16 M8 3v4 M16 3v4'
}
</script>

<style scoped>
.icon { width: 1em; height: 1em; display: inline-block; vertical-align: middle; }
</style>
```

- [ ] **Step 2: Manual verification**

This component isn't used anywhere yet. Confirm there are no template/script errors by checking the Vite dev server terminal output for compile errors after saving the file.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Icon.vue
git commit -m "feat: add line-icon set for Larder nav"
```

---

## Task 3: App.vue navigation and chrome

Reshapes the desktop nav into index-card-style dividers, swaps emoji for the new `Icon` set, and removes the now-unused login-view gradient wrapper (the login screen gets its own background in Task 4).

**Files:**
- Modify: `client/src/App.vue`

**Interfaces:**
- Consumes: `Icon` component from Task 2 (`name` prop).
- Produces: no new interfaces; this is a leaf view.

- [ ] **Step 1: Replace the template's nav markup**

Replace lines 6–39 (the `<nav class="toolbar">` through the closing `<nav class="mobile-nav">`) with:

```html
    <nav class="toolbar">
      <div class="toolbar-logo">Pantry</div>
      <router-link to="/" class="tab desktop-nav" :class="{ active: $route.path === '/' }"><Icon name="home" />Dashboard</router-link>
      <router-link to="/ingredients" class="tab desktop-nav" :class="{ active: $route.path === '/ingredients' }"><Icon name="jar" />Ingredients</router-link>
      <router-link to="/recipes" class="tab desktop-nav" :class="{ active: $route.path.startsWith('/recipes') }"><Icon name="book" />Recipes</router-link>
      <router-link to="/cook-log" class="tab desktop-nav" :class="{ active: $route.path === '/cook-log' }"><Icon name="ribbon" />Cook Log</router-link>
      <router-link to="/meal-plan" class="tab desktop-nav" :class="{ active: $route.path === '/meal-plan' }"><Icon name="calendar" />Plan</router-link>
      <button class="btn btn-sm logout-btn" @click="logout">Log out</button>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <nav class="mobile-nav">
      <router-link to="/" :class="{ active: $route.path === '/' }">
        <Icon name="home" class="nav-icon" />
        <span class="nav-label">Dash</span>
      </router-link>
      <router-link to="/ingredients" :class="{ active: $route.path === '/ingredients' }">
        <Icon name="jar" class="nav-icon" />
        <span class="nav-label">Ingredients</span>
      </router-link>
      <router-link to="/recipes" :class="{ active: $route.path.startsWith('/recipes') }">
        <Icon name="book" class="nav-icon" />
        <span class="nav-label">Recipes</span>
      </router-link>
      <router-link to="/cook-log" :class="{ active: $route.path === '/cook-log' }">
        <Icon name="ribbon" class="nav-icon" />
        <span class="nav-label">Cook Log</span>
      </router-link>
      <router-link to="/meal-plan" :class="{ active: $route.path === '/meal-plan' }">
        <Icon name="calendar" class="nav-icon" />
        <span class="nav-label">Plan</span>
      </router-link>
    </nav>
```

- [ ] **Step 2: Import `Icon` in the script block**

In the `<script>` block, change:

```js
import { ref, onMounted } from 'vue'
import { apiCall } from './api'
import Login from './views/Login.vue'

export default {
  components: { Login },
```

to:

```js
import { ref, onMounted } from 'vue'
import { apiCall } from './api'
import Login from './views/Login.vue'
import Icon from './components/Icon.vue'

export default {
  components: { Login, Icon },
```

- [ ] **Step 3: Replace the `<style>` block**

Replace the entire `<style>` block (lines 87–155) with:

```vue
<style>
#login-view {
  min-height: 100vh;
}

#layout { display: flex; flex-direction: column; height: 100vh; }
.toolbar {
  background: var(--header);
  border-bottom: 2px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo), 0 2px 6px rgba(0,0,0,0.5);
  display: flex; align-items: flex-end; height: 42px; padding: 0 8px; gap: 2px; flex-shrink: 0;
}
.toolbar-logo {
  color: var(--text);
  font-family: 'Fraunces', serif; font-weight: 700; font-size: 1rem;
  padding: 0 14px 8px 4px; margin-right: 6px; align-self: center;
}
.toolbar a.tab {
  text-decoration: none;
  background: var(--panel-alt);
  border: 1px solid var(--border-dim);
  border-bottom: none;
  color: var(--text-dim);
  font-size: 0.82rem;
  padding: 8px 14px 7px;
  display: inline-flex; align-items: center; gap: 6px;
  clip-path: polygon(0 100%, 0 8px, 8px 0, 100% 0, 100% 100%);
}
.toolbar a.tab.active {
  background: var(--label);
  color: var(--ink);
  font-weight: 700;
}
.logout-btn {
  margin-left: auto;
  align-self: center;
}
.main-content { flex: 1; overflow: hidden; border-top: 3px solid var(--label); }

.mobile-nav { display: none; }

@media (max-width: 767px) {
  .desktop-nav { display: none !important; }
  .toolbar-logo { margin-right: 0; }

  #layout { padding-bottom: 56px; }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 56px;
    background: var(--header);
    border-top: 2px solid var(--border-dim);
    box-shadow: 0 -2px 8px rgba(0,0,0,0.5);
    z-index: 50;
  }
  .mobile-nav a {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--text-dim);
    font-size: 0.6rem;
    gap: 2px;
    padding: 6px 4px;
    border-right: 1px dashed var(--border-dim);
    transition: background 0.1s;
  }
  .mobile-nav a:last-child { border-right: none; }
  .mobile-nav a.active {
    color: var(--accent);
    background: rgba(192,138,46,0.10);
  }
  .mobile-nav .nav-icon { font-size: 1.25rem; line-height: 1; }
  .mobile-nav .nav-label { text-transform: uppercase; letter-spacing: 0.5px; }
}
</style>
```

Note: the old `#login-view` flex-centering and gradient background move into `Login.vue` itself in Task 4, since the login screen now owns its full-page layout.

- [ ] **Step 4: Manual verification**

- Desktop width: nav tabs should look like angled index-card dividers sitting on the toolbar, with the active tab shown in cream (`--label`) and bold.
- Mobile width (<767px): bottom nav shows the five line icons with brass highlighting the active one; no emoji anywhere.
- Log out button still works (click it, confirm it returns to the login screen).

- [ ] **Step 5: Commit**

```bash
git add client/src/App.vue
git commit -m "feat: restyle nav as index-card tabs with line icons"
```

---

## Task 4: Login screen rewrite

Full rewrite to fix the stale "Let Me Cook" branding and match the Larder identity — the login card becomes an instance of the `.label-card` signature motif.

**Files:**
- Modify: `client/src/views/Login.vue`

**Interfaces:**
- Consumes: `.label-card` utility from Task 1.
- Produces: none (leaf view).

- [ ] **Step 1: Replace the template**

Replace lines 1–19 with:

```html
<template>
  <div class="login-stage">
    <div class="login-card label-card">
      <h1 class="login-title">Pantry</h1>
      <p class="login-sub">Enter to see what's in stock</p>
      <form @submit.prevent="login">
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="login-input"
          autofocus
        />
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>
      </form>
      <p v-if="error" class="login-error">{{ error }}</p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Leave the `<script>` block as-is**

No logic changes — the existing `setup()` function (password/loading/error state, `login()`, emit `authenticated`) is unchanged.

- [ ] **Step 3: Replace the `<style scoped>` block**

```vue
<style scoped>
.login-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px);
  background-size: 7px 7px;
}

.login-card {
  width: 100%;
  max-width: 300px;
  padding: 32px 28px 28px;
}

.login-title {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 4px;
}

.login-sub {
  font-family: 'Special Elite', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-faint);
  text-align: center;
  margin-bottom: 22px;
}

.login-card form { display: flex; flex-direction: column; gap: 12px; }

.login-input {
  padding: 10px 12px;
  border: 1px solid var(--label-tab);
  background: #fbf6ea;
  color: var(--ink);
  font-family: 'Karla', sans-serif;
  font-size: 0.95rem;
  border-radius: 1px;
}
.login-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.login-btn {
  padding: 10px;
  background: var(--accent);
  color: var(--ink);
  border: none;
  font-family: 'Karla', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 1px;
}
.login-btn:hover:not(:disabled) { background: #d19a3c; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.login-error {
  color: var(--red-on-label);
  text-align: center;
  margin-top: 14px;
  font-size: 0.85rem;
}
</style>
```

- [ ] **Step 4: Manual verification**

- Log out, view the login screen: it should show a cream label card (with the die-cut tab at the top) titled "Pantry" on the warm dark background — no more "Let Me Cook", no more rounded grey card.
- Submit an incorrect password and confirm the error message displays in dark paprika text on the cream card.
- Tab to the input and button with the keyboard and confirm the brass focus outline appears.

- [ ] **Step 5: Commit**

```bash
git add client/src/views/Login.vue
git commit -m "feat: rebuild login screen as a Larder label card, fix stale branding"
```

---

## Task 5: Dashboard header and stats

Drops the pulsing-LED "SYSTEM STATUS" tech-console framing for a plain-language status line, and turns the stat blocks and recipe cards into label cards (validated in the brainstorming mockup).

**Files:**
- Modify: `client/src/components/DashboardHudHeader.vue`
- Modify: `client/src/components/StatBlock.vue`
- Modify: `client/src/views/Dashboard.vue`

**Interfaces:**
- Consumes: `.label-card` (Task 1), `--green-on-label` / `--red-on-label` (Task 1).
- Produces: `DashboardHudHeader` now expects `summary.statusLabel: String` in addition to its existing props (Dashboard.vue computes and passes it — see Step 3).

- [ ] **Step 1: Rewrite `DashboardHudHeader.vue`**

Replace the whole file:

```vue
<template>
  <div class="masthead">
    <div class="masthead-left">
      <div class="masthead-title">The Larder</div>
      <div class="masthead-date">{{ todayStr }}</div>
    </div>
    <div class="masthead-right" v-if="summary">
      <div class="status-line" :class="systemStatus.cls">{{ systemStatus.label }}</div>
      <div class="masthead-summary">
        {{ summary.totalIngredients }} ingredients &bull; {{ summary.totalRecipes }} recipes &bull; {{ summary.totalCooks }} cooks
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ todayStr: String, systemStatus: Object, summary: Object })
</script>

<style scoped>
.masthead {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; background: var(--panel); border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
}
.masthead-title { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 700; color: var(--text-bright); }
.masthead-date { font-family: 'Special Elite', monospace; font-size: 0.65rem; color: var(--text-faint); letter-spacing: 1px; margin-top: 3px; }
.masthead-right { text-align: right; }
.masthead-summary { font-family: 'Special Elite', monospace; font-size: 0.65rem; color: var(--text-faint); letter-spacing: 0.5px; margin-top: 4px; }
.status-line { font-family: 'Karla', sans-serif; font-size: 0.85rem; font-weight: 700; }
.status-line.nominal  { color: var(--green); }
.status-line.warning  { color: var(--yellow); }
.status-line.critical { color: var(--red); }
.status-line.offline  { color: var(--text-faint); }

@media (max-width: 767px) {
  .masthead { flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 14px; }
  .masthead-right { text-align: left; }
  .masthead-title { font-size: 1.1rem; }
}
</style>
```

- [ ] **Step 2: Rewrite `StatBlock.vue` as a label card**

Replace the whole file:

```vue
<template>
  <div class="stat-block label-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value" :style="{ color: color || 'var(--ink)' }">{{ value }}</div>
    <div class="stat-track" v-if="bar != null">
      <div class="stat-fill" :style="{ width: Math.max(2, bar) + '%', background: barColor }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [Number, String],
  color: String,
  bar: { type: Number, default: null },
  barColor: String
})
</script>

<style scoped>
.stat-block { flex: 1; padding: 12px 14px; margin: 0 6px; }
.stat-label { font-family: 'Special Elite', monospace; color: var(--text-faint); font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
.stat-value { font-family: 'Fraunces', serif; font-size: 1.7rem; font-weight: 700; line-height: 1; margin-bottom: 7px; }
.stat-track { height: 3px; background: var(--label-tab); }
.stat-fill { height: 100%; transition: width 0.6s ease; }

@media (max-width: 767px) {
  .stat-block { flex: 1 1 40%; margin: 4px; }
  .stat-value { font-size: 1.35rem; }
}
</style>
```

Note the `.stat-row` flex container in `Dashboard.vue` currently has class `panel` (a dark wood box) wrapping the individual `label-card` stat blocks — that's intentional: a wood tray holding several labels. That's handled in Step 3.

- [ ] **Step 3: Update `Dashboard.vue`**

Change the stat row wrapper (line 5) from:

```html
    <div class="stat-row panel" v-if="data">
```

to:

```html
    <div class="stat-row" v-if="data">
```

(The `panel` box-shadow/border reads oddly once each child is its own cream label sitting on the page background — the row is now just a flex layout container, styled via `.stat-row` in the `<style>` block below.)

Leave the "all clear" checkmark row (lines 17-19, `style="color:var(--green);gap:8px"`) unchanged — it sits inside the wood-colored `.panel`, not a cream label, so the plain `var(--green)` is already the correct shade.

Update the `stats` computed property (lines 84–96) to use the on-label color variants, since `StatBlock` is now a cream label card:

```js
const stats = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  const pctExpiring = s.totalIngredients > 0 ? (s.expiringCount / s.totalIngredients) * 100 : 0
  const pctReady = s.totalRecipes > 0 ? (s.readyCount / s.totalRecipes) * 100 : 0
  return [
    { label: 'Ingredients', value: s.totalIngredients },
    { label: 'Expiring', value: s.expiringCount, color: s.expiringCount > 0 ? 'var(--red-on-label)' : 'var(--green-on-label)', bar: pctExpiring, barColor: 'var(--red)' },
    { label: 'Recipes', value: s.totalRecipes },
    { label: 'Ready to Cook', value: s.readyCount, color: s.readyCount > 0 ? 'var(--green-on-label)' : 'var(--ink)', bar: pctReady, barColor: 'var(--green)' },
    { label: 'Total Cooks', value: s.totalCooks },
  ]
})
```

Update the `systemStatus` computed property (lines 75–82) to produce a plain-language `label`:

```js
const systemStatus = computed(() => {
  if (!data.value) return { label: 'Offline', cls: 'offline' }
  const hasCritical = data.value.expiringIngredients.some(i => daysUntil(i.expiration_date) <= 3)
  const hasWarning = data.value.expiringIngredients.some(i => daysUntil(i.expiration_date) <= 7)
  const expiringCount = data.value.expiringIngredients.length
  if (hasCritical) return { label: `${expiringCount} expiring soon`, cls: 'critical' }
  if (hasWarning) return { label: `${expiringCount} expiring soon`, cls: 'warning' }
  return { label: 'Well stocked', cls: 'nominal' }
})
```

Update the `<style scoped>` block (lines 106–122): change `.stat-row { display: flex; }` to `.stat-row { display: flex; margin: 0 -6px; }` (offsets the `StatBlock`'s own `margin: 0 6px` so the row still aligns with the panels below it), and remove the now-unused `.led` / `.led-pulse` / `@keyframes pulse-grey` rules (the loading state no longer needs a pulsing dot — see next paragraph).

Replace the loading state (line 47-49):

```html
    <div v-if="!data" class="loading-state">
      <span class="led led-pulse"></span> INITIALIZING SYSTEMS...
    </div>
```

with:

```html
    <div v-if="!data" class="loading-state">Loading…</div>
```

And simplify its style rule (was line 112):

```css
.loading-state { padding: 2rem; color: var(--text-faint); font-family: 'Special Elite', monospace; font-size: 0.85rem; }
```

- [ ] **Step 4: Manual verification**

- Dashboard header should read "The Larder" with today's date, and a plain-language status ("Well stocked" or "N expiring soon") instead of "SYSTEM NOMINAL" — no pulsing dot anywhere.
- The five stat blocks should render as cream label cards (with the small tab at the top) laid out in a row on the dark page background, each showing its number in Fraunces.
- Reload with devtools' reduced-motion emulation on and confirm the label cards appear without the scale/fade entrance animation.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/DashboardHudHeader.vue client/src/components/StatBlock.vue client/src/views/Dashboard.vue
git commit -m "feat: rebuild dashboard header and stats as plain-language Larder labels"
```

---

## Task 6: Recipe card label treatment

Turns the recipe-readiness cards on the dashboard (and reused wherever `RecipeCard` appears) into label cards, and removes the hardcoded hover color and Share Tech Mono font.

**Files:**
- Modify: `client/src/components/RecipeCard.vue`

**Interfaces:**
- Consumes: `.label-card` (Task 1), `--green-on-label` / `--red-on-label` (Task 1).

- [ ] **Step 1: Replace the whole file**

```vue
<template>
  <router-link
    :to="`/recipes/${recipe.id}`"
    class="recipe-card label-card"
  >
    <div class="rc-top-bar" :class="recipe.canCook ? 'ok' : 'nok'"></div>
    <div class="rc-name">{{ recipe.name }}</div>
    <div class="rc-date">{{ recipe.lastCookedAt || 'Never cooked' }}</div>
    <div class="rc-status" :class="recipe.canCook ? 'ok' : 'nok'">
      {{ recipe.canCook ? '● Ready to cook' : `○ Missing ${recipe.missingCount}` }}
    </div>
  </router-link>
</template>

<script setup>
defineProps({ recipe: Object })
</script>

<style scoped>
.recipe-card { display: block; text-decoration: none; overflow: hidden; }
.rc-top-bar { height: 3px; }
.rc-top-bar.ok  { background: var(--green); }
.rc-top-bar.nok { background: var(--red); }
.rc-name { padding: 10px 10px 2px; font-family: 'Fraunces', serif; font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-date { padding: 0 10px 4px; color: var(--text-faint); font-size: 0.67rem; }
.rc-status { padding: 4px 10px 10px; font-family: 'Special Elite', monospace; font-size: 0.67rem; letter-spacing: 0.5px; }
.rc-status.ok  { color: var(--green-on-label); }
.rc-status.nok { color: var(--red-on-label); }

@media (max-width: 767px) {
  .rc-name { font-size: 0.85rem; }
}
</style>
```

(The old `.rc-icon` element — a bare ▶/○ glyph above the name — is dropped; the ●/○ marker now lives inline in `.rc-status`, which is enough signal without a redundant second icon.)

- [ ] **Step 2: Manual verification**

On the Dashboard, "Recipe Readiness" section: each recipe should render as a cream label card with a colored top bar (sage if ready, paprika if not), the recipe name in Fraunces, and a typewriter-styled status line in a readable dark shade — not the old dark grey card with a monospace glowing status.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/RecipeCard.vue
git commit -m "feat: restyle recipe cards as Larder labels"
```

---

## Task 7: Expiry row cleanup

Removes the pulsing warning/critical LED animations (per the spec: no blinking status indicators in Larder) and the hardcoded monospace font.

**Files:**
- Modify: `client/src/components/ExpiryRow.vue`

- [ ] **Step 1: Edit the `<style scoped>` block**

Change:

```css
.led-green  { background: var(--green);  box-shadow: 0 0 4px var(--green); }
.led-yellow { background: var(--yellow); box-shadow: 0 0 4px var(--yellow); animation: pulse-yellow 1.5s ease-in-out infinite; }
.led-red    { background: var(--red);    box-shadow: 0 0 6px var(--red);    animation: pulse-red    0.8s ease-in-out infinite; }
.countdown { display: flex; flex-direction: column; align-items: center; min-width: 38px; font-family: 'Share Tech Mono', monospace; }
```

to:

```css
.led-green  { background: var(--green); }
.led-yellow { background: var(--yellow); }
.led-red    { background: var(--red); }
.countdown { display: flex; flex-direction: column; align-items: center; min-width: 38px; font-family: 'Special Elite', monospace; }
```

Remove the two now-unused `@keyframes pulse-yellow` / `@keyframes pulse-red` rules at the bottom of the file (lines 41-42).

- [ ] **Step 2: Manual verification**

On the Dashboard's "Expiring Soon" panel, ingredients expiring within 7 or 3 days should show a solid (not blinking) yellow/red dot and countdown number in the typewriter font.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ExpiryRow.vue
git commit -m "fix: remove pulsing status LEDs from expiry rows"
```

---

## Task 8: Hardcoded-color sweep in modals and step list

A handful of components hardcode dark-grey hex values (`#111`, `#1a1a1a`, `#2a2a2a`, `#1e1e14`) instead of reading a token, left over from the old theme. This task replaces them with the equivalent Larder tokens so nothing renders as a leftover grey box against the new warm palette.

**Files:**
- Modify: `client/src/components/StepList.vue`
- Modify: `client/src/components/RecipePickerModal.vue`
- Modify: `client/src/components/CookDeductModal.vue`
- Modify: `client/src/components/StepEditorList.vue`

- [ ] **Step 1: `StepList.vue`**

In the `<style scoped>` block, change:

```css
.progress-track { height: 7px; background: #111; border: 1px solid var(--border-dim); display: flex; gap: 2px; padding: 1px; }
```
to:
```css
.progress-track { height: 7px; background: var(--bg-mid); border: 1px solid var(--border-dim); display: flex; gap: 2px; padding: 1px; }
```

Change:
```css
.step-item.active { background: #1e1e14; border-left: 2px solid var(--accent); }
```
to:
```css
.step-item.active { background: var(--panel-alt); border-left: 2px solid var(--accent); }
```

Change both occurrences of `background: #111;` in `.step-check` and `.substep-check` to `background: var(--bg-mid);`.

- [ ] **Step 2: `RecipePickerModal.vue`**

Change:
```css
.input { background: #111; border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 8px 10px; width: 100%; }
```
to:
```css
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 8px 10px; width: 100%; }
```

Change:
```css
.picker-row:hover { background: #2a2a2a; border-color: var(--border); }
```
to:
```css
.picker-row:hover { background: var(--panel-alt); border-color: var(--border); }
```

- [ ] **Step 3: `CookDeductModal.vue`**

Change:
```css
.qty-input { background: #111; border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 5px 8px; width: 76px; }
```
to:
```css
.qty-input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.4); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 5px 8px; width: 76px; }
```

Change:
```css
.use-all:hover { background: #2e2e2e; color: var(--text); border-color: var(--border); }
```
to:
```css
.use-all:hover { background: var(--panel-alt); color: var(--text); border-color: var(--border); }
```

Also replace the `🍳 Log Cook` button label (search this file for `Log Cook` in the template) so it reads just `Log Cook` — remove the leading `🍳 ` emoji.

- [ ] **Step 4: `StepEditorList.vue`**

Change:
```css
.step-edit-block { background: #1a1a1a; border: 1px solid var(--border-dim); padding: 8px; }
```
to:
```css
.step-edit-block { background: var(--bg-mid); border: 1px solid var(--border-dim); padding: 8px; }
```

- [ ] **Step 5: Manual verification**

Open the recipe picker modal (Meal Planner → click an empty slot), the cook-deduction modal (Recipe detail → Log Cook), and the recipe editor's step editor (Recipes → open a recipe → Edit). None should show a plain grey/black box that clashes with the surrounding warm wood/cream UI.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/StepList.vue client/src/components/RecipePickerModal.vue client/src/components/CookDeductModal.vue client/src/components/StepEditorList.vue
git commit -m "fix: replace hardcoded grey colors with Larder tokens"
```

---

## Task 9: Recipe detail rework

Fixes the last hardcoded background color and the emoji-based "no photo" placeholder and action buttons.

**Files:**
- Modify: `client/src/views/RecipeDetail.vue`
- Modify: `client/src/components/RecipeStockBar.vue`

**Design note:** the spec describes the detail view's left panel as "recipe-card-styled." In practice, the ingredient list inside it is long and works better as a plain dashed-row list (matching the Ingredients page) rather than converting the whole scrolling panel to a cream label — so this task applies the label/paper treatment only to the "no photo" placeholder, and leaves the ingredient list on the wood/ink surface.

- [ ] **Step 1: Update the template's action buttons**

Change:
```html
          <button class="btn btn-sm" @click="showEdit = true">✎ Edit</button>
          <button class="btn btn-sm btn-green" @click="showCook = true">🍳 Log Cook</button>
```
to:
```html
          <button class="btn btn-sm" @click="showEdit = true">✎ Edit</button>
          <button class="btn btn-sm btn-green" @click="showCook = true">Log Cook</button>
```

- [ ] **Step 2: Replace the "no photo" placeholder**

Change:
```html
      <div class="photo-area">
        <div style="font-size:2.5rem;opacity:0.25">🍽</div>
        <div style="color:var(--text-faint);font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;margin-top:4px">No photo</div>
      </div>
```
to:
```html
      <div class="photo-area">
        <div class="photo-corner"></div>
        <div class="photo-caption">No photo yet</div>
      </div>
```

- [ ] **Step 3: Update the `<style scoped>` block**

Change:
```css
.photo-area {
  height: 130px; background: #181818; border-bottom: 1px solid var(--border-dim);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.015) 5px, rgba(255,255,255,0.015) 10px);
}
```
to:
```css
.photo-area {
  height: 130px; background: var(--panel-alt); border-bottom: 1px dashed var(--border-dim);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;
  position: relative;
}
.photo-corner {
  position: absolute; top: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 0 22px 22px 0;
  border-color: transparent var(--bg) transparent transparent;
}
.photo-caption {
  font-family: 'Special Elite', monospace;
  color: var(--text-faint); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;
}
```

(`.photo-corner` draws a small folded-corner triangle — like a torn index card — using the `border-color` trick, no image asset needed.)

- [ ] **Step 4: Update `RecipeStockBar.vue`**

Change:
```html
    <button class="btn btn-sm btn-green" @click="$emit('cook-clicked')" v-if="canCook">🍳 Log Cook</button>
```
to:
```html
    <button class="btn btn-sm btn-green" @click="$emit('cook-clicked')" v-if="canCook">Log Cook</button>
```

- [ ] **Step 5: Manual verification**

Open any recipe's detail page. The "no photo" area should show a small folded-corner shape instead of a plate emoji, with "No photo yet" underneath in the typewriter font. The Edit/Log Cook buttons should have no emoji.

- [ ] **Step 6: Commit**

```bash
git add client/src/views/RecipeDetail.vue client/src/components/RecipeStockBar.vue
git commit -m "fix: replace recipe-detail emoji with Larder-styled placeholder"
```

---

## Task 10: Cook Log and Recipes list polish

Applies the typewriter date/status styling to the two remaining list-style views. Most of their look already updates automatically from Task 1's token changes (dashed rows, warm colors); this task only touches the pieces that need an explicit font class.

**Files:**
- Modify: `client/src/views/CookLog.vue`
- Modify: `client/src/views/Recipes.vue`

- [ ] **Step 1: `CookLog.vue` — add a typewriter date class**

Change:
```html
        <div style="flex:1">{{ entry.cooked_at }}</div>
```
to:
```html
        <div style="flex:1" class="log-date">{{ entry.cooked_at }}</div>
```

Add to the `<style scoped>` block:
```css
.log-date { font-family: 'Special Elite', monospace; font-size: 0.8rem; color: var(--text-dim); }
```

- [ ] **Step 2: `Recipes.vue` — verify, no code change expected**

`Recipes.vue` only uses shared classes (`.trow`, `.panel`, `.btn`, `StockBadge`) — all already retokenized by Task 1 and Task 1's `.badge` font-family change. Open the Recipes list in the browser and confirm it looks correct (dashed rows, warm colors, typewriter-styled status badges). If anything still looks like a leftover from the old theme, note it and fix inline before moving on — but no changes are anticipated here.

- [ ] **Step 3: Manual verification**

Cook Log: dates should render in the typewriter font. Recipes list: status badges (Ready/Missing N) should be legible against the new palette.

- [ ] **Step 4: Commit**

```bash
git add client/src/views/CookLog.vue client/src/views/Recipes.vue
git commit -m "style: apply typewriter date styling to cook log"
```

(If Step 2 required no changes to `Recipes.vue`, drop it from the `git add` above.)

---

## Task 11: Meal Planner rework

Removes the lunch/dinner emoji and the metallic embossed-panel look from the day cells, replacing it with the plain wood-panel-with-labels treatment from the spec.

**Files:**
- Modify: `client/src/components/MealDayCell.vue`
- Modify: `client/src/components/MealSlot.vue`

- [ ] **Step 1: `MealDayCell.vue` — soften the embossed look**

Change:
```css
.day-cell { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo); border-radius: 2px; overflow: hidden; }
```
to:
```css
.day-cell { background: var(--panel); border: 1px solid var(--border-dim); border-radius: 2px; overflow: hidden; }
```

(Dropping the `box-shadow` bevel here — a flat wood panel reads better than a brushed-metal inset for this grid of cells; the bevel look is kept everywhere else via the shared `.panel` class.)

- [ ] **Step 2: `MealSlot.vue` — remove emoji, use a label card for filled slots**

Change:
```html
    <div class="slot-label">{{ mealType === 'lunch' ? '🍽' : '🌙' }} {{ mealType }}</div>
```
to:
```html
    <div class="slot-label">{{ mealType }}</div>
```

Change:
```html
      <div class="slot-filled">
```
to:
```html
      <div class="slot-filled label-card">
```

Update the `<style scoped>` block: change

```css
.slot-label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-faint); letter-spacing: 0.5px; font-weight: 600; }
```
to
```css
.slot-label { font-family: 'Special Elite', monospace; font-size: 0.7rem; text-transform: uppercase; color: var(--text-faint); letter-spacing: 1px; }
```

Change:
```css
.slot-filled { background: var(--panel-alt); border: 1px solid var(--border-dim); border-radius: 2px; padding: 10px; }
.slot-name { color: var(--green); font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; line-height: 1.4; }
```
to:
```css
.slot-filled { padding: 10px; }
.slot-name { font-family: 'Fraunces', serif; color: var(--ink); font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; line-height: 1.4; }
```

Leave `.slot-empty` (the dashed "+ Select" button) unchanged — it already uses tokens only and its dashed border now matches the Larder "tear line" language for free.

- [ ] **Step 3: Manual verification**

Open Meal Planner. Each day should be a flat wood panel; filled meal slots should render as small cream label cards with the recipe name in Fraunces; empty slots keep the dashed "+ Select" button. No emoji anywhere in the grid.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/MealDayCell.vue client/src/components/MealSlot.vue
git commit -m "feat: restyle meal planner slots as Larder labels"
```

---

## Task 12: Final verification pass

Confirms the handful of components expected to need zero direct changes (per the spec's "Expected to need little or no change" list) actually look correct now that all central tokens and bespoke components are done, and runs the backend test suite as a regression safety net.

**Files:** none expected — this task is verification-only, with fixes applied inline if something looks wrong.

- [ ] **Step 1: Visually check every remaining view/component at desktop and mobile widths**

Walk through: `Ingredients.vue` + `IngredientRow.vue`, `AppModal.vue` and every modal that uses it (`IngredientFormModal.vue`, `RecipeEditModal.vue`), `IngredientSearchDropdown.vue`, `UnitSelect.vue`, `StockBadge.vue`, `ExpiryBadge.vue`, `PageHeader.vue`, `IngredientEditorList.vue`. For each, confirm: warm palette (no leftover grey), dashed row dividers where applicable, typewriter font on badges, visible focus outline when tabbing through form fields.

If anything looks wrong, fix it inline in this task (it means a hardcoded value was missed — grep for it: `grep -rn "Share Tech Mono\|Titillium\|#[0-9a-fA-F]\{3,6\}" client/src --include="*.vue" | grep -v "styles/theme.css"` should return nothing at this point).

- [ ] **Step 2: Run the backend test suite**

```bash
npm test
```

Expected: all tests pass (this redesign touches no backend code, so this just confirms nothing was accidentally broken).

- [ ] **Step 3: Final visual sweep against `DESIGN.md`**

Re-read `DESIGN.md` top to bottom and confirm each documented rule holds across the live app: no accent color outside brass, no pulsing status indicators anywhere, every label-shaped surface uses `.label-card`, focus rings everywhere.

- [ ] **Step 4: Commit any inline fixes from Step 1**

```bash
git add -A
git commit -m "fix: address remaining Larder consistency gaps found in final pass"
```

(Skip this commit if Step 1 found nothing to fix.)

---

## Self-Review Notes

- **Spec coverage:** palette/type/signature element → Task 1; icons → Task 2; navigation → Task 3; login → Task 4; dashboard → Task 5; recipe cards → Task 6; expiry rows/motion → Task 7; hardcoded-color leftovers → Task 8; recipe detail → Task 9; cook log/recipes → Task 10; meal planner → Task 11; accessibility/contrast/full-app check → Tasks 1, 4, 5, 12. All "Direct rework needed" files from the spec's Scope section are covered.
- **Type consistency:** `--green-on-label` / `--red-on-label` are defined once in Task 1 and consumed identically (same names) in Tasks 5, 6, and 9's `login-error`. `Icon`'s `name` prop values (`home`, `jar`, `book`, `ribbon`, `calendar`) are defined in Task 2 and used with the same strings in Task 3.
- **Scope check:** confirmed CSS/markup only throughout; no task touches `server/` or route/API logic.
