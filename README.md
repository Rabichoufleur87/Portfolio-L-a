# Portfolio Léa Vergnenegre

Portfolio de projets universitaires et personnels. Site 100 % statique
(HTML / CSS / JS, rien à installer), prêt pour GitHub Pages.

## Structure

```
index.html                  page d'accueil : en-tête, accueil, à propos, réalisations, contact
projets/projet-exemple.html modèle de page projet (à dupliquer pour chaque projet)
assets/css/style.css        styles (couleurs et polices en variables en haut du fichier)
assets/js/main.js           menu mobile + filtres des réalisations
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

## À faire pour finaliser

1. **Textes** : remplacer tout ce qui est entre crochets `[...]` dans `index.html`.
2. **Contact** : adresse mail, liens réseaux, et déposer le CV en
   `assets/cv-lea-vergnenegre.pdf`.
3. **Projets** : voir ci-dessous.

## Ajouter un projet

1. Dupliquer `projets/projet-exemple.html` (ex. `projets/affiche-festival.html`)
   et remplir les textes et images.
2. Dans `index.html`, section « Mes réalisations », dupliquer un bloc
   `<article class="card">` et adapter :
   - `data-category="universitaire"` ou `data-category="personnel"` (pour les filtres)
   - le lien `href` vers la nouvelle page
   - l'image : remplacer `<span class="hand">visuel à venir</span>` par
     `<img src="assets/img/projets/mon-image.jpg" alt="Description" />`

## Aperçu local

Ouvrir `index.html` dans un navigateur, ou lancer `python3 -m http.server`.
