import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { ogImage } from "@/lib/site";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://scriblesean.github.io";

// Pages that show the 3D scene override this with sceneViewport (lib/site.ts).
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

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
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Arackal",
    description:
      "Software, AI, and programming education. Explore my projects and interactive portfolio.",
    images: [ogImage],
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

