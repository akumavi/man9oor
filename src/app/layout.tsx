import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "man9oor",
  description: "A little piece of the old web.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
