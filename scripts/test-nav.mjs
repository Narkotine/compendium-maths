#!/usr/bin/env node
/**
 * Tests de bout en bout (Chrome headless, 390×844) : navigation, bouton retour, positions de
 * lecture, tiroir, visionneuse, recherche, réglages, hors ligne (service worker).
 * Prérequis : `npm run build` puis `npm run preview`.  Usage : node scripts/test-nav.mjs [url]
 */
import puppeteer from 'puppeteer-core';

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (cond, msg, extra = '') => {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.log('  ✗', msg, extra); }
};
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
const ctx = await browser.createBrowserContext();
const p = await ctx.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
const hash = () => p.evaluate(() => location.hash);
const y = () => p.evaluate(() => Math.round(scrollY));
const topOf = (sel) => p.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), sel);

console.log('Service worker et hors ligne');
await p.goto(URL, { waitUntil: 'networkidle0' });
const swOk = await p.evaluate(async () => {
  const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 15000))]);
  return !!reg?.active;
});
t(swOk, 'service worker enregistré et actif');
// attend la fin du pré-cache
await p.waitForFunction(async () => {
  const keys = await caches.keys();
  for (const k of keys) { const c = await caches.open(k); if ((await c.keys()).length > 190) return true; }
  return false;
}, { timeout: 60000, polling: 500 }).then(() => t(true, 'pré-cache complet (> 190 fichiers en cache)'), () => t(false, 'pré-cache complet'));
await p.reload({ waitUntil: 'networkidle0' });
t(await p.evaluate(() => !!navigator.serviceWorker.controller), 'la page est contrôlée par le service worker');

console.log('Accueil → chapitre → renvoi → retour');
await p.click('a.ch-card[href="#/ch/11-pythagore"]');
await p.waitForSelector('article.prose section');
t((await hash()) === '#/ch/11-pythagore', 'ouverture du chapitre 11 depuis l’accueil');
t((await p.$eval('h1', (h) => h.textContent)) === 'Théorème de Pythagore', 'titre du chapitre');
await p.evaluate(() => window.scrollTo(0, document.getElementById('s5-1').getBoundingClientRect().top + scrollY - 200));
await wait(400);
const y0 = await y();
const xref = 'a[href="#/ch/04-puissances-notation-scientifique/s6"]';
await p.evaluate((s) => document.querySelectorAll(s)[1].click(), xref);
await p.waitForSelector('article.prose section');
await wait(500);
t((await hash()) === '#/ch/04-puissances-notation-scientifique/s6', 'renvoi « chapitre 4, § 6 » → chapitre 4, § 6');
const top6 = await topOf('#s6');
t(top6 > 40 && top6 < 140, 'le § 6 est en haut de l’écran, sous la barre', `top=${top6}`);
await p.goBack();
await wait(700);
t((await hash()) === '#/ch/11-pythagore', 'retour → chapitre 11');
const y1 = await y();
t(Math.abs(y1 - y0) < 40, 'retour → même position de lecture', `avant=${y0} après=${y1}`);

console.log('Tiroir du sommaire et bouton retour');
await p.click('.bottombar [data-act="toc"]');
await wait(450);
t(!!(await p.$('.sheet-layer.open')), 'le sommaire s’ouvre en feuille du bas');
t(!!(await p.$('.sheet .toc-item[aria-current]')), 'section courante surlignée dans le sommaire');
await p.goBack();
await wait(450);
t(!(await p.$('.sheet-layer')), 'retour (Android) ferme le sommaire…');
t((await hash()) === '#/ch/11-pythagore' && Math.abs((await y()) - y1) < 40, '… sans quitter la page ni perdre la position');
await p.click('.bottombar [data-act="toc"]');
await wait(450);
await p.click('.sheet .toc-item[data-id="s9"]');
await wait(700);
t((await hash()) === '#/ch/11-pythagore/s9' && !(await p.$('.sheet-layer')), 'clic dans le sommaire → section « Corrigés », tiroir fermé');
const top9 = await topOf('#s9');
t(top9 > 40 && top9 < 140, 'la section choisie est en haut de l’écran', `top=${top9}`);
await p.goBack();
await wait(600);
t((await hash()) === '#/ch/11-pythagore' && Math.abs((await y()) - y1) < 40, 'retour → position d’avant le saut', `y=${await y()} attendu≈${y1}`);

console.log('Figures et corrigés');
await p.evaluate(() => document.querySelector('.fig-zoom').scrollIntoView({ block: 'center' }));
await wait(400);
await p.click('.fig-zoom');
await wait(400);
t(!!(await p.$('.viewer')), 'tap sur une figure → plein écran');
const w0 = await p.$eval('.viewer-card', (e) => e.getBoundingClientRect().width);
await p.click('.viewer [data-act="in"]');
await wait(100);
const w1 = await p.$eval('.viewer-card', (e) => e.getBoundingClientRect().width);
t(w1 > w0 * 1.4, 'zoom + agrandit réellement la figure (net)', `${w0}→${w1}`);
await p.goBack();
await wait(400);
t(!(await p.$('.viewer')) && (await hash()) === '#/ch/11-pythagore', 'retour ferme la figure sans quitter le chapitre');
await p.evaluate(() => document.getElementById('ex-C2').scrollIntoView());
await p.click('#ex-C2 .cor-toggle');
await wait(150);
t(await p.$eval('#ci-C2', (e) => !e.hidden && e.textContent.includes('130')), '« Voir le corrigé » affiche le corrigé sous l’exercice');
t((await p.$eval('#ex-C2 .cor-toggle', (e) => e.getAttribute('aria-expanded'))) === 'true', 'aria-expanded mis à jour');
t((await p.$$eval('details.corrige[open]', (d) => d.length)) === 0, 'corrigés repliés par défaut');

console.log('Réglages');
const exTop0 = await topOf('#ex-C2');
await p.click('.appbar [data-act="settings"]');
await wait(400);
await p.click('[data-theme-v="dark"]');
await p.click('[data-size-v="2"]');
await p.click('[data-opencor]');
await wait(200);
t((await p.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'thème sombre appliqué');
t((await p.$$eval('details.corrige[open]', (d) => d.length)) === 44, 'option « déplier tous les corrigés » appliquée immédiatement (44)');
await p.keyboard.press('Escape');
await wait(400);
t(!(await p.$('.sheet-layer')) && (await hash()) === '#/ch/11-pythagore', 'Échap ferme les réglages');
await p.reload({ waitUntil: 'networkidle0' });
await wait(500);
t((await p.evaluate(() => document.documentElement.dataset.theme + document.documentElement.dataset.size)) === 'dark2', 'réglages conservés après rechargement');
const exTop1 = await topOf('#ex-C2');
t(Math.abs(exTop1 - exTop0) < 60, 'rechargement → position de lecture restaurée (même exercice à l’écran, malgré le texte agrandi)', `${exTop0}→${exTop1}`);

console.log('Remonter, reprendre, rechercher');
await p.click('.appbar [data-act="up"]');
await wait(500);
t((await hash()) === '#/' || (await hash()) === '', '« ← » ramène à l’accueil');
t(!!(await p.$('.resume-card[href^="#/ch/11-pythagore"]')), 'bloc « Reprendre la lecture » pointe vers le chapitre 11');
await p.click('.search-entry');
await wait(300);
await p.type('#q', 'mediane');
await wait(600);
const nres = await p.$$eval('.res', (r) => r.length);
t(nres > 3, 'recherche « mediane » (sans accent) trouve des résultats', `n=${nres}`);
const first = await p.$eval('.res-group .res', (a) => a.getAttribute('href'));
await p.click('.res-group .res');
await p.waitForSelector('article.prose section');
await wait(500);
t((await hash()) === first, 'résultat → section du chapitre', first);
await p.goBack();
await wait(600);
t((await p.$eval('#q', (i) => i.value)) === 'mediane' && (await p.$$eval('.res', (r) => r.length)) === nres, 'retour → la recherche et ses résultats sont conservés');

console.log('Hors ligne');
await p.setOfflineMode(true);
await p.goto(URL + '#/ch/15-geometrie-espace/s3', { waitUntil: 'load' });
await p.waitForSelector('article.prose section', { timeout: 10000 }).catch(() => {});
await wait(800);
t(!!(await p.$('article.prose section')), 'hors ligne : un chapitre jamais ouvert s’affiche (15, § 3)');
const imgs = await p.$$eval('#s3 ~ figure img, section[aria-labelledby="s3"] img', (l) => l.map((i) => i.complete && i.naturalWidth > 0));
await p.evaluate(() => document.querySelectorAll('section[aria-labelledby="s3"] img').forEach((i) => (i.loading = 'eager')));
await wait(800);
const imgs2 = await p.$$eval('section[aria-labelledby="s3"] img', (l) => l.map((i) => i.complete && i.naturalWidth > 0));
t(imgs2.length > 0 && imgs2.every(Boolean), `hors ligne : figures affichées (${imgs2.length})`, JSON.stringify(imgs));
await p.goto(URL + '#/recherche?q=patron', { waitUntil: 'load' });
await wait(1200);
t((await p.$$eval('.res', (r) => r.length)) > 0, 'hors ligne : la recherche fonctionne');
await p.setOfflineMode(false);

t(errors.length === 0, 'aucune erreur JavaScript', errors.join(' | '));
await browser.close();
console.log(`\n${pass} réussis, ${fail} échoués`);
process.exit(fail ? 1 : 0);
