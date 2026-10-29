"use client";

import { useEffect, useRef, useState } from "react";
import { logoutAction } from "../login/actions";

type WindowKind = "me" | "social";
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
    url: "https://youtube.com/@uncakuma",
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

export default function Desktop({ displayName, email }: { displayName: string; email: string }) {
  const [wins, setWins] = useState<OpenWindow[]>([]);
  const [selected, setSelected] = useState<WindowKind | null>(null);
  const [folderView, setFolderView] = useState<ViewMode>("icons");
  const [startOpen, setStartOpen] = useState(false);
  const [clock, setClock] = useState("");
  const zRef = useRef(10);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    };
    update();
    const t = setInterval(update, 15000);
    return () => clearInterval(t);
  }, []);

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
    setWins((cur) => [
      ...cur,
      {
        id,
        kind,
        title: kind === "me" ? "Me.txt — Notepad" : "Social Media",
        x: 120 + cur.length * 30,
        y: 60 + cur.length * 30,
        w: kind === "me" ? 460 : 560,
        h: kind === "me" ? 360 : 400,
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
          <div className="label">Me.txt</div>
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
      </div>

      {wins
        .filter((w) => !w.minimized)
        .map((w) => (
          <div
            key={w.id}
            className="xp-window"
            style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
            onMouseDown={() => bringToFront(w.id)}
          >
            <div
              className="xp-window-title"
              onMouseDown={(e) => startDrag(w.id, e)}
              onDoubleClick={() => toggleMinimize(w.id)}
            >
              <div className="title-text">
                {w.kind === "me" ? "📝" : "📁"} <span>{w.title}</span>
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
              {w.kind === "me" ? <MeContent displayName={displayName} email={email} /> : null}
              {w.kind === "social" ? <SocialContent view={folderView} /> : null}
            </div>
          </div>
        ))}

      {/* Taskbar */}
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
              {w.kind === "me" ? "📝" : "📁"} <span>{w.title}</span>
            </div>
          ))}
        </div>
        <div className="xp-tray">
          <span>🔊</span>
          <span>🖥</span>
          <span>{clock}</span>
        </div>
      </div>

      {/* Start menu */}
      {startOpen && (
        <div className="xp-startmenu">
          <div className="user">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: "#c62828",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                border: "2px solid white",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
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
          </div>
          <div className="footer">
            <form action={logoutAction}>
              <button className="xp-btn" type="submit">
                ⏻ Log Off
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MeContent({ displayName: _displayName, email: _email }: { displayName: string; email: string }) {
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
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="xp-icon"
          >
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
