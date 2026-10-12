#!/usr/bin/env -S npx tsx
/**
 * Tests de bout en bout de « S'entraîner » (Chrome headless, 390×844, tactile) :
 * accès depuis le chapitre, choix, série complète (juste, faux, indice, corrigé), retour Android
 * avec confirmation, reprise, bilan, exercice seul, clavier à l'écran, réglages, hors ligne.
 * Les bonnes réponses sont recalculées ici avec les mêmes générateurs (mêmes graines).
 * Prérequis : `npm run build` puis `npm run preview`.  Usage : npx tsx scripts/test-practice.mts [url]
 */
import puppeteer, { type Page } from 'puppeteer-core';
import ch07 from '../src/practice/ch07/index';
import ch03 from '../src/practice/ch03/index';
import ch06 from '../src/practice/ch06/index';
import ch11 from '../src/practice/ch11/index';
import ch15 from '../src/practice/ch15/index';
import ch10 from '../src/practice/ch10/index';
import ch09 from '../src/practice/ch09/index';
import ch17 from '../src/practice/ch17/index';
import ch16 from '../src/practice/ch16/index';
import ch14 from '../src/practice/ch14/index';
import ch08 from '../src/practice/ch08/index';
import ch13 from '../src/practice/ch13/index';
import ch12 from '../src/practice/ch12/index';
import ch02 from '../src/practice/ch02/index';
import ch04 from '../src/practice/ch04/index';
import ch05 from '../src/practice/ch05/index';
import ch01 from '../src/practice/ch01/index';
import { texToInput } from '../src/practice/engine/algebra';
import { generate } from '../src/practice/engine/series';
import { strToSeed } from '../src/practice/engine/rng';
import type { Step, Level, Exercise } from '../src/practice/engine/types';
import type { Q } from '../src/practice/engine/q';

const URL = process.argv[2] || 'http://localhost:4173/compendium-maths/';
const SLUG = '07-equations-inequations';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (cond: unknown, msg: string, extra = '') => {
  if (cond) { pass++; console.log('  ✓', msg); }
  else { fail++; console.log('  ✗', msg, extra); }
};
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const ctx = await browser.createBrowserContext();
const p = await ctx.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors: string[] = [];
p.on('pageerror', (e) => errors.push((e as Error).message));
const hash = () => p.evaluate(() => location.hash);
const has = async (sel: string) => !!(await p.$(sel));
const visible = (sel: string) => p.evaluate((s) => { const e = document.querySelector<HTMLElement>(s); return !!e && !e.closest('[hidden]') && e.getClientRects().length > 0; }, sel);

// ---------------------------------------------------------------- réponses
const fmtQ = (v: Q) => (v.d === 1 ? String(v.n) : `${v.n}/${v.d}`);
const relCode: Record<string, string> = { '<': 'lt', '<=': 'le', '>': 'gt', '>=': 'ge' };
const wrongRel: Record<string, string> = { '<': 'gt', '<=': 'ge', '>': 'lt', '>=': 'le' };
type Act = { fill?: string[]; none?: boolean; choice?: number; rel?: string; side?: 'left' | 'right'; incl?: '0' | '1'; order?: number[] };
function answerFor(s: Step, good: boolean): Act {
  const a = s.answer;
  switch (a.kind) {
    case 'num':
      return { fill: a.fields.map((f) => {
        if (f.approx) return (f.approx.value + (good ? 0 : 1)).toFixed(f.approx.dp).replace('.', ',');
        const v = good ? f.expect : { n: f.expect.n + f.expect.d * 7, d: f.expect.d };
        if (f.form === 'decimal' && v.d !== 1) {
          let k = 0;
          while (Math.abs(Math.round((v.n / v.d) * 10 ** k) - (v.n / v.d) * 10 ** k) > 1e-9 && k < 13) k++;
          return (v.n / v.d).toFixed(k).replace('.', ',');
        }
        return fmtQ(v);
      }) };
    case 'set': {
      if (!good) return { fill: ['123456'] };
      if (a.expect.length === 0) return { none: true };
      if (a.approx) return { fill: [a.expect.map((v) => ('q' in v ? fmtQ(v.q) : (v.s * Math.sqrt(v.sqrt.n / v.sqrt.d)).toFixed(a.approx!.dp).replace('.', ','))).join(' ; ')] };
      return { fill: [a.expect.map((v) => ('q' in v ? fmtQ(v.q) : `${v.s < 0 ? '-' : ''}√${fmtQ(v.sqrt)}`)).join(' ; ')] };
    }
    case 'choice':
      return { choice: good ? a.correct : (a.correct + 1) % a.options.length };
    case 'ineq':
      return { rel: good ? relCode[a.rel] : wrongRel[a.rel], fill: [fmtQ(a.bound)] };
    case 'expr':
      return { fill: [good ? texToInput(a.tex) : texToInput(a.tex) + '+1'] };
    case 'order': {
      const s = a.dir === 'asc' ? 1 : -1;
      const o = a.items.map((_, i) => i).sort((i, j) => s * (a.values[i].n * a.values[j].d - a.values[j].n * a.values[i].d));
      return { order: good ? o : [...o].reverse() };
    }
    case 'ray': {
      const right = a.rel === '>' || a.rel === '>=';
      const incl = a.rel === '<=' || a.rel === '>=';
      return { side: right === good ? 'right' : 'left', incl: incl ? '1' : '0' };
    }
  }
}
/** Clic « au doigt » : l'élément est d'abord amené au centre (le clavier fixe couvre le bas de l'écran). */
async function tap(sel: string) {
  await p.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
  await p.click(sel);
}
/** Saisit et valide l'étape active. */
async function act(stepIdx: number, x: Act) {
  const sel = `.pt-step[data-i="${stepIdx}"]`;
  if (x.choice !== undefined) {
    await tap(`${sel} .pt-choice[data-i="${x.choice}"]`);
    return wait(150);
  }
  if (x.order) {
    // rangement avec les boutons ↑ (tri par sélection)
    for (let k = 0; k < x.order.length; k++) {
      const cur = await p.$$eval(`${sel} .po-card`, (cs) => cs.map((c) => Number((c as HTMLElement).dataset.item)));
      for (let j = cur.indexOf(x.order[k]); j > k; j--) { await tap(`${sel} .po-card:nth-child(${j + 1}) [data-mv="-1"]`); await wait(200); }
    }
  }
  if (x.rel) await tap(`${sel} [data-rel="${x.rel}"]`);
  if (x.side) await tap(`${sel} [data-side="${x.side}"]`);
  if (x.incl) await tap(`${sel} [data-incl="${x.incl}"]`);
  if (x.none) await tap(`${sel} .pt-none`);
  if (x.fill) {
    const ins = await p.$$(`${sel} input.pt-input`);
    for (let i = 0; i < x.fill.length; i++) {
      await ins[i].evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await ins[i].click();
      await p.evaluate((el) => ((el as HTMLInputElement).value = ''), ins[i]);
      await ins[i].type(x.fill[i]);
    }
  }
  await tap(`${sel} .pt-validate`);
  await wait(150);
}
const fbClass = (i: number) => p.$eval(`.pt-step[data-i="${i}"] .pt-feedback`, (e) => e.className);

/** Exercice courant de la série (état de la série dans sessionStorage). */
async function currentExercise(): Promise<Exercise> {
  const it = await p.evaluate(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)!;
      if (k.startsWith('compendium-maths.serie:') && k.endsWith(location.hash)) {
        const s = JSON.parse(sessionStorage.getItem(k)!);
        return s.items[s.idx];
      }
    }
    return null;
  });
  return generate(ch07, it.type, it.level as Level, it.seed);
}
async function solveAll(ex: Exercise, from = 0) {
  for (let i = from; i < ex.steps.length; i++) {
    await act(i, answerFor(ex.steps[i], true));
    const c = await fbClass(i);
    if (!c.includes('pt-fb--ok')) console.log('    ! étape', i, ex.type, ex.level, ex.seed, JSON.stringify(answerFor(ex.steps[i], true)), c, await p.$eval(`.pt-step[data-i="${i}"] .pt-feedback`, (e) => e.textContent));
  }
}

// ---------------------------------------------------------------- hors ligne prêt
console.log('Pré-cache');
await p.goto(URL, { waitUntil: 'networkidle0' });
await p.evaluate(async () => { await navigator.serviceWorker.ready; });
await p.waitForFunction(async () => {
  for (const k of await caches.keys()) { const c = await caches.open(k); if ((await c.keys()).length > 200) return true; }
  return false;
}, { timeout: 60000, polling: 500 }).catch(() => {});
const cached = await p.evaluate(async () => {
  const urls: string[] = [];
  for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) urls.push(r.url);
  return urls;
});
t(cached.some((u) => /assets\/practice-.*\.js/.test(u)) && cached.some((u) => /assets\/katex-.*\.js/.test(u)) && cached.some((u) => /assets\/ch07-.*\.js/.test(u)), 'modules d’entraînement, générateurs et KaTeX pré-cachés');

console.log('Accès depuis le chapitre');
await p.goto(URL + '#/ch/' + SLUG, { waitUntil: 'networkidle0' });
await p.waitForSelector('article.prose section');
t(await visible('.practice-card'), 'carte « S’entraîner » visible sur téléphone (chapitre 07)');
t(await has('.practice-banner'), 'encart « S’entraîner » au début des exercices');
// chapitre sans entraînement (s'il en reste un) : pas de bouton
const NOPRACT = Object.entries((JSON.parse((await import('node:fs')).readFileSync('content-meta.json', 'utf8')) as { chapters: Record<string, { practice?: { enabled?: boolean } | null }> }).chapters).filter(([, v]) => !v.practice?.enabled).map(([k]) => k)[0];
if (NOPRACT) {
  await p.goto(URL + '#/ch/' + NOPRACT, { waitUntil: 'networkidle0' });
  await p.waitForSelector('article.prose section');
  t(!(await has('.practice-card')) && !(await has('.practice-banner')), `pas de bouton sur un chapitre sans entraînement (${NOPRACT})`);
} else t(true, 'tous les chapitres ont un entraînement (pas de chapitre sans bouton à tester)');
await p.goto(URL + '#/ch/' + SLUG, { waitUntil: 'networkidle0' });
await p.waitForSelector('.practice-card');
const katexBefore = await p.evaluate(() => performance.getEntriesByType('resource').some((r) => /assets\/katex-/.test(r.name)));
t(!katexBefore, 'KaTeX (JS) non chargé pour lire un cours');
await p.click('.practice-card');
await p.waitForSelector('.pt-cards');
t((await hash()) === '#/entrainement/' + SLUG, 'page de choix ouverte');
const n1 = await p.$$eval('.pt-card:not(.pt-card--mix)', (l) => l.length);
await p.click('[data-level="3"]');
const n3 = await p.$$eval('.pt-card:not(.pt-card--mix)', (l) => l.length);
t(n1 === 5 && n3 >= 6, 'types proposés selon le niveau', `★=${n1} ★★★=${n3}`);
t(await p.$$eval('.pt-card-ex .katex', (l) => l.length > 0), 'exemples rendus avec KaTeX');
await p.click('[data-level="2"]');
await p.click('[data-count="5"]');

console.log('Série mixte ★★ de 5');
await p.click('[data-start="mix"]');
await p.waitForSelector('.pt-ex');
const h0 = await hash();
t(/^#\/entrainement\/07-equations-inequations\/serie\?t=mix&niv=2&n=5&g=[0-9a-z]+$/.test(h0), 'adresse de série rejouable', h0);
t((await p.$eval('.appbar .t1', (e) => e.textContent)) === 'Série · 1 / 5', 'progression « 1 / 5 »');

// Exercice 1 : tout juste
let ex = await currentExercise();
t((await p.$eval('.pt-ex-title', (e) => e.textContent!.trim())).length > 5 && (await p.$$eval('.pt-ex .katex', (l) => l.length)) > 0, 'exercice affiché avec formules');
await solveAll(ex);
t((await fbClass(ex.steps.length - 1)).includes('pt-fb--ok'), 'bonne réponse → « Juste »');
t(await visible('[data-act="next"]'), 'bouton « Exercice suivant »');
t(await visible('[data-act="peek-done"], .pt-ex [data-act="sol"], .pt-ex .pt-peek button') || (await p.$eval('.pt-solution', (e) => (e as HTMLElement).hidden)), 'corrigé non imposé après une réussite');
await tap('[data-act="next"]');
await wait(200);
t((await p.$eval('.appbar .t1', (e) => e.textContent)) === 'Série · 2 / 5', 'exercice suivant');

// Exercice 2 : faux puis juste (indice)
ex = await currentExercise();
await act(0, answerFor(ex.steps[0], false));
const fb2 = await fbClass(0);
const maxA = ex.steps[0].answer.kind === 'choice' ? (ex.steps[0].answer.attempts ?? (ex.steps[0].answer.options.length > 2 ? 2 : 1)) : 2;
if (maxA > 1) {
  t(fb2.includes('pt-fb--hint'), 'première erreur → indice ciblé', fb2);
  t(await visible('.pt-peek button'), 'bouton « Voir le corrigé » proposé');
  t((await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.textContent)).includes('Indice'), 'texte de l’indice');
  await act(0, answerFor(ex.steps[0], true));
  t((await fbClass(0)).includes('pt-fb--ok'), 'correction → « Juste »');
  await solveAll(ex, 1);
} else {
  t(fb2.includes('pt-fb--ko'), 'question à un essai : réponse fausse signalée');
  await solveAll(ex, 1);
}
await tap('[data-act="next"]');
await wait(200);

// Exercice 3 : deux fois faux → corrigé
ex = await currentExercise();
for (let k = 0; k < 2; k++) {
  if (await p.$(`.pt-step[data-i="0"].pt-step--locked`)) break;
  const s0 = ex.steps[0].answer;
  if (s0.kind === 'choice') await act(0, { choice: (s0.correct + 1 + k) % s0.options.length });
  else await act(0, answerFor(ex.steps[0], false));
}
t((await fbClass(0)).includes('pt-fb--ko'), 'deuxième erreur → « Faux » et bonne réponse donnée');
t((await p.$eval('.pt-step[data-i="0"] .pt-feedback', (e) => e.textContent)).includes('La bonne réponse'), 'la bonne réponse est affichée');
await solveAll(ex, 1);
t(!(await p.$eval('.pt-solution', (e) => (e as HTMLElement).hidden)), 'corrigé rédigé affiché automatiquement');
t(await p.$eval('.pt-solution', (e) => e.querySelectorAll('p').length >= 2 && !!e.querySelector('a[href^="#/ch/07"]')), 'corrigé : étapes + lien vers la section du cours');

// Retour Android : confirmation
console.log('Retour Android pendant la série');
const h3 = await hash();
await p.goBack();
await wait(400);
t(await has('.pt-dialog'), 'retour → demande de confirmation');
t((await hash()) === h3, '… sans quitter la série');
await p.click('.pt-dialog [data-v="0"]');
await wait(300);
t(!(await has('.pt-dialog')) && (await has('.pt-ex')), '« Continuer la série » → on reste');
await p.goBack();
await wait(400);
t(await has('.pt-dialog'), 'nouveau retour → nouvelle confirmation (garde réarmée)');
await p.keyboard.press('Escape');
await wait(300);
t(!(await has('.pt-dialog')), 'Échap → on reste');
await p.click('.appbar [data-act="back"]');
await wait(300);
t(await has('.pt-dialog'), 'flèche « ← » de la barre → confirmation');
await p.click('.pt-dialog [data-v="1"]');
await wait(600);
t((await hash()) === '#/entrainement/' + SLUG && (await has('.pt-cards')), '« Quitter » → page de choix');
t(await p.$$eval('.pt-stat:not(.pt-stat--new)', (l) => l.length >= 1), 'résultats enregistrés par type');
await p.goForward();
await wait(800);
t((await hash()) === h3 && (await p.$eval('.appbar .t1', (e) => e.textContent)) === 'Série · 3 / 5', '« suivant » → la série reprend là où on l’a laissée');

// Fin de série
await tap('[data-act="next"]');
await wait(200);
for (let k = 3; k < 5; k++) {
  ex = await currentExercise();
  await solveAll(ex);
  await tap('[data-act="next"]');
  await wait(250);
}
t(await has('.pt-summary'), 'bilan de fin de série');
const score = await p.$eval('.pt-score-big', (e) => e.textContent);
t(score?.replace(/\s/g, '').startsWith('3/5') || score?.replace(/\s/g, '') === (maxA > 1 ? '3/5' : '3/5'), 'score « 3 / 5 » (juste, indice, faux, juste, juste)', score!);
t(await p.$$eval('.pt-recap > li', (l) => l.length === 5 && l.every((x) => !!x.querySelector('a[href*="/exo?"]'))), 'récapitulatif : 5 exercices, chacun « Refaire »');
t(await has('[data-act="redo"]'), 'bouton « Retravailler les types ratés »');
await p.goBack();
await wait(500);
t((await hash()) === '#/entrainement/' + SLUG && !(await has('.pt-dialog')), 'après le bilan, retour sans confirmation');

// Nouvelle série depuis le bilan : l'ancienne ne reste pas dans l'historique
await p.goForward();
await wait(600);
if (await has('.pt-summary')) {
  await p.click('[data-act="again"]');
  await wait(600);
  const h5 = await hash();
  t(h5 !== h3 && (await has('.pt-ex')), '« Nouvelle série » → autre graine');
  await p.goBack();
  await wait(400);
  if (await has('.pt-dialog')) await p.click('.pt-dialog [data-v="1"]');
  await wait(600);
  t((await hash()) === '#/entrainement/' + SLUG, '… et « retour » ramène au choix, pas à l’ancienne série');
}

// Exercice seul + « Un autre » + clavier
console.log('Exercice seul et clavier');
await p.click('[data-level="1"]');
await p.click('[data-one="ax-plus-b"]');
await p.waitForSelector('.pt-ex');
const he = await hash();
t(/\/exo\?t=ax-plus-b&niv=1&g=/.test(he), 'lien « Un seul exercice »', he);
const g0 = new URLSearchParams(he.split('?')[1]).get('g')!;
ex = generate(ch07, 'ax-plus-b', 1, strToSeed(g0)!);
t((await p.$eval('.pt-display', (e) => e.textContent)) !== '', 'énoncé affiché');
const inp = await p.$('.pt-step[data-i="0"] input.pt-input');
await inp!.click();
await wait(250);
t(await visible('.keypad'), 'clavier mathématique à l’écran (tactile)');
t((await p.$eval('.pt-step[data-i="0"] input.pt-input', (e) => (e as HTMLInputElement).inputMode)) === 'none', 'clavier du téléphone non ouvert (inputmode=none)');
const val = fmtQ((ex.steps[0].answer as { fields: { expect: Q }[] }).fields[0].expect);
for (const ch of val) {
  const k = ch === '-' ? '-' : ch;
  await p.click(`.keypad [data-k="${k}"]`);
}
t((await p.$eval('.pt-step[data-i="0"] input.pt-input', (e) => (e as HTMLInputElement).value)).replace('−', '-') === val, 'saisie au clavier à l’écran', val);
t(await p.evaluate(() => document.activeElement?.classList.contains('pt-input')), 'la case garde le focus');
await p.click('.keypad [data-k="ok"]');
await wait(250);
t((await fbClass(0)).includes('pt-fb--ok'), 'OK du clavier → réponse validée et juste');
await p.click('[data-act="another"]');
await wait(300);
const he2 = await hash();
t(he2 !== he && /\/exo\?t=ax-plus-b&niv=1&g=/.test(he2), '« Un autre » → nouvelle graine dans l’adresse');
await p.goBack();
await wait(500);
t((await hash()) === '#/entrainement/' + SLUG, 'retour → page de choix (« Un autre » ne s’empile pas)');

// Saisies tolérantes
console.log('Saisies');
await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=deux-membres&niv=2&g=abc', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
ex = generate(ch07, 'deux-membres', 2, strToSeed('abc')!);
const f0 = (ex.steps[0].answer as { fields: { expect: Q }[] }).fields[0].expect;
const alt = f0.d === 1 ? `${f0.n * 3}/3`.replace('-', '−') : `${f0.n * 2}/${f0.d * 2}`.replace('-', '−');
await act(0, { fill: [alt] });
const fbAlt = await fbClass(0);
t(fbAlt.includes('pt-fb--ok') || fbAlt.includes('pt-fb--hint') || fbAlt.includes('pt-fb--info'), 'écriture équivalente avec « − » typographique comprise', `${alt} → ${fbAlt}`);
await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=ax-egal-b&niv=1&g=zz', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
await act(0, { fill: ['abc'] });
t((await fbClass(0)).includes('pt-fb--info'), 'saisie illisible → message, sans compter d’essai');
t(!(await visible('.pt-peek button')), '… et sans proposer le corrigé');

// Droite graduée
console.log('Inéquation et droite graduée');
await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=inequation&niv=2&g=k1', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
ex = generate(ch07, 'inequation', 2, strToSeed('k1')!);
await act(0, answerFor(ex.steps[0], true));
t(await visible('.pt-step[data-i="1"] svg.nl--edit'), 'droite graduée interactive après la borne');
const box = await (await p.$('.pt-step[data-i="1"] svg.nl--edit'))!.boundingBox();
await p.touchscreen.tap(box!.x + box!.width * 0.9, box!.y + box!.height / 2);
await wait(150);
t((await p.$eval('.pt-step[data-i="1"] [data-side="right"]', (e) => e.getAttribute('aria-checked'))) === 'true', 'toucher la droite à droite → « À droite » choisi');
const r1 = answerFor(ex.steps[1], true);
await tap(`.pt-step[data-i="1"] [data-incl="${r1.incl}"]`);
t(await p.$eval('.pt-step[data-i="1"] svg', (s) => !!s.querySelector('.nl-ray') && !!s.querySelector('.nl-br')), 'rayon vert et crochet dessinés');
await act(1, r1);
t((await fbClass(1)).includes('pt-fb--ok'), 'représentation juste validée');
if (!(await visible('.pt-solution'))) await tap('.pt-peek button, [data-act="sol"]').catch(() => {});
t(await p.$eval('.pt-solution', (e) => !!e.querySelector('svg.nl')), 'corrigé avec droite graduée');

// Vague A : chaque type, chaque niveau, de bout en bout (bonnes réponses saisies dans l'interface)
console.log('Vague A : 03, 06, 11');
for (const ch of [ch03, ch06, ch11, ch01, ch05, ch04, ch02, ch12, ch13, ch08, ch14, ch16, ch17, ch09, ch10, ch15]) {
  await p.goto(URL + '#/ch/' + ch.slug, { waitUntil: 'networkidle0' });
  await wait(300);
  t(await visible('.practice-card'), `carte « S’entraîner » sur le chapitre ${ch.slug.slice(0, 2)}`);
  let okAll = true, figs = 0, n = 0;
  for (const g of ch.generators) for (const lv of g.levels) {
    const seed = `e2e${lv}`;
    await p.goto(URL + `#/entrainement/${ch.slug}/exo?t=${g.id}&niv=${lv}&g=${seed}`, { waitUntil: 'networkidle0' });
    await p.waitForSelector('.pt-ex');
    const e = generate(ch, g.id, lv, strToSeed(seed)!);
    if (e.figure) figs += (await has('.pt-figure svg')) ? 1 : 0;
    for (let i = 0; i < e.steps.length; i++) {
      await act(i, answerFor(e.steps[i], true));
      const c = await fbClass(i);
      if (!c.includes('pt-fb--ok')) { okAll = false; console.log('    !', ch.slug, g.id, lv, i, JSON.stringify(answerFor(e.steps[i], true)), c, await p.$eval(`.pt-step[data-i="${i}"] .pt-feedback`, (x) => x.textContent)); }
    }
    n++;
  }
  t(okAll, `${ch.slug.slice(0, 2)} : ${n} exercices (tous types × niveaux) résolus dans l’interface`);
  if (ch === ch11) t(figs >= 8, `11 : figures SVG affichées (${figs})`);
}
// Expression : clavier « x », réponse fausse → contre-exemple
await p.goto(URL + '#/entrainement/06-calcul-litteral/exo?t=developper&niv=1&g=kp', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
await p.click('.pt-step[data-i="0"] input.pt-input');
await wait(250);
t(await visible('.keypad [data-k="x"]'), 'clavier « expression » : touche x');
const exKp = generate(ch06, 'developper', 1, strToSeed('kp')!);
const wrongIn = texToInput((exKp.steps[0].answer as { tex: string }).tex) + '+1';
await act(0, { fill: [wrongIn] });
t(/Contrôle avec|signe|multiplie|produit/.test(await p.$eval('.pt-step[data-i="0"] .pt-feedback', (x) => x.textContent ?? '')), 'expression fausse → explication (erreur typique ou contre-exemple)');
t(await has('.pt-step[data-i="0"] .pt-preview .katex, .pt-step[data-i="0"] .katex'), 'aperçu mis en forme de l’expression');

// Adresses invalides
await p.goto(URL + '#/entrainement/' + (NOPRACT ?? '99-chapitre-inexistant'), { waitUntil: 'networkidle0' });
await p.waitForFunction(() => document.querySelector('h1')?.textContent === 'Page introuvable', { timeout: 15000 }).catch(() => {});
t((await p.$eval('h1', (e) => e.textContent)) === 'Page introuvable', 'chapitre sans entraînement → page introuvable');
await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=inconnu&niv=1', { waitUntil: 'networkidle0' });
await wait(500);
t((await p.$eval('h1', (e) => e.textContent)) === 'Page introuvable', 'type inconnu → page introuvable');

// Réglages
console.log('Réglages');
await p.goto(URL + '#/entrainement/' + SLUG, { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-cards');
await p.click('.appbar [data-act="settings"]');
await p.waitForSelector('[data-kp-v]');
await wait(500);
await tap('[data-kp-v="off"]');
p.once('dialog', (d) => d.accept());
await tap('[data-reset-practice]');
await wait(200);
t(await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('compendium-maths.practice')!); return Object.keys(s.types).length === 0 && s.series.length === 0 && s.prefs.keypad === 'off'; }), 'effacer les résultats (préférences gardées)');
await p.goBack();
await wait(400);
await p.goto(URL + '#/entrainement/' + SLUG + '/exo?t=ax-egal-b&niv=1&g=zz', { waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
await p.click('.pt-step[data-i="0"] input.pt-input');
await wait(200);
t(!(await visible('.keypad')), 'clavier à l’écran désactivable (« Jamais »)');
await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('compendium-maths.practice')!); s.prefs.keypad = 'auto'; localStorage.setItem('compendium-maths.practice', JSON.stringify(s)); });

// Thème sombre : contraste des retours
await p.evaluate(() => { localStorage.setItem('compendium-maths.settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('compendium-maths.settings') || '{}'), theme: 'dark' })); });
await p.reload({ waitUntil: 'networkidle0' });
await p.waitForSelector('.pt-ex');
t((await p.evaluate(() => getComputedStyle(document.querySelector('.pt-ex-title')!).color)) !== 'rgb(27, 31, 36)', 'thème sombre appliqué aux exercices');
await p.evaluate(() => { localStorage.setItem('compendium-maths.settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('compendium-maths.settings') || '{}'), theme: 'light' })); });

// Mes progrès
console.log('Mes progrès');
await p.evaluate(() => {
  localStorage.setItem('compendium-maths.progress', JSON.stringify({ '02-entiers-et-decimaux': 1, '11-pythagore': 0.4 }));
  const s = JSON.parse(localStorage.getItem('compendium-maths.practice')!);
  s.types = { '02-entiers-et-decimaux/euclide': { n: 6, ok: 1, hint: 1, fail: 4, recent: 'offfhf', at: Date.now() }, '04-puissances-notation-scientifique/regles': { n: 3, ok: 3, hint: 0, fail: 0, recent: 'ooo', at: Date.now() } };
  s.series = [{ at: Date.now(), slug: '04-puissances-notation-scientifique', types: 'mix', level: 2, n: 3, ok: 3, hint: 0, fail: 0 }];
  localStorage.setItem('compendium-maths.practice', JSON.stringify(s));
});
await p.goto(URL + '#/', { waitUntil: 'networkidle0' });
await tap('.appbar--home a[href="#/progres"]');
await p.waitForSelector('.page--progress .pg-ch');
const pg = await p.evaluate(() => ({
  kpi: [...document.querySelectorAll('.pg-k')].map((e) => e.textContent!.replace(/\s/g, '')),
  n: document.querySelectorAll('.pg-ch').length,
  weak: document.querySelector('[data-slug="02-entiers-et-decimaux"] .pg-weak')?.textContent ?? '',
  weak4: !!document.querySelector('[data-slug="04-puissances-notation-scientifique"] .pg-weak'),
  read11: document.querySelector('[data-slug="11-pythagore"] .pg-line')?.textContent ?? '',
  go: document.querySelectorAll('.pg-go').length,
  rec: document.querySelectorAll('.pg-series li').length,
  w: document.documentElement.scrollWidth,
}));
t(pg.n === 17, 'Mes progrès : 17 chapitres listés', String(pg.n));
t(pg.kpi[0] === '1/17' && pg.kpi[1] === '9' && pg.kpi[2] === '44%', 'Mes progrès : chiffres clés (lus, faits, premier coup)', pg.kpi.join(' '));
t(pg.weak.includes('Division euclidienne') && !pg.weak4, 'Mes progrès : type à retravailler détecté, avec son titre', pg.weak);
t(pg.read11.includes('40'), 'Mes progrès : lecture partielle affichée', pg.read11);
const nPractice = await p.evaluate(() => fetch('content/index.json').then((r) => r.json()).then((j) => j.chapters.filter((c: { practice?: { enabled: boolean } }) => c.practice?.enabled).length));
t(pg.go === nPractice && pg.rec === 1, `Mes progrès : boutons S’entraîner (${nPractice} chapitres) et dernière série`, `${pg.go} ${pg.rec}`);
t(pg.w <= 390, 'Mes progrès : pas de débordement horizontal', String(pg.w));
await p.screenshot({ path: 'captures/progres-mobile.png', fullPage: false });
await tap('.page--progress a.icon-btn');
await p.waitForSelector('.page--home');
t(true, 'Mes progrès : retour au sommaire');

// Hors ligne
console.log('Hors ligne');
const p2 = await ctx.newPage();
await p2.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
p2.on('pageerror', (e) => errors.push((e as Error).message));
await p2.setOfflineMode(true);
await p2.goto(URL + '#/entrainement/' + SLUG + '/serie?t=mix&niv=3&n=5&g=off1', { waitUntil: 'load' });
await p2.waitForSelector('.pt-ex', { timeout: 10000 }).catch(() => {});
t(!!(await p2.$('.pt-ex .katex')), 'hors ligne : une série s’ouvre, formules rendues');
await p2.close();

t(errors.length === 0, 'aucune erreur JavaScript', errors.join(' | '));
console.log(`\n${pass} réussis, ${fail} échoués`);
await browser.close();
process.exit(fail ? 1 : 0);
