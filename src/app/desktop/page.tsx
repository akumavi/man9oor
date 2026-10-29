import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Desktop from "./Desktop";

export const instant = false;

export default async function DesktopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  return <Desktop displayName={displayName} email={user.email ?? ""} />;
}
