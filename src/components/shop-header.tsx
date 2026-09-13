import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { productLineTitle, productMark } from "@/lib/brand";
import type { Role } from "@/lib/roles";
import { canEditGages, canImportExport, canSeeDueWeekInbox } from "@/lib/roles";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
}

export function ShopHeader({
  slug,
  shopName,
  userName,
  role,
}: {
  slug: string;
  shopName: string;
  userName: string;
  role: Role;
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="group block">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 group-hover:text-amber-300/80">{productMark()}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 group-hover:text-amber-100">{productLineTitle()}</h1>
            </Link>
            <p className="text-sm text-zinc-400">
              {shopName} · signed in as {userName} ({role})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/#pricing">Subscribe</Link>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/#pricing">Subscribe</NavLink>
          <NavLink href={`/t/${slug}`}>Inventory</NavLink>
          <NavLink href={`/t/${slug}/due`}>Due board</NavLink>
          {canSeeDueWeekInbox(role) ? <NavLink href={`/t/${slug}/due-week`}>Due this week</NavLink> : null}
          {canImportExport(role) ? <NavLink href={`/t/${slug}/import`}>CSV</NavLink> : null}
          {canEditGages(role) ? (
            <Button asChild size="sm">
              <Link href={`/t/${slug}/gages/new`}>Add gage</Link>
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
