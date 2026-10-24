# Maths Collège — application (PWA) v0.11

Application web installable et **entièrement hors ligne** (Android, iPhone, ordinateur) qui affiche les
17 chapitres du compendium de mathématiques collège (`../compendium-maths`, contenu v0.3.1).

- Accueil par thèmes, carte « Reprendre la lecture », progression de lecture par chapitre.
- Recherche plein texte hors ligne (sans accents ni majuscules), extraits surlignés.
- Page chapitre : barre compacte, sommaire en feuille (mobile) ou colonne (≥ 1080 px) avec la section
  courante surlignée, barre de progression, accès direct Cours / Exercices / Corrigés / Fiche,
  chapitre précédent / suivant, retour en haut, prérequis cliquables, renvois « chapitre N, § X » cliquables.
- Corrigés repliés (bouton « Voir le corrigé » sous chaque exercice + partie Corrigés), réglage « tout déplier ».
- Figures : responsive, plein écran au toucher avec zoom (pincer, double-toucher, molette, + / −) et déplacement.
- Thème Auto / Clair / Sombre (les figures restent sur fond clair), 4 tailles de texte, réglages mémorisés.
- Le bouton « Retour » (Android, navigateur, geste iOS) fonctionne partout : il ferme d'abord la feuille
  ou la figure ouverte, puis revient à la page précédente **à la même position de lecture**.
- **S'entraîner** (v0.3 : chapitre 07 en pilote ; v0.4 : chapitres 03, 06 et 11 en plus ; v0.5 : chapitres 01, 02, 04 et 05 ; v0.6 : chapitres 08, 12, 13, 14, 16 et 17 ; v0.7 : chapitres 09, 10 et 15 — les 17 chapitres) : exercices générés à volonté, 12 types, 3 niveaux, réponse vérifiée,
  indice ciblé puis corrigé rédigé comme dans le cours, séries de 5 à 10 avec bilan, clavier mathématique à l'écran,
  droite graduée au doigt, suivi local des réussites. Voir « Exercices générés » ci-dessous.

## Démarrer

```bash
npm install
npm run dev        # serveur de développement (http://localhost:5173) — génère d'abord le contenu
npm run build      # contenu + vérification TypeScript + build Vite + contrôles (dist/)
npm run preview    # sert dist/ sur http://localhost:4173 (service worker actif)
```

Node ≥ 20. Le compendium source est lu dans `../compendium-maths` (modifiable avec
`COMPENDIUM_SRC=/chemin npm run content`). Les `.md` ne sont jamais modifiés.

### Scripts

| Script | Rôle |
| --- | --- |
| `npm run content` | `scripts/build-content.mjs` : Markdown → HTML pré-rendu dans `public/content/` |
| `npm run icons` | `scripts/make-icons.mjs` : génère les icônes (PNG 192/512, maskable, apple-touch, favicon) |
| `npm run check` | `scripts/check-dist.mjs` : 36 contrôles sur `dist/` (voir ci-dessous) |
| `npm test` | tests unitaires des validateurs + tests de propriétés des générateurs (2000 graines par niveau) |
| `npm run test:answers` | `tests/answers.test.ts` : 99 tests des validateurs de réponses |
| `npm run test:gen` | `tests/generators.test.ts [N]` : chaque générateur × niveau sur N graines (défaut du script : 2000) |
| `npm run sample` | `scripts/sample-exercises.mts` : échantillon relu de 20 exercices → `captures/exos-07-echantillon.md` |
| `npm run test:practice` | `scripts/test-practice.mts` : 63 tests de bout en bout de « S'entraîner » |
| `npx tsx scripts/captures-practice.mts` | captures « S'entraîner » (mobile clair/sombre) → `captures/mobile-*-entrainement-*.png` |
| `npm run captures` | `scripts/captures.mjs` : captures Chrome headless (mobile clair/sombre, ordinateur) → `captures/` |
| `node scripts/test-nav.mjs` | 36 tests de navigation de bout en bout (Retour, positions, sommaire, figures, réglages, hors ligne) |
| `node scripts/audit-layout.mjs` | débordements horizontaux à 390 px et 320 px, pour chaque chapitre |

Les tests de bout en bout et les captures nécessitent `npm run preview` lancé et Chrome (`/usr/bin/google-chrome`, ou `CHROME=...`).

### Contrôles automatiques (`npm run check`)
17 chapitres, nombre d'exercices, aucun `$` brut, aucune erreur KaTeX, toutes les figures présentes,
tous les liens internes résolus (texte, sommaire, prérequis, recherche), métadonnées iOS/Android,
manifest et icônes, service worker, pré-cache contenant les 17 chapitres + l'index de recherche + les 147 figures + les polices ;
v0.3 : modules d'entraînement séparés (vue, générateurs, KaTeX), bundle principal sans KaTeX ni générateurs,
modules d'entraînement pré-cachés, « S'entraîner » activé pour le chapitre 07 seulement.

## Architecture

```
content-meta.json        thèmes (groupes), titres courts, descriptions, corrections de renvois
scripts/build-content.mjs pipeline de contenu (exécuté au build, pas sur le téléphone)
public/content/          (généré) index.json, search.json, chapters/<slug>.html, figures/<slug>/*.svg
public/icons/            icônes de l'application
src/main.ts              démarrage, routeur, PWA
src/nav.ts               routes par hash, historique (feuilles = entrée d'historique), positions de lecture
src/views/               home, search, chapter, notfound, practice (chargée à la demande)
src/ui/                  sheet (feuille / dialogue), toc, settings, viewer (figure plein écran)
src/practice/engine/     moteur : rationnels (q), graine (rng), expressions (expr), validateurs (answers, check),
                         séries (series), suivi (stats), rendu KaTeX (render)
src/practice/ui/         exercice interactif, clavier à l'écran, droite graduée
src/practice/ch07/       les 12 générateurs du chapitre 07 (+ index.ts) ; registry.ts : chapitres équipés
tests/                   validateurs (answers.test.ts), propriétés des générateurs (generators.test.ts)
src/styles/              base (thèmes, tailles), app (interface), prose (contenu du cours)
vite.config.ts           Vite + vite-plugin-pwa (Workbox : tout est pré-caché)
```

**Pré-rendu au build.** `marked` convertit le Markdown, KaTeX rend toutes les formules (≈ 10 800) en HTML,
puis un passage DOM (`linkedom`) : ids stables des titres (`s3`, `s3-7`, `serie-B`, `ex-B1`, `cor-B1`),
sommaire, encadrés typés (définition, propriété, méthode, piège, à retenir…), exercices et corrigés
(`<details>`), tableaux défilants (la fiche-synthèse devient des cartes sur mobile), figures SVG
(copiées et minifiées) et renvois croisés transformés en liens. Le téléphone n'exécute ni Markdown ni KaTeX :
il affiche du HTML prêt (≈ 40 Ko gzip par chapitre).

**Routes (hash, compatibles avec n'importe quel hébergement statique et Capacitor).**
`#/` accueil · `#/recherche?q=…` · `#/ch/<slug>` · `#/ch/<slug>/<id-de-section>` · `#/entrainement/<slug>` (choix) ·
`#/entrainement/<slug>/serie?t=<types|mix>&niv=<1-3>&n=<nb>&g=<graine>` · `#/entrainement/<slug>/exo?t=<type>&niv=<1-3>&g=<graine>`.
On n'utilise pas un second `#` pour la section (`#/ch/x#s3`) : ce n'est pas une URL valide (un seul fragment),
et le navigateur ferait son propre défilement. Le défilement est géré par l'application (hauteur de la barre,
dépliage des corrigés, restauration de la position au Retour).

**Données locales** (`localStorage`) : `mc.settings` (thème, taille, corrigés), `mc.last` (reprendre la lecture),
`mc.progress` (avancement par chapitre), `mc.practice` (réussites par type, 30 dernières séries, préférences
clavier / niveau / longueur de série). Séries en cours : `sessionStorage` (`mc.serie:<adresse>`), pour reprendre après un Retour. Positions de lecture par entrée d'historique dans `sessionStorage`
(`mc.scroll`), stockées comme « ancre + décalage » pour rester justes si la taille du texte change.

**Hors ligne.** Workbox pré-cache tout (≈ 215 fichiers, ≈ 13,7 Mo non compressés) à la première visite.
Une nouvelle version publiée déclenche un message « Mise à jour disponible » (pas de rechargement forcé en pleine lecture).

## Exercices générés (« S'entraîner »)

### Ce que voit l'élève
Chapitre 07 : carte « S'entraîner » sous l'en-tête (téléphone), bouton dans l'accès rapide (ordinateur) et encart au
début des exercices. Page de choix : niveau ★ Bases / ★★ Standard / ★★★ Approfondi, 5 / 8 / 10 exercices, « Série
mixte » ou un type (exemple, méthode, étoiles du cours, réussite, lien vers le cours, « Un seul exercice »), bloc
« À retravailler » d'après les derniers essais. Pendant une série : progression « 3 / 8 », 1 ou plusieurs étapes par
exercice ; juste → suivant ; faux → message ciblé si l'erreur est reconnue + indice, 2ᵉ essai ; encore faux → bonne
réponse + corrigé rédigé ; « Un autre du même type » ; Retour Android → confirmation (« Continuer la série » / « Quitter ») ;
bilan (du premier coup / avec indice / à revoir, « Refaire » par exercice, « Retravailler les types ratés »).

### Comment c'est construit
- **Chargement à la demande** : `src/views/practice.ts` (+ `practice.css`), `src/practice/ch07/index.ts` et KaTeX
  (`loadKatex()`) sont des morceaux séparés, téléchargés seulement en ouvrant « S'entraîner », mais **pré-cachés**
  par le service worker (hors ligne dès la première visite). La lecture des cours reste sans KaTeX JS.
- **Graine** : `mulberry32` ; une graine en base 36 dans l'adresse rejoue exactement la série ou l'exercice (partage).
  Série : types mélangés par cycles, jamais deux fois le même type de suite, pas deux énoncés identiques.
- **Nombres exacts** : rationnels (`engine/q.ts`) partout ; jamais de flottant dans une solution.
- **Expressions** (`engine/expr.ts`) : AST minimal (somme, produit, puissance, fraction, valeur substituée) →
  TeX propre (pas de « + − », pas de « 1x », parenthèses autour des négatifs substitués, « × » entre facteurs numériques).
- **Validateurs** (`engine/answers.ts`, `check.ts`) : virgule ou point, tous les signes moins (−, –, —), espaces de milliers,
  « x = » toléré, fractions équivalentes (irréductible exigée seulement si l'énoncé l'annonce : 14/6 → « simplifie »,
  sans pénalité), valeur approchée d'une fraction → « donne la valeur exacte », ensembles dans n'importe quel ordre
  (« ; », « et »), « Aucune solution », √ au clavier, arrondis avec tolérance (2,64 au lieu de 2,65 → « attention à l'arrondi »),
  symbole + borne d'inéquation, côté + crochet sur la droite graduée, deux valeurs inversées, case vide.
  Une saisie illisible ne compte pas comme un essai.
- **Résultat d'un exercice** : `ok` (tout juste du premier coup), `hint` (juste après une erreur), `fail` (bonne réponse
  révélée ou corrigé ouvert avant la fin). Suivi : `engine/stats.ts` (« À retravailler » : sur les 6 derniers essais d'un type,
  au moins 40 % d'échecs, un indice comptant pour ½). Effacement : Réglages › Entraînement.

### Écrire un générateur
Un fichier par famille dans `src/practice/<chapitre>/`, un objet `Generator` par type :

```ts
export const monType: Generator = {
  id: 'mon-type',                          // stable : adresses et statistiques en dépendent
  title: 'Équations ax + b = c', desc: 'Soustraire b, puis diviser par a.',
  stars: 1, levels: [1, 2],                // étoiles du cours ; niveaux proposés
  example: '3x + 2 = 11',
  course: LINKS.s21, links: [/* autres sections */],
  generate(rng, level) {
    // 1. la SOLUTION d'abord (forme annoncée : entier, fraction irréductible…)
    const x = level === 1 ? q(rng.signed(1, 12)) : pickX(rng, …);
    // 2. puis l'énoncé, construit à partir d'elle (coefficients non nuls, ≠ ±1 quand c'est trivial…)
    const a = rng.pick([2, 3, 4, 5, -2, -3]), b = rng.signed(2, 20);
    const E = eqn(sumE(term(a), N(b)), N(a * x.n / x.d + b));   // a x + b = c
    // 3. étapes, erreurs typiques (valeur produite par l'erreur → message), corrigé ligne à ligne (méthode du cours)
    return { title: 'Résoudre l’équation.', display: texEq(E), form: formOf(x), steps: [solveStep(x, hint, mistakes)],
             solution: [...], answer: `$x = ${nat(x)}$`, key: texEq(E), data: { kind: 'equation', eq: E, solutions: [x] } };
  },
};
```
Puis : l'ajouter dans `src/practice/<chapitre>/index.ts` (ordre du cours), déclarer le chapitre dans
`src/practice/registry.ts` (`import()` dynamique) et dans `content-meta.json` (`"practice": { "enabled": true, "generators": [...] }`).

**Liste de contrôle avant d'ajouter un type**
1. Solution tirée d'abord ; plages par niveau écrites en tête du générateur ; forme de la solution annoncée (`form`).
2. Aucun coefficient nul ou trivial (0x, 1x, + 0, × 1), aucun cas dégénéré (équation sans x, identique des deux côtés,
   dénominateur nul), contextes plausibles (âges, prix ronds au centime, quantités entières).
3. Vocabulaire et méthode du cours (« on soustrait … aux deux membres », « on change le sens »), lien vers la section.
4. Erreurs typiques : seulement si la valeur produite est **certaine** et différente de la bonne réponse.
5. `data` renseigné : les tests revérifient tout indépendamment (substitution, unicité, sens de l'inéquation…).
6. `npm run test:gen` (≥ 2000 graines par niveau, 0 échec ; un énoncé ≤ 2,5 % des tirages, P(doublon) ≤ 1 %),
   puis `npm run sample` et **relire** l'échantillon, puis `npm run test:practice`.

### Tests
- `tests/generators.test.ts` : pour chaque générateur × niveau × graine : rendu KaTeX de chaque formule (énoncé, étapes,
  indices, messages, corrigé), écritures maladroites (« + − », « 1x », « 0y », « (( », « x3x »), vérification mathématique
  indépendante (polynôme interpolé, solution unique, points test d'inéquation, déterminant du système, verdict du test,
  faits du problème), erreurs typiques ≠ bonne réponse, options de QCM distinctes, déterminisme, fréquence des doublons.
- `tests/answers.test.ts` : lecture des nombres et validateurs (99 cas).
- `scripts/test-practice.mts` : parcours réel dans Chrome (série complète juste / indice / faux, corrigé, Retour Android,
  reprise, bilan, exercice seul, clavier à l'écran, droite graduée au toucher, réglages, hors ligne).

## Vers des applications Android / iOS natives (Capacitor)

Le build est déjà compatible (chemins relatifs `base: './'`, routage par hash, aucun serveur nécessaire) :

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "Maths Collège" fr.exemple.mathscollege --web-dir dist
npm run build && npx cap add android && npx cap add ios
npx cap sync && npx cap open android   # Android Studio
npx cap open ios                       # Xcode (Mac obligatoire, ou service de build cloud)
```

Dans l'app native, le service worker est inutile (les fichiers sont embarqués) : il peut rester, il ne gêne pas.
Publication : Google Play (25 $ une fois), App Store (99 $/an, compte Apple Developer).

## Essayer sur téléphone

Le service worker exige **HTTPS** (sauf `localhost`). Héberger le contenu de `dist/` sur un hébergement statique :
Netlify Drop (glisser-déposer du dossier), GitHub Pages, Cloudflare Pages, Vercel… Un sous-dossier fonctionne.
- Android (Chrome) : menu ⋮ → « Installer l'application ».
- iPhone (Safari) : Partager → « Sur l'écran d'accueil ».
Ouvrir l'app une fois en ligne (≈ 13,5 Mo téléchargés) ; ensuite tout fonctionne en mode avion.

## Nouveautés v0.2 (finitions)

- Corrigés dépliés : plus de double bordure (la marge rose de la rédaction est supprimée dans la carte verte), clair et sombre.
- Formules en ligne : coupure seulement après =, <, ≤… (sommes regroupées à la compilation, `groupForBreaks` dans
  `scripts/build-content.mjs`) ; un morceau encore trop large devient un bloc défilant (`fitMath`, mesuré aussi à
  l'ouverture d'un corrigé).
- Figures : texte agrandi pour le téléphone (`../compendium-maths/outils/figures/echelle-texte.json`, réglé par
  `ajuster-texte.mjs`) ; contrôle : `python3 scripts/audit-figures-text.py` (`FIG_DIR=figures.pre-app.bak` pour l'état d'origine).

## Nouveautés v0.3 (exercices générés, chapitre 07)

- « S'entraîner » : 12 types (tester une valeur, x + a = b, ax = b, ax + b = c, inconnue des deux côtés, parenthèses,
  fractions et décimaux, mise en équation, produit nul, x² = a, inéquations + droite graduée, systèmes), 3 niveaux.
- Séries, exercice seul, adresses rejouables, bilan, suivi local, réglages du clavier, effacement des résultats.
- Tests : 99 tests de validateurs, propriétés sur 2000 graines par niveau (10 000 vérifiées), 63 tests de bout en bout ;
  contrôles du build : 36 (4 nouveaux).


## Nouveautés v0.4 (vague A : chapitres 03, 06, 11)

- **03 Nombres relatifs** (10 types) : lire une abscisse (droite graduée SVG), comparer, ranger, additionner, soustraire,
  distance et milieu, multiplier/diviser, signe d’un produit, priorités, problèmes (températures, sous-marin, compte,
  années av. J.-C., ascenseur, quiz, moyenne).
- **06 Calcul littéral** (11 types) : calculer une expression, traduire une phrase, somme ou produit, réduire, développer
  (simple, double), factoriser (facteur commun, identités), identités remarquables, programme de calcul, vrai/faux
  (contre-exemple). Nouveau mode de saisie **expression** (`kind: 'expr'`, `src/practice/engine/algebra.ts`) : lecture
  tolérante (multiplication implicite, ², −, ×), comparaison **exacte** des polynômes (pas de flottants), contrôle de la
  forme (développée et réduite / factorisée complètement), contre-exemple affiché si c’est faux ; clavier avec touche x.
- **11 Pythagore** (9 types) : repérer l’hypoténuse, calculer l’hypoténuse, un côté de l’angle droit (décimaux, arrondis,
  conversions), réciproque, figures usuelles, problèmes concrets, distance dans un repère, Pythagore deux fois (pavé,
  quadrilatère), trouver l’erreur. Figures SVG **à l’échelle** (`src/practice/engine/svg.ts`, `ch11/common.ts`).
- Outils communs : `engine/build.ts` (étapes, QCM), `engine/svg.ts` ; données de contrôle `js`, `poly`, `polys`, `pyth`.
- Tests : validateurs (expressions comprises), propriétés sur 2000 graines par type et par niveau pour les 4 chapitres,
  cohérence métadonnées/registre/modules, parcours de bout en bout de **chaque type à chaque niveau** des chapitres 03, 06, 11
  dans l’interface ; contrôles du build adaptés aux 4 chapitres.
- Échantillons relus : `captures/exos-03|06|11-echantillon.md` (`npx tsx scripts/sample-chapter.mts <NN>`) ;
  captures : `npx tsx scripts/captures-vague-a.mts`.

## Nouveautés v0.5 (vague B : chapitres 01, 05, 04, 02 ; « Mes progrès »)

- S'entraîner : 01 Fractions (12 types), 05 Proportionnalité et pourcentages (10), 04 Puissances et racine carrée (10),
  02 Entiers et décimaux, nombres premiers et décomposition (11). Échantillons relus : `captures/exos-0{1,2,4,5}-echantillon.md`.
- Saisie : forme « décimale » imposée (`form: 'decimal'`) et affichage personnalisé de la réponse attendue (`shown`).
- Figures SVG à l'échelle : barres, disques, quadrillages (01), graphiques cartésiens (05), droites graduées zoomées (02).
- Page « Mes progrès » (`#/progres`, bouton dans la barre du sommaire) : chapitres lus, exercices faits, réussite du
  premier coup, répartition par chapitre, types à retravailler, dernières séries. Données locales uniquement.
- Captures : `scripts/captures-vague-b.mts` ; branchement d'un chapitre : `scripts/wire-chapter.py`.

## Nouveautés v0.6 (vague C : chapitres 12, 13, 08, 14, 16, 17)
- 12 Thalès (10 types), 13 Trigonométrie (9), 08 Fonctions (9), 14 Aires, volumes, grandeurs (10), 16 Statistiques (9), 17 Probabilités (10).
- Nouvelles figures SVG à l'échelle : configurations de Thalès, triangles rectangles avec arcs, repères signés avec courbes, figures planes cotées, diagrammes en bâtons, circulaires, histogrammes, graphiques trompeurs, arbres de probabilités.
- Mise à jour fiable du service worker (v0.5.1) : `npm run test:update`, fichier `_headers` Netlify, bouton « Forcer la mise à jour ».
- Test transversal : une erreur typique « toutes cases » ne peut plus coïncider avec la bonne réponse.
- Captures : `npx tsx scripts/captures-vague-c.mts <NN> type:niveau:mode:nom …`.

## Publication (GitHub Pages)

Adresse : https://narkotine.github.io/compendium-maths/ (dépôt `Narkotine/compendium-maths`, branche `main`).
Déploiement par branche : Pages sert la branche `gh-pages` (racine), qui contient le `dist/` buildé (avec `.nojekyll`).
`main` contient les sources. Pas d’action GitHub (le jeton `gh` n’a pas le scope `workflow`).
Les sources du cours sont dans `cours/` (copie des `NN-*/cours-et-exercices.md` et figures de `compendium-maths`).

Prochaine mise à jour : recopier les cours modifiés dans `cours/`, monter `version` dans `package.json`,
`git commit` puis `git push` (sources sur `main`), puis `npm run publish:gh` : rebuild, tests, et un commit
ajouté à `gh-pages` (jamais de force-push). Pages se reconstruit en une minute environ. Le service worker détecte la nouvelle version (sw.js relu sans cache HTTP, `updateViaCache: 'none'`),
malgré le `max-age=600` de GitHub Pages ; il n’y a plus de `_headers` (ancien fichier Netlify : `docs/netlify-_headers.txt`).

Même origine que le site de jeux (`narkotine.github.io`) : stockage préfixé `compendium-maths.` (localStorage, sessionStorage),
caches `compendium-maths-precache-…`, service worker limité à `/compendium-maths/` ; « Forcer la mise à jour » ne touche qu’à eux.

## Nouveautés v0.11 (programme 2026, automatismes)

- **Repères de programme** : pastilles « Programme 2026 · 5e/4e/3e » (notion ajoutée par le BO n° 10 du 5 mars 2026)
  et « Programme 2020 » (notion absente du programme 2026, conservée : 4e jusqu’en juin 2027, 3e jusqu’en juin 2028),
  dans les cours (syntaxe `[[Programme 2026 · 3e]]`, infobulle, sommaire), sur les cartes « S’entraîner »
  (`src/practice/engine/prog.ts`) et expliquées sur l’accueil. Détail : `cours/README.md`, `cours/PLAN-REVISION.md` § 11.
- **Cours** : valeur absolue (03), nuage de points (05), médiane et aires, droite des milieux (09), vecteurs et relation de
  Chasles (10), contraposées de Pythagore (11) et de Thalès (12), quartiles et boîte à moustaches (16), notations
  ensemblistes, $P(A \cup B)$, fluctuation (17) ; 7 figures, exercices et corrigés.
- **S’entraîner** : 4 nouveaux types (171 au total) : `valeur-absolue` (03, sans calculatrice), `vecteurs` (10),
  `quartiles` (16), `ensembles` (17).
- **Automatismes** (`#/automatismes`, module `src/practice/auto/` chargé à la demande) : 39 types de questions flash
  (5e : 14, 4e : 12, 3e : 13) ; 6 séances fixes de 10 questions par niveau + séance au hasard. Version papier
  imprimable (feuille élève en deux colonnes, corrigé sur une page à part, `@media print`) ; version en ligne avec ou
  sans chronomètre (12 min), calculatrice désactivée, score final et corrigés. Rien n’est ajouté aux statistiques des
  chapitres. Tests : `tests/generators.test.ts` vérifie aussi les automatismes et la composition des séances.

## Correctif v0.9.2 (thème au premier affichage)

- `index.html` lit `compendium-maths.settings` (avec repli sur l’ancienne clé `mc.settings`) pour appliquer thème et taille avant le premier rendu, comme le reste de l’appli. Évite un flash et croiser d’éventuels réglages du site de jeux sur le même `narkotine.github.io`.

## Correctif v0.9.1 (encadrements)

- 02 « Comparer, encadrer » ★ : le nombre à encadrer a toujours exactement trois décimales (dernier chiffre non nul) ; les bornes sont calculées en entiers exacts (plus de flottants). Message ciblé si l’écart entre les bornes n’est pas 0,1 (ou 0,01).
- 02 « Arrondir, tronquer » ★ : même règle (plus de nombre déjà « rond » au rang demandé).
- 07 : les contrôles d’inéquation n’affichent plus d’inégalité fausse (« −62 < −53 : l’inégalité … ⩾ … n’est pas vérifiée »).
- Tests de propriété : toute chaîne d’(in)égalités numériques affichée dans un corrigé, une réponse ou un indice est vérifiée ; tout encadrement saisi est strict et a l’amplitude demandée.

## Nouveautés v0.9

- Nouveau mode de réponse « ordre » : cartes à ranger (`src/practice/ui/order.ts`, sans bibliothèque). Glisser au doigt
  (appui court de 170 ms sur la carte, ou tout de suite par la poignée ⠿) et à la souris (Pointer Events) ; les autres
  cartes s’écartent, retour haptique léger, page immobile pendant le glisser, défilement automatique près des bords ;
  un glissement rapide reste un défilement normal. Secours : boutons ↑↓ (44 px), toucher une carte puis sa place,
  clavier (Espace, flèches, Espace ; Échap annule) avec annonces pour lecteur d’écran. Disposition verticale partout
  (« Plus petit » en haut / « Plus grand » en bas, ou l’inverse en décroissant).
- Correction : cartes mal placées marquées ✗ (couleur + icône + texte lu), message sur la première paire voisine mal
  rangée (méthode du cours), erreurs typiques reconnues (ordre inverse, numérateurs seuls, négatifs rangés selon la
  distance à zéro, décimaux comparés comme des entiers) ; ex aequo acceptés dans les deux ordres.
- 01 : nouveau type « Ranger des fractions » (★ même dénominateur ou même numérateur ; ★★ dénominateurs multiples,
  fractions supérieures à 1 ; ★★★ négatifs, une écriture décimale, ex aequo possibles, consigne explicite).
  « Comparer deux fractions » : choix <, = ou >, avec des cas d’égalité, et un niveau ★★★ (négatifs, décimal).
- 03 « ranger » et 02 « comparer » ★★ (a) passent aux cartes (mêmes identifiants : « Mes progrès » inchangé).
- Calculatrice désactivée pour ces types. Tests : `npm run test:order` (47 vérifications, vrais glisser CDP).

## Nouveautés v0.8.1

- **Correctif « Développer k(a + b) » refusé** : le signe « × » (fois), qui ressemblait à la lettre x, était accepté comme un produit (« 9×−18 » lu 9 × (−18)) puis jugé faux avec un « contrôle avec x = 1 ». Désormais : x italique distinct, « × » à la place de x signalé sans compter faux, « × + » refusé, « x2 » expliqué. Test bout en bout `npm run test:expr` : la bonne réponse est réellement tapée (pavé et clavier, variantes d’écriture) pour chaque type à réponse expression, chaque niveau.
- **Pédagogie 06** : plus de « contrôle avec x = 1 » dans les corrigés (développer, double distributivité, identités, réduire) ; les corrigés écrivent les produits k × a et k × b ; une réponse fausse désigne le terme faux (et l’erreur de signe), le contre-exemple numérique n’est plus qu’une parenthèse discrète.

- Saisie d’expression (06) : la touche et les lettres de la case utilisent le x italique de KaTeX (police `MathVar` = KaTeX_Math italique en webfont, limitée aux lettres a–z par `unicode-range`), nettement distinct de ×. Valeur saisie inchangée (« x », « * »). Messages de correction avec $x$ en KaTeX. Test : `npm run test:x`.

## Nouveautés v0.8 (calculatrice-brouillon)

- Bouton calculatrice dans l’écran d’exercice (fermé par défaut) : panneau du bas sur téléphone (hauteur réglable, pavé masquable), latéral sur grand écran.
- Lignes gardées (saisie à gauche, résultat à droite, croix), Ans, réinjection d’une ligne, « Insérer » dans la case réponse selon la forme attendue, trigonométrie en degrés, retour Android qui ferme d’abord le panneau.
- Moteur maison sans eval (`src/practice/calc/engine.ts`), fractions exactes, ≈ si arrondi ; 40 types sur 166 sans calculatrice (`src/practice/calc/policy.ts`). Détails : `docs/calculatrice.md`.
- Tests : `npm run test:calc` (moteur, 216 cas), `npm run test:calc-e2e` (parcours navigateur ; nécessite `npm run preview`).

## Nouveautés v0.7 (vague D : chapitres 09, 10, 15)

- 09 Géométrie plane (9 types), 10 Transformations (7 types), 15 Espace (8 types) : QCM, saisie numérique, figures SVG à l’échelle (sécantes, triangles, quadrillages, repère, patrons, plan coté, pavé en perspective cavalière).
- Patrons de cube : pliage simulé (même méthode que `compendium-maths/outils/relecture/patron-cube.py`) ; `npm run test:patrons` compare le verdict sur les 216 hexominos avec l’outil Python (11 patrons, 0 désaccord) et contrôle les faces opposées.
- `ONLY=15 npx tsx tests/generators.test.ts` limite les tests de propriété à un chapitre.
- Capture `exos-17-02` (roue) refaite avec les bonnes couleurs.
