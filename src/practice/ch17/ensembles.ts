/**
 * Langage des ensembles (programme 2026) : ★ 4e — intersection, réunion, complémentaire en comptant les issues ;
 * ★★ 3e — formule P(A ∪ B) + P(A ∩ B) = P(A) + P(B).
 */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist } from '../engine/build';
import { sub, add } from '../engine/q';
import { LINKS, m, fq, fr, probF, exactF, dn, q, toNum } from './common';
import { type Item, step } from './bases';

type Pred = { txt: string; js: string; f: (n: number) => boolean };
const PREDS = (N: number, rng: Rng): Pred[] => {
  const t = rng.int(4, N - 4), u = rng.int(3, N - 5);
  return [
    { txt: 'le numéro est pair', js: 'n%2===0', f: (n) => n % 2 === 0 },
    { txt: 'le numéro est impair', js: 'n%2===1', f: (n) => n % 2 === 1 },
    { txt: 'le numéro est un multiple de 3', js: 'n%3===0', f: (n) => n % 3 === 0 },
    { txt: 'le numéro est un multiple de 4', js: 'n%4===0', f: (n) => n % 4 === 0 },
    { txt: 'le numéro est un multiple de 5', js: 'n%5===0', f: (n) => n % 5 === 0 },
    { txt: `le numéro est supérieur ou égal à ${t}`, js: `n>=${t}`, f: (n) => n >= t },
    { txt: `le numéro est inférieur ou égal à ${u}`, js: `n<=${u}`, f: (n) => n <= u },
    { txt: 'le numéro est un nombre premier', js: '[2,3,5,7,11,13,17,19].includes(n)', f: (n) => [2, 3, 5, 7, 11, 13, 17, 19].includes(n) },
  ];
};
const setTex = (xs: number[]) => (xs.length ? `\\{${xs.join('\\,;')}\\}` : '\\varnothing');
const PU = 'P(A \\cup B)', PI = 'P(A \\cap B)';

export const ensembles: Generator = {
  id: 'ensembles', title: 'Réunion, intersection', stars: 2, levels: [1, 2], course: LINKS.s31, links: [LINKS.s32, LINKS.s3],
  desc: '$A \\cap B$, $A \\cup B$, $\\overline{A}$ en comptant les issues ; ★★ : $P(A \\cup B) + P(A \\cap B) = P(A) + P(B)$.',
  example: 'P(A \\cup B) = 0{,}5 + 0{,}4 - 0{,}15 = 0{,}75',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], sol: Rich[] = [];
    if (level === 1) {
      const N = rng.int(10, 20);
      const all = Array.from({ length: N }, (_, i) => i + 1);
      let A: Pred, B: Pred, AI: number[], AU: number[], SA: number[], SB: number[];
      const preds = PREDS(N, rng);
      do {
        [A, B] = rng.shuffle(preds).slice(0, 2);
        SA = all.filter(A.f); SB = all.filter(B.f); AI = SA.filter(B.f); AU = all.filter((n) => A.f(n) || B.f(n));
      } while (!AI.length || AU.length === N || AI.length === SA.length || AI.length === SB.length);
      const comp = all.filter((n) => !A.f(n));
      const pI = q(AI.length, N), pU = q(AU.length, N), pC = q(comp.length, N);
      const steps: Step[] = [
        step(`a) ${m(PI)} ?`, [probF(m(`${PI} =`), pI)], `${m('A \\cap B')} : les cartes qui réalisent **à la fois** ${m('A')} et ${m('B')}.`, mist(pI, [[q(SA.length + SB.length, N), 'Ça, c’est P(A) + P(B) : l’intersection ne garde que les issues communes.'], [pU, 'Ça, c’est la réunion (A ou B). L’intersection, c’est A **et** B.']])),
        step(`b) ${m(PU)} ?`, [probF(m(`${PU} =`), pU)], `${m('A \\cup B')} : les cartes qui réalisent ${m('A')}, ou ${m('B')}, ou les deux.`, mist(pU, [[q(SA.length + SB.length, N), `Les issues de ${m('A \\cap B')} sont comptées deux fois : compte-les une seule fois.`], [pI, 'Ça, c’est l’intersection. La réunion contient toutes les issues de A et toutes celles de B.']])),
        step(`c) ${m('P(\\overline{A})')} ?`, [probF(m('P(\\overline{A}) ='), pC)], `${m('\\overline{A}')} : les cartes qui ne réalisent **pas** ${m('A')} ; ou bien ${m('1 - P(A)')}.`, mist(pC, [[q(SA.length, N), 'Ça, c’est P(A). Le complémentaire contient les autres issues.']])),
      ];
      const cnt = (js: string) => `[${all.join(',')}].filter((n)=>${js}).length/${N}`;
      items.push({ what: 'I', js: cnt(`(${A.js})&&(${B.js})`), expect: toNum(pI), tol: 1e-12 }, { what: 'U', js: cnt(`(${A.js})||(${B.js})`), expect: toNum(pU), tol: 1e-12 }, { what: 'C', js: cnt(`!(${A.js})`), expect: toNum(pC), tol: 1e-12 });
      sol.push(`${m(`A = ${setTex(SA)}`)} et ${m(`B = ${setTex(SB)}`)}.`);
      sol.push(`a) ${m(`A \\cap B = ${setTex(AI)}`)} : ${m(`${PI} = ${fr(AI.length, N)}${q(AI.length, N).d !== N ? ` = ${fq(pI)}` : ''}`)}.`);
      sol.push(`b) ${m(`A \\cup B = ${setTex(AU)}`)} : ${m(`${PU} = ${fr(AU.length, N)}${q(AU.length, N).d !== N ? ` = ${fq(pU)}` : ''}`)}. Contrôle : ${m(`${fr(SA.length, N)} + ${fr(SB.length, N)} - ${fr(AI.length, N)} = ${fr(AU.length, N)}`)}.`);
      sol.push(`c) ${m(`\\overline{A} = ${setTex(comp)}`)} : ${m(`P(\\overline{A}) = ${fr(comp.length, N)}${q(comp.length, N).d !== N ? ` = ${fq(pC)}` : ''}`)}.`);
      return {
        title: 'Cartes numérotées.',
        statement: `On tire au hasard une carte parmi ${m(String(N))} cartes numérotées de ${m('1')} à ${m(String(N))}. ${m('A')} : « ${A.txt} » ; ${m('B')} : « ${B.txt} ».`,
        steps, solution: sol, answer: `${m(fq(pI))} ; ${m(fq(pU))} ; ${m(fq(pC))}`,
        key: `1|${N}|${A.txt}|${B.txt}`, data: { kind: 'js', items },
      };
    }
    // ★★ : formule, en décimaux (au centième)
    let a: number, b: number, i: number;
    do { a = rng.int(10, 80); b = rng.int(10, 80); i = rng.int(3, Math.min(a, b) - 2); } while (a + b - i > 100 || a + b - i === 100 || a === b);
    const pa = q(a, 100), pb = q(b, 100), pi = q(i, 100), pu = sub(add(pa, pb), pi);
    const ctx = rng.pick([
      ['Dans un collège, on choisit un élève au hasard.', 'il fait du sport', 'il joue d’un instrument'],
      ['On choisit au hasard un client d’un magasin.', 'il achète du pain', 'il achète des fruits'],
      ['On choisit au hasard un abonné d’une médiathèque.', 'il emprunte un livre', 'il emprunte un film'],
      ['On choisit au hasard un spectateur d’un festival.', 'il vient en train', 'il dort sur place'],
    ] as const);
    // ★★ second calcul : retrouver l'intersection à partir de la réunion
    let c: number, d: number, u: number;
    do { c = rng.int(15, 70); d = rng.int(15, 70); u = rng.int(Math.max(c, d) + 3, Math.min(98, c + d - 3)); } while (u <= Math.max(c, d) || c === d || c + d - u < 2);
    const pc = q(c, 100), pd = q(d, 100), pu2 = q(u, 100), pi2 = sub(add(pc, pd), pu2);
    const steps: Step[] = [
      step(`a) ${m(`P(A) = ${dn(pa)}`)}, ${m(`P(B) = ${dn(pb)}`)} et ${m(`${PI} = ${dn(pi)}`)}. Calcule ${m(PU)}.`, [exactF(m(`${PU} =`), pu)], `${m(`${PU} + ${PI} = P(A) + P(B)`)}.`, mist(pu, [[add(pa, pb), `Tu as oublié de retirer ${m(PI)} : les issues communes seraient comptées deux fois.`], [add(add(pa, pb), pi), `On **retire** ${m(PI)}, on ne l’ajoute pas.`]])),
      step(`b) Autre cas : ${m(`P(C) = ${dn(pc)}`)}, ${m(`P(D) = ${dn(pd)}`)} et ${m(`P(C \\cup D) = ${dn(pu2)}`)}. Calcule ${m('P(C \\cap D)')}.`, [exactF(m('P(C \\cap D) ='), pi2)], `${m('P(C \\cap D) = P(C) + P(D) - P(C \\cup D)')}.`, mist(pi2, [[sub(pu2, pc), 'Utilise la formule complète : P(C) + P(D) − P(C ∪ D).'], [sub(pu2, pd), 'Utilise la formule complète : P(C) + P(D) − P(C ∪ D).']])),
    ];
    items.push({ what: 'U', js: `${a / 100}+${b / 100}-${i / 100}`, expect: toNum(pu), tol: 1e-12 }, { what: 'I', js: `${c / 100}+${d / 100}-${u / 100}`, expect: toNum(pi2), tol: 1e-12 });
    sol.push(`a) ${m(`${PU} = P(A) + P(B) - ${PI} = ${dn(pa)} + ${dn(pb)} - ${dn(pi)} = ${dn(pu)}`)}.`);
    sol.push(`Ici, la probabilité de « ${ctx[1]} ou ${ctx[2]} » (l’un, l’autre ou les deux) est ${m(dn(pu))} ; celle de « ni l’un ni l’autre » est ${m(`1 - ${dn(pu)} = ${dn(sub(q(1), pu))}`)}.`);
    sol.push(`b) ${m(`P(C \\cap D) = P(C) + P(D) - P(C \\cup D) = ${dn(pc)} + ${dn(pd)} - ${dn(pu2)} = ${dn(pi2)}`)}.`);
    return {
      title: 'Probabilité d’une réunion.',
      statement: `${ctx[0]} ${m('A')} : « ${ctx[1]} » ; ${m('B')} : « ${ctx[2]} ».`,
      steps, solution: sol, answer: `${m(dn(pu))} ; ${m(dn(pi2))}`,
      key: `2|${a}|${b}|${i}|${c}|${d}|${u}`, data: { kind: 'js', items },
    };
  },
};
