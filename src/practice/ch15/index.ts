import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { solides, cavaliere, patron, vues } from './solides';
import { sections, reperage, aires, erreur } from './mesures';

const ch15: ChapterPractice = {
  slug: CH,
  title: 'Géométrie dans l’espace',
  generators: [solides, patron, cavaliere, vues, aires, sections, reperage, erreur],
};
export default ch15;
