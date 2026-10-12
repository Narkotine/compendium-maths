import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { image, antecedent, vocabulaire, lecture, point, lineaire, affine, probleme, erreur } from './fonctions';

const ch08: ChapterPractice = {
  slug: CH,
  title: 'Fonctions',
  generators: [image, antecedent, vocabulaire, point, lecture, lineaire, affine, probleme, erreur],
};
export default ch08;
