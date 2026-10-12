import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { lire, egales, simplifier, comparer, ranger, ecritures } from './nombres';
import { addition, produit, division, priorites, erreur } from './calculs';
import { quantite, probleme } from './problemes';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Fractions',
  generators: [lire, egales, simplifier, comparer, ranger, addition, produit, quantite, division, priorites, ecritures, probleme, erreur],
};
export default chapter;
