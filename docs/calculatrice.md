# Calculatrice-brouillon (v0.8)

## Conception

- **Discrète** : icône calculatrice dans la barre de l’exercice (exercice seul et série), panneau fermé par défaut. Panneau non modal : la page reste utilisable.
- **Téléphone** : panneau qui monte du bas, hauteur réglable (poignée à glisser, ou flèches ↑/↓ au clavier), mémorisée. À la première ouverture : la place de 2 ou 3 lignes au-dessus du pavé, au plus 62 % de l’écran. La page reçoit une marge en bas égale à la hauteur du panneau : on peut toujours faire défiler l’énoncé ou la case réponse au-dessus. Le bouton ⌄ masque le pavé (le panneau se réduit à l’historique et à la saisie, pour relire l’énoncé) ; toucher la saisie le rouvre. Les messages (toasts) passent en haut tant que le panneau est ouvert. Si l’élève touche une case réponse, le clavier de réponse passe devant et le panneau revient ensuite.
- **Grand écran (≥ 900 px)** : panneau latéral de 380 px à droite, la page se décale (rien n’est caché).
- **Historique = raisonnement** : saisie à gauche (écrite joliment : ², ³, √, ×, ÷, −, virgule), résultat à droite (≈ s’il est arrondi), croix pour supprimer. Toucher le **résultat** l’insère dans la saisie ; toucher la **saisie** la recopie pour la modifier. « Ans » = dernier résultat ; une saisie qui commence par × ÷ + ^ ² part de Ans.
- **Durée de vie** : propre à l’exercice (clé = adresse de l’exercice, ou série + rang + graine), gardé en sessionStorage : fermer/rouvrir, tourner l’écran, recharger ou revenir à l’exercice le retrouvent. Vidé à l’exercice suivant ; bouton « Effacer tout ».
- **Pavé** (6 colonnes, touches ≥ 44 px) : rangée sin/cos/tan et inverses (degrés), affichée par le bouton « sin cos » (d’office au chapitre 13, choix mémorisé) ; ( ) √ x² ⌫ ; chiffres, ÷ × − +, xⁿ, π, Ans, AC, virgule, « = » large. √ et x² sont mis en valeur. √ insère « √( » : les parenthèses restées ouvertes sont fermées à « = » (√ 1 0 8 = donne « √(108) »).
- **Clavier natif** : `inputmode="none"` sur écran tactile (le pavé suffit) ; sur ordinateur, le clavier physique marche (Entrée ou = calcule, Échap ferme). Sont acceptés : `sqrt(…)`, `racine(…)`, `^2`, `**`, `*`, `/`, `:`, `x` entre deux nombres, point ou virgule, `pi`, `asin`/`arcsin`/`sin^-1`…
- **Moteur maison (sans eval)** : `src/practice/calc/engine.ts`. Fractions exactes en BigInt tant que possible (0,1 + 0,2 = 0,3 ; 1/3 × 3 = 1 ; entiers exacts jusqu’à 21 chiffres), flottants pour π, racines non entières et trigonométrie, avec valeurs exactes aux angles remarquables (sin 30 = 0,5, tan 45 = 1, cos⁻¹ 0,5 = 60). Priorités : fonctions, √ et ² ; puis ^ (à droite) ; moins unaire ; × ÷ (et implicite : 2√3, 2(3+4), 2π) ; + −. −3² = −9, (−3)² = 9. Affichage : virgule, espaces fines, 10 chiffres significatifs, ≈ si arrondi, notation scientifique au-delà de 10¹⁵. Erreurs en français : « Racine d’un nombre négatif : impossible. », « Division par zéro. », « Parenthèse manquante : ferme la parenthèse. », « Parenthèse fermante en trop. », « tan(90°) n’existe pas. », « sin⁻¹ : le nombre doit être entre −1 et 1. », « Symbole inconnu »…
- **Insérer** : copie le dernier résultat dans la case réponse active (dernière touchée, sinon première vide), sans lui donner le focus (pas de clavier qui s’ouvre), en respectant ce qu’elle attend : arrondi au nombre de décimales demandé, fraction irréductible si la case l’exige (5/2 et non 2,5), fraction pour un quotient non décimal (1/3), avertissement si la valeur est approchée. Désactivé pour une case « expression » ou un QCM.
- **Retour Android** : ferme d’abord le panneau (entrée d’historique propre) ; « Un autre exercice » avec le panneau ouvert ne laisse pas l’ancien exercice dans l’historique.
- **Réglage** « Calculatrice dans les exercices » (Réglages › Entraînement), activé par défaut, effet immédiat.
- **Accessibilité** : panneau `role="dialog"` non modal étiqueté, `aria-expanded`/`aria-controls` sur le bouton, chaque touche et chaque ligne ont un libellé (« Utiliser le résultat environ 10,39… », « Supprimer la ligne … »), résultats annoncés (région live), poignée `role="slider"`. Thèmes clair et sombre.
- **Hors ligne** : dans le module « entraînement » déjà pré-caché par le service worker.

## Types sans calculatrice (42 sur 171)

Critère : l’exercice porte sur le calcul lui-même (calcul mental, opérations, priorités, signes, puissances, écritures, comparaisons, divisibilité, conversions) ; la calculatrice donnerait la réponse sans le raisonnement. Partout ailleurs (problèmes, proportionnalité, géométrie, Pythagore, Thalès, trigonométrie, grandeurs, statistiques, probabilités, équations, calcul littéral), elle est proposée : elle ne fait pas le travail demandé. La liste est dans `src/practice/calc/policy.ts` ; `tests/calc.test.ts` vérifie que chaque identifiant existe et que les 171 types sont couverts.

### 01-fractions-rationnels — 11 / 13 sans calculatrice

- `egales` Fractions égales
- `simplifier` Rendre une fraction irréductible
- `comparer` Comparer deux fractions
- `ranger` Ranger des fractions (cartes à glisser : on compare sans calculer de valeur approchée)
- `addition` Additionner, soustraire
- `produit` Multiplier des fractions
- `quantite` Fraction d’une quantité
- `division` Inverse et division
- `priorites` Calculs avec priorités
- `ecritures` Fraction, décimal, pourcentage
- `erreur` Trouver l’erreur
- (avec calculatrice : `lire`, `probleme`)

### 02-entiers-et-decimaux — 10 / 11 sans calculatrice

- `numeration` Numération
- `comparer` Comparer, encadrer, ranger
- `operations` Opérations sur les décimaux
- `calculs` Priorités et ordre de grandeur
- `arrondir` Arrondir, tronquer
- `euclide` Division euclidienne
- `divisibilite` Critères de divisibilité, diviseurs
- `premiers` Nombres premiers
- `decomposer` Décomposer en facteurs premiers
- `erreur` Trouver l’erreur
- (avec calculatrice : `partage`)

### 03-nombres-relatifs — 9 / 11 sans calculatrice

- `valeur-absolue` Valeur absolue
- `comparer` Comparer deux relatifs
- `ranger` Ranger dans l’ordre croissant
- `addition` Additionner des relatifs
- `soustraction` Soustraire des relatifs
- `distance` Distance entre deux points
- `produit` Multiplier et diviser
- `signe` Signe d’un produit
- `priorites` Priorités avec des relatifs
- (avec calculatrice : `abscisse`, `probleme`)

### 04-puissances-notation-scientifique — 9 / 10 sans calculatrice

- `calcul` Calculer une puissance
- `dix` Puissances de 10
- `regles` Règles de calcul
- `negatifs` Exposant nul ou négatif
- `prefixes` Préfixes et ordres de grandeur
- `scientifique` Notation scientifique
- `calculsci` Calculer et comparer
- `racine` Racine carrée
- `erreur` Trouver l’erreur
- (avec calculatrice : `probleme`)

### 06-calcul-litteral — 1 / 11 sans calculatrice

- `valeur` Calculer une expression
- (avec calculatrice : `traduire`, `nature`, `reduire`, `developper`, `double`, `factoriser`, `identites`, `factoriser-id`, `programme`, `vrai-faux`)

### 08-fonctions — 1 / 9 sans calculatrice

- `image` Calculer une image
- (avec calculatrice : `antecedent`, `vocabulaire`, `point`, `lecture`, `lineaire`, `affine`, `probleme`, `erreur`)

### 14-aires-volumes-grandeurs — 1 / 10 sans calculatrice

- `conversion` Conversions
- (avec calculatrice : `aires`, `disque`, `composee`, `volumes`, `laterale`, `reduction`, `durees`, `composees`, `erreur`)


Chapitres sans aucune exception (calculatrice partout) : 05, 07, 09, 10, 11, 12, 13, 15, 16, 17.
