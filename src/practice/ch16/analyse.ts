/** Chapitre 16 (suite) : raisonner avec la moyenne, médiane et étendue, classes, interpréter, erreurs. */
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice, NAMES } from '../engine/build';
import { add, eq } from '../engine/q';
import { LINKS, m, dn, ax, exactF, valF, isDec, eqOrApprox, table, tt, histSvg, twoBarSvg, q, toNum, type Q } from './common';
import { type Item, step, sum, A, JS_SUM, JS_MED, median, expand, ord, rq, okRound, show, corr, cap, de, pron, QUANTI } from './stats';

const effTable = (head: string, vals: number[], eff: number[]) => table([[tt(head), ...vals.map(String)], [tt('Effectif'), ...eff.map(String)]]);

// ===================================================================== raisonner avec la moyenne
export const rebours: Generator = {
  id: 'rebours', title: 'Raisonner avec la moyenne', stars: 2, levels: [2, 3], course: LINKS.s31, links: [LINKS.s41, LINKS.s43],
  desc: 'Note à ajouter, note manquante, nouvelle moyenne ; décalage de toutes les valeurs ; ★★★ : regrouper deux groupes.',
  example: '\\dfrac{20 \\times 12 + 10 \\times 15}{30} = 13',
  generate(rng: Rng, level: Level): ReturnType<Generator['generate']> {
    const items: Item[] = [], sol: Rich[] = [], nm = rng.pick(NAMES);
    if (level === 3) {
      const g = rng.pick([['classe A', 'classe B', 'élèves', 'de moyenne au contrôle', 0], ['équipe du matin', 'équipe du soir', 'salariés', 'ans de moyenne d’âge', 22], ['groupe 1', 'groupe 2', 'coureurs', 'km parcourus en moyenne', 0]] as const);
      let n1: number, n2: number, m1: number, m2: number, M: Q;
      do { n1 = rng.int(8, 30); n2 = rng.int(6, 30); m1 = rng.int(8, 16) + g[4]; m2 = rng.int(8, 17) + g[4]; M = q(n1 * m1 + n2 * m2, n1 + n2); } while (n1 === n2 || m1 === m2 || !okRound(M, 1) || eq(rq(M, 1), q(m1 + m2, 2)));
      const avg2 = q(m1 + m2, 2);
      const steps = [
        step(`a) Total pour le groupe « ${g[0]} » ?`, [exactF('', q(n1 * m1))], 'Moyenne × effectif = total.', mist(q(n1 * m1), [[q(m1), 'Multiplie la moyenne par l’effectif.']])),
        step(`b) Moyenne de l’ensemble des ${m(String(n1 + n2))} ${g[2]} (arrondie au dixième si besoin) ?`, [valF('', M, 1)], 'Additionne les deux totaux, puis divise par l’effectif total.', mist(rq(M, 1), [[avg2, 'Ce n’est pas la moyenne des deux moyennes : les groupes n’ont pas le même effectif.']])),
      ];
      items.push({ what: 't1', js: `${n1}*${m1}`, expect: n1 * m1 }, { what: 'M', js: `(${n1}*${m1}+${n2}*${m2})/(${n1}+${n2})`, expect: toNum(M) });
      sol.push(`Totaux : ${m(`${n1} \\times ${m1} = ${n1 * m1}`)} et ${m(`${n2} \\times ${m2} = ${n2 * m2}`)}.`, `${m(`\\dfrac{${n1 * m1} + ${n2 * m2}}{${n1 + n2}} = \\dfrac{${n1 * m1 + n2 * m2}}{${n1 + n2}} ${eqOrApprox(M, 1)}`)}.`, `${m(dn(avg2))} serait la moyenne des deux moyennes, comme si les groupes avaient le même effectif ; le groupe le plus nombreux pèse plus.`);
      return { title: 'Regrouper deux groupes.', statement: `${cap(g[0])} : ${m(String(n1))} ${g[2]}, ${m(String(m1))} ${g[3]}.\n${cap(g[1])} : ${m(String(n2))} ${g[2]}, ${m(String(m2))} ${g[3]}.`, steps, solution: sol, answer: `${n1 * m1} ; ${show(M, 1)}`, key: `${g[0]}|${n1}|${n2}|${m1}|${m2}`, data: { kind: 'js', items } };
    }
    const v = rng.int(0, 3), il = pron(nm);
    if (v === 0) {
      let n: number, m0: number, x: number, M: Q;
      do { n = rng.int(3, 8); m0 = rng.int(8, 15); x = rng.int(4, 20); M = q(n * m0 + x, n + 1); } while (x === m0 || !okRound(M, 1));
      const st = step('Quelle est sa nouvelle moyenne (arrondie au dixième si besoin) ?', [valF('', M, 1)], `Retrouve d’abord la somme des ${n} premières notes : moyenne × nombre de notes.`, mist(rq(M, 1), [[q(m0 + x, 2), `On ne fait pas la moyenne de l’ancienne moyenne et de la nouvelle note : l’ancienne moyenne compte pour ${n} notes.`]]));
      items.push({ what: 'M', js: `(${n}*${m0}+${x})/(${n}+1)`, expect: toNum(M) });
      sol.push(`Somme des ${n} notes : ${m(`${n} \\times ${m0} = ${n * m0}`)}.`, `Avec la nouvelle : ${m(`${n * m0} + ${x} = ${n * m0 + x}`)} points pour ${m(String(n + 1))} notes.`, `Nouvelle moyenne : ${m(`\\dfrac{${n * m0 + x}}{${n + 1}} ${eqOrApprox(M, 1)}`)}.`);
      return { title: 'Ajouter une note.', statement: `La moyenne de ${nm} sur ${m(String(n))} notes est ${m(String(m0))}. ${cap(il)} obtient ensuite ${m(String(x))}.`, steps: [st], solution: sol, answer: show(M, 1), key: `a${n}|${m0}|${x}`, data: { kind: 'js', items } };
    }
    if (v === 1) {
      let n: number, m0: number, t: number, x: number;
      do { n = rng.int(3, 7); m0 = rng.int(8, 14); t = m0 + rng.int(1, 3); x = (n + 1) * t - n * m0; } while (x > 20 || x < 0);
      const st = step(`Quelle note doit-${il} obtenir au contrôle suivant ?`, [exactF('', q(x))], `Total nécessaire : ${m(String(t))} × ${m(String(n + 1))} notes.`, mist(q(x), [[q(2 * t - m0), `L’ancienne moyenne compte pour ${n} notes, pas pour une seule.`], [q(t), `Avoir ${t} ne suffit pas : il faut rattraper le retard des notes précédentes.`]]));
      items.push({ what: 'x', js: `(${n}+1)*${t}-${n}*${m0}`, expect: x });
      sol.push(`Total nécessaire : ${m(`${n + 1} \\times ${t} = ${(n + 1) * t}`)} points.`, `Total actuel : ${m(`${n} \\times ${m0} = ${n * m0}`)}.`, `Note nécessaire : ${m(`${(n + 1) * t} - ${n * m0} = ${x}`)}.`);
      return { title: 'La note à viser.', statement: `Après ${m(String(n))} contrôles, la moyenne de ${nm} est ${m(String(m0))}. ${cap(il)} veut atteindre ${m(String(t))} de moyenne avec le contrôle suivant.`, steps: [st], solution: sol, answer: String(x), key: `b${n}|${m0}|${t}`, data: { kind: 'js', items } };
    }
    if (v === 2) {
      let a: number[], x: number, M: number;
      do { a = Array.from({ length: 4 }, () => rng.int(6, 19)); M = rng.int(10, 15); x = 5 * M - sum(a); } while (x < 0 || x > 20 || a.includes(x));
      const pos = rng.int(0, 4), full = [...a.slice(0, pos), x, ...a.slice(pos)], med = median(full), srt = [...full].sort((p, r) => p - r), et = srt[4] - srt[0];
      const steps = [
        step(`a) Trouve ${m('x')}.`, [exactF(m('x ='), q(x))], `La somme des 5 notes vaut ${m(`5 \\times ${M}`)}.`, mist(q(x), [[q(M), 'x n’est pas forcément égal à la moyenne : écris l’équation.']])),
        step('b) Médiane et étendue de ses notes ?', [exactF('Médiane :', med), exactF('Étendue :', q(et))], 'Range d’abord les 5 notes dans l’ordre croissant.', mist(med, [[q(full[2]), 'Range d’abord les notes avant de prendre celle du milieu.']], 0)),
      ];
      items.push({ what: 'x', js: `5*${M}-${JS_SUM(a)}`, expect: x }, { what: 'med', js: JS_MED(full), expect: toNum(med) }, { what: 'et', js: `Math.max(...${A(full)})-Math.min(...${A(full)})`, expect: et });
      sol.push(`${m(`${a.join(' + ')} + x = 5 \\times ${M} = ${5 * M}`)}, donc ${m(`${sum(a)} + x = ${5 * M}`)} et ${m(`x = ${x}`)}.`, `Rangée : ${m(srt.join(' \\; ; \\; '))} ; médiane ${m(dn(med))} ; étendue ${m(`${srt[4]} - ${srt[0]} = ${et}`)}.`);
      return { title: 'La note manquante.', statement: `Les notes de ${nm} sont ${full.map((t, k) => (k === pos ? m('x') : m(String(t)))).join(', ')}, et sa moyenne est ${m(String(M))}.`, steps, solution: sol, answer: `x = ${x} ; ${dn(med)} ; ${et}`, key: `c${full.join(',')}|${pos}`, data: { kind: 'js', items } };
    }
    let a: number[];
    do a = Array.from({ length: rng.int(5, 7) }, () => rng.int(4, 17)); while (!isDec(q(sum(a), a.length), 1));
    const k = rng.int(1, 3), mean = q(sum(a), a.length), med = median(a), et = Math.max(...a) - Math.min(...a);
    const st = step(`On ajoute ${m(String(k))} point${k > 1 ? 's' : ''} à toutes les notes. Nouvelle moyenne, nouvelle médiane, nouvelle étendue ?`, [exactF('Moyenne :', add(mean, q(k))), exactF('Médiane :', add(med, q(k))), exactF('Étendue :', q(et))], 'Tout se décale de la même quantité… sauf l’écart entre le maximum et le minimum.', [{ on: 'numAll', values: [add(mean, q(k)), add(med, q(k)), q(et + k)], msg: 'L’étendue ne change pas : le maximum et le minimum augmentent tous les deux.' }]);
    items.push({ what: 'm', js: `${JS_SUM(a.map((x) => x + k))}/${a.length}`, expect: toNum(mean) + k }, { what: 'med', js: JS_MED(a.map((x) => x + k)), expect: toNum(med) + k }, { what: 'et', js: `Math.max(...${A(a)})-Math.min(...${A(a)})`, expect: et });
    sol.push(`Moyenne et médiane augmentent de ${m(String(k))} : ${m(dn(add(mean, q(k))))} et ${m(dn(add(med, q(k))))}.`, `L’étendue reste ${m(String(et))} : le maximum et le minimum augmentent tous les deux de ${m(String(k))}.`);
    return { title: 'Tout décaler.', statement: `Notes d’un groupe : ${a.map((x) => m(String(x))).join(' ; ')}.\nMoyenne ${m(dn(mean))}, médiane ${m(dn(med))}, étendue ${m(String(et))}.`, steps: [st], solution: sol, answer: `${dn(add(mean, q(k)))} ; ${dn(add(med, q(k)))} ; ${et}`, key: `d${a.join(',')}|${k}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== médiane et étendue
export const mediane: Generator = {
  id: 'mediane', title: 'Médiane et étendue', stars: 1, levels: [1, 2], course: LINKS.s41, links: [LINKS.s43],
  desc: 'Ranger, prendre la valeur du milieu (ou la moyenne des deux du milieu) ; ★★ : tableau d’effectifs et effectifs cumulés.',
  example: '2 ; 5 ; 5 ; 8 ; 9 ; 11 \\Rightarrow 6{,}5',
  generate(rng: Rng, level: Level) {
    const items: Item[] = [], sol: Rich[] = [];
    if (level === 1) {
      const n = rng.int(5, 9), kind = rng.pick(['temps', 'notes', 'tailles', 'scores'] as const);
      const [lo, hi, u, what] = kind === 'temps' ? [12, 21, 's', 'Temps (en secondes) au 100 m de plusieurs élèves'] : kind === 'notes' ? [3, 20, '', 'Notes d’un contrôle'] : kind === 'tailles' ? [148, 179, 'cm', 'Tailles (en cm) des joueurs d’une équipe'] : [12, 95, '', 'Scores à un jeu vidéo'];
      const mid = (t: number[]) => (n % 2 ? q(t[(n - 1) / 2]) : q(t[n / 2 - 1] + t[n / 2], 2));
      let a: number[];
      do a = Array.from({ length: n }, () => rng.int(lo, hi)); while (new Set(a).size < n - 1 || eq(median(a), mid(a)));
      const med = median(a), srt = [...a].sort((x, y) => x - y), et = srt[n - 1] - srt[0];
      const steps = [
        step('a) Médiane ?', [exactF('', med, u || undefined)], 'Range d’abord la série dans l’ordre croissant.', mist(med, [[mid(a), 'Tu as pris le milieu sans ranger la série.'], [n % 2 ? null : q(srt[n / 2 - 1]), 'Effectif pair : moyenne des deux valeurs du milieu.'], [n % 2 ? null : q(srt[n / 2]), 'Effectif pair : moyenne des deux valeurs du milieu.'], [rq(q(sum(a), n), 1), 'Ça, c’est la moyenne.']])),
        step('b) Étendue ?', [exactF('', q(et), u || undefined)], 'Plus grande valeur moins plus petite.', mist(q(et), [[q(Math.abs(a[n - 1] - a[0])), 'Ce sont la dernière et la première valeur écrites, pas forcément le maximum et le minimum.']])),
      ];
      items.push({ what: 'med', js: JS_MED(a), expect: toNum(med) }, { what: 'et', js: `Math.max(...${A(a)})-Math.min(...${A(a)})`, expect: et });
      sol.push(`Rangée : ${m(srt.join(' \\; ; \\; '))} (${n} valeurs).`, n % 2 ? `${m(String(n))} est impair : la médiane est la ${ord((n + 1) / 2)} valeur, ${m(dn(med))}.` : `${m(String(n))} est pair : médiane ${m(`\\dfrac{${srt[n / 2 - 1]} + ${srt[n / 2]}}{2} = ${dn(med)}`)}.`, `Étendue : ${m(`${srt[n - 1]} - ${srt[0]} = ${et}`)}.`);
      return { title: 'Médiane et étendue.', statement: `${what} : ${a.map((x) => m(String(x))).join(' ; ')}.`, steps, solution: sol, answer: `${dn(med)} ; ${et}`, key: a.join(','), data: { kind: 'js', items } };
    }
    const ctx = rng.pick(QUANTI), n = Math.min(ctx.vals.length, rng.int(5, 6)), o0 = ctx.vals[0] === 0 ? 0 : rng.int(0, ctx.vals.length - n), vals = ctx.vals.slice(o0, o0 + n);
    let eff: number[], N: number, med: Q;
    do { eff = vals.map(() => rng.int(1, 9)); N = sum(eff); med = median(expand(vals, eff)); } while (N < 15 || eq(med, median(vals)));
    const cum = eff.map((_, t) => sum(eff.slice(0, t + 1))), j = rng.int(1, n - 2);
    const display = effTable(cap(ctx.axis), vals, eff);
    const r1 = N % 2 ? (N + 1) / 2 : N / 2, r2 = r1 + 1, val = (r: number) => vals[cum.findIndex((c) => c >= r)];
    const steps = [
      step(`a) Combien ${de(ctx.ind)} ont une valeur inférieure ou égale à ${m(String(vals[j]))} ?`, [exactF('', q(cum[j]))], 'C’est l’effectif cumulé croissant : additionne les effectifs jusqu’à cette valeur incluse.', mist(q(cum[j]), [[q(eff[j]), `Ça, c’est l’effectif de la seule valeur ${vals[j]} : ajoute ceux des valeurs plus petites.`], [q(cum[j] - eff[j]), `Inférieure **ou égale** : inclus la valeur ${vals[j]}.`]])),
      step('b) Médiane de la série ?', [exactF('', med)], N % 2 ? `${m(`N = ${N}`)} : la médiane est la ${ord(r1)} valeur ; regarde les effectifs cumulés.` : `${m(`N = ${N}`)} est pair : moyenne des ${ord(r1)} et ${ord(r2)} valeurs.`, mist(med, [[median(vals), `La médiane porte sur les ${N} individus, pas sur la liste des valeurs possibles.`], [q(vals[eff.indexOf(Math.max(...eff))]), 'C’est la valeur la plus fréquente, pas la médiane.'], [q(r1), 'C’est le rang du milieu, pas la valeur.']])),
    ];
    items.push({ what: 'cum', js: `${A(eff)}.slice(0,${j + 1}).reduce((s,v)=>s+v,0)`, expect: cum[j] }, { what: 'med', js: JS_MED(expand(vals, eff)), expect: toNum(med) });
    sol.push(`Effectifs cumulés croissants : ${vals.map((x, t) => `${x} → ${cum[t]}`).join(' ; ')} ; ${m(`N = ${N}`)}.`, `a) ${m(String(cum[j]))} ${ctx.ind}.`);
    sol.push(N % 2 ? `b) ${m(String(N))} est impair : la médiane est la ${ord(r1)} valeur, c’est-à-dire ${m(String(val(r1)))}.` : `b) ${m(String(N))} est pair : les ${ord(r1)} et ${ord(r2)} valeurs valent ${m(String(val(r1)))} et ${m(String(val(r2)))} : médiane ${m(dn(med))}.`);
    return { title: 'Médiane d’un tableau d’effectifs.', statement: `${cap(ctx.car)} de ${m(String(N))} ${ctx.pop} :`, display, steps, solution: sol, answer: `${cum[j]} ; ${dn(med)}`, key: display + j, data: { kind: 'js', items } };
  },
};

// ===================================================================== classes et histogramme
const CLASSES: { car: string; pop: string; lo: number[]; amp: number; unit: string; axis: string; fem: boolean }[] = [
  { car: 'taille', pop: 'élèves', lo: [140, 145, 150], amp: 10, unit: 'cm', axis: 'taille (cm)', fem: true },
  { car: 'durée du trajet domicile-collège', pop: 'élèves', lo: [0], amp: 10, unit: 'min', axis: 'durée (min)', fem: true },
  { car: 'masse', pop: 'colis', lo: [0, 2], amp: 2, unit: 'kg', axis: 'masse (kg)', fem: true },
  { car: 'durée passée sur un écran par jour', pop: 'adolescents', lo: [0, 30, 60], amp: 30, unit: 'min', axis: 'durée (min)', fem: true },
  { car: 'longueur', pop: 'poissons pêchés', lo: [10, 20], amp: 5, unit: 'cm', axis: 'longueur (cm)', fem: true },
];
export const classes: Generator = {
  id: 'classes', title: 'Classes et histogramme', stars: 2, levels: [2, 3], course: LINKS.s23, links: [LINKS.s32],
  desc: 'Lire un histogramme, pourcentage sous une borne, moyenne estimée avec les centres ; ★★★ : classe de la médiane.',
  example: '\\dfrac{145 \\times 4 + 155 \\times 10 + \\ldots}{30} \\approx 160{,}3',
  generate(rng: Rng, level: Level): ReturnType<Generator['generate']> {
    const c = rng.pick(CLASSES), lo = rng.pick(c.lo), k = rng.int(4, 5);
    const B = (t: number) => lo + c.amp * t, ctr = (t: number) => B(t) + c.amp / 2, cl = (t: number) => `[${B(t)}\\,;${B(t + 1)}[`;
    let eff: number[], N: number, mean: Q;
    do { eff = Array.from({ length: k }, () => rng.int(1, 14)); N = sum(eff); mean = q(sum(eff.map((e, t) => e * 2 * ctr(t))), 2 * N); } while (N < 18 || N > 50 || !okRound(mean, 1));
    const figure = histSvg(lo, c.amp, eff, c.axis);
    const items: Item[] = [], steps: Step[] = [], sol: Rich[] = [];
    const i = rng.int(0, k - 1), b = rng.int(1, k - 1), below = sum(eff.slice(0, b)), pb = q(100 * below, N);
    if (!okRound(pb, 1)) return classes.generate(rng, level);
    steps.push(step(`a) Combien ${de(c.pop)} dans la classe ${m(cl(i))} ?`, [exactF('', q(eff[i]))], 'Hauteur du rectangle au-dessus de cette classe.', mist(q(eff[i]), [[q(B(i)), 'Ça, c’est une borne de la classe ; l’effectif se lit en hauteur.']])));
    steps.push(step(`b) Pourcentage des ${c.pop} dont la ${c.car} est inférieure à ${m(`${B(b)}\\,\\mathrm{${c.unit}}`)} (au dixième si besoin) ?`, [valF('', pb, 1, '%')], `Additionne les effectifs des classes situées avant ${B(b)}, puis divise par ${m(`N = ${N}`)} et multiplie par 100.`, mist(rq(pb, 1), [[q(below), 'Ça, c’est l’effectif : divise par N puis multiplie par 100.'], [rq(q(100 * eff[b - 1], N), 1), 'Prends toutes les classes en dessous, pas seulement la dernière.']])));
    items.push({ what: 'e', js: String(eff[i]), expect: eff[i] }, { what: 'pb', js: `100*${A(eff)}.slice(0,${b}).reduce((s,v)=>s+v,0)/${JS_SUM(eff)}`, expect: toNum(pb) });
    sol.push(`${m(`N = ${eff.join(' + ')} = ${N}`)}.`, `a) ${m(String(eff[i]))} ${c.pop}.`, `b) ${b > 1 ? `${m(`${eff.slice(0, b).join(' + ')} = ${below}`)} ; ` : ''}${m(`\\dfrac{${below}}{${N}} \\times 100 ${eqOrApprox(pb, 1)}\\,\\%`)}.`);
    const base = { title: `Histogramme : ${c.car}.`, statement: `L’histogramme donne la ${c.car} (en ${c.unit}) de ${m(String(N))} ${c.pop}.`, figure, key: `${c.car}|${lo}|${eff.join(',')}|${i}|${b}` };
    if (level === 2) {
      const cs = eff.map((_, t) => q(2 * ctr(t), 2)), S = q(sum(eff.map((e, t) => e * 2 * ctr(t))), 2);
      steps.push(step(`c) Estime la moyenne de la série (en ${c.unit}) à l’aide des centres des classes, au dixième si besoin.`, [valF('', mean, 1, c.unit)], `Remplace chaque classe par son centre (${m(`\\dfrac{${B(0)} + ${B(1)}}{2} = ${dn(cs[0])}`)} pour la première), puis fais la moyenne pondérée.`, mist(rq(mean, 1), [[rq(q(sum(eff.map((e, t) => e * B(t))), N), 1), 'Prends le centre de chaque classe, pas sa borne inférieure.'], [rq(q(sum(cs.map((x) => toNum(x) * 2)), 2 * k), 1), 'Pondère par les effectifs.']])));
      items.push({ what: 'moy', js: `${A(eff)}.reduce((s,e,t)=>s+e*(${lo}+${c.amp}*t+${c.amp}/2),0)/${N}`, expect: toNum(mean) });
      sol.push(`c) Centres ${cs.map((x) => m(dn(x))).join(', ')} : ${m(`\\dfrac{${cs.map((x, t) => `${dn(x)} \\times ${eff[t]}`).join(' + ')}}{${N}} = \\dfrac{${dn(S)}}{${N}} ${eqOrApprox(mean, 1)}`)} ${c.unit} environ (valeur approchée).`);
      return { ...base, steps, solution: sol, answer: `${eff[i]} ; ${show(pb, 1)} % ; ${show(mean, 1)} ${c.unit}`, data: { kind: 'js', items } };
    }
    const cum = eff.map((_, t) => sum(eff.slice(0, t + 1))), r = N % 2 ? (N + 1) / 2 : N / 2, cm = cum.findIndex((x) => x >= r);
    if (N % 2 === 0 && cum[cm] === r) return classes.generate(rng, level); // médiane à cheval sur deux classes
    const opts = eff.map((_, t) => m(cl(t))), mode = eff.indexOf(Math.max(...eff));
    const bad = opts.map((o, t): [Rich, Rich] => [o, t === mode ? 'C’est la classe la plus fréquente, pas forcément celle de la médiane : utilise les effectifs cumulés.' : `Effectifs cumulés : ${cum.join(', ')}. Cherche le rang du milieu.`]).filter((_, t) => t !== cm);
    steps.push({ prompt: 'c) Dans quelle classe se trouve la médiane ?', answer: shuffledChoice(rng, opts[cm], bad.slice(0, 3)), hint: `Calcule les effectifs cumulés et repère le rang du milieu (${m(`N = ${N}`)}).` });
    items.push({ what: 'step:2', js: String(corr(steps[2])), expect: corr(steps[2]) });
    sol.push(`c) Effectifs cumulés : ${cum.join(', ')}. ${N % 2 ? `La ${ord(r)} valeur est` : `Les ${ord(r)} et ${ord(r + 1)} valeurs sont`} dans la classe ${m(cl(cm))} : la médiane est dans cette classe (on ne connaît pas sa valeur exacte).`);
    return { ...base, steps, solution: sol, answer: `${eff[i]} ; ${show(pb, 1)} % ; ${m(cl(cm))}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== interpréter, critiquer
export const interpreter: Generator = {
  id: 'interpreter', title: 'Interpréter, critiquer', stars: 2, levels: [2], course: LINKS.s42, links: [LINKS.s6, LINKS.s24, LINKS.s5, LINKS.s43],
  desc: 'Moyenne ou médiane avec une valeur extrême, graphique trompeur, choix du graphique, tableur, dispersion.',
  example: '\\text{médiane } 1\\,800 \\text{ €, moyenne } \\approx 2\\,743 \\text{ €}',
  generate(rng: Rng, level: Level): ReturnType<Generator['generate']> {
    const v = rng.int(0, 4), items: Item[] = [], sol: Rich[] = [];
    if (v === 0) {
      const n = rng.pick([5, 7]);
      let a: number[];
      do { a = Array.from({ length: n - 1 }, () => rng.int(12, 26) * 100); a.push(rng.int(6, 15) * 1000); } while (new Set(a).size < n || sum(a) % n !== 0);
      const mean = q(sum(a), n), med = median(a), srt = [...a].sort((x, y) => x - y), sh = rng.shuffle(a);
      const steps: Step[] = [
        step('a) Moyenne et médiane de ces salaires ?', [exactF('Moyenne :', mean, '€'), exactF('Médiane :', med, '€')], 'Moyenne : somme ÷ nombre de salaires. Médiane : range d’abord.', [{ on: 'numAll', values: [med, mean], msg: 'Tu as inversé moyenne et médiane.' }]),
        { prompt: 'b) Quel indicateur décrit le mieux un salaire « typique » de cette entreprise ?', answer: shuffledChoice(rng, 'La médiane', [['La moyenne', 'La moyenne est tirée vers le haut par le très gros salaire.'], ['Les deux se valent', 'Ici, elles sont très différentes : une valeur extrême déplace la moyenne, pas la médiane.']]), hint: 'Combien de salariés gagnent plus que la moyenne ?' },
      ];
      items.push({ what: 'moy', js: `${JS_SUM(a)}/${n}`, expect: toNum(mean) }, { what: 'med', js: JS_MED(a), expect: toNum(med) }, { what: 'step:1', js: String(corr(steps[1])), expect: corr(steps[1]) });
      const above = a.filter((x) => x > toNum(mean)).length;
      sol.push(`Moyenne : ${m(`\\dfrac{${dn(q(sum(a)))}}{${n}} = ${dn(mean)}`)} €.`, `Rangés : ${m(srt.map((x) => dn(q(x))).join(' \\; ; \\; '))} ; médiane ${m(dn(med))} €.`, `La médiane décrit mieux un salaire typique : ${above === 1 ? 'un seul salarié gagne' : `seulement ${above} salariés gagnent`} plus que la moyenne, tirée vers le haut par ${m(dn(q(Math.max(...a))))} €.`);
      return { title: 'Moyenne ou médiane ?', statement: `Salaires mensuels (en €) des ${n} salariés d’une petite entreprise : ${sh.map((x) => m(dn(q(x)))).join(' ; ')}.`, steps, solution: sol, answer: `${dn(mean)} € ; ${dn(med)} € ; la médiane`, key: `s${a.join(',')}`, data: { kind: 'js', items } };
    }
    if (v === 1) {
      const base = rng.pick([100, 200, 500, 1000]), d1 = rng.int(1, 4), r = rng.int(2, 5), v1 = base + d1, v2 = base + d1 * r, stp = d1 * r <= 10 ? 2 : 5;
      const years = rng.pick([['2024', '2025'], ['2023', '2024'], ['janvier', 'février'], ['mai', 'juin']]);
      const hausse = q(100 * (v2 - v1), v1);
      if (!okRound(hausse, 1)) return interpreter.generate(rng, level);
      const figure = twoBarSvg(years, [v1, v2], base, stp);
      const steps: Step[] = [
        step('a) Sur le dessin, combien de fois le second rectangle est-il plus haut que le premier ?', [exactF('', q(r))], `Mesure les hauteurs à partir du bas de l’axe, qui commence à ${base}.`),
        step('b) Hausse réelle des ventes, en pourcentage (arrondie au dixième si besoin) ?', [valF('', hausse, 1, '%')], `Hausse ${m(`${v2} - ${v1}`)}, rapportée à ${m(String(v1))}, puis ×100.`, mist(rq(hausse, 1), [[q(100 * (r - 1)), 'C’est l’impression donnée par le dessin, pas la hausse réelle.'], [q(v2 - v1), `Ça, c’est la hausse en nombre : rapporte-la à ${v1}.`]])),
      ];
      items.push({ what: 'r', js: `(${v2}-${base})/(${v1}-${base})`, expect: r }, { what: 'h', js: `100*(${v2}-${v1})/${v1}`, expect: toNum(hausse) });
      sol.push(`L’axe vertical commence à ${m(String(base))} : les hauteurs dessinées correspondent à ${m(String(v1 - base))} et ${m(String(v2 - base))}, d’où l’impression d’un facteur ${m(String(r))}.`, `En réalité : ${m(`\\dfrac{${v2} - ${v1}}{${v1}} \\times 100 ${eqOrApprox(hausse, 1)}\\,\\%`)} : une hausse modeste, pas une « explosion ».`);
      return { title: 'Un graphique trompeur.', statement: `Un magasin affiche ses ventes sous le titre « Les ventes explosent ! » : ${m(String(v1))} en ${years[0]}, ${m(String(v2))} en ${years[1]}.`, figure, steps, solution: sol, answer: `${r} fois ; ${show(hausse, 1)} %`, key: `t${base}|${v1}|${v2}|${years[0]}`, data: { kind: 'js', items } };
    }
    if (v === 2) {
      const S: [string, string][] = [
        ['l’évolution de la population d’une ville de 1950 à 2020', 'Graphique d’évolution'], ['la répartition du budget d’une famille', 'Diagramme circulaire'],
        ['les tailles des 500 élèves d’un collège', 'Histogramme'], ['le nombre d’enfants par famille dans un immeuble', 'Diagramme en bâtons'],
        ['la température relevée chaque heure pendant une journée', 'Graphique d’évolution'], ['la part de chaque énergie dans la production d’électricité', 'Diagramme circulaire'],
        ['les durées de 200 appels à un service client', 'Histogramme'], ['le nombre de buts par match d’une équipe', 'Diagramme en bâtons'],
        ['le prix du pain chaque année depuis 2000', 'Graphique d’évolution'], ['la répartition des votes entre 4 listes', 'Diagramme circulaire'],
        ['les masses de 300 nouveau-nés', 'Histogramme'], ['la note entière sur 10 obtenue par 30 élèves', 'Diagramme en bâtons'],
      ];
      const WHY: Record<string, string> = { 'Graphique d’évolution': 'une grandeur suivie dans le temps', 'Diagramme circulaire': 'des parts d’un tout', Histogramme: 'des valeurs nombreuses, regroupées en classes', 'Diagramme en bâtons': 'peu de valeurs numériques' };
      const KINDS = Object.keys(WHY), picks = rng.shuffle(S).slice(0, 2);
      const steps: Step[] = picks.map(([sit, g], t) => ({ prompt: `${'ab'[t]}) Pour représenter ${sit} :`, answer: shuffledChoice(rng, g, KINDS.filter((x) => x !== g).map((x): [Rich, Rich] => [x, `Ici, il s’agit de ${WHY[g]}.`])), hint: 'Peu de valeurs → bâtons ; parts d’un tout → circulaire ; classes → histogramme ; dans le temps → évolution.' }));
      steps.forEach((s, t) => items.push({ what: `step:${t}`, js: String(corr(s)), expect: corr(s) }));
      sol.push(...picks.map(([sit, g]) => `${cap(sit)} : ${g.toLowerCase()} (${WHY[g]}).`));
      return { title: 'Choisir un graphique.', steps, solution: sol, answer: picks.map((p) => p[1]).join(' ; '), key: `g${picks.map((p) => p[0]).join('|')}`, data: { kind: 'js', items } };
    }
    if (v === 3) {
      const col = rng.pick(['A', 'B', 'C', 'D']), r1 = rng.int(2, 3), r2 = r1 + rng.int(19, 34), P = `${col}${r1}:${col}${r2}`, what = rng.pick(['moyenne', 'médiane', 'étendue', 'nb'] as const);
      const all: [string, string][] = [[`=MOYENNE(${P})`, 'MOYENNE donne la moyenne.'], [`=MEDIANE(${P})`, 'MEDIANE donne la médiane.'], [`=MAX(${P})-MIN(${P})`, 'MAX − MIN donne l’étendue.'], [`=NB.SI(${P};12)`, 'NB.SI compte les cellules égales à 12.'], [`=SOMME(${P})`, 'SOMME donne le total, pas la moyenne.'], [`=MAX(${P})`, 'MAX donne seulement la plus grande valeur.']];
      const good = all[what === 'moyenne' ? 0 : what === 'médiane' ? 1 : what === 'étendue' ? 2 : 3][0];
      const bad = rng.shuffle(all.filter(([f]) => f !== good)).slice(0, 3).map(([f, w]): [Rich, Rich] => [`\`${f}\``, w]);
      const steps: Step[] = [{ prompt: `Quelle formule donne ${what === 'nb' ? 'le nombre d’élèves qui ont eu 12' : `la ${what} des notes`} ?`, answer: shuffledChoice(rng, `\`${good}\``, bad), hint: 'MOYENNE, MEDIANE, MAX − MIN (étendue), NB.SI (effectif d’une valeur).' }];
      items.push({ what: 'step:0', js: String(corr(steps[0])), expect: corr(steps[0]) });
      sol.push(`\`${good}\` (la plage \`${P}\` désigne les cellules de ${col}${r1} à ${col}${r2}).`);
      return { title: 'Avec un tableur.', statement: `Dans un tableur, les notes de ${m(String(r2 - r1 + 1))} élèves sont dans les cellules ${col}${r1} à ${col}${r2}.`, steps, solution: sol, answer: good, key: `f${P}|${what}`, data: { kind: 'js', items } };
    }
    let a: number[], b: number[], M: number;
    do { M = rng.int(9, 14); a = Array.from({ length: 4 }, () => M + rng.int(-2, 2)); a.push(5 * M - sum(a)); b = Array.from({ length: 4 }, () => M + rng.int(-8, 8)); b.push(5 * M - sum(b)); } while ([...a, ...b].some((x) => x < 0 || x > 20) || Math.max(...b) - Math.min(...b) < Math.max(...a) - Math.min(...a) + 5);
    const [n1, n2] = rng.shuffle(NAMES).slice(0, 2), ea = Math.max(...a) - Math.min(...a), eb = Math.max(...b) - Math.min(...b), swap = rng.chance(0.5);
    const [pa, pb] = swap ? [[n2, b], [n1, a]] as const : [[n1, a], [n2, b]] as const;
    const steps: Step[] = [
      step(`a) Moyennes de ${pa[0]} et de ${pb[0]} ?`, [exactF(`${pa[0]} :`, q(M)), exactF(`${pb[0]} :`, q(M))], 'Somme des notes ÷ 5.'),
      step('b) Étendues ?', [exactF(`${pa[0]} :`, q(swap ? eb : ea)), exactF(`${pb[0]} :`, q(swap ? ea : eb))], 'Plus grande note moins plus petite.'),
      { prompt: 'c) Qui a les résultats les plus réguliers ?', answer: shuffledChoice(rng, n1, [[n2, `Même moyenne, mais l’étendue de ${n2} est bien plus grande : ses notes sont irrégulières.`], ['On ne peut pas savoir', 'L’étendue mesure justement la dispersion.']]), hint: 'Compare les étendues : plus elle est petite, plus les notes sont regroupées.' },
    ];
    items.push({ what: 'ma', js: `${JS_SUM(a)}/5`, expect: M }, { what: 'mb', js: `${JS_SUM(b)}/5`, expect: M }, { what: 'ea', js: `Math.max(...${A(a)})-Math.min(...${A(a)})`, expect: ea }, { what: 'eb', js: `Math.max(...${A(b)})-Math.min(...${A(b)})`, expect: eb }, { what: 'step:2', js: String(corr(steps[2])), expect: corr(steps[2]) });
    sol.push(`Moyennes : ${m(`\\dfrac{${5 * M}}{5} = ${M}`)} pour les deux.`, `Étendues : ${n1}, ${m(`${Math.max(...a)} - ${Math.min(...a)} = ${ea}`)} ; ${n2}, ${m(`${Math.max(...b)} - ${Math.min(...b)} = ${eb}`)}.`, `${n1} est plus régulier : même moyenne, mais des notes bien moins dispersées.`);
    void level;
    return { title: 'Même moyenne, même profil ?', statement: `Notes de ${pa[0]} : ${pa[1].map((x) => m(String(x))).join(' ; ')}.\nNotes de ${pb[0]} : ${pb[1].map((x) => m(String(x))).join(' ; ')}.`, steps, solution: sol, answer: `${M} ; ${ea} et ${eb} ; ${n1}`, key: `h${a.join(',')}|${b.join(',')}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== trouver l'erreur
const ERR = ['Il n’a pas rangé la série avant de prendre la valeur du milieu.', 'Il n’a pas tenu compte des effectifs.', 'Il a confondu pourcentage et angle.', 'Il a confondu moyenne et médiane.', 'Il a calculé l’étendue sur les effectifs au lieu des valeurs.'];
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s41, links: [LINKS.s31, LINKS.s22, LINKS.s42, LINKS.s43],
  desc: 'Médiane sans ranger, moyenne non pondérée, 40 % → 40°, moyenne confondue avec médiane, étendue sur les effectifs.',
  example: '40\\,\\% \\to 0{,}4 \\times 360 = 144^\\circ',
  generate(rng: Rng, level: Level) {
    void level;
    const nm = rng.pick(NAMES.filter((x) => !['Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina', 'Sarah', 'Maëlle', 'Amina', 'Ana'].includes(x))), v = rng.int(0, 4), items: Item[] = [], sol: Rich[] = [];
    const qcm = (good: number): Step => ({ prompt: 'a) Quelle est l’erreur ?', answer: shuffledChoice(rng, ERR[good], rng.shuffle(ERR.filter((_, t) => t !== good)).slice(0, 3).map((e): [Rich, Rich] => [e, 'Relis son raisonnement : ce n’est pas là que ça coince.'])), hint: 'Refais le calcul toi-même en suivant la méthode du cours.' });
    let st: string, steps: Step[], ans: string, key: string, display: string | undefined;
    if (v === 0) {
      const n = rng.pick([5, 7]);
      let a: number[];
      do a = Array.from({ length: n }, () => rng.int(2, 19)); while (new Set(a).size < n || eq(median(a), q(a[(n - 1) / 2])));
      const med = median(a), srt = [...a].sort((x, y) => x - y);
      st = `${nm} écrit : « Série : ${a.map((x) => m(String(x))).join(' ; ')}. La médiane est ${m(String(a[(n - 1) / 2]))}, la valeur du milieu. »`;
      steps = [qcm(0), step('b) Quelle est la vraie médiane ?', [exactF('', med)], 'Range la série, puis prends la valeur du milieu.', mist(med, [[q(a[(n - 1) / 2]), 'C’est l’erreur : il faut ranger d’abord.']]))];
      items.push({ what: 'med', js: JS_MED(a), expect: toNum(med) });
      sol.push('Il faut d’abord **ranger** la série.', `Rangée : ${m(srt.join(' \\; ; \\; '))} ; la médiane est la ${ord((n + 1) / 2)} valeur, ${m(dn(med))}.`);
      ans = dn(med); key = `m${a.join(',')}`;
    } else if (v === 1) {
      let vals: number[], eff: number[], mean: Q;
      do { const b0 = rng.int(7, 12), d = rng.int(1, 3); vals = [b0, b0 + d, b0 + 2 * d]; eff = vals.map(() => rng.int(1, 7)); mean = q(sum(vals.map((x, t) => x * eff[t])), sum(eff)); } while (!isDec(mean, 1) || eq(mean, q(sum(vals), 3)));
      const N = sum(eff);
      st = `${nm} écrit : « ${vals.map((x, t) => `${m(String(eff[t]))} élève${eff[t] > 1 ? 's ont' : ' a'} ${m(String(x))}`).join(', ')}. Moyenne : ${m(`\\dfrac{${vals.join(' + ')}}{3} = ${sum(vals) / 3}`)}. »`;
      steps = [qcm(1), step('b) Quelle est la vraie moyenne ?', [exactF('', mean)], 'Pondère chaque valeur par son effectif, puis divise par l’effectif total.', mist(mean, [[q(sum(vals), 3), 'C’est l’erreur : chaque note compte autant de fois que son effectif.']]))];
      items.push({ what: 'moy', js: `${A(vals)}.reduce((s,v,i)=>s+v*${A(eff)}[i],0)/${JS_SUM(eff)}`, expect: toNum(mean) });
      sol.push('Il faut pondérer par les effectifs.', `${m(`\\dfrac{${vals.map((x, t) => `${x} \\times ${eff[t]}`).join(' + ')}}{${N}} = \\dfrac{${sum(vals.map((x, t) => x * eff[t]))}}{${N}} = ${dn(mean)}`)}.`);
      ans = dn(mean); key = `p${vals.join(',')}|${eff.join(',')}`;
    } else if (v === 2) {
      const p = rng.pick([10, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75]), ang = q(p * 36, 10);
      st = `${nm} écrit : « Une catégorie représente ${m(`${p}\\,\\%`)} de l’effectif, donc son secteur mesure ${m(`${p}^\\circ`)}. »`;
      steps = [qcm(2), step('b) Quel est le bon angle ?', [exactF('', ang, '°')], `${m(`${p}\\,\\%`)} de ${m('360^\\circ')}.`, mist(ang, [[q(p), 'C’est l’erreur.']]))];
      items.push({ what: 'a', js: `${p}/100*360`, expect: toNum(ang) });
      sol.push(`Un tour complet fait ${m('360^\\circ')}, pas 100.`, `${m(`${dn(q(p, 100))} \\times 360 = ${dn(ang)}`)}, soit ${m(`${dn(ang)}^\\circ`)}.`);
      ans = `${dn(ang)}°`; key = `a${p}`;
    } else if (v === 3) {
      let a: number[], M: number;
      do { M = rng.int(9, 13); a = Array.from({ length: 4 }, () => rng.int(3, M - 1)); a.push(5 * M - sum(a)); } while (a[4] > 20 || a[4] <= M);
      const above = a.filter((x) => x > M).length, sh = rng.shuffle(a);
      st = `${nm} écrit : « La moyenne du groupe est ${m(String(M))}, donc la moitié des élèves a plus de ${m(String(M))}. »\nNotes du groupe : ${sh.map((x) => m(String(x))).join(' ; ')}.`;
      steps = [qcm(3), step(`b) Combien d’élèves ont réellement plus de ${m(String(M))} ?`, [exactF('', q(above))], 'Compte-les dans la liste.')];
      items.push({ what: 'n', js: `${A(a)}.filter(x=>x>${M}).length`, expect: above });
      sol.push('« Au moins la moitié au-dessus » est une propriété de la **médiane**, pas de la moyenne.', `Ici, la moyenne vaut bien ${m(`\\dfrac{${sum(a)}}{5} = ${M}`)}, mais ${above > 1 ? 'seuls' : 'seul'} ${m(String(above))} élève${above > 1 ? 's ont' : ' a'} plus de ${m(String(M))} : la note ${m(String(Math.max(...a)))} tire la moyenne vers le haut.`);
      ans = String(above); key = `d${sh.join(',')}`;
    } else {
      const ctx = rng.pick(QUANTI), vals = ctx.vals.slice(0, 5);
      let eff: number[];
      do eff = vals.map(() => rng.int(1, 12)); while (Math.max(...eff) - Math.min(...eff) === vals[4] - vals[0]);
      const et = vals[4] - vals[0], bad = Math.max(...eff) - Math.min(...eff);
      display = effTable(cap(ctx.axis), vals, eff);
      st = `${nm} étudie le tableau ci-dessous (${ctx.car} de ${m(String(sum(eff)))} ${ctx.pop}) et écrit : « L’étendue est ${m(`${Math.max(...eff)} - ${Math.min(...eff)} = ${bad}`)}. »`;
      steps = [qcm(4), step('b) Quelle est la vraie étendue ?', [exactF('', q(et))], 'Plus grande valeur moins plus petite valeur du caractère.', mist(q(et), [[q(bad), 'C’est l’erreur.']]))];
      items.push({ what: 'et', js: `Math.max(...${A(vals)})-Math.min(...${A(vals)})`, expect: et });
      sol.push('L’étendue porte sur les **valeurs** du caractère, pas sur les effectifs.', `${m(`${vals[4]} - ${vals[0]} = ${et}`)}.`);
      ans = String(et); key = `e${ctx.car}|${eff.join(',')}`;
    }
    items.push({ what: 'step:0', js: String(corr(steps[0])), expect: corr(steps[0]) });
    return { title: 'Trouve l’erreur.', statement: st, ...(display ? { display } : {}), steps, solution: sol, answer: ans, key, data: { kind: 'js', items } };
  },
};
void ax;
