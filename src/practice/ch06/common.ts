/** Outils communs aux générateurs du chapitre 6 (calcul littéral). */
import type { CourseLink, Rich, Step } from '../engine/types';
import { type Poly, pEq, polyTex, factorDegs, pTrim } from '../engine/algebra';
import { q, toNum } from '../engine/q';

export const CH = '06-calcul-litteral';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Une formule pour toutes les étapes'),
  s12: sec('s1-2', '§ 1.2 · Conventions d’écriture'),
  s2: sec('s2', '§ 2 · Calculer une expression'),
  s3: sec('s3', '§ 3 · Somme ou produit ?'),
  s4: sec('s4', '§ 4 · Réduire'),
  s51: sec('s5-1', '§ 5.1 · Distributivité simple'),
  s52: sec('s5-2', '§ 5.2 · Double distributivité'),
  s6: sec('s6', '§ 6 · Factoriser'),
  s7: sec('s7', '§ 7 · Identités remarquables'),
  s81: sec('s8-1', '§ 8.1 · Programmes de calcul'),
  s8: sec('s8-2', '§ 8.2 · Contre-exemple'),
};
export const m = (s: string) => `$${s}$`;
/** Polynôme à coefficients entiers, du degré 0 au degré n : P(c0, c1, c2). */
export const P = (...c: number[]): Poly => pTrim(c.map((x) => q(x)));
/** Écriture TeX développée réduite (degrés décroissants). */
export const pt = (p: Poly) => polyTex(p);
/** Entre parenthèses. */
export const par = (p: Poly) => `(${polyTex(p)})`;
/** Coefficient devant une parenthèse : 3( ; -( ; -2( ; ( pour 1. */
export const kpar = (k: number, p: Poly) => `${k === 1 ? '' : k === -1 ? '-' : k}(${polyTex(p)})`;
/** Polynôme en JavaScript (pour les valeurs attendues des tests). */
export const pjs = (p: Poly) => `(${p.map((c, d) => `(${toNum(c)})*x**${d}`).join(' + ')})`;
/** Affine ax + b en JavaScript. */
export const ljs = (a: number, b: number) => `(${a}*x + (${b}))`;

/** Étape « expression » : comparaison exacte + forme demandée ; erreurs typiques filtrées (≠ bonne réponse, sans doublon). */
export function exprStep(o: { prompt?: Rich; label: Rich; expect: Poly; form: 'dev' | 'fact' | 'any'; tex: string; hint: Rich; mistakes?: [Poly | null | undefined, Rich][] }): Step {
  const seen: Poly[] = [o.expect];
  const mistakes = [];
  for (const [v, msg] of o.mistakes ?? []) {
    if (!v || seen.some((s) => pEq(s, v))) continue;
    seen.push(v);
    mistakes.push({ on: 'expr' as const, value: v, msg });
  }
  return {
    prompt: o.prompt ?? '',
    answer: { kind: 'expr', v: 'x', expect: o.expect, form: o.form, tex: o.tex, label: o.label, ...(o.form === 'fact' ? { degs: factorDegs(o.tex) } : {}) },
    hint: o.hint,
    mistakes,
  };
}
/** Coefficient affiché devant x dans un produit écrit « à la main » : 3 × x ; (−2) × x. */
export const cx = (k: number) => (k < 0 ? `(${k})` : String(k));
