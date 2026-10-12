/** Outils communs aux générateurs du chapitre 4 (puissances, notation scientifique, racine carrée). */
import type { CourseLink, NumField, Rich } from '../engine/types';
import { type Q, q, toNum } from '../engine/q';
import { dn, big } from '../engine/build';

export const CH = '04-puissances-notation-scientifique';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Définition'),
  s12: sec('s1-2', '§ 1.2 · Signe et priorités'),
  s21: sec('s2-1', '§ 2.1 · Exposant positif, exposant négatif'),
  s22: sec('s2-2', '§ 2.2 · Multiplier par une puissance de 10'),
  s23: sec('s2-3', '§ 2.3 · Préfixes et ordres de grandeur'),
  s3: sec('s3', '§ 3 · Exposant nul et exposant négatif'),
  s4: sec('s4', '§ 4 · Règles de calcul'),
  s51: sec('s5-1', '§ 5.1 · Notation scientifique : méthode'),
  s52: sec('s5-2', '§ 5.2 · Calculer et comparer'),
  s61: sec('s6-1', '§ 6.1 · Carrés à connaître'),
  s62: sec('s6-2', '§ 6.2 · Racine carrée'),
  s63: sec('s6-3', '§ 6.3 · Valeurs approchées'),
  serieH: sec('serie-H', 'Série H · Trouver l’erreur'),
  serieJ: sec('serie-J', 'Série J · Problèmes en plusieurs étapes'),
};

/** Écriture décimale TeX avec espaces des milliers (style du cours : 1\,000). */
export const bg = (v: Q | number) => big(typeof v === 'number' ? (Number.isInteger(v) ? q(v) : q(Math.round(v * 1e9), 1e9)) : v);
/** Base entre parenthèses si négative ou décimale (puissance). */
export const base = (a: Q) => (a.n < 0 || a.d !== 1 ? `(${dn(a)})` : dn(a));
export const pw = (a: Q | number, n: number) => `${base(typeof a === 'number' ? q(a) : a)}^{${n}}`;
/** 10^n exact (n de -12 à 15). */
export const P10 = (n: number): Q => (n >= 0 ? q(10 ** n) : q(1, 10 ** -n));
/** a × 10^n en TeX (a décimal). */
export const sci = (a: Q, n: number) => `${dn(a)} \\times 10^{${n}}`;
/** Décompose une valeur x > 0 (nombre JS sûr) en mantisse décimale (≤ 6 chiffres significatifs) et exposant. */
export function toSci(x: number): [Q, number] {
  let n = Math.floor(Math.log10(x));
  let a = Math.round((x / 10 ** n) * 1e6) / 1e6;
  if (a >= 10) { a /= 10; n += 1; }
  return [q(Math.round(a * 1e6), 1e6), n];
}
/** Case nombre (toute écriture égale). */
export const F = (label: Rich, v: Q, unit?: string, more: Partial<NumField> = {}): NumField => ({ label, expect: v, form: 'any', ...(unit ? { unit } : {}), ...more });
/** Case arrondie. */
export const roundQ = (v: number, dp: number): Q => q(Math.round(v * 10 ** dp + 1e-9), 10 ** dp);
export const approxF = (label: Rich, v: number, dp: number, unit?: string): NumField => ({ label, expect: roundQ(v, dp), form: 'any', ...(unit ? { unit } : {}), approx: { value: v, tol: 0.5 * 10 ** -dp, dp }, shown: toNum(roundQ(v, dp)).toFixed(dp).replace('.', '{,}') });
/** Cases « a » et « n » de la notation scientifique. */
export const sciFields = (a: Q, n: number): NumField[] => [F('$a =$', a, undefined, { form: 'decimal' }), F('$n =$', q(n))];
/** Items de contrôle indépendants pour une écriture a × 10^n d'une valeur donnée en JavaScript. */
export const sciJs = (xjs: string, a: Q, n: number, tag = '') => [
  { what: `n${tag}`, js: `Math.floor(Math.log10(${xjs})+1e-12)`, expect: n },
  { what: `a${tag}`, js: `Math.round(${xjs}/10**Math.floor(Math.log10(${xjs})+1e-12)*1e6)/1e6`, expect: toNum(a), tol: 1e-9 },
];
