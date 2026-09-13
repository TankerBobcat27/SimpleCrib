import { saveGageAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Gage } from "@/lib/db/schema";
import { GAGE_TYPES } from "@/lib/gages";
import Link from "next/link";

const selectClass =
  "flex h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70";

export function GageForm({
  slug,
  gage,
  canEdit,
}: {
  slug: string;
  gage?: Gage;
  canEdit: boolean;
}) {
  return (
    <form action={saveGageAction} className="grid gap-6">
      <input type="hidden" name="slug" value={slug} />
      {gage ? <input type="hidden" name="id" value={gage.id} /> : null}

      <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Required</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shop ID" name="shopId" defaultValue={gage?.shopId} required disabled={!canEdit} />
          <Field label="Name" name="name" defaultValue={gage?.name} required disabled={!canEdit} />
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <select id="type" name="type" defaultValue={gage?.type ?? "Equipment"} className={selectClass} disabled={!canEdit}>
              {GAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <Field label="Location" name="location" defaultValue={gage?.location ?? "Quality Lab"} disabled={!canEdit} />
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Shop defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={gage?.status ?? "available"}
              className={selectClass}
              disabled={!canEdit}
            >
              <option value="available">Available</option>
              <option value="out_of_service">Out of service</option>
            </select>
          </div>
          <Field label="Manufacturer" name="manufacturer" defaultValue={gage?.manufacturer ?? ""} disabled={!canEdit} />
          <Field label="Serial" name="serial" defaultValue={gage?.serial ?? ""} disabled={!canEdit} />
          <Field label="Last calibration" name="lastCal" type="date" defaultValue={gage?.lastCal ?? ""} disabled={!canEdit} />
          <Field label="Next due" name="nextDue" type="date" defaultValue={gage?.nextDue ?? ""} disabled={!canEdit} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={gage?.notes ?? ""} disabled={!canEdit} />
        </div>
      </section>

      {canEdit ? (
        <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Calibration event</h2>
          <p className="text-sm text-zinc-400">
            Saving a last-cal or next-due change writes a tenant-scoped history row.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="historyResult">Result</Label>
              <select id="historyResult" name="historyResult" defaultValue="pass" className={selectClass}>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="limited">Limited</option>
              </select>
            </div>
            <Field label="History note" name="historyNote" />
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {canEdit ? <Button type="submit">{gage ? "Save gage" : "Add gage"}</Button> : null}
        <Button asChild variant="secondary">
          <Link href={`/t/${slug}`}>Back to inventory</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
