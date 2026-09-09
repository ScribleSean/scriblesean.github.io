import type { Metadata } from "next";
import Script from "next/script";
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
      "Software, AI, and programming education. Explore my projects and interactive portfolio.",
    url: siteUrl,
    siteName: "Sean Arackal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal",
    description:
      "Software, AI, and programming education. Explore my projects and interactive portfolio.",
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
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          type="module"
          strategy="afterInteractive"
          data-cf-beacon='{"token":"bc8d067690ec47479fb0315fc62d3b8c"}'
        />
      </body>
    </html>
  );
}

