/** Chapitre 16 : effectifs et fréquences, diagramme circulaire, bâtons, moyenne, moyenne « à rebours », médiane et étendue, classes, interpréter, erreurs. */
import type { Generator, Level, Rich, Step, NumField } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, NAMES } from '../engine/build';
import { mul, div, eq } from '../engine/q';
import { LINKS, m, dn, ax, safe, exactF, valF, isDec, eqOrApprox, pct, table, tt, barSvg, pieSvg, q, toNum, type Q } from './common';

export type Item = { what: string; js: string; expect: number; tol?: number };
export const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Step['mistakes'] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
export const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
export const A = (a: number[]) => `[${a.join(',')}]`;
export const JS_SUM = (a: number[]) => `${A(a)}.reduce((s,v)=>s+v,0)`;
export const JS_MED = (a: number[]) => `((t)=>{t=[...t].sort((x,y)=>x-y);const n=t.length;return n%2?t[(n-1)/2]:(t[n/2-1]+t[n/2])/2;})(${A(a)})`;
/** Médiane exacte d'une liste. */
export function median(a: number[]): Q { const t = [...a].sort((x, y) => x - y), n = t.length; return n % 2 ? q(t[(n - 1) / 2]) : q(t[n / 2 - 1] + t[n / 2], 2); }
/** Série développée à partir d'un tableau d'effectifs. */
export const expand = (vals: number[], eff: number[]) => vals.flatMap((v, i) => Array(eff[i]).fill(v) as number[]);
/** k effectifs entre lo et hi, de somme N. */
export function partition(rng: Rng, N: number, k: number, lo = 2, hi = Math.floor(N / 2)): number[] {
  for (;;) {
    const c = Array.from({ length: k - 1 }, () => rng.int(lo, hi));
    const last = N - sum(c);
    if (last >= lo && last <= hi && new Set([...c, last]).size >= Math.min(k - 1, 4)) return rng.shuffle([...c, last]);
  }
}
export const ord = (n: number) => m(`${n}^{\\text{e}}`);
export const plural = (n: number, s: string, p = `${s}s`) => `${n} ${n > 1 ? p : s}`;
/** Arrondi exact (Q) au 10^-dp. */
export function rq(v: Q, dp: number): Q { return q(Math.round(toNum(v) * 10 ** dp), 10 ** dp); }
export const okRound = (v: Q, dp: number) => isDec(v, dp) || safe(toNum(v), dp);
export const show = (v: Q, dp: number) => (isDec(v, dp) ? dn(v) : `≈ ${ax(toNum(v), dp)}`);
export const corr = (s: Step) => (s.answer as { correct: number }).correct;
export function texFrac(f: Q) { return f.d === 1 ? String(f.n) : `\\dfrac{${f.n}}{${f.d}}`; }
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
/** « de élèves » → « d’élèves ». */
export const de = (w: string) => (/^[aeiouyéèêh]/i.test(w) ? `d’${w}` : `de ${w}`);
const FEM = new Set(['Ana', 'Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina', 'Sarah', 'Maëlle', 'Amina']);
export const pron = (nm: string) => (FEM.has(nm) ? 'elle' : 'il');

export const QUALI: { car: string; pop: string; cats: string[] }[] = [
  { car: 'moyen de transport pour venir au collège', pop: 'élèves', cats: ['à pied', 'bus', 'voiture', 'vélo', 'train'] },
  { car: 'sport préféré', pop: 'élèves', cats: ['football', 'basket', 'natation', 'danse', 'tennis'] },
  { car: 'style de musique préféré', pop: 'jeunes', cats: ['rap', 'pop', 'rock', 'classique', 'électro'] },
  { car: 'animal de compagnie', pop: 'familles', cats: ['chat', 'chien', 'poisson', 'lapin', 'aucun'] },
  { car: 'fruit préféré', pop: 'enfants', cats: ['pomme', 'banane', 'fraise', 'orange', 'kiwi'] },
  { car: 'parfum de glace choisi', pop: 'clients', cats: ['vanille', 'chocolat', 'fraise', 'citron', 'pistache'] },
];
export const QUANTI: { car: string; pop: string; vals: number[]; axis: string; ind: string; le: string }[] = [
  { le: 'le', car: 'nombre de frères et sœurs', pop: 'élèves', vals: [0, 1, 2, 3, 4], axis: 'frères et sœurs', ind: 'élèves' },
  { le: 'le', car: 'nombre de buts marqués par match', pop: 'matchs', vals: [0, 1, 2, 3, 4, 5], axis: 'buts', ind: 'matchs' },
  { le: 'le', car: 'nombre de livres lus pendant l’été', pop: 'élèves', vals: [0, 1, 2, 3, 4, 5], axis: 'livres', ind: 'élèves' },
  { le: 'la', car: 'pointure', pop: 'élèves', vals: [36, 37, 38, 39, 40, 41], axis: 'pointure', ind: 'élèves' },
  { le: 'la', car: 'note à l’interrogation (sur 10)', pop: 'élèves', vals: [4, 5, 6, 7, 8, 9, 10], axis: 'note', ind: 'élèves' },
  { le: 'le', car: 'nombre de personnes par voiture', pop: 'voitures', vals: [1, 2, 3, 4, 5], axis: 'personnes', ind: 'voitures' },
];
const effTable = (head: string, vals: (string | number)[], eff: (string | number)[]) => table([[tt(head), ...vals.map((v) => (typeof v === 'number' ? String(v) : tt(v)))], [tt('Effectif'), ...eff.map(String)]]);

// ===================================================================== effectifs et fréquences
export const frequences: Generator = {
  id: 'frequences', title: 'Effectifs et fréquences', stars: 1, levels: [1, 2], course: LINKS.s1,
  desc: 'Effectif total, fréquence en décimal et en pourcentage ; ★★ : compléter un tableau, retrouver un effectif.',
  example: '\\dfrac{9}{25} = 0{,}36 = 36\\,\\%',
  generate(rng: Rng, level: Level) {
    const ctx = rng.pick(QUALI), N = rng.pick([20, 25, 40, 50]), k = rng.int(4, 5), cats = ctx.cats.slice(0, k);
    const eff = partition(rng, N, k, 2, Math.floor(N / 2));
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const i = rng.int(0, k - 1), f = q(eff[i], N), p = mul(f, q(100));
    if (level === 1) {
      const display = effTable('Réponse', cats, eff);
      steps.push(step('a) Quel est l’effectif total ?', [exactF(m('N ='), q(N))], 'Additionne tous les effectifs.', mist(q(N), [[q(k), 'C’est le nombre de catégories, pas le nombre d’individus.']])));
      steps.push(step(`b) Fréquence de la réponse « ${cats[i]} », en écriture décimale ?`, [exactF('', f)], `Fréquence = effectif ÷ effectif total = ${m(`\\dfrac{${eff[i]}}{${N}}`)}.`, mist(f, [[q(N, eff[i]), 'Inversé : effectif de la valeur ÷ effectif total.'], [q(eff[i]), 'Ça, c’est l’effectif : divise par l’effectif total.']])));
      steps.push(step('c) La même fréquence en pourcentage ?', [exactF('', p, '%')], 'Multiplie la fréquence par 100.', mist(p, [[f, 'En pourcentage : multiplie par 100.']])));
      items.push({ what: 'N', js: JS_SUM(eff), expect: N }, { what: 'f', js: `${eff[i]}/${JS_SUM(eff)}`, expect: toNum(f) }, { what: 'p', js: `100*${eff[i]}/${JS_SUM(eff)}`, expect: toNum(p) });
      sol.push(`${m(`N = ${eff.join(' + ')} = ${N}`)}.`, `Fréquence de « ${cats[i]} » : ${m(`\\dfrac{${eff[i]}}{${N}} = ${dn(f)}`)}, soit ${m(pct(p))}.`, 'Contrôle : la somme des fréquences vaut 1 (100 %).');
      return { title: `Sondage : ${ctx.car}.`, statement: `On a interrogé des ${ctx.pop} sur leur ${ctx.car}.`, display, steps, solution: sol, answer: `${N} ; ${dn(f)} ; ${dn(p)} %`, key: display + i, data: { kind: 'js', items } };
    }
    if (rng.chance(0.5)) {
      const j = (i + 1 + rng.int(0, k - 2)) % k;
      const display = table([[tt('Réponse'), ...cats.map(tt), tt('Total')], [tt('Effectif'), ...eff.map((v, t) => (t === j ? '?' : String(v))), String(N)]]);
      steps.push(step(`a) Effectif de « ${cats[j]} » ?`, [exactF('', q(eff[j]))], 'Effectif total moins la somme des autres effectifs.', mist(q(eff[j]), [[q(N - eff[j]), 'Ça, c’est la somme des autres effectifs : soustrais-la de l’effectif total.']])));
      steps.push(step(`b) Fréquence de « ${cats[i]} » en pourcentage ?`, [exactF('', p, '%')], `${m(`\\dfrac{${eff[i]}}{${N}} \\times 100`)}.`, mist(p, [[q(eff[i]), 'Ça, c’est l’effectif : divise par l’effectif total, puis ×100.'], [f, 'Pense à multiplier par 100.']])));
      items.push({ what: 'ej', js: `${N}-(${JS_SUM(eff)}-${eff[j]})`, expect: eff[j] }, { what: 'p', js: `100*${eff[i]}/${N}`, expect: toNum(p) });
      sol.push(`${m(`${N} - ${eff.filter((_, t) => t !== j).join(' - ')} = ${eff[j]}`)}.`, `« ${cats[i]} » : ${m(`\\dfrac{${eff[i]}}{${N}} \\times 100 = ${pct(p)}`)}.`);
      return { title: 'Compléter le tableau.', statement: `${cap(ctx.car)} de ${m(String(N))} ${ctx.pop} :`, display, steps, solution: sol, answer: `${eff[j]} ; ${dn(p)} %`, key: display + i, data: { kind: 'js', items } };
    }
    const tot = rng.pick([40, 60, 80, 120, 150, 200, 240, 300, 400, 500]);
    const fr = rng.pick([q(1, 4), q(1, 5), q(3, 10), q(2, 5), q(3, 4), q(3, 5), q(7, 10), q(15, 100), q(35, 100), q(45, 100), q(65, 100), q(12, 100)].filter((x) => isDec(mul(x, q(tot)), 0)));
    const ef = mul(fr, q(tot)), pc = mul(fr, q(100)), asPct = rng.chance(0.5), what = rng.pick(ctx.cats);
    steps.push(step(`Combien ${de(ctx.pop)} ont répondu « ${what} » ?`, [exactF('', ef)], 'Effectif = fréquence × effectif total.', mist(ef, [[pc, 'Ça, c’est le pourcentage : multiplie la fréquence par l’effectif total.'], [div(q(tot), pc), 'Multiplie, ne divise pas.']])));
    items.push({ what: 'e', js: `${toNum(fr)}*${tot}`, expect: toNum(ef) });
    sol.push(`${m(`${asPct ? `${dn(pc)}\\,\\% \\text{ de } ${tot} = ` : ''}${dn(fr)} \\times ${tot} = ${dn(ef)}`)} ${ctx.pop}.`);
    return { title: 'De la fréquence à l’effectif.', statement: `Sur ${m(String(tot))} ${ctx.pop} interrogés sur leur ${ctx.car}, la fréquence de la réponse « ${what} » est ${asPct ? m(pct(pc)) : m(dn(fr))}.`, steps, solution: sol, answer: dn(ef), key: `${tot}|${dn(fr)}|${asPct}|${what}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== diagramme circulaire
export const circulaire: Generator = {
  id: 'circulaire', title: 'Diagramme circulaire', stars: 1, levels: [1, 2], course: LINKS.s22, links: [LINKS.s1],
  desc: 'Angle = fréquence × 360° ; ★★ : d’un angle à la fraction et à l’effectif, pourcentage → angle.',
  example: '\\dfrac{12}{30} \\times 360^\\circ = 144^\\circ',
  generate(rng: Rng, level: Level) {
    const ctx = rng.pick(QUALI), items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    if (level === 1) {
      const N = rng.pick([18, 20, 24, 30, 36, 40, 45, 60, 72]), k = 4, cats = rng.shuffle(ctx.cats).slice(0, k);
      const eff = partition(rng, N, k, Math.max(1, Math.ceil(N / 15)), Math.floor(N / 2)), u = 360 / N;
      const [i, j] = rng.shuffle([0, 1, 2, 3]).slice(0, 2), ang = eff.map((e) => e * u);
      steps.push(step('a) Combien de degrés représente un individu ?', [exactF('', q(u), '°')], `${m('360 \\div N')}, avec ${m('N')} l’effectif total.`, mist(q(u), [[q(N, 360), 'Inversé : on partage 360° entre les N individus.'], [q(100, N), '100 %, c’est pour les pourcentages ; un tour complet fait 360°.']])));
      const pm = [q(100 * eff[i], N), q(100 * eff[j], N)];
      steps.push(step(`b) Angles des secteurs « ${cats[i]} » et « ${cats[j]} » ?`, [exactF(`${cats[i]} :`, q(ang[i]), '°'), exactF(`${cats[j]} :`, q(ang[j]), '°')], `Effectif × ${m(`${u}^\\circ`)}.`, eq(pm[0], q(ang[i])) && eq(pm[1], q(ang[j])) ? [] : [{ on: 'numAll', values: pm, msg: 'Ce sont les pourcentages : un tour complet fait 360°, pas 100.' }]));
      items.push({ what: 'u', js: `360/${JS_SUM(eff)}`, expect: u }, { what: 'ai', js: `${eff[i]}/${JS_SUM(eff)}*360`, expect: ang[i] }, { what: 'aj', js: `${eff[j]}/${JS_SUM(eff)}*360`, expect: ang[j] });
      sol.push(`${m(`N = ${eff.join(' + ')} = ${N}`)} : un individu correspond à ${m(`\\dfrac{360}{${N}} = ${u}^\\circ`)}.`);
      sol.push(cats.map((c, t) => `${c} : ${m(`${eff[t]} \\times ${u} = ${ang[t]}^\\circ`)}`).join(' ; ') + '.');
      sol.push(`Contrôle : ${m(`${ang.join(' + ')} = 360`)}.`);
      const display = effTable('Réponse', cats, eff);
      return { title: 'Calculer les angles.', statement: `On a demandé leur ${ctx.car} à des ${ctx.pop}, pour construire un diagramme circulaire.`, display, steps, solution: sol, answer: `${u}° ; ${ang[i]}° ; ${ang[j]}°`, key: display + i + j, data: { kind: 'js', items } };
    }
    if (rng.chance(0.5)) {
      const opts: [number, number][] = [[90, 4], [120, 3], [60, 6], [45, 8], [72, 5], [36, 10], [180, 2], [144, 5], [108, 10], [216, 5], [270, 4], [30, 12], [150, 12], [240, 3], [54, 20], [126, 20]];
      const [a, den] = rng.pick(opts), f = q(a, 360), N = den * rng.int(2, 12) * (den <= 4 ? 5 : 1), e = mul(f, q(N)), what = rng.pick(ctx.cats);
      const cats = [what, ...rng.shuffle(ctx.cats.filter((c) => c !== what)).slice(0, 2)], rest = 360 - a, a2 = Math.max(18, Math.min(rest - 18, Math.round((rest * rng.int(35, 65)) / 100 / 6) * 6));
      const figure = pieSvg(cats, [a, a2, rest - a2], `Diagramme circulaire : le secteur « ${what} » mesure ${a}°`);
      steps.push(step(`a) Quelle fraction des ${ctx.pop} représente le secteur « ${what} », qui mesure ${m(`${a}^\\circ`)} ?`, [exactF('', f)], `${m('\\dfrac{\\text{angle}}{360}')}.`, mist(f, [[q(a, 100), 'Un tour complet fait 360°, pas 100.'], [q(360, a), 'Inversé : angle ÷ 360.']])));
      steps.push(step(`b) ${m(String(N))} ${ctx.pop} ont été interrogés. Combien ont répondu « ${what} » ?`, [exactF('', e)], 'Fraction × effectif total.', mist(e, [[q(a), 'L’angle n’est pas l’effectif.'], [q(N * a, 100), 'La fraction vaut angle ÷ 360, pas ÷ 100.']])));
      items.push({ what: 'f', js: `${a}/360`, expect: toNum(f) }, { what: 'e', js: `${N}*${a}/360`, expect: toNum(e) });
      sol.push(`${m(`\\dfrac{${a}}{360} = ${texFrac(f)}`)}${isDec(f, 3) ? `, soit ${m(dn(f))}` : ''}.`, `${m(`${texFrac(f)} \\times ${N} = ${dn(e)}`)} ${ctx.pop}.`);
      return { title: 'Lire un diagramme circulaire.', statement: `Diagramme circulaire : ${ctx.car} (le secteur « ${what} » mesure ${m(`${a}^\\circ`)}).`, figure, steps, solution: sol, answer: `${texFrac(f)} ; ${dn(e)}`, key: `${a}|${N}|${what}`, data: { kind: 'js', items } };
    }
    const ps = (() => { for (;;) { const a = rng.int(2, 11) * 5, b = rng.int(2, 11) * 5; if (a + b <= 85 && a !== b && 100 - a - b !== a && 100 - a - b !== b) return [a, b, 100 - a - b]; } })();
    const cats = rng.shuffle(ctx.cats).slice(0, 3), N = rng.pick([200, 300, 400, 500, 600, 1000, 1200]), i = rng.int(0, 2);
    const e = (N * ps[i]) / 100, ang = q(ps[i] * 36, 10);
    steps.push(step(`a) Combien ${de(ctx.pop)} ont choisi « ${cats[i]} » ?`, [exactF('', q(e))], `${m(`${ps[i]}\\,\\%`)} de ${m(String(N))}.`, mist(q(e), [[q(ps[i]), 'C’est le pourcentage, pas l’effectif.']])));
    steps.push(step(`b) Angle du secteur « ${cats[i]} » ?`, [exactF('', ang, '°')], `${m(`${ps[i]}\\,\\%`)} de ${m('360^\\circ')}.`, mist(ang, [[q(ps[i]), `${ps[i]} % ne donne pas ${ps[i]}° : un tour complet fait 360°, pas 100.`], [q(e), 'L’angle se calcule sur 360°, pas sur l’effectif.']])));
    items.push({ what: 'e', js: `${ps[i]}/100*${N}`, expect: e }, { what: 'a', js: `${ps[i]}/100*360`, expect: toNum(ang) });
    sol.push(`${m(`${dn(q(ps[i], 100))} \\times ${N} = ${e}`)} ${ctx.pop}.`, `${m(`${dn(q(ps[i], 100))} \\times 360^\\circ = ${dn(ang)}^\\circ`)} (et non ${m(`${ps[i]}^\\circ`)}).`);
    const display = table([[tt('Réponse'), ...cats.map(tt)], [tt('Fréquence'), ...ps.map((p) => `${p}\\,\\%`)]]);
    return { title: 'Du pourcentage à l’angle.', statement: `Un sondage auprès de ${m(String(N))} ${ctx.pop} sur leur ${ctx.car} donne :`, display, steps, solution: sol, answer: `${e} ; ${dn(ang)}°`, key: display + N + i, data: { kind: 'js', items } };
  },
};

// ===================================================================== diagramme en bâtons
export const batons: Generator = {
  id: 'batons', title: 'Lire un diagramme en bâtons', stars: 1, levels: [1, 2], course: LINKS.s21, links: [LINKS.s31, LINKS.s41],
  desc: 'Lire les effectifs, l’effectif total, une fréquence ; ★★ : moyenne, médiane et étendue à partir du diagramme.',
  example: '\\dfrac{5}{20} = 25\\,\\%',
  generate(rng: Rng, level: Level): ReturnType<Generator['generate']> {
    const ctx = rng.pick(QUANTI), n = Math.min(ctx.vals.length, rng.int(5, 6)), o0 = ctx.vals[0] === 0 ? 0 : rng.int(0, ctx.vals.length - n), vals = ctx.vals.slice(o0, o0 + n);
    const N = level === 1 ? rng.pick([20, 25, 40, 50]) : rng.int(15, 32);
    let eff: number[];
    do eff = partition(rng, N, n, 1, Math.min(14, Math.floor(N / 2))); while (Math.max(...eff) > 14);
    const figure = barSvg(vals.map(String), eff, ctx.axis, ctx.ind);
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [], v = rng.int(0, n - 1);
    if (level === 1) {
      const f = q(100 * eff[v], N);
      steps.push(step(`a) Combien ${de(ctx.ind)} pour la valeur ${m(String(vals[v]))} ?`, [exactF('', q(eff[v]))], 'Lis la hauteur du bâton sur l’axe vertical.', mist(q(eff[v]), [[q(vals[v]), 'Ça, c’est la valeur (axe horizontal) ; l’effectif se lit sur l’axe vertical.']])));
      steps.push(step('b) Effectif total ?', [exactF(m('N ='), q(N))], 'Additionne les hauteurs de tous les bâtons.', mist(q(N), [[q(n), 'C’est le nombre de bâtons ; additionne leurs hauteurs.'], [q(sum(vals)), 'Additionne les effectifs (hauteurs), pas les valeurs.']])));
      steps.push(step(`c) Fréquence de la valeur ${m(String(vals[v]))}, en pourcentage ?`, [exactF('', f, '%')], `${m(`\\dfrac{${eff[v]}}{${N}} \\times 100`)}.`, mist(f, [[q(eff[v], N), 'Multiplie par 100 pour un pourcentage.']])));
      items.push({ what: 'e', js: String(eff[v]), expect: eff[v] }, { what: 'N', js: JS_SUM(eff), expect: N }, { what: 'f', js: `100*${eff[v]}/${JS_SUM(eff)}`, expect: toNum(f) });
      sol.push(`Effectifs lus : ${vals.map((x, t) => `${x} → ${eff[t]}`).join(' ; ')}.`, `${m(`N = ${eff.join(' + ')} = ${N}`)}.`, `${m(`\\dfrac{${eff[v]}}{${N}} = ${dn(q(eff[v], N))}`)}, soit ${m(pct(f))}.`);
      return { title: `Diagramme : ${ctx.car}.`, statement: `Le diagramme donne ${ctx.le} ${ctx.car} pour des ${ctx.pop}.`, figure, steps, solution: sol, answer: `${eff[v]} ; ${N} ; ${dn(f)} %`, key: eff.join(',') + ctx.car + v, data: { kind: 'js', items } };
    }
    const S = sum(vals.map((x, t) => x * eff[t])), mean = q(S, N), ser = expand(vals, eff), med = median(ser), et = vals[n - 1] - vals[0];
    if (!okRound(mean, 1)) return batons.generate(rng, level);
    const naive = q(sum(vals), n);
    steps.push(step('a) Moyenne (arrondie au dixième si besoin) ?', [valF('', mean, 1)], `Somme des « valeur × effectif », divisée par l’effectif total ${m(`N = ${N}`)}.`, mist(rq(mean, 1), [[rq(naive, 1), 'Pondère par les effectifs : chaque valeur compte autant de fois que son effectif.']])));
    const cum = eff.map((_, t) => sum(eff.slice(0, t + 1)));
    steps.push(step('b) Médiane ?', [exactF('', med)], N % 2 ? `${m(`N = ${N}`)} est impair : cherche la ${ord((N + 1) / 2)} valeur avec les effectifs cumulés.` : `${m(`N = ${N}`)} est pair : moyenne des ${ord(N / 2)} et ${ord(N / 2 + 1)} valeurs.`, mist(med, [[median(vals), `La médiane se calcule sur les ${N} valeurs, pas sur la liste des valeurs possibles.`], [q(vals[eff.indexOf(Math.max(...eff))]), 'C’est la valeur la plus fréquente, pas forcément la médiane.']])));
    steps.push(step('c) Étendue ?', [exactF('', q(et))], 'Plus grande valeur moins plus petite valeur (pas les effectifs).', mist(q(et), [[q(Math.max(...eff) - Math.min(...eff)), 'Calcule l’étendue sur les valeurs, pas sur les effectifs.']])));
    items.push({ what: 'moy', js: `${A(vals)}.reduce((s,v,i)=>s+v*${A(eff)}[i],0)/${N}`, expect: toNum(mean) }, { what: 'med', js: JS_MED(ser), expect: toNum(med) }, { what: 'et', js: `Math.max(...${A(vals)})-Math.min(...${A(vals)})`, expect: et });
    sol.push(`Effectifs lus : ${vals.map((x, t) => `${x} → ${eff[t]}`).join(' ; ')} ; ${m(`N = ${N}`)}.`);
    sol.push(`Moyenne : ${m(`\\dfrac{${vals.map((x, t) => `${x} \\times ${eff[t]}`).join(' + ')}}{${N}} = \\dfrac{${S}}{${N}} ${eqOrApprox(mean, 1)}`)}.`);
    const r1 = N % 2 ? (N + 1) / 2 : N / 2, r2 = r1 + 1, val = (r: number) => vals[cum.findIndex((c) => c >= r)];
    sol.push(`Médiane : effectifs cumulés ${cum.join(', ')} ; ${N % 2 ? `la ${ord(r1)} valeur est ${m(String(val(r1)))}` : `les ${ord(r1)} et ${ord(r2)} valeurs sont ${m(String(val(r1)))} et ${m(String(val(r2)))}`}, donc la médiane est ${m(dn(med))}.`);
    sol.push(`Étendue : ${m(`${vals[n - 1]} - ${vals[0]} = ${et}`)}.`);
    return { title: `Diagramme : ${ctx.car}.`, statement: `Le diagramme donne ${ctx.le} ${ctx.car} pour ${m(String(N))} ${ctx.pop}.`, figure, steps, solution: sol, answer: `${show(mean, 1)} ; ${dn(med)} ; ${et}`, key: eff.join(',') + ctx.car, data: { kind: 'js', items } };
  },
};

// ===================================================================== moyenne simple et pondérée
export const moyenne: Generator = {
  id: 'moyenne', title: 'Moyenne', stars: 1, levels: [1, 2], course: LINKS.s31,
  desc: 'Moyenne d’une liste ; ★★ : moyenne pondérée par des effectifs ou des coefficients.',
  example: '\\dfrac{14 \\times 3 + 11 \\times 2 + 16}{6} \\approx 13{,}3',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], sol: Rich[] = [];
    if (level === 1) {
      const kind = rng.pick(['notes', 'temp', 'pas', 'temps'] as const), n = rng.int(5, 8);
      const [lo, hi, u, what] = kind === 'notes' ? [5, 20, '', `Notes de ${rng.pick(NAMES)} ce trimestre`] : kind === 'temp' ? [8, 27, '°C', `Températures relevées à midi pendant ${plural(n, 'jour')} (en °C)`] : kind === 'pas' ? [3200, 12800, 'pas', `Nombre de pas par jour de ${rng.pick(NAMES)} pendant ${plural(n, 'jour')}`] : [11, 35, 'min', 'Durées de livraison (en minutes) d’un livreur'];
      const dp = kind === 'pas' ? 0 : 1;
      let a: number[], mean: Q;
      do { a = Array.from({ length: n }, () => (kind === 'pas' ? rng.int(lo / 100, hi / 100) * 100 + rng.int(0, 9) * 10 : rng.int(lo, hi))); mean = q(sum(a), n); } while (!okRound(mean, dp) || new Set(a).size < n - 2);
      const S = sum(a);
      const st = step(`Calcule la moyenne${isDec(mean, dp) ? '' : dp ? ' (arrondie au dixième)' : ' (arrondie à l’unité)'}.`, [valF(m('\\bar{x} ='), mean, dp, u || undefined)], 'Additionne toutes les valeurs, puis divise par le nombre de valeurs.', mist(rq(mean, dp), [[q(S), 'Ça, c’est la somme : divise-la par le nombre de valeurs.'], [rq(q(S, n - 1), dp), `Il y a ${n} valeurs, pas ${n - 1}.`], [rq(q(S, n + 1), dp), `Il y a ${n} valeurs, pas ${n + 1}.`]]));
      items.push({ what: 'moy', js: `${JS_SUM(a)}/${n}`, expect: toNum(mean) });
      sol.push(`Somme : ${m(`${a.map((x) => dn(q(x))).join(' + ')} = ${dn(q(S))}`)}.`, `Moyenne : ${m(`\\dfrac{${dn(q(S))}}{${n}} ${eqOrApprox(mean, dp)}`)}${u ? ` ${u}` : ''}.`, `Contrôle : la moyenne est bien entre ${m(dn(q(Math.min(...a))))} et ${m(dn(q(Math.max(...a))))}.`);
      return { title: 'Moyenne d’une série.', statement: `${what} : ${a.map((x) => m(dn(q(x)))).join(' ; ')}.`, steps: [st], solution: sol, answer: show(mean, dp), key: a.join(','), data: { kind: 'js', items } };
    }
    if (rng.chance(0.5)) {
      const subj = rng.shuffle(['mathématiques', 'français', 'histoire-géo', 'anglais', 'sciences', 'EPS']).slice(0, rng.int(3, 4));
      let notes: number[], co: number[], mean: Q;
      do { notes = subj.map(() => rng.int(6, 19)); co = subj.map(() => rng.int(1, 4)); mean = q(sum(notes.map((x, t) => x * co[t])), sum(co)); } while (!okRound(mean, 1) || new Set(co).size < 2 || eq(rq(mean, 1), rq(q(sum(notes), notes.length), 1)));
      const nm = rng.pick(NAMES), S = sum(notes.map((x, t) => x * co[t])), C = sum(co), naive = q(sum(notes), notes.length);
      const st = step('Calcule sa moyenne (arrondie au dixième si besoin).', [valF(m('\\bar{x} ='), mean, 1)], 'Les coefficients jouent le rôle des effectifs : somme des « note × coefficient », divisée par la somme des coefficients.', mist(rq(mean, 1), [[rq(naive, 1), 'Tu as oublié les coefficients.'], [rq(q(S, notes.length), 1), `Divise par la somme des coefficients (${C}), pas par le nombre de notes.`]]));
      items.push({ what: 'moy', js: `${A(notes)}.reduce((s,v,i)=>s+v*${A(co)}[i],0)/${JS_SUM(co)}`, expect: toNum(mean) });
      sol.push(`${m(`\\dfrac{${notes.map((x, t) => `${x} \\times ${co[t]}`).join(' + ')}}{${co.join(' + ')}} = \\dfrac{${S}}{${C}} ${eqOrApprox(mean, 1)}`)}.`, `Contrôle : sans coefficients, on trouverait ${m(`\\dfrac{${sum(notes)}}{${notes.length}} ${eqOrApprox(naive, 1)}`)} ; les matières à fort coefficient pèsent plus lourd.`);
      return { title: 'Moyenne avec coefficients.', statement: `Au brevet blanc, ${nm} obtient : ${subj.map((s, t) => `${m(String(notes[t]))} en ${s} (coefficient ${m(String(co[t]))})`).join(', ')}.`, steps: [st], solution: sol, answer: show(mean, 1), key: notes.join(',') + '|' + co.join(','), data: { kind: 'js', items } };
    }
    const ctx = rng.pick(QUANTI), n = Math.min(ctx.vals.length, rng.int(4, 5)), off = rng.int(0, ctx.vals.length - n), vals = ctx.vals.slice(off, off + n);
    let eff: number[], mean: Q;
    do { eff = vals.map(() => rng.int(1, 9)); mean = q(sum(vals.map((x, t) => x * eff[t])), sum(eff)); } while (!okRound(mean, 1) || eq(rq(mean, 1), rq(q(sum(vals), n), 1)));
    const N = sum(eff), S = sum(vals.map((x, t) => x * eff[t]));
    const display = effTable(cap(ctx.axis), vals, eff);
    const st = step('Calcule la moyenne (arrondie au dixième si besoin).', [valF(m('\\bar{x} ='), mean, 1)], 'Somme des « valeur × effectif », divisée par l’effectif total.', mist(rq(mean, 1), [[rq(q(sum(vals), n), 1), 'Tu as fait la moyenne des valeurs du tableau sans tenir compte des effectifs.'], [rq(q(S, n), 1), `Divise par l’effectif total (${N}), pas par le nombre de colonnes.`]]));
    items.push({ what: 'moy', js: `${A(vals)}.reduce((s,v,i)=>s+v*${A(eff)}[i],0)/${JS_SUM(eff)}`, expect: toNum(mean) });
    sol.push(`${m(`N = ${eff.join(' + ')} = ${N}`)}.`, `${m(`\\bar{x} = \\dfrac{${vals.map((x, t) => `${x} \\times ${eff[t]}`).join(' + ')}}{${N}} = \\dfrac{${S}}{${N}} ${eqOrApprox(mean, 1)}`)}.`);
    return { title: 'Moyenne pondérée par les effectifs.', statement: `${cap(ctx.car)} de ${m(String(N))} ${ctx.pop} :`, display, steps: [st], solution: sol, answer: show(mean, 1), key: display, data: { kind: 'js', items } };
  },
};
