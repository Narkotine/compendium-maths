import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { calcul, dix, prefixes, regles, negatifs } from './puissances';
import { scientifique, calculsci } from './sci';
import { racine, probleme, erreur } from './racine';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Puissances, notation scientifique et racine carrée',
  generators: [calcul, dix, regles, negatifs, prefixes, scientifique, calculsci, racine, probleme, erreur],
};
export default chapter;
