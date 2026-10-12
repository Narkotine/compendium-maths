/** Chapitre 09 : paires d'angles, parallèles et sécante, somme des angles, inégalité triangulaire. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice, fixedChoice } from '../engine/build';
import { svgWrap, line, text, dot, type Pt } from '../engine/svg';
import { LINKS, m, dg, hat, degF, intF, lenF, step, corr, q, arc, angAt, POS, secanteSvg, triAngSvg, crossSvg, type Item, type Pos } from './common';

const POS_TXT: Record<Pos, string> = { hd: 'en haut à droite', hg: 'en haut à gauche', bg: 'en bas à gauche', bd: 'en bas à droite' };

// ===================================================================== paires d'angles
export const paires: Generator = {
  id: 'paires', title: 'Paires d’angles', stars: 1, levels: [1], course: LINKS.s22,
  desc: 'Complémentaire, supplémentaire, angles opposés par le sommet autour de deux droites sécantes.',
  example: '180^\\circ - 35^\\circ = 145^\\circ',
  generate(rng: Rng) {
    const x = rng.int(12, 78), y = rng.int(15, 165);
    let al = rng.int(20, 160); if (al === 90) al = 64;
    const items: Item[] = [{ what: 'c', js: `90-${x}`, expect: 90 - x }, { what: 's', js: `180-${y}`, expect: 180 - y }, { what: 'o', js: `${al}`, expect: al }, { what: 'v', js: `180-${al}`, expect: 180 - al }];
    const steps: Step[] = [
      step(`a) Complémentaire d’un angle de ${m(dg(x))} ?`, [degF('', 90 - x)], 'Deux angles complémentaires ont pour somme 90°.', mist(q(90 - x), [[q(180 - x), 'Ça, c’est le supplémentaire (somme 180°).']])),
      step(`b) Supplémentaire d’un angle de ${m(dg(y))} ?`, [degF('', 180 - y)], 'Deux angles supplémentaires ont pour somme 180°.', mist(q(180 - y), [[y < 90 ? q(90 - y) : null, 'Ça, c’est le complémentaire (somme 90°).'], [q(360 - y), 'La somme vaut 180°, pas 360°.']])),
      step(`c) Sur la figure, les droites se coupent en O. Mesures des angles 1, 2 et 3 ?`, [degF('Angle 1 :', 180 - al), degF('Angle 2 :', al), degF('Angle 3 :', 180 - al)], 'L’angle 2 est opposé par le sommet à l’angle connu ; les angles 1 et 3 forment avec lui un angle plat.',
        [{ on: 'numAll', values: [q(al), q(al), q(al)], msg: 'Seuls les angles opposés par le sommet sont égaux ; deux angles voisins sont supplémentaires.' }, ...(al < 90 ? [{ on: 'numAll' as const, values: [q(90 - al), q(al), q(90 - al)], msg: 'Deux angles voisins forment un angle plat : 180°, pas 90°.' }] : [])]),
    ];
    return {
      title: 'Calculer des angles.', statement: '', figure: crossSvg(al, `${al}°`, ['1', '2', '3']), steps,
      solution: [`a) ${m(`90^\\circ - ${dg(x)} = ${dg(90 - x)}`)}.`, `b) ${m(`180^\\circ - ${dg(y)} = ${dg(180 - y)}`)}.`, `c) L’angle 2 est opposé par le sommet à l’angle de ${m(dg(al))} : il mesure ${m(dg(al))}. Les angles 1 et 3 sont supplémentaires de celui-ci : ${m(`180^\\circ - ${dg(al)} = ${dg(180 - al)}`)}.`, `Contrôle : ${m(`${al} + ${180 - al} + ${al} + ${180 - al} = 360`)}.`],
      answer: `${90 - x}° ; ${180 - y}° ; ${180 - al}°, ${al}°, ${180 - al}°`, key: `${x}|${y}|${al}`, data: { kind: 'js', items },
    };
  },
};

// ===================================================================== parallèles et sécante
const altOf: Partial<Record<Pos, Pos>> = { bd: 'hg', bg: 'hd' }; // angle en E (sous (d)) → alterne-interne en F (au-dessus de (d′))
export const secante: Generator = {
  id: 'secante', title: 'Parallèles et sécante', stars: 1, levels: [1, 2, 3], course: LINKS.s23, links: [LINKS.s22],
  desc: 'Angles alternes-internes et correspondants ; ★★ réciproque et angles intérieurs ; ★★★ angle en zigzag.',
  example: '(d) \\parallel (d\') \\Rightarrow \\text{alternes-internes égaux}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const al = rng.int(35, 75), flip = rng.chance(0.5), gp = rng.pick(POS), v = angAt(al, gp), nums = rng.shuffle(POS);
      const fields = [1, 2, 3, 4].map((k) => degF(`Angle ${k} :`, angAt(al, nums[k - 1])));
      nums.forEach((p, i) => items.push({ what: `a${i + 1}`, js: `${['hd', 'bg'].includes(p) === ['hd', 'bg'].includes(gp) ? v : 180 - v}`, expect: angAt(al, p) }));
      steps.push(step('a) Mesures des angles 1, 2, 3 et 4 en F ?', fields, 'Cherche l’angle en F qui est correspondant à l’angle connu ; les autres s’en déduisent (angle plat, opposés par le sommet).',
        [{ on: 'numAll', values: [q(v), q(v), q(v), q(v)], msg: 'Les quatre angles ne sont pas égaux : deux angles voisins sont supplémentaires.' }]));
      const kc = nums.indexOf(gp) + 1, pAlt = altOf[gp], useAlt = !!pAlt && rng.chance(0.6), k2 = useAlt ? nums.indexOf(pAlt!) + 1 : kc;
      const OPT = ['Alternes-internes', 'Correspondants', 'Opposés par le sommet'];
      steps.push({ prompt: `b) L’angle de ${m(dg(v))} en E et l’angle ${k2} en F sont :`, answer: fixedChoice(OPT, useAlt ? 0 : 1, [useAlt ? null : 'Alternes-internes : entre les deux droites, de part et d’autre de la sécante.', useAlt ? 'Correspondants : même position, du même côté de la sécante.' : null, 'Des angles opposés par le sommet ont le même sommet.'], 2), hint: 'Regarde : même position (« au-dessus à droite »…) ou entre les droites de part et d’autre de la sécante ?' });
      items.push({ what: 'step:1', js: useAlt ? '0' : '1', expect: useAlt ? 0 : 1 });
      sol.push(`L’angle ${kc} en F et l’angle de ${m(dg(v))} en E sont correspondants (tous deux ${POS_TXT[gp]}). Or ${m('(d) \\parallel (d\')')}, et deux parallèles coupées par une sécante forment des angles correspondants égaux. Donc l’angle ${kc} mesure ${m(dg(v))}.`);
      const opp = nums.indexOf(({ hd: 'bg', bg: 'hd', hg: 'bd', bd: 'hg' } as Record<Pos, Pos>)[gp]) + 1;
      sol.push(`L’angle ${opp} est opposé par le sommet à l’angle ${kc} : ${m(dg(v))}. Les deux autres forment avec lui un angle plat : ${m(`180^\\circ - ${dg(v)} = ${dg(180 - v)}`)}.`);
      sol.push(`b) ${useAlt ? 'Alternes-internes : entre (d) et (d′), de part et d’autre de (t).' : 'Correspondants : même position par rapport à (d) et à (d′), du même côté de (t).'}`);
      return { title: 'Deux parallèles coupées par une sécante.', statement: `${m('(d) \\parallel (d\')')}. La sécante ${m('(t)')} les coupe en E et F.`, figure: secanteSvg(al, [{ at: 'E', p: gp, t: `${v}°` }, ...nums.map((p, i) => ({ at: 'F' as const, p, t: String(i + 1) }))], { flip, codeParallel: true }), steps, solution: sol, answer: fields.map((f) => String(f.expect.n / f.expect.d)).join(' ; '), key: `1|${al}|${gp}|${nums.join('')}|${flip}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      const al = rng.int(38, 72), gp = rng.pick(['bd', 'bg'] as Pos[]), corrK = rng.chance(0.5), par = rng.chance(0.5), d = par ? 0 : rng.pick([-3, -2, -1, 1, 2, 3]);
      const pE: Pos = corrK ? rng.pick(POS) : gp, pF: Pos = corrK ? pE : altOf[pE]!, vE = angAt(al, pE), vF = vE + d;
      const kind = corrK ? 'correspondants' : 'alternes-internes';
      steps.push({ prompt: `a) Les angles marqués en E et en F sont ${kind} et mesurent ${m(dg(vE))} et ${m(dg(vF))}. Les droites ${m('(d)')} et ${m('(d\')')} sont-elles parallèles ?`, answer: fixedChoice(['Oui', 'Non', 'On ne peut pas savoir'], par ? 0 : 1, [par ? null : `Ils ne sont pas égaux : ${vE} ≠ ${vF}.`, par ? 'Ils sont égaux : la réciproque permet de conclure.' : null, 'Les mesures suffisent : réciproque si elles sont égales, contraposée sinon.'], 2), hint: 'Si les droites étaient parallèles, ces angles seraient égaux.' });
      items.push({ what: 'step:0', js: `${vE}===${vF}?0:1`, expect: par ? 0 : 1 });
      sol.push(par ? `a) Les angles ${kind} sont égaux. Or, si deux droites forment avec une sécante des angles ${kind} égaux, alors elles sont parallèles. Donc ${m('(d) \\parallel (d\')')}.` : `a) Si ${m('(d)')} et ${m('(d\')')} étaient parallèles, ces angles ${kind} seraient égaux. Or ${m(`${vE}^\\circ \\neq ${vF}^\\circ`)}. Donc les droites ne sont pas parallèles (elles se coupent… loin).`);
      const x = rng.int(100, 140), y = 180 - x;
      steps.push(step(`b) Autre figure : deux droites parallèles sont coupées par une sécante en A et B. Entre les deux droites et du même côté de la sécante, l’angle en A mesure ${m(dg(x))}. Combien mesure l’angle en B ?`, [degF('', y)], 'Avec deux parallèles, deux angles intérieurs du même côté de la sécante sont supplémentaires.', mist(q(y), [[q(x), 'Ils ne sont pas alternes-internes (même côté) : ils sont supplémentaires.'], [q(360 - x), 'Les deux angles ont pour somme 180°.']])));
      items.push({ what: 'b', js: `180-${x}`, expect: y });
      sol.push(`b) Angles intérieurs du même côté, avec des parallèles : supplémentaires. ${m(`180^\\circ - ${dg(x)} = ${dg(y)}`)}.`);
      const tilt = par ? 0 : -d;
      return { title: 'Parallèles ou pas ?', statement: `Une sécante ${m('(t)')} coupe ${m('(d)')} et ${m('(d\')')} en E et F (figure : un écart de quelques degrés ne se voit pas).`, figure: secanteSvg(al, [{ at: 'E', p: pE, t: `${vE}°` }, { at: 'F', p: pF, t: `${vF}°` }], { tilt }), steps, solution: sol, answer: `${par ? 'oui' : 'non'} ; ${y}°`, key: `2|${vE}|${vF}|${kind}|${x}`, data: { kind: 'js', items } };
    }
    // ★★★ : zigzag
    const a = rng.int(20, 60), b2 = rng.int(20, 65);
    const res = a + b2;
    items.push({ what: 'P', js: `${a}+${b2}`, expect: res });
    steps.push(step(`Combien mesure ${m(hat('APB'))} ?`, [degF('', res)], 'Trace la parallèle à (d) passant par P : elle est aussi parallèle à (d′). Cherche deux paires d’angles alternes-internes.', mist(q(res), [[q(180 - res), 'L’angle en P est la somme des deux angles reportés, pas son supplémentaire.'], [q(360 - res), 'L’angle demandé est l’angle saillant APB.'], [q(Math.abs(a - b2)), 'Les deux angles reportés s’additionnent.']])));
    sol.push(`Par P, on trace la parallèle ${m('(\\Delta)')} à ${m('(d)')} ; elle est aussi parallèle à ${m('(d\')')} (deux droites parallèles à une même droite sont parallèles).`, `L’angle entre ${m('[PA]')} et ${m('(\\Delta)')} est alterne-interne avec l’angle de ${m(dg(a))} en A : il mesure ${m(dg(a))}. De même, l’angle entre ${m('(\\Delta)')} et ${m('[PB]')} mesure ${m(dg(b2))}.`, `Ces deux angles sont adjacents : ${m(`${hat('APB')} = ${dg(a)} + ${dg(b2)} = ${dg(res)}`)}.`);
    return { title: 'L’angle en zigzag.', statement: `Sur la figure, ${m('(d) \\parallel (d\')')}. A est sur ${m('(d)')}, B sur ${m('(d\')')}, et P entre les deux droites.`, figure: zigzagSvg(a, b2), steps, solution: sol, answer: `${res}°`, key: `3|${a}|${b2}`, data: { kind: 'js', items } };
  },
};
/** Deux parallèles, A sur (d), B sur (d′), P entre les deux à droite ; angles a en A et b en B avec les droites (vers la droite). */
function zigzagSvg(a: number, b: number): string {
  const R = Math.PI / 180, y1 = 40, y2 = 190, ym = y1 + (y2 - y1) * (Math.tan(a * R) / (Math.tan(a * R) + Math.tan(b * R)));
  const xA = 40, xP = xA + (ym - y1) / Math.tan(a * R), xB = xP - (y2 - ym) / Math.tan(b * R), sc = Math.min(1, 270 / Math.max(xP, 1));
  const A: Pt = [xA, y1], P: Pt = [xA + (xP - xA) * sc, ym], B: Pt = [xA + (xB - xA) * sc, y2];
  // garder l'échelle : on recalcule P et B avec la même pente
  const kx = sc; void kx;
  let s = line([10, y1], [310, y1]) + line([10, y2], [310, y2]) + line(A, P) + line(P, B);
  s += dot(A, 2.5) + dot(B, 2.5) + dot(P, 2.5) + text([A[0], A[1] - 12], 'A', 'gf-tb') + text([B[0], B[1] + 14], 'B', 'gf-tb') + text([P[0] + 14, P[1]], 'P', 'gf-tb');
  const angA = -Math.atan2(P[1] - A[1], P[0] - A[0]) / R, angB = -Math.atan2(P[1] - B[1], P[0] - B[0]) / R;
  s += arc(A, 22, angA, 0) + text([A[0] + 44, A[1] + 12], `${a}°`, 'gf-ts') + arc(B, 22, 0, angB) + text([B[0] + 44, B[1] - 12], `${b}°`, 'gf-ts');
  s += text([300, y1 - 10], '(d)', 'gf-ts', 'end') + text([300, y2 + 14], '(d′)', 'gf-ts', 'end');
  return svgWrap(320, 230, `Deux droites parallèles ; angle de ${a}° en A et de ${b}° en B ; P entre les deux droites`, s);
}

// ===================================================================== somme des angles
const TRI = ['ABC', 'DEF', 'MNP', 'RST', 'IJK', 'EFG', 'KLM', 'UVW'];
export const triangle: Generator = {
  id: 'triangle', title: 'Angles d’un triangle', stars: 1, levels: [1, 2, 3], course: LINKS.s32, links: [LINKS.s33, LINKS.s43],
  desc: 'Somme des angles, triangle rectangle, isocèle ; ★★ angle extérieur, polygones ; ★★★ bissectrice et plusieurs étapes.',
  example: '\\widehat{C} = 180^\\circ - 62^\\circ - 49^\\circ = 69^\\circ',
  generate(rng: Rng, level: Level) {
    const N = rng.pick(TRI), [A, B, C] = N.split('') as [string, string, string], items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const v = rng.int(0, 2);
      if (v === 0) {
        let a: number, b: number; do { a = rng.int(25, 110); b = rng.int(20, 100); } while (a + b > 160 || a === 90 || b === 90 || 180 - a - b === 90);
        const c = 180 - a - b;
        items.push({ what: 'c', js: `180-${a}-${b}`, expect: c });
        steps.push(step(`Calcule ${m(hat(C))}.`, [degF(`${m(hat(C))} =`, c)], 'La somme des angles d’un triangle vaut 180°.', mist(q(c), [[q(360 - a - b), 'La somme des angles d’un triangle vaut 180°, pas 360°.'], [q(a + b), 'On soustrait de 180° la somme des deux angles connus.']])));
        sol.push(`La somme des angles d’un triangle vaut ${m('180^\\circ')}.`, `Donc ${m(`${hat(C)} = 180^\\circ - ${dg(a)} - ${dg(b)} = ${dg(c)}`)}.`, `Contrôle : ${m(`${a} + ${b} + ${c} = 180`)}.`);
        return { title: 'Le troisième angle.', statement: `Dans le triangle ${m(N)}, ${m(`${hat(A)} = ${dg(a)}`)} et ${m(`${hat(B)} = ${dg(b)}`)}.`, figure: triAngSvg([A, B, C], a, b, [`${a}°`, `${b}°`, '?']), steps, solution: sol, answer: `${c}°`, key: `s|${a}|${b}`, data: { kind: 'js', items } };
      }
      if (v === 1) {
        const b = rng.int(18, 72), c = 90 - b;
        items.push({ what: 'c', js: `90-${b}`, expect: c });
        steps.push(step(`Calcule ${m(hat(C))}.`, [degF(`${m(hat(C))} =`, c)], 'Dans un triangle rectangle, les deux angles aigus sont complémentaires.', mist(q(c), [[q(180 - b), 'N’oublie pas l’angle droit : il reste 90° pour les deux angles aigus.']])));
        sol.push(`Le triangle est rectangle en ${m(A)} : ses angles aigus sont complémentaires.`, `${m(`${hat(C)} = 90^\\circ - ${dg(b)} = ${dg(c)}`)}.`);
        return { title: 'Triangle rectangle.', statement: `${m(N)} est rectangle en ${m(A)} et ${m(`${hat(B)} = ${dg(b)}`)}.`, figure: triAngSvg([A, B, C], 90, b, ['90°', `${b}°`, '?'], { right: 0 }), steps, solution: sol, answer: `${c}°`, key: `r|${b}`, data: { kind: 'js', items } };
      }
      const base = rng.chance(0.5);
      if (base) {
        const b = rng.int(20, 85), a = 180 - 2 * b;
        items.push({ what: 'c', js: `${b}`, expect: b }, { what: 'a', js: `180-2*${b}`, expect: a });
        steps.push(step(`Calcule ${m(hat(C))} et ${m(hat(A))}.`, [degF(`${m(hat(C))} =`, b), degF(`${m(hat(A))} =`, a)], 'Isocèle en ' + m(A) + ' : les angles à la base sont égaux.', a === b ? [] : [{ on: 'numAll', values: [q(a), q(b)], msg: 'L’angle égal à ' + m(hat(B)) + ' est l’autre angle à la base, ' + m(hat(C)) + ', pas l’angle au sommet principal ' + m(hat(A)) + '.' }]));
        sol.push(`Le triangle est isocèle en ${m(A)}, donc ses angles à la base sont égaux : ${m(`${hat(C)} = ${hat(B)} = ${dg(b)}`)}.`, `Somme des angles : ${m(`${hat(A)} = 180^\\circ - 2 \\times ${dg(b)} = ${dg(a)}`)}.`);
        return { title: 'Triangle isocèle.', statement: `${m(N)} est isocèle en ${m(A)} et ${m(`${hat(B)} = ${dg(b)}`)}.`, figure: triAngSvg([B, C, A], b, b, [`${b}°`, '?', '?'], { equal: [1, 2] }), steps, solution: sol, answer: `${b}° ; ${a}°`, key: `ib|${b}`, data: { kind: 'js', items } };
      }
      const a = 2 * rng.int(10, 75) + (rng.chance(0.3) ? 0 : 0), b = (180 - a) / 2;
      items.push({ what: 'b', js: `(180-${a})/2`, expect: b });
      steps.push(step(`Calcule ${m(hat(B))} et ${m(hat(C))}.`, [degF(`${m(hat(B))} =`, b), degF(`${m(hat(C))} =`, b)], 'Les deux angles à la base sont égaux et se partagent ce qui reste de 180°.', [{ on: 'numAll' as const, values: [q(180 - a), q(180 - a)], msg: 'Il faut partager 180° − ' + m(dg(a)) + ' entre les deux angles à la base : divise par 2.' }, { on: 'numAll' as const, values: [q(a), q(a)], msg: 'Ce sont les angles à la base qui sont égaux entre eux, pas à l’angle au sommet.' }].filter((mk) => mk.values[0].n !== b)));
      sol.push(`Isocèle en ${m(A)} : ${m(`${hat(B)} = ${hat(C)}`)}.`, `${m(`${hat(B)} + ${hat(C)} = 180^\\circ - ${dg(a)} = ${dg(180 - a)}`)}, donc ${m(`${hat(B)} = ${hat(C)} = ${dg(180 - a)} \\div 2 = ${dg(b)}`)}.`);
      return { title: 'Triangle isocèle.', statement: `${m(N)} est isocèle en ${m(A)} et ${m(`${hat(A)} = ${dg(a)}`)}.`, figure: triAngSvg([B, C, A], b, b, ['?', '?', `${a}°`], { equal: [1, 2] }), steps, solution: sol, answer: `${b}° ; ${b}°`, key: `ia|${a}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      const v = rng.int(0, 2);
      if (v === 0) {
        let a: number, b: number; do { a = rng.int(25, 95); b = rng.int(25, 95); } while (a + b > 160 || a === b);
        const x = a + b;
        items.push({ what: 'x', js: `${a}+${b}`, expect: x }, { what: 'c', js: `180-${a}-${b}`, expect: 180 - x });
        steps.push(step(`a) Calcule ${m(hat(`${A}${C}${B}`))}.`, [degF('', 180 - x)], 'Somme des angles du triangle.'));
        steps.push(step(`b) On prolonge ${m(`[${B}${C}]`)} au-delà de ${m(C)} jusqu’à D. Calcule l’angle extérieur ${m(hat(`${A}${C}D`))}.`, [degF('', x)], `${m(B)}, ${m(C)}, D sont alignés : angle plat.`, mist(q(x), [[q(180 - x), 'Ça, c’est l’angle du triangle en ' + m(C) + ' : l’angle extérieur est son supplémentaire.']])));
        sol.push(`a) ${m(`${hat(`${A}${C}${B}`)} = 180^\\circ - ${dg(a)} - ${dg(b)} = ${dg(180 - x)}`)}.`, `b) ${m(B)}, ${m(C)}, D alignés : ${m(`${hat(`${A}${C}D`)} = 180^\\circ - ${dg(180 - x)} = ${dg(x)}`)}.`, `On remarque que ${m(`${dg(x)} = ${dg(a)} + ${dg(b)}`)} : l’angle extérieur vaut la somme des deux autres angles du triangle.`);
        return { title: 'Angle extérieur.', statement: `Dans le triangle ${m(N)}, ${m(`${hat(A)} = ${dg(a)}`)} et ${m(`${hat(B)} = ${dg(b)}`)}.`, figure: triAngSvg([A, B, C], a, b, [`${a}°`, `${b}°`, '']), steps, solution: sol, answer: `${180 - x}° ; ${x}°`, key: `e|${a}|${b}`, data: { kind: 'js', items } };
      }
      if (v === 1) {
        const n = rng.int(4, 9), S = (n - 2) * 180, NOM = ['', '', '', '', 'quadrilatère', 'pentagone', 'hexagone', 'heptagone', 'octogone', 'ennéagone'][n];
        const reg = S % n === 0 && rng.chance(0.3);
        items.push({ what: 'S', js: `(${n}-2)*180`, expect: S });
        steps.push(step(`a) Somme des angles d’un ${NOM} (${n} côtés) ?`, [degF('', S)], `Depuis un sommet, les diagonales découpent le ${NOM} en ${n - 2} triangles.`, mist(q(S), [[q(n * 180), `On obtient ${n - 2} triangles, pas ${n}.`], [q(360), '360°, c’est pour le quadrilatère seulement.']])));
        sol.push(`a) Depuis un sommet, on découpe le ${NOM} en ${m(String(n - 2))} triangles : ${m(`${n - 2} \\times 180^\\circ = ${dg(S)}`)}.`);
        if (reg) { items.push({ what: 'r', js: `(${n}-2)*180/${n}`, expect: S / n }); steps.push(step(`b) Dans un ${NOM} régulier, tous les angles sont égaux. Combien mesure chacun ?`, [degF('', S / n)], `Partage la somme en ${n}.`)); sol.push(`b) ${m(`${dg(S)} \\div ${n} = ${dg(S / n)}`)}.`); }
        else { const known = Array.from({ length: n - 1 }, () => rng.int(100, 160)); const last = S - known.reduce((s, v) => s + v, 0); if (last <= 20 || last >= 180) return triangle.generate(rng, level); items.push({ what: 'l', js: `(${n}-2)*180-${known.join('-')}`, expect: last }); steps.push(step(`b) Les angles d’un ${NOM} mesurent ${known.map((k) => m(dg(k))).join(', ')} et un dernier inconnu. Combien mesure-t-il ?`, [degF('', last)], 'Somme trouvée au a), moins les angles connus.')); sol.push(`b) ${m(`${dg(S)} - (${known.join(' + ')}) = ${dg(last)}`)}.`); }
        return { title: 'Somme des angles d’un polygone.', statement: 'On découpe le polygone en triangles à partir d’un sommet.', steps, solution: sol, answer: sol.join(' '), key: `p|${n}|${sol.join('')}`, data: { kind: 'js', items } };
      }
      const cases: [string, number, string][] = [['deux angles obtus', 1, 'Deux angles obtus dépassent déjà 180°.'], ['deux angles droits', 1, 'Le troisième angle vaudrait 0°.'], [`un angle droit et un angle de ${m(dg(rng.int(20, 70)))}`, 0, 'Le troisième angle complète à 180°.'], ['trois angles de 60°', 0, 'C’est le triangle équilatéral.'], [`un angle de ${m(dg(rng.int(95, 150)))} et un angle droit`, 1, 'Un obtus et un droit dépassent 180°.'], [`des angles de ${m(dg(50))}, ${m(dg(60))} et ${m(dg(80))}`, 1, 'La somme fait 190°, pas 180°.']];
      const picks = rng.shuffle(cases).slice(0, 3);
      picks.forEach(([t, k, why], i) => { steps.push({ prompt: `${'abc'[i]}) Un triangle peut-il avoir ${t} ?`, answer: fixedChoice(['Oui', 'Non'], k, [why, why]), hint: 'Pense à la somme des angles : 180°.' }); items.push({ what: `step:${i}`, js: String(k), expect: k }); sol.push(`${'abc'[i]}) ${k ? 'Non' : 'Oui'} : ${why}`); });
      return { title: 'Possible ou impossible ?', statement: 'Justifie avec la somme des angles d’un triangle.', steps, solution: sol, answer: picks.map((p) => (p[1] ? 'non' : 'oui')).join(' ; '), key: `q|${picks.map((p) => p[0]).join('|')}`, data: { kind: 'js', items } };
    }
    // ★★★ : bissectrice (exercice I1)
    let a: number, b: number; do { a = 2 * rng.int(12, 45); b = rng.int(30, 90); } while (a + b > 165 || b === 90);
    const h = a / 2, adb = 180 - h - b, adc = 180 - adb;
    items.push({ what: 'h', js: `${a}/2`, expect: h }, { what: 'adb', js: `180-${a}/2-${b}`, expect: adb }, { what: 'adc', js: `${a}/2+${b}`, expect: adc });
    steps.push(step(`a) ${m(hat(`${B}${A}D`))} ?`, [degF('', h)], 'La bissectrice partage l’angle en deux angles égaux.'));
    steps.push(step(`b) ${m(hat(`${A}D${B}`))} ?`, [degF('', adb)], `Somme des angles dans le triangle ${m(`${A}${B}D`)}.`, mist(q(adb), [[q(180 - a - b), 'Dans le triangle ' + m(`${A}${B}D`) + ', l’angle en ' + m(A) + ' n’est que la moitié de ' + m(hat(A)) + '.']])));
    steps.push(step(`c) ${m(hat(`${A}D${C}`))} ?`, [degF('', adc)], `${m(B)}, D, ${m(C)} sont alignés.`));
    sol.push(`a) ${m(`[${A}D)`)} est la bissectrice de ${m(hat(A))}, donc ${m(`${hat(`${B}${A}D`)} = ${dg(a)} \\div 2 = ${dg(h)}`)}.`, `b) Dans le triangle ${m(`${A}${B}D`)} : ${m(`${hat(`${A}D${B}`)} = 180^\\circ - ${dg(h)} - ${dg(b)} = ${dg(adb)}`)}.`, `c) ${m(B)}, D, ${m(C)} alignés : ${m(`${hat(`${A}D${C}`)} = 180^\\circ - ${dg(adb)} = ${dg(adc)}`)}.`, `Contrôle dans ${m(`${A}D${C}`)} : ${m(`${hat(C)} = ${dg(180 - a - b)}`)} et ${m(`${h} + ${adc} + ${180 - a - b} = 180`)}.`);
    return { title: 'Bissectrice et angles.', statement: `Dans le triangle ${m(N)}, ${m(`${hat(A)} = ${dg(a)}`)} et ${m(`${hat(B)} = ${dg(b)}`)}. La bissectrice de ${m(hat(A))} coupe ${m(`[${B}${C}]`)} en D.`, steps, solution: sol, answer: `${h}° ; ${adb}° ; ${adc}°`, key: `b|${a}|${b}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== inégalité triangulaire
const L = (v: number) => String(v).replace('.', '{,}');
export const inegalite: Generator = {
  id: 'inegalite', title: 'Inégalité triangulaire', stars: 1, levels: [1, 2], course: LINKS.s31,
  desc: 'Le triangle est-il constructible ? ★★ : valeurs possibles du troisième côté.',
  example: '11 < 6 + 8 \\text{ : constructible}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const OPT = ['Oui', 'Non', 'Non : les points sont alignés'];
      const kinds = rng.shuffle([0, 1, 2]).concat(rng.int(0, 2));
      const keys: string[] = [];
      kinds.slice(0, 3).forEach((k, i) => {
        const dec = rng.chance(0.3), u = dec ? 10 : 1;
        let a: number, b: number, c: number;
        do { a = rng.int(2 * u, 9 * u); b = rng.int(2 * u, 9 * u); c = k === 0 ? rng.int(Math.max(a, b) + 1, a + b - 1) : k === 2 ? a + b : rng.int(a + b + 1, a + b + 4 * u); } while (k === 0 && Math.max(a, b) + 1 > a + b - 1);
        const s = rng.shuffle([a, b, c]).map((v) => v / u), big = c / u;
        keys.push(s.join(','));
        steps.push({ prompt: `${'abc'[i]}) Côtés ${s.map((v) => m(L(v))).join(', ')} (en cm) ?`, answer: fixedChoice(OPT, k, [`${m(`${L(big)} > ${L(a / u)} + ${L(b / u)}`)} : les arcs ne se coupent pas.`, `${m(`${L(big)} < ${L(a / u)} + ${L(b / u)}`)} : constructible.`, `${m(`${L(big)} \\neq ${L(a / u)} + ${L(b / u)}`)}.`], 2), hint: 'Compare le plus grand côté à la somme des deux autres.' });
        items.push({ what: `step:${i}`, js: `((x,y,z)=>{const t=[x,y,z].sort((p,q)=>p-q);return t[2]<t[0]+t[1]?0:t[2]===t[0]+t[1]?2:1})(${a},${b},${c})`, expect: k });
        sol.push(`${'abc'[i]}) ${k === 0 ? m(`${L(big)} < ${L(a / u)} + ${L(b / u)} = ${L((a + b) / u)}`) + ' : constructible.' : k === 1 ? m(`${L(big)} > ${L(a / u)} + ${L(b / u)} = ${L((a + b) / u)}`) + ' : pas constructible.' : m(`${L(big)} = ${L(a / u)} + ${L(b / u)}`) + ' : points alignés, triangle aplati.'}`);
      });
      return { title: 'Peut-on construire le triangle ?', statement: 'Pour chaque triplet de longueurs, peut-on construire un triangle ?', steps, solution: sol, answer: kinds.slice(0, 3).map((k) => ['oui', 'non', 'aplati'][k]).join(' ; '), key: keys.join('|'), data: { kind: 'js', items } };
    }
    let a: number, b: number; do { a = rng.int(2, 12); b = rng.int(a + 1, 20); } while (b - a < 2);
    const lo = b - a + 1, hi = a + b - 1, n = hi - lo + 1;
    items.push({ what: 'lo', js: `${b}-${a}+1`, expect: lo }, { what: 'hi', js: `${a}+${b}-1`, expect: hi }, { what: 'n', js: `2*${a}-1`, expect: n });
    steps.push(step('a) Plus petite et plus grande valeur entière possible du troisième côté ?', [intF('Minimum :', lo, 'cm'), intF('Maximum :', hi, 'cm')], `Il faut ${m(`c < ${a} + ${b}`)} et ${m(`${b} < ${a} + c`)}.`, [{ on: 'numAll', values: [q(b - a), q(a + b)], msg: 'Les inégalités sont strictes : à l’égalité, le triangle est aplati.' }]));
    steps.push(step('b) Combien de valeurs entières possibles ?', [intF('', n)], `Compte les entiers de ${lo} à ${hi}.`, mist(q(n), [[q(hi - lo), `De ${lo} à ${hi}, il y a ${hi} − ${lo} + 1 entiers.`]])));
    sol.push(`Notons ${m('c')} le troisième côté. Il faut ${m(`c < ${a} + ${b} = ${a + b}`)} et ${m(`${b} < ${a} + c`)}, soit ${m(`c > ${b - a}`)}.`, `Valeurs entières : de ${m(String(lo))} à ${m(String(hi))}, soit ${m(String(n))} valeurs.`);
    return { title: 'Le troisième côté.', statement: `Deux côtés d’un triangle mesurent ${m(`${a}\\,\\mathrm{cm}`)} et ${m(`${b}\\,\\mathrm{cm}`)}. Le troisième mesure un nombre entier de centimètres.`, steps, solution: sol, answer: `${lo} à ${hi} cm ; ${n} valeurs`, key: `${a}|${b}`, data: { kind: 'js', items } };
  },
};
void lenF; void corr; void shuffledChoice;
