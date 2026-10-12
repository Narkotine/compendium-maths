/** Fabrique d'une étape « ranger » (cartes à glisser). */
import { type Q, eq, cmp } from './q';
import type { Rng } from './rng';
import type { Rich, Step } from './types';

export interface Card { tex: string; v: Q }
const sortedOk = (vs: Q[], s: number) => vs.every((v, k) => k === 0 || s * cmp(vs[k - 1], v) <= 0);

/**
 * Mélange les cartes : jamais déjà rangées, ni rangées à l'envers ; les erreurs typiques qui coïncident
 * avec une bonne réponse sont écartées ; « why(a, b) » explique une paire (cartes d'origine) sans la trancher.
 */
export function orderStep(
  rng: Rng,
  o: { cards: Card[]; dir: 'asc' | 'desc'; prompt?: Rich; hint: Rich; why: (a: Card, b: Card) => Rich | null; mistakes?: [Q[] | null, Rich][] },
): Step {
  const n = o.cards.length, s = o.dir === 'asc' ? 1 : -1;
  let cs: Card[] = [];
  for (let t = 0; t < 200; t++) {
    cs = rng.shuffle(o.cards);
    const vs = cs.map((c) => c.v);
    if (!sortedOk(vs, s) && !sortedOk(vs, -s)) break;
  }
  const why: Record<string, Rich> = {};
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (eq(cs[i].v, cs[j].v)) continue;
    const w = o.why(cs[i], cs[j]);
    if (w) why[`${i}-${j}`] = w;
  }
  const seen: Q[][] = [];
  const mistakes = (o.mistakes ?? [])
    .filter(([vs]) => vs && vs.length === n && !sortedOk(vs, s))
    .filter(([vs]) => !seen.some((w) => w.every((x, k) => eq(x, vs![k]))) && !!seen.push(vs!))
    .map(([vs, msg]) => ({ on: 'order' as const, values: vs!, msg }));
  return {
    prompt: o.prompt ?? '',
    answer: { kind: 'order', items: cs.map((c) => c.tex), values: cs.map((c) => c.v), dir: o.dir, why },
    hint: o.hint,
    mistakes,
  };
}
/** Valeurs rangées. */
export const ranked = (cards: Card[], dir: 'asc' | 'desc') => [...cards].sort((a, b) => (dir === 'asc' ? 1 : -1) * cmp(a.v, b.v)).map((c) => c.v);
/** Chaîne TeX « a < b = c < d ». */
export const chainTex = (cards: Card[], dir: 'asc' | 'desc') => {
  const r = [...cards].sort((a, b) => (dir === 'asc' ? 1 : -1) * cmp(a.v, b.v));
  return r.map((c, k) => (k === 0 ? c.tex : `${eq(r[k - 1].v, c.v) ? '=' : dir === 'asc' ? '<' : '>'} ${c.tex}`)).join(' ');
};
