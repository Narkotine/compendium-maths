/**
 * Registre des chapitres qui proposent « S'entraîner ». Chaque chapitre est un module chargé
 * à la demande (import dynamique) : rien de ce code n'alourdit la lecture des cours.
 * Pour ajouter un chapitre : créer src/practice/<chNN>/index.ts (export default ChapterPractice),
 * l'ajouter ci-dessous, et activer `practice` pour ce chapitre dans content-meta.json. Voir README.
 */
import type { ChapterPractice } from './engine/types';

const LOADERS: Record<string, () => Promise<{ default: ChapterPractice }>> = {
  '01-fractions-rationnels': () => import('./ch01/index'),
  '02-entiers-et-decimaux': () => import('./ch02/index'),
  '03-nombres-relatifs': () => import('./ch03/index'),
  '04-puissances-notation-scientifique': () => import('./ch04/index'),
  '05-proportionalite-pourcentages': () => import('./ch05/index'),
  '06-calcul-litteral': () => import('./ch06/index'),
  '07-equations-inequations': () => import('./ch07/index'),
  '08-fonctions': () => import('./ch08/index'),
  '09-geometrie-plane-figures': () => import('./ch09/index'),
  '10-transformations-plan': () => import('./ch10/index'),
  '11-pythagore': () => import('./ch11/index'),
  '12-thales': () => import('./ch12/index'),
  '13-trigonometrie': () => import('./ch13/index'),
  '14-aires-volumes-grandeurs': () => import('./ch14/index'),
  '15-geometrie-espace': () => import('./ch15/index'),
  '16-statistiques': () => import('./ch16/index'),
  '17-probabilites': () => import('./ch17/index'),
};

export const hasPractice = (slug: string) => slug in LOADERS;
export async function loadChapter(slug: string): Promise<ChapterPractice | null> {
  const l = LOADERS[slug];
  return l ? (await l()).default : null;
}
