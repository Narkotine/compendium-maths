import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { vocabulaire, rapports, calculatrice, longueur, angle, outil, probleme, erreur, exact } from './trigo';

const ch13: ChapterPractice = {
  slug: CH,
  title: 'Trigonométrie',
  generators: [vocabulaire, rapports, calculatrice, longueur, angle, outil, probleme, erreur, exact],
};
export default ch13;
