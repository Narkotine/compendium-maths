/** Chapitre 7 : équations et inéquations — liste des types d'exercices, dans l'ordre du cours. */
import type { ChapterPractice } from '../engine/types';
import { CH } from './common';
import { tester } from './tester';
import { xPlusA, axEqB, axPlusB, deuxMembres } from './simples';
import { parentheses, fractions } from './avances';
import { produitNul, carre } from './quadra';
import { inequation } from './inequations';
import { systeme } from './systemes';
import { probleme } from './problemes';

const chapter: ChapterPractice = {
  slug: CH,
  title: 'Équations et inéquations',
  generators: [tester, xPlusA, axEqB, axPlusB, deuxMembres, parentheses, fractions, probleme, produitNul, carre, inequation, systeme],
};
export default chapter;
