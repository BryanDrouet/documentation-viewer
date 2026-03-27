# Documentation Viewer

Documentation Viewer est une vitrine web pour consulter des fichiers Markdown, TXT et CSV dans une interface moderne, rapide et responsive.

- Site en ligne: https://documentation-viewer.bryan.ovh/
- Repository GitHub: https://github.com/BryanDrouet/documentation-viewer

## Apercu

Le projet propose:
- Navigation par arborescence (groupes par dossiers)
- Recherche globale (nom de fichier + contenu indexe)
- Rendu Markdown (avec sanitization)
- Rendu CSV en tableau
- Rendu TXT en preformatte
- Theme clair/sombre/systeme
- Boutons Copier/Telecharger sur les blocs de code
- Interface responsive (desktop + mobile)
- Fenetre legale et consentement local (RGPD)

## Stack technique

- HTML/CSS/JavaScript vanilla
- Marked (parsing Markdown)
- DOMPurify (sanitization HTML)
- Highlight.js (coloration syntaxique)
- Lucide Icons (icones)

## Structure du projet

- index.html: structure de l'application
- style.css: styles, responsive, overlays, theming
- script.js: logique applicative (scan fichiers, rendu, events, recherche)
- cours/: exemples de documents
- stage-Bryan/: documents de test et documents de travail

## Parametres principaux (script.js)

### Fichiers et scan

- SUPPORTED_EXTENSIONS: extensions autorisees (md, txt, csv)
- CANDIDATE_DIRS: dossiers de scan prioritaire (./, cours/, stage-Bryan/)
- FALLBACK_FILES: fichiers de secours testes si le listing serveur n'est pas disponible

### Preferences locales (localStorage)

- md_reader_consent_v1: consentement local
- md_reader_theme_v1: theme choisi
- md_reader_last_doc_v1: dernier document ouvert
- md_reader_sidebar_width_v1: largeur du menu lateral
- md_reader_sidebar_collapsed_v1: etat replie/deplie du menu lateral

## Regles d'ignore des documents

Le viewer peut ignorer certains documents selon des marqueurs en tete de fichier:

- Markdown (.md): marqueur d'ignore detecte en haut du fichier
- Texte (.txt): ignore si la premiere ligne non vide est egale a ||Fichier a ignorer||
- CSV (.csv): ignore si la premiere cellule de la premiere ligne non vide est egale a Fichier a ignorer

Important: ce README est un document de presentation et ne contient pas de marqueur d'ignore en tete. Il est donc visible et exploitable comme vitrine du projet.

## Lancer le projet en local

Option simple (comme dans votre environnement actuel):
1. Ouvrir le dossier dans VS Code
2. Lancer un serveur statique (ex: Five Server)
3. Ouvrir l'URL locale (ex: http://127.0.0.1:5500)

## Deploiement GitHub Pages

Le site est publie via GitHub Pages:
- URL publique: https://documentation-viewer.bryan.ovh/

Bonnes pratiques de publication:
- Verifier les chemins relatifs des assets
- Verifier les CDN (Marked, DOMPurify, Highlight.js, Lucide)
- Tester les overlays mobile, le menu burger, et la recherche apres publication

## Cas de test recommandes

- Ouvrir des fichiers md/txt/csv non vides
- Ouvrir des fichiers vides (message explicite attendu)
- Verifier l'ignore via marqueurs pour md/txt/csv
- Verifier la recherche plein texte
- Verifier le rendu sur mobile (burger + overlay + fermeture)

## Roadmap possible

- Manifeste docs.json pour un scan 100% deterministic
- Tri/filtre avance des documents
- Export PDF/HTML du document actif
- Historique de navigation et favoris

## Licence

A definir par le proprietaire du repository.
