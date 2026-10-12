/** Chapitre 15 : sections, repérage (pavé, Terre), patrons et aires, trouver l'erreur. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { fixedChoice, shuffledChoice, mist } from '../engine/build';
import { LINKS, m, D, Dt, grp, step, corr, numF, approxF, safe, ar, q, paveSvg, type Item } from './common';

const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29], [15, 20, 25], [10, 24, 26], [9, 40, 41], [12, 35, 37]];
const cm = (v: number) => `${D(v)}\\,\\mathrm{cm}`;

// ===================================================================== sections
export const sections: Generator = {
  id: 'sections', title: 'Sections de solides', stars: 1, levels: [1, 2, 3], course: LINKS.s51, links: [LINKS.s52, LINKS.s53],
  desc: 'Pavé et cylindre ; ★★ pyramide ou cône (réduction, aire × k²), sphère avec Pythagore ; ★★★ section diagonale d’un pavé.',
  example: 'k = \\dfrac{3}{9} = \\dfrac{1}{3}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      if (rng.chance(0.5)) {
        const L = rng.int(4, 12), P = rng.int(2, L - 1), H = rng.int(2, 10), f = rng.int(0, 2), [u, w, nom] = [[L, P, 'la face du dessous'], [L, H, 'la face avant'], [P, H, 'une face de côté']][f] as [number, number, string];
        const big = Math.max(u, w), small = Math.min(u, w);
        if (big === small) return sections.generate(rng, level);
        steps.push({ prompt: 'a) Nature de la section ?', answer: fixedChoice(['Un rectangle', 'Un triangle', 'Un disque'], 0, [null, 'Un plan parallèle à une face coupe le pavé selon un rectangle.', 'Le pavé n’a pas de face courbe.'], 2), hint: 'Plan parallèle à une face.' });
        items.push({ what: 'step:0', js: '0', expect: 0 }, { what: 'big', js: `Math.max(${u},${w})`, expect: big }, { what: 'small', js: `Math.min(${u},${w})`, expect: small });
        steps.push(step('b) Dimensions de la section ?', [numF('Longueur :', big, 'cm'), numF('Largeur :', small, 'cm')], `La section est identique à ${nom}.`));
        sol.push(`a) Un rectangle identique à ${nom}.`, `b) ${m(cm(big))} sur ${m(cm(small))}.`);
        return { title: 'Couper un pavé.', statement: `Un pavé droit mesure ${m(cm(L))} de long, ${m(cm(P))} de large et ${m(cm(H))} de haut. On le coupe par un plan parallèle à ${nom}.`, steps, solution: sol, answer: `rectangle ${big} × ${small}`, key: `p|${L}|${P}|${H}|${f}`, data: { kind: 'js', items } };
      }
      const r = rng.int(2, 12), h = rng.int(3, 20), perp = rng.chance(0.5);
      if (perp) {
        const A = Math.PI * r * r; if (!safe(A, 1)) return sections.generate(rng, level);
        steps.push({ prompt: 'a) Nature de la section ?', answer: fixedChoice(['Un disque', 'Un rectangle', 'Un triangle'], 0, [null, 'Perpendiculaire à l’axe : on coupe « en rondelle ».', 'Un cylindre ne donne pas de triangle.'], 2), hint: 'Coupe une boîte de conserve horizontalement.' });
        items.push({ what: 'step:0', js: '0', expect: 0 }, { what: 'A', js: `Math.PI*${r}**2`, expect: A });
        steps.push(step('b) Aire de la section (au dixième) ?', [approxF('', A, 1, 'cm²')], `Disque de même rayon que la base : ${m('\\pi r^2')}.`, mist(q(Math.round(2 * Math.PI * r * 10), 10), [[q(Math.round(2 * Math.PI * r * 10), 10), 'Ça, c’est le périmètre : l’aire est π × r².']])));
        sol.push(`a) Un disque de même rayon que la base, ${m(cm(r))}.`, `b) ${m(`\\pi \\times ${r}^2 = ${r * r}\\pi \\approx ${ar(A, 1)}\\,\\mathrm{cm}^2`)}.`);
      } else {
        steps.push({ prompt: 'a) Nature de la section ?', answer: fixedChoice(['Un disque', 'Un rectangle', 'Un triangle'], 1, ['Un plan qui contient l’axe donne un rectangle.', null, 'Un cylindre ne donne pas de triangle.'], 2), hint: 'Coupe une boîte de conserve verticalement, par le milieu.' });
        items.push({ what: 'step:0', js: '1', expect: 1 }, { what: 'd', js: `2*${r}`, expect: 2 * r }, { what: 'h', js: `${h}`, expect: h });
        steps.push(step('b) Dimensions du rectangle ?', [numF('Largeur (diamètre) :', 2 * r, 'cm'), numF('Hauteur :', h, 'cm')], 'Le plan contient l’axe : un côté est un diamètre, l’autre la hauteur.', [{ on: 'numAll', values: [q(r), q(h)], msg: 'Le plan passe par l’axe : la largeur est le diamètre, pas le rayon.' }]));
        sol.push('a) Un rectangle.', `b) Largeur : le diamètre ${m(`2 \\times ${r} = ${2 * r}\\,\\mathrm{cm}`)} ; hauteur : ${m(cm(h))}.`);
      }
      return { title: 'Couper un cylindre.', statement: `Un cylindre a pour rayon ${m(cm(r))} et pour hauteur ${m(cm(h))}. On le coupe par un plan ${perp ? 'perpendiculaire à l’axe' : 'qui contient l’axe'}.`, steps, solution: sol, answer: sol.join(' '), key: `c|${r}|${h}|${perp}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      if (rng.chance(0.55)) {
        const H = rng.pick([6, 8, 9, 10, 12, 15, 16, 18, 20, 24]), divs = [2, 3, 4, 5, 6].filter((d) => H % d === 0), dd = rng.pick(divs), d = (H / dd) * rng.int(1, dd - 1), k = d / H, cone = rng.chance(0.4);
        const side = dd * rng.int(Math.ceil(3 / dd), Math.floor(16 / dd)), s2 = (side * d) / H;
        if (!Number.isInteger(s2 * 10)) return sections.generate(rng, level);
        const aBase = side * side, aSec = s2 * s2;
        items.push({ what: 's', js: `${side}*${d}/${H}`, expect: s2 }, ...(cone ? [] : [{ what: 'a', js: `(${side}*${d}/${H})**2`, expect: aSec }]));
        if (cone) {
          steps.push(step('Rayon de la section ?', [numF('', s2, 'cm')], `Réduction de la base, de coefficient ${m(`\\dfrac{${d}}{${H}}`)}.`, mist(q(Math.round(s2 * 1000), 1000), [[q(Math.round(side * (1 - k) * 1000), 1000), 'Le coefficient est la distance au SOMMET divisée par la hauteur.']])));
          sol.push(`Le plan est parallèle à la base : la section est un disque, réduction de la base de coefficient ${m(`k = \\dfrac{${d}}{${H}}`)}.`, `Rayon : ${m(`${side} \\times \\dfrac{${d}}{${H}} = ${cm(s2)}`)}.`);
          return { title: 'Couper un cône.', statement: `Un cône a pour rayon de base ${m(cm(side))} et pour hauteur ${m(cm(H))}. On le coupe par un plan parallèle à la base, à ${m(cm(d))} du sommet.`, steps, solution: sol, answer: `${Dt(s2)} cm`, key: `k|${side}|${H}|${d}`, data: { kind: 'js', items } };
        }
        steps.push(step('a) Côté de la section ?', [numF('', s2, 'cm')], `Réduction de la base, de coefficient ${m(`\\dfrac{${d}}{${H}}`)}.`, mist(q(Math.round(s2 * 1000), 1000), [[q(Math.round(side * (1 - k) * 1000), 1000), 'Le coefficient est la distance au SOMMET divisée par la hauteur.']])));
        steps.push(step('b) Aire de la section ?', [numF('', aSec, 'cm²')], 'Les aires sont multipliées par k².', mist(q(Math.round(aSec * 1000), 1000), [[q(Math.round(aBase * k * 1000), 1000), 'Les aires sont multipliées par k², pas par k.']])));
        sol.push(`Le plan est parallèle à la base : la section est un carré, réduction de la base de coefficient ${m(`k = \\dfrac{${d}}{${H}}`)}.`, `a) ${m(`${side} \\times \\dfrac{${d}}{${H}} = ${cm(s2)}`)}.`, `b) ${m(`${D(s2)}^2 = ${D(aSec)}\\,\\mathrm{cm}^2`)} (contrôle : ${m(`${aBase} \\times k^2 = ${D(aSec)}`)}).`);
        return { title: 'Couper une pyramide.', statement: `Une pyramide a pour base un carré de côté ${m(cm(side))} et pour hauteur ${m(cm(H))}. On la coupe par un plan parallèle à la base, à ${m(cm(d))} du sommet.`, steps, solution: sol, answer: `${Dt(s2)} cm ; ${Dt(aSec)} cm²`, key: `y|${side}|${H}|${d}`, data: { kind: 'js', items } };
      }
      const [a0, b0, c0] = rng.pick(TRIPLES), s = rng.pick([1, 0.5, 2]), [oh, hm, R] = rng.chance(0.5) ? [a0 * s, b0 * s, c0 * s] : [b0 * s, a0 * s, c0 * s], askR = rng.chance(0.6);
      if (askR) { items.push({ what: 'r', js: `Math.sqrt(${R}**2-${oh}**2)`, expect: hm }); steps.push(step('Rayon de la section ?', [numF('', hm, 'cm')], `Le triangle ${m('OHM')} est rectangle en ${m('H')}, d’hypoténuse ${m('OM')} (un rayon de la sphère).`, mist(q(Math.round(hm * 1000), 1000), [[q(Math.round((R - oh) * 1000), 1000), 'Pythagore : on soustrait les CARRÉS.'], [q(Math.round(Math.sqrt(R * R + oh * oh) * 1000), 1000), 'OM est l’hypoténuse : HM² = OM² − OH².']]))); sol.push(`Le triangle ${m('OHM')} est rectangle en ${m('H')}. Pythagore : ${m(`HM^2 = ${D(R)}^2 - ${D(oh)}^2 = ${D(R * R - oh * oh)}`)}, donc ${m(`HM = ${cm(hm)}`)}.`); }
      else { items.push({ what: 'd', js: `Math.sqrt(${R}**2-${hm}**2)`, expect: oh }); steps.push(step('À quelle distance du centre se trouve le plan ?', [numF('', oh, 'cm')], `Triangle ${m('OHM')} rectangle en ${m('H')}.`, mist(q(Math.round(oh * 1000), 1000), [[q(Math.round((R - hm) * 1000), 1000), 'Pythagore : on soustrait les CARRÉS.']]))); sol.push(`${m(`OH^2 = OM^2 - HM^2 = ${D(R)}^2 - ${D(hm)}^2 = ${D(oh * oh)}`)}, donc ${m(`OH = ${cm(oh)}`)}.`); }
      return { title: 'Couper une sphère.', statement: askR ? `Une sphère de centre ${m('O')} a pour rayon ${m(cm(R))}. On la coupe par un plan situé à ${m(cm(oh))} de ${m('O')}.` : `On coupe une sphère de rayon ${m(cm(R))} par un plan : la section est un cercle de rayon ${m(cm(hm))}.`, steps, solution: sol, answer: askR ? `${Dt(hm)} cm` : `${Dt(oh)} cm`, key: `s|${R}|${oh}|${askR}`, data: { kind: 'js', items } };
    }
    // ★★★ : section diagonale (ACGE ou ABGH)
    if (rng.chance(0.5)) {
      const [a0, b0, c0] = rng.pick(TRIPLES.filter((t) => t[2] <= 30)), ab = rng.int(3, 12);
      items.push({ what: 'ah', js: `Math.hypot(${a0},${b0})`, expect: c0 }, { what: 'A', js: `${ab}*Math.hypot(${a0},${b0})`, expect: ab * c0 });
      steps.push(step(`a) Calcule ${m('AH')}.`, [numF('', c0, 'cm')], `Le triangle ${m('ADH')} est rectangle en ${m('D')}.`, mist(q(c0), [[q(a0 + b0), 'Pythagore : on additionne les carrés.']])));
      steps.push(step(`b) Aire de la section ${m('ABGH')} ?`, [numF('', ab * c0, 'cm²')], `${m('ABGH')} est un rectangle de côtés ${m('AB')} et ${m('AH')}.`));
      sol.push(`a) ${m('ADH')} est rectangle en ${m('D')} : ${m(`AH^2 = ${a0}^2 + ${b0}^2 = ${c0 * c0}`)}, donc ${m(`AH = ${cm(c0)}`)}.`, `b) ${m('[AB]')} est perpendiculaire à la face ${m('ADHE')}, et ${m('[AB]')}, ${m('[HG]')} sont parallèles et de même longueur : ${m('ABGH')} est un rectangle. Aire : ${m(`${ab} \\times ${c0} = ${ab * c0}\\,\\mathrm{cm}^2`)}.`);
      return { title: 'Section par un plan oblique.', statement: `${m('ABCDEFGH')} est un pavé droit avec ${m(`AB = ${cm(ab)}`)}, ${m(`AD = ${cm(a0)}`)} et ${m(`AE = ${cm(b0)}`)}. On le coupe par le plan qui contient les arêtes ${m('[AB]')} et ${m('[HG]')}.`, figure: paveSvg(ab, a0, b0), steps, solution: sol, answer: `${c0} cm ; ${ab * c0} cm²`, key: `o|${a0}|${b0}|${ab}`, data: { kind: 'js', items } };
    }
    const L = rng.int(3, 10), P = rng.int(2, 9), H = rng.int(2, 10), ac = Math.hypot(L, P);
    if (Number.isInteger(ac) || !safe(ac, 1) || !safe(ac * H, 1)) return sections.generate(rng, level);
    items.push({ what: 'ac', js: `Math.sqrt(${L * L + P * P})`, expect: ac }, { what: 'A', js: `Math.sqrt(${L * L + P * P})*${H}`, expect: ac * H });
    steps.push(step(`a) ${m('AC')} (au dixième) ?`, [approxF('', ac, 1, 'cm')], `Le triangle ${m('ABC')} est rectangle en ${m('B')}.`, mist(q(L + P), [[q(L + P), 'Pythagore : on additionne les carrés, puis racine carrée.']])));
    steps.push(step(`b) Aire de la section ${m('ACGE')} (au dixième) ?`, [approxF('', ac * H, 1, 'cm²')], `Rectangle de côtés ${m('AC')} et ${m('AE')} ; garde la valeur exacte de AC dans le calcul.`));
    sol.push(`a) ${m(`AC^2 = ${L}^2 + ${P}^2 = ${L * L + P * P}`)}, donc ${m(`AC = \\sqrt{${L * L + P * P}} \\approx ${ar(ac, 1)}\\,\\mathrm{cm}`)}.`, `b) ${m('ACGE')} est un rectangle : ${m(`\\sqrt{${L * L + P * P}} \\times ${H} \\approx ${ar(ac * H, 1)}\\,\\mathrm{cm}^2`)}.`);
    return { title: 'Section diagonale d’un pavé.', statement: `${m('ABCDEFGH')} est un pavé droit avec ${m(`AB = ${cm(L)}`)}, ${m(`AD = ${cm(P)}`)} et ${m(`AE = ${cm(H)}`)}. On le coupe par le plan qui contient ${m('A')}, ${m('C')}, ${m('G')} et ${m('E')}.`, figure: paveSvg(L, P, H), steps, solution: sol, answer: `≈ ${Dt(Math.round(ac * 10) / 10)} cm ; ≈ ${Dt(Math.round(ac * H * 10) / 10)} cm²`, key: `d|${L}|${P}|${H}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== repérage
const V8: Record<string, [number, number, number]> = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] };
const EDGES = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];
const FACES: [string, string][] = [['ABCD', 'du dessous'], ['EFGH', 'du dessus'], ['ABFE', 'avant'], ['DCGH', 'arrière'], ['BCGF', 'de droite'], ['ADHE', 'de gauche']];
export const reperage: Generator = {
  id: 'reperage', title: 'Se repérer dans l’espace', stars: 1, levels: [1, 2], course: LINKS.s61, links: [LINKS.s62],
  desc: 'Coordonnées dans un pavé (abscisse, ordonnée, altitude) ; ★★ centre d’une face, latitude et longitude, distance sur un méridien.',
  example: 'G(4\\,;3\\,;2)',
  generate(rng: Rng, level: Level) {
    const L = rng.int(2, 8), P = rng.int(2, 6), H = rng.int(2, 6), dim = [L, P, H], items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const co = (v: [number, number, number]) => v.map((t, i) => t * dim[i]) as [number, number, number];
    const ct = (v: number[]) => `(${v.map(D).join('\\,;')})`;
    const ask = (label: string, v: number[], hint: Rich, extra: { on: 'numAll'; values: ReturnType<typeof q>[]; msg: Rich }[] = []) => { v.forEach((t, i) => items.push({ what: `${label}${i}`, js: String(t), expect: t })); steps.push(step(`${'abcd'[steps.length]}) Coordonnées de ${m(label)} ?`, [numF('x :', v[0]), numF('y :', v[1]), numF('z :', v[2])], hint, [...(v[0] !== v[1] ? [{ on: 'numAll' as const, values: [q(Math.round(v[1] * 1000), 1000), q(Math.round(v[0] * 1000), 1000), q(Math.round(v[2] * 1000), 1000)], msg: 'Toujours dans l’ordre : abscisse (selon AB), ordonnée (selon AD), altitude (selon AE).' }] : []), ...extra])); };
    const vx = rng.pick(['B', 'C', 'D', 'E', 'F', 'G', 'H']), cv = co(V8[vx]);
    ask(vx, cv, `Pour aller de A à ${vx} : combien selon [AB], selon [AD], vers le haut ?`);
    sol.push(`${'abcd'[0]}) ${m(`${vx}${ct(cv)}`)}.`);
    if (level === 1) {
      const e = rng.pick(EDGES), mid = co(V8[e[0]]).map((t, i) => (t + co(V8[e[1]])[i]) / 2);
      ask('I', mid, `I est le milieu de [${e}] : moyenne des coordonnées des extrémités.`);
      sol.push(`b) ${m(`${e[0]}${ct(co(V8[e[0]]))}`)} et ${m(`${e[1]}${ct(co(V8[e[1]]))}`)} : le milieu ${m('I')} a pour coordonnées les moyennes, ${m(`I${ct(mid)}`)}.`);
      const tg = rng.pick(Object.keys(V8).filter((k) => k !== vx)), tc = co(V8[tg]), names = Object.keys(V8), good = names.indexOf(tg);
      steps.push({ prompt: `c) Quel sommet a pour coordonnées ${m(ct(tc))} ?`, answer: fixedChoice(names.map(m), good, names.map(() => 'Lis dans l’ordre : abscisse, ordonnée, altitude.'), 2), hint: 'Altitude 0 : face du dessous ABCD ; altitude maximale : face du dessus EFGH.' });
      items.push({ what: 'step:2', js: String(good), expect: good });
      sol.push(`c) ${m(tg)}.`);
      return { title: 'Coordonnées dans un pavé.', statement: `Pavé ${m('ABCDEFGH')} : origine ${m('A')}, ${m(`AB = ${L}`)}, ${m(`AD = ${P}`)}, ${m(`AE = ${H}`)}.`, figure: paveSvg(L, P, H), steps, solution: sol, answer: sol.join(' '), key: `1|${dim}|${vx}|${e}|${tg}`, data: { kind: 'js', items } };
    }
    const [fn, fnom] = rng.pick(FACES), fc = [0, 1, 2].map((i) => fn.split('').reduce((s, k) => s + co(V8[k])[i], 0) / 4);
    ask('K', fc, `K est le centre de la face ${fnom} ${fn} : le milieu d’une de ses diagonales.`);
    sol.push(`b) Le centre ${m('K')} de la face ${m(fn)} est le milieu de ${m(`[${fn[0]}${fn[2]}]`)} : ${m(`K${ct(fc)}`)}.`);
    // Terre
    const sameHemi = rng.chance(0.5), l1 = rng.int(5, 80), l2 = sameHemi ? rng.int(5, 80) : rng.int(5, 80), dl = sameHemi ? Math.abs(l1 - l2) : l1 + l2;
    if (dl === 0) return reperage.generate(rng, level);
    const dist = (dl / 360) * 40000;
    items.push({ what: 'dist', js: `${dl}/360*40000`, expect: dist });
    steps.push(step(`c) Deux villes sont sur le même méridien, aux latitudes ${l1}° N et ${l2}° ${sameHemi ? 'N' : 'S'}. Le tour de la Terre mesure 40 000 km. Distance en suivant le méridien (arrondie au km) ?`, [approxF('', dist, 0, 'km')], `L’angle au centre vaut ${sameHemi ? 'la différence' : 'la somme'} des latitudes ; la longueur de l’arc est proportionnelle à l’angle.`, mist(q(Math.round(((sameHemi ? l1 + l2 : Math.abs(l1 - l2)) / 360) * 40000)), [[q(Math.round(((sameHemi ? l1 + l2 : Math.abs(l1 - l2)) / 360) * 40000)), sameHemi ? 'Même hémisphère : on soustrait les latitudes.' : 'De part et d’autre de l’équateur : on additionne les latitudes.']])));
    if (!safe(dist, 0)) return reperage.generate(rng, level);
    sol.push(`c) Angle : ${m(sameHemi ? `${Math.max(l1, l2)}^\\circ - ${Math.min(l1, l2)}^\\circ = ${dl}^\\circ` : `${l1}^\\circ + ${l2}^\\circ = ${dl}^\\circ`)}. Distance : ${m(`\\dfrac{${dl}}{360} \\times 40\\,000 \\approx ${grp(Math.round(dist))}\\,\\mathrm{km}`)}.`);
    return { title: 'Se repérer.', statement: `Pavé ${m('ABCDEFGH')} : origine ${m('A')}, ${m(`AB = ${L}`)}, ${m(`AD = ${P}`)}, ${m(`AE = ${H}`)}.`, figure: paveSvg(L, P, H), steps, solution: sol, answer: sol.join(' '), key: `2|${dim}|${vx}|${fn}|${l1}|${l2}|${sameHemi}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== patrons : longueurs et aires
export const aires: Generator = {
  id: 'aires', title: 'Patrons : longueurs et aires', stars: 1, levels: [1, 2, 3], course: LINKS.s35, links: [LINKS.s33],
  desc: 'Rectangle du patron d’un cylindre (2πR), aire d’un patron de pavé ; ★★ face d’une pyramide ; ★★★ secteur d’un cône.',
  example: 'L = 2\\pi R \\approx 18{,}8\\,\\mathrm{cm}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      if (rng.chance(0.5)) {
        const R = rng.int(2, 15), h = rng.int(3, 25), L = 2 * Math.PI * R, A = L * h;
        if (!safe(L, 1) || !safe(A, 1)) return aires.generate(rng, level);
        items.push({ what: 'L', js: `2*Math.PI*${R}`, expect: L }, { what: 'A', js: `2*Math.PI*${R}*${h}`, expect: A }, { what: 'h', js: `${h}`, expect: h });
        steps.push(step('a) Dimensions du rectangle du patron (longueur au dixième) ?', [approxF('Longueur :', L, 1, 'cm'), numF('Largeur :', h, 'cm')], 'La longueur s’enroule autour du disque : c’est son périmètre.', [{ on: 'numAll', values: [q(2 * R), q(h)], msg: 'La longueur est le PÉRIMÈTRE du disque (2πR), pas son diamètre.' }]));
        steps.push(step('b) Aire latérale du cylindre (au dixième) ?', [approxF('', A, 1, 'cm²')], 'Aire du rectangle : longueur × largeur (garde 2πR exact).'));
        sol.push(`a) Largeur : la hauteur, ${m(cm(h))} ; longueur : ${m(`2\\pi \\times ${R} = ${2 * R}\\pi \\approx ${ar(L, 1)}\\,\\mathrm{cm}`)}.`, `b) ${m(`${2 * R}\\pi \\times ${h} = ${2 * R * h}\\pi \\approx ${ar(A, 1)}\\,\\mathrm{cm}^2`)}.`);
        return { title: 'Patron d’un cylindre.', statement: `Un cylindre a pour rayon ${m(cm(R))} et pour hauteur ${m(cm(h))}.`, steps, solution: sol, answer: `≈ ${Dt(Math.round(L * 10) / 10)} cm × ${h} cm`, key: `c|${R}|${h}`, data: { kind: 'js', items } };
      }
      const a = rng.int(3, 12), b = rng.int(2, a - 1), c = rng.int(1, 10), S = 2 * (a * b + a * c + b * c);
      if (c === a || c === b) return aires.generate(rng, level);
      items.push({ what: 'S', js: `2*(${a}*${b}+${a}*${c}+${b}*${c})`, expect: S });
      steps.push(step('Aire totale du patron ?', [numF('', S, 'cm²')], 'Six rectangles, identiques deux à deux.', mist(q(S), [[q(S / 2), 'Il y a deux rectangles de chaque sorte : multiplie par 2.'], [q(a * b * c), 'Ça, c’est le volume.']])));
      sol.push(`Deux faces de ${m(`${a} \\times ${b}`)}, deux de ${m(`${a} \\times ${c}`)}, deux de ${m(`${b} \\times ${c}`)} :`, `${m(`2 \\times ${a * b} + 2 \\times ${a * c} + 2 \\times ${b * c} = ${S}\\,\\mathrm{cm}^2`)}.`);
      return { title: 'Patron d’un pavé.', statement: `Un pavé droit mesure ${m(cm(a))}, ${m(cm(b))} et ${m(cm(c))}.`, steps, solution: sol, answer: `${S} cm²`, key: `p|${a}|${b}|${c}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      const base = 2 * rng.int(1, 10), l = rng.int(base / 2 + 1, base + 12), h = Math.sqrt(l * l - (base / 2) ** 2), tot = base * base + 2 * base * h;
      if (!safe(h, 2) || !safe(tot, 1)) return aires.generate(rng, level);
      items.push({ what: 'h', js: `Math.sqrt(${l}**2-(${base}/2)**2)`, expect: h }, { what: 'tot', js: `${base}**2+4*${base}*Math.sqrt(${l}**2-(${base}/2)**2)/2`, expect: tot });
      steps.push(step('a) Hauteur d’une face latérale (au centième) ?', [approxF('', h, 2, 'cm')], `La hauteur issue du sommet coupe la base de ${base} cm en son milieu : triangle rectangle d’hypoténuse ${l} cm.`, mist(q(Math.round(Math.sqrt(l * l + (base / 2) ** 2) * 100), 100), [[q(Math.round(Math.sqrt(l * l + (base / 2) ** 2) * 100), 100), `L’hypoténuse est le côté de ${l} cm : on soustrait les carrés.`]])));
      steps.push(step('b) Aire totale du patron (au dixième) ?', [approxF('', tot, 1, 'cm²')], 'La base carrée + 4 triangles (base × hauteur ÷ 2).'));
      sol.push(`a) ${m(`h^2 = ${l}^2 - ${base / 2}^2 = ${l * l - (base / 2) ** 2}`)}, donc ${m(`h = \\sqrt{${l * l - (base / 2) ** 2}} \\approx ${ar(h, 2)}\\,\\mathrm{cm}`)}.`, `b) ${m(`${base}^2 + 4 \\times \\dfrac{${base} \\times h}{2} \\approx ${ar(tot, 1)}\\,\\mathrm{cm}^2`)}.`);
      return { title: 'Patron d’une pyramide.', statement: `Une pyramide régulière a pour base un carré de côté ${m(cm(base))} ; ses faces latérales sont des triangles isocèles de côtés ${m(cm(l))}, ${m(cm(l))} et ${m(cm(base))}.`, steps, solution: sol, answer: `≈ ${Dt(Math.round(h * 100) / 100)} cm ; ≈ ${Dt(Math.round(tot * 10) / 10)} cm²`, key: `y|${base}|${l}`, data: { kind: 'js', items } };
    }
    if (rng.chance(0.5)) {
      const r = rng.int(2, 15), g = rng.int(r + 1, r + 18), ang = (360 * r) / g, A = Math.PI * r * g;
      if (!safe(ang, 1) || !safe(A, 1)) return aires.generate(rng, level);
      items.push({ what: 'ang', js: `360*${r}/${g}`, expect: ang }, { what: 'A', js: `Math.PI*${g}**2*(360*${r}/${g})/360`, expect: A });
      steps.push(step('a) Angle du secteur (au dixième de degré) ?', [approxF('', ang, 1, '°')], `L’arc du secteur fait le tour de la base : ${m('360^\\circ \\times \\dfrac{r}{g}')}.`, mist(q(Math.round(((360 * g) / r) * 10), 10), [[q(Math.round(((360 * g) / r) * 10), 10), 'C’est l’inverse : r/g, le rayon de la base sur la génératrice.']])));
      steps.push(step('b) Aire du secteur, c’est-à-dire l’aire latérale du cône (au dixième) ?', [approxF('', A, 1, 'cm²')], `Fraction ${m('\\dfrac{r}{g}')} du disque de rayon ${m('g')} : ${m('\\pi g^2 \\times \\dfrac{r}{g} = \\pi r g')}.`));
      sol.push(`a) ${m(`360^\\circ \\times \\dfrac{${r}}{${g}} \\approx ${ar(ang, 1)}^\\circ`)}.`, `b) ${m(`\\pi \\times ${g}^2 \\times \\dfrac{${r}}{${g}} = ${r * g}\\pi \\approx ${ar(A, 1)}\\,\\mathrm{cm}^2`)}.`);
      return { title: 'Patron d’un cône.', statement: `Un cône a pour rayon de base ${m(cm(r))} et pour génératrice ${m(cm(g))}. On dessine son patron : un disque et un secteur de rayon ${m(cm(g))}.`, steps, solution: sol, answer: `≈ ${Dt(Math.round(ang * 10) / 10)}° ; ≈ ${Dt(Math.round(A * 10) / 10)} cm²`, key: `g|${r}|${g}`, data: { kind: 'js', items } };
    }
    const [a1, b1, c1] = rng.pick(TRIPLES.filter((t) => t[2] <= 41)), sc = rng.pick([0.5, 1, 1.5, 2, 3]), [a0, b0, c0] = [a1 * sc, b1 * sc, c1 * sc], [r, h] = rng.chance(0.5) ? [a0, b0] : [b0, a0], ang = (360 * r) / c0, arc = 2 * Math.PI * r;
    if (!safe(ang, 1) || !safe(arc, 1)) return aires.generate(rng, level);
    items.push({ what: 'g', js: `Math.hypot(${r},${h})`, expect: c0 }, { what: 'arc', js: `2*Math.PI*${r}`, expect: arc }, { what: 'ang', js: `360*${r}/Math.hypot(${r},${h})`, expect: ang });
    steps.push(step('a) Génératrice ?', [numF('', c0, 'cm')], 'Hauteur, rayon et génératrice forment un triangle rectangle.', mist(q(Math.round(c0 * 10), 10), [[q(Math.round((r + h) * 10), 10), 'Pythagore : on additionne les carrés.']])));
    steps.push(step('b) Longueur de l’arc du secteur (au dixième) ?', [approxF('', arc, 1, 'cm')], 'L’arc fait le tour de la base.'));
    steps.push(step('c) Angle du secteur (au dixième de degré) ?', [approxF('', ang, 1, '°')], `${m('360^\\circ \\times \\dfrac{r}{g}')}.`, mist(q(Math.round(((360 * r) / h) * 10), 10), [[q(Math.round(((360 * r) / h) * 10), 10), 'Le rayon du secteur est la génératrice g, pas la hauteur.']])));
    sol.push(`a) ${m(`g^2 = ${D(r)}^2 + ${D(h)}^2 = ${D(c0 * c0)}`)}, donc ${m(`g = ${cm(c0)}`)}.`, `b) ${m(`2\\pi \\times ${D(r)} = ${D(2 * r)}\\pi \\approx ${ar(arc, 1)}\\,\\mathrm{cm}`)}.`, `c) ${m(`360^\\circ \\times \\dfrac{${D(r)}}{${D(c0)}} \\approx ${ar(ang, 1)}^\\circ`)}.`);
    return { title: 'Patron d’un cône.', statement: `Un cône a pour rayon de base ${m(cm(r))} et pour hauteur ${m(cm(h))}.`, steps, solution: sol, answer: `${Dt(c0)} cm ; ≈ ${Dt(Math.round(ang * 10) / 10)}°`, key: `k|${r}|${h}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== trouver l'erreur
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s35, links: [LINKS.s21, LINKS.s52],
  desc: 'Diamètre au lieu du périmètre, fuyante prise en vraie grandeur, section d’un cône, aire × k au lieu de k².',
  example: 'k = \\tfrac12 \\Rightarrow \\text{aire} \\times \\tfrac14',
  generate(rng: Rng) {
    const nm = rng.pick(['Lucas', 'Emma', 'Yanis', 'Léa', 'Inès', 'Hugo', 'Nora', 'Sami', 'Jade', 'Tom']), v = rng.int(0, 3), items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    let st: Rich, key: string, ans: Rich;
    if (v === 0) {
      const R = rng.int(2, 12), h = rng.int(3, 20), L = 2 * Math.PI * R;
      if (!safe(L, 1)) return erreur.generate(rng, 2);
      st = `Pour le patron d’un cylindre de rayon ${m(cm(R))} et de hauteur ${m(cm(h))}, ${nm} dessine deux disques de rayon ${m(cm(R))} et un rectangle de ${m(cm(2 * R))} sur ${m(cm(h))}.`;
      steps.push({ prompt: 'a) Quelle est l’erreur ?', answer: shuffledChoice(rng, 'La longueur du rectangle est le périmètre du disque, pas son diamètre.', [['Les disques devraient avoir pour rayon la hauteur.', 'Les disques sont les bases : rayon R.'], ['Le rectangle devrait mesurer R sur h.', 'Il doit faire tout le tour du disque.']]), hint: 'Le rectangle s’enroule autour du disque.' });
      items.push({ what: 'L', js: `2*Math.PI*${R}`, expect: L });
      steps.push(step('b) Bonne longueur (au dixième) ?', [approxF('', L, 1, 'cm')], '2πR.'));
      sol.push(`Le rectangle s’enroule autour du disque : sa longueur est le périmètre ${m(`2\\pi \\times ${R} = ${2 * R}\\pi \\approx ${ar(L, 1)}\\,\\mathrm{cm}`)}.`); key = `0|${R}|${h}`; ans = `≈ ${Dt(Math.round(L * 10) / 10)} cm`;
    } else if (v === 1) {
      const f = rng.int(4, 16) / 2;
      st = `Sur un dessin en perspective cavalière (coefficient 0,5), ${nm} mesure une fuyante d’un cube : ${m(cm(f))}. « L’arête du cube mesure ${m(cm(f))}. »`;
      items.push({ what: 'a', js: `${f}/0.5`, expect: 2 * f });
      steps.push(step('Vraie longueur de l’arête ?', [numF('', 2 * f, 'cm')], 'Une fuyante est réduite de moitié sur le dessin.', mist(q(Math.round(f * 1000), 1000), [[q(Math.round(f * 500), 1000), 'Pour retrouver la vraie longueur, on divise par 0,5 : on double.']])));
      sol.push(`Une fuyante est dessinée réduite : ${m(`${D(f)} \\div 0{,}5 = ${cm(2 * f)}`)}.`); key = `1|${f}`; ans = `${Dt(2 * f)} cm`;
    } else if (v === 2) {
      const dd = rng.pick([2, 3, 4, 5]), j = rng.int(1, dd - 1), R = dd * rng.int(1, Math.floor(20 / dd)), Hc = dd * rng.int(2, Math.floor(30 / dd)), d = (Hc * j) / dd, rs = (R * j) / dd;
      st = `Un cône a pour rayon ${m(cm(R))} et pour hauteur ${m(cm(Hc))}. ${nm} le coupe par un plan parallèle à la base, à ${m(cm(d))} du sommet, et affirme : « La section est un triangle. »`;
      items.push({ what: 'rs', js: `${R}*${d}/${Hc}`, expect: rs });
      steps.push({ prompt: 'a) Que donne en réalité cette section ?', answer: fixedChoice(['Un disque', 'Un triangle', 'Un rectangle'], 0, [null, 'Parallèle à la base : une réduction de la base.', 'Un cône n’a pas de face rectangulaire.'], 2), hint: 'Une section parallèle à la base est une réduction de la base.' });
      steps.push({ prompt: 'b) Dans quel cas obtient-on un triangle ?', answer: fixedChoice(['Quand le plan contient l’axe du cône', 'Quand le plan est parallèle à la base', 'Jamais'], 0, [null, 'Ça donne un disque.', 'Si : par un plan qui passe par le sommet et l’axe.'], 2), hint: 'Coupe le cône « en deux » par le sommet.' });
      steps.push(step('c) Rayon de la section ?', [numF('', rs, 'cm')], `Réduction de coefficient ${m(`\\dfrac{${D(d)}}{${Hc}}`)}.`, mist(q(Math.round(rs * 1000), 1000), [[q(Math.round((R - rs) * 1000), 1000), 'Le coefficient est la distance au SOMMET divisée par la hauteur.']])));
      sol.push('a) C’est faux : parallèle à la base, la section est une réduction de la base, donc un disque.', 'b) On obtient un triangle (isocèle) quand le plan contient l’axe du cône.', `c) ${m(`k = \\dfrac{${D(d)}}{${Hc}} = \\dfrac{${j}}{${dd}}`)}, rayon ${m(`${R} \\times \\dfrac{${j}}{${dd}} = ${cm(rs)}`)}.`); key = `2|${R}|${Hc}|${d}`; ans = `un disque de rayon ${Dt(rs)} cm`;
    } else {
      const dd = rng.pick([2, 3, 4]), c = dd * rng.int(2, Math.floor(24 / dd)) / (rng.chance(0.3) ? 2 : 1), A = c * c, k = 1 / dd, frac = ['', '', 'à mi-hauteur', 'au tiers de la hauteur en partant du sommet', 'au quart de la hauteur en partant du sommet'][dd];
      st = `Une pyramide a pour base un carré de côté ${m(cm(c))}. ${nm} la coupe ${frac} par un plan parallèle à la base : « L’aire de la section est ${dd === 2 ? 'la moitié' : dd === 3 ? 'le tiers' : 'le quart'} de l’aire de la base, soit ${m(`${D(A * k)}\\,\\mathrm{cm}^2`)}. »`;
      items.push({ what: 'a', js: `${A}/${dd}**2`, expect: A * k * k });
      steps.push(step('Aire correcte de la section ?', [numF('', A * k * k, 'cm²')], `${m(`k = \\dfrac{1}{${dd}}`)} : les aires sont multipliées par ${m('k^2')}.`, mist(q(Math.round(A * k * 1000), 1000), [[q(Math.round(A * k * 1000), 1000), 'C’est justement l’erreur : les aires sont multipliées par k².']])));
      sol.push(`${m(`k = \\dfrac{1}{${dd}}`)} : les longueurs sont divisées par ${dd}, les aires par ${dd * dd}. La section est un carré de côté ${m(cm(c / dd))}, d’aire ${m(`${D(A / (dd * dd))}\\,\\mathrm{cm}^2`)}.`); key = `3|${c}|${dd}`; ans = `${Dt(A / dd / dd)} cm²`;
    }
    steps.forEach((s, i) => { if (s.answer.kind === 'choice') items.push({ what: `step:${i}`, js: String(corr(s)), expect: corr(s) }); });
    return { title: 'Trouve l’erreur.', statement: st, steps, solution: sol, answer: ans, key, data: { kind: 'js', items } };
  },
};
