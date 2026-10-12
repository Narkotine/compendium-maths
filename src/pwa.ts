/**
 * Service worker : installation, mises à jour, récupération d'une version périmée.
 *
 * Principes (un utilisateur ne doit jamais rester bloqué sur une ancienne version) :
 * - recherche de mise à jour au démarrage, au retour sur l'appli (visibilitychange) et toutes les 30 min ;
 * - une mise à jour trouvée dans les premières secondes est appliquée tout de suite (rien à perdre) ;
 *   plus tard, un bandeau « Mettre à jour » l'applique : SKIP_WAITING → controllerchange → un seul rechargement ;
 * - si l'activation n'aboutit pas, ou si un lien ne correspond à rien dans la version en cache alors qu'une
 *   version plus récente existe en ligne : réinitialisation (caches vidés, service worker désenregistré, rechargement).
 */
import { toast } from './util';

let status: 'unsupported' | 'pending' | 'ready' = 'serviceWorker' in navigator ? 'pending' : 'unsupported';
let reg: ServiceWorkerRegistration | null = null;
let regP: Promise<ServiceWorkerRegistration | null> = Promise.resolve(null);
let applying = false;
let reloading = false;
const T0 = Date.now();
/** Fenêtre pendant laquelle une mise à jour est appliquée sans demander (démarrage). */
const AUTO_MS = 10000;
const GUARD = 'compendium-maths.sw-recover';

export function offlineStatus() {
  if (status === 'ready') return 'Disponible hors ligne : tous les cours sont enregistrés sur l’appareil.';
  if (status === 'pending') return 'Préparation du mode hors ligne…';
  if (!window.isSecureContext) return 'Hors ligne indisponible : l’appli doit être servie en HTTPS.';
  return 'Hors ligne non pris en charge par ce navigateur.';
}
const refreshStatus = () => document.querySelectorAll('[data-offline] span').forEach((s) => (s.textContent = offlineStatus()));

/** Vide les caches, désenregistre le service worker et recharge depuis le réseau. */
export async function hardReset() {
  if (reloading) return;
  reloading = true;
  try {
    // même origine que d'autres sites (jeux) : on ne touche qu'à NOTRE enregistrement et à NOS caches
    const mine = new URL('./', location.href).href;
    const regs = await navigator.serviceWorker?.getRegistrations?.() ?? [];
    await Promise.all(regs.filter((r) => r.scope === mine).map((r) => r.unregister()));
  } catch { /* ignore */ }
  try {
    for (const k of await caches.keys()) if (k.startsWith('compendium-maths')) await caches.delete(k);
  } catch { /* ignore */ }
  location.replace(`${location.pathname}?r=${Date.now()}${location.hash}`);
}

/** Active la version en attente ; rechargement unique sur controllerchange, réinitialisation si rien ne vient. */
export function applyUpdate() {
  const w = reg?.waiting;
  if (!w) return void hardReset();
  applying = true;
  w.postMessage({ type: 'SKIP_WAITING' });
  setTimeout(() => !reloading && hardReset(), 8000);
}

function onWaiting() {
  if (!navigator.serviceWorker.controller) return; // première installation : rien à remplacer
  const inSeries = /^#\/entrainement\/[^/]+\/(serie|exo)/.test(location.hash);
  if (Date.now() - T0 < AUTO_MS && !inSeries) return applyUpdate();
  document.querySelectorAll('.toast[data-update]').forEach((t) => t.remove());
  const el = toast('Une nouvelle version est disponible.', { label: 'Mettre à jour', run: applyUpdate });
  el.setAttribute('data-update', '');
}

function watch(r: ServiceWorkerRegistration) {
  if (r.waiting) onWaiting();
  r.addEventListener('updatefound', () => {
    const w = r.installing;
    w?.addEventListener('statechange', () => {
      if (w.state !== 'installed') return;
      if (navigator.serviceWorker.controller) onWaiting();
      else {
        status = 'ready';
        toast('Prêt : les cours sont disponibles hors ligne.');
        refreshStatus();
      }
    });
  });
}

/** Cherche une nouvelle version (sans erreur si hors ligne). */
export async function checkUpdate(timeout = 6000): Promise<ServiceWorkerRegistration | null> {
  const r = await regP;
  if (!r) return null;
  try {
    await Promise.race([r.update(), new Promise((res) => setTimeout(res, timeout))]);
  } catch { /* hors ligne */ }
  return r;
}

/**
 * Appelée quand un lien ne mène à rien (chapitre ou entraînement absent de l'index en cache) ou qu'un module
 * ne se charge pas : si une version plus récente existe, on y passe et on renvoie true.
 */
export async function recoverStale(currentVersion?: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const last = Number(sessionStorage.getItem(GUARD) || 0);
    if (Date.now() - last < 60000) return false; // déjà tenté il y a moins d'une minute : pas de boucle
  } catch { /* ignore */ }
  const mark = () => { try { sessionStorage.setItem(GUARD, String(Date.now())); } catch { /* ignore */ } };
  const r = await checkUpdate();
  if (r) {
    // laisse le temps à une version trouvée de s'installer
    for (let i = 0; i < 40 && r.installing; i++) await new Promise((res) => setTimeout(res, 250));
    if (r.waiting) { mark(); applyUpdate(); return true; }
  }
  try {
    const fresh = await fetch(`content/index.json?fresh=${Date.now()}`, { cache: 'no-store' });
    if (fresh.ok) {
      const j = (await fresh.json()) as { version?: string };
      if (currentVersion && j.version && j.version !== currentVersion) { mark(); await hardReset(); return true; }
    }
  } catch { /* hors ligne */ }
  return false;
}

export function setupPWA() {
  // ?r=… (rechargement forcé) : on nettoie l'adresse
  if (/[?&]r=/.test(location.search)) history.replaceState(history.state, '', location.pathname + location.hash);
  if (!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController && !applying) return; // première prise de contrôle : pas de rechargement
    if (reloading) return;
    reloading = true;
    location.reload();
  });
  regP = navigator.serviceWorker
    .register('./sw.js', { scope: './', updateViaCache: 'none' })
    .then((r) => {
      reg = r;
      if (r.active && hadController) status = 'ready';
      refreshStatus();
      watch(r);
      r.update().catch(() => {});
      setInterval(() => r.update().catch(() => {}), 30 * 60 * 1000);
      let lastCheck = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - lastCheck > 60000) {
          lastCheck = Date.now();
          r.update().catch(() => {});
        }
      });
      return r;
    })
    .catch(() => {
      status = 'unsupported';
      return null;
    });
  // module JS introuvable (ancienne page, nouveaux fichiers en ligne) : on récupère la nouvelle version
  addEventListener('vite:preloadError', (e) => {
    e.preventDefault();
    void recoverStale('?').then((ok) => !ok && toast('Une partie de l’appli n’a pas pu être chargée. Réglages → « Forcer la mise à jour ».'));
  });
}
