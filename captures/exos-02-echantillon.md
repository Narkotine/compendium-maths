# Échantillon d’exercices générés — chapitre 02 (Entiers et nombres décimaux, v0.9)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

## 1. Numération — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=numeration&niv=1&g=kv7nyd` · cours : § 1.1 · Chaque chiffre a une valeur selon sa place

**Numération.**

On considère le nombre $5\,066{,}3$.  

1. a) Quel est le **chiffre** des dizaines ? → attendu :  $6$
   - Indice : Repère la colonne des dizaines dans le tableau de numération.
   - Erreur typique (réponse 0) : C’est le chiffre du rang voisin : compte les rangs à partir de la virgule.
   - Erreur typique (réponse 506) : C’est le **nombre** de dizaines ; on demande seulement le **chiffre** (un seul chiffre).
2. b) Quel est le **nombre** de dixièmes ? → attendu :  $50663$
   - Indice : On lit tout ce qui est à gauche de la colonne des dixièmes, celle-ci comprise.
   - Erreur typique (réponse 3) : C’est le **chiffre** des dixièmes ; le nombre de dixièmes compte tous les paquets.
   - Erreur typique (réponse 506630) : Un rang de trop : on s’arrête à la colonne demandée.
3. c) Calcule $29 \div 10$. → attendu : $29 \div 10 =$ $2{,}9$
   - Indice : Les chiffres changent de 1 rang vers la droite.
   - Erreur typique (réponse 290) : Le résultat doit être plus petit : les chiffres reculent vers la droite.
   - Erreur typique (réponse 29/100) : Un rang de trop.
   - Erreur typique (réponse 29) : Un rang de moins.

**Corrigé**

> a) Dans $5\,066{,}3$, le chiffre des dizaines est $6$.  
> b) Le nombre de dixièmes est $50\,663$ : $50\,663 \times 0{,}1 = 5\,066{,}3$ $\leqslant$ $5\,066{,}3$.  
> c) $29 \div 10 = 2{,}9$ (les chiffres reculent de 1 rang).  

Réponse : $6$ ; $50\,663$ ; $2{,}9$

## 2. Numération — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=numeration&niv=2&g=b8davs` · cours : § 1.1 · Chaque chiffre a une valeur selon sa place

**Numération.**

1. a) Complète : $4\,901 = \ldots \times 1\,000 + \ldots \times 100 + \ldots \times 10 + \ldots \times 1$. → attendu :  $4$ × 1 000 ;  $9$ × 100 ;  $0$ × 10 ;  $1$ × 1
   - Indice : Chaque chiffre donne le nombre de paquets de son rang.
   - Erreur typique (réponses 4 ; 49 ; 490 ; 4901) : Ce sont les **nombres** de milliers, centaines… ; on veut les **chiffres** de chaque rang.
2. b) Écris en chiffres : « quatre-vingts unités et quatre-vingt-dix-neuf millièmes ». → attendu :  $80{,}099$
   - Indice : Millièmes : 3 chiffres après la virgule.
   - Erreur typique (réponse 8099/100) : $0{,}099$ : il faut 3 chiffres après la virgule (des zéros si besoin).
   - Erreur typique (réponse 800099/10000) : Les millièmes : 3 chiffres après la virgule, pas 4.
3. c) Écris en chiffres : « six millions soixante mille ». → attendu :  $6\,060\,000$
   - Indice : Repère les mots « million » et « mille » : ils séparent des tranches de trois chiffres.
   - Erreur typique (réponse 660000) : Il manque des zéros : chaque tranche (millions, milliers, unités) a trois chiffres.

**Corrigé**

> a) $4\,901 = 4 \times 1\,000 + 9 \times 100 + 0 \times 10 + 1 \times 1$.  
> b) $80{,}099$ (3 chiffres après la virgule pour les millièmes).  
> c) $6\,060\,000$.  

Réponse : 4 ; 9 ; 0 ; 1 ; $80{,}099$ ; $6\,060\,000$

## 3. Comparer, encadrer, ranger — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=comparer&niv=1&g=gqb44z` · cours : § 2.2 · Comparer, ranger, encadrer

**Compare et encadre.**

1. a) Compare $15{,}8$ et $15{,}72$. → attendu : $>$ (options : $<$ / $>$ / $=$)
   - Indice : Même partie entière : complète par des zéros pour avoir autant de décimales, puis compare.
   - Si « $<$ » : Avec 2 décimales : $15{,}80 > 15{,}72$, en comparant rang par rang depuis les dixièmes. Avoir plus de chiffres ne rend pas plus grand.
   - Si « $=$ » : Les deux nombres ne sont pas égaux. Avec 2 décimales : $15{,}80 > 15{,}72$, en comparant rang par rang depuis les dixièmes. Avoir plus de chiffres ne rend pas plus grand.
2. b) Compare $1{,}21$ et $1{,}239$. → attendu : $<$ (options : $<$ / $>$ / $=$)
   - Indice : Même partie entière : complète par des zéros pour avoir autant de décimales, puis compare.
   - Si « $>$ » : Avec 3 décimales : $1{,}239 > 1{,}210$, en comparant rang par rang depuis les dixièmes.
   - Si « $=$ » : Les deux nombres ne sont pas égaux. Avec 3 décimales : $1{,}239 > 1{,}210$, en comparant rang par rang depuis les dixièmes.
3. c) Encadre $97{,}193$ au dixième près, puis au centième près. → attendu :  $97{,}1$ ; $< 97{,}193 <$ $97{,}2$ ;  $97{,}19$ ; $< 97{,}193 <$ $97{,}2$
   - Indice : Au dixième près : coupe après les dixièmes, puis ajoute un dixième.
   - Erreur typique (réponses 971/10 ; 9711/100 ; 9719/100 ; 97191/1000) : Au dixième près, les deux bornes diffèrent de 0,1 ; au centième près, de 0,01.
   - Erreur typique (réponse 97) : C’est un encadrement juste, mais pas au dixième près : l’écart entre les deux bornes doit être 0,1.
   - Erreur typique (réponse 973/10) : C’est un encadrement juste, mais pas au dixième près : l’écart entre les deux bornes doit être 0,1.
   - Erreur typique (réponse 4859/50) : C’est un encadrement juste, mais pas au centième près : l’écart entre les deux bornes doit être 0,01.
   - Erreur typique (réponse 9721/100) : C’est un encadrement juste, mais pas au centième près : l’écart entre les deux bornes doit être 0,01.

**Corrigé**

> a) $15{,}80$ et $15{,}72$ : $15{,}8 > 15{,}72$.  
> b) $1{,}210$ et $1{,}239$ : $1{,}21 < 1{,}239$.  
> c) $97{,}1 < 97{,}193 < 97{,}2$ ; $97{,}19 < 97{,}193 < 97{,}2$.  

Réponse : $15{,}8 > 15{,}72$ ; $1{,}21 < 1{,}239$ ; $97{,}19 < 97{,}193 < 97{,}2$

## 4. Comparer, encadrer, ranger — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=comparer&niv=2&g=orf7u3` · cours : § 2.2 · Comparer, ranger, encadrer

**Range, puis lis sur une droite graduée.**

![figure](exos-02-figures/04-comparer.svg)

1. a) Range ces nombres dans l’ordre croissant : fais glisser les cartes (ou utilise ↑ ↓). → attendu : $10{,}035 < 10{,}05 < 10{,}5 < 10{,}504 < 10{,}58$
   - Cartes (ordre de départ, croissant demandé) : $10{,}05$ | $10{,}58$ | $10{,}035$ | $10{,}504$ | $10{,}5$
   - Si la paire $10{,}05$ / $10{,}58$ est mal rangée : Compare $10{,}05$ et $10{,}58$ rang par rang : écris-les avec trois décimales ($10{,}050$ et $10{,}580$).
   - Si la paire $10{,}05$ / $10{,}035$ est mal rangée : Compare $10{,}05$ et $10{,}035$ rang par rang : écris-les avec trois décimales ($10{,}050$ et $10{,}035$).
   - Si la paire $10{,}05$ / $10{,}504$ est mal rangée : Compare $10{,}05$ et $10{,}504$ rang par rang : écris-les avec trois décimales ($10{,}050$ et $10{,}504$).
   - (… 7 autres paires expliquées)
   - Indice : Même partie entière : écris-les tous avec trois décimales, puis compare.
   - Erreur typique (ordre 201/20 ; 21/2 ; 2007/200 ; 529/50 ; 1313/125) : Tu as comparé les parties décimales comme des entiers : on compare **rang par rang**, en commençant par les dixièmes.
   - Erreur typique (ordre 529/50 ; 1313/125 ; 21/2 ; 201/20 ; 2007/200) : C’est l’ordre **décroissant**.
2. b) La droite graduée ci-dessus est graduée en centièmes, de $10{,}1$ à $10{,}2$. Lis les abscisses de A et de B. → attendu : A : $10{,}13$ ; B : $10{,}19$
   - Indice : Entre deux graduations voisines, il y a un centième (0,01).
   - Erreur typique (réponses 52/5 ; 11) : Les petites graduations valent un **centième** (0,01), pas un dixième.

**Corrigé**

> a) Avec trois décimales : $10{,}050$ ; $10{,}504$ ; $10{,}035$ ; $10{,}580$ ; $10{,}500$. Donc $10{,}035 < 10{,}05 < 10{,}5 < 10{,}504 < 10{,}58$.  
> b) Dix graduations entre $10{,}1$ et $10{,}2$ : chacune vaut $0{,}01$. A est à 3 graduations : $10{,}13$ ; B à 9 : $10{,}19$.  

Réponse : $10{,}035 < 10{,}05 < 10{,}5 < 10{,}504 < 10{,}58$ ; A $10{,}13$, B $10{,}19$

## 5. Opérations sur les décimaux — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=operations&niv=1&g=1hvfhvm` · cours : § 3.2 · Multiplication

**Calcule.**

1. a) Calcule $61{,}8 + 2{,}91$. → attendu : $61{,}8 + 2{,}91 =$ $64{,}71$
   - Indice : Pose l’opération en **alignant les virgules** (complète par des zéros).
   - Erreur typique (réponse 62091/1000) : Les virgules ne sont pas alignées : dixièmes sous dixièmes, centièmes sous centièmes.
2. b) Calcule $2{,}79 \times 4$. → attendu :  $11{,}16$
   - Indice : Calcule sans la virgule, puis place autant de décimales que dans le facteur décimal.
   - Erreur typique (réponse 558/5) : Virgule mal placée : 2 chiffres après la virgule dans le produit.
   - Erreur typique (réponse 279/250) : Virgule mal placée : 2 chiffres après la virgule dans le produit.
3. c) Calcule $0{,}72 \div 4$. → attendu :  $0{,}18$
   - Indice : Pose la division ; quand tu dépasses la virgule du dividende, place la virgule au quotient.
   - Erreur typique (réponse 9/5) : Virgule oubliée ou mal placée au quotient.
   - Erreur typique (réponse 9/500) : Virgule mal placée au quotient.

**Corrigé**

> a) $61{,}80 + 2{,}91 = 64{,}71$ (virgules alignées).  
> b) $279 \times 4 = 1\,116$, deux décimales : $11{,}16$.  
> c) $0{,}72 \div 4 = 0{,}18$ ; contrôle : $0{,}18 \times 4 = 0{,}72$ ✓.  

Réponse : $64{,}71$ ; $11{,}16$ ; $0{,}18$

## 6. Opérations sur les décimaux — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=operations&niv=2&g=9mynkr` · cours : § 3.2 · Multiplication

**Calcule.**

1. a) Calcule $0{,}08 \times 4{,}9$. → attendu :  $0{,}392$
   - Indice : Calcule $8 \times 49$, puis place 3 décimales.
   - Erreur typique (réponse 98/25) : Il faut 3 chiffres après la virgule : les décimales des deux facteurs **réunies**.
   - Erreur typique (réponse 196/5) : Il faut 3 chiffres après la virgule : les décimales des deux facteurs **réunies**.
2. b) Calcule $38{,}08 \div 0{,}68$. → attendu :  $56$
   - Indice : Multiplie les deux nombres par $100$ pour que le diviseur devienne entier.
   - Erreur typique (réponse 28/5) : Multiplie **les deux** nombres par la même puissance de 10.
   - Erreur typique (réponse 560) : Multiplie **les deux** nombres par la même puissance de 10.
   - Erreur typique (réponse 16184/625) : C’est une division, pas une multiplication.
3. c) Une planche mesure $2{,}8$ m. On y découpe 3 morceaux de $0{,}72$ m. Quelle longueur reste-t-il ? → attendu : Reste : $0{,}64$ m
   - Indice : Calcule d’abord la longueur des 3 morceaux.
   - Erreur typique (réponse 52/25) : Il y a 3 morceaux, pas un seul.

**Corrigé**

> a) $8 \times 49 = 392$ ; 2 + 1 = 3 décimales : $0{,}08 \times 4{,}9 = 0{,}392$.  
> b) On multiplie par $100$ : $38{,}08 \div 0{,}68 = 3\,808 \div 68 = 56$. Contrôle : $56 \times 0{,}68 = 38{,}08$ ✓.  
> c) $3 \times 0{,}72 = 2{,}16$ m ; $2{,}8 - 2{,}16 = 0{,}64$ m.  

Réponse : $0{,}392$ ; $56$ ; $0{,}64$

## 7. Priorités et ordre de grandeur — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=calculs&niv=1&g=35934r` · cours : § 3.4 · Priorités et ordre de grandeur

**Calcule en respectant les priorités.**

1. a) $40 - 4 \div 2$ → attendu : $40 - 4 \div 2 =$ $38$
   - Indice : Parenthèses d’abord, puis × et ÷, puis + et −.
   - Erreur typique (réponse 18) : La multiplication et la division passent avant l’addition et la soustraction.
2. b) $(8 + 2) \times 2{,}5$ → attendu : $(8 + 2) \times 2{,}5 =$ $25$
   - Indice : Parenthèses d’abord, puis × et ÷, puis + et −.
   - Erreur typique (réponse 13) : Les parenthèses se calculent en premier.
3. c) $8 + 2 \times 2{,}5$ → attendu : $8 + 2 \times 2{,}5 =$ $13$
   - Indice : Parenthèses d’abord, puis × et ÷, puis + et −.
   - Erreur typique (réponse 25) : La multiplication et la division passent avant l’addition et la soustraction.

**Corrigé**

> a) $40 - 4 \div 2 = 40 - 2 = 38$.  
> b) $(8 + 2) \times 2{,}5 = 10 \times 2{,}5 = 25$.  
> c) $8 + 2 \times 2{,}5 = 8 + 5 = 13$.  

Réponse : $38$ ; $25$ ; $13$

## 8. Priorités et ordre de grandeur — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=calculs&niv=2&g=6udexx` · cours : § 3.4 · Priorités et ordre de grandeur

**Ordre de grandeur.**

1. a) Sans poser l’opération, quel est le résultat de $34 \times 77$ ? → attendu : $2\,618$ (options : $26\,180$ / $2\,618$ / $261{,}8$ / $26{,}18$)
   - Indice : Remplace chaque nombre par un nombre proche et simple, puis calcule de tête.
   - Si « $26\,180$ » : Ordre de grandeur : $30 \times 80 = 2\,400$. $26\,180$ est beaucoup trop grand : erreur de virgule.
   - Si « $261{,}8$ » : Ordre de grandeur : $30 \times 80 = 2\,400$. $261{,}8$ est beaucoup trop petit : erreur de virgule.
   - Si « $26{,}18$ » : Ordre de grandeur : $30 \times 80 = 2\,400$. $26{,}18$ est beaucoup trop petit : erreur de virgule.
2. b) Sans poser l’opération, quel est le résultat de $0{,}54 \times 246$ ? → attendu : $132{,}84$ (options : $13{,}284$ / $132{,}84$ / $1{,}3284$ / $1\,328{,}4$)
   - Indice : Remplace chaque nombre par un nombre proche et simple, puis calcule de tête.
   - Si « $13{,}284$ » : Ordre de grandeur : $0{,}5 \times 200 = 100$. $13{,}284$ est beaucoup trop petit : erreur de virgule.
   - Si « $1{,}3284$ » : Ordre de grandeur : $0{,}5 \times 200 = 100$. $1{,}3284$ est beaucoup trop petit : erreur de virgule.
   - Si « $1\,328{,}4$ » : Ordre de grandeur : $0{,}5 \times 200 = 100$. $1\,328{,}4$ est beaucoup trop grand : erreur de virgule.
3. c) Sarah achète un article à $7{,}87$ €, un à $15{,}92$ € et deux à $3{,}10$ € l’un. Sarah paie avec un billet de 50 €. Combien lui rend-on ? → attendu : Monnaie : $20{,}01$ €
   - Indice : Calcule la dépense (deux articles au même prix !), puis la différence avec le billet.
   - Erreur typique (réponse 2311/100) : Il y a **deux** articles au dernier prix.
   - Erreur typique (réponse 2999/100) : C’est la dépense ; on demande la monnaie rendue.

**Corrigé**

> a) $34 \times 77 \approx 30 \times 80 = 2\,400$ : seul $2\,618$ est cohérent.  
> b) $0{,}54 \times 246 \approx 0{,}5 \times 200 = 100$ : seul $132{,}84$ est cohérent.  
> c) Dépense : $7{,}87 + 15{,}92 + 2 \times 3{,}10 = 29{,}99$ € (ordre de grandeur : $8 + 16 + 6 = 30$) ; on rend $50 - 29{,}99 = 20{,}01$ €.  

Réponse : $2\,618$ ; $132{,}84$ ; $20{,}01$ €

## 9. Arrondir, tronquer — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=arrondir&niv=1&g=jz5msw` · cours : § 4 · Arrondir, tronquer

**Arrondis et tronque.**

1. a) Arrondis $7{,}728$ à l’unité. → attendu :  $8$
   - Indice : Regarde le chiffre qui suit le rang demandé : $7$.
   - Erreur typique (réponse 7) : C’est la troncature : le chiffre suivant est 7, donc on augmente.
2. b) Arrondis $7{,}728$ au dixième. → attendu :  $7{,}7$
   - Indice : Regarde le chiffre qui suit le rang demandé : $2$.
   - Erreur typique (réponse 39/5) : Le chiffre suivant est 2, plus petit que 5 : on garde le chiffre.
3. c) Arrondis $7{,}728$ au centième. → attendu :  $7{,}73$
   - Indice : Regarde le chiffre qui suit le rang demandé : $8$.
   - Erreur typique (réponse 193/25) : C’est la troncature : le chiffre suivant est 8, donc on augmente.
4. d) Donne la troncature de $7{,}728$ au dixième. → attendu :  $7{,}7$
   - Indice : Tronquer, c’est couper après le rang demandé.

**Corrigé**

> a) À l’unité : chiffre suivant $7$, donc $7{,}728 \approx 8$.  
> b) Au dixième : chiffre suivant $2$, donc $7{,}728 \approx 7{,}7$.  
> c) Au centième : chiffre suivant $8$, donc $7{,}728 \approx 7{,}73$.  
> d) On coupe après les dixièmes : $7{,}7$.  

Réponse : $8$ ; $7{,}7$ ; $7{,}73$ ; $7{,}7$

## 10. Arrondir, tronquer — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=arrondir&niv=2&g=16nhljx` · cours : § 4 · Arrondir, tronquer

**Arrondis : attention aux pièges.**

1. a) Arrondis $14{,}245$ au dixième. → attendu :  $14{,}2$
   - Indice : Regarde **seulement** le chiffre qui suit les dixièmes.
   - Erreur typique (réponse 143/10) : On n’arrondit pas « en cascade » (d’abord au centième, puis au dixième) : le chiffre des centièmes est 4, donc on garde.
2. b) Arrondis $23{,}964$ au dixième. → attendu :  $24{,}0$
   - Indice : Le chiffre suivant est 5 ou plus : on augmente le chiffre des dixièmes… qui vaut 9 : la retenue se propage.
   - Erreur typique (réponse 231/10) : La retenue se propage : $9$ dixièmes + 1 dixième = 1 unité.
   - Erreur typique (réponse 239/10) : C’est la troncature : le chiffre suivant est 5 ou plus, on augmente.
3. c) $\dfrac{2}{7} = 0{,}2857\ldots$ Donne sa troncature, puis son arrondi au centième. → attendu : Troncature : $0{,}28$ ; Arrondi : $0{,}29$
   - Indice : Troncature : couper. Arrondi : regarder le chiffre des millièmes.
   - Erreur typique (réponses 29/100 ; 7/25) : Inversés : la troncature coupe, l’arrondi regarde le chiffre suivant.
   - Erreur typique (réponses 7/25 ; 7/25) : L’arrondi : le chiffre des millièmes est 5, donc on augmente.

**Corrigé**

> a) Chiffre des centièmes : $4$ (plus petit que 5) : $14{,}245 \approx 14{,}2$ (et non $14{,}3$).  
> b) Chiffre suivant $6$ : on augmente $23{,}9$ d’un dixième, ce qui donne $24{,}0$ (on écrit le zéro des dixièmes).  
> c) Troncature : $0{,}28$ ; chiffre des millièmes $5$, donc arrondi $0{,}29$.  

Réponse : $14{,}2$ ; $24{,}0$ ; $0{,}28$ ; $0{,}29$

## 11. Division euclidienne — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=euclide&niv=1&g=20ff2a` · cours : § 5.1 · Division euclidienne

**Effectue les divisions euclidiennes.**

1. a) Division de $73$ par $9$ : $73 = 9 \times q + r$. → attendu : $q =$ $8$ ; $r =$ $1$
   - Indice : Cherche le plus grand multiple de 9 qui ne dépasse pas 73. Le reste doit être plus petit que 9.
   - Erreur typique (réponses 7 ; 10) : Le reste $10$ est plus grand que $9$ : on peut encore faire un paquet de 9.
   - Erreur typique (réponses 1 ; 8) : Quotient et reste inversés.
2. b) Division de $224$ par $22$ : $224 = 22 \times q + r$. → attendu : $q =$ $10$ ; $r =$ $4$
   - Indice : Cherche le plus grand multiple de 22 qui ne dépasse pas 224. Le reste doit être plus petit que 22.
   - Erreur typique (réponses 9 ; 26) : Le reste $26$ est plus grand que $22$ : on peut encore faire un paquet de 22.
   - Erreur typique (réponses 4 ; 10) : Quotient et reste inversés.

**Corrigé**

> a) $9 \times 8 = 72$ et $9 \times 9 = 81 > 73$, donc $73 = 9 \times 8 + 1$ avec $1 < 9$.  
> b) $22 \times 10 = 220$ et $22 \times 11 = 242 > 224$, donc $224 = 22 \times 10 + 4$ avec $4 < 22$.  

Réponse : $73 = 9 \times 8 + 1$ ; $224 = 22 \times 10 + 4$

## 12. Division euclidienne — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=euclide&niv=2&g=12t4qun` · cours : § 5.1 · Division euclidienne

**Division euclidienne en situation.**

On doit répartir $247$ invités dans des tables de $8$ places.  

1. a) Effectue la division euclidienne de $247$ par $8$. → attendu : $q =$ $30$ ; $r =$ $7$
   - Indice : Le reste doit être plus petit que 8.
   - Erreur typique (réponses 29 ; 15) : Le reste doit être plus petit que $8$.
2. b) Combien faut-il de tables pour que tous les invités soient placés ? → attendu :  $31$
   - Indice : 30 tables pleines ne suffisent pas : il reste 7 invités.
   - Erreur typique (réponse 30) : Avec 30 tables, il reste 7 invités sans place : il en faut une de plus.
3. c) Combien de places restent libres dans la dernière table ? → attendu :  $1$
   - Indice : Le dernier contenant accueille les 7 invités restants.
   - Erreur typique (réponse 7) : 7, ce sont les invités du dernier contenant ; on demande les places **libres**.

**Corrigé**

> a) $247 = 8 \times 30 + 7$ avec $7 < 8$.  
> b) 30 tables pleines et 7 invités en plus : il faut $31$ tables.  
> c) $8 - 7 = 1$ place libre. Contrôle : $31 \times 8 - 247 = 1$ ✓.  

Réponse : $q = 30, r = 7$ ; $31$ ; $1$

## 13. Critères de divisibilité, diviseurs — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=divisibilite&niv=1&g=1pd8tot` · cours : § 5.2 · Multiples et diviseurs

**Le nombre $503$ est-il divisible par… ?**

1. a) par $2$ ? → attendu : Non (options : Oui / Non)
   - Indice : Regarde le chiffre des unités.
   - Si « Oui » : Chiffre des unités : $3$. Pour 2, on regarde le **chiffre des unités**, pas la somme des chiffres.
2. b) par $3$ ? → attendu : Non (options : Oui / Non)
   - Indice : Additionne les chiffres de 503.
   - Si « Oui » : Somme des chiffres : $8$, pas divisible par 3. Pour 3 et 9, on regarde la **somme des chiffres**, pas le dernier chiffre.
3. c) par $5$ ? → attendu : Non (options : Oui / Non)
   - Indice : Regarde le chiffre des unités.
   - Si « Oui » : Chiffre des unités : $3$. Pour 5, on regarde le **chiffre des unités**, pas la somme des chiffres.
4. d) par $9$ ? → attendu : Non (options : Oui / Non)
   - Indice : Additionne les chiffres de 503.
   - Si « Oui » : Somme des chiffres : $8$, pas divisible par 9. Pour 3 et 9, on regarde la **somme des chiffres**, pas le dernier chiffre.

**Corrigé**

> Chiffre des unités : $3$ ; somme des chiffres : $5 + 0 + 3 = 8$.  
> a) Non : il ne se termine pas par 0, 2, 4, 6 ou 8.  
> b) Non : $8$ n’est pas divisible par 3.  
> c) Non : il ne se termine pas par 0 ou 5.  
> d) Non : $8$ n’est pas divisible par 9.  

Réponse : 2 : non ; 3 : non ; 5 : non ; 9 : non

## 14. Critères de divisibilité, diviseurs — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=divisibilite&niv=2&g=6qci8j` · cours : § 5.2 · Multiples et diviseurs

**Diviseurs.**

1. a) Donne la liste des diviseurs de $135$, dans l’ordre croissant. → attendu :  $1$ ;  $3$ ;  $5$ ;  $9$ ;  $15$ ;  $27$ ;  $45$ ;  $135$
   - Indice : Cherche les paires : $1 \times 135$, $2 \times \ldots$ Arrête-toi quand les paires se répètent.
   - Erreur typique (réponses 135 ; 45 ; 27 ; 15 ; 9 ; 5 ; 3 ; 1) : Dans l’ordre **croissant**.
2. b) Quels sont les diviseurs communs à $135$ et $20$ ? → attendu :  $1$ ;  $5$
   - Indice : Garde, parmi les diviseurs de 135, ceux qui divisent aussi 20.
3. c) Quel est le plus grand diviseur commun à $135$ et $20$ ? → attendu :  $5$
   - Indice : Le plus grand de la liste précédente.
   - Erreur typique (réponse 2700) : C’est un multiple commun, pas un diviseur.

**Corrigé**

> a) Paires : $1 \times 135$, $3 \times 45$, $5 \times 27$, $9 \times 15$. Diviseurs de $135$ : $1 ; 3 ; 5 ; 9 ; 15 ; 27 ; 45 ; 135$.  
> b) Diviseurs de $20$ : $1 ; 2 ; 4 ; 5 ; 10 ; 20$. Communs : $1 ; 5$.  
> c) Le plus grand est $5$.  

Réponse : $1 ; 3 ; 5 ; 9 ; 15 ; 27 ; 45 ; 135$ ; $1 ; 5$ ; $5$

## 15. Nombres premiers — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=premiers&niv=2&g=ifg0ya` · cours : § 6 · Nombres premiers

**Nombres premiers.**

1. a) $69$ est-il premier ? → attendu : Non (options : Oui / Non)
   - Indice : Essaie de diviser par 2, 3, 5, 7 ; on peut s’arrêter quand le carré du diviseur dépasse 69.
   - Si « Oui » : $69 = 3 \times 23$ : il a d’autres diviseurs que 1 et lui-même. Être impair ne suffit pas.
2. Écris $69$ comme produit de deux entiers plus grands que 1 (le plus petit d’abord). → attendu :  $3$ ; $\times$ $23$
   - Indice : Le plus petit diviseur premier de 69 est parmi 2, 3, 5, 7.
   - Erreur typique (réponses 1 ; 69) : Des entiers **plus grands que 1**.
3. b) $197$ est-il premier ? → attendu : Oui (options : Oui / Non)
   - Indice : Essaie de diviser par 2, 3, 5, 7, 11, 13 ; on peut s’arrêter quand le carré du diviseur dépasse 197.
   - Si « Non » : Essaie 2, 3, 5, 7, 11, 13 : aucune division ne tombe juste, et $17^2 > 197$.
4. c) $97$ est-il premier ? → attendu : Oui (options : Oui / Non)
   - Indice : Essaie de diviser par 2, 3, 5, 7 ; on peut s’arrêter quand le carré du diviseur dépasse 97.
   - Si « Non » : Essaie 2, 3, 5, 7 : aucune division ne tombe juste, et $11^2 > 97$.

**Corrigé**

> a) $69 = 3 \times 23$ : $69$ n’est pas premier.  
> b) $197$ n’est divisible ni par 2, ni par 3, ni par 5, ni par 7, ni par 11, ni par 13 ; $17^2 = 289 > 197$ : $197$ est premier.  
> c) $97$ n’est divisible ni par 2, ni par 3, ni par 5, ni par 7 ; $11^2 = 121 > 97$ : $97$ est premier.  

Réponse : 69 : $3 \times 23$ ; 197 : premier ; 97 : premier

## 16. Décomposer en facteurs premiers — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=decomposer&niv=2&g=dkvbtv` · cours : § 7 · Décomposer en facteurs premiers

**Décomposition en facteurs premiers.**

1. a) Décompose $462$ en produit de facteurs premiers : $462 = 2^{\ldots} \times 3^{\ldots} \times 7^{\ldots} \times 11^{\ldots}$. Donne les exposants. → attendu : Exposant de $2$ : $1$ ; Exposant de $3$ : $1$ ; Exposant de $7$ : $1$ ; Exposant de $11$ : $1$
   - Indice : Divise par 2 tant que c’est possible, puis par 3, puis par 5, 7…
   - Erreur typique (réponses 2 ; 2 ; 2 ; 2) : Un facteur de trop pour chaque nombre premier : recompte les divisions.
2. b) Sachant que $200 = 2^{3} \times 5^{2}$, rends la fraction $\dfrac{462}{200}$ irréductible. → attendu :  $\dfrac{231}{100}$
   - Indice : Barre les facteurs premiers communs au numérateur et au dénominateur.

**Corrigé**

> a) $462 \div 2 = 231 ; \; 231 \div 3 = 77 ; \; 77 \div 7 = 11 ; \; 11 \div 11 = 1$. Donc $462 = 2 \times 3 \times 7 \times 11$.  
> b) Facteurs communs : $2$. $\dfrac{462}{200} = \dfrac{231 \times 2}{100 \times 2} = \dfrac{231}{100}$.  

Réponse : $2 \times 3 \times 7 \times 11$ ; $\dfrac{231}{100}$

## 17. Décomposer en facteurs premiers — ★★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=decomposer&niv=3&g=9tuq1b` · cours : § 7 · Décomposer en facteurs premiers

**Décomposition et nombre de diviseurs.**

1. a) Décompose $360$ en produit de facteurs premiers : $360 = 2^{\ldots} \times 3^{\ldots} \times 5^{\ldots}$. Donne les exposants. → attendu : Exposant de $2$ : $3$ ; Exposant de $3$ : $2$ ; Exposant de $5$ : $1$
   - Indice : Divise par 2 tant que c’est possible, puis par 3, puis par 5, 7…
   - Erreur typique (réponses 4 ; 3 ; 2) : Un facteur de trop pour chaque nombre premier : recompte les divisions.
2. b) Combien $360$ a-t-il de diviseurs ? → attendu :  $24$
   - Indice : Un diviseur s’écrit $2^{a} \times 3^{b} \times 5^{c}$ : combien de choix pour chaque exposant ?
   - Erreur typique (réponse 6) : L’exposant peut aussi valoir 0 : il y a (exposant + 1) choix.
   - Erreur typique (réponse 9) : On **multiplie** les nombres de choix (et on ne les additionne pas).

**Corrigé**

> a) $360 \div 2 = 180 ; \; 180 \div 2 = 90 ; \; 90 \div 2 = 45 ; \; 45 \div 3 = 15 ; \; 15 \div 3 = 5 ; \; 5 \div 5 = 1$. Donc $360 = 2 \times 2 \times 2 \times 3 \times 3 \times 5 = 2^{3} \times 3^{2} \times 5$.  
> b) Exposant de $2$ : de 0 à 3 (4 choix) ; $3$ : de 0 à 2 (3 choix) ; $5$ : de 0 à 1 (2 choix). Nombre de diviseurs : $4 \times 3 \times 2 = 24$.  

Réponse : $2^{3} \times 3^{2} \times 5$ ; $24$ diviseurs

## 18. Problèmes de partage — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=partage&niv=2&g=t62erz` · cours : § 7 · Décomposer en facteurs premiers

**Le plus grand nombre de lots identiques.**

Yanis a $242$ billes rouges et $220$ billes bleues. Yanis veut faire le plus grand nombre possible de lots identiques en utilisant tout.  

1. a) Décompose : $242 = 2 \times 11^{2}$ et $220 = 2^{2} \times 5 \times 11$. Quel est le plus grand diviseur commun ? → attendu :  $22$
   - Indice : Prends les facteurs premiers communs aux deux décompositions.
   - Erreur typique (réponse 2420) : C’est le plus petit multiple commun ; on cherche un **diviseur** commun.
   - Erreur typique (réponse 53240) : C’est un multiple commun ; on cherche un **diviseur** commun.
2. b) Combien de lots ? Que contient chacun ? → attendu : Lots : $22$ ; Billes rouges par lot : $11$ ; Billes bleues par lot : $10$
   - Indice : Divise 242 et 220 par le nombre de lots.

**Corrigé**

> a) Facteurs communs : $2 \times 11 = 22$.  
> b) $22$ lots, chacun avec $242 \div 22 = 11$ billes rouges et $220 \div 22 = 10$ billes bleues. Contrôle : $11$ et $10$ n’ont plus de diviseur commun ✓.  

Réponse : $22$ lots de 11 billes rouges et 10 billes bleues

## 19. Trouver l’erreur — ★★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=erreur&niv=2&g=1pdziqx` · cours : Série H · Trouver l’erreur

**Trouve l’erreur.**

Lucas affirme : « $1{,}9 \times 10 = 1{,}90$ : multiplier par 10, c’est ajouter un zéro. »  

1. Quelle est l’erreur ? → attendu : Multiplier par 10 ne revient pas à ajouter un zéro à droite d’un décimal : les chiffres changent de rang. (options : 1 n’est pas premier : un nombre premier a exactement deux diviseurs. / On compare les décimaux rang par rang, pas les parties décimales comme des entiers. / Multiplier par 10 ne revient pas à ajouter un zéro à droite d’un décimal : les chiffres changent de rang. / Dans un produit, il faut autant de chiffres après la virgule que les deux facteurs réunis.)
   - Indice : Reviens à la règle du cours.
   - Si « 1 n’est pas premier : un nombre premier a exactement deux diviseurs. » : Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.
   - Si « On compare les décimaux rang par rang, pas les parties décimales comme des entiers. » : Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.
   - Si « Dans un produit, il faut autant de chiffres après la virgule que les deux facteurs réunis. » : Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.
2. Que vaut vraiment $1{,}9 \times 10$ ? → attendu :  $19$
   - Indice : Chaque chiffre avance d’un rang vers la gauche.
   - Erreur typique (réponse 19/10) : $1{,}90 = 1{,}9$ : le nombre n’a pas changé.

**Corrigé**

> Multiplier par 10 ne revient pas à ajouter un zéro à droite d’un décimal : les chiffres changent de rang.  
> $1{,}9 \times 10 = 19$ : les chiffres avancent d’un rang. $1{,}90$ vaut toujours $1{,}9$.  

Réponse : Multiplier par 10 ne revient pas à ajouter un zéro à droite d’un décimal : les chiffres changent de rang.

## 20. Numération — ★

Adresse : `#/entrainement/02-entiers-et-decimaux/exo?t=numeration&niv=1&g=1d0j6mu` · cours : § 1.1 · Chaque chiffre a une valeur selon sa place

**Numération.**

On considère le nombre $609{,}173$.  

1. a) Quel est le **chiffre** des centièmes ? → attendu :  $7$
   - Indice : Repère la colonne des centièmes dans le tableau de numération (après la virgule).
   - Erreur typique (réponse 1) : C’est le chiffre du rang voisin : compte les rangs à partir de la virgule.
   - Erreur typique (réponse 3) : C’est le chiffre du rang voisin : compte les rangs à partir de la virgule.
   - Erreur typique (réponse 60917) : C’est le **nombre** de centièmes ; on demande seulement le **chiffre** (un seul chiffre).
2. b) Quel est le **nombre** de dixièmes ? → attendu :  $6091$
   - Indice : On lit tout ce qui est à gauche de la colonne des dixièmes, celle-ci comprise.
   - Erreur typique (réponse 1) : C’est le **chiffre** des dixièmes ; le nombre de dixièmes compte tous les paquets.
   - Erreur typique (réponse 60917) : Un rang de trop : on s’arrête à la colonne demandée.
3. c) Calcule $8{,}08 \times 1\,000$. → attendu : $8{,}08 \times 1\,000 =$ $8\,080$
   - Indice : Les chiffres changent de 3 rangs vers la gauche.
   - Erreur typique (réponse 101/12500) : Le résultat doit être plus grand : les chiffres avancent vers la gauche.
   - Erreur typique (réponse 80800) : Un rang de trop.
   - Erreur typique (réponse 808) : Un rang de moins.

**Corrigé**

> a) Dans $609{,}173$, le chiffre des centièmes est $7$.  
> b) Le nombre de dixièmes est $6\,091$ : $6\,091 \times 0{,}1 = 609{,}1$ $\leqslant$ $609{,}173$.  
> c) $8{,}08 \times 1\,000 = 8\,080$ (les chiffres avancent de 3 rangs).  

Réponse : $7$ ; $6\,091$ ; $8\,080$
