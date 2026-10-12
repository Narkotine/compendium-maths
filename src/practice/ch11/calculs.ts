/**
 * Théorème de Pythagore : repérer l'hypoténuse (★), calculer l'hypoténuse (★ → ★★), un côté de l'angle
 * droit (★ → ★★★, conversions d'unités), réciproque (★★), trouver l'erreur (★★).
 * Construction à rebours : on part d'un triangle rectangle (triplet entier ou décimal, ou côtés quelconques
 * avec arrondi annoncé), on dessine la figure à l'échelle, puis on écrit l'énoncé.
 */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { q, toNum } from '../engine/q';
import { mist, shuffledChoice } from '../engine/build';
import { LINKS, m, lenTex, mq, triplets, dx, round, qd, sq, lengthField, pickTriangle, seg, rightTriangleSvg, ROTS, PRIMITIVE } from './common';

const unitTxt = (u: string, dp: number) => (u === 'cm' && dp === 1 ? 'au millimètre' : u === 'm' && dp === 1 ? 'au décimètre' : u === 'm' && dp === 2 ? 'au centimètre' : u === 'km' && dp === 1 ? 'à la centaine de mètres' : dp === 1 ? 'au dixième' : dp === 2 ? 'au centième' : 'à l’unité');

// ===================================================================== repérer l'hypoténuse
export const hypotenuse: Generator = {
  id: 'hypotenuse',
  title: 'Repérer l’hypoténuse',
  desc: 'Côté face à l’angle droit ; écrire l’égalité de Pythagore.',
  stars: 1,
  levels: [1, 2],
  example: 'EFG \\text{ rectangle en } G',
  course: LINKS.s2,
  links: [LINKS.s31],
  generate(rng: Rng, level: Level) {
    const t = pickTriangle(rng);
    const lp = rng.int(3, 9), lq = rng.int(3, 9);
    const figure = rightTriangleSvg({ R: t.R, P: t.P, Q: t.Q, lp, lq, rot: rng.pick(ROTS), flip: rng.chance(0.5), labels: {}, aria: `Triangle ${t.name} avec un angle droit codé en ${level === 1 ? t.R : 'un sommet'}` });
    const segs = [t.hyp, t.legP, t.legQ];
    const opts = rng.shuffle(segs);
    const legs = [t.legP, t.legQ].sort();
    const eqs = [`${t.hyp}^2 = ${legs[0]}^2 + ${legs[1]}^2`, `${legs[0]}^2 = ${legs[1]}^2 + ${t.hyp}^2`, `${legs[1]}^2 = ${legs[0]}^2 + ${t.hyp}^2`];
    const steps: Step[] = [
      {
        prompt: 'Quelle est l’hypoténuse ?',
        answer: { kind: 'choice', options: opts.map((s) => m(`[${s}]`)), correct: opts.indexOf(t.hyp), explain: opts.map((s) => (s === t.hyp ? null : `${m(`[${s}]`)} touche le sommet ${m(t.R)} de l’angle droit : c’est un côté de l’angle droit. L’hypoténuse est **en face** de l’angle droit.`)), attempts: 2 },
        hint: `Repère l’angle droit (${level === 1 ? `en ${m(t.R)}` : 'le petit carré'}) : l’hypoténuse est le côté qui ne touche pas ce sommet.`,
      },
      {
        prompt: 'Quelle égalité donne le théorème de Pythagore ?',
        answer: shuffledChoice(rng, m(eqs[0]), [
          [m(eqs[1]), `Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est ${m(`[${t.hyp}]`)}.`],
          [m(eqs[2]), `Le carré **de l’hypoténuse** est égal à la somme des carrés des deux autres côtés. Ici l’hypoténuse est ${m(`[${t.hyp}]`)}.`],
        ]),
        hint: '« hypoténuse² = côté² + côté² ».',
      },
    ];
    const hypIdx = `${JSON.stringify(opts)}.indexOf(${JSON.stringify(t.name.split('').filter((c) => c !== t.R).join(''))})`;
    return {
      title: level === 1 ? `Le triangle ${m(t.name)} est rectangle en ${m(t.R)}.` : `Observe le codage de la figure (le triangle ${m(t.name)} a un angle droit).`,
      figure,
      steps,
      solution: [`L’angle droit est en ${m(t.R)} : l’hypoténuse est le côté formé par les deux autres lettres, ${m(`[${t.hyp}]`)}.`, `D’après le théorème de Pythagore : ${m(eqs[0])}.`, `Contrôle : sur la figure, ${m(`[${t.hyp}]`)} est bien le plus long côté.`],
      answer: `${m(`[${t.hyp}]`)} ; ${m(eqs[0])}`,
      key: `${t.name}:${t.R}:${level}:${lp},${lq}`,
      data: { kind: 'js', items: [{ what: 'step:0', js: hypIdx, expect: opts.indexOf(t.hyp) }] },
    };
  },
};

// ===================================================================== calculer l'hypoténuse
type Tri = { a: number; b: number; c: number; unit: string; dp: number };
function hypTriangle(rng: Rng, level: Level): Tri {
  if (level === 1) {
    const [a, b, c] = rng.pick(triplets(30));
    return rng.chance(0.5) ? { a, b, c, unit: 'cm', dp: 1 } : { a: b, b: a, c, unit: 'cm', dp: 1 };
  }
  const k = rng.weighted([['rond', 5], ['dec', 3], ['grand', 1.5]] as const);
  if (k === 'dec') {
    // triplet décimal : 1,4 et 4,8 → 5 ; 0,9 et 1,2 → 1,5
    const [a0, b0, c0] = rng.pick(PRIMITIVE.slice(0, 4));
    const f = rng.pick([0.1, 0.2, 0.3, 0.5]);
    const [a, b, c] = [a0, b0, c0].map((x) => round(x * f, 3));
    return { a, b, c, unit: rng.pick(['cm', 'm']), dp: 1 };
  }
  if (k === 'grand') {
    const [a, b, c] = rng.pick(triplets(100).filter((t) => t[2] > 30));
    return { a, b, c, unit: 'cm', dp: 1 };
  }
  for (;;) {
    const a = rng.int(2, 15), b = rng.int(2, 15);
    const c = Math.sqrt(a * a + b * b);
    if (Number.isInteger(c) || a === b) continue;
    return { a, b, c, unit: rng.pick(['cm', 'cm', 'm']), dp: rng.chance(0.75) ? 1 : 2 };
  }
}
function hypCase(rng: Rng, level: Level) {
  const T = hypTriangle(rng, level);
  const t = pickTriangle(rng);
  const s2 = round(T.a * T.a + T.b * T.b, 6);
  const f = lengthField(m(`${t.hyp} ${'='}`), T.c, T.unit, T.dp);
  if (!f.exact) f.label = m(`${t.hyp} \\approx`);
  const figure = rightTriangleSvg({ R: t.R, P: t.P, Q: t.Q, lp: T.a, lq: T.b, rot: rng.pick(ROTS), flip: rng.chance(0.5), labels: { RP: `${dt2(T.a)} ${T.unit}`, RQ: `${dt2(T.b)} ${T.unit}`, PQ: '?' }, ask: 'PQ', aria: `Triangle ${t.name} rectangle en ${t.R} : ${t.legP} = ${dt2(T.a)} ${T.unit}, ${t.legQ} = ${dt2(T.b)} ${T.unit}, ${t.hyp} cherché` });
  return { T, t, s2, f, figure };
}
const dt2 = (v: number) => dx(v).replace('{,}', ',');
export const calculHyp: Generator = {
  id: 'calcul-hypotenuse',
  title: 'Calculer l’hypoténuse',
  desc: 'On additionne les carrés, puis racine carrée (et arrondi).',
  stars: 1,
  levels: [1, 2],
  example: 'BC^2 = 5^2 + 12^2',
  course: LINKS.s34,
  links: [LINKS.s36, LINKS.ch4],
  generate(rng: Rng, level: Level) {
    const { T, t, s2, f, figure } = hypCase(rng, level);
    const u = T.unit;
    const rt = unitTxt(u, T.dp);
    const steps: Step[] = [
      {
        prompt: `Calcule ${m(`${t.hyp}^2`)}.`,
        answer: { kind: 'num', fields: [{ label: m(`${t.hyp}^2 =`), expect: qd(s2), form: 'any' }] },
        hint: `Le triangle est rectangle en ${m(t.R)} : l’hypoténuse est ${m(`[${t.hyp}]`)}. ${m(`${t.hyp}^2 = ${t.legP}^2 + ${t.legQ}^2`)}.`,
        mistakes: mist(qd(s2), [
          [qd(round((T.a + T.b) ** 2, 6)), `${m(`${t.legP}^2 + ${t.legQ}^2`)} n’est pas ${m(`(${t.legP} + ${t.legQ})^2`)} : on élève **chaque** longueur au carré, puis on additionne.`],
          [qd(round(Math.abs(T.a * T.a - T.b * T.b), 6)), 'On cherche l’hypoténuse : on **additionne** les carrés.'],
          [qd(round(2 * T.a + 2 * T.b, 6)), `${m(`${dx(T.a)}^2 = ${dx(T.a)} \\times ${dx(T.a)}`)}, pas ${m(`2 \\times ${dx(T.a)}`)}.`],
          [qd(round(T.a + T.b, 6)), 'Il faut les **carrés** des deux côtés de l’angle droit.'],
        ]),
      },
      {
        prompt: f.exact ? `Déduis-en ${m(t.hyp)}.` : `Déduis-en ${m(t.hyp)}, arrondi ${rt}.`,
        answer: { kind: 'num', fields: [f] },
        hint: `${m(t.hyp)} est le nombre positif dont le carré vaut ${m(dx(s2))} : ${m(`${t.hyp} = \\sqrt{${dx(s2)}}`)}.`,
        mistakes: mist(f.expect, [
          [qd(s2), `Ça, c’est ${m(`${t.hyp}^2`)}. Pour obtenir ${m(t.hyp)}, on prend la **racine carrée**.`],
          [mq(T.a + T.b, T.dp), `La racine d’une somme n’est pas la somme des racines : ${m(`\\sqrt{${dx(T.a)}^2 + ${dx(T.b)}^2} \\neq ${dx(T.a)} + ${dx(T.b)}`)}.`],
        ]),
      },
    ];
    const lines: Rich[] = [
      `Le triangle ${m(t.name)} est rectangle en ${m(t.R)}. D’après le théorème de Pythagore :`,
      m(`${t.hyp}^2 = ${t.legP}^2 + ${t.legQ}^2`),
      m(`${t.hyp}^2 = ${dx(T.a)}^2 + ${dx(T.b)}^2 = ${dx(sq(T.a))} + ${dx(sq(T.b))} = ${dx(s2)}`),
      f.exact ? `Donc ${m(`${t.hyp} = \\sqrt{${dx(s2)}} = ${dx(T.c)}\\,\\text{${u}}`)}.` : `Donc ${m(`${t.hyp} = \\sqrt{${dx(s2)}} \\approx ${lenTex(f)}\\,\\text{${u}}`)} (arrondi ${rt}).`,
      `Contrôle : ${m(dx(f.exact ? T.c : toNum(f.expect)))} est plus grand que ${m(dx(T.a))} et que ${m(dx(T.b))} : c’est cohérent pour une hypoténuse.`,
    ];
    return {
      title: `${m(t.name)} est rectangle en ${m(t.R)}, avec ${m(`${t.legP} = ${dx(T.a)}\\,\\text{${u}}`)} et ${m(`${t.legQ} = ${dx(T.b)}\\,\\text{${u}}`)}. Calcule ${m(t.hyp)}.`,
      figure,
      steps,
      solution: lines,
      answer: m(`${t.hyp} ${f.exact ? '=' : '\\approx'} ${lenTex(f)}\\,\\text{${u}}`),
      key: `${T.a},${T.b},${T.unit},${t.name}${t.R}`,
      data: { kind: 'pyth', a: T.a, b: T.b, c: T.c, items: [{ what: 'carré', js: `${T.a}**2 + ${T.b}**2`, expect: s2, tol: 1e-9 }, { what: 'hypoténuse', js: `Math.hypot(${T.a}, ${T.b})`, expect: T.c, tol: 1e-9 }] },
    };
  },
};

// ===================================================================== calculer un côté de l'angle droit
export const calculCote: Generator = {
  id: 'calcul-cote',
  title: 'Calculer un côté de l’angle droit',
  desc: 'On soustrait les carrés ; décimaux, arrondis, unités (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '13^2 = 5^2 + LM^2',
  course: LINKS.s35,
  links: [LINKS.s38],
  generate(rng: Rng, level: Level) {
    // T : côté connu a, cherché b, hypoténuse c
    let a: number, b: number, c: number, unit = 'cm', dp = 1;
    let conv: { from: string; val: number; factor: number } | null = null;
    if (level === 1) {
      [a, b, c] = rng.pick(triplets(30));
      if (rng.chance(0.5)) [a, b] = [b, a];
    } else if (level === 2) {
      if (rng.chance(0.45)) {
        const [a0, b0, c0] = rng.pick(PRIMITIVE.slice(0, 4));
        const f = rng.pick([0.2, 0.3, 0.4, 0.5, 0.6]);
        [a, b, c] = [a0, b0, c0].map((x) => round(x * f, 3));
        if (rng.chance(0.5)) [a, b] = [b, a];
      } else {
        do {
          c = rng.int(6, 20);
          a = rng.int(2, c - 1);
          b = Math.sqrt(c * c - a * a);
        } while (Number.isInteger(b) || b < 1.5);
        dp = rng.chance(0.8) ? 1 : 2;
      }
    } else {
      // conversion : hypoténuse donnée dans une autre unité (B6 : GK = 65 dm, GH = 2,5 m)
      const [a0, b0, c0] = rng.pick(PRIMITIVE.slice(0, 4));
      const f = rng.pick([0.5, 1, 1.5, 2]);
      [a, b, c] = [a0, b0, c0].map((x) => round(x * f, 3));
      if (rng.chance(0.5)) [a, b] = [b, a];
      unit = 'm';
      conv = rng.pick([{ from: 'dm', val: round(c * 10, 3), factor: 10 }, { from: 'cm', val: round(c * 100, 3), factor: 100 }]);
    }
    const t = pickTriangle(rng);
    const c2 = sq(c), a2 = sq(a), b2 = round(c2 - a2, 6);
    const f = lengthField(m(`${t.legQ} =`), b, unit, dp);
    if (!f.exact) f.label = m(`${t.legQ} \\approx`);
    const rt = unitTxt(unit, dp);
    const steps: Step[] = [];
    if (conv) steps.push({ prompt: `Convertis ${m(t.hyp)} en mètres.`, answer: { kind: 'num', fields: [{ label: m(`${t.hyp} =`), unit: 'm', expect: qd(c), form: 'any' }] }, hint: `${conv.from === 'dm' ? `${m('1\\,\\text{m} = 10\\,\\text{dm}')}` : `${m('1\\,\\text{m} = 100\\,\\text{cm}')}`} : on divise par ${m(String(conv.factor))}.`, mistakes: mist(qd(c), [[qd(round(conv.val * conv.factor, 3)), `On passe de ${conv.from} à m : on **divise** par ${conv.factor}.`]]) });
    steps.push({
      prompt: `Calcule ${m(`${t.legQ}^2`)}.`,
      answer: { kind: 'num', fields: [{ label: m(`${t.legQ}^2 =`), expect: qd(b2), form: 'any' }] },
      hint: `L’hypoténuse est ${m(`[${t.hyp}]`)} (face à l’angle droit). ${m(`${t.hyp}^2 = ${t.legP}^2 + ${t.legQ}^2`)} : on cherche un côté de l’angle droit, on **soustrait**.`,
      mistakes: mist(qd(b2), [
        [qd(round(c2 + a2, 6)), `On cherche un côté de l’angle droit, pas l’hypoténuse : ${m(`${t.legQ}^2 = ${t.hyp}^2 - ${t.legP}^2`)}. On **soustrait**.`],
        [qd(round(a2 - c2, 6)), `C’est l’hypoténuse ${m(`[${t.hyp}]`)} (le plus long côté) dont on soustrait l’autre carré.`],
        [qd(round((c - a) ** 2, 6)), `${m(`${t.hyp}^2 - ${t.legP}^2`)} n’est pas ${m(`(${t.hyp} - ${t.legP})^2`)}.`],
        ...(conv ? ([[qd(round(sq(conv.val) - a2, 6)), 'Convertis d’abord toutes les longueurs dans la même unité.']] as [ReturnType<typeof q>, Rich][]) : []),
      ]),
    });
    steps.push({
      prompt: f.exact ? `Déduis-en ${m(t.legQ)}.` : `Déduis-en ${m(t.legQ)}, arrondi ${rt}.`,
      answer: { kind: 'num', fields: [f] },
      hint: `${m(`${t.legQ} = \\sqrt{${dx(b2)}}`)}.`,
      mistakes: mist(f.expect, [
        [qd(b2), `Ça, c’est ${m(`${t.legQ}^2`)}. On prend la **racine carrée**.`],
        [mq(Math.sqrt(c2 + a2), dp), 'Tu as additionné les carrés : on trouverait un côté plus long que l’hypoténuse, impossible.'],
        [mq(c - a, dp), `${m(`\\sqrt{${dx(c)}^2 - ${dx(a)}^2} \\neq ${dx(c)} - ${dx(a)}`)}.`],
      ]),
    });
    const lines: Rich[] = [];
    if (conv) lines.push(`On convertit : ${m(`${t.hyp} = ${dx(conv.val)}\\,\\text{${conv.from}} = ${dx(c)}\\,\\text{m}`)}.`);
    lines.push(`Le triangle ${m(t.name)} est rectangle en ${m(t.R)}. D’après le théorème de Pythagore :`);
    lines.push(m(`${t.hyp}^2 = ${t.legP}^2 + ${t.legQ}^2`));
    lines.push(m(`${dx(c)}^2 = ${dx(a)}^2 + ${t.legQ}^2`));
    lines.push(m(`${dx(c2)} = ${dx(a2)} + ${t.legQ}^2`));
    lines.push(m(`${t.legQ}^2 = ${dx(c2)} - ${dx(a2)} = ${dx(b2)}`));
    lines.push(f.exact ? `Donc ${m(`${t.legQ} = \\sqrt{${dx(b2)}} = ${dx(b)}\\,\\text{${unit}}`)}.` : `Donc ${m(`${t.legQ} = \\sqrt{${dx(b2)}} \\approx ${lenTex(f)}\\,\\text{${unit}}`)} (arrondi ${rt}).`);
    lines.push(`Contrôle : ${m(`${lenTex(f)} < ${dx(c)}`)} ; un côté de l’angle droit est plus court que l’hypoténuse.`);
    const cTxt = conv ? `${dx(conv.val)}\\,\\text{${conv.from}}` : `${dx(c)}\\,\\text{${unit}}`;
    const figure = rightTriangleSvg({ R: t.R, P: t.P, Q: t.Q, lp: a, lq: b, rot: rng.pick(ROTS), flip: rng.chance(0.5), labels: { RP: `${dt2(a)} ${unit}`, PQ: conv ? `${dt2(conv.val)} ${conv.from}` : `${dt2(c)} ${unit}`, RQ: '?' }, ask: 'RQ', aria: `Triangle ${t.name} rectangle en ${t.R} : ${t.legP} = ${dt2(a)} ${unit}, ${t.hyp} = ${conv ? `${dt2(conv.val)} ${conv.from}` : `${dt2(c)} ${unit}`}, ${t.legQ} cherché` });
    return {
      title: `${m(t.name)} est rectangle en ${m(t.R)}, avec ${m(`${t.hyp} = ${cTxt}`)} et ${m(`${t.legP} = ${dx(a)}\\,\\text{${unit}}`)}. Calcule ${m(t.legQ)}${conv ? ' en mètres' : ''}.`,
      figure,
      steps,
      solution: lines,
      answer: m(`${t.legQ} ${f.exact ? '=' : '\\approx'} ${lenTex(f)}\\,\\text{${unit}}`),
      key: `${a},${c},${unit},${conv?.from ?? ''},${t.name}${t.R}`,
      data: { kind: 'pyth', a, b, c, items: [{ what: 'carré', js: `${c}**2 - ${a}**2`, expect: b2, tol: 1e-9 }, { what: 'côté', js: `Math.sqrt(${c}**2 - ${a}**2)`, expect: b, tol: 1e-9 }, ...(conv ? [{ what: 'conversion', js: `${conv.val} / ${conv.factor}`, expect: c, tol: 1e-9 }] : [])] },
    };
  },
};

// ===================================================================== réciproque
export const reciproque: Generator = {
  id: 'reciproque',
  title: 'Rectangle ou pas ? (réciproque)',
  desc: 'Plus grand côté, d’une part, d’autre part, conclure.',
  stars: 2,
  levels: [2, 3],
  example: '17^2 \\text{ et } 8^2 + 15^2',
  course: LINKS.s42,
  generate(rng: Rng, level: Level) {
    const right = rng.chance(0.5);
    let s: [number, number, number];
    const unit = 'cm';
    const extra = [[28, 45, 53], [33, 56, 65], [11, 60, 61], [16, 63, 65], [13, 84, 85]] as [number, number, number][];
    if (level === 2) {
      const [a, b, c] = rng.pick(triplets(41));
      if (right) s = [a, b, c];
      else {
        // presque rectangle : on décale un côté de 1 ou 2 (piège des valeurs proches), ou triangle quelconque
        const d = rng.pick([-2, -1, 1, 2]);
        s = rng.chance(0.7) ? [a, b, c + d] : [rng.int(4, 12), rng.int(5, 14), rng.int(9, 20)];
      }
    } else {
      const [a, b, c] = rng.pick([...PRIMITIVE.slice(0, 4), ...extra]);
      const f = c > 30 ? 0.1 : rng.pick([0.1, 0.2, 0.5]);
      s = [a, b, c].map((x) => round(x * f, 3)) as [number, number, number];
      if (!right) {
        const i = rng.int(0, 2);
        s[i] = round(s[i] + rng.pick([-0.2, -0.1, 0.1, 0.2]), 3);
      }
    }
    const sorted = [...s].sort((x, y) => x - y);
    if (sorted[0] + sorted[1] <= sorted[2] || new Set(s).size < 3) return reciproque.generate(rng, level);
    const isRight = Math.abs(sq(sorted[0]) + sq(sorted[1]) - sq(sorted[2])) < 1e-9;
    if (isRight !== right) return reciproque.generate(rng, level);
    // noms : le sommet face au plus grand côté est « R »
    const t = pickTriangle(rng);
    const sides = rng.shuffle([sorted[0], sorted[1]]);
    const val: Record<string, number> = { [t.hyp]: sorted[2], [t.legP]: sides[0], [t.legQ]: sides[1] };
    const shown = rng.shuffle([t.hyp, t.legP, t.legQ]);
    const big = t.hyp, o1 = [t.legP, t.legQ].sort()[0], o2 = [t.legP, t.legQ].sort()[1];
    const B2 = sq(val[big]), S2 = round(sq(val[o1]) + sq(val[o2]), 6);
    const verts = t.name.split('');
    const concl = [...verts.map((v) => `Rectangle en ${m(v)}`), 'Pas rectangle'];
    const correct = isRight ? verts.indexOf(t.R) : 3;
    const steps: Step[] = [
      { prompt: 'Quel est le plus grand côté ?', answer: { kind: 'choice', options: shown.map((x) => m(`[${x}]`)), correct: shown.indexOf(big), explain: shown.map((x) => (x === big ? null : `${m(`${x} = ${dx(val[x])}`)} n’est pas le plus grand : compare les trois longueurs.`)), attempts: 2 }, hint: 'Seul le plus grand côté peut être l’hypoténuse.' },
      { prompt: `D’une part : calcule ${m(`${big}^2`)}.`, answer: { kind: 'num', fields: [{ label: m(`${big}^2 =`), expect: qd(B2), form: 'any' }] }, hint: `Le carré du plus grand côté : ${m(`${dx(val[big])}^2`)}.`, mistakes: mist(qd(B2), [[qd(round(2 * val[big], 6)), `${m(`${dx(val[big])}^2 = ${dx(val[big])} \\times ${dx(val[big])}`)}.`]]) },
      { prompt: `D’autre part : calcule ${m(`${o1}^2 + ${o2}^2`)}.`, answer: { kind: 'num', fields: [{ label: m(`${o1}^2 + ${o2}^2 =`), expect: qd(S2), form: 'any' }] }, hint: 'La somme des carrés des deux autres côtés.', mistakes: mist(qd(S2), [[qd(round((val[o1] + val[o2]) ** 2, 6)), `On additionne les **carrés** : ${m(`${dx(val[o1])}^2 + ${dx(val[o2])}^2`)}, pas le carré de la somme.`]]) },
      {
        prompt: 'Conclus.',
        answer: {
          kind: 'choice',
          options: concl,
          correct,
          explain: concl.map((_, i) =>
            i === correct
              ? null
              : i === 3
                ? `Les deux résultats sont **égaux** : d’après la réciproque du théorème de Pythagore, le triangle est rectangle.`
                : !isRight
                  ? `Les deux résultats sont **différents** : le triangle n’est pas rectangle (sinon, d’après le théorème de Pythagore, on aurait l’égalité).`
                  : `L’angle droit est **en face** du plus grand côté ${m(`[${big}]`)}, pas à une de ses extrémités.`,
          ),
          attempts: 2,
        },
        hint: 'Égalité : rectangle, avec l’angle droit en face du plus grand côté. Pas d’égalité : pas rectangle.',
      },
    ];
    const lines: Rich[] = [
      `Le plus grand côté est ${m(`[${big}]`)}.`,
      `D’une part : ${m(`${big}^2 = ${dx(val[big])}^2 = ${dx(B2)}`)}.`,
      `D’autre part : ${m(`${o1}^2 + ${o2}^2 = ${dx(val[o1])}^2 + ${dx(val[o2])}^2 = ${dx(sq(val[o1]))} + ${dx(sq(val[o2]))} = ${dx(S2)}`)}.`,
      isRight
        ? `On constate que ${m(`${big}^2 = ${o1}^2 + ${o2}^2`)}. D’après la réciproque du théorème de Pythagore, le triangle ${m(t.name)} est rectangle en ${m(t.R)} (le sommet qui n’appartient pas à ${m(`[${big}]`)}).`
        : `On constate que ${m(`${big}^2 \\neq ${o1}^2 + ${o2}^2`)}. Le triangle ${m(t.name)} n’est donc pas rectangle (s’il l’était, d’après le théorème de Pythagore, on aurait l’égalité).`,
    ];
    return {
      title: `Le triangle ${m(t.name)} a pour côtés ${shown.map((x) => m(`${x} = ${dx(val[x])}\\,\\text{${unit}}`)).join(', ').replace(/, ([^,]*)$/, ' et $1')}. Est-il rectangle ?`,
      steps,
      solution: lines,
      answer: isRight ? `rectangle en ${m(t.R)}` : 'pas rectangle',
      key: `${shown.map((x) => `${x}${val[x]}`).join(',')}`,
      data: {
        kind: 'js',
        items: [
          { what: 'carré du plus grand', js: `Math.max(${s.join(',')})**2`, expect: B2, tol: 1e-9 },
          { what: 'somme', js: `[${s.join(',')}].sort((a,b)=>a-b).slice(0,2).reduce((t,x)=>t+x*x,0)`, expect: S2, tol: 1e-9 },
          { what: 'step:3', js: `Math.abs([${s.join(',')}].sort((a,b)=>a-b).slice(0,2).reduce((t,x)=>t+x*x,0) - Math.max(${s.join(',')})**2) < 1e-9 ? ${JSON.stringify(verts)}.indexOf(${JSON.stringify(t.name)}.split('').find((v) => !${JSON.stringify(big)}.includes(v))) : 3`, expect: correct },
        ],
      },
    };
  },
};

// ===================================================================== trouver l'erreur
export const erreur: Generator = {
  id: 'erreur',
  title: 'Trouver l’erreur',
  desc: 'Mauvaise hypoténuse, racine oubliée, racine d’une somme, rédaction.',
  stars: 2,
  levels: [2],
  example: 'AB^2 = 25 \\text{ donc } AB = 25\\ ?',
  course: LINKS.s38,
  generate(rng: Rng) {
    const kind = rng.pick(['hyp', 'racine', 'somme', 'redac'] as const);
    const name = rng.pick(['Léo', 'Inès', 'Sami', 'Nora', 'Lina', 'Hugo', 'Jade', 'Yanis']);
    const t = pickTriangle(rng);
    const [a, b, c] = rng.pick(triplets(30));
    const DIAG: Record<string, Rich> = {
      hyp: '',
      racine: 'La racine carrée a été oubliée.',
      somme: 'La racine d’une somme a été calculée comme la somme des racines.',
      redac: 'La rédaction affirme l’égalité avant de l’avoir vérifiée.',
      angle: 'Le triangle n’est pas rectangle : on ne peut pas utiliser le théorème.',
      arrondi: 'L’arrondi est faux.',
    };
    let work: Rich, good: number | null, fix: Rich[], why: Rich;
    const fem = ['Inès', 'Nora', 'Lina', 'Jade'].includes(name);
    if (kind === 'hyp') {
      // rectangle en R, on connaît un côté de l'angle droit (a) et l'hypoténuse (c) ; l'élève additionne
      const wrong = round(Math.sqrt(a * a + c * c), 1);
      work = `« ${m(t.name)} est rectangle en ${m(t.R)}, ${m(`${t.legP} = ${a}`)}, ${m(`${t.hyp} = ${c}`)}. ${m(`${t.legQ}^2 = ${a}^2 + ${c}^2 = ${a * a + c * c}`)}, donc ${m(`${t.legQ} \\approx ${dx(wrong)}`)}. »`;
      good = b;
      why = `Rectangle en ${m(t.R)} : l’hypoténuse est ${m(`[${t.hyp}]`)}. ${name} trouve ${m(`${t.legQ} \\approx ${dx(wrong)}`)}, plus long que l’hypoténuse : impossible.`;
      fix = [m(`${t.hyp}^2 = ${t.legP}^2 + ${t.legQ}^2`), m(`${c * c} = ${a * a} + ${t.legQ}^2`), m(`${t.legQ}^2 = ${c * c - a * a}`), `Donc ${m(`${t.legQ} = \\sqrt{${c * c - a * a}} = ${b}`)}.`];
    } else if (kind === 'racine') {
      work = `« ${m(`${t.hyp}^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}`)}, donc ${m(`${t.hyp} = ${c * c}`)}. »`;
      good = c;
      why = `${m(`${t.hyp}^2 = ${c * c}`)} donne ${m(`${t.hyp} = \\sqrt{${c * c}} = ${c}`)} : il faut prendre la racine carrée.`;
      fix = [m(`${t.hyp} = \\sqrt{${c * c}} = ${c}`)];
    } else if (kind === 'somme') {
      work = `« ${m(`${t.hyp} = \\sqrt{${a}^2 + ${b}^2} = ${a} + ${b} = ${a + b}`)}. »`;
      good = c;
      why = `La racine d’une somme n’est pas la somme des racines : on calcule d’abord ${m(`${a}^2 + ${b}^2 = ${c * c}`)}.`;
      fix = [m(`${t.hyp} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${c * c}} = ${c}`)];
    } else {
      work = `« On a ${m(`${t.hyp}^2 = ${t.legP}^2 + ${t.legQ}^2`)}, donc ${m(`${c}^2 = ${a}^2 + ${b}^2`)}, donc ${m(`${c * c} = ${c * c}`)}, donc le triangle est rectangle. »`;
      good = null;
      why = 'On ne peut pas commencer par l’égalité qu’on veut prouver : on calcule les deux membres **séparément** (d’une part, d’autre part), puis on compare.';
      fix = [`Le plus grand côté est ${m(`[${t.hyp}]`)}. D’une part ${m(`${t.hyp}^2 = ${c * c}`)} ; d’autre part ${m(`${t.legP}^2 + ${t.legQ}^2 = ${a * a} + ${b * b} = ${c * c}`)}.`, `On constate l’égalité : d’après la réciproque du théorème de Pythagore, ${m(t.name)} est rectangle en ${m(t.R)}.`];
    }
    const others = (['hyp', 'racine', 'somme', 'redac', 'angle'] as const).filter((k) => k !== kind);
    const bad = rng.shuffle(others).slice(0, 3).map((k) => [k === 'hyp' ? `${name} s’est trompé${fem ? 'e' : ''} d’hypoténuse.` : DIAG[k], `Ce n’est pas ça. ${why}`] as [Rich, Rich]);
    const goodTxt = kind === 'hyp' ? `${name} s’est trompé${fem ? 'e' : ''} d’hypoténuse.` : DIAG[kind];
    const steps: Step[] = [{ prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, goodTxt, bad), hint: 'Relis chaque étape : quel côté est en face de l’angle droit ? le carré ou la longueur ? une racine bien calculée ?' }];
    if (good !== null) {
      const L = kind === 'hyp' ? t.legQ : t.hyp;
      steps.push({ prompt: `Quelle est la bonne valeur de ${m(L)} ?`, answer: { kind: 'num', fields: [{ label: m(`${L} =`), expect: q(good), form: 'any' }] }, hint: 'Refais le calcul proprement, avec la méthode du cours.', mistakes: mist(q(good), [[q(good * good), 'Prends la racine carrée.']]) });
    }
    void DIAG;
    return {
      title: `${name} rédige (le triangle ${m(t.name)} est rectangle en ${m(t.R)}) :`,
      statement: work,
      steps,
      solution: [why, 'Correction :', ...fix],
      answer: goodTxt + (good !== null ? ` Bonne valeur : ${m(String(good))}.` : ''),
      key: `${kind}:${a},${b},${c}:${t.name}${t.R}`,
      data: { kind: 'pyth', a, b, c, items: good !== null ? [{ what: 'valeur', js: kind === 'hyp' ? `Math.sqrt(${c}**2 - ${a}**2)` : `Math.hypot(${a}, ${b})`, expect: good }] : [] },
    };
  },
};
export { seg };
