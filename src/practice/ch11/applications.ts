/**
 * Applications du théorème de Pythagore : figures usuelles (★★), problèmes concrets (★★ → ★★★),
 * distance dans un repère (★★★), Pythagore deux fois (★★★). Figures SVG à l'échelle.
 */
import type { Generator, Level, Rich, Step, NumField } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist } from '../engine/build';
import { svgWrap, poly, line, text, dot, rightMark, vertexLabel, sideLabel, fit, centroid, type Pt } from '../engine/svg';
import { LINKS, m, lenTex, mq, triplets, dx, round, roundQ, qd, sq, lengthField, PRIMITIVE, rightTriangleSvg, ROTS } from './common';

const dt = (v: number) => dx(v).replace('{,}', ',');
const u = (v: number, unit: string) => {
  const [w, e] = unit.split('^');
  return `${dx(v)}\\,\\text{${w}}${e ? `^${e}` : ''}`;
};
const uf = (f: NumField, unit: string) => `${lenTex(f)}\\,\\text{${unit}}`;
const approxOr = (f: { exact: boolean }) => (f.exact ? '=' : '\\approx');
/** Valeur d'une erreur typique : exacte si décimale courte, sinon arrondie comme la réponse attendue. */

// ===================================================================== figures usuelles
function figSvg(kind: string, d: { a: number; b: number }, labels: Record<string, string>, aria: string): string {
  const W = 340, H = 220;
  let base: Pt[], extra: (p: Pt[]) => string;
  if (kind === 'rect' || kind === 'carre') {
    base = [[0, 0], [d.a, 0], [d.a, d.b], [0, d.b]];
    extra = (p) => line(p[0], p[2], 'gf-hl') + rightMark(p[1], p[0], p[2], 10) + vertexLabel(p[0], centroid(p), 'A') + vertexLabel(p[1], centroid(p), 'B') + vertexLabel(p[2], centroid(p), 'C') + vertexLabel(p[3], centroid(p), 'D') + sideLabel(p[0], p[1], centroid(p), labels.AB) + (kind === 'rect' ? sideLabel(p[1], p[2], centroid(p), labels.BC) : '') + text([(p[0][0] + p[2][0]) / 2 + 14, (p[0][1] + p[2][1]) / 2 - 8], '?', 'gf-tq');
  } else if (kind === 'iso' || kind === 'equi') {
    // base [BC] = 2a, hauteur b
    base = [[-d.a, 0], [d.a, 0], [0, d.b]];
    extra = (p) => {
      const Hh: Pt = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2];
      const g = centroid(p);
      return line(p[2], Hh, 'gf-hl') + rightMark(Hh, p[1], p[2], 9) + vertexLabel(p[0], g, 'B') + vertexLabel(p[1], g, 'C') + vertexLabel(p[2], g, 'A') + text([Hh[0] - 9, Hh[1] + 17], 'H', 'gf-t') + sideLabel(p[0], p[1], [g[0], g[1] - 999], labels.BC, 'gf-t', 38) + sideLabel(p[2], p[1], g, labels.AC) + (kind === 'equi' ? sideLabel(p[0], p[2], g, labels.AC) : sideLabel(p[0], p[2], g, labels.AC)) + text([Hh[0] + 12, (Hh[1] + p[2][1]) / 2], '?', 'gf-tq', 'start');
    };
  } else {
    // losange : diagonales 2a et 2b
    base = [[-d.a, 0], [0, -d.b], [d.a, 0], [0, d.b]];
    extra = (p) => {
      const O: Pt = [(p[0][0] + p[2][0]) / 2, (p[0][1] + p[2][1]) / 2];
      const g = O;
      return line(p[0], p[2], 'gf-dash') + line(p[1], p[3], 'gf-dash') + rightMark(O, p[2], p[1], 9) + line(p[0], p[1], 'gf-hl') + ['A', 'B', 'C', 'D'].map((n, i) => vertexLabel(p[i], g, n)).join('') + text([O[0] + 6, O[1] + 18], 'O', 'gf-t', 'start') + text([(p[0][0] + p[1][0]) / 2 - 12, (p[0][1] + p[1][1]) / 2 - 8], '?', 'gf-tq', 'end') + text([(O[0] + p[2][0]) / 2, O[1] - 7], labels.AC, 'gf-ts') + text([O[0] - 7, (O[1] + p[3][1]) / 2], labels.BD, 'gf-ts', 'end');
    };
  }
  const { pts } = fit(base, W, H, kind === 'iso' || kind === 'equi' ? 46 : 34, 0);
  return svgWrap(W, H, aria, poly(pts) + extra(pts));
}
export const figures: Generator = {
  id: 'figures',
  title: 'Figures usuelles',
  desc: 'Diagonale d’un rectangle ou d’un carré, hauteur d’un triangle isocèle ou équilatéral, côté d’un losange.',
  stars: 2,
  levels: [2],
  example: '\\text{diagonale d’un rectangle } 9 \\times 12',
  course: LINKS.s51,
  links: [LINKS.s52],
  generate(rng: Rng) {
    const kind = rng.weighted([['rect', 1.2], ['carre', 0.8], ['iso', 1.2], ['equi', 0.7], ['losange', 1.1]] as const);
    let title: Rich, steps: Step[], lines: Rich[], answer: Rich, items: { what: string; js: string; expect: number; tol?: number }[], figure: string, key: string;
    if (kind === 'rect') {
      let [a, b] = rng.pick(triplets(60));
      if (rng.chance(0.5)) do { a = rng.int(3, 15); b = rng.int(2, 12); } while (a === b);
      const [L, l] = a > b ? [a, b] : [b, a];
      const f = lengthField(m('AC ='), Math.hypot(L, l), 'cm');
      if (!f.exact) f.label = m('AC \\approx');
      title = `${m('ABCD')} est un rectangle avec ${m(`AB = ${u(L, 'cm')}`)} et ${m(`BC = ${u(l, 'cm')}`)}. Calcule la longueur de la diagonale ${m('[AC]')}${f.exact ? '' : ', arrondie au millimètre'}.`;
      steps = [{ prompt: 'Longueur de la diagonale :', answer: { kind: 'num', fields: [f] }, hint: `La diagonale coupe le rectangle en deux triangles rectangles : ${m('ABC')} est rectangle en ${m('B')}, d’hypoténuse ${m('[AC]')}.`, mistakes: mist(f.expect, [[qd(L * L + l * l), 'Ça, c’est ' + m('AC^2') + ' : prends la racine carrée.'], [mq(L + l), m(`\\sqrt{${L}^2 + ${l}^2} \\neq ${L} + ${l}`) + '.']]) }];
      lines = [`Le triangle ${m('ABC')} est rectangle en ${m('B')} (angle d’un rectangle). D’après le théorème de Pythagore :`, m(`AC^2 = AB^2 + BC^2 = ${L}^2 + ${l}^2 = ${L * L} + ${l * l} = ${L * L + l * l}`), `Donc ${m(`AC = \\sqrt{${L * L + l * l}} ${approxOr(f)} ${uf(f, 'cm')}`)}${f.exact ? '' : ' (arrondi au millimètre)'}.`];
      answer = m(`AC ${approxOr(f)} ${uf(f, 'cm')}`);
      items = [{ what: 'AC', js: `Math.hypot(${L}, ${l})`, expect: Math.hypot(L, l) }];
      figure = figSvg('rect', { a: L, b: l }, { AB: `${L} cm`, BC: `${l} cm` }, `Rectangle ABCD de ${L} cm sur ${l} cm, diagonale AC cherchée`);
      key = `rect${L},${l}`;
    } else if (kind === 'carre') {
      const c = rng.chance(0.7) ? rng.int(3, 15) : rng.int(3, 12) + 0.5;
      const f = lengthField(m('AC \\approx'), c * Math.SQRT2, 'cm');
      title = `${m('ABCD')} est un carré de côté ${m(u(c, 'cm'))}. Calcule la longueur de sa diagonale ${m('[AC]')}, arrondie au millimètre.`;
      steps = [{ prompt: 'Longueur de la diagonale :', answer: { kind: 'num', fields: [f] }, hint: `${m('ABC')} est rectangle en ${m('B')} : ${m(`AC^2 = ${dx(c)}^2 + ${dx(c)}^2`)}.`, mistakes: mist(f.expect, [[qd(2 * sq(c)), 'Ça, c’est ' + m('AC^2') + ' : prends la racine carrée.'], [qd(2 * c), m(`\\sqrt{${dx(c)}^2 + ${dx(c)}^2} \\neq ${dx(c)} + ${dx(c)}`) + '.'], [roundQ(Math.sqrt(c * c), 1), 'Il y a **deux** carrés à additionner.']]) }];
      lines = [`Le triangle ${m('ABC')} est rectangle en ${m('B')}. D’après le théorème de Pythagore :`, m(`AC^2 = ${dx(c)}^2 + ${dx(c)}^2 = ${dx(sq(c))} + ${dx(sq(c))} = ${dx(2 * sq(c))}`), `Donc ${m(`AC = \\sqrt{${dx(2 * sq(c))}} \\approx ${uf(f, 'cm')}`)} (arrondi au millimètre).`, `Remarque : la diagonale d’un carré de côté ${m('c')} mesure ${m('c\\sqrt{2}')}.`];
      answer = m(`AC \\approx ${uf(f, 'cm')}`);
      items = [{ what: 'AC', js: `${c} * Math.SQRT2`, expect: c * Math.SQRT2 }];
      figure = figSvg('carre', { a: c, b: c }, { AB: `${dt(c)} cm` }, `Carré ABCD de côté ${dt(c)} cm, diagonale AC cherchée`);
      key = `carre${c}`;
    } else if (kind === 'iso') {
      // isocèle en A : AB = AC = c, BC = 2a ; hauteur h (triplet a, h, c)
      let [p, h, c] = rng.pick(triplets(30));
      if (rng.chance(0.5)) [p, h] = [h, p];
      const f = lengthField(m('AH ='), h, 'cm');
      const A = round((2 * p * h) / 2, 6);
      title = `${m('ABC')} est isocèle en ${m('A')}, avec ${m(`AB = AC = ${u(c, 'cm')}`)} et ${m(`BC = ${u(2 * p, 'cm')}`)}. ${m('H')} est le pied de la hauteur issue de ${m('A')}.`;
      steps = [
        { prompt: `Calcule la hauteur ${m('AH')}.`, answer: { kind: 'num', fields: [f] }, hint: `Dans un triangle isocèle, la hauteur issue de ${m('A')} coupe ${m('[BC]')} en son milieu : ${m(`HC = ${p}`)}. Puis ${m('AHC')} est rectangle en ${m('H')}.`, mistakes: mist(f.expect, [[mq(Math.sqrt(c * c - 4 * p * p)), `${m('H')} est le **milieu** de ${m('[BC]')} : ${m(`HC = ${2 * p} \\div 2 = ${p}`)}.`], [mq(Math.hypot(c, p)), `${m('[AC]')} est l’hypoténuse de ${m('AHC')} : on **soustrait**.`], [qd(c * c - p * p), 'Prends la racine carrée.']]) },
        { prompt: 'Déduis-en l’aire du triangle.', answer: { kind: 'num', fields: [{ label: m('\\mathcal{A} ='), unit: 'cm²', expect: qd(A), form: 'any' }] }, hint: m('\\mathcal{A} = \\dfrac{\\text{base} \\times \\text{hauteur}}{2}'), mistakes: mist(qd(A), [[qd(2 * p * h), 'N’oublie pas de diviser par 2.']]) },
      ];
      lines = [`Dans le triangle isocèle ${m('ABC')}, la hauteur issue de ${m('A')} est aussi la médiane : ${m(`HC = ${2 * p} \\div 2 = ${p}`)}.`, `Le triangle ${m('AHC')} est rectangle en ${m('H')}. D’après le théorème de Pythagore :`, m(`AC^2 = AH^2 + HC^2`), m(`${c}^2 = AH^2 + ${p}^2`), m(`AH^2 = ${c * c} - ${p * p} = ${h * h}`), `Donc ${m(`AH = \\sqrt{${h * h}} = ${u(h, 'cm')}`)}.`, `Aire : ${m(`\\mathcal{A} = \\dfrac{${2 * p} \\times ${h}}{2} = ${u(A, 'cm^2')}`)}.`];
      answer = `${m(`AH = ${u(h, 'cm')}`)} ; aire ${m(u(A, 'cm^2'))}`;
      items = [{ what: 'AH', js: `Math.sqrt(${c}**2 - (${2 * p}/2)**2)`, expect: h }, { what: 'aire', js: `${2 * p} * Math.sqrt(${c}**2 - ${p}**2) / 2`, expect: A }];
      figure = figSvg('iso', { a: p, b: h }, { BC: `${2 * p} cm`, AC: `${c} cm` }, `Triangle ABC isocèle en A, BC = ${2 * p} cm, AB = AC = ${c} cm, hauteur AH cherchée`);
      key = `iso${p},${h}`;
    } else if (kind === 'equi') {
      const c = rng.int(3, 15);
      const hv = (c * Math.sqrt(3)) / 2;
      const f = lengthField(m('AH \\approx'), hv, 'cm');
      title = `${m('ABC')} est un triangle équilatéral de côté ${m(u(c, 'cm'))}. Calcule sa hauteur ${m('AH')}, arrondie au millimètre.`;
      steps = [{ prompt: `Hauteur ${m('AH')} :`, answer: { kind: 'num', fields: [f] }, hint: `${m('H')} est le milieu de ${m('[BC]')} : ${m(`HC = ${dx(c / 2)}`)}. ${m('AHC')} est rectangle en ${m('H')}, d’hypoténuse ${m('[AC]')}.`, mistakes: mist(f.expect, [[mq(Math.hypot(c, c / 2)), `${m('[AC]')} est l’hypoténuse : on **soustrait** les carrés.`], [qd((c * c * 3) / 4), 'Prends la racine carrée.']]) }];
      lines = [`${m('H')} est le milieu de ${m('[BC]')} : ${m(`HC = ${dx(c / 2)}`)}. Le triangle ${m('AHC')} est rectangle en ${m('H')}. D’après le théorème de Pythagore :`, m(`AH^2 = AC^2 - HC^2 = ${c}^2 - ${dx(c / 2)}^2 = ${c * c} - ${dx((c * c) / 4)} = ${dx((3 * c * c) / 4)}`), `Donc ${m(`AH = \\sqrt{${dx((3 * c * c) / 4)}} \\approx ${uf(f, 'cm')}`)} (arrondi au millimètre).`];
      answer = m(`AH \\approx ${uf(f, 'cm')}`);
      items = [{ what: 'AH', js: `Math.sqrt(${c}**2 - (${c}/2)**2)`, expect: hv }];
      figure = figSvg('equi', { a: c / 2, b: hv }, { BC: `${c} cm`, AC: `${c} cm` }, `Triangle équilatéral ABC de côté ${c} cm, hauteur AH cherchée`);
      key = `equi${c}`;
    } else {
      let [p, r] = rng.pick(triplets(30));
      if (rng.chance(0.5)) [p, r] = [r, p];
      const c = Math.hypot(p, r);
      const f = lengthField(m('AB ='), c, 'cm');
      title = `${m('ABCD')} est un losange de centre ${m('O')}, avec ${m(`AC = ${u(2 * p, 'cm')}`)} et ${m(`BD = ${u(2 * r, 'cm')}`)}.`;
      steps = [
        { prompt: `Calcule le côté ${m('AB')}.`, answer: { kind: 'num', fields: [f] }, hint: `Les diagonales d’un losange sont perpendiculaires et se coupent en leur milieu : ${m(`OA = ${p}`)}, ${m(`OB = ${r}`)}, et ${m('AOB')} est rectangle en ${m('O')}.`, mistakes: mist(f.expect, [[qd(round(Math.hypot(2 * p, 2 * r), 3)), `Les diagonales se coupent en leur **milieu** : ${m(`OA = ${2 * p} \\div 2`)}.`], [qd(c * c), 'Prends la racine carrée.']]) },
        { prompt: 'Déduis-en son périmètre.', answer: { kind: 'num', fields: [{ label: m('\\mathcal{P} ='), unit: 'cm', expect: qd(4 * c), form: 'any' }] }, hint: 'Les quatre côtés d’un losange ont la même longueur.', mistakes: mist(qd(4 * c), [[qd(2 * c), 'Un losange a **quatre** côtés égaux.']]) },
      ];
      lines = [`Les diagonales d’un losange sont perpendiculaires et se coupent en leur milieu : ${m(`OA = ${p}`)} et ${m(`OB = ${r}`)}.`, `Le triangle ${m('AOB')} est rectangle en ${m('O')}. D’après le théorème de Pythagore :`, m(`AB^2 = OA^2 + OB^2 = ${p}^2 + ${r}^2 = ${p * p + r * r}`), `Donc ${m(`AB = ${u(c, 'cm')}`)} et le périmètre vaut ${m(`4 \\times ${c} = ${u(4 * c, 'cm')}`)}.`];
      answer = `${m(`AB = ${u(c, 'cm')}`)} ; ${m(`\\mathcal{P} = ${u(4 * c, 'cm')}`)}`;
      items = [{ what: 'AB', js: `Math.hypot(${2 * p}/2, ${2 * r}/2)`, expect: c }, { what: 'périmètre', js: `4*Math.hypot(${p}, ${r})`, expect: 4 * c }];
      figure = figSvg('losange', { a: p, b: r }, { AC: `${2 * p} cm`, BD: `${2 * r} cm` }, `Losange ABCD, diagonales ${2 * p} cm et ${2 * r} cm, côté AB cherché`);
      // les étiquettes des diagonales sont des demi-longueurs sur la figure : on écrit les longueurs entières
      figure = figure.replace(`>${2 * p} cm<`, `>AC = ${2 * p} cm<`).replace(`>${2 * r} cm<`, `>BD = ${2 * r} cm<`);
      key = `los${p},${r}`;
    }
    return { title, figure, steps, solution: lines, answer, key, data: { kind: 'js', items } };
  },
};

// ===================================================================== problèmes concrets
type Prob = { title: Rich; steps: Step[]; lines: Rich[]; answer: Rich; items: { what: string; js: string; expect: number; tol?: number }[]; key: string; figure?: string };
function echelle(rng: Rng): Prob {
  // triplets décimaux réalistes (longueur d'échelle 2 à 6,5 m), ou pied quelconque avec arrondi au cm
  const tri = rng.pick([[1.5, 2, 2.5], [1.8, 2.4, 3], [2.1, 2.8, 3.5], [2.4, 3.2, 4], [1.2, 3.5, 3.7], [1.4, 4.8, 5], [2.5, 6, 6.5], [1, 2.4, 2.6], [3, 4, 5]] as [number, number, number][]);
  let d: number, L: number;
  if (rng.chance(0.35)) [d, , L] = tri;
  else {
    L = rng.pick([3, 3.5, 4, 4.5, 5, 6]);
    d = round(rng.int(Math.round(L * 3), Math.round(L * 4.5)) / 10, 1);
  }
  const h = Math.sqrt(L * L - d * d);
  const f = lengthField(m('h ' + '='), h, 'm', 2);
  if (!f.exact) f.label = m('h \\approx');
  const steps: Step[] = [{ prompt: `À quelle hauteur arrive le haut de l’échelle${f.exact ? '' : ' (arrondie au centimètre)'} ?`, answer: { kind: 'num', fields: [f] }, hint: 'Le mur, le sol et l’échelle forment un triangle rectangle ; l’échelle est l’hypoténuse.', mistakes: mist(f.expect, [[f.exact ? qd(round(Math.hypot(L, d), 3)) : roundQ(Math.hypot(L, d), 2), 'L’échelle est l’hypoténuse : on **soustrait** les carrés.'], [qd(round(L * L - d * d, 6)), 'Prends la racine carrée.']]) }];
  const figure = rightTriangleSvg({ R: 'S', P: 'P', Q: 'H', lp: d, lq: h, rot: 0, flip: false, labels: { RP: `${dt(d)} m`, PQ: `${dt(L)} m`, RQ: '?' }, ask: 'RQ', aria: `Échelle de ${dt(L)} m posée à ${dt(d)} m du mur` });
  return {
    title: `Une échelle de ${m(u(L, 'm'))} est appuyée contre un mur vertical. Son pied est à ${m(u(d, 'm'))} du mur (sol horizontal).`,
    figure,
    steps,
    lines: ['Le mur est perpendiculaire au sol : le triangle formé est rectangle au pied du mur, et l’échelle est l’hypoténuse. D’après le théorème de Pythagore :', m(`h^2 = ${dx(L)}^2 - ${dx(d)}^2 = ${dx(sq(L))} - ${dx(sq(d))} = ${dx(round(L * L - d * d, 6))}`), `Donc ${m(`h ${approxOr(f)} ${uf(f, 'm')}`)}${f.exact ? '' : ' (arrondi au centimètre)'}.`],
    answer: m(`h ${approxOr(f)} ${uf(f, 'm')}`),
    items: [{ what: 'hauteur', js: `Math.sqrt(${L}**2 - ${d}**2)`, expect: h }],
    key: `ech${L},${d}`,
  };
}
function bateau(rng: Rng): Prob {
  let [a, b, c] = rng.pick(triplets(30).filter((t) => t[2] >= 10));
  if (rng.chance(0.5)) do { a = rng.int(4, 20); b = rng.int(3, 18); c = Math.hypot(a, b); } while (a === b);
  const [N, E] = rng.chance(0.5) ? [a, b] : [b, a];
  const f = lengthField(m('PA ='), c, 'km');
  if (!f.exact) f.label = m('PA \\approx');
  const figure = rightTriangleSvg({ R: 'T', P: 'A', Q: 'P', lp: E, lq: N, rot: 0, flip: true, labels: { RP: `${E} km`, RQ: `${N} km`, PQ: '?' }, ask: 'PQ', aria: `Trajet : ${N} km vers le nord puis ${E} km vers l’est` });
  return {
    title: `Un bateau part du port ${m('P')}, parcourt ${m(u(N, 'km'))} vers le nord jusqu’en ${m('T')}, puis ${m(u(E, 'km'))} vers l’est jusqu’en ${m('A')}.`,
    figure,
    steps: [{ prompt: `À quelle distance (à vol d’oiseau) du port se trouve-t-il${f.exact ? '' : ' (arrondie au dixième de km)'} ?`, answer: { kind: 'num', fields: [f] }, hint: 'Nord et est sont perpendiculaires : le triangle est rectangle au point où le bateau a tourné.', mistakes: mist(f.expect, [[mq(N + E), 'C’est la distance **parcourue**, pas la distance au port (en ligne droite).'], [qd(N * N + E * E), 'Prends la racine carrée.']]) }],
    lines: [`Les directions nord et est sont perpendiculaires : le triangle ${m('PTA')} est rectangle en ${m('T')}. D’après le théorème de Pythagore :`, m(`PA^2 = ${N}^2 + ${E}^2 = ${N * N} + ${E * E} = ${N * N + E * E}`), `Donc ${m(`PA ${f.exact ? '=' : `= \\sqrt{${N * N + E * E}} \\approx`} ${uf(f, 'km')}`)}. (Il a parcouru ${m(u(N + E, 'km'))}, mais n’est qu’à ${f.exact ? '' : 'environ '}${m(uf(f, 'km'))} du port.)`],
    answer: m(`PA ${approxOr(f)} ${uf(f, 'km')}`),
    items: [{ what: 'distance', js: `Math.hypot(${N}, ${E})`, expect: c }],
    key: `bat${N},${E}`,
  };
}
function poteau(rng: Rng): Prob {
  const k = rng.pick([0.5, 1, 1.5, 2]);
  const [a, b, c] = rng.pick(triplets(17)).map((x) => round(x * k, 3)) as [number, number, number];
  if (c > 26 || c < 4) return poteau(rng);
  const [H, D] = rng.chance(0.7) ? (a > b ? [a, b] : [b, a]) : [a, b];
  const n = rng.int(2, 4);
  const L = round(n * c, 3);
  const steps: Step[] = [
    { prompt: 'Longueur d’un câble :', answer: { kind: 'num', fields: [{ label: m('\\ell ='), unit: 'm', expect: qd(c), form: 'any' }] }, hint: 'Le poteau est vertical, le sol horizontal : le câble est l’hypoténuse.', mistakes: mist(qd(c), [[qd(round(H + D, 3)), m(`\\sqrt{${dx(H)}^2 + ${dx(D)}^2} \\neq ${dx(H)} + ${dx(D)}`) + '.'], [qd(sq(c)), 'Prends la racine carrée.']]) },
    { prompt: `Longueur totale de câble pour les ${n} câbles :`, answer: { kind: 'num', fields: [{ label: 'Total :', unit: 'm', expect: qd(L), form: 'any' }] }, hint: `On multiplie par ${n}.`, mistakes: [] },
  ];
  return {
    title: `Un poteau vertical de ${m(u(H, 'm'))} est maintenu par ${n} câbles tendus, chacun du sommet du poteau jusqu’à un piquet planté à ${m(u(D, 'm'))} du pied du poteau.`,
    figure: rightTriangleSvg({ R: 'P', P: 'Q', Q: 'S', lp: D, lq: H, rot: 0, flip: false, labels: { RP: `${dt(D)} m`, RQ: `${dt(H)} m`, PQ: '?' }, ask: 'PQ', aria: `Poteau de ${dt(H)} m, piquet à ${dt(D)} m` }),
    steps,
    lines: ['Le triangle formé par le poteau, le sol et un câble est rectangle au pied du poteau. D’après le théorème de Pythagore :', m(`\\ell^2 = ${dx(H)}^2 + ${dx(D)}^2 = ${dx(sq(H))} + ${dx(sq(D))} = ${dx(sq(c))}`), `Donc ${m(`\\ell = ${u(c, 'm')}`)}, et pour ${n} câbles : ${m(`${n} \\times ${dx(c)} = ${u(L, 'm')}`)}.`],
    answer: `${m(u(c, 'm'))} par câble ; ${m(u(L, 'm'))} au total`,
    items: [{ what: 'câble', js: `Math.hypot(${H}, ${D})`, expect: c }, { what: 'total', js: `${n} * Math.hypot(${H}, ${D})`, expect: L }],
    key: `pot${H},${D},${n}`,
  };
}
function cerfVolant(rng: Rng): Prob {
  const [a, b, c] = rng.pick(triplets(60).filter((t) => t[2] >= 20));
  const [h, d] = rng.chance(0.5) ? [a, b] : [b, a];
  const main = rng.pick([1, 1.2, 1.5]);
  const H = round(h + main, 3);
  const steps: Step[] = [
    { prompt: 'Hauteur du cerf-volant au-dessus de la main :', answer: { kind: 'num', fields: [{ label: m('h ='), unit: 'm', expect: qd(h), form: 'any' }] }, hint: 'Le fil est l’hypoténuse du triangle rectangle.', mistakes: mist(qd(h), [[qd(round(Math.hypot(c, d), 3)), 'Le fil est l’hypoténuse : on **soustrait** les carrés.'], [qd(h * h), 'Prends la racine carrée.']]) },
    { prompt: 'Hauteur du cerf-volant au-dessus du sol :', answer: { kind: 'num', fields: [{ label: m('H ='), unit: 'm', expect: qd(H), form: 'any' }] }, hint: `La main est à ${m(u(main, 'm'))} du sol.`, mistakes: mist(qd(H), [[qd(h), `N’oublie pas les ${m(u(main, 'm'))} entre le sol et la main.`]]) },
  ];
  return {
    title: `Le fil (tendu, rectiligne) d’un cerf-volant mesure ${m(u(c, 'm'))}. Le cerf-volant est à la verticale d’un point situé à ${m(u(d, 'm'))} de la personne, qui tient le fil à ${m(u(main, 'm'))} du sol.`,
    steps,
    lines: ['Entre la main, le cerf-volant et le point à la même hauteur que la main à sa verticale, le triangle est rectangle. D’après le théorème de Pythagore :', m(`h^2 = ${c}^2 - ${d}^2 = ${c * c} - ${d * d} = ${h * h}`), `Donc ${m(`h = ${u(h, 'm')}`)}, et au-dessus du sol : ${m(`${h} + ${dx(main)} = ${u(H, 'm')}`)}.`],
    answer: m(`H = ${u(H, 'm')}`),
    items: [{ what: 'h', js: `Math.sqrt(${c}**2 - ${d}**2)`, expect: h }, { what: 'H', js: `Math.sqrt(${c}**2 - ${d}**2) + ${main}`, expect: H }],
    key: `cv${c},${d},${main}`,
  };
}
function terrain(rng: Rng): Prob {
  const [a, b, c] = rng.pick(PRIMITIVE.slice(0, 5));
  const k = rng.pick([4, 5, 6, 8, 10, 12, 15, 20]);
  const [L, l, D] = [Math.max(a, b) * k, Math.min(a, b) * k, c * k];
  const g = L + l - D;
  return {
    title: `Un terrain rectangulaire mesure ${m(u(L, 'm'))} sur ${m(u(l, 'm'))}. Pour aller d’un coin au coin opposé, on peut longer deux côtés ou traverser en diagonale.`,
    figure: figSvg('rect', { a: L, b: l }, { AB: `${L} m`, BC: `${l} m` }, `Terrain de ${L} m sur ${l} m, diagonale`),
    steps: [
      { prompt: 'Longueur de la diagonale :', answer: { kind: 'num', fields: [{ label: m('d ='), unit: 'm', expect: qd(D), form: 'any' }] }, hint: 'Un angle du rectangle est droit : la diagonale est une hypoténuse.', mistakes: mist(qd(D), [[qd(D * D), 'Prends la racine carrée.']]) },
      { prompt: 'Combien de mètres gagne-t-on en traversant ?', answer: { kind: 'num', fields: [{ label: 'Gain :', unit: 'm', expect: qd(g), form: 'any' }] }, hint: `En longeant : ${m(`${L} + ${l}`)} m.`, mistakes: mist(qd(g), [[qd(L + l), 'Ça, c’est le trajet en longeant. On veut la **différence**.']]) },
    ],
    lines: ['Le terrain est rectangulaire : la diagonale est l’hypoténuse d’un triangle rectangle. D’après le théorème de Pythagore :', m(`d^2 = ${L}^2 + ${l}^2 = ${L * L} + ${l * l} = ${D * D}`), `Donc ${m(`d = ${u(D, 'm')}`)}. En longeant : ${m(`${L} + ${l} = ${u(L + l, 'm')}`)}. Gain : ${m(`${L + l} - ${D} = ${u(g, 'm')}`)}.`],
    answer: `${m(u(g, 'm'))} de gagnés`,
    items: [{ what: 'diagonale', js: `Math.hypot(${L}, ${l})`, expect: D }, { what: 'gain', js: `${L} + ${l} - Math.hypot(${L}, ${l})`, expect: g }],
    key: `ter${L},${l}`,
  };
}
function ecran(rng: Rng): Prob {
  // format 16/9 : largeur 16k, hauteur 9k (cm), diagonale arrondie au cm, puis en pouces à l'unité
  // on évite les tailles en pouces proches d'une demi-unité : arrondir la diagonale avant ou après la conversion
  // donne alors le même nombre de pouces (pas d'ambiguïté d'arrondi)
  let Lw: number, Hh: number;
  do {
    Lw = rng.int(56, 144);
    Hh = round((Lw * 9) / 16, 1);
    const v = Math.hypot(Lw, Hh) / 2.54;
    if (Math.abs(v - Math.floor(v) - 0.5) > 0.25) break;
  } while (true);
  const D = Math.hypot(Lw, Hh);
  const fD: NumField = { label: m('d \\approx'), unit: 'cm', expect: roundQ(D, 0), form: 'any', approx: { value: D, tol: 0.5, dp: 0 } };
  const inch = D / 2.54;
  const fI: NumField = { label: m('d \\approx'), unit: 'pouces', expect: roundQ(inch, 0), form: 'any', approx: { value: inch, tol: 0.5, dp: 0 } };
  return {
    title: `Un écran plat mesure ${m(u(Lw, 'cm'))} de large et ${m(u(Hh, 'cm'))} de haut. La taille d’un écran est la longueur de sa diagonale, en pouces (${m('1 \\text{ pouce} = 2{,}54\\,\\text{cm}')}).`,
    figure: figSvg('rect', { a: Lw, b: Hh }, { AB: `${dt(Lw)} cm`, BC: `${dt(Hh)} cm` }, `Écran de ${dt(Lw)} cm sur ${dt(Hh)} cm`),
    steps: [
      { prompt: 'Diagonale, arrondie au centimètre :', answer: { kind: 'num', fields: [fD] }, hint: 'Largeur, hauteur et diagonale forment un triangle rectangle.', mistakes: mist(fD.expect, [[qd(round(Lw + Hh, 1)), 'La racine d’une somme n’est pas la somme des racines.']]) },
      { prompt: 'Taille de l’écran, en pouces (arrondie à l’unité) :', answer: { kind: 'num', fields: [fI] }, hint: 'On divise la diagonale (en cm) par 2,54.', mistakes: mist(fI.expect, [[roundQ(D * 2.54, 0), 'Pour passer des cm aux pouces, on **divise** par 2,54.']]) },
    ],
    lines: ['Le triangle formé par la largeur, la hauteur et la diagonale est rectangle. D’après le théorème de Pythagore :', m(`d^2 = ${dx(Lw)}^2 + ${dx(Hh)}^2 = ${dx(sq(Lw))} + ${dx(sq(Hh))} = ${dx(round(Lw * Lw + Hh * Hh, 4))}`), `Donc ${m(`d \\approx ${dx(round(D, 2))}\\,\\text{cm}`)}, soit environ ${m(`${dx(round(D, 0))}\\,\\text{cm}`)}.`, `En pouces : ${m(`${dx(round(D, 2))} \\div 2{,}54 \\approx ${dx(round(inch, 0))}`)} pouces.`],
    answer: `${m(`${dx(round(D, 0))}\\,\\text{cm}`)}, soit ${m(dx(round(inch, 0)))} pouces`,
    items: [{ what: 'diagonale', js: `Math.hypot(${Lw}, ${Hh})`, expect: D }, { what: 'pouces', js: `Math.hypot(${Lw}, ${Hh}) / 2.54`, expect: inch }],
    key: `ecr${Lw}`,
  };
}
export const probleme: Generator = {
  id: 'probleme',
  title: 'Problèmes concrets',
  desc: 'Échelle, bateau, câbles, cerf-volant, terrain, écran.',
  stars: 2,
  levels: [2, 3],
  example: '\\text{échelle de } 2{,}5\\,\\text{m}',
  course: LINKS.s53,
  generate(rng: Rng, level: Level) {
    const p = level === 2 ? rng.weighted([[echelle, 1.3], [bateau, 1], [poteau, 1]] as const)(rng) : rng.weighted([[cerfVolant, 1], [terrain, 1], [ecran, 1], [echelle, 0.6]] as const)(rng);
    return { title: p.title, figure: p.figure, steps: p.steps, solution: [...p.lines, 'Contrôle : l’hypoténuse est bien plus longue que chacun des deux autres côtés.'], answer: p.answer, key: p.key, data: { kind: 'js', items: p.items } };
  },
};

// ===================================================================== distance dans un repère
export const repere: Generator = {
  id: 'repere',
  title: 'Distance dans un repère',
  desc: 'Écarts horizontal et vertical, puis Pythagore.',
  stars: 3,
  levels: [3],
  example: 'A(1\\,;\\,2),\\ B(5\\,;\\,5)',
  course: LINKS.s55,
  generate(rng: Rng) {
    let ax: number, ay: number, bx: number, by: number;
    do {
      ax = rng.int(-5, 5); ay = rng.int(-4, 4); bx = rng.int(-5, 5); by = rng.int(-4, 4);
    } while (ax === bx || ay === by || Math.abs(ax - bx) + Math.abs(ay - by) < 4);
    const dxv = Math.abs(bx - ax), dyv = Math.abs(by - ay);
    const D = Math.hypot(dxv, dyv);
    const f = lengthField(m('AB ='), D, '', 1);
    if (!f.exact) f.label = m('AB \\approx');
    f.unit = undefined;
    const C = `C(${bx}\\,;\\,${ay})`;
    const p = (x: number) => (x < 0 ? `(${x})` : String(x));
    // figure : quadrillage, 1 unité = 22 px
    const S = 22, X0 = 6 * S + 10, Y0 = 5 * S + 10, W = 12 * S + 20, H = 10 * S + 20;
    const P = (x: number, y: number): Pt => [X0 + x * S, Y0 - y * S];
    let g = '';
    for (let x = -6; x <= 6; x++) g += line(P(x, -5), P(x, 5), 'gf-grid');
    for (let y = -5; y <= 5; y++) g += line(P(-6, y), P(6, y), 'gf-grid');
    g += line(P(-6, 0), P(6, 0), 'gf-axis') + line(P(0, -5), P(0, 5), 'gf-axis') + text([X0 - 8, Y0 + 15], '0', 'gf-ts') + text([P(1, 0)[0], Y0 + 15], '1', 'gf-ts') + text([X0 - 9, P(0, 1)[1] + 4], '1', 'gf-ts');
    g += line(P(ax, ay), P(bx, ay), 'gf-dash') + line(P(bx, ay), P(bx, by), 'gf-dash') + line(P(ax, ay), P(bx, by), 'gf-hl');
    g += dot(P(ax, ay)) + dot(P(bx, by)) + text([P(ax, ay)[0] + (ax < bx ? -10 : 10), P(ax, ay)[1] + (ay < by ? 16 : -8)], 'A', 'gf-tb') + text([P(bx, by)[0] + (bx < ax ? -10 : 10), P(bx, by)[1] + (by < ay ? 16 : -8)], 'B', 'gf-tb') + text([P(bx, ay)[0] + (bx < ax ? -10 : 10), P(bx, ay)[1] + (by > ay ? 16 : -8)], 'C', 'gf-t');
    const figure = svgWrap(W, H, `Repère orthonormé : A(${ax} ; ${ay}), B(${bx} ; ${by}), C(${bx} ; ${ay})`, g);
    const steps: Step[] = [
      { prompt: `Écart horizontal ${m('AC')} et écart vertical ${m('CB')} (en unités) :`, answer: { kind: 'num', fields: [{ label: m('AC ='), expect: qd(dxv), form: 'any' }, { label: m('CB ='), expect: qd(dyv), form: 'any' }] }, hint: `Différence des abscisses, puis des ordonnées (une longueur est positive).`, mistakes: (Math.abs(bx + ax) === dxv && Math.abs(by + ay) === dyv ? [] : [{ on: 'numAll', values: [qd(Math.abs(bx + ax)), qd(Math.abs(by + ay))], msg: 'Fais la **différence** des coordonnées, pas la somme.' }]) },
      { prompt: `Déduis-en ${m('AB')}${f.exact ? '' : ', arrondie au dixième'}.`, answer: { kind: 'num', fields: [f] }, hint: `${m('ACB')} est rectangle en ${m('C')} : ${m(`AB^2 = AC^2 + CB^2`)}.`, mistakes: mist(f.expect, [[qd(dxv + dyv), m(`\\sqrt{${dxv}^2 + ${dyv}^2} \\neq ${dxv} + ${dyv}`) + '.'], [qd(dxv * dxv + dyv * dyv), 'Ça, c’est ' + m('AB^2') + ' : prends la racine carrée.']]) },
    ];
    return {
      title: `Dans un repère orthonormé, ${m(`A(${ax}\\,;\\,${ay})`)} et ${m(`B(${bx}\\,;\\,${by})`)}. On note ${m(C)}. Calcule la distance ${m('AB')}.`,
      figure,
      steps,
      solution: [`Écart horizontal : ${m(`AC = |${bx} - ${p(ax)}| = ${dxv}`)} ; écart vertical : ${m(`CB = |${by} - ${p(ay)}| = ${dyv}`)}.`, `Le triangle ${m('ACB')} est rectangle en ${m('C')}. D’après le théorème de Pythagore :`, m(`AB^2 = ${dxv}^2 + ${dyv}^2 = ${dxv * dxv} + ${dyv * dyv} = ${dxv * dxv + dyv * dyv}`), f.exact ? `Donc ${m(`AB = ${dx(D)}`)} unités.` : `Donc ${m(`AB = \\sqrt{${dxv * dxv + dyv * dyv}} \\approx ${lenTex(f)}`)} unités.`],
      answer: m(`AB ${approxOr(f)} ${lenTex(f)}`),
      key: `${ax},${ay},${bx},${by}`,
      data: { kind: 'js', items: [{ what: 'AB', js: `Math.hypot(${bx} - (${ax}), ${by} - (${ay}))`, expect: D }, { what: 'AC', js: `Math.abs(${bx} - (${ax}))`, expect: dxv }, { what: 'CB', js: `Math.abs(${by} - (${ay}))`, expect: dyv }] },
    };
  },
};

// ===================================================================== Pythagore deux fois
const BOXES: [number, number, number][] = [[2, 3, 6], [6, 3, 2], [1, 2, 2], [2, 4, 4], [4, 4, 7], [2, 6, 9], [6, 6, 7], [3, 4, 12], [4, 3, 12], [2, 10, 11], [12, 4, 3], [6, 2, 9], [8, 4, 1], [4, 8, 8]];
function boxSvg(a: number, b: number, c: number): string {
  // perspective cavalière : AB horizontal (échelle 1), BC fuyante (45°, coefficient 0,5), CG vertical
  const k = 0.5, cs = Math.SQRT1_2;
  const P3 = (x: number, y: number, z: number): Pt => [x + y * k * cs, z + y * k * cs];
  const A = P3(0, 0, 0), B = P3(a, 0, 0), C = P3(a, b, 0), D = P3(0, b, 0);
  const E = P3(0, 0, c), F = P3(a, 0, c), G = P3(a, b, c), Hh = P3(0, b, c);
  const { pts } = fit([A, B, C, D, E, F, G, Hh], 340, 230, 30, 0);
  const [pA, pB, pC, pD, pE, pF, pG, pH] = pts;
  let s = line(pA, pB) + line(pB, pF) + line(pF, pE) + line(pE, pA) + line(pB, pC) + line(pC, pG) + line(pG, pF) + line(pE, pH) + line(pH, pG);
  s += line(pA, pD, 'gf-dash') + line(pD, pC, 'gf-dash') + line(pD, pH, 'gf-dash') + line(pA, pC, 'gf-dash') + line(pA, pG, 'gf-hl');
  const g = centroid(pts);
  s += ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((n, i) => vertexLabel(pts[i], g, n, 13)).join('');
  s += sideLabel(pA, pB, g, `${a} cm`, 'gf-ts', 14) + sideLabel(pB, pC, [g[0] - 200, g[1]], `${b} cm`, 'gf-ts', 14) + sideLabel(pC, pG, [g[0] - 200, g[1]], `${c} cm`, 'gf-ts', 16);
  return svgWrap(340, 230, `Pavé droit ABCDEFGH : AB = ${a} cm, BC = ${b} cm, CG = ${c} cm, diagonale AG`, s);
}
export const deuxFois: Generator = {
  id: 'deux-fois',
  title: 'Pythagore deux fois',
  desc: 'Diagonale d’un pavé droit, quadrilatère à deux angles droits.',
  stars: 3,
  levels: [3],
  example: 'AG^2 = AC^2 + CG^2',
  course: LINKS.s54,
  generate(rng: Rng) {
    if (rng.chance(0.55)) {
      const k = rng.pick([1, 1, 2]);
      let [a, b, c] = rng.pick(BOXES).map((x) => x * k) as [number, number, number];
      if (Math.max(a, b, c) > 16) [a, b, c] = [a / k, b / k, c / k];
      if (rng.chance(0.6)) { a = rng.int(3, 12); b = rng.int(2, 10); c = rng.int(2, 10); }
      const AC2 = a * a + b * b, AG = Math.sqrt(AC2 + c * c);
      const f = lengthField(m('AG ='), AG, 'cm', 1);
      if (!f.exact) f.label = m('AG \\approx');
      return {
        title: `${m('ABCDEFGH')} est un pavé droit avec ${m(`AB = ${u(a, 'cm')}`)}, ${m(`BC = ${u(b, 'cm')}`)} et ${m(`CG = ${u(c, 'cm')}`)}. Calcule la grande diagonale ${m('AG')}.`,
        figure: boxSvg(a, b, c),
        steps: [
          { prompt: `Dans la base ${m('ABCD')} : calcule ${m('AC^2')}.`, answer: { kind: 'num', fields: [{ label: m('AC^2 ='), expect: qd(AC2), form: 'any' }] }, hint: `${m('ABC')} est rectangle en ${m('B')}.`, mistakes: mist(qd(AC2), [[mq(Math.sqrt(AC2)), 'Garde ' + m('AC^2') + ' : on n’a pas besoin de la racine pour la suite.']]) },
          { prompt: `Déduis-en ${m('AG')}${f.exact ? '' : ', arrondie au millimètre'}.`, answer: { kind: 'num', fields: [f] }, hint: `${m('[CG]')} est une arête verticale, perpendiculaire à la base : ${m('ACG')} est rectangle en ${m('C')}, et ${m(`AG^2 = AC^2 + CG^2`)}.`, mistakes: mist(f.expect, [[qd(AC2 + c * c), 'Ça, c’est ' + m('AG^2') + ' : prends la racine carrée.'], [mq(Math.sqrt(AC2) + c), m('\\sqrt{AC^2 + CG^2} \\neq AC + CG') + '.']]) },
        ],
        solution: [`Le triangle ${m('ABC')} est rectangle en ${m('B')}. D’après le théorème de Pythagore : ${m(`AC^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${AC2}`)}.`, `L’arête ${m('[CG]')} est perpendiculaire à la base, donc le triangle ${m('ACG')} est rectangle en ${m('C')}. D’après le théorème de Pythagore :`, m(`AG^2 = AC^2 + CG^2 = ${AC2} + ${c * c} = ${AC2 + c * c}`), f.exact ? `Donc ${m(`AG = \\sqrt{${AC2 + c * c}} = ${u(AG, 'cm')}`)}.` : `Donc ${m(`AG = \\sqrt{${AC2 + c * c}} \\approx ${uf(f, 'cm')}`)} (arrondi au millimètre).`, 'Astuce : on n’a jamais eu besoin de calculer ' + m('AC') + ' lui-même — on garde ' + m('AC^2') + ' pour éviter un arrondi intermédiaire.'],
        answer: m(`AG ${approxOr(f)} ${uf(f, 'cm')}`),
        key: `pave${a},${b},${c}`,
        data: { kind: 'js', items: [{ what: 'AC²', js: `${a}**2 + ${b}**2`, expect: AC2 }, { what: 'AG', js: `Math.hypot(${a}, ${b}, ${c})`, expect: AG }] },
      };
    }
    // quadrilatère ABCD : ABC rectangle en B (triplet), ACD rectangle en C
    const [a, b, c] = rng.pick(triplets(30));
    const d = rng.int(2, 12);
    const AD = Math.hypot(c, d);
    const f = lengthField(m('AD ='), AD, 'cm', 1);
    if (!f.exact) f.label = m('AD \\approx');
    // figure à l'échelle : B en (0,0), A en (0,a), C en (b,0) ; D tel que CD ⟂ AC, du côté opposé à B
    const B: Pt = [0, 0], A: Pt = [0, a], C: Pt = [b, 0];
    const ux = (A[0] - C[0]) / c, uy = (A[1] - C[1]) / c; // direction CA
    let nx = -uy, ny = ux; // perpendiculaire
    if (nx * (B[0] - C[0]) + ny * (B[1] - C[1]) > 0) { nx = -nx; ny = -ny; }
    const D: Pt = [C[0] + nx * d, C[1] + ny * d];
    const base: Pt[] = [A, B, C, D];
    const { pts } = fit(base, 340, 230, 32, 0);
    const [pA, pB, pC, pD] = pts;
    const gc = centroid(pts);
    let s = poly(pts) + line(pA, pC, 'gf-dash') + rightMark(pB, pA, pC, 10) + rightMark(pC, pA, pD, 10);
    s += ['A', 'B', 'C', 'D'].map((n, i) => vertexLabel(pts[i], gc, n)).join('');
    s += sideLabel(pA, pB, gc, `${a} cm`, 'gf-ts') + sideLabel(pB, pC, gc, `${b} cm`, 'gf-ts') + sideLabel(pC, pD, gc, `${d} cm`, 'gf-ts') + sideLabel(pA, pD, gc, '?', 'gf-tq');
    const figure = svgWrap(340, 230, `Quadrilatère ABCD : AB = ${a} cm, BC = ${b} cm, CD = ${d} cm, angles droits en B et en C (triangle ACD)`, s);
    return {
      title: `Sur la figure, ${m('ABC')} est rectangle en ${m('B')} et ${m('ACD')} est rectangle en ${m('C')}, avec ${m(`AB = ${u(a, 'cm')}`)}, ${m(`BC = ${u(b, 'cm')}`)} et ${m(`CD = ${u(d, 'cm')}`)}. Calcule ${m('AD')}.`,
      figure,
      steps: [
        { prompt: `Calcule d’abord ${m('AC')}.`, answer: { kind: 'num', fields: [{ label: m('AC ='), unit: 'cm', expect: qd(c), form: 'any' }] }, hint: `${m('ABC')} est rectangle en ${m('B')}, d’hypoténuse ${m('[AC]')}.`, mistakes: mist(qd(c), [[qd(c * c), 'Prends la racine carrée.']]) },
        { prompt: `Déduis-en ${m('AD')}${f.exact ? '' : ', arrondie au millimètre'}.`, answer: { kind: 'num', fields: [f] }, hint: `${m('ACD')} est rectangle en ${m('C')}, d’hypoténuse ${m('[AD]')}.`, mistakes: mist(f.expect, [[qd(c * c + d * d), 'Prends la racine carrée.'], [f.exact ? qd(c + d) : roundQ(c + d, 1), m('\\sqrt{AC^2 + CD^2} \\neq AC + CD') + '.']]) },
      ],
      solution: [`Dans ${m('ABC')} rectangle en ${m('B')} : ${m(`AC^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`)}, donc ${m(`AC = ${u(c, 'cm')}`)}.`, `Dans ${m('ACD')} rectangle en ${m('C')} : ${m(`AD^2 = AC^2 + CD^2 = ${c * c} + ${d * d} = ${c * c + d * d}`)}.`, f.exact ? `Donc ${m(`AD = ${u(AD, 'cm')}`)}.` : `Donc ${m(`AD = \\sqrt{${c * c + d * d}} \\approx ${uf(f, 'cm')}`)} (arrondi au millimètre).`],
      answer: m(`AD ${approxOr(f)} ${uf(f, 'cm')}`),
      key: `quad${a},${b},${d}`,
      data: { kind: 'js', items: [{ what: 'AC', js: `Math.hypot(${a}, ${b})`, expect: c }, { what: 'AD', js: `Math.hypot(Math.hypot(${a}, ${b}), ${d})`, expect: AD }] },
    };
  },
};
void ROTS;
