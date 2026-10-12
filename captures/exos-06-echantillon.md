# Échantillon d’exercices générés — chapitre 06 (Calcul littéral, v0.5)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

**Relecture (9 oct. 2026, soir).** Échantillon relu en entier, plus des tirages ciblés (factorisations, identités).
Corrigé à la relecture : identités remarquables limitées à 36 énoncés différents au niveau ★★ → deux identités de natures
différentes par exercice ; coefficients non premiers entre eux à ★★★ (« (4x − 6)² ») exclus ; erreur « (a − b)² = a² − b² »
proposée à tort pour un (a + b)² ; « (4x)² = 16x² » écrit en un seul bloc ; corrigé « réduire » : « nombres : 4 = 4 » remplacé
par « 4 reste seul », un groupe par ligne ; programme de calcul : expression écrite d’un seul tenant ; factorisation par une
parenthèse : facteur restant à coefficient négatif « (x + 3)(−x − 2) » évité, et écrit « (11 − x) » dans le cas du carré ;
boucle infinie possible dans ce même générateur (constante tirée hors de la boucle) ; « x » des indices mis en formule.

## 1. Calculer une expression — ★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=valeur&niv=1&g=bt037d` · cours : § 2 · Calculer une expression

**Calcule $A = 5x^{2} + 8$ pour les valeurs demandées.**

1. a) Pour $x = 4$ : → attendu : $A =$ $88$
   - Indice : Remplace chaque $x$ par la valeur (entre parenthèses si elle est négative), rétablis les signes ×, puis respecte les priorités : puissances, puis ×, puis + et −.
   - Erreur typique (réponse 408) : $5x^2$ : le carré ne porte que sur $x$ (on calcule $x^2$, puis on multiplie par $5$).
   - Erreur typique (réponse 48) : $x^2 = x \times x$, pas $2x$.
2. b) Pour $x = -5$ : → attendu : $A =$ $133$
   - Indice : Remplace chaque $x$ par la valeur (entre parenthèses si elle est négative), rétablis les signes ×, puis respecte les priorités : puissances, puis ×, puis + et −.
   - Erreur typique (réponse -117) : $(-5)^2 = 25$ : le carré d’un négatif est **positif**.
   - Erreur typique (réponse 633) : $5x^2$ : le carré ne porte que sur $x$ (on calcule $x^2$, puis on multiplie par $5$).
   - Erreur typique (réponse -42) : $x^2 = x \times x$, pas $2x$.

**Corrigé**

> a) Pour $x = 4$ : $A = 5 \times 4^2 + 8 = 88$.  
> b) Pour $x = -5$ : $A = 5 \times (-5)^2 + 8 = 133$.  
> Contrôle : $(-5)^2$ est positif ; on a mis les nombres négatifs entre parenthèses.  

Réponse : a) $A = 88$ ; b) $A = 133$

## 2. Calculer une expression — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=valeur&niv=2&g=18csmbg` · cours : § 2 · Calculer une expression

**Calcule $A = -2x^{2} + 4x + 9$ pour les valeurs demandées.**

1. a) Pour $x = -2$ : → attendu : $A =$ $-7$
   - Indice : Remplace chaque $x$ par la valeur (entre parenthèses si elle est négative), rétablis les signes ×, puis respecte les priorités : puissances, puis ×, puis + et −.
   - Erreur typique (réponse 9) : $(-2)^2 = 4$ : le carré d’un négatif est **positif**.
   - Erreur typique (réponse 17) : $-2x^2$ : le carré ne porte que sur $x$ (on calcule $x^2$, puis on multiplie par $-2$).
2. b) Pour $x = 5$ : → attendu : $A =$ $-21$
   - Indice : Remplace chaque $x$ par la valeur (entre parenthèses si elle est négative), rétablis les signes ×, puis respecte les priorités : puissances, puis ×, puis + et −.
   - Erreur typique (réponse 129) : $-2x^2$ : le carré ne porte que sur $x$ (on calcule $x^2$, puis on multiplie par $-2$).
   - Erreur typique (réponse 9) : $x^2 = x \times x$, pas $2x$.

**Corrigé**

> a) Pour $x = -2$ : $A = -2 \times (-2)^2 + 4 \times (-2) + 9 = -7$.  
> b) Pour $x = 5$ : $A = -2 \times 5^2 + 4 \times 5 + 9 = -21$.  
> Contrôle : $(-2)^2$ est positif ; on a mis les nombres négatifs entre parenthèses.  

Réponse : a) $A = -7$ ; b) $A = -21$

## 3. Traduire une phrase — ★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=traduire&niv=1&g=19phima` · cours : § 1.2 · Conventions d’écriture

**Choisis l’expression qui traduit chaque phrase ($x$ désigne un nombre).**

1. a) Le double de $x$, diminué de $4$ : → attendu : $2x - 4$ (options : $4 - 2x$ / $x^2 - 4$ / $2x - 4$ / $2(x - 4)$)
   - Indice : Repère la **dernière** opération de la phrase (« le carré de… », « la somme de… ») : elle donne la forme de l’expression.
   - Si « $4 - 2x$ » : « Diminué de 4 » : on soustrait $4$ du double.
   - Si « $x^2 - 4$ » : Le double de $x$, c’est $2x$, pas $x^2$.
   - Si « $2(x - 4)$ » : Ici on prend d’abord le double de $x$, puis on enlève $4$ : pas de parenthèses.
2. b) Le triple de la somme de $x$ et de $12$ : → attendu : $3(x + 12)$ (options : $3(x + 12)$ / $x + 3 \times 12$ / $(x + 12)^3$ / $3x + 12$)
   - Indice : Repère la **dernière** opération de la phrase (« le carré de… », « la somme de… ») : elle donne la forme de l’expression.
   - Si « $x + 3 \times 12$ » : C’est toute la somme qui est multipliée par $3$.
   - Si « $(x + 12)^3$ » : Le triple, c’est « multiplier par 3 », pas une puissance.
   - Si « $3x + 12$ » : On calcule d’abord la somme, puis son triple : il faut des parenthèses.

**Corrigé**

> a) Le double de $x$, diminué de $4$ : $2x - 4$.  
> b) Le triple de la somme de $x$ et de $12$ : $3(x + 12)$.  

Réponse : a) $2x - 4$ ; b) $3(x + 12)$

## 4. Somme ou produit ? — ★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=nature&niv=1&g=nzxxae` · cours : § 3 · Somme ou produit ?

**Somme ou produit ? (Quelle opération ferait-on en dernier ?)**

1. a) $(x - 4)(x + 8) - 4$ → attendu : Somme (options : Somme / Produit)
   - Indice : Imagine qu’on calcule l’expression pour une valeur de $x$ : quelle opération ferait-on **en dernier** ?
   - Si « Produit » : C’est une somme : on **soustrait** $4$ en dernier.
2. b) $3(x - 7) + 6$ → attendu : Somme (options : Somme / Produit)
   - Indice : Imagine qu’on calcule l’expression pour une valeur de $x$ : quelle opération ferait-on **en dernier** ?
   - Si « Produit » : C’est une somme : on **ajoute** $6$ en dernier.
3. c) $(x + 8)(x - 7) - 1$ → attendu : Somme (options : Somme / Produit)
   - Indice : Imagine qu’on calcule l’expression pour une valeur de $x$ : quelle opération ferait-on **en dernier** ?
   - Si « Produit » : C’est une somme : on **soustrait** $1$ en dernier.
4. d) $4(x + 5)$ → attendu : Produit (options : Somme / Produit)
   - Indice : Imagine qu’on calcule l’expression pour une valeur de $x$ : quelle opération ferait-on **en dernier** ?
   - Si « Somme » : C’est un produit : on calcule la parenthèse, puis on **multiplie** en dernier.

**Corrigé**

> a) $(x - 4)(x + 8) - 4$ : somme (on **soustrait** $4$ en dernier).  
> b) $3(x - 7) + 6$ : somme (on **ajoute** $6$ en dernier).  
> c) $(x + 8)(x - 7) - 1$ : somme (on **soustrait** $1$ en dernier).  
> d) $4(x + 5)$ : produit (on calcule la parenthèse, puis on **multiplie** en dernier).  

Réponse : a) somme ; b) somme ; c) somme ; d) produit

## 5. Réduire — ★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=reduire&niv=1&g=8a5f19` · cours : § 4 · Réduire

**Réduis l’expression.**

$$B = -x - x + 2 - 5x - 11$$

1. (réponse) → attendu : $B =$ $-7x - 9$
   - Indice : Regroupe les termes semblables : les $x$ ensemble, les nombres ensemble. Chaque terme garde son signe.
   - Erreur typique (réponse $-16x$) : On ne peut pas additionner des $x$ et des nombres (tuiles différentes) : $3x + 2 \neq 5x$.
   - Erreur typique (réponse $7x + 13$) : Chaque terme garde **son signe** quand on regroupe.

**Corrigé**

> On regroupe les termes semblables (chaque terme avec son signe) :  
> Termes en $x$ : $-x - x - 5x = -7x$.  
> Nombres : $2 - 11 = -9$.  
> $B = -7x - 9$  

Réponse : $B = -7x - 9$

## 6. Réduire — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=reduire&niv=2&g=uuwz18` · cours : § 4 · Réduire

**Réduis l’expression.**

$$B = 2x^2 + 7x - 4x + 8 - 6x^2$$

1. (réponse) → attendu : $B =$ $-4x^{2} + 3x + 8$
   - Indice : Regroupe les termes semblables : les $x^2$ ensemble, les $x$ ensemble, les nombres ensemble. Chaque terme garde son signe.
   - Erreur typique (réponse $7x$) : On ne peut pas additionner des $x$ et des nombres (tuiles différentes) : $3x + 2 \neq 5x$.
   - Erreur typique (réponse $-x^{2} + 8$) : Les termes en $x^2$ et en $x$ ne se regroupent pas.
   - Erreur typique (réponse $-x + 8$) : Les termes en $x^2$ et en $x$ ne se regroupent pas.
   - Erreur typique (réponse $8x^{2} + 11x + 8$) : Chaque terme garde **son signe** quand on regroupe.

**Corrigé**

> On regroupe les termes semblables (chaque terme avec son signe) :  
> Termes en $x^2$ : $2x^2 - 6x^2 = -4x^2$.  
> Termes en $x$ : $7x - 4x = 3x$.  
> Nombres : $8$ reste seul.  
> $B = -4x^{2} + 3x + 8$  

Réponse : $B = -4x^{2} + 3x + 8$

## 7. Développer : k(a + b) — ★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=developper&niv=1&g=1lly7a7` · cours : § 5.1 · Distributivité simple

**Développe.**

$$A = x(x + 1)$$

1. (réponse) → attendu : $A =$ $x^{2} + x$
   - Indice : Le facteur devant la parenthèse multiplie **chaque** terme de la parenthèse, **avec son signe**.
   - Erreur typique (réponse $x^{2} + 1$) : $x$ multiplie aussi $1$ : $x \times 1 = x$.
   - Erreur typique (réponse $2x$) : $x \times x = x^2$, pas $x$ : on ne peut pas regrouper $x^2$ et $x$.
   - Erreur typique (réponse $2x^{2} + x$) : $x \times x = x^2$, pas $2x$.

**Corrigé**

> $x(x + 1) = x \times x + x \times 1 = x^{2} + x$  

Réponse : $A = x^{2} + x$

## 8. Développer : k(a + b) — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=developper&niv=2&g=1v4iti` · cours : § 5.1 · Distributivité simple

**Développe et réduis.**

$$A = 10 + 4(x - 8)$$

1. (réponse) → attendu : $A =$ $4x - 22$
   - Indice : Le facteur devant la parenthèse multiplie **chaque** terme de la parenthèse, **avec son signe**. Puis regroupe les termes semblables.
   - Erreur typique (réponse $14x - 112$) : Les priorités ! $10 + 4$ ne se calcule pas d’abord : la multiplication $4(\ldots)$ passe avant.
   - Erreur typique (réponse $4x + 2$) : Le facteur devant la parenthèse multiplie **chaque** terme de la parenthèse, **avec son signe**.

**Corrigé**

> $10 + 4(x - 8) = 10 + 4 \times x + 4 \times (-8)$  
> $= 10 + 4x - 32$  
> On réduit : $4x - 22$.  

Réponse : $A = 4x - 22$

## 9. Développer : k(a + b) — ★★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=developper&niv=3&g=1h8wpsy` · cours : § 5.1 · Distributivité simple

**Développe et réduis.**

$$A = 4(x + 7) + 5(2x - 6)$$

1. (réponse) → attendu : $A =$ $14x - 2$
   - Indice : Le facteur devant la parenthèse multiplie **chaque** terme de la parenthèse, **avec son signe**. Puis regroupe les termes semblables.
   - Erreur typique (réponse $14x + 1$) : Le facteur devant la parenthèse multiplie **chaque** terme de la parenthèse, **avec son signe**.

**Corrigé**

> Chaque facteur multiplie chaque terme de sa parenthèse.  
> $4(x + 7) + 5(2x - 6) = 4 \times x + 4 \times 7 + (5 \times 2x + 5 \times (-6))$  
> $= 4x + 28 + 10x - 30$  
> On réduit : $14x - 2$.  

Réponse : $A = 14x - 2$

## 10. Développer : (a + b)(c + d) — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=double&niv=2&g=y661uz` · cours : § 5.2 · Double distributivité

**Développe et réduis.**

$$A = (x - 9)(3x - 1)$$

1. (réponse) → attendu : $A =$ $3x^{2} - 28x + 9$
   - Indice : Chaque terme de la première parenthèse multiplie chaque terme de la seconde : quatre produits, avec leurs signes. Puis réduis.
   - Erreur typique (réponse $3x^{2} + 9$) : Il y a **quatre** produits : chaque terme de la première parenthèse multiplie chaque terme de la seconde.
   - Erreur typique (réponse $3x^{2} - 28x - 9$) : Attention au signe du dernier produit : $(-9) \times (-1) = 9$.
   - Erreur typique (réponse $3x^{2} - x + 9$) : Il manque un produit : $(-9) \times 3x$.
   - Erreur typique (réponse $3x^{2} - 27x + 9$) : Il manque un produit : $x \times (-1)$.
   - Erreur typique (réponse $3x^{2} + 26x + 9$) : Vérifie le signe de chacun des quatre produits.

**Corrigé**

> $(x - 9)(3x - 1) = x \times 3x + x \times (-1) + (-9) \times 3x + (-9) \times (-1)$  
> $= 3x^2 - x - 27x + 9$  
> $= 3x^{2} - 28x + 9$  

Réponse : $A = 3x^{2} - 28x + 9$

## 11. Développer : (a + b)(c + d) — ★★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=double&niv=3&g=1uhhcau` · cours : § 5.2 · Double distributivité

**Un rectangle a pour côtés $x + 6$ et $2x + 5$ (en cm, avec $x$ assez grand pour que ces longueurs soient positives).**

$$\mathcal{A} = (x + 6)(2x + 5)$$

1. a) Exprime son aire sous forme développée et réduite. → attendu : $\mathcal{A} =$ $2x^{2} + 17x + 30$
   - Indice : Chaque terme de la première parenthèse multiplie chaque terme de la seconde : quatre produits, avec leurs signes. Puis réduis.
   - Erreur typique (réponse $2x^{2} + 30$) : Il y a **quatre** produits : chaque terme de la première parenthèse multiplie chaque terme de la seconde.
   - Erreur typique (réponse $2x^{2} + 17x - 30$) : Attention au signe du dernier produit : $6 \times 5 = 30$.
   - Erreur typique (réponse $2x^{2} + 5x + 30$) : Il manque un produit : $6 \times 2x$.
   - Erreur typique (réponse $2x^{2} + 12x + 30$) : Il manque un produit : $x \times 5$.
   - Erreur typique (réponse $2x^{2} - 7x + 30$) : Vérifie le signe de chacun des quatre produits.
2. b) Calcule cette aire pour $x = 8$. → attendu : $\mathcal{A} =$ $294$ cm²
   - Indice : Remplace $x$ par $8$ dans les côtés : $14 \times 21$.
   - Erreur typique (réponse 182) : $2x^2$ pour $x = 8$ : c’est $2 \times 8^2$, pas $2 \times 8$.

**Corrigé**

> $(x + 6)(2x + 5) = x \times 2x + x \times 5 + 6 \times 2x + 6 \times 5$  
> $= 2x^2 + 5x + 12x + 30$  
> $= 2x^{2} + 17x + 30$  
> b) Pour $x = 8$ : côtés $14$ et $21$, aire $14 \times 21 = 294$ cm².  

Réponse : $\mathcal{A} = 2x^{2} + 17x + 30$ ; $294$ cm²

## 12. Factoriser : facteur commun — ★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=factoriser&niv=1&g=qxj9l6` · cours : § 6 · Factoriser

**Factorise.**

$$A = 8x - 6$$

1. (réponse) → attendu : $A =$ $2(4x - 3)$
   - Indice : Écris chaque terme comme un produit qui fait apparaître le **plus grand** facteur commun (nombre et/ou x), puis mets-le en tête.
   - Erreur typique (réponse $8x - 12$) : Factoriser « à moitié » : $2(4x - 6)$ redonne $8x - 12$. Il faut aussi diviser $-6$ par $2$.
   - Erreur typique (réponse $8x - 3$) : Le facteur $2$ doit être sorti de **chaque** terme : $-6 = 2 \times (-3)$, donc dans la parenthèse il reste $-3$.

**Corrigé**

> $8x - 6 = 2 \times 4x - 2 \times 3 = 2(4x - 3)$  
> Contrôle : on redéveloppe, $2(4x - 3) = 8x - 6$ ✓.  

Réponse : $A = 2(4x - 3)$

## 13. Factoriser : facteur commun — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=factoriser&niv=2&g=rqen7o` · cours : § 6 · Factoriser

**Factorise.**

$$A = 12x^{3} - 18x^{2}$$

1. (réponse) → attendu : $A =$ $6x^2(2x - 3)$
   - Indice : Écris chaque terme comme un produit qui fait apparaître le **plus grand** facteur commun (nombre et/ou x), puis mets-le en tête.
   - Erreur typique (réponse $12x^{3} - 108x^{2}$) : Factoriser « à moitié » : redéveloppe ta réponse, tu ne retrouves pas $12x^{3} - 18x^{2}$.

**Corrigé**

> Le facteur commun est $6x^2$ : $12x^3 = 6x^2 \times 2x$ et $18x^2 = 6x^2 \times 3$.  
> $12x^{3} - 18x^{2} = 6x^2 \times 2x - 6x^2 \times 3 = 6x^2(2x - 3)$  
> Contrôle : on redéveloppe, $6x^2(2x - 3) = 12x^{3} - 18x^{2}$ ✓.  

Réponse : $A = 6x^2(2x - 3)$

## 14. Factoriser : facteur commun — ★★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=factoriser&niv=3&g=pxoixa` · cours : § 6 · Factoriser

**Factorise (facteur commun entre parenthèses).**

$$A = (x + 4)(4x - 9) - (x + 4)(x - 5)$$

1. (réponse) → attendu : $A =$ $(x + 4)(3x - 4)$
   - Indice : Le facteur commun est la parenthèse $(x + 4)$ : mets-la en tête, puis écris entre crochets ce qui reste de chaque terme.
   - Erreur typique (réponse $3x^{2} - 2x - 56$) : Le signe $-$ devant la seconde parenthèse change **tous** ses signes : $-(x - 5) = -x + 5$.
   - Erreur typique (réponse $5x^{2} + 6x - 56$) : Garde le signe entre les deux produits.

**Corrigé**

> Le facteur commun est $(x + 4)$.  
> $A = (x + 4)\big[(4x - 9) - (x - 5)\big]$  
> $A = (x + 4)(4x - 9 - x + 5)$  
> $A = (x + 4)(3x - 4)$  
> Contrôle : on redéveloppe $(x + 4)(3x - 4)$ et on retrouve $3x^{2} + 8x - 16$, comme en développant $A$.  

Réponse : $A = (x + 4)(3x - 4)$

## 15. Identités remarquables : développer — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=identites&niv=2&g=8hpqhb` · cours : § 7 · Identités remarquables

**Développe avec une identité remarquable.**

$$A = (x + 5)^2 \qquad B = (x - 2)^2$$

1. (réponse) → attendu : $A =$ $x^{2} + 10x + 25$
   - Indice : Reconnais $(a + b)^2$, $(a - b)^2$ ou $(a + b)(a - b)$, et repère $a$ et $b$.
   - Erreur typique (réponse $x^{2} + 25$) : $(a + b)^2 \neq a^2 + b^2$ : il manque le double produit $2 \times x \times 5 = 10x$.
   - Erreur typique (réponse $x^{2} + 5x + 25$) : Le terme du milieu est le **double** produit : $2 \times x \times 5 = 10x$.
   - Erreur typique (réponse $x^{2} - 10x + 25$) : Signe du double produit : $(a + b)^2 = a^2 + 2ab + b^2$.
2. (réponse) → attendu : $B =$ $x^{2} - 4x + 4$
   - Indice : Reconnais $(a + b)^2$, $(a - b)^2$ ou $(a + b)(a - b)$, et repère $a$ et $b$.
   - Erreur typique (réponse $x^{2} + 4$) : $(a - b)^2 \neq a^2 - b^2$ : il manque le double produit $2 \times x \times 2 = 4x$.
   - Erreur typique (réponse $x^{2} - 4$) : $(a - b)^2 \neq a^2 - b^2$ : $(a - b)^2 = a^2 - 2ab + b^2$.
   - Erreur typique (réponse $x^{2} - 2x + 4$) : Le terme du milieu est le **double** produit : $2 \times x \times 2 = 4x$.
   - Erreur typique (réponse $x^{2} + 4x + 4$) : Signe du double produit : $(a - b)^2 = a^2 - 2ab + b^2$.

**Corrigé**

> $A$ : c’est $(a + b)^2 = a^2 + 2ab + b^2$ avec $a = x$ et $b = 5$.  
> $A = (x + 5)^2 = x^2 + 2 \times x \times 5 + 5^2 = x^{2} + 10x + 25$  
> $B$ : c’est $(a - b)^2 = a^2 - 2ab + b^2$ avec $a = x$ et $b = 2$.  
> $B = (x - 2)^2 = x^2 - 2 \times x \times 2 + 2^2 = x^{2} - 4x + 4$  

Réponse : $A = x^{2} + 10x + 25$ ; $B = x^{2} - 4x + 4$

## 16. Identités remarquables : développer — ★★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=identites&niv=3&g=n8fhoa` · cours : § 7 · Identités remarquables

**Développe avec une identité remarquable.**

$$A = (3x + 8)(3x - 8) \qquad B = (2x - 1)^2$$

1. (réponse) → attendu : $A =$ $9x^{2} - 64$
   - Indice : Reconnais $(a + b)^2$, $(a - b)^2$ ou $(a + b)(a - b)$, et repère $a$ et $b$.
   - Erreur typique (réponse $9x^{2} + 64$) : $(a + b)(a - b) = a^2 - b^2$ : c’est une **différence** de carrés.
   - Erreur typique (réponse $3x^{2} - 64$) : $(3x)^2 = 9x^2$ : le coefficient aussi est élevé au carré.
   - Erreur typique (réponse $9x^{2} - 8$) : $8^2 = 64$ : n’oublie pas d’élever $8$ au carré.
2. (réponse) → attendu : $B =$ $4x^{2} - 4x + 1$
   - Indice : Reconnais $(a + b)^2$, $(a - b)^2$ ou $(a + b)(a - b)$, et repère $a$ et $b$.
   - Erreur typique (réponse $4x^{2} + 1$) : $(a - b)^2 \neq a^2 - b^2$ : il manque le double produit $2 \times 2x \times 1 = 4x$.
   - Erreur typique (réponse $4x^{2} - 1$) : $(a - b)^2 \neq a^2 - b^2$ : $(a - b)^2 = a^2 - 2ab + b^2$.
   - Erreur typique (réponse $4x^{2} - 2x + 1$) : Le terme du milieu est le **double** produit : $2 \times 2x \times 1 = 4x$.
   - Erreur typique (réponse $2x^{2} - 4x + 1$) : $(2x)^2 = 4x^2$ : le coefficient aussi est élevé au carré.
   - Erreur typique (réponse $4x^{2} + 4x + 1$) : Signe du double produit : $(a - b)^2 = a^2 - 2ab + b^2$.

**Corrigé**

> $A$ : c’est $(a + b)(a - b) = a^2 - b^2$ avec $a = 3x$ et $b = 8$.  
> $A = (3x + 8)(3x - 8) = (3x)^2 - 8^2 = 9x^{2} - 64$  
> $B$ : c’est $(a - b)^2 = a^2 - 2ab + b^2$ avec $a = 2x$ et $b = 1$.  
> $B = (2x - 1)^2 = (2x)^2 - 2 \times 2x \times 1 + 1^2 = 4x^{2} - 4x + 1$  

Réponse : $A = 9x^{2} - 64$ ; $B = 4x^{2} - 4x + 1$

## 17. Identités remarquables : factoriser — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=factoriser-id&niv=2&g=1virj85` · cours : § 7 · Identités remarquables

**Factorise avec une identité remarquable.**

$$A = x^{2} - 1 \qquad B = x^{2} - 12x + 36$$

1. (réponse) → attendu : $A =$ $(x - 1)(x + 1)$
   - Indice : Cherche des carrés : $x^2 = x^2$ et $1 = 1^2$. Y a-t-il un terme en $x$ (double produit) ?
   - Erreur typique (réponse $x^{2} - 2x + 1$) : $(x - 1)^2$ redonne $x^{2} - 2x + 1$, pas $x^{2} - 1$. Une différence de carrés se factorise en $(a - b)(a + b)$.
   - Erreur typique (réponse $x^{2} + 2x + 1$) : Redéveloppe : $(x + 1)^2$ donne un double produit. Une différence de carrés se factorise en $(a - b)(a + b)$.
2. (réponse) → attendu : $B =$ $(x - 6)^2$
   - Indice : Cherche des carrés : $x^2 = x^2$ et $36 = 6^2$. Y a-t-il un terme en $x$ (double produit) ?
   - Erreur typique (réponse $x^{2} - 36$) : $(x + 6)(x - 6)$ redonne $x^{2} - 36$ : il n’y a pas de terme en $x$. Ici, le terme du milieu montre que c’est un carré.
   - Erreur typique (réponse $x^{2} + 12x + 36$) : Le signe du double produit indique $(a - b)^2$.

**Corrigé**

> $A$ : $x^{2} - 1 = x^2 - 1^2$, une différence de deux carrés : $a^2 - b^2 = (a - b)(a + b)$.  
> $A = (x - 1)(x + 1)$  
> $B$ : $x^{2} - 12x + 36 = x^2 - 2 \times x \times 6 + 6^2$, c’est $a^2 - 2ab + b^2 = (a - b)^2$ avec $a = x$ et $b = 6$.  
> $B = (x - 6)^2$  
> Contrôle : on redéveloppe chaque produit et on retrouve l’expression de départ.  

Réponse : $A = (x - 1)(x + 1)$ ; $B = (x - 6)^2$

## 18. Identités remarquables : factoriser — ★★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=factoriser-id&niv=3&g=1brj41n` · cours : § 7 · Identités remarquables

**Factorise avec une identité remarquable.**

$$A = 4x^{2} - 9 \qquad B = 25x^{2} + 70x + 49$$

1. (réponse) → attendu : $A =$ $(2x - 3)(2x + 3)$
   - Indice : Cherche des carrés : $4x^2 = (2x)^2$ et $9 = 3^2$. Y a-t-il un terme en $x$ (double produit) ?
   - Erreur typique (réponse $4x^{2} - 12x + 9$) : $(2x - 3)^2$ redonne $4x^{2} - 12x + 9$, pas $4x^{2} - 9$. Une différence de carrés se factorise en $(a - b)(a + b)$.
   - Erreur typique (réponse $4x^{2} + 12x + 9$) : Redéveloppe : $(2x + 3)^2$ donne un double produit. Une différence de carrés se factorise en $(a - b)(a + b)$.
2. (réponse) → attendu : $B =$ $(5x + 7)^2$
   - Indice : Cherche des carrés : $25x^2 = (5x)^2$ et $49 = 7^2$. Y a-t-il un terme en $x$ (double produit) ?
   - Erreur typique (réponse $25x^{2} - 49$) : $(5x + 7)(5x - 7)$ redonne $25x^{2} - 49$ : il n’y a pas de terme en $x$. Ici, le terme du milieu montre que c’est un carré.
   - Erreur typique (réponse $25x^{2} - 70x + 49$) : Le signe du double produit indique $(a + b)^2$.

**Corrigé**

> $A$ : $4x^{2} - 9 = (2x)^2 - 3^2$, une différence de deux carrés : $a^2 - b^2 = (a - b)(a + b)$.  
> $A = (2x - 3)(2x + 3)$  
> $B$ : $25x^{2} + 70x + 49 = (5x)^2 + 2 \times 5x \times 7 + 7^2$, c’est $a^2 + 2ab + b^2 = (a + b)^2$ avec $a = 5x$ et $b = 7$.  
> $B = (5x + 7)^2$  
> Contrôle : on redéveloppe chaque produit et on retrouve l’expression de départ.  

Réponse : $A = (2x - 3)(2x + 3)$ ; $B = (5x + 7)^2$

## 19. Programme de calcul — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=programme&niv=2&g=1ty3pcf` · cours : § 8.1 · Programmes de calcul

**Programme : choisir un nombre ; multiplier par $2$ ; ajouter $9$ ; multiplier le résultat par $2$ ; soustraire $18$.**

1. a) Quel résultat obtient-on en choisissant $-2$ ? → attendu : Résultat : $-8$
   - Indice : Applique les étapes dans l’ordre, une par une. Mets le nombre entre parenthèses s’il est négatif.
   - Erreur typique (réponse 8) : Attention au signe du nombre de départ.
2. b) On choisit un nombre $x$. Écris le résultat en fonction de $x$, sous forme développée et réduite. → attendu : Résultat : $4x$
   - Indice : Écris chaque étape avec $x$ (en gardant les parenthèses), puis développe et réduis.
3. c) Quel nombre faut-il choisir pour obtenir $-12$ ? → attendu : $x =$ $-3$
   - Indice : Résous l’équation $4x = -12$.
   - Erreur typique (réponse -12) : Ça, c’est le résultat voulu. On cherche le nombre de départ.

**Corrigé**

> a) Avec $-2$ : $(-2) \times 2 = -4$ ; $-4 + 9 = 5$ ; $5 \times 2 = 10$ ; $10 - 18 = -8$.  
> b) Avec $x$, le résultat est $2(2x + 9) - 18 = 4x + 18 - 18 = 4x$.  
> c) $4x = -12$ donne $x = -3$. Contrôle : le programme appliqué à $-3$ donne bien $-12$.  

Réponse : a) $-8$ ; b) $4x$ ; c) $-3$

## 20. Vrai pour tout x ? Contre-exemple — ★★

Adresse : `#/entrainement/06-calcul-litteral/exo?t=vrai-faux&niv=2&g=1ami7ba` · cours : § 8.2 · Contre-exemple

**Ces égalités sont-elles vraies pour toutes les valeurs de $x$ ?**

1. a) $2x + 8 = 2(x + 8)$ → attendu : Fausse (options : Vraie pour tout $x$ / Fausse)
   - Indice : Teste avec une valeur simple (x = 1, x = 2) : un seul cas où les deux membres diffèrent suffit pour dire « fausse ». Pour « vraie », il faut une règle du cours.
   - Si « Vraie pour tout $x$ » : Contre-exemple : pour $x = 1$, $2x + 8$ vaut $10$ mais $2(x + 8)$ vaut $18$. (factorisation « à moitié » : $2(x + 8) = 2x + 16$.)
2. b) $(x - 6)^2 = x^2 - 36$ → attendu : Fausse (options : Vraie pour tout $x$ / Fausse)
   - Indice : Teste avec une valeur simple (x = 1, x = 2) : un seul cas où les deux membres diffèrent suffit pour dire « fausse ». Pour « vraie », il faut une règle du cours.
   - Si « Vraie pour tout $x$ » : Contre-exemple : pour $x = 1$, $(x - 6)^2$ vaut $25$ mais $x^2 - 36$ vaut $-35$. ($(a - b)^2 = a^2 - 2ab + b^2$.)
3. c) $(x + 3)^2 = x^2 + 6x + 9$ → attendu : Vraie pour tout $x$ (options : Vraie pour tout $x$ / Fausse)
   - Indice : Teste avec une valeur simple (x = 1, x = 2) : un seul cas où les deux membres diffèrent suffit pour dire « fausse ». Pour « vraie », il faut une règle du cours.
   - Si « Fausse » : Elle est vraie pour tout $x$ : identité $(a + b)^2 = a^2 + 2ab + b^2$.

**Corrigé**

> a) Fausse : pour $x = 1$, $2x + 8 = 10$ mais $2(x + 8) = 18$ (factorisation « à moitié » : $2(x + 8) = 2x + 16$).  
> b) Fausse : pour $x = 1$, $(x - 6)^2 = 25$ mais $x^2 - 36 = -35$ ($(a - b)^2 = a^2 - 2ab + b^2$).  
> c) Vraie pour tout $x$ : identité $(a + b)^2 = a^2 + 2ab + b^2$.  
> Un seul contre-exemple suffit à prouver qu’une égalité n’est pas une identité ; des exemples ne suffisent pas à prouver qu’elle l’est.  

Réponse : a) fausse ; b) fausse ; c) vraie
