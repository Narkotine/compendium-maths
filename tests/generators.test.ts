/**
 * Tests de propriétés des générateurs : pour chaque type et chaque niveau, N graines (≥ 2000).
 * On revérifie tout INDÉPENDAMMENT du générateur, à partir des données `data` (équation, solution…) :
 * solution juste et unique, contraintes de forme, erreurs typiques ≠ bonne réponse, QCM cohérents,
 * rendu KaTeX sans erreur de tous les textes, déterminisme, fréquence des doublons.
 *   npx tsx tests/generators.test.ts [N]
 */
import katex from 'katex';
import { readFileSync } from 'node:fs';
import { makeRng, hashSeed } from '../src/practice/engine/rng';
import { type Q, q, eq, sub, isInt, isDecimal, decimals, toNum, cmp, gcd } from '../src/practice/engine/q';
import { evaluate, holds, satisfies, toLin, texEq, type Equation, type Expr } from '../src/practice/engine/expr';
import type { ExerciseBody, Generator, Level, Rich, Val } from '../src/practice/engine/types';
import ch07 from '../src/practice/ch07/index';
import ch03 from '../src/practice/ch03/index';
import ch06 from '../src/practice/ch06/index';
import ch11 from '../src/practice/ch11/index';
import ch15 from '../src/practice/ch15/index';
import ch10 from '../src/practice/ch10/index';
import ch09 from '../src/practice/ch09/index';
import ch17 from '../src/practice/ch17/index';
import ch16 from '../src/practice/ch16/index';
import ch14 from '../src/practice/ch14/index';
import ch08 from '../src/practice/ch08/index';
import ch13 from '../src/practice/ch13/index';
import ch12 from '../src/practice/ch12/index';
import ch02 from '../src/practice/ch02/index';
import ch04 from '../src/practice/ch04/index';
import ch05 from '../src/practice/ch05/index';
import ch01 from '../src/practice/ch01/index';
import { LEVELS as AUTO, PER_SEANCE } from '../src/practice/auto/index';
import { pEq, pEval, texToInput, parseExpr, shapeOf } from '../src/practice/engine/algebra';
import { checkExpr, checkStep } from '../src/practice/engine/check';
import { checkField } from '../src/practice/engine/answers';
import type { Step } from '../src/practice/engine/types';

const N = Number(process.argv[2] || 2000);
let failures = 0;
const LIMIT = Number(process.env.LIMIT || 40);
const fail = (ctx: string, msg: string) => {
  failures++;
  if (failures <= LIMIT) console.error(`✗ ${ctx} : ${msg}`);
};

// ------------------------------------------------------------------ KaTeX
const katexCache = new Map<string, string | null>();
function checkTex(t: string): string | null {
  if (katexCache.has(t)) return katexCache.get(t)!;
  let err: string | null = null;
  try {
    katex.renderToString(t, { throwOnError: true, strict: 'ignore' });
  } catch (e) {
    err = (e as Error).message;
  }
  katexCache.set(t, err);
  return err;
}
function richMath(r: Rich): string[] {
  const out: string[] = [];
  const s = r.replace(/\[\[ray:[^\]]+\]\]/g, '');
  const parts = s.split('$');
  if (parts.length % 2 === 0) out.push('\u0000unbalanced');
  for (let i = 1; i < parts.length; i += 2) out.push(parts[i]);
  return out;
}
function allRich(e: ExerciseBody): Rich[] {
  const r: Rich[] = [e.title, e.statement ?? '', e.form ?? '', e.answer, ...e.solution];
  for (const s of e.steps) {
    r.push(s.prompt, s.hint);
    for (const m of s.mistakes ?? []) r.push(m.msg);
    const a = s.answer;
    if (a.kind === 'choice') r.push(...a.options, ...((a.explain ?? []).filter(Boolean) as string[]));
    if (a.kind === 'num') for (const f of a.fields) r.push(f.label);
    if (a.kind === 'expr') r.push(a.label ?? '', `$${a.tex}$`);
    if (a.kind === 'order') r.push(...a.items.map((t) => `$${t}$`), ...Object.values(a.why ?? {}));
  }
  return r;
}

// ------------------------------------------------------------------ vérifs mathématiques indépendantes
/** lhs − rhs comme polynôme de degré ≤ 2 en x (interpolation exacte sur 3 points, contrôle sur un 4e). */
function poly2(E: Equation, v = 'x'): [Q, Q, Q] | null {
  const f = (t: number) => sub(evaluate(E.lhs, { [v]: q(t) }), evaluate(E.rhs, { [v]: q(t) }));
  const f0 = f(0), f1 = f(1), fm = f(-1);
  // a = (f1 + fm)/2 − f0 ; b = (f1 − fm)/2 ; c = f0
  const a = sub(q((f1.n * fm.d + fm.n * f1.d), 2 * f1.d * fm.d), f0);
  const b = q(f1.n * fm.d - fm.n * f1.d, 2 * f1.d * fm.d);
  const c = f0;
  for (const t of [2, 3, -5, 7]) {
    const val = toNum(a) * t * t + toNum(b) * t + toNum(c);
    if (Math.abs(val - toNum(f(t))) > 1e-6) return null;
  }
  return [a, b, c];
}
const valNum = (v: Val) => ('q' in v ? toNum(v.q) : v.s * Math.sqrt(toNum(v.sqrt)));

const bad = /(^|[^\\\d,{}])(0x|1x)\b|\+ -|- -|\+ \+|--|\+ 0(?![,{\d])|- 0(?![,{\d])|\\times 1(?![\d,{])|\^\{1\}/;

function checkOne(g: Generator, level: Level, seed: number, e: ExerciseBody, ctx: string) {
  // 0) les unités sont du texte simple (non interprété : pas de TeX)
  for (const st of e.steps) if (st.answer.kind === 'num') for (const f of st.answer.fields) if (f.unit && /[$\\]/.test(f.unit)) fail(ctx, `unité en TeX (affichée brute) : ${f.unit}`);
  // 0 bis) une erreur typique « toutes cases » ne doit pas coïncider avec la bonne réponse
  for (const st of e.steps) if (st.answer.kind === 'num') { const A = st.answer; for (const mk of st.mistakes ?? []) if (mk.on === 'numAll' && mk.values.length === A.fields.length && mk.values.every((v, j) => eq(v, A.fields[j].expect))) fail(ctx, 'erreur typique identique à la bonne réponse'); }
  // 0 ter) rangement : cartes relues indépendamment, tirage non rangé, ex aequo annoncés, erreurs ≠ bonne réponse
  for (const st of e.steps) if (st.answer.kind === 'order') checkOrderStep(st, e, ctx);
  // 0 quater) inégalités affichées vraies, encadrements stricts et d'amplitude demandée
  checkChains(e, ctx);
  // 1) KaTeX + dollars équilibrés
  for (const r of allRich(e)) for (const t of richMath(r)) {
    if (t === '\u0000unbalanced') fail(ctx, `dollars non appariés : ${r}`);
    else {
      const err = checkTex(t);
      if (err) fail(ctx, `KaTeX : ${err} dans « ${t} »`);
      if (/\(\s*\(|\\left\(\s*\\left\(/.test(t)) fail(ctx, `parenthèses doublées : ${t}`);
      if (/(?<![\\a-zA-Z])[xyn]\d/.test(t)) fail(ctx, `produit illisible (lettre suivie d’un chiffre) : ${t}`);
      if (/(^|[^\\\d,{}.])0[xy]\b|(^|[-+=(] *)1[xy]\b/.test(t)) fail(ctx, `coefficient 0 ou 1 écrit : ${t}`);
    }
  }
  if (e.display) {
    const err = checkTex(e.display);
    if (err) fail(ctx, `KaTeX display : ${err}`);
    if (bad.test(e.display)) fail(ctx, `écriture maladroite dans l’énoncé : ${e.display}`);
  }
  for (const r of e.solution) for (const t of richMath(r)) if (/\+ -|- -|--|\+ \+/.test(t)) fail(ctx, `signes doublés dans le corrigé : ${t}`);
  if (!e.solution.length) fail(ctx, 'corrigé vide');
  // 2) mathématiques
  const d = e.data;
  const step0 = e.steps[e.steps.length - 1];
  switch (d.kind) {
    case 'equation': {
      const sols = d.solutions;
      if (sols === 'none') break;
      for (const s of sols) if (!satisfies(d.eq, { x: s })) fail(ctx, `x = ${s.n}/${s.d} n’est pas solution de ${texEq(d.eq)}`);
      const P = poly2(d.eq);
      if (!P) {
        fail(ctx, `équation non polynomiale de degré ≤ 2 : ${texEq(d.eq)}`);
        break;
      }
      const [a, b] = P;
      if (a.n === 0) {
        if (b.n === 0) fail(ctx, `équation dégénérée (pas de solution unique) : ${texEq(d.eq)}`);
        if (sols.length !== 1) fail(ctx, 'équation du 1er degré avec ≠ 1 solution');
        const A = step0.answer;
        if (A.kind === 'num') {
          if (!eq(A.fields[0].expect, sols[0])) fail(ctx, 'réponse attendue ≠ solution');
          const x = sols[0];
          if (A.fields[0].form === 'irreducible' && (isInt(x) || (isDecimal(x) && decimals(x) <= 2))) fail(ctx, 'fraction irréductible exigée pour un entier/décimal');
          if (!isInt(x) && !(isDecimal(x) && decimals(x) <= 2) && A.fields[0].form !== 'irreducible') fail(ctx, 'forme de la réponse non annoncée');
          if (/entier/.test(e.form ?? '') && !isInt(x)) fail(ctx, 'annonce « entier » fausse');
          if (Math.abs(toNum(x)) > 200) fail(ctx, `solution trop grande : ${toNum(x)}`);
          if (x.d > 12 && !(isDecimal(x) && decimals(x) <= 2)) fail(ctx, `dénominateur trop grand : ${x.d}`);
        }
      } else {
        // second degré : discriminant, nombre de solutions
        const D = toNum(b) ** 2 - 4 * toNum(a) * toNum(P[2]);
        const n = D > 1e-12 ? 2 : Math.abs(D) <= 1e-12 ? 1 : 0;
        if (n !== sols.length) fail(ctx, `${n} solutions attendues, ${sols.length} données (${texEq(d.eq)})`);
        const A = step0.answer;
        if (A.kind === 'set' && A.expect.length !== sols.length) fail(ctx, 'ensemble attendu ≠ solutions');
        if (A.kind === 'set') for (const v of A.expect) if (!sols.some((s) => 'q' in v && eq(s, v.q))) fail(ctx, 'valeur attendue hors des solutions');
      }
      break;
    }
    case 'square': {
      const A = step0.answer;
      if (A.kind !== 'set') {
        fail(ctx, 'carré sans réponse ensemble');
        break;
      }
      const P = poly2(d.eq)!;
      const D = toNum(P[1]) ** 2 - 4 * toNum(P[0]) * toNum(P[2]);
      const n = D > 1e-12 ? 2 : Math.abs(D) <= 1e-12 ? 1 : 0;
      if (n !== A.expect.length) fail(ctx, `x² = a : ${n} solutions attendues, ${A.expect.length} données (${texEq(d.eq)})`);
      for (const v of A.expect) {
        const t = valNum(v);
        const val = toNum(P[0]) * t * t + toNum(P[1]) * t + toNum(P[2]);
        if (Math.abs(val) > 1e-6) fail(ctx, `valeur ${t} non solution de ${texEq(d.eq)}`);
      }
      if (n === 0 && !/Aucune/i.test(e.answer)) fail(ctx, 'pas de solution mais réponse non « aucune »');
      break;
    }
    case 'inequation': {
      const L = toLin(d.eq.lhs), R = toLin(d.eq.rhs);
      if (!L || !R || eq(L.a, R.a)) {
        fail(ctx, 'inéquation non affine ou dégénérée');
        break;
      }
      for (const dt of [-1, -0.5, -0.01, 0, 0.01, 0.5, 1, 7]) {
        const t = q(Math.round((toNum(d.bound) + dt) * 1000) + (dt === 0 ? 0 : 0), 1000);
        const tt = dt === 0 ? d.bound : t;
        const lhs = holds(d.eq.rel, evaluate(d.eq.lhs, { x: tt }), evaluate(d.eq.rhs, { x: tt }));
        const rhs = holds(d.rel, tt, d.bound);
        if (lhs !== rhs) fail(ctx, `ensemble faux en x = ${toNum(tt)} pour ${texEq(d.eq)} (attendu x ${d.rel} ${toNum(d.bound)})`);
      }
      const A = e.steps[0].answer;
      if (A.kind !== 'ineq' || A.rel !== d.rel || !eq(A.bound, d.bound)) fail(ctx, 'réponse inéquation ≠ données');
      const Rr = e.steps[1]?.answer;
      if (!Rr || Rr.kind !== 'ray' || Rr.rel !== d.rel || !eq(Rr.bound, d.bound)) fail(ctx, 'droite graduée ≠ données');
      if (!e.solution.some((l) => l.startsWith('[[ray:'))) fail(ctx, 'corrigé sans droite graduée');
      for (const m of e.steps[0].mistakes ?? []) if (m.on === 'ineq' && (m.rel ?? d.rel) === d.rel && (m.bound ? eq(m.bound, d.bound) : true)) fail(ctx, 'erreur typique = bonne réponse');
      break;
    }
    case 'system': {
      const env = { x: d.x, y: d.y };
      for (const E of d.eqs) if (!satisfies(E, env)) fail(ctx, `(x;y) ne vérifie pas ${texEq(E)}`);
      // déterminant
      const co = (E: Equation) => {
        const f = (x: number, y: number) => toNum(sub(evaluate(E.lhs, { x: q(x), y: q(y) }), evaluate(E.rhs, { x: q(x), y: q(y) })));
        return [f(1, 0) - f(0, 0), f(0, 1) - f(0, 0)];
      };
      const [a1, b1] = co(d.eqs[0]), [a2, b2] = co(d.eqs[1]);
      if (Math.abs(a1 * b2 - a2 * b1) < 1e-9) fail(ctx, 'système dégénéré');
      const A = step0.answer;
      if (A.kind !== 'num' || !eq(A.fields[0].expect, d.x) || !eq(A.fields[1].expect, d.y)) fail(ctx, 'réponse système ≠ données');
      break;
    }
    case 'test': {
      const ok = satisfies(d.eq, { x: d.value });
      if (ok !== d.isSolution) fail(ctx, 'verdict du test faux');
      const A = step0.answer;
      if (A.kind !== 'choice' || A.correct !== (ok ? 0 : 1)) fail(ctx, 'QCM oui/non incohérent');
      const s1 = e.steps[0].answer;
      if (s1.kind === 'num' && !eq(s1.fields[0].expect, evaluate(d.eq.lhs, { x: d.value }))) fail(ctx, 'membre de gauche attendu faux');
      break;
    }
    case 'js': {
      checkItems(d.items, e, ctx);
      break;
    }
    case 'poly': {
      const f = new Function('x', `return ${d.js};`) as (x: number) => number;
      for (const t of [-3, -1.5, 0, 0.5, 1, 2, 7]) {
        const a = f(t), b = toNum(pEval(d.expect, q(Math.round(t * 2), 2)));
        if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(a))) fail(ctx, `polynôme attendu faux en x = ${t} : ${a} ≠ ${b} (${d.js})`);
      }
      const last = [...e.steps].reverse().find((s) => s.answer.kind === 'expr');
      if (last && last.answer.kind === 'expr' && !pEq(last.answer.expect, d.expect)) fail(ctx, 'réponse (expression) ≠ données');
      if (d.also) checkItems(d.also, e, ctx);
      break;
    }
    case 'polys': {
      const es = e.steps.filter((s) => s.answer.kind === 'expr');
      if (es.length !== d.list.length) fail(ctx, 'nombre d’expressions ≠ données');
      d.list.forEach((it, i) => {
        const f = new Function('x', `return ${it.js};`) as (x: number) => number;
        for (const t of [-3, -1.5, 0, 0.5, 1, 2, 7]) {
          const a = f(t), b = toNum(pEval(it.expect, q(Math.round(t * 2), 2)));
          if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(a))) fail(ctx, `polynôme ${i} faux en x = ${t} (${it.js})`);
        }
        const A = es[i]?.answer;
        if (A && A.kind === 'expr' && !pEq(A.expect, it.expect)) fail(ctx, `réponse ${i} ≠ données`);
      });
      break;
    }
    case 'pyth': {
      if (!(d.a > 0 && d.b > 0 && d.c > 0)) fail(ctx, 'longueurs non positives');
      if (Math.abs(d.a ** 2 + d.b ** 2 - d.c ** 2) > 1e-6 * d.c ** 2) fail(ctx, `pas un triangle rectangle : ${d.a}, ${d.b}, ${d.c}`);
      checkItems(d.items, e, ctx);
      break;
    }
    case 'problem': {
      const v = /\bn\b/.test(e.steps[1]?.answer.kind === 'num' ? e.steps[1].answer.fields[0].label : '') ? 'n' : 'x';
      if (!satisfies(d.eq, { [v]: d.x })) fail(ctx, 'la réponse ne vérifie pas l’équation');
      const L = toLin(d.eq.lhs, v), R = toLin(d.eq.rhs, v);
      if (!L || !R || eq(L.a, R.a)) fail(ctx, 'équation de problème non affine/dégénérée');
      for (const [k, val] of d.facts) {
        if (!(val > 0) && k !== 'x') fail(ctx, `valeur non positive (${k} = ${val})`);
        if (k.startsWith('n:') && !Number.isInteger(val)) fail(ctx, `quantité non entière (${k} = ${val})`);
      }
      const c = e.steps[0].answer;
      if (c.kind !== 'choice') fail(ctx, 'pas de QCM d’équation');
      else {
        if (c.options[c.correct] !== `$${texEq(d.eq)}$`) fail(ctx, 'option correcte ≠ équation');
        if (c.options.length < 3) fail(ctx, `QCM trop pauvre (${c.options.length} options)`);
        if (new Set(c.options).size !== c.options.length) fail(ctx, 'options de QCM en double');
        c.explain?.forEach((x, i) => i !== c.correct && !x && fail(ctx, 'distracteur sans explication'));
      }
      break;
    }
  }
  // 2 bis) figure SVG
  if (e.figure) checkSvg(e.figure, ctx);
  // 2 ter) expressions : la réponse affichée est acceptée par le validateur (forme comprise)
  for (const s of e.steps) if (s.answer.kind === 'expr') {
    const A = s.answer;
    const typed = texToInput(A.tex);
    const v = checkExpr(A, typed, []);
    if (v.status !== 'ok') fail(ctx, `réponse attendue « ${A.tex} » (saisie « ${typed} ») refusée : ${v.msg ?? v.status}`);
    for (const mm of s.mistakes ?? []) if (mm.on === 'expr' && pEq(mm.value, A.expect)) fail(ctx, 'erreur typique (expression) = bonne réponse');
  }
  // 2 quater) « Somme ou produit ? » : relecture de l'expression (dernière opération)
  for (const s of e.steps) if (s.answer.kind === 'choice' && s.answer.options.join('|') === 'Somme|Produit') {
    const t = /\$(.*)\$/.exec(s.prompt)?.[1] ?? '';
    const r = parseExpr(texToInput(t));
    if (!r.ok) fail(ctx, `expression illisible : ${t}`);
    else if ((shapeOf(r.ast).product ? 1 : 0) !== s.answer.correct) fail(ctx, `nature fausse pour ${t}`);
  }
  // 3) erreurs typiques ≠ réponse attendue ; QCM : explications
  for (const s of e.steps) {
    const A = s.answer;
    if (A.kind === 'num') for (const m of s.mistakes ?? []) if (m.on === 'num' && eq(m.value, A.fields[m.field ?? 0].expect)) fail(ctx, 'erreur typique = bonne réponse');
    if (A.kind === 'set') for (const m of s.mistakes ?? []) if (m.on === 'set' && m.value.length === A.expect.length && A.expect.every((v) => 'q' in v && m.value.some((w) => eq(w, v.q)))) fail(ctx, 'erreur typique (ensemble) = bonne réponse');
    if (A.kind === 'choice') {
      if (A.correct < 0 || A.correct >= A.options.length) fail(ctx, 'index correct hors limites');
      if (new Set(A.options).size !== A.options.length) fail(ctx, 'options en double');
    }
    if (A.kind === 'num') for (const f of A.fields) if (f.form === 'irreducible' && isInt(f.expect)) fail(ctx, 'irréductible exigé pour un entier');
    // la réponse attendue, tapée sous sa forme canonique, est acceptée (forme exigée comprise)
    if (A.kind === 'num')
      for (const f of A.fields) {
        const x = f.expect;
        const typed = f.approx
          ? (Math.round(f.approx.value * 10 ** f.approx.dp) / 10 ** f.approx.dp).toFixed(f.approx.dp).replace('.', ',')
          : isInt(x) ? String(x.n)
          : f.form !== 'irreducible' && isDecimal(x) && decimals(x) <= 12 ? toNum(x).toFixed(decimals(x)).replace('.', ',')
          : `${x.n}/${x.d}`;
        const v = checkField(f, typed);
        if (v.status !== 'ok') fail(ctx, `réponse attendue « ${typed} » refusée pour « ${f.label} » : ${v.msg ?? v.status}`);
        if (f.form === 'decimal' && !isDecimal(x)) fail(ctx, 'écriture décimale exigée pour un non-décimal');
      }
  }
  if (!e.key) fail(ctx, 'clé vide');
  void gcd;
  void cmp;
  void seed;
  void level;
  void g;
}

/** Valeurs recalculées (JavaScript indépendant) ; chaque case numérique doit correspondre à l'une d'elles. */
function checkItems(items: { what: string; js: string; expect: number; tol?: number }[], e: ExerciseBody, ctx: string) {
  const vals: number[] = [];
  for (const it of items) {
    let v: number;
    try {
      v = (new Function(`return ${it.js};`) as () => number)();
    } catch (err) {
      fail(ctx, `js invalide (${it.what}) : ${it.js}`);
      continue;
    }
    vals.push(v);
    if (!(Math.abs(v - it.expect) <= (it.tol ?? 1e-9 * Math.max(1, Math.abs(v))))) fail(ctx, `${it.what} : recalcul ${v} ≠ ${it.expect} (${it.js})`);
    const sm = /^step:(\d+)$/.exec(it.what);
    if (sm) {
      const A = e.steps[Number(sm[1])]?.answer;
      if (!A || A.kind !== 'choice' || A.correct !== v) fail(ctx, `QCM ${it.what} : bonne option ${A && A.kind === 'choice' ? A.correct : '?'} ≠ ${v}`);
    }
  }
  for (const s of e.steps as Step[]) {
    if (s.answer.kind === 'order') for (const v of s.answer.values) if (!vals.some((x) => Math.abs(x - toNum(v)) <= 1e-9 * Math.max(1, Math.abs(x)))) fail(ctx, `rangement : ${toNum(v)} non recalculé indépendamment`);
    if (s.answer.kind !== 'num') continue;
    for (const f of s.answer.fields) {
      const x = f.approx ? f.approx.value : toNum(f.expect);
      if (!vals.some((v) => Math.abs(v - x) <= 1e-9 * Math.max(1, Math.abs(v)))) fail(ctx, `case « ${f.label} » : ${x} non recalculée indépendamment`);
      if (f.approx && Math.abs(toNum(f.expect) - f.approx.value) > f.approx.tol + 0.5 * 10 ** -f.approx.dp) fail(ctx, 'arrondi attendu incohérent');
    }
  }
}
/** Valeur d'une carte lue depuis son TeX (indépendamment du générateur) : -\\dfrac{3}{4}, 2{,}05, -7. */
function cardValue(t: string): number | null {
  let m = /^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(t);
  if (m) return (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3]));
  m = /^(-?)(\d+)(?:\{,\}(\d+))?$/.exec(t.replace(/\\,/g, ''));
  if (m) return (m[1] ? -1 : 1) * Number(`${m[2]}.${m[3] ?? '0'}`);
  return null;
}
function checkOrderStep(st: Step, e: ExerciseBody, ctx: string) {
  const a = st.answer;
  if (a.kind !== 'order') return;
  const n = a.items.length;
  if (n < 4 || n > 6) fail(ctx, `rangement : ${n} cartes`);
  if (new Set(a.items).size !== n) fail(ctx, 'rangement : deux cartes écrites pareil');
  a.items.forEach((t, i) => {
    const v = cardValue(t);
    if (v === null) fail(ctx, `rangement : carte illisible ${t}`);
    else if (Math.abs(v - toNum(a.values[i])) > 1e-12) fail(ctx, `rangement : carte ${t} ≠ valeur ${toNum(a.values[i])}`);
  });
  const s = a.dir === 'asc' ? 1 : -1;
  const vs = a.items.map((t) => cardValue(t) ?? NaN);
  const sorted = (xs: number[], sg: number) => xs.every((x, k) => k === 0 || sg * (xs[k - 1] - x) <= 1e-12);
  if (sorted(vs, s)) fail(ctx, 'rangement : cartes déjà rangées au départ');
  if (sorted(vs, -s)) fail(ctx, 'rangement : cartes rangées à l’envers au départ');
  const ties = vs.some((x, i) => vs.some((y, j) => j > i && Math.abs(x - y) < 1e-12));
  if (ties && !/égaux/.test(`${e.form ?? ''} ${e.title} ${st.prompt}`)) fail(ctx, 'rangement : nombres égaux sans consigne');
  for (const m of st.mistakes ?? []) if (m.on === 'order' && sorted(m.values.map(toNum), s)) fail(ctx, 'rangement : erreur typique = bonne réponse');
  // la bonne réponse, saisie, est acceptée ; l'ordre de départ ne l'est pas
  const good = a.items.map((_, i) => i).sort((i, j) => s * (vs[i] - vs[j]));
  if (checkStep(st, { kind: 'order', order: good, moved: true }).status !== 'ok') fail(ctx, 'rangement : bon ordre refusé');
  if (checkStep(st, { kind: 'order', order: a.items.map((_, i) => i), moved: true }).status === 'ok') fail(ctx, 'rangement : ordre de départ accepté');
  // ex aequo : les deux ordres acceptés
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(vs[i] - vs[j]) < 1e-12) {
    const g2 = [...good];
    const pi = g2.indexOf(i), pj = g2.indexOf(j);
    [g2[pi], g2[pj]] = [g2[pj], g2[pi]];
    if (checkStep(st, { kind: 'order', order: g2, moved: true }).status !== 'ok') fail(ctx, 'rangement : ex aequo dans l’autre ordre refusé');
  }
  // indice ciblé : chaque paire distincte a une explication
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(vs[i] - vs[j]) > 1e-12 && !a.why?.[`${i}-${j}`]) fail(ctx, `rangement : paire ${i}-${j} sans explication`);
}
/** Nombre écrit en TeX : 3{,}57, -\\dfrac{2}{3}, \\sqrt{20}, 12\\,500, 2 \\sqrt{3}… (null si ce n'est pas un nombre seul). */
function texNum(t: string): number | null {
  if (/\\text|\\mathrm|\\%|[a-zA-Z]{2,}/.test(t.replace(/\\(d|t)?frac|\\sqrt|\\left|\\right/g, ''))) return null; // grandeurs avec unités : hors champ
  let u = t.trim().replace(/\\[,;!]|\\left|\\right|~/g, '').replace(/\s+/g, '');
  let sg = 1;
  while (u.startsWith('-') || u.startsWith('+')) { if (u[0] === '-') sg = -sg; u = u.slice(1); }
  const dec = (x: string) => (/^\d+(\{,\}\d+)?$/.test(x) ? Number(x.replace('{,}', '.')) : null);
  let m = /^\\[dt]?frac\{([^{}]+)\}\{([^{}]+)\}$/.exec(u);
  if (m) { const a = dec(m[1]), b = dec(m[2]); return a !== null && b ? sg * (a / b) : null; }
  m = /^(\d+(?:\{,\}\d+)?)?\\sqrt\{(\d+(?:\{,\}\d+)?)\}$/.exec(u);
  if (m) return sg * (m[1] ? dec(m[1])! : 1) * Math.sqrt(dec(m[2])!);
  const d = dec(u);
  return d === null ? null : sg * d;
}
/** Chaînes d'(in)égalités numériques affichées (corrigé, réponse, énoncés) : chaque relation doit être vraie. */
function checkChains(e: ExerciseBody, ctx: string) {
  const texts: string[] = [e.answer, ...e.solution, e.display ?? ''];
  for (const st of e.steps) { texts.push(st.hint); /* énoncés exclus : « vrai ou faux ? » peut proposer une égalité fausse */ const a = st.answer; if (a.kind === 'choice') a.options.forEach((o, i) => i === a.correct && texts.push(o)); }
  for (const r of texts) for (const seg of [...richMath(r), ...(r === e.display ? [r] : [])]) {
    if (seg === '\u0000unbalanced') continue;
    const parts = seg.split(/(\\leqslant|\\geqslant|\\leq|\\geq|(?<![\\a-z])<|(?<![\\a-z])>|=)/);
    if (parts.length < 3) continue;
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const a = texNum(parts[k - 1]), b = texNum(parts[k + 1]), op = parts[k];
      if (a === null || b === null) continue;
      const tol = 1e-9 * Math.max(1, Math.abs(a));
      const ok = op === '<' ? a < b - tol : op === '>' ? a > b + tol : op === '=' ? Math.abs(a - b) <= tol : /leq/.test(op) ? a <= b + tol : a >= b - tol;
      if (!ok) fail(ctx, `inégalité fausse affichée : ${parts[k - 1].trim()} ${op} ${parts[k + 1].trim()} (dans « ${seg} »)`);
    }
  }
  // encadrements saisis : « borne < x < borne » → strict, et amplitude demandée (« au dixième près »…)
  const STEP: Record<string, number> = { unité: 1, dixième: 0.1, centième: 0.01, millième: 0.001, dizaine: 10, centaine: 100, millier: 1000 };
  for (const st of e.steps) {
    const A = st.answer;
    if (A.kind !== 'num') continue;
    const precs = [...`${st.prompt}`.matchAll(/(unité|dixième|centième|millième|dizaine|centaine|millier)\s+près/g)].map((m) => STEP[m[1]]);
    let k = 0;
    A.fields.forEach((f, j) => {
      const mm = /^\$<\s*(.+?)\s*<\$$/.exec(f.label.trim());
      if (!mm || j === 0) return;
      const x = texNum(mm[1]);
      if (x === null) return;
      const lo = toNum(A.fields[j - 1].expect), hi = toNum(f.expect);
      if (!(lo < x && x < hi)) fail(ctx, `encadrement attendu faux : ${lo} < ${x} < ${hi}`);
      const pr = precs[k++];
      if (pr !== undefined && Math.abs(hi - lo - pr) > 1e-9) fail(ctx, `amplitude ${hi - lo} ≠ ${pr} demandée`);
      if (pr !== undefined && Math.abs(Math.round(x / pr) * pr - x) < 1e-12) fail(ctx, `nombre à encadrer déjà ${pr} près : ${x}`);
    });
  }
}
function checkSvg(svg: string, ctx: string) {
  if (!/^<svg [^>]*role="img"[^>]*aria-label="[^"]+"/.test(svg)) fail(ctx, 'figure sans role="img" ni aria-label');
  if (/NaN|undefined|Infinity/.test(svg)) fail(ctx, 'figure : coordonnée invalide');
  const open = (svg.match(/<(?!\/)[a-z]+[^>]*[^/]>/g) ?? []).filter((t) => !t.endsWith('/>')).length;
  const close = (svg.match(/<\/[a-z]+>/g) ?? []).length;
  if (open !== close) fail(ctx, `figure : balises non équilibrées (${open} / ${close})`);
}
// ------------------------------------------------------------------ boucle
const t0 = Date.now();
const report: string[] = [];
const ONLY = process.env.CH;
const chapters = [ch07, ch03, ch06, ch11, ch01, ch05, ch04, ch02, ch12, ch13, ch08, ch14, ch16, ch17, ch09, ch10, ch15].filter((c) => !ONLY || ONLY.split(',').some((o) => c.slug.startsWith(o)));
// cohérence : métadonnées (bouton « S'entraîner ») ↔ registre ↔ modules
{
  const meta = JSON.parse(readFileSync(new URL('../content-meta.json', import.meta.url), 'utf8'));
  const reg = readFileSync(new URL('../src/practice/registry.ts', import.meta.url), 'utf8');
  for (const ch of chapters) {
    const ids = ch.generators.map((g) => g.id).join(',');
    const pm = meta.chapters[ch.slug]?.practice;
    if (!pm?.enabled) fail(ch.slug, 'practice.enabled absent des métadonnées');
    else if ((pm.generators ?? []).join(',') !== ids) fail(ch.slug, `liste des types des métadonnées ≠ module (${ids})`);
    if (!reg.includes(`'${ch.slug}'`)) fail(ch.slug, 'chapitre absent du registre');
    if (ch.generators.length < 6 || ch.generators.length > 13) fail(ch.slug, `${ch.generators.length} types (attendu 6 à 12, 13 pour le 01 avec « Ranger »)`);
  }
}
let nGen = 0;
for (const ch of chapters.filter((c) => !process.env.ONLY || c.slug.startsWith(process.env.ONLY))) for (const g of ch.generators) {
  nGen++;
  for (const level of g.levels) {
    const keys = new Map<string, number>();
    const ctxBase = `${ch.slug.slice(0, 2)} ${g.id} ★${level}`;
    for (let i = 0; i < N; i++) {
      const seed = hashSeed('t', g.id, level, i);
      const ctx = `${ctxBase} graine ${seed.toString(36)}`;
      let e: ExerciseBody;
      try {
        e = g.generate(makeRng(seed), level);
      } catch (err) {
        fail(ctx, `exception : ${(err as Error).message}`);
        continue;
      }
      if (i < 200) {
        const again = g.generate(makeRng(seed), level);
        if (JSON.stringify(again) !== JSON.stringify(e)) fail(ctx, 'non déterministe');
      }
      try {
        checkOne(g, level, seed, e, ctx);
      } catch (err) {
        fail(ctx, `exception pendant la vérification : ${(err as Error).stack}`);
      }
      keys.set(e.key, (keys.get(e.key) ?? 0) + 1);
    }
    const distinct = keys.size;
    const top = Math.max(...keys.values());
    // doublons : sur une série de 10, la probabilité de revoir un même énoncé doit rester faible
    const pSame = [...keys.values()].reduce((s, c) => s + (c * (c - 1)) / (N * (N - 1)), 0);
    report.push(`${ctxBase.padEnd(28)} ${String(distinct).padStart(5)} énoncés distincts / ${N} · max ${top} · P(2 tirages identiques) = ${(pSame * 100).toFixed(2)} %`);
    if (pSame > 0.01) fail(ctxBase, `trop de doublons : P = ${(pSame * 100).toFixed(2)} %`);
    if (top / N > 0.025) fail(ctxBase, `un énoncé revient trop souvent (${top} fois sur ${N})`);
  }
}
// ------------------------------------------------------------------ automatismes (questions flash par niveau)
// Mêmes vérifications ; doublons tolérés un peu plus (faits numériques en nombre fini : tables, carrés…),
// sans risque en séance : une séance n'utilise jamais deux fois le même type.
if (!ONLY || ONLY.split(',').includes('auto')) {
  for (const L of AUTO) {
    const ids = L.gens.map((g) => g.id);
    if (new Set(ids).size !== ids.length) fail(`auto ${L.cls}`, 'identifiants en double');
    for (const id of ids) if (!id.startsWith(`a${L.cls[0]}-`)) fail(`auto ${L.cls}`, `identifiant mal préfixé : ${id}`);
    L.seances.forEach((s, k) => {
      if (s.length !== PER_SEANCE || new Set(s).size !== s.length) fail(`auto ${L.cls} séance ${k + 1}`, `${s.length} types (attendu ${PER_SEANCE} distincts)`);
      for (const id of s) if (!ids.includes(id)) fail(`auto ${L.cls} séance ${k + 1}`, `type inconnu ${id}`);
    });
    for (const g of L.gens) {
      nGen++;
      if (g.levels.join() !== '1') fail(`auto ${g.id}`, 'un automatisme a un seul niveau');
      const keys = new Map<string, number>();
      const ctxBase = `auto ${g.id}`;
      for (let i = 0; i < N; i++) {
        const seed = hashSeed('t', g.id, 1, i);
        const ctx = `${ctxBase} graine ${seed.toString(36)}`;
        let e: ExerciseBody;
        try { e = g.generate(makeRng(seed), 1); } catch (err) { fail(ctx, `exception : ${(err as Error).message}`); continue; }
        if (i < 200 && JSON.stringify(g.generate(makeRng(seed), 1)) !== JSON.stringify(e)) fail(ctx, 'non déterministe');
        if (e.steps.length !== 1) fail(ctx, 'un automatisme = une seule question');
        try { checkOne(g, 1, seed, e, ctx); } catch (err) { fail(ctx, `exception pendant la vérification : ${(err as Error).stack}`); }
        keys.set(e.key, (keys.get(e.key) ?? 0) + 1);
      }
      const top = Math.max(...keys.values());
      const pSame = [...keys.values()].reduce((s, c) => s + (c * (c - 1)) / (N * (N - 1)), 0);
      report.push(`${ctxBase.padEnd(28)} ${String(keys.size).padStart(5)} énoncés distincts / ${N} · max ${top} · P(2 tirages identiques) = ${(pSame * 100).toFixed(2)} %`);
      if (pSame > 0.03) fail(ctxBase, `trop de doublons : P = ${(pSame * 100).toFixed(2)} %`);
      if (top / N > 0.06) fail(ctxBase, `un énoncé revient trop souvent (${top} fois sur ${N})`);
    }
  }
}
console.log(report.join('\n'));
console.log(`\n${nGen} générateurs (${chapters.length} chapitres) · ${N} graines par niveau · ${((Date.now() - t0) / 1000).toFixed(1)} s · ${failures} échec(s)`);
process.exit(failures ? 1 : 0);
