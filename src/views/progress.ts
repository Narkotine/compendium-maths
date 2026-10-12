/**
 * « Mes progrès » : lecture et entraînement, chapitre par chapitre. Tout vient du stockage local
 * (mc.progress pour la lecture, mc.practice pour les exercices) ; rien ne quitte l'appareil.
 */
import { getIndex, chapterBySlug } from '../data';
import { getProgress } from '../store';
import { allPractice, weakTypes } from '../practice/engine/stats';
import { hasPractice, loadChapter } from '../practice/registry';
import { icon } from '../icons';
import { esc } from '../util';

const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);
const fmtDate = (t: number) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(t));

export async function renderProgress(app: HTMLElement) {
  const idx = getIndex();
  const read = getProgress();
  const { types, series } = allPractice();
  document.title = 'Mes progrès — Maths Collège';

  // agrégats par chapitre
  const per: Record<string, { n: number; ok: number; hint: number; fail: number; ids: string[] }> = {};
  for (const [k, t] of Object.entries(types)) {
    const [slug, id] = k.split('/');
    const a = (per[slug] ??= { n: 0, ok: 0, hint: 0, fail: 0, ids: [] });
    a.n += t.n; a.ok += t.ok; a.hint += t.hint; a.fail += t.fail; a.ids.push(id);
  }
  // titres des types (modules chargés à la demande, déjà en cache hors ligne)
  const titles: Record<string, Record<string, string>> = {};
  await Promise.all(
    Object.keys(per).filter(hasPractice).map(async (slug) => {
      try {
        const ch = await loadChapter(slug);
        titles[slug] = Object.fromEntries((ch?.generators ?? []).map((g) => [g.id, g.title]));
      } catch { /* hors ligne sans cache : on affiche l'identifiant */ }
    }),
  );

  const slugs = idx.groups.flatMap((g) => g.chapters);
  const nRead = slugs.filter((s) => (read[s] ?? 0) >= 0.97).length;
  const tot = Object.values(per).reduce((a, p) => ({ n: a.n + p.n, ok: a.ok + p.ok }), { n: 0, ok: 0 });

  const summary = `<section class="pg-sum" aria-label="En bref">
      <div class="pg-kpi"><span class="pg-k">${nRead}<small>/${slugs.length}</small></span><span class="pg-l">chapitres lus</span></div>
      <div class="pg-kpi"><span class="pg-k">${tot.n}</span><span class="pg-l">exercices faits</span></div>
      <div class="pg-kpi"><span class="pg-k">${tot.n ? `${pct(tot.ok, tot.n)}<small> %</small>` : '–'}</span><span class="pg-l">réussis du premier coup</span></div>
    </section>`;

  const groups = idx.groups.map((g) => {
    const rows = g.chapters.map((slug) => {
      const c = chapterBySlug(slug);
      if (!c) return '';
      const r = read[slug] ?? 0;
      const p = per[slug];
      const prac = hasPractice(slug);
      let practiceHtml = '';
      if (p) {
        const weak = weakTypes(slug, p.ids);
        const tt = titles[slug] ?? {};
        practiceHtml = `<p class="pg-line">${p.n} exercice${p.n > 1 ? 's' : ''} · <strong>${pct(p.ok, p.n)} %</strong> du premier coup · ${pct(p.hint, p.n)} % avec indice · ${pct(p.fail, p.n)} % non réussis</p>
          <span class="pg-stack" aria-hidden="true"><span class="ok" style="width:${pct(p.ok, p.n)}%"></span><span class="hint" style="width:${pct(p.hint, p.n)}%"></span><span class="fail" style="width:${pct(p.fail, p.n)}%"></span></span>
          ${weak.length ? `<p class="pg-weak">À retravailler : ${weak.map((id) => esc(tt[id] ?? id)).join(' · ')}</p>` : ''}`;
      } else if (prac) practiceHtml = `<p class="pg-line pg-muted">Pas encore d’exercice fait.</p>`;
      const state = r >= 0.97 ? 'Lu' : r > 0.02 ? `Lu à ${Math.round(r * 100)} %` : 'Pas commencé';
      return `<li class="pg-ch" data-slug="${slug}">
          <div class="pg-head"><span class="num-badge" aria-hidden="true">${c.num}</span>
            <a class="pg-title" href="#/ch/${slug}"><span class="sr-only">Chapitre ${c.num} : </span>${esc(c.title)}</a></div>
          <p class="pg-line">Cours : ${state}</p>
          <span class="bar" aria-hidden="true"><span style="width:${Math.round(r * 100)}%"></span></span>
          ${practiceHtml}
          ${prac ? `<a class="btn pg-go" href="#/entrainement/${slug}">${icon('practice')}<span>S’entraîner</span></a>` : ''}
        </li>`;
    }).join('');
    return `<section class="group" style="--hue:${g.hue}" aria-labelledby="pg-${g.id}"><h2 class="group-title" id="pg-${g.id}">${esc(g.title)}</h2><ul class="pg-list">${rows}</ul></section>`;
  }).join('');

  const recent = series.slice(-8).reverse();
  const recentHtml = recent.length
    ? `<section class="group" aria-labelledby="pg-rec"><h2 class="group-title" id="pg-rec">Dernières séries</h2><ul class="pg-series">${recent
        .map((s) => {
          const c = chapterBySlug(s.slug);
          return `<li><span>${esc(c ? `${c.num}. ${c.short}` : s.slug)} · ${'★'.repeat(s.level)}</span><span>${s.ok}/${s.n} du premier coup</span><time>${fmtDate(s.at)}</time></li>`;
        }).join('')}</ul></section>`
    : '';

  app.innerHTML = `
    <div class="page page--progress">
      <header class="appbar">
        <a class="icon-btn" href="#/" aria-label="Retour au sommaire">${icon('back')}</a>
        <span class="appbar-title"><span class="t1">Mes progrès</span><span class="t2">Lecture et entraînement</span></span>
      </header>
      <main id="main" tabindex="-1" class="narrow">
        <h1 class="sr-only">Mes progrès</h1>
        ${summary}
        ${tot.n === 0 && nRead === 0 ? '<p class="pg-muted">Rien encore ici : lis un chapitre ou fais une série d’exercices, ta progression s’affichera sur cette page.</p>' : ''}
        ${recentHtml}
        ${groups}
        <p class="pg-muted pg-foot">Ces données restent sur cet appareil. Pour les effacer : Réglages.</p>
      </main>
    </div>`;
}
