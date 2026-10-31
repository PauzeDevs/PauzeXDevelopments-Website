
/* PauzeX visitor check: first-party friction, not server-side access control. */
(() => {
  "use strict";
  const gate = document.getElementById("px-verify-gate");
  if (!gate) return;

  const COUNT = "px_visit_count_v2";
  const SESSION = "px_verified_session_v2";
  const COUNTED = "px_visit_counted_v2";
  const SESSION_TTL = 12 * 60 * 60 * 1000;
  const $ = (id) => document.getElementById(id);
  const status = $("px-verify-status");
  const checkbox = $("px-verify-human");
  const primary = $("px-verify-primary");
  const extra = $("px-verify-extra");
  const options = $("px-verify-options");
  const prompt = $("px-verify-prompt");
  const startedAt = performance.now();
  let pointerActivity = 0;
  let answer = -1;
  let attempts = 0;
  let observer = null;

  const safeGet = (storageName, key) => {
    try { return window[storageName].getItem(key); } catch { return null; }
  };
  const safeSet = (storageName, key, value) => {
    try { window[storageName].setItem(key, value); return true; } catch { return false; }
  };
  const readCount = () => {
    const value = Number(safeGet("localStorage", COUNT));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  };
  let visit = readCount();
  if (safeGet("sessionStorage", COUNTED) !== "1") {
    visit += 1;
    safeSet("localStorage", COUNT, String(visit));
    safeSet("sessionStorage", COUNTED, "1");
  }
  const sessionIsValid = () => {
    try {
      const record = JSON.parse(safeGet("sessionStorage", SESSION) || "null");
      return record && record.ok === true && Number.isFinite(record.at) &&
        Date.now() - record.at >= 0 && Date.now() - record.at < SESSION_TTL;
    } catch { return false; }
  };
  const due = visit === 1 || visit % 10 === 0;
  if (!due || sessionIsValid()) {
    gate.hidden = true;
    document.body.classList.remove("px-verify-locked");
    // The intro controller owns the site's normal inert state. Do not leave
    // the header or page content inert when verification is not required.
    document.getElementById("site-header")?.removeAttribute("inert");
    document.getElementById("main")?.removeAttribute("inert");
    document.querySelector(".site-footer")?.removeAttribute("inert");
    return;
  }

  document.body.classList.add("px-verify-locked");
  const symbols = ["◆", "●", "▲", "✦", "⬟", "✚", "☾", "✧", "⬢", "✺"];
  const randomInt = (max) => {
    if (window.crypto?.getRandomValues) {
      const n = new Uint32Array(1);
      crypto.getRandomValues(n);
      return n[0] % max;
    }
    return Math.floor(Math.random() * max);
  };
  const complete = () => {
    safeSet("sessionStorage", SESSION, JSON.stringify({ ok: true, at: Date.now(), visit }));
    status.textContent = "Verified. Welcome to PauzeX.";
    gate.classList.add("is-verified");
    primary.disabled = true;
    observer?.disconnect();
    window.setTimeout(() => {
      gate.hidden = true;
      document.body.classList.remove("px-verify-locked");
      $("site-header")?.removeAttribute("inert");
      $("main")?.removeAttribute("inert");
      document.querySelector(".site-footer")?.removeAttribute("inert");
      const nextFocus = document.getElementById("enter-button") || document.getElementById("main");
      nextFocus?.focus({ preventScroll: true });
    }, 420);
  };
  const issueChallenge = () => {
    attempts += 1;
    const target = symbols[randomInt(symbols.length)];
    const picks = new Set([target]);
    while (picks.size < 4) picks.add(symbols[randomInt(symbols.length)]);
    const choices = [...picks];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    answer = choices.indexOf(target);
    prompt.textContent = "Select the matching symbol: " + target;
    options.replaceChildren();
    choices.forEach((symbol, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "px-verify-option";
      button.textContent = symbol;
      button.setAttribute("aria-label", "Symbol option " + (index + 1) + ": " + symbol);
      button.addEventListener("click", () => {
        if (index === answer) complete();
        else {
          status.textContent = "Not quite. A new challenge has been generated.";
          issueChallenge();
        }
      });
      options.append(button);
    });
    extra.hidden = false;
    status.textContent = "An additional check is required.";
    options.querySelector("button")?.focus();
  };
  // Keep keyboard users inside the modal until verification is complete.
  gate.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...gate.querySelectorAll('button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && !element.closest("[hidden]") && element.getAttribute("aria-hidden") !== "true");
    if (!focusable.length) { event.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !gate.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !gate.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  checkbox.focus({ preventScroll: true });
  document.addEventListener("pointermove", () => { pointerActivity = Math.min(pointerActivity + 1, 20); }, { passive: true });
  primary.addEventListener("click", () => {
    if (!checkbox.checked) {
      status.textContent = "Please confirm before continuing.";
      return;
    }
    const elapsed = performance.now() - startedAt;
    const suspicious = elapsed < 1100 ||
      (pointerActivity === 0 && matchMedia("(pointer:fine)").matches) ||
      attempts > 0;
    if (suspicious) issueChallenge();
    else complete();
  });

  // Detect accidental removal of the gate while the challenge is pending.
  observer = new MutationObserver(() => {
    if (!gate.hidden && !gate.isConnected) {
      document.body.classList.add("px-verify-locked");
      status.textContent = "Verification state changed. Reload this page to continue.";
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

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

  function renderPrivateRepositoryState(card) {
    const meta = card.querySelector("[data-repo-meta]");
    if (meta) meta.textContent = "Private repository details require access";

    const release = card.querySelector("[data-repo-release]");
    if (release) {
      const label = document.createElement("span");
      label.className = "release-label";
      label.textContent = "RELEASES";
      const message = document.createElement("span");
      message.textContent = "Details require repository access";
      release.replaceChildren(label, message);
    }
  }

  if (projectCards.length) {
    const publicProjectCards = projectCards.filter((card) => card.dataset.repoVisibility !== "private");
    projectCards
      .filter((card) => card.dataset.repoVisibility === "private")
      .forEach(renderPrivateRepositoryState);

    // Load repository details only as a card approaches the viewport.
    const loadCardMetadata = async (card) => {
      if (card.dataset.metadataLoaded === "true") return;
      card.dataset.metadataLoaded = "true";
      try {
        const info = await getGitHubJson("https://api.github.com/repos/" + card.dataset.repo);
        renderRepoMeta(card, info);
      } catch {
        const target = card.querySelector("[data-repo-meta]");
        if (target) target.textContent = "Live repository details unavailable";
      }
      await renderLatestRelease(card, card.dataset.repo);
    };

    if ("IntersectionObserver" in window) {
      const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          loadCardMetadata(entry.target);
        });
      }, { rootMargin: "240px 0px", threshold: 0 });
      publicProjectCards.forEach((card) => cardObserver.observe(card));
    } else {
      publicProjectCards.forEach(loadCardMetadata);
    }

    // Recent activity is fetched only when its panel is near view, not on initial page load.
    const loadActivity = () => {
      if (!activityList || activityList.dataset.loaded === "true") return;
      activityList.dataset.loaded = "true";
      Promise.all(publicProjectCards.map((card) => fetchLatestCommit(card).catch(() => null)))
        .then((items) => renderActivity(items.filter(Boolean)));
    };
    if (activityList && "IntersectionObserver" in window) {
      const activityObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadActivity();
      }, { rootMargin: "300px 0px", threshold: 0 });
      activityObserver.observe(activityList);
    } else {
      loadActivity();
    }
  }

})();
