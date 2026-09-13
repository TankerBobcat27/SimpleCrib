import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationMove } from "@/components/location-move";
import { StatusToggle } from "@/components/status-toggle";
import { dueBucket, dueLabel, formatDate } from "@/lib/dates";
import type { Gage } from "@/lib/db/schema";
import { canEditGages, canMoveLocation, canUpdateStatus, type Role } from "@/lib/roles";

function dueVariant(iso: string | null) {
  const bucket = dueBucket(iso);
  if (bucket === "overdue") return "overdue" as const;
  if (bucket === "this_week" || bucket === "due_soon") return "soon" as const;
  if (bucket === "missing") return "outline" as const;
  return "ok" as const;
}

export function GageBoard({
  slug,
  gages,
  role,
  locations,
}: {
  slug: string;
  gages: Gage[];
  role: Role;
  locations: string[];
}) {
  if (gages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-100">No gages match this filter</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Clear search, switch the due chip, or add a SAMPLE gage. CSV import is on the CSV screen.
        </p>
        {canEditGages(role) ? (
          <Button asChild className="mt-5">
            <Link href={`/t/${slug}/gages/new`}>Add gage</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {gages.map((gage) => (
          <article key={gage.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-zinc-400">{gage.shopId}</p>
                <h2 className="text-lg font-semibold leading-tight">{gage.name}</h2>
                <p className="text-sm text-zinc-400">
                  {[gage.manufacturer, gage.serial ? `SN ${gage.serial}` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Badge variant={gage.status === "out_of_service" ? "out" : "ok"}>
                {gage.status === "out_of_service" ? "Out of service" : "Available"}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={dueVariant(gage.nextDue)}>{dueLabel(gage.nextDue)}</Badge>
              <span className="text-zinc-400">Due {formatDate(gage.nextDue)}</span>
            </div>
            <div className="mt-4">
              <LocationMove
                key={`${gage.id}-${gage.location}`}
                slug={slug}
                id={gage.id}
                location={gage.location}
                locations={locations}
                canEdit={canMoveLocation(role)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {canEditGages(role) ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/t/${slug}/gages/${gage.id}`}>Edit</Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/t/${slug}/gages/${gage.id}`}>Open</Link>
                </Button>
              )}
              <StatusToggle slug={slug} id={gage.id} status={gage.status} canEdit={canUpdateStatus(role)} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Gage</th>
              <th className="px-4 py-3 font-medium">Cal status</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950/60">
            {gages.map((gage) => (
              <tr key={gage.id} className="align-top">
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{gage.shopId}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-50">{gage.name}</div>
                  <div className="text-xs text-zinc-400">
                    {[gage.manufacturer, gage.serial, gage.type].filter(Boolean).join(" · ")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={dueVariant(gage.nextDue)}>{dueLabel(gage.nextDue)}</Badge>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-200">{formatDate(gage.nextDue)}</td>
                <td className="px-4 py-3">
                  <LocationMove
                    key={`${gage.id}-${gage.location}`}
                    slug={slug}
                    id={gage.id}
                    location={gage.location}
                    locations={locations}
                    canEdit={canMoveLocation(role)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge variant={gage.status === "out_of_service" ? "out" : "ok"}>
                    {gage.status === "out_of_service" ? "Out of service" : "Available"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/t/${slug}/gages/${gage.id}`}>{canEditGages(role) ? "Edit" : "Open"}</Link>
                    </Button>
                    <StatusToggle slug={slug} id={gage.id} status={gage.status} canEdit={canUpdateStatus(role)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
