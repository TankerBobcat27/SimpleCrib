import { updateGageStatusAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function StatusToggle({
  slug,
  id,
  status,
  canEdit,
}: {
  slug: string;
  id: string;
  status: string;
  canEdit: boolean;
}) {
  const next = status === "available" ? "out_of_service" : "available";
  const label = status === "available" ? "Mark out of service" : "Mark available";

  if (!canEdit) {
    return (
      <span className={status === "available" ? "text-emerald-300" : "text-rose-300"}>
        {status === "available" ? "Available" : "Out of service"}
      </span>
    );
  }

  return (
    <form action={updateGageStatusAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <Button type="submit" variant={status === "available" ? "secondary" : "default"} size="sm">
        {label}
      </Button>
    </form>
  );
}
