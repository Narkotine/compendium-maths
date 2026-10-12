/** Outils du chapitre 08 (fonctions) : écriture de ax + b, repère signé, liens. */
import type { CourseLink } from '../engine/types';
import { q, add, mul, sub, div, neg, eq, toNum, isInt, type Q } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, line, text, dot, pline, type Pt } from '../engine/svg';

export const CH = '08-fonctions';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Image et antécédent'),
  s12: sec('s1-2', '§ 1.2 · Image et antécédents par le calcul'),
  s21: sec('s2-1', '§ 2.1 · Construire une courbe'),
  s22: sec('s2-2', '§ 2.2 · Lecture graphique'),
  s31: sec('s3-1', '§ 3.1 · Fonctions linéaires'),
  s33: sec('s3-3', '§ 3.3 · Trouver le coefficient'),
  s42: sec('s4-2', '§ 4.2 · Rôle de a et de b'),
  s44: sec('s4-4', '§ 4.4 · Retrouver a et b'),
  s5: sec('s5', '§ 5 · Modéliser et comparer'),
  serieF: sec('serie-F', 'Série F · Trouver l’erreur'),
};
export const m = (s: string) => `$${s}$`;
export const dq = (v: Q) => texQ(v, isDec(v) ? 'dec' : 'frac');
const isDec = (v: Q) => { let d = v.d; for (const p of [2, 5]) while (d % p === 0) d /= p; return d === 1; };
/** Nombre entre parenthèses s'il est négatif. */
export const pq = (v: Q) => (v.n < 0 ? `(${dq(v)})` : dq(v));
/** TeX de a·x + b (variable v). */
export function affTex(a: Q, b: Q, v = 'x'): string {
  let s = '';
  if (a.n !== 0) s = eq(a, q(1)) ? v : eq(a, q(-1)) ? `-${v}` : `${dq(a)}${v}`;
  if (b.n !== 0 || !s) s += s ? (b.n < 0 ? ` - ${dq(neg(b))}` : ` + ${dq(b)}`) : dq(b);
  return s;
}
/** TeX de a x² + b x + c. */
export function quadTex(a: Q, b: Q, c: Q): string {
  let s = eq(a, q(1)) ? 'x^2' : eq(a, q(-1)) ? '-x^2' : `${dq(a)}x^2`;
  if (b.n) s += b.n < 0 ? ` - ${eq(b, q(-1)) ? '' : dq(neg(b))}x` : ` + ${eq(b, q(1)) ? '' : dq(b)}x`;
  if (c.n) s += c.n < 0 ? ` - ${dq(neg(c))}` : ` + ${dq(c)}`;
  return s;
}
export const js = (v: Q) => `(${v.n}/${v.d})`;
/** Repère signé avec quadrillage unité ; courbes (fonctions échantillonnées) et points. */
export function repere(o: { x: [number, number]; y: [number, number]; ys?: number; curves: { f: (x: number) => number; from?: number; to?: number; cls?: string; label?: string; at?: number }[]; pts?: { p: [number, number]; label?: string }[]; aria: string }): string {
  const [x0, x1] = o.x, [y0, y1] = o.y, ys = o.ys ?? 1;
  const W = 340, H = Math.min(340, Math.max(220, Math.round(((y1 - y0) / ys / (x1 - x0)) * 300) + 40));
  const L = 26, R = 14, T = 14, B = 22;
  const X = (x: number) => L + ((x - x0) / (x1 - x0)) * (W - L - R), Y = (y: number) => T + ((y1 - y) / (y1 - y0)) * (H - T - B);
  let b = '';
  for (let x = x0; x <= x1; x++) b += line([X(x), Y(y0)], [X(x), Y(y1)], 'gf-grid');
  for (let y = y0; y <= y1 + 1e-9; y += ys) b += line([X(x0), Y(y)], [X(x1), Y(y)], 'gf-grid');
  b += line([X(x0), Y(0)], [X(x1) + 6, Y(0)], 'gf-axis') + line([X(0), Y(y0)], [X(0), Y(y1) - 6], 'gf-axis');
  const every = x1 - x0 > 12 ? 2 : 1;
  for (let x = x0; x <= x1; x++) if (x !== 0 && x % every === 0) b += text([X(x), Y(0) + 13], String(x).replace('-', '−'), 'gf-ts');
  const ev = (y1 - y0) / ys > 12 ? 2 : 1;
  for (let y = y0, i = 0; y <= y1 + 1e-9; y += ys, i++) if (Math.abs(y) > 1e-9 && Math.round(y / ys) % ev === 0) b += text([X(0) - 5, Y(y) + 4], String(Math.round(y * 100) / 100).replace('.', ',').replace('-', '−'), 'gf-ts', 'end');
  b += text([X(0) - 6, Y(0) + 13], '0', 'gf-ts', 'end');
  for (const c of o.curves) {
    const ps: Pt[] = [];
    const a = c.from ?? x0, z = c.to ?? x1;
    for (let i = 0; i <= 160; i++) { const x = a + ((z - a) * i) / 160, y = c.f(x); if (y >= y0 - 0.5 && y <= y1 + 0.5) ps.push([X(x), Y(Math.max(y0 - 0.3, Math.min(y1 + 0.3, y)))]); }
    b += pline(ps, c.cls ?? 'gf-curve');
    if (c.label) {
      let xl = c.at ?? z - 0.6;
      if (c.at === undefined) for (let t = z - 0.6; t > a; t -= 0.25) { const yt = c.f(t); if (yt > y0 + 0.4 && yt < y1 - 0.6) { xl = t; break; } }
      const yl = c.f(xl); if (yl > y0 && yl < y1) b += text([X(xl) + 10, Y(yl) - 6], c.label, 'gf-tq', 'start');
    }
  }
  for (const p of o.pts ?? []) { b += dot([X(p.p[0]), Y(p.p[1])], 3.5); if (p.label) b += text([X(p.p[0]) + 7, Y(p.p[1]) - 7], p.label, 'gf-t', 'start'); }
  return svgWrap(W, H, o.aria, b);
}
export { q, add, mul, sub, div, neg, eq, toNum, isInt, type Q };
