/**
 * Échantillon relu d'exercices générés pour un chapitre → captures/exos-<NN>-echantillon.md
 * (figures SVG à côté, dans captures/exos-<NN>-figures/). 20 exercices : chaque type × niveau, puis on complète.
 * Usage : npx tsx scripts/sample-chapter.mts <NN> [graine]
 */
import fs from 'node:fs';
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
import { generate, exoHash } from '../src/practice/engine/series';
import { hashSeed } from '../src/practice/engine/rng';
import { reveal } from '../src/practice/engine/check';
import { polyTex } from '../src/practice/engine/algebra';
import type { ChapterPractice, Level, Mistake } from '../src/practice/engine/types';

const NN = process.argv[2];
const CHS: Record<string, ChapterPractice> = { '03': ch03, '06': ch06, '11': ch11, '01': ch01, '05': ch05, '04': ch04, '02': ch02, '12': ch12, '13': ch13, '08': ch08, '14': ch14, '16': ch16, '17': ch17, '09': ch09, '10': ch10, '15': ch15 };
const ch = CHS[NN];
if (!ch) throw new Error('chapitre inconnu : ' + NN);
const base = process.argv[3] || 'echantillon-v0.4';
const notes = fs.existsSync(`scripts/review-notes/${NN}.md`) ? fs.readFileSync(`scripts/review-notes/${NN}.md`, 'utf8').trim() : '';
// TYPES=ranger,comparer : échantillon restreint à ces types (fichier exos-<NN>-<type>-echantillon.md)
const only = process.env.TYPES?.split(',').filter(Boolean).length ? process.env.TYPES.split(',').filter(Boolean) : undefined;
const gens = only ? ch.generators.filter((g) => only.includes(g.id)) : ch.generators;
const plan: [string, Level][] = [];
for (const g of gens) for (const l of g.levels) plan.push([g.id, l]);
for (let i = 0; plan.length < 20; i++) { const g = gens[i % gens.length]; plan.push([g.id, g.levels[i % g.levels.length]]); }
const outName = `captures/exos-${NN}${only ? '-' + only[0] : ''}-echantillon.md`;
const q2 = (v: { n: number; d: number }) => `${v.n}${v.d > 1 ? '/' + v.d : ''}`;
const mistTxt = (m: Mistake) => (m.on === 'num' ? `réponse ${q2(m.value)}` : m.on === 'expr' ? `réponse $${polyTex(m.value)}$` : m.on === 'numAll' ? `réponses ${m.values.map(q2).join(' ; ')}` : m.on === 'set' ? `réponse {${m.value.map(q2).join(' ; ')}}` : m.on === 'order' ? `ordre ${m.values.map(q2).join(' ; ')}` : `réponse ${(m as { rel?: string }).rel ?? ''}`);
const dir = `captures/exos-${NN}-figures`;
fs.mkdirSync(dir, { recursive: true });
const out: string[] = [`# Échantillon d’exercices générés — chapitre ${NN} (${ch.title}${only ? ' — types ' + only.join(', ') : ''}, v0.9)`, '', `${plan.slice(0, 20).length} exercices : chaque type à chaque niveau, puis des compléments. Graines dérivées de « ${base} » ; chaque exercice se rejoue à l’adresse indiquée.`, 'Format : énoncé, étapes (réponse attendue, indice, erreurs typiques reconnues), corrigé tel qu’affiché.', ''];
if (notes && !only) out.push(notes, '');
plan.slice(0, 20).forEach(([type, level], i) => {
  const seed = hashSeed(base, NN, i);
  const g = ch.generators.find((x) => x.id === type)!;
  const ex = generate(ch, type, level, seed);
  out.push(`## ${i + 1}. ${g.title} — ${'★'.repeat(level)}`, '');
  out.push(`Adresse : \`${exoHash(ch.slug, type, level, seed)}\` · cours : ${g.course.label}`, '');
  out.push(`**${ex.title}**`, '');
  if (ex.form) out.push(`_${ex.form}_`, '');
  if (ex.statement) out.push(...ex.statement.split('\n').map((l) => l + '  '), '');
  if (ex.figure) {
    const f = `${dir}/${String(i + 1).padStart(2, '0')}-${type}.svg`;
    fs.writeFileSync(f, ex.figure.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/class="gf-hl"/g, 'class="gf-hl" stroke="#d03a2f" stroke-width="3" fill="none"').replace(/class="gf-(line|right)"/g, 'class="gf-$1" stroke="#1b1f24" fill="none" stroke-width="2"').replace(/class="gf-fill"/g, 'fill="#e6f0fb" stroke="#1b1f24" stroke-width="2"').replace(/class="gf-dash"/g, 'stroke="#4a525c" stroke-dasharray="5 4" fill="none"').replace(/class="gf-grid"/g, 'stroke="#d5d9df"').replace(/class="gf-axis"/g, 'stroke="#1b1f24"'));
    out.push(`![figure](${f.replace('captures/', '')})`, '');
  }
  if (ex.display) out.push(`$$${ex.display}$$`, '');
  ex.steps.forEach((s, j) => {
    out.push(`${j + 1}. ${s.prompt || '(réponse)'} → attendu : ${reveal(s)}${s.answer.kind === 'choice' ? ` (options : ${s.answer.options.join(' / ')})` : ''}`);
    if (s.answer.kind === 'order') {
      out.push(`   - Cartes (ordre de départ, ${s.answer.dir === 'asc' ? 'croissant' : 'décroissant'} demandé) : ${s.answer.items.map((t) => `$${t}$`).join(' | ')}`);
      const w = Object.entries(s.answer.why ?? {});
      for (const [k, v] of w.slice(0, 3)) out.push(`   - Si la paire ${k.split('-').map((x) => `$${(s.answer as { items: string[] }).items[Number(x)]}$`).join(' / ')} est mal rangée : ${v}`);
      if (w.length > 3) out.push(`   - (… ${w.length - 3} autres paires expliquées)`);
    }
    if (s.hint) out.push(`   - Indice : ${s.hint}`);
    for (const m of s.mistakes ?? []) out.push(`   - Erreur typique (${mistTxt(m)}) : ${m.msg}`);
    if (s.answer.kind === 'choice' && s.answer.explain) s.answer.explain.forEach((e, k) => e && out.push(`   - Si « ${s.answer.kind === 'choice' ? s.answer.options[k] : ''} » : ${e}`));
  });
  out.push('', '**Corrigé**', '', ...ex.solution.map((l) => `> ${l}  `), '', `Réponse : ${ex.answer}`, '');
});
fs.writeFileSync(outName, out.join('\n'));
console.log(outName, out.length, 'lignes');
