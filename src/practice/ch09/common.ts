/** Outils du chapitre 09 : liens, angles en degrés, figures SVG à l'échelle (sécante, triangle, quadrilatère, cercle). */
import type { CourseLink, NumField, Rich, Step } from '../engine/types';
import { q, type Q } from '../engine/q';
import { svgWrap, line, text, dot, rightMark, fit, centroid, vertexLabel, type Pt } from '../engine/svg';

export const CH = '09-geometrie-plane-figures';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Vocabulaire et notations'), s13: sec('s1-3', '§ 1.3 · Parallèles et perpendiculaires'),
  s22: sec('s2-2', '§ 2.2 · Paires d’angles'), s23: sec('s2-3', '§ 2.3 · Parallèles et sécante'),
  s31: sec('s3-1', '§ 3.1 · Inégalité triangulaire'), s32: sec('s3-2', '§ 3.2 · Somme des angles'), s33: sec('s3-3', '§ 3.3 · Triangles particuliers'),
  s41: sec('s4-1', '§ 4.1 · Médiatrice'), s42: sec('s4-2', '§ 4.2 · Cercle circonscrit'), s43: sec('s4-3', '§ 4.3 · Hauteurs, bissectrices, médianes'),
  s51: sec('s5-1', '§ 5.1 · Parallélogramme'), s52: sec('s5-2', '§ 5.2 · Rectangle, losange, carré'),
  s6: sec('s6', '§ 6 · Le cercle'), s63: sec('s6-3', '§ 6.3 · Angle inscrit'), s7: sec('s7', '§ 7 · Rédiger une démonstration'),
};
export const m = (s: string) => `$${s}$`;
export const dg = (v: number) => `${String(v).replace('.', '{,}')}^\\circ`;
export const hat = (s: string) => `\\widehat{${s}}`;
export const cm = (v: number) => `${String(v).replace('.', '{,}')}\\,\\mathrm{cm}`;
export const degF = (label: Rich, v: number): NumField => ({ label, unit: '°', expect: q(Math.round(v * 10), 10), form: 'any' });
export const lenF = (label: Rich, v: number, unit = 'cm'): NumField => ({ label, unit, expect: q(Math.round(v * 100), 100), form: 'any' });
export const intF = (label: Rich, v: number, unit?: string): NumField => ({ label, unit, expect: q(v), form: 'any' });
export const qn = (v: number): Q => q(Math.round(v * 100), 100);
export type Item = { what: string; js: string; expect: number; tol?: number };
export const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Step['mistakes'] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
export const corr = (s: Step) => (s.answer as { correct: number }).correct;
export { q, type Q };

const R = Math.PI / 180;
const P = (o: Pt, r: number, a: number): Pt => [o[0] + r * Math.cos(a * R), o[1] - r * Math.sin(a * R)];
/** Arc d'angle (degrés, sens trigonométrique, repère écran y vers le bas) de a1 à a2. */
export function arc(o: Pt, r: number, a1: number, a2: number, cls = 'gf-arc'): string {
  const s = P(o, r, a1), e = P(o, r, a2), big = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
  return `<path class="${cls}" d="M${s[0].toFixed(1)},${s[1].toFixed(1)} A${r},${r} 0 ${big} 0 ${e[0].toFixed(1)},${e[1].toFixed(1)}"/>`;
}

/** Position d'un angle à une intersection : en haut à droite, en haut à gauche, en bas à gauche, en bas à droite. */
export type Pos = 'hd' | 'hg' | 'bg' | 'bd';
export const POS: Pos[] = ['hd', 'hg', 'bg', 'bd'];
/** Mesure de l'angle à la position p, pour une sécante qui fait l'angle α (aigu) avec les droites horizontales. */
export const angAt = (alpha: number, p: Pos) => (p === 'hd' || p === 'bg' ? alpha : 180 - alpha);
const bis = (alpha: number, p: Pos) => ({ hd: alpha / 2, hg: (alpha + 180) / 2, bg: 180 + alpha / 2, bd: (540 + alpha) / 2 })[p];
const range = (alpha: number, p: Pos): [number, number] => ({ hd: [0, alpha], hg: [alpha, 180], bg: [180, 180 + alpha], bd: [180 + alpha, 360] } as Record<Pos, [number, number]>)[p];

/**
 * Deux droites (d) et (d′) (parallèles si tilt = 0) coupées par une sécante (t) en E (en haut) et F (en bas).
 * marks : angles à afficher (sommet, position, texte), dessinés à l'échelle (α réel).
 */
export function secanteSvg(alpha: number, marks: { at: 'E' | 'F'; p: Pos; t: string }[], o: { tilt?: number; flip?: boolean; codeParallel?: boolean } = {}): string {
  const W = 320, H = 220, gap = 110, dxv = gap / Math.tan(alpha * R), E: Pt = [W / 2 + (o.flip ? -1 : 1) * dxv / 2, 60], F: Pt = [W / 2 - (o.flip ? -1 : 1) * dxv / 2, 60 + gap];
  // la figure retournée (flip) est une symétrie : on garde les mêmes positions logiques en la dessinant à l'endroit
  const a = o.flip ? 180 - alpha : alpha;
  let b = '';
  b += line([10, E[1]], [W - 10, E[1]], 'gf-line');
  const tl = (o.tilt ?? 0) * R;
  const yd = (x: number) => F[1] - (x - F[0]) * Math.tan(tl);
  b += line([10, yd(10)], [W - 10, yd(W - 10)], 'gf-line');
  const ext = Math.min(70, (E[1] - 14) / Math.sin(a * R)), t1 = P(E, ext, a), t2 = P(F, ext, a + 180);
  b += line(t1, t2, 'gf-line');
  b += text([W - 18, E[1] - 10], '(d)', 'gf-ts', 'end') + text([W - 18, yd(W - 18) + 14], '(d′)', 'gf-ts', 'end') + text([t1[0] + (o.flip ? -8 : 8), t1[1] + 4], '(t)', 'gf-ts', o.flip ? 'end' : 'start');
  b += dot(E, 2.5) + dot(F, 2.5);
  const flipP = (p: Pos) => (o.flip ? ({ hd: 'hg', hg: 'hd', bg: 'bd', bd: 'bg' } as Record<Pos, Pos>)[p] : p);
  for (const [nm, Ov] of [['E', E], ['F', F]] as [string, Pt][]) {
    const here = marks.filter((k) => k.at === nm).map((k) => flipP(k.p));
    const free = (['hg', 'bd', 'hd', 'bg'] as Pos[]).filter((p) => !here.includes(p));
    if (free.length) { const pp = free[0], mid = bis(a, pp); b += text(P(Ov, 15, mid), nm, 'gf-tb'); }
    else b += text([Ov[0] - 2, Ov[1] + (nm === 'E' ? -40 : 40)], nm, 'gf-tb');
  }
  if (o.codeParallel) b += text([24, E[1] - 8], '>', 'gf-ts') + text([24, F[1] - 8], '>', 'gf-ts');
  for (const mk of marks) {
    const Ov = mk.at === 'E' ? E : F, pp = o.flip ? ({ hd: 'hg', hg: 'hd', bg: 'bd', bd: 'bg' } as Record<Pos, Pos>)[mk.p] : mk.p;
    const [r1, r2] = range(a, pp), mid = bis(a, pp), rr = mk.t.length > 3 ? 38 : 32, alone = marks.filter((k) => k.at === mk.at).length === 1;
    b += (alone || mk.t.endsWith('°') ? arc(Ov, 16, r1, r2) : '') + text(P(Ov, rr + (Math.abs(Math.cos(mid * R)) * mk.t.length * 2.6), mid), mk.t, mk.t.endsWith('°') ? 'gf-ts' : 'gf-tq');
  }
  return svgWrap(W, H, `Droites (d) et (d′) coupées par la sécante (t) en E et F ; ${marks.map((k) => `angle ${k.t} en ${k.at}`).join(', ')}`, b);
}

/** Triangle de sommets nommés, construit à partir de deux angles (à l'échelle), avec les angles indiqués. */
export function triAngSvg(names: [string, string, string], A: number, B: number, labels: [string, string, string], o: { right?: number; equal?: [number, number] } = {}): string {
  const C = 180 - A - B, c = 1, bLen = (c * Math.sin(B * R)) / Math.sin(C * R);
  const raw: Pt[] = [[0, 0], [c, 0], [bLen * Math.cos(A * R), bLen * Math.sin(A * R)]];
  const { pts } = fit(raw, 300, 200, 34, 0);
  const g = centroid(pts);
  let b = line(pts[0], pts[1]) + line(pts[1], pts[2]) + line(pts[2], pts[0]);
  pts.forEach((p, i) => (b += vertexLabel(p, g, names[i])));
  const ang = (i: number) => {
    const p = pts[i], u = pts[(i + 1) % 3], v = pts[(i + 2) % 3];
    const a1 = Math.atan2(-(u[1] - p[1]), u[0] - p[0]) / R, a2 = Math.atan2(-(v[1] - p[1]), v[0] - p[0]) / R;
    let s = a1, e = a2; if (((e - s + 360) % 360) > 180) [s, e] = [e, s];
    return { s, e, mid: s + ((e - s + 360) % 360) / 2 };
  };
  for (let i = 0; i < 3; i++) {
    if (!labels[i]) continue;
    if (o.right === i) { b += rightMark(pts[i], pts[(i + 1) % 3], pts[(i + 2) % 3]); continue; }
    const { s, e, mid } = ang(i), small = [A, B, C][i] < 35;
    b += arc(pts[i], small ? 26 : 18, s, e) + text(P(pts[i], (small ? 46 : 36) + labels[i].length * 1.5, mid), labels[i], labels[i].includes('?') ? 'gf-tq' : 'gf-ts');
  }
  if (o.equal) for (const k of o.equal) { const [u, v] = [pts[k], pts[(k + 1) % 3]], mm: Pt = [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2], d = [v[0] - u[0], v[1] - u[1]], L = Math.hypot(d[0], d[1]); const n: Pt = [-d[1] / L * 6, d[0] / L * 6]; b += line([mm[0] - n[0], mm[1] - n[1]], [mm[0] + n[0], mm[1] + n[1]], 'gf-thin'); }
  return svgWrap(300, 200, `Triangle ${names.join('')} ; angles : ${names.map((n, i) => `${n} ${labels[i] || 'non indiqué'}`).join(', ')}`, b);
}

/** Deux droites sécantes en O, l'un des angles marqué. */
export function crossSvg(alpha: number, label: string, others: string[] = []): string {
  const O: Pt = [160, 100];
  let b = line(P(O, 140, 0), P(O, 140, 180)) + line(P(O, 95, alpha), P(O, 95, alpha + 180)) + dot(O, 2.5) + text(P(O, 14, 180 + alpha / 2), 'O', 'gf-tb');
  const secs: [number, number][] = [[0, alpha], [alpha, 180], [180, 180 + alpha], [180 + alpha, 360]];
  const labs = [label, ...others];
  secs.forEach(([s, e], i) => { if (!labs[i]) return; const mid = (s + e) / 2; b += (i === 0 ? arc(O, 18, s, e) : '') + text(P(O, 40 + labs[i].length * 1.6, mid), labs[i], labs[i].endsWith('°') ? 'gf-ts' : 'gf-tq'); });
  return svgWrap(320, 200, `Deux droites sécantes en O ; angles : ${labs.filter(Boolean).join(', ')}`, b);
}
