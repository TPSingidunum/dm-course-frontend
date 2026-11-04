# dm-course-frontend — Nuxt store for the "Digital Marketing & ML" course

The frontend of the demo store from the **Digital Marketing and Machine Learning** course (12 days).
It is a standalone Nuxt application: a catalog, a cart, event tracking and an admin panel for the
ML features (segmentation, conversion, campaigns, recommendations, AI content).
Everything it needs runs from this repository: a local MariaDB (docker compose) with demo data and
product images. An external ML API is optional (`NUXT_ML_API_URL`); without it the store shows
default content and clear "ML API is unavailable" notices, and tracking keeps working.

![Homepage](docs/screenshots/home.png)

## Tech stack

| Layer | Tool |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, file-based routing, Nitro server) |
| Runtime / package manager | [Bun](https://bun.sh) (Nitro preset `bun`) |
| UI | [@nuxt/ui](https://ui.nuxt.com) 4, @nuxt/image, Tailwind (via Nuxt UI) |
| Database | MariaDB / MySQL via [Drizzle ORM](https://orm.drizzle.team) + `mysql2` |
| Validation | zod |
| ML API | optional external ML API on `:3001`, proxied through `/ml/**` |

## Structure

```
app/                      # everything that runs in the browser (Vue)
  pages/                  # routes (file-based routing)
    index.vue             #   /                — homepage with marketing modules (Day 12)
    shop/index.vue        #   /shop            — catalog, personalized "For you" ordering (Day 8)
    product/[slug].vue    #   /product/:slug   — detail + recommendations: content (5), collaborative (6),
                          #                      session (9), semantic (10), AI description (11/12)
    category/             #   /category, /category/:slug
    search.vue            #   /search?q=       — semantic search (Day 10)
    admin/                #   admin panel (layout admin.vue)
      event/              #     events from the database (Day 1 — event tracking)
      segments/           #     RFM / k-means segments (Day 2)
      conversion/         #     conversion prediction (Day 3)
      campaigns/          #     campaign targeting, rule vs ML (Day 4)
      recommendations/    #     recommendation evaluation + CTR (Days 7, 9), hybrid.vue (Day 8)
      ai/                 #     SEO/description generation (Day 11)
      marketing/          #     marketing modules (Day 12)
      product/, category/ #     classic CRUD over the database
  components/             # rec/Section.vue (recommendation cards), MlUnavailable.vue, Delete dialogs
  composables/
    trackEvent.ts         # trackEvent(): 8 event types → POST /api/event/track (Day 1)
    useMl.ts              # mlGet/mlPost (error → null, the page never crashes), catalog, formatPrice
  layouts/                # default.vue (store), admin.vue (sidebar)
  types/                  # TS types Product, Category
server/                   # Nitro (runs on the server)
  api/                    # REST: /api/shop, /api/product/*, /api/category/*, /api/event/*
  database/
    connection.ts         # mysql2 pool + Drizzle (DB_* env)
    schemas/*.schema.ts   # Drizzle schemas: product, category, seo, event, user
  routes/ml/[...path].ts  # proxy /ml/** → ML API (NUXT_ML_API_URL)
  utils/                  # dbHandler (503 when the DB is down), ml.ts (event forwarding), productWithSeo
db/                       # schema.sql + seed.sql (synthetic data: 12 categories, 252 products, 500 events)
docker-compose.yml        # local MariaDB on 127.0.0.1:3307
scripts/smoke.py          # end-to-end test (Playwright)
docs/screenshots/         # images for this README
```

## Running it

Prerequisites:

| Tool | Version | Notes |
|---|---|---|
| Bun | **≥ 1.3** (recommended **1.4.2**, pinned in `packageManager`) | Bun < 1.4 cannot read the `bun.lock` format and re-resolves; Bun < 1.3 fails |
| Node.js | optional — not needed by the scripts | if you run `nuxt` directly with Node, use `^22.22.3`, `^24.15.0` or `>=26` |
| Docker | any recent | for the local database |
| Python | 3.11+ (optional) | for `scripts/smoke.py` (Playwright) |

All scripts (`dev`, `build`, `postinstall`, …) run with `bun --bun`, so they use the Bun runtime instead of whatever Node is on your `PATH`.

```bash
cp .env.example .env          # optional; the defaults work without a .env
docker compose up -d          # MariaDB with schema and seed data (127.0.0.1:3307)
bun install --frozen-lockfile   # or plain `bun install`
bun run dev                   # http://localhost:3000
```

Production build: `bun run build && bun .output/server/index.mjs`.

Lint and type check: `bun run lint` (ESLint 10 via `@nuxt/eslint`) and `bun run typecheck` (vue-tsc on the app and server code). Both pass with zero problems; the code has no `any` types.

### Troubleshooting `bun install`

**Symptom:** `bun install` fails at the end with
`SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`
(or `parseEnv`) followed by `error: postinstall script from "dm-frontend" exited with 1`.

**Cause:** the `postinstall` script (`nuxt prepare`) used to run through the `nuxt` binary's
`#!/usr/bin/env node` shebang, i.e. with your **system Node.js**. Current Nuxt 4 releases require
Node 22.22+/24.15+, so an older Node (18/20) crashes. It showed up when the lockfile was missing or
ignored (deleted `bun.lock`, or an old Bun that can't read it) and the loose `^4.2.0` range pulled the newest Nuxt.

**Fix (already applied):** scripts now run as `bun --bun nuxt …`, so Node's version no longer matters;
`engines` and `packageManager` document the versions, and `bun.lock` was regenerated.
If it still fails:

```bash
bun upgrade                     # get Bun >= 1.4
rm -rf node_modules .nuxt       # keep bun.lock
bun install --frozen-lockfile
```

The warning about blocked postinstalls for `@parcel/watcher` / `unrs-resolver` is harmless.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `NUXT_ML_API_URL` | `http://127.0.0.1:3001` | base URL of the ML API (runtime, no rebuild needed) |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / `3307` | local MariaDB |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `dm_local` | fake local demo credentials — never a real database |
| `PORT` | `3000` | port of the production server |

### Database

On first start, `docker compose up -d` loads `db/schema.sql` and `db/seed.sql`.
Reset to the initial state: `docker compose down -v && docker compose up -d`.
Without Docker: create a `dm_local` database and user in any local MariaDB/MySQL 8, run
`mysql -udm_local -p dm_local < db/schema.sql && mysql -udm_local -p dm_local < db/seed.sql`, then set `DB_*`.

If the database is not running, `/api/*` returns **503 "Database unavailable"** with instructions instead of crashing the server.

## How the frontend talks to the ML API

```
Browser ──/ml/segments──▶ Nuxt (server/routes/ml/[...path].ts) ──▶ ML API :3001/segments
Browser ──POST /api/event/track──▶ Nuxt ──▶ insert into MariaDB (event) ──▶ forward to ML API /events (best-effort)
```

* All ML pages call `/ml/...` (same origin, no CORS); the server forwards them to `NUXT_ML_API_URL`.
* If ML API is down, the proxy returns **502**; `useMl()` returns `null` and pages show default content
  or a "ML API is unavailable" notice — the store and tracking keep working.
* The ML API is optional. Point `NUXT_ML_API_URL` at any compatible ML service (default
  `http://127.0.0.1:3001`) to enable the ML pages; no rebuild is needed.
* The demo user is `user_id = 395` (`DEMO_USER_ID` in `trackEvent.ts`); the session is stored in `localStorage`.

## Tests

```bash
bun run build
python3 scripts/smoke.py   # needs Playwright; ML checks run only if an ML API answers on :3001 (42 checks with it)
```

## Screenshots

| Store | Product + recommendations | Admin: events |
|---|---|---|
| ![shop](docs/screenshots/shop.png) | ![product](docs/screenshots/product.png) | ![events](docs/screenshots/admin-event.png) |

Product images are not part of the repo (the seed only contains paths), so empty frames are shown.

## License

[MIT](LICENSE) © 2026 Teodor Petrović
