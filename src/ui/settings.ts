import { getSettings, setSettings, resetProgress, type Theme } from '../store';
import { openSheet } from './sheet';
import { icon } from '../icons';
import { getIndex } from '../data';
import { offlineStatus, hardReset } from '../pwa';
import { FEATURES } from '../config';
import { getPrefs, setPrefs, resetPractice, hasPracticeData, type KeypadPref } from '../practice/engine/stats';

const SIZES = ['Petit', 'Normal', 'Grand', 'Très grand'];
const KP: [KeypadPref, string][] = [
  ['auto', 'Auto'],
  ['on', 'Toujours'],
  ['off', 'Jamais'],
];

export function openSettings() {
  openSheet({
    id: 'settings',
    title: 'Réglages',
    className: 'sheet--settings',
    build(body) {
      const s = getSettings();
      const themes: [Theme, string, string][] = [
        ['auto', 'Auto', 'auto'],
        ['light', 'Clair', 'sun'],
        ['dark', 'Sombre', 'moon'],
      ];
      body.innerHTML = `
        <div class="set-group" role="radiogroup" aria-labelledby="set-theme">
          <h3 class="set-title" id="set-theme">Thème</h3>
          <div class="segmented">
            ${themes
              .map(
                ([v, l, ic]) =>
                  `<button type="button" role="radio" class="seg" data-theme-v="${v}" aria-checked="${s.theme === v}">${icon(ic)}<span>${l}</span></button>`,
              )
              .join('')}
          </div>
          <p class="set-help">« Auto » suit le réglage du téléphone.</p>
        </div>
        <div class="set-group" role="radiogroup" aria-labelledby="set-size">
          <h3 class="set-title" id="set-size">Taille du texte</h3>
          <div class="segmented segmented--size">
            ${SIZES.map(
              (l, i) =>
                `<button type="button" role="radio" class="seg" data-size-v="${i}" aria-checked="${s.size === i}" aria-label="${l}"><span class="size-a size-a--${i}" aria-hidden="true">A</span></button>`,
            ).join('')}
          </div>
          <p class="set-preview">Dans un triangle rectangle, l’hypoténuse est le plus long côté.</p>
        </div>
        <div class="set-group">
          <h3 class="set-title">Corrigés</h3>
          <label class="switch-row">
            <span><strong>Déplier tous les corrigés</strong><br><span class="set-help">Sinon, chaque corrigé reste caché pour chercher d’abord.</span></span>
            <input type="checkbox" role="switch" class="switch" data-opencor ${s.openCor ? 'checked' : ''}>
          </label>
        </div>
        ${
          FEATURES.practice
            ? `<div class="set-group">
          <h3 class="set-title" id="set-kp">Entraînement</h3>
          <div class="segmented" role="radiogroup" aria-labelledby="set-kp set-kp-l">
            ${KP.map(([v, l]) => `<button type="button" role="radio" class="seg" data-kp-v="${v}" aria-checked="${getPrefs().keypad === v}">${l}</button>`).join('')}
          </div>
          <p class="set-help" id="set-kp-l">Clavier mathématique à l’écran pour les réponses. « Auto » : sur téléphone et tablette.</p>
          <label class="switch-row">
            <span><strong>Calculatrice dans les exercices</strong><br><span class="set-help">Bouton en haut de l’exercice ; absente quand l’exercice porte sur le calcul lui-même.</span></span>
            <input type="checkbox" role="switch" class="switch" data-calc ${s.calc ? 'checked' : ''}>
          </label>
          <button type="button" class="btn btn--ghost set-btn" data-reset-practice ${hasPracticeData() ? '' : 'disabled'}>Effacer les résultats d’entraînement</button>
        </div>`
            : ''
        }
        <div class="set-group set-about">
          <h3 class="set-title">Application</h3>
          <p class="set-status" data-offline>${icon('offline')}<span>${offlineStatus()}</span></p>
          <p class="set-help">Maths Collège ${getIndex()?.version ?? ''} · cours ${getIndex()?.contentVersion ?? ''} · 17 chapitres. Les réglages et la progression restent sur cet appareil.</p>
          <button type="button" class="btn btn--ghost" data-reset>Effacer la progression de lecture</button>
          <button type="button" class="btn btn--ghost set-btn" data-force-update>Forcer la mise à jour</button>
          <p class="set-help">Si l’appli semble bloquée sur une ancienne version : recharge tout depuis le réseau (ta progression est conservée).</p>
        </div>`;
      body.addEventListener('click', (e) => {
        const t = e.target as Element;
        const th = t.closest<HTMLElement>('[data-theme-v]');
        if (th) {
          setSettings({ theme: th.dataset.themeV as Theme });
          body.querySelectorAll('[data-theme-v]').forEach((b) => b.setAttribute('aria-checked', String(b === th)));
        }
        const sz = t.closest<HTMLElement>('[data-size-v]');
        if (sz) {
          setSettings({ size: Number(sz.dataset.sizeV) });
          body.querySelectorAll('[data-size-v]').forEach((b) => b.setAttribute('aria-checked', String(b === sz)));
        }
        const kp = t.closest<HTMLElement>('[data-kp-v]');
        if (kp) {
          setPrefs({ keypad: kp.dataset.kpV as KeypadPref });
          body.querySelectorAll('[data-kp-v]').forEach((b) => b.setAttribute('aria-checked', String(b === kp)));
        }
        const rp = t.closest<HTMLButtonElement>('[data-reset-practice]');
        if (rp && !rp.disabled) {
          if (confirm('Effacer les résultats d’entraînement (réussites par type, séries) ? Les préférences sont conservées.')) {
            resetPractice();
            rp.textContent = 'Résultats effacés';
            rp.disabled = true;
          }
        }
        if (t.closest('[data-force-update]')) {
          (t.closest('[data-force-update]') as HTMLButtonElement).textContent = 'Mise à jour…';
          void hardReset();
        }
        if (t.closest('[data-reset]')) {
          if (confirm('Effacer la progression de lecture (chapitres commencés, « Reprendre ») ?')) {
            resetProgress();
            (t.closest('[data-reset]') as HTMLButtonElement).textContent = 'Progression effacée';
          }
        }
      });
      // Flèches gauche/droite dans les groupes radio
      body.addEventListener('keydown', (e) => {
        const b = (e.target as Element).closest<HTMLElement>('[role=radio]');
        if (!b || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const all = [...b.parentElement!.querySelectorAll<HTMLElement>('[role=radio]')];
        const n = all[(all.indexOf(b) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
        n.focus();
        n.click();
        e.preventDefault();
      });
      body.querySelector<HTMLInputElement>('[data-calc]')?.addEventListener('change', (e) => setSettings({ calc: (e.target as HTMLInputElement).checked }));
      body.querySelector<HTMLInputElement>('[data-opencor]')!.addEventListener('change', (e) =>
        setSettings({ openCor: (e.target as HTMLInputElement).checked }),
      );
    },
  });
}
