/** Outils du chapitre 14 : unités, formatage décimal exact, figures planes à l'échelle. */
import type { CourseLink, NumField, Rich } from '../engine/types';
import { q, toNum, type Q } from '../engine/q';
import { texQ } from '../engine/expr';
import { svgWrap, line, poly, text, fit, rightMark, type Pt } from '../engine/svg';

export const CH = '14-aires-volumes-grandeurs';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s12: sec('s1-2', '§ 1.2 · Longueurs'), s13: sec('s1-3', '§ 1.3 · Aires'), s14: sec('s1-4', '§ 1.4 · Volumes et capacités'),
  s2: sec('s2', '§ 2 · Périmètres'), s31: sec('s3-1', '§ 3.1 · Formulaire des aires'), s33: sec('s3-3', '§ 3.3 · La hauteur'), s34: sec('s3-4', '§ 3.4 · Figures composées'),
  s41: sec('s4-1', '§ 4.1 · Prisme, cylindre'), s42: sec('s4-2', '§ 4.2 · Pyramide et cône'), s43: sec('s4-3', '§ 4.3 · Boule et sphère'), s44: sec('s4-4', '§ 4.4 · Aire latérale'),
  s5: sec('s5', '§ 5 · k, k², k³'), s61: sec('s6-1', '§ 6.1 · Durées'), s62: sec('s6-2', '§ 6.2 · Grandeurs composées'),
};
export const m = (s: string) => `$${s}$`;
/** Décimal exact (Q) en TeX avec espaces de milliers. */
const grp = (s: string) => s.replace(/^(-?)(\d+)/, (_, sg, d) => sg + (d.length >= 5 ? d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : d));
export const dn = (v: Q) => grp(texQ(v, 'dec'));
export const dx = (v: number) => grp(texQ(qd(v), 'dec'));
/** Décimal JS → Q exact (6 décimales max). */
export const qd = (v: number): Q => q(Math.round(v * 1e6), 1e6);
export const U = (u: string) => { const t = u.match(/^(.*?)([²³])?$/)!; return `\\,\\mathrm{${t[1]}}${t[2] ? `^${t[2] === '²' ? 2 : 3}` : ''}`; };
export const ax = (v: number, dp: number) => v.toFixed(dp).replace('.', '{,}');
export const safe = (v: number, dp: number) => { const f = Math.abs(v * 10 ** dp) % 1; return Math.abs(f - 0.5) > 0.06; };
export const approxF = (label: Rich, v: number, dp: number, unit?: string): NumField => ({ label, unit, expect: q(Math.round(v * 10 ** dp), 10 ** dp), form: 'any', approx: { value: v, tol: 0.5 * 10 ** -dp, dp }, shown: ax(v, dp) });
export const exactF = (label: Rich, v: Q, unit?: string): NumField => ({ label, unit, expect: v, form: 'any' });

/** Polygone à l'échelle avec cotes ; segments en pointillés (hauteurs) ; angle droit. */
export function shapeSvg(o: { pts: Pt[]; dims: { a: Pt; b: Pt; t: string; side?: 1 | -1 }[]; dash?: [Pt, Pt][]; right?: [Pt, Pt, Pt][]; arcs?: { c: Pt; r: number; from: number; to: number }[]; aria: string }): string {
  const all = [...o.pts, ...(o.dash ?? []).flat(), ...(o.arcs ?? []).flatMap((a) => [[a.c[0] - a.r, a.c[1] - a.r], [a.c[0] + a.r, a.c[1] + a.r]] as Pt[])];
  const W = 340, H = 220;
  const { pts: P, k } = fit(all, W, H, 34);
  const n = o.pts.length, nd = (o.dash ?? []).length * 2;
  const T = (p: Pt): Pt => { const [x0, y0] = all[0], [X0, Y0] = P[0]; return [X0 + (p[0] - x0) * k, Y0 - (p[1] - y0) * k]; };
  let b = o.pts.length > 1 ? poly(P.slice(0, n)) : '';
  for (let i = 0; i < (o.dash ?? []).length; i++) b += line(P[n + 2 * i], P[n + 2 * i + 1], 'gf-dash');
  void nd;
  for (const a of o.arcs ?? []) {
    const c = T(a.c), r = a.r * k, s: Pt = [c[0] + r * Math.cos(a.from), c[1] - r * Math.sin(a.from)], e: Pt = [c[0] + r * Math.cos(a.to), c[1] - r * Math.sin(a.to)];
    b += `<path class="gf-fill" d="M${s[0].toFixed(1)},${s[1].toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 0 ${e[0].toFixed(1)},${e[1].toFixed(1)} Z"/>`;
  }
  for (const [o1, a1, b1] of o.right ?? []) b += rightMark(T(o1), T(a1), T(b1), 9);
  for (const d of o.dims) {
    const A = T(d.a), B = T(d.b), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dxv = B[0] - A[0], dyv = B[1] - A[1], L = Math.hypot(dxv, dyv) || 1;
    let ux = -dyv / L, uy = dxv / L;
    const G = P.slice(0, n).reduce((g, p) => [g[0] + p[0] / n, g[1] + p[1] / n], [0, 0]);
    if (n > 2) { if (ux * (mx - G[0]) + uy * (my - G[1]) < 0) { ux = -ux; uy = -uy; } } else if ((d.side ?? 1) < 0) { ux = -ux; uy = -uy; }
    const off = 8 + Math.abs(ux) * d.t.length * 3.4 + Math.abs(uy) * 7;
    b += text([mx + ux * off, my + uy * off + 4], d.t, d.t.includes('?') ? 'gf-tq' : 'gf-ts');
  }
  return svgWrap(W, H, o.aria, b);
}
export { q, toNum, type Q, text, line };
