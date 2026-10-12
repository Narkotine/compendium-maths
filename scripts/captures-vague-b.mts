/**
 * Captures mobiles (390×844, clair + sombre) des chapitres de la vague B : 01, 05, 04, 02, et « Mes progrès »
 * → captures/mobile-<thème>-exos-<NN>-*.png.  Prérequis : build + preview.
 * Usage : npx tsx scripts/captures-vague-b.mts [url]
 */
import puppeteer, { type Page } from 'puppeteer-core';
import ch01 from '../src/practice/ch01/index';
import ch02 from '../src/practice/ch02/index';
import ch04 from '../src/practice/ch04/index';
import ch05 from '../src/practice/ch05/index';
import { generate } from '../src/practice/engine/series';
import { strToSeed } from '../src/practice/engine/rng';
import { texToInput } from '../src/practice/engine/algebra';
import type { ChapterPractice, Level, Step } from '../src/practice/engine/types';
import type { Q } from '../src/practice/engine/q';

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errors: string[] = [];
const fmtQ = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n}/${v.d}`);
function dec(v: Q) {
  let k = 0;
  while (Math.abs(Math.round((v.n / v.d) * 10 ** k) - (v.n / v.d) * 10 ** k) > 1e-9 && k < 13) k++;
  return (v.n / v.d).toFixed(k).replace('.', ',');
}
async function tap(p: Page, sel: string) {
  await p.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
  await p.click(sel);
}
async function typeIn(p: Page, sel: string, vals: string[]) {
  const ins = await p.$$(`${sel} input.pt-input`);
  for (let j = 0; j < vals.length; j++) {
    await ins[j].evaluate((e) => { e.scrollIntoView({ block: 'center' }); (e as HTMLInputElement).value = ''; });
    await ins[j].click();
    await ins[j].type(vals[j]);
  }
}
/** Saisit une réponse (juste, ou la valeur imposée) et valide. */
async function answer(p: Page, i: number, s: Step, raw?: string[]) {
  const sel = `.pt-step[data-i="${i}"]`;
  const a = s.answer;
  if (a.kind === 'choice') await tap(p, `${sel} .pt-choice[data-i="${a.correct}"]`);
  else {
    const vals = raw ?? (a.kind === 'expr' ? [texToInput(a.tex)] : a.kind === 'num' ? a.fields.map((f) => (f.approx ? f.approx.value.toFixed(f.approx.dp).replace('.', ',') : f.form === 'decimal' ? dec(f.expect) : fmtQ(f.expect))) : []);
    await typeIn(p, sel, vals);
    await tap(p, `${sel} .pt-validate`);
  }
  await wait(200);
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const files: string[] = [];
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
    await wait(400);
    const f = `captures/mobile-${theme}-${name}.png`;
    await p.screenshot({ path: f, fullPage: full });
    files.push(f);
  };
  const open = async (ch: ChapterPractice, t: string, lv: Level, g: string) => {
    await p.goto(URL + `#/entrainement/${ch.slug}/exo?t=${t}&niv=${lv}&g=${g}`, { waitUntil: 'networkidle0' });
    await p.waitForSelector('.pt-ex');
    await wait(300);
    return generate(ch, t, lv, strToSeed(g)!);
  };
  const solution = async () => {
    if (!(await p.$('.pt-solution:not([hidden])'))) await tap(p, '.pt-peek:not([hidden]) button').catch((err) => console.log('corrigé ?', String(err)));
    await wait(300);
    await p.$eval('.pt-solution', (e) => e.scrollIntoView({ block: 'start' })).catch(() => {});
  };

  const all = async (e: { steps: Step[] }) => { for (let i = 0; i < e.steps.length; i++) await answer(p, i, e.steps[i]); };
  const wrong = async (s: Step) => {
    const a = s.answer;
    const mk = s.mistakes?.find((x) => x.on === 'num' || x.on === 'numAll');
    if (a.kind !== 'num' || !mk) return void console.log('pas d’erreur typique numérique');
    const fmt = (v: Q, j: number) => (a.fields[j]?.form === 'decimal' ? dec(v) : fmtQ(v));
    const vals = mk.on === 'numAll' ? mk.values.map(fmt) : a.fields.map((f, j) => fmt(j === (mk.field ?? 0) ? mk.value : f.expect, j));
    await answer(p, 0, s, vals);
  };
  let e;
  // ---- 01 Fractions
  e = await open(ch01, 'lire', 1, 'capb1'); await shot('exos-01-01-figure');
  e = await open(ch01, 'addition', 2, 'capb2'); await wrong(e.steps[0]); await shot('exos-01-02-erreur-typique');
  e = await open(ch01, 'probleme', 2, 'capb3'); await all(e); await solution(); await shot('exos-01-03-corrige');
  // ---- 05 Proportionnalité
  e = await open(ch05, 'reconnaitre', 2, 'capb4'); await shot('exos-05-01-graphique');
  e = await open(ch05, 'evolution', 2, 'capb5'); await wrong(e.steps[0]); await shot('exos-05-02-erreur-typique');
  e = await open(ch05, 'echelle', 2, 'capb6'); await all(e); await solution(); await shot('exos-05-03-corrige');
  // ---- 04 Puissances
  e = await open(ch04, 'scientifique', 1, 'capb7'); await shot('exos-04-01-notation-scientifique');
  e = await open(ch04, 'regles', 2, 'capb8'); await wrong(e.steps[0]); await shot('exos-04-02-erreur-typique');
  e = await open(ch04, 'racine', 2, 'capb9'); await all(e); await solution(); await shot('exos-04-03-corrige');
  // ---- 02 Entiers et décimaux
  e = await open(ch02, 'comparer', 2, 'capb10'); await shot('exos-02-01-droite-graduee');
  e = await open(ch02, 'decomposer', 3, 'capb11'); await wrong(e.steps[0]); await shot('exos-02-02-erreur-typique');
  e = await open(ch02, 'partage', 2, 'capb12'); await all(e); await solution(); await shot('exos-02-03-corrige');
  // ---- Mes progrès (données réelles des exercices ci-dessus)
  await p.goto(URL + '#/progres', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pg-ch');
  await shot('progres-01');
  await p.evaluate(() => document.querySelector('[data-slug="04-puissances-notation-scientifique"]')!.scrollIntoView({ block: 'start' }));
  await shot('progres-02-chapitres');
  await ctx.close();
}
await browser.close();
console.log(files.join('\n'));
if (errors.length) { console.log('ERREURS JS :', errors.join(' | ')); process.exit(1); }
