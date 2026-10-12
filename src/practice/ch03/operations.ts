/**
 * Opérations sur les relatifs : addition (★), soustraction (★ → ★★), produit et quotient (★★),
 * signe d'un produit (★★), priorités (★★). Chaque calcul est choisi pour illustrer une règle du cours ;
 * les erreurs typiques reconnues sont celles que le cours signale (« moins et moins font plus » appliqué
 * à une addition, changer le signe du premier nombre, trois facteurs négatifs…).
 */
import { type Q, q, add, sub, mul, div, neg, abs as qabs, eq, toNum, isInt, cmp } from '../engine/q';
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, dn, pn, sn, js, numStep, fixedChoice } from '../engine/build';
import { LINKS, SIGN } from './common';

const sgn = (v: Q) => (v.n < 0 ? -1 : v.n > 0 ? 1 : 0);
/** Entier non nul ±[a, b]. */
const S = (rng: Rng, a: number, b: number) => q(rng.signed(a, b));
/** Décimal au dixième non entier, ±[a, b] dixièmes. */
const T = (rng: Rng, a: number, b: number, sign?: 1 | -1) => {
  let n = rng.int(a, b);
  if (n % 10 === 0) n += rng.int(1, 9);
  return q((sign ?? (rng.chance(0.5) ? 1 : -1)) * n, 10);
};

// ===================================================================== addition
type Two = { a: Q; b: Q };
/** Une addition de deux relatifs : écriture, valeur, ligne de corrigé, erreurs typiques. */
function addCase(name: string, { a, b }: Two, paren: boolean) {
  const r = add(a, b);
  const t = paren ? `${sn(a)} + ${sn(b)}` : `${dn(a)} + ${pn(b)}`;
  const da = qabs(a), db = qabs(b);
  let line: Rich, mistakes: [Q | null, Rich][];
  if (r.n === 0) {
    line = `${m(dn(a))} et ${m(dn(b))} sont opposés : leur somme vaut ${m('0')}, donc ${m(`${name} = 0`)}.`;
    mistakes = [[mul(q(sgn(a)), add(da, db)), 'Deux nombres opposés ont une somme nulle.']];
  } else if (sgn(a) === sgn(b)) {
    line = `${m(name)} : même signe ; ${m(`${dn(da)} + ${dn(db)} = ${dn(add(da, db))}`)} ; signe commun ${m(a.n < 0 ? '-' : '+')}, donc ${m(`${name} = ${dn(r)}`)}.`;
    mistakes =
      a.n < 0
        ? [[add(da, db), '« Moins et moins font plus » concerne le **produit**, pas l’addition : deux pertes font une perte plus grande.'], [sub(cmp(da, db) > 0 ? da : db, cmp(da, db) > 0 ? db : da), `Même signe : on **additionne** les distances à zéro (${m(`${dn(da)} + ${dn(db)}`)}).`]]
        : [];
  } else {
    const big = cmp(da, db) > 0 ? a : b;
    const diff = sub(qabs(big), cmp(da, db) > 0 ? db : da);
    line = `${m(name)} : signes contraires ; ${m(`${dn(qabs(big))} - ${dn(cmp(da, db) > 0 ? db : da)} = ${dn(diff)}`)} ; c’est ${m(dn(big))} qui a la plus grande distance à zéro, donc ${m(`${name} = ${dn(r)}`)}.`;
    mistakes = [
      [mul(q(sgn(big)), add(da, db)), `Signes contraires : on **soustrait** les distances à zéro (la plus grande moins la plus petite), on ne les ajoute pas.`],
      [neg(r), `Le résultat prend le signe du nombre qui a la **plus grande** distance à zéro : ici ${m(dn(big))}.`],
      [neg(add(da, db)), `Signes contraires : on soustrait les distances à zéro, et on prend le signe du plus loin de zéro (${m(dn(big))}).`],
    ];
  }
  return { t, r, line, mistakes, js: `${js(a)} + ${js(b)}` };
}
function twoCalcs(rng: Rng, kinds: ('contraires' | 'negs' | 'opp')[], val: (r: Rng) => Q) {
  return kinds.map((k): Two => {
    for (;;) {
      const a = val(rng);
      let b = val(rng);
      if (k === 'opp') return rng.chance(0.5) ? { a, b: neg(a) } : { a: neg(a), b: a };
      if (k === 'negs') {
        b = neg(qabs(b));
        return { a: neg(qabs(a)), b };
      }
      if (eq(qabs(a), qabs(b))) continue;
      const neg1 = rng.chance(0.5);
      return { a: neg1 ? neg(qabs(a)) : qabs(a), b: neg1 ? qabs(b) : neg(qabs(b)) };
    }
  });
}
/** Suite de termes (addition de plusieurs relatifs) : écriture, valeur, corrigé « positifs ensemble, négatifs ensemble ». */
function regroupLines(name: string, vals: Q[]) {
  const pos = vals.filter((v) => v.n > 0), negs = vals.filter((v) => v.n < 0);
  const P = pos.reduce(add, q(0)), Nn = negs.reduce(add, q(0));
  const r = add(P, Nn);
  return {
    r,
    lines: [
      `Positifs : ${m(pos.length > 1 ? `${pos.map(dn).join(' + ')} = ${dn(P)}` : dn(P))}. Négatifs : ${m(negs.length > 1 ? `${negs.map(pn).join(' + ')} = ${dn(Nn)}` : dn(Nn))}.`,
      m(`${name} = ${dn(P)} + ${pn(Nn)} = ${dn(r)}`),
    ],
    P,
    Nn,
  };
}
export const addition: Generator = {
  id: 'addition',
  title: 'Additionner des relatifs',
  desc: 'Même signe, signes contraires ; plusieurs termes (★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '(-7) + (+3)',
  course: LINKS.s32,
  links: [LINKS.s33],
  generate(rng: Rng, level: Level) {
    if (level === 3) {
      // 5 termes entiers, regroupement positifs / négatifs
      let vals: Q[];
      do vals = [S(rng, 1, 12), S(rng, 1, 12), S(rng, 1, 12), S(rng, 1, 12), S(rng, 1, 12)];
      while (vals.filter((v) => v.n < 0).length < 2 || vals.filter((v) => v.n > 0).length < 2);
      const paren = rng.chance(0.5);
      const t = vals.map((v, i) => (i === 0 ? (paren ? sn(v) : dn(v)) : paren ? sn(v) : pn(v))).join(' + ');
      const g = regroupLines('C', vals);
      const sumAbs = vals.reduce((s, v) => add(s, qabs(v)), q(0));
      return {
        title: 'Calcule en regroupant les termes de même signe.',
        display: `C = ${t}`,
        steps: [numStep('', m('C ='), g.r, 'Regroupe les positifs ensemble et les négatifs ensemble, puis additionne les deux résultats.', [
          [sumAbs, 'Tu as additionné les distances à zéro sans tenir compte des signes : les négatifs font **reculer**.'],
          [sub(qabs(g.Nn), g.P), `Positifs ${m(dn(g.P))}, négatifs ${m(dn(g.Nn))} : le résultat a le signe du plus loin de zéro.`],
        ], { signHint: SIGN })],
        solution: [...g.lines, `Contrôle : gains ${m(dn(g.P))}, pertes ${m(dn(qabs(g.Nn)))} : on finit ${g.r.n >= 0 ? `avec un gain de ${m(dn(g.r))}` : `avec une perte de ${m(dn(qabs(g.r)))}`} ✓.`],
        answer: m(`C = ${dn(g.r)}`),
        key: t,
        data: { kind: 'js', items: [{ what: 'C', js: vals.map(js).join(' + '), expect: toNum(g.r) }] },
      };
    }
    const kinds = rng.shuffle(['contraires', rng.weighted([['negs', 3], ['contraires', 1], ['opp', 0.6]] as const)]) as ('contraires' | 'negs' | 'opp')[];
    const val = level === 1 ? (r: Rng) => q(r.int(1, 20)) : (r: Rng) => T(r, 2, 99, 1);
    const pairs = twoCalcs(rng, kinds, val);
    const paren = rng.chance(0.5);
    const cs = pairs.map((p, i) => addCase('AB'[i], p, paren));
    return {
      title: 'Calcule.',
      display: cs.map((c, i) => `${'AB'[i]} = ${c.t}`).join(' \\qquad '),
      steps: cs.map((c, i) => numStep('', m(`${'AB'[i]} =`), c.r, 'Même signe : on additionne les distances à zéro et on garde le signe. Signes contraires : on soustrait, et on prend le signe du plus loin de zéro.', c.mistakes, { signHint: SIGN })),
      solution: [...cs.map((c) => c.line), `Contrôle de ${m('A')} sur la droite : je pars de ${m(dn(pairs[0].a))} et ${pairs[0].b.n > 0 ? 'j’avance' : 'je recule'} de ${m(dn(qabs(pairs[0].b)))} : j’arrive en ${m(dn(cs[0].r))} ✓.`],
      answer: cs.map((c, i) => m(`${'AB'[i]} = ${dn(c.r)}`)).join(' ; '),
      key: cs.map((c) => c.t).join('|'),
      data: { kind: 'js', items: cs.map((c, i) => ({ what: 'AB'[i], js: c.js, expect: toNum(c.r) })) },
    };
  },
};

// ===================================================================== soustraction
type Sub = { a: Q; b: Q };
function subCase(name: string, { a, b }: Sub, paren: boolean) {
  const r = sub(a, b);
  const t = `${paren ? sn(a) : dn(a)} - ${paren ? sn(b) : pn(b)}`;
  const line = `${m(`${name} = ${t} = ${dn(a)} + ${pn(neg(b))} = ${dn(r)}`)}`;
  const mistakes: [Q | null, Rich][] = [
    [add(a, b), `Soustraire ${m(dn(b))}, c’est **ajouter son opposé** ${m(dn(neg(b)))} : ${m(`${dn(a)} + ${pn(neg(b))}`)}.`],
    [add(neg(a), neg(b)), `Seul le nombre **soustrait** est remplacé par son opposé ; le premier nombre ne change pas : ${m(`${dn(a)} + ${pn(neg(b))}`)}.`],
    [neg(add(a, b)), `Soustraire, c’est ajouter l’opposé : ${m(`${dn(a)} + ${pn(neg(b))}`)}. Puis règle de l’addition.`],
  ];
  return { t, r, line, mistakes, js: `${js(a)} - ${js(b)}` };
}
export const soustraction: Generator = {
  id: 'soustraction',
  title: 'Soustraire des relatifs',
  desc: 'Ajouter l’opposé ; écriture simplifiée (★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '9 - (-4)',
  course: LINKS.s41,
  links: [LINKS.s42],
  generate(rng: Rng, level: Level) {
    if (level === 3) {
      // suite d'additions et de soustractions, à simplifier puis calculer
      let ops: { op: '+' | '-'; v: Q }[];
      let first: Q;
      do {
        first = S(rng, 1, 12);
        ops = Array.from({ length: rng.int(3, 4) }, () => ({ op: rng.pick(['+', '-'] as const), v: S(rng, 1, 12) }));
      } while (!ops.some((o) => o.op === '-' && o.v.n < 0) || !ops.some((o) => o.op === '-' && o.v.n > 0) || !ops.some((o) => o.op === '+'));
      const paren = rng.chance(0.6);
      const t = dn(first) + ops.map((o) => ` ${o.op} ${paren ? sn(o.v) : pn(o.v)}`).join('');
      const conv = [first, ...ops.map((o) => (o.op === '-' ? neg(o.v) : o.v))];
      const simple = dn(first) + conv.slice(1).map((v) => (v.n < 0 ? ` - ${dn(qabs(v))}` : ` + ${dn(v)}`)).join('');
      const g = regroupLines('D', conv);
      const allPlus = [first, ...ops.map((o) => o.v)].reduce(add, q(0));
      const minusMinus = [first, ...ops.map((o) => (o.op === '-' && o.v.n < 0 ? o.v : o.op === '-' ? neg(o.v) : o.v))].reduce(add, q(0));
      return {
        title: 'Écris sans parenthèses, puis calcule.',
        display: `D = ${t}`,
        steps: [numStep('', m('D ='), g.r, 'On remplace chaque soustraction par l’addition de l’opposé, puis on supprime les parenthèses et on regroupe positifs et négatifs.', [
          [allPlus, 'Tu as traité les soustractions comme des additions. Soustraire un nombre, c’est **ajouter son opposé**.'],
          [minusMinus, `${m('- (-a)')} devient ${m('+ a')} : soustraire un négatif, c’est ajouter un positif.`],
        ], { signHint: SIGN })],
        solution: [
          `On remplace chaque soustraction par l’addition de l’opposé : ${m(`D = ${conv.map((v, i) => (i === 0 ? dn(v) : pn(v))).join(' + ')}`)}.`,
          `Écriture simplifiée : ${m(`D = ${simple}`)}.`,
          ...g.lines,
        ],
        answer: m(`D = ${dn(g.r)}`),
        key: t,
        data: { kind: 'js', items: [{ what: 'D', js: js(first) + ops.map((o) => ` ${o.op} ${js(o.v)}`).join(''), expect: toNum(g.r) }] },
      };
    }
    const val = level === 1 ? (r: Rng) => q(r.int(1, 15)) : (r: Rng) => T(r, 2, 99, 1);
    const kinds = rng.shuffle(['pos-neg', 'neg-pos', 'neg-neg', 'small-big']).slice(0, 2);
    const cs = kinds.map((k, i) => {
      let a = val(rng), b = val(rng);
      while (eq(a, b)) b = val(rng);
      if (k === 'pos-neg') b = neg(b);
      if (k === 'neg-pos') a = neg(a);
      if (k === 'neg-neg') [a, b] = [neg(a), neg(b)];
      if (k === 'small-big' && cmp(a, b) > 0) [a, b] = [b, a];
      return subCase('AB'[i], { a, b }, rng.chance(0.3));
    });
    return {
      title: 'Calcule.',
      display: cs.map((c, i) => `${'AB'[i]} = ${c.t}`).join(' \\qquad '),
      steps: cs.map((c, i) => numStep('', m(`${'AB'[i]} =`), c.r, 'Soustraire un nombre, c’est ajouter son opposé : seul le nombre soustrait change de signe.', c.mistakes, { signHint: SIGN })),
      solution: ['Soustraire un nombre, c’est ajouter son opposé :', ...cs.map((c) => c.line)],
      answer: cs.map((c, i) => m(`${'AB'[i]} = ${dn(c.r)}`)).join(' ; '),
      key: cs.map((c) => c.t).join('|'),
      data: { kind: 'js', items: cs.map((c, i) => ({ what: 'AB'[i], js: c.js, expect: toNum(c.r) })) },
    };
  },
};

// ===================================================================== produit, quotient, puissances
const signWord = (a: Q, b: Q) => (sgn(a) === sgn(b) ? 'même signe : le résultat est positif' : 'signes contraires : le résultat est négatif');
export const produit: Generator = {
  id: 'produit',
  title: 'Multiplier et diviser',
  desc: 'Règle des signes ; plusieurs facteurs et puissances (★★★).',
  stars: 2,
  levels: [1, 2, 3],
  example: '(-6) \\times (-4)',
  course: LINKS.s52,
  links: [LINKS.s53],
  generate(rng: Rng, level: Level) {
    type C = { t: string; r: Q; line: Rich; mistakes: [Q | null, Rich][]; js: string };
    const cases: C[] = [];
    let ctrl = 'Contrôle : un carré est toujours positif ou nul ; un cube a le signe du nombre.';
    if (level <= 2) {
      // A : produit ; B : quotient construit à rebours (B = c ÷ d avec c = d × r)
      let a: Q, b: Q, d: Q, r: Q;
      if (level === 1) {
        a = S(rng, 2, 12);
        b = S(rng, 2, 12);
        if (a.n > 0 && b.n > 0) a = neg(a);
        d = S(rng, 2, 9);
        r = S(rng, 2, 12);
        if (d.n > 0 && r.n > 0) r = neg(r);
      } else {
        a = T(rng, 2, 45);
        b = S(rng, 2, 9);
        if (a.n > 0 && b.n > 0) b = neg(b);
        d = rng.pick([q(1, 2), q(1, 5), q(2, 5), q(5, 2), q(3, 2), q(3, 10)]);
        if (rng.chance(0.5)) d = neg(d);
        r = S(rng, 2, 12);
        if (d.n > 0 && r.n > 0) r = neg(r);
      }
      const p = mul(a, b);
      const c = mul(d, r);
      ctrl = `Contrôle de ${m('B')} par la multiplication : ${m(`${pn(r)} \\times ${pn(d)} = ${dn(c)}`)} ✓.`;
      const frac = level === 1 && rng.chance(0.35);
      const tA = `${pn(a)} \\times ${pn(b)}`;
      const tB = frac ? `\\dfrac{${dn(c)}}{${dn(d)}}` : `${pn(c)} \\div ${pn(d)}`;
      cases.push({
        t: tA,
        r: p,
        line: `${m('A')} : ${signWord(a, b)} ; ${m(`${dn(qabs(a))} \\times ${dn(qabs(b))} = ${dn(qabs(p))}`)}, donc ${m(`A = ${dn(p)}`)}.`,
        mistakes: [[neg(p), `Règle des signes : ${signWord(a, b)}.`], ...(level === 2 ? ([[mul(p, q(10)), 'Attention à la virgule : vérifie l’ordre de grandeur.'], [div(p, q(10)), 'Attention à la virgule : vérifie l’ordre de grandeur.']] as [Q, Rich][]) : [])],
        js: `${js(a)} * ${js(b)}`,
      });
      cases.push({
        t: tB,
        r,
        line: `${m('B')} : ${signWord(c, d)} ; ${m(`${dn(qabs(c))} \\div ${dn(qabs(d))} = ${dn(qabs(r))}`)}, donc ${m(`B = ${dn(r)}`)}.`,
        mistakes: [[neg(r), `Règle des signes (elle vaut aussi pour la division) : ${signWord(c, d)}.`], ...(level === 2 ? ([[mul(r, q(10)), 'Attention à la virgule : contrôle avec la multiplication inverse.'], [div(r, q(10)), 'Attention à la virgule : contrôle avec la multiplication inverse.'], [mul(c, d), 'Tu as multiplié au lieu de diviser.']] as [Q, Rich][]) : [])],
        js: `${js(c)} / ${js(d)}`,
      });
    } else {
      // A : trois ou quatre facteurs ; B : puissance d'un négatif (ou −a²)
      const nf = rng.int(3, 4);
      let fs: Q[];
      do fs = Array.from({ length: nf }, () => S(rng, 1, nf === 3 ? 6 : 5));
      while (fs.filter((v) => v.n < 0).length < 2 || fs.filter((v) => Math.abs(v.n) === 1).length > 1 || fs.some((v) => v.n === 1) || new Set(fs.map((v) => v.n)).size < 3);
      const p = fs.reduce(mul, q(1));
      const kneg = fs.filter((v) => v.n < 0).length;
      cases.push({
        t: fs.map(pn).join(' \\times '),
        r: p,
        line: `${m('A')} : ${kneg} facteurs négatifs (nombre ${kneg % 2 ? 'impair' : 'pair'}), donc ${m('A')} est ${kneg % 2 ? 'négatif' : 'positif'}. ${m(`${fs.map((v) => dn(qabs(v))).join(' \\times ')} = ${dn(qabs(p))}`)}, donc ${m(`A = ${dn(p)}`)}.`,
        mistakes: [[neg(p), kneg % 2 ? `« Moins par moins donne plus » vaut pour **deux** facteurs. Ici il y a ${kneg} facteurs négatifs (nombre impair) : le produit est négatif.` : `Il y a ${kneg} facteurs négatifs (nombre pair) : le produit est positif.`]],
        js: fs.map(js).join(' * '),
      });
      const kind = rng.pick(['cube', 'moinsUn', 'carreSans', 'pair']);
      let t: string, r: Q, line: Rich, mistakes: [Q | null, Rich][], jsx: string;
      if (kind === 'cube') {
        const a = rng.int(2, 5);
        r = q(-(a ** 3));
        t = `(-${a})^3`;
        line = `${m(`B = (-${a}) \\times (-${a}) \\times (-${a})`)} : trois facteurs négatifs, donc négatif ; ${m(`B = ${dn(r)}`)}.`;
        mistakes = [[q(a ** 3), 'Trois facteurs négatifs (nombre impair) : le cube d’un négatif est négatif.'], [q(-3 * a), `${m(`(-${a})^3`)} n’est pas ${m(`3 \\times (-${a})`)} : c’est ${m(`(-${a}) \\times (-${a}) \\times (-${a})`)}.`]];
        jsx = `(-${a})**3`;
      } else if (kind === 'moinsUn') {
        const e = rng.int(5, 12);
        r = q(e % 2 ? -1 : 1);
        t = `(-1)^{${e}}`;
        line = `${m('B')} : ${e} facteurs égaux à ${m('-1')} (nombre ${e % 2 ? 'impair' : 'pair'}), donc ${m(`B = ${dn(r)}`)}.`;
        mistakes = [[neg(r), `Compte les facteurs négatifs : ${e} est ${e % 2 ? 'impair' : 'pair'}.`], [q(-e), `${m(`(-1)^{${e}}`)} est un produit de ${e} facteurs ${m('-1')}, pas ${m(`${e} \\times (-1)`)}.`]];
        jsx = `(-1)**${e}`;
      } else if (kind === 'carreSans') {
        const a = rng.int(2, 9), e = a <= 3 ? rng.pick([2, 4]) : 2;
        r = q(-(a ** e));
        t = `-${a}^{${e}}`;
        line = `Sans parenthèses, la puissance ne porte que sur ${m(String(a))} : ${m(`B = -(${a}^{${e}}) = ${dn(r)}`)}.`;
        mistakes = [[q(a ** e), `C’est ${m(`(-${a})^{${e}}`)} qui vaudrait ${m(String(a ** e))}. Sans parenthèses, ${m(`-${a}^{${e}} = -(${a}^{${e}})`)}.`]];
        jsx = `-(${a}**${e})`;
      } else {
        const a = rng.int(2, 9), e = a <= 3 ? rng.pick([2, 4]) : 2;
        r = q(a ** e);
        t = `(-${a})^{${e}}`;
        line = `${m(`B = ${Array.from({ length: e }, () => `(-${a})`).join(' \\times ')}`)} : ${e} facteurs négatifs (nombre pair), donc positif ; ${m(`B = ${dn(r)}`)}.`;
        mistakes = [[neg(r), `Avec les parenthèses, la puissance porte sur ${m(`-${a}`)} : ${e} facteurs négatifs, résultat positif.`], [q(-a * e), `Une puissance n’est pas un produit par l’exposant : ${m(`(-${a})^{${e}} = ${Array.from({ length: e }, () => `(-${a})`).join(' \\times ')}`)}.`]];
        jsx = `(-${a})**${e}`;
      }
      cases.push({ t, r, line, mistakes, js: jsx });
    }
    return {
      title: 'Calcule.',
      display: cases.map((c, i) => `${'AB'[i]} = ${c.t}`).join(' \\qquad '),
      steps: cases.map((c, i) => numStep('', m(`${'AB'[i]} =`), c.r, 'On trouve d’abord le signe (même signe : positif ; signes contraires : négatif ; plusieurs facteurs : on compte les négatifs), puis on calcule avec les distances à zéro.', c.mistakes, { signHint: SIGN })),
      solution: [...cases.map((c) => c.line), ctrl],
      answer: cases.map((c, i) => m(`${'AB'[i]} = ${dn(c.r)}`)).join(' ; '),
      key: cases.map((c) => c.t).join('|'),
      data: { kind: 'js', items: cases.map((c, i) => ({ what: 'AB'[i], js: c.js, expect: toNum(c.r) })) },
    };
  },
};
// ===================================================================== signe d'un produit
export const signe: Generator = {
  id: 'signe',
  title: 'Signe d’un produit',
  desc: 'Sans calculer : compter les facteurs négatifs, puissances.',
  stars: 2,
  levels: [2],
  example: '(-3) \\times 5 \\times (-2) \\times (-1)',
  course: LINKS.s52,
  links: [LINKS.s53],
  generate(rng: Rng) {
    const OPTS = ['positif', 'négatif', 'nul'];
    const steps: Step[] = [];
    const lines: Rich[] = [];
    // a) produit de 4 à 6 facteurs (parfois avec un facteur nul)
    const nf = rng.int(4, 5);
    let fs: Q[];
    do fs = Array.from({ length: nf }, () => S(rng, 1, 6));
    while (fs.filter((v) => v.n < 0).length < 2 || fs.filter((v) => Math.abs(v.n) === 1).length > 1 || fs.some((v) => v.n === 1) || new Set(fs.map((v) => v.n)).size < 3);
    const zero = rng.chance(0.15);
    if (zero) fs[rng.int(1, nf - 1)] = q(0);
    const kneg = fs.filter((v) => v.n < 0).length;
    const p = fs.reduce(mul, q(1));
    const ca = zero ? 2 : kneg % 2 ? 1 : 0;
    const ta = fs.map(pn).join(' \\times ');
    steps.push({
      prompt: `a) Sans calculer, quel est le signe de ${m(`A = ${ta}`)} ?`,
      answer: fixedChoice(OPTS, ca, [
        zero ? `Un des facteurs est nul : le produit vaut ${m('0')}.` : `Il y a ${kneg} facteurs négatifs (nombre ${kneg % 2 ? 'impair' : 'pair'}).`,
        zero ? `Un des facteurs est nul : le produit vaut ${m('0')}.` : `Il y a ${kneg} facteurs négatifs (nombre ${kneg % 2 ? 'impair' : 'pair'}).`,
        `Aucun facteur n’est nul : le produit n’est pas nul.`,
      ]),
      hint: 'Compte les facteurs négatifs : nombre pair → positif ; impair → négatif. Un facteur nul rend le produit nul.',
    });
    if (!zero) steps.push(numStep(`Calcule ${m('A')}.`, m('A ='), p, 'Le signe vient d’être trouvé ; multiplie les distances à zéro.', [[neg(p), `Garde le signe trouvé : ${kneg} facteurs négatifs.`]], { signHint: SIGN }));
    lines.push(
      zero
        ? `a) Un des facteurs est nul, donc ${m('A = 0')}.`
        : `a) ${kneg} facteurs négatifs (nombre ${kneg % 2 ? 'impair' : 'pair'}) : ${m('A')} est ${kneg % 2 ? 'négatif' : 'positif'}. ${m(`${fs.map((v) => dn(qabs(v))).join(' \\times ')} = ${dn(qabs(p))}`)}, donc ${m(`A = ${dn(p)}`)}.`,
    );
    // b) (−a)^n ; c) −a^n
    const a = rng.int(2, 5), e = rng.int(2, 7);
    const pb = (-a) ** e;
    steps.push({
      prompt: `b) Sans calculer, quel est le signe de ${m(`B = (-${a})^{${e}}`)} ?`,
      answer: fixedChoice(OPTS.slice(0, 2), pb > 0 ? 0 : 1, [`${e} facteurs égaux à ${m(`-${a}`)} : nombre ${e % 2 ? 'impair' : 'pair'} de facteurs négatifs.`, `${e} facteurs égaux à ${m(`-${a}`)} : nombre ${e % 2 ? 'impair' : 'pair'} de facteurs négatifs.`]),
      hint: `${m(`(-${a})^{${e}}`)} est un produit de ${e} facteurs ${m(`-${a}`)}.`,
    });
    lines.push(`b) ${m(`(-${a})^{${e}}`)} : ${e} facteurs négatifs (nombre ${e % 2 ? 'impair' : 'pair'}), donc ${m('B')} est ${pb > 0 ? 'positif' : 'négatif'} (${m(`B = ${big(pb)}`)}).`);
    const c = rng.int(2, 5), ec = rng.pick([2, 4]);
    steps.push({
      prompt: `c) Sans calculer, quel est le signe de ${m(`C = -${c}^{${ec}}`)} ?`,
      answer: fixedChoice(OPTS.slice(0, 2), 1, [`Sans parenthèses, la puissance ne porte que sur ${m(String(c))} : ${m(`-${c}^{${ec}} = -(${c}^{${ec}})`)}, l’opposé d’un nombre positif.`]),
      hint: 'Regarde bien les parenthèses : sur quoi porte la puissance ?',
    });
    lines.push(`c) La puissance ne porte que sur ${m(String(c))} : ${m(`C = -(${c}^{${ec}}) = ${big(-(c ** ec))}`)}, négatif.`);
    return {
      title: 'Trouve le signe, sans calculer.',
      steps,
      solution: lines,
      answer: `${m('A')} ${OPTS[ca]} (${m(dn(p))}) ; ${m('B')} ${pb > 0 ? 'positif' : 'négatif'} ; ${m('C')} négatif`,
      key: `${ta}|${a}^${e}|${c}^${ec}`,
      data: {
        kind: 'js',
        items: [
          { what: 'A', js: fs.map(js).join(' * '), expect: toNum(p) },
          { what: 'step:0', js: `(${fs.map(js).join(' * ')}) === 0 ? 2 : (${fs.map(js).join(' * ')}) > 0 ? 0 : 1`, expect: ca },
          { what: `step:${zero ? 1 : 2}`, js: `(-${a})**${e} > 0 ? 0 : 1`, expect: pb > 0 ? 0 : 1 },
          { what: `step:${zero ? 2 : 3}`, js: `-(${c}**${ec}) > 0 ? 0 : 1`, expect: 1 },
        ],
      },
    };
  },
};
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');

// ===================================================================== priorités
type Prio = { t: string; r: Q; lines: string[]; mistakes: [Q | null, Rich][]; js: string };
function prio(rng: Rng, level: Level): Prio {
  const s = (a: number, b: number) => rng.signed(a, b);
  const P = (v: number) => (v < 0 ? `(${v})` : String(v));
  const kind = level === 2 ? rng.pick(['a+bc', '(a+b)c', 'c+a/b', 'sq-bc', '(a+b)(c+d)']) : rng.pick(['guide', 'sqsq', 'a-b(c-d)', 'a/b-cd']);
  const Q = (n: number) => q(n);
  switch (kind) {
    case 'a+bc': {
      const a = s(1, 12), b = s(2, 9), c = rng.int(2, 9) * (b > 0 ? -1 : rng.chance(0.5) ? 1 : -1);
      const r = a + b * c;
      return { t: `${a} + ${P(b)} \\times ${P(c)}`, r: Q(r), js: `${a} + (${b})*(${c})`, lines: [`Multiplication d’abord : ${m(`${P(b)} \\times ${P(c)} = ${b * c}`)}.`, m(`G = ${a} + ${P(b * c)} = ${r}`)], mistakes: [[Q((a + b) * c), 'Tu as calculé de gauche à droite : la multiplication passe **avant** l’addition.']] };
    }
    case '(a+b)c': {
      const a = s(1, 12), b = s(1, 12), c = s(2, 9);
      const r = (a + b) * c;
      return { t: `(${a} + ${P(b)}) \\times ${P(c)}`, r: Q(r), js: `(${a} + (${b}))*(${c})`, lines: [`Parenthèses d’abord : ${m(`${a} + ${P(b)} = ${a + b}`)}.`, m(`G = ${P(a + b)} \\times ${P(c)} = ${r}`)], mistakes: [[Q(a + b * c), 'Les parenthèses passent en premier : on calcule d’abord la somme.']] };
    }
    case 'c+a/b': {
      const b = s(2, 9), k = s(2, 9), a = b * k, c = s(1, 15);
      const r = c + k;
      return {
        t: `${c} + ${P(a)} \\div ${P(b)}`,
        r: Q(r),
        js: `${c} + (${a})/(${b})`,
        lines: [`Division d’abord : ${m(`${P(a)} \\div ${P(b)} = ${k}`)}.`, m(`G = ${c} + ${P(k)} = ${r}`)],
        mistakes: [[Number.isInteger((c + a) / b) ? Q((c + a) / b) : null, 'Tu as calculé de gauche à droite : la division passe **avant** l’addition.'], [Q(c - k), 'Règle des signes de la division : vérifie le signe du quotient.']],
      };
    }
    case 'sq-bc': {
      const a = rng.int(2, 6), b = s(2, 6), c = s(2, 6);
      const r = a * a - b * c;
      return {
        t: `(-${a})^2 - ${P(b)} \\times ${P(c)}`,
        r: Q(r),
        js: `(-${a})**2 - (${b})*(${c})`,
        lines: [`Puissance : ${m(`(-${a})^2 = ${a * a}`)}. Multiplication : ${m(`${P(b)} \\times ${P(c)} = ${b * c}`)}.`, m(`G = ${a * a} - ${P(b * c)} = ${a * a} + ${P(-b * c)} = ${r}`)],
        mistakes: [[Q(-a * a - b * c), `${m(`(-${a})^2 = (-${a}) \\times (-${a}) = ${a * a}`)} : un carré est positif.`], [Q(a * a + b * c), `${m(`${a * a} - ${P(b * c)}`)} : soustraire un nombre, c’est ajouter son opposé.`]],
      };
    }
    case '(a+b)(c+d)': {
      const a = s(1, 9), b = s(1, 9), c = s(1, 9), d = s(1, 9);
      if (a + b === 0 || c + d === 0) return prio(rng, level);
      const r = (a + b) * (c + d);
      return { t: `(${a} + ${P(b)}) \\times (${c} + ${P(d)})`, r: Q(r), js: `(${a} + (${b}))*(${c} + (${d}))`, lines: [`Parenthèses d’abord : ${m(`${a} + ${P(b)} = ${a + b}`)} et ${m(`${c} + ${P(d)} = ${c + d}`)}.`, m(`G = ${P(a + b)} \\times ${P(c + d)} = ${r}`)], mistakes: [[Q(a + b * c + d), 'Les parenthèses se calculent en premier.']] };
    }
    case 'guide': {
      // −3 + 4 × (−2)² − (−6) ÷ 3
      const a = s(1, 9), b = rng.int(2, 6), c = rng.int(2, 4), e = s(2, 5), k = s(2, 6), d = e * k;
      const r = a + b * c * c - k;
      return {
        t: `${a} + ${b} \\times (-${c})^2 - ${P(d)} \\div ${P(e)}`,
        r: Q(r),
        js: `${a} + ${b}*(-${c})**2 - (${d})/(${e})`,
        lines: [`Puissance : ${m(`(-${c})^2 = ${c * c}`)}, donc ${m(`G = ${a} + ${b} \\times ${c * c} - ${P(d)} \\div ${P(e)}`)}.`, `Multiplication et division : ${m(`${b} \\times ${c * c} = ${b * c * c}`)} et ${m(`${P(d)} \\div ${P(e)} = ${k}`)}, donc ${m(`G = ${a} + ${b * c * c} - ${P(k)}`)}.`, `Additions : ${m(`G = ${a} + ${b * c * c} + ${P(-k)} = ${r}`)}.`],
        mistakes: [[Q(a - b * c * c - k), `${m(`(-${c})^2 = ${c * c}`)} est positif.`], [Q(a + b * c * c + k), `Soustraire ${m(String(k))}, c’est ajouter ${m(String(-k))} : attention au signe du quotient.`], [Q((a + b) * c * c - k), 'Tu as calculé de gauche à droite : la multiplication passe avant l’addition.']],
      };
    }
    case 'sqsq': {
      const a = rng.int(2, 6), b = s(2, 5), c = rng.int(2, 4);
      const r = -a * a + b * c * c;
      return {
        t: `-${a}^2 + ${P(b)} \\times (-${c})^2`,
        r: Q(r),
        js: `-(${a}**2) + (${b})*(-${c})**2`,
        lines: [`Puissances : ${m(`-${a}^2 = -(${a}^2) = -${a * a}`)} (sans parenthèses, le carré porte sur ${m(String(a))}) et ${m(`(-${c})^2 = ${c * c}`)}.`, `Multiplication : ${m(`${P(b)} \\times ${c * c} = ${b * c * c}`)}.`, m(`G = -${a * a} + ${P(b * c * c)} = ${r}`)],
        mistakes: [[Q(a * a + b * c * c), `${m(`-${a}^2 = -${a * a}`)} : sans parenthèses, le carré ne porte que sur ${m(String(a))}.`], [Q(-a * a - b * c * c), `${m(`(-${c})^2 = ${c * c}`)} est positif.`]],
      };
    }
    case 'a-b(c-d)': {
      const a = s(1, 12), b = s(2, 6), c = s(1, 9), d = s(1, 9);
      if (c === d) return prio(rng, level);
      const r = a - b * (c - d);
      return {
        t: `${a} - ${P(b)} \\times (${c} - ${P(d)})`,
        r: Q(r),
        js: `${a} - (${b})*(${c} - (${d}))`,
        lines: [`Parenthèses : ${m(`${c} - ${P(d)} = ${c} + ${P(-d)} = ${c - d}`)}.`, `Multiplication : ${m(`${P(b)} \\times ${P(c - d)} = ${b * (c - d)}`)}.`, m(`G = ${a} - ${P(b * (c - d))} = ${r}`)],
        mistakes: [[Q((a - b) * (c - d)), 'Tu as calculé de gauche à droite : la multiplication passe avant la soustraction.'], [Q(a - b * (c + d)), `Dans la parenthèse, ${m(`${c} - ${P(d)}`)} : soustraire, c’est ajouter l’opposé.`]],
      };
    }
    default: {
      // a ÷ b − c × d
      const b = s(2, 6), k = s(2, 9), a = b * k, c = s(2, 6), d = s(2, 6);
      const r = k - c * d;
      return {
        t: `${P(a)} \\div ${P(b)} - ${P(c)} \\times ${P(d)}`,
        r: Q(r),
        js: `(${a})/(${b}) - (${c})*(${d})`,
        lines: [`Division et multiplication d’abord : ${m(`${P(a)} \\div ${P(b)} = ${k}`)} et ${m(`${P(c)} \\times ${P(d)} = ${c * d}`)}.`, m(`G = ${k} - ${P(c * d)} = ${r}`)],
        mistakes: [[Q((k - c) * d), 'Tu as calculé de gauche à droite : la multiplication passe avant la soustraction.'], [Q(k + c * d), `Soustraire ${m(P(c * d))}, c’est ajouter son opposé.`]],
      };
    }
  }
}
export const priorites: Generator = {
  id: 'priorites',
  title: 'Priorités avec des relatifs',
  desc: 'Parenthèses, puissances, × et ÷, puis + et −.',
  stars: 2,
  levels: [2, 3],
  example: '-3 + 4 \\times (-2)^2',
  course: LINKS.s6,
  generate(rng: Rng, level: Level) {
    const p = prio(rng, level);
    return {
      title: 'Calcule en respectant les priorités.',
      display: `G = ${p.t}`,
      steps: [numStep('', m('G ='), p.r, 'Priorités : parenthèses, puis puissances, puis multiplications et divisions, puis additions et soustractions. Règle des signes à chaque étape.', p.mistakes, { signHint: SIGN })],
      solution: [...p.lines, `Contrôle : on refait le calcul à la calculatrice, en tapant les parenthèses autour des nombres négatifs.`],
      answer: m(`G = ${dn(p.r)}`),
      key: p.t,
      data: { kind: 'js', items: [{ what: 'G', js: p.js, expect: toNum(p.r) }] },
    };
  },
};
export { isInt };
