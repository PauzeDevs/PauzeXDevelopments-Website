/*
  PauzeX Developments — reveal timing enhancement.
  The core script owns IntersectionObserver visibility; this adds tasteful stagger.
*/
(() => {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const groups = [".project-grid", ".service-list", ".studio-layout", ".closing-content", ".activity-list"];
  groups.forEach(selector => {
    document.querySelectorAll(selector).forEach(group => {
      const items = [...group.querySelectorAll(":scope > .reveal, :scope > article.reveal, :scope > div > .reveal")];
      items.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", Math.min(index * 95, 380) + "ms");
      });
    });
  });
  document.querySelectorAll(".section-heading.reveal, .work-title-row.reveal").forEach(item => {
    item.style.setProperty("--reveal-delay", "40ms");
  });
})();
