/**
 * Théorème de Thalès : écrire les rapports (★), produit en croix (★), calculer des longueurs dans des triangles
 * emboîtés (★ → ★★), en papillon (★★), avec un segment « restant » (★★).
 * Construction à rebours : on choisit le rapport k = p/q et un grand triangle dont les côtés sont des multiples
 * de q (le petit triangle a alors des côtés décimaux courts), on dessine la figure à l'échelle, puis on choisit
 * les longueurs données et celles demandées.
 */
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type Q, q, mul, div, add, sub, eq, toNum, cmp } from '../engine/q';
import { mist, shuffledChoice } from '../engine/build';
import { LINKS, m, fr, nq, ql, KS, bigTriangle, pickNames, segs, thalesSvg, L, lenF, lenApprox, round, roundQ, dx, type Names, type SegKey } from './common';

const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });

/** Configuration de Thalès complète (valeurs exactes). */
export interface Conf {
  n: Names;
  S: Record<SegKey, string>;
  k: Q;
  butterfly: boolean;
  v: Record<SegKey, Q>;
  num: { AB: number; AC: number; BC: number };
}
export function makeConf(rng: Rng, butterfly: boolean, o: { plain?: boolean; ks?: [number, number][]; min?: number; max?: number; h?: number[] } = {}): Conf {
  for (let t = 0; t < 200; t++) {
    const [p, qq] = rng.pick(o.ks ?? KS);
    const T = bigTriangle(rng, qq, { min: o.min, max: o.max, h: o.h });
    const k = q(p, qq);
    const AB = ql(T.AB), AC = ql(T.AC), BC = ql(T.BC);
    const v: Record<SegKey, Q> = { AB, AC, BC, AD: mul(AB, k), AE: mul(AC, k), DE: mul(BC, k), DB: butterfly ? add(AB, mul(AB, k)) : sub(AB, mul(AB, k)), EC: butterfly ? add(AC, mul(AC, k)) : sub(AC, mul(AC, k)) };
    if ([v.AD, v.AE, v.DE].some((x) => toNum(x) < 1.2)) continue;
    // pas deux longueurs données identiques par hasard dans un même rapport (AD = AE et AB = AC trop souvent)
    const n = pickNames(rng, o.plain);
    return { n, S: segs(n), k, butterfly, v, num: T };
  }
  throw new Error('makeConf');
}
/** Figure de la configuration : longueurs connues affichées, inconnues « ? ». */
export function confSvg(c: Conf, known: SegKey[], ask: SegKey[], rng: Rng, aria: string): string {
  const labels: Partial<Record<SegKey, string>> = {};
  for (const s of known) labels[s] = L(c.v[s]);
  for (const s of ask) labels[s] = '?';
  return thalesSvg({ n: c.n, ...c.num, k: (c.butterfly ? -1 : 1) * toNum(c.k), labels, ask, rot: rng.pick([0, 0, 0.25, -0.2, Math.PI, 0.5]), flip: rng.chance(0.5), aria });
}
/** Les trois rapports dans l'ordre du cours. */
export const COLS: [SegKey, SegKey][] = [['AD', 'AB'], ['AE', 'AC'], ['DE', 'BC']];
export const ratioTex = (c: Conf, vals?: Partial<Record<SegKey, string>>) => COLS.map(([t, b]) => fr(vals?.[t] ?? c.S[t], vals?.[b] ?? c.S[b])).join(' = ');
/** Justification (points alignés / droites sécantes) + égalité des rapports. */
export function justif(c: Conf): Rich {
  const { n } = c;
  return c.butterfly
    ? `Les droites ${m(`(${n.D}${n.B})`)} et ${m(`(${n.E}${n.C})`)} sont sécantes en ${m(n.A)}, et ${m(`(${n.D}${n.E}) \\parallel (${n.B}${n.C})`)}. D’après le théorème de Thalès :`
    : `Les points ${m(n.A)}, ${m(n.D)}, ${m(n.B)} sont alignés, ainsi que ${m(n.A)}, ${m(n.E)}, ${m(n.C)}, et ${m(`(${n.D}${n.E}) \\parallel (${n.B}${n.C})`)}. D’après le théorème de Thalès :`;
}
/** Calcul d'une inconnue avec la colonne connue kc ; renvoie valeur exacte, ligne de corrigé et erreur « rapport retourné ». */
export function solveCol(c: Conf, kc: number, unk: SegKey, given: Partial<Record<SegKey, Q>> = c.v) {
  const [tk, bk] = COLS[kc];
  const col = COLS.find((p) => p.includes(unk))!;
  const top = col[0] === unk;
  const other = top ? col[1] : col[0];
  const T = given[tk]!, B = given[bk]!, O = given[other]!;
  const val = top ? div(mul(T, O), B) : div(mul(B, O), T);
  const tex = top ? `${c.S[unk]} = ${fr(`${nq(T)} \\times ${nq(O)}`, nq(B))}` : `${c.S[unk]} = ${fr(`${nq(B)} \\times ${nq(O)}`, nq(T))}`;
  const wrong = top ? div(mul(B, O), T) : div(mul(T, O), B);
  return { val, tex, wrong, js: top ? `${toNum(T)}*${toNum(O)}/${toNum(B)}` : `${toNum(B)}*${toNum(O)}/${toNum(T)}` };
}
const CONFTXT = (c: Conf) => {
  const { n } = c;
  return c.butterfly
    ? `Les points ${m(n.D)}, ${m(n.A)}, ${m(n.B)} sont alignés dans cet ordre, ainsi que ${m(n.E)}, ${m(n.A)}, ${m(n.C)}. Les droites ${m(`(${n.D}${n.E})`)} et ${m(`(${n.B}${n.C})`)} sont parallèles.`
    : `${m(n.D)} est sur ${m(`[${n.A}${n.B}]`)}, ${m(n.E)} est sur ${m(`[${n.A}${n.C}]`)} et les droites ${m(`(${n.D}${n.E})`)} et ${m(`(${n.B}${n.C})`)} sont parallèles.`;
};
const givenTxt = (c: Conf, known: SegKey[], unit = 'cm') => {
  const t = known.map((s) => m(`${c.S[s]} = ${nq(c.v[s])}\\,\\mathrm{${unit}}`));
  return t.length > 1 ? `${t.slice(0, -1).join(', ')} et ${t[t.length - 1]}` : t.join('');
};

// ===================================================================== écrire les rapports
export const rapports: Generator = {
  id: 'rapports',
  title: 'Écrire les rapports',
  desc: 'Petit triangle en haut, grand en bas ; triangles emboîtés ou papillon ; pas de segment « restant ».',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{AD}{AB} = \\dfrac{AE}{AC} = \\dfrac{DE}{BC}',
  course: LINKS.s24,
  links: [LINKS.s23, LINKS.s29],
  generate(rng: Rng, level: Level) {
    const bf = level === 2 && rng.chance(0.6);
    const c = makeConf(rng, bf, { plain: level === 1 && rng.chance(0.5) });
    const { S, n } = c;
    const good = ratioTex(c);
    const bad: [Rich, Rich][] = [
      [m(`${fr(S.AD, S.DB)} = ${fr(S.AE, S.EC)} = ${fr(S.DE, S.BC)}`), `${m(`[${S.DB}]`)} et ${m(`[${S.EC}]`)} ne sont des côtés d’aucun des deux triangles ${m(n.A + n.D + n.E)} et ${m(n.A + n.B + n.C)}.`],
      [m(`${fr(S.AD, S.AB)} = ${fr(S.AE, S.AC)} = ${fr(S.BC, S.DE)}`), 'Le dernier rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.'],
      [m(`${fr(S.AD, S.AB)} = ${fr(S.AC, S.AE)} = ${fr(S.DE, S.BC)}`), 'Le deuxième rapport est retourné : le petit triangle doit être en haut dans **tous** les rapports.'],
      [m(`${fr(S.AD, S.AE)} = ${fr(S.AB, S.AC)} = ${fr(S.DE, S.BC)}`), 'Chaque rapport compare deux côtés **homologues** (un du petit triangle, celui qui lui correspond dans le grand), pas deux côtés du même triangle.'],
    ];
    const chosen = rng.shuffle(bad).slice(0, 3);
    const steps: Step[] = [
      { prompt: 'Quelle égalité donne le théorème de Thalès ?', answer: shuffledChoice(rng, m(good), chosen), hint: `Petit triangle ${m(n.A + n.D + n.E)} en haut, grand triangle ${m(n.A + n.B + n.C)} en bas, dans le même ordre, sommet commun ${m(n.A)} en premier.` },
    ];
    // ★★ : vrai/faux sur une égalité piège, ou nature de la configuration
    let extra: Rich = '';
    if (level === 2) {
      const trap = rng.pick(['restant', 'papillon'] as const);
      if (trap === 'restant') {
        steps.push({ prompt: `Vrai ou faux : ${m(`${fr(S.AD, S.DB)} = ${fr(S.DE, S.BC)}`)} ?`, answer: { kind: 'choice', options: ['Vrai', 'Faux'], correct: 1, explain: [`${m(`[${S.DB}]`)} n’est un côté d’aucun des deux triangles : la bonne égalité est ${m(`${fr(S.AD, S.AB)} = ${fr(S.DE, S.BC)}`)}.`, null], attempts: 1 }, hint: `${m(S.DB)} est-il un côté du triangle ${m(n.A + n.D + n.E)} ? du triangle ${m(n.A + n.B + n.C)} ?` });
        extra = `${m(`${fr(S.AD, S.DB)} = ${fr(S.DE, S.BC)}`)} est faux : ${m(`[${S.DB}]`)} n’est un côté d’aucun des deux triangles.`;
      } else {
        steps.push({ prompt: 'Quelle est la configuration ?', answer: { kind: 'choice', options: ['Triangles emboîtés', 'Papillon'], correct: bf ? 1 : 0, explain: [bf ? `${m(n.A)} est **entre** ${m(n.D)} et ${m(n.B)} : les deux triangles sont tête-bêche.` : null, bf ? null : `${m(n.D)} est sur le segment ${m(`[${S.AB}]`)} : le petit triangle est dans le grand.`], attempts: 1 }, hint: `Regarde si ${m(n.A)} est entre ${m(n.D)} et ${m(n.B)}.` });
        extra = bf ? 'Configuration papillon : les rapports s’écrivent exactement de la même façon.' : 'Triangles emboîtés.';
      }
    }
    const figure = confSvg(c, [], [], rng, `Configuration de Thalès ${bf ? 'en papillon' : 'emboîtée'} : droites (${n.D}${n.B}) et (${n.E}${n.C}) sécantes en ${n.A}, (${n.D}${n.E}) parallèle à (${n.B}${n.C})`);
    return {
      title: 'Écris les rapports de Thalès.',
      statement: CONFTXT(c),
      figure,
      steps,
      solution: [`Petit triangle ${m(n.A + n.D + n.E)}, grand triangle ${m(n.A + n.B + n.C)}, sommet commun ${m(n.A)} :`, m(good), ...(extra ? [extra] : [])],
      answer: m(good),
      key: `${n.A}${n.B}${n.C}${n.D}${n.E}:${bf}:${level}:${steps.length}:${String(steps[1]?.prompt ?? '').slice(0, 8)}:${toNum(c.k)}:${c.num.AB},${c.num.AC},${c.num.BC}`,
      data: { kind: 'js', items: [] },
    };
  },
};

// ===================================================================== produit en croix
export const croix: Generator = {
  id: 'croix',
  title: 'Produit en croix',
  desc: 'Résoudre x/12 = 5/8 ou 3/x = 4/10 : produit des nombres en diagonale, divisé par le nombre restant.',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{x}{12} = \\dfrac{5}{8}',
  course: LINKS.s11,
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number }[] = [], keys: string[] = [];
    const n = level === 1 ? 2 : 3;
    const poss = rng.shuffle([0, 1, 2, 3]);
    for (let i = 0; i < n; i++) {
      // a/b = c/d avec une case inconnue ; on construit a/b = r (rapport exact) puis c/d
      let a: Q, b: Q, c: Q, d: Q;
      for (;;) {
        const den = rng.pick([2, 3, 4, 5, 6, 8, 10, 12]);
        const nu = rng.int(1, den * 2);
        const r = q(nu, den);
        if (r.d === 1 || nu === den) continue;
        const k1 = rng.int(1, 6), k2 = rng.int(2, 9);
        a = q(r.n * k1); b = q(r.d * k1);
        c = mul(q(r.n * k2), level === 2 && rng.chance(0.5) ? q(1, 2) : q(1));
        d = mul(q(r.d * k2), eq(c, q(r.n * k2)) ? q(1) : q(1, 2));
        if (eq(a, c) || toNum(b) > 40 || toNum(d) > 60) continue;
        break;
      }
      const vals = [a!, b!, c!, d!];
      const pos = poss[i];
      const x = vals[pos];
      const shown = vals.map((v, j) => (j === pos ? 'x' : nq(v)));
      // diagonale de x : positions (0,3) et (1,2)
      const diag = pos === 0 ? 3 : pos === 3 ? 0 : pos === 1 ? 2 : 1;
      const others = [0, 1, 2, 3].filter((j) => j !== pos && j !== diag);
      const [o1, o2] = others.map((j) => vals[j]);
      const D = vals[diag];
      const lab = 'abc'[i];
      const eqTex = `${fr(shown[0], shown[1])} = ${fr(shown[2], shown[3])}`;
      steps.push(step(`${lab}) ${m(eqTex)}`, [{ label: m('x ='), expect: x, form: 'any' }], `Produit en croix : ${m('x')} est égal au produit des deux nombres de l’autre diagonale, divisé par le nombre de sa diagonale.`, mist(x, [[div(D, mul(o1, o2)), 'Tu as divisé dans le mauvais sens : on multiplie les deux nombres **en diagonale l’un de l’autre** (sans x), puis on divise par le nombre restant.'], [div(mul(D, o1), o2), 'Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.'], [div(mul(D, o2), o1), 'Les deux nombres à multiplier sont ceux de la diagonale qui ne contient pas x.']])));
      sol.push(`${lab}) ${m(eqTex)} donne ${m(`${nq(D)} \\times x = ${nq(o1)} \\times ${nq(o2)}`)}, donc ${m(`x = ${fr(`${nq(o1)} \\times ${nq(o2)}`, nq(D))} = ${nq(x)}`)}.`);
      items.push({ what: `x${i}`, js: `${toNum(o1)}*${toNum(o2)}/${toNum(D)}`, expect: toNum(x) });
      keys.push(eqTex);
    }
    return { title: 'Calcule x.', steps, solution: sol, answer: steps.map((s, i) => `${'abc'[i]}) ${m(nq((s.answer as { fields: NumField[] }).fields[0].expect))}`).join(' ; '), key: keys.join('|'), data: { kind: 'js', items } };
  },
};

// ===================================================================== calcul de longueurs (emboîtés / papillon)
function lengthsExercise(rng: Rng, level: Level, butterfly: boolean) {
  const c = makeConf(rng, butterfly, { plain: level === 1 && !butterfly && rng.chance(0.4) });
  const { S, n } = c;
  let kc = 0, known: SegKey[], unk: SegKey[];
  let approx = false;
  const variant = level === 1 ? 'B1' : rng.pick(['B1', 'B1', 'col1', 'col2', 'approx'] as const);
  if (variant === 'B1') { kc = 0; known = ['AD', 'AB', 'AE', 'BC']; unk = rng.shuffle(['AC', 'DE'] as SegKey[]); }
  else if (variant === 'col1') { kc = 1; known = ['AE', 'AC', rng.pick(['AB', 'AD'] as SegKey[]), rng.pick(['BC', 'DE'] as SegKey[])]; unk = known.slice(2).map((s) => ({ AB: 'AD', AD: 'AB', BC: 'DE', DE: 'BC' } as Record<string, SegKey>)[s]); }
  else if (variant === 'col2') { kc = 2; known = ['DE', 'BC', rng.pick(['AD', 'AB'] as SegKey[]), rng.pick(['AE', 'AC'] as SegKey[])]; unk = known.slice(2).map((s) => ({ AB: 'AD', AD: 'AB', AE: 'AC', AC: 'AE' } as Record<string, SegKey>)[s]); }
  else { kc = 0; known = ['AD', 'AB', 'AE']; unk = ['AC']; approx = true; }
  // longueurs « non rondes » pour l'arrondi : AD, AB, AE entiers, AC = AB × AE / AD non décimal court
  let given: Record<SegKey, Q> = c.v;
  let acApprox = 0;
  if (approx) {
    for (;;) {
      const ad = rng.int(2, 7), ab = rng.int(ad + 2, 13), ae = rng.int(2, 9);
      const ac = (ab * ae) / ad;
      if (Math.abs(ac * 100 - Math.round(ac * 100)) < 1e-9 || ac > 22 || ae === ad) continue;
      given = { ...c.v, AD: q(ad), AB: q(ab), AE: q(ae), AC: q(ab * ae, ad) };
      acApprox = ac;
      c.num = { AB: ab, AC: ac, BC: Math.sqrt(ab * ab + ac * ac - 2 * ab * ac * Math.cos(((40 + rng.int(0, 50)) * Math.PI) / 180)) };
      c.k = q(ad, ab);
      c.v = given;
      break;
    }
  }
  const steps: Step[] = [], sol: Rich[] = [justif(c)];
  const vals: Partial<Record<SegKey, string>> = {};
  for (const s of known) vals[s] = nq(given[s]);
  sol.push(m(`${ratioTex(c)} \\quad \\text{soit} \\quad ${ratioTex(c, vals)}`));
  const items: { what: string; js: string; expect: number; tol?: number }[] = [];
  const ans: string[] = [];
  unk.forEach((u, i) => {
    const r = solveCol(c, kc, u, given);
    const smallSide = ['AD', 'AE', 'DE'].includes(u);
    const msgWrong = smallSide ? `Rapport retourné : ${m(S[u])} est un côté du petit triangle, il doit être plus petit que ${m(S[COLS.find((p) => p.includes(u))![1]])}.` : `Rapport retourné : ${m(S[u])} est un côté du grand triangle, il doit être plus grand que ${m(S[COLS.find((p) => p.includes(u))![0]])}.`;
    const lab = unk.length > 1 ? `${'ab'[i]}) ` : '';
    if (approx) {
      const f = lenApprox(m(`${S[u]} \\approx`), acApprox, 'cm', 1);
      steps.push(step(`${lab}Calcule ${m(S[u])}, arrondie au millimètre.`, [f], `Garde le rapport connu ${m(fr(S.AD, S.AB))} et celui qui contient ${m(S[u])}.`, mist(f.expect, [[roundQ(toNum(r.wrong), 1), msgWrong]])));
      sol.push(`Calcul de ${m(S[u])} : ${m(`${r.tex} \\approx ${dx(round(acApprox, 1))}\\,\\mathrm{cm}`)} (au millimètre près).`);
      items.push({ what: u, js: r.js, expect: acApprox, tol: 1e-9 });
      ans.push(m(`${S[u]} \\approx ${dx(round(acApprox, 1))}\\,\\mathrm{cm}`));
    } else {
      steps.push(step(`${lab}Calcule ${m(S[u])}.`, [lenF(m(`${S[u]} =`), r.val)], `Garde deux rapports : celui qu’on connaît entièrement (${m(fr(S[COLS[kc][0]], S[COLS[kc][1]]))}) et celui qui contient ${m(S[u])}. Puis produit en croix.`, mist(r.val, [[r.wrong, msgWrong]])));
      sol.push(`Calcul de ${m(S[u])} : ${m(`${r.tex} = ${nq(r.val)}\\,\\mathrm{cm}`)}.`);
      items.push({ what: u, js: r.js, expect: toNum(r.val) });
      ans.push(m(`${S[u]} = ${nq(r.val)}\\,\\mathrm{cm}`));
    }
  });
  const kk = toNum(c.k);
  sol.push(`Contrôle : le rapport vaut ${m(`k = ${fr(nq(given[COLS[kc][0]]), nq(given[COLS[kc][1]]))}${Number.isInteger(kk * 100) ? ` = ${dx(kk)}` : ` \\approx ${dx(round(kk, 2))}`}`)} ; les côtés du petit triangle ${m(n.A + n.D + n.E)} sont bien plus petits que ceux du grand.`);
  const figure = confSvg(c, known, unk, rng, `Configuration de Thalès ${butterfly ? 'en papillon' : 'emboîtée'}, longueurs en cm : ${known.map((s) => `${S[s]} = ${L(given[s])}`).join(', ')} ; ${unk.map((s) => S[s]).join(' et ')} à calculer`);
  return {
    title: unk.length > 1 ? `Calcule ${m(S[unk[0]])} et ${m(S[unk[1]])}.` : `Calcule ${m(S[unk[0]])}.`,
    statement: `${CONFTXT(c)} On donne ${givenTxt(c, known).replace(/\\mathrm\{cm\}/g, '\\mathrm{cm}')}.`,
    figure,
    steps,
    solution: sol,
    answer: ans.join(' ; '),
    key: `${butterfly}:${n.A}${n.D}:${known.map((s) => toNum(given[s])).join(',')}:${unk.join(',')}`,
    data: { kind: 'js' as const, items },
  };
}
export const emboites: Generator = {
  id: 'emboites',
  title: 'Calculer une longueur (triangles emboîtés)',
  desc: 'Trois rapports, produit en croix ; ★★ : inconnue en bas, autre rapport connu, arrondi au millimètre.',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{3}{9} = \\dfrac{4}{AC} = \\dfrac{DE}{12}',
  course: LINKS.s25,
  links: [LINKS.s28],
  generate: (rng: Rng, level: Level) => lengthsExercise(rng, level, false),
};
export const papillon: Generator = {
  id: 'papillon',
  title: 'Calculer une longueur (papillon)',
  desc: 'Droites sécantes en A, (DE) ∥ (BC) : mêmes rapports que pour les triangles emboîtés.',
  stars: 2,
  levels: [2],
  example: '\\dfrac{AD}{AB} = \\dfrac{AE}{AC} = \\dfrac{DE}{BC}',
  course: LINKS.s23,
  links: [LINKS.s28],
  generate: (rng: Rng, level: Level) => lengthsExercise(rng, level, true),
};

// ===================================================================== segment restant
export const restant: Generator = {
  id: 'restant',
  title: 'Segment « restant »',
  desc: 'On donne DB ou EC : calculer d’abord AB = AD + DB, puis appliquer Thalès ; EC = AC − AE.',
  stars: 2,
  levels: [2],
  example: 'AB = AD + DB',
  course: LINKS.s27,
  links: [LINKS.s29],
  generate(rng: Rng) {
    const c = makeConf(rng, false, { ks: KS.filter(([p, qq]) => p / qq <= 0.75) });
    const { S, n, v } = c;
    const variant = rng.pick(['DE', 'AE'] as const);
    const steps: Step[] = [], sol: Rich[] = [];
    const items: { what: string; js: string; expect: number }[] = [];
    let known: SegKey[], ask: SegKey[], ans: string;
    steps.push(step(`a) Calcule ${m(S.AB)}.`, [lenF(m(`${S.AB} =`), v.AB)], `${m(n.D)} est sur ${m(`[${S.AB}]`)} : ${m(`${S.AB} = ${S.AD} + ${S.DB}`)}.`, mist(v.AB, [[v.DB, `${m(S.DB)} n’est qu’un morceau de ${m(`[${S.AB}]`)}.`]])));
    sol.push(`${m(n.D)} est sur ${m(`[${S.AB}]`)}, donc ${m(`${S.AB} = ${S.AD} + ${S.DB} = ${nq(v.AD)} + ${nq(v.DB)} = ${nq(v.AB)}\\,\\mathrm{cm}`)}.`);
    items.push({ what: 'AB', js: `${toNum(v.AD)}+${toNum(v.DB)}`, expect: toNum(v.AB) });
    if (variant === 'DE') {
      known = ['AD', 'DB', 'AE', 'BC'];
      ask = ['DE', 'EC'];
      const de = solveCol(c, 0, 'DE'), ac = solveCol(c, 0, 'AC');
      const wrongDB = div(mul(v.AD, v.BC), v.DB);
      steps.push(step(`b) Calcule ${m(S.DE)}.`, [lenF(m(`${S.DE} =`), v.DE)], `Rapports : ${m(`${fr(S.AD, S.AB)} = ${fr(S.DE, S.BC)}`)}, avec ${m(S.AB)} trouvé en a).`, mist(v.DE, [[wrongDB, `Tu as utilisé ${m(S.DB)} : ce n’est un côté d’aucun des deux triangles. Il faut ${m(S.AB)}.`], [de.wrong, 'Rapport retourné : le petit triangle en haut.']])));
      steps.push(step(`c) Calcule ${m(S.AC)}, puis ${m(S.EC)}.`, [lenF(m(`${S.AC} =`), v.AC), lenF(m(`${S.EC} =`), v.EC)], `${m(S.AC)} avec ${m(`${fr(S.AD, S.AB)} = ${fr(S.AE, S.AC)}`)}, puis ${m(`${S.EC} = ${S.AC} - ${S.AE}`)}.`, mist(v.AC, [[ac.wrong, 'Rapport retourné.']], 0)));
      sol.push(justif(c), m(`${fr(S.AD, S.AB)} = ${fr(S.AE, S.AC)} = ${fr(S.DE, S.BC)} \\quad \\text{soit} \\quad ${fr(nq(v.AD), nq(v.AB))} = ${fr(nq(v.AE), S.AC)} = ${fr(S.DE, nq(v.BC))}`));
      sol.push(`Donc ${m(`${de.tex} = ${nq(v.DE)}\\,\\mathrm{cm}`)} et ${m(`${ac.tex} = ${nq(v.AC)}\\,\\mathrm{cm}`)}.`, `Enfin ${m(`${S.EC} = ${S.AC} - ${S.AE} = ${nq(v.AC)} - ${nq(v.AE)} = ${nq(v.EC)}\\,\\mathrm{cm}`)}.`);
      items.push({ what: 'DE', js: `${toNum(v.AD)}*${toNum(v.BC)}/(${toNum(v.AD)}+${toNum(v.DB)})`, expect: toNum(v.DE) }, { what: 'AC', js: `(${toNum(v.AD)}+${toNum(v.DB)})*${toNum(v.AE)}/${toNum(v.AD)}`, expect: toNum(v.AC) }, { what: 'EC', js: `(${toNum(v.AD)}+${toNum(v.DB)})*${toNum(v.AE)}/${toNum(v.AD)}-${toNum(v.AE)}`, expect: toNum(v.EC) });
      ans = `${m(`${S.AB} = ${nq(v.AB)}`)} ; ${m(`${S.DE} = ${nq(v.DE)}`)} ; ${m(`${S.AC} = ${nq(v.AC)}`)}, ${m(`${S.EC} = ${nq(v.EC)}`)} (cm)`;
    } else {
      known = ['AD', 'DB', 'AC'];
      ask = ['AE', 'EC'];
      const ae = solveCol(c, 0, 'AE');
      const wrongDB = div(mul(v.AD, v.AC), v.DB);
      steps.push(step(`b) Calcule ${m(S.AE)}, puis ${m(S.EC)}.`, [lenF(m(`${S.AE} =`), v.AE), lenF(m(`${S.EC} =`), v.EC)], `Rapports : ${m(`${fr(S.AD, S.AB)} = ${fr(S.AE, S.AC)}`)}, puis ${m(`${S.EC} = ${S.AC} - ${S.AE}`)}.`, [...mist(v.AE, [[wrongDB, `Tu as utilisé ${m(S.DB)} : ce n’est un côté d’aucun des deux triangles. Il faut ${m(S.AB)}.`], [ae.wrong, 'Rapport retourné : le petit triangle en haut.']], 0)]));
      sol.push(justif(c), m(`${fr(S.AD, S.AB)} = ${fr(S.AE, S.AC)} \\quad \\text{soit} \\quad ${fr(nq(v.AD), nq(v.AB))} = ${fr(S.AE, nq(v.AC))}`));
      sol.push(`Donc ${m(`${ae.tex} = ${nq(v.AE)}\\,\\mathrm{cm}`)}, puis ${m(`${S.EC} = ${S.AC} - ${S.AE} = ${nq(v.AC)} - ${nq(v.AE)} = ${nq(v.EC)}\\,\\mathrm{cm}`)}.`);
      items.push({ what: 'AE', js: `${toNum(v.AD)}*${toNum(v.AC)}/(${toNum(v.AD)}+${toNum(v.DB)})`, expect: toNum(v.AE) }, { what: 'EC', js: `${toNum(v.AC)}-${toNum(v.AD)}*${toNum(v.AC)}/(${toNum(v.AD)}+${toNum(v.DB)})`, expect: toNum(v.EC) });
      ans = `${m(`${S.AB} = ${nq(v.AB)}`)} ; ${m(`${S.AE} = ${nq(v.AE)}`)}, ${m(`${S.EC} = ${nq(v.EC)}`)} (cm)`;
    }
    sol.push(`Contrôle : ${m(`${fr(S.AD, S.AB)} = ${fr(nq(v.AD), nq(v.AB))} = ${nq(c.k)}`)}.`.replace(/= ([^=]*)\$\.$/, (all, last) => (String(last).includes('frac') ? `$.` : all)));
    const figure = confSvg(c, known, ask, rng, `Configuration de Thalès emboîtée : ${known.map((s) => `${S[s]} = ${L(v[s])}`).join(', ')} (cm)`);
    void cmp;
    return {
      title: 'Thalès avec un segment « restant ».',
      statement: `${CONFTXT(c)} On donne ${givenTxt(c, known)}.`,
      figure,
      steps,
      solution: sol,
      answer: ans,
      key: `${variant}:${n.A}${n.D}:${known.map((s) => toNum(v[s])).join(',')}`,
      data: { kind: 'js', items },
    };
  },
};
