import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { homeDescription, personName, siteUrl } from "@/lib/seo";
import { ogImage } from "@/lib/site";
import { phaseScript } from "@/lib/time-of-day";
import { Instrument_Serif } from "next/font/google";

const serif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-serif", display: "swap" });

// themeColor matches the page background (styles/globals.css), so the browser bar blends into it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#edeae5" }, { media: "(prefers-color-scheme: dark)", color: "#191b18" }],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: personName, template: `%s · ${personName}` },
  description: homeDescription,
  openGraph: { siteName: personName, locale: "en_US", type: "website", images: [ogImage] },
  twitter: { card: "summary_large_image", images: [ogImage] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Browser extensions add attributes to <html> and <body> before React hydrates.
    <html lang="en" className={serif.variable} suppressHydrationWarning>
      {/* Sets the day, golden-hour or night theme before first paint (lib/time-of-day.ts). */}
      <head><script dangerouslySetInnerHTML={{ __html: phaseScript }} /></head>
      <body suppressHydrationWarning>
        {children}
        {/* No SRI: Cloudflare serves changing content at this unversioned URL. */}
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          defer
          strategy="afterInteractive"
          data-cf-beacon='{"token":"bc8d067690ec47479fb0315fc62d3b8c"}'
        />
      </body>
    </html>
  );
}

