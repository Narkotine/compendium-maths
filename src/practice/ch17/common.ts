/** Outils du chapitre 17 : liens, probabilités exactes (fractions irréductibles), arbre de probabilités en SVG. */
import type { CourseLink, NumField, Rich } from '../engine/types';
import { q, toNum, isInt, type Q } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, line, text, type Pt } from '../engine/svg';

export const CH = '17-probabilites';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s1: sec('s1', '§ 1 · Vocabulaire'), s21: sec('s2-1', '§ 2.1 · Échelle des probabilités'), s22: sec('s2-2', '§ 2.2 · Équiprobabilité'), s23: sec('s2-3', '§ 2.3 · Roue'),
  s3: sec('s3', '§ 3 · Règles de calcul'), s41: sec('s4-1', '§ 4.1 · Arbre'), s42: sec('s4-2', '§ 4.2 · Avec ou sans remise'), s43: sec('s4-3', '§ 4.3 · Tableau à double entrée'),
  s5: sec('s5', '§ 5 · « Au moins un »'), s6: sec('s6', '§ 6 · Fréquence et probabilité'),
};
export const m = (s: string) => `$${s}$`;
/** Fraction (ou entier) en TeX. */
export const fq = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n < 0 ? '-' : ''}\\dfrac{${Math.abs(v.n)}}{${v.d}}`);
/** Fraction non simplifiée a/b en TeX. */
export const fr = (a: number, b: number) => `\\dfrac{${a}}{${b}}`;
/** « = 3/6 = 1/2 » : fraction brute, puis simplifiée si différente. */
export const frs = (a: number, b: number) => { const v = q(a, b); return v.d === b ? fr(a, b) : `${fr(a, b)} = ${fq(v)}`; };
export const dn = (v: Q) => texQ(v, 'dec');
/** Case « probabilité » : fraction irréductible (ou décimal exact) ; entier (0 ou 1) accepté tel quel. */
export const probF = (label: Rich, v: Q, unit?: string): NumField => (isInt(v) ? { label, unit, expect: v, form: 'any' } : { label, unit, expect: v, form: 'irreducible', decimalOk: true });
export const exactF = (label: Rich, v: Q, unit?: string): NumField => ({ label, unit, expect: v, form: 'any' });
export const P = (s: string) => `P(\\text{${s}})`;

/** Arbre à deux niveaux (gauche → droite) : branches étiquetées par issue et probabilité (texte simple « 4/10 »). */
export function treeSvg(first: [string, string][], second: [string, string][][], aria: string): string {
  const leaves = second.reduce((s, b) => s + b.length, 0), W = 340, rowH = 34, H = leaves * rowH + 16;
  const x0 = 18, x1 = 150, x2 = 290;
  let b = '', row = 0;
  const root: Pt = [x0, H / 2];
  first.forEach(([lab, p], i) => {
    const kids = second[i], yMid = 8 + (row + kids.length / 2) * rowH, node: Pt = [x1, yMid];
    b += line(root, [node[0] - 12, node[1]], 'gf-thin') + text([node[0], node[1]], lab, 'gf-tb');
    b += text([(root[0] + node[0]) / 2 - 4, (root[1] + node[1]) / 2 - 9], p, 'gf-ts');
    kids.forEach(([l2, p2]) => {
      const leaf: Pt = [x2, 8 + (row + 0.5) * rowH];
      b += line([node[0] + 12, node[1]], [leaf[0] - 12, leaf[1]], 'gf-thin') + text(leaf, l2, 'gf-tb');
      b += text([(node[0] + leaf[0]) / 2 + 2, (node[1] + leaf[1]) / 2 - 8], p2, 'gf-ts');
      row++;
    });
  });
  return svgWrap(W, H, aria, b);
}
export { q, toNum, isInt, type Q };
