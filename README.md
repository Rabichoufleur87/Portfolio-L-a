# Portfolio Léa

Portfolio MMI en scroll storytelling : chaque section (« scène ») occupe l'écran
et se révèle progressivement au scroll, inspiré des sites façon
[terminal-industries.com](https://terminal-industries.com/).

Site 100% statique (HTML / CSS / JS, aucune dépendance à installer), prêt pour
GitHub Pages.

## Structure

```
index.html               page unique, 5 scènes : intro, à propos, compétences, créations, contact
assets/css/style.css     styles, thème sombre, variables de couleur en haut du fichier
assets/js/main.js        animations au scroll (IntersectionObserver), curseur, navigation
assets/img/avatar/       photo/portrait de Léa
assets/img/projets/      visuels des créations
```

## Ajouter une création

Dans `index.html`, section `<!-- SCÈNE 4 — CRÉATIONS -->`, dupliquer un bloc
`.work-card` :

```html
<a href="#" class="work-card" data-reveal="scale">
  <div class="work-card__thumb">
    <img src="assets/img/projets/nom-du-fichier.jpg" alt="Description du projet" />
  </div>
  <div class="work-card__body">
    <div>
      <span class="work-card__tag">Catégorie (ex: Identité visuelle)</span>
      <span class="work-card__title">Titre du projet</span>
    </div>
    <span class="work-card__arrow">↗</span>
  </div>
</a>
```

Retirer la classe `work-card--soon` une fois le visuel ajouté. Déposer les
images dans `assets/img/projets/`.

## Ajouter le portrait

Remplacer le contenu de `.about__portrait` par :

```html
<img src="assets/img/avatar/lea.jpg" alt="Portrait de Léa" />
```

## Personnaliser les couleurs

Variables en haut de `assets/css/style.css` (`--accent`, `--accent-2`, et les
`--scene-*` utilisées pour la transition de fond entre les sections).

## Aperçu local

Ouvrir `index.html` dans un navigateur, ou servir le dossier avec :

```
python3 -m http.server
```

## Publier sur GitHub Pages

Réglages du repo → Pages → Source : branche `main`, dossier `/ (root)`.
