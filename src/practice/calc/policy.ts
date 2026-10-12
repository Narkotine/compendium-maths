/**
 * Types d'exercices SANS calculatrice : ceux où le calcul est justement ce qu'on travaille
 * (calcul mental, opérations, priorités, puissances, écritures, signes, divisibilité…).
 * Partout ailleurs, la calculatrice est proposée (si le réglage global est activé).
 * Liste commentée : docs/calculatrice.md (vérifiée par tests/calc-policy.test.ts).
 */
export const NO_CALC: Record<string, string[]> = {
  '01-fractions-rationnels': ['egales', 'simplifier', 'comparer', 'ranger', 'addition', 'produit', 'quantite', 'division', 'priorites', 'ecritures', 'erreur'],
  '02-entiers-et-decimaux': ['numeration', 'comparer', 'operations', 'calculs', 'arrondir', 'euclide', 'divisibilite', 'premiers', 'decomposer', 'erreur'],
  '03-nombres-relatifs': ['comparer', 'ranger', 'addition', 'soustraction', 'distance', 'produit', 'signe', 'priorites'],
  '04-puissances-notation-scientifique': ['calcul', 'dix', 'regles', 'negatifs', 'prefixes', 'scientifique', 'calculsci', 'racine', 'erreur'],
  '06-calcul-litteral': ['valeur'],
  '08-fonctions': ['image'],
  '14-aires-volumes-grandeurs': ['conversion'],
};
export const calcAllowed = (slug: string, type: string) => !(NO_CALC[slug] ?? []).includes(type);
