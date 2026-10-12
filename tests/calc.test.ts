/**
 * Tests unitaires du moteur de la calculatrice (src/practice/calc/engine.ts).
 * Usage : npx tsx tests/calc.test.ts
 */
import { calc, pretty, format, insertText, type Val } from '../src/practice/calc/engine';

let pass = 0, fail = 0;
const ok = (cond: unknown, msg: string, extra: unknown = '') => {
  if (cond) pass++;
  else { fail++; console.log('  ✗', msg, extra === '' ? '' : JSON.stringify(extra)); }
};
const nb = (s: string) => s.replace(/\u202f/g, ' ');
/** [saisie, affichage attendu (≈ si arrondi)] */
const R = (src: string, want: string, ans: Val | null = null) => {
  const r = calc(src, ans);
  const got = r.ok ? `${r.shown.approx ? '≈ ' : ''}${nb(r.shown.text)}` : `ERR`;
  ok(got === want, `« ${src} » = ${want}`, r.ok ? got : r.error);
};
const E = (src: string, re: RegExp, ans: Val | null = null) => {
  const r = calc(src, ans);
  ok(!r.ok && re.test(r.error), `« ${src} » : erreur ${re}`, r.ok ? r.shown.text : r.error);
};
const P = (src: string, want: string) => ok(nb(pretty(src)) === want, `écriture de « ${src} » : ${want}`, nb(pretty(src)));
const val = (src: string, ans: Val | null = null): Val => { const r = calc(src, ans); if (!r.ok) throw new Error(r.error); return r.value; };

console.log('Exemple de Nguhma');
R('12² − 6²', '108'); R('12^2-6^2', '108'); R('√(108)', '≈ 10,39230485'); R('√108', '≈ 10,39230485');
R('sqrt(108)', '≈ 10,39230485'); R('racine(108)', '≈ 10,39230485'); R('SQRT(108)', '≈ 10,39230485');

console.log('Priorités');
R('2+3×4', '14'); R('(2+3)×4', '20'); R('2+3*4', '14'); R('10−4−3', '3'); R('100÷10÷5', '2'); R('100/10/5', '2');
R('2×3²', '18'); R('(2×3)²', '36'); R('2^3^2', '512'); R('(2^3)^2', '64'); R('1+2×3−4÷2', '5'); R('7:2', '3,5');
R('[2+3]×2', '10'); R('2·5', '10'); R('3 x 4', '12');

console.log('Moins unaire et carrés');
R('-3²', '−9'); R('−3²', '−9'); R('(−3)²', '9'); R('(-3)^2', '9'); R('-3^2', '−9'); R('−2³', '−8'); R('(−2)³', '−8');
R('5−−3', '8'); R('5+−3', '2'); R('−(4−9)', '5'); R('2×−3', '−6'); R('--4', '4'); R('2^-1', '0,5'); R('2^−2', '0,25'); R('10^-3', '0,001');
R('5²+12²', '169'); R('3³', '27'); R('2⁴', '16'); R('10⁻²', '0,01');

console.log('Racines');
R('√(9+16)', '5'); R('√9+16', '19'); R('√(2)', '≈ 1,414213562'); R('√2²', '2'); R('(√2)²', '2'); R('√(0,25)', '0,5');
R('√(1/4)', '0,5'); R('√0', '0'); R('3√4', '6'); R('√(144)−√(25)', '7'); R('√(13²−5²)', '12'); R('√(7,5²−4,5²)', '6');
E('√(−4)', /négatif/); E('√-4', /négatif/); E('√(3−5)', /négatif/); E('sqrt(-1)', /négatif/);

console.log('Multiplication implicite, π');
R('2√3', '≈ 3,464101615'); R('2(3+4)', '14'); R('(1+2)(3+4)', '21'); R('2π', '≈ 6,283185307'); R('π', '≈ 3,141592654');
R('π×3²', '≈ 28,27433388'); R('2π×5', '≈ 31,41592654'); R('pi', '≈ 3,141592654'); R('3(2)²', '12');

console.log('Virgules, points, nombres');
R('0,1+0,2', '0,3'); R('0.1+0.2', '0,3'); R('1,5×4', '6'); R('2,5+2.5', '5'); R(',5+1', '1,5'); R('1 000 × 3', '3 000');
R('0,3−0,1', '0,2'); R('1,1×1,1', '1,21'); R('3,10', '3,1'); R('100 000 × 100 000', '10 000 000 000');
R('1/3', '≈ 0,3333333333'); R('2/3', '≈ 0,6666666667'); R('10/4', '2,5'); R('1/8', '0,125'); R('22/7', '≈ 3,142857143');
R('123456789×987654321', '121 932 631 112 635 269'); R('2^60', '1 152 921 504 606 846 976'); R('2^100', '≈ 1,2676506 × 10³⁰'); R('1/3×10^-20', '≈ 3,333333333 × 10⁻²¹');
R('0,000000000001×2', '0,000000000002'); R('1/7×7', '1'); R('0,1×3', '0,3');

console.log('Trigonométrie (degrés)');
R('sin(30)', '0,5'); R('cos(60)', '0,5'); R('tan(45)', '1'); R('sin 90', '1'); R('cos(90)', '0'); R('cos(180)', '−1');
R('sin(37)', '≈ 0,6018150232'); R('cos(35)', '≈ 0,8191520443'); R('tan(20)', '≈ 0,3639702343'); R('5×cos(40)', '≈ 3,830222216');
R('asin(0,5)', '30'); R('acos(0.5)', '60'); R('atan(1)', '45'); R('arccos(0,3)', '≈ 72,54239688'); R('cos⁻¹(3/5)', '≈ 53,13010235');
R('sin⁻¹(1)', '90'); R('tan⁻¹(2)', '≈ 63,43494882'); R('8/tan(35)', '≈ 11,42518405');
E('tan(90)', /n’existe pas/); E('asin(2)', /entre −1 et 1/); E('acos(-1,5)', /entre −1 et 1/);

console.log('Ans et départ par un opérateur');
const a108 = val('12²−6²');
R('√(Ans)', '≈ 10,39230485', a108); R('√Ans', '≈ 10,39230485', a108); R('Ans÷2', '54', a108); R('×2', '216', a108); R('÷4', '27', a108);
R('+2', '110', a108); R('²', '11 664', a108); R('-8', '−8', a108); R('2Ans', '216', a108); R('ans+1', '109', a108);
E('Ans+1', /Ans/); E('×2', /manque un nombre/);

console.log('Erreurs');
E('1/0', /zéro/); E('5÷(2−2)', /zéro/); E('(2+3', /Parenthèse manquante/); E('√(108', /Parenthèse manquante/); E('2+3)', /en trop/);
E('2+', /incomplet/); E('×3', /manque un nombre/); E('()', /vides/); E('2$3', /inconnu/); E('', /Rien/); E('0^-1', /zéro/);
E('(−8)^0,5', /négatif/); E('2^', /Exposant manquant/); E('abc', /inconnu/); E('²', /manque un nombre/);

console.log('Flottants et précision');
R('0,1+0,7', '0,8'); R('1,15×100', '115'); R('4,35×100', '435'); R('3×1,1', '3,3'); R('1−0,9', '0,1'); R('0,57×100', '57');
R('√2×√2', '2'); R('(1/3)×3', '1'); R('10^15', '1 000 000 000 000 000'); R('2^0,5', '≈ 1,414213562'); R('9^0,5', '3');
ok(format({ q: [7n, 1n] }).text === '7' && !format({ q: [7n, 1n] }).approx, 'entier exact sans ≈');

console.log('Écriture jolie');
P('12^2-6^2', '12² − 6²'); P('sqrt(108)', '√(108)'); P('racine(108)', '√(108)'); P('2*3/4', '2 × 3 ÷ 4'); P('-3^2', '−3²');
P('2^-1', '2⁻¹'); P('10^12', '10¹²'); P('2^3^2', '2^3²'); P('3.5+1', '3,5 + 1'); P('asin(0.5)', 'sin⁻¹(0,5)'); P('5*cos(40)', '5 × cos(40)');
P('1000000', '1 000 000'); P('2x3', '2 × 3');

console.log('Insérer dans une case');
{
  const I = (src: string, o: Parameters<typeof insertText>[1], want: string, warn = false) => { const r = insertText(val(src), o); ok(r.text === want && !!r.warn === warn, `insérer « ${src} » ${JSON.stringify(o)} → ${want}${warn ? ' (avertissement)' : ''}`, r); };
  I('√108', { dp: 2 }, '10,39'); I('√108', { dp: 1 }, '10,4'); I('√108', {}, '10,39230485', true); I('12²−6²', {}, '108'); I('10/4', {}, '2,5');
  I('10/4', { form: 'irreducible' }, '5/2'); I('10/4', { form: 'irreducible', decimalOk: true }, '2,5'); I('1/3', {}, '1/3'); I('1/3', { form: 'decimal' }, '0,3333333333', true);
  I('−7,5', {}, '-7,5'); I('1000×3', {}, '3000'); I('π×4', { dp: 0 }, '13'); I('sin(30)', { dp: 3 }, '0,500'); I('-0,001', { dp: 2 }, '0,00');
}
console.log('Types sans calculatrice');
{
  const { NO_CALC } = await import('../src/practice/calc/policy');
  const { readdirSync } = await import('node:fs');
  const dirs = readdirSync(new URL('../src/practice', import.meta.url)).filter((d) => /^ch\d\d$/.test(d));
  const all = new Map<string, string[]>();
  for (const d of dirs) { const c = (await import(`../src/practice/${d}/index.ts`)).default; all.set(c.slug, c.generators.map((g: { id: string }) => g.id)); }
  for (const [slug, ids] of Object.entries(NO_CALC)) for (const id of ids) ok(all.get(slug)?.includes(id), `type sans calculatrice existant : ${slug} / ${id}`);
  const n = [...all.values()].reduce((s, v) => s + v.length, 0), off = Object.values(NO_CALC).flat().length;
  ok(n === 167, `167 types passés en revue (${n})`); console.log(`  ${off} types sans calculatrice, ${n - off} avec`);
}
console.log(`${pass} réussis, ${fail} échoués`);
if (fail) process.exit(1);
