# Portfolio Léa Vergnenegre

Portfolio de projets universitaires et personnels. Site 100 % statique
(HTML / CSS / JS, rien à installer), prêt pour GitHub Pages.

## Structure

```
index.html                  page d'accueil : en-tête, accueil, à propos, réalisations, contact
projets/                    une page par projet (rock-en-seine, cantine-suzette, lido,
                            illustrations) + projet-exemple.html, modèle à dupliquer
assets/css/style.css        styles (couleurs et polices en variables en haut du fichier)
assets/js/main.js           menu mobile, filtres, animations (intro, scroll, parallaxe)
assets/fonts/               police Internet Friends
assets/img/avatar/          illustrations de l'avatar
assets/img/projets/         visuels des projets
```

## Charte

| Rôle      | Valeur                                  |
|-----------|-----------------------------------------|
| Lilas     | `#C598BC`                               |
| Ivoire    | `#FFFDF5`                               |
| Olive     | `#58623D`                               |
| Titres    | Internet Friends                        |
| Manuscrit | Nanum Pen Script (Google Fonts)         |
| Texte     | Archivo Narrow (Google Fonts)           |

## Police et avatar

- **Internet Friends** est dans `assets/fonts/` (`.woff2` + `.ttf`). Elle n'a
  pas de lettres accentuées : les titres s'écrivent sans accents
  (« mes realisations »), comme sur la maquette.
- **Avatar** détouré en WebP transparent dans `assets/img/avatar/`
  (`avatar-tete.webp`, `avatar-buste.webp`, `favicon.png`).

## Contenu

- Présentation, outils, e-mail, LinkedIn et Instagram sont renseignés dans
  `index.html`.
- Pour proposer un CV à télécharger : déposer le PDF dans `assets/` et ajouter
  un lien dans la liste `.contact__links`.

## Ajouter un projet

1. Dupliquer `projets/projet-exemple.html` (ex. `projets/affiche-festival.html`)
   et remplir les textes et images.
2. Dans `index.html`, section « Mes réalisations », dupliquer un bloc
   `<article class="card">` et adapter :
   - `data-category="universitaire"` ou `data-category="personnel"` (pour les filtres)
   - le lien `href` vers la nouvelle page
   - l'image : remplacer `<span class="hand">visuel à venir</span>` par
     `<img src="assets/img/projets/mon-image.jpg" alt="Description" />`

## Animations

- **Accueil** : l'avatar arrive puis se balance, « Portfolio » s'écrit lettre
  par lettre (et les lettres sautent au survol), la signature se trace.
- **Au scroll** : ajouter `data-reveal="up"` (ou `left`, `right`, `scale`,
  `rise`) sur n'importe quel élément pour le faire apparaître. Les éléments qui
  entrent en même temps arrivent en cascade.
- **Gribouillis sous les titres** : copier le `<svg class="squiggle">` sous un titre.
- **Avatar « à propos »** : remonte au scroll et se penche vers la souris.
- Si le visiteur a activé « réduire les animations » dans son système, tout
  s'affiche directement, sans mouvement.

## Aperçu local

Ouvrir `index.html` dans un navigateur, ou lancer `python3 -m http.server`.
