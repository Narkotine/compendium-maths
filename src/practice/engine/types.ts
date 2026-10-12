/**
 * Contrat des générateurs d'exercices (« S'entraîner »).
 *
 * Un générateur = UN type d'exercice, écrit à la main : il fixe d'abord la solution, puis construit
 * l'énoncé (construction à rebours), avec ses propres plages de valeurs et contraintes.
 * Il ne renvoie que des données : le moteur se charge de l'affichage, de la saisie, de la correction.
 */
import type { Q } from './q';
import type { Rel } from './expr';
import type { Rng } from './rng';

export type Level = 1 | 2 | 3;
/** Texte enrichi : formules entre $…$ (TeX, rendu par KaTeX), **gras**, sauts de ligne \n. */
export type Rich = string;

/** Valeur attendue : exacte (rationnel) ou ± racine carrée (x² = 7 → √7 et −√7). */
export type Val = { q: Q } | { sqrt: Q; s: 1 | -1 };

export interface NumField {
  /** Étiquette avant la case (« $x =$ », « Bob : »). */
  label: Rich;
  /** Unité après la case (« cm », « € », « ans »). */
  unit?: string;
  /** Valeur exacte attendue. */
  expect: Q;
  /**
   * any : toute écriture égale (2,5 ; 5/2 ; 10/4) ; irreducible : fraction irréductible ou entier
   * (ou décimal exact si `decimalOk`) ; decimal : écriture décimale (ou entière) exigée, pas de fraction.
   */
  form?: 'any' | 'irreducible' | 'decimal';
  /** Avec form = irreducible : accepter aussi l'écriture décimale exacte (2,5 pour 5/2). */
  decimalOk?: boolean;
  /** Écriture affichée de la réponse attendue (TeX), si elle doit rester une fraction (chapitre 1). */
  shown?: string;
  /** Réponse arrondie : valeur exacte réelle, tolérance et nombre de décimales demandé. */
  approx?: { value: number; tol: number; dp: number };
}

export type Answer =
  | { kind: 'num'; fields: NumField[] }
  | {
      kind: 'set';
      /** Ensemble attendu (vide : aucune solution). */
      expect: Val[];
      /** Valeurs arrondies acceptées (x² = 7 arrondi au centième) : tolérance absolue. */
      approx?: { tol: number; dp: number };
      /** Le clavier propose √. */
      sqrt?: boolean;
    }
  | { kind: 'choice'; options: Rich[]; correct: number; /** 1 essai pour oui/non, 2 sinon */ attempts?: 1 | 2; explain?: (Rich | null)[] }
  | { kind: 'ineq'; v: string; rel: Rel; bound: Q }
  | { kind: 'ray'; bound: Q; rel: Rel }
  | ExprAnswer
  | OrderAnswer;
/**
 * Rangement de cartes (glisser-déposer, boutons ↑↓, clavier). Les cartes sont montrées dans l'ordre
 * des items (déjà mélangé par le générateur, jamais rangé ni rangé à l'envers).
 */
export type OrderAnswer = {
  kind: 'order';
  /** TeX de chaque carte (sans $). */
  items: string[];
  /** Valeur exacte de chaque carte. */
  values: Q[];
  dir: 'asc' | 'desc';
  /** Explication ciblée pour une paire mal rangée (clé « i-j », indices d'items, i < j). Sans donner la réponse. */
  why?: Record<string, Rich>;
};
/** Expression algébrique (calcul littéral) : comparée exactement (polynômes), forme vérifiée. */
export type ExprAnswer = {
  kind: 'expr';
  /** Lettre utilisée. */
  v: string;
  /** Polynôme attendu (coefficients du degré 0 au degré n). */
  expect: Q[];
  /** dev : développée et réduite ; fact : factorisée complètement ; any : toute écriture égale. */
  form: 'dev' | 'fact' | 'any';
  /** fact : degrés des facteurs non constants attendus (2x(x + 3) → [1, 1]). */
  degs?: number[];
  /** Réponse attendue, en TeX (corrigé, « la bonne réponse »). */
  tex: string;
  /** Étiquette devant la case ($A =$). */
  label?: Rich;
};

/** Erreur typique reconnue de façon fiable : la réponse donnée est exactement celle produite par l'erreur. */
export type Mistake =
  | { on: 'num'; field?: number; value: Q; msg: Rich }
  | { on: 'set'; value: Q[]; msg: Rich }
  | { on: 'ineq'; rel?: Rel; bound?: Q; msg: Rich }
  | { on: 'expr'; value: Q[]; msg: Rich }
  /** Rangement : suite de valeurs obtenue par l'erreur (décroissant au lieu de croissant…). */
  | { on: 'order'; values: Q[]; msg: Rich }
  /** Toutes les cases remplies avec ces valeurs (rangement dans le mauvais ordre…). */
  | { on: 'numAll'; values: Q[]; msg: Rich };

export interface Step {
  /** Question de l'étape (« Quelle équation traduit l'énoncé ? »). Vide pour une étape unique évidente. */
  prompt: Rich;
  answer: Answer;
  /** Indice ciblé, montré après une première réponse fausse. */
  hint: Rich;
  mistakes?: Mistake[];
  /** Message si la valeur tapée est l'opposée de la bonne (par défaut : message des équations). */
  signHint?: Rich;
}

export interface CourseLink {
  /** Adresse interne (#/ch/…/s2-3). */
  href: string;
  label: string;
}

export interface ExerciseBody {
  /** Consigne courte (« Résoudre l'équation. »). */
  title: Rich;
  /** Énoncé (paragraphes séparés par \n). Peut être vide si `display` suffit. */
  statement?: Rich;
  /** Formule centrée (TeX sans $). */
  display?: string;
  /** Figure (SVG dessiné à l'échelle, avec role="img" et aria-label). */
  figure?: string;
  /** Précision sur la forme de la réponse (« Solution entière. »). */
  form?: Rich;
  steps: Step[];
  /** Corrigé rédigé, une ligne par entrée. */
  solution: Rich[];
  /** Réponse en une ligne (bilan, échantillon). */
  answer: Rich;
  /** Signature de l'énoncé (détection des doublons). */
  key: string;
  /** Données vérifiables par les tests (équation, solutions…). */
  data: CheckData;
}

/** Ce que les tests revérifient indépendamment du générateur. */
export type CheckData =
  | { kind: 'equation'; eq: import('./expr').Equation; solutions: Q[] | 'none' }
  | { kind: 'inequation'; eq: import('./expr').Equation; rel: Rel; bound: Q }
  | { kind: 'system'; eqs: import('./expr').Equation[]; x: Q; y: Q }
  | { kind: 'test'; eq: import('./expr').Equation; value: Q; isSolution: boolean }
  | { kind: 'square'; eq: import('./expr').Equation; a: Q }
  | { kind: 'problem'; eq: import('./expr').Equation; x: Q; facts: [string, number][] }
  /** Valeurs recalculées par les tests avec une écriture JavaScript indépendante (Math.sqrt, ** …). */
  | { kind: 'js'; items: { what: string; js: string; expect: number; tol?: number }[] }
  /** Expression de x écrite en JavaScript, qui doit être égale au polynôme attendu pour tout x. */
  | { kind: 'poly'; js: string; expect: Q[]; also?: { what: string; js: string; expect: number; tol?: number }[] }
  /** Plusieurs expressions (une par étape « expression », dans l'ordre). */
  | { kind: 'polys'; list: { js: string; expect: Q[] }[] }
  /** Triangle rectangle (a, b côtés de l'angle droit, c hypoténuse), valeur demandée et arrondi. */
  | { kind: 'pyth'; a: number; b: number; c: number; items: { what: string; js: string; expect: number; tol?: number }[] };

export interface Exercise extends ExerciseBody {
  chapter: string;
  type: string;
  level: Level;
  seed: number;
}

export interface Generator {
  /** Identifiant stable (adresse, statistiques). */
  id: string;
  /** Titre dans la liste (« ax + b = c »). */
  title: string;
  /** Description courte. */
  desc: string;
  /** Étoiles du cours pour ce type. */
  stars: Level;
  /** Niveaux proposés (★ entrée, ★★ standard, ★★★ approfondissement). */
  levels: Level[];
  /** Exemple (TeX) affiché dans la liste. */
  example: string;
  /** Section du cours (lien interne). */
  course: CourseLink;
  /** Autres renvois (chapitre 4 pour x² = a…). */
  links?: CourseLink[];
  generate(rng: Rng, level: Level): ExerciseBody;
}

export interface ChapterPractice {
  slug: string;
  title: string;
  generators: Generator[];
}
