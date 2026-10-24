/**
 * Repères de programme sur les cartes d’entraînement.
 * « Programme 2026 · Ne » : notion ajoutée ou déplacée par le programme 2026 (BO n° 10 du 5 mars 2026).
 * « Programme 2020 » : notion absente du programme 2026, encore étudiée en 4e (jusqu’en juin 2027) et en 3e (jusqu’en juin 2028).
 * `note` précise une partie seulement du type (par ex. un niveau d’étoiles).
 */
export type ProgTag = { label: string; note?: string };

const P2020 = 'Programme 2020';
export const PROG: Record<string, Record<string, ProgTag>> = {
  '03-nombres-relatifs': { 'valeur-absolue': { label: 'Programme 2026 · 5e' } },
  '07-equations-inequations': { inequation: { label: 'Programme 2026 · 3e' } },
  '09-geometrie-plane-figures': { inegalite: { label: P2020 } },
  '10-transformations-plan': { vecteurs: { label: 'Programme 2026 · 3e' }, rotation: { label: P2020 }, homothetie: { label: P2020 } },
  '12-thales': { agrandir: { label: P2020 }, semblables: { label: P2020 } },
  '14-aires-volumes-grandeurs': { reduction: { label: P2020 } },
  '15-geometrie-espace': { sections: { label: P2020, note: 'pyramide et cône (★★)' }, reperage: { label: P2020 } },
  '16-statistiques': { quartiles: { label: 'Programme 2026 · 3e' }, classes: { label: P2020, note: 'histogramme' } },
  '17-probabilites': { ensembles: { label: 'Programme 2026 · 4e-3e' } },
};

export const PROG_TITLE = {
  2026: 'Notion du programme 2026 (BO n° 10 du 5 mars 2026) : en vigueur en 5e à la rentrée 2026, en 4e à la rentrée 2027, en 3e à la rentrée 2028.',
  2020: 'Notion du programme 2020, absente du programme 2026 : encore étudiée en 4e jusqu’en juin 2027 et en 3e jusqu’en juin 2028.',
} as const;

/** Pastille HTML (vide si le type n’a pas de repère). */
export function progBadge(slug: string, id: string): string {
  const t = PROG[slug]?.[id];
  if (!t) return '';
  const year = t.label.includes('2026') ? 2026 : 2020;
  const text = t.note ? `${t.label} : ${t.note}` : t.label;
  return `<span class="prog prog--${year}" title="${PROG_TITLE[year]}">${text}</span>`;
}
