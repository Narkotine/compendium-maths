/**
 * Calculs sur les fractions (★ → ★★★) : additionner, soustraire, multiplier, diviser, priorités, trouver l'erreur.
 * Construction à rebours : on choisit les fractions irréductibles et les facteurs à simplifier ; le résultat
 * exact (rationnel) en découle, puis les erreurs typiques du cours sont calculées.
 */
import { type Q, q, add, sub, mul, div, neg, eq, toNum, gcd, isInt } from '../engine/q';
import type { Generator, Level, Mistake, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, shuffledChoice } from '../engine/build';
import { LINKS, fr, fq, fqp, lcm, factTex } from './common';
import { irr } from './nombres';

const SIGN = 'Attention au signe : tu trouves l’opposé du bon résultat. Reprends la règle des signes.';
/** Fraction irréductible aléatoire n/d (d dans la liste, 0 < n < max·d). */
function rf(rng: Rng, dens: number[], maxRatio = 1, avoidInt = true): [number, number] {
  for (;;) {
    const d = rng.pick(dens), n = rng.int(1, Math.max(1, Math.floor(maxRatio * d)));
    if (gcd(n, d) === 1 && (!avoidInt || n % d !== 0 || d === 1)) return [n, d];
  }
}
const Qf = (f: [number, number]) => q(f[0], f[1]);
const jsF = (f: [number, number]) => `(${f[0]}/${f[1]})`;
const simpl = (n: number, d: number): string => {
  const v = q(n, d);
  return v.n === n && v.d === d ? '' : ` = ${fq(v)}`;
};
const step = (prompt: Rich, label: Rich, v: Q, hint: Rich, mistakes: [Q | null | undefined, Rich][] = [], signHint?: Rich): Step => ({
  prompt, answer: { kind: 'num', fields: [irr(label, v)] }, hint, mistakes: mist(v, mistakes), ...(signHint ? { signHint } : {}),
});

// ===================================================================== additionner, soustraire
/** a/b ± c/d : ligne de calcul complète au dénominateur commun le plus petit. */
function sumLine(name: string, A: [number, number], C: [number, number], op: '+' | '-'): { v: Q; line: Rich; L: number } {
  const [a, b] = A, [c, d] = C, L = lcm(b, d);
  const n1 = a * (L / b), n2 = c * (L / d), n = op === '+' ? n1 + n2 : n1 - n2;
  const left = `${b === 1 ? String(a) : fr(a, b)} ${op} ${d === 1 ? String(c) : fr(c, d)}`;
  const conv = b === L && d === L ? '' : ` = ${fr(n1, L)} ${op} ${fr(n2, L)}`;
  return { v: q(n, L), L, line: m(`${name} = ${left}${conv} = ${fr(n, L)}${simpl(n, L)}`) };
}
export const addition: Generator = {
  id: 'addition',
  title: 'Additionner, soustraire',
  desc: 'Même dénominateur, puis dénominateurs différents ; relatifs (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '\\dfrac{5}{6} - \\dfrac{1}{4} = \\dfrac{7}{12}',
  course: LINKS.s4,
  links: [LINKS.s82],
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number }[] = [], ans: Rich[] = [];
    const addDen = 'On n’ajoute pas les dénominateurs : ils donnent la **taille** des parts. On met au même dénominateur, puis on ajoute les numérateurs.';
    if (level === 1) {
      // a) même dénominateur
      const d = rng.int(4, 15), op = rng.pick(['+', '-'] as const);
      let a: number, c: number;
      do { a = rng.int(1, d + 3); c = rng.int(1, d); } while (a === c || (op === '-' && a <= c) || gcd(a, d) !== 1 || gcd(c, d) !== 1);
      const r = sumLine('A', [a, d], [c, d], op);
      steps.push(step(`a) ${m(`A = ${fr(a, d)} ${op} ${fr(c, d)}`)}`, m('A ='), r.v, `Même dénominateur : on ${op === '+' ? 'ajoute' : 'soustrait'} les numérateurs et on **garde** le dénominateur ${m(String(d))}.`,
        [[q(op === '+' ? a + c : a - c, op === '+' ? 2 * d : 1), op === '+' ? addDen : `Tu as oublié le dénominateur : on le **garde** (${m(String(d))}).`]]));
      sol.push(`a) ${r.line}.`);
      items.push({ what: 'A', js: `${a}/${d} ${op} ${c}/${d}`, expect: toNum(r.v) });
      ans.push(m(`A = ${fq(r.v)}`));
      // b) entier ± fraction
      const n = rng.int(1, 4), op2 = rng.pick(['+', '-'] as const);
      let e: number, f: number;
      do { f = rng.int(2, 10); e = rng.int(1, f - 1); } while (gcd(e, f) !== 1);
      const r2 = sumLine('B', [n, 1], [e, f], op2);
      steps.push(step(`b) ${m(`B = ${n} ${op2} ${fr(e, f)}`)}`, m('B ='), r2.v, `Écris ${m(String(n))} comme une fraction de dénominateur ${m(String(f))} : ${m(`${n} = ${fr(n * f, f)}`)}.`,
        [[q(op2 === '+' ? n + e : n - e, f), `${m(String(n))} n’est pas ${m(fr(n, f))} : ${m(`${n} = ${fr(n * f, f)}`)}.`], [q(op2 === '+' ? n + e : n - e, 1 + f), addDen]]));
      sol.push(`b) ${r2.line}.`);
      items.push({ what: 'B', js: `${n} ${op2} ${e}/${f}`, expect: toNum(r2.v) });
      ans.push(m(`B = ${fq(r2.v)}`));
      sol.push('Contrôle : on peut vérifier à la calculatrice en écriture décimale.');
    } else if (level === 2) {
      // deux calculs : un multiple (b divise d) et un cas général (multiple commun ≤ 60)
      const mkPair = (kind: 'mult' | 'gen'): [[number, number], [number, number]] => {
        for (;;) {
          const A = rf(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 1.3), C = rf(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 1.3);
          const L = lcm(A[1], C[1]);
          if (A[1] === C[1]) continue;
          if (kind === 'mult' && L !== Math.max(A[1], C[1])) continue;
          if (kind === 'gen' && (L === Math.max(A[1], C[1]) || L === A[1] * C[1] && L > 40 || L > 60)) continue;
          return [A, C];
        }
      };
      const ops = rng.shuffle(['+', '-'] as const);
      const kinds = rng.shuffle(['mult', 'gen'] as const);
      kinds.forEach((k, i) => {
        let [A, C] = mkPair(k);
        const op = ops[i];
        if (op === '-' && A[0] / A[1] < C[0] / C[1]) [A, C] = [C, A];
        const nm = 'AB'[i];
        const r = sumLine(nm, A, C, op);
        const naive = op === '+' ? q(A[0] + C[0], A[1] + C[1]) : A[1] - C[1] > 0 && A[0] - C[0] > 0 ? q(A[0] - C[0], A[1] - C[1]) : null;
        steps.push(step(`${'ab'[i]}) ${m(`${nm} = ${fr(...A)} ${op} ${fr(...C)}`)}`, m(`${nm} =`), r.v, `Cherche le plus petit multiple commun de ${m(String(A[1]))} et ${m(String(C[1]))} : c’est ${m(String(r.L))}.`,
          [[naive, addDen], [q(op === '+' ? A[0] + C[0] : A[0] - C[0], r.L), `Au dénominateur ${m(String(r.L))}, il faut aussi transformer les **numérateurs** : ${m(`${fr(...A)} = ${fr(A[0] * (r.L / A[1]), r.L)}`)}.`]], SIGN));
        sol.push(`${'ab'[i]}) Multiple commun de ${m(String(A[1]))} et ${m(String(C[1]))} : ${m(String(r.L))}. ${r.line}.`);
        items.push({ what: nm, js: `${jsF(A)} ${op} ${jsF(C)}`, expect: toNum(r.v) });
        ans.push(m(`${nm} = ${fq(r.v)}`));
      });
      sol.push(`Contrôle : ${items.map((it, i) => m(`${'AB'[i]} \\approx ${it.expect.toFixed(2).replace('.', '{,}')}`)).join(' ; ')} à la calculatrice.`);
    } else {
      // ★★★ : trois termes, résultat parfois négatif
      let A: [number, number], B: [number, number], C: [number, number], o1: '+' | '-', o2: '+' | '-', v: Q, L: number;
      do {
        A = rf(rng, [2, 3, 4, 5, 6, 8, 9, 10, 12], 1.5); B = rf(rng, [2, 3, 4, 5, 6, 8, 9, 12], 1.2); C = rf(rng, [2, 3, 4, 6, 8, 12, 5, 10], 1.2);
        o1 = rng.pick(['+', '-']); o2 = rng.pick(['+', '-']);
        L = lcm(lcm(A[1], B[1]), C[1]);
        v = (o2 === '+' ? add : sub)((o1 === '+' ? add : sub)(Qf(A), Qf(B)), Qf(C));
      } while (L > 60 || new Set([A[1], B[1], C[1]]).size < 2 || (o1 === '+' && o2 === '+') || v.n === 0 || isInt(v) || v.d < 4);
      const n = [A, B, C].map((f) => f[0] * (L / f[1]));
      const tot = n[0] + (o1 === '+' ? n[1] : -n[1]) + (o2 === '+' ? n[2] : -n[2]);
      steps.push(step(m(`C = ${fr(...A)} ${o1} ${fr(...B)} ${o2} ${fr(...C)}`), m('C ='), v, `Dénominateur commun aux trois : ${m(String(L))}. Calcule de gauche à droite.`,
        [[neg(v), SIGN]], SIGN));
      sol.push(`Multiple commun de ${m(String(A[1]))}, ${m(String(B[1]))} et ${m(String(C[1]))} : ${m(String(L))}.`);
      sol.push(m(`C = ${fr(n[0], L)} ${o1} ${fr(n[1], L)} ${o2} ${fr(n[2], L)} = ${fr(tot, L)}${simpl(tot, L)}`) + '.');
      if (v.n < 0) sol.push(`Le résultat est négatif : on a retiré plus qu’on n’a ajouté (${m(`${n[0]}${o1 === '+' ? ' + ' : ' - '}${n[1]}${o2 === '+' ? ' + ' : ' - '}${n[2]} = ${tot}`)}).`);
      sol.push(`Contrôle : ${m(`C \\approx ${toNum(v).toFixed(3).replace('.', '{,}').replace('-', '-')}`)} à la calculatrice.`);
      items.push({ what: 'C', js: `${jsF(A)} ${o1} ${jsF(B)} ${o2} ${jsF(C)}`, expect: toNum(v) });
      ans.push(m(`C = ${fq(v)}`));
    }
    return {
      title: 'Calcule et donne le résultat sous forme irréductible.',
      steps,
      solution: sol,
      answer: ans.join(' ; '),
      key: steps.map((s) => s.prompt).join('|'),
      data: { kind: 'js', items },
    };
  },
};

// ===================================================================== multiplier
export const produit: Generator = {
  id: 'produit',
  title: 'Multiplier des fractions',
  desc: 'Simplifier avant de multiplier ; entier × fraction ; signes (★★).',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{6}{35} \\times \\dfrac{14}{9} = \\dfrac{4}{15}',
  course: LINKS.s52,
  generate(rng: Rng, level: Level) {
    // à rebours : résultat p·s / (r·t), facteurs croisés g1 et g2 à simplifier
    const pairFr = (big: boolean): [[number, number], [number, number]] => {
      for (;;) {
        const p = rng.int(1, 7), r = rng.int(1, 9), s = rng.int(1, 7), t = rng.int(1, 9);
        const g1 = rng.int(2, big ? 9 : 5), g2 = rng.int(big ? 2 : 1, big ? 9 : 5);
        const A: [number, number] = [p * g1, r * g2], B: [number, number] = [s * g2, t * g1];
        if (gcd(A[0], A[1]) !== 1 || gcd(B[0], B[1]) !== 1 || A[1] === 1 || B[1] === 1 || A[0] % A[1] === 0) continue;
        if (Math.max(...A, ...B) > (big ? 72 : 40)) continue;
        if (isInt(q(p * s, r * t)) && rng.chance(0.7)) continue;
        return [A, B];
      }
    };
    const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number }[] = [], ans: Rich[] = [];
    const prodLine = (nm: string, fs: [number, number][], signs: number[]) => {
      const num = fs.map((f) => f[0]), den = fs.map((f) => f[1]);
      const N = num.reduce((x, y) => x * y, 1), D = den.reduce((x, y) => x * y, 1);
      const neg = signs.filter((x) => x < 0).length % 2 === 1;
      const v = q(neg ? -N : N, D);
      const show = fs.map((f, i) => (signs[i] < 0 ? `\\left(${fr(-f[0], f[1])}\\right)` : fr(f[0], f[1]))).join(' \\times ');
      const lines: Rich[] = [];
      const sgn = neg ? '-' : '';
      if (signs.some((x) => x < 0)) lines.push(`${m(`${nm} = ${show}`)} : ${signs.filter((x) => x < 0).length} facteur${signs.filter((x) => x < 0).length > 1 ? 's' : ''} négatif${signs.filter((x) => x < 0).length > 1 ? 's' : ''}, le produit est ${neg ? 'négatif' : 'positif'}.`);
      lines.push(m(`${nm} = ${sgn}\\dfrac{${num.join(' \\times ')}}{${den.join(' \\times ')}} = ${sgn}\\dfrac{${num.map(factTex).join(' \\times ')}}{${den.map(factTex).join(' \\times ')}}`) + '.');
      lines.push(`On simplifie les facteurs communs : ${m(`${nm} = ${fq(v)}`)}.`);
      return { v, lines, show };
    };
    if (level === 1) {
      const [A, B] = pairFr(false);
      const r = prodLine('A', [A, B], [1, 1]);
      steps.push(step(`a) ${m(`A = ${r.show}`)}`, m('A ='), r.v, 'Écris le produit sur une seule barre de fraction, décompose, simplifie **avant** de multiplier.',
        [[q(A[0] * B[1], A[1] * B[0]), 'Ça, c’est la division. Pour multiplier : numérateurs entre eux, dénominateurs entre eux.'], [q(A[0] + B[0], A[1] + B[1]), 'On ne fait pas de somme : numérateurs entre eux, dénominateurs entre eux, **multipliés**.']]));
      sol.push('a) ' + r.lines[0], ...r.lines.slice(1));
      items.push({ what: 'A', js: `${jsF(A)} * ${jsF(B)}`, expect: toNum(r.v) });
      ans.push(m(`A = ${fq(r.v)}`));
      // b) entier × fraction, l'entier ayant un facteur commun avec le dénominateur (souvent)
      let n: number, e: number, f: number;
      do { f = rng.int(3, 12); e = rng.int(1, f - 1); n = rng.int(2, 12); } while (gcd(e, f) !== 1 || (gcd(n, f) === 1 && rng.chance(0.7)) || (n * e) % f === 0 && rng.chance(0.6));
      const v = q(n * e, f);
      const left = rng.chance(0.5) ? `${n} \\times ${fr(e, f)}` : `${fr(e, f)} \\times ${n}`;
      steps.push(step(`b) ${m(`B = ${left}`)}`, m('B ='), v, `${m(`${n} = ${fr(n, 1)}`)} : on multiplie seulement le numérateur.`,
        [[q(n * e, n * f), `${m(String(n))} s’écrit ${m(fr(n, 1))} : le dénominateur ne change pas. ${m(`${left} = ${fr(n * e, f)}`)}.`]]));
      sol.push(`b) ${m(`B = \\dfrac{${n} \\times ${e}}{${f}} = ${fr(n * e, f)}${simpl(n * e, f)}`)} (${m(`${n} = ${fr(n, 1)}`)} : le dénominateur ne change pas).`);
      items.push({ what: 'B', js: `${n} * ${e} / ${f}`, expect: toNum(v) });
      ans.push(m(`B = ${fq(v)}`));
    } else {
      // ★★ : signes et trois facteurs
      const [A, B] = pairFr(true);
      const s1 = [rng.chance(0.5) ? -1 : 1, rng.chance(0.5) ? -1 : 1];
      if (s1[0] > 0 && s1[1] > 0) s1[rng.int(0, 1)] = -1;
      const r = prodLine('C', [A, B], s1);
      steps.push(step(`a) ${m(`C = ${r.show}`)}`, m('C ='), r.v, 'Le signe d’abord (règle des signes), puis numérateurs entre eux, dénominateurs entre eux ; simplifie avant de multiplier.', [[neg(r.v), SIGN]], SIGN));
      sol.push('a) ' + r.lines[0], ...r.lines.slice(1));
      items.push({ what: 'C', js: `${s1[0]} * ${jsF(A)} * ${s1[1]} * ${jsF(B)}`, expect: toNum(r.v) });
      ans.push(m(`C = ${fq(r.v)}`));
      // b) trois facteurs qui se simplifient presque entièrement
      let fs: [number, number][], v: Q;
      do {
        const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.int(2, 9), d = rng.int(1, 5), e = rng.int(1, 5);
        fs = [[a * d, b], [b * e, c], [c, a]];
        v = q(d * e * a * b * c, b * c * a);
      } while (fs.some((f) => gcd(f[0], f[1]) !== 1 || f[1] === 1 || f[0] === f[1]) || Math.max(...fs.flat()) > 45);
      const sgn = rng.pick([[1, -1, -1], [-1, 1, 1], [1, 1, -1], [-1, -1, -1]]);
      const r2 = prodLine('D', fs, sgn);
      steps.push(step(`b) ${m(`D = ${r2.show}`)}`, m('D ='), r2.v, 'Compte les facteurs négatifs pour le signe. Beaucoup de facteurs se simplifient : décompose avant de multiplier.', [[neg(r2.v), SIGN]], SIGN));
      sol.push('b) ' + r2.lines[0], ...r2.lines.slice(1));
      items.push({ what: 'D', js: fs.map((f, i) => `${sgn[i]} * ${jsF(f)}`).join(' * '), expect: toNum(r2.v) });
      ans.push(m(`D = ${fq(r2.v)}`));
      void v;
    }
    sol.push('Contrôle : on vérifie à la calculatrice, en écriture décimale.');
    return {
      title: 'Calcule et donne le résultat sous forme irréductible.',
      steps,
      solution: sol,
      answer: ans.join(' ; '),
      key: steps.map((s) => s.prompt).join('|'),
      data: { kind: 'js', items },
    };
  },
};

// ===================================================================== diviser
export const division: Generator = {
  id: 'division',
  title: 'Inverse et division',
  desc: 'Diviser, c’est multiplier par l’inverse du diviseur.',
  stars: 2,
  levels: [2],
  example: '\\dfrac{9}{2} \\div \\dfrac{3}{4} = 6',
  course: LINKS.s6,
  generate(rng: Rng) {
    const kind = rng.pick(['ff', 'ff', 'fi', 'if']);
    let A: [number, number], B: [number, number];
    for (;;) {
      if (kind === 'fi') { A = rf(rng, [2, 3, 4, 5, 6, 7, 8, 9], 1.5); B = [rng.int(2, 12), 1]; }
      else if (kind === 'if') { A = [rng.int(2, 12), 1]; B = rf(rng, [2, 3, 4, 5, 6, 7, 8, 9], 1.6); }
      else { A = rf(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10], 1.6); B = rf(rng, [2, 3, 4, 5, 6, 7, 8, 9], 1.6); }
      if (B[0] === 1 && B[1] === 1) continue;
      if (B[0] === B[1]) continue;
      const v = div(Qf(A), Qf(B));
      if (eq(Qf(A), Qf(B))) continue;
      // un facteur commun à simplifier la plupart du temps
      if (gcd(A[0], B[0]) === 1 && gcd(A[1], B[1]) === 1 && rng.chance(0.7)) continue;
      if (v.d > 30 || v.n > 80) continue;
      break;
    }
    const tA = A[1] === 1 ? String(A[0]) : fr(...A), tB = B[1] === 1 ? String(B[0]) : fr(...B);
    const inv = q(B[1], B[0]), v = div(Qf(A), Qf(B));
    const tInv = inv.d === 1 ? String(inv.n) : fr(B[1], B[0]);
    const s1: Step = { prompt: `Quel est l’inverse du diviseur ${m(tB)} ?`, answer: { kind: 'num', fields: [{ label: 'Inverse :', expect: inv, form: 'any', ...(isInt(inv) ? {} : { shown: fq(inv) }) }] }, hint: `Deux nombres sont inverses si leur produit vaut ${m('1')} : on échange numérateur et dénominateur.`,
      mistakes: mist(inv, [[Qf(B), 'C’est le diviseur lui-même : l’inverse s’obtient en échangeant numérateur et dénominateur.'], [neg(Qf(B)), 'L’inverse n’est pas l’opposé : leur **produit** doit valoir 1.'], [q(A[1], A[0]), 'C’est l’inverse de la **première** fraction ; on inverse le **diviseur**.']]) };
    const s2 = step(`Calcule ${m(`E = ${tA} \\div ${tB}`)}.`, m('E ='), v, `${m(`E = ${tA} \\times ${tInv}`)}. Simplifie avant de multiplier.`,
      [[mul(Qf(A), Qf(B)), 'Tu as multiplié par le diviseur : il faut multiplier par son **inverse**.'], [A[1] !== 1 ? mul(q(A[1], A[0]), Qf(B)) : null, 'Tu as inversé la première fraction : on multiplie la première par l’inverse du **diviseur**.']]);
    const N = A[0] * inv.n, D = A[1] * inv.d;
    return {
      title: 'Divise des fractions.',
      steps: [s1, s2],
      solution: [
        `L’inverse de ${m(tB)} est ${m(tInv)}, car ${m(`${tB} \\times ${tInv} = 1`)}.`,
        `${m(`E = ${tA} \\div ${tB} = ${tA} \\times ${tInv} = \\dfrac{${A[0]} \\times ${inv.n}}{${A[1]} \\times ${inv.d}}`)}${gcd(N, D) > 1 ? ` : on simplifie par ${m(String(gcd(N, D)))} (de préférence avant de multiplier)` : ''}.`.replace(/ \\times 1\}/g, '}').replace(/\{1 \\times /g, '{'),
        `Donc ${m(`E = ${fr(N, D)}${simpl(N, D)}`)}.`,
        `Contrôle : ${m(`${fq(v)} \\times ${tB} = ${tA}`)} ✓.${toNum(Qf(B)) < 1 ? ' Diviser par un nombre plus petit que 1 donne un résultat plus grand.' : ''}`,
      ],
      answer: `inverse ${m(tInv)} ; ${m(`E = ${fq(v)}`)}`,
      key: `${A}/${B}`,
      data: { kind: 'js', items: [{ what: 'inv', js: `1 / ${jsF(B)}`, expect: toNum(inv) }, { what: 'E', js: `${jsF(A)} / ${jsF(B)}`, expect: toNum(v) }] },
    };
  },
};

// ===================================================================== priorités
type Fr = [number, number];
const T = (f: Fr) => (f[1] === 1 ? String(f[0]) : fr(...f));
export const priorites: Generator = {
  id: 'priorites',
  title: 'Calculs avec priorités',
  desc: 'Multiplications et divisions d’abord ; parenthèses.',
  stars: 2,
  levels: [2, 3],
  example: '\\dfrac{1}{2} + \\dfrac{3}{4} \\times \\dfrac{2}{9}',
  course: LINKS.s7,
  generate(rng: Rng, level: Level) {
    const D2 = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    for (;;) {
      const a = rf(rng, D2, 1.2), b = rf(rng, D2, 1.3), c = rf(rng, D2, 1.3), d = rf(rng, D2, 1.3);
      const form = level === 2 ? rng.pick(['p+qr', '(p+q)r', 'p-q/r', 'p-qr']) : rng.pick(['(p-q)/(r+s)', 'pq-r/s', 'p-(q+r)s', '(p+q)/r-s']);
      const [P, Qq, R, S] = [a, b, c, d].map(Qf);
      let v: Q, inter: Q, interTex: string, interLbl: string, wrong: Q | null, tex: string, lines: Rich[];
      switch (form) {
        case 'p+qr': inter = mul(Qq, R); v = add(P, inter); wrong = mul(add(P, Qq), R); tex = `${T(a)} + ${T(b)} \\times ${T(c)}`; interTex = `${T(b)} \\times ${T(c)}`; interLbl = 'le produit';
          lines = [`La multiplication est prioritaire : ${m(`${interTex} = ${fq(inter)}`)}.`, m(`F = ${T(a)} + ${fq(inter)} = ${fq(v)}`) + '.']; break;
        case 'p-qr': inter = mul(Qq, R); v = sub(P, inter); wrong = mul(sub(P, Qq), R); tex = `${T(a)} - ${T(b)} \\times ${T(c)}`; interTex = `${T(b)} \\times ${T(c)}`; interLbl = 'le produit';
          lines = [`La multiplication est prioritaire : ${m(`${interTex} = ${fq(inter)}`)}.`, m(`F = ${T(a)} - ${fq(inter)} = ${fq(v)}`) + '.']; break;
        case '(p+q)r': inter = add(P, Qq); v = mul(inter, R); wrong = add(P, mul(Qq, R)); tex = `\\left(${T(a)} + ${T(b)}\\right) \\times ${T(c)}`; interTex = `${T(a)} + ${T(b)}`; interLbl = 'la parenthèse';
          lines = [`Les parenthèses d’abord : ${m(`${interTex} = ${fq(inter)}`)}.`, m(`F = ${fqp(inter)} \\times ${T(c)} = ${fq(v)}`) + '.']; break;
        case 'p-q/r': inter = div(Qq, R); v = sub(P, inter); wrong = div(sub(P, Qq), R); tex = `${T(a)} - ${T(b)} \\div ${T(c)}`; interTex = `${T(b)} \\div ${T(c)}`; interLbl = 'le quotient';
          lines = [`La division est prioritaire : ${m(`${interTex} = ${T(b)} \\times ${fq(q(c[1], c[0]))} = ${fq(inter)}`)}.`, m(`F = ${T(a)} - ${fq(inter)} = ${fq(v)}`) + '.']; break;
        case '(p-q)/(r+s)': inter = sub(P, Qq); { const den = add(R, S); if (den.n === 0) continue; v = div(inter, den); wrong = add(div(sub(P, Qq), R), S);
          tex = `\\left(${T(a)} - ${T(b)}\\right) \\div \\left(${T(c)} + ${T(d)}\\right)`; interTex = `${T(a)} - ${T(b)}`; interLbl = 'la première parenthèse';
          lines = [`Les parenthèses d’abord : ${m(`${interTex} = ${fq(inter)}`)} et ${m(`${T(c)} + ${T(d)} = ${fq(den)}`)}.`, m(`F = ${fqp(inter)} \\div ${fq(den)} = ${fqp(inter)} \\times ${fq(div(q(1), den))} = ${fq(v)}`) + '.']; } break;
        case 'pq-r/s': inter = mul(P, Qq); v = sub(inter, div(R, S)); wrong = div(sub(inter, R), S); tex = `${T(a)} \\times ${T(b)} - ${T(c)} \\div ${T(d)}`; interTex = `${T(a)} \\times ${T(b)}`; interLbl = 'le produit';
          lines = [`Produit et quotient d’abord : ${m(`${interTex} = ${fq(inter)}`)} et ${m(`${T(c)} \\div ${T(d)} = ${T(c)} \\times ${fq(q(d[1], d[0]))} = ${fq(div(R, S))}`)}.`, m(`F = ${fq(inter)} - ${fq(div(R, S))} = ${fq(v)}`) + '.']; break;
        case 'p-(q+r)s': inter = add(Qq, R); v = sub(P, mul(inter, S)); wrong = mul(sub(P, inter), S); tex = `${T(a)} - \\left(${T(b)} + ${T(c)}\\right) \\times ${T(d)}`; interTex = `${T(b)} + ${T(c)}`; interLbl = 'la parenthèse';
          lines = [`Parenthèse d’abord : ${m(`${interTex} = ${fq(inter)}`)} ; puis le produit : ${m(`${fq(inter)} \\times ${T(d)} = ${fq(mul(inter, S))}`)}.`, m(`F = ${T(a)} - ${fq(mul(inter, S))} = ${fq(v)}`) + '.']; break;
        default: inter = add(P, Qq); v = sub(div(inter, R), S); wrong = eq(R, S) ? null : div(inter, sub(R, S)); tex = `\\left(${T(a)} + ${T(b)}\\right) \\div ${T(c)} - ${T(d)}`; interTex = `${T(a)} + ${T(b)}`; interLbl = 'la parenthèse';
          lines = [`Parenthèse d’abord : ${m(`${interTex} = ${fq(inter)}`)} ; puis la division : ${m(`${fqp(inter)} \\div ${T(c)} = ${fq(div(inter, R))}`)}.`, m(`F = ${fq(div(inter, R))} - ${T(d)} = ${fq(v)}`) + '.'];
      }
      // contraintes : nombres lisibles, résultat non trivial, l'erreur de priorité change le résultat
      const ok = (x: Q) => Math.abs(x.n) <= 120 && x.d <= 48;
      if (!ok(v) || !ok(inter) || v.n === 0 || (level === 2 && v.n < 0) || (wrong && eq(wrong, v)) || eq(inter, q(1))) continue;
      if ([v, inter].some((x) => x.d > 1 && x.d > 36)) continue;
      const jsE = tex.replace(/\\left\(|\\right\)/g, (t) => (t === '\\left(' ? '(' : ')')).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '($1/$2)').replace(/\\times/g, '*').replace(/\\div/g, '/');
      const jsI = interTex.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '($1/$2)').replace(/\\times/g, '*').replace(/\\div/g, '/');
      const s1: Step = { prompt: `Calcule d’abord ${interLbl}.`, answer: { kind: 'num', fields: [{ label: m(`${interTex} =`), expect: inter, form: 'any', ...(isInt(inter) ? {} : { shown: fq(inter) }) }] }, hint: interLbl.includes('parenthèse') ? 'Les calculs entre parenthèses se font en premier.' : 'Multiplications et divisions passent avant additions et soustractions.', mistakes: [] };
      const s2 = step('Termine le calcul (fraction irréductible).', m('F ='), v, 'Remplace par le résultat de l’étape précédente, puis mets au même dénominateur si besoin.',
        [[wrong, 'Tu as calculé dans l’ordre de lecture, sans respecter les priorités (ou les parenthèses).'], [level === 3 ? neg(v) : null, SIGN]], level === 3 ? SIGN : undefined);
      return {
        title: 'Calcule en respectant les priorités.',
        display: `F = ${tex}`,
        steps: [s1, s2],
        solution: [...lines, `Contrôle : ${m(`F \\approx ${toNum(v).toFixed(3).replace('.', '{,}')}`)} à la calculatrice.`],
        answer: m(`F = ${fq(v)}`),
        key: tex,
        data: { kind: 'js', items: [{ what: 'inter', js: jsI, expect: toNum(inter) }, { what: 'F', js: jsE, expect: toNum(v) }] },
      };
    }
  },
};

// ===================================================================== trouver l'erreur
const ERR = {
  addDen: 'Les dénominateurs ont été additionnés : il faut d’abord un même dénominateur.',
  simpTerm: 'Un terme d’une somme a été « simplifié » : on ne simplifie que des facteurs.',
  intDen: 'Le dénominateur a été multiplié lui aussi par l’entier.',
  divFirst: 'On a multiplié par le diviseur au lieu de multiplier par son inverse.',
  forgot: 'Le résultat est juste mais n’a pas été simplifié.',
} as const;
const VOW = /^[AEIOUYÉÈÂÎaeiouyéèâî]/;
const de = (n: string) => (VOW.test(n) ? `d’${n}` : `de ${n}`);
type ErrK = keyof typeof ERR;
export const erreur: Generator = {
  id: 'erreur',
  title: 'Trouver l’erreur',
  desc: 'Un calcul faux d’élève : quelle erreur, quel bon résultat ?',
  stars: 2,
  levels: [2],
  example: '\\dfrac{1}{2} + \\dfrac{1}{3} = \\dfrac{2}{5}\\;?',
  course: LINKS.serieH,
  links: [LINKS.s4, LINKS.s52, LINKS.s6],
  generate(rng: Rng) {
    const kind = rng.pick(['addDen', 'simpTerm', 'intDen', 'divFirst'] as const);
    let shown = '', good: Q = q(0), wrongV: Q = q(0), sol: Rich[] = [], js = '';
    const name = rng.pick(['Lou', 'Max', 'Nora', 'Enzo', 'Lila', 'Sacha']);
    switch (kind) {
      case 'addDen': {
        let A: Fr, B: Fr;
        do { A = rf(rng, [2, 3, 4, 5, 6, 7], 1); B = rf(rng, [2, 3, 4, 5, 6, 7, 8], 1); } while (A[1] === B[1] || lcm(A[1], B[1]) > 42);
        good = add(Qf(A), Qf(B));
        shown = `${fr(...A)} + ${fr(...B)} = ${fr(A[0] + B[0], A[1] + B[1])}`;
        wrongV = q(A[0] + B[0], A[1] + B[1]);
        const L = lcm(A[1], B[1]);
        sol = [`Les dénominateurs donnent la taille des parts : on ne les ajoute pas. Indice que c’est faux : ${m(fr(A[0] + B[0], A[1] + B[1]))} est plus petit que ${m(fr(...(A[0] / A[1] > B[0] / B[1] ? A : B)))} alors qu’on a ajouté un nombre positif.`,
          m(`${fr(...A)} + ${fr(...B)} = ${fr(A[0] * (L / A[1]), L)} + ${fr(B[0] * (L / B[1]), L)} = ${fr(A[0] * (L / A[1]) + B[0] * (L / B[1]), L)}${simpl(A[0] * (L / A[1]) + B[0] * (L / B[1]), L)}`) + '.'];
        js = `${jsF(A)} + ${jsF(B)}`;
        break;
      }
      case 'simpTerm': {
        let a: number, b: number;
        do { a = rng.int(2, 9); b = rng.int(2, 12); } while (a === b || gcd(a + b, a) !== 1);
        good = q(a + b, a);
        shown = `\\dfrac{${a} + ${b}}{${a}} = ${b}`;
        wrongV = q(b);
        sol = [`On ne peut simplifier que des **facteurs** (des multiplications), jamais un terme d’une somme.`, m(`\\dfrac{${a} + ${b}}{${a}} = ${fr(a + b, a)}`) + ` (irréductible). Contrôle : ${m(`${fr(a + b, a)} \\approx ${((a + b) / a).toFixed(2).replace('.', '{,}')} \\neq ${b}`)}.`];
        js = `(${a} + ${b}) / ${a}`;
        break;
      }
      case 'intDen': {
        let e: number, f: number, n: number;
        do { f = rng.int(3, 9); e = rng.int(1, f - 1); n = rng.int(2, 9); } while (gcd(e, f) !== 1 || n === f);
        good = q(n * e, f);
        shown = `${fr(e, f)} \\times ${n} = ${fr(e * n, f * n)}`;
        wrongV = q(e, f);
        sol = [`${m(`${n} = ${fr(n, 1)}`)} : on multiplie seulement le numérateur. D’ailleurs ${m(fr(e * n, f * n))} est égal à ${m(fr(e, f))} : multiplier par ${m(String(n))} n’aurait rien changé !`, m(`${fr(e, f)} \\times ${n} = ${fr(e * n, f)}${simpl(e * n, f)}`) + '.'];
        js = `${e}/${f} * ${n}`;
        break;
      }
      default: {
        let e: number, f: number, n: number;
        do { f = rng.int(2, 9); e = rng.int(1, 2 * f); n = rng.int(2, 6); } while (gcd(e, f) !== 1 || e % f === 0);
        good = q(e, f * n);
        shown = `${fr(e, f)} \\div ${n} = ${fr(e * n, f)}`;
        wrongV = q(e * n, f);
        sol = [`Diviser par ${m(String(n))}, c’est multiplier par l’inverse ${m(fr(1, n))}. ${name} a multiplié par ${m(String(n))} : le résultat ne peut pas être plus grand que ${m(fr(e, f))} !`, m(`${fr(e, f)} \\div ${n} = ${fr(e, f)} \\times ${fr(1, n)} = ${fr(e, f * n)}${simpl(e, f * n)}`) + '.'];
        js = `${e}/${f} / ${n}`;
      }
    }
    const others = (Object.keys(ERR) as ErrK[]).filter((k) => k !== kind);
    const bad = rng.shuffle(others).slice(0, 3).map((k) => [ERR[k], k === 'forgot' ? 'Non : le résultat n’est pas seulement non simplifié, il est faux (vérifie à la calculatrice).' : 'Non : ce n’est pas l’erreur commise ici. Relis le calcul étape par étape.'] as [Rich, Rich]);
    const s1: Step = { prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, ERR[kind], bad), hint: 'Vérifie d’abord à la calculatrice que le résultat est faux, puis compare avec la règle du cours.' };
    const s2 = step('Donne le bon résultat (fraction irréductible).', m(`${shown.split(' = ')[0]} =`), good, 'Applique la règle du cours.',
      [[wrongV, `C’est le résultat faux ${de(name)} : corrige son erreur.`]]);
    return {
      title: 'Trouve l’erreur.',
      statement: `${name} a écrit : ${m(shown)}`,
      steps: [s1, s2],
      solution: sol,
      answer: `${ERR[kind]} ${m(`${shown.split(' = ')[0]} = ${fq(good)}`)}`,
      key: shown,
      data: { kind: 'js', items: [{ what: 'good', js, expect: toNum(good) }] },
    };
  },
};
void (null as unknown as Mistake);
