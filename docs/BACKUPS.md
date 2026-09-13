# ShopCal backups (Week 1)

Customer-facing copy in the app:

> Your data is backed up daily; export anytime.

## What is backed up

| Layer | What it covers | Where |
| --- | --- | --- |
| Railway volume backups | Entire Postgres data directory | Volume `postgres-data` on service `Postgres` in project `shopcal` |
| CSV export | Tenant-scoped gage list | In-app **CSV** screen or `GET /api/export?slug=demo` |

This is **not** a Layke here.now Site Data backup. ShopCal is a separate multi-tenant app.

## Railway plan / storage baseline (Week 1)

- Host: Railway project `shopcal` (workspace: personal).
- Postgres image: `ghcr.io/railwayapp-templates/postgres-ssl:17`.
- Volume: `postgres-data` mounted at `/var/lib/postgresql/data`.
- Default volume size on Railway is **5 GB** unless grown. Week 1 shops (1–40 people, hundreds of gages) stay well under that.
- Volume backups are incremental copy-on-write. Railway bills the **incremental** snapshot size at the same GB/min rate as volumes. See [Railway volume backups](https://docs.railway.com/volumes/backups) and [pricing](https://docs.railway.com/pricing/plans#resource-usage-pricing).
- Trial / Hobby accounts can create volume backups; keep Daily enabled so a 6-day rolling window exists. Add Weekly (27 days) before first paid customer.

## Enable the daily schedule

In the Railway dashboard:

1. Open project **shopcal** → service **Postgres**.
2. Open the **Backups** tab.
3. Enable **Daily** (every 24 hours, retained 6 days).
4. Optionally enable **Weekly** and **Monthly**.

CLI (after `railway link` to this project):

```bash
railway postgres backup schedule --help
```

Railway documents schedule management at [CLI postgres backups](https://docs.railway.com/cli/postgres#manage-backup-schedules).

If the Backups tab is missing, the volume is not attached. Re-attach `postgres-data` to `/var/lib/postgresql/data` and redeploy.

## Restore drill (Week 1)

**Daily schedule:** Enabled 2026-09-13 on volume `postgres-data` (5 GB) via Railway agent (`updateVolume` + commit). Official docs: Daily kept 6 days.

**Restore drill:** A full click-restore (Backups → Restore → staged volume → Deploy) was **not executed** in this session because:

- Restoring overwrites the live volume mount and requires a human confirm on the project canvas.
- There is no isolated `staging` environment yet (only `production` exists).
- Creating a backup via API/CLI was not available without the Railway CLI being logged in on this machine.

**What to do on first staging env (Week 1 leftover):**

1. Duplicate the project environment as `staging` or take a **manual backup** of `postgres-data`.
2. Insert a canary row in staging (`SHOP-RESTORE-DRILL`).
3. Restore the backup from *before* the canary.
4. Confirm the canary is gone and SAMPLE demo gages remain.
5. Record the backup timestamp and who ran the drill here.

Until that drill is run, treat CSV export as the shop-owned recovery path and Railway Daily as the host-owned path.

## Offsite option (optional)

Railway also documents a cron service that `pg_dump`s to object storage: [Back up and restore Postgres](https://docs.railway.com/guides/postgres-backups-restores). Not required for Week 1 if Daily volume backups are on.
