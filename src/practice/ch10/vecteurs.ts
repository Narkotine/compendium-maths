/**
 * Vecteurs (programme 2026, 3e) : relation de Chasles, vecteurs égaux et opposés dans un parallélogramme.
 * Vérification indépendante : les tests recalculent la bonne option avec des coordonnées (data.items « step:k »).
 */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LETTERS } from '../engine/build';
import { svgWrap, line, text, dot, poly, type Pt } from '../engine/svg';
import { LINKS, m, type Item } from './common';

const V = (s: string) => (s === '0' ? '\\vec{0}' : `\\overrightarrow{${s}}`);
const vm = (s: string) => m(V(s));

/** Code JS (tests) : indice de l'option égale à la somme des vecteurs `terms`, avec des coordonnées données. */
function jsIndex(coords: Record<string, Pt>, terms: string[], options: string[]): string {
  const P = JSON.stringify(coords);
  return `(()=>{const P=${P};const v=(s)=>s==='0'?[0,0]:[P[s[1]][0]-P[s[0]][0],P[s[1]][1]-P[s[0]][1]];` +
    `const t=${JSON.stringify(terms)}.map(v).reduce((a,b)=>[a[0]+b[0],a[1]+b[1]],[0,0]);` +
    `return ${JSON.stringify(options)}.findIndex((o)=>{const w=v(o);return Math.abs(w[0]-t[0])<1e-9&&Math.abs(w[1]-t[1])<1e-9;});})()`;
}

/** QCM : options = bonne réponse + distracteurs expliqués (sans doublon), dans un ordre mélangé. */
function choice(rng: Rng, good: string, bad: [string, Rich][]): { answer: Step['answer']; options: string[] } {
  const seen = new Set([good]);
  const list: [string, Rich | null][] = [[good, null]];
  for (const [o, why] of bad) if (!seen.has(o)) { seen.add(o); list.push([o, why]); }
  const order = rng.shuffle(list.map((_, i) => i)).slice(0, Math.min(4, list.length));
  if (!order.includes(0)) order[rng.int(0, order.length - 1)] = 0;
  const opts = order.map((i) => list[i][0]);
  return { answer: { kind: 'choice', options: opts.map(vm), explain: order.map((i) => list[i][1]), correct: order.indexOf(0), attempts: opts.length > 2 ? 2 : 1 }, options: opts };
}

// ------------------------------------------------------------------ ★★ : relation de Chasles
function chasles(rng: Rng, items: Item[], idx: number): { step: Step; sol: Rich[]; key: string; disp: string; ans: string } {
  const n = rng.weighted([[2, 3], [3, 3], [4, 1]] as const);
  const loop = n >= 3 && rng.chance(0.25);
  const pts = rng.shuffle(LETTERS).slice(0, loop ? n : n + 1);
  const chain = loop ? [...pts, pts[0]] : pts; // X0 → X1 → … → Xn
  const terms = chain.slice(0, -1).map((p, i) => p + chain[i + 1]);
  // un terme peut être écrit sous forme d'opposé ? non : on mélange seulement l'ordre (au moins une fois sur deux)
  let shown = rng.chance(0.55) ? rng.shuffle(terms) : terms;
  if (shown.length > 1 && shown.every((t, i) => t === terms[i]) && rng.chance(0.5)) shown = [...terms.slice(1), terms[0]];
  const start = chain[0], end = chain[chain.length - 1];
  const good = loop ? '0' : start + end;
  const asWritten = shown[0][0] + shown[shown.length - 1][1];
  const bad: [string, Rich][] = [];
  if (!loop) bad.push([end + start, `C’est l’opposé : la somme part de ${m(start)} (origine du premier vecteur de la chaîne) et arrive en ${m(end)}.`]);
  if (asWritten !== good && asWritten[0] !== asWritten[1]) bad.push([asWritten, 'On ne peut supprimer une lettre que si l’extrémité d’un vecteur est l’origine du suivant : remets d’abord les vecteurs bout à bout.']);
  if (!loop) bad.push(['0', `La somme n’est nulle que si l’on revient au point de départ ; ici on part de ${m(start)} et on arrive en ${m(end)}.`]);
  else bad.push([pts[0] + pts[1], 'Va jusqu’au bout de la chaîne : on revient au point de départ.']);
  bad.push([terms[0][0] + terms[terms.length - 1][0], 'Attention à l’extrémité : la somme arrive au bout du dernier vecteur de la chaîne.']);
  if (!loop && n >= 3) bad.push([chain[1] + end, `La somme part du début de la chaîne, ${m(start)}.`]);
  if (loop) bad.push([pts[1] + pts[0], 'On revient au point de départ : la somme est le vecteur nul.']);
  const c = choice(rng, good, bad);
  const coords: Record<string, Pt> = {};
  const base: Pt[] = [[0, 0], [7, 2], [3, 9], [-5, 4], [11, -6], [-8, -3]];
  pts.forEach((p, i) => (coords[p] = base[i]));
  items.push({ what: `step:${idx}`, js: jsIndex(coords, shown, c.options), expect: c.answer.kind === 'choice' ? c.answer.correct : -1 });
  const disp = shown.map(V).join(' + ');
  const sol: Rich[] = [];
  if (shown.join() !== terms.join()) sol.push(`On remet les vecteurs bout à bout : ${m(terms.map(V).join(' + '))}.`);
  let acc = terms[0];
  const parts: string[] = [];
  for (let i = 1; i < terms.length; i++) {
    const next = acc[0] + terms[i][1];
    parts.push(`${V(acc)} + ${V(terms[i])} = ${V(next[0] === next[1] ? '0' : next)}`);
    acc = next;
  }
  sol.push(`Relation de Chasles : ${parts.map(m).join(', puis ')}.`);
  if (loop) sol.push('On revient au point de départ : la somme est le vecteur nul.');
  return {
    step: { prompt: `Simplifier ${m(disp)}.`, answer: c.answer, hint: 'Mets les flèches bout à bout : l’extrémité de l’une est l’origine de la suivante.' },
    sol, key: shown.join('+'), disp, ans: V(good),
  };
}

// ------------------------------------------------------------------ ★★★ : parallélogramme
type PQ = { prompt: (L: Record<string, string>) => Rich; good: (L: Record<string, string>) => string; terms: (L: Record<string, string>) => string[]; bad: (L: Record<string, string>) => [string, Rich][]; sol: (L: Record<string, string>) => Rich };
const PQS: Record<string, PQ> = {
  egal: {
    prompt: (L) => `Quel vecteur est égal à ${vm(L.A + L.B)} ?`,
    good: (L) => L.D + L.C, terms: (L) => [L.A + L.B],
    bad: (L) => [[L.C + L.D, 'Même direction et même longueur, mais sens contraire : c’est l’opposé.'], [L.B + L.A, 'C’est l’opposé (sens contraire).'], [L.A + L.C, 'Ce vecteur suit une diagonale : pas la même direction.'], [L.D + L.B, 'Ce vecteur suit une diagonale : pas la même direction.']],
    sol: (L) => `${m(`${L.A}${L.B}${L.C}${L.D}`)} est un parallélogramme : les côtés opposés ${m(`[${L.A}${L.B}]`)} et ${m(`[${L.D}${L.C}]`)} sont parallèles, de même longueur et parcourus dans le même sens, donc ${m(`${V(L.A + L.B)} = ${V(L.D + L.C)}`)}.`,
  },
  regle: {
    prompt: (L) => `Simplifier ${m(`${V(L.A + L.B)} + ${V(L.A + L.D)}`)}.`,
    good: (L) => L.A + L.C, terms: (L) => [L.A + L.B, L.A + L.D],
    bad: (L) => [[L.B + L.D, 'C’est l’autre diagonale. Remplace d’abord un vecteur par un vecteur égal pour mettre les flèches bout à bout.'], [L.D + L.B, 'C’est l’autre diagonale. Remplace d’abord un vecteur par un vecteur égal pour mettre les flèches bout à bout.'], [L.C + L.A, 'C’est l’opposé du résultat.']],
    sol: (L) => `${m(`${V(L.A + L.D)} = ${V(L.B + L.C)}`)} (parallélogramme), donc ${m(`${V(L.A + L.B)} + ${V(L.A + L.D)} = ${V(L.A + L.B)} + ${V(L.B + L.C)} = ${V(L.A + L.C)}`)} (relation de Chasles).`,
  },
  milieu: {
    prompt: (L) => `Quel vecteur est égal à ${vm(L.A + L.O)} ?`,
    good: (L) => L.O + L.C, terms: (L) => [L.A + L.O],
    bad: (L) => [[L.C + L.O, 'Même longueur, mais sens contraire.'], [L.O + L.A, 'C’est l’opposé.'], [L.B + L.O, `${m(`[${L.B}${L.O}]`)} n’est pas porté par la même droite.`], [L.O + L.D, `${m(`[${L.O}${L.D}]`)} n’est pas porté par la même droite.`]],
    sol: (L) => `Les diagonales d’un parallélogramme se coupent en leur milieu : ${m(L.O)} est le milieu de ${m(`[${L.A}${L.C}]`)}, donc ${m(`${V(L.A + L.O)} = ${V(L.O + L.C)}`)}.`,
  },
  oppose: {
    prompt: (L) => `Quel vecteur est l’opposé de ${vm(L.O + L.B)} ?`,
    good: (L) => L.O + L.D, terms: (L) => [L.B + L.O],
    bad: (L) => [[L.D + L.O, `${m(`${V(L.D + L.O)} = ${V(L.O + L.B)}`)} : c’est le même vecteur, pas son opposé.`], [L.O + L.A, `${m(`[${L.O}${L.A}]`)} n’a pas la même direction.`], [L.O + L.C, `${m(`[${L.O}${L.C}]`)} n’a pas la même direction.`]],
    sol: (L) => `L’opposé de ${vm(L.O + L.B)} est ${vm(L.B + L.O)}. Comme ${m(L.O)} est le milieu de ${m(`[${L.B}${L.D}]`)}, ${m(`${V(L.B + L.O)} = ${V(L.O + L.D)}`)}.`,
  },
  trois: {
    prompt: (L) => `Simplifier ${m(`${V(L.A + L.B)} + ${V(L.B + L.C)} + ${V(L.C + L.D)}`)}.`,
    good: (L) => L.A + L.D, terms: (L) => [L.A + L.B, L.B + L.C, L.C + L.D],
    bad: (L) => [[L.D + L.A, 'C’est l’opposé du résultat.'], [L.A + L.C, 'Va jusqu’au bout : il reste le vecteur ' + vm(L.C + L.D) + '.'], ['0', `On ne revient pas au point de départ : on arrive en ${m(L.D)}.`]],
    sol: (L) => `Relation de Chasles : ${m(`${V(L.A + L.B)} + ${V(L.B + L.C)} = ${V(L.A + L.C)}`)}, puis ${m(`${V(L.A + L.C)} + ${V(L.C + L.D)} = ${V(L.A + L.D)}`)}.`,
  },
};

function paraFigure(L: Record<string, string>, P: Record<string, Pt>): string {
  const X = (p: Pt): Pt => [30 + p[0] * 22, 150 - p[1] * 22];
  const [A, B, C, D, O] = [P[L.A], P[L.B], P[L.C], P[L.D], P[L.O]].map(X);
  const lab = (p: Pt, s: string, dx: number, dy: number) => text([p[0] + dx, p[1] + dy], s);
  return svgWrap(260, 175, `Parallélogramme ${L.A}${L.B}${L.C}${L.D} de centre ${L.O}`,
    poly([A, B, C, D]) + line(A, C, 'gf-line gf-dash') + line(B, D, 'gf-line gf-dash') + [A, B, C, D, O].map((p) => dot(p)).join('') +
    lab(A, L.A, -12, 8) + lab(B, L.B, 12, 8) + lab(C, L.C, 12, -8) + lab(D, L.D, -12, -8) + lab(O, L.O, 0, -13));
}

export const vecteurs: Generator = {
  id: 'vecteurs', title: 'Vecteurs et relation de Chasles', stars: 2, levels: [2, 3], course: LINKS.s42, links: [LINKS.s41],
  desc: 'Simplifier une somme de vecteurs (Chasles) ; ★★★ vecteurs égaux, opposés et somme dans un parallélogramme.',
  example: '\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [];
    if (level === 2) {
      const a = chasles(rng, items, 0);
      return { title: 'Relation de Chasles.', steps: [a.step], solution: a.sol, answer: m(`${a.disp} = ${a.ans}`), key: `c|${a.key}`, data: { kind: 'js', items } };
    }
    const ls = rng.shuffle(LETTERS.filter((x) => x !== 'O')).slice(0, 4);
    const L: Record<string, string> = { A: ls[0], B: ls[1], C: ls[2], D: ls[3], O: 'O' };
    // coordonnées (repère) : A, B, D, puis C = B + D − A, O milieu de [AC]
    const A: Pt = [0, rng.int(0, 1)], B: Pt = [rng.int(5, 6), 0], D: Pt = [rng.int(1, 3), rng.int(4, 5)];
    const C: Pt = [B[0] + D[0] - A[0], B[1] + D[1] - A[1]], O: Pt = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
    const P: Record<string, Pt> = { [L.A]: A, [L.B]: B, [L.C]: C, [L.D]: D, O };
    const kinds = rng.shuffle(Object.keys(PQS)).slice(0, 2);
    const steps: Step[] = [], sol: Rich[] = [], answers: string[] = [];
    kinds.forEach((k, i) => {
      const pq = PQS[k];
      const good = pq.good(L);
      const c = choice(rng, good, pq.bad(L));
      items.push({ what: `step:${i}`, js: k === 'oppose' ? jsIndex(P, [L.B + L.O], c.options) : jsIndex(P, pq.terms(L), c.options), expect: c.answer.kind === 'choice' ? c.answer.correct : -1 });
      steps.push({ prompt: `${'ab'[i]}) ${pq.prompt(L)}`, answer: c.answer, hint: k === 'regle' ? 'Dans le parallélogramme, remplace un des deux vecteurs par un vecteur égal qui part de l’extrémité de l’autre.' : 'Même direction, même sens, même longueur : regarde les côtés opposés et les diagonales (qui se coupent en leur milieu).' });
      sol.push(`${'ab'[i]}) ${pq.sol(L)}`);
      answers.push(`${'ab'[i]}) ${vm(good)}`);
    });
    return {
      title: `${m(`${L.A}${L.B}${L.C}${L.D}`)} est un parallélogramme de centre ${m('O')}.`,
      figure: paraFigure(L, P),
      steps, solution: sol, answer: answers.join(' ; '),
      key: `p|${ls.join('')}|${kinds.join(',')}`,
      data: { kind: 'js', items },
    };
  },
};
