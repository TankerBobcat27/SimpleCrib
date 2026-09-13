import { NextResponse } from "next/server";
import { gagesToCsv } from "@/lib/csv";
import { listGages } from "@/lib/gages";
import { canImportExport } from "@/lib/roles";
import { getSessionUser } from "@/lib/tenant";
import { db, ensureSchema } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  await ensureSchema();
  const slug = new URL(request.url).searchParams.get("slug");
  const user = await getSessionUser();
  if (!user || !slug || user.tenantSlug !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canImportExport(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenant = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, user.tenantId), eq(tenants.slug, slug)))
    .limit(1);
  if (!tenant[0]) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  const rows = await listGages(user.tenantId);
  return new NextResponse(gagesToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-gages.csv"`,
    },
  });
}
