/** Outils du chapitre 15 : liens, patrons de cube (pliage simulé), figures (patron, plan coté, pavé en perspective). */
import type { CourseLink, NumField, Rich, Step } from '../engine/types';
import { q, type Q } from '../engine/q';
import { svgWrap, line, text, type Pt } from '../engine/svg';

export const CH = '15-geometrie-espace';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Polyèdres'), s12: sec('s1-2', '§ 1.2 · Solides de révolution'), s21: sec('s2-1', '§ 2.1 · Perspective cavalière'),
  s32: sec('s3-2', '§ 3.2 · Patrons du cube'), s33: sec('s3-3', '§ 3.3 · Patron d’un pavé'), s35: sec('s3-5', '§ 3.5 · Cylindre et cône'), s4: sec('s4', '§ 4 · Les vues'),
  s51: sec('s5-1', '§ 5.1 · Sections : pavé, cylindre'), s52: sec('s5-2', '§ 5.2 · Pyramide et cône'), s53: sec('s5-3', '§ 5.3 · Sphère'),
  s61: sec('s6-1', '§ 6.1 · Repérage dans un pavé'), s62: sec('s6-2', '§ 6.2 · Sur la sphère terrestre'),
};
export const m = (s: string) => `$${s}$`;
export const D = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', '{,}');
export const Dt = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',');
export const grp = (v: number) => { const s = D(v); const [i, d] = s.split('{,}'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') + (d ? `{,}${d}` : ''); };
export type Item = { what: string; js: string; expect: number; tol?: number };
export const step = (prompt: Rich, fields: NumField[], hint: Rich, mistakes: Step['mistakes'] = []): Step => ({ prompt, answer: { kind: 'num', fields }, hint, mistakes });
export const corr = (s: Step) => (s.answer as { correct: number }).correct;
export const numF = (label: Rich, v: number, unit?: string): NumField => ({ label, unit, expect: q(Math.round(v * 1000), 1000), form: 'any' });
const round = (v: number, dp: number) => Math.round(v * 10 ** dp) / 10 ** dp;
export const approxF = (label: Rich, v: number, dp: number, unit?: string): NumField => ({ label, unit, expect: q(Math.round(v * 10 ** dp), 10 ** dp), form: 'any', approx: { value: v, tol: 0.5 * 10 ** -dp, dp }, shown: dp === 0 ? grp(round(v, 0)) : round(v, dp).toFixed(dp).replace('.', '{,}') });
export const safe = (v: number, dp: number) => Math.abs(((v * 10 ** dp) % 1) - 0.5) > 0.06;
export const ar = (v: number, dp: number) => round(v, dp).toFixed(dp).replace('.', '{,}');
export { q, type Q };

// ------------------------------------------------------------------ patrons de cube
export type Cell = [number, number]; // (colonne, ligne), ligne vers le bas
type V3 = [number, number, number];
const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]];
/** Pliage simulé (même méthode que outils/relecture/patron-cube.py) : normale de chaque carré, ou null si ce n'est pas un patron. */
export function fold(cells: Cell[]): Map<string, V3> | null {
  const set = new Set(cells.map((c) => c.join(','))), start = cells[0], seen = new Map<string, V3>([[start.join(','), [0, 0, -1]]]);
  const queue: [Cell, V3, V3, V3][] = [[start, [0, 0, -1], [0, 1, 0], [1, 0, 0]]];
  while (queue.length) {
    const [[c, l], dn, no, ea] = queue.shift()!;
    const moves: [Cell, V3, V3, V3][] = [[[1, 0], ea, no, neg(dn)], [[-1, 0], neg(ea), no, dn], [[0, -1], no, neg(dn), ea], [[0, 1], neg(no), dn, ea]];
    for (const [[dc, dl], ndn, nno, nea] of moves) {
      const k = `${c + dc},${l + dl}`;
      if (set.has(k) && !seen.has(k)) { seen.set(k, ndn); queue.push([[c + dc, l + dl], ndn, nno, nea]); }
    }
  }
  if (seen.size !== 6 || new Set([...seen.values()].map((v) => v.join(','))).size !== 6) return null;
  return seen;
}
/** Tous les hexominos (formes libres à translation près, toutes orientations). */
export function hexominoes(): Cell[][] {
  const key = (cs: Cell[]) => { const x0 = Math.min(...cs.map((c) => c[0])), y0 = Math.min(...cs.map((c) => c[1])); return cs.map(([x, y]) => [x - x0, y - y0] as Cell).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  let cur = new Map<string, Cell[]>([['0,0', [[0, 0]]]]);
  for (let n = 1; n < 6; n++) {
    const nx = new Map<string, Cell[]>();
    for (const cs of cur.values()) for (const [x, y] of cs) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c: Cell = [x + dx, y + dy];
      if (cs.some((d) => d[0] === c[0] && d[1] === c[1])) continue;
      const k = key([...cs, c]); nx.set(k.map((p) => p.join(',')).join(';'), k);
    }
    cur = nx;
  }
  return [...cur.values()];
}
export function netSvg(cells: Cell[], labels: string[] | null, aria: string): string {
  const s = 46, W = Math.max(...cells.map((c) => c[0])) + 1, H = Math.max(...cells.map((c) => c[1])) + 1, ox = (320 - W * s) / 2, oy = 10;
  let b = '';
  cells.forEach(([c, l], i) => { b += `<rect class="gf-net" x="${ox + c * s}" y="${oy + l * s}" width="${s}" height="${s}"/>`; if (labels) b += text([ox + c * s + s / 2, oy + l * s + s / 2], labels[i], 'gf-tb'); });
  return svgWrap(320, H * s + 20, aria, b);
}

/** Plan coté : vue de dessus (rangée de derrière en haut) avec la hauteur de chaque pile. */
export function planSvg(h: number[][], aria: string): string {
  const s = 44, R = h.length, C = h[0].length, ox = (320 - C * s) / 2, oy = 24;
  let b = text([160, 10], 'derrière', 'gf-ts') + text([160, oy + R * s + 14], 'devant', 'gf-ts');
  h.forEach((row, r) => row.forEach((v, c) => { b += `<rect class="${v ? 'gf-net' : 'gf-net0'}" x="${ox + c * s}" y="${oy + r * s}" width="${s}" height="${s}"/>`; if (v) b += text([ox + c * s + s / 2, oy + r * s + s / 2], String(v), 'gf-tb'); }));
  return svgWrap(320, oy + R * s + 26, aria, b);
}

/** Pavé ABCDEFGH en perspective cavalière (face avant ABFE, fuyantes à 45°, coefficient 0,5), à l'échelle. */
export function paveSvg(L: number, P: number, Hh: number, marks: { p: [number, number, number]; lab: string }[] = []): string {
  const k = Math.min(200 / (L + 0.35 * P), 150 / (Hh + 0.35 * P)), c = 0.5 * Math.SQRT1_2;
  const proj = ([x, y, z]: [number, number, number]): Pt => [40 + (x + c * y) * k, 200 - (z + c * y) * k];
  const V: Record<string, [number, number, number]> = { A: [0, 0, 0], B: [L, 0, 0], C: [L, P, 0], D: [0, P, 0], E: [0, 0, Hh], F: [L, 0, Hh], G: [L, P, Hh], H: [0, P, Hh] };
  const E = (a: string, b2: string, cls = 'gf-line') => line(proj(V[a]), proj(V[b2]), cls);
  let b = E('A', 'B') + E('B', 'F') + E('F', 'E') + E('E', 'A') + E('B', 'C') + E('C', 'G') + E('G', 'F') + E('G', 'H') + E('H', 'E') + E('A', 'D', 'gf-hid') + E('D', 'C', 'gf-hid') + E('D', 'H', 'gf-hid');
  const off: Record<string, Pt> = { A: [-10, 10], B: [8, 12], C: [12, 4], D: [-12, -6], E: [-10, -8], F: [4, -10], G: [12, -6], H: [-6, -10] };
  for (const n of Object.keys(V)) { const p = proj(V[n]); b += text([p[0] + off[n][0], p[1] + off[n][1]], n, 'gf-tb'); }
  for (const mk of marks) { const p = proj(mk.p); b += `<circle class="gf-pt2" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5"/>` + text([p[0] + 9, p[1] - 9], mk.lab, 'gf-tb', 'start'); }
  return svgWrap(320, 230, `Pavé ABCDEFGH en perspective cavalière ; AB = ${Dt(L)}, AD = ${Dt(P)}, AE = ${Dt(Hh)}${marks.length ? ` ; points ${marks.map((x) => x.lab).join(', ')}` : ''}`, b);
}
