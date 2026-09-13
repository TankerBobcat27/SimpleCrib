"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { moveToolQuantityAction } from "@/lib/tool-actions";
import {
  defaultCheckinDestination,
  defaultCheckinSource,
  defaultCheckoutSource,
  type LocationSplit,
  type MoveIntent,
} from "@/lib/tool-core";

function SubmitButton({ intent }: { intent: MoveIntent }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : intent === "checkin" ? "Return to crib" : "Check out"}
    </Button>
  );
}

export function ToolMoveForm({
  slug,
  toolId,
  locations,
  destinations,
  intent,
  returnTo,
}: {
  slug: string;
  toolId: string;
  locations: LocationSplit[];
  destinations: string[];
  intent: MoveIntent;
  returnTo: string;
}) {
  const sources = locations.filter((loc) => loc.qty > 0);
  const defaultFrom =
    intent === "checkin" ? defaultCheckinSource(locations) : defaultCheckoutSource(locations);
  const defaultTo = intent === "checkin" ? defaultCheckinDestination(locations) : "";
  const [fromLocation, setFromLocation] = useState(defaultFrom);
  const [toLocation, setToLocation] = useState(defaultTo);
  const selectedSource = sources.find((loc) => loc.name === fromLocation);
  const maxQty = selectedSource?.qty ?? 0;
  const listId = useMemo(() => `dest-${toolId}-${intent}`, [toolId, intent]);

  if (sources.length === 0) {
    return <p className="text-sm text-zinc-500">No quantity left to move on this tool.</p>;
  }

  const hasFloor = locations.some((loc) => !/^crib\b/i.test(loc.name) && loc.qty > 0);
  if (intent === "checkin" && !hasFloor) {
    return (
      <p className="text-sm text-zinc-500">
        Nothing is on the floor yet. Check out a quantity first, then return it here.
      </p>
    );
  }

  return (
    <form action={moveToolQuantityAction} className="grid gap-3">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="toolId" value={toolId} />
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor={`from-${toolId}-${intent}`}>From</Label>
          <select
            id={`from-${toolId}-${intent}`}
            name="fromLocation"
            value={fromLocation}
            onChange={(event) => setFromLocation(event.target.value)}
            className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
            required
          >
            {sources.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name} ({loc.qty})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`qty-${toolId}-${intent}`}>Quantity</Label>
          <Input
            id={`qty-${toolId}-${intent}`}
            name="quantity"
            type="number"
            min={1}
            max={maxQty || undefined}
            defaultValue={Math.min(2, maxQty) || 1}
            required
          />
          <p className="text-xs text-zinc-500">
            Can be less than on-hand. {maxQty} at {fromLocation || "source"}.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`to-${toolId}-${intent}`}>
            {intent === "checkin" ? "Return to" : "Destination"}
          </Label>
          <Input
            id={`to-${toolId}-${intent}`}
            name="toLocation"
            list={listId}
            value={toLocation}
            onChange={(event) => setToLocation(event.target.value)}
            placeholder={intent === "checkin" ? "Crib A" : "Workstation / machine"}
            required
          />
          <datalist id={listId}>
            {destinations.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(intent === "checkin" ? ["Crib A", "Crib B"] : destinations.filter((name) => !/^crib\b/i.test(name)))
          .slice(0, 6)
          .map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setToLocation(name)}
              className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 hover:border-amber-400/60 hover:text-amber-100"
            >
              {name}
            </button>
          ))}
      </div>

      <div>
        <SubmitButton intent={intent} />
      </div>
    </form>
  );
}
