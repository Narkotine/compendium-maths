/**
 * Lecture et vérification des réponses tapées.
 * Écritures acceptées : −3, -3, − 3, +3 ; 2,5 et 2.5 ; 5/2, -5/2, 5/-2 ; « x = 3 » ; 1 000 ;
 * √7, -√7 (quand l'exercice le permet). Les différentes formes d'un même nombre sont équivalentes,
 * sauf si l'énoncé exige une fraction irréductible.
 */
import { type Q, q, eq, fromDecimalString, toNum, isInt, gcd, decimals, cmp, isDecimal, neg } from './q';
import type { NumField, Answer, Val, Mistake } from './types';
import type { Rel } from './expr';
import { texQ, texQd } from './expr';

export interface Parsed {
  q: Q;
  /** Forme tapée. */
  form: 'int' | 'dec' | 'frac' | 'sqrt';
  /** Fraction tapée déjà irréductible (dénominateur ≠ 1, positif) ? */
  reduced: boolean;
  /** Nombre de décimales tapées. */
  dp: number;
  /** Pour √ : radicande et signe. */
  sqrt?: { r: Q; s: 1 | -1 };
}
export type ParseResult = { ok: true; v: Parsed } | { ok: false; msg: string };

const MSG_FORMAT = 'Écriture non reconnue. Exemples : $-3$ ; $2{,}5$ ; $7/3$.';

/** Nettoie la saisie : signes moins typographiques, espaces insécables, « x = » en tête. */
export function normalize(raw: string): string {
  return raw
    .replace(/[\u2212\u2012\u2013\u2014\u2010\u2011\uFE63\uFF0D]/g, '-')
    .replace(/[\u00A0\u202F\u2009\u2007]/g, ' ')
    .replace(/[÷∕⁄]/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[a-zA-Z]\s*=\s*/, '')
    .replace(/\s*\.$/, (m) => (/\d\.$/.test(raw.trim()) ? m : ''));
}

/** Entier ou décimal (virgule ou point), espaces de milliers acceptés. */
function parseDec(s: string): { q: Q; dp: number; dec: boolean } | null {
  let t = s.replace(/\s+/g, ' ').trim();
  // signe séparé du nombre (« - 3 »)
  t = t.replace(/^([+-])\s+/, '$1');
  // espaces de milliers : 1 000 ; 12 345,5
  if (/\s/.test(t)) {
    if (!/^[+-]?\d{1,3}( \d{3})+([.,]\d+)?$/.test(t)) return null;
    t = t.replace(/ /g, '');
  }
  if ((t.match(/[.,]/g) || []).length > 1) return null;
  t = t.replace(',', '.');
  const v = fromDecimalString(t);
  if (!v) return null;
  const m = t.split('.');
  return { q: v, dp: m[1]?.length ?? 0, dec: m.length > 1 };
}

export function parseNumber(raw: string, opts: { sqrt?: boolean } = {}): ParseResult {
  const s = normalize(raw);
  if (!s) return { ok: false, msg: 'Écris ta réponse dans la case.' };
  // √a, -√a, √(a)
  const sq = /^([+-]?)\s*(?:√|sqrt|rac)\s*\(?\s*([\d\s.,]+)\s*\)?$/i.exec(s);
  if (sq) {
    if (!opts.sqrt) return { ok: false, msg: 'Ici, donne un nombre (sans racine carrée).' };
    const r = parseDec(sq[2]);
    if (!r || r.q.n < 0) return { ok: false, msg: MSG_FORMAT };
    const sgn = sq[1] === '-' ? -1 : 1;
    const root = Math.round(Math.sqrt(toNum(r.q)));
    // √9 = 3 : on garde la valeur exacte quand c'est un carré parfait entier
    if (isInt(r.q) && root * root === r.q.n) return { ok: true, v: { q: q(sgn * root), form: 'int', reduced: true, dp: 0 } };
    return { ok: true, v: { q: q(0), form: 'sqrt', reduced: true, dp: 0, sqrt: { r: r.q, s: sgn as 1 | -1 } } };
  }
  const slash = s.split('/');
  if (slash.length > 2) return { ok: false, msg: MSG_FORMAT };
  if (slash.length === 2) {
    const a = parseDec(slash[0].replace(/^\(|\)$/g, '')), b = parseDec(slash[1].replace(/^\(|\)$/g, ''));
    if (!a || !b) return { ok: false, msg: MSG_FORMAT };
    if (b.q.n === 0) return { ok: false, msg: 'Le dénominateur d’une fraction ne peut pas être $0$.' };
    const v = q(a.q.n * b.q.d, a.q.d * b.q.n);
    const intParts = !a.dec && !b.dec;
    const den = Math.abs(b.q.n);
    const reduced = intParts && gcd(a.q.n, b.q.n) === 1 && den !== 1;
    return { ok: true, v: { q: v, form: intParts ? 'frac' : 'dec', reduced, dp: 0 } };
  }
  const d = parseDec(s);
  if (!d) return { ok: false, msg: MSG_FORMAT };
  return { ok: true, v: { q: d.q, form: d.dec ? 'dec' : 'int', reduced: true, dp: d.dp } };
}

export type Status = 'ok' | 'wrong' | 'retry';
export interface Verdict {
  status: Status;
  /** Message (erreur reconnue, format, remarque sur une réponse juste). */
  msg?: string;
  /** Message d'erreur typique reconnu (pour les statistiques). */
  mistake?: boolean;
}

/** Vérifie un champ numérique. */
export function checkField(f: NumField, raw: string): Verdict & { value?: Q } {
  const p = parseNumber(raw);
  if (!p.ok) return { status: 'retry', msg: p.msg };
  const v = p.v;
  if (f.approx) {
    const x = toNum(v.q), err = Math.abs(x - f.approx.value);
    if (err <= f.approx.tol + 1e-9) {
      const extra = v.dp > f.approx.dp ? ` On attendait l’arrondi : $${roundTex(f.approx.value, f.approx.dp)}$.` : '';
      return { status: 'ok', value: v.q, msg: extra ? 'Juste.' + extra : undefined };
    }
    if (err <= 4 * f.approx.tol + 1e-9)
      return { status: 'wrong', value: v.q, msg: `Presque : attention à l’arrondi. $${roundTex(f.approx.value, f.approx.dp + 2)}\\ldots$ s’arrondit à $${roundTex(f.approx.value, f.approx.dp)}$.` };
    return { status: 'wrong', value: v.q };
  }
  if (eq(v.q, f.expect)) {
    if (f.form === 'irreducible') {
      if (v.form === 'frac' && !v.reduced && !isInt(v.q)) return { status: 'retry', msg: 'C’est la bonne valeur, mais la fraction n’est pas irréductible : simplifie-la.' };
      if (v.form === 'frac' && isInt(v.q)) return { status: 'retry', msg: 'C’est la bonne valeur : écris-la comme un nombre entier.' };
      if (v.form === 'dec' && !f.decimalOk && !isInt(v.q)) return { status: 'retry', msg: 'C’est la bonne valeur, mais l’énoncé demande une fraction irréductible.' };
    }
    if (f.form === 'decimal' && v.form === 'frac' && !isInt(v.q)) return { status: 'retry', msg: 'C’est la bonne valeur, mais on demande l’écriture décimale : divise le numérateur par le dénominateur.' };
    if (v.form === 'frac' && !v.reduced && !isInt(v.q)) return { status: 'ok', value: v.q, msg: `Juste. On peut simplifier : $${texQ(v.q)}$.` };
    return { status: 'ok', value: v.q };
  }
  // valeur approchée d'une fraction non décimale
  if (v.form === 'dec' && !isDecimal(f.expect) && Math.abs(toNum(v.q) - toNum(f.expect)) < 0.006 + Math.abs(toNum(f.expect)) * 1e-3)
    return { status: 'retry', msg: `C’est une valeur approchée. Donne la valeur exacte, sous forme de fraction (par exemple $7/3$ s’écrit avec la touche « / »).` };
  return { status: 'wrong', value: v.q };
}

function roundTex(x: number, dp: number) {
  return (Math.round(x * 10 ** dp) / 10 ** dp).toFixed(dp).replace('.', '{,}').replace(/^-/, '-');
}

// ------------------------------------------------------------------ ensembles de solutions
export function parseSet(raw: string, sqrt = false): { ok: true; vals: Parsed[] } | { ok: false; msg: string } {
  const s = normalize(raw);
  if (!s) return { ok: false, msg: 'Écris les solutions, séparées par « ; », ou choisis « Aucune solution ».' };
  const parts = s.split(/\s*(?:;|\bet\b|\bou\b)\s*/i).filter((x) => x !== '');
  const vals: Parsed[] = [];
  for (const p of parts) {
    const r = parseNumber(p, { sqrt });
    if (!r.ok) return { ok: false, msg: parts.length > 1 ? `« ${p} » : ${r.msg}` : r.msg + ' Sépare les solutions par « ; ».' };
    vals.push(r.v);
  }
  return { ok: true, vals };
}
const valNum = (v: Val) => ('q' in v ? toNum(v.q) : v.s * Math.sqrt(toNum(v.sqrt)));
const sameVal = (p: Parsed, v: Val, tol?: number) => {
  if (tol !== undefined) return p.form !== 'sqrt' && Math.abs(toNum(p.q) - valNum(v)) <= tol + 1e-9;
  if ('q' in v) return p.form !== 'sqrt' && eq(p.q, v.q);
  return p.form === 'sqrt' && p.sqrt!.s === v.s && eq(p.sqrt!.r, v.sqrt);
};

/** Vérifie un ensemble (ordre indifférent, doublons ignorés). `none` : case « Aucune solution » cochée. */
export function checkSet(a: Extract<Answer, { kind: 'set' }>, raw: string, none: boolean, mistakes: Mistake[] = []): Verdict {
  if (none) {
    if (a.expect.length === 0) return { status: 'ok' };
    return { status: 'wrong', msg: a.expect.length === 1 ? 'Il y a pourtant une solution.' : 'Il y a pourtant des solutions.' };
  }
  if (a.approx && /√|sqrt|rac/i.test(raw))
    return { status: 'retry', msg: `On demande des valeurs **arrondies** (${a.approx.dp === 2 ? 'au centième' : a.approx.dp === 1 ? 'au dixième' : 'à l’unité'}) : calcule la racine carrée à la calculatrice.` };
  const r = parseSet(raw, a.sqrt);
  if (!r.ok) return { status: 'retry', msg: r.msg };
  const tol = a.approx?.tol;
  // doublons
  const vals = r.vals.filter((p, i) => r.vals.findIndex((o) => (o.form === 'sqrt' ? p.form === 'sqrt' && o.sqrt!.s === p.sqrt!.s && eq(o.sqrt!.r, p.sqrt!.r) : p.form !== 'sqrt' && eq(o.q, p.q))) === i);
  const found = a.expect.filter((v) => vals.some((p) => sameVal(p, v, tol)));
  const extra = vals.filter((p) => !a.expect.some((v) => sameVal(p, v, tol)));
  if (found.length === a.expect.length && extra.length === 0) {
    if (a.approx && vals.some((p) => p.dp > a.approx!.dp))
      return { status: 'ok', msg: `Juste. Arrondis demandés : ${a.expect.map((v) => `$${roundTex(valNum(v), a.approx!.dp)}$`).join(' et ')}.` };
    return { status: 'ok' };
  }
  // valeurs exactes attendues mais arrondis tapés (x² = 7 → 2,65)
  if (!tol && a.expect.some((v) => 'sqrt' in v) && vals.some((p) => p.form === 'dec' && a.expect.some((v) => Math.abs(toNum(p.q) - valNum(v)) < 0.01)))
    return { status: 'retry', msg: 'Ce sont des valeurs approchées : donne les valeurs exactes avec la touche « √ » (par exemple $\\sqrt{7}$).' };
  // erreurs typiques
  const set = vals.filter((p) => p.form !== 'sqrt').map((p) => p.q);
  for (const m of mistakes)
    if (m.on === 'set' && m.value.length === set.length && m.value.every((x) => set.some((y) => eq(x, y))) && set.length === vals.length)
      return { status: 'wrong', msg: m.msg, mistake: true };
  if (extra.length === 0 && found.length < a.expect.length)
    return { status: 'wrong', msg: found.length ? 'Ta valeur est juste, mais il manque une solution.' : 'Il manque des solutions.' };
  if (a.expect.length === 0) return { status: 'wrong', msg: 'Vérifie : ta valeur rend-elle vraiment l’égalité vraie ?' };
  if (extra.length && found.length) return { status: 'wrong', msg: extra.length === 1 ? 'Une de tes valeurs n’est pas solution.' : 'Certaines de tes valeurs ne sont pas solutions.' };
  return { status: 'wrong' };
}

// ------------------------------------------------------------------ inéquations
export function checkIneq(a: Extract<Answer, { kind: 'ineq' }>, rel: Rel | null, raw: string, mistakes: Mistake[] = []): Verdict {
  if (!rel) return { status: 'retry', msg: 'Choisis d’abord le symbole ($<$, $\\leqslant$, $>$ ou $\\geqslant$).' };
  const p = parseNumber(raw);
  if (!p.ok) return { status: 'retry', msg: p.msg };
  const b = p.v.q;
  if (rel === a.rel && eq(b, a.bound)) return { status: 'ok' };
  for (const m of mistakes)
    if (m.on === 'ineq' && (m.rel === undefined || m.rel === rel) && (m.bound === undefined || eq(m.bound, b))) return { status: 'wrong', msg: m.msg, mistake: true };
  if (eq(b, a.bound)) {
    const strictA = a.rel === '<' || a.rel === '>', strictU = rel === '<' || rel === '>';
    const dirA = a.rel.startsWith('<'), dirU = rel.startsWith('<');
    if (dirA === dirU && strictA !== strictU)
      return { status: 'wrong', msg: strictA ? 'La borne est juste, mais elle n’est pas solution : l’inégalité est stricte.' : 'La borne est juste, mais elle est solution : l’inégalité est large.' };
    if (dirA !== dirU) return { status: 'wrong', msg: 'La borne est juste, mais le sens de l’inégalité ne l’est pas.' };
  }
  if (rel === a.rel && !isDecimal(a.bound) && p.v.form === 'dec' && Math.abs(toNum(b) - toNum(a.bound)) < 0.006)
    return { status: 'retry', msg: 'C’est une valeur approchée de la borne : donne la valeur exacte (fraction).' };
  return { status: 'wrong' };
}

export function checkNumMistakes(fields: NumField[], values: (Q | undefined)[], mistakes: Mistake[] = [], signHint?: string): string | null {
  for (const m of mistakes) {
    if (m.on === 'numAll' && m.values.length === values.length && m.values.every((x, i) => values[i] && eq(values[i]!, x))) return m.msg;
    if (m.on !== 'num') continue;
    const i = m.field ?? 0;
    const v = values[i];
    if (v && eq(v, m.value) && !eq(v, fields[i].expect)) return m.msg;
  }
  // signe opposé : message générique (fiable : même valeur absolue)
  for (let i = 0; i < fields.length; i++) {
    const v = values[i];
    if (v && !fields[i].approx && fields[i].expect.n !== 0 && eq(v, neg(fields[i].expect))) return signHint ?? 'Attention au signe : vérifie chaque transformation (et ce que devient un terme qui change de membre).';
  }
  return null;
}
export { cmp, decimals, texQd };
