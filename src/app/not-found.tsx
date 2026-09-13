import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-full max-w-md place-content-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-sm text-zinc-400">That gage or page is not in this shop.</p>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}
