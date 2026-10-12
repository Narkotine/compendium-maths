import { getIndex, chapterBySlug } from '../data';
import { getLast, getProgress } from '../store';
import { icon } from '../icons';
import { esc } from '../util';
import { setMarkProvider } from '../nav';

export function renderHome(app: HTMLElement) {
  const idx = getIndex();
  const last = getLast();
  const prog = getProgress();
  const lastCh = last ? chapterBySlug(last.slug) : undefined;
  document.title = 'Maths Collège — cours du collège';

  const resume = lastCh
    ? `<section class="resume" aria-labelledby="resume-h">
        <h2 id="resume-h" class="resume-kicker">Reprendre la lecture</h2>
        <a class="resume-card" href="#/ch/${lastCh.slug}/${esc(last!.id)}" style="--hue:${idx.groups.find((g) => g.id === lastCh.group)?.hue ?? 210}">
          <span class="num-badge" aria-hidden="true">${lastCh.num}</span>
          <span class="resume-text">
            <span class="resume-title">${esc(lastCh.title)}</span>
            <span class="resume-where">${esc(last!.label || 'Début du chapitre')}</span>
            <span class="bar" aria-hidden="true"><span style="width:${Math.round((prog[lastCh.slug] ?? last!.ratio) * 100)}%"></span></span>
          </span>
          <span class="resume-go" aria-hidden="true">${icon('resume')}</span>
        </a>
      </section>`
    : `<section class="welcome">
        <p><strong>Bienvenue !</strong> 17 chapitres de cours du collège, avec schémas, exercices et corrigés. Tout fonctionne aussi sans connexion.</p>
      </section>`;

  const chips = idx.groups
    .map((g) => `<button type="button" class="chip chip--group" data-jump="grp-${g.id}" style="--hue:${g.hue}">${esc(g.title)}</button>`)
    .join('');

  const groups = idx.groups
    .map((g) => {
      const cards = g.chapters
        .map((slug) => {
          const c = chapterBySlug(slug);
          if (!c) return '';
          const p = prog[slug] ?? 0;
          const state = p >= 0.97 ? 'Lu' : p > 0.02 ? `Lu à ${Math.round(p * 100)} %` : '';
          return `<li><a class="ch-card" href="#/ch/${slug}">
              <span class="num-badge" aria-hidden="true">${c.num}</span>
              <span class="ch-card-text">
                <span class="ch-card-title"><span class="sr-only">Chapitre ${c.num} : </span>${esc(c.title)}</span>
                <span class="ch-card-desc">${esc(c.desc)}</span>
                <span class="ch-card-meta">${c.readMin} min · ${c.exercises} exercices${state ? ` · <span class="ch-card-state">${state}</span>` : ''}</span>
                ${p > 0.02 ? `<span class="bar" aria-hidden="true"><span style="width:${Math.round(p * 100)}%"></span></span>` : ''}
              </span>
              ${icon('chevronRight', 'ic ch-card-chev')}
            </a></li>`;
        })
        .join('');
      return `<section class="group" id="grp-${g.id}" style="--hue:${g.hue}" aria-labelledby="grp-${g.id}-h">
          <h2 class="group-title" id="grp-${g.id}-h" tabindex="-1">${esc(g.title)}</h2>
          <ul class="cards">${cards}</ul>
        </section>`;
    })
    .join('');

  app.innerHTML = `
    <div class="page page--home">
      <header class="appbar appbar--home">
        <span class="brand"><img src="icons/favicon.svg" alt="" width="28" height="28"><span>Maths Collège</span></span>
        <a class="icon-btn" href="#/progres" aria-label="Mes progrès">${icon('practice')}</a>
        <button type="button" class="icon-btn" data-act="settings" aria-label="Réglages">${icon('settings')}</button>
      </header>
      <main id="main" tabindex="-1" class="home">
        <h1 class="sr-only">Maths Collège : sommaire des cours</h1>
        <a class="search-entry" href="#/recherche">${icon('search')}<span>Rechercher dans les cours…</span></a>
        ${resume}
        <nav class="group-chips" aria-label="Thèmes">${chips}</nav>
        ${groups}
        <footer class="home-foot">
          <p>Cours ${esc(idx.contentVersion)} · Appli ${esc(idx.version)}. Chaque chapitre va des bases (6e) jusqu’au brevet (3e).</p>
          <p><a href="#/progres">Mes progrès</a></p>
          <p>★ facile · ★★ standard · ★★★ approfondissement</p>
        </footer>
      </main>
    </div>`;

  app.querySelector('.group-chips')!.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-jump]');
    if (!b) return;
    const target = document.getElementById(b.dataset.jump!)!;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    target.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  });
  setMarkProvider(() => ({ y: scrollY }));
}
