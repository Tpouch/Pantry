# CLAUDE.md

This document defines the development rules for this project. It applies to all code generated or modified by Claude. Stack: Node.js + Express + SQLite (better-sqlite3) on the backend, Vue 3 + Vue Router + Vite on the frontend.

Important specific context: this project uses a **single shared password** (no user accounts, no per-identity sessions) to protect access, and it is **publicly exposed on the internet**. The security rules below are written for this exact model, not for a classic multi-user system. Do not add RBAC, multi-user JWT, or account management without an explicit request: that would be unjustified complexity (a KISS violation).

---

## 1. Cross-cutting principles (SOLID + KISS)

These principles apply to both the backend and the frontend.

### KISS (default priority on this project)

- No anticipated abstraction for a need that doesn't exist yet. A single route that does one thing stays a simple function, not a Repository pattern.
- No extra layer (service layer, DTO, mapper) unless the business logic genuinely justifies it.
- On this specific project (personal, side project, single secret), KISS wins over SOLID when they conflict. SOLID remains the reference for structuring code, but should never add complexity to a simple module just to "look clean."

### SOLID, applied with judgment

- **S (Single Responsibility)**: each Express module (route, middleware, DB access) has one reason to change. A route handler should not mix raw SQL logic with validation and response formatting: split at minimum into route / logic / data access once the handler exceeds ~20 lines.
- **O (Open/Closed)**: prefer composing Express middlewares over modifying existing ones to add behavior.
- **L (Liskov)**: not very relevant in JS/Vue without a strong class hierarchy, don't force this principle artificially.
- **I (Interface Segregation)**: on the Vue side, a component should only receive the props it actually needs, never a full object "just in case."
- **D (Dependency Inversion)**: SQLite access must be isolated in a dedicated module (e.g. `db/`), never instantiated directly inside routes. This makes it easy to mock in tests and to swap the implementation without touching routes.

---

## 2. Backend: Node.js + Express + better-sqlite3

### Structure

- Split into `routes/`, `db/` (or `repositories/`), `middlewares/`, `config/`. No single `index.js` file doing everything beyond a quick prototype.
- `better-sqlite3` is synchronous: never wrap it artificially in unnecessary Promises, that adds complexity with no real benefit (KISS violation). The synchronous API is a deliberate choice of the library, not a problem to fix.
- A single DB connection file, exported and reused (simple singleton pattern), never a new connection per request.

### SQL queries

- **Always** use parameterized prepared statements (`db.prepare(...).run(...)` / `.get(...)` / `.all(...)`). Never concatenate strings into a SQL query, even for a value that seems "safe" (e.g. a numeric ID). This is the single most important rule in this whole document: one exception anywhere in the code is enough to make the app vulnerable to SQL injection.
- Enable `PRAGMA foreign_keys = ON` at startup if the schema uses foreign keys.
- Never trust a value coming from the frontend (query params, body, headers) without prior validation, even internally.

### Input validation

- Systematically validate `req.body`, `req.params`, `req.query` before using them, with a schema library (`zod` recommended, lightweight and TypeScript-friendly) rather than scattered manual `if` checks.
- Explicitly reject (400) any request that doesn't match the expected schema, never silently "fix" a malformed input.

### Error handling

- Centralized Express error middleware (the last `app.use((err, req, res, next) => ...)`), no duplicated error handling in every route.
- Never return the raw stack trace or error message to the client in production. Log server-side, return a generic message client-side.
- Distinguish expected errors (validation, 404) from unexpected ones (bugs, 500) in logging.

---

## 3. Frontend: Vue 3 + Vue Router + Vite

### Structure and style

- Composition API with `<script setup>` by default, no Options API unless there's a specific need.
- Strongly favor small, single-purpose components over large multi-concern ones. Each component should do one clear thing: displaying a list item, a form field, a modal, a status badge, etc. If a component starts handling more than one distinct UI responsibility (e.g. rendering data AND managing a form AND handling a modal), split it into smaller components rather than growing it. This is a deliberate project-wide preference, not just a size threshold: prefer composing several small components even when a single larger one would technically still be "readable."
- As a rough guardrail, if a component exceeds ~150-200 lines or mixes several distinct UI concerns, split it. But the target is single responsibility per component, not just line count. A 40-line component doing three unrelated things should still be split.
- Reusable logic (fetching, formatting, shared state) extracted into composables (`useXxx.js`), never duplicated across components.
- Explicitly typed props (with TypeScript if the project uses it, otherwise `props: { x: { type: String, required: true } }`), never implicit undeclared props.

### Communication with the backend

- Centralize HTTP calls in a dedicated module (e.g. `api/client.js`), no `fetch` or `axios` scattered across components. This keeps headers, timeouts, and network error handling in one place.
- Never trust data received from the API without treating it as potentially hostile before injecting it into the DOM (see XSS section below).

### Routing

- Vue Router: any route that must be protected by the shared password should check auth state via a global `beforeEach` guard, not a repeated check in every view component.

---

## 4. Cybersecurity, priority on this project given the context (single secret + public exposure)

### 4.1 Protecting the shared password (mandatory rule, not optional)

The password must never be stored or compared in plain text, even in `.env`. This is the single most critical point of this project given its public exposure.

- Store only a **hash** of the password (argon2id recommended, otherwise bcrypt with a minimum cost of 12), never the plain value, even as an environment variable.
- Compare using a **constant-time** comparison function provided by the hashing library itself (e.g. `argon2.verify()`), never `===` or a plain string comparison, which exposes a timing attack.
- The hash itself stays in an environment variable or config file outside the Git repo, never hardcoded in the codebase.
- Add **strict rate limiting** on the password verification endpoint (e.g. `express-rate-limit`), typically a few attempts per minute per IP. Without this, a single password exposed publicly can be brute-forced continuously.
- Consider a small artificial delay or progressive lockout after several failed attempts, in addition to network-level rate limiting.

### 4.2 Session / access after authentication

- Once the password is validated, use an `httpOnly`, `secure`, `sameSite: strict` (or at minimum `lax`) session cookie, not a token stored in `localStorage` (vulnerable to XSS, unlike an httpOnly cookie).
- Reasonable session expiration, no infinite session.
- The session signing secret must be long, randomly generated, stored as an environment variable, never hardcoded.

### 4.3 Headers and transport

- HTTPS mandatory in production (via reverse proxy, consistent with a typical Nginx Proxy Manager setup).
- Use `helmet` on Express for baseline security headers (CSP, HSTS, X-Content-Type-Options, etc.) rather than configuring them manually one by one.
- CORS configured explicitly with an origin whitelist, never `origin: '*'` if the API serves an authenticated frontend.

### 4.4 Injections and validation

- SQL injection: covered in section 2, this is the non-negotiable rule.
- XSS: Vue escapes content by default via `{{ }}`, but any use of `v-html` must be justified and the value passed must be sanitized (`DOMPurify`) if it comes from an external or user-provided source.
- Strict input validation on the backend (see section 2), even if the frontend already validates: the frontend is never a reliable security boundary, it can always be bypassed by calling the API directly.

### 4.5 Dependencies and attack surface

- Regular `npm audit`, fix critical/high vulnerabilities promptly.
- Keep the number of dependencies limited, every added package is an additional attack surface (consistent with KISS).
- Never expose a debug, introspection, or API documentation route (Swagger, etc.) in production without protection.

### 4.6 Secrets and configuration

- No secret (password hash, session signing key, third-party API key) ever committed to Git, including in history. Use `.env` + `.gitignore`, and check that no secret was accidentally committed before any public push.
- Environment variables validated at app startup (explicit failure if a required variable is missing), rather than a silent crash or a dangerous default behavior later.

---

## 5. What Claude must systematically check before proposing code on this project

1. Is every SQL query parameterized?
2. Is every user input (body, params, query) validated before use?
3. Is the password treated as a hashed secret, never in plain text, with constant-time comparison?
4. Is there a risk of timing attack, XSS via `v-html`, or a secret exposed on the frontend?
5. Is the added complexity justified by a real project need, or is it unnecessary anticipation (KISS)?
6. On the frontend, is each component doing exactly one thing, or should it be split into smaller single-purpose components?