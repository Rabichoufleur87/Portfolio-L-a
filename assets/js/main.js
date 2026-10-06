(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasLibs = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const motion = hasLibs && !reduceMotion;

  clearTimeout(window.__loaderFailsafe);

  /* ---------- copier l'adresse e-mail (fonctionne dans tous les modes) ---------- */

  const copyBtn = document.getElementById("copyMail");
  const mailAddress = document.getElementById("mailAddress");
  if (copyBtn && mailAddress) {
    const selectAddress = () => {
      const range = document.createRange();
      range.selectNodeContents(mailAddress);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    copyBtn.addEventListener("click", () => {
      const label = copyBtn.textContent;
      const done = (text) => {
        copyBtn.textContent = text;
        setTimeout(() => (copyBtn.textContent = label), 2000);
      };
      const text = mailAddress.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => done("Adresse copiée"),
          () => {
            selectAddress();
            done("Adresse sélectionnée");
          }
        );
      } else {
        selectAddress();
        done("Adresse sélectionnée");
      }
    });
  }

  /* ---------- navigation active (tous modes) ---------- */

  const navLinks = document.querySelectorAll("[data-nav]");
  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
  };

  /* ==========================================================================
     MODE STATIQUE : pas de bibliothèque ou mouvement réduit
     ========================================================================== */

  if (!motion) {
    root.classList.add("is-static", "loader-done");
    const bar = document.getElementById("scrollProgress");
    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? root.scrollTop / max : 0})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { threshold: 0.4 }
    );
    document.querySelectorAll("[data-section]").forEach((s) => io.observe(s));
    return;
  }

  /* ==========================================================================
     MODE ANIMÉ
     ========================================================================== */

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("has-motion");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- défilement fluide (Lenis) ---------- */

  let lenis = null;
  let scrollVelocity = 0;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", (e) => {
      scrollVelocity = e.velocity || 0;
      ScrollTrigger.update();
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  } else {
    root.classList.add("is-static");
  }

  const scrollToTarget = (target) => {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  document.querySelectorAll("[data-scroll-to]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  /* ---------- découpage du texte en mots / lettres ---------- */

  const split = (el, mode) => {
    const pieces = [];
    if (mode === "chars") el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            const word = document.createElement("span");
            word.className = "split-word";
            if (mode === "chars") {
              word.setAttribute("aria-hidden", "true");
              Array.from(part).forEach((c) => {
                const ch = document.createElement("span");
                ch.className = "split-char";
                ch.textContent = c;
                word.appendChild(ch);
                pieces.push(ch);
              });
            } else {
              word.textContent = part;
              pieces.push(word);
            }
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(el);
    return pieces;
  };

  const splitMap = new Map();
  document.querySelectorAll("[data-split]").forEach((el) => {
    splitMap.set(el, split(el, el.dataset.split));
  });

  /* ---------- écran de chargement + entrée du hero ---------- */

  const heroChars = Array.from(document.querySelectorAll(".hero [data-split='chars']")).flatMap(
    (el) => splitMap.get(el) || []
  );
  const heroFades = document.querySelectorAll(".hero [data-hero-fade]");
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const loaderBar = document.getElementById("loaderBar");

  const intro = gsap.timeline({
    onComplete: () => {
      root.classList.add("loader-done");
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    },
  });

  gsap.set(heroChars, { yPercent: 118, rotate: 8 });
  gsap.set(heroFades, { y: 30, opacity: 0 });
  gsap.set(".hero__orb-wrap", { scale: 0.6, opacity: 0 });

  const counter = { v: 0 };
  intro
    .to(counter, {
      v: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (loaderCount) loaderCount.textContent = String(Math.round(counter.v)).padStart(3, "0");
      },
    })
    .to(loaderBar, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
    .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "+=0.1")
    .to(".hero__orb-wrap", { scale: 1, opacity: 1, duration: 2, ease: "expo.out" }, "-=0.6")
    .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.04, ease: "expo.out" }, "<0.1")
    .to(heroFades, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: "power3.out" }, "<0.35");

  /* ---------- hero : sortie au scroll ---------- */

  gsap
    .timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    })
    .to(".hero__line--1", { xPercent: -14, ease: "none" }, 0)
    .to(".hero__line--2", { xPercent: 9, ease: "none" }, 0)
    .to(".hero__title", { yPercent: 18, ease: "none" }, 0)
    .to(".hero__orb", { scale: 1.7, ease: "none" }, 0)
    .to(".hero__bottom, .hero__top", { y: -80, opacity: 0, ease: "none" }, 0);

  /* ---------- orbe qui suit la souris ---------- */

  if (finePointer) {
    const orbX = gsap.quickTo(".hero__orb-wrap", "x", { duration: 1.6, ease: "power3.out" });
    const orbY = gsap.quickTo(".hero__orb-wrap", "y", { duration: 1.6, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => {
      orbX((e.clientX / window.innerWidth - 0.5) * 120);
      orbY((e.clientY / window.innerHeight - 0.5) * 90);
    });
  }

  /* ---------- bandeau : vitesse et inclinaison liées au scroll ---------- */

  const marquee = document.querySelector(".marquee");
  const rows = Array.from(document.querySelectorAll(".marquee__inner")).map((inner, i) => ({
    inner,
    x: i % 2 ? -inner.scrollWidth / 2 : 0,
    dir: i % 2 ? 1 : -1,
  }));
  const skewTo = gsap.quickTo(".marquee__inner", "skewX", { duration: 0.6, ease: "power3.out" });
  let scrollDir = 1;

  gsap.ticker.add((time, deltaTime) => {
    const v = scrollVelocity;
    if (Math.abs(v) > 0.5) scrollDir = v > 0 ? 1 : -1;
    scrollVelocity *= 0.92;
    const frame = deltaTime / 16.67;
    rows.forEach((row) => {
      const half = row.inner.scrollWidth / 2;
      if (!half) return;
      const speed = (0.9 + Math.min(Math.abs(v), 60) * 0.35) * frame;
      row.x += row.dir * scrollDir * speed;
      if (row.x <= -half) row.x += half;
      if (row.x > 0) row.x -= half;
      gsap.set(row.inner, { x: row.x });
    });
    skewTo(gsap.utils.clamp(-10, 10, -v * 0.4));
  });

  if (marquee) {
    gsap.from(marquee, {
      scaleX: 0.92,
      opacity: 0.4,
      ease: "none",
      scrollTrigger: { trigger: marquee, start: "top bottom", end: "top 55%", scrub: true },
    });
  }

  /* ---------- titres : lettres qui montent ---------- */

  document.querySelectorAll("main section:not(.hero) [data-split='chars']").forEach((el) => {
    const chars = splitMap.get(el) || [];
    gsap.from(chars, {
      yPercent: 115,
      rotate: 6,
      duration: 1.1,
      stagger: 0.025,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---------- apparitions simples ---------- */

  gsap.set("[data-reveal]", { y: 36, opacity: 0 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: "power3.out" }),
  });

  /* ---------- à propos : portrait + manifeste mot à mot ---------- */

  gsap.fromTo(
    ".about__portrait-inner",
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.6,
      ease: "expo.inOut",
      scrollTrigger: { trigger: ".about__portrait", start: "top 80%" },
    }
  );
  gsap.fromTo(
    ".about__portrait-inner > *",
    { yPercent: -10 },
    {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: ".about__portrait", start: "top bottom", end: "bottom top", scrub: true },
    }
  );

  const manifesto = document.querySelector(".about__manifesto");
  if (manifesto) {
    gsap.fromTo(
      splitMap.get(manifesto) || [],
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: manifesto, start: "top 78%", end: "bottom 42%", scrub: true },
      }
    );
  }

  /* ---------- compétences : cartes empilées ---------- */

  const cards = gsap.utils.toArray(".stack-card");
  cards.forEach((card, i) => {
    const inner = card.querySelector(".stack-card__inner");
    gsap.from(inner, {
      y: 80,
      rotateX: -8,
      transformPerspective: 1200,
      ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "top 60%", scrub: true },
    });

    const next = cards[i + 1];
    if (!next) return;
    gsap
      .timeline({
        scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true },
      })
      .to(inner, { scale: 0.9, ease: "none" }, 0)
      .to(card.querySelector(".stack-card__shade"), { opacity: 0.55, ease: "none" }, 0);
  });

  /* ---------- méthode : ligne tracée au scroll ---------- */

  const steps = document.querySelector(".steps");
  if (steps) {
    gsap.to(".steps__fill", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: steps, start: "top 62%", end: "bottom 62%", scrub: true },
    });
    document.querySelectorAll(".step").forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 64%",
        onEnter: () => step.classList.add("is-active"),
        onLeaveBack: () => step.classList.remove("is-active"),
      });
      gsap.from(step.querySelector("h3"), {
        x: -40,
        ease: "none",
        scrollTrigger: { trigger: step, start: "top bottom", end: "top 55%", scrub: true },
      });
    });
  }

  /* ---------- créations : défilement horizontal sur grand écran ---------- */

  const workCurrent = document.getElementById("workCurrent");
  const workBar = document.getElementById("workBar");
  const workCards = gsap.utils.toArray(".work-card");
  const mm = gsap.matchMedia();

  mm.add("(min-width: 900px)", () => {
    root.classList.add("work-horizontal");
    const track = document.querySelector(".work__track");
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".work",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (workBar) gsap.set(workBar, { scaleX: self.progress });
          if (workCurrent) {
            const n = Math.min(workCards.length, Math.floor(self.progress * workCards.length) + 1);
            workCurrent.textContent = String(n).padStart(2, "0");
          }
        },
      },
    });

    workCards.forEach((card) => {
      const ghost = card.querySelector(".work-card__ghost");
      if (ghost) {
        gsap.fromTo(
          ghost,
          { xPercent: 22 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      }
      gsap.from(card, {
        rotate: 4,
        y: 60,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: "left 100%",
          end: "left 60%",
          scrub: true,
        },
      });
    });

    return () => root.classList.remove("work-horizontal");
  });

  mm.add("(max-width: 899px)", () => {
    workCards.forEach((card) => {
      gsap.from(card, {
        y: 70,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 90%" },
      });
    });
  });

  /* ---------- contact : rideau ivoire ---------- */

  gsap.fromTo(
    ".contact__panel",
    { clipPath: "inset(10% 5% 0% 5% round 48px 48px 0px 0px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 40px 40px 0px 0px)",
      ease: "none",
      scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 15%", scrub: true },
    }
  );
  gsap.from(".contact__btn", {
    scale: 0,
    rotate: -90,
    duration: 1.2,
    ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".contact__row", start: "top 85%" },
  });

  /* ---------- progression, ligne, menu actif, barre qui se cache ---------- */

  const progress = document.getElementById("scrollProgress");
  const line = document.getElementById("scrollLine");
  const topbar = document.querySelector(".topbar");
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      gsap.set(progress, { scaleX: self.progress });
      gsap.set(line, { scaleY: self.progress });
      if (topbar) {
        const hide = self.direction === 1 && self.scroll() > window.innerHeight * 0.6;
        topbar.classList.toggle("is-hidden", hide);
      }
    },
  });

  document.querySelectorAll("[data-section]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => self.isActive && setActive(section.id),
    });
  });

  /* ---------- curseur personnalisé ---------- */

  if (finePointer) {
    root.classList.add("has-cursor");
    const cursor = document.querySelector(".cursor");
    const label = cursor.querySelector(".cursor__label");
    const dotX = gsap.quickTo(".cursor__dot", "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(".cursor__dot", "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(".cursor__ring", "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(".cursor__ring", "y", { duration: 0.55, ease: "power3.out" });
    gsap.set(".cursor__dot, .cursor__ring", { x: -100, y: -100 });

    window.addEventListener("mousemove", (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    });

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (el.dataset.cursor) {
          label.textContent = el.dataset.cursor;
          cursor.classList.add("has-label");
        } else {
          cursor.classList.add("is-hover");
        }
      });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover", "has-label"));
    });

    document.addEventListener("mouseleave", () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
    document.addEventListener("mouseenter", () => gsap.to(cursor, { opacity: 1, duration: 0.3 }));

    /* éléments magnétiques */
    document.querySelectorAll(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const strength = el.classList.contains("contact__btn") ? 0.45 : 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });

    /* inclinaison 3D des cartes de projet */
    workCards.forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 1000 });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - 0.5) * -8);
        ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      });
      card.addEventListener("mouseleave", () => {
        rx(0);
        ry(0);
      });
    });
  }

  /* ---------- recalcul après chargement des polices ---------- */

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
