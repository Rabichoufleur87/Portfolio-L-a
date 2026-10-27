/* ==========================================================================
   Portfolio Léa Vergnenegre — interactions et animations
   ========================================================================== */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Menu burger (mobile)
const burger = document.querySelector(".header__burger");
const menu = document.getElementById("menu");

if (burger && menu) {
  const setOpen = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    menu.classList.toggle("is-open", open);
  };

  burger.addEventListener("click", () => {
    setOpen(burger.getAttribute("aria-expanded") !== "true");
  });

  // referme le menu après un clic sur un lien
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
}

// Filtres des réalisations : tous / universitaire / personnel
const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".card");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.filter;
    const shown = [];

    filters.forEach((b) => {
      const active = b === button;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    cards.forEach((card) => {
      card.hidden = value !== "tous" && card.dataset.category !== value;
      if (!card.hidden) shown.push(card);
    });

    // les cartes restantes réapparaissent en cascade
    if (!reduceMotion) {
      shown.forEach((card, i) => {
        card.animate(
          [
            { opacity: 0, transform: "translateY(18px) scale(0.97)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 500, delay: i * 60, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }
        );
      });
    }
  });
});

// Accueil : « Portfolio » découpé en lettres, animé une fois la police chargée
const hero = document.querySelector(".hero");
const heroTitle = document.querySelector(".hero__title");

if (heroTitle) {
  const text = heroTitle.textContent.trim();
  heroTitle.setAttribute("aria-label", text);
  heroTitle.textContent = "";

  [...text].forEach((char, i) => {
    const letter = document.createElement("span");
    letter.className = "letter";
    letter.textContent = char;
    letter.setAttribute("aria-hidden", "true");
    letter.style.setProperty("--i", i);
    heroTitle.append(letter);
  });
}

if (hero) {
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : 1200));
  Promise.race([fontsReady, timeout]).then(() => hero.classList.add("is-ready"));
}

// Index des outils pour les faire apparaître un par un
document.querySelectorAll(".tags li").forEach((li, i) => li.style.setProperty("--i", i));

// Apparitions au scroll : les éléments qui entrent ensemble arrivent en cascade
const revealEls = document.querySelectorAll("[data-reveal], .squiggle");

const finishReveal = (el) => {
  el.classList.add("is-visible");
  // une fois arrivé, on rend la main aux transitions normales (survols…)
  if (el.hasAttribute("data-reveal")) {
    const delay = parseFloat(el.style.getPropertyValue("--delay")) || 0;
    setTimeout(() => el.removeAttribute("data-reveal"), delay * 1000 + 1200);
  }
};

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) =>
          a.boundingClientRect.top - b.boundingClientRect.top ||
          a.boundingClientRect.left - b.boundingClientRect.left
        )
        .forEach((entry, i) => {
          entry.target.style.setProperty("--delay", `${Math.min(i, 6) * 0.09}s`);
          finishReveal(entry.target);
          observer.unobserve(entry.target);
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// En-tête : ombre dès qu'on a quitté le haut de page
const header = document.querySelector(".header");

// Parallaxe de l'accueil + buste qui se penche vers la souris
const heroAvatar = document.querySelector(".hero__avatar");
const heroTitleWrap = document.querySelector(".hero__title-wrap");
const about = document.querySelector(".about");
const bust = document.querySelector(".about__avatar");

let mouseX = 0;
let leanX = 0;

if (finePointer) {
  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1; // de -1 (gauche) à 1 (droite)
    },
    { passive: true }
  );
}

const tick = () => {
  const y = window.scrollY;
  const vh = window.innerHeight;

  if (header) header.classList.toggle("is-scrolled", y > 10);

  if (!reduceMotion) {
    if (heroAvatar && heroTitleWrap && y < vh * 1.2) {
      heroAvatar.style.translate = `0 ${y * 0.18}px`;
      heroTitleWrap.style.translate = `0 ${y * -0.06}px`;
    }

    if (about && bust) {
      const rect = about.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < vh) {
        // le buste remonte à mesure que la section arrive au centre de l'écran
        const progress = Math.max(0, (rect.top + rect.height / 2 - vh / 2) / vh);
        leanX += (mouseX - leanX) * 0.07;
        bust.style.translate = `${leanX * 14}px ${progress * 70}px`;
        bust.style.rotate = `${leanX * 2.5}deg`;
      }
    }
  }

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);

// Animations de la galerie : pas de lecture automatique si l'utilisateur
// a demandé de réduire les mouvements
if (reduceMotion) {
  document.querySelectorAll(".gallery video").forEach((v) => {
    v.removeAttribute("autoplay");
    v.pause();
  });
}

// Galerie : visionneuse plein écran, avec flèches du clavier
const lightbox = document.querySelector(".lightbox");
const galleryItems = [...document.querySelectorAll("[data-lightbox]")];

if (lightbox && galleryItems.length) {
  const lbImg = lightbox.querySelector("img");
  const lbCaption = lightbox.querySelector("figcaption");
  const navButtons = lightbox.querySelectorAll(".lightbox__nav");
  let current = 0;

  const lbVideo = lightbox.querySelector("video");

  const show = (index) => {
    current = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[current];
    const video = item.querySelector("video");

    // une animation s'affiche en vidéo, un dessin en image
    lbVideo.hidden = !video;
    lbImg.hidden = Boolean(video);
    lbVideo.pause();

    if (video) {
      lbVideo.src = video.currentSrc || video.src;
      lbVideo.poster = video.poster;
      lbVideo.setAttribute("aria-label", video.getAttribute("aria-label"));
      lbVideo.controls = reduceMotion;
      if (!reduceMotion) lbVideo.play().catch(() => {});
    } else {
      const source = item.querySelector("img");
      lbImg.src = source.currentSrc || source.src;
      lbImg.alt = source.alt;
    }

    lbCaption.textContent = item.dataset.caption || "";
  };

  lightbox.addEventListener("close", () => lbVideo.pause());

  navButtons.forEach((b) => (b.hidden = galleryItems.length < 2));

  galleryItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      show(i);
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));

  // un clic à côté du dessin referme la visionneuse
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (e) => {
    if (galleryItems.length < 2) return;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}
