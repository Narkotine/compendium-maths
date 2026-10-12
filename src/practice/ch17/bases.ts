/** Chapitre 17 : vocabulaire, équiprobabilité, urnes, cartes, roues. */
import type { Generator, Level, Rich, Step, NumField } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice, fixedChoice } from '../engine/build';
import { sub, add, div, mul, eq } from '../engine/q';
import { pieSvg } from '../ch16/common';
import { LINKS, m, fq, fr, frs, P, probF, exactF, q, toNum } from './common';

export type Item = { what: string; js: string; expect: number; tol?: number };
export const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Step['mistakes'] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
export const corr = (s: Step) => (s.answer as { correct: number }).correct;
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const isPrime = (n: number) => n > 1 && range(2, Math.floor(Math.sqrt(n))).every((d) => n % d !== 0);

/** Événement sur un tirage d'entier de 1 à N : nom, contraire, prédicat (TS) et prédicat (JS indépendant). */
export interface Ev { name: string; not: string; f: (x: number) => boolean; js: string }
export function events(rng: Rng, N: number): Ev[] {
  const a = rng.int(2, N - 2), k = rng.pick([3, 4, 5].filter((t) => t < N)), d = rng.pick([12, 18, 20, 24, 30, 36].filter((t) => t >= N || t % 6 === 0));
  return [
    { name: 'un nombre pair', not: 'un nombre impair', f: (x) => x % 2 === 0, js: 'x%2===0' },
    { name: 'un nombre impair', not: 'un nombre pair', f: (x) => x % 2 === 1, js: 'x%2===1' },
    { name: `un multiple de ${k}`, not: `un nombre qui n’est pas un multiple de ${k}`, f: (x) => x % k === 0, js: `x%${k}===0` },
    { name: `un nombre strictement supérieur à ${a}`, not: `un nombre inférieur ou égal à ${a}`, f: (x) => x > a, js: `x>${a}` },
    { name: `un nombre inférieur ou égal à ${a}`, not: `un nombre strictement supérieur à ${a}`, f: (x) => x <= a, js: `x<=${a}` },
    { name: `un diviseur de ${d}`, not: `un nombre qui ne divise pas ${d}`, f: (x) => d % x === 0, js: `${d}%x===0` },
    ...(N >= 10 ? [{ name: 'un nombre premier', not: 'un nombre qui n’est pas premier', f: isPrime, js: '((n)=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true;})(x)' }] : []),
    ...(N >= 10 ? [{ name: 'un carré parfait', not: 'un nombre qui n’est pas un carré parfait', f: (x: number) => Number.isInteger(Math.sqrt(x)), js: 'Number.isInteger(Math.sqrt(x))' }] : []),
  ];
}
const JS_COUNT = (N: number, js: string) => `Array.from({length:${N}},(_,i)=>i+1).filter(x=>${js}).length`;
const SUPPORTS: [string, number, string][] = [
  ['On lance un dé équilibré à six faces.', 6, 'Le dé est équilibré : les 6 faces sont équiprobables.'],
  ['On lance un dé équilibré à huit faces, numérotées de 1 à 8.', 8, 'Le dé est équilibré : les 8 faces sont équiprobables.'],
  ['On lance un dé équilibré à douze faces, numérotées de 1 à 12.', 12, 'Le dé est équilibré : les 12 faces sont équiprobables.'],
  ['Un sac contient des jetons numérotés de 1 à 20, indiscernables au toucher. On tire un jeton au hasard.', 20, 'Les 20 jetons ont la même chance d’être tirés.'],
  ['Un sac contient des jetons numérotés de 1 à 15, indiscernables au toucher. On tire un jeton au hasard.', 15, 'Les 15 jetons ont la même chance d’être tirés.'],
  ['On tire au hasard un numéro entre 1 et 30 (une boule par numéro).', 30, 'Les 30 boules ont la même chance d’être tirées.'],
];

// ===================================================================== vocabulaire
export const vocabulaire: Generator = {
  id: 'vocabulaire', title: 'Vocabulaire', stars: 1, levels: [1], course: LINKS.s1, links: [LINKS.s21],
  desc: 'Impossible, certain ou ni l’un ni l’autre ; événement contraire ; événements incompatibles.',
  example: '\\overline{\\text{pair}} = \\text{impair}',
  generate(rng: Rng) {
    const [txt, N] = rng.pick(SUPPORTS.slice(0, 4)), ev = events(rng, N), items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    // a) impossible / certain / ni l'un ni l'autre
    const kinds: [string, number][] = [[`obtenir ${N + rng.int(1, 5)}`, 0], [`obtenir 0`, 0], [`obtenir un nombre entier`, 1], [`obtenir un nombre inférieur ou égal à ${N}`, 1], [`obtenir un nombre strictement supérieur à ${N}`, 0], [`obtenir ${rng.int(1, N)}`, 2], [`obtenir ${rng.pick(ev).name}`, 2]];
    const [e1, k1] = rng.pick(kinds), OPT = ['Impossible', 'Certain', 'Ni l’un ni l’autre'];
    steps.push({ prompt: `a) L’événement « ${e1} » est :`, answer: fixedChoice(OPT, k1, ['Au moins une issue le réalise.', 'Au moins une issue ne le réalise pas.', k1 === 0 ? 'Aucune issue ne le réalise.' : 'Toutes les issues le réalisent.']), hint: `Les issues possibles vont de 1 à ${N}. Combien le réalisent ?` });
    items.push({ what: 'step:0', js: String(k1), expect: k1 });
    sol.push(`a) ${OPT[k1]} : ${k1 === 0 ? 'aucune issue ne le réalise' : k1 === 1 ? 'toutes les issues le réalisent' : 'certaines issues le réalisent, d’autres non'}.`);
    // b) contraire
    const E = rng.pick(ev.filter((x) => !x.name.includes('diviseur')));
    const wrong: [Rich, Rich][] = [];
    if (E.name.includes('supérieur')) { const a = Number(E.name.match(/\d+/)![0]); wrong.push([`obtenir un nombre strictement inférieur à ${a}`, `Il manque ${a} : le contraire de « > ${a} » est « ≤ ${a} ».`]); }
    if (E.name.includes('inférieur ou égal')) { const a = Number(E.name.match(/\d+/)![0]); wrong.push([`obtenir un nombre supérieur ou égal à ${a}`, `${a} réalise les deux : ce n’est pas le contraire.`]); }
    const other = rng.pick(ev.filter((x) => x.name !== E.name && x.not !== E.name && x.name !== E.not));
    wrong.push([`obtenir ${other.name}`, 'Ce n’est pas « tout sauf » l’événement de départ.']);
    if (wrong.length < 2) wrong.push([`obtenir ${N}`, 'Le contraire contient toutes les issues qui ne réalisent pas l’événement.']);
    steps.push({ prompt: `b) Contraire de « obtenir ${E.name} » :`, answer: shuffledChoice(rng, `obtenir ${E.not}`, wrong.slice(0, 2)), hint: 'Le contraire est réalisé exactement quand l’événement ne l’est pas.' });
    items.push({ what: 'step:1', js: String(corr(steps[1])), expect: corr(steps[1]) });
    sol.push(`b) Contraire : « obtenir ${E.not} ».`);
    // c) incompatibles
    const [A, B] = rng.shuffle(ev).slice(0, 2), both = range(1, N).filter((x) => A.f(x) && B.f(x));
    const inc = both.length === 0 ? 0 : 1;
    steps.push({ prompt: `c) « Obtenir ${A.name} » et « obtenir ${B.name} » sont-ils incompatibles ?`, answer: fixedChoice(['Oui', 'Non'], inc, [`${both.slice(0, 4).join(', ')} réalise${both.length > 1 ? 'nt' : ''} les deux.`, 'Aucune issue ne réalise les deux.']), hint: 'Cherche une issue qui réalise les deux événements à la fois.' });
    items.push({ what: 'step:2', js: `(Array.from({length:${N}},(_,i)=>i+1).filter(x=>(${A.js})&&(${B.js})).length===0)?0:1`, expect: inc });
    sol.push(`c) ${inc === 0 ? 'Oui : aucune issue ne réalise les deux.' : `Non : ${both.join(', ')} réalise${both.length > 1 ? 'nt' : ''} les deux.`}`);
    return { title: 'Vocabulaire des probabilités.', statement: txt, steps, solution: sol, answer: sol.join(' '), key: `${N}|${e1}|${E.name}|${A.name}|${B.name}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== équiprobabilité
export const equiprobable: Generator = {
  id: 'equiprobable', title: 'Calculer une probabilité', stars: 1, levels: [1, 2], course: LINKS.s22, links: [LINKS.s3],
  desc: 'Cas favorables sur cas possibles (dés, jetons) ; ★★ : « ou », contraire, mots et lettres.',
  example: 'P(\\text{pair}) = \\dfrac{3}{6} = \\dfrac{1}{2}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 2 && rng.chance(0.35)) {
      const W = rng.pick(['PROBABILITE', 'MATHEMATIQUES', 'STATISTIQUE', 'ALEATOIRE', 'COLLEGE', 'TRIANGLE', 'EQUATION', 'FRACTION', 'GEOMETRIE', 'POURCENTAGE']);
      const L = W.split(''), N = L.length, vow = L.filter((c) => 'AEIOUY'.includes(c)).length;
      const cnt: Record<string, number> = {}; L.forEach((c) => (cnt[c] = (cnt[c] ?? 0) + 1));
      const rep = rng.pick(Object.keys(cnt).filter((c) => cnt[c] >= 2).concat(Object.keys(cnt)).slice(0, 4)), absent = rng.pick('ZWKXJ'.split('').filter((c) => !L.includes(c)));
      const pr = q(cnt[rep], N), pv = q(vow, N);
      steps.push(step(`a) ${m(P(rep))} ?`, [probF('', pr)], `Compte les cartons qui portent ${rep} (il y en a peut-être plusieurs).`, mist(pr, [[q(1, Object.keys(cnt).length), 'Compte les cartons (équiprobables), pas les lettres différentes.'], [cnt[rep] > 1 ? q(1, N) : null, `${rep} apparaît ${cnt[rep]} fois dans le mot.`]])));
      steps.push(step(`b) ${m(P('une voyelle'))} ?`, [probF('', pv)], 'Voyelles : A, E, I, O, U, Y — compte-les toutes, avec les répétitions.', mist(pv, [[q(N - vow, N), 'Ça, ce sont les consonnes.']])));
      steps.push(step(`c) ${m(P(absent))} ?`, [probF('', q(0))], `Y a-t-il un ${absent} dans le mot ?`));
      items.push({ what: 'a', js: `'${W}'.split('').filter(c=>c==='${rep}').length/${N}`, expect: toNum(pr) }, { what: 'b', js: `'${W}'.split('').filter(c=>'AEIOUY'.includes(c)).length/${N}`, expect: toNum(pv) }, { what: 'c', js: `'${W}'.split('').filter(c=>c==='${absent}').length`, expect: 0 });
      sol.push(`${m(String(N))} cartons équiprobables.`, `a) ${rep} apparaît ${cnt[rep]} fois : ${m(`${P(rep)} = ${frs(cnt[rep], N)}`)}.`, `b) ${vow} voyelles : ${m(`${frs(vow, N)}`)}.`, `c) Aucun ${absent} : événement impossible, probabilité ${m('0')}.`);
      return { title: 'Des lettres au hasard.', statement: `On écrit chaque lettre du mot ${W} sur un carton (un carton par lettre), on mélange et on tire un carton au hasard.`, steps, solution: sol, answer: `${fq(pr)} ; ${fq(pv)} ; 0`, key: `w${W}|${rep}|${absent}`, data: { kind: 'js', items } };
    }
    const [txt, N, why] = rng.pick(level === 1 ? SUPPORTS.slice(0, 4) : SUPPORTS.slice(2)), ev = events(rng, N);
    const pick = rng.shuffle(ev).filter((e) => { const c = range(1, N).filter(e.f).length; return c > 0 && c < N; }).slice(0, level === 1 ? 2 : 1);
    pick.forEach((e, i) => {
      const fav = range(1, N).filter(e.f), p = q(fav.length, N);
      steps.push(step(`${'abc'[i]}) Probabilité d’obtenir ${e.name} ?`, [probF('', p)], `Liste les issues favorables, puis divise leur nombre par ${N}.`, mist(p, [[q(N, fav.length), 'Inversé : favorables sur possibles.'], [fav.length < N - fav.length ? q(fav.length, N - fav.length) : null, `On divise par le nombre total d’issues (${N}), pas par le nombre d’issues défavorables.`]])));
      items.push({ what: `p${i}`, js: `${JS_COUNT(N, e.js)}/${N}`, expect: toNum(p) });
      sol.push(`${'abc'[i]}) Issues favorables : ${fav.join(', ')}, soit ${fav.length} : ${m(frs(fav.length, N))}.`);
    });
    if (level === 2) {
      const [A, B] = rng.shuffle(ev.filter((e) => e.name !== pick[0].name)).slice(0, 2);
      const u = range(1, N).filter((x) => A.f(x) || B.f(x)), a = range(1, N).filter(A.f), b = range(1, N).filter(B.f), both = a.filter(B.f), pu = q(u.length, N);
      steps.push(step(`b) Probabilité d’obtenir ${A.name} **ou** ${B.name} ?`, [probF('', pu)], 'Liste les issues qui réalisent l’un ou l’autre (ou les deux), sans en compter deux fois.', mist(pu, [[both.length ? q(a.length + b.length, N) : null, `${both.join(', ')} ${both.length > 1 ? 'sont comptés' : 'est compté'} deux fois : les événements ne sont pas incompatibles.`]])));
      const notE = pick[0], pn = q(N - range(1, N).filter(notE.f).length, N);
      steps.push(step(`c) Probabilité de ne pas obtenir ${notE.name} ?`, [probF('', pn)], 'Contraire : 1 − la probabilité trouvée au a).', mist(pn, [[q(range(1, N).filter(notE.f).length, N), 'C’est la probabilité de l’événement, pas de son contraire.']])));
      items.push({ what: 'u', js: `${JS_COUNT(N, `(${A.js})||(${B.js})`)}/${N}`, expect: toNum(pu) }, { what: 'n', js: `1-${JS_COUNT(N, notE.js)}/${N}`, expect: toNum(pn) });
      sol.push(`b) ${u.length ? `Issues ${u.join(', ')}` : 'Aucune issue'} : ${m(frs(u.length, N))}${both.length ? ` (${both.join(', ')} compté${both.length > 1 ? 's' : ''} une seule fois)` : ''}.`, `c) ${m(`1 - ${fq(q(N - toNum(pn) * N, N))} = ${fq(pn)}`)}.`);
    }
    return { title: 'Calculer une probabilité.', statement: `${txt}\n${why}`, steps, solution: sol, answer: steps.map((s) => (s.answer.kind === 'num' ? fq(s.answer.fields[0].expect) : '')).join(' ; '), key: `${N}|${steps.map((s) => s.prompt).join('|')}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== urnes
const COLORS = ['rouges', 'vertes', 'bleues', 'jaunes', 'noires', 'blanches'];
const sing = (c: string) => c.replace(/s$/, '');
export const urne: Generator = {
  id: 'urne', title: 'Urnes', stars: 1, levels: [1, 2, 3], course: LINKS.s22, links: [LINKS.s3],
  desc: 'Compter des boules, pas des couleurs ; contraire ; ★★ : retrouver un nombre de boules ; ★★★ : composition à partir des probabilités.',
  example: P('rouge') + ' = \\dfrac{3}{10}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const k = rng.int(3, 4), cols = rng.shuffle(COLORS).slice(0, k + 1), cnt = cols.slice(0, k).map(() => rng.int(1, 9));
      if (new Set(cnt).size < 2) return urne.generate(rng, level);
      const N = cnt.reduce((s, v) => s + v, 0), i = rng.int(0, k - 1), j = (i + 1 + rng.int(0, k - 2)) % k, absent = cols[k];
      const pi = q(cnt[i], N), pj = sub(q(1), q(cnt[j], N));
      steps.push(step(`a) ${m(P(sing(cols[i])))} ?`, [probF('', pi)], `Il y a ${N} boules équiprobables, dont ${cnt[i]} ${cols[i]}.`, mist(pi, [[q(1, k), 'Les couleurs ne sont pas équiprobables : compte les boules.'], [q(cnt[i], N - cnt[i]), `Divise par le nombre total de boules (${N}).`]])));
      steps.push(step(`b) ${m(P(`pas ${sing(cols[j])}`))} ?`, [probF('', pj)], 'Contraire : 1 − la probabilité de cette couleur.', mist(pj, [[q(cnt[j], N), 'C’est la probabilité de la couleur elle-même, pas de son contraire.'], [q(k - 1, k), 'Compte les boules, pas les couleurs.']])));
      steps.push(step(`c) ${m(P(sing(absent)))} ?`, [probF('', q(0))], `Y a-t-il des boules ${absent} ?`));
      items.push({ what: 'a', js: `${cnt[i]}/(${cnt.join('+')})`, expect: toNum(pi) }, { what: 'b', js: `(${cnt.filter((_, t) => t !== j).join('+')})/(${cnt.join('+')})`, expect: toNum(pj) }, { what: 'c', js: '0', expect: 0 });
      sol.push(`${m(`${cnt.join(' + ')} = ${N}`)} boules, tirées au hasard : elles sont équiprobables.`, `a) ${m(`${P(sing(cols[i]))} = ${frs(cnt[i], N)}`)}.`, `b) « Pas ${sing(cols[j])} » est le contraire : ${m(`1 - ${fr(cnt[j], N)} = ${frs(N - cnt[j], N)}`)}.`, `c) Aucune boule ${sing(absent)} : événement impossible, probabilité ${m('0')}.`);
      return { title: 'Tirer une boule.', statement: `Une urne contient ${cols.slice(0, k).map((c, t) => `${m(String(cnt[t]))} boule${cnt[t] > 1 ? 's' : ''} ${cnt[t] > 1 ? c : sing(c)}`).join(', ')}, indiscernables au toucher. On tire une boule au hasard.`, steps, solution: sol, answer: `${fq(pi)} ; ${fq(pj)} ; 0`, key: `${cols.join(',')}|${cnt.join(',')}|${i}|${j}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      const T = rng.pick([12, 15, 18, 20, 24, 30, 36, 40]), divs = range(2, T - 1).filter((d) => T % d === 0);
      const den = rng.pick(divs.filter((d) => d <= 6 || d === T / 2)), num = rng.int(1, den - 1), pr = q(num, den);
      if (pr.d !== den) return urne.generate(rng, level);
      const r = (T * num) / den, a = rng.int(1, 6), c = rng.pick(['rouges', 'vertes', 'blanches']), o = c === 'rouges' ? 'noires' : 'bleues', np = q(r + a, T + a);
      steps.push(step(`a) Combien y a-t-il de boules ${c} ?`, [exactF('', q(r))], `${m(fq(pr))} des ${T} boules.`, mist(q(r), [[q(num), `Ce n’est pas le numérateur : il faut ${m(fq(pr))} de ${T}.`]])));
      steps.push(step(`b) On ajoute ${m(String(a))} boule${a > 1 ? 's' : ''} ${a > 1 ? c : sing(c)}. Nouvelle probabilité de tirer une boule ${sing(c)} ?`, [probF('', np)], `Il y a maintenant ${r + a} boules ${c}… et ${T + a} boules en tout.`, mist(np, [[q(r + a, T), `Le nombre total de boules a aussi changé : ${T + a}.`], [add(pr, q(a, T + a)), 'Recompte les boules plutôt que d’additionner des probabilités.']])));
      items.push({ what: 'r', js: `${T}*${num}/${den}`, expect: r }, { what: 'np', js: `(${T}*${num}/${den}+${a})/(${T}+${a})`, expect: toNum(np) });
      sol.push(`a) ${m(`${fq(pr)} \\times ${T} = ${r}`)} boules ${c}.`, `b) ${m(String(r + a))} boules ${c} sur ${m(String(T + a))} : ${m(frs(r + a, T + a))}.`);
      return { title: 'Retrouver la composition.', statement: `Une urne contient ${m(String(T))} boules, ${c} ou ${o}. La probabilité de tirer une boule ${sing(c)} est ${m(fq(pr))}.`, steps, solution: sol, answer: `${r} ; ${fq(np)}`, key: `${T}|${num}/${den}|${a}|${c}`, data: { kind: 'js', items } };
    }
    // ★★★ (H4) : composition à partir des probabilités
    const pairs: [number, number][] = [[4, 3], [3, 4], [4, 6], [6, 4], [5, 4], [4, 5], [3, 5], [5, 3], [6, 3], [3, 6], [5, 10], [10, 5], [6, 8], [8, 6], [4, 8], [8, 4], [2, 5], [5, 2], [2, 6], [6, 2]];
    const [a, b] = rng.pick(pairs), L = (a * b) / gcd(a, b), pb = sub(sub(q(1), q(1, a)), q(1, b)), T = L * rng.int(1, 8) * (pb.d / gcd(pb.d, L) > 1 ? pb.d / gcd(pb.d, L) : 1);
    const nb = toNum(mul(pb, q(T)));
    if (!Number.isInteger(nb) || nb < 2 || T > 240) return urne.generate(rng, level);
    steps.push(step(`a) ${m(P('bleue'))} ?`, [probF('', pb)], 'La somme des probabilités des trois couleurs vaut 1.', mist(pb, [[add(q(1, a), q(1, b)), 'Ça, c’est la probabilité de « rouge ou verte » : prends le contraire.']])));
    steps.push(step('b) Combien y a-t-il de boules en tout ?', [exactF('', q(T))], `Les ${nb} boules bleues représentent ${m(fq(pb))} des boules.`, mist(q(T), [[q(nb), 'Ça, ce sont les bleues seulement.'], [mul(pb, q(nb)), `On divise ${nb} par ${m(fq(pb))}, on ne multiplie pas.`]])));
    steps.push(step('c) Combien de boules rouges et de boules vertes ?', [exactF('Rouges :', q(T / a)), exactF('Vertes :', q(T / b))], `${m(fq(q(1, a)))} et ${m(fq(q(1, b)))} du total.`));
    items.push({ what: 'pb', js: `1-1/${a}-1/${b}`, expect: toNum(pb), tol: 1e-12 }, { what: 'T', js: `${nb}/(1-1/${a}-1/${b})`, expect: T, tol: 1e-9 }, { what: 'r', js: `${T}/${a}`, expect: T / a }, { what: 'v', js: `${T}/${b}`, expect: T / b });
    sol.push(`a) ${m(`${P('bleue')} = 1 - ${fq(q(1, a))} - ${fq(q(1, b))} = ${fq(pb)}`)}.`, `b) ${m(`${nb} \\div ${fq(pb)} = ${T}`)} boules.`, `c) ${m(`\\dfrac{${T}}{${a}} = ${T / a}`)} rouges, ${m(`\\dfrac{${T}}{${b}} = ${T / b}`)} vertes ; contrôle : ${m(`${T / a} + ${T / b} + ${nb} = ${T}`)}.`);
    return { title: 'Retrouver une urne.', statement: `Une urne contient des boules rouges, vertes et bleues. On sait que ${m(`${P('rouge')} = ${fq(q(1, a))}`)}, ${m(`${P('verte')} = ${fq(q(1, b))}`)} et qu’il y a ${m(String(nb))} boules bleues.`, steps, solution: sol, answer: `${fq(pb)} ; ${T} ; ${T / a} et ${T / b}`, key: `h${a}|${b}|${T}`, data: { kind: 'js', items } };
  },
};
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : Math.abs(a); }

// ===================================================================== cartes
const SUITS = ['pique', 'cœur', 'carreau', 'trèfle'], RANKS = ['7', '8', '9', '10', 'valet', 'dame', 'roi', 'as'];
const DECK = SUITS.flatMap((s) => RANKS.map((r) => ({ s, r })));
type Card = { s: string; r: string };
const CEV: { name: string; f: (c: Card) => boolean; js: string }[] = [
  ...SUITS.map((s) => ({ name: `un ${s}`, f: (c: Card) => c.s === s, js: `c.s==='${s}'` })),
  ...['roi', 'dame', 'valet', 'as', '7', '10'].map((r) => ({ name: /^\d/.test(r) ? `un ${r}` : r === 'as' ? 'un as' : r === 'dame' ? 'une dame' : `un ${r}`, f: (c: Card) => c.r === r, js: `c.r==='${r}'` })),
  { name: 'une figure (valet, dame ou roi)', f: (c) => ['valet', 'dame', 'roi'].includes(c.r), js: `['valet','dame','roi'].includes(c.r)` },
  { name: 'une carte rouge', f: (c) => c.s === 'cœur' || c.s === 'carreau', js: `c.s==='cœur'||c.s==='carreau'` },
];
export const cartes: Generator = {
  id: 'cartes', title: 'Jeu de 32 cartes', stars: 1, levels: [1, 2], course: LINKS.s3, links: [LINKS.s22],
  desc: 'Couleur, hauteur, figure ; ★★ : « ou » avec ou sans double comptage, contraire.',
  example: P('cœur ou roi') + ' = \\dfrac{11}{32}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const JSDECK = `['pique','cœur','carreau','trèfle'].flatMap(s=>['7','8','9','10','valet','dame','roi','as'].map(r=>({s,r})))`;
    const cnt = (f: (c: Card) => boolean) => DECK.filter(f).length;
    if (level === 1) {
      const evs = rng.shuffle(CEV).slice(0, 2), one = { s: rng.pick(SUITS), r: rng.pick(RANKS) };
      evs.forEach((e, i) => { const n = cnt(e.f), p = q(n, 32); steps.push(step(`${'ab'[i]}) Probabilité de tirer ${e.name} ?`, [probF('', p)], 'Compte les cartes qui conviennent parmi les 32.', mist(p, [[e.name.includes('figure') ? q(3, 32) : null, 'Il y a 3 figures dans chacune des 4 couleurs.'], [q(1, n === 8 ? 4 : 8), 'Divise par 32 cartes.']]))); items.push({ what: `p${i}`, js: `${JSDECK}.filter(c=>${e.js}).length/32`, expect: toNum(p) }); sol.push(`${'ab'[i]}) ${n} cartes : ${m(frs(n, 32))}.`); });
      const nm = `${/^\d/.test(one.r) ? 'le' : one.r === 'as' ? 'l’' : one.r === 'dame' ? 'la' : 'le'}${one.r === 'as' ? '' : ' '}${one.r} de ${one.s}`;
      steps.push(step(`c) Probabilité de tirer ${nm} ?`, [probF('', q(1, 32))], 'Une seule carte convient.', mist(q(1, 32), [[q(2, 32), 'Une seule carte est à la fois de cette hauteur et de cette couleur.']])));
      items.push({ what: 'p2', js: `${JSDECK}.filter(c=>c.s==='${one.s}'&&c.r==='${one.r}').length/32`, expect: 1 / 32 });
      sol.push(`c) Une seule carte : ${m(fr(1, 32))}.`);
      return { title: 'Tirer une carte.', statement: 'On tire une carte au hasard dans un jeu de 32 cartes (pique, cœur, carreau, trèfle ; dans chaque couleur : 7, 8, 9, 10, valet, dame, roi, as).', steps, solution: sol, answer: steps.map((s) => (s.answer.kind === 'num' ? fq(s.answer.fields[0].expect) : '')).join(' ; '), key: evs.map((e) => e.name).join('|') + nmKey(one), data: { kind: 'js', items } };
    }
    const suits = CEV.slice(0, 4), ranks = CEV.slice(4, 10);
    const [r1, r2] = rng.shuffle(ranks).slice(0, 2), s1 = rng.pick([...suits, CEV[11]]), r3 = rng.pick(ranks.concat([CEV[10]]));
    const n12 = cnt((c) => r1.f(c) || r2.f(c)), p12 = q(n12, 32);
    steps.push(step(`a) Probabilité de tirer ${r1.name} ou ${r2.name} ?`, [probF('', p12)], 'Une carte ne peut pas être les deux à la fois : les probabilités s’additionnent.', mist(p12, [[q(4, 32), 'Additionne les deux probabilités.']])));
    const both = cnt((c) => s1.f(c) && r3.f(c)), nU = cnt((c) => s1.f(c) || r3.f(c)), pU = q(nU, 32), pAdd = q(cnt(s1.f) + cnt(r3.f), 32);
    steps.push(step(`b) Probabilité de tirer ${s1.name} ou ${r3.name} ?`, [probF('', pU)], `Attention : certaines cartes sont les deux à la fois (il y en a ${both}).`, mist(pU, [[pAdd, both > 1 ? `Tu as compté deux fois les ${both} cartes qui sont les deux à la fois.` : 'Tu as compté deux fois la carte qui est les deux à la fois.']])));
    const nn = rng.pick(ranks), pn = q(32 - cnt(nn.f), 32);
    steps.push(step(`c) Probabilité de ne pas tirer ${nn.name} ?`, [probF('', pn)], 'Contraire : 1 − la probabilité de l’événement.', mist(pn, [[q(cnt(nn.f), 32), 'Ça, c’est la probabilité de l’événement lui-même.']])));
    items.push({ what: 'a', js: `${JSDECK}.filter(c=>(${r1.js})||(${r2.js})).length/32`, expect: toNum(p12) }, { what: 'b', js: `${JSDECK}.filter(c=>(${s1.js})||(${r3.js})).length/32`, expect: toNum(pU) }, { what: 'c', js: `1-${JSDECK}.filter(c=>${nn.js}).length/32`, expect: toNum(pn) });
    sol.push(`a) Incompatibles : ${m(`${fr(4, 32)} + ${fr(4, 32)} = ${frs(8, 32)}`)}.`, `b) Pas incompatibles : ${cnt(s1.f)} + ${cnt(r3.f)} − ${both} = ${nU} cartes, ${m(frs(nU, 32))}.`, `c) ${m(`1 - ${fr(4, 32)} = ${frs(28, 32)}`)}.`);
    return { title: 'Tirer une carte.', statement: 'On tire une carte au hasard dans un jeu de 32 cartes (pique, cœur, carreau, trèfle ; dans chaque couleur : 7, 8, 9, 10, valet, dame, roi, as).', steps, solution: sol, answer: `${fq(p12)} ; ${fq(pU)} ; ${fq(pn)}`, key: `${r1.name}|${r2.name}|${s1.name}|${r3.name}|${nn.name}`, data: { kind: 'js', items } };
  },
};
const nmKey = (c: Card) => `|${c.r}${c.s}`;

// ===================================================================== roue
export const roue: Generator = {
  id: 'roue', title: 'Roue de loterie', stars: 1, levels: [1, 2], course: LINKS.s23, links: [LINKS.s3],
  desc: 'Probabilité proportionnelle à l’angle ; ★★ : construire une roue à partir de probabilités.',
  example: P('vert') + ' = \\dfrac{60}{360} = \\dfrac{1}{6}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [], C = ['rouge', 'bleu', 'vert', 'jaune'];
    if (level === 1) {
      const sets = [[180, 90, 60, 30], [120, 120, 90, 30], [180, 120, 60], [90, 90, 120, 60], [150, 90, 120], [144, 72, 108, 36], [200, 100, 60], [240, 72, 48], [135, 90, 90, 45], [160, 80, 120], [210, 90, 60], [100, 140, 120], [270, 45, 45], [150, 150, 60], [126, 108, 90, 36]];
      const ang = rng.shuffle(rng.pick(sets)), cols = C.slice(0, ang.length), figure = pieSvg(cols.map((c, t) => `${c} (${ang[t]}°)`), ang, `Roue : ${cols.map((c, t) => `${c} ${ang[t]}°`).join(', ')}`, cols.map((c) => `gf-c-${c}`));
      const [i, j] = rng.shuffle(range(0, ang.length - 1)).slice(0, 2);
      [i, j].forEach((t, s) => { const p = q(ang[t], 360); steps.push(step(`${'ab'[s]}) ${m(P(cols[t]))} ?`, [probF('', p)], `${m('\\dfrac{\\text{angle}}{360}')}.`, mist(p, [[q(1, ang.length), 'Les secteurs n’ont pas tous le même angle : ils ne sont pas équiprobables.'], [q(ang[t], 100), 'Un tour complet fait 360°, pas 100.']]))); items.push({ what: `p${s}`, js: `${ang[t]}/360`, expect: toNum(p) }); sol.push(`${'ab'[s]}) ${m(`${P(cols[t])} = ${frs(ang[t], 360)}`)}.`); });
      const pn = q(360 - ang[i], 360);
      steps.push(step(`c) Probabilité de ne pas tomber sur ${cols[i]} ?`, [probF('', pn)], 'Contraire.', mist(pn, [[q(ang[i], 360), 'C’est l’événement lui-même.']])));
      items.push({ what: 'c', js: `1-${ang[i]}/360`, expect: toNum(pn) });
      sol.push(`c) ${m(`1 - ${fq(q(ang[i], 360))} = ${fq(pn)}`)}.`);
      return { title: 'Faire tourner la roue.', statement: 'La roue est bien équilibrée ; la flèche s’arrête au hasard.', figure, steps, solution: sol, answer: steps.map((s) => (s.answer.kind === 'num' ? fq(s.answer.fields[0].expect) : '')).join(' ; '), key: `${ang.join(',')}|${i}|${j}`, data: { kind: 'js', items } };
    }
    for (;;) {
      const k = rng.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]), a0 = rng.int(1, Math.max(1, Math.floor((k - 1) / 2))), mlt = rng.pick([2, 3, 4, 5]), red = (360 * a0) / k, rest = 360 - red, vert = rest / (mlt + 1);
      if (!Number.isInteger(red) || !Number.isInteger(vert)) continue;
      const bleu = mlt * vert, pb = q(bleu, 360), pv = q(vert, 360);
      steps.push(step(`a) Angles des secteurs ?`, [exactF('Rouge :', q(red), '°'), exactF('Vert :', q(vert), '°'), exactF('Bleu :', q(bleu), '°')], `Rouge : ${m(fq(q(a0, k)))} de 360°. Il reste ${m(`${rest}^\\circ`)} à partager en une part (vert) et ${mlt} parts (bleu).`, [{ on: 'numAll', values: [q(red), q(bleu), q(vert)], msg: `Inversé : le bleu est ${mlt} fois plus grand que le vert.` }]));
      steps.push(step(`b) Vérifie : ${m(P('bleu'))} ?`, [probF('', pb)], 'Angle ÷ 360.', mist(pb, [[q(mlt, mlt + 1), 'Pense au rouge : bleu et vert ne se partagent que ce qui reste.']])));
      items.push({ what: 'r', js: `360*${a0}/${k}`, expect: red }, { what: 'v', js: `(360-360*${a0}/${k})/(${mlt}+1)`, expect: vert }, { what: 'b', js: `${mlt}*(360-360*${a0}/${k})/(${mlt}+1)`, expect: bleu }, { what: 'pb', js: `${mlt}*(360-360*${a0}/${k})/(${mlt}+1)/360`, expect: toNum(pb) });
      sol.push(`Rouge : ${m(`${fq(q(a0, k))} \\times 360 = ${red}^\\circ`)}.`, `Il reste ${m(`${rest}^\\circ`)} = vert + ${mlt} × vert = ${mlt + 1} × vert, donc vert ${m(`${rest} \\div ${mlt + 1} = ${vert}^\\circ`)} et bleu ${m(`${bleu}^\\circ`)}.`, `Contrôle : ${m(`${P('bleu')} = ${frs(bleu, 360)} = ${mlt} \\times ${fq(pv)}`)}.`);
      const tri = rng.pick([['rouge', 'bleu', 'vert'], ['jaune', 'violet', 'orange'], ['rose', 'noir', 'blanc'], ['orange', 'vert', 'gris'], ['blanc', 'rouge', 'bleu']]);
      const ex = { title: 'Fabriquer une roue.', statement: `On veut fabriquer une roue de loterie à trois couleurs telle que ${m(`${P('rouge')} = ${fq(q(a0, k))}`)} et que le bleu soit ${['', '', 'deux', 'trois', 'quatre', 'cinq'][mlt]} fois plus probable que le vert.`, steps, solution: sol, answer: `${red}° ; ${vert}° ; ${bleu}°`, key: `w${a0}/${k}|${mlt}|${tri[0]}`, data: { kind: 'js', items } };
      const map: Record<string, string> = { rouge: tri[0], bleu: tri[1], vert: tri[2] };
      const sw = (t: string) => t.replace(/\b(rouge|bleu|vert)\b/gi, (w) => { const r = map[w.toLowerCase()]; return w[0] === w[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r; }).replace(/\b(le|que le) orange/g, (_x, a) => (a === 'le' ? 'l’orange' : 'que l’orange'));
      return JSON.parse(JSON.stringify(ex, (key, val) => (typeof val === 'string' && key !== 'js' ? sw(val) : val)));
    }
  },
};
void div; void eq;
