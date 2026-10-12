/** Vérification d'une étape à partir de la saisie, et écriture de la bonne réponse (après échec). */
import { type Q, eq, toNum, isDecimal, q, neg } from './q';
import { type Rel, texRel, isStrict, texQ } from './expr';
import { checkField, checkSet, checkIneq, checkNumMistakes, type Verdict } from './answers';
import { nat } from './linear';
import type { Step, Val, ExprAnswer, Mistake, OrderAnswer } from './types';
import { parseExpr, toPoly, pEq, shapeOf, factorsOf, factorDone, pDeg, witness, type Poly } from './algebra';

export type Input =
  | { kind: 'num'; raws: string[] }
  | { kind: 'set'; raw: string; none: boolean }
  | { kind: 'choice'; index: number }
  | { kind: 'ineq'; rel: Rel | null; raw: string }
  | { kind: 'ray'; side: 'left' | 'right' | null; incl: boolean | null }
  | { kind: 'expr'; raw: string }
  /** indices des items, dans l'ordre où l'élève les a rangés */
  | { kind: 'order'; order: number[]; moved?: boolean };

export interface StepVerdict extends Verdict {
  /** cases fausses (num) */
  wrong?: number[];
}

export const maxAttempts = (s: Step) => (s.answer.kind === 'choice' ? (s.answer.attempts ?? (s.answer.options.length > 2 ? 2 : 1)) : 2);

export function checkStep(step: Step, input: Input): StepVerdict {
  const a = step.answer;
  switch (a.kind) {
    case 'num': {
      if (input.kind !== 'num') break;
      const vs = a.fields.map((f, i) => checkField(f, input.raws[i] ?? ''));
      const retry = vs.find((v) => v.status === 'retry');
      if (retry) {
        const i = vs.indexOf(retry);
        return { status: 'retry', msg: a.fields.length > 1 && !(input.raws[i] ?? '').trim() ? 'Remplis toutes les cases.' : retry.msg };
      }
      const wrong = vs.map((v, i) => (v.status === 'ok' ? -1 : i)).filter((i) => i >= 0);
      if (!wrong.length) {
        const notes = vs.map((v) => v.msg).filter(Boolean);
        return { status: 'ok', msg: notes.join(' ') || undefined };
      }
      const values = vs.map((v) => v.value);
      // deux valeurs inversées (x et y, Bob et Ana…)
      if (a.fields.length === 2 && values[0] && values[1] && eq(values[0], a.fields[1].expect) && eq(values[1], a.fields[0].expect))
        return { status: 'wrong', msg: 'Les deux valeurs sont justes, mais inversées : relis à quoi correspond chaque case.', mistake: true, wrong };
      const m = checkNumMistakes(a.fields, values, step.mistakes, step.signHint);
      if (m) return { status: 'wrong', msg: m, mistake: true, wrong };
      const near = vs.find((v) => v.status === 'wrong' && v.msg);
      if (near) return { status: 'wrong', msg: near.msg, wrong };
      if (a.fields.length > 1 && wrong.length < a.fields.length)
        return { status: 'wrong', msg: wrong.length === 1 ? 'Une des valeurs est fausse.' : 'Certaines valeurs sont fausses.', wrong };
      return { status: 'wrong', wrong };
    }
    case 'set':
      if (input.kind === 'set') return checkSet(a, input.raw, input.none, step.mistakes);
      break;
    case 'order':
      if (input.kind === 'order') return checkOrder(a, input.order, step.mistakes, input.moved);
      break;
    case 'choice':
      if (input.kind === 'choice') {
        if (input.index === a.correct) return { status: 'ok' };
        return { status: 'wrong', msg: a.explain?.[input.index] ?? undefined, mistake: !!a.explain?.[input.index] };
      }
      break;
    case 'ineq':
      if (input.kind === 'ineq') return checkIneq(a, input.rel, input.raw, step.mistakes);
      break;
    case 'expr':
      if (input.kind === 'expr') return checkExpr(a, input.raw, step.mistakes);
      break;
    case 'ray': {
      if (input.kind !== 'ray') break;
      if (input.side === null || input.incl === null) return { status: 'retry', msg: 'Choisis le côté des solutions et le type de crochet.' };
      const right = a.rel === '>' || a.rel === '>=';
      const incl = !isStrict(a.rel);
      const sideOk = (input.side === 'right') === right, inclOk = input.incl === incl;
      if (sideOk && inclOk) return { status: 'ok' };
      const b = nat(a.bound);
      if (!sideOk)
        return { status: 'wrong', msg: `Les solutions de $x ${texRel(a.rel)} ${b}$ sont les nombres ${right ? '**plus grands**' : '**plus petits**'} que $${b}$ : ils sont à ${right ? 'droite' : 'gauche'} de $${b}$.` };
      return {
        status: 'wrong',
        msg: incl
          ? `Avec $${texRel(a.rel)}$, la borne $${b}$ **est** solution : crochet tourné **vers les solutions**.`
          : `Avec $${texRel(a.rel)}$ (inégalité stricte), $${b}$ n’est **pas** solution : crochet tourné **vers l’extérieur**.`,
      };
    }
  }
  return { status: 'retry', msg: 'Réponse incomplète.' };
}

/** Expression algébrique : égalité exacte (polynômes), puis forme demandée. */
/** « 3×+12 » pour « 3x + 12 » : le signe × (fois) tapé à la place de la lettre. */
function timesForLetter(a: ExprAnswer, raw: string): boolean {
  if (!/[×*]/.test(raw)) return false;
  const r2 = parseExpr(raw.replace(/[×*]/g, a.v), a.v);
  const p2 = r2.ok ? toPoly(r2.ast) : null;
  return !!p2 && pEq(p2, a.expect);
}
const TERM_NAME = (d: number, v: string) => (d === 0 ? 'le nombre seul (terme constant)' : d === 1 ? `le terme en $${v}$` : `le terme en $${v}^${d}$`);
/** Réponse fausse : on désigne le ou les termes faux, plutôt qu'un calcul pour une valeur. */
function pointError(a: ExprAnswer, p: Poly): string {
  if (a.form === 'fact') return `Ce produit n’est pas égal à l’expression de départ : redéveloppe-le, tu dois la retrouver exactement.`;
  const n = Math.max(p.length, a.expect.length);
  const bad: number[] = [];
  for (let d = n - 1; d >= 0; d--) if (!eq(p[d] ?? q(0), a.expect[d] ?? q(0))) bad.push(d);
  const names = bad.map((d) => TERM_NAME(d, a.v));
  const list = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' et ' + names[names.length - 1];
  const signOnly = bad.length > 0 && bad.every((d) => eq(p[d] ?? q(0), neg(a.expect[d] ?? q(0))));
  return `${list[0].toUpperCase()}${list.slice(1)} ${bad.length > 1 ? 'ne sont pas justes' : 'n’est pas juste'}${signOnly ? ' : c’est une erreur de signe (relis le signe de chaque produit)' : ''}.`;
}

export function checkExpr(a: ExprAnswer, raw: string, mistakes: Mistake[] = []): Verdict {
  if (timesForLetter(a, raw))
    return { status: 'retry', msg: `Tu as tapé le signe « × » (fois) à la place de la lettre $${a.v}$. La lettre est la touche $${a.v}$ (en italique) ; « × » sert seulement à multiplier.` };
  const r = parseExpr(raw, a.v);
  if (!r.ok) return { status: 'retry', msg: /[×*]\s*$/.test(raw) ? `L’expression se termine par « × » (fois). Si tu voulais écrire la lettre $${a.v}$, utilise la touche $${a.v}$ (en italique).` : r.msg };
  const p = toPoly(r.ast);
  if (!p) return { status: 'retry', msg: `Écris une expression sans division par $${a.v}$.` };
  const sh = shapeOf(r.ast);
  if (pEq(p, a.expect)) {
    if (a.form === 'dev') {
      if (!sh.developed) return { status: 'retry', msg: 'C’est égal, mais ce n’est pas développé : il reste des parenthèses (ou un produit à effectuer). Développe.' };
      if (!sh.reduced) return { status: 'retry', msg: `C’est égal, mais pas réduit : regroupe les termes semblables (les $${a.v}^2$, les $${a.v}$, les nombres).` };
    }
    if (a.form === 'fact') {
      if (!sh.product) return { status: 'retry', msg: 'C’est égal, mais ce n’est pas un produit : factoriser, c’est écrire l’expression comme un produit de facteurs.' };
      const fs = factorsOf(r.ast);
      const want = [...(a.degs ?? [])].sort().join(',');
      const got = fs.map((f) => pDeg(f)).sort().join(',');
      if (!fs.every(factorDone) || (want && got !== want))
        return { status: 'retry', msg: 'C’est bien un produit égal, mais on peut encore factoriser : cherche un facteur commun restant dans une parenthèse.' };
    }
    return { status: 'ok' };
  }
  for (const m of mistakes) if (m.on === 'expr' && pEq(p, m.value)) return { status: 'wrong', msg: m.msg, mistake: true };
  const w = witness(p, a.expect);
  // le contre-exemple reste discret : il montre que c'est faux, ce n'est pas la méthode
  return { status: 'wrong', msg: pointError(a, p) + (w ? ` (Pour $${a.v} = ${w.x}$, ton expression vaut $${texQ(w.va)}$ au lieu de $${texQ(w.vb)}$.)` : '') };
}

const valTex = (v: Val, frac = false) => ('q' in v ? (frac ? texQ(v.q) : nat(v.q)) : `${v.s < 0 ? '-' : ''}\\sqrt{${nat(v.sqrt)}}`);
/** Bonne réponse de l'étape, en une ligne (affichée après deux erreurs). */
export function reveal(step: Step): string {
  const a = step.answer;
  switch (a.kind) {
    case 'num':
      return a.fields
        .map((f) => {
          const v = f.shown
            ? f.shown
            : f.approx
            ? `${(Math.round(f.approx.value * 10 ** f.approx.dp) / 10 ** f.approx.dp).toFixed(f.approx.dp).replace('.', '{,}')}`
            : f.unit === '€' && f.expect.d !== 1 && isDecimal(f.expect)
              ? toNum(f.expect).toFixed(2).replace('.', '{,}')
              : nat(f.expect);
          return `${f.label} $${v}$${f.unit ? ` ${f.unit}` : ''}`;
        })
        .join(' ; ');
    case 'set':
      if (!a.expect.length) return 'Aucune solution.';
      if (a.approx) return a.expect.map((v) => `$${(Math.round(valNumber(v) * 10 ** a.approx!.dp) / 10 ** a.approx!.dp).toFixed(a.approx!.dp).replace('.', '{,}')}$`).join(' ; ');
      {
        // une seule écriture pour toute la liste : fractions dès qu'une valeur n'est pas décimale
        const frac = a.expect.some((v) => 'q' in v && !isDecimal(v.q));
        return a.expect.map((v) => `$${valTex(v, frac)}$`).join(' ; ');
      }
    case 'choice':
      return a.options[a.correct];
    case 'ineq':
      return `$${a.v} ${texRel(a.rel)} ${nat(a.bound)}$`;
    case 'ray':
      return `[[ray:${a.rel}:${a.bound.n}/${a.bound.d}]]`;
    case 'expr':
      return `${a.label ? a.label + ' ' : ''}$${a.tex}$`;
    case 'order':
      return `$${orderChain(a)}$`;
  }
}
const valNumber = (v: Val) => ('q' in v ? toNum(v.q) : v.s * Math.sqrt(toNum(v.sqrt)));
export type { Q };

// ------------------------------------------------------------------ rangement
const cmpQ = (x: Q, y: Q) => Math.sign(x.n * y.d - y.n * x.d);
/** Indices des items dans le bon ordre (stable : à égalité, l'ordre des items). */
export function orderSorted(a: OrderAnswer): number[] {
  const s = a.dir === 'asc' ? 1 : -1;
  return a.items.map((_, i) => i).sort((i, j) => s * cmpQ(a.values[i], a.values[j]) || i - j);
}
/** « a < b = c < d » (ou >) dans le bon ordre. */
export function orderChain(a: OrderAnswer): string {
  const o = orderSorted(a);
  return o.map((i, k) => (k === 0 ? a.items[i] : `${eq(a.values[o[k - 1]], a.values[i]) ? '=' : a.dir === 'asc' ? '<' : '>'} ${a.items[i]}`)).join(' ');
}
/** Juste si chaque carte est à sa place (les nombres égaux, dans n'importe quel ordre). */
export function checkOrder(a: OrderAnswer, order: number[], mistakes: Mistake[] = [], moved = true): StepVerdict {
  const n = a.items.length;
  if (order.length !== n || new Set(order).size !== n || order.some((i) => !(i >= 0 && i < n))) return { status: 'retry', msg: 'Rangement incomplet.' };
  if (!moved && order.every((v, i) => v === i)) return { status: 'retry', msg: 'Fais glisser les cartes (ou utilise les flèches) pour les ranger, puis valide.' };
  const target = orderSorted(a).map((i) => a.values[i]);
  const wrong = order.map((it, p) => (eq(a.values[it], target[p]) ? -1 : p)).filter((p) => p >= 0);
  if (!wrong.length) return { status: 'ok' };
  const got = order.map((i) => a.values[i]);
  for (const m of mistakes) if (m.on === 'order' && m.values.length === n && m.values.every((v, k) => eq(v, got[k]))) return { status: 'wrong', msg: m.msg, mistake: true, wrong };
  // première paire voisine dans le mauvais sens
  const s = a.dir === 'asc' ? 1 : -1;
  let msg: string | undefined;
  for (let p = 0; p + 1 < n; p++) {
    const i = order[p], j = order[p + 1];
    if (s * cmpQ(a.values[i], a.values[j]) > 0) {
      const w = a.why?.[`${Math.min(i, j)}-${Math.max(i, j)}`];
      msg = `$${a.items[i]}$ et $${a.items[j]}$ sont dans le mauvais ordre.${w ? ' ' + w : ''}`;
      break;
    }
  }
  return { status: 'wrong', msg: `${wrong.length === 1 ? 'Une carte est mal placée' : `${wrong.length} cartes sont mal placées`} (marquées ✗). ${msg ?? ''}`.trim(), wrong };
}
