"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { moveGageLocationAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectClass =
  "flex h-9 w-full min-w-[10.5rem] rounded-md border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:cursor-not-allowed disabled:opacity-60";

function MoveSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Moving…" : label}
    </Button>
  );
}

function LocationSelect({
  id,
  location,
  locations,
}: {
  id: string;
  location: string;
  locations: string[];
}) {
  const { pending } = useFormStatus();
  const options = locations.includes(location) ? locations : [location, ...locations];

  return (
    <select
      id={`move-loc-${id}`}
      name="location"
      defaultValue={location}
      className={selectClass}
      disabled={pending}
      aria-label="Shop location"
    >
      {options.filter(Boolean).map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

function AddFields() {
  const { pending } = useFormStatus();
  return (
    <div className="grid gap-2">
      <Input
        name="newLocation"
        placeholder="e.g. Haas VF-3"
        required
        autoFocus
        maxLength={80}
        disabled={pending}
        aria-label="New shop location"
      />
      <MoveSubmit label="Add & move" />
    </div>
  );
}

export function LocationMove({
  slug,
  id,
  location,
  locations,
  canEdit,
  layout = "inline",
}: {
  slug: string;
  id: string;
  location: string;
  locations: string[];
  canEdit: boolean;
  layout?: "inline" | "panel";
}) {
  const [adding, setAdding] = useState(false);

  const body = !canEdit ? (
    <p className="text-sm text-zinc-300">{location}</p>
  ) : (
    <div className="grid gap-2">
      {adding ? (
        <form action={moveGageLocationAction} className="grid gap-1.5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={id} />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Add location</p>
          <AddFields />
          <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <form action={moveGageLocationAction} className="grid gap-1.5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={id} />
          <label htmlFor={`move-loc-${id}`} className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Move location
          </label>
          <div className={layout === "panel" ? "grid gap-2" : "flex flex-wrap items-center gap-2"}>
            <LocationSelect id={id} location={location} locations={locations} />
            <MoveSubmit label={layout === "panel" ? "Check out / in" : "Move"} />
            <Button type="button" size="sm" variant="secondary" onClick={() => setAdding(true)}>
              Add location
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  if (layout === "panel") {
    return (
      <section className="grid gap-3 rounded-xl border border-amber-400/25 bg-zinc-900/80 p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">Check out / check in</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Move this gage to a known shop location. Add a crib or machine name if it is not in the list yet.
            Due dates and other fields stay on the Edit form.
          </p>
        </div>
        {body}
      </section>
    );
  }

  return body;
}
