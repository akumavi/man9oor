import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "man9oor — a little corner of the old web";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(ellipse at 30% 40%, #a4d19a 0%, #6cb064 25%, #4c8e3b 55%, #3b7a30 100%)",
          position: "relative",
        }}
      >
        {/* Fake desktop icons in the corner */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 72,
                height: 90,
                background: "white",
                border: "2px solid #808080",
                marginBottom: 6,
              }}
            />
            <div
              style={{
                color: "white",
                fontSize: 18,
                textShadow: "1px 1px 2px #000",
                fontFamily: "Tahoma, sans-serif",
              }}
            >
              About Me.txt
            </div>
          </div>
        </div>

        {/* Centered XP window */}
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 150,
            width: 700,
            height: 330,
            background: "#ece9d8",
            border: "2px solid #0831d9",
            borderRadius: "10px 10px 0 0",
            display: "flex",
            flexDirection: "column",
            boxShadow: "4px 6px 20px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #0058e6, #3a93ff 10%, #0058e6 55%, #3a93ff 90%, #0058e6)",
              color: "white",
              fontWeight: 700,
              padding: "10px 14px",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              fontSize: 22,
              fontFamily: "Trebuchet MS, Tahoma, sans-serif",
              textShadow: "1px 1px 1px rgba(0,0,0,0.4)",
            }}
          >
            man9oor.com
          </div>
          <div
            style={{
              flex: 1,
              background: "white",
              padding: "26px 30px",
              display: "flex",
              flexDirection: "column",
              fontFamily: "Trebuchet MS, Tahoma, sans-serif",
            }}
          >
            <div style={{ fontSize: 54, fontWeight: 700, color: "#245edb", marginBottom: 8 }}>
              man9oor
            </div>
            <div style={{ fontSize: 24, color: "#333", lineHeight: 1.4 }}>
              A little corner of the old web.
            </div>
            <div style={{ fontSize: 18, color: "#777", marginTop: 20 }}>
              Click the user name to sign in.
            </div>
          </div>
        </div>

        {/* XP-ish taskbar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 44,
            background:
              "linear-gradient(180deg, #2c80e9, #245edb 10%, #1941a5 50%, #245edb 90%, #1941a5)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 24px 0 14px",
              background: "linear-gradient(180deg, #5eac56, #3dad38 15%, #2a8a24 85%, #1f6b1a)",
              borderRadius: "0 14px 14px 0",
              color: "white",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 22,
              height: "100%",
              fontFamily: "Trebuchet MS, Tahoma, sans-serif",
              textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
            }}
          >
            start
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
