<!--
Copyright (c) 2026 Aarav Singh / PauzeDevs.

VIEW-ONLY SOURCE — DO NOT COPY, MODIFY, REDISTRIBUTE, OR REUSE WITHOUT PRIOR WRITTEN PERMISSION.
All rights reserved. Public visibility does not grant a reuse licence.
-->

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:28211e,55:955740,100:d5a088&height=190&section=header&text=PauzeX%20Developments&fontSize=38&fontColor=f8f0e8&fontAlignY=38&desc=Software%20built%20with%20intent&descAlignY=60&animation=fadeIn" alt="PauzeX Developments — Software built with intent" width="100%">

<a href="https://pauzex.devs.surf"><img src="https://devs.surf/badges/subdomain.svg" alt="Visit pauzex.devs.surf"></a>
<a href="https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions/workflows/deploy.yml"><img src="https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions/workflows/deploy.yml/badge.svg" alt="GitHub Pages deployment status"></a>
<a href="https://pauzedevs.github.io/PauzeXDevelopments-Website/"><img src="https://img.shields.io/badge/live%20site-open-955740?style=flat&labelColor=28211e" alt="Open the live website"></a>
<a href="https://github.com/PauzeDevs/PauzeXDevelopments-Website"><img src="https://img.shields.io/badge/source-view%20repository-955740?style=flat&labelColor=28211e" alt="View source repository"></a>

<br>

<img src="https://readme-typing-svg.demolab.com?font=DM+Mono&size=15&duration=2600&pause=850&color=955740&center=true&vCenter=true&width=520&lines=Build+useful+things.;Test+the+details.;Ship.+Learn.+Improve." alt="Build useful things. Test the details. Ship, learn, improve.">

</div>

---

## About

PauzeX Developments is an independent software development group working on practical tools, apps, web experiences, and technical experiments. This repository contains the public-facing studio website.

The site is intentionally lightweight: semantic HTML, a single stylesheet, and vanilla JavaScript. There is no frontend framework, package install, bundler, or compile step.

## Featured projects

| Project | What it does | Source |
| --- | --- | --- |
| **PauzePulse** | Interactive project focused on gameplay mechanics, distinct scenes, and 2D animation. | [Repository](https://github.com/PauzeDevs/PauzePulse) |
| **PauzeControl** | Remote-control utility connecting a Mac and Android device, including screen streaming and network connectivity. | [Repository](https://github.com/PauzeDevs/PauzeControl) |
| **PauzeWeather** | Android weather app with forecasts, alerts, air quality, radar, and cached data. | [Repository](https://github.com/PauzeX-Developments/PauzeWeatherDeveloped) |

Project details shown on the site are fetched from GitHub's public API. API rate limits or unavailable release data should not prevent direct repository links from working.

## Design and behaviour

- Warm cream, clay, and cocoa colours with restrained editorial typography.
- Short intro sequence and scroll-based reveals.
- Searchable project directory with category filters.
- Live repository metadata, latest-release links, and recent commits.
- Responsive navigation and layouts.
- Reduced-motion support and keyboard-accessible controls.
- No forced audio, fake project metrics, or fabricated release information.

## Code structure

```text
.
├── index.html                  # Page content and accessible landmarks
├── styles.css                  # Design tokens, layout, responsive styles, motion
├── script.js                   # Navigation, intro, reveals, project filters, GitHub data
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── .nojekyll                   # Publish static files without Jekyll processing
├── LICENSE                     # All-rights-reserved usage terms
└── README.md                   # Project overview and maintenance notes
```

JavaScript is kept dependency-free and grouped by responsibility. The stylesheet uses shared custom properties for the palette and typography, with responsive and reduced-motion rules kept explicit.

## Run locally

No installation is needed.

1. Clone the repository if you have permission to do so.
2. Open `index.html` in a browser, or run any static HTTP server from the project directory.
3. For example, with Python installed:

   ```bash
   python -m http.server 8000
   ```

   Then open `http://localhost:8000`.

The repository's usage terms still apply to copying, modification, and reuse. Local inspection instructions do not grant additional permissions.

## Deployment

GitHub Actions deploys the static site to GitHub Pages when changes are pushed to `main`. The workflow can also be started manually from the **Actions** tab.

If Pages has not been configured, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.

- [Deployment workflow](https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions/workflows/deploy.yml)
- [Live website](https://pauzedevs.github.io/PauzeXDevelopments-Website/)
- [Public repository](https://github.com/PauzeDevs/PauzeXDevelopments-Website)

## Maintenance notes

- Keep repository names and links aligned with the actual GitHub projects.
- Do not hard-code stars, release versions, or activity dates; render those values from the source API.
- Keep JavaScript dependency-free unless a real requirement justifies adding a package.
- Check keyboard navigation, mobile layout, and `prefers-reduced-motion` when changing interactions.
- Keep functions small and named for their responsibility. Comments should explain non-obvious decisions, not narrate every line.

## Rights and attribution

Copyright © 2026 Aarav Singh / PauzeDevs. All rights reserved. This repository is view-only; copying, modification, redistribution, or reuse requires prior written permission. See [LICENSE](LICENSE) for the full notice.

Third-party services used to render README badges and animations are external services and remain subject to their own availability and terms.
