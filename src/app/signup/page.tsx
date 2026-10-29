"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signupAction } from "../login/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    setOk(null);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (result?.error) setError(result.error);
      if (result?.ok) setOk(result.ok);
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
            <label>Display name</label>
            <input className="xp-input" name="displayName" required autoFocus />
            <label>Email</label>
            <input className="xp-input" name="email" type="email" required />
            <label>Password (min 6 chars)</label>
            <input className="xp-input" name="password" type="password" minLength={6} required />
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
