# Échantillon d’exercices générés — chapitre 11 (Théorème de Pythagore, v0.4)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

**Relecture (9 oct. 2026, soir).** Échantillon relu en entier, figures regardées sur téléphone (captures `mobile-*-exos-11-*`).
Corrigé à la relecture : figures retournées (pavé vu « par en dessous », échelle et poteau dessinés vers le bas, bateau vers le sud)
— orientation corrigée ; « H » qui chevauchait la longueur de la base ; arrondis écrits avec tous leurs chiffres (« 18,0 cm »,
pas « 18 cm ») ; « arrondi au dixième » en mètres → « au décimètre » ; valeurs fautives irrationnelles (√ d’une somme)
comparées à l’arrondi demandé ; réciproque ★★★ : la perturbation « presque rectangle » modifiait le mauvais côté ;
erreurs « s’est trompé(e) » accordées ; taille d’écran en pouces : tolérance ramenée à ±0,5 et tailles ambiguës exclues ;
milliers : pas d’espace dans les nombres à 4 chiffres (comme le cours).

## 1. Repérer l’hypoténuse — ★

Adresse : `#/entrainement/11-pythagore/exo?t=hypotenuse&niv=1&g=s19ua7` · cours : § 2 · L’hypoténuse

**Le triangle $MNP$ est rectangle en $N$.**

![figure](exos-11-figures/01-hypotenuse.svg)

1. Quelle est l’hypoténuse ? → attendu : $[MP]$ (options : $[NP]$ / $[MP]$ / $[MN]$)
   - Indice : Repère l’angle droit (en $N$) : l’hypoténuse est le côté qui ne touche pas ce sommet.
   - Si « $[NP]$ » : $[NP]$ touche le sommet $N$ de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.
   - Si « $[MN]$ » : $[MN]$ touche le sommet $N$ de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.
2. Quelle égalité donne le théorème de Pythagore ? → attendu : $MP^2 = MN^2 + NP^2$ (options : $MP^2 = MN^2 + NP^2$ / $MN^2 = NP^2 + MP^2$ / $NP^2 = MN^2 + MP^2$)
   - Indice : « hypoténuse² = côté² + côté² ».
   - Si « $MN^2 = NP^2 + MP^2$ » : Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est $[MP]$.
   - Si « $NP^2 = MN^2 + MP^2$ » : Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est $[MP]$.

**Corrigé**

> L’angle droit est en $N$ : l’hypoténuse est le côté formé par les deux autres lettres, $[MP]$.  
> D’après le théorème de Pythagore : $MP^2 = MN^2 + NP^2$.  
> Contrôle : sur la figure, $[MP]$ est bien le plus long côté.  

Réponse : $[MP]$ ; $MP^2 = MN^2 + NP^2$

## 2. Repérer l’hypoténuse — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=hypotenuse&niv=2&g=249qez` · cours : § 2 · L’hypoténuse

**Observe le codage de la figure (le triangle $RST$ a un angle droit).**

![figure](exos-11-figures/02-hypotenuse.svg)

1. Quelle est l’hypoténuse ? → attendu : $[RT]$ (options : $[RT]$ / $[RS]$ / $[ST]$)
   - Indice : Repère l’angle droit (le petit carré) : l’hypoténuse est le côté qui ne touche pas ce sommet.
   - Si « $[RS]$ » : $[RS]$ touche le sommet $S$ de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.
   - Si « $[ST]$ » : $[ST]$ touche le sommet $S$ de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.
2. Quelle égalité donne le théorème de Pythagore ? → attendu : $RT^2 = RS^2 + ST^2$ (options : $ST^2 = RS^2 + RT^2$ / $RS^2 = ST^2 + RT^2$ / $RT^2 = RS^2 + ST^2$)
   - Indice : « hypoténuse² = côté² + côté² ».
   - Si « $ST^2 = RS^2 + RT^2$ » : Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est $[RT]$.
   - Si « $RS^2 = ST^2 + RT^2$ » : Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est $[RT]$.

**Corrigé**

> L’angle droit est en $S$ : l’hypoténuse est le côté formé par les deux autres lettres, $[RT]$.  
> D’après le théorème de Pythagore : $RT^2 = RS^2 + ST^2$.  
> Contrôle : sur la figure, $[RT]$ est bien le plus long côté.  

Réponse : $[RT]$ ; $RT^2 = RS^2 + ST^2$

## 3. Calculer l’hypoténuse — ★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-hypotenuse&niv=1&g=1yl07wv` · cours : § 3.4 · Calculer l’hypoténuse

**$DEF$ est rectangle en $E$, avec $DE = 4\,\text{cm}$ et $EF = 3\,\text{cm}$. Calcule $DF$.**

![figure](exos-11-figures/03-calcul-hypotenuse.svg)

1. Calcule $DF^2$. → attendu : $DF^2 =$ $25$
   - Indice : Le triangle est rectangle en $E$ : l’hypoténuse est $[DF]$. $DF^2 = DE^2 + EF^2$.
   - Erreur typique (réponse 49) : $DE^2 + EF^2$ n’est pas $(DE + EF)^2$ : on élève **chaque** longueur au carré, puis on additionne.
   - Erreur typique (réponse 7) : On cherche l’hypoténuse : on **additionne** les carrés.
   - Erreur typique (réponse 14) : $4^2 = 4 \times 4$, pas $2 \times 4$.
2. Déduis-en $DF$. → attendu : $DF =$ $5$ cm
   - Indice : $DF$ est le nombre positif dont le carré vaut $25$ : $DF = \sqrt{25}$.
   - Erreur typique (réponse 25) : Ça, c’est $DF^2$. Pour obtenir $DF$, on prend la **racine carrée**.
   - Erreur typique (réponse 7) : La racine d’une somme n’est pas la somme des racines : $\sqrt{4^2 + 3^2} \neq 4 + 3$.

**Corrigé**

> Le triangle $DEF$ est rectangle en $E$. D’après le théorème de Pythagore :  
> $DF^2 = DE^2 + EF^2$  
> $DF^2 = 4^2 + 3^2 = 16 + 9 = 25$  
> Donc $DF = \sqrt{25} = 5\,\text{cm}$.  
> Contrôle : $5$ est plus grand que $4$ et que $3$ : c’est cohérent pour une hypoténuse.  

Réponse : $DF = 5\,\text{cm}$

## 4. Calculer l’hypoténuse — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-hypotenuse&niv=2&g=v3rk6g` · cours : § 3.4 · Calculer l’hypoténuse

**$UVW$ est rectangle en $W$, avec $UW = 1{,}5\,\text{cm}$ et $VW = 3{,}6\,\text{cm}$. Calcule $UV$.**

![figure](exos-11-figures/04-calcul-hypotenuse.svg)

1. Calcule $UV^2$. → attendu : $UV^2 =$ $15{,}21$
   - Indice : Le triangle est rectangle en $W$ : l’hypoténuse est $[UV]$. $UV^2 = UW^2 + VW^2$.
   - Erreur typique (réponse 2601/100) : $UW^2 + VW^2$ n’est pas $(UW + VW)^2$ : on élève **chaque** longueur au carré, puis on additionne.
   - Erreur typique (réponse 1071/100) : On cherche l’hypoténuse : on **additionne** les carrés.
   - Erreur typique (réponse 51/5) : $1{,}5^2 = 1{,}5 \times 1{,}5$, pas $2 \times 1{,}5$.
   - Erreur typique (réponse 51/10) : Il faut les **carrés** des deux côtés de l’angle droit.
2. Déduis-en $UV$. → attendu : $UV =$ $3{,}9$ cm
   - Indice : $UV$ est le nombre positif dont le carré vaut $15{,}21$ : $UV = \sqrt{15{,}21}$.
   - Erreur typique (réponse 1521/100) : Ça, c’est $UV^2$. Pour obtenir $UV$, on prend la **racine carrée**.
   - Erreur typique (réponse 51/10) : La racine d’une somme n’est pas la somme des racines : $\sqrt{1{,}5^2 + 3{,}6^2} \neq 1{,}5 + 3{,}6$.

**Corrigé**

> Le triangle $UVW$ est rectangle en $W$. D’après le théorème de Pythagore :  
> $UV^2 = UW^2 + VW^2$  
> $UV^2 = 1{,}5^2 + 3{,}6^2 = 2{,}25 + 12{,}96 = 15{,}21$  
> Donc $UV = \sqrt{15{,}21} = 3{,}9\,\text{cm}$.  
> Contrôle : $3{,}9$ est plus grand que $1{,}5$ et que $3{,}6$ : c’est cohérent pour une hypoténuse.  

Réponse : $UV = 3{,}9\,\text{cm}$

## 5. Calculer un côté de l’angle droit — ★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-cote&niv=1&g=1cxfzal` · cours : § 3.5 · Calculer un côté de l’angle droit

**$KLM$ est rectangle en $K$, avec $LM = 15\,\text{cm}$ et $KL = 12\,\text{cm}$. Calcule $KM$.**

![figure](exos-11-figures/05-calcul-cote.svg)

1. Calcule $KM^2$. → attendu : $KM^2 =$ $81$
   - Indice : L’hypoténuse est $[LM]$ (face à l’angle droit). $LM^2 = KL^2 + KM^2$ : on cherche un côté de l’angle droit, on **soustrait**.
   - Erreur typique (réponse 369) : On cherche un côté de l’angle droit, pas l’hypoténuse : $KM^2 = LM^2 - KL^2$. On **soustrait**.
   - Erreur typique (réponse -81) : C’est l’hypoténuse $[LM]$ (le plus long côté) dont on soustrait l’autre carré.
   - Erreur typique (réponse 9) : $LM^2 - KL^2$ n’est pas $(LM - KL)^2$.
2. Déduis-en $KM$. → attendu : $KM =$ $9$ cm
   - Indice : $KM = \sqrt{81}$.
   - Erreur typique (réponse 81) : Ça, c’est $KM^2$. On prend la **racine carrée**.
   - Erreur typique (réponse 96/5) : Tu as additionné les carrés : on trouverait un côté plus long que l’hypoténuse, impossible.
   - Erreur typique (réponse 3) : $\sqrt{15^2 - 12^2} \neq 15 - 12$.

**Corrigé**

> Le triangle $KLM$ est rectangle en $K$. D’après le théorème de Pythagore :  
> $LM^2 = KL^2 + KM^2$  
> $15^2 = 12^2 + KM^2$  
> $225 = 144 + KM^2$  
> $KM^2 = 225 - 144 = 81$  
> Donc $KM = \sqrt{81} = 9\,\text{cm}$.  
> Contrôle : $9 < 15$ ; un côté de l’angle droit est plus court que l’hypoténuse.  

Réponse : $KM = 9\,\text{cm}$

## 6. Calculer un côté de l’angle droit — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-cote&niv=2&g=ylnjtd` · cours : § 3.5 · Calculer un côté de l’angle droit

**$RST$ est rectangle en $S$, avec $RT = 14\,\text{cm}$ et $ST = 12\,\text{cm}$. Calcule $RS$.**

![figure](exos-11-figures/06-calcul-cote.svg)

1. Calcule $RS^2$. → attendu : $RS^2 =$ $52$
   - Indice : L’hypoténuse est $[RT]$ (face à l’angle droit). $RT^2 = ST^2 + RS^2$ : on cherche un côté de l’angle droit, on **soustrait**.
   - Erreur typique (réponse 340) : On cherche un côté de l’angle droit, pas l’hypoténuse : $RS^2 = RT^2 - ST^2$. On **soustrait**.
   - Erreur typique (réponse -52) : C’est l’hypoténuse $[RT]$ (le plus long côté) dont on soustrait l’autre carré.
   - Erreur typique (réponse 4) : $RT^2 - ST^2$ n’est pas $(RT - ST)^2$.
2. Déduis-en $RS$, arrondi au millimètre. → attendu : $RS \approx$ $7{,}2$ cm
   - Indice : $RS = \sqrt{52}$.
   - Erreur typique (réponse 52) : Ça, c’est $RS^2$. On prend la **racine carrée**.
   - Erreur typique (réponse 92/5) : Tu as additionné les carrés : on trouverait un côté plus long que l’hypoténuse, impossible.
   - Erreur typique (réponse 2) : $\sqrt{14^2 - 12^2} \neq 14 - 12$.

**Corrigé**

> Le triangle $RST$ est rectangle en $S$. D’après le théorème de Pythagore :  
> $RT^2 = ST^2 + RS^2$  
> $14^2 = 12^2 + RS^2$  
> $196 = 144 + RS^2$  
> $RS^2 = 196 - 144 = 52$  
> Donc $RS = \sqrt{52} \approx 7{,}2\,\text{cm}$ (arrondi au millimètre).  
> Contrôle : $7{,}2 < 14$ ; un côté de l’angle droit est plus court que l’hypoténuse.  

Réponse : $RS \approx 7{,}2\,\text{cm}$

## 7. Calculer un côté de l’angle droit — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-cote&niv=3&g=5y4s8l` · cours : § 3.5 · Calculer un côté de l’angle droit

**$EFG$ est rectangle en $G$, avec $EF = 1250\,\text{cm}$ et $FG = 12\,\text{m}$. Calcule $EG$ en mètres.**

![figure](exos-11-figures/07-calcul-cote.svg)

1. Convertis $EF$ en mètres. → attendu : $EF =$ $12{,}5$ m
   - Indice : $1\,\text{m} = 100\,\text{cm}$ : on divise par $100$.
   - Erreur typique (réponse 125000) : On passe de cm à m : on **divise** par 100.
2. Calcule $EG^2$. → attendu : $EG^2 =$ $12{,}25$
   - Indice : L’hypoténuse est $[EF]$ (face à l’angle droit). $EF^2 = FG^2 + EG^2$ : on cherche un côté de l’angle droit, on **soustrait**.
   - Erreur typique (réponse 1201/4) : On cherche un côté de l’angle droit, pas l’hypoténuse : $EG^2 = EF^2 - FG^2$. On **soustrait**.
   - Erreur typique (réponse -49/4) : C’est l’hypoténuse $[EF]$ (le plus long côté) dont on soustrait l’autre carré.
   - Erreur typique (réponse 1/4) : $EF^2 - FG^2$ n’est pas $(EF - FG)^2$.
   - Erreur typique (réponse 1562356) : Convertis d’abord toutes les longueurs dans la même unité.
3. Déduis-en $EG$. → attendu : $EG =$ $3{,}5$ m
   - Indice : $EG = \sqrt{12{,}25}$.
   - Erreur typique (réponse 49/4) : Ça, c’est $EG^2$. On prend la **racine carrée**.
   - Erreur typique (réponse 173/10) : Tu as additionné les carrés : on trouverait un côté plus long que l’hypoténuse, impossible.
   - Erreur typique (réponse 1/2) : $\sqrt{12{,}5^2 - 12^2} \neq 12{,}5 - 12$.

**Corrigé**

> On convertit : $EF = 1250\,\text{cm} = 12{,}5\,\text{m}$.  
> Le triangle $EFG$ est rectangle en $G$. D’après le théorème de Pythagore :  
> $EF^2 = FG^2 + EG^2$  
> $12{,}5^2 = 12^2 + EG^2$  
> $156{,}25 = 144 + EG^2$  
> $EG^2 = 156{,}25 - 144 = 12{,}25$  
> Donc $EG = \sqrt{12{,}25} = 3{,}5\,\text{m}$.  
> Contrôle : $3{,}5 < 12{,}5$ ; un côté de l’angle droit est plus court que l’hypoténuse.  

Réponse : $EG = 3{,}5\,\text{m}$

## 8. Rectangle ou pas ? (réciproque) — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=reciproque&niv=2&g=d99s12` · cours : § 4.2 · Réciproque : méthode

**Le triangle $RST$ a pour côtés $RS = 36\,\text{cm}$, $RT = 30\,\text{cm}$, $ST = 16\,\text{cm}$. Est-il rectangle ?**

1. Quel est le plus grand côté ? → attendu : $[RS]$ (options : $[RS]$ / $[RT]$ / $[ST]$)
   - Indice : Seul le plus grand côté peut être l’hypoténuse.
   - Si « $[RT]$ » : $RT = 30$ n’est pas le plus grand : compare les trois longueurs.
   - Si « $[ST]$ » : $ST = 16$ n’est pas le plus grand : compare les trois longueurs.
2. D’une part : calcule $RS^2$. → attendu : $RS^2 =$ $1296$
   - Indice : Le carré du plus grand côté : $36^2$.
   - Erreur typique (réponse 72) : $36^2 = 36 \times 36$.
3. D’autre part : calcule $RT^2 + ST^2$. → attendu : $RT^2 + ST^2 =$ $1156$
   - Indice : La somme des carrés des deux autres côtés.
   - Erreur typique (réponse 2116) : On additionne les **carrés** : $30^2 + 16^2$, pas le carré de la somme.
4. Conclus. → attendu : Pas rectangle (options : Rectangle en $R$ / Rectangle en $S$ / Rectangle en $T$ / Pas rectangle)
   - Indice : Égalité : rectangle, avec l’angle droit en face du plus grand côté. Pas d’égalité : pas rectangle.
   - Si « Rectangle en $R$ » : Les deux résultats sont **différents** : le triangle n’est pas rectangle (sinon, d’après le théorème de Pythagore, on aurait l’égalité).
   - Si « Rectangle en $S$ » : Les deux résultats sont **différents** : le triangle n’est pas rectangle (sinon, d’après le théorème de Pythagore, on aurait l’égalité).
   - Si « Rectangle en $T$ » : Les deux résultats sont **différents** : le triangle n’est pas rectangle (sinon, d’après le théorème de Pythagore, on aurait l’égalité).

**Corrigé**

> Le plus grand côté est $[RS]$.  
> D’une part : $RS^2 = 36^2 = 1296$.  
> D’autre part : $RT^2 + ST^2 = 30^2 + 16^2 = 900 + 256 = 1156$.  
> On constate que $RS^2 \neq RT^2 + ST^2$. Le triangle $RST$ n’est donc pas rectangle (s’il l’était, d’après le théorème de Pythagore, on aurait l’égalité).  

Réponse : pas rectangle

## 9. Rectangle ou pas ? (réciproque) — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=reciproque&niv=3&g=gwrodb` · cours : § 4.2 · Réciproque : méthode

**Le triangle $RST$ a pour côtés $RT = 3{,}3\,\text{cm}$, $ST = 6{,}5\,\text{cm}$, $RS = 5{,}6\,\text{cm}$. Est-il rectangle ?**

1. Quel est le plus grand côté ? → attendu : $[ST]$ (options : $[RT]$ / $[ST]$ / $[RS]$)
   - Indice : Seul le plus grand côté peut être l’hypoténuse.
   - Si « $[RT]$ » : $RT = 3{,}3$ n’est pas le plus grand : compare les trois longueurs.
   - Si « $[RS]$ » : $RS = 5{,}6$ n’est pas le plus grand : compare les trois longueurs.
2. D’une part : calcule $ST^2$. → attendu : $ST^2 =$ $42{,}25$
   - Indice : Le carré du plus grand côté : $6{,}5^2$.
   - Erreur typique (réponse 13) : $6{,}5^2 = 6{,}5 \times 6{,}5$.
3. D’autre part : calcule $RS^2 + RT^2$. → attendu : $RS^2 + RT^2 =$ $42{,}25$
   - Indice : La somme des carrés des deux autres côtés.
   - Erreur typique (réponse 7921/100) : On additionne les **carrés** : $5{,}6^2 + 3{,}3^2$, pas le carré de la somme.
4. Conclus. → attendu : Rectangle en $R$ (options : Rectangle en $R$ / Rectangle en $S$ / Rectangle en $T$ / Pas rectangle)
   - Indice : Égalité : rectangle, avec l’angle droit en face du plus grand côté. Pas d’égalité : pas rectangle.
   - Si « Rectangle en $S$ » : L’angle droit est **en face** du plus grand côté $[ST]$, pas à une de ses extrémités.
   - Si « Rectangle en $T$ » : L’angle droit est **en face** du plus grand côté $[ST]$, pas à une de ses extrémités.
   - Si « Pas rectangle » : Les deux résultats sont **égaux** : d’après la réciproque du théorème de Pythagore, le triangle est rectangle.

**Corrigé**

> Le plus grand côté est $[ST]$.  
> D’une part : $ST^2 = 6{,}5^2 = 42{,}25$.  
> D’autre part : $RS^2 + RT^2 = 5{,}6^2 + 3{,}3^2 = 31{,}36 + 10{,}89 = 42{,}25$.  
> On constate que $ST^2 = RS^2 + RT^2$. D’après la réciproque du théorème de Pythagore, le triangle $RST$ est rectangle en $R$ (le sommet qui n’appartient pas à $[ST]$).  

Réponse : rectangle en $R$

## 10. Figures usuelles — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=figures&niv=2&g=1lgaavx` · cours : § 5.1 · Diagonale d’un rectangle

**$ABC$ est un triangle équilatéral de côté $6\,\text{cm}$. Calcule sa hauteur $AH$, arrondie au millimètre.**

![figure](exos-11-figures/10-figures.svg)

1. Hauteur $AH$ : → attendu : $AH \approx$ $5{,}2$ cm
   - Indice : $H$ est le milieu de $[BC]$ : $HC = 3$. $AHC$ est rectangle en $H$, d’hypoténuse $[AC]$.
   - Erreur typique (réponse 67/10) : $[AC]$ est l’hypoténuse : on **soustrait** les carrés.
   - Erreur typique (réponse 27) : Prends la racine carrée.

**Corrigé**

> $H$ est le milieu de $[BC]$ : $HC = 3$. Le triangle $AHC$ est rectangle en $H$. D’après le théorème de Pythagore :  
> $AH^2 = AC^2 - HC^2 = 6^2 - 3^2 = 36 - 9 = 27$  
> Donc $AH = \sqrt{27} \approx 5{,}2\,\text{cm}$ (arrondi au millimètre).  

Réponse : $AH \approx 5{,}2\,\text{cm}$

## 11. Problèmes concrets — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=probleme&niv=2&g=o9r3fv` · cours : § 5.3 · Situations concrètes

**Une échelle de $4{,}5\,\text{m}$ est appuyée contre un mur vertical. Son pied est à $1{,}6\,\text{m}$ du mur (sol horizontal).**

![figure](exos-11-figures/11-probleme.svg)

1. À quelle hauteur arrive le haut de l’échelle (arrondie au centimètre) ? → attendu : $h \approx$ $4{,}21$ m
   - Indice : Le mur, le sol et l’échelle forment un triangle rectangle ; l’échelle est l’hypoténuse.
   - Erreur typique (réponse 239/50) : L’échelle est l’hypoténuse : on **soustrait** les carrés.
   - Erreur typique (réponse 1769/100) : Prends la racine carrée.

**Corrigé**

> Le mur est perpendiculaire au sol : le triangle formé est rectangle au pied du mur, et l’échelle est l’hypoténuse. D’après le théorème de Pythagore :  
> $h^2 = 4{,}5^2 - 1{,}6^2 = 20{,}25 - 2{,}56 = 17{,}69$  
> Donc $h \approx 4{,}21\,\text{m}$ (arrondi au centimètre).  
> Contrôle : l’hypoténuse est bien plus longue que chacun des deux autres côtés.  

Réponse : $h \approx 4{,}21\,\text{m}$

## 12. Problèmes concrets — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=probleme&niv=3&g=vcmxet` · cours : § 5.3 · Situations concrètes

**Une échelle de $6\,\text{m}$ est appuyée contre un mur vertical. Son pied est à $2{,}7\,\text{m}$ du mur (sol horizontal).**

![figure](exos-11-figures/12-probleme.svg)

1. À quelle hauteur arrive le haut de l’échelle (arrondie au centimètre) ? → attendu : $h \approx$ $5{,}36$ m
   - Indice : Le mur, le sol et l’échelle forment un triangle rectangle ; l’échelle est l’hypoténuse.
   - Erreur typique (réponse 329/50) : L’échelle est l’hypoténuse : on **soustrait** les carrés.
   - Erreur typique (réponse 2871/100) : Prends la racine carrée.

**Corrigé**

> Le mur est perpendiculaire au sol : le triangle formé est rectangle au pied du mur, et l’échelle est l’hypoténuse. D’après le théorème de Pythagore :  
> $h^2 = 6^2 - 2{,}7^2 = 36 - 7{,}29 = 28{,}71$  
> Donc $h \approx 5{,}36\,\text{m}$ (arrondi au centimètre).  
> Contrôle : l’hypoténuse est bien plus longue que chacun des deux autres côtés.  

Réponse : $h \approx 5{,}36\,\text{m}$

## 13. Distance dans un repère — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=repere&niv=3&g=1mpbrzw` · cours : § 5.5 · Distance dans un repère

**Dans un repère orthonormé, $A(0\,;\,1)$ et $B(4\,;\,3)$. On note $C(4\,;\,1)$. Calcule la distance $AB$.**

![figure](exos-11-figures/13-repere.svg)

1. Écart horizontal $AC$ et écart vertical $CB$ (en unités) : → attendu : $AC =$ $4$ ; $CB =$ $2$
   - Indice : Différence des abscisses, puis des ordonnées (une longueur est positive).
   - Erreur typique (réponses 4 ; 4) : Fais la **différence** des coordonnées, pas la somme.
2. Déduis-en $AB$, arrondie au dixième. → attendu : $AB \approx$ $4{,}5$
   - Indice : $ACB$ est rectangle en $C$ : $AB^2 = AC^2 + CB^2$.
   - Erreur typique (réponse 6) : $\sqrt{4^2 + 2^2} \neq 4 + 2$.
   - Erreur typique (réponse 20) : Ça, c’est $AB^2$ : prends la racine carrée.

**Corrigé**

> Écart horizontal : $AC = |4 - 0| = 4$ ; écart vertical : $CB = |3 - 1| = 2$.  
> Le triangle $ACB$ est rectangle en $C$. D’après le théorème de Pythagore :  
> $AB^2 = 4^2 + 2^2 = 16 + 4 = 20$  
> Donc $AB = \sqrt{20} \approx 4{,}5$ unités.  

Réponse : $AB \approx 4{,}5$

## 14. Pythagore deux fois — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=deux-fois&niv=3&g=16w2at2` · cours : § 5.4 · Pythagore deux fois

**$ABCDEFGH$ est un pavé droit avec $AB = 4\,\text{cm}$, $BC = 8\,\text{cm}$ et $CG = 8\,\text{cm}$. Calcule la grande diagonale $AG$.**

![figure](exos-11-figures/14-deux-fois.svg)

1. Dans la base $ABCD$ : calcule $AC^2$. → attendu : $AC^2 =$ $80$
   - Indice : $ABC$ est rectangle en $B$.
   - Erreur typique (réponse 89/10) : Garde $AC^2$ : on n’a pas besoin de la racine pour la suite.
2. Déduis-en $AG$. → attendu : $AG =$ $12$ cm
   - Indice : $[CG]$ est une arête verticale, perpendiculaire à la base : $ACG$ est rectangle en $C$, et $AG^2 = AC^2 + CG^2$.
   - Erreur typique (réponse 144) : Ça, c’est $AG^2$ : prends la racine carrée.
   - Erreur typique (réponse 169/10) : $\sqrt{AC^2 + CG^2} \neq AC + CG$.

**Corrigé**

> Le triangle $ABC$ est rectangle en $B$. D’après le théorème de Pythagore : $AC^2 = 4^2 + 8^2 = 16 + 64 = 80$.  
> L’arête $[CG]$ est perpendiculaire à la base, donc le triangle $ACG$ est rectangle en $C$. D’après le théorème de Pythagore :  
> $AG^2 = AC^2 + CG^2 = 80 + 64 = 144$  
> Donc $AG = \sqrt{144} = 12\,\text{cm}$.  
> Astuce : on n’a jamais eu besoin de calculer $AC$ lui-même — on garde $AC^2$ pour éviter un arrondi intermédiaire.  

Réponse : $AG = 12\,\text{cm}$

## 15. Trouver l’erreur — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=erreur&niv=2&g=5dysxh` · cours : § 3.8 · Erreurs fréquentes

**Hugo rédige (le triangle $ABC$ est rectangle en $B$) :**

« $AC = \sqrt{9^2 + 12^2} = 9 + 12 = 21$. »  

1. Quelle est l’erreur ? → attendu : La racine d’une somme a été calculée comme la somme des racines. (options : La rédaction affirme l’égalité avant de l’avoir vérifiée. / Le triangle n’est pas rectangle : on ne peut pas utiliser le théorème. / La racine carrée a été oubliée. / La racine d’une somme a été calculée comme la somme des racines.)
   - Indice : Relis chaque étape : quel côté est en face de l’angle droit ? le carré ou la longueur ? une racine bien calculée ?
   - Si « La rédaction affirme l’égalité avant de l’avoir vérifiée. » : Ce n’est pas ça. La racine d’une somme n’est pas la somme des racines : on calcule d’abord $9^2 + 12^2 = 225$.
   - Si « Le triangle n’est pas rectangle : on ne peut pas utiliser le théorème. » : Ce n’est pas ça. La racine d’une somme n’est pas la somme des racines : on calcule d’abord $9^2 + 12^2 = 225$.
   - Si « La racine carrée a été oubliée. » : Ce n’est pas ça. La racine d’une somme n’est pas la somme des racines : on calcule d’abord $9^2 + 12^2 = 225$.
2. Quelle est la bonne valeur de $AC$ ? → attendu : $AC =$ $15$
   - Indice : Refais le calcul proprement, avec la méthode du cours.
   - Erreur typique (réponse 225) : Prends la racine carrée.

**Corrigé**

> La racine d’une somme n’est pas la somme des racines : on calcule d’abord $9^2 + 12^2 = 225$.  
> Correction :  
> $AC = \sqrt{81 + 144} = \sqrt{225} = 15$  

Réponse : La racine d’une somme a été calculée comme la somme des racines. Bonne valeur : $15$.

## 16. Repérer l’hypoténuse — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=hypotenuse&niv=2&g=1wgvhb7` · cours : § 2 · L’hypoténuse

**Observe le codage de la figure (le triangle $IJK$ a un angle droit).**

![figure](exos-11-figures/16-hypotenuse.svg)

1. Quelle est l’hypoténuse ? → attendu : $[IJ]$ (options : $[IK]$ / $[JK]$ / $[IJ]$)
   - Indice : Repère l’angle droit (le petit carré) : l’hypoténuse est le côté qui ne touche pas ce sommet.
   - Si « $[IK]$ » : $[IK]$ touche le sommet $K$ de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.
   - Si « $[JK]$ » : $[JK]$ touche le sommet $K$ de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.
2. Quelle égalité donne le théorème de Pythagore ? → attendu : $IJ^2 = IK^2 + JK^2$ (options : $IJ^2 = IK^2 + JK^2$ / $IK^2 = JK^2 + IJ^2$ / $JK^2 = IK^2 + IJ^2$)
   - Indice : « hypoténuse² = côté² + côté² ».
   - Si « $IK^2 = JK^2 + IJ^2$ » : Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est $[IJ]$.
   - Si « $JK^2 = IK^2 + IJ^2$ » : Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est $[IJ]$.

**Corrigé**

> L’angle droit est en $K$ : l’hypoténuse est le côté formé par les deux autres lettres, $[IJ]$.  
> D’après le théorème de Pythagore : $IJ^2 = IK^2 + JK^2$.  
> Contrôle : sur la figure, $[IJ]$ est bien le plus long côté.  

Réponse : $[IJ]$ ; $IJ^2 = IK^2 + JK^2$

## 17. Calculer l’hypoténuse — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-hypotenuse&niv=2&g=1eks3cp` · cours : § 3.4 · Calculer l’hypoténuse

**$IJK$ est rectangle en $K$, avec $JK = 3\,\text{cm}$ et $IK = 6\,\text{cm}$. Calcule $IJ$.**

![figure](exos-11-figures/17-calcul-hypotenuse.svg)

1. Calcule $IJ^2$. → attendu : $IJ^2 =$ $45$
   - Indice : Le triangle est rectangle en $K$ : l’hypoténuse est $[IJ]$. $IJ^2 = JK^2 + IK^2$.
   - Erreur typique (réponse 81) : $JK^2 + IK^2$ n’est pas $(JK + IK)^2$ : on élève **chaque** longueur au carré, puis on additionne.
   - Erreur typique (réponse 27) : On cherche l’hypoténuse : on **additionne** les carrés.
   - Erreur typique (réponse 18) : $3^2 = 3 \times 3$, pas $2 \times 3$.
   - Erreur typique (réponse 9) : Il faut les **carrés** des deux côtés de l’angle droit.
2. Déduis-en $IJ$, arrondi au millimètre. → attendu : $IJ \approx$ $6{,}7$ cm
   - Indice : $IJ$ est le nombre positif dont le carré vaut $45$ : $IJ = \sqrt{45}$.
   - Erreur typique (réponse 45) : Ça, c’est $IJ^2$. Pour obtenir $IJ$, on prend la **racine carrée**.
   - Erreur typique (réponse 9) : La racine d’une somme n’est pas la somme des racines : $\sqrt{3^2 + 6^2} \neq 3 + 6$.

**Corrigé**

> Le triangle $IJK$ est rectangle en $K$. D’après le théorème de Pythagore :  
> $IJ^2 = JK^2 + IK^2$  
> $IJ^2 = 3^2 + 6^2 = 9 + 36 = 45$  
> Donc $IJ = \sqrt{45} \approx 6{,}7\,\text{cm}$ (arrondi au millimètre).  
> Contrôle : $6{,}7$ est plus grand que $3$ et que $6$ : c’est cohérent pour une hypoténuse.  

Réponse : $IJ \approx 6{,}7\,\text{cm}$

## 18. Calculer un côté de l’angle droit — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=calcul-cote&niv=3&g=108gcx6` · cours : § 3.5 · Calculer un côté de l’angle droit

**$KLM$ est rectangle en $L$, avec $KM = 2600\,\text{cm}$ et $KL = 10\,\text{m}$. Calcule $LM$ en mètres.**

![figure](exos-11-figures/18-calcul-cote.svg)

1. Convertis $KM$ en mètres. → attendu : $KM =$ $26$ m
   - Indice : $1\,\text{m} = 100\,\text{cm}$ : on divise par $100$.
   - Erreur typique (réponse 260000) : On passe de cm à m : on **divise** par 100.
2. Calcule $LM^2$. → attendu : $LM^2 =$ $576$
   - Indice : L’hypoténuse est $[KM]$ (face à l’angle droit). $KM^2 = KL^2 + LM^2$ : on cherche un côté de l’angle droit, on **soustrait**.
   - Erreur typique (réponse 776) : On cherche un côté de l’angle droit, pas l’hypoténuse : $LM^2 = KM^2 - KL^2$. On **soustrait**.
   - Erreur typique (réponse -576) : C’est l’hypoténuse $[KM]$ (le plus long côté) dont on soustrait l’autre carré.
   - Erreur typique (réponse 256) : $KM^2 - KL^2$ n’est pas $(KM - KL)^2$.
   - Erreur typique (réponse 6759900) : Convertis d’abord toutes les longueurs dans la même unité.
3. Déduis-en $LM$. → attendu : $LM =$ $24$ m
   - Indice : $LM = \sqrt{576}$.
   - Erreur typique (réponse 576) : Ça, c’est $LM^2$. On prend la **racine carrée**.
   - Erreur typique (réponse 279/10) : Tu as additionné les carrés : on trouverait un côté plus long que l’hypoténuse, impossible.
   - Erreur typique (réponse 16) : $\sqrt{26^2 - 10^2} \neq 26 - 10$.

**Corrigé**

> On convertit : $KM = 2600\,\text{cm} = 26\,\text{m}$.  
> Le triangle $KLM$ est rectangle en $L$. D’après le théorème de Pythagore :  
> $KM^2 = KL^2 + LM^2$  
> $26^2 = 10^2 + LM^2$  
> $676 = 100 + LM^2$  
> $LM^2 = 676 - 100 = 576$  
> Donc $LM = \sqrt{576} = 24\,\text{m}$.  
> Contrôle : $24 < 26$ ; un côté de l’angle droit est plus court que l’hypoténuse.  

Réponse : $LM = 24\,\text{m}$

## 19. Rectangle ou pas ? (réciproque) — ★★★

Adresse : `#/entrainement/11-pythagore/exo?t=reciproque&niv=3&g=1aghc9n` · cours : § 4.2 · Réciproque : méthode

**Le triangle $XYZ$ a pour côtés $XZ = 2{,}8\,\text{cm}$, $YZ = 5{,}3\,\text{cm}$, $XY = 4{,}5\,\text{cm}$. Est-il rectangle ?**

1. Quel est le plus grand côté ? → attendu : $[YZ]$ (options : $[XZ]$ / $[YZ]$ / $[XY]$)
   - Indice : Seul le plus grand côté peut être l’hypoténuse.
   - Si « $[XZ]$ » : $XZ = 2{,}8$ n’est pas le plus grand : compare les trois longueurs.
   - Si « $[XY]$ » : $XY = 4{,}5$ n’est pas le plus grand : compare les trois longueurs.
2. D’une part : calcule $YZ^2$. → attendu : $YZ^2 =$ $28{,}09$
   - Indice : Le carré du plus grand côté : $5{,}3^2$.
   - Erreur typique (réponse 53/5) : $5{,}3^2 = 5{,}3 \times 5{,}3$.
3. D’autre part : calcule $XY^2 + XZ^2$. → attendu : $XY^2 + XZ^2 =$ $28{,}09$
   - Indice : La somme des carrés des deux autres côtés.
   - Erreur typique (réponse 5329/100) : On additionne les **carrés** : $4{,}5^2 + 2{,}8^2$, pas le carré de la somme.
4. Conclus. → attendu : Rectangle en $X$ (options : Rectangle en $X$ / Rectangle en $Y$ / Rectangle en $Z$ / Pas rectangle)
   - Indice : Égalité : rectangle, avec l’angle droit en face du plus grand côté. Pas d’égalité : pas rectangle.
   - Si « Rectangle en $Y$ » : L’angle droit est **en face** du plus grand côté $[YZ]$, pas à une de ses extrémités.
   - Si « Rectangle en $Z$ » : L’angle droit est **en face** du plus grand côté $[YZ]$, pas à une de ses extrémités.
   - Si « Pas rectangle » : Les deux résultats sont **égaux** : d’après la réciproque du théorème de Pythagore, le triangle est rectangle.

**Corrigé**

> Le plus grand côté est $[YZ]$.  
> D’une part : $YZ^2 = 5{,}3^2 = 28{,}09$.  
> D’autre part : $XY^2 + XZ^2 = 4{,}5^2 + 2{,}8^2 = 20{,}25 + 7{,}84 = 28{,}09$.  
> On constate que $YZ^2 = XY^2 + XZ^2$. D’après la réciproque du théorème de Pythagore, le triangle $XYZ$ est rectangle en $X$ (le sommet qui n’appartient pas à $[YZ]$).  

Réponse : rectangle en $X$

## 20. Figures usuelles — ★★

Adresse : `#/entrainement/11-pythagore/exo?t=figures&niv=2&g=z3gpik` · cours : § 5.1 · Diagonale d’un rectangle

**$ABCD$ est un carré de côté $11\,\text{cm}$. Calcule la longueur de sa diagonale $[AC]$, arrondie au millimètre.**

![figure](exos-11-figures/20-figures.svg)

1. Longueur de la diagonale : → attendu : $AC \approx$ $15{,}6$ cm
   - Indice : $ABC$ est rectangle en $B$ : $AC^2 = 11^2 + 11^2$.
   - Erreur typique (réponse 242) : Ça, c’est $AC^2$ : prends la racine carrée.
   - Erreur typique (réponse 22) : $\sqrt{11^2 + 11^2} \neq 11 + 11$.
   - Erreur typique (réponse 11) : Il y a **deux** carrés à additionner.

**Corrigé**

> Le triangle $ABC$ est rectangle en $B$. D’après le théorème de Pythagore :  
> $AC^2 = 11^2 + 11^2 = 121 + 121 = 242$  
> Donc $AC = \sqrt{242} \approx 15{,}6\,\text{cm}$ (arrondi au millimètre).  
> Remarque : la diagonale d’un carré de côté $c$ mesure $c\sqrt{2}$.  

Réponse : $AC \approx 15{,}6\,\text{cm}$
