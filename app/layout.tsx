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
    "Personal developer portfolio — terminal aesthetic, projects, and contact.",
  openGraph: {
    title: "Sean Arackal",
    description:
      "Personal developer portfolio — terminal aesthetic, projects, and contact.",
    url: siteUrl,
    siteName: "Sean Arackal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal",
    description:
      "Personal developer portfolio — terminal aesthetic, projects, and contact.",
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
