import { pushOverlay, requestCloseOverlay } from '../nav';
import { icon } from '../icons';
import { reducedMotion } from '../util';

export interface SheetHandle {
  el: HTMLElement;
  body: HTMLElement;
}

let uid = 0;
/**
 * Feuille du bas (mobile) / panneau centré (grand écran).
 * Fermeture : bouton ×, fond, Échap, glisser vers le bas, bouton retour (historique).
 */
export function openSheet(opts: {
  id: string;
  title: string;
  build: (body: HTMLElement) => void;
  className?: string;
  onOpen?: (h: SheetHandle) => void;
}): SheetHandle {
  const opener = document.activeElement as HTMLElement | null;
  const app = document.getElementById('app')!;
  const tid = `sheet-title-${++uid}`;
  const layer = document.createElement('div');
  layer.className = `sheet-layer ${opts.className ?? ''}`;
  layer.innerHTML = `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${tid}">
      <div class="sheet-grip" aria-hidden="true"><span></span></div>
      <div class="sheet-head">
        <h2 id="${tid}" class="sheet-title"></h2>
        <button type="button" class="icon-btn" data-close aria-label="Fermer">${icon('close')}</button>
      </div>
      <div class="sheet-body"></div>
    </div>`;
  layer.querySelector('.sheet-title')!.textContent = opts.title;
  const sheet = layer.querySelector<HTMLElement>('.sheet')!;
  const body = layer.querySelector<HTMLElement>('.sheet-body')!;
  opts.build(body);
  let closed = false;
  // l'entrée d'historique (et la position de lecture) est enregistrée avant de figer la page
  pushOverlay(opts.id, () => close());
  document.body.appendChild(layer);
  app.inert = true;
  document.documentElement.classList.add('has-overlay');

  const close = () => {
    if (closed) return;
    closed = true;
    layer.classList.remove('open');
    app.inert = false;
    document.documentElement.classList.remove('has-overlay');
    document.removeEventListener('keydown', onKey, true);
    const done = () => layer.remove();
    if (reducedMotion()) done();
    else setTimeout(done, 260);
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      requestCloseOverlay();
    } else if (e.key === 'Tab') {
      const f = [...sheet.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(
        (x) => x.offsetParent !== null,
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', onKey, true);
  layer.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close]')) requestCloseOverlay();
  });

  // Glisser vers le bas pour fermer (poignée + en-tête)
  let y0 = 0, dy = 0, t0 = 0, dragging = false;
  const grab = layer.querySelectorAll<HTMLElement>('.sheet-grip, .sheet-head');
  grab.forEach((g) =>
    g.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('button')) return;
      dragging = true;
      y0 = e.clientY;
      dy = 0;
      t0 = performance.now();
      sheet.style.transition = 'none';
      g.setPointerCapture(e.pointerId);
    }),
  );
  grab.forEach((g) => {
    g.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - y0);
      sheet.style.transform = `translateY(${dy}px)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      const v = dy / Math.max(1, performance.now() - t0);
      if (dy > 110 || (dy > 30 && v > 0.6)) requestCloseOverlay();
      sheet.style.transform = '';
    };
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
  });

  requestAnimationFrame(() => {
    layer.classList.add('open');
    const h = { el: sheet, body };
    opts.onOpen?.(h);
    const target = sheet.querySelector<HTMLElement>('[aria-current], [aria-checked="true"], [data-autofocus]') || sheet.querySelector<HTMLElement>('[data-close].icon-btn');
    target?.focus({ preventScroll: true });
  });
  return { el: sheet, body };
}
