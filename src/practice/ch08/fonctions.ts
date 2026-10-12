/** Chapitre 08 : image, antécédent, vocabulaire, lecture graphique, point sur la courbe, linéaire, affine, problèmes, erreurs. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, numStep, fixedChoice, shuffledChoice, NAMES } from '../engine/build';
import { LINKS, m, dq, pq, affTex, quadTex, js, repere, q, add, mul, sub, div, neg, eq, toNum, isInt, type Q } from './common';

type Item = { what: string; js: string; expect: number; tol?: number };
const FN = ['f', 'g', 'h'];
const nz = (rng: Rng, a: number, b: number) => { let v = 0; while (v === 0) v = rng.int(a, b); return v; };

// ===================================================================== image
export const image: Generator = {
  id: 'image', title: 'Calculer une image', stars: 1, levels: [1, 2], course: LINKS.s12, links: [LINKS.s11],
  desc: 'Remplacer x par le nombre, entre parenthèses ; ★★ : fonctions du second degré et nombres négatifs (piège −3²).',
  example: 'f(-2) = (-2)^2 - 3 = 1',
  generate(rng: Rng, level: Level) {
    const f = rng.pick(FN);
    const steps: Step[] = [], items: Item[] = [], sol: Rich[] = [];
    let def: string, key: string;
    if (level === 1) {
      const a = q(nz(rng, -6, 6)), b = q(nz(rng, -9, 9));
      def = affTex(a, b);
      const xs = rng.shuffle([rng.int(2, 9), -rng.int(1, 8), 0]).slice(0, 2);
      if (rng.chance(0.4)) xs.push(rng.pick([0.5, 1.5, -0.5, 2.5]));
      xs.forEach((x0, i) => {
        const x = q(Math.round(x0 * 2), 2), v = add(mul(a, x), b);
        steps.push(numStep(`${'abc'[i]}) Calcule ${m(`${f}(${dq(x)})`)}.`, m(`${f}(${dq(x)}) =`), v, `Remplace ${m('x')} par ${m(pq(x))}.`, [[sub(mul(a, x), b), 'Attention au signe de b.'], [add(mul(a, neg(x)), b), 'Attention au signe du nombre remplacé : mets-le entre parenthèses.'], [Math.abs(a.n) === 1 ? null : add(add(a, x), b), `${m(`${affTex(a, q(0))}`)} veut dire ${m(`${dq(a)} \\times x`)}.`]]));
        sol.push(`${m(`${f}(${dq(x)}) = ${dq(a)} \\times ${pq(x)} ${b.n < 0 ? '-' : '+'} ${dq(b.n < 0 ? neg(b) : b)} = ${dq(v)}`)}`);
        items.push({ what: `v${i}`, js: `${js(a)}*${js(x)}+${js(b)}`, expect: toNum(v) });
      });
      key = `${def}:${xs}`;
    } else {
      const a = q(rng.pick([1, 1, 2, -1, 3, -2])), bb = q(rng.int(-5, 5)), c = q(rng.int(-9, 9));
      def = quadTex(a, bb, c);
      const xs = rng.shuffle([-rng.int(1, 3), rng.int(1, 5), -rng.int(4, 6)]).slice(0, 2);
      xs.forEach((x0, i) => {
        const x = q(x0), v = add(add(mul(a, mul(x, x)), mul(bb, x)), c);
        const wrongSq = add(add(mul(a, neg(mul(x, x))), mul(bb, x)), c);
        steps.push(numStep(`${'ab'[i]}) Calcule ${m(`${f}(${dq(x)})`)}.`, m(`${f}(${dq(x)}) =`), v, `Remplace ${m('x')} par ${m(pq(x))} : ${m(`${pq(x)}^2 = ${dq(mul(x, x))}`)}.`, [[x.n < 0 ? wrongSq : null, `${m(`-${Math.abs(x.n)}^2 = -${x.n * x.n}`)}, mais ${m(`(${dq(x)})^2 = ${x.n * x.n}`)} : il faut les parenthèses.`], [add(add(mul(a, mul(x, q(2))), mul(bb, x)), c), `${m('x^2')} c’est ${m('x \\times x')}, pas ${m('2x')}.`]]));
        const sq = `${pq(x)}^2`;
        const t1 = eq(a, q(1)) ? sq : eq(a, q(-1)) ? `-${sq}` : `${dq(a)} \\times ${sq}`;
        const t2 = bb.n ? ` ${bb.n < 0 ? '-' : '+'} ${Math.abs(bb.n) === 1 ? '' : `${Math.abs(bb.n)} \\times `}${pq(x)}` : '';
        sol.push(`${m(`${f}(${dq(x)}) = ${t1}${t2}${c.n ? ` ${c.n < 0 ? '-' : '+'} ${Math.abs(c.n)}` : ''} = ${dq(v)}`)}`);
        items.push({ what: `v${i}`, js: `${js(a)}*(${x.n})**2+${js(bb)}*(${x.n})+${js(c)}`, expect: toNum(v) });
      });
      key = `${def}:${xs}`;
    }
    return { title: `Calcule des images par ${m(f)}.`, statement: `Soit ${m(`${f}(x) = ${def}`)}.`, steps, solution: sol, answer: sol.join(' ; '), key, data: { kind: 'js', items } };
  },
};

// ===================================================================== antécédent
export const antecedent: Generator = {
  id: 'antecedent', title: 'Chercher un antécédent', stars: 1, levels: [1, 2], course: LINKS.s12,
  desc: 'Résoudre f(x) = b ; ★★ : avec x², zéro, un ou deux antécédents (ou aucun).',
  example: '3x - 5 = 4 \\iff x = 3',
  generate(rng: Rng, level: Level) {
    const f = rng.pick(FN);
    if (level === 1) {
      const a = q(nz(rng, -6, 6)), b = q(nz(rng, -12, 12)), x = q(rng.int(-8, 9)), y = add(mul(a, x), b);
      const steps: Step[] = [
        { prompt: `a) Chercher un antécédent de ${m(dq(y))}, c’est…`, answer: shuffledChoice(rng, `résoudre ${m(`${affTex(a, b)} = ${dq(y)}`)}`, [[`calculer ${m(`${f}(${dq(y)})`)}`, 'Ça, c’est l’image de ce nombre.'], [`calculer ${m(`${dq(y)} \\times ${pq(a)}`)}`, 'On cherche le nombre de départ x tel que f(x) vaut ce nombre.']]), hint: 'L’antécédent est ce qui entre dans la machine.' },
        numStep(`b) Trouve l’antécédent de ${m(dq(y))} par ${m(f)}.`, m('x ='), x, 'Résous l’équation (chapitre 7).', [[add(mul(a, y), b), `Ça, c’est ${m(`${f}(${dq(y)})`)}, l’image de ${m(dq(y))}.`], [div(add(y, b), a), `On ${b.n > 0 ? 'soustrait' : 'ajoute'} ${m(dq(b.n > 0 ? b : neg(b)))} des deux côtés.`]]),
      ];
      const sol = [`On résout ${m(`${affTex(a, b)} = ${dq(y)}`)} : ${m(`${affTex(a, q(0))} = ${dq(sub(y, b))}`)}, donc ${m(`x = ${dq(x)}`)}.`, `Contrôle : ${m(`${f}(${dq(x)}) = ${dq(y)}`)}.`];
      return { title: `Antécédent par ${m(f)}.`, statement: `Soit ${m(`${f}(x) = ${affTex(a, b)}`)}.`, steps, solution: sol, answer: m(`x = ${dq(x)}`), key: `${affTex(a, b)}:${dq(y)}`, data: { kind: 'js', items: [{ what: 'x', js: `(${js(y)}-${js(b)})/${js(a)}`, expect: toNum(x) }] } };
    }
    // x² + c = y
    const c = rng.int(-9, 9), kind = rng.pick(['deux', 'deux', 'un', 'aucun'] as const);
    const r = rng.int(1, 9);
    const y = kind === 'deux' ? r * r + c : kind === 'un' ? c : c - rng.int(1, 6);
    const def = quadTex(q(1), q(0), q(c));
    const n = kind === 'deux' ? 2 : kind === 'un' ? 1 : 0;
    const steps: Step[] = [
      { prompt: `a) Combien ${m(dq(q(y)))} a-t-il d’antécédents par ${m(f)} ?`, answer: fixedChoice(['Aucun', 'Un seul', 'Deux'], n, ['', '', ''].map((_, i) => (i === n ? null : n === 0 ? `${m(`x^2 = ${y - c}`)} : un carré n’est jamais négatif.` : n === 1 ? `${m('x^2 = 0')} a une seule solution : 0.` : `${m(`x^2 = ${y - c}`)} : ${m(String(r))} et ${m(String(-r))} conviennent.`))), hint: `Résous ${m(`x^2 ${c ? (c < 0 ? `- ${-c}` : `+ ${c}`) : ''} = ${y}`)}, soit ${m(`x^2 = ${y - c}`)}.` },
    ];
    if (n === 2) steps.push(numStep('b) Donne l’antécédent positif.', m('x ='), q(r), `${m(`x^2 = ${r * r}`)}.`, [[q(r * r), 'C’est x², pas x.'], [r % 2 === 0 ? q((r * r) / 2) : null, 'La racine carrée n’est pas la moitié.']]));
    const sol = [`On résout ${m(`x^2 ${c ? (c < 0 ? `- ${-c}` : `+ ${c}`) : ''} = ${y}`)}, soit ${m(`x^2 = ${y - c}`)}.`, n === 2 ? `Deux solutions : ${m(String(r))} et ${m(String(-r))}. Le nombre ${m(String(y))} a deux antécédents.` : n === 1 ? `Seul ${m('0')} convient : un seul antécédent.` : `Un carré n’est jamais négatif : ${m(String(y))} n’a aucun antécédent.`];
    const items: Item[] = [{ what: 'step:0', js: String(n), expect: n }];
    if (n === 2) items.push({ what: 'r', js: `Math.sqrt(${y}-(${c}))`, expect: r });
    return { title: `Antécédents par ${m(f)}.`, statement: `Soit ${m(`${f}(x) = ${def}`)}.`, steps, solution: sol, answer: n === 2 ? m(`${r} \\text{ et } ${-r}`) : n === 1 ? m('0') : 'aucun', key: `${c}:${y}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== vocabulaire
export const vocabulaire: Generator = {
  id: 'vocabulaire', title: 'Image, antécédent : notations', stars: 1, levels: [1], course: LINKS.s11,
  desc: 'Traduire « l’image de 2 est 7 » par f(2) = 7, et l’inverse ; ne pas confondre image et antécédent.',
  example: 'f(2) = 7',
  generate(rng: Rng) {
    const f = rng.pick(FN);
    let a: number, b: number;
    do { a = rng.int(-9, 9); b = rng.int(-9, 9); } while (a === b);
    const forms: [Rich, number][] = [[`l’image de ${m(String(a))} par ${m(f)} est ${m(String(b))}`, 0], [`${m(String(a))} a pour image ${m(String(b))} par ${m(f)}`, 0], [`un antécédent de ${m(String(b))} par ${m(f)} est ${m(String(a))}`, 0]];
    const [ph] = rng.pick(forms);
    const steps: Step[] = [
      { prompt: `a) « ${ph} » s’écrit :`, answer: shuffledChoice(rng, m(`${f}(${a}) = ${b}`), [[m(`${f}(${b}) = ${a}`), 'Image et antécédent inversés : le nombre de départ va entre parenthèses.'], [m(`${f} \\times ${a} = ${b}`), `${m(`${f}(${a})`)} n’est pas un produit.`]]), hint: 'Entre parenthèses : le nombre de départ (l’antécédent).' },
    ];
    let c: number, d: number;
    do { c = rng.int(-9, 9); d = rng.int(-9, 9); } while (c === d);
    steps.push({ prompt: `b) ${m(`${f}(${c}) = ${d}`)} signifie :`, answer: shuffledChoice(rng, `l’image de ${m(String(c))} est ${m(String(d))}`, [[`l’image de ${m(String(d))} est ${m(String(c))}`, 'Le nombre entre parenthèses est le nombre de départ.'], [`${m(String(d))} est un antécédent de ${m(String(c))}`, 'C’est l’inverse : c’est ' + m(String(c)) + ' l’antécédent.']]), hint: 'Image = ce qui sort.' });
    return { title: 'Traduis.', steps, solution: [`a) ${m(`${f}(${a}) = ${b}`)} : ${m(String(a))} est l’antécédent, ${m(String(b))} l’image.`, `b) L’image de ${m(String(c))} par ${m(f)} est ${m(String(d))} (ou : ${m(String(c))} est un antécédent de ${m(String(d))}).`], answer: m(`${f}(${a}) = ${b}`), key: `${f}${a},${b},${c},${d}`, data: { kind: 'js', items: [] } };
  },
};

// ===================================================================== lecture graphique
export const lecture: Generator = {
  id: 'lecture', title: 'Lecture graphique', stars: 2, levels: [2], course: LINKS.s22,
  desc: 'Image : partir de l’axe horizontal ; antécédents : partir de l’axe vertical, tous les points d’intersection.',
  example: 'f(2) = -1{,}5',
  generate(rng: Rng) {
    // parabole k(x − h)² + c, nœuds entiers
    const k = rng.pick([1, -1, 0.5, -0.5]), h = rng.int(-2, 2), c = k > 0 ? rng.int(-4, 0) : rng.int(0, 4);
    const F = (x: number) => k * (x - h) ** 2 + c;
    const d = rng.pick([1, 2, 3].filter((t) => Number.isInteger(k * t * t) && Math.abs(k * t * t) <= 6 && h - t >= -5 && h + t <= 5));
    const x0 = h + rng.pick([-3, -2, -1, 0, 1, 2, 3].filter((e) => Math.abs(k * e * e) <= 6 && Number.isInteger(k * e * e) && Math.abs(e) !== d && h + e >= -5 && h + e <= 5));
    const yb = F(h + d);
    const f = rng.pick(FN);
    const yr: [number, number] = k > 0 ? [Math.min(-1, c - 1), Math.max(c + 7, 3)] : [Math.min(c - 7, -3), Math.max(1, c + 1)];
    const figure = repere({ x: [-6, 6], y: yr, curves: [{ f: F, label: `C${f}` }], aria: `Courbe de la fonction ${f}, en forme de U${k < 0 ? ' renversé' : ''}, sommet (${h} ; ${c})` });
    const yn = k > 0 ? c - rng.int(1, 2) : c + rng.int(1, 2);
    const steps: Step[] = [
      numStep(`a) Lis l’image de ${m(String(x0))} par ${m(f)}.`, m(`${f}(${x0}) =`), q(F(x0) * 2, 2), `Pars de ${m(String(x0))} sur l’axe **horizontal**, va jusqu’à la courbe, lis l’ordonnée.`, [[q(F(-x0) * 2, 2), 'Tu as lu sur l’autre branche : vérifie l’abscisse.']]),
      { prompt: `b) Combien ${m(String(yb))} a-t-il d’antécédents par ${m(f)} ?`, answer: fixedChoice(['Aucun', 'Un', 'Deux'], 2, ['La droite horizontale coupe la courbe.', 'Regarde les deux branches.']), hint: `Trace la droite horizontale d’ordonnée ${m(String(yb))}.` },
      { prompt: `c) Quels sont ces antécédents ?`, answer: shuffledChoice(rng, m(`${h - d} \\text{ et } ${h + d}`), [[m(`${dq(q(F(yb) * 2 || 1, 2))}`), 'Tu as lu une image : les antécédents se lisent sur l’axe horizontal.'], [m(`${h - d - 1} \\text{ et } ${h + d + 1}`), 'Relis les abscisses des points d’intersection.']]), hint: 'Lis les abscisses des points d’intersection.' },
      { prompt: `d) Le nombre ${m(String(yn))} a-t-il des antécédents ?`, answer: fixedChoice(['Oui', 'Non'], 1, ['La droite horizontale d’ordonnée ' + yn + ' ne coupe pas la courbe.']), hint: 'La droite horizontale coupe-t-elle la courbe ?' },
    ];
    return { title: `Lis sur la courbe de ${m(f)}.`, statement: `On a tracé la courbe représentative de ${m(f)}.`, figure, steps, solution: [`a) ${m(`${f}(${x0}) = ${dq(q(F(x0) * 2, 2))}`)}.`, `b) et c) La droite d’ordonnée ${m(String(yb))} coupe la courbe en deux points d’abscisses ${m(String(h - d))} et ${m(String(h + d))}.`, `d) Non : la droite d’ordonnée ${m(String(yn))} ne coupe pas la courbe (le ${k > 0 ? 'point le plus bas' : 'point le plus haut'} est à ${m(String(c))}).`], answer: `${m(`${f}(${x0}) = ${dq(q(F(x0) * 2, 2))}`)} ; ${m(`${h - d}`)} et ${m(`${h + d}`)}`, key: `${k}:${h}:${c}:${x0}:${d}:${yn}`, data: { kind: 'js', items: [{ what: 'img', js: `${k}*(${x0}-(${h}))**2+(${c})`, expect: F(x0) }, { what: 'step:1', js: '2', expect: 2 }, { what: 'step:3', js: '1', expect: 1 }] } };
  },
};

// ===================================================================== point sur la courbe
export const point: Generator = {
  id: 'point', title: 'Un point est-il sur la courbe ?', stars: 1, levels: [1, 2], course: LINKS.s21,
  desc: 'M(x ; y) est sur la courbe si et seulement si y = f(x).',
  example: 'f(-2) = 7 \\Rightarrow A(-2\\,;7) \\in \\mathcal{C}',
  generate(rng: Rng, level: Level) {
    const f = rng.pick(FN);
    const a = q(level === 1 ? nz(rng, -4, 4) : rng.pick([1, 2, -1, 3])), b = q(level === 1 ? rng.int(-6, 6) : 0), c = q(rng.int(-6, 6));
    const F = (x: Q) => (level === 1 ? add(mul(a, x), c) : add(mul(a, mul(x, x)), c));
    const def = level === 1 ? affTex(a, c) : quadTex(a, b, c);
    const names = ['A', 'B', 'C'];
    const steps: Step[] = [], sol: Rich[] = [], items: Item[] = [];
    const used = new Set<number>();
    names.forEach((P, i) => {
      let x: number; do { x = rng.int(-4, 4); } while (used.has(x)); used.add(x);
      const X = q(x), Yt = F(X), on = rng.chance(0.5);
      const Y = on ? Yt : level === 2 && x !== 0 && rng.chance(0.5) ? add(mul(a, neg(mul(X, X))), c) : add(Yt, q(rng.pick([-2, -1, 1, 2])));
      const isOn = eq(Y, Yt);
      steps.push({ prompt: `${'abc'[i]}) ${m(`${P}(${dq(X)}\\,;${dq(Y)})`)} est-il sur la courbe de ${m(f)} ?`, answer: fixedChoice(['Oui', 'Non'], isOn ? 0 : 1, [`${m(`${f}(${dq(X)}) = ${dq(Yt)}`)} ≠ ${m(dq(Y))}.`, `${m(`${f}(${dq(X)}) = ${dq(Yt)}`)} : c’est bien l’ordonnée de ${m(P)}.`]), hint: `Calcule ${m(`${f}(${dq(X)})`)} et compare à l’ordonnée.` });
      sol.push(`${m(`${f}(${dq(X)}) = ${dq(Yt)}`)} ${isOn ? `: c’est l’ordonnée de ${m(P)}, donc ${m(P)} est sur la courbe.` : `${m(`\\neq ${dq(Y)}`)} : ${m(P)} n’est pas sur la courbe.`}`);
      items.push({ what: `step:${i}`, js: `(${level === 1 ? `${js(a)}*${x}+${js(c)}` : `${js(a)}*(${x})**2+${js(c)}`})===${toNum(Y)}?0:1`, expect: isOn ? 0 : 1 });
    });
    return { title: 'Points et courbe.', statement: `Soit ${m(`${f}(x) = ${def}`)}.`, steps, solution: sol, answer: sol.map((s) => s.includes('n’est pas') ? 'Non' : 'Oui').join(', '), key: `${def}:${steps.map((s) => s.prompt).join()}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== linéaire
export const lineaire: Generator = {
  id: 'lineaire', title: 'Fonctions linéaires', stars: 1, levels: [1, 2], course: LINKS.s33, links: [LINKS.s31],
  desc: 'Retrouver a = f(x₀)/x₀, calculer une image et un antécédent ; ★★ : hausse ou baisse en pourcentage (coefficient multiplicateur).',
  example: 'f(5) = 20 \\Rightarrow f(x) = 4x',
  generate(rng: Rng, level: Level) {
    const f = rng.pick(FN);
    if (level === 1) {
      const a = q(rng.pick([2, 3, 4, 5, -2, -3, 1.5, 2.5, -0.5, 0.5, 1.2].map((v) => v * 10)), 10);
      let x0: number; do { x0 = nz(rng, -8, 10); } while (Math.abs(x0) === 1);
      const y0 = mul(a, q(x0)), x1 = q(rng.int(-9, 12)), y2 = mul(a, q(rng.int(-12, 15)));
      const ant = div(y2, a);
      const steps = [
        numStep(`a) Calcule le coefficient ${m('a')}.`, m('a ='), a, `${m(`a = ${'\\dfrac'}{${f}(${x0})}{${x0}}`)}.`, [[div(q(x0), y0), 'Le quotient est à l’envers : image divisée par le nombre de départ.'], [sub(y0, q(x0)), 'Linéaire : on divise, on ne soustrait pas.']]),
        numStep(`b) Calcule ${m(`${f}(${dq(x1)})`)}.`, m(`${f}(${dq(x1)}) =`), mul(a, x1), `${m(`${f}(x) = ${affTex(a, q(0))}`)}.`),
        numStep(`c) Trouve l’antécédent de ${m(dq(y2))}.`, m('x ='), ant, `Résous ${m(`${affTex(a, q(0))} = ${dq(y2)}`)}.`, [[mul(a, y2), 'Ça, c’est l’image.']]),
      ];
      const sol = [`${m(`a = \\dfrac{${dq(y0)}}{${x0}} = ${dq(a)}`)}, donc ${m(`${f}(x) = ${affTex(a, q(0))}`)}.`, `${m(`${f}(${dq(x1)}) = ${dq(a)} \\times ${pq(x1)} = ${dq(mul(a, x1))}`)}.`, `${m(`${affTex(a, q(0))} = ${dq(y2)}`)}, donc ${m(`x = ${dq(ant)}`)}.`];
      return { title: `${m(f)} est linéaire et ${m(`${f}(${x0}) = ${dq(y0)}`)}.`, steps, solution: sol, answer: m(`${f}(x) = ${affTex(a, q(0))}`), key: `${dq(a)}:${x0}:${dq(x1)}:${dq(y2)}`, data: { kind: 'js', items: [{ what: 'a', js: `${js(y0)}/${x0}`, expect: toNum(a) }, { what: 'f', js: `${js(a)}*${js(x1)}`, expect: toNum(mul(a, x1)) }, { what: 'x', js: `${js(y2)}/${js(a)}`, expect: toNum(ant) }] } };
    }
    const up = rng.chance(0.5), p = rng.pick([5, 10, 15, 20, 25, 30, 40, 12, 8]);
    const k = q(100 + (up ? p : -p), 100);
    const ctx = rng.pick(up ? ['Le prix d’un abonnement augmente', 'Un loyer augmente', 'Le prix d’un billet augmente'] : ['Un magasin fait une remise', 'Le prix d’un vélo baisse', 'Les soldes affichent une baisse']);
    let old: number, now: number;
    do { old = rng.int(4, 60) * 5; now = rng.int(4, 60) * 5; } while (!isInt(mul(k, q(old))) || !isInt(div(q(now), k)) && toNum(div(q(now), k)) * 100 % 1 !== 0 || old === now);
    const before = div(q(now), k);
    const steps = [
      numStep(`a) Par quel nombre multiplie-t-on le prix ?`, m(`${f}(x) = \\ldots \\times x`), k, `${up ? 'Augmenter' : 'Baisser'} de ${p} % revient à multiplier par ${m(`1 ${up ? '+' : '-'} ${dq(q(p, 100))}`)}.`, [[q(p, 100), 'Ça, c’est le pourcentage seul.'], [q(100 + (up ? -p : p), 100), up ? 'Une hausse : le coefficient est plus grand que 1.' : 'Une baisse : le coefficient est plus petit que 1.']]),
      numStep(`b) Un article coûtait ${m(String(old))} €. Nouveau prix ?`, '', mul(k, q(old)), `${m(`${f}(${old})`)}.`, [], { unit: '€' }),
      numStep(`c) Un article coûte maintenant ${m(String(now))} €. Quel était son prix avant ?`, '', before, `Antécédent : ${m(`${affTex(k, q(0))} = ${now}`)}.`, [[mul(q(now), q(100 + (up ? -p : p), 100)), `On ne ${up ? 'retire' : 'rajoute'} pas ${p} % du nouveau prix : on divise par ${m(dq(k))}.`]], { unit: '€' }),
    ];
    return { title: `${ctx} de ${m(`${p}\\,\\%`)}.`, statement: `On note ${m(`${f}(x)`)} le nouveau prix d’un article qui coûtait ${m('x')} euros.`, steps, solution: [`${m(`${f}(x) = ${affTex(k, q(0))}`)} : fonction linéaire.`, `${m(`${f}(${old}) = ${dq(k)} \\times ${old} = ${dq(mul(k, q(old)))}`)} €.`, `${m(`${affTex(k, q(0))} = ${now}`)}, donc ${m(`x = ${now} \\div ${dq(k)} = ${dq(before)}`)} €.`], answer: `${m(`${f}(x) = ${affTex(k, q(0))}`)} ; ${m(dq(mul(k, q(old))))} € ; ${m(dq(before))} €`, key: `${up}${p}:${old}:${now}`, data: { kind: 'js', items: [{ what: 'k', js: `1${up ? '+' : '-'}${p}/100`, expect: toNum(k) }, { what: 'b', js: `${old}*(1${up ? '+' : '-'}${p}/100)`, expect: toNum(mul(k, q(old))) }, { what: 'c', js: `${now}/(1${up ? '+' : '-'}${p}/100)`, expect: toNum(before) }] } };
  },
};

// ===================================================================== affine
export const affine: Generator = {
  id: 'affine', title: 'Fonctions affines', stars: 1, levels: [1, 2], course: LINKS.s44, links: [LINKS.s42],
  desc: '★ : a, b et la droite (monte/descend, ordonnée à l’origine) ; ★★ : retrouver f(x) = ax + b à partir de deux images.',
  example: 'a = \\dfrac{13 - 7}{5 - 2} = 2',
  generate(rng: Rng, level: Level) {
    const f = rng.pick(FN);
    const a = q(rng.pick([1, 2, 3, -1, -2, -3, 0.5, -0.5, 1.5, 4, -4].map((v) => v * 2)), 2), b = q(nz(rng, -8, 8));
    if (level === 1) {
      const swap = rng.chance(0.4);
      const tex = swap ? `${dq(b)} ${a.n < 0 ? '-' : '+'} ${eq(a, q(1)) || eq(a, q(-1)) ? '' : dq(a.n < 0 ? neg(a) : a)}x` : affTex(a, b);
      const x = q(rng.int(-5, 6));
      const steps: Step[] = [
        { prompt: `a) Coefficient directeur et ordonnée à l’origine ?`, answer: { kind: 'num', fields: [{ label: m('a ='), expect: a, form: 'any' }, { label: m('b ='), expect: b, form: 'any' }] }, hint: `Écris ${m(`${f}(x)`)} sous la forme ${m('ax + b')}.`, mistakes: [...(eq(a, b) ? [] : [{ on: 'numAll' as const, values: [b, a], msg: '' + 'a multiplie x, b est le nombre seul.' }])] },
        { prompt: 'b) La droite qui représente ' + m(f) + '…', answer: fixedChoice(['monte', 'descend'], a.n > 0 ? 0 : 1, ['a est négatif : elle descend.', 'a est positif : elle monte.']), hint: 'Regarde le signe de a.' },
        numStep(`c) Elle coupe l’axe vertical au point d’ordonnée…`, '', b, `C’est ${m(`${f}(0)`)}.`, [[a, 'C’est b, pas a.']]),
        numStep(`d) Calcule ${m(`${f}(${dq(x)})`)}.`, m(`${f}(${dq(x)}) =`), add(mul(a, x), b), 'Remplace x.'),
      ];
      return { title: `Soit ${m(`${f}(x) = ${tex}`)}.`, steps, solution: [`${m(`${f}(x) = ${affTex(a, b)}`)} : ${m(`a = ${dq(a)}`)} et ${m(`b = ${dq(b)}`)}.`, `${m(`a ${a.n > 0 ? '> 0' : '< 0'}`)} : la droite ${a.n > 0 ? 'monte' : 'descend'} ; elle coupe l’axe vertical en ${m(`(0\\,;${dq(b)})`)}.`, `${m(`${f}(${dq(x)}) = ${dq(a)} \\times ${pq(x)} ${b.n < 0 ? '-' : '+'} ${dq(b.n < 0 ? neg(b) : b)} = ${dq(add(mul(a, x), b))}`)}.`], answer: `${m(`a = ${dq(a)}`)}, ${m(`b = ${dq(b)}`)}`, key: `${tex}:${dq(x)}`, data: { kind: 'js', items: [{ what: 'a', js: js(a), expect: toNum(a) }, { what: 'b', js: js(b), expect: toNum(b) }, { what: 'step:1', js: a.n > 0 ? '0' : '1', expect: a.n > 0 ? 0 : 1 }, { what: 'c', js: js(b), expect: toNum(b) }, { what: 'd', js: `${js(a)}*${js(x)}+${js(b)}`, expect: toNum(add(mul(a, x), b)) }] } };
    }
    let x1: number, x2: number; do { x1 = rng.int(-4, 5); x2 = rng.int(-3, 9); } while (x1 >= x2);
    const y1 = add(mul(a, q(x1)), b), y2 = add(mul(a, q(x2)), b);
    const graph = rng.chance(0.35) && isInt(y1) && isInt(y2) && Math.abs(toNum(y1)) <= 8 && Math.abs(toNum(y2)) <= 8 && Math.abs(toNum(b)) <= 8 && x2 <= 6;
    const figure = graph ? repere({ x: [-6, 6], y: [-9, 9], curves: [{ f: (x) => toNum(a) * x + toNum(b), label: `(d)` }], pts: [{ p: [x1, toNum(y1)], label: 'A' }, { p: [x2, toNum(y2)], label: 'B' }], aria: `Droite passant par A(${x1} ; ${toNum(y1)}) et B(${x2} ; ${toNum(y2)})` }) : undefined;
    const steps: Step[] = [
      numStep(`a) Calcule le coefficient directeur ${m('a')}.`, m('a ='), a, `${m(`a = \\dfrac{${f}(${x2}) - ${f}(${x1})}{${x2} - ${pq(q(x1))}}`)} : différence des images sur différence des x.`, [[div(q(x2 - x1), sub(y2, y1)), 'Quotient à l’envers : les images en haut.'], [neg(a), 'Même ordre en haut et en bas.']]),
      numStep(`b) Calcule l’ordonnée à l’origine ${m('b')}.`, m('b ='), b, `Utilise ${m(`${f}(${x1}) = ${dq(y1)}`)} : ${m(`${dq(a)} \\times ${pq(q(x1))} + b = ${dq(y1)}`)}.`, [[add(y1, mul(a, q(x1))), 'Attention au signe en isolant b.']]),
    ];
    const sol = [`${m(`a = \\dfrac{${dq(y2)} - ${pq(y1)}}{${x2} - ${pq(q(x1))}} = \\dfrac{${dq(sub(y2, y1))}}{${x2 - x1}} = ${dq(a)}`)}.`, `${m(`${f}(${x1}) = ${dq(y1)}`)} : ${m(`${dq(a)} \\times ${pq(q(x1))} + b = ${dq(y1)}`)}, donc ${m(`b = ${dq(b)}`)}.`, `Conclusion : ${m(`${f}(x) = ${affTex(a, b)}`)}. Contrôle : ${m(`${f}(${x2}) = ${dq(y2)}`)}.`];
    return { title: `Retrouve la fonction affine ${m(f)}.`, statement: graph ? `La droite (d) représente une fonction affine ${m(f)} ; elle passe par ${m(`A(${x1}\\,;${dq(y1)})`)} et ${m(`B(${x2}\\,;${dq(y2)})`)}.` : `${m(f)} est affine, ${m(`${f}(${x1}) = ${dq(y1)}`)} et ${m(`${f}(${x2}) = ${dq(y2)}`)}.`, figure, steps, solution: sol, answer: m(`${f}(x) = ${affTex(a, b)}`), key: `${dq(a)}:${dq(b)}:${x1}:${x2}`, data: { kind: 'js', items: [{ what: 'a', js: `(${js(y2)}-${js(y1)})/(${x2}-(${x1}))`, expect: toNum(a) }, { what: 'b', js: `${js(y1)}-${js(a)}*${x1}`, expect: toNum(b) }] } };
  },
};

// ===================================================================== problèmes
export const probleme: Generator = {
  id: 'probleme', title: 'Modéliser : forfaits, taxis, cuves', stars: 2, levels: [2, 3], course: LINKS.s5,
  desc: 'Partie fixe + partie proportionnelle ; ★★★ : comparer deux tarifs (point de bascule) avec le graphique.',
  example: 'C(n) = 0{,}12n + 8',
  generate(rng: Rng, level: Level) {
    if (level === 2) {
      const kind = rng.pick(['taxi', 'forfait', 'cuve', 'location'] as const);
      let fixe: number, pu: Q, n1: number, tot: Q, v: string, ctx: string, unitX: string, Fn: string;
      if (kind === 'cuve') {
        const h0 = rng.int(4, 20) * 10, r = rng.pick([2, 4, 5, 8]); n1 = rng.int(2, Math.floor(h0 / r) - 1);
        const T = h0 / r;
        if (!Number.isInteger(T)) return probleme.generate(rng, level);
        const steps = [
          numStep('a) Hauteur au départ ?', '', q(h0), `${m('h(0)')}.`, [], { unit: 'cm' }),
          numStep(`b) Calcule ${m(`h(${n1})`)}.`, m(`h(${n1}) =`), q(h0 - r * n1), 'Remplace t.', [[q(h0 + r * n1), 'La hauteur diminue : coefficient négatif.']], { unit: 'cm' }),
          numStep('c) Au bout de combien de minutes la cuve est-elle vide ?', '', q(T), `Résous ${m(`${h0} - ${r}t = 0`)}.`, [[q(h0 * r), 'On divise, on ne multiplie pas.']], { unit: 'min' }),
        ];
        return { title: 'La cuve qui se vide.', statement: `La hauteur d’eau d’une cuve, en cm, est ${m(`h(t) = ${h0} - ${r}t`)}, où ${m('t')} est le temps en minutes.`, steps, solution: [`${m(`h(0) = ${h0}`)} : la hauteur de départ ; ${m(`-${r}`)} : elle baisse de ${r} cm par minute.`, `${m(`h(${n1}) = ${h0} - ${r} \\times ${n1} = ${h0 - r * n1}`)} cm.`, `${m(`${h0} - ${r}t = 0`)} donne ${m(`t = ${T}`)} : vide au bout de ${T} minutes.`], answer: `${T} min`, key: `cuve:${h0}:${r}:${n1}`, data: { kind: 'js', items: [{ what: 'a', js: String(h0), expect: h0 }, { what: 'b', js: `${h0}-${r}*${n1}`, expect: h0 - r * n1 }, { what: 'c', js: `${h0}/${r}`, expect: T }] } };
      }
      if (kind === 'taxi') { fixe = rng.pick([2, 3, 4, 5, 6]); pu = q(rng.pick([10, 12, 15, 18, 20, 25]), 10); v = 'd'; Fn = 'P'; unitX = 'km'; ctx = `Un taxi facture ${m(`${fixe}`)} € de prise en charge et ${m(dq(pu))} € par kilomètre.`; }
      else if (kind === 'forfait') { fixe = rng.pick([5, 8, 10, 12, 15]); pu = q(rng.pick([5, 8, 10, 12, 15, 20]), 100); v = 'n'; Fn = 'C'; unitX = 'SMS'; ctx = `Un forfait téléphonique coûte ${m(String(fixe))} € par mois, plus ${m(dq(pu))} € par SMS envoyé.`; }
      else { fixe = rng.pick([10, 15, 20, 25, 30]); pu = q(rng.pick([2, 3, 4, 5, 6, 8])); v = 'h'; Fn = 'L'; unitX = 'h'; ctx = `Une location de kayak coûte ${m(String(fixe))} € de caution non remboursée, plus ${m(dq(pu))} € de l’heure.`; }
      if (eq(pu, q(fixe))) return probleme.generate(rng, level);
      n1 = kind === 'forfait' ? rng.int(2, 15) * 10 : rng.int(2, 25);
      let n2: number; do { n2 = kind === 'forfait' ? rng.int(2, 25) * 10 : rng.int(2, 30); } while (n2 === n1 || !isInt(mul(add(mul(pu, q(n2)), q(fixe)), q(100))));
      tot = add(mul(pu, q(n2)), q(fixe));
      const steps: Step[] = [
        { prompt: `a) Exprime ${m(`${Fn}(${v})`)}.`, answer: shuffledChoice(rng, m(`${Fn}(${v}) = ${affTex(pu, q(fixe), v)}`), [[m(`${Fn}(${v}) = ${affTex(q(fixe), pu, v)}`), 'Le montant fixe ne dépend pas de ' + m(v) + '.'], [m(`${Fn}(${v}) = ${affTex(add(pu, q(fixe)), q(0), v)}`), 'Le fixe n’est payé qu’une fois.']]), hint: 'Montant fixe + prix unitaire × quantité.' },
        numStep(`b) Combien paie-t-on pour ${m(String(n1))} ${unitX === 'h' ? 'heures' : unitX} ?`, '', add(mul(pu, q(n1)), q(fixe)), `${m(`${Fn}(${n1})`)}.`, [[mul(pu, q(n1)), 'N’oublie pas la partie fixe.']], { unit: '€' }),
        numStep(`c) On a payé ${m(dq(tot))} €. ${unitX === 'km' ? 'Quelle distance a-t-on parcourue' : unitX === 'h' ? 'Combien d’heures a duré la location' : 'Combien de SMS a-t-on envoyés'} ?`, '', q(n2), `Résous ${m(`${affTex(pu, q(fixe), v)} = ${dq(tot)}`)}.`, [[div(tot, pu), 'Enlève d’abord la partie fixe.']], { unit: unitX === 'SMS' ? 'SMS' : unitX }),
      ];
      return { title: kind === 'taxi' ? 'La course de taxi.' : kind === 'forfait' ? 'Le forfait téléphonique.' : 'La location de kayak.', statement: ctx, steps, solution: [`${m(`${Fn}(${v}) = ${affTex(pu, q(fixe), v)}`)} (fonction affine).`, `${m(`${Fn}(${n1}) = ${dq(pu)} \\times ${n1} + ${fixe} = ${dq(add(mul(pu, q(n1)), q(fixe)))}`)} €.`, `${m(`${affTex(pu, q(fixe), v)} = ${dq(tot)}`)}, donc ${m(`${dq(pu)}${v} = ${dq(sub(tot, q(fixe)))}`)} et ${m(`${v} = ${n2}`)}.`], answer: `${m(`${Fn}(${v}) = ${affTex(pu, q(fixe), v)}`)} ; ${n2} ${unitX === 'h' ? 'h' : unitX}`, key: `${kind}:${fixe}:${dq(pu)}:${n1}:${n2}`, data: { kind: 'js', items: [{ what: 'b', js: `${js(pu)}*${n1}+${fixe}`, expect: toNum(add(mul(pu, q(n1)), q(fixe))) }, { what: 'c', js: `(${js(tot)}-${fixe})/${js(pu)}`, expect: n2 }] } };
    }
    // ★★★ comparer deux tarifs
    const ctx = rng.pick([['séances de sport', 'séance', 'Salle', 'de séances'], ['séances de cinéma', 'séance', 'Tarif', 'de séances'], ['entrées à la piscine', 'entrée', 'Formule', 'd’entrées']] as const);
    let pA: number, fB: number, pB: number, X: number;
    do { pA = rng.int(5, 12); pB = rng.int(2, pA - 1); X = rng.int(4, 12); fB = (pA - pB) * X; } while (fB > 80);
    const who = rng.pick(NAMES), nn = rng.pick([X - rng.int(1, 3), X + rng.int(1, 4)].filter((v) => v > 0));
    const fig = repere({ x: [0, Math.min(16, X + 5)], y: [0, Math.ceil((pA * (X + 5)) / 10) * 10], ys: 10, curves: [{ f: (x) => pA * x, label: 'A', cls: 'gf-curve' }, { f: (x) => fB + pB * x, label: 'B', cls: 'gf-curve2', at: 0.4 }], aria: `Deux droites : A passe par l’origine, B part de ${fB} ; elles se coupent en x = ${X}` });
    const steps: Step[] = [
      numStep(`a) Pour combien ${ctx[3]} les deux ${ctx[2] === 'Salle' ? 'salles coûtent-elles' : ctx[2] === 'Tarif' ? 'tarifs coûtent-ils' : 'formules coûtent-elles'} la même chose ?`, m('x ='), q(X), `Résous ${m(`${pA}x = ${pB}x + ${fB}`)}.`, [[q(fB, pA), 'Il faut d’abord regrouper les x.']]),
      numStep('b) Quel est alors le prix ?', '', q(pA * X), `${m(`A(${X})`)}.`, [], { unit: '€' }),
      { prompt: `c) ${who} prévoit ${m(String(nn))} ${ctx[0]}. Quel choix est le moins cher ?`, answer: fixedChoice([`${ctx[2]} A`, `${ctx[2]} B`], nn < X ? 0 : 1, [`${m(`A(${nn}) = ${pA * nn}`)} € et ${m(`B(${nn}) = ${fB + pB * nn}`)} €.`, `${m(`A(${nn}) = ${pA * nn}`)} € et ${m(`B(${nn}) = ${fB + pB * nn}`)} €.`]), hint: 'Quelle droite est en dessous pour cette valeur ?' },
    ];
    return { title: 'Comparer deux tarifs.', statement: `${ctx[2]} A : ${m(String(pA))} € par ${ctx[1]}. ${ctx[2]} B : abonnement de ${m(String(fB))} €, puis ${m(String(pB))} € par ${ctx[1]}. On note ${m('x')} le nombre ${ctx[3]}.`, figure: fig, steps, solution: [`${m(`A(x) = ${pA}x`)} et ${m(`B(x) = ${pB}x + ${fB}`)}.`, `${m(`${pA}x = ${pB}x + ${fB}`)} donne ${m(`${affTex(q(pA - pB), q(0))} = ${fB}`)}, donc ${m(`x = ${X}`)} ; prix commun ${m(String(pA * X))} €.`, `Pour ${nn} : ${m(`A(${nn}) = ${pA * nn}`)} € et ${m(`B(${nn}) = ${fB + pB * nn}`)} € : ${nn < X ? 'A' : 'B'} est moins cher (sa droite est en dessous ${nn < X ? 'avant' : 'après'} ${X}).`], answer: `${m(`x = ${X}`)} ; ${nn < X ? 'A' : 'B'}`, key: `cmp:${pA}:${pB}:${fB}:${nn}:${ctx[0]}`, data: { kind: 'js', items: [{ what: 'x', js: `${fB}/(${pA}-${pB})`, expect: X }, { what: 'p', js: `${pA}*${X}`, expect: pA * X }, { what: 'step:2', js: `${pA * nn}<${fB + pB * nn}?0:1`, expect: nn < X ? 0 : 1 }] } };
  },
};

// ===================================================================== erreur
const ER = { par: 'Il a oublié les parenthèses autour du nombre négatif.', conf: 'Il a confondu image et antécédent.', quot: 'Il a inversé le quotient du coefficient directeur.', lin: 'Une droite ne suffit pas : elle doit passer par l’origine pour être linéaire.', add: 'Pour une fonction linéaire, on multiplie par le coefficient, on n’ajoute pas.' } as const;
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.serieF, links: [LINKS.s12, LINKS.s44],
  desc: 'Parenthèses oubliées, image/antécédent confondus, quotient inversé, affine ≠ linéaire, ajouter au lieu de multiplier.',
  example: '-3^2 \\neq (-3)^2',
  generate(rng: Rng) {
    const kind = rng.pick(Object.keys(ER) as (keyof typeof ER)[]);
    const who = rng.pick(NAMES.filter((n) => !['Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina'].includes(n)));
    let quote = '', fix: Step | null = null, sol: Rich = '', items: Item[] = [], key = '';
    if (kind === 'par') {
      const x = rng.int(2, 9), c = rng.int(-5, 5);
      const def = quadTex(q(1), q(0), q(c)), v = x * x + c;
      quote = `Pour ${m(`f(x) = ${def}`)} : « ${m(`f(-${x}) = -${x}^2${c ? (c < 0 ? ` - ${-c}` : ` + ${c}`) : ''} = ${-x * x + c}`)} ».`;
      fix = numStep(`Calcule correctement ${m(`f(-${x})`)}.`, m(`f(-${x}) =`), q(v), `${m(`(-${x})^2 = ${x * x}`)}.`, [[q(-x * x + c), 'C’est le calcul faux.']]);
      sol = `${m(`f(-${x}) = (-${x})^2${c ? (c < 0 ? ` - ${-c}` : ` + ${c}`) : ''} = ${v}`)}.`; items = [{ what: 'v', js: `(-${x})**2+(${c})`, expect: v }]; key = `${x}:${c}`;
    } else if (kind === 'conf') {
      const a = rng.int(2, 5), b = rng.int(-6, 6), x = rng.int(-4, 6), y = a * x + b;
      quote = `Pour ${m(`f(x) = ${affTex(q(a), q(b))}`)} : « ${m(`f(${x}) = ${y}`)}, donc l’image de ${m(String(y))} est ${m(String(x))}. »`;
      fix = { prompt: `Que peut-on dire de ${m(String(x))} ?`, answer: shuffledChoice(rng, `C’est un antécédent de ${m(String(y))}.`, [[`C’est l’image de ${m(String(y))}.`, 'Non, c’est justement l’erreur.'], [`C’est ${m(`f(${y})`)}.`, `${m(`f(${y}) = ${a * y + b}`)}.`]]), hint: 'Le nombre entre parenthèses entre dans la machine.' };
      sol = `${m(String(x))} est un antécédent de ${m(String(y))} ; l’image de ${m(String(x))} est ${m(String(y))}.`; key = `${a}:${b}:${x}`;
    } else if (kind === 'quot') {
      let x1: number, x2: number, a: number, b: number; do { x1 = rng.int(-2, 4); x2 = rng.int(x1 + 1, 7); a = nz(rng, -4, 4); b = rng.int(-5, 5); } while (Math.abs(a) === 1 && x2 - x1 === 1);
      const y1 = a * x1 + b, y2 = a * x2 + b;
      quote = `Pour la droite passant par ${m(`A(${x1}\\,;${y1})`)} et ${m(`B(${x2}\\,;${y2})`)} : « ${m(`a = \\dfrac{${x2} - ${pq(q(x1))}}{${y2} - ${pq(q(y1))}} = ${dq(q(x2 - x1, y2 - y1))}`)} ».`;
      fix = numStep('Calcule correctement a.', m('a ='), q(a), 'Différence des images sur différence des abscisses.', [[q(x2 - x1, y2 - y1), 'C’est le calcul faux.']]);
      sol = `${m(`a = \\dfrac{${y2} - ${pq(q(y1))}}{${x2} - ${pq(q(x1))}} = \\dfrac{${y2 - y1}}{${x2 - x1}} = ${a}`)}.`; items = [{ what: 'a', js: `(${y2}-(${y1}))/(${x2}-(${x1}))`, expect: a }]; key = `${x1}${x2}${a}${b}`;
    } else if (kind === 'lin') {
      const a = nz(rng, -5, 6), b = nz(rng, -7, 7);
      quote = `« ${m(`f(x) = ${affTex(q(a), q(b))}`)} est linéaire, puisque sa courbe est une droite. »`;
      fix = numStep(`Calcule ${m('f(0)')} pour le prouver.`, m('f(0) ='), q(b), 'Une fonction linéaire vérifie f(0) = 0.');
      sol = `${m(`f(0) = ${b} \\neq 0`)} : la droite ne passe pas par l’origine. ${m('f')} est affine, pas linéaire.`; items = [{ what: 'b', js: String(b), expect: b }]; key = `${a}:${b}`;
    } else {
      const a = rng.int(2, 6), x0 = rng.int(2, 5), x1 = x0 + rng.int(1, 4);
      quote = `« ${m('f')} est linéaire et ${m(`f(${x0}) = ${a * x0}`)}. De ${x0} à ${x1}, on ajoute ${x1 - x0}, donc ${m(`f(${x1}) = ${a * x0 + x1 - x0}`)}. »`;
      fix = numStep(`Calcule correctement ${m(`f(${x1})`)}.`, m(`f(${x1}) =`), q(a * x1), `${m(`a = \\dfrac{${a * x0}}{${x0}}`)}.`, [[q(a * x0 + x1 - x0), 'C’est le calcul faux.']]);
      sol = `${m(`a = \\dfrac{${a * x0}}{${x0}} = ${a}`)}, donc ${m(`f(${x1}) = ${a} \\times ${x1} = ${a * x1}`)}.`; items = [{ what: 'v', js: `${a * x0}/${x0}*${x1}`, expect: a * x1 }]; key = `${a}:${x0}:${x1}`;
    }
    const steps: Step[] = [{ prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, ER[kind], rng.shuffle((Object.keys(ER) as (keyof typeof ER)[]).filter((k) => k !== kind)).slice(0, 3).map((k) => [ER[k], 'Non : relis son calcul.'] as [Rich, Rich])), hint: 'Refais le calcul toi-même.' }, fix!];
    void mist;
    return { title: 'Trouve l’erreur.', statement: `${who} écrit : ${quote}`, steps, solution: [ER[kind], sol], answer: ER[kind], key: `${kind}:${key}`, data: { kind: 'js', items } };
  },
};
