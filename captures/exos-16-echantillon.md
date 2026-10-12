# Échantillon d’exercices générés — chapitre 16 (Statistiques, v0.5)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

## 1. Effectifs et fréquences — ★

Adresse : `#/entrainement/16-statistiques/exo?t=frequences&niv=1&g=1ml88q4` · cours : § 1 · Vocabulaire et tableaux

**Sondage : parfum de glace choisi.**

On a interrogé des clients sur leur parfum de glace choisi.  

$$\begin{array}{|l|c|c|c|c|}\hline \text{Réponse} & \text{vanille} & \text{chocolat} & \text{fraise} & \text{citron} \\ \hline \text{Effectif} & 7 & 4 & 3 & 6 \\ \hline\end{array}$$

1. a) Quel est l’effectif total ? → attendu : $N =$ $20$
   - Indice : Additionne tous les effectifs.
   - Erreur typique (réponse 4) : C’est le nombre de catégories, pas le nombre d’individus.
2. b) Fréquence de la réponse « citron », en écriture décimale ? → attendu :  $0{,}3$
   - Indice : Fréquence = effectif ÷ effectif total = $\dfrac{6}{20}$.
   - Erreur typique (réponse 10/3) : Inversé : effectif de la valeur ÷ effectif total.
   - Erreur typique (réponse 6) : Ça, c’est l’effectif : divise par l’effectif total.
3. c) La même fréquence en pourcentage ? → attendu :  $30$ %
   - Indice : Multiplie la fréquence par 100.
   - Erreur typique (réponse 3/10) : En pourcentage : multiplie par 100.

**Corrigé**

> $N = 7 + 4 + 3 + 6 = 20$.  
> Fréquence de « citron » : $\dfrac{6}{20} = 0{,}3$, soit $30\,\%$.  
> Contrôle : la somme des fréquences vaut 1 (100 %).  

Réponse : 20 ; 0{,}3 ; 30 %

## 2. Effectifs et fréquences — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=frequences&niv=2&g=lfgw57` · cours : § 1 · Vocabulaire et tableaux

**De la fréquence à l’effectif.**

Sur $240$ jeunes interrogés sur leur style de musique préféré, la fréquence de la réponse « pop » est $0{,}2$.  

1. Combien de jeunes ont répondu « pop » ? → attendu :  $48$
   - Indice : Effectif = fréquence × effectif total.
   - Erreur typique (réponse 20) : Ça, c’est le pourcentage : multiplie la fréquence par l’effectif total.
   - Erreur typique (réponse 12) : Multiplie, ne divise pas.

**Corrigé**

> $0{,}2 \times 240 = 48$ jeunes.  

Réponse : 48

## 3. Diagramme circulaire — ★

Adresse : `#/entrainement/16-statistiques/exo?t=circulaire&niv=1&g=131ilqx` · cours : § 2.2 · Diagramme circulaire

**Calculer les angles.**

On a demandé leur parfum de glace choisi à des clients, pour construire un diagramme circulaire.  

$$\begin{array}{|l|c|c|c|c|}\hline \text{Réponse} & \text{fraise} & \text{chocolat} & \text{vanille} & \text{pistache} \\ \hline \text{Effectif} & 7 & 14 & 11 & 4 \\ \hline\end{array}$$

1. a) Combien de degrés représente un individu ? → attendu :  $10$ °
   - Indice : $360 \div N$, avec $N$ l’effectif total.
   - Erreur typique (réponse 1/10) : Inversé : on partage 360° entre les N individus.
   - Erreur typique (réponse 25/9) : 100 %, c’est pour les pourcentages ; un tour complet fait 360°.
2. b) Angles des secteurs « pistache » et « vanille » ? → attendu : pistache : $40$ ° ; vanille : $110$ °
   - Indice : Effectif × $10^\circ$.
   - Erreur typique (réponses 100/9 ; 275/9) : Ce sont les pourcentages : un tour complet fait 360°, pas 100.

**Corrigé**

> $N = 7 + 14 + 11 + 4 = 36$ : un individu correspond à $\dfrac{360}{36} = 10^\circ$.  
> fraise : $7 \times 10 = 70^\circ$ ; chocolat : $14 \times 10 = 140^\circ$ ; vanille : $11 \times 10 = 110^\circ$ ; pistache : $4 \times 10 = 40^\circ$.  
> Contrôle : $70 + 140 + 110 + 40 = 360$.  

Réponse : 10° ; 40° ; 110°

## 4. Diagramme circulaire — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=circulaire&niv=2&g=l0r7oz` · cours : § 2.2 · Diagramme circulaire

**Du pourcentage à l’angle.**

Un sondage auprès de $500$ clients sur leur parfum de glace choisi donne :  

$$\begin{array}{|l|c|c|c|}\hline \text{Réponse} & \text{citron} & \text{vanille} & \text{fraise} \\ \hline \text{Fréquence} & 15\,\% & 20\,\% & 65\,\% \\ \hline\end{array}$$

1. a) Combien de clients ont choisi « citron » ? → attendu :  $75$
   - Indice : $15\,\%$ de $500$.
   - Erreur typique (réponse 15) : C’est le pourcentage, pas l’effectif.
2. b) Angle du secteur « citron » ? → attendu :  $54$ °
   - Indice : $15\,\%$ de $360^\circ$.
   - Erreur typique (réponse 15) : 15 % ne donne pas 15° : un tour complet fait 360°, pas 100.
   - Erreur typique (réponse 75) : L’angle se calcule sur 360°, pas sur l’effectif.

**Corrigé**

> $0{,}15 \times 500 = 75$ clients.  
> $0{,}15 \times 360^\circ = 54^\circ$ (et non $15^\circ$).  

Réponse : 75 ; 54°

## 5. Lire un diagramme en bâtons — ★

Adresse : `#/entrainement/16-statistiques/exo?t=batons&niv=1&g=10s0gu1` · cours : § 2.1 · Diagramme en bâtons

**Diagramme : pointure.**

Le diagramme donne la pointure pour des élèves.  

![figure](exos-16-figures/05-batons.svg)

1. a) Combien d’élèves pour la valeur $38$ ? → attendu :  $8$
   - Indice : Lis la hauteur du bâton sur l’axe vertical.
   - Erreur typique (réponse 38) : Ça, c’est la valeur (axe horizontal) ; l’effectif se lit sur l’axe vertical.
2. b) Effectif total ? → attendu : $N =$ $50$
   - Indice : Additionne les hauteurs de tous les bâtons.
   - Erreur typique (réponse 5) : C’est le nombre de bâtons ; additionne leurs hauteurs.
   - Erreur typique (réponse 190) : Additionne les effectifs (hauteurs), pas les valeurs.
3. c) Fréquence de la valeur $38$, en pourcentage ? → attendu :  $16$ %
   - Indice : $\dfrac{8}{50} \times 100$.
   - Erreur typique (réponse 4/25) : Multiplie par 100 pour un pourcentage.

**Corrigé**

> Effectifs lus : 36 → 9 ; 37 → 13 ; 38 → 8 ; 39 → 6 ; 40 → 14.  
> $N = 9 + 13 + 8 + 6 + 14 = 50$.  
> $\dfrac{8}{50} = 0{,}16$, soit $16\,\%$.  

Réponse : 8 ; 50 ; 16 %

## 6. Lire un diagramme en bâtons — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=batons&niv=2&g=esq1f4` · cours : § 2.1 · Diagramme en bâtons

**Diagramme : nombre de frères et sœurs.**

Le diagramme donne le nombre de frères et sœurs pour $29$ élèves.  

![figure](exos-16-figures/06-batons.svg)

1. a) Moyenne (arrondie au dixième si besoin) ? → attendu :  $2{,}2$
   - Indice : Somme des « valeur × effectif », divisée par l’effectif total $N = 29$.
   - Erreur typique (réponse 2) : Pondère par les effectifs : chaque valeur compte autant de fois que son effectif.
2. b) Médiane ? → attendu :  $3$
   - Indice : $N = 29$ est impair : cherche la $15^{\text{e}}$ valeur avec les effectifs cumulés.
   - Erreur typique (réponse 2) : La médiane se calcule sur les 29 valeurs, pas sur la liste des valeurs possibles.
   - Erreur typique (réponse 4) : C’est la valeur la plus fréquente, pas forcément la médiane.
3. c) Étendue ? → attendu :  $4$
   - Indice : Plus grande valeur moins plus petite valeur (pas les effectifs).
   - Erreur typique (réponse 7) : Calcule l’étendue sur les valeurs, pas sur les effectifs.

**Corrigé**

> Effectifs lus : 0 → 8 ; 1 → 3 ; 2 → 2 ; 3 → 7 ; 4 → 9 ; $N = 29$.  
> Moyenne : $\dfrac{0 \times 8 + 1 \times 3 + 2 \times 2 + 3 \times 7 + 4 \times 9}{29} = \dfrac{64}{29} \approx 2{,}2$.  
> Médiane : effectifs cumulés 8, 11, 13, 20, 29 ; la $15^{\text{e}}$ valeur est $3$, donc la médiane est $3$.  
> Étendue : $4 - 0 = 4$.  

Réponse : ≈ 2{,}2 ; 3 ; 4

## 7. Moyenne — ★

Adresse : `#/entrainement/16-statistiques/exo?t=moyenne&niv=1&g=u1lnd0` · cours : § 3.1 · Moyenne

**Moyenne d’une série.**

Températures relevées à midi pendant 5 jours (en °C) : $12$ ; $25$ ; $17$ ; $18$ ; $22$.  

1. Calcule la moyenne. → attendu : $\bar{x} =$ $18{,}8$ °C
   - Indice : Additionne toutes les valeurs, puis divise par le nombre de valeurs.
   - Erreur typique (réponse 94) : Ça, c’est la somme : divise-la par le nombre de valeurs.
   - Erreur typique (réponse 47/2) : Il y a 5 valeurs, pas 4.
   - Erreur typique (réponse 157/10) : Il y a 5 valeurs, pas 6.

**Corrigé**

> Somme : $12 + 25 + 17 + 18 + 22 = 94$.  
> Moyenne : $\dfrac{94}{5} = 18{,}8$ °C.  
> Contrôle : la moyenne est bien entre $12$ et $25$.  

Réponse : 18{,}8

## 8. Moyenne — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=moyenne&niv=2&g=1dgq9vm` · cours : § 3.1 · Moyenne

**Moyenne avec coefficients.**

Au brevet blanc, Amina obtient : $10$ en anglais (coefficient $1$), $16$ en EPS (coefficient $4$), $6$ en histoire-géo (coefficient $1$), $7$ en sciences (coefficient $4$).  

1. Calcule sa moyenne (arrondie au dixième si besoin). → attendu : $\bar{x} =$ $10{,}8$
   - Indice : Les coefficients jouent le rôle des effectifs : somme des « note × coefficient », divisée par la somme des coefficients.
   - Erreur typique (réponse 49/5) : Tu as oublié les coefficients.
   - Erreur typique (réponse 27) : Divise par la somme des coefficients (10), pas par le nombre de notes.

**Corrigé**

> $\dfrac{10 \times 1 + 16 \times 4 + 6 \times 1 + 7 \times 4}{1 + 4 + 1 + 4} = \dfrac{108}{10} = 10{,}8$.  
> Contrôle : sans coefficients, on trouverait $\dfrac{39}{4} \approx 9{,}8$ ; les matières à fort coefficient pèsent plus lourd.  

Réponse : 10{,}8

## 9. Raisonner avec la moyenne — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=rebours&niv=2&g=1rjh78e` · cours : § 3.1 · Moyenne

**La note à viser.**

Après $6$ contrôles, la moyenne de Ana est $8$. Elle veut atteindre $9$ de moyenne avec le contrôle suivant.  

1. Quelle note doit-elle obtenir au contrôle suivant ? → attendu :  $15$
   - Indice : Total nécessaire : $9$ × $7$ notes.
   - Erreur typique (réponse 10) : L’ancienne moyenne compte pour 6 notes, pas pour une seule.
   - Erreur typique (réponse 9) : Avoir 9 ne suffit pas : il faut rattraper le retard des notes précédentes.

**Corrigé**

> Total nécessaire : $7 \times 9 = 63$ points.  
> Total actuel : $6 \times 8 = 48$.  
> Note nécessaire : $63 - 48 = 15$.  

Réponse : 15

## 10. Raisonner avec la moyenne — ★★★

Adresse : `#/entrainement/16-statistiques/exo?t=rebours&niv=3&g=xc9jy4` · cours : § 3.1 · Moyenne

**Regrouper deux groupes.**

Classe A : $12$ élèves, $15$ de moyenne au contrôle.  
Classe B : $26$ élèves, $17$ de moyenne au contrôle.  

1. a) Total pour le groupe « classe A » ? → attendu :  $180$
   - Indice : Moyenne × effectif = total.
   - Erreur typique (réponse 15) : Multiplie la moyenne par l’effectif.
2. b) Moyenne de l’ensemble des $38$ élèves (arrondie au dixième si besoin) ? → attendu :  $16{,}4$
   - Indice : Additionne les deux totaux, puis divise par l’effectif total.
   - Erreur typique (réponse 16) : Ce n’est pas la moyenne des deux moyennes : les groupes n’ont pas le même effectif.

**Corrigé**

> Totaux : $12 \times 15 = 180$ et $26 \times 17 = 442$.  
> $\dfrac{180 + 442}{38} = \dfrac{622}{38} \approx 16{,}4$.  
> $16$ serait la moyenne des deux moyennes, comme si les groupes avaient le même effectif ; le groupe le plus nombreux pèse plus.  

Réponse : 180 ; ≈ 16{,}4

## 11. Médiane et étendue — ★

Adresse : `#/entrainement/16-statistiques/exo?t=mediane&niv=1&g=1qc0mlm` · cours : § 4.1 · Médiane

**Médiane et étendue.**

Scores à un jeu vidéo : $19$ ; $57$ ; $37$ ; $39$ ; $33$ ; $88$ ; $42$ ; $95$.  

1. a) Médiane ? → attendu :  $40{,}5$
   - Indice : Range d’abord la série dans l’ordre croissant.
   - Erreur typique (réponse 36) : Tu as pris le milieu sans ranger la série.
   - Erreur typique (réponse 39) : Effectif pair : moyenne des deux valeurs du milieu.
   - Erreur typique (réponse 42) : Effectif pair : moyenne des deux valeurs du milieu.
   - Erreur typique (réponse 513/10) : Ça, c’est la moyenne.
2. b) Étendue ? → attendu :  $76$
   - Indice : Plus grande valeur moins plus petite.

**Corrigé**

> Rangée : $19 \; ; \; 33 \; ; \; 37 \; ; \; 39 \; ; \; 42 \; ; \; 57 \; ; \; 88 \; ; \; 95$ (8 valeurs).  
> $8$ est pair : médiane $\dfrac{39 + 42}{2} = 40{,}5$.  
> Étendue : $95 - 19 = 76$.  

Réponse : 40{,}5 ; 76

## 12. Médiane et étendue — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=mediane&niv=2&g=e7n09u` · cours : § 4.1 · Médiane

**Médiane d’un tableau d’effectifs.**

Pointure de $31$ élèves :  

$$\begin{array}{|l|c|c|c|c|c|c|}\hline \text{Pointure} & 36 & 37 & 38 & 39 & 40 & 41 \\ \hline \text{Effectif} & 7 & 6 & 1 & 4 & 5 & 8 \\ \hline\end{array}$$

1. a) Combien d’élèves ont une valeur inférieure ou égale à $37$ ? → attendu :  $13$
   - Indice : C’est l’effectif cumulé croissant : additionne les effectifs jusqu’à cette valeur incluse.
   - Erreur typique (réponse 6) : Ça, c’est l’effectif de la seule valeur 37 : ajoute ceux des valeurs plus petites.
   - Erreur typique (réponse 7) : Inférieure **ou égale** : inclus la valeur 37.
2. b) Médiane de la série ? → attendu :  $39$
   - Indice : $N = 31$ : la médiane est la $16^{\text{e}}$ valeur ; regarde les effectifs cumulés.
   - Erreur typique (réponse 77/2) : La médiane porte sur les 31 individus, pas sur la liste des valeurs possibles.
   - Erreur typique (réponse 41) : C’est la valeur la plus fréquente, pas la médiane.
   - Erreur typique (réponse 16) : C’est le rang du milieu, pas la valeur.

**Corrigé**

> Effectifs cumulés croissants : 36 → 7 ; 37 → 13 ; 38 → 14 ; 39 → 18 ; 40 → 23 ; 41 → 31 ; $N = 31$.  
> a) $13$ élèves.  
> b) $31$ est impair : la médiane est la $16^{\text{e}}$ valeur, c’est-à-dire $39$.  

Réponse : 13 ; 39

## 13. Classes et histogramme — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=classes&niv=2&g=z19p0u` · cours : § 2.3 · Histogramme

**Histogramme : durée du trajet domicile-collège.**

L’histogramme donne la durée du trajet domicile-collège (en min) de $43$ élèves.  

![figure](exos-16-figures/13-classes.svg)

1. a) Combien d’élèves dans la classe $[20\,;30[$ ? → attendu :  $5$
   - Indice : Hauteur du rectangle au-dessus de cette classe.
   - Erreur typique (réponse 20) : Ça, c’est une borne de la classe ; l’effectif se lit en hauteur.
2. b) Pourcentage des élèves dont la durée du trajet domicile-collège est inférieure à $10\,\mathrm{min}$ (au dixième si besoin) ? → attendu :  $18{,}6$ %
   - Indice : Additionne les effectifs des classes situées avant 10, puis divise par $N = 43$ et multiplie par 100.
   - Erreur typique (réponse 8) : Ça, c’est l’effectif : divise par N puis multiplie par 100.
3. c) Estime la moyenne de la série (en min) à l’aide des centres des classes, au dixième si besoin. → attendu :  $26{,}2$ min
   - Indice : Remplace chaque classe par son centre ($\dfrac{0 + 10}{2} = 5$ pour la première), puis fais la moyenne pondérée.
   - Erreur typique (réponse 106/5) : Prends le centre de chaque classe, pas sa borne inférieure.
   - Erreur typique (réponse 25) : Pondère par les effectifs.

**Corrigé**

> $N = 8 + 9 + 5 + 12 + 9 = 43$.  
> a) $5$ élèves.  
> b) $\dfrac{8}{43} \times 100 \approx 18{,}6\,\%$.  
> c) Centres $5$, $15$, $25$, $35$, $45$ : $\dfrac{5 \times 8 + 15 \times 9 + 25 \times 5 + 35 \times 12 + 45 \times 9}{43} = \dfrac{1125}{43} \approx 26{,}2$ min environ (valeur approchée).  

Réponse : 5 ; ≈ 18{,}6 % ; ≈ 26{,}2 min

## 14. Classes et histogramme — ★★★

Adresse : `#/entrainement/16-statistiques/exo?t=classes&niv=3&g=wunqy1` · cours : § 2.3 · Histogramme

**Histogramme : masse.**

L’histogramme donne la masse (en kg) de $34$ colis.  

![figure](exos-16-figures/14-classes.svg)

1. a) Combien de colis dans la classe $[8\,;10[$ ? → attendu :  $9$
   - Indice : Hauteur du rectangle au-dessus de cette classe.
   - Erreur typique (réponse 8) : Ça, c’est une borne de la classe ; l’effectif se lit en hauteur.
2. b) Pourcentage des colis dont la masse est inférieure à $8\,\mathrm{kg}$ (au dixième si besoin) ? → attendu :  $73{,}5$ %
   - Indice : Additionne les effectifs des classes situées avant 8, puis divise par $N = 34$ et multiplie par 100.
   - Erreur typique (réponse 25) : Ça, c’est l’effectif : divise par N puis multiplie par 100.
   - Erreur typique (réponse 147/5) : Prends toutes les classes en dessous, pas seulement la dernière.
3. c) Dans quelle classe se trouve la médiane ? → attendu : $[6\,;8[$ (options : $[4\,;6[$ / $[6\,;8[$ / $[2\,;4[$ / $[8\,;10[$)
   - Indice : Calcule les effectifs cumulés et repère le rang du milieu ($N = 34$).
   - Si « $[4\,;6[$ » : Effectifs cumulés : 7, 15, 25, 34. Cherche le rang du milieu.
   - Si « $[2\,;4[$ » : Effectifs cumulés : 7, 15, 25, 34. Cherche le rang du milieu.
   - Si « $[8\,;10[$ » : Effectifs cumulés : 7, 15, 25, 34. Cherche le rang du milieu.

**Corrigé**

> $N = 7 + 8 + 10 + 9 = 34$.  
> a) $9$ colis.  
> b) $7 + 8 + 10 = 25$ ; $\dfrac{25}{34} \times 100 \approx 73{,}5\,\%$.  
> c) Effectifs cumulés : 7, 15, 25, 34. Les $17^{\text{e}}$ et $18^{\text{e}}$ valeurs sont dans la classe $[6\,;8[$ : la médiane est dans cette classe (on ne connaît pas sa valeur exacte).  

Réponse : 9 ; ≈ 73{,}5 % ; $[6\,;8[$

## 15. Interpréter, critiquer — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=interpreter&niv=2&g=ygjxf4` · cours : § 4.2 · Moyenne ou médiane ?

**Moyenne ou médiane ?**

Salaires mensuels (en €) des 5 salariés d’une petite entreprise : $2200$ ; $2500$ ; $2300$ ; $6000$ ; $1900$.  

1. a) Moyenne et médiane de ces salaires ? → attendu : Moyenne : $2980$ € ; Médiane : $2300$ €
   - Indice : Moyenne : somme ÷ nombre de salaires. Médiane : range d’abord.
   - Erreur typique (réponses 2300 ; 2980) : Tu as inversé moyenne et médiane.
2. b) Quel indicateur décrit le mieux un salaire « typique » de cette entreprise ? → attendu : La médiane (options : La moyenne / Les deux se valent / La médiane)
   - Indice : Combien de salariés gagnent plus que la moyenne ?
   - Si « La moyenne » : La moyenne est tirée vers le haut par le très gros salaire.
   - Si « Les deux se valent » : Ici, elles sont très différentes : une valeur extrême déplace la moyenne, pas la médiane.

**Corrigé**

> Moyenne : $\dfrac{14\,900}{5} = 2980$ €.  
> Rangés : $1900 \; ; \; 2200 \; ; \; 2300 \; ; \; 2500 \; ; \; 6000$ ; médiane $2300$ €.  
> La médiane décrit mieux un salaire typique : un seul salarié gagne plus que la moyenne, tirée vers le haut par $6000$ €.  

Réponse : 2980 € ; 2300 € ; la médiane

## 16. Trouver l’erreur — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=erreur&niv=2&g=1f5dn04` · cours : § 4.1 · Médiane

**Trouve l’erreur.**

Yanis écrit : « La moyenne du groupe est $9$, donc la moitié des élèves a plus de $9$. »  
Notes du groupe : $7$ ; $7$ ; $19$ ; $5$ ; $7$.  

1. a) Quelle est l’erreur ? → attendu : Il a confondu moyenne et médiane. (options : Il n’a pas tenu compte des effectifs. / Il a confondu moyenne et médiane. / Il n’a pas rangé la série avant de prendre la valeur du milieu. / Il a confondu pourcentage et angle.)
   - Indice : Refais le calcul toi-même en suivant la méthode du cours.
   - Si « Il n’a pas tenu compte des effectifs. » : Relis son raisonnement : ce n’est pas là que ça coince.
   - Si « Il n’a pas rangé la série avant de prendre la valeur du milieu. » : Relis son raisonnement : ce n’est pas là que ça coince.
   - Si « Il a confondu pourcentage et angle. » : Relis son raisonnement : ce n’est pas là que ça coince.
2. b) Combien d’élèves ont réellement plus de $9$ ? → attendu :  $1$
   - Indice : Compte-les dans la liste.

**Corrigé**

> « Au moins la moitié au-dessus » est une propriété de la **médiane**, pas de la moyenne.  
> Ici, la moyenne vaut bien $\dfrac{45}{5} = 9$, mais seul $1$ élève a plus de $9$ : la note $19$ tire la moyenne vers le haut.  

Réponse : 1

## 17. Effectifs et fréquences — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=frequences&niv=2&g=2wo4gp` · cours : § 1 · Vocabulaire et tableaux

**De la fréquence à l’effectif.**

Sur $120$ élèves interrogés sur leur moyen de transport pour venir au collège, la fréquence de la réponse « train » est $75\,\%$.  

1. Combien d’élèves ont répondu « train » ? → attendu :  $90$
   - Indice : Effectif = fréquence × effectif total.
   - Erreur typique (réponse 75) : Ça, c’est le pourcentage : multiplie la fréquence par l’effectif total.
   - Erreur typique (réponse 8/5) : Multiplie, ne divise pas.

**Corrigé**

> $75\,\% \text{ de } 120 = 0{,}75 \times 120 = 90$ élèves.  

Réponse : 90

## 18. Diagramme circulaire — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=circulaire&niv=2&g=66lsrz` · cours : § 2.2 · Diagramme circulaire

**Du pourcentage à l’angle.**

Un sondage auprès de $1200$ clients sur leur parfum de glace choisi donne :  

$$\begin{array}{|l|c|c|c|}\hline \text{Réponse} & \text{chocolat} & \text{fraise} & \text{citron} \\ \hline \text{Fréquence} & 25\,\% & 30\,\% & 45\,\% \\ \hline\end{array}$$

1. a) Combien de clients ont choisi « chocolat » ? → attendu :  $300$
   - Indice : $25\,\%$ de $1200$.
   - Erreur typique (réponse 25) : C’est le pourcentage, pas l’effectif.
2. b) Angle du secteur « chocolat » ? → attendu :  $90$ °
   - Indice : $25\,\%$ de $360^\circ$.
   - Erreur typique (réponse 25) : 25 % ne donne pas 25° : un tour complet fait 360°, pas 100.
   - Erreur typique (réponse 300) : L’angle se calcule sur 360°, pas sur l’effectif.

**Corrigé**

> $0{,}25 \times 1200 = 300$ clients.  
> $0{,}25 \times 360^\circ = 90^\circ$ (et non $25^\circ$).  

Réponse : 300 ; 90°

## 19. Lire un diagramme en bâtons — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=batons&niv=2&g=c8ax39` · cours : § 2.1 · Diagramme en bâtons

**Diagramme : pointure.**

Le diagramme donne la pointure pour $23$ élèves.  

![figure](exos-16-figures/19-batons.svg)

1. a) Moyenne (arrondie au dixième si besoin) ? → attendu :  $39{,}2$
   - Indice : Somme des « valeur × effectif », divisée par l’effectif total $N = 23$.
   - Erreur typique (réponse 77/2) : Pondère par les effectifs : chaque valeur compte autant de fois que son effectif.
2. b) Médiane ? → attendu :  $40$
   - Indice : $N = 23$ est impair : cherche la $12^{\text{e}}$ valeur avec les effectifs cumulés.
   - Erreur typique (réponse 77/2) : La médiane se calcule sur les 23 valeurs, pas sur la liste des valeurs possibles.
   - Erreur typique (réponse 41) : C’est la valeur la plus fréquente, pas forcément la médiane.
3. c) Étendue ? → attendu :  $5$
   - Indice : Plus grande valeur moins plus petite valeur (pas les effectifs).
   - Erreur typique (réponse 10) : Calcule l’étendue sur les valeurs, pas sur les effectifs.

**Corrigé**

> Effectifs lus : 36 → 3 ; 37 → 4 ; 38 → 1 ; 39 → 3 ; 40 → 1 ; 41 → 11 ; $N = 23$.  
> Moyenne : $\dfrac{36 \times 3 + 37 \times 4 + 38 \times 1 + 39 \times 3 + 40 \times 1 + 41 \times 11}{23} = \dfrac{902}{23} \approx 39{,}2$.  
> Médiane : effectifs cumulés 3, 7, 8, 11, 12, 23 ; la $12^{\text{e}}$ valeur est $40$, donc la médiane est $40$.  
> Étendue : $41 - 36 = 5$.  

Réponse : ≈ 39{,}2 ; 40 ; 5

## 20. Moyenne — ★★

Adresse : `#/entrainement/16-statistiques/exo?t=moyenne&niv=2&g=1kqdr6v` · cours : § 3.1 · Moyenne

**Moyenne avec coefficients.**

Au brevet blanc, Maëlle obtient : $13$ en sciences (coefficient $2$), $14$ en EPS (coefficient $1$), $10$ en histoire-géo (coefficient $2$).  

1. Calcule sa moyenne (arrondie au dixième si besoin). → attendu : $\bar{x} =$ $12$
   - Indice : Les coefficients jouent le rôle des effectifs : somme des « note × coefficient », divisée par la somme des coefficients.
   - Erreur typique (réponse 123/10) : Tu as oublié les coefficients.
   - Erreur typique (réponse 20) : Divise par la somme des coefficients (5), pas par le nombre de notes.

**Corrigé**

> $\dfrac{13 \times 2 + 14 \times 1 + 10 \times 2}{2 + 1 + 2} = \dfrac{60}{5} = 12$.  
> Contrôle : sans coefficients, on trouverait $\dfrac{37}{3} \approx 12{,}3$ ; les matières à fort coefficient pèsent plus lourd.  

Réponse : 12
