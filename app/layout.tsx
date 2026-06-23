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
    "Sean Arackal — WPI B.S. Computer Science ('26). AI software engineering, full-stack web, and accessibility research in Greater Boston.",
  openGraph: {
    title: "Sean Arackal",
    description:
      "AI Software Engineer at ReVISit — full-stack, computer vision, and LLM-powered research tooling.",
    url: siteUrl,
    siteName: "Sean Arackal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal",
    description:
      "AI Software Engineer at ReVISit — full-stack, computer vision, and LLM-powered research tooling.",
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
