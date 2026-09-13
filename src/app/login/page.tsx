import Link from "next/link";
import { brand } from "@/lib/brand";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">{brand.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Log in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Demo shop uses SAMPLE gages only. Email <span className="text-zinc-200">admin@demo.shopcal.test</span>{" "}
          / password <span className="text-zinc-200">DemoAdmin!2026</span>
        </p>
      </div>
      {params.error ? (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {params.error === "missing-shop"
            ? "That shop is missing. Log in again or start a new shop."
            : "Could not sign in. Check email and password."}
        </p>
      ) : null}
      <LoginForm nextPath={params.next} />
      <p className="text-sm text-zinc-500">
        New shop?{" "}
        <Link href="/signup" className="text-amber-300 hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
