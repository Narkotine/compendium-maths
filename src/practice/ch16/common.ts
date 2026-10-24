/** Outils du chapitre 16 : formatage, tableaux (TeX array), diagrammes à l'échelle (bâtons, circulaire, histogramme). */
import type { CourseLink, NumField, Rich } from '../engine/types';
import { q, toNum, type Q } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, line, text, type Pt } from '../engine/svg';

export const CH = '16-statistiques';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s1: sec('s1', '§ 1 · Vocabulaire et tableaux'), s21: sec('s2-1', '§ 2.1 · Diagramme en bâtons'), s22: sec('s2-2', '§ 2.2 · Diagramme circulaire'),
  s23: sec('s2-3', '§ 2.3 · Histogramme'), s24: sec('s2-4', '§ 2.4 · Choisir un graphique'), s31: sec('s3-1', '§ 3.1 · Moyenne'), s32: sec('s3-2', '§ 3.2 · Moyenne par classes'),
  s41: sec('s4-1', '§ 4.1 · Médiane'), s42: sec('s4-2', '§ 4.2 · Moyenne ou médiane ?'), s43: sec('s4-3', '§ 4.3 · Étendue'), s44: sec('s4-4', '§ 4.4 · Quartiles'), s45: sec('s4-5', '§ 4.5 · Boîte à moustaches'), s5: sec('s5', '§ 5 · Tableur'), s6: sec('s6', '§ 6 · Graphique trompeur'),
};
export const m = (s: string) => `$${s}$`;
const grp = (s: string) => s.replace(/^(-?)(\d+)/, (_, sg, d) => sg + (d.length >= 5 ? d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : d));
/** Décimal exact en TeX (milliers groupés à partir de 5 chiffres). */
export const dn = (v: Q) => grp(texQ(v, 'dec'));
export const ax = (v: number, dp: number) => grp(v.toFixed(dp).replace('.', '{,}'));
/** L'arrondi au 10^-dp n'est pas ambigu (loin d'un « 5 » pile). */
export const safe = (v: number, dp: number) => { const f = Math.abs(v * 10 ** dp) % 1; return Math.abs(f - 0.5) > 0.06; };
export const exactF = (label: Rich, v: Q, unit?: string): NumField => ({ label, unit, expect: v, form: 'any' });
export const approxF = (label: Rich, v: number, dp: number, unit?: string): NumField => ({ label, unit, expect: q(Math.round(v * 10 ** dp), 10 ** dp), form: 'any', approx: { value: v, tol: 0.5 * 10 ** -dp, dp }, shown: ax(v, dp) });
/** Valeur exacte si elle s'écrit avec au plus `dp` décimales, sinon arrondie. */
export const valF = (label: Rich, v: Q, dp: number, unit?: string): NumField => (isDec(v, dp) ? exactF(label, v, unit) : approxF(label, toNum(v), dp, unit));
export const isDec = (v: Q, dp: number) => (v.n * 10 ** dp) % v.d === 0;
/** Écriture « = 1,52 » ou « ≈ 13,3 ». */
export const eqOrApprox = (v: Q, dp: number) => (isDec(v, dp) ? `= ${dn(v)}` : `\\approx ${ax(toNum(v), dp)}`);
export const pct = (v: Q) => `${dn(v)}\\,\\%`;
/** Tableau statistique en TeX (lignes : en-tête + données). */
export function table(rows: string[][]): string {
  const n = rows[0].length;
  return `\\begin{array}{|l|${'c|'.repeat(n - 1)}}\\hline ${rows.map((r) => r.join(' & ')).join(' \\\\ \\hline ')} \\\\ \\hline\\end{array}`;
}
/** Texte simple dans un tableau TeX. */
export const tt = (s: string) => `\\text{${s}}`;

const W = 340;
/** Diagramme en bâtons (valeurs numériques ou catégories), axe vertical gradué depuis 0. */
export function barSvg(labels: string[], counts: number[], xTitle: string, yTitle = 'effectif', aria = ''): string {
  const H = 230, x0 = 46, y0 = 190, top = 26, mx = Math.max(...counts);
  const stp = mx <= 10 ? 1 : mx <= 20 ? 2 : 5, ymax = Math.ceil((mx + 0.5) / stp) * stp, k = (y0 - top) / ymax;
  const n = labels.length, gap = (W - x0 - 18) / n;
  let b = '';
  for (let v = 0; v <= ymax; v += stp) { const y = y0 - v * k; b += line([x0, y], [W - 12, y], 'gf-grid') + text([x0 - 8, y], String(v), 'gf-ts', 'end'); }
  b += line([x0, y0], [W - 12, y0], 'gf-axis') + line([x0, y0], [x0, top - 8], 'gf-axis');
  labels.forEach((l, i) => {
    const cx = x0 + gap * (i + 0.5);
    b += `<rect class="gf-bar" x="${(cx - 8).toFixed(1)}" y="${(y0 - counts[i] * k).toFixed(1)}" width="16" height="${(counts[i] * k).toFixed(1)}"/>`;
    b += text([cx, y0 + 14], l, 'gf-ts');
  });
  b += text([W - 12, y0 + 32], xTitle, 'gf-ts', 'end') + text([x0 - 36, 12], yTitle, 'gf-ts', 'start');
  return svgWrap(W, H + 6, aria || `Diagramme en bâtons : ${labels.map((l, i) => `${l} : ${counts[i]}`).join(', ')}`, b);
}
/** Diagramme circulaire : secteurs proportionnels aux effectifs, étiquettes à l'extérieur. */
export function pieSvg(labels: string[], counts: number[], aria = '', cls?: string[]): string {
  const H = 250, c: Pt = [W / 2, 125], r = 82, N = counts.reduce((s, v) => s + v, 0);
  let a = Math.PI / 2, b = '';
  const P = (t: number, rr = r): Pt => [c[0] + rr * Math.cos(t), c[1] - rr * Math.sin(t)];
  counts.forEach((v, i) => {
    const da = (2 * Math.PI * v) / N, s = P(a), e = P(a - da);
    b += `<path class="${cls?.[i] ?? `gf-s${i % 6}`}" d="M${c[0]},${c[1]} L${s[0].toFixed(1)},${s[1].toFixed(1)} A${r},${r} 0 ${da > Math.PI ? 1 : 0} 1 ${e[0].toFixed(1)},${e[1].toFixed(1)} Z"/>`;
    const mid = a - da / 2, lp = P(mid, r + 14);
    b += text(lp, labels[i], 'gf-ts', Math.cos(mid) > 0.25 ? 'start' : Math.cos(mid) < -0.25 ? 'end' : 'middle');
    a -= da;
  });
  return svgWrap(W, H, aria || `Diagramme circulaire : ${labels.map((l, i) => `${l} : ${counts[i]}`).join(', ')}`, b);
}
/** Histogramme : classes de même amplitude, rectangles accolés. */
export function histSvg(lo: number, amp: number, counts: number[], xTitle: string, aria = ''): string {
  const H = 230, x0 = 46, y0 = 190, top = 26, mx = Math.max(...counts);
  const stp = mx <= 10 ? 1 : mx <= 20 ? 2 : 5, ymax = Math.ceil((mx + 0.5) / stp) * stp, k = (y0 - top) / ymax;
  const n = counts.length, w = Math.min(56, (W - x0 - 30) / n);
  let b = '';
  for (let v = 0; v <= ymax; v += stp) { const y = y0 - v * k; b += line([x0, y], [W - 12, y], 'gf-grid') + text([x0 - 8, y], String(v), 'gf-ts', 'end'); }
  counts.forEach((v, i) => { b += `<rect class="gf-bar" x="${(x0 + 10 + i * w).toFixed(1)}" y="${(y0 - v * k).toFixed(1)}" width="${w.toFixed(1)}" height="${(v * k).toFixed(1)}"/>`; });
  for (let i = 0; i <= n; i++) b += text([x0 + 10 + i * w, y0 + 14], String(lo + i * amp), 'gf-ts');
  b += line([x0, y0], [W - 12, y0], 'gf-axis') + line([x0, y0], [x0, top - 8], 'gf-axis');
  b += text([W - 12, y0 + 32], xTitle, 'gf-ts', 'end') + text([x0 - 36, 12], 'effectif', 'gf-ts', 'start');
  return svgWrap(W, H + 6, aria || `Histogramme : ${counts.map((v, i) => `[${lo + i * amp} ; ${lo + (i + 1) * amp}[ : ${v}`).join(', ')}`, b);
}
/** Diagramme « trompeur » : deux barres, axe vertical commençant à `base`. */
export function twoBarSvg(years: string[], vals: number[], base: number, stp: number): string {
  const H = 210, x0 = 52, y0 = 176, top = 24, ymax = Math.ceil((Math.max(...vals) + 1) / stp) * stp, k = (y0 - top) / (ymax - base);
  let b = '';
  for (let v = base; v <= ymax; v += stp) { const y = y0 - (v - base) * k; b += line([x0, y], [W - 40, y], 'gf-grid') + text([x0 - 8, y], String(v), 'gf-ts', 'end'); }
  vals.forEach((v, i) => { const cx = x0 + 70 + i * 120; b += `<rect class="gf-bar" x="${cx - 26}" y="${(y0 - (v - base) * k).toFixed(1)}" width="52" height="${((v - base) * k).toFixed(1)}"/>` + text([cx, y0 + 14], years[i], 'gf-ts'); });
  b += line([x0, y0], [W - 40, y0], 'gf-axis') + line([x0, y0], [x0, top - 8], 'gf-axis');
  return svgWrap(W, H, `Diagramme en barres dont l’axe vertical commence à ${base} : ${years.map((y, i) => `${y} : ${vals[i]}`).join(', ')}`, b);
}
export { q, toNum, type Q };
