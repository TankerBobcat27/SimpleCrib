import { GageForm } from "@/components/gage-form";
import { listLocations } from "@/lib/gages";
import { canEditGages } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewGagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await requireShop(slug);
  if (!canEditGages(shop.role)) {
    redirect(`/t/${slug}?error=forbidden`);
  }
  const locations = await listLocations(shop.tenantId);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold">Add gage</h2>
        <p className="text-sm text-zinc-400">
          Shop ID must be unique inside this tenant. CSV bulk upsert lives on the CSV screen.
        </p>
      </div>
      <GageForm slug={slug} canEdit locations={locations} />
    </div>
  );
}
