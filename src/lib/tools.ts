import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { DEMO_TENANT_ID, SAMPLE_TOOLS } from "@/lib/demo-inventory";
import { db, ensureSchema } from "@/lib/db";
import { toolLocations, toolMoves, tools, type Tool, type ToolMove } from "@/lib/db/schema";

export const MAX_TOOL_LOCATIONS = 5;
export const DEFAULT_CRIB_LOCATION = "Crib A";

export const TOOL_TYPES = [
  "End mill",
  "Insert",
  "Tool holder",
  "Drill",
  "Tap",
  "Collet",
  "Face mill",
  "Setup",
  "Other",
] as const;

export const SUGGESTED_DESTINATIONS = [
  "Crib A",
  "Crib B",
  "Haas VF-2",
  "Doosan Lynx",
  "DMU75",
  "Bench",
  "Tool cart",
  "Incoming",
] as const;

export type LocationSplit = { name: string; qty: number };
export type MoveIntent = "checkout" | "checkin";
export type MoveError = "missing" | "qty" | "same" | "source" | "stock" | "locations" | "not-found";

export type ToolWithLocations = Tool & {
  locations: LocationSplit[];
  totalQty: number;
};

export type ToolFilters = {
  q?: string;
  type?: string;
  location?: string;
};

export function normalizeLocation(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isCribLocation(name: string) {
  return /^crib\b/i.test(normalizeLocation(name));
}

export function sortLocations(locations: LocationSplit[]) {
  return [...locations].sort((a, b) => {
    const cribDiff = Number(isCribLocation(b.name)) - Number(isCribLocation(a.name));
    if (cribDiff !== 0) return cribDiff;
    return a.name.localeCompare(b.name);
  });
}

export function applyLocationMove(
  locations: LocationSplit[],
  from: string,
  to: string,
  qty: number,
): { ok: true; locations: LocationSplit[] } | { ok: false; error: MoveError } {
  const sourceName = normalizeLocation(from);
  const destName = normalizeLocation(to);
  if (!sourceName || !destName) {
    return { ok: false, error: "missing" };
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return { ok: false, error: "qty" };
  }
  if (sourceName.toLowerCase() === destName.toLowerCase()) {
    return { ok: false, error: "same" };
  }

  const next = locations
    .map((loc) => ({ name: normalizeLocation(loc.name), qty: loc.qty }))
    .filter((loc) => loc.qty > 0);

  const source = next.find((loc) => loc.name.toLowerCase() === sourceName.toLowerCase());
  if (!source) return { ok: false, error: "source" };
  if (source.qty < qty) return { ok: false, error: "stock" };

  source.qty -= qty;
  const dest = next.find((loc) => loc.name.toLowerCase() === destName.toLowerCase());
  if (dest) {
    dest.qty += qty;
  } else {
    next.push({ name: destName, qty });
  }

  const remaining = sortLocations(next.filter((loc) => loc.qty > 0));
  if (remaining.length > MAX_TOOL_LOCATIONS) {
    return { ok: false, error: "locations" };
  }
  return { ok: true, locations: remaining };
}

export function defaultCheckoutSource(locations: LocationSplit[]) {
  return (
    locations.find((loc) => isCribLocation(loc.name) && loc.qty > 0)?.name ??
    locations.find((loc) => loc.qty > 0)?.name ??
    DEFAULT_CRIB_LOCATION
  );
}

export function defaultCheckinSource(locations: LocationSplit[]) {
  return (
    locations.find((loc) => !isCribLocation(loc.name) && loc.qty > 0)?.name ??
    locations.find((loc) => loc.qty > 0)?.name ??
    ""
  );
}

export function defaultCheckinDestination(locations: LocationSplit[]) {
  return locations.find((loc) => isCribLocation(loc.name))?.name ?? DEFAULT_CRIB_LOCATION;
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function scopedTools(tenantId: string) {
  return eq(tools.tenantId, tenantId);
}

export async function ensureDemoTools(tenantId: string) {
  if (tenantId !== DEMO_TENANT_ID) return;
  await ensureSchema();
  const existing = await db
    .select({ id: tools.id })
    .from(tools)
    .where(eq(tools.tenantId, tenantId))
    .limit(1);
  if (existing[0]) return;

  try {
    for (const [index, tool] of SAMPLE_TOOLS.entries()) {
      const toolId = `tool_demo_${String(index + 1).padStart(2, "0")}`;
      await db.insert(tools).values({
        id: toolId,
        tenantId,
        toolNumber: tool.toolNumber,
        name: tool.name,
        type: tool.type,
        manufacturer: tool.manufacturer,
        notes: tool.notes,
      });
      for (const [locIndex, loc] of tool.locations.entries()) {
        await db.insert(toolLocations).values({
          id: `tloc_demo_${String(index + 1).padStart(2, "0")}_${locIndex + 1}`,
          tenantId,
          toolId,
          location: loc.name,
          quantity: loc.qty,
        });
      }
    }
  } catch {
    // Another request may have seeded the demo crib first.
  }
}

export async function listTools(tenantId: string, filters: ToolFilters = {}): Promise<ToolWithLocations[]> {
  await ensureSchema();
  await ensureDemoTools(tenantId);
  const conditions = [scopedTools(tenantId)];

  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(tools.toolNumber, term),
        ilike(tools.name, term),
        ilike(tools.manufacturer, term),
        ilike(tools.type, term),
      )!,
    );
  }
  if (filters.type && filters.type !== "all") {
    conditions.push(eq(tools.type, filters.type));
  }

  const rows = await db
    .select()
    .from(tools)
    .where(and(...conditions))
    .orderBy(asc(tools.toolNumber));

  const locationRows = await db
    .select()
    .from(toolLocations)
    .where(eq(toolLocations.tenantId, tenantId))
    .orderBy(asc(toolLocations.location));

  const byTool = new Map<string, LocationSplit[]>();
  for (const row of locationRows) {
    if (row.quantity <= 0) continue;
    const list = byTool.get(row.toolId) ?? [];
    list.push({ name: row.location, qty: row.quantity });
    byTool.set(row.toolId, list);
  }

  return rows
    .map((tool) => {
      const locations = sortLocations(byTool.get(tool.id) ?? []);
      return { ...tool, locations, totalQty: locations.reduce((sum, loc) => sum + loc.qty, 0) };
    })
    .filter((tool) => {
      if (!filters.location || filters.location === "all") return true;
      return tool.locations.some((loc) => loc.name === filters.location);
    });
}

export async function getTool(tenantId: string, id: string): Promise<ToolWithLocations | null> {
  await ensureSchema();
  await ensureDemoTools(tenantId);
  const rows = await db
    .select()
    .from(tools)
    .where(and(eq(tools.id, id), scopedTools(tenantId)))
    .limit(1);
  const tool = rows[0];
  if (!tool) return null;

  const locationRows = await db
    .select()
    .from(toolLocations)
    .where(and(eq(toolLocations.tenantId, tenantId), eq(toolLocations.toolId, id)));

  const locations = sortLocations(
    locationRows.filter((row) => row.quantity > 0).map((row) => ({ name: row.location, qty: row.quantity })),
  );
  return { ...tool, locations, totalQty: locations.reduce((sum, loc) => sum + loc.qty, 0) };
}

export async function listToolLocations(tenantId: string) {
  await ensureSchema();
  const rows = await db
    .selectDistinct({ location: toolLocations.location })
    .from(toolLocations)
    .where(eq(toolLocations.tenantId, tenantId))
    .orderBy(asc(toolLocations.location));
  return rows.map((row) => row.location).filter(Boolean);
}

export async function listRecentMoves(tenantId: string, toolId?: string, limit = 20): Promise<(ToolMove & { toolNumber: string; toolName: string })[]> {
  await ensureSchema();
  const conditions = [eq(toolMoves.tenantId, tenantId)];
  if (toolId) conditions.push(eq(toolMoves.toolId, toolId));

  return db
    .select({
      id: toolMoves.id,
      tenantId: toolMoves.tenantId,
      toolId: toolMoves.toolId,
      intent: toolMoves.intent,
      fromLocation: toolMoves.fromLocation,
      toLocation: toolMoves.toLocation,
      quantity: toolMoves.quantity,
      performedBy: toolMoves.performedBy,
      createdAt: toolMoves.createdAt,
      toolNumber: tools.toolNumber,
      toolName: tools.name,
    })
    .from(toolMoves)
    .innerJoin(tools, eq(tools.id, toolMoves.toolId))
    .where(and(...conditions))
    .orderBy(desc(toolMoves.createdAt))
    .limit(limit);
}

export async function moveToolQuantity(input: {
  tenantId: string;
  toolId: string;
  from: string;
  to: string;
  qty: number;
  intent: MoveIntent;
  performedBy: string;
}): Promise<{ ok: true } | { ok: false; error: MoveError }> {
  await ensureSchema();

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(tools)
      .where(and(eq(tools.id, input.toolId), eq(tools.tenantId, input.tenantId)))
      .limit(1);
    if (!existing[0]) return { ok: false as const, error: "not-found" as const };

    const rows = await tx
      .select()
      .from(toolLocations)
      .where(and(eq(toolLocations.tenantId, input.tenantId), eq(toolLocations.toolId, input.toolId)));

    const result = applyLocationMove(
      rows.map((row) => ({ name: row.location, qty: row.quantity })),
      input.from,
      input.to,
      input.qty,
    );
    if (!result.ok) return result;

    await tx
      .delete(toolLocations)
      .where(and(eq(toolLocations.tenantId, input.tenantId), eq(toolLocations.toolId, input.toolId)));

    if (result.locations.length > 0) {
      await tx.insert(toolLocations).values(
        result.locations.map((loc) => ({
          id: newId("tloc"),
          tenantId: input.tenantId,
          toolId: input.toolId,
          location: loc.name,
          quantity: loc.qty,
        })),
      );
    }

    await tx.insert(toolMoves).values({
      id: newId("tmove"),
      tenantId: input.tenantId,
      toolId: input.toolId,
      intent: input.intent,
      fromLocation: normalizeLocation(input.from),
      toLocation: normalizeLocation(input.to),
      quantity: input.qty,
      performedBy: input.performedBy,
    });

    await tx
      .update(tools)
      .set({ updatedAt: new Date() })
      .where(and(eq(tools.id, input.toolId), eq(tools.tenantId, input.tenantId)));

    return { ok: true as const };
  });
}

export async function createTool(input: {
  tenantId: string;
  toolNumber: string;
  name: string;
  type: string;
  manufacturer?: string | null;
  notes?: string | null;
  location: string;
  quantity: number;
}): Promise<{ ok: true; id: string } | { ok: false; error: "missing" | "qty" | "duplicate" }> {
  await ensureSchema();
  const toolNumber = input.toolNumber.trim();
  const name = input.name.trim();
  const location = normalizeLocation(input.location) || DEFAULT_CRIB_LOCATION;
  if (!toolNumber || !name) return { ok: false, error: "missing" };
  if (!Number.isInteger(input.quantity) || input.quantity < 1) return { ok: false, error: "qty" };

  const existing = await db
    .select()
    .from(tools)
    .where(and(eq(tools.tenantId, input.tenantId), eq(tools.toolNumber, toolNumber)))
    .limit(1);
  if (existing[0]) return { ok: false, error: "duplicate" };

  const id = newId("tool");
  await db.insert(tools).values({
    id,
    tenantId: input.tenantId,
    toolNumber,
    name,
    type: input.type || "Other",
    manufacturer: input.manufacturer || null,
    notes: input.notes || null,
  });
  await db.insert(toolLocations).values({
    id: newId("tloc"),
    tenantId: input.tenantId,
    toolId: id,
    location,
    quantity: input.quantity,
  });
  return { ok: true, id };
}

export function knownDestinations(tenantLocations: string[]) {
  const names = new Set<string>([...SUGGESTED_DESTINATIONS, ...tenantLocations]);
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function moveErrorMessage(error: string | undefined) {
  switch (error) {
    case "missing":
      return "Enter a quantity and a destination location.";
    case "qty":
      return "Quantity must be a whole number of 1 or more.";
    case "same":
      return "Source and destination have to be different.";
    case "source":
      return "That source location is not on this tool.";
    case "stock":
      return "Not enough quantity at the source location.";
    case "locations":
      return `A tool can sit in up to ${MAX_TOOL_LOCATIONS} locations. Return some first.`;
    case "not-found":
      return "That tool is not in this shop.";
    case "duplicate":
      return "That tool number already exists in this shop.";
    case "forbidden":
      return "You cannot move tools with this role.";
    default:
      return null;
  }
}

export function moveOkMessage(ok: string | undefined, toolNumber?: string) {
  const label = toolNumber ? ` ${toolNumber}` : "";
  if (ok === "checkout") return `Checked out${label}. Location chips updated.`;
  if (ok === "checkin") return `Returned${label} to the destination. Location chips updated.`;
  if (ok === "created") return `Added tool${label} to the crib.`;
  return null;
}

export function toolCounts(items: ToolWithLocations[]) {
  const floor = items.filter((tool) => tool.locations.some((loc) => !isCribLocation(loc.name))).length;
  return {
    all: items.length,
    pcs: items.reduce((sum, tool) => sum + tool.totalQty, 0),
    onFloor: floor,
  };
}
