import type { Metadata } from "next";
import "@/styles/globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://scriblesean.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sean Arackal",
    template: "%s · Sean Arackal",
  },
  description:
    "Sean Arackal - WPI computer science graduate building AI systems, research tools, and accessible software.",
  openGraph: {
    title: "Sean Arackal",
    description:
      "AI systems, research tools, and accessible software with measurable outcomes.",
    url: siteUrl,
    siteName: "Sean Arackal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal",
    description:
      "AI systems, research tools, and accessible software with measurable outcomes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

