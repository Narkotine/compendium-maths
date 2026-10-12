/**
 * Équations simples (★) : x + a = b, ax = b (et x / a = b), ax + b = c.
 * Construction à rebours : on choisit la solution, puis les coefficients, et on calcule le second membre.
 */
import { type Q, q, add, sub, mul, div, neg, eq, isInt } from '../engine/q';
import { N, D, X, term, sumE, frac, eqn, texEq, texQ, type Expr, type Equation, tex } from '../engine/expr';
import { linearLines, checkLine, nat } from '../engine/linear';
import type { Generator, ExerciseBody, Level, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LINKS, m, solveStep, formOf, safeDiv, mostlyPositive } from './common';

/** Corps commun « résoudre l'équation E, de solution x ». */
function body(E: Equation, x: Q, step: ReturnType<typeof solveStep>, solution: Rich[], o: { form?: Rich } = {}): ExerciseBody {
  return {
    title: 'Résoudre l’équation.',
    display: texEq(E),
    form: o.form ?? formOf(x).form,
    steps: [step],
    solution,
    answer: `${m(`x = ${nat(x)}`)}`,
    key: texEq(E),
    data: { kind: 'equation', eq: E, solutions: [x] },
  };
}
const conclude = (x: Q) => `La solution est ${m(nat(x))}.`;

// ===================================================================== x + a = b
export const xPlusA: Generator = {
  id: 'x-plus-a',
  title: 'Équations x + a = b',
  desc: 'Ajouter ou soustraire le même nombre aux deux membres.',
  stars: 1,
  levels: [1, 2],
  example: 'x + 7 = 12',
  course: LINKS.s21,
  generate(rng: Rng, level: Level) {
    let x: Q, a: Q, style: 'auto' | 'dec' = 'auto';
    if (level === 1) {
      x = q(mostlyPositive(rng, [1, 25], [1, 15], 0.25));
      a = q(rng.int(2, 30));
    } else {
      // décimaux à un ou deux chiffres après la virgule
      style = 'dec';
      const dx = rng.chance(0.7) ? 10 : 100;
      x = q(mostlyPositive(rng, [3, dx === 10 ? 150 : 900], [3, dx === 10 ? 90 : 500], 0.3), dx);
      a = q(rng.int(11, 99), 10);
      if (isInt(x)) x = add(x, q(1, 10));
      if (isInt(a)) a = add(a, q(1, 10));
    }
    // forme : x + a = b ; x − a = b ; a + x = b ; b = x + a
    const f = rng.weighted([['plus', 4], ['moins', 4], ['avant', 1.5], ['droite', 1]] as const);
    const A = (v: Q) => (style === 'dec' ? D(v) : N(v));
    let lhs: Expr, rhs: Expr, opA: Q;
    if (f === 'moins') {
      lhs = sumE(X, A(neg(a)));
      rhs = A(sub(x, a));
      opA = neg(a);
    } else {
      opA = a;
      const b = add(x, a);
      lhs = f === 'avant' ? sumE(A(a), X) : sumE(X, A(a));
      rhs = A(b);
    }
    let E = eqn(lhs, rhs);
    if (f === 'droite') E = eqn(rhs, lhs);
    const b = add(x, opA);
    const hint =
      opA.n > 0
        ? `Pour isoler ${m('x')}, on fait l’opération inverse : on **soustrait** ${m(nat(opA))} aux deux membres.`
        : `Pour isoler ${m('x')}, on fait l’opération inverse : on **ajoute** ${m(nat(neg(opA)))} aux deux membres.`;
    const wrongOp =
      opA.n > 0
        ? `Tu as ajouté ${m(nat(opA))} au lieu de le soustraire : l’opération inverse de « ${m('+\\,' + nat(opA))} » est « ${m('-\\,' + nat(opA))} ».`
        : `Tu as soustrait ${m(nat(neg(opA)))} au lieu de l’ajouter : l’opération inverse de « ${m('-\\,' + nat(neg(opA)))} » est « ${m('+\\,' + nat(neg(opA)))} ».`;
    const step = solveStep(x, hint, [[add(b, opA), wrongOp]]);
    const lines: Rich[] =
      f === 'droite'
        ? [m(texEq(E)), `On lit l’égalité dans l’autre sens : ${m(texEq(eqn(lhs, rhs)))}.`, ...linearLines(lhs, rhs, '=', { style }).lines, conclude(x)]
        : [...linearLines(E.lhs, E.rhs, '=', { start: true, style }).lines, conclude(x)];
    lines.push(checkLine(E, { x }));
    return body(E, x, step, lines);
  },
};

// ===================================================================== ax = b, x / a = b
export const axEqB: Generator = {
  id: 'ax-egal-b',
  title: 'Équations ax = b',
  desc: 'Diviser (ou multiplier) les deux membres par un même nombre non nul.',
  stars: 1,
  levels: [1, 2],
  example: '5x = 35',
  course: LINKS.s21,
  links: [LINKS.s22],
  generate(rng, level) {
    const f =
      level === 1
        ? rng.weighted([['ax', 5], ['-ax', 2], ['x/a', 2]] as const)
        : rng.weighted([['frac-sol', 4], ['dec', 3], ['p/q x', 2], ['x/a', 1]] as const);
    let a: Q, x: Q, E: Equation, lhs: Expr, style: 'auto' | 'dec' = 'auto';
    const lines: Rich[] = [];
    let hint: Rich, mist: [Q | null, Rich][] = [];
    if (f === 'x/a') {
      // x / a = b : on multiplie par a
      const A = rng.int(2, level === 1 ? 9 : 12);
      const b = q(level === 1 ? mostlyPositive(rng, [1, 12], [1, 9], 0.25) : rng.signed(2, 15));
      x = mul(b, q(A));
      lhs = frac(X, N(A));
      E = eqn(lhs, N(b));
      hint = `Ici ${m('x')} est **divisé** par ${m(String(A))} : on fait l’opération inverse, on multiplie les deux membres par ${m(String(A))}.`;
      mist = [
        [div(b, q(A)), `${m('x')} est divisé par ${m(String(A))} : pour le retrouver, on **multiplie** par ${m(String(A))} (on ne divise pas).`],
        [sub(b, q(A)), `On ne soustrait pas : ${m('x')} est divisé par ${m(String(A))}, on multiplie donc par ${m(String(A))}.`],
      ];
      lines.push(m(texEq(E)), `${m(`${A} \\times \\dfrac{x}{${A}} = ${A} \\times ${nat(b).replace(/^(-.*)$/, '\\left($1\\right)')}`)} (on multiplie les deux membres par ${m(String(A))})`, m(`x = ${nat(x)}`));
    } else if (f === 'p/q x') {
      // (p/q) x = c, solution entière multiple de q
      a = rng.pick([q(2, 3), q(3, 4), q(2, 5), q(3, 5), q(4, 5), q(4, 3), q(3, 2), q(5, 2), q(5, 3), q(5, 4), q(7, 4), q(7, 3), q(5, 6)]);
      x = q(rng.int(1, 8) * a.d);
      if (rng.chance(0.25)) x = neg(x);
      const c = mul(a, x);
      lhs = term(a);
      E = eqn(lhs, N(c));
      const inv = q(a.d, a.n);
      hint = `Pour isoler ${m('x')}, multiplie les deux membres par ${m(texQ(inv))}, l’inverse de ${m(texQ(a))}.`;
      mist = [
        [mul(c, a), `On ne multiplie pas par ${m(texQ(a))} : il faut multiplier par son inverse ${m(texQ(inv))} (ou diviser par ${m(texQ(a))}).`],
        [sub(c, a), `${m(texQ(a))} multiplie ${m('x')} : on divise par ${m(texQ(a))}, on ne le soustrait pas.`],
      ];
      lines.push(m(texEq(E)), `${m(`x = ${nat(c).replace(/^(-.*)$/, '\\left($1\\right)')} \\times ${texQ(inv)} = ${nat(x)}`)} (on multiplie les deux membres par ${m(texQ(inv))}, l’inverse de ${m(texQ(a))})`);
    } else {
      if (f === 'dec') {
        style = 'dec';
        a = rng.pick([q(1, 2), q(3, 2), q(5, 2), q(6, 5), q(12, 5), q(4, 5), q(3, 10), q(7, 10), q(1, 4), q(3, 4), q(5, 4)]);
        if (rng.chance(0.25)) a = neg(a);
        x = q(rng.int(2, Math.max(5, Math.floor(60 / a.d))) * a.d);
        if (rng.chance(0.25)) x = neg(x);
      } else if (f === 'frac-sol') {
        a = q(rng.signed(2, 9));
        const k = rng.signed(1, 40);
        x = q(k, a.n);
        if (isInt(x)) x = q(k * Math.abs(a.n) + rng.int(1, Math.abs(a.n) - 1), Math.abs(a.n));
      } else {
        a = q(f === '-ax' ? -rng.int(2, 9) : rng.int(2, 12));
        x = q(mostlyPositive(rng, [1, 12], [1, 10], f === '-ax' ? 0.4 : 0.25));
      }
      const b = mul(a, x);
      lhs = term(a, X, style);
      E = eqn(lhs, style === 'dec' ? D(b) : N(b));
      hint = `Le nombre ${m(nat(a))} **multiplie** ${m('x')} : on divise les deux membres par ${m(nat(a))}.`;
      mist = [
        [sub(b, a), `Le ${m(nat(a))} multiplie ${m('x')} : on **divise** par ${m(nat(a))}, on ne le soustrait pas.`],
        [mul(b, a), `On divise par ${m(nat(a))}, on ne multiplie pas.`],
        [safeDiv(a, b), `Attention au sens de la division : c’est ${m(nat(b))} qu’on divise par ${m(nat(a))}.`],
      ];
      lines.push(...linearLines(lhs, E.rhs, '=', { start: true, style }).lines);
    }
    const step = solveStep(x, hint, mist);
    lines.push(conclude(x), checkLine(E, { x }));
    return body(E, x, step, lines);
  },
};

// ===================================================================== ax + b = c
export const axPlusB: Generator = {
  id: 'ax-plus-b',
  title: 'Équations ax + b = c',
  desc: 'Soustraire b, puis diviser par a.',
  stars: 1,
  levels: [1, 2],
  example: '3x + 2 = 11',
  course: LINKS.s21,
  links: [LINKS.s22],
  generate(rng, level) {
    let a: number, x: Q, b: number;
    if (level === 1) {
      a = rng.int(2, 9);
      x = q(mostlyPositive(rng, [1, 12], [1, 6], 0.25));
      b = rng.signed(1, 20);
    } else {
      a = rng.signed(2, 12);
      b = rng.signed(1, 30);
      if (rng.chance(0.5)) {
        const k = rng.signed(1, 30);
        x = q(k, Math.abs(a));
        if (isInt(x)) x = add(x, q(rng.int(1, Math.abs(a) - 1), Math.abs(a)));
      } else x = q(rng.signed(1, 15));
    }
    const c = add(mul(q(a), x), q(b));
    // formes : ax + b = c ; b + ax = c ; c = ax + b ; b − ax = c (a < 0, niveau 1 compris : « 7 − 2x = 15 »)
    let f = rng.weighted([['std', 6], ['avant', 1.5], ['droite', 1], ['b-ax', level === 1 ? 1.5 : 0]] as const);
    if (f === 'b-ax') {
      a = -a;
      b = Math.abs(b);
      const c2 = add(mul(q(a), x), q(b));
      return finish(sumE(N(b), term(a)), N(c2), x, a, b, c2, false);
    }
    const ax = term(a);
    const L = f === 'avant' ? sumE(N(b), ax) : sumE(ax, N(b));
    return finish(L, N(c), x, a, b, c, f === 'droite');

    function finish(lhs: Expr, rhs: Expr, x: Q, a: number, b: number, c: Q, swap: boolean): ExerciseBody {
      const E = swap ? eqn(rhs, lhs) : eqn(lhs, rhs);
      const A = q(a), B = q(b);
      const hint =
        b > 0
          ? `Commence par isoler le terme en ${m('x')} : on soustrait ${m(String(b))} aux deux membres. Puis on divise par ${m(String(a))}.`
          : `Commence par isoler le terme en ${m('x')} : on ajoute ${m(String(-b))} aux deux membres. Puis on divise par ${m(String(a))}.`;
      const signMsg =
        b > 0
          ? `Tu as ajouté ${m(String(b))} au lieu de le soustraire : pour enlever « ${m('+\\,' + b)} », on soustrait ${m(String(b))} aux deux membres.`
          : `Tu as soustrait ${m(String(-b))} au lieu de l’ajouter : pour enlever « ${m('-\\,' + -b)} », on ajoute ${m(String(-b))} aux deux membres.`;
      const mist: [Q | null, Rich][] = [
        [div(add(c, B), A), signMsg],
        [sub(c, B), `Tu as trouvé la valeur de ${m(tex(term(a)))}, pas celle de ${m('x')} : il reste à diviser par ${m(String(a))}.`],
        [sub(div(c, A), B), `Ordre des opérations : on enlève d’abord ${m(String(Math.abs(b)))}, **puis** on divise par ${m(String(a))} (on remonte le programme de calcul à l’envers).`],
        [mul(sub(c, B), A), `${m(String(a))} multiplie ${m('x')} : on **divise** par ${m(String(a))}, on ne multiplie pas.`],
      ];
      const step = solveStep(x, hint, mist);
      const lines: Rich[] = [];
      if (swap) {
        lines.push(m(texEq(E)), `On lit l’égalité dans l’autre sens : ${m(texEq(eqn(lhs, rhs)))}.`);
        lines.push(...linearLines(lhs, rhs).lines);
      } else lines.push(...linearLines(lhs, rhs, '=', { start: true }).lines);
      lines.push(conclude(x), checkLine(E, { x }));
      return body(E, x, step, lines);
    }
  },
};

// ===================================================================== ax + b = cx + d
export const deuxMembres: Generator = {
  id: 'deux-membres',
  title: 'Inconnue des deux côtés',
  desc: 'Regrouper les x d’un même côté, les nombres de l’autre.',
  stars: 1,
  levels: [1, 2],
  example: '3x + 5 = x + 13',
  course: LINKS.s23,
  generate(rng, level) {
    let a: number, c: number, x: Q, b: number;
    if (level === 1) {
      c = rng.int(1, 7);
      a = c + rng.int(1, 5);
      x = q(mostlyPositive(rng, [1, 12], [1, 5], 0.2));
      b = rng.signed(1, 15);
    } else {
      do {
        a = rng.signed(1, 9);
        c = rng.signed(1, 9);
      } while (a === c || (Math.abs(a) === 1 && Math.abs(c) === 1));
      b = rng.signed(1, 20);
      const dd = Math.abs(a - c);
      if (dd > 1 && dd <= 9 && rng.chance(0.4)) {
        x = q(rng.signed(1, 25), dd);
        if (isInt(x)) x = add(x, q(1, dd));
      } else x = q(rng.signed(1, 12));
    }
    // d = (a − c)x + b, non nul et différent de b
    let d = add(mul(q(a - c), x), q(b));
    if (d.n === 0 || eq(d, q(b))) {
      b += b > 0 ? 3 : -3;
      d = add(mul(q(a - c), x), q(b));
    }
    const sw = level === 2 && rng.chance(0.25); // nombre en tête : 5 + 3x = 13 + x
    const lhs = sw ? sumE(N(b), term(a)) : sumE(term(a), N(b));
    const rhs = sw && isInt(d) ? sumE(N(d), term(c)) : sumE(term(c), N(d));
    const E = eqn(lhs, rhs);
    const A = q(a), C = q(c), B = q(b);
    const cx = tex(term(Math.abs(c)));
    const hint = `Regroupe les ${m('x')} dans le membre de gauche : ${c > 0 ? 'soustrais' : 'ajoute'} ${m(cx)} aux deux membres. Puis isole ${m('x')} comme pour ${m('ax + b = c')}.`;
    const mist: [Q | null, Rich][] = [
      [safeDiv(sub(d, B), add(A, C)), `Pour enlever ${m(tex(term(c)))} du membre de droite, on ${c > 0 ? '**soustrait**' : '**ajoute**'} ${m(cx)} aux **deux** membres : à gauche il reste ${m(tex(term(a - c)))}, pas ${m(tex(term(a + c)))}.`],
      [safeDiv(add(d, B), sub(A, C)), b > 0 ? `Attention au ${m(String(b))} : pour l’enlever, on le **soustrait** aux deux membres.` : `Attention au ${m(String(b))} : pour l’enlever, on **ajoute** ${m(String(-b))} aux deux membres.`],
      [a - c !== 1 ? sub(d, B) : null, `Il reste à diviser par le coefficient de ${m('x')}, ${m(String(a - c))}.`],
      [safeDiv(sub(d, B), A), `Les ${m('x')} doivent tous être du même côté avant de diviser : n’oublie pas ${m(tex(term(c)))}.`],
    ];
    const step = solveStep(x, hint, mist);
    const lines = [...linearLines(lhs, rhs, '=', { start: true }).lines, conclude(x), checkLine(E, { x })];
    return body(E, x, step, lines);
  },
};
