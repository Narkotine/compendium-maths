/**
 * Suivi local de l'entraînement (localStorage « mc.practice ») : réussite par type, dernières séries,
 * préférences (clavier, niveau). Rien ne quitte l'appareil. Module léger (pas de KaTeX) : il est aussi
 * utilisé par les réglages.
 */
export type Result = 'ok' | 'hint' | 'fail';
export interface TypeStat {
  n: number;
  ok: number;
  hint: number;
  fail: number;
  /** derniers résultats, du plus ancien au plus récent : o (du premier coup), h (avec indice), f (échec) */
  recent: string;
  at: number;
}
export interface SeriesStat {
  at: number;
  slug: string;
  types: string;
  level: number;
  n: number;
  ok: number;
  hint: number;
  fail: number;
}
export type KeypadPref = 'auto' | 'on' | 'off';
interface Store {
  v: 1;
  types: Record<string, TypeStat>;
  series: SeriesStat[];
  prefs: { keypad: KeypadPref; level: Record<string, number>; count: number };
}
const KEY = 'compendium-maths.practice';
const empty = (): Store => ({ v: 1, types: {}, series: [], prefs: { keypad: 'auto', level: {}, count: 5 } });

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const s = JSON.parse(raw) as Store;
    if (s.v !== 1) return empty();
    return { ...empty(), ...s, prefs: { ...empty().prefs, ...s.prefs } };
  } catch {
    return empty();
  }
}
function save(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage plein ou désactivé */
  }
}
const CODE: Record<Result, string> = { ok: 'o', hint: 'h', fail: 'f' };

export function recordResult(slug: string, type: string, r: Result) {
  const s = load();
  const k = `${slug}/${type}`;
  const t = s.types[k] ?? { n: 0, ok: 0, hint: 0, fail: 0, recent: '', at: 0 };
  t.n++;
  t[r]++;
  t.recent = (t.recent + CODE[r]).slice(-10);
  t.at = Date.now();
  s.types[k] = t;
  save(s);
}
export function recordSeries(st: SeriesStat) {
  const s = load();
  s.series = [...s.series, st].slice(-30);
  save(s);
}
export const typeStat = (slug: string, type: string): TypeStat | null => load().types[`${slug}/${type}`] ?? null;
export const lastSeries = (slug: string) => load().series.filter((x) => x.slug === slug);

/**
 * Types à retravailler : sur les 6 derniers essais (au moins 2), au moins 40 % d'échecs
 * (un exercice réussi avec indice compte pour un demi-échec).
 */
export function weakTypes(slug: string, ids: string[]): string[] {
  const s = load();
  return ids.filter((id) => {
    const t = s.types[`${slug}/${id}`];
    if (!t) return false;
    const r = t.recent.slice(-6);
    if (r.length < 2) return false;
    const bad = [...r].reduce((acc, c) => acc + (c === 'f' ? 1 : c === 'h' ? 0.5 : 0), 0);
    return bad / r.length >= 0.4;
  });
}

export const getPrefs = () => load().prefs;
export function setPrefs(p: Partial<Store['prefs']>) {
  const s = load();
  s.prefs = { ...s.prefs, ...p };
  save(s);
}
/** Clavier mathématique à l'écran : auto = sur écran tactile (pointeur grossier). */
export function keypadOn(): boolean {
  const k = load().prefs.keypad;
  return k === 'on' || (k === 'auto' && matchMedia('(pointer: coarse)').matches);
}
/** Efface les résultats (garde les préférences). */
export function resetPractice() {
  const s = load();
  save({ ...empty(), prefs: s.prefs });
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith('compendium-maths.serie:')) sessionStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}
export const hasPracticeData = () => {
  const s = load();
  return Object.keys(s.types).length > 0 || s.series.length > 0;
};
/** Tout le suivi, en lecture seule (page « Mes progrès »). */
export const allPractice = (): { types: Record<string, TypeStat>; series: SeriesStat[] } => {
  const s = load();
  return { types: s.types, series: s.series };
};
