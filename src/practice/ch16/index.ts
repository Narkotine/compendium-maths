import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { frequences, circulaire, batons, moyenne } from './stats';
import { rebours, mediane, classes, interpreter, erreur } from './analyse';

const ch16: ChapterPractice = {
  slug: CH,
  title: 'Statistiques',
  generators: [frequences, circulaire, batons, moyenne, rebours, mediane, classes, interpreter, erreur],
};
export default ch16;
