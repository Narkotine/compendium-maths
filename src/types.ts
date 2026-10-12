export type Part = 'cours' | 'exos' | 'corriges' | 'liens' | 'fiche';

export interface TocEntry {
  id: string;
  lvl: 2 | 3;
  num: string;
  title: string;
  /** Titre avec formules pré-rendues (si le titre contient du KaTeX). */
  html?: string;
  part: Part;
}

/** Exercices générés (« S'entraîner ») : actif pour les chapitres qui le déclarent. */
export interface PracticeMeta {
  enabled: boolean;
  /** Identifiants des générateurs (voir src/practice/registry.ts). */
  generators: string[];
}

export interface ChapterMeta {
  slug: string;
  num: number;
  title: string;
  short: string;
  desc: string;
  group: string | null;
  readMin: number;
  words: number;
  exercises: number;
  figures: number;
  prereqs: number[];
  parts: Partial<Record<Part, string>>;
  toc: TocEntry[];
  practice: PracticeMeta | null;
}

export interface Group {
  id: string;
  title: string;
  hue: number;
  chapters: string[];
}

export interface ContentIndex {
  version: string;
  contentVersion: string;
  builtAt: string;
  appName: string;
  groups: Group[];
  chapters: ChapterMeta[];
}

/** Une entrée de l'index de recherche = une section (h3, ou h2 sans h3). */
export interface SearchEntry {
  c: string; // slug du chapitre
  id: string; // id de la section
  n: string; // numéro (3.7, B…)
  t: string; // titre
  p: string; // titre de la section parente
  k: string; // partie (cours, exos, corriges…)
  x: string; // texte brut
}
