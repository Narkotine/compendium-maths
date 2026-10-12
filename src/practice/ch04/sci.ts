/** Notation scientifique (★ → ★★) : écrire, revenir à l'écriture décimale, calculer, comparer. */
import { type Q, q, mul, div, toNum, cmp } from '../engine/q';
import type { Generator, Level, Mistake, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, dn, numStep, shuffledChoice } from '../engine/build';
import { LINKS, bg, P10, sci, sciFields, sciJs } from './common';

const L = ['a', 'b', 'c', 'd'];
/** Mantisse aléatoire 1 ≤ a < 10, 1 à 3 chiffres significatifs. */
const mant = (rng: Rng, sig = rng.int(1, 3)): Q => {
  for (;;) {
    const k = sig - 1;
    const n = rng.int(10 ** k, 10 ** (k + 1) - 1);
    if (n % 10 === 0 && sig > 1) continue;
    return q(n, 10 ** k);
  }
};
const sciStep = (prompt: Rich, a: Q, n: number, hint: Rich, extra: Mistake[] = []): Step => ({
  prompt,
  answer: { kind: 'num', fields: sciFields(a, n) },
  hint,
  mistakes: [
    ...extra,
    ...(n === 0 ? [] : [{ on: 'numAll' as const, values: [a, q(-n)], msg: n > 0 ? 'Grand nombre (plus grand que 10) : l’exposant est **positif**.' : 'Petit nombre (plus petit que 1) : l’exposant est **négatif**.' }]),
    { on: 'numAll', values: [a, q(n + 1)], msg: 'Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.' },
    { on: 'numAll', values: [a, q(n - 1)], msg: 'Le nombre $a$ est juste, mais l’exposant a un rang d’écart : recompte de combien de rangs la virgule s’est déplacée.' },
  ],
});
const SCI_RULE = 'Notation scientifique : un nombre $a$ avec **un seul chiffre non nul avant la virgule** ($1 \\leqslant a < 10$), puis $\\times 10^n$.';

export const scientifique: Generator = {
  id: 'scientifique',
  title: 'Notation scientifique',
  desc: 'Écrire en notation scientifique, revenir à l’écriture décimale ; cas comme 23 × 10⁴ (★★).',
  stars: 1,
  levels: [1, 2],
  example: '0{,}0072 = 7{,}2 \\times 10^{-3}',
  course: LINKS.s51,
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], ans: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [];
    // a) décimal → scientifique (un grand, un petit)
    const n1 = rng.int(3, 9), n2 = -rng.int(2, 6);
    const exps = rng.shuffle([n1, n2]);
    for (const n of exps) {
      const a = mant(rng);
      const x = mul(a, P10(n));
      const i = steps.length;
      steps.push(sciStep(`${L[i]}) Écris ${m(bg(x))} en notation scientifique.`, a, n, n > 0 ? 'Place la virgule après le premier chiffre, puis compte de combien de rangs elle a reculé.' : 'Place la virgule juste après le premier chiffre non nul, puis compte de combien de rangs elle a avancé.',
        [{ on: 'numAll', values: [mul(a, q(10)), q(n - 1)], msg: SCI_RULE }, { on: 'numAll', values: [div(a, q(10)), q(n + 1)], msg: SCI_RULE }]));
      sol.push(`${L[i]}) ${m(`${bg(x)} = ${sci(a, n)}`)} (virgule déplacée de ${Math.abs(n)} rang${Math.abs(n) > 1 ? 's' : ''}, ${n > 0 ? 'grand nombre : exposant positif' : 'petit nombre : exposant négatif'}).`);
      ans.push(m(sci(a, n)));
      items.push(...sciJs(`${toNum(x)}`, a, n, L[i]));
    }
    // b) scientifique → décimal
    const a3 = mant(rng), n3 = rng.chance(0.5) ? rng.int(2, 6) : -rng.int(1, 5);
    const x3 = mul(a3, P10(n3));
    steps.push(numStep(`c) Donne l’écriture décimale de ${m(sci(a3, n3))}.`, '', x3, n3 > 0 ? `Multiplier par ${m(`10^{${n3}}`)} : la virgule avance de ${n3} rangs vers la droite.` : `Multiplier par ${m(`10^{${n3}}`)}, c’est diviser par ${m(`10^{${-n3}}`)}.`,
      [[mul(a3, P10(-n3)), n3 > 0 ? 'Exposant positif : le nombre est **grand**.' : 'Exposant négatif : le nombre est **petit** (mais positif).'], [mul(a3, P10(n3 + 1)), 'Un rang de trop.'], [mul(a3, P10(n3 - 1)), 'Un rang de moins.']], { form: 'decimal', shown: bg(x3) }));
    sol.push(`c) ${m(`${sci(a3, n3)} = ${bg(x3)}`)}.`);
    ans.push(m(bg(x3)));
    items.push({ what: 'dec', js: `${toNum(a3)}*10**${n3}`, expect: toNum(x3), tol: toNum(x3) * 1e-12 });
    if (level === 2) {
      // d) écriture non normalisée → scientifique
      for (;;) {
        const mm = rng.pick([q(rng.int(11, 99)), q(rng.int(101, 999)), q(rng.int(1, 9), 10), q(rng.int(11, 99), 1000), q(rng.int(1, 9), 100), q(rng.int(11, 99) * 10)]);
        if (toNum(mm) >= 1 && toNum(mm) < 10) continue;
        const k = rng.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
        let a = mm, sh = 0;
        while (toNum(a) >= 10) { a = div(a, q(10)); sh++; }
        while (toNum(a) < 1) { a = mul(a, q(10)); sh--; }
        if (sh === 0) continue;
        const n = k + sh;
        const mmx = mul(mm, P10(0));
        steps.push(sciStep(`d) Écris ${m(sci(mmx, k))} en notation scientifique.`, a, n, `Écris d’abord ${m(dn(mm))} en notation scientifique, puis regroupe les puissances de 10.`, [{ on: 'numAll', values: [a, q(k)], msg: `${m(dn(mm))} a changé : ${m(`${dn(mm)} = ${sci(a, sh)}`)}, il faut en tenir compte dans l’exposant.` }, { on: 'numAll', values: [a, q(k - sh)], msg: `${m(`${dn(mm)} = ${sci(a, sh)}`)} : il faut ${sh > 0 ? `**ajouter** ${m(String(sh))}` : `**retirer** ${m(String(-sh))}`} à l’exposant, pas l’inverse.` }]));
        sol.push(`d) ${m(`${sci(mm, k)} = ${sci(a, sh)} \\times 10^{${k}} = ${sci(a, n)}`)}.`);
        ans.push(m(sci(a, n)));
        items.push(...sciJs(`${toNum(mm)}*10**${k}`, a, n, 'd'));
        break;
      }
    }
    return { title: 'Notation scientifique.', steps, solution: sol, answer: ans.join(' ; '), key: steps.map((s) => s.prompt).join('|'), data: { kind: 'js', items } };
  },
};

// ===================================================================== calculer et comparer
const normSci = (a: Q, n: number): [Q, number] => { let x = a, e = n; while (toNum(x) >= 10) { x = div(x, q(10)); e++; } while (toNum(x) < 1) { x = mul(x, q(10)); e--; } return [x, e]; };
export const calculsci: Generator = {
  id: 'calculsci',
  title: 'Calculer et comparer',
  desc: 'Produit et quotient en notation scientifique ; le plus grand de quatre nombres.',
  stars: 2,
  levels: [2],
  example: '(3 \\times 10^5) \\times (4 \\times 10^{-2}) = 1{,}2 \\times 10^4',
  course: LINKS.s52,
  generate(rng: Rng) {
    const e = () => rng.pick([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
    // a) produit
    const a1 = q(rng.int(2, 9)), a2 = rng.pick([q(rng.int(2, 9)), q(rng.int(11, 95), 10)]);
    const p1 = e(), p2 = e();
    const [pa, pn] = normSci(mul(a1, a2), p1 + p2);
    const prod = mul(a1, a2);
    // b) quotient
    let b1: Q, b2: Q;
    do { b2 = q(rng.int(2, 8)); b1 = rng.pick([mul(b2, q(rng.int(2, 9))), mul(b2, q(rng.int(11, 49), 10)), q(rng.int(1, 9))]); } while (toNum(b1) >= 10 || !(toNum(div(b1, b2)) * 1000 % 1 === 0));
    const q1 = e(), q2 = e();
    const [qa, qn] = normSci(div(b1, b2), q1 - q2);
    const quo = div(b1, b2);
    const pp = (v: number) => (v < 0 ? `(${v})` : String(v));
    const tA = `(${dn(a1)} \\times 10^{${p1}}) \\times (${dn(a2)} \\times 10^{${p2}})`;
    const tB = `\\dfrac{${dn(b1)} \\times 10^{${q1}}}{${dn(b2)} \\times 10^{${q2}}}`;
    // c) le plus grand
    const base = rng.int(-4, 8);
    const nums: [Q, number][] = [[mant(rng, 2), base + 1], [q(rng.int(91, 99), 10), base], [mant(rng, 2), base - 1], [mul(q(rng.int(5, 9)), q(1)), base - 2]];
    const keyOf = (x: [Q, number]) => toNum(x[0]) * 10 ** x[1];
    const best = nums.reduce((A, B) => (keyOf(B) > keyOf(A) ? B : A));
    const trap = nums[1];
    const tex = (x: [Q, number]) => m(sci(x[0], x[1]));
    const bad = nums.filter((x) => x !== best).map((x) => [tex(x), x === trap ? `${m(dn(trap[0]))} est grand, mais on compare d’abord les **exposants** : ${m(`10^{${trap[1]}} < 10^{${best[1]}}`)}.` : `On compare d’abord les exposants : ${m(`10^{${x[1]}} < 10^{${best[1]}}`)}.`] as [Rich, Rich]);
    return {
      title: 'Calcule en notation scientifique, puis compare.',
      steps: [
        { prompt: `a) ${m(tA)}`, answer: { kind: 'num', fields: sciFields(pa, pn) }, hint: 'Regroupe les nombres d’un côté, les puissances de 10 de l’autre, puis réajuste si le nombre dépasse 10.', mistakes: [...(p1 * p2 === p1 + p2 ? [] : [{ on: 'numAll' as const, values: [pa, q(p1 * p2 + pn - p1 - p2)], msg: 'Produit de puissances de 10 : on **additionne** les exposants.' }]), ...(eqQ(pa, prod) ? [] : [{ on: 'numAll' as const, values: [prod, q(p1 + p2)], msg: `Égalité juste, mais ${m(dn(prod))} n’est pas entre 1 et 10 : réajuste.` }, { on: 'numAll' as const, values: [pa, q(p1 + p2)], msg: `En écrivant ${m(`${dn(prod)} = ${sci(pa, 1)}`)}, il faut ajouter 1 à l’exposant.` }])] },
        { prompt: `b) ${m(tB)}`, answer: { kind: 'num', fields: sciFields(qa, qn) }, hint: `Divise ${m(dn(b1))} par ${m(dn(b2))}, puis ${m(`10^{${q1}}`)} par ${m(`10^{${q2}}`)}.`, mistakes: [{ on: 'numAll', values: [qa, q(q1 + q2 + qn - q1 + q2)], msg: 'Quotient : on **soustrait** les exposants.' }, ...(eqQ(qa, quo) ? [] : [{ on: 'numAll' as const, values: [quo, q(q1 - q2)], msg: `Égalité juste, mais ${m(dn(quo))} n’est pas entre 1 et 10 : réajuste.` }, { on: 'numAll' as const, values: [qa, q(q1 - q2)], msg: `En écrivant ${m(`${dn(quo)} = ${sci(qa, -1)}`)}, il faut retirer 1 à l’exposant.` }])] },
        { prompt: 'c) Lequel de ces nombres est le plus grand ?', answer: shuffledChoice(rng, tex(best), bad), hint: 'On compare d’abord les exposants ; à exposant égal, les nombres placés devant.' },
      ],
      solution: [
        `a) ${m(`${tA} = (${dn(a1)} \\times ${dn(a2)}) \\times 10^{${p1} + ${pp(p2)}} = ${dn(prod)} \\times 10^{${p1 + p2}}${eqQ(pa, prod) ? '' : ` = ${sci(pa, pn)}`}`)}.`,
        `b) ${m(`${tB} = \\dfrac{${dn(b1)}}{${dn(b2)}} \\times 10^{${q1} - ${pp(q2)}} = ${dn(quo)} \\times 10^{${q1 - q2}}${eqQ(qa, quo) ? '' : ` = ${sci(qa, qn)}`}`)}.`,
        `c) Le plus grand exposant est ${m(String(best[1]))} : le plus grand nombre est ${tex(best)}.`,
      ],
      answer: `${m(sci(pa, pn))} ; ${m(sci(qa, qn))} ; ${tex(best)}`,
      key: `${tA}|${tB}|${nums.map((x) => sci(...x)).join(',')}`,
      data: { kind: 'js', items: [...sciJs(`(${toNum(a1)}*10**${p1})*(${toNum(a2)}*10**${p2})`, pa, pn, 'P'), ...sciJs(`(${toNum(b1)}*10**${q1})/(${toNum(b2)}*10**${q2})`, qa, qn, 'Q'), { what: 'max', js: `Math.max(${nums.map((x) => `${toNum(x[0])}e${x[1]}`).join(',')})/(${toNum(best[0])}e${best[1]})`, expect: 1, tol: 1e-12 }] },
    };
  },
};
const eqQ = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
void cmp;
