import { pushOverlay, requestCloseOverlay } from '../nav';
import { icon } from '../icons';
import { esc } from '../util';

/**
 * Visionneuse plein écran d'une figure : pincer pour zoomer, glisser pour déplacer,
 * double-tap pour zoomer ×2,5 / revenir, molette ou boutons +/− sur ordinateur.
 * Le zoom agrandit réellement l'image (largeur/hauteur CSS) : le SVG reste net.
 */
export function openViewer(src: string, w: number, h: number, caption: string) {
  const opener = document.activeElement as HTMLElement | null;
  const app = document.getElementById('app')!;
  const layer = document.createElement('div');
  layer.className = 'viewer';
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-label', 'Figure agrandie');
  layer.innerHTML = `
    <div class="viewer-top">
      <p class="viewer-cap">${esc(caption)}</p>
      <button type="button" class="icon-btn" data-act="close" aria-label="Fermer la figure">${icon('close')}</button>
    </div>
    <div class="viewer-stage"><div class="viewer-card"><img alt="${esc(caption)}" src="${esc(src)}" draggable="false"></div></div>
    <div class="viewer-tools" role="toolbar" aria-label="Zoom">
      <button type="button" class="icon-btn" data-act="out" aria-label="Dézoomer">${icon('minus')}</button>
      <button type="button" class="viewer-zoom" data-act="reset" aria-label="Taille ajustée à l’écran">100 %</button>
      <button type="button" class="icon-btn" data-act="in" aria-label="Zoomer">${icon('plus')}</button>
    </div>
    <p class="viewer-hint" aria-hidden="true">Pincez pour zoomer · double-tap pour agrandir</p>`;
  let closed = false;
  pushOverlay('figure', () => close());
  document.body.appendChild(layer);
  app.inert = true;
  document.documentElement.classList.add('has-overlay');

  const stage = layer.querySelector<HTMLElement>('.viewer-stage')!;
  const card = layer.querySelector<HTMLElement>('.viewer-card')!;
  const zoomLabel = layer.querySelector<HTMLElement>('.viewer-zoom')!;
  const PAD = 12;
  let fit = 1, z = 1, tx = 0, ty = 0;
  const MAXZ = 6;

  const size = () => {
    const r = stage.getBoundingClientRect();
    fit = Math.min((r.width - 2 * PAD) / w, (r.height - 2 * PAD) / h, 3);
    return r;
  };
  const clamp = () => {
    const r = stage.getBoundingClientRect();
    const cw = w * fit * z + 2 * PAD, chh = h * fit * z + 2 * PAD;
    // centré si plus petit que la scène, sinon bords contraints
    tx = cw <= r.width ? (r.width - cw) / 2 : Math.min(0, Math.max(r.width - cw, tx));
    ty = chh <= r.height ? (r.height - chh) / 2 : Math.min(0, Math.max(r.height - chh, ty));
  };
  const apply = () => {
    clamp();
    card.style.width = `${w * fit * z + 2 * PAD}px`;
    card.style.height = `${h * fit * z + 2 * PAD}px`;
    card.style.transform = `translate(${tx}px, ${ty}px)`;
    zoomLabel.textContent = `${Math.round(z * 100)} %`;
  };
  /** Zoom vers un point (coordonnées dans la scène). */
  const zoomAt = (nz: number, px: number, py: number) => {
    nz = Math.min(MAXZ, Math.max(1, nz));
    const k = nz / z;
    tx = px - (px - tx) * k;
    ty = py - (py - ty) * k;
    z = nz;
    apply();
  };
  const center = () => {
    const r = stage.getBoundingClientRect();
    return [r.width / 2, r.height / 2] as const;
  };
  size();
  apply();
  const onResize = () => {
    size();
    apply();
  };
  addEventListener('resize', onResize);

  // Gestes (Pointer Events)
  const pts = new Map<number, { x: number; y: number }>();
  let startDist = 0, startZ = 1, lastTap = 0, moved = false;
  const local = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, local(e));
    moved = false;
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      startDist = Math.hypot(a.x - b.x, a.y - b.y);
      startZ = z;
    }
  });
  stage.addEventListener('pointermove', (e) => {
    const prev = pts.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    if (pts.size === 1) {
      if (Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y) > 2) moved = true;
      tx += p.x - prev.x;
      ty += p.y - prev.y;
      pts.set(e.pointerId, p);
      apply();
    } else if (pts.size === 2) {
      pts.set(e.pointerId, p);
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      moved = true;
      zoomAt(startZ * (d / Math.max(1, startDist)), (a.x + b.x) / 2, (a.y + b.y) / 2);
    }
  });
  const up = (e: PointerEvent) => {
    const p = pts.get(e.pointerId);
    pts.delete(e.pointerId);
    if (pts.size === 1) {
      // reprend le déplacement à un doigt sans saut
      const [id] = [...pts.keys()];
      startDist = 0;
      pts.set(id, pts.get(id)!);
    }
    if (p && !moved && e.pointerType !== 'mouse') {
      const now = performance.now();
      if (now - lastTap < 300) {
        zoomAt(z > 1.2 ? 1 : 2.5, p.x, p.y);
        lastTap = 0;
      } else lastTap = now;
    }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('dblclick', (e) => {
    const r = stage.getBoundingClientRect();
    zoomAt(z > 1.2 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top);
  });
  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoomAt(z * Math.exp(-e.deltaY / 400), e.clientX - r.left, e.clientY - r.top);
    },
    { passive: false },
  );

  const close = () => {
    if (closed) return;
    closed = true;
    removeEventListener('resize', onResize);
    document.removeEventListener('keydown', onKey, true);
    app.inert = false;
    document.documentElement.classList.remove('has-overlay');
    layer.remove();
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') requestCloseOverlay();
    else if (e.key === '+' || e.key === '=') zoomAt(z * 1.5, ...center());
    else if (e.key === '-') zoomAt(z / 1.5, ...center());
    else if (e.key === '0') zoomAt(1, ...center());
    else if (e.key === 'Tab') {
      const f = [...layer.querySelectorAll<HTMLElement>('button')];
      const i = f.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  };
  document.addEventListener('keydown', onKey, true);
  layer.addEventListener('click', (e) => {
    const act = (e.target as Element).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'close') requestCloseOverlay();
    else if (act === 'in') zoomAt(z * 1.5, ...center());
    else if (act === 'out') zoomAt(z / 1.5, ...center());
    else if (act === 'reset') zoomAt(1, ...center());
  });
  layer.querySelector<HTMLElement>('[data-act="close"]')!.focus();
}
