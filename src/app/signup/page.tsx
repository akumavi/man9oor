"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit() {
    setError(null);
    const name = displayName.trim();
    if (name.length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name, avatar: "letter" } },
      });

      if (error) {
        setError(error.message);
        return;
      }

      try {
        localStorage.setItem(
          "man9oor_remembered",
          JSON.stringify({ name, avatar: "letter" }),
        );
      } catch {}

      if (data.session) {
        router.push("/desktop");
        router.refresh();
      } else {
        setSent(email);
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
          {sent ? (
            <div
              className="xp-form-panel"
              style={{
                gridColumn: "1 / -1",
                maxWidth: 480,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>📬</div>
              <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}>
                Check your email
              </div>
              <p style={{ fontSize: 14, color: "#333", marginBottom: 10 }}>
                We sent a confirmation link to:
              </p>
              <p
                style={{
                  fontWeight: "bold",
                  background: "#fff",
                  border: "1px solid #c0c0c0",
                  padding: "6px 10px",
                  fontSize: 14,
                  wordBreak: "break-all",
                }}
              >
                {sent}
              </p>
              <p style={{ fontSize: 13, color: "#555", marginTop: 14 }}>
                Open it and click <strong>Confirm email address</strong> — then
                come back and sign in.
              </p>
              <p style={{ fontSize: 12, color: "#777", marginTop: 10 }}>
                Can&apos;t find it? Check your Spam / Promotions folder.
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center" }}>
                <Link href="/login" className="xp-btn xp-btn-primary">
                  Go to sign in
                </Link>
                <button
                  className="xp-btn"
                  onClick={() => {
                    setSent(null);
                    setPassword("");
                  }}
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="xp-login-hint">
                <h2>Set up a new account</h2>
                <p>Pick a name — this is what shows on your login tile.</p>
                <p>Your email and password unlock the desktop.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
                className="xp-form-panel"
              >
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>New account</div>
                <label>Display name (2–24)</label>
                <input
                  className="xp-input"
                  type="text"
                  required
                  autoFocus
                  minLength={2}
                  maxLength={24}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <label>Email</label>
                <input
                  className="xp-input"
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label>Password (6–72 chars)</label>
                <input
                  className="xp-input"
                  type="password"
                  minLength={6}
                  maxLength={72}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              </form>
            </>
          )}
        </div>
      </div>

      <div className="xp-login-bottom">
        <div>man9oor XP · Home Edition</div>
        <div>© 2026 man9oor</div>
      </div>
    </div>
  );
}
