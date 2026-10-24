/** Outils du chapitre 10 : liens, figures sur quadrillage (polyominos) et dans un repère. */
import type { CourseLink, NumField, Rich, Step } from '../engine/types';
import { q, type Q } from '../engine/q';
import { svgWrap, line, text, dot, type Pt } from '../engine/svg';

export const CH = '10-transformations-plan';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s1: sec('s1', '§ 1 · Transformer une figure'), s2: sec('s2', '§ 2 · Symétrie axiale'), s23: sec('s2-3', '§ 2.3 · Axes de symétrie'),
  s3: sec('s3', '§ 3 · Symétrie centrale'), s4: sec('s4', '§ 4 · Translation'), s41: sec('s4-1', '§ 4.1 · Vecteurs'), s42: sec('s4-2', '§ 4.2 · Somme, relation de Chasles'), s5: sec('s5', '§ 5 · Rotation'),
  s6: sec('s6', '§ 6 · Homothétie'), s62: sec('s6-2', '§ 6.2 · Propriétés de l’homothétie'), s71: sec('s7-1', '§ 7.1 · Ce qui est conservé'), s72: sec('s7-2', '§ 7.2 · Frises, rosaces'),
};
export const m = (s: string) => `$${s}$`;
export const dn = (v: number) => String(v).replace('.', '{,}').replace('-', '-');
export type Item = { what: string; js: string; expect: number; tol?: number };
export const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Step['mistakes'] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
export const corr = (s: Step) => (s.answer as { correct: number }).correct;
export const numF = (label: Rich, v: number, unit?: string): NumField => ({ label, unit, expect: q(Math.round(v * 1000), 1000), form: 'any' });
export { q, type Q };

// ------------------------------------------------------------------ polyominos sans aucune symétrie
export type Cell = [number, number];
const RAW: Cell[][] = [
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [1, 1]], // lettre F
  [[0, 0], [0, 1], [0, 2], [1, 2], [1, 1]], // P
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]], // variantes
  [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 3]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [0, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [1, 0]],
];
const norm = (cs: Cell[]): string => { const x0 = Math.min(...cs.map((c) => c[0])), y0 = Math.min(...cs.map((c) => c[1])); return cs.map(([x, y]) => `${x - x0},${y - y0}`).sort().join(';'); };
const ISO: ((c: Cell) => Cell)[] = [([x, y]) => [-x, y], ([x, y]) => [x, -y], ([x, y]) => [-x, -y], ([x, y]) => [y, x], ([x, y]) => [-y, -x], ([x, y]) => [-y, x], ([x, y]) => [y, -x]];
export const SHAPES: Cell[][] = RAW.filter((s) => ISO.every((f) => norm(s.map(f)) !== norm(s)));

/** Dessin sur quadrillage : figures (listes de carrés transformés, coordonnées en carreaux, y vers le haut). */
export interface GridFig { quads: Pt[][]; cls: string; label: string }
export function gridSvg(cols: number, rows: number, figs: GridFig[], extra = '', aria = ''): string {
  const s = 20, W = cols * s + 20, H = rows * s + 20, X = (x: number) => 10 + x * s, Y = (y: number) => 10 + (rows - y) * s;
  let b = '';
  for (let i = 0; i <= cols; i++) b += line([X(i), Y(0)], [X(i), Y(rows)], 'gf-grid');
  for (let j = 0; j <= rows; j++) b += line([X(0), Y(j)], [X(cols), Y(j)], 'gf-grid');
  for (const f of figs) {
    for (const qd of f.quads) b += `<polygon class="${f.cls}" points="${qd.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ')}"/>`;
    const all = f.quads.flat(), cx = all.reduce((t, p) => t + p[0], 0) / all.length, cy = all.reduce((t, p) => t + p[1], 0) / all.length;
    b += text([X(cx), Y(cy)], f.label, 'gf-tb');
  }
  b += extra.replace(/\{X:([-\d.]+)\}/g, (_, v) => X(Number(v)).toFixed(1)).replace(/\{Y:([-\d.]+)\}/g, (_, v) => Y(Number(v)).toFixed(1));
  return svgWrap(W, H, aria, b);
}
export const cellQuad = ([x, y]: Cell): Pt[] => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
export const gx = (x: number) => `{X:${x}}`, gy = (y: number) => `{Y:${y}}`;
export const gLine = (a: Pt, b: Pt, cls = 'gf-symax') => `<line class="${cls}" x1="${gx(a[0])}" y1="${gy(a[1])}" x2="${gx(b[0])}" y2="${gy(b[1])}"/>`;
export const gDot = (p: Pt, lab: string) => `<circle class="gf-pt" cx="${gx(p[0])}" cy="${gy(p[1])}" r="3.5"/><text class="gf-tb" x="${gx(p[0] + 0.45)}" y="${gy(p[1] + 0.45)}" text-anchor="middle" dominant-baseline="middle">${lab}</text>`;

/** Repère orthonormé de -R à R, points et éléments (axe, centre, vecteur). */
export function repereSvg(R: number, pts: { p: Pt; lab: string; cls?: string }[], extra: { lines?: [Pt, Pt, string][]; arrows?: [Pt, Pt][] } = {}, aria = ''): string {
  const s = 300 / (2 * R + 1), W = 320, H = 320, c = 160, X = (x: number) => c + x * s, Y = (y: number) => c - y * s;
  let b = '';
  for (let i = -R; i <= R; i++) { b += line([X(i), Y(-R - 0.4)], [X(i), Y(R + 0.4)], 'gf-grid') + line([X(-R - 0.4), Y(i)], [X(R + 0.4), Y(i)], 'gf-grid'); }
  b += line([X(-R - 0.4), Y(0)], [X(R + 0.4), Y(0)], 'gf-thin') + line([X(0), Y(-R - 0.4)], [X(0), Y(R + 0.4)], 'gf-thin');
  for (let i = -R; i <= R; i += 2) if (i !== 0) { b += text([X(i), Y(0) + 11], String(i).replace('-', '−'), 'gf-tick') + text([X(0) - 9, Y(i)], String(i).replace('-', '−'), 'gf-tick', 'end'); }
  b += text([X(0) - 8, Y(0) + 11], '0', 'gf-tick');
  for (const [a, bb, lab] of extra.lines ?? []) { b += line([X(a[0]), Y(a[1])], [X(bb[0]), Y(bb[1])], 'gf-symax'); if (lab) b += text([X(bb[0]) + 4, Y(bb[1]) + 10], lab, 'gf-ts', 'start'); }
  for (const [a, bb] of extra.arrows ?? []) { const [x1, y1, x2, y2] = [X(a[0]), Y(a[1]), X(bb[0]), Y(bb[1])], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; b += line([x1, y1], [x2, y2], 'gf-vec') + `<polygon class="gf-vech" points="${x2},${y2} ${(x2 - 9 * ux - 4 * uy).toFixed(1)},${(y2 - 9 * uy + 4 * ux).toFixed(1)} ${(x2 - 9 * ux + 4 * uy).toFixed(1)},${(y2 - 9 * uy - 4 * ux).toFixed(1)}"/>`; }
  for (const { p, lab, cls } of pts) b += dot([X(p[0]), Y(p[1])], 3.5, cls ?? 'gf-pt') + text([X(p[0]) + 9, Y(p[1]) - 9], lab, 'gf-tb', 'start');
  return svgWrap(W, H, aria, b);
}
