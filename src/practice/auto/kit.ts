/**
 * Automatismes : questions flash (une étape, quelques secondes à une minute, sans calculatrice).
 * Mêmes contrat et vérifications que les générateurs des chapitres (tests/generators.test.ts).
 */
import type { CourseLink, ExerciseBody, NumField, Rich, Step } from '../engine/types';
import type { Q } from '../engine/q';
import { toNum } from '../engine/q';
import { texQ } from '../engine/expr';
import { mist, fixedChoice } from '../engine/build';

export type Item = { what: string; js: string; expect: number; tol?: number };
export const m = (s: string) => `$${s}$`;
/** Décimal (virgule) ou entier ; fraction sinon. */
export const dq = (v: Q) => texQ(v, 'dec');
/** Entier avec espaces fines (12 500). */
export const nb = (x: number) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
export const neg = (x: number) => (x < 0 ? `(${x})` : String(x));

export const sec = (slug: string, id: string, label: string): CourseLink => ({ href: `#/ch/${slug}/${id}`, label });

/** Question à une ou plusieurs cases numériques. */
export function numQ(o: {
  title: Rich; statement?: Rich; display?: string; prompt?: Rich;
  fields: (Partial<NumField> & { expect: Q; label?: Rich })[];
  hint: Rich; mist?: [Q | null | undefined, Rich][]; sol: Rich[]; answer: Rich; key: string; items: Item[];
}): ExerciseBody {
  const fields: NumField[] = o.fields.map((f) => ({ form: 'any', ...f, label: f.label ?? '' }));
  const step: Step = { prompt: o.prompt ?? '', answer: { kind: 'num', fields }, hint: o.hint, mistakes: o.fields.length === 1 ? mist(o.fields[0].expect, o.mist ?? []) : [] };
  return { title: o.title, statement: o.statement, display: o.display, steps: [step], solution: o.sol, answer: o.answer, key: o.key, data: { kind: 'js', items: o.items } };
}
/** Question à choix (QCM déjà construit). */
export function choiceQ(o: { title: Rich; statement?: Rich; display?: string; prompt?: Rich; answer: Step['answer']; hint: Rich; sol: Rich[]; answerText: Rich; key: string; items?: Item[] }): ExerciseBody {
  return { title: o.title, statement: o.statement, display: o.display, steps: [{ prompt: o.prompt ?? '', answer: o.answer, hint: o.hint }], solution: o.sol, answer: o.answerText, key: o.key, data: { kind: 'js', items: o.items ?? [] } };
}
/** Oui / Non (un essai) : `yes` = la bonne réponse est « Oui ». */
export const yesNo = (yes: boolean, whyNotYes: Rich, whyNotNo: Rich) => fixedChoice(['Oui', 'Non'], yes ? 0 : 1, [whyNotYes, whyNotNo]);
/** Comparaison : <, =, > (options fixes). */
export const cmpChoice = (c: number, explain: Rich) => fixedChoice(['$<$', '$=$', '$>$'], c + 1, [explain, explain, explain]);
export const val = (v: Q) => toNum(v);
