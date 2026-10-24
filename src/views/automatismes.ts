/**
 * « Automatismes » (programme 2026) : séances de 10 questions flash par niveau (5e, 4e, 3e).
 *  - version papier : séance fixe, imprimable, corrigé sur une page à part ;
 *  - en ligne : mêmes questions (ou séance au hasard), calculatrice désactivée, chronomètre facultatif,
 *    score final (réussites du premier coup). Rien n'est enregistré dans les statistiques des chapitres.
 * Module chargé à la demande (avec KaTeX et les générateurs).
 */
import '../styles/practice.css';
import '../styles/auto.css';
import { icon } from '../icons';
import { esc } from '../util';
import { goUp, replaceHash, setLeaveGuard, rearmGuard, releaseGuard, leaveGuarded, replaceGuarded } from '../nav';
import { loadKatex, rich, richParas, tex } from '../practice/engine/render';
import { randomSeed, strToSeed, seedToStr } from '../practice/engine/rng';
import type { Exercise, Step } from '../practice/engine/types';
import type { Result } from '../practice/engine/stats';
import { mountExercise, freshState, type ExoState } from '../practice/ui/exercise';
import { attachDock, type DockHandle } from '../practice/ui/dock';
import { LEVELS, levelOf, fixedSeance, randomSeance, exerciseOf, MINUTES, PER_SEANCE, type AutoLevel, type AutoItem } from '../practice/auto/index';
import { renderNotFound } from './notfound';
import { confirmDialog, closeDialog } from './practice';

type ARoute = { cls: string | null; k: string | null; mode: 'index' | 'print' | 'live'; params: Record<string, string> };
const HUE = 160;
const RES_ICON: Record<Result, string> = { ok: '✓', hint: '◐', fail: '✗' };
const RES_TXT: Record<Result, string> = { ok: 'juste du premier coup', hint: 'juste avec un indice', fail: 'à revoir' };

let cleanup: (() => void) | null = null;
export function leaveAuto() {
  cleanup?.();
  cleanup = null;
}

const indexHash = (cls?: string) => `#/automatismes${cls ? `/${cls}` : ''}`;
const printHash = (cls: string, k: string | number, g?: number) => `#/automatismes/${cls}/${k}${g !== undefined ? `?g=${seedToStr(g)}` : ''}`;
const liveHash = (cls: string, k: string | number, chrono: boolean, g?: number) => {
  const q = [chrono ? 'chrono=1' : '', g !== undefined ? `g=${seedToStr(g)}` : ''].filter(Boolean).join('&');
  return `#/automatismes/${cls}/${k}/en-ligne${q ? `?${q}` : ''}`;
};

function shell(title: string, sub: string, body: string, backLabel: string, extra = '') {
  return `
    <div class="page page--practice page--auto ${extra}" style="--hue:${HUE}">
      <header class="appbar">
        <button type="button" class="icon-btn" data-act="back" aria-label="${esc(backLabel)}">${icon('back')}</button>
        <span class="appbar-title"><span class="t1">${esc(title)}</span><span class="t2">${esc(sub)}</span></span>
        <button type="button" class="icon-btn" data-act="settings" aria-label="Réglages">${icon('settings')}</button>
        <div class="progress" aria-hidden="true"><span></span></div>
      </header>
      <main id="main" tabindex="-1" class="narrow pt-main au-main">${body}</main>
    </div>`;
}

export async function renderAuto(app: HTMLElement, r: ARoute) {
  leaveAuto();
  const at = location.hash;
  await loadKatex();
  if (location.hash !== at) return;
  if (r.mode === 'index') {
    if (r.cls && !levelOf(r.cls)) return void renderNotFound(app);
    return renderIndex(app, levelOf(r.cls ?? '') ?? LEVELS[0], !!r.cls);
  }
  const L = levelOf(r.cls ?? '');
  if (!L) return void renderNotFound(app);
  let items: AutoItem[], label: string, k: string;
  if (r.k === 'hasard') {
    let seed = strToSeed(r.params.g);
    if (seed === null) {
      seed = randomSeed();
      replaceHash(r.mode === 'live' ? liveHash(L.cls, 'hasard', r.params.chrono === '1', seed) : printHash(L.cls, 'hasard', seed));
    }
    items = randomSeance(L, seed);
    label = 'Séance au hasard';
    k = `hasard-${seedToStr(seed)}`;
  } else {
    const n = Number(r.k);
    if (!Number.isInteger(n) || n < 1 || n > L.seances.length) return void renderNotFound(app);
    items = fixedSeance(L, n);
    label = `Séance ${n}`;
    k = String(n);
  }
  if (r.mode === 'print') return renderPrint(app, L, items, label, r);
  return renderLive(app, L, items, label, k, r);
}

// =================================================================== liste des séances
function renderIndex(app: HTMLElement, L: AutoLevel, explicit: boolean) {
  document.title = 'Automatismes — Maths Collège';
  const tabs = LEVELS.map((x) => `<a class="seg" role="tab" href="${indexHash(x.cls)}" aria-selected="${x.cls === L.cls}"${x.cls === L.cls ? ' aria-current="page"' : ''}>${x.cls}</a>`).join('');
  const seances = L.seances
    .map((ids, i) => {
      const n = i + 1;
      const themes = ids.map((id) => L.gens.find((g) => g.id === id)!.title);
      return `<li class="au-card">
        <h3 class="au-card-t">Séance ${n}</h3>
        <p class="au-card-themes">${themes.map((t) => rich(t)).join(' · ')}</p>
        <div class="au-card-acts">
          <a class="btn btn--small" href="${liveHash(L.cls, n, false)}">${icon('resume')}<span>En ligne</span></a>
          <a class="btn btn--small btn--ghost" href="${liveHash(L.cls, n, true)}">${icon('timer')}<span>En ligne, chronométrée</span></a>
          <a class="btn btn--small btn--ghost" href="${printHash(L.cls, n)}">${icon('print')}<span>Version papier</span></a>
        </div>
      </li>`;
    })
    .join('');
  app.innerHTML = shell(
    'Automatismes',
    L.title,
    `<h1 class="pt-h1">Automatismes</h1>
     <p class="pt-intro">Des séances courtes de <strong>${PER_SEANCE} questions</strong> (environ ${MINUTES} minutes), <strong>sans calculatrice</strong>, pour entretenir chaque jour les réflexes de calcul et de raisonnement prévus par le programme 2026. Chaque séance existe en <strong>version papier</strong> (à imprimer, corrigé sur une page à part) et <strong>en ligne</strong> (avec ou sans chronomètre, score à la fin).</p>
     <nav class="segmented au-tabs" role="tablist" aria-label="Niveau">${tabs}</nav>
     <p class="prog-note">${esc(L.note)}</p>
     <section class="au-random" aria-labelledby="au-rnd">
       <h2 class="pt-h2" id="au-rnd">Séance au hasard</h2>
       <p>${PER_SEANCE} types tirés parmi les ${L.gens.length} du niveau, avec de nouveaux nombres à chaque fois.</p>
       <div class="au-card-acts">
         <a class="btn btn--small" href="${liveHash(L.cls, 'hasard', false)}">${icon('resume')}<span>En ligne</span></a>
         <a class="btn btn--small btn--ghost" href="${liveHash(L.cls, 'hasard', true)}">${icon('timer')}<span>Chronométrée (${MINUTES} min)</span></a>
         <a class="btn btn--small btn--ghost" href="${printHash(L.cls, 'hasard')}">${icon('print')}<span>Version papier</span></a>
       </div>
     </section>
     <h2 class="pt-h2">Séances fixes · ${esc(L.cls)}</h2>
     <p class="pt-foot au-fixed-note">Les séances fixes donnent toujours les mêmes questions : une classe peut faire la même séance sur papier ou en ligne, puis la corriger ensemble.</p>
     <ol class="au-cards">${seances}</ol>
     <details class="au-types"><summary>Les ${L.gens.length} types de questions de ${esc(L.cls)}</summary>
       <ul>${L.gens.map((g) => `<li><strong>${rich(g.title)}</strong> — ${rich(g.desc)} <span class="au-ex">${tex(g.example)}</span></li>`).join('')}</ul>
     </details>`,
    'Retour à l’accueil',
  );
  const root = app.querySelector<HTMLElement>('.page--auto')!;
  root.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-act="back"]')) goUp('#/');
  });
  if (explicit) root.querySelector<HTMLElement>('.au-tabs [aria-selected="true"]')?.focus({ preventScroll: true });
}

// =================================================================== version papier
const blank = (n = 1) => '<span class="au-blank" aria-hidden="true"></span>'.repeat(n);
function answerZone(s: Step): string {
  const a = s.answer;
  if (a.kind === 'num') return `<div class="au-fields">${a.fields.map((f) => `<span class="au-field">${f.label ? rich(f.label) + ' ' : ''}${blank()}${f.unit ? ` ${esc(f.unit)}` : ''}</span>`).join('')}</div>`;
  if (a.kind === 'choice') return `<ul class="au-opts">${a.options.map((o) => `<li><span class="au-box" aria-hidden="true"></span>${rich(o)}</li>`).join('')}</ul>`;
  return `<div class="au-fields">${blank()}</div>`;
}
function qHtml(ex: Exercise, i: number) {
  const s = ex.steps[0];
  return `<li class="au-q">
    <p class="au-q-t"><span class="au-num">${i + 1}.</span> ${rich(ex.title)}</p>
    ${ex.statement ? `<div class="au-q-st">${richParas(ex.statement)}</div>` : ''}
    ${ex.display ? `<div class="au-q-d">${tex(ex.display, true)}</div>` : ''}
    ${ex.figure ? `<figure class="pt-figure">${ex.figure}</figure>` : ''}
    ${s.prompt ? `<p class="au-q-p">${rich(s.prompt)}</p>` : ''}
    ${answerZone(s)}
  </li>`;
}
function renderPrint(app: HTMLElement, L: AutoLevel, items: AutoItem[], label: string, r: ARoute) {
  const exs = items.map((it) => exerciseOf(L, it));
  const title = `Automatismes ${L.cls} · ${label}`;
  document.title = `${title} — Maths Collège`;
  const live = r.k === 'hasard' ? liveHash(L.cls, 'hasard', false, strToSeed(r.params.g) ?? undefined) : liveHash(L.cls, r.k!, false);
  app.innerHTML = shell(
    'Version papier',
    `${L.cls} · ${label}`,
    `<div class="au-toolbar">
       <button type="button" class="btn btn--small" data-act="print">${icon('print')}<span>Imprimer</span></button>
       <label class="au-check"><input type="checkbox" data-act="key"> Afficher (et imprimer) le corrigé</label>
       <a class="btn btn--small btn--ghost" href="${live}">${icon('resume')}<span>Faire en ligne</span></a>
     </div>
     <article class="au-sheet" aria-labelledby="au-sheet-t">
       <header class="au-sheet-head">
         <h1 id="au-sheet-t" class="au-sheet-t">${esc(title)}</h1>
         <p class="au-sheet-meta">Sans calculatrice · ${MINUTES} minutes · ${PER_SEANCE} questions</p>
         <p class="au-sheet-name">Nom : ${blank(2)} Date : ${blank()} Score : ${blank()} / ${PER_SEANCE}</p>
       </header>
       <ol class="au-qs">${exs.map(qHtml).join('')}</ol>
     </article>
     <section class="au-key" aria-labelledby="au-key-t">
       <h2 id="au-key-t" class="au-sheet-t">Corrigé · ${esc(title)}</h2>
       <ol class="au-key-list">${exs.map((ex) => `<li><p class="au-key-a"><strong>${rich(ex.answer)}</strong></p>${ex.solution.filter((l) => !l.startsWith('[[')).map((l) => `<p>${rich(l)}</p>`).join('')}</li>`).join('')}</ol>
     </section>`,
    'Retour aux séances',
    'page--auto-print',
  );
  const root = app.querySelector<HTMLElement>('.page--auto')!;
  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-act="back"]')) goUp(indexHash(L.cls));
    if (t.closest('[data-act="print"]')) window.print();
  });
  root.querySelector<HTMLInputElement>('[data-act="key"]')!.addEventListener('change', (e) => root.classList.toggle('au-show-key', (e.target as HTMLInputElement).checked));
}

// =================================================================== en ligne
interface LiveState {
  idx: number;
  results: (Result | null)[];
  exo: ExoState | null;
  t0: number;
  /** fin (ms) : temps écoulé ou dernière question faite */
  end: number | null;
  timeUp: boolean;
}
const lsKey = (h: string) => `compendium-maths.auto:${h}`;
const fmt = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`; };
const clock = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function renderLive(app: HTMLElement, L: AutoLevel, items: AutoItem[], label: string, k: string, r: ARoute) {
  const chrono = r.params.chrono === '1';
  const limit = MINUTES * 60_000;
  const hash = liveHash(L.cls, k.startsWith('hasard') ? 'hasard' : k, chrono, k.startsWith('hasard') ? strToSeed(k.slice(7)) ?? undefined : undefined);
  const S: LiveState = (() => {
    try {
      // reprise d'une séance en cours (rechargement) ; une séance terminée repart de zéro
      const v = JSON.parse(sessionStorage.getItem(lsKey(hash)) || 'null') as LiveState | null;
      if (v && v.end === null) return v;
    } catch { /* */ }
    return { idx: 0, results: items.map(() => null), exo: null, t0: Date.now(), end: null, timeUp: false };
  })();
  const persist = () => { try { sessionStorage.setItem(lsKey(hash), JSON.stringify(S)); } catch { /* */ } };
  document.title = `Automatismes ${L.cls} · ${label} — Maths Collège`;
  app.innerHTML = shell(`Automatismes ${L.cls}`, label, `<p class="au-live-bar"><span class="au-live-mode">${chrono ? `${icon('timer')} Chronométrée : ${MINUTES} min` : 'Sans chronomètre'} · calculatrice désactivée</span><span class="au-clock" role="timer" aria-live="off"></span></p><div class="pt-exo-host"></div><nav class="pt-nav" aria-label="Suite de la séance"></nav>`, 'Quitter la séance', 'page--serie');
  const root = app.querySelector<HTMLElement>('.page--auto')!;
  const host = root.querySelector<HTMLElement>('.pt-exo-host')!;
  const nav = root.querySelector<HTMLElement>('.pt-nav')!;
  const t1 = root.querySelector<HTMLElement>('.appbar .t1')!;
  const bar = root.querySelector<HTMLElement>('.progress > span')!;
  const clk = root.querySelector<HTMLElement>('.au-clock')!;
  let ctrl: ReturnType<typeof mountExercise> | null = null;
  // clavier de réponse seulement : la calculatrice n'est jamais proposée
  const cc: DockHandle = attachDock(root, { trigDefault: false, enabled: () => false, onSubmit: (inp) => ctrl?.validateFromKeypad(inp) });
  let timer = 0;
  const finished = () => S.end !== null;

  const tick = () => {
    if (finished()) return;
    const el = Date.now() - S.t0;
    if (chrono) {
      clk.textContent = `Reste ${clock(limit - el)}`;
      clk.classList.toggle('au-clock--low', limit - el < 60_000);
      if (el >= limit) {
        S.timeUp = true;
        finish();
      }
    } else clk.textContent = clock(el);
  };
  const askLeave = () =>
    confirmDialog({
      title: 'Quitter la séance ?',
      text: `Tu en es à la question ${Math.min(S.idx + 1, items.length)} sur ${items.length}.`,
      stay: 'Continuer',
      leave: 'Quitter',
    }).then((leave) => {
      if (leave) leaveGuarded(indexHash(L.cls));
      else rearmGuard();
    });

  const show = (focus: boolean) => {
    const it = items[S.idx];
    const ex = exerciseOf(L, it);
    if (!S.exo) S.exo = freshState(ex);
    cc.setExercise(`${hash}|${S.idx}`, false);
    t1.textContent = `Question ${S.idx + 1} / ${items.length}`;
    bar.style.transform = `scaleX(${S.idx / items.length})`;
    ctrl = mountExercise(host, ex, S.exo, {
      label: `Question ${S.idx + 1}`,
      gen: it.gen,
      onChange: (st) => {
        S.exo = st;
        persist();
      },
      onDone: (res) => {
        S.results[S.idx] = res;
        persist();
        drawNav(true);
      },
    });
    drawNav(S.exo.done);
    if (focus) ctrl.focusTitle();
  };
  const drawNav = (done: boolean) => {
    const last = S.idx === items.length - 1;
    nav.innerHTML = done
      ? `<button type="button" class="btn pt-next" data-act="next">${last ? 'Voir le score' : 'Question suivante'} ${icon('chevronRight')}</button>`
      : `<button type="button" class="btn btn--ghost" data-act="skip">Passer cette question</button>`;
    if (done) nav.querySelector<HTMLElement>('.pt-next')!.focus({ preventScroll: true });
  };
  const next = () => {
    if (S.idx < items.length - 1) {
      S.idx++;
      S.exo = null;
      persist();
      show(true);
      window.scrollTo(0, 0);
    } else finish();
  };
  const finish = () => {
    if (S.end === null) S.end = Date.now();
    persist();
    summary();
  };
  const summary = () => {
    clearInterval(timer);
    releaseGuard();
    cc.disable();
    bar.style.transform = 'scaleX(1)';
    t1.textContent = 'Score';
    const res = S.results;
    const ok = res.filter((x) => x === 'ok').length, hint = res.filter((x) => x === 'hint').length, none = res.filter((x) => x === null).length;
    const time = Math.min(S.end! - S.t0, chrono ? limit : Infinity);
    clk.textContent = '';
    const again = k.startsWith('hasard') ? liveHash(L.cls, 'hasard', chrono) : liveHash(L.cls, k, chrono);
    const msg = ok === items.length ? 'Parfait : tout juste du premier coup !' : ok >= 8 ? 'Très bien : ces automatismes sont en place.' : ok >= 5 ? 'Bien. Revois les corrigés des questions ratées, puis refais la séance.' : 'Ces réflexes demandent encore de l’entraînement : relis les corrigés et refais la séance demain.';
    host.innerHTML = `
      <section class="pt-summary" aria-labelledby="au-sum-t">
        <h1 class="pt-h1" id="au-sum-t" tabindex="-1">Score${S.timeUp ? ' · temps écoulé' : ''}</h1>
        <p class="pt-score"><span class="pt-score-big">${ok}<small> / ${items.length}</small></span><span>justes du premier coup</span></p>
        <ul class="pt-counts-list">
          <li class="pt-r--ok"><span aria-hidden="true">${RES_ICON.ok}</span> ${ok} du premier coup</li>
          <li class="pt-r--hint"><span aria-hidden="true">${RES_ICON.hint}</span> ${hint} avec un indice</li>
          <li class="pt-r--fail"><span aria-hidden="true">${RES_ICON.fail}</span> ${items.length - ok - hint} à revoir${none ? ` (dont ${none} non faite${none > 1 ? 's' : ''})` : ''}</li>
        </ul>
        <p class="pt-msg">Temps : ${fmt(time)}${chrono ? ` sur ${MINUTES} min` : ''}. ${msg}</p>
        <ol class="pt-recap">${items
          .map((it, i) => {
            const ex = exerciseOf(L, it);
            const rr: Result = res[i] ?? 'fail';
            return `<li class="pt-r--${rr}"><span class="pt-r-ic" aria-hidden="true">${RES_ICON[rr]}</span>
              <span class="pt-r-body"><span class="pt-r-t">${i + 1}. ${rich(it.gen.title)} <span class="sr-only">— ${res[i] ? RES_TXT[rr] : 'non faite'}</span></span>
              ${ex.display ? `<span class="pt-r-a">${tex(ex.display)}</span>` : ''}<span class="pt-r-a">Réponse : ${rich(ex.answer)}</span>
              <details class="au-sol"><summary>Corrigé</summary>${ex.solution.filter((l) => !l.startsWith('[[')).map((l) => `<p>${rich(l)}</p>`).join('')}</details></span></li>`;
          })
          .join('')}</ol>
        <div class="pt-sum-actions">
          <button type="button" class="btn" data-act="again">${k.startsWith('hasard') ? 'Nouvelle séance au hasard' : 'Refaire cette séance'}</button>
          <a class="btn btn--ghost" href="${indexHash(L.cls)}">Autres séances</a>
        </div>
      </section>`;
    nav.innerHTML = '';
    host.querySelector<HTMLElement>('#au-sum-t')!.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    root.querySelector<HTMLElement>('[data-act="again"]')!.dataset.href = again;
  };

  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-act="back"]')) {
      if (finished()) leaveGuarded(indexHash(L.cls));
      else askLeave();
      return;
    }
    if (t.closest('[data-act="next"]')) next();
    if (t.closest('[data-act="skip"]')) next();
    const ag = t.closest<HTMLElement>('[data-act="again"]');
    if (ag) {
      try { sessionStorage.removeItem(lsKey(hash)); } catch { /* */ }
      const target = ag.dataset.href!;
      if (target === location.hash) {
        leaveAuto();
        void renderAuto(app, r);
      } else replaceGuarded(target);
    }
  });

  persist();
  if (finished()) summary();
  else {
    setLeaveGuard(askLeave);
    show(false);
    tick();
    timer = window.setInterval(tick, 1000);
  }
  cleanup = () => {
    clearInterval(timer);
    releaseGuard();
    cc.destroy();
    closeDialog();
  };
}
