#!/usr/bin/env node
/**
 * Pré-rendu du contenu : compendium-maths/*.md  →  public/content/
 *   - index.json      : métadonnées des chapitres, groupes, sommaires (TOC)
 *   - chapters/*.html : corps HTML de chaque chapitre (KaTeX rendu au build)
 *   - search.json     : index de recherche plein texte (par section)
 *   - figures/<slug>/*.svg : figures (légèrement minifiées)
 *   - build-report.json : erreurs KaTeX, liens, figures, avertissements
 * Aucun fichier source n'est modifié.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { marked } from 'marked';
import { parseHTML } from 'linkedom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// sources du cours : $COMPENDIUM_SRC, sinon ./cours (dépôt GitHub), sinon ../compendium-maths (box)
const SRC = path.resolve(process.env.COMPENDIUM_SRC || (fs.existsSync(path.join(ROOT, 'cours')) ? path.join(ROOT, 'cours') : path.join(ROOT, '..', 'compendium-maths')));
const OUT = path.join(ROOT, 'public', 'content');
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'content-meta.json'), 'utf8'));

const report = { katexErrors: [], missingFigures: [], links: [], unresolvedLinks: [], warnings: [], chapters: {} };

// ---------------------------------------------------------------- utilitaires
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[’'`]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'section';
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function rmDir(dir) {
  // garde-fou : on ne vide que des dossiers sous public/content
  if (!dir.startsWith(OUT)) throw new Error('refus de supprimer ' + dir);
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------- KaTeX
let currentSlug = '';
/**
 * Formules en ligne : KaTeX autorise une coupure de ligne après chaque relation (=, <…) ET après chaque
 * opération (+, −, ×), ce qui donne « 36 + / 64 = 100 ». On regroupe chaque membre entre deux relations
 * de premier niveau dans des accolades : les coupures ne restent possibles qu'après =, <, ≤, ≈, ⇔…
 * (les espacements autour des opérations sont conservés à l'intérieur des groupes).
 */
const REL_CMDS = new Set(['le', 'ge', 'leq', 'geq', 'leqslant', 'geqslant', 'neq', 'ne', 'approx', 'equiv', 'simeq',
  'Rightarrow', 'Leftarrow', 'Leftrightarrow', 'iff', 'implies', 'to', 'mapsto', 'longmapsto', 'longrightarrow']);
export function groupForBreaks(tex) {
  if (/\\begin|&|\\\\|\\nobreak|\\allowbreak/.test(tex)) return tex;
  const segs = []; let cur = ''; let depth = 0; let i = 0;
  while (i < tex.length) {
    const c = tex[i];
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(tex.slice(i));
      const name = m[1];
      if (name === 'left') depth++;
      else if (name === 'right') depth--;
      if (depth === 0 && REL_CMDS.has(name) && !/^[a-zA-Z]/.test(tex[i + m[0].length] || '')) {
        segs.push(cur, m[0]); cur = ''; i += m[0].length; continue;
      }
      cur += m[0]; i += m[0].length; continue;
    }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0 && (c === '=' || c === '<' || c === '>')) { segs.push(cur, c); cur = ''; i++; continue; }
    cur += c; i++;
  }
  segs.push(cur);
  if (depth !== 0) return tex;
  // membres (indices pairs) : groupés seulement s'ils contiennent une opération de premier niveau
  return segs.map((s, k) => (k % 2 === 0 && /[+\-]|\\(times|div|cdot|pm)\b/.test(s) && s.trim() ? `{${s.trim()}}` : s)).join(' ');
}

function renderTex(tex, displayMode) {
  if (!displayMode) {
    const g = groupForBreaks(tex);
    if (g !== tex) {
      try {
        const html = katex.renderToString(g, { displayMode, throwOnError: true, strict: 'ignore', trust: false, output: 'htmlAndMathml' });
        // l'annotation (copier-coller, lecteurs d'écran) garde le TeX d'origine, sans les accolades de regroupement
        const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return html.replace(/(<annotation encoding="application\/x-tex">)[\s\S]*?(<\/annotation>)/, (m, a, b) => a + esc(tex) + b);
      } catch {}
    }
  }
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'ignore', trust: false, output: 'htmlAndMathml' });
  } catch (e) {
    report.katexErrors.push({ chapter: currentSlug, tex, message: String(e.message || e).slice(0, 200) });
    return katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore' });
  }
}

/** Protège les formules, convertit le Markdown, restaure le HTML KaTeX (même logique que build-compendium.js). */
function mdToHtml(md) {
  const slots = [];
  const put = (html) => `@@M${slots.push(html) - 1}@@`;
  let text = md.replace(/\\\$/g, '@@DOLLAR@@');
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => put(renderTex(tex.trim(), true)));
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => put(renderTex(tex.trim(), false)));
  text = text.replace(/(?<![\\$])\$(?!\$)([^$\n]+?)(?<!\\)\$/g, (_, tex) => put(renderTex(tex.trim(), false)));
  text = text.replace(/@@DOLLAR@@/g, '&#36;');
  let html = marked.parse(text, { gfm: true, breaks: false });
  html = html.replace(/@@M(\d+)@@/g, (_, n) => slots[Number(n)]);
  // <p> qui ne contient qu'une formule en bloc → on retire le <p>
  html = html.replace(/<p>\s*((?:<span class="katex-display">[\s\S]*?<\/span><\/span><\/span>\s*)+)<\/p>/g, (m, inner) =>
    /<\/?p>/.test(inner) ? m : inner);
  return html;
}

// Texte brut d'un nœud (formules → TeX simplifié) pour la recherche et les titres.
function texToPlain(tex) {
  return tex
    .replace(/\\(?:mathrm|text|textbf|mathbf|operatorname)\{([^}]*)\}/g, '$1')
    .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\{,\}/g, ',').replace(/\\[,;:! ]/g, ' ').replace(/~/g, ' ')
    .replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\cdot/g, '·')
    .replace(/\\(?:leqslant|leq|le)\b/g, '≤').replace(/\\(?:geqslant|geq|ge)\b/g, '≥').replace(/\\neq\b/g, '≠')
    .replace(/\\approx\b/g, '≈').replace(/\\sqrt/g, '√').replace(/\\pi\b/g, 'π').replace(/\\degree|\^\\circ/g, '°')
    .replace(/\\left|\\right/g, '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}
function plainText(node) {
  let out = '';
  const walk = (n) => {
    if (n.nodeType === 3) { out += n.textContent; return; }
    if (n.nodeType !== 1) return;
    const cls = n.getAttribute('class') || '';
    if (/\bkatex\b/.test(cls) && !/katex-display/.test(cls)) {
      const ann = n.querySelector('annotation');
      out += ' ' + texToPlain(ann ? ann.textContent : n.textContent) + ' ';
      return;
    }
    if (/\b(cor-toggle|cor-inline|callout-icon|sr-only)\b/.test(cls)) return;
    for (const c of n.childNodes) walk(c);
    if (/^(P|LI|TD|TH|H2|H3|DIV|BLOCKQUOTE|TR|FIGCAPTION)$/.test(n.tagName)) out += ' ';
  };
  walk(node);
  return out.replace(/\s+/g, ' ').replace(/ ([,.)])/g, '$1').replace(/\( /g, '(').trim();
}

// ---------------------------------------------------------------- icônes des encadrés
const ICONS = {
  prereq: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  def: '<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
  prop: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
  method: '<circle cx="5" cy="6" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="5" cy="18" r="1.5"/><path d="M10 6h11M10 12h11M10 18h11"/>',
  pitfall: '<path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01"/>',
  retenir: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  tip: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  redaction: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  note: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
};
const icon = (k) => `<svg class="callout-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ICONS.note}</svg>`;

function calloutKind(label) {
  if (/^Prérequis/i.test(label)) return 'prereq';
  if (/^Définition/i.test(label)) return 'def';
  if (/^(Propriété|Théorème|Réciproque|Formules?|Règles?|Triangle rectangle)/i.test(label)) return 'prop';
  if (/^(Méthode|Test pratique)/i.test(label)) return 'method';
  if (/^Erreur/i.test(label)) return 'pitfall';
  if (/^À retenir/i.test(label)) return 'retenir';
  if (/^(Astuce|Pourquoi)/i.test(label)) return 'tip';
  return 'note';
}

// ---------------------------------------------------------------- chapitres
const groupOf = {};
META.groups.forEach((g) => g.chapters.forEach((s) => (groupOf[s] = g.id)));
const slugs = fs.readdirSync(SRC).filter((d) => /^\d\d-/.test(d) && fs.existsSync(path.join(SRC, d, 'cours-et-exercices.md'))).sort();
const numToSlug = Object.fromEntries(slugs.map((s) => [parseInt(s, 10), s]));
for (const s of slugs) if (!groupOf[s]) report.warnings.push(`Chapitre ${s} absent de content-meta.json (groupes)`);

rmDir(OUT);
fs.mkdirSync(path.join(OUT, 'chapters'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'figures'), { recursive: true });

const chapters = [];   // métadonnées
const docs = {};       // slug → { document, article }
const search = [];

// ---- passe 1 : Markdown → DOM, ids, structure
for (const slug of slugs) {
  currentSlug = slug;
  const num = parseInt(slug, 10);
  const md = fs.readFileSync(path.join(SRC, slug, 'cours-et-exercices.md'), 'utf8');
  const html = mdToHtml(md);
  const { document } = parseHTML(`<!doctype html><html lang="fr"><body><article>${html}</article></body></html>`);
  const art = document.querySelector('article');
  const cm = META.chapters[slug] || {};

  // Titre (h1) et nettoyage des éléments « méta » destinés aux auteurs
  const h1 = art.querySelector('h1');
  const title = h1 ? plainText(h1) : slug;
  h1?.remove();
  for (const bq of [...art.querySelectorAll(':scope > blockquote')].slice(0, 2)) {
    if (/^Compendium collège/.test(plainText(bq))) bq.remove();
  }
  for (const hr of art.querySelectorAll(':scope > hr')) hr.remove();
  const lastP = [...art.querySelectorAll(':scope > p')].pop();
  if (lastP && /^Version v\d/.test(plainText(lastP))) lastP.remove();

  // Ids des titres
  const used = new Set();
  const uniq = (id) => { let i = id, k = 2; while (used.has(i)) i = `${id}-${k++}`; used.add(i); return i; };
  let h2id = 's';
  const toc = [];
  let part = 'cours';
  const partStart = {};
  for (const h of art.querySelectorAll('h2, h3')) {
    const txt = plainText(h);
    let id, num_ = '', label = txt;
    if (h.tagName === 'H2') {
      const m = txt.match(/^(\d+)\.\s+(.*)$/);
      if (m) { num_ = m[1]; label = m[2]; id = `s${m[1]}`; } else id = slugify(txt);
      if (/^Exercices/i.test(label)) part = 'exos';
      else if (/^Corrigés/i.test(label)) part = 'corriges';
      else if (/^Liens avec/i.test(label)) part = 'liens';
      else if (/^Fiche/i.test(label)) part = 'fiche';
      else if (part !== 'cours') { report.warnings.push(`${slug}: section « ${txt} » après les exercices`); }
      id = uniq(id); h2id = id;
      partStart[part] ??= id;
    } else {
      let m;
      if ((m = txt.match(/^(\d+)\.(\d+)\.?\s+(.*)$/))) { num_ = `${m[1]}.${m[2]}`; label = m[3]; id = `s${m[1]}-${m[2]}`; }
      else if ((m = txt.match(/^([A-Z])\.\s+(.*)$/))) { num_ = m[1]; label = m[2]; id = `serie-${m[1]}`; }
      else if (part === 'corriges') id = `cor-${slugify(txt)}`;
      else id = `${h2id}-${slugify(txt)}`;
      id = uniq(id);
    }
    h.setAttribute('id', id);
    h.setAttribute('tabindex', '-1');
    // numéro mis en forme à part : <span class="h-num">3.7</span>
    if (num_ && h.firstChild && h.firstChild.nodeType === 3) {
      const t0 = h.firstChild.textContent;
      const mm = t0.match(/^(\s*)(\d+(?:\.\d+)?\.?|[A-Z]\.)\s+/);
      if (mm) {
        h.firstChild.textContent = t0.slice(mm[0].length);
        h.insertAdjacentHTML('afterbegin', `<span class="h-num">${mm[2].replace(/\.$/, '')}</span> `);
      }
    }
    const entry = { id, lvl: h.tagName === 'H2' ? 2 : 3, num: num_, title: label, part };
    // Titre riche (formules) si le titre contient du KaTeX
    if (h.querySelector('.katex')) {
      const clone = h.cloneNode(true);
      // retire le numéro du début (texte) pour l'affichage riche
      const first = clone.firstChild;
      if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s*(\d+(\.\d+)?|[A-Z])\.?\s+/, '');
      entry.html = clone.innerHTML;
    }
    toc.push(entry);
  }
  docs[slug] = { document, art, toc, title, num, partStart };
  chapters.push({ slug, num, title, short: cm.short || title, desc: cm.desc || '', group: groupOf[slug] || null });
}

const tocIds = Object.fromEntries(Object.entries(docs).map(([s, d]) => [s, new Set(d.toc.map((t) => t.id))]));

// ---- passe 2 : figures, encadrés, exercices, corrigés, tableaux, renvois
for (const slug of slugs) {
  currentSlug = slug;
  const { document, art, toc, partStart } = docs[slug];
  const chNum = parseInt(slug, 10);
  const figDir = path.join(OUT, 'figures', slug);
  let figCount = 0;
  const href = (s, id) => `#/ch/${s}${id ? '/' + id : ''}`;

  // Figures
  for (const img of [...art.querySelectorAll('img')]) {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    const srcPath = path.join(SRC, slug, src);
    if (!/^figures\/[^/]+\.svg$/.test(src) || !fs.existsSync(srcPath)) {
      report.missingFigures.push({ chapter: slug, src });
      continue;
    }
    fs.mkdirSync(figDir, { recursive: true });
    let svg = fs.readFileSync(srcPath, 'utf8')
      .replace(/<\?xml[^?]*\?>\s*/i, '').replace(/<!DOCTYPE[^>]*>\s*/i, '').replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><').trim();
    const name = path.basename(src);
    fs.writeFileSync(path.join(figDir, name), svg);
    let w = +(svg.match(/<svg[^>]*\swidth="([\d.]+)"/) || [])[1];
    let h = +(svg.match(/<svg[^>]*\sheight="([\d.]+)"/) || [])[1];
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1];
    if ((!w || !h) && vb) { const p = vb.split(/[\s,]+/).map(Number); w = p[2]; h = p[3]; }
    const url = `content/figures/${slug}/${name}`;
    const fig = document.createElement('figure');
    fig.setAttribute('class', 'fig');
    fig.innerHTML = `<button type="button" class="fig-zoom" data-src="${esc(url)}" data-w="${Math.round(w)}" data-h="${Math.round(h)}" aria-label="Agrandir la figure">` +
      `<img src="${esc(url)}" alt="${esc(alt)}" width="${Math.round(w)}" height="${Math.round(h)}" loading="lazy" decoding="async"></button>` +
      (alt ? `<figcaption>${esc(alt)}</figcaption>` : '');
    const p = img.parentNode;
    if (p.tagName === 'P' && p.childNodes.length === 1) p.replaceWith(fig);
    else if (p.tagName === 'P' && plainText(p) === '') p.replaceWith(fig);
    else { report.warnings.push(`${slug}: image dans un paragraphe de texte (${src})`); img.replaceWith(fig); }
    figCount++;
  }

  // Exercices et corrigés : regroupe « **A1.** … » jusqu'au prochain énoncé / titre
  let part = 'cours';
  const kids = [...art.children];
  let cur = null;
  const exIds = new Set(), corIds = new Set();
  const corBodies = [];
  for (const el of kids) {
    if (el.tagName === 'H2') {
      const t = toc.find((x) => x.id === el.id); part = t ? t.part : part; cur = null; continue;
    }
    if (el.tagName === 'H3') { cur = null; continue; }
    if (part !== 'exos' && part !== 'corriges') continue;
    const strong = el.tagName === 'P' && el.firstElementChild && el.firstChild === el.firstElementChild && el.firstElementChild.tagName === 'STRONG' ? el.firstElementChild : null;
    const m = strong && strong.textContent.trim().match(/^([A-Z]\d+)\.\s*(\(modèle\))?$/);
    if (m) {
      const code = m[1];
      if (part === 'exos') {
        cur = document.createElement('div');
        cur.setAttribute('class', 'exo');
        cur.setAttribute('id', `ex-${code}`);
        cur.setAttribute('data-ex', code);
        strong.setAttribute('class', 'exo-badge');
        strong.textContent = code;
        if (m[2]) strong.insertAdjacentHTML('afterend', ' <span class="modele-tag">(modèle)</span>');
        el.replaceWith(cur); cur.appendChild(el);
        exIds.add(code);
      } else {
        cur = document.createElement('details');
        cur.setAttribute('class', 'corrige');
        cur.setAttribute('id', `cor-${code}`);
        cur.setAttribute('data-ex', code);
        const modele = !!m[2];
        cur.innerHTML = `<summary><span class="exo-badge">${code}</span><span class="sum-text">Corrigé${modele ? ' <span class="modele">rédaction modèle</span>' : ''}</span></summary><div class="cor-body"></div>`;
        el.replaceWith(cur);
        strong.remove();
        // nettoie le début du paragraphe (espace, <br>)
        while (el.firstChild && ((el.firstChild.nodeType === 3 && !el.firstChild.textContent.trim()) || el.firstChild.tagName === 'BR')) el.firstChild.remove();
        if (el.firstChild && el.firstChild.nodeType === 3) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, '');
        if (el.childNodes.length) cur.querySelector('.cor-body').appendChild(el);
        corIds.add(code);
        corBodies.push(cur);
      }
      continue;
    }
    if (cur && !/^(HR)$/.test(el.tagName)) {
      (cur.tagName === 'DETAILS' ? cur.querySelector('.cor-body') : cur).appendChild(el);
    }
  }
  for (const c of exIds) if (!corIds.has(c)) report.warnings.push(`${slug}: exercice ${c} sans corrigé`);
  for (const c of corIds) if (!exIds.has(c)) report.warnings.push(`${slug}: corrigé ${c} sans énoncé`);
  for (const ex of art.querySelectorAll('div.exo')) {
    const code = ex.getAttribute('data-ex');
    if (!corIds.has(code)) continue;
    ex.insertAdjacentHTML('beforeend',
      `<div class="exo-actions"><button type="button" class="cor-toggle" data-cor="${code}" aria-expanded="false" aria-controls="ci-${code}">Voir le corrigé</button></div>` +
      `<div class="cor-inline" id="ci-${code}" hidden></div>`);
  }
  for (const d of corBodies) {
    const code = d.getAttribute('data-ex');
    d.querySelector('.cor-body').insertAdjacentHTML('beforeend', `<p class="cor-back"><a href="${href(slug, 'ex-' + code)}">↑ Revoir l’énoncé ${code}</a></p>`);
  }

  // Encadrés
  part = 'cours';
  for (const bq of art.querySelectorAll('blockquote')) {
    const first = bq.firstElementChild;
    const strong = first && first.tagName === 'P' && first.firstElementChild?.tagName === 'STRONG' && first.firstChild === first.firstElementChild ? first.firstElementChild : null;
    const txt = plainText(bq);
    let kind;
    if (strong) kind = calloutKind(strong.textContent.trim());
    else if (/^(Objectif|Les corrigés)/.test(txt)) kind = 'intro';
    else kind = 'redaction';
    if (kind === 'redaction' && /^(Le plus grand|On sait|Or|Donc)/.test(txt) === false && bq.closest('.cor-body')) kind = 'redaction';
    bq.setAttribute('class', `callout callout--${kind}`);
    if (kind !== 'intro') bq.insertAdjacentHTML('afterbegin', icon(kind));
    if (strong) strong.setAttribute('class', 'callout-label');
    if (kind === 'redaction' && !strong) bq.setAttribute('aria-label', 'Rédaction');
  }

  // Tableaux : conteneur défilant ; fiche-synthèse empilable sur mobile
  for (const table of [...art.querySelectorAll('table')]) {
    const wrap = document.createElement('div');
    wrap.setAttribute('class', 'table-wrap');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Tableau');
    table.replaceWith(wrap); wrap.appendChild(table);
    // la fiche-synthèse est dans la dernière section « Fiche »
    let p = wrap.previousElementSibling, inFiche = false;
    while (p) { if (p.tagName === 'H2') { inFiche = /Fiche/i.test(p.textContent); break; } p = p.previousElementSibling; }
    const ths = [...table.querySelectorAll('thead th')].map((th) => plainText(th));
    table.querySelectorAll('thead th').forEach((th) => th.setAttribute('scope', 'col'));
    // Coin vide (« | | On sait… | ») : la 1re colonne sert d'en-têtes de ligne
    if (!inFiche && ths.length && ths[0] === '') {
      for (const tr of table.querySelectorAll('tbody tr')) {
        const td = tr.firstElementChild;
        if (!td || td.tagName !== 'TD') continue;
        const th = document.createElement('th');
        th.setAttribute('scope', 'row');
        for (const a of td.attributes) if (a.name !== 'scope') th.setAttribute(a.name, a.value);
        while (td.firstChild) th.appendChild(td.firstChild);
        td.replaceWith(th);
      }
    }
    if (inFiche && ths.length >= 3) {
      table.setAttribute('class', 'stack');
      for (const tr of table.querySelectorAll('tbody tr')) [...tr.children].forEach((td, i) => ths[i] && td.setAttribute('data-label', ths[i]));
    }
  }

  // Renvois : chapitre N, § X, série A, exercice B3
  const override = (META.linkOverrides || []).filter((o) => o.slug === slug);
  const linkTo = (targetSlug, id, text, kind) => {
    const known = tocIds[targetSlug];
    let rid = id;
    if (id && /^s\d/.test(id) && !known.has(id)) {
      const parent = id.replace(/-\d+$/, '');
      report.unresolvedLinks.push({ chapter: slug, text, target: `${targetSlug}#${id}`, fallback: known.has(parent) ? parent : null });
      rid = known.has(parent) ? parent : null;
    }
    report.links.push({ chapter: slug, href: href(targetSlug, rid), kind });
    const a = document.createElement('a');
    a.setAttribute('href', href(targetSlug, rid));
    a.setAttribute('class', targetSlug === slug ? 'xref' : 'xref xref--ch');
    a.textContent = text;
    return a;
  };

  const SEP = /^(\s*,\s*|\s+et\s+|\s+à\s+)(\d+(?:\.\d+)*)(?![\d,]*\s*(?:cm|m|km|€|%))/;
  function processText(node, ctx) {
    const s = node.textContent;
    const RE = /([Cc]hapitres?)\s+(\d{1,2})\b|§\s*(?=\d)|\b(séries?)\s+(?=[A-J]\b)|\b(exercices?)\s+(?=[A-J]\d)/g;
    let m, last = 0;
    const out = [];
    const pushText = (t) => t && out.push(document.createTextNode(t));
    while ((m = RE.exec(s))) {
      let i = m.index;
      if (i < last) continue;
      pushText(s.slice(last, i));
      if (m[1]) {
        // chapitre(s) N [et M] [, § liste | , exercice X9]
        let n = +m[2];
        let pos = i + m[0].length;
        let target = numToSlug[n];
        if (!target) { pushText(m[0]); last = pos; continue; }
        out.push(linkTo(target, null, m[0], 'chapitre'));
        ctx.chapter = n;
        let rest = s.slice(pos), mm;
        // chapitres N et M
        while ((mm = rest.match(/^(\s*,\s*|\s+et\s+)(\d{1,2})\b(?!\s*[%€])/)) && m[1].endsWith('s') && numToSlug[+mm[2]]) {
          pushText(mm[1]); out.push(linkTo(numToSlug[+mm[2]], null, mm[2], 'chapitre'));
          pos += mm[0].length; rest = s.slice(pos);
        }
        if ((mm = rest.match(/^(,\s*)(§\s*)(\d+(?:\.\d+)*)/))) {
          pushText(mm[1]);
          out.push(linkTo(target, 's' + mm[3].replace('.', '-'), mm[2] + mm[3], 'para'));
          pos += mm[0].length; rest = s.slice(pos);
          while ((mm = rest.match(SEP))) {
            pushText(mm[1]); out.push(linkTo(target, 's' + mm[2].replace('.', '-'), mm[2], 'para'));
            pos += mm[0].length; rest = s.slice(pos);
          }
        } else if ((mm = rest.match(/^(,\s*)(exercice\s+)([A-Z]\d+)/))) {
          pushText(mm[1]);
          out.push(linkTo(target, 'ex-' + mm[3], mm[2] + mm[3], 'exercice'));
          pos += mm[0].length;
        }
        last = pos; RE.lastIndex = pos;
      } else if (m[0].startsWith('§')) {
        // § liste (chapitre courant, sauf contexte « Liens »)
        let pos = i + m[0].length, rest = s.slice(pos), mm = rest.match(/^\d+(?:\.\d+)*/);
        const target = ctx.forceChapter ? numToSlug[ctx.forceChapter] : slug;
        out.push(linkTo(target, 's' + mm[0].replace('.', '-'), m[0] + mm[0], 'para'));
        pos += mm[0].length; rest = s.slice(pos);
        while ((mm = rest.match(SEP))) {
          pushText(mm[1]); out.push(linkTo(target, 's' + mm[2].replace('.', '-'), mm[2], 'para'));
          pos += mm[0].length; rest = s.slice(pos);
        }
        last = pos; RE.lastIndex = pos;
      } else if (m[3]) {
        // série(s) A [et B]
        let pos = i + m[0].length, rest = s.slice(pos), mm = rest.match(/^[A-J]\b/);
        const mk = (L, t) => tocIds[slug].has('serie-' + L) ? linkTo(slug, 'serie-' + L, t, 'serie') : document.createTextNode(t);
        out.push(mk(mm[0], m[0] + mm[0]));
        pos += mm[0].length; rest = s.slice(pos);
        while ((mm = rest.match(/^(\s*,\s*|\s+et\s+)([A-J])\b/))) { pushText(mm[1]); out.push(mk(mm[2], mm[2])); pos += mm[0].length; rest = s.slice(pos); }
        last = pos; RE.lastIndex = pos;
      } else if (m[4]) {
        let pos = i + m[0].length, mm = s.slice(pos).match(/^[A-J]\d+/);
        if (art.querySelector(`#ex-${mm[0]}`)) out.push(linkTo(slug, 'ex-' + mm[0], m[0] + mm[0], 'exercice'));
        else pushText(m[0] + mm[0]);
        pos += mm[0].length; last = pos; RE.lastIndex = pos;
      }
    }
    if (!out.length) return;
    pushText(s.slice(last));
    const frag = document.createDocumentFragment();
    out.forEach((n) => frag.appendChild(n));
    node.replaceWith(frag);
  }
  function walk(el, ctx) {
    for (const n of [...el.childNodes]) {
      if (n.nodeType === 3) { if (/chapitre|§|série|exercice/i.test(n.textContent)) processText(n, ctx); continue; }
      if (n.nodeType !== 1) continue;
      const cls = n.getAttribute('class') || '';
      if (/^(A|CODE|PRE|H1|H2|H3|SUMMARY|SVG|BUTTON)$/i.test(n.tagName) || /\bkatex\b/.test(cls)) continue;
      walk(n, ctx);
    }
  }
  // Contexte « Liens avec les autres chapitres » : « **Chapitre N** (…, § X) » → § du chapitre N
  let section = '';
  for (const el of [...art.children]) {
    if (el.tagName === 'H2') { section = el.textContent; continue; }
    if (/Liens avec/.test(section) && el.tagName === 'UL') {
      for (const li of el.children) {
        const st = li.firstElementChild;
        const mm = st && st.tagName === 'STRONG' && st.textContent.match(/^Chapitre\s+(\d+)/);
        const ov = override.find((o) => li.textContent.includes(o.liContains));
        if (ov) { walk(li, { forceChapter: ov.chapter }); continue; }
        if (mm) {
          // la parenthèse qui suit immédiatement le nom du chapitre parle de ce chapitre
          const after = st.nextSibling;
          if (after && after.nodeType === 3 && /^\s*\(/.test(after.textContent)) {
            const close = after.textContent.indexOf(')');
            if (close > 0) {
              const head = after.textContent.slice(0, close + 1), tail = after.textContent.slice(close + 1);
              const tmp = document.createElement('span');
              tmp.textContent = head;
              const rest = document.createTextNode(tail);
              after.replaceWith(tmp); tmp.after(rest);
              walk(tmp, { forceChapter: +mm[1] });
              tmp.replaceWith(...tmp.childNodes);
            }
          }
          walk(li, {});
          continue;
        }
        walk(li, {});
      }
      continue;
    }
    walk(el, {});
  }

  // Sections <section> par h2 (styles par partie + ancrage du sommaire)
  const all = [...art.childNodes];
  let sec = null;
  const frag = document.createDocumentFragment();
  for (const n of all) {
    if (n.nodeType === 1 && n.tagName === 'H2') {
      const t = toc.find((x) => x.id === n.id);
      sec = document.createElement('section');
      sec.setAttribute('class', `part part--${t?.part || 'cours'}${/^Mini-synthèse/.test(t?.title || '') ? ' part--synthese' : ''}${/^Ce qu/.test(t?.title || '') ? ' part--intro' : ''}`);
      sec.setAttribute('data-part', t?.part || 'cours');
      const pp = t?.part || 'cours';
      if (pp !== 'cours' && !art.querySelector(`section[data-part="${pp}"]`) && !frag.querySelector?.(`section[data-part="${pp}"]`)) {
        sec.classList.add('part-first');
      }
      sec.setAttribute('aria-labelledby', n.id);
      frag.appendChild(sec);
    }
    if (sec) sec.appendChild(n); else frag.appendChild(n);
  }
  art.replaceChildren(frag);

  // Prérequis (numéros de chapitres)
  const pre = art.querySelector('.callout--prereq');
  const prereqs = pre ? [...new Set([...pre.querySelectorAll('a.xref--ch')].map((a) => parseInt(a.getAttribute('href').split('/')[2], 10)))].filter((n) => n !== chNum) : [];

  // Statistiques & temps de lecture (partie cours)
  const coursText = [...art.querySelectorAll('section[data-part="cours"]')].map(plainText).join(' ');
  const words = coursText.split(/\s+/).length;
  const meta = chapters.find((c) => c.slug === slug);
  Object.assign(meta, {
    readMin: Math.max(5, Math.round(words / 130 / 5) * 5),
    words,
    exercises: exIds.size,
    figures: figCount,
    prereqs,
    parts: { cours: partStart.cours, exos: partStart.exos, corriges: partStart.corriges, fiche: partStart.fiche },
    toc,
    practice: META.chapters[slug]?.practice || null,
  });

  // Index de recherche : une entrée par h3 (ou h2 sans h3)
  for (const s of art.querySelectorAll('section.part')) {
    const h2 = s.querySelector('h2');
    const t2 = toc.find((x) => x.id === h2.id);
    const blocks = []; let curB = { id: h2.id, title: t2.title, num: t2.num, nodes: [] };
    for (const n of s.children) {
      if (n.tagName === 'H2') continue;
      if (n.tagName === 'H3') {
        blocks.push(curB);
        const t3 = toc.find((x) => x.id === n.id);
        curB = { id: n.id, title: t3.title, num: t3.num, nodes: [], parent: t2.title };
        continue;
      }
      curB.nodes.push(n);
    }
    blocks.push(curB);
    for (const b of blocks) {
      const text = b.nodes.map((n) => {
        // sans en-têtes de tableaux ni boutons d'interface (bruit dans les extraits)
        const c = n.cloneNode(true);
        c.querySelectorAll?.('thead, button, .cor-inline, .cor-back, .fig-zoom').forEach((e) => e.remove());
        return plainText(c);
      }).join(' ').replace(/\s+/g, ' ').trim();
      if (!text && !b.title) continue;
      search.push({ c: slug, id: b.id, n: b.num, t: b.title, p: b.parent || '', k: t2.part, x: text });
    }
  }

  fs.writeFileSync(path.join(OUT, 'chapters', `${slug}.html`), art.innerHTML);
  report.chapters[slug] = { figures: figCount, exercises: exIds.size, corrections: corIds.size, words, toc: toc.length };
}

// ---------------------------------------------------------------- sorties
function contentVersion() {
  // version la plus récente citée dans README.md / PLAN-REVISION.md (ex. v0.3.1)
  const txt = ['README.md', 'PLAN-REVISION.md'].map((f) => (fs.existsSync(path.join(SRC, f)) ? fs.readFileSync(path.join(SRC, f), 'utf8') : '')).join('\n');
  const vs = [...new Set(txt.match(/\bv\d+\.\d+(?:\.\d+)?\b/g) || [])];
  const key = (v) => v.slice(1).split('.').map(Number).concat([0, 0]).slice(0, 3);
  vs.sort((a, b) => { const x = key(a), y = key(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
  return vs.pop() || '';
}
const index = {
  version: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version,
  contentVersion: contentVersion(),
  builtAt: new Date().toISOString(),
  appName: META.appName,
  groups: META.groups.map(({ id, title, hue, chapters: c }) => ({ id, title, hue, chapters: c })),
  chapters,
};
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
fs.writeFileSync(path.join(OUT, 'search.json'), JSON.stringify(search));
fs.writeFileSync(path.join(ROOT, 'build-report.json'), JSON.stringify({ ...report, links: report.links.length, linkKinds: report.links.reduce((a, l) => ((a[l.kind] = (a[l.kind] || 0) + 1), a), {}) }, null, 2));

const sz = (f) => (fs.statSync(f).size / 1024).toFixed(0) + ' Ko';
console.log(`Contenu : ${chapters.length} chapitres → ${path.relative(ROOT, OUT)}`);
console.log(`  index.json ${sz(path.join(OUT, 'index.json'))}, search.json ${sz(path.join(OUT, 'search.json'))} (${search.length} entrées)`);
console.log(`  figures : ${chapters.reduce((a, c) => a + c.figures, 0)}, exercices : ${chapters.reduce((a, c) => a + c.exercises, 0)}, renvois : ${report.links.length}`);
console.log(`  KaTeX erreurs : ${report.katexErrors.length}, figures manquantes : ${report.missingFigures.length}, renvois non résolus : ${report.unresolvedLinks.length}, avertissements : ${report.warnings.length}`);
for (const w of report.warnings) console.log('  ⚠', w);
for (const u of report.unresolvedLinks) console.log('  ⚠ renvoi', u.chapter, u.text, '→', u.target, u.fallback ? `(repli ${u.fallback})` : '(sans repli)');
if (report.katexErrors.length || report.missingFigures.length) { console.error('ÉCHEC : erreurs KaTeX ou figures manquantes'); process.exit(1); }
