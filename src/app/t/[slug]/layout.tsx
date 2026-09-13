import type { ReactNode } from "react";
import { BackupBanner } from "@/components/backup-banner";
import { ShopHeader } from "@/components/shop-header";
import { requireShop } from "@/lib/tenant";

export const dynamic = 'force-dynamic';

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await requireShop(slug);

  return (
    <div className="min-h-full bg-zinc-950">
      <ShopHeader slug={shop.tenantSlug} shopName={shop.tenantName} userName={shop.name} role={shop.role} />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5">
        <BackupBanner />
        {children}
        <p className="pb-8 text-xs text-zinc-500">
          Built for small shops. Operational tracker only. Demo data is SAMPLE inventory — not a live
          customer crib.
        </p>
      </div>
    </div>
  );
}
