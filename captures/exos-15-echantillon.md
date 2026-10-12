# Échantillon d’exercices générés — chapitre 15 (Géométrie dans l’espace, v0.5)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

## 1. Faces, arêtes, sommets — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=solides&niv=1&g=mw3a4h` · cours : § 1.1 · Polyèdres

**Compter.**

1. a) Faces, arêtes et sommets d’une pyramide à base triangulaire ? → attendu : Faces : $4$ ; Arêtes : $6$ ; Sommets : $4$
   - Indice : La base a 3 côtés : une face latérale par côté, plus la base ; une arête latérale par sommet de la base.
   - Erreur typique (réponses 5 ; 9 ; 6) : Ça, ce sont les nombres d’un prisme : une pyramide n’a qu’une base.
2. b) Faces, arêtes et sommets d’un prisme droit à base pentagonale ? → attendu : Faces : $7$ ; Arêtes : $15$ ; Sommets : $10$
   - Indice : Deux bases de 5 côtés et 5 faces latérales.
   - Erreur typique (réponses 6 ; 10 ; 6) : Ça, ce sont les nombres d’une pyramide : un prisme a deux bases.

**Corrigé**

> a) Base à 3 côtés : 3 faces latérales + la base = $4$ faces ; 3 arêtes de base + 3 arêtes latérales = $6$ arêtes ; 3 sommets de base + le sommet = $4$ sommets. Contrôle (Euler) : $4 + 4 - 6 = 2$.  
> b) Deux bases + 5 faces latérales = $7$ faces ; 5 arêtes par base et 5 arêtes latérales = $15$ arêtes ; 5 sommets par base = $10$ sommets. Contrôle (Euler) : $7 + 10 - 15 = 2$.  

Réponse : 4 ; 6 ; 4 | 7 ; 15 ; 10

## 2. Faces, arêtes, sommets — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=solides&niv=2&g=140iiui` · cours : § 1.1 · Polyèdres

**Solide de révolution.**

1. a) On fait tourner un demi-disque de diamètre 4 cm autour de ce diamètre. Quel solide obtient-on ? → attendu : Une boule (options : Un cylindre / Un cône / Une boule)
   - Indice : Imagine la figure qui tourne autour de l’axe.
   - Si « Un cylindre » : Un rectangle donne un cylindre.
   - Si « Un cône » : Un triangle rectangle donne un cône.
2. b) Rayon de la boule ? → attendu :  $2$ cm
   - Indice : Moitié du diamètre.
   - Erreur typique (réponse 4) : C’est le diamètre : le rayon en est la moitié.

**Corrigé**

> a) Une boule.  
> b) Rayon $4 \div 2 = 2\,\mathrm{cm}$.  

Réponse : Une boule

## 3. Patrons du cube — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=patron&niv=1&g=15zqs3y` · cours : § 3.2 · Patrons du cube

**Patron ou pas ?**

![figure](exos-15-figures/03-patron.svg)

1. Cet assemblage de six carrés est-il un patron de cube ? → attendu : Oui (options : Oui / Non)
   - Indice : Choisis un carré pour le dessous et replie les autres un par un. Deux carrés séparés par un carré dans une rangée sont opposés.
   - Si « Non » : Plie-le mentalement : chaque carré trouve une place différente.

**Corrigé**

> Oui : en repliant les carrés autour de l’un d’eux pris comme dessous, les six carrés occupent six places différentes (dessous, dessus, avant, arrière, gauche, droite).  

Réponse : oui

## 4. Patrons du cube — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=patron&niv=2&g=1uuyaj5` · cours : § 3.2 · Patrons du cube

**Faces opposées.**

Ce patron de cube est numéroté.  

![figure](exos-15-figures/04-patron.svg)

1. a) Une fois le cube plié, quelle face est opposée à la face 3 ? → attendu : 5 (options : 1 / 2 / 4 / 5 / 6)
   - Indice : Dans une rangée, deux carrés séparés par un carré sont opposés ; sinon, replie mentalement.
   - Si « 1 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
   - Si « 2 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
   - Si « 4 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
   - Si « 6 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
2. b) Une fois le cube plié, quelle face est opposée à la face 2 ? → attendu : 1 (options : 1 / 3 / 4 / 5 / 6)
   - Indice : Dans une rangée, deux carrés séparés par un carré sont opposés ; sinon, replie mentalement.
   - Si « 3 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
   - Si « 4 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
   - Si « 5 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.
   - Si « 6 » : Deux faces opposées ne se touchent jamais, même par un coin du patron replié.

**Corrigé**

> a) La face 5 est opposée à la face 3.  
> b) La face 1 est opposée à la face 2.  

Réponse : a) La face 5 est opposée à la face 3. b) La face 1 est opposée à la face 2.

## 5. Patrons du cube — ★★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=patron&niv=3&g=lpp3y1` · cours : § 3.2 · Patrons du cube

**Le patron d’un dé.**

On fabrique un dé avec ce patron ; trois faces sont déjà numérotées.  

![figure](exos-15-figures/05-patron.svg)

1. Sur un dé, deux faces opposées ont pour somme 7. Quel nombre faut-il écrire sur la face « ? » ? → attendu :  $1$
   - Indice : Cherche la face opposée à « ? » : elle ne la touche pas une fois le cube plié (dans une rangée, deux carrés séparés par un carré sont opposés).
   - Erreur typique (réponse 2) : Tu as complété la face opposée à une autre face : cherche celle qui est opposée à « ? ».
   - Erreur typique (réponse 3) : Tu as complété la face opposée à une autre face : cherche celle qui est opposée à « ? ».
   - Erreur typique (réponse 6) : C’est le nombre de la face opposée ; « ? » porte le complément à 7.

**Corrigé**

> Une fois le patron plié, la face « ? » est opposée à la face 6. Donc « ? » porte $7 - 6 = 1$.  

Réponse : 1

## 6. Perspective cavalière — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=cavaliere&niv=1&g=1p3e8su` · cours : § 2.1 · Perspective cavalière

**Dessiner un pavé.**

Perspective cavalière : fuyantes à 45°, coefficient 0,5.  

1. a) Pavé de 9 cm de largeur, 8 cm de profondeur et 7 cm de hauteur, face avant de 9 cm sur 7 cm. Longueurs à tracer ? → attendu : Largeur : $9$ cm ; Hauteur : $7$ cm ; Fuyantes : $4$ cm
   - Indice : Face avant en vraie grandeur ; fuyantes réduites de moitié.
   - Erreur typique (réponses 9 ; 7 ; 8) : Les fuyantes sont réduites : multiplie la profondeur par 0,5.
   - Erreur typique (réponses 9/2 ; 7/2 ; 4) : Seules les fuyantes sont réduites : la face avant est en vraie grandeur.
2. b) Sur un autre dessin, une fuyante mesure 4 cm et une arête de la face avant 2 cm. Longueurs réelles ? → attendu : Fuyante : $8$ cm ; Face avant : $2$ cm
   - Indice : Une fuyante dessinée est la moitié de la vraie longueur.
   - Erreur typique (réponses 2 ; 2) : Pour retrouver la vraie longueur, on divise par 0,5 (on double).

**Corrigé**

> a) Face avant en vraie grandeur : $9\,\mathrm{cm}$ et $7\,\mathrm{cm}$ ; fuyantes : $8 \times 0{,}5 = 4\,\mathrm{cm}$.  
> b) $4 \div 0{,}5 = 8\,\mathrm{cm}$ ; la face avant est en vraie grandeur : $2\,\mathrm{cm}$.  

Réponse : 9 ; 7 ; 4 ; 8 ; 2

## 7. Perspective cavalière — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=cavaliere&niv=2&g=h4q9wm` · cours : § 2.1 · Perspective cavalière

**Sur le dessin ou dans la réalité ?**

On dessine un cube $ABCDEFGH$ en perspective cavalière, face avant $ABFE$. Pour chaque affirmation :  

1. a) L’angle $\widehat{ABC}$ est droit. → attendu : Faux sur le dessin, vrai en réalité (options : Vrai sur le dessin et en réalité / Faux sur le dessin, vrai en réalité / Faux dans les deux cas)
   - Indice : Seules la face avant et les faces parallèles sont en vraie grandeur ; le parallélisme est toujours conservé.
   - Si « Vrai sur le dessin et en réalité » : Sur le dessin il mesure 135° ; dans le cube c’est un angle droit.
   - Si « Faux dans les deux cas » : Dans un cube, c’est vrai.
2. b) La face $BCGF$ est un carré. → attendu : Faux sur le dessin, vrai en réalité (options : Vrai sur le dessin et en réalité / Faux sur le dessin, vrai en réalité / Faux dans les deux cas)
   - Indice : Seules la face avant et les faces parallèles sont en vraie grandeur ; le parallélisme est toujours conservé.
   - Si « Vrai sur le dessin et en réalité » : Elle est dessinée en parallélogramme, mais c’est un carré dans le cube.
   - Si « Faux dans les deux cas » : Dans un cube, c’est vrai.
3. c) $(AE)$ et $(CG)$ sont parallèles. → attendu : Vrai sur le dessin et en réalité (options : Vrai sur le dessin et en réalité / Faux sur le dessin, vrai en réalité / Faux dans les deux cas)
   - Indice : Seules la face avant et les faces parallèles sont en vraie grandeur ; le parallélisme est toujours conservé.
   - Si « Faux sur le dessin, vrai en réalité » : Le parallélisme est conservé par la perspective cavalière.
   - Si « Faux dans les deux cas » : Dans un cube, c’est vrai.

**Corrigé**

> a) Faux sur le dessin, vrai en réalité : sur le dessin il mesure 135° ; dans le cube c’est un angle droit.  
> b) Faux sur le dessin, vrai en réalité : elle est dessinée en parallélogramme, mais c’est un carré dans le cube.  
> c) Vrai sur le dessin et en réalité : le parallélisme est conservé par la perspective cavalière.  

Réponse : faux/vrai ; faux/vrai ; vrai/vrai

## 8. Vues et plan coté — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=vues&niv=1&g=2fpcqh` · cours : § 4 · Les vues

**Plan coté.**

Voici la vue de dessus d’un assemblage de cubes ; chaque case indique la hauteur de la pile (case vide : pas de pile).  

![figure](exos-15-figures/08-vues.svg)

1. a) Combien de cubes compte l’assemblage ? → attendu :  $12$
   - Indice : Additionne les hauteurs de toutes les piles.
   - Erreur typique (réponse 8) : Tu n’as compté que les cubes vus de face : des cubes sont cachés derrière.
   - Erreur typique (réponse 4) : Ça, c’est le nombre de piles : additionne leurs hauteurs.
2. b) Vue de face : hauteur de chaque colonne, de gauche à droite ? → attendu : Colonne 1 : $4$ ; Colonne 2 : $4$
   - Indice : Dans chaque colonne, on voit la pile la plus haute (devant ou derrière).
   - Erreur typique (réponses 4 ; 3) : Tu n’as regardé que la rangée de devant : une pile plus haute derrière se voit au-dessus.

**Corrigé**

> a) $1 + 4 + 4 + 3 = 12$ cubes.  
> b) Vue de face : colonne 1 : $\max(1\,;4) = 4$ ; colonne 2 : $\max(4\,;3) = 4$.  

Réponse : 12 cubes ; face 4, 4

## 9. Vues et plan coté — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=vues&niv=2&g=1hfv3eq` · cours : § 4 · Les vues

**Plan coté.**

Voici la vue de dessus d’un assemblage de cubes ; chaque case indique la hauteur de la pile (case vide : pas de pile).  

![figure](exos-15-figures/09-vues.svg)

1. a) Combien de cubes compte l’assemblage ? → attendu :  $13$
   - Indice : Additionne les hauteurs de toutes les piles.
   - Erreur typique (réponse 9) : Tu n’as compté que les cubes vus de face : des cubes sont cachés derrière.
   - Erreur typique (réponse 5) : Ça, c’est le nombre de piles : additionne leurs hauteurs.
2. b) Vue de face : hauteur de chaque colonne, de gauche à droite ? → attendu : Colonne 1 : $1$ ; Colonne 2 : $4$ ; Colonne 3 : $4$
   - Indice : Dans chaque colonne, on voit la pile la plus haute (devant ou derrière).
   - Erreur typique (réponses 0 ; 4 ; 4) : Tu n’as regardé que la rangée de devant : une pile plus haute derrière se voit au-dessus.
3. c) Vue de droite : hauteur de chaque colonne, de gauche à droite ? → attendu : Gauche (devant) : $4$ ; Droite (derrière) : $2$
   - Indice : Vue de droite : la rangée de devant apparaît à gauche ; dans chaque rangée, on voit la pile la plus haute.
   - Erreur typique (réponses 2 ; 4) : Regardé depuis la droite, le devant est à gauche.

**Corrigé**

> a) $1 + 2 + 2 + 4 + 4 = 13$ cubes.  
> b) Vue de face : colonne 1 : $\max(1\,;0) = 1$ ; colonne 2 : $\max(2\,;4) = 4$ ; colonne 3 : $\max(2\,;4) = 4$.  
> c) Vue de droite : devant (à gauche) $4$, derrière (à droite) $2$.  

Réponse : 13 cubes ; face 1, 4, 4

## 10. Patrons : longueurs et aires — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=aires&niv=1&g=5qsx52` · cours : § 3.5 · Cylindre et cône

**Patron d’un cylindre.**

Un cylindre a pour rayon $5\,\mathrm{cm}$ et pour hauteur $8\,\mathrm{cm}$.  

1. a) Dimensions du rectangle du patron (longueur au dixième) ? → attendu : Longueur : $31{,}4$ cm ; Largeur : $8$ cm
   - Indice : La longueur s’enroule autour du disque : c’est son périmètre.
   - Erreur typique (réponses 10 ; 8) : La longueur est le PÉRIMÈTRE du disque (2πR), pas son diamètre.
2. b) Aire latérale du cylindre (au dixième) ? → attendu :  $251{,}3$ cm²
   - Indice : Aire du rectangle : longueur × largeur (garde 2πR exact).

**Corrigé**

> a) Largeur : la hauteur, $8\,\mathrm{cm}$ ; longueur : $2\pi \times 5 = 10\pi \approx 31{,}4\,\mathrm{cm}$.  
> b) $10\pi \times 8 = 80\pi \approx 251{,}3\,\mathrm{cm}^2$.  

Réponse : ≈ 31,4 cm × 8 cm

## 11. Patrons : longueurs et aires — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=aires&niv=2&g=us6cju` · cours : § 3.5 · Cylindre et cône

**Patron d’une pyramide.**

Une pyramide régulière a pour base un carré de côté $18\,\mathrm{cm}$ ; ses faces latérales sont des triangles isocèles de côtés $19\,\mathrm{cm}$, $19\,\mathrm{cm}$ et $18\,\mathrm{cm}$.  

1. a) Hauteur d’une face latérale (au centième) ? → attendu :  $16{,}73$ cm
   - Indice : La hauteur issue du sommet coupe la base de 18 cm en son milieu : triangle rectangle d’hypoténuse 19 cm.
2. b) Aire totale du patron (au dixième) ? → attendu :  $926{,}4$ cm²
   - Indice : La base carrée + 4 triangles (base × hauteur ÷ 2).

**Corrigé**

> a) $h^2 = 19^2 - 9^2 = 280$, donc $h = \sqrt{280} \approx 16{,}73\,\mathrm{cm}$.  
> b) $18^2 + 4 \times \dfrac{18 \times h}{2} \approx 926{,}4\,\mathrm{cm}^2$.  

Réponse : ≈ 16,73 cm ; ≈ 926,4 cm²

## 12. Patrons : longueurs et aires — ★★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=aires&niv=3&g=1eaffxj` · cours : § 3.5 · Cylindre et cône

**Patron d’un cône.**

Un cône a pour rayon de base $3\,\mathrm{cm}$ et pour génératrice $16\,\mathrm{cm}$. On dessine son patron : un disque et un secteur de rayon $16\,\mathrm{cm}$.  

1. a) Angle du secteur (au dixième de degré) ? → attendu :  $67{,}5$ °
   - Indice : L’arc du secteur fait le tour de la base : $360^\circ \times \dfrac{r}{g}$.
2. b) Aire du secteur, c’est-à-dire l’aire latérale du cône (au dixième) ? → attendu :  $150{,}8$ cm²
   - Indice : Fraction $\dfrac{r}{g}$ du disque de rayon $g$ : $\pi g^2 \times \dfrac{r}{g} = \pi r g$.

**Corrigé**

> a) $360^\circ \times \dfrac{3}{16} \approx 67{,}5^\circ$.  
> b) $\pi \times 16^2 \times \dfrac{3}{16} = 48\pi \approx 150{,}8\,\mathrm{cm}^2$.  

Réponse : ≈ 67,5° ; ≈ 150,8 cm²

## 13. Sections de solides — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=sections&niv=1&g=bdh32c` · cours : § 5.1 · Sections : pavé, cylindre

**Couper un pavé.**

Un pavé droit mesure $8\,\mathrm{cm}$ de long, $3\,\mathrm{cm}$ de large et $6\,\mathrm{cm}$ de haut. On le coupe par un plan parallèle à la face du dessous.  

1. a) Nature de la section ? → attendu : Un rectangle (options : Un rectangle / Un triangle / Un disque)
   - Indice : Plan parallèle à une face.
   - Si « Un triangle » : Un plan parallèle à une face coupe le pavé selon un rectangle.
   - Si « Un disque » : Le pavé n’a pas de face courbe.
2. b) Dimensions de la section ? → attendu : Longueur : $8$ cm ; Largeur : $3$ cm
   - Indice : La section est identique à la face du dessous.

**Corrigé**

> a) Un rectangle identique à la face du dessous.  
> b) $8\,\mathrm{cm}$ sur $3\,\mathrm{cm}$.  

Réponse : rectangle 8 × 3

## 14. Sections de solides — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=sections&niv=2&g=183s6z1` · cours : § 5.1 · Sections : pavé, cylindre

**Couper une sphère.**

Une sphère de centre $O$ a pour rayon $41\,\mathrm{cm}$. On la coupe par un plan situé à $9\,\mathrm{cm}$ de $O$.  

1. Rayon de la section ? → attendu :  $40$ cm
   - Indice : Le triangle $OHM$ est rectangle en $H$, d’hypoténuse $OM$ (un rayon de la sphère).
   - Erreur typique (réponse 32) : Pythagore : on soustrait les CARRÉS.
   - Erreur typique (réponse 5247/125) : OM est l’hypoténuse : HM² = OM² − OH².

**Corrigé**

> Le triangle $OHM$ est rectangle en $H$. Pythagore : $HM^2 = 41^2 - 9^2 = 1600$, donc $HM = 40\,\mathrm{cm}$.  

Réponse : 40 cm

## 15. Sections de solides — ★★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=sections&niv=3&g=qf66x9` · cours : § 5.1 · Sections : pavé, cylindre

**Section par un plan oblique.**

$ABCDEFGH$ est un pavé droit avec $AB = 3\,\mathrm{cm}$, $AD = 5\,\mathrm{cm}$ et $AE = 12\,\mathrm{cm}$. On le coupe par le plan qui contient les arêtes $[AB]$ et $[HG]$.  

![figure](exos-15-figures/15-sections.svg)

1. a) Calcule $AH$. → attendu :  $13$ cm
   - Indice : Le triangle $ADH$ est rectangle en $D$.
   - Erreur typique (réponse 17) : Pythagore : on additionne les carrés.
2. b) Aire de la section $ABGH$ ? → attendu :  $39$ cm²
   - Indice : $ABGH$ est un rectangle de côtés $AB$ et $AH$.

**Corrigé**

> a) $ADH$ est rectangle en $D$ : $AH^2 = 5^2 + 12^2 = 169$, donc $AH = 13\,\mathrm{cm}$.  
> b) $[AB]$ est perpendiculaire à la face $ADHE$, et $[AB]$, $[HG]$ sont parallèles et de même longueur : $ABGH$ est un rectangle. Aire : $3 \times 13 = 39\,\mathrm{cm}^2$.  

Réponse : 13 cm ; 39 cm²

## 16. Se repérer dans l’espace — ★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=reperage&niv=1&g=49m65v` · cours : § 6.1 · Repérage dans un pavé

**Coordonnées dans un pavé.**

Pavé $ABCDEFGH$ : origine $A$, $AB = 8$, $AD = 4$, $AE = 5$.  

![figure](exos-15-figures/16-reperage.svg)

1. a) Coordonnées de $F$ ? → attendu : x : $8$ ; y : $0$ ; z : $5$
   - Indice : Pour aller de A à F : combien selon [AB], selon [AD], vers le haut ?
   - Erreur typique (réponses 0 ; 8 ; 5) : Toujours dans l’ordre : abscisse (selon AB), ordonnée (selon AD), altitude (selon AE).
2. b) Coordonnées de $I$ ? → attendu : x : $0$ ; y : $2$ ; z : $0$
   - Indice : I est le milieu de [DA] : moyenne des coordonnées des extrémités.
   - Erreur typique (réponses 2 ; 0 ; 0) : Toujours dans l’ordre : abscisse (selon AB), ordonnée (selon AD), altitude (selon AE).
3. c) Quel sommet a pour coordonnées $(0\,;0\,;5)$ ? → attendu : $E$ (options : $A$ / $B$ / $C$ / $D$ / $E$ / $F$ / $G$ / $H$)
   - Indice : Altitude 0 : face du dessous ABCD ; altitude maximale : face du dessus EFGH.
   - Si « $A$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.
   - Si « $B$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.
   - Si « $C$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.
   - Si « $D$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.
   - Si « $F$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.
   - Si « $G$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.
   - Si « $H$ » : Lis dans l’ordre : abscisse, ordonnée, altitude.

**Corrigé**

> a) $F(8\,;0\,;5)$.  
> b) $D(0\,;4\,;0)$ et $A(0\,;0\,;0)$ : le milieu $I$ a pour coordonnées les moyennes, $I(0\,;2\,;0)$.  
> c) $E$.  

Réponse : a) $F(8\,;0\,;5)$. b) $D(0\,;4\,;0)$ et $A(0\,;0\,;0)$ : le milieu $I$ a pour coordonnées les moyennes, $I(0\,;2\,;0)$. c) $E$.

## 17. Se repérer dans l’espace — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=reperage&niv=2&g=p3sdx` · cours : § 6.1 · Repérage dans un pavé

**Se repérer.**

Pavé $ABCDEFGH$ : origine $A$, $AB = 2$, $AD = 2$, $AE = 4$.  

![figure](exos-15-figures/17-reperage.svg)

1. a) Coordonnées de $B$ ? → attendu : x : $2$ ; y : $0$ ; z : $0$
   - Indice : Pour aller de A à B : combien selon [AB], selon [AD], vers le haut ?
   - Erreur typique (réponses 0 ; 2 ; 0) : Toujours dans l’ordre : abscisse (selon AB), ordonnée (selon AD), altitude (selon AE).
2. b) Coordonnées de $K$ ? → attendu : x : $1$ ; y : $2$ ; z : $2$
   - Indice : K est le centre de la face arrière DCGH : le milieu d’une de ses diagonales.
   - Erreur typique (réponses 2 ; 1 ; 2) : Toujours dans l’ordre : abscisse (selon AB), ordonnée (selon AD), altitude (selon AE).
3. c) Deux villes sont sur le même méridien, aux latitudes 14° N et 61° S. Le tour de la Terre mesure 40 000 km. Distance en suivant le méridien (arrondie au km) ? → attendu :  $8\,333$ km
   - Indice : L’angle au centre vaut la somme des latitudes ; la longueur de l’arc est proportionnelle à l’angle.

**Corrigé**

> a) $B(2\,;0\,;0)$.  
> b) Le centre $K$ de la face $DCGH$ est le milieu de $[DG]$ : $K(1\,;2\,;2)$.  
> c) Angle : $14^\circ + 61^\circ = 75^\circ$. Distance : $\dfrac{75}{360} \times 40\,000 \approx 8\,333\,\mathrm{km}$.  

Réponse : a) $B(2\,;0\,;0)$. b) Le centre $K$ de la face $DCGH$ est le milieu de $[DG]$ : $K(1\,;2\,;2)$. c) Angle : $14^\circ + 61^\circ = 75^\circ$. Distance : $\dfrac{75}{360} \times 40\,000 \approx 8\,333\,\mathrm{km}$.

## 18. Trouver l’erreur — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=erreur&niv=2&g=bs2qa8` · cours : § 3.5 · Cylindre et cône

**Trouve l’erreur.**

Pour le patron d’un cylindre de rayon $6\,\mathrm{cm}$ et de hauteur $9\,\mathrm{cm}$, Yanis dessine deux disques de rayon $6\,\mathrm{cm}$ et un rectangle de $12\,\mathrm{cm}$ sur $9\,\mathrm{cm}$.  

1. a) Quelle est l’erreur ? → attendu : La longueur du rectangle est le périmètre du disque, pas son diamètre. (options : La longueur du rectangle est le périmètre du disque, pas son diamètre. / Le rectangle devrait mesurer R sur h. / Les disques devraient avoir pour rayon la hauteur.)
   - Indice : Le rectangle s’enroule autour du disque.
   - Si « Le rectangle devrait mesurer R sur h. » : Il doit faire tout le tour du disque.
   - Si « Les disques devraient avoir pour rayon la hauteur. » : Les disques sont les bases : rayon R.
2. b) Bonne longueur (au dixième) ? → attendu :  $37{,}7$ cm
   - Indice : 2πR.

**Corrigé**

> Le rectangle s’enroule autour du disque : sa longueur est le périmètre $2\pi \times 6 = 12\pi \approx 37{,}7\,\mathrm{cm}$.  

Réponse : ≈ 37,7 cm

## 19. Faces, arêtes, sommets — ★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=solides&niv=2&g=bj6y5u` · cours : § 1.1 · Polyèdres

**Relation d’Euler.**

1. Un polyèdre (sans trou) a 32 faces et 30 sommets. Combien a-t-il d’arêtes ? → attendu :  $60$
   - Indice : Relation d’Euler : faces + sommets − arêtes = 2.
   - Erreur typique (réponse 64) : Faces + sommets − arêtes = 2, donc arêtes = faces + sommets − 2.

**Corrigé**

> Relation d’Euler : $32 + 30 - A = 2$, donc $A = 32 + 30 - 2 = 60$.  

Réponse : 60

## 20. Patrons du cube — ★★★

Adresse : `#/entrainement/15-geometrie-espace/exo?t=patron&niv=3&g=ak2xkc` · cours : § 3.2 · Patrons du cube

**Le patron d’un dé.**

On fabrique un dé avec ce patron ; trois faces sont déjà numérotées.  

![figure](exos-15-figures/20-patron.svg)

1. Sur un dé, deux faces opposées ont pour somme 7. Quel nombre faut-il écrire sur la face « ? » ? → attendu :  $5$
   - Indice : Cherche la face opposée à « ? » : elle ne la touche pas une fois le cube plié (dans une rangée, deux carrés séparés par un carré sont opposés).
   - Erreur typique (réponse 3) : Tu as complété la face opposée à une autre face : cherche celle qui est opposée à « ? ».
   - Erreur typique (réponse 1) : Tu as complété la face opposée à une autre face : cherche celle qui est opposée à « ? ».
   - Erreur typique (réponse 2) : C’est le nombre de la face opposée ; « ? » porte le complément à 7.

**Corrigé**

> Une fois le patron plié, la face « ? » est opposée à la face 2. Donc « ? » porte $7 - 2 = 5$.  

Réponse : 5
