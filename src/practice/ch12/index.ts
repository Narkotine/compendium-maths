import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { rapports, croix, emboites, papillon, restant } from './theoreme';
import { reciproque, agrandir, semblables, probleme, erreur } from './applications';

const ch12: ChapterPractice = {
  slug: CH,
  title: 'Théorème de Thalès',
  generators: [rapports, croix, emboites, papillon, restant, reciproque, agrandir, semblables, probleme, erreur],
};
export default ch12;
