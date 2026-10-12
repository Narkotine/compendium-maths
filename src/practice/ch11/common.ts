/** Outils communs aux générateurs du chapitre 11 (théorème de Pythagore) : triplets, arrondis, figures. */
import type { CourseLink, NumField, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type Q, q, toNum } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, poly, rightMark, vertexLabel, sideLabel, fit, centroid, line, text, type Pt } from '../engine/svg';

export const CH = '11-pythagore';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s1: sec('s1', '§ 1 · Carrés et racine carrée'),
  s2: sec('s2', '§ 2 · L’hypoténuse'),
  s31: sec('s3-1', '§ 3.1 · Le théorème'),
  s34: sec('s3-4', '§ 3.4 · Calculer l’hypoténuse'),
  s35: sec('s3-5', '§ 3.5 · Calculer un côté de l’angle droit'),
  s36: sec('s3-6', '§ 3.6 · Résultat non entier'),
  s37: sec('s3-7', '§ 3.7 · Méthode en 4 étapes'),
  s38: sec('s3-8', '§ 3.8 · Erreurs fréquentes'),
  s42: sec('s4-2', '§ 4.2 · Réciproque : méthode'),
  s51: sec('s5-1', '§ 5.1 · Diagonale d’un rectangle'),
  s52: sec('s5-2', '§ 5.2 · Isocèle, losange'),
  s53: sec('s5-3', '§ 5.3 · Situations concrètes'),
  s54: sec('s5-4', '§ 5.4 · Pythagore deux fois'),
  s55: sec('s5-5', '§ 5.5 · Distance dans un repère'),
  ch4: { href: '#/ch/04-puissances-notation-scientifique/s6', label: 'Chapitre 4, § 6 · Racine carrée' },
};
export const m = (s: string) => `$${s}$`;
/** Triplets pythagoriciens primitifs (côtés de l'angle droit, hypoténuse). */
export const PRIMITIVE: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41]];
/** Triplets entiers « de cours » : primitifs et multiples, hypoténuse ≤ maxC. */
export function triplets(maxC: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (const [a, b, c] of PRIMITIVE) for (let k = 1; k * c <= maxC; k++) out.push([k * a, k * b, k * c]);
  return out;
}
/** Nombre décimal en TeX, avec espace des milliers. */
export const dx = (v: number | Q) => {
  const x = typeof v === 'number' ? v : toNum(v);
  const s = Number.isInteger(x) ? String(x) : String(Math.round(x * 1e6) / 1e6);
  const [i, d] = s.split('.');
  const ii = i.replace('-', '').length >= 5 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i;
  return d ? `${ii}{,}${d}` : ii;
};
/** Texte (hors TeX) d'un nombre décimal : 2,5. */
export const dt = (v: number) => dx(v).replace('{,}', ',').replace(/\\,/g, ' ');
/** Arrondi au 10^-dp (moitié vers le haut). */
export const round = (v: number, dp: number) => Math.round(v * 10 ** dp + 1e-9) / 10 ** dp;
export const roundQ = (v: number, dp: number): Q => q(Math.round(v * 10 ** dp + 1e-9), 10 ** dp);
/** Rationnel exact d'un décimal court (2,5 → 5/2). */
export const qd = (v: number): Q => {
  for (const k of [1, 10, 100, 1000, 10000]) if (Math.abs(Math.round(v * k) - v * k) < 1e-9) return q(Math.round(v * k), k);
  throw new Error(`qd(${v})`);
};
export const sq = (v: number) => round(v * v, 6);
export { texQ };

/** Case « longueur » : exacte si la racine tombe juste, sinon arrondie (au dixième par défaut). */
export function lengthField(label: Rich, v: number, unit: string, dp = 1): NumField & { exact: boolean } {
  const exact = Math.abs(round(v, 6) - round(v, 3)) < 1e-9 && Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6;
  if (exact) return { label, unit, expect: qd(round(v, 3)), form: 'any', exact: true };
  return { label, unit, expect: roundQ(v, dp), form: 'any', approx: { value: v, tol: 0.5 * 10 ** -dp, dp }, exact: false };
}
/** Valeur affichée d'une case longueur : arrondi écrit avec tous ses chiffres (18,0), sinon valeur exacte. */
export function lenTex(f: NumField): string {
  if (f.approx) return toNum(f.expect).toFixed(f.approx.dp).replace('.', '{,}');
  return dx(f.expect);
}
/** Valeur d'une erreur typique : exacte si décimale courte, sinon arrondie comme la réponse attendue. */
export const mq = (v: number, dp = 1) => (Number.isFinite(v) && Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6 ? qd(round(v, 3)) : Number.isFinite(v) ? roundQ(v, dp) : null);
export const ROUND_TXT: Record<number, string> = { 0: 'à l’unité', 1: 'au dixième', 2: 'au centième' };

/** Noms de triangles (sommets) : on choisit aussi le sommet de l'angle droit. */
export const TRI_NAMES = ['ABC', 'DEF', 'EFG', 'KLM', 'RST', 'MNP', 'XYZ', 'GHK', 'IJK', 'UVW'];
/** Segment nommé dans l'ordre alphabétique du nom du triangle ([BC], pas [CB]). */
export function seg(name: string, p: string, r: string) {
  return name.indexOf(p) < name.indexOf(r) ? p + r : r + p;
}
export function pickTriangle(rng: Rng) {
  const name = rng.pick(TRI_NAMES);
  const [R, P, Qn] = rng.shuffle(name.split(''));
  // R : sommet de l'angle droit ; [PQ] hypoténuse
  return { name, R, P, Q: Qn, hyp: seg(name, P, Qn), legP: seg(name, R, P), legQ: seg(name, R, Qn) };
}

/**
 * Triangle rectangle en R dessiné à l'échelle : RP = lp, RQ = lq (unités réelles), tourné d'un angle `rot`.
 * labels : textes des côtés (« 5 cm », « ? »), ou null pour ne rien écrire.
 */
export function rightTriangleSvg(o: { R: string; P: string; Q: string; lp: number; lq: number; rot: number; flip: boolean; labels: { RP?: string | null; RQ?: string | null; PQ?: string | null }; ask?: 'RP' | 'RQ' | 'PQ'; aria: string }): string {
  const W = 340, H = 230;
  const base: Pt[] = [[0, 0], [o.lp, 0], [0, (o.flip ? -1 : 1) * o.lq]];
  const { pts } = fit(base, W, H, 38, o.rot);
  const [R, P, Q] = pts;
  const g = centroid(pts);
  let b = poly(pts);
  b += rightMark(R, P, Q, 12);
  if (o.ask) {
    const [x, y] = o.ask === 'RP' ? [R, P] : o.ask === 'RQ' ? [R, Q] : [P, Q];
    b += line(x, y, 'gf-hl');
  }
  b += vertexLabel(R, g, o.R) + vertexLabel(P, g, o.P) + vertexLabel(Q, g, o.Q);
  const lab = (a: Pt, c: Pt, t: string | null | undefined, k: 'RP' | 'RQ' | 'PQ') => (t ? sideLabel(a, c, g, t, o.ask === k ? 'gf-tq' : 'gf-t', 13) : '');
  b += lab(R, P, o.labels.RP, 'RP') + lab(R, Q, o.labels.RQ, 'RQ') + lab(P, Q, o.labels.PQ, 'PQ');
  return svgWrap(W, H, o.aria, b);
}
export { text, line, svgWrap, poly, fit, centroid, rightMark, sideLabel, vertexLabel, type Pt };
/** Angle de rotation « lisible » (le triangle n'est pas toujours posé sur l'angle droit). */
export const ROTS = [0, Math.PI / 2, Math.PI, -Math.PI / 2, 0.35, -0.5, 2.4, 0.9, -2.2];
