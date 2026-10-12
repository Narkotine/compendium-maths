/** Chapitre 10 : propriétés conservées, axes et centres, images dans un parallélogramme, homothétie, rotations, erreurs. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { fixedChoice, shuffledChoice, mist } from '../engine/build';
import { svgWrap, line, text, dot, type Pt } from '../engine/svg';
import { LINKS, m, step, corr, numF, q, type Item } from './common';

const D = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', '{,}');
const Dt = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',');

// ===================================================================== conservé, axes, centres
const VF: [Rich, number, Rich][] = [
  ['Une symétrie axiale conserve les longueurs.', 0, 'Les quatre isométries conservent les longueurs.'],
  ['Une homothétie de rapport 3 conserve les longueurs.', 1, 'Elle les multiplie par 3.'],
  ['Une translation retourne la figure.', 1, 'Seule la symétrie axiale retourne la figure.'],
  ['La symétrie de centre O est la rotation de centre O d’angle 180°.', 0, 'Un demi-tour autour de O.'],
  ['Une rotation conserve les aires.', 0, 'C’est une isométrie.'],
  ['Une homothétie conserve les angles.', 0, 'Les angles sont conservés ; seules les longueurs changent.'],
  ['Une homothétie de rapport 2 multiplie les aires par 2.', 1, 'Les aires sont multipliées par k² = 4.'],
  ['Une symétrie axiale retourne la figure.', 0, 'C’est la seule des cinq qui retourne.'],
  ['Par une symétrie centrale, l’image d’une droite est une droite perpendiculaire.', 1, 'C’est une droite parallèle.'],
  ['Une translation a un point invariant.', 1, 'Aucun point ne reste fixe (sauf si A = B).'],
  ['Une rotation de centre O laisse O invariant.', 0, 'Le centre ne bouge pas.'],
  ['Une homothétie de rapport −1 est une symétrie centrale.', 0, 'k = −1 : même distance, de l’autre côté du centre.'],
];
const AXES: [string, number][] = [['un segment', 2], ['un angle', 1], ['un rectangle qui n’est pas un carré', 2], ['un carré', 4], ['un triangle équilatéral', 3], ['un parallélogramme qui n’est ni un rectangle ni un losange', 0], ['un losange qui n’est pas un carré', 2], ['un triangle isocèle non équilatéral', 1], ['un trapèze isocèle', 1], ['un hexagone régulier', 6], ['un pentagone régulier', 5]];
const LETTERS: Record<string, [number, number]> = { A: [1, 0], E: [1, 0], H: [1, 1], N: [0, 1], O: [1, 1], S: [0, 1], X: [1, 1], Z: [0, 1], M: [1, 0], T: [1, 0], U: [1, 0], F: [0, 0], L: [0, 0], I: [1, 1], C: [1, 0], D: [1, 0], B: [1, 0], R: [0, 0], G: [0, 0], V: [1, 0], W: [1, 0], Y: [1, 0], P: [0, 0], J: [0, 0] };
export const conserve: Generator = {
  id: 'conserve', title: 'Ce qui est conservé', stars: 1, levels: [1], course: LINKS.s71, links: [LINKS.s23, LINKS.s3],
  desc: 'Vrai ou faux sur les propriétés conservées ; nombre d’axes de symétrie ; lettres à axe ou à centre de symétrie.',
  example: '\\text{isométrie : longueurs, angles, aires conservés}',
  generate(rng: Rng) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const vf = rng.shuffle(VF.map((_, i) => i)).slice(0, 2);
    vf.forEach((i, j) => { const [t, k, why] = VF[i]; steps.push({ prompt: `${'ab'[j]}) Vrai ou faux : « ${t} »`, answer: fixedChoice(['Vrai', 'Faux'], k, [why, why]), hint: 'Relis le tableau du § 7.1.' }); items.push({ what: `step:${j}`, js: String(k), expect: k }); sol.push(`${'ab'[j]}) ${k ? 'Faux' : 'Vrai'} : ${why[0].toLowerCase() + why.slice(1)}`); });
    const [fig, n] = rng.pick(AXES);
    items.push({ what: 'axes', js: String(n), expect: n });
    steps.push(step(`c) Combien d’axes de symétrie a ${fig} ?`, [numF('', n)], 'Cherche tous les pliages qui superposent la figure à elle-même.', mist(q(n), [[fig.includes('parallélogramme') ? q(2) : null, 'Plie un parallélogramme le long d’une diagonale : les moitiés ne se superposent pas.'], [fig.includes('segment') ? q(1) : null, 'N’oublie pas la droite qui porte le segment.'], [fig.includes('rectangle') ? q(4) : null, 'Les diagonales d’un rectangle ne sont pas des axes de symétrie.']])));
    sol.push(`c) ${n} axe${n > 1 ? 's' : ''}.`);
    const lets = rng.shuffle(Object.keys(LETTERS)).slice(0, 4), which = rng.int(0, 1), good = lets.filter((l) => LETTERS[l][which]);
    const k = good.length;
    items.push({ what: 'let', js: `[${lets.map((l) => LETTERS[l][which]).join(',')}].filter(Boolean).length`, expect: k });
    steps.push(step(`d) Parmi les lettres ${lets.join(', ')} (capitales d’imprimerie simples), combien ont ${which ? 'un centre de symétrie' : 'au moins un axe de symétrie'} ?`, [numF('', k)], which ? 'Un demi-tour de la lettre la laisse-t-elle inchangée ?' : 'Un pliage (vertical ou horizontal) superpose-t-il la lettre à elle-même ?'));
    sol.push(`d) ${k === 0 ? 'Aucune' : `${good.join(', ')}`} : ${k}.`);
    return { title: 'Propriétés et symétries.', statement: '', steps, solution: sol, answer: sol.join(' '), key: `${vf.join(',')}|${fig}|${lets.join('')}|${which}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== images dans un parallélogramme ou un carré
function quadSvg(names: string[], square: boolean): string {
  const P: Pt[] = square ? [[90, 190], [230, 190], [230, 50], [90, 50]] : [[50, 180], [220, 180], [270, 60], [100, 60]];
  const O: Pt = [(P[0][0] + P[2][0]) / 2, (P[0][1] + P[2][1]) / 2];
  let b = line(P[0], P[1]) + line(P[1], P[2]) + line(P[2], P[3]) + line(P[3], P[0]) + line(P[0], P[2], 'gf-thin') + line(P[1], P[3], 'gf-thin') + dot(O, 2.5) + text([O[0], O[1] + 15], 'O', 'gf-tb');
  const off: Pt[] = [[-12, 12], [12, 12], [12, -12], [-12, -12]];
  P.forEach((p, i) => (b += text([p[0] + off[i][0], p[1] + off[i][1]], names[i], 'gf-tb')));
  return svgWrap(320, 230, `${square ? 'Carré' : 'Parallélogramme'} ${names.join('')} de centre O`, b);
}
const NAMES4 = ['ABCD', 'EFGH', 'MNPQ', 'RSTU', 'IJKL', 'KLMN'];
export const quadrilatere: Generator = {
  id: 'quadrilatere', title: 'Images dans un parallélogramme', stars: 2, levels: [2], course: LINKS.s4, links: [LINKS.s3, LINKS.s5],
  desc: 'Image d’un sommet par une translation, une symétrie centrale, une rotation d’un carré.',
  example: 'ABCD \\text{ parallélogramme : } A \\mapsto B \\text{ envoie } D \\text{ sur } C',
  generate(rng: Rng) {
    const nm = rng.pick(NAMES4).split(''), [A, B, C, Dd] = nm, items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const V = [A, B, C, Dd];
    // translations valides dans ABCD : AB = DC, AD = BC
    const TR: [number, number, number, number][] = [[0, 1, 3, 2], [1, 0, 2, 3], [3, 2, 0, 1], [2, 3, 1, 0], [0, 3, 1, 2], [3, 0, 2, 1], [1, 2, 0, 3], [2, 1, 3, 0]];
    const qs = rng.shuffle([0, 1, 2]).slice(0, 2);
    const ask = (prompt: Rich, ans: number, why: Rich, j: number) => { steps.push({ prompt, answer: fixedChoice(V.map(m), ans, V.map(() => why), 2), hint: why }); items.push({ what: `step:${j}`, js: String(ans), expect: ans }); };
    qs.forEach((t, j) => {
      const L = 'ab'[j];
      if (t === 0) { const [p, r, s, img] = rng.pick(TR); ask(`${L}) Image de ${m(V[s])} par la translation qui envoie ${m(V[p])} sur ${m(V[r])} ?`, img, `Cherche le point X tel que ${V[p]}${V[r]}X${V[s]} soit un parallélogramme.`, j); sol.push(`${L}) ${m(`${V[p]}${V[r]}${V[img]}${V[s]}`)} est un parallélogramme (ou ${m(`${V[p]}${V[r]}`)} et ${m(`${V[s]}${V[img]}`)} sont « parallèles, de même longueur et de même sens ») : l’image de ${m(V[s])} est ${m(V[img])}.`); }
      else if (t === 1) { const s = rng.int(0, 3), img = (s + 2) % 4; ask(`${L}) Image de ${m(V[s])} par la symétrie de centre O ?`, img, 'Les diagonales se coupent en leur milieu O.', j); sol.push(`${L}) O est le milieu de ${m(`[${V[Math.min(s, img)]}${V[Math.max(s, img)]}]`)} : l’image de ${m(V[s])} est ${m(V[img])}.`); }
      else { const s = rng.int(0, 3), cw = rng.chance(0.5), ang = rng.pick([90, 90, 180, 270]), st = ang / 90, img = cw ? (s - st + 4) % 4 : (s + st) % 4; ask(`${L}) Image de ${m(V[s])} par la rotation de centre O d’angle ${m(`${ang}^\\circ`)} dans le sens ${cw ? 'des aiguilles d’une montre' : 'inverse des aiguilles d’une montre'} ?`, img, 'Chaque quart de tour fait passer d’un sommet au suivant.', j); sol.push(`${L}) ${ang / 90} quart${ang > 90 ? 's' : ''} de tour ${cw ? 'dans le sens des aiguilles d’une montre' : 'dans le sens inverse'} : ${m(V[s])} va en ${m(V[img])}.`); }
    });
    const sq = qs.includes(2);
    return { title: sq ? 'Images dans un carré.' : 'Images dans un parallélogramme.', statement: sq ? `${m(nm.join(''))} est un carré de centre ${m('O')}, ses sommets étant nommés dans le sens inverse des aiguilles d’une montre.` : `${m(nm.join(''))} est un parallélogramme de centre ${m('O')}.`, figure: quadSvg(nm, sq), steps, solution: sol, answer: steps.map((s) => V[corr(s)]).join(' ; '), key: `${nm.join('')}|${sol.join('')}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== homothétie
export const homothetie: Generator = {
  id: 'homothetie', title: 'Homothétie', stars: 1, levels: [1, 2, 3], course: LINKS.s6, links: [LINKS.s62],
  desc: 'Distance au centre, rapport négatif ; ★★ longueurs, angles, aires × k² ; ★★★ problèmes.',
  example: 'k = -2{,}5 : \\text{ aires} \\times 6{,}25',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const k = rng.pick([2, 3, 4, 1.5, 2.5, 0.5, 0.25, -0.5, -2, -3, -1.5]), im = rng.int(2, 12), r = Math.abs(k) * im;
      items.push({ what: 'r', js: `Math.abs(${k})*${im}`, expect: r });
      steps.push(step(`a) Combien vaut ${m("IM'")} ?`, [numF('', r, 'cm')], k < 0 ? 'Rapport négatif : on multiplie par l’opposé du rapport (une longueur est positive).' : 'On multiplie la distance au centre par le rapport.', mist(q(Math.round(r * 1000), 1000), [[k < 0 ? q(Math.round(k * im * 1000), 1000) : null, 'Une longueur n’est jamais négative : le signe indique seulement le côté.']])));
      const between = k < 0 ? 0 : k > 1 ? 1 : 2, OPT = [m('I'), m('M'), m("M'")];
      steps.push({ prompt: 'b) Lequel des trois points est entre les deux autres ?', answer: fixedChoice(OPT, between, ['Rapport positif : M et M′ sont du même côté de I.', k < 0 ? 'Rapport négatif : I est entre M et M′.' : 'M′ est plus près de I que M.', k < 0 ? 'Rapport négatif : I est entre M et M′.' : 'M′ est plus loin de I que M.'], 2), hint: k < 0 ? 'Rapport négatif : de quel côté de I est M′ ?' : `Compare ${m('IM')} et ${m("IM'")}.` });
      items.push({ what: 'step:1', js: `${k}<0?0:${k}>1?1:2`, expect: between });
      sol.push(`a) ${m(`IM' = ${D(Math.abs(k))} \\times ${im} = ${D(r)}\\,\\mathrm{cm}`)}.`, `b) ${k < 0 ? 'Rapport négatif : M′ est de l’autre côté de I, donc I est entre M et M′.' : k > 1 ? 'Rapport supérieur à 1, même côté : M est entre I et M′.' : 'Rapport entre 0 et 1, même côté : M′ est entre I et M.'}`);
      return { title: 'Homothétie : placer l’image.', statement: `Homothétie de centre ${m('I')} et de rapport ${m(D(k))}. On a ${m(`IM = ${im}\\,\\mathrm{cm}`)}.`, steps, solution: sol, answer: `${Dt(r)} cm`, key: `${k}|${im}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      const v = rng.int(0, 2);
      if (v === 0) {
        const k = rng.pick([2, 3, 1.5, 2.5, 0.5, -2, -1.5, -2.5, -0.5, -3]), ab = rng.int(2, 9), ang = rng.int(25, 120), ar = rng.pick([4, 6, 8, 10, 12, 5, 9]), ka = Math.abs(k);
        items.push({ what: 'ab', js: `Math.abs(${k})*${ab}`, expect: ka * ab }, { what: 'ang', js: `${ang}`, expect: ang }, { what: 'ar', js: `(${k})**2*${ar}`, expect: k * k * ar });
        steps.push(step(`a) ${m("A'B'")} ?`, [numF('', ka * ab, 'cm')], 'Longueurs multipliées par |k|.', mist(q(Math.round(k * ab * 1000), 1000), [[k < 0 ? q(Math.round(k * ab * 1000), 1000) : null, 'Une longueur est positive.']])));
        steps.push(step(`b) ${m("\\widehat{B'}")} ?`, [numF('', ang, '°')], 'Une homothétie conserve les angles.', mist(q(ang), [[Number.isInteger(ka * ang) ? q(ka * ang) : null, 'Les angles ne sont pas multipliés : ils sont conservés.']])));
        steps.push(step(`c) Aire de ${m("A'B'C'")} ?`, [numF('', k * k * ar, 'cm²')], `Aires multipliées par ${m('k^2')}.`, mist(q(Math.round(k * k * ar * 1000), 1000), [[q(Math.round(ka * ar * 1000), 1000), 'Les aires sont multipliées par k², pas par k.']])));
        sol.push(`a) ${m(`A'B' = ${D(ka)} \\times ${ab} = ${D(ka * ab)}\\,\\mathrm{cm}`)}.`, `b) Angles conservés : ${m(`\\widehat{B'} = ${ang}^\\circ`)}.`, `c) ${m(`(${D(k)})^2 = ${D(k * k)}`)}, donc ${m(`${D(k * k)} \\times ${ar} = ${D(k * k * ar)}\\,\\mathrm{cm}^2`)}.`);
        return { title: 'Ce que fait une homothétie.', statement: `Une homothétie de rapport ${m(D(k))} envoie le triangle ${m('ABC')} sur ${m("A'B'C'")}. On sait que ${m(`AB = ${ab}\\,\\mathrm{cm}`)}, ${m(`\\widehat{B} = ${ang}^\\circ`)} et que l’aire de ${m('ABC')} est ${m(`${ar}\\,\\mathrm{cm}^2`)}.`, steps, solution: sol, answer: `${Dt(ka * ab)} cm ; ${ang}° ; ${Dt(k * k * ar)} cm²`, key: `a|${k}|${ab}|${ang}|${ar}`, data: { kind: 'js', items } };
      }
      if (v === 1) {
        const oa = rng.pick([2, 3, 4, 5, 6, 8]), k = rng.pick([2, 2.5, 3, 1.5, 0.5, -0.5, -2, -1.5, -3]), oa2 = Math.abs(k) * oa, same = k > 0;
        items.push({ what: 'k', js: `(${same}?1:-1)*${oa2}/${oa}`, expect: k });
        steps.push(step(`Rapport de l’homothétie de centre ${m('O')} qui envoie ${m('A')} sur ${m("A'")} ?`, [numF(m('k ='), k)], `${m("\\dfrac{OA'}{OA}")}, avec un signe − si ${m("A'")} est de l’autre côté de ${m('O')}.`, mist(q(Math.round(k * 1000), 1000), [[q(Math.round(-k * 1000), 1000), same ? 'A′ est du même côté : rapport positif.' : 'A′ est de l’autre côté de O : rapport négatif.'], [q(Math.round((oa / oa2) * 1000), 1000), 'C’est OA′ ÷ OA (image sur départ).']])));
        sol.push(`${m(`\\dfrac{OA'}{OA} = \\dfrac{${D(oa2)}}{${oa}} = ${D(Math.abs(k))}`)} ; ${same ? 'même côté : ' : 'de l’autre côté de O : '}${m(`k = ${D(k)}`)}.`);
        return { title: 'Trouver le rapport.', statement: `${m('O')}, ${m('A')}, ${m("A'")} sont alignés, ${m(`OA = ${oa}\\,\\mathrm{cm}`)}, ${m(`OA' = ${D(oa2)}\\,\\mathrm{cm}`)} et ${m("A'")} est ${same ? `sur la demi-droite ${m('[OA)')}` : `de l’autre côté de ${m('O')}`}.`, steps, solution: sol, answer: `k = ${Dt(k)}`, key: `r|${oa}|${k}`, data: { kind: 'js', items } };
      }
      const k = rng.pick([2, 3, 4, 5, 1.5, 2.5, 0.5]), a1 = rng.pick([4, 5, 6, 8, 10, 12, 20]), a2 = k * k * a1;
      items.push({ what: 'k', js: `Math.sqrt(${a2}/${a1})`, expect: k }, { what: 'k2', js: `-Math.sqrt(${a2}/${a1})`, expect: -k });
      steps.push(step('Quels sont les rapports possibles ?', [numF('Positif :', k), numF('Négatif :', -k)], `${m(`k^2 = \\dfrac{${D(a2)}}{${a1}}`)}.`, [{ on: 'numAll', values: [q(Math.round(k * k * 1000), 1000), q(Math.round(-k * k * 1000), 1000)], msg: 'C’est k² : prends la racine carrée.' }]));
      sol.push(`${m(`k^2 = \\dfrac{${D(a2)}}{${a1}} = ${D(k * k)}`)}, donc ${m(`k = ${D(k)}`)} ou ${m(`k = ${D(-k)}`)}.`);
      return { title: 'Rapport à partir des aires.', statement: `Une homothétie transforme une figure d’aire ${m(`${a1}\\,\\mathrm{cm}^2`)} en une figure d’aire ${m(`${D(a2)}\\,\\mathrm{cm}^2`)}.`, steps, solution: sol, answer: `±${Dt(k)}`, key: `s|${k}|${a1}`, data: { kind: 'js', items } };
    }
    if (rng.chance(0.5)) {
      const [a, b, c] = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [20, 21, 29]]), k = rng.pick([-2, -3, 2, 3, -1.5, 1.5, -0.5, 2.5, -2.5, 4, -4, 0.5]), ka = Math.abs(k);
      items.push({ what: 'a', js: `Math.abs(${k})*${a}`, expect: ka * a }, { what: 'b', js: `Math.abs(${k})*${b}`, expect: ka * b }, { what: 'c', js: `Math.abs(${k})*${c}`, expect: ka * c }, { what: 'p', js: `Math.abs(${k})*(${a}+${b}+${c})`, expect: ka * (a + b + c) }, { what: 'A', js: `(${k})**2*${a}*${b}/2`, expect: (k * k * a * b) / 2 });
      steps.push(step('a) Côtés de l’image ?', [numF('', ka * a, 'cm'), numF('', ka * b, 'cm'), numF('', ka * c, 'cm')], 'Longueurs multipliées par |k|.'));
      steps.push(step('b) Périmètre et aire de l’image ?', [numF('Périmètre :', ka * (a + b + c), 'cm'), numF('Aire :', (k * k * a * b) / 2, 'cm²')], 'Le périmètre est une longueur (× |k|), l’aire est multipliée par k².', [{ on: 'numAll', values: [q(Math.round(ka * (a + b + c) * 1000), 1000), q(Math.round(((ka * a * b) / 2) * 1000), 1000)], msg: 'L’aire est multipliée par k², pas par |k|.' }]));
      sol.push(`a) ${m(`${D(ka)} \\times ${a} = ${D(ka * a)}`)}, ${m(`${D(ka)} \\times ${b} = ${D(ka * b)}`)}, ${m(`${D(ka)} \\times ${c} = ${D(ka * c)}`)} (en cm).`, `b) Périmètre : ${m(`${D(ka)} \\times ${a + b + c} = ${D(ka * (a + b + c))}\\,\\mathrm{cm}`)}. Aire de départ ${m(`\\dfrac{${a} \\times ${b}}{2} = ${(a * b) / 2}\\,\\mathrm{cm}^2`)}, multipliée par ${m(`(${D(k)})^2 = ${D(k * k)}`)} : ${m(`${D((k * k * a * b) / 2)}\\,\\mathrm{cm}^2`)}.`);
      return { title: 'Image d’un triangle rectangle.', statement: `Un triangle rectangle a pour côtés ${m(`${a}`)}, ${m(`${b}`)} et ${m(`${c}\\,\\mathrm{cm}`)}. On lui applique une homothétie de rapport ${m(D(k))}.`, steps, solution: sol, answer: `${Dt(ka * (a + b + c))} cm ; ${Dt((k * k * a * b) / 2)} cm²`, key: `t|${a}|${k}`, data: { kind: 'js', items } };
    }
    const [w, h] = rng.pick([[10, 15], [9, 13], [10, 13], [13, 18], [15, 21], [20, 30], [12, 16], [8, 12], [6, 8], [9, 12], [7, 10], [11, 15], [10, 12], [12, 18], [5, 8], [6, 9]]), big = rng.pick(Array.from({ length: 80 }, (_, i) => i + 11).filter((x) => (x * w * 10) % h === 0 && x > h && x <= 4 * h && (x * x * 1000) % (h * h) === 0 && (x * w) % h === 0));
    if (big === undefined) return homothetie.generate(rng, level);
    const k = big / h, w2 = k * w;
    items.push({ what: 'k', js: `${big}/${h}`, expect: k }, { what: 'w2', js: `${w}*${big}/${h}`, expect: w2 }, { what: 'k2', js: `(${big}/${h})**2`, expect: k * k });
    steps.push(step('a) Rapport d’agrandissement ?', [numF(m('k ='), k)], `Grand côté : ${big} ÷ ${h}.`, mist(q(big, h), [[q(h, big), 'C’est l’image divisée par le départ : nouveau côté ÷ ancien côté.']])));
    steps.push(step('b) Petit côté de la photo agrandie ?', [numF('', w2, 'cm')], 'Multiplie par k.'));
    steps.push(step('c) Par combien l’aire est-elle multipliée ?', [numF('', k * k)], 'Aires × k².', mist(q(big * big, h * h), [[q(big, h), 'Les aires sont multipliées par k², pas par k.']])));
    sol.push(`a) ${m(`k = \\dfrac{${big}}{${h}} = ${D(k)}`)}.`, `b) ${m(`${D(k)} \\times ${w} = ${D(w2)}\\,\\mathrm{cm}`)} : photo de ${m(D(w2))} sur ${m(`${big}\\,\\mathrm{cm}`)}.`, `c) ${m(`k^2 = ${D(k * k)}`)} (${m(`${w * h} \\to ${D(w2 * big)}\\,\\mathrm{cm}^2`)}).`);
    return { title: 'Agrandir une photo.', statement: `Une photo de ${m(`${w}\\,\\mathrm{cm}`)} sur ${m(`${h}\\,\\mathrm{cm}`)} est agrandie pour que son grand côté mesure ${m(`${big}\\,\\mathrm{cm}`)}.`, steps, solution: sol, answer: `k = ${Dt(k)} ; ${Dt(w2)} cm ; × ${Dt(k * k)}`, key: `p|${w}|${h}|${big}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== rotations
export const rotation: Generator = {
  id: 'rotation', title: 'Rotations', stars: 1, levels: [1, 2], course: LINKS.s5, links: [LINKS.s72],
  desc: 'Aiguilles d’une horloge, rosaces ; ★★ quart de tour et triangle équilatéral.',
  example: '\\dfrac{360^\\circ}{8} = 45^\\circ',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const mn = rng.int(1, 11) * 5, h = rng.int(1, 11), n = rng.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24]);
      items.push({ what: 'mn', js: `${mn}*360/60`, expect: 6 * mn }, { what: 'h', js: `${h}*360/12`, expect: 30 * h }, { what: 'n', js: `360/${n}`, expect: 360 / n });
      steps.push(step(`a) De quel angle tourne la grande aiguille d’une horloge en ${mn} minutes ?`, [numF('', 6 * mn, '°')], 'Un tour (360°) en 60 minutes.', mist(q(6 * mn), [[q(mn), 'Un tour fait 360°, en 60 minutes : 6° par minute.']])));
      steps.push(step(`b) Et la petite aiguille en ${h} heure${h > 1 ? 's' : ''} ?`, [numF('', 30 * h, '°')], 'Un tour en 12 heures.', mist(q(30 * h), [[q(15 * h), 'La petite aiguille fait un tour en 12 heures, pas 24.']])));
      steps.push(step(`c) Une rosace a ${n} motifs identiques régulièrement répartis. Plus petit angle de rotation qui envoie un motif sur un autre ?`, [numF('', 360 / n, '°')], 'Partage le tour complet.'));
      sol.push(`a) ${m(`6^\\circ \\times ${mn} = ${6 * mn}^\\circ`)} (360° en 60 minutes).`, `b) ${m(`30^\\circ \\times ${h} = ${30 * h}^\\circ`)} (360° en 12 heures).`, `c) ${m(`\\dfrac{360^\\circ}{${n}} = ${D(360 / n)}^\\circ`)}.`);
      return { title: 'Tourner.', statement: '', steps, solution: sol, answer: `${6 * mn}° ; ${30 * h}° ; ${D(360 / n)}°`, key: `${mn}|${h}|${n}`, data: { kind: 'js', items } };
    }
    if (rng.chance(0.55)) {
      const r = rng.int(4, 50) / 2, aa = r * Math.SQRT2;
      items.push({ what: 'aa', js: `Math.sqrt(2*${r}**2)`, expect: aa, tol: 1e-9 });
      steps.push({ prompt: `a) Nature du triangle ${m("OAA'")} ?`, answer: fixedChoice(['Rectangle isocèle en O', 'Équilatéral', 'Rectangle en A'], 0, [null, 'L’angle en O vaut 90°, pas 60°.', 'L’angle droit est l’angle de la rotation, en O.'], 2), hint: `La rotation conserve la distance au centre : ${m("OA' = OA")}.` });
      items.push({ what: 'step:0', js: '0', expect: 0 });
      steps.push({ prompt: `b) Calcule ${m("AA'")} (arrondi au dixième).`, answer: { kind: 'num', fields: [{ label: '', unit: 'cm', expect: q(Math.round(aa * 10), 10), form: 'any', approx: { value: aa, tol: 0.051, dp: 1 } }] }, hint: 'Pythagore dans le triangle rectangle en O.', mistakes: mist(q(Math.round(aa * 10), 10), [[q(2 * r), 'On additionne les carrés, puis racine carrée.']]) });
      sol.push(`a) ${m("OA' = OA")} et ${m("\\widehat{AOA'} = 90^\\circ")} : ${m("OAA'")} est rectangle isocèle en ${m('O')}.`, `b) Pythagore : ${m(`AA'^2 = ${D(r)}^2 + ${D(r)}^2 = ${D(2 * r * r)}`)}, donc ${m(`AA' = \\sqrt{${D(2 * r * r)}} \\approx ${D(Math.round(aa * 10) / 10)}\\,\\mathrm{cm}`)}.`);
      if (Math.abs(aa * 10 - Math.round(aa * 10)) > 0.44) return rotation.generate(rng, level);
      return { title: 'Un quart de tour.', statement: `La rotation de centre ${m('O')} et d’angle ${m('90^\\circ')} envoie ${m('A')} sur ${m("A'")}, avec ${m(`OA = ${D(r)}\\,\\mathrm{cm}`)}.`, steps, solution: sol, answer: `≈ ${Dt(Math.round(aa * 10) / 10)} cm`, key: `q|${r}`, data: { kind: 'js', items } };
    }
    const s = rng.int(3, 24), ang = rng.pick([60, 60, 90, 30, 40, 50, 70, 80, 100, 120]);
    const OPT = ['Équilatéral', 'Isocèle (non équilatéral)', 'Rectangle isocèle'], k = ang === 60 ? 0 : ang === 90 ? 2 : 1;
    steps.push({ prompt: `a) La rotation de centre ${m('A')} et d’angle ${m(`${ang}^\\circ`)} envoie ${m('B')} sur ${m('C')}. Nature du triangle ${m('ABC')} ?`, answer: fixedChoice(OPT, k, ['Il faut un angle de 60°.', null, 'Il faut un angle de 90°.'].map((x, i) => (i === k ? null : x ?? 'AC = AB : isocèle en A ; regarde l’angle en A.')), 2), hint: `${m('AC = AB')} et ${m(`\\widehat{BAC} = ${ang}^\\circ`)}.` });
    items.push({ what: 'step:0', js: String(k), expect: k }, { what: 'base', js: `(180-${ang})/2`, expect: (180 - ang) / 2 }, { what: 'ac', js: `${s}`, expect: s });
    steps.push(step(`b) ${m('AC')} et ${m('\\widehat{ABC}')} ?`, [numF(m('AC ='), s, 'cm'), numF(m('\\widehat{ABC} ='), (180 - ang) / 2, '°')], 'La rotation conserve la distance à A ; les angles à la base d’un triangle isocèle sont égaux.'));
    sol.push(`a) ${m('C')} est l’image de ${m('B')} par la rotation de centre ${m('A')} : ${m(`AC = AB = ${s}\\,\\mathrm{cm}`)}, isocèle en ${m('A')}, avec ${m(`\\widehat{BAC} = ${ang}^\\circ`)}. ${k === 0 ? 'Les angles à la base valent (180 − 60) ÷ 2 = 60° : équilatéral.' : k === 2 ? 'Angle droit en A : rectangle isocèle.' : 'Isocèle, sans plus.'}`, `b) ${m(`AC = ${s}\\,\\mathrm{cm}`)} ; ${m(`\\widehat{ABC} = \\dfrac{180^\\circ - ${ang}^\\circ}{2} = ${D((180 - ang) / 2)}^\\circ`)}.`);
    return { title: 'Rotation et triangle.', statement: `${m(`AB = ${s}\\,\\mathrm{cm}`)}.`, steps, solution: sol, answer: `${OPT[k]} ; ${s} cm ; ${Dt((180 - ang) / 2)}°`, key: `e|${s}|${ang}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== trouver l'erreur
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s71, links: [LINKS.s2, LINKS.s62, LINKS.s23, LINKS.s3],
  desc: 'Symétrique « en biais », aire × k, axes d’un parallélogramme, image d’une droite, longueur négative.',
  example: 'k = 3 : \\text{ aire} \\times 9',
  generate(rng: Rng) {
    const nm = rng.pick(['Lou', 'Sami', 'Inès', 'Hugo', 'Maël', 'Nora', 'Tom', 'Jade', 'Rayan', 'Léna']), v = rng.int(0, 4), items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    let st: Rich, key: string, ans: Rich;
    if (v === 0) {
      const d = rng.int(15, 60) / 10, dd = Dt(d);
      st = `« Pour construire le symétrique de ${m('M')} par rapport à ${m('(d)')}, j’ai placé ${m("M'")} de l’autre côté de ${m('(d)')}, à ${dd} cm de la droite, un peu plus loin à droite. »`;
      steps.push({ prompt: 'Qu’est-ce qui ne va pas ?', answer: shuffledChoice(rng, `${m("[MM']")} doit être perpendiculaire à ${m('(d)')}.`, [['La distance à la droite devrait doubler.', 'Non : même distance de part et d’autre.'], [`${m("M'")} devrait être du même côté.`, 'Non : de l’autre côté.']]), hint: 'L’axe est la médiatrice de [MM′].' });
      sol.push(`${m("M'")} doit être sur la perpendiculaire à ${m('(d)')} passant par ${m('M')}, à ${dd} cm de l’autre côté : ${m('(d)')} est la médiatrice de ${m("[MM']")}.`); key = `0|${d}`; ans = 'perpendiculaire';
    } else if (v === 1) {
      const k = rng.pick([2, 3, 4, 5, 1.5, 2.5]), a = rng.pick([4, 6, 8, 10, 12, 20]);
      st = `« Une homothétie de rapport ${m(D(k))} transforme une figure d’aire ${m(`${a}\\,\\mathrm{cm}^2`)} en une figure d’aire ${m(`${D(k * a)}\\,\\mathrm{cm}^2`)}. »`;
      items.push({ what: 'A', js: `${k}**2*${a}`, expect: k * k * a });
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: shuffledChoice(rng, `Les aires sont multipliées par ${m('k^2')}, pas par ${m('k')}.`, [['Une homothétie conserve les aires.', 'Seules les isométries conservent les aires.'], [`Il faut diviser par ${m('k')}.`, 'Le rapport agrandit ici.']]), hint: 'Un carré de côté 1 agrandi 2 fois contient 4 carrés.' });
      steps.push(step('b) Bonne aire ?', [numF('', k * k * a, 'cm²')], `${m(`k^2 = ${D(k * k)}`)}.`));
      sol.push(`Les aires sont multipliées par ${m(`k^2 = ${D(k * k)}`)} : ${m(`${D(k * k)} \\times ${a} = ${D(k * k * a)}\\,\\mathrm{cm}^2`)}.`); key = `1|${k}|${a}`; ans = `${Dt(k * k * a)} cm²`;
    } else if (v === 2) {
      const n = rng.pick(['ABCD', 'EFGH', 'MNPQ', 'RSTU', 'IJKL', 'KLMN', 'PQRS', 'BCDE', 'DEFG', 'FGHI', 'LMNP', 'STUV', 'ACEG', 'BDFH', 'UVWX', 'WXYZ']);
      st = `« Le parallélogramme ${m(n)} a deux axes de symétrie : ses diagonales. »`;
      steps.push({ prompt: 'a) Vrai ?', answer: fixedChoice(['Oui', 'Non, en général il n’a aucun axe'], 1, ['Plie un parallélogramme quelconque le long d’une diagonale : les moitiés ne se superposent pas.', null], 2), hint: 'Plie-le en pensée le long d’une diagonale.' });
      steps.push({ prompt: 'b) Qu’a-t-il à coup sûr ?', answer: fixedChoice(['Un centre de symétrie', 'Un axe de symétrie', 'Rien'], 0, [null, 'Seulement si c’est un rectangle ou un losange.', 'Le point d’intersection des diagonales…'], 2), hint: 'Ses diagonales se coupent en leur milieu.' });
      sol.push('Faux en général : un parallélogramme quelconque n’a aucun axe de symétrie (sauf rectangle ou losange).', 'Il a un centre de symétrie : le point d’intersection de ses diagonales.'); key = `2|${n}`; ans = 'aucun axe ; un centre';
    } else if (v === 3) {
      const t = rng.pick(['symétrie centrale', 'translation']), [X, Y] = rng.shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'P', 'R', 'S', 'T']).slice(0, 2);
      st = `« Par une ${t}, l’image de la droite ${m(`(${X}${Y})`)} est une droite perpendiculaire à ${m(`(${X}${Y})`)}. »`;
      steps.push({ prompt: 'Corrige :', answer: fixedChoice([`Une droite parallèle à (${X}${Y})`, 'Une droite sécante quelconque', 'Un point'], 0, [null, 'L’image d’une droite par une symétrie centrale ou une translation lui est parallèle.', 'L’image d’une droite est une droite.'], 2), hint: 'Pense au parallélogramme ABA′B′.' });
      sol.push(`L’image d’une droite par une ${t} est une droite parallèle (éventuellement confondue).`); key = `3|${t}|${X}${Y}`; ans = 'parallèle';
    } else {
      const k = rng.pick([-2, -3, -0.5, -1.5, -2.5]), l = rng.int(2, 9);
      st = `« Homothétie de rapport ${m(D(k))} : un segment de ${l} cm a pour image un segment de ${m(D(k * l))} cm. »`;
      items.push({ what: 'l', js: `Math.abs(${k})*${l}`, expect: Math.abs(k) * l });
      steps.push(step('Longueur correcte de l’image ?', [numF('', Math.abs(k) * l, 'cm')], 'Une longueur n’est jamais négative : on multiplie par −k.'));
      sol.push(`Le signe indique seulement que l’image est de l’autre côté du centre : ${m(`${D(-k)} \\times ${l} = ${D(-k * l)}\\,\\mathrm{cm}`)}.`); key = `4|${k}|${l}`; ans = `${Dt(-k * l)} cm`;
    }
    steps.forEach((s, i) => { if (s.answer.kind === 'choice') items.push({ what: `step:${i}`, js: String(corr(s)), expect: corr(s) }); });
    return { title: 'Trouve l’erreur.', statement: `${nm} écrit : ${st}`, steps, solution: sol, answer: ans, key, data: { kind: 'js', items } };
  },
};
