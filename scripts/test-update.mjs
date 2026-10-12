/**
 * Mise à jour du service worker en conditions réelles : une version A est servie et mise en cache, puis la
 * version B est servie AU MÊME ENDROIT. On vérifie qu'on passe à B sans « ?r= » et sans « Page introuvable ».
 * A = dist avec un index « ancien » (entraînement du chapitre 02 désactivé), B = dist avec une version suivante.
 * Les révisions du pré-cache (sw.js) sont recalculées pour les fichiers modifiés, comme le ferait un vrai build.
 * Usage : node scripts/test-update.mjs   (après npm run build)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const ROOT = '/tmp/mc-update-test';
const PORT = 4310;
const ORIGIN = `http://localhost:${PORT}`;
const U = `${ORIGIN}/compendium-maths/`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (ok, label, extra = '') => { ok ? pass++ : fail++; console.log(`  ${ok ? '✓' : '✗'} ${label}${!ok && extra ? ` — ${extra}` : ''}`); };

function makeVersion(name, edit) {
  const dir = path.join(ROOT, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync('dist', dir, { recursive: true });
  const f = path.join(dir, 'content/index.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  edit(j);
  fs.writeFileSync(f, JSON.stringify(j));
  const rev = crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
  const sw = path.join(dir, 'sw.js');
  fs.writeFileSync(sw, fs.readFileSync(sw, 'utf8').replace(/(\{url:"content\/index\.json",revision:")[0-9a-f]+/, `$1${rev}`));
  return j.version;
}
fs.mkdirSync(ROOT, { recursive: true });
const vA = makeVersion('A', (j) => { j.version = '0.0.1-A'; const c = j.chapters.find((x) => x.slug.startsWith('02')); c.practice = { ...c.practice, enabled: false }; });
const vB = makeVersion('B', (j) => { j.version = '0.0.2-B'; });
const use = (v) => fs.symlinkSync(v, path.join(ROOT, 'current.tmp')) || fs.renameSync(path.join(ROOT, 'current.tmp'), path.join(ROOT, 'current'));
use('A');
const srv = spawn('node', ['scripts/sw-server.mjs', ROOT, String(PORT)], { stdio: 'ignore' });
await wait(800);

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const version = (p) => p.evaluate(() => fetch('content/index.json').then((r) => r.json()).then((j) => j.version));
const sawNotFound = (p) => p.evaluate(() => window.__nf === true);
async function fresh() {
  use('A');
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.evaluateOnNewDocument(() => {
    // trace : la page « introuvable » a-t-elle été affichée à un moment ?
    new MutationObserver(() => { if (/Page introuvable/.test(document.body?.innerText ?? '')) window.__nf = true; }).observe(document, { subtree: true, childList: true });
  });
  await p.goto(U, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => navigator.serviceWorker.ready.then((r) => !!r.active), { timeout: 20000 });
  await p.reload({ waitUntil: 'networkidle0' });
  await p.waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 10000 });
  return { ctx, p };
}

console.log('1. Lien vers un contenu nouveau, appli A ouverte depuis longtemps');
{
  const { ctx, p } = await fresh();
  t((await version(p)) === vA, 'A en cache et contrôlée par le service worker');
  await wait(10500); // au-delà de la fenêtre de démarrage
  use('B');
  await p.evaluate(() => { location.hash = '#/entrainement/02-entiers-et-decimaux'; });
  await p.waitForSelector('.page--practice', { timeout: 30000 }).catch(() => {});
  t(!!(await p.$('.page--practice')), 'la page d’entraînement du 02 s’ouvre (passage automatique à B)');
  t((await version(p)) === vB, 'version B active', await version(p));
  t(!(await sawNotFound(p)), 'jamais de « Page introuvable »');
  t(!/[?&]r=/.test(p.url()), 'adresse sans ?r=', p.url());
  await ctx.close();
}

console.log('2. Réouverture de l’appli après un déploiement');
{
  const { ctx, p } = await fresh();
  use('B');
  await p.reload({ waitUntil: 'networkidle0' });
  await p.waitForFunction((v) => fetch('content/index.json').then((r) => r.json()).then((j) => j.version === v), { timeout: 20000, polling: 500 }, vB).catch(() => {});
  t((await version(p)) === vB, 'B appliquée au démarrage, sans action ni deuxième rechargement', await version(p));
  await p.goto(U + '#/entrainement/02-entiers-et-decimaux', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.page--practice', { timeout: 10000 }).catch(() => {});
  t(!!(await p.$('.page--practice')) && !(await sawNotFound(p)), 'lien vers le nouveau contenu : OK');
  t(!/[?&]r=/.test(p.url()), 'adresse sans ?r=');
  await ctx.close();
}

console.log('3. Bandeau « Mettre à jour » pendant l’utilisation');
{
  const { ctx, p } = await fresh();
  await wait(10500);
  use('B');
  await p.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  await p.waitForSelector('.toast[data-update] .toast-btn', { timeout: 20000 }).catch(() => {});
  const btn = await p.$('.toast[data-update] .toast-btn');
  t(!!btn, 'bandeau affiché');
  if (btn) {
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {}), btn.click()]);
    t((await version(p)) === vB, 'un seul clic : B active après un rechargement automatique', await version(p));
    t(!/[?&]r=/.test(p.url()), 'adresse sans ?r=');
  }
  await ctx.close();
}

console.log('4. Réglages → « Forcer la mise à jour »');
{
  const { ctx, p } = await fresh();
  await wait(10500);
  use('B');
  await p.evaluate(() => { localStorage.setItem('compendium-maths.progress', JSON.stringify({ '11-pythagore': 0.5 })); });
  await p.click('[data-act="settings"]');
  await p.waitForSelector('[data-force-update]');
  await wait(400);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {}), p.$eval('[data-force-update]', (b) => b.click())]);
  await wait(1500);
  t((await version(p)) === vB, 'B chargée depuis le réseau', await version(p));
  t(!/[?&]r=/.test(p.url()), '?r= retiré de l’adresse', p.url());
  t(await p.evaluate(() => JSON.parse(localStorage.getItem('compendium-maths.progress') || '{}')['11-pythagore'] === 0.5), 'progression conservée');
  await p.waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 15000 }).catch(() => {});
  await p.reload({ waitUntil: 'networkidle0' });
  t((await version(p)) === vB && !!(await p.evaluate(() => navigator.serviceWorker.controller)), 'service worker réinstallé (B hors ligne)');
  await ctx.close();
}

console.log('5. Lien réellement inexistant : la page « introuvable » s’affiche (pas de boucle)');
{
  const { ctx, p } = await fresh();
  await p.goto(U + '#/ch/99-nexiste-pas', { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => /Page introuvable/.test(document.body.innerText), { timeout: 15000 }).catch(() => {});
  t(/Page introuvable/.test(await p.evaluate(() => document.body.innerText)), 'Page introuvable affichée');
  await wait(2000);
  t(/Page introuvable/.test(await p.evaluate(() => document.body.innerText)), 'pas de rechargement en boucle');
  await ctx.close();
}

console.log('6. GitHub Pages : pas de _headers, cache par défaut max-age=600');
{
  t(!fs.existsSync('dist/_headers'), 'pas de _headers dans dist');
  t(fs.existsSync('dist/.nojekyll') && fs.existsSync('dist/404.html'), '.nojekyll et 404.html présents');
  const r = await fetch(U + 'sw.js');
  t(r.headers.get('cache-control') === 'max-age=600', 'servi : sw.js max-age=600 (comme GitHub)', r.headers.get('cache-control'));
  // la mise à jour doit passer malgré le cache HTTP de 10 min : sw.js est relu sans cache (updateViaCache « none »)
  const { ctx, p } = await fresh();
  t(await p.evaluate(() => navigator.serviceWorker.ready.then((r) => r.updateViaCache)) === 'none', 'updateViaCache = none');
  use('B');
  await p.evaluate(() => navigator.serviceWorker.ready.then((r) => r.update()));
  await p.waitForFunction(() => navigator.serviceWorker.ready.then((r) => !!r.waiting || !!r.installing), { timeout: 15000 }).catch(() => {});
  await p.reload({ waitUntil: 'networkidle0' });
  await p.waitForFunction((v) => fetch('content/index.json').then((r) => r.json()).then((j) => j.version === v), { timeout: 20000 }, vB).catch(() => {});
  t((await version(p)) === vB, 'nouvelle version prise malgré max-age=600', await version(p));
  await ctx.close();
}

console.log('7. Sous-chemin /compendium-maths/ et cohabitation avec un autre site de la même origine');
{
  const { ctx, p } = await fresh();
  const scope = await p.evaluate(() => navigator.serviceWorker.ready.then((r) => r.scope));
  t(scope === U, 'portée du service worker = /compendium-maths/', scope);
  const man = await (await fetch(U + 'manifest.webmanifest')).json();
  t(man.start_url === '/compendium-maths/' && man.scope === '/compendium-maths/' && man.id === '/compendium-maths/', 'manifeste : start_url, scope, id');
  const keys = await p.evaluate(() => caches.keys());
  t(keys.length > 0 && keys.every((k) => k.startsWith('compendium-maths')), 'caches préfixés compendium-maths', keys.join(','));
  // navigation : un chapitre, un exercice, une figure
  await p.goto(U + '#/ch/11-pythagore', { waitUntil: 'networkidle0' });
  t(/Pythagore/.test(await p.evaluate(() => document.body.innerText)), 'chapitre affiché');
  const imgsOk = await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().then(() => true, () => false))).then((a) => a.every(Boolean)));
  t(imgsOk, 'figures du chapitre chargées');
  await p.goto(U + '#/entrainement/11-pythagore/exo?t=hypotenuse&niv=1&g=1', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-input, .pt-choice, input', { timeout: 15000 }).catch(() => {});
  t(!/introuvable/i.test(await p.evaluate(() => document.body.innerText)), 'exercice affiché');
  // hors ligne
  await p.setOfflineMode(true);
  await p.goto(U + '#/ch/12-thales', { waitUntil: 'networkidle0' });
  t(/Thalès/.test(await p.evaluate(() => document.body.innerText)), 'hors ligne : chapitre servi par le cache');
  await p.setOfflineMode(false);
  // un « site de jeux » à la racine : son cache, son stockage et son service worker survivent à « Forcer la mise à jour »
  const g = await ctx.newPage();
  await g.goto(ORIGIN + '/jeux.html');
  await g.evaluate(async () => { localStorage.setItem('jeux.score', '42'); await (await caches.open('jeux-cache')).put('/jeux.html', new Response('x')); await navigator.serviceWorker.register('/jeux-sw.js', { scope: '/' }); await navigator.serviceWorker.ready; });
  await p.goto(U, { waitUntil: 'networkidle0' });
  await p.evaluate(async () => {
    const mine = new URL('./', location.href).href;
    const regs = await navigator.serviceWorker.getRegistrations();
    window.__regs = regs.map((r) => r.scope);
  });
  t((await p.evaluate(() => window.__regs)).length === 2, 'deux enregistrements (jeux + compendium)');
  // déclenche le vrai bouton « Forcer la mise à jour » des réglages
  await p.evaluate(() => document.querySelector('[data-act="settings"], [aria-label*="églages"]')?.click());
  await wait(400);
  const btn = await p.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => /Forcer la mise à jour/.test(b.textContent)));
  t(!!(await btn.evaluate((b) => !!b)), 'bouton « Forcer la mise à jour » trouvé');
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}), btn.evaluate((b) => b?.click())]);
  await wait(1500);
  t(await g.evaluate(() => localStorage.getItem('jeux.score')) === '42', 'jeux : localStorage intact');
  t(await g.evaluate(() => caches.has('jeux-cache')), 'jeux : cache intact');
  t((await g.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.map((x) => x.scope)))).includes(ORIGIN + '/'), 'jeux : service worker intact');
  t(!(await p.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith('mc.')))), 'aucune clé « mc. » (préfixe compendium-maths.)');
  await ctx.close();
}

await browser.close();
srv.kill();
console.log(`\n${pass} réussis, ${fail} échoués`);
process.exit(fail ? 1 : 0);
