/**
 * Rédaction des résolutions dans le style du cours (méthode de la balance) :
 * on écrit l'opération faite sur les deux membres, puis l'équation obtenue.
 */
import { type Q, q, sub, div, neg, eq, isZero, isInt, ONE, sign, decimals, isDecimal } from './q';
import { type Expr, type Rel, type Equation, N, X, lin, term, sumE, tex, texQ, texRel, toLin, substitute, evaluate, relOpp, texEq, type NumStyle } from './expr';
import type { Rich } from './types';

const m = (s: string) => `$${s}$`;
/** Écriture d'un nombre « naturelle » : entier, décimal court, sinon fraction. */
export const nat = (v: Q): string => (isInt(v) ? texQ(v) : isDecimal(v) && decimals(v) <= 2 ? texQ(v, 'dec') : texQ(v));
/** Terme a·x pour un libellé (« $2x$ », « $x$ »). */
const texTerm = (a: Q, v: string, s: NumStyle) => tex(term(a, { k: 'v', name: v }, s));

export interface LinOpts {
  v?: string;
  /** Style des coefficients (décimaux affichés avec virgule). */
  style?: NumStyle;
  /** Écrire d'abord l'équation de départ. */
  start?: boolean;
}

/**
 * Résout L = R (ou L rel R) du premier degré, déjà développé (ou pas : on ne lit que la forme réduite
 * pour la suite). Renvoie les lignes rédigées et la valeur trouvée.
 */
export function linearLines(lhs: Expr, rhs: Expr, rel: Rel = '=', o: LinOpts = {}): { lines: Rich[]; x: Q; rel: Rel } {
  const v = o.v ?? 'x', st = o.style ?? 'auto';
  const V = { k: 'v', name: v } as Expr;
  const L = toLin(lhs, v), R = toLin(rhs, v);
  if (!L || !R) throw new Error('linearLines : expression non affine');
  const lines: Rich[] = [];
  let curL: Expr = lhs, curR: Expr = rhs;
  if (o.start) lines.push(m(`${tex(curL)} ${texRel(rel)} ${tex(curR)}`));
  let a = L.a, b = L.b, c = R.a, d = R.b;
  // 1) regrouper les x à gauche
  if (!isZero(c)) {
    const t = texTerm(c.n < 0 ? neg(c) : c, v, st);
    const opL = sumE(curL, term(neg(c), V, st)), opR = sumE(curR, term(neg(c), V, st));
    lines.push(`${m(`${tex(opL)} ${texRel(rel)} ${tex(opR)}`)} (on ${c.n > 0 ? 'soustrait' : 'ajoute'} ${m(t)} aux deux membres)`);
    a = sub(a, c);
    c = q(0);
    curL = lin(a, b, V, st);
    curR = N(d, st);
    lines.push(m(`${tex(curL)} ${texRel(rel)} ${tex(curR)}`));
  }
  // 2) isoler le terme en x
  if (!isZero(b)) {
    const t = nat(b.n < 0 ? neg(b) : b);
    const opL = sumE(curL, N(neg(b), st)), opR = sumE(curR, N(neg(b), st));
    lines.push(`${m(`${tex(opL)} ${texRel(rel)} ${tex(opR)}`)} (on ${b.n > 0 ? 'soustrait' : 'ajoute'} ${m(t)} aux deux membres)`);
    d = sub(d, b);
    b = q(0);
    curL = term(a, V, st);
    curR = N(d, st);
    lines.push(m(`${tex(curL)} ${texRel(rel)} ${nat(d)}`));
  }
  // 3) diviser par le coefficient
  if (isZero(a)) throw new Error('linearLines : coefficient nul');
  const x = div(d, a);
  let r = rel;
  if (!eq(a, ONE)) {
    const negA = a.n < 0;
    if (negA && rel !== '=') r = relOpp(rel);
    if (eq(a, q(-1))) {
      lines.push(`${m(`${v} ${texRel(r)} ${nat(x)}`)} (on multiplie les deux membres par ${m('-1')}${rel !== '=' ? ', négatif : on change le sens' : ''})`);
    } else {
      const fr = `\\dfrac{${nat(d)}}{${nat(a)}}`;
      const simpl = fr === nat(x) ? '' : ` = ${nat(x)}`;
      const why = rel === '=' ? `on divise les deux membres par ${m(nat(a))}` : negA ? `on divise par ${m(nat(a))}, négatif : on change le sens` : `on divise par ${m(nat(a))}, positif : même sens`;
      lines.push(`${m(`${v} ${texRel(r)} ${fr}${simpl}`)} (${why})`);
    }
  }
  return { lines, x, rel: r };
}

/** Ligne de vérification (« Vérification : 3 × 4 + 5 = 17 et 4 + 13 = 17 ✓ »). */
export function checkLine(E: Equation, env: Record<string, Q>, label = 'Vérification'): Rich {
  const l = evaluate(E.lhs, env), r = evaluate(E.rhs, env);
  const vals = Object.values(env);
  const simple = vals.every((x) => isInt(x) || (isDecimal(x) && decimals(x) <= 2));
  const isConst = (e: Expr) => e.k === 'n';
  if (simple) {
    const st: NumStyle = vals.every(isInt) ? 'auto' : 'dec';
    const sl = `${tex(substitute(E.lhs, env, st))} = ${nat(l)}`;
    const sr = isConst(E.rhs) ? '' : `${tex(substitute(E.rhs, env, st))} = ${nat(r)}`;
    if (E.rel === '=') return `${label} : ${m(sl)}${sr ? ` et ${m(sr)}` : ''} ✓`;
    return `${label} : ${m(sl)}${sr ? ` et ${m(sr)}` : ''}, et ${m(`${nat(l)} ${texRel(E.rel)} ${nat(r)}`)} ✓`;
  }
  const who = Object.entries(env).map(([k, x]) => `${k} = ${nat(x)}`).join(' ; ');
  if (E.rel === '=' && eq(l, r)) return `${label} : pour ${m(who)}, les deux membres valent ${m(nat(l))} ✓`;
  return `${label} : pour ${m(who)}, ${m(`${nat(l)} ${texRel(E.rel)} ${nat(r)}`)} ✓`;
}

export const solLine = (x: Q) => `La solution est ${m(nat(x))}.`;
export { m, sign, texEq, X };
