/** Captures du clavier « expression » et de la case (06), clair et sombre. Usage : npx tsx scripts/captures-x.mts <suffixe> */
import puppeteer from 'puppeteer-core';
const tag = process.argv[2] || 'apres';
const URL = 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
for (const th of ['light', 'dark']) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(URL, { waitUntil: 'networkidle0' });
  await p.evaluate((t) => localStorage.setItem('compendium-maths.settings', JSON.stringify({ theme: t, size: 1, openCor: false, calc: true })), th);
  await p.goto(URL + '#/entrainement/06-calcul-litteral/exo?t=reduire&niv=2&g=x1', { waitUntil: 'networkidle0' });
  await p.reload({ waitUntil: 'networkidle0' }); await wait(1500);
  await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  await p.tap('input.pt-input'); await wait(300);
  for (const k of ['3', 'x', '²', '-', '2', '×', '(', 'x', '+', '4', ')']) await p.click(`.keypad [data-k="${k}"]`);
  await wait(400);
  const f = `captures/x-${tag}-${th === 'light' ? 'clair' : 'sombre'}.png`; await p.screenshot({ path: f }); console.log(f); await ctx.close();
}
await b.close();
