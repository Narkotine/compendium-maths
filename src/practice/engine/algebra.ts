/**
 * Saisie d'expressions algébriques (calcul littéral) : lecture tolérante de ce que tape l'élève
 * (« 3(2x+3) », « x²-6x+9 », « (x+5)(x-5) », « 2,5x − 1 »), calcul EXACT du polynôme obtenu
 * (coefficients rationnels) pour comparer avec la réponse attendue, et analyse de la FORME
 * (développée réduite ? produit ? factorisation complète ?).
 *
 * Deux expressions d'une variable de degré ≤ 6 sont égales pour tout x si et seulement si leurs
 * polynômes sont égaux : c'est la comparaison « par évaluation en plusieurs points », faite de façon exacte.
 */
import { type Q, q, add, sub, mul, div, neg, eq, isZero, gcd, toNum, ZERO, ONE } from './q';
import { texQ } from './expr';

export type Ast =
  | { k: 'num'; v: Q; dec: boolean }
  | { k: 'var' }
  | { k: 'add'; t: { s: 1 | -1; e: Ast }[] }
  | { k: 'mul'; f: Ast[]; op: ('impl' | 'x' | '/')[] }
  | { k: 'neg'; e: Ast }
  | { k: 'pow'; b: Ast; e: number }
  | { k: 'par'; e: Ast };

/** Polynôme : coefficients du degré 0 au degré n. */
export type Poly = Q[];
export const MAX_DEG = 6;

// ------------------------------------------------------------------ lecture
type Tok = { t: 'num'; v: Q; dec: boolean } | { t: 'var' } | { t: 'op'; v: string } | { t: '('; } | { t: ')' } | { t: 'pow'; v: number };
export type ParseResult = { ok: true; ast: Ast } | { ok: false; msg: string };

function tokenize(raw: string, v: string): Tok[] | string {
  const s = raw
    .replace(/[\u2212\u2012\u2013\u2014\u2010\u2011\uFE63\uFF0D]/g, '-')
    .replace(/[\u00A0\u202F\u2009\u2007]/g, ' ')
    .replace(/[×∙·⋅]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')');
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9]/.test(c) || ((c === ',' || c === '.') && /[0-9]/.test(s[i + 1] ?? ''))) {
      let j = i;
      while (j < s.length && /[0-9]/.test(s[j])) j++;
      let dec = false;
      if ((s[j] === ',' || s[j] === '.') && /[0-9]/.test(s[j + 1] ?? '')) {
        dec = true;
        j++;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
      }
      const txt = s.slice(i, j).replace(',', '.');
      const [a, b = ''] = txt.split('.');
      if (b.length > 8 || a.length > 9) return 'Nombre trop long.';
      out.push({ t: 'num', v: q(Number((a || '0') + b), 10 ** b.length), dec });
      i = j;
      continue;
    }
    if (c === v || (c.toLowerCase() === v && c !== c.toLowerCase())) { out.push({ t: 'var' }); i++; continue; }
    if (c === '²') { out.push({ t: 'pow', v: 2 }); i++; continue; }
    if (c === '³') { out.push({ t: 'pow', v: 3 }); i++; continue; }
    if (c === '^') {
      let j = i + 1;
      while (s[j] === ' ') j++;
      const m = /^\(?\s*([0-9])\s*\)?/.exec(s.slice(j));
      if (!m) return 'Après « ^ », écris un exposant entier (par exemple x^2).';
      out.push({ t: 'pow', v: Number(m[1]) });
      i = j + m[0].length;
      continue;
    }
    if ('+-*/'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === '(') { out.push({ t: '(' }); i++; continue; }
    if (c === ')') { out.push({ t: ')' }); i++; continue; }
    if (/[a-zA-Z]/.test(c)) return `Utilise la lettre $${v}$ (pas « ${c} »).`;
    if (c === ',' || c === '.') return 'Virgule mal placée : écris par exemple 2,5x.';
    if (c === '=') return 'Écris seulement l’expression, sans « = ».';
    return `Symbole non reconnu : « ${c} ».`;
  }
  return out;
}

/** Lit une expression d'une variable. */
export function parseExpr(raw: string, v = 'x'): ParseResult {
  const src = raw.trim().replace(new RegExp(`^[A-Z]\\s*=\\s*`), '');
  if (!src) return { ok: false, msg: 'Écris ton expression dans la case.' };
  const tk = tokenize(src, v);
  if (typeof tk === 'string') return { ok: false, msg: tk };
  let p = 0;
  const peek = () => tk[p];
  const fail = (msg: string): never => {
    throw new Error(msg);
  };
  const expr = (): Ast => {
    const t: { s: 1 | -1; e: Ast }[] = [];
    let s: 1 | -1 = 1;
    if (peek()?.t === 'op' && ((peek() as { v: string }).v === '-' || (peek() as { v: string }).v === '+')) {
      s = (tk[p++] as { v: string }).v === '-' ? -1 : 1;
    }
    t.push({ s, e: term() });
    while (peek()?.t === 'op' && ['+', '-'].includes((peek() as { v: string }).v)) {
      const o = (tk[p++] as { v: string }).v;
      if (peek()?.t === 'op' && ['+', '-'].includes((peek() as { v: string }).v)) fail('Deux signes de suite : mets le nombre négatif entre parenthèses, par exemple 3 − (−2).');
      t.push({ s: o === '-' ? -1 : 1, e: term() });
    }
    return t.length === 1 && t[0].s === 1 ? t[0].e : t.length === 1 ? { k: 'neg', e: t[0].e } : { k: 'add', t };
  };
  const term = (): Ast => {
    const f: Ast[] = [factor()];
    const op: ('impl' | 'x' | '/')[] = [];
    for (;;) {
      const n = peek();
      if (n?.t === 'op' && (n.v === '*' || n.v === '/')) {
        p++;
        op.push(n.v === '*' ? 'x' : '/');
        if (peek()?.t === 'op' && (peek() as { v: string }).v === '+') fail('Un signe « + » juste après « × » : il manque un nombre.');
        // « 3 × −2 » toléré
        if (peek()?.t === 'op' && (peek() as { v: string }).v === '-') {
          p++;
          f.push({ k: 'neg', e: factor() });
        } else f.push(factor());
        continue;
      }
      if (n && (n.t === 'var' || n.t === '(')) {
        op.push('impl');
        f.push(factor());
        continue;
      }
      if (n?.t === 'num' && (tk[p - 1]?.t === 'var' || tk[p - 1]?.t === ')')) fail(`Un nombre juste après ${tk[p - 1]?.t === 'var' ? 'la lettre' : 'une parenthèse'} : pour un carré, écris ${v}^2 ou utilise la touche ² ; pour un produit, mets le nombre devant (3${v}).`);
      if (n?.t === 'num') fail('Il manque un signe d’opération entre deux nombres (écris × si besoin).');
      break;
    }
    return f.length === 1 ? f[0] : { k: 'mul', f, op };
  };
  const factor = (): Ast => {
    let a = atom();
    while (peek()?.t === 'pow') {
      const e = (tk[p++] as { v: number }).v;
      if (e > MAX_DEG) fail('Exposant trop grand.');
      a = { k: 'pow', b: a, e };
    }
    return a;
  };
  const atom = (): Ast => {
    const t = tk[p++];
    if (!t) fail('L’expression est incomplète.');
    if (t.t === 'num') return { k: 'num', v: t.v, dec: t.dec };
    if (t.t === 'var') return { k: 'var' };
    if (t.t === '(') {
      const e = expr();
      if (tk[p]?.t !== ')') fail('Une parenthèse n’est pas fermée.');
      p++;
      return { k: 'par', e };
    }
    if (t.t === ')') fail('Parenthèse fermante en trop.');
    if (t.t === 'op' && (t.v === '-' || t.v === '+')) {
      const e = factor();
      return t.v === '-' ? { k: 'neg', e } : e;
    }
    if (t.t === 'pow') fail('Un exposant doit suivre un nombre, une lettre ou une parenthèse.');
    return fail('L’expression est incomplète.');
  };
  try {
    const ast = expr();
    if (p < tk.length) return { ok: false, msg: tk[p].t === ')' ? 'Parenthèse fermante en trop.' : 'Écriture non reconnue.' };
    return { ok: true, ast };
  } catch (e) {
    return { ok: false, msg: (e as Error).message };
  }
}

// ------------------------------------------------------------------ polynômes
export const pTrim = (a: Poly): Poly => {
  const b = [...a];
  while (b.length > 1 && isZero(b[b.length - 1])) b.pop();
  return b.length ? b : [ZERO];
};
export const pConst = (c: Q | number): Poly => [typeof c === 'number' ? q(c) : c];
export const pX: Poly = [ZERO, ONE];
export const pAdd = (a: Poly, b: Poly): Poly => pTrim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => add(a[i] ?? ZERO, b[i] ?? ZERO)));
export const pNeg = (a: Poly): Poly => a.map(neg);
export const pSub = (a: Poly, b: Poly) => pAdd(a, pNeg(b));
export const pMul = (a: Poly, b: Poly): Poly => {
  const r: Q[] = Array.from({ length: a.length + b.length - 1 }, () => ZERO);
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] = add(r[i + j], mul(x, y)))));
  return pTrim(r);
};
export const pPow = (a: Poly, e: number): Poly => {
  let r: Poly = [ONE];
  for (let i = 0; i < e; i++) r = pMul(r, a);
  return r;
};
export const pEq = (a: Poly, b: Poly) => {
  const x = pTrim(a), y = pTrim(b);
  return x.length === y.length && x.every((c, i) => eq(c, y[i]));
};
export const pDeg = (a: Poly) => pTrim(a).length - 1;
export const pEval = (a: Poly, x: Q) => a.reduceRight((acc, c) => add(mul(acc, x), c), ZERO);
/** Construit un polynôme à partir de coefficients entiers [c0, c1, c2…]. */
export const P = (...c: (number | Q)[]): Poly => pTrim(c.map((x) => (typeof x === 'number' ? q(x) : x)));

export function toPoly(a: Ast): Poly | null {
  switch (a.k) {
    case 'num':
      return [a.v];
    case 'var':
      return pX;
    case 'par':
      return toPoly(a.e);
    case 'neg': {
      const e = toPoly(a.e);
      return e && pNeg(e);
    }
    case 'add': {
      let r: Poly = [ZERO];
      for (const t of a.t) {
        const e = toPoly(t.e);
        if (!e) return null;
        r = t.s === 1 ? pAdd(r, e) : pSub(r, e);
      }
      return r;
    }
    case 'pow': {
      const b = toPoly(a.b);
      if (!b || pDeg(b) * a.e > MAX_DEG) return null;
      return pPow(b, a.e);
    }
    case 'mul': {
      let r = toPoly(a.f[0]);
      for (let i = 1; i < a.f.length && r; i++) {
        const f = toPoly(a.f[i]);
        if (!f) return null;
        if (a.op[i - 1] === '/') {
          if (pDeg(f) > 0 || isZero(f[0])) return null;
          r = r.map((c) => div(c, f[0]));
        } else r = pMul(r, f);
        if (pDeg(r) > MAX_DEG) return null;
      }
      return r;
    }
  }
}

// ------------------------------------------------------------------ forme
const strip = (a: Ast): Ast => (a.k === 'par' ? strip(a.e) : a);
const hasPar = (a: Ast): boolean =>
  a.k === 'par' ||
  (a.k === 'add' && a.t.some((t) => hasPar(t.e))) ||
  (a.k === 'mul' && a.f.some(hasPar)) ||
  (a.k === 'neg' && hasPar(a.e)) ||
  (a.k === 'pow' && hasPar(a.b));
/** Monôme écrit simplement : 3 ; x ; 3x ; x² ; 2,5x² ; −4x (un coefficient au plus, une puissance de x au plus). */
function monoDeg(a: Ast): number | null {
  if (a.k === 'neg') return monoDeg(a.e);
  if (a.k === 'num') return 0;
  if (a.k === 'var') return 1;
  if (a.k === 'pow' && a.b.k === 'var') return a.e;
  if (a.k === 'mul' && a.f.length === 2 && a.f[0].k === 'num' && a.op[0] !== '/') {
    const d = a.f[1].k === 'var' ? 1 : a.f[1].k === 'pow' && (a.f[1] as { b: Ast }).b.k === 'var' ? (a.f[1] as { e: number }).e : null;
    return d;
  }
  return null;
}
export type Shape = { sum: boolean; product: boolean; developed: boolean; reduced: boolean };
export function shapeOf(a0: Ast): Shape {
  const a = strip(a0);
  const terms = a.k === 'add' ? a.t.map((t) => t.e) : [a];
  const degs = terms.map(monoDeg);
  const developed = !hasPar(a0) && degs.every((d) => d !== null);
  const reduced = developed && new Set(degs).size === degs.length;
  const core = a.k === 'neg' ? strip(a.e) : a;
  const product = (core.k === 'mul' && core.op.every((o) => o !== '/') && monoDeg(core) === null) || (core.k === 'pow' && strip(core.b).k === 'add');
  return { sum: a.k === 'add', product, developed, reduced };
}
/** Facteurs non constants d'un produit (avec multiplicité) et vérification « complètement factorisé ». */
export function factorsOf(a0: Ast): Poly[] {
  const a = strip(a0);
  if (a.k === 'neg') return factorsOf(a.e);
  if (a.k === 'mul') return a.f.flatMap(factorsOf);
  if (a.k === 'pow') return Array.from({ length: a.e }, () => factorsOf(a.b)).flat();
  const p = toPoly(a);
  return p && pDeg(p) > 0 ? [p] : [];
}
/** Un facteur est « fini » si ses coefficients n'ont plus de facteur commun (entier ou x). */
export function factorDone(p: Poly): boolean {
  const t = pTrim(p);
  const nz = t.filter((c) => !isZero(c));
  if (nz.length <= 1) return true; // monôme : x, 2x, x² (déjà un produit simple)
  if (isZero(t[0])) return false; // x en facteur commun
  if (t.some((c) => c.d !== 1)) return true;
  return nz.reduce((g, c) => gcd(g, c.n), 0) === 1;
}

// ------------------------------------------------------------------ affichage
const texNum = (v: Q, dec: boolean) => (dec || v.d !== 1 ? (Number.isFinite(toNum(v)) && v.d !== 1 && /^(2|4|5|8|10|20|25|50|100|1000|10000)+$/.test(String(v.d)) ? String(toNum(v)).replace('.', '{,}') : texQ(v)) : String(v.n));
/** TeX de ce que l'élève a tapé (aperçu : il voit ce que l'appli a compris). */
export function astTex(a: Ast, v = 'x'): string {
  switch (a.k) {
    case 'num':
      return texNum(a.v, a.dec);
    case 'var':
      return v;
    case 'par':
      return `(${astTex(a.e, v)})`;
    case 'neg':
      return `-${astTex(a.e, v)}`;
    case 'pow':
      return `${a.b.k === 'num' || a.b.k === 'var' || a.b.k === 'par' ? astTex(a.b, v) : `{${astTex(a.b, v)}}`}^{${a.e}}`;
    case 'add':
      return a.t.map((t, i) => (i === 0 ? (t.s < 0 ? '-' : '') : t.s < 0 ? ' - ' : ' + ') + astTex(t.e, v)).join('');
    case 'mul':
      return a.f.map((f, i) => (i === 0 ? '' : a.op[i - 1] === 'x' ? ' \\times ' : a.op[i - 1] === '/' ? ' \\div ' : '') + astTex(f, v)).join('');
  }
}

/** TeX d'un polynôme sous forme développée réduite, degrés décroissants : 2x^2 - 5x + 3. */
export function polyTex(p: Poly, v = 'x', dec = true): string {
  const t = pTrim(p);
  const parts: string[] = [];
  for (let d = t.length - 1; d >= 0; d--) {
    const c = t[d];
    if (isZero(c)) continue;
    const a = c.n < 0 ? neg(c) : c;
    const num = dec ? texDec(a) : texQ(a);
    const body = d === 0 ? num : `${eq(a, ONE) ? '' : num}${v}${d > 1 ? `^{${d}}` : ''}`;
    parts.push(parts.length === 0 ? (c.n < 0 ? '-' : '') + body : (c.n < 0 ? ' - ' : ' + ') + body);
  }
  return parts.length ? parts.join('') : '0';
}
const texDec = (a: Q) => {
  if (a.d === 1) return String(a.n);
  let d = a.d, k = 0;
  while (d % 2 === 0) { d /= 2; k++; }
  let k5 = 0;
  while (d % 5 === 0) { d /= 5; k5++; }
  if (d === 1 && Math.max(k, k5) <= 3) return (a.n / a.d).toFixed(Math.max(k, k5)).replace('.', '{,}');
  return texQ(a);
};
/** Valeur d'un contrôle (x = 1, sinon 2, 3…) où deux polynômes diffèrent. */
export function witness(a: Poly, b: Poly): { x: number; va: Q; vb: Q } | null {
  for (const x of [1, 2, 3, -1, 10, 0]) {
    const va = pEval(a, q(x)), vb = pEval(b, q(x));
    if (!eq(va, vb)) return { x, va, vb };
  }
  return null;
}
/** Ce que taperait l'élève pour écrire une expression affichée en TeX (TeX → saisie). */
export function texToInput(t: string): string {
  return t
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '×')
    .replace(/\\,/g, '')
    .replace(/\{,\}/g, ',')
    .replace(/\^\{(\d)\}/g, '^$1')
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
/** Degrés des facteurs non constants d'une expression écrite en TeX (2x(x + 3) → [1, 1]). */
export function factorDegs(t: string, v = 'x'): number[] {
  const r = parseExpr(texToInput(t), v);
  if (!r.ok) throw new Error(`factorDegs : ${t} illisible (${r.msg})`);
  return factorsOf(r.ast).map(pDeg);
}
export { sub };
