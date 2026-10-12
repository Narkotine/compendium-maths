/**
 * Pourcentages (★ → ★★★) : appliquer, calculer une proportion, retrouver le total ; coefficients multiplicateurs,
 * évolutions successives, taux d'évolution, valeur de départ. À rebours : on choisit les résultats « propres ».
 */
import { type Q, q, add, sub, mul, div, toNum, isInt, isDecimal, decimals, neg } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, dn } from '../engine/build';
import { LINKS, eu, nb, pct } from './common';

const F = (label: Rich, v: Q, unit?: string): NumField => ({ label, expect: v, form: 'any', ...(unit ? { unit } : {}) });
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const okDec = (v: Q, k = 2) => isDecimal(v) && decimals(v) <= k;
const P = (p: Q) => div(p, q(100));
/** Évolution signée en % (+25 ; −4). */
const evo = (c: Q) => mul(sub(c, q(1)), q(100));
const evoTex = (e: Q) => (e.n >= 0 ? `+${pct(e)}` : `-${pct(neg(e))}`);
const MENTAL: Record<number, string> = { 10: 'diviser par 10', 50: 'prendre la moitié', 25: 'prendre le quart', 20: 'deux fois 10 %', 5: 'la moitié de 10 %', 75: 'trois fois 25 %', 1: 'diviser par 100' };

export const pourcentage: Generator = {
  id: 'pourcentage',
  title: 'Pourcentages',
  desc: 'Prendre p % ; exprimer une part en % ; retrouver le total (★★).',
  stars: 1,
  levels: [1, 2],
  example: '15\\,\\% \\text{ de } 80 = 12',
  course: LINKS.s41,
  links: [LINKS.s42],
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], ans: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [];
    // a) p % de A
    for (;;) {
      const p = level === 1 ? q(rng.pick([10, 20, 25, 50, 5, 15, 30, 75, 40])) : q(rng.pick([12, 35, 8, 18, 65, 15, 45, 75, 3, 125]) , rng.pick([1, 1, 1, 10]) === 10 ? 10 : 1);
      const A = q(level === 1 ? 10 * rng.int(2, 40) : rng.pick([40, 60, 80, 120, 150, 250, 340, 480, 640, 800]));
      const v = mul(P(p), A);
      if (!okDec(v, 2) || (level === 2 && toNum(p) >= 100)) continue;
      const pi = toNum(p);
      steps.push(step(`a) Calcule ${m(`${pct(p)}`)} de ${m(nb(A))}.`, [F('', v)], MENTAL[pi] ? `${m(pct(p))}, c’est ${MENTAL[pi]}.` : `${m(`${pct(p)} = \\dfrac{${nb(p)}}{100}`)} : multiplie ${m(nb(A))} par ${m(dn(P(p)))}.`,
        mist(v, [[mul(p, A), `${m(pct(p))} signifie « sur 100 » : il faut aussi diviser par ${m('100')}.`], [div(A, p), `On ne divise pas par ${m(nb(p))} : on multiplie par ${m(`\\dfrac{${nb(p)}}{100}`)}.`]], 0)));
      sol.push(`a) ${m(`${pct(p)} \\text{ de } ${nb(A)} = ${dn(P(p))} \\times ${nb(A)} = ${nb(v)}`)}${MENTAL[pi] ? ` (de tête : ${MENTAL[pi]})` : ''}.`);
      ans.push(m(nb(v)));
      items.push({ what: 'a', js: `${toNum(p)}/100*${toNum(A)}`, expect: toNum(v) });
      break;
    }
    // b) une part en pourcentage
    for (;;) {
      const ctx = rng.pick([['élèves', 'viennent en bus', 'classe'], ['spectateurs', 'sont des enfants', 'salle'], ['salariés', 'travaillent à temps partiel', 'entreprise'], ['votants', 'ont choisi le projet A', 'consultation']]);
      const tot = level === 1 ? rng.pick([20, 25, 40, 50, 200, 250, 400, 500, 28, 32]) : rng.pick([24, 30, 36, 42, 48, 60, 70, 90, 120, 150]);
      const part = rng.int(1, tot - 1);
      const pr = mul(q(part, tot), q(100));
      if (level === 1 && !okDec(pr, 1)) continue;
      if (level === 2 && okDec(pr, 1)) continue;
      const field: NumField = level === 1 ? F('', pr, '%') : { label: '', expect: q(Math.round(toNum(pr) * 10), 10), form: 'any', unit: '%', approx: { value: toNum(pr), tol: 0.05, dp: 1 } };
      steps.push(step(`b) Sur ${m(nb(tot))} ${ctx[0]}, ${m(nb(part))} ${ctx[1]}. Quel pourcentage cela représente-t-il${level === 2 ? ' (arrondi au dixième)' : ''} ?`, [field], `Calcule la proportion ${m(`\\dfrac{${part}}{${tot}}`)}, puis multiplie par ${m('100')}.`,
        mist(field.expect, [[q(part), 'Ce n’est pas le nombre de personnes : il faut le rapporter au total, puis multiplier par 100.'], [isInt(q(tot * 100, part)) ? q(tot * 100, part) : null, 'C’est le total divisé par la part : on calcule part ÷ total.']])));
      sol.push(`b) ${m(`\\dfrac{${part}}{${tot}} \\times 100 ${level === 1 ? '=' : '\\approx'} ${level === 1 ? nb(pr) : nb(toNum(field.expect))}`)} : ${level === 1 ? '' : 'environ '}${m(pct(level === 1 ? pr : field.expect))} des ${ctx[0]}.`);
      ans.push(m(pct(field.expect)));
      items.push({ what: 'b', js: `${part}/${tot}*100`, expect: toNum(pr) });
      break;
    }
    if (level === 1) {
      // c) remise et prix payé
      for (;;) {
        const price = q(rng.int(4, 40) * 5), p = q(rng.pick([10, 15, 20, 25, 30, 40, 50]));
        const r = mul(P(p), price), paid = sub(price, r);
        if (!okDec(r)) continue;
        const item = rng.pick(['Une veste', 'Un sac', 'Une paire de baskets', 'Un jeu vidéo', 'Une lampe']);
        steps.push(step(`c) ${item} coûte ${m(eu(price))} €. On obtient une remise de ${m(pct(p))}. Calcule la remise, puis le prix payé.`, [F('Remise :', r, '€'), F('Prix payé :', paid, '€')], `Remise : ${m(pct(p))} de ${m(eu(price))}. Puis on la retire du prix.`,
          [...mist(paid, [[r, 'C’est la remise ; le prix payé est le prix moins la remise.'], [sub(price, p), `On ne retire pas ${m(nb(p))} € : on retire ${m(pct(p))} du prix.`]], 1)]));
        sol.push(`c) Remise : ${m(`${dn(P(p))} \\times ${eu(price)} = ${eu(r)}`)} € ; prix payé : ${m(`${eu(price)} - ${eu(r)} = ${eu(paid)}`)} € (ou directement ${m(`${eu(price)} \\times ${dn(sub(q(1), P(p)))} = ${eu(paid)}`)}).`);
        ans.push(`${m(eu(r))} € ; ${m(eu(paid))} €`);
        items.push({ what: 'r', js: `${toNum(price)}*${toNum(p)}/100`, expect: toNum(r) }, { what: 'paid', js: `${toNum(price)}*(1-${toNum(p)}/100)`, expect: toNum(paid) });
        break;
      }
    } else {
      // c) retrouver le total
      for (;;) {
        const loyer = rng.chance(0.5);
        const p = q(loyer ? rng.pick([20, 25, 30, 35, 40]) : rng.pick([40, 60, 75, 45, 55, 65, 70, 80, 85]));
        const tot = q(loyer ? rng.int(15, 40) * 100 : rng.int(30, 90) * 10);
        const part = mul(P(p), tot);
        if (!isInt(part) || toNum(part) < 3) continue;
        const ctx = loyer ? `Une famille consacre ${m(nb(part))} € par mois au loyer, soit ${m(pct(p))} de ses revenus. Quels sont ses revenus mensuels (en €) ?` : `${m(nb(part))} élèves, soit ${m(pct(p))} des élèves du collège, mangent à la cantine. Combien le collège compte-t-il d’élèves ?`;
        steps.push(step(`c) ${ctx}`, [F('Total :', tot)], `${m(pct(p))} du total valent ${m(nb(part))} : combien vaut ${m('1\\,\\%')}, puis ${m('100\\,\\%')} ?`,
          mist(tot, [[mul(P(p), part), `Tu as pris ${m(pct(p))} de ${m(nb(part))} ; mais ${m(nb(part))} est déjà une partie du total.`]])));
        sol.push(`c) ${m(`\\text{total} \\times ${dn(P(p))} = ${nb(part)}`)}, donc ${m(`\\text{total} = ${nb(part)} \\div ${dn(P(p))} = ${nb(tot)}`)}. Contrôle : ${m(`${pct(p)} \\text{ de } ${nb(tot)} = ${nb(part)}`)} ✓.`);
        ans.push(m(nb(tot)));
        items.push({ what: 'c', js: `${toNum(part)}/(${toNum(p)}/100)`, expect: toNum(tot) });
        break;
      }
    }
    return { title: 'Calcule avec les pourcentages.', steps, solution: sol, answer: ans.join(' ; '), key: steps.map((s) => s.prompt).join('|'), data: { kind: 'js', items } };
  },
};

// ===================================================================== évolutions
export const evolution: Generator = {
  id: 'evolution',
  title: 'Hausses, baisses',
  desc: 'Coefficient multiplicateur ; successives, taux, valeur de départ (★★★).',
  stars: 2,
  levels: [2, 3],
  example: '-25\\,\\% : \\times 0{,}75',
  course: LINKS.s43,
  links: [LINKS.s44],
  generate(rng: Rng, level: Level) {
    const SIGNH = 'Attention au sens : une hausse donne un coefficient plus grand que 1, une baisse un coefficient plus petit que 1.';
    if (level === 2) {
      const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number }[] = [];
      // a) coefficients
      const ph = q(rng.pick([2, 3, 5, 8, 12, 15, 20, 25, 30, 40, 50, 100])), pb = q(rng.pick([2, 4, 5, 8, 10, 15, 20, 25, 30, 35, 40, 60]));
      const ch = add(q(1), P(ph)), cb = sub(q(1), P(pb));
      steps.push(step(`a) Donne le coefficient multiplicateur d’une hausse de ${m(pct(ph))}, puis d’une baisse de ${m(pct(pb))}.`, [F('Hausse :', ch), F('Baisse :', cb)], `Hausse de ${m('p\\,\\%')} : ${m('\\times\\left(1 + \\dfrac{p}{100}\\right)')} ; baisse : ${m('\\times\\left(1 - \\dfrac{p}{100}\\right)')}.`,
        [...mist(ch, [[P(ph), `${m(dn(P(ph)))} donnerait seulement ${m(pct(ph))} du prix : il faut garder le prix entier (${m('1')}) et ajouter.`], [add(q(1), ph), `${m(pct(ph))} s’écrit ${m(dn(P(ph)))}, pas ${m(nb(ph))}.`]], 0), ...mist(cb, [[P(pb), `${m(dn(P(pb)))} est la part retirée ; il reste ${m(`1 - ${dn(P(pb))}`)}.`], [add(q(1), P(pb)), SIGNH]], 1)]));
      sol.push(`a) ${m(`1 + ${dn(P(ph))} = ${dn(ch)}`)} ; ${m(`1 - ${dn(P(pb))} = ${dn(cb)}`)}.`);
      items.push({ what: 'ch', js: `1+${toNum(ph)}/100`, expect: toNum(ch) }, { what: 'cb', js: `1-${toNum(pb)}/100`, expect: toNum(cb) });
      // b) traduire un coefficient
      const c = rng.pick([q(125, 100), q(96, 100), q(2), q(85, 100), q(107, 100), q(6, 10), q(135, 100), q(99, 100), q(3, 2)]);
      const e = evo(c);
      steps.push({ ...step(`b) Multiplier par ${m(dn(c))}, c’est quelle évolution (en %, avec son signe) ?`, [F('Évolution :', e, '%')], `${m(dn(c))} ${toNum(c) > 1 ? `${m('= 1 +')} …` : `${m('= 1 -')} …`} : compare au coefficient ${m('1')} (le prix sans changement).`,
        mist(e, [[mul(c, q(100)), `${m(`\\times ${dn(c)}`)} donne ${m(pct(mul(c, q(100))))} **du** prix de départ ; l’évolution est l’écart à ${m('100\\,\\%')}.`]])), signHint: SIGNH });
      sol.push(`b) ${m(`${dn(c)} = 1 ${e.n >= 0 ? '+' : '-'} ${dn(P(e.n >= 0 ? e : neg(e)))}`)} : c’est une ${e.n >= 0 ? 'hausse' : 'baisse'} de ${m(pct(e.n >= 0 ? e : neg(e)))}.`);
      items.push({ what: 'e', js: `(${toNum(c)}-1)*100`, expect: toNum(e) });
      // c) appliquer
      for (;;) {
        const price = q(rng.int(8, 60) * 5), up = rng.chance(0.5), p = q(rng.pick([10, 15, 20, 25, 30, 40]));
        const co = up ? add(q(1), P(p)) : sub(q(1), P(p));
        const res = mul(price, co);
        if (!okDec(res)) continue;
        const it = rng.pick(['Un manteau', 'Un abonnement', 'Un vélo', 'Une console', 'Un loyer']);
        steps.push(step(`c) ${it} coûte ${m(eu(price))} €. ${up ? `Son prix augmente de ${m(pct(p))}` : `Il est soldé à ${m(`-${pct(p)}`)}`}. Calcule le nouveau prix avec le coefficient multiplicateur.`, [F('Nouveau prix :', res, '€')], `Multiplie ${m(eu(price))} par ${m(dn(co))}.`,
          mist(res, [[mul(price, P(p)), `C’est le montant de la ${up ? 'hausse' : 'remise'}, pas le nouveau prix.`], [mul(price, up ? sub(q(1), P(p)) : add(q(1), P(p))), SIGNH]])));
        sol.push(`c) ${m(`${eu(price)} \\times ${dn(co)} = ${eu(res)}`)} €. Contrôle : ${m(`${pct(p)} \\text{ de } ${eu(price)} = ${eu(mul(price, P(p)))}`)} et ${m(`${eu(price)} ${up ? '+' : '-'} ${eu(mul(price, P(p)))} = ${eu(res)}`)} ✓.`);
        items.push({ what: 'res', js: `${toNum(price)}*(1${up ? '+' : '-'}${toNum(p)}/100)`, expect: toNum(res) });
        break;
      }
      return { title: 'Coefficients multiplicateurs.', steps, solution: sol, answer: `${m(dn(ch))} ; ${m(dn(cb))} ; ${m(evoTex(e))} ; ${m(eu(toNumQ(steps[2])))} €`, key: steps.map((s) => s.prompt).join('|'), data: { kind: 'js', items } };
    }
    // ★★★ : un problème parmi trois
    const kind = rng.pick(['succ', 'taux', 'depart']);
    if (kind === 'succ') {
      for (;;) {
        const [s1, s2] = [rng.pick([1, -1]), rng.pick([1, -1])];
        const p1 = q(rng.pick([10, 20, 25, 30, 40, 50])), p2 = q(rng.pick([10, 20, 25, 30, 40, 50]));
        const c1 = s1 > 0 ? add(q(1), P(p1)) : sub(q(1), P(p1)), c2 = s2 > 0 ? add(q(1), P(p2)) : sub(q(1), P(p2));
        const c = mul(c1, c2), e = evo(c);
        if (e.n === 0 && rng.chance(0.7)) continue;
        if (!okDec(e, 1)) continue;
        const naive = add(mul(q(s1), p1), mul(q(s2), p2));
        const w = (s: number, p: Q) => (s > 0 ? `augmente de ${m(pct(p))}` : `baisse de ${m(pct(p))}`);
        return {
          title: 'Évolutions successives.',
          statement: `Un prix ${w(s1, p1)}, puis ${w(s2, p2)}.`,
          steps: [
            step('Quel est le coefficient multiplicateur global ?', [F('Coefficient :', c)], 'On **multiplie** les deux coefficients.', mist(c, [[add(c1, c2), 'On multiplie les coefficients (on ne les additionne pas).'], [add(q(1), P(naive)), 'Les pourcentages successifs ne s’additionnent pas : multiplie les coefficients.']])),
            { ...step('Quelle est l’évolution globale (en %, avec son signe) ?', [F('Évolution :', e, '%')], 'Compare le coefficient global à 1.', mist(e, [[naive, `Les deux évolutions ne portent pas sur la même quantité : on ne les additionne pas.`]])), signHint: SIGNH },
          ],
          solution: [`Coefficients : ${m(dn(c1))} puis ${m(dn(c2))}. Global : ${m(`${dn(c1)} \\times ${dn(c2)} = ${dn(c)}`)}.`, `${m(`${dn(c)} = 1 ${e.n >= 0 ? '+' : '-'} ${dn(P(e.n >= 0 ? e : neg(e)))}`)} : évolution globale ${m(evoTex(e))}${e.n === 0 ? ' : on revient exactement au départ' : ''}, et non ${m(evoTex(naive))}.`, `Contrôle sur ${m('100')} € : ${m(`100 \\times ${dn(c1)} = ${dn(mul(q(100), c1))}`)}, puis ${m(`${dn(mul(q(100), c1))} \\times ${dn(c2)} = ${dn(mul(q(100), c))}`)} ✓.`],
          answer: `${m(`\\times ${dn(c)}`)} : ${m(evoTex(e))}`,
          key: `succ:${s1}${toNum(p1)}:${s2}${toNum(p2)}`,
          data: { kind: 'js', items: [{ what: 'c', js: `${toNum(c1)}*${toNum(c2)}`, expect: toNum(c) }, { what: 'e', js: `(${toNum(c1)}*${toNum(c2)}-1)*100`, expect: toNum(e) }] },
        };
      }
    }
    if (kind === 'taux') {
      for (;;) {
        const Vd = q(rng.pick([200, 400, 500, 800, 1200, 2000, 2500, 5000, 20000, 40000]));
        const t = q(rng.pick([-40, -25, -20, -15, -12, -8, -5, 4, 5, 6, 8, 12, 15, 20, 25, 30, 35, 60]));
        const Va = mul(Vd, add(q(1), P(t)));
        if (!isInt(Va)) continue;
        const ctx = rng.pick([['La population d’une ville passe de', 'habitants'], ['Le nombre d’abonnés d’une chaîne passe de', 'abonnés'], ['Le prix d’un ordinateur passe de', '€']]);
        return {
          title: 'Taux d’évolution.',
          statement: `${ctx[0]} ${m(nb(Vd))} à ${m(nb(Va))} ${ctx[1]}.`,
          steps: [{ ...step('Calcule le taux d’évolution, en % (avec son signe).', [F('Taux :', t, '%')], `${m('\\dfrac{V_a - V_d}{V_d}')}, puis multiplie par ${m('100')}.`, mist(t, [[mul(div(sub(Va, Vd), Va), q(100)), 'On divise par la valeur de **départ**, pas par la valeur d’arrivée.'], [sub(Va, Vd), 'C’est la variation ; il faut la rapporter à la valeur de départ.']])), signHint: 'Attention au signe : une diminution donne un taux négatif.' }],
          solution: [`${m(`\\dfrac{${nb(Va)} - ${nb(Vd)}}{${nb(Vd)}} = \\dfrac{${nb(sub(Va, Vd))}}{${nb(Vd)}} = ${dn(P(t))}`)}, soit ${m(evoTex(t))}.`, `Contrôle : ${m(`${nb(Vd)} \\times ${dn(add(q(1), P(t)))} = ${nb(Va)}`)} ✓.`],
          answer: m(evoTex(t)),
          key: `taux:${toNum(Vd)}:${toNum(t)}:${ctx[1]}`,
          data: { kind: 'js', items: [{ what: 't', js: `(${toNum(Va)}-${toNum(Vd)})/${toNum(Vd)}*100`, expect: toNum(t) }] },
        };
      }
    }
    for (;;) {
      const up = rng.chance(0.4), p = q(rng.pick([10, 15, 20, 25, 30, 40, 50]));
      const co = up ? add(q(1), P(p)) : sub(q(1), P(p));
      const Vd = q(rng.int(6, 80) * 5);
      const Va = mul(Vd, co);
      if (!okDec(Va)) continue;
      const it = rng.pick(['Un jean', 'Un livre', 'Une montre', 'Un casque', 'Une trottinette']);
      return {
        title: 'Retrouver la valeur de départ.',
        statement: up ? `Après une hausse de ${m(pct(p))}, ${it.toLowerCase()} coûte ${m(eu(Va))} €.` : `${it} soldé${/^Une/.test(it) ? 'e' : ''} à ${m(`-${pct(p)}`)} coûte ${m(eu(Va))} €.`,
        steps: [step('Quel était le prix de départ ?', [F('Prix de départ :', Vd, '€')], `Prix de départ ${m(`\\times ${dn(co)} = ${eu(Va)}`)} : on **divise** par le coefficient.`,
          mist(Vd, [[mul(Va, up ? sub(q(1), P(p)) : add(q(1), P(p))), `On ne revient pas au départ en appliquant l’évolution inverse : les ${m(pct(p))} portaient sur le prix de départ, pas sur ${m(eu(Va))} €. Divise par ${m(dn(co))}.`], [mul(Va, co), `On divise par le coefficient ${m(dn(co))} (on ne multiplie pas).`]]))],
        solution: [`Prix de départ ${m(`\\times ${dn(co)} = ${eu(Va)}`)}, donc prix de départ ${m(`= ${eu(Va)} \\div ${dn(co)} = ${eu(Vd)}`)} €.`, `Contrôle : ${m(`${eu(Vd)} \\times ${dn(co)} = ${eu(Va)}`)} ✓.`],
        answer: `${m(eu(Vd))} €`,
        key: `dep:${up}:${toNum(p)}:${toNum(Vd)}`,
        data: { kind: 'js', items: [{ what: 'Vd', js: `${toNum(Va)}/(1${up ? '+' : '-'}${toNum(p)}/100)`, expect: toNum(Vd) }] },
      };
    }
  },
};
function toNumQ(s: Step): Q {
  return s.answer.kind === 'num' ? s.answer.fields[0].expect : q(0);
}
