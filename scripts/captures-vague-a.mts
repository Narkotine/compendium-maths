/**
 * Captures mobiles (390×844, clair + sombre) des chapitres de la vague A : 03, 06, 11
 * → captures/mobile-<thème>-exos-<NN>-*.png.  Prérequis : build + preview.
 * Usage : npx tsx scripts/captures-vague-a.mts [url]
 */
import puppeteer, { type Page } from 'puppeteer-core';
import ch03 from '../src/practice/ch03/index';
import ch06 from '../src/practice/ch06/index';
import ch11 from '../src/practice/ch11/index';
import { generate } from '../src/practice/engine/series';
import { strToSeed } from '../src/practice/engine/rng';
import { texToInput } from '../src/practice/engine/algebra';
import type { ChapterPractice, Level, Step } from '../src/practice/engine/types';
import type { Q } from '../src/practice/engine/q';

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errors: string[] = [];
const fmtQ = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n}/${v.d}`);
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
    const vals = raw ?? (a.kind === 'expr' ? [texToInput(a.tex)] : a.kind === 'num' ? a.fields.map((f) => (f.approx ? f.approx.value.toFixed(f.approx.dp).replace('.', ',') : fmtQ(f.expect).replace('.', ','))) : []);
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

  // ---- 03 : choix des types, droite graduée, corrigé
  await p.goto(URL + '#/entrainement/03-nombres-relatifs', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-cards');
  await shot('exos-03-01-choix');
  let e = await open(ch03, 'abscisse', 2, 'cap1');
  await answer(p, 0, e.steps[0]);
  await p.$eval('.pt-figure', (x) => x.scrollIntoView({ block: 'start' }));
  await shot('exos-03-02-droite-graduee');
  e = await open(ch03, 'soustraction', 1, 'cap2');
  const s0 = e.steps[0].answer as { fields: { expect: Q }[] };
  await answer(p, 0, e.steps[0], [String(-s0.fields[0].expect.n)]);
  await shot('exos-03-03-erreur-de-signe');
  await answer(p, 0, e.steps[0]);
  await answer(p, 1, e.steps[1]);
  await solution();
  await shot('exos-03-04-corrige');

  // ---- 06 : saisie d'expression (clavier x), erreur typique, forme non réduite, corrigé
  e = await open(ch06, 'double', 2, 'cap3');
  await p.click('.pt-step[data-i="0"] input.pt-input');
  await wait(250);
  for (const k of ['2', 'x']) await p.click(`.keypad [data-k="${k}"]`).catch(() => {});
  await shot('exos-06-01-clavier-expression');
  const a6 = e.steps[0].answer as { tex: string; expect: Q[] };
  const ex = e.steps[0].mistakes?.find((m) => m.on === 'expr') as { value: Q[] } | undefined;
  const wrong = ex ? texToInput((await import('../src/practice/engine/algebra')).polyTex(ex.value)) : texToInput(a6.tex) + '+1';
  await answer(p, 0, e.steps[0], [wrong]);
  await shot('exos-06-02-erreur-typique');
  e = await open(ch06, 'identites', 3, 'cap4');
  await answer(p, 0, e.steps[0]);
  const b = e.steps[1].answer as { tex: string };
  await answer(p, 1, e.steps[1], [b.tex.includes('x^{2}') ? `(${texToInput(b.tex)})` : texToInput(b.tex)]);
  await shot('exos-06-03-identites');
  e = await open(ch06, 'factoriser', 3, 'cap5');
  await answer(p, 0, e.steps[0]);
  await solution();
  await shot('exos-06-04-corrige-factorisation');

  // ---- 11 : figure à l'échelle, arrondi, réciproque, pavé
  e = await open(ch11, 'calcul-cote', 2, 'cap6');
  await shot('exos-11-01-figure');
  await answer(p, 0, e.steps[0]);
  const f11 = e.steps[1].answer as { fields: { approx?: { value: number } ; expect: Q }[] };
  const v = f11.fields[0].approx ? (Math.floor(f11.fields[0].approx.value * 10) / 10 + 0.1 * (Math.round(f11.fields[0].approx.value * 10) === Math.floor(f11.fields[0].approx.value * 10) ? 1 : 0)).toFixed(1).replace('.', ',') : fmtQ(f11.fields[0].expect);
  await answer(p, 1, e.steps[1], [v]);
  await shot('exos-11-02-arrondi');
  e = await open(ch11, 'reciproque', 2, 'cap7');
  for (let i = 0; i < e.steps.length; i++) await answer(p, i, e.steps[i]);
  await solution();
  await shot('exos-11-03-reciproque-corrige');
  e = await open(ch11, 'deux-fois', 3, 'cap9');
  await shot('exos-11-04-pave');
  e = await open(ch11, 'probleme', 2, 'cap10');
  await shot('exos-11-06-probleme');
  e = await open(ch11, 'figures', 2, 'cap12');
  await shot('exos-11-07-figure-usuelle');
  e = await open(ch11, 'repere', 3, 'cap8');
  await shot('exos-11-05-repere');
  await ctx.close();
}
await browser.close();
console.log(files.join('\n'));
if (errors.length) { console.log('ERREURS JS :', errors.join(' | ')); process.exit(1); }
