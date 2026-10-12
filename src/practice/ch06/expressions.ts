/**
 * Produire, calculer, reconnaître (★) ; réduire (★) ; programmes de calcul (★★) ; vrai ou faux pour
 * tout x — contre-exemple (★★). Toutes les valeurs sont recalculées exactement (rationnels).
 */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type Poly, pAdd, pMul, pSub, pEval, pEq, pPow, witness } from '../engine/algebra';
import { type Q, q, toNum, div, sub, isInt } from '../engine/q';
import { texQ } from '../engine/expr';
import { fixedChoice, shuffledChoice, numStep, dn } from '../engine/build';
import { LINKS, m, P, pt, par, kpar, ljs, exprStep } from './common';

const nz = (rng: Rng, a: number, b: number) => rng.signed(a, b);
const nP = (b: number) => (b < 0 ? `(${b})` : String(b));
const mono = (a: number, d = 1) => `${a === 1 ? '' : a === -1 ? '-' : a}x${d > 1 ? `^${d}` : ''}`;

// ===================================================================== calculer une expression
/** Écriture « on remplace x par v » d'un polynôme : 2 × (−2)^2 − 3 × (−2) + 1. */
function substLine(p: Poly, v: Q): string {
  const vt = v.n < 0 ? `(${dn(v)})` : v.d !== 1 ? `\\dfrac{${v.n}}{${v.d}}` : dn(v);
  const vtp = v.d !== 1 ? `\\left(\\dfrac{${Math.abs(v.n)}}{${v.d}}\\right)` : vt;
  const out: string[] = [];
  for (let d = p.length - 1; d >= 0; d--) {
    const c = toNum(p[d]);
    if (c === 0) continue;
    const ac = Math.abs(c);
    const xs = d === 0 ? '' : d === 1 ? vt : `${vtp}^${d}`;
    const body = d === 0 ? String(ac) : ac === 1 ? xs : `${ac} \\times ${xs}`;
    out.push(out.length ? `${c < 0 ? '-' : '+'} ${body}` : `${c < 0 ? '-' : ''}${body}`);
  }
  return out.join(' ');
}
export const valeur: Generator = {
  id: 'valeur',
  title: 'Calculer une expression',
  desc: 'Remplacer $x$ par un nombre (négatif, fraction) en rétablissant × et parenthèses.',
  stars: 1,
  levels: [1, 2],
  example: '2x^2 - 3x + 1 \\text{ pour } x = -2',
  course: LINKS.s2,
  generate(rng: Rng, level: Level) {
    let p: Poly;
    let vals: Q[];
    if (level === 1) {
      const kind = rng.pick(['ax+b', 'ax2', 'x2-bx+c'] as const);
      if (kind === 'ax+b') p = P(nz(rng, 1, 9), nz(rng, 2, 9));
      else if (kind === 'ax2') p = P(nz(rng, 1, 9), 0, rng.int(2, 5));
      else p = P(nz(rng, 1, 9), nz(rng, 1, 6), 1);
      vals = [q(rng.int(2, 6)), q(-rng.int(1, 5))];
    } else {
      const kind = rng.pick(['quad', 'quad', 'frac'] as const);
      if (kind === 'frac') {
        // 3x − 5 pour x = 1/3 (et pour un négatif)
        const d = rng.pick([2, 3, 4, 5]), a = d * rng.int(1, 3) * (rng.chance(0.3) ? -1 : 1);
        p = P(nz(rng, 1, 9), a);
        vals = [q(rng.pick([1, d - 1, d + 1].filter((n) => n > 0 && n % d !== 0)), d), q(-rng.int(2, 6))];
      } else {
        p = P(nz(rng, 1, 9), nz(rng, 1, 7), rng.pick([2, 3, -1, -2]));
        vals = [q(rng.int(2, 5)), q(-rng.int(1, 4))];
      }
    }
    if (rng.chance(0.5)) vals.reverse();
    const js = `(${p.map((c, d) => `(${toNum(c)})*x**${d}`).join(' + ')})`;
    const a2 = p.length > 2 ? toNum(p[2]) : 0, a1 = toNum(p[1] ?? q(0));
    const steps: Step[] = vals.map((v, i) => {
      const r = pEval(p, v);
      const mk: [Q | null, Rich][] = [];
      if (a2 !== 0 && v.n < 0) mk.push([pEval(P(toNum(p[0]), a1, -a2), v), `${m(`(${dn(v)})^2 = ${dn(q(v.n * v.n, v.d * v.d))}`)} : le carré d’un négatif est **positif**.`]);
      if (Math.abs(a2) > 1) mk.push([pEval(P(toNum(p[0]), a1, a2 * a2), v), `${m(`${mono(a2, 2)}`)} : le carré ne porte que sur ${m('x')} (on calcule ${m('x^2')}, puis on multiplie par ${m(String(a2))}).`]);
      if (a1 !== 0 && v.n < 0) mk.push([pEval(P(toNum(p[0]), -a1, a2), v), `${m(`${nP(a1)} \\times (${dn(v)})`)} : attention à la règle des signes.`]);
      if (a2 !== 0) mk.push([pEval(P(toNum(p[0]), a1 + 2 * a2), v), `${m('x^2 = x \\times x')}, pas ${m('2x')}.`]);
      if (a1 !== 0 && a2 === 0 && v.d === 1 && v.n > 0) mk.push([q(Number(`${a1}${Math.abs(v.n)}`) * Math.sign(v.n) + toNum(p[0])), `${m(mono(a1))} veut dire ${m(`${a1} \\times x`)} : on rétablit le signe ${m('\\times')}.`]);
      return numStep(`${'ab'[i]}) Pour ${m(`x = ${v.d === 1 ? dn(v) : texQ(v)}`)} :`, m('A ='), r, 'Remplace chaque $x$ par la valeur (entre parenthèses si elle est négative), rétablis les signes ×, puis respecte les priorités : puissances, puis ×, puis + et −.', mk);
    });
    const lines: Rich[] = vals.map((v, i) => {
      const r = pEval(p, v);
      return `${'ab'[i]}) Pour ${m(`x = ${v.d === 1 ? dn(v) : texQ(v)}`)} : ${m(`A = ${substLine(p, v)} = ${texQ(r)}`)}.`;
    });
    if (vals.some((v) => v.n < 0) && a2 !== 0) lines.push(`Contrôle : ${m(`(${dn(vals.find((v) => v.n < 0)!)})^2`)} est positif ; on a mis les nombres négatifs entre parenthèses.`);
    return {
      title: `Calcule ${m(`A = ${pt(p)}`)} pour les valeurs demandées.`,
      steps,
      solution: lines,
      answer: vals.map((v, i) => `${'ab'[i]}) ${m(`A = ${texQ(pEval(p, v))}`)}`).join(' ; '),
      key: `${pt(p)}|${vals.map((v) => texQ(v)).join(',')}`,
      data: { kind: 'js', items: vals.map((v) => ({ what: `A(${toNum(v)})`, js: `((x) => ${js})(${toNum(v)})`, expect: toNum(pEval(p, v)) })) },
    };
  },
};

// ===================================================================== traduire une phrase
type Phrase = { txt: Rich; good: string; goodJs: string; bad: [string, string, Rich][] };
function phrase(rng: Rng, kind: string): Phrase {
  const k = rng.pick([2, 3, 4]), word = { 2: 'double', 3: 'triple', 4: 'quadruple' }[k]!;
  const c = rng.int(2, 12);
  switch (kind) {
    case 'k-moins':
      return { txt: `le ${word} de ${m('x')}, diminué de ${m(String(c))}`, good: `${k}x - ${c}`, goodJs: `${k}*x - ${c}`, bad: [[`${k}(x - ${c})`, `${k}*(x - ${c})`, `Ici on prend d’abord le ${word} de ${m('x')}, puis on enlève ${m(String(c))} : pas de parenthèses.`], [`x^${k} - ${c}`, `x**${k} - ${c}`, `Le ${word} de ${m('x')}, c’est ${m(`${k}x`)}, pas ${m(`x^${k}`)}.`], [`${c} - ${k}x`, `${c} - ${k}*x`, `« Diminué de ${c} » : on soustrait ${m(String(c))} du ${word}.`]] };
    case 'k-somme':
      return { txt: `le ${word} de la somme de ${m('x')} et de ${m(String(c))}`, good: `${k}(x + ${c})`, goodJs: `${k}*(x + ${c})`, bad: [[`${k}x + ${c}`, `${k}*x + ${c}`, `On calcule d’abord la somme, puis son ${word} : il faut des parenthèses.`], [`(x + ${c})^${k}`, `(x + ${c})**${k}`, `Le ${word}, c’est « multiplier par ${k} », pas une puissance.`], [`x + ${k} \\times ${c}`, `x + ${k * c}`, `C’est toute la somme qui est multipliée par ${m(String(k))}.`]] };
    case 'somme-k':
      return { txt: `la somme du ${word} de ${m('x')} et de ${m(String(c))}`, good: `${k}x + ${c}`, goodJs: `${k}*x + ${c}`, bad: [[`${k}(x + ${c})`, `${k}*(x + ${c})`, `On ajoute ${m(String(c))} au ${word} de ${m('x')} : seul ${m('x')} est multiplié.`], [`x^${k} + ${c}`, `x**${k} + ${c}`, `Le ${word} de ${m('x')}, c’est ${m(`${k}x`)}, pas ${m(`x^${k}`)}.`], [`${k}x + ${k * c}`, `${k}*x + ${k * c}`, `Seul ${m('x')} est multiplié par ${m(String(k))}.`]] };
    case 'carre-somme':
      return { txt: `le carré de la somme de ${m('x')} et de ${m(String(c))}`, good: `(x + ${c})^2`, goodJs: `(x + ${c})**2`, bad: [[`x^2 + ${c}`, `x**2 + ${c}`, `On calcule d’abord la somme, puis on élève **la somme** au carré.`], [`x^2 + ${c}^2`, `x**2 + ${c * c}`, `C’est la somme des carrés ; ici on veut le carré de la somme.`], [`2(x + ${c})`, `2*(x + ${c})`, 'Le carré, ce n’est pas le double.']] };
    case 'somme-carre':
      return { txt: `la somme du carré de ${m('x')} et de ${m(String(c))}`, good: `x^2 + ${c}`, goodJs: `x**2 + ${c}`, bad: [[`(x + ${c})^2`, `(x + ${c})**2`, `C’est le carré de la somme ; ici seul ${m('x')} est élevé au carré.`], [`2x + ${c}`, `2*x + ${c}`, `Le carré de ${m('x')}, c’est ${m('x^2')}, pas ${m('2x')}.`], [`x^2 + ${c}^2`, `x**2 + ${c * c}`, `On ajoute ${m(String(c))}, pas son carré.`]] };
    case 'diff-k':
      return { txt: `le produit par ${m(String(k))} de la différence entre ${m('x')} et ${m(String(c))}`, good: `${k}(x - ${c})`, goodJs: `${k}*(x - ${c})`, bad: [[`${k}x - ${c}`, `${k}*x - ${c}`, 'C’est toute la différence qui est multipliée : il faut des parenthèses.'], [`${k}(${c} - x)`, `${k}*(${c} - x)`, `La différence entre ${m('x')} et ${m(String(c))}, c’est ${m(`x - ${c}`)}.`], [`x - ${k * c}`, `x - ${k * c}`, `${m('x')} aussi est multiplié par ${m(String(k))}.`]] };
    case 'carre-moins':
      return { txt: `le carré de ${m('x')}, diminué du ${word} de ${m('x')}`, good: `x^2 - ${k}x`, goodJs: `x**2 - ${k}*x`, bad: [[`(x - ${k}x)^2`, `(x - ${k}*x)**2`, `On élève d’abord ${m('x')} au carré, puis on soustrait ${m(`${k}x`)}.`], [`2x - ${k}x`, `2*x - ${k}*x`, `Le carré de ${m('x')}, c’est ${m('x^2')}.`], [`x^2 - x^${k}`, `x**2 - x**${k}`, `Le ${word} de ${m('x')}, c’est ${m(`${k}x`)}.`]] };
    default:
      return { txt: `la moitié de ${m('x')}, augmentée de ${m(String(c))}`, good: `\\dfrac{x}{2} + ${c}`, goodJs: `x/2 + ${c}`, bad: [[`\\dfrac{x + ${c}}{2}`, `(x + ${c})/2`, `On prend d’abord la moitié de ${m('x')}, puis on ajoute ${m(String(c))}.`], [`2x + ${c}`, `2*x + ${c}`, `La moitié, c’est diviser par ${m('2')}, pas multiplier.`], [`x^2 + ${c}`, `x**2 + ${c}`, `La moitié de ${m('x')}, c’est ${m('\\dfrac{x}{2}')}.`]] };
  }
}
export const traduire: Generator = {
  id: 'traduire',
  title: 'Traduire une phrase',
  desc: 'Le carré de la somme ou la somme des carrés ?',
  stars: 1,
  levels: [1],
  example: '(x + 2)^2 \\text{ ou } x^2 + 2\\,?',
  course: LINKS.s12,
  generate(rng: Rng) {
    const pairs = [['carre-somme', 'somme-carre'], ['k-somme', 'somme-k'], ['k-moins', 'diff-k'], ['carre-moins', 'moitie'], ['k-somme', 'k-moins'], ['somme-carre', 'diff-k']];
    const ks = rng.shuffle(rng.pick(pairs));
    const ps = ks.map((k) => phrase(rng, k));
    const steps: Step[] = ps.map((p, i) => ({
      prompt: `${'ab'[i]}) ${p.txt.charAt(0).toUpperCase() + p.txt.slice(1)} :`,
      answer: shuffledChoice(rng, m(p.good), p.bad.map(([t, , why]) => [m(t), why] as [Rich, Rich])),
      hint: 'Repère la **dernière** opération de la phrase (« le carré de… », « la somme de… ») : elle donne la forme de l’expression.',
    }));
    return {
      title: `Choisis l’expression qui traduit chaque phrase (${m('x')} désigne un nombre).`,
      steps,
      solution: ps.map((p, i) => `${'ab'[i]}) ${p.txt.charAt(0).toUpperCase() + p.txt.slice(1)} : ${m(p.good)}.`),
      answer: ps.map((p, i) => `${'ab'[i]}) ${m(p.good)}`).join(' ; '),
      key: ps.map((p) => p.good).join('|'),
      data: {
        kind: 'js',
        items: ps.map((p, i) => {
          const A = steps[i].answer as { options: string[] };
          const fns = A.options.map((o) => {
            const t = o.slice(1, -1);
            if (t === p.good) return p.goodJs;
            return p.bad.find((b) => b[0] === t)![1];
          });
          return { what: `step:${i}`, js: `[${fns.map((f) => `(x) => ${f}`).join(', ')}].findIndex((f) => [1.37, -2.6, 4.1].every((X) => Math.abs(f(X) - ((x) => ${p.goodJs})(X)) < 1e-9))`, expect: (A as unknown as { correct: number }).correct };
        }),
      },
    };
  },
};

// ===================================================================== somme ou produit ?
type Nat = { tex: string; prod: boolean; why: Rich };
function natureExpr(rng: Rng, kind: string): Nat {
  const a = rng.int(2, 9), b = nz(rng, 1, 9), c = rng.int(1, 9), d = nz(rng, 1, 9);
  const L = (x: number, y: number) => pt(P(y, x));
  switch (kind) {
    case 'ax+b':
      return { tex: L(a, b), prod: false, why: 'on multiplie, puis on **ajoute** en dernier' };
    case 'k(x+b)':
      return { tex: `${a}(${L(1, b)})`, prod: true, why: 'on calcule la parenthèse, puis on **multiplie** en dernier' };
    case '(x+a)(x+b)':
      return { tex: `(${L(1, b)})(${L(1, d)})`, prod: true, why: 'on calcule les deux parenthèses, puis on les **multiplie**' };
    case 'x2+c':
      return { tex: `x^2 + ${c}`, prod: false, why: 'on élève au carré, puis on **ajoute** en dernier' };
    case 'k(x+b)+c':
      return { tex: `${a}(${L(1, b)}) + ${c}`, prod: false, why: `on **ajoute** ${m(String(c))} en dernier` };
    case '(x+b)^2':
      return { tex: `(${L(1, b)})^2`, prod: true, why: 'le carré d’une parenthèse est un produit : ' + m(`(${L(1, b)})(${L(1, b)})`) };
    case 'x(x+b)':
      return { tex: `x(${L(a, b)})`, prod: true, why: 'on **multiplie** en dernier' };
    case 'ax2-bx':
      return { tex: pt(P(0, -Math.abs(b), a)), prod: false, why: 'on **soustrait** en dernier' };
    case '(x+b)(x+d)-c':
      return { tex: `(${L(1, b)})(${L(1, d)}) - ${c}`, prod: false, why: `on **soustrait** ${m(String(c))} en dernier` };
    default:
      return { tex: `${a}x(${L(1, d)})`, prod: true, why: 'on **multiplie** en dernier' };
  }
}
export const nature: Generator = {
  id: 'nature',
  title: 'Somme ou produit ?',
  desc: 'La dernière opération donne la nature de l’expression.',
  stars: 1,
  levels: [1],
  example: '2(x + 1) + 3',
  course: LINKS.s3,
  generate(rng: Rng) {
    const S = ['ax+b', 'x2+c', 'k(x+b)+c', 'ax2-bx', '(x+b)(x+d)-c'], Pr = ['k(x+b)', '(x+a)(x+b)', '(x+b)^2', 'x(x+b)', 'kx(x+d)'];
    const kinds = rng.shuffle([rng.pick(S), rng.pick(Pr), rng.pick(rng.chance(0.5) ? S : Pr), rng.pick(['k(x+b)+c', '(x+b)(x+d)-c', '(x+b)^2'])]);
    const ex = kinds.map((k) => natureExpr(rng, k));
    if (new Set(ex.map((e) => e.tex)).size < ex.length) return nature.generate(rng, 1);
    const steps: Step[] = ex.map((e, i) => ({
      prompt: `${'abcd'[i]}) ${m(e.tex)}`,
      answer: fixedChoice(['Somme', 'Produit'], e.prod ? 1 : 0, [`C’est un produit : ${e.why}.`, `C’est une somme : ${e.why}.`]),
      hint: 'Imagine qu’on calcule l’expression pour une valeur de $x$ : quelle opération ferait-on **en dernier** ?',
    }));
    return {
      title: 'Somme ou produit ? (Quelle opération ferait-on en dernier ?)',
      steps,
      solution: ex.map((e, i) => `${'abcd'[i]}) ${m(e.tex)} : ${e.prod ? 'produit' : 'somme'} (${e.why}).`),
      answer: ex.map((e, i) => `${'abcd'[i]}) ${e.prod ? 'produit' : 'somme'}`).join(' ; '),
      key: ex.map((e) => e.tex).join('|'),
      // vérifié par les tests : l'expression est relue (analyse de la dernière opération)
      data: { kind: 'js', items: [] },
    };
  },
};

// ===================================================================== réduire
export const reduire: Generator = {
  id: 'reduire',
  title: 'Réduire',
  desc: 'Regrouper les termes semblables (x², x, nombres).',
  stars: 1,
  levels: [1, 2],
  example: '3x^2 + 5x - 7 - x^2 + 2x + 4',
  course: LINKS.s4,
  generate(rng: Rng, level: Level) {
    // termes : [coefficient, degré]
    let terms: [number, number][];
    if (level === 1) terms = [[nz(rng, 1, 9), 1], [nz(rng, 1, 12), 0], [nz(rng, 1, 9), 1], [nz(rng, 1, 12), 0], ...(rng.chance(0.4) ? ([[nz(rng, 1, 5), 1]] as [number, number][]) : [])];
    else terms = [[nz(rng, 1, 6), 2], [nz(rng, 1, 9), 1], [nz(rng, 1, 9), 0], [nz(rng, 1, 5), 2], [nz(rng, 1, 9), 1], ...(rng.chance(0.5) ? ([[nz(rng, 1, 9), 0]] as [number, number][]) : [])];
    terms = rng.shuffle(terms);
    // pas de x² ni de x en tête négatifs pour tous ; pas de réduction totale d'un degré
    const sum = (d: number) => terms.filter((t) => t[1] === d).reduce((s, t) => s + t[0], 0);
    const degs = [...new Set(terms.map((t) => t[1]))];
    if (degs.some((d) => sum(d) === 0)) return reduire.generate(rng, level);
    const tt = (c: number, d: number, first: boolean) => {
      const body = d === 0 ? String(Math.abs(c)) : `${Math.abs(c) === 1 ? '' : Math.abs(c)}x${d === 2 ? '^2' : ''}`;
      return first ? `${c < 0 ? '-' : ''}${body}` : `${c < 0 ? '-' : '+'} ${body}`;
    };
    const display = terms.map((t, i) => tt(t[0], t[1], i === 0)).join(' ');
    const expect = P(sum(0), sum(1), level === 2 ? sum(2) : 0);
    const js = terms.map((t) => `(${t[0]})*x**${t[1]}`).join(' + ');
    const lines: Rich[] = [];
    const lab = { 2: 'Termes en $x^2$', 1: 'Termes en $x$', 0: 'Nombres' } as Record<number, string>;
    const parts = [2, 1, 0]
      .filter((d) => degs.includes(d))
      .map((d) => {
        const ts = terms.filter((t) => t[1] === d);
        const r = sum(d);
        return ts.length > 1 ? `${lab[d]} : ${m(`${ts.map((t, i) => tt(t[0], d, i === 0)).join(' ')} = ${tt(r, d, true)}`)}.` : `${lab[d]} : ${m(tt(r, d, true))} reste seul.`;
      });
    lines.push('On regroupe les termes semblables (chaque terme avec son signe) :', ...parts);
    lines.push(m(`B = ${pt(expect)}`));
    const mistakes: [Poly, Rich][] = [
      [P(0, sum(0) + sum(1) + (level === 2 ? sum(2) : 0)), `On ne peut pas additionner des ${m('x')} et des nombres (tuiles différentes) : ${m(`3x + 2 \\neq 5x`)}.`],
      ...(level === 2 ? ([[P(sum(0), 0, sum(1) + sum(2)), `Les termes en ${m('x^2')} et en ${m('x')} ne se regroupent pas.`], [P(sum(0), sum(2) + sum(1)), `Les termes en ${m('x^2')} et en ${m('x')} ne se regroupent pas.`]] as [Poly, Rich][]) : []),
      [P(terms.filter((t) => t[1] === 0).reduce((s, t) => s + Math.abs(t[0]), 0), terms.filter((t) => t[1] === 1).reduce((s, t) => s + Math.abs(t[0]), 0), terms.filter((t) => t[1] === 2).reduce((s, t) => s + Math.abs(t[0]), 0)), 'Chaque terme garde **son signe** quand on regroupe.'],
    ];
    return {
      title: 'Réduis l’expression.',
      display: `B = ${display}`,
      steps: [exprStep({ label: m('B ='), expect, form: 'dev', tex: pt(expect), hint: `Regroupe les termes semblables : ${level === 2 ? `les ${m('x^2')} ensemble, ` : ''}les ${m('x')} ensemble, les nombres ensemble. Chaque terme garde son signe.`, mistakes })],
      solution: lines,
      answer: m(`B = ${pt(expect)}`),
      key: display,
      data: { kind: 'poly', js, expect },
    };
  },
};

// ===================================================================== programme de calcul
type Prog = { steps: Rich[]; expr: Poly; app: (x: number) => number; js: string; proof: string[]; remark?: Rich };
function programme(rng: Rng): Prog {
  const kind = rng.pick(['F1', 'F2', 'carre+', 'carre-', 'gen']);
  if (kind === 'F1') {
    const a = rng.int(2, 9), k = rng.int(2, 6);
    return { steps: [`ajouter ${m(String(a))}`, `multiplier par ${m(String(k))}`, `soustraire ${m(String(k * a))}`], expr: P(0, k), app: (x) => (x + a) * k - k * a, js: `(x + ${a})*${k} - ${k * a}`, proof: [`${k}(x + ${a}) - ${k * a}`, `${k}x + ${k * a} - ${k * a}`, `${k}x`], remark: `On obtient toujours ${m(String(k))} fois le nombre de départ.` };
  }
  if (kind === 'F2') {
    const a = rng.int(1, 9), k = rng.int(2, 5);
    return { steps: [`multiplier par ${m('2')}`, `ajouter ${m(String(a))}`, `multiplier le résultat par ${m(String(k))}`, `soustraire ${m(String(k * a))}`], expr: P(0, 2 * k), app: (x) => (2 * x + a) * k - k * a, js: `(2*x + ${a})*${k} - ${k * a}`, proof: [`${k}(2x + ${a}) - ${k * a}`, `${2 * k}x + ${k * a} - ${k * a}`, `${2 * k}x`] };
  }
  if (kind === 'carre+' || kind === 'carre-') {
    const a = rng.int(1, 6), s = kind === 'carre+' ? 1 : -1;
    const e = P(a * a, 2 * s * a);
    return { steps: [`${s > 0 ? 'ajouter' : 'soustraire'} ${m(String(a))}`, 'élever au carré', 'soustraire le carré du nombre de départ'], expr: e, app: (x) => (x + s * a) ** 2 - x * x, js: `(x ${s > 0 ? '+' : '-'} ${a})**2 - x**2`, proof: [`(x ${s > 0 ? '+' : '-'} ${a})^2 - x^2`, `x^2 ${s > 0 ? '+' : '-'} ${2 * a}x + ${a * a} - x^2`, pt(e)] };
  }
  const k = rng.int(2, 5), a = rng.int(1, 9), c = rng.int(1, 9), mm = rng.int(2, 4);
  if (k * a * mm - c === 0) return programme(rng);
  // choisir x ; multiplier par k ; ajouter a ; multiplier par mm ; soustraire c
  const e = P(a * mm - c, k * mm);
  return { steps: [`multiplier par ${m(String(k))}`, `ajouter ${m(String(a))}`, `multiplier le résultat par ${m(String(mm))}`, `soustraire ${m(String(c))}`], expr: e, app: (x) => (k * x + a) * mm - c, js: `(${k}*x + ${a})*${mm} - ${c}`, proof: [`${mm}(${k}x + ${a}) - ${c}`, `${k * mm}x + ${a * mm} - ${c}`, pt(e)] };
}
export const progCalcul: Generator = {
  id: 'programme',
  title: 'Programme de calcul',
  desc: 'Tester, écrire le résultat en fonction de x, remonter.',
  stars: 2,
  levels: [2],
  example: '(x + 3)^2 - x^2',
  course: LINKS.s81,
  generate(rng: Rng) {
    const pg = programme(rng);
    const x0 = rng.pick([-3, -2, 2, 3, 4, 5, 6, 7]);
    const r0 = pg.app(x0);
    const a1 = toNum(pg.expr[1]), a0 = toNum(pg.expr[0] ?? q(0));
    // nombre à choisir pour obtenir R (construit à rebours : on choisit la réponse entière)
    const xs = rng.intNot(-6, 12, x0, 0);
    const R = a1 * xs + a0;
    const steps: Step[] = [
      numStep(`a) Quel résultat obtient-on en choisissant ${m(String(x0))} ?`, 'Résultat :', q(r0), 'Applique les étapes dans l’ordre, une par une. Mets le nombre entre parenthèses s’il est négatif.', [[q(pg.app(-x0)), 'Attention au signe du nombre de départ.']]),
      exprStep({ prompt: `b) On choisit un nombre ${m('x')}. Écris le résultat en fonction de ${m('x')}, sous forme développée et réduite.`, label: 'Résultat :', expect: pg.expr, form: 'dev', tex: pt(pg.expr), hint: `Écris chaque étape avec ${m('x')} (en gardant les parenthèses), puis développe et réduis.`, mistakes: [] }),
      numStep(`c) Quel nombre faut-il choisir pour obtenir ${m(String(R))} ?`, m('x ='), q(xs), `Résous l’équation ${m(`${pt(pg.expr)} = ${R}`)}.`, [[q(R), 'Ça, c’est le résultat voulu. On cherche le nombre de départ.'], [a1 !== 0 && Number.isInteger(R / a1) && R / a1 !== xs ? q(R / a1) : null, `N’oublie pas le terme constant ${m(String(a0))} : on le retire d’abord.`]]),
    ];
    const lines: Rich[] = [
      `a) Avec ${m(String(x0))} : ${traceLine(pg, x0)}.`,
      `b) Avec ${m('x')}, le résultat est ${m(pg.proof.join(' = '))}.`,
      `c) ${m(`${pt(pg.expr)} = ${R}`)} donne ${a0 !== 0 ? `${m(`${mono(a1)} = ${R - a0}`)}, donc ` : ''}${m(`x = ${xs}`)}. Contrôle : le programme appliqué à ${m(String(xs))} donne bien ${m(String(pg.app(xs)))}.`,
    ];
    if (pg.remark) lines.splice(2, 0, pg.remark);
    return {
      title: `Programme : choisir un nombre ; ${pg.steps.join(' ; ')}.`,
      steps,
      solution: lines,
      answer: `a) ${m(String(r0))} ; b) ${m(pt(pg.expr))} ; c) ${m(String(xs))}`,
      key: `${pg.js}|${x0}|${xs}`,
      data: { kind: 'poly', js: pg.js, expect: pg.expr, also: [{ what: 'a', js: `((x) => ${pg.js})(${x0})`, expect: r0 }, { what: 'c', js: `((x) => ${pg.js})(${xs}) === ${R} ? ${xs} : NaN`, expect: xs }] },
    };
  },
};
/** Déroulé du programme sur un nombre : 2 + 3 = 5 ; 5² = 25 ; … */
function traceLine(pg: Prog, x0: number): string {
  // les programmes sont reconnus par leur écriture JavaScript
  const out: string[] = [];
  let v = x0;
  const P0 = (n: number) => (n < 0 ? `(${n})` : String(n));
  for (const s of pg.steps) {
    const t = s.replace(/\$/g, '');
    const num = Number((/(-?\d+)/.exec(t) ?? [])[1]);
    let nv = v, txt = '';
    if (t.startsWith('ajouter')) { nv = v + num; txt = `${v} + ${num} = ${nv}`; }
    else if (t.startsWith('soustraire le carré')) { nv = v - x0 * x0; txt = `${v} - ${P0(x0)}^2 = ${nv}`; }
    else if (t.startsWith('soustraire')) { nv = v - num; txt = `${v} - ${num} = ${nv}`; }
    else if (t.startsWith('multiplier')) { nv = v * num; txt = `${P0(v)} \\times ${num} = ${nv}`; }
    else if (t.startsWith('élever')) { nv = v * v; txt = `${P0(v)}^2 = ${nv}`; }
    out.push(m(txt));
    v = nv;
  }
  return out.join(' ; ');
}

// ===================================================================== vrai pour tout x ?
type Id = { l: string; r: string; lj: string; rj: string; lp: Poly; rp: Poly; why: Rich };
function identity(rng: Rng, truth: boolean): Id {
  const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.int(2, 6);
  const T: Id[] = [
    { l: `${a}x + ${b}x`, r: `${a + b}x`, lj: `${a}*x + ${b}*x`, rj: `${a + b}*x`, lp: P(0, a + b), rp: P(0, a + b), why: `distributivité : ${m(`${a}x + ${b}x = (${a} + ${b})x`)}` },
    { l: `(x + ${a})^2`, r: `x^2 + ${2 * a}x + ${a * a}`, lj: `(x + ${a})**2`, rj: `x**2 + ${2 * a}*x + ${a * a}`, lp: P(a * a, 2 * a, 1), rp: P(a * a, 2 * a, 1), why: `identité ${m('(a + b)^2 = a^2 + 2ab + b^2')}` },
    { l: `x^2 - ${a * a}`, r: `(x - ${a})(x + ${a})`, lj: `x**2 - ${a * a}`, rj: `(x - ${a})*(x + ${a})`, lp: P(-a * a, 0, 1), rp: P(-a * a, 0, 1), why: `identité ${m('a^2 - b^2 = (a - b)(a + b)')}` },
    { l: `-(x - ${a})`, r: `-x + ${a}`, lj: `-(x - ${a})`, rj: `-x + ${a}`, lp: P(a, -1), rp: P(a, -1), why: `le signe ${m('-')} change tous les signes de la parenthèse` },
    { l: `${c}(x + ${a})`, r: `${c}x + ${c * a}`, lj: `${c}*(x + ${a})`, rj: `${c}*x + ${c * a}`, lp: P(c * a, c), rp: P(c * a, c), why: 'distributivité simple' },
    { l: `${c}x \\times ${b}x`, r: `${b * c}x^2`, lj: `${c}*x*${b}*x`, rj: `${b * c}*x**2`, lp: P(0, 0, b * c), rp: P(0, 0, b * c), why: `${m(`${c} \\times ${b} = ${b * c}`)} et ${m('x \\times x = x^2')}` },
  ];
  const F: Id[] = [
    { l: `(x + ${a})^2`, r: `x^2 + ${a * a}`, lj: `(x + ${a})**2`, rj: `x**2 + ${a * a}`, lp: P(a * a, 2 * a, 1), rp: P(a * a, 0, 1), why: `il manque le double produit ${m(`${2 * a}x`)}` },
    { l: `${a}x + ${b}`, r: `${a + b}x`, lj: `${a}*x + ${b}`, rj: `${a + b}*x`, lp: P(b, a), rp: P(0, a + b), why: `on n’additionne pas des ${m('x')} et des nombres` },
    { l: `${c}x + ${c * a}`, r: `${c}(x + ${c * a})`, lj: `${c}*x + ${c * a}`, rj: `${c}*(x + ${c * a})`, lp: P(c * a, c), rp: P(c * c * a, c), why: `factorisation « à moitié » : ${m(`${c}(x + ${c * a}) = ${c}x + ${c * c * a}`)}` },
    { l: `-${c}(x - ${a})`, r: `-${c}x - ${c * a}`, lj: `-${c}*(x - ${a})`, rj: `-${c}*x - ${c * a}`, lp: P(c * a, -c), rp: P(-c * a, -c), why: `${m(`-${c} \\times (-${a}) = +${c * a}`)}` },
    { l: 'x + x', r: 'x^2', lj: 'x + x', rj: 'x**2', lp: P(0, 2), rp: P(0, 0, 1), why: `${m('x + x = 2x')} ; c’est ${m('x \\times x')} qui vaut ${m('x^2')}` },
    { l: `(x - ${a})^2`, r: `x^2 - ${a * a}`, lj: `(x - ${a})**2`, rj: `x**2 - ${a * a}`, lp: P(a * a, -2 * a, 1), rp: P(-a * a, 0, 1), why: `${m('(a - b)^2 = a^2 - 2ab + b^2')}` },
    { l: `${c}x \\times ${b}x`, r: `${b * c}x`, lj: `${c}*x*${b}*x`, rj: `${b * c}*x`, lp: P(0, 0, b * c), rp: P(0, b * c), why: `${m('x \\times x = x^2')}` },
    { l: `x^2 - ${a * a}`, r: `(x - ${a})^2`, lj: `x**2 - ${a * a}`, rj: `(x - ${a})**2`, lp: P(-a * a, 0, 1), rp: P(a * a, -2 * a, 1), why: `${m(`(x - ${a})^2 = x^2 - ${2 * a}x + ${a * a}`)} ; la bonne factorisation est ${m(`(x - ${a})(x + ${a})`)}` },
  ];
  return rng.pick(truth ? T : F);
}
export const vraiFaux: Generator = {
  id: 'vrai-faux',
  title: 'Vrai pour tout x ? Contre-exemple',
  desc: 'Reconnaître une identité ; réfuter par un contre-exemple.',
  stars: 2,
  levels: [2],
  example: '(x + 3)^2 = x^2 + 9\\ ?',
  course: LINKS.s8,
  generate(rng: Rng) {
    const truths = rng.shuffle([true, false, rng.chance(0.5)]);
    const ids: Id[] = [];
    for (const t of truths) {
      let id: Id;
      do id = identity(rng, t);
      while (ids.some((x) => x.l === id.l && x.r === id.r) || ids.some((x) => x.why === id.why));
      ids.push(id);
    }
    const steps: Step[] = [];
    const lines: Rich[] = [];
    ids.forEach((id, i) => {
      const ok = pEq(id.lp, id.rp);
      const w = ok ? null : witness(id.lp, id.rp)!;
      steps.push({
        prompt: `${'abc'[i]}) ${m(`${id.l} = ${id.r}`)}`,
        answer: fixedChoice(['Vraie pour tout $x$', 'Fausse'], ok ? 0 : 1, [
          `Contre-exemple : pour ${m(`x = ${w?.x}`)}, ${m(id.l)} vaut ${m(texQ(w?.va ?? q(0)))} mais ${m(id.r)} vaut ${m(texQ(w?.vb ?? q(0)))}. (${id.why}.)`,
          `Elle est vraie pour tout ${m('x')} : ${id.why}.`,
        ]),
        hint: 'Teste avec une valeur simple (x = 1, x = 2) : un seul cas où les deux membres diffèrent suffit pour dire « fausse ». Pour « vraie », il faut une règle du cours.',
      });
      lines.push(ok ? `${'abc'[i]}) Vraie pour tout ${m('x')} : ${id.why}.` : `${'abc'[i]}) Fausse : pour ${m(`x = ${w!.x}`)}, ${m(`${id.l} = ${texQ(w!.va)}`)} mais ${m(`${id.r} = ${texQ(w!.vb)}`)} (${id.why}).`);
    });
    return {
      title: 'Ces égalités sont-elles vraies pour toutes les valeurs de $x$ ?',
      steps,
      solution: [...lines, 'Un seul contre-exemple suffit à prouver qu’une égalité n’est pas une identité ; des exemples ne suffisent pas à prouver qu’elle l’est.'],
      answer: ids.map((id, i) => `${'abc'[i]}) ${pEq(id.lp, id.rp) ? 'vraie' : 'fausse'}`).join(' ; '),
      key: ids.map((x) => `${x.l}=${x.r}`).join('|'),
      data: { kind: 'js', items: ids.map((id, i) => ({ what: `step:${i}`, js: `[1.3, -2.7, 0.6, 5].every((x) => Math.abs((${id.lj}) - (${id.rj})) < 1e-9) ? 0 : 1`, expect: pEq(id.lp, id.rp) ? 0 : 1 })) },
    };
  },
};
export { pAdd, pMul, pSub, pPow, par, kpar, ljs, div, sub, isInt };
