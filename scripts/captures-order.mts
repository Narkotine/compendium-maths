#!/usr/bin/env -S npx tsx
/** Captures mobiles du rangement (clair/sombre) : avant validation, pendant un glisser, après une erreur, corrigé ; 320 px. */
import puppeteer from 'puppeteer-core';
import ch01 from '../src/practice/ch01/index';
import { exoHash } from '../src/practice/engine/series';
const BASE = 'http://localhost:4173/compendium-maths/';
const W = (ms: number) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const out: string[] = [];
for (const theme of ['light', 'dark'] as const) for (const [w, h] of [[390, 844], [320, 640]] as const) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto(BASE, { waitUntil: 'networkidle0' });
  await p.evaluate((t) => localStorage.setItem('compendium-maths.settings', JSON.stringify({ theme: t, size: 1, openCor: false, calc: true })), theme);
  await p.goto(BASE + exoHash(ch01.slug, 'ranger', 3, 1207), { waitUntil: 'networkidle0' });
  await p.reload({ waitUntil: 'networkidle0' });
  await p.waitForSelector('.po-card'); await W(1200);
  await p.evaluate(() => document.querySelectorAll('.toast').forEach((x) => x.remove()));
  const name = (s: string) => `captures/ranger-${theme === 'light' ? 'clair' : 'sombre'}-${w}-${s}.png`;
  const shot = async (s: string) => { const f = name(s); await p.screenshot({ path: f }); out.push(f); };
  await p.evaluate(() => { const r = document.querySelector('.pt-ex-title')!.getBoundingClientRect(); scrollBy(0, r.top - 64); });
  await W(200);
  await shot('1-avant');
  // pendant un glisser au doigt
  const cdp = await p.createCDPSession();
  const c = await p.evaluate(() => { const r = document.querySelectorAll('.po-card')[1].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] });
  await W(260);
  for (let s = 1; s <= 10; s++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x, y: c.y + (c.h * 1.6 * s) / 10, id: 1 }] }); await W(16); }
  await W(250);
  await shot('2-glisser');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await W(300);
  // erreur : on valide tel quel (après un déplacement)
  await p.click('.pt-validate'); await W(300);
  await p.evaluate(() => { const r = document.querySelector('.po')!.getBoundingClientRect(); scrollBy(0, r.top - 70); });
  await W(200);
  await shot('3-erreur');
  await p.$eval('.pt-feedback', (e) => e.scrollIntoView({ block: 'center' })); await W(150);
  await shot('3b-indice');
  await p.click('[data-act="peek"]'); await W(500);
  await p.$eval('.pt-solution', (e) => { const r = e.getBoundingClientRect(); scrollBy(0, r.top - 64); }); await W(300);
  await shot('4-corrige');
  await ctx.close();
}
await b.close();
console.log(out.join('\n'));
