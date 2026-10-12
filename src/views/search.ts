import { loadSearch, getIndex, chapterBySlug } from '../data';
import { icon } from '../icons';
import { esc, fold } from '../util';
import { goUp, replaceHash, setMarkProvider } from '../nav';
import type { SearchEntry } from '../types';

interface Prepared extends SearchEntry {
  ft: string; // titre replié
  fp: string;
  fc: string; // titre du chapitre replié
  fx: string; // texte replié (même longueur que x)
}
let prepared: Prepared[] | null = null;
async function getPrepared() {
  if (prepared) return prepared;
  const raw = await loadSearch();
  prepared = raw.map((e) => {
    const ch = chapterBySlug(e.c);
    return { ...e, ft: fold(e.t), fp: fold(e.p), fc: fold(`${ch?.title ?? ''} ${ch?.short ?? ''}`), fx: fold(e.x) };
  });
  return prepared;
}

const STOP = new Set(['le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'en', 'a', 'l', 'd', 'au', 'aux', 'que', 'qui', 'est', 'on', 'pour', 'par', 'sur', 'dans']);
const PART_W: Record<string, number> = { cours: 1, fiche: 0.9, liens: 0.5, exos: 0.55, corriges: 0.4 };
const PART_TAG: Record<string, string> = { cours: '', fiche: 'Fiche', liens: 'Liens', exos: 'Exercices', corriges: 'Corrigé' };
const SUGGEST = ['hypoténuse', 'pourcentage', 'médiane', 'équation', 'fraction', 'volume', 'cosinus', 'probabilité', 'développer', 'échelle'];

function terms(q: string) {
  return fold(q)
    .split(/[^a-z0-9œæ'²³]+/i)
    .map((t) => t.replace(/^'+|'+$/g, ''))
    .filter((t) => t && (t.length > 1 || /\d/.test(t)) && !STOP.has(t));
}

function count(hay: string, t: string, cap = 6) {
  let n = 0, i = 0;
  while (n < cap && (i = hay.indexOf(t, i)) !== -1) {
    n++;
    i += t.length;
  }
  return n;
}
const wordStart = (hay: string, t: string) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(hay);

export function runSearch(all: Prepared[], q: string) {
  const ts = terms(q);
  if (!ts.length) return { ts, hits: [] as { e: Prepared; s: number }[], chapters: [] as string[] };
  const hits: { e: Prepared; s: number }[] = [];
  for (const e of all) {
    let s = 0, ok = true;
    for (const t of ts) {
      const inT = e.ft.includes(t), inP = e.fp.includes(t), inC = e.fc.includes(t);
      const nx = count(e.fx, t);
      if (!inT && !inP && !inC && !nx) {
        ok = false;
        break;
      }
      s += (inT ? 12 + (wordStart(e.ft, t) ? 6 : 0) : 0) + (inP ? 3 : 0) + (inC ? 4 : 0) + nx * (wordStart(e.fx, t) ? 1.5 : 0.8);
    }
    if (ok) hits.push({ e, s: s * (PART_W[e.k] ?? 1) });
  }
  hits.sort((a, b) => b.s - a.s);
  const chapters = getIndex()
    .chapters.filter((c) => ts.every((t) => fold(`${c.title} ${c.short} ${c.desc}`).includes(t)))
    .map((c) => c.slug);
  return { ts, hits: hits.slice(0, 80), chapters };
}

function snippet(e: Prepared, ts: string[]) {
  const x = e.x;
  if (!x) return '';
  let pos = -1;
  for (const t of ts) {
    const i = e.fx.indexOf(t);
    if (i !== -1 && (pos === -1 || i < pos)) pos = i;
  }
  const start = Math.max(0, pos === -1 ? 0 : x.lastIndexOf(' ', Math.max(0, pos - 50)) + 1);
  const end = Math.min(x.length, start + 170);
  const seg = x.slice(start, end), fseg = e.fx.slice(start, end);
  // surlignage
  const marks: [number, number][] = [];
  for (const t of ts) {
    let i = 0;
    while ((i = fseg.indexOf(t, i)) !== -1) {
      marks.push([i, i + t.length]);
      i += t.length;
    }
  }
  marks.sort((a, b) => a[0] - b[0]);
  let out = '', cur = 0;
  for (const [a, b] of marks) {
    if (a < cur) continue;
    out += esc(seg.slice(cur, a)) + '<mark>' + esc(seg.slice(a, b)) + '</mark>';
    cur = b;
  }
  out += esc(seg.slice(cur));
  return (start > 0 ? '… ' : '') + out + (end < x.length ? ' …' : '');
}
function hl(text: string, ts: string[]) {
  const f = fold(text);
  let out = '', cur = 0;
  const marks: [number, number][] = [];
  for (const t of ts) {
    let i = 0;
    while ((i = f.indexOf(t, i)) !== -1) {
      marks.push([i, i + t.length]);
      i += t.length;
    }
  }
  marks.sort((a, b) => a[0] - b[0]);
  for (const [a, b] of marks) {
    if (a < cur) continue;
    out += esc(text.slice(cur, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>';
    cur = b;
  }
  return out + esc(text.slice(cur));
}

export function renderSearch(app: HTMLElement, q: string): Promise<void> {
  document.title = 'Rechercher — Maths Collège';
  app.innerHTML = `
    <div class="page page--search">
      <header class="appbar appbar--search">
        <button type="button" class="icon-btn" data-act="up" aria-label="Retour">${icon('back')}</button>
        <form class="search-form" role="search" action="#">
          <label class="sr-only" for="q">Rechercher dans les cours</label>
          <input id="q" class="search-input" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false"
            placeholder="hypoténuse, médiane, 3/4…" value="${esc(q)}" data-autofocus>
          <button type="button" class="icon-btn search-clear" aria-label="Effacer" ${q ? '' : 'hidden'}>${icon('close')}</button>
        </form>
      </header>
      <main id="main" tabindex="-1" class="search-main">
        <h1 class="sr-only">Recherche</h1>
        <p class="search-status" role="status" aria-live="polite"></p>
        <div class="search-results"></div>
      </main>
    </div>`;
  const input = app.querySelector<HTMLInputElement>('#q')!;
  const results = app.querySelector<HTMLElement>('.search-results')!;
  const status = app.querySelector<HTMLElement>('.search-status')!;
  const clear = app.querySelector<HTMLElement>('.search-clear')!;
  app.querySelector('[data-act="up"]')!.addEventListener('click', () => goUp());
  app.querySelector('form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur(); // ferme le clavier
  });

  const showSuggestions = () => {
    status.textContent = '';
    results.innerHTML = `<div class="suggest"><h2 class="suggest-title">Idées de recherche</h2>
      <div class="suggest-chips">${SUGGEST.map((s) => `<button type="button" class="chip" data-q="${s}">${s}</button>`).join('')}</div>
      <p class="suggest-help">La recherche porte sur les titres et le texte des 17 chapitres (cours, exercices, corrigés), même hors connexion.</p></div>`;
  };

  let token = 0;
  const run = async (value: string, updateUrl = true) => {
    const my = ++token;
    clear.hidden = !value;
    if (updateUrl) replaceHash(value ? `#/recherche?q=${encodeURIComponent(value)}` : '#/recherche');
    if (!value.trim()) return showSuggestions();
    let all: Prepared[];
    try {
      all = await getPrepared();
    } catch {
      status.textContent = 'Index de recherche indisponible (connexion ?).';
      return;
    }
    if (my !== token) return;
    const { ts, hits, chapters } = runSearch(all, value);
    if (!ts.length) return showSuggestions();
    status.textContent = hits.length ? `${hits.length >= 80 ? '80+' : hits.length} résultat${hits.length > 1 ? 's' : ''}` : 'Aucun résultat. Essayez un autre mot, sans accent ou au singulier.';
    const chHtml = chapters
      .map((s) => chapterBySlug(s)!)
      .map(
        (c) => `<li><a class="res res--chapter" href="#/ch/${c.slug}"><span class="num-badge" style="--hue:${getIndex().groups.find((g) => g.id === c.group)?.hue}" aria-hidden="true">${c.num}</span>
          <span><span class="res-title">${hl(c.title, ts)}</span><span class="res-snip">${esc(c.desc)}</span></span></a></li>`,
      )
      .join('');
    // regroupe par chapitre en gardant l'ordre de pertinence du meilleur résultat
    const groups = new Map<string, { e: Prepared; s: number }[]>();
    for (const h of hits) {
      if (!groups.has(h.e.c)) groups.set(h.e.c, []);
      groups.get(h.e.c)!.push(h);
    }
    let html = chHtml ? `<ul class="res-list">${chHtml}</ul>` : '';
    for (const [slug, list] of groups) {
      const c = chapterBySlug(slug)!;
      html += `<section class="res-group"><h2 class="res-group-title"><span class="num-badge num-badge--sm" style="--hue:${getIndex().groups.find((g) => g.id === c.group)?.hue}" aria-hidden="true">${c.num}</span>${esc(c.title)}</h2><ul class="res-list">`;
      for (const { e } of list.slice(0, 8)) {
        const tag = PART_TAG[e.k];
        const where = e.p ? `<span class="res-where">${esc(e.p)}</span>` : '';
        html += `<li><a class="res" href="#/ch/${slug}/${e.id}">
            <span class="res-head">${tag ? `<span class="tag tag--${e.k}">${tag}</span>` : ''}<span class="res-title">${e.n ? `<span class="res-num">${esc(e.n)}</span> ` : ''}${hl(e.t, ts)}</span></span>
            ${where}<span class="res-snip">${snippet(e, ts)}</span></a></li>`;
      }
      if (list.length > 8) html += `<li class="res-more">+ ${list.length - 8} autre${list.length - 8 > 1 ? 's' : ''} passage${list.length - 8 > 1 ? 's' : ''} dans ce chapitre</li>`;
      html += '</ul></section>';
    }
    results.innerHTML = html;
  };
  let deb: number | undefined;
  input.addEventListener('input', () => {
    clearTimeout(deb);
    deb = window.setTimeout(() => run(input.value), 140);
  });
  clear.addEventListener('click', () => {
    input.value = '';
    run('');
    input.focus();
  });
  results.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-q]');
    if (b) {
      input.value = b.dataset.q!;
      run(input.value);
    }
  });
  const ready = run(q, false);
  if (!q) requestAnimationFrame(() => input.focus());
  setMarkProvider(() => ({ y: scrollY }));
  return ready;
}
