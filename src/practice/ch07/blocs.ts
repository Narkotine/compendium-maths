/**
 * Membres d'équation écrits comme sommes de « blocs » k·(ax + p) : de quoi afficher l'énoncé,
 * le développement, la forme réduite, et calculer les erreurs typiques de distributivité.
 */
import { type Q, q, add, mul, sub, div, eq, isZero } from '../engine/q';
import { type Expr, N, X, lin, term, sumE, prod, tex, toLin, type NumStyle } from '../engine/expr';
import type { Rich } from '../engine/types';

export interface Bloc {
  /** Facteur devant la parenthèse (1 : pas de parenthèse si `paren` est faux). */
  k: number;
  a: number;
  p: number;
  paren: boolean;
}
export const P = (k: number, a: number, p: number): Bloc => ({ k, a, p, paren: true });
export const T = (a: number, p = 0): Bloc => ({ k: 1, a, p, paren: false });
export const C = (p: number): Bloc => ({ k: 1, a: 0, p, paren: false });

export function blocExpr(b: Bloc, s: NumStyle = 'auto'): Expr {
  if (b.paren) return prod(N(b.k), lin(b.a, b.p, X, s));
  return lin(b.k * b.a, b.k * b.p, X, s);
}
export const sideExpr = (bs: Bloc[]) => sumE(...bs.map((b) => blocExpr(b)));
/** Développé, non réduit (k(ax + p) → kax + kp, dans l'ordre). */
export const sideExpanded = (bs: Bloc[]) => sumE(...bs.map((b) => lin(b.k * b.a, b.k * b.p)));
export const hasParen = (bs: Bloc[]) => bs.some((b) => b.paren);
/** Coefficient de x et constante. */
export const sideLin = (bs: Bloc[]) => ({ a: bs.reduce((s, b) => s + b.k * b.a, 0), b: bs.reduce((s, b) => s + b.k * b.p, 0) });

/** Lignes « on développe » puis « on réduit » ; renvoie aussi les membres réduits. */
export function expandLines(L: Bloc[], R: Bloc[]): { lines: Rich[]; lhs: Expr; rhs: Expr } {
  const lines: Rich[] = [];
  let lhs = sideExpr(L), rhs = sideExpr(R);
  if (hasParen(L) || hasParen(R)) {
    lhs = sideExpanded(L);
    rhs = sideExpanded(R);
    lines.push(`$${tex(lhs)} = ${tex(rhs)}$ (on développe)`);
  }
  const lr = sideLin(L), rr = sideLin(R);
  const redL = lin(lr.a, lr.b), redR = lin(rr.a, rr.b);
  if (tex(redL) !== tex(lhs) || tex(redR) !== tex(rhs)) {
    lhs = redL;
    rhs = redR;
    lines.push(`$${tex(lhs)} = ${tex(rhs)}$ (on réduit chaque membre)`);
  }
  return { lines, lhs, rhs };
}

/** Solution de (A x + B = C x + D), ou null si pas de solution unique. */
export function solveLin(A: number | Q, B: number | Q, Cc: number | Q, D: number | Q): Q | null {
  const t = (v: number | Q) => (typeof v === 'number' ? q(v) : v);
  const da = sub(t(A), t(Cc));
  if (isZero(da)) return null;
  return div(sub(t(D), t(B)), da);
}

/**
 * Erreurs de développement d'un bloc : distributivité partielle (k(ax + p) → kax + p),
 * erreur de signe avec un facteur négatif (−3(x − 2) → −3x − 6).
 */
export function distribMistakes(L: Bloc[], R: Bloc[]): [Q | null, Rich][] {
  const out: [Q | null, Rich][] = [];
  const sides = [L, R];
  sides.forEach((side, si) => {
    side.forEach((b, bi) => {
      if (!b.paren || b.p === 0) return;
      const variants: [number, Rich][] = [];
      const good = tex(lin(b.k * b.a, b.k * b.p));
      const orig = tex(blocExpr(b));
      if (Math.abs(b.k) !== 1) variants.push([b.p, `Attention à la distributivité : ${'$'}${orig} = ${good}${'$'}. On multiplie **chaque** terme de la parenthèse par ${'$'}${b.k}${'$'}.`]);
      if (b.k < 0) variants.push([-b.k * b.p, `Attention aux signes en développant : ${'$'}${orig} = ${good}${'$'} (le signe ${'$'}-${'$'} devant change le signe de **chaque** terme).`]);
      for (const [pp, msg] of variants) {
        const alt = sides.map((s, sj) => s.map((c, cj) => (sj === si && cj === bi ? { ...c, paren: false, k: 1, a: c.k * c.a, p: pp } : c)));
        const l = sideLin(alt[0]), r = sideLin(alt[1]);
        out.push([solveLin(l.a, l.b, r.a, r.b), msg]);
      }
    });
  });
  return out;
}
export { toLin, term, mul, add, eq };
