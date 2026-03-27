/** @type {import("next").NextConfig} */
const nextConfig = {
  // Required for GitHub Pages (static hosting only — no Node server).
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
