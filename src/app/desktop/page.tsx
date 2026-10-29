import { createClient } from "@/lib/supabase/server";
import Desktop from "./Desktop";
import type { AvatarKey } from "@/components/Avatar";

export const instant = false;

const ADMIN_EMAIL = "mansoor7zx@gmail.com";

export default async function DesktopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Desktop
        signedIn={false}
        displayName="Guest"
        email=""
        avatar="letter"
        isAdmin={false}
      />
    );
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";
  const avatar = ((user.user_metadata?.avatar as AvatarKey | undefined) ?? "letter") as AvatarKey;
  const isAdmin = (user.email ?? "").toLowerCase() === ADMIN_EMAIL;

  return (
    <Desktop
      signedIn
      displayName={displayName}
      email={user.email ?? ""}
      avatar={avatar}
      isAdmin={isAdmin}
    />
  );
}
