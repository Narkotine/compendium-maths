#!/usr/bin/env -S npx tsx
/**
 * Parcours de la calculatrice-brouillon (Chrome headless, 390×844 tactile, puis grand écran) :
 * ouverture, exemple de Nguhma (12² − 6² → 108 ; √(108) → ≈ 10,39…), clavier physique (sqrt, ^2),
 * erreurs, suppression d'une ligne, réinjection, « Insérer » dans la case puis validation juste,
 * retour Android (ferme d'abord le panneau), exercice suivant (historique vidé), rotation,
 * type sans calculatrice, réglage global, série, grand écran.
 * Prérequis : `npm run build` puis `npm run preview`. Usage : npx tsx scripts/test-calc.mts [url]
 */
import puppeteer from 'puppeteer-core';
import ch11 from '../src/practice/ch11/index';
import { generate, exoHash } from '../src/practice/engine/series';
import { insertText } from '../src/practice/calc/engine';

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (cond: unknown, msg: string, extra: unknown = '') => {
  if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗', msg, extra === '' ? '' : JSON.stringify(extra)); }
};
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const ctx = await browser.createBrowserContext();
const p = await ctx.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors: string[] = [];
p.on('pageerror', (e) => errors.push((e as Error).message));
const hash = () => p.evaluate(() => location.hash);
const visible = (sel: string) => p.evaluate((s) => { const e = document.querySelector<HTMLElement>(s); return !!e && !e.closest('[hidden]') && e.getClientRects().length > 0; }, sel);
const key = async (k: string) => { await p.click(`.calc [data-k="${k}"]`); };
const keys = async (...ks: string[]) => { for (const k of ks) await key(k); };
const lines = () => p.evaluate(() => [...document.querySelectorAll('.calc-line')].map((li) => [li.querySelector('.calc-l-expr')!.textContent!.trim(), li.querySelector('.calc-l-res')!.textContent!.replace(/\u202f/g, ' ').trim()]));
const tap = async (sel: string) => { await p.$eval(sel, (e) => window.scrollBy(0, e.getBoundingClientRect().top - 110)); await wait(80); await p.click(sel); };
const nb = (s: string) => s.replace(/\u202f/g, ' ');

// un exercice de Pythagore (★) dont la première case demande un arrondi
const SLUG = '11-pythagore';
let seed = 1, ex = generate(ch11, 'figures', 2, seed);
for (; seed < 5000; seed++) { ex = generate(ch11, 'figures', 2, seed); const a = ex.steps[0].answer; if (a.kind === 'num' && a.fields.length === 1 && a.fields[0].approx) break; }
if (seed >= 5000) throw new Error('pas d’exercice avec arrondi');
const f0 = (ex.steps[0].answer as { fields: { approx?: { value: number; dp: number }; form?: string }[] }).fields[0];
const H1 = exoHash(SLUG, 'figures', 2, seed);

console.log('Ouverture');
await p.goto(URL + '#/entrainement/' + SLUG, { waitUntil: 'networkidle0' });
await p.goto(URL + H1, { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
t(await visible('[data-act="calc"]'), 'bouton Calculatrice visible dans l’exercice');
t(!(await visible('.calc')), 'panneau fermé par défaut');
await p.click('[data-act="calc"]');
await p.waitForSelector('.calc.calc--in'); await wait(350);
t(await visible('.calc'), 'le panneau s’ouvre');
t((await p.$eval('[data-act="calc"]', (b) => b.getAttribute('aria-expanded'))) === 'true', 'aria-expanded = true');
t((await p.$eval('.calc-input', (i) => (i as HTMLInputElement).inputMode)) === 'none', 'pas de clavier du téléphone (inputmode=none)');
const sizes = await p.$$eval('.calc button', (bs) => bs.filter((b) => (b as HTMLElement).offsetParent).map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), b.getAttribute('aria-label') || b.textContent]; }));
t(sizes.every(([w, h]) => (w as number) >= 44 && (h as number) >= 44), 'cibles d’au moins 44 px', sizes.filter(([w, h]) => (w as number) < 44 || (h as number) < 44));
const panelTop = await p.$eval('.calc', (e) => e.getBoundingClientRect().top);
t(panelTop > 844 * 0.3, 'le haut de l’écran reste visible (énoncé)', panelTop);

console.log('Exemple de Nguhma au pavé');
await keys('1', '2', '²', '−', '6', '²');
t(nb(await p.$eval('.calc-pv', (e) => e.textContent!)) === '= 108', 'aperçu en direct : = 108');
await key('=');
await keys('√(', '1', '0', '8', '=');
let L = await lines();
t(L[0]?.[0] === '12² − 6²' && L[0]?.[1] === '108', 'ligne 1 : 12² − 6²   108', L);
t(L[1]?.[0] === '√(108)' && L[1]?.[1] === '≈10,39230485', 'ligne 2 : √(108)   ≈ 10,39230485 (parenthèse fermée automatiquement)', L);
await keys('Ans', '÷', '2', '=');
L = await lines();
t(L[2]?.[0] === 'Ans ÷ 2' && L[2]?.[1] === '≈5,196152423', 'Ans = résultat précédent', L[2]);
await keys('×', '2', '=');
t((await lines())[3]?.[0] === 'Ans × 2', 'commencer par × reprend Ans', (await lines())[3]);

console.log('Clavier physique et erreurs');
await p.focus('.calc-input');
await p.keyboard.type('sqrt(2)^2');
await p.keyboard.press('Enter');
L = await lines();
t(L[4]?.[0] === '√(2)²' && L[4]?.[1] === '2', 'sqrt(2)^2 affiché √(2)², = 2', L[4]);
await p.keyboard.type('racine(7,5^2-4.5^2)');
await p.keyboard.press('Enter');
t((await lines())[5]?.[1] === '6', 'racine(…), virgule et point acceptés', (await lines())[5]);
await p.keyboard.type('√(-4)');
await p.keyboard.press('Enter');
t(/négatif/.test(await p.$eval('.calc-msg', (e) => e.textContent!)), 'erreur claire : racine d’un nombre négatif');
await key('ac');
await p.keyboard.type('5/(2-2)');
await p.keyboard.press('Enter');
t(/zéro/.test(await p.$eval('.calc-msg', (e) => e.textContent!)), 'erreur claire : division par zéro');
await key('ac');
await key('trig');
t(await visible('.calc-row-trig'), 'rangée trigonométrie (sin, cos, tan et inverses)');
await keys('cos(', '6', '0', '=');
t((await lines())[6]?.[1] === '0,5', 'cos(60) = 0,5 en degrés', (await lines())[6]);
await key('trig');

console.log('Réduire le panneau');
const hFull = await p.$eval('.calc', (e) => e.getBoundingClientRect().height);
await p.click('.calc [data-c="keys"]');
await wait(150);
const hMini = await p.$eval('.calc', (e) => e.getBoundingClientRect().height);
t(!(await visible('.calc-grid')) && hMini < hFull * 0.6, 'pavé masqué : panneau réduit pour lire l’énoncé', [hFull, hMini]);
await p.tap('.calc-input');
await wait(150);
t(await visible('.calc-grid'), 'toucher la saisie rouvre le pavé');
console.log('Supprimer, réinjecter');
const n0 = (await lines()).length;
await p.click('.calc-line:nth-child(7) .calc-l-del');
t((await lines()).length === n0 - 1, 'croix : la ligne est supprimée');
await p.click('.calc-line:nth-child(1) .calc-l-res');
t((await p.$eval('.calc-input', (i) => (i as HTMLInputElement).value)) === '108', 'toucher un résultat le réinjecte dans la saisie', await p.$eval('.calc-input', (i) => (i as HTMLInputElement).value));
await p.click('.calc-line:nth-child(2) .calc-l-expr');
t((await p.$eval('.calc-input', (i) => (i as HTMLInputElement).value)) === '√(108)', 'toucher une saisie la recopie pour la modifier');
await key('ac');

console.log('Insérer dans la case réponse');
await p.focus('.calc-input');
await p.keyboard.type(String(f0.approx!.value));
await p.keyboard.press('Enter');
await p.click('.calc [data-c="insert"]');
const want = insertText({ f: f0.approx!.value }, { dp: f0.approx!.dp }).text;
const got = await p.$eval('.pt-step[data-i="0"] input.pt-input', (i) => (i as HTMLInputElement).value);
t(got === want, `« Insérer » écrit ${want} (arrondi demandé : ${f0.approx!.dp} décimale(s))`, got);
t((await p.evaluate(() => document.activeElement?.classList.contains('pt-input'))) === false, 'la case n’a pas pris le focus (pas de clavier qui s’ouvre)');
await tap('.pt-step[data-i="0"] .pt-validate');
await wait(200);
t(await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.className.includes('ok')), 'la réponse insérée est validée', await p.$eval('.pt-step[data-i="0"]', (e) => e.className + ' | ' + e.querySelector('.pt-feedback')!.className + ' ' + e.querySelector('.pt-feedback')!.textContent));

console.log('Retour Android, fermer et rouvrir');
const nLines = (await lines()).length;
const h0 = await hash();
await p.goBack();
await wait(300);
t(!(await visible('.calc')), 'Retour : ferme d’abord le panneau');
t((await hash()) === h0 && (await visible('.pt-ex')), 'Retour : on reste sur l’exercice');
await p.click('[data-act="calc"]');
await p.waitForSelector('.calc.calc--in'); await wait(350);
t((await lines()).length === nLines, 'historique conservé après fermeture et réouverture');
await p.setViewport({ width: 844, height: 390, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await wait(300);
t((await visible('.calc')) && (await lines()).length === nLines, 'rotation de l’écran : panneau et historique conservés');
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.click('.calc [data-c="close"]');
await wait(300);
t(!(await visible('.calc')) && (await hash()) === h0, 'bouton × ferme le panneau');
await p.goBack();
await wait(400);
t(!(await hash()).includes('/exo?'), 'Retour suivant : on quitte l’exercice (pas d’entrée en trop)', await hash());
await p.goForward();
await wait(400);

console.log('Exercice suivant');
await p.goto(URL + '#/entrainement/' + SLUG, { waitUntil: 'networkidle0' });
await p.goto(URL + H1, { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
await p.click('[data-act="calc"]');
await p.waitForSelector('.calc.calc--in'); await wait(350);
t((await lines()).length === nLines, 'historique gardé pour le même exercice (session)');
await tap('.pt-nav [data-act="another"]');
await wait(500);
const h1 = await hash();
t(h1 !== h0, 'nouvel exercice');
t((await visible('.calc')) && (await lines()).length === 0, 'panneau resté ouvert, historique vidé', (await lines()).length);
await p.goBack();
await wait(300);
t(!(await visible('.calc')) && (await hash()) === h1, 'Retour : ferme le panneau sans revenir à l’ancien exercice', await hash());
await p.goBack();
await wait(400);
t(!(await hash()).includes('/exo?'), 'puis Retour quitte la page');

console.log('Types sans calculatrice, réglage');
await p.goto(URL + '#/entrainement/02-entiers-et-decimaux/exo?t=operations&niv=1', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
t(!(await visible('[data-act="calc"]')), 'pas de calculatrice pour « Opérations sur les décimaux » (02)');
await p.goto(URL + '#/entrainement/13-trigonometrie/exo?t=longueur&niv=1', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
t(await visible('[data-act="calc"]'), 'calculatrice pour la trigonométrie (13)');
await p.evaluate(() => localStorage.removeItem('compendium-maths.calc.trig'));
await p.click('[data-act="calc"]');
await p.waitForSelector('.calc.calc--in'); await wait(350);
t(await visible('.calc-row-trig'), 'trigonométrie affichée d’office au chapitre 13');
await p.click('.calc [data-c="close"]');
await wait(300);
await p.click('[data-act="settings"]');
await p.waitForSelector('[data-calc]');
await p.$eval('[data-calc]', (e) => (e as HTMLElement).click());
await wait(100);
await p.keyboard.press('Escape');
await wait(300);
t(!(await visible('[data-act="calc"]')), 'réglage désactivé : le bouton disparaît aussitôt');
await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('compendium-maths.settings') || '{}'); s.calc = true; localStorage.setItem('compendium-maths.settings', JSON.stringify(s)); });
await p.reload({ waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
t(await visible('[data-act="calc"]'), 'réglage réactivé : le bouton revient');

console.log('Série');
await p.goto(URL + '#/entrainement/' + SLUG, { waitUntil: 'networkidle0' });
await p.goto(URL + `#/entrainement/${SLUG}/serie?t=calcul-hypotenuse&niv=1&n=3&g=abc`, { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
await p.click('[data-act="calc"]');
await p.waitForSelector('.calc.calc--in'); await wait(350);
await keys('3', '²', '+', '4', '²', '=');
t((await lines())[0]?.[1] === '25', 'calcul dans une série');
await p.goBack();
await wait(300);
t(!(await visible('.calc')) && !(await visible('.pt-dialog')), 'Retour en série : ferme le panneau, sans demander de quitter');
await p.goBack();
await wait(300);
t(await visible('.pt-dialog'), 'Retour suivant : la confirmation de sortie de série');

console.log('Grand écran');
const d = await ctx.newPage();
await d.setViewport({ width: 1280, height: 800 });
await d.goto(URL + H1, { waitUntil: 'networkidle0' });
await d.waitForSelector('.pt-ex');
await d.click('[data-act="calc"]');
await d.waitForSelector('.calc.calc--in'); await wait(350);
const box = await d.$eval('.calc', (e) => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.width, r.top]; });
t(box[1] === 1280 && box[2] === 380 && box[3] > 40, 'panneau latéral à droite, sous la barre', box);
t((await d.$eval('.calc-input', (i) => (i as HTMLInputElement).inputMode)) !== 'none', 'ordinateur : clavier physique utilisable');
await d.focus('.calc-input');
await d.keyboard.type('12^2-6^2');
await d.keyboard.press('Enter');
t((await d.$$eval('.calc-line .calc-l-res', (r) => r.map((x) => x.textContent))).join() === '108', 'saisie au clavier physique + Entrée');
const ov = await d.$eval('.pt-ex', (e) => e.getBoundingClientRect().right);
t(ov <= 1280 - 380, 'l’exercice n’est pas caché par le panneau', ov);
await d.keyboard.press('Escape');
await wait(300);
t(!(await d.$eval('.calc', (e) => !(e as HTMLElement).hidden)), 'Échap ferme le panneau');

t(errors.length === 0, 'aucune erreur JavaScript', errors);
await browser.close();
console.log(`${pass} réussis, ${fail} échoués`);
if (fail) process.exit(1);
