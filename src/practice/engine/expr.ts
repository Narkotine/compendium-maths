/**
 * Petites expressions algébriques (arbre) : un même objet sert à AFFICHER l'énoncé (TeX)
 * et à le CALCULER exactement (rationnels). Ce qui est montré à l'élève est donc ce qui est vérifié.
 */
import { type Q, q, add, mul, div, neg as qneg, isInt, sign, abs as qabs, ONE, sub, eq, isZero, decimals } from './q';

export type NumStyle = 'auto' | 'frac' | 'dec';
export type Expr =
  | { k: 'n'; v: Q; s?: NumStyle }
  | { k: 'v'; name: string }
  | { k: 'val'; v: Q; s?: NumStyle } // valeur substituée à une variable (vérification)
  | { k: 'add'; t: Expr[] }
  | { k: 'mul'; f: Expr[] }
  | { k: 'frac'; n: Expr; d: Expr }
  | { k: 'pow'; b: Expr; e: number }
  | { k: 'neg'; e: Expr };

export type Rel = '=' | '<' | '>' | '<=' | '>=';
export interface Equation {
  lhs: Expr;
  rhs: Expr;
  rel: Rel;
}

// ------------------------------------------------------------------ constructeurs
const toQ = (v: Q | number): Q => (typeof v === 'number' ? q(v) : v);
/** Nombre (entier ou fraction affichée en \dfrac). */
export const N = (v: Q | number, s: NumStyle = 'auto'): Expr => ({ k: 'n', v: toQ(v), s });
/** Nombre décimal affiché avec une virgule (1,2). */
export const D = (v: Q): Expr => ({ k: 'n', v, s: 'dec' });
export const V = (name = 'x'): Expr => ({ k: 'v', name });
export const X = V('x');
export const Y = V('y');
export const sumE = (...t: Expr[]): Expr => {
  const u = t.flatMap((e) => (e.k === 'add' ? e.t : [e])).filter((e) => !(e.k === 'n' && isZero(e.v)));
  return u.length === 0 ? N(0) : u.length === 1 ? u[0] : { k: 'add', t: u };
};
/** Somme entre parenthèses, gardée telle quelle (2(x + (x + 5))). */
export const group = (...t: Expr[]): Expr => ({ k: 'add', t });
export const prod = (...f: Expr[]): Expr => (f.length === 1 ? f[0] : { k: 'mul', f });
export const frac = (n: Expr, d: Expr): Expr => ({ k: 'frac', n, d });
export const pow = (b: Expr, e = 2): Expr => ({ k: 'pow', b, e });
export const negE = (e: Expr): Expr => ({ k: 'neg', e });
/** a·v (a = 0 : rien ; a = 1 : v ; a = −1 : −v). Style du coefficient : entier, fraction ou décimal. */
export const term = (a: Q | number, v: Expr = X, s: NumStyle = 'auto'): Expr => prod(N(a, s), v);
/** a·x + b, avec les termes nuls omis. */
export const lin = (a: Q | number, b: Q | number, v: Expr = X, s: NumStyle = 'auto'): Expr =>
  sumE(...(isZero(toQ(a)) ? [] : [term(a, v, s)]), N(b, s));
export const eqn = (lhs: Expr, rhs: Expr, rel: Rel = '='): Equation => ({ lhs, rhs, rel });

// ------------------------------------------------------------------ calcul exact
export function evaluate(e: Expr, env: Record<string, Q>): Q {
  switch (e.k) {
    case 'n':
    case 'val':
      return e.v;
    case 'v': {
      const v = env[e.name];
      if (!v) throw new Error(`variable ${e.name} non définie`);
      return v;
    }
    case 'add':
      return e.t.reduce((s, t) => add(s, evaluate(t, env)), q(0));
    case 'mul':
      return e.f.reduce((s, t) => mul(s, evaluate(t, env)), ONE);
    case 'frac':
      return div(evaluate(e.n, env), evaluate(e.d, env));
    case 'pow': {
      let r = ONE;
      const b = evaluate(e.b, env);
      for (let i = 0; i < e.e; i++) r = mul(r, b);
      return r;
    }
    case 'neg':
      return qneg(evaluate(e.e, env));
  }
}
export const holds = (r: Rel, a: Q, b: Q) => {
  const d = sign(sub(a, b));
  return r === '=' ? d === 0 : r === '<' ? d < 0 : r === '>' ? d > 0 : r === '<=' ? d <= 0 : d >= 0;
};
export const satisfies = (E: Equation, env: Record<string, Q>) => holds(E.rel, evaluate(E.lhs, env), evaluate(E.rhs, env));

/** Forme réduite a·x + b d'une expression du premier degré en `v` (null si elle ne l'est pas). */
export function toLin(e: Expr, v = 'x'): { a: Q; b: Q } | null {
  const f = (t: number) => evaluate(e, { [v]: q(t) });
  try {
    const b = f(0), a = sub(f(1), b);
    for (const t of [2, -3, 7]) if (!eq(f(t), add(mul(a, q(t)), b))) return null;
    return { a, b };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ affichage TeX
/** Nombre en TeX : -4 ; 2{,}5 ; \dfrac{7}{3} ; -\dfrac{7}{3}. */
export function texQ(v: Q, s: NumStyle = 'auto'): string {
  const minus = v.n < 0 ? '-' : '';
  const a = qabs(v);
  if (isInt(a)) return minus + a.n;
  if (s === 'dec' || (s === 'auto' && false)) {
    const k = decimals(a);
    if (Number.isFinite(k)) return minus + (a.n / a.d).toFixed(k).replace('.', '{,}');
  }
  return `${minus}\\dfrac{${a.n}}{${a.d}}`;
}
/** Nombre en TeX, en décimal si l'écriture décimale est courte (≤ 2 chiffres), sinon en fraction. */
export const texQd = (v: Q) => texQ(v, Number.isFinite(decimals(v)) && decimals(v) <= 2 ? 'dec' : 'frac');
/** Nombre entre parenthèses s'il est négatif (après × ou −). */
export const texQp = (v: Q, s: NumStyle = 'auto') => (v.n < 0 ? `\\left(${texQ(v, s)}\\right)` : texQ(v, s));

const isNumLike = (e: Expr) => e.k === 'n' || e.k === 'val';
/** Le terme s'affiche-t-il avec un signe moins devant ? */
function isNegTerm(e: Expr): boolean {
  if (e.k === 'n') return e.v.n < 0;
  if (e.k === 'neg') return true;
  if (e.k === 'mul') return e.f[0].k === 'n' && e.f[0].v.n < 0;
  if (e.k === 'frac') return isNegTerm(e.n) && e.n.k !== 'add';
  return false;
}
/** Opposé d'un terme « négatif » (pour l'écrire après un signe −). */
function negTerm(e: Expr): Expr {
  if (e.k === 'n') return { ...e, v: qneg(e.v) };
  if (e.k === 'neg') return e.e;
  if (e.k === 'mul') return { k: 'mul', f: [{ ...(e.f[0] as { k: 'n'; v: Q; s?: NumStyle }), v: qneg((e.f[0] as { v: Q }).v) }, ...e.f.slice(1)] };
  if (e.k === 'frac') return { k: 'frac', n: negTerm(e.n), d: e.d };
  return e;
}
const paren = (s: string) => `(${s})`;
const bigParen = (s: string) => `\\left(${s}\\right)`;

export function tex(e: Expr): string {
  switch (e.k) {
    case 'n':
      return texQ(e.v, e.s);
    case 'val':
      return texQ(e.v, e.s);
    case 'v':
      return e.name;
    case 'frac':
      return `\\dfrac{${tex(e.n)}}{${tex(e.d)}}`;
    case 'pow': {
      const b = e.b.k === 'v' ? tex(e.b) : e.b.k === 'val' ? (e.b.v.n < 0 || !isInt(e.b.v) ? bigParen(tex(e.b)) : tex(e.b)) : paren(tex(e.b));
      return `${b}^{${e.e}}`;
    }
    case 'neg': {
      const inner = tex(e.e);
      const needs = e.e.k === 'add' || isNegTerm(e.e) || (e.e.k === 'val' && e.e.v.n < 0);
      return '-' + (needs ? (e.e.k === 'val' ? bigParen(inner) : paren(inner)) : inner);
    }
    case 'add': {
      let s = '';
      e.t.forEach((t, i) => {
        const inner = t.k === 'add' ? paren(tex(t)) : null;
        const safe = (x: string) => (x.startsWith('-') ? bigParen(x) : x);
        if (i === 0) s += inner ?? tex(t);
        else if (t.k === 'val') s += ' + ' + safe(tex(t));
        else if (isNegTerm(t)) s += ' - ' + safe(tex(negTerm(t)));
        else s += ' + ' + (inner ?? safe(tex(t)));
      });
      return s;
    }
    case 'mul':
      return texMul(e.f);
  }
}

function texMul(f: Expr[]): string {
  let out = '';
  let i = 0;
  // coefficient numérique en tête
  if (f[0].k === 'n' && f.length > 1) {
    const c = f[0].v, st = f[0].s;
    const next = f[1];
    if (next.k === 'val' && f.length === 2) {
      // valeur substituée : x → 4 ; −x → −(−4) ; 3x → 3 × (−4)
      if (eq(c, ONE)) return tex(next);
      if (eq(c, q(-1))) return '-' + (next.v.n < 0 || !isInt(next.v) ? bigParen(tex(next)) : tex(next));
      return texQ(c, st) + ' \\times ' + texQp(next.v, next.s);
    }
    if (isNumLike(next)) {
      // 3 × 4 (calcul) : les facteurs suivants sont tous écrits avec ×
      return f.map((x, j) => (j > 0 && (x.k === 'n' || x.k === 'val') ? texQp(x.v, x.s) : j > 0 && x.k === 'add' ? paren(tex(x)) : tex(x))).join(' \\times ');
    }
    if (eq(c, ONE)) out = '';
    else if (eq(c, q(-1))) out = '-';
    else out = texQ(c, st);
    i = 1;
  }
  for (; i < f.length; i++) {
    const x = f[i];
    const prev = i > 0 ? f[i - 1] : null;
    if (x.k === 'val') {
      // valeur substituée dans un produit : 3 × (−4), (−4) × (…)
      const coefShown = out !== '' && out !== '-';
      if (coefShown) out += ' \\times ' + texQp(x.v, x.s);
      else if (out === '-') out += x.v.n < 0 || !isInt(x.v) ? bigParen(tex(x)) : tex(x);
      else out += texQp(x.v, x.s);
      if (i < f.length - 1) out += ' \\times ';
      continue;
    }
    if (prev?.k === 'val' && (x.k === 'add' || x.k === 'neg')) {
      out += paren(tex(x));
      continue;
    }
    if (x.k === 'add') out += paren(tex(x));
    else if (x.k === 'neg') out += paren(tex(x));
    else if (x.k === 'n') out += (out ? ' \\times ' : '') + (out ? texQp(x.v, x.s) : texQ(x.v, x.s));
    else if (x.k === 'frac' && out && out !== '-') out += ' \\times ' + tex(x);
    else {
      // facteur commençant par un chiffre (3x) après un autre facteur : x × 3x, pas « x3x »
      const t = tex(x);
      out += out && out !== '-' && /^\d/.test(t) ? ' \\times ' + t : t;
    }
  }
  return out;
}

export const texRel = (r: Rel) => ({ '=': '=', '<': '<', '>': '>', '<=': '\\leqslant', '>=': '\\geqslant' })[r];
export const texEq = (E: Equation) => `${tex(E.lhs)} ${texRel(E.rel)} ${tex(E.rhs)}`;

/** Remplace les variables par des valeurs (affichage d'une vérification : 3 × (−4) + 5). */
export function substitute(e: Expr, env: Record<string, Q>, s: NumStyle = 'auto'): Expr {
  switch (e.k) {
    case 'v':
      return { k: 'val', v: env[e.name], s };
    case 'n':
    case 'val':
      return e;
    case 'add':
      return { k: 'add', t: e.t.map((t) => substitute(t, env, s)) };
    case 'mul':
      return { k: 'mul', f: e.f.map((t) => substitute(t, env, s)) };
    case 'frac':
      return { k: 'frac', n: substitute(e.n, env, s), d: substitute(e.d, env, s) };
    case 'pow':
      return { k: 'pow', b: substitute(e.b, env, s), e: e.e };
    case 'neg':
      return { k: 'neg', e: substitute(e.e, env, s) };
  }
}
export const relOpp = (r: Rel): Rel => ({ '=': '=', '<': '>', '>': '<', '<=': '>=', '>=': '<=' })[r] as Rel;
export const relNot = (r: Rel): Rel => ({ '=': '=', '<': '>=', '>': '<=', '<=': '>', '>=': '<' })[r] as Rel;
export const isStrict = (r: Rel) => r === '<' || r === '>';
export { add as qadd };
