import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireShop } from "@/lib/tenant";
import { listRecentMoves } from "@/lib/tools";

export const dynamic = "force-dynamic";

export default async function ToolMovesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await requireShop(slug);
  const moves = await listRecentMoves(shop.tenantId, undefined, 40);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Moves</h2>
        <p className="mt-1 text-sm text-zinc-400">Recent checkouts and returns for this shop.</p>
      </div>
      {moves.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12 text-center text-sm text-zinc-400">
          No moves yet. Check out a tool from crib inventory.
        </div>
      ) : (
        <ol className="grid gap-3">
          {moves.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3"
            >
              <div>
                <Link href={`/t/${slug}/toolcrib/${row.toolId}`} className="font-medium hover:underline">
                  {row.toolNumber} · {row.toolName}
                </Link>
                <p className="text-sm text-zinc-400">
                  {row.quantity} · {row.fromLocation} → {row.toLocation}
                  {row.performedBy ? ` · ${row.performedBy}` : ""}
                </p>
              </div>
              <Badge variant={row.intent === "checkin" ? "ok" : "soon"}>
                {row.intent === "checkin" ? "Return" : "Check out"}
              </Badge>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
