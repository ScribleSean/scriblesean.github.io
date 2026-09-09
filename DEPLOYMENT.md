# Preview and deployment

The repository exports to GitHub Pages using the existing workflow. Pushing to main deploys the `out/` directory. The public site is https://scriblesean.github.io/.

## Verification

Run `npm run lint`, `npx tsx --test tests/*.test.ts`, and `npm run build`. Serve `out/` with an ordinary static server to inspect the production result. The 3D renderer draws on demand; camera damping stops after movement settles. Shadows use a bounded 1024px map. Apps are loaded on first open and kept mounted while hidden. Video is silent and pauses behind the desktop or in a hidden document.

## Email activation

Messages has an explicit transcript submission adapter and an email-app fallback. The published site has a configured endpoint; the mailbox owner confirmed activation. Inbox receipt has not been independently verified. For another deployment:

1. Activate an email form endpoint for `sean.arackal@gmail.com`, for example the FormSubmit AJAX endpoint described at https://formsubmit.co/ajax-documentation.
2. Confirm the activation email as the mailbox owner and send a clearly labelled test conversation. Verify receipt before presenting delivery as working.
3. Set the GitHub repository variable `NEXT_PUBLIC_CONTACT_ENDPOINT` to the activated endpoint. For local development, put the same variable in `.env.local`, which is ignored by Git.
4. Rebuild. Public environment variables are compiled into the static site. Do not put a private API key in this variable.

Until activation, the UI preserves drafts and offers the visitor's email app; it does not show a false sent state.

## Resume

`/resume/` displays the corrected resume. `/resume/sean-arackal-resume.pdf` is the downloadable one-page version. Both use `data/resume.json`; regenerate the PDF with `python3 scripts/build_resume.py` in a Python environment with ReportLab. Verify the rendered PDF after changing its content.

## Assets

- Slippi lid emblem: official vector from https://github.com/project-slippi/slippi-launcher/blob/main/src/renderer/styles/images/slippi_logo.svg.

- Approved silent Melee video: https://www.youtube.com/watch?v=TFmpEWb0Nqk&t=17s. READY was visually verified at 0:17. The segment ends at 1:08 and loops back to READY. YouTube restrictions may require the visible fallback link.
- Approved wallpaper reference: https://www.bubbleblabber.com/2024/03/the-big-lez-show-teases-six-part-mini-series/.
- The phone loading still comes from the approved concept image. The interactive desktop scene is actual Three.js geometry.
- Melee case cover reference: https://i.ebayimg.com/images/g/LGsAAeSw8rRpwa7d/s-l1200.webp.

## Embedded browser

Chrome supports typed website addresses, Google searches, reload, portfolio home, and back/forward through addresses entered in its toolbar. The approach follows the iframe browser in https://yoshik-portfolio.vercel.app/. External pages remain subject to their embedding policies; an external-tab link is always available. Cross-origin navigation inside a page cannot synchronize the toolbar address or its history. Google search and example.com were verified in the production preview.
