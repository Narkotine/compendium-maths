# Échantillon d’exercices générés — chapitre 07 (v0.3)

20 exercices, un ou deux par type et par niveau, graines dérivées de « echantillon-v0.3 ». Chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes demandées (avec la réponse attendue et l’indice), corrigé rédigé tel qu’affiché.

**Relecture (9 oct. 2026).** Cet échantillon a été relu en entier, ainsi que 10 exercices de chacun de deux autres tirages (graines « revue2 », « revue3 »).
Corrigé à la relecture : distracteur « $x((x + 14)) = 60$ » (parenthèses doublées) et « $x3x$ » (produit sans ×) dans les
problèmes de rectangle ; « $3x + 0y$ » dans un distracteur de système ; « on soustrait $-3x$ » → « on ajoute $3x$ » ;
« on développe » remplacé par « on supprime les parenthèses » quand il n’y a rien à développer ; second membre nul
(« $0 \times 0$ ») exclu des équations à fractions ; ligne « membre à membre » ajoutée aux systèmes à coefficients égaux
ou opposés ; indice des systèmes (additionner ou soustraire) ; prix en euros affichés au centime ; liste de solutions
en fractions homogènes ($-\dfrac{8}{3}$ ; $\dfrac{3}{4}$ au lieu de $0{,}75$) ; espaces doublés dans un contrôle.
Les nouvelles écritures fautives sont désormais détectées par `tests/generators.test.ts`.

## 1. Tester si un nombre est solution — ★

Adresse : `#/entrainement/07-equations-inequations/exo?t=tester&niv=1&g=ujnnv3` · cours : § 1 · Équation, solution

**Tester si un nombre est solution.**

Le nombre $9$ est-il solution de l’équation ci-dessous ?  

$$-3x - 11 = -29$$

1. Calcule le membre de gauche pour $x = 9$. → attendu : $-3 \times 9 - 11 =$ $-38$
   - Indice : Remplace $x$ par $9$ dans le membre de gauche, puis calcule (priorités : le produit d’abord).
2. $9$ est-il solution de l’équation ? → attendu : Non (options : Oui / Non)

**Corrigé**

> Pour $x = 9$ :  
> membre de gauche : $-3 \times 9 - 11 = -38$ ;  
> membre de droite : $-29$.  
> $-38 \neq -29$ : les deux membres ne sont pas égaux. **$9$ n’est pas solution.**  

Réponse : $9$ n’est pas solution

## 2. Tester si un nombre est solution — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=tester&niv=2&g=16y1376` · cours : § 1 · Équation, solution

**Tester si un nombre est solution.**

Le nombre $-1$ est-il solution de l’équation ci-dessous ?  

$$x^{2} + 3x = -2$$

1. Calcule le membre de gauche pour $x = -1$. → attendu : $\left(-1\right)^{2} + 3 \times \left(-1\right) =$ $-2$
   - Indice : Remplace $x$ par $\left(-1\right)$ dans le membre de gauche, puis calcule (priorités : le carré, puis les produits).
   - Erreur typique (réponse -4) : Attention : $\left(-1\right)^2 = \left(-1\right) \times \left(-1\right) = 1$. Un carré n’est jamais négatif.
   - Erreur typique (réponse 4) : Attention au signe : on remplace $x$ par $\left(-1\right)$, avec ses parenthèses.
2. $-1$ est-il solution de l’équation ? → attendu : Oui (options : Oui / Non)

**Corrigé**

> Pour $x = -1$ :  
> membre de gauche : $\left(-1\right)^{2} + 3 \times \left(-1\right) = -2$ ;  
> membre de droite : $-2$.  
> $-2 = -2$ : l’égalité est vraie. **$-1$ est solution.**  

Réponse : $-1$ est solution

## 3. Équations x + a = b — ★

Adresse : `#/entrainement/07-equations-inequations/exo?t=x-plus-a&niv=1&g=j4chui` · cours : § 2.1 · Les deux règles (balance)

**Résoudre l’équation.**

$$20 + x = 12$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $-8$
   - Indice : Pour isoler $x$, on fait l’opération inverse : on **soustrait** $20$ aux deux membres.
   - Erreur typique (réponse 32) : Tu as ajouté $20$ au lieu de le soustraire : l’opération inverse de « $+\,20$ » est « $-\,20$ ».

**Corrigé**

> $20 + x = 12$  
> $20 + x - 20 = 12 - 20$ (on soustrait $20$ aux deux membres)  
> $x = -8$  
> La solution est $-8$.  
> Vérification : $20 + \left(-8\right) = 12$ ✓  

Réponse : $x = -8$

## 4. Équations ax = b — ★

Adresse : `#/entrainement/07-equations-inequations/exo?t=ax-egal-b&niv=1&g=1sw0567` · cours : § 2.1 · Les deux règles (balance)

**Résoudre l’équation.**

$$-2x = 14$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $-7$
   - Indice : Le nombre $-2$ **multiplie** $x$ : on divise les deux membres par $-2$.
   - Erreur typique (réponse 16) : Le $-2$ multiplie $x$ : on **divise** par $-2$, on ne le soustrait pas.
   - Erreur typique (réponse -28) : On divise par $-2$, on ne multiplie pas.
   - Erreur typique (réponse -1/7) : Attention au sens de la division : c’est $14$ qu’on divise par $-2$.

**Corrigé**

> $-2x = 14$  
> $x = \dfrac{14}{-2} = -7$ (on divise les deux membres par $-2$)  
> La solution est $-7$.  
> Vérification : $-2 \times \left(-7\right) = 14$ ✓  

Réponse : $x = -7$

## 5. Équations ax + b = c — ★

Adresse : `#/entrainement/07-equations-inequations/exo?t=ax-plus-b&niv=1&g=5ro5ra` · cours : § 2.1 · Les deux règles (balance)

**Résoudre l’équation.**

$$2x - 13 = 7$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $10$
   - Indice : Commence par isoler le terme en $x$ : on ajoute $13$ aux deux membres. Puis on divise par $2$.
   - Erreur typique (réponse -3) : Tu as soustrait $13$ au lieu de l’ajouter : pour enlever « $-\,13$ », on ajoute $13$ aux deux membres.
   - Erreur typique (réponse 20) : Tu as trouvé la valeur de $2x$, pas celle de $x$ : il reste à diviser par $2$.
   - Erreur typique (réponse 33/2) : Ordre des opérations : on enlève d’abord $13$, **puis** on divise par $2$ (on remonte le programme de calcul à l’envers).
   - Erreur typique (réponse 40) : $2$ multiplie $x$ : on **divise** par $2$, on ne multiplie pas.

**Corrigé**

> $2x - 13 = 7$  
> $2x - 13 + 13 = 7 + 13$ (on ajoute $13$ aux deux membres)  
> $2x = 20$  
> $x = \dfrac{20}{2} = 10$ (on divise les deux membres par $2$)  
> La solution est $10$.  
> Vérification : $2 \times 10 - 13 = 7$ ✓  

Réponse : $x = 10$

## 6. Inconnue des deux côtés — ★

Adresse : `#/entrainement/07-equations-inequations/exo?t=deux-membres&niv=1&g=2g76qx` · cours : § 2.3 · L’inconnue des deux côtés

**Résoudre l’équation.**

$$10x + 12 = 5x + 27$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $3$
   - Indice : Regroupe les $x$ dans le membre de gauche : soustrais $5x$ aux deux membres. Puis isole $x$ comme pour $ax + b = c$.
   - Erreur typique (réponse 1) : Pour enlever $5x$ du membre de droite, on **soustrait** $5x$ aux **deux** membres : à gauche il reste $5x$, pas $15x$.
   - Erreur typique (réponse 39/5) : Attention au $12$ : pour l’enlever, on le **soustrait** aux deux membres.
   - Erreur typique (réponse 15) : Il reste à diviser par le coefficient de $x$, $5$.
   - Erreur typique (réponse 3/2) : Les $x$ doivent tous être du même côté avant de diviser : n’oublie pas $5x$.

**Corrigé**

> $10x + 12 = 5x + 27$  
> $10x + 12 - 5x = 5x + 27 - 5x$ (on soustrait $5x$ aux deux membres)  
> $5x + 12 = 27$  
> $5x + 12 - 12 = 27 - 12$ (on soustrait $12$ aux deux membres)  
> $5x = 15$  
> $x = \dfrac{15}{5} = 3$ (on divise les deux membres par $5$)  
> La solution est $3$.  
> Vérification : $10 \times 3 + 12 = 42$ et $5 \times 3 + 27 = 42$ ✓  

Réponse : $x = 3$

## 7. Inconnue des deux côtés — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=deux-membres&niv=2&g=oecs4k` · cours : § 2.3 · L’inconnue des deux côtés

**Résoudre l’équation.**

$$-4x + 20 = 3x - 50$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $10$
   - Indice : Regroupe les $x$ dans le membre de gauche : soustrais $3x$ aux deux membres. Puis isole $x$ comme pour $ax + b = c$.
   - Erreur typique (réponse 70) : Pour enlever $3x$ du membre de droite, on **soustrait** $3x$ aux **deux** membres : à gauche il reste $-7x$, pas $-x$.
   - Erreur typique (réponse 30/7) : Attention au $20$ : pour l’enlever, on le **soustrait** aux deux membres.
   - Erreur typique (réponse -70) : Il reste à diviser par le coefficient de $x$, $-7$.
   - Erreur typique (réponse 35/2) : Les $x$ doivent tous être du même côté avant de diviser : n’oublie pas $3x$.

**Corrigé**

> $-4x + 20 = 3x - 50$  
> $-4x + 20 - 3x = 3x - 50 - 3x$ (on soustrait $3x$ aux deux membres)  
> $-7x + 20 = -50$  
> $-7x + 20 - 20 = -50 - 20$ (on soustrait $20$ aux deux membres)  
> $-7x = -70$  
> $x = \dfrac{-70}{-7} = 10$ (on divise les deux membres par $-7$)  
> La solution est $10$.  
> Vérification : $-4 \times 10 + 20 = -20$ et $3 \times 10 - 50 = -20$ ✓  

Réponse : $x = 10$

## 8. Avec des parenthèses — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=parentheses&niv=2&g=epmx9e` · cours : § 2.4 · Parenthèses et fractions

**Résoudre l’équation.**

$$6(x - 8) - 6 = -3x - 18$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $4$
   - Indice : Commence par développer : $6(x - 8) = 6x - 48$. Puis regroupe les $x$ d’un côté.
   - Erreur typique (réponse -4/9) : Attention à la distributivité : $6(x - 8) = 6x - 48$. On multiplie **chaque** terme de la parenthèse par $6$.
   - Erreur typique (réponse 12) : Après avoir développé, pour regrouper les $x$, on **ajoute** $3x$ aux deux membres.

**Corrigé**

> $6(x - 8) - 6 = -3x - 18$  
> $6x - 48 - 6 = -3x - 18$ (on développe)  
> $6x - 54 = -3x - 18$ (on réduit chaque membre)  
> $6x - 54 + 3x = -3x - 18 + 3x$ (on ajoute $3x$ aux deux membres)  
> $9x - 54 = -18$  
> $9x - 54 + 54 = -18 + 54$ (on ajoute $54$ aux deux membres)  
> $9x = 36$  
> $x = \dfrac{36}{9} = 4$ (on divise les deux membres par $9$)  
> La solution est $4$.  
> Vérification : $6(4 - 8) - 6 = -30$ et $-3 \times 4 - 18 = -30$ ✓  

Réponse : $x = 4$

## 9. Avec des parenthèses — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=parentheses&niv=3&g=tv7o2f` · cours : § 2.4 · Parenthèses et fractions

**Résoudre l’équation.**

$$-5(x + 3) - 10 = x - 55$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $5$
   - Indice : Commence par développer : $-5(x + 3) = -5x - 15$. Puis regroupe les $x$ d’un côté.
   - Erreur typique (réponse 8) : Attention à la distributivité : $-5(x + 3) = -5x - 15$. On multiplie **chaque** terme de la parenthèse par $-5$.
   - Erreur typique (réponse 10) : Attention aux signes en développant : $-5(x + 3) = -5x - 15$ (le signe $-$ devant change le signe de **chaque** terme).
   - Erreur typique (réponse 15/2) : Après avoir développé, pour regrouper les $x$, on **soustrait** $x$ aux deux membres.

**Corrigé**

> $-5(x + 3) - 10 = x - 55$  
> $-5x - 15 - 10 = x - 55$ (on développe)  
> $-5x - 25 = x - 55$ (on réduit chaque membre)  
> $-5x - 25 - x = x - 55 - x$ (on soustrait $x$ aux deux membres)  
> $-6x - 25 = -55$  
> $-6x - 25 + 25 = -55 + 25$ (on ajoute $25$ aux deux membres)  
> $-6x = -30$  
> $x = \dfrac{-30}{-6} = 5$ (on divise les deux membres par $-6$)  
> La solution est $5$.  
> Vérification : $-5(5 + 3) - 10 = -50$ et $5 - 55 = -50$ ✓  

Réponse : $x = 5$

## 10. Avec des fractions ou des décimaux — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=fractions&niv=2&g=1x9knun` · cours : § 2.4 · Parenthèses et fractions

**Résoudre l’équation.**

$$1{,}9x + 2{,}8 = 8{,}5$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $3$
   - Indice : Isole le terme en $x$, puis divise par $1{,}9$.
   - Erreur typique (réponse 113/19) : Attention au signe de $2{,}8$ quand on l’enlève du membre de gauche.

**Corrigé**

> $1{,}9x + 2{,}8 = 8{,}5$  
> $1{,}9x + 2{,}8 - 2{,}8 = 8{,}5 - 2{,}8$ (on soustrait $2{,}8$ aux deux membres)  
> $1{,}9x = 5{,}7$  
> $x = \dfrac{5{,}7}{1{,}9} = 3$ (on divise les deux membres par $1{,}9$)  
> La solution est $3$.  
> Vérification : $1{,}9 \times 3 + 2{,}8 = 8{,}5$ ✓  

Réponse : $x = 3$

## 11. Avec des fractions ou des décimaux — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=fractions&niv=3&g=amn4px` · cours : § 2.4 · Parenthèses et fractions

**Résoudre l’équation.**

$$\dfrac{x}{3} - \dfrac{x - 8}{2} = 5$$

*La solution est un nombre entier.*

1. (réponse) → attendu : $x =$ $-6$
   - Indice : Multiplie les deux membres par $6$, multiple commun des dénominateurs, pour faire disparaître les fractions (attention au signe « − » devant la fraction : il porte sur tout le numérateur).
   - Erreur typique (réponse -9/4) : Il faut multiplier **chaque terme des deux membres** par $6$, pas seulement certains.
   - Erreur typique (réponse 52/3) : Il faut multiplier **chaque terme des deux membres** par $6$, pas seulement certains.
   - Erreur typique (réponse 19) : Il faut multiplier **chaque terme des deux membres** par $6$, pas seulement certains.
   - Erreur typique (réponse -38) : Attention à la distributivité : $-3(x - 8) = -3x + 24$. On multiplie **chaque** terme de la parenthèse par $-3$.
   - Erreur typique (réponse -54) : Attention aux signes en développant : $-3(x - 8) = -3x + 24$ (le signe $-$ devant change le signe de **chaque** terme).

**Corrigé**

> $\dfrac{x}{3} - \dfrac{x - 8}{2} = 5$  
> $6 \times \dfrac{x}{3} - 6 \times \dfrac{x - 8}{2} = 6 \times 5$ (on multiplie **chaque terme** des deux membres par $6$)  
> $2x - 3(x - 8) = 30$  
> $2x - 3x + 24 = 30$ (on développe)  
> $-x + 24 = 30$ (on réduit chaque membre)  
> $-x + 24 - 24 = 30 - 24$ (on soustrait $24$ aux deux membres)  
> $-x = 6$  
> $x = -6$ (on multiplie les deux membres par $-1$)  
> La solution est $-6$.  
> Vérification : $\dfrac{-6}{3} - \dfrac{-6 - 8}{2} = 5$ ✓  

Réponse : $x = -6$

## 12. Mettre un problème en équation — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=probleme&niv=2&g=fy1esl` · cours : § 3 · Mettre un problème en équation

**Mettre en équation, puis résoudre.**

Nina achète $4$ cahiers et un livre. Le livre coûte $8$ € de plus qu’un cahier. Nina paie $18$ € en tout.  
Quel est le prix d’un cahier ? Celui du livre ?  
On note $x$ le prix d’un cahier, en euros.  

1. Quelle équation traduit l’énoncé ? → attendu : $4x + (x + 8) = 18$ (options : $5x + (x + 8) = 18$ / $4x + 8 = 18$ / $4x + (x - 8) = 18$ / $4x + (x + 8) = 18$)
   - Indice : Exprime le prix du livre en fonction de $x$, puis écris le prix total des $4$ cahiers et du livre.
2. Résous l’équation $4x + (x + 8) = 18$. → attendu : $x =$ $2$
   - Indice : Développe et réduis si besoin, regroupe les inconnues d’un côté, puis divise par le coefficient.
3. Réponds au problème. → attendu : Un cahier : $2$ € ; Le livre : $10$ €
   - Indice : Reviens à l’énoncé : que représente l’inconnue ? Calcule les autres valeurs à partir d’elle.

**Corrigé**

> On note $x$ le prix d’un cahier, en euros.  
> Le livre coûte $x + 8$.  
> Équation : $4x + (x + 8) = 18$  
> $5x + 8 = 18$ (on supprime les parenthèses et on réduit)  
> $5x + 8 - 8 = 18 - 8$ (on soustrait $8$ aux deux membres)  
> $5x = 10$  
> $x = \dfrac{10}{5} = 2$ (on divise les deux membres par $5$)  
> **Un cahier coûte $2$ € et le livre $10$ €.**  
> Vérification dans l’énoncé : $4 \times 2 + 10 = 18$ ✓  

Réponse : Un cahier coûte $2$ € et le livre $10$ €.

## 13. Mettre un problème en équation — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=probleme&niv=3&g=d05pas` · cours : § 3 · Mettre un problème en équation

**Mettre en équation, puis résoudre.**

Programme A : choisir un nombre, soustraire $3$, puis multiplier le résultat par $3$.  
Programme B : choisir un nombre, le multiplier par $6$, puis soustraire $27$.  
Quel nombre faut-il choisir au départ pour que les deux programmes donnent le même résultat ?  
On note $x$ le nombre choisi au départ.  

1. Quelle équation traduit l’énoncé ? → attendu : $3(x - 3) = 6x - 27$ (options : $3(x - 3) = 6x - 27$ / $3x - 3 = 6x - 27$ / $3(x - 3) = 6(x - 27)$ / $3(x - 3) = 0$)
   - Indice : Écris le résultat de chaque programme en fonction de $x$, puis écris qu’ils sont égaux.
2. Résous l’équation $3(x - 3) = 6x - 27$. → attendu : $x =$ $6$
   - Indice : Développe et réduis si besoin, regroupe les inconnues d’un côté, puis divise par le coefficient.
3. Donne le nombre de départ et le résultat obtenu. → attendu : Nombre choisi : $6$ ; Résultat commun : $9$
   - Indice : Reviens à l’énoncé : que représente l’inconnue ? Calcule les autres valeurs à partir d’elle.

**Corrigé**

> On note $x$ le nombre choisi au départ.  
> Programme A : $3(x - 3)$ ; programme B : $6x - 27$.  
> Équation : $3(x - 3) = 6x - 27$  
> $3x - 9 = 6x - 27$ (on développe et on réduit)  
> $3x - 9 - 6x = 6x - 27 - 6x$ (on soustrait $6x$ aux deux membres)  
> $-3x - 9 = -27$  
> $-3x - 9 + 9 = -27 + 9$ (on ajoute $9$ aux deux membres)  
> $-3x = -18$  
> $x = \dfrac{-18}{-3} = 6$ (on divise les deux membres par $-3$)  
> **Il faut choisir $6$ ; les deux programmes donnent alors $9$.**  
> Vérification dans l’énoncé : $3(6 - 3) = 9$ et $6 \times 6 - 27 = 9$ ✓  

Réponse : Il faut choisir $6$ ; les deux programmes donnent alors $9$.

## 14. Équations produit nul — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=produit-nul&niv=2&g=h6drkm` · cours : § 4.1 · Produit nul

**Résoudre l’équation.**

$$(3x + 8)(4x - 3) = 0$$

*Solutions exactes : entiers ou fractions.*

1. Donne **toutes** les solutions, séparées par « ; » (valeurs exactes). → attendu : $-\dfrac{8}{3}$ ; $\dfrac{3}{4}$
   - Indice : Un produit est nul si l’un de ses facteurs est nul : écris « premier facteur $= 0$ ou second facteur $= 0$ ».
   - Erreur typique (réponse {8/3 ; -3/4}) : Attention aux signes : $3x + 8 = 0$ donne $x = -\dfrac{8}{3}$.
   - Erreur typique (réponse {-8 ; 3/4}) : Pour $3x + 8 = 0$, on obtient $3x = -8$, puis on **divise** par $3$.
   - Erreur typique (réponse {-3/8 ; 3/4}) : Attention : $3x = -8$ donne $x = \dfrac{-8}{3} = -\dfrac{8}{3}$ (on divise par le coefficient de $x$, et pas l’inverse).
   - Erreur typique (réponse {8/3 ; 3/4}) : Attention au signe : $3x + 8 = 0$ donne $x = -\dfrac{8}{3}$.
   - Erreur typique (réponse {-8/3 ; -3/4}) : Attention au signe : $4x - 3 = 0$ donne $x = \dfrac{3}{4}$.

**Corrigé**

> $(3x + 8)(4x - 3) = 0$  
> Un produit est nul si l’un de ses facteurs est nul : $3x + 8 = 0$ ou $4x - 3 = 0$.  
> $3x + 8 = 0$ donne $3x = -8$, soit $x = -\dfrac{8}{3}$ ;  
> $4x - 3 = 0$ donne $4x = 3$, soit $x = \dfrac{3}{4}$.  
> L’équation a deux solutions : $-\dfrac{8}{3}$ et $\dfrac{3}{4}$.  
> Contrôle : pour $x = -\dfrac{8}{3}$, le premier facteur vaut $0$ ; pour $x = \dfrac{3}{4}$, le second vaut $0$ ✓  

Réponse : Solutions : $-\dfrac{8}{3}$ et $\dfrac{3}{4}$

## 15. Équations produit nul — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=produit-nul&niv=3&g=1smdm6j` · cours : § 4.1 · Produit nul

**Résoudre l’équation.**

$$x^{2} - 64 = 0$$

*Solutions exactes : entiers ou fractions.*

1. Donne **toutes** les solutions, séparées par « ; » (valeurs exactes). → attendu : $-8$ ; $8$
   - Indice : $64$ est le carré de $8$ : utilise $a^2 - b^2 = (a - b)(a + b)$.
   - Erreur typique (réponse {8}) : Il manque une solution : $(-8)^2 = 64$ aussi.
   - Erreur typique (réponse {-8}) : Attention au signe : $x - 8 = 0$ donne $x = 8$.

**Corrigé**

> $x^{2} - 64 = 0$  
> On reconnaît $a^2 - b^2 = (a - b)(a + b)$ : $x^2 - 64 = x^2 - 8^2 = (x - 8)(x + 8)$.  
> Un produit est nul si l’un de ses facteurs est nul : $x - 8 = 0$ ou $x + 8 = 0$.  
> $x - 8 = 0$ donne $x = 8$ ;  
> $x + 8 = 0$ donne $x = -8$.  
> L’équation a deux solutions : $-8$ et $8$.  
> Contrôle : pour $x = 8$, le premier facteur vaut $0$ ; pour $x = -8$, le second vaut $0$ ✓  

Réponse : Solutions : $-8$ et $8$

## 16. Équations x² = a — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=carre&niv=2&g=t2jmnj` · cours : § 4.2 · Équations x² = a

**Résoudre l’équation.**

$$x^{2} = 225$$

*S’il n’y a aucune solution, coche « Aucune solution ».*

1. Donne **toutes** les solutions, séparées par « ; » (valeurs exactes). → attendu : $-15$ ; $15$
   - Indice : Quels nombres ont pour carré $225$ ? (Il y en a deux.)
   - Erreur typique (réponse {15}) : Il manque une solution : $(-15)^2 = 225$ aussi.

**Corrigé**

> $x^{2} = 225$  
> $225$ est positif : deux solutions, $x = 15$ ou $x = -15$ (car $15^2 = 225$).  
> Les solutions sont $15$ et $-15$.  

Réponse : Solutions : $15$ et $-15$

## 17. Équations x² = a — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=carre&niv=3&g=753lt3` · cours : § 4.2 · Équations x² = a

**Résoudre l’équation.**

$$x^{2} + 2 = 146$$

*S’il n’y a aucune solution, coche « Aucune solution ».*

1. Donne **toutes** les solutions, séparées par « ; » (valeurs exactes). → attendu : $-12$ ; $12$
   - Indice : Quels nombres ont pour carré $144$ ? (Il y en a deux.)
   - Erreur typique (réponse {12}) : Il manque une solution : $(-12)^2 = 144$ aussi.
   - Erreur typique (réponse {72 ; -72}) : $x^2$ n’est pas $2x$ : on cherche les nombres dont le **carré** vaut $144$.

**Corrigé**

> $x^{2} + 2 = 146$  
> $x^2 = 146 - 2$ (on soustrait $2$ aux deux membres)  
> $x^2 = 144$  
> $144$ est positif : deux solutions, $x = 12$ ou $x = -12$ (car $12^2 = 144$).  
> Les solutions sont $12$ et $-12$.  
> Contrôle : $12^2 + 2 = 144 + 2 = 146$ ✓ (de même avec $-12$).  

Réponse : Solutions : $12$ et $-12$

## 18. Inéquations — ★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=inequation&niv=2&g=xti357` · cours : § 6.2 · Résoudre ax ⩾ b

**Résoudre l’inéquation, puis représenter ses solutions.**

$$-2x - 13 \leqslant -5$$

1. Résous l’inéquation : choisis le symbole, puis écris la borne. → attendu : $x \geqslant -4$
   - Indice : Isole $x$ comme dans une équation. Au moment de diviser par $-2$, demande-toi : ce nombre est-il positif ou négatif ?
   - Erreur typique (réponse <= -4) : On divise par $-2$, un nombre **négatif** : il faut **changer le sens** de l’inégalité.
   - Erreur typique (réponse  9) : Pour enlever $-13$ du membre de gauche, on **ajoute** $13$ aux deux membres.
   - Erreur typique (réponse  4) : Attention au signe de la borne.
2. Représente les solutions $x \geqslant -4$ sur la droite graduée. → attendu : *(droite graduée : x ≥ -4)*
   - Indice : Les solutions sont les nombres supérieurs ou égaux à $-4$ : ils sont à **droite** de $-4$. La borne est **incluse** : crochet tourné vers les solutions.

**Corrigé**

> $-2x - 13 \leqslant -5$  
> $-2x - 13 + 13 \leqslant -5 + 13$ (on ajoute $13$ aux deux membres)  
> $-2x \leqslant 8$  
> $x \geqslant \dfrac{8}{-2} = -4$ (on divise par $-2$, négatif : on change le sens)  
> Les solutions sont tous les nombres supérieurs ou égaux à $-4$ : $x \geqslant -4$.  
> *(droite graduée : x ≥ -4)*  
> Sur la droite graduée : demi-droite à droite de $-4$, borne incluse (crochet tourné vers les solutions).  
> Contrôle avec une valeur test : pour $x = -3$ (dans l’ensemble), $-2 \times \left(-3\right) - 13 = -7$, et $-7 \leqslant -5$ est vrai ✓ ; pour $x = -5$ (hors de l’ensemble), $-2 \times \left(-5\right) - 13 = -3$, et $-3 \leqslant -5$ est faux ✓.  

Réponse : $x \geqslant -4$

## 19. Inéquations — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=inequation&niv=3&g=go589c` · cours : § 6.2 · Résoudre ax ⩾ b

**Résoudre l’inéquation, puis représenter ses solutions.**

$$4x - 6 > x - 19$$

*Donne la borne exacte (fraction irréductible ou décimal).*

1. Résous l’inéquation : choisis le symbole, puis écris la borne. → attendu : $x > -\dfrac{13}{3}$
   - Indice : Regroupe les $x$ à gauche et les nombres à droite, puis divise par le coefficient de $x$ : s’il est **négatif**, le sens change.
   - Erreur typique (réponse < -13/3) : On divise par $3$, un nombre **positif** : le sens de l’inégalité **ne change pas**.
   - Erreur typique (réponse  -25/3) : Pour enlever $-6$ du membre de gauche, on **ajoute** $6$ aux deux membres.
   - Erreur typique (réponse  -13/5) : Pour regrouper les $x$, on **soustrait** $x$ aux deux membres.
   - Erreur typique (réponse  13/3) : Attention au signe de la borne.
2. Représente les solutions $x > -\dfrac{13}{3}$ sur la droite graduée. → attendu : *(droite graduée : x > -13/3)*
   - Indice : Les solutions sont les nombres strictement supérieurs à $-\dfrac{13}{3}$ : ils sont à **droite** de $-\dfrac{13}{3}$. La borne est **exclue** : crochet tourné vers l’extérieur.

**Corrigé**

> $4x - 6 > x - 19$  
> $4x - 6 - x > x - 19 - x$ (on soustrait $x$ aux deux membres)  
> $3x - 6 > -19$  
> $3x - 6 + 6 > -19 + 6$ (on ajoute $6$ aux deux membres)  
> $3x > -13$  
> $x > \dfrac{-13}{3} = -\dfrac{13}{3}$ (on divise par $3$, positif : même sens)  
> Les solutions sont tous les nombres strictement supérieurs à $-\dfrac{13}{3}$ : $x > -\dfrac{13}{3}$.  
> *(droite graduée : x > -13/3)*  
> Sur la droite graduée : demi-droite à droite de $-\dfrac{13}{3}$, borne exclue (crochet tourné vers l’extérieur).  
> Contrôle avec une valeur test : pour $x = -4$ (dans l’ensemble), $4 \times \left(-4\right) - 6 = -22$ et $-4 - 19 = -23$, et $-22 > -23$ est vrai ✓ ; pour $x = -5$ (hors de l’ensemble), $4 \times \left(-5\right) - 6 = -26$ et $-5 - 19 = -24$, et $-26 > -24$ est faux ✓.  

Réponse : $x > -\dfrac{13}{3}$

## 20. Systèmes de deux équations — ★★★

Adresse : `#/entrainement/07-equations-inequations/exo?t=systeme&niv=3&g=sndmfe` · cours : § 8 · Systèmes et inéquations générales

**Résoudre le système.**

$$\begin{cases} 3x - 4y = 8 \\ -4x - 5y = -21 \end{cases}$$

*Les solutions sont des nombres entiers.*

1. Donne le couple solution. → attendu : $x =$ $4$ ; $y =$ $1$
   - Indice : Combine les deux équations (en les multipliant si besoin) pour éliminer $y$ : coefficients opposés → on additionne ; coefficients égaux → on soustrait.
   - Erreur typique (réponse 1) : As-tu inversé $x$ et $y$ ? Le couple s’écrit $(x\,;y)$.

**Corrigé**

> $\begin{cases} 3x - 4y = 8 \\ -4x - 5y = -21 \end{cases}$  
> Pour éliminer $y$, on multiplie la première équation par $5$ et la seconde par $-4$ :  
> $\begin{cases} 15x - 20y = 40 \\ 16x + 20y = 84 \end{cases}$  
> puis on **additionne** membre à membre (les termes en $y$ s’éliminent) :  
> $31x = 124$  
> $x = \dfrac{124}{31} = 4$  
> On remplace $x$ par $4$ dans la première équation :  
> $3 \times 4 - 4y = 8$  
> $12 - 4y = 8$  
> $12 - 4y - 12 = 8 - 12$ (on soustrait $12$ aux deux membres)  
> $-4y = -4$  
> $y = \dfrac{-4}{-4} = 1$ (on divise les deux membres par $-4$)  
> La solution du système est le couple $(4\,;1)$.  
> Contrôle : $3 \times 4 - 4 \times 1 = 8$ ✓ et $-4 \times 4 - 5 \times 1 = -21$ ✓  

Réponse : $(x\,;y) = (4\,;1)$
