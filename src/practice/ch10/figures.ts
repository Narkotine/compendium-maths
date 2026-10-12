/** Chapitre 10 : reconnaître une transformation sur quadrillage, image d'un point dans un repère. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { fixedChoice, shuffledChoice } from '../engine/build';
import type { Pt } from '../engine/svg';
import { LINKS, m, step, corr, numF, q, SHAPES, gridSvg, cellQuad, gLine, gDot, repereSvg, type Item, type Cell } from './common';

type Kind = 0 | 1 | 2 | 3 | 4; // axiale, centrale, translation, rotation, homothétie
const KINDS = ['Symétrie axiale', 'Symétrie centrale', 'Translation', 'Rotation (quart de tour)', 'Homothétie'];
const WHY = [
  'Une symétrie axiale RETOURNE la figure (comme dans un miroir).',
  'Une symétrie centrale fait un demi-tour : la figure est « tête en bas », côtés parallèles.',
  'Une translation fait seulement glisser : même orientation.',
  'Un quart de tour : ce qui était vertical devient horizontal.',
  'Une homothétie change la taille.',
];
interface Tr { kind: Kind; f: (p: Pt) => Pt; desc: Rich; data: number[] }
function makeTr(rng: Rng, kind: Kind, cols: number, rows: number): Tr {
  if (kind === 0) { if (rng.chance(0.5)) { const a = rng.int(4, cols - 4); return { kind, f: ([x, y]) => [2 * a - x, y], desc: `l’axe vertical`, data: [0, a] }; } const b = rng.int(3, rows - 3); return { kind, f: ([x, y]) => [x, 2 * b - y], desc: 'l’axe horizontal', data: [1, b] }; }
  if (kind === 1) { const a = rng.int(10, 2 * cols - 10) / 2, b = rng.int(6, 2 * rows - 6) / 2; return { kind, f: ([x, y]) => [2 * a - x, 2 * b - y], desc: 'le centre', data: [a, b] }; }
  if (kind === 2) { let dx: number, dy: number; do { dx = rng.int(-9, 9); dy = rng.int(-5, 5); } while (Math.abs(dx) + Math.abs(dy) < 4); return { kind, f: ([x, y]) => [x + dx, y + dy], desc: 'le déplacement', data: [dx, dy] }; }
  if (kind === 3) { const a = rng.int(4, cols - 4), b = rng.int(3, rows - 3), cw = rng.chance(0.5); return { kind, f: ([x, y]) => (cw ? [a + (y - b), b - (x - a)] : [a - (y - b), b + (x - a)]), desc: cw ? 'horaire' : 'anti', data: [a, b, cw ? 1 : 0] }; }
  const a = rng.int(1, cols - 1), b = rng.int(1, rows - 1), k = rng.pick([2, 2, 3, 0.5]);
  return { kind, f: ([x, y]) => [a + k * (x - a), b + k * (y - b)], desc: 'homothétie', data: [a, b, k] };
}
const bbox = (ps: Pt[]) => [Math.min(...ps.map((p) => p[0])), Math.min(...ps.map((p) => p[1])), Math.max(...ps.map((p) => p[0])), Math.max(...ps.map((p) => p[1]))];
function place(rng: Rng, kind: Kind, cols: number, rows: number) {
  for (let t = 0; t < 500; t++) {
    let sh = rng.pick(SHAPES);
    if (kind === 4) sh = sh.filter((_, i) => i < 5);
    const tr = makeTr(rng, kind, cols, rows);
    if (kind === 4 && tr.data[2] === 0.5) sh = sh.map(([x, y]) => [2 * x, 2 * y] as Cell).flatMap(([x, y]) => [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]] as Cell[]); // figure assez grande pour être réduite
    const x0 = rng.int(0, cols - 2), y0 = rng.int(0, rows - 2);
    const cells = sh.map(([x, y]) => [x + x0, y + y0] as Cell), q0 = cells.map(cellQuad), q1 = q0.map((qd) => qd.map(tr.f));
    const b0 = bbox(q0.flat()), b1 = bbox(q1.flat());
    if (b0[0] < 0 || b0[1] < 0 || b0[2] > cols || b0[3] > rows || b1[0] < 0 || b1[1] < 0 || b1[2] > cols || b1[3] > rows) continue;
    if (!(b0[2] <= b1[0] || b1[2] <= b0[0] || b0[3] <= b1[1] || b1[3] <= b0[1])) continue; // figures séparées
    if (kind === 4 && tr.data[2] !== 0.5 && !q0.flat().every((p) => Number.isInteger(tr.f(p)[0]))) continue;
    return { tr, q0, q1, key: `${sh.length}|${x0},${y0}|${tr.data.join(',')}` };
  }
  return null;
}

export const reconnaitre: Generator = {
  id: 'reconnaitre', title: 'Reconnaître une transformation', stars: 1, levels: [1, 2], course: LINKS.s71, links: [LINKS.s2, LINKS.s3, LINKS.s4, LINKS.s5, LINKS.s6],
  desc: 'Sur quadrillage : retournée, tournée, glissée ou agrandie ? ★★ : trouver l’axe, le centre, le sens ou le déplacement.',
  example: '\\text{retournée, même taille} \\Rightarrow \\text{symétrie axiale}',
  generate(rng: Rng, level: Level) {
    const cols = 16, rows = 11, kind = (level === 1 ? rng.int(0, 4) : rng.int(0, 3)) as Kind;
    const pl = place(rng, kind, cols, rows);
    if (!pl) return reconnaitre.generate(rng, level);
    const { tr, q0, q1 } = pl, items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    let extra = '';
    if (level === 1) {
      steps.push({ prompt: 'a) Quelle transformation envoie la figure 0 sur la figure 1 ?', answer: fixedChoice(KINDS, kind, WHY, 2), hint: 'Retournée ? Tournée ? Simplement glissée ? Plus grande ou plus petite ?' });
      items.push({ what: 'step:0', js: String(kind), expect: kind });
      const keep = kind === 4 ? 1 : 0;
      steps.push({ prompt: 'b) Les longueurs sont-elles conservées ?', answer: fixedChoice(['Oui', 'Non'], keep, ['Une homothétie de rapport différent de ±1 multiplie les longueurs.', 'Symétries, translation et rotation conservent les longueurs.']), hint: 'Compare la longueur d’un même côté sur les deux figures.' });
      items.push({ what: 'step:1', js: String(keep), expect: keep });
      sol.push(`a) ${KINDS[kind]} : ${WHY[kind].toLowerCase()}`, `b) ${keep ? `Non : les longueurs sont multipliées par ${String(tr.data[2]).replace('.', ',')}.` : 'Oui : c’est une isométrie, la figure 1 est superposable à la figure 0.'}`);
    } else if (kind === 0 || kind === 1 || kind === 3) {
      // candidats dessinés sur la figure : on choisit le bon
      const lab = kind === 0 ? ['(d₁)', '(d₂)', '(d₃)'] : ['O₁', 'O₂', 'O₃'];
      let cands: number[][];
      if (kind === 0) { const [o, v] = tr.data; cands = [[o, v], [o, v + rng.pick([-2, -1, 1, 2])], [1 - o, o === 0 ? rng.int(3, rows - 3) : rng.int(4, cols - 4)]]; }
      else {
        const [a, b] = tr.data, ok = (p: number[]) => p[0] >= 0.5 && p[0] <= cols - 1 && p[1] >= 0.5 && p[1] <= rows - 1;
        const offs = rng.shuffle([[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2], [-2, -2], [2, -2], [-2, 2], [3, 2], [-3, -2]]).map(([u, w]) => [a + u, b + w]).filter(ok);
        const o1 = offs[0], o2 = offs.find((p) => Math.hypot(p[0] - o1[0], p[1] - o1[1]) >= 2.5);
        if (!o1 || !o2) return reconnaitre.generate(rng, level);
        cands = [[a, b], o1, o2];
      }
      const order = rng.shuffle([0, 1, 2]), good = order.indexOf(0);
      order.forEach((ci, i) => { const c = cands[ci]; if (kind === 0) extra += c[0] === 0 ? gLine([c[1], 0], [c[1], rows]) + gDot([c[1], rows - 0.6], lab[i]).replace('gf-pt', 'gf-none') : gLine([0, c[1]], [cols, c[1]]) + gDot([cols - 0.8, c[1]], lab[i]).replace('gf-pt', 'gf-none'); else extra += gDot([c[0], c[1]], lab[i]); });
      if (kind === 3) {
        steps.push({ prompt: 'a) Dans quel sens tourne la rotation ?', answer: fixedChoice(['Sens des aiguilles d’une montre', 'Sens inverse des aiguilles d’une montre'], tr.data[2] ? 0 : 1, ['Suis un côté de la figure 0 jusqu’à son image.', 'Suis un côté de la figure 0 jusqu’à son image.']), hint: 'Repère la « barre » la plus longue : où est-elle passée ?' });
        items.push({ what: 'step:0', js: String(tr.data[2] ? 0 : 1), expect: tr.data[2] ? 0 : 1 });
      }
      const nm = kind === 0 ? 'l’axe de la symétrie' : kind === 1 ? 'le centre de la symétrie' : 'le centre de la rotation';
      steps.push({ prompt: `${kind === 3 ? 'b' : 'a'}) Quel est ${nm} ?`, answer: fixedChoice(lab, good, lab.map(() => kind === 0 ? 'Chaque sommet et son image doivent être à la même distance de l’axe, de part et d’autre.' : kind === 1 ? 'Le centre est le milieu du segment qui joint un sommet à son image.' : 'Le centre est à la même distance d’un sommet et de son image.'), 2), hint: kind === 0 ? 'Compte les carreaux entre un sommet et l’axe, puis entre l’axe et l’image.' : kind === 1 ? 'Cherche le milieu du segment [AA′] pour un sommet A.' : 'Le centre ne bouge pas ; pour un quart de tour, un sommet et son image sont à la même distance du centre.' });
      items.push({ what: `step:${steps.length - 1}`, js: String(good), expect: good });
      sol.push(kind === 0 ? `L’axe est ${lab[good]} : chaque sommet et son image sont à la même distance de cet axe, de part et d’autre (il est la médiatrice de chaque segment [AA′]).` : kind === 1 ? `Le centre est ${lab[good]} : c’est le milieu de chaque segment [AA′] qui joint un sommet à son image.` : `Rotation d’un quart de tour dans le sens ${tr.data[2] ? 'des aiguilles d’une montre' : 'inverse des aiguilles d’une montre'}, de centre ${lab[good]} : chaque sommet et son image sont à la même distance de ${lab[good]}, et forment avec lui un angle droit.`);
    } else {
      const [dx, dy] = tr.data;
      items.push({ what: 'dx', js: `${dx}`, expect: dx }, { what: 'dy', js: `${dy}`, expect: dy });
      steps.push(step('Déplacement de la translation (en carreaux) ?', [numF('Vers la droite :', dx), numF('Vers le haut :', dy)], 'Suis un sommet de la figure 0 jusqu’au même sommet de la figure 1. Un déplacement vers la gauche ou vers le bas s’écrit avec un signe −.', [...(dx !== dy ? [{ on: 'numAll' as const, values: [q(dy), q(dx)], msg: 'Inversé : d’abord le déplacement horizontal, puis le vertical.' }] : []), ...(dy !== -dx || dx !== -dy ? [{ on: 'numAll' as const, values: [q(-dx), q(-dy)], msg: 'Tu as compté de la figure 1 vers la figure 0 : c’est le sens contraire.' }] : [])]));
      sol.push(`Chaque sommet se déplace de ${Math.abs(dx)} carreau${Math.abs(dx) > 1 ? 'x' : ''} vers la ${dx >= 0 ? 'droite' : 'gauche'} et de ${Math.abs(dy)} carreau${Math.abs(dy) > 1 ? 'x' : ''} vers le ${dy >= 0 ? 'haut' : 'bas'} : ${m(`${dx}`)} et ${m(`${dy}`)}.`);
    }
    const st = level === 1 ? 'La figure 1 est l’image de la figure 0.' : `La figure 1 est l’image de la figure 0 par une ${['symétrie axiale', 'symétrie centrale', 'translation', 'rotation d’un quart de tour'][kind]}.`;
    return { title: level === 1 ? 'Quelle transformation ?' : 'Préciser la transformation.', statement: st, figure: gridSvg(cols, rows, [{ quads: q0, cls: 'gf-f0', label: '0' }, { quads: q1, cls: 'gf-f1', label: '1' }], extra, `Quadrillage : figure 0 et son image, la figure 1${extra ? ' ; éléments candidats marqués' : ''}`), steps, solution: sol, answer: level === 1 ? KINDS[kind] : sol[0], key: `${level}|${kind}|${pl.key}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== image d'un point dans un repère
export const image: Generator = {
  id: 'image', title: 'Image d’un point', stars: 1, levels: [1, 2], course: LINKS.s1, links: [LINKS.s2, LINKS.s3, LINKS.s4, LINKS.s5, LINKS.s6],
  desc: 'Coordonnées de l’image par une symétrie, une translation ; ★★ quart de tour, homothétie.',
  example: 'M(2\\,;3) \\xrightarrow{\\ \\text{sym. de centre } O\\ } M\'(-2\\,;-3)',
  generate(rng: Rng, level: Level) {
    const R = 6, inR = (p: Pt) => Math.abs(p[0]) <= R && Math.abs(p[1]) <= R;
    for (;;) {
      const v = level === 1 ? rng.int(0, 3) : rng.int(4, 6), M: Pt = [rng.int(-5, 5), rng.int(-5, 5)];
      let P: Pt, st: Rich, how: Rich, fig: string, key: string, wrong: [Pt, Rich][] = [];
      const pts = [{ p: M, lab: 'M' }];
      if (v === 0) {
        const vert = rng.chance(0.5), a = rng.int(-3, 3);
        P = vert ? [2 * a - M[0], M[1]] : [M[0], 2 * a - M[1]];
        if (P[0] === M[0] && P[1] === M[1]) continue;
        st = `Symétrie d’axe la droite ${m('(d)')} ${vert ? `verticale d’équation ${m(`x = ${a}`)}` : `horizontale d’équation ${m(`y = ${a}`)}`}.`;
        how = vert ? `M est à ${Math.abs(M[0] - a)} carreau(x) de (d) ; son image est à la même distance de l’autre côté, sur la même ligne horizontale.` : `M est à ${Math.abs(M[1] - a)} carreau(x) de (d) ; son image est à la même distance de l’autre côté, sur la même ligne verticale.`;
        wrong = [[vert ? [M[0], -M[1]] : [-M[0], M[1]], 'Tu as fait la symétrie par rapport à l’autre axe.'], [[-M[0], -M[1]], 'Ce n’est pas la symétrie par rapport à l’origine.']];
        fig = repereSvg(R, pts, { lines: [vert ? [[a, -R - 0.3], [a, R + 0.3], '(d)'] : [[-R - 0.3, a], [R + 0.3, a], '(d)']] }, `Repère ; point M(${M.join(' ; ')}) ; droite (d)`); key = `0|${M}|${vert}|${a}`;
      } else if (v === 1) {
        const O: Pt = [rng.int(-2, 2), rng.int(-2, 2)];
        P = [2 * O[0] - M[0], 2 * O[1] - M[1]];
        if (P[0] === M[0] && P[1] === M[1]) continue;
        st = `Symétrie de centre ${m(`\\Omega(${O[0]}\\,;${O[1]})`)}.`; how = `Ω est le milieu de [MM′] : on refait depuis Ω le même déplacement que de M à Ω (${O[0] - M[0]} horizontalement, ${O[1] - M[1]} verticalement).`;
        wrong = [[[-M[0], -M[1]], 'Le centre est Ω, pas l’origine du repère.'], [[(M[0] + O[0]) / 2, (M[1] + O[1]) / 2], 'Ω est le milieu de [MM′], pas M′ le milieu de [MΩ].']];
        fig = repereSvg(R, [...pts, { p: O, lab: 'Ω', cls: 'gf-pt2' }], {}, `Repère ; M(${M.join(' ; ')}) ; centre Ω(${O.join(' ; ')})`); key = `1|${M}|${O}`;
      } else if (v === 2 || v === 3) {
        const A: Pt = [rng.int(-5, 5), rng.int(-5, 5)], B: Pt = [rng.int(-5, 5), rng.int(-5, 5)], dx = B[0] - A[0], dy = B[1] - A[1];
        if (Math.abs(dx) + Math.abs(dy) < 3) continue;
        P = [M[0] + dx, M[1] + dy];
        if ((A[0] === M[0] && A[1] === M[1]) || (B[0] === M[0] && B[1] === M[1])) continue;
        st = `Translation qui envoie ${m('A')} sur ${m('B')}.`; how = `De A à B : ${dx} horizontalement et ${dy} verticalement ; on applique le même déplacement à M.`;
        wrong = [[[M[0] - dx, M[1] - dy], 'C’est le déplacement de B vers A : le sens compte.'], [[B[0] + M[0] - A[0] - 2 * dx + dx, 0], '']];
        wrong = wrong.filter((w) => w[1]);
        fig = repereSvg(R, [...pts, { p: A, lab: 'A', cls: 'gf-pt2' }, { p: B, lab: 'B', cls: 'gf-pt2' }], { arrows: [[A, B]] }, `Repère ; M(${M.join(' ; ')}) ; A(${A.join(' ; ')}) ; B(${B.join(' ; ')})`); key = `2|${M}|${A}|${B}`;
      } else if (v === 4 || v === 5) {
        const O: Pt = rng.chance(0.5) ? [0, 0] : [rng.int(-2, 2), rng.int(-2, 2)], cw = rng.chance(0.5), u = M[0] - O[0], w = M[1] - O[1];
        if (u === 0 && w === 0) continue;
        P = cw ? [O[0] + w, O[1] - u] : [O[0] - w, O[1] + u];
        st = `Rotation de centre ${m(`\\Omega(${O[0]}\\,;${O[1]})`)}, d’angle ${m('90^\\circ')}, dans le sens ${cw ? 'des aiguilles d’une montre' : 'inverse des aiguilles d’une montre'}.`;
        how = `De Ω à M : ${u} horizontalement, ${w} verticalement. Après un quart de tour, l’horizontal devient vertical : de Ω à M′ : ${cw ? `${w} et ${-u}` : `${-w} et ${u}`}.`;
        wrong = [[cw ? [O[0] - w, O[1] + u] : [O[0] + w, O[1] - u], 'Ce quart de tour est dans le mauvais sens.'], [[2 * O[0] - M[0], 2 * O[1] - M[1]], 'Ça, c’est un demi-tour (symétrie centrale).']];
        fig = repereSvg(R, [...pts, { p: O, lab: 'Ω', cls: 'gf-pt2' }], {}, `Repère ; M(${M.join(' ; ')}) ; centre Ω(${O.join(' ; ')})`); key = `4|${M}|${O}|${cw}`;
      } else {
        const O: Pt = [rng.int(-2, 2), rng.int(-2, 2)], k = rng.pick([2, 3, -1, -2, 0.5, -0.5]);
        P = [O[0] + k * (M[0] - O[0]), O[1] + k * (M[1] - O[1])];
        if (!Number.isInteger(P[0]) || !Number.isInteger(P[1]) || (M[0] === O[0] && M[1] === O[1])) continue;
        const ks = String(k).replace('.', '{,}');
        st = `Homothétie de centre ${m(`\\Omega(${O[0]}\\,;${O[1]})`)} et de rapport ${m(ks)}.`; how = `De Ω à M : ${M[0] - O[0]} et ${M[1] - O[1]} ; on multiplie ce déplacement par ${String(k).replace('.', ',')} à partir de Ω.`;
        wrong = [[[k * M[0], k * M[1]], 'Le centre est Ω, pas l’origine : on multiplie le déplacement depuis Ω.'], [[O[0] - k * (M[0] - O[0]), O[1] - k * (M[1] - O[1])], k < 0 ? 'Rapport négatif : l’image est de l’autre côté de Ω… mais ici tu es allé du mauvais côté.' : 'Rapport positif : M′ est du même côté que M par rapport à Ω.']];
        fig = repereSvg(R, [...pts, { p: O, lab: 'Ω', cls: 'gf-pt2' }], {}, `Repère ; M(${M.join(' ; ')}) ; centre Ω(${O.join(' ; ')})`); key = `6|${M}|${O}|${k}`;
      }
      if (!inR(P)) continue;
      const items: Item[] = [{ what: 'x', js: `${P[0]}`, expect: P[0] }, { what: 'y', js: `${P[1]}`, expect: P[1] }];
      const qq = (v: number) => q(Math.round(v * 1000), 1000), cand: [Pt, Rich][] = [[[P[1], P[0]], 'Abscisse d’abord, ordonnée ensuite.'], ...wrong], seen = new Set([`${P}`]), mk = [];
      for (const [w, msg] of cand) { if (seen.has(`${w}`)) continue; seen.add(`${w}`); mk.push({ on: 'numAll' as const, values: [qq(w[0]), qq(w[1])], msg }); }
      const steps = [step(`Coordonnées de ${m("M'")}, image de ${m('M')} ?`, [numF(m("x_{M'} ="), P[0]), numF(m("y_{M'} ="), P[1])], how, mk)];
      return { title: 'Image d’un point.', statement: `${st} Le point ${m(`M(${M[0]}\\,;${M[1]})`)} est placé sur la figure.`, figure: fig, steps, solution: [how, `Donc ${m(`M'(${P[0]}\\,;${P[1]})`)}.`], answer: `M′(${P[0]} ; ${P[1]})`, key, data: { kind: 'js', items } };
    }
  },
};
void shuffledChoice; void corr;
