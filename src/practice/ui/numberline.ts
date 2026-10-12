/**
 * Droite graduée (inéquations), dessinée en SVG selon la convention du cours (§ 6.1) :
 * demi-droite des solutions en vert, crochet rouge tourné VERS les solutions si la borne est incluse,
 * VERS L'EXTÉRIEUR si elle est exclue.
 */
import { type Q, toNum, isInt } from '../engine/q';

export type Side = 'left' | 'right';
export interface LineState {
  bound: Q;
  side: Side | null;
  incl: boolean | null;
}
const W = 340, M = 20, Y = 44;

const fmt = (b: Q) => (isInt(b) ? String(b.n) : `${b.n < 0 ? '−' : ''}${Math.abs(b.n)}/${b.d}`).replace('-', '−');
export function lineLabel(s: LineState): string {
  if (!s.side) return `Droite graduée, borne ${fmt(s.bound)} ; côté des solutions non choisi.`;
  const rel = s.side === 'right' ? (s.incl ? 'supérieurs ou égaux à' : 'strictement supérieurs à') : s.incl ? 'inférieurs ou égaux à' : 'strictement inférieurs à';
  return `Droite graduée : solutions coloriées, nombres ${s.incl === null ? (s.side === 'right' ? 'supérieurs à' : 'inférieurs à') : rel} ${fmt(s.bound)}.`;
}

export function numberLineSvg(s: LineState, o: { interactive?: boolean } = {}): string {
  const b = toNum(s.bound);
  const c = Math.round(b);
  const lo = c - 5, hi = c + 5;
  const sc = (W - 2 * M) / (hi - lo);
  const X = (v: number) => M + (v - lo) * sc;
  const bx = X(b);
  let g = '';
  // demi-droite des solutions (sous l'axe pour rester lisible)
  if (s.side) {
    const x2 = s.side === 'right' ? W - 4 : 4;
    g += `<line class="nl-ray" x1="${bx}" y1="${Y}" x2="${x2}" y2="${Y}"/>`;
  }
  // axe
  g += `<line class="nl-axis" x1="4" y1="${Y}" x2="${W - 6}" y2="${Y}"/><path class="nl-axis" d="M${W - 12} ${Y - 5} L${W - 4} ${Y} L${W - 12} ${Y + 5}"/>`;
  for (let v = lo; v <= hi; v++) {
    const x = X(v);
    const isB = isInt(s.bound) && v === s.bound.n;
    g += `<line class="nl-tick" x1="${x}" y1="${Y - 5}" x2="${x}" y2="${Y + 5}"/>`;
    g += `<text class="nl-num${isB ? ' nl-num--b' : ''}" x="${x}" y="${Y + 24}">${String(v).replace('-', '−')}</text>`;
  }
  if (!isInt(s.bound)) {
    g += `<line class="nl-tick nl-tick--b" x1="${bx}" y1="${Y - 8}" x2="${bx}" y2="${Y + 8}"/>`;
    g += `<text class="nl-num nl-num--b" x="${bx}" y="${Y - 22}">${fmt(s.bound)}</text>`;
  }
  // crochet
  if (s.side && s.incl !== null) {
    const opensRight = (s.side === 'right') === s.incl;
    const d = opensRight ? 9 : -9;
    g += `<path class="nl-br" d="M${bx + d} ${Y - 15} H${bx} V${Y + 15} H${bx + d}"/>`;
  } else if (s.side || o.interactive) {
    g += `<circle class="nl-dot" cx="${bx}" cy="${Y}" r="4"/>`;
  }
  return `<svg class="nl${o.interactive ? ' nl--edit' : ''}" viewBox="0 0 ${W} 78" role="img" aria-label="${lineLabel(s)}">${g}</svg>`;
}
/** Position (gauche/droite de la borne) d'un clic sur la droite graduée. */
export function sideFromClick(svg: SVGSVGElement, clientX: number, bound: Q): Side {
  const r = svg.getBoundingClientRect();
  const b = toNum(bound), c = Math.round(b);
  const bx = M + (b - (c - 5)) * ((W - 2 * M) / 10);
  return ((clientX - r.left) / r.width) * W >= bx ? 'right' : 'left';
}
