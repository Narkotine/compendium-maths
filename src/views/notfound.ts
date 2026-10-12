import { icon } from '../icons';
import { recoverStale } from '../pwa';
import { getIndex } from '../data';

/**
 * Lien sans destination. Avant de conclure, on vérifie qu'il n'existe pas une version plus récente de l'appli
 * (ancienne version en cache, lien d'une version récente) : si oui, on y passe au lieu d'afficher l'erreur.
 */
export async function renderNotFound(app: HTMLElement) {
  app.innerHTML = `<main class="narrow" id="main" tabindex="-1"><p class="pg-muted" data-checking>Recherche d’une version plus récente…</p></main>`;
  const routeAtCall = location.hash;
  if (await recoverStale(getIndex()?.version)) return;
  if (location.hash !== routeAtCall) return; // l'utilisateur est allé ailleurs entre-temps
  showNotFound(app);
}
function showNotFound(app: HTMLElement) {
  document.title = 'Page introuvable — Maths Collège';
  app.innerHTML = `
    <div class="page">
      <header class="appbar"><a class="icon-btn" href="#/" aria-label="Accueil">${icon('home')}</a><span class="appbar-title"><span class="t1">Maths Collège</span></span></header>
      <main id="main" tabindex="-1" class="narrow">
        <h1>Page introuvable</h1>
        <p>Ce lien ne correspond à aucun cours.</p>
        <p><a class="btn" href="#/">Revenir au sommaire</a></p>
      </main>
    </div>`;
}
