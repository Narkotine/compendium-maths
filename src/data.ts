import type { ChapterMeta, ContentIndex, SearchEntry } from './types';

let indexP: Promise<ContentIndex> | null = null;
let index: ContentIndex | null = null;
const chapterCache = new Map<string, Promise<string>>();
let searchP: Promise<SearchEntry[]> | null = null;

/**
 * Contenu : d'abord le cache (service worker), puis, si la réponse manque ou échoue, le réseau sans cache
 * (le paramètre fresh contourne le pré-cache d'une version périmée).
 */
async function fetchOk(url: string) {
  try {
    const r = await fetch(url);
    if (r.ok) return r;
  } catch { /* on tente le réseau */ }
  const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}fresh=${Date.now()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${url} : HTTP ${r.status}`);
  return r;
}

export function loadIndex(): Promise<ContentIndex> {
  indexP ??= fetchOk('content/index.json')
    .then((r) => r.json())
    .then((j: ContentIndex) => (index = j));
  return indexP;
}
export const getIndex = () => index!;
export const chapterBySlug = (slug: string): ChapterMeta | undefined => index?.chapters.find((c) => c.slug === slug);
export const chapterByNum = (n: number): ChapterMeta | undefined => index?.chapters.find((c) => c.num === n);
export const groupOf = (c: ChapterMeta) => index?.groups.find((g) => g.id === c.group);

export function loadChapterHtml(slug: string): Promise<string> {
  let p = chapterCache.get(slug);
  if (!p) {
    p = fetchOk(`content/chapters/${slug}.html`).then((r) => r.text());
    p.catch(() => chapterCache.delete(slug));
    chapterCache.set(slug, p);
    if (chapterCache.size > 4) chapterCache.delete(chapterCache.keys().next().value!);
  }
  return p;
}

export function loadSearch(): Promise<SearchEntry[]> {
  searchP ??= fetchOk('content/search.json').then((r) => r.json());
  searchP.catch(() => (searchP = null));
  return searchP;
}
