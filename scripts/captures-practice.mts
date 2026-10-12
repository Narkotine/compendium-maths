/**
 * Captures « S'entraîner » (mobile 390×844, clair + sombre) → captures/mobile-<thème>-entrainement-*.png
 * Prérequis : `npm run build` puis `npm run preview`.  Usage : npx tsx scripts/captures-practice.mts [url]
 */
import fs from 'node:fs';
import puppeteer, { type Page } from 'puppeteer-core';
import ch07 from '../src/practice/ch07/index';
import { generate } from '../src/practice/engine/series';
import { strToSeed } from '../src/practice/engine/rng';
import type { Step, Level } from '../src/practice/engine/types';
import type { Q } from '../src/practice/engine/q';

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const SLUG = '07-equations-inequations';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errors: string[] = [];
const fmtQ = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n}/${v.d}`);
const relCode: Record<string, string> = { '<': 'lt', '<=': 'le', '>': 'gt', '>=': 'ge' };

async function tap(p: Page, sel: string) {
  await p.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
  await p.click(sel);
}
async function fillStep(p: Page, i: number, s: Step, good = true) {
  const sel = `.pt-step[data-i="${i}"]`;
  const a = s.answer;
  if (a.kind === 'choice') return tap(p, `${sel} .pt-choice[data-i="${good ? a.correct : (a.correct + 1) % a.options.length}"]`);
  if (a.kind === 'ray') {
    const right = a.rel === '>' || a.rel === '>=';
    await tap(p, `${sel} [data-side="${right === good ? 'right' : 'left'}"]`);
    await tap(p, `${sel} [data-incl="${a.rel.length === 2 ? 1 : 0}"]`);
  } else if (a.kind === 'ineq') {
    await tap(p, `${sel} [data-rel="${relCode[a.rel]}"]`);
    await typeIn(p, sel, [fmtQ(a.bound)]);
  } else if (a.kind === 'set') {
    if (!a.expect.length) await tap(p, `${sel} .pt-none`);
    else await typeIn(p, sel, [a.expect.map((v) => ('q' in v ? fmtQ(v.q) : a.approx ? (v.s * Math.sqrt(v.sqrt.n / v.sqrt.d)).toFixed(2).replace('.', ',') : `${v.s < 0 ? '-' : ''}√${fmtQ(v.sqrt)}`)).join(' ; ')]);
  } else if (a.kind === 'num') {
    await typeIn(p, sel, a.fields.map((f) => (f.approx ? f.approx.value.toFixed(f.approx.dp).replace('.', ',') : fmtQ(good ? f.expect : { n: f.expect.n + 7 * f.expect.d, d: f.expect.d }))));
  }
  await tap(p, `${sel} .pt-validate`);
  await wait(150);
}
async function typeIn(p: Page, sel: string, vals: string[]) {
  const ins = await p.$$(`${sel} input.pt-input`);
  for (let j = 0; j < vals.length; j++) {
    await ins[j].evaluate((e) => { e.scrollIntoView({ block: 'center' }); (e as HTMLInputElement).value = ''; });
    await ins[j].click();
    await ins[j].type(vals[j]);
  }
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
for (const dark of [false, true]) {
  const theme = dark ? 'sombre' : 'clair';
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
  p.on('pageerror', (e) => errors.push((e as Error).message));
  await p.evaluateOnNewDocument(() => {
    const st = document.createElement('style');
    st.textContent = '.toasts{display:none!important} *{caret-color:transparent!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
  });
  const shot = async (name: string, full = false) => {
    await wait(350);
    await p.screenshot({ path: `captures/mobile-${theme}-entrainement-${name}.png`, fullPage: full });
  };
  // un peu d'historique pour la page de choix (statistiques, « à retravailler »)
  await p.goto(URL, { waitUntil: 'networkidle0' });
  await p.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('compendium-maths.practice', JSON.stringify({ v: 1, types: {
      '07-equations-inequations/ax-plus-b': { n: 6, ok: 5, hint: 1, fail: 0, recent: 'oohooo', at: now },
      '07-equations-inequations/deux-membres': { n: 4, ok: 1, hint: 1, fail: 2, recent: 'ofhf', at: now },
      '07-equations-inequations/tester': { n: 3, ok: 3, hint: 0, fail: 0, recent: 'ooo', at: now },
    }, series: [], prefs: { keypad: 'auto', level: { '07-equations-inequations': 1 }, count: 8 } }));
  });
  // 1. choix
  await p.goto(URL + '#/entrainement/' + SLUG, { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-cards');
  await shot('01-choix');
  // 2. exercice avec saisie (clavier à l'écran)
  await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=parentheses&niv=2&g=capt2', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-ex');
  await p.click('.pt-step[data-i="0"] input.pt-input');
  await p.click('.keypad [data-k="-"]');
  await p.click('.keypad [data-k="1"]');
  await shot('02-exercice-saisie');
  // 3. réponse fausse + indice (erreur typique reconnue)
  let ex = generate(ch07, 'ax-plus-b', 2 as Level, strToSeed('capt3')!);
  const mistake = ex.steps[0].mistakes?.find((m) => m.on === 'num');
  await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=ax-plus-b&niv=2&g=capt3', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-ex');
  await typeIn(p, '.pt-step[data-i="0"]', [mistake && mistake.on === 'num' ? fmtQ(mistake.value) : '1']);
  await tap(p, '.pt-step[data-i="0"] .pt-validate');
  await p.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await p.evaluate(() => document.querySelector('.keypad')?.setAttribute('hidden', ''));
  await p.evaluate(() => document.documentElement.classList.remove('kp-open'));
  await p.evaluate(() => window.scrollTo(0, 0));
  await shot('03-faux-indice');
  // 4. corrigé (après deux erreurs)
  await typeIn(p, '.pt-step[data-i="0"]', ['1000']);
  await tap(p, '.pt-step[data-i="0"] .pt-validate');
  await p.evaluate(() => { document.querySelector('.keypad')?.setAttribute('hidden', ''); document.documentElement.classList.remove('kp-open'); (document.activeElement as HTMLElement)?.blur(); });
  await p.evaluate(() => document.querySelector('.pt-step')!.scrollIntoView({ block: 'start' }));
  await p.evaluate(() => window.scrollBy(0, -70));
  await shot('04-corrige');
  // 5. inéquation : droite graduée
  ex = generate(ch07, 'inequation', 3 as Level, strToSeed('capt5')!);
  await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=inequation&niv=3&g=capt5', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-ex');
  await fillStep(p, 0, ex.steps[0]);
  await p.evaluate(() => { document.querySelector('.keypad')?.setAttribute('hidden', ''); document.documentElement.classList.remove('kp-open'); (document.activeElement as HTMLElement)?.blur(); });
  const a1 = ex.steps[1].answer as { rel: string };
  await tap(p, `.pt-step[data-i="1"] [data-side="${a1.rel.startsWith('>') ? 'right' : 'left'}"]`);
  await tap(p, `.pt-step[data-i="1"] [data-incl="${a1.rel.length === 2 ? 1 : 0}"]`);
  await p.evaluate(() => document.querySelector('.pt-step[data-i="1"]')!.scrollIntoView({ block: 'end' }));
  await p.evaluate(() => window.scrollBy(0, 40));
  await shot('05-droite-graduee');
  // 6. bilan d'une série de 5 (juste, indice, faux, juste, juste)
  await p.goto(URL + '#/entrainement/' + SLUG + '/serie?t=mix&niv=2&n=5&g=capt6', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-ex');
  for (let k = 0; k < 5; k++) {
    const it = await p.evaluate(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)!;
        if (key.startsWith('compendium-maths.serie:') && key.endsWith(location.hash)) { const s = JSON.parse(sessionStorage.getItem(key)!); return s.items[s.idx]; }
      }
    });
    const e = generate(ch07, it.type, it.level, it.seed);
    for (let i = 0; i < e.steps.length; i++) {
      const s = e.steps[i];
      const one = s.answer.kind === 'choice' && (s.answer.attempts ?? (s.answer.options.length > 2 ? 2 : 1)) === 1;
      if (i === 0 && k === 1 && !one) await fillStep(p, i, s, false);
      if (i === 0 && k === 2) { await fillStep(p, i, s, false); if (!one && !(await p.$('.pt-step[data-i="0"].pt-step--locked'))) await fillStep(p, i, { ...s, answer: s.answer.kind === 'choice' ? { ...s.answer, correct: (s.answer.correct + 1) % s.answer.options.length } : s.answer }, false); if (await p.$('.pt-step[data-i="0"].pt-step--locked')) continue; }
      await fillStep(p, i, s, true);
    }
    await tap(p, '[data-act="next"]');
    await wait(250);
  }
  await p.waitForSelector('.pt-summary');
  await p.evaluate(() => { document.querySelector('.keypad')?.setAttribute('hidden', ''); document.documentElement.classList.remove('kp-open'); window.scrollTo(0, 0); });
  await shot('06-bilan');
  await ctx.close();
}
await browser.close();
console.log(errors.length ? 'ERREURS : ' + errors.join(' | ') : 'captures OK (12)');
