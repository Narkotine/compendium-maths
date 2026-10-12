/** Chapitre 09 : propriétés des droites, droites remarquables, quadrilatères, cercle, trouver l'erreur. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice, fixedChoice } from '../engine/build';
import { LINKS, m, dg, hat, cm, degF, lenF, intF, step, corr, q, type Item } from './common';

const L = (v: number) => String(v).replace('.', '{,}');
const LET = ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'P', 'R', 'S', 'T'];
const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29], [9, 40, 41], [15, 20, 25], [10, 24, 26], [12, 35, 37], [15, 36, 39], [16, 30, 34], [21, 28, 35], [18, 24, 30], [24, 32, 40], [28, 45, 53]];

// ===================================================================== propriétés des droites
const PROPS = [
  'Si deux droites sont parallèles à une même droite, alors elles sont parallèles entre elles.',
  'Si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles entre elles.',
  'Si deux droites sont parallèles, toute perpendiculaire à l’une est perpendiculaire à l’autre.',
];
export const proprietes: Generator = {
  id: 'proprietes', title: 'Droites : on sait que, or, donc', stars: 1, levels: [1, 2], course: LINKS.s13, links: [LINKS.s11, LINKS.s7],
  desc: 'Notations, parallèles et perpendiculaires (P1, P2, P3) ; choisir la propriété et la conclusion.',
  example: '(d_1) \\perp (d),\\ (d_2) \\perp (d) \\Rightarrow (d_1) \\parallel (d_2)',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const [X, Y, Z, W, U, V] = rng.shuffle(LET).slice(0, 6), [d1, d2, d3] = rng.pick([[`(${X}${Y})`, `(${Z}${W})`, `(${U}${V})`], [`(${X}${Y})`, `(${Z}${W})`, `(${U}${V})`], [`(${X}${Y})`, `(${Z}${W})`, `(${U}${V})`], [`(${X}${Y})`, `(${Z}${W})`, `(${U}${V})`], ['(d_1)', '(d_2)', '(d)'], ['(\\Delta_1)', '(\\Delta_2)', '(\\Delta)'], ['(d)', '(d\')', '(\\delta)'], [`(${X}${Y})`, '(d)', '(\\Delta)']]);
    if (level === 1) {
      const NOT = [`(${X}${Y})`, `[${X}${Y}]`, `[${X}${Y})`, `${X}${Y}`], DESC = [`la droite qui passe par ${m(X)} et ${m(Y)}`, `le segment d’extrémités ${m(X)} et ${m(Y)}`, `la demi-droite d’origine ${m(X)} qui passe par ${m(Y)}`, `la longueur du segment d’extrémités ${m(X)} et ${m(Y)}`];
      const k = rng.int(0, 3);
      steps.push({ prompt: `a) Comment note-t-on ${DESC[k]} ?`, answer: fixedChoice(NOT.map(m), k, ['La droite est illimitée des deux côtés.', 'Le segment s’arrête aux deux points.', 'La demi-droite part de son origine, côté crochet.', 'Sans crochet ni parenthèse : c’est un nombre.'], 2), hint: 'Parenthèses : illimité ; crochet : on s’arrête au point ; rien : une longueur.' });
      items.push({ what: 'step:0', js: String(k), expect: k });
      sol.push(`a) ${m(NOT[k])}.`);
    }
    const c = rng.int(0, 2), hyp = [`${m(`${d1} \\parallel ${d3}`)} et ${m(`${d2} \\parallel ${d3}`)}`, `${m(`${d1} \\perp ${d3}`)} et ${m(`${d2} \\perp ${d3}`)}`, `${m(`${d1} \\parallel ${d3}`)} et ${m(`${d2} \\perp ${d3}`)}`][c];
    const CONC = [m(`${d1} \\parallel ${d2}`), m(`${d1} \\perp ${d2}`), 'On ne peut rien conclure'], good = c === 2 ? 1 : 0;
    const off = steps.length, lt = (i: number) => 'abcd'[i + off];
    steps.push({ prompt: `${lt(0)}) On sait que ${hyp}. Que peut-on conclure pour ${m(d1)} et ${m(d2)} ?`, answer: fixedChoice(CONC, good, [c === 2 ? 'Une perpendiculaire à l’une de deux parallèles…' : null, c === 2 ? null : 'Fais un dessin à main levée : elles ne se coupent pas.', 'Une des trois propriétés s’applique.'], 2), hint: 'Fais un dessin à main levée avec les trois droites.' });
    items.push({ what: `step:${off}`, js: String(good), expect: good });
    steps.push({ prompt: `${lt(1)}) Quelle propriété cite-t-on après « Or » ?`, answer: shuffledChoice(rng, PROPS[c], PROPS.filter((_, i) => i !== c).map((p) => [p, 'Relis les hypothèses : parallèles ou perpendiculaires ?'] as [Rich, Rich])), hint: 'La propriété doit commencer par exactement ce que l’on sait.' });
    items.push({ what: `step:${off + 1}`, js: String(corr(steps[off + 1])), expect: corr(steps[off + 1]) });
    sol.push(`On sait que ${hyp}. Or : « ${PROPS[c]} » Donc ${CONC[good]}.`);
    if (level === 2) {
      // enchaînement (exemple guidé 1) puis vrai/faux
      const used = new Set(`${d1}${d2}${d3}`.match(/[A-Z]/g) ?? []), free = LET.filter((l) => !used.has(l)), e1 = `(${free[0]}${free[1]})`, e2 = `(${free[2]}${free[3]})`;
      steps.push({ prompt: `c) On sait de plus que ${m(`${e1} \\perp ${d2}`)}. Que peut-on dire de ${m(e1)} et ${m(d1)} ?`, answer: fixedChoice([m(`${e1} \\parallel ${d1}`), m(`${e1} \\perp ${d1}`), 'On ne peut rien conclure'], c === 2 ? 0 : 1, [c === 2 ? null : `${m(d1)} et ${m(d2)} sont parallèles : une perpendiculaire à l’une est perpendiculaire à l’autre.`, c === 2 ? `${m(d1)} et ${m(d2)} sont perpendiculaires à… : deux perpendiculaires à une même droite sont parallèles.` : null, 'Utilise la conclusion de la question précédente.'], 2), hint: 'Utilise la conclusion précédente comme nouvelle donnée.' });
      const g2 = c === 2 ? 0 : 1; items.push({ what: 'step:2', js: String(g2), expect: g2 });
      sol.push(c === 2 ? `On sait que ${m(`${d2} \\perp ${d1}`)} et ${m(`${e1} \\perp ${d2}`)}. Or deux droites perpendiculaires à une même droite sont parallèles. Donc ${m(`${e1} \\parallel ${d1}`)}.` : `On sait que ${m(`${d1} \\parallel ${d2}`)} et ${m(`${e1} \\perp ${d2}`)}. Or, si deux droites sont parallèles, toute perpendiculaire à l’une est perpendiculaire à l’autre. Donc ${m(`${e1} \\perp ${d1}`)}.`);
      const VF: [Rich, number, Rich][] = [['Deux droites perpendiculaires sont sécantes.', 0, 'Elles se coupent en formant un angle droit.'], [`Si ${m(`${e1} \\perp ${e2}`)} et ${m(`${e2} \\perp ${d3}`)}, alors ${m(`${e1} \\perp ${d3}`)}.`, 1, `${m(e1)} et ${m(d3)} sont perpendiculaires à la même droite : elles sont parallèles.`], ['Deux droites qui ne se coupent pas sur la feuille sont parallèles.', 1, 'Prolongées, elles peuvent se couper hors de la feuille.'], ['Deux droites parallèles à une même troisième sont parallèles entre elles.', 0, 'C’est la propriété P1.'], ['Deux droites sécantes peuvent avoir deux points communs.', 1, 'Sécantes : un seul point commun.']];
      const [t, k, why] = rng.pick(VF);
      steps.push({ prompt: `d) Vrai ou faux : « ${t} »`, answer: fixedChoice(['Vrai', 'Faux'], k, [why, why]), hint: 'Fais un dessin à main levée.' });
      items.push({ what: 'step:3', js: String(k), expect: k });
      sol.push(`d) ${k ? 'Faux' : 'Vrai'} : ${why}`);
    }
    return { title: level === 1 ? 'Notations et propriétés.' : 'Démontrer en deux étapes.', statement: '', steps, solution: sol, answer: sol.join(' '), key: `${level}|${d1}${d2}${d3}|${c}|${sol.join('')}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== droites remarquables
export const remarquables: Generator = {
  id: 'remarquables', title: 'Droites remarquables', stars: 1, levels: [1, 2], course: LINKS.s41, links: [LINKS.s42, LINKS.s43],
  desc: 'Médiatrice (MA = MB), bissectrice, nommer une droite ; ★★ cercle circonscrit au triangle rectangle, hauteurs et aire.',
  example: 'M \\in \\text{médiatrice de } [AB] \\iff MA = MB',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const ma = rng.int(15, 90) / 10;
      items.push({ what: 'mb', js: `${ma}`, expect: ma });
      steps.push(step(`a) ${m('M')} est sur la médiatrice de ${m('[AB]')} et ${m(`MA = ${cm(ma)}`)}. Combien vaut ${m('MB')} ?`, [lenF('', ma)], 'Un point de la médiatrice est à égale distance des extrémités.', mist(q(Math.round(ma * 50), 100), [[q(Math.round(ma * 50), 100), 'M n’est pas le milieu : il est à la même distance de A et de B.']])));
      sol.push(`a) M est sur la médiatrice de ${m('[AB]')}, donc ${m(`MB = MA = ${cm(ma)}`)}.`);
      const na = rng.int(2, 8), same = rng.chance(0.4), nb = same ? na : na + rng.pick([-1, 1, 2]);
      steps.push({ prompt: `b) ${m(`NA = ${na}\\,\\mathrm{cm}`)} et ${m(`NB = ${nb}\\,\\mathrm{cm}`)}. ${m('N')} est-il sur la médiatrice de ${m('[AB]')} ?`, answer: fixedChoice(['Oui', 'Non'], same ? 0 : 1, [`${na} ≠ ${nb}.`, `${m('NA = NB')} : N est à égale distance de A et de B.`]), hint: 'Sur la médiatrice si et seulement si à égale distance de A et de B.' });
      items.push({ what: 'step:1', js: `${na}===${nb}?0:1`, expect: same ? 0 : 1 });
      sol.push(`b) ${same ? `${m('NA = NB')} : N est sur la médiatrice.` : `${m('NA \\neq NB')} : N n’est pas sur la médiatrice.`}`);
      const xo = 2 * rng.int(15, 85);
      items.push({ what: 'bis', js: `${xo}/2`, expect: xo / 2 });
      steps.push(step(`c) ${m(`${hat('xOy')} = ${dg(xo)}`)} et ${m('[Oz)')} est sa bissectrice. ${m(hat('xOz'))} ?`, [degF('', xo / 2)], 'La bissectrice partage l’angle en deux angles égaux.', mist(q(xo / 2), [[q(xo), 'La bissectrice partage l’angle en deux.'], [q(180 - xo), 'Ce n’est pas un supplémentaire : on prend la moitié.']])));
      sol.push(`c) ${m(`${hat('xOz')} = ${dg(xo)} \\div 2 = ${dg(xo / 2)}`)}.`);
      const LINES = ['La hauteur issue de A', 'La médiane issue de A', 'La médiatrice de [BC]', 'La bissectrice de l’angle A'];
      const DESC = ['la droite qui passe par A et est perpendiculaire à (BC)', 'la droite qui passe par A et par le milieu de [BC]', 'la droite perpendiculaire à [BC] en son milieu', 'la demi-droite qui partage l’angle BAC en deux angles égaux'];
      const k = rng.int(0, 3);
      steps.push({ prompt: `d) Dans un triangle ABC, comment s’appelle ${DESC[k]} ?`, answer: fixedChoice(LINES, k, ['Hauteur : passe par le sommet, perpendiculaire au côté opposé.', 'Médiane : passe par le sommet et le milieu du côté opposé.', 'Médiatrice : perpendiculaire au côté en son milieu ; pas forcément par A.', 'Bissectrice : partage un angle en deux.'], 2), hint: 'Médiane : milieu ; médiatrice : milieu ET angle droit ; hauteur : angle droit depuis le sommet.' });
      items.push({ what: 'step:3', js: String(k), expect: k });
      sol.push(`d) ${LINES[k]}.`);
      return { title: 'Médiatrice, bissectrice, hauteur, médiane.', statement: '', steps, solution: sol, answer: sol.join(' '), key: `1|${ma}|${na}|${nb}|${xo}|${k}`, data: { kind: 'js', items } };
    }
    if (rng.chance(0.6)) {
      const [a0, b0, c0] = rng.pick(TRIPLES), s = rng.pick([1, 0.5, 1.5, 2, 2.5, 3].filter((k) => c0 * k <= 60)), [a, b, c] = [a0 * s, b0 * s, c0 * s], [A, B, C] = rng.pick([['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T']]), legs = rng.chance(0.5);
      const OPT = [`Au milieu de ${m(`[${B}${C}]`)}`, `En ${m(A)}`, 'Au centre de gravité du triangle'];
      steps.push({ prompt: 'a) Où est le centre du cercle circonscrit ?', answer: fixedChoice(OPT, 0, [null, 'Le sommet de l’angle droit est SUR le cercle.', 'Le centre du cercle circonscrit est le point de concours des médiatrices.'], 2), hint: 'Triangle rectangle : pense à l’hypoténuse.' });
      items.push({ what: 'step:0', js: '0', expect: 0 });
      if (legs) { items.push({ what: 'hyp', js: `Math.sqrt(${a}**2+${b}**2)`, expect: c }); steps.push(step(`b) Calcule ${m(`${B}${C}`)}.`, [lenF(`${m(`${B}${C}`)} =`, c)], 'Pythagore dans le triangle rectangle.', mist(q(Math.round((a + b) * 100), 100), [[q(Math.round((a + b) * 100), 100), 'On additionne les carrés, puis on prend la racine carrée.']]))); }
      items.push({ what: 'r', js: `Math.sqrt(${a}**2+${b}**2)/2`, expect: c / 2 });
      steps.push(step(`${legs ? 'c' : 'b'}) Rayon du cercle, puis longueur ${m(`${A}O`)} ?`, [lenF('Rayon :', c / 2), lenF(`${m(`${A}O`)} =`, c / 2)], `Le rayon est la moitié de l’hypoténuse, et ${m(A)} est sur le cercle.`, [{ on: 'numAll', values: [q(Math.round(c * 100), 100), q(Math.round(c * 100), 100)], msg: 'L’hypoténuse est un diamètre : le rayon en est la moitié.' }]));
      sol.push(`a) Le triangle est rectangle en ${m(A)}. Or le centre du cercle circonscrit à un triangle rectangle est le milieu de son hypoténuse. Donc le centre O est le milieu de ${m(`[${B}${C}]`)}.`);
      if (legs) sol.push(`b) Pythagore : ${m(`${B}${C}^2 = ${L(a)}^2 + ${L(b)}^2 = ${L(a * a)} + ${L(b * b)} = ${L(c * c)}`)}, donc ${m(`${B}${C} = ${cm(c)}`)}.`);
      sol.push(`${legs ? 'c' : 'b'}) Rayon : ${m(`${L(c)} \\div 2 = ${cm(c / 2)}`)}. ${m(A)} est sur le cercle, donc ${m(`${A}O = ${cm(c / 2)}`)}.`);
      const st = legs ? `${m(`${A}${B}${C}`)} est rectangle en ${m(A)}, avec ${m(`${A}${B} = ${cm(a)}`)} et ${m(`${A}${C} = ${cm(b)}`)}.` : `${m(`${A}${B}${C}`)} est rectangle en ${m(A)} et ${m(`${B}${C} = ${cm(c)}`)}.`;
      return { title: 'Cercle circonscrit à un triangle rectangle.', statement: st, steps, solution: sol, answer: `milieu de [${B}${C}] ; ${L(c / 2)} cm`, key: `c|${a}|${b}|${legs}`, data: { kind: 'js', items } };
    }
    // aire et hauteurs (D6)
    let bc: number, h: number, ab: number; do { bc = rng.int(4, 14); h = rng.int(3, 12); ab = rng.int(Math.max(h + 1, 4), 16); } while ((bc * h) % ab !== 0 || ab === bc || (bc * h) % 2 !== 0);
    const A = (bc * h) / 2, h2 = (bc * h) / ab;
    items.push({ what: 'A', js: `${bc}*${h}/2`, expect: A }, { what: 'h2', js: `2*(${bc}*${h}/2)/${ab}`, expect: h2 });
    steps.push(step('a) Aire du triangle ?', [{ ...intF('', A, 'cm²') }], 'Base × hauteur ÷ 2.', mist(q(A), [[q(bc * h), 'N’oublie pas de diviser par 2.']])));
    steps.push(step(`b) Hauteur issue de ${m('C')} ?`, [lenF('', h2)], `Même aire avec la base ${m('[AB]')} : ${m(`\\dfrac{${ab} \\times h}{2} = ${A}`)}.`, mist(q(Math.round((A / ab) * 100), 100), [[q(Math.round((A / ab) * 100), 100), 'Aire = base × hauteur ÷ 2 : il faut multiplier l’aire par 2 avant de diviser.']])));
    sol.push(`a) ${m(`\\mathcal{A} = \\dfrac{${bc} \\times ${h}}{2} = ${A}\\,\\mathrm{cm}^2`)}.`, `b) Avec la base ${m('[AB]')} : ${m(`\\dfrac{${ab} \\times h}{2} = ${A}`)}, donc ${m(`h = \\dfrac{2 \\times ${A}}{${ab}} = ${cm(h2)}`)}.`);
    return { title: 'Hauteurs et aire.', statement: `Dans un triangle ${m('ABC')}, ${m(`BC = ${bc}\\,\\mathrm{cm}`)}, la hauteur issue de ${m('A')} mesure ${m(`${h}\\,\\mathrm{cm}`)} et ${m(`AB = ${ab}\\,\\mathrm{cm}`)}.`, steps, solution: sol, answer: `${A} cm² ; ${L(h2)} cm`, key: `h|${bc}|${h}|${ab}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== quadrilatères
const NAT = ['Parallélogramme (sans plus)', 'Rectangle', 'Losange', 'Carré', 'On ne peut pas conclure'];
const FACTS: [Rich, number, Rich][] = [
  ['Ses diagonales se coupent en leur milieu.', 0, 'Diagonales de même milieu : parallélogramme ; rien de plus.'],
  ['Ses diagonales se coupent en leur milieu et ont la même longueur.', 1, 'Parallélogramme à diagonales égales : rectangle.'],
  ['Ses diagonales se coupent en leur milieu et sont perpendiculaires.', 2, 'Parallélogramme à diagonales perpendiculaires : losange.'],
  ['Ses diagonales se coupent en leur milieu, sont perpendiculaires et ont la même longueur.', 3, 'Rectangle et losange : carré.'],
  ['Ses quatre côtés ont la même longueur.', 2, 'Quatre côtés égaux : c’est la définition du losange.'],
  ['Il a trois angles droits.', 1, 'Le quatrième angle vaut 360° − 270° = 90° : rectangle.'],
  ['C’est un parallélogramme qui a un angle droit.', 1, 'Parallélogramme avec un angle droit : rectangle.'],
  ['C’est un parallélogramme qui a deux côtés consécutifs égaux.', 2, 'Parallélogramme avec deux côtés consécutifs égaux : losange.'],
  ['C’est un parallélogramme avec un angle droit et deux côtés consécutifs égaux.', 3, 'Rectangle et losange : carré.'],
  ['Ses diagonales sont perpendiculaires.', 4, 'Un cerf-volant a des diagonales perpendiculaires sans être un losange : il faut d’abord un parallélogramme.'],
  ['Ses diagonales ont la même longueur.', 4, 'Un trapèze isocèle a des diagonales de même longueur sans être un rectangle.'],
  ['Ses côtés opposés sont parallèles deux à deux.', 0, 'C’est la définition du parallélogramme.'],
  ['Deux côtés opposés sont parallèles et de même longueur.', 0, 'Parallélogramme ; rien ne dit plus.'],
];
export const quadrilateres: Generator = {
  id: 'quadrilateres', title: 'Quadrilatères', stars: 1, levels: [1, 2], course: LINKS.s52, links: [LINKS.s51],
  desc: 'Reconnaître un parallélogramme, un rectangle, un losange, un carré ; ★★ calculs dans un parallélogramme ou un losange.',
  example: '\\text{diagonales de même milieu et égales} \\Rightarrow \\text{rectangle}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const picks = rng.shuffle(FACTS.map((_, i) => i)).slice(0, 3);
      picks.forEach((fi, i) => {
        const [t, k, why] = FACTS[fi];
        steps.push({ prompt: `${'abc'[i]}) ${t} Quelle est la nature du quadrilatère ?`, answer: fixedChoice(NAT, k, NAT.map(() => why), 2), hint: 'Commence par savoir si c’est un parallélogramme, puis regarde les diagonales ou les côtés.' });
        items.push({ what: `step:${i}`, js: String(k), expect: k });
        sol.push(`${'abc'[i]}) ${NAT[k]} : ${why[0].toLowerCase() + why.slice(1)}`);
      });
      return { title: 'Quelle est la nature du quadrilatère ?', statement: 'On ne se fie pas au dessin : on utilise seulement les informations données.', steps, solution: sol, answer: picks.map((p) => NAT[FACTS[p][1]]).join(' ; '), key: picks.join('|'), data: { kind: 'js', items } };
    }
    if (rng.chance(0.55)) {
      const ab = rng.int(5, 12), bc = rng.int(3, ab - 1), A = rng.int(40, 80), ac = 2 * rng.int(Math.ceil(ab / 2) + 1, ab + bc - 1) / 2;
      const ok = ac < ab + bc && ac > ab; if (!ok) return quadrilateres.generate(rng, level);
      items.push({ what: 'cd', js: `${ab}`, expect: ab }, { what: 'ad', js: `${bc}`, expect: bc }, { what: 'C', js: `${A}`, expect: A }, { what: 'B', js: `180-${A}`, expect: 180 - A }, { what: 'ao', js: `${ac}/2`, expect: ac / 2 });
      steps.push(step('a) Longueurs ?', [lenF(m('CD ='), ab), lenF(m('AD ='), bc)], 'Côtés opposés de même longueur.', [{ on: 'numAll', values: [q(bc), q(ab)], msg: 'CD est opposé à AB, AD est opposé à BC.' }]));
      steps.push(step('b) Angles ?', [degF(`${m(hat('C'))} =`, A), degF(`${m(hat('B'))} =`, 180 - A)], 'Angles opposés égaux ; deux angles consécutifs supplémentaires.', [{ on: 'numAll', values: [q(180 - A), q(A)], msg: 'L’angle opposé à  est Ĉ (égal) ; B̂ est consécutif à  (supplémentaire).' }, { on: 'numAll', values: [q(A), q(90 - A)], msg: 'Deux angles consécutifs sont supplémentaires (180°), pas complémentaires.' }]));
      steps.push(step(`c) ${m('AO')} ?`, [lenF('', ac / 2)], 'Les diagonales se coupent en leur milieu.', mist(q(Math.round(ac * 10), 10), [[q(Math.round(ac * 10), 10), 'O est le milieu de [AC] : AO est la moitié de AC.']])));
      sol.push(`a) Côtés opposés de même longueur : ${m(`CD = AB = ${cm(ab)}`)} et ${m(`AD = BC = ${cm(bc)}`)}.`, `b) Angles opposés égaux : ${m(`${hat('C')} = ${hat('A')} = ${dg(A)}`)} ; angles consécutifs supplémentaires : ${m(`${hat('B')} = ${hat('D')} = 180^\\circ - ${dg(A)} = ${dg(180 - A)}`)}.`, `c) Les diagonales se coupent en leur milieu O : ${m(`AO = \\dfrac{${L(ac)}}{2} = ${cm(ac / 2)}`)}.`);
      return { title: 'Dans un parallélogramme.', statement: `${m('ABCD')} est un parallélogramme de centre ${m('O')} avec ${m(`AB = ${cm(ab)}`)}, ${m(`BC = ${cm(bc)}`)}, ${m(`${hat('A')} = ${dg(A)}`)} et ${m(`AC = ${cm(ac)}`)}.`, steps, solution: sol, answer: `${ab} ; ${bc} ; ${A}° ; ${180 - A}° ; ${L(ac / 2)}`, key: `p|${ab}|${bc}|${A}|${ac}`, data: { kind: 'js', items } };
    }
    const s = rng.int(6, 30) / 2, eq60 = rng.chance(0.25), A = eq60 ? 60 : rng.pick([40, 50, 70, 80, 100, 110, 120, 130, 140].filter((x) => x !== 60));
    items.push({ what: 'C', js: `${A}`, expect: A }, { what: 'B', js: `180-${A}`, expect: 180 - A }, { what: 'base', js: `(180-${A})/2`, expect: (180 - A) / 2 });
    steps.push(step('a) Angles du losange ?', [degF(`${m(hat('C'))} =`, A), degF(`${m(hat('B'))} =`, 180 - A)], 'Un losange est un parallélogramme : angles opposés égaux, consécutifs supplémentaires.'));
    steps.push(step(`b) Le triangle ${m('ABD')} est isocèle en ${m('A')}. Combien mesure ${m(hat('ABD'))} ?`, [degF('', (180 - A) / 2)], `${m('AB = AD')} : angles à la base égaux.`, mist(q((180 - A) / 2), [[q(180 - A), 'Les deux angles à la base se partagent 180° − Â : divise par 2.']])));
    sol.push(`a) Un losange est un parallélogramme : ${m(`${hat('C')} = ${dg(A)}`)} et ${m(`${hat('B')} = ${hat('D')} = ${dg(180 - A)}`)}.`, `b) ${m(`AB = AD = ${cm(s)}`)} : ${m('ABD')} est isocèle en ${m('A')}, donc ${m(`${hat('ABD')} = \\dfrac{180^\\circ - ${dg(A)}}{2} = ${dg((180 - A) / 2)}`)}.`);
    if (eq60) { items.push({ what: 'bd', js: `${s}`, expect: s }); steps.push(step(`c) En déduire ${m('BD')}.`, [lenF('', s)], 'Regarde les trois angles du triangle ABD.')); sol.push(`c) Les trois angles de ${m('ABD')} mesurent ${m('60^\\circ')} : il est équilatéral, donc ${m(`BD = ${cm(s)}`)}.`); }
    return { title: 'Dans un losange.', statement: `${m('ABCD')} est un losange de côté ${m(cm(s))} avec ${m(`${hat('A')} = ${dg(A)}`)}.`, steps, solution: sol, answer: `${A}° ; ${180 - A}° ; ${(180 - A) / 2}°`, key: `l|${s}|${A}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== cercle
export const cercle: Generator = {
  id: 'cercle', title: 'Le cercle', stars: 1, levels: [1, 2, 3], course: LINKS.s6, links: [LINKS.s63, LINKS.s42],
  desc: 'Rayon, diamètre, position d’un point ; ★★ tangente et demi-cercle avec Pythagore ; ★★★ angle inscrit.',
  example: '\\widehat{AMB} = \\dfrac{\\widehat{AOB}}{2}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const r = rng.int(5, 90) / 10;
      items.push({ what: 'd', js: `2*${r}`, expect: 2 * r });
      steps.push(step('a) Longueur d’un diamètre ?', [lenF('', 2 * r)], 'Un diamètre mesure deux rayons.', mist(q(Math.round(r * 50), 100), [[q(Math.round(r * 50), 100), 'Le diamètre est le double du rayon, pas la moitié.']])));
      sol.push(`a) ${m(`2 \\times ${L(r)} = ${cm(2 * r)}`)}.`);
      const OPT = ['À l’intérieur du disque', 'Sur le cercle', 'À l’extérieur'];
      const ds = rng.shuffle([rng.int(1, Math.round(r * 10) - 1) / 10, r, rng.int(Math.round(r * 10) + 1, Math.round(r * 10) + 30) / 10]).slice(0, 2);
      ds.forEach((d, i) => { const k = d < r ? 0 : d === r ? 1 : 2, P = ['M', 'N'][i]; steps.push({ prompt: `${'bc'[i]}) ${m(`O${P} = ${cm(d)}`)}. Où est le point ${m(P)} ?`, answer: fixedChoice(OPT, k, [`${L(d)} n’est pas inférieur à ${L(r)}.`, `${L(d)} ≠ ${L(r)}.`, `${L(d)} n’est pas supérieur à ${L(r)}.`], 2), hint: 'Compare la distance au centre et le rayon.' }); items.push({ what: `step:${i + 1}`, js: `${d}<${r}?0:${d}===${r}?1:2`, expect: k }); sol.push(`${'bc'[i]}) ${m(`${L(d)} ${['<', '=', '>'][k]} ${L(r)}`)} : ${OPT[k].toLowerCase()}.`); });
      return { title: 'Cercle et disque.', statement: `Un cercle a pour centre ${m('O')} et pour rayon ${m(cm(r))}.`, steps, solution: sol, answer: sol.join(' '), key: `${r}|${ds.join(',')}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      const [a0, b0, c0] = rng.pick(TRIPLES), s = rng.pick([1, 0.5, 1.5, 2, 2.5, 3].filter((k) => c0 * k <= 60)), [a, b, c] = [a0 * s, b0 * s, c0 * s];
      if (rng.chance(0.5)) {
        const [r, ap] = rng.chance(0.5) ? [a, b] : [b, a];
        items.push({ what: 'op', js: `Math.hypot(${r},${ap})`, expect: c });
        steps.push({ prompt: `a) Quelle est la nature du triangle ${m('OAP')} ?`, answer: fixedChoice(['Rectangle en A', 'Rectangle en O', 'Isocèle en A'], 0, [null, 'La tangente est perpendiculaire au RAYON [OA], en A.', 'Rien ne dit que AO = AP.'], 2), hint: 'La tangente en A est perpendiculaire au rayon [OA].' });
        items.push({ what: 'step:0', js: '0', expect: 0 });
        steps.push(step(`b) Calcule ${m('OP')}.`, [lenF(m('OP ='), c)], 'Pythagore dans le triangle rectangle en A.', mist(q(Math.round((r + ap) * 100), 100), [[q(Math.round((r + ap) * 100), 100), 'On additionne les carrés, pas les longueurs.']])));
        sol.push(`a) La tangente en ${m('A')} est perpendiculaire au rayon ${m('[OA]')} : ${m('OAP')} est rectangle en ${m('A')}.`, `b) Pythagore : ${m(`OP^2 = ${L(r)}^2 + ${L(ap)}^2 = ${L(c * c)}`)}, donc ${m(`OP = ${cm(c)}`)}.`);
        return { title: 'Tangente à un cercle.', statement: `Un cercle de centre ${m('O')} a pour rayon ${m(cm(r))}. ${m('A')} est sur le cercle, ${m('(T)')} est la tangente en ${m('A')}, et ${m('P')} est un point de ${m('(T)')} tel que ${m(`AP = ${cm(ap)}`)}.`, steps, solution: sol, answer: `${L(c)} cm`, key: `t|${r}|${ap}`, data: { kind: 'js', items } };
      }
      items.push({ what: 'r', js: `Math.hypot(${a},${b})/2`, expect: c / 2 });
      steps.push({ prompt: `a) Quelle est la nature du triangle ${m('ABC')} ?`, answer: fixedChoice(['Rectangle en C', 'Rectangle en A', 'Isocèle en C'], 0, [null, 'L’angle droit est en face du diamètre [AB].', `${L(a)} ≠ ${L(b)}.`], 2), hint: 'Un côté du triangle est un diamètre du cercle.' });
      items.push({ what: 'step:0', js: '0', expect: 0 });
      steps.push(step('b) Rayon du cercle ?', [lenF('', c / 2)], 'Calcule AB avec Pythagore, puis divise par 2.', mist(q(Math.round(c * 100), 100), [[q(Math.round(c * 100), 100), 'AB est le diamètre : le rayon en est la moitié.']])));
      sol.push(`a) On sait que ${m('C')} est sur le cercle de diamètre ${m('[AB]')}. Or un triangle inscrit dans un cercle qui a pour côté un diamètre est rectangle. Donc ${m('ABC')} est rectangle en ${m('C')}.`, `b) Pythagore : ${m(`AB^2 = ${L(a)}^2 + ${L(b)}^2 = ${L(c * c)}`)}, donc ${m(`AB = ${cm(c)}`)} et le rayon vaut ${m(cm(c / 2))}.`);
      return { title: 'Triangle dans un demi-cercle.', statement: `${m('[AB]')} est un diamètre d’un cercle et ${m('C')} un point du cercle, avec ${m(`AC = ${cm(a)}`)} et ${m(`BC = ${cm(b)}`)}.`, steps, solution: sol, answer: `rectangle en C ; ${L(c / 2)} cm`, key: `d|${a}|${b}`, data: { kind: 'js', items } };
    }
    const aob = 2 * rng.int(20, 80), ins = rng.int(15, 80);
    items.push({ what: 'amb', js: `${aob}/2`, expect: aob / 2 }, { what: 'oab', js: `(180-${aob})/2`, expect: (180 - aob) / 2 }, { what: 'cen', js: `2*${ins}`, expect: 2 * ins });
    steps.push(step(`a) ${m(`${hat('AOB')} = ${dg(aob)}`)}. Calcule ${m(hat('AMB'))}.`, [degF('', aob / 2)], 'Un angle inscrit vaut la moitié de l’angle au centre qui intercepte le même arc.', mist(q(aob / 2), [[q(aob), 'L’angle inscrit est la MOITIÉ de l’angle au centre.'], [q(2 * aob), 'C’est l’angle au centre qui est le double, pas l’inverse.']])));
    steps.push(step(`b) Calcule ${m(hat('OAB'))}.`, [degF('', (180 - aob) / 2)], `${m('OA = OB')} (rayons) : le triangle ${m('AOB')} est isocèle en ${m('O')}.`, mist(q((180 - aob) / 2), [[q(180 - aob), 'Les deux angles à la base se partagent 180° − AÔB.']])));
    steps.push(step(`c) Un autre angle inscrit mesure ${m(dg(ins))}. Combien mesure l’angle au centre qui intercepte le même arc ?`, [degF('', 2 * ins)], 'L’angle au centre est le double.', mist(q(2 * ins), [[ins % 2 === 0 ? q(ins / 2) : null, 'L’angle au centre est le double, pas la moitié.']])));
    sol.push(`a) ${m(hat('AMB'))} est un angle inscrit qui intercepte le même arc que l’angle au centre ${m(hat('AOB'))}, donc ${m(`${hat('AMB')} = ${dg(aob)} \\div 2 = ${dg(aob / 2)}`)}.`, `b) ${m('OA = OB')} (rayons) : ${m('AOB')} est isocèle en ${m('O')}, donc ${m(`${hat('OAB')} = \\dfrac{180^\\circ - ${dg(aob)}}{2} = ${dg((180 - aob) / 2)}`)}.`, `c) ${m(`2 \\times ${dg(ins)} = ${dg(2 * ins)}`)}.`);
    return { title: 'Angle inscrit et angle au centre.', statement: `${m('A')}, ${m('B')}, ${m('M')} sont sur un cercle de centre ${m('O')}, ${m('M')} étant sur le grand arc.`, steps, solution: sol, answer: `${aob / 2}° ; ${(180 - aob) / 2}° ; ${2 * ins}°`, key: `i|${aob}|${ins}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== trouver l'erreur
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s7, links: [LINKS.s31, LINKS.s23, LINKS.s52, LINKS.s33],
  desc: 'Mauvais côté testé, hypothèse oubliée, réciproque mal utilisée, angle égal au mauvais endroit, médiane et médiatrice.',
  example: '\\text{« alternes-internes donc égaux » : il manque } (d) \\parallel (d\')',
  generate(rng: Rng) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [], nm = rng.pick(['Lou', 'Sami', 'Inès', 'Hugo', 'Maël', 'Nora', 'Tom', 'Jade']), v = rng.int(0, 4);
    const ERR = ['Les côtés comparés ne sont pas les bons.', 'Il manque une hypothèse : les droites doivent être parallèles.', 'La conclusion suppose un parallélogramme, ce qui n’est pas établi.', 'L’angle égal est placé au mauvais sommet.', 'Médiane et médiatrice sont confondues.'];
    const pick = (k: number) => { const bad = rng.shuffle(ERR.filter((_, i) => i !== k)).slice(0, 2).map((e) => [e, 'Relis bien le raisonnement.'] as [Rich, Rich]); return shuffledChoice(rng, ERR[k], bad); };
    let st: Rich, key: string, ans: Rich;
    if (v === 0) {
      let a: number, b: number; do { a = rng.int(2, 7); b = rng.int(a + 1, 9); } while (false);
      const c = a + b + rng.int(0, 2), k = c === a + b ? 2 : 1;
      st = `« Les côtés mesurent ${m(String(a))}, ${m(String(b))} et ${m(`${c}\\,\\mathrm{cm}`)}. On a ${m(`${a} < ${b} + ${c}`)} et ${m(`${b} < ${a} + ${c}`)}, donc le triangle est constructible. »`;
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: pick(0), hint: 'Quel côté faut-il comparer à la somme des deux autres ?' });
      steps.push({ prompt: 'b) Le triangle est-il constructible ?', answer: fixedChoice(['Oui', 'Non', 'Non : les points sont alignés'], k, [`${c} n’est pas inférieur à ${a} + ${b}.`, null, null], 2), hint: `Compare ${c} à ${a} + ${b}.` });
      items.push({ what: 'step:1', js: `${c}<${a}+${b}?0:${c}===${a}+${b}?2:1`, expect: k });
      sol.push(`${nm} a testé les deux petits côtés, ce qui ne sert à rien. Il faut tester le plus grand : ${m(`${c} ${c === a + b ? '=' : '>'} ${a} + ${b} = ${a + b}`)}.`, k === 2 ? 'Égalité : les points sont alignés, le triangle est aplati.' : 'Le triangle n’est pas constructible.');
      key = `0|${a}|${b}|${c}`; ans = k === 2 ? 'aplati' : 'non';
    } else if (v === 1) {
      let x = rng.int(35, 140); if (x === 90) x = 72;
      st = `« Une sécante coupe ${m('(d)')} et ${m('(d\')')}. Les angles 1 et 2 sont alternes-internes et l’angle 1 mesure ${m(dg(x))}, donc l’angle 2 mesure ${m(dg(x))}. »`;
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: pick(1), hint: 'Des angles alternes-internes sont-ils toujours égaux ?' });
      steps.push({ prompt: 'b) Sans autre information, que vaut l’angle 2 ?', answer: fixedChoice([m(dg(x)), m(dg(180 - x)), 'On ne peut pas savoir'], 2, ['Seulement si (d) ∥ (d′).', 'Rien ne permet de le dire.', null], 2), hint: 'Le parallélisme n’est pas donné.' });
      items.push({ what: 'step:1', js: '2', expect: 2 });
      sol.push(`Il manque l’hypothèse ${m('(d) \\parallel (d\')')} : sans elle, des angles alternes-internes ne sont pas égaux en général.`, 'Sans autre information, on ne peut pas connaître l’angle 2.');
      key = `1|${x}`; ans = 'il manque (d) ∥ (d′)';
    } else if (v === 2) {
      st = '« Les diagonales de ABCD sont perpendiculaires, donc ABCD est un losange. »';
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: pick(2), hint: 'Un cerf-volant a des diagonales perpendiculaires.' });
      const oa = rng.int(2, 6), oc = oa + rng.int(1, 4), ob = rng.int(2, 6);
      steps.push({ prompt: `b) Les diagonales se coupent en O, perpendiculaires, avec ${m(`OA = ${oa}`)}, ${m(`OC = ${oc}`)}, ${m(`OB = OD = ${ob}`)}. Est-ce un losange ?`, answer: fixedChoice(['Oui', 'Non'], 1, [`O n’est pas le milieu de [AC] : ${oa} ≠ ${oc}.`, null]), hint: 'O est-il le milieu des DEUX diagonales ?' });
      items.push({ what: 'step:1', js: `${oa}===${oc}?0:1`, expect: 1 });
      sol.push('Il faut d’abord que ABCD soit un parallélogramme (diagonales qui se coupent en leur milieu) ; ensuite seulement, des diagonales perpendiculaires en font un losange.', `Contre-exemple : ${m(`OA = ${oa} \\neq OC = ${oc}`)} : c’est un cerf-volant, pas un losange.`);
      key = `2|${oa}|${oc}|${ob}`; ans = 'non';
    } else if (v === 3) {
      const b = rng.int(25, 80);
      st = `« ${m('ABC')} est isocèle en ${m('A')} et ${m(`${hat('B')} = ${dg(b)}`)}, donc ${m(`${hat('A')} = ${dg(b)}`)} et ${m(`${hat('C')} = ${dg(180 - 2 * b)}`)}. »`;
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: pick(3), hint: 'Quels sont les angles égaux dans un triangle isocèle en A ?' });
      steps.push(step('b) Corrige.', [degF(`${m(hat('C'))} =`, b), degF(`${m(hat('A'))} =`, 180 - 2 * b)], 'Les angles à la base sont égaux.', 180 - 2 * b === b ? [] : [{ on: 'numAll', values: [q(180 - 2 * b), q(b)], msg: 'C’est justement l’erreur à corriger.' }]));
      items.push({ what: 'c', js: `${b}`, expect: b }, { what: 'a', js: `180-2*${b}`, expect: 180 - 2 * b });
      sol.push(`Les angles égaux sont ceux de la base : ${m(`${hat('C')} = ${hat('B')} = ${dg(b)}`)}, et ${m(`${hat('A')} = 180^\\circ - 2 \\times ${dg(b)} = ${dg(180 - 2 * b)}`)}.`);
      key = `3|${b}`; ans = `${b}° ; ${180 - 2 * b}°`;
    } else {
      const [P1, P2, P3] = rng.pick(['ABC', 'DEF', 'MNP', 'RST', 'IJK', 'EFG', 'KLM', 'UVW', 'ACE', 'BDF', 'PQR', 'GHI', 'LMN', 'XYZ', 'STU', 'HIJ']).split(''), sw = (t: string) => t.replace(/A/g, '§1').replace(/B/g, '§2').replace(/C/g, '§3').replace(/§1/g, P1).replace(/§2/g, P2).replace(/§3/g, P3);
      st = sw('« La médiatrice de [BC] passe par A, puisque c’est la droite qui joint A au milieu de [BC]. »');
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: pick(4), hint: 'Médiane : sommet et milieu. Médiatrice : milieu et angle droit.' });
      steps.push({ prompt: sw('b) Dans quel cas la médiatrice de [BC] passe-t-elle par A à coup sûr ?'), answer: fixedChoice([sw('Quand ABC est isocèle en A'), sw('Quand ABC est rectangle en A'), 'Toujours'], 0, [null, sw('Il faut AB = AC.'), sw('Il faut AB = AC.')], 2), hint: sw('A est sur la médiatrice si et seulement si AB = AC.') });
      items.push({ what: 'step:1', js: '0', expect: 0 });
      sol.push(sw('La droite qui joint A au milieu de [BC] est la médiane issue de A. La médiatrice de [BC] est perpendiculaire à [BC] en son milieu et ne passe pas forcément par A.'), sw('Elle passe par A si et seulement si AB = AC, c’est-à-dire si ABC est isocèle en A.'));
      key = `4|${P1}${P2}${P3}`; ans = 'médiane ≠ médiatrice';
    }
    items.unshift({ what: 'step:0', js: String(corr(steps[0])), expect: corr(steps[0]) });
    return { title: 'Trouve l’erreur.', statement: `${nm} écrit : ${st}`, steps, solution: sol, answer: ans, key, data: { kind: 'js', items } };
  },
};
