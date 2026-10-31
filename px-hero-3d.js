/*
 * PauzeX Developments — ThreeUI Temple Night integration.
 * The scene renderer is the MIT-licensed Community implementation from
 * MengTo/threeui, adapted only to resolve Three.js from its pinned ESM CDN URL.
 * It remains lazy-loaded, visibility-aware, pointer-safe and self-disposing.
 */
(() => {
  "use strict";

  const hero = document.querySelector(".hero");
  const host = document.querySelector(".hero-3d-scene");
  if (!hero || !host) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let renderer = null;
  let loading = false;
  let disposed = false;
  let visible = false;
  let frame = 0;
  let lastFrameAt = 0;
  const frameInterval = finePointer ? 1000 / 60 : 1000 / 30;
  let resizeObserver = null;
  let visibilityObserver = null;
  let introObserver = null;

  const canvas = document.createElement("canvas");
  canvas.className = "temple-night-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.replaceChildren(canvas);
  host.dataset.state = "loading";

  const cancelFrame = () => {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const draw = (time) => {
    frame = 0;
    if (disposed || !renderer || !visible || document.hidden) return;
    if (lastFrameAt && time - lastFrameAt < frameInterval) { schedule(); return; }
    lastFrameAt = time;
    renderer.render(time);
    if (!reducedMotion && !renderer.reducedMotion) schedule();
  };

  const schedule = () => {
    if (!disposed && renderer && visible && !document.hidden && !frame) {
      frame = requestAnimationFrame(draw);
    }
  };

  const handleResize = () => {
    if (!renderer) return;
    try {
      renderer.resize();
      schedule();
    } catch (error) {
      console.warn("Temple Night resize failed.", error);
    }
  };

  const handlePointerMove = (event) => {
    if (!renderer || !finePointer) return;
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
    const y = 1 - ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2;
    renderer.setPointer(x, y, true);
    schedule();
  };

  const clearPointer = () => {
    renderer?.setPointer(0, 0, false);
    schedule();
  };

  const onVisibilityChange = () => {
    if (document.hidden) cancelFrame();
    else { lastFrameAt = 0; schedule(); }
  };

  const start = async () => {
    if (loading || renderer || disposed || document.hidden ||
        !visible || document.body.classList.contains("is-loading")) return;

    loading = true;
    host.dataset.state = "loading";
    try {
      const module = await import("./templeNightRenderer.js");
      if (disposed || document.hidden || !visible) {
        loading = false;
        return;
      }

      renderer = module.createTempleNightRenderer(canvas);
      if (!renderer) throw new Error("The WebGL renderer could not be created.");

      host.dataset.state = "ready";
      resizeObserver = "ResizeObserver" in window
        ? new ResizeObserver(handleResize)
        : null;
      if (resizeObserver) resizeObserver.observe(host);
      else window.addEventListener("resize", handleResize, { passive: true });

      hero.addEventListener("pointermove", handlePointerMove, { passive: true });
      hero.addEventListener("pointerleave", clearPointer, { passive: true });
      window.addEventListener("blur", clearPointer);
      document.addEventListener("visibilitychange", onVisibilityChange);
      handleResize();
      schedule();
    } catch (error) {
      console.error("PauzeX Temple Night scene could not initialise.", error);
      host.dataset.state = "fallback";
      canvas.remove();
    } finally {
      loading = false;
    }
  };

  const checkStart = () => {
    if (visible && !document.body.classList.contains("is-loading")) start();
  };

  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver((entries) => {
      visible = entries.some(entry => entry.isIntersecting);
      if (!visible) cancelFrame();
      else checkStart();
    }, { rootMargin: "100px 0px", threshold: 0.01 });
    visibilityObserver.observe(hero);
  } else {
    visible = true;
  }

  if (document.body.classList.contains("is-loading") && "MutationObserver" in window) {
    introObserver = new MutationObserver(() => {
      if (!document.body.classList.contains("is-loading")) {
        introObserver.disconnect();
        introObserver = null;
        checkStart();
      }
    });
    introObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  } else {
    checkStart();
  }

  if (!("IntersectionObserver" in window)) checkStart();

  window.addEventListener("pagehide", (event) => {
    cancelFrame();
    // Keep the WebGL context alive when the browser stores this page in BFCache.
    if (event.persisted) return;
    disposed = true;
    visibilityObserver?.disconnect();
    introObserver?.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", handleResize);
    hero.removeEventListener("pointermove", handlePointerMove);
    hero.removeEventListener("pointerleave", clearPointer);
    window.removeEventListener("blur", clearPointer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    renderer?.dispose();
    renderer = null;
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    visible = hero.getBoundingClientRect().bottom > 0 &&
      hero.getBoundingClientRect().top < window.innerHeight;
    schedule();
  });
})();
