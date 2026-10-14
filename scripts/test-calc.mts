#!/usr/bin/env -S npx tsx
/**
 * Parcours du clavier unifié (v0.10 : touches de réponse + calculatrice dépliable), Chrome headless tactile.
 * Déplier, exemple de Nguhma (12² − 6² → 108 ; √108 → ≈ 10,39…), « → Réponse » (arrondi au dixième → 10,4),
 * validation manuelle, destinataire unique et visible, énoncé épinglé, plusieurs cases, clavier physique,
 * erreurs, suppression/réinjection, Retour Android, exercice suivant, rotation, types sans calculatrice,
 * réglage, QCM et rangement sans clavier, série, mise en page 360×640 et 390×844, grand écran.
 * Prérequis : `npm run build` puis `npm run preview`. Usage : npx tsx scripts/test-calc.mts [url]
 */
import puppeteer, { type Page } from 'puppeteer-core';
import ch13 from '../src/practice/ch13/index';
import { generate, exoHash } from '../src/practice/engine/series';
const SLUGS = ['01-fractions-rationnels', '02-entiers-et-decimaux', '03-nombres-relatifs', '04-puissances-notation-scientifique', '05-proportionalite-pourcentages', '06-calcul-litteral', '07-equations-inequations', '08-fonctions', '09-geometrie-plane-figures', '10-transformations-plan', '11-pythagore', '12-thales', '13-trigonometrie', '14-aires-volumes-grandeurs', '15-geometrie-espace', '16-statistiques', '17-probabilites'];

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (cond: unknown, msg: string, extra: unknown = '') => {
  if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗', msg, extra === '' ? '' : JSON.stringify(extra)); }
};
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const ctx = await browser.createBrowserContext();
const p = await ctx.newPage();
// esbuild (tsx) ajoute __name aux fonctions nommées passées à evaluate
await p.evaluateOnNewDocument('globalThis.__name = (f) => f');
const PHONE = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
await p.setViewport(PHONE);
const errors: string[] = [];
p.on('pageerror', (e) => errors.push((e as Error).message));
const hash = () => p.evaluate(() => location.hash);
const visible = (sel: string, pg: Page = p) => pg.evaluate((s) => { const e = document.querySelector<HTMLElement>(s); return !!e && !e.closest('[hidden]') && e.getClientRects().length > 0; }, sel);
const key = async (k: string) => { await p.click(`.dock-calc [data-k="${k}"], .calc-grid [data-k="${k}"]`); };
const keys = async (...ks: string[]) => { for (const k of ks) await key(k); };
const akey = async (k: string) => { await p.click(`.dock .kp-grid [data-k="${k}"]`); };
const lines = () => p.evaluate(() => [...document.querySelectorAll('.calc-line')].map((li) => [li.querySelector('.calc-l-expr')!.textContent!.trim(), li.querySelector('.calc-l-res')!.textContent!.replace(/\u202f/g, ' ').trim()]));
const val = (sel = '.pt-step[data-i="0"] input.pt-input') => p.$eval(sel, (i) => (i as HTMLInputElement).value);
const nb = (s: string) => s.replace(/\u202f/g, ' ');
const quiet = (pg: Page = p) => pg.evaluate(() => document.querySelectorAll('.toast').forEach((x) => x.remove()));
const open = async (h: string, pg: Page = p) => { await pg.goto(URL + h, { waitUntil: 'networkidle0' }); await pg.waitForSelector('.pt-ex'); await quiet(pg); await wait(150); };
const tapIn = async (sel: string) => { await p.tap(sel); await wait(250); };
const expand = async () => { await p.click('[data-act="calc"]'); await p.waitForSelector('.dock-calc:not([hidden])'); await wait(250); };
/** Un seul destinataire : la case réponse (contour) ou la ligne de calcul. */
const dest = () => p.evaluate(() => ({ cases: document.querySelectorAll('input.pt-input--to').length, calc: document.querySelector('.dock')!.classList.contains('dock--to-calc'), label: document.querySelector('.dock-to')!.textContent!.trim() }));
/** Rectangles utiles pour la mise en page. */
const geo = async () => { await wait(150); return p.evaluate(() => {
  const r = (s: string) => { const e = document.querySelector<HTMLElement>(s); if (!e || e.closest('[hidden]') || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, h: b.height }; };
  const target = document.querySelector<HTMLElement>('input.pt-input--to') ?? document.querySelector<HTMLElement>('.pt-step:not(.pt-step--locked) input.pt-input');
  const tb = target?.getBoundingClientRect();
  const small = [...document.querySelectorAll<HTMLElement>('.dock button, .pt-pin button')].filter((b) => b.getClientRects().length && !b.closest('[hidden]')).map((b) => { const x = b.getBoundingClientRect(); return [Math.round(x.width), Math.round(x.height), b.getAttribute('aria-label') || b.textContent]; }).filter(([w, h]) => (w as number) < 44 || (h as number) < 44);
  return { vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth, dock: r('.dock'), pin: r('.pt-pin'), bar: r('.appbar'), title: r('.pt-ex-title'), target: tb ? { top: tb.top, bottom: tb.bottom } : null, small };
}); };

// exercice de Pythagore (★★) : PA ≈ ? au dixième ; 3 km et 10 km… (graine « ef »), exemple 12² − 6² = 108
const H1 = '#/entrainement/11-pythagore/exo?t=probleme&niv=2&g=ef';

console.log('Clavier replié');
await p.goto(URL + '#/entrainement/11-pythagore', { waitUntil: 'networkidle0' });
await open(H1);
t(await visible('.dock'), 'clavier unifié ancré en bas');
t(await visible('[data-act="calc"]') && (await p.$eval('[data-act="calc"]', (b) => b.textContent!.trim())) === 'Calculatrice', 'bouton « Calculatrice » (icône + libellé) dans le clavier');
t(!(await p.$('.appbar [data-act="calc"]')), 'plus de bouton séparé dans la barre du haut');
t(!(await visible('.dock-calc')), 'calculatrice repliée par défaut');
await tapIn('.pt-step[data-i="0"] input.pt-input');
t((await val()) === '', 'toucher la case n’écrit rien (pas de clic fantôme sur une touche)');
t(await visible('.dock .kp-grid'), 'touches de réponse visibles');
t((await p.$eval('.pt-step[data-i="0"] input.pt-input', (i) => (i as HTMLInputElement).inputMode)) === 'none', 'pas de clavier du téléphone (inputmode=none)');
let D = await dest();
t(D.cases === 1 && !D.calc && /PA/.test(D.label), 'destinataire : la case réponse (contour + « → PA km »)', D);
t(/Les touches écrivent dans/.test(await p.$eval('.dock-to', (e) => e.textContent!)) && (await p.$eval('.dock-to', (e) => e.getAttribute('aria-live'))) === 'polite', 'annonce du destinataire pour le lecteur d’écran');
await akey('1'); await akey(','); await akey('5');
t((await val()) === '1,5', 'les touches de réponse écrivent dans la case');
await akey('del'); await akey('del'); await akey('del');

console.log('Calculatrice dépliée : exemple de Nguhma');
await expand();
t((await p.$eval('[data-act="calc"]', (b) => b.getAttribute('aria-expanded'))) === 'true', 'aria-expanded = true');
D = await dest();
t(D.cases === 0 && D.calc && /calcul/.test(D.label), 'destinataire : la ligne de calcul (un seul à la fois)', D);
t(await visible('.calc-ops [data-k="√("]') && await visible('.calc-ops [data-k="²"]') && await visible('.calc-grid [data-k="÷"]') && await visible('.calc-ops [data-k="("]'), 'opérateurs, parenthèses, ² et √ visibles');
t((await p.$eval('.calc-input', (i) => (i as HTMLInputElement).inputMode)) === 'none', 'ligne de calcul : pas de clavier du téléphone');
t(await visible('.pt-pin'), 'énoncé compact épinglé en haut');
t(/bateau/.test(await p.$eval('.pt-pin', (e) => e.textContent!)) && !!(await p.$('.pt-pin .pt-pin-fig svg')), 'résumé : consigne + figure en miniature');
await keys('1', '2', '²', '−', '6', '²');
t(nb(await p.$eval('.calc-pv', (e) => e.textContent!)) === '= 108', 'aperçu en direct : = 108');
t(await visible('.calc-send--cur'), '« → Réponse » sur le résultat courant');
await key('=');
await keys('√(', '1', '0', '8', '=');
let L = await lines();
t(L[0]?.[0] === '12² − 6²' && L[0]?.[1] === '108', 'ligne 1 : 12² − 6²   108', L);
t(L[1]?.[0] === '√(108)' && L[1]?.[1] === '≈10,39230485', 'ligne 2 : √(108)   ≈ 10,39230485', L);
t((await p.$$('.calc-line .calc-send')).length === 2, '« → Réponse » sur chaque ligne');
let G = await geo();
t(G.target && G.pin && G.dock && G.target.top >= G.pin.bottom - 1 && G.target.bottom <= G.dock.top + 1, 'déplié : la case active reste visible entre l’énoncé épinglé et le clavier', G);
t(G.small.length === 0, 'cibles d’au moins 44 px', G.small);
await p.click('.calc-line:nth-child(2) .calc-send');
await wait(250);
t((await val()) === '10,4', '« → Réponse » : 10,4 (arrondi au dixième demandé)', await val());
t(/arrondi au dixième/.test(await p.$eval('.calc-msg', (e) => e.textContent!)), 'indication : « arrondi au dixième (≈ 10,39… → 10,4) »', await p.$eval('.calc-msg', (e) => e.textContent!));
t(!(await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.textContent!.trim())), 'rien n’est validé automatiquement');
D = await dest();
t(D.cases === 1 && !D.calc, 'après l’envoi, les touches reviennent à la case réponse', D);
await akey('ok');
await wait(250);
t(await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.className.includes('ok')), 'OK : la réponse envoyée est validée « Juste »');

console.log('Clavier physique, erreurs, historique');
await p.focus('.calc-input');
await p.keyboard.type('sqrt(2)^2');
await p.keyboard.press('Enter');
L = await lines();
t(L[2]?.[0] === '√(2)²' && L[2]?.[1] === '2', 'sqrt(2)^2 affiché √(2)², = 2', L[2]);
await p.keyboard.type('racine(7,5^2-4.5^2)');
await p.keyboard.press('Enter');
t((await lines())[3]?.[1] === '6', 'racine(…), virgule et point acceptés', (await lines())[3]);
await p.keyboard.type('√(-4)');
await p.keyboard.press('Enter');
t(/négatif/.test(await p.$eval('.calc-msg', (e) => e.textContent!)), 'erreur claire : racine d’un nombre négatif');
await key('ac');
await keys('Ans', '÷', '2', '=');
t((await lines())[4]?.[0] === 'Ans ÷ 2' && (await lines())[4]?.[1] === '3', 'Ans = résultat précédent', (await lines())[4]);
await key('trig');
t(await visible('.calc-row-trig'), 'rangée trigonométrie');
await keys('cos(', '6', '0', '=');
t((await lines())[5]?.[1] === '0,5', 'cos(60) = 0,5 en degrés', (await lines())[5]);
await key('trig');
const n0 = (await lines()).length;
await p.click('.calc-line:nth-child(6) .calc-l-del');
t((await lines()).length === n0 - 1, 'croix : la ligne est supprimée');
await p.click('.calc-line:nth-child(1) .calc-l-res');
t((await p.$eval('.calc-input', (i) => (i as HTMLInputElement).value)) === '108', 'toucher un résultat le réinjecte dans la saisie');
await p.click('.calc-line:nth-child(2) .calc-l-expr');
t((await p.$eval('.calc-input', (i) => (i as HTMLInputElement).value)) === '√(108)', 'toucher une saisie la recopie pour la modifier');
await key('ac');
await p.tap('.pt-pin-b'); await wait(150);
t((await p.$eval('.pt-pin-b', (b) => b.getAttribute('aria-expanded'))) === 'true', 'toucher le résumé de l’énoncé le déplie');
await p.tap('.pt-pin-b'); await wait(150);

console.log('Retour Android, rotation, exercice suivant');
const nLines = (await lines()).length;
const h0 = await hash();
await p.goBack(); await wait(300);
t(!(await visible('.dock-calc')) && (await hash()) === h0 && (await visible('.pt-ex')), 'Retour : replie d’abord la calculatrice, on reste sur l’exercice');
await expand();
t((await lines()).length === nLines, 'historique conservé après repli et dépli');
await p.setViewport({ ...PHONE, width: 844, height: 390 }); await wait(300);
t((await visible('.dock-calc')) && (await lines()).length === nLines, 'rotation : calculatrice et historique conservés');
await p.setViewport(PHONE); await wait(200);
await p.click('[data-act="calc"]'); await wait(300);
t(!(await visible('.dock-calc')) && (await hash()) === h0, 'le bouton « Calculatrice » replie');
await p.goBack(); await wait(400);
t(!(await hash()).includes('/exo?'), 'Retour suivant : on quitte l’exercice (pas d’entrée en trop)', await hash());
await p.goForward(); await wait(500); await quiet();
await expand();
await p.$eval('.pt-nav [data-act="another"]', (b) => (b as HTMLElement).click());
await wait(600);
const h1 = await hash();
t(h1 !== h0 && (await lines()).length === 0, 'exercice suivant : historique vidé', [h1, (await lines()).length]);

console.log('Plusieurs cases (13, deux hauteurs au centième)');
let seed = 7;
const E = generate(ch13, 'probleme', 3, seed);
const F = (E.steps[0].answer as { fields: { expect: { n: number; d: number } }[] }).fields.map((f) => (Number(f.expect.n) / Number(f.expect.d)).toFixed(2).replace('.', ','));
await open(exoHash('13-trigonometrie', 'probleme', 3, seed));
await tapIn('.pt-step[data-i="0"] .pt-field:nth-child(2) input.pt-input');
D = await dest();
t(D.cases === 1 && /case 2\/2/.test(D.label), 'case 2 active (étiquette « case 2/2 »)', D);
await expand();
await p.focus('.calc-input');
await p.keyboard.type(F[1].replace(',', '.') + '+0');
await p.click('.calc-send--cur'); await wait(250);
t((await val('.pt-step[data-i="0"] .pt-field:nth-child(2) input.pt-input')) === F[1] && (await val('.pt-step[data-i="0"] .pt-field:nth-child(1) input.pt-input')) === '', `→ Réponse remplit la case active (2) : ${F[1]}`);
await tapIn('.pt-step[data-i="0"] .pt-field:nth-child(1) input.pt-input');
D = await dest();
t(D.cases === 1 && /case 1\/2/.test(D.label) && (await visible('.dock-calc')), 'toucher la case 1 la rend active, la calculatrice reste dépliée', D);
await p.focus('.calc-input');
await p.keyboard.type(F[0].replace(',', '.'));
await p.keyboard.press('Enter');
await p.tap('.calc-line:last-child .calc-send'); await wait(250);
t((await val('.pt-step[data-i="0"] .pt-field:nth-child(1) input.pt-input')) === F[0], `puis la case 1 : ${F[0]}`);
await akey('ok'); await wait(300);
t(await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.className.includes('ok')), 'deux cases remplies par la calculatrice, validées « Juste »');

console.log('Sans calculatrice, sans clavier');
await open('#/entrainement/02-entiers-et-decimaux/exo?t=operations&niv=1');
t(!(await visible('[data-act="calc"]')) && !(await p.$('.calc-input:not([hidden])') && await visible('.dock-calc')), 'calcul mental (02 opérations) : pas de bouton Calculatrice du tout');
t(await visible('.dock .kp-grid') || !(await visible('.dock')), 'mais le clavier de réponse reste');
await open('#/entrainement/01-fractions-rationnels/exo?t=ranger&niv=1&g=1');
t(!(await visible('.dock')), 'rangement (glisser-déposer) : aucun clavier');
await open('#/entrainement/09-geometrie-plane-figures/exo?t=proprietes&niv=1&g=1');
const choiceStep = await p.evaluate(() => !document.querySelector('.pt-step:not(.pt-step--locked) input.pt-input'));
t(choiceStep && !(await visible('.dock .kp-grid')), 'QCM : pas de touches de réponse (au plus le bouton Calculatrice)');

console.log('Réglage global');
await open('#/entrainement/13-trigonometrie/exo?t=longueur&niv=1');
t(await visible('[data-act="calc"]'), 'calculatrice proposée en trigonométrie (13)');
await p.evaluate(() => localStorage.removeItem('compendium-maths.calc.trig'));
await expand();
t(await visible('.calc-row-trig'), 'trigonométrie affichée d’office au chapitre 13');
await p.click('[data-act="calc"]'); await wait(300);
await p.click('[data-act="settings"]');
await p.waitForSelector('[data-calc]');
await p.$eval('[data-calc]', (e) => (e as HTMLElement).click());
await wait(100);
await p.keyboard.press('Escape'); await wait(300);
t(!(await visible('[data-act="calc"]')), 'réglage désactivé : le bouton disparaît aussitôt');
await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('compendium-maths.settings') || '{}'); s.calc = true; localStorage.setItem('compendium-maths.settings', JSON.stringify(s)); });
await p.reload({ waitUntil: 'networkidle0' }); await p.waitForSelector('.pt-ex');
t(await visible('[data-act="calc"]'), 'réglage réactivé : le bouton revient');

console.log('Série');
await p.goto(URL + '#/entrainement/11-pythagore', { waitUntil: 'networkidle0' });
await open('#/entrainement/11-pythagore/serie?t=calcul-hypotenuse&niv=1&n=3&g=abc');
await expand();
await keys('3', '²', '+', '4', '²', '=');
t((await lines())[0]?.[1] === '25', 'calcul dans une série');
await p.goBack(); await wait(300);
t(!(await visible('.dock-calc')) && !(await visible('.pt-dialog')), 'Retour en série : replie la calculatrice, sans demander de quitter');
await p.goBack(); await wait(300);
t(await visible('.pt-dialog'), 'Retour suivant : la confirmation de sortie de série');

console.log('Mise en page sans débordement');
for (const vp of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
  await p.setViewport({ ...vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  for (const h of [H1, '#/entrainement/13-trigonometrie/exo?t=longueur&niv=1&g=3', '#/entrainement/05-proportionalite-pourcentages/exo?t=pourcentage&niv=1&g=2', exoHash('13-trigonometrie', 'probleme', 3, 7)]) {
    await open(h);
    const sel = '.pt-step[data-i="0"] input.pt-input';
    if (!(await p.$(sel))) continue;
    await tapIn(sel);
    let g = await geo();
    const tag = `${vp.width}×${vp.height} ${h.replace(/.*entrainement\//, '')}`;
    t(g.sw <= g.vw, `${tag} : pas de défilement horizontal`, [g.sw, g.vw]);
    const stmtSeen = (g.title && g.title.bottom > (g.bar?.bottom ?? 0) && g.title.top >= (g.bar?.bottom ?? 0) - 1) || !!g.pin;
    t(g.target && g.dock && g.target.bottom <= g.dock.top + 1 && g.target.top >= (g.pin?.bottom ?? g.bar!.bottom) - 1 && stmtSeen, `${tag} replié : énoncé (ou son résumé), case et clavier visibles ensemble`, g);
    t(g.small.length === 0, `${tag} : cibles ≥ 44 px`, g.small);
    if (await visible('[data-act="calc"]')) {
      await expand();
      g = await geo();
      t(g.pin && g.target && g.dock && g.target.top >= g.pin.bottom - 1 && g.target.bottom <= g.dock.top + 1 && g.dock.bottom <= g.vh + 1 && g.sw <= g.vw, `${tag} déplié : énoncé compact et case active visibles`, g);
      t(g.small.length === 0, `${tag} déplié : cibles ≥ 44 px`, g.small);
      await p.click('[data-act="calc"]'); await wait(250);
    }
  }
}
// balayage de tous les types (niveau le plus bas, une graine) en 360×640
{
  await p.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const bad: string[] = [];
  let n = 0;
  for (const slug of SLUGS) {
    const ch = (await import(`../src/practice/ch${slug.slice(0, 2)}/index`)).default as { generators: { id: string; levels: number[] }[] };
    for (const g of ch.generators) {
      await open(exoHash(slug, g.id, g.levels[0] as 1, 11));
      const sel = '.pt-step[data-i="0"] input.pt-input';
      if (!(await p.$(sel))) continue;
      n++;
      await p.$eval(sel, (x) => (x as HTMLInputElement).focus());
      await wait(120);
      let G2 = await geo();
      const okFold = G2.sw <= G2.vw && G2.target && G2.dock && G2.target.bottom <= G2.dock.top + 1 && G2.target.top >= (G2.pin?.bottom ?? G2.bar!.bottom) - 1 && ((G2.title && G2.title.top >= G2.bar!.bottom - 1) || !!G2.pin);
      let okOpen = true;
      if (await visible('[data-act="calc"]')) {
        await expand();
        G2 = await geo();
        okOpen = !!(G2.pin && G2.target && G2.dock && G2.target.top >= G2.pin.bottom - 1 && G2.target.bottom <= G2.dock.top + 1 && G2.sw <= G2.vw);
        await p.click('[data-act="calc"]'); await wait(150);
      }
      if (!okFold || !okOpen) bad.push(`${slug.slice(0, 2)}/${g.id}${okFold ? '' : ' (replié)'}${okOpen ? '' : ' (déplié)'}`);
    }
  }
  t(bad.length === 0, `360×640, ${n} types à saisie : énoncé, case active et clavier tiennent ensemble, replié et déplié`, bad);
}
await p.setViewport(PHONE);

console.log('Grand écran');
const d = await ctx.newPage();
await d.evaluateOnNewDocument('globalThis.__name = (f) => f');
await d.setViewport({ width: 1280, height: 800 });
await open(H1, d);
await d.click('[data-act="calc"]');
await d.waitForSelector('.dock-calc:not([hidden])'); await wait(300);
const box = await d.$eval('.dock', (e) => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.width, r.top]; });
t(box[1] === 1280 && box[2] === 400 && box[3] > 40, 'colonne à droite, sous la barre', box);
t(!(await visible('.pt-pin', d)), 'pas de résumé épinglé : l’énoncé reste visible à gauche');
t((await d.$eval('.calc-input', (i) => (i as HTMLInputElement).inputMode)) !== 'none', 'ordinateur : clavier physique utilisable');
await d.focus('.calc-input');
await d.keyboard.type('12^2-6^2');
await d.keyboard.press('Enter');
t((await d.$$eval('.calc-line .calc-l-res', (r) => r.map((x) => x.textContent))).join() === '108', 'saisie au clavier physique + Entrée');
const ov = await d.$eval('.pt-ex', (e) => e.getBoundingClientRect().right);
t(ov <= 1280 - 400, 'l’exercice n’est pas caché par la colonne', ov);
await d.focus('.pt-step[data-i="0"] input.pt-input');
await d.keyboard.type('10,4');
t((await d.$eval('.pt-step[data-i="0"] input.pt-input', (i) => (i as HTMLInputElement).value)) === '10,4', 'case réponse au clavier physique');
await d.focus('.calc-input');
await d.keyboard.press('Escape'); await wait(300);
t(!(await visible('.dock-calc', d)), 'Échap replie la calculatrice');

t(errors.length === 0, 'aucune erreur JavaScript', errors);
await browser.close();
console.log(`${pass} réussis, ${fail} échoués`);
if (fail) process.exit(1);
