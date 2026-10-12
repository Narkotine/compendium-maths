import { chapterBySlug, getIndex, groupOf, loadChapterHtml } from '../data';
import { icon } from '../icons';
import { esc, reducedMotion, throttle } from '../util';
import { getMark, goUp, saveScroll, setMarkProvider, overlayOpen, type HState, type ScrollMark } from '../nav';
import { bumpProgress, getSettings, onSettings, setLast } from '../store';
import { openSheet } from '../ui/sheet';
import { tocHtml, highlightToc, PART_LABEL } from '../ui/toc';
import { openViewer } from '../ui/viewer';
import { openSettings } from '../ui/settings';
import { FEATURES } from '../config';
import type { ChapterMeta, Part } from '../types';

interface Current {
  slug: string;
  meta: ChapterMeta;
  root: HTMLElement;
  headings: HTMLElement[];
  anchors: HTMLElement[];
  currentId: string | null;
  currentH2: string | null;
  cleanup: () => void;
}
let cur: Current | null = null;

const QUICK: { part: Part; label: string; ic: string }[] = [
  { part: 'cours', label: 'Cours', ic: 'book' },
  { part: 'exos', label: 'Exercices', ic: 'pencil' },
  { part: 'corriges', label: 'Corrigés', ic: 'check' },
  { part: 'fiche', label: 'Fiche', ic: 'star' },
];

/** Hauteur de la barre du haut (toujours collée en haut de l'écran). */
export const headerH = () => (document.querySelector('.appbar') as HTMLElement | null)?.offsetHeight ?? 56;

export function leaveChapter() {
  // NB : pas de saveScroll() ici — lors d'un « retour », l'historique a déjà changé d'entrée ;
  // la position est enregistrée en continu pendant le défilement et avant chaque navigation.
  if (!cur) return;
  cur.cleanup();
  cur = null;
}
export const currentChapter = () => cur?.slug ?? null;

/** Affiche un chapitre (ou se positionne dans le chapitre déjà affiché). */
export async function renderChapter(app: HTMLElement, slug: string, id: string | null, how: 'push' | 'pop' | 'init', st: HState) {
  const meta = chapterBySlug(slug);
  if (!meta) return false;
  if (cur && cur.slug === slug && document.contains(cur.root)) {
    position(how, id, st, true);
    return true;
  }
  leaveChapter();
  const idx = getIndex();
  const g = groupOf(meta);
  const pos = idx.chapters.findIndex((c) => c.slug === slug);
  const prev = idx.chapters[pos - 1], next = idx.chapters[pos + 1];
  document.title = `${meta.short} — Maths Collège`;

  const prereq = meta.prereqs
    .map((n) => idx.chapters.find((c) => c.num === n))
    .filter(Boolean)
    .map((c) => `<a class="chip chip--ch" href="#/ch/${c!.slug}"><span class="chip-num">${c!.num}</span>${esc(c!.short)}</a>`)
    .join('');
  const quick = QUICK.filter((q) => meta.parts[q.part])
    .map((q) => `<a class="quick-link" href="#/ch/${slug}/${meta.parts[q.part]}" data-part="${q.part}">${icon(q.ic)}<span>${q.label}</span></a>`)
    .join('');
  const hasPractice = FEATURES.practice && !!meta.practice?.enabled;
  const practice = hasPractice ? `<a class="btn btn--practice" href="#/entrainement/${slug}">${icon('practice')}S’entraîner</a>` : '';
  // Visible aussi sur téléphone (l'accès rapide .quick y est masqué)
  const practiceCard = hasPractice
    ? `<a class="practice-card" href="#/entrainement/${slug}">${icon('practice')}<span><strong>S’entraîner</strong><small>Exercices générés, réponse vérifiée, indice puis corrigé</small></span>${icon('chevronRight')}</a>`
    : '';
  const pager = `
    <nav class="pager" aria-label="Chapitres voisins">
      ${prev ? `<a class="pager-link pager-prev" href="#/ch/${prev.slug}">${icon('chevronLeft')}<span><small>Chapitre ${prev.num}</small>${esc(prev.short)}</span></a>` : '<span></span>'}
      ${next ? `<a class="pager-link pager-next" href="#/ch/${next.slug}"><span><small>Chapitre ${next.num}</small>${esc(next.short)}</span>${icon('chevronRight')}</a>` : '<span></span>'}
    </nav>
    <p class="pager-home"><a href="#/">${icon('home')} Tous les chapitres</a></p>`;

  app.innerHTML = `
    <div class="page page--chapter" style="--hue:${g?.hue ?? 210}">
      <header class="appbar appbar--chapter">
        <button type="button" class="icon-btn" data-act="up" aria-label="Retour au sommaire des chapitres">${icon('back')}</button>
        <button type="button" class="appbar-title" data-act="toc" aria-haspopup="dialog">
          <span class="t1">${meta.num} · ${esc(meta.short)}</span><span class="sr-only"> — sommaire</span><span class="t2" aria-hidden="true"></span>
        </button>
        <a class="icon-btn" href="#/recherche" aria-label="Rechercher">${icon('search')}</a>
        <button type="button" class="icon-btn" data-act="settings" aria-label="Réglages">${icon('settings')}</button>
        <div class="progress" aria-hidden="true"><span></span></div>
      </header>
      <div class="chapter-layout">
        <aside class="side" aria-label="Sommaire du chapitre">
          <nav class="side-quick" aria-label="Accès rapide">${quick}</nav>
          <div class="side-toc">${tocHtml(meta)}</div>
        </aside>
        <main id="main" tabindex="-1" class="chapter-main">
          <header class="hero">
            <p class="hero-kicker"><span class="num-badge" aria-hidden="true">${meta.num}</span><span>Chapitre ${meta.num}${g ? ` · ${esc(g.title)}` : ''}</span></p>
            <h1 class="hero-title" tabindex="-1">${esc(meta.title)}</h1>
            <p class="hero-desc">${esc(meta.desc)}</p>
            <ul class="hero-meta">
              <li>≈ ${meta.readMin} min de lecture</li><li>${meta.exercises} exercices corrigés</li><li>${meta.figures} figures</li>
            </ul>
            ${prereq ? `<div class="hero-prereq"><span class="hero-prereq-label">À revoir avant :</span>${prereq}</div>` : ''}
            <nav class="quick" aria-label="Accès rapide">${quick}${practice}</nav>
            ${practiceCard}
          </header>
          <article class="prose" aria-busy="true"><p class="loading">Chargement du chapitre…</p></article>
          ${pager}
        </main>
      </div>
      <nav class="bottombar" aria-label="Navigation dans le chapitre">
        <button type="button" class="bb-item" data-act="toc">${icon('toc')}<span>Sommaire</span></button>
        ${QUICK.filter((q) => meta.parts[q.part])
          .map((q) => `<a class="bb-item" href="#/ch/${slug}/${meta.parts[q.part]}" data-part="${q.part}">${icon(q.ic)}<span>${q.label}</span></a>`)
          .join('')}
      </nav>
      <button type="button" class="fab-top" data-act="top" aria-label="Revenir en haut du chapitre" hidden>${icon('up')}</button>
    </div>`;

  const root = app.querySelector<HTMLElement>('.page--chapter')!;
  const article = root.querySelector<HTMLElement>('article.prose')!;
  let html: string;
  try {
    html = await loadChapterHtml(slug);
  } catch {
    article.innerHTML = `<div class="error-box"><p><strong>Impossible de charger ce chapitre.</strong></p><p>Vérifiez la connexion, puis réessayez. Une fois chargée une première fois, l’appli fonctionne hors ligne.</p><p><button type="button" class="btn" data-act="retry">Réessayer</button></p></div>`;
    article.querySelector('[data-act=retry]')!.addEventListener('click', () => renderChapter(app, slug, id, how, st));
    return true;
  }
  if (!document.contains(root)) return true; // l'utilisateur est parti entre-temps
  article.innerHTML = html;
  article.removeAttribute('aria-busy');
  if (hasPractice && meta.parts.exos) {
    const h = article.querySelector<HTMLElement>(`[id="${meta.parts.exos}"]`);
    h?.insertAdjacentHTML(
      'afterend',
      `<aside class="practice-banner" aria-label="Entraînement"><p>Envie d’autres exercices, avec des nombres différents à chaque fois et une réponse vérifiée&nbsp;?</p><a class="btn" href="#/entrainement/${slug}">${icon('practice')}S’entraîner</a></aside>`,
    );
  }
  // Les « Mini-synthèse » sont des encadrés « À retenir » : on garde tels quels.
  const headings = [...article.querySelectorAll<HTMLElement>('h2, h3')];
  const anchors = [...article.querySelectorAll<HTMLElement>('h2, h3, .exo, details.corrige, figure.fig')].filter((a) => a.id || a.tagName === 'FIGURE');
  anchors.forEach((a, i) => !a.id && (a.id = `fig-${i}`));

  let openCor = getSettings().openCor;
  let size = getSettings().size;
  // Formules en ligne trop larges pour l'écran → bloc défilant (au lieu de déborder de la page)
  // Seules les formules longues (source TeX > 24 caractères) peuvent déborder : on ne mesure qu'elles.
  const longMath = (scope: ParentNode) =>
    [...scope.querySelectorAll<HTMLElement>('.katex')].filter(
      (k) => !k.closest('.katex-display, .table-wrap') && (k.querySelector('annotation')?.textContent?.length ?? 0) > 24,
    );
  // Une formule coupée sur plusieurs lignes peut encore avoir un morceau insécable plus large que la colonne :
  // on mesure chaque ligne (getClientRects) et le bord droit, pas seulement la largeur totale.
  const tooWide = (k: HTMLElement, left: number, max: number) => {
    if (k.offsetWidth > max - 2) return true;
    for (const r of k.getClientRects()) if (r.width > max - 2 || r.right > left + max + 1) return true;
    return false;
  };
  const fitMath = (list: HTMLElement[] = longMath(article)) => {
    const max = article.clientWidth;
    const left = article.getBoundingClientRect().left;
    for (const k of list) k.classList.remove('katex--wide');
    const wide = list.filter((k) => k.offsetParent && tooWide(k, left, max));
    wide.forEach((k) => k.classList.add('katex--wide'));
  };
  const applyCor = () => article.querySelectorAll<HTMLDetailsElement>('details.corrige').forEach((d) => (d.open = openCor));
  applyCor();
  fitMath();
  // Corrigé déplié à la main : ses formules n'avaient pas de largeur mesurable tant qu'il était fermé.
  article.addEventListener('toggle', (e) => {
    const d = e.target as HTMLDetailsElement;
    if (d.open) fitMath(longMath(d));
  }, true);
  // Réglages modifiés pendant la lecture : on garde le même passage à l'écran.
  let keepMark: ScrollMark | null = null;
  const offSettings = onSettings((s) => {
    if (s.openCor !== openCor) {
      openCor = s.openCor;
      applyCor();
      fitMath();
    }
    if (s.size !== size) {
      size = s.size;
      fitMath();
      if (keepMark) restoreMark(keepMark);
    }
  });

  // ------------------------------------------------ interactions
  const onClick = (e: Event) => {
    const t = e.target as Element;
    const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'up') return goUp();
    if (act === 'toc') return openToc();
    if (act === 'settings') return openSettings();
    if (act === 'top') {
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
      root.querySelector<HTMLElement>('.hero-title')?.focus({ preventScroll: true });
      return;
    }
    const zoom = t.closest<HTMLElement>('.fig-zoom');
    if (zoom) {
      const img = zoom.querySelector('img')!;
      return openViewer(zoom.dataset.src!, +zoom.dataset.w!, +zoom.dataset.h!, img.alt);
    }
    const tog = t.closest<HTMLButtonElement>('.cor-toggle');
    if (tog) return toggleInline(tog);
  };
  root.addEventListener('click', onClick);

  function toggleInline(btn: HTMLButtonElement) {
    const code = btn.dataset.cor!;
    const panel = document.getElementById(`ci-${code}`)!;
    if (!panel.childElementCount) {
      const src = document.querySelector(`#cor-${code} .cor-body`);
      panel.innerHTML = `<p class="ci-label">${icon('check')}Corrigé ${esc(code)}</p>`;
      src?.childNodes.forEach((n) => {
        if (n instanceof HTMLElement && n.classList.contains('cor-back')) return;
        const c = n.cloneNode(true);
        if (c instanceof HTMLElement) c.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
        panel.appendChild(c);
      });
    }
    const open = panel.hidden;
    panel.hidden = !open;
    if (open) fitMath(longMath(panel));
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Masquer le corrigé' : 'Voir le corrigé';
    if (!open) {
      // si le haut de l'exercice est sorti de l'écran, on y revient
      const ex = btn.closest('.exo') as HTMLElement;
      if (ex.getBoundingClientRect().top < headerH()) window.scrollTo({ top: ex.getBoundingClientRect().top + scrollY - headerH() - 8 });
    }
  }

  function openToc() {
    openSheet({
      id: 'toc',
      title: `${meta!.num} · ${meta!.title}`,
      className: 'sheet--toc',
      build(body) {
        body.innerHTML = tocHtml(meta!);
        highlightToc(body, c.currentId, c.currentH2);
      },
      onOpen({ body }) {
        const a = body.querySelector<HTMLElement>('[aria-current]');
        if (a) body.scrollTop = a.offsetTop - body.clientHeight / 3;
      },
    });
  }

  // ------------------------------------------------ défilement : progression, section courante
  const bar = root.querySelector<HTMLElement>('.progress > span')!;
  const t2 = root.querySelector<HTMLElement>('.appbar .t2')!;
  const fab = root.querySelector<HTMLElement>('.fab-top')!;
  const side = root.querySelector<HTMLElement>('.side-toc')!;
  const partEls = [...root.querySelectorAll<HTMLElement>('[data-part]')].filter((e) => e.matches('.bb-item, .quick-link'));
  const tocById = new Map(meta.toc.map((t) => [t.id, t]));
  let lastSaved = 0;

  const saveLast = throttle((ratio: number) => {
    if (cur !== c) return;
    if (!c.currentId && ratio < 0.01) return;
    const t = c.currentId ? tocById.get(c.currentId) : null;
    setLast({ slug, id: c.currentId ?? '', label: t ? `${t.num ? t.num + ' ' : ''}${t.title}` : 'Début du chapitre', ratio, at: Date.now() });
    bumpProgress(slug, ratio);
  }, 800);
  const saveMark = throttle(() => {
    if (cur !== c || overlayOpen()) return;
    saveScroll();
    keepMark = markOf();
  }, 250);

  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
    const hh = headerH() + 24;
    let curH: HTMLElement | null = null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= hh) curH = h;
      else break;
    }
    const id = curH?.id ?? null;
    if (id !== c.currentId) {
      c.currentId = id;
      const t = id ? tocById.get(id) : null;
      let h2 = id;
      if (t && t.lvl === 3) {
        const i = meta.toc.indexOf(t);
        for (let j = i; j >= 0; j--) if (meta.toc[j].lvl === 2) { h2 = meta.toc[j].id; break; }
      }
      c.currentH2 = h2;
      const t2e = h2 ? tocById.get(h2) : null;
      t2.textContent = t2e ? `${t2e.num ? t2e.num + '. ' : ''}${t2e.title}` : '';
      const part = t2e?.part ?? null;
      partEls.forEach((e) => (e.dataset.part === part ? e.setAttribute('aria-current', 'true') : e.removeAttribute('aria-current')));
      const a = highlightToc(side, id, h2);
      if (a && side.offsetParent) {
        const box = side.getBoundingClientRect(), r = a.getBoundingClientRect();
        if (r.top < box.top + 40 || r.bottom > box.bottom - 40) side.scrollTop += r.top - box.top - box.height / 3;
      }
      const sheetBody = document.querySelector<HTMLElement>('.sheet--toc .sheet-body');
      if (sheetBody) highlightToc(sheetBody, id, h2);
    }
    fab.hidden = scrollY < innerHeight * 1.5;
    if (performance.now() - lastSaved > 300) {
      lastSaved = performance.now();
      saveLast(ratio);
    }
    saveMark();
  };
  let raf = 0;
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(() => ((raf = 0), update()));
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  let lastW = innerWidth;
  const onResize = throttle(() => {
    if (innerWidth !== lastW) {
      lastW = innerWidth;
      fitMath();
    }
  }, 200);
  addEventListener('resize', onResize);

  function markOf(): ScrollMark {
    const hh = headerH() + 4;
    let best: HTMLElement | null = null;
    for (const a of anchors) {
      if (a.getBoundingClientRect().top <= hh) best = a;
      else break;
    }
    return best ? { y: scrollY, anchor: best.id, off: hh - best.getBoundingClientRect().top } : { y: scrollY };
  }
  setMarkProvider(markOf);

  const c: Current = (cur = {
    slug,
    meta,
    root,
    headings,
    anchors,
    currentId: null,
    currentH2: null,
    cleanup() {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      offSettings();
      root.removeEventListener('click', onClick);
    },
  });

  position(how, id, st, false);
  update();
  setTimeout(() => cur === c && (keepMark = markOf()), 1000);
  if (how === 'push' && !id) root.querySelector<HTMLElement>('.hero-title')?.focus({ preventScroll: true });
  return true;
}

// ------------------------------------------------ positionnement
function restoreMark(m: ScrollMark) {
  const hh = headerH() + 4;
  const el = m.anchor ? document.getElementById(m.anchor) : null;
  const y = el ? el.getBoundingClientRect().top + scrollY - hh + (m.off ?? 0) : m.y;
  window.scrollTo({ top: y, behavior: 'auto' });
}

export function scrollToTarget(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return window.scrollTo(0, 0);
  if (el instanceof HTMLDetailsElement) el.open = true;
  const d = el.parentElement?.closest('details');
  if (d) d.open = true;
  const y = el.getBoundingClientRect().top + scrollY - headerH() - 10;
  const far = Math.abs(y - scrollY) > innerHeight * 2.5;
  window.scrollTo({ top: y, behavior: smooth && !far && !reducedMotion() ? 'smooth' : 'auto' });
  if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|DETAILS)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
  const focusEl = el instanceof HTMLDetailsElement ? el.querySelector('summary')! : el;
  (focusEl as HTMLElement).focus({ preventScroll: true });
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 1800);
}

/**
 * Réapplique un positionnement pendant que la mise en page se stabilise (polices KaTeX et texte,
 * images) : maintenant, quand les polices sont prêtes, puis à 150/400/900 ms — sauf si
 * l'utilisateur a commencé à faire défiler entre-temps.
 */
let settleToken = 0;
function settle(fn: () => void) {
  const my = ++settleToken;
  let touched = false;
  const stop = () => (touched = true);
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  evs.forEach((e) => addEventListener(e, stop, { once: true, passive: true }));
  const again = () => !touched && my === settleToken && fn();
  fn();
  document.fonts?.ready.then(again);
  [150, 400, 900].forEach((ms) => setTimeout(again, ms));
  setTimeout(() => evs.forEach((e) => removeEventListener(e, stop)), 1000);
}

function position(how: 'push' | 'pop' | 'init', id: string | null, st: HState, same: boolean) {
  const mark = how !== 'push' ? getMark(st.k) : undefined;
  if (mark) settle(() => restoreMark(mark));
  else if (id) {
    scrollToTarget(id, same);
    if (!same) settle(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - headerH() - 10);
    });
  } else window.scrollTo({ top: 0, behavior: same && !reducedMotion() ? 'smooth' : 'auto' });
}

export { PART_LABEL };
