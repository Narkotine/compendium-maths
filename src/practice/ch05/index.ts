import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { reconnaitre, quatrieme, tableau, grandeurs, vitesse } from './proportion';
import { pourcentage, evolution } from './pourcent';
import { ratio, echelle, erreur } from './autres';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Proportionnalité et pourcentages',
  generators: [reconnaitre, tableau, quatrieme, vitesse, grandeurs, pourcentage, evolution, ratio, echelle, erreur],
};
export default chapter;
