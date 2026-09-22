(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  /* ---------- intro: one-time entrance on load ---------- */

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

  /* ---------- other scenes: assembly tied to scroll, settles once and holds ---------- */

  const offsets = {
    left: { x: -80, y: 0 },
    right: { x: 80, y: 0 },
    top: { x: 0, y: -60 },
    bottom: { x: 0, y: 55 },
    scale: { x: 0, y: 30, scale: 0.92 },
  };

  const assembleItems = [];

  if (!reduceMotion) {
    document.querySelectorAll(".scene:not(.scene--intro)").forEach((scene) => {
      scene.querySelectorAll("[data-assemble]").forEach((el, i) => {
        el.style.willChange = "transform, opacity";
        assembleItems.push({
          el,
          index: i,
          dir: el.dataset.assemble,
          wipe: el.hasAttribute("data-wipe"),
          settled: false,
        });
      });
    });
  } else {
    document.querySelectorAll(".scene:not(.scene--intro) [data-assemble]").forEach((el) => {
      if (el.hasAttribute("data-wipe")) {
        el.style.clipPath = "inset(0 0 0 0)";
      }
    });
  }

  const updateAssembly = () => {
    const vh = window.innerHeight;
    assembleItems.forEach((item) => {
      if (item.settled) return;
      const { el, index, dir, wipe } = item;
      const shift = index * 42;
      const startY = vh * 0.92 - shift;
      const endY = vh * 0.42 - shift;
      let progress = (startY - el.getBoundingClientRect().top) / (startY - endY);
      progress = clamp01(progress);
      const eased = dir === "scale" ? easeOutBack(progress) : easeOutCubic(progress);

      if (wipe) {
        const reveal = eased * 100;
        el.style.clipPath = `inset(0 ${(100 - reveal).toFixed(1)}% 0 0)`;
      } else {
        const off = offsets[dir] || offsets.bottom;
        const x = off.x * (1 - eased);
        const y = off.y * (1 - eased);
        const scale = off.scale ? off.scale + (1 - off.scale) * eased : 1;
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = Math.max(0, Math.min(1, eased)).toFixed(3);
      }

      if (progress >= 1) {
        item.settled = true;
        if (!wipe) {
          el.style.transform = "";
          el.style.opacity = "1";
        }
        el.dataset.settled = "1";
      }
    });
  };

  /* ---------- scene backgrounds: continuous colour interpolation ---------- */

  const scenes = Array.from(document.querySelectorAll(".scene"));
  const sceneColors = {
    intro: [7, 19, 9],
    about: [9, 24, 13],
    skills: [7, 17, 10],
    work: [11, 28, 16],
    contact: [7, 19, 9],
  };
  let sceneBounds = [];
  const measureScenes = () => {
    sceneBounds = scenes.map((s) => ({
      id: s.id,
      top: s.offsetTop,
      height: s.offsetHeight,
      color: sceneColors[s.id] || [7, 19, 9],
    }));
  };
  measureScenes();

  const updateBackground = (scrollY) => {
    if (!sceneBounds.length) return;
    let current = sceneBounds[0];
    let idx = 0;
    for (let i = 0; i < sceneBounds.length; i += 1) {
      if (scrollY >= sceneBounds[i].top) {
        current = sceneBounds[i];
        idx = i;
      }
    }
    const next = sceneBounds[Math.min(idx + 1, sceneBounds.length - 1)];
    const localT = current.height > 0 ? (scrollY - current.top) / current.height : 0;
    const t = clamp01((localT - 0.55) / 0.45);
    const r = Math.round(lerp(current.color[0], next.color[0], t));
    const g = Math.round(lerp(current.color[1], next.color[1], t));
    const b = Math.round(lerp(current.color[2], next.color[2], t));
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  };

  /* ---------- section index numerals: subtle parallax ---------- */

  const indexNumerals = Array.from(document.querySelectorAll(".scene__index"));

  const updateNumerals = () => {
    indexNumerals.forEach((el) => {
      const scene = el.closest(".scene");
      const top = scene.getBoundingClientRect().top;
      const shift = Math.max(-70, Math.min(70, top * -0.08));
      el.style.transform = `translateY(calc(-50% + ${shift.toFixed(1)}px))`;
    });
  };

  /* ---------- active scene tracking (nav + dots + scroll cue) ---------- */

  const navLinks = document.querySelectorAll("[data-nav]");
  const dots = document.querySelectorAll("[data-dot]");
  const scrollCue = document.getElementById("scrollCue");

  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
    dots.forEach((d) => d.classList.toggle("is-active", d.dataset.dot === id));
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

  /* ---------- unified scroll loop ---------- */

  const progressFill = document.getElementById("scrollProgressFill");
  const scrollLineFill = document.getElementById("scrollLineFill");

  const onScrollFrame = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const scrollY = doc.scrollTop;
    const scrollPct = max > 0 ? scrollY / max : 0;

    if (progressFill) progressFill.style.width = `${scrollPct * 100}%`;
    if (scrollLineFill) scrollLineFill.style.height = `${scrollPct * 100}%`;

    updateBackground(scrollY);
    if (!reduceMotion) {
      updateAssembly();
      updateNumerals();
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScrollFrame();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measureScenes();
    onScrollFrame();
  });
  onScrollFrame();

  /* ---------- custom cursor + ambient glow ---------- */

  if (!reduceMotion && canHover) {
    const cursor = document.querySelector(".cursor-dot");
    const glow = document.querySelector(".cursor-glow");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor) {
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
      }
      if (glow) glow.classList.add("is-active");
    });

    if (cursor) {
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
      });
    }

    if (glow) {
      const animateGlow = () => {
        glowX = lerp(glowX, mouseX, 0.08);
        glowY = lerp(glowY, mouseY, 0.08);
        glow.style.transform = `translate3d(${glowX.toFixed(1)}px, ${glowY.toFixed(1)}px, 0)`;
        requestAnimationFrame(animateGlow);
      };
      requestAnimationFrame(animateGlow);
    }
  }

  /* ---------- magnetic hover ---------- */

  if (!reduceMotion && canHover) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${(x * 0.3).toFixed(1)}px, ${(y * 0.3).toFixed(1)}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- card tilt (only once settled, to avoid fighting the assembly transform) ---------- */

  if (!reduceMotion && canHover) {
    document.querySelectorAll(".skill-card, .work-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (assembleItems.length && card.dataset.settled !== "1") return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
