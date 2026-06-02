import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { MobileTabBar } from "@/components/MobileTabBar";
import { Disclaimer } from "@/components/Disclaimer";
import { TimezoneProvider } from "@/components/TimezoneProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lapstream.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lapstream — Unofficial Motorsport Dashboard",
    template: "%s — Lapstream",
  },
  description:
    "Lapstream is a free, unofficial motorsport dashboard: live race calendar with your-timezone session times, championship standings, results, podiums and a 3D circuit globe. Not affiliated with Formula 1.",
  keywords: [
    "motorsport",
    "race calendar",
    "championship standings",
    "race results",
    "grand prix schedule",
    "qualifying times",
    "fastest lap",
    "Lapstream",
  ],
  applicationName: "Lapstream",
  authors: [{ name: "Lapstream" }],
  category: "sports",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Lapstream",
    title: "Lapstream — Unofficial Motorsport Dashboard",
    description:
      "Free, unofficial motorsport dashboard: timezone-aware calendar, live standings, results and a 3D circuit globe.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lapstream — Unofficial Motorsport Dashboard",
    description:
      "Free, unofficial motorsport dashboard: timezone-aware calendar, live standings, results and a 3D circuit globe.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Lapstream",
  url: SITE_URL,
  description:
    "Free, unofficial motorsport dashboard: calendar, standings, results and a 3D circuit globe.",
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-apex-bg font-sans text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-apex-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <TimezoneProvider>
          <ScrollProgress />
          <Nav />
          <main
            id="main"
            className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:pb-24"
          >
            {children}
          </main>
          <Disclaimer />
          <MobileTabBar />
        </TimezoneProvider>
      </body>
    </html>
  );
}
