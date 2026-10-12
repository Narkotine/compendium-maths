#!/usr/bin/env -S npx tsx
/**
 * Parcours « ranger » (cartes à glisser) dans Chrome headless : vrais glisser au doigt (Input.dispatchTouchEvent
 * via CDP) et à la souris, boutons ↑↓, toucher-placer, clavier, page immobile pendant le glisser, défilement
 * automatique au bord, glissement rapide = pas de déplacement, 320 px, thème sombre, reprise, 02 et 03.
 * Prérequis : build + preview. Usage : npx tsx scripts/test-order.mts
 */
import puppeteer, { type Page } from 'puppeteer-core';
import ch01 from '../src/practice/ch01/index';
import ch02 from '../src/practice/ch02/index';
import ch03 from '../src/practice/ch03/index';
import { generate, exoHash } from '../src/practice/engine/series';
import type { ChapterPractice, Level, OrderAnswer } from '../src/practice/engine/types';

const BASE = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const W = (ms: number) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (c: unknown, m: string, x: unknown = '') => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m, JSON.stringify(x)); } };
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const ctx = await b.createBrowserContext();
const p = await ctx.newPage();
const errors: string[] = [];
p.on('pageerror', (e) => errors.push(String(e)));
const mobile = (w = 390, h = 844) => p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
await mobile();
await p.goto(BASE, { waitUntil: 'networkidle0' });
await W(1500);

const ans = (ch: ChapterPractice, id: string, lv: Level, seed: number, step = 0) => generate(ch, id, lv, seed).steps[step].answer as OrderAnswer;
const goodOrder = (a: OrderAnswer) => a.items.map((_, i) => i).sort((i, j) => (a.dir === 'asc' ? 1 : -1) * (a.values[i].n * a.values[j].d - a.values[j].n * a.values[i].d));
const isGood = (a: OrderAnswer, o: number[]) => o.every((it, k) => k === 0 || (a.dir === 'asc' ? 1 : -1) * (a.values[o[k - 1]].n * a.values[it].d - a.values[it].n * a.values[o[k - 1]].d) <= 0);
async function open(ch: ChapterPractice, id: string, lv: Level, seed: number) {
  await p.goto(BASE + exoHash(ch.slug, id, lv, seed), { waitUntil: 'networkidle0' });
  await p.waitForSelector('.po-card');
  await p.evaluate(() => document.querySelectorAll('.toast').forEach((x) => x.remove()));
  await p.$eval('.pt-step:not([hidden]) .po', (e) => e.scrollIntoView({ block: 'center' }));
  await W(200);
}
const order = (sel = '.pt-step:not([hidden])') => p.$$eval(`${sel} .po-card`, (cs) => cs.map((c) => Number((c as HTMLElement).dataset.item)));
const center = (k: number, part: 'grip' | 'val' = 'val') => p.evaluate((k, part) => { const r = document.querySelectorAll('.pt-step:not([hidden]) .po-card')[k].querySelector(part === 'grip' ? '.po-grip' : '.po-val')!.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, k, part);
const cdp = await p.createCDPSession();
const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x = 0, y = 0) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
/** Glisser au doigt de la carte en position « from » vers la position « to » (appui, puis mouvement par petits pas). */
async function touchDrag(from: number, to: number, opt: { hold?: number; part?: 'grip' | 'val'; probe?: (step: number) => Promise<void> } = {}) {
  const a = await center(from, opt.part), z = await center(to);
  const dy = z.y - a.y + (to > from ? 12 : -12);
  await touch('touchStart', a.x, a.y);
  await W(opt.hold ?? 260);
  const N = 14;
  for (let s = 1; s <= N; s++) { await touch('touchMove', a.x, a.y + (dy * s) / N); await W(16); if (opt.probe) await opt.probe(s); }
  await touch('touchEnd');
  await W(260);
}
async function mouseDrag(from: number, to: number) {
  const a = await center(from), z = await center(to);
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  const dy = z.y - a.y + (to > from ? 10 : -10);
  for (let s = 1; s <= 12; s++) { await p.mouse.move(a.x, a.y + (dy * s) / 12); await W(12); }
  await p.mouse.up(); await W(250);
}
/** Range par une suite de déplacements « move(from, to) » (tri par sélection). */
async function sortWith(a: OrderAnswer, move: (from: number, to: number) => Promise<void>) {
  const g = goodOrder(a);
  for (let k = 0; k < g.length; k++) {
    const cur = await order();
    const want = a.values[g[k]];
    // la carte qui doit aller en k (à valeur égale, n'importe laquelle)
    const from = cur.findIndex((it, j) => j >= k && a.values[it].n * want.d === want.n * a.values[it].d);
    if (from !== k) await move(from, k);
  }
}
const validate = async () => { await p.$eval('.pt-step:not([hidden]) .pt-validate', (e) => (e as HTMLElement).scrollIntoView({ block: 'center' })); await p.click('.pt-step:not([hidden]) .pt-validate'); await W(250); };
const feedback = () => p.$eval('.pt-step:not([hidden]) .pt-feedback', (e) => e.className + ' | ' + e.textContent);

console.log('Rendu');
await open(ch01, 'ranger', 3, 11);
let A = ans(ch01, 'ranger', 3, 11);
t((await p.$$('.po-card')).length === A.items.length && (await p.$$('.po-card .katex')).length === A.items.length, `${A.items.length} cartes rendues en KaTeX`);
t(await p.$$eval('.po-card .po-val .mfrac', (x) => x.length) > 0, 'vraies fractions (KaTeX \\dfrac)');
t(await p.$eval('.po-end--top', (e, w) => e.textContent!.includes(w), A.dir === 'asc' ? 'Plus petit' : 'Plus grand'), 'rappel visuel du sens (en haut / en bas)');
t(!isGood(A, await order()), 'tirage initial non rangé');
const sizes = await p.$$eval('.po-mv', (bs) => bs.map((x) => [x.getBoundingClientRect().width, x.getBoundingClientRect().height]));
t(sizes.every(([w, h]) => w >= 44 && h >= 44), 'boutons ↑↓ ≥ 44 px');
t(await p.$eval('.po-list', (e) => getComputedStyle(e.querySelector('.po-card')!).touchAction) === 'manipulation' && await p.$eval('.po-grip', (e) => getComputedStyle(e).touchAction) === 'none', 'défilement possible sur la carte, poignée sans défilement');

console.log('Au doigt (CDP touch)');
await p.evaluate(() => scrollBy(0, 40));
await W(100);
const y0 = await p.evaluate(() => scrollY);
let midScroll = -1, transformed = false, shifted = false;
const o0 = await order();
await touchDrag(0, 2, { probe: async (s) => { if (s === 7) { midScroll = await p.evaluate(() => scrollY); transformed = await p.$eval('.po-card--drag', (e) => /translateY/.test((e as HTMLElement).style.transform)).catch(() => false); shifted = await p.$$eval('.po-card:not(.po-card--drag)', (cs) => cs.some((c) => /translateY/.test((c as HTMLElement).style.transform))); } } });
const o1 = await order();
t(o1[2] === o0[0] && o1.length === o0.length, 'appui puis glisser : carte déplacée de la position 1 à 3', { o0, o1 });
t(transformed, 'la carte suit le doigt pendant le glisser');
t(shifted, 'les autres cartes s’écartent');
t(midScroll === y0, 'la page ne défile pas pendant le glisser', { y0, midScroll });
// glissement rapide sans appui : défilement, pas de déplacement
const before = await order();
const c1 = await center(1);
await touch('touchStart', c1.x, c1.y);
for (let s = 1; s <= 8; s++) { await touch('touchMove', c1.x, c1.y - s * 25); await W(8); }
await touch('touchEnd'); await W(400);
t(JSON.stringify(await order()) === JSON.stringify(before), 'glissement rapide (défilement) : aucune carte déplacée');
await p.$eval('.po', (e) => e.scrollIntoView({ block: 'center' })); await W(200);
// poignée : glisser immédiat
const ob = await order();
await touchDrag(3, 1, { hold: 0, part: 'grip' });
const oa = await order();
t(oa[1] === ob[3], 'poignée ⠿ : glisser sans attendre', { ob, oa });
// tri complet au doigt puis Valider
await p.$eval('.po', (e) => e.scrollIntoView({ block: 'center' })); await W(150);
await sortWith(A, (f, to) => touchDrag(f, to));
t(isGood(A, await order()), 'cartes rangées au doigt', await order());
await validate();
let fb = await feedback();
t(/pt-fb--ok/.test(fb) && /Juste !/.test(fb), 'ranger juste → « Juste ! »', fb);
t((await p.$$('.po-card--ok')).length === A.items.length, 'toutes les cartes marquées ✓');

console.log('Défilement automatique au bord');
await mobile(390, 600);
await open(ch01, 'ranger', 3, 12);
await p.evaluate(() => { const r = document.querySelector('.po-card')!.getBoundingClientRect(); scrollBy(0, r.top - 70); });
await W(150);
{
  const s0 = await p.evaluate(() => scrollY);
  const a = await center(0);
  await touch('touchStart', a.x, a.y); await W(260);
  for (let s = 1; s <= 10; s++) { await touch('touchMove', a.x, a.y + ((585 - a.y) * s) / 10); await W(16); }
  await W(700);
  const s1 = await p.evaluate(() => scrollY);
  await touch('touchEnd'); await W(300);
  t(s1 > s0 + 30, 'près du bord bas, la page défile toute seule', { s0, s1 });
}
await mobile();

console.log('À la souris + erreur');
await open(ch01, 'ranger', 2, 21);
A = ans(ch01, 'ranger', 2, 21);
{
  const g = goodOrder(A);
  // une seule carte mal placée : on range tout puis on échange les deux premières (valeurs différentes)
  await sortWith(A, mouseDrag);
  t(isGood(A, await order()), 'cartes rangées à la souris');
  await mouseDrag(0, 1);
  const o = await order();
  t(!isGood(A, o) && o[0] === g[1], 'glisser à la souris : échange des deux premières', o);
  await validate();
  fb = await feedback();
  const ko = await p.$$eval('.po-card--ko', (cs) => cs.map((c) => [c.querySelector('.po-mark')!.textContent, c.getAttribute('aria-label')]));
  t(/pt-fb--hint/.test(fb) && /mauvais ordre|Tu as rangé|C’est l’ordre/.test(fb), 'faux → message ciblé (paire mal rangée ou erreur typique)', fb);
  t(ko.length === 2 && ko.every(([m, l]) => m === '✗' && /mal placée/.test(l ?? '')), 'cartes signalées : couleur + icône ✗ + texte pour lecteur d’écran', ko);
  t(/Indice/.test(fb), 'indice affiché');
  await mouseDrag(1, 0);
  t((await p.$$('.po-card--ko')).length === 0, 'un déplacement efface les marques');
  await validate();
  fb = await feedback();
  t(/pt-fb--ok/.test(fb), 'corrigé par l’élève → juste');
}

console.log('Boutons ↑↓, toucher-placer, clavier');
await open(ch01, 'ranger', 1, 31);
A = ans(ch01, 'ranger', 1, 31);
await sortWith(A, async (f, to) => { for (let k = f; k > to; k--) { await p.click(`.po-card:nth-child(${k + 1}) [data-mv="-1"]`); await W(220); } });
t(isGood(A, await order()), 'rangé avec les seuls boutons ↑');
t(await p.$eval('.po-live', (e) => /position/.test(e.textContent ?? '')), 'annonce « position k sur n » pour les lecteurs d’écran');
await validate();
t(/pt-fb--ok/.test(await feedback()), 'boutons → « Juste »');
await open(ch01, 'ranger', 1, 32);
A = ans(ch01, 'ranger', 1, 32);
{
  const o = await order();
  await p.click('.po-card:nth-child(4) .po-val');
  await W(80);
  t(await p.$eval('.po-card:nth-child(4)', (e) => e.classList.contains('po-card--sel')), 'toucher une carte la sélectionne');
  await p.click('.po-card:nth-child(1) .po-val');
  await W(250);
  const o2 = await order();
  t(o2[0] === o[3], 'puis toucher une position : la carte y va', { o, o2 });
}
await open(ch01, 'ranger', 2, 33);
A = ans(ch01, 'ranger', 2, 33);
await sortWith(A, async (f, to) => {
  await p.focus(`.po-card:nth-child(${f + 1})`);
  await p.keyboard.press('Space');
  for (let k = f; k > to; k--) await p.keyboard.press('ArrowUp');
  await p.keyboard.press('Space');
  await W(60);
});
t(isGood(A, await order()), 'rangé au clavier (Espace, flèches, Espace)');
t(await p.$eval('.po-live', (e) => /déposée/.test(e.textContent ?? '')), 'annonce « déposée »');
await p.focus('.po-card:nth-child(1)');
await p.keyboard.press('Space'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Escape'); await W(100);
t(isGood(A, await order()), 'Échap annule le déplacement en cours');
await validate();
t(/pt-fb--ok/.test(await feedback()), 'clavier → « Juste »');

console.log('Non touché, reprise (série)');
await p.goto(BASE + '#/entrainement/01-fractions-rationnels/serie?t=ranger&niv=2&n=3&g=r41', { waitUntil: 'networkidle0' });
await p.waitForSelector('.po-card');
await p.evaluate(() => document.querySelectorAll('.toast').forEach((x) => x.remove()));
await validate();
fb = await feedback();
t(/pt-fb--info/.test(fb) && /Fais glisser/.test(fb), 'valider sans rien bouger : invitation, pas compté faux', fb);
await p.click('.po-card:nth-child(2) [data-mv="-1"]'); await W(100);
const kept = await order();
await p.reload({ waitUntil: 'networkidle0' }); await p.waitForSelector('.po-card'); await W(200);
t(JSON.stringify(await order()) === JSON.stringify(kept), 'ordre en cours conservé après rechargement');

console.log('Échec : bonne réponse et corrigé');
await open(ch01, 'ranger', 3, 51);
A = ans(ch01, 'ranger', 3, 51);
for (let i = 0; i < 2; i++) { await p.click('.po-card:nth-child(2) [data-mv="-1"]'); await W(80); if (isGood(A, await order())) await p.click('.po-card:nth-child(3) [data-mv="-1"]'); await validate(); }
fb = await feedback();
t(/pt-fb--ko/.test(fb) && /La bonne réponse/.test(fb), 'deux essais faux → bonne réponse affichée', fb);
t(await p.$eval('.pt-solution', (e) => !(e as HTMLElement).hidden && /Donc/.test(e.textContent ?? '')), 'corrigé affiché, avec le bon ordre');
t(await p.$$eval('.po-mv', (bs) => bs.every((x) => (x as HTMLButtonElement).disabled)), 'cartes verrouillées après la fin');

console.log('Relatifs (03) et décimaux (02)');
await open(ch03, 'ranger', 2, 61);
A = ans(ch03, 'ranger', 2, 61);
await sortWith(A, (f, to) => touchDrag(f, to));
await validate();
t(/pt-fb--ok/.test(await feedback()), '03 ranger : glisser au doigt → juste');
await open(ch02, 'comparer', 2, 62);
A = ans(ch02, 'comparer', 2, 62, 0);
await sortWith(A, mouseDrag);
await validate();
t(/pt-fb--ok/.test(await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.className)), '02 comparer ★★ a) : rangé à la souris → juste');
t(await p.$eval('.pt-step[data-i="1"]', (e) => !(e as HTMLElement).hidden), '02 : l’étape suivante s’ouvre');
t(await p.$eval('[data-act="calc"]', (e) => (e as HTMLElement).hidden).catch(() => true), 'pas de calculatrice sur ces types');
await open(ch01, 'ranger', 1, 63);
t(await p.$eval('[data-act="calc"]', (e) => (e as HTMLElement).hidden).catch(() => true), '01 ranger : pas de calculatrice');

console.log('320 px et thème sombre');
await mobile(320, 640);
await p.evaluate(() => localStorage.setItem('compendium-maths.settings', JSON.stringify({ theme: 'dark', size: 1, openCor: false, calc: true })));
await p.goto(BASE + exoHash(ch01.slug, 'ranger', 3, 71), { waitUntil: 'networkidle0' });
await p.reload({ waitUntil: 'networkidle0' });
await open(ch01, 'ranger', 3, 71);
A = ans(ch01, 'ranger', 3, 71);
t(await p.evaluate(() => document.documentElement.scrollWidth <= 320), 'pas de débordement horizontal à 320 px');
t(await p.$$eval('.po-card', (cs) => cs.every((c) => c.getBoundingClientRect().right <= 320 && c.querySelector('.katex')!.getBoundingClientRect().right <= c.querySelector('.po-btns')!.getBoundingClientRect().left + 1)), 'cartes entières, nombres non masqués par les boutons');
const bg = await p.$eval('.po-card', (e) => getComputedStyle(e).backgroundColor);
t(/rgb\((\d+), (\d+), (\d+)\)/.test(bg) && Number(/rgb\((\d+)/.exec(bg)![1]) < 80, 'thème sombre : cartes sombres', bg);
await sortWith(A, (f, to) => touchDrag(f, to));
await validate();
t(/pt-fb--ok/.test(await feedback()), '320 px, sombre : glisser au doigt → juste');
await p.evaluate(() => localStorage.removeItem('compendium-maths.settings'));

t(errors.length === 0, 'aucune erreur JavaScript', errors);
await b.close();
console.log(`\n${pass} réussis, ${fail} échoués`);
process.exit(fail ? 1 : 0);
