#!/usr/bin/env -S npx tsx
/**
 * Bout en bout : pour CHAQUE type ayant une réponse « expression » (tous chapitres), chaque niveau et
 * plusieurs graines, on saisit réellement la bonne réponse dans l'interface — au pavé de touches et au
 * clavier physique, avec des variantes d'écriture (ordre des termes, espaces, − ou -) — et l'exercice
 * doit la valider. Les étapes non « expression » sont remplies avec leur bonne réponse.
 * Prérequis : build + preview. Usage : npx tsx scripts/test-expr-e2e.mts [graines par niveau]
 */
import puppeteer from 'puppeteer-core';
import { readdirSync } from 'node:fs';
import { generate, exoHash } from '../src/practice/engine/series';
import { texToInput } from '../src/practice/engine/algebra';
import type { ChapterPractice, Level, Step } from '../src/practice/engine/types';

const BASE = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const N = Number(process.argv[2]) || 4;
const W = (ms: number) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (c: unknown, m: string, x: unknown = '') => { if (c) pass++; else { fail++; console.log('  ✗', m, JSON.stringify(x)); } };
const chapters: ChapterPractice[] = [];
for (const d of readdirSync(new URL('../src/practice', import.meta.url)).filter((d) => /^ch\d\d$/.test(d)).sort()) chapters.push((await import(`../src/practice/${d}/index.ts`)).default);

const KEYS = new Set('0123456789,()+-×²x'.split(''));
const reorder = (s: string) => {
  const ts = s.replace(/\s/g, '').match(/[+-]?[^+-]+/g)!;
  if (ts.length < 2 || /[()]/.test(s)) return null;
  return ts.reverse().map((x, i) => (i === 0 ? x.replace(/^\+/, '') : /^[+-]/.test(x) ? x : '+' + x)).join('');
};
const numFill = (s: Step) => (s.answer.kind === 'num' ? s.answer.fields.map((f) => (f.approx ? f.approx.value.toFixed(f.approx.dp).replace('.', ',') : f.expect.d === 1 ? String(f.expect.n) : `${f.expect.n}/${f.expect.d}`)) : []);

const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await (await b.createBrowserContext()).newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errors: string[] = []; p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(BASE, { waitUntil: 'networkidle0' }); await W(1500);
let types = 0;
for (const ch of chapters) for (const g of ch.generators) {
  const has = g.levels.some((lv) => [1, 2, 3, 4, 5].some((s) => generate(ch, g.id, lv, s).steps.some((st) => st.answer.kind === 'expr')));
  if (!has) continue;
  types++;
  for (const lv of g.levels as Level[]) for (let s = 1; s <= N; s++) {
    const ex = generate(ch, g.id, lv, s * 7919 + lv);
    if (!ex.steps.some((st) => st.answer.kind === 'expr')) continue;
    await p.goto(BASE + exoHash(ch.slug, g.id, lv, s * 7919 + lv), { waitUntil: 'networkidle0' });
    await p.waitForSelector('.pt-ex');
    await p.evaluate(() => document.querySelectorAll('.toast').forEach((x) => x.remove()));
    for (let i = 0; i < ex.steps.length; i++) {
      const st = ex.steps[i], sel = `.pt-step[data-i="${i}"]`;
      if (st.answer.kind === 'choice') { await p.click(`${sel} .pt-choice[data-i="${st.answer.correct}"]`); await W(150); continue; }
      if (st.answer.kind === 'num') {
        const vals = numFill(st);
        const inputs = await p.$$(`${sel} input.pt-input`);
        for (let j = 0; j < inputs.length; j++) await inputs[j].evaluate((el, v) => { (el as HTMLInputElement).value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, vals[j]);
        await p.$eval(`${sel} .pt-validate`, (e) => (e as HTMLElement).click()); await W(150);
        continue;
      }
      if (st.answer.kind !== 'expr') { t(false, `${g.id} : type d’étape non géré ${st.answer.kind}`); continue; }
      const canon = texToInput(st.answer.tex).replace(/−/g, '-');
      const rev = st.answer.form === 'dev' ? reorder(canon) : null;
      const variant = (s + i) % 4;
      const viaKeys = variant % 2 === 0 && [...canon.replace(/\s/g, '')].every((c) => KEYS.has(c));
      const text = variant === 0 ? canon.replace(/\s/g, '') : variant === 1 ? canon : variant === 2 ? (rev ?? canon).replace(/\s/g, '') : (rev ?? canon).replace(/-/g, '−');
      const inp = await p.$(`${sel} input.pt-input`);
      await inp!.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await inp!.tap(); await W(120);
      if (viaKeys && [...text].every((c) => KEYS.has(c))) {
        for (const c of text) await p.click(`.keypad [data-k="${c}"]`);
        await p.click('.keypad [data-k="ok"]');
      } else {
        if (await p.$('.keypad:not([hidden]) [data-k="native"]')) { await p.click('.keypad [data-k="native"]'); await W(120); }
        await p.keyboard.type(text);
        await p.keyboard.press('Enter');
      }
      await W(200);
      const fb = await p.$eval(`${sel} .pt-feedback`, (e) => e.className + ' ' + e.textContent);
      t(fb.includes('pt-fb--ok'), `${ch.slug.slice(0, 2)} ${g.id} ★${lv} graine ${s} étape ${i + 1} : « ${text} » (${viaKeys ? 'touches' : 'clavier'}) validée`, fb.slice(0, 160));
    }
  }
}
t(types >= 6, `types à réponse expression couverts : ${types}`);
t(errors.length === 0, 'aucune erreur JavaScript', errors);
await b.close();
console.log(`${types} types · ${pass} réussis, ${fail} échoués`);
if (fail) process.exit(1);
