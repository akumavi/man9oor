import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "man9oor",
    short_name: "man9oor",
    description: "A little corner of the old web — Windows XP themed personal site.",
    start_url: "/",
    display: "standalone",
    background_color: "#245edb",
    theme_color: "#245edb",
    orientation: "any",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
