/** Réglages et progression de lecture, persistés dans localStorage. */
export type Theme = 'auto' | 'light' | 'dark';
export interface Settings {
  theme: Theme;
  /** 0 = petit, 1 = normal, 2 = grand, 3 = très grand */
  size: number;
  /** Corrigés dépliés d'office dans la partie « Corrigés ». */
  openCor: boolean;
  /** Calculatrice proposée dans les exercices (sauf types où le calcul est l'objet de l'exercice). */
  calc: boolean;
}
export interface LastRead {
  slug: string;
  id: string; // section courante
  label: string; // « 3.7 Méthode en 4 étapes »
  ratio: number; // 0..1
  at: number;
}

const KEY_SETTINGS = 'compendium-maths.settings';
const KEY_LAST = 'compendium-maths.last';
const KEY_PROGRESS = 'compendium-maths.progress';

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? { ...fallback, ...JSON.parse(v) } : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage plein ou désactivé : on ignore */
  }
}

const listeners = new Set<(s: Settings) => void>();
let settings: Settings = read<Settings>(KEY_SETTINGS, { theme: 'auto', size: 1, openCor: false, calc: true });

export const getSettings = () => settings;
export function setSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  write(KEY_SETTINGS, settings);
  applySettings();
  listeners.forEach((l) => l(settings));
}
export function onSettings(fn: (s: Settings) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const darkMq = matchMedia('(prefers-color-scheme: dark)');
export function isDark() {
  return settings.theme === 'dark' || (settings.theme === 'auto' && darkMq.matches);
}
export function applySettings() {
  const d = document.documentElement;
  d.dataset.theme = settings.theme;
  d.dataset.size = String(settings.size);
  const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');
  if (meta) meta.content = isDark() ? '#16191d' : '#f7f6f2';
}
darkMq.addEventListener?.('change', applySettings);

export const getLast = (): LastRead | null => {
  const v = read<LastRead | null>(KEY_LAST, null);
  return v && v.slug ? v : null;
};
export const setLast = (v: LastRead) => write(KEY_LAST, v);

export const getProgress = (): Record<string, number> => read<Record<string, number>>(KEY_PROGRESS, {});
export function bumpProgress(slug: string, ratio: number) {
  const p = getProgress();
  if ((p[slug] || 0) < ratio - 0.005) {
    p[slug] = Math.min(1, Math.round(ratio * 100) / 100);
    write(KEY_PROGRESS, p);
  }
}
export function resetProgress() {
  try {
    localStorage.removeItem(KEY_LAST);
    localStorage.removeItem(KEY_PROGRESS);
  } catch {
    /* ignore */
  }
}
