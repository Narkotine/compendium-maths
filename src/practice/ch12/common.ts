/** Outils communs aux générateurs du chapitre 12 (théorème de Thalès) : longueurs, rapports, figures à l'échelle. */
import type { CourseLink, NumField, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type Q, q, toNum, mul, div, eq } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, line, text, fit, centroid, dot, type Pt } from '../engine/svg';
import { dx, qd, round, roundQ } from '../ch11/common';

export const CH = '12-thales';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Produit en croix'),
  s12: sec('s1-2', '§ 1.2 · Agrandissement et réduction'),
  s22: sec('s2-2', '§ 2.2 · Le théorème'),
  s23: sec('s2-3', '§ 2.3 · Configuration papillon'),
  s24: sec('s2-4', '§ 2.4 · Écrire les rapports'),
  s25: sec('s2-5', '§ 2.5 · Exemple : triangles emboîtés'),
  s27: sec('s2-7', '§ 2.7 · Segment « restant »'),
  s28: sec('s2-8', '§ 2.8 · Méthode en 4 étapes'),
  s29: sec('s2-9', '§ 2.9 · Erreurs fréquentes'),
  s31: sec('s3-1', '§ 3.1 · La réciproque'),
  s32: sec('s3-2', '§ 3.2 · Parallèles ou pas : méthode'),
  s35: sec('s3-5', '§ 3.5 · Réciproque : erreurs fréquentes'),
  s41: sec('s4-1', '§ 4.1 · Parallèles cachées'),
  s42: sec('s4-2', '§ 4.2 · La hauteur d’un arbre'),
  s51: sec('s5-1', '§ 5.1 · Longueurs, aires, volumes'),
  s52: sec('s5-2', '§ 5.2 · Lien avec Thalès'),
  s53: sec('s5-3', '§ 5.3 · Triangles semblables'),
  serieG: sec('serie-G', 'Série G · Trouver l’erreur'),
  serieI: sec('serie-I', 'Série I · Plusieurs étapes'),
  ch11: { href: '#/ch/11-pythagore/s3-7', label: 'Chapitre 11 · Pythagore, méthode' },
};
export const m = (s: string) => `$${s}$`;
export { dx, qd, round, roundQ };
/** Nombre exact en TeX : décimal si possible, sinon fraction. */
export const nq = (v: Q) => texQ(v, 'dec');
export const fr = (a: string | number, b: string | number) => `\\dfrac{${a}}{${b}}`;
export const ql = (v: number) => qd(round(v, 4));
export const isShort = (v: Q, dp = 2) => (10 ** dp) % v.d === 0 || [1, 2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 100].includes(v.d) && (10 ** dp) % v.d === 0;
/** Valeur JavaScript d'un rationnel (tests). */
export const J = (v: Q) => String(toNum(v));
export { q, toNum, mul, div, eq };

/** Rapports k = p/qq « de cours » (réduction). */
export const KS: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [3, 8], [5, 8], [5, 6], [1, 5], [3, 10], [7, 10]];

/** Noms : sommet commun, grand triangle (B, C), points D sur (AB), E sur (AC). */
export interface Names { A: string; B: string; C: string; D: string; E: string }
export const NAMESETS: Names[] = [
  { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
  { A: 'A', B: 'B', C: 'C', D: 'M', E: 'N' },
  { A: 'R', B: 'S', C: 'T', D: 'M', E: 'N' },
  { A: 'O', B: 'K', C: 'L', D: 'I', E: 'J' },
  { A: 'S', B: 'U', C: 'V', D: 'M', E: 'P' },
  { A: 'K', B: 'L', C: 'M', D: 'G', E: 'H' },
  { A: 'O', B: 'V', C: 'Z', D: 'U', E: 'W' },
];
export const pickNames = (rng: Rng, plain = false) => (plain ? NAMESETS[0] : rng.pick(NAMESETS));
/** Segment nommé : ordre « sommet commun d'abord », puis ordre de la configuration (AD, AB, DE, BC). */
export const segs = (n: Names) => ({ AD: n.A + n.D, AB: n.A + n.B, AE: n.A + n.E, AC: n.A + n.C, DE: n.D + n.E, BC: n.B + n.C, DB: n.D + n.B, EC: n.E + n.C });
export type SegKey = keyof ReturnType<typeof segs>;

/**
 * Grand triangle : côtés AB, AC, BC (exacts) multiples de qq × h, pour que le petit triangle (×p/qq)
 * ait des côtés décimaux courts. Angle en A entre 35° et 105° (figure lisible), triangle non aplati.
 */
export function bigTriangle(rng: Rng, qq: number, o: { min?: number; max?: number; h?: number[] } = {}) {
  const min = o.min ?? 4, max = o.max ?? 15;
  const hs = o.h ?? [1, 0.5];
  for (let tries = 0; tries < 400; tries++) {
    const h = rng.pick(hs);
    const unit = qq * h;
    const tmin = Math.ceil(min / unit), tmax = Math.floor(max / unit);
    if (tmax < tmin + 2) continue;
    const ab = rng.int(tmin, tmax) * unit, ac = rng.int(tmin, tmax) * unit;
    if (ab === ac && rng.chance(0.7)) continue;
    // BC compatible avec un angle en A de 35° à 105°
    const lo = Math.sqrt(ab * ab + ac * ac - 2 * ab * ac * Math.cos((35 * Math.PI) / 180));
    const hi = Math.sqrt(ab * ab + ac * ac - 2 * ab * ac * Math.cos((105 * Math.PI) / 180));
    const ts: number[] = [];
    for (let t = Math.ceil(lo / unit); t * unit <= hi; t++) if (t * unit >= min * 0.6 && t * unit <= max * 1.15) ts.push(t);
    if (!ts.length) continue;
    const bc = rng.pick(ts) * unit;
    return { AB: round(ab, 4), AC: round(ac, 4), BC: round(bc, 4) };
  }
  throw new Error('bigTriangle');
}

/**
 * Figure de Thalès À L'ÉCHELLE. k > 0 : triangles emboîtés (D sur [AB] si k < 1, au-delà de B si k > 1) ;
 * k < 0 : papillon. labels : texte affiché par segment (« 4 », « ? »). aria : description.
 */
export function thalesSvg(o: { n: Names; AB: number; AC: number; BC: number; k: number; kE?: number; labels: Partial<Record<SegKey, string>>; ask?: SegKey[]; rot?: number; flip?: boolean; aria: string; par?: boolean }): string {
  const W = 340, H = o.k < 0 ? 250 : 230;
  const cosA = (o.AB ** 2 + o.AC ** 2 - o.BC ** 2) / (2 * o.AB * o.AC);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const s = o.flip ? -1 : 1;
  const A: Pt = [0, 0], B: Pt = [o.AB, 0], C: Pt = [o.AC * cosA, s * o.AC * sinA];
  const kE = o.kE ?? o.k;
  const D: Pt = [o.k * B[0], o.k * B[1]], E: Pt = [kE * C[0], kE * C[1]];
  const { pts } = fit([A, B, C, D, E], W, H, 34, o.rot ?? 0);
  const [a, b, c, d, e] = pts;
  const g = centroid([a, b, c]);
  const far = (p: Pt, r: Pt): [Pt, Pt] => [p, r];
  let body = '';
  // droites (AB) et (AC) : du point extrême au point extrême
  const ext = (p1: Pt, p2: Pt, p3: Pt): [Pt, Pt] => {
    const all = [p1, p2, p3];
    let best: [Pt, Pt] = [p1, p2], dd = -1;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const v = Math.hypot(all[i][0] - all[j][0], all[i][1] - all[j][1]); if (v > dd) { dd = v; best = [all[i], all[j]]; } }
    return best;
  };
  body += line(...ext(a, b, d)) + line(...ext(a, c, e));
  body += line(b, c, o.par === false ? 'gf-line' : 'gf-par') + line(d, e, o.par === false ? 'gf-line' : 'gf-par');
  for (const p of [a, b, c, d, e]) body += dot(p, 2.6, 'gf-pt');
  // étiquettes des sommets : à l'écart des droites
  const away = (p: Pt, from: Pt[], dist = 15): Pt => {
    let vx = 0, vy = 0;
    for (const f of from) { const L = Math.hypot(p[0] - f[0], p[1] - f[1]) || 1; vx += (p[0] - f[0]) / L; vy += (p[1] - f[1]) / L; }
    const L = Math.hypot(vx, vy) || 1;
    return [p[0] + (vx / L) * dist, p[1] + (vy / L) * dist];
  };
  const vt = (p: Pt, s2: string, from: Pt[]) => text(away(p, from), s2, 'gf-tb');
  body += vt(a, o.n.A, [b, c, d, e]) + vt(b, o.n.B, [a, c]) + vt(c, o.n.C, [a, b]) + vt(d, o.n.D, [a, e, b]) + vt(e, o.n.E, [a, d, c]);
  // étiquettes de longueurs : sur la normale, côté opposé au « centre » choisi ; les segments longs (AB, AC) plus loin
  const lab = (p1: Pt, p2: Pt, ref: Pt, str: string, cls: string, dist: number) => {
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    let nx = -(p2[1] - p1[1]), ny = p2[0] - p1[0];
    const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (nx * (mx - ref[0]) + ny * (my - ref[1]) < 0) { nx = -nx; ny = -ny; }
    const extra = Math.abs(nx) * Math.min(str.length * 3.4, 20);
    return text([mx + nx * (dist + extra), my + ny * (dist + extra)], str, cls);
  };
  const P: Record<SegKey, [Pt, Pt, Pt, number]> = {
    AD: [a, d, o.k < 0 ? centroid([a, d, e]) : g, 13],
    AB: [a, b, g, o.k > 0 && o.k < 1 ? 32 : 13],
    AE: [a, e, o.k < 0 ? centroid([a, d, e]) : g, 13],
    AC: [a, c, g, o.k > 0 && o.k < 1 ? 32 : 13],
    DB: [d, b, g, 13],
    EC: [e, c, g, 13],
    DE: [d, e, o.k < 0 ? a : (o.k < 1 ? b : a), 12],
    BC: [b, c, a, 13],
  };
  void far;
  for (const [k, v] of Object.entries(o.labels) as [SegKey, string][]) {
    if (!v) continue;
    const [p1, p2, ref, dist] = P[k];
    body += lab(p1, p2, ref, v, o.ask?.includes(k) ? 'gf-tq' : 'gf-t', dist);
  }
  return svgWrap(W, H, o.aria, body);
}

/** Libellé d'une longueur dans une figure : « 4,5 » ou « ? ». */
export const L = (v: number | Q) => (typeof v === 'number' ? dx(v) : dx(toNum(v))).replace('{,}', ',');
/** Case longueur exacte. */
export const lenF = (label: Rich, v: Q, unit = 'cm'): NumField => ({ label, unit, expect: v, form: 'any' });
/** Case longueur arrondie au dixième (au millimètre si cm). */
export const lenApprox = (label: Rich, v: number, unit = 'cm', dp = 1): NumField => ({ label, unit, expect: roundQ(v, dp), form: 'any', approx: { value: v, tol: 0.5 * 10 ** -dp, dp } });
