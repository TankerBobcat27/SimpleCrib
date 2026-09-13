import { ToolBoard } from "@/components/tool-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireShop } from "@/lib/tenant";
import {
  listToolLocations,
  listTools,
  moveErrorMessage,
  moveOkMessage,
  TOOL_TYPES,
  toolCounts,
} from "@/lib/tools";

export const dynamic = "force-dynamic";

export default async function ToolcribPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; type?: string; location?: string; ok?: string; error?: string; id?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const shop = await requireShop(slug);
  const [items, tenantLocations] = await Promise.all([
    listTools(shop.tenantId, query),
    listToolLocations(shop.tenantId),
  ]);
  const counts = toolCounts(items);
  const highlighted = items.find((tool) => tool.id === query.id);
  const ok = moveOkMessage(query.ok, highlighted?.toolNumber);
  const error = moveErrorMessage(query.error);

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Toolcrib</p>
        <h2 className="text-2xl font-semibold">Crib inventory</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Same tool number can sit in more than one place. Check out a quantity to a workstation, then
          return it to the crib when you are done. Up to 5 location chips.
        </p>
      </div>

      {ok ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      <form className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:grid-cols-4">
        <Input name="q" placeholder="Search tool #, name, type…" defaultValue={query.q ?? ""} />
        <select
          name="type"
          defaultValue={query.type ?? "all"}
          className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
        >
          <option value="all">All types</option>
          {TOOL_TYPES.map((type) => (
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
          {tenantLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>

      <p className="text-sm text-zinc-400">
        Showing <span className="text-zinc-100">{items.length}</span> tools ·{" "}
        <span className="text-zinc-100">{counts.pcs}</span> pcs ·{" "}
        <span className="text-zinc-100">{counts.onFloor}</span> with stock on the floor
      </p>

      <ToolBoard slug={slug} tools={items} role={shop.role} />
    </div>
  );
}
