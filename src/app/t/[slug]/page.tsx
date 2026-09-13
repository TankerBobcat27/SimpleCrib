import { DueFilters } from "@/components/due-filters";
import { GageBoard } from "@/components/gage-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gageCounts, GAGE_TYPES, listGages, listLocations, type DueFilter } from "@/lib/gages";
import { requireShop } from "@/lib/tenant";

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ due?: string; q?: string; type?: string; status?: string; location?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const shop = await requireShop(slug);
  const due = (query.due as DueFilter) || "all";
  const [items, counts, locations] = await Promise.all([
    listGages(shop.tenantId, { ...query, due }),
    gageCounts(shop.tenantId),
    listLocations(shop.tenantId),
  ]);

  return (
    <div className="grid gap-5">
      <DueFilters
        basePath={`/t/${slug}`}
        current={due}
        counts={counts}
        query={query}
      />
      <form className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:grid-cols-4">
        <Input name="q" placeholder="Search ID, name, serial…" defaultValue={query.q ?? ""} />
        <select
          name="type"
          defaultValue={query.type ?? "all"}
          className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
        >
          <option value="all">All types</option>
          {GAGE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          name="location"
          defaultValue={query.location ?? "all"}
          className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
        >
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <input type="hidden" name="due" value={due} />
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>
      <p className="text-sm text-zinc-400">
        Showing <span className="text-zinc-100">{items.length}</span> of{" "}
        <span className="text-zinc-100">{counts.all}</span> gages
      </p>
      <GageBoard slug={slug} gages={items} role={shop.role} />
    </div>
  );
}
