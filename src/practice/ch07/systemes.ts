/** Systèmes de deux équations à deux inconnues (★★★) : substitution, combinaison, problèmes. */
import { type Q, q, add, sub, mul, div, neg, eq, isInt, gcd, toNum } from '../engine/q';
import { N, D, X, Y, lin, term, sumE, prod, group, eqn, texEq, tex, evaluate, substitute, type Expr, type Equation, type NumStyle } from '../engine/expr';
import { linearLines, nat } from '../engine/linear';
import type { Generator, ExerciseBody, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LINKS, m, euro, twoNames, choice } from './common';

const cases = (a: Equation, b: Equation) => `\\begin{cases} ${texEq(a)} \\\\ ${texEq(b)} \\end{cases}`;
const val = (v: Q, s: NumStyle = 'auto'): Expr => ({ k: 'val', v, s });
/** a x + b y (termes nuls omis). */
const isNul = (v: Q | number) => (typeof v === 'number' ? v === 0 : v.n === 0);
const xy = (a: Q | number, b: Q | number, s: NumStyle = 'auto') => (isNul(b) ? term(a, X, s) : isNul(a) ? term(b, Y, s) : sumE(term(a, X, s), term(b, Y, s)));

/** Lignes de la méthode par combinaison (élimination de y), puis calcul de y dans la première équation. */
function combination(E1: [Q, Q, Q], E2: [Q, Q, Q], s: NumStyle): { lines: Rich[]; x: Q; y: Q } {
  const [a1, b1, e1] = E1, [a2, b2, e2] = E2;
  const lines: Rich[] = [];
  const NN = (v: Q) => N(v, s);
  // multiplicateurs entiers m1, m2 tels que m1·b1 + m2·b2 = 0
  const B1 = mul(b1, q(b1.d * b2.d)), B2 = mul(b2, q(b1.d * b2.d)); // coefficients rendus entiers
  const g = gcd(B1.n, B2.n);
  let m1 = Math.abs(B2.n) / g, m2 = Math.abs(B1.n) / g;
  if (Math.sign(B1.n) === Math.sign(B2.n)) m2 = -m2;
  const show = (k: number, a: Q, b: Q, e: Q) => m(`${tex(xy(mul(q(k), a), mul(q(k), b), s))} = ${nat(mul(q(k), e))}`);
  const sys = (k1: number, k2: number) => m(`\\begin{cases} ${show(k1, a1, b1, e1).slice(1, -1)} \\\\ ${show(k2, a2, b2, e2).slice(1, -1)} \\end{cases}`);
  const pe = (v: Q) => (v.n < 0 ? `(${nat(v)})` : nat(v));
  const memberLine = (op: '+' | '-') => m(`(${tex(xy(a1, b1, s))}) ${op} (${tex(xy(a2, b2, s))}) = ${nat(e1)} ${op} ${pe(e2)}`);
  if (m1 === 1 && m2 === 1) {
    lines.push('Les coefficients de $y$ sont opposés : on **additionne** les deux équations membre à membre.');
    lines.push(memberLine('+'));
  } else if (m1 === 1 && m2 === -1) {
    lines.push('Les coefficients de $y$ sont égaux : on **soustrait** la seconde équation à la première, membre à membre.');
    lines.push(memberLine('-'));
  } else if (m2 === -1) {
    lines.push(`Pour éliminer $y$, on multiplie la première équation par ${m(String(m1))} :`);
    lines.push(sys(m1, 1));
    lines.push('puis on **soustrait** la seconde équation à la première, membre à membre (les termes en $y$ s’éliminent) :');
  } else {
    const parts: string[] = [];
    if (m1 !== 1) parts.push(`la première équation par ${m(String(m1))}`);
    if (m2 !== 1) parts.push(`la seconde par ${m(String(m2))}`);
    lines.push(`Pour éliminer $y$, on multiplie ${parts.join(' et ')} :`);
    lines.push(sys(m1, m2));
    lines.push('puis on **additionne** membre à membre (les termes en $y$ s’éliminent) :');
  }
  const A = add(mul(q(m1), a1), mul(q(m2), a2)), Ee = add(mul(q(m1), e1), mul(q(m2), e2));
  lines.push(m(`${tex(term(A, X, s))} = ${nat(Ee)}`));
  const x = div(Ee, A);
  if (!eq(A, q(1))) lines.push(`${m(`x = \\dfrac{${nat(Ee)}}{${nat(A)}}${`\\dfrac{${nat(Ee)}}{${nat(A)}}` === nat(x) ? '' : ` = ${nat(x)}`}`)}`);
  // y dans la première équation
  lines.push(`On remplace ${m('x')} par ${m(nat(x))} dans la première équation :`);
  const lhsY = sumE(prod(NN(a1), val(x, s)), term(b1, Y, s));
  const ax = mul(a1, x);
  lines.push(m(`${tex(lhsY)} = ${nat(e1)}`));
  const ry = linearLines(sumE(N(ax, s), term(b1, Y, s)), NN(e1), '=', { v: 'y', style: s, start: !eq(a1, q(1)) || true });
  lines.push(...ry.lines);
  return { lines, x, y: ry.x };
}

export const systeme: Generator = {
  id: 'systeme',
  title: 'Systèmes de deux équations',
  desc: 'Trouver le couple (x ; y) : par substitution ou par combinaison.',
  stars: 3,
  levels: [3],
  example: '\\begin{cases} y = 2x + 1 \\\\ 3x + y = 11 \\end{cases}',
  course: LINKS.s8,
  generate(rng) {
    const form = rng.weighted([['substitution', 3], ['combinaison', 4], ['contexte', 3]] as const);
    if (form === 'contexte') return contexte(rng);
    let E1: Equation, E2: Equation, x: Q, y: Q;
    const lines: Rich[] = [];
    let hint: Rich;
    if (form === 'substitution') {
      for (;;) {
        x = q(rng.intNot(-5, 8, 0));
        const a = rng.intNot(-5, 5, 0), b = rng.intNot(-9, 9, 0);
        y = add(mul(q(a), x), q(b));
        const c = rng.intNot(-6, 6, 0), d = rng.intNot(-5, 5, 0);
        if (c + d * a === 0 || y.n === 0 || Math.abs(y.n) > 25) continue;
        const e = add(mul(q(c), x), mul(q(d), y));
        E1 = eqn(Y, lin(a, b));
        E2 = eqn(xy(c, d), N(e));
        const sub_ = d === 1 ? group(lin(a, b)) : prod(N(d), lin(a, b));
        const start = sumE(term(c), sub_);
        lines.push(m(cases(E1, E2)));
        lines.push(`Par **substitution** : on remplace ${m('y')} par ${m(tex(lin(a, b)))} dans la seconde équation.`);
        lines.push(m(`${tex(start)} = ${nat(e)}`));
        const ex = sumE(term(c), lin(d * a, d * b));
        const red = lin(c + d * a, d * b);
        if (tex(ex) !== tex(red)) lines.push(`${m(`${tex(ex)} = ${nat(e)}`)}${d !== 1 ? ' (on développe)' : ''}`);
        const r = linearLines(red, N(e), '=', { start: true });
        lines.push(...r.lines);
        lines.push(`Puis ${m(`y = ${tex(substitute(lin(a, b), { x }))} = ${nat(y)}`)}.`);
        hint = `La première équation donne ${m('y')} en fonction de ${m('x')} : remplace ${m('y')} par ${m(tex(lin(a, b)))} dans la seconde${d !== 1 ? ' (avec des parenthèses)' : ''}.`;
        break;
      }
    } else {
      for (;;) {
        const opp = rng.chance(0.4);
        const b1 = rng.intNot(-5, 5, 0, 1, -1);
        const b2 = opp ? -b1 : rng.intNot(-5, 5, 0, b1, -b1);
        const a1 = rng.intNot(-5, 6, 0), a2 = rng.intNot(-5, 6, 0);
        if (a1 * b2 - a2 * b1 === 0) continue;
        x = q(rng.intNot(-5, 8, 0));
        y = opp && rng.chance(0.25) && Math.abs(b1) > 1 ? q(rng.signed(1, 3 * Math.abs(b1)), Math.abs(b1)) : q(rng.intNot(-6, 8, 0));
        if (isInt(y) && y.n === 0) continue;
        const e1 = add(mul(q(a1), x), mul(q(b1), y)), e2 = add(mul(q(a2), x), mul(q(b2), y));
        if (!isInt(e1) || !isInt(e2) || Math.abs(e1.n) > 50 || Math.abs(e2.n) > 50) continue;
        E1 = eqn(xy(a1, b1), N(e1));
        E2 = eqn(xy(a2, b2), N(e2));
        lines.push(m(cases(E1, E2)));
        const c = combination([q(a1), q(b1), e1], [q(a2), q(b2), e2], 'auto');
        if (!eq(c.x, x) || !eq(c.y, y)) throw new Error('systeme : combinaison incohérente');
        lines.push(...c.lines);
        hint = opp ? 'Les coefficients de $y$ sont opposés : additionne les deux équations membre à membre, $y$ disparaît.' : `Combine les deux équations (en les multipliant si besoin) pour éliminer ${m('y')} : coefficients opposés → on additionne ; coefficients égaux → on soustrait.`;
        break;
      }
    }
    lines.push(`La solution du système est le couple ${m(`(${nat(x!)}\\,;${nat(y!)})`)}.`);
    const env = { x: x!, y: y! };
    const ctl = (E: Equation) =>
      E.lhs.k === 'v' ? m(`${tex(substitute(E.rhs, { x: x! }))} = ${nat(evaluate(E.rhs, env))}`) : m(`${tex(substitute(E.lhs, env))} = ${nat(evaluate(E.lhs, env))}`);
    lines.push(`Contrôle : ${ctl(E1!)} ✓ et ${ctl(E2!)} ✓`);
    const fields = [
      { label: m('x ='), expect: x!, form: 'any' as const },
      { label: m('y ='), expect: y!, form: 'any' as const },
    ];
    const swap = [{ on: 'num' as const, field: 0, value: y!, msg: 'As-tu inversé $x$ et $y$ ? Le couple s’écrit $(x\\,;y)$.' }];
    return {
      title: 'Résoudre le système.',
      display: cases(E1!, E2!),
      form: isInt(x!) && isInt(y!) ? 'Les solutions sont des nombres entiers.' : 'Donne les valeurs exactes (entiers ou fractions).',
      steps: [{ prompt: 'Donne le couple solution.', answer: { kind: 'num', fields }, hint: hint!, mistakes: eq(x!, y!) ? [] : swap }],
      solution: lines,
      answer: m(`(x\\,;y) = (${nat(x!)}\\,;${nat(y!)})`),
      key: cases(E1!, E2!),
      data: { kind: 'system', eqs: [E1!, E2!], x: x!, y: y! },
    };
  },
};

// ===================================================================== en contexte
interface Ctx {
  /** prix (en centimes) des deux articles, et pas de tirage */
  x: [number, number, number];
  y: [number, number, number];
  item: [string, string]; // singulier
  items: [string, string]; // pluriel
  label: [string, string];
  intro: (who: string, q1: number, q2: number, tot: string, i: number) => string;
  qx?: [number, number];
  qy?: [number, number];
  sx: string;
  sy: string;
  answer: (x: string, y: string) => string;
}
/** « de Ana » → « d’Ana », « de Hugo » → « d’Hugo ». */
const de = (w: string) => (/^[AEIOUYÉH]/.test(w) ? `d’${w}` : `de ${w}`);
const nb = (k: number, one: string, many: string) => `${m(String(k))} ${k > 1 ? many : one}`;
const CTXS: Ctx[] = [
  {
    x: [120, 350, 10], y: [50, 180, 10],
    item: ['cahier', 'stylo'], items: ['cahiers', 'stylos'], label: ['Un cahier :', 'Un stylo :'],
    intro: (w, a, b, t) => `${w} achète ${nb(a, 'cahier', 'cahiers')} et ${nb(b, 'stylo', 'stylos')} pour ${t}.`,
    sx: 'le prix d’un cahier', sy: 'celui d’un stylo',
    answer: (x, y) => `Un cahier coûte ${x} et un stylo ${y}.`,
  },
  {
    x: [700, 1200, 50], y: [400, 650, 50],
    item: ['place adulte', 'place enfant'], items: ['places adulte', 'places enfant'], label: ['Place adulte :', 'Place enfant :'],
    intro: (w, a, b, t, i) => `${i === 0 ? 'Au cinéma, la' : 'La'} famille ${de(w)} paie ${t} pour ${nb(a, 'place adulte', 'places adulte')} et ${nb(b, 'place enfant', 'places enfant')}.`,
    qx: [1, 3], qy: [1, 4],
    sx: 'le prix d’une place adulte', sy: 'celui d’une place enfant',
    answer: (x, y) => `Une place adulte coûte ${x} et une place enfant ${y}.`,
  },
  {
    x: [90, 130, 5], y: [100, 160, 5],
    item: ['croissant', 'pain au chocolat'], items: ['croissants', 'pains au chocolat'], label: ['Un croissant :', 'Un pain au chocolat :'],
    intro: (w, a, b, t, i) => `${i === 0 ? 'À la boulangerie, ' : ''}${w} paie ${t} pour ${nb(a, 'croissant', 'croissants')} et ${nb(b, 'pain au chocolat', 'pains au chocolat')}.`,
    sx: 'le prix d’un croissant', sy: 'celui d’un pain au chocolat',
    answer: (x, y) => `Un croissant coûte ${x} et un pain au chocolat ${y}.`,
  },
];
const cents = (rng: Rng, [a, b, st]: [number, number, number]) => a + st * rng.int(0, Math.floor((b - a) / st));

function contexte(rng: Rng): ExerciseBody {
  const C = rng.pick(CTXS);
  let px: number, py: number, k: number[];
  for (;;) {
    px = cents(rng, C.x);
    py = cents(rng, C.y);
    const [qx, qy] = [C.qx ?? [1, 5], C.qy ?? [1, 5]];
    k = [rng.int(qx[0], qx[1]), rng.int(qy[0], qy[1]), rng.int(qx[0], qx[1]), rng.int(qy[0], qy[1])];
    const det = k[0] * k[3] - k[1] * k[2];
    if (px === py || det === 0 || (k[0] === k[2] && k[1] === k[3]) || (k[0] === k[1] && k[2] === k[3])) continue;
    // une des deux équations a un coefficient 1 sur une inconnue au plus une fois sur deux : déjà le cas statistiquement
    break;
  }
  const x = q(px, 100), y = q(py, 100);
  const t1 = add(mul(q(k[0]), x), mul(q(k[1]), y)), t2 = add(mul(q(k[2]), x), mul(q(k[3]), y));
  const [w1, w2] = twoNames(rng);
  const E1 = eqn(xy(k[0], k[1]), D(t1)), E2 = eqn(xy(k[2], k[3]), D(t2));
  const statement = [C.intro(w1, k[0], k[1], euro(t1), 0), C.intro(w2, k[2], k[3], euro(t2), 1), `On note ${m('x')} ${C.sx} et ${m('y')} ${C.sy}, en euros.`].join('\n');
  // QCM : quel système traduit l'énoncé ?
  const bads: [Equation, Equation, Rich][] = [
    [eqn(xy(k[1], k[0]), D(t1)), eqn(xy(k[3], k[2]), D(t2)), `Les quantités sont inversées : ${m('x')} est ${C.sx}.`],
    [eqn(xy(k[0], k[1]), D(t2)), eqn(xy(k[2], k[3]), D(t1)), 'Les prix totaux sont échangés : chaque total va avec son propre achat.'],
    [eqn(xy(k[0] + k[1], 0), D(t1)), eqn(xy(k[2], k[3]), D(t2)), `${m(`${k[0] + k[1]}x`)} supposerait que tous les articles ont le même prix.`],
  ];
  const ok = (E: Equation) => eq(evaluate(E.lhs, { x, y }), evaluate(E.rhs, { x, y }));
  const good = m(cases(E1, E2));
  const badOpts = bads.filter(([a, b]) => !(ok(a) && ok(b)) && cases(a, b) !== cases(E1, E2)).map(([a, b, why]) => [m(cases(a, b)), why] as [Rich, Rich]);
  const steps: Step[] = [
    { prompt: 'Quel système traduit l’énoncé ?', answer: choice(rng, good, badOpts), hint: `Chaque achat donne une équation : (nombre de ${C.items[0]}) ${m('\\times x')} + (nombre de ${C.items[1]}) ${m('\\times y')} = prix payé.` },
    {
      prompt: 'Résous le système, puis donne les prix.',
      answer: { kind: 'num', fields: [{ label: C.label[0], unit: '€', expect: x, form: 'any' }, { label: C.label[1], unit: '€', expect: y, form: 'any' }] },
      hint: `Combine les deux équations (en les multipliant si besoin) pour éliminer ${m('y')} : coefficients opposés → on additionne ; coefficients égaux → on soustrait.`,
      mistakes: [{ on: 'num', field: 0, value: y, msg: 'As-tu inversé les deux prix ?' }],
    },
  ];
  const c = combination([q(k[0]), q(k[1]), t1], [q(k[2]), q(k[3]), t2], 'dec');
  if (!eq(c.x, x) || !eq(c.y, y)) throw new Error('contexte : combinaison incohérente');
  const lines: Rich[] = [`Soit ${m('x')} ${C.sx} et ${m('y')} ${C.sy}, en euros.`, `Chaque achat donne une équation : ${m(cases(E1, E2))}`, ...c.lines];
  lines.push(`**${C.answer(euro(x), euro(y))}**`);
  lines.push(`Contrôle : ${m(`${k[0]} \\times ${nat(x)} + ${k[1]} \\times ${nat(y)} = ${nat(t1)}`)} et ${m(`${k[2]} \\times ${nat(x)} + ${k[3]} \\times ${nat(y)} = ${nat(t2)}`)} ✓`);
  void toNum;
  void sub;
  void neg;
  return {
    title: 'Résoudre un problème à l’aide d’un système.',
    statement,
    steps,
    solution: lines,
    answer: C.answer(euro(x), euro(y)),
    key: statement.replace(/^[^ ]+ /, ''),
    data: { kind: 'system', eqs: [E1, E2], x, y },
  };
}
