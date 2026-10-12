/** Chapitre 11 : théorème de Pythagore — types d'exercices, dans l'ordre du cours. */
import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { hypotenuse, calculHyp, calculCote, reciproque, erreur } from './calculs';
import { figures, probleme, repere, deuxFois } from './applications';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Théorème de Pythagore',
  generators: [hypotenuse, calculHyp, calculCote, reciproque, figures, probleme, repere, deuxFois, erreur],
};
export default chapter;
