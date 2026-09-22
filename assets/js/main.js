(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll-driven assembly (dependency-free) ---------- */

  const offsets = {
    left: { x: -80, y: 0 },
    right: { x: 80, y: 0 },
    top: { x: 0, y: -60 },
    bottom: { x: 0, y: 55 },
    scale: { x: 0, y: 30, scale: 0.92 },
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /* intro: one-time entrance on load, independent of scroll position */

  const introItems = document.querySelectorAll(".scene--intro [data-assemble]");
  if (!reduceMotion) {
    introItems.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.12}s`;
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        introItems.forEach((el) => el.classList.add("is-in"));
      });
    });
  } else {
    introItems.forEach((el) => el.classList.add("is-in"));
  }

  /* other scenes: assembly tied directly to scroll position */

  let assembleItems = [];

  if (!reduceMotion) {
    document.querySelectorAll(".scene:not(.scene--intro)").forEach((scene) => {
      scene.querySelectorAll("[data-assemble]").forEach((el, i) => {
        el.style.willChange = "transform, opacity";
        assembleItems.push({ el, index: i, dir: el.dataset.assemble });
      });
    });

    const updateAssembly = () => {
      const vh = window.innerHeight;
      assembleItems.forEach(({ el, index, dir }) => {
        const shift = index * 42;
        const startY = vh * 0.92 - shift;
        const endY = vh * 0.42 - shift;
        let progress = (startY - el.getBoundingClientRect().top) / (startY - endY);
        progress = Math.min(1, Math.max(0, progress));
        const eased = easeOutCubic(progress);
        const off = offsets[dir] || offsets.bottom;
        const x = off.x * (1 - eased);
        const y = off.y * (1 - eased);
        const scale = off.scale ? off.scale + (1 - off.scale) * eased : 1;
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = eased.toFixed(3);
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateAssembly();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateAssembly();
  }

  /* ---------- active scene tracking (nav + dots + bg color) ---------- */

  const scenes = Array.from(document.querySelectorAll(".scene"));
  const navLinks = document.querySelectorAll("[data-nav]");
  const dots = document.querySelectorAll("[data-dot]");
  const scrollCue = document.getElementById("scrollCue");

  const sceneColors = {
    intro: [7, 19, 9],
    about: [9, 24, 13],
    skills: [7, 17, 10],
    work: [11, 28, 16],
    contact: [7, 19, 9],
  };

  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
    dots.forEach((d) => d.classList.toggle("is-active", d.dataset.dot === id));
    const rgb = sceneColors[id];
    if (rgb) {
      document.body.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
    if (scrollCue) {
      scrollCue.classList.toggle("is-hidden", id !== "intro");
    }
  };

  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: 0.5 }
  );
  scenes.forEach((s) => sceneObserver.observe(s));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = document.getElementById(dot.dataset.dot);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- scroll progress bar + vertical line ---------- */

  const progressFill = document.getElementById("scrollProgressFill");
  const scrollLineFill = document.getElementById("scrollLineFill");

  if (progressFill || scrollLineFill) {
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const scrollPct = max > 0 ? doc.scrollTop / max : 0;

      if (progressFill) {
        progressFill.style.width = `${scrollPct * 100}%`;
      }
      if (scrollLineFill) {
        scrollLineFill.style.height = `${scrollPct * 100}%`;
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- custom cursor ---------- */

  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const cursor = document.querySelector(".cursor-dot");
    if (cursor) {
      window.addEventListener("mousemove", (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
      });
    }
  }
})();
