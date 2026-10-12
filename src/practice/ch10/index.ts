import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { reconnaitre, image } from './figures';
import { conserve, quadrilatere, homothetie, rotation, erreur } from './proprietes';

const ch10: ChapterPractice = {
  slug: CH,
  title: 'Transformations du plan',
  generators: [reconnaitre, image, conserve, quadrilatere, rotation, homothetie, erreur],
};
export default ch10;
