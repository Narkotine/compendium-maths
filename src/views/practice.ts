/**
 * « S'entraîner » : choix du type et du niveau, séries d'exercices générés, exercice seul, bilan.
 * Module chargé à la demande (avec KaTeX) : la lecture des cours n'en paie pas le poids.
 */
import '../styles/practice.css';
import { chapterBySlug, groupOf } from '../data';
import { icon } from '../icons';
import { esc } from '../util';
import { goUp, navigate, replaceHash, setLeaveGuard, rearmGuard, releaseGuard, leaveGuarded, replaceGuarded, type HState } from '../nav';
import { loadChapter } from '../practice/registry';
import { loadKatex, rich, tex } from '../practice/engine/render';
import { buildSeries, generate, levelFor, typesAt, seriesHash, exoHash, setupHash, type Item, type SeriesSpec } from '../practice/engine/series';
import { randomSeed, strToSeed } from '../practice/engine/rng';
import { recordResult, recordSeries, typeStat, weakTypes, getPrefs, setPrefs, type Result } from '../practice/engine/stats';
import type { ChapterPractice, Level, Generator, Exercise } from '../practice/engine/types';
import { mountExercise, freshState, type ExoState } from '../practice/ui/exercise';
import { attachKeypad, type KeypadHandle } from '../practice/ui/keypad';
import { renderNotFound } from './notfound';
import { attachCalc, type CalcHandle } from '../practice/ui/calc';
import { calcAllowed } from '../practice/calc/policy';
import { getSettings } from '../store';

type PRoute = { slug: string; mode: 'setup' | 'serie' | 'exo'; params: Record<string, string> };

let cleanup: (() => void) | null = null;
export function leavePractice() {
  cleanup?.();
  cleanup = null;
}

const LEVELS: [Level, string][] = [
  [1, 'Bases'],
  [2, 'Standard'],
  [3, 'Approfondi'],
];
const COUNTS = [5, 8, 10];
const STARS = (n: number) => '★'.repeat(n);
const RES_ICON: Record<Result, string> = { ok: '✓', hint: '◐', fail: '✗' };
const RES_TXT: Record<Result, string> = { ok: 'réussi du premier coup', hint: 'réussi avec un indice', fail: 'à revoir' };

export async function renderPractice(app: HTMLElement, r: PRoute, _how: 'push' | 'pop' | 'init', _st: HState) {
  leavePractice();
  const meta = chapterBySlug(r.slug);
  const at = location.hash;
  const [ch] = await Promise.all([loadChapter(r.slug), loadKatex()]);
  if (location.hash !== at) return; // l'utilisateur est parti pendant le chargement
  if (!meta || !ch || !meta.practice?.enabled) {
    renderNotFound(app);
    return;
  }
  const hue = groupOf(meta)?.hue ?? 210;
  if (r.mode === 'setup') return renderSetup(app, ch, meta.num, meta.short, hue);
  const level = clampLevel(r.params.niv);
  if (r.mode === 'exo') return renderSingle(app, ch, r, level, meta.short, hue);
  return renderSeries(app, ch, r, level, meta.short, hue);
}
const clampLevel = (v: string | undefined): Level => (v === '2' ? 2 : v === '3' ? 3 : 1);

function shell(hue: number, title: string, sub: string, body: string, backLabel: string, extraCls = '') {
  return `
    <div class="page page--practice ${extraCls}" style="--hue:${hue}">
      <header class="appbar">
        <button type="button" class="icon-btn" data-act="back" aria-label="${esc(backLabel)}">${icon('back')}</button>
        <span class="appbar-title"><span class="t1">${esc(title)}</span><span class="t2">${esc(sub)}</span></span>
        <button type="button" class="icon-btn calc-btn" data-act="calc" aria-label="Calculatrice" hidden>${icon('calc')}</button>
        <button type="button" class="icon-btn" data-act="settings" aria-label="Réglages">${icon('settings')}</button>
        <div class="progress" aria-hidden="true"><span></span></div>
      </header>
      <main id="main" tabindex="-1" class="narrow pt-main">${body}</main>
    </div>`;
}

// =================================================================== choix
function renderSetup(app: HTMLElement, ch: ChapterPractice, num: number, short: string, hue: number) {
  document.title = `S’entraîner · ${short} — Maths Collège`;
  const prefs = getPrefs();
  let level = (prefs.level[ch.slug] as Level) || 1;
  let count = COUNTS.includes(prefs.count) ? prefs.count : 5;
  app.innerHTML = shell(
    hue,
    'S’entraîner',
    `Chapitre ${num} · ${short}`,
    `<h1 class="pt-h1">S’entraîner</h1>
     <p class="pt-intro">Des exercices <strong>générés</strong> : les nombres changent à chaque fois. Ta réponse est vérifiée ; en cas d’erreur, un indice, puis un corrigé rédigé comme dans le cours.</p>
     <section class="pt-opts" aria-label="Options de la série">
       <div class="pt-opt"><h2 class="set-title" id="pt-lv">Niveau</h2>
         <div class="segmented pt-levels" role="radiogroup" aria-labelledby="pt-lv">${LEVELS.map(([l, t]) => `<button type="button" class="seg" role="radio" data-level="${l}" aria-checked="${l === level}"><span class="pt-st" aria-hidden="true">${STARS(l)}</span><span>${t}</span></button>`).join('')}</div>
       </div>
       <div class="pt-opt"><h2 class="set-title" id="pt-n">Exercices par série</h2>
         <div class="segmented pt-counts" role="radiogroup" aria-labelledby="pt-n">${COUNTS.map((c) => `<button type="button" class="seg" role="radio" data-count="${c}" aria-checked="${c === count}">${c}</button>`).join('')}</div>
       </div>
     </section>
     <div class="pt-weak-host"></div>
     <h2 class="pt-h2">Choisir un type</h2>
     <div class="pt-list"></div>
     <p class="pt-foot">Les résultats restent sur cet appareil (Réglages › Entraînement pour les effacer).</p>`,
    'Retour au chapitre',
  );
  const root = app.querySelector<HTMLElement>('.page--practice')!;
  const list = root.querySelector<HTMLElement>('.pt-list')!;
  const weakHost = root.querySelector<HTMLElement>('.pt-weak-host')!;
  const start = (types: string) => {
    navigate(seriesHash({ slug: ch.slug, types, level, n: count, seed: randomSeed() }));
  };
  const draw = () => {
    const gens = typesAt(ch, level);
    const card = (g: Generator) => {
      const t = typeStat(ch.slug, g.id);
      const stat = t ? `<span class="pt-stat">${t.ok}/${t.n} du premier coup</span>` : '<span class="pt-stat pt-stat--new">pas encore essayé</span>';
      return `<li class="pt-card">
        <button type="button" class="pt-card-main" data-start="${g.id}">
          <span class="pt-card-title">${rich(g.title)} <span class="pt-card-stars" aria-label="Cours : ${g.stars} étoile${g.stars > 1 ? 's' : ''}">${STARS(g.stars)}</span></span>
          <span class="pt-card-ex" aria-hidden="true">${tex(g.example)}</span>
          <span class="pt-card-desc">${rich(g.desc)}</span>
        </button>
        <div class="pt-card-meta">${stat}<a href="${g.course.href}">Cours</a><a href="${exoHash(ch.slug, g.id, levelFor(g, level), randomSeed())}" data-one="${g.id}">Un seul exercice</a></div>
      </li>`;
    };
    list.innerHTML = `<ul class="pt-cards">
      <li class="pt-card pt-card--mix"><button type="button" class="pt-card-main" data-start="mix">
        <span class="pt-card-title">Série mixte</span>
        <span class="pt-card-desc">Tous les types du niveau ${STARS(level)}, mélangés (${gens.length} types).</span></button></li>
      ${gens.map(card).join('')}</ul>`;
    const weak = weakTypes(ch.slug, gens.map((g) => g.id));
    weakHost.innerHTML = weak.length
      ? `<section class="pt-weak" aria-labelledby="pt-weak-t"><h2 class="pt-h2" id="pt-weak-t">À retravailler</h2>
          <p>D’après tes derniers essais : ${weak.map((id) => `<strong>${rich(ch.generators.find((g) => g.id === id)!.title)}</strong>`).join(', ')}.</p>
          <button type="button" class="btn" data-start="${weak.join(',')}">Série « à retravailler »</button></section>`
      : '';
  };
  draw();
  const onClick = (e: Event) => {
    const t = e.target as Element;
    if (t.closest('[data-act="back"]')) return goUp(`#/ch/${ch.slug}`);
    const lv = t.closest<HTMLElement>('[data-level]');
    if (lv) {
      level = Number(lv.dataset.level) as Level;
      setPrefs({ level: { ...getPrefs().level, [ch.slug]: level } });
      lv.parentElement!.querySelectorAll('[role=radio]').forEach((b) => b.setAttribute('aria-checked', String(b === lv)));
      draw();
    }
    const cn = t.closest<HTMLElement>('[data-count]');
    if (cn) {
      count = Number(cn.dataset.count);
      setPrefs({ count });
      cn.parentElement!.querySelectorAll('[role=radio]').forEach((b) => b.setAttribute('aria-checked', String(b === cn)));
    }
    const st = t.closest<HTMLElement>('[data-start]');
    if (st) start(st.dataset.start!);
  };
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[role=radio]');
    if (!b || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const all = [...b.parentElement!.querySelectorAll<HTMLElement>('[role=radio]')];
    const n = all[(all.indexOf(b) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    n.focus();
    n.click();
    e.preventDefault();
  });
}

// =================================================================== série
interface SerieState {
  items: Item[];
  idx: number;
  results: (Result | null)[];
  exo: ExoState | null;
  recorded: boolean[];
  finished: boolean;
}
const ssKey = (spec: SeriesSpec) => `compendium-maths.serie:${seriesHash(spec)}`;
function loadSS(spec: SeriesSpec): SerieState | null {
  try {
    const v = sessionStorage.getItem(ssKey(spec));
    return v ? (JSON.parse(v) as SerieState) : null;
  } catch {
    return null;
  }
}
function saveSS(spec: SeriesSpec, s: SerieState) {
  try {
    sessionStorage.setItem(ssKey(spec), JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function renderSeries(app: HTMLElement, ch: ChapterPractice, r: PRoute, level: Level, short: string, hue: number) {
  const n = Math.min(20, Math.max(1, Number(r.params.n) || 5));
  const types = r.params.t && /^[a-z0-9,-]+$/.test(r.params.t) ? r.params.t : 'mix';
  let seed = strToSeed(r.params.g);
  if (seed === null) {
    seed = randomSeed();
    replaceHash(seriesHash({ slug: ch.slug, types, level, n, seed }));
  }
  const spec: SeriesSpec = { slug: ch.slug, types, level, n, seed };
  const S: SerieState = loadSS(spec) ?? (() => {
    const items = buildSeries(ch, spec);
    return { items, idx: 0, results: items.map(() => null), exo: null, recorded: items.map(() => false), finished: false };
  })();
  document.title = `Série — S’entraîner · ${short}`;
  app.innerHTML = shell(hue, 'Série', short, `<div class="pt-exo-host"></div><nav class="pt-nav" aria-label="Suite de la série"></nav>`, 'Quitter la série', 'page--serie');
  const root = app.querySelector<HTMLElement>('.page--practice')!;
  const host = root.querySelector<HTMLElement>('.pt-exo-host')!;
  const nav = root.querySelector<HTMLElement>('.pt-nav')!;
  const t1 = root.querySelector<HTMLElement>('.appbar .t1')!, t2 = root.querySelector<HTMLElement>('.appbar .t2')!;
  const bar = root.querySelector<HTMLElement>('.progress > span')!;
  let ctrl: ReturnType<typeof mountExercise> | null = null;
  let kp: KeypadHandle | null = null;
  const cc: CalcHandle = attachCalc(root, { trigDefault: ch.slug.startsWith('13'), enabled: () => getSettings().calc });
  const persist = () => saveSS(spec, S);

  const askLeave = () =>
    confirmDialog({
      title: 'Quitter la série ?',
      text: `Tu en es à l’exercice ${Math.min(S.idx + 1, S.items.length)} sur ${S.items.length}. Les exercices déjà faits sont comptés ; tu pourras reprendre cette série avec le bouton « Suivant » du navigateur.`,
      stay: 'Continuer la série',
      leave: 'Quitter',
    }).then((leave) => {
      if (leave) leaveGuarded(setupHash(ch.slug));
      else rearmGuard();
    });

  const showExercise = (focus: boolean) => {
    const it = S.items[S.idx];
    const g = ch.generators.find((x) => x.id === it.type)!;
    const ex: Exercise = generate(ch, it.type, it.level, it.seed);
    if (!S.exo) S.exo = freshState(ex);
    cc.setExercise(`${seriesHash(spec)}|${S.idx}|${it.seed}`, calcAllowed(ch.slug, it.type));
    t1.textContent = `Série · ${S.idx + 1} / ${S.items.length}`;
    t2.textContent = g.title.replace(/\$/g, '');
    bar.style.transform = `scaleX(${S.idx / S.items.length})`;
    ctrl = mountExercise(host, ex, S.exo, {
      label: `Exercice ${S.idx + 1}${it.bonus ? ' (bonus)' : ''}`,
      gen: g,
      onChange: (st) => {
        S.exo = st;
        persist();
      },
      onDone: (res) => {
        S.results[S.idx] = res;
        if (!S.recorded[S.idx]) {
          recordResult(ch.slug, it.type, res);
          S.recorded[S.idx] = true;
        }
        persist();
        drawNav(true);
      },
    });
    drawNav(false);
    if (S.exo.done) drawNav(true);
    if (focus) ctrl.focusTitle();
  };
  const drawNav = (done: boolean) => {
    if (!done) return void (nav.innerHTML = '');
    const last = S.idx === S.items.length - 1;
    const it = S.items[S.idx];
    nav.innerHTML = `
      <button type="button" class="btn pt-next" data-act="next">${last ? 'Voir le bilan' : 'Exercice suivant'} ${icon('chevronRight')}</button>
      <button type="button" class="btn btn--ghost" data-act="another">Un autre du même type</button>
      <a class="pt-share" href="${exoHash(ch.slug, it.type, it.level, it.seed)}" data-act="share">Lien de cet exercice</a>`;
    nav.querySelector<HTMLElement>('.pt-next')!.focus({ preventScroll: true });
  };
  const next = () => {
    if (S.idx < S.items.length - 1) {
      S.idx++;
      S.exo = null;
      persist();
      showExercise(true);
      window.scrollTo(0, 0);
    } else {
      S.finished = true;
      persist();
      showSummary();
    }
  };
  const another = () => {
    const it = S.items[S.idx];
    const bonus: Item = { type: it.type, level: it.level, seed: randomSeed(), bonus: true };
    S.items.splice(S.idx + 1, 0, bonus);
    S.results.splice(S.idx + 1, 0, null);
    S.recorded.splice(S.idx + 1, 0, false);
    next();
  };

  const showSummary = () => {
    releaseGuard();
    kp?.hide();
    cc.disable();
    bar.style.transform = 'scaleX(1)';
    t1.textContent = 'Bilan de la série';
    t2.textContent = short;
    const res = S.results.map((x) => x ?? 'fail');
    const cnt = { ok: res.filter((x) => x === 'ok').length, hint: res.filter((x) => x === 'hint').length, fail: res.filter((x) => x === 'fail').length };
    if (!(S as SerieState & { saved?: boolean }).saved) {
      recordSeries({ at: Date.now(), slug: ch.slug, types, level, n: res.length, ...cnt });
      (S as SerieState & { saved?: boolean }).saved = true;
      persist();
    }
    const failedTypes = [...new Set(S.items.filter((_, i) => res[i] !== 'ok').map((it) => it.type))];
    const msg = cnt.ok === res.length ? 'Parfait : tout juste du premier coup !' : cnt.ok + cnt.hint === res.length ? 'Tout est juste, parfois avec un indice. Bien joué.' : cnt.fail <= res.length / 3 ? 'Bon travail. Regarde les corrigés des exercices ratés.' : 'Courage : relis la méthode du cours, puis retente une série.';
    host.innerHTML = `
      <section class="pt-summary" aria-labelledby="pt-sum-t">
        <h1 class="pt-h1" id="pt-sum-t" tabindex="-1">Bilan</h1>
        <p class="pt-score"><span class="pt-score-big">${cnt.ok}<small> / ${res.length}</small></span><span>réussis du premier coup</span></p>
        <ul class="pt-counts-list">
          <li class="pt-r--ok"><span aria-hidden="true">${RES_ICON.ok}</span> ${cnt.ok} du premier coup</li>
          <li class="pt-r--hint"><span aria-hidden="true">${RES_ICON.hint}</span> ${cnt.hint} avec indice</li>
          <li class="pt-r--fail"><span aria-hidden="true">${RES_ICON.fail}</span> ${cnt.fail} à revoir</li>
        </ul>
        <p class="pt-msg">${msg}</p>
        <ol class="pt-recap">${S.items
          .map((it, i) => {
            const g = ch.generators.find((x) => x.id === it.type)!;
            const ex = generate(ch, it.type, it.level, it.seed);
            return `<li class="pt-r--${res[i]}"><span class="pt-r-ic" aria-hidden="true">${RES_ICON[res[i]]}</span>
              <span class="pt-r-body"><span class="pt-r-t">${i + 1}. ${rich(g.title)}${it.bonus ? ' (bonus)' : ''} <span class="sr-only">— ${RES_TXT[res[i]]}</span></span>
              ${ex.display ? `<span class="pt-r-a">${tex(ex.display)}</span>` : ''}<span class="pt-r-a">Réponse : ${rich(ex.answer)}</span>
              <a href="${exoHash(ch.slug, it.type, it.level, it.seed)}">Refaire cet exercice</a></span></li>`;
          })
          .join('')}</ol>
        <div class="pt-sum-actions">
          ${failedTypes.length ? `<button type="button" class="btn" data-act="redo" data-types="${failedTypes.join(',')}">Retravailler les types ratés</button>` : ''}
          <button type="button" class="btn ${failedTypes.length ? 'btn--ghost' : ''}" data-act="again">Nouvelle série</button>
          <a class="btn btn--ghost" href="${setupHash(ch.slug)}">Changer de type</a>
          <a class="btn btn--ghost" href="#/ch/${ch.slug}">Revenir au cours</a>
        </div>
      </section>`;
    nav.innerHTML = '';
    host.querySelector<HTMLElement>('#pt-sum-t')!.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  };

  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-act="back"]')) {
      if (S.finished) leaveGuarded(setupHash(ch.slug));
      else askLeave();
      return;
    }
    if (t.closest('[data-act="next"]')) next();
    if (t.closest('[data-act="another"]')) another();
    const redo = t.closest<HTMLElement>('[data-act="redo"]');
    if (redo) replaceGuarded(seriesHash({ ...spec, types: redo.dataset.types!, seed: randomSeed() }));
    if (t.closest('[data-act="again"]')) replaceGuarded(seriesHash({ ...spec, seed: randomSeed() }));
  });
  kp = attachKeypad(root, (inp) => ctrl?.validateFromKeypad(inp));

  persist();
  if (S.finished) {
    showSummary();
  } else {
    setLeaveGuard(askLeave);
    showExercise(false);
  }
  cleanup = () => {
    releaseGuard();
    kp?.destroy();
    cc.destroy();
    closeDialog();
  };
}

// =================================================================== exercice seul
function renderSingle(app: HTMLElement, ch: ChapterPractice, r: PRoute, level: Level, short: string, hue: number) {
  const g = ch.generators.find((x) => x.id === r.params.t);
  if (!g) return void renderNotFound(app);
  let seed = strToSeed(r.params.g);
  const lv = levelFor(g, level);
  if (seed === null) {
    seed = randomSeed();
    replaceHash(exoHash(ch.slug, g.id, lv, seed));
  }
  document.title = `Exercice — S’entraîner · ${short}`;
  app.innerHTML = shell(hue, 'Exercice', short, `<div class="pt-exo-host"></div><nav class="pt-nav" aria-label="Suite"></nav>`, 'Retour aux types d’exercices');
  const root = app.querySelector<HTMLElement>('.page--practice')!;
  const host = root.querySelector<HTMLElement>('.pt-exo-host')!;
  const nav = root.querySelector<HTMLElement>('.pt-nav')!;
  root.querySelector<HTMLElement>('.appbar .t1')!.textContent = g.title.replace(/\$/g, '');
  let ctrl: ReturnType<typeof mountExercise> | null = null;
  const cc = attachCalc(root, { trigDefault: ch.slug.startsWith('13'), enabled: () => getSettings().calc });
  const show = (s: number, focus: boolean) => {
    const ex = generate(ch, g.id, lv, s);
    cc.setExercise(exoHash(ch.slug, g.id, lv, s), calcAllowed(ch.slug, g.id));
    ctrl = mountExercise(host, ex, freshState(ex), {
      label: 'Exercice',
      gen: g,
      onChange: () => {},
      onDone: (res) => {
        recordResult(ch.slug, g.id, res);
        nav.innerHTML = `<button type="button" class="btn pt-next" data-act="another">Un autre ${icon('chevronRight')}</button><a class="btn btn--ghost" href="${setupHash(ch.slug)}">Autres types</a>`;
        nav.querySelector<HTMLElement>('.pt-next')!.focus({ preventScroll: true });
      },
    });
    nav.innerHTML = `<button type="button" class="btn btn--ghost" data-act="another">Un autre exercice de ce type</button>`;
    if (focus) ctrl.focusTitle();
  };
  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-act="back"]')) return goUp(setupHash(ch.slug));
    if (t.closest('[data-act="another"]')) {
      const s = randomSeed();
      replaceHash(exoHash(ch.slug, g.id, lv, s));
      show(s, true);
      window.scrollTo(0, 0);
    }
  });
  const kp = attachKeypad(root, (inp) => ctrl?.validateFromKeypad(inp));
  show(seed, false);
  cleanup = () => {
    kp.destroy();
    cc.destroy();
  };
}

// =================================================================== boîte de confirmation (hors historique)
let dlg: { el: HTMLElement; done: (v: boolean) => void } | null = null;
function closeDialog(v = false) {
  if (!dlg) return;
  const d = dlg;
  dlg = null;
  d.el.remove();
  document.getElementById('app')!.inert = false;
  d.done(v);
}
function confirmDialog(o: { title: string; text: string; stay: string; leave: string }): Promise<boolean> {
  closeDialog();
  return new Promise((resolve) => {
    const opener = document.activeElement as HTMLElement | null;
    const el = document.createElement('div');
    el.className = 'pt-dialog-layer';
    el.innerHTML = `<div class="pt-dialog" role="alertdialog" aria-modal="true" aria-labelledby="pt-dlg-t" aria-describedby="pt-dlg-d">
      <h2 id="pt-dlg-t">${esc(o.title)}</h2><p id="pt-dlg-d">${esc(o.text)}</p>
      <div class="pt-dialog-actions"><button type="button" class="btn" data-v="0">${esc(o.stay)}</button><button type="button" class="btn btn--ghost" data-v="1">${esc(o.leave)}</button></div></div>`;
    document.body.appendChild(el);
    document.getElementById('app')!.inert = true;
    dlg = {
      el,
      done: (v) => {
        if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
        resolve(v);
      },
    };
    el.addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLElement>('[data-v]');
      if (b) closeDialog(b.dataset.v === '1');
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(false);
      }
      if (e.key === 'Tab') {
        const bs = [...el.querySelectorAll<HTMLElement>('button')];
        const i = bs.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        bs[(i + (e.shiftKey ? bs.length - 1 : 1)) % bs.length].focus();
      }
    });
    el.querySelector<HTMLElement>('[data-v="0"]')!.focus();
  });
}
