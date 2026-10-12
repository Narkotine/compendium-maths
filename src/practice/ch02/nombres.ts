/**
 * Entiers et décimaux (★ → ★★) : numération, comparer/encadrer/ranger (droite graduée), opérations,
 * priorités et ordre de grandeur, arrondir et tronquer.
 */
import { type Q, q, add, sub, mul, div, toNum, isInt, cmp, eq, decimals } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, numStep, fixedChoice, shuffledChoice, NAMES } from '../engine/build';
import { LINKS, bg, fx, F, D, lineSvg } from './common';
import { words } from './mots';
import { orderStep } from '../engine/ordering';

const L = ['a', 'b', 'c', 'd', 'e'];
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const dec = (n: number, k: number) => q(n, 10 ** k);
const RANKS: [string, number][] = [['dizaines de mille', 4], ['milliers', 3], ['centaines', 2], ['dizaines', 1], ['unités', 0], ['dixièmes', -1], ['centièmes', -2], ['millièmes', -3]];
const P = (e: number) => (e >= 0 ? q(10 ** e) : q(1, 10 ** -e));
const digitAt = (x: Q, e: number) => Math.floor(toNum(mul(x, P(-e))) + 1e-9) % 10;

// ===================================================================== numération
export const numeration: Generator = {
  id: 'numeration',
  title: 'Numération',
  desc: 'Chiffre et nombre de… ; × et ÷ par 10, 100, 1 000 ; décomposer, écrire en chiffres (★★).',
  stars: 1,
  levels: [1, 2],
  example: '3\\,507{,}26 : \\text{chiffre des dizaines } 0, \\text{ nombre de dizaines } 350',
  course: LINKS.s11,
  links: [LINKS.s12],
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      let x: Q;
      do { x = dec(rng.int(10000, 999999), rng.int(2, 3)); } while (new Set(String(x.n)).size < 4);
      const ranks = RANKS.filter(([, e]) => e <= Math.floor(Math.log10(toNum(x))) && e >= -decimals(x));
      const [rn, re] = rng.pick(ranks.filter(([, e]) => e !== 0));
      const dg = digitAt(x, re);
      const [nn, ne] = rng.pick(ranks.filter(([, e]) => e >= 1 && e <= Math.floor(Math.log10(toNum(x))) - 1).concat(ranks.filter(([, e]) => e === -1)));
      const cnt = Math.floor(toNum(mul(x, P(-ne))) + 1e-9);
      const op = rng.pick([['×', 10], ['×', 100], ['×', 1000], ['÷', 10], ['÷', 100], ['÷', 1000], ['×', 0.1], ['×', 0.01]] as [string, number][]);
      const y = rng.pick([dec(rng.int(11, 999), rng.int(1, 3)), q(rng.int(2, 99))]);
      const fac = op[1] < 1 ? q(Math.round(op[1] * 100), 100) : q(op[1]);
      const res = op[0] === '×' ? mul(y, fac) : div(y, fac);
      const shift = op[1] === 10 || op[1] === 0.1 ? 1 : op[1] === 100 || op[1] === 0.01 ? 2 : 3;
      const bigger = op[0] === '×' && op[1] > 1;
      const tOp = `${bg(y)} ${op[0] === '×' ? '\\times' : '\\div'} ${bg(fac)}`;
      return {
        title: 'Numération.',
        statement: `On considère le nombre ${m(bg(x))}.`,
        steps: [
          numStep(`a) Quel est le **chiffre** des ${rn} ?`, '', q(dg), `Repère la colonne des ${rn} dans le tableau de numération${re < 0 ? ' (après la virgule)' : ''}.`, [[q(digitAt(x, re + 1)), `C’est le chiffre du rang voisin : compte les rangs à partir de la virgule.`], [q(digitAt(x, re - 1)), `C’est le chiffre du rang voisin : compte les rangs à partir de la virgule.`], [q(Math.floor(toNum(mul(x, P(-re))) + 1e-9)), `C’est le **nombre** de ${rn} ; on demande seulement le **chiffre** (un seul chiffre).`]]),
          numStep(`b) Quel est le **nombre** de ${nn} ?`, '', q(cnt), `On lit tout ce qui est à gauche de la colonne des ${nn}, celle-ci comprise.`, [[q(digitAt(x, ne)), `C’est le **chiffre** des ${nn} ; le nombre de ${nn} compte tous les paquets.`], [q(cnt * 10 + digitAt(x, ne - 1)), 'Un rang de trop : on s’arrête à la colonne demandée.']]),
          numStep(`c) Calcule ${m(tOp)}.`, m(`${tOp} =`), res, op[1] < 1 ? `Multiplier par ${m(bg(fac))}, c’est diviser par ${m(String(Math.round(1 / op[1])))}.` : `Les chiffres changent de ${shift} rang${shift > 1 ? 's' : ''} vers la ${bigger ? 'gauche' : 'droite'}.`,
            [[bigger ? div(y, fac) : op[1] < 1 ? mul(y, q(Math.round(1 / op[1]))) : mul(y, fac), bigger ? 'Le résultat doit être plus grand : les chiffres avancent vers la gauche.' : 'Le résultat doit être plus petit : les chiffres reculent vers la droite.'], [bigger ? mul(res, q(10)) : div(res, q(10)), 'Un rang de trop.'], [bigger ? div(res, q(10)) : mul(res, q(10)), 'Un rang de moins.']], { form: isInt(res) ? 'any' : 'decimal', shown: bg(res) }),
        ],
        solution: [
          `a) Dans ${m(bg(x))}, le chiffre des ${rn} est ${m(String(dg))}.`,
          `b) Le nombre de ${nn} est ${m(bg(cnt))} : ${m(`${bg(cnt)} \\times ${bg(P(ne))} = ${bg(mul(q(cnt), P(ne)))}`)} ${m('\\leqslant')} ${m(bg(x))}.`,
          `c) ${m(`${tOp} = ${bg(res)}`)} (les chiffres ${bigger ? 'avancent' : 'reculent'} de ${shift} rang${shift > 1 ? 's' : ''}).`,
        ],
        answer: `${m(String(dg))} ; ${m(bg(cnt))} ; ${m(bg(res))}`,
        key: `${x.n}/${x.d}:${re}:${ne}:${tOp}`,
        data: { kind: 'js', items: [{ what: 'dg', js: `Math.floor(${toNum(x)}/10**${re}+1e-9)%10`, expect: dg }, { what: 'cnt', js: `Math.floor(${toNum(x)}/10**${ne}+1e-9)`, expect: cnt }, { what: 'op', js: `${toNum(y)}${op[0] === '×' ? '*' : '/'}${op[1]}`, expect: toNum(res), tol: 1e-9 }] },
      };
    }
    // ★★ : décomposer et écrire en chiffres
    const n = rng.int(1001, 9999);
    const ds = String(n).split('').map(Number);
    const ip = rng.int(1, 99), fk = rng.pick([1, 2, 3]), fn = rng.int(1, 10 ** fk - 1);
    const rk = ['', 'dixièmes', 'centièmes', 'millièmes'][fk];
    const val = add(q(ip), dec(fn, fk));
    const big2 = rng.pick([2030006, 1250000, 405060, 3008700, 70045, 12000300].map((v) => v + 0));
    const b2 = rng.int(1, 9) * 1e6 + rng.pick([0, 30, 405, 60]) * 1000 + rng.pick([6, 0, 200, 15]);
    const W = rng.chance(0.5) ? b2 : big2;
    return {
      title: 'Numération.',
      steps: [
        step(`a) Complète : ${m(`${bg(n)} = \\ldots \\times 1\\,000 + \\ldots \\times 100 + \\ldots \\times 10 + \\ldots \\times 1`)}.`, ds.map((d, i) => F(m(['\\times 1\\,000', '\\times 100', '\\times 10', '\\times 1'][i]).replace(/^/, ''), q(d))).map((f, i) => ({ ...f, label: ['', '', '', ''][i], unit: ['× 1 000', '× 100', '× 10', '× 1'][i] })), 'Chaque chiffre donne le nombre de paquets de son rang.',
          [{ on: 'numAll', values: [q(Math.floor(n / 1000)), q(Math.floor(n / 100)), q(Math.floor(n / 10)), q(n)], msg: 'Ce sont les **nombres** de milliers, centaines… ; on veut les **chiffres** de chaque rang.' }]),
        step(`b) Écris en chiffres : « ${words(ip)} unité${ip > 1 ? 's' : ''} et ${words(fn)} ${fn > 1 ? rk : rk.slice(0, -1)} ».`, [D('', val)], `${rk[0].toUpperCase() + rk.slice(1)} : ${fk} chiffre${fk > 1 ? 's' : ''} après la virgule.`,
          mist(val, [[add(q(ip), dec(fn, String(fn).length)), `${m(bg(dec(fn, fk)))} : il faut ${fk} chiffre${fk > 1 ? 's' : ''} après la virgule (des zéros si besoin).`], [add(q(ip), dec(fn, fk + 1)), `Les ${rk} : ${fk} chiffre${fk > 1 ? 's' : ''} après la virgule, pas ${fk + 1}.`]])),
        step(`c) Écris en chiffres : « ${words(W)} ».`, [{ ...F('', q(W)), shown: bg(W) }], 'Repère les mots « million » et « mille » : ils séparent des tranches de trois chiffres.', mist(q(W), [[q(Number(String(W).replace(/0+(?=[1-9])/g, ''))), 'Il manque des zéros : chaque tranche (millions, milliers, unités) a trois chiffres.']])),
      ],
      solution: [
        `a) ${m(`${bg(n)} = ${ds.map((d, i) => `${d} \\times ${['1\\,000', '100', '10', '1'][i]}`).join(' + ')}`)}.`,
        `b) ${m(bg(val))} (${fk} chiffre${fk > 1 ? 's' : ''} après la virgule pour les ${rk}).`,
        `c) ${m(bg(W))}.`,
      ],
      answer: `${ds.join(' ; ')} ; ${m(bg(val))} ; ${m(bg(W))}`,
      key: `${n}:${ip}:${fn}:${fk}:${W}`,
      data: { kind: 'js', items: [...ds.map((d, i) => ({ what: `d${i}`, js: `Math.floor(${n}/${10 ** (3 - i)})%10`, expect: d })), { what: 'v', js: `${ip}+${fn}/10**${fk}`, expect: toNum(val), tol: 1e-9 }, { what: 'W', js: `${W}`, expect: W }] },
    };
  },
};

// ===================================================================== comparer, encadrer, ranger
export const comparer: Generator = {
  id: 'comparer',
  title: 'Comparer, encadrer, ranger',
  desc: 'Comparer rang par rang, encadrer ; ranger, lire sur une droite graduée zoomée (★★).',
  stars: 1,
  levels: [1, 2],
  example: '0{,}19 < 0{,}2 \\quad 7{,}25 < 7{,}258 < 7{,}26',
  course: LINKS.s22,
  links: [LINKS.s21],
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      // deux comparaisons « pièges » + un encadrement
      const pair = (): [Q, Q] => {
        const ip = rng.int(0, 15);
        const kind = rng.pick(['long', 'zero', 'same']);
        if (kind === 'long') { const a = rng.int(1, 8); const b = rng.int(10 * a - 9, 10 * a - 1); return [add(q(ip), dec(a, 1)), add(q(ip), dec(b, 2))]; } // 0,2 vs 0,19
        if (kind === 'zero') { const a = rng.int(1, 9); return [add(q(ip), dec(a, 2)), add(q(ip), dec(a, 1))]; } // 2,05 vs 2,5
        const a = rng.int(11, 99), b = rng.int(101, 999); return [add(q(ip), dec(a, 2)), add(q(ip), dec(b, 3))];
      };
      const prs: [Q, Q][] = [];
      while (prs.length < 2) { const [u, v] = pair(); if (!eq(u, v)) prs.push(rng.chance(0.5) ? [u, v] : [v, u]); }
      // exactement trois décimales (dernier chiffre non nul) : plus de décimales que les deux précisions demandées,
      // donc les bornes, décimaux consécutifs au dixième (au centième), encadrent strictement le nombre.
      let N = 0;
      do N = rng.int(1001, 99999); while (N % 10 === 0);
      const x = dec(N, 3);
      const lo1 = q(Math.floor(N / 100), 10), lo2 = q(Math.floor(N / 10), 100);
      const amp = (r: string, a: string) => `C’est un encadrement juste, mais pas ${r} près : l’écart entre les deux bornes doit être ${a}.`;
      const steps: Step[] = prs.map(([u, v], i) => {
        const c = cmp(u, v);
        const longer = decimals(u) > decimals(v) ? u : v;
        const [hi, lo] = c > 0 ? [u, v] : [v, u];
        const k = Math.max(decimals(u), decimals(v));
        const why = `Avec ${k} décimales : ${m(`${fx(hi, k)} > ${fx(lo, k)}`)}, en comparant rang par rang depuis les dixièmes.${eq(longer, lo) ? ' Avoir plus de chiffres ne rend pas plus grand.' : ''}`;
        return { prompt: `${L[i]}) Compare ${m(bg(u))} et ${m(bg(v))}.`, answer: fixedChoice([m('<'), m('>'), m('=')], c < 0 ? 0 : 1, [c < 0 ? null : why, c > 0 ? null : why, `Les deux nombres ne sont pas égaux. ${why}`]), hint: 'Même partie entière : complète par des zéros pour avoir autant de décimales, puis compare.' };
      });
      steps.push(step(`c) Encadre ${m(bg(x))} au dixième près, puis au centième près.`, [D('', lo1), D(m(`< ${bg(x)} <`), add(lo1, q(1, 10))), D('', lo2), D(m(`< ${bg(x)} <`), add(lo2, q(1, 100)))], 'Au dixième près : coupe après les dixièmes, puis ajoute un dixième.',
        [{ on: 'numAll', values: [lo1, add(lo1, q(1, 100)), lo2, add(lo2, q(1, 1000))], msg: 'Au dixième près, les deux bornes diffèrent de 0,1 ; au centième près, de 0,01.' },
          { on: 'num', field: 0, value: sub(lo1, q(1, 10)), msg: amp('au dixième', '0,1') }, { on: 'num', field: 1, value: add(lo1, q(2, 10)), msg: amp('au dixième', '0,1') },
          { on: 'num', field: 2, value: sub(lo2, q(1, 100)), msg: amp('au centième', '0,01') }, { on: 'num', field: 3, value: add(lo2, q(2, 100)), msg: amp('au centième', '0,01') }]));
      const dd = (u: Q, v: Q) => Math.max(decimals(u), decimals(v));
      return {
        title: 'Compare et encadre.',
        steps,
        solution: [
          ...prs.map(([u, v], i) => `${L[i]}) ${m(`${fx(u, dd(u, v))}`)} et ${m(`${fx(v, dd(u, v))}`)} : ${m(`${bg(u)} ${cmp(u, v) < 0 ? '<' : '>'} ${bg(v)}`)}.`),
          `c) ${m(`${bg(lo1)} < ${bg(x)} < ${bg(add(lo1, q(1, 10)))}`)} ; ${m(`${bg(lo2)} < ${bg(x)} < ${bg(add(lo2, q(1, 100)))}`)}.`,
        ],
        answer: prs.map(([u, v]) => m(`${bg(u)} ${cmp(u, v) < 0 ? '<' : '>'} ${bg(v)}`)).join(' ; ') + ` ; ${m(`${bg(lo2)} < ${bg(x)} < ${bg(add(lo2, q(1, 100)))}`)}`,
        key: `${prs.map((p) => p.map((z) => toNum(z)).join('/')).join('|')}|${toNum(x)}`,
        data: { kind: 'js', items: [...prs.map(([u, v], i) => ({ what: `c${i}`, js: `${toNum(u)}<${toNum(v)}?0:1`, expect: cmp(u, v) < 0 ? 0 : 1 })), { what: 'lo1', js: `Math.floor(${N}/100)/10`, expect: toNum(lo1) }, { what: 'hi1', js: `Math.floor(${N}/100)/10+0.1`, expect: toNum(lo1) + 0.1, tol: 1e-9 }, { what: 'lo2', js: `Math.floor(${N}/10)/100`, expect: toNum(lo2) }, { what: 'hi2', js: `Math.floor(${N}/10)/100+0.01`, expect: toNum(lo2) + 0.01, tol: 1e-9 }] },
      };
    }
    // ★★ : ranger cinq décimaux ; lire sur une droite zoomée
    const ip = rng.int(0, 12);
    const set = new Map<number, Q>();
    const a = rng.int(1, 8);
    const cands = [dec(a, 1), dec(a, 2), dec(10 * a + rng.int(1, 9), 2), dec(a * 100 + rng.int(1, 9), 3), dec(rng.int(1, 9) * 10 + a, 3), dec(a + 1, 1), dec((a + 1) * 10 - rng.int(1, 9), 2)];
    for (const c of rng.shuffle(cands)) { const v = add(q(ip), c); if (!set.has(toNum(v)) && set.size < 5) set.set(toNum(v), v); }
    const xs = [...set.values()];
    const sorted = [...xs].sort((u, v) => cmp(u, v));
    const asInt = [...xs].sort((u, v) => Number(String(u.n).slice(-decimals(u)) || 0) - Number(String(v.n).slice(-decimals(v)) || 0) || cmp(u, v));
    const base = add(q(ip), dec(rng.int(1, 9) * 10 + rng.int(0, 8) * 0, 2));
    const start = q(Math.floor(toNum(base) * 10), 10);
    const k1 = rng.int(1, 9);
    let k2 = rng.int(1, 9); while (k2 === k1) k2 = rng.int(1, 9);
    const A = add(start, dec(k1, 2)), B = add(start, dec(k2, 2));
    const fig = lineSvg(start, q(1, 100), [['A', A], ['B', B]]);
    return {
      title: 'Range, puis lis sur une droite graduée.',
      figure: fig,
      steps: [
        orderStep(rng, {
          prompt: 'a) Range ces nombres dans l’ordre croissant : fais glisser les cartes (ou utilise ↑ ↓).',
          cards: xs.map((v) => ({ tex: bg(v), v })),
          dir: 'asc',
          hint: 'Même partie entière : écris-les tous avec trois décimales, puis compare.',
          why: (A, B) => `Compare ${m(A.tex)} et ${m(B.tex)} rang par rang : écris-les avec trois décimales (${m(fx(A.v, 3))} et ${m(fx(B.v, 3))}).`,
          mistakes: [
            [asInt.some((v, i) => !eq(v, sorted[i])) ? asInt : null, 'Tu as comparé les parties décimales comme des entiers : on compare **rang par rang**, en commençant par les dixièmes.'],
            [[...sorted].reverse(), 'C’est l’ordre **décroissant**.'],
          ],
        }),
        step(`b) La droite graduée ci-dessus est graduée en centièmes, de ${m(bg(start))} à ${m(bg(add(start, q(1, 10))))}. Lis les abscisses de A et de B.`, [D('A :', A), D('B :', B)], 'Entre deux graduations voisines, il y a un centième (0,01).',
          [{ on: 'numAll', values: [add(start, dec(k1, 1)), add(start, dec(k2, 1))], msg: 'Les petites graduations valent un **centième** (0,01), pas un dixième.' }]),
      ],
      solution: [
        `a) Avec trois décimales : ${xs.map((v) => m(fx(v, 3))).join(' ; ')}. Donc ${m(sorted.map(bg).join(' < '))}.`,
        `b) Dix graduations entre ${m(bg(start))} et ${m(bg(add(start, q(1, 10))))} : chacune vaut ${m('0{,}01')}. A est à ${k1} graduation${k1 > 1 ? 's' : ''} : ${m(bg(A))} ; B à ${k2} : ${m(bg(B))}.`,
      ],
      answer: `${m(sorted.map(bg).join(' < '))} ; A ${m(bg(A))}, B ${m(bg(B))}`,
      key: `${xs.map((v) => toNum(v)).sort().join(',')}|${toNum(A)}|${toNum(B)}`,
      data: { kind: 'js', items: [...sorted.map((v, i) => ({ what: `r${i}`, js: `[${xs.map(toNum).join(',')}].sort((a,b)=>a-b)[${i}]`, expect: toNum(v) })), { what: 'A', js: `${toNum(start)}+${k1}*0.01`, expect: toNum(A), tol: 1e-9 }, { what: 'B', js: `${toNum(start)}+${k2}*0.01`, expect: toNum(B), tol: 1e-9 }] },
    };
  },
};

// ===================================================================== opérations
export const operations: Generator = {
  id: 'operations',
  title: 'Opérations sur les décimaux',
  desc: 'Addition, soustraction (aligner les virgules), produit, division ; par un décimal (★★).',
  stars: 1,
  levels: [1, 2],
  example: '1{,}2 \\times 0{,}35 = 0{,}42 \\quad 4{,}5 \\div 0{,}15 = 30',
  course: LINKS.s32,
  links: [LINKS.s31, LINKS.s33],
  generate(rng: Rng, level: Level) {
    const items: { st: Step; sol: Rich; ans: Q; js: string }[] = [];
    if (level === 1) {
      // a) addition ou soustraction avec décimales différentes
      const u = dec(rng.int(11, 999), 1), v = dec(rng.int(11, 999), 2);
      const sub_ = rng.chance(0.5);
      const [x, y] = sub_ ? (cmp(u, v) > 0 ? [u, v] : [q(rng.int(Math.ceil(toNum(v)) + 1, Math.ceil(toNum(v)) + 30)), v]) : [u, v];
      const r = sub_ ? sub(x, y) : add(x, y);
      const mis = sub_ ? null : add(x, q(y.n, 10 * y.d) ); // virgules mal alignées (décale v)
      const t = `${bg(x)} ${sub_ ? '-' : '+'} ${bg(y)}`;
      items.push({ st: numStep(`a) Calcule ${m(t)}.`, m(`${t} =`), r, 'Pose l’opération en **alignant les virgules** (complète par des zéros).', [[mis, 'Les virgules ne sont pas alignées : dixièmes sous dixièmes, centièmes sous centièmes.']], { form: 'decimal', shown: bg(r) }), sol: `${m(`${fx(x, 2)} ${sub_ ? '-' : '+'} ${fx(y, 2)} = ${bg(r)}`)} (virgules alignées).`, ans: r, js: `${toNum(x)}${sub_ ? '-' : '+'}${toNum(y)}` });
      // b) décimal × entier
      const p = dec(rng.int(101, 999), 2), n = rng.int(3, 12);
      const pr = mul(p, q(n));
      items.push({ st: numStep(`b) Calcule ${m(`${bg(p)} \\times ${n}`)}.`, '', pr, 'Calcule sans la virgule, puis place autant de décimales que dans le facteur décimal.', [[mul(pr, q(10)), 'Virgule mal placée : 2 chiffres après la virgule dans le produit.'], [div(pr, q(10)), 'Virgule mal placée : 2 chiffres après la virgule dans le produit.']], { form: 'decimal', shown: bg(pr) }), sol: `${m(`${p.n} \\times ${n} = ${bg(p.n * n)}`)}, deux décimales : ${m(bg(pr))}.`, ans: pr, js: `${toNum(p)}*${n}` });
      // c) division par un entier
      let dq: Q, dv: number;
      do { dv = rng.pick([2, 4, 5, 8, 3, 6]); dq = dec(rng.int(11, 999), rng.int(0, 2)); } while (decimals(div(dq, q(dv))) > 3 || isInt(div(dq, q(dv))));
      const qq = div(dq, q(dv));
      items.push({ st: numStep(`c) Calcule ${m(`${bg(dq)} \\div ${dv}`)}.`, '', qq, 'Pose la division ; quand tu dépasses la virgule du dividende, place la virgule au quotient.', [[mul(qq, q(10)), 'Virgule oubliée ou mal placée au quotient.'], [div(qq, q(10)), 'Virgule mal placée au quotient.']], { form: 'decimal', shown: bg(qq) }), sol: `${m(`${bg(dq)} \\div ${dv} = ${bg(qq)}`)} ; contrôle : ${m(`${bg(qq)} \\times ${dv} = ${bg(dq)}`)} ✓.`, ans: qq, js: `${toNum(dq)}/${dv}` });
    } else {
      // a) décimal × décimal
      const a = dec(rng.int(2, 99), rng.int(1, 2)), b = dec(rng.int(2, 99), rng.int(1, 2));
      const pr = mul(a, b);
      const k = decimals(a) + decimals(b);
      const na = a.n * (10 ** decimals(a) / a.d), nb = b.n * (10 ** decimals(b) / b.d);
      items.push({ st: numStep(`a) Calcule ${m(`${bg(a)} \\times ${bg(b)}`)}.`, '', pr, `Calcule ${m(`${na} \\times ${nb}`)}, puis place ${k} décimale${k > 1 ? 's' : ''}.`, [[mul(pr, q(10)), `Il faut ${k} chiffres après la virgule : les décimales des deux facteurs **réunies**.`], [mul(pr, q(100)), `Il faut ${k} chiffres après la virgule : les décimales des deux facteurs **réunies**.`]], { form: 'decimal', shown: bg(pr) }), sol: `${m(`${na} \\times ${nb} = ${bg(na * nb)}`)} ; ${decimals(a)} + ${decimals(b)} = ${k} décimales : ${m(`${bg(a)} \\times ${bg(b)} = ${bg(pr)}`)}.`, ans: pr, js: `${toNum(a)}*${toNum(b)}` });
      // b) division par un décimal
      let dd: Q, dvs: Q;
      do { dvs = dec(rng.int(2, 75), rng.int(1, 2)); dd = mul(dvs, q(rng.int(2, 60))); } while (decimals(dd) > 3 || toNum(dvs) >= 1 === rng.chance(0.3));
      const qq = div(dd, dvs);
      const kk = decimals(dvs);
      items.push({ st: numStep(`b) Calcule ${m(`${bg(dd)} \\div ${bg(dvs)}`)}.`, '', qq, `Multiplie les deux nombres par ${m(String(10 ** kk))} pour que le diviseur devienne entier.`, [[div(qq, q(10)), 'Multiplie **les deux** nombres par la même puissance de 10.'], [mul(qq, q(10)), 'Multiplie **les deux** nombres par la même puissance de 10.'], [mul(dd, dvs), 'C’est une division, pas une multiplication.']], { form: 'decimal', shown: bg(qq) }), sol: `On multiplie par ${m(String(10 ** kk))} : ${m(`${bg(dd)} \\div ${bg(dvs)} = ${bg(mul(dd, q(10 ** kk)))} \\div ${bg(mul(dvs, q(10 ** kk)))} = ${bg(qq)}`)}. Contrôle : ${m(`${bg(qq)} \\times ${bg(dvs)} = ${bg(dd)}`)} ✓.`, ans: qq, js: `${toNum(dd)}/${toNum(dvs)}` });
      // c) problème (planche / cahiers)
      if (rng.chance(0.5)) {
        const Lp = dec(rng.int(20, 40), 1), k3 = rng.int(2, 4), pc = dec(rng.int(25, 90), 2);
        const rest = sub(Lp, mul(q(k3), pc));
        if (cmp(rest, q(0)) > 0) items.push({ st: numStep(`c) Une planche mesure ${m(`${bg(Lp)}`)} m. On y découpe ${k3} morceaux de ${m(bg(pc))} m. Quelle longueur reste-t-il ?`, 'Reste :', rest, `Calcule d’abord la longueur des ${k3} morceaux.`, [[sub(Lp, pc), `Il y a ${k3} morceaux, pas un seul.`]], { unit: 'm', form: 'decimal', shown: bg(rest) }), sol: `${m(`${k3} \\times ${bg(pc)} = ${bg(mul(q(k3), pc))}`)} m ; ${m(`${bg(Lp)} - ${bg(mul(q(k3), pc))} = ${bg(rest)}`)} m.`, ans: rest, js: `${toNum(Lp)}-${k3}*${toNum(pc)}` });
      }
      if (items.length < 3) {
        const pu = dec(rng.int(105, 995), 2), n = rng.int(3, 12), it = rng.pick(['cahier', 'stylo', 'ticket', 'classeur']);
        const tot = mul(pu, q(n));
        items.push({ st: numStep(`c) Un ${it} coûte ${m(bg(pu))} €. Combien coûtent ${n} ${it}s ?`, 'Prix :', tot, 'Multiplie le prix d’un article par le nombre d’articles.', [[mul(tot, q(10)), 'Virgule mal placée : vérifie avec un ordre de grandeur.']], { unit: '€', form: 'decimal', shown: fx(tot, 2) }), sol: `${m(`${bg(pu)} \\times ${n} = ${fx(tot, 2)}`)} €. Ordre de grandeur : ${m(`${Math.round(toNum(pu))} \\times ${n} = ${Math.round(toNum(pu)) * n}`)} ✓.`, ans: tot, js: `${toNum(pu)}*${n}` });
      }
    }
    return {
      title: 'Calcule.',
      steps: items.map((i) => i.st),
      solution: items.map((i, k) => `${L[k]}) ${i.sol}`),
      answer: items.map((i) => m(bg(i.ans))).join(' ; '),
      key: items.map((i) => i.js).join('|'),
      data: { kind: 'js', items: items.map((i, k) => ({ what: L[k], js: i.js, expect: toNum(i.ans), tol: 1e-9 })) },
    };
  },
};

// ===================================================================== priorités, ordre de grandeur
export const calculs: Generator = {
  id: 'calculs',
  title: 'Priorités et ordre de grandeur',
  desc: 'Calculer avec priorités ; contrôler un résultat par un ordre de grandeur (★★).',
  stars: 1,
  levels: [1, 2],
  example: '48 \\times 21 \\approx 50 \\times 20 = 1\\,000',
  course: LINKS.s34,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const a = rng.int(2, 20), b = rng.int(2, 9), c = dec(rng.int(2, 9) * 5, 1);
      const e = rng.int(10, 40), f = rng.pick([2, 4, 5]), g = dec(rng.int(2, 30) * f, 1);
      const its: [string, Q, Q | null, string, string][] = [
        [`${a} + ${b} \\times ${bg(c)}`, add(q(a), mul(q(b), c)), mul(q(a + b), c), `${a} + ${bg(mul(q(b), c))}`, `${a}+${b}*${toNum(c)}`],
        [`(${a} + ${b}) \\times ${bg(c)}`, mul(q(a + b), c), add(q(a), mul(q(b), c)), `${a + b} \\times ${bg(c)}`, `(${a}+${b})*${toNum(c)}`],
        [`${e} - ${bg(g)} \\div ${f}`, sub(q(e), div(g, q(f))), div(sub(q(e), g), q(f)), `${e} - ${bg(div(g, q(f)))}`, `${e}-${toNum(g)}/${f}`],
      ];
      const pick = rng.shuffle(its).slice(0, 3);
      return {
        title: 'Calcule en respectant les priorités.',
        steps: pick.map(([t, v, w], i) => numStep(`${L[i]}) ${m(t)}`, m(`${t} =`), v, 'Parenthèses d’abord, puis × et ÷, puis + et −.', [[w, t.startsWith('(') ? 'Les parenthèses se calculent en premier.' : 'La multiplication et la division passent avant l’addition et la soustraction.']], { form: isInt(v) ? 'any' : 'decimal', shown: bg(v) })),
        solution: pick.map(([t, v, , mid], i) => `${L[i]}) ${m(`${t} = ${mid} = ${bg(v)}`)}.`),
        answer: pick.map(([, v]) => m(bg(v))).join(' ; '),
        key: pick.map((p) => p[0]).join('|'),
        data: { kind: 'js', items: pick.map(([, v, , , j], i) => ({ what: L[i], js: j, expect: toNum(v), tol: 1e-9 })) },
      };
    }
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [];
    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? rng.int(18, 98) : dec(rng.int(11, 99), 2), y = i === 0 ? rng.int(11, 99) : rng.int(101, 499);
      const X = typeof x === 'number' ? q(x) : x;
      const ex = mul(X, q(y));
      const rx = (v: number) => { const p = 10 ** Math.floor(Math.log10(v)); return Math.round(v / p) * p; };
      const ax = rx(toNum(X)), ay = rx(y);
      const est = ax * ay;
      const opts = [ex, mul(ex, q(10)), div(ex, q(10)), div(ex, q(100))];
      const t = `${bg(X)} \\times ${y}`;
      steps.push({ prompt: `${L[i]}) Sans poser l’opération, quel est le résultat de ${m(t)} ?`, answer: shuffledChoice(rng, m(bg(ex)), opts.slice(1).map((o) => [m(bg(o)), `Ordre de grandeur : ${m(`${bg(ax)} \\times ${ay} = ${bg(est)}`)}. ${m(bg(o))} est ${cmp(o, ex) > 0 ? 'beaucoup trop grand' : 'beaucoup trop petit'} : erreur de virgule.`] as [Rich, Rich])), hint: 'Remplace chaque nombre par un nombre proche et simple, puis calcule de tête.' });
      sol.push(`${L[i]}) ${m(`${t} \\approx ${bg(ax)} \\times ${ay} = ${bg(est)}`)} : seul ${m(bg(ex))} est cohérent.`);
      items.push({ what: `e${i}`, js: `${toNum(X)}*${y}`, expect: toNum(ex), tol: 1e-9 });
    }
    // c) estimation de dépense puis rendu de monnaie (J3)
    const who = rng.pick(NAMES);
    const prices = [dec(rng.int(105, 995), 2), dec(rng.int(1005, 1995), 2)];
    const dbl = dec(rng.int(105, 395), 2);
    const tot = add(add(prices[0], prices[1]), mul(q(2), dbl));
    const bill = toNum(tot) < 20 ? 20 : toNum(tot) < 50 ? 50 : 100;
    const back = sub(q(bill), tot);
    steps.push(step(`c) ${who} achète un article à ${m(fx(prices[0], 2))} €, un à ${m(fx(prices[1], 2))} € et deux à ${m(fx(dbl, 2))} € l’un. ${who} paie avec un billet de ${bill} €. Combien lui rend-on ?`, [{ ...F('Monnaie :', back, '€'), form: 'decimal', shown: fx(back, 2) }], 'Calcule la dépense (deux articles au même prix !), puis la différence avec le billet.', mist(back, [[sub(q(bill), add(add(prices[0], prices[1]), dbl)), 'Il y a **deux** articles au dernier prix.'], [tot, 'C’est la dépense ; on demande la monnaie rendue.']])));
    sol.push(`c) Dépense : ${m(`${fx(prices[0], 2)} + ${fx(prices[1], 2)} + 2 \\times ${fx(dbl, 2)} = ${fx(tot, 2)}`)} € (ordre de grandeur : ${m(`${Math.round(toNum(prices[0]))} + ${Math.round(toNum(prices[1]))} + ${2 * Math.round(toNum(dbl))} = ${Math.round(toNum(prices[0])) + Math.round(toNum(prices[1])) + 2 * Math.round(toNum(dbl))}`)}) ; on rend ${m(`${bill} - ${fx(tot, 2)} = ${fx(back, 2)}`)} €.`);
    items.push({ what: 'back', js: `${bill}-(${toNum(prices[0])}+${toNum(prices[1])}+2*${toNum(dbl)})`, expect: toNum(back), tol: 1e-9 });
    return { title: 'Ordre de grandeur.', steps, solution: sol, answer: `${items.slice(0, 2).map((i) => m(bg(i.expect))).join(' ; ')} ; ${m(fx(back, 2))} €`, key: items.map((i) => i.js).join('|'), data: { kind: 'js', items } };
  },
};

// ===================================================================== arrondir, tronquer
const roundTo = (x: Q, dp: number): Q => q(Math.round(toNum(x) * 10 ** dp + 1e-9), 10 ** dp);
const truncTo = (x: Q, dp: number): Q => q(Math.floor(toNum(x) * 10 ** dp + 1e-9), 10 ** dp);
const RK = ['à l’unité', 'au dixième', 'au centième', 'au millième'];
export const arrondir: Generator = {
  id: 'arrondir',
  title: 'Arrondir, tronquer',
  desc: 'Arrondi à l’unité, au dixième, au centième ; troncature ; pièges (★★).',
  stars: 1,
  levels: [1, 2],
  example: '15{,}473 \\approx 15{,}5 \\text{ (arrondi au dixième)}',
  course: LINKS.s4,
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [];
    if (level === 1) {
      let x: Q;
      // trois décimales exactement (dernier chiffre non nul) : chaque précision demandée (unité, dixième, centième) est plus grossière
      let N = 0;
      do { N = rng.int(1001, 99999); x = dec(N, 3); } while (N % 10 === 0 || (digitAt(x, -2) < 5 && digitAt(x, -1) < 5 && rng.chance(0.7)));
      for (const [i, dp] of [0, 1, 2].entries()) {
        const r = roundTo(x, dp), t = truncTo(x, dp);
        const nx = digitAt(x, -dp - 1);
        steps.push(numStep(`${L[i]}) Arrondis ${m(bg(x))} ${RK[dp]}.`, '', r, `Regarde le chiffre qui suit le rang demandé : ${m(String(nx))}.`, [[eq(r, t) ? add(t, q(1, 10 ** dp)) : t, eq(r, t) ? `Le chiffre suivant est ${nx}, plus petit que 5 : on garde le chiffre.` : `C’est la troncature : le chiffre suivant est ${nx}, donc on augmente.`]], { form: dp ? 'decimal' : 'any', shown: fx(r, dp) }));
        sol.push(`${L[i]}) ${RK[dp][0].toUpperCase() + RK[dp].slice(1)} : chiffre suivant ${m(String(nx))}, donc ${m(`${bg(x)} \\approx ${fx(r, dp)}`)}.`);
        items.push({ what: `r${dp}`, js: `Math.round(${Math.round(toNum(x) * 1000)}/${10 ** (3 - dp)})/${10 ** dp}`, expect: toNum(r), tol: 1e-9 });
      }
      const t1 = truncTo(x, 1);
      steps.push(numStep(`d) Donne la troncature de ${m(bg(x))} au dixième.`, '', t1, 'Tronquer, c’est couper après le rang demandé.', [[roundTo(x, 1), 'C’est l’arrondi ; la troncature coupe sans regarder le chiffre suivant.']], { form: 'decimal', shown: fx(t1, 1) }));
      sol.push(`d) On coupe après les dixièmes : ${m(fx(t1, 1))}.`);
      items.push({ what: 't1', js: `Math.floor(${N}/100)/10`, expect: toNum(t1), tol: 1e-9 });
      return { title: 'Arrondis et tronque.', steps, solution: sol, answer: items.map((i) => m(bg(i.expect))).join(' ; '), key: String(toNum(x)), data: { kind: 'js', items } };
    }
    // ★★ : cascade, retenue, fraction
    const ip = rng.int(1, 30);
    const cas = add(q(ip), dec(rng.int(1, 8) * 100 + 40 + rng.int(5, 9), 3)); // ex. 2,446
    const rc = roundTo(cas, 1);
    steps.push(numStep(`a) Arrondis ${m(bg(cas))} au dixième.`, '', rc, 'Regarde **seulement** le chiffre qui suit les dixièmes.', [[add(rc, q(1, 10)), `On n’arrondit pas « en cascade » (d’abord au centième, puis au dixième) : le chiffre des centièmes est ${digitAt(cas, -2)}, donc on garde.`]], { form: 'decimal', shown: fx(rc, 1) }));
    sol.push(`a) Chiffre des centièmes : ${m(String(digitAt(cas, -2)))} (plus petit que 5) : ${m(`${bg(cas)} \\approx ${fx(rc, 1)}`)} (et non ${m(fx(add(rc, q(1, 10)), 1))}).`);
    items.push({ what: 'cas', js: `Math.round(${Math.round(toNum(cas) * 1000)}/100)/10`, expect: toNum(rc), tol: 1e-9 });
    const ip2 = rng.int(0, 98);
    const ret = add(q(ip2), dec(rng.int(95, 99) * 10 + rng.int(0, 9), 3)); // ex. 9,97x → retenue
    const rr = roundTo(ret, 1);
    steps.push(numStep(`b) Arrondis ${m(bg(ret))} au dixième.`, '', rr, 'Le chiffre suivant est 5 ou plus : on augmente le chiffre des dixièmes… qui vaut 9 : la retenue se propage.', [[add(q(ip2), q(1, 10)), `La retenue se propage : ${m('9')} dixièmes + 1 dixième = 1 unité.`], [truncTo(ret, 1), 'C’est la troncature : le chiffre suivant est 5 ou plus, on augmente.']], { form: 'decimal', shown: fx(rr, 1) }));
    sol.push(`b) Chiffre suivant ${m(String(digitAt(ret, -2)))} : on augmente ${m(`${bg(truncTo(ret, 1))}`)} d’un dixième, ce qui donne ${m(fx(rr, 1))} (on écrit le zéro des dixièmes).`);
    items.push({ what: 'ret', js: `Math.round(${Math.round(toNum(ret) * 1000)}/100)/10`, expect: toNum(rr), tol: 1e-9 });
    const [nu, de] = rng.pick([[2, 3], [1, 3], [5, 6], [1, 6], [4, 7], [2, 7], [5, 9], [7, 9], [8, 11], [10, 3], [17, 6]]);
    const v = nu / de;
    const tr = q(Math.floor(v * 100), 100), ar = q(Math.round(v * 100), 100);
    steps.push(step(`c) ${m(`\\dfrac{${nu}}{${de}} = ${(Math.floor(v * 10000) / 10000).toFixed(4).replace('.', '{,}')}\\ldots`)} Donne sa troncature, puis son arrondi au centième.`, [D('Troncature :', tr), D('Arrondi :', ar)], 'Troncature : couper. Arrondi : regarder le chiffre des millièmes.', eq(tr, ar) ? [] : [{ on: 'numAll', values: [ar, tr], msg: 'Inversés : la troncature coupe, l’arrondi regarde le chiffre suivant.' }, { on: 'numAll', values: [tr, tr], msg: `L’arrondi : le chiffre des millièmes est ${Math.floor(v * 1000) % 10}, donc on augmente.` }]));
    sol.push(`c) Troncature : ${m(fx(tr, 2))} ; chiffre des millièmes ${m(String(Math.floor(v * 1000) % 10))}, donc arrondi ${m(fx(ar, 2))}.`);
    items.push({ what: 'tr', js: `Math.floor(${nu}/${de}*100)/100`, expect: toNum(tr), tol: 1e-9 }, { what: 'ar', js: `Math.round(${nu}/${de}*100)/100`, expect: toNum(ar), tol: 1e-9 });
    return { title: 'Arrondis : attention aux pièges.', steps, solution: sol, answer: [m(fx(rc, 1)), m(fx(rr, 1)), m(fx(tr, 2)), m(fx(ar, 2))].join(' ; '), key: `${toNum(cas)}|${toNum(ret)}|${nu}/${de}`, data: { kind: 'js', items } };
  },
};
