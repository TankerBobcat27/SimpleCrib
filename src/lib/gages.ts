import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { calHistory, gages, type Gage } from "@/lib/db/schema";
import { dueBucket, endOfWeek, todayIso, type DueBucket } from "@/lib/dates";
import { listShopLocations } from "@/lib/locations";

export const GAGE_TYPES = [
  "Equipment",
  "Thread gage",
  "Micrometer",
  "Caliper",
  "Indicator",
  "Height gage",
  "Other",
] as const;

export const GAGE_STATUSES = ["available", "out_of_service"] as const;
export type GageStatus = (typeof GAGE_STATUSES)[number];
export type DueFilter = "all" | "overdue" | "this_week" | "due_soon" | "out";

export type GageFilters = {
  due?: DueFilter;
  q?: string;
  type?: string;
  status?: string;
  location?: string;
};

export function scopedTenant(tenantId: string) {
  return eq(gages.tenantId, tenantId);
}

export async function listGages(tenantId: string, filters: GageFilters = {}) {
  await ensureSchema();
  const conditions = [scopedTenant(tenantId)];

  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(gages.shopId, term),
        ilike(gages.name, term),
        ilike(gages.serial, term),
        ilike(gages.manufacturer, term),
        ilike(gages.location, term),
      )!,
    );
  }
  if (filters.type && filters.type !== "all") {
    conditions.push(eq(gages.type, filters.type));
  }
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(gages.status, filters.status));
  }
  if (filters.location && filters.location !== "all") {
    conditions.push(eq(gages.location, filters.location));
  }
  if (filters.due === "out") {
    conditions.push(eq(gages.status, "out_of_service"));
  }

  const rows = await db
    .select()
    .from(gages)
    .where(and(...conditions))
    .orderBy(asc(gages.nextDue), asc(gages.shopId));

  return rows.filter((gage) => matchesDueFilter(gage, filters.due));
}

export function matchesDueFilter(gage: Gage, filter?: DueFilter) {
  if (!filter || filter === "all") return true;
  if (filter === "out") return gage.status === "out_of_service";
  const bucket = dueBucket(gage.nextDue);
  if (filter === "overdue") return bucket === "overdue";
  if (filter === "this_week") return bucket === "this_week" || bucket === "overdue";
  if (filter === "due_soon") return bucket === "due_soon" || bucket === "this_week" || bucket === "overdue";
  return true;
}

export async function getGage(tenantId: string, id: string) {
  await ensureSchema();
  const rows = await db
    .select()
    .from(gages)
    .where(and(eq(gages.id, id), scopedTenant(tenantId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listGageHistory(tenantId: string, gageId: string) {
  await ensureSchema();
  return db
    .select()
    .from(calHistory)
    .where(and(eq(calHistory.tenantId, tenantId), eq(calHistory.gageId, gageId)))
    .orderBy(sql`${calHistory.calibratedAt} desc`);
}

export async function listLocations(tenantId: string) {
  return listShopLocations(tenantId);
}

export async function gageCounts(tenantId: string) {
  await ensureSchema();
  const rows = await db.select().from(gages).where(scopedTenant(tenantId));
  const now = new Date();
  const weekEnd = todayIso(endOfWeek(now));
  return {
    all: rows.length,
    overdue: rows.filter((gage) => dueBucket(gage.nextDue, now) === "overdue").length,
    thisWeek: rows.filter((gage) => {
      const bucket = dueBucket(gage.nextDue, now);
      return bucket === "this_week" || bucket === "overdue";
    }).length,
    dueSoon: rows.filter((gage) => {
      const bucket = dueBucket(gage.nextDue, now);
      return bucket === "due_soon" || bucket === "this_week" || bucket === "overdue";
    }).length,
    out: rows.filter((gage) => gage.status === "out_of_service").length,
    weekEnd,
  };
}

export function summarizeBuckets(items: Gage[]) {
  const counts: Record<DueBucket | "out", number> = {
    overdue: 0,
    this_week: 0,
    due_soon: 0,
    current: 0,
    missing: 0,
    out: 0,
  };
  for (const item of items) {
    counts[dueBucket(item.nextDue)] += 1;
    if (item.status === "out_of_service") counts.out += 1;
  }
  return counts;
}
