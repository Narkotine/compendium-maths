import puppeteer from 'puppeteer-core';
const [slug, ...specs] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 });
for (const s of specs) {
  const [t, lv, g] = s.split(':');
  await p.goto(`http://localhost:4173/#/entrainement/${slug}/exo?t=${t}&niv=${lv}&g=${g}`, { waitUntil: 'networkidle0' });
  await p.waitForSelector('.pt-ex', { timeout: 10000 });
  const el = await p.$('.pt-ex svg[role=img]') ?? await p.$('.pt-ex');
  await el!.screenshot({ path: `/tmp/fig-${t}-${lv}-${g}.png` });
}
await b.close();
