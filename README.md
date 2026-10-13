> **Copyright © 2026 Aarav Singh / PauzeDevs. All rights reserved.**
>
> **VIEW ONLY — DO NOT COPY, MODIFY, REDISTRIBUTE, OR REUSE** any part of this project without prior written permission. Public visibility on GitHub does not grant a reuse licence.

# PauzeX Developments Website

A warm, editorial, motion-led website for **PauzeX Developments**. The experience uses a cinematic intro, kinetic typography, ambient canvas details, scroll reveals, and custom artwork for selected projects.

## Design direction

- Cream, clay, and cocoa palette with editorial typography.
- Music-video-inspired opening sequence and subtle motion throughout.
- Clear studio, work, services, and contact sections.
- Responsive layouts, accessible navigation, and reduced-motion support.
- No logo asset is integrated yet; the brand mark can be selected separately.

## Projects showcased

- **PauzePulse** — interactive experiences and 2D play.
- **PauzeControl** — a focused software utility.
- **PauzeWeather** — weather, radar, and map experience.

## Stack

This is a static site built with HTML, CSS, and vanilla JavaScript. It has no package installation or build step, so it is lightweight and can be hosted directly on GitHub Pages. Google Fonts are loaded remotely; system fallbacks are included.

## Run locally

Open `index.html` in a browser, or serve the repository folder with any static HTTP server.

## Deploy with GitHub Pages

The workflow at `.github/workflows/deploy.yml` deploys the static files whenever code is pushed to `main`, and can also be run manually from the Actions tab.

In **Settings → Pages**, set the publishing source to **GitHub Actions** if it is not already selected. After a successful deployment, GitHub will show the published URL in the Pages settings and workflow run.

## Notes

- The intro is silent by design; there is no forced audio playback.
- Motion responds to `prefers-reduced-motion`.
- Project repository links point to the public PauzeControl and PauzeWeather repositories. PauzePulse remains labeled as an in-progress lab project.

[![devs.surf](https://devs.surf/badges/subdomain.svg)](https://pauzex.devs.surf)
