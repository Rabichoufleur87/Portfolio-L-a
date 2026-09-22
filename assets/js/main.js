(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ---------- */

  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- active scene tracking (nav + dots + bg color) ---------- */

  const scenes = Array.from(document.querySelectorAll(".scene"));
  const navLinks = document.querySelectorAll("[data-nav]");
  const dots = document.querySelectorAll("[data-dot]");
  const scrollCue = document.getElementById("scrollCue");

  const sceneColors = {
    intro: [10, 10, 13],
    about: [18, 15, 26],
    skills: [12, 17, 22],
    work: [22, 14, 20],
    contact: [10, 10, 13],
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
