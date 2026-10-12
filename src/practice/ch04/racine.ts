/** Racine carrée (★ → ★★★), problèmes (★★), trouver l'erreur (★★). */
import { type Q, q, mul, div, toNum } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, dn, numStep, shuffledChoice, NAMES } from '../engine/build';
import { LINKS, bg, pw, P10, sci, F, approxF, sciFields, sciJs } from './common';

const L = ['a', 'b', 'c', 'd'];
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const d1 = (x: number, dp = 1) => x.toFixed(dp).replace('.', '{,}');
const normSci = (a: Q, n: number): [Q, number] => { let x = a, e = n; while (toNum(x) >= 10) { x = div(x, q(10)); e++; } while (toNum(x) < 1) { x = mul(x, q(10)); e--; } return [x, e]; };

// ===================================================================== racine carrée
export const racine: Generator = {
  id: 'racine',
  title: 'Racine carrée',
  desc: 'Carrés parfaits ; encadrer et arrondir (★★) ; simplifier √50 = 5√2 (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '5 < \\sqrt{30} < 6 \\quad \\sqrt{30} \\approx 5{,}5',
  course: LINKS.s62,
  links: [LINKS.s61, LINKS.s63],
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const pool: Q[] = [];
      for (let k = 2; k <= 15; k++) pool.push(q(k));
      pool.push(q(5, 10), q(7, 10), q(12, 10), q(15, 10), q(3, 10), q(20), q(30), q(100), q(0));
      const [r1, r2] = rng.shuffle(pool).slice(0, 2);
      const steps: Step[] = [], sol: Rich[] = [], items: { what: string; js: string; expect: number }[] = [];
      [r1, r2].forEach((r, i) => {
        const A = mul(r, r);
        steps.push(numStep(`${L[i]}) Calcule ${m(`\\sqrt{${bg(A)}}`)} sans calculatrice.`, m(`\\sqrt{${bg(A)}} =`), r, `Cherche le nombre positif dont le carré vaut ${m(bg(A))}.`,
          [[div(A, q(2)), `La racine carrée n’est pas la moitié : cherche le nombre qui, **multiplié par lui-même**, donne ${m(bg(A))}.`], [r.n ? q(-r.n, r.d) : null, 'Une racine carrée est toujours positive.'], [r.d === 10 ? q(r.n, 100) : null, `${m(`${dn(q(r.n, 100))}^2 = ${dn(mul(q(r.n, 100), q(r.n, 100)))}`)} : vérifie en élevant au carré.`]], { form: 'decimal' }));
        sol.push(`${L[i]}) ${m(`\\sqrt{${bg(A)}} = ${dn(r)}`)} car ${m(`${dn(r)}^2 = ${bg(A)}`)} et ${m(`${dn(r)} \\geqslant 0`)}.`);
        items.push({ what: `r${i}`, js: `Math.sqrt(${toNum(A)})`, expect: toNum(r) });
      });
      const s = rng.int(3, 25), u = rng.pick(['cm', 'm', 'mm']);
      steps.push(numStep(`c) Un carré a une aire de ${m(`${bg(s * s)}\\,\\text{${u}}^2`)}. Quelle est la longueur de son côté ?`, 'Côté :', q(s), `Le côté ${m('c')} vérifie ${m(`c^2 = ${bg(s * s)}`)}.`, [[q(s * s, 4), 'L’aire n’est pas 4 fois le côté (c’est le périmètre) : aire = côté × côté.'], [q(s * s, 2), 'Ce n’est pas la moitié : cherche le nombre qui, multiplié par lui-même, donne l’aire.']], { unit: u }));
      sol.push(`c) ${m(`c = \\sqrt{${bg(s * s)}} = ${s}`)} ${u}. Contrôle : ${m(`${s} \\times ${s} = ${bg(s * s)}`)} ✓.`);
      items.push({ what: 'c', js: `Math.sqrt(${s * s})`, expect: s });
      return { title: 'Racines carrées.', steps, solution: sol, answer: `${m(dn(r1))} ; ${m(dn(r2))} ; ${m(String(s))} ${u}`, key: `${dn(r1)}|${dn(r2)}|${s}${u}`, data: { kind: 'js', items } };
    }
    if (level === 2) {
      let N: number;
      do { N = rng.int(5, 230); } while (Number.isInteger(Math.sqrt(N)));
      const lo = Math.floor(Math.sqrt(N)), r = Math.sqrt(N);
      let A: number;
      do { A = rng.int(8, 400); } while (Number.isInteger(Math.sqrt(A)) || A === N);
      const u = rng.pick(['m', 'cm']);
      return {
        title: 'Encadrer et arrondir une racine carrée.',
        steps: [
          step(`a) Encadre ${m(`\\sqrt{${N}}`)} entre deux entiers consécutifs.`, [F('', q(lo), undefined, { label: '' }), F(m(`< \\sqrt{${N}} <`), q(lo + 1))], `Cherche les deux carrés parfaits qui encadrent ${m(String(N))}.`,
            [{ on: 'numAll', values: [q(lo * lo), q((lo + 1) ** 2)], msg: `Ce sont les carrés parfaits ; il faut leurs racines : ${m(`\\sqrt{${lo * lo}} = ${lo}`)}…` }, ...(Math.floor(N / 2) === lo ? [] : [{ on: 'numAll' as const, values: [q(Math.floor(N / 2)), q(Math.floor(N / 2) + 1)], msg: 'La racine carrée n’est pas la moitié.' }])]),
          step(`b) Donne l’arrondi au dixième de ${m(`\\sqrt{${N}}`)} (calculatrice).`, [approxF(m(`\\sqrt{${N}} \\approx`), r, 1)], 'Touche √ de la calculatrice, puis arrondis au dixième (regarde le chiffre des centièmes).',
            Math.round(r * 10) !== Math.floor(r * 10) ? [{ on: 'num', value: q(Math.floor(r * 10), 10), msg: `Le chiffre des centièmes est ${Math.floor(r * 100) % 10} : on arrondit **au-dessus**.` }] : []),
          step(`c) Un carré a une aire de ${m(`${A}\\,\\text{${u}}^2`)}. Quelle est la longueur de son côté, arrondie au dixième ?`, [approxF('Côté :', Math.sqrt(A), 1, u)], `Côté = ${m(`\\sqrt{\\text{aire}}`)}.`, [{ on: 'num', value: q(A, 4), msg: 'L’aire n’est pas 4 × côté : aire = côté × côté.' }]),
        ],
        solution: [
          `a) ${m(`${lo * lo} < ${N} < ${(lo + 1) ** 2}`)}, c’est-à-dire ${m(`${lo}^2 < ${N} < ${lo + 1}^2`)}, donc ${m(`${lo} < \\sqrt{${N}} < ${lo + 1}`)}.`,
          `b) ${m(`\\sqrt{${N}} \\approx ${d1(r, 3)}\\ldots`)} ; au dixième : ${m(`\\sqrt{${N}} \\approx ${d1(Math.round(r * 10) / 10)}`)}. Contrôle : ${m(`${d1(Math.round(r * 10) / 10)}^2 = ${d1((Math.round(r * 10) / 10) ** 2, 2)}`)}, proche de ${m(String(N))} ✓.`,
          `c) ${m(`c = \\sqrt{${A}} \\approx ${d1(Math.sqrt(A), 3)}\\ldots`)}, soit environ ${m(d1(Math.round(Math.sqrt(A) * 10) / 10))} ${u}.`,
        ],
        answer: `${m(`${lo} < \\sqrt{${N}} < ${lo + 1}`)} ; ${m(d1(Math.round(r * 10) / 10))} ; ${m(d1(Math.round(Math.sqrt(A) * 10) / 10))} ${u}`,
        key: `${N}|${A}${u}`,
        data: { kind: 'js', items: [{ what: 'lo', js: `Math.floor(Math.sqrt(${N}))`, expect: lo }, { what: 'hi', js: `Math.ceil(Math.sqrt(${N}))`, expect: lo + 1 }, { what: 'r', js: `Math.sqrt(${N})`, expect: r, tol: 1e-9 }, { what: 'c', js: `Math.sqrt(${A})`, expect: Math.sqrt(A), tol: 1e-9 }] },
      };
    }
    // ★★★ : simplifier a√b, produit de racines
    const b = rng.pick([2, 3, 5, 6, 7, 10, 11]), k = rng.int(2, 10);
    const N = k * k * b;
    const x = rng.pick([2, 3, 5, 6, 8, 12]);
    const ys = [2, 3, 6, 8, 12, 18, 27, 32, 50, 75].filter((y) => Number.isInteger(Math.sqrt(x * y)) && y !== x);
    const y = ys.length ? rng.pick(ys) : x * 4;
    const pr = Math.sqrt(x * y);
    return {
      title: 'Simplifier des racines carrées.',
      steps: [
        step(`a) Écris ${m(`\\sqrt{${N}}`)} sous la forme ${m('a\\sqrt{b}')}, avec ${m('b')} entier le plus petit possible.`, [F(m('a ='), q(k)), F(m('b ='), q(b))], `Cherche le plus grand carré parfait qui divise ${m(String(N))}.`,
          [...[2, 3, 4, 5].filter((s) => k % s === 0 && s < k).map((s) => ({ on: 'numAll' as const, values: [q(s), q((N / (s * s)))], msg: `C’est juste, mais pas simplifié au maximum : ${m(`${N / (s * s)}`)} contient encore un carré parfait.` })), { on: 'numAll', values: [q(k * k), q(b)], msg: `${m(`\\sqrt{${k * k}} = ${k}`)} : on sort la **racine** du carré parfait.` }]),
        numStep(`b) Calcule ${m(`\\sqrt{${x}} \\times \\sqrt{${y}}`)}.`, m(`\\sqrt{${x}} \\times \\sqrt{${y}} =`), q(pr), `${m('\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}')}.`, [[q(x * y), `Il reste à prendre la racine : ${m(`\\sqrt{${x * y}}`)}.`]]),
      ],
      solution: [`a) ${m(`\\sqrt{${N}} = \\sqrt{${k * k} \\times ${b}} = \\sqrt{${k * k}} \\times \\sqrt{${b}} = ${k}\\sqrt{${b}}`)}.`, `b) ${m(`\\sqrt{${x}} \\times \\sqrt{${y}} = \\sqrt{${x * y}} = ${pr}`)}.`],
      answer: `${m(`${k}\\sqrt{${b}}`)} ; ${m(String(pr))}`,
      key: `${N}|${x}*${y}`,
      data: { kind: 'js', items: [{ what: 'a', js: `Math.sqrt(${N})/Math.sqrt(${b})`, expect: k }, { what: 'b', js: `((n)=>{for(let k=Math.floor(Math.sqrt(n));k>1;k--)if(n%(k*k)===0)return n/(k*k);return n})(${N})`, expect: b }, { what: 'b', js: `Math.sqrt(${x})*Math.sqrt(${y})`, expect: pr }] },
    };
  },
};

// ===================================================================== problèmes
export const probleme: Generator = {
  id: 'probleme',
  title: 'Problèmes',
  desc: 'Lumière, bactéries, pliages, terrain carré : puissances et notation scientifique en situation.',
  stars: 2,
  levels: [2],
  example: '\\dfrac{1{,}5 \\times 10^8}{3 \\times 10^5} = 500\\,\\text{s}',
  course: LINKS.serieJ,
  links: [LINKS.s52, LINKS.s62],
  generate(rng: Rng) {
    const kind = rng.pick(['lumiere', 'bacteries', 'pliage', 'terrain']);
    if (kind === 'lumiere') {
      const t = rng.pick([1, 2, 3, 5, 10, 30]);
      const [da, dn_] = normSci(q(3 * t * 60), 5);
      const [nm, A, e] = rng.pick([['le Soleil', q(15, 10), 8], ['Mars (au plus près)', q(54, 10), 7], ['la Lune', q(384, 100), 5], ['Vénus (au plus près)', q(42, 10), 7], ['Jupiter (au plus près)', q(63, 10), 8]] as [string, Q, number][]);
      const secs = div(mul(A, P10(e)), mul(q(3), P10(5)));
      return {
        title: 'La vitesse de la lumière.',
        form: 'Notation scientifique : $a \\times 10^n$ avec $1 \\leqslant a < 10$.',
        statement: `La lumière parcourt environ ${m('3 \\times 10^5')} km par seconde.`,
        steps: [
          { prompt: `a) Quelle distance parcourt-elle en ${t === 1 ? 'une minute' : `${t} minutes`} ? (en km, notation scientifique)`, answer: { kind: 'num', fields: sciFields(da, dn_) }, hint: `${t === 1 ? 'Une minute' : `${t} minutes`} = ${m(String(60 * t))} s : multiplie ${m('3 \\times 10^5')} par ${m(String(60 * t))}.`, mistakes: [{ on: 'numAll', values: [q(3 * t), q(5)], msg: 'La vitesse est donnée **par seconde** : convertis les minutes en secondes.' }] },
          numStep(`b) ${nm[0].toUpperCase() + nm.slice(1)} est à environ ${m(`${sci(A, e)}`)} km de la Terre. Combien de secondes met sa lumière pour nous parvenir ? (arrondi à l’unité)`, 'Durée :', q(Math.round(toNum(secs))), 'Durée = distance ÷ vitesse : divise les nombres, puis les puissances de 10.', [[q(Math.round(toNum(mul(A, P10(e))) * 3e5)), 'Durée = distance ÷ vitesse (on divise).']], { unit: 's', shown: bg(Math.round(toNum(secs))) }),
        ],
        solution: [
          `a) ${m(`3 \\times 10^5 \\times ${60 * t} = ${dn(q(3 * 60 * t))} \\times 10^5 = ${sci(da, dn_)}`)} km.`,
          `b) ${m(`\\dfrac{${sci(A, e)}}{3 \\times 10^5} = ${dn(div(A, q(3)))}\\ldots \\times 10^{${e - 5}}`)} ${m(`\\approx ${bg(Math.round(toNum(secs)))}`)} s${toNum(secs) >= 120 ? `, soit environ ${m(String(Math.round(toNum(secs) / 60)))} min` : ''}.`,
        ],
        answer: `${m(sci(da, dn_))} km ; ${m(bg(Math.round(toNum(secs))))} s`,
        key: `lum:${t}:${nm}`,
        data: { kind: 'js', items: [...sciJs(`3e5*60*${t}`, da, dn_), { what: 't', js: `Math.round(${toNum(A)}e${e}/3e5)`, expect: Math.round(toNum(secs)) }] },
      };
    }
    if (kind === 'bacteries') {
      const per = rng.pick([10, 15, 20, 30]), h = rng.pick(per === 10 ? [2, 3] : per === 15 ? [3, 4] : per === 20 ? [4, 5, 6] : [6, 8, 10]);
      const N0 = rng.pick([1, 1, 2, 3, 5, 10, 20, 50]);
      const k = (h * 60) / per, N = N0 * 2 ** k;
      const [a, n] = [N / 10 ** Math.floor(Math.log10(N)), Math.floor(Math.log10(N))];
      if (Math.round(a * 10) >= 100) return probleme.generate(rng, 2);
      const one = N0 === 1;
      return {
        title: 'Une population de bactéries.',
        form: 'Notation scientifique : $a \\times 10^n$ avec $1 \\leqslant a < 10$.',
        statement: `Une bactérie se divise en deux toutes les ${m(String(per))} minutes. On part ${one ? 'd’une seule bactérie' : `de ${m(String(N0))} bactéries`}.`,
        steps: [
          numStep(`a) Combien de divisions y a-t-il en ${m(String(h))} heures ?`, '', q(k), `${m(String(h))} h = ${m(String(h * 60))} min.`, [[q(h * 60), `C’est la durée en minutes ; une division a lieu toutes les ${per} minutes.`], [q(h * 100, per), 'Une heure fait 60 minutes, pas 100.']]),
          numStep('b) Combien y a-t-il alors de bactéries ? (écriture décimale)', '', q(N), `Chaque division double le nombre : ${m(`${N0} \\times 2 \\times 2 \\times \\cdots = ${one ? '' : `${N0} \\times `}2^{${k}}`)}.`, [[q(N0 * 2 * k), `On double ${k} fois : c’est ${m(`2^{${k}}`)}, pas ${m(`2 \\times ${k}`)}.`], [q(N0 * 2 ** (k - 1)), 'Une division de moins.'], [one ? null : q(2 ** k), `On part de ${N0} bactéries, pas d’une seule.`]], { shown: bg(N) }),
          step('c) Donne ce nombre en notation scientifique, avec ' + m('a') + ' arrondi au dixième.', [approxF(m('a \\approx'), a, 1), F(m('n ='), q(n))], 'Un seul chiffre avant la virgule, puis arrondis au dixième.'),
        ],
        solution: [`a) ${m(`${h}\\,\\text{h} = ${h * 60}\\,\\text{min}`)} ; ${m(`${h * 60} \\div ${per} = ${k}`)} divisions.`, `b) ${m(`${one ? '' : `${N0} \\times `}2^{${k}} = ${bg(N)}`)} bactéries.`, `c) ${m(`${bg(N)} \\approx ${d1(Math.round(a * 10) / 10)} \\times 10^{${n}}`)}.`],
        answer: `${m(String(k))} ; ${m(bg(N))} ; ${m(`${d1(Math.round(a * 10) / 10)} \\times 10^{${n}}`)}`,
        key: `bac:${per}:${h}:${N0}`,
        data: { kind: 'js', items: [{ what: 'k', js: `${h}*60/${per}`, expect: k }, { what: 'N', js: `${N0}*2**(${h}*60/${per})`, expect: N }, ...sciJs(`${N0}*2**(${h}*60/${per})`, q(Math.round(a * 1e6), 1e6), n)] },
      };
    }
    if (kind === 'pliage') {
      const k = rng.int(5, 11), ep = rng.pick([q(1, 10), q(8, 100), q(5, 100)]);
      const E = mul(ep, q(2 ** k));
      return {
        title: 'Plier une feuille.',
        statement: `Une feuille de papier a une épaisseur de ${m(`${dn(ep)}\\,\\text{mm}`)}. On la plie en deux, puis encore en deux, etc. (on suppose que c’est possible).`,
        steps: [
          numStep(`a) Par combien l’épaisseur est-elle multipliée après ${m(String(k))} pliages ?`, '', q(2 ** k), `Chaque pliage **double** l’épaisseur : ${m(`2 \\times 2 \\times \\cdots`)} (${k} facteurs).`, [[q(2 * k), `${k} pliages : ${m(`2^{${k}}`)}, pas ${m(`2 \\times ${k}`)}.`]], { shown: bg(2 ** k) }),
          numStep(`b) Quelle est alors l’épaisseur, en mm ?`, 'Épaisseur :', E, `Multiplie ${m(dn(ep))} par ${m(`2^{${k}}`)}.`, [[mul(ep, q(2 * k)), `${m(`2^{${k}}`)} n’est pas ${m(`2 \\times ${k}`)}.`]], { unit: 'mm', form: 'decimal', shown: bg(E) }),
        ],
        solution: [`a) ${m(`2^{${k}} = ${bg(2 ** k)}`)}.`, `b) ${m(`${dn(ep)} \\times ${bg(2 ** k)} = ${bg(E)}`)} mm, soit environ ${m(d1(toNum(E) / 10, 1))} cm.`],
        answer: `${m(bg(2 ** k))} ; ${m(bg(E))} mm`,
        key: `pl:${k}:${dn(ep)}`,
        data: { kind: 'js', items: [{ what: 'f', js: `2**${k}`, expect: 2 ** k }, { what: 'E', js: `${toNum(ep)}*2**${k}`, expect: toNum(E), tol: 1e-9 }] },
      };
    }
    for (;;) {
      const c = rng.pick([20, 25, 30, 40, 45, 50, 60, 70, 75, 80, 90, 100, 120]);
      const g = rng.pick([q(2), q(25, 10), q(4), q(5), q(15, 10), q(3)]);
      const P = 4 * c, nP = toNum(div(q(P), g));
      if (!Number.isInteger(nP)) continue;
      const who = rng.pick(NAMES);
      return {
        title: 'Clôturer un terrain carré.',
        statement: `${who} veut clôturer un terrain carré d’aire ${m(`${bg(c * c)}\\,\\text{m}^2`)}, avec un poteau tous les ${m(dn(g))} m (le premier poteau est aussi le dernier).`,
        steps: [
          numStep('a) Quelle est la longueur du côté ?', 'Côté :', q(c), `Côté = ${m(`\\sqrt{${bg(c * c)}}`)}.`, [[q(c * c, 4), 'L’aire n’est pas 4 × côté : aire = côté × côté.']], { unit: 'm' }),
          numStep('b) Quel est le périmètre ?', 'Périmètre :', q(P), 'Le carré a quatre côtés égaux.', [[q(c * c), 'C’est l’aire : on veut le tour du terrain.']], { unit: 'm' }),
          numStep('c) Combien faut-il de poteaux ?', '', q(nP), `Divise le périmètre par ${m(dn(g))}. Sur un tour fermé, il y a autant de poteaux que d’intervalles.`, [[q(nP + 1), 'Sur un tour **fermé**, le premier poteau est aussi le dernier : pas de poteau en plus.'], [q(nP + 4), 'Les coins ne demandent pas de poteau en plus : sur un tour fermé, autant de poteaux que d’intervalles.']]),
        ],
        solution: [`a) ${m(`\\sqrt{${bg(c * c)}} = ${c}`)} m.`, `b) ${m(`4 \\times ${c} = ${P}`)} m.`, `c) ${m(`${P} \\div ${dn(g)} = ${nP}`)} intervalles, donc ${m(String(nP))} poteaux (tour fermé).`],
        answer: `${m(String(c))} m ; ${m(String(P))} m ; ${m(String(nP))} poteaux`,
        key: `ter:${c}:${dn(g)}`,
        data: { kind: 'js', items: [{ what: 'c', js: `Math.sqrt(${c * c})`, expect: c }, { what: 'P', js: `4*Math.sqrt(${c * c})`, expect: P }, { what: 'n', js: `4*Math.sqrt(${c * c})/${toNum(g)}`, expect: nP }] },
      };
    }
  },
};

// ===================================================================== trouver l'erreur
const R = {
  mult: 'Une puissance n’est pas une multiplication par l’exposant.',
  neg: 'Un exposant négatif ne donne pas un nombre négatif : il donne l’inverse.',
  somme: 'Les règles de calcul sur les puissances ne valent pas pour une somme.',
  sci: 'Ce n’est pas une notation scientifique : le nombre devant doit être entre 1 et 10.',
  rac: 'La racine d’une somme n’est pas la somme des racines.',
  prod: 'Dans un produit de même base, on additionne les exposants (on ne les multiplie pas).',
} as const;
export const erreur: Generator = {
  id: 'erreur',
  title: 'Trouver l’erreur',
  desc: 'Les pièges du chapitre : 2³ = 6, 10⁻² = −100, 2³ + 2⁴ = 2⁷, √(9 + 16) = 7…',
  stars: 2,
  levels: [2],
  example: '\\sqrt{9 + 16} \\neq \\sqrt{9} + \\sqrt{16}',
  course: LINKS.serieH,
  generate(rng: Rng) {
    const kind = rng.pick(Object.keys(R) as (keyof typeof R)[]);
    const who = rng.pick(NAMES);
    let extra: { what: string; js: string; expect: number; tol?: number }[] = [];
    let quote = '', ask: Step, sol: Rich[] = [], ans = '', js = '', expect = 0, key = '';
    switch (kind) {
      case 'mult': {
        const a = rng.int(2, 6), n = rng.int(3, a <= 3 ? 6 : 4);
        quote = m(`${a}^{${n}} = ${a * n}`); key = quote;
        ask = numStep(`Que vaut vraiment ${m(`${a}^{${n}}`)} ?`, m(`${a}^{${n}} =`), q(a ** n), `${n} facteurs égaux à ${a}.`, [[q(a * n), `C’est l’erreur de ${who}.`]]);
        sol = [`${m(`${a}^{${n}} = ${Array(n).fill(a).join(' \\times ')} = ${a ** n}`)}, et non ${m(`${a} \\times ${n} = ${a * n}`)}.`];
        ans = m(String(a ** n)); js = `${a}**${n}`; expect = a ** n;
        break;
      }
      case 'neg': {
        const b = rng.pick([10, 10, 2, 5]), n = b === 10 ? rng.int(1, 6) : b === 2 ? rng.int(2, 5) : rng.int(1, 3);
        const P = b ** n;
        quote = m(`${b}^{-${n}} = -${bg(P)}`); key = quote;
        ask = numStep(`Que vaut vraiment ${m(`${b}^{-${n}}`)} ? (écriture décimale)`, m(`${b}^{-${n}} =`), q(1, P), `${m(`${b}^{-${n}} = \\dfrac{1}{${b}^{${n}}}`)}.`, [[q(-P), `C’est l’erreur de ${who}.`]], { form: 'decimal' });
        sol = [`${m(`${b}^{-${n}} = \\dfrac{1}{${bg(P)}} = ${dn(q(1, P))}`)} : un nombre positif, plus petit que 1.`];
        ans = m(dn(q(1, P))); js = `${b}**-${n}`; expect = 1 / P;
        break;
      }
      case 'somme': {
        const a = rng.pick([2, 3]), p = rng.int(2, 4), r = p + rng.int(1, 2);
        quote = m(`${a}^{${p}} + ${a}^{${r}} = ${a}^{${p + r}}`); key = quote;
        ask = numStep(`Que vaut vraiment ${m(`${a}^{${p}} + ${a}^{${r}}`)} ?`, '', q(a ** p + a ** r), 'Calcule chaque puissance, puis additionne.', [[q(a ** (p + r)), `C’est ${m(`${a}^{${p + r}}`)}, l’erreur de ${who}.`]]);
        sol = [`${m(`${a}^{${p}} + ${a}^{${r}} = ${a ** p} + ${a ** r} = ${a ** p + a ** r}`)}, alors que ${m(`${a}^{${p + r}} = ${bg(a ** (p + r))}`)}.`];
        ans = m(String(a ** p + a ** r)); js = `${a}**${p}+${a}**${r}`; expect = a ** p + a ** r;
        break;
      }
      case 'sci': {
        const mm = rng.pick([rng.int(11, 99), rng.int(101, 999)]), k = rng.pick([-5, -3, 2, 3, 4, 6]);
        const [a, n] = normSci(q(mm), k);
        quote = `« ${m(`${mm} \\times 10^{${k}}`)} est en notation scientifique. »`; key = quote;
        ask = { prompt: `Écris ${m(`${mm} \\times 10^{${k}}`)} en notation scientifique (${m('a \\times 10^n')}).`, answer: { kind: 'num', fields: sciFields(a, n) }, hint: `${m(`${mm} = ${sci(a, n - k)}`)}.`, mistakes: [{ on: 'numAll', values: [a, q(k)], msg: 'Le nombre devant a changé : il faut corriger l’exposant.' }] };
        sol = [`${m(String(mm))} n’est pas compris entre ${m('1')} et ${m('10')}. ${m(`${mm} \\times 10^{${k}} = ${sci(a, n - k)} \\times 10^{${k}} = ${sci(a, n)}`)}.`];
        ans = m(sci(a, n)); js = `Math.floor(Math.log10(${mm}*10**${k})+1e-12)`; expect = n; extra = sciJs(`${mm}*10**${k}`, a, n);
        break;
      }
      case 'rac': {
        const [p0, q0, r0] = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 12, 15]]);
        const kk = rng.int(1, p0 >= 7 ? 2 : 5);
        const [x, y] = rng.shuffle([(kk * p0) ** 2, (kk * q0) ** 2]), z = kk * r0;
        quote = m(`\\sqrt{${x} + ${y}} = \\sqrt{${x}} + \\sqrt{${y}} = ${Math.sqrt(x) + Math.sqrt(y)}`); key = quote;
        ask = numStep(`Que vaut vraiment ${m(`\\sqrt{${x} + ${y}}`)} ?`, '', q(z), 'Calcule d’abord la somme sous la racine.', [[q(Math.sqrt(x) + Math.sqrt(y)), `C’est l’erreur de ${who}.`]]);
        sol = [`${m(`\\sqrt{${x} + ${y}} = \\sqrt{${x + y}} = ${z}`)}, alors que ${m(`\\sqrt{${x}} + \\sqrt{${y}} = ${Math.sqrt(x)} + ${Math.sqrt(y)} = ${Math.sqrt(x) + Math.sqrt(y)}`)}.`];
        ans = m(String(z)); js = `Math.sqrt(${x}+${y})`; expect = z;
        break;
      }
      default: {
        const a = rng.int(2, 7), b = rng.int(2, 7);
        quote = m(`10^{${a}} \\times 10^{${b}} = 10^{${a * b}}`); key = quote;
        ask = numStep(`Écris correctement ${m(`10^{${a}} \\times 10^{${b}}`)} sous la forme ${m('10^n')}.`, m('n ='), q(a + b), 'Compte les facteurs 10.', [[q(a * b), `C’est l’erreur de ${who}.`]]);
        sol = [`${m(`10^{${a}} \\times 10^{${b}}`)} : ${a} facteurs 10, puis ${b} facteurs 10, soit ${a + b} facteurs : ${m(`10^{${a + b}}`)}.`];
        ans = m(`10^{${a + b}}`); js = `Math.round(Math.log10(10**${a}*10**${b}))`; expect = a + b;
      }
    }
    const bad = (Object.keys(R) as (keyof typeof R)[]).filter((k) => k !== kind).map((k) => [R[k], 'Non : ce n’est pas l’erreur commise ici. Relis l’égalité.'] as [Rich, Rich]);
    const pickBad = rng.shuffle(bad).slice(0, 3);
    return {
      title: 'Trouve l’erreur.',
      statement: `${who} écrit : ${quote.startsWith('«') ? quote : `« ${quote} »`}`,
      steps: [{ prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, R[kind], pickBad), hint: 'Reviens à la définition (facteurs, inverse, carré…).' }, ask],
      solution: [R[kind], ...sol],
      answer: `${R[kind]} ${ans}`,
      key,
      data: { kind: 'js', items: [{ what: 'v', js, expect, tol: 1e-12 }, ...extra] },
    };
  },
};
void pw;
