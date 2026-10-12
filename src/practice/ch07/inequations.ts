/** Inéquations (★★ : ax ⩾ b, ax + b < c ; ★★★ : ax + b < cx + d, avec parenthèses). */
import { type Q, q, add, sub, mul, div, neg, eq, isInt, cmp, toNum } from '../engine/q';
import { N, X, lin, term, sumE, prod, eqn, texEq, tex, texRel, evaluate, substitute, relOpp, isStrict, holds, type Rel, type Equation, type Expr } from '../engine/expr';
import { linearLines, nat } from '../engine/linear';
import type { Generator, ExerciseBody, Rich, Mistake, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LINKS, m } from './common';
import { type Bloc, P, T, C, sideExpr, sideLin, expandLines } from './blocs';

const RELS: Rel[] = ['<', '>', '<=', '>='];
const relWord = (r: Rel) => ({ '<': 'strictement inférieurs à', '>': 'strictement supérieurs à', '<=': 'inférieurs ou égaux à', '>=': 'supérieurs ou égaux à', '=': 'égaux à' })[r];
/** Marqueur de droite graduée lu par le rendu : [[ray:rel:n/d]]. */
export const rayMarker = (rel: Rel, b: Q) => `[[ray:${rel}:${b.n}/${b.d}]]`;

/** Borne : entier (souvent) ou fraction de dénominateur |a|. */
function pickBound(rng: Rng, a: number, pFrac: number): Q {
  const d = Math.abs(a);
  if (d >= 2 && rng.chance(pFrac)) {
    let b = q(rng.signed(1, 8 * d), d);
    if (isInt(b)) b = add(b, q(1, d));
    return b;
  }
  return q(rng.intNot(-9, 10, 0));
}
/** Valeur test entière (ou simple) strictement à l'intérieur / à l'extérieur de l'ensemble. */
function testValue(rel: Rel, b: Q, inside: boolean): Q {
  const right = rel === '>' || rel === '>=';
  const goRight = right === inside;
  const base = goRight ? Math.floor(toNum(b)) + 1 : Math.ceil(toNum(b)) - 1;
  // évite 0 seulement s'il rend le calcul trivial… 0 est en fait une très bonne valeur test : on le garde
  return q(base + (goRight ? 1 : -1) * (Math.abs(base) > 20 ? 0 : 0));
}

export const inequation: Generator = {
  id: 'inequation',
  title: 'Inéquations',
  desc: 'Résoudre, puis représenter sur une droite graduée. Diviser par un négatif change le sens.',
  stars: 2,
  levels: [2, 3],
  example: '-2x > 6',
  course: LINKS.s62,
  links: [LINKS.s61, LINKS.s8],
  generate(rng, level) {
    const form =
      level === 2
        ? rng.weighted([['ax>b', 3], ['ax+b<c', 4], ['b-ax<c', 1.5]] as const)
        : rng.weighted([['ax+b<cx+d', 5], ['paren', 3], ['ax+b<c', 1]] as const);
    const rel0 = rng.pick(RELS);
    let L: Bloc[], R: Bloc[], A: number; // A : coefficient final de x (après regroupement à gauche)
    for (;;) {
      if (form === 'ax>b') {
        A = rng.chance(0.5) ? -rng.int(2, 9) : rng.int(2, 9);
        const bnd = pickBound(rng, A, 0.3);
        L = [T(A)];
        R = [C(mul(q(A), bnd).n)];
        if (!isInt(mul(q(A), bnd))) continue;
      } else if (form === 'ax+b<c' || form === 'b-ax<c') {
        A = form === 'b-ax<c' ? -rng.int(2, 7) : rng.chance(0.45) ? -rng.int(2, 9) : rng.int(2, 9);
        const bnd = pickBound(rng, A, level === 2 ? 0.25 : 0.4);
        const b = form === 'b-ax<c' ? rng.int(1, 15) : rng.intNot(-15, 15, 0);
        const c = add(mul(q(A), bnd), q(b));
        if (!isInt(c) || c.n === 0) continue;
        L = form === 'b-ax<c' ? [C(b), T(A)] : [T(A, b)];
        R = [C(c.n)];
      } else if (form === 'ax+b<cx+d') {
        const a = rng.intNot(-7, 9, 0, 1, -1), c = rng.intNot(-6, 7, 0, a);
        A = a - c;
        if (A === 1) continue;
        const bnd = pickBound(rng, A, 0.35);
        const b = rng.intNot(-12, 12, 0);
        const d = add(mul(q(A), bnd), q(b));
        if (!isInt(d) || d.n === 0 || Math.abs(d.n) > 40) continue;
        L = [T(a, b)];
        R = [T(c, d.n)];
      } else {
        const k = rng.intNot(-5, 5, 0, 1, -1), p = rng.signed(1, 6);
        const c = rng.intNot(-6, 7, 0, k);
        A = k - c;
        if (A === 1) continue;
        const bnd = pickBound(rng, A, 0.3);
        const d = add(mul(q(A), bnd), q(k * p));
        if (!isInt(d) || d.n === 0 || Math.abs(d.n) > 40) continue;
        L = [P(k, 1, p)];
        R = [T(c, d.n)];
      }
      break;
    }
    const E: Equation = eqn(sideExpr(L), sideExpr(R), rel0);
    const ex = expandLines(L, R);
    const res = linearLines(ex.lhs, ex.rhs, rel0, { start: false });
    const bound = res.x, rel = res.rel;
    const neg_ = A < 0;
    const l = sideLin(L), r = sideLin(R);
    // erreurs typiques
    const mist: Mistake[] = [];
    if (neg_) mist.push({ on: 'ineq', rel: relOpp(rel), bound, msg: `On ${A === -1 ? 'multiplie' : 'divise'} par ${m(String(A))}, un nombre **négatif** : il faut **changer le sens** de l’inégalité.` });
    else mist.push({ on: 'ineq', rel: relOpp(rel), bound, msg: `On divise par ${m(String(A))}, un nombre **positif** : le sens de l’inégalité **ne change pas**.` });
    const alt: [Q | null, Rich][] = [];
    if (l.b !== 0) alt.push([div(add(q(r.b), q(l.b)), q(A)), `Pour enlever ${m(nat(q(l.b)))} du membre de gauche, on ${l.b > 0 ? '**soustrait**' : '**ajoute**'} ${m(nat(q(Math.abs(l.b))))} aux deux membres.`]);
    if (r.a !== 0 && l.a + r.a !== 0) alt.push([div(q(r.b - l.b), q(l.a + r.a)), `Pour regrouper les ${m('x')}, on ${r.a > 0 ? '**soustrait**' : '**ajoute**'} ${m(tex(term(Math.abs(r.a))))} aux deux membres.`]);
    alt.push([neg(bound), 'Attention au signe de la borne.']);
    for (const [v, msg] of alt) if (v && !eq(v, bound) && !mist.some((x) => x.on === 'ineq' && x.bound && eq(x.bound, v))) mist.push({ on: 'ineq', bound: v, msg });
    const hint1 = L.some((b) => b.paren)
      ? 'Développe d’abord, puis procède comme pour une équation. Au moment de diviser, regarde le **signe** du coefficient de $x$.'
      : r.a !== 0
        ? `Regroupe les ${m('x')} à gauche et les nombres à droite, puis divise par le coefficient de ${m('x')} : s’il est **négatif**, le sens change.`
        : `Isole ${m('x')} comme dans une équation. Au moment de diviser par ${m(String(A))}, demande-toi : ce nombre est-il positif ou négatif ?`;
    const steps: Step[] = [
      {
        prompt: 'Résous l’inéquation : choisis le symbole, puis écris la borne.',
        answer: { kind: 'ineq', v: 'x', rel, bound },
        hint: hint1,
        mistakes: mist,
      },
      {
        prompt: `Représente les solutions ${m(`x ${texRel(rel)} ${nat(bound)}`)} sur la droite graduée.`,
        answer: { kind: 'ray', bound, rel },
        hint: `Les solutions sont les nombres ${relWord(rel)} ${m(nat(bound))} : ils sont ${rel.startsWith('>') ? 'à **droite**' : 'à **gauche**'} de ${m(nat(bound))}. La borne est ${isStrict(rel) ? '**exclue** : crochet tourné vers l’extérieur' : '**incluse** : crochet tourné vers les solutions'}.`,
      },
    ];
    // corrigé
    const tIn = testValue(rel, bound, true), tOut = testValue(rel, bound, false);
    const ctl = (t: Q) => {
      const lv = evaluate(E.lhs, { x: t }), rv = evaluate(E.rhs, { x: t });
      const sl = tex(substitute(E.lhs, { x: t }));
      const sr = E.rhs.k === 'n' ? '' : ` et ${m(`${tex(substitute(E.rhs, { x: t }))} = ${nat(rv)}`)}`;
      return { txt: `${m(`${sl} = ${nat(lv)}`)}${sr}`, ok: holds(E.rel, lv, rv), cmpTex: `${nat(lv)} ${texRel(E.rel)} ${nat(rv)}`, realTex: `${nat(lv)} ${eq(lv, rv) ? '=' : cmp(lv, rv) < 0 ? '<' : '>'} ${nat(rv)}` };
    };
    const ci = ctl(tIn), co = ctl(tOut);
    const lines: Rich[] = [m(texEq(E)), ...ex.lines, ...res.lines];
    lines.push(`Les solutions sont tous les nombres ${relWord(rel)} ${m(nat(bound))} : ${m(`x ${texRel(rel)} ${nat(bound)}`)}.`);
    lines.push(rayMarker(rel, bound));
    lines.push(`Sur la droite graduée : demi-droite ${rel.startsWith('>') ? 'à droite' : 'à gauche'} de ${m(nat(bound))}, borne ${isStrict(rel) ? 'exclue (crochet tourné vers l’extérieur)' : 'incluse (crochet tourné vers les solutions)'}.`);
    lines.push(`Contrôle avec une valeur test : pour ${m(`x = ${nat(tIn)}`)} (dans l’ensemble), ${ci.txt}, et ${m(ci.cmpTex)} est vrai ✓ ; pour ${m(`x = ${nat(tOut)}`)} (hors de l’ensemble), ${co.txt}, or ${m(co.realTex)} : l’inégalité ${m(`\\ldots ${texRel(E.rel)} \\ldots`)} n’est pas vérifiée ✓.`);
    void ci.ok;
    void co.ok;
    const body: ExerciseBody = {
      title: 'Résoudre l’inéquation, puis représenter ses solutions.',
      display: texEq(E),
      form: isInt(bound) ? undefined : 'Donne la borne exacte (fraction irréductible ou décimal).',
      steps,
      solution: lines,
      answer: `${m(`x ${texRel(rel)} ${nat(bound)}`)}`,
      key: texEq(E),
      data: { kind: 'inequation', eq: E, rel, bound },
    };
    void prod;
    void sumE;
    void N;
    void X;
    void lin;
    void sub;
    void cmp;
    return body;
  },
};
export type { Expr };
