/**
 * Réciproque (★★ → ★★★), agrandissement-réduction (★ → ★★★), triangles semblables (★★), problèmes concrets
 * (★★ → ★★★), trouver l'erreur (★★). Constructions à rebours, valeurs exactes.
 */
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type Q, q, mul, div, add, sub, eq, toNum, cmp } from '../engine/q';
import { mist, shuffledChoice, fixedChoice, NAMES } from '../engine/build';
import { svgWrap, line, text, dot, fit, rightMark, type Pt } from '../engine/svg';
import { LINKS, m, fr, nq, ql, KS, segs, thalesSvg, L, lenF, dx, round, pickNames } from './common';
import { makeConf, ratioTex, justif, solveCol, COLS } from './theoreme';

const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const ON = ['Oui', 'Non'];
type Item = { what: string; js: string; expect: number; tol?: number };
const cm = (v: Q, u = 'cm') => m(`${nq(v)}\\,\\mathrm{${u}}`);

// ===================================================================== réciproque
export const reciproque: Generator = {
  id: 'reciproque',
  title: 'Parallèles ou pas ? (réciproque)',
  desc: 'Calculer séparément les deux rapports, comparer sans arrondir (produits en croix) ; ★★★ : ordre des points, puis calcul de DE.',
  stars: 2,
  levels: [2, 3],
  example: '\\dfrac{4}{10} = \\dfrac{6}{15} = 0{,}4',
  course: LINKS.s32,
  links: [LINKS.s31, LINKS.s35],
  generate(rng: Rng, level: Level) {
    const kind = level === 2 ? rng.pick(['para', 'para', 'non', 'non', 'restant'] as const) : rng.pick(['ordre', 'deduire', 'deduire'] as const);
    const bf = kind !== 'restant' && kind !== 'ordre' && rng.chance(0.3);
    const c = makeConf(rng, bf, { ks: KS.filter(([, qq]) => qq <= 8) });
    const { S, n, v } = c;
    let AE = v.AE;
    let parallel = kind === 'para' || kind === 'restant' || kind === 'deduire';
    if (kind === 'non') {
      // rapports proches mais différents (piège des arrondis)
      const d = rng.pick([q(1, 2), q(1), q(-1, 2), q(-1), q(1, 5), q(-1, 5)]);
      AE = add(v.AE, d);
      if (cmp(AE, q(1)) < 0 || cmp(AE, v.AC) >= 0) AE = sub(v.AE, d);
      parallel = false;
    }
    if (kind === 'ordre') parallel = false;
    const r1 = div(v.AD, v.AB), r2 = div(AE, v.AC);
    const p1 = mul(v.AD, v.AC), p2 = mul(v.AB, AE);
    const steps: Step[] = [], sol: Rich[] = [], items: Item[] = [];
    const known: string[] = kind === 'restant'
      ? [`${S.AD} = ${nq(v.AD)}`, `${S.DB} = ${nq(v.DB)}`, `${S.AE} = ${nq(AE)}`, `${S.EC} = ${nq(sub(v.AC, AE))}`]
      : [`${S.AD} = ${nq(v.AD)}`, `${S.AB} = ${nq(v.AB)}`, `${S.AE} = ${nq(AE)}`, `${S.AC} = ${nq(v.AC)}`, ...(kind === 'deduire' ? [`${S.BC} = ${nq(v.BC)}`] : [])];
    const pos = kind === 'ordre'
      ? `Les points ${m(n.D)}, ${m(n.A)}, ${m(n.B)} sont alignés dans cet ordre, et ${m(n.E)} est sur le segment ${m(`[${S.AC}]`)}.`
      : bf ? `Les points ${m(n.D)}, ${m(n.A)}, ${m(n.B)} sont alignés dans cet ordre, ainsi que ${m(n.E)}, ${m(n.A)}, ${m(n.C)}.` : `${m(n.D)} est sur ${m(`[${S.AB}]`)} et ${m(n.E)} est sur ${m(`[${S.AC}]`)}.`;
    if (kind === 'restant') {
      steps.push(step(`a) Calcule ${m(S.AB)} et ${m(S.AC)}.`, [lenF(m(`${S.AB} =`), v.AB), lenF(m(`${S.AC} =`), v.AC)], `${m(`${S.AB} = ${S.AD} + ${S.DB}`)}.`, mist(v.AB, [[v.DB, `${m(S.DB)} n’est qu’un morceau de ${m(`[${S.AB}]`)}.`]], 0)));
      sol.push(`${m(`${S.AB} = ${nq(v.AD)} + ${nq(v.DB)} = ${nq(v.AB)}`)} et ${m(`${S.AC} = ${nq(AE)} + ${nq(sub(v.AC, AE))} = ${nq(v.AC)}`)}.`);
      items.push({ what: 'AB', js: `${toNum(v.AD)}+${toNum(v.DB)}`, expect: toNum(v.AB) }, { what: 'AC', js: `${toNum(AE)}+${toNum(sub(v.AC, AE))}`, expect: toNum(v.AC) });
    }
    const L0 = kind === 'restant' ? 'b' : 'a';
    steps.push(step(`${L0}) Produits en croix : calcule ${m(`${S.AD} \\times ${S.AC}`)} et ${m(`${S.AB} \\times ${S.AE}`)}.`, [{ label: m(`${S.AD} \\times ${S.AC} =`), expect: p1, form: 'any' }, { label: m(`${S.AB} \\times ${S.AE} =`), expect: p2, form: 'any' }], `On compare ${m(fr(S.AD, S.AB))} et ${m(fr(S.AE, S.AC))} sans arrondir : ils sont égaux si et seulement si ces deux produits le sont.`));
    items.push({ what: 'p1', js: `${toNum(v.AD)}*${toNum(v.AC)}`, expect: toNum(p1) }, { what: 'p2', js: `${toNum(v.AB)}*${toNum(AE)}`, expect: toNum(p2) });
    const eqR = eq(r1, r2);
    const L1 = String.fromCharCode(L0.charCodeAt(0) + 1);
    const why = !eqR ? `Les produits en croix sont différents (${m(`${nq(p1)} \\neq ${nq(p2)}`)}) : les rapports ne sont pas égaux.` : kind === 'ordre' ? `Les rapports sont égaux, mais ${m(n.D)} et ${m(n.E)} ne sont pas du même côté de ${m(n.A)} : les points ne sont pas dans le même ordre, la réciproque ne s’applique pas.` : 'Rapports égaux et points dans le même ordre : d’après la réciproque, les droites sont parallèles.';
    steps.push({ prompt: `${L1}) Les droites ${m(`(${S.DE})`)} et ${m(`(${S.BC})`)} sont-elles parallèles ?`, answer: fixedChoice(ON, parallel ? 0 : 1, [why, why]), hint: kind === 'ordre' ? `Compare les rapports, puis regarde la position de ${m(n.D)} et de ${m(n.E)} par rapport à ${m(n.A)}.` : 'Rapports égaux (et points dans le même ordre) → parallèles ; rapports différents → pas parallèles.' });
    items.push({ what: `step:${steps.length - 1}`, js: `${toNum(v.AD)}*${toNum(v.AC)}===${toNum(v.AB)}*${toNum(AE)}&&${kind !== 'ordre'}?0:1`, expect: parallel ? 0 : 1 });
    const dec = (r: Q) => (Number.isInteger(toNum(r) * 1000) ? ` = ${dx(toNum(r))}` : '');
    sol.push(`D’une part : ${m(`${fr(S.AD, S.AB)} = ${fr(nq(v.AD), nq(v.AB))}${dec(r1)}`)}. D’autre part : ${m(`${fr(S.AE, S.AC)} = ${fr(nq(AE), nq(v.AC))}${dec(r2)}`)}.`);
    sol.push(`Produits en croix : ${m(`${nq(v.AD)} \\times ${nq(v.AC)} = ${nq(p1)}`)} et ${m(`${nq(v.AB)} \\times ${nq(AE)} = ${nq(p2)}`)}.`);
    if (!eqR) {
      const close = Math.abs(toNum(r1) - toNum(r2)) < 0.02 ? ` (attention : arrondis à ${m(dx(round(toNum(r1), 2)))} et ${m(dx(round(toNum(r2), 2)))}, ils semblent égaux)` : '';
      sol.push(`Comme ${m(`${nq(p1)} \\neq ${nq(p2)}`)}, ${m(`${fr(S.AD, S.AB)} \\neq ${fr(S.AE, S.AC)}`)}${close}. Si les droites étaient parallèles, ces rapports seraient égaux d’après le théorème de Thalès. Donc ${m(`(${S.DE})`)} et ${m(`(${S.BC})`)} ne sont **pas** parallèles.`);
    } else if (kind === 'ordre') {
      sol.push(`Les rapports sont égaux, mais ${m(n.D)} est de l’autre côté de ${m(n.A)} par rapport à ${m(n.B)}, alors que ${m(n.E)} est du même côté que ${m(n.C)} : les points ne sont pas dans le même ordre. La réciproque ne s’applique pas, et les droites ne sont **pas** parallèles (la parallèle à ${m(`(${S.BC})`)} passant par ${m(n.D)} coupe ${m(`(${S.AC})`)} de l’autre côté de ${m(n.A)}).`);
    } else {
      sol.push(`On constate que ${m(`${fr(S.AD, S.AB)} = ${fr(S.AE, S.AC)}`)}, et les points ${m(n.A)}, ${m(n.D)}, ${m(n.B)} et ${m(n.A)}, ${m(n.E)}, ${m(n.C)} sont alignés dans le même ordre. D’après la réciproque du théorème de Thalès, ${m(`(${S.DE}) \\parallel (${S.BC})`)}.`);
    }
    if (kind === 'deduire') {
      const L2 = String.fromCharCode(L1.charCodeAt(0) + 1);
      const r = solveCol(c, 0, 'DE');
      steps.push(step(`${L2}) En déduire ${m(S.DE)}.`, [lenF(m(`${S.DE} =`), v.DE)], `Maintenant que les droites sont parallèles, le théorème de Thalès donne ${m(`${fr(S.DE, S.BC)} = ${fr(S.AD, S.AB)}`)}.`, mist(v.DE, [[r.wrong, 'Rapport retourné : le petit triangle en haut.']])));
      sol.push(`Les droites étant parallèles, le théorème de Thalès donne ${m(`${fr(S.DE, S.BC)} = ${fr(S.AD, S.AB)}`)}, donc ${m(`${r.tex} = ${nq(v.DE)}\\,\\mathrm{cm}`)}.`);
      items.push({ what: 'DE', js: r.js, expect: toNum(v.DE) });
    }
    const kD = (bf || kind === 'ordre' ? -1 : 1) * toNum(c.k), kE = (bf ? -1 : 1) * toNum(div(AE, v.AC));
    const labels: Record<string, string> = kind === 'restant' ? { AD: L(v.AD), DB: L(v.DB), AE: L(AE), EC: L(sub(v.AC, AE)) } : { AD: L(v.AD), AB: L(v.AB), AE: L(AE), AC: L(v.AC), ...(kind === 'deduire' ? { BC: L(v.BC), DE: '?' } : {}) };
    const figure = thalesSvg({ n, ...c.num, k: kD, kE, labels, ask: kind === 'deduire' ? ['DE'] : [], par: false, rot: rng.pick([0, 0.2, -0.25, Math.PI]), flip: rng.chance(0.5), aria: `Droites (${n.D}${n.B}) et (${n.E}${n.C}) sécantes en ${n.A} ; ${known.join(', ')} (cm)` });
    return {
      title: kind === 'deduire' ? `Démontre que ${m(`(${S.DE}) \\parallel (${S.BC})`)}, puis calcule ${m(S.DE)}.` : `Les droites ${m(`(${S.DE})`)} et ${m(`(${S.BC})`)} sont-elles parallèles ?`,
      statement: `${pos} On donne, en cm : ${known.map((s) => m(s)).join(', ')}.${kind === 'deduire' ? '' : ' La figure n’indique pas si les droites sont parallèles : il faut le démontrer.'}`,
      figure,
      steps,
      solution: sol,
      answer: `${parallel ? 'Parallèles' : 'Pas parallèles'}${kind === 'deduire' ? ` ; ${m(`${S.DE} = ${nq(v.DE)}\\,\\mathrm{cm}`)}` : ''}`,
      key: `${kind}:${known.join(',')}:${n.A}${n.D}`,
      data: { kind: 'js', items },
    };
  },
};

// ===================================================================== agrandissement / réduction
const FIG = [
  { nm: 'un triangle', u: 'cm' }, { nm: 'un rectangle', u: 'cm' }, { nm: 'un logo', u: 'cm' }, { nm: 'une photo', u: 'cm' }, { nm: 'un terrain (plan)', u: 'm' },
];
export const agrandir: Generator = {
  id: 'agrandir',
  title: 'Agrandissement, réduction',
  desc: 'Longueurs × k, aires × k², volumes × k³ ; trouver k ; échelle d’une maquette ; ★★★ : k à partir d’un rapport d’aires, section de pyramide.',
  stars: 1,
  levels: [1, 2, 3],
  example: 'k = 3 : \\text{aire} \\times 9',
  course: LINKS.s51,
  links: [LINKS.s12, LINKS.s52],
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: Item[] = [];
    let title = '', statement = '', key = '', answer = '';
    if (level === 1) {
      if (rng.chance(0.5)) {
        // maquette à l'échelle 1/n
        const nn = rng.pick([20, 25, 50, 100, 200, 500]);
        const obj = rng.pick([['un bateau', 'longueur', [8, 60]], ['une maison', 'largeur', [6, 20]], ['un avion', 'envergure', [10, 60]], ['un pont', 'longueur', [40, 300]], ['un train', 'longueur', [20, 200]]] as const);
        let Lr: number;
        do { Lr = rng.int(obj[2][0], obj[2][1]) * (rng.chance(0.3) ? 1 : 1); } while (((Lr * 100) % nn) !== 0 && ((Lr * 1000) % nn) !== 0);
        const mod = q(Lr * 100, nn); // cm
        title = 'Maquette à l’échelle.';
        statement = `Une maquette représente ${obj[0]} à l’échelle ${m(fr(1, nn))}. La ${obj[1]} réelle est ${m(`${Lr}\\,\\mathrm{m}`)}.`;
        steps.push(step(`a) Quel est le rapport ${m('k')} de la réduction ?`, [{ label: m('k ='), expect: q(1, nn), form: 'any', shown: fr(1, nn) }], 'L’échelle donne le rapport : longueur sur la maquette ÷ longueur réelle.', mist(q(1, nn), [[q(nn), `C’est une **réduction** : ${m('k')} est plus petit que 1.`]])));
        steps.push(step(`b) Quelle est cette ${obj[1]} sur la maquette, en centimètres ?`, [{ label: '', expect: mod, form: 'any', unit: 'cm' }], `${m(`${Lr}\\,\\mathrm{m} = ${Lr * 100}\\,\\mathrm{cm}`)}, puis divise par ${nn}.`, mist(mod, [[q(Lr, nn), 'Ce résultat est en mètres : convertis en centimètres.'], [q(Lr * 100 * nn), 'Réduire, c’est **diviser** par ' + nn + '.']])));
        sol.push(`Échelle ${m(fr(1, nn))} : ${m(`k = ${fr(1, nn)}`)} (réduction).`, `${m(`${Lr}\\,\\mathrm{m} = ${Lr * 100}\\,\\mathrm{cm}`)} et ${m(`${Lr * 100} \\div ${nn} = ${nq(mod)}`)} : ${m(`${nq(mod)}\\,\\mathrm{cm}`)} sur la maquette.`);
        items.push({ what: 'k', js: `1/${nn}`, expect: 1 / nn }, { what: 'L', js: `${Lr}*100/${nn}`, expect: toNum(mod) });
        key = `maq:${nn}:${Lr}:${obj[0]}`;
        answer = `${m(`k = ${fr(1, nn)}`)} ; ${cm(mod)}`;
      } else {
        // trouver k à partir de deux longueurs, puis une autre longueur
        const f = rng.pick(FIG);
        const k = rng.pick([q(3, 2), q(2), q(5, 2), q(3), q(1, 2), q(3, 4), q(2, 5), q(4, 3), q(5, 4), q(3, 5)]);
        let a: Q, b: Q;
        do { a = q(rng.int(2, 16) * k.d); b = q(rng.int(2, 16) * k.d); } while (eq(a, b) || toNum(mul(a, k)) > 60 || toNum(mul(b, k)) > 60);
        const A2 = mul(a, k), B2 = mul(b, k);
        const agr = cmp(k, q(1)) > 0;
        title = agr ? 'Agrandissement.' : 'Réduction.';
        statement = `On ${agr ? 'agrandit' : 'réduit'} ${f.nm} : un côté de ${cm(a, f.u)} devient ${cm(A2, f.u)}.`;
        steps.push(step(`a) Quel est le rapport ${m('k')} ?`, [{ label: m('k ='), expect: k, form: 'any' }], 'Nouvelle longueur ÷ longueur de départ (correspondante).', mist(k, [[div(a, A2), 'Rapport retourné : nouvelle longueur **divisée par** la longueur de départ.'], [sub(A2, a), 'On multiplie les longueurs par k : ce n’est pas une différence.']])));
        steps.push(step(`b) Un autre côté mesure ${cm(b, f.u)}. Que devient-il ?`, [{ label: '', expect: B2, form: 'any', unit: f.u }], `Multiplie par ${m('k')}.`, mist(B2, [[add(b, sub(A2, a)), 'On n’ajoute pas la même longueur : on **multiplie** par k.']])));
        sol.push(`${m(`k = ${fr(nq(A2), nq(a))} = ${nq(k)}`)} (${agr ? 'agrandissement, k > 1' : 'réduction, k < 1'}).`, `${m(`${nq(b)} \\times ${nq(k)} = ${nq(B2)}`)} : ${cm(B2, f.u)}.`);
        items.push({ what: 'k', js: `${toNum(A2)}/${toNum(a)}`, expect: toNum(k) }, { what: 'b', js: `${toNum(b)}*${toNum(A2)}/${toNum(a)}`, expect: toNum(B2) });
        key = `k:${toNum(a)}:${toNum(A2)}:${toNum(b)}:${f.nm}`;
        answer = `${m(`k = ${nq(k)}`)} ; ${cm(B2, f.u)}`;
      }
    } else if (level === 2) {
      const kind = rng.pick(['aire', 'cube', 'facteur'] as const);
      if (kind === 'aire') {
        const k = rng.pick([q(2), q(3), q(4), q(1, 2), q(3, 2), q(5), q(1, 3), q(2, 3), q(5, 2), q(10)]);
        const A = q(rng.int(2, 30) * k.d * k.d);
        const A2 = mul(A, mul(k, k));
        const P = q(rng.int(6, 40) * k.d);
        const P2 = mul(P, k);
        const what = rng.pick(['Un triangle', 'Un parallélogramme', 'Un rectangle', 'Un losange', 'Un trapèze']);
        title = cmp(k, q(1)) > 0 ? 'Agrandissement : périmètre et aire.' : 'Réduction : périmètre et aire.';
        statement = `${what} a un périmètre de ${cm(P)} et une aire de ${m(`${nq(A)}\\,\\mathrm{cm}^2`)}. On ${cmp(k, q(1)) > 0 ? 'l’agrandit' : 'le réduit'} avec ${m(`k = ${nq(k)}`)}.`;
        steps.push(step('a) Nouveau périmètre ?', [{ label: '', expect: P2, form: 'any', unit: 'cm' }], 'Un périmètre est une longueur : × k.', mist(P2, [[mul(P, mul(k, k)), 'Le périmètre est une **longueur** : il est multiplié par k, pas par k².']])));
        steps.push(step('b) Nouvelle aire ?', [{ label: '', expect: A2, form: 'any', unit: 'cm²' }], `Les aires sont multipliées par ${m('k^2')}.`, mist(A2, [[mul(A, k), `Les aires sont multipliées par ${m(`k^2 = ${nq(mul(k, k))}`)}, pas par ${m('k')}.`], [mul(A, mul(k, q(2))), `${m('k^2')}, c’est ${m('k \\times k')}, pas ${m('2k')}.`]])));
        sol.push(`Longueurs (et périmètres) × ${m('k')} : ${m(`${nq(P)} \\times ${nq(k)} = ${nq(P2)}\\,\\mathrm{cm}`)}.`, `Aires × ${m(`k^2 = ${nq(mul(k, k))}`)} : ${m(`${nq(A)} \\times ${nq(mul(k, k))} = ${nq(A2)}\\,\\mathrm{cm}^2`)}.`);
        items.push({ what: 'P', js: `${toNum(P)}*${toNum(k)}`, expect: toNum(P2) }, { what: 'A', js: `${toNum(A)}*${toNum(k)}**2`, expect: toNum(A2) });
        key = `aire:${toNum(A)}:${toNum(P)}:${toNum(k)}:${what}`;
        answer = `${cm(P2)} ; ${m(`${nq(A2)}\\,\\mathrm{cm}^2`)}`;
      } else if (kind === 'cube') {
        const a = rng.int(1, 6), k = rng.pick([2, 3, 4, 5].filter((x) => x * a <= 20));
        const solid = rng.pick(['Un cube', 'Un dé', 'Une boîte cubique']);
        title = 'Agrandir un cube.';
        statement = `${solid} a une arête de ${m(`${a}\\,\\mathrm{cm}`)}. On l’agrandit avec ${m(`k = ${k}`)}.`;
        const F1 = a * a, F2 = (k * a) ** 2, V1 = a ** 3, V2 = (k * a) ** 3;
        steps.push(step('a) Aire d’une face avant et après ?', [{ label: 'Avant :', expect: q(F1), form: 'any', unit: 'cm²' }, { label: 'Après :', expect: q(F2), form: 'any', unit: 'cm²' }], `Nouvelle arête : ${m(`${a} \\times ${k}`)}. Aire d’un carré : côté × côté.`, mist(q(F2), [[q(F1 * k), `L’aire est multipliée par ${m(`k^2 = ${k * k}`)}, pas par ${k}.`]], 1)));
        steps.push(step('b) Volume avant et après ?', [{ label: 'Avant :', expect: q(V1), form: 'any', unit: 'cm³' }, { label: 'Après :', expect: q(V2), form: 'any', unit: 'cm³' }], `Volume d’un cube : arête³. Contrôle : × ${m('k^3')}.`, mist(q(V2), [[q(V1 * k * k), `Le volume est multiplié par ${m(`k^3 = ${k ** 3}`)}, pas par ${m('k^2')}.`], [q(V1 * k), `Le volume est multiplié par ${m(`k^3 = ${k ** 3}`)}.`]], 1)));
        sol.push(`Arête : ${m(`${a} \\to ${a * k}\\,\\mathrm{cm}`)}.`, `Face : ${m(`${F1} \\to ${F2}\\,\\mathrm{cm}^2`)}, et ${m(`${F2} = ${F1} \\times ${k * k} = ${F1} \\times ${k}^2`)}.`, `Volume : ${m(`${V1} \\to ${V2}\\,\\mathrm{cm}^3`)}, et ${m(`${V2} = ${V1} \\times ${k ** 3} = ${V1} \\times ${k}^3`)}.`);
        items.push({ what: 'F1', js: `${a}**2`, expect: F1 }, { what: 'F2', js: `(${a}*${k})**2`, expect: F2 }, { what: 'V1', js: `${a}**3`, expect: V1 }, { what: 'V2', js: `(${a}*${k})**3`, expect: V2 });
        key = `cube:${a}:${k}:${solid}`;
        answer = `${m(`${F1} \\to ${F2}\\,\\mathrm{cm}^2`)} ; ${m(`${V1} \\to ${V2}\\,\\mathrm{cm}^3`)}`;
      } else {
        const [a, b] = rng.pick([[4, 10], [2, 5], [4, 6], [5, 15], [3, 6], [6, 9], [8, 2], [10, 4], [6, 3], [5, 2], [12, 3], [2, 7], [4, 14], [10, 25], [6, 15]]);
        const k = q(b, a), k2 = mul(k, k), k3 = mul(k2, k);
        const unitL = rng.pick(['cm', 'm', 'mm']);
        title = 'Par combien sont multipliées les aires et les volumes ?';
        statement = `Dans ${rng.pick(['une maquette', 'un agrandissement', 'une réduction', 'un modèle réduit'])}, une longueur de ${m(`${a}\\,\\mathrm{${unitL}}`)} devient ${m(`${b}\\,\\mathrm{${unitL}}`)}.`.replace(cmp(k, q(1)) > 0 ? 'une réduction' : 'un agrandissement', cmp(k, q(1)) > 0 ? 'un agrandissement' : 'une réduction');
        steps.push(step(`Donne ${m('k')}, le coefficient des aires et celui des volumes.`, [{ label: m('k ='), expect: k, form: 'any' }, { label: 'Aires × ', expect: k2, form: 'any' }, { label: 'Volumes × ', expect: k3, form: 'any' }], `${m(`k = ${fr(b, a)}`)} ; aires × ${m('k^2')} ; volumes × ${m('k^3')}.`, [{ on: 'numAll', values: [k, k, k], msg: 'Les aires et les volumes ne sont pas multipliés par k : par k² et k³.' }, { on: 'numAll', values: [k, mul(k, q(2)), mul(k, q(3))], msg: 'k², c’est k × k (et non 2k) ; k³ = k × k × k.' }]));
        sol.push(`${m(`k = ${fr(b, a)} = ${nq(k)}`)}.`, `Aires : ${m(`k^2 = ${nq(k2)}`)} ; volumes : ${m(`k^3 = ${nq(k3)}`)}.`);
        items.push({ what: 'k', js: `${b}/${a}`, expect: toNum(k) }, { what: 'k2', js: `(${b}/${a})**2`, expect: toNum(k2) }, { what: 'k3', js: `(${b}/${a})**3`, expect: toNum(k3) });
        key = `fac:${a}:${b}:${unitL}`;
        answer = `${m(`k = ${nq(k)}`)} ; aires × ${m(nq(k2))} ; volumes × ${m(nq(k3))}`;
      }
    } else {
      if (rng.chance(0.5)) {
        // k à partir du rapport des aires
        const kk = rng.pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5], [2, 5], [3, 2], [2, 1], [3, 1], [5, 2], [4, 3]]);
        const k = q(kk[0], kk[1]), k2 = mul(k, k), k3 = mul(k2, k);
        const fq = (x: Q) => (x.d === 1 ? String(x.n) : fr(x.n, x.d));
        title = 'Retrouver le rapport.';
        statement = `${cmp(k, q(1)) < 0 ? 'Une réduction' : 'Un agrandissement'} multiplie les aires par ${m(fq(k2))}.`;
        steps.push(step(`a) Quel est le rapport ${m('k')} ?`, [{ label: m('k ='), expect: k, form: 'any', shown: fq(k) }], `${m(`k^2 = ${fq(k2)}`)} : cherche le nombre positif dont le carré vaut ${m(fq(k2))}.`, mist(k, [[div(k2, q(2)), `${m('k^2')} n’est pas ${m('2k')} : on cherche ${m('k')} tel que ${m(`k \\times k = ${fq(k2)}`)}.`], [k2, `C’est le coefficient des aires (${m('k^2')}), pas ${m('k')}.`]])));
        steps.push(step('b) Par combien multiplie-t-elle les volumes ?', [{ label: '', expect: k3, form: 'any', shown: fq(k3) }], `Volumes × ${m('k^3')}.`, mist(k3, [[k2, `Les volumes sont multipliés par ${m('k^3')}, pas ${m('k^2')}.`], [mul(k2, k2), `${m('k^3 = k \\times k \\times k')}.`]])));
        sol.push(`${m(`k^2 = ${fq(k2)}`)}, donc ${m(`k = ${fq(k)}`)} (car ${m(`${fq(k)} \\times ${fq(k)} = ${fq(k2)}`)}).`, `Volumes : ${m(`k^3 = ${fq(k3)}`)}.`);
        items.push({ what: 'k', js: `Math.sqrt(${toNum(k2)})`, expect: toNum(k) }, { what: 'k3', js: `Math.sqrt(${toNum(k2)})**3`, expect: toNum(k3) });
        key = `inv:${kk.join('/')}`;
        // trop peu de cas : on ajoute un volume concret
        const V = q(rng.int(2, 40) * k3.d * (k3.d === 1 ? rng.int(1, 5) : 1));
        const V2 = mul(V, k3);
        steps.push(step(`c) Un solide de ${m(`${nq(V)}\\,\\mathrm{cm}^3`)} subit cette transformation. Son nouveau volume ?`, [{ label: '', expect: V2, form: 'any', unit: 'cm³' }], `Multiplie par ${m(`k^3 = ${fq(k3)}`)}.`, mist(V2, [[mul(V, k2), 'Volume : × k³, pas × k².']])));
        sol.push(`${m(`${nq(V)} \\times ${fq(k3)} = ${nq(V2)}\\,\\mathrm{cm}^3`)}.`);
        items.push({ what: 'V2', js: `${toNum(V)}*${toNum(k3)}`, expect: toNum(V2) });
        key += `:${toNum(V)}`;
        answer = `${m(`k = ${fq(k)}`)} ; volumes × ${m(fq(k3))} ; ${m(`${nq(V2)}\\,\\mathrm{cm}^3`)}`;
      } else {
        // section de pyramide (ou de cône) parallèle à la base
        const H = rng.pick([6, 8, 9, 10, 12, 15, 16, 18, 20]);
        const hs = [1, 2, 3, 4, 5, 6, 8, 9, 10].filter((h) => h < H && Number.isInteger((H / h) * 1) === false || (h < H && H % h === 0));
        const h = rng.pick(hs.filter((x) => x < H));
        const k = q(h, H), k3 = mul(mul(k, k), k);
        const V = mul(q(rng.int(1, 12)), q(k3.d));
        const v = mul(V, k3);
        const sol2 = rng.pick(['pyramide', 'cône']);
        title = `Section d’${sol2 === 'cône' ? 'un cône' : 'une pyramide'}.`;
        statement = `${sol2 === 'cône' ? 'Un cône' : 'Une pyramide'} a une hauteur de ${m(`${H}\\,\\mathrm{cm}`)} et un volume de ${m(`${nq(V)}\\,\\mathrm{cm}^3`)}. On ${sol2 === 'cône' ? 'le' : 'la'} coupe par un plan parallèle à la base, à ${m(`${h}\\,\\mathrm{cm}`)} du sommet. ${sol2 === 'cône' ? 'Le petit cône obtenu est une réduction du grand.' : 'La petite pyramide obtenue est une réduction de la grande.'}`;
        steps.push(step(`a) Rapport de réduction ${m('k')} ?`, [{ label: m('k ='), expect: k, form: 'any' }], 'Rapport des hauteurs : petite ÷ grande.', mist(k, [[q(H, h), 'Rapport retourné : réduction, donc k < 1.'], [q(H - h, H), `La hauteur du petit solide est ${h} cm (distance au sommet).`]])));
        steps.push(step('b) Volume du petit solide ?', [{ label: '', expect: v, form: 'any', unit: 'cm³' }], `Volumes × ${m('k^3')}.`, mist(v, [[mul(V, k), 'Volumes × k³, pas × k.'], [mul(V, mul(k, k)), 'Volumes × k³, pas × k² (k² sert pour les aires).']])));
        sol.push(`${m(`k = ${fr(h, H)} = ${nq(k)}`)}.`, `Volumes × ${m(`k^3 = ${nq(k3)}`)} : ${m(`${nq(V)} \\times ${nq(k3)} = ${nq(v)}\\,\\mathrm{cm}^3`)}.`);
        items.push({ what: 'k', js: `${h}/${H}`, expect: toNum(k) }, { what: 'v', js: `${toNum(V)}*(${h}/${H})**3`, expect: toNum(v) });
        key = `sec:${H}:${h}:${toNum(V)}:${sol2}`;
        answer = `${m(`k = ${nq(k)}`)} ; ${m(`${nq(v)}\\,\\mathrm{cm}^3`)}`;
      }
    }
    return { title, statement, steps, solution: sol, answer, key, data: { kind: 'js', items } };
  },
};

// ===================================================================== triangles semblables
export const semblables: Generator = {
  id: 'semblables',
  title: 'Triangles semblables',
  desc: 'Côtés homologues (face aux angles égaux), rapport k ; reconnaître des côtés proportionnels.',
  stars: 2,
  levels: [2],
  example: '\\dfrac{4{,}5}{3} = \\dfrac{6}{4} = \\dfrac{7{,}5}{5} = 1{,}5',
  course: LINKS.s53,
  generate(rng: Rng) {
    // triangle ABC (côtés entiers ou demi-entiers, non aplati), k « simple »
    let a: number, b: number, cc: number;
    do { a = rng.int(3, 12); b = rng.int(3, 12); cc = rng.int(3, 12); } while (a + b <= cc + 1 || a + cc <= b + 1 || b + cc <= a + 1 || new Set([a, b, cc]).size < 3);
    const k = rng.pick([q(3, 2), q(2), q(5, 2), q(1, 2), q(3), q(4, 3), q(3, 4), q(5, 4), q(2, 3)]);
    const [T1, T2] = rng.pick([['ABC', 'MNP'], ['ABC', 'DEF'], ['RST', 'UVW'], ['EFG', 'KLM'], ['IJK', 'XYZ']]);
    const ab = q(a), bc = q(b), ac = q(cc);
    const mn = mul(ab, k), np = mul(bc, k), mp = mul(ac, k);
    const s1 = (i: number, j: number) => T1[i] + T1[j], s2 = (i: number, j: number) => T2[i] + T2[j];
    const steps: Step[] = [], sol: Rich[] = [];
    steps.push(step(`a) Calcule le rapport ${m(`k = ${fr(s2(0, 1), s1(0, 1))}`)}.`, [{ label: m('k ='), expect: k, form: 'any' }], `${m(`[${s2(0, 1)}]`)} est l’homologue de ${m(`[${s1(0, 1)}]`)}.`, mist(k, [[div(ab, mn), 'Rapport retourné.']])));
    steps.push(step(`b) Calcule ${m(s2(1, 2))} et ${m(s2(0, 2))}.`, [lenF(m(`${s2(1, 2)} =`), np), lenF(m(`${s2(0, 2)} =`), mp)], `Côtés homologues : ${m(`${s2(1, 2)} \\leftrightarrow ${s1(1, 2)}`)}, ${m(`${s2(0, 2)} \\leftrightarrow ${s1(0, 2)}`)}. Multiplie par ${m('k')}.`, [{ on: 'numAll', values: [mp, np], msg: 'Les deux longueurs sont inversées : respecte la correspondance des sommets.' }]));
    // c) reconnaître : deux autres triangles, côtés proportionnels ou non
    const prop = rng.chance(0.5);
    const k2 = rng.pick([q(2), q(3, 2), q(3), q(5, 2)]);
    const base = [3, 4, 5, 6, 7, 8, 9].filter((x) => x !== a);
    let t = rng.shuffle(base).slice(0, 3).sort((x, y) => x - y);
    while (t[0] + t[1] <= t[2]) t = rng.shuffle(base).slice(0, 3).sort((x, y) => x - y);
    const u = t.map((x) => mul(q(x), k2));
    if (!prop) u[rng.int(0, 2)] = add(u[rng.int(0, 2)], q(rng.pick([1, -1])));
    const us = [...u].sort((x, y) => cmp(x, y));
    const okProp = eq(div(us[0], q(t[0])), div(us[1], q(t[1]))) && eq(div(us[1], q(t[1])), div(us[2], q(t[2])));
    steps.push({ prompt: `c) Un triangle a des côtés de ${m(t.join(' ; '))} cm, un autre de ${m(us.map(nq).join(' ; '))} cm. Sont-ils semblables ?`, answer: fixedChoice(ON, okProp ? 0 : 1, [`Les rapports (plus petit avec plus petit…) ne sont pas tous égaux : ${m(us.map((x, i) => fr(nq(x), t[i])).join(',\\ '))}.`, 'Les trois rapports sont égaux : les côtés sont proportionnels, donc les triangles sont semblables.']), hint: 'Range les côtés dans l’ordre croissant et compare les trois rapports.' });
    sol.push(`a) ${m(`k = ${fr(s2(0, 1), s1(0, 1))} = ${fr(nq(mn), nq(ab))} = ${nq(k)}`)}.`, `b) ${m(`${s2(1, 2)} = ${nq(k)} \\times ${nq(bc)} = ${nq(np)}\\,\\mathrm{cm}`)} et ${m(`${s2(0, 2)} = ${nq(k)} \\times ${nq(ac)} = ${nq(mp)}\\,\\mathrm{cm}`)}.`, `c) ${m(us.map((x, i) => `${fr(nq(x), t[i])} = ${nq(div(x, q(t[i])))}`).join(' ;\\ '))} : ${okProp ? 'rapports égaux, côtés proportionnels : semblables' : 'rapports différents : pas semblables'}.`);
    const items: Item[] = [
      { what: 'k', js: `${toNum(mn)}/${a}`, expect: toNum(k) },
      { what: 'np', js: `${b}*${toNum(mn)}/${a}`, expect: toNum(np) },
      { what: 'mp', js: `${cc}*${toNum(mn)}/${a}`, expect: toNum(mp) },
      { what: 'step:2', js: `(()=>{const t=[${t}],u=[${us.map(toNum)}];return Math.abs(u[0]/t[0]-u[1]/t[1])<1e-9&&Math.abs(u[1]/t[1]-u[2]/t[2])<1e-9?0:1})()`, expect: okProp ? 0 : 1 },
    ];
    return {
      title: 'Triangles semblables.',
      statement: `Les triangles ${m(T1)} et ${m(T2)} sont semblables, ${m(T2[0])} correspondant à ${m(T1[0])}, ${m(T2[1])} à ${m(T1[1])} et ${m(T2[2])} à ${m(T1[2])}. ${m(`${s1(0, 1)} = ${a}\\,\\mathrm{cm}`)}, ${m(`${s1(1, 2)} = ${b}\\,\\mathrm{cm}`)}, ${m(`${s1(0, 2)} = ${cc}\\,\\mathrm{cm}`)} et ${m(`${s2(0, 1)} = ${nq(mn)}\\,\\mathrm{cm}`)}.`,
      steps,
      solution: sol,
      answer: `${m(`k = ${nq(k)}`)} ; ${m(`${s2(1, 2)} = ${nq(np)}`)}, ${m(`${s2(0, 2)} = ${nq(mp)}`)} ; ${okProp ? 'semblables' : 'pas semblables'}`,
      key: `${T1}:${a},${b},${cc}:${toNum(k)}:${t}:${us.map(toNum)}`,
      data: { kind: 'js', items },
    };
  },
};

// ===================================================================== problèmes concrets
function shadowSvg(h: number, s: number, S: number, H: number, labels: { h: string; s: string; S: string; H: string }, aria: string, names: string[]): string {
  // sol horizontal, A à gauche, bâton en D (à s de A), arbre en B (à S de A), rayon A → sommet de l'arbre
  const A: Pt = [0, 0], D: Pt = [s, 0], E: Pt = [s, h], B: Pt = [S, 0], C: Pt = [S, H];
  const { pts } = fit([A, D, E, B, C], 340, 210, 30);
  const [a, d, e, b, c] = pts;
  let body = line([a[0] - 6, a[1]], [b[0] + 18, b[1]], 'gf-line') + line(a, c, 'gf-dash') + line(d, e, 'gf-par') + line(b, c, 'gf-par');
  body += rightMark(d, a, e, 9) + rightMark(b, a, c, 9);
  for (const p of [a, d, e, b, c]) body += dot(p, 2.6);
  const nm = names;
  body += text([a[0] - 8, a[1] + 16], nm[0], 'gf-tb') + text([d[0] + 6, d[1] + 16], nm[1], 'gf-tb') + text([e[0] - 12, e[1] - 6], nm[2], 'gf-tb') + text([b[0], b[1] + 16], nm[3], 'gf-tb') + text([c[0] + 12, c[1] - 4], nm[4], 'gf-tb');
  body += text([d[0] + 6, (d[1] + e[1]) / 2], labels.h, labels.h === '?' ? 'gf-tq' : 'gf-t', 'start');
  body += text([b[0] + 8, (b[1] + c[1]) / 2], labels.H, labels.H === '?' ? 'gf-tq' : 'gf-t', 'start');
  body += text([(a[0] + d[0]) / 2, a[1] + 34], labels.s, 'gf-ts') + text([(a[0] + b[0]) / 2 + 10, a[1] + 34 + 0], '', 'gf-ts');
  body += line([a[0], a[1] + 24], [d[0], d[1] + 24], 'gf-thin') + line([a[0], a[1] + 44], [b[0], b[1] + 44], 'gf-thin');
  body += text([(a[0] + b[0]) / 2, a[1] + 56], labels.S, labels.S === '?' ? 'gf-tq' : 'gf-ts');
  return svgWrap(340, 270, aria, body);
}
export const probleme: Generator = {
  id: 'probleme',
  title: 'Problèmes (ombres, rampes, routes)',
  desc: 'Repérer les parallèles cachées (deux verticales), modéliser, rédiger ; ★★★ : Pythagore puis Thalès.',
  stars: 2,
  levels: [2, 3],
  example: '\\dfrac{2}{8} = \\dfrac{1{,}5}{BC}',
  course: LINKS.s42,
  links: [LINKS.s41, LINKS.serieI],
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: Item[] = [];
    if (level === 2) {
      const kind = rng.pick(['ombre', 'ombre', 'rampe', 'routes'] as const);
      if (kind === 'ombre') {
        // bâton h, ombre s ; objet H, ombre S ; S = s × r, H = h × r
        const r = rng.pick([q(3), q(4), q(5), q(6), q(8), q(10), q(5, 2), q(7, 2), q(9, 2), q(15, 2), q(7), q(9)]);
        const h = rng.pick([q(1), q(6, 5), q(3, 2), q(2), q(8, 5), q(9, 5), q(5, 2)]);
        const s = rng.pick([q(1), q(6, 5), q(3, 2), q(2), q(8, 5), q(5, 2), q(3), q(4, 5), q(9, 5), q(12, 5)].filter((x) => !eq(x, h) && toNum(x) >= 0.8 * toNum(h)));
        const S = mul(s, r), H = mul(h, r);
        const [st, obj] = rng.pick([['un bâton vertical', 'un arbre'], ['un poteau vertical', 'une tour'], ['une règle verticale', 'un lampadaire'], ['un piquet vertical', 'un immeuble'], ['un jalon vertical', 'une falaise']] as const);
        if (toNum(H) > 80 || toNum(H) < 3) return probleme.generate(rng, level);
        const n = ['A', 'D', 'E', 'B', 'C'];
        const Hfig = toNum(H), Sfig = toNum(S);
        const figure = shadowSvg(toNum(h), toNum(s), Sfig, Hfig, { h: `${L(h)} m`, s: `${L(s)} m`, S: `${L(S)} m`, H: '?' }, `Ombres : ${st} de ${L(h)} m, ombre ${L(s)} m ; ${obj}, ombre ${L(S)} m ; hauteur cherchée`, n);
        steps.push({ prompt: 'a) Pourquoi les droites (DE) et (BC) sont-elles parallèles ?', answer: shuffledChoice(rng, 'Elles sont toutes les deux perpendiculaires au sol.', [['Elles ont l’air parallèles sur le dessin.', 'Un dessin ne prouve rien : il faut une propriété.'], ['Les rayons du soleil sont parallèles.', 'Ce sont (DE) et (BC) qu’il faut justifier : ce sont des verticales.'], ['D’après le théorème de Thalès.', 'Le théorème de Thalès demande des parallèles : il ne les prouve pas.']]), hint: 'Deux droites perpendiculaires à une même droite sont parallèles.' });
        steps.push(step(`b) Quelle est la hauteur de ${obj} ?`, [{ label: m('BC ='), expect: H, form: 'any', unit: 'm' }], `${m(`${fr('AD', 'AB')} = ${fr('DE', 'BC')}`)} : ${m(`${fr(nq(s), nq(S))} = ${fr(nq(h), 'BC')}`)}.`, mist(H, [[div(mul(s, h), S), `Rapport retourné : ${obj} est plus haut que ${st.split(' ')[1]}.`], [div(mul(S, s), h), 'Mélange des longueurs : en haut le petit triangle (bâton, son ombre), en bas le grand.']])));
        sol.push(`On note ${m('A')} le bout des ombres, ${m('[DE]')} ${st.replace(' vertical', '').replace(' verticale', '')} et ${m('[BC]')} ${obj} (${m('D')} et ${m('B')} au sol).`, `${st[0].toUpperCase() + st.slice(1).replace(' vertical', '').replace(' verticale', '')} et ${obj} sont perpendiculaires au sol, donc ${m('(DE) \\parallel (BC)')}. Les points ${m('A')}, ${m('D')}, ${m('B')} sont alignés, ainsi que ${m('A')}, ${m('E')}, ${m('C')}.`, `D’après le théorème de Thalès : ${m(`${fr('AD', 'AB')} = ${fr('AE', 'AC')} = ${fr('DE', 'BC')}`)}, soit ${m(`${fr(nq(s), nq(S))} = ${fr(nq(h), 'BC')}`)}.`, `Donc ${m(`BC = ${fr(`${nq(S)} \\times ${nq(h)}`, nq(s))} = ${nq(H)}\\,\\mathrm{m}`)}. Contrôle : l’ombre est ${m(nq(r))} fois plus longue, la hauteur aussi.`);
        items.push({ what: 'H', js: `${toNum(S)}*${toNum(h)}/${toNum(s)}`, expect: toNum(H) }, { what: 'step:0', js: '0', expect: 0 });
        items.pop();
        return { title: 'Hauteur grâce aux ombres.', statement: `Au même instant, ${st} de ${m(`${nq(h)}\\,\\mathrm{m}`)} a une ombre de ${m(`${nq(s)}\\,\\mathrm{m}`)}, et ${obj} a une ombre de ${m(`${nq(S)}\\,\\mathrm{m}`)}. Les deux ombres se terminent au même point ${m('A')}.`, figure, steps, solution: sol, answer: `${m(`${nq(H)}\\,\\mathrm{m}`)}`, key: `o:${toNum(h)}:${toNum(s)}:${toNum(S)}:${obj}`, data: { kind: 'js', items } };
      }
      if (kind === 'rampe') {
        const [p, qq] = rng.pick([[2, 5], [1, 3], [2, 3], [1, 4], [3, 5], [3, 8], [1, 2]]);
        const AB = q(rng.int(2, 8) * qq, 1);
        const AD = mul(AB, q(p, qq));
        const DE = q(rng.int(2, 12) * qq, 20);
        const BC = div(mul(DE, AB), AD);
        if (toNum(BC) > 3 || toNum(BC) < 0.4 || toNum(DE) < 0.15) return probleme.generate(rng, level);
        steps.push(step('À quelle hauteur la rampe arrive-t-elle ?', [{ label: m('BC ='), expect: BC, form: 'any', unit: 'm' }], `Le support et la hauteur ${m('[BC]')} sont verticaux, donc parallèles : ${m(`${fr('AD', 'AB')} = ${fr('DE', 'BC')}`)}.`, mist(BC, [[div(mul(DE, AD), AB), 'Rapport retourné : la rampe monte, BC est plus grand que DE.'], [div(mul(DE, sub(AB, AD)), AD), 'AB est la distance totale depuis A, pas la distance entre le support et le bout.']])));
        sol.push(`Le support ${m('[DE]')} et la hauteur ${m('[BC]')} sont verticaux, donc ${m('(DE) \\parallel (BC)')}. ${m('A')}, ${m('D')}, ${m('B')} sont alignés, ainsi que ${m('A')}, ${m('E')}, ${m('C')}.`, `D’après le théorème de Thalès : ${m(`${fr('AD', 'AB')} = ${fr('DE', 'BC')}`)}, soit ${m(`${fr(nq(AD), nq(AB))} = ${fr(nq(DE), 'BC')}`)}.`, `Donc ${m(`BC = ${fr(`${nq(AB)} \\times ${nq(DE)}`, nq(AD))} = ${nq(BC)}\\,\\mathrm{m}`)}.`);
        items.push({ what: 'BC', js: `${toNum(AB)}*${toNum(DE)}/${toNum(AD)}`, expect: toNum(BC) });
        const figure = shadowSvg(toNum(DE), toNum(AD), toNum(AB), toNum(BC), { h: `${L(DE)} m`, s: `${L(AD)} m`, S: `${L(AB)} m`, H: '?' }, `Rampe [AC] depuis le sol en A ; support vertical DE = ${L(DE)} m à ${L(AD)} m de A ; B à ${L(AB)} m de A, hauteur BC cherchée`, ['A', 'D', 'E', 'B', 'C']);
        return { title: 'Une rampe d’accès.', statement: `Une rampe ${m('[AC]')} part du sol en ${m('A')}. Un support vertical ${m('[DE]')} (${m('D')} au sol, ${m('E')} sous la rampe) mesure ${m(`${nq(DE)}\\,\\mathrm{m}`)} et se trouve à ${m(`${nq(AD)}\\,\\mathrm{m}`)} de ${m('A')}. Au bout de la rampe, le point ${m('B')} du sol, sous ${m('C')}, est à ${m(`${nq(AB)}\\,\\mathrm{m}`)} de ${m('A')}.`, figure, steps, solution: sol, answer: m(`${nq(BC)}\\,\\mathrm{m}`), key: `r:${toNum(AD)}:${toNum(AB)}:${toNum(DE)}`, data: { kind: 'js', items } };
      }
      // routes : papillon en km
      const c = makeConf(rng, true, { min: 1.5, max: 9, h: [1, 0.5, 0.2], ks: KS.filter(([, qq]) => qq <= 5) });
      const { v } = c;
      const AC = solveCol({ ...c, n: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, S: segs({ A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }) }, 0, 'AC');
      steps.push(step('Calcule la distance AC.', [{ label: m('AC ='), expect: v.AC, form: 'any', unit: 'km' }], 'Configuration papillon : mêmes rapports, ' + m(`${fr('AD', 'AB')} = ${fr('AE', 'AC')}`) + '.', mist(v.AC, [[AC.wrong, 'Rapport retourné.']])));
      sol.push(`Les droites ${m('(BD)')} et ${m('(CE)')} sont sécantes en ${m('A')}, et ${m('(DE) \\parallel (BC)')}. D’après le théorème de Thalès (papillon) : ${m(`${fr('AD', 'AB')} = ${fr('AE', 'AC')}`)}, soit ${m(`${fr(nq(v.AD), nq(v.AB))} = ${fr(nq(v.AE), 'AC')}`)}.`, `Donc ${m(`${AC.tex} = ${nq(v.AC)}\\,\\mathrm{km}`)}.`);
      items.push({ what: 'AC', js: AC.js, expect: toNum(v.AC) });
      const figure = thalesSvg({ n: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, ...c.num, k: -toNum(c.k), labels: { AD: `${L(v.AD)} km`, AE: `${L(v.AE)} km`, AB: `${L(v.AB)} km`, AC: '?' }, ask: ['AC'], rot: rng.pick([0, 0.3, -0.3]), flip: rng.chance(0.5), aria: `Deux routes (BD) et (CE) qui se croisent en A, tronçons [DE] et [BC] parallèles` });
      return { title: 'Deux routes qui se croisent.', statement: `Deux routes droites ${m('(BD)')} et ${m('(CE)')} se croisent en ${m('A')} ; ${m('D')}, ${m('A')}, ${m('B')} sont alignés dans cet ordre, ainsi que ${m('E')}, ${m('A')}, ${m('C')}. Les tronçons ${m('[DE]')} et ${m('[BC]')} sont parallèles. ${m(`AD = ${nq(v.AD)}\\,\\mathrm{km}`)}, ${m(`AE = ${nq(v.AE)}\\,\\mathrm{km}`)} et ${m(`AB = ${nq(v.AB)}\\,\\mathrm{km}`)}.`, figure, steps, solution: sol, answer: m(`AC = ${nq(v.AC)}\\,\\mathrm{km}`), key: `rt:${toNum(v.AD)}:${toNum(v.AE)}:${toNum(v.AB)}`, data: { kind: 'js', items } };
    }
    // ★★★
    if (rng.chance(0.5)) {
      // I1 : rectangle en A, Pythagore puis Thalès, aire de deux façons
      const TR: [number, number, number][] = [];
      for (const [a0, b0, c0] of [[3, 4, 5], [5, 12, 13], [8, 15, 17]]) for (let f = 1; f * c0 <= 25; f++) TR.push([a0 * f, b0 * f, c0 * f], [b0 * f, a0 * f, c0 * f]);
      const [x, y, z] = rng.pick(TR);
      const k = rng.pick([q(3, 4), q(1, 2), q(2, 3), q(1, 3), q(1, 4), q(3, 5), q(2, 5), q(4, 5), q(5, 6), q(3, 8), q(5, 8), q(7, 10)].filter((kk) => Number.isInteger((x * 100 * kk.n) / kk.d) ));
      const AB = q(x), AC = q(y), BC = q(z), AD = mul(AB, k), AE = mul(AC, k), DE = mul(BC, k);
      const aire = div(mul(AD, AE), q(2)), A0 = q(x * y, 2);
      steps.push(step(`a) Calcule ${m('BC')}.`, [lenF(m('BC ='), BC)], `${m('ABC')} est rectangle en ${m('A')} : Pythagore.`, mist(BC, [[q(x + y), 'On additionne les **carrés**, puis on prend la racine carrée.']])));
      steps.push(step(`b) Calcule ${m('AE')} et ${m('DE')}.`, [lenF(m('AE ='), AE), lenF(m('DE ='), DE)], `${m(`${fr('AD', 'AB')} = ${fr('AE', 'AC')} = ${fr('DE', 'BC')}`)}.`, [{ on: 'numAll', values: [div(mul(AC, AB), AD), div(mul(BC, AB), AD)], msg: 'Rapports retournés : le petit triangle ADE en haut.' }]));
      steps.push(step(`c) Calcule l’aire de ${m('ADE')}.`, [{ label: '', expect: aire, form: 'any', unit: 'cm²' }], `${m('ADE')} est rectangle en ${m('A')} ; ou bien : aire de ${m('ABC')} × ${m('k^2')}.`, mist(aire, [[mul(A0, k), 'Les aires sont multipliées par k², pas par k.'], [mul(AD, AE), 'Aire d’un triangle rectangle : produit des côtés de l’angle droit **divisé par 2**.']])));
      sol.push(`a) ${m('ABC')} est rectangle en ${m('A')}. D’après le théorème de Pythagore : ${m(`BC^2 = ${x}^2 + ${y}^2 = ${x * x + y * y}`)}, donc ${m(`BC = ${z}\\,\\mathrm{cm}`)}.`);
      sol.push(`b) Les points ${m('A')}, ${m('D')}, ${m('B')} sont alignés, ainsi que ${m('A')}, ${m('E')}, ${m('C')}, et ${m('(DE) \\parallel (BC)')}. D’après le théorème de Thalès : ${m(`${fr('AD', 'AB')} = ${fr('AE', 'AC')} = ${fr('DE', 'BC')}`)}, soit ${m(`${fr(nq(AD), x)} = ${fr('AE', y)} = ${fr('DE', z)}`)}.`, `Donc ${m(`AE = ${fr(`${nq(AD)} \\times ${y}`, x)} = ${nq(AE)}\\,\\mathrm{cm}`)} et ${m(`DE = ${fr(`${nq(AD)} \\times ${z}`, x)} = ${nq(DE)}\\,\\mathrm{cm}`)}.`);
      sol.push(`c) ${m('ADE')} est rectangle en ${m('A')} : aire ${m(`= ${fr(`${nq(AD)} \\times ${nq(AE)}`, 2)} = ${nq(aire)}\\,\\mathrm{cm}^2`)}. Autre méthode : ${m(`${nq(A0)} \\times ${nq(k)}^2 = ${nq(aire)}`)}.`);
      items.push({ what: 'BC', js: `Math.hypot(${x},${y})`, expect: z }, { what: 'AE', js: `${toNum(AD)}*${y}/${x}`, expect: toNum(AE) }, { what: 'DE', js: `${toNum(AD)}*Math.hypot(${x},${y})/${x}`, expect: toNum(DE) }, { what: 'aire', js: `${toNum(AD)}*${toNum(AD)}*${y}/${x}/2`, expect: toNum(aire) });
      const figure = thalesSvg({ n: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' }, AB: x, AC: y, BC: z, k: toNum(k), labels: { AB: String(x), AC: String(y), AD: L(AD), DE: '?', BC: '?' }, ask: ['DE', 'BC'], rot: rng.pick([0, Math.PI / 2, -0.3]), flip: rng.chance(0.5), aria: `Triangle ABC rectangle en A, AB = ${x} cm, AC = ${y} cm, D sur [AB] avec AD = ${L(AD)} cm, (DE) parallèle à (BC)` });
      return { title: 'Pythagore, puis Thalès.', statement: `${m('ABC')} est rectangle en ${m('A')}, avec ${m(`AB = ${x}\\,\\mathrm{cm}`)} et ${m(`AC = ${y}\\,\\mathrm{cm}`)}. Le point ${m('D')} est sur ${m('[AB]')} avec ${m(`AD = ${nq(AD)}\\,\\mathrm{cm}`)}. La parallèle à ${m('(BC)')} passant par ${m('D')} coupe ${m('[AC]')} en ${m('E')}.`, figure, steps, solution: sol, answer: `${m(`BC = ${z}`)} ; ${m(`AE = ${nq(AE)}`)}, ${m(`DE = ${nq(DE)}`)} ; ${m(`${nq(aire)}\\,\\mathrm{cm}^2`)}`, key: `i1:${x},${y}:${toNum(k)}`, data: { kind: 'js', items } };
    }
    // I3 : charpente isocèle
    const [hh, half] = rng.pick([[3, 4], [4, 3], [6, 8], [5, 12], [8, 6], [9, 12], [2.4, 3.2], [1.5, 2], [1.8, 2.4], [2.1, 2.8], [3.6, 4.8], [2.7, 3.6], [1.2, 1.6], [4.5, 6], [3.3, 4.4], [1.5, 3.6], [2, 4.8]]);
    const AB = Math.hypot(hh, half);
    const AH = ql(hh), HB = ql(half), ABq = ql(AB);
    const d = rng.pick([q(1, 2), q(1, 4), q(2, 5), q(3, 5), q(1, 3), q(2, 3), q(3, 4)]);
    const AK = mul(AH, d), KD = mul(HB, d), DE = mul(KD, q(2)), AD = mul(ABq, d);
    if ([AK, KD, AD].some((x) => x.d > 100 || ![1, 2, 4, 5, 10, 20, 25, 50, 100].includes(x.d))) return probleme.generate(rng, level);
    steps.push(step(`a) Calcule ${m('AB')}.`, [{ label: m('AB ='), expect: ABq, form: 'any', unit: 'm' }], `${m('AHB')} est rectangle en ${m('H')}, avec ${m(`HB = ${nq(HB)}`)} (moitié de la base).`, mist(ABq, [[ql(Math.hypot(hh, 2 * half)), 'HB est la **moitié** de la base.']])));
    steps.push(step(`b) Calcule la longueur de la poutre ${m('DE')}, puis ${m('AD')}.`, [{ label: m('DE ='), expect: DE, form: 'any', unit: 'm' }, { label: m('AD ='), expect: AD, form: 'any', unit: 'm' }], `Dans ${m('AHB')} : ${m('(KD) \\parallel (HB)')}, donc ${m(`${fr('AK', 'AH')} = ${fr('AD', 'AB')} = ${fr('KD', 'HB')}`)} ; puis ${m('DE = 2 \\times KD')}.`, mist(DE, [[KD, `${m('KD')} n’est que la moitié de la poutre (symétrie).`]], 0)));
    sol.push(`a) ${m('H')} est le milieu de ${m('[BC]')}, donc ${m(`HB = ${nq(HB)}\\,\\mathrm{m}`)}. ${m('AHB')} est rectangle en ${m('H')} : ${m(`AB^2 = ${nq(AH)}^2 + ${nq(HB)}^2 = ${dx(round(AB * AB, 4))}`)}, donc ${m(`AB = ${nq(ABq)}\\,\\mathrm{m}`)}.`);
    sol.push(`b) La poutre et la base sont horizontales, donc perpendiculaires à ${m('(AH)')} : ${m('(KD) \\parallel (HB)')}. Dans le triangle ${m('AHB')}, d’après le théorème de Thalès : ${m(`${fr('AK', 'AH')} = ${fr('AD', 'AB')} = ${fr('KD', 'HB')}`)}, soit ${m(`${fr(nq(AK), nq(AH))} = ${fr('AD', nq(ABq))} = ${fr('KD', nq(HB))}`)}.`, `Donc ${m(`KD = ${nq(KD)}\\,\\mathrm{m}`)} et, par symétrie, ${m(`DE = 2 \\times ${nq(KD)} = ${nq(DE)}\\,\\mathrm{m}`)}. Enfin ${m(`AD = ${fr(`${nq(AK)} \\times ${nq(ABq)}`, nq(AH))} = ${nq(AD)}\\,\\mathrm{m}`)}.`);
    items.push({ what: 'AB', js: `Math.hypot(${hh},${half})`, expect: AB, tol: 1e-9 }, { what: 'DE', js: `2*${half}*${toNum(AK)}/${hh}`, expect: toNum(DE), tol: 1e-9 }, { what: 'AD', js: `Math.hypot(${hh},${half})*${toNum(AK)}/${hh}`, expect: toNum(AD), tol: 1e-9 });
    // figure : triangle isocèle, hauteur, poutre
    const A: Pt = [0, hh], B: Pt = [-half, 0], C: Pt = [half, 0], H: Pt = [0, 0], K: Pt = [0, hh - toNum(AK)], D2: Pt = [-toNum(KD), hh - toNum(AK)], E2: Pt = [toNum(KD), hh - toNum(AK)];
    const { pts } = fit([A, B, C, H, K, D2, E2].map(([x0, y0]) => [x0, y0] as Pt), 340, 220, 32);
    const [a, b, cP, hP, kP, dP, eP] = pts;
    let body = line(a, b) + line(a, cP) + line(b, cP, 'gf-par') + line(dP, eP, 'gf-par') + line(a, hP, 'gf-dash') + rightMark(hP, cP, a, 9);
    for (const p of [a, b, cP, hP, kP, dP, eP]) body += dot(p, 2.4);
    body += text([a[0], a[1] - 12], 'A', 'gf-tb') + text([b[0] - 10, b[1] + 12], 'B', 'gf-tb') + text([cP[0] + 10, cP[1] + 12], 'C', 'gf-tb') + text([hP[0], hP[1] + 16], 'H', 'gf-tb') + text([kP[0] + 10, kP[1] - 10], 'K', 'gf-tb') + text([dP[0] - 14, dP[1]], 'D', 'gf-tb') + text([eP[0] + 14, eP[1]], 'E', 'gf-tb');
    body += text([(b[0] + cP[0]) / 2 - 40, b[1] + 16], `BC = ${L(2 * half)} m`, 'gf-ts');
    const figure = svgWrap(340, 240, `Charpente : triangle ABC isocèle en A, base BC = ${L(2 * half)} m, hauteur AH = ${L(hh)} m, poutre horizontale [DE] coupant [AH] en K`, body);
    return { title: 'La charpente.', statement: `La charpente d’un toit a la forme d’un triangle ${m('ABC')} isocèle en ${m('A')}, de base ${m(`BC = ${nq(mul(HB, q(2)))}\\,\\mathrm{m}`)} et de hauteur ${m(`AH = ${nq(AH)}\\,\\mathrm{m}`)} (${m('H')} milieu de ${m('[BC]')}). On pose une poutre horizontale ${m('[DE]')} à ${m(`${nq(AK)}\\,\\mathrm{m}`)} sous le sommet (${m('D')} sur ${m('[AB]')}, ${m('E')} sur ${m('[AC]')}). Elle coupe ${m('[AH]')} en ${m('K')}.`, figure, steps, solution: sol, answer: `${m(`AB = ${nq(ABq)}`)} ; ${m(`DE = ${nq(DE)}`)}, ${m(`AD = ${nq(AD)}`)} (m)`, key: `i3:${hh}:${half}:${toNum(d)}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== trouver l'erreur
const R = {
  restant: 'Un segment « restant » (DB) n’est un côté d’aucun des deux triangles : il faut AB.',
  retourne: 'Un rapport est retourné : le petit triangle doit être en haut dans tous les rapports.',
  arrondi: 'On compare des valeurs arrondies : il faut comparer exactement (produits en croix).',
  aire: 'Les aires sont multipliées par k², pas par k.',
} as const;
export const erreur: Generator = {
  id: 'erreur',
  title: 'Trouver l’erreur',
  desc: 'Segment restant, rapport retourné, comparaison d’arrondis, aire × k au lieu de × k².',
  stars: 2,
  levels: [2],
  example: '\\dfrac{AD}{DB} = \\dfrac{DE}{BC} \\;?',
  course: LINKS.serieG,
  links: [LINKS.s29, LINKS.s35],
  generate(rng: Rng) {
    const kind = rng.pick(Object.keys(R) as (keyof typeof R)[]);
    const who = rng.pick(NAMES);
    const opts = (Object.keys(R) as (keyof typeof R)[]);
    const choice = shuffledChoice(rng, R[kind], opts.filter((k) => k !== kind).map((k) => [R[k], 'Non : ce n’est pas l’erreur commise ici. Relis l’affirmation.'] as [Rich, Rich]));
    const steps: Step[] = [{ prompt: 'Quelle est l’erreur ?', answer: choice, hint: 'Refais le raisonnement toi-même, étape par étape, et compare.' }];
    const sol: Rich[] = [R[kind]];
    const items: Item[] = [];
    let quote = '', key = '';
    if (kind === 'restant' || kind === 'retourne') {
      const c = makeConf(rng, false, { plain: true, ks: KS.filter(([p, qq]) => p / qq <= 0.7) });
      const { v } = c;
      if (kind === 'restant') {
        const wrong = div(mul(v.AD, v.BC), v.DB);
        if (eq(wrong, v.DE)) return erreur.generate(rng, 2);
        quote = `« ${m('(DE) \\parallel (BC)')}, ${m(`AD = ${nq(v.AD)}`)}, ${m(`DB = ${nq(v.DB)}`)}, ${m(`BC = ${nq(v.BC)}`)}. D’après Thalès, ${m(`${fr('AD', 'DB')} = ${fr('DE', 'BC')}`)}, donc ${m(`DE = ${nq(wrong)}`)}. »`;
        steps.push(step(`Que vaut vraiment ${m('DE')} ?`, [lenF(m('DE ='), v.DE)], `${m(`AB = AD + DB = ${nq(v.AB)}`)}, puis ${m(`${fr('AD', 'AB')} = ${fr('DE', 'BC')}`)}.`, mist(v.DE, [[wrong, 'C’est le résultat faux de ' + who + '.']])));
        sol.push(`${m(`AB = ${nq(v.AD)} + ${nq(v.DB)} = ${nq(v.AB)}`)}, puis ${m(`${fr(nq(v.AD), nq(v.AB))} = ${fr('DE', nq(v.BC))}`)}, donc ${m(`DE = ${fr(`${nq(v.AD)} \\times ${nq(v.BC)}`, nq(v.AB))} = ${nq(v.DE)}`)}.`);
        items.push({ what: 'DE', js: `${toNum(v.AD)}*${toNum(v.BC)}/(${toNum(v.AD)}+${toNum(v.DB)})`, expect: toNum(v.DE) });
        key = `r:${toNum(v.AD)}:${toNum(v.DB)}:${toNum(v.BC)}`;
      } else {
        const wrong = div(mul(v.AB, v.BC), v.AD);
        quote = `« ${m('(DE) \\parallel (BC)')}, ${m(`AD = ${nq(v.AD)}`)}, ${m(`AB = ${nq(v.AB)}`)}, ${m(`BC = ${nq(v.BC)}`)}. D’après Thalès, ${m(`${fr('AD', 'AB')} = ${fr('BC', 'DE')}`)}, donc ${m(`DE = ${nq(wrong)}`)}. »`;
        steps.push(step(`Que vaut vraiment ${m('DE')} ?`, [lenF(m('DE ='), v.DE)], `${m(`${fr('AD', 'AB')} = ${fr('DE', 'BC')}`)}.`, mist(v.DE, [[wrong, 'C’est le résultat faux.']])));
        sol.push(`${m(`${fr(nq(v.AD), nq(v.AB))} = ${fr('DE', nq(v.BC))}`)}, donc ${m(`DE = ${nq(v.DE)}`)}. Contrôle : ${m('DE')} est un côté du petit triangle, il doit être plus petit que ${m(`BC = ${nq(v.BC)}`)} ; ${m(nq(wrong))} est absurde.`);
        items.push({ what: 'DE', js: `${toNum(v.AD)}*${toNum(v.BC)}/${toNum(v.AB)}`, expect: toNum(v.DE) });
        key = `t:${toNum(v.AD)}:${toNum(v.AB)}:${toNum(v.BC)}`;
      }
    } else if (kind === 'arrondi') {
      // deux rapports proches, égaux au centième près, différents
      let a = 0, b = 0, c2 = 0, d2 = 0;
      for (;;) {
        a = rng.int(3, 12); b = rng.int(a + 2, 25); c2 = rng.int(3, 14); d2 = rng.int(c2 + 2, 28);
        if (a * d2 === b * c2 || a === c2) continue;
        if (Math.round((a / b) * 100) === Math.round((c2 / d2) * 100)) break;
      }
      const r = Math.round((a / b) * 100) / 100;
      quote = `« ${m(`${fr('AD', 'AB')} = ${fr(a, b)} \\approx ${dx(r)}`)} et ${m(`${fr('AE', 'AC')} = ${fr(c2, d2)} \\approx ${dx(r)}`)}, donc les droites ${m('(DE)')} et ${m('(BC)')} sont parallèles. »`;
      steps.push(step('Calcule les produits en croix.', [{ label: m(`${a} \\times ${d2} =`), expect: q(a * d2), form: 'any' }, { label: m(`${b} \\times ${c2} =`), expect: q(b * c2), form: 'any' }], 'Produits en croix des deux fractions.'));
      steps.push({ prompt: 'Les droites sont-elles parallèles ?', answer: fixedChoice(ON, 1, [`${m(`${a * d2} \\neq ${b * c2}`)} : les rapports sont différents.`, null]), hint: 'Produits différents → rapports différents.' });
      sol.push(`${m(`${a} \\times ${d2} = ${a * d2}`)} et ${m(`${b} \\times ${c2} = ${b * c2}`)} : les rapports sont différents. Les droites ne sont **pas** parallèles (sinon, d’après le théorème de Thalès, les rapports seraient égaux).`);
      items.push({ what: 'p1', js: `${a}*${d2}`, expect: a * d2 }, { what: 'p2', js: `${b}*${c2}`, expect: b * c2 });
      key = `a:${a}/${b}:${c2}/${d2}`;
    } else {
      const k = rng.pick([q(1, 2), q(1, 3), q(2), q(3), q(1, 4), q(3, 2)]);
      const A = q(rng.int(2, 30) * k.d * k.d * (rng.chance(0.5) ? 1 : 2));
      const wrong = mul(A, k), good = mul(A, mul(k, k));
      const big = cmp(k, q(1)) > 0;
      const fac = big ? `${k.n === 2 && k.d === 1 ? 'deux' : k.n === 3 && k.d === 1 ? 'trois' : nq(k)} fois plus grands` : `${k.d === 2 ? 'deux' : k.d === 3 ? 'trois' : 'quatre'} fois plus petits`;
      quote = `« Les côtés du nouveau triangle sont ${fac}, et l’aire de départ est ${m(`${nq(A)}\\,\\mathrm{cm}^2`)}, donc la nouvelle aire est ${m(`${nq(wrong)}\\,\\mathrm{cm}^2`)}. »`;
      steps.push(step('Quelle est la vraie nouvelle aire ?', [{ label: '', expect: good, form: 'any', unit: 'cm²' }], `${m(`k = ${nq(k)}`)} : aires × ${m(`k^2 = ${nq(mul(k, k))}`)}.`, mist(good, [[wrong, 'C’est le résultat faux : × k au lieu de × k².']])));
      sol.push(`${m(`k = ${nq(k)}`)}, donc les aires sont multipliées par ${m(`k^2 = ${nq(mul(k, k))}`)} : ${m(`${nq(A)} \\times ${nq(mul(k, k))} = ${nq(good)}\\,\\mathrm{cm}^2`)}.`);
      items.push({ what: 'A', js: `${toNum(A)}*${toNum(k)}**2`, expect: toNum(good) });
      key = `k:${toNum(k)}:${toNum(A)}`;
    }
    void pickNames; void ql; void ratioTex; void justif; void COLS;
    return { title: 'Trouve l’erreur.', statement: `${who} affirme : ${quote}`, steps, solution: sol, answer: R[kind], key: `${kind}:${key}`, data: { kind: 'js', items } };
  },
};
