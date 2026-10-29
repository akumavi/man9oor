import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto",
});

const SITE_URL = "https://www.man9oor.com";
const SITE_TITLE = "man9oor";
const SITE_DESCRIPTION =
  "A little corner of the old web — Mansoor's Windows XP themed personal site.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · man9oor",
  },
  description: SITE_DESCRIPTION,
  applicationName: "man9oor",
  authors: [{ name: "Mansoor" }],
  keywords: ["man9oor", "mansoor", "portfolio", "Windows XP", "retro"],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_TITLE,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#245edb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a246a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={noto.variable}>
      <body>{children}</body>
    </html>
  );
}
