# Pantry

A personal recipe and ingredient management app with a Factorio-inspired UI.

## Stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** Vue 3 + Vue Router + Vite

## Getting started

```bash
pnpm install
cd server && pnpm install
cd ../client && pnpm install
```

### Environment setup

Copy `.env.example` to `.env` and set your password:

```bash
cp .env.example .env
# Edit .env and set SITE_PASSWORD to your desired password
```

```bash
# Dev mode — Express on :3000, Vite on :5173
pnpm run dev

# Production build + start — everything on :3000
pnpm run build
NODE_ENV=production pnpm start
```

## Features

- **Ingredients** — track stock quantities, units, categories, and expiry dates
- **Recipes** — link ingredients with required quantities; see at a glance if you have everything in stock
- **Cook Log** — log a cook session, deduct ingredient quantities from stock
- **Dashboard** — overview of stock stats, expiring items, and recent dishes

## Authentication

The site is password-protected. When you first access it, you'll be prompted to enter the password configured in your `.env` file (`SITE_PASSWORD`).

Once authenticated, a session cookie is stored in your browser so you don't need to log in every time. The session lasts 7 days by default. You can log out using the logout button in the top right corner.

