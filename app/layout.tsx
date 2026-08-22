import type { Metadata } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";

import "@/styles/globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://scriblesean.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sean Arackal — AI Software Engineer",
    template: "%s · Sean Arackal",
  },
  description:
    "Sean Arackal — WPI B.S. Computer Science ('26). AI software engineering, computer vision, and full-stack systems in Greater Boston.",
  openGraph: {
    title: "Sean Arackal — AI Software Engineer",
    description:
      "AI Software Engineer at ReVISit — video analysis, computer vision, and LLM-powered research tooling.",
    url: siteUrl,
    siteName: "Sean Arackal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal — AI Software Engineer",
    description:
      "AI Software Engineer at ReVISit — video analysis, computer vision, and LLM-powered research tooling.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body className="grain min-h-screen font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
