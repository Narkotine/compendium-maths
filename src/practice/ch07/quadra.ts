/** Équations produit nul (★★) et x² = a (★★) : réponses sous forme d'ensemble de solutions. */
import { type Q, q, neg, eq, div, isInt, toNum, cmp, sqrtQ, mul, gcd } from '../engine/q';
import { texQ } from '../engine/expr';
import { N, D, X, lin, term, sumE, prod, pow, eqn, texEq, tex, type Equation } from '../engine/expr';
import { nat } from '../engine/linear';
import type { Generator, ExerciseBody, Rich, Mistake, Val } from '../engine/types';
import { LINKS, m } from './common';

const sortQ = (xs: Q[]) => [...xs].sort(cmp);
/** Racines écrites comme dans le cours : entiers ou fractions (−5/2). */
const rt = (v: Q) => texQ(v);
const listFr = (xs: string[]) => (xs.length === 1 ? xs[0] : xs.slice(0, -1).join(', ') + ' et ' + xs[xs.length - 1]);
function setMistakes(good: Q[], list: [Q[] | null, Rich][]): Mistake[] {
  const key = (xs: Q[]) => sortQ(xs).map((v) => `${v.n}/${v.d}`).filter((v, i, a) => a.indexOf(v) === i).join(';');
  const seen = new Set([key(good)]);
  const out: Mistake[] = [];
  for (const [v, msg] of list) {
    if (!v) continue;
    const k = key(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ on: 'set', value: v.filter((x, i) => v.findIndex((y) => eq(x, y)) === i), msg });
  }
  return out;
}
const SET_PROMPT = 'Donne **toutes** les solutions, séparées par « ; » (valeurs exactes).';

// ===================================================================== produit nul
/** Facteur a·x + b (a > 0), racine −b/a. */
interface F {
  a: number;
  b: number;
}
const root = (f: F) => q(-f.b, f.a);
const fExpr = (f: F) => lin(f.a, f.b);

export const produitNul: Generator = {
  id: 'produit-nul',
  title: 'Équations produit nul',
  desc: 'A × B = 0 équivaut à A = 0 ou B = 0.',
  stars: 2,
  levels: [2, 3],
  example: '(x - 3)(2x + 5) = 0',
  course: LINKS.s41,
  generate(rng, level) {
    const form =
      level === 2
        ? rng.weighted([['(x-p)(x+q)', 3], ['(ax+b)(cx+d)', 3], ['x(x+a)', 2]] as const)
        : rng.weighted([['x2+ax', 2], ['ax2=bx', 2], ['x2-k2', 1.5], ['(x+p)2-k2', 3], ['(ax+b)(cx+d)', 1]] as const);
    let E: Equation, factors: F[], k = 1; // k : coefficient devant le produit (3x(x − 4))
    const pre: Rich[] = [];
    const mist: [Q[] | null, Rich][] = [];
    let hint = 'Un produit est nul si l’un de ses facteurs est nul : écris « premier facteur $= 0$ ou second facteur $= 0$ ».';
    if (form === '(x-p)(x+q)') {
      const r1 = rng.signed(1, 9);
      let r2 = rng.signed(1, 9);
      while (r2 === r1 || r2 === -r1) r2 = rng.signed(1, 9);
      factors = [{ a: 1, b: -r1 }, { a: 1, b: -r2 }];
      E = eqn(prod(fExpr(factors[0]), fExpr(factors[1])), N(0));
    } else if (form === '(ax+b)(cx+d)') {
      const a = rng.int(2, 5), b = rng.intNot(-9, 9, 0);
      if (gcd(a, b) !== 1) return produitNul.generate(rng, level);
      const c = rng.chance(0.5) ? 1 : rng.int(2, 4), d = rng.intNot(-9, 9, 0);
      if (gcd(c, d) !== 1 || eq(q(-b, a), q(-d, c)) || eq(q(-b, a), q(d, c))) return produitNul.generate(rng, level);
      factors = rng.shuffle([{ a, b }, { a: c, b: d }]);
      E = eqn(prod(fExpr(factors[0]), fExpr(factors[1])), N(0));
      const f = factors.find((u) => u.a !== 1)!;
      mist.push([factors.map((u) => (u === f ? q(-f.b) : root(u))), `Pour ${m(`${tex(fExpr(f))} = 0`)}, on obtient ${m(`${tex(term(f.a))} = ${-f.b}`)}, puis on **divise** par ${m(String(f.a))}.`]);
      mist.push([factors.map((u) => (u === f ? q(-f.a, f.b) : root(u))), `Attention : ${m(`${tex(term(f.a))} = ${-f.b}`)} donne ${m(`x = \\dfrac{${-f.b}}{${f.a}} = ${rt(root(f))}`)} (on divise par le coefficient de $x$, et pas l’inverse).`]);
    } else if (form === 'x(x+a)') {
      const a = rng.signed(1, 12);
      k = rng.chance(0.3) ? rng.int(2, 5) : 1;
      factors = [{ a: 1, b: 0 }, { a: 1, b: a }];
      E = eqn(prod(N(k), X, lin(1, a)), N(0));
      mist.push([[q(-a)], `Il manque une solution : le facteur ${m(k === 1 ? 'x' : `${k}x`)} peut aussi être nul, donc ${m('x = 0')} est solution.`]);
    } else if (form === 'x2+ax' || form === 'ax2=bx') {
      const a = form === 'x2+ax' ? rng.signed(1, 12) : rng.signed(1, 9);
      k = form === 'ax2=bx' ? rng.int(2, 6) : 1;
      factors = [{ a: 1, b: 0 }, { a: 1, b: a }];
      // k x² + k a x = 0 ou k x² = −k a x
      if (form === 'x2+ax') {
        E = eqn(sumE(pow(X), term(a)), N(0));
        pre.push(`On factorise par ${m('x')} : ${m(`x^2 ${a > 0 ? '+' : '-'} ${tex(term(Math.abs(a)))} = x(${tex(lin(1, a))})`)}.`);
        hint = `Factorise d’abord : ${m('x')} est un facteur commun aux deux termes.`;
      } else {
        E = eqn(term(k, pow(X)), term(-k * a));
        pre.push(`On ramène tout dans le membre de gauche : ${m(`${tex(sumE(term(k, pow(X)), term(k * a)))} = 0`)} (on ${-k * a > 0 ? 'soustrait' : 'ajoute'} ${m(tex(term(Math.abs(k * a))))} aux deux membres).`);
        pre.push(`On factorise par ${m(`${k}x`)} : ${m(`${k}x(${tex(lin(1, a))}) = 0`)}.`);
        hint = `Ne divise pas par ${m('x')} (il peut valoir $0$) : ramène tout à gauche, puis factorise par ${m(`${k}x`)}.`;
      }
      mist.push([[q(-a)], `Tu as perdu la solution ${m('0')} : on ne divise jamais par ${m('x')}, qui peut valoir ${m('0')}. On factorise.`]);
    } else if (form === 'x2-k2') {
      const kk = rng.int(2, 15);
      factors = [{ a: 1, b: -kk }, { a: 1, b: kk }];
      E = eqn(sumE(pow(X), N(-kk * kk)), N(0));
      pre.push(`On reconnaît ${m('a^2 - b^2 = (a - b)(a + b)')} : ${m(`x^2 - ${kk * kk} = x^2 - ${kk}^2 = (x - ${kk})(x + ${kk})`)}.`);
      hint = `${m(String(kk * kk))} est le carré de ${m(String(kk))} : utilise ${m('a^2 - b^2 = (a - b)(a + b)')}.`;
      mist.push([[q(kk)], `Il manque une solution : ${m(`(-${kk})^2 = ${kk * kk}`)} aussi.`]);
    } else {
      // (x + p)² − k² = 0
      const p = rng.signed(1, 6), kk = rng.int(2, 9);
      if (kk === Math.abs(p)) return produitNul.generate(rng, level);
      factors = [{ a: 1, b: p - kk }, { a: 1, b: p + kk }];
      E = eqn(sumE(pow(lin(1, p)), N(-kk * kk)), N(0));
      const P = tex(lin(1, p));
      pre.push(`On reconnaît ${m('a^2 - b^2 = (a - b)(a + b)')} avec ${m(`a = ${P}`)} et ${m(`b = ${kk}`)} :`);
      pre.push(m(`(${P})^2 - ${kk}^2 = (${P} - ${kk})(${P} + ${kk}) = (${tex(lin(1, p - kk))})(${tex(lin(1, p + kk))})`));
      hint = `Écris ${m(String(kk * kk))} comme un carré, puis utilise ${m('a^2 - b^2 = (a - b)(a + b)')} avec ${m(`a = ${P}`)}.`;
      mist.push([[q(-p + kk), q(-p - kk)].map(neg), `Attention aux signes : ${m(`${tex(lin(1, p - kk))} = 0`)} donne ${m(`x = ${-(p - kk)}`)}.`]);
      mist.push([[q(kk - p)], `Il manque une solution : ${m(`(${P})^2 = ${kk * kk}`)} donne aussi ${m(`${P} = -${kk}`)}.`]);
      mist.push([[q(kk), q(-kk)], `Ce sont les solutions de ${m(`x^2 = ${kk * kk}`)}. Ici, c’est ${m(P)} qui vaut ${m(String(kk))} ou ${m(String(-kk))}.`]);
    }
    const sols = sortQ(factors.map(root));
    // erreurs de signe (racine b au lieu de −b) pour chaque facteur non réduit à x
    const nz = factors.filter((f) => f.b !== 0);
    mist.unshift([factors.map((f) => neg(root(f))), `Attention aux signes : ${m(`${tex(fExpr(nz[0]))} = 0`)} donne ${m(`x = ${rt(root(nz[0]))}`)}.`]);
    factors.forEach((f, i) => f.b !== 0 && mist.push([factors.map((g, j) => (i === j ? neg(root(g)) : root(g))), `Attention au signe : ${m(`${tex(fExpr(f))} = 0`)} donne ${m(`x = ${rt(root(f))}`)}.`]));
    const facTex = (f: F, i: number) => (f.b === 0 && i === 0 && k !== 1 ? `${k}x` : tex(fExpr(f)));
    const solve1 = (f: F, i: number) => {
      const r = root(f);
      if (f.b === 0) return k !== 1 && i === 0 ? `${m(`${k}x = 0`)} donne ${m('x = 0')}` : m('x = 0');
      if (f.a === 1) return `${m(`${facTex(f, i)} = 0`)} donne ${m(`x = ${rt(r)}`)}`;
      return `${m(`${facTex(f, i)} = 0`)} donne ${m(`${tex(term(f.a))} = ${-f.b}`)}, soit ${m(`x = ${rt(r)}`)}`;
    };
    const lines: Rich[] = [m(texEq(E)), ...pre];
    lines.push(`Un produit est nul si l’un de ses facteurs est nul : ${m(`${facTex(factors[0], 0)} = 0`)} ou ${m(`${facTex(factors[1], 1)} = 0`)}.`);
    lines.push(`${solve1(factors[0], 0)} ;`);
    lines.push(`${solve1(factors[1], 1)}.`);
    lines.push(`L’équation a deux solutions : ${listFr(sols.map((s) => m(rt(s))))}.`);
    lines.push(`Contrôle : pour ${m(`x = ${rt(root(factors[0]))}`)}, le premier facteur vaut ${m('0')} ; pour ${m(`x = ${rt(root(factors[1]))}`)}, le second vaut ${m('0')} ✓`);
    const body: ExerciseBody = {
      title: 'Résoudre l’équation.',
      display: texEq(E),
      form: 'Solutions exactes : entiers ou fractions.',
      steps: [{ prompt: SET_PROMPT, answer: { kind: 'set', expect: sols.map((v) => ({ q: v })) }, hint, mistakes: setMistakes(sols, mist) }],
      solution: lines,
      answer: `Solutions : ${listFr(sols.map((s) => m(rt(s))))}`,
      key: texEq(E),
      data: { kind: 'equation', eq: E, solutions: sols },
    };
    return body;
  },
};

// ===================================================================== x² = a
const SQUARES_DEC: [number, number][] = [[25, 100], [49, 100], [16, 100], [81, 100], [144, 100], [9, 100], [36, 100], [225, 100], [169, 100]];

export const carre: Generator = {
  id: 'carre',
  title: 'Équations x² = a',
  desc: 'Deux solutions, une seule ou aucune, selon le signe de a.',
  stars: 2,
  levels: [2, 3],
  example: 'x^2 = 49',
  course: LINKS.s42,
  links: [LINKS.ch4],
  generate(rng, level) {
    const form =
      level === 2
        ? rng.weighted([['carre', 3.5], ['racine', 3], ['zero', 0.25], ['negatif', 1.4], ['arrondi', 1.5]] as const)
        : rng.weighted([['x2+b=c', 3], ['kx2=c', 3], ['(x+p)2=k2', 3], ['decimal', 1.5], ['negatif3', 0.7]] as const);
    // on construit d'abord a (valeur de x²), puis l'équation de départ
    let a: Q, E: Equation;
    const pre: Rich[] = [];
    let approx: { tol: number; dp: number } | undefined;
    let shift: Q | null = null; // (x + p)² = k² : solutions −p ± k
    let k2 = 0;
    switch (form) {
      case 'carre':
        a = q(rng.int(2, 20) ** 2);
        E = eqn(pow(X), N(a));
        break;
      case 'racine':
      case 'arrondi': {
        // radicande sans facteur carré (√12 = 2√3 n'est pas au programme du chapitre)
        const squareFree = (v: number) => ![4, 9, 16, 25, 36, 49].some((c) => v % c === 0);
        let r = rng.int(2, 99);
        while (!squareFree(r)) r = rng.int(2, 99);
        a = q(r);
        E = eqn(pow(X), N(a));
        if (form === 'arrondi') approx = { tol: 0.005, dp: 2 };
        break;
      }
      case 'zero': {
        a = q(0);
        // x² = 0, ou x² + b = b (même idée, un peu moins immédiate)
        const b = rng.chance(0.35) ? 0 : rng.intNot(-15, 15, 0);
        E = eqn(sumE(pow(X), N(b)), N(b));
        if (b !== 0) {
          pre.push(`${m(`x^2 = ${b} ${b > 0 ? '-' : '+'} ${Math.abs(b)}`)} (on ${b > 0 ? 'soustrait' : 'ajoute'} ${m(String(Math.abs(b)))} aux deux membres)`);
          pre.push(m('x^2 = 0'));
        }
        break;
      }
      case 'negatif':
        a = q(-rng.int(1, 50));
        E = eqn(pow(X), N(a));
        break;
      case 'x2+b=c': {
        const sqv = rng.chance(0.75) ? rng.int(2, 12) ** 2 : rng.chance(0.3) ? -rng.int(1, 20) : rng.pick([2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 34, 35, 37, 38, 39]);
        const b = rng.intNot(-20, 20, 0);
        a = q(sqv);
        E = eqn(sumE(pow(X), N(b)), N(sqv + b));
        pre.push(`${m(`x^2 = ${sqv + b} ${b > 0 ? '-' : '+'} ${Math.abs(b)}`)} (on ${b > 0 ? 'soustrait' : 'ajoute'} ${m(String(Math.abs(b)))} aux deux membres)`);
        pre.push(m(`x^2 = ${sqv}`));
        break;
      }
      case 'kx2=c': {
        const kk = rng.int(2, 6);
        const sqv = rng.chance(0.75) ? rng.int(1, 10) ** 2 : rng.pick([2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19]);
        a = q(sqv);
        E = eqn(term(kk, pow(X)), N(kk * sqv));
        pre.push(`${m(`x^2 = \\dfrac{${kk * sqv}}{${kk}}`)} (on divise les deux membres par ${m(String(kk))})`);
        pre.push(m(`x^2 = ${sqv}`));
        break;
      }
      case '(x+p)2=k2': {
        const p = rng.signed(1, 8), kk = rng.int(1, 9);
        if (kk === Math.abs(p)) return carre.generate(rng, level);
        k2 = kk;
        a = q(kk * kk);
        shift = q(p);
        E = eqn(pow(lin(1, p)), N(kk * kk));
        break;
      }
      case 'decimal': {
        const [n, d] = rng.pick(SQUARES_DEC);
        a = q(n, d);
        E = eqn(pow(X), D(a));
        break;
      }
      default: {
        // x² + b = c avec c − b < 0 : aucune solution
        const sqv = -rng.int(1, 25), b = rng.int(2, 30);
        a = q(sqv);
        E = eqn(sumE(pow(X), N(b)), N(sqv + b));
        pre.push(`${m(`x^2 = ${sqv + b} - ${b}`)} (on soustrait ${m(String(b))} aux deux membres)`);
        pre.push(m(`x^2 = ${sqv}`));
      }
    }
    const r = sqrtQ(a);
    const isNeg = a.n < 0, isZero = a.n === 0;
    let expect: Val[];
    let sols: Q[] | 'none';
    if (isNeg) {
      expect = [];
      sols = 'none';
    } else if (isZero) {
      expect = [{ q: q(0) }];
      sols = [q(0)];
    } else if (shift) {
      const s = [q(-shift.n + k2), q(-shift.n - k2)];
      expect = sortQ(s).map((v) => ({ q: v }));
      sols = sortQ(s);
    } else if (r) {
      expect = [{ q: neg(r) }, { q: r }];
      sols = [neg(r), r];
    } else {
      expect = [{ sqrt: a, s: -1 }, { sqrt: a, s: 1 }];
      sols = [];
    }
    const rts = r ? nat(r) : `\\sqrt{${nat(a)}}`;
    const rootVal = Math.sqrt(toNum(a));
    const ap = (x: number) => (Math.round(x * 100) / 100).toFixed(2).replace('.', '{,}');
    const lines: Rich[] = [m(texEq(E)), ...pre];
    let hint: Rich;
    const mist: [Q[] | null, Rich][] = [];
    if (isNeg) {
      lines.push(`Un carré n’est jamais négatif : ${m(`x^2 = ${nat(a)}`)} n’a **aucune solution**.`);
      hint = `Peut-on obtenir un nombre négatif en élevant un nombre au carré ?`;
      const ra = sqrtQ(neg(a));
      if (ra) mist.push([[ra, neg(ra)], `${m(`${nat(ra)}^2 = ${nat(neg(a))}`)} et ${m(`(-${nat(ra)})^2 = ${nat(neg(a))}`)}, pas ${m(nat(a))} : un carré n’est jamais négatif.`]);
    } else if (isZero) {
      lines.push(`Seul ${m('0')} a pour carré ${m('0')} : une seule solution, ${m('0')}.`);
      hint = 'Quel nombre a pour carré $0$ ?';
    } else if (shift) {
      const P = tex(lin(1, shift.n));
      lines.push(`Le nombre ${m(P)} a pour carré ${m(String(k2 * k2))} : ${m(`${P} = ${k2}`)} ou ${m(`${P} = -${k2}`)}.`);
      lines.push(`${m(`x = ${k2 - shift.n}`)} ou ${m(`x = ${-k2 - shift.n}`)}.`);
      lines.push(`Les solutions sont ${listFr((sols as Q[]).map((s) => m(nat(s))))}.`);
      lines.push(`Contrôle : ${m(`(${k2 - shift.n} ${shift.n > 0 ? '+' : '-'} ${Math.abs(shift.n)})^2 = ${k2}^2 = ${k2 * k2}`)} et ${m(`(${-k2 - shift.n} ${shift.n > 0 ? '+' : '-'} ${Math.abs(shift.n)})^2 = (-${k2})^2 = ${k2 * k2}`)} ✓`);
      hint = `Pose ${m(`X = ${P}`)} : ${m(`X^2 = ${k2 * k2}`)} donne ${m(`X = ${k2}`)} ou ${m(`X = -${k2}`)}.`;
      mist.push([[q(k2 - shift.n)], `Il manque une solution : ${m(P)} peut aussi valoir ${m(String(-k2))}.`]);
      mist.push([[q(k2 + shift.n), q(-k2 + shift.n)], `Attention aux signes : ${m(`${P} = ${k2}`)} donne ${m(`x = ${k2} ${shift.n > 0 ? '-' : '+'} ${Math.abs(shift.n)} = ${k2 - shift.n}`)}.`]);
      mist.push([[q(k2), q(-k2)], `Ce sont les valeurs de ${m(P)}, pas celles de ${m('x')}.`]);
    } else {
      lines.push(`${m(nat(a))} est positif : deux solutions, ${m(`x = ${rts}`)} ou ${m(`x = -${rts}`)}${r ? ` (car ${m(`${rts}^2 = ${nat(a)}`)})` : ''}.`);
      if (approx) lines.push(`Arrondies au centième : ${m(`x \\approx ${ap(rootVal)}`)} ou ${m(`x \\approx -${ap(rootVal)}`)}.`);
      else lines.push(`Les solutions sont ${m(r ? nat(r) : rts)} et ${m(`-${rts}`)}.`);
      hint = r ? `Quels nombres ont pour carré ${m(nat(a))} ? (Il y en a deux.)` : `${m(nat(a))} n’est pas un carré parfait : les solutions s’écrivent avec ${m('\\sqrt{\\phantom{a}}')}${approx ? ', puis arrondis à la calculatrice' : ' (touche « √ »)'}.`;
      if (r) {
        mist.push([[r], `Il manque une solution : ${m(`(-${rts})^2 = ${nat(a)}`)} aussi.`]);
        if (isInt(a) && a.n % 2 === 0) mist.push([[div(a, q(2)), neg(div(a, q(2)))], `${m('x^2')} n’est pas ${m('2x')} : on cherche les nombres dont le **carré** vaut ${m(nat(a))}.`]);
        if (!isInt(a)) {
          mist.push([[div(r, q(10)), neg(div(r, q(10)))], `Attention aux décimales : ${m(`${nat(r)}^2 = ${nat(a)}`)}.`]);
        }
      } else if (approx) {
        const rd = q(Math.round(rootVal * 100), 100), tr = q(Math.floor(rootVal * 100), 100);
        mist.push([[rd], `Il manque une solution : ${m(`-\\sqrt{${nat(a)}}`)} aussi.`]);
        if (!eq(rd, tr)) mist.push([[tr, neg(tr)], `Presque : ${m(`\\sqrt{${nat(a)}} \\approx ${String(rootVal.toFixed(4)).replace('.', '{,}')}`)} s’arrondit au centième à ${m(ap(rootVal))} (le chiffre suivant est ${m('5')} ou plus).`]);
      }
    }
    if (!isNeg && !shift && !isZero && (form === 'x2+b=c' || form === 'kx2=c')) {
      const base = r ? nat(r) : `\\left(${rts}\\right)`;
      const c = (E.rhs as { v: Q }).v;
      const ctl = form === 'kx2=c' ? `${tex(E.lhs).replace(/x\^\{2\}/, '')} \\times ${base}^2 = ${tex(E.lhs).replace(/x\^\{2\}/, '')} \\times ${nat(a)} = ${nat(c)}` : `${base}^2${tex(E.lhs).slice(tex(E.lhs).indexOf('}') + 1)} = ${nat(a)}${tex(E.lhs).slice(tex(E.lhs).indexOf('}') + 1)} = ${nat(c)}`;
      lines.push(`Contrôle : ${m(ctl)} ✓ (de même avec ${m(`-${rts}`)}).`);
    }
    const exactSqrt = !r && !isNeg && !isZero && !approx;
    const solsText = isNeg ? 'Aucune solution' : isZero ? `Une seule solution : ${m('0')}` : shift ? `Solutions : ${listFr((sols as Q[]).map((s) => m(nat(s))))}` : approx ? `Solutions : ${m(`\\sqrt{${nat(a)}} \\approx ${ap(rootVal)}`)} et ${m(`-\\sqrt{${nat(a)}} \\approx -${ap(rootVal)}`)}` : `Solutions : ${m(rts)} et ${m(`-${rts}`)}`;
    const body: ExerciseBody = {
      title: 'Résoudre l’équation.',
      display: texEq(E),
      form: approx ? 'Donne les solutions **arrondies au centième**.' : exactSqrt ? 'Donne les valeurs exactes (avec la touche « √ »).' : 'S’il n’y a aucune solution, coche « Aucune solution ».',
      steps: [{ prompt: approx ? 'Donne toutes les solutions, séparées par « ; ».' : SET_PROMPT, answer: { kind: 'set', expect, approx, sqrt: exactSqrt || undefined }, hint, mistakes: setMistakes(sols === 'none' ? [] : (sols as Q[]), mist) }],
      solution: lines,
      answer: solsText,
      key: texEq(E) + (approx ? '|≈' : ''),
      data: { kind: 'square', eq: E, a: shift ? q(k2 * k2) : a },
    };
    void mul;
    return body;
  },
};
