# ShopCal — Calibration Tracker (Week 1)

Multi-tenant gage / cal due board for US machine shops (1–40 people). One shared Next.js app + Postgres. Every query is scoped by `tenant_id`.

**Positioning:** faster than Excel and the clipboard, with hosted daily backups. Not ERP, ProShop, CRIBWISE, or eQMS.

**Your data is backed up daily; export anytime.**

This repo does **not** touch Layke here.now apps (Toolcrib, Calibration, Queue, Command Center). Demo inventory is SAMPLE gages only.

## Demo login

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.shopcal.test` | `DemoAdmin!2026` |
| Quality | `quality@demo.shopcal.test` | `DemoQuality!2026` |
| Operator (read + status) | `operator@demo.shopcal.test` | `DemoOperator!2026` |

Tenant path: `/t/demo` · shop name: **Midwest Precision (Demo)**

Local URL: http://127.0.0.1:43147

Railway URL: see **Demo URL** at the bottom of this file after deploy. If it still says *not live*, the app runs locally and Railway services exist but the web image has not been published yet.

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
- Inventory list, due board, add, edit
- Available / Out of service
- Due filters: all, overdue, this week, due soon (30d), out of service
- Admin **Due this week** inbox
- CSV import / export

## Backups

Daily Railway volume backups on the Postgres volume. Details, plan/storage baseline, and restore-drill status: [`docs/BACKUPS.md`](docs/BACKUPS.md). Deploy steps: [`docs/RAILWAY.md`](docs/RAILWAY.md).

## Demo URL

- Local: http://127.0.0.1:43147
- Railway: *not live yet — project `shopcal` + Postgres created; web deploy blocked until `railway up` or a GitHub source is connected. See docs/RAILWAY.md.*
