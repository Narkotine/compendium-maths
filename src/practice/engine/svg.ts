/**
 * Petites figures SVG générées (droites graduées, triangles, repères). Dessinées À L'ÉCHELLE :
 * les longueurs affichées sont proportionnelles aux longueurs de l'énoncé (une seule échelle par figure).
 * Classes gf-* stylées dans practice.css ; fond clair comme les figures du cours.
 */
export type Pt = [number, number];
const f = (x: number) => (Math.round(x * 10) / 10).toString();
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function svgWrap(w: number, h: number, aria: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" width="${f(w)}" height="${f(h)}" role="img" aria-label="${esc(aria)}">${body}</svg>`;
}
export const line = (a: Pt, b: Pt, cls = 'gf-line') => `<line class="${cls}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
export const poly = (ps: Pt[], cls = 'gf-fill') => `<polygon class="${cls}" points="${ps.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`;
export const pline = (ps: Pt[], cls = 'gf-line') => `<polyline class="${cls}" points="${ps.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`;
export const text = (p: Pt, s: string, cls = 'gf-t', anchor: 'start' | 'middle' | 'end' = 'middle') =>
  `<text class="${cls}" x="${f(p[0])}" y="${f(p[1])}" text-anchor="${anchor}" dominant-baseline="middle">${esc(s)}</text>`;
export const dot = (p: Pt, r = 3.5, cls = 'gf-pt') => `<circle class="${cls}" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}"/>`;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const addp = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mulp = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const norm = (a: Pt) => Math.hypot(a[0], a[1]);
const unit = (a: Pt): Pt => mulp(a, 1 / (norm(a) || 1));
/** Marque d'angle droit au sommet O, entre les directions OA et OB. */
export function rightMark(o: Pt, a: Pt, b: Pt, s = 11): string {
  const u = mulp(unit(sub(a, o)), s), v = mulp(unit(sub(b, o)), s);
  return pline([addp(o, u), addp(addp(o, u), v), addp(o, v)], 'gf-right');
}
/** Étiquette d'un sommet, poussée vers l'extérieur (à l'opposé du centre de gravité). */
export function vertexLabel(p: Pt, g: Pt, s: string, d = 14): string {
  const u = unit(sub(p, g));
  return text(addp(p, mulp(u, d)), s, 'gf-tb');
}
/** Étiquette d'un côté [AB], placée au milieu, à l'extérieur du triangle (g : centre de gravité). */
export function sideLabel(a: Pt, b: Pt, g: Pt, s: string, cls = 'gf-t', d = 14): string {
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let n: Pt = [-(b[1] - a[1]), b[0] - a[0]];
  n = unit(n);
  if (n[0] * (m[0] - g[0]) + n[1] * (m[1] - g[1]) < 0) n = mulp(n, -1);
  // décalage un peu plus grand pour les textes longs placés à gauche ou à droite
  const extra = Math.abs(n[0]) * Math.min(s.length * 3.2, 22);
  return text(addp(m, mulp(n, d + extra)), s, cls);
}

/**
 * Place un triangle donné par ses coordonnées « réelles » dans un cadre w × h, en conservant les proportions
 * (même échelle en x et en y), après rotation d'angle `rot` (radians).
 */
export function fit(pts: Pt[], w: number, h: number, margin: number, rot = 0): { pts: Pt[]; k: number } {
  const c = Math.cos(rot), s = Math.sin(rot);
  const r = pts.map(([x, y]): Pt => [x * c - y * s, -(x * s + y * c)]); // y vers le haut
  const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((w - 2 * margin) / (x1 - x0 || 1), (h - 2 * margin) / (y1 - y0 || 1));
  const ox = (w - (x1 - x0) * k) / 2, oy = (h - (y1 - y0) * k) / 2;
  return { pts: r.map(([x, y]): Pt => [ox + (x - x0) * k, oy + (y - y0) * k]), k };
}
export const centroid = (ps: Pt[]): Pt => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
