/* ==========================================================================
   Portfolio Léa Vergnenegre — interactions de base
   (les animations viendront dans une seconde étape)
   ========================================================================== */

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

    filters.forEach((b) => {
      const active = b === button;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    cards.forEach((card) => {
      card.hidden = value !== "tous" && card.dataset.category !== value;
    });
  });
});
