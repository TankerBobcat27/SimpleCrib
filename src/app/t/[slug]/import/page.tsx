import Link from "next/link";
import { importGagesAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { canImportExport } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";
import { redirect } from "next/navigation";

export default async function ImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ imported?: string; skipped?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const shop = await requireShop(slug);
  if (!canImportExport(shop.role)) {
    redirect(`/t/${slug}?error=forbidden`);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold">CSV import / export</h2>
        <p className="text-sm text-zinc-400">
          Export anytime. Import upserts by shop ID inside this tenant only. Your data is backed up daily;
          export anytime.
        </p>
      </div>

      {query.imported ? (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Imported {query.imported} row(s)
          {query.skipped && query.skipped !== "0" ? ` · ${query.skipped} skipped` : ""}.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {query.error === "empty" ? "Choose a CSV file." : "CSV needs shop_id and name columns."}
        </p>
      ) : null}

      <section className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h3 className="font-medium">Export</h3>
        <p className="text-sm text-zinc-400">Downloads every gage in {shop.tenantName}, scoped by tenant_id.</p>
        <Button asChild variant="secondary">
          <a href={`/api/export?slug=${slug}`}>Download CSV</a>
        </Button>
      </section>

      <section className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h3 className="font-medium">Import</h3>
        <p className="text-sm text-zinc-400">
          Columns: shop_id, name, type, manufacturer, serial, location, last_cal, next_due, status, notes.
        </p>
        <form action={importGagesAction} className="grid gap-3">
          <input type="hidden" name="slug" value={slug} />
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-100"
          />
          <Button type="submit">Import CSV</Button>
        </form>
      </section>

      <Button asChild variant="ghost">
        <Link href={`/t/${slug}`}>Back to inventory</Link>
      </Button>
    </div>
  );
}
