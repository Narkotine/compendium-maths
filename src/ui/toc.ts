import type { ChapterMeta, Part } from '../types';
import { esc } from '../util';

export const PART_LABEL: Record<Part, string> = {
  cours: 'Cours',
  exos: 'Exercices',
  corriges: 'Corrigés',
  liens: 'Liens avec les autres chapitres',
  fiche: 'Fiche-synthèse',
};

/** Sommaire d'un chapitre, groupé par partie (Cours, Exercices, Corrigés…). */
export function tocHtml(ch: ChapterMeta) {
  const byPart = new Map<Part, string[]>();
  for (const t of ch.toc) {
    const label = t.html ?? esc(t.title);
    const prog = t.prog ? ` <span class="prog prog--${t.prog.includes('2026') ? '2026' : '2020'}">${esc(t.prog)}</span>` : '';
    const num = t.num ? `<span class="toc-num">${esc(t.num)}</span>` : '';
    const item = `<li><a class="toc-item lvl${t.lvl}" href="#/ch/${ch.slug}/${t.id}" data-id="${t.id}">${num}<span class="toc-text">${label}${prog}</span></a></li>`;
    if (!byPart.has(t.part)) byPart.set(t.part, []);
    byPart.get(t.part)!.push(item);
  }
  let out = '';
  for (const [part, items] of byPart) {
    if (part === 'liens' || part === 'fiche') {
      out += `<ul class="toc-list toc-list--flat">${items.join('')}</ul>`;
      continue;
    }
    out += `<section class="toc-part"><h3 class="toc-part-title">${PART_LABEL[part]}</h3><ul class="toc-list">${items.join('')}</ul></section>`;
  }
  return `<nav class="toc" aria-label="Sommaire du chapitre">${out}</nav>`;
}

/** Surligne la section courante (et sa section parente). */
export function highlightToc(root: ParentNode, id: string | null, parentId: string | null) {
  root.querySelectorAll('.toc-item[aria-current], .toc-item.is-parent').forEach((a) => {
    a.removeAttribute('aria-current');
    a.classList.remove('is-parent');
  });
  if (!id) return null;
  const cur = root.querySelector<HTMLElement>(`.toc-item[data-id="${id}"]`);
  cur?.setAttribute('aria-current', 'location');
  if (parentId && parentId !== id) root.querySelector(`.toc-item[data-id="${parentId}"]`)?.classList.add('is-parent');
  return cur;
}
