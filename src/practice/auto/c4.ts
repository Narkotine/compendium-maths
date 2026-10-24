/** Automatismes de 4e (programme 2026) : relatifs, fractions, carrés et puissances, calcul littéral, équations, grandeurs, statistiques, pourcentages. */
import type { Generator } from '../engine/types';
import { q, mul, div, toNum, type Q } from '../engine/q';
import { shuffledChoice } from '../engine/build';
import { m, dq, nb, numQ, choiceQ, yesNo } from './kit';
import { L } from './links';

const base = { stars: 1 as const, levels: [1 as const] };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (a: number, b: number) => `\\dfrac{${a}}{${b}}`;
const fq = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n < 0 ? '-' : ''}${fr(Math.abs(v.n), v.d)}`);
const p = (x: number) => (x < 0 ? `(${x})` : String(x));
const nz = (lo: number, hi: number, r: () => number) => { let x: number; do x = r(); while (x === 0 || x < lo || x > hi); return x; };

// ------------------------------------------------------------------ relatifs : somme, différence
export const a4relatifs: Generator = {
  ...base, id: 'a4-relatifs', title: 'Additionner, soustraire des relatifs', desc: 'Calcul mental avec des relatifs.', example: '-7 + 12 = 5', course: L.rel,
  generate(rng) {
    const a = nz(-30, 30, () => rng.int(-30, 30)), b = nz(-30, 30, () => rng.int(-30, 30)), plus = rng.chance(0.5), r = plus ? a + b : a - b;
    if (a > 0 && b > 0 && (plus || a > b)) return a4relatifs.generate(rng, 1);
    const disp = `${a} ${plus ? '+' : '-'} ${p(b)}`;
    const sol = plus ? `${m(`${disp} = ${r}`)}.` : `Soustraire ${m(p(b))}, c’est ajouter son opposé : ${m(`${disp} = ${a} + ${p(-b)} = ${r}`)}.`;
    return numQ({ title: 'Calcul mental.', display: disp, fields: [{ expect: q(r) }], hint: plus ? 'Signes contraires : différence des distances à zéro, signe de la plus grande.' : 'Soustraire un nombre, c’est ajouter son opposé.', mist: [[q(-r), 'Attention au signe du résultat.'], [q(plus ? a - b : a + b), plus ? 'C’est une addition.' : 'Soustraire, c’est ajouter l’opposé.']], sol: [sol], answer: m(String(r)), key: disp, items: [{ what: 'r', js: plus ? `${a}+(${b})` : `${a}-(${b})`, expect: r }] });
  },
};

// ------------------------------------------------------------------ relatifs : produit, quotient
export const a4produit: Generator = {
  ...base, id: 'a4-produit', title: 'Multiplier, diviser des relatifs', desc: 'Règle des signes.', example: '(-4) \\times 6 = -24', course: L.rel,
  generate(rng) {
    const a = nz(-12, 12, () => rng.int(-12, 12)), b = nz(-12, 12, () => rng.int(-12, 12)), mult = rng.chance(0.55);
    if (a > 0 && b > 0 || Math.abs(a) < 2 || Math.abs(b) < 2) return a4produit.generate(rng, 1);
    const [x, y, r] = mult ? [a, b, a * b] : [a * b, b, a];
    const disp = `${p(x)} ${mult ? '\\times' : '\\div'} ${p(y)}`;
    const neg = (x < 0) !== (y < 0);
    return numQ({ title: 'Calcul mental.', display: disp, fields: [{ expect: q(r) }], hint: 'Deux nombres de même signe : résultat positif ; de signes contraires : résultat négatif.', mist: [[q(-r), 'Applique la règle des signes.']], sol: [`Signes ${neg ? 'contraires : résultat négatif' : 'identiques : résultat positif'}. ${m(`${disp} = ${r}`)}.`], answer: m(String(r)), key: disp, items: [{ what: 'r', js: mult ? `(${x})*(${y})` : `(${x})/(${y})`, expect: r }] });
  },
};

// ------------------------------------------------------------------ opposé, inverse, 5 × … = 3
export const a4inverse: Generator = {
  ...base, id: 'a4-inverse', title: 'Opposé, inverse, quotient', desc: 'Opposé ; inverse ; $5 \\times \\ldots = 3$.', example: '5 \\times \\dfrac{3}{5} = 3', course: L.fr, links: [L.rel],
  generate(rng) {
    const kind = rng.int(0, 2);
    if (kind === 0) {
      const v = q(nz(-999, 999, () => rng.int(-999, 999)), rng.pick([1, 10, 100]));
      const o = q(-v.n, v.d);
      return numQ({ title: 'Opposé.', prompt: `Opposé de ${m(dq(v))} ?`, fields: [{ expect: o }], hint: 'Deux nombres opposés ont une somme nulle.', mist: [[v.n !== 0 ? div(q(1), v) : null, 'Ça, c’est l’inverse (produit égal à 1).']], sol: [`${m(`${dq(v)} + ${o.n < 0 ? `(${dq(o)})` : dq(o)} = 0`)} : l’opposé est ${m(dq(o))}.`], answer: m(dq(o)), key: `o${dq(v)}`, items: [{ what: 'o', js: `-(${toNum(v)})`, expect: toNum(o), tol: 1e-9 }] });
    }
    let a: number, b: number;
    do { a = rng.int(1, 12); b = rng.int(2, 12); } while (gcd(a, b) !== 1);
    if (kind === 1) {
      const v = q(a, b), inv = q(b, a);
      return numQ({ title: 'Inverse.', prompt: `Inverse de ${m(fq(v))} ?`, fields: [{ expect: inv }], hint: 'Deux nombres inverses ont un produit égal à 1.', mist: [[q(-a, b), 'Ça, c’est l’opposé (somme nulle).']], sol: [`${m(`${fq(v)} \\times ${fq(inv)} = 1`)} : l’inverse est ${m(fq(inv))}.`], answer: m(fq(inv)), key: `i${a}/${b}`, items: [{ what: 'i', js: `1/(${a}/${b})`, expect: b / a, tol: 1e-12 }] });
    }
    let A: number, c: number;
    do { A = nz(-9, 9, () => rng.int(-9, 9)); c = nz(-20, 20, () => rng.int(-20, 20)); } while (Math.abs(A) < 2 || gcd(Math.abs(c), Math.abs(A)) !== 1);
    const x = q(c, A);
    return numQ({ title: 'Compléter.', display: `${p(A)} \\times \\ldots = ${c}`, fields: [{ expect: x }], hint: `Le nombre cherché est le quotient ${m(`${c} \\div ${p(A)}`)}.`, mist: [[q(A, c), 'Attention à l’ordre : le résultat divisé par le facteur connu.'], [q(c - A), 'C’est une multiplication, pas une addition.']], sol: [`${m(`${p(A)} \\times ${x.n < 0 ? `\\left(${fq(x)}\\right)` : fq(x)} = ${c}`)}.`], answer: m(fq(x)), key: `q${A}|${c}`, items: [{ what: 'x', js: `${c}/(${A})`, expect: c / A, tol: 1e-12 }] });
  },
};

// ------------------------------------------------------------------ fractions
export const a4fractions: Generator = {
  ...base, id: 'a4-fractions', title: 'Calculer avec des fractions', desc: 'Somme (dénominateurs multiples), produit, fraction d’un entier.', example: '\\dfrac{1}{3} + \\dfrac{1}{6} = \\dfrac{1}{2}', course: L.fr,
  generate(rng) {
    const kind = rng.int(0, 2);
    let disp: string, r: Q, js: string, sol: string, hint: string, mk: [Q, string][] = [];
    if (kind === 0) {
      const b = rng.int(2, 6), k = rng.int(2, 4), d = b * k, a = rng.int(1, b - 1), c = rng.int(1, d - 1), minus = rng.chance(0.3) && a * k > c;
      r = minus ? q(a * k - c, d) : q(a * k + c, d);
      disp = `${fr(a, b)} ${minus ? '-' : '+'} ${fr(c, d)}`; js = `${a}/${b}${minus ? '-' : '+'}${c}/${d}`;
      hint = `Écris ${m(fr(a, b))} avec le dénominateur ${d}.`;
      sol = `${m(`${disp} = ${fr(a * k, d)} ${minus ? '-' : '+'} ${fr(c, d)} = ${fr(minus ? a * k - c : a * k + c, d)}${r.d !== d ? ` = ${fq(r)}` : ''}`)}.`;
      mk = [[q(minus ? a - c : a + c, b + d), 'On n’ajoute pas les dénominateurs : mets au même dénominateur.']];
    } else if (kind === 1) {
      const a = rng.int(1, 7), b = rng.int(2, 9), c = rng.int(1, 7), d = rng.int(2, 9);
      r = q(a * c, b * d); disp = `${fr(a, b)} \\times ${fr(c, d)}`; js = `${a}/${b}*${c}/${d}`;
      hint = 'Numérateurs entre eux, dénominateurs entre eux.';
      sol = `${m(`${disp} = \\dfrac{${a} \\times ${c}}{${b} \\times ${d}} = ${fr(a * c, b * d)}${r.d !== b * d ? ` = ${fq(r)}` : ''}`)}.`;
      mk = [[q(a * d + c * b, b * d), 'C’est un produit, pas une somme.']];
    } else {
      const b = rng.int(2, 9), a = rng.int(1, b + 3), n = b * rng.int(1, 6);
      r = q(a * n, b); disp = `${fr(a, b)} \\times ${n}`; js = `${a}/${b}*${n}`;
      hint = `${n} est un multiple de ${b} : divise d’abord par ${b}.`;
      sol = `${m(`${disp} = ${a} \\times \\dfrac{${n}}{${b}} = ${a} \\times ${n / b} = ${fq(r)}`)}.`;
      mk = [[q(a * n, b * n), 'On multiplie seulement le numérateur par l’entier.']];
    }
    return numQ({ title: 'Calculer.', display: disp, prompt: 'Résultat (fraction simplifiée ou entier).', fields: [{ expect: r }], hint, mist: mk, sol: [sol], answer: m(fq(r)), key: disp, items: [{ what: 'r', js, expect: toNum(r), tol: 1e-12 }] });
  },
};

// ------------------------------------------------------------------ carrés et puissances
export const a4carres: Generator = {
  ...base, id: 'a4-carres', title: 'Carrés et puissances', desc: 'Carrés de 0 à 15, puissances simples.', example: '12^2 = 144 \\quad 2^5 = 32', course: L.pui,
  generate(rng) {
    const kind = rng.int(0, 3);
    if (kind === 0) {
      const n = rng.int(0, 15), s = rng.chance(0.3) ? -1 : 1, x = s * n;
      if (x === 0 && s < 0) return a4carres.generate(rng, 1);
      const disp = s < 0 ? `(${x})^2` : `${n}^2`;
      return numQ({ title: 'Calcul mental.', display: disp, fields: [{ expect: q(n * n) }], hint: `${m(`${disp} = ${p(x)} \\times ${p(x)}`)}.`, mist: [[q(2 * n), 'Le carré, ce n’est pas le double.'], [q(-n * n), 'Le carré d’un nombre est toujours positif.']], sol: [`${m(`${disp} = ${p(x)} \\times ${p(x)} = ${n * n}`)}.`], answer: m(String(n * n)), key: disp, items: [{ what: 'r', js: `(${x})**2`, expect: n * n }] });
    }
    if (kind === 1) {
      const n = rng.int(1, 15);
      return numQ({ title: 'Carré.', prompt: `Quel nombre positif a pour carré ${m(String(n * n))} ?`, fields: [{ expect: q(n) }], hint: 'Revois les carrés de 1 à 15.', mist: [[q(n * n, 2), 'On ne divise pas par 2 : cherche le nombre qui, multiplié par lui-même, donne ce carré.']], sol: [`${m(`${n} \\times ${n} = ${n * n}`)}, donc ${m(`\\sqrt{${n * n}} = ${n}`)}.`], answer: m(String(n)), key: `r${n}`, items: [{ what: 'r', js: `Math.sqrt(${n * n})`, expect: n }] });
    }
    if (kind === 2) {
      const [a, e] = rng.pick([[2, rng.pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10])], [3, rng.pick([0, 2, 3, 4, 5])], [5, rng.pick([0, 2, 3, 4])], [-1, rng.int(2, 15)], [-2, rng.int(2, 6)], [4, rng.pick([0, 2, 3, 4])]] as [number, number][]);
      const r = a ** e, disp = `${a < 0 ? `(${a})` : a}^{${e}}`;
      return numQ({ title: 'Puissance.', display: disp, fields: [{ expect: q(r) }], hint: e === 0 ? 'Une puissance d’exposant 0 vaut 1.' : `${e} facteurs égaux à ${a}.`, mist: [[q(a * e), 'Une puissance n’est pas un produit par l’exposant.'], [q(-r), 'Attention au signe : compte les facteurs négatifs.']], sol: [`${m(`${disp} = ${r}`)}${e > 1 ? ` (${e} facteurs égaux à ${m(p(a))})` : ''}.`], answer: m(String(r)), key: disp, items: [{ what: 'r', js: `(${a})**${e}`, expect: r }] });
    }
    const neg = rng.chance(0.5), e = rng.int(neg ? 1 : 2, 6), r = neg ? q(1, 10 ** e) : q(10 ** e);
    const disp = `10^{${neg ? -e : e}}`;
    return numQ({ title: 'Puissance de 10.', display: disp, prompt: 'Écriture décimale.', fields: [{ expect: r, form: 'decimal' }], hint: neg ? `${m(`10^{-${e}}`)} : le chiffre 1 en ${e}e position après la virgule.` : `Un 1 suivi de ${e} zéro${e > 1 ? 's' : ''}.`, mist: [[neg ? q(-(10 ** e)) : null, 'Un exposant négatif donne un nombre positif plus petit que 1.']], sol: [`${m(`${disp} = ${neg ? dq(r) : nb(10 ** e)}`)}.`], answer: m(neg ? dq(r) : nb(10 ** e)), key: disp, items: [{ what: 'r', js: `10**${neg ? -e : e}`, expect: toNum(r), tol: 1e-15 }] });
  },
};

// ------------------------------------------------------------------ équations simples
export const a4equations: Generator = {
  ...base, id: 'a4-equations', title: 'Équations simples', desc: '$x + b = c$ ; $ax = c$.', example: '4x = 28 \\iff x = 7', course: L.eq,
  generate(rng) {
    if (rng.chance(0.5)) {
      const b = nz(-20, 20, () => rng.int(-20, 20)), x = rng.int(-20, 20), c = x + b;
      const lhs = b > 0 ? `x + ${b}` : `x - ${-b}`;
      return numQ({ title: 'Résoudre.', display: `${lhs} = ${c}`, fields: [{ label: m('x ='), expect: q(x) }], hint: b > 0 ? `Soustrais ${b} aux deux membres.` : `Ajoute ${-b} aux deux membres.`, mist: [[q(c + b), b > 0 ? `Pour isoler x, on soustrait ${b}.` : `Pour isoler x, on ajoute ${-b}.`]], sol: [`${m(`x = ${c} ${b > 0 ? '-' : '+'} ${Math.abs(b)} = ${x}`)}.`], answer: m(`x = ${x}`), key: `${lhs}=${c}`, items: [{ what: 'x', js: `${c}-(${b})`, expect: x }] });
    }
    const a = nz(-9, 9, () => rng.int(-9, 9)), x = rng.chance(0.7) ? nz(-12, 12, () => rng.int(-12, 12)) : 0, c0 = a * x;
    if (Math.abs(a) === 1) return a4equations.generate(rng, 1);
    const frac = rng.chance(0.25), c = frac ? nz(-30, 30, () => rng.int(-30, 30)) : c0, sx = q(c, a);
    if (frac && sx.d === 1) return a4equations.generate(rng, 1);
    return numQ({ title: 'Résoudre.', display: `${a}x = ${c}`, fields: [{ label: m('x ='), expect: sx }], hint: `Divise les deux membres par ${m(String(a))}.`, mist: [[q(c - a), `${m(`${a}x`)} est un produit : on divise par ${a}, on ne soustrait pas.`], [q(a, c || 1), 'Attention à l’ordre de la division.'], [q(-c, a), 'Attention au signe.']], sol: [`${m(`x = \\dfrac{${c}}{${a}} = ${fq(sx)}`)}.`], answer: m(`x = ${fq(sx)}`), key: `${a}x=${c}`, items: [{ what: 'x', js: `${c}/(${a})`, expect: c / a, tol: 1e-12 }] });
  },
};

// ------------------------------------------------------------------ réduire
export const a4reduire: Generator = {
  ...base, id: 'a4-reduire', title: 'Réduire une expression', desc: '$3x + 2x$, $x \\times x$, $3x \\times 4$…', example: '3x + 2x = 5x', course: L.lit,
  generate(rng) {
    const a = rng.int(2, 9), b = rng.int(2, 9), kind = rng.int(0, 3), v = rng.pick(['x', 'a', 'y', 't']);
    const co = (k: number, t: string) => (k === 1 ? t : k === -1 ? `-${t}` : `${k}${t}`);
    let expr: string, good: string, bad: [string, string][];
    if (kind === 0) {
      expr = `${a}${v} + ${b}${v}`; good = co(a + b, v);
      bad = [[co(a + b, `${v}^2`), `${m(`${v} + ${v} = 2${v}`)} : pas de carré dans une somme.`], [co(a * b, v), 'On ajoute les coefficients, on ne les multiplie pas.'], [String(a + b), `La lettre ${m(v)} ne disparaît pas.`]];
    } else if (kind === 1) {
      expr = `${a}${v} \\times ${b}`; good = co(a * b, v);
      bad = [[co(a + b, v), 'C’est un produit : multiplie les nombres.'], [co(a * b, `${v}^2`), `Un seul facteur ${m(v)} : pas de carré.`], [String(a * b), `La lettre ${m(v)} ne disparaît pas.`]];
    } else if (kind === 2) {
      expr = `${a}${v} \\times ${b}${v}`; good = co(a * b, `${v}^2`);
      bad = [[co(a * b, v), `${m(`${v} \\times ${v} = ${v}^2`)}.`], [co(a + b, `${v}^2`), 'Multiplie les coefficients.'], [co(2 * a * b, v), `${m(`${v} \\times ${v}`)} n’est pas ${m(`2${v}`)}.`]];
    } else {
      if (a === b) return a4reduire.generate(rng, 1);
      expr = `${a}${v} - ${b}${v}`; good = co(a - b, v);
      bad = [[String(a - b), `La lettre ${m(v)} ne disparaît pas.`], [co(a + b, v), 'C’est une soustraction.'], [co(a - b, `${v}^2`), 'Pas de carré dans une somme.']];
    }
    const opts = bad.filter(([t], i) => t !== good && bad.findIndex(([u]) => u === t) === i).map(([t, w]) => [m(t), w] as [string, string]);
    return choiceQ({ title: 'Réduire.', display: expr, prompt: 'Forme réduite ?', answer: shuffledChoice(rng, m(good), opts), hint: kind === 0 || kind === 3 ? `Regroupe les termes en ${m(v)} : ${m(`(${a} ${kind === 0 ? '+' : '-'} ${b})${v}`)}.` : 'Multiplie les nombres entre eux, les lettres entre elles.', sol: [`${m(`${expr} = ${good}`)}.`], answerText: m(good), key: `${kind}|${a}|${b}|${v}` });
  },
};

// ------------------------------------------------------------------ double, triple, moitié
export const a4double: Generator = {
  ...base, id: 'a4-double', title: 'Double, triple, moitié, quart', desc: 'Calcul mental sur les décimaux.', example: '\\text{moitié de } 7{,}4 = 3{,}7', course: L.ent,
  generate(rng) {
    const [name, f] = rng.pick([['Le double', q(2)], ['Le triple', q(3)], ['La moitié', q(1, 2)], ['Le quart', q(1, 4)], ['Le tiers', q(1, 3)]] as [string, Q][]);
    const x = q(rng.int(2, 333) * (f.d === 3 ? 3 : 1), rng.pick([1, 10])), r = mul(x, f);
    return numQ({ title: 'Calcul mental.', prompt: `${name} de ${m(dq(x))} ?`, fields: [{ expect: r }], hint: f.d === 1 ? `Multiplie par ${f.n}.` : `Divise par ${f.d}.`, mist: [[f.d === 1 ? div(x, f) : mul(x, q(f.d)), f.d === 1 ? 'Il faut multiplier.' : 'Il faut diviser.']], sol: [`${m(`${dq(x)} ${f.d === 1 ? `\\times ${f.n}` : `\\div ${f.d}`} = ${dq(r)}`)}.`], answer: m(dq(r)), key: `${name}|${dq(x)}`, items: [{ what: 'r', js: `${toNum(x)}*${f.n}/${f.d}`, expect: toNum(r), tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ tester une égalité
export const a4tester: Generator = {
  ...base, id: 'a4-tester', title: 'Tester une égalité', desc: 'Remplacer la lettre par une valeur.', example: '2 \\times 3 + 1 = 7', course: L.eq, links: [L.lit],
  generate(rng) {
    const a = rng.int(2, 9), b = nz(-15, 15, () => rng.int(-15, 15)), x = rng.int(-6, 9), want = rng.chance(0.5);
    const c = want ? a * x + b : a * x + b + nz(-5, 5, () => rng.int(-5, 5));
    const L1 = `${a}x ${b > 0 ? '+' : '-'} ${Math.abs(b)}`, val = a * x + b;
    return choiceQ({ title: 'Tester.', display: `${L1} = ${c}`, prompt: `${m(`x = ${x}`)} est-il solution ?`, answer: yesNo(want, `Non : pour ${m(`x = ${x}`)}, le membre de gauche vaut ${m(String(val))}.`, `Si : pour ${m(`x = ${x}`)}, le membre de gauche vaut ${m(String(val))}.`), hint: `Remplace x par ${x} dans le membre de gauche.`, sol: [`${m(`${a} \\times ${p(x)} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${val}`)}${want ? '' : `, et ${m(`${val} \\neq ${c}`)}`}.`, `${want ? 'Oui' : 'Non'} : ${m(`x = ${x}`)} ${want ? 'est' : 'n’est pas'} solution.`], answerText: want ? 'Oui' : 'Non', key: `${L1}=${c}|${x}`, items: [{ what: 'step:0', js: `(${a}*(${x})+(${b})===${c})?0:1`, expect: want ? 0 : 1 }] });
  },
};

// ------------------------------------------------------------------ aires et volumes
export const a4aires: Generator = {
  ...base, id: 'a4-aires', title: 'Aires et volumes', desc: 'Rectangle, triangle, carré, cube, pavé.', example: '\\dfrac{6 \\times 4}{2} = 12', course: L.aire,
  generate(rng) {
    const kind = rng.int(0, 4), a = rng.int(2, 15), b = rng.int(2, 12), c = rng.int(2, 10);
    const J = [`${a}*${b}`, `${2 * a}*${b}/2`, `${a}**2`, `${b}**3`, `${a}*${b}*${c}`];
    const T: [string, number, string, string, string][] = [
      [`Aire d’un rectangle de ${a} cm sur ${b} cm ?`, a * b, 'cm²', `${a} \\times ${b} = ${a * b}`, 'Longueur × largeur.'],
      [`Aire d’un triangle de base ${2 * a} cm et de hauteur ${b} cm ?`, a * b, 'cm²', `\\dfrac{${2 * a} \\times ${b}}{2} = ${a * b}`, 'Base × hauteur ÷ 2.'],
      [`Aire d’un carré de côté ${a} cm ?`, a * a, 'cm²', `${a} \\times ${a} = ${a * a}`, 'Côté × côté.'],
      [`Volume d’un cube d’arête ${b} cm ?`, b ** 3, 'cm³', `${b} \\times ${b} \\times ${b} = ${b ** 3}`, 'Arête × arête × arête.'],
      [`Volume d’un pavé droit de ${a} cm × ${b} cm × ${c} cm ?`, a * b * c, 'cm³', `${a} \\times ${b} \\times ${c} = ${a * b * c}`, 'Longueur × largeur × hauteur.'],
    ];
    const [st, r, u, f, h] = T[kind];
    const wrong = kind === 1 ? 2 * a * b : kind === 2 ? 4 * a : kind === 3 ? 3 * b : kind === 0 ? 2 * (a + b) : a + b + c;
    return numQ({ title: kind < 3 ? 'Aire.' : 'Volume.', statement: st, fields: [{ expect: q(r), unit: u }], hint: h, mist: [[q(wrong), kind === 1 ? 'N’oublie pas de diviser par 2.' : kind === 2 || kind === 0 ? 'Ça, c’est le périmètre.' : 'Multiplie les trois dimensions.']], sol: [`${m(f)} : ${m(nb(r))} ${u}.`], answer: `${m(nb(r))} ${u}`, key: st, items: [{ what: 'r', js: J[kind], expect: r }] });
  },
};

// ------------------------------------------------------------------ statistiques
export const a4stats: Generator = {
  ...base, id: 'a4-stats', title: 'Moyenne, effectifs, fréquences', desc: 'Moyenne simple ; effectif manquant ; fréquence en %.', example: '\\dfrac{12 + 15 + 9}{3} = 12', course: L.sta,
  generate(rng) {
    const kind = rng.int(0, 2);
    if (kind === 0) {
      const n = rng.int(3, 5); let v: number[];
      do v = Array.from({ length: n }, () => rng.int(4, 20)); while (v.reduce((s, x) => s + x, 0) % n);
      const S = v.reduce((s, x) => s + x, 0), mo = S / n;
      return numQ({ title: 'Moyenne.', statement: `Notes : ${v.map((x) => m(String(x))).join(' ; ')}. Moyenne ?`, fields: [{ expect: q(mo) }], hint: 'Somme des valeurs, divisée par leur nombre.', mist: [[q(S), `Divise la somme par ${n}.`]], sol: [`${m(`\\dfrac{${v.join(' + ')}}{${n}} = \\dfrac{${S}}{${n}} = ${mo}`)}.`], answer: m(String(mo)), key: v.join(','), items: [{ what: 'm', js: `[${v}].reduce((s,x)=>s+x,0)/${n}`, expect: mo }] });
    }
    if (kind === 1) {
      const N = rng.pick([20, 24, 25, 28, 30]), e = [rng.int(2, 8), rng.int(2, 8), rng.int(2, 8)], miss = N - e[0] - e[1] - e[2];
      if (miss <= 0) return a4stats.generate(rng, 1);
      return numQ({ title: 'Effectif manquant.', statement: `Dans une classe de ${m(String(N))} élèves, ${m(String(e[0]))} viennent à pied, ${m(String(e[1]))} à vélo, ${m(String(e[2]))} en voiture, les autres en bus. Combien viennent en bus ?`, fields: [{ expect: q(miss) }], hint: `L’effectif total est ${N}.`, mist: [[q(e[0] + e[1] + e[2]), `Retire cette somme de ${N}.`]], sol: [`${m(`${N} - (${e[0]} + ${e[1]} + ${e[2]}) = ${N} - ${e[0] + e[1] + e[2]} = ${miss}`)}.`], answer: m(String(miss)), key: `${N}|${e}`, items: [{ what: 'e', js: `${N}-${e[0]}-${e[1]}-${e[2]}`, expect: miss }] });
    }
    const N = rng.pick([10, 20, 25, 50]), k = rng.int(1, N - 1), f = q(100 * k, N);
    if (f.d !== 1) return a4stats.generate(rng, 1);
    return numQ({ title: 'Fréquence.', statement: `Sur ${m(String(N))} élèves, ${m(String(k))} ont un animal. Fréquence en pourcentage ?`, fields: [{ expect: f, unit: '%' }], hint: `Fréquence : ${m(`\\dfrac{${k}}{${N}}`)}, puis en centièmes.`, mist: [[q(k), 'C’est l’effectif, pas la fréquence.'], [q(k, N), 'Exprime le résultat en pourcentage (× 100).']], sol: [`${m(`\\dfrac{${k}}{${N}} = \\dfrac{${f.n}}{100}`)}, soit ${m(`${f.n}\\,\\%`)}.`], answer: m(`${f.n}\\,\\%`), key: `f${N}|${k}`, items: [{ what: 'f', js: `${k}/${N}*100`, expect: f.n, tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ a % de c
export const a4pourcent: Generator = {
  ...base, id: 'a4-pourcent', title: 'Appliquer un pourcentage', desc: '$a\\,\\%$ de $c$.', example: '15\\,\\% \\text{ de } 60 = 9', course: L.pro,
  generate(rng) {
    const t = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 150]);
    let c: number; do c = rng.int(2, 60) * 10; while ((t * c) % 100);
    const r = q(t * c, 100);
    return numQ({ title: 'Calcul mental.', display: `${t}\\,\\% \\text{ de } ${nb(c)}`, fields: [{ expect: r }], hint: `${t} % de ${c} : ${m(`\\dfrac{${t}}{100} \\times ${nb(c)}`)} (pense à 10 %, puis ajuste).`, mist: [[q(c - t), 'Prendre un pourcentage, ce n’est pas soustraire.'], [q(t * c, 10), 'Divise par 100, pas par 10.']], sol: [`10 % de ${m(nb(c))} : ${m(dq(q(c, 10)))}. ${m(`\\dfrac{${t}}{100} \\times ${nb(c)} = ${dq(r)}`)}.`], answer: m(dq(r)), key: `${t}|${c}`, items: [{ what: 'r', js: `${t}*${c}/100`, expect: toNum(r), tol: 1e-9 }] });
  },
};

export const SET4: Generator[] = [a4relatifs, a4produit, a4inverse, a4fractions, a4carres, a4equations, a4reduire, a4double, a4tester, a4aires, a4stats, a4pourcent];
