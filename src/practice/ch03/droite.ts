/**
 * Droite graduée et comparaison (★) : comparer, ranger, lire une abscisse, distance entre deux points.
 * Construction à rebours : on choisit les nombres (avec les pièges du cours : deux négatifs, −0,5 et −0,05…),
 * la bonne réponse en découle.
 */
import { type Q, q, add, sub, mul, neg, cmp, abs as qabs, eq, toNum, div, isInt } from '../engine/q';
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, dn, pn, js, numStep, fixedChoice, sample } from '../engine/build';
import { svgWrap, line, text, dot } from '../engine/svg';
import { orderStep, type Card } from '../engine/ordering';
import { LINKS } from './common';

const lt = (a: Q, b: Q) => cmp(a, b) < 0;

// ===================================================================== comparer
type Pair = [Q, Q];
function pairFor(rng: Rng, kind: string): Pair {
  const I = (n: number) => q(n);
  switch (kind) {
    case 'negneg': {
      const a = rng.int(1, 20), b = rng.intNot(1, 20, a);
      return [I(-a), I(-b)];
    }
    case 'negpos': {
      // le négatif a la plus grande distance à zéro (piège « 8 > 3 »)
      const a = rng.int(3, 20), b = rng.int(1, a - 1);
      return [I(-a), I(b)];
    }
    case 'zero':
      return [I(0), I(-rng.int(1, 15))];
    case 'decTrap': {
      // −0,5 et −0,05 ; −0,3 et −0,25
      const k = rng.int(1, 9);
      return rng.chance(0.5) ? [q(-k, 10), q(-k, 100)] : [q(-k, 10), q(-(10 * k - rng.int(1, 9)), 100)];
    }
    case 'decNeg': {
      // −2,3 et −2,03 ; −1,7 et −1,65 : même partie entière
      const e = rng.int(0, 9), a = rng.int(1, 9), b = rng.intNot(1, 99, a * 10);
      return [q(-(e * 10 + a), 10), q(-(e * 100 + b), 100)];
    }
    default: {
      // décimaux de signes contraires ou négatifs de parties entières différentes
      const a = rng.int(11, 99), b = rng.intNot(11, 99, a);
      return rng.chance(0.5) ? [q(-a, 10), q(-b, 10)] : [q(-a, 10), q(rng.int(1, a - 1), 10)];
    }
  }
}
function explainPair(a: Q, b: Q): Rich {
  const small = lt(a, b) ? a : b, big = lt(a, b) ? b : a;
  if (a.n < 0 && b.n < 0)
    return `Entre deux négatifs, le plus petit est le **plus loin de zéro** : la distance à zéro de ${m(dn(small))} est ${m(dn(qabs(small)))}, plus grande que ${m(dn(qabs(big)))}. Donc ${m(`${dn(small)} < ${dn(big)}`)}.`;
  if (small.n === 0 || big.n === 0) return `Un nombre négatif est plus petit que ${m('0')} : ${m(`${dn(small)} < ${dn(big)}`)}.`;
  if (small.n < 0) return `Un négatif est toujours plus petit qu’un positif, même s’il est plus loin de zéro : ${m(`${dn(small)} < ${dn(big)}`)}.`;
  return `${m(`${dn(small)} < ${dn(big)}`)}.`;
}
function reason(a: Q, b: Q): string {
  if (a.n < 0 && b.n < 0) return `deux négatifs ; le plus loin de zéro (distances ${m(dn(qabs(a)))} et ${m(dn(qabs(b)))}) est le plus petit`;
  if (a.n === 0 || b.n === 0) return `un négatif est plus petit que ${m('0')}`;
  if (a.n < 0 || b.n < 0) return 'un négatif est plus petit qu’un positif';
  return 'le plus petit est le plus à gauche';
}
export const comparer: Generator = {
  id: 'comparer',
  title: 'Comparer deux relatifs',
  desc: 'Choisir < ou > ; pièges des négatifs et des décimaux.',
  stars: 1,
  levels: [1, 2],
  example: '-8 \\;\\square\\; -3',
  course: LINKS.s22,
  generate(rng: Rng, level: Level) {
    const kinds = level === 1 ? rng.shuffle(['negneg', 'negneg', rng.pick(['negpos', 'zero', 'negpos'])]) : rng.shuffle(['decTrap', 'decNeg', rng.pick(['decMix', 'negneg'])]);
    const pairs = kinds.map((k) => {
      const [a, b] = pairFor(rng, k);
      return (rng.chance(0.5) ? [a, b] : [b, a]) as Pair;
    });
    const steps: Step[] = pairs.map(([a, b], i) => {
      const c = lt(a, b) ? 0 : 1;
      return {
        prompt: `${'abc'[i]}) ${m(`${dn(a)} \\;\\square\\; ${dn(b)}`)}`,
        answer: fixedChoice([m('<'), m('>')], c, [explainPair(a, b), explainPair(a, b)]),
        hint: 'Sur une droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est le plus loin de zéro.',
      };
    });
    const rel = (a: Q, b: Q) => `${dn(a)} ${lt(a, b) ? '<' : '>'} ${dn(b)}`;
    return {
      title: 'Compare les nombres (avec $<$ ou $>$).',
      steps,
      solution: [...pairs.map(([a, b], i) => `${'abc'[i]}) ${m(rel(a, b))} : ${reason(a, b)}.`), 'Contrôle : on imagine les points sur la droite graduée ; le plus à gauche est le plus petit.'],
      answer: pairs.map(([a, b]) => m(rel(a, b))).join(' ; '),
      key: pairs.map(([a, b]) => `${dn(a)}|${dn(b)}`).join(';'),
      data: { kind: 'js', items: pairs.map(([a, b], i) => ({ what: `step:${i}`, js: `${js(a)} < ${js(b)} ? 0 : 1`, expect: (steps[i].answer as { correct: number }).correct })) },
    };
  },
};

// ===================================================================== ranger
export const ranger: Generator = {
  id: 'ranger',
  title: 'Ranger dans l’ordre croissant',
  desc: 'Cinq ou six relatifs, du plus petit au plus grand.',
  stars: 1,
  levels: [1, 2],
  example: '4 ; -1 ; 0 ; -7 ; 2{,}5',
  course: LINKS.s22,
  generate(rng: Rng, level: Level) {
    let xs: Q[] = [];
    if (level === 1) {
      // 3 négatifs (dont deux « pièges » éloignés), 0 parfois, 1 ou 2 positifs
      const negs = sample(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 3).map((v) => q(-v));
      const nPos = rng.int(1, 2);
      const pos = sample(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], nPos).map((v) => q(v));
      xs = [...negs, ...pos, ...(rng.chance(0.5) || nPos === 1 ? [q(0)] : [])];
      if (xs.length < 5) xs.push(q(-rng.intNot(1, 15, ...negs.map((v) => -v.n))));
    } else {
      // décimaux : un couple piège de même partie entière (−2,5 et −2,05), un négatif entier, un positif décimal
      const e = rng.int(0, 4), a = rng.int(1, 9);
      const t1 = q(-(e * 10 + a), 10), t2 = q(-(e * 100 + rng.intNot(1, 9, a * 10)), 100);
      const other = q(-rng.intNot(1, 9, e, e + 1));
      const p1 = q(rng.int(1, 49), 10);
      const p2 = rng.chance(0.5) ? q(0) : q(rng.intNot(1, 9, Math.round(toNum(p1)))) ;
      xs = [t1, t2, other, p1, p2];
      if (rng.chance(0.4)) xs.push(q(-rng.int(1, 99), 100));
    }
    // valeurs distinctes
    xs = xs.filter((v, i) => xs.findIndex((w) => eq(w, v)) === i);
    const shown = rng.shuffle(xs);
    const sorted = [...xs].sort(cmp);
    // erreur typique : négatifs rangés selon leur distance à zéro
    const negs = sorted.filter((v) => v.n < 0), rest = sorted.filter((v) => v.n >= 0);
    const byDist = [...[...negs].reverse(), ...rest];
    const desc = [...sorted].reverse();
    const chain = sorted.map(dn).join(' < ');
    const lines: Rich[] = [];
    if (negs.length) lines.push(`Négatifs : ${m(negs.map(dn).join(' < '))} (le plus loin de zéro est le plus petit).`);
    if (rest.length) lines.push(`Puis ${rest[0].n === 0 ? `${m('0')}, puis ` : ''}les positifs${rest.filter((v) => v.n > 0).length > 1 ? ` : ${m(rest.filter((v) => v.n > 0).map(dn).join(' < '))}` : ` : ${m(dn(rest[rest.length - 1]))}`}.`);
    lines.push(`Donc ${m(chain)}.`);
    lines.push('Contrôle : de gauche à droite sur la droite graduée, on lit bien cet ordre.');
    const why = (A: Card, B: Card): Rich => {
      const a = A.v, b = B.v;
      if (a.n === 0 || b.n === 0) return `${m('0')} est plus grand que tout nombre négatif et plus petit que tout nombre positif.`;
      if (Math.sign(a.n) !== Math.sign(b.n)) return `Regarde les signes de ${m(A.tex)} et ${m(B.tex)} : un négatif est plus petit qu’un positif.`;
      if (a.n < 0) return `${m(A.tex)} et ${m(B.tex)} sont négatifs : le plus **loin** de zéro est le plus petit. Compare leurs distances à zéro.`;
      return Math.floor(toNum(a)) === Math.floor(toNum(b)) ? `Même partie entière : compare ${m(A.tex)} et ${m(B.tex)} rang par rang, en commençant par les dixièmes.` : `Compare d’abord les parties entières de ${m(A.tex)} et ${m(B.tex)}.`;
    };
    const step = orderStep(rng, {
      cards: shown.map((v) => ({ tex: dn(v), v })),
      dir: 'asc',
      hint: 'Sépare négatifs et positifs. Parmi les négatifs, le plus éloigné de zéro est le plus petit.',
      why,
      mistakes: [
        [negs.length > 1 ? byDist : null, 'Tu as rangé les négatifs selon leur distance à zéro. C’est l’inverse : entre deux négatifs, le plus loin de zéro est le **plus petit**.'],
        [desc, 'C’est l’ordre **décroissant**. On demande l’ordre croissant : du plus petit au plus grand.'],
      ],
    });
    return {
      title: 'Range ces nombres dans l’ordre croissant.',
      form: 'Fais glisser les cartes (ou utilise ↑ ↓), du plus petit en haut au plus grand en bas.',
      steps: [step],
      solution: lines,
      answer: m(chain),
      key: [...xs].sort(cmp).map(dn).join(';'),
      data: { kind: 'js', items: sorted.map((v, i) => ({ what: `rang ${i + 1}`, js: `[${xs.map((x) => toNum(x)).join(',')}].sort((a,b)=>a-b)[${i}]`, expect: toNum(v) })) },
    };
  },
};

// ===================================================================== lire une abscisse
/** Droite graduée dessinée à l'échelle : graduations régulières, deux nombres écrits, points à repérer. */
function lineSvg(o: { tMin: number; tMax: number; step: Q; labels: number[]; points: [string, number][] }): string {
  const W = 360, H = 86, x0 = 18, x1 = W - 18, y = 50;
  const nT = o.tMax - o.tMin;
  const px = (t: number) => x0 + ((t - o.tMin) / nT) * (x1 - x0);
  let b = line([x0 - 8, y], [x1 + 8, y], 'gf-axis');
  b += `<polygon class="gf-pt" points="${x1 + 14},${y} ${x1 + 5},${y - 4.5} ${x1 + 5},${y + 4.5}" style="fill:#1b1f24"/>`;
  for (let t = o.tMin; t <= o.tMax; t++) b += line([px(t), y - (o.labels.includes(t) ? 8 : 5)], [px(t), y + (o.labels.includes(t) ? 8 : 5)], 'gf-axis');
  for (const t of o.labels) b += text([px(t), y + 22], dn(mul(o.step, q(t))).replace('{,}', ','), 'gf-t');
  for (const [name, t] of o.points) {
    b += dot([px(t), y], 4.2);
    b += text([px(t), y - 20], name, 'gf-tb');
  }
  const lab = o.labels.map((t) => dn(mul(o.step, q(t))).replace('{,}', ',')).join(' et ');
  return svgWrap(W, H, `Droite graduée régulièrement ; seuls ${lab} sont écrits ; points ${o.points.map((p) => p[0]).join(', ')} à repérer`, b);
}
export const abscisse: Generator = {
  id: 'abscisse',
  title: 'Lire une abscisse',
  desc: 'Valeur d’une graduation, puis abscisses de points.',
  stars: 1,
  levels: [1, 2],
  example: 'E(\\,?\\,)',
  course: LINKS.s21,
  generate(rng: Rng, level: Level) {
    // graduation : (valeur écrite à droite de 0, nombre d'intervalles entre 0 et elle)
    const opts: [Q, number][] = level === 1 ? [[q(5), 5], [q(10), 5], [q(10), 2], [q(20), 2], [q(50), 5], [q(4), 2]] : [[q(1), 2], [q(1), 4], [q(1), 5], [q(1), 10], [q(2), 4], [q(3), 2]];
    const [V, k] = rng.pick(opts);
    const step = div(V, q(k));
    const tMin = -rng.int(Math.max(k + 2, 7), Math.max(k + 4, 10));
    const tMax = Math.max(k + 1, rng.int(3, 5));
    const nPts = rng.int(3, 4);
    // au moins deux points à gauche de 0, jamais sur une graduation écrite
    const avoid = [0, k];
    const left = sample(rng, Array.from({ length: -tMin - 1 }, (_, i) => -(i + 1)).filter((t) => !avoid.includes(t)), Math.min(nPts - 1, 3));
    const rightCand = Array.from({ length: tMax - 1 }, (_, i) => i + 1).filter((t) => !avoid.includes(t));
    const ts = [...left, ...(rightCand.length ? sample(rng, rightCand, nPts - left.length) : [])].sort((a, b) => a - b);
    const names = rng.pick([['E', 'F', 'G', 'H'], ['A', 'B', 'C', 'D'], ['M', 'N', 'P', 'R'], ['R', 'S', 'T', 'U']]);
    const pts: [string, number][] = ts.map((t, i) => [names[i], t]);
    const vals = ts.map((t) => mul(step, q(t)));
    const figure = lineSvg({ tMin, tMax, step, labels: [0, k], points: pts });
    const gradLine = `Entre ${m('0')} et ${m(dn(V))}, il y a ${m(String(k))} intervalles : une graduation vaut ${m(`${dn(V)} \\div ${k} = ${dn(step)}`)}.`;
    const steps: Step[] = [
      numStep('Combien vaut une graduation ?', 'Une graduation vaut', step, `Écart entre les deux nombres écrits, divisé par le nombre d’intervalles entre eux.`, [
        [V, `C’est l’écart entre ${m('0')} et ${m(dn(V))}. Il faut le **diviser** par le nombre d’intervalles (${k}).`],
        [q(k), 'Ça, c’est le nombre d’intervalles. Divise l’écart entre les deux nombres écrits par ce nombre.'],
      ]),
      {
        prompt: 'Donne l’abscisse de chaque point.',
        answer: { kind: 'num', fields: pts.map(([name], i) => ({ label: `${m(name)} :`, expect: vals[i], form: 'any' as const })) },
        hint: `Une graduation vaut ${m(dn(step))}. Compte les graduations depuis ${m('0')} : vers la droite ${m('+')}, vers la gauche ${m('-')}.`,
        mistakes: [
          ...(eq(step, q(1)) ? [] : pts.map(([, t], i) => ({ on: 'num' as const, field: i, value: q(t), msg: `Tu as compté ${m('1')} par graduation. Ici, une graduation vaut ${m(dn(step))}.` }))),
        ],
        signHint: 'Attention au signe : à gauche de zéro, les abscisses sont négatives.',
      },
    ];
    const ptLine = pts.map(([name, t], i) => `${m(name)} est à ${m(String(Math.abs(t)))} graduation${Math.abs(t) > 1 ? 's' : ''} ${t < 0 ? 'à gauche' : 'à droite'} de ${m('0')} : ${m(`${name}(${dn(vals[i])})`)}.`);
    return {
      title: 'Lis les abscisses sur la droite graduée.',
      figure,
      steps,
      solution: [gradLine, ...ptLine, 'Contrôle : les points à gauche de zéro ont une abscisse négative.'],
      answer: pts.map(([name], i) => m(`${name}(${dn(vals[i])})`)).join(' ; '),
      key: `${dn(V)}/${k}:${ts.join(',')}:${tMin}`,
      data: { kind: 'js', items: [{ what: 'graduation', js: `${toNum(V)}/${k}`, expect: toNum(step) }, ...ts.map((t, i) => ({ what: `abscisse ${pts[i][0]}`, js: `${t}*${toNum(V)}/${k}`, expect: toNum(vals[i]) }))] },
    };
  },
};

// ===================================================================== distance (et milieu)
export const distance: Generator = {
  id: 'distance',
  title: 'Distance entre deux points',
  desc: 'Plus grande abscisse moins la plus petite ; milieu (★★).',
  stars: 1,
  levels: [1, 2],
  example: 'A(-7)\\ ;\\ B(4)',
  course: LINKS.s42,
  generate(rng: Rng, level: Level) {
    let a: Q, b: Q;
    const kind = level === 1 ? rng.weighted([['contraires', 3], ['negs', 2]] as const) : rng.weighted([['contraires', 2], ['negs', 2]] as const);
    if (level === 1) {
      a = q(-rng.int(1, 15));
      b = kind === 'negs' ? q(-rng.intNot(1, 15, -a.n)) : q(rng.int(1, 15));
    } else {
      // décimaux (au dixième), avec un milieu décimal simple
      a = q(-rng.int(5, 120), 10);
      if (isInt(a)) a = add(a, q(-5, 10));
      b = kind === 'negs' ? q(-rng.intNot(5, 120, -a.n), 10) : q(rng.int(5, 120), 10);
    }
    if (rng.chance(0.5)) [a, b] = [b, a];
    const [P1, P2] = rng.pick([['A', 'B'], ['C', 'D'], ['E', 'F'], ['M', 'N'], ['R', 'S']]);
    const hi = cmp(a, b) > 0 ? a : b, lo = cmp(a, b) > 0 ? b : a;
    const hiN = eq(hi, a) ? P1 : P2, loN = eq(hi, a) ? P2 : P1;
    const d = sub(hi, lo);
    const steps: Step[] = [
      numStep(`Calcule la distance ${m(`${P1}${P2}`)}.`, m(`${P1}${P2} =`), d, 'Distance entre deux points : la plus grande abscisse moins la plus petite.', [
        [sub(lo, hi), 'Une distance est toujours **positive** : on calcule la plus grande abscisse moins la plus petite.'],
        [qabs(add(a, b)), `Tu as ajouté les abscisses. Il faut **soustraire** : ${m(`${dn(hi)} - ${pn(lo)}`)}.`],
        [qabs(sub(qabs(a), qabs(b))), `Tu as soustrait les distances à zéro. Il faut soustraire les abscisses, avec leurs signes : ${m(`${dn(hi)} - ${pn(lo)}`)}.`],
      ]),
    ];
    const lines: Rich[] = [`La plus grande abscisse est ${m(dn(hi))} (point ${m(hiN)}), la plus petite ${m(dn(lo))} (point ${m(loN)}).`, m(`${P1}${P2} = ${dn(hi)} - ${pn(lo)} = ${dn(hi)} + ${pn(neg(lo))} = ${dn(d)}`)];
    let mid: Q | null = null;
    if (level === 2) {
      mid = div(add(a, b), q(2));
      steps.push(
        numStep(`Quelle est l’abscisse du milieu ${m('I')} de ${m(`[${P1}${P2}]`)} ?`, m('I('), mid, `Le milieu est à la même distance des deux points : on part de ${m(dn(lo))} et on avance de la moitié de ${m(dn(d))}.`, [
          [div(d, q(2)), `C’est la moitié de la distance. Le milieu est à cette distance de ${m(dn(lo))} : ${m(`${dn(lo)} + ${dn(div(d, q(2)))}`)}.`],
          [add(a, b), 'Tu as oublié de diviser par 2.'],
        ], { unit: ')' }),
      );
      lines.push(`Milieu : ${m(`${dn(lo)} + ${dn(d)} \\div 2 = ${dn(lo)} + ${dn(div(d, q(2)))} = ${dn(mid)}`)}, donc ${m(`I(${dn(mid)})`)}.`);
      lines.push(`Contrôle : ${m(dn(mid))} est à ${m(dn(div(d, q(2))))} de chacun des deux points.`);
    } else lines.push(`Contrôle : sur la droite, depuis ${m(dn(lo))}, il faut avancer de ${m(dn(d))} pour atteindre ${m(dn(hi))}.`);
    return {
      title: `Sur une droite graduée, on place les points ${m(`${P1}(${dn(a)})`)} et ${m(`${P2}(${dn(b)})`)}.`,
      steps,
      solution: lines,
      answer: m(`${P1}${P2} = ${dn(d)}`) + (mid ? ` ; ${m(`I(${dn(mid)})`)}` : ''),
      key: `${dn(a)}|${dn(b)}`,
      data: { kind: 'js', items: [{ what: 'distance', js: `Math.abs(${js(a)} - ${js(b)})`, expect: toNum(d) }, ...(mid ? [{ what: 'milieu', js: `(${js(a)} + ${js(b)}) / 2`, expect: toNum(mid) }] : [])] },
    };
  },
};
