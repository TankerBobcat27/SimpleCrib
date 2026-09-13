import { and, eq, sql } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { gages, shopLocations } from "@/lib/db/schema";

export const DEFAULT_SHOP_LOCATION = "Quality Lab";
export const DEFAULT_SHOP_LOCATIONS = ["Quality Lab", "Crib"] as const;

export function normalizeLocationName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 80);
}

function newLocationId() {
  return `loc_${crypto.randomUUID()}`;
}

export async function listShopLocations(tenantId: string) {
  await ensureSchema();
  const [catalog, used] = await Promise.all([
    db
      .select({ name: shopLocations.name })
      .from(shopLocations)
      .where(eq(shopLocations.tenantId, tenantId)),
    db
      .selectDistinct({ name: gages.location })
      .from(gages)
      .where(eq(gages.tenantId, tenantId)),
  ]);

  const names = new Set<string>();
  for (const row of catalog) {
    if (row.name) names.add(row.name);
  }
  for (const row of used) {
    if (row.name) names.add(row.name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

export async function rememberShopLocation(tenantId: string, rawName: string) {
  await ensureSchema();
  const name = normalizeLocationName(rawName);
  if (!name) return DEFAULT_SHOP_LOCATION;

  const existing = await db
    .select({ name: shopLocations.name })
    .from(shopLocations)
    .where(and(eq(shopLocations.tenantId, tenantId), sql`lower(${shopLocations.name}) = ${name.toLowerCase()}`))
    .limit(1);

  if (existing[0]) return existing[0].name;

  try {
    await db.insert(shopLocations).values({
      id: newLocationId(),
      tenantId,
      name,
    });
    return name;
  } catch {
    const raced = await db
      .select({ name: shopLocations.name })
      .from(shopLocations)
      .where(and(eq(shopLocations.tenantId, tenantId), sql`lower(${shopLocations.name}) = ${name.toLowerCase()}`))
      .limit(1);
    return raced[0]?.name ?? name;
  }
}

export async function seedDefaultShopLocations(tenantId: string, extras: readonly string[] = []) {
  const names = [...DEFAULT_SHOP_LOCATIONS, ...extras];
  const unique = [...new Set(names.map(normalizeLocationName).filter(Boolean))];
  for (const name of unique) {
    await rememberShopLocation(tenantId, name);
  }
}
