/**
 * Tests unitaires des validateurs de réponses (src/practice/engine/answers.ts, check.ts).
 * Usage : npx tsx tests/answers.test.ts
 */
import { normalize, parseNumber, checkField, checkSet, checkIneq, parseSet } from '../src/practice/engine/answers';
import { checkStep, reveal, maxAttempts, checkExpr } from '../src/practice/engine/check';
import { parseExpr, toPoly, type Poly } from '../src/practice/engine/algebra';
import { q, type Q } from '../src/practice/engine/q';
import type { NumField, Step, Answer } from '../src/practice/engine/types';

let pass = 0, fail = 0;
const ok = (cond: unknown, msg: string, extra: unknown = '') => {
  if (cond) pass++;
  else { fail++; console.log('  ✗', msg, extra === '' ? '' : JSON.stringify(extra)); }
};
const section = (s: string) => console.log(s);
const val = (raw: string, sqrt = false): Q | null => { const r = parseNumber(raw, { sqrt }); return r.ok ? r.v.q : null; };
const same = (a: Q | null, b: Q) => !!a && a.n === b.n && a.d === b.d;
const F = (expect: Q, extra: Partial<NumField> = {}): NumField => ({ label: '$x =$', expect, ...extra });

section('Lecture des nombres');
ok(normalize(' x = −3 ') === '-3', 'normalise « x = −3 »', normalize(' x = −3 '));
for (const [raw, n, d] of [
  ['3', 3, 1], ['-3', -3, 1], ['−3', -3, 1], ['– 3', -3, 1], ['—3', -3, 1], ['\u20113', -3, 1], ['+4', 4, 1],
  ['2,5', 5, 2], ['2.5', 5, 2], ['-0,25', -1, 4], [',5', 1, 2], ['0,5', 1, 2],
  ['7/3', 7, 3], ['-7/3', -7, 3], ['7/-3', -7, 3], ['−14/6', -7, 3], ['(−7)/3', -7, 3], ['7÷3', 7, 3], ['2,5/5', 1, 2],
  ['1 000', 1000, 1], ['12 345,5', 24691, 2], ['1\u202F000', 1000, 1], ['3.', 3, 1], ['x=4', 4, 1], ['X = 4', 4, 1],
] as [string, number, number][]) ok(same(val(raw), q(n, d)), `« ${raw} » = ${n}/${d}`, val(raw));
for (const raw of ['', 'abc', '2,5,1', '1/2/3', '3/0', '1 00', '2x', '--3', '3 + 1', '√']) ok(val(raw) === null, `« ${raw} » refusé`);
ok(parseNumber('3/0').ok === false && /dénominateur/.test((parseNumber('3/0') as { msg: string }).msg), 'division par 0 : message dédié');
ok(parseNumber('√7').ok === false, 'racine refusée hors contexte');
{
  const r = parseNumber('-√7', { sqrt: true });
  ok(r.ok && r.v.form === 'sqrt' && r.v.sqrt!.s === -1 && r.v.sqrt!.r.n === 7, '« -√7 » lu comme −√7');
  const r2 = parseNumber('√9', { sqrt: true });
  ok(r2.ok && same(r2.v.q, q(3)) && r2.v.form === 'int', '« √9 » lu comme 3');
  const r3 = parseNumber('sqrt(5)', { sqrt: true });
  ok(r3.ok && r3.v.form === 'sqrt', '« sqrt(5) » accepté');
}

section('Champ numérique');
ok(checkField(F(q(5, 2)), '2,5').status === 'ok', '5/2 : « 2,5 » accepté (forme libre)');
ok(checkField(F(q(5, 2)), '10/4').status === 'ok' && /simplifier/.test(checkField(F(q(5, 2)), '10/4').msg ?? ''), '5/2 : « 10/4 » accepté avec remarque');
ok(checkField(F(q(5, 2)), '2.5').status === 'ok', '5/2 : « 2.5 » (point) accepté');
ok(checkField(F(q(-3)), '−3').status === 'ok' && checkField(F(q(-3)), '–3').status === 'ok', '−3 : tirets typographiques acceptés');
ok(checkField(F(q(-3)), '-6/2').status === 'ok', '−3 : « −6/2 » accepté (forme libre)');
const irr = F(q(7, 3), { form: 'irreducible' });
ok(checkField(irr, '7/3').status === 'ok', 'irréductible : 7/3 ok');
ok(checkField(irr, '14/6').status === 'retry', 'irréductible : 14/6 → à simplifier (sans pénalité)');
ok(checkField(irr, '2,33').status === 'retry', 'irréductible : valeur approchée → valeur exacte demandée');
ok(checkField(F(q(4), { form: 'irreducible' }), '8/2').status === 'retry', 'irréductible : 8/2 → écrire 4');
ok(checkField(F(q(5, 2), { form: 'irreducible' }), '2,5').status === 'retry', 'irréductible sans décimal : 2,5 → fraction demandée');
ok(checkField(F(q(5, 2), { form: 'irreducible', decimalOk: true }), '2,5').status === 'ok', 'irréductible + décimal permis : 2,5 ok');
ok(checkField(F(q(7, 3)), '2,33').status === 'retry', 'forme libre : 2,33 pour 7/3 → valeur exacte demandée');
ok(checkField(F(q(7, 3)), '2').status === 'wrong', '7/3 : 2 faux');
ok(checkField(F(q(3)), 'trois').status === 'retry', 'saisie illisible → retry');
const ap = F(q(0), { approx: { value: Math.sqrt(7), tol: 0.005, dp: 2 } });
ok(checkField(ap, '2,65').status === 'ok', '√7 ≈ 2,65 ok');
ok(checkField(ap, '2,6458').status === 'ok' && /arrondi/.test(checkField(ap, '2,6458').msg ?? ''), '2,6458 accepté, arrondi rappelé');
ok(checkField(ap, '2,64').status === 'wrong' && /arrondi/.test(checkField(ap, '2,64').msg ?? ''), '2,64 (troncature) → « attention à l’arrondi »');
ok(checkField(ap, '3').status === 'wrong', '3 faux');

// écriture décimale exigée (chapitre 1 : fraction → décimal)
{
  const dz = F(q(7, 4), { form: 'decimal' });
  ok(checkField(dz, '1,75').status === 'ok', 'décimal exigé : 1,75 ok');
  ok(checkField(dz, '7/4').status === 'retry' && /décimale/.test(checkField(dz, '7/4').msg ?? ''), 'décimal exigé : 7/4 → écriture décimale demandée');
  ok(checkField(dz, '1,7').status === 'wrong', 'décimal exigé : 1,7 faux');
  ok(checkField(F(q(3), { form: 'decimal' }), '6/2').status === 'ok', 'décimal exigé, valeur entière : 6/2 accepté');
}
section('Ensembles de solutions');
const S = (expect: Answer & { kind: 'set' }) => expect;
const s2 = S({ kind: 'set', expect: [{ q: q(-5, 2) }, { q: q(3) }] });
ok(checkSet(s2, '3 ; -5/2', false).status === 'ok', 'ordre indifférent');
ok(checkSet(s2, '-2,5;3', false).status === 'ok', 'décimal + sans espace');
ok(checkSet(s2, '3 et −5/2', false).status === 'ok', 'séparateur « et »');
ok(checkSet(s2, '3 ; 3 ; -5/2', false).status === 'ok', 'doublons ignorés');
ok(checkSet(s2, '3', false).status === 'wrong' && /manque/.test(checkSet(s2, '3', false).msg ?? ''), 'une solution manquante signalée');
ok(checkSet(s2, '3 ; -5/2 ; 1', false).status === 'wrong' && /pas solution/.test(checkSet(s2, '3 ; -5/2 ; 1', false).msg ?? ''), 'valeur en trop signalée');
ok(checkSet(s2, '', true).status === 'wrong', '« Aucune solution » à tort');
ok(checkSet(s2, '3 ; abc', false).status === 'retry', 'élément illisible → retry');
ok(parseSet('1;2;3').ok && (parseSet('1;2;3') as { vals: unknown[] }).vals.length === 3, 'découpage « ; »');
const s0 = S({ kind: 'set', expect: [] });
ok(checkSet(s0, '', true).status === 'ok', 'aucune solution : case cochée ok');
ok(checkSet(s0, '4', false).status === 'wrong', 'aucune solution : valeur donnée → faux');
const sq = S({ kind: 'set', expect: [{ sqrt: q(7), s: -1 }, { sqrt: q(7), s: 1 }], sqrt: true });
ok(checkSet(sq, '√7 ; -√7', false).status === 'ok', '±√7 ok');
ok(checkSet(sq, '√7', false).status === 'wrong', '√7 seul : il manque −√7');
ok(checkSet(sq, '2,65 ; -2,65', false).status === 'retry', 'arrondis au lieu de valeurs exactes → retry');
const sa = S({ kind: 'set', expect: [{ sqrt: q(7), s: -1 }, { sqrt: q(7), s: 1 }], approx: { tol: 0.005, dp: 2 } });
ok(checkSet(sa, '-2,65 ; 2,65', false).status === 'ok', 'arrondis demandés ok');
ok(checkSet(sa, '√7 ; -√7', false).status === 'retry', 'valeurs exactes quand on demande des arrondis → retry explicite');
const sm: Step = { prompt: '', hint: '', answer: s2, mistakes: [{ on: 'set', value: [q(5, 2), q(-3)], msg: 'SIGNES' }] };
ok(checkStep(sm, { kind: 'set', raw: '-3 ; 5/2', none: false }).msg === 'SIGNES', 'erreur typique reconnue (ensemble)');

section('Inéquations');
const ia = { kind: 'ineq' as const, v: 'x', rel: '>=' as const, bound: q(-5, 2) };
ok(checkIneq(ia, '>=', '-5/2').status === 'ok', '≥ −5/2 ok');
ok(checkIneq(ia, '>=', '−2,5').status === 'ok', '≥ −2,5 ok');
ok(checkIneq(ia, null, '-5/2').status === 'retry', 'symbole manquant → retry');
ok(/stricte|large/.test(checkIneq(ia, '>', '-5/2').msg ?? ''), 'strict au lieu de large signalé');
ok(/sens/.test(checkIneq(ia, '<=', '-5/2').msg ?? ''), 'sens inversé signalé');
ok(checkIneq(ia, '>=', '5/2').status === 'wrong', 'borne fausse');
ok(checkIneq(ia, '>=', '-5/2', [{ on: 'ineq', rel: '<=', msg: 'SENS' }]).status === 'ok', 'mistake non déclenchée sur bonne réponse');
ok(checkIneq(ia, '<=', '-5/2', [{ on: 'ineq', rel: '<=', bound: q(-5, 2), msg: 'SENS' }]).msg === 'SENS', 'erreur typique reconnue (sens non changé)');
const i3 = { kind: 'ineq' as const, v: 'x', rel: '<' as const, bound: q(7, 3) };
ok(checkIneq(i3, '<', '2,33').status === 'retry', 'borne approchée → valeur exacte demandée');

section('Droite graduée');
const ray: Step = { prompt: '', hint: '', answer: { kind: 'ray', bound: q(2), rel: '<' } };
ok(checkStep(ray, { kind: 'ray', side: 'left', incl: false }).status === 'ok', 'x < 2 : gauche, exclue');
ok(/gauche/.test(checkStep(ray, { kind: 'ray', side: 'right', incl: false }).msg ?? ''), 'mauvais côté expliqué');
ok(/extérieur/.test(checkStep(ray, { kind: 'ray', side: 'left', incl: true }).msg ?? ''), 'crochet : stricte → vers l’extérieur');
ok(checkStep(ray, { kind: 'ray', side: null, incl: true }).status === 'retry', 'choix incomplet → retry');
ok(reveal(ray) === '[[ray:<:2/1]]', 'corrigé : marqueur de droite graduée');

section('Plusieurs cases, choix');
const two: Step = { prompt: '', hint: '', answer: { kind: 'num', fields: [F(q(3)), F(q(5))] } };
ok(checkStep(two, { kind: 'num', raws: ['3', '5'] }).status === 'ok', 'deux cases justes');
ok(/inversées/.test(checkStep(two, { kind: 'num', raws: ['5', '3'] }).msg ?? ''), 'valeurs inversées détectées');
ok(checkStep(two, { kind: 'num', raws: ['3', ''] }).msg === 'Remplis toutes les cases.', 'case vide → « Remplis toutes les cases »');
ok(/Une des valeurs/.test(checkStep(two, { kind: 'num', raws: ['3', '6'] }).msg ?? ''), 'une valeur fausse signalée');
ok(/signe/.test(checkStep({ prompt: '', hint: '', answer: { kind: 'num', fields: [F(q(4))] } }, { kind: 'num', raws: ['-4'] }).msg ?? ''), 'signe opposé → message « signe »');
const mis: Step = { prompt: '', hint: '', answer: { kind: 'num', fields: [F(q(4))] }, mistakes: [{ on: 'num', value: q(12), msg: 'DIV' }] };
ok(checkStep(mis, { kind: 'num', raws: ['12'] }).msg === 'DIV', 'erreur typique reconnue (nombre)');
const yn: Step = { prompt: '', hint: '', answer: { kind: 'choice', options: ['Oui', 'Non'], correct: 1, attempts: 1, explain: ['NON', null] } };
ok(checkStep(yn, { kind: 'choice', index: 1 }).status === 'ok' && checkStep(yn, { kind: 'choice', index: 0 }).msg === 'NON', 'oui/non + explication');
ok(maxAttempts(yn) === 1 && maxAttempts(two) === 2, 'nombre d’essais : 1 pour oui/non, 2 sinon');
ok(maxAttempts({ prompt: '', hint: '', answer: { kind: 'choice', options: ['a', 'b', 'c'], correct: 0 } }) === 2, 'QCM à 3 options : 2 essais');

section('Expressions algébriques (chapitre 6)');
const PX = (...c: number[]): Poly => c.map((x) => q(x));
const E = (expect: Poly, form: 'dev' | 'fact' | 'any', degs?: number[]) => ({ kind: 'expr' as const, v: 'x', expect, form, tex: '', ...(degs ? { degs } : {}) });
// 3x² + 5x − 2 = (3x − 1)(x + 2)
const P1 = PX(-2, 5, 3);
for (const raw of ['3x^2+5x-2', '3x²+5x−2', '5x+3x^2-2', '3 x^2 + 5 x - 2', '3X^2+5X-2']) ok(checkExpr(E(P1, 'dev'), raw).status === 'ok', `développé accepté : « ${raw} »`);
for (const raw of ['(3x-1)(x+2)', '(x+2)(3x-1)', '(3x−1)×(x+2)', '(-1+3x)(2+x)', '-(1-3x)(x+2)']) ok(checkExpr(E(P1, 'fact', [1, 1]), raw).status === 'ok', `factorisé accepté : « ${raw} »`);
ok(checkExpr(E(P1, 'dev'), '(3x-1)(x+2)').status === 'retry', 'forme factorisée refusée quand on demande de développer');
ok(checkExpr(E(P1, 'dev'), '3x^2+6x-x-2').status === 'retry', 'non réduit → à réduire');
ok(checkExpr(E(P1, 'fact', [1, 1]), '3x^2+5x-2').status === 'retry', 'somme refusée quand on demande un produit');
ok(checkExpr(E(PX(-27, 9), 'fact', [1]), '3(3x-9)').status === 'retry', 'factorisation incomplète repérée');
ok(checkExpr(E(PX(-27, 9), 'fact', [1]), '9(x-3)').status === 'ok', 'factorisation complète acceptée');
const w = checkExpr(E(P1, 'dev'), '3x^2+5x+2');
ok(w.status === 'wrong' && /n’est pas juste|ne sont pas justes/.test(w.msg ?? '') && !/^Contrôle/.test(w.msg ?? ''), 'réponse fausse : le terme faux est désigné (contre-exemple seulement en appoint)', w);
{
  const A3: Answer = { kind: 'expr', v: 'x', expect: [q(12), q(3)], form: 'dev', tex: '3x + 12', label: '' } as Answer;
  for (const raw of ['3×+12', '12+3×', '3 * + 12', '-2×-6'.replace('-6', '+12').replace('-2', '3')]) { const r = checkExpr(A3 as never, raw); ok(r.status === 'retry' && /signe « × »/.test(r.msg ?? ''), `« ${raw} » : × tapé pour la lettre x, signalé sans compter faux`, r); }
  const r2 = checkExpr(A3 as never, '3x+12×'); ok(r2.status === 'retry' && /se termine par « × »/.test(r2.msg ?? ''), '× final signalé', r2);
  const r3 = checkExpr({ kind: 'expr', v: 'x', expect: [q(0), q(8), q(1)], form: 'dev', tex: '', label: '' } as never, 'x2+8x'); ok(r3.status === 'retry' && /x\^2/.test(r3.msg ?? ''), '« x2 » : message sur le carré', r3);
  const r4 = checkExpr(A3 as never, '3x-12'); ok(r4.status === 'wrong' && /erreur de signe/.test(r4.msg ?? ''), 'erreur de signe désignée', r4);
  const r5 = checkExpr(A3 as never, '12+3x'); ok(r5.status === 'ok', '« 12+3x » accepté', r5);
}
ok(checkExpr(E(P1, 'dev'), '3x^2+5x+2', [{ on: 'expr', value: PX(2, 5, 3), msg: 'SIGNE' }]).msg === 'SIGNE', 'erreur typique reconnue (expression)');
for (const raw of ['3x^2+', '(3x-1', '3x^^2', 'x/0+1', '3y+1']) ok(checkExpr(E(P1, 'dev'), raw).status === 'retry', `saisie illisible → à reprendre : « ${raw} »`);
ok(checkExpr(E(P1, 'dev'), '-2+5x+3x*x').status === 'retry', 'x × x à écrire x² (non réduit)');
ok(checkExpr(E(P1, 'dev'), '1/x+3').status === 'retry', 'division par x refusée');
const t = parseExpr('2(x+1)^2');
ok(t.ok && !!toPoly(t.ast) && toPoly(t.ast)!.map((c) => c.n).join() === '2,4,2', '2(x+1)² = 2x² + 4x + 2');


console.log('Rangement (cartes)');
{
  const ord: Step = {
    prompt: '', hint: '',
    answer: { kind: 'order', items: ['\\dfrac{3}{4}', '\\dfrac{1}{2}', '\\dfrac{5}{8}', '\\dfrac{2}{4}'], values: [q(3, 4), q(1, 2), q(5, 8), q(1, 2)], dir: 'asc', why: { '0-2': 'Même dénominateur 8.' } },
    mistakes: [{ on: 'order', values: [q(3, 4), q(5, 8), q(1, 2), q(1, 2)], msg: 'Décroissant !' }],
  };
  ok(checkStep(ord, { kind: 'order', order: [1, 3, 2, 0], moved: true }).status === 'ok', 'bon ordre accepté');
  ok(checkStep(ord, { kind: 'order', order: [3, 1, 2, 0], moved: true }).status === 'ok', 'ex aequo (1/2 et 2/4) dans l’autre ordre accepté');
  ok(checkStep(ord, { kind: 'order', order: [0, 1, 2, 3], moved: false }).status === 'retry', 'non touché → retry (ne compte pas)');
  const w = checkStep(ord, { kind: 'order', order: [1, 3, 0, 2], moved: true });
  ok(w.status === 'wrong' && JSON.stringify(w.wrong) === '[2,3]' && /mauvais ordre/.test(w.msg ?? '') && /Même dénominateur 8/.test(w.msg ?? ''), 'cartes mal placées signalées + indice sur la 1re paire', w);
  const d = checkStep(ord, { kind: 'order', order: [0, 2, 1, 3], moved: true });
  ok(d.status === 'wrong' && d.mistake && /Décroissant/.test(d.msg ?? ''), 'erreur typique reconnue', d);
  ok(checkStep(ord, { kind: 'order', order: [1, 1, 2, 0], moved: true }).status === 'retry', 'permutation invalide → retry');
  ok(reveal(ord) === '$\\dfrac{1}{2} = \\dfrac{2}{4} < \\dfrac{5}{8} < \\dfrac{3}{4}$', 'bonne réponse écrite en chaîne', reveal(ord));
  const desc: Step = { ...ord, answer: { ...(ord.answer as never as object), dir: 'desc' } as Step['answer'], mistakes: [] };
  ok(checkStep(desc, { kind: 'order', order: [0, 2, 1, 3], moved: true }).status === 'ok', 'ordre décroissant');
}
section('Encadrement au dixième / au centième (02)');
{
  const { default: ch02 } = await import('../src/practice/ch02/index');
  const { generate } = await import('../src/practice/engine/series');
  const e = generate(ch02, 'comparer', 1, 7); // 73,252
  const st = e.steps[2];
  const v = (r: string[]) => checkStep(st, { kind: 'num', raws: r });
  ok(v(['73,2', '73,3', '73,25', '73,26']).status === 'ok', 'bon encadrement accepté');
  ok(/pas au dixième près/.test(v(['73,1', '73,3', '73,25', '73,26']).msg ?? ''), 'amplitude 0,2 au dixième : message ciblé');
  ok(/pas au centième près/.test(v(['73,2', '73,3', '73,25', '73,27']).msg ?? ''), 'amplitude 0,02 au centième : message ciblé');
  ok(v(['73,2', '73,4', '73,25', '73,26']).status === 'wrong', 'amplitude 0,2 refusée (l’énoncé demande le dixième près)');
}
console.log(`\n${pass} réussis, ${fail} échoués`);
process.exit(fail ? 1 : 0);
