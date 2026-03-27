# Portfolio

Next.js portfolio (static export for GitHub Pages).

## GitHub Pages

1. **Settings → Pages → Build and deployment:** set **Source** to **GitHub Actions** (not “Deploy from a branch” with only source files).
2. Push to `main` or `master`. The workflow in `.github/workflows/deploy.yml` runs `next build`, uploads the `out/` folder, and deploys it.
3. The site must be built with `output: "export"` — GitHub Pages cannot run `next start`.

Local preview of the exported site: `npx serve out` after `npm run build`.
