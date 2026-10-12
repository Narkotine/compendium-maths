/** Chapitre 14 : conversions, aires, disque, figures composées, volumes, aires latérales, k/k²/k³, durées, grandeurs composées, erreurs. */
import type { Generator, Level, Rich, Step, NumField } from '../engine/types';
import type { Rng } from '../engine/rng';
import { mist, shuffledChoice, fixedChoice, NAMES } from '../engine/build';
import { mul, div, add, sub, eq } from '../engine/q';
import { texQ } from '../engine/expr';
import type { Pt } from '../engine/svg';
import { LINKS, m, dn, dx, qd, U, ax, safe, approxF, exactF, shapeSvg, q, toNum, type Q } from './common';

type Item = { what: string; js: string; expect: number; tol?: number };
const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Step['mistakes'] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
const P10 = (e: number) => (e >= 0 ? q(10 ** e) : q(1, 10 ** -e));
const pi = (k: Q) => (eq(k, q(1)) ? '\\pi' : `${texQ(k)}\\pi`);

// ===================================================================== conversions
const LEN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];
export const conversion: Generator = {
  id: 'conversion', title: 'Conversions', stars: 1, levels: [1, 2], course: LINKS.s13, links: [LINKS.s12, LINKS.s14],
  desc: 'Longueurs ×10, aires ×100, volumes ×1 000 par rang ; ★★ : litres, hectares, capacités.',
  example: '3{,}5\\,\\mathrm{m}^2 = 35\\,000\\,\\mathrm{cm}^2',
  generate(rng: Rng, level: Level) {
    const steps: Step[] = [], sol: Rich[] = [], items: Item[] = [];
    const kinds = level === 1 ? rng.shuffle(['L', 'A', 'A', 'V']).slice(0, 3) : rng.shuffle(['VL', 'ha', 'cap', 'V', 'Lm3']).slice(0, 3);
    kinds.forEach((kd, i) => {
      let from: string, to: string, v: Q, f: Q, why: string, wrong: Q | null;
      const pickV = () => qd(rng.pick([rng.int(2, 95) / 10, rng.int(12, 980), rng.int(2, 75) / 100, rng.int(1, 9)]));
      if (kd === 'L' || kd === 'A' || kd === 'V') {
        const p = kd === 'L' ? 1 : kd === 'A' ? 2 : 3;
        let a: number, b: number; do { a = rng.int(0, 6); b = rng.int(0, 6); } while (a === b || Math.abs(a - b) > (p === 1 ? 4 : p === 2 ? 3 : 2) || (p > 1 && (LEN[a] === 'hm' || LEN[b] === 'hm' || LEN[a] === 'dam' || LEN[b] === 'dam')));
        const sup = p === 1 ? '' : p === 2 ? '²' : '³';
        from = LEN[a] + sup; to = LEN[b] + sup;
        f = P10(p * (b - a)); v = pickV(); wrong = P10(b - a);
        why = `${p === 1 ? 'Longueurs' : p === 2 ? 'Aires' : 'Volumes'} : ${p === 1 ? '×10' : p === 2 ? '×100' : '×1 000'} par rang, ${Math.abs(b - a)} rang${Math.abs(b - a) > 1 ? 's' : ''} ${b > a ? 'vers plus petit (le nombre grandit)' : 'vers plus grand (le nombre diminue)'}.`;
        wrong = p === 1 ? null : mul(v, wrong);
      } else if (kd === 'VL' || kd === 'Lm3') {
        const opts: [string, string, Q][] = [['m³', 'L', q(1000)], ['L', 'cm³', q(1000)], ['dm³', 'L', q(1)], ['cm³', 'mL', q(1)], ['L', 'm³', q(1, 1000)], ['mL', 'L', q(1, 1000)], ['cm³', 'L', q(1, 1000)]];
        [from, to, f] = rng.pick(opts); v = pickV(); wrong = mul(v, eq(f, q(1000)) ? q(100) : eq(f, q(1, 1000)) ? q(1, 100) : q(10));
        why = 'Repères : 1 L = 1 dm³, 1 mL = 1 cm³, 1 m³ = 1 000 L.';
      } else if (kd === 'ha') {
        const opts: [string, string, Q][] = [['ha', 'm²', q(10000)], ['m²', 'ha', q(1, 10000)], ['a', 'm²', q(100)], ['km²', 'ha', q(100)], ['ha', 'a', q(100)]];
        [from, to, f] = rng.pick(opts); v = pickV(); wrong = mul(v, eq(f, q(10000)) ? q(1000) : eq(f, q(1, 10000)) ? q(1, 1000) : q(10));
        why = '1 a = 100 m² ; 1 ha = 10 000 m² ; 1 km² = 100 ha.';
      } else {
        const C = ['L', 'dL', 'cL', 'mL']; let a: number, b: number; do { a = rng.int(0, 3); b = rng.int(0, 3); } while (a === b);
        from = C[a]; to = C[b]; f = P10(b - a); v = pickV(); wrong = mul(v, P10(3 * (b - a)));
        why = 'Capacités : ×10 par rang (L, dL, cL, mL), comme les longueurs.';
      }
      const r = mul(v, f);
      if (toNum(r) > 1e8 || (r.d > 1e6)) { v = q(rng.int(2, 9)); }
      const R = mul(v, f);
      steps.push(step(`${'abc'[i]}) ${m(`${dn(v)}${U(from)} = \\ldots${U(to)}`)}`, [{ label: '', expect: R, form: 'decimal', unit: to, shown: dn(R) }], why, mist(R, [[wrong, kd === 'A' || kd === 'V' ? `Aires : ×100 par rang, volumes : ×1 000 (pas ×10).` : 'Revois le nombre de rangs ou l’équivalence.'], [div(v, f), 'Sens inverse : vers une unité plus petite, le nombre grandit.']])));
      sol.push(`${m(`${dn(v)}${U(from)} = ${dn(v)} ${toNum(f) >= 1 ? `\\times ${dn(f)}` : `\\div ${dn(div(q(1), f))}`}${U(to)} = ${dn(R)}${U(to)}`)}`);
      items.push({ what: `r${i}`, js: `${toNum(v)}*${toNum(f)}`, expect: toNum(R), tol: 1e-9 });
    });
    return { title: 'Convertis.', steps, solution: sol, answer: sol.join(' ; '), key: steps.map((s) => s.prompt).join('|'), data: { kind: 'js', items } };
  },
};

// ===================================================================== aires des figures planes
export const aires: Generator = {
  id: 'aires', title: 'Aires des figures planes', stars: 1, levels: [1, 2], course: LINKS.s31, links: [LINKS.s33],
  desc: 'Rectangle, triangle, parallélogramme, trapèze ; la hauteur est perpendiculaire à la base (côté oblique = piège) ; ★★ : retrouver une dimension.',
  example: '\\dfrac{(B + b) \\times h}{2}',
  generate(rng: Rng, level: Level) {
    const kind = rng.pick(['rect', 'tri', 'para', 'trap', 'triObt'] as const);
    const u = rng.pick(['cm', 'm', 'mm', 'cm']);
    const b = rng.int(4, 14) + (rng.chance(0.3) ? 0.5 : 0), h = rng.int(3, 10) + (rng.chance(0.3) ? 0.5 : 0);
    let A: Q, name: string, formula: string, calc: string, pts: Pt[], dims: { a: Pt; b: Pt; t: string; side?: 1 | -1 }[] = [], dash: [Pt, Pt][] = [], right: [Pt, Pt, Pt][] = [], oblique = 0, wrong: Q | null = null, js: string;
    const L = (v: number) => `${String(v).replace('.', ',')} ${u}`;
    if (kind === 'rect') { name = 'rectangle'; A = mul(qd(b), qd(h)); formula = 'L \\times \\ell'; calc = `${dx(b)} \\times ${dx(h)}`; pts = [[0, 0], [b, 0], [b, h], [0, h]]; dims = [{ a: [0, 0], b: [b, 0], t: L(b), side: -1 }, { a: [b, 0], b: [b, h], t: L(h), side: -1 }]; right = [[[0, 0], [1, 0], [0, 1]]]; wrong = qd(2 * (b + h)); js = `${b}*${h}`; }
    else if (kind === 'tri' || kind === 'triObt') {
      const off = kind === 'tri' ? rng.int(1, Math.max(1, Math.floor(b) - 1)) : -rng.int(2, 4);
      name = 'triangle'; A = div(mul(qd(b), qd(h)), q(2)); formula = '\\dfrac{b \\times h}{2}'; calc = `\\dfrac{${dx(b)} \\times ${dx(h)}}{2}`;
      pts = [[0, 0], [b, 0], [off, h]]; dash = [[[off, h], [off, 0]]]; if (off < 0) dash.push([[off, 0], [0, 0]]);
      oblique = Math.round(Math.hypot(b - off, h) * 10) / 10;
      dims = [{ a: [0, 0], b: [b, 0], t: L(b), side: -1 }, { a: [off, 0], b: [off, h], t: L(h), side: off < 0 ? -1 : 1 }, { a: [b, 0], b: [off, h], t: L(oblique), side: -1 }];
      right = [[[off, 0], [off + (off < 0 ? -1 : 1), 0], [off, 1]]];
      wrong = div(mul(qd(b), qd(oblique)), q(2)); js = `${b}*${h}/2`;
    } else if (kind === 'para') {
      const off = rng.int(2, 4); name = 'parallélogramme'; A = mul(qd(b), qd(h)); formula = 'b \\times h'; calc = `${dx(b)} \\times ${dx(h)}`;
      pts = [[0, 0], [b, 0], [b + off, h], [off, h]]; dash = [[[off, h], [off, 0]]]; oblique = Math.round(Math.hypot(off, h) * 10) / 10;
      dims = [{ a: [0, 0], b: [b, 0], t: L(b), side: -1 }, { a: [off, 0], b: [off, h], t: L(h) }, { a: [b, 0], b: [b + off, h], t: L(oblique), side: -1 }];
      right = [[[off, 0], [off + 1, 0], [off, 1]]]; wrong = mul(qd(b), qd(oblique)); js = `${b}*${h}`;
    } else {
      const B = b + rng.int(2, 6), off = rng.int(1, 3); name = 'trapèze'; A = div(mul(add(qd(B), qd(b)), qd(h)), q(2)); formula = '\\dfrac{(B + b) \\times h}{2}'; calc = `\\dfrac{(${dx(B)} + ${dx(b)}) \\times ${dx(h)}}{2}`;
      pts = [[0, 0], [B, 0], [off + b, h], [off, h]]; dash = [[[off, h], [off, 0]]];
      dims = [{ a: [0, 0], b: [B, 0], t: L(B), side: -1 }, { a: [off, h], b: [off + b, h], t: L(b) }, { a: [off, 0], b: [off, h], t: L(h) }];
      right = [[[off, 0], [off + 1, 0], [off, 1]]]; wrong = mul(add(qd(B), qd(b)), qd(h)); js = `(${B}+${b})*${h}/2`;
    }
    const figure = shapeSvg({ pts, dims, dash, right, aria: `${name} : ${dims.map((d) => d.t).join(', ')}` });
    const steps: Step[] = [];
    const sol: Rich[] = [`Aire d’un ${name} : ${m(formula)}.`, `${m(`\\mathcal{A} = ${calc} = ${dn(A)}${U(u + '²')}`)}.`];
    if (level === 1) {
      steps.push(step(`Calcule l’aire de ce ${name}.`, [exactF(m('\\mathcal{A} ='), A, `${u}²`)], `${m(`\\mathcal{A} = ${formula}`)}${oblique ? ' — la hauteur est le segment en pointillés, perpendiculaire à la base.' : '.'}`, mist(A, [[wrong, kind === 'rect' ? 'Ça, c’est le périmètre.' : oblique ? `${m(`${dx(oblique)}${U(u)}`)} est un côté oblique, pas la hauteur : la hauteur est perpendiculaire à la base.` : 'N’oublie pas de diviser par 2.'], [kind.startsWith('tri') || kind === 'trap' ? mul(A, q(2)) : null, 'N’oublie pas de diviser par 2.']])));
      if (kind === 'rect') { steps.push(step('Et son périmètre ?', [exactF(m('P ='), qd(2 * (b + h)), u)], '2 × (L + ℓ).', mist(qd(2 * (b + h)), [[qd(b + h), 'Il y a 4 côtés : 2 × (L + ℓ).']]))); sol.push(`${m(`P = 2 \\times (${dx(b)} + ${dx(h)}) = ${dx(2 * (b + h))}${U(u)}`)}.`); }
      return { title: `Aire d’un ${name}.`, figure, steps, solution: sol, answer: m(`${dn(A)}${U(u + '²')}`), key: `${kind}:${b}:${h}:${pts}:${u}`, data: { kind: 'js', items: [{ what: 'A', js, expect: toNum(A), tol: 1e-9 }, ...(kind === 'rect' ? [{ what: 'P', js: `2*(${b}+${h})`, expect: 2 * (b + h), tol: 1e-9 }] : [])] } };
    }
    // ★★ : retrouver une dimension à partir de l'aire
    const which = rng.pick(['rect', 'carre', 'disque'] as const);
    if (which === 'rect') {
      const w = rng.int(3, 12), l = rng.int(w + 1, 20), Ar = w * l;
      return { title: 'Retrouver une longueur.', statement: `Un rectangle a une aire de ${m(`${Ar}${U('cm²')}`)} et une largeur de ${m(`${w}${U('cm')}`)}.`, steps: [step('Quelle est sa longueur ?', [exactF('', q(l), 'cm')], 'Aire = L × ℓ, donc L = aire ÷ ℓ.', mist(q(l), [[q(Ar - w), 'On divise, on ne soustrait pas.'], [q(Ar * w), 'On divise.']]))], solution: [`${m(`L = ${Ar} \\div ${w} = ${l}${U('cm')}`)}.`], answer: m(`${l}${U('cm')}`), key: `r:${w}:${l}`, data: { kind: 'js', items: [{ what: 'l', js: `${Ar}/${w}`, expect: l }] } };
    }
    let Ar: number; do { Ar = rng.int(8, 200); } while (Number.isInteger(Math.sqrt(Ar)) || !safe(which === 'carre' ? Math.sqrt(Ar) : Math.sqrt(Ar / Math.PI), 1));
    const v = which === 'carre' ? Math.sqrt(Ar) : Math.sqrt(Ar / Math.PI);
    return { title: 'Retrouver une longueur.', statement: `Un ${which === 'carre' ? 'carré' : 'disque'} a une aire de ${m(`${Ar}${U('cm²')}`)}.`, steps: [step(`Quel est son ${which === 'carre' ? 'côté' : 'rayon'}, au millimètre ?`, [approxF('', v, 1, 'cm')], which === 'carre' ? `${m(`c^2 = ${Ar}`)} : racine carrée.` : `${m(`\\pi R^2 = ${Ar}`)}, donc ${m(`R^2 = \\dfrac{${Ar}}{\\pi}`)}.`, mist(q(Math.round(v * 10), 10), [[qd(Math.round((Ar / 4) * 10) / 10), 'L’aire n’est pas 4 × côté (c’est le périmètre).'], [which === 'disque' ? q(Math.round((Ar / Math.PI) * 10), 10) : null, `Il reste à prendre la racine carrée de ${m('R^2')}.`]]))], solution: [which === 'carre' ? `${m(`c^2 = ${Ar}`)}, donc ${m(`c = \\sqrt{${Ar}} \\approx ${ax(v, 1)}${U('cm')}`)}.` : `${m(`\\pi R^2 = ${Ar}`)}, donc ${m(`R = \\sqrt{\\dfrac{${Ar}}{\\pi}} \\approx ${ax(v, 1)}${U('cm')}`)}.`], answer: m(`${ax(v, 1)}${U('cm')}`), key: `${which}:${Ar}`, data: { kind: 'js', items: [{ what: 'v', js: which === 'carre' ? `Math.sqrt(${Ar})` : `Math.sqrt(${Ar}/Math.PI)`, expect: v, tol: 1e-9 }] } };
  },
};

// ===================================================================== disque / cercle
export const disque: Generator = {
  id: 'disque', title: 'Cercle et disque', stars: 1, levels: [1, 2], course: LINKS.s2, links: [LINKS.s31],
  desc: 'P = 2πR, A = πR² : valeur exacte (avec π) puis arrondi ; rayon ou diamètre ? ★★ : tours de roue.',
  example: '\\mathcal{A} = 25\\pi \\approx 78{,}5',
  generate(rng: Rng, level: Level) {
    if (level === 2) {
      const D = rng.int(45, 80), dist = rng.int(1, 10);
      const P = Math.PI * D, n = (dist * 100000) / P;
      return { title: 'La roue de vélo.', statement: `Une roue de vélo a un diamètre de ${m(`${D}${U('cm')}`)}.`, steps: [
        step('a) Distance parcourue en un tour, au dixième de cm ?', [approxF('', P, 1, 'cm')], 'Un tour = le périmètre de la roue : π × D.', mist(q(Math.round(P * 10), 10), [[q(Math.round(2 * P * 10), 10), 'Avec le diamètre : π × D (pas 2 × π × D).'], [q(Math.round(Math.PI * D * D / 4 * 10), 10), 'Ça, c’est une aire.']])),
        step(`b) Combien de tours complets pour parcourir ${m(`${dist}${U('km')}`)} ?`, [{ label: '', expect: q(Math.floor(n)), form: 'any', unit: 'tours', approx: { value: Math.floor(n), tol: 1.01, dp: 0 } }], `${dist} km = ${dist * 100000} cm.`, mist(q(Math.floor(n)), [[q(Math.round(dist * 1000 / P)), 'Convertis les km en cm (pas en m).']])),
      ], solution: [`${m(`P = \\pi \\times ${D} \\approx ${ax(P, 1)}${U('cm')}`)}.`, `${m(`${dist}${U('km')} = ${dx(dist * 100000)}${U('cm')}`)} ; ${m(`${dx(dist * 100000)} \\div (\\pi \\times ${D}) \\approx ${ax(n, 1)}`)}, soit environ ${Math.floor(n)} tours complets.`], answer: `${m(`${ax(P, 1)}${U('cm')}`)} ; ${Math.floor(n)} tours`, key: `roue:${D}:${dist}`, data: { kind: 'js', items: [{ what: 'P', js: `Math.PI*${D}`, expect: P, tol: 1e-9 }, { what: 'n', js: `Math.floor(${dist * 100000}/(Math.PI*${D}))`, expect: Math.floor(n) }] } };
    }
    const giveD = rng.chance(0.45), R = rng.int(2, 15) + (rng.chance(0.25) ? 0.5 : 0), D = 2 * R;
    const u = rng.pick(['cm', 'm', 'dm']);
    const kP = qd(2 * R), kA = qd(R * R);
    const steps: Step[] = [
      step('a) Périmètre : valeur exacte (le nombre devant π) puis arrondi au dixième.', [exactF(m('P ='), kP, `π ${u}`), approxF(m('P \\approx'), Math.PI * D, 1, u)], giveD ? 'Avec le diamètre : P = π × D.' : 'P = 2 × π × R.', mist(kP, [[giveD ? qd(2 * D) : qd(R), giveD ? 'Avec le diamètre, c’est π × D (pas 2 × π × D).' : 'P = 2 × π × R : n’oublie pas le 2.'], [kA, 'Ça, c’est le nombre de l’aire.']], 0)),
      step('b) Aire : valeur exacte puis arrondi au dixième.', [exactF(m('\\mathcal{A} ='), kA, `π ${u}²`), approxF(m('\\mathcal{A} \\approx'), Math.PI * R * R, 1, `${u}²`)], `${m('\\mathcal{A} = \\pi \\times R^2')}${giveD ? ' avec R = D ÷ 2' : ''}.`, mist(kA, [[giveD ? qd(D * D) : null, `Le rayon vaut ${dx(R)}, pas ${dx(D)} : il faut diviser le diamètre par 2.`], [qd(2 * R), `${m('R^2 = R \\times R')}, pas ${m('2 \\times R')}.`]], 0)),
    ];
    return { title: `Un ${giveD ? 'disque de diamètre' : 'disque de rayon'} ${m(`${dx(giveD ? D : R)}${U(u)}`)}.`, steps, solution: [giveD ? `Le rayon vaut ${m(`${dx(D)} \\div 2 = ${dx(R)}${U(u)}`)}.` : `${m(`R = ${dx(R)}${U(u)}`)}.`, `${m(`P = 2 \\times \\pi \\times ${dx(R)} = ${pi(kP)} \\approx ${ax(Math.PI * D, 1)}${U(u)}`)}.`, `${m(`\\mathcal{A} = \\pi \\times ${dx(R)}^2 = ${pi(kA)} \\approx ${ax(Math.PI * R * R, 1)}${U(u + '²')}`)}.`], answer: `${m(`${pi(kP)} \\approx ${ax(Math.PI * D, 1)}`)} ; ${m(`${pi(kA)} \\approx ${ax(Math.PI * R * R, 1)}`)}`, key: `${giveD}:${R}:${u}`, data: { kind: 'js', items: [{ what: 'kP', js: `2*${R}`, expect: 2 * R, tol: 1e-9 }, { what: 'P', js: `Math.PI*${D}`, expect: Math.PI * D, tol: 1e-9 }, { what: 'kA', js: `${R}**2`, expect: R * R, tol: 1e-9 }, { what: 'A', js: `Math.PI*${R}**2`, expect: Math.PI * R * R, tol: 1e-9 }] } };
  },
};

// ===================================================================== figures composées
export const composee: Generator = {
  id: 'composee', title: 'Figures composées', stars: 2, levels: [2], course: LINKS.s34,
  desc: 'Rectangle + demi-disque (fenêtre), piste (rectangle + deux demi-disques) : aire et contour extérieur seulement.',
  example: '1{,}2 + \\dfrac{\\pi \\times 0{,}6^2}{2}',
  generate(rng: Rng) {
    const kind = rng.pick(['fenetre', 'piste'] as const);
    if (kind === 'fenetre') {
      const w = rng.pick([1, 1.2, 1.4, 1.6, 0.8, 2, 2.4]), h = rng.pick([0.8, 1, 1.2, 1.5, 1.8]), r = w / 2;
      const A = w * h + (Math.PI * r * r) / 2, P = w + 2 * h + Math.PI * r;
      if (!safe(A, 2) || !safe(P, 2)) return composee.generate(rng, 2);
      const figure = shapeSvg({ pts: [[0, 0], [w, 0], [w, h], [0, h]], dims: [{ a: [0, 0], b: [w, 0], t: `${dx(w).replace('{,}', ',')} m`, side: -1 }, { a: [w, 0], b: [w, h], t: `${dx(h).replace('{,}', ',')} m`, side: -1 }], arcs: [{ c: [r, h], r, from: 0, to: Math.PI }], aria: `Fenêtre : rectangle de ${w} m sur ${h} m surmonté d’un demi-disque de diamètre ${w} m` });
      return { title: 'La fenêtre.', statement: `Une fenêtre est formée d’un rectangle de ${m(`${dx(w)}${U('m')}`)} de large et ${m(`${dx(h)}${U('m')}`)} de haut, surmonté d’un demi-disque de diamètre ${m(`${dx(w)}${U('m')}`)}.`, figure, steps: [
        step('a) Aire de la fenêtre, au centième de m² ?', [approxF('', A, 2, 'm²')], `Rectangle + demi-disque de rayon ${dx(r).replace('{,}', ',')} m.`, mist(q(Math.round(A * 100), 100), [[q(Math.round((w * h + Math.PI * w * w / 2) * 100), 100), 'Le rayon est la moitié du diamètre.'], [q(Math.round((w * h + Math.PI * r * r) * 100), 100), 'C’est un **demi**-disque : divise par 2.']])),
        step('b) Longueur du contour, au centimètre (en m) ?', [approxF('', P, 2, 'm')], 'Trois côtés du rectangle + le demi-cercle (le côté du haut est à l’intérieur).', mist(q(Math.round(P * 100), 100), [[q(Math.round((P + w) * 100), 100), 'Le côté du haut du rectangle n’est pas sur le contour.']])),
      ], solution: [`Aire : ${m(`${dx(w)} \\times ${dx(h)} + \\dfrac{\\pi \\times ${dx(r)}^2}{2} \\approx ${ax(A, 2)}${U('m²')}`)}.`, `Contour : ${m(`${dx(w)} + 2 \\times ${dx(h)} + \\dfrac{2 \\times \\pi \\times ${dx(r)}}{2} \\approx ${ax(P, 2)}${U('m')}`)}.`], answer: `${m(`${ax(A, 2)}${U('m²')}`)} ; ${m(`${ax(P, 2)}${U('m')}`)}`, key: `f:${w}:${h}`, data: { kind: 'js', items: [{ what: 'A', js: `${w}*${h}+Math.PI*${r}**2/2`, expect: A, tol: 1e-9 }, { what: 'P', js: `${w}+2*${h}+Math.PI*${r}`, expect: P, tol: 1e-9 }] } };
    }
    const L = rng.pick([60, 80, 84, 100, 120]), r = rng.pick([20, 25, 30, 32, 36, 40]);
    const P = 2 * L + 2 * Math.PI * r, A = L * 2 * r + Math.PI * r * r, goal = rng.pick([2, 3, 5, 10]) * 1000, n = Math.ceil(goal / P);
    const figure = shapeSvg({ pts: [[0, 0], [L, 0], [L, 2 * r], [0, 2 * r]], dims: [{ a: [0, 2 * r], b: [L, 2 * r], t: `${L} m` }, { a: [0, 0], b: [0, r], t: `${r} m`, side: -1 }], arcs: [{ c: [L, r], r, from: -Math.PI / 2, to: Math.PI / 2 }, { c: [0, r], r, from: Math.PI / 2, to: (3 * Math.PI) / 2 }], aria: `Piste : deux lignes droites de ${L} m reliées par deux demi-cercles de rayon ${r} m` });
    return { title: 'La piste d’athlétisme.', statement: `Une piste est formée de deux lignes droites de ${m(`${L}${U('m')}`)} reliées par deux demi-cercles de rayon ${m(`${r}${U('m')}`)}.`, figure, steps: [
      step('a) Longueur d’un tour, au dixième de mètre ?', [approxF('', P, 1, 'm')], 'Deux demi-cercles = un cercle entier.', mist(q(Math.round(P * 10), 10), [[q(Math.round((2 * L + Math.PI * r) * 10), 10), 'Deux demi-cercles forment un cercle complet : 2πR.'], [q(Math.round((2 * L + 4 * Math.PI * r) * 10), 10), 'Avec le rayon : 2πR (pas 4πR).']])),
      step(`b) Combien de tours complets faut-il pour parcourir au moins ${m(`${goal / 1000}${U('km')}`)} ?`, [exactF('', q(n), 'tours')], `${goal / 1000} km = ${goal} m ; on arrondit **au-dessus**.`, mist(q(n), [[q(n - 1), 'Avec ce nombre de tours, on n’atteint pas encore la distance : arrondis au-dessus.']])),
      step('c) Aire de la pelouse intérieure, au m² près ?', [approxF('', A, 0, 'm²')], 'Rectangle + un disque entier.', mist(q(Math.round(A)), [[q(Math.round(L * 2 * r + Math.PI * r * r / 2)), 'Les deux demi-disques forment un disque entier.']])),
    ], solution: [`Un tour : ${m(`2 \\times ${L} + 2 \\times \\pi \\times ${r} \\approx ${ax(P, 1)}${U('m')}`)}.`, `${m(`${dx(goal)} \\div ${ax(P, 1)} \\approx ${ax(goal / P, 2)}`)} : il faut ${n} tours.`, `Pelouse : ${m(`${L} \\times ${2 * r} + \\pi \\times ${r}^2 \\approx ${ax(A, 0)}${U('m²')}`)}.`], answer: `${m(`${ax(P, 1)}${U('m')}`)} ; ${n} tours ; ${m(`${ax(A, 0)}${U('m²')}`)}`, key: `p:${L}:${r}:${goal}`, data: { kind: 'js', items: [{ what: 'P', js: `2*${L}+2*Math.PI*${r}`, expect: P, tol: 1e-9 }, { what: 'n', js: `Math.ceil(${goal}/(2*${L}+2*Math.PI*${r}))`, expect: n }, { what: 'A', js: `${L}*${2 * r}+Math.PI*${r}**2`, expect: A, tol: 1e-9 }] } };
  },
};

// ===================================================================== volumes
export const volumes: Generator = {
  id: 'volumes', title: 'Volumes', stars: 1, levels: [1, 2], course: LINKS.s41, links: [LINKS.s42, LINKS.s43],
  desc: '★ : pavé, prisme droit, cylindre (base × hauteur) ; ★★ : pyramide, cône (÷ 3), boule (4/3 πR³), conversions en litres.',
  example: 'V = \\dfrac{\\mathcal{B} \\times h}{3}',
  generate(rng: Rng, level: Level) {
    const kind = level === 1 ? rng.pick(['pave', 'prisme', 'cylindre'] as const) : rng.pick(['pyramide', 'cone', 'boule'] as const);
    const u = rng.pick(['cm', 'dm', 'm']);
    let V: number, exact: Q | null = null, st: string, formula: string, calc: string, js: string, wrongs: [Q | null, Rich][] = [], piF = false;
    if (kind === 'pave') { const a = rng.int(2, 12), b = rng.int(2, 12), c = rng.int(2, 12); V = a * b * c; exact = q(V); st = `Un pavé droit mesure ${m(`${a}${U(u)}`)} sur ${m(`${b}${U(u)}`)} sur ${m(`${c}${U(u)}`)}.`; formula = 'L \\times \\ell \\times h'; calc = `${a} \\times ${b} \\times ${c}`; js = `${a}*${b}*${c}`; wrongs = [[q(2 * (a * b + b * c + a * c)), 'Ça, c’est l’aire totale.']]; }
    else if (kind === 'prisme') { const a = rng.int(3, 9), b = rng.int(3, 9), h = rng.int(5, 15); V = (a * b * h) / 2; exact = qd(V); st = `Un prisme droit a pour base un triangle rectangle dont les côtés de l’angle droit mesurent ${m(`${a}${U(u)}`)} et ${m(`${b}${U(u)}`)} ; sa hauteur est ${m(`${h}${U(u)}`)}.`; formula = '\\mathcal{B} \\times h'; calc = `\\dfrac{${a} \\times ${b}}{2} \\times ${h}`; js = `${a}*${b}/2*${h}`; wrongs = [[q(a * b * h), 'La base est un triangle : divise par 2.']]; }
    else if (kind === 'cylindre') { const R = rng.int(2, 10), h = rng.int(3, 20); V = Math.PI * R * R * h; exact = q(R * R * h); piF = true; st = `Un cylindre a un rayon de ${m(`${R}${U(u)}`)} et une hauteur de ${m(`${h}${U(u)}`)}.`; formula = '\\pi \\times R^2 \\times h'; calc = `\\pi \\times ${R}^2 \\times ${h}`; js = `Math.PI*${R}**2*${h}`; wrongs = [[q(2 * R * h), 'R² = R × R, pas 2R.'], [q(4 * R * R * h), 'Le rayon, pas le diamètre.']]; }
    else if (kind === 'pyramide') { let c: number, h: number; do { c = rng.int(3, 15); h = rng.int(3, 20); } while ((c * c * h) % 3); V = (c * c * h) / 3; exact = q(V); st = `Une pyramide a pour base un carré de ${m(`${c}${U(u)}`)} de côté et pour hauteur ${m(`${h}${U(u)}`)}.`; formula = '\\dfrac{\\mathcal{B} \\times h}{3}'; calc = `\\dfrac{${c}^2 \\times ${h}}{3}`; js = `${c}**2*${h}/3`; wrongs = [[q(c * c * h), 'Solide pointu : divise par 3.']]; }
    else if (kind === 'cone') { let R: number, h: number; do { R = rng.int(2, 10); h = rng.int(3, 18); } while ((R * R * h) % 3); V = (Math.PI * R * R * h) / 3; exact = q((R * R * h) / 3); piF = true; st = `Un cône a un rayon de ${m(`${R}${U(u)}`)} et une hauteur de ${m(`${h}${U(u)}`)}.`; formula = '\\dfrac{\\pi \\times R^2 \\times h}{3}'; calc = `\\dfrac{\\pi \\times ${R}^2 \\times ${h}}{3}`; js = `Math.PI*${R}**2*${h}/3`; wrongs = [[q(R * R * h), 'Solide pointu : divise par 3.']]; }
    else { const R2 = rng.int(2, 30), R = R2 / 2; V = (4 / 3) * Math.PI * R ** 3; exact = q(4 * R2 ** 3, 24); piF = true; st = `Une boule a un rayon de ${m(`${dx(R)}${U(u)}`)}.`; formula = '\\dfrac{4}{3} \\times \\pi \\times R^3'; calc = `\\dfrac{4}{3} \\times \\pi \\times ${dx(R)}^3`; js = `4/3*Math.PI*${R}**3`; wrongs = [[q(R2 * R2), 'Ça, c’est l’aire de la sphère (R²) : le volume contient R³.']]; }
    const fields: NumField[] = piF ? [exactF(m('V ='), exact!, `π ${u}³`), approxF(m('V \\approx'), V, 1, `${u}³`)] : [exactF(m('V ='), exact!, `${u}³`)];
    const steps: Step[] = [step(piF ? 'Calcule le volume : valeur exacte (nombre devant π), puis arrondi au dixième.' : 'Calcule le volume.', fields, m(`V = ${formula}`), mist(exact!, wrongs, 0))];
    const sol: Rich[] = [`${m(`V = ${formula} = ${calc} = ${piF ? `${pi(exact!)} \\approx ${ax(V, 1)}` : dn(exact!)}${U(u + '³')}`)}.`];
    const items: Item[] = [{ what: 'V', js, expect: V, tol: 1e-9 }];
    if (piF) items.unshift({ what: 'k', js: `${js}/Math.PI`, expect: toNum(exact!), tol: 1e-9 });
    if (u !== 'm' && (kind === 'pave' || kind === 'cylindre' || kind === 'cone')) {
      const L = u === 'dm' ? V : V / 10, cu = u === 'dm' ? 'L' : 'cL';
      if (safe(L, 1) || Number.isInteger(L * 10)) {
        steps.push(step(`Contenance en ${u === 'dm' ? 'litres' : 'centilitres'}, au dixième ?`, [Number.isInteger(L * 10) ? exactF('', qd(L), cu) : approxF('', L, 1, cu)], u === 'dm' ? '1 L = 1 dm³.' : '1 mL = 1 cm³ et 1 cL = 10 mL.', mist(qd(Math.round(L * 10) / 10), [[u === 'cm' ? qd(Math.round(V) / 1000) : null, 'Ça, ce sont des litres : on demande des centilitres.']])));
        sol.push(`${u === 'dm' ? 'En dm³, c’est directement des litres' : '1 cm³ = 1 mL, et 10 mL = 1 cL'} : ${Number.isInteger(L * 10) ? '' : 'environ '}${m(`${ax(L, 1)}${U(cu)}`)}.`);
        items.push({ what: 'L', js: `${js}${u === 'cm' ? '/10' : ''}`, expect: L, tol: 1e-9 });
      }
    }
    return { title: { pave: 'Le pavé droit.', prisme: 'Le prisme droit.', cylindre: 'Le cylindre.', pyramide: 'La pyramide.', cone: 'Le cône.', boule: 'La boule.' }[kind], statement: st, steps, solution: sol, answer: m(`V ${piF ? '\\approx' : '='} ${piF ? ax(V, 1) : dn(exact!)}${U(u + '³')}`), key: `${kind}:${st}`, data: { kind: 'js', items } };
  },
};

// ===================================================================== aires latérales et totales
export const laterale: Generator = {
  id: 'laterale', title: 'Aires latérales et totales', stars: 2, levels: [2], course: LINKS.s44, links: [LINKS.s43],
  desc: 'Cube (6 faces), cylindre (rectangle déroulé 2πR × h, + deux disques), sphère (4πR²).',
  example: '2 \\times \\pi \\times R \\times h',
  generate(rng: Rng) {
    const kind = rng.pick(['cube', 'cyl', 'cyl', 'sphere', 'pave'] as const);
    if (kind === 'cube' || kind === 'pave') {
      const a = rng.int(2, 15), b = kind === 'cube' ? a : rng.int(2, 15), c = kind === 'cube' ? a : rng.int(2, 15);
      const S = 2 * (a * b + b * c + a * c);
      return { title: kind === 'cube' ? 'La boîte cubique.' : 'Le carton.', statement: kind === 'cube' ? `On fabrique une boîte cubique de ${m(`${a}${U('cm')}`)} d’arête (avec couvercle).` : `Un carton (pavé droit) mesure ${m(`${a}${U('cm')}`)} sur ${m(`${b}${U('cm')}`)} sur ${m(`${c}${U('cm')}`)}.`, steps: [step('Aire totale de carton nécessaire ?', [exactF('', q(S), 'cm²')], kind === 'cube' ? '6 faces carrées.' : '6 faces rectangulaires, égales deux à deux.', mist(q(S), [[q(a * b * c), 'Ça, c’est le volume.'], [kind === 'cube' ? q(4 * a * a) : q(S / 2), kind === 'cube' ? 'Un cube a 6 faces.' : 'Les faces vont par paires : multiplie par 2.']]))], solution: [kind === 'cube' ? `${m(`6 \\times ${a}^2 = ${S}${U('cm²')}`)}.` : `${m(`2 \\times (${a} \\times ${b} + ${b} \\times ${c} + ${a} \\times ${c}) = ${S}${U('cm²')}`)}.`], answer: m(`${S}${U('cm²')}`), key: `${kind}:${a}:${b}:${c}`, data: { kind: 'js', items: [{ what: 'S', js: `2*(${a}*${b}+${b}*${c}+${a}*${c})`, expect: S }] } };
    }
    if (kind === 'sphere') {
      const R = rng.pick([5, 6, 8, 10, 11, 12, 15, 2.5, 3.5]), S = 4 * Math.PI * R * R;
      const obj = rng.pick(['Un ballon', 'Une boule de bowling', 'Un globe terrestre']);
      return { title: `${obj}.`, statement: `${obj} a un rayon de ${m(`${dx(R)}${U('cm')}`)}.`, steps: [step('Aire de sa surface : nombre devant π, puis arrondi au dixième.', [exactF(m('\\mathcal{A} ='), qd(4 * R * R), 'π cm²'), approxF(m('\\mathcal{A} \\approx'), S, 1, 'cm²')], m('\\mathcal{A} = 4 \\times \\pi \\times R^2'), mist(qd(4 * R * R), [[qd((4 / 3) * R ** 3), 'Ça, c’est le nombre du volume (R³).'], [qd(R * R), 'Sphère : 4 × π × R².']], 0))], solution: [`${m(`\\mathcal{A} = 4 \\times \\pi \\times ${dx(R)}^2 = ${pi(qd(4 * R * R))} \\approx ${ax(S, 1)}${U('cm²')}`)}.`], answer: m(`${ax(S, 1)}${U('cm²')}`), key: `s:${R}:${obj}`, data: { kind: 'js', items: [{ what: 'k', js: `4*${R}**2`, expect: 4 * R * R, tol: 1e-9 }, { what: 'S', js: `4*Math.PI*${R}**2`, expect: S, tol: 1e-9 }] } };
    }
    const R = rng.int(2, 12), h = rng.int(5, 25), Al = 2 * Math.PI * R * h, At = Al + 2 * Math.PI * R * R;
    return { title: 'La boîte de conserve.', statement: `Une boîte cylindrique a un rayon de ${m(`${R}${U('cm')}`)} et une hauteur de ${m(`${h}${U('cm')}`)}.`, steps: [
      step('a) Aire de l’étiquette (surface latérale) : nombre devant π, puis arrondi au dixième.', [exactF(m('\\mathcal{A} ='), q(2 * R * h), 'π cm²'), approxF(m('\\mathcal{A} \\approx'), Al, 1, 'cm²')], 'Déroulée, c’est un rectangle : (2πR) × h.', mist(q(2 * R * h), [[q(R * R * h), 'Ça, c’est le volume.'], [q(R * h), 'La longueur du rectangle est le périmètre 2πR.']], 0)),
      step('b) Aire totale (avec les deux disques), arrondie au dixième ?', [approxF('', At, 1, 'cm²')], 'Ajoute 2 × π × R².', mist(q(Math.round((Al + Math.PI * R * R) * 10), 10), [[q(Math.round((Al + Math.PI * R * R) * 10), 10), 'Il y a deux disques : le fond et le couvercle.']])),
    ], solution: [`${m(`2 \\times \\pi \\times ${R} \\times ${h} = ${2 * R * h}\\pi \\approx ${ax(Al, 1)}${U('cm²')}`)}.`, `Disques : ${m(`2 \\times \\pi \\times ${R}^2 = ${2 * R * R}\\pi`)}. Total : ${m(`${2 * R * h + 2 * R * R}\\pi \\approx ${ax(At, 1)}${U('cm²')}`)}.`], answer: m(`${ax(At, 1)}${U('cm²')}`), key: `c:${R}:${h}`, data: { kind: 'js', items: [{ what: 'k', js: `2*${R}*${h}`, expect: 2 * R * h }, { what: 'Al', js: `2*Math.PI*${R}*${h}`, expect: Al, tol: 1e-9 }, { what: 'At', js: `2*Math.PI*${R}*${h}+2*Math.PI*${R}**2`, expect: At, tol: 1e-9 }] } };
  },
};

// ===================================================================== agrandissement / réduction
export const reduction: Generator = {
  id: 'reduction', title: 'Agrandir, réduire : k, k², k³', stars: 2, levels: [2, 3], course: LINKS.s5,
  desc: 'Longueurs × k, aires × k², volumes × k³ ; retrouver k ; ★★★ : maquette, verre conique rempli à mi-hauteur.',
  example: '24 \\times \\left(\\dfrac{1}{2}\\right)^3 = 3',
  generate(rng: Rng, level: Level) {
    if (level === 2) {
      const kind = rng.pick(['cube', 'aireK', 'cone'] as const);
      if (kind === 'cube') { const a = rng.int(1, 6), k = rng.int(2, 5); return { title: 'Le cube agrandi.', statement: `Un cube de ${m(`${a}${U('cm')}`)} d’arête est agrandi avec le rapport ${m(`k = ${k}`)}.`, steps: [step('a) Nouveau volume ?', [exactF('', q((a * k) ** 3), 'cm³')], `Nouvelle arête : ${a * k} cm.`, mist(q((a * k) ** 3), [[q(a ** 3 * k), 'Le volume est multiplié par k³, pas par k.'], [q(a ** 3 * k * k), 'k³, pas k².']])), step('b) Par combien le volume a-t-il été multiplié ?', [exactF('', q(k ** 3))], 'k³.', mist(q(k ** 3), [[q(k), 'Les volumes sont multipliés par k³.'], [q(3 * k), 'k³ = k × k × k, pas 3k.']]))], solution: [`Arête ${a * k} cm, volume ${m(`${a * k}^3 = ${(a * k) ** 3}${U('cm³')}`)} ; ancien volume ${a ** 3} cm³ : multiplié par ${m(`${k}^3 = ${k ** 3}`)}.`], answer: m(`${(a * k) ** 3}${U('cm³')}`), key: `c:${a}:${k}`, data: { kind: 'js', items: [{ what: 'V', js: `(${a}*${k})**3`, expect: (a * k) ** 3 }, { what: 'k3', js: `${k}**3`, expect: k ** 3 }] } }; }
      if (kind === 'aireK') { const k = rng.pick([2, 3, 4, 5, 10]), A = rng.int(2, 30); return { title: 'Retrouver k.', statement: `Dans un agrandissement, une aire passe de ${m(`${A}${U('cm²')}`)} à ${m(`${A * k * k}${U('cm²')}`)}.`, steps: [step('Quel est le rapport k ?', [exactF(m('k ='), q(k))], `${m('k^2 = \\dfrac{\\text{nouvelle aire}}{\\text{ancienne aire}}')}.`, mist(q(k), [[q(k * k), 'Ce quotient vaut k², pas k : prends la racine carrée.']]))], solution: [`${m(`k^2 = \\dfrac{${A * k * k}}{${A}} = ${k * k}`)}, donc ${m(`k = ${k}`)}.`], answer: m(`k = ${k}`), key: `a:${A}:${k}`, data: { kind: 'js', items: [{ what: 'k', js: `Math.sqrt(${A * k * k}/${A})`, expect: k }] } }; }
      const V = rng.int(3, 40) * 8, d = rng.pick([2, 2, 4]); const v = V / d ** 3;
      return { title: 'Le cône réduit.', statement: `Un cône a un volume de ${m(`${V}${U('cm³')}`)}. On le réduit avec le rapport ${m(`k = \\dfrac{1}{${d}}`)}.`, steps: [step('Volume du cône réduit ?', [exactF('', qd(v), 'cm³')], `Multiplie par ${m(`k^3 = \\dfrac{1}{${d ** 3}}`)}.`, mist(qd(v), [[qd(V / d), 'k³, pas k.'], [qd(V / (d * d)), 'k³, pas k².']]))], solution: [`${m(`${V} \\times \\left(\\dfrac{1}{${d}}\\right)^3 = ${V} \\div ${d ** 3} = ${dx(v)}${U('cm³')}`)}.`], answer: m(`${dx(v)}${U('cm³')}`), key: `r:${V}:${d}`, data: { kind: 'js', items: [{ what: 'v', js: `${V}/${d}**3`, expect: v, tol: 1e-9 }] } };
    }
    if (rng.chance(0.5)) {
      const E = rng.pick([50, 100, 200, 500]), Am = rng.int(1, 9) / 10 * (E <= 100 ? 1 : 0.1), Vm = rng.int(1, 9) / 100 * (E <= 100 ? 1 : 0.01);
      const AR = Am * E * E, VR = Vm * E ** 3;
      return { title: 'La maquette.', statement: `La maquette d’un bâtiment est à l’échelle ${m(`\\dfrac{1}{${E}}`)}.`, steps: [
        step(`a) La façade de la maquette a une aire de ${m(`${dx(Am)}${U('m²')}`)}. Aire de la vraie façade ?`, [exactF('', qd(AR), 'm²')], `Rapport de la maquette au bâtiment : k = ${E} ; les aires sont multipliées par k².`, mist(qd(AR), [[qd(Am * E), 'Les aires sont multipliées par k², pas k.']])),
        step(`b) Le volume de la maquette est ${m(`${dx(Vm)}${U('m³')}`)}. Volume du vrai bâtiment ?`, [exactF('', qd(VR), 'm³')], 'Les volumes sont multipliés par k³.', mist(qd(VR), [[qd(Vm * E * E), 'k³, pas k².']])),
      ], solution: [`${m(`k = ${E}`)} ; ${m(`k^2 = ${dx(E * E)}`)}, ${m(`k^3 = ${dx(E ** 3)}`)}.`, `Façade : ${m(`${dx(Am)} \\times ${dx(E * E)} = ${dx(AR)}${U('m²')}`)}. Volume : ${m(`${dx(Vm)} \\times ${dx(E ** 3)} = ${dx(VR)}${U('m³')}`)}.`], answer: `${m(`${dx(AR)}${U('m²')}`)} ; ${m(`${dx(VR)}${U('m³')}`)}`, key: `m:${E}:${Am}:${Vm}`, data: { kind: 'js', items: [{ what: 'A', js: `${Am}*${E}**2`, expect: AR, tol: 1e-6 }, { what: 'V', js: `${Vm}*${E}**3`, expect: VR, tol: 1e-6 }] } };
    }
    const H = rng.pick([8, 10, 12, 15, 16, 18, 20]), fr0 = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]] as [number, number][]);
    const hh = (H * fr0[0]) / fr0[1]; if (!Number.isInteger(hh)) return reduction.generate(rng, level);
    const Vt = fr0[1] ** 3 * rng.int(fr0[1] === 2 ? 2 : 1, fr0[1] === 2 ? 6 : fr0[1] === 3 ? 2 : 1) * (fr0[1] === 4 ? 0.5 : 1), v = (Vt * fr0[0] ** 3) / fr0[1] ** 3;
    return { title: 'Le verre conique.', statement: `Un verre en forme de cône (pointe en bas) a une hauteur de ${m(`${H}${U('cm')}`)} et contient ${m(`${dx(Vt)}${U('cL')}`)} quand il est plein. On le remplit jusqu’à ${m(`${hh}${U('cm')}`)} de hauteur.`, steps: [
      step('a) Rapport de réduction k ?', [exactF(m('k ='), q(fr0[0], fr0[1]))], `${m(`k = \\dfrac{${hh}}{${H}}`)}.`, mist(q(fr0[0], fr0[1]), [[q(fr0[1], fr0[0]), 'Petit sur grand.']])),
      step('b) Quantité de liquide ?', [exactF('', qd(v), 'cL')], 'Les volumes sont multipliés par k³.', mist(qd(v), [[qd((Vt * fr0[0]) / fr0[1]), 'k³, pas k : le verre est loin d’être rempli à proportion de sa hauteur.']])),
    ], solution: [`Le liquide forme un cône réduit de rapport ${m(`k = \\dfrac{${hh}}{${H}} = \\dfrac{${fr0[0]}}{${fr0[1]}}`)}.`, `${m(`${dx(Vt)} \\times \\left(\\dfrac{${fr0[0]}}{${fr0[1]}}\\right)^3 = ${dx(v)}${U('cL')}`)}.`], answer: m(`${dx(v)}${U('cL')}`), key: `v:${H}:${fr0}:${Vt}`, data: { kind: 'js', items: [{ what: 'k', js: `${hh}/${H}`, expect: fr0[0] / fr0[1], tol: 1e-12 }, { what: 'v', js: `${Vt}*(${hh}/${H})**3`, expect: v, tol: 1e-9 }] } };
  },
};

// ===================================================================== durées
export const durees: Generator = {
  id: 'durees', title: 'Durées', stars: 1, levels: [1, 2], course: LINKS.s61,
  desc: 'Heures décimales ↔ heures et minutes (1 h = 60 min) ; ★★ : horaires de début, de fin, durées.',
  example: '2{,}4\\,\\mathrm{h} = 2\\,\\mathrm{h}\\,24\\,\\mathrm{min}',
  generate(rng: Rng, level: Level) {
    if (level === 1) {
      const H = rng.int(1, 5), dec = rng.pick([1, 2, 25, 3, 4, 5, 6, 75, 7, 8, 9, 15, 35, 45, 55, 65, 85, 95].filter((d) => (d < 10 ? d * 6 : (d * 60) / 100) % 1 === 0));
      const hd = H + (dec < 10 ? dec / 10 : dec / 100), mi = Math.round((hd - H) * 60);
      const mm = rng.pick([15, 30, 45, 12, 6, 24, 36, 48, 54, 18]), H2 = rng.int(1, 4);
      const back = H2 + mm / 60;
      return { title: 'Heures décimales, heures et minutes.', steps: [
        step(`a) ${m(`${dx(hd)}${U('h')}`)} = ? h ? min`, [exactF('', q(H), 'h'), exactF('', q(mi), 'min')], 'Multiplie la partie décimale par 60.', [{ on: 'num', field: 1, value: q(Math.round((hd - H) * 100)), msg: 'Une heure compte 60 minutes, pas 100.' }]),
        step(`b) ${m(`${H2}${U('h')}\\,${mm}${U('min')}`)} en heures décimales ?`, [exactF('', qd(back), 'h')], `${m(`${mm}${U('min')} = \\dfrac{${mm}}{60}${U('h')}`)}.`, mist(qd(back), [[qd(H2 + mm / 100), `${mm} min, ce n’est pas ${m(`0{,}${mm}`)} h : divise par 60.`]])),
      ], solution: [`${m(`0{,}${String(dec)} \\times 60 = ${mi}`)} : ${m(`${dx(hd)}${U('h')} = ${H}${U('h')}\\,${mi}${U('min')}`)}.`, `${m(`\\dfrac{${mm}}{60} = ${dx(mm / 60)}`)} : ${m(`${H2}${U('h')}\\,${mm}${U('min')} = ${dx(back)}${U('h')}`)}.`], answer: `${H} h ${mi} min ; ${m(`${dx(back)}${U('h')}`)}`, key: `${hd}:${H2}:${mm}`, data: { kind: 'js', items: [{ what: 'h', js: `Math.floor(${hd})`, expect: H }, { what: 'mi', js: `Math.round((${hd}-${H})*60)`, expect: mi }, { what: 'b', js: `${H2}+${mm}/60`, expect: back, tol: 1e-9 }] } };
    }
    const sh = rng.int(6, 21), sm = rng.int(0, 11) * 5, dh = rng.int(0, 3), dm = rng.int(1, 11) * 5;
    let eh = sh + dh, em = sm + dm; if (em >= 60) { em -= 60; eh += 1; } eh %= 24;
    const evt = rng.pick(['Un film commence', 'Un train part', 'Un match commence', 'Une randonnée commence']);
    const askEnd = rng.chance(0.5);
    const hm = (h: number, mn: number) => `${h}${U('h')}\\,${String(mn).padStart(2, '0')}`;
    return { title: 'Horaires et durées.', statement: askEnd ? `${evt} à ${m(hm(sh, sm))} et dure ${m(`${dh}${U('h')}\\,${dm}${U('min')}`)}.` : `${evt} à ${m(hm(sh, sm))} et se termine à ${m(hm(eh, em))}.`, steps: [askEnd ? step('À quelle heure se termine-t-il ?', [exactF('', q(eh), 'h'), exactF('', q(em), 'min')], 'Ajoute les heures, puis les minutes ; 60 min = 1 h.', sm + dm >= 60 ? [{ on: 'numAll', values: [q((sh + dh) % 24), q(sm + dm)], msg: `${sm + dm} min dépasse 60 : convertis en heures et minutes.` }] : []) : step('Quelle est la durée ?', [exactF('', q(dh), 'h'), exactF('', q(dm), 'min')], 'Compte jusqu’à l’heure pile, puis le reste.', [...(em < sm ? [{ on: 'numAll' as const, values: [q(eh - sh), q(sm - em)], msg: 'On ne soustrait pas les minutes directement quand elles « ne passent pas » : compte jusqu’à l’heure pile.' }] : [])])], solution: [askEnd ? `${m(`${hm(sh, sm)} + ${dh}${U('h')}\\,${dm}${U('min')} = ${sh + dh}${U('h')}\\,${sm + dm}${U('min')}`)}${sm + dm >= 60 ? `, soit ${m(hm(eh, em))}` : ''}.` : `De ${m(hm(sh, sm))} à ${m(hm(eh, em))} : ${m(`${dh}${U('h')}\\,${dm}${U('min')}`)}.`], answer: askEnd ? m(hm(eh, em)) : m(`${dh}${U('h')}\\,${dm}${U('min')}`), key: `${askEnd}:${sh}:${sm}:${dh}:${dm}`, data: { kind: 'js', items: [{ what: 'h', js: askEnd ? `(${sh}+${dh}+Math.floor((${sm}+${dm})/60))%24` : String(dh), expect: askEnd ? eh : dh }, { what: 'm', js: askEnd ? `(${sm}+${dm})%60` : String(dm), expect: askEnd ? em : dm }] } };
  },
};

// ===================================================================== grandeurs composées
export const composees: Generator = {
  id: 'composees', title: 'Débit, masse volumique, énergie', stars: 2, levels: [2], course: LINKS.s62,
  desc: 'Débit = volume ÷ durée ; masse = masse volumique × volume ; énergie = puissance × durée, en unités compatibles.',
  example: '\\dfrac{1\\,200}{40} = 30\\,\\mathrm{min}',
  generate(rng: Rng) {
    const kind = rng.pick(['debit', 'masse', 'energie'] as const);
    if (kind === 'debit') {
      const d = rng.pick([10, 12, 15, 20, 25, 30, 40, 50, 60]), t = rng.int(5, 60), V = d * t;
      const inM3 = V % 1000 === 0 || V % 100 === 0;
      const [L, l, h] = [rng.pick([40, 50, 60, 80, 100]), rng.pick([20, 25, 30, 40]), rng.pick([20, 25, 30, 40, 50])];
      const Vaq = (L * l * h) / 1000, aq = rng.chance(0.4) && Number.isInteger(Vaq / d * 10);
      if (aq) return { title: 'Remplir l’aquarium.', statement: `Un aquarium a la forme d’un pavé de ${m(`${L}${U('cm')}`)} sur ${m(`${l}${U('cm')}`)} sur ${m(`${h}${U('cm')}`)}. On le remplit avec un robinet de débit ${m(`${d}${U('L')}/\\mathrm{min}`)}.`, steps: [step('a) Volume en litres ?', [exactF('', qd(Vaq), 'L')], '1 L = 1 000 cm³.', mist(qd(Vaq), [[q(L * l * h), 'Convertis les cm³ en L.']])), step('b) Durée du remplissage ?', [exactF('', qd(Vaq / d), 'min')], 'Durée = volume ÷ débit.', mist(qd(Vaq / d), [[qd(Vaq * d), 'On divise le volume par le débit.']]))], solution: [`${m(`${L} \\times ${l} \\times ${h} = ${dx(L * l * h)}${U('cm³')} = ${dx(Vaq)}${U('L')}`)}.`, `${m(`${dx(Vaq)} \\div ${d} = ${dx(Vaq / d)}${U('min')}`)}.`], answer: m(`${dx(Vaq / d)}${U('min')}`), key: `aq:${L}:${l}:${h}:${d}`, data: { kind: 'js', items: [{ what: 'V', js: `${L}*${l}*${h}/1000`, expect: Vaq, tol: 1e-9 }, { what: 't', js: `${L}*${l}*${h}/1000/${d}`, expect: Vaq / d, tol: 1e-9 }] } };
      return { title: 'Vider la cuve.', statement: `Une cuve de ${inM3 ? m(`${dx(V / 1000)}${U('m³')}`) : m(`${dx(V)}${U('L')}`)} est vidée par une pompe de débit ${m(`${d}${U('L')}/\\mathrm{min}`)}.`, steps: [step('Combien de temps faut-il ?', [exactF('', q(t), 'min')], `Durée = volume ÷ débit${inM3 ? ' ; convertis d’abord en litres (1 m³ = 1 000 L)' : ''}.`, mist(q(t), [[inM3 ? qd(V / 1000 / d) : null, 'Convertis les m³ en litres d’abord.'], [q(V * d), 'On divise le volume par le débit.']]))], solution: [`${inM3 ? `${m(`${dx(V / 1000)}${U('m³')} = ${dx(V)}${U('L')}`)}. ` : ''}${m(`${dx(V)} \\div ${d} = ${t}${U('min')}`)}.`], answer: m(`${t}${U('min')}`), key: `d:${V}:${d}:${inM3}`, data: { kind: 'js', items: [{ what: 't', js: `${V}/${d}`, expect: t }] } };
    }
    if (kind === 'masse') {
      const [mat, rho] = rng.pick([['aluminium', 2.7], ['fer', 7.8], ['cuivre', 8.9], ['bois de chêne', 0.7], ['verre', 2.5], ['or', 19.3]] as [string, number][]);
      const a = rng.int(2, 12), b = rng.int(2, 10), c = rng.int(1, 6), V = a * b * c, M = Math.round(rho * V * 1000) / 1000;
      return { title: `Le bloc de ${mat}.`, statement: `Le ${mat} a une masse volumique de ${m(`${dx(rho)}${U('g')}/\\mathrm{cm}^3`)}. Un bloc de ${mat} est un pavé de ${m(`${a}${U('cm')}`)} sur ${m(`${b}${U('cm')}`)} sur ${m(`${c}${U('cm')}`)}.`, steps: [step('a) Volume du bloc ?', [exactF('', q(V), 'cm³')], 'L × ℓ × h.'), step('b) Masse du bloc ?', [exactF('', qd(M), 'g')], 'Masse = masse volumique × volume.', mist(qd(M), [[qd(Math.round((V / rho) * 1000) / 1000), 'On multiplie (g par cm³ × cm³ = g), on ne divise pas.']]))], solution: [`${m(`V = ${a} \\times ${b} \\times ${c} = ${V}${U('cm³')}`)}.`, `${m(`${V} \\times ${dx(rho)} = ${dx(M)}${U('g')}`)}.`], answer: m(`${dx(M)}${U('g')}`), key: `m:${mat}:${a}:${b}:${c}`, data: { kind: 'js', items: [{ what: 'V', js: `${a}*${b}*${c}`, expect: V }, { what: 'M', js: `${rho}*${V}`, expect: M, tol: 1e-6 }] } };
    }
    const W = rng.pick([500, 750, 1000, 1200, 1500, 2000, 2500]), hpd = rng.pick([2, 3, 4, 5, 6, 8]), days = rng.pick([7, 10, 15, 20, 30]), price = rng.pick([0.2, 0.25, 0.18, 0.22]);
    const E = (W / 1000) * hpd * days, C = Math.round(E * price * 100) / 100;
    return { title: 'Le radiateur.', statement: `Un radiateur de ${m(`${dx(W)}${U('W')}`)} fonctionne ${m(`${hpd}${U('h')}`)} par jour pendant ${days} jours. Le kWh coûte ${m(dx(price))} €.`, steps: [step('a) Énergie consommée ?', [exactF('', qd(E), 'kWh')], `${dx(W)} W = ${dx(W / 1000)} kW ; énergie = puissance × durée.`, mist(qd(E), [[qd(W * hpd * days), 'Convertis les W en kW.'], [qd((W / 1000) * hpd), `Il y a ${days} jours.`]])), step('b) Coût, au centime ?', [{ ...exactF('', qd(C), '€'), approx: { value: E * price, tol: 0.005001, dp: 2 } }], 'Énergie × prix du kWh.')], solution: [`${m(`${dx(W)}${U('W')} = ${dx(W / 1000)}${U('kW')}`)} ; durée ${m(`${hpd} \\times ${days} = ${hpd * days}${U('h')}`)} ; ${m(`E = ${dx(W / 1000)} \\times ${hpd * days} = ${dx(E)}${U('kWh')}`)}.`, `Coût : ${m(`${dx(E)} \\times ${dx(price)} \\approx ${ax(E * price, 2)}`)} €.`], answer: `${m(`${dx(E)}${U('kWh')}`)} ; ${m(ax(E * price, 2))} €`, key: `e:${W}:${hpd}:${days}:${price}`, data: { kind: 'js', items: [{ what: 'E', js: `${W}/1000*${hpd}*${days}`, expect: E, tol: 1e-9 }, { what: 'C', js: `${E}*${price}`, expect: E * price, tol: 0.006 }] } };
  },
};

// ===================================================================== erreur
const ER = { aire: 'Il a multiplié par 10 au lieu de 100 (unités d’aire).', vol: 'Il a pris 1 m³ = 100 L au lieu de 1 000 L.', haut: 'Il a pris un côté oblique pour la hauteur.', diam: 'Il a utilisé le diamètre à la place du rayon.', duree: 'Il a écrit les minutes comme des centièmes d’heure.' } as const;
export const erreur: Generator = {
  id: 'erreur', title: 'Trouver l’erreur', stars: 2, levels: [2], course: LINKS.s13, links: [LINKS.s33, LINKS.s61],
  desc: 'Conversions d’aires et de volumes, hauteur oblique, rayon/diamètre, durées décimales.',
  example: '2\\,\\mathrm{m}^2 \\neq 20\\,\\mathrm{dm}^2',
  generate(rng: Rng) {
    const kind = rng.pick(Object.keys(ER) as (keyof typeof ER)[]);
    const who = rng.pick(NAMES.filter((n) => !['Léa', 'Inès', 'Lina', 'Jade', 'Chloé', 'Emma', 'Zoé', 'Nina'].includes(n)));
    let quote = '', fix: Step, sol = '', items: Item[] = [], key = '';
    if (kind === 'aire') { const v = rng.int(2, 95) / (rng.chance(0.5) ? 10 : 1), [a, b] = rng.pick([['m', 'dm'], ['dm', 'cm'], ['cm', 'mm']]); quote = `« ${m(`${dx(v)}${U(a + '²')} = ${dx(v * 10)}${U(b + '²')}`)}, car ${m(`1${U(a)} = 10${U(b)}`)}. »`; fix = step(`Corrige : ${m(`${dx(v)}${U(a + '²')} = \\ldots${U(b + '²')}`)}`, [exactF('', qd(v * 100), `${b}²`)], 'Un carré de côté 1 contient 10 rangées de 10 petits carrés.', mist(qd(v * 100), [[qd(v * 10), 'C’est l’erreur.']])); sol = `${m(`1${U(a + '²')} = 100${U(b + '²')}`)}, donc ${m(`${dx(v)}${U(a + '²')} = ${dx(v * 100)}${U(b + '²')}`)}.`; items = [{ what: 'v', js: `${v}*100`, expect: v * 100, tol: 1e-9 }]; key = `${v}${a}`; }
    else if (kind === 'vol') { const v = rng.int(2, 90); quote = `« Une piscine de ${m(`${v}${U('m³')}`)} contient ${m(`${dx(v * 100)}${U('L')}`)}, car ${m(`1${U('m³')} = 100${U('L')}`)}. »`; fix = step('Combien de litres en réalité ?', [exactF('', q(v * 1000), 'L')], '1 m³ = 1 000 dm³ = 1 000 L.', mist(q(v * 1000), [[q(v * 100), 'C’est l’erreur.']])); sol = `${m(`1${U('m³')} = 1\\,000${U('dm³')} = 1\\,000${U('L')}`)} : ${m(`${dx(v * 1000)}${U('L')}`)}.`; items = [{ what: 'v', js: `${v}*1000`, expect: v * 1000 }]; key = `${v}`; }
    else if (kind === 'haut') { const b = rng.int(5, 14), h = rng.int(3, 9) + 0.5 * rng.int(0, 1), o = Math.round(Math.hypot(rng.int(1, 3), h) * 10) / 10 + 0.5; quote = `Un triangle a une base de ${m(`${b}${U('cm')}`)}, une hauteur associée de ${m(`${dx(h)}${U('cm')}`)} et un côté oblique de ${m(`${dx(o)}${U('cm')}`)}. « ${m(`\\mathcal{A} = \\dfrac{${b} \\times ${dx(o)}}{2} = ${dx((b * o) / 2)}${U('cm²')}`)} »`; fix = step('Aire correcte ?', [exactF('', qd((b * h) / 2), 'cm²')], 'La hauteur est perpendiculaire à la base.', mist(qd((b * h) / 2), [[qd((b * o) / 2), 'C’est l’erreur.']])); sol = `${m(`\\mathcal{A} = \\dfrac{${b} \\times ${dx(h)}}{2} = ${dx((b * h) / 2)}${U('cm²')}`)}.`; items = [{ what: 'A', js: `${b}*${h}/2`, expect: (b * h) / 2, tol: 1e-9 }]; key = `${b}:${h}:${o}`; }
    else if (kind === 'diam') { let D: number, h: number; do { D = rng.int(2, 12) * 2; h = rng.int(3, 15); } while (((D / 2) ** 2 * h) % 3); const r = D / 2; quote = `Pour un cône de **diamètre** ${m(`${D}${U('cm')}`)} et de hauteur ${m(`${h}${U('cm')}`)} : « ${m(`V = \\dfrac{\\pi \\times ${D}^2 \\times ${h}}{3}`)} = ${m(`${(D * D * h) / 3}\\pi${U('cm³')}`)} »`; fix = step('Valeur exacte correcte : nombre devant π ?', [exactF(m('V ='), q((r * r * h) / 3), 'π cm³')], `Le rayon vaut ${r} cm.`, mist(q((r * r * h) / 3), [[q((D * D * h) / 3), 'C’est l’erreur (4 fois trop).']])); sol = `${m(`R = ${r}`)} : ${m(`V = \\dfrac{\\pi \\times ${r}^2 \\times ${h}}{3} = ${(r * r * h) / 3}\\pi${U('cm³')}`)} — 4 fois moins, car ${m(`${D}^2 = 4 \\times ${r}^2`)}.`; items = [{ what: 'k', js: `(${D}/2)**2*${h}/3`, expect: (r * r * h) / 3 }]; key = `${D}:${h}`; }
    else { const H = rng.int(1, 4), mm = rng.pick([10, 15, 20, 40, 45, 50]); quote = `« ${m(`${H}${U('h')}\\,${mm}${U('min')} = ${H}{,}${mm}${U('h')}`)} »`; fix = step(`Convertis correctement ${m(`${H}${U('h')}\\,${mm}${U('min')}`)} en heures décimales (au centième).`, [mm % 3 === 0 || mm === 10 || mm === 20 || mm === 40 || mm === 50 ? approxF('', H + mm / 60, 2, 'h') : exactF('', qd(H + mm / 60), 'h')], `${mm} min = ${mm}/60 h.`, mist(q(Math.round((H + mm / 60) * 100), 100), [[qd(H + mm / 100), 'C’est l’erreur.']])); sol = `${m(`\\dfrac{${mm}}{60}${U('h')} \\approx ${ax(mm / 60, 2)}${U('h')}`)}, donc ${m(`${H}${U('h')}\\,${mm}${U('min')} \\approx ${ax(H + mm / 60, 2)}${U('h')}`)}.`; items = [{ what: 'v', js: `${H}+${mm}/60`, expect: H + mm / 60, tol: 1e-9 }]; key = `${H}:${mm}`; }
    const steps: Step[] = [{ prompt: 'Quelle est l’erreur ?', answer: shuffledChoice(rng, ER[kind], rng.shuffle((Object.keys(ER) as (keyof typeof ER)[]).filter((k) => k !== kind)).slice(0, 3).map((k) => [ER[k], 'Non : relis son calcul.'] as [Rich, Rich])), hint: 'Refais le calcul toi-même.' }, fix!];
    void fixedChoice; void sub;
    return { title: 'Trouve l’erreur.', statement: `${who} écrit : ${quote}`, steps, solution: [ER[kind], sol], answer: ER[kind], key: `${kind}:${key}`, data: { kind: 'js', items } };
  },
};
