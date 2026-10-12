/** Outils communs aux générateurs du chapitre 7 (équations et inéquations). */
import { type Q, q, isInt, isDecimal, decimals, eq, toNum } from '../engine/q';
import type { CourseLink, NumField, Step, Mistake, Rich } from '../engine/types';
import type { Rng } from '../engine/rng';
import { nat } from '../engine/linear';

export const CH = '07-equations-inequations';
export const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s1: sec('s1', '§ 1 · Équation, solution'),
  s21: sec('s2-1', '§ 2.1 · Les deux règles (balance)'),
  s22: sec('s2-2', '§ 2.2 · Remonter les opérations'),
  s23: sec('s2-3', '§ 2.3 · L’inconnue des deux côtés'),
  s24: sec('s2-4', '§ 2.4 · Parenthèses et fractions'),
  s3: sec('s3', '§ 3 · Mettre un problème en équation'),
  s41: sec('s4-1', '§ 4.1 · Produit nul'),
  s42: sec('s4-2', '§ 4.2 · Équations x² = a'),
  s61: sec('s6-1', '§ 6.1 · Représenter les solutions'),
  s62: sec('s6-2', '§ 6.2 · Résoudre ax ⩾ b'),
  s8: sec('s8', '§ 8 · Systèmes et inéquations générales'),
  ch4: { href: '#/ch/04-puissances-notation-scientifique/s6', label: 'Chapitre 4, § 6 · Racine carrée' },
};

export const m = (s: string) => `$${s}$`;

/** Annonce de la forme de la solution + réglage de la case. */
export function formOf(x: Q): { form: Rich; field: Partial<NumField> } {
  if (isInt(x)) return { form: 'La solution est un nombre entier.', field: { form: 'any' } };
  if (isDecimal(x) && decimals(x) <= 2) return { form: 'Donne la valeur exacte (nombre décimal ou fraction).', field: { form: 'any' } };
  return { form: 'Donne la valeur exacte, sous forme de fraction irréductible.', field: { form: 'irreducible' } };
}

/** Étape « $x = $ … » avec erreurs typiques (on ne garde que celles qui donnent une valeur différente de la bonne et entre elles). */
export function solveStep(x: Q, hint: Rich, mistakes: [Q | null, Rich][], o: { v?: string; prompt?: Rich } = {}): Step {
  const f = formOf(x);
  return {
    prompt: o.prompt ?? '',
    answer: { kind: 'num', fields: [{ label: m(`${o.v ?? 'x'} =`), expect: x, ...f.field }] },
    hint,
    mistakes: uniqMistakes(x, mistakes),
  };
}
export function uniqMistakes(x: Q, list: [Q | null, Rich][]): Mistake[] {
  const out: Mistake[] = [];
  const seen: Q[] = [x];
  for (const [v, msg] of list) {
    if (!v || seen.some((s) => eq(s, v))) continue;
    seen.push(v);
    out.push({ on: 'num', value: v, msg });
  }
  return out;
}

/** Division sûre : null si le diviseur est nul (erreur typique impossible dans ce cas). */
export const safeDiv = (a: Q, b: Q): Q | null => (b.n === 0 ? null : q(a.n * b.d, a.d * b.n));

/** QCM : bonne réponse + distracteurs (avec explication), mélangés. */
export function choice(rng: Rng, good: Rich, bad: [Rich, Rich][]): Step['answer'] {
  const all: [Rich, Rich | null][] = [[good, null], ...bad];
  const order = rng.shuffle(all.map((_, i) => i));
  return {
    kind: 'choice',
    options: order.map((i) => all[i][0]),
    explain: order.map((i) => all[i][1]),
    correct: order.indexOf(0),
    attempts: all.length > 2 ? 2 : 1,
  };
}

export const NAMES = ['Ana', 'Bob', 'Léa', 'Hugo', 'Inès', 'Sami', 'Lina', 'Jade', 'Paul', 'Noah', 'Chloé', 'Yanis', 'Emma', 'Adam', 'Zoé', 'Malik', 'Nina', 'Tom', 'Sarah', 'Ilyes', 'Maëlle', 'Lucas', 'Amina', 'Théo'];
export const twoNames = (rng: Rng) => {
  const [a, b] = rng.shuffle(NAMES);
  return [a, b] as const;
};
/** Écriture d'un nombre dans le texte : $12$, $2{,}5$, $-\dfrac{7}{3}$. */
export const n = (x: Q | number) => m(nat(typeof x === 'number' ? q(x) : x));
/** Prix en euros : $8$ €, $2{,}40$ €. */
export const euro = (x: Q | number) => {
  const v = typeof x === 'number' ? x : toNum(x);
  const s = Number.isInteger(Math.round(v * 100) / 100) && Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2).replace('.', '{,}');
  return `${m(s)}\u00a0€`;
};
/** Entier choisi dans une liste pondérée « positifs surtout ». */
export const mostlyPositive = (rng: Rng, pos: [number, number], negv: [number, number], pNeg: number) =>
  rng.chance(pNeg) ? -rng.int(negv[0], negv[1]) : rng.int(pos[0], pos[1]);
export { nat, q, isInt };
