/** Chapitre 13 : vocabulaire, rapports, calculatrice, longueurs, angles, outil, problèmes, erreurs, valeurs exactes. */
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { q, toNum, mul, div, add, eq, type Q } from '../engine/q';
import { mist, shuffledChoice, fixedChoice, NAMES } from '../engine/build';
import { svgWrap, line, text, dot, fit, rightMark, type Pt } from '../engine/svg';
import { LINKS, m, fr, deg, dx, cosd, sind, tand, acosd, asind, atand, ax, safe, approxF, LEN_TXT, pickTri, triSvg, ROTS, L1, qd, round, roundQ, type Tri } from './common';
import { PRIMITIVE, triplets } from '../ch11/common';

type Item = { what: string; js: string; expect: number; tol?: number };
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
type Side = 'adj' | 'opp' | 'hyp';
type Fn = 'cos' | 'sin' | 'tan';
const NOM: Record<Side, string> = { adj: 'côté adjacent', opp: 'côté opposé', hyp: 'hypoténuse' };
const FN: Record<Fn, [Side, Side]> = { cos: ['adj', 'hyp'], sin: ['opp', 'hyp'], tan: ['opp', 'adj'] };
const fnFor = (a: Side, b: Side): Fn => (a === 'hyp' || b === 'hyp' ? (a === 'adj' || b === 'adj' ? 'cos' : 'sin') : 'tan');
const F = (f: Fn, a: number) => (f === 'cos' ? cosd(a) : f === 'sin' ? sind(a) : tand(a));
const IF = (f: Fn, x: number) => (f === 'cos' ? acosd(x) : f === 'sin' ? asind(x) : atand(x));
/** Longueurs des trois côtés pour α et le côté adjacent. */
const sides = (alpha: number, adj: number): Record<Side, number> => ({ adj, opp: adj * tand(alpha), hyp: adj / cosd(alpha) });
const rect = (t: Tri) => `Le triangle ${m(t.name)} est rectangle en ${m(t.R)}.`;
const fig = (rng: Rng, t: Tri, alpha: number, S: Record<Side, number>, labels: Partial<Record<Side, string>>, o: { arc?: string | null; arcQ?: string | null; ask?: Side } = {}) =>
  triSvg(t, alpha, S.adj, { labels, arc: o.arc === undefined ? deg(alpha).replace('^\\circ', '°') : o.arc, arcQ: o.arcQ, ask: o.ask, rot: rng.pick(ROTS), flip: rng.chance(0.5), aria: `Triangle ${t.name} rectangle en ${t.R}${Object.entries(labels).map(([k, v]) => `, ${(t as unknown as Record<string, string>)[k]} = ${v}`).join('')}` });

// ===================================================================== vocabulaire
export const vocabulaire: Generator = {
  id: 'vocabulaire', title: 'Adjacent, opposé, hypoténuse', stars: 1, levels: [1, 2], course: LINKS.s11,
  desc: 'Repérer les trois côtés pour un angle aigu donné ; ★★ : pour les deux angles (les noms s’échangent).',
  example: '\\text{adjacent : touche l’angle}',
  generate(rng: Rng, level: Level) {
    const t = pickTri(rng), alpha = rng.int(25, 65), S = sides(alpha, rng.int(4, 10));
    const segs = [t.adj, t.opp, t.hyp].map((s) => m(`[${s}]`));
    const ask = (lbl: string, good: number, why: Rich[]) => ({ prompt: lbl, answer: fixedChoice(segs, good, why), hint: 'Hypoténuse : en face de l’angle droit. Adjacent : touche l’angle. Opposé : en face de l’angle.' } as Step);
    const steps: Step[] = [];
    const W = (x: string) => `Non : ${x}.`;
    steps.push(ask(`a) Quelle est l’hypoténuse ?`, 2, [W(`${m(`[${t.adj}]`)} touche l’angle droit`), W(`${m(`[${t.opp}]`)} touche l’angle droit`), null] as Rich[]));
    steps.push(ask(`b) Pour l’angle ${m(t.ang)}, quel est le côté adjacent ?`, 0, [null, W(`${m(`[${t.opp}]`)} est en face de ${m(t.ang)} : il est opposé`), W('c’est l’hypoténuse, elle n’est ni adjacente ni opposée')] as Rich[]));
    steps.push(ask(`c) Pour l’angle ${m(t.ang)}, quel est le côté opposé ?`, 1, [W(`${m(`[${t.adj}]`)} touche ${m(t.ang)} : il est adjacent`), null, W('c’est l’hypoténuse')] as Rich[]));
    const sol: Rich[] = [`${rect(t)} L’hypoténuse, en face de l’angle droit, est ${m(`[${t.hyp}]`)}.`, `Pour ${m(t.ang)} : ${m(`[${t.adj}]`)} touche l’angle (adjacent), ${m(`[${t.opp}]`)} est en face (opposé).`];
    const items: Item[] = [{ what: 'step:0', js: '2', expect: 2 }, { what: 'step:1', js: '0', expect: 0 }, { what: 'step:2', js: '1', expect: 1 }];
    if (level === 2) {
      steps.push(ask(`d) Pour l’angle ${m(t.angQ)}, quel est le côté adjacent ?`, 1, [W(`${m(`[${t.adj}]`)} est en face de ${m(t.angQ)} : pour cet angle, il est opposé`), null, W('c’est l’hypoténuse')] as Rich[]));
      steps.push(ask(`e) Pour l’angle ${m(t.angQ)}, quel est le côté opposé ?`, 0, [null, W(`${m(`[${t.opp}]`)} touche ${m(t.angQ)}`), W('c’est l’hypoténuse')] as Rich[]));
      sol.push(`Pour ${m(t.angQ)}, c’est l’inverse : ${m(`[${t.opp}]`)} est adjacent et ${m(`[${t.adj}]`)} est opposé. L’hypoténuse ne change pas.`);
      items.push({ what: 'step:3', js: '1', expect: 1 }, { what: 'step:4', js: '0', expect: 0 });
    }
    const figure = triSvg(t, alpha, S.adj, { arc: '', arcQ: level === 2 ? ' ' : null, rot: rng.pick(ROTS), flip: rng.chance(0.5), aria: `Triangle ${t.name} rectangle en ${t.R}, angle en ${t.P} marqué` });
    return { title: `Repère les côtés.`, statement: `${rect(t)}`, figure, steps, solution: sol, answer: `Hypoténuse ${m(`[${t.hyp}]`)} ; pour ${m(t.ang)} : adjacent ${m(`[${t.adj}]`)}, opposé ${m(`[${t.opp}]`)}`, key: `${t.name}:${t.R}${t.P}:${level}:${alpha}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== rapports
export const rapports: Generator = {
  id: 'rapports', title: 'Cosinus, sinus, tangente', stars: 1, levels: [1, 2], course: LINKS.s22, links: [LINKS.s23],
  desc: 'CAH SOH TOA : écrire le rapport, puis le calculer avec des côtés connus ; ★★ : vrai ou faux (cos < 1, tan > 1…).',
  example: '\\cos \\widehat{A} = \\dfrac{4}{5}',
  generate(rng: Rng, level: Level) {
    const t = pickTri(rng);
    const [a0, b0, c0] = rng.pick(PRIMITIVE.slice(0, 4)), k = rng.pick([1, 1, 2, 3, 0.5, 1.5]);
    const swap = rng.chance(0.5);
    const adj = (swap ? b0 : a0) * k, opp = (swap ? a0 : b0) * k, hyp = c0 * k;
    const V: Record<Side, number> = { adj, opp, hyp };
    const f = rng.pick(['cos', 'sin', 'tan'] as Fn[]);
    const [nu, de] = FN[f];
    const nm = (s: Side) => (s === 'adj' ? t.adj : s === 'opp' ? t.opp : t.hyp);
    const opts: [Side, Side][] = [[nu, de] as [Side, Side], ...([['adj', 'hyp'], ['opp', 'hyp'], ['opp', 'adj'], ['hyp', 'adj'], ['adj', 'opp']] as [Side, Side][]).filter(([x, y]) => !(x === nu && y === de))].slice(0, 4);
    const why = ([x, y]: [Side, Side]): Rich => (x === 'hyp' ? 'L’hypoténuse est le plus long côté : elle est toujours au dénominateur.' : `${m(fr(nm(x), nm(y)))}, c’est ${NOM[x]} sur ${NOM[y]} : c’est ${m(`\\${fnFor(x, y)}`)}${y === 'opp' ? ' (à l’envers)' : ''}, pas ${m(`\\${f}`)}.`);
    const steps: Step[] = [{ prompt: `a) ${m(`\\${f} ${t.ang} = `)} ?`, answer: shuffledChoice(rng, m(fr(nm(nu), nm(de))), opts.slice(1).map((o) => [m(fr(nm(o[0]), nm(o[1]))), why(o)] as [Rich, Rich])), hint: `CAH SOH TOA : ${m(`\\${f}`)} = ${NOM[nu]} / ${NOM[de]}.` }];
    const r = q(Math.round(V[nu] * 10), Math.round(V[de] * 10));
    steps.push(step(`b) Calcule ${m(`\\${f} ${t.ang}`)} (valeur exacte).`, [{ label: m(`\\${f} ${t.ang} =`), expect: r, form: 'any' }], `${m(`\\${f} ${t.ang} = ${fr(nm(nu), nm(de))}`)} : remplace par les longueurs.`, mist(r, [[q(Math.round(V[de] * 10), Math.round(V[nu] * 10)), 'Rapport à l’envers.']])));
    const items: Item[] = [{ what: 'r', js: `${V[nu]}/${V[de]}`, expect: toNum(r) }];
    const sol: Rich[] = [`${rect(t)} Pour ${m(t.ang)} : adjacent ${m(`[${t.adj}]`)}, opposé ${m(`[${t.opp}]`)}, hypoténuse ${m(`[${t.hyp}]`)}.`, `${m(`\\${f} ${t.ang} = ${fr(nm(nu), nm(de))} = ${fr(dx(V[nu]), dx(V[de]))} = ${dx(toNum(r))}`)}${Number.isInteger(toNum(r) * 1000) ? '' : ''}.`.replace(/= ([\d{},]+)\$\.$/, (s0) => s0)];
    if (!Number.isInteger(Math.round(toNum(r) * 1e6) / 1e3)) sol[1] = `${m(`\\${f} ${t.ang} = ${fr(nm(nu), nm(de))} = ${fr(dx(V[nu]), dx(V[de]))} = ${fr(r.n, r.d)} \\approx ${ax(toNum(r), 2)}`)}.`;
    if (level === 2) {
      const tf = rng.pick([
        [`${m(`\\cos ${t.ang}`)} peut valoir ${m(dx(rng.pick([1.2, 1.5, 1.05])))}.`, 1, 'Le côté adjacent est plus court que l’hypoténuse : un cosinus est toujours inférieur à 1.'],
        [`${m(`\\sin ${t.ang}`)} peut valoir ${m(dx(rng.pick([1.1, 1.3, 2])))}.`, 1, 'Le côté opposé est plus court que l’hypoténuse : un sinus est toujours inférieur à 1.'],
        [`${m(`\\tan ${t.ang}`)} peut valoir ${m(String(rng.pick([2, 3, 5])))}.`, 0, 'Vrai : il suffit que le côté opposé soit plus long que le côté adjacent (angle de plus de 45°).'],
        [`${m(`\\cos ${t.angQ} = ${fr(t.opp, t.hyp)}`)}.`, 0, `Vrai : pour ${m(t.angQ)}, ${m(`[${t.opp}]`)} est le côté adjacent.`],
        [`${m(`\\sin ${t.angQ} = ${fr(t.opp, t.hyp)}`)}.`, 1, `Faux : pour ${m(t.angQ)}, ${m(`[${t.opp}]`)} touche l’angle, il est adjacent : c’est le cosinus.`],
      ] as [Rich, number, Rich][]);
      steps.push({ prompt: `c) Vrai ou faux : ${tf[0]}`, answer: fixedChoice(['Vrai', 'Faux'], tf[1], [tf[2], tf[2]]), hint: 'Pense aux longueurs : l’hypoténuse est le plus long côté.' });
      sol.push(`c) ${tf[1] === 0 ? 'Vrai' : 'Faux'}. ${tf[2]}`);
      items.push({ what: 'step:2', js: String(tf[1]), expect: tf[1] });
    }
    const S = { adj, opp, hyp };
    const figure = triSvg(t, atand(opp / adj), adj, { labels: { adj: L1(adj), opp: L1(opp), hyp: L1(hyp) }, arc: '', rot: rng.pick(ROTS), flip: rng.chance(0.5), aria: `Triangle ${t.name} rectangle en ${t.R}, ${t.adj} = ${L1(adj)}, ${t.opp} = ${L1(opp)}, ${t.hyp} = ${L1(hyp)}` });
    void S;
    return { title: `Le ${f === 'cos' ? 'cosinus' : f === 'sin' ? 'sinus' : 'la tangente'} de ${m(t.ang)}.`.replace('Le la', 'La'), statement: `${rect(t)} ${m(`${t.adj} = ${dx(adj)}`)}, ${m(`${t.opp} = ${dx(opp)}`)} et ${m(`${t.hyp} = ${dx(hyp)}`)} (en cm).`, figure, steps, solution: sol, answer: m(`\\${f} ${t.ang} = ${fr(nm(nu), nm(de))} = ${fr(r.n, r.d)}`), key: `${t.name}${t.R}${t.P}:${f}:${adj},${opp}:${level}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== calculatrice
export const calculatrice: Generator = {
  id: 'calculatrice', title: 'À la calculatrice', stars: 1, levels: [1], course: LINKS.s23, links: [LINKS.s42],
  desc: 'Valeurs de cos, sin, tan au millième (mode degrés) ; retrouver un angle avec la touche inverse.',
  example: '\\cos 25^\\circ \\approx 0{,}906',
  generate(rng: Rng) {
    const fs = rng.shuffle(['cos', 'sin', 'tan'] as Fn[]);
    let as: number[];
    do { as = [rng.int(5, 85), rng.int(5, 85), rng.int(5, 80)]; } while (fs.some((f, i) => !safe(F(f, as[i]), 3)) || new Set(as).size < 3);
    const fi = rng.pick(['cos', 'sin', 'tan'] as Fn[]);
    let x: number;
    do { x = fi === 'tan' ? rng.int(2, 40) / 10 : rng.int(10, 95) / 100; } while (!safe(IF(fi, x), 0));
    const A = IF(fi, x);
    const steps: Step[] = [
      step('a) Donne au millième :', fs.map((f, i) => approxF(m(`\\${f} ${deg(as[i])} \\approx`), F(f, as[i]), 3)), 'Calculatrice en mode **degrés** (D ou DEG à l’écran).', [{ on: 'num', field: 0, value: roundQ(F(fs[0], as[0] * (180 / Math.PI)), 3), msg: 'Ta calculatrice est en mode radians : passe en mode degrés.' }]),
      step(`b) Un angle aigu ${m('\\alpha')} vérifie ${m(`\\${fi} \\alpha = ${dx(x)}`)}. Donne ${m('\\alpha')} au degré.`, [approxF(m('\\alpha \\approx'), A, 0, '°')], `Touche inverse : ${m(`\\${fi}^{-1}`)} (souvent « seconde » puis « ${fi} »).`, mist(roundQ(A, 0), [[toNum(roundQ(F(fi, x), 0)) >= 2 ? roundQ(F(fi, x), 0) : null, `Tu as calculé ${m(`\\${fi}(${dx(x)})`)} : il faut la touche inverse ${m(`\\${fi}^{-1}`)}.`]])),
    ];
    const items: Item[] = fs.map((f, i) => ({ what: `v${i}`, js: `Math.${f}(${as[i]}*Math.PI/180)`, expect: F(f, as[i]), tol: 1e-9 }));
    items.push({ what: 'a', js: `Math.a${fi}(${x})*180/Math.PI`, expect: A, tol: 1e-9 });
    return { title: 'À la calculatrice (mode degrés).', steps, solution: [...fs.map((f, i) => `${m(`\\${f} ${deg(as[i])} \\approx ${ax(F(f, as[i]), 3)}`)}`), `${m(`\\alpha = \\${fi}^{-1}(${dx(x)}) \\approx ${ax(A, 1)}^\\circ`)}, soit ${m(`${ax(A, 0)}^\\circ`)} au degré.`], answer: `${fs.map((f, i) => m(ax(F(f, as[i]), 3))).join(' ; ')} ; ${m(`\\alpha \\approx ${ax(A, 0)}^\\circ`)}`, key: `${fs.join()}:${as}:${fi}${x}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== longueur
function lengthCase(t: Tri, alpha: number, known: Side, unk: Side, kv: number, unit: string) {
  const f = fnFor(known, unk), [nu, de] = FN[f];
  const nm = (s: Side) => (s === 'adj' ? t.adj : s === 'opp' ? t.opp : t.hyp);
  const top = unk === nu;
  const v = top ? kv * F(f, alpha) : kv / F(f, alpha);
  const wrong = top ? kv / F(f, alpha) : kv * F(f, alpha);
  const tex = top ? `${dx(kv)} \\times \\${f} ${deg(alpha)}` : fr(dx(kv), `\\${f} ${deg(alpha)}`);
  const equ = `\\${f} ${t.ang} = ${fr(nm(nu), nm(de))} \\quad \\text{soit} \\quad \\${f} ${deg(alpha)} = ${fr(nu === known ? dx(kv) : nm(nu), de === known ? dx(kv) : nm(de))}`;
  const others = (['cos', 'sin', 'tan'] as Fn[]).filter((g) => g !== f);
  const wrongFn = others.map((g) => (FN[g].includes(unk) && FN[g].includes(known) ? null : (top ? kv * F(g, alpha) : kv / F(g, alpha))));
  const mk: [Q | null, Rich][] = [[roundQ(wrong, 1), top ? 'Inconnue en haut : on **multiplie**.' : `Inconnue en bas : on **divise** (${unk === 'hyp' ? 'l’hypoténuse doit être le plus long côté' : 'contrôle les longueurs'}).`], ...others.map((_g, i) => [wrongFn[i] === null ? null : roundQ(wrongFn[i]!, 1), `Mauvaise formule : ${m(`[${nm(known)}]`)} et ${m(`[${nm(unk)}]`)} sont ${NOM[known]} et ${NOM[unk]} : c’est ${m(`\\${f}`)}.`] as [Q | null, Rich])];
  return { f, v, tex, equ, mk, js: `${kv}${top ? '*' : '/'}Math.${f}(${alpha}*Math.PI/180)`, nm, unit };
}
export const longueur: Generator = {
  id: 'longueur', title: 'Calculer une longueur', stars: 1, levels: [1, 2], course: LINKS.s35, links: [LINKS.s32, LINKS.s33, LINKS.s36],
  desc: 'Choisir cos, sin ou tan avec le côté connu et le côté cherché ; ★ inconnue en haut (on multiplie), ★★ inconnue en bas (on divise), deux côtés.',
  example: 'AB = 9 \\times \\cos 34^\\circ \\approx 7{,}5',
  generate(rng: Rng, level: Level) {
    const t = pickTri(rng);
    let alpha: number, known: Side, unks: Side[], kv: number, cases: ReturnType<typeof lengthCase>[];
    for (;;) {
      alpha = rng.int(18, 72);
      if (level === 1) { known = 'hyp'; unks = [rng.pick(['adj', 'opp'] as Side[])]; if (rng.chance(0.3)) { known = 'adj'; unks = ['opp']; } }
      else { known = rng.pick(['adj', 'opp'] as Side[]); unks = rng.shuffle(['hyp', known === 'adj' ? 'opp' : 'adj'] as Side[]); }
      kv = rng.int(30, 150) / 10;
      cases = unks.map((u) => lengthCase(t, alpha, known, u, kv, 'cm'));
      if (cases.every((c) => safe(c.v, 1) && c.v < 40 && c.v > 1)) break;
    }
    const S = sides(alpha, known === 'adj' ? kv : known === 'opp' ? kv / tand(alpha) : kv * cosd(alpha));
    const lbl: Partial<Record<Side, string>> = { [known]: `${L1(kv)} cm` };
    for (const u of unks) lbl[u] = '?';
    const steps = cases.map((c, i) => step(`${unks.length > 1 ? `${'ab'[i]}) ` : ''}Calcule ${m(c.nm(unks[i]))}, ${LEN_TXT.cm}.`, [approxF(m(`${c.nm(unks[i])} \\approx`), c.v, 1, 'cm')], `${NOM[known][0].toUpperCase() + NOM[known].slice(1)} connu, ${NOM[unks[i]]} cherché : ${m(`\\${c.f}`)}. ${unks[i] === FN[c.f][0] ? 'Inconnue en haut : multiplie.' : 'Inconnue en bas : divise.'}`, mist(roundQ(c.v, 1), c.mk)));
    const sol: Rich[] = [`${rect(t)} Pour l’angle ${m(t.ang)}, ${m(`[${cases[0].nm(known)}]`)} est ${known === 'hyp' ? 'l’hypoténuse' : `le ${NOM[known]}`}.`];
    cases.forEach((c, i) => sol.push(`${m(c.equ)}, donc ${m(`${c.nm(unks[i])} = ${c.tex} \\approx ${ax(c.v, 1)}\\,\\mathrm{cm}`)}.`));
    sol.push(`Contrôle : l’hypoténuse ${m(`[${t.hyp}]`)} est bien le plus long côté.`);
    const figure = fig(rng, t, alpha, S, lbl);
    return { title: `Calcule ${unks.map((u) => m(cases[0].nm(u))).join(' et ')}.`, statement: `${rect(t)} ${m(`${cases[0].nm(known)} = ${dx(kv)}\\,\\mathrm{cm}`)} et ${m(`${t.ang} = ${deg(alpha)}`)}.`, figure, steps, solution: sol, answer: cases.map((c, i) => m(`${c.nm(unks[i])} \\approx ${ax(c.v, 1)}\\,\\mathrm{cm}`)).join(' ; '), key: `${t.name}${t.R}${t.P}:${alpha}:${known}:${kv}:${unks}`, data: { kind: 'js', items: cases.map((c, i) => ({ what: unks[i], js: c.js, expect: c.v, tol: 1e-9 })) } };
  },
};

// ===================================================================== angle
export const angle: Generator = {
  id: 'angle', title: 'Calculer un angle', stars: 1, levels: [1, 2], course: LINKS.s42, links: [LINKS.s43, LINKS.s44],
  desc: 'Rapport exact, puis touche inverse ; ★★ : les deux angles aigus (somme 90°), sans arrondir le rapport.',
  example: '\\widehat{A} = \\cos^{-1}\\left(\\dfrac{7}{9}\\right) \\approx 39^\\circ',
  generate(rng: Rng, level: Level) {
    const t = pickTri(rng);
    let a: Side, b: Side, va: number, vb: number, f: Fn, A: number;
    for (;;) {
      [a, b] = rng.pick([['adj', 'hyp'], ['opp', 'hyp'], ['opp', 'adj']] as [Side, Side][]);
      va = rng.int(20, 120) / 10; vb = rng.int(20, 150) / 10;
      if (b === 'hyp' && vb <= va + 0.5) continue;
      f = fnFor(a, b); A = IF(f, va / vb);
      if (A > 12 && A < 78 && safe(A, 0) && safe(90 - A, 0) && Math.abs(va - vb) > 0.4) break;
    }
    const nm = (s: Side) => (s === 'adj' ? t.adj : s === 'opp' ? t.opp : t.hyp);
    const early = IF(f, round(va / vb, 1));
    const steps: Step[] = [{ prompt: `a) Quelle formule utiliser pour ${m(t.ang)} ?`, answer: fixedChoice([m('\\cos'), m('\\sin'), m('\\tan')], ['cos', 'sin', 'tan'].indexOf(f), (['cos', 'sin', 'tan'] as Fn[]).map((x) => (x === f ? null : `${m(`\\${x}`)} utilise ${NOM[FN[x][0]]} et ${NOM[FN[x][1]]}.`))), hint: `${m(`[${nm(a)}]`)} et ${m(`[${nm(b)}]`)} : ${NOM[a]} et ${NOM[b]}.` }];
    steps.push(step(`b) Calcule ${m(t.ang)} au degré.`, [approxF(m(`${t.ang} \\approx`), A, 0, '°')], `${m(`\\${f} ${t.ang} = ${fr(dx(va), dx(vb))}`)}, puis ${m(`\\${f}^{-1}`)}. Garde la fraction, n’arrondis pas le rapport.`, mist(roundQ(A, 0), [[safe(early, 0) && Math.round(early) !== Math.round(A) ? roundQ(early, 0) : null, 'Tu as arrondi le rapport trop tôt : tape la fraction en entier.'], [toNum(roundQ(F(f, va / vb), 0)) >= 2 ? roundQ(F(f, va / vb), 0) : null, 'Il faut la touche inverse.'], [roundQ(90 - A, 0), `C’est l’autre angle aigu, ${m(t.angQ)}.`]])));
    const items: Item[] = [{ what: 'step:0', js: String(['cos', 'sin', 'tan'].indexOf(f)), expect: ['cos', 'sin', 'tan'].indexOf(f) }, { what: 'A', js: `Math.a${f}(${va}/${vb})*180/Math.PI`, expect: A, tol: 1e-9 }];
    const sol: Rich[] = [`${rect(t)} Pour ${m(t.ang)}, ${m(`[${nm(a)}]`)} est le ${NOM[a]} et ${m(`[${nm(b)}]`)} ${b === 'hyp' ? 'l’hypoténuse' : `le ${NOM[b]}`}.`, `${m(`\\${f} ${t.ang} = ${fr(nm(a), nm(b))} = ${fr(dx(va), dx(vb))}`)}, donc ${m(`${t.ang} = \\${f}^{-1}\\left(${fr(dx(va), dx(vb))}\\right) \\approx ${ax(A, 1)}^\\circ`)}, soit ${m(`${ax(A, 0)}^\\circ`)} au degré.`];
    if (level === 2) {
      steps.push(step(`c) Déduis-en ${m(t.angQ)} au degré.`, [approxF(m(`${t.angQ} \\approx`), 90 - A, 0, '°')], 'Les deux angles aigus d’un triangle rectangle ont pour somme 90°.', mist(roundQ(90 - A, 0), [[roundQ(180 - A, 0), 'Somme des trois angles : 180°, dont 90° pour l’angle droit.']])));
      sol.push(`Les angles aigus sont complémentaires : ${m(`${t.angQ} \\approx 90^\\circ - ${ax(A, 1)}^\\circ = ${ax(90 - A, 1)}^\\circ`)}, soit ${m(`${ax(90 - A, 0)}^\\circ`)}.`);
      items.push({ what: 'B', js: `90-Math.a${f}(${va}/${vb})*180/Math.PI`, expect: 90 - A, tol: 1e-9 });
    }
    const S = sides(A, a === 'adj' ? va : b === 'adj' ? vb : Math.sqrt(vb * vb - va * va));
    const figure = fig(rng, t, A, S, { [a]: `${L1(va)} cm`, [b]: `${L1(vb)} cm` }, { arc: '?', arcQ: level === 2 ? '?' : null });
    return { title: `Calcule ${level === 2 ? 'les angles aigus' : m(t.ang)}.`, statement: `${rect(t)} ${m(`${nm(a)} = ${dx(va)}\\,\\mathrm{cm}`)} et ${m(`${nm(b)} = ${dx(vb)}\\,\\mathrm{cm}`)}.`, figure, steps, solution: sol, answer: `${m(`${t.ang} \\approx ${ax(A, 0)}^\\circ`)}${level === 2 ? ` ; ${m(`${t.angQ} \\approx ${ax(90 - A, 0)}^\\circ`)}` : ''}`, key: `${t.name}${t.R}${t.P}:${a}${b}:${va}:${vb}:${level}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== outil
export const outil: Generator = {
  id: 'outil', title: 'Pythagore ou trigonométrie ?', stars: 2, levels: [2], course: LINKS.s6,
  desc: 'Deux côtés et on cherche le troisième : Pythagore ; un angle donné ou cherché : trigonométrie. Puis calculer.',
  example: '\\text{angle} \\Rightarrow \\text{trigo}',
  generate(rng: Rng) {
    const t = pickTri(rng);
    const kind = rng.pick(['py3', 'pyLeg', 'trigL', 'trigA'] as const);
    const opts = ['Le théorème de Pythagore', 'La trigonométrie', 'La réciproque de Pythagore', 'Le théorème de Thalès'];
    let st = '', v = 0, unit = 'cm', js = '', label = '', solv: Rich[] = [], dp = 1, good = 0;
    const [a0, b0, c0] = rng.pick(PRIMITIVE.slice(0, 3)), k = rng.pick([1, 2, 0.5, 1.5]);
    if (kind === 'py3') { const x = a0 * k, y = b0 * k; st = `${m(`${t.adj} = ${dx(x)}\\,\\mathrm{cm}`)} et ${m(`${t.opp} = ${dx(y)}\\,\\mathrm{cm}`)}. Calcule ${m(t.hyp)}.`; v = c0 * k; js = `Math.hypot(${x},${y})`; label = t.hyp; good = 0; solv = [`On connaît deux côtés, on cherche le troisième : Pythagore.`, `${m(`${t.hyp}^2 = ${dx(x)}^2 + ${dx(y)}^2 = ${dx(round(x * x + y * y, 4))}`)}, donc ${m(`${t.hyp} = ${dx(v)}\\,\\mathrm{cm}`)}.`]; }
    else if (kind === 'pyLeg') { let h: number, x: number; do { h = rng.int(6, 15); x = rng.int(2, h - 2); } while (!safe(Math.sqrt(h * h - x * x), 1)); v = Math.sqrt(h * h - x * x); st = `${m(`${t.hyp} = ${h}\\,\\mathrm{cm}`)} et ${m(`${t.adj} = ${x}\\,\\mathrm{cm}`)}. Calcule ${m(t.opp)}, ${LEN_TXT.cm}.`; js = `Math.sqrt(${h * h - x * x})`; label = t.opp; good = 0; solv = ['Deux côtés connus, on cherche le troisième : Pythagore.', `${m(`${t.opp}^2 = ${h}^2 - ${x}^2 = ${h * h - x * x}`)}, donc ${m(`${t.opp} = \\sqrt{${h * h - x * x}} \\approx ${ax(v, 1)}\\,\\mathrm{cm}`)}.`]; }
    else if (kind === 'trigL') { let al: number, h: number; do { al = rng.int(20, 70); h = rng.int(5, 15); } while (!safe(h * sind(al), 1)); v = h * sind(al); st = `${m(`${t.hyp} = ${h}\\,\\mathrm{cm}`)} et ${m(`${t.ang} = ${deg(al)}`)}. Calcule ${m(t.opp)}, ${LEN_TXT.cm}.`; js = `${h}*Math.sin(${al}*Math.PI/180)`; label = t.opp; good = 1; solv = ['Un angle et un côté connus : trigonométrie.', `${m(`\\sin ${t.ang} = ${fr(t.opp, t.hyp)}`)}, donc ${m(`${t.opp} = ${h} \\times \\sin ${deg(al)} \\approx ${ax(v, 1)}\\,\\mathrm{cm}`)}.`]; }
    else { let x: number, y: number; do { x = rng.int(3, 12); y = rng.int(3, 12); } while (x === y || !safe(atand(y / x), 0)); v = atand(y / x); unit = '°'; dp = 0; st = `${m(`${t.adj} = ${x}\\,\\mathrm{cm}`)} et ${m(`${t.opp} = ${y}\\,\\mathrm{cm}`)}. Calcule ${m(t.ang)} au degré.`; js = `Math.atan(${y}/${x})*180/Math.PI`; label = t.ang; good = 1; solv = ['On cherche un angle : trigonométrie.', `${m(`\\tan ${t.ang} = ${fr(t.opp, t.adj)} = ${fr(y, x)}`)}, donc ${m(`${t.ang} \\approx ${ax(v, 0)}^\\circ`)}.`]; }
    const why = ['Pythagore relie trois côtés, sans angle.', 'La trigonométrie sert dès qu’un angle aigu est donné ou cherché.', 'La réciproque sert à savoir si un triangle est rectangle : ici on le sait déjà.', 'Pas de parallèles ici : Thalès ne s’applique pas.'];
    const steps: Step[] = [
      { prompt: 'a) Quel outil utiliser ?', answer: fixedChoice(opts, good, why.map((w, i) => (i === good ? null : w))), hint: 'Un angle intervient-il (donné ou cherché) ?' },
      step(`b) Calcule ${m(label)}.`, [kind === 'py3' ? { label: m(`${label} =`), expect: qd(v), form: 'any', unit } : approxF(m(`${label} \\approx`), v, dp, unit)], good === 0 ? 'Pythagore : hypoténuse² = somme des carrés des deux autres côtés.' : 'CAH SOH TOA.'),
    ];
    return { title: 'Choisis l’outil, puis calcule.', statement: `${rect(t)} ${st}`, steps, solution: solv, answer: `${good === 0 ? 'Pythagore' : 'Trigonométrie'} ; ${m(`${label} ${kind === 'py3' ? '=' : '\\approx'} ${kind === 'py3' ? dx(v) : ax(v, dp)}${unit === '°' ? '^\\circ' : '\\,\\mathrm{cm}'}`)}`, key: `${kind}:${st}`, data: { kind: 'js', items: [{ what: 'step:0', js: String(good), expect: good }, { what: 'v', js, expect: v, tol: 1e-9 }] } };
  },
};

// ===================================================================== problèmes
function sceneSvg(o: { w: number; h: number; base?: number; aria: string; angle: string; lw: string; lh: string; hyp?: string; obs?: number }) {
  // triangle rectangle « réel » : pied en (0,0), sommet (0,h), observateur (w,0) ; base = hauteur des yeux (décalage)
  const e = o.obs ?? 0;
  const P: Pt[] = [[0, 0], [o.w, 0], [0, o.h + e], [o.w, e], [0, e]];
  const { pts } = fit(P, 340, 200, 50);
  const [G, O, T, E, H] = pts;
  let b = line([G[0] - 10, G[1]], [O[0] + 14, O[1]], 'gf-line') + line(G, T, 'gf-par') + line(E, T, 'gf-line') + line(E, H, e ? 'gf-dash' : 'gf-line');
  if (e) b += line(O, E, 'gf-line') + text([O[0] + 20, (O[1] + E[1]) / 2 + 4], `${dx(e).replace('{,}', ',')} m`, 'gf-ts');
  b += rightMark(H, E, T, 10);
  { const u = (X: Pt) => { const d = Math.hypot(X[0] - E[0], X[1] - E[1]) || 1; return [(X[0] - E[0]) / d, (X[1] - E[1]) / d]; };
    const [a1, a2] = [u(H), u(T)], mx = a1[0] + a2[0], my = a1[1] + a2[1], dd = Math.hypot(mx, my) || 1;
    const near = Math.hypot(H[0] - E[0], H[1] - E[1]) < 80;
    const r = 22, p1: Pt = [E[0] + a1[0] * r, E[1] + a1[1] * r], p2: Pt = [E[0] + a2[0] * r, E[1] + a2[1] * r];
    b += `<path class="gf-arc" d="M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${r},${r} 0 0 ${a1[0] * a2[1] - a1[1] * a2[0] > 0 ? 1 : 0} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}"/>`;
    b += near ? text([E[0] + 14, E[1] - 12], o.angle, 'gf-tq', 'start') : text([E[0] + (mx / dd) * 42, E[1] + (my / dd) * 42 + 5], o.angle, 'gf-tq'); }
  b += text([(H[0] + E[0]) / 2, H[1] + 16], o.lw, o.lw === '?' ? 'gf-tq' : 'gf-ts') + text([T[0] - 10, (T[1] + H[1]) / 2], o.lh, o.lh === '?' ? 'gf-tq' : 'gf-ts', 'end');
  if (o.hyp) b += text([(E[0] + T[0]) / 2 + 12, (E[1] + T[1]) / 2 - 6], o.hyp, o.hyp === '?' ? 'gf-tq' : 'gf-ts', 'start');
  b += dot(E, 2.5) + dot(T, 2.5);
  return svgWrap(340, 220, o.aria, b);
}
export const probleme: Generator = {
  id: 'probleme', title: 'Problèmes (échelle, pente, visée)', stars: 2, levels: [2, 3], course: LINKS.s51, links: [LINKS.s52, LINKS.s53],
  desc: 'Repérer le triangle rectangle caché, nommer les côtés par rapport à l’angle ; ★★★ : deux étapes (antenne, isocèle, ombre).',
  example: 'h = 6 \\times \\sin 70^\\circ \\approx 5{,}6',
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: Item[] = [];
    let title = '', statement = '', figure: string | undefined, answer = '', key = '';
    if (level === 2) {
      const kind = rng.pick(['echelle', 'balcon', 'pente', 'cerf', 'rampe', 'toboggan'] as const);
      if (kind === 'echelle' || kind === 'toboggan') {
        let Lh: number, al: number;
        do { Lh = kind === 'echelle' ? rng.int(30, 90) / 10 : rng.int(30, 90) / 10; al = kind === 'echelle' ? rng.int(60, 80) : rng.int(25, 45); } while (!safe(Lh * sind(al), 1) || !safe(Lh * cosd(al), 1));
        const h = Lh * sind(al), d = Lh * cosd(al);
        const obj = kind === 'echelle' ? 'Une échelle' : 'Un toboggan rectiligne';
        title = kind === 'echelle' ? 'L’échelle contre le mur.' : 'Le toboggan.';
        statement = `${obj} de ${m(`${dx(Lh)}\\,\\mathrm{m}`)} ${kind === 'echelle' ? 'est appuyée contre un mur vertical et fait' : 'fait'} un angle de ${m(deg(al))} avec le sol horizontal.`;
        steps.push(step(`a) ${kind === 'echelle' ? 'À quelle hauteur arrive-t-elle' : 'Quelle est la hauteur du sommet'}, au décimètre ?`, [approxF('', h, 1, 'm')], `${kind === 'echelle' ? 'L’échelle' : 'Le toboggan'} est l’hypoténuse ; la hauteur est le côté opposé à l’angle : sinus.`, mist(roundQ(h, 1), [[roundQ(d, 1), 'Ça, c’est le côté adjacent (au sol) : la hauteur est opposée à l’angle.']])));
        steps.push(step(`b) ${kind === 'echelle' ? 'À quelle distance du mur est son pied' : 'Quelle distance horizontale couvre-t-il'}, au décimètre ?`, [approxF('', d, 1, 'm')], 'Côté adjacent et hypoténuse : cosinus.', mist(roundQ(d, 1), [[roundQ(h, 1), 'C’est la hauteur : la distance au sol est adjacente à l’angle.']])));
        sol.push(`Le mur (vertical), le sol et ${kind === 'echelle' ? 'l’échelle' : 'le toboggan'} forment un triangle rectangle ; l’hypoténuse mesure ${m(`${dx(Lh)}\\,\\mathrm{m}`)}.`, `Hauteur (opposée) : ${m(`${dx(Lh)} \\times \\sin ${deg(al)} \\approx ${ax(h, 1)}\\,\\mathrm{m}`)}.`, `Distance au sol (adjacente) : ${m(`${dx(Lh)} \\times \\cos ${deg(al)} \\approx ${ax(d, 1)}\\,\\mathrm{m}`)}.`);
        items.push({ what: 'h', js: `${Lh}*Math.sin(${al}*Math.PI/180)`, expect: h, tol: 1e-9 }, { what: 'd', js: `${Lh}*Math.cos(${al}*Math.PI/180)`, expect: d, tol: 1e-9 });
        figure = sceneSvg({ w: d, h, angle: `${al}°`, lw: '?', lh: '?', hyp: `${dx(Lh).replace('{,}', ',')} m`, aria: `${obj} de ${dx(Lh)} m faisant ${al}° avec le sol` });
        answer = `${m(`${ax(h, 1)}\\,\\mathrm{m}`)} ; ${m(`${ax(d, 1)}\\,\\mathrm{m}`)}`; key = `${kind}:${Lh}:${al}`;
      } else if (kind === 'balcon' || kind === 'rampe') {
        let h: number, al: number;
        do { h = kind === 'balcon' ? rng.int(6, 30) : rng.int(2, 9) / 10; al = kind === 'balcon' ? rng.int(20, 60) : rng.int(3, 6); } while (!safe(h / tand(al), 1));
        const d = h / tand(al);
        title = kind === 'balcon' ? 'Vu du balcon.' : 'La rampe d’accès.';
        statement = kind === 'balcon' ? `D’un balcon situé à ${m(`${h}\\,\\mathrm{m}`)} de hauteur, on voit un chat au sol. La droite balcon-chat fait un angle de ${m(deg(al))} avec le sol. À quelle distance du pied de l’immeuble est le chat (au décimètre) ?` : `Une rampe doit permettre de monter une marche de ${m(`${dx(h)}\\,\\mathrm{m}`)}. Son angle avec le sol ne doit pas dépasser ${m(deg(al))}. Quelle longueur horizontale minimale faut-il prévoir (au décimètre) ?`;
        steps.push(step('Calcule cette distance.', [approxF('', d, 1, 'm')], `La hauteur est opposée à l’angle, la distance au sol est adjacente : tangente, inconnue en bas.`, mist(roundQ(d, 1), [[roundQ(h * tand(al), 1), 'Inconnue en bas : on **divise** par la tangente.'], [roundQ(h / sind(al), 1), 'Ça, c’est la longueur en biais (hypoténuse) : on veut la distance horizontale.']])));
        sol.push(`Triangle rectangle au sol. Pour l’angle de ${m(deg(al))} : hauteur ${m(`${dx(h)}\\,\\mathrm{m}`)} opposée, distance ${m('d')} adjacente.`, `${m(`\\tan ${deg(al)} = ${fr(dx(h), 'd')}`)}, donc ${m(`d = ${fr(dx(h), `\\tan ${deg(al)}`)} \\approx ${ax(d, 1)}\\,\\mathrm{m}`)}.`);
        items.push({ what: 'd', js: `${h}/Math.tan(${al}*Math.PI/180)`, expect: d, tol: 1e-9 });
        figure = sceneSvg({ w: d, h, angle: `${al}°`, lw: '?', lh: `${dx(h).replace('{,}', ',')} m`, aria: `Hauteur ${dx(h)} m, angle ${al}° au sol, distance horizontale cherchée` });
        answer = m(`${ax(d, 1)}\\,\\mathrm{m}`); key = `${kind}:${h}:${al}`;
      } else if (kind === 'pente') {
        let p: number; do { p = rng.int(3, 25); } while (!safe(atand(p / 100), 1));
        const a = atand(p / 100);
        title = 'La pente d’une route.';
        statement = `Un panneau indique une pente de ${m(`${p}\\,\\%`)}.`;
        steps.push(step('a) Combien monte-t-on pour 100 m parcourus à l’horizontale ?', [{ label: '', expect: q(p), form: 'any', unit: 'm' }], `${p} % : ${p} m pour 100 m à l’horizontale.`));
        steps.push(step('b) Angle d’inclinaison de la route, au dixième de degré ?', [approxF('', a, 1, '°')], `${m(`\\tan \\alpha = ${fr(p, 100)}`)}, puis ${m('\\tan^{-1}')}.`, mist(roundQ(a, 1), [[roundQ(p * 0.9, 1), 'La pente n’est pas l’angle en degrés : tan α = pente / 100.'], [roundQ(asind(p / 100), 1), 'Les 100 m sont horizontaux (adjacents) : c’est la tangente, pas le sinus.']])));
        sol.push(`${m(`${p}\\,\\%`)} : on monte de ${m(`${p}\\,\\mathrm{m}`)} quand on avance de ${m('100\\,\\mathrm{m}')} à l’horizontale.`, `${m(`\\tan \\alpha = ${fr(p, 100)} = ${dx(p / 100)}`)}, donc ${m(`\\alpha = \\tan^{-1}(${dx(p / 100)}) \\approx ${ax(a, 1)}^\\circ`)}.`);
        items.push({ what: 'p', js: String(p), expect: p }, { what: 'a', js: `Math.atan(${p}/100)*180/Math.PI`, expect: a, tol: 1e-9 });
        figure = sceneSvg({ w: 100, h: p, angle: 'α', lw: '100 m', lh: `${p} m`, aria: `Pente ${p} % : ${p} m de dénivelé pour 100 m à l’horizontale` });
        answer = m(`${ax(a, 1)}^\\circ`); key = `pente:${p}`;
      } else {
        let Lf: number, al: number, e: number;
        do { Lf = rng.int(20, 80); al = rng.int(30, 70); e = rng.pick([1, 1.2, 1.5, 0.8]); } while (!safe(Lf * sind(al) + e, 1));
        const h = Lf * sind(al), H = h + e;
        title = 'Le cerf-volant.';
        statement = `Le fil d’un cerf-volant est tendu et mesure ${m(`${Lf}\\,\\mathrm{m}`)}. Il fait un angle de ${m(deg(al))} avec l’horizontale. La main qui tient le fil est à ${m(`${dx(e)}\\,\\mathrm{m}`)} du sol.`;
        steps.push(step('À quelle hauteur vole le cerf-volant (au décimètre) ?', [approxF('', H, 1, 'm')], 'Le fil est l’hypoténuse ; la hauteur au-dessus de la main est opposée à l’angle : sinus. N’oublie pas la main.', mist(roundQ(H, 1), [[roundQ(h, 1), `C’est la hauteur au-dessus de la main : ajoute ${dx(e).replace('{,}', ',')} m.`], [roundQ(Lf * cosd(al) + e, 1), 'La hauteur est opposée à l’angle : sinus, pas cosinus.']])));
        sol.push(`Le fil est l’hypoténuse. Au-dessus de la main : ${m(`${Lf} \\times \\sin ${deg(al)} \\approx ${ax(h, 2)}\\,\\mathrm{m}`)}.`, `Hauteur du cerf-volant : ${m(`${ax(h, 2)} + ${dx(e)} \\approx ${ax(H, 1)}\\,\\mathrm{m}`)}.`);
        items.push({ what: 'H', js: `${Lf}*Math.sin(${al}*Math.PI/180)+${e}`, expect: H, tol: 1e-9 });
        figure = sceneSvg({ w: Lf * cosd(al), h, obs: e, angle: `${al}°`, lw: '', lh: '?', hyp: `${Lf} m`, aria: `Fil de ${Lf} m à ${al}° de l’horizontale, main à ${dx(e)} m du sol` });
        answer = m(`${ax(H, 1)}\\,\\mathrm{m}`); key = `cerf:${Lf}:${al}:${e}`;
      }
    } else {
      const kind = rng.pick(['antenne', 'isocele', 'ombre'] as const);
      if (kind === 'antenne') {
        let d: number, a1: number, a2: number;
        do { d = rng.int(20, 80); a1 = rng.int(20, 50); a2 = a1 + rng.int(3, 8); } while (!safe(d * (tand(a2) - tand(a1)), 1));
        const h1 = d * tand(a1), h2 = d * tand(a2), A = h2 - h1;
        title = 'La hauteur de l’antenne.';
        statement = `Depuis un point ${m('P')} du sol, à ${m(`${d}\\,\\mathrm{m}`)} du pied d’un immeuble, on voit le haut de l’immeuble sous un angle de ${m(deg(a1))} et le haut de l’antenne posée sur le toit sous un angle de ${m(deg(a2))}.`;
        steps.push(step('a) Hauteur de l’immeuble et hauteur du haut de l’antenne, au centième ?', [approxF('Immeuble :', h1, 2, 'm'), approxF('Haut de l’antenne :', h2, 2, 'm')], 'Distance au sol adjacente, hauteur opposée : tangente (inconnue en haut).'));
        steps.push(step('b) Hauteur de l’antenne, au décimètre ?', [approxF('', A, 1, 'm')], 'Différence des deux hauteurs (avec les valeurs non arrondies).', mist(roundQ(A, 1), [[roundQ(d * tand(a2 - a1), 1), `On ne peut pas soustraire les angles : ${m(`\\tan(${a2}^\\circ - ${a1}^\\circ)`)} n’a pas de sens ici.`]])));
        sol.push(`Immeuble : ${m(`${d} \\times \\tan ${deg(a1)} \\approx ${ax(h1, 2)}\\,\\mathrm{m}`)}. Haut de l’antenne : ${m(`${d} \\times \\tan ${deg(a2)} \\approx ${ax(h2, 2)}\\,\\mathrm{m}`)}.`, `Antenne : ${m(`${d} \\times (\\tan ${deg(a2)} - \\tan ${deg(a1)}) \\approx ${ax(A, 1)}\\,\\mathrm{m}`)}.`);
        items.push({ what: 'h1', js: `${d}*Math.tan(${a1}*Math.PI/180)`, expect: h1, tol: 1e-9 }, { what: 'h2', js: `${d}*Math.tan(${a2}*Math.PI/180)`, expect: h2, tol: 1e-9 }, { what: 'A', js: `${d}*(Math.tan(${a2}*Math.PI/180)-Math.tan(${a1}*Math.PI/180))`, expect: A, tol: 1e-9 });
        answer = m(`${ax(A, 1)}\\,\\mathrm{m}`); key = `ant:${d}:${a1}:${a2}`;
      } else if (kind === 'isocele') {
        let s: number, b: number;
        do { s = rng.int(5, 15); b = rng.int(4, 2 * s - 2); } while (!safe(acosd(b / 2 / s), 1) || b === s);
        const B = acosd(b / 2 / s), Aa = 180 - 2 * B;
        title = 'Les angles d’un triangle isocèle.';
        statement = `${m('ABC')} est isocèle en ${m('A')} avec ${m(`AB = AC = ${s}\\,\\mathrm{cm}`)} et ${m(`BC = ${b}\\,\\mathrm{cm}`)}. ${m('H')} est le milieu de ${m('[BC]')}.`;
        steps.push({ prompt: `a) Pourquoi ${m('ABH')} est-il rectangle en ${m('H')} ?`, answer: shuffledChoice(rng, 'Dans un triangle isocèle, la médiane issue du sommet principal est aussi une hauteur.', [['Parce que H est le milieu de [BC].', 'Le milieu seul ne suffit pas : c’est le fait que ABC soit isocèle en A qui rend (AH) perpendiculaire.'], ['D’après le théorème de Pythagore.', 'On n’a pas les longueurs AH et BH… et ce n’est pas la bonne justification.']]), hint: 'Propriété du triangle isocèle.' });
        steps.push(step(`b) Calcule ${m('\\widehat{ABC}')} au dixième de degré.`, [approxF(m('\\widehat{ABC} \\approx'), B, 1, '°')], `${m(`BH = ${dx(b / 2)}`)} ; dans ${m('ABH')}, ${m(`\\cos \\widehat{ABC} = ${fr('BH', 'AB')}`)}.`, mist(roundQ(B, 1), [[safe(acosd(b / s), 1) && b < s ? roundQ(acosd(b / s), 1) : null, `Il faut ${m('BH')}, la **moitié** de ${m('BC')}.`]])));
        steps.push(step('c) Les angles en C et en A, au dixième de degré ?', [approxF(m('\\widehat{ACB} \\approx'), B, 1, '°'), approxF(m('\\widehat{BAC} \\approx'), Aa, 1, '°')], 'Triangle isocèle : angles à la base égaux ; somme 180°.'));
        sol.push('a) Dans un triangle isocèle, la médiane issue du sommet principal est aussi une hauteur : ' + m('(AH) \\perp (BC)') + '.', `b) ${m(`BH = ${dx(b / 2)}`)} ; ${m(`\\cos \\widehat{ABC} = ${fr('BH', 'AB')} = ${fr(dx(b / 2), s)}`)}, donc ${m(`\\widehat{ABC} \\approx ${ax(B, 1)}^\\circ`)}.`, `c) ${m(`\\widehat{ACB} = \\widehat{ABC} \\approx ${ax(B, 1)}^\\circ`)} et ${m(`\\widehat{BAC} \\approx 180^\\circ - 2 \\times ${ax(B, 1)}^\\circ \\approx ${ax(Aa, 1)}^\\circ`)}.`);
        items.push({ what: 'step:0', js: '0', expect: 0 }, { what: 'B', js: `Math.acos(${b}/2/${s})*180/Math.PI`, expect: B, tol: 1e-9 }, { what: 'C', js: `Math.acos(${b}/2/${s})*180/Math.PI`, expect: B, tol: 1e-9 }, { what: 'A', js: `180-2*Math.acos(${b}/2/${s})*180/Math.PI`, expect: Aa, tol: 1e-9 });
        items.shift();
        answer = `${m(`${ax(B, 1)}^\\circ`)}, ${m(`${ax(B, 1)}^\\circ`)}, ${m(`${ax(Aa, 1)}^\\circ`)}`; key = `iso:${s}:${b}`;
      } else {
        let h: number, a: number, L2: number;
        do { h = rng.int(3, 25); a = rng.int(20, 70); L2 = rng.int(Math.ceil(h * 0.4), h * 3); } while (!safe(h / tand(a), 1) || !safe(atand(h / L2), 0));
        const L = h / tand(a), b2 = atand(h / L2);
        title = 'L’ombre d’un arbre.';
        statement = `Un arbre vertical mesure ${m(`${h}\\,\\mathrm{m}`)}.`;
        steps.push(step(`a) Quand le soleil est à ${m(deg(a))} au-dessus de l’horizon, quelle est la longueur de l’ombre, au décimètre ?`, [approxF('', L, 1, 'm')], 'L’arbre est opposé à l’angle, l’ombre adjacente : tangente, inconnue en bas.', mist(roundQ(L, 1), [[roundQ(h * tand(a), 1), 'Inconnue en bas : on divise.']])));
        steps.push(step(`b) Plus tard, l’ombre mesure ${m(`${L2}\\,\\mathrm{m}`)}. Quelle est alors la hauteur du soleil, au degré ?`, [approxF('', b2, 0, '°')], `${m(`\\tan \\alpha = ${fr(h, L2)}`)}.`, mist(roundQ(b2, 0), [[roundQ(atand(L2 / h), 0), 'Rapport à l’envers : opposé (arbre) sur adjacent (ombre).']])));
        sol.push(`a) ${m(`\\tan ${deg(a)} = ${fr(h, 'L')}`)}, donc ${m(`L = ${fr(h, `\\tan ${deg(a)}`)} \\approx ${ax(L, 1)}\\,\\mathrm{m}`)}.`, `b) ${m(`\\tan \\alpha = ${fr(h, L2)}`)}, donc ${m(`\\alpha \\approx ${ax(b2, 0)}^\\circ`)}.`);
        items.push({ what: 'L', js: `${h}/Math.tan(${a}*Math.PI/180)`, expect: L, tol: 1e-9 }, { what: 'b', js: `Math.atan(${h}/${L2})*180/Math.PI`, expect: b2, tol: 1e-9 });
        figure = sceneSvg({ w: L, h, angle: `${a}°`, lw: '?', lh: `${h} m`, aria: `Arbre de ${h} m, soleil à ${a}°, ombre cherchée` });
        answer = `${m(`${ax(L, 1)}\\,\\mathrm{m}`)} ; ${m(`${ax(b2, 0)}^\\circ`)}`; key = `ombre:${h}:${a}:${L2}`;
      }
    }
    return { title, statement, figure, steps, solution: sol, answer, key, data: { kind: 'js', items } };
  },
};

// ===================================================================== erreur
const ER = {
  mult: 'L’inconnue est au dénominateur : il fallait diviser, pas multiplier.',
  cote: 'Mauvais côté : il a pris le côté adjacent pour le côté opposé (ou l’inverse).',
  radians: 'La calculatrice était en mode radians.',
  arrondi: 'Le rapport a été arrondi trop tôt.',
} as const;
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s36, links: [LINKS.s44],
  desc: 'Multiplier au lieu de diviser, adjacent / opposé confondus, mode radians, rapport arrondi trop tôt.',
  example: 'AC = 5 \\times \\cos 40^\\circ \\;?',
  generate(rng: Rng) {
    const kind = rng.pick(Object.keys(ER) as (keyof typeof ER)[]);
    const who = rng.pick(NAMES), t = pickTri(rng);
    const steps: Step[] = [{ prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, ER[kind], (Object.keys(ER) as (keyof typeof ER)[]).filter((k) => k !== kind).map((k) => [ER[k], 'Non : relis bien son calcul.'] as [Rich, Rich])), hint: 'Refais le calcul toi-même, puis compare.' }];
    const sol: Rich[] = [ER[kind]];
    const items: Item[] = [];
    let quote = '', key = '';
    if (kind === 'mult') {
      let a: number, x: number; do { a = rng.int(25, 65); x = rng.int(30, 120) / 10; } while (!safe(x / cosd(a), 1) || !safe(x * cosd(a), 1));
      const v = x / cosd(a), w = x * cosd(a);
      quote = `« ${rect(t).replace('Le triangle', 'Le triangle')} ${m(`${t.ang} = ${deg(a)}`)}, ${m(`${t.adj} = ${dx(x)}`)}. ${m(`\\cos ${deg(a)} = ${fr(t.adj, t.hyp)}`)}, donc ${m(`${t.hyp} = ${dx(x)} \\times \\cos ${deg(a)} \\approx ${ax(w, 1)}`)}. »`;
      steps.push(step(`Calcule correctement ${m(t.hyp)}, au dixième.`, [approxF(m(`${t.hyp} \\approx`), v, 1)], 'Inconnue en bas : on divise.', mist(roundQ(v, 1), [[roundQ(w, 1), 'C’est le calcul faux.']])));
      sol.push(`${m(`${t.hyp} = ${fr(dx(x), `\\cos ${deg(a)}`)} \\approx ${ax(v, 1)}`)}. Contrôle : l’hypoténuse doit être plus longue que ${m(`${t.adj} = ${dx(x)}`)} ; ${m(ax(w, 1))} était impossible.`);
      items.push({ what: 'v', js: `${x}/Math.cos(${a}*Math.PI/180)`, expect: v, tol: 1e-9 }); key = `${a}:${x}`;
    } else if (kind === 'cote') {
      quote = `« ${rect(t)} Donc ${m(`\\sin ${t.ang} = ${fr(t.adj, t.hyp)}`)}. »`;
      steps.push({ prompt: `Quel est le bon rapport pour ${m(`\\sin ${t.ang}`)} ?`, answer: shuffledChoice(rng, m(fr(t.opp, t.hyp)), [[m(fr(t.adj, t.hyp)), 'C’est le cosinus.'], [m(fr(t.opp, t.adj)), 'C’est la tangente.']]), hint: `${m(`[${t.adj}]`)} touche l’angle : il est adjacent.` });
      sol.push(`${m(`[${t.adj}]`)} touche ${m(t.ang)} : c’est le côté adjacent, donc ${m(`${fr(t.adj, t.hyp)} = \\cos ${t.ang}`)}. Le sinus est ${m(`\\sin ${t.ang} = ${fr(t.opp, t.hyp)}`)}.`);
      key = `${t.name}${t.R}${t.P}`;
    } else if (kind === 'radians') {
      const a = rng.pick([30, 45, 60, 20, 40, 50, 70, 80]), f = rng.pick(['cos', 'sin'] as Fn[]);
      const wv = F(f, a * 180 / Math.PI);
      quote = `« Je tape ${m(`\\${f}(${a})`)} et je lis ${m(ax(wv, 3))}. ${wv < 0 ? `Donc le ${f === 'cos' ? 'cosinus' : 'sinus'} de ${m(deg(a))} est négatif.` : `Donc ${m(`\\${f} ${deg(a)} \\approx ${ax(wv, 3)}`)}.`} »`;
      steps.push(step(`Quelle est la vraie valeur de ${m(`\\${f} ${deg(a)}`)}, au millième ?`, [approxF('', F(f, a), 3)], 'Mode degrés.', mist(roundQ(F(f, a), 3), [[roundQ(wv, 3), 'C’est la valeur en radians.']])));
      sol.push(`En mode degrés, ${m(`\\${f} ${deg(a)} \\approx ${ax(F(f, a), 3)}`)}. Le cosinus et le sinus d’un angle aigu sont toujours entre 0 et 1.`);
      items.push({ what: 'v', js: `Math.${f}(${a}*Math.PI/180)`, expect: F(f, a), tol: 1e-9 }); key = `${f}${a}`;
    } else {
      let a: number, b: number;
      do { a = rng.int(2, 9); b = rng.int(a + 1, 12); } while (Math.round(acosd(round(a / b, 1))) === Math.round(acosd(a / b)) || !safe(acosd(a / b), 0) || !safe(acosd(round(a / b, 1)), 0) || [0, 1].includes(round(a / b, 1)));
      const good = acosd(a / b), bad = acosd(round(a / b, 1));
      quote = `« ${m(`\\cos \\widehat{A} = ${fr(a, b)} \\approx ${dx(round(a / b, 1))}`)}, donc ${m(`\\widehat{A} = \\cos^{-1}(${dx(round(a / b, 1))}) \\approx ${ax(bad, 0)}^\\circ`)}. »`;
      steps.push(step(`Quelle est la bonne valeur de ${m('\\widehat{A}')}, au degré ?`, [approxF(m('\\widehat{A} \\approx'), good, 0, '°')], 'Tape la fraction entière.', mist(roundQ(good, 0), [[roundQ(bad, 0), 'C’est le résultat faux.']])));
      sol.push(`${m(`\\cos^{-1}\\left(${fr(a, b)}\\right) \\approx ${ax(good, 1)}^\\circ`)}, soit ${m(`${ax(good, 0)}^\\circ`)} et non ${m(`${ax(bad, 0)}^\\circ`)}.`);
      items.push({ what: 'v', js: `Math.acos(${a}/${b})*180/Math.PI`, expect: good, tol: 1e-9 }); key = `${a}/${b}`;
    }
    return { title: 'Trouve l’erreur.', statement: `${who} écrit : ${quote}`, steps, solution: sol, answer: ER[kind], key: `${kind}:${key}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== valeurs exactes
export const exact: Generator = {
  id: 'exact', title: 'Valeurs exactes et relations', stars: 3, levels: [3], course: LINKS.s61,
  desc: 'À partir d’un rapport exact : troisième côté par Pythagore, autres rapports exacts, cos² + sin² = 1, sin α = cos β.',
  example: '\\cos \\alpha = \\dfrac{5}{13} \\Rightarrow \\sin \\alpha = \\dfrac{12}{13}',
  generate(rng: Rng) {
    if (rng.chance(0.35)) {
      // demi-triangle équilatéral : valeurs exactes
      const h = rng.int(2, 15) * 2, t = pickTri(rng), a = rng.pick([30, 60]);
      const half = h / 2;
      const oppV = a === 30 ? q(half) : null;
      const steps: Step[] = [
        step(`a) Côté opposé à l’angle de ${m(deg(30))} ?`, [{ label: '', expect: q(half), form: 'any', unit: 'cm' }], 'Demi-triangle équilatéral : ce côté vaut la moitié de l’hypoténuse.', mist(q(half), [[q(h), 'C’est l’hypoténuse ; le côté opposé à 30° en est la moitié.']])),
        step(`b) Troisième côté, valeur exacte de la forme ${m('k\\sqrt{3}')} : donne ${m('k')}.`, [{ label: m('k ='), expect: q(half), form: 'any' }], `Pythagore : ${m(`${h}^2 - ${half}^2 = ${h * h - half * half} = ${half * half} \\times 3`)}.`, mist(q(half), [[q(half * half), `${m(`\\sqrt{${half * half} \\times 3} = ${half}\\sqrt{3}`)} : on prend la racine de ${half * half}.`]])),
      ];
      void oppV;
      return { title: `Un angle de ${m(deg(a))}, valeurs exactes.`, statement: `${rect(t)} ${m(`${t.ang} = ${deg(a)}`)} et l’hypoténuse ${m(`${t.hyp} = ${h}\\,\\mathrm{cm}`)}. C’est la moitié d’un triangle équilatéral de côté ${m(String(h))}.`, steps, solution: [`Le côté opposé à l’angle de ${m(deg(30))} vaut la moitié de l’hypoténuse : ${m(`${half}\\,\\mathrm{cm}`)} (${m(`\\sin 30^\\circ = ${fr(1, 2)}`)}).`, `Pythagore : ${m(`x^2 = ${h}^2 - ${half}^2 = ${h * h - half * half}`)}, donc ${m(`x = \\sqrt{${h * h - half * half}} = ${half}\\sqrt{3} \\approx ${ax(half * Math.sqrt(3), 2)}\\,\\mathrm{cm}`)}.`], answer: `${m(`${half}\\,\\mathrm{cm}`)} et ${m(`${half}\\sqrt{3}\\,\\mathrm{cm}`)}`, key: `eq:${h}:${a}:${t.name}${t.R}${t.P}`, data: { kind: 'js', items: [{ what: 'o', js: `${h}*Math.sin(Math.PI/6)`, expect: half, tol: 1e-9 }, { what: 'k', js: `Math.sqrt(${h * h - half * half}/3)`, expect: half, tol: 1e-9 }] } };
    }
    const [a0, b0, c0] = rng.pick(triplets(60));
    const kk = 1, sw = rng.chance(0.5), A = (sw ? b0 : a0) * kk, O = (sw ? a0 : b0) * kk, H = c0 * kk;
    const f = rng.pick(['cos', 'sin'] as Fn[]);
    const given = f === 'cos' ? q(A, H) : q(O, H), other = f === 'cos' ? q(O, H) : q(A, H), tn = q(O, A);
    const known = f === 'cos' ? A : O, third = f === 'cos' ? O : A;
    const steps: Step[] = [
      step(`a) On dessine un triangle rectangle de côté ${f === 'cos' ? 'adjacent' : 'opposé'} ${m(String(known))} et d’hypoténuse ${m(String(H))}. Calcule le troisième côté.`, [{ label: '', expect: q(third), form: 'any' }], `Pythagore : ${m(`${H}^2 - ${known}^2`)}.`, mist(q(third), [[q(H - known), 'On soustrait les **carrés**, puis racine carrée.']])),
      step(`b) Donne ${m(`\\${f === 'cos' ? 'sin' : 'cos'} \\alpha`)} et ${m('\\tan \\alpha')} (fractions).`, [{ label: m(`\\${f === 'cos' ? 'sin' : 'cos'} \\alpha =`), expect: other, form: 'any', shown: fr(other.n, other.d) }, { label: m('\\tan \\alpha ='), expect: tn, form: 'any', shown: tn.d === 1 ? String(tn.n) : fr(tn.n, tn.d) }], 'CAH SOH TOA avec les trois côtés.', [{ on: 'num', field: 1, value: q(A, O), msg: 'Tangente = opposé / adjacent (pas l’inverse).' }]),
      step(`c) Calcule ${m('(\\cos \\alpha)^2 + (\\sin \\alpha)^2')}.`, [{ label: '', expect: q(1), form: 'any' }], 'Additionne les carrés des deux fractions.', mist(q(1), [[add(given, other), 'On additionne les **carrés**, pas les fractions elles-mêmes.']])),
      { prompt: `d) ${m('\\beta')} est l’autre angle aigu du triangle. Que vaut ${m('\\cos \\beta')} ?`, answer: shuffledChoice(rng, m(`\\sin \\alpha = ${fr(O, H)}`), [[m(`\\cos \\alpha = ${fr(A, H)}`), 'Pour β, les côtés adjacent et opposé s’échangent.'], [m(`\\tan \\alpha = ${fr(O, A)}`), 'Un cosinus a l’hypoténuse au dénominateur.']]), hint: 'Le côté opposé à α est adjacent à β.' },
    ];
    const items: Item[] = [{ what: 't', js: `Math.sqrt(${H * H - known * known})`, expect: third }, { what: 'o', js: `${f === 'cos' ? O : A}/${H}`, expect: toNum(other) }, { what: 'tan', js: `${O}/${A}`, expect: toNum(tn) }, { what: 'one', js: `(${A}/${H})**2+(${O}/${H})**2`, expect: 1, tol: 1e-12 }];
    const sol: Rich[] = [`a) ${m(`x^2 = ${H}^2 - ${known}^2 = ${H * H - known * known}`)}, donc ${m(`x = ${third}`)}.`, `b) Adjacent ${m(String(A))}, opposé ${m(String(O))}, hypoténuse ${m(String(H))} : ${m(`\\sin \\alpha = ${fr(O, H)}`)}, ${m(`\\cos \\alpha = ${fr(A, H)}`)}, ${m(`\\tan \\alpha = ${fr(O, A)}`)}.`, `c) ${m(`${fr(A * A, H * H)} + ${fr(O * O, H * H)} = ${fr(H * H, H * H)} = 1`)}.`, `d) Le côté opposé à ${m('\\alpha')} est adjacent à ${m('\\beta')}, l’hypoténuse est la même : ${m(`\\cos \\beta = \\sin \\alpha = ${fr(O, H)}`)}.`];
    void mul; void div; void eq;
    return { title: `On sait que ${m(`\\${f} \\alpha = ${fr(known, H)}`)}.`, statement: `${m('\\alpha')} est un angle aigu.`, steps, solution: sol, answer: `${m(`\\${f === 'cos' ? 'sin' : 'cos'} \\alpha = ${fr(other.n, other.d)}`)}, ${m(`\\tan \\alpha = ${tn.d === 1 ? tn.n : fr(tn.n, tn.d)}`)}`, key: `${A},${O},${H}:${f}`, data: { kind: 'js', items } };
  },
};
