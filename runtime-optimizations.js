/*
  PauzeX Developments — runtime performance helpers.
  Batches visual updates and caches public GitHub API responses for this tab.
*/
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Use one animation-frame scheduler for the scroll-linked polish.
  const header = document.querySelector(".site-header");
  const depthTargets = [...document.querySelectorAll(".studio-note, .activity-panel")];
  let scrollFrame = 0;
  const updateScrollEffects = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
      if (!reduceMotion && window.innerWidth > 760) {
        const viewport = window.innerHeight || 1;
        depthTargets.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          if (rect.bottom < -120 || rect.top > viewport + 120) return;
          const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - viewport / 2) / viewport));
          element.style.setProperty("--scroll-depth", (progress * (index ? 1.1 : -.7)).toFixed(2));
        });
      }
      scrollFrame = 0;
    });
  };
  window.addEventListener("scroll", updateScrollEffects, { passive: true });
  window.addEventListener("resize", updateScrollEffects, { passive: true });
  updateScrollEffects();

  // Cache API JSON in sessionStorage for 10 minutes; direct GitHub links remain usable offline.
  const originalFetch = window.fetch.bind(window);
  const cachePrefix = "pauzex-api-cache-v2:";
  const ttl = 10 * 60 * 1000;
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    if (!url || !url.startsWith("https://api.github.com/repos/")) return originalFetch(input, init);
    const key = cachePrefix + url;
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.savedAt < ttl) {
          return new Response(JSON.stringify(parsed.data), {
            status: 200,
            headers: { "Content-Type": "application/json", "X-PauzeX-Cache": "HIT" }
          });
        }
      }
    } catch {}
    const response = await originalFetch(input, init);
    if (response.ok) {
      try {
        const data = await response.clone().json();
        sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
      } catch {}
    }
    return response;
  };

  // Project-card pointer tilt and highlight are owned by immersive.js to avoid duplicate listeners.
})();
