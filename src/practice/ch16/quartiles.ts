/**
 * Quartiles et boîte à moustaches (programme 2026, 3e).
 * Convention du collège : Q1 = valeur de rang ⌈N/4⌉, Q3 = valeur de rang ⌈3N/4⌉ dans la série rangée.
 * ★★ : série brute (non rangée) ; ★★★ : tableau d'effectifs (effectifs cumulés) et lecture d'une boîte.
 */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice } from '../engine/build';
import { LINKS, m, dn, exactF, table, tt, q } from './common';
import { type Item, step, sum, A, ord, expand, median, cap, QUANTI } from './stats';

const JS_Q = (a: number[], k: 1 | 3) => `((t)=>{t=[...t].sort((x,y)=>x-y);return t[Math.ceil(${k}*t.length/4)-1];})(${A(a)})`;
const rank = (n: number, k: 1 | 3) => Math.ceil((k * n) / 4);
const effTable = (head: string, vals: number[], eff: number[]) => table([[tt(head), ...vals.map(String)], [tt('Effectif'), ...eff.map(String)]]);

const LISTS = [
  { what: 'Notes d’un contrôle (sur 20)', lo: 2, hi: 20, u: '' },
  { what: 'Temps (en minutes) passés à faire les devoirs', lo: 5, hi: 60, u: 'min' },
  { what: 'Nombre de SMS envoyés dans la journée', lo: 0, hi: 45, u: '' },
  { what: 'Distances (en km) parcourues à vélo dans la semaine', lo: 3, hi: 40, u: 'km' },
  { what: 'Masses (en kg) de cartables pesés', lo: 3, hi: 12, u: 'kg' },
];

export const quartiles: Generator = {
  id: 'quartiles', title: 'Quartiles', stars: 2, levels: [2, 3], course: LINKS.s44, links: [LINKS.s45, LINKS.s41],
  desc: 'Ranger, puis rangs $\\dfrac{N}{4}$ et $\\dfrac{3N}{4}$ arrondis au-dessus ; ★★★ : tableau d’effectifs et boîte à moustaches.',
  example: 'N = 10 : Q_1 \\text{ au rang } 3,\\ Q_3 \\text{ au rang } 8',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], sol: Rich[] = [];
    if (level === 2) {
      const L = rng.pick(LISTS), n = rng.int(8, 15);
      let a: number[];
      do a = Array.from({ length: n }, () => rng.int(L.lo, L.hi)); while (new Set(a).size < Math.min(n - 2, 7));
      const s = [...a].sort((x, y) => x - y), r1 = rank(n, 1), r3 = rank(n, 3), Q1 = s[r1 - 1], Q3 = s[r3 - 1];
      const u = L.u || undefined;
      const near = (k: 1 | 3) => Math.max(1, Math.round((k * n) / 4));
      const steps: Step[] = [
        step('a) Premier quartile $Q_1$ ?', [exactF(m('Q_1 ='), q(Q1), u)], `Range la série, puis calcule ${m(`\\dfrac{N}{4} = \\dfrac{${n}}{4}`)} et arrondis à l’entier supérieur : c’est le rang de ${m('Q_1')}.`, mist(q(Q1), [
          [q(a[r1 - 1]), 'Range d’abord la série dans l’ordre croissant.'],
          [q(s[near(1) - 1]), `${m(`\\dfrac{${n}}{4}`)} s’arrondit à l’entier **supérieur** : ${m('Q_1')} est la ${ord(r1)} valeur.`],
          [q(r1), `${m(String(r1))} est le rang de ${m('Q_1')}, pas sa valeur.`],
        ])),
        step('b) Troisième quartile $Q_3$ ?', [exactF(m('Q_3 ='), q(Q3), u)], `Rang de ${m('Q_3')} : ${m(`\\dfrac{3N}{4}`)} arrondi à l’entier supérieur.`, mist(q(Q3), [
          [q(a[r3 - 1]), 'Range d’abord la série dans l’ordre croissant.'],
          [q(s[near(3) - 1]), `${m(`\\dfrac{3 \\times ${n}}{4}`)} s’arrondit à l’entier **supérieur** : ${m('Q_3')} est la ${ord(r3)} valeur.`],
          [q(s[n - r1]), `Compte depuis le début de la série rangée : ${m('Q_3')} est la ${ord(r3)} valeur.`],
          [q(r3), `${m(String(r3))} est le rang de ${m('Q_3')}, pas sa valeur.`],
        ])),
      ];
      items.push({ what: 'Q1', js: JS_Q(a, 1), expect: Q1 }, { what: 'Q3', js: JS_Q(a, 3), expect: Q3 });
      const f1 = n % 4 === 0 ? `\\dfrac{${n}}{4} = ${n / 4}` : `\\dfrac{${n}}{4} = ${dn(q(n, 4))}`, f3 = (3 * n) % 4 === 0 ? `\\dfrac{3 \\times ${n}}{4} = ${(3 * n) / 4}` : `\\dfrac{3 \\times ${n}}{4} = ${dn(q(3 * n, 4))}`;
      sol.push(`Série rangée (${m(`N = ${n}`)}) : ${m(s.join(' \\; ; \\; '))}.`);
      sol.push(`${m(f1)}${n % 4 ? `, arrondi à ${m(String(r1))}` : ''} : ${m('Q_1')} est la ${ord(r1)} valeur, ${m(`Q_1 = ${Q1}`)}.`);
      sol.push(`${m(f3)}${(3 * n) % 4 ? `, arrondi à ${m(String(r3))}` : ''} : ${m('Q_3')} est la ${ord(r3)} valeur, ${m(`Q_3 = ${Q3}`)}.`);
      sol.push(`Contrôle : au moins un quart des valeurs (${r1} sur ${n}) sont inférieures ou égales à ${m(String(Q1))}, au moins trois quarts (${r3} sur ${n}) à ${m(String(Q3))}.`);
      return { title: 'Quartiles d’une série.', statement: `${L.what} : ${a.map((x) => m(String(x))).join(' ; ')}.`, steps, solution: sol, answer: `${m(`Q_1 = ${Q1}`)} ; ${m(`Q_3 = ${Q3}`)}`, key: a.join(','), data: { kind: 'js', items } };
    }
    // ★★★ : tableau d'effectifs
    const ctx = rng.pick(QUANTI), n = Math.min(ctx.vals.length, rng.int(5, 6)), o0 = rng.int(0, ctx.vals.length - n), vals = ctx.vals.slice(o0, o0 + n);
    let eff: number[], N: number, s: number[], Q1: number, Q3: number;
    do {
      eff = vals.map(() => rng.int(1, 9));
      N = sum(eff); s = expand(vals, eff); Q1 = s[rank(N, 1) - 1]; Q3 = s[rank(N, 3) - 1];
    } while (N < 15 || Q1 === Q3 || Q1 === s[0] && Q3 === s[N - 1]);
    const cum = eff.map((_, t) => sum(eff.slice(0, t + 1))), r1 = rank(N, 1), r3 = rank(N, 3), med = median(s);
    const display = effTable(cap(ctx.axis), vals, eff);
    const steps: Step[] = [
      step('a) Premier quartile $Q_1$ ?', [exactF(m('Q_1 ='), q(Q1))], `${m(`N = ${N}`)} : rang de ${m('Q_1')} = ${m(`\\dfrac{${N}}{4}`)} arrondi à l’entier supérieur ; repère-le avec les effectifs cumulés.`, mist(q(Q1), [
        [q(r1), `${m(String(r1))} est le rang, pas la valeur : cherche la valeur dont l’effectif cumulé atteint ${r1}.`],
        [q(vals[Math.min(n - 1, Math.max(0, Math.round((n - 1) / 4)))]), `Le quartile porte sur les ${N} ${ctx.ind}, pas sur la liste des valeurs possibles.`],
      ])),
      step('b) Troisième quartile $Q_3$ ?', [exactF(m('Q_3 ='), q(Q3))], `Rang de ${m('Q_3')} : ${m(`\\dfrac{3 \\times ${N}}{4}`)} arrondi à l’entier supérieur.`, mist(q(Q3), [
        [q(r3), `${m(String(r3))} est le rang, pas la valeur.`],
        [q(vals[Math.min(n - 1, Math.round((3 * (n - 1)) / 4))]), `Le quartile porte sur les ${N} ${ctx.ind}, pas sur la liste des valeurs possibles.`],
      ])),
    ];
    items.push({ what: 'Q1', js: JS_Q(s, 1), expect: Q1 }, { what: 'Q3', js: JS_Q(s, 3), expect: Q3 });
    // c) lecture : quelle affirmation est vraie ?
    const lo = s[0], hi = s[N - 1];
    const fem = ctx.le === 'la', inf = fem ? 'inférieure ou égale' : 'inférieur ou égal', sup = fem ? 'strictement supérieure' : 'strictement supérieur';
    const pour = (part: string, rel: string, v: number) => `Pour au moins ${part} des ${ctx.ind}, ${ctx.le} ${ctx.car} est ${rel} à ${m(String(v))}.`;
    const good = pour('trois quarts', inf, Q3);
    const ch = shuffledChoice(rng, good, [
      [pour('la moitié', sup, Q3), `Au moins trois quarts des valeurs sont inférieures ou égales à ${m('Q_3')} : il en reste au plus un quart au-dessus.`],
      [pour('trois quarts', inf, Q1), `C’est vrai pour un quart au moins, avec ${m('Q_1')} ; pour trois quarts, c’est ${m('Q_3')}.`],
      [`L’étendue de la série est ${m(String(Q3 - Q1))}.`, `L’étendue est le maximum moins le minimum : ${m(`${hi} - ${lo}`)}.`],
    ]);
    steps.push({ prompt: 'c) Quelle affirmation est vraie ?', answer: ch, hint: `${m('Q_3')} : au moins ${m('75\\,\\%')} des valeurs lui sont inférieures ou égales.` });
    sol.push(`Effectifs cumulés croissants : ${vals.map((x, t) => `${x} → ${cum[t]}`).join(' ; ')} ; ${m(`N = ${N}`)}.`);
    sol.push(`a) ${m(`\\dfrac{${N}}{4}`)}${N % 4 ? ` arrondi à ${m(String(r1))}` : ` = ${m(String(r1))}`} : la ${ord(r1)} valeur est ${m(String(Q1))} (premier effectif cumulé qui atteint ${r1}). ${m(`Q_1 = ${Q1}`)}.`);
    sol.push(`b) ${m(`\\dfrac{3 \\times ${N}}{4}`)}${(3 * N) % 4 ? ` arrondi à ${m(String(r3))}` : ` = ${m(String(r3))}`} : ${m(`Q_3 = ${Q3}`)}.`);
    sol.push(`c) ${good} Boîte à moustaches : minimum ${m(String(lo))}, ${m(`Q_1 = ${Q1}`)}, médiane ${m(dn(med))}, ${m(`Q_3 = ${Q3}`)}, maximum ${m(String(hi))}.`);
    return { title: 'Quartiles d’un tableau d’effectifs.', statement: `${cap(ctx.car)} de ${m(String(N))} ${ctx.pop} :`, display, steps, solution: sol, answer: `${m(`Q_1 = ${Q1}`)} ; ${m(`Q_3 = ${Q3}`)}`, key: display, data: { kind: 'js', items } };
  },
};
