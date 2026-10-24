# Plan de révision du compendium

> Document de pilotage durable. À mettre à jour après chaque chapitre révisé (§ 9, journal).  
> Créé le 7 octobre 2026. Pilote : chapitre 11 (Pythagore), révisé en v0.2. Vague 1 en cours : 12 et 13 révisés en v0.2 ; build corrigé (§ 1.1, point 7). Suivi par chapitre : § 4.4.

**But :** passer d’un compendium « brouillon v0.1 » (cours souvent télégraphiques, figures rares, corrigés en une ligne) à un cours **compact mais compréhensible par un élève de niveau moyen**, avec des figures utiles et des corrigés détaillés. Le découpage reste **par sujet** (jamais par niveau 6e–3e).

---

## 1. État des lieux (audit du 7 octobre 2026)

### 1.1 Constats transverses

1. **Cours trop secs.** Partie « cours » (avant les exercices) : 170 à 240 lignes pour les nombres (01–08), mais seulement **90 à 165 lignes** pour la géométrie, les statistiques et les probabilités (09–17). Beaucoup de sections se réduisent à une formule et une phrase. Il manque presque partout : un exemple guidé **rédigé**, une erreur fréquente, une méthode en étapes.
2. **Figures.** 24 SVG en tout. **Aucune** figure dans les chapitres 01–08 (pas même de droite graduée, de graphique de fonction ou de graphique de proportionnalité). Une seule figure en 16 et en 17. Les figures existantes sont minimales. Certaines étaient **fausses** : en 11, le carré de l’hypoténuse n’était pas construit sur l’hypoténuse, et la légende du triangle rectangle nommait un côté de l’angle droit « hypoténuse » (corrigé dans la v0.2).
3. **Corrigés.** Tous « indicatifs », en une ligne, sans rédaction modèle. Couverture : 74–93 % pour 01–08, mais **35–64 %** pour 09–17 (15 Espace : 35 %).
4. **Erreurs relevées** (les plus nettes ; ✅ = corrigé le 7 octobre 2026) :
   - ✅ 02 corrigé B1 : « $3{,}08 = 3{,}80$ » (faux).
   - ✅ 01 corrigé H3 : raisonnement incohérent, exemple final faux ($\frac11+\frac11 \neq \frac22$).
   - ✅ 03 corrigé H2 : résolution par une équation du second degré (hors collège).
   - ✅ 11 v0.1 : énoncé G1 faux (« ce n’est pas toujours un triplet », alors que c’en est toujours un) ; corrigé D3 par produit scalaire (lycée) ; deux figures fausses.
   - ✅ 13 : passages en anglais (« Mnemonic », « Opposite/Hyp », « complementary angles »). ✅ 15 : « Prisme triangular ».
   - ✅ 05 A1/A2 et 08 B1 : tableaux sans ligne d’en-tête (non rendus en HTML). ✅ 10 § 6 : `|k|` dans un tableau (casse les colonnes).
   - ✅ 12 § 1.2 : paragraphe confus sur $\frac{AD}{DB}=\frac{AE}{EC}$ ; § 2.1 : condition de la réciproque mal dite (il faut des points **alignés dans le même ordre**, pas « du même côté ») → chapitre réécrit en v0.2.
   - ✅ 16 et 17 : « Lycée » avec majuscule ; 17 utilisait $\Omega$, $\mathrm{Card}$, $\cup$, $\cap$ et une probabilité conditionnelle, notations de lycée → retirées en v0.2 (« $A$ ou $B$ », « non $A$ », comptage). **v0.11 :** le programme 2026 introduit $\cup$, $\cap$, $\overline{A}$ en 4e et $P(A \cup B)$ en 3e → réintroduits en 17 § 3.1–3.2 avec la pastille « Programme 2026 » ($\mathrm{Card}$ et conditionnelle restent hors collège).
5. **Calibrage programme.** En octobre 2026, les **4e et 3e suivent encore le programme de 2020** (BO n° 31 du 30 juillet 2020). Un **nouveau programme de cycle 4** (BO du 5 mars 2026) s’applique en 5e à la rentrée 2026, en 4e en 2027, en 3e en 2028. Conséquences :
   - contenus présentés comme du cours alors qu’ils sont hors programme 2020 : systèmes $2\times2$ et inéquations générales (07), angle inscrit (09), $\cos^2+\sin^2=1$ et valeurs exactes (13), notations ensemblistes (17) → à garder, mais étiquetés **★★★ « Pour aller plus loin »** ;
   - inéquations (07) : absentes du programme 2020, elles **reviennent en 3e** dans le programme 2026 (BO n° 10 du 5 mars 2026, en 3e à la rentrée 2028) : « Résoudre analytiquement et graphiquement une inéquation du premier degré du type $ax \geqslant b$ » (calcul littéral) et « Résoudre graphiquement des équations et des inéquations linéaires » (fonctions). Les **inéquations générales** et les **systèmes** restent hors programme du collège ;
   - notions absentes : **racine carrée** (utilisée en 11, 13, 14 mais jamais définie — rappel provisoire ajouté en 11 § 1), **nombres premiers et décomposition** (02), **triangles semblables / égaux** (09 ou 12), **repérage** dans le plan, dans le pavé et sur la sphère (latitude, longitude), **sections** de cylindre, cône, pyramide (15), **programmes de calcul** comme outil de preuve (06), lecture graphique de fonctions (08) ;
   - ✅ action : lire le programme 2026 (20 pages, éduscol) avant la vague 3 et noter ajouts et suppressions par chapitre — programme lu en entier le 20 octobre 2026 (annexe 2 du BO n° 10 du 5 mars 2026) ; ✅ ajouts et suppressions reportés dans les chapitres en **v0.11** (24 octobre 2026, § 11).
6. **Forme.** Apostrophes droites `'` dans 09–17, typographiques `’` dans 01–08. « € » placé dans les formules ($120\,€$) : KaTeX le rend mal (avertissement de police).
7. **Build — ✅ corrigé le 7 octobre 2026** (sauvegarde : `compendium-build/build-compendium.js.bak`).
   - Règle `$...$` en ligne ajoutée **après** `$$...$$` et **avant** `marked`. Les `\$` échappés sont protégés avant tout traitement et rendus comme un « $ » littéral ; les montants en € restent dans des formules normales (avertissement de police KaTeX, sans effet sur le rendu).
   - `katex` 0.18.9 et `marked` 18 installés dans `/workspace/node_modules` (`npm install` dans `/workspace`, d’après `package.json`).
   - `syncMarkdownToPc()` ignore les sous-dossiers de `figures/` (message « Ignored (not a file) ») au lieu de planter.
   - Le build copie `katex.min.css` et `fonts/` depuis `node_modules` (même version que le moteur) ; le lien vers le CSS KaTeX 0.16 du CDN, qui écrasait le CSS local, a été retiré (les pages marchent hors ligne).
   - CSS : petite marge verticale autour des fractions en ligne (`.katex-base:has(.mfrac)`), sinon deux lignes contenant `\dfrac` se chevauchent.
   - Résultat du rebuild : 17 aperçus, **0** formule brute, **0** erreur KaTeX. Le build réécrit aussi `/workspace/compendium-maths-pour-pc/` (markdown + `compendium-complet.html`).
   - Rappel : les SVG sont inlinés dans **une seule page** (version complète) : un `<style>` ou un `id` générique dans un SVG fuit ou entre en collision avec les autres chapitres.

### 1.2 Tableau d’audit par chapitre

Lignes = total du fichier (cours seul entre parenthèses). Densité du cours : 1 = télégraphique, 5 = cible atteinte. Priorité : 1 = à faire en premier.

| Ch. | Sujet | Lignes | Exos | Corrigés | SVG | Densité | Manques principaux | Prio |
|---|---|---|---|---|---|---|---|---|
| 01 | Fractions | ~~396 (224)~~ → **475** | 42 | **100 %** | **7** | ~~3~~ → **4–5** | **v0.2 fait** (vague 4) : barres de partage (3/8, 7/4), demi-droite en quarts, fractions égales par recoupage, comparaison (même numérateur, dénominateur commun), addition en douzièmes, modèle d’aire du produit, fraction d’une quantité et « combien de quarts dans 3 » pour la division ; simplification par décomposition (renvoi au 02) ; corrigés L, G, K complétés ; reste : relecture humaine | ✅ |
| 02 | Entiers, décimaux | ~~361 (210)~~ → **466** | 41 | **100 %** | **6** | ~~3~~ → **4–5** | **v0.2 fait** (vague 4) : tableau de numération (et × 10), zoom dixièmes / centièmes sur la droite graduée, arrondi et troncature sur la droite, division euclidienne (œufs en boîtes), crible d’Ératosthène, arbre de décomposition ; **nombres premiers et décomposition en facteurs premiers ajoutés** (problèmes de partage) ; « € » sortis des formules ; reste : relecture humaine | ✅ |
| 03 | Relatifs | ~~388 (241)~~ → **484** | 41 | **100 %** | **6** | ~~3~~ → **4–5** | **v0.2 fait** (vague 4) : thermomètre (écart), droite graduée (opposés, distance à zéro, ordre), additions en déplacements, jetons pour l’addition et pour la soustraction (« ajouter l’opposé »), règle des signes justifiée par une régularité ; ancien § 3.4 confus supprimé ; notation $\vert a \vert$ retirée (hors collège ; **réintroduite en v0.11** : valeur absolue au programme 2026 de 5e) ; reste : relecture humaine | ✅ |
| 04 | Puissances | ~~367 (218)~~ → **457** | 40 | **100 %** | **6** | ~~3–4~~ → **4–5** | **v0.2 fait** (vague 4) : carré et cube en figures, suites de puissances (÷ 10, ÷ 2) pour justifier $10^0$ et les exposants négatifs (ancien § 4.2 confus remplacé), règles en comptant les facteurs, échelle des longueurs avec préfixes nano → giga, déplacement de la virgule pour la notation scientifique ; **racine carrée définie ici (§ 6)**, renvoi depuis le 11 ; reste : relecture humaine | ✅ |
| 05 | Proportionnalité | ~~328 (169)~~ → **551** | 47 | **100 %** | **7** | ~~3~~ → **4–5** | **v0.2 fait** (vague 3) : graphiques proportionnel / non proportionnel, tableau à flèches, double droite graduée des pourcentages, coefficient multiplicateur en barres, ratio et partage (programme 2026), plan à l’échelle ; reste : relecture humaine | ✅ |
| 06 | Calcul littéral | ~~375 (225)~~ → **517** | 42 | **100 %** | **7** | ~~3~~ → **4–5** | **v0.2 fait** (vague 3) : motif d’allumettes, tuiles pour réduire, modèles d’aire (distributivité simple et double, $(a+b)^2$, découpage de $a^2-b^2$), programmes de calcul et preuves, contre-exemple ; reste : relecture humaine | ✅ |
| 07 | Équations | ~~376 (220)~~ → **491** | 41 | **100 %** | **8** | ~~3~~ → **4–5** | **v0.2 fait** (vague 3) : balances (étapes, inconnue des deux côtés), opérations inverses, modèle en barres pour la mise en équation, résolution graphique, parabole pour $x^2 = a$ (renvoi au ch. 4), droite graduée des inéquations ; systèmes et inéquations générales en ★★★ ; reste : relecture humaine | ✅ |
| 08 | Fonctions | ~~354 (196)~~ → **498** | 40 | **100 %** | **10** | ~~3~~ → **4–5** | **v0.2 fait** (vague 2) : 10 vrais graphiques sur quadrillage ; reste : relecture humaine | ✅ |
| 09 | Géométrie plane | ~~299 (159)~~ → **657** | 45 | **100 %** | **14** | ~~2–3~~ → **4–5** | **v0.2 fait** (vague 2) : droites, angles et parallèles, inégalité triangulaire et constructions, droites remarquables, quadrilatères, cercle, démonstration ; reste : relecture humaine | ✅ |
| 10 | Transformations | ~~280 (164)~~ → **492** | 39 | **100 %** | **11** | ~~2~~ → **4** | **v0.2 fait** (vague 2) : cinq transformations construites pas à pas, quadrillages, reconnaissance, frises et rosaces, corrigé de construction en figure ; reste : relecture humaine | ✅ |
| 11 | Pythagore | ~~244 (117)~~ → **562** | 44 | **100 %** | **9** | ~~2~~ → **4–5** | **Pilote v0.2 fait** ; rappel provisoire sur la racine carrée remplacé par un renvoi au chapitre 4, § 6 ; reste : relecture humaine, éventuelle figure pour H1 | ✅ |
| 12 | Thalès | ~~227 (106)~~ → **581** | 47 | **100 %** | **9** | ~~2~~ → **4–5** | **v0.2 fait** (vague 1) ; reste : relecture humaine | ✅ |
| 13 | Trigonométrie | ~~227 (106)~~ → **534** | 45 | **100 %** | **7** | ~~2~~ → **4–5** | **v0.2 fait** (vague 1) ; reste : relecture humaine | ✅ |
| 14 | Aires, volumes | ~~241 (111)~~ → **603** | 46 | **100 %** | **9** | ~~2~~ → **4–5** | **v0.2 fait** (vague 1) ; reste : relecture humaine | ✅ |
| 15 | Espace | ~~212 (101)~~ → **609** | 42 | **100 %** | **15** | ~~1–2~~ → **4–5** | **v0.2 fait** (vague 1) : perspective, patrons, vues, sections, repérage pavé / sphère ; reste : relecture humaine | ✅ |
| 16 | Statistiques | ~~211 (96)~~ → **464** | 38 | **100 %** | **8** | ~~2~~ → **4** | **v0.2 fait** (vague 2) : vrais diagrammes (bâtons, circulaire, histogramme, évolution) avec `graphkit`, moyenne pondérée, médiane, étendue, graphique trompeur ; reste : relecture humaine | ✅ |
| 17 | Probabilités | ~~207 (90)~~ → **487** | 39 | **100 %** | **8** | ~~2~~ → **4** | **v0.2 fait** (vague 2) : notations lycée retirées, arbres avec et sans remise, tableau des deux dés, simulation de 1 000 lancers ; reste : relecture humaine | ✅ |

### 1.3 Géométrie (09–15) contre nombres (01–08)

- Longueur moyenne : **246 lignes** en 09–15 contre **367** en 01–08 ; la partie cours fait **environ 120 lignes** contre **210**.
- Corrigés : **54 %** en moyenne en 09–15 (v0.1) contre **88 %** en 01–08.
- Paradoxe : les chapitres de géométrie ont des figures, mais trop peu (3 en moyenne, une par notion principale au mieux) et souvent sans lien avec les exemples ; les chapitres de nombres n’en ont **aucune**, alors que plusieurs notions en ont besoin (droite graduée, fractions, graphiques).
- Conclusion : la géométrie passe en premier (écart de qualité plus grand, et c’est le cœur du brevet), puis 08 (fonctions sans graphique), puis les statistiques et les probabilités, puis les nombres.

---

## 2. Standard éditorial cible

### 2.1 Structure type d’un chapitre

```
# Titre
> En-tête (2 lignes : chapitre unifié ; public visé ; légende ★ / ★★ / ★★★)

## 0. Ce qu’on vise
   En une phrase (pourquoi ce chapitre sert) · 4–6 objectifs « je sais… »
   Encadré « > **Prérequis.** » : 2–4 renvois précis (chapitre + §), depuis la v0.3

## 1…n. Notions (une section par notion)
   Pour chaque notion, dans cet ordre :
   a. Intuition (2–4 phrases, situation concrète ou dessin)
   b. Définition / propriété dans un encadré « > **…** »
   c. Figure SVG si un dessin aide vraiment (§ 5)
   d. 1–2 exemples guidés : Énoncé → Réflexion → Rédaction (encadré) → Contrôle
   e. Erreur(s) fréquente(s) : encadré « > **Erreur fréquente.** », avec le contre-exemple chiffré
   f. Méthode en étapes numérotées (encadré « > **Méthode — … ** »)
   Les compléments hors programme sont signalés « *Pour aller plus loin (★★★)* ».

## n+1. Mini-synthèse
   Encadré « > **À retenir.** » : 5–7 puces maximum

## n+2. Exercices types        (séries A, B, C… progressives : ★ → ★★)
## n+3. Exercices atypiques    (trouver l’erreur, raisonner, plusieurs étapes, ouvert : ★★ → ★★★)
## n+4. Corrigés               (100 % des exercices ; rédaction « (modèle) » pour 1 exercice par série)
## n+5. Liens avec les autres chapitres
## n+6. Fiche-synthèse          (v0.3 : tableau « Je dois savoir… | Comment | Exemple express | S’entraîner »,
                                 5–6 lignes renvoyant aux séries, puis « **Pièges à éviter :** » en 3 points ; ½ page max)
*Pied de page : version + base + renvoi au journal des corrections*
```

### 2.2 Encadrés (blockquotes, déjà stylés dans le build)

| Libellé exact | Usage |
|---|---|
| `> **Théorème…** / **Définition.** / **Propriété.**` | Énoncé officiel |
| `> **Méthode — …**` | Étapes numérotées |
| `> **Erreur fréquente.**` ou `> **Erreur 1 — …**` | Piège, avec exemple chiffré |
| `> **Astuce.**` / `> **Pourquoi on en a besoin.**` | Aide courte |
| `> **À retenir.**` | Mini-synthèse |
| `> **Prérequis.**` | Renvois en tête de chapitre (§ 0), avec chapitre et § |
| `> Le triangle … D’après …` | Rédaction modèle (dans les exemples et les corrigés) |

### 2.3 Style

- Phrases courtes : une idée par phrase, environ 20 mots au plus. Tutoiement **non** ; « je sais » dans les objectifs, « on » dans le cours.
- Le vocabulaire est défini avant d’être utilisé. Pas de notation de lycée dans le cœur du cours.
- Chaque règle est suivie d’un exemple chiffré. Chaque exemple guidé se termine par un **contrôle** de vraisemblance.
- Français soigné, aucun mot anglais, typographie française (espace avant `:`, `;`, `?`, `!` ; guillemets « »).

---

## 3. Critères « assez développé » (sans devenir un manuel)

Cible indicative : **450 à 700 lignes** par chapitre selon le sujet (chapitres courts par nature, comme 03 ou 04 : 450–520 ; chapitres larges, comme 09, 14 ou 15 : 600–700). La longueur est une conséquence, pas un objectif : on vérifie les critères ci-dessous.

Un chapitre est **assez développé** quand :

1. Chaque notion du § 0 a : intuition + énoncé + au moins **1 exemple guidé rédigé** + au moins **1 erreur fréquente** + une méthode (si c’est une technique).
2. Au moins **3 exemples guidés** dans le chapitre, dont un en situation concrète.
3. Figures : en géométrie, au moins **5** ; ailleurs, au moins **2** quand la notion est visuelle (droite graduée, graphique, diagramme, aires). Chaque figure est **citée** par le texte voisin.
4. Exercices : **20 à 30 types** (★ → ★★) et **12 à 18 atypiques** (★★ → ★★★), dont au moins 3 « trouver l’erreur » et 2 problèmes en plusieurs étapes.
5. Corrigés : **100 %** ; au moins un corrigé « (modèle) » rédigé par série ; les exercices ouverts ont une proposition de réponse.
6. Un élève moyen peut traiter les exercices ★ en relisant **seulement** le cours (test de relecture : chaque exercice ★ ressemble à un exemple guidé).

Ce qu’on évite (anti-remplissage) : répéter la même règle dans trois sections ; les digressions historiques longues ; les démonstrations hors programme dans le cœur du cours ; plus de 7 puces dans une liste ; un exemple qui n’apporte rien de neuf.

---

## 4. Priorité et pipeline

### 4.1 Ordre de révision

| Vague | Chapitres | Raison |
|---|---|---|
| 0 — Pilote | **11 Pythagore** ✅ v0.2 | Thème majeur du brevet, figures fausses, modèle pour 12 et 13 |
| 0 bis — Socle technique | Build (`$...$`, dépendances, sous-dossiers, CSS KaTeX) ✅ ; corrections ponctuelles ✅ | Sans cela, un rebuild casse l’affichage |
| 1 — Géométrie cœur | **12 Thalès** ✅ → **13 Trigonométrie** ✅ → **15 Espace** ✅ → **14 Aires et volumes** ✅ (vague terminée) | Même structure « théorème + rédaction » que 11 ; 15 est le plus faible |
| 2 — Fort impact visuel | **08 Fonctions** ✅ → **09 Géométrie plane** ✅ → **10 Transformations** ✅ → **17 Probabilités** ✅ → **16 Statistiques** ✅ (vague terminée) | Fonctions sans graphique ; constructions ; notations lycée à retirer |
| 3 — Algèbre | **05 Proportionnalité → 06 Calcul littéral → 07 Équations** | Bonne base, mais aucune figure et calibrage programme (07) |
| 4 — Nombres | **03 Relatifs → 01 Fractions → 02 Entiers → 04 Puissances** | Les plus solides ; ajouter les représentations visuelles et les notions manquantes |
| 5 — Transverse | Harmonisation, liens entre chapitres, fiches de synthèse, QCM | Après toutes les vagues |

### 4.2 Pipeline pour chaque chapitre

1. **Sauvegarde** : `cp -n cours-et-exercices.md cours-et-exercices.md.bak` et, si on touche aux figures, copie de `figures/` vers `figures-v01.bak/` (**jamais** dans `figures/`). **Suppressions : jamais de `rm` avec joker dans `compendium-maths/`** ; on supprime les anciens SVG un par un, par chemin explicite, après les avoir sauvegardés.
2. **Fiche d’audit** : relire, lister notions, erreurs, figures manquantes, exercices sans corrigé (ligne du tableau § 1.2 à compléter).
3. **Cours** réécrit selon § 2.1, en gardant les bons passages existants.
4. **Figures** (§ 5) : produire, puis **regarder le rendu** (capture d’écran) et vérifier la cohérence avec le texte (mêmes lettres, mêmes nombres).
5. **Exercices** : reprendre les anciens (corriger les énoncés faux), compléter la progression, ajouter « trouver l’erreur » et les problèmes en plusieurs étapes.
6. **Corrigés** : 100 %, avec rédactions modèles. **Refaire chaque calcul** (calculatrice ou script).
7. **Contrôles automatiques** :  
   `node outils/verifier-chapitre.js NN-slug` (depuis `compendium-maths/` ; `katex` est trouvé dans `/workspace/node_modules`)  
   (KaTeX, `$` non appariés, figures présentes et référencées, SVG sans `<style>` ni `id`, tableaux, apostrophes, corrigés manquants). Objectif : **OK**.
8. **Aperçu visuel** : `node /workspace/compendium-build/build-compendium.js`, puis capture pleine page du chapitre dans `outils/captures/NN-slug.png` (Chrome sans interface, voir § 5.3) : formules, tableaux, figures. Exporter aussi **une figure représentative** en PNG : `outils/svg2png.sh NN-slug/figures/xxx.svg outils/captures/NN-figure.png`.
9. **Relecture pédagogique** (checklist § 4.3), puis pied de page `*Version v0.2 — …*` et mise à jour du journal (§ 9).
10. **Revue** : la première fois (pilote), Nguhma valide le ton, la longueur et le style des figures avant la vague 1. Ensuite, revue par lot à la fin de chaque vague.
11. **Rebuild** : possible à tout moment depuis la correction du build (§ 1.1, point 7). Il régénère `apercu/` **et** `/workspace/compendium-maths-pour-pc/`.

### 4.3 Checklist de relecture

- [ ] Chaque objectif du § 0 est traité et exercé.
- [ ] Aucune notion utilisée avant d’être définie (sinon renvoi explicite à un autre chapitre).
- [ ] Chaque exemple guidé : énoncé, réflexion, rédaction, contrôle.
- [ ] Les erreurs fréquentes sont chiffrées (pas seulement « attention »).
- [ ] Figures : lettres et valeurs identiques à celles du texte ; lisibles sur un téléphone.
- [ ] Tous les résultats recalculés ; arrondis conformes à la consigne.
- [ ] Hors programme signalé ★★★ ; pas de notation de lycée dans le cœur.
- [ ] Phrases courtes, aucun anglicisme, typographie française.

### 4.4 Suivi par chapitre

Statuts : **v0.3** = v0.2 relue (calculs revérifiés par script, renvois, prérequis, fiche-synthèse ; § 10) ; **v0.2** = révisé au standard (§ 2–3) ; **v0.1 + corr.** = brouillon d’origine avec corrections ponctuelles (sauvegarde `.bak`) ; **v0.1** = brouillon d’origine. Lignes, exercices et figures au 7 octobre 2026 (lignes après la relecture v0.3). Colonne `verifier` : résultat de `node outils/verifier-chapitre.js` (les « points » des chapitres non révisés sont surtout des apostrophes droites, des `<title>` manquants dans les SVG et des corrigés absents).

| Ch. | Sujet | Statut | Vague | Lignes | Exos (types + atyp.) | Corrigés | SVG | `verifier` |
|---|---|---|---|---|---|---|---|---|
| 01 | Fractions | **v0.3** ✅ | 4 | 489 | 42 (23 + 19) | 100 % | 7 | OK |
| 02 | Entiers, décimaux | **v0.3** ✅ | 4 | 480 | 41 (23 + 18) | 100 % | 6 | OK |
| 03 | Relatifs | **v0.3** ✅ | 4 | 498 | 41 (22 + 19) | 100 % | 6 | OK |
| 04 | Puissances | **v0.3** ✅ | 4 | 471 | 40 (22 + 18) | 100 % | 6 | OK |
| 05 | Proportionnalité | **v0.3** ✅ | 3 | 566 | 47 (30 + 17) | 100 % | 7 | OK |
| 06 | Calcul littéral | **v0.3** ✅ | 3 | 532 | 42 (25 + 17) | 100 % | 7 | OK |
| 07 | Équations | **v0.3** ✅ | 3 | 506 | 41 (23 + 18) | 100 % | 8 | OK |
| 08 | Fonctions | **v0.3** ✅ | 2 | 514 | 40 (23 + 17) | 100 % | 10 | OK |
| 09 | Géométrie plane | **v0.3** ✅ | 2 | 672 | 45 (29 + 16) | 100 % | 14 | OK |
| 10 | Transformations | **v0.3** ✅ | 2 | 507 | 39 (23 + 16) | 100 % | 11 | OK |
| 11 | Pythagore | **v0.3** ✅ | 0 | 577 | 44 (26 + 18) | 100 % | 9 | OK |
| 12 | Thalès | **v0.3** ✅ | 1 | 596 | 47 (30 + 17) | 100 % | 9 | OK |
| 13 | Trigonométrie | **v0.3** ✅ | 1 | 549 | 45 (28 + 17) | 100 % | 7 | OK |
| 14 | Aires, volumes | **v0.3** ✅ | 1 | 619 | 46 (29 + 17) | 100 % | 9 | OK |
| 15 | Espace | **v0.3** ✅ | 1 | 624 | 42 (27 + 15) | 100 % | 15 | OK |
| 16 | Statistiques | **v0.3** ✅ | 2 | 481 | 38 (22 + 16) | 100 % | 8 | OK |
| 17 | Probabilités | **v0.3** ✅ | 2 | 502 | 39 (23 + 16) | 100 % | 8 | OK |

Relecture humaine (Nguhma) : les 17 chapitres, en priorité les décisions listées au § 10.3 — revue par lot (§ 4.2, étape 10).

---

## 5. Figures

### 5.1 Quand dessiner

Dessiner si la figure fait au moins une de ces choses :

- montrer une **configuration** à reconnaître (triangle rectangle tourné, Thalès papillon, patron) ;
- **modéliser** une situation concrète (échelle contre un mur, ombre et soleil) ;
- **visualiser** une notion abstraite (droite graduée, aires de la double distributivité, graphique de fonction, arbre) ;
- montrer une **méthode** (organigramme « quel outil ? », étapes d’une construction) ;
- montrer un **piège** (mauvais rapport en Thalès, hypoténuse mal repérée).

Ne pas dessiner : une figure qui ne fait que répéter une formule ; une décoration.

### 5.2 Format technique (obligatoire)

- Fichier `NN-slug/figures/nom-explicite.svg`, en minuscules avec tirets (`reperer-hypotenuse.svg`). **Aucun sous-dossier** dans `figures/`.
- SVG autonome : `viewBox` + `width` / `height` (largeur 340 à 720 px), fond blanc `<rect … fill="white"/>`, attribut `font-family="Arial, Helvetica, sans-serif"` sur la racine, et un `<title>` qui décrit la figure.
- **Ni `<style>` ni `id`** (les SVG sont inlinés dans une page unique). Si un `id` est indispensable, le préfixer par le numéro de chapitre (`11-…`). Flèches : dessiner un petit triangle (`<polygon>`) plutôt qu’un `<marker>`.
- Pas d’indices avec `_` (ils s’affichent tels quels) : écrire `A(1 ; 2)` ou utiliser `<tspan baseline-shift="sub">`.
- Palette commune :

| Rôle | Couleur |
|---|---|
| Tracé principal, texte | `#222` |
| Élément mis en valeur (hypoténuse, résultat) | `#c0392b` |
| Élément secondaire, données | `#1f4e79` (couleur d’accent du site) |
| Légendes discrètes | `#666` |
| Troisième rôle (paires de côtés homologues, « correct ») | `#2e7d32` (vert), remplissage `#e3f1e4` |
| Remplissages | `#fdebd0` (orangé), `#dbe8f5` (bleuté), `#eeeeee` (gris) |

- Taille de texte : 15–17 px pour les points, 13–14 px pour les valeurs et légendes. Angle droit : petit carré de 10 à 18 px.
- Figures générées par script : garder le script dans `outils/figures/` (exemples : `gen-11-pythagore.py`, `gen-12-thales.py`). Depuis le chapitre 12, les générateurs importent la boîte à outils commune `outils/figures/svgkit.py` (palette, flèches, angles droits, arcs d’angle, marques de parallélisme, étiquettes). Pour l’espace (14, 15), `outils/figures/espace.py` ajoute la perspective cavalière : projection (fuyantes à $45^\circ$, coefficient $0{,}5$), polyèdres convexes avec arêtes cachées calculées automatiquement en pointillés, cylindre, cône et boule (bases dessinées comme des ovales horizontaux). `outils/figures/cube_nets.py` vérifie par pliage qu’un assemblage de six carrés est un patron de cube. Pour les graphiques (08, 16, 17), la classe `Graph` de `outils/figures/graphkit.py` trace un repère quadrillé, des courbes et des pointillés de lecture ; les titres d’axes sont placés à côté des pointes de flèche, hors du quadrillage, pour ne jamais chevaucher les graduations (prévoir la largeur du SVG en conséquence).
- Dessiner **à l’échelle** quand des valeurs sont écrites sur la figure (angle de $38^\circ$ vraiment à $38^\circ$, triangle 9-7,5-12 vraiment dans ces proportions), sinon l’indiquer (« dessin non à l’échelle »).

### 5.3 Référencer dans le `.md`

```
![Description complète, sans crochets](figures/nom.svg)
```

- Le texte alternatif décrit la figure (accessibilité) et ne contient **pas** de crochets `[ ]`.
- La figure est placée **juste après** le paragraphe qui l’annonce, et le texte la cite (« schéma ci-dessus »).
- Vérifier le rendu : `outils/svg2png.sh figure.svg sortie.png [échelle]` (Chrome sans interface), puis `python3 outils/planche.py planche.png a.png b.png …` pour relire plusieurs figures d’un coup. Attention, l’outil de lecture d’images garde en cache un chemin déjà lu : donner un nouveau nom à chaque nouvelle capture.

---

## 6. Conventions KaTeX et français (déjà en place, à respecter)

- Formule en ligne : `$...$`. Formule centrée : `$$...$$` sur ses propres lignes (ou sur une ligne dans un encadré `> $$...$$`). Ne pas utiliser `\(...\)`.
- Décimaux : virgule protégée `{,}` → `$2{,}5$`. Grands nombres : espace fine `$10\,244$`.
- Unités en romain avec espace fine : `$5\,\mathrm{cm}$`, `$\mathrm{cm}^2$`, `$\mathrm{km/h}$`. Le symbole **€ se met hors formule** : `$19{,}60$ €` (KaTeX n’a pas la police pour €).
- Fractions : `\dfrac` en ligne comme en bloc. Inégalités : `\leqslant`, `\geqslant`. Angles : `\widehat{ABC}` ; degrés `90^\circ`.
- Points et coordonnées : `$A(1\,;2)$` (point-virgule, convention française).
- Segments et droites : `$[AB]$`, `$(AB)$`, longueur `$AB$`.
- **Jamais de `|` dans une formule à l’intérieur d’un tableau** (il casse les colonnes) : reformuler ou utiliser `\lvert k \rvert` hors tableau.
- Tableaux Markdown : toujours une ligne d’en-tête suivie de `|---|`.
- Exercices : `**A1.**` en début de ligne ; corrigé modèle : `**B1. (modèle)**`. Le script de contrôle s’appuie sur ces formes.
- Apostrophe typographique `’` partout (y compris 09–17 lors de leur révision) ; guillemets « » ; espace avant `: ; ? !`.
- Difficulté : ★ / ★★ / ★★★ dans les titres de séries, jamais d’étiquette de classe (6e…3e).

---

## 7. Outils

| Fichier | Rôle |
|---|---|
| `outils/verifier-chapitre.js` | Contrôles automatiques (§ 4.2, étape 7). Sans argument : tous les chapitres. |
| `outils/figures/gen-11-pythagore.py` | Génère les 9 SVG du chapitre 11 (écrit directement dans `11-pythagore/figures/`). |
| `outils/figures/svgkit.py` | Boîte à outils commune des générateurs (depuis le chapitre 12). |
| `outils/figures/gen-12-thales.py` | Génère les 9 SVG du chapitre 12. |
| `outils/figures/gen-13-trigonometrie.py` | Génère les 7 SVG du chapitre 13. |
| `outils/figures/espace.py` | Perspective cavalière (projection, polyèdres avec arêtes cachées, cylindre, cône, boule), utilisée par 14 et 15. |
| `outils/figures/cube_nets.py` | Test de pliage d’un patron de cube (faces opposées, superpositions). |
| `outils/figures/gen-15-geometrie-espace.py` | Génère les 15 SVG du chapitre 15. |
| `outils/figures/gen-14-aires-volumes.py` | Génère les 9 SVG du chapitre 14. |
| `outils/figures/graphkit.py` | Classe `Graph` (repère quadrillé, courbes, lectures, titres d’axes hors quadrillage), utilisée par 08, 16, 17. |
| `outils/figures/gen-08-fonctions.py` | Génère les 10 graphiques du chapitre 08. |
| `outils/figures/gen-09-geometrie-plane.py` | Génère les 14 SVG du chapitre 09 (constructions au compas, droites remarquables, quadrilatères, cercle). |
| `outils/figures/gen-10-transformations.py` | Génère les 11 SVG du chapitre 10 (transformations calculées sur quadrillage, frises, rosace, exercice et corrigé). |
| `outils/figures/gen-17-probabilites.py` | Génère les 8 SVG du chapitre 17 (arbres, tableau des deux dés, simulation à graine fixe de 1 000 lancers). |
| `outils/figures/gen-16-statistiques.py` | Génère les 8 SVG du chapitre 16 (diagrammes avec `graphkit`). |
| `outils/figures/gen-01-fractions.py` | Génère les 7 SVG du chapitre 01 (barres de partage, demi-droite, recoupage, modèle d’aire du produit, division). |
| `outils/figures/gen-02-entiers-decimaux.py` | Génère les 6 SVG du chapitre 02 (tableau de numération, zoom, arrondi, division euclidienne, crible, arbre de facteurs). |
| `outils/figures/gen-03-relatifs.py` | Génère les 6 SVG du chapitre 03 (thermomètre, droites graduées, déplacements, jetons). |
| `outils/figures/gen-04-puissances.py` | Génère les 6 SVG du chapitre 04 (carré et cube, suites de puissances, règle du produit, échelle des puissances de 10, notation scientifique, racine carrée). |
| `outils/figures/gen-05-proportionnalite.py` | Génère les 7 SVG du chapitre 05 (graphiques avec `graphkit`, double droite graduée, barres, plan à l’échelle). |
| `outils/figures/gen-06-calcul-litteral.py` | Génère les 7 SVG du chapitre 06 (tuiles, modèles d’aire, programme de calcul). |
| `outils/figures/gen-07-equations.py` | Génère les 8 SVG du chapitre 07 (balances, opérations inverses, barres, résolutions graphiques). |
| `outils/capture-page.sh` | Capture pleine page d’un aperçu (`apercu/NN-slug.html`, largeur 1 100 px, bas rogné) : `outils/capture-page.sh NN-slug sortie.png`. |
| `outils/svg2png.sh` | Convertit un SVG en PNG (Chrome sans interface, ×2 par défaut). |
| `outils/planche.py` | Assemble plusieurs PNG en une planche de relecture (nécessite Pillow). |
| `outils/captures/` | Captures pleine page des 17 chapitres (`NN-slug.png`) et une figure représentative par chapitre (`NN-figure.png`), toutes à jour au 07/10/2026. |

`outils/` n’est pas copié par le build (seuls les dossiers de chapitres le sont).

---

## 8. Prochaines actions concrètes

1. **Revue par lot de Nguhma** : les 17 chapitres sont en v0.3 (vagues 1 à 4, puis relecture § 10). Captures pleine page `outils/captures/NN-slug.png` et figures `outils/captures/NN-figure.png`. Points à juger en priorité pour les vagues 3 et 4 (01 à 07) : niveau des exemples guidés pour un élève moyen, place des ★★ / ★★★ (exposants négatifs d’une base quelconque, systèmes, simplification de racines), longueur (457 à 551 lignes).
2. **Cohérence transversale** : ✅ faite en v0.3 (§ 10). Les décisions du § 10.3 sont tranchées et appliquées en v0.3.1 (§ 10.4).
3. **Pistes facultatives** : QCM d’auto-évaluation par chapitre ; version imprimable (PDF) de `compendium-complet.html` ; figure pour l’exercice H1 du 11.

---

## 9. Journal

| Date | Chapitre | Version | Fait |
|---|---|---|---|
| 07/10/2026 | Tous | — | Audit complet (§ 1) ; plan créé ; script de contrôle `outils/verifier-chapitre.js` |
| 07/10/2026 | 11 Pythagore | v0.2 | Cours réécrit (rappel racine carrée, hypoténuse, théorème, preuve par puzzle, 6 exemples guidés, rédactions modèles, erreurs fréquentes, réciproque, applications, pavé, repère ★★★, mini-synthèse) ; 9 SVG (3 refaits dont 2 faux, 6 nouveaux) ; 44 exercices (26 types, 18 atypiques), 100 % corrigés ; 244 → 581 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 01, 02, 03, 05, 08, 10, 13, 15 | v0.1 + corrections | Corrections ponctuelles (erreurs de corrigés, tableaux cassés, anglicismes) ; sauvegarde `.bak` dans chaque dossier |
| 07/10/2026 | Build | — | `$...$` en ligne, `\$` littéral, `katex` + `marked` installés, sous-dossiers de `figures/` ignorés, CSS KaTeX local à la bonne version, espacement des fractions en ligne ; rebuild des 17 aperçus (0 formule brute, 0 erreur) ; captures dans `outils/captures/`. Sauvegarde : `build-compendium.js.bak` |
| 07/10/2026 | 12 Thalès | v0.2 | Cours réécrit (rappels produit en croix et agrandissement, emboîtés, papillon, côtés homologues, segments « restants », 6 exemples guidés rédigés, réciproque avec ordre des points, parallèles cachées, aires $\times k^2$, triangles semblables, mini-synthèse) ; 9 SVG (3 anciens remplacés) ; 47 exercices (30 types, 17 atypiques), 100 % corrigés ; 226 → 581 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 13 Trigonométrie | v0.2 | Cours réécrit (vocabulaire adjacent / opposé selon l’angle, pourquoi les rapports existent, CAH SOH TOA, calcul de longueurs inconnue en haut / en bas, calcul d’angles, calculatrice, visée, pente, échelle, choix de l’outil, relations et valeurs exactes en ★★★) ; 7 SVG (3 anciens remplacés) ; 45 exercices (28 types, 17 atypiques), 100 % corrigés ; 226 → 534 lignes. Sauvegardes : `cours-et-exercices.md.bak` (origine), `cours-et-exercices.md.phase0.bak` (après corrections ponctuelles), `figures-v01.bak/` |
| 07/10/2026 | 15 Espace | v0.2 | Cours réécrit (solides et vocabulaire, Euler, solides de révolution, règles de la perspective cavalière et construction en 4 étapes, patrons du cube avec méthode de pliage, du pavé, du prisme, de la pyramide, du cylindre et du cône, vues et plan coté, sections du pavé, du cylindre, de la pyramide, du cône et de la sphère, repérage dans le pavé et sur la sphère terrestre, 8 exemples guidés) ; 15 SVG (3 anciens remplacés) générés avec `espace.py` (arêtes cachées calculées) ; patrons vérifiés par `cube_nets.py` ; 42 exercices (27 types, 15 atypiques), 100 % corrigés ; 212 → 609 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `cours-et-exercices.md.phase0.bak`, `figures-v01.bak/` |
| 07/10/2026 | 14 Aires, volumes | v0.2 | Cours réécrit (sens des unités, conversions de longueurs, d’aires et de volumes avec tableaux, litres et hectares, périmètre du cercle, formulaire des aires et leur origine, hauteurs dans les trois types de triangles, figures composées, volumes « base × hauteur » et « ÷ 3 » avec découpage du cube en trois pyramides, boule et sphère, aire latérale, $k$, $k^2$, $k^3$, durées, débit, masse volumique, kWh ; 10 exemples guidés) ; 9 SVG (3 anciens remplacés) ; 46 exercices (29 types, 17 atypiques), 100 % corrigés ; 241 → 603 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 08 Fonctions | v0.2 | Cours réécrit (machine, image / antécédent, quatre représentations dont le tableur, construction d’une courbe, lecture graphique, critère de la verticale, linéaire et proportionnalité, affine avec rôle de $a$ et $b$, accroissements, tracé, détermination de $a$ et $b$, comparaison de deux tarifs ; 7 exemples guidés) ; 10 vrais graphiques SVG (dossier `figures/` créé) ; 40 exercices (23 types, 17 atypiques), 100 % corrigés ; 353 → 498 lignes. Sauvegardes : `cours-et-exercices.md.bak` (origine), `cours-et-exercices.md.phase0.bak` (après corrections ponctuelles) |
| 07/10/2026 | Build | — | Le build vide chaque dossier `figures/` de destination dans `/workspace/compendium-maths-pour-pc/markdown/` avant d’y copier les SVG (plus jamais de figures obsolètes) ; export PC nettoyé et régénéré ; listes de figures source et export identiques. Sauvegarde : `build-compendium.js.bak-v2` |
| 07/10/2026 | Outils | — | `outils/figures/graphkit.py` (classe `Graph` extraite de 08) : titres d’axes à côté des pointes de flèche, plus de chevauchement avec les graduations (défaut « prix (€) » / 120 de `comparer-tarifs.svg`) ; tous les graphiques de 08 régénérés et relus. Une figure PNG par chapitre fini dans `outils/captures/NN-figure.png` (rétroactivement 08, 14, 15) |
| 07/10/2026 | 09 Géométrie plane | v0.2 | Cours réécrit (notations, positions de droites, propriétés P1–P3, distance à une droite, paires d’angles, parallèles et sécante avec réciproque, inégalité triangulaire et construction au compas, somme des angles avec preuve, triangles particuliers, triangles égaux ★★, médiatrice et cercle circonscrit, hauteurs, bissectrice, médianes, parallélogramme et famille des quadrilatères, cercle et tangente, angle inscrit ★★★, rédaction « on sait que / or / donc » ; 10 exemples guidés) ; 14 SVG (4 anciens remplacés) ; 45 exercices (29 types, 16 atypiques), 100 % corrigés ; 299 → 657 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 10 Transformations | v0.2 | Cours réécrit (vocabulaire image / invariant, symétrie axiale avec trois méthodes de construction, axes de symétrie, symétrie centrale et centre de symétrie, translation et parallélogramme, rotation, homothétie de rapport positif ou négatif avec $k^2$ pour les aires, tableau de ce qui est conservé, méthode pour reconnaître une transformation, frises et rosaces ; 6 exemples guidés ; vecteurs et compositions formelles retirés) ; 11 SVG (3 anciens remplacés), dont exercice sur quadrillage et son corrigé ; 39 exercices (23 types, 16 atypiques), 100 % corrigés ; 280 → 492 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 17 Probabilités | v0.2 | Cours réécrit (vocabulaire, échelle, équiprobabilité, roue et angles, contraire et incompatibles, arbres avec et sans remise, tableau des deux dés, « au moins un », fréquence et simulation ; 9 exemples guidés ; notations lycée $\Omega$, $\mathrm{Card}$, $\cup$, $\cap$ et conditionnelle retirées) ; 8 SVG (1 ancien remplacé), dont une simulation de 1 000 lancers à graine fixe ; 39 exercices (23 types, 16 atypiques), 100 % corrigés ; 207 → 487 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 16 Statistiques | v0.2 | Cours réécrit (vocabulaire, tableaux et effectifs cumulés, bâtons, circulaire, histogramme, graphique d’évolution, moyenne simple, pondérée et par classes, médiane avec effectifs cumulés, moyenne ou médiane, étendue, tableur, graphique trompeur ; 6 exemples guidés) ; 8 SVG (1 ancien remplacé) tracés avec `graphkit` (titres d’axes vérifiés sans chevauchement) ; 38 exercices (22 types, 16 atypiques), 100 % corrigés ; 211 → 464 lignes. Sauvegardes : `cours-et-exercices.md.bak`, `figures-v01.bak/` |
| 07/10/2026 | 05 Proportionnalité | v0.2 | Cours réécrit (reconnaître par les quotients et le graphique, trois cas types, quatre méthodes pour compléter un tableau, produit en croix, grandeurs quotients et vitesse avec graphique distance-temps, pourcentages avec double droite graduée, proportion en %, coefficient multiplicateur, évolutions successives et valeur de départ, ratios et partage proportionnel, échelles ; 7 exemples guidés) ; 7 SVG (dossier `figures/` créé) ; 47 exercices (30 types, 17 atypiques), 100 % corrigés ; 327 → 551 lignes. Sauvegardes : `cours-et-exercices.md.bak` (origine), `cours-et-exercices.md.phase0.bak` |
| 07/10/2026 | 06 Calcul littéral | v0.2 | Cours réécrit (motif évolutif et formule, conventions d’écriture, calcul d’une expression et test d’égalité, somme ou produit, réduction avec tuiles algébriques, distributivité simple et double par les aires, factorisation y compris par une parenthèse, identités remarquables dans les deux sens avec preuve par les aires, calcul mental, programmes de calcul « tester, conjecturer, prouver », pairs / impairs / multiples, contre-exemple ; 8 exemples guidés) ; 7 SVG (dossier `figures/` créé) ; 42 exercices (25 types, 17 atypiques), 100 % corrigés ; 374 → 517 lignes ; calculs vérifiés avec `sympy`. Sauvegarde : `cours-et-exercices.md.bak` |
| 07/10/2026 | 07 Équations | v0.2 | Cours réécrit (équation et solution, test, balance et règles de résolution, opérations inverses, inconnue des deux côtés, parenthèses et fractions, méthode de mise en équation avec modèle en barres, produit nul, $x^2 = a$ avec renvoi au chapitre 4, résolution graphique et au tableur, inéquations $ax \geqslant b$ avec changement de sens et droite graduée ; systèmes par substitution et combinaison, inéquations générales en ★★★ ; 8 exemples guidés) ; 8 SVG nouveaux (générateur `outils/figures/gen-07-equations.py`) ; 41 exercices (23 types, 18 atypiques dont 5 « trouver l’erreur »), 100 % corrigés, solutions recalculées par script (sympy) ; 375 → 491 lignes. Sauvegarde : `cours-et-exercices.md.bak`. Outil : `outils/capture-page.sh` (capture pleine page, remplace l’ancien script temporaire) ; `marked` réinstallé dans `~/.local/lib/node_modules` (build : `NODE_PATH=/home/box/.local/lib/node_modules`) |
| 07/10/2026 | 03 Relatifs | v0.2 | Cours réécrit (situations concrètes en tableau, signe et distance à zéro, opposés et $-(-a)$, droite graduée et méthode de lecture d’abscisse, comparaison, addition par déplacements puis jetons, règles, sommes de plusieurs termes, soustraction expliquée par les jetons, écriture simplifiée, distance entre deux points, règle des signes justifiée par une régularité, nombre de facteurs négatifs, $(-3)^2$ et $-3^2$, priorités ; 6 exemples guidés) ; 6 SVG nouveaux (générateur `outils/figures/gen-03-relatifs.py`) ; 41 exercices (22 types, 19 atypiques dont 5 « trouver l’erreur » et 4 problèmes en plusieurs étapes), 100 % corrigés, résultats recalculés par script ; 387 → 484 lignes. Sauvegardes conservées : `cours-et-exercices.md.bak` (origine) et `.phase0.bak` |
| 07/10/2026 | 01 Fractions | v0.2 | Cours réécrit (partage de l’unité et fraction supérieure à 1, quotient, placement sur demi-droite avec méthode, fractions égales, simplification pas à pas et par décomposition en facteurs premiers, comparaison, addition et soustraction par dénominateur commun, fraction d’une quantité, produit par le modèle d’aire, inverse et division, priorités, décimaux et pourcentages, fractions négatives, rationnels et irrationnels ; 7 exemples guidés) ; 7 SVG nouveaux (générateur `outils/figures/gen-01-fractions.py`) ; 42 exercices (23 types, 19 atypiques dont 5 « trouver l’erreur » et 4 problèmes en plusieurs étapes), 100 % corrigés, résultats recalculés par script (fractions exactes, recherche exhaustive pour L2) ; 395 → 475 lignes. Sauvegardes conservées : `cours-et-exercices.md.bak` (origine) et `.phase0.bak` |
| 07/10/2026 | 02 Entiers, décimaux | v0.2 | Cours réécrit (tableau de numération, chiffre et nombre de dizaines, × et ÷ par 10, 100, 1 000, décimaux et fractions décimales, zoom sur la droite graduée, comparaison, encadrement, opérations justifiées, ordre de grandeur, arrondi et troncature, division euclidienne, multiples et diviseurs, critères de divisibilité, **nombres premiers** avec crible et test jusqu’à la racine, **décomposition en facteurs premiers** et plus grand diviseur commun pour les problèmes de partage ; 8 exemples guidés) ; 6 SVG nouveaux (générateur `outils/figures/gen-02-entiers-decimaux.py`) ; 41 exercices (23 types, 18 atypiques dont 5 « trouver l’erreur » et 4 problèmes en plusieurs étapes), 100 % corrigés, résultats recalculés par script (sympy) ; 360 → 466 lignes. Racine carrée : définie au chapitre 04. Sauvegardes conservées : `cours-et-exercices.md.bak` (origine) et `.phase0.bak` |
| 07/10/2026 | 04 Puissances | v0.2 | Cours réécrit (définition, carré et cube, signe et priorités, puissances de 10 positives et négatives par la suite des divisions, préfixes et échelle des longueurs, exposant nul et négatif d’une base quelconque ★★, règles de calcul justifiées en comptant les facteurs, notation scientifique : méthode, calculs, comparaison, calculatrice ; carrés parfaits et **définition de la racine carrée** (côté d’un carré d’aire $a$), encadrement, valeurs approchées, $\sqrt{a+b} \neq \sqrt{a}+\sqrt{b}$, simplifications et irrationalité de $\sqrt{2}$ en ★★★ ; 7 exemples guidés) ; 6 SVG nouveaux (générateur `outils/figures/gen-04-puissances.py`) ; 40 exercices (22 types, 18 atypiques dont 5 « trouver l’erreur » et 4 problèmes en plusieurs étapes), 100 % corrigés, résultats recalculés par script ; 366 → 457 lignes. Titre du chapitre complété (« … et racine carrée ») dans le `.md` et dans la liste du build (sauvegarde `build-compendium.js.bak-v3`). Sauvegarde : `cours-et-exercices.md.bak` |
| 07/10/2026 | 11 Pythagore | v0.2 | § 1 « Rappel express » (carrés, définition de la racine carrée, simplification ★★★) remplacé par « Prérequis » avec renvoi au chapitre 4, § 6 ; conservés : l’encadré « Pourquoi on en a besoin » et l’erreur $\sqrt{9+16}$ ; prérequis et valeur exacte $c\sqrt{2}$ renvoient au chapitre 4 ; 581 → 562 lignes. Sauvegarde : `cours-et-exercices.md.pre-renvoi.bak` |
| 08/10/2026 | 01–17 | v0.3 | Relecture complète (§ 10) : ~640 résultats de corrigés recalculés par script (`outils/relecture/check-NN.py`, 0 corrigé faux), 1 erreur mathématique corrigée (15, angle de la perspective cavalière), 5 énoncés ambigus précisés, 4 renvois faux ou manquants corrigés, 2 indices ajoutés, 2 figures retouchées via leurs générateurs (12, 17) ; encadré « Prérequis. » et « Fiche-synthèse » harmonisés sur les 17 chapitres ; espace insécable après « § ». Sauvegardes `*.pre-relecture.bak`. Instantanés : `/workspace/releases/compendium-v0.2-20261007-2359.tar.gz` (avant) et `/workspace/releases/compendium-v0.3-20261008-0017.tar.gz` (après) |
| 08/10/2026 | 06, 07, 10, 16, 17 | v0.3.1 | Décisions du § 10.3 appliquées (§ 10.4) : séries renommées G→F, H→G, I→H, J→I dans 10, 16 et 17 par `outils/relecture/renommer-series.py` (128 remplacements, titres, numéros, corrigés, liens, fiches) ; contrôle `verifier-renvois-series.py` (0 renvoi cassé, aucune série sautée sur les 17 chapitres) ; 07 : mention datée du programme retirée ; 10 H3 : indice ; 06 : identités confirmées dans le cœur. Sauvegardes `*.pre-v031.bak`. Instantané `/workspace/releases/compendium-v0.3.1-20261008-0021.tar.gz` ; paquet utilisateur `/workspace/releases/compendium-maths-v0.3.zip` |

---

## 10. Relecture v0.3

Relecture du 7 au 8 octobre 2026, faite deux fois : en élève moyen (compréhension, sauts de difficulté, vocabulaire) et en enseignant exigeant (exactitude, renvois, étoiles, figures). Instantané avant : `/workspace/releases/compendium-v0.2-20261007-2359.tar.gz` ; après : `/workspace/releases/compendium-v0.3-20261008-0017.tar.gz`. Chaque fichier modifié a une copie `*.pre-relecture.bak` (chapitres, générateurs 12 et 17, ce plan).

### 10.1 Méthode et outils

- **Calculs** : tous les résultats chiffrés des exemples et des corrigés sont recalculés par `outils/relecture/check-01.py` … `check-17.py` (utilitaire commun `ck.py`, sympy pour l’algèbre). Bilan : **~640 résultats, 0 corrigé faux**. `patron-cube.py` simule le pliage des patrons de cube (15 C1) ; `check-fiches.py` vérifie les 16 nombres des fiches-synthèse.
- **Figures** : rendu PNG (`outils/svg2png.sh`) des figures d’exercices et de corrigés, comparé au texte. Les retouches passent par les générateurs `outils/figures/gen-NN-*.py` ; on vérifie ensuite (md5) que seul le SVG visé change.
- **Harmonisation** : `outils/relecture/appliquer-v03.py`. Ce script idempotent applique les corrections ponctuelles, remplace la ligne « Prérequis : » par un encadré `> **Prérequis.**` avec renvois (chapitre + §), ajoute la section « Fiche-synthèse » après « Liens » et met à jour le pied de page.
- **Contrôle final** : `verifier-chapitre.js` donne 0 point sur les 17 chapitres. Le build est OK (aucune `katex-error`) et des pages ont été capturées (05, 12, 15).

### 10.2 Bilan par chapitre

Tous les chapitres reçoivent trois changements communs : un encadré **Prérequis**, une **Fiche-synthèse** (5–6 compétences, exemple express, séries d’entraînement, 3 pièges) et un pied de page v0.3. Le tableau ne liste que ce qui s’y ajoute.

| Ch. | Corrections propres | Erreurs math. | Nature |
|---|---|---|---|
| 01 | 0 | 0 | 39 résultats revérifiés |
| 02 | 1 | 0 | J2 : indice ajouté (PPCM non nommé dans le cours : « plus petit multiple commun de 12 et 18 ») |
| 03 | 2 | 0 | § 1.2 : phrase contradictoire sur zéro réécrite (« seul nombre à la fois positif et négatif ; il s’écrit sans signe ») ; H3 : indice sur le milieu |
| 04 | 0 | 0 | Devient la référence « racine carrée » (§ 6) des chapitres 11 et 14 |
| 05 | 0 | 0 | 45 résultats revérifiés |
| 06 | 0 | 0 | Point à trancher (§ 10.3) |
| 07 | 0 | 0 | Point à trancher (§ 10.3) |
| 08 | 1 | 0 | Liens : ajout du chapitre 12 (fonction linéaire, droite par l’origine, $y/x$ constant) |
| 09 | 0 | 0 | Le prérequis Pythagore de l’exemple guidé 10 est désormais signalé |
| 10 | 0 | 0 | Figures d’exercice vérifiées par coordonnées |
| 11 | 3 | 0 | § 1 « Prérequis » renommé « Rappel » (doublon avec l’encadré) ; H3 : la canne de 1,30 m était *égale* à la diagonale du pavé ($\sqrt{16\,900} = 130$), donc le cas limite était ambigu. Elle passe à 1,28 m, et le corrigé ajoute que la canne ne tient dans aucune face (≈ 126,5 cm). Liens : ajout du chapitre 4 (§ 6) |
| 12 | 2 | 0 | Liens : ajout du chapitre 8 ; figure `agrandissement-quadrillage` : étiquette « 2 » recentrée (générateur) |
| 13 | 1 | 0 | § 6.1 : valeurs exactes ajoutées au texte (cos 45° = sin 45° = 1/√2 ≈ 0,707 ; cos 60° = sin 30° = 1/2 ; sin 60° = cos 30° = √3/2 ≈ 0,866) |
| 14 | 2 | 0 | Prérequis et Liens : la racine carrée renvoie au chapitre 4 (§ 6), et non plus au chapitre 11 (§ 1), qui n’en traite pas |
| 15 | 2 | **1** | § 2 (encadré « Erreur fréquente ») : l’angle $\widehat{ABC}$ dessiné était annoncé à 45°. Sur le dessin, il vaut **135°**, car la fuyante fait 45° avec le *prolongement* de $[AB]$ ; c’est ce que confirme la figure `cavaliere-regles`. Le texte est rectifié, avec l’explication, ainsi que le corrigé B4 c). Fiche : exemple « vues » clarifié |
| 16 | 2 | 0 | Médiane : « deux groupes de même effectif » remplacé par « au moins la moitié des valeurs de chaque côté » (exact avec des ex aequo) ; une phrase introduit le tableau du tableur |
| 17 | 3 | 0 | A1 b) et B1 c) : « supérieur / inférieur » remplacé par « strictement supérieur / inférieur » (en français, « supérieur à » inclut souvent l’égalité ; corrigés ajustés) ; figure `urne-roue` : étiquette « vert » dégagée de la flèche (générateur) |

**Totaux** : 1 erreur mathématique ; 0 corrigé faux ; 5 énoncés ambigus précisés (03, 11, 16, 17 ×2) ; 4 renvois faux ou manquants (08, 11, 12, 14) ; 2 indices pour des outils non enseignés (02, 03) ; 2 figures retouchées (12, 17) ; 2 ajouts de cours (13, 16) ; 1 doublon supprimé (11). Toutes les autres figures d’exercices relues (09, 10, 06, 03, 12, 13, 15, 16, 17) correspondent au texte.

### 10.3 Décisions réservées à Nguhma

1. **06** : garder les identités remarquables $(a \pm b)^2$ dans le cœur du cours ou les passer en ★★★ (le programme 2020 ne les impose pas en 3e).
2. **07** : la mention du « programme de 3e de 2026 » à propos de $ax \geqslant b$ est à vérifier. Le nouveau programme n’atteint la 3e qu’en 2028 ; il faut soit reformuler, soit retirer la date.
3. **10 I3** (devenu H3 en v0.3.1) : utilise la propriété du triangle 30–60–90, qui n’est pas enseignée explicitement. On peut ajouter un indice, ou laisser l’exercice en ★★★.
4. **09, exemple guidé 10** : utilise Pythagore avant le chapitre 11. C’est désormais signalé dans les prérequis ; il reste à choisir entre déplacer l’exemple et l’accepter.
5. **11 H3** : valider la nouvelle valeur 1,28 m. L’autre option est de garder 1,30 m et d’en faire un exercice sur le cas limite.
6. **12–13** : la quantité de contenus ★★★ est-elle raisonnable pour un élève moyen ? Les garder, les alléger, ou les regrouper dans « Pour aller plus loin ».
7. **Cosmétique** : les séries d’exercices sautent la lettre F dans 10, 16 et 17. Les renommer obligerait à reprendre les renvois ; c’est laissé en l’état.

### 10.4 Décisions tranchées (v0.3.1, 8 octobre 2026)

Nguhma a délégué l’arbitrage. Les décisions ci-dessous sont appliquées, avec les sauvegardes `*.pre-v031.bak`.

| Point | Décision | Application |
|---|---|---|
| 1. Ch. 06, identités remarquables | Restent dans le cœur du cours (programme de 3e), pas en ★★★ | § 7 conservé en ★★ ; ajout « au programme de 3e » dans la phrase d’introduction |
| 2. Ch. 07, programme daté | Retirer la date fausse | « … fait partie du programme de 3e de 2026 » devient « … reste dans le cœur du chapitre (§ 6, ★★) » |
| 3. Ch. 10, I3 (désormais H3) | Indice, reste en ★★★ | Indice : la hauteur issue de $A$ coupe $ABD$ en deux moitiés de triangle équilatéral |
| 4. Ch. 09, exemple guidé 10 | Laissé en place | Le prérequis Pythagore suffit |
| 5. Ch. 11, H3 | 1,28 m conservé | — |
| 6. Ch. 12–13, ★★★ | Laissés tels quels (étiquetés) | — |
| 7. Saut de la lettre F (10, 16, 17) | Renommer | G→F, H→G, I→H, J→I par `outils/relecture/renommer-series.py` (titres, numéros d’exercices, corrigés, renvois des « Liens », fiches-synthèse) ; contrôle `outils/relecture/verifier-renvois-series.py` : 158 renvois sur les 17 chapitres, 0 cassé, séries consécutives partout |

Correspondance pour les relecteurs qui utilisent d’anciens numéros (10, 16, 17) : ancienne série G = nouvelle F, H = G, I = H, J = I. Exemples : 10 I3 → H3, 17 H4 → G4. Les étiquettes des scripts `check-10.py`, `check-16.py` et `check-17.py` gardent l’ancienne numérotation.

Contrôles : `verifier-chapitre.js` à 0 point, build OK, aucune `katex-error`. Instantané : `/workspace/releases/compendium-v0.3.1-20261008-0021.tar.gz`. Paquet utilisateur hors ligne : `/workspace/releases/compendium-maths-v0.3.zip` (ouvrir `apercu/index.html`).

## 11. Alignement sur le programme 2026 (v0.11, 24 octobre 2026)

Source : annexe 2 du BO n° 10 du 5 mars 2026 (cycle 4), comparée au programme 2020 (BO n° 31 du 30 juillet 2020).
Calendrier : programme 2026 en 5e à la rentrée 2026, en 4e à la rentrée 2027, en 3e à la rentrée 2028.

**Repères visibles** (syntaxe `[[Programme 2026 · 5e]]` / `[[Programme 2020]]` dans le `.md`, rendue en pastille avec infobulle,
reprise dans le sommaire, ignorée par la recherche ; mêmes pastilles sur les cartes « S’entraîner », `src/practice/engine/prog.ts`) :

- **Programme 2026 · Ne** : notion ajoutée ou déplacée, avec le niveau où le programme 2026 la place.
- **Programme 2020** : notion absente du programme 2026, **conservée** (encore au programme des 4e jusqu’en juin 2027 et des 3e jusqu’en juin 2028). Explication dans l’appli (accueil, « Repères de programme ») et dans `README.md` du dossier `cours/`.

| Ch. | Ajouté (pastille 2026) | Repéré « Programme 2020 » |
|---|---|---|
| 03 | valeur absolue $\lvert a \rvert$ (5e), distance $\lvert b - a \rvert$, exercice A5 ; type « Valeur absolue » | — |
| 05 | nuage de points (5e), figure, exercice A5 | — |
| 07 | (repère seul) inéquations $ax \geqslant b$ (3e), étoiles inchangées | — |
| 09 | médiane et aires égales (5e), droite des milieux (4e, trois énoncés, preuve ★★★), D7–D9 | inégalité triangulaire (et C1), triangles égaux § 3.4 |
| 10 | vecteurs, vecteurs égaux, relation de Chasles, règle du parallélogramme (3e), C6–C9 ; type « Vecteurs » | rotation § 5 et ses exercices (B3, C2, G5, H1, H3, I2), homothétie § 6 et série D |
| 11 | contraposée du théorème de Pythagore (4e), G5 | — |
| 12 | contraposée du théorème de Thalès (3e) | agrandissement-réduction, triangles semblables § 5, série E |
| 14 | — | agrandissement-réduction § 5, série E |
| 15 | — | sections de pyramide et de cône § 5.2 (E4, G3, G4, I3), repérage dans le pavé et sur la sphère § 6, série F |
| 16 | quartiles, boîte à moustaches (3e), D6–D8 ; type « Quartiles » | histogramme § 2.3 (B3, H4) |
| 17 | notations $\Omega$, $\cup$, $\cap$, $\overline{A}$ (4e), $P(A \cup B) + P(A \cap B) = P(A) + P(B)$ (3e), fluctuation des fréquences (4e), C5–C7, E5 ; type « Réunion, intersection » | — |

**Automatismes** (appli, `#/automatismes`) : 39 types de questions flash (14 en 5e, 12 en 4e, 13 en 3e) tirés des listes
d’automatismes du programme 2026 ; 6 séances fixes de 10 questions par niveau + séance au hasard ; version papier
imprimable (corrigé sur page à part) et version en ligne (chronomètre facultatif de 12 min, sans calculatrice, score).
Aucun contenu d’algorithmique ; vocabulaire (« barres / bâtons », « évènement ») laissé tel quel.

**Reste à faire / à trancher par Nguhma :** relecture humaine des ajouts ; convention des quartiles (rang $\lceil N/4 \rceil$,
celle des manuels de collège ; les tableurs donnent parfois d’autres valeurs, remarque ajoutée en 16 § 4.4) ;
suppression effective des notions « Programme 2020 » après juin 2028.

