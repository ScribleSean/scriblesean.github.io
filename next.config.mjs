import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Pin workspace root when other lockfiles exist higher in the tree (avoids Turbopack root warning).
  turbopack: {
    root: __dirname,
  },
  // Required for GitHub Pages (static hosting only — no Node server).
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
