/*
 * PauzeX Developments — adaptive 3D hero
 * Three.js is loaded only after the intro clears and the hero is visible.
 * Mobile/touch devices use a capped render scale and frame rate.
 */
(() => {
  "use strict";
  const hero = document.querySelector(".hero");
  const host = document.querySelector(".hero-3d-scene");
  if (!hero || !host) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const fallback = document.createElement("div");
  fallback.className = "hero-3d-fallback";
  fallback.setAttribute("aria-hidden", "true");
  host.appendChild(fallback);
  if (reducedMotion) return;

  let started = false;
  let renderer, scene, camera, core, ringA, ringB, stars, observer;
  let frame = 0;
  let lastFrame = 0;
  let visible = false;
  let width = 0, height = 0;
  const maxFps = coarse ? 30 : 60;
  const frameInterval = 1000 / maxFps;

  const start = async () => {
    if (started || document.hidden || !visible || document.body.classList.contains("is-loading")) return;
    started = true;
    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js");
      if (!visible || document.hidden) { started = false; return; }

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
      camera.position.set(0, 0, 8.8);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !coarse,
        powerPreference: "low-power",
        stencil: false,
        depth: true
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.8));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      host.appendChild(renderer.domElement);

      // Purposeful studio lighting gives the glass geometry real dimensional highlights.
      scene.add(new THREE.HemisphereLight(0xd8efff, 0x18364c, 1.45));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(-3.5, 4.5, 5);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0x78c7ff, 18, 12, 2);
      rimLight.position.set(3.5, 1.5, 2.5);
      scene.add(rimLight);
      const lowerLight = new THREE.PointLight(0x9a8bff, 9, 10, 2);
      lowerLight.position.set(-2.5, -3, -1.5);
      scene.add(lowerLight);

      const group = new THREE.Group();
      scene.add(group);
      const geometry = new THREE.IcosahedronGeometry(1.38, coarse ? 2 : 3);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x9bc9e4,
        metalness: .42,
        roughness: .19,
        transmission: .16,
        thickness: .8,
        clearcoat: 1,
        clearcoatRoughness: .1,
        emissive: 0x15334b,
        emissiveIntensity: .28,
        transparent: true,
        opacity: .94
      });
      core = new THREE.Mesh(geometry, material);
      group.add(core);

      // Fine crystalline edgework adds detail without a costly post-processing bloom pass.
      const edgeGeometry = new THREE.EdgesGeometry(geometry, 18);
      const edgeLines = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({
        color: 0xd7f0ff, transparent: true, opacity: coarse ? .24 : .34
      }));
      edgeLines.scale.setScalar(1.004);
      group.add(edgeLines);

      ringA = new THREE.Mesh(
        new THREE.TorusGeometry(2.05, .012, 6, coarse ? 72 : 120),
        new THREE.MeshBasicMaterial({ color: 0xc4e3f5, transparent: true, opacity: .72 })
      );
      ringA.rotation.set(.9, .25, -.45);
      group.add(ringA);
      ringB = new THREE.Mesh(
        new THREE.TorusGeometry(2.35, .008, 5, coarse ? 64 : 100),
        new THREE.MeshBasicMaterial({ color: 0x80b6d6, transparent: true, opacity: .46 })
      );
      ringB.rotation.set(1.2, -.65, .55);
      group.add(ringB);

      const count = coarse ? 260 : 520;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const radius = 2.7 + Math.random() * 3.1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
        color: 0xd9effb, size: coarse ? .018 : .022, transparent: true, opacity: .65,
        sizeAttenuation: true
      }));
      scene.add(stars);

      const resize = () => {
        const rect = hero.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.x = width < 700 ? 1.0 : 1.65;
        camera.position.y = width < 700 ? .25 : .05;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        group.position.x = width < 700 ? .9 : 1.75;
        group.scale.setScalar(width < 700 ? .72 : 1);
      };
      resize();
      window.addEventListener("resize", resize, { passive: true });

      const animate = (now) => {
        frame = 0;
        if (!visible || document.hidden) return;
        if (now - lastFrame < frameInterval) {
          frame = requestAnimationFrame(animate);
          return;
        }
        const delta = Math.min((now - (lastFrame || now)) / 1000, .05);
        lastFrame = now;
        core.rotation.y += delta * .16;
        core.rotation.x += delta * .07;
        ringA.rotation.z += delta * .035;
        ringB.rotation.y -= delta * .025;
        stars.rotation.y += delta * .008;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
      };
      const resume = () => {
        if (visible && !document.hidden && !frame) {
          lastFrame = 0;
          frame = requestAnimationFrame(animate);
        }
      };
      const pause = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      };
      document.addEventListener("visibilitychange", () => document.hidden ? pause() : resume());
      observer = new IntersectionObserver((entries) => {
        visible = entries.some(entry => entry.isIntersecting);
        visible ? resume() : pause();
      }, { threshold: 0.02 });
      observer.observe(hero);
      fallback.remove();
      resume();
    } catch (error) {
      console.warn("PauzeX 3D hero unavailable; using lightweight fallback.", error);
      started = false;
    }
  };

  const visibilityObserver = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      visible = true;
      visibilityObserver.disconnect();
      const waitForIntro = new MutationObserver(() => {
        if (!document.body.classList.contains("is-loading")) {
          waitForIntro.disconnect();
          start();
        }
      });
      if (!document.body.classList.contains("is-loading")) start();
      else waitForIntro.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
  }, { threshold: 0.01 });
  visibilityObserver.observe(hero);
})();