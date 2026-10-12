/**
 * Rendu des textes enrichis (Rich) : formules KaTeX (chargé à la demande, seulement sur les pages
 * d'entraînement), **gras**, sauts de ligne, droites graduées [[ray:rel:n/d]].
 */
import type katexT from 'katex';
import type { Rich } from './types';
import type { Rel } from './expr';
import { q } from './q';
import { numberLineSvg } from '../ui/numberline';

let K: typeof katexT | null = null;
export async function loadKatex() {
  if (!K) K = (await import('katex')).default;
  return K;
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function tex(t: string, display = false): string {
  if (!K) return `<code>${esc(t)}</code>`;
  try {
    const html = K.renderToString(t, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
    // formule longue en ligne : bloc défilant plutôt que débordement
    return display ? `<div class="mx-display">${html}</div>` : t.length > 40 ? `<span class="mx-long">${html}</span>` : html;
  } catch {
    return `<code>${esc(t)}</code>`;
  }
}
function textPart(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
/** Texte enrichi → HTML (en ligne). */
export function rich(r: Rich): string {
  if (!r) return '';
  const ray = /^\[\[ray:([<>=]{1,2}):(-?\d+)\/(\d+)\]\]$/.exec(r.trim());
  if (ray) {
    const rel = ray[1] as Rel;
    return numberLineSvg({ bound: q(Number(ray[2]), Number(ray[3])), side: rel.startsWith('>') ? 'right' : 'left', incl: rel.length === 2 });
  }
  // ** peut encadrer des formules : on protège d'abord les $…$
  const parts = r.split('$');
  let out = '';
  const maths: string[] = [];
  parts.forEach((p, i) => {
    if (i % 2) {
      maths.push(p);
      out += `\u0001${maths.length - 1}\u0002`;
    } else out += p;
  });
  return textPart(out).replace(/\u0001(\d+)\u0002/g, (_, i) => tex(maths[Number(i)]));
}
/** Paragraphes (un par ligne de l'énoncé). */
export const richParas = (r: Rich) => r.split('\n').map((l) => `<p>${rich(l)}</p>`).join('');
/** Texte brut (pour les étiquettes accessibles) : formules approximées. */
export function plain(r: Rich): string {
  return r
    .replace(/\$([^$]*)\$/g, (_, t: string) =>
      t
        .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
        .replace(/\\widehat\{([^}]*)\}/g, 'angle $1')
        .replace(/\\leqslant/g, '≤')
        .replace(/\\geqslant/g, '≥')
        .replace(/\\times/g, '×')
        .replace(/\{,\}/g, ',')
        .replace(/\\[a-z]+/g, '')
        .replace(/[{}]/g, '')
        .replace(/-/g, '−'),
    )
    .replace(/\*\*/g, '');
}
