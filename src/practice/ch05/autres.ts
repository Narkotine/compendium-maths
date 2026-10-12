/** Ratios et partage (★ → ★★), échelles (★ → ★★), trouver l'erreur (★★). */
import { type Q, q, add, sub, mul, div, toNum, isInt, isDecimal, decimals } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, dn, shuffledChoice, NAMES } from '../engine/build';
import { LINKS, eu, nb, pct, hm } from './common';

const F = (label: Rich, v: Q, unit?: string): NumField => ({ label, expect: v, form: 'any', ...(unit ? { unit } : {}) });
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const okDec = (v: Q, k = 2) => isDecimal(v) && decimals(v) <= k;
const FEM = ['Ana', 'Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina', 'Sarah', 'Maëlle', 'Amina'];

// ===================================================================== ratios
export const ratio: Generator = {
  id: 'ratio',
  title: 'Ratios et partage',
  desc: 'Partager selon un ratio ; mélanges ; partage proportionnel à trois (★★).',
  stars: 1,
  levels: [1, 2],
  example: '450 \\text{ au ratio } 2 : 3 \\to 180 \\text{ et } 270',
  course: LINKS.s5,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const [n1, n2] = rng.shuffle(NAMES).slice(0, 2);
      let a: number, b: number;
      do { a = rng.int(1, 5); b = rng.int(1, 7); } while (a === b || (a % 2 === 0 && b % 2 === 0) || (a % 3 === 0 && b % 3 === 0));
      const part = rng.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100]);
      const T = (a + b) * part;
      const s1 = step(`${n1} et ${n2} se partagent ${m(nb(T))} € selon le ratio ${m(`${a} : ${b}`)}. Combien reçoit chacun ?`, [F(`${n1} :`, q(a * part), '€'), F(`${n2} :`, q(b * part), '€')], `Le ratio ${m(`${a} : ${b}`)} donne ${m(`${a} + ${b} = ${a + b}`)} parts égales. Combien vaut une part ?`,
        [{ on: 'numAll', values: [mul(q(T), q(a, b)), sub(q(T), mul(q(T), q(a, b)))].map((v) => v), msg: `${n1} ne reçoit pas les ${m(`\\dfrac{${a}}{${b}}`)} de la somme : il y a ${m(String(a + b))} parts en tout.` }, ...mist(q(a * part), [[q(T * a, b), `Le ratio ${m(`${a} : ${b}`)} ne veut pas dire « les ${m(`\\dfrac{${a}}{${b}}`)} » : ${n1} reçoit ${m(String(a))} part${a > 1 ? 's' : ''} sur ${m(String(a + b))}.`]], 0)]);
      // mélange : quantité de l'autre ingrédient
      const mix = rng.pick([['ciment', 'sable', 'kg'], ['sirop', 'eau', 'cL'], ['peinture blanche', 'peinture bleue', 'L'], ['farine', 'sucre', 'g']]);
      const c = rng.int(1, 3), d = rng.int(2, 6), u = rng.pick(mix[2] === 'g' ? [50, 100, 150] : mix[2] === 'cL' ? [5, 10, 15, 20] : [2, 3, 5, 10]);
      const A = c * u;
      const s2 = step(`Un mélange contient ${mix[0]} et ${mix[1]} dans le ratio ${m(`${c} : ${d}`)}. Quelle quantité de ${mix[1]} faut-il pour ${m(nb(A))} ${mix[2]} de ${mix[0]} ?`, [F(`${mix[1][0].toUpperCase() + mix[1].slice(1)} :`, q(d * u), mix[2])], `${m(nb(A))} ${mix[2]} de ${mix[0]} correspondent à ${m(String(c))} part${c > 1 ? 's' : ''}.`,
        mist(q(d * u), [[q(A * c, d), 'Le ratio se lit dans l’ordre : ' + mix[0] + ' puis ' + mix[1] + '.'], [q(A + d - c), 'Un ratio est multiplicatif : on ne fait pas une différence.']]));
      return {
        title: 'Utilise les ratios.',
        steps: c === d ? [s1] : [s1, s2],
        solution: [
          `Partage : ${m(`${a} + ${b} = ${a + b}`)} parts ; une part vaut ${m(`${nb(T)} \\div ${a + b} = ${part}`)} €. ${n1} reçoit ${m(`${a} \\times ${part} = ${a * part}`)} € et ${n2} ${m(`${b} \\times ${part} = ${b * part}`)} €. Contrôle : ${m(`${a * part} + ${b * part} = ${nb(T)}`)} ✓.`,
          ...(c === d ? [] : [`Mélange : une part vaut ${m(`${nb(A)} \\div ${c} = ${u}`)} ${mix[2]} ; il faut ${m(`${d} \\times ${u} = ${nb(d * u)}`)} ${mix[2]} de ${mix[1]}.`]),
        ],
        answer: `${m(String(a * part))} € et ${m(String(b * part))} €${c === d ? '' : ` ; ${m(nb(d * u))} ${mix[2]}`}`,
        key: `r1:${a}:${b}:${T}:${c}:${d}:${u}:${mix[0]}`,
        data: { kind: 'js', items: [{ what: 'A', js: `${T}/(${a}+${b})*${a}`, expect: a * part }, { what: 'B', js: `${T}/(${a}+${b})*${b}`, expect: b * part }, { what: 'mix', js: `${A}/${c}*${d}`, expect: d * u }] },
      };
    }
    // ★★ : partage proportionnel aux mises (trois personnes) et pourcentage reçu
    for (;;) {
      const names = rng.shuffle(NAMES).slice(0, 3);
      const unit = rng.pick([2, 3, 4, 5, 6]);
      const ms = [rng.int(2, 12), rng.int(2, 12), rng.int(2, 12)].map((x) => x * unit);
      const S = ms[0] + ms[1] + ms[2];
      const coef = rng.pick([q(3, 2), q(2), q(5, 2), q(3), q(4), q(5)]);
      const G = mul(q(S), coef);
      const gains = ms.map((x) => mul(q(x), coef));
      const share = mul(div(q(ms[2]), q(S)), q(100));
      if (!isInt(G) || !gains.every((g) => okDec(g, 2)) || !okDec(share, 1) || new Set(ms).size < 3) continue;
      return {
        title: 'Partage proportionnel.',
        statement: `${names[0]}, ${names[1]} et ${names[2]} achètent ensemble un ticket de loterie : ${names[0]} donne ${m(String(ms[0]))} €, ${names[1]} ${m(String(ms[1]))} € et ${names[2]} ${m(String(ms[2]))} €. Ils gagnent ${m(nb(G))} € et se les partagent proportionnellement à leur mise.`,
        steps: [
          step('Combien reçoit chacun ?', names.map((n, i) => F(`${n} :`, gains[i], '€')), `Mise totale : ${m(`${ms.join(' + ')} = ${S}`)} €. Combien rapporte ${m('1')} € misé ?`,
            [{ on: 'numAll', values: names.map(() => div(G, q(3))), msg: 'Le partage n’est pas égal : il est proportionnel aux mises.' }]),
          step(`Quel pourcentage du gain reçoit ${names[2]} ?`, [F('', share, '%')], `Part de ${names[2]} ÷ gain total, × 100 (ou : sa mise ÷ la mise totale).`, mist(share, [[mul(div(q(ms[2]), G), q(100)), 'On compare au **gain** total (ou la mise à la mise totale).']])),
        ],
        solution: [`Mise totale : ${m(`${ms.join(' + ')} = ${S}`)} €. Chaque euro misé rapporte ${m(`${nb(G)} \\div ${S} = ${dn(coef)}`)} €.`, names.map((n, i) => `${n} : ${m(`${ms[i]} \\times ${dn(coef)} = ${eu(gains[i])}`)} €`).join(' ; ') + `. Contrôle : ${m(`${gains.map(eu).join(' + ')} = ${nb(G)}`)} ✓.`, `${names[2]} : ${m(`\\dfrac{${eu(gains[2])}}{${nb(G)}} \\times 100 = ${nb(share)}`)}, soit ${m(pct(share))} du gain.`],
        answer: `${gains.map((g) => m(eu(g)) + ' €').join(' ; ')} ; ${m(pct(share))}`,
        key: `r2:${ms.join(',')}:${toNum(G)}`,
        data: { kind: 'js', items: [...gains.map((g, i) => ({ what: `g${i}`, js: `${toNum(G)}*${ms[i]}/${S}`, expect: toNum(g) })), { what: 'p', js: `${ms[2]}/${S}*100`, expect: toNum(share) }] },
      };
    }
  },
};

// ===================================================================== échelles
const thin = (n: number) => nb(n);
export const echelle: Generator = {
  id: 'echelle',
  title: 'Échelles',
  desc: 'Plan ↔ réalité ; cartes au 1 : 50 000 ; trouver l’échelle (★★).',
  stars: 1,
  levels: [1, 2],
  example: '1 : 50\\,000 : 24\\,\\text{cm} \\to 12\\,\\text{km}',
  course: LINKS.s6,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const n = rng.pick([50, 100, 200, 500]);
      const plan = q(rng.int(5, 60) * (n === 500 ? 2 : 5), 10); // cm
      const reel = mul(plan, q(n, 100)); // m
      const realB = q(rng.int(2, 16) * (n <= 100 ? 5 : 10), 10); // m
      const planB = div(mul(realB, q(100)), q(n));
      const obj = rng.pick(['un mur', 'une pièce', 'un couloir', 'une terrasse']);
      if (!okDec(reel, 2) || !okDec(planB, 2)) return echelle.generate(rng, level);
      return {
        title: `Plan à l’échelle $\\dfrac{1}{${n}}$.`,
        steps: [
          step(`a) Sur le plan, ${obj} mesure ${m(`${dn(plan)}\\,\\text{cm}`)}. Quelle est sa longueur réelle, en mètres ?`, [F('Longueur réelle :', reel, 'm')], `${m('1')} cm sur le plan représente ${m(String(n))} cm en réalité. Convertis ensuite en mètres.`,
            mist(reel, [[mul(plan, q(n)), `C’est la longueur en **centimètres** : convertis en mètres (÷ 100).`], [div(plan, q(n)), `La longueur réelle est plus grande : on **multiplie** par ${m(String(n))}.`]])),
          step(`b) Une table mesure ${m(`${dn(realB)}\\,\\text{m}`)} en réalité. Quelle longueur aura-t-elle sur le plan, en centimètres ?`, [F('Sur le plan :', planB, 'cm')], `Convertis d’abord en centimètres, puis divise par ${m(String(n))}.`,
            mist(planB, [[div(realB, q(n)), `Convertis d’abord ${m(`${dn(realB)}\\,\\text{m}`)} en centimètres.`], [mul(realB, q(n)), `Sur le plan, c’est plus petit : on **divise** par ${m(String(n))}.`]])),
        ],
        solution: [`a) ${m(`${dn(plan)} \\times ${n} = ${dn(mul(plan, q(n)))}`)} cm, soit ${m(dn(reel))} m.`, `b) ${m(`${dn(realB)}\\,\\text{m} = ${dn(mul(realB, q(100)))}\\,\\text{cm}`)} ; ${m(`${dn(mul(realB, q(100)))} \\div ${n} = ${dn(planB)}`)} cm.`, 'Contrôle : les longueurs réelles sont vraisemblables pour un logement.'],
        answer: `${m(dn(reel))} m ; ${m(dn(planB))} cm`,
        key: `e1:${n}:${toNum(plan)}:${toNum(realB)}`,
        data: { kind: 'js', items: [{ what: 'reel', js: `${toNum(plan)}*${n}/100`, expect: toNum(reel) }, { what: 'plan', js: `${toNum(realB)}*100/${n}`, expect: toNum(planB) }] },
      };
    }
    for (;;) {
      const n = rng.pick([25000, 50000, 100000, 200000, 250000]);
      const cm = q(rng.int(4, 30) * 5, 10);
      const km = mul(cm, q(n, 100000));
      const kmB = q(rng.int(2, 40) * (n >= 100000 ? 5 : 1), 2);
      const cmB = div(mul(kmB, q(100000)), q(n));
      const [pc, pk] = rng.pick([[2, 5], [4, 1], [3, 6], [5, 10], [2, 1], [1, 2], [4, 10], [5, 1]]);
      const scale = div(mul(q(pk), q(100000)), q(pc));
      if (!okDec(km, 2) || !okDec(cmB, 1) || !isInt(scale)) continue;
      return {
        title: 'Échelles de cartes.',
        steps: [
          step(`a) Sur une carte au ${m(`1 : ${thin(n)}`)}, deux villes sont séparées de ${m(`${dn(cm)}\\,\\text{cm}`)}. Quelle est la distance réelle, en km ?`, [F('', km, 'km')], `${m(`${dn(cm)} \\times ${thin(n)}`)} donne des centimètres ; ${m(`1\\,\\text{km} = 100\\,000\\,\\text{cm}`)}.`, mist(km, [[mul(cm, q(n, 1000)), `${m('1\\,\\text{km} = 100\\,000\\,\\text{cm}')} (pas ${m('1\\,000')}).`], [mul(cm, q(n, 100)), 'C’est en mètres : convertis en kilomètres.']])),
          step(`b) Sur la même carte, quelle longueur représente une route de ${m(`${dn(kmB)}\\,\\text{km}`)} ? (en cm)`, [F('', cmB, 'cm')], `Convertis d’abord en centimètres : ${m(`${dn(kmB)}\\,\\text{km} = ${thin(toNum(mul(kmB, q(100000))))}\\,\\text{cm}`)}.`, mist(cmB, [[div(kmB, q(n)), 'Oubli de conversion : on calcule dans la même unité (cm).']])),
          step(`c) Sur une autre carte, ${m(`${pc}\\,\\text{cm}`)} représentent ${m(`${pk}\\,\\text{km}`)}. Quelle est l’échelle ? Complète : ${m('1 : n')}.`, [{ ...F(m('n ='), scale), shown: thin(toNum(scale)) }], `Écris les deux longueurs dans la même unité (cm), puis fais le quotient.`, mist(scale, [[div(q(pk), q(pc)), `Mets les deux longueurs dans la même unité : ${m(`${pk}\\,\\text{km} = ${thin(pk * 100000)}\\,\\text{cm}`)}.`]])),
        ],
        solution: [
          `a) ${m(`${dn(cm)} \\times ${thin(n)} = ${thin(toNum(mul(cm, q(n))))}`)} cm, soit ${m(dn(km))} km.`,
          `b) ${m(`${dn(kmB)}\\,\\text{km} = ${thin(toNum(mul(kmB, q(100000))))}\\,\\text{cm}`)} ; ${m(`${thin(toNum(mul(kmB, q(100000))))} \\div ${thin(n)} = ${dn(cmB)}`)} cm.`,
          `c) ${m(`${pk}\\,\\text{km} = ${thin(pk * 100000)}\\,\\text{cm}`)} ; échelle ${m(`\\dfrac{${pc}}{${thin(pk * 100000)}} = \\dfrac{1}{${thin(toNum(scale))}}`)}.`,
        ],
        answer: `${m(dn(km))} km ; ${m(dn(cmB))} cm ; ${m(`1 : ${thin(toNum(scale))}`)}`,
        key: `e2:${n}:${toNum(cm)}:${toNum(kmB)}:${pc}:${pk}`,
        data: { kind: 'js', items: [{ what: 'km', js: `${toNum(cm)}*${n}/100000`, expect: toNum(km) }, { what: 'cm', js: `${toNum(kmB)}*100000/${n}`, expect: toNum(cmB) }, { what: 'n', js: `${pk}*100000/${pc}`, expect: toNum(scale) }] },
      };
    }
  },
};

// ===================================================================== trouver l'erreur
export const erreur: Generator = {
  id: 'erreur',
  title: 'Trouver l’erreur',
  desc: 'Pourcentages successifs, valeur de départ, taxi, heures et minutes.',
  stars: 2,
  levels: [2],
  example: '+10\\,\\% \\text{ puis } +10\\,\\% \\neq +20\\,\\%',
  course: LINKS.serieH,
  links: [LINKS.s44, LINKS.s12, LINKS.s3],
  generate(rng: Rng) {
    const kind = rng.pick(['succ', 'depart', 'taxi', 'heures'] as const);
    const name = rng.pick(NAMES);
    const R = {
      succ: 'Les pourcentages successifs ne s’additionnent pas : on multiplie les coefficients.',
      depart: 'Pour revenir au prix de départ, il faut diviser par le coefficient, pas appliquer l’évolution inverse.',
      taxi: 'Le prix n’est pas proportionnel à la distance (il y a une partie fixe).',
      heures: 'Une heure fait 60 minutes : les minutes ne s’écrivent pas directement après la virgule.',
    } as const;
    let quote = '', good: Q = q(0), wrong: Q = q(0), unit = '', sol: Rich[] = [], js = '', ask = '';
    switch (kind) {
      case 'succ': {
        const p = rng.pick([5, 10, 15, 20, 25, 30, 40, 50]);
        if (rng.chance(0.5)) {
          const c = mul(q(100 + p, 100), q(100 + p, 100));
          good = mul(sub(c, q(1)), q(100)); wrong = q(2 * p); unit = '%';
          quote = `« Un prix augmente de ${m(`${p}\\,\\%`)}, puis encore de ${m(`${p}\\,\\%`)} : en tout, il a augmenté de ${m(`${2 * p}\\,\\%`)}. »`;
          ask = 'Quelle est la vraie évolution totale, en % (avec son signe) ?';
          sol = [`La seconde hausse porte sur le prix déjà augmenté. Coefficient global : ${m(`${dn(q(100 + p, 100))} \\times ${dn(q(100 + p, 100))} = ${dn(c)}`)}, soit ${m(`+${pct(good)}`)}.`, `Contrôle sur ${m('100')} € : ${m(`100 \\to ${100 + p} \\to ${dn(mul(q(100), c))}`)} ✓.`];
          js = `((1+${p}/100)**2-1)*100`;
        } else {
          const c = mul(q(100 - p, 100), q(100 + p, 100));
          good = mul(sub(c, q(1)), q(100)); wrong = q(0); unit = '%';
          quote = `« Un prix baisse de ${m(`${p}\\,\\%`)}, puis augmente de ${m(`${p}\\,\\%`)} : on revient au prix de départ. »`;
          ask = 'Quelle est la vraie évolution totale, en % (avec son signe) ?';
          sol = [`La hausse porte sur le prix déjà baissé, plus petit. Coefficient global : ${m(`${dn(q(100 - p, 100))} \\times ${dn(q(100 + p, 100))} = ${dn(c)}`)}, soit ${m(`-${pct(mul(good, q(-1)))}`)}.`, `Contrôle sur ${m('100')} € : ${m(`100 \\to ${100 - p} \\to ${dn(mul(q(100), c))}`)} ✓.`];
          js = `((1-${p}/100)*(1+${p}/100)-1)*100`;
        }
        break;
      }
      case 'depart': {
        const p = rng.pick([10, 20, 25, 40, 50]);
        const Vd = q(rng.int(4, 30) * 10), Va = mul(Vd, q(100 - p, 100));
        good = Vd; wrong = mul(Va, q(100 + p, 100)); unit = '€';
        quote = `« Un jean soldé à ${m(`-${p}\\,\\%`)} coûte ${m(eu(Va))} €. Pour retrouver le prix de départ, j’ajoute ${m(`${p}\\,\\%`)} : ${m(`${eu(Va)} \\times ${dn(q(100 + p, 100))} = ${eu(wrong)}`)} €. »`;
        ask = 'Quel était le vrai prix de départ ?';
        sol = [`Les ${m(`${p}\\,\\%`)} de la baisse portaient sur le prix de départ, pas sur ${m(eu(Va))} €. Prix de départ ${m(`\\times ${dn(q(100 - p, 100))} = ${eu(Va)}`)}, donc prix de départ ${m(`= ${eu(Va)} \\div ${dn(q(100 - p, 100))} = ${eu(Vd)}`)} €.`, `Contrôle : ${m(`${eu(Vd)} \\times ${dn(q(100 - p, 100))} = ${eu(Va)}`)} ✓.`];
        js = `${toNum(Va)}/(1-${p}/100)`;
        break;
      }
      case 'taxi': {
        const b = rng.int(2, 6), k = q(rng.int(8, 20), 10), d1 = rng.pick([5, 8, 10, 12]), f = rng.pick([2, 3]);
        const p1 = add(q(b), mul(k, q(d1)));
        good = add(q(b), mul(k, q(f * d1))); wrong = mul(p1, q(f)); unit = '€';
        quote = `« Le taxi coûte ${m(eu(q(b)))} € de prise en charge plus ${m(eu(k))} € par km. ${m(`${d1}`)} km coûtent ${m(eu(p1))} €, donc ${m(`${f * d1}`)} km coûtent ${m(`${f} \\times ${eu(p1)} = ${eu(wrong)}`)} €. »`;
        ask = `Combien coûtent vraiment ${m(String(f * d1))} km ?`;
        sol = [`La prise en charge n’est payée qu’une fois : le prix n’est pas proportionnel à la distance.`, `${m(`${b} + ${dn(k)} \\times ${f * d1} = ${eu(good)}`)} € (et non ${m(eu(wrong))} €).`];
        js = `${b}+${toNum(k)}*${f * d1}`;
        break;
      }
      default: {
        const h = rng.int(1, 3), mn = rng.pick([15, 30, 45, 20, 40]), v = rng.pick([60, 80, 90, 120, 30, 45]);
        const t = add(q(h), q(mn, 60));
        good = mul(q(v), t); wrong = mul(q(v), q(100 * h + mn, 100)); unit = 'km';
        if (!isInt(good)) return erreur.generate(rng, 2);
        quote = `« ${m(hm(t))} à ${m(String(v))} km/h, cela fait ${m(`${v} \\times ${dn(q(100 * h + mn, 100))} = ${dn(wrong)}`)} km. »`;
        ask = 'Quelle est la vraie distance parcourue ?';
        sol = [`${m(`${mn}\\,\\text{min} = \\dfrac{${mn}}{60}\\,\\text{h} = ${dn(q(mn, 60))}\\,\\text{h}`)}, donc ${m(`${hm(t)} = ${dn(t)}\\,\\text{h}`)} (et non ${m(dn(q(100 * h + mn, 100)))} h).`, `${m(`${v} \\times ${dn(t)} = ${dn(good)}`)} km.`];
        js = `${v}*(${h}+${mn}/60)`;
      }
    }
    const bad = (Object.keys(R) as (keyof typeof R)[]).filter((k) => k !== kind).map((k) => [R[k], 'Non : ce n’est pas l’erreur commise ici. Relis le raisonnement.'] as [Rich, Rich]);
    return {
      title: 'Trouve l’erreur.',
      statement: `${name} affirme : ${quote}`,
      steps: [
        { prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, R[kind], bad), hint: 'Vérifie le raisonnement sur un exemple simple (100 €, 1 heure…).' },
        step(ask, [F('', good, unit)], 'Corrige le calcul.', mist(good, [[wrong, `C’est le résultat faux ${/^[AEIOUYÉ]/.test(name) ? 'd’' : 'de '}${name} : corrige son erreur.`]])),
      ],
      solution: sol,
      answer: `${R[kind]} ${m(`${dn(good)}`)} ${unit}`.replace(' %', '\u00a0%'),
      key: `err:${kind}:${quote}`,
      data: { kind: 'js', items: [{ what: 'good', js, expect: toNum(good) }] },
    };
  },
};
void FEM;
