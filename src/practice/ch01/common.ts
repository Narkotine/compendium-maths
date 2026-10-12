/** Outils communs aux générateurs du chapitre 1 (fractions et nombres rationnels). */
import type { CourseLink, Rich } from '../engine/types';
import { type Q, q, gcd } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, line, text, dot } from '../engine/svg';

export const CH = '01-fractions-rationnels';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Partager l’unité'),
  s12: sec('s1-2', '§ 1.2 · Une fraction est un quotient'),
  s13: sec('s1-3', '§ 1.3 · Placer une fraction sur une demi-droite'),
  s21: sec('s2-1', '§ 2.1 · Fractions égales'),
  s22: sec('s2-2', '§ 2.2 · Simplifier, fraction irréductible'),
  s3: sec('s3', '§ 3 · Comparer des fractions'),
  s4: sec('s4', '§ 4 · Additionner et soustraire'),
  s51: sec('s5-1', '§ 5.1 · Fraction d’une quantité'),
  s52: sec('s5-2', '§ 5.2 · Produit de deux fractions'),
  s6: sec('s6', '§ 6 · Inverse et division'),
  s7: sec('s7', '§ 7 · Calculs avec priorités'),
  s81: sec('s8-1', '§ 8.1 · Changer d’écriture'),
  s82: sec('s8-2', '§ 8.2 · Fractions négatives'),
  s83: sec('s8-3', '§ 8.3 · Nombres rationnels'),
  serieJ: sec('serie-J', 'Série J · Problèmes en plusieurs étapes'),
  serieH: sec('serie-H', 'Série H · Trouver l’erreur'),
};

/** Fraction écrite telle quelle (non simplifiée) : \dfrac{6}{8}, −\dfrac{3}{4}. */
export function fr(n: number, d: number): string {
  if (d < 0) [n, d] = [-n, -d];
  return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
}
/** Rationnel en fraction irréductible (entier s'il l'est). */
export const fq = (v: Q) => texQ(v, 'frac');
/** Entre parenthèses s'il est négatif. */
export const fqp = (v: Q) => (v.n < 0 ? `\\left(${fq(v)}\\right)` : fq(v));
export const F = (n: number, d: number) => q(n, d);

/** Décomposition en facteurs premiers (liste croissante). */
export function factors(n: number): number[] {
  const out: number[] = [];
  let x = Math.abs(n);
  for (let p = 2; p * p <= x; p++) while (x % p === 0) { out.push(p); x /= p; }
  if (x > 1) out.push(x);
  return out;
}
export const factTex = (n: number) => (factors(n).length ? factors(n).join(' \\times ') : '1');
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
/** n est-il de la forme 2^i·5^j (écriture décimale finie de 1/n) ? */
export function decimalDen(n: number) {
  let x = n;
  while (x % 2 === 0) x /= 2;
  while (x % 5 === 0) x /= 5;
  return x === 1;
}
/** Explication courte « pourquoi c'est irréductible ». */
export function irrNote(v: Q): Rich {
  if (v.d === 1) return '';
  return `${'$'}${Math.abs(v.n)}${'$'} et ${'$'}${v.d}${'$'} n’ont plus que ${'$'}1${'$'} comme diviseur commun`;
}

// ------------------------------------------------------------------ figures
const UNIT = 280;
/**
 * Barres unité partagées en b parts égales, a parts coloriées (a peut dépasser b : plusieurs barres).
 * `on` : indices coloriés de la DERNIÈRE barre (parts pas forcément voisines) ; les barres précédentes sont pleines.
 */
export function barsSvg(a: number, b: number, on?: number[]): string {
  const nb = Math.max(1, Math.ceil(a / b));
  const lastOn = new Set(on ?? [...Array(a - (nb - 1) * b).keys()]);
  const h = 30, gap = 14, x0 = 20, y0 = 12;
  let body = '';
  for (let k = 0; k < nb; k++) {
    const y = y0 + k * (h + gap);
    for (let i = 0; i < b; i++) {
      const x = x0 + (i * UNIT) / b;
      const col = k < nb - 1 || lastOn.has(i);
      body += `<rect class="${col ? 'gf-part' : 'gf-cell'}" x="${x.toFixed(1)}" y="${y}" width="${(UNIT / b).toFixed(1)}" height="${h}"/>`;
    }
  }
  const H = y0 + nb * (h + gap);
  const aria = `${nb > 1 ? `${nb} barres unité` : 'Une barre unité'} partagée${nb > 1 ? 's' : ''} chacune en ${b} parts égales ; ${a} parts coloriées en tout`;
  return svgWrap(UNIT + 40, H, aria, body);
}
/** Disque partagé en b secteurs égaux, secteurs `on` coloriés. */
export function discSvg(b: number, on: number[]): string {
  const R = 80, cx = 100, cy = 92, set = new Set(on);
  let body = '';
  for (let i = 0; i < b; i++) {
    const t0 = -Math.PI / 2 + (2 * Math.PI * i) / b, t1 = t0 + (2 * Math.PI) / b;
    const p0 = [cx + R * Math.cos(t0), cy + R * Math.sin(t0)], p1 = [cx + R * Math.cos(t1), cy + R * Math.sin(t1)];
    body += `<path class="${set.has(i) ? 'gf-part' : 'gf-cell'}" d="M${cx},${cy} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${R},${R} 0 0 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z"/>`;
  }
  return svgWrap(200, 184, `Disque partagé en ${b} secteurs égaux ; ${on.length} secteurs coloriés`, body);
}
/** Rectangle partagé en r × c cases égales, cases `on` (indices 0…rc−1) coloriées. */
export function gridSvg(r: number, c: number, on: number[]): string {
  const cell = Math.min(36, 260 / c), set = new Set(on), x0 = 10, y0 = 10;
  let body = '';
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++)
    body += `<rect class="${set.has(i * c + j) ? 'gf-part' : 'gf-cell'}" x="${(x0 + j * cell).toFixed(1)}" y="${(y0 + i * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}"/>`;
  return svgWrap(2 * x0 + c * cell, 2 * y0 + r * cell, `Rectangle partagé en ${r * c} cases égales (${r} lignes, ${c} colonnes) ; ${on.length} cases coloriées`, body);
}
/** Demi-droite graduée : unité partagée en b, de 0 à `units`, points nommés (abscisses en nombre de b-ièmes). */
export function halfLineSvg(b: number, units: number, pts: [string, number][]): string {
  const W = 330, x0 = 18, len = W - 40, u = len / units, y = 46;
  let body = line([x0 - 4, y], [x0 + len + 10, y], 'gf-axis');
  body += `<polygon class="gf-arrow" points="${x0 + len + 16},${y} ${x0 + len + 8},${y - 4} ${x0 + len + 8},${y + 4}"/>`;
  for (let i = 0; i <= units * b; i++) {
    const x = x0 + (i * u) / b, big = i % b === 0;
    body += line([x, y - (big ? 8 : 5)], [x, y + (big ? 8 : 5)], big ? 'gf-line' : 'gf-thin');
    if (big) body += text([x, y + 22], String(i / b), 'gf-t');
  }
  for (const [nm, k] of pts) {
    const x = x0 + (k * u) / b;
    body += dot([x, y]) + text([x, y - 18], nm, 'gf-tb');
  }
  return svgWrap(W, 80, `Demi-droite graduée de 0 à ${units}, chaque unité partagée en ${b} parts égales ; points ${pts.map((p) => p[0]).join(', ')}`, body);
}
