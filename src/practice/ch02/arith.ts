/**
 * Arithmétique (★ → ★★★) : division euclidienne, critères de divisibilité et diviseurs, nombres premiers,
 * décomposition en facteurs premiers, problèmes de partage (plus grand diviseur commun, plus petit multiple commun),
 * trouver l'erreur.
 */
import { q, toNum } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, numStep, fixedChoice, shuffledChoice, NAMES } from '../engine/build';
import { LINKS, bg, F, factors, factTex, isPrime, gcd, divisors } from './common';

const L = ['a', 'b', 'c', 'd', 'e'];
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const ON = ['Oui', 'Non'];

// ===================================================================== division euclidienne
export const euclide: Generator = {
  id: 'euclide',
  title: 'Division euclidienne',
  desc: 'Quotient et reste, a = b × q + r ; problèmes où la réponse est q + 1 (★★).',
  stars: 1,
  levels: [1, 2],
  example: '47 = 6 \\times 7 + 5',
  course: LINKS.s51,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const its: [number, number][] = [];
      while (its.length < 2) {
        const b = its.length === 0 ? rng.int(3, 9) : rng.int(11, 25);
        const qq = its.length === 0 ? rng.int(4, 12) : rng.int(5, 80);
        const r = rng.int(1, b - 1);
        its.push([b * qq + r, b]);
      }
      return {
        title: 'Effectue les divisions euclidiennes.',
        steps: its.map(([a, b], i) => {
          const qq = Math.floor(a / b), r = a % b;
          return step(`${L[i]}) Division de ${m(bg(a))} par ${m(String(b))} : ${m(`${bg(a)} = ${b} \\times q + r`)}.`, [F(m('q ='), q(qq)), F(m('r ='), q(r))], `Cherche le plus grand multiple de ${b} qui ne dépasse pas ${a}. Le reste doit être plus petit que ${b}.`,
            [{ on: 'numAll', values: [q(qq - 1), q(r + b)], msg: `Le reste ${m(String(r + b))} est plus grand que ${m(String(b))} : on peut encore faire un paquet de ${b}.` }, ...(r === qq ? [] : [{ on: 'numAll' as const, values: [q(r), q(qq)], msg: 'Quotient et reste inversés.' }])]);
        }),
        solution: its.map(([a, b], i) => `${L[i]}) ${m(`${b} \\times ${Math.floor(a / b)} = ${bg(b * Math.floor(a / b))}`)} et ${m(`${b} \\times ${Math.floor(a / b) + 1} = ${bg(b * (Math.floor(a / b) + 1))} > ${bg(a)}`)}, donc ${m(`${bg(a)} = ${b} \\times ${Math.floor(a / b)} + ${a % b}`)} avec ${m(`${a % b} < ${b}`)}.`),
        answer: its.map(([a, b]) => m(`${bg(a)} = ${b} \\times ${Math.floor(a / b)} + ${a % b}`)).join(' ; '),
        key: its.map((x) => x.join('/')).join('|'),
        data: { kind: 'js', items: its.flatMap(([a, b], i) => [{ what: `q${i}`, js: `Math.floor(${a}/${b})`, expect: Math.floor(a / b) }, { what: `r${i}`, js: `${a}%${b}`, expect: a % b }]) },
      };
    }
    const ctx = rng.pick(['cars', 'boites', 'tables']);
    const [cap, what, cont, unit] = ctx === 'cars' ? [rng.pick([48, 52, 55, 60, 63]), 'élèves', 'cars', 'places'] : ctx === 'boites' ? [rng.pick([6, 12, 15, 24, 30]), 'œufs', 'boîtes', 'emplacements'] : [rng.pick([6, 8, 10, 12]), 'invités', 'tables', 'places'];
    const qq = ctx === 'cars' ? rng.int(3, 8) : rng.int(5, 30), r = rng.int(1, cap - 1);
    const N = cap * qq + r;
    const fem = ctx !== 'cars';
    return {
      title: 'Division euclidienne en situation.',
      statement: `On doit répartir ${m(bg(N))} ${what} dans des ${cont} de ${m(String(cap))} ${unit}.`,
      steps: [
        step(`a) Effectue la division euclidienne de ${m(bg(N))} par ${m(String(cap))}.`, [F(m('q ='), q(qq)), F(m('r ='), q(r))], `Le reste doit être plus petit que ${cap}.`, [{ on: 'numAll', values: [q(qq - 1), q(r + cap)], msg: `Le reste doit être plus petit que ${m(String(cap))}.` }]),
        numStep(`b) Combien faut-il de ${cont} pour que tou${fem && ctx === 'boites' ? 's les ' : 's les '}${what} soient ${ctx === 'boites' ? 'rangés' : 'placés'} ?`, '', q(qq + 1), `${qq} ${cont} pleines ne suffisent pas : il reste ${r} ${what}.`, [[q(qq), `Avec ${qq} ${cont}, il reste ${r} ${what} sans place : il en faut une de plus.`]]),
        numStep(`c) Combien de ${unit} restent libres dans ${ctx === 'cars' ? 'le dernier car' : ctx === 'boites' ? 'la dernière boîte' : 'la dernière table'} ?`, '', q(cap - r), `Le dernier contenant accueille les ${r} ${what} restants.`, [[q(r), `${r}, ce sont les ${what} du dernier contenant ; on demande les ${unit} **libres**.`]]),
      ],
      solution: [`a) ${m(`${bg(N)} = ${cap} \\times ${qq} + ${r}`)} avec ${m(`${r} < ${cap}`)}.`, `b) ${qq} ${cont} ${fem ? 'pleines' : 'pleins'} et ${r} ${what} en plus : il faut ${m(String(qq + 1))} ${cont}.`, `c) ${m(`${cap} - ${r} = ${cap - r}`)} ${cap - r > 1 ? unit : unit.slice(0, -1)} ${cap - r > 1 ? 'libres' : 'libre'}. Contrôle : ${m(`${qq + 1} \\times ${cap} - ${bg(N)} = ${cap - r}`)} ✓.`],
      answer: `${m(`q = ${qq}, r = ${r}`)} ; ${m(String(qq + 1))} ; ${m(String(cap - r))}`,
      key: `${ctx}:${N}:${cap}`,
      data: { kind: 'js', items: [{ what: 'q', js: `Math.floor(${N}/${cap})`, expect: qq }, { what: 'r', js: `${N}%${cap}`, expect: r }, { what: 'n', js: `Math.ceil(${N}/${cap})`, expect: qq + 1 }, { what: 'free', js: `Math.ceil(${N}/${cap})*${cap}-${N}`, expect: cap - r }] },
    };
  },
};

// ===================================================================== divisibilité, diviseurs
export const divisibilite: Generator = {
  id: 'divisibilite',
  title: 'Critères de divisibilité, diviseurs',
  desc: 'Divisible par 2, 3, 5, 9, 10 ? Liste des diviseurs ; diviseurs communs (★★).',
  stars: 1,
  levels: [1, 2],
  example: '7\\,290 : 7 + 2 + 9 + 0 = 18',
  course: LINKS.s52,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      let n: number;
      do { n = rng.int(102, 9999); } while (n % 3 !== 0 && rng.chance(0.6));
      const ds = rng.shuffle([2, 3, 5, 9, 10]).slice(0, 4).sort((a, b) => a - b);
      const sum = String(n).split('').map(Number).reduce((a, b) => a + b, 0);
      const last = n % 10;
      return {
        title: `Le nombre $${bg(n)}$ est-il divisible par… ?`,
        steps: ds.map((d, i) => {
          const yes = n % d === 0;
          const why = d === 3 || d === 9 ? `Somme des chiffres : ${m(String(sum))}, ${sum % d === 0 ? '' : 'pas '}divisible par ${d}.` : `Chiffre des unités : ${m(String(last))}.`;
          const wrongCrit = d === 3 || d === 9 ? 'Pour 3 et 9, on regarde la **somme des chiffres**, pas le dernier chiffre.' : `Pour ${d}, on regarde le **chiffre des unités**, pas la somme des chiffres.`;
          return { prompt: `${L[i]}) par ${m(String(d))} ?`, answer: fixedChoice(ON, yes ? 0 : 1, [yes ? null : `${why} ${wrongCrit}`, yes ? `${why} ${wrongCrit}` : null]), hint: d === 3 || d === 9 ? `Additionne les chiffres de ${bg(n).replace(/\\,/g, ' ')}.` : 'Regarde le chiffre des unités.' };
        }),
        solution: [`Chiffre des unités : ${m(String(last))} ; somme des chiffres : ${m(`${String(n).split('').join(' + ')} = ${sum}`)}.`, ...ds.map((d, i) => `${L[i]}) ${n % d === 0 ? 'Oui' : 'Non'} : ${d === 3 || d === 9 ? `${m(String(sum))} ${sum % d ? 'n’est pas' : 'est'} divisible par ${d}` : `il ${n % d ? 'ne se termine pas' : 'se termine'} par ${d === 2 ? '0, 2, 4, 6 ou 8' : d === 5 ? '0 ou 5' : '0'}`}.`)],
        answer: ds.map((d) => `${d} : ${n % d === 0 ? 'oui' : 'non'}`).join(' ; '),
        key: `${n}:${ds.join(',')}`,
        data: { kind: 'js', items: ds.map((d, i) => ({ what: L[i], js: `${n}%${d}===0?0:1`, expect: n % d === 0 ? 0 : 1 })) },
      };
    }
    // ★★ : diviseurs de deux nombres, diviseurs communs
    // nombres d'au plus 3 chiffres, de 6 à 12 diviseurs : les paires se trouvent de tête
    let a: number, b: number;
    do { a = rng.int(12, 150); b = rng.int(12, 180); } while (a === b || gcd(a, b) < 4 || divisors(a).length < 6 || divisors(a).length > 12 || divisors(b).length > 16);
    const da = divisors(a), com = divisors(gcd(a, b));
    return {
      title: 'Diviseurs.',
      steps: [
        step(`a) Donne la liste des diviseurs de ${m(String(a))}, dans l’ordre croissant.`, da.map((d, i) => F(i === 0 ? '' : '', q(d))), `Cherche les paires : ${m(`1 \\times ${a}`)}, ${m(`2 \\times \\ldots`)} Arrête-toi quand les paires se répètent.`, [{ on: 'numAll', values: [...da].reverse().map((d) => q(d)), msg: 'Dans l’ordre **croissant**.' }]),
        step(`b) Quels sont les diviseurs communs à ${m(String(a))} et ${m(String(b))} ?`, com.map((d) => F('', q(d))), `Garde, parmi les diviseurs de ${a}, ceux qui divisent aussi ${b}.`),
        numStep(`c) Quel est le plus grand diviseur commun à ${m(String(a))} et ${m(String(b))} ?`, '', q(gcd(a, b)), 'Le plus grand de la liste précédente.', [[q(a * b), 'C’est un multiple commun, pas un diviseur.']]),
      ],
      solution: [`a) Paires : ${da.filter((d) => d * d <= a).map((d) => m(`${d} \\times ${a / d}`)).join(', ')}. Diviseurs de ${m(String(a))} : ${m(da.join(' ; '))}.`, `b) Diviseurs de ${m(String(b))} : ${m(divisors(b).join(' ; '))}. Communs : ${m(com.join(' ; '))}.`, `c) Le plus grand est ${m(String(gcd(a, b)))}.`],
      answer: `${m(da.join(' ; '))} ; ${m(com.join(' ; '))} ; ${m(String(gcd(a, b)))}`,
      key: `${a}:${b}`,
      data: { kind: 'js', items: [...da.map((d, i) => ({ what: `d${i}`, js: `[...Array(${a})].map((_,i)=>i+1).filter(d=>${a}%d===0)[${i}]`, expect: d })), ...com.map((d, i) => ({ what: `c${i}`, js: `[...Array(${a})].map((_,i)=>i+1).filter(d=>${a}%d===0&&${b}%d===0)[${i}]`, expect: d }))] },
    };
  },
};

// ===================================================================== nombres premiers
export const premiers: Generator = {
  id: 'premiers',
  title: 'Nombres premiers',
  desc: 'Premier ou non ? Trouver un diviseur ; s’arrêter quand le carré dépasse le nombre.',
  stars: 2,
  levels: [2],
  example: '91 = 7 \\times 13 \\quad 97 \\text{ est premier}',
  course: LINKS.s6,
  generate(rng: Rng) {
    const comp = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 111, 117, 119, 121, 133, 143, 161, 169, 187, 203, 209, 217, 221];
    const prim = [29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211];
    const ns = rng.shuffle([rng.pick(comp), rng.pick(comp), rng.pick(prim), rng.pick(prim)]).slice(0, 3);
    if (new Set(ns).size < 3 || ns.every(isPrime) || !ns.some(isPrime)) return premiers.generate(rng, 2);
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number }[] = [];
    ns.forEach((n, i) => {
      const pr = isPrime(n);
      const lim = [2, 3, 5, 7, 11, 13, 17].filter((p) => p * p <= n);
      const sp = factors(n)[0];
      steps.push({ prompt: `${L[i]}) ${m(String(n))} est-il premier ?`, answer: fixedChoice(ON, pr ? 0 : 1, [pr ? null : `${m(`${n} = ${sp} \\times ${n / sp}`)} : il a d’autres diviseurs que 1 et lui-même.${n % 2 ? ' Être impair ne suffit pas.' : ''}`, pr ? `Essaie ${lim.join(', ')} : aucune division ne tombe juste, et ${m(`${lim.length ? [2, 3, 5, 7, 11, 13, 17, 19][lim.length] : 2}^2 > ${n}`)}.` : null]), hint: `Essaie de diviser par ${lim.join(', ')} ; on peut s’arrêter quand le carré du diviseur dépasse ${n}.` });
      if (!pr) steps.push(step(`Écris ${m(String(n))} comme produit de deux entiers plus grands que 1 (le plus petit d’abord).`, [F('', q(sp)), F(m('\\times'), q(n / sp))], `Le plus petit diviseur premier de ${n} est parmi ${lim.join(', ')}.`, [{ on: 'numAll', values: [q(1), q(n)], msg: 'Des entiers **plus grands que 1**.' }]));
      const nextP = [2, 3, 5, 7, 11, 13, 17, 19][lim.length];
      sol.push(pr ? `${L[i]}) ${m(String(n))} n’est divisible ni par ${lim.join(', ni par ')} ; ${m(`${nextP}^2 = ${nextP * nextP} > ${n}`)} : ${m(String(n))} est premier.` : `${L[i]}) ${m(`${n} = ${sp} \\times ${n / sp}`)} : ${m(String(n))} n’est pas premier.`);
      items.push({ what: `p${i}`, js: `((n)=>{for(let d=2;d*d<=n;d++)if(n%d===0)return 1;return 0})(${n})`, expect: pr ? 0 : 1 });
      if (!pr) items.push({ what: `s${i}`, js: `((n)=>{for(let d=2;d*d<=n;d++)if(n%d===0)return d;return n})(${n})`, expect: sp }, { what: `c${i}`, js: `${n}/((n)=>{for(let d=2;d*d<=n;d++)if(n%d===0)return d;return n})(${n})`, expect: n / sp });
    });
    return { title: 'Nombres premiers.', steps, solution: sol, answer: ns.map((n) => `${n} : ${isPrime(n) ? 'premier' : m(`${factors(n)[0]} \\times ${n / factors(n)[0]}`)}`).join(' ; '), key: ns.join(','), data: { kind: 'js', items } };
  },
};

// ===================================================================== décomposition
const PR = [2, 3, 5, 7, 11, 13];
export const decomposer: Generator = {
  id: 'decomposer',
  title: 'Décomposer en facteurs premiers',
  desc: 'Exposants de 2, 3, 5, 7… ; simplifier une fraction ; nombre de diviseurs (★★★).',
  stars: 2,
  levels: [2, 3],
  example: '360 = 2^3 \\times 3^2 \\times 5',
  course: LINKS.s7,
  generate(rng: Rng, level: Level) {
    const make = (maxN: number) => {
      for (;;) {
        const e = [rng.int(0, 4), rng.int(0, 3), rng.int(0, 2), rng.int(0, 1), rng.chance(0.15) ? 1 : 0, 0];
        const n = PR.reduce((acc, p, i) => acc * p ** e[i], 1);
        if (n >= 30 && n <= maxN && factors(n).length >= 3 && new Set(factors(n)).size >= 2) return n;
      }
    };
    const n = make(level === 2 ? 1200 : 5000);
    const used = PR.filter((p) => n % p === 0);
    const exps = used.map((p) => factors(n).filter((x) => x === p).length);
    const fields = used.map((p, i) => F(`Exposant de ${m(String(p))} :`, q(exps[i])));
    const s1 = step(`a) Décompose ${m(bg(n))} en produit de facteurs premiers : ${m(`${bg(n)} = ${used.map((p) => `${p}^{\\ldots}`).join(' \\times ')}`)}. Donne les exposants.`, fields, 'Divise par 2 tant que c’est possible, puis par 3, puis par 5, 7…', [{ on: 'numAll', values: exps.map((e) => q(e + 1)), msg: 'Un facteur de trop pour chaque nombre premier : recompte les divisions.' }]);
    const sol: Rich[] = [];
    let cur = n; const chain: string[] = [];
    for (const p of factors(n)) { chain.push(`${bg(cur)} \\div ${p} = ${bg(cur / p)}`); cur /= p; }
    sol.push(`a) ${m(chain.join(' ; \\; '))}. Donc ${m(`${bg(n)} = ${factors(n).join(' \\times ')}${exps.some((e) => e > 1) ? ` = ${factTex(n)}` : ''}`)}.`);
    if (level === 2) {
      // b) simplifier une fraction avec la décomposition
      let d: number;
      do { d = make(1200); } while (d === n || gcd(n, d) === 1 || gcd(n, d) === Math.min(n, d));
      const g = gcd(n, d);
      const s2 = step(`b) Sachant que ${m(`${bg(d)} = ${factTex(d)}`)}, rends la fraction ${m(`\\dfrac{${n}}{${d}}`)} irréductible.`, [{ label: '', expect: q(n, d), form: 'irreducible', shown: `\\dfrac{${n / g}}{${d / g}}` }], 'Barre les facteurs premiers communs au numérateur et au dénominateur.', mist(q(n, d), []));
      sol.push(`b) Facteurs communs : ${m(factors(g).length > 1 ? `${factors(g).join(' \\times ')} = ${g}` : String(g))}. ${m(`\\dfrac{${n}}{${d}} = \\dfrac{${n / g} \\times ${g}}{${d / g} \\times ${g}} = \\dfrac{${n / g}}{${d / g}}`)}.`);
      return { title: 'Décomposition en facteurs premiers.', steps: [s1, s2], solution: sol, answer: `${m(factTex(n))} ; ${m(`\\dfrac{${n / g}}{${d / g}}`)}`, key: `${n}/${d}`, data: { kind: 'js', items: [...used.map((p, i) => ({ what: `e${p}`, js: `((n,p)=>{let k=0;while(n%p===0){n/=p;k++}return k})(${n},${p})`, expect: exps[i] })), { what: 'f', js: `${n}/${d}`, expect: n / d, tol: 1e-12 }] } };
    }
    // ★★★ : nombre de diviseurs
    const nd = exps.reduce((a, e) => a * (e + 1), 1);
    const s2 = numStep(`b) Combien ${m(bg(n))} a-t-il de diviseurs ?`, '', q(nd), `Un diviseur s’écrit ${m(used.map((p, i) => `${p}^{${'abcd'[i]}}`).join(' \\times '))} : combien de choix pour chaque exposant ?`, [[q(exps.reduce((a, e) => a * e, 1)), 'L’exposant peut aussi valoir 0 : il y a (exposant + 1) choix.'], [q(exps.reduce((a, e) => a + e + 1, 0)), 'On **multiplie** les nombres de choix (et on ne les additionne pas).']]);
    sol.push(`b) Exposant de ${used.map((p, i) => `${m(String(p))} : de 0 à ${exps[i]} (${exps[i] + 1} choix)`).join(' ; ')}. Nombre de diviseurs : ${m(`${exps.map((e) => e + 1).join(' \\times ')} = ${nd}`)}.`);
    return { title: 'Décomposition et nombre de diviseurs.', steps: [s1, s2], solution: sol, answer: `${m(factTex(n))} ; ${m(String(nd))} diviseurs`, key: `${n}`, data: { kind: 'js', items: [...used.map((p, i) => ({ what: `e${p}`, js: `((n,p)=>{let k=0;while(n%p===0){n/=p;k++}return k})(${n},${p})`, expect: exps[i] })), { what: 'nd', js: `[...Array(${n})].filter((_,i)=>${n}%(i+1)===0).length`, expect: nd }] } };
  },
};

// ===================================================================== problèmes de partage
export const partage: Generator = {
  id: 'partage',
  title: 'Problèmes de partage',
  desc: 'Bouquets identiques, dalles carrées (plus grand diviseur commun) ; phares (plus petit multiple commun).',
  stars: 2,
  levels: [2],
  example: '84 = 2^2 \\times 3 \\times 7, \\; 60 = 2^2 \\times 3 \\times 5 \\to 12',
  course: LINKS.s7,
  links: [LINKS.serieJ],
  generate(rng: Rng) {
    const kind = rng.pick(['bouquets', 'bouquets', 'dalles', 'rubans', 'phares', 'phares']);
    if (kind === 'bouquets') {
      let g: number, u: number, v: number;
      do { g = rng.int(4, 24); u = rng.int(3, 11); v = rng.int(2, 11); } while (gcd(u, v) !== 1 || u === v || g * Math.max(u, v) > 300);
      const [A, B] = [g * u, g * v];
      const [x1, x2] = rng.pick([['roses', 'tulipes'], ['billes rouges', 'billes bleues'], ['croissants', 'pains au chocolat'], ['crayons', 'gommes'], ['cartes postales', 'timbres'], ['bonbons à la fraise', 'bonbons au citron'], ['pommes', 'poires'], ['cahiers', 'stylos'], ['œufs en chocolat', 'lapins en chocolat']]);
      const who = rng.pick(NAMES);
      return {
        title: 'Le plus grand nombre de lots identiques.',
        statement: `${who} a ${m(String(A))} ${x1} et ${m(String(B))} ${x2}. ${who} veut faire le plus grand nombre possible de lots identiques en utilisant tout.`,
        steps: [
          step(`a) Décompose : ${m(`${A} = ${factTex(A)}`)} et ${m(`${B} = ${factTex(B)}`)}. Quel est le plus grand diviseur commun ?`, [F('', q(g))], 'Prends les facteurs premiers communs aux deux décompositions.', mist(q(g), [[q(A * B / g), 'C’est le plus petit multiple commun ; on cherche un **diviseur** commun.'], [q(A * B), 'C’est un multiple commun ; on cherche un **diviseur** commun.']])),
          step('b) Combien de lots ? Que contient chacun ?', [F('Lots :', q(g)), F(`${x1[0].toUpperCase() + x1.slice(1)} par lot :`, q(u)), F(`${x2[0].toUpperCase() + x2.slice(1)} par lot :`, q(v))], `Divise ${A} et ${B} par le nombre de lots.`),
        ],
        solution: [`a) Facteurs communs : ${m(`${factTex(g)} = ${g}`)}.`, `b) ${m(String(g))} lots, chacun avec ${m(`${A} \\div ${g} = ${u}`)} ${x1} et ${m(`${B} \\div ${g} = ${v}`)} ${x2}. Contrôle : ${m(String(u))} et ${m(String(v))} n’ont plus de diviseur commun ✓.`],
        answer: `${m(String(g))} lots de ${u} ${x1} et ${v} ${x2}`,
        key: `b:${A}:${B}:${x1}`,
        data: { kind: 'js', items: [{ what: 'g', js: `((a,b)=>{while(b){[a,b]=[b,a%b]}return a})(${A},${B})`, expect: g }, { what: 'u', js: `${A}/${g}`, expect: u }, { what: 'v', js: `${B}/${g}`, expect: v }] },
      };
    }
    if (kind === 'dalles') {
      let g: number, u: number, v: number;
      do { g = rng.pick([10, 12, 15, 20, 25, 30, 40, 45, 50, 60]); u = rng.int(5, 16); v = rng.int(4, 12); } while (gcd(u, v) !== 1 || u <= v || g * u > 900);
      const [Lc, lc] = [g * u, g * v];
      return {
        title: 'Carreler sans découpe.',
        statement: `On veut carreler une pièce rectangulaire de ${m(`${bg(q(Lc, 100))}`)} m sur ${m(`${bg(q(lc, 100))}`)} m avec des dalles carrées identiques, sans découpe, les plus grandes possibles (côté en centimètres entiers).`,
        steps: [
          step('a) Quel est le côté d’une dalle ?', [F('Côté :', q(g), 'cm')], `Convertis en centimètres (${Lc} et ${lc}), puis cherche leur plus grand diviseur commun.`, mist(q(g), [[q(Lc * lc / g), 'C’est un multiple commun ; le côté doit **diviser** les deux dimensions.']])),
          step('b) Combien faut-il de dalles ?', [F('', q(u * v))], 'Nombre de dalles dans la longueur × nombre dans la largeur.', mist(q(u * v), [[q(u + v), 'On multiplie le nombre de dalles d’une rangée par le nombre de rangées.'], [q(2 * (u + v)), 'Ce n’est pas le tour de la pièce : on couvre toute la surface.']])),
        ],
        solution: [`a) ${m(`${Lc} = ${factTex(Lc)}`)} et ${m(`${lc} = ${factTex(lc)}`)} ; plus grand diviseur commun : ${m(String(g))}. Dalles de ${m(String(g))} cm.`, `b) ${m(`${Lc} \\div ${g} = ${u}`)} dalles dans la longueur, ${m(`${lc} \\div ${g} = ${v}`)} dans la largeur : ${m(`${u} \\times ${v} = ${u * v}`)} dalles.`],
        answer: `${m(String(g))} cm ; ${m(String(u * v))} dalles`,
        key: `d:${Lc}:${lc}`,
        data: { kind: 'js', items: [{ what: 'g', js: `((a,b)=>{while(b){[a,b]=[b,a%b]}return a})(${Lc},${lc})`, expect: g }, { what: 'n', js: `${Lc}*${lc}/${g}**2`, expect: u * v }] },
      };
    }
    if (kind === 'rubans') {
      let g: number, u: number, v: number;
      do { g = rng.int(6, 40); u = rng.int(2, 9); v = rng.int(2, 9); } while (gcd(u, v) !== 1 || u === v || g * Math.max(u, v) > 360);
      const [A, B] = [g * u, g * v];
      const [obj, c1, c2] = rng.pick([['ruban', 'rouge', 'doré'], ['corde', 'bleue', 'verte'], ['tasseau', 'en pin', 'en chêne']] as const);
      const art = obj === 'corde' ? ['une', 'l’autre'] : ['un', 'l’autre'];
      return {
        title: 'Découper en morceaux égaux.',
        statement: `On dispose d’${obj === 'corde' ? 'une corde' : `un ${obj}`} ${c1} de ${m(String(A))} cm et d’${art[0]} ${obj} ${c2} de ${m(String(B))} cm. On veut les couper en morceaux tous de même longueur (en cm entiers), les plus longs possible, sans perte.`,
        steps: [
          step('a) Quelle est la longueur d’un morceau ?', [F('Longueur :', q(g), 'cm')], `La longueur doit diviser ${A} et ${B} : cherche leur plus grand diviseur commun.`, mist(q(g), [[q(A * B / g), 'C’est un multiple commun ; la longueur doit **diviser** les deux.']])),
          step('b) Combien de morceaux obtient-on en tout ?', [F('', q(u + v))], 'Morceaux du premier + morceaux du second.', mist(q(u + v), [[q(u * v), 'On ajoute les morceaux des deux, on ne les multiplie pas.']])),
        ],
        solution: [`a) ${m(`${A} = ${factTex(A)}`)} et ${m(`${B} = ${factTex(B)}`)} ; plus grand diviseur commun : ${m(String(g))}. Morceaux de ${m(String(g))} cm.`, `b) ${m(`${A} \\div ${g} = ${u}`)} et ${m(`${B} \\div ${g} = ${v}`)} : ${m(`${u} + ${v} = ${u + v}`)} morceaux.`],
        answer: `${m(String(g))} cm ; ${m(String(u + v))} morceaux`,
        key: `r:${A}:${B}:${obj}`,
        data: { kind: 'js', items: [{ what: 'g', js: `((a,b)=>{while(b){[a,b]=[b,a%b]}return a})(${A},${B})`, expect: g }, { what: 'n', js: `${A}/${g}+${B}/${g}`, expect: u + v }] },
      };
    }
    const ctxP = rng.pick([
      { t: 'Les phares.', st: (a: number, b: number) => `Deux phares s’allument ensemble à minuit. Le premier s’allume toutes les ${m(String(a))} secondes, le second toutes les ${m(String(b))} secondes.`, u: 's', q: 'Au bout de combien de secondes s’allumeront-ils de nouveau ensemble ?', k: 'p', end: 'Ils se rallument ensemble au bout de' },
      { t: 'Deux lignes de bus.', st: (a: number, b: number) => `Deux bus partent ensemble du terminus à 7 h. La ligne 1 repart toutes les ${m(String(a))} minutes, la ligne 2 toutes les ${m(String(b))} minutes.`, u: 'min', q: 'Au bout de combien de minutes repartiront-ils de nouveau ensemble ?', k: 'b', end: 'Ils repartent ensemble au bout de' },
      { t: 'Deux engrenages.', st: (a: number, b: number) => `Deux roues dentées s’engrènent : l’une a ${m(String(a))} dents, l’autre ${m(String(b))}. On marque la dent en contact au départ.`, u: 'dents', q: 'Combien de dents doivent passer avant que les deux repères se retrouvent face à face ?', k: 'e', end: 'Les repères se retrouvent après' },
    ]);
    let a: number, b: number;
    do { a = rng.int(4, 30); b = rng.int(6, 45); } while (a >= b || b % a === 0 || gcd(a, b) === 1 || a * b / gcd(a, b) > 300);
    const l = a * b / gcd(a, b);
    return {
      title: ctxP.t,
      statement: ctxP.st(a, b),
      steps: [step(ctxP.q, [F('', q(l), ctxP.u)], `Cherche le plus petit nombre qui est à la fois multiple de ${a} et de ${b}.`, mist(q(l), [[q(a * b), `C’est un multiple commun, mais pas le plus petit : décompose ${a} et ${b}.`], [q(gcd(a, b)), 'C’est un diviseur commun ; on cherche un **multiple** commun.']]))],
      solution: [`${m(`${a} = ${factTex(a)}`)} et ${m(`${b} = ${factTex(b)}`)}. Le plus petit multiple commun contient chaque facteur avec son plus grand exposant : ${m(String(l))}.`, `Contrôle : ${m(`${l} = ${a} \\times ${l / a} = ${b} \\times ${l / b}`)} ✓. ${ctxP.end} ${m(String(l))} ${ctxP.u}.`],
      answer: `${m(String(l))} ${ctxP.u}`,
      key: `${ctxP.k}:${a}:${b}`,
      data: { kind: 'js', items: [{ what: 'l', js: `((a,b)=>{let m=b;while(m%a)m+=b;return m})(${a},${b})`, expect: l }] },
    };
  },
};

// ===================================================================== trouver l'erreur
const R = {
  prod: 'Dans un produit, il faut autant de chiffres après la virgule que les deux facteurs réunis.',
  comp: 'On compare les décimaux rang par rang, pas les parties décimales comme des entiers.',
  zero: 'Multiplier par 10 ne revient pas à ajouter un zéro à droite d’un décimal : les chiffres changent de rang.',
  impair: 'Un nombre impair n’est pas forcément premier.',
  un: '1 n’est pas premier : un nombre premier a exactement deux diviseurs.',
  cascade: 'On n’arrondit pas en cascade : on regarde seulement le chiffre qui suit le rang demandé.',
} as const;
export const erreur: Generator = {
  id: 'erreur',
  title: 'Trouver l’erreur',
  desc: '0,2 × 0,3 = 0,6 ; 0,19 > 0,2 ; 2,5 × 10 = 2,50 ; 51 est premier ; 1 est premier ; arrondi en cascade.',
  stars: 2,
  levels: [2],
  example: '0{,}2 \\times 0{,}3 = 0{,}06',
  course: LINKS.serieH,
  generate(rng: Rng) {
    const kind = rng.pick(Object.keys(R) as (keyof typeof R)[]);
    const who = rng.pick(NAMES);
    let quote = '', ask: Step | null = null, sol: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [];
    switch (kind) {
      case 'prod': {
        const a = rng.int(2, 9), b = rng.int(2, 9);
        quote = `${m(`0{,}${a} \\times 0{,}${b} = ${bg(q(a * b, 10))}`)}, car ${m(`${a} \\times ${b} = ${a * b}`)}.`;
        const v = q(a * b, 100);
        ask = numStep(`Que vaut vraiment ${m(`0{,}${a} \\times 0{,}${b}`)} ?`, '', v, 'Deux chiffres après la virgule en tout.', [[q(a * b, 10), `C’est l’erreur de ${who}.`]], { form: 'decimal', shown: bg(v) });
        sol = [`${m(`0{,}${a} \\times 0{,}${b} = ${bg(v)}`)} : deux décimales en tout. Multiplier par un nombre plus petit que 1 donne un résultat plus petit : ${m(`${bg(v)} < 0{,}${Math.min(a, b)}`)} ✓.`];
        items = [{ what: 'v', js: `${a / 10}*${b / 10}`, expect: toNum(v), tol: 1e-12 }];
        break;
      }
      case 'comp': {
        const d = rng.int(2, 8), x = rng.int(10 * (d - 1) + 1, 10 * d - 1), ip = rng.int(0, 9);
        quote = `${m(`${ip}{,}${x} > ${ip}{,}${d}`)}, car ${m(`${x} > ${d}`)}.`;
        ask = { prompt: `Compare correctement ${m(`${ip}{,}${x}`)} et ${m(`${ip}{,}${d}`)}.`, answer: fixedChoice([m('<'), m('>')], 0, [null, `C’est l’erreur de ${who} : ${m(`${ip}{,}${d} = ${ip}{,}${d}0`)}.`]), hint: `Écris ${m(`${ip}{,}${d}`)} avec deux décimales.` };
        sol = [`${m(`${ip}{,}${d} = ${ip}{,}${d}0`)} et ${m(`${x} < ${d}0`)} centièmes : ${m(`${ip}{,}${x} < ${ip}{,}${d}`)}. On compare d’abord les dixièmes : ${m(`${Math.floor(x / 10)} < ${d}`)}.`];
        items = [{ what: 'c', js: `${ip + x / 100}<${ip + d / 10}?0:1`, expect: 0 }];
        break;
      }
      case 'zero': {
        const x = q(rng.int(11, 99), 10);
        const v = q(x.n * 10 / x.d);
        quote = `${m(`${bg(x)} \\times 10 = ${bg(x)}0`)} : multiplier par 10, c’est ajouter un zéro.`;
        ask = numStep(`Que vaut vraiment ${m(`${bg(x)} \\times 10`)} ?`, '', v, 'Chaque chiffre avance d’un rang vers la gauche.', [[x, `${m(`${bg(x)}0 = ${bg(x)}`)} : le nombre n’a pas changé.`]]);
        sol = [`${m(`${bg(x)} \\times 10 = ${bg(v)}`)} : les chiffres avancent d’un rang. ${m(`${bg(x)}0`)} vaut toujours ${m(bg(x))}.`];
        items = [{ what: 'v', js: `${toNum(x)}*10`, expect: toNum(v), tol: 1e-9 }];
        break;
      }
      case 'impair': {
        const n = rng.pick([51, 57, 87, 91, 93, 111, 119, 133, 143, 161]);
        const sp = factors(n)[0];
        quote = `« ${m(String(n))} est premier : il est impair et ne se termine ni par 0 ni par 5. »`;
        ask = step(`Écris ${m(String(n))} comme produit de deux entiers plus grands que 1 (le plus petit d’abord).`, [F('', q(sp)), F(m('\\times'), q(n / sp))], `Essaie 3, 7, 11…`, [{ on: 'numAll', values: [q(1), q(n)], msg: 'Des entiers plus grands que 1.' }]);
        sol = [`${m(`${n} = ${sp} \\times ${n / sp}`)}${sp === 3 ? ` (somme des chiffres ${String(n).split('').join(' + ')} = ${String(n).split('').map(Number).reduce((a, b) => a + b, 0)}, divisible par 3)` : ''} : ${m(String(n))} n’est pas premier.`];
        items = [{ what: 'sp', js: `((n)=>{for(let d=2;d*d<=n;d++)if(n%d===0)return d})(${n})`, expect: sp }, { what: 'c', js: `${n}/${sp}`, expect: n / sp }];
        break;
      }
      case 'un': {
        quote = '« 1 est un nombre premier, puisqu’il n’est divisible que par 1 et par lui-même. »';
        const N = rng.pick([10, 12, 15, 20, 25, 30, 40, 50]);
        const ps = [...Array(N)].map((_, i) => i + 1).filter(isPrime);
        ask = numStep(`Combien y a-t-il de nombres premiers entre ${m('1')} et ${m(String(N))} (compris) ?`, '', q(ps.length), 'Liste-les avec le crible : barre les multiples de 2, 3, 5, 7 (sauf eux-mêmes)… et pense au cas de 1.', [[q(ps.length + 1), `Tu as compté ${m('1')}, qui n’est pas premier.`]]);
        sol = [`Un nombre premier a **exactement deux** diviseurs distincts. ${m('1')} n’en a qu’un : il n’est pas premier.`, `Entre 1 et ${N} : ${m(ps.join(' ; '))}, soit ${m(String(ps.length))} nombres premiers.`];
        items = [{ what: 'n', js: `[...Array(${N})].map((_,i)=>i+1).filter(n=>n>1&&[...Array(n)].filter((_,i)=>n%(i+1)===0).length===2).length`, expect: ps.length }];
        quote += `#${N}`;
        break;
      }
      default: {
        const ip = rng.int(1, 20), dd = rng.int(1, 8), th = rng.int(5, 9);
        const x = q(ip * 1000 + dd * 100 + 40 + th, 1000);
        quote = `${m(`${bg(x)} \\approx ${bg(q(ip * 100 + dd * 10 + 5, 100))} \\approx ${bg(q(ip * 10 + dd + 1, 10))}`)} au dixième.`;
        const v = q(ip * 10 + dd, 10);
        ask = numStep(`Quel est le vrai arrondi de ${m(bg(x))} au dixième ?`, '', v, 'Regarde seulement le chiffre des centièmes.', [[q(ip * 10 + dd + 1, 10), `C’est l’erreur de ${who}.`]], { form: 'decimal', shown: bg(v) });
        sol = [`Le chiffre des centièmes est ${m('4')} (plus petit que 5) : ${m(`${bg(x)} \\approx ${bg(v)}`)}.`];
        items = [{ what: 'v', js: `Math.round(${x.n * (1000 / x.d)}/100)/10`, expect: toNum(v), tol: 1e-9 }];
      }
    }
    const bad = rng.shuffle((Object.keys(R) as (keyof typeof R)[]).filter((k) => k !== kind)).slice(0, 3).map((k) => [R[k], 'Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.'] as [Rich, Rich]);
    return {
      title: 'Trouve l’erreur.',
      statement: `${who} affirme : ${(quote.startsWith('«') ? quote : `« ${quote} »`).replace(/#\d+$/, '')}`,
      steps: [{ prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, R[kind], bad), hint: 'Reviens à la règle du cours.' }, ask!],
      solution: [R[kind], ...sol],
      answer: R[kind],
      key: `${kind}:${quote}`,
      data: { kind: 'js', items },
    };
  },
};
void bg;
