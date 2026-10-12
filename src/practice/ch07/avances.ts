/** Équations avec parenthèses (★★, ★★★) et avec fractions ou décimaux (★★, ★★★). */
import { type Q, q, add, sub, mul, div, neg, eq, isInt, lcm, toNum } from '../engine/q';
import { N, D, X, lin, term, sumE, prod, frac, eqn, texEq, tex, evaluate, type Expr, type Equation } from '../engine/expr';
import { linearLines, checkLine, nat } from '../engine/linear';
import type { Generator, ExerciseBody, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LINKS, m, solveStep, formOf } from './common';
import { type Bloc, P, T, C, sideExpr, sideLin, expandLines, distribMistakes, solveLin } from './blocs';

const conclude = (x: Q) => `La solution est ${m(nat(x))}.`;
function body(E: Equation, x: Q, step: ReturnType<typeof solveStep>, solution: Rich[]): ExerciseBody {
  return {
    title: 'Résoudre l’équation.',
    display: texEq(E),
    form: formOf(x).form,
    steps: [step],
    solution,
    answer: m(`x = ${nat(x)}`),
    key: texEq(E),
    data: { kind: 'equation', eq: E, solutions: [x] },
  };
}

/** Tire une solution : entière, ou fraction de dénominateur |delta| (pour que les constantes restent entières). */
function pickX(rng: Rng, delta: number, pFrac: number, range = 9): Q {
  const d = Math.abs(delta);
  if (d >= 2 && d <= 10 && rng.chance(pFrac)) {
    let x = q(rng.signed(1, range * d), d);
    if (isInt(x)) x = add(x, q(1, d));
    return x;
  }
  return q(rng.signed(1, range));
}
/** Répète un tirage jusqu'à respecter les contraintes. */
function retry<T>(_rng: Rng, f: () => T | null, n = 400): T {
  for (let i = 0; i < n; i++) {
    const r = f();
    if (r) return r;
  }
  throw new Error('générateur : contraintes impossibles');
}

// ===================================================================== parenthèses
export const parentheses: Generator = {
  id: 'parentheses',
  title: 'Avec des parenthèses',
  desc: 'Développer, réduire, puis résoudre.',
  stars: 2,
  levels: [2, 3],
  example: '2(x - 3) = 5x + 1',
  course: LINKS.s24,
  generate(rng, level) {
    const form =
      level === 2
        ? rng.weighted([['k(x+p)=cx+d', 4], ['k(x+p)+r=cx+d', 3], ['k(x+p)=m(x+n)', 3]] as const)
        : rng.weighted([['r-k(x+p)=cx+d', 3], ['k(x+p)-m(x+n)=d', 3], ['k(ax+p)=m(bx+n)', 2], ['k(x+p)=m(x+n)', 1]] as const);
    const pFrac = level === 2 ? 0.2 : 0.4;
    const { L, R, x } = retry(rng, () => {
      let L: Bloc[], R: Bloc[];
      const k = rng.intNot(-6, 7, -1, 0, 1), p = rng.signed(1, 9);
      if (form === 'k(x+p)=cx+d' || form === 'k(x+p)+r=cx+d') {
        const kk = level === 2 ? Math.abs(k) : k;
        const c = rng.intNot(-6, 9, 0, kk);
        L = form === 'k(x+p)=cx+d' ? [P(kk, 1, p)] : [P(kk, 1, p), C(rng.signed(1, 12))];
        const l = sideLin(L);
        const x = pickX(rng, l.a - c, pFrac);
        const d = sub(add(mul(q(l.a - c), x), q(l.b)), q(0));
        if (!isInt(d) || d.n === 0 || Math.abs(d.n) > 60) return null;
        R = [T(c), C(d.n)];
        return { L, R, x };
      }
      if (form === 'k(x+p)=m(x+n)' || form === 'k(ax+p)=m(bx+n)') {
        const kk = level === 2 ? Math.abs(k) : k;
        const a = form === 'k(ax+p)=m(bx+n)' ? rng.signed(2, 4) : 1;
        const b = form === 'k(ax+p)=m(bx+n)' ? rng.signed(1, 4) : 1;
        const mm = rng.intNot(level === 2 ? 2 : -6, 7, -1, 0, 1, kk);
        const delta = kk * a - mm * b;
        if (delta === 0) return null;
        const x = pickX(rng, delta, pFrac);
        // kp − mn = −delta·x
        const rhsConst = mul(q(-delta), x);
        if (!isInt(rhsConst)) return null;
        for (const pp of rng.shuffle([...Array(19)].map((_, i) => i - 9)).filter((v) => v !== 0)) {
          const nn = div(sub(q(kk * pp), rhsConst), q(mm));
          if (isInt(nn) && nn.n !== 0 && Math.abs(nn.n) <= 12 && !(pp === nn.n && a === b) && !(a === b && kk * pp === mm * nn.n)) {
            L = [P(kk, a, pp)];
            R = [P(mm, b, nn.n)];
            return { L, R, x };
          }
        }
        return null;
      }
      if (form === 'r-k(x+p)=cx+d') {
        const kk = rng.chance(0.4) ? 1 : rng.int(2, 5);
        const r = rng.signed(1, 15);
        L = rng.chance(0.6) ? [C(r), P(-kk, 1, p)] : [P(-kk, 1, p), C(r)];
        const c = rng.intNot(-5, 6, 0, -kk);
        const l = sideLin(L);
        const x = pickX(rng, l.a - c, pFrac);
        const d = add(mul(q(l.a - c), x), q(l.b));
        if (!isInt(d) || d.n === 0 || Math.abs(d.n) > 60) return null;
        R = [T(c), C(d.n)];
        return { L, R, x };
      }
      // k(x + p) − m(x + n) = d
      const kk = rng.int(2, 7), mm = rng.int(2, 6), n = rng.signed(1, 9);
      if (kk === mm) return null;
      L = [P(kk, 1, p), P(-mm, 1, n)];
      const l = sideLin(L);
      const x = pickX(rng, l.a, pFrac);
      const d = add(mul(q(l.a), x), q(l.b));
      if (!isInt(d) || Math.abs(d.n) > 60) return null;
      R = [C(d.n)];
      return { L, R, x };
    });
    const E = eqn(sideExpr(L), sideExpr(R));
    const ex = expandLines(L, R);
    const first = L.find((b) => b.paren) ?? R.find((b) => b.paren)!;
    const hint = `Commence par développer : ${m(`${tex(prod(N(first.k), lin(first.a, first.p)))} = ${tex(lin(first.k * first.a, first.k * first.p))}`)}${L.concat(R).filter((b) => b.paren).length > 1 ? ' (et de même pour l’autre parenthèse)' : ''}. Puis regroupe les ${m('x')} d’un côté.`;
    const l = sideLin(L), r = sideLin(R);
    const mist: [Q | null, Rich][] = [
      ...distribMistakes(L, R),
      [solveLin(l.a + r.a, l.b, 0, r.b), `Après avoir développé, pour regrouper les ${m('x')}, on ${r.a < 0 ? `**ajoute** ${m(tex(term(-r.a)))}` : `**soustrait** ${m(tex(term(r.a)))}`} aux deux membres.`],
    ];
    const step = solveStep(x, hint, mist);
    const lines: Rich[] = [m(texEq(E)), ...ex.lines, ...linearLines(ex.lhs, ex.rhs).lines, conclude(x), checkLine(E, { x })];
    return body(E, x, step, lines);
  },
};

// ===================================================================== fractions et décimaux
export const fractions: Generator = {
  id: 'fractions',
  title: 'Avec des fractions ou des décimaux',
  desc: 'Multiplier chaque terme par un dénominateur commun.',
  stars: 2,
  levels: [2, 3],
  example: '\\dfrac{x}{3} + \\dfrac{x}{2} = 10',
  course: LINKS.s24,
  generate(rng, level) {
    const form =
      level === 2
        ? rng.weighted([['x/a+b=c', 3], ['x/a+x/b=c', 3], ['x/a+b=c/d', 2], ['dec', 3]] as const)
        : rng.weighted([['(x+p)/a=(x+q)/b', 4], ['x/a-(x+p)/b=c', 3], ['x/a+x/b=c', 1], ['dec', 1]] as const);
    if (form === 'dec') return decimalEq(rng, level);
    // Chaque membre : liste de termes { num : bloc (ax + p), den }
    type FT = { a: number; p: number; den: number; sgn: 1 | -1 };
    const ft = (a: number, p: number, den: number, sgn: 1 | -1 = 1): FT => ({ a, p, den, sgn });
    let Lt: FT[], Rt: FT[], x: Q;
    const r = retry(rng, () => {
      if (form === 'x/a+b=c') {
        const a = rng.int(2, 9), b = rng.signed(1, 12);
        const t = rng.signed(1, 10);
        const x = q(a * t);
        const c = t + b;
        if (c === 0) return null;
        return { Lt: [ft(1, 0, a), ft(0, b, 1)], Rt: [ft(0, c, 1)], x };
      }
      if (form === 'x/a+x/b=c') {
        const [a, b] = rng.shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 2);
        const L = lcm(a, b);
        if (L > 12 || L === Math.max(a, b)) return null; // évite 2 et 4 (trop simple : 4 = multiple de 2) une fois sur deux
        const minus = level === 3 && rng.chance(0.5);
        const t = rng.int(1, 8) * (rng.chance(0.15) ? -1 : 1);
        const x = q(L * t);
        const c = div(x, q(a)).n + (minus ? -1 : 1) * div(x, q(b)).n;
        if (c === 0) return null;
        return { Lt: [ft(1, 0, a), ft(1, 0, b, minus ? -1 : 1)], Rt: [ft(0, c, 1)], x };
      }
      if (form === 'x/a+b=c/d') {
        const a = rng.pick([2, 3, 4, 5]), d = rng.pick([2, 3, 4, 5, 6]);
        if (a === d) return null;
        const L = lcm(a, d);
        if (L > 12) return null;
        const b = rng.signed(1, 5);
        const cn = rng.signed(1, 13);
        if (cn % d === 0) return null;
        // x/a + b = cn/d → x = a(cn/d − b)
        const x = mul(q(a), sub(q(cn, d), q(b)));
        if (x.n === 0) return null;
        return { Lt: [ft(1, 0, a), ft(0, b, 1)], Rt: [ft(0, cn, d)], x };
      }
      if (form === '(x+p)/a=(x+q)/b') {
        const [a, b] = rng.shuffle([2, 3, 4, 5, 6]).slice(0, 2);
        const L = lcm(a, b);
        if (L > 12) return null;
        const x = q(rng.signed(1, 12));
        // (L/a)(x + p) = (L/b)(x + qq) → qq = ((L/a)(x+p))/(L/b) − x
        const pp = rng.signed(1, 9);
        const qq = sub(div(mul(q(L / a), add(x, q(pp))), q(L / b)), x);
        if (!isInt(qq) || qq.n === 0 || Math.abs(qq.n) > 12 || qq.n === pp) return null;
        return { Lt: [ft(1, pp, a)], Rt: [ft(1, qq.n, b)], x };
      }
      // x/a − (x + p)/b = c
      const [a, b] = rng.shuffle([2, 3, 4, 5, 6]).slice(0, 2);
      const L = lcm(a, b);
      if (L > 12) return null;
      const pp = rng.signed(1, 9);
      const x = q(rng.signed(1, 12) * (L / b === 1 ? 1 : 1));
      const c = sub(div(x, q(a)), div(add(x, q(pp)), q(b)));
      if (!isInt(c) || c.n === 0 || L / a === L / b) return null;
      return { Lt: [ft(1, 0, a), ft(1, pp, b, -1)], Rt: [ft(0, c.n, 1)], x };
    });
    ({ Lt, Rt, x } = r);
    const L = Lt.concat(Rt).reduce((s, t) => lcm(s, t.den), 1);
    const termExpr = (t: FT): Expr => {
      const num = lin(t.a, t.p);
      const e = t.den === 1 ? num : frac(num, N(t.den));
      return t.sgn < 0 ? prod(N(-1), e) : e;
    };
    const sideE = (ts: FT[]) => sumE(...ts.map(termExpr));
    const E = eqn(sideE(Lt), sideE(Rt));
    // ligne « on multiplie chaque terme par L »
    const mulTerm = (t: FT): Expr => {
      if (t.a === 0 && t.p === 0) return prod(N(L), N(0));
      if (t.a === 0) return prod(N(L * t.sgn * Math.sign(t.p)), t.den === 1 ? N(Math.abs(t.p)) : frac(N(Math.abs(t.p)), N(t.den)));
      const inner = t.den === 1 ? lin(t.a, t.p) : frac(lin(t.a, t.p), N(t.den));
      return prod(N(L * t.sgn), inner);
    };
    const line1 = `${m(`${tex(sumE(...Lt.map(mulTerm)))} = ${tex(sumE(...Rt.map(mulTerm)))}`)} (on multiplie **chaque terme** des deux membres par ${m(String(L))})`;
    // après simplification : (L/den)·(ax + p)
    const toBloc = (t: FT): Bloc => {
      const k = (L / t.den) * t.sgn;
      if (t.p !== 0 && t.a !== 0) return k === 1 ? T(t.a, t.p) : P(k, t.a, t.p);
      return t.a !== 0 ? T(k * t.a) : C(k * t.p);
    };
    const Lb = Lt.map(toBloc), Rb = Rt.map(toBloc);
    const line2 = m(`${tex(sideExpr(Lb))} = ${tex(sideExpr(Rb))}`);
    const ex = expandLines(Lb, Rb);
    const lines: Rich[] = [m(texEq(E)), line1, line2, ...ex.lines, ...linearLines(ex.lhs, ex.rhs).lines, conclude(x), checkLine(E, { x })];
    // erreur : un terme n'a pas été multiplié par L (calcul exact en rationnels)
    const mist: [Q | null, Rich][] = [];
    const sides = [Lt, Rt];
    sides.forEach((side, si) =>
      side.forEach((t, i) => {
        if (t.den === L && L !== 1) return;
        const coef = (u: FT, sj: number, j: number) => (sj === si && j === i ? q(u.sgn, u.den) : q((L / u.den) * u.sgn));
        const lin2 = (ss: FT[], sj: number) =>
          ss.reduce((acc, u, j) => ({ a: add(acc.a, mul(coef(u, sj, j), q(u.a))), b: add(acc.b, mul(coef(u, sj, j), q(u.p))) }), { a: q(0), b: q(0) });
        const l = lin2(Lt, 0), r = lin2(Rt, 1);
        mist.push([solveLin(l.a, l.b, r.a, r.b), `Il faut multiplier **chaque terme des deux membres** par ${m(String(L))}, pas seulement certains.`]);
      }),
    );
    if (form === 'x/a-(x+p)/b=c' || form === '(x+p)/a=(x+q)/b') mist.push(...distribMistakes(Lb, Rb));
    const hint =
      L === 1
        ? ''
        : `Multiplie les deux membres par ${m(String(L))}, multiple commun des dénominateurs, pour faire disparaître les fractions${form === 'x/a-(x+p)/b=c' ? ' (attention au signe « − » devant la fraction : il porte sur tout le numérateur)' : ''}.`;
    const step = solveStep(x, hint, mist);
    void evaluate;
    void toNum;
    return body(E, x, step, lines);
  },
};

/** Coefficients décimaux : 2,4x = 18 + 1,2x ; 0,5x + 3 = 1,5x − 2. */
function decimalEq(rng: Rng, level: number): ExerciseBody {
  const r = retry(rng, () => {
    const tenth = () => q(rng.int(2, 35), 10);
    let a = tenth(), c = tenth();
    if (eq(a, c)) return null;
    if (rng.chance(0.3)) c = q(0);
    if (level === 3 && rng.chance(0.4)) a = neg(a);
    const delta = sub(a, c);
    // solution entière (ou décimale simple au niveau 3), constantes au dixième
    const x = level === 3 && rng.chance(0.3) ? q(rng.signed(1, 40), 2) : q(rng.int(1, 30) * (rng.chance(0.15) ? -1 : 1));
    const b = q(rng.signed(1, 90), 10);
    const d = add(mul(delta, x), b);
    if (d.n === 0 || eq(d, b) || d.d > 10 || Math.abs(toNum(d)) > 60) return null;
    if (isInt(a) || (!isInt(c) && c.n !== 0 && isInt(c))) return null;
    return { a, b, c, d, x };
  });
  const { a, b, c, d, x } = r;
  const lhs = rng.chance(0.25) && c.n === 0 ? lin(a, 0, X, 'dec') : sumE(term(a, X, 'dec'), D(b));
  const rhs = c.n === 0 ? D(lhs.k === 'mul' ? sub(d, b) : d) : rng.chance(0.5) ? sumE(D(d), term(c, X, 'dec')) : sumE(term(c, X, 'dec'), D(d));
  const E = eqn(lhs, rhs);
  const xs = div(sub(evaluate(rhs, { x: q(0) }), evaluate(lhs, { x: q(0) })), sub(sub(evaluate(lhs, { x: q(1) }), evaluate(lhs, { x: q(0) })), sub(evaluate(rhs, { x: q(1) }), evaluate(rhs, { x: q(0) }))));
  const A = sub(evaluate(lhs, { x: q(1) }), evaluate(lhs, { x: q(0) })), B = evaluate(lhs, { x: q(0) });
  const Cc = sub(evaluate(rhs, { x: q(1) }), evaluate(rhs, { x: q(0) })), Dd = evaluate(rhs, { x: q(0) });
  const mist: [Q | null, Rich][] = [
    [solveLin(add(A, Cc), B, q(0), Dd), `Pour enlever ${m(tex(term(Cc, X, 'dec')))} du membre de droite, on le **soustrait** aux deux membres.`],
    [solveLin(A, neg(B), Cc, Dd), `Attention au signe de ${m(nat(B))} quand on l’enlève du membre de gauche.`],
  ];
  const hint = Cc.n !== 0 ? `Regroupe les ${m('x')} dans un membre (soustrais ${m(tex(term(Cc, X, 'dec')))} aux deux membres), puis divise par le coefficient de ${m('x')}.` : `Isole le terme en ${m('x')}, puis divise par ${m(nat(A))}.`;
  const step = solveStep(xs, hint, mist);
  const lines: Rich[] = [...linearLines(lhs, rhs, '=', { start: true, style: 'dec' }).lines, conclude(xs), checkLine(E, { x: xs })];
  void x;
  return body(E, xs, step, lines);
}
