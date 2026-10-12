/** Briques communes aux générateurs (chapitres 03 et suivants) : écriture des nombres, étapes types. */
import { type Q, q, eq, neg, toNum, abs as qabs, isInt } from './q';
import { texQ } from './expr';
import type { Mistake, NumField, Rich, Step } from './types';
import type { Rng } from './rng';

export const m = (s: string) => `$${s}$`;
/** Nombre en écriture décimale (−2,5 ; 12 ; −0,05). Les rationnels non décimaux restent en fraction. */
export const dn = (v: Q) => texQ(v, 'dec');
/** Entre parenthèses s'il est négatif : (−3). */
export const pn = (v: Q) => (v.n < 0 ? `(${dn(v)})` : dn(v));
/** Signe explicite entre parenthèses : (+5), (−7). */
export const sn = (v: Q) => (v.n < 0 ? `(${dn(v)})` : `(+${dn(v)})`);
/** Nombre pour une écriture JavaScript (tests). */
export const js = (v: Q | number) => `(${typeof v === 'number' ? v : toNum(v)})`;
/** Écriture d'un nombre dans le texte avec espaces des milliers : 10 244 ; 2 500. */
export function big(v: Q | number): string {
  const x = typeof v === 'number' ? q(v) : v;
  const t = dn(x);
  return t.replace(/^(-?)(\d+)/, (_, s: string, d: string) => s + d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'));
}
export const tenths = (n: number) => q(n, 10);
export const I = (n: number) => q(n);
export { q, eq, neg, toNum, qabs, isInt };

/** Erreurs typiques sans doublon, différentes de la bonne réponse (et des valeurs nulles). */
export function mist(expect: Q, list: [Q | null | undefined, Rich][], field?: number): Mistake[] {
  const out: Mistake[] = [];
  const seen: Q[] = [expect];
  for (const [v, msg] of list) {
    if (!v || seen.some((s) => eq(s, v))) continue;
    seen.push(v);
    out.push({ on: 'num', value: v, msg, ...(field !== undefined ? { field } : {}) });
  }
  return out;
}

/** Étape à une case numérique. */
export function numStep(prompt: Rich, label: Rich, expect: Q, hint: Rich, mistakes: [Q | null | undefined, Rich][] = [], o: Partial<NumField> & { signHint?: Rich } = {}): Step {
  const { signHint, ...f } = o;
  return {
    prompt,
    answer: { kind: 'num', fields: [{ label, expect, form: 'any', ...f }] },
    hint,
    mistakes: mist(expect, mistakes),
    ...(signHint ? { signHint } : {}),
  };
}

/** QCM à options FIXES (ordre naturel : $<$ / $>$, Oui / Non…), un essai. */
export function fixedChoice(options: Rich[], correct: number, explain: (Rich | null)[] = [], attempts: 1 | 2 = 1): Step['answer'] {
  return { kind: 'choice', options, correct, explain: options.map((_, i) => (i === correct ? null : explain[i] ?? null)), attempts };
}
/** QCM mélangé : bonne réponse + distracteurs expliqués. */
export function shuffledChoice(rng: Rng, good: Rich, bad: [Rich, Rich][]): Step['answer'] {
  const all: [Rich, Rich | null][] = [[good, null], ...bad];
  const order = rng.shuffle(all.map((_, i) => i));
  return {
    kind: 'choice',
    options: order.map((i) => all[i][0]),
    explain: order.map((i) => all[i][1]),
    correct: order.indexOf(0),
    attempts: all.length > 2 ? 2 : 1,
  };
}
/** Tirage sans remise de k éléments. */
export const sample = <T>(rng: Rng, xs: readonly T[], k: number) => rng.shuffle(xs).slice(0, k);
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T'];
export const NAMES = ['Ana', 'Bob', 'Léa', 'Hugo', 'Inès', 'Sami', 'Lina', 'Jade', 'Paul', 'Noah', 'Chloé', 'Yanis', 'Emma', 'Adam', 'Zoé', 'Malik', 'Nina', 'Tom', 'Sarah', 'Ilyes', 'Maëlle', 'Lucas', 'Amina', 'Théo'];
