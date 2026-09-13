import { notFound } from "next/navigation";
import { GageForm } from "@/components/gage-form";
import { LocationMove } from "@/components/location-move";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/dates";
import { getGage, listGageHistory, listLocations } from "@/lib/gages";
import { canEditGages, canMoveLocation } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";

export const dynamic = 'force-dynamic';

export default async function GageDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const shop = await requireShop(slug);
  const gage = await getGage(shop.tenantId, id);
  if (!gage) notFound();
  const [history, locations] = await Promise.all([
    listGageHistory(shop.tenantId, gage.id),
    listLocations(shop.tenantId),
  ]);
  const canEdit = canEditGages(shop.role);

  return (
    <div className="grid gap-6">
      <div>
        <p className="font-mono text-xs text-zinc-500">{gage.shopId}</p>
        <h2 className="text-2xl font-semibold">{canEdit ? "Edit gage" : "Gage"}</h2>
        <p className="text-sm text-zinc-400">
          {canEdit
            ? "Check a gage out or in from the location control. Use the form for due dates, status, and other fields."
            : "Read-only record. You can still move location and mark Available / Out of service on the board."}
        </p>
      </div>
      <LocationMove
        key={`${gage.id}-${gage.location}`}
        slug={slug}
        id={gage.id}
        location={gage.location}
        locations={locations}
        canEdit={canMoveLocation(shop.role)}
        layout="panel"
      />
      <GageForm slug={slug} gage={gage} canEdit={canEdit} locations={locations} />
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Calibration history</h3>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No history rows yet for this tenant-scoped gage.</p>
        ) : (
          <ol className="mt-4 grid gap-3">
            {history.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 last:border-0">
                <div>
                  <p className="font-medium">{formatDate(row.calibratedAt)}</p>
                  <p className="text-sm text-zinc-400">
                    Next due {formatDate(row.nextDue)} · {row.performedBy ?? "—"}
                    {row.notes ? ` · ${row.notes}` : ""}
                  </p>
                </div>
                <Badge variant={row.result === "fail" ? "out" : "ok"}>{row.result}</Badge>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
