/*
  PauzeX Developments — 3D interaction layer
  Progressive enhancement only. Existing navigation, project filters and GitHub
  integrations remain in script.js and are not replaced by this file.
*/
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    let pointerFrame = 0;
    window.addEventListener("pointermove", (event) => {
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--px-glow-x", event.clientX + "px");
        document.documentElement.style.setProperty("--px-glow-y", event.clientY + "px");
        pointerFrame = 0;
      });
    }, { passive: true });

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - .5) * 8;
        const rotateX = (.5 - y) * 7;
        card.style.setProperty("--tilt-x", rotateX.toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", rotateY.toFixed(2) + "deg");
        card.style.setProperty("--card-x", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--card-y", (y * 100).toFixed(1) + "%");
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--card-x", "50%");
        card.style.setProperty("--card-y", "0%");
      });
    });
  }

  // A tiny depth cue for the hero. It is decorative and never captures input.
  const hero = document.querySelector(".hero");
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      hero.style.setProperty("--hero-rotate-x", (y * -1.2).toFixed(2) + "deg");
      hero.style.setProperty("--hero-rotate-y", (x * 1.5).toFixed(2) + "deg");
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hero-rotate-x", "0deg");
      hero.style.setProperty("--hero-rotate-y", "0deg");
    });
  }
})();
