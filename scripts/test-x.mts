/**
 * Saisie d'expression (06) : x italique de mathématiques dans la touche et la case, × distinct ;
 * saisie à la touche, au clavier physique (x et *), effacement au milieu, réponses justes validées.
 * Prérequis : build + preview. Usage : npx tsx scripts/test-x.mts
 */
import puppeteer, { type Page } from 'puppeteer-core';
import ch06 from '../src/practice/ch06/index';
import { generate, exoHash } from '../src/practice/engine/series';
import { texToInput } from '../src/practice/engine/algebra';
const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (c: unknown, m: string, x: unknown = '') => { if (c) { pass++; console.log('  ✓', m); } else { fail++; console.log('  ✗', m, JSON.stringify(x)); } };
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const p: Page = await (await b.createBrowserContext()).newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errors: string[] = []; p.on('pageerror', (e) => errors.push(String(e)));
const val = () => p.$eval('input.pt-input', (i) => (i as HTMLInputElement).value);
const answer = (seed: number) => { const a = generate(ch06, 'reduire', 1, seed).steps[0].answer; if (a.kind !== 'expr') throw new Error('expr'); return texToInput(a.tex); };
const ok = () => p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.className.includes('ok'));

await p.goto(URL, { waitUntil: 'networkidle0' }); await wait(1500);
console.log('Touche et case');
await p.goto(URL + exoHash(ch06.slug, 'reduire', 1, 11), { waitUntil: 'networkidle0' });
await p.waitForSelector('input.pt-input');
await p.tap('input.pt-input'); await wait(300);
t(await p.$eval('input.pt-input', (i) => getComputedStyle(i).fontFamily.includes('MathVar')), 'la case utilise la police MathVar (x italique KaTeX)');
t(await p.$eval('.keypad [data-k="x"]', (k) => getComputedStyle(k).fontFamily.includes('MathVar')), 'la touche x aussi');
t((await p.$eval('.keypad [data-k="×"]', (k) => k.textContent)) === '×', 'la touche fois affiche ×');
t(await p.evaluate(async () => { await document.fonts.load('20px MathVar', 'x'); return document.fonts.check('20px MathVar', 'x'); }), 'webfont chargée (pas de dépendance aux polices système)');
const wx = await p.evaluate(() => { const c = document.createElement('canvas').getContext('2d')!; c.font = '40px MathVar, sans-serif'; const a = c.measureText('x').width; c.font = '40px sans-serif'; return [a, c.measureText('x').width]; });
t(Math.abs(wx[0] - wx[1]) > 0.5, 'le x est bien dessiné par la police KaTeX (largeur différente)', wx);

console.log('Saisie à la touche');
const A = answer(11);
await p.evaluate(() => document.querySelectorAll('.toast').forEach((x) => x.remove()));
console.log('   réponse :', A);
for (const ch of A.replace(/\s/g, '')) await p.click(`.keypad [data-k="${ch === '-' || ch === '−' ? '-' : ch === '*' ? '×' : ch}"]`);
t((await val()).replace(/\s/g, '') === A.replace(/\s/g, '').replace(/−/g, '-'), 'saisie identique à la réponse', [await val(), A]);
await p.click('.keypad [data-k="ok"]'); await wait(200);
t(await ok(), 'réponse juste validée (touches)');

console.log('Clavier physique et effacement au milieu');
await p.goto(URL + exoHash(ch06.slug, 'reduire', 1, 12), { waitUntil: 'networkidle0' });
await p.waitForSelector('input.pt-input');
const B = answer(12).replace(/×/g, '*').replace(/−/g, '-');
const [h, ...rest] = B.split('x');
const typed = h + 'xx' + rest.join('x');
await p.tap('input.pt-input'); await wait(200);
await p.click('.keypad [data-k="native"]'); await wait(200);
await p.keyboard.type(typed);
t((await val()) === typed, 'clavier physique : x et * acceptés tels quels', await val());
await p.$eval('input.pt-input', (i, n) => (i as HTMLInputElement).setSelectionRange(n, n), h.length + 1);
await p.keyboard.press('Backspace');
t((await val()) === B, 'effacement au milieu : un seul x retiré, le reste intact', [await val(), B]);
t((await p.$eval('input.pt-input', (i) => (i as HTMLInputElement).selectionStart)) === h.length, 'curseur resté au bon endroit');
await p.keyboard.press('Enter'); await wait(200);
t(await ok(), 'réponse juste validée (clavier physique, * = fois)');

console.log('Effacement au milieu avec ⌫ du pavé');
await p.goto(URL + exoHash(ch06.slug, 'reduire', 1, 13), { waitUntil: 'networkidle0' });
await p.waitForSelector('input.pt-input');
await p.evaluate(() => localStorage.removeItem('compendium-maths.practice'));
const C = answer(13).replace(/−/g, '-');
await p.tap('input.pt-input'); await wait(200);
await p.$eval('input.pt-input', (i, v) => { const x = i as HTMLInputElement; x.value = v; x.setSelectionRange(1, 1); }, C.slice(0, 1) + '9' + C.slice(1));
await p.$eval('input.pt-input', (i) => (i as HTMLInputElement).setSelectionRange(2, 2));
await p.click('.keypad [data-k="del"]');
t((await val()) === C, '⌫ au milieu', [await val(), C]);
await p.click('.keypad [data-k="ok"]'); await wait(200);
t(await ok(), 'réponse juste validée');
console.log('Confusion × / x (bug « développer k(a + b) »)');
{
  const id = 'developper';
  let sd = 4;
  while (/\^/.test((generate(ch06, id, 1, sd).steps[0].answer as { tex: string }).tex)) sd++;
  await p.goto(URL + exoHash(ch06.slug, id, 1, sd), { waitUntil: 'networkidle0' });
  await p.waitForSelector('input.pt-input');
  const a = generate(ch06, id, 1, sd).steps[0].answer; if (a.kind !== 'expr') throw new Error('expr');
  const good = texToInput(a.tex).replace(/\s/g, '').replace(/−/g, '-');
  await p.tap('input.pt-input'); await wait(150);
  for (const c of good.replace(/x/g, '×')) await p.click(`.keypad [data-k="${c}"]`);
  await p.click('.keypad [data-k="ok"]'); await wait(200);
  const fb = await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.className + ' ' + e.textContent);
  t(/fb--info/.test(fb) && /signe « × »/.test(fb), `« ${good.replace(/x/g, '×')} » : × pris pour x, signalé sans compter faux`, fb);
  await p.$eval('input.pt-input', (i) => ((i as HTMLInputElement).value = ''));
  for (const c of good) await p.click(`.keypad [data-k="${c}"]`);
  await p.click('.keypad [data-k="ok"]'); await wait(200);
  t(await ok(), `puis « ${good} » validée`);
}
t(errors.length === 0, 'aucune erreur JavaScript', errors);
await b.close();
console.log(`${pass} réussis, ${fail} échoués`);
if (fail) process.exit(1);
