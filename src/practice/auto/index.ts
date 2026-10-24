/**
 * Automatismes (programme 2026) : questions flash par niveau (5e, 4e, 3e), séances de 10 questions.
 * Les séances « papier » sont FIXES (graines déterministes) : une classe entière peut faire la même
 * séance, imprimée ou en ligne. La séance « au hasard » tire 10 types et de nouveaux nombres.
 */
import type { Exercise, Generator } from '../engine/types';
import { hashSeed, makeRng } from '../engine/rng';
import { SET5 } from './c5';
import { SET4 } from './c4';
import { SET3 } from './c3';

export type Cls = '5e' | '4e' | '3e';
export interface AutoLevel {
  cls: Cls;
  title: string;
  /** Repère : programme en vigueur pour ce niveau. */
  note: string;
  gens: Generator[];
  /** Séances fixes : identifiants des 10 types, dans l'ordre. */
  seances: string[][];
}
/** Durée conseillée d'une séance (minutes) ; le chrono du mode en ligne s'y règle. */
export const MINUTES = 12;
export const PER_SEANCE = 10;

/** Tous les types du niveau sauf ceux nommés (« aires » pour « a4-aires »). */
const without = (gens: Generator[], ...ids: string[]) => gens.map((g) => g.id).filter((id) => !ids.includes(id.slice(3)));

export const LEVELS: AutoLevel[] = [
  {
    cls: '5e', title: 'Cinquième', note: 'Programme 2026 (en vigueur en 5e dès la rentrée 2026).', gens: SET5,
    seances: [
      ['tables', 'dix', 'trou', 'divis', 'ecritures', 'egales', 'comparer', 'part', 'angles', 'propor'],
      ['euclide', 'tables', 'dix', 'quotient', 'ecritures', 'egales', 'comparer', 'part', 'proba', 'motif'],
      ['divis', 'trou', 'dix', 'quotient', 'egales', 'comparer', 'part', 'angles', 'proba', 'propor'],
      ['tables', 'euclide', 'divis', 'trou', 'ecritures', 'quotient', 'part', 'angles', 'motif', 'propor'],
      ['euclide', 'tables', 'dix', 'ecritures', 'egales', 'comparer', 'part', 'angles', 'proba', 'motif'],
      ['divis', 'trou', 'dix', 'quotient', 'ecritures', 'egales', 'comparer', 'proba', 'motif', 'propor'],
    ].map((l) => l.map((x) => `a5-${x}`)),
  },
  {
    cls: '4e', title: 'Quatrième', note: 'Automatismes du programme 2026 de 4e (en vigueur à la rentrée 2027) ; tous figurent aussi au programme 2020.', gens: SET4,
    seances: [
      without(SET4, 'aires', 'stats'), without(SET4, 'double', 'tester'), without(SET4, 'inverse', 'pourcent'),
      without(SET4, 'carres', 'reduire'), without(SET4, 'relatifs', 'fractions'), without(SET4, 'produit', 'equations'),
    ],
  },
  {
    cls: '3e', title: 'Troisième', note: 'Automatismes du programme 2026 de 3e (en vigueur à la rentrée 2028) ; la droite des milieux et le ratio y sont nouveaux.', gens: SET3,
    seances: [
      without(SET3, 'milieux', 'ratio', 'proba'), without(SET3, 'decomp', 'stats', 'evolution'), without(SET3, 'divis', 'developper', 'pythagore'),
      without(SET3, 'puissances', 'simplifier', 'ratio'), without(SET3, 'fractions', 'equations', 'milieux'), without(SET3, 'divis', 'stats', 'proba'),
    ],
  },
];
export const levelOf = (cls: string) => LEVELS.find((l) => l.cls === cls) ?? null;

export interface AutoItem { gen: Generator; seed: number }
/** Séance fixe n° k (1…6). */
export function fixedSeance(L: AutoLevel, k: number): AutoItem[] {
  return L.seances[k - 1].map((id, i) => ({ gen: L.gens.find((g) => g.id === id)!, seed: hashSeed('auto', L.cls, k, i) }));
}
/** Séance au hasard : 10 types tirés (ordre du programme conservé), nombres nouveaux. */
export function randomSeance(L: AutoLevel, seed: number): AutoItem[] {
  const rng = makeRng(seed);
  const pick = new Set(rng.shuffle(L.gens.map((_, i) => i)).slice(0, PER_SEANCE));
  return L.gens.filter((_, i) => pick.has(i)).map((gen, i) => ({ gen, seed: hashSeed('auto-h', L.cls, seed, i) }));
}
export function exerciseOf(L: AutoLevel, it: AutoItem): Exercise {
  return { ...it.gen.generate(makeRng(it.seed), 1), chapter: `auto-${L.cls}`, type: it.gen.id, level: 1, seed: it.seed };
}
