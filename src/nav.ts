/**
 * Navigation : routage par hash + gestion fine de l'historique.
 *
 *  #/                         accueil
 *  #/recherche?q=…            recherche
 *  #/ch/<slug>[/<sectionId>]  chapitre (section facultative : s3-7, serie-B, ex-B1, cor-B1…)
 *  #/entrainement/<slug>                         s'entraîner : choix du type et du niveau
 *  #/entrainement/<slug>/serie?t=…&niv=…&n=…&g=…  série d'exercices générés (graine g : rejouable)
 *  #/entrainement/<slug>/exo?t=…&niv=…&g=…        un exercice seul (adresse partageable)
 *  #/automatismes[/<niveau>]                      automatismes : séances par niveau (5e, 4e, 3e)
 *  #/automatismes/<niveau>/<n>                    séance n, version papier (imprimable, corrigé)
 *  #/automatismes/<niveau>/<n>/en-ligne?chrono=1  séance n en ligne (n = « hasard » : graine g)
 *
 * Chaque entrée d'historique porte une clé `k` ; la position de lecture est mémorisée par clé
 * (ancre + décalage), ce qui permet au bouton « retour » (navigateur ou Android) de revenir
 * exactement où l'on était. Les panneaux (sommaire, réglages, figure) ajoutent une entrée
 * « overlay » : le bouton retour les ferme avant de quitter la page.
 * Pendant une série d'exercices, une « garde » (entrée doublée, marquée g) intercepte le bouton
 * retour (Android) pour demander confirmation avant de quitter.
 */
export type Route =
  | { name: 'home' }
  | { name: 'search'; q: string }
  | { name: 'chapter'; slug: string; id: string | null }
  | { name: 'practice'; slug: string; mode: 'setup' | 'serie' | 'exo'; params: Record<string, string> }
  | { name: 'progress' }
  | { name: 'auto'; cls: string | null; k: string | null; mode: 'index' | 'print' | 'live'; params: Record<string, string> }
  | { name: 'notfound'; hash: string };

export interface HState {
  k: string;
  ov?: string;
  prev?: string;
  /** entrée « garde » (série en cours) */
  g?: 1;
}
export interface ScrollMark {
  y: number;
  anchor?: string;
  off?: number;
}

export function parseHash(hash: string): Route {
  const h = decodeURI(hash.replace(/^#/, '')) || '/';
  const [path, query = ''] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'progres' && parts.length === 1) return { name: 'progress' };
  if (parts[0] === 'recherche') return { name: 'search', q: new URLSearchParams(query).get('q') || '' };
  if (parts[0] === 'ch' && parts[1]) return { name: 'chapter', slug: parts[1], id: parts[2] || null };
  if (parts[0] === 'automatismes') {
    if (parts.length > 4 || (parts[3] && parts[3] !== 'en-ligne')) return { name: 'notfound', hash };
    const mode = parts[3] ? 'live' : parts[2] ? 'print' : 'index';
    return { name: 'auto', cls: parts[1] ?? null, k: parts[2] ?? null, mode, params: Object.fromEntries(new URLSearchParams(query)) };
  }
  if (parts[0] === 'entrainement' && parts[1]) {
    const mode = parts[2] === 'serie' || parts[2] === 'exo' ? parts[2] : 'setup';
    if (parts[2] && mode === 'setup') return { name: 'notfound', hash };
    return { name: 'practice', slug: parts[1], mode, params: Object.fromEntries(new URLSearchParams(query)) };
  }
  return { name: 'notfound', hash };
}

let seq = Date.now() % 1e9;
const newKey = () => (++seq).toString(36);
export const hstate = (): HState => (history.state as HState) || { k: '' };

// ---------------------------------------------------------------- positions de lecture
const SCROLL_KEY = 'compendium-maths.scroll';
const marks = new Map<string, ScrollMark>(
  (() => {
    try {
      return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '[]');
    } catch {
      return [];
    }
  })(),
);
let markProvider: () => ScrollMark = () => ({ y: scrollY });
export const setMarkProvider = (fn: () => ScrollMark) => (markProvider = fn);
export function saveScroll() {
  const k = hstate().k;
  if (k && !overlay) marks.set(k, markProvider());
}
export const getMark = (k: string) => marks.get(k);
function persistMarks() {
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify([...marks].slice(-60)));
  } catch {
    /* ignore */
  }
}
addEventListener('pagehide', persistMarks);
document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persistMarks());

// ---------------------------------------------------------------- overlays (panneaux)
interface Overlay {
  id: string;
  close: () => void; // ferme visuellement, sans toucher à l'historique
}
let overlay: Overlay | null = null;
export const overlayOpen = () => overlay?.id ?? null;

/** Ouvre un panneau : ajoute une entrée d'historique pour que « retour » le ferme. */
export function pushOverlay(id: string, close: () => void) {
  if (overlay) closeOverlaySilently();
  saveScroll();
  history.pushState({ ...hstate(), ov: id }, '', location.href);
  overlay = { id, close };
}
/** Fermeture demandée par l'interface (bouton ×, fond, Échap) : on dépile l'entrée. */
export function requestCloseOverlay() {
  if (!overlay) return;
  if (hstate().ov === overlay.id) history.back();
  else closeOverlaySilently();
}
function closeOverlaySilently() {
  const o = overlay;
  overlay = null;
  o?.close();
}

// ---------------------------------------------------------------- garde (série en cours)
let guard: { ask: () => void; hash: string } | null = null;
/**
 * Active la garde : le prochain « retour » appelle `ask` au lieu de quitter la page.
 * On double l'entrée courante (même adresse, marquée g) ; « retour » la dépile et nous prévient.
 */
export function setLeaveGuard(ask: () => void) {
  guard = { ask, hash: location.hash };
  if (!hstate().g) history.pushState({ ...hstate(), g: 1 }, '', location.href);
  lastWasGuard = true;
}
/** Relance la garde après « Continuer » (l'entrée g a été dépilée par le retour). */
export function rearmGuard() {
  if (guard && !hstate().g) history.pushState({ ...hstate(), g: 1 }, '', location.href);
  lastWasGuard = true;
}
export function releaseGuard() {
  guard = null;
}
export const guardActive = () => !!guard;
/** Quitter la page gardée : retour réel (deux entrées si l'on est sur l'entrée g). */
export function leaveGuarded(fallback: string) {
  guard = null;
  const st = hstate();
  if (st.prev !== undefined) history.go(st.g ? -2 : -1);
  else navigate(fallback, { replace: true });
}

/**
 * Remplace la page gardée par une autre adresse (« Nouvelle série ») sans laisser l'ancienne
 * dans l'historique : on dépile d'abord l'entrée g, puis on remplace l'entrée d'origine.
 */
let pendingReplace: string | null = null;
let rebase: string | null = null;
export function replaceGuarded(hash: string) {
  guard = null;
  if (hstate().g) {
    pendingReplace = hash;
    history.back();
  } else navigate(hash, { replace: true });
}

// ---------------------------------------------------------------- navigation
type Handler = (route: Route, how: 'push' | 'pop' | 'init', state: HState) => void;
let handler: Handler = () => {};
let lastHash = '';
let lastWasGuard = false;

export function navigate(hash: string, opts: { replace?: boolean } = {}) {
  if (!hash.startsWith('#')) hash = '#' + hash;
  if (overlay) {
    // depuis un panneau : l'entrée « panneau » est remplacée par la destination,
    // ainsi « retour » ramène à la page d'avant l'ouverture du panneau.
    closeOverlaySilently();
    history.replaceState({ k: newKey(), prev: location.hash }, '', hash);
  } else {
    saveScroll();
    const st: HState = { k: newKey(), prev: location.hash || '#/' };
    if (opts.replace) history.replaceState(st, '', hash);
    else history.pushState(st, '', hash);
  }
  lastHash = location.hash;
  lastWasGuard = false;
  handler(parseHash(location.hash), 'push', hstate());
}

/** Met à jour l'URL sans créer d'entrée (ex. requête de recherche tapée). */
export function replaceHash(hash: string) {
  if (overlay && hstate().ov === overlay.id) {
    // un panneau non modal est ouvert (calculatrice) : on remplace l'entrée de la page, sous celle du panneau,
    // pour que « retour » ferme le panneau puis quitte la page, sans revenir à l'ancienne adresse.
    rebase = hash;
    history.back();
    return;
  }
  history.replaceState({ ...hstate() }, '', hash);
  lastHash = location.hash;
}

/** « Remonter » : vers l'accueil, en réutilisant l'historique si l'on vient de l'accueil. */
export function goUp(target = '#/') {
  const prev = hstate().prev;
  if (prev !== undefined && (prev === target || (target === '#/' && (prev === '' || prev === '#/' || prev === '#')))) history.back();
  else navigate(target);
}

export function startRouter(h: Handler) {
  handler = h;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!hstate().k) history.replaceState({ k: newKey() }, '', location.href);
  if (hstate().ov) history.replaceState({ k: hstate().k }, '', location.href);
  lastHash = location.hash;

  addEventListener('popstate', (e) => {
    const st = (e.state as HState) || null;
    if (rebase !== null) {
      const h = rebase;
      rebase = null;
      history.replaceState({ ...(st ?? { k: newKey() }) }, '', h);
      if (overlay) history.pushState({ ...hstate(), ov: overlay.id }, '', h);
      lastHash = location.hash;
      return;
    }
    if (pendingReplace !== null) {
      const h = pendingReplace;
      pendingReplace = null;
      lastWasGuard = false;
      navigate(h, { replace: true });
      return;
    }
    if (overlay && (!st || st.ov !== overlay.id)) {
      closeOverlaySilently();
      if (st && location.hash === lastHash) return; // simple fermeture du panneau
    } else if (st?.ov && !overlay) {
      // « suivant » vers un panneau déjà fermé : on l'ignore
      history.back();
      return;
    }
    if (!st) history.replaceState({ k: newKey() }, '', location.href);
    if (location.hash === lastHash && !st?.g) {
      // on vient de dépiler une entrée « garde » (même adresse)
      if (guard && guard.hash === location.hash) {
        guard.ask();
        return;
      }
      if (lastWasGuard) {
        // garde relâchée : l'entrée doublée n'a plus de sens, on la saute
        lastWasGuard = false;
        history.back();
        return;
      }
    }
    lastWasGuard = !!st?.g;
    lastHash = location.hash;
    handler(parseHash(location.hash), 'pop', hstate());
  });

  // Liens internes : <a href="#/…">
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a[href^="#/"]') as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    navigate(a.getAttribute('href')!);
  });

  handler(parseHash(location.hash), 'init', hstate());
}
