/**
 * Rangement de cartes : glisser-déposer au doigt et à la souris (Pointer Events, sans bibliothèque),
 * boutons ↑↓, « toucher une carte puis une position », clavier (Espace pour saisir/déposer, flèches),
 * annonces pour les lecteurs d'écran.
 *
 * Au doigt, pour ne pas confondre glisser et défiler : la poignée ⠿ démarre le glisser tout de suite ;
 * ailleurs sur la carte, il faut un appui court immobile (APPUI ms) avant de bouger — un mouvement plus
 * rapide reste un défilement normal de la page. Pendant le glisser, la page ne défile pas (touchmove
 * annulé), sauf le défilement automatique près des bords.
 */
import type { OrderAnswer } from '../engine/types';
import { tex } from '../engine/render';

const APPUI = 170; // ms
const SEUIL = 6; // px
let uid = 0;

/** Lecture à voix haute d'une carte : \dfrac{3}{4} → « 3 sur 4 ». */
export function speak(t: string): string {
  return t
    .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, '$1 sur $2')
    .replace(/\{,\}/g, ',')
    .replace(/\\,|\\;|\\!/g, '')
    .replace(/^-|(?<=\s)-/g, 'moins ')
    .replace(/-/g, 'moins ')
    .replace(/[{}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface OrderCtrl {
  get(): number[];
  set(order: number[]): void;
  readonly moved: boolean;
  mark(wrong: number[] | 'ok' | null): void;
  destroy(): void;
}

export function orderHtml(a: OrderAnswer, id: string): string {
  const asc = a.dir === 'asc';
  const top = asc ? 'Plus petit' : 'Plus grand', bot = asc ? 'Plus grand' : 'Plus petit';
  return `<div class="po" data-dir="${a.dir}">
    <p class="po-end po-end--top" aria-hidden="true"><span class="po-arrow">▲</span> ${top}</p>
    <ol class="po-list" id="${id}-list" aria-label="Cartes à ranger, de haut en bas : du ${top.toLowerCase()} au ${bot.toLowerCase()}" aria-describedby="${id}-help">
      ${a.items.map((t, i) => card(t, i)).join('')}
    </ol>
    <p class="po-end po-end--bot" aria-hidden="true"><span class="po-arrow">▼</span> ${bot}</p>
    <p class="po-help" id="${id}-help">Au clavier : Espace pour saisir une carte, flèches pour la déplacer, Espace pour la déposer.</p>
    <div class="sr-only po-live" aria-live="assertive"></div>
  </div>`;
}
const card = (t: string, i: number) =>
  `<li class="po-card" data-item="${i}" tabindex="0" aria-roledescription="carte déplaçable" aria-label="${speak(t)}">
    <span class="po-grip" aria-hidden="true"><svg viewBox="0 0 12 20" width="12" height="20"><g fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></g></svg></span>
    <span class="po-val">${tex(t, true)}</span>
    <span class="po-mark" aria-hidden="true"></span>
    <span class="po-btns"><button type="button" class="po-mv" data-mv="-1" aria-label="Monter ${speak(t)}">↑</button><button type="button" class="po-mv" data-mv="1" aria-label="Descendre ${speak(t)}">↓</button></span>
  </li>`;

export function mountOrder(root: HTMLElement, a: OrderAnswer, onChange: (order: number[]) => void): OrderCtrl {
  const list = root.querySelector<HTMLOListElement>('.po-list')!;
  const live = root.querySelector<HTMLElement>('.po-live')!;
  const n = a.items.length;
  const cards = () => [...list.querySelectorAll<HTMLLIElement>(':scope > .po-card')];
  const order = () => cards().map((c) => Number(c.dataset.item));
  const locked = () => !!root.closest('.pt-step--locked');
  const name = (c: HTMLElement) => speak(a.items[Number(c.dataset.item)]);
  let moved = false;
  let moving = false; // déplacement DOM en cours : la perte de focus qu'il provoque n'est pas un abandon
  let selected: HTMLLIElement | null = null;
  let grabbed: { el: HTMLLIElement; from: number } | null = null;
  const say = (s: string) => {
    live.textContent = '';
    requestAnimationFrame(() => (live.textContent = s));
  };
  const buzz = (ms: number) => {
    try {
      navigator.vibrate?.(ms);
    } catch {
      /* rien */
    }
  };
  const refresh = () => {
    cards().forEach((c, k) => {
      c.setAttribute('aria-posinset', String(k + 1));
      c.setAttribute('aria-setsize', String(n));
      (c.querySelector('[data-mv="-1"]') as HTMLButtonElement).toggleAttribute('data-edge', k === 0);
      (c.querySelector('[data-mv="1"]') as HTMLButtonElement).toggleAttribute('data-edge', k === n - 1);
    });
  };
  const changed = () => {
    moved = true;
    refresh();
    mark(null);
    onChange(order());
  };
  /** Déplace une carte à l'index « to », avec une animation FLIP courte. */
  const moveTo = (el: HTMLLIElement, to: number, animate = true) => {
    const all = cards();
    const from = all.indexOf(el);
    to = Math.max(0, Math.min(n - 1, to));
    if (from === to || from < 0) return false;
    const before = new Map(all.map((c) => [c, c.getBoundingClientRect().top]));
    const rest = all.filter((c) => c !== el);
    const hadFocus = el.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
    moving = true;
    list.insertBefore(el, rest[to] ?? null);
    hadFocus?.focus({ preventScroll: true });
    moving = false;
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches)
      for (const c of all) {
        const d = before.get(c)! - c.getBoundingClientRect().top;
        if (!d) continue;
        c.style.transition = 'none';
        c.style.transform = `translateY(${d}px)`;
        void c.offsetHeight;
        c.style.transition = '';
        c.style.transform = '';
      }
    return true;
  };
  const announcePos = (el: HTMLElement) => say(`${name(el)} : position ${cards().indexOf(el as HTMLLIElement) + 1} sur ${n}.`);
  const select = (el: HTMLLIElement | null) => {
    selected?.classList.remove('po-card--sel');
    selected?.removeAttribute('aria-pressed');
    selected = el;
    if (el) {
      el.classList.add('po-card--sel');
      el.setAttribute('aria-pressed', 'true');
      say(`${name(el)} choisie. Touche la carte dont elle doit prendre la place.`);
    }
  };

  // ------------------------------------------------------------ boutons ↑↓ et toucher-placer
  list.addEventListener('click', (e) => {
    if (locked()) return;
    const t = e.target as Element;
    const b = t.closest<HTMLButtonElement>('.po-mv');
    const c = t.closest<HTMLLIElement>('.po-card');
    if (!c) return;
    if (b) {
      const k = cards().indexOf(c) + Number(b.dataset.mv);
      if (moveTo(c, k)) {
        changed();
        announcePos(c);
        // le focus suit la carte (l'autre bouton si on arrive au bord)
        const k2 = cards().indexOf(c);
        const keep = c.querySelector<HTMLButtonElement>(`[data-mv="${b.dataset.mv}"]`)!;
        (k2 === 0 || k2 === n - 1 ? (keep.hasAttribute('data-edge') ? c.querySelector<HTMLButtonElement>(`[data-mv="${-Number(b.dataset.mv)}"]`)! : keep) : keep).focus({ preventScroll: true });
      }
      select(null);
      return;
    }
    if (justDragged) return;
    if (!selected) return select(c);
    if (selected === c) return select(null);
    const s = selected;
    select(null);
    if (moveTo(s, cards().indexOf(c))) {
      changed();
      announcePos(s);
      buzz(8);
    }
  });

  // ------------------------------------------------------------ clavier
  list.addEventListener('keydown', (e) => {
    const c = (e.target as Element).closest<HTMLLIElement>('.po-card');
    if (!c || (e.target as Element).closest('.po-mv') || locked()) return;
    const k = cards().indexOf(c);
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (grabbed?.el === c) {
        grabbed = null;
        c.classList.remove('po-card--grab');
        c.removeAttribute('aria-grabbed');
        say(`${name(c)} déposée en position ${k + 1} sur ${n}.`);
      } else {
        grabbed = { el: c, from: k };
        c.classList.add('po-card--grab');
        c.setAttribute('aria-grabbed', 'true');
        say(`${name(c)} saisie, position ${k + 1} sur ${n}. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.`);
      }
      return;
    }
    if (e.key === 'Escape' && grabbed?.el === c) {
      e.preventDefault();
      if (moveTo(c, grabbed.from)) changed();
      grabbed = null;
      c.classList.remove('po-card--grab');
      say(`Déplacement annulé : ${name(c)} revient en position ${cards().indexOf(c) + 1}.`);
      c.focus();
      return;
    }
    const dir = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    if (grabbed?.el === c) {
      if (moveTo(c, k + dir)) {
        changed();
        announcePos(c);
      }
      c.focus({ preventScroll: true });
      c.scrollIntoView({ block: 'nearest' });
    } else cards()[k + dir]?.focus();
  });
  list.addEventListener('focusout', (e) => {
    const c = (e.target as Element).closest<HTMLLIElement>('.po-card');
    if (!moving && c && grabbed?.el === c && !c.contains(e.relatedTarget as Node)) {
      grabbed = null;
      c.classList.remove('po-card--grab');
      c.removeAttribute('aria-grabbed');
    }
  });

  // ------------------------------------------------------------ glisser (Pointer Events)
  let drag: null | {
    el: HTMLLIElement;
    id: number;
    x0: number;
    y0: number;
    s0: number;
    on: boolean;
    touch: boolean;
    timer: number;
    ready: boolean;
    from: number;
    tops: number[];
    h: number;
    step: number;
    to: number;
    y: number;
    raf: number;
  } = null;
  let justDragged = false;
  const pageTop = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--appbar-h')) || 56) + 8;

  const start = () => {
    const d = drag!;
    d.on = true;
    const all = cards();
    d.from = all.indexOf(d.el);
    d.tops = all.map((c) => c.getBoundingClientRect().top + scrollY);
    d.h = d.el.getBoundingClientRect().height;
    d.step = n > 1 ? (d.tops[1] - d.tops[0]) : d.h;
    d.to = d.from;
    select(null);
    d.el.classList.add('po-card--drag');
    list.classList.add('po-list--drag');
    document.documentElement.classList.add('po-dragging');
    try {
      d.el.setPointerCapture(d.id);
    } catch {
      /* rien */
    }
    buzz(10);
    say(`${name(d.el)} saisie.`);
    const loop = () => {
      if (!drag?.on) return;
      const top = pageTop(), bot = innerHeight - 48;
      const v = drag.y < top + 40 ? -Math.min(18, (top + 40 - drag.y) / 3 + 2) : drag.y > bot - 40 ? Math.min(18, (drag.y - bot + 40) / 3 + 2) : 0;
      if (v) {
        const before = scrollY;
        scrollTo(0, scrollY + v);
        if (scrollY !== before) follow();
      }
      drag.raf = requestAnimationFrame(loop);
    };
    d.raf = requestAnimationFrame(loop);
  };
  const follow = () => {
    const d = drag!;
    const dy = d.y + scrollY - (d.y0 + d.s0);
    d.el.style.transform = `translateY(${dy}px) scale(1.03)`;
    const center = d.tops[d.from] + d.h / 2 + dy;
    let to = 0;
    d.tops.forEach((t, k) => {
      if (k !== d.from && t + d.h / 2 < center) to++;
    });
    if (to !== d.to) {
      d.to = to;
      buzz(4);
    }
    cards().forEach((c, k) => {
      if (c === d.el) return;
      const shift = d.from < k && k <= to ? -d.step : to <= k && k < d.from ? d.step : 0;
      c.style.transform = shift ? `translateY(${shift}px)` : '';
    });
  };
  const end = (commit: boolean) => {
    const d = drag;
    drag = null;
    if (!d) return;
    clearTimeout(d.timer);
    d.el.classList.remove('po-card--press');
    if (!d.on) return;
    cancelAnimationFrame(d.raf);
    justDragged = true;
    setTimeout(() => (justDragged = false), 50);
    const vis = d.el.getBoundingClientRect().top;
    const all = cards();
    all.forEach((c) => {
      c.style.transition = 'none';
      c.style.transform = '';
    });
    const to = commit ? d.to : d.from;
    if (to !== d.from) {
      const rest = all.filter((c) => c !== d.el);
      list.insertBefore(d.el, rest[to] ?? null);
    }
    const now = d.el.getBoundingClientRect().top;
    d.el.style.transform = `translateY(${vis - now}px)`;
    void d.el.offsetHeight;
    all.forEach((c) => (c.style.transition = ''));
    d.el.classList.remove('po-card--drag');
    d.el.style.transform = '';
    list.classList.remove('po-list--drag');
    document.documentElement.classList.remove('po-dragging');
    buzz(6);
    if (to !== d.from) {
      changed();
      say(`${name(d.el)} déposée en position ${to + 1} sur ${n}.`);
    } else say(`${name(d.el)} reste en position ${to + 1}.`);
  };

  list.addEventListener('pointerdown', (e) => {
    if (locked() || drag || e.button > 0) return;
    const t = e.target as Element;
    if (t.closest('.po-mv')) return;
    const el = t.closest<HTMLLIElement>('.po-card');
    if (!el) return;
    const touch = e.pointerType !== 'mouse';
    const onGrip = !!t.closest('.po-grip');
    drag = { el, id: e.pointerId, x0: e.clientX, y0: e.clientY, s0: scrollY, on: false, touch, timer: 0, ready: !touch || onGrip, from: 0, tops: [], h: 0, step: 0, to: 0, y: e.clientY, raf: 0 };
    if (!drag.ready) {
      drag.timer = window.setTimeout(() => {
        if (!drag || drag.on) return;
        drag.ready = true;
        drag.el.classList.add('po-card--press');
        buzz(8);
      }, APPUI);
    }
  });
  list.addEventListener('pointermove', (e) => {
    const d = drag;
    if (!d || e.pointerId !== d.id) return;
    d.y = e.clientY;
    const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0);
    if (!d.on) {
      if (dist < SEUIL) return;
      if (!d.ready) {
        // mouvement avant la fin de l'appui : c'est un défilement
        clearTimeout(d.timer);
        drag = null;
        return;
      }
      start();
    }
    e.preventDefault();
    follow();
  });
  list.addEventListener('pointerup', (e) => drag && e.pointerId === drag.id && end(true));
  list.addEventListener('pointercancel', (e) => drag && e.pointerId === drag.id && end(false));
  // la capture passe de la poignée à la carte : seule la perte de capture par la carte termine le glisser
  list.addEventListener('lostpointercapture', (e) => drag?.on && e.pointerId === drag.id && e.target === drag.el && end(true));
  // au doigt : une fois l'appui reconnu, la page ne défile plus
  const tm = (e: TouchEvent) => {
    if (drag && (drag.on || drag.ready) && e.cancelable) e.preventDefault();
  };
  list.addEventListener('touchmove', tm, { passive: false });
  list.addEventListener('contextmenu', (e) => {
    if ((e.target as Element).closest('.po-card')) e.preventDefault();
  });

  const mark = (wrong: number[] | 'ok' | null) => {
    cards().forEach((c, k) => {
      const bad = Array.isArray(wrong) && wrong.includes(k);
      const ok = wrong === 'ok';
      c.classList.toggle('po-card--ko', bad);
      c.classList.toggle('po-card--ok', ok);
      const m = c.querySelector<HTMLElement>('.po-mark')!;
      m.textContent = bad ? '✗' : ok ? '✓' : '';
      c.setAttribute('aria-label', `${name(c)}${bad ? ', mal placée' : ok ? ', bien placée' : ''}`);
    });
  };
  refresh();
  return {
    get: order,
    set(o: number[]) {
      if (o.length !== n) return;
      const byItem = new Map(cards().map((c) => [Number(c.dataset.item), c]));
      for (const i of o) list.appendChild(byItem.get(i)!);
      moved = o.some((v, k) => v !== k);
      refresh();
    },
    get moved() {
      return moved;
    },
    mark,
    destroy() {
      if (drag) end(false);
      list.removeEventListener('touchmove', tm);
    },
  };
}
export const _uid = () => ++uid;
