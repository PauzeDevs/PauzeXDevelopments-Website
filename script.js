/*
Copyright (c) 2026 Aarav Singh / PauzeDevs.

VIEW-ONLY SOURCE — DO NOT COPY, MODIFY, REDISTRIBUTE, OR REUSE WITHOUT PRIOR WRITTEN PERMISSION.
All rights reserved. Viewing this source on GitHub does not grant permission to reproduce or reuse it.
*/
(() => {
  "use strict";

  const body = document.body;
  const intro = document.getElementById("intro");
  const enterButton = document.getElementById("enter-button");
  const skipIntro = document.getElementById("skip-intro");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const meterFill = document.getElementById("scroll-meter-fill");
  const cursorGlow = document.getElementById("cursor-glow");
  const skipLink = document.getElementById("skip-link");
  const mainContent = document.getElementById("main");
  const inertSections = [document.getElementById("site-header"), mainContent, document.querySelector(".site-footer")].filter(Boolean);
  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  const canvas = document.getElementById("ambient-canvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introFinished = false;
  let canvasFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;
  let pointer = { x: 0.5, y: 0.5 };
  let particles = [];

  function finishIntro(skipAnimation = false) {
    if (introFinished || !intro) return;
    introFinished = true;
    if (skipAnimation) {
      intro.classList.add("is-hidden");
      intro.remove();
      body.classList.remove("is-loading");
      body.classList.add("site-entered");
      inertSections.forEach((section) => section.removeAttribute("inert"));
      return;
    }
    intro.classList.add("is-exiting");
    const complete = () => {
      if (intro.isConnected) intro.remove();
      body.classList.remove("is-loading");
      body.classList.add("site-entered");
      inertSections.forEach((section) => section.removeAttribute("inert"));
    };
    intro.addEventListener("transitionend", (event) => {
      if (event.target === intro && event.propertyName === "clip-path") complete();
    }, { once: true });
    window.setTimeout(complete, 1450);
  }

  enterButton?.addEventListener("click", () => {
    finishIntro(false);
    window.setTimeout(() => document.getElementById("work")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }), reduceMotion ? 0 : 1450);
  });
  skipLink?.addEventListener("click", (event) => {
    if (!intro || !intro.isConnected) return;
    event.preventDefault();
    finishIntro(true);
    window.setTimeout(() => mainContent?.focus({ preventScroll: true }), 0);
  });
  skipIntro?.addEventListener("click", () => finishIntro(true));

  // A reduced-motion preference bypasses the cinematic cover automatically.
  if (reduceMotion) window.setTimeout(() => finishIntro(true), 80);

  const revealItems = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  function closeMenu() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mobileNav.hidden = true;
  }

  menuToggle?.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    mobileNav.hidden = expanded;
  });

  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!mobileNav || mobileNav.hidden || !menuToggle) return;
    if (!mobileNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  let scrollQueued = false;
  function updateScrollUI() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (meterFill) meterFill.style.width = progress + "%";

    if (hero && heroArt && window.innerWidth > 760 && !reduceMotion) {
      const bounds = hero.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        const travel = Math.max(-18, Math.min(18, bounds.top * -0.022));
        heroArt.style.setProperty("--scroll-shift", travel.toFixed(2) + "px");
      }
    }
    scrollQueued = false;
  }

  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  updateScrollUI();

  if (window.matchMedia("(pointer: fine)").matches && cursorGlow && !reduceMotion) {
    body.classList.add("has-fine-pointer");
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.left = event.clientX + "px";
      cursorGlow.style.top = event.clientY + "px";
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.width && rect.height) {
          pointer.x = (event.clientX - rect.left) / rect.width;
          pointer.y = (event.clientY - rect.top) / rect.height;
          hero.style.setProperty("--pointer-x", ((pointer.x - 0.5) * 8).toFixed(2) + "px");
          hero.style.setProperty("--pointer-y", ((pointer.y - 0.5) * 8).toFixed(2) + "px");
        }
      }
    }, { passive: true });
  }

  // Subtle dust and orbit paths are drawn locally: no image or animation library required.
  if (canvas && canvas.getContext && !reduceMotion) {
    const context = canvas.getContext("2d", { alpha: true });
    if (context) {
      const countForWidth = () => Math.min(76, Math.max(26, Math.round(canvasWidth / 19)));
      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvasWidth = Math.max(1, rect.width);
        canvasHeight = Math.max(1, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvasWidth * dpr);
        canvas.height = Math.round(canvasHeight * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        particles = Array.from({ length: countForWidth() }, () => ({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          r: Math.random() * 1.5 + 0.35,
          drift: Math.random() * 0.2 + 0.035,
          phase: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.38 + 0.08
        }));
      }

      function drawCanvas(now) {
        if (document.hidden) {
          canvasFrame = 0;
          return;
        }
        const time = now * 0.00018;
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        const cx = canvasWidth * 0.72;
        const cy = canvasHeight * 0.49;
        const rx = Math.min(canvasWidth * 0.32, 350);
        const ry = Math.min(canvasHeight * 0.18, 180);

        context.save();
        context.translate(cx, cy);
        context.rotate(-0.48 + Math.sin(time) * 0.025);
        context.beginPath();
        context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        context.strokeStyle = "rgba(149, 87, 64, 0.16)";
        context.lineWidth = 1;
        context.stroke();
        context.beginPath();
        context.ellipse(0, 0, rx * 0.8, ry * 1.7, 0.15, 0, Math.PI * 2);
        context.strokeStyle = "rgba(189, 119, 93, 0.1)";
        context.stroke();
        context.restore();

        particles.forEach((particle) => {
          const driftX = Math.sin(time * 3 + particle.phase) * 7;
          const driftY = Math.cos(time * 2 + particle.phase) * 6;
          const pulse = 0.65 + (Math.sin(time * 4 + particle.phase) + 1) * 0.17;
          context.beginPath();
          context.arc(particle.x + driftX, particle.y + driftY, particle.r, 0, Math.PI * 2);
          context.fillStyle = "rgba(149, 87, 64, " + (particle.alpha * pulse) + ")";
          context.fill();
        });

        // Keep the artwork subtly responsive to the pointer without moving the layout.
        if (hero) {
          hero.style.setProperty("--pointer-art-x", ((pointer.x - 0.5) * 9).toFixed(2) + "px");
          hero.style.setProperty("--pointer-art-y", ((pointer.y - 0.5) * 9).toFixed(2) + "px");
        }
        canvasFrame = window.requestAnimationFrame(drawCanvas);
      }

      resizeCanvas();
      canvasFrame = window.requestAnimationFrame(drawCanvas);
      window.addEventListener("resize", resizeCanvas, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && !canvasFrame) canvasFrame = window.requestAnimationFrame(drawCanvas);
      });
    }
  }

  // Give project artwork a slight, restrained tilt on desktop only.
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.querySelectorAll(".project-art").forEach((art) => {
      art.addEventListener("pointermove", (event) => {
        const rect = art.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        art.style.setProperty("--tilt-x", (y * -1.5).toFixed(2) + "deg");
        art.style.setProperty("--tilt-y", (x * 1.5).toFixed(2) + "deg");
      });
      art.addEventListener("pointerleave", () => {
        art.style.removeProperty("--tilt-x");
        art.style.removeProperty("--tilt-y");
      });
    });
  }

  // Ensure hidden intro transitions do not leave scrolling locked if the tab is backgrounded.
  window.addEventListener("pageshow", () => {
    if (!intro || !intro.isConnected) {
      body.classList.remove("is-loading");
      body.classList.add("site-entered");
      inertSections.forEach((section) => section.removeAttribute("inert"));
    }
  });

  // Project directory filtering and search.
  const projectCards = [...document.querySelectorAll(".project-card[data-category][data-repo]")];
  const projectSearch = document.getElementById("project-search");
  const projectFilters = [...document.querySelectorAll(".project-filter[data-filter]")];
  const projectCount = document.getElementById("project-count");
  const activityList = document.getElementById("activity-list");
  let activeProjectFilter = "all";

  function filterProjects() {
    const query = (projectSearch?.value || "").trim().toLocaleLowerCase();
    let visible = 0;
    projectCards.forEach((card) => {
      const categoryMatch = activeProjectFilter === "all" || card.dataset.category === activeProjectFilter;
      const queryMatch = !query || card.textContent.toLocaleLowerCase().includes(query) || card.dataset.repo.toLocaleLowerCase().includes(query);
      card.hidden = !(categoryMatch && queryMatch);
      if (!card.hidden) visible += 1;
    });
    if (projectCount) projectCount.textContent = visible + (visible === 1 ? " project" : " projects");
    let empty = document.getElementById("project-empty");
    if (!empty && projectCards.length) {
      empty = document.createElement("p");
      empty.id = "project-empty";
      empty.className = "project-empty";
      empty.textContent = "No projects match that search. Try another term or clear the filter.";
      empty.hidden = true;
      projectCards[0].parentElement?.insertAdjacentElement("afterend", empty);
    }
    if (empty) empty.hidden = visible !== 0;
  }

  projectFilters.forEach((button) => button.addEventListener("click", () => {
    activeProjectFilter = button.dataset.filter || "all";
    projectFilters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    filterProjects();
  }));
  projectSearch?.addEventListener("input", filterProjects);
  filterProjects();

  // GitHub API values are rendered as text; failure never blocks the project links.
  const githubHeaders = { Accept: "application/vnd.github+json" };
  const dateFormatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });

  function safeGitHubUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "github.com" ? url.href : "";
    } catch {
      return "";
    }
  }

  function readableDate(value) {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? dateFormatter.format(date) : "date unavailable";
  }

  async function getGitHubJson(url) {
    const response = await fetch(url, { headers: githubHeaders });
    if (!response.ok) throw new Error("GitHub API returned " + response.status);
    return response.json();
  }

  function addMeta(target, label, value) {
    const item = document.createElement("span");
    item.className = "repo-meta-item";
    const key = document.createElement("span");
    key.className = "repo-meta-label";
    key.textContent = label;
    const val = document.createElement("strong");
    val.textContent = value;
    item.append(key, val);
    target.append(item);
  }

  function renderRepoMeta(card, info) {
    const target = card.querySelector("[data-repo-meta]");
    if (!target) return;
    target.replaceChildren();
    if (info.language) addMeta(target, "Language", info.language);
    addMeta(target, "Stars", new Intl.NumberFormat().format(info.stargazers_count || 0));
    addMeta(target, "Updated", readableDate(info.pushed_at || info.updated_at));
    const url = safeGitHubUrl(info.html_url);
    if (url) {
      const link = document.createElement("a");
      link.className = "repo-meta-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Source ↗";
      target.append(link);
    }
  }

  async function renderLatestRelease(card, repoPath) {
    const target = card.querySelector("[data-repo-release]");
    if (!target) return;
    try {
      const release = await getGitHubJson("https://api.github.com/repos/" + repoPath + "/releases/latest");
      target.replaceChildren();
      const label = document.createElement("span");
      label.className = "release-label";
      label.textContent = "LATEST RELEASE";
      target.append(label);
      const url = safeGitHubUrl(release.html_url);
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = release.name || release.tag_name || "View release";
        target.append(link);
      } else {
        target.append(document.createTextNode(release.name || release.tag_name || "Published release"));
      }
      if (release.published_at) {
        const time = document.createElement("time");
        time.dateTime = release.published_at;
        time.textContent = readableDate(release.published_at);
        target.append(time);
      }
    } catch (error) {
      target.replaceChildren();
      const label = document.createElement("span");
      label.className = "release-label";
      label.textContent = "RELEASES";
      const message = document.createElement("span");
      message.textContent = error.message.includes("404") ? "No public release published yet" : "Release details unavailable";
      target.append(label, message);
    }
  }

  async function fetchLatestCommit(card) {
    const repoPath = card.dataset.repo;
    const commits = await getGitHubJson("https://api.github.com/repos/" + repoPath + "/commits?per_page=1");
    const commit = Array.isArray(commits) ? commits[0] : null;
    if (!commit?.commit) throw new Error("No public commits returned");
    return {
      name: card.querySelector("h3")?.textContent?.trim() || repoPath.split("/").pop(),
      message: (commit.commit.message || "Commit message unavailable").split("\n")[0],
      date: commit.commit.author?.date || commit.commit.committer?.date || "",
      url: safeGitHubUrl(commit.html_url)
    };
  }

  function renderActivity(entries) {
    if (!activityList) return;
    activityList.replaceChildren();
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!entries.length) {
      const state = document.createElement("p");
      state.className = "activity-state";
      state.textContent = "GitHub activity is unavailable right now. Open a repository directly to inspect recent work.";
      activityList.append(state);
      return;
    }
    entries.forEach((entry) => {
      const row = document.createElement("article");
      row.className = "activity-item";
      const mark = document.createElement("span");
      mark.className = "activity-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "↗";
      const details = document.createElement("div");
      details.className = "activity-details";
      const project = document.createElement("span");
      project.className = "activity-project";
      project.textContent = entry.name;
      const message = document.createElement("p");
      message.textContent = entry.message;
      details.append(project, message);
      const meta = document.createElement("div");
      meta.className = "activity-meta";
      const time = document.createElement("time");
      time.textContent = readableDate(entry.date);
      if (entry.date) time.dateTime = entry.date;
      meta.append(time);
      if (entry.url) {
        const link = document.createElement("a");
        link.href = entry.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "Commit";
        link.setAttribute("aria-label", "View commit for " + entry.name);
        meta.append(link);
      }
      row.append(mark, details, meta);
      activityList.append(row);
    });
  }

  if (projectCards.length) {
    const activityRequests = projectCards.map((card) => fetchLatestCommit(card).catch(() => null));
    const metadataRequests = projectCards.map(async (card) => {
      try {
        const info = await getGitHubJson("https://api.github.com/repos/" + card.dataset.repo);
        renderRepoMeta(card, info);
      } catch {
        const target = card.querySelector("[data-repo-meta]");
        if (target) target.textContent = "Live repository details unavailable";
      }
      await renderLatestRelease(card, card.dataset.repo);
    });
    Promise.all(activityRequests).then((items) => renderActivity(items.filter(Boolean)));
    Promise.all(metadataRequests).catch(() => {});
  }

})();
