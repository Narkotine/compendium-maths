# Compendium de maths — collège (unifié par sujet)

Cours structurés sans découpage 6e / 5e / 4e / 3e : chaque chapitre va du socle jusqu’à la fin du collège.
Chaque dossier contient en général :

- `cours-et-exercices.md` — cours, exercices types, atypiques, corrigés
- `figures/` — SVG (surtout géométrie)

## Chapitres

| Dossier | Sujet |
|---------|--------|
| `01-fractions-rationnels/` | Fractions et nombres rationnels |
| `02-entiers-et-decimaux/` | Entiers et décimaux |
| `03-nombres-relatifs/` | Nombres relatifs |
| `04-puissances-notation-scientifique/` | Puissances, notation scientifique et racine carrée |
| `05-proportionalite-pourcentages/` | Proportionnalité, pourcentages, échelles |
| `06-calcul-litteral/` | Calcul littéral |
| `07-equations-inequations/` | Équations et inéquations |
| `08-fonctions/` | Fonctions |
| `09-geometrie-plane-figures/` | Géométrie plane — figures usuelles |
| `10-transformations-plan/` | Transformations du plan |
| `11-pythagore/` | Théorème de Pythagore |
| `12-thales/` | Théorème de Thalès |
| `13-trigonometrie/` | Trigonométrie (triangle rectangle) |
| `14-aires-volumes-grandeurs/` | Aires, volumes, grandeurs et mesures |
| `15-geometrie-espace/` | Géométrie dans l’espace |
| `16-statistiques/` | Statistiques |
| `17-probabilites/` | Probabilités |

Convention maths : $a,b$ entiers pour les fractions / rationnels ; KaTeX dans les `.md`.

## Révision en cours

Le plan de révision (audit des 17 chapitres, standard éditorial, priorités, conventions, checklist des figures) est dans [`PLAN-REVISION.md`](PLAN-REVISION.md).

- Chapitres révisés (v0.2) : `11-pythagore/` (pilote), `12-thales/`, `13-trigonometrie/`, `14-aires-volumes-grandeurs/`, `15-geometrie-espace/` (vague 1) ; `08-fonctions/`, `09-geometrie-plane-figures/`, `10-transformations-plan/`, `17-probabilites/`, `16-statistiques/` (vague 2) ; `05-proportionalite-pourcentages/`, `06-calcul-litteral/`, `07-equations-inequations/` (vague 3) ; `03-nombres-relatifs/`, `01-fractions-rationnels/`, `02-entiers-et-decimaux/`, `04-puissances-notation-scientifique/` (vague 4) : les 17 chapitres sont en v0.2, puis passés en **v0.3** par une relecture complète. Celle-ci a revérifié les calculs par script (`outils/relecture/`), corrigé les renvois, et ajouté à chaque chapitre un encadré « Prérequis » et une fiche-synthèse ; voir `PLAN-REVISION.md`, § 10. Suivi par chapitre : `PLAN-REVISION.md`, § 4.4.
- Figures : générateurs dans `outils/figures/` (`svgkit.py`, `graphkit.py`, `espace.py`) ; captures de contrôle dans `outils/captures/` (page complète `NN-slug.png` via `outils/capture-page.sh NN-slug sortie.png`, et figure représentative `NN-figure.png` via `outils/svg2png.sh`). Build et vérificateur : `NODE_PATH=/home/box/.local/lib/node_modules` (modules `katex` et `marked`).
- Contrôles automatiques : `node outils/verifier-chapitre.js [dossier]` (depuis `compendium-maths/`).
- Sauvegardes avant révision : `cours-et-exercices.md.bak` et `figures-v01.bak/` dans chaque dossier concerné (les sauvegardes restent à côté de `figures/`, jamais dedans ; le build ignore désormais les sous-dossiers de `figures/`).
