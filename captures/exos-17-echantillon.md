# Échantillon d’exercices générés — chapitre 17 (Probabilités, v0.5)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

## 1. Vocabulaire — ★

Adresse : `#/entrainement/17-probabilites/exo?t=vocabulaire&niv=1&g=1leynws` · cours : § 1 · Vocabulaire

**Vocabulaire des probabilités.**

Un sac contient des jetons numérotés de 1 à 20, indiscernables au toucher. On tire un jeton au hasard.  

1. a) L’événement « obtenir un nombre entier » est : → attendu : Certain (options : Impossible / Certain / Ni l’un ni l’autre)
   - Indice : Les issues possibles vont de 1 à 20. Combien le réalisent ?
   - Si « Impossible » : Au moins une issue le réalise.
   - Si « Ni l’un ni l’autre » : Toutes les issues le réalisent.
2. b) Contraire de « obtenir un multiple de 3 » : → attendu : obtenir un nombre qui n’est pas un multiple de 3 (options : obtenir un diviseur de 18 / obtenir 20 / obtenir un nombre qui n’est pas un multiple de 3)
   - Indice : Le contraire est réalisé exactement quand l’événement ne l’est pas.
   - Si « obtenir un diviseur de 18 » : Ce n’est pas « tout sauf » l’événement de départ.
   - Si « obtenir 20 » : Le contraire contient toutes les issues qui ne réalisent pas l’événement.
3. c) « Obtenir un nombre pair » et « obtenir un nombre impair » sont-ils incompatibles ? → attendu : Oui (options : Oui / Non)
   - Indice : Cherche une issue qui réalise les deux événements à la fois.
   - Si « Non » : Aucune issue ne réalise les deux.

**Corrigé**

> a) Certain : toutes les issues le réalisent.  
> b) Contraire : « obtenir un nombre qui n’est pas un multiple de 3 ».  
> c) Oui : aucune issue ne réalise les deux.  

Réponse : a) Certain : toutes les issues le réalisent. b) Contraire : « obtenir un nombre qui n’est pas un multiple de 3 ». c) Oui : aucune issue ne réalise les deux.

## 2. Calculer une probabilité — ★

Adresse : `#/entrainement/17-probabilites/exo?t=equiprobable&niv=1&g=r4kuea` · cours : § 2.2 · Équiprobabilité

**Calculer une probabilité.**

Un sac contient des jetons numérotés de 1 à 20, indiscernables au toucher. On tire un jeton au hasard.  
Les 20 jetons ont la même chance d’être tirés.  

1. a) Probabilité d’obtenir un nombre inférieur ou égal à 13 ? → attendu :  $0{,}65$
   - Indice : Liste les issues favorables, puis divise leur nombre par 20.
   - Erreur typique (réponse 20/13) : Inversé : favorables sur possibles.
2. b) Probabilité d’obtenir un carré parfait ? → attendu :  $0{,}2$
   - Indice : Liste les issues favorables, puis divise leur nombre par 20.
   - Erreur typique (réponse 5) : Inversé : favorables sur possibles.
   - Erreur typique (réponse 1/4) : On divise par le nombre total d’issues (20), pas par le nombre d’issues défavorables.

**Corrigé**

> a) Issues favorables : 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, soit 13 : $\dfrac{13}{20}$.  
> b) Issues favorables : 1, 4, 9, 16, soit 4 : $\dfrac{4}{20} = \dfrac{1}{5}$.  

Réponse : \dfrac{13}{20} ; \dfrac{1}{5}

## 3. Calculer une probabilité — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=equiprobable&niv=2&g=ek1o1v` · cours : § 2.2 · Équiprobabilité

**Calculer une probabilité.**

On lance un dé équilibré à douze faces, numérotées de 1 à 12.  
Le dé est équilibré : les 12 faces sont équiprobables.  

1. a) Probabilité d’obtenir un multiple de 4 ? → attendu :  $0{,}25$
   - Indice : Liste les issues favorables, puis divise leur nombre par 12.
   - Erreur typique (réponse 4) : Inversé : favorables sur possibles.
   - Erreur typique (réponse 1/3) : On divise par le nombre total d’issues (12), pas par le nombre d’issues défavorables.
2. b) Probabilité d’obtenir un nombre pair **ou** un carré parfait ? → attendu :  $\dfrac{2}{3}$
   - Indice : Liste les issues qui réalisent l’un ou l’autre (ou les deux), sans en compter deux fois.
   - Erreur typique (réponse 3/4) : 4 est compté deux fois : les événements ne sont pas incompatibles.
3. c) Probabilité de ne pas obtenir un multiple de 4 ? → attendu :  $0{,}75$
   - Indice : Contraire : 1 − la probabilité trouvée au a).
   - Erreur typique (réponse 1/4) : C’est la probabilité de l’événement, pas de son contraire.

**Corrigé**

> a) Issues favorables : 4, 8, 12, soit 3 : $\dfrac{3}{12} = \dfrac{1}{4}$.  
> b) Issues 1, 2, 4, 6, 8, 9, 10, 12 : $\dfrac{8}{12} = \dfrac{2}{3}$ (4 compté une seule fois).  
> c) $1 - \dfrac{1}{4} = \dfrac{3}{4}$.  

Réponse : \dfrac{1}{4} ; \dfrac{2}{3} ; \dfrac{3}{4}

## 4. Urnes — ★

Adresse : `#/entrainement/17-probabilites/exo?t=urne&niv=1&g=qj36t1` · cours : § 2.2 · Équiprobabilité

**Tirer une boule.**

Une urne contient $3$ boules jaunes, $1$ boule rouge, $2$ boules bleues, indiscernables au toucher. On tire une boule au hasard.  

1. a) $P(\text{bleue})$ ? → attendu :  $\dfrac{1}{3}$
   - Indice : Il y a 6 boules équiprobables, dont 2 bleues.
   - Erreur typique (réponse 1/2) : Divise par le nombre total de boules (6).
2. b) $P(\text{pas jaune})$ ? → attendu :  $0{,}5$
   - Indice : Contraire : 1 − la probabilité de cette couleur.
   - Erreur typique (réponse 2/3) : Compte les boules, pas les couleurs.
3. c) $P(\text{verte})$ ? → attendu :  $0$
   - Indice : Y a-t-il des boules vertes ?

**Corrigé**

> $3 + 1 + 2 = 6$ boules, tirées au hasard : elles sont équiprobables.  
> a) $P(\text{bleue}) = \dfrac{2}{6} = \dfrac{1}{3}$.  
> b) « Pas jaune » est le contraire : $1 - \dfrac{3}{6} = \dfrac{3}{6} = \dfrac{1}{2}$.  
> c) Aucune boule verte : événement impossible, probabilité $0$.  

Réponse : \dfrac{1}{3} ; \dfrac{1}{2} ; 0

## 5. Urnes — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=urne&niv=2&g=wuv2tb` · cours : § 2.2 · Équiprobabilité

**Retrouver la composition.**

Une urne contient $36$ boules, rouges ou noires. La probabilité de tirer une boule rouge est $\dfrac{1}{3}$.  

1. a) Combien y a-t-il de boules rouges ? → attendu :  $12$
   - Indice : $\dfrac{1}{3}$ des 36 boules.
   - Erreur typique (réponse 1) : Ce n’est pas le numérateur : il faut $\dfrac{1}{3}$ de 36.
2. b) On ajoute $3$ boules rouges. Nouvelle probabilité de tirer une boule rouge ? → attendu :  $\dfrac{5}{13}$
   - Indice : Il y a maintenant 15 boules rouges… et 39 boules en tout.
   - Erreur typique (réponse 5/12) : Le nombre total de boules a aussi changé : 39.
   - Erreur typique (réponse 16/39) : Recompte les boules plutôt que d’additionner des probabilités.

**Corrigé**

> a) $\dfrac{1}{3} \times 36 = 12$ boules rouges.  
> b) $15$ boules rouges sur $39$ : $\dfrac{15}{39} = \dfrac{5}{13}$.  

Réponse : 12 ; \dfrac{5}{13}

## 6. Urnes — ★★★

Adresse : `#/entrainement/17-probabilites/exo?t=urne&niv=3&g=1r6dih1` · cours : § 2.2 · Équiprobabilité

**Retrouver une urne.**

Une urne contient des boules rouges, vertes et bleues. On sait que $P(\text{rouge}) = \dfrac{1}{6}$, $P(\text{verte}) = \dfrac{1}{4}$ et qu’il y a $56$ boules bleues.  

1. a) $P(\text{bleue})$ ? → attendu :  $\dfrac{7}{12}$
   - Indice : La somme des probabilités des trois couleurs vaut 1.
   - Erreur typique (réponse 5/12) : Ça, c’est la probabilité de « rouge ou verte » : prends le contraire.
2. b) Combien y a-t-il de boules en tout ? → attendu :  $96$
   - Indice : Les 56 boules bleues représentent $\dfrac{7}{12}$ des boules.
   - Erreur typique (réponse 56) : Ça, ce sont les bleues seulement.
   - Erreur typique (réponse 98/3) : On divise 56 par $\dfrac{7}{12}$, on ne multiplie pas.
3. c) Combien de boules rouges et de boules vertes ? → attendu : Rouges : $16$ ; Vertes : $24$
   - Indice : $\dfrac{1}{6}$ et $\dfrac{1}{4}$ du total.

**Corrigé**

> a) $P(\text{bleue}) = 1 - \dfrac{1}{6} - \dfrac{1}{4} = \dfrac{7}{12}$.  
> b) $56 \div \dfrac{7}{12} = 96$ boules.  
> c) $\dfrac{96}{6} = 16$ rouges, $\dfrac{96}{4} = 24$ vertes ; contrôle : $16 + 24 + 56 = 96$.  

Réponse : \dfrac{7}{12} ; 96 ; 16 et 24

## 7. Jeu de 32 cartes — ★

Adresse : `#/entrainement/17-probabilites/exo?t=cartes&niv=1&g=1y2z8p6` · cours : § 3 · Règles de calcul

**Tirer une carte.**

On tire une carte au hasard dans un jeu de 32 cartes (pique, cœur, carreau, trèfle ; dans chaque couleur : 7, 8, 9, 10, valet, dame, roi, as).  

1. a) Probabilité de tirer un valet ? → attendu :  $\dfrac{1}{8}$
   - Indice : Compte les cartes qui conviennent parmi les 32.
2. b) Probabilité de tirer un 10 ? → attendu :  $\dfrac{1}{8}$
   - Indice : Compte les cartes qui conviennent parmi les 32.
3. c) Probabilité de tirer la dame de carreau ? → attendu :  $\dfrac{1}{32}$
   - Indice : Une seule carte convient.
   - Erreur typique (réponse 1/16) : Une seule carte est à la fois de cette hauteur et de cette couleur.

**Corrigé**

> a) 4 cartes : $\dfrac{4}{32} = \dfrac{1}{8}$.  
> b) 4 cartes : $\dfrac{4}{32} = \dfrac{1}{8}$.  
> c) Une seule carte : $\dfrac{1}{32}$.  

Réponse : \dfrac{1}{8} ; \dfrac{1}{8} ; \dfrac{1}{32}

## 8. Jeu de 32 cartes — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=cartes&niv=2&g=14rv2xy` · cours : § 3 · Règles de calcul

**Tirer une carte.**

On tire une carte au hasard dans un jeu de 32 cartes (pique, cœur, carreau, trèfle ; dans chaque couleur : 7, 8, 9, 10, valet, dame, roi, as).  

1. a) Probabilité de tirer un roi ou un valet ? → attendu :  $0{,}25$
   - Indice : Une carte ne peut pas être les deux à la fois : les probabilités s’additionnent.
   - Erreur typique (réponse 1/8) : Additionne les deux probabilités.
2. b) Probabilité de tirer un carreau ou une dame ? → attendu :  $\dfrac{11}{32}$
   - Indice : Attention : certaines cartes sont les deux à la fois (il y en a 1).
   - Erreur typique (réponse 3/8) : Tu as compté deux fois la carte qui est les deux à la fois.
3. c) Probabilité de ne pas tirer un roi ? → attendu :  $\dfrac{7}{8}$
   - Indice : Contraire : 1 − la probabilité de l’événement.
   - Erreur typique (réponse 1/8) : Ça, c’est la probabilité de l’événement lui-même.

**Corrigé**

> a) Incompatibles : $\dfrac{4}{32} + \dfrac{4}{32} = \dfrac{8}{32} = \dfrac{1}{4}$.  
> b) Pas incompatibles : 8 + 4 − 1 = 11 cartes, $\dfrac{11}{32}$.  
> c) $1 - \dfrac{4}{32} = \dfrac{28}{32} = \dfrac{7}{8}$.  

Réponse : \dfrac{1}{4} ; \dfrac{11}{32} ; \dfrac{7}{8}

## 9. Roue de loterie — ★

Adresse : `#/entrainement/17-probabilites/exo?t=roue&niv=1&g=1bdot3c` · cours : § 2.3 · Roue

**Faire tourner la roue.**

La roue est bien équilibrée ; la flèche s’arrête au hasard.  

![figure](exos-17-figures/09-roue.svg)

1. a) $P(\text{vert})$ ? → attendu :  $0{,}25$
   - Indice : $\dfrac{\text{angle}}{360}$.
   - Erreur typique (réponse 9/10) : Un tour complet fait 360°, pas 100.
2. b) $P(\text{rouge})$ ? → attendu :  $0{,}25$
   - Indice : $\dfrac{\text{angle}}{360}$.
   - Erreur typique (réponse 9/10) : Un tour complet fait 360°, pas 100.
3. c) Probabilité de ne pas tomber sur vert ? → attendu :  $0{,}75$
   - Indice : Contraire.
   - Erreur typique (réponse 1/4) : C’est l’événement lui-même.

**Corrigé**

> a) $P(\text{vert}) = \dfrac{90}{360} = \dfrac{1}{4}$.  
> b) $P(\text{rouge}) = \dfrac{90}{360} = \dfrac{1}{4}$.  
> c) $1 - \dfrac{1}{4} = \dfrac{3}{4}$.  

Réponse : \dfrac{1}{4} ; \dfrac{1}{4} ; \dfrac{3}{4}

## 10. Roue de loterie — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=roue&niv=2&g=eiqims` · cours : § 2.3 · Roue

**Fabriquer une roue.**

On veut fabriquer une roue de loterie à trois couleurs telle que $P(\text{jaune}) = \dfrac{3}{10}$ et que le violet soit deux fois plus probable que l’orange.  

1. a) Angles des secteurs ? → attendu : Jaune : $108$ ° ; Orange : $84$ ° ; Violet : $168$ °
   - Indice : Jaune : $\dfrac{3}{10}$ de 360°. Il reste $252^\circ$ à partager en une part (orange) et 2 parts (violet).
   - Erreur typique (réponses 108 ; 168 ; 84) : Inversé : le violet est 2 fois plus grand que l’orange.
2. b) Vérifie : $P(\text{violet})$ ? → attendu :  $\dfrac{7}{15}$
   - Indice : Angle ÷ 360.
   - Erreur typique (réponse 2/3) : Pense au jaune : violet et orange ne se partagent que ce qui reste.

**Corrigé**

> Jaune : $\dfrac{3}{10} \times 360 = 108^\circ$.  
> Il reste $252^\circ$ = orange + 2 × orange = 3 × orange, donc orange $252 \div 3 = 84^\circ$ et violet $168^\circ$.  
> Contrôle : $P(\text{violet}) = \dfrac{168}{360} = \dfrac{7}{15} = 2 \times \dfrac{7}{30}$.  

Réponse : 108° ; 84° ; 168°

## 11. Contraire et somme des probabilités — ★

Adresse : `#/entrainement/17-probabilites/exo?t=contraire&niv=1&g=5hi9ug` · cours : § 3 · Règles de calcul

**L’événement contraire.**

1. a) $P(A) = 0{,}2$. Calcule $P(\text{non A})$. → attendu :  $0{,}8$
   - Indice : $P(\text{non A})$ = 1 − $P(A)$.
   - Erreur typique (réponse 1/5) : C’est P(A) : prends le complément à 1.
2. b) La probabilité qu’une ampoule soit défectueuse est $59\,\%$. Quelle est la probabilité qu’elle fonctionne (en %) ? → attendu :  $41$ %
   - Indice : En pourcentage, le total fait 100 %.
   - Erreur typique (réponse 59) : C’est la probabilité de départ : prends le complément à 100.
3. c) $P(B) = \dfrac{4}{9}$. Calcule $P(\text{non B})$. → attendu :  $\dfrac{5}{9}$
   - Indice : Écris 1 sous la forme $\dfrac{9}{9}$.
   - Erreur typique (réponse 5/4) : Le dénominateur ne change pas.

**Corrigé**

> a) $1 - 0{,}2 = 0{,}8$.  
> b) $100 - 59 = 41$ %.  
> c) $1 - \dfrac{4}{9} = \dfrac{9}{9} - \dfrac{4}{9} = \dfrac{5}{9}$.  

Réponse : 0{,}8 ; 41 % ; \dfrac{5}{9}

## 12. Contraire et somme des probabilités — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=contraire&niv=2&g=14uhudb` · cours : § 3 · Règles de calcul

**Un dé truqué.**

Un dé est truqué. Le tableau donne la probabilité de chaque face, sauf une.  

$$\begin{array}{|l|c|c|c|c|c|c|}\hline \text{Face} & 1 & 2 & 3 & 4 & 5 & 6 \\ \hline \text{Probabilité} & 0{,}1 & 0{,}2 & 0{,}15 & 0{,}15 & 0{,}15 & ? \\ \hline\end{array}$$

1. a) Probabilité d’obtenir 6 ? → attendu :  $0{,}25$
   - Indice : La somme des probabilités des six faces vaut 1.
   - Erreur typique (réponse 1/6) : Le dé est truqué : les faces ne sont pas équiprobables.
2. b) Probabilité d’obtenir un nombre supérieur ou égal à 4 ? → attendu :  $0{,}55$
   - Indice : Additionne les probabilités des faces 4, 5, 6 (issues incompatibles).
   - Erreur typique (réponse 1/2) : Le dé est truqué : additionne les probabilités du tableau.
3. c) Peut-on avoir deux événements incompatibles $C$ et $D$ avec $P(C) = 0{,}6$ et $P(D) = 0{,}5$ ? → attendu : Non (options : Oui / Non)
   - Indice : Incompatibles : $P(C \text{ ou } D) = P(C) + P(D)$, qui ne peut pas dépasser 1.
   - Si « Oui » : $0{,}6 + 0{,}5 = 1{,}1 > 1$ : impossible.

**Corrigé**

> a) $1 - (0{,}1 + 0{,}2 + 0{,}15 + 0{,}15 + 0{,}15) = 0{,}25$.  
> b) $0{,}15 + 0{,}15 + 0{,}25 = 0{,}55$.  
> c) Non : on aurait $P(C \text{ ou } D) = 1{,}1 > 1$.  

Réponse : 0{,}25 ; 0{,}55 ; non

## 13. Arbre : deux épreuves — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=arbre&niv=2&g=1dnf7w0` · cours : § 4.1 · Arbre

**Deux tirages avec remise.**

Une urne contient $7$ boules rouges (R) et $6$ boules bleues (B). On tire successivement deux boules **avec remise**.  

![figure](exos-17-figures/13-arbre.svg)

1. a) $P(\text{deux rouges})$ ? → attendu :  $\dfrac{49}{169}$
   - Indice : Multiplie les probabilités le long du chemin.
   - Erreur typique (réponse 7/26) : Avec remise, l’urne est la même au second tirage.
   - Erreur typique (réponse 7/13) : On multiplie le long d’un chemin, on n’additionne pas.
2. b) $P(\text{deux boules de la même couleur})$ ? → attendu :  $\dfrac{85}{169}$
   - Indice : Deux chemins : RR et BB.
   - Erreur typique (réponse 49/169) : Il y a deux chemins : additionne-les.

**Corrigé**

> Avec remise : l’urne est la même au second tirage.  
> a) $\dfrac{7}{13} \times \dfrac{7}{13} = \dfrac{49}{169}$.  
> b) $\dfrac{7}{13} \times \dfrac{7}{13} + \dfrac{6}{13} \times \dfrac{6}{13} = \dfrac{85}{169}$.  
> Contrôle : les quatre feuilles font $\dfrac{49 + 42 + 42 + 36}{169} = 1$.  

Réponse : \dfrac{49}{169} ; \dfrac{85}{169}

## 14. Arbre : deux épreuves — ★★★

Adresse : `#/entrainement/17-probabilites/exo?t=arbre&niv=3&g=11680py` · cours : § 4.1 · Arbre

**Répondre au hasard.**

On répond au hasard à $6$ questions vrai/faux.  

1. a) Probabilité de n’obtenir que des mauvaise réponses ? → attendu :  $\dfrac{1}{64}$
   - Indice : Un seul chemin : $\dfrac{1}{2}$ à chaque lancer.
   - Erreur typique (réponse 1/12) : On multiplie les probabilités, on ne les additionne pas.
2. b) Probabilité d’obtenir au moins un bonne réponse ? → attendu :  $\dfrac{63}{64}$
   - Indice : Contraire de « que des mauvaise réponses ».
   - Erreur typique (réponse 1/2) : Passe par le contraire.

**Corrigé**

> a) $\left(\dfrac{1}{2}\right)^6 = \dfrac{1}{64}$.  
> b) $1 - \dfrac{1}{64} = \dfrac{63}{64}$.  

Réponse : \dfrac{1}{64} ; \dfrac{63}{64}

## 15. Deux dés, tableaux, dénombrement — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=tableau&niv=2&g=1l8lewm` · cours : § 4.3 · Tableau à double entrée

**Un jeu équitable ?**

Zoé et Noah lancent deux dés équilibrés. Zoé gagne si la somme vaut 4, 5 ou 6 ; sinon, Noah gagne.  

1. a) Probabilité que Zoé gagne ? → attendu :  $\dfrac{1}{3}$
   - Indice : Sommes 4, 5, 6 : compte les cases.
   - Erreur typique (réponse 3/11) : Les sommes ne sont pas équiprobables : compte les 36 cases.
2. b) Le jeu est-il équitable ? → attendu : Non, il avantage Noah (options : Non, il avantage Zoé / Non, il avantage Noah / Oui)
   - Indice : Équitable : chacun a une probabilité 1/2 de gagner.
   - Si « Non, il avantage Zoé » : $\dfrac{1}{3}$ < $\dfrac{1}{2}$.
   - Si « Oui » : Il faudrait 18 cases sur 36 pour chacun.

**Corrigé**

> a) 3 + 4 + 5 = 12 cases : $P(\text{Zoé gagne}) = \dfrac{12}{36} = \dfrac{1}{3}$.  
> b) $P(\text{Noah gagne}) = 1 - \dfrac{1}{3} = \dfrac{2}{3}$ : le jeu avantage Noah.  

Réponse : \dfrac{1}{3} ; avantage Noah

## 16. Fréquence et probabilité — ★

Adresse : `#/entrainement/17-probabilites/exo?t=frequence&niv=1&g=895x1z` · cours : § 6 · Fréquence et probabilité

**Fréquence observée.**

On lance un dé équilibré à 4 faces $1000$ fois ; on obtient $243$ fois « le 4 ».  

1. a) Fréquence de « le 4 » (en écriture décimale) ? → attendu :  $\dfrac{243}{1000}$
   - Indice : $\dfrac{243}{1000}$.
   - Erreur typique (réponse 1000/243) : Inversé : nombre de fois ÷ nombre d’essais.
   - Erreur typique (réponse 243) : Ça, c’est l’effectif.
2. b) Écart entre cette fréquence et la probabilité $0{,}25$ ? → attendu :  $\dfrac{7}{1000}$
   - Indice : Plus grande moins plus petite.

**Corrigé**

> a) $\dfrac{243}{1000} = 0{,}243$.  
> b) $0{,}25 - 0{,}243 = 0{,}007$ : sur 1000 essais, la fréquence est proche de la probabilité.  

Réponse : 0{,}243 ; 0{,}007

## 17. Fréquence et probabilité — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=frequence&niv=2&g=19ychog` · cours : § 6 · Fréquence et probabilité

**Estimer une probabilité.**

On lance $1000$ fois un gobelet : on observe $636$ fois « sur le côté ».  

1. a) Estime $P(\text{debout ou à l’envers})$, arrondie au centième. → attendu : ≈ $0{,}36$
   - Indice : Fréquence de « debout ou à l’envers » = 1 − fréquence de « sur le côté ».
   - Erreur typique (réponse 16/25) : Ça, c’est la fréquence de « sur le côté ».
   - Erreur typique (réponse 1/2) : Les deux positions ne sont pas équiprobables : utilise la fréquence observée.
2. b) Théo lance 10 fois une pièce et obtient 8 piles. Théo en conclut que la pièce est truquée. A-t-il raison ? → attendu : Non : sur 10 lancers, la fréquence peut s’éloigner beaucoup de 0,5 (options : Non : sur 10 lancers, la fréquence peut s’éloigner beaucoup de 0,5 / Oui : face est maintenant plus probable / Oui : la fréquence est trop loin de 0,5)
   - Indice : La fréquence ne se stabilise que sur un grand nombre d’essais.
   - Si « Oui : face est maintenant plus probable » : La pièce n’a pas de mémoire.
   - Si « Oui : la fréquence est trop loin de 0,5 » : Sur si peu de lancers, de tels écarts arrivent souvent.
3. c) On vient d’obtenir 5 fois pile de suite avec une pièce équilibrée. Au lancer suivant : → attendu : pile et face ont toujours la même probabilité (options : face est plus probable / pile est plus probable / pile et face ont toujours la même probabilité)
   - Indice : La pièce se souvient-elle des lancers précédents ?
   - Si « face est plus probable » : Le hasard ne « compense » pas : la pièce n’a pas de mémoire.
   - Si « pile est plus probable » : Les lancers sont indépendants : ni l’un ni l’autre n’est favorisé.

**Corrigé**

> a) Fréquence de « debout ou à l’envers » : $1 - \dfrac{636}{1000} = 0{,}364$ ; sur 1000 lancers, $P(\text{debout ou à l’envers}) \approx 0{,}36$.  
> b) Non : 10 lancers, c’est trop peu pour conclure ; il en faudrait beaucoup plus.  
> c) La pièce n’a pas de mémoire : $P(\text{face}) = \dfrac{1}{2}$ à chaque lancer.  

Réponse : ≈ 0,36

## 18. Trouver l’erreur — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=erreur&niv=2&g=14ro2qn` · cours : § 2.2 · Équiprobabilité

**Trouve l’erreur.**

Une urne contient 3 boules vertes, 6 boules rouges, 4 boules jaunes. Tom écrit : « Il y a trois couleurs, donc $P(\text{verte}) = \dfrac{1}{3}$. »  

1. a) Quelle est l’erreur ? → attendu : Les issues qu’il compte ne sont pas équiprobables. (options : Les issues qu’il compte ne sont pas équiprobables. / Il a compté deux fois les issues communes. / Il a calculé comme s’il y avait remise. / Il croit que le hasard a de la mémoire.)
   - Indice : Les issues sont-elles équiprobables ? Y a-t-il remise ? Des issues comptées deux fois ?
   - Si « Il a compté deux fois les issues communes. » : Relis son raisonnement : ce n’est pas là que ça coince.
   - Si « Il a calculé comme s’il y avait remise. » : Relis son raisonnement : ce n’est pas là que ça coince.
   - Si « Il croit que le hasard a de la mémoire. » : Relis son raisonnement : ce n’est pas là que ça coince.
2. b) Quelle est la vraie probabilité ? → attendu :  $\dfrac{3}{13}$
   - Indice : Compte les boules, pas les couleurs.
   - Erreur typique (réponse 1/3) : C’est l’erreur.

**Corrigé**

> Ce sont les boules qui sont équiprobables, pas les couleurs.  
> $\dfrac{3}{13}$.  

Réponse : \dfrac{3}{13}

## 19. Vocabulaire — ★

Adresse : `#/entrainement/17-probabilites/exo?t=vocabulaire&niv=1&g=1vlqha9` · cours : § 1 · Vocabulaire

**Vocabulaire des probabilités.**

On lance un dé équilibré à six faces.  

1. a) L’événement « obtenir 2 » est : → attendu : Ni l’un ni l’autre (options : Impossible / Certain / Ni l’un ni l’autre)
   - Indice : Les issues possibles vont de 1 à 6. Combien le réalisent ?
   - Si « Impossible » : Au moins une issue le réalise.
   - Si « Certain » : Au moins une issue ne le réalise pas.
2. b) Contraire de « obtenir un multiple de 3 » : → attendu : obtenir un nombre qui n’est pas un multiple de 3 (options : obtenir un nombre qui n’est pas un multiple de 3 / obtenir un nombre impair / obtenir 6)
   - Indice : Le contraire est réalisé exactement quand l’événement ne l’est pas.
   - Si « obtenir un nombre impair » : Ce n’est pas « tout sauf » l’événement de départ.
   - Si « obtenir 6 » : Le contraire contient toutes les issues qui ne réalisent pas l’événement.
3. c) « Obtenir un nombre inférieur ou égal à 2 » et « obtenir un nombre impair » sont-ils incompatibles ? → attendu : Non (options : Oui / Non)
   - Indice : Cherche une issue qui réalise les deux événements à la fois.
   - Si « Oui » : 1 réalise les deux.

**Corrigé**

> a) Ni l’un ni l’autre : certaines issues le réalisent, d’autres non.  
> b) Contraire : « obtenir un nombre qui n’est pas un multiple de 3 ».  
> c) Non : 1 réalise les deux.  

Réponse : a) Ni l’un ni l’autre : certaines issues le réalisent, d’autres non. b) Contraire : « obtenir un nombre qui n’est pas un multiple de 3 ». c) Non : 1 réalise les deux.

## 20. Calculer une probabilité — ★★

Adresse : `#/entrainement/17-probabilites/exo?t=equiprobable&niv=2&g=1ajvmtp` · cours : § 2.2 · Équiprobabilité

**Calculer une probabilité.**

Un sac contient des jetons numérotés de 1 à 15, indiscernables au toucher. On tire un jeton au hasard.  
Les 15 jetons ont la même chance d’être tirés.  

1. a) Probabilité d’obtenir un nombre inférieur ou égal à 6 ? → attendu :  $0{,}4$
   - Indice : Liste les issues favorables, puis divise leur nombre par 15.
   - Erreur typique (réponse 5/2) : Inversé : favorables sur possibles.
   - Erreur typique (réponse 2/3) : On divise par le nombre total d’issues (15), pas par le nombre d’issues défavorables.
2. b) Probabilité d’obtenir un diviseur de 24 **ou** un nombre pair ? → attendu :  $0{,}6$
   - Indice : Liste les issues qui réalisent l’un ou l’autre (ou les deux), sans en compter deux fois.
   - Erreur typique (réponse 14/15) : 2, 4, 6, 8, 12 sont comptés deux fois : les événements ne sont pas incompatibles.
3. c) Probabilité de ne pas obtenir un nombre inférieur ou égal à 6 ? → attendu :  $0{,}6$
   - Indice : Contraire : 1 − la probabilité trouvée au a).
   - Erreur typique (réponse 2/5) : C’est la probabilité de l’événement, pas de son contraire.

**Corrigé**

> a) Issues favorables : 1, 2, 3, 4, 5, 6, soit 6 : $\dfrac{6}{15} = \dfrac{2}{5}$.  
> b) Issues 1, 2, 3, 4, 6, 8, 10, 12, 14 : $\dfrac{9}{15} = \dfrac{3}{5}$ (2, 4, 6, 8, 12 comptés une seule fois).  
> c) $1 - \dfrac{2}{5} = \dfrac{3}{5}$.  

Réponse : \dfrac{2}{5} ; \dfrac{3}{5} ; \dfrac{3}{5}
