import 'katex/dist/katex.min.css';
import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-400-italic.css';
import '@fontsource/atkinson-hyperlegible-next/latin-700.css';
import './styles/base.css';
import './styles/app.css';
import './styles/prose.css';

import { loadIndex } from './data';
import { startRouter, getMark, setMarkProvider, saveScroll, overlayOpen, type Route, type HState } from './nav';
import { applySettings } from './store';
import { renderHome } from './views/home';
import { renderSearch } from './views/search';
import { renderChapter, leaveChapter, currentChapter } from './views/chapter';
import { throttle } from './util';
import { renderNotFound } from './views/notfound';
import { openSettings } from './ui/settings';
import { setupPWA } from './pwa';

const app = document.getElementById('app')!;
let practiceMod: typeof import('./views/practice') | null = null;
let autoMod: typeof import('./views/automatismes') | null = null;
const leavePracticeView = () => practiceMod?.leavePractice();
const leaveAutoView = () => autoMod?.leaveAuto();
applySettings();

let lastView = '';
let viewReady = false;

async function onRoute(route: Route, how: 'push' | 'pop' | 'init', st: HState) {
  viewReady = false;
  if (route.name !== 'chapter') leaveChapter();
  if (route.name !== 'practice') leavePracticeView();
  if (route.name !== 'auto') leaveAutoView();
  const view = route.name === 'chapter' ? `ch:${route.slug}` : route.name;
  const changed = view !== lastView;
  lastView = view;

  if (route.name === 'chapter') {
    const ok = await renderChapter(app, route.slug, route.id, how, st);
    if (!ok) {
      renderNotFound(app);
      lastView = 'notfound';
    }
    return;
  }
  setMarkProvider(() => ({ y: scrollY }));
  let ready: Promise<void> | void;
  if (route.name === 'home') ready = renderHome(app);
  else if (route.name === 'search') {
    // la recherche se met à jour sans recréer la page tant qu'on y reste
    if (!changed && document.querySelector('.page--search')) return void (viewReady = true);
    ready = renderSearch(app, route.q);
  } else if (route.name === 'practice') {
    // module chargé à la demande (moteur d'exercices + KaTeX)
    ready = import('./views/practice')
      .then((m) => {
        practiceMod = m;
        return m.renderPractice(app, route, how, st);
      })
      .catch((err) => {
        console.error(err);
        app.innerHTML = `<main class="narrow" id="main" tabindex="-1"><h1>S’entraîner</h1><p>Le module d’exercices n’a pas pu être chargé. Vérifiez la connexion puis rechargez la page.</p><p><button class="btn" onclick="location.reload()">Recharger</button></p></main>`;
      });
  } else if (route.name === 'auto') {
    // automatismes : module chargé à la demande (questions flash + KaTeX)
    ready = import('./views/automatismes')
      .then((m) => {
        autoMod = m;
        return m.renderAuto(app, route);
      })
      .catch((err) => {
        console.error(err);
        app.innerHTML = `<main class="narrow" id="main" tabindex="-1"><h1>Automatismes</h1><p>Le module n’a pas pu être chargé. Vérifiez la connexion puis rechargez la page.</p><p><button class="btn" onclick="location.reload()">Recharger</button></p></main>`;
      });
  } else if (route.name === 'progress') {
    ready = import('./views/progress').then((m) => m.renderProgress(app));
  } else ready = renderNotFound(app);
  await ready;
  const mark = how !== 'push' ? getMark(st.k) : undefined;
  window.scrollTo(0, mark ? mark.y : 0);
  viewReady = true;
  if (how === 'push' && route.name !== 'search') document.getElementById('main')?.focus({ preventScroll: true });
}

// Accueil, recherche : position mémorisée en continu (le chapitre gère la sienne)
addEventListener(
  'scroll',
  throttle(() => viewReady && !currentChapter() && !overlayOpen() && saveScroll(), 300),
  { passive: true },
);

app.addEventListener('click', (e) => {
  const t = (e.target as Element).closest<HTMLElement>('[data-act="settings"]');
  if (t && !t.closest('.page--chapter')) openSettings();
});

loadIndex()
  .then(() => startRouter(onRoute))
  .catch(() => {
    app.innerHTML = `<main class="narrow" id="main"><h1>Maths Collège</h1><p>Le contenu n’a pas pu être chargé. Vérifiez la connexion puis rechargez la page.</p><p><button class="btn" onclick="location.reload()">Recharger</button></p></main>`;
  });
setupPWA();
