import Link from "next/link";
import { createShopAction } from "@/lib/actions";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">{brand.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Start a shop</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Creates a new tenant and an admin user. Toolcrib is not part of Week 1.
        </p>
      </div>
      {params.error ? (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          Need shop name, your name, email, and an 8+ character password.
        </p>
      ) : null}
      <form action={createShopAction} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="shopName">Shop name</Label>
          <Input id="shopName" name="shopName" required placeholder="Northside Machine" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <Button type="submit">Create shop</Button>
      </form>
      <p className="text-sm text-zinc-500">
        Already have access?{" "}
        <Link href="/login" className="text-amber-300 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
