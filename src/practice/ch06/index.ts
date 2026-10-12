/** Chapitre 6 : calcul littéral — types d'exercices, dans l'ordre du cours. */
import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { valeur, traduire, nature, reduire, progCalcul, vraiFaux } from './expressions';
import { developper, double, factoriser, identites, factId } from './transformer';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Calcul littéral',
  generators: [valeur, traduire, nature, reduire, developper, double, factoriser, identites, factId, progCalcul, vraiFaux],
};
export default chapter;
