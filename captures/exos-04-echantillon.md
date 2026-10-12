# Échantillon d’exercices générés — chapitre 04 (Puissances, notation scientifique et racine carrée, v0.5)

20 exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « echantillon-v0.4 » ; chaque exercice se rejoue à l’adresse indiquée.
Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.

## 1. Calculer une puissance — ★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=calcul&niv=1&g=1bf9gz` · cours : § 1.1 · Définition

**Puissances.**

1. a) Écris sous forme d’une puissance : $9 \times 9 \times 9 \times 9$. → attendu : Base : $9$ ; Exposant : $4$
   - Indice : Compte les facteurs égaux : leur nombre est l’exposant.
   - Erreur typique (réponses 4 ; 9) : Tu as inversé : la base est le nombre répété, l’exposant le nombre de facteurs.
2. b) Calcule $12^{2}$. → attendu : $12^{2} =$ $144$
   - Indice : $12^{2}$, c’est $2$ facteurs égaux à $12$ : $12 \times 12$.
   - Erreur typique (réponse 24) : $12^{2}$ n’est pas $12 \times 2$ : c’est un produit de $2$ facteurs égaux à $12$.
   - Erreur typique (réponse 12) : Il y a $2$ facteurs, pas $1$.
   - Erreur typique (réponse 1728) : Il y a $2$ facteurs, pas $3$.
3. c) Calcule $6^{2}$. → attendu : $6^{2} =$ $36$
   - Indice : $6^{2}$, c’est $2$ facteurs égaux à $6$ : $6 \times 6$.
   - Erreur typique (réponse 12) : $6^{2}$ n’est pas $6 \times 2$ : c’est un produit de $2$ facteurs égaux à $6$.
   - Erreur typique (réponse 6) : Il y a $2$ facteurs, pas $1$.
   - Erreur typique (réponse 216) : Il y a $2$ facteurs, pas $3$.

**Corrigé**

> a) $9 \times 9 \times 9 \times 9 = 9^{4}$ ($4$ facteurs égaux à $9$).  
> b) $12^{2} = 12 \times 12 = 144$.  
> c) $6^{2} = 6 \times 6 = 36$.  

Réponse : $9^{4}$ ; $144$ ; $36$

## 2. Calculer une puissance — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=calcul&niv=2&g=anj461` · cours : § 1.1 · Définition

**Puissances : signe et priorités.**

1. a) Calcule $-5^{4}$. → attendu : $-5^{4} =$ $-625$
   - Indice : Sans parenthèses, l’exposant ne porte que sur $5$ : $-5^{4} = -(5^{4})$.
   - Erreur typique (réponse 625) : L’exposant ne porte que sur $5$ (juste avant lui) : $-5^{4} = -(5^{4})$. Sans parenthèses, le « − » reste devant.
   - Erreur typique (réponse -20) : Ce n’est pas une multiplication par l’exposant.
2. b) Calcule $(4 \times 3)^{2}$. → attendu : $(4 \times 3)^{2} =$ $144$
   - Indice : Calcule d’abord la parenthèse $4 \times 3$, puis élève au carré.
   - Erreur typique (réponse 36) : Les parenthèses : c’est $12$ qui est au carré, pas seulement $3$.
   - Erreur typique (réponse 24) : Au carré : on multiplie le nombre par lui-même, pas par 2.
3. c) Calcule $3^{4} + 3^{5}$. → attendu : $3^{4} + 3^{5} =$ $324$
   - Indice : Calcule chaque puissance séparément, puis additionne.
   - Erreur typique (réponse 19683) : Les règles de calcul ne valent pas pour une **somme** : $3^{4} + 3^{5} \neq 3^{9}$. Calcule chaque puissance.
   - Erreur typique (réponse 27) : Une puissance n’est pas une multiplication par l’exposant.

**Corrigé**

> a) $-5^{4} = -(5 \times 5 \times 5 \times 5) = -625$ (l’exposant ne porte que sur $5$).  
> b) $(4 \times 3)^{2} = 12^2 = 144$ (alors que $4 \times 3^2 = 36$).  
> c) $3^{4} + 3^{5} = 81 + 243 = 324$ (et non $3^{9} = 19\,683$).  

Réponse : $-625$ ; $144$ ; $324$

## 3. Puissances de 10 — ★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=dix&niv=1&g=14jucot` · cours : § 2.1 · Exposant positif, exposant négatif

**Puissances de 10.**

1. a) Donne l’écriture décimale de $10^{7}$. → attendu : $10^{7} =$ $10\,000\,000$
   - Indice : $10^{7}$ s’écrit avec un 1 suivi de $7$ zéros.
   - Erreur typique (réponse 70) : $10^{7}$ n’est pas $10 \times 7$.
2. b) Écris $0{,}1$ sous la forme $10^n$. → attendu : $n =$ $-1$
   - Indice : Compte le rang du 1 après la virgule ; l’exposant est négatif (nombre plus petit que 1).
   - Erreur typique (réponse 1) : Le nombre est plus petit que 1 : l’exposant est **négatif**.
   - Erreur typique (réponse 0) : Compte le rang du 1 : $0{,}1 = 10^{-1}$, $0{,}01 = 10^{-2}$…
3. c) Calcule $52 \times 10^{2}$. → attendu : $52 \times 10^{2} =$ $5\,200$
   - Indice : Les chiffres se décalent de $2$ rangs vers la gauche.
   - Erreur typique (réponse 13/25) : Le résultat doit être plus **grand** que $52$.
   - Erreur typique (réponse 52000) : Décalage d’un rang de trop : $2$ rangs seulement.
   - Erreur typique (réponse 520) : Il faut décaler de $2$ rangs.

**Corrigé**

> a) $10^{7} = 10\,000\,000$ (1 suivi de 7 zéros).  
> b) $0{,}1 = 10^{-1}$ (le 1 est au rang 1 après la virgule).  
> c) $52 \times 10^{2} = 5\,200$ (décalage de 2 rangs vers la gauche).  

Réponse : $10\,000\,000$ ; $10^{-1}$ ; $5\,200$

## 4. Puissances de 10 — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=dix&niv=2&g=xfmfi0` · cours : § 2.1 · Exposant positif, exposant négatif

**Puissances de 10.**

1. a) Donne l’écriture décimale de $10^{12}$. → attendu : $10^{12} =$ $1\,000\,000\,000\,000$
   - Indice : $10^{12}$ s’écrit avec un 1 suivi de $12$ zéros.
   - Erreur typique (réponse 120) : $10^{12}$ n’est pas $10 \times 12$.
2. b) Écris $0{,}00001$ sous la forme $10^n$. → attendu : $n =$ $-5$
   - Indice : Compte le rang du 1 après la virgule ; l’exposant est négatif (nombre plus petit que 1).
   - Erreur typique (réponse 5) : Le nombre est plus petit que 1 : l’exposant est **négatif**.
   - Erreur typique (réponse -4) : Compte le rang du 1 : $0{,}1 = 10^{-1}$, $0{,}01 = 10^{-2}$…
   - Erreur typique (réponse 4) : Exposant négatif, et c’est le rang du 1 qui compte ($0{,}01 = 10^{-2}$).
3. c) Calcule $4508 \times 10^{-1}$. → attendu : $4508 \times 10^{-1} =$ $450{,}8$
   - Indice : Multiplier par $10^{-1}$, c’est diviser par $10^{1}$.
   - Erreur typique (réponse 45080) : Le résultat doit être plus **petit** que $4508$.
   - Erreur typique (réponse 1127/25) : Décalage d’un rang de trop : $1$ rang seulement.
   - Erreur typique (réponse 4508) : Il faut décaler de $1$ rang.

**Corrigé**

> a) $10^{12} = 1\,000\,000\,000\,000$ (1 suivi de 12 zéros).  
> b) $0{,}00001 = 10^{-5}$ (le 1 est au rang 5 après la virgule).  
> c) $4508 \times 10^{-1} = 4508 \div 10^{1} = 450{,}8$.  

Réponse : $1\,000\,000\,000\,000$ ; $10^{-5}$ ; $450{,}8$

## 5. Règles de calcul — ★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=regles&niv=1&g=14ncq66` · cours : § 4 · Règles de calcul

**Écris sous la forme $10^n$.**

1. a) $\left(10^{5}\right)^{2}$ → attendu : $= 10^n, \; n =$ $10$
   - Indice : Compte les facteurs 10 : produit → on additionne, quotient → on soustrait, puissance de puissance → on multiplie.
   - Erreur typique (réponse 7) : Puissance d’une puissance : on **multiplie** les exposants ($5 \times 2$).
   - Erreur typique (réponse 25) : On multiplie les exposants ; on ne calcule pas une puissance de l’exposant.
2. b) $\dfrac{10^{2}}{10^{5}}$ → attendu : $= 10^n, \; n =$ $-3$
   - Indice : Compte les facteurs 10 : produit → on additionne, quotient → on soustrait, puissance de puissance → on multiplie.
   - Erreur typique (réponse 7) : Quotient : on **soustrait** l’exposant du dénominateur : $2 - 5$.
   - Erreur typique (réponse 3) : C’est l’exposant du haut moins celui du bas.
3. c) $\left(10^{3}\right)^{2}$ → attendu : $= 10^n, \; n =$ $6$
   - Indice : Compte les facteurs 10 : produit → on additionne, quotient → on soustrait, puissance de puissance → on multiplie.
   - Erreur typique (réponse 5) : Puissance d’une puissance : on **multiplie** les exposants ($3 \times 2$).
   - Erreur typique (réponse 9) : On multiplie les exposants ; on ne calcule pas une puissance de l’exposant.

**Corrigé**

> a) $\left(10^{5}\right)^{2} = 10^{5 \times 2} = 10^{10}$.  
> b) $\dfrac{10^{2}}{10^{5}} = 10^{2 - 5} = 10^{-3}$.  
> c) $\left(10^{3}\right)^{2} = 10^{3 \times 2} = 10^{6}$.  

Réponse : $10^{10}$ ; $10^{-3}$ ; $10^{6}$

## 6. Règles de calcul — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=regles&niv=2&g=hksc3q` · cours : § 4 · Règles de calcul

**Écris sous la forme d’une seule puissance.**

1. a) $\dfrac{10^{8} \times 10^{5}}{10^{-4}}$ → attendu : $= 10^n, \; n =$ $17$
   - Indice : Commence par le numérateur (ou la parenthèse), puis applique la règle suivante.
   - Erreur typique (réponse 9) : Le dénominateur : on **soustrait** son exposant.
   - Erreur typique (réponse 44) : Produit du numérateur : on additionne les exposants.
2. b) $\dfrac{7^{-6}}{7^{-1}}$ → attendu : $= 7^n, \; n =$ $-5$
   - Indice : Même base $7$ : compte les facteurs $7$, comme pour 10.
   - Erreur typique (réponse -7) : Quotient : on **soustrait** l’exposant du dénominateur : $-6 - (-1)$.
   - Erreur typique (réponse 5) : C’est l’exposant du haut moins celui du bas.
   - Erreur typique (réponse 6) : On ne divise pas les exposants : on les soustrait.

**Corrigé**

> a) Numérateur : $10^{8 + 5} = 10^{13}$ ; puis $\dfrac{10^{13}}{10^{-4}} = 10^{13 - (-4)} = 10^{17}$.  
> b) $\dfrac{7^{-6}}{7^{-1}} = 7^{-6 - (-1)} = 7^{-5}$.  
> Contrôle (b) : les règles sont les mêmes pour toute base non nulle — on compte les facteurs.  

Réponse : $10^{17}$ ; $7^{-5}$

## 7. Règles de calcul — ★★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=regles&niv=3&g=vr571c` · cours : § 4 · Règles de calcul

**Écris sous la forme d’une puissance de $2$.**

1. a) Écris $8$ et $16$ comme des puissances de $2$. → attendu : $8 = 2^n, \; n =$ $3$ ; $16 = 2^n, \; n =$ $4$
   - Indice : Combien de facteurs $2$ faut-il multiplier pour obtenir $8$ ? et $16$ ?
   - Erreur typique (réponses 4 ; 8) : On cherche un **exposant** : combien de facteurs $2$ ? (et non $8 \div 2$)
2. b) $8^{2} \times 16^{4}$ → attendu : $= 2^n, \; n =$ $22$
   - Indice : $8^{2} = (2^{3})^{2}$ : puissance d’une puissance.
   - Erreur typique (réponse 13) : Puissance d’une puissance : on **multiplie** les exposants.
   - Erreur typique (réponse 6) : Les bases $8$ et $16$ sont différentes : écris-les d’abord avec la base $2$.

**Corrigé**

> $8 = 2^{3}$ et $16 = 2^{4}$.  
> $8^{2} \times 16^{4} = 2^{6} \times 2^{16} = 2^{6 + 16} = 2^{22}$.  

Réponse : $2^{22}$

## 8. Exposant nul ou négatif — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=negatifs&niv=2&g=1i9nks7` · cours : § 3 · Exposant nul et exposant négatif

**Exposant nul ou négatif.**

1. a) Écris $6^{-3}$ sous forme de fraction. → attendu : Fraction : $\dfrac{1}{216}$
   - Indice : $a^{-n} = \dfrac{1}{a^n}$ : $6^{-3} = \dfrac{1}{6^{3}}$.
   - Erreur typique (réponse -216) : Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, $\dfrac{1}{6^{3}}$.
   - Erreur typique (réponse -18) : Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, $\dfrac{1}{6^{3}}$.
   - Erreur typique (réponse 216) : $6^{-3}$ est l’**inverse** de $6^{3}$.
   - Erreur typique (réponse 1/18) : $6^{3}$ n’est pas $6 \times 3$.
2. b) Écris $20^{-1}$ sous forme de fraction, puis en écriture décimale. → attendu : Fraction : $\dfrac{1}{20}$ ; Écriture décimale : $0{,}05$
   - Indice : $a^{-n} = \dfrac{1}{a^n}$ : $20^{-1} = \dfrac{1}{20^{1}}$.
   - Erreur typique (réponse -20) : Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, $\dfrac{1}{20^{1}}$.
   - Erreur typique (réponse 20) : $20^{-1}$ est l’**inverse** de $20^{1}$.
3. c) Écris $2^{-4}$ sous forme de fraction, puis en écriture décimale. → attendu : Fraction : $\dfrac{1}{16}$ ; Écriture décimale : $0{,}0625$
   - Indice : $a^{-n} = \dfrac{1}{a^n}$ : $2^{-4} = \dfrac{1}{2^{4}}$.
   - Erreur typique (réponse -16) : Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, $\dfrac{1}{2^{4}}$.
   - Erreur typique (réponse -8) : Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, $\dfrac{1}{2^{4}}$.
   - Erreur typique (réponse 16) : $2^{-4}$ est l’**inverse** de $2^{4}$.
   - Erreur typique (réponse 1/8) : $2^{4}$ n’est pas $2 \times 4$.
4. d) Que vaut $(-4)^{0}$ ? → attendu : $(-4)^{0} =$ $1$
   - Indice : Prolonge la suite des puissances : chaque fois que l’exposant baisse de 1, on divise par la base.
   - Erreur typique (réponse 0) : $a^0 = 1$ pour tout $a$ non nul (et non $0$).
   - Erreur typique (réponse -4) : $(-4)^{0}$ : on a divisé $(-4)^1$ par la base, donc $1$.

**Corrigé**

> a) $6^{-3} = \dfrac{1}{6^{3}} = \dfrac{1}{216}$.  
> b) $20^{-1} = \dfrac{1}{20^{1}} = \dfrac{1}{20} = 0{,}05$.  
> c) $2^{-4} = \dfrac{1}{2^{4}} = \dfrac{1}{16} = 0{,}0625$.  
> d) $(-4)^{0} = 1$ (exposant nul, base non nulle).  
> Contrôle : $6^{-3} \times 6^{3} = 1$ ✓ (inverses).  

Réponse : $\dfrac{1}{216}$ ; $\dfrac{1}{20} = 0{,}05$ ; $\dfrac{1}{16} = 0{,}0625$ ; $1$

## 9. Préfixes et ordres de grandeur — ★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=prefixes&niv=1&g=na06rf` · cours : § 2.3 · Préfixes et ordres de grandeur

**Préfixes.**

1. a) Exprime $8\,\text{km}$ en mètres, en notation scientifique. → attendu : $a =$ $8$ ; $n =$ $3$
   - Indice : Kilo (k) vaut $10^{3}$. Puis écris le nombre devant avec un seul chiffre avant la virgule.
   - Erreur typique (réponses 8 ; -3) : Le signe de l’exposant : kilo vaut $10^{3}$.
2. b) Exprime $600\,\text{mm}$ en mètres, en notation scientifique. → attendu : $a =$ $6$ ; $n =$ $-1$
   - Indice : Milli (m) vaut $10^{-3}$. Puis écris le nombre devant avec un seul chiffre avant la virgule.
   - Erreur typique (réponses 6 ; 1) : Le signe de l’exposant : milli vaut $10^{-3}$.
   - Erreur typique (réponses 600 ; -3) : Égalité juste, mais ce n’est pas la notation scientifique : $600$ n’est pas entre 1 et 10.

**Corrigé**

> a) $8\,\text{km} = 8 \times 10^{3}\,\text{m}$.  
> b) $600\,\text{mm} = 600 \times 10^{-3}\,\text{m} = 6 \times 10^{-1}\,\text{m}$.  

Réponse : $8 \times 10^{3}\,\text{m}$ ; $6 \times 10^{-1}\,\text{m}$

## 10. Préfixes et ordres de grandeur — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=prefixes&niv=2&g=dineg2` · cours : § 2.3 · Préfixes et ordres de grandeur

**Ordres de grandeur.**

Un grain de sable fin mesure environ $200\,\mu\text{m}$.  

1. a) Combien de fois le millimètre est-il plus grand que le micromètre ? → attendu :  $1\,000$
   - Indice : $1\,\text{mm} = 10^{-3}\,\text{m}$ et $1\,\mu\text{m} = 10^{-6}\,\text{m}$ : fais le quotient.
   - Erreur typique (réponse 3) : C’est l’exposant de la réponse : $10^{3}$. Donne le nombre.
   - Erreur typique (réponse 1/1000000000) : Quotient : on **soustrait** les exposants, $-3 - (-6)$.
2. b) Combien faudrait-il en aligner pour couvrir $20\,\text{mm}$ ? → attendu :  $100$
   - Indice : Convertis $20\,\text{mm}$ en micromètres, puis divise par $200$.
   - Erreur typique (réponse 20000) : Il faut encore diviser par la taille d’un objet, $200\,\mu\text{m}$.
   - Erreur typique (réponse 100000) : Un facteur 1 000 de trop : revois la conversion.

**Corrigé**

> a) $\dfrac{10^{-3}}{10^{-6}} = 10^{-3 - (-6)} = 10^{3} = 1\,000$.  
> b) $20\,\text{mm} = 20\,000\,\mu\text{m}$ ; $20\,000 \div 200 = 100$.  
> Contrôle : $100 \times 200\,\mu\text{m} = 20\,000\,\mu\text{m}$ ✓.  

Réponse : $1\,000$ ; $100$

## 11. Notation scientifique — ★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=scientifique&niv=1&g=1alw9qk` · cours : § 5.1 · Notation scientifique : méthode

**Notation scientifique.**

1. a) Écris $30\,000\,000$ en notation scientifique. → attendu : $a =$ $3$ ; $n =$ $7$
   - Indice : Place la virgule après le premier chiffre, puis compte de combien de rangs elle a reculé.
   - Erreur typique (réponses 30 ; 6) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 3/10 ; 8) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 3 ; -7) : Grand nombre (plus grand que 10) : l’exposant est **positif**.
   - Erreur typique (réponses 3 ; 8) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
   - Erreur typique (réponses 3 ; 6) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
2. b) Écris $0{,}00031$ en notation scientifique. → attendu : $a =$ $3{,}1$ ; $n =$ $-4$
   - Indice : Place la virgule juste après le premier chiffre non nul, puis compte de combien de rangs elle a avancé.
   - Erreur typique (réponses 31 ; -5) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 31/100 ; -3) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 31/10 ; 4) : Petit nombre (plus petit que 1) : l’exposant est **négatif**.
   - Erreur typique (réponses 31/10 ; -3) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
   - Erreur typique (réponses 31/10 ; -5) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
3. c) Donne l’écriture décimale de $3{,}5 \times 10^{5}$. → attendu :  $350\,000$
   - Indice : Multiplier par $10^{5}$ : la virgule avance de 5 rangs vers la droite.
   - Erreur typique (réponse 7/200000) : Exposant positif : le nombre est **grand**.
   - Erreur typique (réponse 3500000) : Un rang de trop.
   - Erreur typique (réponse 35000) : Un rang de moins.

**Corrigé**

> a) $30\,000\,000 = 3 \times 10^{7}$ (virgule déplacée de 7 rangs, grand nombre : exposant positif).  
> b) $0{,}00031 = 3{,}1 \times 10^{-4}$ (virgule déplacée de 4 rangs, petit nombre : exposant négatif).  
> c) $3{,}5 \times 10^{5} = 350\,000$.  

Réponse : $3 \times 10^{7}$ ; $3{,}1 \times 10^{-4}$ ; $350\,000$

## 12. Notation scientifique — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=scientifique&niv=2&g=1gab6mf` · cours : § 5.1 · Notation scientifique : méthode

**Notation scientifique.**

1. a) Écris $13\,000$ en notation scientifique. → attendu : $a =$ $1{,}3$ ; $n =$ $4$
   - Indice : Place la virgule après le premier chiffre, puis compte de combien de rangs elle a reculé.
   - Erreur typique (réponses 13 ; 3) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 13/100 ; 5) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 13/10 ; -4) : Grand nombre (plus grand que 10) : l’exposant est **positif**.
   - Erreur typique (réponses 13/10 ; 5) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
   - Erreur typique (réponses 13/10 ; 3) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
2. b) Écris $0{,}00873$ en notation scientifique. → attendu : $a =$ $8{,}73$ ; $n =$ $-3$
   - Indice : Place la virgule juste après le premier chiffre non nul, puis compte de combien de rangs elle a avancé.
   - Erreur typique (réponses 873/10 ; -4) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 873/1000 ; -2) : Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \leqslant a < 10$), puis $\times 10^n$.
   - Erreur typique (réponses 873/100 ; 3) : Petit nombre (plus petit que 1) : l’exposant est **négatif**.
   - Erreur typique (réponses 873/100 ; -2) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
   - Erreur typique (réponses 873/100 ; -4) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
3. c) Donne l’écriture décimale de $6{,}2 \times 10^{4}$. → attendu :  $62\,000$
   - Indice : Multiplier par $10^{4}$ : la virgule avance de 4 rangs vers la droite.
   - Erreur typique (réponse 31/50000) : Exposant positif : le nombre est **grand**.
   - Erreur typique (réponse 620000) : Un rang de trop.
   - Erreur typique (réponse 6200) : Un rang de moins.
4. d) Écris $0{,}5 \times 10^{-4}$ en notation scientifique. → attendu : $a =$ $5$ ; $n =$ $-5$
   - Indice : Écris d’abord $0{,}5$ en notation scientifique, puis regroupe les puissances de 10.
   - Erreur typique (réponses 5 ; -4) : $0{,}5$ a changé : $0{,}5 = 5 \times 10^{-1}$, il faut en tenir compte dans l’exposant.
   - Erreur typique (réponses 5 ; -3) : $0{,}5 = 5 \times 10^{-1}$ : il faut **retirer** $1$ à l’exposant, pas l’inverse.
   - Erreur typique (réponses 5 ; 5) : Petit nombre (plus petit que 1) : l’exposant est **négatif**.
   - Erreur typique (réponses 5 ; -4) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.
   - Erreur typique (réponses 5 ; -6) : Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.

**Corrigé**

> a) $13\,000 = 1{,}3 \times 10^{4}$ (virgule déplacée de 4 rangs, grand nombre : exposant positif).  
> b) $0{,}00873 = 8{,}73 \times 10^{-3}$ (virgule déplacée de 3 rangs, petit nombre : exposant négatif).  
> c) $6{,}2 \times 10^{4} = 62\,000$.  
> d) $0{,}5 \times 10^{-4} = 5 \times 10^{-1} \times 10^{-4} = 5 \times 10^{-5}$.  

Réponse : $1{,}3 \times 10^{4}$ ; $8{,}73 \times 10^{-3}$ ; $62\,000$ ; $5 \times 10^{-5}$

## 13. Calculer et comparer — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=calculsci&niv=2&g=1yk7qu2` · cours : § 5.2 · Calculer et comparer

**Calcule en notation scientifique, puis compare.**

1. a) $(7 \times 10^{-8}) \times (9{,}3 \times 10^{-3})$ → attendu : $a =$ $6{,}51$ ; $n =$ $-10$
   - Indice : Regroupe les nombres d’un côté, les puissances de 10 de l’autre, puis réajuste si le nombre dépasse 10.
   - Erreur typique (réponses 651/100 ; 25) : Produit de puissances de 10 : on **additionne** les exposants.
   - Erreur typique (réponses 651/10 ; -11) : Égalité juste, mais $65{,}1$ n’est pas entre 1 et 10 : réajuste.
   - Erreur typique (réponses 651/100 ; -11) : En écrivant $65{,}1 = 6{,}51 \times 10^{1}$, il faut ajouter 1 à l’exposant.
2. b) $\dfrac{5 \times 10^{-6}}{2 \times 10^{8}}$ → attendu : $a =$ $2{,}5$ ; $n =$ $-14$
   - Indice : Divise $5$ par $2$, puis $10^{-6}$ par $10^{8}$.
   - Erreur typique (réponses 5/2 ; 2) : Quotient : on **soustrait** les exposants.
3. c) Lequel de ces nombres est le plus grand ? → attendu : $3{,}4 \times 10^{8}$ (options : $9{,}3 \times 10^{7}$ / $3{,}4 \times 10^{8}$ / $6 \times 10^{5}$ / $8{,}9 \times 10^{6}$)
   - Indice : On compare d’abord les exposants ; à exposant égal, les nombres placés devant.
   - Si « $9{,}3 \times 10^{7}$ » : $9{,}3$ est grand, mais on compare d’abord les **exposants** : $10^{7} < 10^{8}$.
   - Si « $6 \times 10^{5}$ » : On compare d’abord les exposants : $10^{5} < 10^{8}$.
   - Si « $8{,}9 \times 10^{6}$ » : On compare d’abord les exposants : $10^{6} < 10^{8}$.

**Corrigé**

> a) $(7 \times 10^{-8}) \times (9{,}3 \times 10^{-3}) = (7 \times 9{,}3) \times 10^{-8 + (-3)} = 65{,}1 \times 10^{-11} = 6{,}51 \times 10^{-10}$.  
> b) $\dfrac{5 \times 10^{-6}}{2 \times 10^{8}} = \dfrac{5}{2} \times 10^{-6 - 8} = 2{,}5 \times 10^{-14}$.  
> c) Le plus grand exposant est $8$ : le plus grand nombre est $3{,}4 \times 10^{8}$.  

Réponse : $6{,}51 \times 10^{-10}$ ; $2{,}5 \times 10^{-14}$ ; $3{,}4 \times 10^{8}$

## 14. Racine carrée — ★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=racine&niv=1&g=1pbzhys` · cours : § 6.2 · Racine carrée

**Racines carrées.**

1. a) Calcule $\sqrt{0{,}09}$ sans calculatrice. → attendu : $\sqrt{0{,}09} =$ $0{,}3$
   - Indice : Cherche le nombre positif dont le carré vaut $0{,}09$.
   - Erreur typique (réponse 9/200) : La racine carrée n’est pas la moitié : cherche le nombre qui, **multiplié par lui-même**, donne $0{,}09$.
   - Erreur typique (réponse -3/10) : Une racine carrée est toujours positive.
   - Erreur typique (réponse 3/100) : $0{,}03^2 = 0{,}0009$ : vérifie en élevant au carré.
2. b) Calcule $\sqrt{225}$ sans calculatrice. → attendu : $\sqrt{225} =$ $15$
   - Indice : Cherche le nombre positif dont le carré vaut $225$.
   - Erreur typique (réponse 225/2) : La racine carrée n’est pas la moitié : cherche le nombre qui, **multiplié par lui-même**, donne $225$.
   - Erreur typique (réponse -15) : Une racine carrée est toujours positive.
3. c) Un carré a une aire de $64\,\text{cm}^2$. Quelle est la longueur de son côté ? → attendu : Côté : $8$ cm
   - Indice : Le côté $c$ vérifie $c^2 = 64$.
   - Erreur typique (réponse 16) : L’aire n’est pas 4 fois le côté (c’est le périmètre) : aire = côté × côté.
   - Erreur typique (réponse 32) : Ce n’est pas la moitié : cherche le nombre qui, multiplié par lui-même, donne l’aire.

**Corrigé**

> a) $\sqrt{0{,}09} = 0{,}3$ car $0{,}3^2 = 0{,}09$ et $0{,}3 \geqslant 0$.  
> b) $\sqrt{225} = 15$ car $15^2 = 225$ et $15 \geqslant 0$.  
> c) $c = \sqrt{64} = 8$ cm. Contrôle : $8 \times 8 = 64$ ✓.  

Réponse : $0{,}3$ ; $15$ ; $8$ cm

## 15. Racine carrée — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=racine&niv=2&g=b02c2e` · cours : § 6.2 · Racine carrée

**Encadrer et arrondir une racine carrée.**

1. a) Encadre $\sqrt{222}$ entre deux entiers consécutifs. → attendu :  $14$ ; $< \sqrt{222} <$ $15$
   - Indice : Cherche les deux carrés parfaits qui encadrent $222$.
   - Erreur typique (réponses 196 ; 225) : Ce sont les carrés parfaits ; il faut leurs racines : $\sqrt{196} = 14$…
   - Erreur typique (réponses 111 ; 112) : La racine carrée n’est pas la moitié.
2. b) Donne l’arrondi au dixième de $\sqrt{222}$ (calculatrice). → attendu : $\sqrt{222} \approx$ $14{,}9$
   - Indice : Touche √ de la calculatrice, puis arrondis au dixième (regarde le chiffre des centièmes).
   - Erreur typique (réponse 74/5) : Le chiffre des centièmes est 9 : on arrondit **au-dessus**.
3. c) Un carré a une aire de $246\,\text{cm}^2$. Quelle est la longueur de son côté, arrondie au dixième ? → attendu : Côté : $15{,}7$ cm
   - Indice : Côté = $\sqrt{\text{aire}}$.
   - Erreur typique (réponse 123/2) : L’aire n’est pas 4 × côté : aire = côté × côté.

**Corrigé**

> a) $196 < 222 < 225$, c’est-à-dire $14^2 < 222 < 15^2$, donc $14 < \sqrt{222} < 15$.  
> b) $\sqrt{222} \approx 14{,}900\ldots$ ; au dixième : $\sqrt{222} \approx 14{,}9$. Contrôle : $14{,}9^2 = 222{,}01$, proche de $222$ ✓.  
> c) $c = \sqrt{246} \approx 15{,}684\ldots$, soit environ $15{,}7$ cm.  

Réponse : $14 < \sqrt{222} < 15$ ; $14{,}9$ ; $15{,}7$ cm

## 16. Racine carrée — ★★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=racine&niv=3&g=zjdwxz` · cours : § 6.2 · Racine carrée

**Simplifier des racines carrées.**

1. a) Écris $\sqrt{216}$ sous la forme $a\sqrt{b}$, avec $b$ entier le plus petit possible. → attendu : $a =$ $6$ ; $b =$ $6$
   - Indice : Cherche le plus grand carré parfait qui divise $216$.
   - Erreur typique (réponses 2 ; 54) : C’est juste, mais pas simplifié au maximum : $54$ contient encore un carré parfait.
   - Erreur typique (réponses 3 ; 24) : C’est juste, mais pas simplifié au maximum : $24$ contient encore un carré parfait.
   - Erreur typique (réponses 36 ; 6) : $\sqrt{36} = 6$ : on sort la **racine** du carré parfait.
2. b) Calcule $\sqrt{8} \times \sqrt{2}$. → attendu : $\sqrt{8} \times \sqrt{2} =$ $4$
   - Indice : $\sqrt{a} \times \sqrt{b} = \sqrt{a \times b}$.
   - Erreur typique (réponse 16) : Il reste à prendre la racine : $\sqrt{16}$.

**Corrigé**

> a) $\sqrt{216} = \sqrt{36 \times 6} = \sqrt{36} \times \sqrt{6} = 6\sqrt{6}$.  
> b) $\sqrt{8} \times \sqrt{2} = \sqrt{16} = 4$.  

Réponse : $6\sqrt{6}$ ; $4$

## 17. Problèmes — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=probleme&niv=2&g=1ufmped` · cours : Série J · Problèmes en plusieurs étapes

**Clôturer un terrain carré.**

Lina veut clôturer un terrain carré d’aire $900\,\text{m}^2$, avec un poteau tous les $3$ m (le premier poteau est aussi le dernier).  

1. a) Quelle est la longueur du côté ? → attendu : Côté : $30$ m
   - Indice : Côté = $\sqrt{900}$.
   - Erreur typique (réponse 225) : L’aire n’est pas 4 × côté : aire = côté × côté.
2. b) Quel est le périmètre ? → attendu : Périmètre : $120$ m
   - Indice : Le carré a quatre côtés égaux.
   - Erreur typique (réponse 900) : C’est l’aire : on veut le tour du terrain.
3. c) Combien faut-il de poteaux ? → attendu :  $40$
   - Indice : Divise le périmètre par $3$. Sur un tour fermé, il y a autant de poteaux que d’intervalles.
   - Erreur typique (réponse 41) : Sur un tour **fermé**, le premier poteau est aussi le dernier : pas de poteau en plus.
   - Erreur typique (réponse 44) : Les coins ne demandent pas de poteau en plus : sur un tour fermé, autant de poteaux que d’intervalles.

**Corrigé**

> a) $\sqrt{900} = 30$ m.  
> b) $4 \times 30 = 120$ m.  
> c) $120 \div 3 = 40$ intervalles, donc $40$ poteaux (tour fermé).  

Réponse : $30$ m ; $120$ m ; $40$ poteaux

## 18. Trouver l’erreur — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=erreur&niv=2&g=19uycy` · cours : Série H · Trouver l’erreur

**Trouve l’erreur.**

Paul écrit : « $\sqrt{144 + 81} = \sqrt{144} + \sqrt{81} = 21$ »  

1. Quelle est l’erreur ? → attendu : La racine d’une somme n’est pas la somme des racines. (options : La racine d’une somme n’est pas la somme des racines. / Une puissance n’est pas une multiplication par l’exposant. / Dans un produit de même base, on additionne les exposants (on ne les multiplie pas). / Ce n’est pas une notation scientifique : le nombre devant doit être entre 1 et 10.)
   - Indice : Reviens à la définition (facteurs, inverse, carré…).
   - Si « Une puissance n’est pas une multiplication par l’exposant. » : Non : ce n’est pas l’erreur commise ici. Relis l’égalité.
   - Si « Dans un produit de même base, on additionne les exposants (on ne les multiplie pas). » : Non : ce n’est pas l’erreur commise ici. Relis l’égalité.
   - Si « Ce n’est pas une notation scientifique : le nombre devant doit être entre 1 et 10. » : Non : ce n’est pas l’erreur commise ici. Relis l’égalité.
2. Que vaut vraiment $\sqrt{144 + 81}$ ? → attendu :  $15$
   - Indice : Calcule d’abord la somme sous la racine.
   - Erreur typique (réponse 21) : C’est l’erreur de Paul.

**Corrigé**

> La racine d’une somme n’est pas la somme des racines.  
> $\sqrt{144 + 81} = \sqrt{225} = 15$, alors que $\sqrt{144} + \sqrt{81} = 12 + 9 = 21$.  

Réponse : La racine d’une somme n’est pas la somme des racines. $15$

## 19. Calculer une puissance — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=calcul&niv=2&g=1wts2bd` · cours : § 1.1 · Définition

**Puissances : signe et priorités.**

1. a) Calcule $-2^{6}$. → attendu : $-2^{6} =$ $-64$
   - Indice : Sans parenthèses, l’exposant ne porte que sur $2$ : $-2^{6} = -(2^{6})$.
   - Erreur typique (réponse 64) : L’exposant ne porte que sur $2$ (juste avant lui) : $-2^{6} = -(2^{6})$. Sans parenthèses, le « − » reste devant.
   - Erreur typique (réponse -12) : Ce n’est pas une multiplication par l’exposant.
2. b) Calcule $(2 \times 5)^{2}$. → attendu : $(2 \times 5)^{2} =$ $100$
   - Indice : Calcule d’abord la parenthèse $2 \times 5$, puis élève au carré.
   - Erreur typique (réponse 50) : Les parenthèses : c’est $10$ qui est au carré, pas seulement $5$.
   - Erreur typique (réponse 20) : Au carré : on multiplie le nombre par lui-même, pas par 2.
3. c) Calcule $7 + 4 \times 2^{4}$. → attendu : $7 + 4 \times 2^{4} =$ $71$
   - Indice : Ordre : la puissance, puis la multiplication, puis l’addition.
   - Erreur typique (réponse 176) : La multiplication passe avant l’addition (et la puissance avant tout) : on ne commence pas par $7 + 4$.
   - Erreur typique (réponse 4103) : L’exposant ne porte que sur $2$, pas sur $4 \times 2$.
   - Erreur typique (réponse 39) : $2^{4}$ n’est pas $2 \times 4$.

**Corrigé**

> a) $-2^{6} = -(2 \times 2 \times 2 \times 2 \times 2 \times 2) = -64$ (l’exposant ne porte que sur $2$).  
> b) $(2 \times 5)^{2} = 10^2 = 100$ (alors que $2 \times 5^2 = 50$).  
> c) $7 + 4 \times 2^{4} = 7 + 4 \times 16 = 7 + 64 = 71$.  

Réponse : $-64$ ; $100$ ; $71$

## 20. Puissances de 10 — ★★

Adresse : `#/entrainement/04-puissances-notation-scientifique/exo?t=dix&niv=2&g=1l6mnd` · cours : § 2.1 · Exposant positif, exposant négatif

**Puissances de 10.**

1. a) Donne l’écriture décimale de $10^{0}$. → attendu : $10^{0} =$ $1$
   - Indice : Prolonge la suite 1 000 ; 100 ; 10 ; … en divisant par 10 à chaque pas.
   - Erreur typique (réponse 0) : $10^0 = 1$ (et non $0$) : $10^1 = 10$, puis on divise par 10.
   - Erreur typique (réponse 10) : $10^1 = 10$ ; $10^0$ vaut $10 \div 10 = 1$.
2. b) Écris un milliard sous la forme $10^n$. → attendu : $n =$ $9$
   - Indice : Compte les zéros après le 1.
   - Erreur typique (réponse -9) : Le nombre est plus grand que 1 : l’exposant est positif.
3. c) Calcule $52 \times 10^{-1}$. → attendu : $52 \times 10^{-1} =$ $5{,}2$
   - Indice : Multiplier par $10^{-1}$, c’est diviser par $10^{1}$.
   - Erreur typique (réponse 520) : Le résultat doit être plus **petit** que $52$.
   - Erreur typique (réponse 13/25) : Décalage d’un rang de trop : $1$ rang seulement.
   - Erreur typique (réponse 52) : Il faut décaler de $1$ rang.

**Corrigé**

> a) $10^{0} = 1$ (on divise $10^1 = 10$ par 10).  
> b) $1\,000\,000\,000 = 10^{9}$ (9 zéros).  
> c) $52 \times 10^{-1} = 52 \div 10^{1} = 5{,}2$.  

Réponse : $1$ ; $10^{9}$ ; $5{,}2$
