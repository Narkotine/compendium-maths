/** Outils communs aux générateurs du chapitre 5 (proportionnalité, pourcentages, échelles). */
import type { CourseLink } from '../engine/types';
import { type Q, q, toNum, isInt } from '../engine/q';
import { dn } from '../engine/build';
import { svgWrap, line, text, dot, pline } from '../engine/svg';

export const CH = '05-proportionalite-pourcentages';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Reconnaître la proportionnalité'),
  s12: sec('s1-2', '§ 1.2 · Le graphique'),
  s21: sec('s2-1', '§ 2.1 · Quatre méthodes'),
  s22: sec('s2-2', '§ 2.2 · Le produit en croix'),
  s3: sec('s3', '§ 3 · Grandeurs quotients'),
  s41: sec('s4-1', '§ 4.1 · Prendre un pourcentage'),
  s42: sec('s4-2', '§ 4.2 · Calculer un pourcentage'),
  s43: sec('s4-3', '§ 4.3 · Coefficient multiplicateur'),
  s44: sec('s4-4', '§ 4.4 · Évolutions successives, valeur de départ'),
  s5: sec('s5', '§ 5 · Ratios et partage'),
  s6: sec('s6', '§ 6 · Échelles'),
  serieH: sec('serie-H', 'Série H · Trouver l’erreur'),
};
/** Montant en euros : 12 ; 7,20 (deux décimales dès qu'il y a des centimes). */
export const eu = (v: Q) => (isInt(v) ? String(v.n) : toNum(v).toFixed(2).replace('.', '{,}'));
/** Nombre avec espaces des milliers (TeX). */
export const nb = (v: Q | number) => {
  const t = dn(typeof v === 'number' ? q(Math.round(v * 1e6), 1e6) : v);
  return t.replace(/^(-?)(\d+)/, (_, s: string, d: string) => s + (d.length >= 5 ? d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : d));
};
export const pct = (v: Q | number) => `${nb(v)}\\,\\%`;
/** Tableau de valeurs en TeX (deux lignes, en-têtes à gauche). */
export function tableTex(h1: string, h2: string, r1: string[], r2: string[]): string {
  const cols = 'c'.repeat(r1.length);
  return `\\begin{array}{|l|${cols.split('').join('|')}|}\\hline \\text{${h1}} & ${r1.join(' & ')} \\\\ \\hline \\text{${h2}} & ${r2.join(' & ')} \\\\ \\hline\\end{array}`;
}
/** Durée en heures décimales → « 1 h 45 min ». */
export function hm(hours: Q): string {
  const mins = Math.round(toNum(hours) * 60);
  const h = Math.floor(mins / 60), mn = mins % 60;
  return h === 0 ? `${mn}\\,\\text{min}` : mn === 0 ? `${h}\\,\\text{h}` : `${h}\\,\\text{h}\\,${String(mn).padStart(2, '0')}\\,\\text{min}`;
}

/**
 * Graphique dans un repère (à l'échelle) : axes gradués, quadrillage, points et éventuellement la droite.
 * xs/ys : graduations (pas), pts : points (x, y) en unités réelles.
 */
export function graphSvg(o: { every?: number; xMax: number; yMax: number; xStep: number; yStep: number; xLabel: string; yLabel: string; pts: [number, number][]; segment?: [[number, number], [number, number]] }): string {
  const W = 330, H = 250, x0 = 46, y0 = H - 36, w = W - x0 - 18, h = y0 - 22;
  const X = (x: number) => x0 + (x / o.xMax) * w, Y = (y: number) => y0 - (y / o.yMax) * h;
  let body = '';
  for (let x = o.xStep; x <= o.xMax + 1e-9; x += o.xStep) body += line([X(x), Y(0)], [X(x), Y(o.yMax)], 'gf-grid');
  for (let y = o.yStep; y <= o.yMax + 1e-9; y += o.yStep) body += line([X(0), Y(y)], [X(o.xMax), Y(y)], 'gf-grid');
  body += line([X(0), Y(0)], [X(o.xMax) + 8, Y(0)], 'gf-axis') + line([X(0), Y(0)], [X(0), Y(o.yMax) - 8], 'gf-axis');
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xStep) body += text([X(x), Y(0) + 15], fmt(x), 'gf-ts');
  for (let y = o.yStep, i = 1; y <= o.yMax + 1e-9; y += o.yStep, i++) if (i % (o.every ?? 1) === 0) body += text([X(0) - 6, Y(y)], fmt(y), 'gf-ts', 'end');
  body += text([X(o.xMax), Y(0) + 30], o.xLabel, 'gf-ts', 'end') + text([X(0) + 4, 12], o.yLabel, 'gf-ts', 'start');
  if (o.segment) body += pline([[X(o.segment[0][0]), Y(o.segment[0][1])], [X(o.segment[1][0]), Y(o.segment[1][1])]], 'gf-line');
  for (const [x, y] of o.pts) body += dot([X(x), Y(y)], 4);
  const aria = `Graphique : ${o.yLabel} en fonction de ${o.xLabel} ; ${o.segment ? 'une droite et ' : ''}${o.pts.length} points marqués`;
  return svgWrap(W, H, aria, body);
}
const fmt = (x: number) => (Math.round(x * 100) / 100).toString().replace('.', ',');
