/** Outils communs aux générateurs du chapitre 2 (entiers, décimaux, arithmétique). */
import type { CourseLink, NumField, Rich } from '../engine/types';
import { type Q, q, toNum, isInt } from '../engine/q';
import { big } from '../engine/build';
import { svgWrap, line, text, dot } from '../engine/svg';

export const CH = '02-entiers-et-decimaux';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Chaque chiffre a une valeur selon sa place'),
  s12: sec('s1-2', '§ 1.2 · Multiplier ou diviser par 10, 100, 1 000'),
  s21: sec('s2-1', '§ 2.1 · Dixièmes, centièmes, millièmes'),
  s22: sec('s2-2', '§ 2.2 · Comparer, ranger, encadrer'),
  s31: sec('s3-1', '§ 3.1 · Addition et soustraction'),
  s32: sec('s3-2', '§ 3.2 · Multiplication'),
  s33: sec('s3-3', '§ 3.3 · Division'),
  s34: sec('s3-4', '§ 3.4 · Priorités et ordre de grandeur'),
  s4: sec('s4', '§ 4 · Arrondir, tronquer'),
  s51: sec('s5-1', '§ 5.1 · Division euclidienne'),
  s52: sec('s5-2', '§ 5.2 · Multiples et diviseurs'),
  s6: sec('s6', '§ 6 · Nombres premiers'),
  s7: sec('s7', '§ 7 · Décomposer en facteurs premiers'),
  serieH: sec('serie-H', 'Série H · Trouver l’erreur'),
  serieJ: sec('serie-J', 'Série J · Problèmes en plusieurs étapes'),
};
/** Décimal TeX avec espaces des milliers (3\,507{,}26). */
export const bg = (v: Q | number) => big(typeof v === 'number' ? (Number.isInteger(v) ? q(v) : q(Math.round(v * 1e6), 1e6)) : v);
/** Décimal avec un nombre imposé de décimales (2,50 ; 10,0). */
export const fx = (v: Q | number, dp: number) => {
  const x = typeof v === 'number' ? v : toNum(v);
  const [i, d] = x.toFixed(dp).split('.');
  return bg(Number(i)) + (dp ? `{,}${d}` : '');
};
export const F = (label: Rich, v: Q, unit?: string, more: Partial<NumField> = {}): NumField => ({ label, expect: v, form: 'any', ...(unit ? { unit } : {}), ...more });
/** Case décimale (écriture décimale exigée) affichée telle quelle. */
export const D = (label: Rich, v: Q, unit?: string): NumField => ({ label, expect: v, form: isInt(v) ? 'any' : 'decimal', shown: bg(v), ...(unit ? { unit } : {}) });
/** Décomposition en facteurs premiers. */
export function factors(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) while (m % p === 0) { out.push(p); m /= p; }
  if (m > 1) out.push(m);
  return out;
}
/** 2^3 × 3^2 × 5 */
export function factTex(n: number): string {
  const fs = factors(n);
  const c = new Map<number, number>();
  for (const p of fs) c.set(p, (c.get(p) ?? 0) + 1);
  return [...c].map(([p, k]) => (k > 1 ? `${p}^{${k}}` : String(p))).join(' \\times ');
}
export const isPrime = (n: number) => n >= 2 && factors(n).length === 1;
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const divisors = (n: number) => [...Array(n).keys()].map((i) => i + 1).filter((d) => n % d === 0);

/** Droite graduée de a à a + 10·pas, dix graduations, avec des points nommés (lecture). */
export function lineSvg(a: Q, step: Q, pts: [string, Q][], labelEvery = 5): string {
  const W = 340, H = 78, x0 = 22, x1 = W - 22, y = 40;
  const A = toNum(a), S = toNum(step);
  const X = (v: number) => x0 + ((v - A) / (10 * S)) * (x1 - x0);
  let b = line([x0 - 10, y], [x1 + 10, y], 'gf-axis');
  for (let i = 0; i <= 10; i++) {
    const v = A + i * S;
    b += line([X(v), y - (i % 5 === 0 ? 8 : 5)], [X(v), y + (i % 5 === 0 ? 8 : 5)], 'gf-axis');
    if (i % labelEvery === 0) b += text([X(v), y + 22], fmtNum(v, S), 'gf-ts');
  }
  for (const [nm, v] of pts) { b += dot([X(toNum(v)), y]); b += text([X(toNum(v)), y - 18], nm, 'gf-tq'); }
  return svgWrap(W, H, `Droite graduée de ${fmtNum(A, S)} à ${fmtNum(A + 10 * S, S)}, ${pts.length} point(s) ${pts.map((p) => p[0]).join(', ')}`, b);
}
function fmtNum(v: number, step: number) {
  const dp = Math.max(0, Math.round(-Math.log10(step)));
  const t = v.toFixed(dp);
  return (dp ? t.replace(/0+$/, '').replace(/\.$/, '') : t).replace('.', ',');
}
