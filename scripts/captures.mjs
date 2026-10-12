#!/usr/bin/env node
/**
 * Captures d'écran de contrôle (Chrome headless) : mobile 390×844 clair + sombre, et 1280×800.
 * Prérequis : `npm run build` puis `npm run preview` (http://localhost:4173/).
 * Usage : node scripts/captures.mjs [url]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'captures');
const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];

async function newPage(browser, { w, h, mobile, dark }) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  // pas de toast « hors ligne prêt » sur les captures
  await p.evaluateOnNewDocument(() => {
    const st = document.createElement('style');
    st.textContent = '.toasts{display:none!important} .viewer-hint{display:none} .flash{animation:none!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  });
  return p;
}
const go = async (p, hash) => {
  await p.evaluate((h) => {
    const a = document.createElement('a');
    a.href = h;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, hash);
  await wait(450);
};
const shot = async (p, name) => {
  const f = path.join(OUT, name + '.png');
  await p.screenshot({ path: f });
  console.log('  ', path.relative(ROOT, f));
};
const scrollToId = async (p, id, extra = 0) => {
  await p.evaluate((id, extra) => {
    const el = document.getElementById(id);
    const hh = document.querySelector('.appbar').getBoundingClientRect().bottom;
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY - hh - 10 + extra);
  }, id, extra);
  await wait(350);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
for (const dark of [false, true]) {
  const t = dark ? 'sombre' : 'clair';
  console.log(`Mobile 390×844, thème ${t}`);
  const p = await newPage(browser, { w: 390, h: 844, mobile: true, dark });
  await p.goto(URL, { waitUntil: 'networkidle0' });
  // une lecture en cours pour montrer « Reprendre la lecture »
  await p.evaluate(() => {
    localStorage.setItem('compendium-maths.last', JSON.stringify({ slug: '12-thales', id: 's2-3', label: '2.3 Calculer une longueur', ratio: 0.32, at: Date.now() }));
    localStorage.setItem('compendium-maths.progress', JSON.stringify({ '12-thales': 0.32, '11-pythagore': 1, '01-fractions-rationnels': 0.6 }));
  });
  await p.reload({ waitUntil: 'networkidle0' });
  await wait(300);
  await shot(p, `mobile-${t}-01-accueil`);

  await go(p, '#/recherche');
  await p.type('#q', 'hypoténuse', { delay: 20 });
  await wait(700);
  await p.evaluate(() => document.activeElement.blur());
  await wait(200);
  await shot(p, `mobile-${t}-02-recherche`);

  await go(p, '#/ch/11-pythagore');
  await p.waitForSelector('article.prose section');
  await wait(300);
  await shot(p, `mobile-${t}-03-chapitre11-haut`);

  await scrollToId(p, 's3-7', 0);
  await p.click('.bottombar [data-act="toc"]');
  await wait(500);
  await shot(p, `mobile-${t}-04-sommaire`);
  await p.goBack(); // le bouton retour ferme le tiroir
  await wait(400);

  await scrollToId(p, 's3-2', 0);
  await shot(p, `mobile-${t}-05-figure`);
  await p.click('#s3-2 ~ figure .fig-zoom');
  await wait(500);
  await shot(p, `mobile-${t}-06-figure-plein-ecran`);
  await p.goBack();
  await wait(300);

  await go(p, '#/ch/11-pythagore/ex-B1');
  await wait(300);
  await p.click('#ex-B1 .cor-toggle');
  await wait(300);
  await scrollToId(p, 'ex-B1', -8);
  await shot(p, `mobile-${t}-07-corrige-deplie`);

  await go(p, '#/ch/11-pythagore/cor-C1');
  await wait(300);
  await scrollToId(p, 'cor-B3', 0);
  await shot(p, `mobile-${t}-08-corriges`);

  await go(p, '#/ch/11-pythagore/s11');
  await wait(300);
  await shot(p, `mobile-${t}-09-fiche`);

  await p.click('.appbar [data-act="settings"]');
  await wait(500);
  await shot(p, `mobile-${t}-10-reglages`);
  await p.goBack();
  await wait(300);

  await go(p, '#/ch/07-equations-inequations/s2');
  await wait(400);
  await shot(p, `mobile-${t}-11-equations-balance`);
  await p.browserContext().close();
}

console.log('Ordinateur 1280×800');
for (const dark of [false, true]) {
  const t = dark ? 'sombre' : 'clair';
  const p = await newPage(browser, { w: 1280, h: 800, mobile: false, dark });
  await p.goto(URL + '#/ch/11-pythagore/s3', { waitUntil: 'networkidle0' });
  await wait(600);
  await shot(p, `ordinateur-${t}-chapitre11`);
  if (!dark) {
    await go(p, '#/');
    await wait(300);
    await shot(p, `ordinateur-${t}-accueil`);
  }
  await p.browserContext().close();
}
await browser.close();
if (errors.length) {
  console.log('Erreurs JS :', [...new Set(errors)].join('\n'));
  process.exit(1);
}
console.log('OK, aucune erreur JS.');
