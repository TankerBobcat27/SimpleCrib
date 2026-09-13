import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/tenant";

export default async function AppRedirectPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  redirect(`/t/${user.tenantSlug}`);
}
