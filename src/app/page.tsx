import Link from "next/link";
import { BackupBanner } from "@/components/backup-banner";
import { Button } from "@/components/ui/button";
import { brand, productLineTitle } from "@/lib/brand";
import { getSessionUser } from "@/lib/tenant";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let user: Awaited<ReturnType<typeof getSessionUser>> = null;
  try {
    user = await getSessionUser();
  } catch {
    user = null;
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_28%),linear-gradient(#09090b,#09090b)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">{brand.productName}</p>
          <p className="text-lg font-semibold">{productLineTitle()}</p>
        </div>
        <div className="flex gap-2">
          {user ? (
            <Button asChild>
              <Link href={`/t/${user.tenantSlug}`}>Open shop</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="secondary">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Start a shop</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-4 pb-16 pt-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="grid gap-4">
            <p className="text-sm font-medium text-amber-200">For 1–40 person US machine shops</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              Know what is due before the auditor does.
            </h1>
            <p className="max-w-xl text-lg text-zinc-400">
              A hosted gage / cal due board that is faster than Excel and the clipboard, with daily backups
              and a CSV you can take with you. Not ERP. Not ProShop. Not CRIBWISE. Not eQMS.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">Open demo shop</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">Create your shop</Link>
              </Button>
            </div>
          </div>
          <BackupBanner />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <PriceCard
            name={brand.productLine}
            price="$39"
            detail="Due board, history, CSV, daily backups."
          />
          <PriceCard
            name="Toolcrib"
            price="$39"
            detail="Crib / checkout — Week 3. Placeholder only."
          />
          <PriceCard
            name="Pro"
            price="$75"
            detail="Both products. Checkout is Week 2."
          />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">What Week 1 ships</h2>
          <ul className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
            <li>Path-based tenant: <code className="text-amber-200">/t/demo</code></li>
            <li>Roles: admin, quality, operator (status only)</li>
            <li>Due filters + admin “due this week” inbox</li>
            <li>Available / Out of service on the shop floor</li>
            <li>CSV import and export</li>
            <li>SAMPLE gages only — no customer live inventory</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function PriceCard({ name, price, detail }: { name: string; price: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
      <p className="text-sm uppercase tracking-wide text-zinc-500">{name}</p>
      <p className="mt-2 text-3xl font-semibold">
        {price}
        <span className="text-base font-normal text-zinc-500">/mo</span>
      </p>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
      <p className="mt-4 text-xs text-zinc-500">Stripe checkout is Week 2. These are placeholders.</p>
    </div>
  );
}
