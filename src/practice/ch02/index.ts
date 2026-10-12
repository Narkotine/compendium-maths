import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { numeration, comparer, operations, calculs, arrondir } from './nombres';
import { euclide, divisibilite, premiers, decomposer, partage, erreur } from './arith';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Entiers et nombres décimaux',
  generators: [numeration, comparer, operations, calculs, arrondir, euclide, divisibilite, premiers, decomposer, partage, erreur],
};
export default chapter;
