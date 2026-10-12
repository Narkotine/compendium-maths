/**
 * Problèmes avec des relatifs (★ → ★★) : températures, altitudes, comptes, années, ascenseur, quiz,
 * moyenne de températures. Valeurs choisies pour être réalistes (températures de −25 à 20 °C,
 * sous-marin entre −400 et −30 m…). Les années de naissance et de mort sont des données historiques.
 */
import { type Q, q } from '../engine/q';
import type { Generator, Level, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, dn, pn, numStep, NAMES } from '../engine/build';
import { LINKS } from './common';

const P = (v: number) => (v < 0 ? `(${v})` : String(v));
const fmt = (v: number) => dn(q(v));
const VILLES = ['Moscou', 'Montréal', 'Oslo', 'Helsinki', 'Oulan-Bator', 'Stockholm', 'Reykjavik', 'Chamonix'];
/** Savants de l'Antiquité nés et morts avant notre ère (dates approximatives, en années). */
const SAVANTS: [string, number, number][] = [
  ['Pythagore', -570, -495],
  ['Thalès', -625, -547],
  ['Archimède', -287, -212],
  ['Aristote', -384, -322],
  ['Platon', -428, -348],
  ['Socrate', -470, -399],
  ['Ératosthène', -276, -194],
  ['Démocrite', -460, -370],
];

type Out = { title: Rich; steps: Step[]; lines: Rich[]; answer: Rich; key: string; items: { what: string; js: string; expect: number }[] };

function temperature(rng: Rng): Out {
  const ville = rng.pick(VILLES);
  const t1 = -rng.int(4, 25);
  const t2 = rng.chance(0.6) ? -rng.int(0, -t1 - 2) : rng.int(1, 12);
  const v = t2 - t1;
  return {
    title: `À ${ville}, il fait ${m(fmt(t1))} °C le matin et ${m(fmt(t2))} °C à midi. De combien de degrés la température a-t-elle augmenté ?`,
    steps: [numStep('', 'Elle a augmenté de', q(v), 'Variation = température finale − température initiale.', [
      [q(t2 + t1), `Il faut **soustraire** la température initiale : ${m(`${t2} - ${P(t1)}`)}.`],
      [q(-v), 'Elle a augmenté : la variation est positive. Calcule « finale − initiale ».'],
      [q(Math.abs(Math.abs(t1) - Math.abs(t2))), `Soustraire ${m(P(t1))}, c’est ajouter ${m(String(-t1))} : ${m(`${t2} - ${P(t1)} = ${t2} + ${-t1}`)}.`],
    ], { unit: 'degrés' })],
    lines: [`Variation ${m('=')} température finale ${m('-')} température initiale ${m(`= ${t2} - ${P(t1)} = ${t2} + ${-t1} = ${v}`)}.`, `La température a augmenté de ${m(String(v))} degrés.`, `Contrôle : en partant de ${m(String(t1))} °C et en montant de ${m(String(v))} degrés, on arrive à ${m(`${t1} + ${v} = ${t2}`)} °C ✓.`],
    answer: `${m(String(v))} degrés`,
    key: `temp:${t1}:${t2}`,
    items: [{ what: 'variation', js: `${t2} - (${t1})`, expect: v }],
  };
}
function sousMarin(rng: Rng): Out {
  const h = -rng.int(6, 40) * 10, up = rng.int(2, 25) * 5, down = rng.int(2, 25) * 5;
  const order = rng.chance(0.5);
  const f = h + up - down;
  if (f >= 0) return sousMarin(rng);
  const txt = order ? `Il remonte de ${m(String(up))} m, puis plonge de ${m(String(down))} m.` : `Il plonge de ${m(String(down))} m, puis remonte de ${m(String(up))} m.`;
  const calc = order ? `${h} + ${up} - ${down}` : `${h} - ${down} + ${up}`;
  return {
    title: `Un sous-marin est à l’altitude ${m(String(h))} m. ${txt} À quelle altitude est-il ?`,
    steps: [numStep('', 'Altitude :', q(f), 'Remonter, c’est ajouter ; plonger, c’est soustraire. Pars de l’altitude de départ.', [
      [q(h - up + down), 'Remonter fait **augmenter** l’altitude (on ajoute), plonger la fait diminuer (on soustrait).'],
      [q(-h + up - down), 'L’altitude de départ est négative : le sous-marin est sous la surface.'],
      [q(-f), 'Le sous-marin est sous la surface : son altitude est négative.'],
    ], { unit: 'm' })],
    lines: [m(`${calc} = ${f}`), `Le sous-marin est à l’altitude ${m(String(f))} m (${m(String(-f))} m sous la surface).`],
    answer: `${m(String(f))} m`,
    key: `sm:${h}:${up}:${down}:${order}`,
    items: [{ what: 'altitude', js: `${h} + ${up} - ${down}`, expect: f }],
  };
}
function compte(rng: Rng): Out {
  const s = -rng.int(2, 30) * 5, dep = rng.int(2, 20) * 5, ret = rng.int(2, 20) * 5;
  const f = s + dep - ret;
  const name = rng.pick(NAMES);
  return {
    title: `Le compte de ${name} affiche ${m(String(s))} €. ${name} dépose ${m(String(dep))} €, puis retire ${m(String(ret))} €. Quel est le nouveau solde ?`,
    steps: [numStep('', 'Solde :', q(f), 'Déposer, c’est ajouter ; retirer, c’est soustraire. Pars du solde de départ (négatif : découvert).', [
      [q(-s + dep - ret), `Le solde de départ est **négatif** (${m(String(s))} €, un découvert).`],
      [q(s - dep + ret), 'Un dépôt fait augmenter le solde, un retrait le fait diminuer.'],
      [q(-f), 'Attention au signe du solde.'],
    ], { unit: '€' })],
    lines: [m(`${s} + ${dep} - ${ret} = ${f}`), f < 0 ? `Le solde est de ${m(String(f))} € (découvert de ${m(String(-f))} €).` : `Le solde est de ${m(String(f))} €.`],
    answer: `${m(String(f))} €`,
    key: `cpt:${s}:${dep}:${ret}`,
    items: [{ what: 'solde', js: `${s} + ${dep} - ${ret}`, expect: f }],
  };
}
function annees(rng: Rng): Out {
  const [nom, a, b] = rng.pick(SAVANTS);
  const age = b - a;
  return {
    title: `${nom} serait né vers ${m(String(a))} et mort vers ${m(String(b))}. En comptant les années comme des relatifs, à quel âge environ est-il mort ?`,
    steps: [numStep('', 'Âge :', q(age), 'Durée = année de la mort − année de naissance.', [
      [q(Math.abs(a + b)), `Il faut **soustraire** : ${m(`${b} - ${P(a)}`)}.`],
      [q(-age), 'Un âge est positif : calcule « année de la mort − année de naissance ».'],
    ], { unit: 'ans' })],
    lines: [m(`${b} - ${P(a)} = ${b} + ${-a} = ${age}`), `${nom} est mort à environ ${m(String(age))} ans.`, `Contrôle : né ${m(String(-a))} ans avant notre ère, mort ${m(String(-b))} ans avant : il a vécu ${m(`${-a} - ${-b} = ${age}`)} ans ✓.`],
    answer: `environ ${m(String(age))} ans`,
    key: `an:${nom}`,
    items: [{ what: 'âge', js: `${b} - (${a})`, expect: age }],
  };
}
function ascenseur(rng: Rng, two: boolean): Out {
  const start = -rng.int(1, 3);
  const moves = [rng.int(3, 9), -rng.int(4, 11), rng.int(2, 6)];
  if (rng.chance(0.4)) moves.push(-rng.int(1, 4));
  let lv = start;
  for (const mv of moves) lv += mv;
  const pos = (v: number) => (v === 0 ? 'au rez-de-chaussée (niveau $0$)' : `au niveau ${m(String(v))}`);
  // jamais en dessous du parking le plus bas (−4)
  let cur = start, ok = true;
  for (const mv of moves) {
    cur += mv;
    if (cur < -4 || cur > 12) ok = false;
  }
  if (!ok || lv === start) return ascenseur(rng, two);
  const desc = moves.map((mv, i) => `${i === moves.length - 1 && moves.length > 1 ? 'puis ' : ''}${mv > 0 ? 'monte' : 'descend'} de ${m(String(Math.abs(mv)))} niveaux`).join(', ');
  const tot = moves.reduce((s, x) => s + Math.abs(x), 0);
  const steps: Step[] = [
    numStep(two ? 'a) À quel niveau arrive-t-il ?' : '', 'Niveau', q(lv), 'Monter, c’est ajouter ; descendre, c’est soustraire. Pars du niveau de départ.', [
      [q(-start + moves.reduce((s, x) => s + x, 0)), `Le niveau de départ est ${m(String(start))} (sous-sol) : il est négatif.`],
      [q(start + tot), 'Descendre fait **diminuer** le niveau.'],
    ]),
  ];
  const lines: Rich[] = [`${two ? 'a) ' : ''}${m(`${start}${moves.map((x) => (x > 0 ? ` + ${x}` : ` - ${-x}`)).join('')} = ${lv}`)} : l’ascenseur arrive ${pos(lv)}.`];
  if (two) {
    steps.push(numStep('b) Combien de niveaux a-t-il parcourus en tout ?', 'En tout :', q(tot), 'Les distances parcourues s’ajoutent toutes, qu’on monte ou qu’on descende.', [[q(lv - start), 'Ça, c’est le déplacement entre le départ et l’arrivée. Ici on veut la distance totale parcourue : on ajoute tous les trajets.'], [q(Math.abs(lv - start)), 'Ça, c’est l’écart entre le départ et l’arrivée. On veut le total des trajets.']], { unit: 'niveaux' }));
    lines.push(`b) ${m(`${moves.map((x) => Math.abs(x)).join(' + ')} = ${tot}`)} niveaux (les distances s’ajoutent toutes).`);
  }
  return {
    title: `Un ascenseur part du niveau ${m(String(start))} (parking). Il ${desc}.${two ? '' : ' À quel niveau arrive-t-il ?'}`,
    steps,
    lines,
    answer: `niveau ${m(String(lv))}${two ? ` ; ${m(String(tot))} niveaux parcourus` : ''}`,
    key: `asc:${start}:${moves.join(',')}:${two}`,
    items: [{ what: 'niveau', js: `${start}${moves.map((x) => ` + (${x})`).join('')}`, expect: lv }, ...(two ? [{ what: 'total', js: moves.map((x) => `Math.abs(${x})`).join(' + '), expect: tot }] : [])],
  };
}
function quiz(rng: Rng): Out {
  const N = rng.pick([20, 20, 25, 30]);
  const plus = rng.pick([3, 4, 5]), moins = rng.pick([1, 2]);
  const bon = rng.int(Math.floor(N / 3), N - 4), mauv = rng.int(2, N - bon - 1), abs = N - bon - mauv;
  const sc = bon * plus - mauv * moins;
  const [n1, n2] = rng.shuffle(NAMES);
  // Lina : on connaît bonnes réponses et score, on cherche les mauvaises
  const b2 = rng.int(Math.floor(N / 4), N - 5), m2 = rng.int(1, Math.min(N - b2 - 1, 9));
  const sc2 = b2 * plus - m2 * moins;
  return {
    title: `À un quiz de ${m(String(N))} questions, une bonne réponse rapporte ${m(String(plus))} points, une mauvaise en retire ${m(String(moins))}, une absence de réponse rapporte ${m('0')}.`,
    steps: [
      numStep(`a) ${n1} a ${m(String(bon))} bonnes réponses, ${m(String(mauv))} mauvaises et ${m(String(abs))} sans réponse. Calcule son score.`, 'Score :', q(sc), `Chaque mauvaise réponse compte ${m(String(-moins))} : score ${m('=')} bonnes ${m('\\times')} ${m(String(plus))} ${m('+')} mauvaises ${m(`\\times (${-moins})`)}.`, [
        [q(bon * plus + mauv * moins), 'Les mauvaises réponses **retirent** des points.'],
        [q(bon * plus), 'Tu as oublié de retirer les points des mauvaises réponses.'],
      ], { unit: 'points' }),
      numStep(`b) ${n2} a ${m(String(b2))} bonnes réponses et un score de ${m(String(sc2))}. Quel est son nombre de mauvaises réponses ?`, 'Mauvaises réponses :', q(m2), `Les bonnes réponses rapportent ${m(`${b2} \\times ${plus}`)} points : combien de points ont été perdus ?`, [
        [q(b2 * plus - sc2), `Ça, c’est le nombre de points perdus. Chaque mauvaise réponse en retire ${m(String(moins))} : divise.`],
      ]),
    ],
    lines: [`a) ${m(`${bon} \\times ${plus} + ${mauv} \\times (${-moins}) = ${bon * plus} - ${mauv * moins} = ${sc}`)} points.`, `b) Les bonnes réponses rapportent ${m(`${b2} \\times ${plus} = ${b2 * plus}`)} points ; il faut en perdre ${m(`${b2 * plus} - ${P(sc2)} = ${b2 * plus - sc2}`)}, soit ${m(`${b2 * plus - sc2} \\div ${moins} = ${m2}`)} mauvaise${m2 > 1 ? 's' : ''} réponse${m2 > 1 ? 's' : ''}.`],
    answer: `${m(String(sc))} points ; ${m(String(m2))} mauvaise${m2 > 1 ? 's' : ''} réponse${m2 > 1 ? 's' : ''}`,
    key: `quiz:${N}:${plus}:${moins}:${bon}:${mauv}:${b2}:${m2}`,
    items: [{ what: 'score', js: `${bon}*${plus} - ${mauv}*${moins}`, expect: sc }, { what: 'mauvaises', js: `(${b2}*${plus} - ${sc2})/${moins}`, expect: m2 }],
  };
}
function moyenne(rng: Rng): Out {
  // 7 températures entières de moyenne entière (construites à rebours : on choisit la moyenne)
  const mu = rng.int(-3, 1);
  let ts: number[];
  do {
    ts = Array.from({ length: 6 }, () => mu + rng.int(-7, 7));
    ts.push(7 * mu - ts.reduce((s, x) => s + x, 0));
  } while (Math.abs(ts[6] - mu) > 7 || ts.filter((t) => t < 0).length < 2 || ts.filter((t) => t > 0).length < 2 || new Set(ts).size < 5);
  const mx = Math.max(...ts), mn = Math.min(...ts);
  const S = ts.reduce((s, x) => s + x, 0);
  const pos = ts.filter((t) => t > 0), negs = ts.filter((t) => t < 0);
  const sumAbs = ts.reduce((s, x) => s + Math.abs(x), 0);
  const Sp = pos.reduce((s, x) => s + x, 0), Sn = negs.reduce((s, x) => s + x, 0);
  return {
    title: `Températures relevées à midi pendant une semaine (en °C) : ${ts.map((t) => m(String(t))).join(' ; ')}.`,
    steps: [
      numStep('a) Quel est le plus grand écart de température de la semaine ?', 'Écart :', q(mx - mn), 'Écart = plus haute température − plus basse.', [[q(mx + mn), `Il faut **soustraire** la plus basse : ${m(`${mx} - ${P(mn)}`)}.`], [q(Math.abs(mx) - Math.abs(mn)), `Soustraire ${m(P(mn))}, c’est ajouter ${m(String(-mn))}.`]], { unit: 'degrés' }),
      numStep('b) Calcule la température moyenne.', 'Moyenne :', q(mu), 'Moyenne = somme des températures ÷ nombre de jours. Regroupe positifs et négatifs pour la somme.', [[sumAbs % 7 === 0 ? q(sumAbs / 7) : null, 'Les températures négatives comptent avec leur signe dans la somme.'], [q(S), 'Ça, c’est la somme : il faut encore diviser par le nombre de jours (7).'], [q(-mu), 'Attention au signe de la somme.']], { unit: '°C' }),
    ],
    lines: [`a) Maximum ${m(String(mx))}, minimum ${m(String(mn))} : écart ${m(`${mx} - ${P(mn)} = ${mx - mn}`)} degrés.`, `b) Somme : positifs ${m(pos.join(' + ') + (pos.length > 1 ? ` = ${Sp}` : ''))}, négatifs ${m(negs.join(' ').replace(/ -/g, ' - ') + (negs.length > 1 ? ` = ${Sn}` : ''))}, somme ${m(`${Sp} + ${P(Sn)} = ${S}`)}.`, `Moyenne : ${m(`${S} \\div 7 = ${mu}`)} °C.`],
    answer: `écart ${m(String(mx - mn))} degrés ; moyenne ${m(String(mu))} °C`,
    key: `moy:${ts.join(',')}`,
    items: [{ what: 'écart', js: `Math.max(${ts.join(',')}) - Math.min(${ts.join(',')})`, expect: mx - mn }, { what: 'moyenne', js: `(${ts.join('+')})/7`, expect: mu }],
  };
}

export const probleme: Generator = {
  id: 'probleme',
  title: 'Problèmes',
  desc: 'Températures, altitudes, comptes, années, ascenseur, quiz.',
  stars: 1,
  levels: [1, 2],
  example: '-3 - (-12)',
  course: LINKS.s11,
  links: [LINKS.s42],
  generate(rng: Rng, level: Level) {
    const k = level === 1 ? rng.weighted([['temp', 3], ['sm', 3], ['cpt', 3], ['an', 1], ['asc', 3]] as const) : rng.pick(['asc2', 'quiz', 'moy']);
    const o =
      k === 'temp' ? temperature(rng) : k === 'sm' ? sousMarin(rng) : k === 'cpt' ? compte(rng) : k === 'an' ? annees(rng) : k === 'asc' ? ascenseur(rng, false) : k === 'asc2' ? ascenseur(rng, true) : k === 'quiz' ? quiz(rng) : moyenne(rng);
    return {
      title: o.title,
      steps: o.steps,
      solution: o.lines,
      answer: o.answer,
      key: o.key,
      data: { kind: 'js', items: o.items },
    };
  },
};
export { pn, type Q };
