/**
 * Moteur de la calculatrice (sans eval) : lecture, calcul et mise en forme.
 * - Nombres exacts (fractions de BigInt) tant que possible : 0,1 + 0,2 = 0,3, entiers exacts ;
 *   √ d'un carré parfait, puissances entières restent exactes. π, √2, trigonométrie : flottants.
 * - Priorités : ( ) ; fonctions, √ et ² (postfixe) ; ^ (à droite) ; moins unaire ; × ÷ (et multiplication
 *   implicite : 2√3, 2(3+4), 2π, (1+2)(3+4)) ; + −.  −3² = −9, (−3)² = 9, 2^−1 = 0,5.
 * - Saisie au clavier : sqrt( racine( ^2 ** * / : x . acceptés ; Ans = résultat précédent.
 */

export type Val = { q: [bigint, bigint] } | { f: number };
export type Ast =
  | { t: 'num'; v: Val; src: string }
  | { t: 'pi' }
  | { t: 'ans' }
  | { t: 'neg'; a: Ast }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Ast; b: Ast; implicit?: boolean }
  | { t: 'sq'; a: Ast; p: 2 | 3 }
  | { t: 'fn'; f: Fn; a: Ast; paren: boolean };
export type Fn = 'sqrt' | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan';
export class CalcError extends Error {}

// ------------------------------------------------------------------ jetons
type Tok = { k: 'num'; s: string } | { k: 'op'; s: string } | { k: 'fn'; s: Fn } | { k: 'pi' } | { k: 'ans' } | { k: '(' } | { k: ')' } | { k: 'pow'; p: 2 | 3 };
const FN_NAMES: [RegExp, Fn][] = [
  [/^(sqrt|racine|rac)/i, 'sqrt'],
  [/^(arcsin|asin|sin⁻¹|sin\^-1|sin-1)/i, 'asin'],
  [/^(arccos|acos|cos⁻¹|cos\^-1|cos-1)/i, 'acos'],
  [/^(arctan|atan|tan⁻¹|tan\^-1|tan-1)/i, 'atan'],
  [/^sin/i, 'sin'],
  [/^cos/i, 'cos'],
  [/^tan/i, 'tan'],
];
const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };

export function tokenize(src: string): Tok[] {
  const s = src.replace(/[−–]/g, '-').replace(/\u00a0|\u202f/g, ' ');
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9.,]/.test(c)) {
      let j = i, seenSep = false, txt = '';
      while (j < s.length) {
        const d = s[j];
        if (/[0-9]/.test(d)) { txt += d; j++; }
        else if ((d === ',' || d === '.') && !seenSep && /[0-9]/.test(s[j + 1] ?? '')) { seenSep = true; txt += '.'; j++; }
        else if ((d === ',' || d === '.') && !seenSep && txt) { seenSep = true; txt += '.'; j++; } // « 3, » : 3
        else if (d === ' ' && !seenSep && /^ \d{3}(?!\d)/.test(s.slice(j)) && /\d$/.test(txt)) { j++; } // 1 000
        else break;
      }
      if (txt === '' || txt === '.') throw new CalcError('Virgule mal placée.');
      if (txt.endsWith('.')) txt = txt.slice(0, -1);
      out.push({ k: 'num', s: txt });
      i = j;
      continue;
    }
    if (c in SUP) {
      let j = i, e = '';
      while (j < s.length && s[j] in SUP) e += SUP[s[j++]];
      if (e === '2' || e === '3') out.push({ k: 'pow', p: Number(e) as 2 | 3 });
      else { if (!/^-?\d+$/.test(e)) throw new CalcError('Exposant mal écrit.'); out.push({ k: 'op', s: '^' }, ...(e.startsWith('-') ? [{ k: 'op', s: '-' } as Tok] : []), { k: 'num', s: e.replace('-', '') }); }
      i = j;
      continue;
    }
    if (s.startsWith('**', i)) { out.push({ k: 'op', s: '^' }); i += 2; continue; }
    if ('+-*/^×÷:·'.includes(c)) { out.push({ k: 'op', s: c === '×' || c === '·' ? '*' : c === '÷' || c === ':' ? '/' : c }); i++; continue; }
    if (c === '(' || c === '[') { out.push({ k: '(' }); i++; continue; }
    if (c === ')' || c === ']') { out.push({ k: ')' }); i++; continue; }
    if (c === '√') { out.push({ k: 'fn', s: 'sqrt' }); i++; continue; }
    if (c === 'π') { out.push({ k: 'pi' }); i++; continue; }
    const rest = s.slice(i);
    if (/^pi/i.test(rest)) { out.push({ k: 'pi' }); i += 2; continue; }
    if (/^ans/i.test(rest)) { out.push({ k: 'ans' }); i += 3; continue; }
    const fn = FN_NAMES.find(([re]) => re.test(rest));
    if (fn) { out.push({ k: 'fn', s: fn[1] }); i += rest.match(fn[0])![0].length; continue; }
    if ((c === 'x' || c === 'X') && out.length && (out[out.length - 1].k === 'num' || out[out.length - 1].k === ')')) { out.push({ k: 'op', s: '*' }); i++; continue; }
    throw new CalcError(`Symbole inconnu : « ${c} ».`);
  }
  return out;
}

// ------------------------------------------------------------------ analyse (descente récursive)
export function parse(src: string): Ast {
  const toks = tokenize(src);
  if (!toks.length) throw new CalcError('Rien à calculer.');
  let p = 0;
  const peek = () => toks[p];
  const isOp = (s: string) => peek()?.k === 'op' && (peek() as { s: string }).s === s;
  const startsPrimary = (t: Tok | undefined) => !!t && (t.k === 'num' || t.k === '(' || t.k === 'pi' || t.k === 'ans' || t.k === 'fn');
  const sum = (): Ast => {
    let a = term();
    while (isOp('+') || isOp('-')) { const op = (toks[p++] as { s: '+' | '-' }).s; a = { t: 'bin', op, a, b: term() }; }
    return a;
  };
  const term = (): Ast => {
    let a = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) { const op = (toks[p++] as { s: '*' | '/' }).s; a = { t: 'bin', op, a, b: unary() }; }
      else if (startsPrimary(peek())) a = { t: 'bin', op: '*', a, b: power(), implicit: true };
      else return a;
    }
  };
  const unary = (): Ast => {
    if (isOp('-')) { p++; return { t: 'neg', a: unary() }; }
    if (isOp('+')) { p++; return unary(); }
    return power();
  };
  const power = (): Ast => {
    const a = postfix();
    if (isOp('^')) { p++; if (!peek()) throw new CalcError('Exposant manquant après ^.'); return { t: 'bin', op: '^', a, b: unary() }; }
    return a;
  };
  const postfix = (): Ast => {
    let a = primary();
    while (peek()?.k === 'pow') a = { t: 'sq', a, p: (toks[p++] as { p: 2 | 3 }).p };
    return a;
  };
  const primary = (): Ast => {
    const t = toks[p];
    if (!t) throw new CalcError('Calcul incomplet : il manque un nombre à la fin.');
    p++;
    switch (t.k) {
      case 'num': return { t: 'num', v: decimal(t.s), src: t.s };
      case 'pi': return { t: 'pi' };
      case 'ans': return { t: 'ans' };
      case '(': {
        if (peek()?.k === ')') throw new CalcError('Parenthèses vides.');
        const e = sum();
        if (peek()?.k !== ')') throw new CalcError(peek() ? 'Calcul mal écrit.' : 'Parenthèse manquante : ferme la parenthèse.');
        p++;
        return e;
      }
      case 'fn': {
        if (peek()?.k === '(') return { t: 'fn', f: t.s, a: primary(), paren: true };
        if (!peek()) throw new CalcError(t.s === 'sqrt' ? 'Il manque un nombre après √.' : `Il manque un nombre après ${t.s}.`);
        // sans parenthèses : √108, √2π ? on prend le nombre (et un éventuel moins) : √−4 → erreur claire
        if (isOp('-')) { p++; return { t: 'fn', f: t.s, a: { t: 'neg', a: postfix() }, paren: false }; }
        return { t: 'fn', f: t.s, a: primary(), paren: false };
      }
      case ')': throw new CalcError('Parenthèse fermante en trop.');
      case 'pow': throw new CalcError('Il manque un nombre avant le carré.');
      default: throw new CalcError(`Il manque un nombre avant « ${(t as { s: string }).s.replace('*', '×').replace('/', '÷').replace('-', '−')} ».`);
    }
  };
  const e = sum();
  if (p < toks.length) throw new CalcError(toks[p].k === ')' ? 'Parenthèse fermante en trop.' : 'Calcul mal écrit.');
  return e;
}

// ------------------------------------------------------------------ arithmétique exacte / approchée
const gcd = (a: bigint, b: bigint): bigint => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Qv = (n: bigint, d: bigint): Val => { if (d === 0n) throw new CalcError('Division par zéro.'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return big(n / g) || big(d / g) ? { f: Number(n) / Number(d) } : { q: [n / g, d / g] }; };
const LIMIT = 10n ** 60n;
const big = (x: bigint) => x > LIMIT || x < -LIMIT;
function decimal(s: string): Val {
  const [i, f = ''] = s.split('.');
  return Qv(BigInt(i + f || '0'), 10n ** BigInt(f.length));
}
export const num = (v: Val) => ('q' in v ? Number(v.q[0]) / Number(v.q[1]) : v.f);
const isQ = (v: Val): v is { q: [bigint, bigint] } => 'q' in v;
const F = (x: number): Val => { if (!Number.isFinite(x)) throw new CalcError('Résultat trop grand.'); return { f: x }; };
function isqrt(n: bigint): bigint { if (n < 2n) return n; let x = BigInt(Math.floor(Math.sqrt(Number(n)))); while (x * x > n) x--; while ((x + 1n) * (x + 1n) <= n) x++; return x; }

function add(a: Val, b: Val, sgn: 1n | -1n): Val { return isQ(a) && isQ(b) ? Qv(a.q[0] * b.q[1] + sgn * b.q[0] * a.q[1], a.q[1] * b.q[1]) : F(num(a) + Number(sgn) * num(b)); }
function mul(a: Val, b: Val): Val { return isQ(a) && isQ(b) ? Qv(a.q[0] * b.q[0], a.q[1] * b.q[1]) : F(num(a) * num(b)); }
function div(a: Val, b: Val): Val { if (num(b) === 0) throw new CalcError('Division par zéro.'); return isQ(a) && isQ(b) ? Qv(a.q[0] * b.q[1], a.q[1] * b.q[0]) : F(num(a) / num(b)); }
function pow(a: Val, b: Val): Val {
  if (isQ(b) && b.q[1] === 1n && isQ(a)) {
    const e = b.q[0], ae = e < 0n ? -e : e;
    if (a.q[0] === 0n && e < 0n) throw new CalcError('Division par zéro : 0 n’a pas de puissance négative.');
    if (a.q[0] === 0n && e === 0n) throw new CalcError('0⁰ n’est pas défini.');
    const bits = Math.abs(Number(ae)) * Math.log2(Math.max(2, Math.abs(Number(a.q[0])), Number(a.q[1])));
    if (bits < 190) { const n = a.q[0] ** ae, d = a.q[1] ** ae; return e < 0n ? Qv(d, n) : Qv(n, d); }
  }
  const x = num(a), y = num(b);
  if (x < 0 && !Number.isInteger(y)) throw new CalcError('Puissance non entière d’un nombre négatif.');
  if (x === 0 && y < 0) throw new CalcError('Division par zéro : 0 n’a pas de puissance négative.');
  return F(Math.pow(x, y));
}
function sqrt(a: Val): Val {
  if (num(a) < 0) throw new CalcError('Racine d’un nombre négatif : impossible.');
  if (isQ(a)) { const rn = isqrt(a.q[0]), rd = isqrt(a.q[1]); if (rn * rn === a.q[0] && rd * rd === a.q[1]) return Qv(rn, rd); }
  return F(Math.sqrt(num(a)));
}
// trigonométrie en degrés, valeurs exactes aux angles remarquables
const R = Math.PI / 180;
function trig(f: Fn, a: Val): Val {
  const x = num(a);
  if (f === 'sin' || f === 'cos' || f === 'tan') {
    const deg = isQ(a) && a.q[1] === 1n ? Number(((a.q[0] % 360n) + 360n) % 360n) : null;
    if (deg !== null) {
      const s = f === 'cos' ? (deg + 90) % 360 : deg; // cos x = sin(x + 90)
      if (f !== 'tan') { const T: Record<number, Val> = { 0: Qv(0n, 1n), 30: Qv(1n, 2n), 90: Qv(1n, 1n), 150: Qv(1n, 2n), 180: Qv(0n, 1n), 210: Qv(-1n, 2n), 270: Qv(-1n, 1n), 330: Qv(-1n, 2n) }; if (s in T) return T[s]; }
      else { if (deg % 180 === 90) throw new CalcError(`tan(${deg}°) n’existe pas.`); const T: Record<number, Val> = { 0: Qv(0n, 1n), 45: Qv(1n, 1n), 135: Qv(-1n, 1n), 180: Qv(0n, 1n), 225: Qv(1n, 1n), 315: Qv(-1n, 1n) }; if (deg in T) return T[deg]; }
    }
    return F(f === 'sin' ? Math.sin(x * R) : f === 'cos' ? Math.cos(x * R) : Math.tan(x * R));
  }
  if ((f === 'asin' || f === 'acos') && (x < -1 || x > 1)) throw new CalcError(`${f === 'asin' ? 'sin⁻¹' : 'cos⁻¹'} : le nombre doit être entre −1 et 1.`);
  const key = isQ(a) ? `${a.q[0]}/${a.q[1]}` : '';
  const EX: Record<string, Record<string, number>> = { asin: { '0/1': 0, '1/2': 30, '1/1': 90, '-1/2': -30, '-1/1': -90 }, acos: { '1/1': 0, '1/2': 60, '0/1': 90, '-1/2': 120, '-1/1': 180 }, atan: { '0/1': 0, '1/1': 45, '-1/1': -45 } };
  if (key in EX[f]) return Qv(BigInt(EX[f][key]), 1n);
  return F((f === 'asin' ? Math.asin(x) : f === 'acos' ? Math.acos(x) : Math.atan(x)) / R);
}

export function evaluate(e: Ast, ans: Val | null): Val {
  switch (e.t) {
    case 'num': return e.v;
    case 'pi': return { f: Math.PI };
    case 'ans': if (!ans) throw new CalcError('Pas encore de résultat pour « Ans ».'); return ans;
    case 'neg': { const v = evaluate(e.a, ans); return isQ(v) ? Qv(-v.q[0], v.q[1]) : F(-v.f); }
    case 'sq': { const v = evaluate(e.a, ans); return pow(v, Qv(BigInt(e.p), 1n)); }
    case 'fn': { const v = evaluate(e.a, ans); return e.f === 'sqrt' ? sqrt(v) : trig(e.f, v); }
    case 'bin': {
      const a = evaluate(e.a, ans), b = evaluate(e.b, ans);
      return e.op === '+' ? add(a, b, 1n) : e.op === '-' ? add(a, b, -1n) : e.op === '*' ? mul(a, b) : e.op === '/' ? div(a, b) : pow(a, b);
    }
  }
}

// ------------------------------------------------------------------ mise en forme
const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Écriture française d'un nombre : virgule, espaces fines pour les milliers. */
function frDigits(intPart: string, frac: string, neg: boolean): string {
  const g = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  return (neg ? '−' : '') + g + (frac ? ',' + frac : '');
}
export interface Shown { text: string; approx: boolean; exact?: string /* fraction, si utile */ }
/** Résultat à ~10 chiffres significatifs, ≈ si arrondi ; entiers exacts ; notation scientifique si très grand ou très petit. */
export function format(v: Val, sig = 10): Shown {
  if (isQ(v)) {
    const [n, d] = v.q, neg = n < 0n, an = neg ? -n : n;
    // décimal fini ? (d = 2^a 5^b)
    let dd = d, k = 0; while (dd % 2n === 0n) { dd /= 2n; k++; } let k5 = 0; while (dd % 5n === 0n) { dd /= 5n; k5++; }
    if (dd === 1n) {
      const e = Math.max(k, k5), s = (an * 10n ** BigInt(e)) / d, str = s.toString().padStart(e + 1, '0');
      const ip = str.slice(0, str.length - e), fp = str.slice(str.length - e).replace(/0+$/, '');
      const digits = (ip.replace(/^0+/, '') + fp).replace(/^0+/, '').length;
      if (fp ? ip.length <= 15 && digits <= 15 : ip.length <= 21) return { text: frDigits(ip, fp, neg), approx: false };
    }
    const r = fmtFloat(Number(n) / Number(d), sig);
    return { ...r, approx: true, exact: d !== 1n && an < 10n ** 9n && d < 10n ** 9n ? `${neg ? '−' : ''}${an}/${d}` : undefined };
  }
  const r = fmtFloat(v.f, sig);
  return r;
}
function fmtFloat(x: number, sig: number): Shown {
  if (x === 0) return { text: '0', approx: false };
  const ax = Math.abs(x);
  if (ax >= 1e15 || ax < 1e-9) {
    const [m, e] = ax.toExponential(sig - 1).split('e');
    const mm = m.replace(/\.?0+$/, '').replace('.', ',');
    const ee = String(Number(e)).replace('-', '⁻').replace(/\d/g, (c) => SUPD[Number(c)]);
    return { text: `${x < 0 ? '−' : ''}${mm} × 10${ee}`, approx: true };
  }
  const p = Number(ax.toPrecision(sig));
  let s = p.toFixed(Math.max(0, sig - 1 - Math.floor(Math.log10(p)))).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  const [ip, fp = ''] = s.split('.');
  s = frDigits(ip, fp, x < 0);
  // bruit flottant (√2² = 2,0000000000000004) : pas un arrondi
  return { text: s, approx: Math.abs(p - ax) > ax * 1e-13 };
}

/** Écriture jolie de la saisie : ² ³, √, ×, ÷, −, virgule ; sqrt(…) → √(…). */
export function pretty(src: string): string {
  let toks: Tok[];
  try { toks = tokenize(src); } catch { return src; }
  let out = '';
  const FN: Record<Fn, string> = { sqrt: '√', sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹' };
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i], prev = toks[i - 1];
    const binaryCtx = prev && (prev.k === 'num' || prev.k === ')' || prev.k === 'pi' || prev.k === 'ans' || prev.k === 'pow');
    switch (t.k) {
      case 'num': { const [a, b = ''] = t.s.split('.'); out += frDigits(a, b, false); break; }
      case 'pow': out += t.p === 2 ? '²' : '³'; break;
      case 'pi': out += 'π'; break;
      case 'ans': out += 'Ans'; break;
      case '(': out += '('; break;
      case ')': out += ')'; break;
      case 'fn': out += FN[t.s] + (t.s !== 'sqrt' && toks[i + 1]?.k !== '(' ? ' ' : ''); break;
      case 'op':
        if (t.s === '^') {
          // ^ suivi d'un entier (éventuellement négatif) → exposant
          const n1 = toks[i + 1], n2 = toks[i + 2];
          if (n1?.k === 'num' && /^\d{1,3}$/.test(n1.s) && toks[i + 2]?.k !== 'pow' && !(n2?.k === 'op' && n2.s === '^')) { out += n1.s.replace(/\d/g, (c) => SUPD[Number(c)]); i++; break; }
          if (n1?.k === 'op' && n1.s === '-' && n2?.k === 'num' && /^\d{1,3}$/.test(n2.s)) { out += '⁻' + n2.s.replace(/\d/g, (c) => SUPD[Number(c)]); i += 2; break; }
          out += '^'; break;
        }
        if (binaryCtx) out += ` ${t.s === '*' ? '×' : t.s === '/' ? '÷' : t.s === '-' ? '−' : '+'} `;
        else out += t.s === '-' ? '−' : t.s === '+' ? '+' : t.s;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Une ligne de calcul complète. `ans` : résultat précédent (ou null). */
export function calc(src: string, ans: Val | null): { ok: true; value: Val; shown: Shown; expr: string } | { ok: false; error: string } {
  let s = src.trim();
  if (!s) return { ok: false, error: 'Rien à calculer.' };
  // commence par un opérateur binaire : on part du résultat précédent, comme une calculatrice
  if (ans && /^[+×*÷/:^²³]/.test(s)) s = 'Ans' + s;
  try {
    const value = evaluate(parse(s), ans);
    return { ok: true, value, shown: format(value), expr: pretty(s) };
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, error: e.message };
    return { ok: false, error: 'Calcul impossible.' };
  }
}

/** Texte à insérer dans une case réponse, selon ce que la case attend (data-form, data-dp). */
export function insertText(v: Val, o: { form?: string; dp?: number; decimalOk?: boolean }): { text: string; warn?: string } {
  const plainNum = (s: string) => s.replace(/\u202f/g, '').replace('−', '-');
  if (o.dp !== undefined) {
    const x = num(v), r = Math.round(x * 10 ** o.dp) / 10 ** o.dp;
    return { text: plainNum(r.toFixed(o.dp).replace('.', ',')).replace(/^-0(,0*)?$/, '0$1') };
  }
  if (isQ(v)) {
    const [n, d] = v.q, sh = format(v);
    if (!sh.approx) {
      if (d !== 1n && o.form === 'irreducible' && !o.decimalOk) return { text: `${n}/${d}` };
      return { text: plainNum(sh.text) };
    }
    if (o.form !== 'decimal' && sh.exact) return { text: `${n}/${d}` };
    return { text: plainNum(sh.text), warn: 'Résultat arrondi : vérifie la précision demandée.' };
  }
  const sh = format(v);
  if (/×/.test(sh.text)) return { text: '', warn: 'Nombre trop grand ou trop petit pour être inséré.' };
  return { text: plainNum(sh.text), warn: sh.approx ? 'Résultat arrondi : l’exercice attend peut-être une valeur exacte ou un arrondi précis.' : undefined };
}
