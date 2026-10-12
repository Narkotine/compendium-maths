/** Chapitre 17 (suite) : contraire et incompatibles, arbres, tableau des deux dés et dénombrement, fréquences, erreurs. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice, fixedChoice, NAMES } from '../engine/build';
import { sub, add, mul, eq } from '../engine/q';
import { table, tt } from '../ch16/common';
import { LINKS, m, fq, fr, frs, P, probF, exactF, dn, treeSvg, q, toNum, type Q } from './common';
import { type Item, step, corr } from './bases';

const pw = (v: Q, n: number) => { let r = q(1); for (let i = 0; i < n; i++) r = mul(r, v); return r; };
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const qd = (v: number) => q(Math.round(v * 1000), 1000);

// ===================================================================== contraire, incompatibles
export const contraire: Generator = {
  id: 'contraire', title: 'Contraire et somme des probabilités', stars: 1, levels: [1, 2], course: LINKS.s3, links: [LINKS.s21],
  desc: 'P(non A) = 1 − P(A) en décimal, pourcentage ou fraction ; ★★ : dé truqué, événements incompatibles.',
  example: P('non A') + ' = 1 - 0{,}3 = 0{,}7',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const pd = q(rng.int(1, 19) * 5, 100), pp = rng.int(5, 95), pf = rng.pick([q(1, 3), q(2, 5), q(3, 8), q(5, 12), q(2, 7), q(4, 9), q(7, 10), q(5, 6), q(3, 11)]);
      const ctx = rng.pick([['qu’il pleuve demain', 'qu’il ne pleuve pas'], ['que le bus soit en retard', 'qu’il soit à l’heure'], ['que l’équipe gagne', 'qu’elle ne gagne pas'], ['qu’une ampoule soit défectueuse', 'qu’elle fonctionne']]);
      steps.push(step(`a) ${m(`P(A) = ${dn(pd)}`)}. Calcule ${m(P('non A'))}.`, [exactF('', sub(q(1), pd))], `${m(P('non A'))} = 1 − ${m('P(A)')}.`, mist(sub(q(1), pd), [[pd, 'C’est P(A) : prends le complément à 1.']])));
      steps.push(step(`b) La probabilité ${ctx[0]} est ${m(`${pp}\\,\\%`)}. Quelle est la probabilité ${ctx[1]} (en %) ?`, [exactF('', q(100 - pp), '%')], 'En pourcentage, le total fait 100 %.', mist(q(100 - pp), [[q(pp), 'C’est la probabilité de départ : prends le complément à 100.']])));
      steps.push(step(`c) ${m(`P(B) = ${fq(pf)}`)}. Calcule ${m(P('non B'))}.`, [probF('', sub(q(1), pf))], `Écris 1 sous la forme ${m(fr(pf.d, pf.d))}.`, mist(sub(q(1), pf), [[q(pf.d - pf.n, pf.n), 'Le dénominateur ne change pas.']])));
      items.push({ what: 'a', js: `1-${toNum(pd)}`, expect: 1 - toNum(pd), tol: 1e-12 }, { what: 'b', js: `100-${pp}`, expect: 100 - pp }, { what: 'c', js: `1-${pf.n}/${pf.d}`, expect: 1 - toNum(pf), tol: 1e-12 });
      sol.push(`a) ${m(`1 - ${dn(pd)} = ${dn(sub(q(1), pd))}`)}.`, `b) ${m(`100 - ${pp} = ${100 - pp}`)} %.`, `c) ${m(`1 - ${fq(pf)} = ${fr(pf.d, pf.d)} - ${fq(pf)} = ${fq(sub(q(1), pf))}`)}.`);
      return { title: 'L’événement contraire.', steps, solution: sol, answer: `${dn(sub(q(1), pd))} ; ${100 - pp} % ; ${fq(sub(q(1), pf))}`, key: `${dn(pd)}|${pp}|${fq(pf)}|${ctx[0]}`, data: { kind: 'js', items } };
    }
    let rest: number[];
    do rest = range(1, 5).map(() => rng.pick([5, 10, 10, 15, 15, 20, 20, 25, 30])); while (rest.reduce((s, v) => s + v, 0) >= 95 || rest.reduce((s, v) => s + v, 0) < 55);
    const miss = rng.int(0, 5), pm = q(100 - rest.slice(0, 5).reduce((s, v) => s + v, 0), 100), all = range(0, 5).map((i) => (i === miss ? pm : q(rest[i < miss ? i : i - 1], 100)));
    const evn = rng.pick([['pair', [2, 4, 6]], ['impair', [1, 3, 5]], ['supérieur ou égal à 4', [4, 5, 6]], ['inférieur ou égal à 2', [1, 2]]] as const), pe = (evn[1] as readonly number[]).reduce((s, f) => add(s, all[f - 1]), q(0));
    const display = table([[tt('Face'), ...range(1, 6).map(String)], [tt('Probabilité'), ...all.map((v, i) => (i === miss ? '?' : dn(v)))]]);
    steps.push(step(`a) Probabilité d’obtenir ${miss + 1} ?`, [exactF('', pm)], 'La somme des probabilités des six faces vaut 1.', mist(pm, [[q(1, 6), 'Le dé est truqué : les faces ne sont pas équiprobables.']])));
    steps.push(step(`b) Probabilité d’obtenir un nombre ${evn[0]} ?`, [exactF('', pe)], `Additionne les probabilités des faces ${(evn[1] as readonly number[]).join(', ')} (issues incompatibles).`, mist(pe, [[q((evn[1] as readonly number[]).length, 6), 'Le dé est truqué : additionne les probabilités du tableau.']])));
    const x = rng.pick([q(6, 10), q(7, 10), q(1, 2), q(3, 10), q(45, 100), q(2, 5)]), y = rng.pick([q(5, 10), q(4, 10), q(3, 10), q(65, 100), q(55, 100)]), okI = toNum(add(x, y)) <= 1 ? 0 : 1;
    steps.push({ prompt: `c) Peut-on avoir deux événements incompatibles ${m('C')} et ${m('D')} avec ${m(`P(C) = ${dn(x)}`)} et ${m(`P(D) = ${dn(y)}`)} ?`, answer: fixedChoice(['Oui', 'Non'], okI, [`${m(`${dn(x)} + ${dn(y)} = ${dn(add(x, y))} > 1`)} : impossible.`, `${m(`${dn(x)} + ${dn(y)} = ${dn(add(x, y))}`)} ne dépasse pas 1 : c’est possible.`]), hint: `Incompatibles : ${m('P(C \\text{ ou } D) = P(C) + P(D)')}, qui ne peut pas dépasser 1.` });
    items.push({ what: 'a', js: `1-(${rest.slice(0, 5).join('+')})/100`, expect: toNum(pm), tol: 1e-12 }, { what: 'b', js: `[${all.map(toNum).join(',')}].filter((_,i)=>[${(evn[1] as readonly number[]).join(',')}].includes(i+1)).reduce((s,v)=>s+v,0)`, expect: toNum(pe), tol: 1e-12 }, { what: 'step:2', js: `(${toNum(x)}+${toNum(y)}<=1)?0:1`, expect: okI });
    sol.push(`a) ${m(`1 - (${all.filter((_, i) => i !== miss).map(dn).join(' + ')}) = ${dn(pm)}`)}.`, `b) ${m((evn[1] as readonly number[]).map((f) => dn(all[f - 1])).join(' + ') + ` = ${dn(pe)}`)}.`, `c) ${okI === 1 ? `Non : on aurait ${m(`P(C \\text{ ou } D) = ${dn(add(x, y))} > 1`)}.` : `Oui : ${m(`${dn(x)} + ${dn(y)} = ${dn(add(x, y))} \\leqslant 1`)}.`}`);
    return { title: 'Un dé truqué.', statement: 'Un dé est truqué. Le tableau donne la probabilité de chaque face, sauf une.', display, steps, solution: sol, answer: `${dn(pm)} ; ${dn(pe)} ; ${okI ? 'non' : 'oui'}`, key: display + evn[0] + dn(x) + dn(y), data: { kind: 'js', items } };
  },
};

// ===================================================================== arbres
export const arbre: Generator = {
  id: 'arbre', title: 'Arbre : deux épreuves', stars: 2, levels: [2, 3], course: LINKS.s41, links: [LINKS.s42, LINKS.s5],
  desc: 'Produit sur un chemin, somme des chemins ; avec ou sans remise ; ★★★ : « au moins un » par le contraire.',
  example: '\\dfrac{4}{10} \\times \\dfrac{3}{9} = \\dfrac{2}{15}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 2) {
      const r = rng.int(2, 7), b = rng.int(2, 8), N = r + b, remise = rng.chance(0.5), [cR, cB] = rng.pick([['rouge', 'bleue'], ['verte', 'noire'], ['blanche', 'jaune']]);
      const R = cR[0].toUpperCase(), B = cB[0].toUpperCase();
      const d2 = remise ? N : N - 1, rr = remise ? r : r - 1, bb = remise ? b : b - 1;
      const pRR = q(r * rr, N * d2), pBB = q(b * bb, N * d2), pRB = q(r * b, N * d2), pDiff = add(pRB, pRB), pSame = add(pRR, pBB);
      const figure = treeSvg([[R, `${r}/${N}`], [B, `${b}/${N}`]], [[[R, `${rr}/${d2}`], [B, `${b}/${d2}`]], [[R, `${r}/${d2}`], [B, `${bb}/${d2}`]]], `Arbre ${remise ? 'avec' : 'sans'} remise : ${r} boules ${cR}s et ${b} boules ${cB}s`);
      const wantSame = rng.chance(0.5);
      steps.push(step(`a) ${m(P(`deux ${cR}s`))} ?`, [probF('', pRR)], 'Multiplie les probabilités le long du chemin.', mist(pRR, [[remise ? q(r * (r - 1), N * (N - 1)) : q(r * r, N * N), remise ? 'Avec remise, l’urne est la même au second tirage.' : 'Sans remise, il reste une boule de moins au second tirage.'], [q(r + rr, N + d2), 'On multiplie le long d’un chemin, on n’additionne pas.']])));
      const pT = wantSame ? pSame : pDiff;
      steps.push(step(`b) ${m(P(wantSame ? 'deux boules de la même couleur' : 'deux boules de couleurs différentes'))} ?`, [probF('', pT)], wantSame ? `Deux chemins : ${R}${R} et ${B}${B}.` : `Deux chemins : ${R}${B} et ${B}${R}.`, mist(pT, [[wantSame ? pRR : pRB, 'Il y a deux chemins : additionne-les.']])));
      items.push({ what: 'a', js: `${r}/${N}*${rr}/${d2}`, expect: toNum(pRR) }, { what: 'b', js: wantSame ? `${r}/${N}*${rr}/${d2}+${b}/${N}*${bb}/${d2}` : `2*${r}/${N}*${b}/${d2}`, expect: toNum(pT) });
      sol.push(`${remise ? 'Avec remise : l’urne est la même au second tirage' : `Sans remise : au second tirage, il reste ${N - 1} boules`}.`, `a) ${m(`${fr(r, N)} \\times ${fr(rr, d2)} = ${frs(r * rr, N * d2)}`)}.`);
      sol.push(wantSame ? `b) ${m(`${fr(r, N)} \\times ${fr(rr, d2)} + ${fr(b, N)} \\times ${fr(bb, d2)} = ${frs(r * rr + b * bb, N * d2)}`)}.` : `b) ${m(`${fr(r, N)} \\times ${fr(b, d2)} + ${fr(b, N)} \\times ${fr(r, d2)} = ${frs(2 * r * b, N * d2)}`)}.`);
      sol.push(`Contrôle : les quatre feuilles font ${m(`\\dfrac{${r * rr} + ${r * b} + ${b * r} + ${b * bb}}{${N * d2}} = 1`)}.`);
      return { title: `Deux tirages ${remise ? 'avec' : 'sans'} remise.`, statement: `Une urne contient ${m(String(r))} boules ${cR}s (${R}) et ${m(String(b))} boules ${cB}s (${B}). On tire successivement deux boules **${remise ? 'avec' : 'sans'} remise**.`, figure, steps, solution: sol, answer: `${fq(pRR)} ; ${fq(pT)}`, key: `${r}|${b}|${remise}|${wantSame}|${cR}`, data: { kind: 'js', items } };
    }
    const v = rng.weighted([[0, 45], [1, 35], [2, 20]] as const);
    if (v === 0) {
      const N = rng.int(8, 20), g = rng.int(2, Math.min(6, N - 3)), what = rng.pick([['tickets', 'gagnants', 'ticket gagnant'], ['ampoules', 'défectueuses', 'ampoule défectueuse'], ['œufs', 'cassés', 'œuf cassé']]);
      const p0 = q((N - g) * (N - g - 1), N * (N - 1)), pa = sub(q(1), p0);
      steps.push(step(`a) Probabilité de n’avoir aucun ${what[2]} ?`, [probF('', p0)], `Un seul chemin : deux fois « pas ${what[1].replace(/s$/, '')} », sans remise.`, mist(p0, [[pw(q(N - g, N), 2), 'Sans remise : au second tirage, il reste une de moins.']])));
      steps.push(step(`b) Probabilité d’avoir au moins un ${what[2]} ?`, [probF('', pa)], '« Au moins un » est le contraire de « aucun ».', mist(pa, [[sub(q(1), pw(q(N - g, N), 2)), 'Sans remise : au second tirage, il reste une de moins.'], [q(g, N), 'Ça, c’est pour un seul tirage.']])));
      items.push({ what: 'a', js: `(${N}-${g})/${N}*(${N}-${g}-1)/(${N}-1)`, expect: toNum(p0) }, { what: 'b', js: `1-(${N}-${g})/${N}*(${N}-${g}-1)/(${N}-1)`, expect: toNum(pa) });
      sol.push(`a) Contraire : aucun. ${m(`${fr(N - g, N)} \\times ${fr(N - g - 1, N - 1)} = ${frs((N - g) * (N - g - 1), N * (N - 1))}`)}.`, `b) ${m(`1 - ${fq(p0)} = ${fq(pa)}`)}.`);
      return { title: '« Au moins un ».', statement: `Dans une boîte de ${m(String(N))} ${what[0]}, ${m(String(g))} sont ${what[1]}. On en prend deux au hasard, l’un après l’autre, sans remise.`, steps, solution: sol, answer: `${fq(p0)} ; ${fq(pa)}`, key: `t${N}|${g}|${what[0]}`, data: { kind: 'js', items } };
    }
    if (v === 1) {
      const n = rng.int(3, 7), face = rng.chance(0.5) ? ['face', 'pile'] : ['pile', 'face'], p0 = pw(q(1, 2), n), pa = sub(q(1), p0);
      steps.push(step(`a) Probabilité de n’obtenir que des ${face[1]}s ?`, [probF('', p0)], `Un seul chemin : ${m(`\\dfrac{1}{2}`)} à chaque lancer.`, mist(p0, [[q(1, 2 * n), 'On multiplie les probabilités, on ne les additionne pas.']])));
      steps.push(step(`b) Probabilité d’obtenir au moins un ${face[0]} ?`, [probF('', pa)], `Contraire de « que des ${face[1]}s ».`, mist(pa, [[q(n, 2 * n), 'Passe par le contraire.']])));
      items.push({ what: 'a', js: `0.5**${n}`, expect: toNum(p0) }, { what: 'b', js: `1-0.5**${n}`, expect: toNum(pa) });
      sol.push(`a) ${m(`\\left(\\dfrac{1}{2}\\right)^${n} = ${fq(p0)}`)}.`, `b) ${m(`1 - ${fq(p0)} = ${fq(pa)}`)}.`);
      const cx = rng.pick([0, 1, 2]);
      if (cx > 0) {
        const [w0, w1] = face[0] === 'face' ? (cx === 1 ? ['fille', 'garçon'] : ['bonne réponse', 'mauvaise réponse']) : (cx === 1 ? ['garçon', 'fille'] : ['mauvaise réponse', 'bonne réponse']);
        const sw = (t: string) => t.replace(/\bfaces?\b/g, (x) => (x.endsWith('s') ? w0 + 's' : w0)).replace(/\bpiles?\b/g, (x) => (x.endsWith('s') ? w1 + 's' : w1));
        steps.forEach((st) => { st.prompt = sw(st.prompt); st.hint = sw(st.hint); (st.mistakes ?? []).forEach((mk) => (mk.msg = sw(mk.msg))); });
        const stt = cx === 1 ? `Une famille a ${m(String(n))} enfants ; on suppose que chaque naissance donne une fille ou un garçon avec la probabilité ${m('\\dfrac{1}{2}')}.` : `On répond au hasard à ${m(String(n))} questions vrai/faux.`;
        return { title: cx === 1 ? 'Une famille.' : 'Répondre au hasard.', statement: stt, steps, solution: sol.map(sw), answer: `${fq(p0)} ; ${fq(pa)}`, key: `p${n}|${face[0]}|${cx}`, data: { kind: 'js', items } };
      }
      return { title: 'Plusieurs pièces.', statement: `On lance ${m(String(n))} pièces équilibrées.`, steps, solution: sol, answer: `${fq(p0)} ; ${fq(pa)}`, key: `p${n}|${face[0]}`, data: { kind: 'js', items } };
    }
    const k = rng.pick([4, 6, 8, 10, 12]), n = rng.int(2, ({ 4: 6, 6: 5, 8: 4, 10: 4, 12: 3 } as Record<number, number>)[k]), p0 = pw(q(k - 1, k), n), pa = sub(q(1), p0), name = rng.pick(NAMES);
    steps.push(step(`a) Probabilité de n’obtenir aucun ${k} en ${n} lancers ?`, [probF('', p0)], `À chaque lancer, ${m(`P(\\text{pas } ${k}) = ${fr(k - 1, k)}`)}.`, mist(p0, [[sub(q(1), mul(q(n), q(1, k))), 'Multiplie le long du chemin.']])));
    steps.push(step(`b) Probabilité d’obtenir au moins un ${k} ? Donne la fraction, puis un arrondi au centième.`, [probF('', pa), { label: '≈', expect: q(Math.round(toNum(pa) * 100), 100), form: 'any', approx: { value: toNum(pa), tol: 0.005, dp: 2 }, shown: toNum(pa).toFixed(2).replace('.', '{,}') }], 'Contraire de « aucun ».', mist(pa, [[q(n, k), `On n’additionne pas ${n} fois ${fr(1, k)} : passe par le contraire.`]], 0)));
    items.push({ what: 'a', js: `((${k}-1)/${k})**${n}`, expect: toNum(p0) }, { what: 'b', js: `1-((${k}-1)/${k})**${n}`, expect: toNum(pa) });
    sol.push(`a) ${m(`\\left(${fr(k - 1, k)}\\right)^${n} = ${fq(p0)}`)}.`, `b) ${m(`1 - ${fq(p0)} = ${fq(pa)} \\approx ${toNum(pa).toFixed(2).replace('.', '{,}')}`)}${toNum(pa) > 0.5 ? ' : un peu plus d’une chance sur deux.' : ' : moins d’une chance sur deux.'}`);
    if (Math.abs(toNum(pa) * 100 % 1 - 0.5) < 0.06) return arbre.generate(rng, level);
    return { title: 'Le pari du chevalier.', statement: `${name} lance ${m(String(n))} fois un dé équilibré à ${k} faces et parie d’obtenir au moins un ${m(String(k))}.`, steps, solution: sol, answer: `${fq(p0)} ; ${fq(pa)}`, key: `m${n}|${k}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== tableau à double entrée, dénombrement
export const tableau: Generator = {
  id: 'tableau', title: 'Deux dés, tableaux, dénombrement', stars: 2, levels: [2], course: LINKS.s43, links: [LINKS.s41],
  desc: 'Sommes de deux dés (36 cases équiprobables), jeu équitable ; menus et codes.',
  example: P('somme = 7') + ' = \\dfrac{6}{36} = \\dfrac{1}{6}',
  generate(rng: Rng, level: Level) {
    void level;
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [], v = rng.int(0, 2);
    const ways = (s: number) => range(1, 6).filter((a) => s - a >= 1 && s - a <= 6).length;
    const JSW = (cond: string) => `[1,2,3,4,5,6].flatMap(a=>[1,2,3,4,5,6].map(b=>[a,b])).filter(([a,b])=>${cond}).length/36`;
    if (v === 0) {
      const s = rng.int(3, 11), t = rng.int(8, 11), op = rng.pick(['double', 'produit']);
      const ps = q(ways(s), 36), nGe = range(t, 12).reduce((c, x) => c + ways(x), 0), pg = q(nGe, 36);
      steps.push(step(`a) ${m(P(`somme = ${s}`))} ?`, [probF('', ps)], 'Compte les cases du tableau où la somme vaut ce nombre (36 cases équiprobables).', mist(ps, [[q(1, 11), 'Les 11 sommes ne sont pas équiprobables : compte les 36 cases.']])));
      steps.push(step(`b) ${m(`P(\\text{somme} \\geqslant ${t})`)} ?`, [probF('', pg)], `Sommes ${range(t, 12).join(', ')} : additionne leurs nombres de cases.`, mist(pg, [[q(13 - t, 11), 'Les sommes ne sont pas équiprobables.']])));
      const pc = op === 'double' ? q(6, 36) : q(27, 36);
      steps.push(step(`c) ${m(P(op === 'double' ? 'obtenir un double' : 'le produit des deux dés est pair'))} ?`, [probF('', pc)], op === 'double' ? 'Les doubles sont sur la diagonale.' : 'Le produit est impair seulement si les deux dés sont impairs.', mist(pc, [[op === 'double' ? q(1, 36) : q(1, 2), op === 'double' ? 'Il y a 6 doubles.' : 'Passe par le contraire : produit impair = deux impairs.']])));
      items.push({ what: 'a', js: JSW(`a+b===${s}`), expect: toNum(ps) }, { what: 'b', js: JSW(`a+b>=${t}`), expect: toNum(pg) }, { what: 'c', js: JSW(op === 'double' ? 'a===b' : '(a*b)%2===0'), expect: toNum(pc) });
      sol.push(`a) ${ways(s)} case${ways(s) > 1 ? 's' : ''} sur 36 : ${m(frs(ways(s), 36))}.`, `b) ${range(t, 12).map((x) => `${ways(x)}`).join(' + ')} = ${nGe} cases : ${m(frs(nGe, 36))}.`, op === 'double' ? `c) 6 doubles : ${m(frs(6, 36))}.` : `c) Produit impair : ${m('3 \\times 3 = 9')} cases ; ${m(`1 - ${fr(9, 36)} = ${frs(27, 36)}`)}.`);
      const display = `\\begin{array}{|c|c|c|c|c|c|c|}\\hline + & 1 & 2 & 3 & 4 & 5 & 6 \\\\ \\hline ${range(1, 6).map((a) => `${a} & ${range(1, 6).map((b) => a + b).join(' & ')}`).join(' \\\\ \\hline ')} \\\\ \\hline\\end{array}`;
      return { title: 'Deux dés.', statement: 'On lance deux dés équilibrés et on additionne les résultats (tableau des 36 cases équiprobables).', display, steps, solution: sol, answer: `${fq(ps)} ; ${fq(pg)} ; ${fq(pc)}`, key: `d${s}|${t}|${op}`, data: { kind: 'js', items } };
    }
    if (v === 1) {
      let win: number[];
      do { const c = rng.int(3, 11), w = rng.int(1, 3); win = range(c, c + w); } while (win.some((x) => x > 12));
      const nA = win.reduce((s, x) => s + ways(x), 0), pA = q(nA, 36), [A, B] = rng.shuffle(NAMES).slice(0, 2), fair = nA === 18 ? 2 : nA > 18 ? 0 : 1;
      steps.push(step(`a) Probabilité que ${A} gagne ?`, [probF('', pA)], `Sommes ${win.join(', ')} : compte les cases.`, mist(pA, [[q(win.length, 11), 'Les sommes ne sont pas équiprobables : compte les 36 cases.']])));
      steps.push({ prompt: 'b) Le jeu est-il équitable ?', answer: fixedChoice([`Non, il avantage ${A}`, `Non, il avantage ${B}`, 'Oui'], fair, [`${m(fq(pA))} ${nA > 18 ? '>' : '<'} ${m('\\dfrac{1}{2}')}.`, `${m(fq(pA))} ${nA > 18 ? '>' : '<'} ${m('\\dfrac{1}{2}')}.`, 'Il faudrait 18 cases sur 36 pour chacun.'], 1), hint: 'Équitable : chacun a une probabilité 1/2 de gagner.' });
      items.push({ what: 'a', js: JSW(`[${win.join(',')}].includes(a+b)`), expect: toNum(pA) }, { what: 'step:1', js: `(${nA}===18)?2:(${nA}>18?0:1)`, expect: fair });
      sol.push(`a) ${win.map((x) => `${ways(x)}`).join(' + ')} = ${nA} cases : ${m(`${P(`${A} gagne`)} = ${frs(nA, 36)}`)}.`, `b) ${m(`${P(`${B} gagne`)} = 1 - ${fq(pA)} = ${fq(sub(q(1), pA))}`)} : ${fair === 2 ? 'le jeu est équitable.' : `le jeu avantage ${fair === 0 ? A : B}.`}`);
      return { title: 'Un jeu équitable ?', statement: `${A} et ${B} lancent deux dés équilibrés. ${A} gagne si la somme vaut ${win.slice(0, -1).join(', ')} ou ${win[win.length - 1]} ; sinon, ${B} gagne.`, steps, solution: sol, answer: `${fq(pA)} ; ${fair === 2 ? 'équitable' : `avantage ${fair === 0 ? A : B}`}`, key: `j${win.join(',')}`, data: { kind: 'js', items } };
    }
    if (rng.chance(0.5)) {
      const E = rng.shuffle(['salade', 'soupe', 'œuf mimosa', 'melon']).slice(0, rng.int(2, 3)), Pl = rng.shuffle(['poisson', 'pâtes', 'poulet', 'omelette', 'gratin']).slice(0, rng.int(3, 4)), D = rng.int(2, 3);
      const nm = rng.pick(NAMES), N = E.length * Pl.length * D, p1 = q(1, N), notP = q(Pl.length - 1, Pl.length);
      steps.push(step('a) Combien de menus différents (entrée, plat, dessert) ?', [exactF('', q(N))], 'Arbre : chaque entrée se combine avec chaque plat, puis chaque dessert.', mist(q(N), [[q(E.length + Pl.length + D), 'On multiplie les nombres de choix, on ne les additionne pas.']])));
      steps.push(step(`b) Probabilité que ${nm} choisisse exactement ${E[0]}, ${Pl[0]} et le dessert n° 1 ?`, [probF('', p1)], 'Un seul menu parmi tous les menus équiprobables.'));
      steps.push(step(`c) Probabilité qu’elle ne prenne pas de ${Pl[1]} ?`, [probF('', notP)], 'Seul le choix du plat compte.', mist(notP, [[q(1, Pl.length), 'Ça, c’est la probabilité de prendre ce plat.']])));
      items.push({ what: 'a', js: `${E.length}*${Pl.length}*${D}`, expect: N }, { what: 'b', js: `1/(${E.length}*${Pl.length}*${D})`, expect: 1 / N }, { what: 'c', js: `1-1/${Pl.length}`, expect: toNum(notP) });
      sol.push(`a) ${m(`${E.length} \\times ${Pl.length} \\times ${D} = ${N}`)} menus.`, `b) ${m(fr(1, N))}.`, `c) ${m(`1 - ${fr(1, Pl.length)} = ${fq(notP)}`)} (le reste du menu n’y change rien).`);
      return { title: 'Composer un menu.', statement: `Un menu propose ${E.length} entrées (${E.join(', ')}), ${Pl.length} plats (${Pl.join(', ')}) et ${D} desserts. ${nm} choisit chaque élément au hasard.`, steps, solution: sol, answer: `${N} ; ${fq(p1)} ; ${fq(notP)}`, key: `n${E.join(',')}|${Pl.join(',')}|${D}`, data: { kind: 'js', items } };
    }
    const n = rng.int(3, 5), base = rng.pick([10, 10, 6, 4, 5, 8]), N = base ** n, k = rng.int(1, n - 1);
    const what = base === 10 ? `chiffres (de 0 à 9 chacun)` : base === 4 ? 'couleurs choisies parmi 4' : `symboles choisis parmi ${base}`;
    steps.push(step('a) Combien de codes possibles ?', [exactF('', q(N))], `${n} positions, ${base} choix pour chacune.`, mist(q(N), [[q(base * n), 'On multiplie les choix : ce sont des puissances.']])));
    steps.push(step('b) Probabilité de trouver le code au premier essai, au hasard ?', [probF('', q(1, N))], 'Un seul code est le bon.'));
    steps.push(step(`c) Même question si l’on connaît déjà les ${k} premier${k > 1 ? 's' : ''} élément${k > 1 ? 's' : ''} du code.`, [probF('', q(1, base ** (n - k)))], `Il reste ${n - k} position${n - k > 1 ? 's' : ''} inconnue${n - k > 1 ? 's' : ''}.`, mist(q(1, base ** (n - k)), [[q(1, N - base ** k), 'Recompte les codes encore possibles.']])));
    items.push({ what: 'a', js: `${base}**${n}`, expect: N }, { what: 'b', js: `1/${base}**${n}`, expect: 1 / N }, { what: 'c', js: `1/${base}**(${n}-${k})`, expect: 1 / base ** (n - k) });
    sol.push(`a) ${m(`${Array(n).fill(base).join(' \\times ')} = ${N}`)} codes.`, `b) ${m(fr(1, N))}.`, `c) Il reste ${m(String(base ** (n - k)))} codes : ${m(fr(1, base ** (n - k)))}.`);
    return { title: 'Un code secret.', statement: `Un cadenas a un code de ${n} ${what}.`, steps, solution: sol, answer: `${N} ; ${fq(q(1, N))} ; ${fq(q(1, base ** (n - k)))}`, key: `c${n}|${base}|${k}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== fréquences
export const frequence: Generator = {
  id: 'frequence', title: 'Fréquence et probabilité', stars: 1, levels: [1, 2], course: LINKS.s6,
  desc: 'Fréquence observée, écart à la probabilité ; ★★ : estimer une probabilité, échantillons trop petits, le hasard sans mémoire.',
  example: '\\dfrac{613}{1\\,000} = 0{,}613',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const n = rng.pick([50, 100, 200, 250, 400, 500, 1000]), kind = rng.pick(['pièce', 'urne', 'dé4'] as const);
      const [desc, ev, p] = kind === 'pièce' ? ['On lance une pièce équilibrée', 'pile', q(1, 2)] : kind === 'urne' ? ['On tire une boule (avec remise) dans une urne de 10 boules dont 3 rouges', 'rouge', q(3, 10)] : ['On lance un dé équilibré à 4 faces', 'le 4', q(1, 4)];
      const k = Math.round(n * toNum(p)) + rng.int(-Math.ceil(n / 25), Math.ceil(n / 25)), f = q(k, n), gap = q(Math.abs(k * p.d - n * p.n), n * p.d);
      steps.push(step(`a) Fréquence de « ${ev} » (en écriture décimale) ?`, [{ ...exactF('', f), form: 'decimal' }], `${m(`\\dfrac{${k}}{${n}}`)}.`, mist(f, [[q(n, k), 'Inversé : nombre de fois ÷ nombre d’essais.'], [q(k), 'Ça, c’est l’effectif.']])));
      steps.push(step(`b) Écart entre cette fréquence et la probabilité ${m(dn(p))} ?`, [{ ...exactF('', gap), form: 'decimal' }], 'Plus grande moins plus petite.'));
      items.push({ what: 'f', js: `${k}/${n}`, expect: toNum(f) }, { what: 'g', js: `Math.abs(${k}/${n}-${p.n}/${p.d})`, expect: toNum(gap), tol: 1e-12 });
      sol.push(`a) ${m(`\\dfrac{${k}}{${n}} = ${dn(f)}`)}.`, `b) ${m(`${eq(gap, q(0)) ? `${dn(f)} = ${dn(p)}` : `${dn(toNum(f) > toNum(p) ? f : p)} - ${dn(toNum(f) > toNum(p) ? p : f)} = ${dn(gap)}`}`)} : sur ${n} essais, la fréquence est ${toNum(gap) <= 0.03 ? 'proche de' : 'encore un peu éloignée de'} la probabilité.`);
      return { title: 'Fréquence observée.', statement: `${desc} ${m(String(n))} fois ; on obtient ${m(String(k))} fois « ${ev} ».`, steps, solution: sol, answer: `${dn(f)} ; ${dn(gap)}`, key: `${kind}|${n}|${k}`, data: { kind: 'js', items } };
    }
    const n = rng.pick([500, 1000, 2000]), k = Math.round(n * rng.int(52, 72) / 100) + rng.int(-4, 4), obj = rng.pick([['une punaise', 'pointe en haut', 'pointe en bas'], ['un bouchon', 'debout', 'couché'], ['un gobelet', 'sur le côté', 'debout ou à l’envers']]);
    const f = q(k, n), fb = sub(q(1), f), est = qd(Math.round(toNum(fb) * 100) / 100);
    steps.push(step(`a) Estime ${m(P(obj[2]))}, arrondie au centième.`, [{ label: '≈', expect: est, form: 'any', approx: { value: toNum(fb), tol: 0.005, dp: 2 }, shown: toNum(fb).toFixed(2).replace('.', '{,}') }], `Fréquence de « ${obj[2]} » = 1 − fréquence de « ${obj[1]} ».`, mist(est, [[qd(Math.round(toNum(f) * 100) / 100), `Ça, c’est la fréquence de « ${obj[1]} ».`], [q(1, 2), 'Les deux positions ne sont pas équiprobables : utilise la fréquence observée.']])));
    const sm = rng.int(7, 9), nm = rng.pick(NAMES);
    steps.push({ prompt: `b) ${nm} lance 10 fois une pièce et obtient ${sm} piles. ${nm} en conclut que la pièce est truquée. A-t-il raison ?`.replace('A-t-il', ['Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina', 'Sarah', 'Maëlle', 'Amina', 'Ana'].includes(nm) ? 'A-t-elle' : 'A-t-il'), answer: shuffledChoice(rng, 'Non : sur 10 lancers, la fréquence peut s’éloigner beaucoup de 0,5', [['Oui : la fréquence est trop loin de 0,5', 'Sur si peu de lancers, de tels écarts arrivent souvent.'], ['Oui : face est maintenant plus probable', 'La pièce n’a pas de mémoire.']]), hint: 'La fréquence ne se stabilise que sur un grand nombre d’essais.' });
    const st = rng.int(4, 7);
    steps.push({ prompt: `c) On vient d’obtenir ${st} fois pile de suite avec une pièce équilibrée. Au lancer suivant :`, answer: shuffledChoice(rng, 'pile et face ont toujours la même probabilité', [['face est plus probable', 'Le hasard ne « compense » pas : la pièce n’a pas de mémoire.'], ['pile est plus probable', 'Les lancers sont indépendants : ni l’un ni l’autre n’est favorisé.']]), hint: 'La pièce se souvient-elle des lancers précédents ?' });
    items.push({ what: 'a', js: `1-${k}/${n}`, expect: toNum(fb), tol: 1e-12 }, { what: 'step:1', js: String(corr(steps[1])), expect: corr(steps[1]) }, { what: 'step:2', js: String(corr(steps[2])), expect: corr(steps[2]) });
    if (Math.abs((toNum(fb) * 100) % 1 - 0.5) < 0.06) return frequence.generate(rng, level);
    sol.push(`a) Fréquence de « ${obj[2]} » : ${m(`1 - \\dfrac{${k}}{${n}} = ${dn(fb)}`)} ; sur ${n} lancers, ${m(`${P(obj[2])} \\approx ${toNum(fb).toFixed(2).replace('.', '{,}')}`)}.`, 'b) Non : 10 lancers, c’est trop peu pour conclure ; il en faudrait beaucoup plus.', 'c) La pièce n’a pas de mémoire : ' + m('P(\\text{face}) = \\dfrac{1}{2}') + ' à chaque lancer.');
    return { title: 'Estimer une probabilité.', statement: `On lance ${m(String(n))} fois ${obj[0]} : on observe ${m(String(k))} fois « ${obj[1]} ».`, steps, solution: sol, answer: `≈ ${toNum(fb).toFixed(2).replace('.', ',')}`, key: `e${n}|${k}|${obj[0]}|${sm}|${st}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== trouver l'erreur
const ERR = ['Les issues qu’il compte ne sont pas équiprobables.', 'Il a calculé comme s’il y avait remise.', 'Il a compté deux fois les issues communes.', 'Il croit que le hasard a de la mémoire.', 'Il a additionné au lieu de multiplier le long du chemin.'];
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s22, links: [LINKS.s42, LINKS.s3, LINKS.s6, LINKS.s43],
  desc: 'Sommes de deux dés, couleurs au lieu des boules, remise oubliée, double comptage, hasard « qui compense ».',
  example: P('somme = 7') + ' \\neq \\dfrac{1}{11}',
  generate(rng: Rng, level: Level) {
    void level;
    const nm = rng.pick(NAMES.filter((x) => !['Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina', 'Sarah', 'Maëlle', 'Amina', 'Ana'].includes(x))), v = rng.int(0, 4), items: Item[] = [], sol: Rich[] = [];
    const qcm = (good: number): Step => ({ prompt: 'a) Quelle est l’erreur ?', answer: shuffledChoice(rng, ERR[good], rng.shuffle(ERR.filter((_, t) => t !== good)).slice(0, 3).map((e): [Rich, Rich] => [e, 'Relis son raisonnement : ce n’est pas là que ça coince.'])), hint: 'Les issues sont-elles équiprobables ? Y a-t-il remise ? Des issues comptées deux fois ?' });
    let st: string, steps: Step[], ans: string, key: string;
    if (v === 0) {
      const s = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((x) => x !== 0)), w = 6 - Math.abs(7 - s), p = q(w, 36);
      st = `${nm} écrit : « Avec deux dés, les sommes vont de 2 à 12 : il y en a 11. Donc ${m(`P(\\text{somme} = ${s}) = \\dfrac{1}{11}`)}. »`;
      steps = [qcm(0), step(`b) Quelle est la vraie probabilité que la somme vaille ${s} ?`, [probF('', p)], 'Compte les couples équiprobables parmi les 36.', mist(p, [[q(1, 11), 'C’est l’erreur.']]))];
      items.push({ what: 'p', js: `[1,2,3,4,5,6].flatMap(a=>[1,2,3,4,5,6].map(b=>a+b)).filter(x=>x===${s}).length/36`, expect: toNum(p) });
      sol.push('Les 11 sommes ne sont pas équiprobables : il faut compter les 36 couples.', `La somme ${s} apparaît ${w} fois : ${m(frs(w, 36))}.`);
      ans = fq(p); key = `s${s}`;
    } else if (v === 1) {
      const cols = rng.shuffle(['rouges', 'vertes', 'bleues', 'jaunes']).slice(0, 3), cnt = cols.map(() => rng.int(1, 8)), N = cnt.reduce((s, x) => s + x, 0);
      if (cnt[0] * 3 === N) return erreur.generate(rng, level);
      const p = q(cnt[0], N);
      st = `Une urne contient ${cols.map((c, i) => `${cnt[i]} boule${cnt[i] > 1 ? 's' : ''} ${cnt[i] > 1 ? c : c.replace(/s$/, '')}`).join(', ')}. ${nm} écrit : « Il y a trois couleurs, donc ${m(`${P(cols[0].replace(/s$/, ''))} = \\dfrac{1}{3}`)}. »`;
      steps = [qcm(0), step(`b) Quelle est la vraie probabilité ?`, [probF('', p)], 'Compte les boules, pas les couleurs.', mist(p, [[q(1, 3), 'C’est l’erreur.']]))];
      items.push({ what: 'p', js: `${cnt[0]}/(${cnt.join('+')})`, expect: toNum(p) });
      sol.push('Ce sont les boules qui sont équiprobables, pas les couleurs.', `${m(`${frs(cnt[0], N)}`)}.`);
      ans = fq(p); key = `c${cnt.join(',')}`;
    } else if (v === 2) {
      const r = rng.int(2, 7), b = rng.int(2, 8), N = r + b, p = q(r * (r - 1), N * (N - 1));
      st = `On tire deux boules **sans remise** dans une urne de ${r} rouges et ${b} bleues. ${nm} écrit : « ${m(`${P('deux rouges')} = ${fr(r, N)} \\times ${fr(r, N)} = ${fq(q(r * r, N * N))}`)} ».`;
      steps = [qcm(1), step('b) Quelle est la bonne probabilité ?', [probF('', p)], `Au second tirage, il reste ${r - 1} rouge${r > 2 ? 's' : ''} sur ${N - 1} boules.`, mist(p, [[q(r * r, N * N), 'C’est l’erreur.']]))];
      items.push({ what: 'p', js: `${r}/${N}*(${r}-1)/(${N}-1)`, expect: toNum(p) });
      sol.push('C’est le calcul **avec** remise.', `Sans remise : ${m(`${fr(r, N)} \\times ${fr(r - 1, N - 1)} = ${frs(r * (r - 1), N * (N - 1))}`)}.`);
      ans = fq(p); key = `r${r}|${b}`;
    } else if (v === 3) {
      const s = rng.pick(['cœur', 'pique', 'carreau', 'trèfle']), r = rng.pick(['roi', 'as', 'valet', 'dame', '7', '8', '9', '10']), p = q(11, 32);
      st = `On tire une carte dans un jeu de 32 cartes. ${nm} écrit : « ${m(`P(\\text{${s} ou ${r}}) = \\dfrac{8}{32} + \\dfrac{4}{32} = \\dfrac{12}{32}`)} ».`;
      steps = [qcm(2), step('b) Quelle est la bonne probabilité ?', [probF('', p)], `Une carte est à la fois ${s} et ${r}.`, mist(p, [[q(12, 32), 'C’est l’erreur.']]))];
      items.push({ what: 'p', js: `(8+4-1)/32`, expect: 11 / 32 });
      sol.push(`${r === 'dame' ? 'La dame' : r === 'as' ? 'L’as' : /^\d/.test(r) ? `Le ${r}` : `Le ${r}`} de ${s} est compté${r === 'dame' ? 'e' : ''} deux fois.`, `${m('8 + 3 = 11')} cartes : ${m(fr(11, 32))}.`);
      ans = '11/32'; key = `k${s}|${r}`;
    } else {
      const n = rng.int(3, 10), side = rng.pick([['pile', 'face'], ['face', 'pile']]);
      st = `${nm} a obtenu ${n} fois ${side[0]} de suite avec une pièce équilibrée. Il écrit : « Au prochain lancer, ${side[1]} est plus probable. »`;
      steps = [qcm(3), step(`b) Quelle est la probabilité d’obtenir ${side[1]} au prochain lancer ?`, [probF('', q(1, 2))], 'Chaque lancer est indépendant des précédents.')];
      items.push({ what: 'p', js: '1/2', expect: 0.5 });
      sol.push('La pièce n’a pas de mémoire : les lancers sont indépendants.', `${m(`P(\\text{${side[1]}}) = \\dfrac{1}{2}`)}, comme à chaque lancer.`);
      ans = '1/2'; key = `g${n}|${side[0]}`;
    }
    items.push({ what: 'step:0', js: String(corr(steps[0])), expect: corr(steps[0]) });
    return { title: 'Trouve l’erreur.', statement: st, steps, solution: sol, answer: ans, key, data: { kind: 'js', items } };
  },
};
