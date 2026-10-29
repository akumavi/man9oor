"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AVATAR_KEYS, AVATAR_LABELS, type AvatarKey } from "@/components/Avatar";

type WindowKind = "me" | "social" | "account" | "admin" | "meeting";
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
  maximized: boolean;
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

function CalendarGlyph() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <rect x="4" y="8" width="40" height="36" rx="3" fill="white" stroke="#555" />
      <rect x="4" y="8" width="40" height="10" fill="#d13535" stroke="#555" />
      <rect x="12" y="4" width="4" height="10" rx="1" fill="#444" />
      <rect x="32" y="4" width="4" height="10" rx="1" fill="#444" />
      <text x="24" y="36" textAnchor="middle" fontFamily="Tahoma, sans-serif" fontSize="14" fontWeight="bold" fill="#333">
        {new Date().getDate()}
      </text>
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

function DesktopIcon({
  label,
  selected,
  onSelect,
  onOpen,
  glyph,
  isMobile,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  glyph: React.ReactNode;
  isMobile: boolean;
}) {
  // On touch devices, a single tap opens (double-tap is awkward on mobile).
  // On desktop, single click selects, double click opens.
  return (
    <button
      type="button"
      role="listitem"
      aria-label={`Open ${label}`}
      className={`xp-icon ${selected ? "selected" : ""}`}
      onClick={isMobile ? onOpen : onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        background: "transparent",
        border: 0,
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <div className="glyph" aria-hidden="true">
        {glyph}
      </div>
      <div className="label">{label}</div>
    </button>
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
  const [vp, setVp] = useState({ w: 1024, h: 768 });
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
    // Treat as "mobile layout" if screen is narrow OR primary input is touch
    // (so iPads and touch laptops get centered windows + no drag too).
    const narrow = window.matchMedia("(max-width: 820px)");
    const touch = window.matchMedia("(pointer: coarse)");
    const update = () => {
      setIsMobile(narrow.matches || touch.matches);
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    narrow.addEventListener("change", update);
    touch.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      narrow.removeEventListener("change", update);
      touch.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Keyboard: Escape closes the top window, or the Start menu if open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (startOpen) {
        setStartOpen(false);
        return;
      }
      const visible = wins.filter((w) => !w.minimized);
      if (visible.length === 0) return;
      const top = visible.reduce((a, b) => (a.z > b.z ? a : b));
      setWins((cur) => cur.filter((w) => w.id !== top.id));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wins, startOpen]);

  function windowTitle(kind: WindowKind) {
    if (kind === "me") return "About Me.txt — Notepad";
    if (kind === "social") return "Social Media";
    if (kind === "admin") return "Control Panel";
    if (kind === "meeting") return "Book a Meeting";
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
      admin: { w: 760, h: 520 },
      meeting: { w: 520, h: 540 },
    };
    const sz = sizes[kind];
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    const openCount = wins.length;
    const x = isMobile ? Math.max(8, (vw - Math.min(sz.w, vw - 16)) / 2) : 120 + openCount * 30;
    const y = isMobile ? Math.max(8, (vh - Math.min(sz.h, vh - 60)) / 2 - 20) : 60 + openCount * 30;
    const w = isMobile ? Math.min(sz.w, vw - 16) : sz.w;
    const h = isMobile ? Math.min(sz.h, vh - 60) : sz.h;
    setWins((cur) => [
      ...cur,
      {
        id,
        kind,
        title: windowTitle(kind),
        x,
        y,
        w,
        h,
        z: zRef.current,
        minimized: false,
        maximized: false,
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

  function toggleMaximize(id: string) {
    setWins((cur) => cur.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
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
      <div className="xp-icon-grid" role="list">
        <DesktopIcon
          label="About Me.txt"
          selected={selected === "me"}
          onSelect={() => setSelected("me")}
          onOpen={() => openWindow("me")}
          glyph={<FileGlyph />}
          isMobile={isMobile}
        />
        <DesktopIcon
          label="Social Media"
          selected={selected === "social"}
          onSelect={() => setSelected("social")}
          onOpen={() => openWindow("social")}
          glyph={<FolderGlyph />}
          isMobile={isMobile}
        />
        <DesktopIcon
          label="Book a Meeting"
          selected={selected === "meeting"}
          onSelect={() => setSelected("meeting")}
          onOpen={() => openWindow("meeting")}
          glyph={<CalendarGlyph />}
          isMobile={isMobile}
        />
        {signedIn && (
          <DesktopIcon
            label="My Account"
            selected={selected === "account"}
            onSelect={() => setSelected("account")}
            onOpen={() => openWindow("account")}
            glyph={<AccountGlyph />}
            isMobile={isMobile}
          />
        )}
        {isAdmin && (
          <DesktopIcon
            label="Control Panel"
            selected={selected === "admin"}
            onSelect={() => setSelected("admin")}
            onOpen={() => openWindow("admin")}
            glyph={<AdminGlyph />}
            isMobile={isMobile}
          />
        )}
      </div>

      {wins
        .filter((w) => !w.minimized)
        .map((w) => (
          <div
            key={w.id}
            className="xp-window"
            style={(() => {
              if (w.maximized) {
                return {
                  position: "fixed" as const,
                  left: 0,
                  top: 0,
                  width: vp.w,
                  height: vp.h - 36,
                  borderRadius: 0,
                  zIndex: w.z,
                };
              }
              if (isMobile) {
                const ww = Math.min(w.w, vp.w - 16);
                const hh = Math.min(w.h, vp.h - 80);
                return {
                  position: "fixed" as const,
                  left: Math.max(8, (vp.w - ww) / 2),
                  top: Math.max(8, (vp.h - 36 - hh) / 2),
                  width: ww,
                  height: hh,
                  zIndex: w.z,
                };
              }
              return { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z };
            })()}
            onMouseDown={() => bringToFront(w.id)}
          >
            <div
              className="xp-window-title"
              onMouseDown={(e) => {
                if (!isMobile && !w.maximized) startDrag(w.id, e);
              }}
              onDoubleClick={() => toggleMaximize(w.id)}
            >
              <div className="title-text">
                {w.kind === "me"
                  ? "📝"
                  : w.kind === "social"
                    ? "📁"
                    : w.kind === "admin"
                      ? "🛡"
                      : w.kind === "meeting"
                        ? "📅"
                        : "👤"}{" "}
                <span>{w.title}</span>
              </div>
              <div className="xp-window-controls">
                <div className="xp-ctl min" onClick={() => toggleMinimize(w.id)}>
                  _
                </div>
                <div className="xp-ctl max" onClick={() => toggleMaximize(w.id)}>
                  {w.maximized ? "❐" : "▢"}
                </div>
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
              {w.kind === "meeting" && (
                <MeetingContent
                  signedIn={signedIn}
                  isAdmin={isAdmin}
                  onSignIn={() => router.push("/login")}
                />
              )}
              {w.kind === "account" && (
                <AccountContent
                  displayName={displayName}
                  email={email}
                  avatar={avatar}
                  onSaved={(name, av) => {
                    setDisplayName(name);
                    setAvatar(av);
                    updateRemembered(name, av);
                    router.refresh();
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
                    : w.kind === "meeting"
                      ? "📅"
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
            <div
              className="item"
              onClick={() => {
                openWindow("meeting");
                setStartOpen(false);
              }}
            >
              📅 Book a Meeting
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
              <button
                className="xp-btn"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  try {
                    localStorage.removeItem("man9oor_remembered");
                  } catch {}
                  setStartOpen(false);
                  // Close any windows that require being signed in.
                  setWins((cur) => cur.filter((w) => w.kind !== "account" && w.kind !== "admin"));
                  router.refresh();
                }}
              >
                ⏻ Log Off
              </button>
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

type MeetingStatus = "pending" | "confirmed" | "cancelled" | "declined" | "rescheduled";

type Meeting = {
  id: string;
  user_id: string;
  starts_at: string;
  duration_minutes: number;
  topic: string | null;
  status: MeetingStatus;
  created_at: string;
};

const TIME_SLOTS = ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nextDays(count: number = 7): string[] {
  const result: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  for (let i = 0; i < count; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    result.push(`${y}-${m}-${day}`);
    d.setDate(d.getDate() + 1);
  }
  return result;
}

function MeetingContent({
  signedIn,
  isAdmin,
  onSignIn,
}: {
  signedIn: boolean;
  isAdmin: boolean;
  onSignIn: () => void;
}) {
  if (isAdmin) return <AdminMeetingCalendar />;
  return <UserMeetingBooking signedIn={signedIn} onSignIn={onSignIn} />;
}

function UserMeetingBooking({ signedIn, onSignIn }: { signedIn: boolean; onSignIn: () => void }) {
  const [mine, setMine] = useState<Meeting[] | null>(null);
  const [loading, setLoading] = useState(true);
  const dates = nextDays(7);
  const [date, setDate] = useState(dates[0] ?? "");
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Reschedule state (per-meeting)
  const [reschedId, setReschedId] = useState<string | null>(null);
  const [reschedDate, setReschedDate] = useState(dates[0] ?? "");
  const [reschedTime, setReschedTime] = useState(TIME_SLOTS[0]);

  async function load() {
    if (!signedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("starts_at", { ascending: true });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMine((data ?? []) as Meeting[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  async function book() {
    setErr(null);
    setMsg(null);
    const startsAt = new Date(`${date}T${time}:00`);
    if (startsAt.getTime() < Date.now()) {
      setErr("Pick a time in the future.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setErr("Please sign in first.");
      return;
    }
    const { error } = await supabase.from("meetings").insert({
      user_id: user.id,
      starts_at: startsAt.toISOString(),
      duration_minutes: 30,
      topic: topic.trim() || null,
      status: "pending",
    });
    setBusy(false);
    if (error) {
      setErr(error.message + " — did you run the meetings SQL in Supabase?");
      return;
    }
    setMsg("Request sent! You'll see it in your list below once Mansoor reviews it.");
    setTopic("");
    load();
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this meeting request?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("meetings")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    load();
  }

  async function reschedule(id: string) {
    const startsAt = new Date(`${reschedDate}T${reschedTime}:00`);
    if (startsAt.getTime() < Date.now()) {
      setErr("Pick a time in the future.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("meetings")
      .update({ starts_at: startsAt.toISOString(), status: "rescheduled" })
      .eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    setReschedId(null);
    setMsg("Rescheduled — Mansoor will see your new time.");
    load();
  }

  async function accept(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("meetings")
      .update({ status: "confirmed" })
      .eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    load();
  }

  if (!signedIn) {
    return (
      <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: 13 }}>
        <div
          style={{
            background: "#eef3fb",
            border: "1px solid #a8c0e0",
            padding: 14,
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 4 }}>
            📅 Book a 30-minute meeting
          </div>
          <div style={{ color: "#555", lineHeight: 1.5 }}>
            Hey — want to chat? I take short calls to meet new people, talk about ideas,
            or just hang out. Sign in to request a time that works for you.
          </div>
        </div>
        <button className="xp-btn xp-btn-primary" onClick={onSignIn}>
          🔑 Sign in to book
        </button>
      </div>
    );
  }

  const upcoming = (mine ?? []).filter(
    (m) =>
      new Date(m.starts_at).getTime() > Date.now() - 2 * 60 * 60 * 1000 &&
      m.status !== "cancelled" &&
      m.status !== "declined",
  );
  const past = (mine ?? []).filter(
    (m) =>
      new Date(m.starts_at).getTime() <= Date.now() - 2 * 60 * 60 * 1000 ||
      m.status === "cancelled" ||
      m.status === "declined",
  );

  return (
    <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: 13 }}>
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>Request a time</div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
        Weekday slots, 30 minutes each. All times are your local timezone.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>Date</label>
          <select className="xp-input" value={date} onChange={(e) => setDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d} value={d}>
                {new Date(d + "T12:00").toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>Time</label>
          <select className="xp-input" value={time} onChange={(e) => setTime(e.target.value)}>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>
        What would you like to talk about? <span style={{ color: "#888" }}>({topic.length}/300)</span>
      </label>
      <textarea
        className="xp-input"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={300}
        rows={3}
        style={{ marginBottom: 10, resize: "vertical", fontFamily: "Tahoma, sans-serif" }}
        placeholder="Optional — a line or two helps Mansoor prepare."
      />

      <button className="xp-btn xp-btn-primary" onClick={book} disabled={busy}>
        {busy ? "Sending…" : "📅 Request meeting"}
      </button>

      {msg && <div className="xp-ok" style={{ marginTop: 6 }}>{msg}</div>}
      {err && <div className="xp-error" style={{ marginTop: 6 }}>{err}</div>}

      <hr style={{ border: 0, borderTop: "1px solid #c0c0c0", margin: "16px 0" }} />

      <div style={{ fontWeight: "bold", marginBottom: 6 }}>
        Your meetings {loading ? "(loading…)" : `(${upcoming.length})`}
      </div>
      {upcoming.length === 0 && !loading && (
        <div style={{ color: "#777", fontSize: 12 }}>No upcoming meetings yet.</div>
      )}
      <div style={{ display: "grid", gap: 6 }}>
        {upcoming.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #c0c0c0",
              background: "#fafafa",
              padding: 8,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "bold" }}>{fmtDateTime(m.starts_at)}</div>
                {m.topic && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={m.topic}
                  >
                    {m.topic}
                  </div>
                )}
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  <StatusBadge status={m.status} />
                  {m.status === "rescheduled" && (
                    <span style={{ fontSize: 11, color: "#664d00", marginLeft: 6 }}>
                      — new time pending Mansoor&apos;s confirmation
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {m.status === "rescheduled" && (
                  <button
                    className="xp-btn"
                    style={{
                      background: "linear-gradient(180deg,#5bd060,#2e8a33)",
                      color: "white",
                      borderColor: "#1a5e1e",
                      fontSize: 11,
                    }}
                    onClick={() => accept(m.id)}
                  >
                    ✓ Accept new time
                  </button>
                )}
                {reschedId !== m.id && (
                  <button
                    className="xp-btn"
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      setReschedId(m.id);
                      setReschedDate(dates[0]);
                      setReschedTime(TIME_SLOTS[0]);
                    }}
                  >
                    ↻ Reschedule
                  </button>
                )}
                <button className="xp-btn" style={{ fontSize: 11 }} onClick={() => cancel(m.id)}>
                  Cancel
                </button>
              </div>
            </div>
            {reschedId === m.id && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: "#eef3fb",
                  border: "1px solid #a8c0e0",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: 6, fontSize: 12 }}>
                  Pick a new time:
                </div>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 6 }}
                >
                  <select
                    className="xp-input"
                    value={reschedDate}
                    onChange={(e) => setReschedDate(e.target.value)}
                  >
                    {dates.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d + "T12:00").toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                  <select
                    className="xp-input"
                    value={reschedTime}
                    onChange={(e) => setReschedTime(e.target.value)}
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    className="xp-btn xp-btn-primary"
                    style={{ fontSize: 11 }}
                    onClick={() => reschedule(m.id)}
                  >
                    Save
                  </button>
                  <button
                    className="xp-btn"
                    style={{ fontSize: 11 }}
                    onClick={() => setReschedId(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <>
          <div style={{ fontWeight: "bold", marginTop: 14, marginBottom: 6, color: "#777" }}>
            History
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {past.map((m) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid #e0e0e0",
                  background: "#f5f5f5",
                  padding: 6,
                  fontSize: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div style={{ color: "#555" }}>{fmtDateTime(m.starts_at)}</div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type AdminMeetingShape = Meeting & { user_email: string; user_display_name: string };

function AdminMeetingCalendar() {
  const [meetings, setMeetings] = useState<AdminMeetingShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(() => dayKey(new Date()));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reschedId, setReschedId] = useState<string | null>(null);
  const reschedDates = nextDays(7);
  const [reschedDate, setReschedDate] = useState(reschedDates[0] ?? "");
  const [reschedTime, setReschedTime] = useState(TIME_SLOTS[0]);

  async function load() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_list_meetings");
    setLoading(false);
    if (error) {
      setErr(error.message + " — did you run the meetings SQL in Supabase?");
      return;
    }
    setMeetings((data ?? []) as AdminMeetingShape[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function reschedule(id: string) {
    const startsAt = new Date(`${reschedDate}T${reschedTime}:00`);
    if (startsAt.getTime() < Date.now()) {
      setErr("Pick a time in the future.");
      return;
    }
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_reschedule_meeting", {
      meeting_id: id,
      new_starts_at: startsAt.toISOString(),
    });
    setBusyId(null);
    if (error) {
      setErr(error.message);
      return;
    }
    setReschedId(null);
    load();
  }

  const byDay: Record<string, AdminMeetingShape[]> = {};
  for (const m of meetings) {
    const k = dayKey(new Date(m.starts_at));
    (byDay[k] ??= []).push(m);
  }

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = dayKey(new Date());
  const monthLabel = monthDate.toLocaleDateString([], { month: "long", year: "numeric" });

  const selectedMeetings = selectedDay ? (byDay[selectedDay] ?? []) : [];

  async function updateStatus(id: string, status: "confirmed" | "declined") {
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_update_meeting_status", {
      meeting_id: id,
      new_status: status,
    });
    setBusyId(null);
    if (error) {
      setErr(error.message);
      return;
    }
    setMeetings((cur) => cur.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  function prevMonth() {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() - 1);
    setMonthDate(d);
  }
  function nextMonth() {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + 1);
    setMonthDate(d);
  }

  return (
    <div style={{ fontFamily: "Tahoma, sans-serif", fontSize: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <button className="xp-btn" onClick={prevMonth}>
          ← Prev
        </button>
        <div style={{ fontWeight: "bold", fontSize: 15 }}>{monthLabel}</div>
        <button className="xp-btn" onClick={nextMonth}>
          Next →
        </button>
      </div>

      {err && <div className="xp-error" style={{ marginBottom: 8 }}>{err}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          border: "1px solid #a0a0a0",
          background: "#a0a0a0",
          marginBottom: 10,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{
              background: "linear-gradient(180deg, #f0f0f0, #d6d6d6)",
              padding: "3px 4px",
              textAlign: "center",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} style={{ background: "#eee", minHeight: 56 }} />;
          const k = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayMeetings = byDay[k] ?? [];
          const pending = dayMeetings.filter((m) => m.status === "pending").length;
          const confirmed = dayMeetings.filter((m) => m.status === "confirmed").length;
          const isToday = k === todayKey;
          const isSelected = k === selectedDay;
          return (
            <div
              key={i}
              onClick={() => setSelectedDay(k)}
              style={{
                background: isSelected ? "#cfe3ff" : "white",
                padding: "3px 4px",
                minHeight: 56,
                cursor: "pointer",
                border: isToday ? "2px solid #0058e6" : "none",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ fontWeight: isToday ? "bold" : "normal", fontSize: 12 }}>{d}</div>
              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {confirmed > 0 && (
                  <span
                    style={{
                      background: "#28a745",
                      color: "white",
                      fontSize: 10,
                      padding: "0 4px",
                      borderRadius: 3,
                      fontWeight: "bold",
                    }}
                    title={`${confirmed} confirmed`}
                  >
                    ✓{confirmed}
                  </span>
                )}
                {pending > 0 && (
                  <span
                    style={{
                      background: "#ffc107",
                      color: "#664d00",
                      fontSize: 10,
                      padding: "0 4px",
                      borderRadius: 3,
                      fontWeight: "bold",
                    }}
                    title={`${pending} pending`}
                  >
                    ⏳{pending}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && <div style={{ color: "#555" }}>Loading…</div>}

      {!loading && selectedDay && (
        <div>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            {new Date(selectedDay + "T12:00").toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            {selectedMeetings.length} meeting{selectedMeetings.length === 1 ? "" : "s"}
          </div>
          {selectedMeetings.length === 0 ? (
            <div style={{ color: "#777", fontSize: 12 }}>Nothing scheduled.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {selectedMeetings
                .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                .map((m) => {
                  const isDead = m.status === "cancelled" || m.status === "declined";
                  return (
                    <div
                      key={m.id}
                      style={{
                        border: "1px solid #c0c0c0",
                        background: "#fafafa",
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 10,
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold" }}>
                            {new Date(m.starts_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            <span style={{ color: "#777", fontWeight: "normal" }}>
                              ({m.duration_minutes} min)
                            </span>
                          </div>
                          <div style={{ fontSize: 12, marginTop: 2 }}>
                            <strong>{m.user_display_name}</strong>{" "}
                            <span style={{ color: "#666" }}>&lt;{m.user_email}&gt;</span>
                          </div>
                          {m.topic && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#444",
                                marginTop: 4,
                                fontStyle: "italic",
                              }}
                            >
                              &ldquo;{m.topic}&rdquo;
                            </div>
                          )}
                          <div style={{ marginTop: 4 }}>
                            <StatusBadge status={m.status} />
                            {m.status === "rescheduled" && (
                              <span
                                style={{ fontSize: 11, color: "#664d00", marginLeft: 6 }}
                              >
                                — they changed the time
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {(m.status === "pending" || m.status === "rescheduled") && (
                            <button
                              className="xp-btn"
                              style={{
                                background: "linear-gradient(180deg,#5bd060,#2e8a33)",
                                color: "white",
                                borderColor: "#1a5e1e",
                                fontSize: 11,
                              }}
                              disabled={busyId === m.id}
                              onClick={() => updateStatus(m.id, "confirmed")}
                            >
                              ✓ Confirm
                            </button>
                          )}
                          {!isDead && reschedId !== m.id && (
                            <button
                              className="xp-btn"
                              style={{ fontSize: 11 }}
                              disabled={busyId === m.id}
                              onClick={() => {
                                setReschedId(m.id);
                                setReschedDate(reschedDates[0]);
                                setReschedTime(TIME_SLOTS[0]);
                              }}
                            >
                              ↻ Reschedule
                            </button>
                          )}
                          {!isDead && (
                            <button
                              className="xp-btn"
                              style={{
                                background: "linear-gradient(180deg,#ff8080,#c62828)",
                                color: "white",
                                borderColor: "#8b0000",
                                fontSize: 11,
                              }}
                              disabled={busyId === m.id}
                              onClick={() => updateStatus(m.id, "declined")}
                            >
                              ✕ Decline
                            </button>
                          )}
                        </div>
                      </div>
                      {reschedId === m.id && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 8,
                            background: "#eef3fb",
                            border: "1px solid #a8c0e0",
                          }}
                        >
                          <div
                            style={{ fontWeight: "bold", marginBottom: 6, fontSize: 12 }}
                          >
                            New time:
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr auto auto",
                              gap: 6,
                            }}
                          >
                            <select
                              className="xp-input"
                              value={reschedDate}
                              onChange={(e) => setReschedDate(e.target.value)}
                            >
                              {reschedDates.map((d) => (
                                <option key={d} value={d}>
                                  {new Date(d + "T12:00").toLocaleDateString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </option>
                              ))}
                            </select>
                            <select
                              className="xp-input"
                              value={reschedTime}
                              onChange={(e) => setReschedTime(e.target.value)}
                            >
                              {TIME_SLOTS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <button
                              className="xp-btn xp-btn-primary"
                              style={{ fontSize: 11 }}
                              onClick={() => reschedule(m.id)}
                              disabled={busyId === m.id}
                            >
                              Save
                            </button>
                            <button
                              className="xp-btn"
                              style={{ fontSize: 11 }}
                              onClick={() => setReschedId(null)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  const styles: Record<MeetingStatus, React.CSSProperties> = {
    pending: { background: "#fff3cd", color: "#856404", border: "1px solid #ffeaa7" },
    confirmed: { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" },
    cancelled: { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
    declined: { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" },
    rescheduled: { background: "#cfe2ff", color: "#084298", border: "1px solid #9ec5fe" },
  };
  return (
    <span
      style={{
        ...styles[status],
        padding: "2px 6px",
        borderRadius: 3,
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
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

type AdminMeeting = Meeting & { user_email: string; user_display_name: string };

function AdminContent({ currentEmail }: { currentEmail: string }) {
  const [tab, setTab] = useState<"users" | "meetings">("users");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [meetings, setMeetings] = useState<AdminMeeting[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    if (tab === "users") {
      const { data, error } = await supabase.rpc("list_users");
      setLoading(false);
      if (error) {
        setErr(error.message + " — did you run the admin SQL in Supabase?");
        return;
      }
      setUsers((data ?? []) as AdminUser[]);
    } else {
      const { data, error } = await supabase.rpc("admin_list_meetings");
      setLoading(false);
      if (error) {
        setErr(error.message + " — did you run the meetings SQL in Supabase?");
        return;
      }
      setMeetings((data ?? []) as AdminMeeting[]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function updateMeetingStatus(id: string, status: "confirmed" | "declined") {
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_update_meeting_status", {
      meeting_id: id,
      new_status: status,
    });
    setBusyId(null);
    if (error) {
      setErr(error.message);
      return;
    }
    setMeetings((cur) => (cur ?? []).map((m) => (m.id === id ? { ...m, status } : m)));
  }

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
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="xp-btn"
            style={tab === "users" ? { background: "linear-gradient(180deg,#3b85eb,#1a5fd8)", color: "white", borderColor: "#0a3a9c" } : {}}
            onClick={() => setTab("users")}
          >
            👥 Users
          </button>
          <button
            className="xp-btn"
            style={tab === "meetings" ? { background: "linear-gradient(180deg,#3b85eb,#1a5fd8)", color: "white", borderColor: "#0a3a9c" } : {}}
            onClick={() => setTab("meetings")}
          >
            📅 Meetings
          </button>
        </div>
        <button className="xp-btn" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "⟳ Refresh"}
        </button>
      </div>

      {err && <div className="xp-error" style={{ marginBottom: 8 }}>{err}</div>}

      {tab === "users" && users && users.length > 0 && (
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

      {tab === "users" && users && users.length === 0 && !loading && (
        <div style={{ color: "#555" }}>No users yet.</div>
      )}

      {tab === "meetings" && meetings && meetings.length > 0 && (
        <div style={{ display: "grid", gap: 6 }}>
          {meetings.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #c0c0c0",
                background: "#fafafa",
                padding: 10,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                alignItems: "start",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{fmtDateTime(m.starts_at)}</div>
                <div style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
                  <strong>{m.user_display_name}</strong>{" "}
                  <span style={{ color: "#666" }}>&lt;{m.user_email}&gt;</span>
                </div>
                {m.topic && (
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4, fontStyle: "italic" }}>
                    &ldquo;{m.topic}&rdquo;
                  </div>
                )}
                <div style={{ marginTop: 4 }}>
                  <StatusBadge status={m.status} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(m.status === "pending" || m.status === "rescheduled") && (
                  <button
                    className="xp-btn"
                    style={{
                      background: "linear-gradient(180deg,#5bd060,#2e8a33)",
                      color: "white",
                      borderColor: "#1a5e1e",
                      fontSize: 11,
                    }}
                    disabled={busyId === m.id}
                    onClick={() => updateMeetingStatus(m.id, "confirmed")}
                  >
                    ✓ Confirm
                  </button>
                )}
                {m.status !== "cancelled" && m.status !== "declined" && (
                  <button
                    className="xp-btn"
                    style={{
                      background: "linear-gradient(180deg,#ff8080,#c62828)",
                      color: "white",
                      borderColor: "#8b0000",
                      fontSize: 11,
                    }}
                    disabled={busyId === m.id}
                    onClick={() => updateMeetingStatus(m.id, "declined")}
                  >
                    ✕ Decline
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "meetings" && meetings && meetings.length === 0 && !loading && (
        <div style={{ color: "#555" }}>No meetings yet.</div>
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
        maxLength={72}
        style={{ marginBottom: 8 }}
      />
      <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>New password (6–72)</label>
      <input
        className="xp-input"
        type="password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        minLength={6}
        maxLength={72}
        style={{ marginBottom: 8 }}
      />
      <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>Confirm new password</label>
      <input
        className="xp-input"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        maxLength={72}
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

  // Pull fresh user data on mount — the server-rendered prop can lag
  // behind recent updates (another device, cached session, etc).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const freshName = (u.user_metadata?.display_name as string | undefined) ?? name;
      const freshAvatar = (u.user_metadata?.avatar as AvatarKey | undefined) ?? picked;
      if (freshName !== name) setName(freshName);
      if (freshAvatar !== picked) setPicked(freshAvatar);
      if (freshName !== displayName || freshAvatar !== avatar) {
        onSaved(freshName, freshAvatar);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setMsg(null);
    setErr(null);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErr("Display name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 24) {
      setErr("Display name must be 24 characters or fewer.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { display_name: trimmed, avatar: picked },
    });
    if (!error) {
      // Force session JWT + cookies to pick up the new metadata so the next
      // server render (and next sign-in) returns fresh data.
      await supabase.auth.refreshSession();
    }
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setName(trimmed);
    setMsg("Saved.");
    onSaved(trimmed, picked);
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

      <div style={{ fontWeight: "bold", marginBottom: 4 }}>
        Change your display name <span style={{ color: "#888", fontWeight: "normal", fontSize: 11 }}>({name.length}/24)</span>
      </div>
      <input
        className="xp-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
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
