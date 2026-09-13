import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, ensureSchema } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { isRole, type Role } from "@/lib/roles";

export type ShopContext = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
};

export async function getSessionUser() {
  await ensureSchema();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  const role = isRole(session.user.role) ? session.user.role : "operator";
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role,
    tenantId: session.user.tenantId,
    tenantSlug: session.user.tenantSlug,
  };
}

export async function requireShop(slug: string): Promise<ShopContext> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=/t/${slug}`);
  }

  if (user.tenantSlug !== slug) {
    redirect(`/t/${user.tenantSlug}?error=wrong-shop`);
  }

  const tenant = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, user.tenantId), eq(tenants.slug, slug)))
    .limit(1);

  if (!tenant[0]) {
    redirect("/login?error=missing-shop");
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: slug,
    tenantName: tenant[0].name,
  };
}
