#!/usr/bin/env node
/** Audit de mise en page des 17 chapitres en 390 px et 320 px : débordements horizontaux. */
import puppeteer from 'puppeteer-core';
const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
const idx = await (await fetch(URL + 'content/index.json')).json();
let problems = 0;
for (const w of [390, 320]) {
  await p.setViewport({ width: w, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  for (const c of idx.chapters) {
    await p.goto(`${URL}#/ch/${c.slug}`, { waitUntil: 'networkidle0' });
    await p.waitForSelector('article.prose section');
    const r = await p.evaluate((w) => {
      const out = [];
      const sw = document.documentElement.scrollWidth;
      for (const el of document.querySelectorAll('.page *')) {
        if (el.closest('.katex-display, .table-wrap, .katex-mathml, svg, .katex--wide')) continue;
        if (el.closest('.side, .bottombar') ) continue;
        const rc = el.getBoundingClientRect();
        if (rc.width && rc.right > w + 1) {
          const blk = el.closest('p, li, td, h2, h3, figure, blockquote, div');
          out.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} → ${Math.round(rc.right)}px : « ${(blk?.textContent || '').slice(0, 70).replace(/\s+/g, ' ')} »`);
        }
      }
      const wide = [...document.querySelectorAll('.katex-display, .table-wrap')].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
      return { sw, out: [...new Set(out)].slice(0, 8), wide };
    }, w);
    const bad = r.sw > w || r.out.length;
    if (bad) problems++;
    console.log(`${w}px ${c.slug}: ${bad ? '✗' : '✓'} largeur doc ${r.sw}${r.wide ? `, ${r.wide} bloc(s) défilant(s)` : ''}`);
    r.out.forEach((o) => console.log('     ', o));
  }
}
await b.close();
process.exit(problems ? 1 : 0);
