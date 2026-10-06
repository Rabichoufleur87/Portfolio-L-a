# Portfolio Léa

Portfolio MMI en scroll storytelling, animé avec GSAP + ScrollTrigger et le
défilement fluide Lenis :

- écran de chargement (compteur 000 → 100) puis entrée lettre par lettre du nom ;
- hero qui se disloque au scroll, orbe lumineux qui suit la souris ;
- bandeau de compétences dont la vitesse et l'inclinaison suivent le scroll ;
- manifeste « À propos » qui s'allume mot à mot ;
- compétences en cartes empilées, chacune avec un visuel animé ;
- méthode avec une ligne qui se trace au scroll ;
- créations en défilement horizontal épinglé (grille verticale sur mobile) ;
- contact en rideau ivoire, boutons magnétiques, curseur personnalisé.

Le mouvement est désactivé si le visiteur a demandé « réduire les animations »,
et tout le contenu reste lisible si le JavaScript ne charge pas.

Site 100 % statique (HTML / CSS / JS, bibliothèques incluses dans
`assets/vendor/`, rien à installer), prêt pour GitHub Pages.

## Structure

```
index.html               page unique : intro, à propos, compétences, méthode, créations, contact
assets/css/style.css     styles, variables de couleur et de typo en haut du fichier
assets/js/main.js        animations au scroll (GSAP / ScrollTrigger / Lenis), curseur, navigation
assets/vendor/           gsap.min.js, ScrollTrigger.min.js (3.12.5), lenis.min.js (1.1.13)
assets/img/avatar/       photo/portrait de Léa
assets/img/projets/      visuels des créations
```

## Ajouter une création

Dans `index.html`, section `<!-- SCÈNE 4 — CRÉATIONS -->`, dupliquer un bloc
`.work-card` (avant le bloc `.work-end`) :

```html
<a href="lien-du-projet" class="work-card" data-cursor="Voir">
  <div class="work-card__thumb">
    <img src="assets/img/projets/nom-du-fichier.jpg" alt="Description du projet" />
  </div>
  <div class="work-card__body">
    <div>
      <span class="work-card__tag">Catégorie (ex: Identité visuelle)</span>
      <span class="work-card__title">Titre du projet</span>
    </div>
    <span class="work-card__arrow" aria-hidden="true">↗</span>
  </div>
</a>
```

Penser à mettre à jour le compteur « / 04 » dans `.work__counter`.

Déposer les images dans `assets/img/projets/`.

## Ajouter le portrait

Remplacer le contenu de `.about__portrait-inner` par :

```html
<img src="assets/img/avatar/lea.jpg" alt="Portrait de Léa" />
```

## Personnaliser les couleurs

Variables en haut de `assets/css/style.css` (`--ink`, `--ivory`, `--sage`,
`--emerald`…).

## Aperçu local

Ouvrir `index.html` dans un navigateur, ou servir le dossier avec :

```
python3 -m http.server
```

## Publier sur GitHub Pages

Réglages du repo → Pages → Source : branche `main`, dossier `/ (root)`.
