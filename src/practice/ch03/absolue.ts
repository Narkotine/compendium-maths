/**
 * Valeur absolue (programme 2026, 5e) : distance à zéro, notation |a|.
 * ★ : |a| et |a| + |b| ; ★★ : |a − b| (on calcule l'intérieur d'abord) et |a| − |b|.
 */
import { type Q, q, add, sub, abs as qabs, neg, toNum, eq } from '../engine/q';
import type { Generator, Level, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, dn, pn, js, numStep } from '../engine/build';
import { LINKS } from './common';

const A = (v: Q) => `\\lvert ${dn(v)} \\rvert`;
const nz = (rng: Rng, lo: number, hi: number, den: number) => q(rng.signed(lo, hi), den);

export const absolue: Generator = {
  id: 'valeur-absolue',
  title: 'Valeur absolue',
  desc: 'La distance à zéro, notée $|a|$ ; ★★ calculer l’intérieur des barres d’abord.',
  stars: 1,
  levels: [1, 2],
  example: '\\lvert -7 \\rvert = 7',
  course: LINKS.s12,
  generate(rng: Rng, level: Level) {
    const den = rng.chance(0.35) ? 10 : 1;
    if (level === 1) {
      const a = q(-rng.int(den === 1 ? 2 : 11, den === 1 ? 40 : 99), den);
      const b = nz(rng, den === 1 ? 2 : 11, den === 1 ? 30 : 99, den);
      const c = q(-rng.int(2, 25));
      const s = add(qabs(b), qabs(c));
      const steps: Step[] = [
        numStep(`a) ${m(`${A(a)} = \\ldots`)}`, m(`${A(a)} =`), qabs(a), 'La valeur absolue est la distance à zéro : elle n’est jamais négative.', [
          [a, 'Une valeur absolue est une **distance** : elle n’est jamais négative.'],
        ]),
        numStep(`b) ${m(`${A(b)} + ${A(c)} = \\ldots`)}`, m(`${A(b)} + ${A(c)} =`), s, 'Calcule chaque valeur absolue (distance à zéro), puis additionne.', [
          [add(b, c), 'Tu as additionné les nombres avec leur signe. Prends d’abord leurs distances à zéro.'],
          [neg(s), 'Les deux valeurs absolues sont positives : leur somme aussi.'],
          [qabs(add(b, c)), `Ici, on prend la valeur absolue de chaque nombre **avant** d’additionner : ${m(`${dn(qabs(b))} + ${dn(qabs(c))}`)}.`],
        ]),
      ];
      return {
        title: 'Calculer.',
        steps,
        solution: [
          `a) La distance à zéro de ${m(dn(a))} est ${m(dn(qabs(a)))}, donc ${m(`${A(a)} = ${dn(qabs(a))}`)}.`,
          `b) ${m(`${A(b)} + ${A(c)} = ${dn(qabs(b))} + ${dn(qabs(c))} = ${dn(s)}`)}.`,
        ],
        answer: `a) ${m(dn(qabs(a)))} ; b) ${m(dn(s))}`,
        key: `1|${dn(a)}|${dn(b)}|${dn(c)}`,
        data: { kind: 'js', items: [{ what: 'a', js: `Math.abs${js(a)}`, expect: toNum(qabs(a)) }, { what: 'b', js: `Math.abs${js(b)} + Math.abs${js(c)}`, expect: toNum(s) }] },
      };
    }
    // ★★ : |a − b| et |a| − |b|, avec a et b de signes variés (le résultat de a − b peut être négatif)
    let a: Q, b: Q;
    do {
      a = nz(rng, den === 1 ? 1 : 5, den === 1 ? 20 : 99, den);
      b = nz(rng, den === 1 ? 1 : 5, den === 1 ? 20 : 99, den);
    } while (eq(a, b) || eq(qabs(a), qabs(b)) || toNum(sub(a, b)) > 0);
    const inner = sub(a, b); // négatif : l'erreur « on oublie les barres » est visible
    const r1 = qabs(inner), r2 = sub(qabs(a), qabs(b));
    const steps: Step[] = [
      numStep(`a) ${m(`\\lvert ${dn(a)} - ${pn(b)} \\rvert = \\ldots`)}`, m(`\\lvert ${dn(a)} - ${pn(b)} \\rvert =`), r1, 'Calcule d’abord ce qu’il y a entre les barres, puis prends la distance à zéro du résultat.', [
        [inner, `${m(`${dn(a)} - ${pn(b)} = ${dn(inner)}`)} : il reste à prendre la distance à zéro de ce résultat.`],
        [qabs(r2), 'On ne prend pas la valeur absolue de chaque nombre : on calcule d’abord l’intérieur des barres.'],
        [add(qabs(a), qabs(b)), 'On ne prend pas la valeur absolue de chaque nombre : on calcule d’abord l’intérieur des barres.'],
      ]),
      numStep(`b) ${m(`${A(a)} - ${A(b)} = \\ldots`)}`, m(`${A(a)} - ${A(b)} =`), r2, 'Calcule chaque valeur absolue, puis la différence (qui peut être négative).', [
        [qabs(r2), `${m(`${dn(qabs(a))} - ${dn(qabs(b))}`)} : le résultat d’une soustraction peut être négatif.`],
        [r1, 'Ici, les barres portent sur chaque nombre séparément : calcule chaque valeur absolue avant de soustraire.'],
      ]),
    ];
    return {
      title: 'Calculer (attention à ce qu’il y a entre les barres).',
      steps,
      solution: [
        `a) On calcule d’abord l’intérieur : ${m(`${dn(a)} - ${pn(b)} = ${dn(a)} + ${pn(neg(b))} = ${dn(inner)}`)}, puis ${m(`${A(inner)} = ${dn(r1)}`)}.`,
        `b) ${m(`${A(a)} - ${A(b)} = ${dn(qabs(a))} - ${dn(qabs(b))} = ${dn(r2)}`)}.`,
        'Les deux résultats sont différents : la place des barres compte.',
      ].slice(0, eq(r1, r2) ? 2 : 3),
      answer: `a) ${m(dn(r1))} ; b) ${m(dn(r2))}`,
      key: `2|${dn(a)}|${dn(b)}`,
      data: { kind: 'js', items: [{ what: 'a', js: `Math.abs(${js(a)} - ${js(b)})`, expect: toNum(r1) }, { what: 'b', js: `Math.abs${js(a)} - Math.abs${js(b)}`, expect: toNum(r2) }] },
    };
  },
};
