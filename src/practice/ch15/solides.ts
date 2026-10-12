/** Chapitre 15 : solides, perspective cavalière, patrons, vues. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { fixedChoice, mist } from '../engine/build';
import { LINKS, m, D, Dt, step, numF, approxF, safe, ar, q, type Q, hexominoes, fold, netSvg, planSvg, type Item, type Cell } from './common';

const POLY = ['', '', '', 'triangulaire', 'carrée', 'pentagonale', 'hexagonale', 'heptagonale', 'octogonale', '', 'décagonale', '', 'dodécagonale'];
// ===================================================================== faces, arêtes, sommets
export const solides: Generator = {
  id: 'solides', title: 'Faces, arêtes, sommets', stars: 1, levels: [1, 2], course: LINKS.s11, links: [LINKS.s12],
  desc: 'Compter faces, arêtes et sommets d’un prisme ou d’une pyramide ; ★★ retrouver le solide, relation d’Euler, solides de révolution.',
  example: '\\text{pyramide à base hexagonale : } 7,\\ 12,\\ 7',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const NS = [3, 4, 5, 6, 7, 8, 10, 12], prFirst = rng.chance(0.5), n1 = rng.pick(NS), n2 = rng.pick(NS);
      const solids: [boolean, number][] = prFirst ? [[false, n1], [true, n2]] : [[true, n1], [false, n2]];
      solids.forEach(([pyr, n], j) => {
        const [F, A, S] = pyr ? [n + 1, 2 * n, n + 1] : [n + 2, 3 * n, 2 * n], nom = `${pyr ? 'une pyramide' : 'un prisme droit'} à base ${POLY[n]}`;
        items.push({ what: `F${j}`, js: pyr ? `${n}+1` : `${n}+2`, expect: F }, { what: `A${j}`, js: pyr ? `2*${n}` : `3*${n}`, expect: A }, { what: `S${j}`, js: pyr ? `${n}+1` : `2*${n}`, expect: S });
        steps.push(step(`${'ab'[j]}) Faces, arêtes et sommets d’${nom.replace(/^une? /, '').replace(/^/, pyr ? 'une ' : 'un ')} ?`, [numF('Faces :', F), numF('Arêtes :', A), numF('Sommets :', S)], pyr ? `La base a ${n} côtés : une face latérale par côté, plus la base ; une arête latérale par sommet de la base.` : `Deux bases de ${n} côtés et ${n} faces latérales.`, [{ on: 'numAll', values: pyr ? [q(n + 2), q(3 * n), q(2 * n)] : [q(n + 1), q(2 * n), q(n + 1)], msg: pyr ? 'Ça, ce sont les nombres d’un prisme : une pyramide n’a qu’une base.' : 'Ça, ce sont les nombres d’une pyramide : un prisme a deux bases.' }]));
        sol.push(`${'ab'[j]}) ` + (pyr ? `Base à ${n} côtés : ${n} faces latérales + la base = ${m(String(F))} faces ; ${n} arêtes de base + ${n} arêtes latérales = ${m(String(A))} arêtes ; ${n} sommets de base + le sommet = ${m(String(S))} sommets.` : `Deux bases + ${n} faces latérales = ${m(String(F))} faces ; ${n} arêtes par base et ${n} arêtes latérales = ${m(String(A))} arêtes ; ${n} sommets par base = ${m(String(S))} sommets.`) + ` Contrôle (Euler) : ${m(`${F} + ${S} - ${A} = 2`)}.`);
      });
      return { title: 'Compter.', statement: '', steps, solution: sol, answer: steps.map((_, j) => items.slice(3 * j, 3 * j + 3).map((i) => i.expect).join(' ; ')).join(' | '), key: `${prFirst}|${n1}|${n2}`, data: { kind: 'js', items } };
    }
    const v = rng.int(0, 2);
    if (v === 0) {
      const n = rng.int(4, 24), pyr = rng.chance(0.5), A = pyr ? 2 * n : 3 * n, F = pyr ? n + 1 : n + 2;
      items.push({ what: 'n', js: `${A}/${pyr ? 2 : 3}`, expect: n }, { what: 'F', js: `${A}/${pyr ? 2 : 3}+${pyr ? 1 : 2}`, expect: F });
      steps.push(step(`a) ${pyr ? 'Une pyramide' : 'Un prisme droit'} a ${A} arêtes. Combien de côtés a sa base ?`, [numF('', n)], pyr ? 'Pyramide : 2n arêtes.' : 'Prisme : 3n arêtes.', mist(q(n), [[pyr || A % 2 ? null : q(A / 2), 'Un prisme a 3n arêtes (n par base et n latérales).'], [pyr && A % 3 === 0 ? q(A / 3) : null, 'Une pyramide a 2n arêtes.']])));
      steps.push(step('b) Combien de faces ?', [numF('', F)], pyr ? 'n + 1.' : 'n + 2.'));
      sol.push(`a) ${pyr ? `${m(`2n = ${A}`)}` : `${m(`3n = ${A}`)}`}, donc ${m(`n = ${n}`)} : base à ${n} côtés${POLY[n] ? ` (${POLY[n]})` : ''}.`, `b) ${m(`${n} + ${pyr ? 1 : 2} = ${F}`)} faces.`);
      return { title: 'Retrouver le solide.', statement: '', steps, solution: sol, answer: `${n} ; ${F}`, key: `r|${n}|${pyr}`, data: { kind: 'js', items } };
    }
    if (v === 1) {
      const n = rng.int(3, 15), fam = rng.int(0, 3), [F, S] = [[n + 2, 2 * n], [n + 1, n + 1], [2 * n, n + 2], [2 * n + 2, 2 * n]][fam], A = F + S - 2;
      items.push({ what: 'A', js: `${F}+${S}-2`, expect: A });
      steps.push(step(`Un polyèdre (sans trou) a ${F} faces et ${S} sommets. Combien a-t-il d’arêtes ?`, [numF('', A)], `Relation d’Euler : faces + sommets − arêtes = 2.`, mist(q(A), [[q(F + S + 2), 'Faces + sommets − arêtes = 2, donc arêtes = faces + sommets − 2.']])));
      sol.push(`Relation d’Euler : ${m(`${F} + ${S} - A = 2`)}, donc ${m(`A = ${F} + ${S} - 2 = ${A}`)}.`);
      return { title: 'Relation d’Euler.', statement: '', steps, solution: sol, answer: String(A), key: `e|${F}|${S}|${fam}`, data: { kind: 'js', items } };
    }
    const k = rng.int(0, 2), a = rng.int(2, 12), b = rng.int(2, 12);
    if (a === b) return solides.generate(rng, level);
    const OPT = ['Un cylindre', 'Un cône', 'Une boule'];
    const txt = [`un rectangle de ${a} cm sur ${b} cm autour de son côté de ${a} cm`, `un triangle rectangle dont les côtés de l’angle droit mesurent ${a} cm et ${b} cm, autour du côté de ${a} cm`, `un demi-disque de diamètre ${2 * b} cm autour de ce diamètre`][k];
    steps.push({ prompt: `a) On fait tourner ${txt}. Quel solide obtient-on ?`, answer: fixedChoice(OPT, k, ['Un rectangle donne un cylindre.', 'Un triangle rectangle donne un cône.', 'Un demi-disque donne une boule.'], 2), hint: 'Imagine la figure qui tourne autour de l’axe.' });
    items.push({ what: 'step:0', js: String(k), expect: k }, { what: 'r', js: `${b}`, expect: b });
    if (k < 2) { items.push({ what: 'h', js: `${a}`, expect: a }); steps.push(step('b) Hauteur et rayon ?', [numF('Hauteur :', a, 'cm'), numF('Rayon :', b, 'cm')], 'Le côté sur l’axe donne la hauteur ; l’autre donne le rayon.', [{ on: 'numAll', values: [q(b), q(a)], msg: 'Le côté posé sur l’axe est la hauteur.' }])); }
    else steps.push(step('b) Rayon de la boule ?', [numF('', b, 'cm')], 'Moitié du diamètre.', mist(q(b), [[q(2 * b), 'C’est le diamètre : le rayon en est la moitié.']])));
    sol.push(`a) ${OPT[k]}.`, k < 2 ? `b) Hauteur ${m(`${a}\\,\\mathrm{cm}`)} (le côté sur l’axe), rayon ${m(`${b}\\,\\mathrm{cm}`)}.` : `b) Rayon ${m(`${2 * b} \\div 2 = ${b}\\,\\mathrm{cm}`)}.`);
    return { title: 'Solide de révolution.', statement: '', steps, solution: sol, answer: `${OPT[k]}`, key: `v|${k}|${a}|${b}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== perspective cavalière
export const cavaliere: Generator = {
  id: 'cavaliere', title: 'Perspective cavalière', stars: 1, levels: [1, 2], course: LINKS.s21,
  desc: 'Longueurs à tracer (coefficient 0,5), longueurs réelles ; ★★ vrai sur le dessin ou dans la réalité ?',
  example: '\\text{fuyante : } 4 \\times 0{,}5 = 2\\,\\mathrm{cm}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const L = rng.int(3, 9), P = rng.int(2, 9), H = rng.int(2, 8), f = rng.int(3, 12) / 2, av = rng.int(2, 9);
      items.push({ what: 'L', js: `${L}`, expect: L }, { what: 'H', js: `${H}`, expect: H }, { what: 'P', js: `${P}*0.5`, expect: P / 2 }, { what: 'f', js: `${f}/0.5`, expect: 2 * f }, { what: 'av', js: `${av}`, expect: av });
      steps.push(step(`a) Pavé de ${L} cm de largeur, ${P} cm de profondeur et ${H} cm de hauteur, face avant de ${L} cm sur ${H} cm. Longueurs à tracer ?`, [numF('Largeur :', L, 'cm'), numF('Hauteur :', H, 'cm'), numF('Fuyantes :', P / 2, 'cm')], 'Face avant en vraie grandeur ; fuyantes réduites de moitié.', [{ on: 'numAll', values: [q(L), q(H), q(P)], msg: 'Les fuyantes sont réduites : multiplie la profondeur par 0,5.' }, { on: 'numAll', values: [q(L, 2), q(H, 2), q(P, 2)], msg: 'Seules les fuyantes sont réduites : la face avant est en vraie grandeur.' }]));
      steps.push(step(`b) Sur un autre dessin, une fuyante mesure ${Dt(f)} cm et une arête de la face avant ${av} cm. Longueurs réelles ?`, [numF('Fuyante :', 2 * f, 'cm'), numF('Face avant :', av, 'cm')], 'Une fuyante dessinée est la moitié de la vraie longueur.', [{ on: 'numAll', values: [q(Math.round(f * 500), 1000), q(av)], msg: 'Pour retrouver la vraie longueur, on divise par 0,5 (on double).' }]));
      sol.push(`a) Face avant en vraie grandeur : ${m(`${L}\\,\\mathrm{cm}`)} et ${m(`${H}\\,\\mathrm{cm}`)} ; fuyantes : ${m(`${P} \\times 0{,}5 = ${D(P / 2)}\\,\\mathrm{cm}`)}.`, `b) ${m(`${D(f)} \\div 0{,}5 = ${D(2 * f)}\\,\\mathrm{cm}`)} ; la face avant est en vraie grandeur : ${m(`${av}\\,\\mathrm{cm}`)}.`);
      return { title: 'Dessiner un pavé.', statement: 'Perspective cavalière : fuyantes à 45°, coefficient 0,5.', steps, solution: sol, answer: `${L} ; ${H} ; ${Dt(P / 2)} ; ${Dt(2 * f)} ; ${av}`, key: `${L}|${P}|${H}|${f}|${av}`, data: { kind: 'js', items } };
    }
    const nm = rng.pick(['ABCDEFGH', 'IJKLMNOP', 'MNPQRSTU']).split(''), [A, B, C, , E, F, G] = nm;
    const ST: [Rich, number, number, Rich][] = [
      [`${m(`${A}${B} = ${B}${C}`)}`, 1, 0, `${m(`[${B}${C}]`)} est une fuyante : dessinée deux fois plus courte.`],
      [`l’angle ${m(`\\widehat{${A}${B}${F}}`)} est droit`, 0, 0, 'Face avant en vraie grandeur : l’angle droit est conservé.'],
      [`l’angle ${m(`\\widehat{${A}${B}${C}}`)} est droit`, 1, 0, 'Sur le dessin il mesure 135° ; dans le cube c’est un angle droit.'],
      [`${m(`(${A}${E})`)} et ${m(`(${C}${G})`)} sont parallèles`, 0, 0, 'Le parallélisme est conservé par la perspective cavalière.'],
      [`la face ${m(`${B}${C}${G}${F}`)} est un carré`, 1, 0, 'Elle est dessinée en parallélogramme, mais c’est un carré dans le cube.'],
      [`${m(`${A}${B} = ${A}${E}`)}`, 0, 0, 'Deux arêtes de la face avant : vraie grandeur.'],
    ];
    const picks = rng.shuffle(ST.map((_, i) => i)).slice(0, 3), OPT = ['Vrai sur le dessin et en réalité', 'Faux sur le dessin, vrai en réalité', 'Faux dans les deux cas'];
    picks.forEach((i, j) => { const [t, dess, , why] = ST[i], k = dess === 0 ? 0 : 1; steps.push({ prompt: `${'abc'[j]}) ${t[0].toUpperCase() + t.slice(1)}.`, answer: fixedChoice(OPT, k, [why, why, 'Dans un cube, c’est vrai.'], 2), hint: 'Seules la face avant et les faces parallèles sont en vraie grandeur ; le parallélisme est toujours conservé.' }); items.push({ what: `step:${j}`, js: String(k), expect: k }); sol.push(`${'abc'[j]}) ${OPT[k]} : ${why[0].toLowerCase()}${why.slice(1)}`); });
    return { title: 'Sur le dessin ou dans la réalité ?', statement: `On dessine un cube ${m(nm.join(''))} en perspective cavalière, face avant ${m(`${A}${B}${F}${E}`)}. Pour chaque affirmation :`, steps, solution: sol, answer: picks.map((i) => (ST[i][1] ? 'faux/vrai' : 'vrai/vrai')).join(' ; '), key: `${nm[0]}|${picks.join(',')}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== patrons de cube
const HEX = hexominoes(), NETS = HEX.filter((c) => fold(c)), NONETS = HEX.filter((c) => !fold(c) && Math.max(...c.map((x) => x[0])) <= 5 && Math.max(...c.map((x) => x[1])) <= 4);
const why = (c: Cell[]): Rich => {
  const s = new Set(c.map((x) => x.join(',')));
  if (c.some(([x, y]) => s.has(`${x + 1},${y}`) && s.has(`${x},${y + 1}`) && s.has(`${x + 1},${y + 1}`))) return 'il contient un bloc de 2 × 2 carrés : au pliage, deux carrés se superposent.';
  const rows = new Map<number, number[]>(), cols = new Map<number, number[]>();
  c.forEach(([x, y]) => { rows.set(y, [...(rows.get(y) ?? []), x]); cols.set(x, [...(cols.get(x) ?? []), y]); });
  const run = (v: number[]) => { v.sort((a, b) => a - b); let best = 1, cur = 1; for (let i = 1; i < v.length; i++) { cur = v[i] === v[i - 1] + 1 ? cur + 1 : 1; best = Math.max(best, cur); } return best; };
  if ([...rows.values(), ...cols.values()].some((v) => run(v) >= 5)) return 'une rangée de 5 carrés fait plus que le tour du cube : le 5e revient sur le 1er.';
  return 'en le pliant, deux carrés arrivent à la même place.';
};
export const patron: Generator = {
  id: 'patron', title: 'Patrons du cube', stars: 1, levels: [1, 2, 3], course: LINKS.s32,
  desc: 'Est-ce un patron de cube ? ★★ faces opposées ; ★★★ patron d’un dé (faces opposées de somme 7).',
  example: '\\text{rangée de 5 carrés : jamais un patron}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const ok = rng.chance(0.5), cells = rng.pick(ok ? NETS : NONETS), k = ok ? 0 : 1;
      steps.push({ prompt: 'Cet assemblage de six carrés est-il un patron de cube ?', answer: fixedChoice(['Oui', 'Non'], k, [`Non : ${ok ? '' : why(cells)}`, 'Plie-le mentalement : chaque carré trouve une place différente.']), hint: 'Choisis un carré pour le dessous et replie les autres un par un. Deux carrés séparés par un carré dans une rangée sont opposés.' });
      items.push({ what: 'step:0', js: `(${JSON.stringify(cells)}).length===6?${k}:-1`, expect: k });
      sol.push(ok ? 'Oui : en repliant les carrés autour de l’un d’eux pris comme dessous, les six carrés occupent six places différentes (dessous, dessus, avant, arrière, gauche, droite).' : `Non : ${why(cells)}`);
      return { title: 'Patron ou pas ?', statement: '', figure: netSvg(cells, null, `Assemblage de six carrés : ${cells.map((c) => `(${c.join(',')})`).join(' ')}`), steps, solution: sol, answer: ok ? 'oui' : 'non', key: `1|${JSON.stringify(cells)}`, data: { kind: 'js', items } };
    }
    const cells = rng.pick(NETS), nrm = fold(cells)!, ks = cells.map((c) => c.join(',')), opp = (i: number) => { const v = nrm.get(ks[i])!; return ks.findIndex((k) => { const w = nrm.get(k)!; return w[0] === -v[0] && w[1] === -v[1] && w[2] === -v[2]; }); };
    if (level === 2) {
      const lab = rng.shuffle(['1', '2', '3', '4', '5', '6']), p0 = rng.int(0, 5), picks = [p0, rng.pick([0, 1, 2, 3, 4, 5].filter((i) => i !== p0 && i !== opp(p0)))];
      picks.forEach((i, j) => {
        const o = opp(i), others = lab.filter((_, t) => t !== i).sort(), good = others.indexOf(lab[o]);
        steps.push({ prompt: `${'ab'[j]}) Une fois le cube plié, quelle face est opposée à la face ${lab[i]} ?`, answer: fixedChoice(others, good, others.map(() => 'Deux faces opposées ne se touchent jamais, même par un coin du patron replié.'), 2), hint: 'Dans une rangée, deux carrés séparés par un carré sont opposés ; sinon, replie mentalement.' });
        items.push({ what: `step:${j}`, js: String(good), expect: good });
        sol.push(`${'ab'[j]}) La face ${lab[o]} est opposée à la face ${lab[i]}.`);
      });
      return { title: 'Faces opposées.', statement: 'Ce patron de cube est numéroté.', figure: netSvg(cells, lab, `Patron de cube numéroté : ${cells.map((c, i) => `${lab[i]} en (${c.join(',')})`).join(', ')}`), steps, solution: sol, answer: sol.join(' '), key: `2|${ks.join(';')}|${lab.join('')}|${picks}`, data: { kind: 'js', items } };
    }
    // ★★★ : dé — trois faces numérotées (une par paire), on cherche le nombre d'une face vide
    const shown = [0, 1, 2, 3, 4, 5].filter((i) => opp(i) > i).map((i) => (rng.chance(0.5) ? i : opp(i))), lab: string[] = Array(6).fill('');
    const vals = [rng.pick([1, 6]), rng.pick([2, 5]), rng.pick([3, 4])], perm = rng.shuffle([0, 1, 2]);
    shown.forEach((f, t) => { lab[f] = String(vals[perm[t]]); });
    const blanks = [0, 1, 2, 3, 4, 5].filter((i) => !lab[i]), target = rng.pick(blanks), src = opp(target), x = 7 - Number(lab[src]);
    blanks.forEach((b2) => { lab[b2] = b2 === target ? '?' : ''; });
    const wrong = shown.filter((f) => f !== src).map((f) => 7 - Number(lab[f]));
    items.push({ what: 'x', js: `7-${lab[src]}`, expect: x });
    steps.push(step('Sur un dé, deux faces opposées ont pour somme 7. Quel nombre faut-il écrire sur la face « ? » ?', [numF('', x)], 'Cherche la face opposée à « ? » : elle ne la touche pas une fois le cube plié (dans une rangée, deux carrés séparés par un carré sont opposés).', mist(q(x), [...wrong.map((w) => [q(w), 'Tu as complété la face opposée à une autre face : cherche celle qui est opposée à « ? ».'] as [Q, string]), [q(7 - x), 'C’est le nombre de la face opposée ; « ? » porte le complément à 7.']])));
    sol.push(`Une fois le patron plié, la face « ? » est opposée à la face ${lab[src]}. Donc « ? » porte ${m(`7 - ${lab[src]} = ${x}`)}.`);
    return { title: 'Le patron d’un dé.', statement: 'On fabrique un dé avec ce patron ; trois faces sont déjà numérotées.', figure: netSvg(cells, lab, `Patron de dé : ${cells.map((c, i) => `${lab[i] || 'vide'} en (${c.join(',')})`).join(', ')}`), steps, solution: sol, answer: String(x), key: `3|${ks.join(';')}|${lab.join(',')}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== vues et plan coté
export const vues: Generator = {
  id: 'vues', title: 'Vues et plan coté', stars: 1, levels: [1, 2], course: LINKS.s4,
  desc: 'Compter les cubes d’un assemblage avec son plan coté, lire la vue de face et la vue de droite.',
  example: '3 + 1 + 2 + 1 = 7 \\text{ cubes}',
  generate(rng: Rng, level: Level) {
    const R = 2, C = level === 1 ? rng.int(2, 3) : 3, h = Array.from({ length: R }, () => Array.from({ length: C }, () => rng.int(level === 1 ? 1 : 0, 4)));
    if (h.flat().filter((v) => v > 0).length < 3) return vues.generate(rng, level);
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const N = h.flat().reduce((s, v) => s + v, 0), face = Array.from({ length: C }, (_, c) => Math.max(h[0][c], h[1][c])), droite = [Math.max(...h[1]), Math.max(...h[0])];
    items.push({ what: 'N', js: `${JSON.stringify(h)}.flat().reduce((a,b)=>a+b,0)`, expect: N });
    steps.push(step('a) Combien de cubes compte l’assemblage ?', [numF('', N)], 'Additionne les hauteurs de toutes les piles.', mist(q(N), [[q(face.reduce((s, v) => s + v, 0)), 'Tu n’as compté que les cubes vus de face : des cubes sont cachés derrière.'], [q(h.flat().filter((v) => v > 0).length), 'Ça, c’est le nombre de piles : additionne leurs hauteurs.']])));
    face.forEach((v, c) => items.push({ what: `f${c}`, js: `Math.max(${h[0][c]},${h[1][c]})`, expect: v }));
    steps.push(step('b) Vue de face : hauteur de chaque colonne, de gauche à droite ?', face.map((v, c) => numF(`Colonne ${c + 1} :`, v)), 'Dans chaque colonne, on voit la pile la plus haute (devant ou derrière).', [{ on: 'numAll' as const, values: h[1].map((v) => q(v)), msg: 'Tu n’as regardé que la rangée de devant : une pile plus haute derrière se voit au-dessus.' }].filter((mk) => mk.values.some((v, i) => v.n !== face[i]))));
    if (level === 2) { items.push({ what: 'd0', js: `Math.max(...${JSON.stringify(h[1])})`, expect: droite[0] }, { what: 'd1', js: `Math.max(...${JSON.stringify(h[0])})`, expect: droite[1] }); steps.push(step('c) Vue de droite : hauteur de chaque colonne, de gauche à droite ?', [numF('Gauche (devant) :', droite[0]), numF('Droite (derrière) :', droite[1])], 'Vue de droite : la rangée de devant apparaît à gauche ; dans chaque rangée, on voit la pile la plus haute.', droite[0] !== droite[1] ? [{ on: 'numAll', values: [q(droite[1]), q(droite[0])], msg: 'Regardé depuis la droite, le devant est à gauche.' }] : [])); }
    sol.push(`a) ${m(`${h.flat().filter((v) => v > 0).join(' + ')} = ${N}`)} cubes.`, `b) Vue de face : ${face.map((v, c) => `colonne ${c + 1} : ${m(`\\max(${h[0][c]}\\,;${h[1][c]}) = ${v}`)}`).join(' ; ')}.`);
    if (level === 2) sol.push(`c) Vue de droite : devant (à gauche) ${m(String(droite[0]))}, derrière (à droite) ${m(String(droite[1]))}.`);
    return { title: 'Plan coté.', statement: 'Voici la vue de dessus d’un assemblage de cubes ; chaque case indique la hauteur de la pile (case vide : pas de pile).', figure: planSvg(h, `Plan coté : derrière ${h[0].join(', ')} ; devant ${h[1].join(', ')}`), steps, solution: sol, answer: `${N} cubes ; face ${face.join(', ')}`, key: `${level}|${JSON.stringify(h)}`, data: { kind: 'js', items } };
  },
};
void approxF; void safe; void ar;
