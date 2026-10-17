<!--
Copyright (c) 2026 Aarav Singh / PauzeDevs.
ALL RIGHTS RESERVED. View-only source; no reuse without prior written permission.
-->

<div align="center">

<a href="https://pauzex.devs.surf/"><img src="https://pauzex.devs.surf/assets/pauzex-logo.webp" alt="PauzeX Developments official logo" width="720"></a>

<a href="https://pauzex.devs.surf"><img src="https://devs.surf/badges/subdomain.svg" alt="Visit pauzex.devs.surf"></a>
<a href="https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions/workflows/deploy.yml"><img src="https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions/workflows/deploy.yml/badge.svg" alt="GitHub Pages deployment status"></a>
<a href="https://pauzex.devs.surf/"><img src="https://img.shields.io/badge/website-live-955740?style=flat&labelColor=28211e" alt="Open the live website"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/source-view--only-955740?style=flat&labelColor=28211e" alt="View-only source; all rights reserved"></a>

<img src="https://readme-typing-svg.demolab.com?font=DM+Mono&size=14&duration=3000&pause=1000&color=955740&center=true&vCenter=true&width=430&lines=Practical+software.+Thoughtful+details.;Prototype.+Test.+Improve.;Built+to+be+useful." alt="Practical software. Thoughtful details. Prototype, test, improve. Built to be useful.">

</div>

---

## Overview

PauzeX Developments is an independent software studio for apps, developer tools, web experiences, and technical experiments. This repository contains the studio's public-facing website.

The site follows the same principle as the projects it presents: keep the experience purposeful, make interactions useful, and avoid unnecessary dependencies. Its featured software directory includes PauzeNews, PauzeControl, PauzeWeather, and PauzePulse, with live GitHub details for public repositories and clearly marked private project cards.

**[Open the live website ↗](https://pauzex.devs.surf/)**

## Website structure

`INTRO → HOME → STUDIO → PROJECTS → ENGINEERING → CONTACT`

| Section | Purpose |
| --- | --- |
| **Intro & home** | A short entrance screen, studio message, and primary navigation. |
| **Studio** | Explains the team's approach to building, testing, and iteration. |
| **Projects** | Searchable project cards for four featured software projects, category filters, live details for public repositories, access notices for private projects, CI links, and recent public activity from GitHub. |
| **Engineering** | Summarises application development, frontend work, APIs, integrations, quality, and maintenance. |
| **Contact** | Provides the closing message and contact route. |

The layout is responsive, the navigation supports mobile screens, and motion-sensitive visitors are covered by reduced-motion handling. Public repository data comes from GitHub's public API. Private repositories are marked; their source and release details require repository access.

## Featured work

| Project | Focus |
| --- | --- |
| [PauzePulse](https://github.com/PauzeDevs/PauzePulse) | Private repository — interactive gameplay, distinct scenes, and 2D animation. |
| [PauzeControl](https://github.com/PauzeDevs/PauzeControl) | Mac-to-Android remote control and screen streaming. |
| [PauzeWeather](https://github.com/PauzeDevs/PauzeWeather) | Private repository — Android weather forecasts, alerts, air quality, radar, and cached data. |
| [PauzeNews](https://github.com/PauzeDevs/PauzeNews) | Android-first Python/Kivy news reader with topic-based RSS feeds, publisher attribution, local search, SQLite bookmarks, offline-friendly caching, and official APK releases. |

## Code map

```text
.
├── index.html
│   └── Page content, metadata, navigation, and accessible landmarks
├── styles.css
│   └── Colour tokens, typography, layout, responsive rules, and motion
├── script.js
│   └── Intro state, navigation, reveals, project filters, and GitHub API data
├── .github/workflows/deploy.yml
│   └── JavaScript syntax validation and GitHub Pages deployment
├── .nojekyll
├── LICENSE
└── README.md
```

The site uses semantic HTML, one shared stylesheet, and dependency-free vanilla JavaScript. There is no package install, frontend framework, bundler, or compile step.

## Deployment and checks

The GitHub Actions workflow runs on pushes to `main` and can be triggered manually. Before publishing, it checks JavaScript syntax with `node --check script.js`, assembles the static files, and deploys them to GitHub Pages.

- [Deployment workflow](https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions/workflows/deploy.yml)
- [Workflow runs](https://github.com/PauzeDevs/PauzeXDevelopments-Website/actions)

## Copyright and usage

> **ALL RIGHTS RESERVED — VIEW-ONLY SOURCE**
>
> Copyright © 2026 Aarav Singh / PauzeDevs. This repository is available for inspection on GitHub only. You do **not** have permission to clone or fork it for reuse, mirror it, download it for republishing, modify it, incorporate its code or design into another project, or host a copy of this website on another domain without prior written permission.
>
> Public visibility is not a reuse licence. See [LICENSE](LICENSE) for the full terms. Third-party services, fonts, and assets remain subject to their respective owners' terms.

**Important:** GitHub's public-repository features cannot be technically disabled by README wording. This notice communicates the owner's restrictions; it does not prevent a public repository from being copied by technical means.
