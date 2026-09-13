import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { DEMO_TENANT_ID, SAMPLE_TOOLS } from "@/lib/demo-inventory";
import { db, ensureSchema } from "@/lib/db";
import { toolLocations, toolMoves, tools, type Tool, type ToolMove } from "@/lib/db/schema";
import {
  applyLocationMove,
  DEFAULT_CRIB_LOCATION,
  normalizeLocation,
  sortLocations,
  type LocationSplit,
  type MoveError,
  type MoveIntent,
} from "@/lib/tool-core";

export {
  applyLocationMove,
  DEFAULT_CRIB_LOCATION,
  defaultCheckinDestination,
  defaultCheckinSource,
  defaultCheckoutSource,
  isCribLocation,
  knownDestinations,
  MAX_TOOL_LOCATIONS,
  moveErrorMessage,
  moveOkMessage,
  normalizeLocation,
  sortLocations,
  SUGGESTED_DESTINATIONS,
  TOOL_TYPES,
  toolCounts,
} from "@/lib/tool-core";
export type { LocationSplit, MoveError, MoveIntent, ToolCard } from "@/lib/tool-core";

export type ToolWithLocations = Tool & {
  locations: LocationSplit[];
  totalQty: number;
};

export type ToolFilters = {
  q?: string;
  type?: string;
  location?: string;
};

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

