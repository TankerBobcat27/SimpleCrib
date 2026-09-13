"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { brand, productLineTitle, productMark } from "@/lib/brand";
import { canEditGages, canEditTools, canImportExport, canSeeDueWeekInbox, type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function ShopChrome({
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
  const pathname = usePathname();
  const isToolcrib = pathname.includes("/toolcrib");
  const line = isToolcrib ? brand.toolcribLine : brand.productLine;

  return (
    <div className="grid gap-3">
      <div>
        <Link href="/" className="group block">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 group-hover:text-amber-300/80">
            {productMark(line)}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 group-hover:text-amber-100">
            {productLineTitle(line)}
          </h1>
        </Link>
        <p className="text-sm text-zinc-400">
          {shopName} · signed in as {userName} ({role})
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ProductTab href={`/t/${slug}`} active={!isToolcrib}>
          Calibration
        </ProductTab>
        <ProductTab href={`/t/${slug}/toolcrib`} active={isToolcrib}>
          Toolcrib
        </ProductTab>
      </div>

      <nav className="flex flex-wrap gap-2">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/#pricing">Subscribe</NavLink>
        {isToolcrib ? (
          <>
            <NavLink href={`/t/${slug}/toolcrib`}>Crib inventory</NavLink>
            <NavLink href={`/t/${slug}/toolcrib/moves`}>Moves</NavLink>
            {canEditTools(role) ? (
              <Button asChild size="sm">
                <Link href={`/t/${slug}/toolcrib/new`}>Add tool</Link>
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <NavLink href={`/t/${slug}`}>Inventory</NavLink>
            <NavLink href={`/t/${slug}/due`}>Due board</NavLink>
            {canSeeDueWeekInbox(role) ? <NavLink href={`/t/${slug}/due-week`}>Due this week</NavLink> : null}
            {canImportExport(role) ? <NavLink href={`/t/${slug}/import`}>CSV</NavLink> : null}
            {canEditGages(role) ? (
              <Button asChild size="sm">
                <Link href={`/t/${slug}/gages/new`}>Add gage</Link>
              </Button>
            ) : null}
          </>
        )}
      </nav>
    </div>
  );
}

function ProductTab({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm",
        active
          ? "border-amber-400/70 bg-amber-400/15 text-amber-100"
          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800",
      )}
    >
      {children}
    </Link>
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
