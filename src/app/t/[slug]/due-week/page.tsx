import { GageBoard } from "@/components/gage-board";
import { endOfWeek, startOfWeek, todayIso } from "@/lib/dates";
import { listGages } from "@/lib/gages";
import { canSeeDueWeekInbox } from "@/lib/roles";
import { requireShop } from "@/lib/tenant";
import { redirect } from "next/navigation";

export default async function DueWeekPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await requireShop(slug);
  if (!canSeeDueWeekInbox(shop.role)) {
    redirect(`/t/${slug}?error=forbidden`);
  }

  const items = await listGages(shop.tenantId, { due: "this_week" });
  const start = todayIso(startOfWeek());
  const end = todayIso(endOfWeek());

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold">Due this week</h2>
        <p className="text-sm text-zinc-400">
          Admin inbox for {start} – {end}. Overdue gages stay in this list so nothing slips. Email digest is
          optional later; this in-app list is the Week 1 commit.
        </p>
      </div>
      <GageBoard slug={slug} gages={items} role={shop.role} />
    </div>
  );
}
