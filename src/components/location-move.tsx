"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { moveGageLocationAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADD_NEW = "__new__";

const selectClass =
  "flex h-9 w-full min-w-[10.5rem] rounded-md border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:cursor-not-allowed disabled:opacity-60";

function MoveSelect({
  id,
  location,
  locations,
  onAdd,
}: {
  id: string;
  location: string;
  locations: string[];
  onAdd: () => void;
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
      aria-label="Move location"
      onChange={(event) => {
        if (event.target.value === ADD_NEW) {
          event.target.value = location;
          onAdd();
          return;
        }
        event.currentTarget.form?.requestSubmit();
      }}
    >
      {options.filter(Boolean).map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      <option value={ADD_NEW}>+ Add location…</option>
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
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Moving…" : "Add & move"}
        </Button>
      </div>
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
      <form action={moveGageLocationAction} className="grid gap-1.5">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={id} />
        <label htmlFor={`move-loc-${id}`} className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Move location
        </label>
        <MoveSelect id={id} location={location} locations={locations} onAdd={() => setAdding(true)} />
      </form>
      {adding ? (
        <form action={moveGageLocationAction} className="grid gap-1.5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="id" value={id} />
          <AddFields />
          <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </form>
      ) : null}
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
