"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "../login/actions";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AVATAR_KEYS, AVATAR_LABELS, type AvatarKey } from "@/components/Avatar";

type WindowKind = "me" | "social" | "account" | "admin";
type ViewMode = "icons" | "list" | "columns";

interface OpenWindow {
  id: string;
  kind: WindowKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
}

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@x7kj",
    url: "https://www.instagram.com/x7kj/",
    type: "Shortcut",
    color: "#e1306c",
    icon: "📷",
  },
  {
    name: "YouTube",
    handle: "@uncakuma",
    url: "https://www.youtube.com/@uncakuma",
    type: "Shortcut",
    color: "#ff0000",
    icon: "▶",
  },
  {
    name: "TikTok",
    handle: "@man9supersecretaccount",
    url: "https://www.tiktok.com/@man9supersecretaccount",
    type: "Shortcut",
    color: "#000000",
    icon: "♪",
  },
];

function FileGlyph() {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48">
      <path d="M4 2 h22 l10 10 v34 h-32 z" fill="#ffffff" stroke="#808080" strokeWidth="1" />
      <path d="M26 2 v10 h10" fill="#dcdcdc" stroke="#808080" strokeWidth="1" />
      <line x1="8" y1="20" x2="30" y2="20" stroke="#b0b0b0" />
      <line x1="8" y1="25" x2="30" y2="25" stroke="#b0b0b0" />
      <line x1="8" y1="30" x2="26" y2="30" stroke="#b0b0b0" />
      <line x1="8" y1="35" x2="30" y2="35" stroke="#b0b0b0" />
    </svg>
  );
}

function FolderGlyph() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40">
      <path d="M2 10 h14 l4 4 h26 v22 h-44 z" fill="#f3c969" stroke="#8a6b1f" />
      <path d="M2 10 h14 l4 4 h26 v4 h-44 z" fill="#ffe08a" stroke="#8a6b1f" />
    </svg>
  );
}

function AdminGlyph() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <path d="M24 4 L40 10 L40 24 Q40 38 24 44 Q8 38 8 24 L8 10 Z" fill="#2a7fdc" stroke="#0a3a6c" />
      <path d="M24 4 L40 10 L40 16 L8 16 L8 10 Z" fill="#4a9fff" stroke="#0a3a6c" />
      <circle cx="24" cy="24" r="5" fill="#ffd54f" stroke="#8a6b1f" />
      <rect x="22" y="27" width="4" height="7" fill="#ffd54f" stroke="#8a6b1f" />
    </svg>
  );
}

function AccountGlyph() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <rect x="4" y="8" width="40" height="32" rx="3" fill="#4a7cc8" stroke="#1a3a6c" />
      <rect x="6" y="10" width="36" height="6" fill="#ffffff" opacity="0.3" />
      <circle cx="18" cy="26" r="5" fill="#ffd54f" stroke="#b7791f" />
      <path d="M11 36 Q11 29 18 29 Q25 29 25 36 z" fill="#ffd54f" stroke="#b7791f" />
      <rect x="28" y="22" width="12" height="2" fill="white" />
      <rect x="28" y="27" width="10" height="2" fill="white" />
      <rect x="28" y="32" width="12" height="2" fill="white" />
    </svg>
  );
}

function SocialGlyph({ color, icon }: { color: string; icon: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: color,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: 20,
        boxShadow: "1px 2px 3px #00000055",
      }}
    >
      {icon}
    </div>
  );
}

export default function Desktop({
  signedIn,
  displayName: initialName,
  email,
  avatar: initialAvatar,
  isAdmin,
}: {
  signedIn: boolean;
  displayName: string;
  email: string;
  avatar: AvatarKey;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [avatar, setAvatar] = useState<AvatarKey>(initialAvatar);
  const [wins, setWins] = useState<OpenWindow[]>([]);
  const [selected, setSelected] = useState<WindowKind | null>(null);
  const [folderView, setFolderView] = useState<ViewMode>("icons");
  const [startOpen, setStartOpen] = useState(false);
  const [clock, setClock] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const zRef = useRef(10);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const t = setInterval(update, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function windowTitle(kind: WindowKind) {
    if (kind === "me") return "About Me.txt — Notepad";
    if (kind === "social") return "Social Media";
    if (kind === "admin") return "Control Panel — Users";
    return "My Account";
  }

  function openWindow(kind: WindowKind) {
    const existing = wins.find((w) => w.kind === kind);
    if (existing) {
      bringToFront(existing.id);
      setWins((cur) =>
        cur.map((w) => (w.id === existing.id ? { ...w, minimized: false } : w)),
      );
      return;
    }
    const id = crypto.randomUUID();
    zRef.current += 1;
    const sizes: Record<WindowKind, { w: number; h: number }> = {
      me: { w: 460, h: 360 },
      social: { w: 560, h: 400 },
      account: { w: 520, h: 480 },
      admin: { w: 720, h: 480 },
    };
    setWins((cur) => [
      ...cur,
      {
        id,
        kind,
        title: windowTitle(kind),
        x: 120 + cur.length * 30,
        y: 60 + cur.length * 30,
        w: sizes[kind].w,
        h: sizes[kind].h,
        z: zRef.current,
        minimized: false,
      },
    ]);
  }

  function closeWindow(id: string) {
    setWins((cur) => cur.filter((w) => w.id !== id));
  }

  function bringToFront(id: string) {
    zRef.current += 1;
    const z = zRef.current;
    setWins((cur) => cur.map((w) => (w.id === id ? { ...w, z } : w)));
  }

  function toggleMinimize(id: string) {
    setWins((cur) => cur.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }

  function startDrag(id: string, e: React.MouseEvent) {
    bringToFront(id);
    const win = wins.find((w) => w.id === id);
    if (!win) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = win.x;
    const originY = win.y;
    const onMove = (ev: MouseEvent) => {
      setWins((cur) =>
        cur.map((w) =>
          w.id === id
            ? {
                ...w,
                x: Math.max(0, originX + (ev.clientX - startX)),
                y: Math.max(0, originY + (ev.clientY - startY)),
              }
            : w,
        ),
      );
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function updateRemembered(name: string, av: AvatarKey) {
    try {
      const raw = localStorage.getItem("man9oor_remembered");
      if (raw) {
        localStorage.setItem("man9oor_remembered", JSON.stringify({ name, avatar: av }));
      }
    } catch {}
  }

  return (
    <div
      className="xp-desktop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setSelected(null);
          setStartOpen(false);
        }
      }}
    >
      <div className="xp-icon-grid">
        <div
          className={`xp-icon ${selected === "me" ? "selected" : ""}`}
          onClick={() => setSelected("me")}
          onDoubleClick={() => openWindow("me")}
        >
          <div className="glyph">
            <FileGlyph />
          </div>
          <div className="label">About Me.txt</div>
        </div>
        <div
          className={`xp-icon ${selected === "social" ? "selected" : ""}`}
          onClick={() => setSelected("social")}
          onDoubleClick={() => openWindow("social")}
        >
          <div className="glyph">
            <FolderGlyph />
          </div>
          <div className="label">Social Media</div>
        </div>
        {signedIn && (
          <div
            className={`xp-icon ${selected === "account" ? "selected" : ""}`}
            onClick={() => setSelected("account")}
            onDoubleClick={() => openWindow("account")}
          >
            <div className="glyph">
              <AccountGlyph />
            </div>
            <div className="label">My Account</div>
          </div>
        )}
        {isAdmin && (
          <div
            className={`xp-icon ${selected === "admin" ? "selected" : ""}`}
            onClick={() => setSelected("admin")}
            onDoubleClick={() => openWindow("admin")}
          >
            <div className="glyph">
              <AdminGlyph />
            </div>
            <div className="label">Control Panel</div>
          </div>
        )}
      </div>

      {wins
        .filter((w) => !w.minimized)
        .map((w) => (
          <div
            key={w.id}
            className="xp-window"
            style={
              isMobile
                ? {
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: "100vw",
                    height: "calc(100dvh - 36px)",
                    borderRadius: 0,
                    zIndex: w.z,
                  }
                : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }
            }
            onMouseDown={() => bringToFront(w.id)}
          >
            <div
              className="xp-window-title"
              onMouseDown={(e) => {
                if (!isMobile) startDrag(w.id, e);
              }}
              onDoubleClick={() => toggleMinimize(w.id)}
            >
              <div className="title-text">
                {w.kind === "me"
                  ? "📝"
                  : w.kind === "social"
                    ? "📁"
                    : w.kind === "admin"
                      ? "🛡"
                      : "👤"}{" "}
                <span>{w.title}</span>
              </div>
              <div className="xp-window-controls">
                <div className="xp-ctl min" onClick={() => toggleMinimize(w.id)}>
                  _
                </div>
                <div className="xp-ctl max">▢</div>
                <div className="xp-ctl" onClick={() => closeWindow(w.id)}>
                  ✕
                </div>
              </div>
            </div>

            <div className="xp-menubar">
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Help</span>
            </div>

            {w.kind === "social" && (
              <div className="xp-toolbar">
                <button>← Back</button>
                <button>→</button>
                <button>↑ Up</button>
                <div style={{ width: 10 }} />
                <span style={{ fontSize: 11, color: "#555" }}>View:</span>
                <button
                  className={folderView === "icons" ? "active" : ""}
                  onClick={() => setFolderView("icons")}
                >
                  Icons
                </button>
                <button
                  className={folderView === "list" ? "active" : ""}
                  onClick={() => setFolderView("list")}
                >
                  List
                </button>
                <button
                  className={folderView === "columns" ? "active" : ""}
                  onClick={() => setFolderView("columns")}
                >
                  Columns
                </button>
              </div>
            )}

            <div className={`xp-window-body ${w.kind === "social" ? "folder" : ""}`}>
              {w.kind === "me" && <MeContent />}
              {w.kind === "social" && <SocialContent view={folderView} />}
              {w.kind === "admin" && <AdminContent currentEmail={email} />}
              {w.kind === "account" && (
                <AccountContent
                  displayName={displayName}
                  email={email}
                  avatar={avatar}
                  onSaved={(name, av) => {
                    setDisplayName(name);
                    setAvatar(av);
                    updateRemembered(name, av);
                  }}
                  onDeleted={() => {
                    try {
                      localStorage.removeItem("man9oor_remembered");
                    } catch {}
                    router.push("/login");
                    router.refresh();
                  }}
                />
              )}
            </div>
          </div>
        ))}

      <div className="xp-taskbar">
        <div className="xp-start" onClick={() => setStartOpen((s) => !s)}>
          <div className="flag" />
          start
        </div>
        <div className="xp-tasks">
          {wins.map((w) => (
            <div
              key={w.id}
              className={`xp-task-btn ${!w.minimized ? "active" : ""}`}
              onClick={() => {
                if (w.minimized) toggleMinimize(w.id);
                else bringToFront(w.id);
              }}
            >
              {w.kind === "me"
                ? "📝"
                : w.kind === "social"
                  ? "📁"
                  : w.kind === "admin"
                    ? "🛡"
                    : "👤"}{" "}
              <span>{w.title}</span>
            </div>
          ))}
        </div>
        <div className="xp-tray">
          <span>🔊</span>
          <span>🖥</span>
          <span>{clock}</span>
        </div>
      </div>

      {startOpen && (
        <div className="xp-startmenu">
          <div className="user">
            <Avatar kind={avatar} letter={displayName.charAt(0)} size={36} />
            <div>{displayName}</div>
          </div>
          <div className="items">
            <div
              className="item"
              onClick={() => {
                openWindow("me");
                setStartOpen(false);
              }}
            >
              📝 About Me
            </div>
            <div
              className="item"
              onClick={() => {
                openWindow("social");
                setStartOpen(false);
              }}
            >
              📁 Social Media
            </div>
            {signedIn && (
              <div
                className="item"
                onClick={() => {
                  openWindow("account");
                  setStartOpen(false);
                }}
              >
                👤 My Account
              </div>
            )}
            {isAdmin && (
              <div
                className="item"
                onClick={() => {
                  openWindow("admin");
                  setStartOpen(false);
                }}
              >
                🛡 Control Panel
              </div>
            )}
            {!signedIn && (
              <>
                <div className="item" onClick={() => router.push("/login")}>
                  🔑 Sign in to profile
                </div>
                <div className="item" onClick={() => router.push("/signup")}>
                  ✨ Create account
                </div>
              </>
            )}
          </div>
          <div className="footer">
            {signedIn ? (
              <form action={logoutAction}>
                <button className="xp-btn" type="submit">
                  ⏻ Log Off
                </button>
              </form>
            ) : (
              <button className="xp-btn" onClick={() => router.push("/login")}>
                🔑 Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MeContent() {
  return (
    <div style={{ fontFamily: "Lucida Console, Consolas, monospace", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
{`====================================
       About Mansoor
====================================

Hey — I'm Mansoor. Welcome to my little
corner of the old web.

What I'm up to:
  • Learning to build websites
  • Figuring things out one tab at a time
  • Making stuff that looks like it's from 2003

Double-click the Social Media folder on the
desktop to find me around the internet.
`}
    </div>
  );
}

function SocialContent({ view }: { view: ViewMode }) {
  if (view === "icons") {
    return (
      <div className="view-icons">
        {SOCIALS.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="xp-icon">
            <div className="glyph">
              <SocialGlyph color={s.color} icon={s.icon} />
            </div>
            <div className="label">{s.name}</div>
          </a>
        ))}
      </div>
    );
  }
  if (view === "list") {
    return (
      <div className="view-list">
        {SOCIALS.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="row">
            <SocialGlyph color={s.color} icon={s.icon} />
            <span>{s.name}</span>
          </a>
        ))}
      </div>
    );
  }
  return (
    <div className="view-columns">
      <div className="head">Name</div>
      <div className="head">Type</div>
      <div className="head">Handle</div>
      <div className="head">URL</div>
      {SOCIALS.map((s) => (
        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="row-link">
          <div className="cell" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SocialGlyph color={s.color} icon={s.icon} />
            {s.name}
          </div>
          <div className="cell">{s.type}</div>
          <div className="cell">{s.handle}</div>
          <div className="cell" style={{ color: "#0058e6", textDecoration: "underline" }}>
            {s.url.replace(/^https?:\/\//, "")}
          </div>
        </a>
      ))}
    </div>
  );
}

type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  avatar: AvatarKey;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

function AdminContent({ currentEmail }: { currentEmail: string }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("list_users");
    setLoading(false);
    if (error) {
      setErr(error.message + " — did you run the admin SQL in Supabase?");
      return;
    }
    setUsers((data ?? []) as AdminUser[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteUser(u: AdminUser) {
    if (u.email === currentEmail) {
      alert("Use the My Account window to delete your own account.");
      return;
    }
    if (!confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    setBusyId(u.id);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_delete_user", { target_id: u.id });
    setBusyId(null);
    if (error) {
      setErr(error.message);
      return;
    }
    setUsers((cur) => (cur ?? []).filter((x) => x.id !== u.id));
  }

  function fmt(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 14 }}>
          Users ({users?.length ?? 0})
        </div>
        <button className="xp-btn" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "⟳ Refresh"}
        </button>
      </div>

      {err && <div className="xp-error" style={{ marginBottom: 8 }}>{err}</div>}

      {users && users.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1.4fr 1fr 1.1fr 1.1fr 70px",
            fontSize: 12,
            border: "1px solid #a0a0a0",
          }}
        >
          <div style={headStyle}></div>
          <div style={headStyle}>Email</div>
          <div style={headStyle}>Display name</div>
          <div style={headStyle}>Joined</div>
          <div style={headStyle}>Last sign-in</div>
          <div style={headStyle}>Action</div>

          {users.map((u) => (
            <AdminRow
              key={u.id}
              user={u}
              currentEmail={currentEmail}
              busy={busyId === u.id}
              onDelete={() => deleteUser(u)}
              fmt={fmt}
            />
          ))}
        </div>
      )}

      {users && users.length === 0 && !loading && (
        <div style={{ color: "#555" }}>No users yet.</div>
      )}
    </div>
  );
}

const headStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #f0f0f0, #d6d6d6)",
  borderBottom: "1px solid #a0a0a0",
  padding: "4px 6px",
  fontWeight: "bold",
};

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "4px 6px",
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function AdminRow({
  user,
  currentEmail,
  busy,
  onDelete,
  fmt,
}: {
  user: AdminUser;
  currentEmail: string;
  busy: boolean;
  onDelete: () => void;
  fmt: (d: string | null) => string;
}) {
  const isMe = user.email === currentEmail;
  return (
    <>
      <div style={cellStyle}>
        <Avatar
          kind={user.avatar || "letter"}
          letter={(user.display_name || user.email).charAt(0)}
          size={24}
        />
      </div>
      <div style={cellStyle} title={user.email}>
        {user.email} {isMe && <span style={{ color: "#888", marginLeft: 4 }}>(you)</span>}
      </div>
      <div style={cellStyle}>{user.display_name || "—"}</div>
      <div style={cellStyle}>{fmt(user.created_at)}</div>
      <div style={cellStyle}>{fmt(user.last_sign_in_at)}</div>
      <div style={cellStyle}>
        <button
          className="xp-btn"
          style={{
            background: isMe
              ? "linear-gradient(180deg,#eee,#ccc)"
              : "linear-gradient(180deg,#ff8080,#c62828)",
            color: isMe ? "#888" : "white",
            borderColor: isMe ? "#aaa" : "#8b0000",
            fontSize: 11,
            padding: "2px 8px",
          }}
          onClick={onDelete}
          disabled={isMe || busy}
          title={isMe ? "Use My Account to delete yourself" : "Delete this user"}
        >
          {busy ? "…" : "Delete"}
        </button>
      </div>
    </>
  );
}

function ChangePassword({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function change() {
    setOk(null);
    setErr(null);
    if (next.length < 6) {
      setErr("New password must be at least 6 characters.");
      return;
    }
    if (next !== confirm) {
      setErr("New passwords don't match.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyErr) {
      setBusy(false);
      setErr("Current password is incorrect.");
      return;
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (updateErr) {
      setErr(updateErr.message);
      return;
    }
    setOk("Password changed.");
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div>
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>Change password</div>
      <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>Current password</label>
      <input
        className="xp-input"
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>New password</label>
      <input
        className="xp-input"
        type="password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>Confirm new password</label>
      <input
        className="xp-input"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <button
        className="xp-btn xp-btn-primary"
        onClick={change}
        disabled={busy || !current || !next || !confirm}
      >
        {busy ? "Changing..." : "Change password"}
      </button>
      {ok && <div className="xp-ok" style={{ marginTop: 6 }}>{ok}</div>}
      {err && <div className="xp-error" style={{ marginTop: 6 }}>{err}</div>}
    </div>
  );
}

function AccountContent({
  displayName,
  email,
  avatar,
  onSaved,
  onDeleted,
}: {
  displayName: string;
  email: string;
  avatar: AvatarKey;
  onSaved: (name: string, avatar: AvatarKey) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(displayName);
  const [picked, setPicked] = useState<AvatarKey>(avatar);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function save() {
    setMsg(null);
    setErr(null);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name, avatar: picked },
    });
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg("Saved.");
    onSaved(name, picked);
  }

  async function deleteAccount() {
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_user");
    if (error) {
      setErr(
        "Delete failed: " +
          error.message +
          ". The delete_user() function may not be set up in Supabase yet.",
      );
      return;
    }
    await supabase.auth.signOut();
    onDeleted();
  }

  return (
    <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: 13 }}>
      <div
        style={{
          background: "#eef3fb",
          border: "1px solid #a8c0e0",
          padding: 10,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Avatar kind={picked} letter={name.charAt(0)} size={56} />
        <div>
          <div style={{ fontWeight: "bold", fontSize: 15 }}>{name}</div>
          <div style={{ color: "#555", fontSize: 12 }}>{email}</div>
        </div>
      </div>

      <div style={{ fontWeight: "bold", marginBottom: 6 }}>Pick a picture</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {AVATAR_KEYS.map((k) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Avatar
              kind={k}
              letter={name.charAt(0)}
              size={54}
              selected={picked === k}
              onClick={() => setPicked(k)}
            />
            <div style={{ fontSize: 10, color: "#555" }}>{AVATAR_LABELS[k]}</div>
          </div>
        ))}
      </div>

      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Change your display name</div>
      <input
        className="xp-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className="xp-btn xp-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {msg && <div className="xp-ok">{msg}</div>}
      {err && <div className="xp-error">{err}</div>}

      <hr style={{ border: 0, borderTop: "1px solid #c0c0c0", margin: "16px 0" }} />

      <ChangePassword email={email} />

      <hr style={{ border: 0, borderTop: "1px solid #c0c0c0", margin: "16px 0" }} />

      <div style={{ fontWeight: "bold", marginBottom: 4, color: "#b71c1c" }}>Danger zone</div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
        Delete your account and all its data. This cannot be undone.
      </div>
      {!confirming ? (
        <button
          className="xp-btn"
          style={{ background: "linear-gradient(180deg,#ff8080,#c62828)", color: "white", borderColor: "#8b0000" }}
          onClick={() => setConfirming(true)}
        >
          Delete my account…
        </button>
      ) : (
        <div style={{ background: "#fff4f4", border: "1px solid #c62828", padding: 10 }}>
          <div style={{ marginBottom: 8 }}>Are you absolutely sure? This is permanent.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="xp-btn" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              className="xp-btn"
              style={{
                background: "linear-gradient(180deg,#ff8080,#c62828)",
                color: "white",
                borderColor: "#8b0000",
              }}
              onClick={deleteAccount}
            >
              Yes, delete forever
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
