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
  const skipLink = document.getElementById("skip-link");
  const mainContent = document.getElementById("main");
  const inertSections = [document.getElementById("site-header"), mainContent, document.querySelector(".site-footer")].filter(Boolean);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introFinished = false;

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

    scrollQueued = false;
  }

  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  updateScrollUI();

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
      let release;
      try {
        // GitHub's /releases/latest endpoint intentionally excludes prereleases.
        release = await getGitHubJson("https://api.github.com/repos/" + repoPath + "/releases/latest");
      } catch (error) {
        if (!error.message.includes("404")) throw error;
        const releases = await getGitHubJson("https://api.github.com/repos/" + repoPath + "/releases?per_page=10");
        release = Array.isArray(releases) ? releases.find((item) => !item.draft) : null;
        if (!release) {
          target.replaceChildren();
          const label = document.createElement("span");
          label.className = "release-label";
          label.textContent = "RELEASES";
          const message = document.createElement("span");
          message.textContent = "No public release published yet";
          target.append(label, message);
          return;
        }
      }

      target.replaceChildren();
      const label = document.createElement("span");
      label.className = "release-label";
      label.textContent = release.prerelease ? "BETA / PRE-RELEASE" : "LATEST RELEASE";
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
    } catch {
      target.replaceChildren();
      const label = document.createElement("span");
      label.className = "release-label";
      label.textContent = "RELEASES";
      const message = document.createElement("span");
      message.textContent = "Release details unavailable";
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
