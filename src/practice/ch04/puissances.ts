/**
 * Puissances (★ → ★★★) : calculer une puissance (signe, priorités), puissances de 10, préfixes,
 * règles de calcul, exposants négatifs.
 */
import { type Q, q, add, sub, mul, div, toNum, isInt } from '../engine/q';
import type { Generator, Level, Mistake, NumField, Rich, Step } from '../engine/types';
import type { Rng } from '../engine/rng';
import { m, mist, dn, numStep } from '../engine/build';
import { LINKS, bg, pw, base, P10, sci, F, sciFields, sciJs } from './common';

const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Mistake[] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const L = ['a', 'b', 'c', 'd'];
const ipow = (a: Q, n: number): Q => { let r = q(1); for (let i = 0; i < Math.abs(n); i++) r = mul(r, a); return n < 0 ? div(q(1), r) : r; };
const jsq = (v: Q) => `(${v.n}/${v.d})`;

// ===================================================================== calculer une puissance
type JI = { what: string; js: string; expect: number };
type Item = { prompt: Rich; step: Step; sol: Rich; ans: Rich; key: string; js: JI; js2?: JI };
export const calcul: Generator = {
  id: 'calcul',
  title: 'Calculer une puissance',
  desc: 'Écrire et calculer une puissance ; signe et priorités (★★).',
  stars: 1,
  levels: [1, 2],
  example: '(-3)^2 = 9 \\quad -3^2 = -9',
  course: LINKS.s11,
  links: [LINKS.s12],
  generate(rng: Rng, level: Level) {
    const items: Item[] = [];
    if (level === 1) {
      // a) produit → puissance
      const b0 = rng.pick([q(2), q(3), q(5), q(6), q(7), q(9), q(11), q(5, 10), q(1, 10), q(-2), q(-3), q(15, 10)]), n0 = rng.int(3, 6);
      const prod = Array(n0).fill(b0.n < 0 || !isInt(b0) ? `(${dn(b0)})` : dn(b0)).join(' \\times ');
      items.push({
        prompt: `Écris sous forme d’une puissance : ${m(prod)}.`,
        step: step('', [F('Base :', b0), F('Exposant :', q(n0))], 'Compte les facteurs égaux : leur nombre est l’exposant.', [...(eqQ(b0, q(n0)) ? [] : [{ on: 'numAll' as const, values: [q(n0), b0], msg: 'Tu as inversé : la base est le nombre répété, l’exposant le nombre de facteurs.' }]), ...(b0.n < 0 ? [{ on: 'num' as const, field: 0, value: q(-b0.n, b0.d), msg: 'Le facteur répété est négatif : la base est ' + m(dn(b0)) + ', à écrire entre parenthèses.' }] : [])]),
        sol: `${m(`${prod} = ${pw(b0, n0)}`)} (${m(String(n0))} facteurs égaux à ${m(dn(b0))}).`,
        ans: m(pw(b0, n0)), key: `p${dn(b0)}^${n0}`, js: { what: 'n', js: `'${prod.split('\\times').join('*')}'.split('*').length`, expect: n0 }, js2: { what: 'b', js: `Number('${dn(b0)}'.replace('{,}','.'))`, expect: toNum(b0) },
      });
      // b) et c) deux calculs
      const pool: [Q, number][] = [];
      for (const a of [2, 3, 4, 5, 6, 7, 9, 11, 12]) for (let n = 2; n <= 10; n++) if (a ** n <= 1100 && !(n === 2 && a <= 3)) pool.push([q(a), n]);
      for (const a of [q(1, 10), q(5, 10), q(2, 10), q(3, 10)]) for (const n of [2, 3, 4]) pool.push([a, n]);
      for (const n of [5, 6, 7, 8, 9]) pool.push([q(-1), n]);
      for (const [a, n] of rng.shuffle(pool).slice(0, 2)) {
        const v = ipow(a, n);
        items.push({
          prompt: `Calcule ${m(pw(a, n))}.`,
          step: numStep('', m(`${pw(a, n)} =`), v, `${m(pw(a, n))}, c’est ${m(String(n))} facteurs égaux à ${m(dn(a))} : ${m(Array(Math.min(n, 4)).fill(base(a)).join(' \\times ') + (n > 4 ? ' \\times \\cdots' : ''))}.`,
            [[mul(a, q(n)), `${m(pw(a, n))} n’est pas ${m(`${dn(a)} \\times ${n}`)} : c’est un produit de ${m(String(n))} facteurs égaux à ${m(dn(a))}.`], [ipow(a, n - 1), `Il y a ${m(String(n))} facteurs, pas ${m(String(n - 1))}.`], [ipow(a, n + 1), `Il y a ${m(String(n))} facteurs, pas ${m(String(n + 1))}.`]], { form: 'decimal' }),
          sol: `${m(`${pw(a, n)} = ${Array(n).fill(base(a)).join(' \\times ')} = ${bg(v)}`)}${a.n < 0 ? ` (${m(String(n))} facteurs négatifs : ${n % 2 ? 'nombre impair, résultat négatif' : 'nombre pair, résultat positif'})` : ''}.`,
          ans: m(bg(v)), key: pw(a, n), js: { what: pw(a, n), js: `(${toNum(a)})**${n}`, expect: toNum(v) },
        });
      }
    } else {
      const kinds = rng.shuffle(['negpar', 'moins', 'prio', 'parent', 'somme', 'prodpar']).slice(0, 3);
      for (const k of kinds) {
        const a = rng.int(2, 5), n = a === 2 ? rng.int(2, 5) : a === 3 ? rng.int(2, 4) : rng.int(2, 3);
        const b = rng.int(2, 6), c = rng.int(1, 20);
        let tex = '', v = q(0), mk: [Q | null, Rich][] = [], hint = '', sol = '', jsx = '';
        switch (k) {
          case 'negpar':
            tex = `(-${a})^{${n}}`; v = q((-a) ** n); jsx = `(-${a})**${n}`;
            mk = [[q(-((-a) ** n)), n % 2 ? `${m(String(n))} facteurs négatifs : un nombre **impair** de facteurs négatifs donne un résultat négatif.` : `${m(String(n))} facteurs négatifs : un nombre **pair** de facteurs négatifs donne un résultat positif.`], [q(-a * n), 'Ce n’est pas une multiplication par l’exposant.']];
            hint = `Écris les ${m(String(n))} facteurs ${m(`(-${a})`)}, puis compte les signes « − ».`;
            sol = `${m(`${tex} = ${Array(n).fill(`(-${a})`).join(' \\times ')} = ${dn(v)}`)} (${n} facteurs négatifs : ${n % 2 ? 'impair, négatif' : 'pair, positif'}).`;
            break;
          case 'moins': {
            const nn = n % 2 ? n + 1 : n;
            tex = `-${a}^{${nn}}`; v = q(-(a ** nn)); jsx = `-(${a}**${nn})`;
            mk = [[q(a ** nn), `L’exposant ne porte que sur ${m(String(a))} (juste avant lui) : ${m(`-${a}^{${nn}} = -(${a}^{${nn}})`)}. Sans parenthèses, le « − » reste devant.`], [q(-a * nn), 'Ce n’est pas une multiplication par l’exposant.']];
            hint = `Sans parenthèses, l’exposant ne porte que sur ${m(String(a))} : ${m(`-${a}^{${nn}} = -(${a}^{${nn}})`)}.`;
            sol = `${m(`${tex} = -(${Array(nn).fill(a).join(' \\times ')}) = ${dn(v)}`)} (l’exposant ne porte que sur ${m(String(a))}).`;
            break;
          }
          case 'prio':
            tex = `${c} + ${b} \\times ${a}^{${n}}`; v = q(c + b * a ** n); jsx = `${c}+${b}*${a}**${n}`;
            mk = [[q((c + b) * a ** n), 'La multiplication passe avant l’addition (et la puissance avant tout) : on ne commence pas par ' + m(`${c} + ${b}`) + '.'], [q(c + (b * a) ** n), `L’exposant ne porte que sur ${m(String(a))}, pas sur ${m(`${b} \\times ${a}`)}.`], [q(c + b * a * n), `${m(`${a}^{${n}}`)} n’est pas ${m(`${a} \\times ${n}`)}.`]];
            hint = 'Ordre : la puissance, puis la multiplication, puis l’addition.';
            sol = `${m(`${tex} = ${c} + ${b} \\times ${a ** n} = ${c} + ${b * a ** n} = ${dn(v)}`)}.`;
            break;
          case 'parent':
            tex = `(${c} + ${b}) \\times ${a}^{${n}}`; v = q((c + b) * a ** n); jsx = `(${c}+${b})*${a}**${n}`;
            mk = [[q(c + b * a ** n), 'Les parenthèses passent en premier : calcule d’abord ' + m(`${c} + ${b}`) + '.'], [q(((c + b) * a) ** n), `L’exposant ne porte que sur ${m(String(a))}.`]];
            hint = 'Les parenthèses d’abord, puis la puissance, puis la multiplication.';
            sol = `${m(`${tex} = ${c + b} \\times ${a ** n} = ${dn(v)}`)}.`;
            break;
          case 'somme': {
            const p = rng.int(2, 4), r = p + rng.int(1, 2), aa = rng.pick([2, 3]);
            tex = `${aa}^{${p}} + ${aa}^{${r}}`; v = q(aa ** p + aa ** r); jsx = `${aa}**${p}+${aa}**${r}`;
            mk = [[q(aa ** (p + r)), `Les règles de calcul ne valent pas pour une **somme** : ${m(`${aa}^{${p}} + ${aa}^{${r}} \\neq ${aa}^{${p + r}}`)}. Calcule chaque puissance.`], [q(aa * p + aa * r), 'Une puissance n’est pas une multiplication par l’exposant.']];
            hint = 'Calcule chaque puissance séparément, puis additionne.';
            sol = `${m(`${tex} = ${aa ** p} + ${aa ** r} = ${dn(v)}`)} (et non ${m(`${aa}^{${p + r}} = ${bg(aa ** (p + r))}`)}).`;
            break;
          }
          default:
            tex = `(${b} \\times ${a})^{2}`; v = q((b * a) ** 2); jsx = `(${b}*${a})**2`;
            mk = [[q(b * a * a), `Les parenthèses : c’est ${m(`${b * a}`)} qui est au carré, pas seulement ${m(String(a))}.`], [q(b * a * 2), 'Au carré : on multiplie le nombre par lui-même, pas par 2.']];
            hint = `Calcule d’abord la parenthèse ${m(`${b} \\times ${a}`)}, puis élève au carré.`;
            sol = `${m(`${tex} = ${b * a}^2 = ${dn(v)}`)} (alors que ${m(`${b} \\times ${a}^2 = ${b * a * a}`)}).`;
        }
        items.push({ prompt: `Calcule ${m(tex)}.`, step: numStep('', m(`${tex} =`), v, hint, mk), sol, ans: m(dn(v)), key: tex, js: { what: tex, js: jsx, expect: toNum(v) } });
      }
    }
    const steps = items.map((it, i) => ({ ...it.step, prompt: `${L[i]}) ${it.prompt}` }));
    return {
      title: level === 1 ? 'Puissances.' : 'Puissances : signe et priorités.',
      steps,
      solution: items.map((it, i) => `${L[i]}) ${it.sol}`),
      answer: items.map((it) => it.ans).join(' ; '),
      key: items.map((it) => it.key).join('|'),
      data: { kind: 'js', items: items.flatMap((it) => (it.js2 ? [it.js, it.js2] : [it.js])) },
    };
  },
};

// ===================================================================== puissances de 10
const ZEROS = (n: number) => (n === 0 ? '1' : n > 0 ? `1 suivi de ${n} zéro${n > 1 ? 's' : ''}` : `${-n - 1} zéro${-n - 1 > 1 ? 's' : ''} après la virgule, puis 1`);
export const dix: Generator = {
  id: 'dix',
  title: 'Puissances de 10',
  desc: 'Écriture décimale, forme 10ⁿ, multiplier par 10ⁿ ; exposants négatifs (★★).',
  stars: 1,
  levels: [1, 2],
  example: '10^{-3} = 0{,}001 \\quad 3{,}7 \\times 10^3 = 3\\,700',
  course: LINKS.s21,
  links: [LINKS.s22],
  generate(rng: Rng, level: Level) {
    // a) écriture décimale
    const n1 = level === 1 ? rng.pick([3, 4, 5, 6, 7, 9, -1, -2, -3, 0]) : rng.pick([-4, -5, -6, -7, 8, 9, 12, 0]);
    const v1 = P10(n1);
    const s1 = numStep(`a) Donne l’écriture décimale de ${m(`10^{${n1}}`)}.`, m(`10^{${n1}} =`), v1, n1 < 0 ? `Un exposant négatif donne un nombre **positif et petit** : ${m(`10^{${n1}} = \\dfrac{1}{10^{${-n1}}}`)}.` : n1 === 0 ? 'Prolonge la suite 1 000 ; 100 ; 10 ; … en divisant par 10 à chaque pas.' : `${m(`10^{${n1}}`)} s’écrit avec un 1 suivi de ${m(String(n1))} zéros.`,
      [[n1 < 0 ? q(-(10 ** -n1)) : null, `Un exposant négatif ne donne pas un nombre négatif : ${m(`10^{${n1}} = \\dfrac{1}{${bg(10 ** -n1)}}`)}.`], [n1 < 0 ? q(1, 10 ** (-n1 + 1)) : null, `Un zéro de trop : ${m(`10^{${n1}}`)} a son 1 au rang ${m(String(-n1))} après la virgule.`], [n1 < 0 ? q(1, 10 ** (-n1 - 1)) : null, `Un zéro de moins qu’il ne faut : ${m(`10^{-1} = 0{,}1`)}, ${m(`10^{-2} = 0{,}01`)}…`], [n1 === 0 ? q(0) : null, `${m('10^0 = 1')} (et non ${m('0')}) : ${m('10^1 = 10')}, puis on divise par 10.`], [n1 === 0 ? q(10) : null, `${m('10^1 = 10')} ; ${m('10^0')} vaut ${m('10 \\div 10 = 1')}.`], [n1 > 0 ? q(10 * n1) : null, `${m(`10^{${n1}}`)} n’est pas ${m(`10 \\times ${n1}`)}.`]], { form: 'decimal', shown: bg(v1) });
    // b) forme 10^n
    const n2c = level === 1 ? [2, 3, 4, 5, 6, 9, -1, -2, -3, -4] : [-5, -6, -7, 7, 8, 9, 12];
    const n2 = rng.pick(n2c.filter((x) => x !== n1));
    const word = n2 === 9 && rng.chance(0.5) ? 'un milliard' : n2 === 6 && rng.chance(0.5) ? 'un million' : n2 === 12 ? 'mille milliards' : m(bg(P10(n2)));
    const s2 = numStep(`b) Écris ${word} sous la forme ${m('10^n')}.`, m('n ='), q(n2), n2 > 0 ? 'Compte les zéros après le 1.' : 'Compte le rang du 1 après la virgule ; l’exposant est négatif (nombre plus petit que 1).',
      [[q(-n2), n2 < 0 ? `Le nombre est plus petit que 1 : l’exposant est **négatif**.` : 'Le nombre est plus grand que 1 : l’exposant est positif.'], [n2 < 0 ? q(n2 + 1) : null, `Compte le rang du 1 : ${m('0{,}1 = 10^{-1}')}, ${m('0{,}01 = 10^{-2}')}…`], [n2 < 0 ? q(-n2 - 1) : null, `Exposant négatif, et c’est le rang du 1 qui compte (${m('0{,}01 = 10^{-2}')}).`]], { signHint: n2 < 0 ? 'Le nombre est plus petit que 1 : l’exposant est **négatif**.' : 'Le nombre est plus grand que 1 : l’exposant est positif.' });
    // c) multiplier / diviser
    const xs = level === 1 ? [q(37, 10), q(52), q(6, 10), q(81), q(254, 100), q(7), q(125, 10), q(9, 100)] : [q(37, 10), q(52), q(6, 10), q(4508), q(254, 100), q(73), q(125, 10)];
    const x = rng.pick(xs);
    const op = level === 1 ? rng.pick(['mul', 'mul', 'div']) : rng.pick(['mulneg', 'divneg', 'mulneg']);
    const k = level === 1 ? rng.int(2, 4) : rng.int(1, 3);
    const v3 = op === 'mul' ? mul(x, P10(k)) : op === 'div' ? div(x, P10(k)) : op === 'mulneg' ? mul(x, P10(-k)) : div(x, P10(-k));
    const t3 = op === 'mul' ? `${dn(x)} \\times 10^{${k}}` : op === 'div' ? `${dn(x)} \\div 10^{${k}}` : op === 'mulneg' ? `${dn(x)} \\times 10^{-${k}}` : `${dn(x)} \\div 10^{-${k}}`;
    const wrongDir = op === 'mul' || op === 'divneg' ? div(x, P10(k)) : mul(x, P10(k));
    const big3 = op === 'mul' || op === 'divneg';
    const s3 = numStep(`c) Calcule ${m(t3)}.`, m(`${t3} =`), v3, op === 'mulneg' ? `Multiplier par ${m(`10^{-${k}}`)}, c’est diviser par ${m(`10^{${k}}`)}.` : op === 'divneg' ? `Diviser par ${m(`10^{-${k}} = \\dfrac{1}{10^{${k}}}`)}, c’est multiplier par ${m(`10^{${k}}`)}.` : `Les chiffres se décalent de ${m(String(k))} rang${k > 1 ? 's' : ''} vers la ${op === 'mul' ? 'gauche' : 'droite'}.`,
      [[wrongDir, big3 ? `Le résultat doit être plus **grand** que ${m(dn(x))}.` : `Le résultat doit être plus **petit** que ${m(dn(x))}.`], [big3 ? mul(x, P10(k + 1)) : div(x, P10(k + 1)), `Décalage d’un rang de trop : ${m(String(k))} rang${k > 1 ? 's' : ''} seulement.`], [big3 ? mul(x, P10(k - 1)) : div(x, P10(k - 1)), `Il faut décaler de ${m(String(k))} rang${k > 1 ? 's' : ''}.`]], { form: 'decimal', shown: bg(v3) });
    const sol3 = op === 'mul' ? `${m(`${t3} = ${bg(v3)}`)} (décalage de ${k} rang${k > 1 ? 's' : ''} vers la gauche).` : op === 'div' ? `${m(`${t3} = ${bg(v3)}`)} (décalage de ${k} rang${k > 1 ? 's' : ''} vers la droite).` : op === 'mulneg' ? `${m(`${t3} = ${dn(x)} \\div 10^{${k}} = ${bg(v3)}`)}.` : `${m(`${t3} = ${dn(x)} \\times 10^{${k}} = ${bg(v3)}`)}.`;
    return {
      title: 'Puissances de 10.',
      steps: [s1, s2, s3],
      solution: [
        `a) ${m(`10^{${n1}} = ${bg(v1)}`)}${n1 < 0 ? ` (${m(`= \\dfrac{1}{10^{${-n1}}}`)} : ${ZEROS(n1)})` : n1 === 0 ? ' (on divise ' + m('10^1 = 10') + ' par 10)' : ` (${ZEROS(n1)})`}.`,
        `b) ${m(`${bg(P10(n2))} = 10^{${n2}}`)}${n2 < 0 ? ` (le 1 est au rang ${-n2} après la virgule)` : ` (${n2} zéros)`}.`,
        `c) ${sol3}`,
      ],
      answer: `${m(bg(v1))} ; ${m(`10^{${n2}}`)} ; ${m(bg(v3))}`,
      key: `${n1}:${n2}:${t3}`,
      data: { kind: 'js', items: [{ what: 'a', js: `10**${n1}`, expect: toNum(v1) }, { what: 'b', js: `Math.round(Math.log10(${toNum(P10(n2))}))`, expect: n2 }, { what: 'c', js: `${toNum(x)}*10**${op === 'mul' || op === 'divneg' ? k : -k}`, expect: toNum(v3) }] },
    };
  },
};

// ===================================================================== préfixes
/** Unité avec préfixe en TeX (µ en mode math). */
const ux = (sy: string, u: string) => (sy === 'µ' ? `\\mu\\text{${u}}` : `\\text{${sy}${u}}`);
const PRE: [string, string, number][] = [['nano', 'n', -9], ['micro', 'µ', -6], ['milli', 'm', -3], ['kilo', 'k', 3], ['méga', 'M', 6], ['giga', 'G', 9], ['téra', 'T', 12]];
const normSci = (a: Q, n: number): [Q, number] => { let x = a, e = n; while (toNum(x) >= 10) { x = div(x, q(10)); e++; } while (toNum(x) < 1) { x = mul(x, q(10)); e--; } return [x, e]; };
export const prefixes: Generator = {
  id: 'prefixes',
  title: 'Préfixes et ordres de grandeur',
  desc: 'nano, micro, milli, kilo, méga, giga en puissances de 10 ; combien de fois plus petit (★★).',
  stars: 1,
  levels: [1, 2],
  example: '40\\,\\text{nm} = 4 \\times 10^{-8}\\,\\text{m}',
  course: LINKS.s23,
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const met = rng.shuffle(PRE.filter((p) => p[2] <= 3)), oct = rng.shuffle(PRE.filter((p) => p[2] >= 3));
      const pick = rng.chance(0.6) ? [met[0], met[1]] : rng.shuffle([met[0], oct[0]]);
      const steps: Step[] = [], sol: Rich[] = [], ans: Rich[] = [], items: { what: string; js: string; expect: number; tol?: number }[] = [];
      pick.forEach(([nm, sy, e], i) => {
        const unitS = e > 3 || (e === 3 && rng.chance(0.3)) ? ['o', 'octets'] : ['m', 'mètres'];
        const vv = rng.pick([q(rng.int(2, 9)), q(rng.int(2, 9) * 10), q(rng.int(11, 99), 10), q(rng.int(2, 9) * 100)]);
        const [a, n] = normSci(vv, e);
        steps.push({ prompt: `${L[i]}) Exprime ${m(`${dn(vv)}\\,${ux(sy, unitS[0])}`)} en ${unitS[1]}, en notation scientifique.`, answer: { kind: 'num', fields: sciFields(a, n) }, hint: `${nm[0].toUpperCase() + nm.slice(1)} (${sy}) vaut ${m(`10^{${e}}`)}. Puis écris le nombre devant avec un seul chiffre avant la virgule.`,
          mistakes: [{ on: 'numAll', values: [a, q(-n)], msg: `Le signe de l’exposant : ${nm} vaut ${m(`10^{${e}}`)}.` }, ...(eqQ(vv, a) ? [] : [{ on: 'numAll' as const, values: [vv, q(e)], msg: `Égalité juste, mais ce n’est pas la notation scientifique : ${m(dn(vv))} n’est pas entre 1 et 10.` }])] });
        sol.push(`${L[i]}) ${m(`${dn(vv)}\\,${ux(sy, unitS[0])} = ${dn(vv)} \\times 10^{${e}}\\,\\text{${unitS[0]}}${eqQ(vv, a) ? '' : ` = ${sci(a, n)}\\,\\text{${unitS[0]}}`}`)}.`);
        ans.push(m(`${sci(a, n)}\\,\\text{${unitS[0]}}`));
        items.push(...sciJs(`${toNum(vv)}*10**${e}`, a, n, L[i]));
      });
      return { title: 'Préfixes.', steps, solution: sol, answer: ans.join(' ; '), key: steps.map((s) => s.prompt).join('|'), data: { kind: 'js', items: items } };
    }
    // ★★ : combien d'objets alignés / de fichiers
    const ctx = rng.pick(['align', 'align', 'stock']);
    if (ctx === 'align') {
      const objs: [string, number, string, number][] = [['Un globule rouge mesure', 7, 'µ', -6], ['Une cellule de la peau mesure', 30, 'µ', -6], ['Une bactérie mesure', 2, 'µ', -6], ['Un virus mesure', 100, 'n', -9], ['Un cheveu a une épaisseur d’', 80, 'µ', -6], ['Un grain de sable fin mesure', 200, 'µ', -6], ['Un fil d’araignée a une épaisseur d’', 4, 'µ', -6], ['Une molécule d’ADN a une largeur d’', 2, 'n', -9]];
      for (;;) {
        const [nm, s, sy, e] = rng.pick(objs);
        const [, , e2] = rng.pick(PRE.filter((p) => p[2] > e && p[2] <= 3)) as [string, string, number];
        const sy2 = PRE.find((p) => p[2] === e2)![1];
        const L2 = rng.pick([1, 2, 5, 7, 10, 14, 20, 35, 50, 70, 100]);
        const cnt = (L2 * 10 ** (e2 - e)) / s;
        if (!Number.isInteger(cnt) || cnt < 10 || cnt > 1e9) continue;
        const ratio = 10 ** (e2 - e);
        return {
          title: 'Ordres de grandeur.',
          statement: `${nm}${nm.endsWith('’') ? '' : ' '}environ ${m(`${s}\\,${ux(sy, 'm')}`)}.`,
          steps: [
            numStep(`a) Combien de fois le ${PRE.find((p) => p[2] === e2)![0]}mètre est-il plus grand que le ${PRE.find((p) => p[2] === e)![0]}mètre ?`, '', q(ratio), `${m(`1\\,${ux(sy2, 'm')} = 10^{${e2}}\\,\\text{m}`)} et ${m(`1\\,${ux(sy, 'm')} = 10^{${e}}\\,\\text{m}`)} : fais le quotient.`, [[q(e2 - e), `C’est l’exposant de la réponse : ${m(`10^{${e2 - e}}`)}. Donne le nombre.`], [P10(e2 + e), `Quotient : on **soustrait** les exposants, ${m(`${e2} - (${e})`)}.`]], { shown: bg(ratio) }),
            numStep(`b) Combien faudrait-il en aligner pour couvrir ${m(`${L2}\\,${ux(sy2, 'm')}`)} ?`, '', q(cnt), `Convertis ${m(`${L2}\\,${ux(sy2, 'm')}`)} en ${PRE.find((p) => p[2] === e)![0]}mètres, puis divise par ${m(String(s))}.`, [[q(cnt * s), `Il faut encore diviser par la taille d’un objet, ${m(`${s}\\,${ux(sy, 'm')}`)}.`], [q((L2 * 10 ** (e2 - e + 3)) / s), 'Un facteur 1 000 de trop : revois la conversion.'], [isInt(q(L2 * 10 ** (e2 - e - 3), s)) ? q(L2 * 10 ** (e2 - e - 3), s) : null, 'Un facteur 1 000 de moins : revois la conversion.']], { shown: bg(cnt) }),
          ],
          solution: [`a) ${m(`\\dfrac{10^{${e2}}}{10^{${e}}} = 10^{${e2} - (${e})} = 10^{${e2 - e}} = ${bg(ratio)}`)}.`, `b) ${m(`${L2}\\,${ux(sy2, 'm')} = ${bg(L2 * ratio)}\\,${ux(sy, 'm')}`)} ; ${m(`${bg(L2 * ratio)} \\div ${s} = ${bg(cnt)}`)}.`, `Contrôle : ${m(`${bg(cnt)} \\times ${s}\\,${ux(sy, 'm')} = ${bg(L2 * ratio)}\\,${ux(sy, 'm')}`)} ✓.`],
          answer: `${m(bg(ratio))} ; ${m(bg(cnt))}`,
          key: `al:${nm}:${e2}:${L2}`,
          data: { kind: 'js', items: [{ what: 'ratio', js: `10**${e2}/10**${e}`, expect: ratio, tol: 1e-6 }, { what: 'cnt', js: `${L2}*10**${e2}/(${s}*10**${e})`, expect: cnt, tol: 1e-6 }] },
        };
      }
    }
    for (;;) {
      const [cap, cu, ce] = rng.pick([[rng.pick([1, 2, 4, 8]), 'To', 12], [rng.pick([16, 32, 64, 128, 256, 512]), 'Go', 9]] as [number, string, number][]);
      const [fs, fu, fe, what] = rng.pick([[rng.pick([2, 4, 5, 8]), 'Mo', 6, 'photo'], [rng.pick([3, 4, 5, 8]), 'Mo', 6, 'morceau de musique'], [rng.pick([2, 4, 5]), 'Go', 9, 'film'], [rng.pick([200, 250, 400, 500]), 'ko', 3, 'document']] as [number, string, number, string][]);
      if (fe >= ce) continue;
      const cnt = (cap * 10 ** ce) / (fs * 10 ** fe);
      if (!Number.isInteger(cnt) || cnt < 10) continue;
      const [ma, mn] = normSci(q(cap, fs), ce - fe);
      const plural = what === 'morceau de musique' ? 'morceaux de musique' : `${what}s`;
      return {
        title: 'Stockage.',
        statement: `Une clé (ou un disque) a une capacité de ${m(`${cap}\\,\\text{${cu}}`)}. Un ${what} occupe ${m(`${fs}\\,\\text{${fu}}`)}. (Préfixes : k ${m('10^3')}, M ${m('10^6')}, G ${m('10^9')}, T ${m('10^{12}')}.)`,
        steps: [
          { prompt: `a) Combien de ${plural} peut-on stocker ? Donne le résultat en notation scientifique.`, answer: { kind: 'num', fields: sciFields(ma, mn) }, hint: `${m(`\\dfrac{${cap} \\times 10^{${ce}}}{${fs} \\times 10^{${fe}}}`)} : divise les nombres, puis les puissances de 10.`, mistakes: [{ on: 'numAll', values: [ma, q(ce + fe)], msg: 'Quotient de puissances de 10 : on **soustrait** les exposants.' }] },
          numStep('b) Donne ce nombre en écriture décimale.', '', q(cnt), `${m(`10^{${mn}}`)} : un 1 suivi de ${mn} zéros.`, [], { shown: bg(cnt) }),
        ],
        solution: [`a) ${m(`\\dfrac{${cap} \\times 10^{${ce}}}{${fs} \\times 10^{${fe}}} = ${dn(q(cap, fs))} \\times 10^{${ce - fe}}${eqQ(q(cap, fs), ma) ? '' : ` = ${sci(ma, mn)}`}`)}.`, `b) ${m(`${sci(ma, mn)} = ${bg(cnt)}`)} ${plural}.`],
        answer: `${m(sci(ma, mn))} = ${m(bg(cnt))}`,
        key: `st:${cap}${cu}:${fs}${fu}:${what}`,
        data: { kind: 'js', items: [{ what: 'cnt', js: `${cap}e${ce}/${fs}e${fe}`, expect: cnt, tol: 1e-6 }, ...sciJs(`${cap}e${ce}/${fs}e${fe}`, ma, mn)] },
      };
    }
  },
};
const eqQ = (a: Q, b: Q) => a.n === b.n && a.d === b.d;

// ===================================================================== règles de calcul
type R = { tex: string; n: number; mk: [Q | null, Rich][]; sol: string; js: string; b: number };
function rule10(rng: Rng, b = 10, B = String(b)): R {
  const e = () => { let x = 0; while (x === 0 || x === 1) x = rng.int(-6, 9); return x; };
  const kind = rng.pick(['prod', 'quot', 'pp']);
  const [lp, rp] = B.startsWith('(') ? ['\\left[', '\\right]'] : ['\\left(', '\\right)'];
  if (kind === 'prod') {
    const x = e(), y = e();
    const neg = (v: number) => (v < 0 ? `(${v})` : String(v));
    return { b, tex: `${B}^{${x}} \\times ${B}^{${y}}`, n: x + y, js: `(${b}**${x})*(${b}**${y})`, mk: [[q(x * y), `Produit : on **additionne** les exposants (${m(`${x} + ${neg(y)}`)}), on ne les multiplie pas.`]], sol: `${m(`${B}^{${x}} \\times ${B}^{${y}} = ${B}^{${x} + ${neg(y)}} = ${B}^{${x + y}}`)}` };
  }
  if (kind === 'quot') {
    const x = e(), y = e();
    return { b, tex: `\\dfrac{${B}^{${x}}}{${B}^{${y}}}`, n: x - y, js: `(${b}**${x})/(${b}**${y})`, mk: [[q(x + y), `Quotient : on **soustrait** l’exposant du dénominateur : ${m(`${x} - ${y < 0 ? `(${y})` : y}`)}.`], [y < 0 ? q(x + y) : null, ''], [q(y - x), 'C’est l’exposant du haut moins celui du bas.'], [x % y === 0 ? q(x / y) : null, 'On ne divise pas les exposants : on les soustrait.']], sol: `${m(`\\dfrac{${B}^{${x}}}{${B}^{${y}}} = ${B}^{${x} - ${y < 0 ? `(${y})` : y}} = ${B}^{${x - y}}`)}` };
  }
  const x = rng.pick([2, 3, 4, -2, -3, 5]), y = rng.pick([2, 3, 4]);
  return { b, tex: `${lp}${B}^{${x}}${rp}^{${y}}`, n: x * y, js: `(${b}**${x})**${y}`, mk: [[q(x + y), `Puissance d’une puissance : on **multiplie** les exposants (${m(`${x} \\times ${y}`)}).`], [q(x ** y), 'On multiplie les exposants ; on ne calcule pas une puissance de l’exposant.']], sol: `${m(`${lp}${B}^{${x}}${rp}^{${y}} = ${B}^{${x} \\times ${y < 0 ? `(${y})` : y}} = ${B}^{${x * y}}`)}` };
}
export const regles: Generator = {
  id: 'regles',
  title: 'Règles de calcul',
  desc: 'Produit, quotient, puissance d’une puissance (10ⁿ) ; autres bases (★★) ; changer de base (★★★).',
  stars: 1,
  levels: [1, 2, 3],
  example: '\\dfrac{10^5 \\times 10^{-2}}{10^4} = 10^{-1}',
  course: LINKS.s4,
  generate(rng: Rng, level: Level) {
    const fix = (mk: [Q | null, Rich][]) => mk.filter(([, s]) => s !== '');
    if (level === 1) {
      const rs: R[] = [];
      while (rs.length < 3) { const r = rule10(rng); if (!rs.some((x) => x.tex === r.tex) && Math.abs(r.n) <= 30) rs.push(r); }
      return {
        title: 'Écris sous la forme $10^n$.',
        steps: rs.map((r, i) => numStep(`${L[i]}) ${m(r.tex)}`, m(`= 10^n, \\; n =`), q(r.n), 'Compte les facteurs 10 : produit → on additionne, quotient → on soustrait, puissance de puissance → on multiplie.', fix(r.mk))),
        solution: rs.map((r, i) => `${L[i]}) ${r.sol}.`),
        answer: rs.map((r) => m(`10^{${r.n}}`)).join(' ; '),
        key: rs.map((r) => r.tex).join('|'),
        data: { kind: 'js', items: rs.map((r, i) => ({ what: L[i], js: `Math.round(Math.log10(${r.js}))`, expect: r.n })) },
      };
    }
    if (level === 2) {
      // a) combinaison de 10 ; b) autre base
      const x = rng.int(-4, 8), y = rng.int(-5, 6), z = rng.int(-5, 7);
      const variant = rng.pick(['pq', 'ppq']);
      let tex: string, n: number, sol: string, jsx: string, mk: [Q | null, Rich][];
      const p = (v: number) => (v < 0 ? `(${v})` : String(v));
      if (variant === 'pq' || x === 0 || y === 0 || z === 0) {
        tex = `\\dfrac{10^{${x}} \\times 10^{${y}}}{10^{${z}}}`; n = x + y - z; jsx = `10**${x}*10**${y}/10**${z}`;
        sol = `Numérateur : ${m(`10^{${x} + ${p(y)}} = 10^{${x + y}}`)} ; puis ${m(`\\dfrac{10^{${x + y}}}{10^{${z}}} = 10^{${x + y} - ${p(z)}} = 10^{${n}}`)}`;
        mk = [[q(x + y + z), 'Le dénominateur : on **soustrait** son exposant.'], [q(x * y - z), 'Produit du numérateur : on additionne les exposants.']];
      } else {
        const a = rng.pick([2, 3, -2]), c = rng.int(-6, 6) || 2;
        tex = `\\left(10^{${a}}\\right)^{${Math.abs(y) < 2 ? 3 : Math.abs(y)}} \\times 10^{${c}}`; const yy = Math.abs(y) < 2 ? 3 : Math.abs(y);
        n = a * yy + c; jsx = `(10**${a})**${yy}*10**${c}`;
        sol = `${m(`\\left(10^{${a}}\\right)^{${yy}} = 10^{${a * yy}}`)} ; puis ${m(`10^{${a * yy}} \\times 10^{${c}} = 10^{${a * yy} + ${p(c)}} = 10^{${n}}`)}`;
        mk = [[q(a + yy + c), 'Puissance d’une puissance : on **multiplie** les exposants.']];
      }
      const bb = rng.pick([2, 3, 5, 7, -2, -3]);
      const B = bb < 0 ? `(${bb})` : String(bb);
      const r2 = rule10(rng, bb, B);
      const tex2 = r2.tex;
      return {
        title: 'Écris sous la forme d’une seule puissance.',
        steps: [
          numStep(`a) ${m(tex)}`, m('= 10^n, \\; n ='), q(n), 'Commence par le numérateur (ou la parenthèse), puis applique la règle suivante.', fix(mk)),
          numStep(`b) ${m(tex2)}`, m(`= ${B}^n, \\; n =`), q(r2.n), `Même base ${m(B)} : compte les facteurs ${m(B)}, comme pour 10.`, fix(r2.mk)),
        ],
        solution: [`a) ${sol}.`, `b) ${r2.sol}.`, `Contrôle (b) : les règles sont les mêmes pour toute base non nulle — on compte les facteurs.`],
        answer: `${m(`10^{${n}}`)} ; ${m(`${B}^{${r2.n}}`)}`,
        key: `${tex}|${tex2}`,
        data: { kind: 'js', items: [{ what: 'a', js: `Math.round(Math.log10(${jsx}))`, expect: n }, { what: 'b', js: `Math.round(Math.log(Math.abs(${r2.js.split(String(bb)).join(`(${bb})`)}))/Math.log(${Math.abs(bb)}))`, expect: r2.n }] },
      };
    }
    // ★★★ : changer de base (8^3 × 4^2 = 2^13)
    const fam = rng.pick([[2, [4, 8, 16, 32]], [3, [9, 27, 81]], [5, [25, 125]], [10, [100, 1000]]] as [number, number[]][]);
    const [p0, pows] = fam;
    const [u, v] = rng.shuffle(pows).slice(0, 2).length === 2 ? rng.shuffle(pows).slice(0, 2) : [pows[0], p0];
    const eu_ = Math.round(Math.log(u) / Math.log(p0)), ev = Math.round(Math.log(v) / Math.log(p0));
    const a = rng.int(2, 5), b = rng.int(2, 4);
    const quot = rng.chance(0.4);
    const n = quot ? eu_ * a - ev * b : eu_ * a + ev * b;
    const tex = quot ? `\\dfrac{${u}^{${a}}}{${v}^{${b}}}` : `${u}^{${a}} \\times ${v}^{${b}}`;
    return {
      title: `Écris sous la forme d’une puissance de $${p0}$.`,
      steps: [
        step(`a) Écris ${m(String(u))} et ${m(String(v))} comme des puissances de ${m(String(p0))}.`, [F(m(`${u} = ${p0}^n, \\; n =`), q(eu_)), F(m(`${v} = ${p0}^n, \\; n =`), q(ev))], `Combien de facteurs ${m(String(p0))} faut-il multiplier pour obtenir ${m(String(u))} ? et ${m(String(v))} ?`, [{ on: 'numAll', values: [q(u / p0), q(v / p0)], msg: `On cherche un **exposant** : combien de facteurs ${m(String(p0))} ? (et non ${m(`${u} \\div ${p0}`)})` }]),
        numStep(`b) ${m(tex)}`, m(`= ${p0}^n, \\; n =`), q(n), `${m(`${u}^{${a}} = (${p0}^{${eu_}})^{${a}}`)} : puissance d’une puissance.`, [[quot ? q(eu_ + a - ev - b) : q(eu_ + a + ev + b), 'Puissance d’une puissance : on **multiplie** les exposants.'], [quot ? null : q(a + b), `Les bases ${m(String(u))} et ${m(String(v))} sont différentes : écris-les d’abord avec la base ${m(String(p0))}.`]]),
      ],
      solution: [`${m(`${u} = ${p0}^{${eu_}}`)} et ${m(`${v} = ${p0}^{${ev}}`)}.`, quot ? `${m(`${tex} = \\dfrac{${p0}^{${eu_ * a}}}{${p0}^{${ev * b}}} = ${p0}^{${eu_ * a} - ${ev * b}} = ${p0}^{${n}}`)}.` : `${m(`${tex} = ${p0}^{${eu_ * a}} \\times ${p0}^{${ev * b}} = ${p0}^{${eu_ * a} + ${ev * b}} = ${p0}^{${n}}`)}.`],
      answer: m(`${p0}^{${n}}`),
      key: tex,
      data: { kind: 'js', items: [{ what: 'n', js: `Math.round(Math.log(${u}**${a}${quot ? '/' : '*'}${v}**${b})/Math.log(${p0}))`, expect: n }, { what: 'u', js: `Math.round(Math.log(${u})/Math.log(${p0}))`, expect: eu_ }, { what: 'v', js: `Math.round(Math.log(${v})/Math.log(${p0}))`, expect: ev }] },
    };
  },
};

// ===================================================================== exposants négatifs
export const negatifs: Generator = {
  id: 'negatifs',
  title: 'Exposant nul ou négatif',
  desc: 'a⁰ = 1 ; a⁻ⁿ = 1/aⁿ en fraction et en écriture décimale.',
  stars: 2,
  levels: [2],
  example: '2^{-3} = \\dfrac{1}{8} = 0{,}125',
  course: LINKS.s3,
  generate(rng: Rng) {
    const pool: [number, number][] = [];
    for (const a of [2, 4, 5, 10, 20, 3, 6, 7, -2, -3, -5]) for (let n = 1; n <= 5; n++) if (Math.abs(a) ** n <= 1000 && !(Math.abs(a) === 10 && n < 3)) pool.push([a, n]);
    const picks = rng.shuffle(pool).slice(0, 3);
    const steps: Step[] = [], sol: Rich[] = [], ans: Rich[] = [], items: { what: string; js: string; expect: number }[] = [];
    picks.forEach(([a, n], i) => {
      const den = a ** n, v = q(1, den);
      const finite = [2, 4, 5, 10, 20, -2, -5].includes(a);
      const tex = pw(a, -n);
      const fields: NumField[] = [{ label: 'Fraction :', expect: v, form: 'irreducible', shown: v.n < 0 ? `-\\dfrac{1}{${-den}}` : `\\dfrac{1}{${den}}` }];
      if (finite) fields.push({ label: 'Écriture décimale :', expect: v, form: 'decimal', shown: dn(v) });
      steps.push({ prompt: `${L[i]}) Écris ${m(tex)} sous forme de fraction${finite ? ', puis en écriture décimale' : ''}.`, answer: { kind: 'num', fields }, hint: `${m(`a^{-n} = \\dfrac{1}{a^n}`)} : ${m(`${tex} = \\dfrac{1}{${pw(a, n)}}`)}.${a < 0 ? ' Attention au signe de la base.' : ''}`,
        mistakes: [...mist(v, [[q(-den), `Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, ${m(`\\dfrac{1}{${pw(a, n)}}`)}.`], [q(-a * n), `Un exposant négatif ne donne pas l’opposé : il donne l’**inverse**, ${m(`\\dfrac{1}{${pw(a, n)}}`)}.`], [q(den), `${m(tex)} est l’**inverse** de ${m(pw(a, n))}.`], [q(1, a * n), `${m(pw(a, n))} n’est pas ${m(`${a} \\times ${n}`)}.`], [a < 0 && n % 2 ? q(1, -den) : null, `Base négative, exposant ${n} impair : ${m(pw(a, n))} est négatif.`], [a < 0 && n % 2 === 0 ? q(-1, den) : null, `Base négative, exposant ${n} pair : ${m(pw(a, n))} est positif.`]], 0)],
      });
      sol.push(`${L[i]}) ${m(`${tex} = \\dfrac{1}{${pw(a, n)}} = ${fields[0].shown}${finite ? ` = ${dn(v)}` : ''}`)}.`);
      ans.push(m(`${fields[0].shown}${finite ? ` = ${dn(v)}` : ''}`));
      items.push({ what: tex, js: `${a < 0 ? `(${a})` : a}**(-${n})`, expect: toNum(v) });
    });
    // d) exposant nul
    const a0 = rng.pick([7, 13, 2026, 3.5, -4, 1000]);
    const t0 = a0 < 0 || !Number.isInteger(a0) ? `(${String(a0).replace('.', '{,}')})^{0}` : `${a0}^{0}`;
    steps.push(numStep(`d) Que vaut ${m(t0)} ?`, m(`${t0} =`), q(1), 'Prolonge la suite des puissances : chaque fois que l’exposant baisse de 1, on divise par la base.', [[q(0), `${m('a^0 = 1')} pour tout ${m('a')} non nul (et non ${m('0')}).`], [Number.isInteger(a0) ? q(a0) : null, `${m(`${t0}`)} : on a divisé ${m(`${t0.replace('^{0}', '^1')}`)} par la base, donc ${m('1')}.`]]));
    sol.push(`d) ${m(`${t0} = 1`)} (exposant nul, base non nulle).`);
    ans.push(m('1'));
    items.push({ what: 'zero', js: `(${a0})**0`, expect: 1 });
    return { title: 'Exposant nul ou négatif.', steps, solution: [...sol, `Contrôle : ${m(`${pw(picks[0][0], -picks[0][1])} \\times ${pw(picks[0][0], picks[0][1])} = 1`)} ✓ (inverses).`], answer: ans.join(' ; '), key: picks.map((p) => p.join('^')).join('|') + a0, data: { kind: 'js', items } };
  },
};
void add; void sub; void jsq;
