/**
 * Fraction d'une quantité et problèmes (★ → ★★). Contextes du cours : classe, réservoir, argent de poche,
 * club, verres de jus, pizza… À rebours : on choisit la réponse entière, la quantité de départ en découle.
 */
import { q, add, sub, mul, toNum, gcd } from '../engine/q';
import type { Generator, Level, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, NAMES } from '../engine/build';
import { LINKS, fr, fq } from './common';
import { irr } from './nombres';

/** Prénoms féminins de NAMES (accords). */
export const FEM = ['Ana', 'Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina', 'Sarah', 'Maëlle', 'Amina'];
type Ctx = { tot: (n: number) => string; part: (f: string) => string; unit: string; label: string; rest: string; range: [number, number]; dens: number[] };
const CTX: Ctx[] = [
  { tot: (n) => `Dans une classe de ${m(String(n))} élèves`, part: (f) => `les ${m(f)} font du football`, unit: 'élèves', label: 'Football :', rest: 'ne font pas de football', range: [20, 36], dens: [2, 3, 4, 5, 6, 7] },
  { tot: (n) => `Un réservoir contient ${m(String(n))} L`, part: (f) => `on en utilise les ${m(f)}`, unit: 'L', label: 'Utilisé :', rest: 'restent dans le réservoir', range: [40, 240], dens: [3, 4, 5, 6, 8, 10] },
  { tot: (n) => `Un livre compte ${m(String(n))} pages`, part: (f) => `Inès en a lu les ${m(f)}`, unit: 'pages', label: 'Lu :', rest: 'restent à lire', range: [120, 360], dens: [3, 4, 5, 6, 8, 9] },
  { tot: (n) => `Un trajet mesure ${m(String(n))} km`, part: (f) => `on en a parcouru les ${m(f)}`, unit: 'km', label: 'Parcouru :', rest: 'restent à parcourir', range: [60, 480], dens: [3, 4, 5, 6, 8] },
  { tot: (n) => `Un forfait téléphonique comprend ${m(String(n))} Go`, part: (f) => `Hugo en a utilisé les ${m(f)}`, unit: 'Go', label: 'Utilisé :', rest: 'restent', range: [20, 200], dens: [4, 5, 8, 10] },
  { tot: (n) => `Un sac contient ${m(String(n))} g de farine`, part: (f) => `une recette en demande les ${m(f)}`, unit: 'g', label: 'Recette :', rest: 'restent dans le sac', range: [250, 1500], dens: [4, 5, 8, 10] },
];
export const quantite: Generator = {
  id: 'quantite',
  title: 'Fraction d’une quantité',
  desc: '« Les 3/5 de 40 » ; retrouver le total (★★).',
  stars: 1,
  levels: [1, 2],
  example: '\\dfrac{3}{5} \\times 40 = 24',
  course: LINKS.s51,
  generate(rng: Rng, level: Level) {
    // heures en minutes : contexte à part (★)
    if (level === 1 && rng.chance(0.2)) {
      const b = rng.pick([3, 4, 5, 6, 10, 12, 15, 20]);
      let a: number;
      do a = rng.int(1, b - 1); while (gcd(a, b) !== 1);
      const h = rng.chance(0.4) ? 2 : 1, tot = 60 * h, v = (tot / b) * a;
      return {
        title: 'Calcule la durée.',
        statement: `Combien de minutes font les ${m(fr(a, b))} ${h === 1 ? 'd’une heure' : 'de deux heures'} ?`,
        steps: [{ prompt: '', answer: { kind: 'num', fields: [{ label: 'Durée :', expect: q(v), form: 'any', unit: 'min' }] }, hint: `${h === 1 ? 'Une heure' : 'Deux heures'}, c’est ${m(String(tot))} minutes ; prendre les ${m(fr(a, b))}, c’est multiplier par ${m(fr(a, b))}.`,
          mistakes: mist(q(v), [[q(tot / b), `C’est ${m(fr(1, b))} : il faut en prendre ${m(String(a))}.`], [q(h * 100 * a, b), 'Une heure fait 60 minutes, pas 100.']]) }],
        solution: [`${m(`${fr(a, b)} \\times ${tot} = (${tot} \\div ${b}) \\times ${a} = ${tot / b} \\times ${a} = ${v}`)} minutes.`, `Contrôle : ${m(fr(a, b))} est ${a / b < 0.5 ? 'moins' : 'plus'} que la moitié, et ${m(String(v))} est ${a / b < 0.5 ? 'moins' : 'plus'} que ${m(String(tot / 2))} ✓.`],
        answer: `${m(String(v))} min`,
        key: `h:${a}/${b}:${h}`,
        data: { kind: 'js', items: [{ what: 'v', js: `${a}/${b}*${tot}`, expect: v }] },
      };
    }
    const c = rng.pick(CTX);
    const b = rng.pick(c.dens);
    let a: number;
    do a = rng.int(1, b - 1); while (gcd(a, b) !== 1);
    // total multiple de b, dans la plage du contexte, « rond » pour les grandes quantités
    const step0 = c.range[1] > 400 ? 50 : c.range[1] > 200 ? 10 : 1;
    const cands: number[] = [];
    for (let n = c.range[0]; n <= c.range[1]; n++) if (n % b === 0 && n % step0 === 0) cands.push(n);
    const N = rng.pick(cands), part = (N / b) * a;
    if (level === 1) {
      const s1: Step = { prompt: `Combien cela représente-t-il ?`, answer: { kind: 'num', fields: [{ label: c.label, expect: q(part), form: 'any', unit: c.unit }] },
        hint: `Prendre les ${m(fr(a, b))} d’une quantité, c’est la multiplier par ${m(fr(a, b))} : divise par ${m(String(b))}, puis multiplie par ${m(String(a))}.`,
        mistakes: mist(q(part), [[q(N / b), `C’est seulement ${m(fr(1, b))} de la quantité : il faut en prendre ${m(String(a))} parts.`], [q(N * a), `Il faut aussi diviser par ${m(String(b))}.`], [b * N % a === 0 ? q((N * b) / a) : null, 'Tu as multiplié par l’inverse : « les ' + `${m(fr(a, b))}` + ' de », c’est « ' + m(`${fr(a, b)} \\times`) + ' ».']]) };
      const s2: Step = { prompt: `Combien ${c.rest} ?`, answer: { kind: 'num', fields: [{ label: 'Reste :', expect: q(N - part), form: 'any', unit: c.unit }] }, hint: `Soustrais au total, ou prends les ${m(fr(b - a, b))}.`, mistakes: [] };
      return {
        title: 'Calcule une fraction d’une quantité.',
        statement: `${c.tot(N)} ; ${c.part(fr(a, b))}.`,
        steps: [s1, s2],
        solution: [
          `${m(`${fr(a, b)} \\times ${N} = (${N} \\div ${b}) \\times ${a} = ${N / b} \\times ${a} = ${part}`)} ${c.unit}.`,
          `Il en reste ${m(`${N} - ${part} = ${N - part}`)} ${c.unit} (c’est aussi les ${m(fr(b - a, b))} de ${m(String(N))}).`,
          `Contrôle : ${m(`${part} + ${N - part} = ${N}`)} ✓.`,
        ],
        answer: `${m(String(part))} ${c.unit} ; reste ${m(String(N - part))} ${c.unit}`,
        key: `${c.unit}:${N}:${a}/${b}`,
        data: { kind: 'js', items: [{ what: 'part', js: `${a}/${b}*${N}`, expect: part }, { what: 'rest', js: `${N}*(1-${a}/${b})`, expect: N - part }] },
      };
    }
    // ★★ : retrouver le total (plages propres au contexte ; le total est un multiple de b)
    const who = rng.pick(NAMES);
    const b2 = rng.pick([3, 4, 5, 6, 8]);
    let a2: number;
    do a2 = rng.int(1, b2 - 1); while (gcd(a2, b2) !== 1);
    const kind2 = rng.pick(['eco', 'col', 'km']);
    const N2 = kind2 === 'eco' ? b2 * rng.int(3, 40) : kind2 === 'col' ? b2 * 10 * rng.int(Math.ceil(30 / b2), Math.floor(90 / b2)) : b2 * rng.int(2, 6) * rng.pick([1, 2, 3]);
    const part2 = (N2 / b2) * a2;
    const ctx = kind2 === 'eco'
      ? { st: `${who} a dépensé les ${m(fr(a2, b2))} de ses économies, soit ${m(String(part2))} €.`, q: 'Combien avait-il d’économies au départ ?', unit: '€', lab: 'Économies :' }
      : kind2 === 'col'
        ? { st: `Les ${m(fr(a2, b2))} des élèves d’un collège déjeunent à la cantine, soit ${m(String(part2))} élèves.`, q: 'Combien d’élèves compte le collège ?', unit: 'élèves', lab: 'Collège :' }
        : { st: `Une randonneuse a parcouru ${m(String(part2))} km, soit les ${m(fr(a2, b2))} du parcours.`, q: 'Quelle est la longueur totale du parcours ?', unit: 'km', lab: 'Parcours :' };
    {
      const a = a2, b = b2, N = N2, part = part2;
    const st = ctx.st;
    if (FEM.includes(who)) ctx.q = ctx.q.replace('avait-il', 'avait-elle');
    const s1: Step = { prompt: `Combien vaut ${m(fr(1, b))} de la quantité totale ?`, answer: { kind: 'num', fields: [{ label: m(`${fr(1, b)} :`), expect: q(N / b), form: 'any', unit: ctx.unit }] },
      hint: `${m(String(part))} ${ctx.unit}, c’est ${m(String(a))} parts de ${m(fr(1, b))} : divise par ${m(String(a))}.`, mistakes: mist(q(N / b), [[q(part, b), `${m(String(part))} correspond à ${m(String(a))} parts, pas à ${m(String(b))} parts.`]]) };
    const s2: Step = { prompt: ctx.q, answer: { kind: 'num', fields: [{ label: ctx.lab, expect: q(N), form: 'any', unit: ctx.unit }] }, hint: `Le total, c’est ${m(fr(b, b))} : ${m(String(b))} parts de ${m(fr(1, b))}.`,
      mistakes: mist(q(N), [[mul(q(a, b), q(part)), `Tu as pris les ${m(fr(a, b))} de ${m(String(part))} : mais ${m(String(part))} est déjà une partie du total, qui est plus grand.`]]) };
    return {
      title: 'Retrouve la quantité totale.',
      statement: st,
      steps: [s1, s2],
      solution: [
        `${m(String(part))} ${ctx.unit} représentent ${m(String(a))} part${a > 1 ? 's' : ''} de ${m(fr(1, b))} : ${m(fr(1, b))} vaut ${m(`${part} \\div ${a} = ${N / b}`)} ${ctx.unit}.`,
        `Le total vaut ${m(`${b} \\times ${N / b} = ${N}`)} ${ctx.unit}.`,
        `Contrôle : ${m(`${fr(a, b)} \\times ${N} = ${part}`)} ✓.`,
      ],
      answer: `${m(String(N))} ${ctx.unit}`,
      key: `tot:${ctx.unit}:${N}:${a}/${b}`,
      data: { kind: 'js', items: [{ what: 'unit', js: `${part}/${a}`, expect: N / b }, { what: 'N', js: `${part}/(${a}/${b})`, expect: N }] },
    };
    }
  },
};

// ===================================================================== problèmes en plusieurs étapes
export const probleme: Generator = {
  id: 'probleme',
  title: 'Problèmes',
  desc: 'Pizza, verres, réservoir, club, argent de poche, « augmenté de sa moitié ».',
  stars: 2,
  levels: [1, 2],
  example: '1 - \\left(\\dfrac{1}{4} + \\dfrac{1}{3}\\right) = \\dfrac{5}{12}',
  course: LINKS.serieJ,
  links: [LINKS.s4, LINKS.s51, LINKS.s6],
  generate(rng: Rng, level: Level) {
    const kind = level === 1 ? rng.pick(['pizza', 'verres']) : rng.pick(['reservoir', 'club', 'argent', 'augmente']);
    const [n1, n2] = rng.shuffle(NAMES).slice(0, 2);
    switch (kind) {
      case 'pizza': {
        let a: number, b: number, c: number, d: number;
        do { b = rng.int(2, 8); d = rng.intNot(2, 8, b); a = rng.int(1, b - 1); c = rng.int(1, d - 1); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a / b + c / d >= 1 || (b * d) / gcd(b, d) > 40);
        const food = rng.pick(['pizza', 'tarte', 'galette']);
        const eaten = add(q(a, b), q(c, d)), rest = sub(q(1), eaten);
        const L = (b * d) / gcd(b, d);
        return {
          title: 'Résous le problème.',
          statement: `${n1} mange ${m(fr(a, b))} d’une ${food} et ${n2} en mange ${m(fr(c, d))}.`,
          steps: [
            { prompt: `Quelle fraction de la ${food} ont-${FEM.includes(n1) && FEM.includes(n2) ? 'elles' : 'ils'} mangée ensemble ?`, answer: { kind: 'num', fields: [irr('Mangé :', eaten)] }, hint: `Même dénominateur d’abord : ${m(String(L))}.`, mistakes: mist(eaten, [[q(a + c, b + d), 'On n’ajoute pas les dénominateurs : mets au même dénominateur.']]) },
            { prompt: 'Quelle fraction reste-t-il ?', answer: { kind: 'num', fields: [irr('Reste :', rest)] }, hint: `La ${food} entière, c’est ${m('1')}.`, mistakes: [] },
          ],
          solution: [
            m(`${fr(a, b)} + ${fr(c, d)} = ${fr(a * (L / b), L)} + ${fr(c * (L / d), L)} = ${fr(a * (L / b) + c * (L / d), L)}`) + (gcd(a * (L / b) + c * (L / d), L) > 1 ? m(` = ${fq(eaten)}`) : '') + ' mangés.',
            `Il reste ${m(`1 - ${fq(eaten)} = ${fr(eaten.d, eaten.d)} - ${fq(eaten)} = ${fq(rest)}`)} de la ${food}.`,
            `Contrôle : ${m(`${fq(eaten)} + ${fq(rest)} = 1`)} ✓.`,
          ],
          answer: `${m(fq(eaten))} mangés ; reste ${m(fq(rest))}`,
          key: `pz:${a}/${b}+${c}/${d}`,
          data: { kind: 'js', items: [{ what: 'eaten', js: `${a}/${b}+${c}/${d}`, expect: toNum(eaten) }, { what: 'rest', js: `1-${a}/${b}-${c}/${d}`, expect: toNum(rest) }] },
        };
      }
      case 'verres': {
        const [a, b] = rng.pick([[3, 4], [1, 4], [1, 3], [2, 3], [1, 5], [2, 5], [1, 8], [3, 8], [1, 6]] as [number, number][]);
        const kq = rng.int(2, 12);
        const V = kq * a; // litres, n = V ÷ (a/b) = kq·b
        const n = kq * b;
        if (n > 60 || V > 20) return probleme.generate(rng, level);
        const what = rng.pick([['verres', 'jus'], ['bouteilles', 'eau'], ['gourdes', 'sirop dilué']]);
        return {
          title: 'Résous le problème.',
          statement: `Combien de ${what[0]} de ${m(fr(a, b))} de litre peut-on remplir avec ${m(String(V))} L de ${what[1]} ?`,
          steps: [{ prompt: '', answer: { kind: 'num', fields: [{ label: 'Nombre :', expect: q(n), form: 'any', unit: what[0] }] }, hint: `On cherche combien de fois ${m(fr(a, b))} « va » dans ${m(String(V))} : c’est la division ${m(`${V} \\div ${fr(a, b)}`)}.`,
            mistakes: mist(q(n), [[mul(q(V), q(a, b)), `Tu as multiplié par ${m(fr(a, b))} : on cherche combien de fois ${m(fr(a, b))} L tient dans ${m(String(V))} L, c’est une division.`]]) }],
          solution: [`${m(a === 1 ? `${V} \\div ${fr(a, b)} = ${V} \\times ${b} = ${n}` : `${V} \\div ${fr(a, b)} = ${V} \\times ${fr(b, a)} = ${fr(V * b, a)} = ${n}`)} ${what[0]}.`, `Contrôle : ${m(`${n} \\times ${fr(a, b)} = ${fr(n * a, b)} = ${V}`)} L ✓.`],
          answer: `${m(String(n))} ${what[0]}`,
          key: `v:${V}:${a}/${b}:${what[0]}`,
          data: { kind: 'js', items: [{ what: 'n', js: `${V}/(${a}/${b})`, expect: n }] },
        };
      }
      case 'reservoir': {
        // on utilise a/b, puis c/d de ce qui reste
        let a: number, b: number, c: number, d: number, T: number;
        do { b = rng.pick([3, 4, 5, 6, 8]); a = rng.int(1, b - 1); d = rng.pick([2, 3, 4, 5]); c = rng.int(1, d - 1); T = b * d * rng.int(1, 8) * rng.pick([1, 2, 5]); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || T < 40 || T > 600);
        const used1 = (T / b) * a, r1 = T - used1, used2 = (r1 / d) * c, r2 = r1 - used2;
        const naive = T - used1 - (T / d) * c;
        const c2 = rng.pick([
          { s: `Un réservoir contient ${m(String(T))} L. On en utilise les ${m(fr(a, b))}, puis ${c === 1 ? `le ${['', '', 'moitié', 'tiers', 'quart', 'cinquième'][d]}` : `les ${m(fr(c, d))}`} de ce qui reste.`.replace('le moitié', 'la moitié'), u: 'L', q1: 'Quelle quantité reste-t-il après la première utilisation ?', q2: 'Quelle quantité reste-t-il à la fin ?' },
          { s: `Une cagnotte de classe contient ${m(String(T))} €. On en dépense les ${m(fr(a, b))} pour une sortie, puis ${c === 1 ? `le ${['', '', 'moitié', 'tiers', 'quart', 'cinquième'][d]}` : `les ${m(fr(c, d))}`} de ce qui reste pour un cadeau.`.replace('le moitié', 'la moitié'), u: '€', q1: 'Combien reste-t-il après la sortie ?', q2: 'Combien reste-t-il à la fin ?' },
        ]);
        return {
          title: 'Résous le problème.',
          statement: c2.s,
          steps: [
            { prompt: c2.q1, answer: { kind: 'num', fields: [{ label: 'Reste :', expect: q(r1), form: 'any', unit: c2.u }] }, hint: `Calcule les ${m(fr(a, b))} de ${m(String(T))}, puis soustrais.`, mistakes: mist(q(r1), [[q(used1), 'C’est ce qu’on a utilisé ; on demande ce qui reste.']]) },
            { prompt: c2.q2, answer: { kind: 'num', fields: [{ label: 'Reste :', expect: q(r2), form: 'any', unit: c2.u }] }, hint: `La deuxième fraction porte sur **ce qui reste** (${m(String(r1))}), pas sur le total.`, mistakes: mist(q(r2), [[naive > 0 ? q(naive) : null, `La fraction ${m(fr(c, d))} se prend sur ce qui reste (${m(String(r1))}), pas sur ${m(String(T))}.`], [q(used2), 'C’est la deuxième dépense ; on demande ce qui reste.']]) },
          ],
          solution: [
            `D’abord : ${m(`${fr(a, b)} \\times ${T} = ${used1}`)} ; il reste ${m(`${T} - ${used1} = ${r1}`)} ${c2.u}.`,
            `Puis : ${m(`${fr(c, d)} \\times ${r1} = ${used2}`)} ; il reste ${m(`${r1} - ${used2} = ${r2}`)} ${c2.u}.`,
            `Contrôle : ${m(`${used1} + ${used2} + ${r2} = ${T}`)} ✓.`,
          ],
          answer: `${m(String(r2))} ${c2.u}`,
          key: `res:${T}:${a}/${b}:${c}/${d}:${c2.u}`,
          data: { kind: 'js', items: [{ what: 'r1', js: `${T}*(1-${a}/${b})`, expect: r1 }, { what: 'r2', js: `${T}*(1-${a}/${b})*(1-${c}/${d})`, expect: r2 }] },
        };
      }
      case 'club': {
        // 1/p + 1/r (+ ...) ; les n autres : total
        let p: number, r: number, n: number;
        do { p = rng.int(2, 5); r = rng.intNot(3, 8, p); n = rng.int(3, 18); } while (1 / p + 1 / r >= 0.95 || (p * r) / gcd(p, r) > 30);
        const fracRest = sub(q(1), add(q(1, p), q(1, r)));
        const tot = n * fracRest.d / fracRest.n;
        if (!Number.isInteger(tot) || tot > 400 || tot % p !== 0 || tot % r !== 0) return probleme.generate(rng, level);
        const acts = rng.pick([['natation', 'tennis', 'danse'], ['théâtre', 'chorale', 'arts plastiques'], ['football', 'basket', 'escalade']]);
        const word = (k: number) => ['', '', 'la moitié', 'le tiers', 'le quart', 'le cinquième', 'le sixième', 'le septième', 'le huitième'][k];
        return {
          title: 'Résous le problème.',
          statement: `Dans un club, ${word(p)} des membres fait ${acts[0] === 'natation' ? 'de la natation' : `du ${acts[0]}`.replace('du arts', 'des arts').replace('du chorale', 'de la chorale')}, ${word(r)} fait ${`du ${acts[1]}`.replace('du chorale', 'de la chorale')}, et les ${m(String(n))} autres font ${`du ${acts[2]}`.replace('du danse', 'de la danse').replace('du arts', 'des arts').replace('du escalade', 'de l’escalade')} (chacun une seule activité).`,
          steps: [
            { prompt: `Quelle fraction du club représentent les ${m(String(n))} derniers ?`, answer: { kind: 'num', fields: [irr('Fraction :', fracRest)] }, hint: `Calcule ${m(`1 - \\left(${fr(1, p)} + ${fr(1, r)}\\right)`)}.`, mistakes: mist(fracRest, [[add(q(1, p), q(1, r)), 'C’est la fraction des deux premières activités ; on demande ce qui reste.']]) },
            { prompt: 'Combien le club a-t-il de membres ?', answer: { kind: 'num', fields: [{ label: 'Membres :', expect: q(tot), form: 'any' }] }, hint: `${m(String(n))} membres représentent ${m(fq(fracRest))} du club : combien pour ${m(fr(1, fracRest.d))}, puis pour tout le club ?`, mistakes: mist(q(tot), [[mul(q(n), fracRest), `${m(String(n))} est une partie du club : le total est plus grand.`]]) },
          ],
          solution: [
            `Les deux premières activités : ${m(`${fr(1, p)} + ${fr(1, r)} = ${fq(add(q(1, p), q(1, r)))}`)} du club.`,
            `Le reste : ${m(`1 - ${fq(add(q(1, p), q(1, r)))} = ${fq(fracRest)}`)} du club, soit ${m(String(n))} membres.`,
            fracRest.n === 1 ? `Le club compte ${m(`${fracRest.d} \\times ${n} = ${tot}`)} membres.` : `${m(fr(1, fracRest.d))} du club : ${m(`${n} \\div ${fracRest.n} = ${n / fracRest.n}`)} membres ; le club compte ${m(`${fracRest.d} \\times ${n / fracRest.n} = ${tot}`)} membres.`,
            `Contrôle : ${m(`${tot / p} + ${tot / r} + ${n} = ${tot}`)} ✓.`,
          ],
          answer: `${m(String(tot))} membres`,
          key: `club:${p}:${r}:${n}`,
          data: { kind: 'js', items: [{ what: 'f', js: `1-1/${p}-1/${r}`, expect: toNum(fracRest) }, { what: 'tot', js: `${n}/(1-1/${p}-1/${r})`, expect: tot }] },
        };
      }
      case 'argent': {
        // dépense 1/p, puis 1/r de ce qui reste ; il reste R
        const p = rng.pick([2, 3, 4, 5]), r = rng.pick([2, 3, 4, 5]);
        const left = mul(sub(q(1), q(1, p)), sub(q(1), q(1, r)));
        const k = rng.int(1, 12);
        const S = left.d * k * (rng.chance(0.5) ? 1 : 2);
        const R = toNum(mul(left, q(S)));
        if (S > 300 || S < 20 || !Number.isInteger(R)) return probleme.generate(rng, level);
        const w = (x: number) => (x === 2 ? 'la moitié' : x === 3 ? 'le tiers' : x === 4 ? 'le quart' : 'le cinquième');
        const sp1 = S / p, sp2 = (S - sp1) / r;
        return {
          title: 'Résous le problème.',
          statement: `${n1} dépense ${w(p)} de son argent de poche pour un livre, puis ${w(r)} de ce qui lui reste au cinéma. Il lui reste ${m(String(R))} €.`,
          steps: [
            { prompt: 'Quelle fraction de l’argent de départ lui reste-t-il ?', answer: { kind: 'num', fields: [irr('Fraction :', left)] }, hint: `Après le livre, il reste ${m(fr(p - 1, p))}. Le cinéma prend ${m(fr(1, r))} **de ce reste**.`,
              mistakes: mist(left, [[sub(q(1), add(q(1, p), q(1, r))), `La seconde dépense est ${m(fr(1, r))} de ce qui reste, pas de l’argent de départ.`]]) },
            { prompt: `Combien avait-${FEM.includes(n1) ? 'elle' : 'il'} au départ ?`, answer: { kind: 'num', fields: [{ label: 'Départ :', expect: q(S), form: 'any', unit: '€' }] }, hint: `${m(String(R))} € représentent ${m(fq(left))} de la somme de départ.`, mistakes: mist(q(S), [[mul(q(R), left), `${m(String(R))} € est une partie de la somme de départ : celle-ci est plus grande.`]]) },
          ],
          solution: [
            `Après le livre, il reste ${m(`1 - ${fr(1, p)} = ${fr(p - 1, p)}`)} de l’argent. Le cinéma coûte ${m(`${fr(1, r)} \\times ${fr(p - 1, p)} = ${fq(q(p - 1, p * r))}`)} de l’argent de départ.`,
            `Il reste ${m(`${fq(q(p - 1, p))} - ${fq(q(p - 1, p * r))} = ${fq(left)}`)} de l’argent de départ, soit ${m(String(R))} €.`,
            `Au départ : ${m(`${R} \\div ${fq(left)} = ${R} \\times ${fr(left.d, left.n)} = ${S}`)} €.`,
            `Contrôle : livre ${m(String(sp1))} €, reste ${m(String(S - sp1))} € ; cinéma ${m(String(sp2))} €, reste ${m(String(S - sp1 - sp2))} € ✓.`,
          ],
          answer: `${m(String(S))} €`,
          key: `arg:${p}:${r}:${S}`,
          data: { kind: 'js', items: [{ what: 'f', js: `(1-1/${p})*(1-1/${r})`, expect: toNum(left) }, { what: 'S', js: `${R}/((1-1/${p})*(1-1/${r}))`, expect: S }] },
        };
      }
      default: {
        // un nombre augmenté de ses a/b donne X
        const [a, b] = rng.pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5], [2, 5]] as [number, number][]);
        const x = b * rng.int(2, 15);
        const X = x + (x / b) * a;
        const wd = a === 1 ? (b === 2 ? 'sa moitié' : b === 3 ? 'son tiers' : b === 4 ? 'son quart' : 'son cinquième') : `ses ${m(fr(a, b))}`;
        const coef = q(a + b, b);
        return {
          title: 'Résous le problème.',
          statement: `Un nombre augmenté de ${wd} donne ${m(String(X))}. Quel est ce nombre ?`,
          steps: [
            { prompt: 'Le nombre et sa fraction font quelle fraction du nombre ?', answer: { kind: 'num', fields: [irr('Fraction :', coef)] }, hint: `Le nombre, c’est ${m(fr(b, b))} du nombre. Ajoute ${m(fr(a, b))}.`, mistakes: mist(coef, [[q(a, b), 'Il faut compter aussi le nombre lui-même (' + m(fr(b, b)) + ').']]) },
            { prompt: 'Quel est ce nombre ?', answer: { kind: 'num', fields: [{ label: 'Nombre :', expect: q(x), form: 'any' }] }, hint: `${m(`${fq(coef)} \\times x = ${X}`)} : divise ${m(String(X))} par ${m(fq(coef))}.`, mistakes: mist(q(x), [[q(X * (b - a), b), `On ne retire pas ${wd} de ${m(String(X))} : ${wd.startsWith('ses') ? 'les fractions portent' : 'la fraction porte'} sur le nombre cherché, pas sur ${m(String(X))}.`]]) },
          ],
          solution: [
            `Le nombre et ${wd} font ${m(`${fr(b, b)} + ${fr(a, b)} = ${fr(a + b, b)}`)} du nombre : ${m(`${fr(a + b, b)}\\,x = ${X}`)}.`,
            `${m(`x = ${X} \\div ${fr(a + b, b)} = ${X} \\times ${fr(b, a + b)} = ${x}`)}.`,
            `Contrôle : ${m(`${x} + ${fr(a, b)} \\times ${x} = ${x} + ${(x / b) * a} = ${X}`)} ✓.`,
          ],
          answer: m(`x = ${x}`),
          key: `aug:${a}/${b}:${X}`,
          data: { kind: 'js', items: [{ what: 'coef', js: `1+${a}/${b}`, expect: toNum(coef) }, { what: 'x', js: `${X}/(1+${a}/${b})`, expect: x }] },
        };
      }
    }
  },
};
