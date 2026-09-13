"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LocationQty = { name: string; qty: number };

type Tool = {
  sku: string;
  name: string;
  type: string;
  manufacturer: string;
  locations: LocationQty[];
  minQty: number;
  checkedOutTo: string | null;
};

const SAMPLE_TOOLS: Tool[] = [
  {
    sku: "EM-375-4FL",
    name: '3/8" 4-flute carbide end mill',
    type: "End mill",
    manufacturer: "Kennametal",
    locations: [
      { name: "Crib A", qty: 12 },
      { name: "DMU75", qty: 2 },
    ],
    minQty: 6,
    checkedOutTo: null,
  },
  {
    sku: "EM-500-4FL",
    name: '1/2" 4-flute carbide end mill',
    type: "End mill",
    manufacturer: "Sandvik",
    locations: [
      { name: "Crib A", qty: 8 },
      { name: "Haas VF-2", qty: 1 },
    ],
    minQty: 4,
    checkedOutTo: null,
  },
  {
    sku: "INS-CNMG-432",
    name: "CNMG 432 turning insert",
    type: "Insert",
    manufacturer: "Iscar",
    locations: [
      { name: "Crib B", qty: 40 },
      { name: "Tool cart", qty: 6 },
    ],
    minQty: 20,
    checkedOutTo: null,
  },
  {
    sku: "COL-ER32-375",
    name: 'ER32 collet 3/8"',
    type: "Collet",
    manufacturer: "Techniks",
    locations: [{ name: "Crib A", qty: 6 }],
    minQty: 4,
    checkedOutTo: null,
  },
  {
    sku: "TAP-10-32-SP",
    name: "10-32 spiral tap",
    type: "Tap",
    manufacturer: "OSG",
    locations: [
      { name: "Crib B", qty: 4 },
      { name: "Crib A", qty: 2 },
    ],
    minQty: 4,
    checkedOutTo: null,
  },
  {
    sku: "DR-250-CAR",
    name: '1/4" carbide drill',
    type: "Drill",
    manufacturer: "Guhring",
    locations: [
      { name: "Crib A", qty: 10 },
      { name: "DMU75", qty: 3 },
    ],
    minQty: 6,
    checkedOutTo: null,
  },
  {
    sku: "FM-200-5FLT",
    name: '2" 5-flute face mill',
    type: "Face mill",
    manufacturer: "Kennametal",
    locations: [
      { name: "Crib A", qty: 2 },
      { name: "Haas VF-2", qty: 1 },
    ],
    minQty: 2,
    checkedOutTo: null,
  },
  {
    sku: "EF-MIT-375",
    name: "Mechanical edge finder",
    type: "Setup",
    manufacturer: "Mitutoyo",
    locations: [{ name: "Crib A", qty: 3 }],
    minQty: 2,
    checkedOutTo: null,
  },
  {
    sku: "EM-312-3FL",
    name: '5/16" 3-flute carbide end mill',
    type: "End mill",
    manufacturer: "Harvey",
    locations: [
      { name: "Crib B", qty: 5 },
      { name: "DMU75", qty: 2 },
    ],
    minQty: 4,
    checkedOutTo: null,
  },
  {
    sku: "PAR-SET-6",
    name: "1/8–1/2 parallel set",
    type: "Setup",
    manufacturer: "Suburban",
    locations: [{ name: "Crib A", qty: 1 }],
    minQty: 1,
    checkedOutTo: "Setup 2",
  },
];

function onHand(tool: Tool) {
  return tool.locations.reduce((sum, loc) => sum + loc.qty, 0);
}

function locationTotals(tools: Tool[]) {
  const totals = new Map<string, number>();
  for (const tool of tools) {
    for (const loc of tool.locations) {
      totals.set(loc.name, (totals.get(loc.name) ?? 0) + loc.qty);
    }
  }
  return [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function ToolcribDemoBoard() {
  const [tools, setTools] = useState(SAMPLE_TOOLS);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [checkoutSku, setCheckoutSku] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const totals = useMemo(() => locationTotals(tools), [tools]);
  const checkoutTool = tools.find((tool) => tool.sku === checkoutSku) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesQuery =
        !q ||
        [tool.sku, tool.name, tool.type, tool.manufacturer, ...tool.locations.map((loc) => loc.name)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesLocation = location === "all" || tool.locations.some((loc) => loc.name === location);
      return matchesQuery && matchesLocation;
    });
  }, [tools, query, location]);

  function checkout(sku: string, fromLocation: string) {
    setTools((current) =>
      current.map((tool) => {
        if (tool.sku !== sku) return tool;
        return {
          ...tool,
          checkedOutTo: "SAMPLE operator",
          locations: tool.locations
            .map((loc) => (loc.name === fromLocation ? { ...loc, qty: Math.max(0, loc.qty - 1) } : loc))
            .filter((loc) => loc.qty > 0),
        };
      }),
    );
    setCheckoutSku(null);
    setNotice(`SAMPLE checkout recorded for ${sku} from ${fromLocation}. Demo only — nothing is saved.`);
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        <span className="font-semibold tracking-wide text-amber-50">DEMO · SAMPLE</span>
        {" — "}
        Preview only. Sample crib inventory for a small shop. Checkout does not save.
      </div>

      {notice ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLocation("all")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            location === "all"
              ? "border-amber-400/70 bg-amber-400/15 text-amber-100"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
          )}
        >
          All locations ({tools.reduce((sum, tool) => sum + onHand(tool), 0)})
        </button>
        {totals.map(([name, qty]) => (
          <button
            type="button"
            key={name}
            onClick={() => setLocation(name)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              location === name
                ? "border-amber-400/70 bg-amber-400/15 text-amber-100"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
            )}
          >
            {name} ({qty})
          </button>
        ))}
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search SKU, tool, type, or location…"
        aria-label="Search sample crib inventory"
      />

      <p className="text-sm text-zinc-400">
        Showing <span className="text-zinc-100">{visible.length}</span> of{" "}
        <span className="text-zinc-100">{tools.length}</span> SAMPLE tools
      </p>

      <div className="grid gap-3 md:hidden">
        {visible.map((tool) => (
          <article key={tool.sku} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <ToolRowHeader tool={tool} />
            <LocationChips locations={tool.locations} />
            <div className="mt-4">
              <Button size="sm" onClick={() => setCheckoutSku(tool.sku)} disabled={onHand(tool) === 0}>
                Check out
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Tool</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Locations</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Checkout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950/60">
            {visible.map((tool) => (
              <tr key={tool.sku} className="align-top">
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{tool.sku}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-50">{tool.name}</div>
                  <div className="text-xs text-zinc-400">
                    {tool.manufacturer} · {tool.type}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-200">{onHand(tool)}</td>
                <td className="px-4 py-3">
                  <LocationChips locations={tool.locations} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tool={tool} />
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" onClick={() => setCheckoutSku(tool.sku)} disabled={onHand(tool) === 0}>
                    Check out
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12 text-center text-sm text-zinc-400">
          No SAMPLE tools match this search. Clear the query or pick All locations.
        </div>
      ) : null}

      {checkoutTool ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/60 p-4 sm:place-items-center">
          <div
            role="dialog"
            aria-labelledby="checkout-title"
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">DEMO · SAMPLE</p>
            <h2 id="checkout-title" className="mt-2 text-xl font-semibold text-zinc-50">
              Check out {checkoutTool.name}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Preview only. Pick a crib or machine location. Nothing is written to a real shop.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {checkoutTool.locations.map((loc) => (
                <Button key={loc.name} size="sm" onClick={() => checkout(checkoutTool.sku, loc.name)}>
                  {loc.name} ({loc.qty})
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => setCheckoutSku(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToolRowHeader({ tool }: { tool: Tool }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-mono text-xs text-zinc-400">{tool.sku}</p>
        <h2 className="text-lg font-semibold leading-tight">{tool.name}</h2>
        <p className="text-sm text-zinc-400">
          {tool.manufacturer} · {tool.type} · {onHand(tool)} on hand
        </p>
      </div>
      <StatusBadge tool={tool} />
    </div>
  );
}

function LocationChips({ locations }: { locations: LocationQty[] }) {
  if (locations.length === 0) {
    return <p className="mt-3 text-sm text-zinc-500">No stock at a location</p>;
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {locations.map((loc) => (
        <span
          key={loc.name}
          className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200"
        >
          {loc.name} ({loc.qty})
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ tool }: { tool: Tool }) {
  if (tool.checkedOutTo) {
    return <Badge variant="soon">Out · {tool.checkedOutTo}</Badge>;
  }
  if (onHand(tool) < tool.minQty) {
    return <Badge variant="overdue">Low</Badge>;
  }
  return <Badge variant="ok">In crib</Badge>;
}
