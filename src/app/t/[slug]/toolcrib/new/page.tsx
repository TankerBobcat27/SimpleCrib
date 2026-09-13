import Link from "next/link";
import { createToolAction } from "@/lib/tool-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { canEditTools } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";
import { DEFAULT_CRIB_LOCATION, moveErrorMessage, TOOL_TYPES } from "@/lib/tools";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const shop = await requireShop(slug);
  if (!canEditTools(shop.role)) {
    redirect(`/t/${slug}/toolcrib?error=forbidden`);
  }
  const error = moveErrorMessage(query.error);

  return (
    <div className="grid max-w-xl gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Add tool</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Starts as one location line. Check out later to split quantity across machines.
        </p>
      </div>
      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}
      <form action={createToolAction} className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        <input type="hidden" name="slug" value={slug} />
        <div className="grid gap-2">
          <Label htmlFor="toolNumber">Tool #</Label>
          <Input id="toolNumber" name="toolNumber" required placeholder="EM-375-4FL" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder='3/8" 4-flute end mill' />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm"
            defaultValue="End mill"
          >
            {TOOL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" name="manufacturer" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="location">Starting location</Label>
            <Input id="location" name="location" defaultValue={DEFAULT_CRIB_LOCATION} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} required />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save tool</Button>
          <Button asChild type="button" variant="secondary">
            <Link href={`/t/${slug}/toolcrib`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
