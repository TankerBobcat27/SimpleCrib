import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ShopChrome } from "@/components/shop-chrome";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/roles";

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <ShopChrome slug={slug} shopName={shopName} userName={userName} role={role} />
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
      </div>
    </header>
  );
}
