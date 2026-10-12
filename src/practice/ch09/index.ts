import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { paires, secante, triangle, inegalite } from './angles';
import { proprietes, remarquables, quadrilateres, cercle, erreur } from './figures';

const ch09: ChapterPractice = {
  slug: CH,
  title: 'Géométrie plane',
  generators: [proprietes, paires, secante, triangle, inegalite, remarquables, quadrilateres, cercle, erreur],
};
export default ch09;
