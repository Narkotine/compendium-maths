/**
 * Proportionnalité (★ → ★★★) : reconnaître (tableau, graphique), quatrième proportionnelle, compléter un tableau,
 * grandeurs quotients (prix unitaire, débit), vitesse. À rebours : on choisit le coefficient (ou la loi affine),
 * puis les valeurs « propres » ; les quotients et les réponses en découlent exactement (rationnels).
 */
import { type Q, q, add, sub, mul, div, eq, toNum, isInt, isDecimal, decimals, cmp } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, fixedChoice, shuffledChoice, dn, NAMES } from '../engine/build';
import { LINKS, eu, nb, tableTex, hm, graphSvg } from './common';

const cents = (c: number) => q(c, 100);
const okDec = (v: Q, k = 3) => isDecimal(v) && decimals(v) <= k;
const F = (label: Rich, v: Q, unit?: string): NumField => ({ label, expect: v, form: 'any', ...(unit ? { unit } : {}) });
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const val = (v: Q, money: boolean) => (money ? eu(v) : nb(v));

// ===================================================================== reconnaître
type PropCtx = { h1: string; h2: string; xs: number[]; k: () => Q; money: boolean; what: string };
const PROP: ((rng: Rng) => PropCtx)[] = [
  (rng) => ({ h1: 'Nombre de cahiers', h2: 'Prix (€)', xs: [2, 3, 4, 5, 6, 8, 10, 12], k: () => cents(5 * rng.int(16, 70)), money: true, what: 'le prix d’un cahier' }),
  (rng) => ({ h1: 'Volume d’essence (L)', h2: 'Prix (€)', xs: [5, 10, 15, 20, 25, 30, 40], k: () => cents(rng.int(165, 199)), money: true, what: 'le prix d’un litre' }),
  (rng) => ({ h1: 'Masse de pommes (kg)', h2: 'Prix (€)', xs: [2, 3, 4, 5, 6, 8], k: () => cents(10 * rng.int(15, 45)), money: true, what: 'le prix d’un kilogramme' }),
  (_rng) => ({ h1: 'Côté du carré (cm)', h2: 'Périmètre (cm)', xs: [2, 3, 5, 7, 8, 11, 12], k: () => q(4), money: false, what: 'le coefficient' }),
  (rng) => ({ h1: 'Durée (h)', h2: 'Distance (km)', xs: [1, 2, 3, 4, 5, 6], k: () => q(rng.pick([12, 15, 18, 45, 60, 80, 90])), money: false, what: 'la vitesse (km par heure)' }),
];
type AffCtx = { h1: string; h2: string; xs: number[]; k: Q; b: Q; money: boolean; story: string };
const AFF: ((rng: Rng) => AffCtx)[] = [
  (rng) => { const b = q(rng.int(3, 10)), k = cents(10 * rng.int(8, 30)); return { h1: 'Distance (km)', h2: 'Prix du taxi (€)', xs: [2, 4, 5, 10, 15, 20], k, b, money: true, story: `prise en charge de ${m(eu(b))} € puis ${m(eu(k))} € par km` }; },
  (rng) => { const b = q(rng.pick([10, 12, 15, 18, 20])), k = q(rng.int(2, 5)); return { h1: 'Nombre de séances', h2: 'Prix payé (€)', xs: [1, 2, 4, 5, 8, 10], k, b, money: true, story: `abonnement de ${m(eu(b))} € puis ${m(eu(k))} € par séance` }; },
  (rng) => { const b = q(rng.int(2, 6)), k = cents(50 * rng.int(1, 6)); return { h1: 'Durée de location (h)', h2: 'Prix (€)', xs: [1, 2, 3, 4, 5, 6, 8], k, b, money: true, story: `${m(eu(b))} € de frais fixes puis ${m(eu(k))} € par heure` }; },
];
export const reconnaitre: Generator = {
  id: 'reconnaitre',
  title: 'Reconnaître la proportionnalité',
  desc: 'Par les quotients d’un tableau ; sur un graphique (★★).',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{3{,}60}{2} = \\dfrac{9}{5} = 1{,}8',
  course: LINKS.s11,
  links: [LINKS.s12],
  generate(rng: Rng, level: Level) {
    if (level === 2) return graphe(rng);
    const prop = rng.chance(0.5);
    for (;;) {
      let xs: number[], ys: Q[], h1: string, h2: string, money: boolean, why: Rich, k: Q | null = null;
      if (prop) {
        const c = rng.pick(PROP)(rng);
        k = c.k(); xs = rng.shuffle(c.xs).slice(0, 3).sort((a, b) => a - b); ys = xs.map((x) => mul(k!, q(x)));
        ({ h1, h2, money } = c);
        why = `Les quotients sont tous égaux à ${m(dn(k))} : c’est un tableau de proportionnalité, de coefficient ${m(dn(k))} (${c.what}).`;
      } else if (rng.chance(0.6)) {
        const c = rng.pick(AFF)(rng);
        xs = rng.shuffle(c.xs).slice(0, 3).sort((a, b) => a - b); ys = xs.map((x) => add(c.b, mul(c.k, q(x))));
        ({ h1, h2, money } = c);
        why = `Les quotients ne sont pas égaux : ce n’est pas un tableau de proportionnalité (il y a une partie fixe : ${c.story}).`;
      } else {
        // presque proportionnel : la dernière valeur est « arrondie » ou en promotion
        const c = rng.pick(PROP)(rng);
        k = c.k(); xs = rng.shuffle(c.xs).slice(0, 3).sort((a, b) => a - b); ys = xs.map((x) => mul(k!, q(x)));
        const d = c.money ? cents(rng.pick([10, 20, 30, 40, 50, -10, -20, -50])) : q(rng.pick([1, 2, -1, -2]));
        ys[2] = add(ys[2], d);
        if (ys[2].n <= 0) continue;
        ({ h1, h2, money } = c);
        why = `Les deux premiers quotients valent ${m(dn(k))}, mais pas le dernier : ce n’est **pas** un tableau de proportionnalité (il faudrait ${m(val(mul(k, q(xs[2])), money))} et non ${m(val(ys[2], money))}).`;
        k = null;
      }
      const qs = xs.map((x, i) => div(ys[i], q(x)));
      if (!qs.every((v) => okDec(v, 3))) continue;
      if (!prop && qs.every((v) => eq(v, qs[0]))) continue;
      const fields = qs.map((v, i) => F(m(`\\dfrac{${val(ys[i], money)}}{${xs[i]}} =`), v));
      const s1 = step('Calcule les quotients « deuxième ligne ÷ première ligne ».', fields, 'Divise chaque nombre de la deuxième ligne par le nombre placé au-dessus.',
        qs.flatMap((v, i) => mist(v, [[div(q(xs[i]), ys[i]), 'On divise la deuxième ligne par la première (et non l’inverse).']], i)));
      const s2: Step = { prompt: 'Est-ce un tableau de proportionnalité ?', answer: fixedChoice(['Oui', 'Non'], prop ? 0 : 1, [why, why]), hint: 'Tableau de proportionnalité : tous les quotients sont égaux. Il ne suffit pas que les deux grandeurs augmentent ensemble.' };
      return {
        title: 'Ce tableau est-il un tableau de proportionnalité ?',
        display: tableTex(h1, h2, xs.map(String), ys.map((y) => val(y, money))),
        steps: [s1, s2],
        solution: [`${xs.map((x, i) => m(`${val(ys[i], money)} \\div ${x} = ${dn(qs[i])}`)).join(' ; ')}.`, why],
        answer: prop ? `Oui, coefficient ${m(dn(k!))}` : 'Non',
        key: `${h2}:${xs.join(',')}:${ys.map((y) => toNum(y)).join(',')}`,
        data: { kind: 'js', items: [...xs.map((x, i) => ({ what: `q${i}`, js: `${toNum(ys[i])}/${x}`, expect: toNum(qs[i]) })), { what: 'step:1', js: `[${xs.map((x, i) => `${toNum(ys[i])}/${x}`).join(',')}].every((v,_,a)=>Math.abs(v-a[0])<1e-9) ? 0 : 1`, expect: prop ? 0 : 1 }] },
      };
    }
  },
};
/** ★★ : lecture d'un graphique (proportionnalité, droite ne passant pas par l'origine, points non alignés). */
function graphe(rng: Rng) {
  const kind = rng.pick(['prop', 'prop', 'aff', 'curve']);
  type G = { every?: number; js: string; xl: string; yl: string; xMax: number; xStep: number; f: (x: number) => number; yStep: number; yMax: number; seg: boolean; unitY: string; unitX: string; story: string };
  let g: G;
  if (kind === 'prop') {
    g = rng.pick<() => G>([
      () => { const k = rng.pick([1.5, 2, 2.5, 3, 4, 3.5]); const ys = Number.isInteger(k) ? k : 2 * k; return { js: `${k}*x`, xl: 'Masse (kg)', yl: 'Prix (€)', xMax: 6, xStep: 1, f: (x) => k * x, yStep: ys, yMax: 6 * k, seg: true, unitY: '€', unitX: 'kg', story: '' }; },
      () => { const k = rng.pick([4, 5, 6, 10, 12, 15, 20]); return { js: `${k}*x`, xl: 'Durée (h)', yl: 'Distance (km)', xMax: 4, xStep: 0.5, f: (x) => k * x, yStep: k / 2, yMax: 4 * k, seg: true, unitY: 'km', unitX: 'h', story: '' }; },
    ])();
  } else if (kind === 'aff') {
    const b = rng.pick([2, 3, 4, 5, 6]), k = rng.pick([1, 2, 0.5]);
    g = { js: `${b}+${k}*x`, xl: 'Distance (km)', yl: 'Prix (€)', every: 2, xMax: 8, xStep: 1, f: (x) => b + k * x, yStep: 1, yMax: Math.ceil((b + 8 * k) / 2) * 2, seg: true, unitY: '€', unitX: 'km', story: `prise en charge de ${b} €` };
  } else if (rng.chance(0.5)) {
    g = { js: 'x*x', xl: 'Côté (cm)', yl: 'Aire (cm²)', xMax: 5, xStep: 1, f: (x) => x * x, yStep: 5, yMax: 25, seg: false, unitY: 'cm²', unitX: 'cm', story: '' };
  } else {
    // tarif dégressif : prix des lots de 1 à 6 articles, croissant mais pas proportionnel
    const p1 = rng.pick([4, 5, 6]), dec = rng.pick([1, 2]);
    const tab = [0, p1];
    for (let i = 2; i <= 6; i++) tab.push(tab[i - 1] + Math.max(1, p1 - dec * (i - 1)));
    g = { js: `[${tab.join(',')}][x]`, xl: 'Nombre d’articles', yl: 'Prix (€)', xMax: 6, xStep: 1, f: (x) => tab[x], yStep: tab[6] > 20 ? 5 : 2, yMax: Math.ceil(tab[6] / (tab[6] > 20 ? 5 : 2)) * (tab[6] > 20 ? 5 : 2), seg: false, unitY: '€', unitX: 'articles', story: '' };
  }
  const xsAll: number[] = [];
  for (let x = g.xStep; x <= g.xMax + 1e-9; x += g.xStep) xsAll.push(Math.round(x * 100) / 100);
  // points lisibles : sur une graduation verticale entière du quadrillage
  const readable = kind === 'curve' ? xsAll : xsAll.filter((x) => Math.abs(g.f(x) / g.yStep - Math.round(g.f(x) / g.yStep)) < 1e-9 && g.f(x) <= g.yMax);
  const pts: [number, number][] = (kind === 'curve' ? rng.shuffle(xsAll).slice(0, rng.int(4, xsAll.length)).sort((a, b) => a - b) : rng.shuffle(readable).slice(0, 3)).map((x) => [x, g.f(x)]);
  const free = readable.filter((x) => !pts.some((p) => p[0] === x));
  const xr = kind === 'curve' ? rng.pick(pts.map((p) => p[0])) : rng.pick(free.length ? free : readable);
  const yr = g.f(xr);
  const fig = graphSvg({ every: g.every, xMax: g.xMax, yMax: g.yMax, xStep: g.xStep, yStep: g.yStep, xLabel: g.xl, yLabel: g.yl, pts, ...(g.seg ? { segment: [[0, g.f(0)], [g.xMax, g.f(g.xMax)]] as [[number, number], [number, number]] } : {}) });
  const opts = ['Oui : ce sont des points alignés avec l’origine', 'Non : les points sont alignés, mais pas avec l’origine', 'Non : les points ne sont pas alignés'];
  const correct = kind === 'prop' ? 0 : kind === 'aff' ? 1 : 2;
  const expl = [
    'Une droite ne suffit pas : pour la proportionnalité, elle doit passer par l’origine.',
    kind === 'aff' ? `La droite coupe l’axe vertical en ${m(String(g.f(0)))}, pas en ${m('0')} : ${g.story}.` : kind === 'curve' ? 'Les points ne sont pas sur une même droite.' : 'La droite passe bien par l’origine.',
    kind === 'curve' ? 'Les points ne sont pas alignés : quand le côté double, l’aire est multipliée par 4.' : 'Les points sont alignés (sur une droite).',
  ];
  const explain = opts.map((_, i) => (i === correct ? null : expl[i === 0 ? 0 : i]));
  if (correct !== 0) explain[0] = kind === 'aff' ? `La droite ne passe pas par l’origine : pour ${m(`0`)} ${g.unitX}, on paie déjà ${m(String(g.f(0)))} €.` : 'Les points ne sont pas alignés : ce n’est pas une droite.';
  if (correct === 0) { explain[1] = 'La droite passe par l’origine (le point de coordonnées (0 ; 0)).'; explain[2] = 'Les points sont bien alignés : ils sont sur la droite tracée.'; }
  const s1: Step = { prompt: 'Ce graphique représente-t-il une situation de proportionnalité ?', answer: { kind: 'choice', options: opts, correct, explain, attempts: 2 }, hint: 'Proportionnalité : points alignés **avec l’origine** du repère.' };
  const s2 = step(`Lis sur le graphique la valeur pour ${m(`${nb(xr)}\\,\\text{${g.unitX}}`)}.`, [F(m(`\\text{${g.yl.split(' (')[0]}} =`), q(Math.round(yr * 100), 100), g.unitY.replace('cm²', 'cm²'))], `Pars de ${m(nb(xr))} sur l’axe horizontal, monte jusqu’à ${g.seg ? 'la droite' : 'le point'}, puis lis sur l’axe vertical. Un carreau vertical vaut ${m(nb(g.yStep))}.`);
  const steps = [s1, s2];
  const sol: Rich[] = [kind === 'prop' ? 'Les points sont alignés sur une droite qui passe par l’origine : c’est une situation de proportionnalité.' : kind === 'aff' ? `Les points sont alignés, mais la droite coupe l’axe vertical en ${m(String(g.f(0)))} : ce n’est pas une situation de proportionnalité (${g.story}).` : 'Les points ne sont pas alignés : ce n’est pas une situation de proportionnalité (quand le côté double, l’aire est multipliée par 4).',
    `Pour ${m(`${nb(xr)}\\,\\text{${g.unitX}}`)}, on lit ${m(`${nb(yr)}\\,\\text{${g.unitY}}`)}.`];
  const items = [{ what: 'y', js: `((x)=>${g.js})(${xr})`, expect: yr }, { what: 'step:0', js: String(correct), expect: correct }];
  if (kind === 'prop') {
    const k = g.f(1);
    steps.push(step('Quel est le coefficient de proportionnalité ?', [F('Coefficient :', q(Math.round(k * 100), 100))], `Divise une valeur lue sur l’axe vertical par la valeur correspondante sur l’axe horizontal (par exemple ${m(`${nb(yr)} \\div ${nb(xr)}`)}).`,
      mist(q(Math.round(k * 100), 100), [[q(Math.round((1 / k) * 1e6), 1e6), 'On divise la valeur verticale par la valeur horizontale (et non l’inverse).']])));
    sol.push(`Coefficient : ${m(`${nb(yr)} \\div ${nb(xr)} = ${nb(k)}`)} (${g.unitY} par ${g.unitX}).`);
    items.push({ what: 'k', js: `${yr}/${xr}`, expect: k });
  }
  return {
    title: 'Lis le graphique.',
    figure: fig,
    steps,
    solution: sol,
    answer: `${opts[correct]} ; ${m(`${nb(yr)}\\,\\text{${g.unitY}}`)}`,
    key: `g:${kind}:${g.xl}:${g.f(1)}:${g.f(0)}:${pts.map((p) => p[0]).join(',')}:${xr}`,
    data: { kind: 'js' as const, items },
  };
}

// ===================================================================== quatrième proportionnelle
type QCtx = { st: (x1: string, y1: string) => string; qa: (x2: string) => string; qb: (y3: string) => string; ux: string; uy: string; money: boolean };
const QP: { mk: (rng: Rng) => { x1: number; k: Q; xs: number[] }; c: QCtx }[] = [
  { mk: (rng) => ({ x1: rng.pick([2, 3, 4, 5]), k: cents(10 * rng.int(12, 48)), xs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15] }), c: { st: (x, y) => `${m(x)} kg de pommes coûtent ${m(y)} €.`, qa: (x) => `Combien coûtent ${m(x)} kg ?`, qb: (y) => `Quelle masse peut-on acheter avec ${m(y)} € ?`, ux: 'kg', uy: '€', money: true } },
  { mk: (rng) => ({ x1: rng.pick([4, 6, 8]), k: q(rng.pick([25, 30, 40, 50, 60])), xs: [2, 3, 5, 10, 12, 14, 15, 18, 20] }), c: { st: (x, y) => `Une recette demande ${m(y)} g de farine pour ${m(x)} personnes.`, qa: (x) => `Quelle masse de farine faut-il pour ${m(x)} personnes ?`, qb: (y) => `Pour combien de personnes peut-on cuisiner avec ${m(y)} g de farine ?`, ux: 'personnes', uy: 'g', money: false } },
  { mk: (rng) => ({ x1: rng.pick([20, 30, 40, 50, 60]), k: q(rng.pick([2, 3, 4, 5, 6]), 10), xs: [10, 15, 25, 45, 80, 90, 100, 120, 150, 200] }), c: { st: (x, y) => `Un robinet remplit ${m(y)} L en ${m(x)} s (débit constant).`, qa: (x) => `Combien de litres remplit-il en ${m(x)} s ?`, qb: (y) => `Combien de secondes faut-il pour ${m(y)} L ?`, ux: 's', uy: 'L', money: false } },
  { mk: (rng) => ({ x1: rng.pick([20, 25, 30, 40]), k: cents(rng.int(165, 199)), xs: [5, 10, 15, 35, 45, 50, 60] }), c: { st: (x, y) => `${m(x)} L d’essence coûtent ${m(y)} €.`, qa: (x) => `Combien coûtent ${m(x)} L ?`, qb: (y) => `Combien de litres obtient-on avec ${m(y)} € ?`, ux: 'L', uy: '€', money: true } },
];
export const quatrieme: Generator = {
  id: 'quatrieme',
  title: 'Quatrième proportionnelle',
  desc: 'Par l’unité ou le produit en croix ; dans les deux sens.',
  stars: 1,
  levels: [1, 2],
  example: 'x = \\dfrac{7{,}20 \\times 5}{3} = 12',
  course: LINKS.s22,
  links: [LINKS.s21],
  generate(rng: Rng, level: Level) {
    for (;;) {
      const { mk, c } = rng.pick(QP);
      const { x1, k, xs } = mk(rng);
      const y1 = mul(k, q(x1));
      const x2 = rng.pick(xs.filter((x) => x !== x1));
      const y2 = mul(k, q(x2));
      // b) on part d'une valeur y3 qui donne un x3 « propre »
      const x3 = rng.pick(xs.filter((x) => x !== x1 && x !== x2));
      const y3 = mul(k, q(x3));
      if (!okDec(y1, 2) || !okDec(y2, 2) || !okDec(y3, 2)) continue;
      // ★ : rapport simple entre x1 et x2 (double, moitié, triple…) ; ★★ : rapport quelconque
      const r = x2 / x1;
      const simple = Number.isInteger(r) || Number.isInteger(1 / r) || Number.isInteger(2 * r);
      if ((level === 1) !== simple) continue;
      const V = (v: Q) => val(v, c.money);
      const sA = step(c.qa(nb(x2)), [F('Réponse :', y2, c.uy)], level === 1 ? `Compare ${m(nb(x2))} et ${m(nb(x1))} (double ? moitié ? triple ?), ou passe par l’unité.` : `Écris le tableau, puis fais le produit en croix : ${m(`\\dfrac{${V(y1)} \\times ${nb(x2)}}{${nb(x1)}}`)}.`,
        mist(y2, [[div(mul(q(x1), q(x2)), y1), 'Produit en croix mélangé : on multiplie les deux nombres de la diagonale qui ne contient pas l’inconnue, puis on divise par le troisième.'], [mul(y1, q(x2)), `Il faut aussi diviser par ${m(nb(x1))}.`], [add(y1, q(x2 - x1)), 'La proportionnalité ne s’obtient pas en ajoutant la même chose : on multiplie par le même nombre.']]));
      const sB = step(c.qb(V(y3)), [F('Réponse :', q(x3), c.ux)], `Cette fois l’inconnue est sur la première ligne : ${m(`\\dfrac{${nb(x1)} \\times ${V(y3)}}{${V(y1)}}`)}.`,
        mist(q(x3), [[div(mul(y1, y3), q(x1)), 'L’inconnue est sur la première ligne : multiplie les deux nombres de la diagonale qui ne la contient pas.']]));
      const unit = k;
      return {
        title: 'Calcule (situation de proportionnalité).',
        statement: c.st(nb(x1), V(y1)),
        steps: [sA, sB],
        solution: [
          `${m(tableTex(c.ux === 'personnes' ? 'Personnes' : `Quantité (${c.ux})`, `(${c.uy})`.replace('(', c.uy === '€' ? 'Prix (' : c.uy === 'g' ? 'Farine (' : 'Volume ('), [nb(x1), nb(x2), 'x'], [V(y1), 'y', V(y3)]).replace('\\text{(', '\\text{('))}`,
          `Pour une unité : ${m(`${V(y1)} \\div ${nb(x1)} = ${dn(unit)}`)} ${c.uy} par ${c.ux === 'personnes' ? 'personne' : c.ux}.`,
          `a) ${m(`y = ${nb(x2)} \\times ${dn(unit)} = ${V(y2)}`)} ${c.uy} (produit en croix : ${m(`\\dfrac{${V(y1)} \\times ${nb(x2)}}{${nb(x1)}} = ${V(y2)}`)}).`,
          `b) ${m(`x = \\dfrac{${nb(x1)} \\times ${V(y3)}}{${V(y1)}} = ${nb(x3)}`)} ${c.ux}.`,
          `Contrôle : ${x2 > x1 ? `${m(nb(x2))} est plus grand que ${m(nb(x1))}, et ${m(V(y2))} est plus grand que ${m(V(y1))}` : `${m(nb(x2))} est plus petit que ${m(nb(x1))}, et ${m(V(y2))} est plus petit que ${m(V(y1))}`} ✓.`,
        ],
        answer: `a) ${m(V(y2))} ${c.uy} ; b) ${m(nb(x3))} ${c.ux}`,
        key: `${c.uy}:${x1}:${toNum(y1)}:${x2}:${x3}`,
        data: { kind: 'js', items: [{ what: 'y2', js: `${toNum(y1)}*${x2}/${x1}`, expect: toNum(y2) }, { what: 'x3', js: `${x1}*${toNum(y3)}/${toNum(y1)}`, expect: x3 }] },
      };
    }
  },
};

// ===================================================================== compléter un tableau
export const tableau: Generator = {
  id: 'tableau',
  title: 'Compléter un tableau',
  desc: 'Linéarité (moitié, somme de colonnes) et coefficient.',
  stars: 1,
  levels: [1],
  example: '4 \\to 200 ;\\; 2 \\to 100 ;\\; 6 \\to 300',
  course: LINKS.s21,
  generate(rng: Rng) {
    const ctx = rng.pick([
      { h1: 'Nombre de personnes', h2: 'Farine (g)', u: 'g', ks: [25, 30, 40, 50, 60, 75], x1s: [4, 6, 8] },
      { h1: 'Nombre de baguettes', h2: 'Prix (€)', u: '€', ks: [0.9, 1.1, 1.2, 1.3, 1.25], x1s: [4, 6, 10] },
      { h1: 'Durée (min)', h2: 'Pages imprimées', u: 'pages', ks: [12, 15, 18, 20, 24, 30], x1s: [4, 6, 10] },
      { h1: 'Longueur de tissu (m)', h2: 'Prix (€)', u: '€', ks: [6, 8, 9, 12, 14, 15], x1s: [4, 6, 8] },
    ]);
    const kk = rng.pick(ctx.ks), k = q(Math.round(kk * 100), 100), x1 = rng.pick(ctx.x1s);
    const xh = x1 / 2, xs = x1 + xh, xb = rng.pick([7, 9, 10, 11, 12, 15].filter((x) => x !== x1 && x !== xs));
    const Y = (x: number) => mul(k, q(x));
    const money = ctx.u === '€';
    const V = (v: Q) => val(v, money);
    const add2 = 'Ce n’est pas une addition de la même quantité : on multiplie (ou on divise) par le même nombre.';
    const fields = [F(m(`${nb(xh)} \\to`), Y(xh), ctx.u), F(m(`${nb(xs)} \\to`), Y(xs), ctx.u), F(m(`${nb(xb)} \\to`), Y(xb), ctx.u)];
    const s: Step = { prompt: '', answer: { kind: 'num', fields }, hint: `${m(nb(xh))}, c’est la moitié de ${m(nb(x1))} ; ${m(nb(xs))}, c’est ${m(`${nb(x1)} + ${nb(xh)}`)} ; pour ${m(nb(xb))}, cherche le coefficient ${m(`${V(Y(x1))} \\div ${nb(x1)}`)}.`,
      mistakes: [...mist(Y(xh), [[sub(Y(x1), q(xh)), add2]], 0), ...mist(Y(xs), [[add(Y(x1), q(xh)), add2]], 1), ...mist(Y(xb), [[add(Y(x1), q(xb - x1)), add2]], 2)] };
    return {
      title: 'Complète ce tableau de proportionnalité.',
      display: tableTex(ctx.h1, ctx.h2, [nb(x1), nb(xh), nb(xs), nb(xb)], [V(Y(x1)), '?', '?', '?']),
      steps: [s],
      solution: [
        `${m(nb(xh))} est la moitié de ${m(nb(x1))} : ${m(`${V(Y(x1))} \\div 2 = ${V(Y(xh))}`)}.`,
        `${m(`${nb(xs)} = ${nb(x1)} + ${nb(xh)}`)} : on additionne les colonnes, ${m(`${V(Y(x1))} + ${V(Y(xh))} = ${V(Y(xs))}`)}.`,
        `Coefficient : ${m(`${V(Y(x1))} \\div ${nb(x1)} = ${dn(k)}`)} ; ${m(`${nb(xb)} \\times ${dn(k)} = ${V(Y(xb))}`)}.`,
        `Contrôle : ${m(`${nb(xs)} \\times ${dn(k)} = ${V(Y(xs))}`)} ✓.`,
      ],
      answer: [xh, xs, xb].map((x) => m(`${nb(x)} \\to ${V(Y(x))}`)).join(' ; '),
      key: `${ctx.h2}:${toNum(k)}:${x1}:${xb}`,
      data: { kind: 'js', items: [xh, xs, xb].map((x, i) => ({ what: `c${i}`, js: `${toNum(Y(x1))}/${x1}*${x}`, expect: toNum(Y(x)) })) },
    };
  },
};

// ===================================================================== grandeurs quotients
export const grandeurs: Generator = {
  id: 'grandeurs',
  title: 'Prix unitaire, débit',
  desc: 'Comparer deux lots ; débit d’un robinet.',
  stars: 2,
  levels: [2],
  example: '2{,}70 \\div 6 = 0{,}45\\text{ €}',
  course: LINKS.s3,
  generate(rng: Rng) {
    if (rng.chance(0.55)) {
      // deux lots : prix unitaires différents, le plus gros lot n'est pas toujours le moins cher
      for (;;) {
        const item = rng.pick([['yaourts', 'yaourt'], ['briques de lait', 'brique'], ['stylos', 'stylo'], ['canettes', 'canette']]);
        const nA = rng.pick([4, 6, 8]), nB = rng.pick([6, 8, 10, 12, 16].filter((x) => x > nA));
        const uA = rng.int(25, 90), uB = uA + rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
        if (uB <= 10) continue;
        const pA = cents(uA * nA), pB = cents(uB * nB);
        const best = uA < uB ? 0 : 1;
        const sol: Rich[] = [`Lot A : ${m(`${eu(pA)} \\div ${nA} = ${eu(cents(uA))}`)} € par ${item[1]}.`, `Lot B : ${m(`${eu(pB)} \\div ${nB} = ${eu(cents(uB))}`)} € par ${item[1]}.`, `Le lot ${best === 0 ? 'A' : 'B'} est le plus avantageux (prix unitaire le plus petit)${best === 0 ? ', même s’il contient moins d’articles' : ''}.`];
        return {
          title: 'Quel lot est le plus avantageux ?',
          statement: `Lot A : ${m(String(nA))} ${item[0]} pour ${m(eu(pA))} €. Lot B : ${m(String(nB))} ${item[0]} pour ${m(eu(pB))} €.`,
          steps: [
            step(`Calcule le prix d’un ${item[1]} dans chaque lot.`, [F('Lot A :', cents(uA), '€'), F('Lot B :', cents(uB), '€')], 'Prix unitaire = prix du lot ÷ nombre d’articles.', [...mist(cents(uA), [[div(q(nA), pA), 'Prix ÷ nombre d’articles (et non l’inverse).']], 0)]),
            { prompt: 'Quel lot est le plus avantageux ?', answer: fixedChoice(['Lot A', 'Lot B'], best, [sol[2], sol[2]]), hint: 'Le plus avantageux a le prix unitaire le plus petit.' },
          ],
          solution: sol,
          answer: `${m(eu(cents(uA)))} € et ${m(eu(cents(uB)))} € : lot ${best === 0 ? 'A' : 'B'}`,
          key: `lot:${nA}:${uA}:${nB}:${uB}`,
          data: { kind: 'js', items: [{ what: 'uA', js: `${toNum(pA)}/${nA}`, expect: uA / 100 }, { what: 'uB', js: `${toNum(pB)}/${nB}`, expect: uB / 100 }, { what: 'step:1', js: `${toNum(pA)}/${nA} < ${toNum(pB)}/${nB} ? 0 : 1`, expect: best }] },
        };
      }
    }
    // débit
    for (;;) {
      const d = q(rng.pick([2, 3, 4, 5, 6, 8, 12, 15]), 10); // L/s
      const t1 = rng.pick([20, 30, 40, 50, 60]);
      const V1 = mul(d, q(t1));
      const mn = rng.pick([2, 3, 5, 10]);
      const V2 = mul(d, q(60 * mn));
      const V3 = q(rng.pick([30, 45, 60, 90, 120, 150]));
      const t3 = div(V3, d);
      if (!isInt(t3) || toNum(t3) < 60 || !okDec(V1, 1)) continue;
      const m3 = Math.floor(toNum(t3) / 60), s3 = toNum(t3) % 60;
      return {
        title: 'Calcule avec le débit.',
        statement: `Un robinet remplit ${m(nb(V1))} L en ${m(String(t1))} s (débit constant).`,
        steps: [
          step('Quel est le débit, en litres par seconde ?', [F('Débit :', d, 'L/s')], 'Débit = volume ÷ durée.', mist(d, [[div(q(t1), V1), 'Volume ÷ durée (et non l’inverse).']])),
          step(`Combien de litres remplit-il en ${m(String(mn))} min ?`, [F('Volume :', V2, 'L')], `Convertis d’abord : ${m(`${mn}\\,\\text{min} = ${60 * mn}\\,\\text{s}`)}.`, mist(V2, [[mul(d, q(mn)), `Le débit est en litres **par seconde** : convertis ${m(`${mn}\\,\\text{min}`)} en secondes.`], [mul(d, q(100 * mn)), 'Une minute fait 60 secondes, pas 100.']])),
          step(`Combien de temps faut-il pour ${m(nb(V3))} L ? (en secondes)`, [F('Durée :', t3, 's')], 'Durée = volume ÷ débit.', mist(t3, [[mul(V3, d), 'Volume ÷ débit (on cherche combien de fois le débit « tient » dans le volume).']])),
        ],
        solution: [
          `Débit : ${m(`${nb(V1)} \\div ${t1} = ${dn(d)}`)} L/s.`,
          `${m(`${mn}\\,\\text{min} = ${60 * mn}\\,\\text{s}`)} ; ${m(`${dn(d)} \\times ${60 * mn} = ${nb(V2)}`)} L.`,
          `${m(`${nb(V3)} \\div ${dn(d)} = ${toNum(t3)}`)} s${m3 > 0 ? `, soit ${m(`${m3}\\,\\text{min}${s3 ? `\\,${s3}\\,\\text{s}` : ''}`)}` : ''}.`,
        ],
        answer: `${m(dn(d))} L/s ; ${m(nb(V2))} L ; ${m(String(toNum(t3)))} s`,
        key: `deb:${toNum(d)}:${t1}:${mn}:${toNum(V3)}`,
        data: { kind: 'js', items: [{ what: 'd', js: `${toNum(V1)}/${t1}`, expect: toNum(d) }, { what: 'V2', js: `${toNum(V1)}/${t1}*${60 * mn}`, expect: toNum(V2) }, { what: 't3', js: `${toNum(V3)}/(${toNum(V1)}/${t1})`, expect: toNum(t3) }] },
      };
    }
  },
};

// ===================================================================== vitesse
const MINS = [15, 30, 45, 20, 40, 12, 6, 36, 48, 24];
export const vitesse: Generator = {
  id: 'vitesse',
  title: 'Vitesse, distance, durée',
  desc: 'd = v × t ; heures et minutes ; m/s et km/h (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '1\\,\\text{h}\\,15\\,\\text{min} = 1{,}25\\,\\text{h}',
  course: LINKS.s3,
  generate(rng: Rng, level: Level) {
    const who = rng.pick(['Un train', 'Une voiture', 'Un car', 'Un cycliste', 'Une coureuse', 'Un bateau']);
    const vR: Record<string, [number, number, number]> = { 'Un train': [80, 300, 10], 'Une voiture': [50, 130, 5], 'Un car': [50, 100, 5], 'Un cycliste': [12, 30, 1], 'Une coureuse': [8, 16, 1], 'Un bateau': [10, 40, 2] };
    const [lo, hi, st] = vR[who];
    if (level === 1) {
      // durée en heures décimales simples : 2,5 h ; 1,5 h ; 3 h
      const v = q(st * rng.int(Math.ceil(lo / st), Math.floor(hi / st)));
      const t = q(rng.pick([2, 3, 4, 5, 6, 7]), 2);
      const d = mul(v, t);
      if (!isInt(d)) return vitesse.generate(rng, level);
      const askV = rng.chance(0.5);
      const s = askV
        ? step(`Calcule sa vitesse moyenne.`, [F(m('v ='), v, 'km/h')], 'Vitesse = distance ÷ durée.', mist(v, [[div(t, d), 'Distance ÷ durée (et non l’inverse).'], [mul(d, t), 'Pour la vitesse, on **divise** la distance par la durée.']]))
        : step(`Calcule la distance parcourue.`, [F(m('d ='), d, 'km')], 'Distance = vitesse × durée.', mist(d, [[div(v, t), 'Distance = vitesse **×** durée.']]));
      return {
        title: 'Calcule (vitesse constante).',
        statement: askV ? `${who} parcourt ${m(nb(d))} km en ${m(dn(t))} h.` : `${who} roule à ${m(nb(v))} km/h pendant ${m(dn(t))} h.`.replace('Une coureuse roule', 'Une coureuse court').replace('Un bateau roule', 'Un bateau navigue'),
        steps: [s],
        solution: askV ? [`${m(`v = \\dfrac{d}{t} = \\dfrac{${nb(d)}}{${dn(t)}} = ${nb(v)}`)} km/h.`, `Contrôle : ${m(`${nb(v)} \\times ${dn(t)} = ${nb(d)}`)} km ✓.`] : [`${m(`d = v \\times t = ${nb(v)} \\times ${dn(t)} = ${nb(d)}`)} km.`, `Contrôle : en ${m('1')} h on fait ${m(nb(v))} km ; en ${m(dn(t))} h, ${m(dn(t))} fois plus ✓.`],
        answer: askV ? `${m(nb(v))} km/h` : `${m(nb(d))} km`,
        key: `v1:${who}:${toNum(v)}:${toNum(t)}:${askV}`,
        data: { kind: 'js', items: [{ what: askV ? 'v' : 'd', js: askV ? `${toNum(d)}/${toNum(t)}` : `${toNum(v)}*${toNum(t)}`, expect: toNum(askV ? v : d) }] },
      };
    }
    if (level === 2) {
      for (;;) {
        const v = q(st * rng.int(Math.ceil(lo / st), Math.floor(hi / st)));
        const h = rng.int(0, 2), mn = rng.pick(MINS);
        const t = add(q(h), q(mn, 60));
        const d = mul(v, t);
        if (!isInt(d) || toNum(t) < 0.3) continue;
        const kind = rng.pick(['v', 'd', 't']);
        const tDec = t;
        const wrongT = q(100 * h + mn, 100);
        const conv = step(`Écris la durée ${m(hm(t))} en heures (écriture décimale ou fraction).`, [F(m('t ='), tDec, 'h')], `Une heure, c’est ${m('60')} minutes : ${m(`${mn}\\,\\text{min} = \\dfrac{${mn}}{60}\\,\\text{h}`)}.`,
          mist(tDec, [[wrongT, `Une heure contient ${m('60')} minutes, pas ${m('100')} : ${m(`${mn}\\,\\text{min} = \\dfrac{${mn}}{60}\\,\\text{h} = ${dn(q(mn, 60))}\\,\\text{h}`)}.`]]));
        if (kind === 't') {
          // durée à trouver, en minutes
          const tm = mul(t, q(60));
          return {
            title: 'Calcule (vitesse constante).',
            statement: `${who} parcourt ${m(nb(d))} km à la vitesse moyenne de ${m(nb(v))} km/h.`,
            steps: [step('Combien de temps dure le trajet, en minutes ?', [F('Durée :', tm, 'min')], `${m(`t = \\dfrac{d}{v}`)} donne des heures ; multiplie ensuite par ${m('60')}.`, mist(tm, [[t, 'C’est la durée en **heures** : convertis-la en minutes (× 60).'], [mul(div(v, d), q(60)), 'Durée = distance ÷ vitesse (et non l’inverse).']]))],
            solution: [`${m(`t = \\dfrac{d}{v} = \\dfrac{${nb(d)}}{${nb(v)}} = ${dn(t)}`)} h${isDecimal(t) ? '' : ''}.`, `${m(`${dn(t)} \\times 60 = ${nb(tm)}`)} min, soit ${m(hm(t))}.`, `Contrôle : ${m(`${nb(v)} \\times ${dn(t)} = ${nb(d)}`)} km ✓.`],
            answer: `${m(nb(tm))} min (${m(hm(t))})`,
            key: `v2t:${who}:${toNum(v)}:${toNum(d)}`,
            data: { kind: 'js', items: [{ what: 'tm', js: `${toNum(d)}/${toNum(v)}*60`, expect: toNum(tm) }] },
          };
        }
        const s2 = kind === 'v'
          ? step('Calcule la vitesse moyenne.', [F(m('v ='), v, 'km/h')], 'Vitesse = distance ÷ durée (en heures).', mist(v, [[div(d, wrongT), `Avec ${m(dn(wrongT))} h, la durée est fausse : ${m(hm(t))} ${m(`= ${dn(t)}`)} h.`]]))
          : step('Calcule la distance parcourue.', [F(m('d ='), d, 'km')], 'Distance = vitesse × durée (en heures).', mist(d, [[mul(v, wrongT), `Avec ${m(dn(wrongT))} h, la durée est fausse : ${m(hm(t))} ${m(`= ${dn(t)}`)} h.`]]));
        return {
          title: 'Calcule (vitesse constante).',
          statement: kind === 'v' ? `${who} parcourt ${m(nb(d))} km en ${m(hm(t))}.` : `${who} roule à ${m(nb(v))} km/h pendant ${m(hm(t))}.`.replace('Une coureuse roule', 'Une coureuse court').replace('Un bateau roule', 'Un bateau navigue'),
          steps: [conv, s2],
          solution: [`${m(`${mn}\\,\\text{min} = \\dfrac{${mn}}{60}\\,\\text{h} = ${dn(q(mn, 60))}\\,\\text{h}`)}, donc ${m(`${hm(t)} = ${dn(t)}\\,\\text{h}`)}.`, kind === 'v' ? `${m(`v = \\dfrac{${nb(d)}}{${dn(t)}} = ${nb(v)}`)} km/h.` : `${m(`d = ${nb(v)} \\times ${dn(t)} = ${nb(d)}`)} km.`, `Contrôle : en ${m(hm(t))}, à ${m(nb(v))} km/h : ${m(`${nb(v)} \\times ${dn(t)} = ${nb(d)}`)} km ✓.`],
          answer: `${m(`t = ${dn(t)}`)} h ; ${kind === 'v' ? `${m(nb(v))} km/h` : `${m(nb(d))} km`}`,
          key: `v2:${who}:${toNum(v)}:${toNum(t)}:${kind}`,
          data: { kind: 'js', items: [{ what: 't', js: `${h}+${mn}/60`, expect: toNum(t) }, { what: kind, js: kind === 'v' ? `${toNum(d)}/(${h}+${mn}/60)` : `${toNum(v)}*(${h}+${mn}/60)`, expect: toNum(kind === 'v' ? v : d) }] },
        };
      }
    }
    // ★★★ : conversions m/s ↔ km/h et vitesse moyenne d'un aller-retour
    const ms = rng.pick([5, 10, 15, 20, 25, 30, 35]);
    const kmh = rng.pick([18, 36, 54, 72, 90, 108, 126].filter((x) => x !== ms * 3.6));
    const [v1, v2] = rng.pick([[60, 40], [90, 60], [30, 20], [120, 80], [60, 30], [45, 30], [100, 60]] as [number, number][]);
    const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
    const dd = (v1 * v2) / g(v1, v2); // distance commode : durées « rondes »
    const t1 = div(q(dd), q(v1)), t2 = div(q(dd), q(v2));
    const vm = div(q(2 * dd), add(t1, t2));
    const name = rng.pick(NAMES);
    return {
      title: 'Convertis, puis calcule une vitesse moyenne.',
      steps: [
        step(`a) Convertis ${m(`${ms}\\,\\text{m/s}`)} en km/h.`, [F('', q(Math.round(ms * 36), 10), 'km/h')], `En une heure (${m('3\\,600')} s), on parcourt ${m(`${ms} \\times 3\\,600`)} m : ${m('1\\,\\text{m/s} = 3{,}6\\,\\text{km/h}')}.`, mist(q(Math.round(ms * 36), 10), [[q(ms * 10, 36), 'Pour passer des m/s aux km/h, on **multiplie** par 3,6.']])),
        step(`b) Convertis ${m(`${kmh}\\,\\text{km/h}`)} en m/s.`, [F('', q(kmh * 10, 36), 'm/s')], 'On divise par 3,6.', mist(q(kmh * 10, 36), [[q(Math.round(kmh * 36), 10), 'Pour passer des km/h aux m/s, on **divise** par 3,6.']])),
        step(`c) ${name} fait ${m(`${dd}\\,\\text{km}`)} à l’aller à ${m(`${v1}\\,\\text{km/h}`)} et revient par la même route à ${m(`${v2}\\,\\text{km/h}`)}. Quelle est sa vitesse moyenne sur l’aller-retour ?`, [F(m('v ='), vm, 'km/h')], 'Vitesse moyenne = distance totale ÷ durée totale. Calcule la durée de chaque trajet.',
          mist(vm, [[q(v1 + v2, 2), `La moyenne des deux vitesses ne convient pas : on roule plus longtemps à ${m(String(v2))} km/h. Calcule les durées.`]])),
      ],
      solution: [
        `a) ${m(`${ms} \\times 3{,}6 = ${dn(q(Math.round(ms * 36), 10))}`)} km/h.`,
        `b) ${m(`${kmh} \\div 3{,}6 = ${dn(q(kmh * 10, 36))}`)} m/s.`,
        `c) Aller : ${m(`${dd} \\div ${v1} = ${dn(t1)}`)} h ; retour : ${m(`${dd} \\div ${v2} = ${dn(t2)}`)} h. Total : ${m(`${2 * dd}`)} km en ${m(dn(add(t1, t2)))} h.`,
        `${m(`v = ${2 * dd} \\div ${dn(add(t1, t2))} = ${dn(vm)}`)} km/h, et non ${m(dn(q(v1 + v2, 2)))} km/h : on roule plus longtemps à la petite vitesse.`,
      ],
      answer: `${m(dn(q(Math.round(ms * 36), 10)))} km/h ; ${m(dn(q(kmh * 10, 36)))} m/s ; ${m(dn(vm))} km/h`,
      key: `v3:${ms}:${kmh}:${v1}:${v2}:${dd}`,
      data: { kind: 'js', items: [{ what: 'a', js: `${ms}*3.6`, expect: ms * 3.6 }, { what: 'b', js: `${kmh}/3.6`, expect: kmh / 3.6 }, { what: 'c', js: `${2 * dd}/(${dd}/${v1}+${dd}/${v2})`, expect: toNum(vm) }] },
    };
  },
};
void shuffledChoice; void cmp;
