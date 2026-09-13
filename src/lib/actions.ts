"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { parseGageCsv } from "@/lib/csv";
import { db, ensureSchema } from "@/lib/db";
import { calHistory, gages, tenants } from "@/lib/db/schema";
import { canEditGages, canImportExport, canUpdateStatus } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

export async function createShopAction(formData: FormData) {
  await ensureSchema();
  const shopName = readString(formData, "shopName");
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  if (!shopName || !name || !email || password.length < 8) {
    redirect("/signup?error=missing");
  }

  let slug = slugify(shopName) || "shop";
  const existing = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  if (existing[0]) {
    slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
  }

  const tenantId = newId("ten");
  await db.insert(tenants).values({ id: tenantId, slug, name: shopName });

  const result = await auth.api.signUpEmail({
    headers: await headers(),
    body: {
      name,
      email,
      password,
      tenantId,
      tenantSlug: slug,
      role: "admin",
    },
  });

  if (!result) {
    redirect("/signup?error=signup");
  }

  redirect(`/t/${slug}`);
}

export async function saveGageAction(formData: FormData) {
  const slug = readString(formData, "slug");
  const shop = await requireShop(slug);
  if (!canEditGages(shop.role)) {
    redirect(`/t/${slug}?error=forbidden`);
  }

  const id = readString(formData, "id") || newId("gage");
  const shopId = readString(formData, "shopId");
  const name = readString(formData, "name");
  const type = readString(formData, "type") || "Equipment";
  const manufacturer = readString(formData, "manufacturer") || null;
  const serial = readString(formData, "serial") || null;
  const location = readString(formData, "location") || "Quality Lab";
  const lastCal = readDate(formData, "lastCal");
  const nextDue = readDate(formData, "nextDue");
  const status = readString(formData, "status") === "out_of_service" ? "out_of_service" : "available";
  const notes = readString(formData, "notes") || null;
  const historyNote = readString(formData, "historyNote");
  const historyResult = readString(formData, "historyResult") || "pass";

  if (!shopId || !name) {
    redirect(`/t/${slug}/gages/${readString(formData, "id") || "new"}?error=missing`);
  }

  const existing = readString(formData, "id")
    ? await db
        .select()
        .from(gages)
        .where(and(eq(gages.id, id), eq(gages.tenantId, shop.tenantId)))
        .limit(1)
    : [];

  const payload = {
    shopId,
    name,
    type,
    manufacturer,
    serial,
    location,
    lastCal,
    nextDue,
    status,
    notes,
    updatedAt: new Date(),
  };

  if (existing[0]) {
    await db
      .update(gages)
      .set(payload)
      .where(and(eq(gages.id, id), eq(gages.tenantId, shop.tenantId)));
  } else {
    await db.insert(gages).values({
      id,
      tenantId: shop.tenantId,
      ...payload,
    });
  }

  if (lastCal && (historyNote || lastCal !== existing[0]?.lastCal || nextDue !== existing[0]?.nextDue)) {
    await db.insert(calHistory).values({
      id: newId("cal"),
      tenantId: shop.tenantId,
      gageId: id,
      calibratedAt: lastCal,
      nextDue,
      result: historyResult,
      notes: historyNote || null,
      performedBy: shop.name,
    });
  }

  revalidatePath(`/t/${slug}`);
  revalidatePath(`/t/${slug}/due`);
  revalidatePath(`/t/${slug}/due-week`);
  redirect(`/t/${slug}/gages/${id}`);
}

export async function updateGageStatusAction(formData: FormData) {
  const slug = readString(formData, "slug");
  const shop = await requireShop(slug);
  if (!canUpdateStatus(shop.role)) {
    redirect(`/t/${slug}?error=forbidden`);
  }

  const id = readString(formData, "id");
  const status = readString(formData, "status") === "out_of_service" ? "out_of_service" : "available";
  if (!id) return;

  await db
    .update(gages)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(gages.id, id), eq(gages.tenantId, shop.tenantId)));

  revalidatePath(`/t/${slug}`);
  revalidatePath(`/t/${slug}/due`);
  revalidatePath(`/t/${slug}/due-week`);
  revalidatePath(`/t/${slug}/gages/${id}`);
}

export async function importGagesAction(formData: FormData) {
  const slug = readString(formData, "slug");
  const shop = await requireShop(slug);
  if (!canImportExport(shop.role)) {
    redirect(`/t/${slug}?error=forbidden`);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/t/${slug}/import?error=empty`);
  }

  const parsed = parseGageCsv(await file.text());
  if (parsed.errors.length > 0 && parsed.rows.length === 0) {
    redirect(`/t/${slug}/import?error=invalid`);
  }

  for (const row of parsed.rows) {
    const current = await db
      .select()
      .from(gages)
      .where(and(eq(gages.tenantId, shop.tenantId), eq(gages.shopId, row.shopId)))
      .limit(1);

    const payload = {
      shopId: row.shopId,
      name: row.name,
      type: row.type,
      manufacturer: row.manufacturer,
      serial: row.serial,
      location: row.location,
      lastCal: row.lastCal,
      nextDue: row.nextDue,
      status: row.status,
      notes: row.notes,
      updatedAt: new Date(),
    };

    if (current[0]) {
      await db
        .update(gages)
        .set(payload)
        .where(and(eq(gages.id, current[0].id), eq(gages.tenantId, shop.tenantId)));
    } else {
      await db.insert(gages).values({
        id: newId("gage"),
        tenantId: shop.tenantId,
        ...payload,
      });
    }
  }

  revalidatePath(`/t/${slug}`);
  redirect(`/t/${slug}/import?imported=${parsed.rows.length}&skipped=${parsed.errors.length}`);
}

