import type { Metadata } from "next";
import Link from "next/link";
import { ToolcribDemoBoard } from "@/components/toolcrib-demo-board";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.productName} · Toolcrib demo`,
  description: `See what ${brand.productName} Toolcrib looks like. SAMPLE crib inventory and checkout preview for small US machine shops.`,
};

export default function ToolcribDemoPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_28%),linear-gradient(#09090b,#09090b)]">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
        <div>
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-amber-300/80 hover:underline">
            {brand.productName}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Toolcrib demo</h1>
          <p className="text-sm text-zinc-400">Built for small shops. SAMPLE inventory only.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/login?next=/t/demo/toolcrib">Open live Toolcrib</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Subscribe</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-16">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-amber-200">Public product preview</p>
          <p className="mt-2 text-lg text-zinc-400">
            Public SAMPLE preview below. The live shop at{" "}
            <Link href="/login?next=/t/demo/toolcrib" className="text-amber-300 hover:underline">
              /t/demo/toolcrib
            </Link>{" "}
            saves checkout and return — quantity splits across location chips.
          </p>
        </section>
        <ToolcribDemoBoard />
      </main>
    </div>
  );
}
