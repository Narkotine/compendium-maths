/** Automatismes de 5e (programme 2026) : nombres, fractions, pourcentages, angles, probabilités, proportionnalité. */
import type { Generator } from '../engine/types';
import type { Rng } from '../engine/rng';
import { q, mul, toNum } from '../engine/q';
import { m, dq, nb, numQ, choiceQ, yesNo, cmpChoice } from './kit';
import { L } from './links';

const base = { stars: 1 as const, levels: [1 as const] };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (a: number, b: number) => `\\dfrac{${a}}{${b}}`;

// ------------------------------------------------------------------ divisibilité
const CRIT: Record<number, string> = {
  2: 'son chiffre des unités est pair (0, 2, 4, 6 ou 8)',
  3: 'la somme de ses chiffres est divisible par 3',
  5: 'son chiffre des unités est 0 ou 5',
  9: 'la somme de ses chiffres est divisible par 9',
  10: 'son chiffre des unités est 0',
};
export function divisQ(rng: Rng, lo: number, hi: number, ds: number[]) {
  const d = rng.pick(ds), want = rng.chance(0.5);
  let n: number;
  do n = rng.int(lo, hi); while ((n % d === 0) !== want);
  const digits = String(n).split('').map(Number), s = digits.reduce((a, b) => a + b, 0);
  const why = d === 3 || d === 9 ? `${m(digits.join(' + ') + ` = ${s}`)}, ${s % d === 0 ? 'divisible' : 'pas divisible'} par ${d}` : `chiffre des unités : ${digits[digits.length - 1]}`;
  return choiceQ({
    title: 'Divisibilité.', prompt: `${m(nb(n))} est-il divisible par ${m(String(d))} ?`,
    answer: yesNo(want, `Non : ${why}.`, `Si : ${why}.`), hint: `Un nombre est divisible par ${d} si ${CRIT[d]}.`,
    sol: [`Un nombre est divisible par ${d} si ${CRIT[d]}.`, `Ici, ${why} : ${m(nb(n))} ${want ? 'est' : 'n’est pas'} divisible par ${m(String(d))}.`],
    answerText: want ? 'Oui' : 'Non', key: `${n}|${d}`, items: [{ what: 'step:0', js: `(${n}%${d}===0)?0:1`, expect: want ? 0 : 1 }],
  });
}
export const a5divis: Generator = { ...base, id: 'a5-divis', title: 'Divisibilité par 2, 3, 5, 9, 10', desc: 'Critères de divisibilité.', example: '471 : 4 + 7 + 1 = 12', course: L.ent, generate: (rng) => divisQ(rng, 100, 9999, [2, 3, 5, 9, 10]) };

// ------------------------------------------------------------------ division euclidienne
export const a5euclide: Generator = {
  ...base, id: 'a5-euclide', title: 'Division euclidienne', desc: 'Quotient et reste.', example: '87 = 6 \\times 14 + 3', course: L.ent,
  generate(rng) {
    const b = rng.int(3, 12), qq = rng.int(4, 15), r = rng.int(1, b - 1), a = b * qq + r;
    return numQ({
      title: 'Division euclidienne.', prompt: `Division euclidienne de ${m(String(a))} par ${m(String(b))}.`,
      fields: [{ label: 'Quotient :', expect: q(qq) }, { label: 'Reste :', expect: q(r) }],
      hint: `Cherche le plus grand multiple de ${b} inférieur ou égal à ${a}.`,
      sol: [`${m(`${b} \\times ${qq} = ${b * qq}`)} et ${m(`${b} \\times ${qq + 1} = ${b * (qq + 1)}`)} dépasse ${m(String(a))}.`, `${m(`${a} = ${b} \\times ${qq} + ${r}`)} avec ${m(`${r} < ${b}`)} : quotient ${m(String(qq))}, reste ${m(String(r))}.`],
      answer: `quotient ${m(String(qq))}, reste ${m(String(r))}`, key: `${a}|${b}`,
      items: [{ what: 'q', js: `Math.floor(${a}/${b})`, expect: qq }, { what: 'r', js: `${a}%${b}`, expect: r }],
    });
  },
};

// ------------------------------------------------------------------ tables
export const a5tables: Generator = {
  ...base, id: 'a5-tables', title: 'Tables de multiplication', desc: 'Produit ou facteur manquant.', example: '7 \\times 8 = 56', course: L.ent,
  generate(rng) {
    const a = rng.int(2, 12), b = rng.int(2, 12), trou = rng.chance(0.5);
    if (!trou) return numQ({ title: 'Calcul mental.', display: `${a} \\times ${b}`, fields: [{ expect: q(a * b) }], hint: `Table de ${Math.min(a, b)}.`, mist: [[q(a + b), 'C’est la somme, pas le produit.']], sol: [m(`${a} \\times ${b} = ${a * b}`) + '.'], answer: m(String(a * b)), key: `p${a}x${b}`, items: [{ what: 'p', js: `${a}*${b}`, expect: a * b }] });
    return numQ({ title: 'Compléter.', display: `${a} \\times \\ldots = ${a * b}`, fields: [{ expect: q(b) }], hint: `Dans la table de ${a}, quel nombre donne ${a * b} ?`, mist: [[q(a * b - a), 'C’est une soustraction : cherche par quoi multiplier.']], sol: [m(`${a} \\times ${b} = ${a * b}`) + '.'], answer: m(String(b)), key: `t${a}x${b}`, items: [{ what: 'b', js: `${a * b}/${a}`, expect: b }] });
  },
};

// ------------------------------------------------------------------ × et ÷ par 10, 100, 1 000
export const a5dix: Generator = {
  ...base, id: 'a5-dix', title: 'Multiplier, diviser par 10, 100, 1 000', desc: 'Décaler les chiffres.', example: '3{,}45 \\times 100 = 345', course: L.ent,
  generate(rng) {
    const k = rng.int(0, 2), x = q(rng.int(2, 999), 10 ** k), p = rng.pick([10, 100, 1000]), times = rng.chance(0.5);
    const r = times ? mul(x, q(p)) : mul(x, q(1, p)), wrong = times ? mul(x, q(1, p)) : mul(x, q(p));
    const op = times ? '\\times' : '\\div', P = `{${nb(p)}}`;
    return numQ({
      title: 'Calcul mental.', display: `${dq(x)} ${op} ${P}`, fields: [{ expect: r }],
      hint: `${times ? 'Multiplier' : 'Diviser'} par ${p} : chaque chiffre devient ${p} fois plus ${times ? 'grand' : 'petit'} (${String(p).length - 1} rang${p > 10 ? 's' : ''} vers la ${times ? 'gauche' : 'droite'}).`,
      mist: [[wrong, times ? 'Le résultat doit être plus grand : tu as divisé.' : 'Le résultat doit être plus petit : tu as multiplié.']],
      sol: [`${m(`${dq(x)} ${op} ${P} = ${dq(r).replace(/^(\d+)/, (d) => nb(Number(d)))}`)}.`], answer: m(dq(r)), key: `${dq(x)}${op}${p}`,
      items: [{ what: 'r', js: times ? `${toNum(x)}*${p}` : `${toNum(x)}/${p}`, expect: toNum(r), tol: 1e-9 }],
    });
  },
};

// ------------------------------------------------------------------ addition à trou
export const a5trou: Generator = {
  ...base, id: 'a5-trou', title: 'Addition à trou', desc: 'Compléments, sommes à compléter.', example: '27 + \\ldots = 63', course: L.ent,
  generate(rng) {
    let a: ReturnType<typeof q>, s: ReturnType<typeof q>;
    const kind = rng.int(0, 2);
    if (kind === 0) { const x = rng.int(12, 89); a = q(x); s = q(rng.int(x + 5, 160)); }
    else if (kind === 1) { const t = rng.pick([1, 10, 100]); s = q(t); a = t === 1 ? q(rng.int(1, 99), 100) : q(rng.int(1, t * 10 - 1), 10); }
    else { const t = rng.int(2, 20); s = q(t); a = q(rng.int(1, t * 10 - 1), 10); }
    const b = q(s.n * a.d - a.n * s.d, a.d * s.d);
    return numQ({
      title: 'Compléter.', display: `${dq(a)} + \\ldots = ${dq(s)}`, fields: [{ expect: b }], hint: `Cherche ce qu’il faut ajouter à ${dq(a).replace('{,}', ',')} pour arriver à ${dq(s).replace('{,}', ',')} (ou calcule la différence).`,
      mist: [[q(s.n * a.d + a.n * s.d, a.d * s.d), 'Tu as additionné : il faut la différence.']],
      sol: [`${m(`${dq(s)} - ${dq(a)} = ${dq(b)}`)}, donc ${m(`${dq(a)} + ${dq(b)} = ${dq(s)}`)}.`], answer: m(dq(b)), key: `${dq(a)}|${dq(s)}`,
      items: [{ what: 'b', js: `${toNum(s)}-${toNum(a)}`, expect: toNum(b), tol: 1e-9 }],
    });
  },
};

// ------------------------------------------------------------------ écritures d'un même nombre
const USU: [number, number][] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 2], [5, 2], [5, 4], [7, 4], [6, 5], [1, 100], [1, 1000], [7, 100]];
export const a5ecritures: Generator = {
  ...base, id: 'a5-ecritures', title: 'Écritures d’un même nombre', desc: 'Fraction, décimal, pourcentage.', example: '1{,}2 = \\dfrac{12}{10} = \\dfrac{6}{5} = 120\\,\\%', course: L.fr, links: [L.pro],
  generate(rng) {
    const kind = rng.int(0, 3);
    if (kind === 0) {
      const [a, b] = rng.pick(USU), v = q(a, b);
      return numQ({ title: 'Écriture décimale.', display: `${fr(a, b)} = \\ldots`, fields: [{ expect: v, form: 'decimal' }], hint: `${m(`${fr(a, b)} = ${a} \\div ${b}`)}.`, mist: [[q(a * 10 + b, 10), 'La barre de fraction n’est pas une virgule.']], sol: [`${m(`${fr(a, b)} = ${a} \\div ${b} = ${dq(v)}`)}.`], answer: m(dq(v)), key: `d${a}/${b}`, items: [{ what: 'v', js: `${a}/${b}`, expect: a / b, tol: 1e-12 }] });
    }
    if (kind === 1) {
      const n = rng.int(1, 250), v = q(n, 100);
      return numQ({ title: 'En pourcentage.', display: `${dq(v)} = \\ldots\\,\\%`, fields: [{ expect: q(n), unit: '%' }], hint: `${m(`${dq(v)} = \\dfrac{${n}}{100}`)}.`, mist: [[v, 'Un pourcentage est un nombre de centièmes : multiplie par 100.']], sol: [`${m(`${dq(v)} = \\dfrac{${n}}{100}`)}, soit ${m(`${n}\\,\\%`)}.`], answer: m(`${n}\\,\\%`), key: `p${n}`, items: [{ what: 'p', js: `${n / 100}*100`, expect: n, tol: 1e-9 }] });
    }
    if (kind === 2) {
      const n = rng.int(1, 300), v = q(n, 100);
      return numQ({ title: 'En écriture décimale.', display: `${n}\\,\\% = \\ldots`, fields: [{ expect: v, form: 'decimal' }], hint: `${m(`${n}\\,\\% = \\dfrac{${n}}{100}`)}.`, mist: [[q(n, 10), `${n} % = ${n} centièmes, pas ${n} dixièmes.`]], sol: [`${m(`${n}\\,\\% = \\dfrac{${n}}{100} = ${dq(v)}`)}.`], answer: m(dq(v)), key: `e${n}`, items: [{ what: 'v', js: `${n}/100`, expect: n / 100, tol: 1e-12 }] });
    }
    const den = rng.pick([10, 100]), n = rng.int(11, den === 10 ? 99 : 999), v = q(n, den);
    if (v.d === 1) return a5ecritures.generate(rng, 1);
    return numQ({ title: 'Compléter.', display: `${dq(v)} = \\dfrac{\\ldots}{${den}}`, fields: [{ expect: q(n) }], hint: `${den === 10 ? 'Dixièmes' : 'Centièmes'} : combien y en a-t-il dans ${dq(v).replace('{,}', ',')} ?`, mist: [[q(Math.floor(n / den)), 'Ce n’est que la partie entière.']], sol: [`${m(`${dq(v)} = \\dfrac{${n}}{${den}}`)}.`], answer: m(String(n)), key: `f${n}/${den}`, items: [{ what: 'n', js: `${toNum(v)}*${den}`, expect: n, tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ quotient : 3 × … = 7 ; 17/5 = 3 + 2/5
export const a5quotient: Generator = {
  ...base, id: 'a5-quotient', title: 'Le quotient a/b', desc: '$3 \\times \\ldots = 7$ ; partie entière d’une fraction.', example: '3 \\times \\dfrac{7}{3} = 7', course: L.fr,
  generate(rng) {
    let a: number, b: number;
    do { a = rng.int(2, 9); b = rng.int(2, 30); } while (gcd(a, b) !== 1 || b === 1);
    if (rng.chance(0.5)) {
      return numQ({ title: 'Compléter.', display: `${a} \\times \\ldots = ${b}`, fields: [{ expect: q(b, a) }], hint: `Le nombre qui, multiplié par ${a}, donne ${b} est le quotient ${m(fr(b, a))}.`, mist: [[q(b - a), 'C’est une multiplication, pas une addition.'], [q(a, b), 'Attention à l’ordre : c’est b divisé par a.']], sol: [`Par définition du quotient, ${m(`${a} \\times ${fr(b, a)} = ${b}`)}.`], answer: m(fr(b, a)), key: `q${a}|${b}`, items: [{ what: 'x', js: `${b}/${a}`, expect: b / a, tol: 1e-12 }] });
    }
    if (b < a) return a5quotient.generate(rng, 1);
    const e = Math.floor(b / a), r = b % a;
    return numQ({ title: 'Compléter.', display: `${fr(b, a)} = \\ldots + \\dfrac{\\ldots}{${a}}`, prompt: 'Partie entière, puis fraction inférieure à 1.', fields: [{ label: 'Entier :', expect: q(e) }, { label: 'Numérateur :', expect: q(r) }], hint: `Division euclidienne de ${b} par ${a}.`, sol: [`${m(`${b} = ${a} \\times ${e} + ${r}`)}, donc ${m(`${fr(b, a)} = ${e} + ${fr(r, a)}`)}.`], answer: m(`${e} + ${fr(r, a)}`), key: `e${a}|${b}`, items: [{ what: 'e', js: `Math.floor(${b}/${a})`, expect: e }, { what: 'r', js: `${b}%${a}`, expect: r }] });
  },
};

// ------------------------------------------------------------------ fractions égales
export const a5egales: Generator = {
  ...base, id: 'a5-egales', title: 'Fractions égales', desc: 'Compléter une égalité de fractions.', example: '\\dfrac{2}{3} = \\dfrac{8}{12}', course: L.fr,
  generate(rng) {
    let a: number, b: number;
    do { a = rng.int(1, 9); b = rng.int(2, 12); } while (gcd(a, b) !== 1);
    const k = rng.int(2, 9), num = rng.chance(0.5);
    const display = num ? `${fr(a, b)} = \\dfrac{\\ldots}{${b * k}}` : `${fr(a, b)} = \\dfrac{${a * k}}{\\ldots}`, exp = num ? a * k : b * k;
    return numQ({ title: 'Compléter.', display, fields: [{ expect: q(exp) }], hint: `Par quel nombre a-t-on multiplié ${num ? 'le dénominateur' : 'le numérateur'} ? Fais de même pour l’autre.`, mist: [[q(num ? a + (b * k - b) : b + (a * k - a)), 'On multiplie numérateur et dénominateur par le même nombre (on n’ajoute pas).']], sol: [`${m(`${fr(a, b)} = \\dfrac{${a} \\times ${k}}{${b} \\times ${k}} = ${fr(a * k, b * k)}`)}.`], answer: m(String(exp)), key: `${a}/${b}|${k}|${num}`, items: [{ what: 'x', js: num ? `${a}*${b * k}/${b}` : `${b}*${a * k}/${a}`, expect: exp, tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ comparer
export const a5comparer: Generator = {
  ...base, id: 'a5-comparer', title: 'Comparer', desc: 'Décimaux ; fractions de même dénominateur ; fraction et 1.', example: '3{,}15 < 3{,}2', course: L.ent, links: [L.fr],
  generate(rng) {
    const kind = rng.int(0, 2);
    let A: ReturnType<typeof q>, B: ReturnType<typeof q>, ta: string, tb: string, why: string;
    if (kind === 0) {
      const e = rng.int(0, 20), x = rng.int(1, 9), y = rng.pick([...Array(90).keys()].map((i) => i + 10).filter((t) => t % 10)); A = q(e * 10 + x, 10); B = q(e * 100 + y, 100);
      if (rng.chance(0.5)) [A, B] = [B, A];
      ta = dq(A); tb = dq(B); why = 'Compare la partie entière, puis les dixièmes, puis les centièmes (complète par des zéros).';
    } else if (kind === 1) {
      const d = rng.int(3, 15), a = rng.int(1, 2 * d), b = (a + rng.int(1, 2 * d - 1) - 1) % (2 * d) + 1; A = q(a, d); B = q(b, d); ta = fr(a, d); tb = fr(b, d); why = 'Même dénominateur : compare les numérateurs.';
    } else {
      const d = rng.int(2, 15), a = (d + rng.int(1, 2 * d - 1)) % (2 * d) || 2 * d; A = q(a, d); B = q(1); ta = fr(a, d); tb = '1'; why = `${m(`1 = ${fr(d, d)}`)} : compare ${a} et ${d}.`;
    }
    const c = Math.sign(toNum(A) - toNum(B)), rel = ['<', '=', '>'][c + 1];
    return choiceQ({ title: 'Comparer.', display: `${ta} \\; \\ldots \\; ${tb}`, prompt: 'Quel symbole ?', answer: cmpChoice(c, why), hint: why, sol: [`${why}`, `${m(`${ta} ${rel} ${tb}`)}.`], answerText: m(`${ta} ${rel} ${tb}`), key: `${ta}|${tb}`, items: [{ what: 'step:0', js: `Math.sign(${toNum(A)}-${toNum(B)})+1`, expect: c + 1 }] });
  },
};

// ------------------------------------------------------------------ fraction, pourcentage d'une quantité
export const a5part: Generator = {
  ...base, id: 'a5-part', title: 'Fraction, pourcentage d’une quantité', desc: '$\\dfrac{3}{4}$ de 20 ; 10 %, 50 %, 25 %, 1 % d’une quantité.', example: '10\\,\\% \\text{ de } 340 = 34', course: L.fr, links: [L.pro],
  generate(rng) {
    if (rng.chance(0.5)) {
      const b = rng.int(2, 10), a = rng.int(1, b - 1), k = rng.int(2, 12), N = b * k, r = a * k;
      return numQ({ title: 'Calcul mental.', display: `${fr(a, b)} \\text{ de } ${N}`, fields: [{ expect: q(r) }], hint: `Partage ${N} en ${b}, puis prends ${a} part${a > 1 ? 's' : ''}.`, mist: [[q(N / b), `C’est ${m(fr(1, b))} de ${N} : multiplie par ${a}.`]], sol: [`${m(`${N} \\div ${b} = ${k}`)} puis ${m(`${k} \\times ${a} = ${r}`)}.`], answer: m(String(r)), key: `f${a}/${b}|${N}`, items: [{ what: 'r', js: `${a}*${N}/${b}`, expect: r, tol: 1e-9 }] });
    }
    const p = rng.pick([1, 10, 50, 25, 75, 20]), N = p === 1 ? rng.int(1, 60) * 100 : p === 25 || p === 75 ? rng.int(2, 40) * 4 : p === 20 ? rng.int(2, 40) * 5 : rng.int(2, 99) * 10;
    const r = q(p * N, 100);
    const how: Record<number, string> = { 1: 'divise par 100', 10: 'divise par 10', 50: 'prends la moitié', 25: 'prends le quart', 75: 'prends le quart, puis multiplie par 3', 20: 'divise par 10 puis multiplie par 2' };
    return numQ({ title: 'Calcul mental.', display: `${p}\\,\\% \\text{ de } ${nb(N)}`, fields: [{ expect: r }], hint: `Pour ${p} %, ${how[p]}.`, mist: [[q(N - p), 'Un pourcentage n’est pas une soustraction.']], sol: [`${p} % de ${m(nb(N))} : ${how[p]}. ${m(`\\dfrac{${p}}{100} \\times ${nb(N)} = ${dq(r)}`)}.`], answer: m(dq(r)), key: `p${p}|${N}`, items: [{ what: 'r', js: `${p}*${N}/100`, expect: toNum(r), tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ angles
export const a5angles: Generator = {
  ...base, id: 'a5-angles', title: 'Angles', desc: 'Somme des angles d’un triangle ; angles complémentaires, supplémentaires.', example: '180 - 50 - 70 = 60', course: L.geo,
  generate(rng) {
    const kind = rng.int(0, 2);
    if (kind === 0) {
      const a = rng.int(20, 100), b = rng.int(15, 160 - a), c = 180 - a - b;
      return numQ({ title: 'Triangle.', statement: `Dans un triangle, deux angles mesurent ${m(`${a}^\\circ`)} et ${m(`${b}^\\circ`)}. Mesure du troisième angle ?`, fields: [{ expect: q(c), unit: '°' }], hint: 'La somme des angles d’un triangle vaut 180°.', mist: [[q(360 - a - b), 'Dans un triangle, la somme vaut 180° (360°, c’est pour un quadrilatère).'], [q(a + b), 'C’est la somme des deux angles donnés.']], sol: [m(`180 - ${a} - ${b} = ${c}`) + ' : le troisième angle mesure ' + m(`${c}^\\circ`) + '.'], answer: m(`${c}^\\circ`), key: `t${a}|${b}`, items: [{ what: 'c', js: `180-${a}-${b}`, expect: c }] });
    }
    const sup = kind === 2, T = sup ? 180 : 90, a = rng.int(5, T - 5), r = T - a;
    return numQ({ title: 'Angles.', statement: `Un angle mesure ${m(`${a}^\\circ`)}. Mesure d’un angle qui lui est ${sup ? 'supplémentaire' : 'complémentaire'} ?`, fields: [{ expect: q(r), unit: '°' }], hint: `${sup ? 'Supplémentaires' : 'Complémentaires'} : la somme vaut ${T}°.`, mist: [[(sup ? 90 : 180) - a > 0 ? q((sup ? 90 : 180) - a) : null, sup ? 'Supplémentaires : somme 180° (90°, c’est complémentaires).' : 'Complémentaires : somme 90° (180°, c’est supplémentaires).']], sol: [`${m(`${T} - ${a} = ${r}`)} : ${m(`${r}^\\circ`)}.`], answer: m(`${r}^\\circ`), key: `${sup ? 's' : 'c'}${a}`, items: [{ what: 'r', js: `${T}-${a}`, expect: r }] });
  },
};

// ------------------------------------------------------------------ probabilités
const COLORS = ['rouges', 'bleues', 'vertes', 'jaunes', 'noires', 'blanches'];
export const a5proba: Generator = {
  ...base, id: 'a5-proba', title: 'Probabilité simple', desc: 'Dé, urne : cas favorables sur cas possibles.', example: 'P = \\dfrac{3}{8}', course: L.pba,
  generate(rng) {
    if (rng.chance(0.4)) {
      const F = rng.pick([6, 8, 10, 12, 20]), t = rng.int(2, F - 1);
      const ev = rng.pick([
        ['un nombre pair', (x: number) => x % 2 === 0, 'x%2===0'],
        ['un nombre impair', (x: number) => x % 2 === 1, 'x%2===1'],
        ['un multiple de 3', (x: number) => x % 3 === 0, 'x%3===0'],
        ['un multiple de 4', (x: number) => x % 4 === 0, 'x%4===0'],
        [`un nombre supérieur ou égal à ${t}`, (x: number) => x >= t, `x>=${t}`],
        [`un nombre strictement inférieur à ${t}`, (x: number) => x < t, `x<${t}`],
        [`le ${t}`, (x: number) => x === t, `x===${t}`],
      ] as [string, (x: number) => boolean, string][]);
      const k = Array.from({ length: F }, (_, i) => i + 1).filter(ev[1]).length, v = q(k, F);
      return numQ({ title: 'Probabilité.', statement: `On lance un dé équilibré à ${m(String(F))} faces numérotées de 1 à ${m(String(F))}. Probabilité d’obtenir ${ev[0]} ?`, fields: [{ expect: v }], hint: `${F} issues équiprobables : compte les issues favorables.`, mist: [[k > 1 ? q(1, k) : null, `Il y a ${F} issues possibles : le dénominateur est ${F}.`]], sol: [`${k} issue${k > 1 ? 's' : ''} favorable${k > 1 ? 's' : ''} sur ${F} : ${m(`P = ${fr(k, F)}${v.d !== F ? ` = ${v.d === 1 ? v.n : fr(v.n, v.d)}` : ''}`)}.`], answer: m(v.d === 1 ? String(v.n) : fr(v.n, v.d)), key: `d${F}|${ev[0]}`, items: [{ what: 'p', js: `Array.from({length:${F}},(_,i)=>i+1).filter((x)=>${ev[2]}).length/${F}`, expect: k / F, tol: 1e-12 }] });
    }
    const [c1, c2, c3] = rng.shuffle(COLORS).slice(0, 3), a = rng.int(1, 9), b = rng.int(1, 9), c = rng.int(0, 6), N = a + b + c, v = q(a, N);
    const bl = (n: number, col: string) => `${n} boule${n > 1 ? 's' : ''} ${n > 1 ? col : col.replace(/s$/, '')}`;
    const comp = `${bl(a, c1)}, ${bl(b, c2)}${c ? ` et ${bl(c, c3)}` : ''}`;
    return numQ({ title: 'Probabilité.', statement: `Une urne contient ${comp}, indiscernables au toucher. On tire une boule au hasard. Probabilité qu’elle soit ${c1.replace(/s$/, '')} ?`, fields: [{ expect: v }], hint: `Il y a ${N} boules en tout.`, mist: [[q(a, N - a), 'Le dénominateur est le nombre total de boules.'], [q(a, b), 'Le dénominateur est le nombre total de boules.']], sol: [`${N} boules en tout, dont ${a} ${c1} : ${m(`P = ${fr(a, N)}${v.d !== N ? ` = ${v.d === 1 ? v.n : fr(v.n, v.d)}` : ''}`)}.`], answer: m(v.d === 1 ? String(v.n) : fr(v.n, v.d)), key: `u${a}|${b}|${c}`, items: [{ what: 'p', js: `${a}/(${a}+${b}+${c})`, expect: a / N, tol: 1e-12 }] });
  },
};

// ------------------------------------------------------------------ proportionnalité
const ITEMS: [string, string, number, number][] = [['cahiers', 'coûtent', 120, 400], ['croissants', 'coûtent', 90, 160], ['places de cinéma', 'coûtent', 600, 1200], ['kg de pommes', 'coûtent', 180, 450], ['stylos', 'coûtent', 50, 250]];
export const a5propor: Generator = {
  ...base, id: 'a5-propor', title: 'Proportionnalité', desc: 'Passer par l’unité ou par un multiple.', example: '3 \\to 4{,}50 ; 6 \\to 9', course: L.pro,
  generate(rng) {
    const [what, verb, lo, hi] = rng.pick(ITEMS), u = rng.int(lo / 10, hi / 10) * 10, n = rng.int(2, 5), k = rng.int(2, 4), tot = q(u * n, 100), ask = n * k;
    const res = q(u * ask, 100);
    const half = rng.chance(0.3) && n % 2 === 0;
    const ask2 = half ? n / 2 : ask, res2 = q(u * ask2, 100);
    return numQ({ title: 'Proportionnalité.', statement: `${n} ${what} ${verb} ${m(dq(tot))} €. Combien ${verb} ${ask2} ${what} ?`, fields: [{ expect: res2, unit: '€' }], hint: half ? `${ask2}, c’est la moitié de ${n}.` : `${ask2}, c’est ${k} fois ${n}.`, sol: [half ? `${m(`${dq(tot)} \\div 2 = ${dq(res2)}`)} : ${m(dq(res2))} €.` : `${m(`${dq(tot)} \\times ${k} = ${dq(res)}`)} : ${m(dq(res))} €.`], answer: `${m(dq(res2))} €`, key: `${what}|${u}|${n}|${ask2}`, items: [{ what: 'p', js: `${toNum(tot)}/${n}*${ask2}`, expect: toNum(res2), tol: 1e-9 }] });
  },
};

// ------------------------------------------------------------------ motifs (suite de nombres)
export const a5motif: Generator = {
  ...base, id: 'a5-motif', title: 'Motifs et suites', desc: 'Prolonger une suite de nombres qui augmente toujours de la même quantité.', example: '5 ; 9 ; 13 ; 17 ; \\ldots', course: L.lit,
  generate(rng) {
    const u = rng.int(1, 12), r = rng.int(2, 9), n = rng.pick([6, 8, 10, 12, 20]), un = u + (n - 1) * r;
    const first = [0, 1, 2, 3].map((i) => u + i * r);
    return numQ({ title: 'Motif.', statement: `On construit des motifs avec des allumettes. Nombres d’allumettes des étapes 1 à 4 : ${first.map((x) => m(String(x))).join(' ; ')}. Combien d’allumettes à l’étape ${n} ?`, fields: [{ expect: q(un) }], hint: `À chaque étape, on ajoute ${r} allumettes. De l’étape 1 à l’étape ${n}, on en ajoute ${n - 1} fois.`, mist: [[q(u + n * r), `De l’étape 1 à l’étape ${n}, on ajoute ${n - 1} fois ${r}, pas ${n} fois.`], [q(n * r), `N’oublie pas les ${u} allumettes de départ.`]], sol: [`${m(`${u} + ${n - 1} \\times ${r} = ${un}`)}.`], answer: m(String(un)), key: `${u}|${r}|${n}`, items: [{ what: 'u', js: `${u}+(${n}-1)*${r}`, expect: un }] });
  },
};

export const SET5: Generator[] = [a5divis, a5euclide, a5tables, a5dix, a5trou, a5ecritures, a5quotient, a5egales, a5comparer, a5part, a5angles, a5proba, a5propor, a5motif];
