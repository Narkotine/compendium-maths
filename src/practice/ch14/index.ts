import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { conversion, aires, disque, composee, volumes, laterale, reduction, durees, composees, erreur } from './grandeurs';

const ch14: ChapterPractice = {
  slug: CH,
  title: 'Aires, volumes, grandeurs',
  generators: [conversion, aires, disque, composee, volumes, laterale, reduction, durees, composees, erreur],
};
export default ch14;
