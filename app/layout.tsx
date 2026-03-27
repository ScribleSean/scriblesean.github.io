import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import "@/styles/globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://scriblesean.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sean Arackal",
    template: "%s · Sean Arackal",
  },
  description:
    "Sean Arackal — WPI B.S. Computer Science ('26). Full-stack, AI tooling, and accessibility-focused projects in Greater Boston.",
  openGraph: {
    title: "Sean Arackal",
    description:
      "WPI computer science student — full-stack web, research visualization, and healthcare engineering.",
    url: siteUrl,
    siteName: "Sean Arackal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal",
    description:
      "WPI computer science student — full-stack web, research visualization, and healthcare engineering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <body
        className="min-h-screen font-mono antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
