# Échantillon d’exercices générés — chapitre 03 (Nombres relatifs, v0.4)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

**Relecture (9 oct. 2026, soir).** Échantillon relu en entier, plus une trentaine d’exercices d’autres graines pendant la mise au point.
Corrigé à la relecture : « je avance » → « j’avance » ; produits à facteurs tous égaux exclus (au moins trois valeurs distinctes) ;
ascenseur qui revient à son étage de départ exclu ; boucle infinie possible dans la moyenne de températures (plages resserrées) ;
problème « années » trop fréquent (poids réduit) ; « 15 - -1 » dans un corrigé de quiz (parenthèses ajoutées, et désormais
détecté par les tests) ; étape « Calcule A » supprimée quand un facteur est nul (le résultat 0 est déjà donné par le signe).

## 1. Lire une abscisse — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=abscisse&niv=1&g=148bdv4` · cours : § 2.1 · Se repérer sur une droite graduée

**Lis les abscisses sur la droite graduée.**

![figure](exos-03-figures/01-abscisse.svg)

1. Combien vaut une graduation ? → attendu : Une graduation vaut $10$
   - Indice : Écart entre les deux nombres écrits, divisé par le nombre d’intervalles entre eux.
   - Erreur typique (réponse 20) : C’est l’écart entre $0$ et $20$. Il faut le **diviser** par le nombre d’intervalles (2).
   - Erreur typique (réponse 2) : Ça, c’est le nombre d’intervalles. Divise l’écart entre les deux nombres écrits par ce nombre.
2. Donne l’abscisse de chaque point. → attendu : $M$ : $-60$ ; $N$ : $-30$ ; $P$ : $-10$ ; $R$ : $30$
   - Indice : Une graduation vaut $10$. Compte les graduations depuis $0$ : vers la droite $+$, vers la gauche $-$.
   - Erreur typique (réponse -6) : Tu as compté $1$ par graduation. Ici, une graduation vaut $10$.
   - Erreur typique (réponse -3) : Tu as compté $1$ par graduation. Ici, une graduation vaut $10$.
   - Erreur typique (réponse -1) : Tu as compté $1$ par graduation. Ici, une graduation vaut $10$.
   - Erreur typique (réponse 3) : Tu as compté $1$ par graduation. Ici, une graduation vaut $10$.

**Corrigé**

> Entre $0$ et $20$, il y a $2$ intervalles : une graduation vaut $20 \div 2 = 10$.  
> $M$ est à $6$ graduations à gauche de $0$ : $M(-60)$.  
> $N$ est à $3$ graduations à gauche de $0$ : $N(-30)$.  
> $P$ est à $1$ graduation à gauche de $0$ : $P(-10)$.  
> $R$ est à $3$ graduations à droite de $0$ : $R(30)$.  
> Contrôle : les points à gauche de zéro ont une abscisse négative.  

Réponse : $M(-60)$ ; $N(-30)$ ; $P(-10)$ ; $R(30)$

## 2. Lire une abscisse — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=abscisse&niv=2&g=m3thsr` · cours : § 2.1 · Se repérer sur une droite graduée

**Lis les abscisses sur la droite graduée.**

![figure](exos-03-figures/02-abscisse.svg)

1. Combien vaut une graduation ? → attendu : Une graduation vaut $0{,}1$
   - Indice : Écart entre les deux nombres écrits, divisé par le nombre d’intervalles entre eux.
   - Erreur typique (réponse 1) : C’est l’écart entre $0$ et $1$. Il faut le **diviser** par le nombre d’intervalles (10).
   - Erreur typique (réponse 10) : Ça, c’est le nombre d’intervalles. Divise l’écart entre les deux nombres écrits par ce nombre.
2. Donne l’abscisse de chaque point. → attendu : $M$ : $-1{,}2$ ; $N$ : $-1{,}1$ ; $P$ : $-0{,}1$ ; $R$ : $0{,}5$
   - Indice : Une graduation vaut $0{,}1$. Compte les graduations depuis $0$ : vers la droite $+$, vers la gauche $-$.
   - Erreur typique (réponse -12) : Tu as compté $1$ par graduation. Ici, une graduation vaut $0{,}1$.
   - Erreur typique (réponse -11) : Tu as compté $1$ par graduation. Ici, une graduation vaut $0{,}1$.
   - Erreur typique (réponse -1) : Tu as compté $1$ par graduation. Ici, une graduation vaut $0{,}1$.
   - Erreur typique (réponse 5) : Tu as compté $1$ par graduation. Ici, une graduation vaut $0{,}1$.

**Corrigé**

> Entre $0$ et $1$, il y a $10$ intervalles : une graduation vaut $1 \div 10 = 0{,}1$.  
> $M$ est à $12$ graduations à gauche de $0$ : $M(-1{,}2)$.  
> $N$ est à $11$ graduations à gauche de $0$ : $N(-1{,}1)$.  
> $P$ est à $1$ graduation à gauche de $0$ : $P(-0{,}1)$.  
> $R$ est à $5$ graduations à droite de $0$ : $R(0{,}5)$.  
> Contrôle : les points à gauche de zéro ont une abscisse négative.  

Réponse : $M(-1{,}2)$ ; $N(-1{,}1)$ ; $P(-0{,}1)$ ; $R(0{,}5)$

## 3. Comparer deux relatifs — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=comparer&niv=1&g=efeu2x` · cours : § 2.2 · Comparer

**Compare les nombres (avec $<$ ou $>$).**

1. a) $-19 \;\square\; -13$ → attendu : $<$ (options : $<$ / $>$)
   - Indice : Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.
   - Si « $>$ » : Entre deux négatifs, le plus petit est le **plus loin de zéro** : la distance à zéro de $-19$ est $19$, plus grande que $13$. Donc $-19 < -13$.
2. b) $-6 \;\square\; 5$ → attendu : $<$ (options : $<$ / $>$)
   - Indice : Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.
   - Si « $>$ » : Un négatif est toujours plus petit qu’un positif, même s’il est plus loin de zéro : $-6 < 5$.
3. c) $-14 \;\square\; -4$ → attendu : $<$ (options : $<$ / $>$)
   - Indice : Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.
   - Si « $>$ » : Entre deux négatifs, le plus petit est le **plus loin de zéro** : la distance à zéro de $-14$ est $14$, plus grande que $4$. Donc $-14 < -4$.

**Corrigé**

> a) $-19 < -13$ : deux négatifs ; le plus loin de zéro (distances $19$ et $13$) est le plus petit.  
> b) $-6 < 5$ : un négatif est plus petit qu’un positif.  
> c) $-14 < -4$ : deux négatifs ; le plus loin de zéro (distances $14$ et $4$) est le plus petit.  
> Contrôle : on imagine les points sur la droite graduée ; le plus à gauche est le plus petit.  

Réponse : $-19 < -13$ ; $-6 < 5$ ; $-14 < -4$

## 4. Comparer deux relatifs — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=comparer&niv=2&g=tawahe` · cours : § 2.2 · Comparer

**Compare les nombres (avec $<$ ou $>$).**

1. a) $-0{,}6 \;\square\; -0{,}06$ → attendu : $<$ (options : $<$ / $>$)
   - Indice : Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.
   - Si « $>$ » : Entre deux négatifs, le plus petit est le **plus loin de zéro** : la distance à zéro de $-0{,}6$ est $0{,}6$, plus grande que $0{,}06$. Donc $-0{,}6 < -0{,}06$.
2. b) $-5{,}08 \;\square\; -5{,}7$ → attendu : $>$ (options : $<$ / $>$)
   - Indice : Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.
   - Si « $<$ » : Entre deux négatifs, le plus petit est le **plus loin de zéro** : la distance à zéro de $-5{,}7$ est $5{,}7$, plus grande que $5{,}08$. Donc $-5{,}7 < -5{,}08$.
3. c) $-4{,}2 \;\square\; -7{,}5$ → attendu : $>$ (options : $<$ / $>$)
   - Indice : Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.
   - Si « $<$ » : Entre deux négatifs, le plus petit est le **plus loin de zéro** : la distance à zéro de $-7{,}5$ est $7{,}5$, plus grande que $4{,}2$. Donc $-7{,}5 < -4{,}2$.

**Corrigé**

> a) $-0{,}6 < -0{,}06$ : deux négatifs ; le plus loin de zéro (distances $0{,}6$ et $0{,}06$) est le plus petit.  
> b) $-5{,}08 > -5{,}7$ : deux négatifs ; le plus loin de zéro (distances $5{,}08$ et $5{,}7$) est le plus petit.  
> c) $-4{,}2 > -7{,}5$ : deux négatifs ; le plus loin de zéro (distances $4{,}2$ et $7{,}5$) est le plus petit.  
> Contrôle : on imagine les points sur la droite graduée ; le plus à gauche est le plus petit.  

Réponse : $-0{,}6 < -0{,}06$ ; $-5{,}08 > -5{,}7$ ; $-4{,}2 > -7{,}5$

## 5. Ranger dans l’ordre croissant — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=ranger&niv=1&g=xabr39` · cours : § 2.2 · Comparer

**Range ces nombres dans l’ordre croissant.**

$$-3 \;;\; -15 \;;\; 8 \;;\; -8 \;;\; 0 \;;\; 6$$

1. Écris-les du plus petit au plus grand (une case par nombre). → attendu : Le plus petit : $-15$ ; $<$ $-8$ ; $<$ $-3$ ; $<$ $0$ ; $<$ $6$ ; $<$ $8$
   - Indice : Sépare négatifs et positifs. Parmi les négatifs, le plus éloigné de zéro est le plus petit.
   - Erreur typique (réponses -3 ; -8 ; -15 ; 0 ; 6 ; 8) : Tu as rangé les négatifs selon leur distance à zéro. C’est l’inverse : entre deux négatifs, le plus loin de zéro est le **plus petit**.
   - Erreur typique (réponses 8 ; 6 ; 0 ; -3 ; -8 ; -15) : C’est l’ordre **décroissant**. On demande l’ordre croissant : du plus petit au plus grand.

**Corrigé**

> Négatifs : $-15 < -8 < -3$ (le plus loin de zéro est le plus petit).  
> Puis $0$, puis les positifs : $6 < 8$.  
> Donc $-15 < -8 < -3 < 0 < 6 < 8$.  
> Contrôle : de gauche à droite sur la droite graduée, on lit bien cet ordre.  

Réponse : $-15 < -8 < -3 < 0 < 6 < 8$

## 6. Ranger dans l’ordre croissant — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=ranger&niv=2&g=1l5ud4n` · cours : § 2.2 · Comparer

**Range ces nombres dans l’ordre croissant.**

$$-1{,}8 \;;\; -0{,}21 \;;\; -6 \;;\; 0 \;;\; -1{,}01 \;;\; 4{,}2$$

1. Écris-les du plus petit au plus grand (une case par nombre). → attendu : Le plus petit : $-6$ ; $<$ $-1{,}8$ ; $<$ $-1{,}01$ ; $<$ $-0{,}21$ ; $<$ $0$ ; $<$ $4{,}2$
   - Indice : Sépare négatifs et positifs. Parmi les négatifs, le plus éloigné de zéro est le plus petit.
   - Erreur typique (réponses -21/100 ; -101/100 ; -9/5 ; -6 ; 0 ; 21/5) : Tu as rangé les négatifs selon leur distance à zéro. C’est l’inverse : entre deux négatifs, le plus loin de zéro est le **plus petit**.
   - Erreur typique (réponses 21/5 ; 0 ; -21/100 ; -101/100 ; -9/5 ; -6) : C’est l’ordre **décroissant**. On demande l’ordre croissant : du plus petit au plus grand.

**Corrigé**

> Négatifs : $-6 < -1{,}8 < -1{,}01 < -0{,}21$ (le plus loin de zéro est le plus petit).  
> Puis $0$, puis les positifs : $4{,}2$.  
> Donc $-6 < -1{,}8 < -1{,}01 < -0{,}21 < 0 < 4{,}2$.  
> Contrôle : de gauche à droite sur la droite graduée, on lit bien cet ordre.  

Réponse : $-6 < -1{,}8 < -1{,}01 < -0{,}21 < 0 < 4{,}2$

## 7. Additionner des relatifs — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=addition&niv=1&g=1c48jur` · cours : § 3.2 · Addition : les règles

**Calcule.**

$$A = -13 + 11 \qquad B = -5 + (-12)$$

1. (réponse) → attendu : $A =$ $-2$
   - Indice : Même signe : on additionne les distances à zéro et on garde le signe. Signes contraires : on soustrait, et on prend le signe du plus loin de zéro.
   - Erreur typique (réponse -24) : Signes contraires : on **soustrait** les distances à zéro (la plus grande moins la plus petite), on ne les ajoute pas.
   - Erreur typique (réponse 2) : Le résultat prend le signe du nombre qui a la **plus grande** distance à zéro : ici $-13$.
2. (réponse) → attendu : $B =$ $-17$
   - Indice : Même signe : on additionne les distances à zéro et on garde le signe. Signes contraires : on soustrait, et on prend le signe du plus loin de zéro.
   - Erreur typique (réponse 17) : « Moins et moins font plus » concerne le **produit**, pas l’addition : deux pertes font une perte plus grande.
   - Erreur typique (réponse 7) : Même signe : on **additionne** les distances à zéro ($5 + 12$).

**Corrigé**

> $A$ : signes contraires ; $13 - 11 = 2$ ; c’est $-13$ qui a la plus grande distance à zéro, donc $A = -2$.  
> $B$ : même signe ; $5 + 12 = 17$ ; signe commun $-$, donc $B = -17$.  
> Contrôle de $A$ sur la droite : je pars de $-13$ et j’avance de $11$ : j’arrive en $-2$ ✓.  

Réponse : $A = -2$ ; $B = -17$

## 8. Additionner des relatifs — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=addition&niv=2&g=1tq9746` · cours : § 3.2 · Addition : les règles

**Calcule.**

$$A = (-8{,}8) + (+9{,}4) \qquad B = (+4{,}8) + (-6{,}5)$$

1. (réponse) → attendu : $A =$ $0{,}6$
   - Indice : Même signe : on additionne les distances à zéro et on garde le signe. Signes contraires : on soustrait, et on prend le signe du plus loin de zéro.
   - Erreur typique (réponse 91/5) : Signes contraires : on **soustrait** les distances à zéro (la plus grande moins la plus petite), on ne les ajoute pas.
   - Erreur typique (réponse -3/5) : Le résultat prend le signe du nombre qui a la **plus grande** distance à zéro : ici $9{,}4$.
   - Erreur typique (réponse -91/5) : Signes contraires : on soustrait les distances à zéro, et on prend le signe du plus loin de zéro ($9{,}4$).
2. (réponse) → attendu : $B =$ $-1{,}7$
   - Indice : Même signe : on additionne les distances à zéro et on garde le signe. Signes contraires : on soustrait, et on prend le signe du plus loin de zéro.
   - Erreur typique (réponse -113/10) : Signes contraires : on **soustrait** les distances à zéro (la plus grande moins la plus petite), on ne les ajoute pas.
   - Erreur typique (réponse 17/10) : Le résultat prend le signe du nombre qui a la **plus grande** distance à zéro : ici $-6{,}5$.

**Corrigé**

> $A$ : signes contraires ; $9{,}4 - 8{,}8 = 0{,}6$ ; c’est $9{,}4$ qui a la plus grande distance à zéro, donc $A = 0{,}6$.  
> $B$ : signes contraires ; $6{,}5 - 4{,}8 = 1{,}7$ ; c’est $-6{,}5$ qui a la plus grande distance à zéro, donc $B = -1{,}7$.  
> Contrôle de $A$ sur la droite : je pars de $-8{,}8$ et j’avance de $9{,}4$ : j’arrive en $0{,}6$ ✓.  

Réponse : $A = 0{,}6$ ; $B = -1{,}7$

## 9. Additionner des relatifs — ★★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=addition&niv=3&g=1cyu00e` · cours : § 3.2 · Addition : les règles

**Calcule en regroupant les termes de même signe.**

$$C = (-3) + (+2) + (-5) + (+10) + (-3)$$

1. (réponse) → attendu : $C =$ $1$
   - Indice : Regroupe les positifs ensemble et les négatifs ensemble, puis additionne les deux résultats.
   - Erreur typique (réponse 23) : Tu as additionné les distances à zéro sans tenir compte des signes : les négatifs font **reculer**.
   - Erreur typique (réponse -1) : Positifs $12$, négatifs $-11$ : le résultat a le signe du plus loin de zéro.

**Corrigé**

> Positifs : $2 + 10 = 12$. Négatifs : $(-3) + (-5) + (-3) = -11$.  
> $C = 12 + (-11) = 1$  
> Contrôle : gains $12$, pertes $11$ : on finit avec un gain de $1$ ✓.  

Réponse : $C = 1$

## 10. Soustraire des relatifs — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=soustraction&niv=1&g=umc9dz` · cours : § 4.1 · Soustraire, c’est ajouter l’opposé

**Calcule.**

$$A = 7 - 11 \qquad B = -8 - (-11)$$

1. (réponse) → attendu : $A =$ $-4$
   - Indice : Soustraire un nombre, c’est ajouter son opposé : seul le nombre soustrait change de signe.
   - Erreur typique (réponse 18) : Soustraire $11$, c’est **ajouter son opposé** $-11$ : $7 + (-11)$.
   - Erreur typique (réponse -18) : Seul le nombre **soustrait** est remplacé par son opposé ; le premier nombre ne change pas : $7 + (-11)$.
2. (réponse) → attendu : $B =$ $3$
   - Indice : Soustraire un nombre, c’est ajouter son opposé : seul le nombre soustrait change de signe.
   - Erreur typique (réponse -19) : Soustraire $-11$, c’est **ajouter son opposé** $11$ : $-8 + 11$.
   - Erreur typique (réponse 19) : Seul le nombre **soustrait** est remplacé par son opposé ; le premier nombre ne change pas : $-8 + 11$.

**Corrigé**

> Soustraire un nombre, c’est ajouter son opposé :  
> $A = 7 - 11 = 7 + (-11) = -4$  
> $B = -8 - (-11) = -8 + 11 = 3$  

Réponse : $A = -4$ ; $B = 3$

## 11. Soustraire des relatifs — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=soustraction&niv=2&g=1vn8r4h` · cours : § 4.1 · Soustraire, c’est ajouter l’opposé

**Calcule.**

$$A = 6{,}5 - (-6{,}6) \qquad B = -0{,}6 - (-2{,}5)$$

1. (réponse) → attendu : $A =$ $13{,}1$
   - Indice : Soustraire un nombre, c’est ajouter son opposé : seul le nombre soustrait change de signe.
   - Erreur typique (réponse -1/10) : Soustraire $-6{,}6$, c’est **ajouter son opposé** $6{,}6$ : $6{,}5 + 6{,}6$.
   - Erreur typique (réponse 1/10) : Seul le nombre **soustrait** est remplacé par son opposé ; le premier nombre ne change pas : $6{,}5 + 6{,}6$.
2. (réponse) → attendu : $B =$ $1{,}9$
   - Indice : Soustraire un nombre, c’est ajouter son opposé : seul le nombre soustrait change de signe.
   - Erreur typique (réponse -31/10) : Soustraire $-2{,}5$, c’est **ajouter son opposé** $2{,}5$ : $-0{,}6 + 2{,}5$.
   - Erreur typique (réponse 31/10) : Seul le nombre **soustrait** est remplacé par son opposé ; le premier nombre ne change pas : $-0{,}6 + 2{,}5$.

**Corrigé**

> Soustraire un nombre, c’est ajouter son opposé :  
> $A = 6{,}5 - (-6{,}6) = 6{,}5 + 6{,}6 = 13{,}1$  
> $B = -0{,}6 - (-2{,}5) = -0{,}6 + 2{,}5 = 1{,}9$  

Réponse : $A = 13{,}1$ ; $B = 1{,}9$

## 12. Soustraire des relatifs — ★★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=soustraction&niv=3&g=g2keey` · cours : § 4.1 · Soustraire, c’est ajouter l’opposé

**Écris sans parenthèses, puis calcule.**

$$D = 3 - (-12) + (-7) - (+4) + (+10)$$

1. (réponse) → attendu : $D =$ $14$
   - Indice : On remplace chaque soustraction par l’addition de l’opposé, puis on supprime les parenthèses et on regroupe positifs et négatifs.
   - Erreur typique (réponse -2) : Tu as traité les soustractions comme des additions. Soustraire un nombre, c’est **ajouter son opposé**.
   - Erreur typique (réponse -10) : $- (-a)$ devient $+ a$ : soustraire un négatif, c’est ajouter un positif.

**Corrigé**

> On remplace chaque soustraction par l’addition de l’opposé : $D = 3 + 12 + (-7) + (-4) + 10$.  
> Écriture simplifiée : $D = 3 + 12 - 7 - 4 + 10$.  
> Positifs : $3 + 12 + 10 = 25$. Négatifs : $(-7) + (-4) = -11$.  
> $D = 25 + (-11) = 14$  

Réponse : $D = 14$

## 13. Distance entre deux points — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=distance&niv=1&g=y62e9b` · cours : § 4.2 · Écriture simplifiée, distance

**Sur une droite graduée, on place les points $E(-5)$ et $F(10)$.**

1. Calcule la distance $EF$. → attendu : $EF =$ $15$
   - Indice : Distance entre deux points : la plus grande abscisse moins la plus petite.
   - Erreur typique (réponse -15) : Une distance est toujours **positive** : on calcule la plus grande abscisse moins la plus petite.
   - Erreur typique (réponse 5) : Tu as ajouté les abscisses. Il faut **soustraire** : $10 - (-5)$.

**Corrigé**

> La plus grande abscisse est $10$ (point $F$), la plus petite $-5$ (point $E$).  
> $EF = 10 - (-5) = 10 + 5 = 15$  
> Contrôle : sur la droite, depuis $-5$, il faut avancer de $15$ pour atteindre $10$.  

Réponse : $EF = 15$

## 14. Distance entre deux points — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=distance&niv=2&g=11g5noi` · cours : § 4.2 · Écriture simplifiée, distance

**Sur une droite graduée, on place les points $R(-7{,}7)$ et $S(-1{,}1)$.**

1. Calcule la distance $RS$. → attendu : $RS =$ $6{,}6$
   - Indice : Distance entre deux points : la plus grande abscisse moins la plus petite.
   - Erreur typique (réponse -33/5) : Une distance est toujours **positive** : on calcule la plus grande abscisse moins la plus petite.
   - Erreur typique (réponse 44/5) : Tu as ajouté les abscisses. Il faut **soustraire** : $-1{,}1 - (-7{,}7)$.
2. Quelle est l’abscisse du milieu $I$ de $[RS]$ ? → attendu : $I($ $-4{,}4$ )
   - Indice : Le milieu est à la même distance des deux points : on part de $-7{,}7$ et on avance de la moitié de $6{,}6$.
   - Erreur typique (réponse 33/10) : C’est la moitié de la distance. Le milieu est à cette distance de $-7{,}7$ : $-7{,}7 + 3{,}3$.
   - Erreur typique (réponse -44/5) : Tu as oublié de diviser par 2.

**Corrigé**

> La plus grande abscisse est $-1{,}1$ (point $S$), la plus petite $-7{,}7$ (point $R$).  
> $RS = -1{,}1 - (-7{,}7) = -1{,}1 + 7{,}7 = 6{,}6$  
> Milieu : $-7{,}7 + 6{,}6 \div 2 = -7{,}7 + 3{,}3 = -4{,}4$, donc $I(-4{,}4)$.  
> Contrôle : $-4{,}4$ est à $3{,}3$ de chacun des deux points.  

Réponse : $RS = 6{,}6$ ; $I(-4{,}4)$

## 15. Multiplier et diviser — ★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=produit&niv=1&g=bvqu4q` · cours : § 5.2 · Règle des signes

**Calcule.**

$$A = (-4) \times 4 \qquad B = 12 \div (-2)$$

1. (réponse) → attendu : $A =$ $-16$
   - Indice : On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.
   - Erreur typique (réponse 16) : Règle des signes : signes contraires : le résultat est négatif.
2. (réponse) → attendu : $B =$ $-6$
   - Indice : On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.
   - Erreur typique (réponse 6) : Règle des signes (elle vaut aussi pour la division) : signes contraires : le résultat est négatif.

**Corrigé**

> $A$ : signes contraires : le résultat est négatif ; $4 \times 4 = 16$, donc $A = -16$.  
> $B$ : signes contraires : le résultat est négatif ; $12 \div 2 = 6$, donc $B = -6$.  
> Contrôle de $B$ par la multiplication : $(-6) \times (-2) = 12$ ✓.  

Réponse : $A = -16$ ; $B = -6$

## 16. Multiplier et diviser — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=produit&niv=2&g=1xwj4tm` · cours : § 5.2 · Règle des signes

**Calcule.**

$$A = 4{,}3 \times (-3) \qquad B = (-1) \div (-0{,}5)$$

1. (réponse) → attendu : $A =$ $-12{,}9$
   - Indice : On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.
   - Erreur typique (réponse 129/10) : Règle des signes : signes contraires : le résultat est négatif.
   - Erreur typique (réponse -129) : Attention à la virgule : vérifie l’ordre de grandeur.
   - Erreur typique (réponse -129/100) : Attention à la virgule : vérifie l’ordre de grandeur.
2. (réponse) → attendu : $B =$ $2$
   - Indice : On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.
   - Erreur typique (réponse -2) : Règle des signes (elle vaut aussi pour la division) : même signe : le résultat est positif.
   - Erreur typique (réponse 20) : Attention à la virgule : contrôle avec la multiplication inverse.
   - Erreur typique (réponse 1/5) : Attention à la virgule : contrôle avec la multiplication inverse.
   - Erreur typique (réponse 1/2) : Tu as multiplié au lieu de diviser.

**Corrigé**

> $A$ : signes contraires : le résultat est négatif ; $4{,}3 \times 3 = 12{,}9$, donc $A = -12{,}9$.  
> $B$ : même signe : le résultat est positif ; $1 \div 0{,}5 = 2$, donc $B = 2$.  
> Contrôle de $B$ par la multiplication : $2 \times (-0{,}5) = -1$ ✓.  

Réponse : $A = -12{,}9$ ; $B = 2$

## 17. Multiplier et diviser — ★★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=produit&niv=3&g=1o25l70` · cours : § 5.2 · Règle des signes

**Calcule.**

$$A = (-4) \times 3 \times (-1) \qquad B = -7^{2}$$

1. (réponse) → attendu : $A =$ $12$
   - Indice : On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.
   - Erreur typique (réponse -12) : Il y a 2 facteurs négatifs (nombre pair) : le produit est positif.
2. (réponse) → attendu : $B =$ $-49$
   - Indice : On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.
   - Erreur typique (réponse 49) : C’est $(-7)^{2}$ qui vaudrait $49$. Sans parenthèses, $-7^{2} = -(7^{2})$.

**Corrigé**

> $A$ : 2 facteurs négatifs (nombre pair), donc $A$ est positif. $4 \times 3 \times 1 = 12$, donc $A = 12$.  
> Sans parenthèses, la puissance ne porte que sur $7$ : $B = -(7^{2}) = -49$.  
> Contrôle : un carré est toujours positif ou nul ; un cube a le signe du nombre.  

Réponse : $A = 12$ ; $B = -49$

## 18. Signe d’un produit — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=signe&niv=2&g=1akeda4` · cours : § 5.2 · Règle des signes

**Trouve le signe, sans calculer.**

1. a) Sans calculer, quel est le signe de $A = 3 \times (-5) \times 0 \times (-2) \times (-4)$ ? → attendu : nul (options : positif / négatif / nul)
   - Indice : Compte les facteurs négatifs : nombre pair → positif ; impair → négatif. Un facteur nul rend le produit nul.
   - Si « positif » : Un des facteurs est nul : le produit vaut $0$.
   - Si « négatif » : Un des facteurs est nul : le produit vaut $0$.
2. b) Sans calculer, quel est le signe de $B = (-3)^{4}$ ? → attendu : positif (options : positif / négatif)
   - Indice : $(-3)^{4}$ est un produit de 4 facteurs $-3$.
   - Si « négatif » : 4 facteurs égaux à $-3$ : nombre pair de facteurs négatifs.
3. c) Sans calculer, quel est le signe de $C = -4^{4}$ ? → attendu : négatif (options : positif / négatif)
   - Indice : Regarde bien les parenthèses : sur quoi porte la puissance ?
   - Si « positif » : Sans parenthèses, la puissance ne porte que sur $4$ : $-4^{4} = -(4^{4})$, l’opposé d’un nombre positif.

**Corrigé**

> a) Un des facteurs est nul, donc $A = 0$.  
> b) $(-3)^{4}$ : 4 facteurs négatifs (nombre pair), donc $B$ est positif ($B = 81$).  
> c) La puissance ne porte que sur $4$ : $C = -(4^{4}) = -256$, négatif.  

Réponse : $A$ nul ($0$) ; $B$ positif ; $C$ négatif

## 19. Priorités avec des relatifs — ★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=priorites&niv=2&g=uh2hmx` · cours : § 6 · Priorités

**Calcule en respectant les priorités.**

$$G = (1 + (-2)) \times (9 + (-3))$$

1. (réponse) → attendu : $G =$ $-6$
   - Indice : Priorités : parenthèses, puis puissances, puis multiplications et divisions, puis additions et soustractions. Règle des signes à chaque étape.
   - Erreur typique (réponse -20) : Les parenthèses se calculent en premier.

**Corrigé**

> Parenthèses d’abord : $1 + (-2) = -1$ et $9 + (-3) = 6$.  
> $G = (-1) \times 6 = -6$  
> Contrôle : on refait le calcul à la calculatrice, en tapant les parenthèses autour des nombres négatifs.  

Réponse : $G = -6$

## 20. Priorités avec des relatifs — ★★★

Adresse : `#/entrainement/03-nombres-relatifs/exo?t=priorites&niv=3&g=1qmy63w` · cours : § 6 · Priorités

**Calcule en respectant les priorités.**

$$G = (-54) \div 6 - 3 \times (-2)$$

1. (réponse) → attendu : $G =$ $-3$
   - Indice : Priorités : parenthèses, puis puissances, puis multiplications et divisions, puis additions et soustractions. Règle des signes à chaque étape.
   - Erreur typique (réponse 24) : Tu as calculé de gauche à droite : la multiplication passe avant la soustraction.
   - Erreur typique (réponse -15) : Soustraire $(-6)$, c’est ajouter son opposé.

**Corrigé**

> Division et multiplication d’abord : $(-54) \div 6 = -9$ et $3 \times (-2) = -6$.  
> $G = -9 - (-6) = -3$  
> Contrôle : on refait le calcul à la calculatrice, en tapant les parenthèses autour des nombres négatifs.  

Réponse : $G = -3$
