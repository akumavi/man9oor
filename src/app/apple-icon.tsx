import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#245edb",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 90,
            height: 90,
            marginBottom: 10,
          }}
        >
          <div style={{ width: "50%", height: "50%", backgroundColor: "#f25022" }} />
          <div style={{ width: "50%", height: "50%", backgroundColor: "#7fba00" }} />
          <div style={{ width: "50%", height: "50%", backgroundColor: "#00a4ef" }} />
          <div style={{ width: "50%", height: "50%", backgroundColor: "#ffb900" }} />
        </div>
        <div
          style={{
            color: "white",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "Trebuchet MS, Tahoma, sans-serif",
          }}
        >
          man9oor
        </div>
      </div>
    ),
    { ...size },
  );
}
