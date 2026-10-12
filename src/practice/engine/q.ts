/**
 * Nombres rationnels exacts (numérateur / dénominateur entiers, dénominateur > 0, fraction réduite).
 * Les exercices du collège manipulent de petits nombres : les entiers JavaScript suffisent,
 * mais on vérifie qu'on reste dans les entiers « sûrs » (sinon erreur, détectée par les tests).
 */
export interface Q {
  readonly n: number;
  readonly d: number;
}

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
export { gcd };
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export function q(n: number, d = 1): Q {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`q(${n}, ${d}) : entiers attendus`);
  if (d === 0) throw new Error('q : dénominateur nul');
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) throw new Error('q : dépassement');
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return { n: n / g + 0, d: d / g };
}
export const ZERO = q(0);
export const ONE = q(1);

export const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
export const div = (a: Q, b: Q) => {
  if (b.n === 0) throw new Error('division par zéro');
  return q(a.n * b.d, a.d * b.n);
};
export const neg = (a: Q) => q(-a.n, a.d);
export const abs = (a: Q) => q(Math.abs(a.n), a.d);
export const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
export const cmp = (a: Q, b: Q) => Math.sign(a.n * b.d - b.n * a.d);
export const sign = (a: Q) => Math.sign(a.n);
export const isZero = (a: Q) => a.n === 0;
export const isInt = (a: Q) => a.d === 1;
export const toNum = (a: Q) => a.n / a.d;
export const sq = (a: Q) => mul(a, a);
/** Somme de plusieurs rationnels. */
export const sum = (...xs: Q[]) => xs.reduce(add, ZERO);

/** Écriture décimale finie ? (dénominateur de la forme 2^a·5^b) */
export function isDecimal(a: Q) {
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}
/** Nombre de chiffres après la virgule (écriture décimale finie), sinon Infinity. */
export function decimals(a: Q) {
  if (!isDecimal(a)) return Infinity;
  let k = 0;
  while ((a.n * 10 ** k) % a.d !== 0) k++;
  return k;
}
/** Racine carrée exacte d'un rationnel (si c'est un carré parfait), sinon null. */
export function sqrtQ(a: Q): Q | null {
  if (a.n < 0) return null;
  const rn = Math.round(Math.sqrt(a.n)), rd = Math.round(Math.sqrt(a.d));
  return rn * rn === a.n && rd * rd === a.d ? q(rn, rd) : null;
}
/** Conversion exacte d'un décimal écrit avec un point (« -2.75 ») en rationnel. */
export function fromDecimalString(s: string): Q | null {
  const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m || (!m[2] && !m[3])) return null;
  const frac = m[3] ?? '';
  if (frac.length > 12 || (m[2] ?? '').length > 13) return null;
  const n = Number((m[2] || '0') + frac) * (m[1] === '-' ? -1 : 1);
  return q(n, 10 ** frac.length);
}
export const fromNumber = (x: number, maxDen = 1000): Q => {
  // pour les décimaux écrits dans le code (2.4 → 12/5)
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-9) return q(n, d);
  }
  throw new Error(`fromNumber(${x}) : pas un rationnel simple`);
};
export const max = (a: Q, b: Q) => (cmp(a, b) >= 0 ? a : b);
export const min = (a: Q, b: Q) => (cmp(a, b) <= 0 ? a : b);
