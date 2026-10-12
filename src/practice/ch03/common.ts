/** Outils communs aux générateurs du chapitre 3 (nombres relatifs). */
import type { CourseLink } from '../engine/types';

export const CH = '03-nombres-relatifs';
const sec = (id: string, label: string): CourseLink => ({ href: `#/ch/${CH}/${id}`, label });
export const LINKS = {
  s11: sec('s1-1', '§ 1.1 · Situations de la vie courante'),
  s12: sec('s1-2', '§ 1.2 · Opposé, distance à zéro'),
  s21: sec('s2-1', '§ 2.1 · Se repérer sur une droite graduée'),
  s22: sec('s2-2', '§ 2.2 · Comparer'),
  s32: sec('s3-2', '§ 3.2 · Addition : les règles'),
  s33: sec('s3-3', '§ 3.3 · Additionner plusieurs relatifs'),
  s41: sec('s4-1', '§ 4.1 · Soustraire, c’est ajouter l’opposé'),
  s42: sec('s4-2', '§ 4.2 · Écriture simplifiée, distance'),
  s52: sec('s5-2', '§ 5.2 · Règle des signes'),
  s53: sec('s5-3', '§ 5.3 · Carrés et puissances'),
  s6: sec('s6', '§ 6 · Priorités'),
};
export const SIGN = 'Attention au signe : tu trouves l’opposé du bon résultat. Reprends la règle des signes.';
