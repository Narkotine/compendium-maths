/**
 * Transformer une expression : développer (distributivité simple ★, double ★★), factoriser (★ → ★★★),
 * identités remarquables dans les deux sens (★★). Réponse = expression tapée par l'élève, comparée
 * exactement (polynômes) ; la FORME est vérifiée (développée réduite / produit complètement factorisé).
 * Construction à rebours : pour factoriser, on choisit d'abord la forme factorisée (facteurs « finis »),
 * puis on développe pour écrire l'énoncé.
 */
import type { Generator, Level, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type Poly, pAdd, pSub, pMul, pNeg } from '../engine/algebra';
import { gcd, q, toNum } from '../engine/q';
import { LINKS, m, P, pt, par, kpar, pjs, ljs, exprStep, cx } from './common';

const nz = (rng: Rng, a: number, b: number) => rng.signed(a, b);
/** Monôme ax (ou ax²) en TeX : 2x, x, -x, 4x^2. */
const mono = (a: number, d = 1) => `${a === 1 ? '' : a === -1 ? '-' : a}x${d > 1 ? `^${d}` : ''}`;
/** Monôme entre parenthèses s'il est négatif (après ×). */
const monoP = (a: number, d = 1) => (a < 0 ? `(${mono(a, d)})` : mono(a, d));
const nP = (b: number) => (b < 0 ? `(${b})` : String(b));
const DEV_HINT = 'Le facteur devant la parenthèse multiplie **chaque** terme de la parenthèse, **avec son signe**.';

// ===================================================================== développer (distributivité simple)
export const developper: Generator = {
  id: 'developper',
  title: 'Développer : k(a + b)',
  desc: 'Distributivité simple, signe − devant une parenthèse.',
  stars: 1,
  levels: [1, 2, 3],
  example: '-2(3x - 5)',
  course: LINKS.s51,
  generate(rng: Rng, level: Level) {
    let display: string, expect: Poly, js: string;
    const lines: Rich[] = [];
    let mistakes: [Poly | null, Rich][] = [];
    const kind = level === 1 ? rng.weighted([['k', 4], ['x', 1.2]] as const) : level === 2 ? rng.pick(['c+k', 'c-k', 'ax+k', 'moins'] as const) : rng.pick(['kx', 'deux'] as const);
    if (kind === 'k') {
      const k = nz(rng, 2, 9), a = rng.weighted([[1, 2], [2, 1], [3, 1], [4, 0.6], [5, 0.6]] as const), b = nz(rng, 1, 9);
      expect = P(k * b, k * a);
      display = kpar(k, P(b, a));
      js = `${k}*${ljs(a, b)}`;
      lines.push(m(`${display} = ${cx(k)} \\times ${mono(a)} + ${cx(k)} \\times ${nP(b)} = ${pt(expect)}`));
      mistakes = [
        [P(b, k * a), `${DEV_HINT} Ici, ${m(String(k))} multiplie aussi ${m(String(b))}.`],
        [P(-k * b, k * a), `Attention au signe du second produit : ${m(`${cx(k)} \\times ${nP(b)} = ${k * b}`)}.`],
        [P(k * b, a), `${m(String(k))} multiplie aussi ${m(mono(a))}.`],
      ];
    } else if (kind === 'x') {
      const a = rng.weighted([[1, 3], [2, 1], [3, 1]] as const), b = nz(rng, 1, 9);
      expect = P(0, b, a);
      display = `x(${pt(P(b, a))})`;
      js = `x*${ljs(a, b)}`;
      lines.push(m(`${display} = x \\times ${mono(a)} + x \\times ${nP(b)} = ${pt(expect)}`));
      mistakes = [
        [P(b, 0, a), `${m('x')} multiplie aussi ${m(String(b))} : ${m(`x \\times ${nP(b)} = ${mono(b)}`)}.`],
        [P(0, b + a), `${m('x \\times x = x^2')}, pas ${m('x')} : on ne peut pas regrouper ${m('x^2')} et ${m('x')}.`],
        [P(0, b, 2 * a), `${m('x \\times x = x^2')}, pas ${m('2x')}.`],
      ];
    } else if (kind === 'c+k' || kind === 'c-k') {
      // 7 − 3(2x − 1) ; 5 + 2(x − 4)
      const c = rng.int(2, 12), k = rng.int(2, 6), a = rng.int(1, 4), b = nz(rng, 1, 9);
      const s = kind === 'c+k' ? 1 : -1;
      expect = pAdd(P(c), P(s * k * b, s * k * a));
      display = `${c} ${s > 0 ? '+' : '-'} ${k}(${pt(P(b, a))})`;
      js = `${c} ${s > 0 ? '+' : '-'} ${k}*${ljs(a, b)}`;
      lines.push(m(`${display} = ${c} ${s > 0 ? '+' : '-'} ${s > 0 ? `${k} \\times ${mono(a)} + ${k} \\times ${nP(b)}` : `(${k} \\times ${mono(a)} + ${k} \\times ${nP(b)})`}`));
      lines.push(m(`= ${c} ${s > 0 ? '+' : '-'} ${s > 0 ? pt(P(k * b, k * a)) : `(${pt(P(k * b, k * a))})`}${s < 0 ? ` = ${c} ${pt(P(-k * b, -k * a)).replace(/^(?!-)/, '+ ').replace(/^-/, '- ')}` : ''}`));
      lines.push(`On réduit : ${m(pt(expect))}.`);
      mistakes = [
        [pMul(P(c + s * k), P(b, a)), `Les priorités ! ${m(`${c} ${s > 0 ? '+' : '-'} ${k}`)} ne se calcule pas d’abord : la multiplication ${m(`${k}(\\ldots)`)} passe avant.`],
        ...(s < 0 ? ([[pAdd(P(c), P(k * b, -k * a)), `Le signe ${m('-')} devant ${m(String(k))} s’applique aux **deux** produits : ${m(`-${k} \\times ${nP(b)} = ${-k * b}`)}.`]] as [Poly, Rich][]) : []),
        [pAdd(P(c), P(s * b, s * k * a)), `${DEV_HINT}`],
      ];
    } else if (kind === 'ax+k') {
      // 2(x + 3) + 5x
      const k = nz(rng, 2, 6), a = rng.int(1, 3), b = nz(rng, 1, 9), e = nz(rng, 1, 7);
      expect = pAdd(P(k * b, k * a), P(0, e));
      if (k * a + e === 0) return developper.generate(rng, level);
      display = `${kpar(k, P(b, a))} ${e < 0 ? '-' : '+'} ${mono(Math.abs(e))}`;
      js = `${k}*${ljs(a, b)} + (${e})*x`;
      lines.push(`On développe ${m(kpar(k, P(b, a)))} : ${m(String(k))} multiplie chaque terme de la parenthèse.`);
      lines.push(m(`${display} = ${cx(k)} \\times ${mono(a)} + ${cx(k)} \\times ${nP(b)} ${e < 0 ? '-' : '+'} ${mono(Math.abs(e))}`));
      lines.push(m(`= ${pt(P(k * b, k * a))} ${e < 0 ? '-' : '+'} ${mono(Math.abs(e))}`));
      lines.push(`On réduit (les ${m('x')} ensemble) : ${m(pt(expect))}.`);
      mistakes = [
        [pAdd(P(b, k * a), P(0, e)), `${DEV_HINT} ${m(String(k))} multiplie aussi ${m(String(b))}.`],
        [P(k * b + e, k * a), `On ne regroupe pas des ${m('x')} avec des nombres : ${m(mono(e))} se regroupe avec ${m(mono(k * a))}.`],
      ];
    } else if (kind === 'moins') {
      // −(5 − 4x) : écrit avec le nombre en tête
      const a = nz(rng, 1, 9), b = nz(rng, 1, 12);
      const inner = `${b} ${a < 0 ? '-' : '+'} ${mono(Math.abs(a))}`;
      expect = P(-b, -a);
      const e = rng.int(1, 9) * (rng.chance(0.5) ? 1 : -1);
      display = `${e} - (${inner})`;
      js = `${e} - (${b} + (${a})*x)`;
      expect = pAdd(P(e), P(-b, -a));
      lines.push(`Un signe ${m('-')} devant une parenthèse, c’est ${m('-1 \\times')} : on change **tous** les signes de la parenthèse.`);
      lines.push(m(`${display} = ${e} ${-b < 0 ? '-' : '+'} ${Math.abs(b)} ${-a < 0 ? '-' : '+'} ${mono(Math.abs(a))}`));
      lines.push(`On réduit : ${m(pt(expect))}.`);
      mistakes = [
        [pAdd(P(e), P(-b, a)), `Le signe ${m('-')} change **tous** les signes de la parenthèse, y compris celui de ${m(mono(a))}.`],
        [pAdd(P(e), P(b, a)), `Un signe ${m('-')} devant une parenthèse change tous les signes : on ne peut pas simplement enlever les parenthèses.`],
      ];
    } else if (kind === 'kx') {
      // 2x(3x − 5) ; −x(…)
      const k = rng.pick([1, -1, 2, -2, 3, -3, 4, 5]), a = rng.int(1, 5), b = nz(rng, 1, 9);
      expect = P(0, k * b, k * a);
      display = `${mono(k)}(${pt(P(b, a))})`;
      js = `${k}*x*${ljs(a, b)}`;
      lines.push(m(`${display} = ${monoP(k)} \\times ${mono(a)} + ${monoP(k)} \\times ${nP(b)} = ${pt(expect)}`));
      mistakes = [
        [P(0, k * b + k * a), `${m(`${mono(k)} \\times ${mono(a)}`)} donne des ${m('x^2')} : ${m('x \\times x = x^2')}.`],
        [P(k * b, 0, k * a), `${m(mono(k))} multiplie ${m(String(b))} : le résultat contient ${m('x')}.`],
        [P(0, -k * b, k * a), `Attention au signe : ${m(`${monoP(k)} \\times ${nP(b)} = ${mono(k * b)}`)}.`],
      ];
    } else {
      // 3(x + 2) − 2(x − 4)
      const k1 = rng.int(2, 7), a1 = rng.int(1, 4), b1 = nz(rng, 1, 9), k2 = rng.int(2, 7), a2 = rng.int(1, 4), b2 = nz(rng, 1, 9);
      const s = rng.chance(0.7) ? -1 : 1;
      expect = pAdd(P(k1 * b1, k1 * a1), P(s * k2 * b2, s * k2 * a2));
      if (k1 * a1 + s * k2 * a2 === 0 || k1 * b1 + s * k2 * b2 === 0) return developper.generate(rng, level);
      display = `${kpar(k1, P(b1, a1))} ${s < 0 ? '-' : '+'} ${kpar(k2, P(b2, a2))}`;
      js = `${k1}*${ljs(a1, b1)} ${s < 0 ? '-' : '+'} ${k2}*${ljs(a2, b2)}`;
      const second = P(s * k2 * b2, s * k2 * a2);
      lines.push(`Chaque facteur multiplie chaque terme de sa parenthèse${s < 0 ? ` ; le signe ${m('-')} devant ${m(String(k2))} s’applique aux deux produits` : ''}.`);
      lines.push(m(`${display} = ${k1} \\times ${mono(a1)} + ${k1} \\times ${nP(b1)} ${s < 0 ? '-' : '+'} (${k2} \\times ${mono(a2)} + ${k2} \\times ${nP(b2)})`));
      lines.push(m(`= ${pt(P(k1 * b1, k1 * a1))} ${s < 0 ? `- (${pt(P(k2 * b2, k2 * a2))})` : `+ ${pt(P(k2 * b2, k2 * a2))}`}`));
      if (s < 0) lines.push(m(`= ${pt(P(k1 * b1, k1 * a1))} ${pt(second).replace(/^(?!-)/, '+ ').replace(/^-/, '- ')}`));
      lines.push(`On réduit : ${m(pt(expect))}.`);
      mistakes = s < 0 ? [[pAdd(P(k1 * b1, k1 * a1), P(k2 * b2, -k2 * a2)), `Le signe ${m('-')} devant ${m(String(k2))} s’applique aux **deux** produits de la seconde parenthèse.`]] : [];
      mistakes.push([pAdd(P(b1, k1 * a1), P(s * b2, s * k2 * a2)), DEV_HINT]);
    }
    return {
      title: level === 1 ? 'Développe.' : 'Développe et réduis.',
      display: `A = ${display}`,
      steps: [exprStep({ label: m('A ='), expect, form: 'dev', tex: pt(expect), hint: level === 1 ? DEV_HINT : `${DEV_HINT} Puis regroupe les termes semblables.`, mistakes })],
      solution: lines,
      answer: m(`A = ${pt(expect)}`),
      key: display,
      data: { kind: 'poly', js, expect },
    };
  },
};

// ===================================================================== double distributivité
export const double: Generator = {
  id: 'double',
  title: 'Développer : (a + b)(c + d)',
  desc: 'Double distributivité : quatre produits, puis réduire.',
  stars: 2,
  levels: [2, 3],
  example: '(2x - 1)(x + 3)',
  course: LINKS.s52,
  generate(rng: Rng, level: Level) {
    const a = rng.weighted([[1, 3], [2, 1.5], [3, 1]] as const), c = rng.weighted([[1, 3], [2, 1.5], [3, 1], [5, 0.4]] as const);
    const b = nz(rng, 1, 9), d = nz(rng, 1, 9);
    if (a * d + b * c === 0 || (a === c && b === d)) return double.generate(rng, level);
    const A = P(b, a), C = P(d, c);
    const expect = pMul(A, C);
    const four = `${mono(a)} \\times ${mono(c)} + ${mono(a)} \\times ${nP(d)} + ${nP(b)} \\times ${mono(c)} + ${nP(b)} \\times ${nP(d)}`;
    const raw = [mono(a * c, 2), mono(a * d), mono(b * c), String(b * d)].map((t, i) => (i === 0 ? t : t.startsWith('-') ? `- ${t.slice(1)}` : `+ ${t}`)).join(' ');
    const lines: Rich[] = [m(`${par(A)}${par(C)} = ${four}`), m(`= ${raw}`), m(`= ${pt(expect)}`)];
    const mistakes: [Poly, Rich][] = [
      [P(b * d, 0, a * c), 'Il y a **quatre** produits : chaque terme de la première parenthèse multiplie chaque terme de la seconde.'],
      [P(-b * d, a * d + b * c, a * c), `Attention au signe du dernier produit : ${m(`${nP(b)} \\times ${nP(d)} = ${b * d}`)}.`],
      [P(b * d, a * d, a * c), `Il manque un produit : ${m(`${nP(b)} \\times ${mono(c)}`)}.`],
      [P(b * d, b * c, a * c), `Il manque un produit : ${m(`${mono(a)} \\times ${nP(d)}`)}.`],
      [P(b * d, a * d - b * c, a * c), 'Vérifie le signe de chacun des quatre produits.'],
    ];
    const steps = [exprStep({ label: m('A ='), expect, form: 'dev', tex: pt(expect), hint: 'Chaque terme de la première parenthèse multiplie chaque terme de la seconde : quatre produits, avec leurs signes. Puis réduis.', mistakes })];
    let title: Rich = 'Développe et réduis.';
    let display = `A = ${par(A)}${par(C)}`;
    let js = `${ljs(a, b)}*${ljs(c, d)}`;
    const items: { what: string; js: string; expect: number }[] = [];
    if (level === 3) {
      // aire d'un rectangle : côtés ax + b et cx + d (positifs pour x = v)
      if (b < 0 && d < 0) return double.generate(rng, level);
      const v = rng.int(2, 9);
      const L1 = a * v + b, L2 = c * v + d;
      if (L1 <= 0 || L2 <= 0) return double.generate(rng, level);
      title = `Un rectangle a pour côtés ${m(pt(A))} et ${m(pt(C))} (en cm, avec ${m('x')} assez grand pour que ces longueurs soient positives).`;
      display = `\\mathcal{A} = ${par(A)}${par(C)}`;
      steps[0] = exprStep({ prompt: 'a) Exprime son aire sous forme développée et réduite.', label: m('\\mathcal{A} ='), expect, form: 'dev', tex: pt(expect), hint: steps[0].hint, mistakes });
      const val = L1 * L2;
      steps.push({
        prompt: `b) Calcule cette aire pour ${m(`x = ${v}`)}.`,
        answer: { kind: 'num', fields: [{ label: m('\\mathcal{A} ='), unit: 'cm²', expect: q(val), form: 'any' }] },
        hint: `Remplace ${m('x')} par ${m(String(v))} dans les côtés : ${m(`${L1} \\times ${L2}`)}.`,
        mistakes: [{ on: 'num', value: q(a * c * v + (a * d + b * c) * v + b * d), msg: `${m(`${mono(a * c, 2)}`)} pour ${m(`x = ${v}`)} : c’est ${m(`${a * c === 1 ? '' : `${a * c} \\times `}${v}^2`)}, pas ${m(`${a * c === 1 ? '' : `${a * c} \\times `}${v}`)}.` }].filter((x) => toNum(x.value) !== val) as { on: 'num'; value: ReturnType<typeof q>; msg: Rich }[],
      });
      lines.push(`b) Pour ${m(`x = ${v}`)} : côtés ${m(String(L1))} et ${m(String(L2))}, aire ${m(`${L1} \\times ${L2} = ${val}`)} cm².`);
      items.push({ what: 'aire', js: `(${a}*${v} + (${b}))*(${c}*${v} + (${d}))`, expect: val });
      js = `${ljs(a, b)}*${ljs(c, d)}`;
    }
    return {
      title,
      display,
      steps,
      solution: lines,
      answer: m(`${level === 3 ? '\\mathcal{A}' : 'A'} = ${pt(expect)}`) + (level === 3 ? ` ; ${m(String(items[0].expect))} cm²` : ''),
      key: `${display}|${title}`,
      data: { kind: 'poly', js, expect, ...(items.length ? { also: items } : {}) },
    };
  },
};

// ===================================================================== factoriser (facteur commun)
export const factoriser: Generator = {
  id: 'factoriser',
  title: 'Factoriser : facteur commun',
  desc: 'Nombre, $x$ ou parenthèse en facteur ; redévelopper pour contrôler.',
  stars: 1,
  levels: [1, 2, 3],
  example: '6x + 9',
  course: LINKS.s6,
  generate(rng: Rng, level: Level) {
    let expect: Poly, display: string, tex: string, js: string;
    const lines: Rich[] = [];
    let mistakes: [Poly | null, Rich][] = [];
    if (level === 1 && rng.chance(0.75)) {
      // k(ax + b), facteurs finis : pgcd(a, b) = 1
      let a: number, b: number;
      do {
        a = rng.int(1, 6);
        b = nz(rng, 1, 9);
      } while (gcd(a, b) !== 1);
      const k = rng.int(2, 9);
      expect = P(k * b, k * a);
      display = pt(expect);
      tex = `${k}(${pt(P(b, a))})`;
      js = pjs(expect);
      lines.push(m(`${display} = ${k} \\times ${mono(a)} ${b < 0 ? '-' : '+'} ${k} \\times ${Math.abs(b)} = ${tex}`));
      mistakes = [
        [P(k * k * b, k * a), `Factoriser « à moitié » : ${m(`${k}(${pt(P(k * b, a))})`)} redonne ${m(pt(P(k * k * b, k * a)))}. Il faut aussi diviser ${m(String(k * b))} par ${m(String(k))}.`],
        [P(b, k * a), `Le facteur ${m(String(k))} doit être sorti de **chaque** terme : ${m(`${k * b} = ${k} \\times ${nP(b)}`)}, donc dans la parenthèse il reste ${m(String(b))}.`],
      ];
    } else if (level === 1) {
      // x² + ax → x(x + a)
      const a = nz(rng, 1, 9);
      expect = P(0, a, 1);
      display = pt(expect);
      tex = `x(${pt(P(a, 1))})`;
      js = pjs(expect);
      lines.push(m(`${display} = x \\times x ${a < 0 ? '-' : '+'} x \\times ${Math.abs(a)} = ${tex}`));
      mistakes = [[P(0, 0, 1 + a), 'On ne peut pas regrouper des $x^2$ et des $x$.']];
    } else if (level === 2) {
      // kx^e(ax + b)
      let a: number, b: number;
      do {
        a = rng.int(1, 4);
        b = nz(rng, 1, 9);
      } while (gcd(a, b) !== 1);
      const k = rng.int(2, 7), e = rng.chance(0.3) ? 2 : 1;
      const coefs = Array(e + 2).fill(0);
      coefs[e] = k * b;
      coefs[e + 1] = k * a;
      expect = P(...coefs);
      display = pt(expect);
      const f = `${k}x${e > 1 ? '^2' : ''}`;
      tex = `${f}(${pt(P(b, a))})`;
      js = pjs(expect);
      const t1 = mono(k * a, e + 1), t2 = mono(Math.abs(k * b), e);
      lines.push(`Le facteur commun est ${m(f)} : ${m(`${t1} = ${f} \\times ${mono(a)}`)} et ${m(`${t2} = ${f} \\times ${Math.abs(b)}`)}.`);
      lines.push(m(`${display} = ${f} \\times ${mono(a)} ${b < 0 ? '-' : '+'} ${f} \\times ${Math.abs(b)} = ${tex}`));
      mistakes = [
        [P(...coefs.map((c, i) => (i === e ? c * k : c))), `Factoriser « à moitié » : redéveloppe ta réponse, tu ne retrouves pas ${m(display)}.`],
      ];
    } else {
      // facteur commun entre parenthèses
      const sq = rng.chance(0.35);
      let p: number, a1: number, b1: number, a2: number, b2: number, s: number;
      do {
        p = nz(rng, 1, 9);
        a1 = sq ? 1 : rng.int(1, 4);
        b1 = sq ? p : nz(rng, 1, 9);
        a2 = rng.int(1, 4);
        b2 = nz(rng, 1, 9);
        s = sq ? -1 : rng.chance(0.55) ? -1 : 1;
      } while ((sq ? a1 + s * a2 >= 0 || b1 + s * b2 <= 0 : a1 + s * a2 <= 0) || gcd(a1 + s * a2, b1 + s * b2) !== 1 || (a1 === a2 && b1 === b2) || b1 + s * b2 === 0 || (a1 + s * a2 === 1 && b1 + s * b2 === p));
      const F = P(p, 1);
      const G1 = P(b1, a1), G2 = P(b2, a2);
      const inner = P(b1 + s * b2, a1 + s * a2);
      expect = pMul(F, inner);
      display = sq ? `${par(F)}^2 - ${par(F)}${par(G2)}` : `${par(F)}${par(G1)} ${s < 0 ? '-' : '+'} ${par(F)}${par(G2)}`;
      js = sq ? `${ljs(1, p)}**2 - ${ljs(1, p)}*${ljs(a2, b2)}` : `${ljs(1, p)}*${ljs(a1, b1)} ${s < 0 ? '-' : '+'} ${ljs(1, p)}*${ljs(a2, b2)}`;
      // réponse affichée : facteur « (x + p) » d'abord, sauf si l'autre est plus simple à lire
      // x-coefficient négatif (cas du carré) : on écrit la parenthèse « nombre d'abord », (4 - x), plus lisible que (-x + 4)
      const ia = a1 + s * a2, ib = b1 + s * b2;
      const innerTex = ia < 0 ? `(${ib} - ${ia === -1 ? '' : -ia}x)` : par(inner);
      tex = `${par(F)}${innerTex}`;
      if (sq) lines.push(`${m(`${par(F)}^2 = ${par(F)}${par(F)}`)} : le facteur commun est ${m(par(F))}.`);
      else lines.push(`Le facteur commun est ${m(par(F))}.`);
      lines.push(m(`A = ${par(F)}\\big[${par(G1)} ${s < 0 ? '-' : '+'} ${par(G2)}\\big]`));
      lines.push(m(`A = ${par(F)}(${pt(G1)} ${s < 0 ? pt(pNeg(G2)).replace(/^(?!-)/, '+ ').replace(/^-/, '- ') : `+ ${pt(G2)}`})`));
      lines.push(m(`A = ${tex}`));
      mistakes = [
        ...(s < 0 ? ([[pMul(F, P(b1 + b2, a1 - a2)), `Le signe ${m('-')} devant la seconde parenthèse change **tous** ses signes : ${m(`-${par(G2)} = ${pt(pNeg(G2))}`)}.`]] as [Poly, Rich][]) : []),
        [pMul(F, pAdd(G1, G2)), 'Garde le signe entre les deux produits.'],
      ];
      return {
        title: 'Factorise (facteur commun entre parenthèses).',
        display: `A = ${display}`,
        steps: [exprStep({ label: m('A ='), expect, form: 'fact', tex, hint: `Le facteur commun est la parenthèse ${m(par(F))} : mets-la en tête, puis écris entre crochets ce qui reste de chaque terme.`, mistakes })],
        solution: [...lines, `Contrôle : on redéveloppe ${m(tex)} et on retrouve ${m(pt(expect))}, comme en développant ${m('A')}.`],
        answer: m(`A = ${tex}`),
        key: display,
        data: { kind: 'poly', js, expect },
      };
    }
    return {
      title: 'Factorise.',
      display: `A = ${display}`,
      steps: [exprStep({ label: m('A ='), expect, form: 'fact', tex, hint: 'Écris chaque terme comme un produit qui fait apparaître le **plus grand** facteur commun (nombre et/ou x), puis mets-le en tête.', mistakes })],
      solution: [...lines, `Contrôle : on redéveloppe, ${m(`${tex} = ${display}`)} ✓.`],
      answer: m(`A = ${tex}`),
      key: display,
      data: { kind: 'poly', js, expect },
    };
  },
};

// ===================================================================== identités : développer
type Case = { display: string; expect: Poly; tex: string; lines: Rich[]; mistakes: [Poly, Rich][]; js: string; hint: Rich };
function devCase(rng: Rng, level: Level, kind: 'plus' | 'moins' | 'diff', name: string): Case {
  const a = level === 2 ? 1 : rng.int(2, 5);
  let b = rng.int(1, level === 2 ? 12 : 9);
  if (level === 3) while (gcd(a, b) !== 1) b = rng.int(1, 9);
  const A = mono(a), Ap = a === 1 ? 'x' : `${a}x`, Asq = a === 1 ? 'x^2' : `(${a}x)^2`;
  let expect: Poly, display: string, lines: Rich[], mistakes: [Poly, Rich][], js: string, idt: string;
  if (kind === 'diff') {
    expect = P(-b * b, 0, a * a);
    const sw = rng.chance(0.5);
    display = sw ? `(${A} - ${b})(${A} + ${b})` : `(${A} + ${b})(${A} - ${b})`;
    js = `(${a}*x + ${b})*(${a}*x - ${b})`;
    idt = '(a + b)(a - b) = a^2 - b^2';
    lines = [`${m(name)} : c’est ${m(idt)} avec ${m(`a = ${Ap}`)} et ${m(`b = ${b}`)}.`, m(`${name} = ${display} = ${Asq} - ${b}^2 = ${pt(expect)}`)];
    mistakes = [
      [P(b * b, 0, a * a), `${m('(a + b)(a - b) = a^2 - b^2')} : c’est une **différence** de carrés.`],
      [P(-b * b, 0, a), `${m(a > 1 ? `${Asq} = ${a * a}x^2` : Asq)} : le coefficient aussi est élevé au carré.`],
      [P(-b, 0, a * a), `${m(`${b}^2 = ${b * b}`)} : n’oublie pas d’élever ${m(String(b))} au carré.`],
    ];
  } else {
    const s = kind === 'plus' ? 1 : -1;
    expect = P(b * b, 2 * s * a * b, a * a);
    display = `(${A} ${s > 0 ? '+' : '-'} ${b})^2`;
    js = `(${a}*x ${s > 0 ? '+' : '-'} ${b})**2`;
    idt = s > 0 ? '(a + b)^2 = a^2 + 2ab + b^2' : '(a - b)^2 = a^2 - 2ab + b^2';
    lines = [`${m(name)} : c’est ${m(idt)} avec ${m(`a = ${Ap}`)} et ${m(`b = ${b}`)}.`, m(`${name} = ${display} = ${Asq} ${s > 0 ? '+' : '-'} 2 \\times ${Ap} \\times ${b} + ${b}^2 = ${pt(expect)}`)];
    mistakes = [
      [P(b * b, 0, a * a), `${m('(a ' + (s > 0 ? '+' : '-') + ' b)^2 \\neq a^2 ' + (s > 0 ? '+' : '-') + ' b^2')} : il manque le double produit ${m(`2 \\times ${Ap} \\times ${b} = ${2 * a * b}x`)}.`],
      ...(s < 0 ? ([[P(-b * b, 0, a * a), `${m('(a - b)^2 \\neq a^2 - b^2')} : ${m('(a - b)^2 = a^2 - 2ab + b^2')}.`]] as [Poly, Rich][]) : []),
      [P(b * b, s * a * b, a * a), `Le terme du milieu est le **double** produit : ${m(`2 \\times ${Ap} \\times ${b} = ${2 * a * b}x`)}.`],
      [P(b * b, 2 * s * a * b, a), `${m(a > 1 ? `${Asq} = ${a * a}x^2` : Asq)} : le coefficient aussi est élevé au carré.`],
      [P(b * b, -2 * s * a * b, a * a), `Signe du double produit : ${m(idt)}.`],
    ];
  }
  return { display, expect, tex: pt(expect), lines, mistakes, js, hint: `Reconnais ${m('(a + b)^2')}, ${m('(a - b)^2')} ou ${m('(a + b)(a - b)')}, et repère ${m('a')} et ${m('b')}.` };
}
export const identites: Generator = {
  id: 'identites',
  title: 'Identités remarquables : développer',
  desc: '(a + b)², (a − b)², (a + b)(a − b).',
  stars: 2,
  levels: [2, 3],
  example: '(2x - 3)^2',
  course: LINKS.s7,
  generate(rng: Rng, level: Level) {
    const kinds = rng.shuffle(['plus', 'moins', 'diff'] as const).slice(0, 2);
    const cs = kinds.map((k, i) => devCase(rng, level, k, 'AB'[i]));
    return {
      title: 'Développe avec une identité remarquable.',
      display: cs.map((c, i) => `${'AB'[i]} = ${c.display}`).join(' \\qquad '),
      steps: cs.map((c, i) => exprStep({ label: m(`${'AB'[i]} =`), expect: c.expect, form: 'dev', tex: c.tex, hint: c.hint, mistakes: c.mistakes })),
      solution: cs.flatMap((c) => c.lines),
      answer: cs.map((c, i) => m(`${'AB'[i]} = ${c.tex}`)).join(' ; '),
      key: cs.map((c) => c.display).join('|'),
      data: { kind: 'polys', list: cs.map((c) => ({ js: c.js, expect: c.expect })) },
    };
  },
};

// ===================================================================== identités : factoriser
function factCase(rng: Rng, level: Level, kind: 'plus' | 'moins' | 'diff', name: string): Case {
  const a = level === 2 ? 1 : rng.int(2, 5);
  let b = rng.int(1, level === 2 ? 12 : 9);
  if (level === 3) while (gcd(a, b) !== 1) b = rng.int(1, 9);
  const A = mono(a), Ap = a === 1 ? 'x' : `${a}x`, Asq = a === 1 ? 'x^2' : `(${a}x)^2`;
  let expect: Poly, tex: string, lines: Rich[], mistakes: [Poly, Rich][], js: string;
  if (kind === 'diff') {
    expect = P(-b * b, 0, a * a);
    tex = `(${A} - ${b})(${A} + ${b})`;
    js = `(${a}*x - ${b})*(${a}*x + ${b})`;
    lines = [`${m(name)} : ${m(`${pt(expect)} = ${Asq} - ${b}^2`)}, une différence de deux carrés : ${m('a^2 - b^2 = (a - b)(a + b)')}.`, m(`${name} = ${tex}`)];
    mistakes = [
      [P(b * b, -2 * a * b, a * a), `${m(`(${A} - ${b})^2`)} redonne ${m(pt(P(b * b, -2 * a * b, a * a)))}, pas ${m(pt(expect))}. Une différence de carrés se factorise en ${m('(a - b)(a + b)')}.`],
      [P(b * b, 2 * a * b, a * a), `Redéveloppe : ${m(`(${A} + ${b})^2`)} donne un double produit. Une différence de carrés se factorise en ${m('(a - b)(a + b)')}.`],
    ];
  } else {
    const s = kind === 'plus' ? 1 : -1;
    expect = P(b * b, 2 * s * a * b, a * a);
    tex = `(${A} ${s > 0 ? '+' : '-'} ${b})^2`;
    js = `(${a}*x ${s > 0 ? '+' : '-'} ${b})**2`;
    lines = [`${m(name)} : ${m(`${pt(expect)} = ${Asq} ${s > 0 ? '+' : '-'} 2 \\times ${Ap} \\times ${b} + ${b}^2`)}, c’est ${m(s > 0 ? 'a^2 + 2ab + b^2 = (a + b)^2' : 'a^2 - 2ab + b^2 = (a - b)^2')} avec ${m(`a = ${Ap}`)} et ${m(`b = ${b}`)}.`, m(`${name} = ${tex}`)];
    mistakes = [
      [P(-b * b, 0, a * a), `${m(`(${A} + ${b})(${A} - ${b})`)} redonne ${m(pt(P(-b * b, 0, a * a)))} : il n’y a pas de terme en ${m('x')}. Ici, le terme du milieu montre que c’est un carré.`],
      [P(b * b, -2 * s * a * b, a * a), `Le signe du double produit indique ${s > 0 ? m('(a + b)^2') : m('(a - b)^2')}.`],
    ];
  }
  return { display: pt(expect), expect, tex, lines, mistakes, js, hint: `Cherche des carrés : ${m(`${a * a === 1 ? '' : a * a}x^2 = ${Asq}`)} et ${m(`${b * b} = ${b}^2`)}. Y a-t-il un terme en ${m('x')} (double produit) ?` };
}
export const factId: Generator = {
  id: 'factoriser-id',
  title: 'Identités remarquables : factoriser',
  desc: 'a² − b², a² + 2ab + b², a² − 2ab + b².',
  stars: 2,
  levels: [2, 3],
  example: 'x^2 - 25',
  course: LINKS.s7,
  generate(rng: Rng, level: Level) {
    const kinds = rng.shuffle(['diff', rng.pick(['plus', 'moins'] as const)] as const);
    const cs = kinds.map((k, i) => factCase(rng, level, k, 'AB'[i]));
    return {
      title: 'Factorise avec une identité remarquable.',
      display: cs.map((c, i) => `${'AB'[i]} = ${c.display}`).join(' \\qquad '),
      steps: cs.map((c, i) => exprStep({ label: m(`${'AB'[i]} =`), expect: c.expect, form: 'fact', tex: c.tex, hint: c.hint, mistakes: c.mistakes })),
      solution: [...cs.flatMap((c) => c.lines), 'Contrôle : on redéveloppe chaque produit et on retrouve l’expression de départ.'],
      answer: cs.map((c, i) => m(`${'AB'[i]} = ${c.tex}`)).join(' ; '),
      key: cs.map((c) => c.display).join('|'),
      data: { kind: 'polys', list: cs.map((c) => ({ js: c.js, expect: c.expect })) },
    };
  },
};
export { pSub, pjs };
