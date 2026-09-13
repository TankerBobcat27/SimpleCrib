import Link from "next/link";
import { notFound } from "next/navigation";
import { LocationChips } from "@/components/location-chips";
import { ToolMoveForm } from "@/components/tool-move-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canMoveTools } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";
import {
  getTool,
  knownDestinations,
  listRecentMoves,
  listToolLocations,
  moveErrorMessage,
  moveOkMessage,
} from "@/lib/tools";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ ok?: string; error?: string; move?: string }>;
}) {
  const { slug, id } = await params;
  const query = await searchParams;
  const shop = await requireShop(slug);
  const tool = await getTool(shop.tenantId, id);
  if (!tool) notFound();

  const [moves, tenantLocations] = await Promise.all([
    listRecentMoves(shop.tenantId, tool.id, 12),
    listToolLocations(shop.tenantId),
  ]);
  const destinations = knownDestinations(tenantLocations);
  const returnTo = `/t/${slug}/toolcrib/${tool.id}`;
  const ok = moveOkMessage(query.ok, tool.toolNumber);
  const error = moveErrorMessage(query.error);
  const canMove = canMoveTools(shop.role);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-zinc-500">{tool.toolNumber}</p>
          <h2 className="text-2xl font-semibold">{tool.name}</h2>
          <p className="text-sm text-zinc-400">
            {[tool.manufacturer, tool.type, `${tool.totalQty} on hand`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/t/${slug}/toolcrib`}>Back to crib</Link>
        </Button>
      </div>

      {ok ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Locations</h3>
        <LocationChips locations={tool.locations} className="mt-3" />
        {tool.notes ? <p className="mt-3 text-sm text-zinc-400">{tool.notes}</p> : null}
      </section>

      {canMove ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section
            id="checkout"
            className={
              query.move === "checkout"
                ? "rounded-xl border border-amber-400/60 bg-zinc-900/70 p-5"
                : "rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
            }
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Check out</h3>
            <p className="mt-2 mb-4 text-sm text-zinc-400">
              Take some (or all) from a location chip and send them to a workstation or machine.
            </p>
            <ToolMoveForm
              slug={slug}
              toolId={tool.id}
              locations={tool.locations}
              destinations={destinations}
              intent="checkout"
              returnTo={returnTo}
            />
          </section>
          <section
            id="checkin"
            className={
              query.move === "checkin"
                ? "rounded-xl border border-amber-400/60 bg-zinc-900/70 p-5"
                : "rounded-xl border border-zinc-800 bg-zinc-900/70 p-5"
            }
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Return / check in</h3>
            <p className="mt-2 mb-4 text-sm text-zinc-400">
              Bring quantity back from the floor to Crib A — or any other location.
            </p>
            <ToolMoveForm
              slug={slug}
              toolId={tool.id}
              locations={tool.locations}
              destinations={destinations}
              intent="checkin"
              returnTo={returnTo}
            />
          </section>
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Recent moves</h3>
        {moves.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No checkout or return recorded yet for this tool.</p>
        ) : (
          <ol className="mt-4 grid gap-3">
            {moves.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 last:border-0">
                <div>
                  <p className="font-medium">
                    {row.quantity} · {row.fromLocation} → {row.toLocation}
                  </p>
                  <p className="text-sm text-zinc-400">{row.performedBy ?? "—"}</p>
                </div>
                <Badge variant={row.intent === "checkin" ? "ok" : "soon"}>
                  {row.intent === "checkin" ? "Return" : "Check out"}
                </Badge>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
