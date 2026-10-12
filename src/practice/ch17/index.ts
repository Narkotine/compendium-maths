import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { vocabulaire, equiprobable, urne, cartes, roue } from './bases';
import { contraire, arbre, tableau, frequence, erreur } from './epreuves';

const ch17: ChapterPractice = {
  slug: CH,
  title: 'Probabilités',
  generators: [vocabulaire, equiprobable, urne, cartes, roue, contraire, arbre, tableau, frequence, erreur],
};
export default ch17;
