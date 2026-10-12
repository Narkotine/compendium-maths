/**
 * Mettre un problème en équation (★★ / ★★★). Plusieurs familles de contextes, chacune construite à rebours :
 * on fixe d'abord la réponse (plausible : entiers pour des billes, âges réalistes…), puis l'énoncé.
 * Étapes : choisir l'équation (QCM avec explications), la résoudre, répondre au problème (avec unités).
 */
import { type Q, q, add, sub, mul, div, eq, isInt, toNum } from '../engine/q';
import { N, D, X, V, lin, term, sumE, prod, group, eqn, texEq, tex, evaluate, toLin, satisfies, substitute, type Expr, type Equation, type NumStyle } from '../engine/expr';
import { linearLines, nat } from '../engine/linear';
import type { Generator, Rich, Step, NumField, Level } from '../engine/types';
import type { Rng } from '../engine/rng';
import { LINKS, m, twoNames, choice, euro, NAMES } from './common';

interface Built {
  statement: Rich[];
  /** « On note x le nombre de billes de Bob. » */
  unknown: Rich;
  v?: string;
  E: Equation;
  x: Q;
  style?: NumStyle;
  /** Traduction des informations (lignes du corrigé avant l'équation). */
  translate: Rich[];
  bad: [Equation, Rich][];
  hintEq: Rich;
  fields: NumField[];
  question: Rich;
  answer: Rich;
  check: Rich;
  facts: [string, number][];
}
const de = (w: string) => (/^[AEIOUÉH]/.test(w) ? `d’${w}` : `de ${w}`);
const que = (w: string) => (/^[AEIOUÉH]/.test(w) ? `qu’${w}` : `que ${w}`);
const deg = (v: number | string) => `${v}\\degree`;
const cm = (v: Q | number) => `${m(nat(typeof v === 'number' ? q(v) : v))}\u00a0cm`;

// ------------------------------------------------------------------ familles ★★
function billes(rng: Rng): Built {
  const [a, b] = twoNames(rng);
  const x = rng.int(6, 40);
  const objet = rng.pick([['billes', 'billes'], ['cartes', 'cartes'], ['timbres', 'timbres'], ['images', 'images']] as const)[0];
  if (rng.chance(0.55)) {
    const k = rng.int(2, 5);
    const T = x + k * x;
    return {
      statement: [`${a} a ${m(String(k))} fois plus de ${objet} ${que(b)}. À eux deux, ils en ont ${m(String(T))}.`, `Combien de ${objet} chacun a-t-il ?`],
      unknown: `On note ${m('x')} le nombre de ${objet} ${de(b)}.`,
      E: eqn(sumE(X, term(k)), N(T)),
      x: q(x),
      translate: [`${a} en a ${m(`${k}x`)}.`],
      bad: [
        [eqn(sumE(X, N(k)), N(T)), `« ${m(String(k))} fois plus » se traduit par une multiplication : ${m(`${k}x`)}, pas ${m(`x + ${k}`)}.`],
        [eqn(term(k), N(T)), `${m(`${k}x`)} ne compte que les ${objet} ${de(a)} : il faut ajouter celles ${de(b)}.`],
        [eqn(sumE(X, term(k)), N(k * T)), `Le total est ${m(String(T))} : on ne le multiplie pas.`],
      ],
      hintEq: `Si ${b} a ${m('x')} ${objet}, combien en a ${a} ? Le total des deux vaut ${m(String(T))}.`,
      fields: [{ label: `${b} :`, unit: objet, expect: q(x) }, { label: `${a} :`, unit: objet, expect: q(k * x) }],
      question: 'Réponds au problème.',
      answer: `${b} a ${m(String(x))} ${objet} et ${a} en a ${m(String(k * x))}.`,
      check: `${m(`${k * x} = ${k} \\times ${x}`)} et ${m(`${x} + ${k * x} = ${T}`)} ✓`,
      facts: [['n:b', x], ['n:a', k * x]],
    };
  }
  const d = rng.int(3, 25);
  const T = 2 * x + d;
  return {
    statement: [`${a} a ${m(String(d))} ${objet} de plus ${que(b)}. À eux deux, ils en ont ${m(String(T))}.`, `Combien de ${objet} chacun a-t-il ?`],
    unknown: `On note ${m('x')} le nombre de ${objet} ${de(b)}.`,
    E: eqn(group(X, lin(1, d)), N(T)),
    x: q(x),
    translate: [`${a} en a ${m(`x + ${d}`)}.`],
    bad: [
      [eqn(sumE(X, term(d)), N(T)), `« ${m(String(d))} de plus » se traduit par une addition : ${m(`x + ${d}`)}, pas ${m(`${d}x`)}.`],
      [eqn(lin(1, d), N(T)), `${m(`x + ${d}`)} ne compte que les ${objet} ${de(a)} : il faut ajouter celles ${de(b)}.`],
      [eqn(group(X, lin(1, -d)), N(T)), `${a} en a **plus** ${que(b)} : c’est ${m(`x + ${d}`)}.`],
    ],
    hintEq: `Si ${b} a ${m('x')} ${objet}, ${a} en a ${m(String(d))} de plus. Le total vaut ${m(String(T))}.`,
    fields: [{ label: `${b} :`, unit: objet, expect: q(x) }, { label: `${a} :`, unit: objet, expect: q(x + d) }],
    question: 'Réponds au problème.',
    answer: `${b} a ${m(String(x))} ${objet} et ${a} en a ${m(String(x + d))}.`,
    check: `${m(`${x + d} - ${x} = ${d}`)} et ${m(`${x} + ${x + d} = ${T}`)} ✓`,
    facts: [['n:b', x], ['n:a', x + d]],
  };
}

function consecutifs(rng: Rng): Built {
  const n = rng.int(5, 90);
  const k = rng.chance(0.7) ? 3 : 4;
  const S = k * n + (k * (k - 1)) / 2;
  const Nn = V('n');
  const terms = [...Array(k)].map((_, i) => (i === 0 ? Nn : group(lin(1, i, Nn))));
  return {
    statement: [`La somme de ${k === 3 ? 'trois' : 'quatre'} nombres entiers consécutifs vaut ${m(String(S))}.`, 'Quels sont ces nombres ?'],
    unknown: `On note ${m('n')} le plus petit de ces nombres.`,
    v: 'n',
    E: eqn(sumE(...terms), N(S)),
    x: q(n),
    translate: [`Les nombres suivants sont ${[...Array(k - 1)].map((_, i) => m(`n + ${i + 1}`)).join(k === 3 ? ' et ' : ', ')}.`],
    bad: [
      [eqn(term(k, Nn), N(S)), `Les ${k === 3 ? 'trois' : 'quatre'} nombres ne sont pas égaux : ils se suivent (${m('n')}, ${m('n + 1')}…).`],
      [eqn(sumE(Nn, ...[...Array(k - 1)].map(() => group(lin(1, 1, Nn)))), N(S)), `Les nombres se suivent : ${m('n')}, ${m('n + 1')}, ${m('n + 2')}${k === 4 ? `, ${m('n + 3')}` : ''}.`],
      [eqn(sumE(Nn, ...[...Array(k - 1)].map((_, i) => term(i + 2, Nn))), N(S)), `Le nombre qui suit ${m('n')} est ${m('n + 1')}, pas ${m('2n')}.`],
    ],
    hintEq: `Si le plus petit est ${m('n')}, le suivant est ${m('n + 1')}…`,
    fields: [...Array(k)].map((_, i) => ({ label: `${['1er', '2e', '3e', '4e'][i]} :`, expect: q(n + i) })),
    question: 'Donne les nombres, du plus petit au plus grand.',
    answer: `Les nombres sont ${[...Array(k)].map((_, i) => m(String(n + i))).join(', ').replace(/, ([^,]*)$/, ' et $1')}.`,
    check: `${m(`${[...Array(k)].map((_, i) => n + i).join(' + ')} = ${S}`)} ✓`,
    facts: [...Array(k)].map((_, i) => [`n:${i}`, n + i] as [string, number]),
  };
}

function rectangle(rng: Rng): Built {
  const x = rng.int(3, 30);
  if (rng.chance(0.6)) {
    const d = rng.int(2, 15);
    const P = 2 * (2 * x + d);
    return {
      statement: [`Un rectangle a une longueur qui dépasse sa largeur de ${cm(d)}. Son périmètre est ${cm(P)}.`, 'Quelles sont ses dimensions ?'],
      unknown: `On note ${m('x')} la largeur, en cm.`,
      E: eqn(prod(N(2), group(X, lin(1, d))), N(P)),
      x: q(x),
      translate: [`La longueur est ${m(`x + ${d}`)}. Périmètre : ${m('2 \\times (\\text{largeur} + \\text{longueur})')}.`],
      bad: [
        [eqn(sumE(X, group(lin(1, d))), N(P)), `C’est le demi-périmètre : le périmètre compte **deux** largeurs et **deux** longueurs.`],
        [eqn(prod(X, lin(1, d)), N(P)), 'Ça, c’est l’aire du rectangle, pas son périmètre.'],
        [eqn(prod(N(2), group(X, term(d))), N(P)), `« dépasse de ${m(String(d))} » : la longueur est ${m(`x + ${d}`)}, pas ${m(`${d}x`)}.`],
      ],
      hintEq: `La longueur vaut ${m(`x + ${d}`)}. Le périmètre d’un rectangle vaut ${m('2 \\times (\\ell + L)')}.`,
      fields: [{ label: 'Largeur :', unit: 'cm', expect: q(x) }, { label: 'Longueur :', unit: 'cm', expect: q(x + d) }],
      question: 'Donne les dimensions du rectangle.',
      answer: `Le rectangle mesure ${cm(x)} de large et ${cm(x + d)} de long.`,
      check: `${m(`${x + d} - ${x} = ${d}`)} et ${m(`2 \\times (${x} + ${x + d}) = ${P}`)} ✓`,
      facts: [['l', x], ['L', x + d]],
    };
  }
  const k = rng.int(2, 4);
  const P = 2 * (x + k * x);
  return {
    statement: [`La longueur d’un rectangle est ${k === 2 ? 'le double' : k === 3 ? 'le triple' : 'le quadruple'} de sa largeur. Son périmètre est ${cm(P)}.`, 'Quelles sont ses dimensions ?'],
    unknown: `On note ${m('x')} la largeur, en cm.`,
    E: eqn(prod(N(2), group(X, term(k))), N(P)),
    x: q(x),
    translate: [`La longueur est ${m(`${k}x`)}.`],
    bad: [
      [eqn(sumE(X, term(k)), N(P)), 'C’est le demi-périmètre : le périmètre compte deux largeurs et deux longueurs.'],
      [eqn(prod(N(2), group(X, N(k))), N(P)), `${k === 2 ? 'Le double' : k === 3 ? 'Le triple' : 'Le quadruple'} de ${m('x')} s’écrit ${m(`${k}x`)}, pas ${m(`x + ${k}`)}.`],
      [eqn(prod(X, term(k)), N(P)), 'Ça, c’est l’aire du rectangle, pas son périmètre.'],
    ],
    hintEq: `La longueur vaut ${m(`${k}x`)}. Le périmètre vaut ${m('2 \\times (\\ell + L)')}.`,
    fields: [{ label: 'Largeur :', unit: 'cm', expect: q(x) }, { label: 'Longueur :', unit: 'cm', expect: q(k * x) }],
    question: 'Donne les dimensions du rectangle.',
    answer: `Le rectangle mesure ${cm(x)} de large et ${cm(k * x)} de long.`,
    check: `${m(`${k * x} = ${k} \\times ${x}`)} et ${m(`2 \\times (${x} + ${k * x}) = ${P}`)} ✓`,
    facts: [['l', x], ['L', k * x]],
  };
}

function prix(rng: Rng): Built {
  const [a] = twoNames(rng);
  const x = q(rng.int(12, 40), 10); // prix d'un cahier : 1,20 € à 4,00 €
  const d = q(rng.int(4, 16) * 5, 10); // le livre coûte 2 € à 8 € de plus
  const k = rng.int(2, 4);
  const T = add(mul(q(k), x), add(x, d));
  return {
    statement: [`${a} achète ${m(String(k))} cahiers et un livre. Le livre coûte ${euro(d)} de plus qu’un cahier. ${a} paie ${euro(T)} en tout.`, 'Quel est le prix d’un cahier ? Celui du livre ?'],
    unknown: `On note ${m('x')} le prix d’un cahier, en euros.`,
    E: eqn(sumE(term(k), group(lin(1, d, X, 'dec'))), D(T)),
    x,
    style: 'dec',
    translate: [`Le livre coûte ${m(`x + ${nat(d)}`)}.`],
    bad: [
      [eqn(sumE(term(k), D(d)), D(T)), `Le livre ne coûte pas ${euro(d)} : il coûte ${euro(d)} **de plus** qu’un cahier, soit ${m(`x + ${nat(d)}`)}.`],
      [eqn(sumE(term(k + 1), group(lin(1, d, X, 'dec'))), D(T)), `Il y a ${m(String(k))} cahiers, pas ${m(String(k + 1))} : le livre est compté à part.`],
      [eqn(sumE(term(k), group(lin(1, mul(q(-1), d), X, 'dec'))), D(T)), `Le livre coûte **plus** cher qu’un cahier : ${m(`x + ${nat(d)}`)}.`],
    ],
    hintEq: `Exprime le prix du livre en fonction de ${m('x')}, puis écris le prix total des ${m(String(k))} cahiers et du livre.`,
    fields: [{ label: 'Un cahier :', unit: '€', expect: x }, { label: 'Le livre :', unit: '€', expect: add(x, d) }],
    question: 'Réponds au problème.',
    answer: `Un cahier coûte ${euro(x)} et le livre ${euro(add(x, d))}.`,
    check: `${m(`${k} \\times ${nat(x)} + ${nat(add(x, d))} = ${nat(T)}`)} ✓`,
    facts: [['x', toNum(x)], ['livre', toNum(add(x, d))]],
  };
}

function programme(rng: Rng, level: Level): Built {
  // Programme : « choisir un nombre ; ajouter b ; multiplier par a ; (soustraire c) ». Résultat R.
  const x = level === 3 ? rng.intNot(-9, 15, 0) : rng.int(2, 20);
  const a = rng.int(2, 6), b = rng.intNot(-9, 9, 0);
  if (level === 3) {
    // deux programmes qui donnent le même résultat
    const c = rng.intNot(2, 7, a);
    const d0 = a * (x + b) - c * x;
    const b2 = d0; // B : multiplier par c puis ajouter d0
    if (b2 === 0) return programme(rng, level);
    const opB = b2 > 0 ? `ajouter ${m(String(b2))}` : `soustraire ${m(String(-b2))}`;
    const opA = b > 0 ? `ajouter ${m(String(b))}` : `soustraire ${m(String(-b))}`;
    return {
      statement: [`Programme A : choisir un nombre, ${opA}, puis multiplier le résultat par ${m(String(a))}.`, `Programme B : choisir un nombre, le multiplier par ${m(String(c))}, puis ${opB}.`, 'Quel nombre faut-il choisir au départ pour que les deux programmes donnent le même résultat ?'],
      unknown: `On note ${m('x')} le nombre choisi au départ.`,
      E: eqn(prod(N(a), lin(1, b)), lin(c, b2)),
      x: q(x),
      translate: [`Programme A : ${m(tex(prod(N(a), lin(1, b))))} ; programme B : ${m(tex(lin(c, b2)))}.`],
      bad: [
        [eqn(lin(a, b), lin(c, b2)), `Dans le programme A, on multiplie **le résultat** par ${m(String(a))} : il faut des parenthèses, ${m(tex(prod(N(a), lin(1, b))))}.`],
        [eqn(prod(N(a), lin(1, b)), prod(N(c), lin(1, b2))), `Dans le programme B, on multiplie d’abord, puis on ${b2 > 0 ? 'ajoute' : 'soustrait'} : ${m(tex(lin(c, b2)))}.`],
        [eqn(prod(N(a), lin(1, b)), N(0)), 'Les deux programmes doivent donner le même résultat : on écrit « résultat A = résultat B ».'],
      ],
      hintEq: 'Écris le résultat de chaque programme en fonction de $x$, puis écris qu’ils sont égaux.',
      fields: [{ label: 'Nombre choisi :', expect: q(x) }, { label: 'Résultat commun :', expect: q(c * x + b2) }],
      question: 'Donne le nombre de départ et le résultat obtenu.',
      answer: `Il faut choisir ${m(String(x))} ; les deux programmes donnent alors ${m(String(c * x + b2))}.`,
      check: `${m(tex(substitute(prod(N(a), lin(1, b)), { x: q(x) })) + ` = ${a * (x + b)}`)} et ${m(tex(substitute(lin(c, b2), { x: q(x) })) + ` = ${c * x + b2}`)} ✓`,
      facts: [['x', x]],
    };
  }
  const R = a * (x + b);
  const op = b > 0 ? `ajouter ${m(String(b))}` : `soustraire ${m(String(-b))}`;
  return {
    statement: [`Je choisis un nombre. Je lui ${b > 0 ? 'ajoute' : 'soustrais'} ${m(String(Math.abs(b)))}, puis je multiplie le résultat par ${m(String(a))}. J’obtiens ${m(String(R))}.`, 'Quel nombre ai-je choisi ?'],
    unknown: `On note ${m('x')} le nombre choisi.`,
    E: eqn(prod(N(a), lin(1, b)), N(R)),
    x: q(x),
    translate: [`Après « ${op} » : ${m(tex(lin(1, b)))} ; puis on multiplie **le résultat** par ${m(String(a))}.`],
    bad: [
      [eqn(lin(a, b), N(R)), `On multiplie **le résultat** par ${m(String(a))} : il faut des parenthèses, ${m(tex(prod(N(a), lin(1, b))))}.`],
      [eqn(lin(1, a * b), N(R)), `On multiplie ${m(tex(lin(1, b)))} en entier par ${m(String(a))}, pas seulement le nombre ${m(String(Math.abs(b)))}.`],
      [eqn(prod(N(a), lin(1, -b)), N(R)), `Attention à l’opération : on ${b > 0 ? 'ajoute' : 'soustrait'} ${m(String(Math.abs(b)))}.`],
    ],
    hintEq: 'Écris le calcul fait sur $x$, étape par étape. « Multiplier le résultat » demande des parenthèses.',
    fields: [{ label: 'Nombre choisi :', expect: q(x) }],
    question: '',
    answer: `J’ai choisi ${m(String(x))}.`,
    check: `${m(`${tex(substitute(prod(N(a), lin(1, b)), { x: q(x) }))} = ${R}`)} ✓`,
    facts: [['x', x]],
  };
}

// ------------------------------------------------------------------ familles ★★★
function ages(rng: Rng): Built {
  for (;;) {
    const fils = rng.int(4, 15), x = rng.int(2, 20), k = rng.int(2, 4);
    const pere = k * (fils + x) - x;
    if (pere - fils < 22 || pere - fils > 45 || pere > 58) continue;
    const [f] = [rng.pick(NAMES.filter((n) => ['Bob', 'Hugo', 'Sami', 'Paul', 'Noah', 'Yanis', 'Adam', 'Malik', 'Tom', 'Lucas', 'Théo', 'Ilyes'].includes(n)))];
    const parent = rng.pick(['père', 'mère']);
    const kw = k === 2 ? 'le double de' : k === 3 ? 'le triple de' : 'quatre fois';
    const le = parent === 'père' ? 'Son père' : 'Sa mère';
    return {
      statement: [`${f} a ${m(String(fils))} ans. ${le} a ${m(String(pere))} ans.`, `Dans combien d’années ${parent === 'père' ? 'son père' : 'sa mère'} aura-t-${parent === 'père' ? 'il' : 'elle'} ${kw} l’âge ${de(f)} ?`],
      unknown: `On note ${m('x')} le nombre d’années cherché.`,
      E: eqn(sumE(N(pere), X), prod(N(k), sumE(N(fils), X))),
      x: q(x),
      translate: [`Dans ${m('x')} ans, ${f} aura ${m(`${fils} + x`)} ans et ${parent === 'père' ? 'son père' : 'sa mère'} ${m(`${pere} + x`)} ans.`],
      bad: [
        [eqn(sumE(N(pere), X), sumE(N(fils * k), X)), `C’est **tout l’âge** futur ${de(f)}, ${m(`${fils} + x`)}, qui est multiplié par ${m(String(k))} : il faut des parenthèses.`],
        [eqn(N(pere), prod(N(k), sumE(N(fils), X))), `Les deux personnes vieillissent : dans ${m('x')} ans, ${parent === 'père' ? 'le père' : 'la mère'} aura ${m(`${pere} + x`)} ans.`],
        [eqn(prod(N(k), sumE(N(pere), X)), sumE(N(fils), X)), `C’est l’âge ${parent === 'père' ? 'du père' : 'de la mère'} qui vaut ${k === 4 ? 'quatre fois' : kw} celui ${de(f)}, pas l’inverse.`],
      ],
      hintEq: `Écris les deux âges dans ${m('x')} ans, puis traduis « ${kw} ».`,
      fields: [{ label: 'Dans', unit: 'ans', expect: q(x) }],
      question: '',
      answer: `Dans ${m(String(x))} ans : ${f} aura ${m(String(fils + x))} ans et ${parent === 'père' ? 'son père' : 'sa mère'} ${m(String(pere + x))} ans.`,
      check: `${m(`${pere + x} = ${k} \\times ${fils + x}`)} ✓`,
      facts: [['n:x', x], ['pere', pere]],
    };
  }
}

function tarifs(rng: Rng): Built {
  const C = rng.pick([
    { lieu: 'À la piscine', unite: 'entrée', unites: 'entrées', abo: 'un abonnement annuel' },
    { lieu: 'À la médiathèque', unite: 'film emprunté', unites: 'films empruntés', abo: 'une carte' },
    { lieu: 'Au club d’escalade', unite: 'séance', unites: 'séances', abo: 'une adhésion' },
  ]);
  for (;;) {
    const x = rng.int(6, 30);
    const r = q(rng.int(5, 30), 10); // tarif réduit : 0,50 € à 3,00 €
    const dd = q(rng.int(2, 20), 10); // écart de prix par entrée
    const S = mul(dd, q(x));
    if (!isInt(S) || S.n < 8 || S.n > 60) continue;
    const p = add(r, dd);
    return {
      statement: [
        `${C.lieu}, deux tarifs sont proposés. Tarif A : ${euro(p)} par ${C.unite}. Tarif B : ${C.abo} à ${euro(S)}, puis ${euro(r)} par ${C.unite}.`,
        `Pour combien de ${C.unites} les deux tarifs coûtent-ils le même prix ? Quel est alors ce prix ?`,
      ],
      unknown: `On note ${m('x')} le nombre de ${C.unites}.`,
      E: eqn(term(p, X, 'dec'), sumE(N(S), term(r, X, 'dec'))),
      x: q(x),
      style: 'dec',
      translate: [`Tarif A : ${m(tex(term(p, X, 'dec')))} ; tarif B : ${m(tex(sumE(N(S), term(r, X, 'dec'))))}.`],
      bad: [
        [eqn(term(p, X, 'dec'), lin(add(S, r), 0, X, 'dec')), `L’${C.abo.split(' ')[1]} se paie **une seule fois** : ${m(nat(S))} n’est pas multiplié par ${m('x')}.`],
        [eqn(sumE(term(p, X, 'dec'), N(S)), term(r, X, 'dec')), `C’est le tarif B qui comprend ${C.abo} à ${euro(S)}.`],
        [eqn(term(add(p, r), X, 'dec'), N(S)), `On écrit « prix A = prix B », chaque prix en fonction de ${m('x')}.`],
      ],
      hintEq: `Écris le prix payé avec chaque tarif pour ${m('x')} ${C.unites}, puis écris qu’ils sont égaux.`,
      fields: [{ label: 'Nombre :', unit: C.unites, expect: q(x) }, { label: 'Prix :', unit: '€', expect: mul(p, q(x)) }],
      question: 'Réponds au problème.',
      answer: `Pour ${m(String(x))} ${C.unites}, les deux tarifs coûtent ${euro(mul(p, q(x)))}.`,
      check: `${m(`${nat(p)} \\times ${x} = ${nat(mul(p, q(x)))}`)} et ${m(`${nat(S)} + ${nat(r)} \\times ${x} = ${nat(mul(p, q(x)))}`)} ✓`,
      facts: [['n:x', x], ['S', S.n]],
    };
  }
}

function partage(rng: Rng): Built {
  const [a, b] = twoNames(rng);
  const c = rng.pick(NAMES.filter((n) => n !== a && n !== b));
  const x = rng.int(4, 30) * 5;
  const k = rng.int(2, 3), d = rng.int(1, 8) * 5;
  const T = x + k * x + (x + d);
  return {
    statement: [`${a}, ${b} et ${c} se partagent ${euro(T)}. ${b} reçoit ${k === 2 ? 'le double' : 'le triple'} de ce que reçoit ${a}, et ${c} reçoit ${euro(d)} de plus ${que(a)}.`, 'Combien chacun reçoit-il ?'],
    unknown: `On note ${m('x')} la somme reçue par ${a}, en euros.`,
    E: eqn(sumE(X, term(k), group(lin(1, d))), N(T)),
    x: q(x),
    translate: [`${b} reçoit ${m(`${k}x`)} et ${c} reçoit ${m(`x + ${d}`)}.`],
    bad: [
      [eqn(sumE(term(k), group(lin(1, d))), N(T)), `Il manque la part ${de(a)} : les trois parts font ${euro(T)}.`],
      [eqn(sumE(X, term(k), term(d)), N(T)), `« ${d} € de plus » : ${c} reçoit ${m(`x + ${d}`)}, pas ${m(`${d}x`)}.`],
      [eqn(sumE(X, N(k), group(lin(1, d))), N(T)), `${k === 2 ? 'Le double' : 'Le triple'} de ${m('x')} s’écrit ${m(`${k}x`)}.`],
    ],
    hintEq: `Exprime la part de ${b} et celle de ${c} en fonction de ${m('x')}, puis additionne les trois parts.`,
    fields: [{ label: `${a} :`, unit: '€', expect: q(x) }, { label: `${b} :`, unit: '€', expect: q(k * x) }, { label: `${c} :`, unit: '€', expect: q(x + d) }],
    question: 'Réponds au problème.',
    answer: `${a} reçoit ${euro(x)}, ${b} ${euro(k * x)} et ${c} ${euro(x + d)}.`,
    check: `${m(`${x} + ${k * x} + ${x + d} = ${T}`)} ✓`,
    facts: [['a', x], ['b', k * x], ['c', x + d]],
  };
}

function triangle(rng: Rng): Built {
  // deux variantes : C = k·A (k = 2 ou 3), ou C = A + e ; B = A + d. On choisit d, k / e, puis A = (180 − …) / …
  for (;;) {
    const d = rng.int(1, 12) * 5;
    if (rng.chance(0.55)) {
      const k = rng.int(2, 3);
      const xx = (180 - d) / (2 + k);
      if (!Number.isInteger(xx) || xx < 10) continue;
      return build(xx, d, k);
    }
    const e = rng.int(1, 16) * 5;
    if (e === d) continue;
    const xx = (180 - d - e) / 3;
    if (!Number.isInteger(xx) || xx < 10) continue;
    return build(xx, d, 0, e);
  }
  function build(x: number, d: number, k: number, e = 0): Built {
    if (!k) return buildE(x, d, e);
    return {
      statement: [`Dans un triangle ${m('ABC')}, l’angle ${m('\\widehat{B}')} mesure ${m(deg(d))} de plus que l’angle ${m('\\widehat{A}')}, et l’angle ${m('\\widehat{C}')} est ${k === 2 ? 'le double' : 'le triple'} de l’angle ${m('\\widehat{A}')}.`, 'Calcule les trois angles.'],
      unknown: `On note ${m('x')} la mesure de ${m('\\widehat{A}')}, en degrés.`,
      E: eqn(sumE(X, group(lin(1, d)), term(k)), N(180)),
      x: q(x),
      translate: [`${m('\\widehat{B}')} mesure ${m(`x + ${d}`)} et ${m('\\widehat{C}')} mesure ${m(`${k}x`)}. La somme des angles d’un triangle vaut ${m(deg(180))}.`],
      bad: [
        [eqn(sumE(X, group(lin(1, d)), term(k)), N(360)), `La somme des angles d’un triangle vaut ${m(deg(180))} (${m(deg(360))}, c’est pour un quadrilatère).`],
        [eqn(sumE(X, term(d), term(k)), N(180)), `« ${d}° de plus » : ${m('\\widehat{B}')} mesure ${m(`x + ${d}`)}, pas ${m(`${d}x`)}.`],
        [eqn(sumE(group(lin(1, d)), term(k)), N(180)), `Il manque l’angle ${m('\\widehat{A}')} : la somme porte sur les **trois** angles.`],
      ],
      hintEq: `Exprime ${m('\\widehat{B}')} et ${m('\\widehat{C}')} en fonction de ${m('x')} ; que vaut la somme des angles d’un triangle ?`,
      fields: [{ label: m('\\widehat{A} ='), unit: '°', expect: q(x) }, { label: m('\\widehat{B} ='), unit: '°', expect: q(x + d) }, { label: m('\\widehat{C} ='), unit: '°', expect: q(k * x) }],
      question: 'Donne les trois angles.',
      answer: `${m(`\\widehat{A} = ${deg(x)}`)}, ${m(`\\widehat{B} = ${deg(x + d)}`)} et ${m(`\\widehat{C} = ${deg(k * x)}`)}.`,
      check: `${m(`${x} + ${x + d} + ${k * x} = 180`)} ✓`,
      facts: [['A', x], ['B', x + d], ['C', k * x]],
    };
  }
  function buildE(x: number, d: number, e: number): Built {
    return {
      statement: [`Dans un triangle ${m('ABC')}, l’angle ${m('\\widehat{B}')} mesure ${m(deg(d))} de plus que l’angle ${m('\\widehat{A}')}, et l’angle ${m('\\widehat{C}')} mesure ${m(deg(e))} de plus que l’angle ${m('\\widehat{A}')}.`, 'Calcule les trois angles.'],
      unknown: `On note ${m('x')} la mesure de ${m('\\widehat{A}')}, en degrés.`,
      E: eqn(sumE(X, group(lin(1, d)), group(lin(1, e))), N(180)),
      x: q(x),
      translate: [`${m('\\widehat{B}')} mesure ${m(`x + ${d}`)} et ${m('\\widehat{C}')} mesure ${m(`x + ${e}`)}. La somme des angles d’un triangle vaut ${m(deg(180))}.`],
      bad: [
        [eqn(sumE(X, group(lin(1, d)), group(lin(1, e))), N(360)), `La somme des angles d’un triangle vaut ${m(deg(180))}.`],
        [eqn(sumE(group(lin(1, d)), group(lin(1, e))), N(180)), `Il manque l’angle ${m('\\widehat{A}')} : la somme porte sur les **trois** angles.`],
        [eqn(sumE(X, term(d), term(e)), N(180)), `« ${d}° de plus » se traduit par ${m(`x + ${d}`)}, pas ${m(`${d}x`)}.`],
      ],
      hintEq: `Exprime ${m('\\widehat{B}')} et ${m('\\widehat{C}')} en fonction de ${m('x')} ; que vaut la somme des angles d’un triangle ?`,
      fields: [{ label: m('\\widehat{A} ='), unit: '°', expect: q(x) }, { label: m('\\widehat{B} ='), unit: '°', expect: q(x + d) }, { label: m('\\widehat{C} ='), unit: '°', expect: q(x + e) }],
      question: 'Donne les trois angles.',
      answer: `${m(`\\widehat{A} = ${deg(x)}`)}, ${m(`\\widehat{B} = ${deg(x + d)}`)} et ${m(`\\widehat{C} = ${deg(x + e)}`)}.`,
      check: `${m(`${x} + ${x + d} + ${x + e} = 180`)} ✓`,
      facts: [['A', x], ['B', x + d], ['C', x + e]],
    };
  }
}

// ------------------------------------------------------------------ générateur
const FAM2 = [['billes', 3], ['consecutifs', 2], ['rectangle', 2.5], ['prix', 2], ['programme', 2]] as const;
const FAM3 = [['ages', 3], ['tarifs', 3], ['partage', 2], ['triangle', 2], ['programme', 2]] as const;

export const probleme: Generator = {
  id: 'probleme',
  title: 'Mettre un problème en équation',
  desc: 'Choisir l’inconnue, écrire l’équation, la résoudre, répondre par une phrase.',
  stars: 2,
  levels: [2, 3],
  example: '\\text{Ana a 3 fois plus de billes que Bob…}',
  course: LINKS.s3,
  generate(rng, level) {
    const fam = rng.weighted(level === 2 ? FAM2 : FAM3);
    const B: Built =
      fam === 'billes' ? billes(rng) : fam === 'consecutifs' ? consecutifs(rng) : fam === 'rectangle' ? rectangle(rng) : fam === 'prix' ? prix(rng)
      : fam === 'programme' ? programme(rng, level) : fam === 'ages' ? ages(rng) : fam === 'tarifs' ? tarifs(rng) : fam === 'partage' ? partage(rng) : triangle(rng);
    const v = B.v ?? 'x';
    const env = { [v]: B.x };
    if (!satisfies(B.E, env)) throw new Error(`probleme/${fam} : équation fausse`);
    const good = m(texEq(B.E));
    const bad = B.bad.filter(([E]) => !satisfies(E, env) && texEq(E) !== texEq(B.E)).map(([E, why]) => [m(texEq(E)), why] as [Rich, Rich]);
    // corrigé : réduire, résoudre
    const st = B.style ?? 'auto';
    const L = toLin(B.E.lhs, v)!, R = toLin(B.E.rhs, v)!;
    const V_ = V(v);
    const redL = lin(L.a, L.b, V_, st), redR = lin(R.a, R.b, V_, st);
    const lines: Rich[] = [B.unknown, ...B.translate, `Équation : ${good}`];
    const paren = /\(/.test(texEq(B.E));
    const varTerms = (e: Expr) => (e.k === 'add' ? e.t.filter((t) => toLin(t, v) && !eq(toLin(t, v)!.a, q(0))).length : 1);
    const needs = paren || varTerms(B.E.lhs) > 1 || varTerms(B.E.rhs) > 1;
    const develop = /[\d}a-z)]\s*\(/.test(texEq(B.E));
    if (needs) lines.push(`${m(`${tex(redL)} = ${tex(redR)}`)} (${develop ? 'on développe et on réduit' : paren ? 'on supprime les parenthèses et on réduit' : 'on réduit'})`);
    const res = needs ? linearLines(redL, redR, '=', { v, style: st }) : linearLines(B.E.lhs, B.E.rhs, '=', { v, style: st });
    lines.push(...res.lines);
    if (!eq(res.x, B.x)) throw new Error(`probleme/${fam} : résolution incohérente`);
    lines.push(`**${B.answer}**`);
    lines.push(`Vérification dans l’énoncé : ${B.check}`);
    const steps: Step[] = [
      { prompt: 'Quelle équation traduit l’énoncé ?', answer: choice(rng, good, bad), hint: B.hintEq },
      {
        prompt: `Résous l’équation ${good}.`,
        answer: { kind: 'num', fields: [{ label: m(`${v} =`), expect: B.x, form: 'any' }] },
        hint: 'Développe et réduis si besoin, regroupe les inconnues d’un côté, puis divise par le coefficient.',
      },
    ];
    if (B.question) steps.push({ prompt: B.question, answer: { kind: 'num', fields: B.fields.map((f) => ({ form: 'any', ...f })) }, hint: 'Reviens à l’énoncé : que représente l’inconnue ? Calcule les autres valeurs à partir d’elle.' });
    else steps[1].answer = { kind: 'num', fields: [{ ...B.fields[0], label: B.fields[0].label, form: 'any' }] };
    if (!B.question) steps[1].prompt = `Résous l’équation ${good} et réponds au problème.`;
    void D;
    void sub;
    void div;
    void isInt;
    void evaluate;
    void (null as unknown as Expr);
    return {
      title: 'Mettre en équation, puis résoudre.',
      statement: [...B.statement, B.unknown].join('\n'),
      steps,
      solution: lines,
      answer: B.answer,
      key: B.statement.join(' ').replace(/^\S+/, ''),
      data: { kind: 'problem', eq: B.E, x: B.x, facts: B.facts },
    };
  },
};
