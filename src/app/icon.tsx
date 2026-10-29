import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          backgroundColor: "#245edb",
        }}
      >
        <div style={{ width: "50%", height: "50%", backgroundColor: "#f25022" }} />
        <div style={{ width: "50%", height: "50%", backgroundColor: "#7fba00" }} />
        <div style={{ width: "50%", height: "50%", backgroundColor: "#00a4ef" }} />
        <div style={{ width: "50%", height: "50%", backgroundColor: "#ffb900" }} />
      </div>
    ),
    { ...size },
  );
}
