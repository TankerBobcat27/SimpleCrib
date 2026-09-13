# SimpleCrib — Calibration + Toolcrib

Brand is **SimpleCrib** (simplecrib.com). UI strings come from `src/lib/brand.ts`.

Multi-tenant gage / cal due board for US machine shops (1–40 people). One shared Next.js app + Postgres. Every query is scoped by `tenant_id`.

**Positioning:** built for small US machine shops. Faster than Excel and the clipboard, with hosted daily backups.

**Your data is backed up daily; export anytime.**

This repo does **not** touch Layke here.now apps (Toolcrib, Calibration, Queue, Command Center). Demo inventory is SAMPLE gages only.

## Demo login

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.shopcal.test` | `DemoAdmin!2026` |
| Quality | `quality@demo.shopcal.test` | `DemoQuality!2026` |
| Operator (read + status) | `operator@demo.shopcal.test` | `DemoOperator!2026` |

Tenant path: `/t/demo` · Toolcrib: `/t/demo/toolcrib` · shop name: **Midwest Precision (Demo)**

Local URL: http://127.0.0.1:43147

Reserved Railway domain (web not deployed yet): https://web-production-a0981.up.railway.app

## Stack

- Next.js 16 App Router, TypeScript, Tailwind v4, shadcn-style primitives
- Postgres + Drizzle ORM
- better-auth email/password (`admin`, `quality`, `operator`)
- Path-based tenants (`/t/[slug]`), subdomain-ready via `tenant_slug` on the session
- Railway: web Dockerfile + Postgres volume

## Run locally

Postgres 16 on localhost, database `shopcal`, role `shopcal` / `shopcal_dev_local`.

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://127.0.0.1:43147 and sign in with the admin demo user.

## Week 1 screens

- Marketing + placeholder pricing: Calibration **$39** · Toolcrib **$39** · Pro both **$75** (Stripe is Week 2)
- Live Toolcrib: `/t/[slug]/toolcrib` — qty checkout + return, location chips, SAMPLE demo tools
- Public Toolcrib SAMPLE preview: `/toolcrib-demo`
- Inventory list, due board, add, edit
- Available / Out of service
- Due filters: all, overdue, this week, due soon (30d), out of service
- Admin **Due this week** inbox
- CSV import / export

## Backups

Daily Railway volume backups on the Postgres volume. Details, plan/storage baseline, and restore-drill status: [`docs/BACKUPS.md`](docs/BACKUPS.md). Deploy steps: [`docs/RAILWAY.md`](docs/RAILWAY.md).

## Demo URL

- **Working now:** http://127.0.0.1:43147 (this environment)
- **Railway host:** project `shopcal` in workspace tankerbobcat27 — Postgres is up (5 GB volume, Daily backups on), SAMPLE demo tenant seeded. Reserved domain: https://web-production-a0981.up.railway.app
- **Web deploy blocked:** Origin git is not GitHub, so Railway cannot auto-build from the repo. Railway CLI is installed here but not logged in (`railway login --browserless` then `railway up --service web`). Dockerfile + `railway.toml` are in the repo.
