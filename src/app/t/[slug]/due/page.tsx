import { DueFilters } from "@/components/due-filters";
import { GageBoard } from "@/components/gage-board";
import { gageCounts, listGages, listLocations, type DueFilter } from "@/lib/gages";
import { requireShop } from "@/lib/tenant";

export const dynamic = 'force-dynamic';

export default async function DueBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ due?: string; q?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const shop = await requireShop(slug);
  const due = (query.due as DueFilter) || "overdue";
  const [items, counts, locations] = await Promise.all([
    listGages(shop.tenantId, { q: query.q, due }),
    gageCounts(shop.tenantId),
    listLocations(shop.tenantId),
  ]);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold">Due board</h2>
        <p className="text-sm text-zinc-400">
          Shop-floor default is overdue. Expiration is before today. Switch chips for this week or due soon
          (30 days). Check out or check in from the location dropdown on each gage.
        </p>
      </div>
      <DueFilters basePath={`/t/${slug}/due`} current={due} counts={counts} query={query} />
      <GageBoard slug={slug} gages={items} role={shop.role} locations={locations} />
    </div>
  );
}
