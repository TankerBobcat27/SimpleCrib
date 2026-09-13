"use client";

import { useState } from "react";
import Link from "next/link";
import { LocationChips } from "@/components/location-chips";
import { ToolMoveForm } from "@/components/tool-move-form";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/roles";
import { canMoveTools } from "@/lib/roles";
import type { MoveIntent, ToolWithLocations } from "@/lib/tools";

export function ToolBoard({
  slug,
  tools,
  destinations,
  role,
  returnTo,
}: {
  slug: string;
  tools: ToolWithLocations[];
  destinations: string[];
  role: Role;
  returnTo: string;
}) {
  const [open, setOpen] = useState<{ id: string; intent: MoveIntent } | null>(null);
  const canMove = canMoveTools(role);

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-100">No tools match this filter</h2>
        <p className="mt-2 text-sm text-zinc-400">Clear search or pick All locations.</p>
      </div>
    );
  }

  const openTool = open ? tools.find((tool) => tool.id === open.id) : null;

  return (
    <>
      {openTool && open ? (
        <div className="rounded-2xl border border-amber-400/50 bg-zinc-900 p-5">
          <div className="grid gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">
                {open.intent === "checkin" ? "Return / check in" : "Check out"}
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                {openTool.toolNumber} · {openTool.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {open.intent === "checkin"
                  ? "Move quantity from a floor location back to the crib (or another location)."
                  : "Enter how many to take and where they are going. Source quantity drops; destination chip is created or updated."}
              </p>
            </div>
            <LocationChips locations={openTool.locations} />
            <ToolMoveForm
              slug={slug}
              toolId={openTool.id}
              locations={openTool.locations}
              destinations={destinations}
              intent={open.intent}
              returnTo={returnTo}
            />
            <div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {tools.map((tool) => (
          <article key={tool.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <ToolHeader slug={slug} tool={tool} />
            <LocationChips locations={tool.locations} className="mt-3" />
            {canMove ? <MoveActions tool={tool} setOpen={setOpen} /> : null}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Tool #</th>
              <th className="px-4 py-3 font-medium">Tool</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Locations</th>
              <th className="px-4 py-3 font-medium">Move</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950/60">
            {tools.map((tool) => (
              <tr key={tool.id} className="align-top">
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{tool.toolNumber}</td>
                <td className="px-4 py-3">
                  <Link href={`/t/${slug}/toolcrib/${tool.id}`} className="font-medium text-zinc-50 hover:underline">
                    {tool.name}
                  </Link>
                  <div className="text-xs text-zinc-400">
                    {[tool.manufacturer, tool.type].filter(Boolean).join(" · ")}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-200">{tool.totalQty}</td>
                <td className="px-4 py-3">
                  <LocationChips locations={tool.locations} />
                </td>
                <td className="px-4 py-3">
                  {canMove ? (
                    <MoveActions tool={tool} setOpen={setOpen} compact />
                  ) : (
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/t/${slug}/toolcrib/${tool.id}`}>Open</Link>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}

function ToolHeader({ slug, tool }: { slug: string; tool: ToolWithLocations }) {
  return (
    <div>
      <p className="font-mono text-xs text-zinc-400">{tool.toolNumber}</p>
      <h2 className="text-lg font-semibold leading-tight">
        <Link href={`/t/${slug}/toolcrib/${tool.id}`} className="hover:underline">
          {tool.name}
        </Link>
      </h2>
      <p className="text-sm text-zinc-400">
        {[tool.manufacturer, tool.type, `${tool.totalQty} on hand`].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}

function MoveActions({
  tool,
  setOpen,
  compact,
}: {
  tool: ToolWithLocations;
  setOpen: (value: { id: string; intent: MoveIntent } | null) => void;
  compact?: boolean;
}) {
  const hasFloor = tool.locations.some((loc) => !/^crib\b/i.test(loc.name) && loc.qty > 0);

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "mt-4 flex flex-wrap gap-2"}>
      <Button
        type="button"
        size="sm"
        disabled={tool.totalQty === 0}
        onClick={() => setOpen({ id: tool.id, intent: "checkout" })}
      >
        Check out
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={!hasFloor}
        onClick={() => setOpen({ id: tool.id, intent: "checkin" })}
      >
        Return
      </Button>
    </div>
  );
}
