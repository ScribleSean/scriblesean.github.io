# Sean Arackal — interactive portfolio

A personal portfolio built around a 3D GameCube and CRT. Enter the screen to explore a desktop with project files, a browser, and a messaging app.

**[Explore the interactive site](https://scriblesean.github.io/)** · **[Read the portfolio](https://scriblesean.github.io/portfolio/)** · **[Download my resume](https://scriblesean.github.io/resume/sean-arackal-resume.pdf)**

## What to try

- Enter the CRT and open the desktop apps. Windows can move, resize, minimize, and maximize.
- Open Files to browse project contributions and download the resume.
- Open the portfolio in the desktop browser, or use the direct portfolio link above.
- Open Messages to compose a conversation and explicitly submit it to me.

The site is a work in progress. I’m continuing to refine the scene models and interface. External websites may block embedding in the desktop browser; its external-tab action opens them normally.

## How it is built

Next.js and React handle the routes and desktop interface. Three.js, React Three Fiber, and Drei render the scene. GitHub Actions builds a static export for GitHub Pages; no application server is required for hosting.

The portfolio, Files app, and resume share curated content in `data/resume.json`. A ReportLab script generates the downloadable PDF. Messages uses a configurable external form endpoint; it is not a live chat service.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. For a static production preview:

```bash
npm run build -- --webpack
python3 -m http.server 3000 --directory out
```

## Verify changes

```bash
npm run lint
node --import tsx --test tests/*.test.ts
npm run build -- --webpack
```

Check both the direct portfolio and the embedded desktop after interface changes. The automated checks cover desktop window behavior and message handling; they do not establish email receipt or replace visual inspection of the 3D scene.

## Project map

| Location | Responsibility |
| --- | --- |
| `components/scene/` | 3D setup and camera interaction |
| `components/desktop/` | Desktop shell and app windows |
| `components/browser/`, `files/`, `messages/` | Desktop applications |
| `components/portfolio/` | Direct and embedded portfolio |
| `data/resume.json` | Shared project and experience content |
| `scripts/build_resume.py` | Downloadable resume generation |

See [deployment and asset notes](DEPLOYMENT.md) for hosting, contact configuration, source references, and resume regeneration.
