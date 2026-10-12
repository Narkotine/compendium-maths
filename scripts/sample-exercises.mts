/**
 * Échantillon relu d'exercices générés (chapitre 07) → captures/exos-07-echantillon.md
 * Usage : npx tsx scripts/sample-exercises.mts [graine]
 */
import fs from 'node:fs';
import ch07 from '../src/practice/ch07/index';
import { generate, exoHash } from '../src/practice/engine/series';
import { hashSeed } from '../src/practice/engine/rng';
import { reveal } from '../src/practice/engine/check';
import type { Level } from '../src/practice/engine/types';

const base = process.argv[2] || 'echantillon-v0.3';
const PLAN: [string, Level][] = [
  ['tester', 1], ['tester', 2], ['x-plus-a', 1], ['ax-egal-b', 1], ['ax-plus-b', 1], ['deux-membres', 1], ['deux-membres', 2],
  ['parentheses', 2], ['parentheses', 3], ['fractions', 2], ['fractions', 3], ['probleme', 2], ['probleme', 3],
  ['produit-nul', 2], ['produit-nul', 3], ['carre', 2], ['carre', 3], ['inequation', 2], ['inequation', 3], ['systeme', 3],
];
const ray = (s: string) => s.replace(/\[\[ray:([<>=]+):(-?\d+)\/(\d+)\]\]/g, (_, r, n, d) => `*(droite graduée : x ${r.replace('<=', '≤').replace('>=', '≥')} ${d === '1' ? n : `${n}/${d}`})*`);
const out: string[] = [
  '# Échantillon d’exercices générés — chapitre 07 (v0.3)',
  '',
  `20 exercices, un ou deux par type et par niveau, graines dérivées de « ${base} ». Chaque exercice se rejoue à l’adresse indiquée.`,
  'Format : énoncé, étapes demandées (avec la réponse attendue et l’indice), corrigé rédigé tel qu’affiché.',
  '',
  '**Relecture (9 oct. 2026).** Cet échantillon a été relu en entier, ainsi que 10 exercices de chacun de deux autres tirages (graines « revue2 », « revue3 »).',
  'Corrigé à la relecture : distracteur « $x((x + 14)) = 60$ » (parenthèses doublées) et « $x3x$ » (produit sans ×) dans les',
  'problèmes de rectangle ; « $3x + 0y$ » dans un distracteur de système ; « on soustrait $-3x$ » → « on ajoute $3x$ » ;',
  '« on développe » remplacé par « on supprime les parenthèses » quand il n’y a rien à développer ; second membre nul',
  '(« $0 \\times 0$ ») exclu des équations à fractions ; ligne « membre à membre » ajoutée aux systèmes à coefficients égaux',
  'ou opposés ; indice des systèmes (additionner ou soustraire) ; prix en euros affichés au centime ; liste de solutions',
  'en fractions homogènes ($-\\dfrac{8}{3}$ ; $\\dfrac{3}{4}$ au lieu de $0{,}75$) ; espaces doublés dans un contrôle.',
  'Les nouvelles écritures fautives sont désormais détectées par `tests/generators.test.ts`.',
  '',
];
PLAN.forEach(([type, level], i) => {
  const seed = hashSeed(base, i);
  const g = ch07.generators.find((x) => x.id === type)!;
  const ex = generate(ch07, type, level, seed);
  out.push(`## ${i + 1}. ${g.title} — ${'★'.repeat(level)}`, '');
  out.push(`Adresse : \`${exoHash(ch07.slug, type, level, seed)}\` · cours : ${g.course.label}`, '');
  out.push(`**${ex.title}**`, '');
  if (ex.statement) out.push(...ex.statement.split('\n').map((l) => l + '  '), '');
  if (ex.display) out.push(`$$${ex.display}$$`, '');
  if (ex.form) out.push(`*${ex.form}*`, '');
  ex.steps.forEach((s, j) => {
    out.push(`${j + 1}. ${s.prompt || '(réponse)'} → attendu : ${ray(reveal(s))}${s.answer.kind === 'choice' ? ` (options : ${s.answer.options.join(' / ')})` : ''}`);
    if (s.hint) out.push(`   - Indice : ${s.hint}`);
    for (const m of s.mistakes ?? []) out.push(`   - Erreur typique (${m.on === 'num' ? `réponse ${m.value.n}${m.value.d > 1 ? '/' + m.value.d : ''}` : m.on === 'set' ? `réponse {${m.value.map((v) => v.n + (v.d > 1 ? '/' + v.d : '')).join(' ; ')}}` : `réponse ${m.rel ?? ''} ${m.bound ? m.bound.n + (m.bound.d > 1 ? '/' + m.bound.d : '') : ''}`}) : ${m.msg}`);
  });
  out.push('', '**Corrigé**', '', ...ex.solution.map((l) => `> ${ray(l)}  `), '', `Réponse : ${ray(ex.answer)}`, '');
});
fs.mkdirSync('captures', { recursive: true });
fs.writeFileSync('captures/exos-07-echantillon.md', out.join('\n'));
console.log('captures/exos-07-echantillon.md', out.length, 'lignes');
