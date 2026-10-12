/**
 * Séries d'exercices : tout est déterminé par (chapitre, types, niveau, nombre, graine).
 * La même adresse redonne la même série ; chaque exercice a sa propre graine (partageable).
 */
import { hashSeed, makeRng, seedToStr } from './rng';
import type { ChapterPractice, Exercise, Generator, Level } from './types';

export interface SeriesSpec {
  slug: string;
  /** « mix » ou liste d'identifiants séparés par des virgules */
  types: string;
  level: Level;
  n: number;
  seed: number;
}
export interface Item {
  type: string;
  level: Level;
  seed: number;
  /** exercice ajouté par « Un autre » */
  bonus?: boolean;
}

/** Niveau effectif d'un type : celui demandé s'il existe, sinon le plus proche. */
export function levelFor(g: Generator, level: Level): Level {
  if (g.levels.includes(level)) return level;
  return [...g.levels].sort((a, b) => Math.abs(a - level) - Math.abs(b - level) || b - a)[0];
}
export const typesAt = (ch: ChapterPractice, level: Level) => ch.generators.filter((g) => g.levels.includes(level));

export function generate(ch: ChapterPractice, type: string, level: Level, seed: number): Exercise {
  const g = ch.generators.find((x) => x.id === type);
  if (!g) throw new Error(`type inconnu : ${type}`);
  const lv = levelFor(g, level);
  const body = g.generate(makeRng(seed), lv);
  return { ...body, chapter: ch.slug, type: g.id, level: lv, seed };
}

/** Liste des exercices d'une série (types mélangés sans répétition consécutive, sans doublon d'énoncé). */
export function buildSeries(ch: ChapterPractice, spec: SeriesSpec): Item[] {
  const rng = makeRng(hashSeed('serie', spec.seed));
  let pool: Generator[] =
    spec.types === 'mix' ? typesAt(ch, spec.level) : spec.types.split(',').map((id) => ch.generators.find((g) => g.id === id)).filter((g): g is Generator => !!g);
  if (!pool.length) pool = typesAt(ch, spec.level);
  if (!pool.length) pool = ch.generators;
  // suite de types : cycles mélangés, sans le même type deux fois de suite (si possible)
  const seq: Generator[] = [];
  while (seq.length < spec.n) {
    const cycle = rng.shuffle(pool);
    if (seq.length && cycle.length > 1 && cycle[0] === seq[seq.length - 1]) cycle.push(cycle.shift()!);
    seq.push(...cycle);
  }
  const items: Item[] = [];
  const keys = new Set<string>();
  seq.slice(0, spec.n).forEach((g, i) => {
    let seed = hashSeed(spec.seed, i);
    const lv = levelFor(g, spec.level);
    for (let tries = 0; tries < 12; tries++) {
      const k = g.generate(makeRng(seed), lv).key;
      if (!keys.has(k)) {
        keys.add(k);
        break;
      }
      seed = hashSeed(spec.seed, i, 'r', tries);
    }
    items.push({ type: g.id, level: lv, seed });
  });
  return items;
}

// ------------------------------------------------------------------ adresses
export const seriesHash = (s: SeriesSpec) => `#/entrainement/${s.slug}/serie?t=${s.types}&niv=${s.level}&n=${s.n}&g=${seedToStr(s.seed)}`;
export const exoHash = (slug: string, type: string, level: Level, seed: number) => `#/entrainement/${slug}/exo?t=${type}&niv=${level}&g=${seedToStr(seed)}`;
export const setupHash = (slug: string) => `#/entrainement/${slug}`;
