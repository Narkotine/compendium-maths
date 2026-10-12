/** Captures de la calculatrice (téléphone 390 et 320 px, clair et sombre ; grand écran). Prérequis : build + preview. */
import puppeteer from 'puppeteer-core';
import ch11 from '../src/practice/ch11/index';
import ch13 from '../src/practice/ch13/index';
import { generate, exoHash } from '../src/practice/engine/series';
import type { ChapterPractice, Level } from '../src/practice/engine/types';
const URL = 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const find = (ch: ChapterPractice, id: string, lv: Level) => { for (let s = 1; s < 999; s++) { const a = generate(ch, id, lv, s).steps[0].answer; if (a.kind === 'num' && a.fields.length === 1 && a.fields[0].approx) return exoHash(ch.slug, id, lv, s); } throw new Error(id); };
const PY = find(ch11, 'figures', 2), TR = find(ch13, 'longueur', 1);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const out: string[] = [];
async function shot(name: string, w: number, h: number, theme: 'light' | 'dark', hash: string, seq: (string | { type: string })[], mobile = true) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  await p.goto(URL, { waitUntil: 'networkidle0' });
  await p.evaluate((t) => { localStorage.setItem('compendium-maths.settings', JSON.stringify({ theme: t, size: 1, openCor: false, calc: true })); localStorage.removeItem('compendium-maths.calc.trig'); }, theme);
  await p.goto(URL + hash, { waitUntil: 'networkidle0' });
  await p.reload({ waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-ex');
  await wait(1500); // le message « Prêt hors ligne » passe
  await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  await p.click('[data-act="calc"]');
  await p.waitForSelector('.calc.calc--in');
  await wait(400);
  for (const k of seq) { if (typeof k === 'string') await p.click(`.calc [data-k="${k}"]`); else { await p.focus('.calc-input'); await p.keyboard.type(k.type); } }
  await wait(300);
  const f = `captures/calc-${theme === 'light' ? 'clair' : 'sombre'}-${w}-${name}.png`;
  await p.screenshot({ path: f });
  out.push(f);
  await ctx.close();
}
const NG = ['1', '2', '²', '−', '6', '²', '=', '√(', '1', '0', '8', '='];
for (const th of ['light', 'dark'] as const) {
  await shot('pythagore', 390, 844, th, PY, NG);
  await shot('trigo', 390, 844, th, TR, ['8', '×', 'cos(', '3', '5', '=', 'tan⁻¹(', '3', '÷', '4', '=', '1', '2', '÷', '0']);
  await shot('pythagore', 320, 640, th, PY, NG);
}
await shot('trigo', 320, 640, 'light', TR, ['5', '×', 'sin(', '4', '0', '=']);
await shot('grand-ecran', 1280, 800, 'light', PY, [...NG, { type: '√(-4' }, '='], false);
console.log(out.join('\n'));
await browser.close();
