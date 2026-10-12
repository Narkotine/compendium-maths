/**
 * Générateur pseudo-aléatoire à graine (mulberry32) : un même exercice se rejoue à l'identique
 * à partir de sa graine, ce qui permet de le partager par l'adresse et de le tester.
 */
export interface Rng {
  /** Réel dans [0, 1[. */
  next(): number;
  /** Entier dans [a, b] (bornes incluses). */
  int(a: number, b: number): number;
  /** Entier dans [a, b] différent des valeurs exclues. */
  intNot(a: number, b: number, ...not: number[]): number;
  /** Entier non nul dans [-b, -a] ∪ [a, b]. */
  signed(a: number, b: number): number;
  pick<T>(xs: readonly T[]): T;
  /** Tirage pondéré : [[valeur, poids], …]. */
  weighted<T>(xs: readonly (readonly [T, number])[]): T;
  chance(p: number): boolean;
  shuffle<T>(xs: readonly T[]): T[];
  /** Graine dérivée (pour des sous-tirages indépendants). */
  fork(tag: string | number): Rng;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange de plusieurs valeurs en une graine 32 bits (FNV-1a puis brassage). */
export function hashSeed(...parts: (string | number)[]): number {
  let h = 0x811c9dc5;
  for (const p of parts) {
    const s = String(p) + '\u0001';
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function makeRng(seed: number): Rng {
  const r = mulberry32(seed);
  const rng: Rng = {
    next: r,
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    intNot(a, b, ...not) {
      const ok: number[] = [];
      for (let i = a; i <= b; i++) if (!not.includes(i)) ok.push(i);
      if (!ok.length) throw new Error('intNot : aucune valeur possible');
      return ok[Math.floor(r() * ok.length)];
    },
    signed: (a, b) => (r() < 0.5 ? -1 : 1) * (a + Math.floor(r() * (b - a + 1))),
    pick: (xs) => xs[Math.floor(r() * xs.length)],
    weighted(xs) {
      const tot = xs.reduce((s, x) => s + x[1], 0);
      let u = r() * tot;
      for (const [v, w] of xs) if ((u -= w) < 0) return v;
      return xs[xs.length - 1][0];
    },
    chance: (p) => r() < p,
    shuffle(xs) {
      const a = [...xs];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    fork: (tag) => makeRng(hashSeed(seed, tag)),
  };
  return rng;
}

/** Graine ↔ texte court pour l'adresse (base 36). */
export const seedToStr = (s: number) => (s >>> 0).toString(36);
export const strToSeed = (s: string | null | undefined): number | null => {
  if (!s || !/^[0-9a-z]{1,7}$/.test(s)) return null;
  const v = parseInt(s, 36);
  return v <= 0xffffffff ? v : null;
};
export const randomSeed = () => {
  const a = new Uint32Array(1);
  (globalThis.crypto ?? { getRandomValues: (x: Uint32Array) => ((x[0] = Math.random() * 2 ** 32), x) }).getRandomValues(a);
  return a[0];
};
