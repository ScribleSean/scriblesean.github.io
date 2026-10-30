# Preview and deployment

Pushing to main runs `.github/workflows/deploy.yml`, which builds the static export and deploys the `out/` directory to GitHub Pages. In the repository settings, open Pages and set the build and deployment source to GitHub Actions. The public site is https://scriblesean.github.io/.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. To check the production build, serve `out/` with any static server.

The 3D renderer draws only on demand, and camera damping stops once movement settles. Shadows use a 1024px map. Each app loads the first time it opens and stays mounted while hidden. The video is muted and pauses behind the desktop or when the page is hidden.

## Email activation

Messages sends the visitor's conversation to a form endpoint and can open the visitor's email app instead. The published site has an endpoint configured, and the mailbox owner confirmed activation. Delivery to the inbox has not been tested end to end. To set up another deployment:

1. Activate an email form endpoint for `sean.arackal@gmail.com`, for example the FormSubmit AJAX endpoint described at https://formsubmit.co/ajax-documentation.
2. Confirm the activation email from that mailbox, then send a test conversation labeled as a test. Check that it arrives before you treat delivery as working.
3. Set the GitHub repository variable `NEXT_PUBLIC_CONTACT_ENDPOINT` to the activated endpoint. For local development, put the same variable in `.env.local`, which Git ignores.
4. Rebuild. The build compiles public environment variables into the static site, so do not put a private API key in this variable.

Until an endpoint is set, Messages keeps the visitor's drafts and offers their email app. It does not show a sent state.

## Resume

`public/resume/sean-arackal-resume.pdf` is Sean's approved resume from September 15, 2026. Keep its bytes and formatting unchanged. Its SHA-256 is `dcb80a0f9138caa399f9f1bb49e08a62e7fabc80a7a9e9e0c9060ba9b6c7e735`.

All download links point to `/resume/sean-arackal-resume.pdf`. The `/resume/` page and the Files app show `sean-arackal-resume.png`, rendered from this PDF, with a link to the searchable original. To replace the resume, replace the PDF and render a new PNG in the same change. The portfolio content in `data/resume.json` is separate, so do not generate the resume PDF from it. The legacy script `scripts/build_resume.py` writes only `tmp/legacy-resume-draft.pdf`.

## Assets

- Slippi lid emblem: the official vector from https://github.com/project-slippi/slippi-launcher/blob/main/src/renderer/styles/images/slippi_logo.svg.
- Melee video, muted: https://www.youtube.com/watch?v=TFmpEWb0Nqk&t=17s. The clip starts on the READY screen at 0:17, ends at 1:08, and loops back to READY. If YouTube blocks playback, the CRT shows a link to the original.
- Wallpaper reference: https://www.bubbleblabber.com/2024/03/the-big-lez-show-teases-six-part-mini-series/.
- The phone loading image comes from a concept image. The interactive desktop scene is Three.js geometry.
- Melee case cover reference: https://i.ebayimg.com/images/g/LGsAAeSw8rRpwa7d/s-l1200.webp.

## Embedded browser

The desktop Chrome app shows the portfolio inside its window. Its toolbar takes website addresses and Google searches, and has reload, portfolio home, and back and forward buttons for addresses typed there. Outside websites and searches open in a new browser tab, not an iframe. The window then shows a link to that page and a button back to the portfolio. The toolbar idea came from https://yoshik-portfolio.vercel.app/.
