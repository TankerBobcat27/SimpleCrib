import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DueFilter } from "@/lib/gages";

type Counts = {
  all: number;
  overdue: number;
  thisWeek: number;
  dueSoon: number;
  out: number;
};

const FILTERS: { key: DueFilter; label: string; countKey: keyof Counts }[] = [
  { key: "all", label: "All", countKey: "all" },
  { key: "overdue", label: "Overdue", countKey: "overdue" },
  { key: "this_week", label: "This week", countKey: "thisWeek" },
  { key: "due_soon", label: "Due soon", countKey: "dueSoon" },
  { key: "out", label: "Out of service", countKey: "out" },
];

export function DueFilters({
  basePath,
  current,
  counts,
  query,
}: {
  basePath: string;
  current: DueFilter;
  counts: Counts;
  query?: Record<string, string | undefined>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {FILTERS.map((filter) => {
        const params = new URLSearchParams();
        if (query?.q) params.set("q", query.q);
        if (query?.type) params.set("type", query.type);
        if (query?.status) params.set("status", query.status);
        if (query?.location) params.set("location", query.location);
        params.set("due", filter.key);
        const href = `${basePath}?${params.toString()}`;
        const active = current === filter.key;
        return (
          <Link
            key={filter.key}
            href={href}
            className={cn(
              "rounded-xl border px-3 py-3 text-left transition-colors",
              active
                ? "border-amber-400/70 bg-amber-400/10 text-amber-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600",
            )}
          >
            <div className="text-2xl font-semibold tabular-nums">{counts[filter.countKey]}</div>
            <div className="text-xs uppercase tracking-wide text-zinc-400">{filter.label}</div>
          </Link>
        );
      })}
    </div>
  );
}
