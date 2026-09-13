import type { LocationSplit } from "@/lib/tools";
import { MAX_TOOL_LOCATIONS } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function LocationChips({
  locations,
  className,
  emptyLabel = "No stock at a location",
}: {
  locations: LocationSplit[];
  className?: string;
  emptyLabel?: string;
}) {
  if (locations.length === 0) {
    return <p className={cn("text-sm text-zinc-500", className)}>{emptyLabel}</p>;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {locations.slice(0, MAX_TOOL_LOCATIONS).map((loc) => (
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
