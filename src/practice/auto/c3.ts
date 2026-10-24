/** Automatismes de 3e (programme 2026) : fractions, puissances, nombres premiers, équations, calcul littéral, Pythagore, droite des milieux, statistiques, ratio, échelle, évolutions. */
import type { Generator } from '../engine/types';
import { q, add, sub, mul, div, toNum, type Q } from '../engine/q';
import { shuffledChoice } from '../engine/build';
import { m, dq, nb, numQ, choiceQ } from './kit';
import { divisQ } from './c5';
import { L } from './links';

const base = { stars: 1 as const, levels: [1 as const] };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (a: number, b: number) => `\\dfrac{${a}}{${b}}`;
const fq = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n < 0 ? '-' : ''}${fr(Math.abs(v.n), v.d)}`);
const nz = (lo: number, hi: number, r: () => number) => { let x: number; do x = r(); while (x === 0 || x < lo || x > hi); return x; };
const LET = ['A', 'B', 'C', 'D', 'E', 'F', 'K', 'L', 'M', 'R', 'S', 'T'];

// ------------------------------------------------------------------ fractions : les 4 opérations
export const a3fractions: Generator = {
  ...base, id: 'a3-fractions', title: 'Fractions : les quatre opérations', desc: 'Somme, différence, produit, quotient.', example: '\\dfrac{2}{3} \\div \\dfrac{4}{5} = \\dfrac{5}{6}', course: L.fr,
  generate(rng) {
    const a = rng.int(1, 9), b = rng.int(2, 9), c = rng.int(1, 9), d = rng.int(2, 9), op = rng.int(0, 3);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || b === d && op < 2) return a3fractions.generate(rng, 1);
    const A = q(a, b), C = q(c, d), sym = ['+', '-', '\\times', '\\div'][op], r = [add, sub, mul, div][op](A, C);
    const disp = `${fr(a, b)} ${sym} ${fr(c, d)}`;
    const D = b * d / gcd(b, d);
    const how = op === 0 || op === 1 ? `${m(`${disp} = ${fr(a * D / b, D)} ${sym} ${fr(c * D / d, D)} = ${fq(r)}`)}` : op === 2 ? `${m(`${disp} = \\dfrac{${a} \\times ${c}}{${b} \\times ${d}} = ${fq(r)}`)}` : `${m(`${disp} = ${fr(a, b)} \\times ${fr(d, c)} = ${fq(r)}`)}`;
    const wrong: [Q | null, string][] = op === 0 ? [[q(a + c, b + d), 'On n’ajoute pas les dénominateurs.']] : op === 1 ? [[b !== d && a !== c ? q(a - c, b - d || 1) : null, 'On ne soustrait pas les dénominateurs.']] : op === 3 ? [[q(a * c, b * d), 'Diviser, c’est multiplier par l’inverse.'], [q(b * c, a * d), 'On multiplie par l’inverse de la deuxième fraction.']] : [[q(a * d + b * c, b * d), 'C’est un produit.']];
    return numQ({ title: 'Calculer.', display: disp, prompt: 'Résultat simplifié.', fields: [{ expect: r }], hint: op < 2 ? 'Même dénominateur d’abord.' : op === 2 ? 'Numérateurs entre eux, dénominateurs entre eux.' : 'Diviser par une fraction, c’est multiplier par son inverse.', mist: wrong, sol: [how + '.'], answer: m(fq(r)), key: disp, items: [{ what: 'r', js: `${a}/${b}${['+', '-', '*', '/'][op]}(${c}/${d})`, expect: toNum(r), tol: 1e-12 }] });
  },
};

// ------------------------------------------------------------------ puissances
export const a3puissances: Generator = {
  ...base, id: 'a3-puissances', title: 'Puissances', desc: 'Produit, quotient, puissance de puissance (même base).', example: '2^3 \\times 2^4 = 2^7', course: L.pui,
  generate(rng) {
    const a = rng.pick([2, 3, 5, 7, 10]), m1 = rng.int(2, 9), n1 = rng.int(2, 6), kind = rng.int(0, 2);
    const disp = kind === 0 ? `${a}^{${m1}} \\times ${a}^{${n1}}` : kind === 1 ? `\\dfrac{${a}^{${m1 + n1}}}{${a}^{${n1}}}` : `\\left(${a}^{${m1}}\\right)^{${n1}}`;
    const e = kind === 0 ? m1 + n1 : kind === 1 ? m1 : m1 * n1;
    const bad = kind === 0 ? m1 * n1 : kind === 1 ? (m1 + n1) / n1 : m1 + n1;
    return numQ({ title: 'Écrire sous la forme d’une puissance.', display: `${disp} = ${a}^{\\ldots}`, prompt: 'Exposant ?', fields: [{ label: 'Exposant :', expect: q(e) }], hint: kind === 0 ? 'Produit : on ajoute les exposants.' : kind === 1 ? 'Quotient : on soustrait les exposants.' : 'Puissance de puissance : on multiplie les exposants.', mist: [[Number.isInteger(bad) ? q(bad) : null, kind === 0 ? 'Pour un produit, on ajoute les exposants.' : kind === 1 ? 'Pour un quotient, on soustrait les exposants.' : 'Puissance de puissance : on multiplie les exposants.']], sol: [`${m(`${disp} = ${a}^{${e}}`)}.`], answer: m(`${a}^{${e}}`), key: disp, items: [{ what: 'e', js: kind === 0 ? `${m1}+${n1}` : kind === 1 ? `${m1 + n1}-${n1}` : `${m1}*${n1}`, expect: e }] });
  },
};

// ------------------------------------------------------------------ décomposition en facteurs premiers
const PR = [2, 3, 5, 7, 11];
const dec = (n: number) => { const f: [number, number][] = []; let x = n; for (const p of PR) { let k = 0; while (x % p === 0) { x /= p; k++; } if (k) f.push([p, k]); } return x === 1 ? f : null; };
const tf = (f: [number, number][]) => f.map(([p, k]) => (k === 1 ? String(p) : `${p}^{${k}}`)).join(' \\times ');
export const a3decomp: Generator = {
  ...base, id: 'a3-decomp', title: 'Décomposer en facteurs premiers', desc: 'Reconnaître la décomposition.', example: '60 = 2^2 \\times 3 \\times 5', course: L.ent,
  generate(rng) {
    let n: number, f: [number, number][] | null;
    do { n = rng.int(12, 400); f = dec(n); } while (!f || f.length < 2 || f.reduce((s, [, k]) => s + k, 0) < 3);
    const good = tf(f);
    // distracteurs : facteur non premier ; exposant faux ; oubli d'un facteur
    const [p0] = f[0];
    const [p1] = f[1];
    const g = f.map(([p, k], i) => [p, i < 2 ? k - 1 : k] as [number, number]).filter(([, k]) => k > 0);
    const nonPrime = [String(p0 * p1), ...(g.length ? [tf(g)] : [])].join(' \\times ');
    const wrongExp = tf(f.map(([p, k], i) => [p, i === f!.length - 1 ? k + 1 : k] as [number, number]));
    const missing = tf(f.slice(0, -1).concat(f[f.length - 1][1] > 1 ? [[f[f.length - 1][0], f[f.length - 1][1] - 1]] : []));
    const bad: [string, string][] = [[m(nonPrime), `${m(String(p0 * p1))} n’est pas premier.`], [m(wrongExp), 'Le produit ne vaut pas ' + m(String(n)) + '.'], [m(missing), 'Le produit ne vaut pas ' + m(String(n)) + '.']];
    const uniq = bad.filter(([t], i) => t !== m(good) && t !== '$$' && bad.findIndex(([u]) => u === t) === i);
    return choiceQ({ title: 'Décomposition.', prompt: `Décomposition de ${m(String(n))} en produit de facteurs premiers ?`, answer: shuffledChoice(rng, m(good), uniq), hint: 'Divise par 2 tant que possible, puis par 3, 5, 7…', sol: [`${m(`${n} = ${good}`)} : tous les facteurs sont premiers.`], answerText: m(`${n} = ${good}`), key: String(n), items: [] });
  },
};

// ------------------------------------------------------------------ simplifier une fraction
export const a3simplifier: Generator = {
  ...base, id: 'a3-simplifier', title: 'Simplifier une fraction', desc: 'Fraction irréductible.', example: '\\dfrac{42}{56} = \\dfrac{3}{4}', course: L.fr,
  generate(rng) {
    let a: number, b: number;
    do { a = rng.int(1, 12); b = rng.int(2, 13); } while (gcd(a, b) !== 1 || a === b);
    const k = rng.int(2, 12), A = a * k, B = b * k, r = q(a, b);
    return numQ({ title: 'Simplifier.', display: fr(A, B), prompt: 'Fraction irréductible.', fields: [r.d === 1 ? { expect: r } : { expect: r, form: 'irreducible' }], hint: `Cherche un diviseur commun à ${A} et ${B}.`, sol: [`${m(`${fr(A, B)} = \\dfrac{${a} \\times ${k}}{${b} \\times ${k}} = ${fq(r)}`)}.`], answer: m(fq(r)), key: `${A}/${B}`, items: [{ what: 'r', js: `${A}/${B}`, expect: a / b, tol: 1e-12 }] });
  },
};

// ------------------------------------------------------------------ divisibilité (grands nombres)
export const a3divis: Generator = { ...base, id: 'a3-divis', title: 'Critères de divisibilité', desc: 'Par 2, 3, 5, 9, 10.', example: '4\\,731 : 4 + 7 + 3 + 1 = 15', course: L.ent, generate: (rng) => divisQ(rng, 1000, 99999, [2, 3, 5, 9, 10]) };

// ------------------------------------------------------------------ équations ax + b = c
export const a3equations: Generator = {
  ...base, id: 'a3-equations', title: 'Équations $ax + b = c$', desc: 'Deux étapes, solution entière.', example: '3x + 5 = 17 \\iff x = 4', course: L.eq,
  generate(rng) {
    const a = nz(-9, 9, () => rng.int(-9, 9)), b = nz(-20, 20, () => rng.int(-20, 20)), x = rng.int(-10, 10);
    if (Math.abs(a) < 2) return a3equations.generate(rng, 1);
    const c = a * x + b, lhs = `${a}x ${b > 0 ? '+' : '-'} ${Math.abs(b)}`;
    return numQ({ title: 'Résoudre.', display: `${lhs} = ${c}`, fields: [{ label: m('x ='), expect: q(x) }], hint: `${b > 0 ? 'Soustrais' : 'Ajoute'} ${Math.abs(b)}, puis divise par ${a}.`, mist: [[q(c + b, a), `Pour enlever ${b > 0 ? `+ ${b}` : `- ${-b}`}, on fait l’opération contraire.`], [q(c - b - a), `${m(`${a}x`)} est un produit : divise par ${a}.`]], sol: [`${m(`${a}x = ${c} ${b > 0 ? '-' : '+'} ${Math.abs(b)} = ${c - b}`)}, puis ${m(`x = \\dfrac{${c - b}}{${a}} = ${x}`)}.`], answer: m(`x = ${x}`), key: `${lhs}=${c}`, items: [{ what: 'x', js: `(${c}-(${b}))/(${a})`, expect: x }] });
  },
};

// ------------------------------------------------------------------ développer, factoriser, opposé d'une parenthèse
export const a3developper: Generator = {
  ...base, id: 'a3-developper', title: 'Développer, factoriser', desc: '$k(x + a)$, $kx + ka$, $-(5 - 4x)$.', example: '-(5 - 4x) = -5 + 4x', course: L.lit,
  generate(rng) {
    const k = rng.int(2, 9), a = rng.int(1, 9), s = rng.chance(0.5) ? 1 : -1, kind = rng.int(0, 2);
    const sg = (n: number) => (n < 0 ? `- ${-n}` : `+ ${n}`);
    let expr: string, good: string, bad: [string, string][], hint: string;
    if (kind === 0) {
      expr = `${k}(x ${sg(s * a)})`; good = `${k}x ${sg(s * k * a)}`; hint = 'Distribue : multiplie chaque terme de la parenthèse.';
      bad = [[`${k}x ${sg(s * a)}`, 'Multiplie aussi le deuxième terme.'], [`${k + 0}x ${sg(s * (k + a))}`, 'C’est une multiplication, pas une addition.'], [`${k * a}x`, 'On ne peut pas réduire une somme de termes de natures différentes.']];
    } else if (kind === 1) {
      expr = `${k}x ${sg(s * k * a)}`; good = `${k}(x ${sg(s * a)})`; hint = `Facteur commun : ${k}.`;
      bad = [[`${k}(x ${sg(s * k * a)})`, 'Divise aussi le deuxième terme par le facteur commun.'], [`x(${k} ${sg(s * k * a)})`, 'Le facteur commun est le nombre ' + m(String(k)) + '.'], [`${k}(x ${sg(-s * a)})`, 'Attention au signe.']];
    } else {
      const b = rng.int(2, 9);
      expr = `-(${a} ${s > 0 ? '-' : '+'} ${b}x)`; good = `-${a} ${s > 0 ? '+' : '-'} ${b}x`; hint = 'Supprimer un signe « − » devant une parenthèse : on change le signe de chaque terme.';
      bad = [[`-${a} ${s > 0 ? '-' : '+'} ${b}x`, 'Change le signe de **chaque** terme.'], [`${a} ${s > 0 ? '-' : '+'} ${b}x`, 'Change le signe de chaque terme.'], [`${a} ${s > 0 ? '+' : '-'} ${b}x`, 'Le premier terme change de signe aussi.']];
    }
    const opts = bad.filter(([t], i) => t !== good && bad.findIndex(([u]) => u === t) === i).map(([t, w]) => [m(t), w] as [string, string]);
    return choiceQ({ title: kind === 1 ? 'Factoriser.' : 'Développer.', display: expr, prompt: kind === 1 ? 'Forme factorisée ?' : 'Forme développée ?', answer: shuffledChoice(rng, m(good), opts), hint, sol: [`${m(`${expr} = ${good}`)}.`], answerText: m(good), key: `${kind}|${expr}` });
  },
};

// ------------------------------------------------------------------ Pythagore
export const a3pythagore: Generator = {
  ...base, id: 'a3-pythagore', title: 'Égalité de Pythagore', desc: 'Écrire l’égalité ; hypoténuse d’un triangle rectangle « entier ».', example: 'BC^2 = AB^2 + AC^2', course: L.pyt,
  generate(rng) {
    const [A, B, C] = rng.shuffle(LET).slice(0, 3);
    if (rng.chance(0.5)) {
      const good = `${B}${C}^2 = ${A}${B}^2 + ${A}${C}^2`;
      return choiceQ({ title: 'Pythagore.', statement: `Le triangle ${m(`${A}${B}${C}`)} est rectangle en ${m(A)}.`, prompt: 'Quelle égalité est vraie ?', answer: shuffledChoice(rng, m(good), [[m(`${A}${B}^2 = ${A}${C}^2 + ${B}${C}^2`), `L’hypoténuse est le côté opposé à l’angle droit en ${A} : c’est ${m(`[${B}${C}]`)}.`], [m(`${A}${C}^2 = ${A}${B}^2 + ${B}${C}^2`), `L’hypoténuse est ${m(`[${B}${C}]`)}, opposé à l’angle droit.`], [m(`${B}${C} = ${A}${B} + ${A}${C}`), 'Ce sont les carrés des longueurs.']]), hint: `L’hypoténuse est le côté opposé à l’angle droit (en ${A}).`, sol: [`Rectangle en ${m(A)} : l’hypoténuse est ${m(`[${B}${C}]`)}, donc ${m(good)}.`], answerText: m(good), key: `e${A}${B}${C}` });
    }
    const [a0, b0, c] = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [20, 21, 29], [15, 20, 25], [10, 24, 26], [12, 35, 37], [9, 40, 41], [30, 40, 50], [18, 24, 30]]), [a, b] = rng.chance(0.5) ? [a0, b0] : [b0, a0];
    return numQ({ title: 'Pythagore.', statement: `${m(`${A}${B}${C}`)} est rectangle en ${m(A)}, ${m(`${A}${B} = ${a}`)} cm et ${m(`${A}${C} = ${b}`)} cm. Longueur ${m(`${B}${C}`)} ?`, fields: [{ expect: q(c), unit: 'cm' }], hint: `${m(`${B}${C}^2 = ${a}^2 + ${b}^2`)}.`, mist: [[q(a + b), 'Ce sont les carrés qui s’ajoutent.'], [q(a * a + b * b), `Ça, c’est ${m(`${B}${C}^2`)} : prends la racine carrée.`]], sol: [`${m(`${B}${C}^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}`)}, donc ${m(`${B}${C} = \\sqrt{${c * c}} = ${c}`)} cm.`], answer: `${m(String(c))} cm`, key: `l${A}${B}${C}|${a}|${b}`, items: [{ what: 'c', js: `Math.sqrt(${a}**2+${b}**2)`, expect: c }] });
  },
};

// ------------------------------------------------------------------ droite des milieux
export const a3milieux: Generator = {
  ...base, id: 'a3-milieux', title: 'Droite des milieux', desc: 'Le segment des milieux mesure la moitié du troisième côté.', example: 'MN = \\dfrac{BC}{2}', course: L.geo,
  generate(rng) {
    const [A, B, C, M, N] = rng.shuffle(LET).slice(0, 5), half = q(rng.int(11, 99), 10), full = mul(half, q(2)), dir = rng.chance(0.5);
    const st = `Dans le triangle ${m(`${A}${B}${C}`)}, ${m(M)} est le milieu de ${m(`[${A}${B}]`)} et ${m(N)} le milieu de ${m(`[${A}${C}]`)}. ${dir ? `${m(`${B}${C} = ${dq(full)}`)} cm. Longueur ${m(`${M}${N}`)} ?` : `${m(`${M}${N} = ${dq(half)}`)} cm. Longueur ${m(`${B}${C}`)} ?`}`;
    const r = dir ? half : full, wrong = dir ? full : half;
    return numQ({ title: 'Droite des milieux.', statement: st, fields: [{ expect: r, unit: 'cm' }], hint: `Le segment qui joint les milieux de deux côtés mesure la moitié du troisième côté.`, mist: [[wrong, dir ? 'C’est la moitié de BC.' : 'BC est le double de MN.']], sol: [`Théorème de la droite des milieux : ${m(`${M}${N} = \\dfrac{${B}${C}}{2}`)}, donc ${dir ? m(`${M}${N} = ${dq(full)} \\div 2 = ${dq(half)}`) : m(`${B}${C} = 2 \\times ${dq(half)} = ${dq(full)}`)} cm.`], answer: `${m(dq(r))} cm`, key: `${dir}|${dq(half)}`, items: [{ what: 'r', js: dir ? `${toNum(full)}/2` : `2*${toNum(half)}`, expect: toNum(r), tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ moyenne, médiane, étendue
export const a3stats: Generator = {
  ...base, id: 'a3-stats', title: 'Moyenne, médiane, étendue', desc: 'Petite série de valeurs.', example: '\\text{médiane de } 3 ; 5 ; 8 ; 9 ; 12 = 8', course: L.sta,
  generate(rng) {
    const n = rng.pick([5, 7]), kind = rng.int(0, 2);
    let v: number[];
    do v = Array.from({ length: n }, () => rng.int(2, 30)); while (kind === 0 && v.reduce((s, x) => s + x, 0) % n);
    const s = [...v].sort((x, y) => x - y), S = v.reduce((t, x) => t + x, 0);
    const name = ['moyenne', 'médiane', 'étendue'][kind], r = kind === 0 ? S / n : kind === 1 ? s[(n - 1) / 2] : s[n - 1] - s[0];
    const sol = kind === 0 ? `${m(`\\dfrac{${S}}{${n}} = ${r}`)}.` : kind === 1 ? `Série rangée : ${m(s.join(' ; '))}. La valeur du milieu (${(n + 1) / 2}e) est ${m(String(r))}.` : `${m(`${s[n - 1]} - ${s[0]} = ${r}`)}.`;
    const wrong = kind === 1 ? v[(n - 1) / 2] : kind === 0 ? S : s[n - 1];
    return numQ({ title: 'Statistiques.', statement: `Série : ${v.map((x) => m(String(x))).join(' ; ')}. Quelle est la ${name} ?`, fields: [{ expect: q(r) }], hint: kind === 0 ? `Somme des valeurs divisée par ${n}.` : kind === 1 ? 'Range d’abord les valeurs.' : 'Plus grande valeur moins plus petite valeur.', mist: [[q(wrong), kind === 1 ? 'Range d’abord la série.' : kind === 0 ? `Divise la somme par ${n}.` : 'Soustrais la plus petite valeur.']], sol: [sol], answer: m(String(r)), key: `${kind}|${v}`, items: [{ what: 'r', js: kind === 0 ? `[${v}].reduce((a,b)=>a+b,0)/${n}` : kind === 1 ? `[${v}].sort((a,b)=>a-b)[${(n - 1) / 2}]` : `Math.max(${v})-Math.min(${v})`, expect: r }] });
  },
};

// ------------------------------------------------------------------ ratio, échelle
export const a3ratio: Generator = {
  ...base, id: 'a3-ratio', title: 'Ratio, échelle', desc: 'Partager selon un ratio ; distance réelle sur une carte.', example: '60 \\text{ selon } 2:3 \\to 24 \\text{ et } 36', course: L.pro,
  generate(rng) {
    if (rng.chance(0.5)) {
      let a: number, b: number; do { a = rng.int(1, 7); b = rng.int(1, 7); } while (a === b || gcd(a, b) !== 1);
      const part = rng.int(2, 20), T = (a + b) * part, x = a * part;
      return numQ({ title: 'Ratio.', statement: `On partage ${m(String(T))} € entre Léa et Tom selon le ratio ${m(`${a} : ${b}`)}. Part de Léa ?`, fields: [{ expect: q(x), unit: '€' }], hint: `${a + b} parts égales en tout.`, mist: [[q(T, 2), 'Le partage n’est pas équitable : le ratio compte.'], [q(T * a, b), `Le total correspond à ${a} + ${b} parts.`]], sol: [`${m(`${a} + ${b} = ${a + b}`)} parts ; une part : ${m(`${T} \\div ${a + b} = ${part}`)} ; Léa : ${m(`${a} \\times ${part} = ${x}`)} €.`], answer: `${m(String(x))} €`, key: `r${a}|${b}|${T}`, items: [{ what: 'x', js: `${T}*${a}/(${a}+${b})`, expect: x, tol: 1e-9 }] });
    }
    const E = rng.pick([10000, 20000, 25000, 50000, 100000, 200000]), d = q(rng.int(2, 30), rng.pick([1, 2])), km = mul(d, q(E, 100000));
    return numQ({ title: 'Échelle.', statement: `Sur une carte à l’échelle ${m(`\\dfrac{1}{${nb(E)}}`)}, deux villages sont à ${m(dq(d))} cm. Distance réelle en km ?`, fields: [{ expect: km, unit: 'km' }], hint: `1 cm sur la carte représente ${nb(E).replace(/\\,/g, ' ')} cm en réalité, soit ${dq(q(E, 100000)).replace('{,}', ',')} km.`, mist: [[mul(d, q(E, 100)), 'Convertis en km : 1 km = 100 000 cm.'], [mul(d, q(E)), 'Convertis en km : 1 km = 100 000 cm.']], sol: [`${m(`${dq(d)} \\times ${nb(E)} = ${big(mul(d, q(E)))}`)} cm, soit ${m(dq(km))} km.`], answer: `${m(dq(km))} km`, key: `e${E}|${dq(d)}`, items: [{ what: 'km', js: `${toNum(d)}*${E}/100000`, expect: toNum(km), tol: 1e-9 }] });
  },
};
const big = (v: Q) => dq(v).replace(/^(\d+)/, (t) => nb(Number(t)));

// ------------------------------------------------------------------ évolutions en pourcentage
export const a3evolution: Generator = {
  ...base, id: 'a3-evolution', title: 'Évolutions en pourcentage', desc: 'Hausse, baisse, coefficient multiplicateur.', example: '80 \\times 1{,}25 = 100', course: L.pro,
  generate(rng) {
    const t = rng.pick([5, 10, 20, 25, 30, 40, 50]), up = rng.chance(0.5), kind = rng.int(0, 1);
    const k = q(100 + (up ? t : -t), 100);
    if (kind === 0) return numQ({ title: 'Coefficient multiplicateur.', prompt: `${up ? 'Augmenter' : 'Diminuer'} de ${m(`${t}\\,\\%`)} revient à multiplier par… ?`, fields: [{ expect: k, form: 'decimal' }], hint: up ? `${m(`100\\,\\% + ${t}\\,\\% = ${100 + t}\\,\\%`)}.` : `${m(`100\\,\\% - ${t}\\,\\% = ${100 - t}\\,\\%`)}.`, mist: [[q(t, 100), `Ça, c’est ${t} % seulement : on garde aussi les 100 % de départ.`], [q(100 + (up ? -t : t), 100), up ? 'Une hausse donne un coefficient supérieur à 1.' : 'Une baisse donne un coefficient inférieur à 1.']], sol: [`${m(`1 ${up ? '+' : '-'} \\dfrac{${t}}{100} = ${dq(k)}`)}.`], answer: m(dq(k)), key: `k${t}|${up}`, items: [{ what: 'k', js: `1${up ? '+' : '-'}${t}/100`, expect: toNum(k), tol: 1e-12 }] });
    let P: number; do P = rng.int(2, 60) * 10; while ((P * t) % 100);
    const r = mul(q(P), k);
    return numQ({ title: 'Évolution.', statement: `Un article coûte ${m(String(P))} €. Son prix ${up ? 'augmente' : 'baisse'} de ${m(`${t}\\,\\%`)}. Nouveau prix ?`, fields: [{ expect: r, unit: '€' }], hint: `${t} % de ${P} €, puis ${up ? 'ajoute' : 'retire'}.`, mist: [[q(P * t, 100), 'Ça, c’est le montant de la variation.'], [q(P + (up ? -1 : 1) * P * t / 100), up ? 'C’est une hausse : ajoute.' : 'C’est une baisse : retire.']], sol: [`${t} % de ${P} € : ${m(dq(q(P * t, 100)))} €. ${m(`${P} ${up ? '+' : '-'} ${dq(q(P * t, 100))} = ${dq(r)}`)} €.`], answer: `${m(dq(r))} €`, key: `p${P}|${t}|${up}`, items: [{ what: 'r', js: `${P}*(1${up ? '+' : '-'}${t}/100)`, expect: toNum(r), tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ probabilités (contraire, dé, urne)
export const a3proba: Generator = {
  ...base, id: 'a3-proba', title: 'Probabilités', desc: 'Événement contraire ; issues équiprobables.', example: 'P(\\overline{A}) = 1 - 0{,}35 = 0{,}65', course: L.pba,
  generate(rng) {
    if (rng.chance(0.5)) {
      const pa = q(rng.int(1, 99), 100), r = sub(q(1), pa);
      return numQ({ title: 'Événement contraire.', prompt: `${m(`P(A) = ${dq(pa)}`)}. Calcule ${m('P(\\overline{A})')}.`, fields: [{ expect: r }], hint: `${m('P(\\overline{A}) = 1 - P(A)')}.`, mist: [[pa, 'C’est P(A).']], sol: [`${m(`P(\\overline{A}) = 1 - ${dq(pa)} = ${dq(r)}`)}.`], answer: m(dq(r)), key: `c${dq(pa)}`, items: [{ what: 'r', js: `1-${toNum(pa)}`, expect: toNum(r), tol: 1e-12 }] });
    }
    const N = rng.pick([10, 12, 15, 20, 25, 30]), k = rng.int(1, N - 1), v = q(k, N);
    return numQ({ title: 'Probabilité.', statement: `Un sac contient ${m(String(N))} jetons numérotés de 1 à ${m(String(N))}, dont ${m(String(k))} sont gagnants. On tire un jeton au hasard. Probabilité de gagner ?`, fields: [{ expect: v }], hint: 'Issues favorables sur issues possibles.', mist: [[q(N - k, N), 'Ça, c’est la probabilité de perdre.']], sol: [`${m(`P = ${fr(k, N)}${v.d !== N ? ` = ${fq(v)}` : ''}`)}.`], answer: m(fq(v)), key: `j${N}|${k}`, items: [{ what: 'p', js: `${k}/${N}`, expect: k / N, tol: 1e-12 }] });
  },
};

export const SET3: Generator[] = [a3fractions, a3puissances, a3decomp, a3simplifier, a3divis, a3equations, a3developper, a3pythagore, a3milieux, a3stats, a3ratio, a3evolution, a3proba];
