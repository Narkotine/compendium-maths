/**
 * Fractions (★ → ★★) : lire une fraction (barre, demi-droite), fractions égales, simplifier, comparer, ranger,
 * changer d'écriture. Construction à rebours : on part de la fraction irréductible (ou du rangement) voulue.
 */
import { type Q, q, eq, cmp, toNum, gcd, isInt } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, fixedChoice, shuffledChoice, sample } from '../engine/build';
import { orderStep, ranked, chainTex, type Card } from '../engine/ordering';
import { LINKS, fr, fq, factors, factTex, lcm, decimalDen, barsSvg, discSvg, gridSvg, halfLineSvg } from './common';

/** Case « fraction irréductible » (entier : toute écriture). */
export const irr = (label: Rich, v: Q, unit?: string): NumField => ({ label, expect: v, form: isInt(v) ? 'any' : 'irreducible', ...(isInt(v) ? {} : { shown: fq(v) }), ...(unit ? { unit } : {}) });
/** Case « toute écriture », réponse affichée en fraction (telle quelle si `t` est donné). */
export const anyF = (label: Rich, v: Q, t?: string): NumField => ({ label, expect: v, form: 'any', ...(isInt(v) ? {} : { shown: t ?? fq(v) }) });
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });

// ===================================================================== lire
export const lire: Generator = {
  id: 'lire',
  title: 'Lire une fraction',
  desc: 'Barre partagée en parts égales, demi-droite graduée.',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{5}{8}',
  course: LINKS.s11,
  links: [LINKS.s13],
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const b = rng.int(3, 12);
      const over = rng.chance(0.3);
      let a: number;
      if (over) a = rng.intNot(b + 1, 2 * b - 1, ...[]);
      else {
        const red = [...Array(b - 1).keys()].map((i) => i + 1).filter((x) => gcd(x, b) > 1);
        a = red.length && rng.chance(0.55) ? rng.pick(red) : rng.int(1, b - 1);
      }
      const v = q(a, b), g = gcd(a, b);
      // figure : barre (parts pas forcément voisines), disque ou rectangle quadrillé
      const shape = over ? 'bar' : rng.pick(['bar', 'bar', 'disc', 'grid']);
      const grids: Record<number, [number, number][]> = { 4: [[2, 2]], 6: [[2, 3]], 8: [[2, 4]], 9: [[3, 3]], 10: [[2, 5]], 12: [[3, 4], [2, 6]] };
      const gr = shape === 'grid' && grids[b] ? rng.pick(grids[b]) : null;
      const kind = shape === 'grid' && !gr ? 'bar' : shape;
      const nLast = over ? a - b : a;
      const on = rng.chance(0.5) ? [...Array(nLast).keys()] : rng.shuffle([...Array(b).keys()]).slice(0, nLast).sort((x, y) => x - y);
      const figure = kind === 'disc' ? discSvg(b, on) : kind === 'grid' && gr ? gridSvg(gr[0], gr[1], on) : barsSvg(a, b, on);
      const unitWord = kind === 'disc' ? 'Le disque représente une unité.' : kind === 'grid' ? 'Le rectangle représente une unité.' : over ? 'Chaque barre représente une unité.' : 'La barre représente une unité.';
      const partW = kind === 'disc' ? ['secteur', 'secteurs', 'colorié', 'blanc'] : kind === 'grid' ? ['case', 'cases', 'coloriée', 'blanche'] : ['part', 'parts', 'coloriée', 'blanche'];
      const nP = (k: number, adj: 2 | 3) => `${m(String(k))} ${k > 1 ? partW[1] : partW[0]} ${partW[adj]}${k > 1 ? 's' : ''}`;
      const s1 = step('Quelle fraction de l’unité est coloriée ?', [anyF('Fraction coloriée :', v, fr(a, b))],
        'Le dénominateur : en combien de parts égales l’unité est partagée. Le numérateur : combien de parts sont coloriées.',
        mist(v, [
          [q(b, a), 'C’est l’inverse : le numérateur compte les parts coloriées, le dénominateur les parts d’une unité.'],
          [!over && b - a > 0 ? q(a, b - a) : null, 'Tu as comparé les parts coloriées aux parts blanches. Le dénominateur, c’est le nombre total de parts de l’unité.'],
          [over ? q(a, 2 * b) : null, 'Le dénominateur est le nombre de parts d’**une** unité (une barre), pas de toutes les barres.'],
        ]));
      const steps: Step[] = [s1];
      const sol: Rich[] = [`L’unité est partagée en ${m(String(b))} ${kind === 'disc' ? 'secteurs égaux' : kind === 'grid' ? 'cases égales' : 'parts égales'}${over ? ' (dans chaque barre)' : ''} ; il y a ${nP(a, 2)} en tout : ${m(fr(a, b))}.`];
      const items = [{ what: 'fraction', js: `${a}/${b}`, expect: toNum(v) }];
      let answer = m(fr(a, b));
      if (over) {
        const e = Math.floor(a / b), r = a % b;
        steps.push(step(`Écris ${m(fr(a, b))} comme la somme d’un entier et d’une fraction inférieure à ${m('1')}.`, [{ label: m(`${fr(a, b)} =`), expect: q(e), form: 'any' }, anyF(m('+'), q(r, b), fr(r, b))],
          `Une barre entière, c’est ${m(fr(b, b) + ' = 1')}. Combien de barres entières, et combien de parts en plus ?`,
          [...mist(q(r, b), [[q(r, 2 * b), 'La fraction qui reste se compte en parts d’une seule unité.']], 1)]));
        sol.push(`${m(`${fr(a, b)} = ${fr(b * e, b)} + ${fr(r, b)} = ${e} + ${fr(r, b)}`)} : ${e === 1 ? 'une barre entière' : `${e} barres entières`} et ${m(String(r))} part${r > 1 ? 's' : ''} en plus.`);
        sol.push(`Contrôle : ${m(String(a))} est plus grand que ${m(String(b))}, donc la fraction dépasse ${m('1')} ✓.`);
        items.push({ what: 'entier', js: `Math.floor(${a}/${b})`, expect: e }, { what: 'reste', js: `(${a}%${b})/${b}`, expect: r / b });
        answer += ` ${m(`= ${e} + ${fr(r, b)}`)}`;
      } else if (g > 1) {
        steps.push(step('Simplifie cette fraction (fraction irréductible).', [irr(m(`${fr(a, b)} =`), v)], `Cherche un nombre qui divise à la fois ${m(String(a))} et ${m(String(b))}.`,
          mist(v, [[q(a - 1, b - 1), 'On ne retire rien : on **divise** le numérateur et le dénominateur par un même nombre.']])));
        sol.push(`${m(`${fr(a, b)} = ${fr(a / g, b / g)}`)} (on divise par ${m(String(g))}) ; ${m(String(a / g))} et ${m(String(b / g))} n’ont plus que ${m('1')} comme diviseur commun.`);
        items.push({ what: 'simplifiée', js: `${a / g}/${b / g}`, expect: toNum(v) });
        answer += ` ${m(`= ${fq(v)}`)}`;
      } else {
        const w = q(b - a, b);
        steps.push(step('Quelle fraction de l’unité reste blanche ?', [anyF('Fraction blanche :', w, fr(b - a, b))], `L’unité entière, c’est ${m(fr(b, b))}.`, mist(w, [[q(b, b - a), 'C’est l’inverse : le numérateur compte les parts blanches.']])));
        sol.push(`Il reste ${nP(b - a, 3)} sur ${m(String(b))} : ${m(`${fr(b - a, b)}`)}. Contrôle : ${m(`${fr(a, b)} + ${fr(b - a, b)} = ${fr(b, b)} = 1`)} ✓.`);
        items.push({ what: 'blanche', js: `1 - ${a}/${b}`, expect: toNum(w) });
        answer += ` ; blanche : ${m(fr(b - a, b))}`;
      }
      return {
        title: 'Lis la fraction coloriée.',
        statement: unitWord,
        figure,
        steps,
        solution: sol,
        answer,
        key: `${kind}:${a}/${b}:${on.join('.')}`,
        data: { kind: 'js', items },
      };
    }
    // ★★ : demi-droite graduée
    const b = rng.pick([3, 4, 5, 6, 7, 8, 10, 12]);
    const units = b <= 5 ? 3 : 2;
    const kA = rng.pick([...Array(units * b).keys()].filter((k) => k > b && k % b !== 0));
    const kB = rng.int(1, b - 1);
    const kC = rng.pick([...Array(units * b).keys()].filter((k) => k > 0 && k % b !== 0 && k !== kA && k !== kB));
    const A = q(kA, b), B = q(kB, b), e = Math.floor(kA / b), r = kA % b;
    const wholeMsg = 'L’unité, c’est la longueur de 0 à 1, pas toute la demi-droite : compte les parts **d’une** unité.';
    const C = q(kC, b);
    const s1 = step('Lis les abscisses des points A, B et C (en fractions).', [anyF('A :', A, fr(kA, b)), anyF('B :', B, fr(kB, b)), anyF('C :', C, fr(kC, b))],
      `Compte en combien de parts égales l’unité (de 0 à 1) est partagée : c’est le dénominateur.`,
      [...mist(A, [[q(kA, units * b), wholeMsg], [q(kA, b + 1), 'Compte les **intervalles** entre deux graduations, pas les traits.']], 0), ...mist(B, [[q(kB, units * b), wholeMsg], [q(kB, b + 1), 'Compte les **intervalles** entre deux graduations, pas les traits.']], 1), ...mist(C, [[q(kC, units * b), wholeMsg]], 2)]);
    const s2 = step(`Écris l’abscisse de A comme la somme d’un entier et d’une fraction inférieure à ${m('1')}.`, [{ label: m(`${fr(kA, b)} =`), expect: q(e), form: 'any' }, anyF(m('+'), q(r, b))],
      `Combien d’unités entières avant A ? Puis combien de parts en plus ?`);
    return {
      title: 'Lis des fractions sur une demi-droite graduée.',
      figure: halfLineSvg(b, units, [['A', kA], ['B', kB], ['C', kC]]),
      steps: [s1, s2],
      solution: [
        `Chaque unité est partagée en ${m(String(b))} parts égales : une graduation vaut ${m(fr(1, b))}.`,
        `B est à ${m(String(kB))} graduation${kB > 1 ? 's' : ''} de ${m('0')} : ${m(`B\\,(${fr(kB, b)})`)}. A est à ${m(String(kA))} graduations de ${m('0')} : ${m(`A\\,(${fr(kA, b)})`)} ; C est à ${m(String(kC))} graduation${kC > 1 ? 's' : ''} : ${m(`C\\,(${fr(kC, b)})`)}.`,
        `${m(`${fr(kA, b)} = ${fr(e * b, b)} + ${fr(r, b)} = ${e} + ${fr(r, b)}${gcd(r, b) > 1 ? ` = ${e} + ${fq(q(r, b))}` : ''}`)}, donc A est entre ${m(String(e))} et ${m(String(e + 1))}.`,
        `Contrôle : sur la figure, A est bien entre les graduations ${m(String(e))} et ${m(String(e + 1))} ✓.`,
      ],
      answer: `${m(`A\\,(${fr(kA, b)})`)}, ${m(`B\\,(${fr(kB, b)})`)}, ${m(`C\\,(${fr(kC, b)})`)} ; ${m(`${fr(kA, b)} = ${e} + ${fq(q(r, b))}`)}`,
      key: `line:${b}:${kA}:${kB}:${kC}`,
      data: { kind: 'js', items: [{ what: 'A', js: `${kA}/${b}`, expect: kA / b }, { what: 'B', js: `${kB}/${b}`, expect: kB / b }, { what: 'C', js: `${kC}/${b}`, expect: kC / b }, { what: 'e', js: `Math.floor(${kA}/${b})`, expect: e }, { what: 'r', js: `${kA}/${b} - Math.floor(${kA}/${b})`, expect: r / b }] },
    };
  },
};

// ===================================================================== égales
export const egales: Generator = {
  id: 'egales',
  title: 'Fractions égales',
  desc: 'Compléter une égalité ; vrai ou faux.',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{3}{5} = \\dfrac{\\ldots}{20}',
  course: LINKS.s21,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      let a: number, b: number;
      do { b = rng.int(2, 9); a = rng.int(1, 2 * b - 1); } while (gcd(a, b) !== 1);
      const k1 = rng.int(2, 9), k2 = rng.intNot(2, 9, k1);
      const add = 'On ne **rajoute** pas le même nombre : on **multiplie** le numérateur et le dénominateur par le même nombre.';
      const s: Step = step(m(`${fr(a, b)} = \\dfrac{\\ldots}{${k1 * b}} = \\dfrac{${k2 * a}}{\\ldots}`), [{ label: 'Premier numérateur :', expect: q(k1 * a), form: 'any' }, { label: 'Second dénominateur :', expect: q(k2 * b), form: 'any' }],
        `Par combien a-t-on multiplié ${m(String(b))} pour obtenir ${m(String(k1 * b))} ? Fais de même en haut.`,
        [...mist(q(k1 * a), [[q(a + k1 * b - b), add]], 0), ...mist(q(k2 * b), [[q(b + k2 * a - a), add]], 1)]);
      return {
        title: 'Complète les fractions égales.',
        steps: [s],
        solution: [
          `${m(`${b} \\times ${k1} = ${k1 * b}`)}, donc ${m(`${fr(a, b)} = \\dfrac{${a} \\times ${k1}}{${b} \\times ${k1}} = ${fr(k1 * a, k1 * b)}`)}.`,
          `${m(`${a} \\times ${k2} = ${k2 * a}`)}, donc ${m(`${fr(a, b)} = \\dfrac{${a} \\times ${k2}}{${b} \\times ${k2}} = ${fr(k2 * a, k2 * b)}`)}.`,
          `Contrôle : ${m(`${fr(k1 * a, k1 * b)}`)} et ${m(fr(k2 * a, k2 * b))} se simplifient bien en ${m(fr(a, b))} ✓.`,
        ],
        answer: m(`${fr(a, b)} = ${fr(k1 * a, k1 * b)} = ${fr(k2 * a, k2 * b)}`),
        key: `${a}/${b}:${k1}:${k2}`,
        data: { kind: 'js', items: [{ what: 'n1', js: `${a}*${k1 * b}/${b}`, expect: k1 * a }, { what: 'd2', js: `${k2 * a}*${b}/${a}`, expect: k2 * b }] },
      };
    }
    // ★★ : vrai ou faux (trois égalités dont au moins une vraie et une fausse)
    type It = { l: [number, number]; r: [number, number] };
    const mk = (kind: string): It => {
      let a: number, b: number;
      do { b = rng.int(3, 12); a = rng.int(1, b - 1); } while (gcd(a, b) !== 1);
      const k = rng.int(2, 6);
      switch (kind) {
        case 'scale': return rng.chance(0.5) ? { l: [a, b], r: [a * k, b * k] } : { l: [a * k, b * k], r: [a, b] };
        case 'add': { const t = rng.int(1, 5); return { l: [a, b], r: [a + t, b + t] }; }
        case 'two': { const k2 = rng.intNot(2, 6, k); return { l: [a * k, b * k], r: [a * k2, b * k2] }; }
        default: { // presque : 4/6 et 6/8 — numérateur et dénominateur décalés autrement
          const k2 = rng.intNot(2, 6, k);
          return { l: [a * k, b * k], r: [a * k2 + 1, b * k2] };
        }
      }
    };
    const kinds = rng.shuffle(['add', rng.pick(['scale', 'two']), rng.pick(['near', 'scale', 'add', 'two'])]);
    const its = kinds.map(mk);
    const isEq = (t: It) => t.l[0] * t.r[1] === t.r[0] * t.l[1];
    const why = (t: It): Rich => {
      const [a, b] = t.l, [c, d] = t.r, L = lcm(b, d);
      if (isEq(t)) {
        const v = q(a, b);
        const one = (n: number, dd: number) => (v.n === n && v.d === dd ? `${fr(n, dd)} est irréductible` : m(`${fr(n, dd)} = ${fq(v)}`));
        return `Vrai : ${a === v.n && b === v.d ? `${m(fr(a, b))} est irréductible et ${m(`${fr(c, d)} = ${fq(v)}`)}` : c === v.n && d === v.d ? `${m(`${fr(a, b)} = ${fq(v)}`)}` : `${one(a, b)} et ${one(c, d)}`}.`;
      }
      if (c - a === d - b && c !== a) return `Faux : on a ajouté ${m(String(c - a))} en haut et en bas ; cela change la fraction. Au même dénominateur ${m(String(L))} : ${m(`${fr(a * (L / b), L)} \\neq ${fr(c * (L / d), L)}`)}.`;
      const u = q(a, b), w = q(c, d), L2 = lcm(u.d, w.d);
      const red = (n: number, dd: number, v: Q) => (v.d === dd ? fr(n, dd) : `${fr(n, dd)} = ${fq(v)}`);
      const conv = (v: Q) => (v.d === L2 ? '' : ` = ${fr(v.n * (L2 / v.d), L2)}`);
      return `Faux : ${m(`${red(a, b, u)}${conv(u)}`)} et ${m(`${red(c, d, w)}${conv(w)}`)}.`;
    };
    const steps: Step[] = its.map((t, i) => ({
      prompt: `${'abc'[i]}) ${m(`${fr(...t.l)} = ${fr(...t.r)}`)}`,
      answer: fixedChoice(['Vrai', 'Faux'], isEq(t) ? 0 : 1, [why(t), why(t)]),
      hint: 'Simplifie les deux fractions, ou écris-les avec le même dénominateur. Ajouter le même nombre en haut et en bas ne donne pas une fraction égale.',
    }));
    return {
      title: 'Vrai ou faux ?',
      steps,
      solution: [...its.map((t, i) => `${'abc'[i]}) ${why(t)}`), 'À retenir : on ne change pas une fraction en **multipliant** (ou divisant) le numérateur et le dénominateur par un même nombre ; en ajoutant, si.'],
      answer: its.map((t, i) => `${'abc'[i]}) ${isEq(t) ? 'vrai' : 'faux'}`).join(' ; '),
      key: its.map((t) => `${t.l}=${t.r}`).join(';'),
      data: { kind: 'js', items: its.map((t, i) => ({ what: `step:${i}`, js: `Math.abs(${t.l[0]}/${t.l[1]} - ${t.r[0]}/${t.r[1]}) < 1e-12 ? 0 : 1`, expect: isEq(t) ? 0 : 1 })) },
    };
  },
};

// ===================================================================== simplifier
/** Simplification pas à pas par les petits facteurs premiers de k (24/36 = 12/18 = 6/9 = 2/3). */
function stepwise(n: number, d: number): Rich {
  const g = gcd(n, d);
  const fs = factors(g);
  if (fs.length <= 1) return `${m(`${fr(n, d)} = ${fr(n / g, d / g)}`)} (on divise par ${m(String(g))}).`;
  // regroupe les facteurs égaux (÷ 4 plutôt que ÷ 2 ÷ 2 si l'élève le voit) : on garde les premiers
  const parts: string[] = [fr(n, d)];
  let a = n, b = d;
  const divs: number[] = [];
  for (const p of fs) { a /= p; b /= p; parts.push(fr(a, b)); divs.push(p); }
  return `${m(parts.join(' = '))} (on divise successivement par ${divs.map((p) => m(String(p))).join(', ')}) ; on pouvait diviser directement par ${m(String(g))}.`;
}
export const simplifier: Generator = {
  id: 'simplifier',
  title: 'Rendre une fraction irréductible',
  desc: 'Simplifier ; par la décomposition en facteurs premiers (★★).',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{18}{24} = \\dfrac{3}{4}',
  course: LINKS.s22,
  generate(rng: Rng, level: Level) {
    const one = (lv: Level) => {
      let a: number, b: number, k: number;
      do {
        b = rng.int(2, lv === 1 ? 12 : 16);
        a = rng.int(1, lv === 1 ? 2 * b : 3 * b);
        k = lv === 1 ? rng.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]) : rng.pick([6, 12, 14, 15, 18, 21, 24, 28, 30, 35, 36, 42]);
      } while (gcd(a, b) !== 1 || a % b === 0 || a * k > (lv === 1 ? 150 : 600) || b * k > (lv === 1 ? 150 : 600) || a * k < 6);
      return { n: a * k, d: b * k, v: q(a, b) };
    };
    if (level === 1) {
      const xs = [one(1), one(1)];
      if (xs[0].n === xs[1].n && xs[0].d === xs[1].d) xs[1] = one(1);
      const steps: Step[] = xs.map((x, i) => step(`${'ab'[i]}) Rends ${m(fr(x.n, x.d))} irréductible.`, [irr(m(`${fr(x.n, x.d)} =`), x.v)],
        `Divise le numérateur et le dénominateur par un même nombre (critères : ${m('2')}, ${m('3')}, ${m('5')}, ${m('10')}…), et recommence tant que c’est possible.`,
        mist(x.v, [[q(x.d, x.n), 'Le numérateur reste en haut : tu as inversé la fraction.'], [q(x.n - 1, x.d - 1), 'On ne retire rien : on **divise** les deux nombres par un même diviseur.']])));
      return {
        title: 'Rends les fractions irréductibles.',
        steps,
        solution: [...xs.map((x, i) => `${'ab'[i]}) ${stepwise(x.n, x.d)}`), `Contrôle : ${xs.map((x) => `${m(String(x.v.n))} et ${m(String(x.v.d))}`).join(', puis ')} n’ont plus que ${m('1')} comme diviseur commun.`],
        answer: xs.map((x) => m(`${fr(x.n, x.d)} = ${fq(x.v)}`)).join(' ; '),
        key: xs.map((x) => `${x.n}/${x.d}`).join(';'),
        data: { kind: 'js', items: xs.map((x, i) => ({ what: `f${i}`, js: `${x.n}/${x.d}`, expect: toNum(x.v) })) },
      };
    }
    const x = one(2), g = gcd(x.n, x.d);
    const fsN = factors(x.n), fsD = factors(x.d);
    const smallest = factors(g)[0];
    const s1 = step(`Quel est le plus grand nombre qui divise à la fois ${m(String(x.n))} et ${m(String(x.d))} ?`, [{ label: 'Diviseur commun :', expect: q(g), form: 'any' }],
      `Décompose ${m(String(x.n))} et ${m(String(x.d))} en produits de facteurs premiers, puis multiplie les facteurs communs.`,
      mist(q(g), [[smallest !== g ? q(smallest) : null, `${m(String(smallest))} divise bien les deux nombres, mais ce n’est pas le plus grand diviseur commun : il reste des facteurs premiers communs.`]]));
    const s2 = step(`Rends ${m(fr(x.n, x.d))} irréductible.`, [irr(m(`${fr(x.n, x.d)} =`), x.v)], `Divise le numérateur et le dénominateur par ${m(String(g))}.`,
      mist(x.v, [[q(x.d, x.n), 'Le numérateur reste en haut : tu as inversé la fraction.']]));
    // barrer les facteurs communs : on les liste
    const common: number[] = [];
    const restD = [...fsD];
    for (const p of fsN) { const i = restD.indexOf(p); if (i >= 0) { common.push(p); restD.splice(i, 1); } }
    return {
      title: 'Simplifie en décomposant en facteurs premiers.',
      steps: [s1, s2],
      solution: [
        `${m(`${x.n} = ${factTex(x.n)}`)} et ${m(`${x.d} = ${factTex(x.d)}`)}.`,
        `Facteurs communs : ${m(`${common.join(' \\times ')} = ${g}`)}.`,
        `${m(`${fr(x.n, x.d)} = \\dfrac{${factTex(x.n)}}{${factTex(x.d)}} = ${fr(x.n / g, x.d / g)}`)} (on barre les facteurs communs).`,
        `Contrôle : ${m(String(x.v.n))} et ${m(String(x.v.d))} n’ont plus que ${m('1')} comme diviseur commun ; et ${m(`${x.v.n} \\times ${g} = ${x.n}`)} ✓.`,
      ],
      answer: `${m(`${fr(x.n, x.d)} = ${fq(x.v)}`)} (on divise par ${m(String(g))})`,
      key: `${x.n}/${x.d}`,
      data: { kind: 'js', items: [{ what: 'pgcd', js: `(function g(a,b){return b?g(b,a%b):a})(${x.n},${x.d})`, expect: g }, { what: 'f', js: `${x.n}/${x.d}`, expect: toNum(x.v) }] },
    };
  },
};

// ===================================================================== comparer
type Pair = [number, number, number, number];
function pairFor(rng: Rng, kind: string): Pair {
  for (;;) {
    switch (kind) {
      case 'sameDen': { const d = rng.int(5, 15), a = rng.int(1, 2 * d), c = rng.intNot(1, 2 * d, a); if (gcd(a, d) === 1 || gcd(c, d) === 1) return [a, d, c, d]; break; }
      case 'sameNum': { const n = rng.int(2, 9), b = rng.int(3, 15), d = rng.intNot(3, 15, b); if (gcd(n, b) === 1 && gcd(n, d) === 1) return [n, b, n, d]; break; }
      case 'one': {
        const d = rng.int(3, 20), a = rng.chance(0.5) ? rng.int(d + 1, 2 * d) : rng.int(Math.max(1, d - 6), d - 1);
        return [a, d, 1, 1];
      }
      case 'eq': { // même nombre, écrit autrement
        const b = rng.int(2, 9), a = rng.int(1, 2 * b - 1), k = rng.int(2, 5);
        if (gcd(a, b) === 1 && b * k <= 40 && a !== b) return [a, b, a * k, b * k];
        break;
      }
      case 'dec': { // fraction et écriture décimale (dixièmes ou centièmes)
        const b = rng.pick([2, 4, 5, 8, 10, 20, 25]), a = rng.int(1, 2 * b - 1);
        if (gcd(a, b) !== 1) break;
        const x = Math.round((a / b) * 100) + rng.pick([-10, -5, 5, 10, -1, 1, 0]);
        if (x <= 0 || x === Math.round((a / b) * 100) && rng.chance(0.6)) break;
        return x % 10 === 0 ? [a, b, x / 10, 10] : [a, b, x, 100];
      }
      case 'close': { const n = rng.int(2, 12); return rng.chance(0.5) ? [n, n + 1, n + 1, n + 2] : [n + 1, n + 2, n, n + 1]; }
      case 'neg': {
        const b = rng.int(2, 9), d = rng.intNot(2, 9, b), a = rng.int(1, b - 1), c = rng.int(1, d - 1);
        if (gcd(a, b) === 1 && gcd(c, d) === 1 && a * d !== b * c && lcm(b, d) <= 72) return [-a, b, -c, d];
        break;
      }
      default: { // cas général : dénominateurs différents, multiple commun ≤ 72, le piège « plus grand numérateur » arrive souvent
        const b = rng.int(3, 12), d = rng.intNot(3, 12, b), a = rng.int(1, 2 * b - 1), c = rng.int(1, 2 * d - 1);
        const L = lcm(b, d);
        if (gcd(a, b) === 1 && gcd(c, d) === 1 && a !== c && a * d !== b * c && L <= 72 && Math.abs(a / b - c / d) < 0.25) return [a, b, c, d];
      }
    }
  }
}
const rel = (p: Pair) => (p[0] * p[3] < p[2] * p[1] ? '<' : p[0] * p[3] === p[2] * p[1] ? '=' : '>');
const decTex = (n: number, d: number) => (n / d).toFixed(d === 10 ? 1 : 2).replace('.', '{,}');
const ftex = (n: number, d: number) => (d === 1 ? String(n) : fr(n, d));
function explain(p: Pair, kind: string, swapped = false): Rich {
  const [a, b, c, d] = p, r = rel(p);
  const A = kind === 'dec' && swapped ? decTex(a, b) : ftex(a, b), C = kind === 'dec' && !swapped ? decTex(c, d) : ftex(c, d);
  switch (kind) {
    case 'eq': {
      const [x, y, k] = c > a ? [a, b, c / a] : [c, d, a / c];
      return `${m(`${fr(x, y)} = \\dfrac{${x} \\times ${k}}{${y} \\times ${k}} = ${fr(x * k, y * k)}`)} : on a multiplié le numérateur et le dénominateur par ${m(String(k))}, donc ${m(`${A} = ${C}`)}.`;
    }
    case 'dec': {
      const [fn, fd, dn0, dd] = swapped ? [c, d, a, b] : [a, b, c, d];
      const L = lcm(fd, dd);
      const w = (n: number, x: number) => (x === L ? m(fr(n, x)) : m(`${fr(n, x)} = ${fr(n * (L / x), L)}`));
      return `${m(`${decTex(dn0, dd)} = ${fr(dn0, dd)}`)} (on lit les ${dd === 10 ? 'dixièmes' : 'centièmes'}). Au dénominateur ${m(String(L))} : ${w(fn, fd)} et ${w(dn0, dd)}, donc ${m(`${A} ${r} ${C}`)}.`;
    }
    case 'sameDen': return `Même dénominateur : on compare les numérateurs (${m(`${a} ${r} ${c}`)}), donc ${m(`${A} ${r} ${C}`)}.`;
    case 'sameNum': return `Même numérateur : la plus grande a le plus **petit** dénominateur (parts plus grandes), donc ${m(`${A} ${r} ${C}`)}.`;
    case 'one': return a > b ? `${m(String(a))} est plus grand que ${m(String(b))} : la fraction dépasse ${m('1')}, donc ${m(`${A} ${r} 1`)}.` : `${m(String(a))} est plus petit que ${m(String(b))} : la fraction est inférieure à ${m('1')}, donc ${m(`${A} ${r} 1`)}.`;
    case 'close': return `${m(`${A} = 1 - ${fr(1, b)}`)} et ${m(`${C} = 1 - ${fr(1, d)}`)} ; il manque moins pour atteindre ${m('1')} quand le dénominateur est plus grand, donc ${m(`${A} ${r} ${C}`)}.`;
    case 'neg': {
      const L = lcm(b, d);
      const w = (n: number, dd: number) => (dd === L ? m(fr(n, dd)) : m(`${fr(n, dd)} = ${fr(n * (L / dd), L)}`));
      return `Au dénominateur ${m(String(L))} : ${w(a, b)} et ${w(c, d)}. Entre deux négatifs, le plus petit est le plus loin de zéro : ${m(`${A} ${r} ${C}`)}.`;
    }
    default: {
      const L = lcm(b, d);
      return `Au même dénominateur ${m(String(L))} : ${m(`${A} = ${fr(a * (L / b), L)}`)} et ${m(`${C} = ${fr(c * (L / d), L)}`)}, donc ${m(`${A} ${r} ${C}`)}.`;
    }
  }
}
export const comparer: Generator = {
  id: 'comparer',
  title: 'Comparer deux fractions',
  desc: 'Avec <, = ou > : même dénominateur, même numérateur, à 1 (★) ; cas général, égalité (★★) ; négatifs et décimaux (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '\\dfrac{5}{6} \\;\\square\\; \\dfrac{7}{9}',
  course: LINKS.s3,
  generate(rng: Rng, level: Level) {
    const kinds = level === 1 ? rng.shuffle(['sameDen', 'sameNum', 'one']) : level === 2 ? rng.shuffle(['gen', 'gen', rng.pick(['close', 'sameNum', 'eq'])]) : rng.shuffle(['neg', 'dec', rng.pick(['eq', 'gen', 'neg'])]);
    const sw = kinds.map((k) => k !== 'one' && rng.chance(0.5));
    const pairs = kinds.map((k, i) => {
      const p = pairFor(rng, k);
      return sw[i] ? ([p[2], p[3], p[0], p[1]] as Pair) : p;
    });
    // côté écrit en décimal (type « dec ») : le second du tirage, donc le premier s'il y a eu échange
    const sides = (p: Pair, i: number): [string, string] =>
      kinds[i] === 'dec' ? (sw[i] ? [decTex(p[0], p[1]), ftex(p[2], p[3])] : [ftex(p[0], p[1]), decTex(p[2], p[3])]) : [ftex(p[0], p[1]), ftex(p[2], p[3])];
    const OPTS = [m('<'), m('='), m('>')];
    const idx = (r: string) => (r === '<' ? 0 : r === '=' ? 1 : 2);
    const steps: Step[] = pairs.map((p, i) => {
      const [L, R] = sides(p, i), ex = explain(p, kinds[i], sw[i]);
      return {
        prompt: `${'abc'[i]}) ${m(`${L} \\;\\square\\; ${R}`)}`,
        answer: fixedChoice(OPTS, idx(rel(p)), [ex, ex, ex]),
        hint: level === 1 ? 'Même dénominateur : compare les numérateurs. Même numérateur : la plus grande a le plus petit dénominateur. À 1 : compare le numérateur au dénominateur.' : level === 2 ? 'Écris les deux fractions avec un même dénominateur (un multiple commun), puis compare les numérateurs.' : 'Écris l’écriture décimale en fraction ; avec des négatifs, pense au signe et à la distance à zéro. Puis même dénominateur.',
      };
    });
    return {
      title: 'Compare (avec $<$, $=$ ou $>$).',
      steps,
      solution: [...pairs.map((p, i) => `${'abc'[i]}) ${explain(p, kinds[i], sw[i])}`), level === 1 ? 'Contrôle : on se représente les parts (plus le dénominateur est grand, plus les parts sont petites).' : 'Méthode : même dénominateur, puis on compare les numérateurs.'],
      answer: pairs.map((p, i) => m(`${sides(p, i)[0]} ${rel(p)} ${sides(p, i)[1]}`)).join(' ; '),
      key: pairs.map((p, i) => kinds[i] + p.join(',')).join(';'),
      data: { kind: 'js', items: pairs.map((p, i) => ({ what: `step:${i}`, js: `${p[0]}/${p[1]} < ${p[2]}/${p[3]} ? 0 : ${p[0]}/${p[1]} === ${p[2]}/${p[3]} ? 1 : 2`, expect: idx(rel(p)) })) },
    };
  },
};

// ===================================================================== ranger (cartes à glisser)
type FC = Card & { n: number; d: number; dec?: string; k?: number };
const RANG = ['', 'dixièmes', 'centièmes', 'millièmes'];
const fcard = (n: number, d: number): FC => ({ tex: fr(n, d), v: q(n, d), n, d });
const dcard = (x: number, decs: number): FC => {
  const v = q(Math.round(x * 10 ** decs), 10 ** decs);
  return { tex: (x < 0 ? '-' : '') + Math.abs(x).toFixed(decs).replace('.', '{,}'), v, n: v.n, d: v.d, dec: Math.abs(x).toFixed(decs).replace('.', '{,}'), k: decs };
};
const DIRW = (dir: 'asc' | 'desc') => (dir === 'asc' ? 'croissant (du plus petit au plus grand)' : 'décroissant (du plus grand au plus petit)');
/** Explication d'une paire, selon la méthode du cours, sans dire laquelle est la plus grande. */
function whyPair(A: FC, B: FC): Rich {
  const a = `$${A.tex}$`, b = `$${B.tex}$`;
  const sa = Math.sign(A.n), sb = Math.sign(B.n);
  if (sa !== sb) return `Un nombre négatif est plus petit qu’un nombre positif : regarde les signes de ${a} et ${b}.`;
  if (A.dec || B.dec) {
    const D = A.dec ? A : B;
    return `Écris ${m(D.tex)} en fraction (on lit des ${RANG[D.k!]}), puis compare-le à ${A.dec ? b : a} avec un même dénominateur.`;
  }
  const neg = sa < 0 ? ' Ce sont deux négatifs : le plus loin de zéro est le plus petit.' : '';
  if (A.d === B.d) return `Même dénominateur : compare les numérateurs de ${a} et ${b}.${neg}`;
  if (A.n === B.n) return `Même numérateur : la plus grande des deux a le plus **petit** dénominateur (parts plus grandes).${neg}`;
  if (sa > 0 && (A.n > A.d) !== (B.n > B.d) && A.n !== A.d && B.n !== B.d) return `Compare ${a} et ${b} à ${m('1')} : une fraction dépasse ${m('1')} quand son numérateur est plus grand que son dénominateur.`;
  const L = lcm(A.d, B.d);
  return `Compare ${a} et ${b} : mets-les au même dénominateur ${m(String(L))}, puis compare les numérateurs.${neg}`;
}
export const ranger: Generator = {
  id: 'ranger',
  title: 'Ranger des fractions',
  desc: 'Glisser les cartes dans l’ordre : même dénominateur ou numérateur (★), dénominateurs multiples (★★), négatifs et décimaux (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '\\dfrac{2}{5} ; \\dfrac{1}{2} ; \\dfrac{3}{8} ; \\dfrac{7}{10}',
  course: LINKS.s3,
  links: [LINKS.s82],
  generate(rng: Rng, level: Level) {
    const dir: 'asc' | 'desc' = rng.chance(level === 1 ? 0.3 : 0.35) ? 'desc' : 'asc';
    let cards: FC[] = [];
    let kind = 'gen';
    let L = 1;
    const lines: Rich[] = [];
    const mk: [Q[] | null, Rich][] = [];
    const rev = (cs: FC[]) => ranked(cs, dir === 'asc' ? 'desc' : 'asc');
    mk.push([null, '']); // place réservée (ordre inverse), remplie plus bas
    if (level === 1) {
      const nC = rng.chance(0.75) ? 4 : 5;
      kind = rng.chance(0.55) ? 'sameDen' : 'sameNum';
      if (kind === 'sameDen') {
        const d = rng.int(5, 15);
        const ns = sample(rng, [...Array(Math.round(1.6 * d)).keys()].map((k) => k + 1).filter((k) => k !== d), nC);
        cards = ns.map((n) => fcard(n, d));
        L = d;
        lines.push(`Même dénominateur ${m(String(d))} : les parts ont la même taille, on compare les **numérateurs**.`);
        lines.push(`${m([...ns].sort((x, y) => (dir === 'asc' ? x - y : y - x)).join(dir === 'asc' ? ' < ' : ' > '))}, donc ${m(chainTex(cards, dir))}.`);
      } else {
        let n = 0, pool: number[] = [];
        do {
          n = rng.int(2, 9);
          pool = [...Array(16).keys()].map((k) => k + 2).filter((k) => k !== n && gcd(k, n) === 1);
        } while (pool.length < nC + 3);
        const ds = sample(rng, pool, nC);
        cards = ds.map((d) => fcard(n, d));
        lines.push(`Même numérateur ${m(String(n))} : on prend ${n} parts à chaque fois ; plus le dénominateur est **grand**, plus les parts sont **petites**.`);
        lines.push(`Dénominateurs : ${m([...ds].sort((x, y) => (dir === 'asc' ? y - x : x - y)).join(dir === 'asc' ? ' > ' : ' < '))}, donc ${m(chainTex(cards, dir))}.`);
        // erreur typique : ranger selon les dénominateurs comme des entiers
        const byDen = [...cards].sort((x, y) => (dir === 'asc' ? x.d - y.d : y.d - x.d)).map((c) => c.v);
        mk.push([byDen, 'Avec le même numérateur, c’est l’inverse des dénominateurs : plus le dénominateur est grand, plus les parts sont petites.']);
      }
    } else if (level === 2) {
      const nC = rng.chance(0.6) ? 5 : 4;
      for (;;) {
        L = rng.pick([6, 8, 9, 10, 12, 12, 14, 15, 16, 18, 20, 24]);
        const divs = [...Array(L - 1).keys()].map((k) => k + 2).filter((d) => L % d === 0 && d < L);
        const dens = [L, ...sample(rng, divs, Math.min(divs.length, rng.int(1, 2)))];
        while (dens.length < nC) dens.push(rng.pick(dens));
        const used = new Set<number>();
        cards = [];
        for (const d of rng.shuffle(dens)) {
          let n = 0, t = 0;
          do { n = rng.int(1, 2 * d - 1); t++; } while ((n % d === 0 || used.has((n * L) / d) || gcd(n, d) !== 1) && t < 30);
          if (t >= 30) break;
          used.add((n * L) / d);
          cards.push(fcard(n, d));
        }
        if (cards.length !== nC) continue;
        const sorted = ranked(cards, dir);
        const byNum = [...cards].sort((x, y) => (dir === 'asc' ? x.n - y.n || x.d - y.d : y.n - x.n || y.d - x.d)).map((c) => c.v);
        if (!cards.some((c) => c.n > c.d) || !cards.some((c) => c.n < c.d)) continue;
        if (byNum.every((v, k) => eq(v, sorted[k]))) continue;
        mk.push([byNum, 'Tu as rangé selon les numérateurs seulement : les parts n’ont pas la même taille. Mets d’abord toutes les fractions au même dénominateur.']);
        break;
      }
      lines.push(`${m(String(L))} est un multiple de chaque dénominateur : on écrit toutes les fractions sur ${m(String(L))}.`);
      lines.push(...cards.filter((c) => c.d !== L).map((c) => m(`${c.tex} = ${fr(c.n * (L / c.d), L)}`)));
      lines.push(`On compare les numérateurs : ${m(ranked(cards, dir).map((v) => String((v.n * L) / v.d)).join(dir === 'asc' ? ' < ' : ' > '))}.`);
      lines.push(`Donc ${m(chainTex(cards, dir))}. Celles qui dépassent ${m('1')} (numérateur plus grand que le dénominateur) sont bien du côté des plus grandes.`);
    } else {
      const nC = rng.chance(0.5) ? 5 : 6;
      const DECS: [number, number][] = [[0.5, 1], [0.25, 2], [0.75, 2], [0.2, 1], [0.4, 1], [0.6, 1], [0.8, 1], [1.2, 1], [1.5, 1], [1.25, 2], [1.75, 2], [2.5, 1], [0.125, 3], [0.375, 3]];
      for (;;) {
        cards = [];
        const dx = rng.pick(DECS);
        const dc = dcard(rng.chance(0.35) ? -dx[0] : dx[0], dx[1]);
        cards.push(dc);
        const nNeg = rng.int(1, 2) - (dc.n < 0 ? 1 : 0);
        const pool = [2, 3, 4, 5, 6, 8, 9, 10, 12];
        while (cards.length < nC) {
          const d = rng.pick(pool), nn = rng.int(1, 2 * d - 1);
          if (gcd(nn, d) !== 1) continue;
          const neg = cards.filter((c) => c.n < 0).length < (dc.n < 0 ? 1 : 0) + nNeg;
          cards.push(fcard(neg ? -nn : nn, d));
        }
        // ex aequo voulu (une fois sur trois) : la même valeur écrite autrement
        if (rng.chance(0.35)) {
          const src = rng.pick(cards.slice(1, -1));
          const k = rng.pick([2, 3]);
          if (src.d * k <= 24) cards[cards.length - 1] = fcard(src.n * k, src.d * k);
        }
        L = cards.reduce((acc, c) => lcm(acc, c.d), 1);
        if (L > 60) continue;
        // valeurs : au plus une paire égale, et elle doit être écrite différemment
        const ties = cards.flatMap((c, i) => cards.slice(i + 1).filter((e) => eq(e.v, c.v)).map((e) => [c, e]));
        if (ties.length > 1 || ties.some(([x, y]) => x.tex === y.tex)) continue;
        if (new Set(cards.map((c) => c.tex)).size !== nC) continue;
        if (!cards.some((c) => c.n > 0 && c.n > c.d) && rng.chance(0.7)) continue;
        break;
      }
      const negs = cards.filter((c) => c.n < 0);
      const decs = cards.filter((c) => c.dec);
      if (decs.length) lines.push(`Écriture décimale en fraction (on lit des ${RANG[decs[0].k!]}) : ${decs.map((c) => m(`${c.tex} = ${fr(Math.round((c.n * 10 ** c.k!) / c.d), 10 ** c.k!)} = ${fr(c.n, c.d)}`)).join(' ; ')}`);
      lines.push(`Dénominateur commun ${m(String(L))} :`, ...cards.map((c) => m(`${c.dec ? `${c.tex} = ${fr(c.n, c.d)}` : c.tex} = ${fr((c.n * L) / c.d, L)}`)));
      if (negs.length) lines.push(`Les négatifs sont plus petits que les positifs${negs.length > 1 ? ' ; entre deux négatifs, le plus loin de zéro est le plus petit' : ''}.`);
      const rk = ranked(cards, dir);
      lines.push(`On range les numérateurs : ${m(rk.map((v, k) => (k === 0 ? '' : eq(rk[k - 1], v) ? ' = ' : dir === 'asc' ? ' < ' : ' > ') + String((v.n * L) / v.d)).join(''))}.`);
      lines.push(`Donc ${m(chainTex(cards, dir))}.`);
      // erreur typique : négatifs rangés selon leur distance à zéro
      if (negs.length > 1) {
        const s = dir === 'asc' ? 1 : -1;
        const key = (c: FC) => (c.n < 0 ? -10 + Math.abs(toNum(c.v)) / 100 : toNum(c.v));
        const byDist = [...cards].sort((x, y) => s * (key(x) - key(y))).map((c) => c.v);
        mk.push([byDist, 'Entre deux négatifs, c’est le plus **loin** de zéro qui est le plus petit (pense à la droite graduée).']);
      }
    }
    mk[0] = [rev(cards), `C’est l’ordre ${dir === 'asc' ? '**décroissant**' : '**croissant**'} : on demande l’ordre ${DIRW(dir)}.`];
    const tie = level === 3;
    const hint = level === 1
      ? kind === 'sameDen' ? 'Même dénominateur : les parts ont la même taille ; compare les numérateurs.' : 'Même numérateur : plus le dénominateur est grand, plus les parts sont petites.'
      : `Écris toutes les fractions avec le dénominateur ${m(String(L))}${level === 3 ? ' (et l’écriture décimale en fraction)' : ''}, puis compare les numérateurs.`;
    const step = orderStep(rng, { cards, dir, hint, why: (a, b) => whyPair(a as FC, b as FC), mistakes: mk });
    return {
      title: `Range ces nombres dans l’ordre ${DIRW(dir)}.`,
      form: `Fais glisser les cartes (ou utilise ↑ ↓).${tie ? ' Si deux nombres sont égaux, leur ordre entre eux n’a pas d’importance.' : ''}`,
      steps: [step],
      solution: lines,
      answer: m(chainTex(cards, dir)),
      key: `${dir}|${cards.map((c) => c.tex).sort().join(';')}`,
      data: { kind: 'js', items: ranked(cards, dir).map((v, i) => ({ what: `rang ${i + 1}`, js: `[${cards.map((c) => (c.dec ? c.tex.replace('{,}', '.') : `${c.n}/${c.d}`)).join(',')}].sort((a,b)=>${dir === 'asc' ? 'a-b' : 'b-a'})[${i}]`, expect: toNum(v) })) },
    };
  },
};

// ===================================================================== écritures
const dec = (v: Q) => {
  const x = toNum(v);
  let k = 0;
  while (Math.abs(Math.round(x * 10 ** k) - x * 10 ** k) > 1e-9 && k < 6) k++;
  return x.toFixed(k).replace('.', '{,}');
};
export const ecritures: Generator = {
  id: 'ecritures',
  title: 'Fraction, décimal, pourcentage',
  desc: 'Changer d’écriture ; arrondi ; rationnel ou non (★★).',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{3}{8} = 0{,}375 = 37{,}5\\,\\%',
  course: LINKS.s81,
  links: [LINKS.s83],
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [], ans: Rich[] = [];
    // a) fraction → décimal (dénominateur 2^i 5^j)
    {
      const d = rng.pick(level === 1 ? [2, 4, 5, 8, 10, 20, 25] : [8, 16, 20, 25, 40, 50, 125]);
      let n: number;
      do n = rng.int(1, 2 * d); while (gcd(n, d) !== 1);
      const v = q(n, d);
      steps.push({ prompt: `a) Écriture décimale de ${m(fr(n, d))}.`, answer: { kind: 'num', fields: [{ label: m(`${fr(n, d)} =`), expect: v, form: 'decimal', shown: dec(v) }] }, hint: `${m(fr(n, d))}, c’est ${m(`${n} \\div ${d}`)}.`,
        mistakes: mist(v, [[q(d, n), 'C’est l’inverse : on divise le numérateur par le dénominateur.']]) });
      const k = d === 8 || d === 40 ? 1000 / d : d === 16 ? 10000 / d : d === 125 ? 8 : 100 / d;
      const base = d === 16 ? 10000 : d === 8 || d === 40 || d === 125 ? 1000 : 100;
      sol.push(`a) ${m(`${fr(n, d)} = ${fr(n * k, base)} = ${dec(v)}`)} (on multiplie par ${m(String(k))} pour obtenir un dénominateur ${m(String(base))}) ; ou ${m(`${n} \\div ${d} = ${dec(v)}`)}.`);
      items.push({ what: 'a', js: `${n}/${d}`, expect: n / d });
      ans.push(m(`${fr(n, d)} = ${dec(v)}`));
    }
    // b) décimal → fraction irréductible
    {
      let v: Q;
      do v = level === 1 ? q(rng.int(1, 30) * 5, 100) : q(rng.int(101, 399), 100);
      while (isInt(v) || v.d === 1 || (level === 1 && v.d === 10 && rng.chance(0.3)));
      const t = dec(v), p = Math.round(toNum(v) * 10 ** (t.split('{,}')[1]?.length ?? 0)), base = 10 ** (t.split('{,}')[1]?.length ?? 0);
      steps.push({ prompt: `b) Écris ${m(t)} sous forme de fraction irréductible.`, answer: { kind: 'num', fields: [irr(m(`${t} =`), v)] }, hint: `Lis le nombre : « ${p} ${base === 10 ? 'dixièmes' : 'centièmes'} », puis simplifie.`,
        mistakes: mist(v, [[q(p, 10 * base), `Le dernier chiffre est celui des ${base === 10 ? 'dixièmes' : 'centièmes'} : le dénominateur est ${m(String(base))}.`]]) });
      sol.push(`b) ${m(`${t} = ${fr(p, base)}${gcd(p, base) > 1 ? ` = ${fq(v)}` : ''}`)}${gcd(p, base) > 1 ? ` (on divise par ${m(String(gcd(p, base)))})` : ' : déjà irréductible'}.`);
      items.push({ what: 'b', js: `${toNum(v)}`, expect: toNum(v) });
      ans.push(m(`${t} = ${fq(v)}`));
    }
    // c) pourcentage → fraction irréductible, ou fraction → pourcentage
    if (rng.chance(0.5) || level === 2) {
      let p: number;
      do p = rng.pick([4, 5, 8, 12, 15, 16, 24, 25, 28, 30, 35, 36, 40, 44, 45, 48, 55, 60, 64, 65, 70, 72, 75, 80, 84, 85, 88, 95]); while (false);
      const v = q(p, 100);
      steps.push({ prompt: `c) Écris ${m(`${p}\\,\\%`)} sous forme de fraction irréductible.`, answer: { kind: 'num', fields: [irr(m(`${p}\\,\\% =`), v)] }, hint: `${m(`p\\,\\% = \\dfrac{p}{100}`)}, puis simplifie.`,
        mistakes: mist(v, [[q(p, 10), `${m('\\%')} signifie « sur ${m('100')} ».`]]) });
      sol.push(`c) ${m(`${p}\\,\\% = ${fr(p, 100)} = ${fq(v)}`)} (on divise par ${m(String(gcd(p, 100)))}).`);
      items.push({ what: 'c', js: `${p}/100`, expect: p / 100 });
      ans.push(m(`${p}\\,\\% = ${fq(v)}`));
    } else {
      const d = rng.pick([2, 4, 5, 10, 20, 25, 50]);
      let n: number;
      do n = rng.int(1, d - 1); while (gcd(n, d) !== 1);
      const p = (n * 100) / d;
      steps.push({ prompt: `c) Écris ${m(fr(n, d))} sous forme de pourcentage.`, answer: { kind: 'num', fields: [{ label: m(`${fr(n, d)} =`), expect: q(p), form: 'any', unit: '%' }] }, hint: `Écris la fraction avec le dénominateur ${m('100')}.`,
        mistakes: mist(q(p), [[q(n), 'Le pourcentage, c’est le numérateur sur **100**, pas sur ' + m(String(d)) + '.']]) });
      sol.push(`c) ${m(`${fr(n, d)} = ${fr(p, 100)} = ${p}\\,\\%`)} (on multiplie par ${m(String(100 / d))}).`);
      items.push({ what: 'c', js: `${n}/${d}*100`, expect: p });
      ans.push(m(`${fr(n, d)} = ${p}\\,\\%`));
    }
    if (level === 2) {
      // d) arrondi au millième d'une fraction à écriture décimale illimitée
      const d = rng.pick([3, 6, 7, 9, 11, 12, 13, 15]);
      let n: number;
      do n = rng.int(1, 2 * d); while (gcd(n, d) !== 1 || decimalDen(d));
      const x = n / d, r = Math.round(x * 1000) / 1000;
      steps.push({ prompt: `d) Valeur de ${m(fr(n, d))} arrondie au millième.`, answer: { kind: 'num', fields: [{ label: m(`${fr(n, d)} \\approx`), expect: q(Math.round(x * 1000), 1000), form: 'any', approx: { value: x, tol: 0.0005, dp: 3 } }] }, hint: `Calcule ${m(`${n} \\div ${d}`)} jusqu’à la quatrième décimale, puis arrondis.`,
        mistakes: mist(q(Math.round(x * 1000), 1000), [[q(Math.floor(x * 1000), 1000), 'C’est la troncature : regarde la quatrième décimale pour arrondir.']]) });
      sol.push(`d) ${m(`${n} \\div ${d} = ${x.toFixed(5).replace('.', '{,}')}\\ldots`)} : la division ne s’arrête pas ; arrondi au millième : ${m(r.toFixed(3).replace('.', '{,}'))}.`);
      items.push({ what: 'd', js: `${n}/${d}`, expect: x });
      ans.push(m(`${fr(n, d)} \\approx ${r.toFixed(3).replace('.', '{,}')}`));
      // e) rationnel ou non
      const irrs: [string, string][] = [['\\sqrt{2}', 'aucune fraction d’entiers ne lui est égale (on l’admet au collège)'], ['\\pi', 'aucune fraction d’entiers ne lui est égale (on l’admet au collège)'], ['\\dfrac{\\sqrt{2}}{2}', 'c’est un quotient, mais pas de deux **entiers** ($\\sqrt{2}$ n’est pas rationnel)'], ['\\sqrt{3}', '$3$ n’est pas le carré d’un entier : $\\sqrt{3}$ n’est pas rationnel (admis)'], ['\\sqrt{5}', '$5$ n’est pas le carré d’un entier : $\\sqrt{5}$ n’est pas rationnel (admis)']];
      const rats: [string, string][] = [['0{,}333\\ldots', '$0{,}333\\ldots = \\dfrac{1}{3}$'], ['\\sqrt{16}', '$\\sqrt{16} = 4 = \\dfrac{4}{1}$'], ['-\\dfrac{7}{3}', '$-\\dfrac{7}{3} = \\dfrac{-7}{3}$ est un quotient d’entiers'], ['2{,}75', '$2{,}75 = \\dfrac{11}{4}$'], ['\\sqrt{\\dfrac{9}{4}}', '$\\sqrt{\\dfrac{9}{4}} = \\dfrac{3}{2}$'], ['-5', '$-5 = \\dfrac{-5}{1}$'], ['\\dfrac{\\sqrt{36}}{5}', '$\\dfrac{\\sqrt{36}}{5} = \\dfrac{6}{5}$']];
      const [good, gw] = rng.pick(irrs);
      const bad = sample(rng, rats, 3);
      steps.push({ prompt: 'e) Lequel de ces nombres n’est **pas** rationnel ?', answer: shuffledChoice(rng, m(good), bad.map(([t, w]) => [m(t), `Ce nombre est rationnel : ${w}.`] as [Rich, Rich])), hint: 'Un rationnel peut s’écrire comme le quotient de deux **entiers**. Simplifie les racines quand c’est possible.' });
      sol.push(`e) ${m(good)} n’est pas rationnel : ${gw}. Les autres le sont : ${bad.map(([, w]) => w).join(' ; ')}.`);
      ans.push(`${m(good)} non rationnel`);
    }
    return {
      title: 'Change d’écriture.',
      steps,
      solution: sol,
      answer: ans.join(' ; '),
      key: steps.map((s) => s.prompt).join('|'),
      data: { kind: 'js', items },
    };
  },
};
void eq; void cmp;
