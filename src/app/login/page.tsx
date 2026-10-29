"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
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
          <span>man9oor&nbsp;XP</span>
        </div>
      </div>
      <div className="xp-login-divider" />

      <div className="xp-login-body">
        <div className="xp-login-wrap">
          <div className="xp-login-hint">
            <h2>To begin, click your user name</h2>
            <p>After you log on, you can add or change accounts.</p>
            <p>Just go to Control Panel and click User Accounts.</p>
          </div>

          <div>
            {!showForm ? (
              <div className="xp-user-card" onClick={() => setShowForm(true)}>
                <div className="xp-user-avatar">M</div>
                <div>
                  <div className="xp-user-name">Mansoor</div>
                  <div className="xp-user-sub">Click to sign in</div>
                </div>
              </div>
            ) : (
              <form action={onSubmit} className="xp-form-panel">
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>Sign in</div>
                <label>Email</label>
                <input className="xp-input" name="email" type="email" required autoFocus />
                <label>Password</label>
                <input className="xp-input" name="password" type="password" required />
                <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="xp-btn"
                    onClick={() => setShowForm(false)}
                    disabled={pending}
                  >
                    Cancel
                  </button>
                  <button className="xp-btn xp-btn-primary" disabled={pending}>
                    {pending ? "Signing in..." : "OK →"}
                  </button>
                </div>
                {error && <div className="xp-error">{error}</div>}
                <div style={{ marginTop: 10, fontSize: 12 }}>
                  New here?{" "}
                  <Link href="/signup" style={{ color: "#0058e6", textDecoration: "underline" }}>
                    Create an account
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="xp-login-bottom">
        <div>
          <span style={{ marginRight: 8 }}>⏻</span>
          Turn off computer
        </div>
        <div>After you log on, you can add or change accounts.</div>
      </div>
    </div>
  );
}
