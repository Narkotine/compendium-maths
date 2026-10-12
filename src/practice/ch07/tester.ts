/** Tester si un nombre est solution (★) : on calcule chaque membre séparément, puis on compare. */
import { type Q, q, add, mul, eq, neg, sq, cmp as cmpQ } from '../engine/q';
import { N, X, lin, sumE, pow, term, eqn, texEq, tex, evaluate, substitute, holds, texRel, relNot, type Equation, type Rel, type Expr } from '../engine/expr';
import { nat } from '../engine/linear';
import type { Generator, ExerciseBody, Rich, Step, Mistake } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LINKS, m } from './common';

const yesNo = (correctYes: boolean, why: Rich): Step['answer'] => ({
  kind: 'choice',
  options: ['Oui', 'Non'],
  correct: correctYes ? 0 : 1,
  attempts: 1,
  explain: correctYes ? [null, why] : [why, null],
});
const numStep = (prompt: Rich, label: Rich, v: Q, hint: Rich, mistakes: Mistake[] = []): Step => ({
  prompt,
  answer: { kind: 'num', fields: [{ label, expect: v, form: 'any' }] },
  hint,
  mistakes,
});

/** Valeur testée : la solution (ou un point de la frontière), ou une valeur proche. */
function near(rng: Rng, x0: number, pSol: number): number {
  if (rng.chance(pSol)) return x0;
  let v = x0 + rng.signed(1, 3);
  while (v === 0) v = x0 + rng.signed(1, 3);
  return v;
}

/** Erreur de signe classique en remplaçant : a × (−v) calculé comme a × v. */
function signMistakes(E: Expr, v: Q, good: Q): Mistake[] {
  if (v.n >= 0) return [];
  const bad = evaluate(E, { x: neg(v) });
  // −v à la place de v ne correspond à une « erreur de signe » que si le résultat diffère
  return eq(bad, good) ? [] : [{ on: 'num', value: bad, msg: `Attention au signe : on remplace $x$ par ${m(`\\left(${nat(v)}\\right)`)}, avec ses parenthèses.` }];
}

export const tester: Generator = {
  id: 'tester',
  title: 'Tester si un nombre est solution',
  desc: 'Calculer chaque membre séparément, puis comparer.',
  stars: 1,
  levels: [1, 2],
  example: '3x + 2 = 11 \\text{ pour } x = 3',
  course: LINKS.s1,
  generate(rng, level) {
    const form = level === 1 ? 'simple' : rng.weighted([['deux', 3], ['carre', 2], ['ineq', 3]] as const);
    let E: Equation, v: Q;
    if (form === 'simple') {
      const a = rng.chance(0.8) ? rng.int(2, 9) : -rng.int(2, 6);
      const x0 = rng.chance(0.8) ? rng.int(1, 10) : -rng.int(1, 6);
      const b = rng.intNot(-15, 15, 0);
      const c = a * x0 + b;
      v = q(near(rng, x0, 0.5));
      E = eqn(b > 0 && rng.chance(0.3) ? sumE(N(b), term(a)) : lin(a, b), N(c));
    } else if (form === 'deux') {
      const a = rng.intNot(-6, 8, 0, 1, -1), c = rng.intNot(-5, 6, 0, a);
      const x0 = rng.intNot(-6, 9, 0);
      const b = rng.intNot(-12, 12, 0);
      const d = (a - c) * x0 + b;
      if (d === 0) return tester.generate(rng, level);
      v = q(near(rng, x0, 0.5));
      E = eqn(lin(a, b), lin(c, d));
    } else if (form === 'carre') {
      // x² + bx = c, testé avec une valeur négative : le piège (−2)² = 4
      const b = rng.intNot(-6, 6, 0);
      const x0 = -rng.int(1, 5);
      const c = x0 * x0 + b * x0;
      const sol = rng.chance(0.5);
      v = q(sol ? x0 : -rng.int(1, 5));
      if (!sol && v.n * v.n + b * v.n === c) v = q(x0);
      E = eqn(sumE(pow(X), term(b)), N(c));
    } else {
      // inéquation ax + b < c : valeur testée dans l'ensemble, hors de l'ensemble, ou à la frontière (piège de l'inégalité stricte)
      const a = rng.chance(0.75) ? rng.int(2, 7) : -rng.int(2, 5);
      const x0 = rng.intNot(-5, 8, 0), b = rng.intNot(-10, 10, 0);
      const c = a * x0 + b;
      const rel = rng.pick(['<', '>', '<=', '>='] as Rel[]);
      E = eqn(lin(a, b), N(c), rel);
      v = q(rng.chance(0.4) ? x0 : near(rng, x0, 0));
    }
    const L = evaluate(E.lhs, { x: v }), R = evaluate(E.rhs, { x: v });
    const ok = holds(E.rel, L, R);
    const sub = (e: Expr) => tex(substitute(e, { x: v }));
    const rConst = E.rhs.k === 'n';
    const isIneq = E.rel !== '=';
    const steps: Step[] = [];
    const hintL = `Remplace $x$ par ${m(v.n < 0 ? `\\left(${nat(v)}\\right)` : nat(v))} dans le membre de gauche, puis calcule (priorités : ${form === 'carre' ? 'le carré, puis les produits' : 'le produit d’abord'}).`;
    const mistL: Mistake[] = signMistakes(E.lhs, v, L);
    if (form === 'carre' && v.n < 0) mistL.unshift({ on: 'num', value: evaluate(sumE(term(-1, pow(X)), ...(E.lhs.k === 'add' ? E.lhs.t.slice(1) : [])), { x: v }), msg: `Attention : ${m(`\\left(${nat(v)}\\right)^2 = \\left(${nat(v)}\\right) \\times \\left(${nat(v)}\\right) = ${nat(sq(v))}`)}. Un carré n’est jamais négatif.` });
    steps.push(numStep(`Calcule le membre de gauche pour ${m(`x = ${nat(v)}`)}.`, m(`${sub(E.lhs)} =`), L, hintL, mistL.filter((x) => x.on === 'num' && !eq(x.value, L))));
    if (!rConst) steps.push(numStep(`Calcule le membre de droite pour ${m(`x = ${nat(v)}`)}.`, m(`${sub(E.rhs)} =`), R, `Même chose à droite : remplace $x$ par ${m(nat(v))}.`, signMistakes(E.rhs, v, R)));
    const relTex = `${nat(L)} ${texRel(E.rel)} ${nat(R)}`;
    const strictTrap = isIneq && eq(L, R);
    const verdict = ok
      ? `${m(relTex)} : ${isIneq ? 'l’inégalité' : 'l’égalité'} est vraie`
      : isIneq
        ? `${m(`${nat(L)} ${eq(L, R) ? '=' : cmpQ(L, R) < 0 ? '<' : '>'} ${nat(R)}`)} : l’inégalité demandée (${m(`\\ldots ${texRel(E.rel)} \\ldots`)}) n’est pas vérifiée${strictTrap ? ' (inégalité **stricte** : l’égalité ne suffit pas)' : ''}`
        : `${m(`${nat(L)} \\neq ${nat(R)}`)} : les deux membres ne sont pas égaux`;
    const why = `${verdict}, donc ${m(nat(v))} ${ok ? 'est' : 'n’est pas'} solution.`;
    steps.push({
      prompt: `${m(nat(v))} est-il solution de ${isIneq ? 'l’inéquation' : 'l’équation'} ?`,
      answer: yesNo(ok, why),
      hint: '',
    });
    const solution: Rich[] = [
      `Pour ${m(`x = ${nat(v)}`)} :`,
      `membre de gauche : ${m(`${sub(E.lhs)} = ${nat(L)}`)} ;`,
      rConst ? `membre de droite : ${m(nat(R))}.` : `membre de droite : ${m(`${sub(E.rhs)} = ${nat(R)}`)}.`,
      `${verdict}. **${m(nat(v))} ${ok ? 'est' : 'n’est pas'} solution.**`,
    ];
    void add;
    void mul;
    void relNot;
    const body: ExerciseBody = {
      title: isIneq ? 'Tester une valeur dans une inéquation.' : 'Tester si un nombre est solution.',
      statement: `Le nombre ${m(nat(v))} est-il solution de ${isIneq ? 'l’inéquation' : 'l’équation'} ci-dessous ?`,
      display: texEq(E),
      steps,
      solution,
      answer: ok ? `${m(nat(v))} est solution` : `${m(nat(v))} n’est pas solution`,
      key: `${texEq(E)}|${nat(v)}`,
      data: { kind: 'test', eq: E, value: v, isSolution: ok },
    };
    return body;
  },
};
