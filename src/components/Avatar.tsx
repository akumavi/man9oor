"use client";

export const AVATAR_KEYS = ["letter", "soccer", "flower", "butterfly", "chess", "guitar"] as const;
export type AvatarKey = (typeof AVATAR_KEYS)[number];

export const AVATAR_LABELS: Record<AvatarKey, string> = {
  letter: "Letter",
  soccer: "Soccer ball",
  flower: "Red flower",
  butterfly: "Butterfly",
  chess: "Chess piece",
  guitar: "Guitar",
};

export function Avatar({
  kind,
  letter = "M",
  size = 60,
  selected = false,
  onClick,
}: {
  kind: AvatarKey;
  letter?: string;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    border: selected ? "2px solid #ffe08a" : "2px solid white",
    boxShadow: selected ? "0 0 0 2px #ff8a00" : undefined,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: onClick ? "pointer" : "default",
    background: "white",
    overflow: "hidden",
  };

  if (kind === "letter") {
    return (
      <div
        onClick={onClick}
        style={{
          ...style,
          background: "linear-gradient(135deg, #c62828 0%, #b71c1c 100%)",
          color: "white",
          fontSize: size * 0.55,
          fontWeight: "bold",
          fontFamily: "Tahoma, sans-serif",
        }}
      >
        {letter.toUpperCase().charAt(0)}
      </div>
    );
  }

  return (
    <div onClick={onClick} style={style}>
      <svg width={size - 4} height={size - 4} viewBox="0 0 60 60">
        {kind === "soccer" && <SoccerBall />}
        {kind === "flower" && <RedFlower />}
        {kind === "butterfly" && <Butterfly />}
        {kind === "chess" && <ChessKing />}
        {kind === "guitar" && <Guitar />}
      </svg>
    </div>
  );
}

function SoccerBall() {
  return (
    <>
      <circle cx="30" cy="30" r="26" fill="white" stroke="#333" strokeWidth="1.5" />
      <polygon points="30,16 38,22 35,32 25,32 22,22" fill="#222" />
      <polygon points="30,16 22,22 14,20 18,12 26,10" fill="white" stroke="#222" strokeWidth="0.8" />
      <polygon points="30,16 38,22 46,20 42,12 34,10" fill="white" stroke="#222" strokeWidth="0.8" />
      <polygon points="35,32 42,38 46,30 46,20 38,22" fill="white" stroke="#222" strokeWidth="0.8" />
      <polygon points="25,32 18,38 14,30 14,20 22,22" fill="white" stroke="#222" strokeWidth="0.8" />
      <polygon points="25,32 35,32 38,42 30,48 22,42" fill="white" stroke="#222" strokeWidth="0.8" />
    </>
  );
}

function RedFlower() {
  return (
    <>
      <circle cx="30" cy="18" r="9" fill="#e53935" />
      <circle cx="18" cy="27" r="9" fill="#e53935" />
      <circle cx="42" cy="27" r="9" fill="#e53935" />
      <circle cx="23" cy="40" r="9" fill="#e53935" />
      <circle cx="37" cy="40" r="9" fill="#e53935" />
      <circle cx="30" cy="30" r="6" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1" />
      <path d="M30 48 Q28 54 24 56" stroke="#2e7d32" strokeWidth="2" fill="none" />
    </>
  );
}

function Butterfly() {
  return (
    <>
      <ellipse cx="18" cy="22" rx="12" ry="10" fill="#1976d2" />
      <ellipse cx="42" cy="22" rx="12" ry="10" fill="#1976d2" />
      <ellipse cx="20" cy="40" rx="10" ry="8" fill="#42a5f5" />
      <ellipse cx="40" cy="40" rx="10" ry="8" fill="#42a5f5" />
      <circle cx="18" cy="22" r="3" fill="#ffeb3b" />
      <circle cx="42" cy="22" r="3" fill="#ffeb3b" />
      <rect x="29" y="14" width="2" height="34" fill="#4a2c0f" rx="1" />
      <circle cx="30" cy="14" r="2.5" fill="#4a2c0f" />
      <line x1="30" y1="12" x2="26" y2="7" stroke="#4a2c0f" strokeWidth="1.2" />
      <line x1="30" y1="12" x2="34" y2="7" stroke="#4a2c0f" strokeWidth="1.2" />
    </>
  );
}

function ChessKing() {
  return (
    <>
      <rect x="12" y="48" width="36" height="6" fill="#424242" />
      <polygon points="18,48 20,32 40,32 42,48" fill="#616161" />
      <rect x="22" y="26" width="16" height="8" fill="#757575" />
      <rect x="18" y="22" width="24" height="6" fill="#616161" />
      <rect x="26" y="12" width="8" height="12" fill="#616161" />
      <rect x="22" y="14" width="16" height="4" fill="#616161" />
      <rect x="28" y="6" width="4" height="8" fill="#ffd54f" />
      <rect x="25" y="8" width="10" height="2" fill="#ffd54f" />
    </>
  );
}

function Guitar() {
  return (
    <>
      <circle cx="22" cy="40" r="16" fill="#8d4e22" />
      <circle cx="22" cy="40" r="12" fill="#a9693b" />
      <circle cx="22" cy="40" r="4" fill="#2c1810" />
      <rect x="26" y="10" width="6" height="26" fill="#5d2f10" transform="rotate(25 29 23)" />
      <rect x="35" y="4" width="7" height="10" fill="#2c1810" transform="rotate(25 38.5 9)" />
      <line x1="20" y1="36" x2="40" y2="12" stroke="#eee" strokeWidth="0.4" />
      <line x1="22" y1="38" x2="42" y2="14" stroke="#eee" strokeWidth="0.4" />
      <line x1="24" y1="40" x2="44" y2="16" stroke="#eee" strokeWidth="0.4" />
    </>
  );
}
