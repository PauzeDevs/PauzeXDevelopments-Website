/*
  PauzeX Developments — interaction polish
  Progressive enhancement. Leaves the existing site script and its features intact.
*/
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const header = document.querySelector(".site-header");
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  // Compact header treatment and active-section navigation.
  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-28% 0px -58% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  if (!finePointer || reduceMotion) return;

  // Soft magnetic response on primary actions, capped to avoid distracting movement.
  document.querySelectorAll(".hero-actions .button, .header-contact, .closing .button").forEach(el => {
    el.addEventListener("pointermove", event => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = "translate3d(" + (dx * 5).toFixed(1) + "px," + (dy * 4).toFixed(1) + "px,0)";
    }, { passive: true });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    el.addEventListener("blur", () => { el.style.transform = ""; });
  });

  // Scroll-linked depth on the studio note and activity surface.
  const depthTargets = document.querySelectorAll(".studio-note, .activity-panel");
  let scheduled = false;
  const updateDepth = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      const viewport = window.innerHeight || 1;
      depthTargets.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (center - viewport / 2) / viewport));
        el.style.setProperty("--scroll-depth", (progress * (index ? 1.2 : -.8)).toFixed(3));
      });
      scheduled = false;
    });
  };
  window.addEventListener("scroll", updateDepth, { passive: true });
  updateDepth();
})();
