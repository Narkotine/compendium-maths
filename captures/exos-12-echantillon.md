# Échantillon d’exercices générés — chapitre 12 (Théorème de Thalès, v0.5)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

## 1. Écrire les rapports — ★

Adresse : `#/entrainement/12-thales/exo?t=rapports&niv=1&g=aipaix` · cours : § 2.4 · Écrire les rapports

**Écris les rapports de Thalès.**

$D$ est sur $[AB]$, $E$ est sur $[AC]$ et les droites $(DE)$ et $(BC)$ sont parallèles.  

![figure](exos-12-figures/01-rapports.svg)

1. Quelle égalité donne le théorème de Thalès ? → attendu : $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{DE}{BC}$ (options : $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{BC}{DE}$ / $\dfrac{AD}{AB} = \dfrac{AC}{AE} = \dfrac{DE}{BC}$ / $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{DE}{BC}$ / $\dfrac{AD}{DB} = \dfrac{AE}{EC} = \dfrac{DE}{BC}$)
   - Indice : Petit triangle $ADE$ en haut, grand triangle $ABC$ en bas, dans le même ordre, sommet commun $A$ en premier.
   - Si « $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{BC}{DE}$ » : Le dernier rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.
   - Si « $\dfrac{AD}{AB} = \dfrac{AC}{AE} = \dfrac{DE}{BC}$ » : Le deuxième rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.
   - Si « $\dfrac{AD}{DB} = \dfrac{AE}{EC} = \dfrac{DE}{BC}$ » : $[DB]$ et $[EC]$ ne sont des côtés d’aucun des deux triangles $ADE$ et $ABC$.

**Corrigé**

> Petit triangle $ADE$, grand triangle $ABC$, sommet commun $A$ :  
> $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{DE}{BC}$  

Réponse : $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{DE}{BC}$

## 2. Écrire les rapports — ★★

Adresse : `#/entrainement/12-thales/exo?t=rapports&niv=2&g=1dglzqx` · cours : § 2.4 · Écrire les rapports

**Écris les rapports de Thalès.**

$M$ est sur $[RS]$, $N$ est sur $[RT]$ et les droites $(MN)$ et $(ST)$ sont parallèles.  

![figure](exos-12-figures/02-rapports.svg)

1. Quelle égalité donne le théorème de Thalès ? → attendu : $\dfrac{RM}{RS} = \dfrac{RN}{RT} = \dfrac{MN}{ST}$ (options : $\dfrac{RM}{RN} = \dfrac{RS}{RT} = \dfrac{MN}{ST}$ / $\dfrac{RM}{RS} = \dfrac{RT}{RN} = \dfrac{MN}{ST}$ / $\dfrac{RM}{RS} = \dfrac{RN}{RT} = \dfrac{ST}{MN}$ / $\dfrac{RM}{RS} = \dfrac{RN}{RT} = \dfrac{MN}{ST}$)
   - Indice : Petit triangle $RMN$ en haut, grand triangle $RST$ en bas, dans le même ordre, sommet commun $R$ en premier.
   - Si « $\dfrac{RM}{RN} = \dfrac{RS}{RT} = \dfrac{MN}{ST}$ » : Chaque rapport compare deux côtés **homologues** (un du petit triangle, celui qui lui correspond dans le grand), pas deux côtés du même triangle.
   - Si « $\dfrac{RM}{RS} = \dfrac{RT}{RN} = \dfrac{MN}{ST}$ » : Le deuxième rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.
   - Si « $\dfrac{RM}{RS} = \dfrac{RN}{RT} = \dfrac{ST}{MN}$ » : Le dernier rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.
2. Quelle est la configuration ? → attendu : Triangles emboîtés (options : Triangles emboîtés / Papillon)
   - Indice : Regarde si $R$ est entre $M$ et $S$.
   - Si « Papillon » : $M$ est sur le segment $[RS]$ : le petit triangle est dans le grand.

**Corrigé**

> Petit triangle $RMN$, grand triangle $RST$, sommet commun $R$ :  
> $\dfrac{RM}{RS} = \dfrac{RN}{RT} = \dfrac{MN}{ST}$  
> Triangles emboîtés.  

Réponse : $\dfrac{RM}{RS} = \dfrac{RN}{RT} = \dfrac{MN}{ST}$

## 3. Produit en croix — ★

Adresse : `#/entrainement/12-thales/exo?t=croix&niv=1&g=1aedxkp` · cours : § 1.1 · Produit en croix

**Calcule x.**

1. a) $\dfrac{x}{4} = \dfrac{27}{18}$ → attendu : $x =$ $6$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 1/6) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 8/3) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 243/2) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
2. b) $\dfrac{1}{12} = \dfrac{3}{x}$ → attendu : $x =$ $36$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 1/36) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 4) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 1/4) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.

**Corrigé**

> a) $\dfrac{x}{4} = \dfrac{27}{18}$ donne $18 \times x = 4 \times 27$, donc $x = \dfrac{4 \times 27}{18} = 6$.  
> b) $\dfrac{1}{12} = \dfrac{3}{x}$ donne $1 \times x = 12 \times 3$, donc $x = \dfrac{12 \times 3}{1} = 36$.  

Réponse : a) $6$ ; b) $36$

## 4. Produit en croix — ★★

Adresse : `#/entrainement/12-thales/exo?t=croix&niv=2&g=1njigso` · cours : § 1.1 · Produit en croix

**Calcule x.**

1. a) $\dfrac{34}{24} = \dfrac{x}{36}$ → attendu : $x =$ $51$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 1/51) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 68/3) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 432/17) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
2. b) $\dfrac{12}{30} = \dfrac{3}{x}$ → attendu : $x =$ $7{,}5$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 2/15) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 120) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 6/5) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
3. c) $\dfrac{4}{x} = \dfrac{2}{4}$ → attendu : $x =$ $8$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 1/8) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 2) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.

**Corrigé**

> a) $\dfrac{34}{24} = \dfrac{x}{36}$ donne $24 \times x = 34 \times 36$, donc $x = \dfrac{34 \times 36}{24} = 51$.  
> b) $\dfrac{12}{30} = \dfrac{3}{x}$ donne $12 \times x = 30 \times 3$, donc $x = \dfrac{30 \times 3}{12} = 7{,}5$.  
> c) $\dfrac{4}{x} = \dfrac{2}{4}$ donne $2 \times x = 4 \times 4$, donc $x = \dfrac{4 \times 4}{2} = 8$.  

Réponse : a) $51$ ; b) $7{,}5$ ; c) $8$

## 5. Calculer une longueur (triangles emboîtés) — ★

Adresse : `#/entrainement/12-thales/exo?t=emboites&niv=1&g=uvk43d` · cours : § 2.5 · Exemple : triangles emboîtés

**Calcule $AC$ et $DE$.**

$D$ est sur $[AB]$, $E$ est sur $[AC]$ et les droites $(DE)$ et $(BC)$ sont parallèles. On donne $AD = 4\,\mathrm{cm}$, $AB = 10\,\mathrm{cm}$, $AE = 2\,\mathrm{cm}$ et $BC = 7{,}5\,\mathrm{cm}$.  

![figure](exos-12-figures/05-emboites.svg)

1. a) Calcule $AC$. → attendu : $AC =$ $5$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{AD}{AB}$) et celui qui contient $AC$. Puis produit en croix.
   - Erreur typique (réponse 4/5) : Rapport retourné : $AC$ est un côté du grand triangle, il doit être plus grand que $AE$.
2. b) Calcule $DE$. → attendu : $DE =$ $3$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{AD}{AB}$) et celui qui contient $DE$. Puis produit en croix.
   - Erreur typique (réponse 75/4) : Rapport retourné : $DE$ est un côté du petit triangle, il doit être plus petit que $BC$.

**Corrigé**

> Les points $A$, $D$, $B$ sont alignés, ainsi que $A$, $E$, $C$, et $(DE) \parallel (BC)$. D’après le théorème de Thalès :  
> $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{DE}{BC} \quad \text{soit} \quad \dfrac{4}{10} = \dfrac{2}{AC} = \dfrac{DE}{7{,}5}$  
> Calcul de $AC$ : $AC = \dfrac{10 \times 2}{4} = 5\,\mathrm{cm}$.  
> Calcul de $DE$ : $DE = \dfrac{4 \times 7{,}5}{10} = 3\,\mathrm{cm}$.  
> Contrôle : le rapport vaut $k = \dfrac{4}{10} = 0{,}4$ ; les côtés du petit triangle $ADE$ sont bien plus petits que ceux du grand.  

Réponse : $AC = 5\,\mathrm{cm}$ ; $DE = 3\,\mathrm{cm}$

## 6. Calculer une longueur (triangles emboîtés) — ★★

Adresse : `#/entrainement/12-thales/exo?t=emboites&niv=2&g=bj5gul` · cours : § 2.5 · Exemple : triangles emboîtés

**Calcule $OL$ et $IJ$.**

$I$ est sur $[OK]$, $J$ est sur $[OL]$ et les droites $(IJ)$ et $(KL)$ sont parallèles. On donne $OI = 7{,}5\,\mathrm{cm}$, $OK = 15\,\mathrm{cm}$, $OJ = 3{,}5\,\mathrm{cm}$ et $KL = 16\,\mathrm{cm}$.  

![figure](exos-12-figures/06-emboites.svg)

1. a) Calcule $OL$. → attendu : $OL =$ $7$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{OI}{OK}$) et celui qui contient $OL$. Puis produit en croix.
   - Erreur typique (réponse 7/4) : Rapport retourné : $OL$ est un côté du grand triangle, il doit être plus grand que $OJ$.
2. b) Calcule $IJ$. → attendu : $IJ =$ $8$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{OI}{OK}$) et celui qui contient $IJ$. Puis produit en croix.
   - Erreur typique (réponse 32) : Rapport retourné : $IJ$ est un côté du petit triangle, il doit être plus petit que $KL$.

**Corrigé**

> Les points $O$, $I$, $K$ sont alignés, ainsi que $O$, $J$, $L$, et $(IJ) \parallel (KL)$. D’après le théorème de Thalès :  
> $\dfrac{OI}{OK} = \dfrac{OJ}{OL} = \dfrac{IJ}{KL} \quad \text{soit} \quad \dfrac{7{,}5}{15} = \dfrac{3{,}5}{OL} = \dfrac{IJ}{16}$  
> Calcul de $OL$ : $OL = \dfrac{15 \times 3{,}5}{7{,}5} = 7\,\mathrm{cm}$.  
> Calcul de $IJ$ : $IJ = \dfrac{7{,}5 \times 16}{15} = 8\,\mathrm{cm}$.  
> Contrôle : le rapport vaut $k = \dfrac{7{,}5}{15} = 0{,}5$ ; les côtés du petit triangle $OIJ$ sont bien plus petits que ceux du grand.  

Réponse : $OL = 7\,\mathrm{cm}$ ; $IJ = 8\,\mathrm{cm}$

## 7. Calculer une longueur (papillon) — ★★

Adresse : `#/entrainement/12-thales/exo?t=papillon&niv=2&g=1micbhv` · cours : § 2.3 · Configuration papillon

**Calcule $AB$ et $AC$.**

Les points $D$, $A$, $B$ sont alignés dans cet ordre, ainsi que $E$, $A$, $C$. Les droites $(DE)$ et $(BC)$ sont parallèles. On donne $DE = 9\,\mathrm{cm}$, $BC = 15\,\mathrm{cm}$, $AD = 9\,\mathrm{cm}$ et $AE = 3\,\mathrm{cm}$.  

![figure](exos-12-figures/07-papillon.svg)

1. a) Calcule $AB$. → attendu : $AB =$ $15$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{DE}{BC}$) et celui qui contient $AB$. Puis produit en croix.
   - Erreur typique (réponse 27/5) : Rapport retourné : $AB$ est un côté du grand triangle, il doit être plus grand que $AD$.
2. b) Calcule $AC$. → attendu : $AC =$ $5$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{DE}{BC}$) et celui qui contient $AC$. Puis produit en croix.
   - Erreur typique (réponse 9/5) : Rapport retourné : $AC$ est un côté du grand triangle, il doit être plus grand que $AE$.

**Corrigé**

> Les droites $(DB)$ et $(EC)$ sont sécantes en $A$, et $(DE) \parallel (BC)$. D’après le théorème de Thalès :  
> $\dfrac{AD}{AB} = \dfrac{AE}{AC} = \dfrac{DE}{BC} \quad \text{soit} \quad \dfrac{9}{AB} = \dfrac{3}{AC} = \dfrac{9}{15}$  
> Calcul de $AB$ : $AB = \dfrac{15 \times 9}{9} = 15\,\mathrm{cm}$.  
> Calcul de $AC$ : $AC = \dfrac{15 \times 3}{9} = 5\,\mathrm{cm}$.  
> Contrôle : le rapport vaut $k = \dfrac{9}{15} = 0{,}6$ ; les côtés du petit triangle $ADE$ sont bien plus petits que ceux du grand.  

Réponse : $AB = 15\,\mathrm{cm}$ ; $AC = 5\,\mathrm{cm}$

## 8. Segment « restant » — ★★

Adresse : `#/entrainement/12-thales/exo?t=restant&niv=2&g=148wzrr` · cours : § 2.7 · Segment « restant »

**Thalès avec un segment « restant ».**

$I$ est sur $[OK]$, $J$ est sur $[OL]$ et les droites $(IJ)$ et $(KL)$ sont parallèles. On donne $OI = 5\,\mathrm{cm}$, $IK = 3\,\mathrm{cm}$ et $OL = 8\,\mathrm{cm}$.  

![figure](exos-12-figures/08-restant.svg)

1. a) Calcule $OK$. → attendu : $OK =$ $8$ cm
   - Indice : $I$ est sur $[OK]$ : $OK = OI + IK$.
   - Erreur typique (réponse 3) : $IK$ n’est qu’un morceau de $[OK]$.
2. b) Calcule $OJ$, puis $JL$. → attendu : $OJ =$ $5$ cm ; $JL =$ $3$ cm
   - Indice : Rapports : $\dfrac{OI}{OK} = \dfrac{OJ}{OL}$, puis $JL = OL - OJ$.
   - Erreur typique (réponse 40/3) : Tu as utilisé $IK$ : ce n’est un côté d’aucun des deux triangles. Il faut $OK$.
   - Erreur typique (réponse 64/5) : Rapport retourné : le petit triangle en haut.

**Corrigé**

> $I$ est sur $[OK]$, donc $OK = OI + IK = 5 + 3 = 8\,\mathrm{cm}$.  
> Les points $O$, $I$, $K$ sont alignés, ainsi que $O$, $J$, $L$, et $(IJ) \parallel (KL)$. D’après le théorème de Thalès :  
> $\dfrac{OI}{OK} = \dfrac{OJ}{OL} \quad \text{soit} \quad \dfrac{5}{8} = \dfrac{OJ}{8}$  
> Donc $OJ = \dfrac{5 \times 8}{8} = 5\,\mathrm{cm}$, puis $JL = OL - OJ = 8 - 5 = 3\,\mathrm{cm}$.  
> Contrôle : $\dfrac{OI}{OK} = \dfrac{5}{8} = 0{,}625$.  

Réponse : $OK = 8$ ; $OJ = 5$, $JL = 3$ (cm)

## 9. Parallèles ou pas ? (réciproque) — ★★

Adresse : `#/entrainement/12-thales/exo?t=reciproque&niv=2&g=18kayzy` · cours : § 3.2 · Parallèles ou pas : méthode

**Les droites $(GH)$ et $(LM)$ sont-elles parallèles ?**

$G$ est sur $[KL]$ et $H$ est sur $[KM]$. On donne, en cm : $KG = 10$, $KL = 12{,}5$, $KH = 6$, $KM = 7{,}5$. La figure n’indique pas si les droites sont parallèles : il faut le démontrer.  

![figure](exos-12-figures/09-reciproque.svg)

1. a) Produits en croix : calcule $KG \times KM$ et $KL \times KH$. → attendu : $KG \times KM =$ $75$ ; $KL \times KH =$ $75$
   - Indice : On compare $\dfrac{KG}{KL}$ et $\dfrac{KH}{KM}$ sans arrondir : ils sont égaux si et seulement si ces deux produits le sont.
2. b) Les droites $(GH)$ et $(LM)$ sont-elles parallèles ? → attendu : Oui (options : Oui / Non)
   - Indice : Rapports égaux (et points dans le même ordre) → parallèles ; rapports différents → pas parallèles.
   - Si « Non » : Rapports égaux et points dans le même ordre : d’après la réciproque, les droites sont parallèles.

**Corrigé**

> D’une part : $\dfrac{KG}{KL} = \dfrac{10}{12{,}5} = 0{,}8$. D’autre part : $\dfrac{KH}{KM} = \dfrac{6}{7{,}5} = 0{,}8$.  
> Produits en croix : $10 \times 7{,}5 = 75$ et $12{,}5 \times 6 = 75$.  
> On constate que $\dfrac{KG}{KL} = \dfrac{KH}{KM}$, et les points $K$, $G$, $L$ et $K$, $H$, $M$ sont alignés dans le même ordre. D’après la réciproque du théorème de Thalès, $(GH) \parallel (LM)$.  

Réponse : Parallèles

## 10. Parallèles ou pas ? (réciproque) — ★★★

Adresse : `#/entrainement/12-thales/exo?t=reciproque&niv=3&g=n45w4f` · cours : § 3.2 · Parallèles ou pas : méthode

**Les droites $(GH)$ et $(LM)$ sont-elles parallèles ?**

Les points $G$, $K$, $L$ sont alignés dans cet ordre, et $H$ est sur le segment $[KM]$. On donne, en cm : $KG = 6$, $KL = 12$, $KH = 5{,}5$, $KM = 11$. La figure n’indique pas si les droites sont parallèles : il faut le démontrer.  

![figure](exos-12-figures/10-reciproque.svg)

1. a) Produits en croix : calcule $KG \times KM$ et $KL \times KH$. → attendu : $KG \times KM =$ $66$ ; $KL \times KH =$ $66$
   - Indice : On compare $\dfrac{KG}{KL}$ et $\dfrac{KH}{KM}$ sans arrondir : ils sont égaux si et seulement si ces deux produits le sont.
2. b) Les droites $(GH)$ et $(LM)$ sont-elles parallèles ? → attendu : Non (options : Oui / Non)
   - Indice : Compare les rapports, puis regarde la position de $G$ et de $H$ par rapport à $K$.
   - Si « Oui » : Les rapports sont égaux, mais $G$ et $H$ ne sont pas du même côté de $K$ : les points ne sont pas dans le même ordre, la réciproque ne s’applique pas.

**Corrigé**

> D’une part : $\dfrac{KG}{KL} = \dfrac{6}{12} = 0{,}5$. D’autre part : $\dfrac{KH}{KM} = \dfrac{5{,}5}{11} = 0{,}5$.  
> Produits en croix : $6 \times 11 = 66$ et $12 \times 5{,}5 = 66$.  
> Les rapports sont égaux, mais $G$ est de l’autre côté de $K$ par rapport à $L$, alors que $H$ est du même côté que $M$ : les points ne sont pas dans le même ordre. La réciproque ne s’applique pas, et les droites ne sont **pas** parallèles (la parallèle à $(LM)$ passant par $G$ coupe $(KM)$ de l’autre côté de $K$).  

Réponse : Pas parallèles

## 11. Agrandissement, réduction — ★

Adresse : `#/entrainement/12-thales/exo?t=agrandir&niv=1&g=32am34` · cours : § 5.1 · Longueurs, aires, volumes

**Agrandissement.**

On agrandit un logo : un côté de $14\,\mathrm{cm}$ devient $42\,\mathrm{cm}$.  

1. a) Quel est le rapport $k$ ? → attendu : $k =$ $3$
   - Indice : Nouvelle longueur ÷ longueur de départ (correspondante).
   - Erreur typique (réponse 1/3) : Rapport retourné : nouvelle longueur **divisée par** la longueur de départ.
   - Erreur typique (réponse 28) : On multiplie les longueurs par k : ce n’est pas une différence.
2. b) Un autre côté mesure $12\,\mathrm{cm}$. Que devient-il ? → attendu :  $36$ cm
   - Indice : Multiplie par $k$.
   - Erreur typique (réponse 40) : On n’ajoute pas la même longueur : on **multiplie** par k.

**Corrigé**

> $k = \dfrac{42}{14} = 3$ (agrandissement, k > 1).  
> $12 \times 3 = 36$ : $36\,\mathrm{cm}$.  

Réponse : $k = 3$ ; $36\,\mathrm{cm}$

## 12. Agrandissement, réduction — ★★

Adresse : `#/entrainement/12-thales/exo?t=agrandir&niv=2&g=1xzfr1z` · cours : § 5.1 · Longueurs, aires, volumes

**Agrandissement : périmètre et aire.**

Un trapèze a un périmètre de $22\,\mathrm{cm}$ et une aire de $16\,\mathrm{cm}^2$. On l’agrandit avec $k = 3$.  

1. a) Nouveau périmètre ? → attendu :  $66$ cm
   - Indice : Un périmètre est une longueur : × k.
   - Erreur typique (réponse 198) : Le périmètre est une **longueur** : il est multiplié par k, pas par k².
2. b) Nouvelle aire ? → attendu :  $144$ $\mathrm{cm}^2$
   - Indice : Les aires sont multipliées par $k^2$.
   - Erreur typique (réponse 48) : Les aires sont multipliées par $k^2 = 9$, pas par $k$.
   - Erreur typique (réponse 96) : $k^2$, c’est $k \times k$, pas $2k$.

**Corrigé**

> Longueurs (et périmètres) × $k$ : $22 \times 3 = 66\,\mathrm{cm}$.  
> Aires × $k^2 = 9$ : $16 \times 9 = 144\,\mathrm{cm}^2$.  

Réponse : $66\,\mathrm{cm}$ ; $144\,\mathrm{cm}^2$

## 13. Agrandissement, réduction — ★★★

Adresse : `#/entrainement/12-thales/exo?t=agrandir&niv=3&g=qakbmm` · cours : § 5.1 · Longueurs, aires, volumes

**Retrouver le rapport.**

Une réduction multiplie les aires par $\dfrac{1}{4}$.  

1. a) Quel est le rapport $k$ ? → attendu : $k =$ $\dfrac{1}{2}$
   - Indice : $k^2 = \dfrac{1}{4}$ : cherche le nombre positif dont le carré vaut $\dfrac{1}{4}$.
   - Erreur typique (réponse 1/8) : $k^2$ n’est pas $2k$ : on cherche $k$ tel que $k \times k = \dfrac{1}{4}$.
   - Erreur typique (réponse 1/4) : C’est le coefficient des aires ($k^2$), pas $k$.
2. b) Par combien multiplie-t-elle les volumes ? → attendu :  $\dfrac{1}{8}$
   - Indice : Volumes × $k^3$.
   - Erreur typique (réponse 1/4) : Les volumes sont multipliés par $k^3$, pas $k^2$.
   - Erreur typique (réponse 1/16) : $k^3 = k \times k \times k$.
3. c) Un solide de $160\,\mathrm{cm}^3$ subit cette transformation. Son nouveau volume ? → attendu :  $20$ $\mathrm{cm}^3$
   - Indice : Multiplie par $k^3 = \dfrac{1}{8}$.
   - Erreur typique (réponse 40) : Volume : × k³, pas × k².

**Corrigé**

> $k^2 = \dfrac{1}{4}$, donc $k = \dfrac{1}{2}$ (car $\dfrac{1}{2} \times \dfrac{1}{2} = \dfrac{1}{4}$).  
> Volumes : $k^3 = \dfrac{1}{8}$.  
> $160 \times \dfrac{1}{8} = 20\,\mathrm{cm}^3$.  

Réponse : $k = \dfrac{1}{2}$ ; volumes × $\dfrac{1}{8}$ ; $20\,\mathrm{cm}^3$

## 14. Triangles semblables — ★★

Adresse : `#/entrainement/12-thales/exo?t=semblables&niv=2&g=65tx6s` · cours : § 5.3 · Triangles semblables

**Triangles semblables.**

Les triangles $ABC$ et $MNP$ sont semblables, $M$ correspondant à $A$, $N$ à $B$ et $P$ à $C$. $AB = 9\,\mathrm{cm}$, $BC = 5\,\mathrm{cm}$, $AC = 7\,\mathrm{cm}$ et $MN = 13{,}5\,\mathrm{cm}$.  

1. a) Calcule le rapport $k = \dfrac{MN}{AB}$. → attendu : $k =$ $1{,}5$
   - Indice : $[MN]$ est l’homologue de $[AB]$.
   - Erreur typique (réponse 2/3) : Rapport retourné.
2. b) Calcule $NP$ et $MP$. → attendu : $NP =$ $7{,}5$ cm ; $MP =$ $10{,}5$ cm
   - Indice : Côtés homologues : $NP \leftrightarrow BC$, $MP \leftrightarrow AC$. Multiplie par $k$.
   - Erreur typique (réponses 21/2 ; 15/2) : Les deux longueurs sont inversées : respecte la correspondance des sommets.
3. c) Un triangle a des côtés de $3 ; 4 ; 5$ cm, un autre de $6 ; 8 ; 10$ cm. Sont-ils semblables ? → attendu : Oui (options : Oui / Non)
   - Indice : Range les côtés dans l’ordre croissant et compare les trois rapports.
   - Si « Non » : Les trois rapports sont égaux : les côtés sont proportionnels, donc les triangles sont semblables.

**Corrigé**

> a) $k = \dfrac{MN}{AB} = \dfrac{13{,}5}{9} = 1{,}5$.  
> b) $NP = 1{,}5 \times 5 = 7{,}5\,\mathrm{cm}$ et $MP = 1{,}5 \times 7 = 10{,}5\,\mathrm{cm}$.  
> c) $\dfrac{6}{3} = 2 ;\ \dfrac{8}{4} = 2 ;\ \dfrac{10}{5} = 2$ : rapports égaux, côtés proportionnels : semblables.  

Réponse : $k = 1{,}5$ ; $NP = 7{,}5$, $MP = 10{,}5$ ; semblables

## 15. Problèmes (ombres, rampes, routes) — ★★

Adresse : `#/entrainement/12-thales/exo?t=probleme&niv=2&g=17brz68` · cours : § 4.2 · La hauteur d’un arbre

**Deux routes qui se croisent.**

Deux routes droites $(BD)$ et $(CE)$ se croisent en $A$ ; $D$, $A$, $B$ sont alignés dans cet ordre, ainsi que $E$, $A$, $C$. Les tronçons $[DE]$ et $[BC]$ sont parallèles. $AD = 3\,\mathrm{km}$, $AE = 3\,\mathrm{km}$ et $AB = 7{,}5\,\mathrm{km}$.  

![figure](exos-12-figures/15-probleme.svg)

1. Calcule la distance AC. → attendu : $AC =$ $7{,}5$ km
   - Indice : Configuration papillon : mêmes rapports, $\dfrac{AD}{AB} = \dfrac{AE}{AC}$.
   - Erreur typique (réponse 6/5) : Rapport retourné.

**Corrigé**

> Les droites $(BD)$ et $(CE)$ sont sécantes en $A$, et $(DE) \parallel (BC)$. D’après le théorème de Thalès (papillon) : $\dfrac{AD}{AB} = \dfrac{AE}{AC}$, soit $\dfrac{3}{7{,}5} = \dfrac{3}{AC}$.  
> Donc $AC = \dfrac{7{,}5 \times 3}{3} = 7{,}5\,\mathrm{km}$.  

Réponse : $AC = 7{,}5\,\mathrm{km}$

## 16. Problèmes (ombres, rampes, routes) — ★★★

Adresse : `#/entrainement/12-thales/exo?t=probleme&niv=3&g=tprnpo` · cours : § 4.2 · La hauteur d’un arbre

**La charpente.**

La charpente d’un toit a la forme d’un triangle $ABC$ isocèle en $A$, de base $BC = 9{,}6\,\mathrm{m}$ et de hauteur $AH = 3{,}6\,\mathrm{m}$ ($H$ milieu de $[BC]$). On pose une poutre horizontale $[DE]$ à $2{,}7\,\mathrm{m}$ sous le sommet ($D$ sur $[AB]$, $E$ sur $[AC]$). Elle coupe $[AH]$ en $K$.  

![figure](exos-12-figures/16-probleme.svg)

1. a) Calcule $AB$. → attendu : $AB =$ $6$ m
   - Indice : $AHB$ est rectangle en $H$, avec $HB = 4{,}8$ (moitié de la base).
   - Erreur typique (réponse 6408/625) : HB est la **moitié** de la base.
2. b) Calcule la longueur de la poutre $DE$, puis $AD$. → attendu : $DE =$ $7{,}2$ m ; $AD =$ $4{,}5$ m
   - Indice : Dans $AHB$ : $(KD) \parallel (HB)$, donc $\dfrac{AK}{AH} = \dfrac{AD}{AB} = \dfrac{KD}{HB}$ ; puis $DE = 2 \times KD$.
   - Erreur typique (réponse 18/5) : $KD$ n’est que la moitié de la poutre (symétrie).

**Corrigé**

> a) $H$ est le milieu de $[BC]$, donc $HB = 4{,}8\,\mathrm{m}$. $AHB$ est rectangle en $H$ : $AB^2 = 3{,}6^2 + 4{,}8^2 = 36$, donc $AB = 6\,\mathrm{m}$.  
> b) La poutre et la base sont horizontales, donc perpendiculaires à $(AH)$ : $(KD) \parallel (HB)$. Dans le triangle $AHB$, d’après le théorème de Thalès : $\dfrac{AK}{AH} = \dfrac{AD}{AB} = \dfrac{KD}{HB}$, soit $\dfrac{2{,}7}{3{,}6} = \dfrac{AD}{6} = \dfrac{KD}{4{,}8}$.  
> Donc $KD = 3{,}6\,\mathrm{m}$ et, par symétrie, $DE = 2 \times 3{,}6 = 7{,}2\,\mathrm{m}$. Enfin $AD = \dfrac{2{,}7 \times 6}{3{,}6} = 4{,}5\,\mathrm{m}$.  

Réponse : $AB = 6$ ; $DE = 7{,}2$, $AD = 4{,}5$ (m)

## 17. Trouver l’erreur — ★★

Adresse : `#/entrainement/12-thales/exo?t=erreur&niv=2&g=g2wiuv` · cours : Série G · Trouver l’erreur

**Trouve l’erreur.**

Nina affirme : « $\dfrac{AD}{AB} = \dfrac{6}{13} \approx 0{,}46$ et $\dfrac{AE}{AC} = \dfrac{13}{28} \approx 0{,}46$, donc les droites $(DE)$ et $(BC)$ sont parallèles. »  

1. Quelle est l’erreur ? → attendu : On compare des valeurs arrondies : il faut comparer exactement (produits en croix). (options : On compare des valeurs arrondies : il faut comparer exactement (produits en croix). / Un segment « restant » (DB) n’est un côté d’aucun des deux triangles : il faut AB. / Un rapport est retourné : le petit triangle doit être en haut dans tous les rapports. / Les aires sont multipliées par k², pas par k.)
   - Indice : Refais le raisonnement toi-même, étape par étape, et compare.
   - Si « Un segment « restant » (DB) n’est un côté d’aucun des deux triangles : il faut AB. » : Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.
   - Si « Un rapport est retourné : le petit triangle doit être en haut dans tous les rapports. » : Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.
   - Si « Les aires sont multipliées par k², pas par k. » : Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.
2. Calcule les produits en croix. → attendu : $6 \times 28 =$ $168$ ; $13 \times 13 =$ $169$
   - Indice : Produits en croix des deux fractions.
3. Les droites sont-elles parallèles ? → attendu : Non (options : Oui / Non)
   - Indice : Produits différents → rapports différents.
   - Si « Oui » : $168 \neq 169$ : les rapports sont différents.

**Corrigé**

> On compare des valeurs arrondies : il faut comparer exactement (produits en croix).  
> $6 \times 28 = 168$ et $13 \times 13 = 169$ : les rapports sont différents. Les droites ne sont **pas** parallèles (sinon, d’après le théorème de Thalès, les rapports seraient égaux).  

Réponse : On compare des valeurs arrondies : il faut comparer exactement (produits en croix).

## 18. Écrire les rapports — ★★

Adresse : `#/entrainement/12-thales/exo?t=rapports&niv=2&g=l3m3aw` · cours : § 2.4 · Écrire les rapports

**Écris les rapports de Thalès.**

Les points $U$, $O$, $V$ sont alignés dans cet ordre, ainsi que $W$, $O$, $Z$. Les droites $(UW)$ et $(VZ)$ sont parallèles.  

![figure](exos-12-figures/18-rapports.svg)

1. Quelle égalité donne le théorème de Thalès ? → attendu : $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{UW}{VZ}$ (options : $\dfrac{OU}{UV} = \dfrac{OW}{WZ} = \dfrac{UW}{VZ}$ / $\dfrac{OU}{OW} = \dfrac{OV}{OZ} = \dfrac{UW}{VZ}$ / $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{UW}{VZ}$ / $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{VZ}{UW}$)
   - Indice : Petit triangle $OUW$ en haut, grand triangle $OVZ$ en bas, dans le même ordre, sommet commun $O$ en premier.
   - Si « $\dfrac{OU}{UV} = \dfrac{OW}{WZ} = \dfrac{UW}{VZ}$ » : $[UV]$ et $[WZ]$ ne sont des côtés d’aucun des deux triangles $OUW$ et $OVZ$.
   - Si « $\dfrac{OU}{OW} = \dfrac{OV}{OZ} = \dfrac{UW}{VZ}$ » : Chaque rapport compare deux côtés **homologues** (un du petit triangle, celui qui lui correspond dans le grand), pas deux côtés du même triangle.
   - Si « $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{VZ}{UW}$ » : Le dernier rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.
2. Vrai ou faux : $\dfrac{OU}{UV} = \dfrac{UW}{VZ}$ ? → attendu : Faux (options : Vrai / Faux)
   - Indice : $UV$ est-il un côté du triangle $OUW$ ? du triangle $OVZ$ ?
   - Si « Vrai » : $[UV]$ n’est un côté d’aucun des deux triangles : la bonne égalité est $\dfrac{OU}{OV} = \dfrac{UW}{VZ}$.

**Corrigé**

> Petit triangle $OUW$, grand triangle $OVZ$, sommet commun $O$ :  
> $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{UW}{VZ}$  
> $\dfrac{OU}{UV} = \dfrac{UW}{VZ}$ est faux : $[UV]$ n’est un côté d’aucun des deux triangles.  

Réponse : $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{UW}{VZ}$

## 19. Produit en croix — ★★

Adresse : `#/entrainement/12-thales/exo?t=croix&niv=2&g=1jf8new` · cours : § 1.1 · Produit en croix

**Calcule x.**

1. a) $\dfrac{20}{12} = \dfrac{22{,}5}{x}$ → attendu : $x =$ $13{,}5$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 2/27) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 32/3) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 75/2) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
2. b) $\dfrac{42}{30} = \dfrac{x}{35}$ → attendu : $x =$ $49$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 1/49) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 36) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 25) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
3. c) $\dfrac{x}{6} = \dfrac{7{,}5}{5}$ → attendu : $x =$ $9$
   - Indice : Produit en croix : $x$ est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.
   - Erreur typique (réponse 1/9) : Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.
   - Erreur typique (réponse 4) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.
   - Erreur typique (réponse 25/4) : Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.

**Corrigé**

> a) $\dfrac{20}{12} = \dfrac{22{,}5}{x}$ donne $20 \times x = 12 \times 22{,}5$, donc $x = \dfrac{12 \times 22{,}5}{20} = 13{,}5$.  
> b) $\dfrac{42}{30} = \dfrac{x}{35}$ donne $30 \times x = 42 \times 35$, donc $x = \dfrac{42 \times 35}{30} = 49$.  
> c) $\dfrac{x}{6} = \dfrac{7{,}5}{5}$ donne $5 \times x = 6 \times 7{,}5$, donc $x = \dfrac{6 \times 7{,}5}{5} = 9$.  

Réponse : a) $13{,}5$ ; b) $49$ ; c) $9$

## 20. Calculer une longueur (triangles emboîtés) — ★★

Adresse : `#/entrainement/12-thales/exo?t=emboites&niv=2&g=1u3p8hm` · cours : § 2.5 · Exemple : triangles emboîtés

**Calcule $OU$ et $OW$.**

$U$ est sur $[OV]$, $W$ est sur $[OZ]$ et les droites $(UW)$ et $(VZ)$ sont parallèles. On donne $UW = 10\,\mathrm{cm}$, $VZ = 12\,\mathrm{cm}$, $OV = 6\,\mathrm{cm}$ et $OZ = 12\,\mathrm{cm}$.  

![figure](exos-12-figures/20-emboites.svg)

1. a) Calcule $OU$. → attendu : $OU =$ $5$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{UW}{VZ}$) et celui qui contient $OU$. Puis produit en croix.
   - Erreur typique (réponse 36/5) : Rapport retourné : $OU$ est un côté du petit triangle, il doit être plus petit que $OV$.
2. b) Calcule $OW$. → attendu : $OW =$ $10$ cm
   - Indice : Garde deux rapports : celui qu’on connaît entièrement ($\dfrac{UW}{VZ}$) et celui qui contient $OW$. Puis produit en croix.
   - Erreur typique (réponse 72/5) : Rapport retourné : $OW$ est un côté du petit triangle, il doit être plus petit que $OZ$.

**Corrigé**

> Les points $O$, $U$, $V$ sont alignés, ainsi que $O$, $W$, $Z$, et $(UW) \parallel (VZ)$. D’après le théorème de Thalès :  
> $\dfrac{OU}{OV} = \dfrac{OW}{OZ} = \dfrac{UW}{VZ} \quad \text{soit} \quad \dfrac{OU}{6} = \dfrac{OW}{12} = \dfrac{10}{12}$  
> Calcul de $OU$ : $OU = \dfrac{10 \times 6}{12} = 5\,\mathrm{cm}$.  
> Calcul de $OW$ : $OW = \dfrac{10 \times 12}{12} = 10\,\mathrm{cm}$.  
> Contrôle : le rapport vaut $k = \dfrac{10}{12} \approx 0{,}83$ ; les côtés du petit triangle $OUW$ sont bien plus petits que ceux du grand.  

Réponse : $OU = 5\,\mathrm{cm}$ ; $OW = 10\,\mathrm{cm}$
