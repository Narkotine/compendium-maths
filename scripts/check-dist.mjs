#!/usr/bin/env node
/**
 * Contrôles du build (dist/) : chapitres, formules, figures, liens internes, PWA.
 * Code de sortie ≠ 0 si un contrôle échoue.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const fails = [];
const ok = [];
const check = (cond, msg) => (cond ? ok.push(msg) : fails.push(msg));
const read = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(DIST, f));

if (!exists('index.html')) {
  console.error('dist/ absent : lancer `npm run build`.');
  process.exit(1);
}
const index = JSON.parse(read('content/index.json'));
const search = JSON.parse(read('content/search.json'));
check(index.chapters.length === 17, `17 chapitres dans l'index (trouvé : ${index.chapters.length})`);

const ids = {};
const docs = {};
let dollars = 0, katexErr = 0, figs = 0, missingFigs = [], katexCount = 0;
for (const c of index.chapters) {
  const f = `content/chapters/${c.slug}.html`;
  if (!exists(f)) { fails.push(`fichier manquant : ${f}`); continue; }
  const { document } = parseHTML(`<!doctype html><html><body><div id="r">${read(f)}</div></body></html>`);
  const r = document.getElementById('r');
  docs[c.slug] = r;
  ids[c.slug] = new Set([...r.querySelectorAll('[id]')].map((e) => e.id));
  katexErr += r.querySelectorAll('.katex-error').length;
  katexCount += r.querySelectorAll('.katex').length;
  const clone = r.cloneNode(true);
  clone.querySelectorAll('.katex').forEach((k) => k.remove());
  const d = (clone.textContent.match(/\$/g) || []).length;
  if (d) fails.push(`${c.slug} : ${d} « $ » brut(s) hors formules`);
  dollars += d;
  for (const img of r.querySelectorAll('img')) {
    figs++;
    const src = img.getAttribute('src');
    if (!exists(src)) missingFigs.push(`${c.slug} → ${src}`);
  }
  for (const b of r.querySelectorAll('.fig-zoom')) if (!exists(b.getAttribute('data-src'))) missingFigs.push(`${c.slug} → ${b.getAttribute('data-src')}`);
  // corrigés : chaque bouton « Voir le corrigé » a son corrigé
  for (const t of r.querySelectorAll('.cor-toggle')) {
    const code = t.getAttribute('data-cor');
    if (!r.querySelector(`#cor-${code}`)) fails.push(`${c.slug} : corrigé ${code} introuvable`);
  }
  check(r.querySelectorAll('.exo').length === c.exercises, `${c.slug} : ${c.exercises} exercices`);
}
check(dollars === 0, `0 « $ » brut dans le texte (formules toutes rendues)`);
check(katexErr === 0, `0 erreur KaTeX (${katexCount} formules rendues)`);
check(missingFigs.length === 0, `toutes les figures référencées existent (${figs})`);
missingFigs.forEach((m) => fails.push('figure manquante : ' + m));

// Liens internes (renvois, sommaire, corrigés, recherche)
let links = 0;
const bad = [];
const resolve = (href, from) => {
  const m = href.match(/^#\/ch\/([^/]+)(?:\/(.+))?$/);
  if (!m) return href === '#/' || href.startsWith('#/recherche');
  if (!ids[m[1]]) return false;
  return !m[2] || ids[m[1]].has(m[2]);
};
for (const [slug, r] of Object.entries(docs)) {
  for (const a of r.querySelectorAll('a[href]')) {
    const h = a.getAttribute('href');
    if (!h.startsWith('#')) { bad.push(`${slug} : lien externe/inattendu ${h}`); continue; }
    links++;
    if (!resolve(h, slug)) bad.push(`${slug} : ${h} (« ${a.textContent} »)`);
  }
}
for (const c of index.chapters) {
  for (const t of c.toc) { links++; if (!ids[c.slug]?.has(t.id)) bad.push(`sommaire ${c.slug} → ${t.id}`); }
  for (const [p, id] of Object.entries(c.parts)) { links++; if (id && !ids[c.slug]?.has(id)) bad.push(`accès rapide ${c.slug}/${p} → ${id}`); }
  for (const n of c.prereqs) { links++; if (!index.chapters.some((x) => x.num === n)) bad.push(`prérequis ${c.slug} → ${n}`); }
}
for (const e of search) { links++; if (!ids[e.c]?.has(e.id)) bad.push(`recherche ${e.c} → ${e.id}`); }
check(bad.length === 0, `tous les liens internes résolus (${links})`);
bad.slice(0, 30).forEach((b) => fails.push('lien non résolu : ' + b));

// PWA
const html = read('index.html');
check(/<html lang="fr"/.test(html), 'index.html : lang="fr"');
check(/viewport-fit=cover/.test(html), 'index.html : viewport-fit=cover (encoches iPhone)');
check(/rel="manifest"/.test(html), 'index.html : lien vers le manifest');
check(/apple-touch-icon/.test(html) && /apple-mobile-web-app-capable/.test(html), 'index.html : métas iOS');
check(exists('sw.js'), 'service worker sw.js présent');
const man = JSON.parse(read('manifest.webmanifest'));
check(man.name && man.short_name && man.start_url && man.display === 'standalone' && man.lang === 'fr', 'manifest : name, short_name, start_url, display, lang');
const sizes = man.icons.map((i) => i.sizes + ':' + (i.purpose || 'any'));
check(sizes.includes('192x192:any') && sizes.includes('512x512:any') && sizes.some((s) => s.endsWith('maskable')), 'manifest : icônes 192, 512 et maskable');
check(man.icons.every((i) => exists(i.src)), 'manifest : fichiers d’icônes présents');
const sw = read('sw.js');
const precached = new Set([...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]));
const need = ['index.html', 'content/index.json', 'content/search.json', ...index.chapters.map((c) => `content/chapters/${c.slug}.html`)];
const figFiles = [];
for (const d of fs.readdirSync(path.join(DIST, 'content/figures'))) for (const f of fs.readdirSync(path.join(DIST, 'content/figures', d))) figFiles.push(`content/figures/${d}/${f}`);
const missingPre = [...need, ...figFiles].filter((u) => !precached.has(u));
check(missingPre.length === 0, `pré-cache hors ligne : ${precached.size} fichiers, dont les 17 chapitres, l’index de recherche et ${figFiles.length} figures`);
missingPre.slice(0, 10).forEach((m) => fails.push('non pré-caché : ' + m));
const woff2 = [...precached].filter((u) => u.endsWith('.woff2')).length;
check(woff2 >= 20, `polices (KaTeX + texte) pré-cachées : ${woff2} woff2`);

// Entraînement (v0.3) : modules chargés à la demande, pré-cachés, KaTeX hors du bundle principal
const assets = fs.readdirSync(path.join(DIST, 'assets'));
const entry = (html.match(/src="(?:\.\/|\/compendium-maths\/|\/)?(assets\/index-[^"]+\.js)"/) || [])[1];
const chunk = (re) => assets.find((f) => re.test(f));
const practiceJs = chunk(/^practice-.*\.js$/), practiceCss = chunk(/^practice-.*\.css$/), katexJs = chunk(/^katex-.*\.js$/);
// chapitres avec « S'entraîner » (vague A : 03, 06, 11 en plus du pilote 07)
const PRACTICE = ['01-fractions-rationnels', '02-entiers-et-decimaux', '03-nombres-relatifs', '04-puissances-notation-scientifique', '05-proportionalite-pourcentages', '06-calcul-litteral', '07-equations-inequations', '08-fonctions', '09-geometrie-plane-figures', '10-transformations-plan', '11-pythagore', '12-thales', '13-trigonometrie', '14-aires-volumes-grandeurs', '15-geometrie-espace', '16-statistiques', '17-probabilites'];
const chJs = PRACTICE.map((s) => chunk(new RegExp(`^ch${s.slice(0, 2)}-.*\\.js$`)));
check(entry && practiceJs && katexJs && practiceCss && chJs.every(Boolean), `entraînement : modules séparés (vue ${practiceJs}, générateurs ${chJs.join(', ')}, KaTeX ${katexJs})`);
if (entry) {
  const main = read(entry);
  check(!/renderToString|ParseError|\\displaystyle/.test(main) && !/Tester si un nombre est solution|Calcule l’hypoténuse|Développe et réduis/.test(main) && main.length < 120000, `bundle principal sans KaTeX ni générateurs (${Math.round(main.length / 1024)} Ko)`);
}
check([practiceJs, practiceCss, katexJs, ...chJs].every((f) => f && precached.has('assets/' + f)), 'entraînement : vue, styles, générateurs (4 chapitres) et KaTeX pré-cachés (hors ligne)');
// Automatismes (v0.11) : vue et questions flash chargées à la demande, pré-cachées, hors du bundle principal
const autoJs = chunk(/^automatismes-.*\.js$/);
check(autoJs && precached.has('assets/' + autoJs), `automatismes : module séparé et pré-caché (${autoJs})`);
if (entry) check(!/Séance au hasard|a5-tables|Division euclidienne de/.test(read(entry)), 'automatismes : absents du bundle principal');
const withPractice = index.chapters.filter((c) => c.practice?.enabled).map((c) => c.slug);
const counts = withPractice.map((s) => index.chapters.find((c) => c.slug === s).practice.generators.length);
check(withPractice.join() === PRACTICE.join() && counts.every((n) => n >= 6 && n <= 13), `« S’entraîner » activé pour ${withPractice.map((s, i) => `${s.slice(0, 2)} (${counts[i]} types)`).join(', ')} ; masqué ailleurs`);

for (const m of ok) console.log('  ✓', m);
for (const m of fails) console.log('  ✗', m);
console.log(fails.length ? `\nÉCHEC : ${fails.length} problème(s).` : `\nTous les contrôles sont passés (${ok.length}).`);
process.exit(fails.length ? 1 : 0);
