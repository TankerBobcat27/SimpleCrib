"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEditTools, canMoveTools } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";
import { createTool, DEFAULT_CRIB_LOCATION, moveToolQuantity, type MoveIntent } from "@/lib/tools";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeShopPath(slug: string, value: string) {
  const prefix = `/t/${slug}`;
  if (value.startsWith(prefix) && !value.startsWith("//")) {
    const [path] = value.split("?");
    return path || `${prefix}/toolcrib`;
  }
  return `${prefix}/toolcrib`;
}

function redirectWithStatus(path: string, params: Record<string, string>) {
  const url = new URLSearchParams(params);
  redirect(`${path}?${url.toString()}`);
}

function revalidateToolcrib(slug: string, toolId?: string) {
  revalidatePath(`/t/${slug}/toolcrib`);
  revalidatePath(`/t/${slug}/toolcrib/moves`);
  if (toolId) revalidatePath(`/t/${slug}/toolcrib/${toolId}`);
}

export async function moveToolQuantityAction(formData: FormData) {
  const slug = readString(formData, "slug");
  const shop = await requireShop(slug);
  const returnTo = safeShopPath(slug, readString(formData, "returnTo") || `/t/${slug}/toolcrib`);
  const toolId = readString(formData, "toolId");
  const intent: MoveIntent = readString(formData, "intent") === "checkin" ? "checkin" : "checkout";

  if (!canMoveTools(shop.role)) {
    redirectWithStatus(returnTo, { error: "forbidden", id: toolId });
  }

  const qty = Number.parseInt(readString(formData, "quantity"), 10);
  const result = await moveToolQuantity({
    tenantId: shop.tenantId,
    toolId,
    from: readString(formData, "fromLocation"),
    to: readString(formData, "toLocation"),
    qty,
    intent,
    performedBy: shop.name,
  });

  if (!result.ok) {
    redirectWithStatus(returnTo, { error: result.error, id: toolId, move: intent });
  }

  revalidateToolcrib(slug, toolId);
  redirectWithStatus(returnTo, { ok: intent, id: toolId });
}

export async function createToolAction(formData: FormData) {
  const slug = readString(formData, "slug");
  const shop = await requireShop(slug);
  if (!canEditTools(shop.role)) {
    redirect(`/t/${slug}/toolcrib?error=forbidden`);
  }

  const result = await createTool({
    tenantId: shop.tenantId,
    toolNumber: readString(formData, "toolNumber"),
    name: readString(formData, "name"),
    type: readString(formData, "type") || "Other",
    manufacturer: readString(formData, "manufacturer") || null,
    notes: readString(formData, "notes") || null,
    location: readString(formData, "location") || DEFAULT_CRIB_LOCATION,
    quantity: Number.parseInt(readString(formData, "quantity"), 10),
  });

  if (!result.ok) {
    redirect(`/t/${slug}/toolcrib/new?error=${result.error}`);
  }

  revalidateToolcrib(slug, result.id);
  redirect(`/t/${slug}/toolcrib/${result.id}?ok=created`);
}
