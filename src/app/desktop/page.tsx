import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Desktop from "./Desktop";
import type { AvatarKey } from "@/components/Avatar";

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

  const avatar = ((user.user_metadata?.avatar as AvatarKey | undefined) ?? "letter") as AvatarKey;

  const isAdmin = (user.email ?? "").toLowerCase() === "mansoor7zx@gmail.com";

  return (
    <Desktop
      displayName={displayName}
      email={user.email ?? ""}
      avatar={avatar}
      isAdmin={isAdmin}
    />
  );
}
