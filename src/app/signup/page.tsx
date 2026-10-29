"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setOk(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const displayName = String(formData.get("displayName") ?? "");

    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, avatar: "letter" } },
      });

      if (error) {
        setError(error.message);
        return;
      }

      try {
        localStorage.setItem(
          "man9oor_remembered",
          JSON.stringify({ name: displayName, avatar: "letter" }),
        );
      } catch {}

      if (data.session) {
        router.push("/desktop");
        router.refresh();
      } else {
        setOk("Check your email to confirm your account, then come back and sign in.");
      }
    });
  }

  return (
    <div className="xp-login-bg">
      <div className="xp-login-topbar">
        <div className="brand">
          <svg width="26" height="26" viewBox="0 0 24 24">
            <rect x="2" y="2" width="9" height="9" fill="#f25022" />
            <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
            <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
            <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
          </svg>
          <span>Create a user account</span>
        </div>
      </div>
      <div className="xp-login-divider" />

      <div className="xp-login-body">
        <div className="xp-login-wrap">
          <div className="xp-login-hint">
            <h2>Set up a new account</h2>
            <p>Pick a name — this is what shows on your login tile.</p>
            <p>Your email and password unlock the desktop.</p>
          </div>

          <form action={onSubmit} className="xp-form-panel">
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>New account</div>
            <label>Display name (2–24)</label>
            <input
              className="xp-input"
              name="displayName"
              required
              autoFocus
              minLength={2}
              maxLength={24}
            />
            <label>Email</label>
            <input className="xp-input" name="email" type="email" required maxLength={254} />
            <label>Password (6–72 chars)</label>
            <input
              className="xp-input"
              name="password"
              type="password"
              minLength={6}
              maxLength={72}
              required
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <Link href="/login" className="xp-btn">
                Back
              </Link>
              <button className="xp-btn xp-btn-primary" disabled={pending}>
                {pending ? "Creating..." : "Create account"}
              </button>
            </div>
            {error && <div className="xp-error">{error}</div>}
            {ok && <div className="xp-ok">{ok}</div>}
          </form>
        </div>
      </div>

      <div className="xp-login-bottom">
        <div>man9oor XP · Home Edition</div>
        <div>© 2026 man9oor</div>
      </div>
    </div>
  );
}
