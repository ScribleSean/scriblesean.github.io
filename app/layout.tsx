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
    default: "Developer Portfolio",
    template: "%s · Developer Portfolio",
  },
  description:
    "Personal developer portfolio — terminal aesthetic, projects, and contact.",
  openGraph: {
    title: "Developer Portfolio",
    description:
      "Personal developer portfolio — terminal aesthetic, projects, and contact.",
    url: siteUrl,
    siteName: "Developer Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Portfolio",
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
    <html lang="en" className={mono.variable}>
      <body className="min-h-screen font-mono antialiased">{children}</body>
    </html>
  );
}
