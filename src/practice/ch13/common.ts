/** Outils communs du chapitre 13 (trigonométrie) : triangle rectangle à l'échelle avec angle marqué, arrondis. */
import type { CourseLink, NumField, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { q, toNum, type Q } from '../engine/q';
import { svgWrap, line, poly, text, fit, centroid, rightMark, sideLabel, vertexLabel, type Pt } from '../engine/svg';
import { dx, round, roundQ, qd, seg, TRI_NAMES } from '../ch11/common';

export const CH = '13-trigonometrie';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Adjacent, opposé, hypoténuse'),
  s22: sec('s2-2', '§ 2.2 · Définitions'),
  s23: sec('s2-3', '§ 2.3 · Ce qu’il faut savoir'),
  s32: sec('s3-2', '§ 3.2 · Inconnue en haut'),
  s33: sec('s3-3', '§ 3.3 · Inconnue en bas'),
  s35: sec('s3-5', '§ 3.5 · Méthode en 4 étapes'),
  s36: sec('s3-6', '§ 3.6 · Erreurs fréquentes'),
  s42: sec('s4-2', '§ 4.2 · Calculer un angle'),
  s43: sec('s4-3', '§ 4.3 · L’autre angle'),
  s44: sec('s4-4', '§ 4.4 · Erreurs (angles)'),
  s51: sec('s5-1', '§ 5.1 · Angle de visée'),
  s52: sec('s5-2', '§ 5.2 · Pente d’une route'),
  s53: sec('s5-3', '§ 5.3 · Échelle contre un mur'),
  s6: sec('s6', '§ 6 · Quel outil choisir ?'),
  s61: sec('s6-1', '§ 6.1 · Relations, valeurs remarquables'),
};
export const m = (s: string) => `$${s}$`;
export { dx, round, roundQ, qd, seg };
export const fr = (a: string | number, b: string | number) => `\\dfrac{${a}}{${b}}`;
export const deg = (v: number | string) => `${typeof v === 'number' ? dx(v) : v}^\\circ`;
export const D2R = Math.PI / 180;
export const cosd = (a: number) => Math.cos(a * D2R), sind = (a: number) => Math.sin(a * D2R), tand = (a: number) => Math.tan(a * D2R);
export const acosd = (x: number) => Math.acos(x) / D2R, asind = (x: number) => Math.asin(x) / D2R, atand = (x: number) => Math.atan(x) / D2R;
/** Arrondi lisible (virgule) d'une valeur approchée. */
export const ax = (v: number, dp: number) => v.toFixed(dp).replace('.', '{,}');
/** Valeur assez loin d'une frontière d'arrondi (évite les cas où l'arrondi dépend du dernier chiffre). */
export const safe = (v: number, dp: number) => { const f = Math.abs(v * 10 ** dp) % 1; return Math.abs(f - 0.5) > 0.06; };
export const approxF = (label: Rich, v: number, dp: number, unit?: string): NumField => ({ label, unit, expect: roundQ(v, dp), form: 'any', approx: { value: v, tol: 0.5 * 10 ** -dp, dp }, shown: ax(round(v, dp), dp) });
export const ROUND_TXT: Record<number, string> = { 0: 'au degré', 1: 'au dixième', 2: 'au centième', 3: 'au millième' };
export const LEN_TXT: Record<string, string> = { cm: 'au millimètre', m: 'au décimètre' };

/** Triangle rectangle : sommet R (angle droit), P (angle α étudié), Q. Côtés : adj = [RP], opp = [RQ], hyp = [PQ]. */
export interface Tri { name: string; R: string; P: string; Q: string; adj: string; opp: string; hyp: string; ang: string; angQ: string }
export function pickTri(rng: Rng): Tri {
  const name = rng.pick(TRI_NAMES);
  const [R, P, Q] = rng.shuffle(name.split(''));
  const w = (v: string, x: string, y: string) => { const [u, z] = [x, y].sort(); return `\\widehat{${u}${v}${z}}`; };
  return { name, R, P, Q, adj: seg(name, R, P), opp: seg(name, R, Q), hyp: seg(name, P, Q), ang: w(P, R, Q), angQ: w(Q, R, P) };
}
/** Figure à l'échelle : α en P (degrés), côté adjacent de longueur adj (unités quelconques). */
export function triSvg(t: Tri, alpha: number, adj: number, o: { labels?: { adj?: string; opp?: string; hyp?: string }; arc?: string | null; arcQ?: string | null; ask?: 'adj' | 'opp' | 'hyp'; rot: number; flip: boolean; aria: string }): string {
  const W = 340, H = 230;
  const opp = adj * tand(alpha);
  const base: Pt[] = [[0, 0], [-adj, 0], [0, (o.flip ? -1 : 1) * opp]]; // R, P, Q
  const { pts } = fit(base, W, H, 62, o.rot);
  const [R, P, Q] = pts;
  const g = centroid(pts);
  let b = poly(pts) + rightMark(R, P, Q, 12);
  if (o.ask) { const [x, y] = o.ask === 'adj' ? [R, P] : o.ask === 'opp' ? [R, Q] : [P, Q]; b += line(x, y, 'gf-hl'); }
  const arc = (V: Pt, A: Pt, B: Pt, lbl: string | null | undefined) => {
    const r = 26, u = (X: Pt) => { const d = Math.hypot(X[0] - V[0], X[1] - V[1]); return [(X[0] - V[0]) / d, (X[1] - V[1]) / d] as Pt; };
    const [ua, ub] = [u(A), u(B)];
    const a1: Pt = [V[0] + r * ua[0], V[1] + r * ua[1]], a2: Pt = [V[0] + r * ub[0], V[1] + r * ub[1]];
    const cross = ua[0] * ub[1] - ua[1] * ub[0];
    let s = `<path class="gf-arc" d="M${a1[0].toFixed(1)},${a1[1].toFixed(1)} A${r},${r} 0 0 ${cross > 0 ? 1 : 0} ${a2[0].toFixed(1)},${a2[1].toFixed(1)}"/>`;
    if (lbl) { const mx = ua[0] + ub[0], my = ua[1] + ub[1], d = Math.hypot(mx, my); s += text([V[0] + (mx / d) * (r + 16), V[1] + (my / d) * (r + 16) + 4], lbl, lbl === '?' ? 'gf-tq' : 'gf-ts'); }
    return s;
  };
  if (o.arc !== null) b += arc(P, R, Q, o.arc);
  if (o.arcQ) b += arc(Q, R, P, o.arcQ);
  b += vertexLabel(R, g, t.R) + vertexLabel(P, g, t.P) + vertexLabel(Q, g, t.Q);
  const L = o.labels ?? {};
  const lab = (a: Pt, c: Pt, s: string | undefined, k: 'adj' | 'opp' | 'hyp') => (s ? sideLabel(a, c, g, s, o.ask === k || s === '?' ? 'gf-tq' : 'gf-t', 13) : '');
  b += lab(R, P, L.adj, 'adj') + lab(R, Q, L.opp, 'opp') + lab(P, Q, L.hyp, 'hyp');
  return svgWrap(W, H, o.aria, b);
}
export const ROTS = [0, 0, Math.PI, 0.3, -0.35, Math.PI / 2, -Math.PI / 2, 2.6];
export const L1 = (v: number) => dx(round(v, 2)).replace('{,}', ',');
export { q, toNum, type Q };
