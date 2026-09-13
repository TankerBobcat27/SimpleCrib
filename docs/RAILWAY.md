# Deploy on Railway

One Next.js web service plus a Postgres service. Do **not** attach this to the existing `layke-qms-documents` project. The customer-facing name lives in `src/lib/brand.ts` and is a working title only.

## One-time project setup

1. Create a Railway project named `shopcal`.
2. Add Postgres from Railway's Postgres template (or image `ghcr.io/railwayapp-templates/postgres-ssl:17`).
3. Attach a volume to Postgres at `/var/lib/postgresql/data`.
4. Set on **Postgres**:
   - `POSTGRES_USER=postgres`
   - `POSTGRES_PASSWORD=<strong>`
   - `POSTGRES_DB=shopcal`
   - `PGDATA=/var/lib/postgresql/data/pgdata`
5. Create an empty **web** service.
6. Deploy this repo with the included `Dockerfile` / `railway.toml`.
   - From a machine with Railway CLI: `railway up --service web`
   - Or connect a GitHub fork of this repo to the web service.
7. Generate a Railway domain on **web**.
8. Set on **web**:

```
DATABASE_URL=postgresql://${{Postgres.POSTGRES_USER}}:${{Postgres.POSTGRES_PASSWORD}}@${{Postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/${{Postgres.POSTGRES_DB}}
BETTER_AUTH_SECRET=<32+ random chars>
BETTER_AUTH_URL=https://<your-service>.up.railway.app
NEXT_PUBLIC_APP_URL=https://<your-service>.up.railway.app
```

9. The container runs `tsx scripts/migrate.ts` then `tsx scripts/seed.ts` then `next start`. Seed is idempotent and only inserts the SAMPLE demo shop if missing.
10. Enable **Daily** volume backups on Postgres (see `docs/BACKUPS.md`).

## Local

```bash
# Postgres 16 on localhost, role shopcal / shopcal_dev_local, db shopcal
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://127.0.0.1:43147

## Blockers

- This Origin git remote is not a GitHub repo, so Railway cannot auto-deploy from `connect-service-source` with `owner/repo`. Use `railway up` or a GitHub mirror.
- Railway CLI may be missing in the cloud agent image; MCP can create services and variables but not always a source deploy.
