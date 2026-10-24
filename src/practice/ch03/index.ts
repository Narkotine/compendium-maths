/** Chapitre 3 : nombres relatifs — types d'exercices, dans l'ordre du cours. */
import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { comparer, ranger, abscisse, distance } from './droite';
import { addition, soustraction, produit, signe, priorites } from './operations';
import { probleme } from './problemes';
import { absolue } from './absolue';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Nombres relatifs',
  generators: [absolue, abscisse, comparer, ranger, addition, soustraction, distance, produit, signe, priorites, probleme],
};
export default chapter;
