/** Renvois des automatismes vers les chapitres du cours (page du chapitre). */
import type { CourseLink } from '../engine/types';
const ch = (slug: string, label: string): CourseLink => ({ href: `#/ch/${slug}`, label });
export const L = {
  fr: ch('01-fractions-rationnels', 'Chapitre 1 · Fractions'),
  ent: ch('02-entiers-et-decimaux', 'Chapitre 2 · Entiers et décimaux'),
  rel: ch('03-nombres-relatifs', 'Chapitre 3 · Nombres relatifs'),
  pui: ch('04-puissances-notation-scientifique', 'Chapitre 4 · Puissances'),
  pro: ch('05-proportionalite-pourcentages', 'Chapitre 5 · Proportionnalité, pourcentages'),
  lit: ch('06-calcul-litteral', 'Chapitre 6 · Calcul littéral'),
  eq: ch('07-equations-inequations', 'Chapitre 7 · Équations'),
  geo: ch('09-geometrie-plane-figures', 'Chapitre 9 · Géométrie plane'),
  pyt: ch('11-pythagore', 'Chapitre 11 · Pythagore'),
  aire: ch('14-aires-volumes-grandeurs', 'Chapitre 14 · Aires, volumes, grandeurs'),
  sta: ch('16-statistiques', 'Chapitre 16 · Statistiques'),
  pba: ch('17-probabilites', 'Chapitre 17 · Probabilités'),
};
