/**
 * Calculatrice-brouillon de l'entraînement : panneau non modal (bas de l'écran sur téléphone,
 * latéral sur grand écran). Les lignes restent visibles (« raisonnement ») : saisie à gauche,
 * résultat à droite, croix pour supprimer. Toucher la saisie d'une ligne la recopie, toucher son
 * résultat l'insère. « Insérer » copie le dernier résultat dans la case réponse.
 * Historique : propre à l'exercice (vidé à l'exercice suivant), gardé si l'on ferme/rouvre ou tourne l'écran.
 */
import { calc, insertText, type Val } from '../calc/engine';
import { pushOverlay, requestCloseOverlay } from '../../nav';
import { onSettings } from '../../store';
import { icon } from '../../icons';

interface Line { src: string; expr: string; text: string; approx: boolean; v: SVal }
type SVal = { q: [string, string] } | { f: number };
const toS = (v: Val): SVal => ('q' in v ? { q: [String(v.q[0]), String(v.q[1])] } : { f: v.f });
const fromS = (v: SVal): Val => ('q' in v ? { q: [BigInt(v.q[0]), BigInt(v.q[1])] } : { f: v.f });
interface Saved { key: string; lines: Line[]; ans: SVal | null; draft: string }
const SKEY = 'compendium-maths.calc';
const TRIG_KEY = 'compendium-maths.calc.trig';
const HKEY = 'compendium-maths.calc.h';

const K = (k: string, label: string, aria: string, cls = '') => `<button type="button" class="calc-key ${cls}" data-k="${k}" aria-label="${aria}">${label}</button>`;
const TRIG = [K('sin(', 'sin', 'sinus'), K('cos(', 'cos', 'cosinus'), K('tan(', 'tan', 'tangente'), K('sin⁻¹(', 'sin⁻¹', 'arc sinus (inverse du sinus)'), K('cos⁻¹(', 'cos⁻¹', 'arc cosinus'), K('tan⁻¹(', 'tan⁻¹', 'arc tangente')].join('');
const KEYS = [
  K('trig', '<span class="calc-trig-l">sin<br>cos</span>', 'Touches de trigonométrie', 'calc-fn calc-trigbtn'), K('(', '(', 'Parenthèse ouvrante', 'calc-op'), K(')', ')', 'Parenthèse fermante', 'calc-op'),
  K('√(', '√', 'Racine carrée', 'calc-op calc-big'), K('²', 'x²', 'Au carré', 'calc-op calc-big'), K('del', '⌫', 'Effacer le dernier caractère', 'calc-fn'),
  K('7', '7', '7'), K('8', '8', '8'), K('9', '9', '9'), K('÷', '÷', 'Divisé par', 'calc-op'), K('^', 'xⁿ', 'Puissance', 'calc-op'), K('ac', 'AC', 'Effacer la saisie', 'calc-fn'),
  K('4', '4', '4'), K('5', '5', '5'), K('6', '6', '6'), K('×', '×', 'Fois', 'calc-op'), K('π', 'π', 'Pi', 'calc-op'), K('Ans', 'Ans', 'Résultat précédent', 'calc-op calc-ans'),
  K('1', '1', '1'), K('2', '2', '2'), K('3', '3', '3'), K('−', '−', 'Moins', 'calc-op'), K('=', '=', 'Calculer et ajouter la ligne', 'calc-eq'),
  K('0', '0', '0', 'calc-zero'), K(',', ',', 'Virgule', 'calc-op'), K('+', '+', 'Plus', 'calc-op'),
].join('');

export interface CalcHandle {
  /** Nouvel exercice (ou le même, après un retour) : clé, calculatrice permise ou non. */
  setExercise(key: string, allowed: boolean): void;
  /** Masque le bouton (bilan de série…). */
  disable(): void;
  isOpen(): boolean;
  destroy(): void;
}

export function attachCalc(root: HTMLElement, opts: { trigDefault: boolean; enabled: () => boolean }): CalcHandle {
  const btn = root.querySelector<HTMLButtonElement>('[data-act="calc"]')!;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const panel = document.createElement('section');
  panel.className = 'calc';
  panel.id = 'calc-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'calc-t');
  panel.innerHTML = `
    <div class="calc-grip" role="slider" tabindex="0" aria-label="Hauteur de la calculatrice" aria-valuemin="25" aria-valuemax="90" aria-valuenow="50"><span></span></div>
    <header class="calc-head">
      <h2 id="calc-t" class="calc-title">${icon('calc')}<span>Calculatrice</span></h2>
      <button type="button" class="calc-hbtn" data-c="insert" disabled>Insérer</button>
      <button type="button" class="calc-hbtn" data-c="clear">Effacer tout</button>
      <button type="button" class="calc-hbtn calc-x" data-c="keys" aria-pressed="true" aria-label="Afficher le pavé de touches">${icon('chevronDown')}</button>
      <button type="button" class="calc-hbtn calc-x" data-c="close" aria-label="Fermer la calculatrice">${icon('close')}</button>
    </header>
    <div class="calc-hist-wrap">
      <ol class="calc-hist" aria-label="Lignes de calcul"></ol>
      <p class="calc-empty">Tape un calcul puis « = ». Touche le résultat d’une ligne pour le réutiliser, sa saisie pour la modifier.</p>
    </div>
    <div class="calc-entry">
      <input class="calc-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Calcul" aria-describedby="calc-pv" placeholder="ex. 12² − 6²">
      <output class="calc-pv" id="calc-pv" aria-live="polite"></output>
    </div>
    <p class="calc-msg" role="status" aria-live="polite"></p>
    <div class="calc-keys">
      <div class="calc-row-trig" hidden>${TRIG}</div>
      <div class="calc-grid">${KEYS}</div>
    </div>`;
  document.body.appendChild(panel);
  const inp = panel.querySelector<HTMLInputElement>('.calc-input')!;
  const hist = panel.querySelector<HTMLOListElement>('.calc-hist')!;
  const pv = panel.querySelector<HTMLElement>('.calc-pv')!;
  const msg = panel.querySelector<HTMLElement>('.calc-msg')!;
  const insBtn = panel.querySelector<HTMLButtonElement>('[data-c="insert"]')!;
  const trigRow = panel.querySelector<HTMLElement>('.calc-row-trig')!;
  const grip = panel.querySelector<HTMLElement>('.calc-grip')!;
  if (coarse) inp.inputMode = 'none'; // pas de clavier du téléphone : le pavé suffit

  let key = '', allowed = false, open = false, lines: Line[] = [], ans: Val | null = null;
  const lastFocus: { el: HTMLInputElement | null } = { el: null };

  // ------------------------------------------------------------ mémoire (session)
  const save = () => { try { sessionStorage.setItem(SKEY, JSON.stringify({ key, lines, ans: ans ? toS(ans) : null, draft: inp.value } satisfies Saved)); } catch { /* */ } };
  const load = (k: string): Saved | null => { try { const s = JSON.parse(sessionStorage.getItem(SKEY) || 'null') as Saved | null; return s && s.key === k ? s : null; } catch { return null; } };

  // ------------------------------------------------------------ trigonométrie
  const trigOn = () => { const v = localStorage.getItem(TRIG_KEY); return v === null ? opts.trigDefault : v === '1'; };
  const drawTrig = () => { const on = trigOn(); trigRow.hidden = !on; panel.querySelector('.calc-trigbtn')!.setAttribute('aria-pressed', String(on)); if (open) floor(); };

  // ------------------------------------------------------------ hauteur (téléphone)
  const setH = (vh: number) => { vh = Math.max(25, Math.min(90, Math.round(vh))); panel.style.setProperty('--calc-h', vh + 'dvh'); grip.setAttribute('aria-valuenow', String(vh)); grip.setAttribute('aria-valuetext', `${vh} % de l’écran`); try { localStorage.setItem(HKEY, String(vh)); } catch { /* */ } pad(); };
  /** Hauteur minimale : tout sauf l'historique (qui peut se réduire à rien). */
  const floor = () => {
    let h = 0;
    for (const sel of ['.calc-grip', '.calc-head', '.calc-entry', '.calc-msg', '.calc-keys']) { const e = panel.querySelector<HTMLElement>(sel)!; const cs = getComputedStyle(e); h += e.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }
    const cs = getComputedStyle(panel);
    panel.style.setProperty('--calc-min', Math.ceil(h + parseFloat(cs.paddingBottom) + 2) + 'px');
  };
  const pad = () => {
    // la page garde de la place sous le contenu : on peut faire défiler l'énoncé et la case au-dessus du panneau
    const side = matchMedia('(min-width: 900px)').matches;
    document.documentElement.style.setProperty('--calc-pad', open && !side ? panel.getBoundingClientRect().height + 16 + 'px' : '0px');
  };
  const stored = Number(localStorage.getItem(HKEY)) || 0;
  if (stored) setH(stored);
  let drag: { y: number; h: number } | null = null;
  grip.addEventListener('pointerdown', (e) => { drag = { y: e.clientY, h: panel.getBoundingClientRect().height }; grip.setPointerCapture(e.pointerId); e.preventDefault(); });
  grip.addEventListener('pointermove', (e) => { if (drag) setH(((drag.h + drag.y - e.clientY) / innerHeight) * 100); });
  grip.addEventListener('pointerup', () => (drag = null));
  grip.addEventListener('keydown', (e) => {
    const cur = Number(grip.getAttribute('aria-valuenow'));
    if (e.key === 'ArrowUp') { setH(cur + 5); e.preventDefault(); }
    if (e.key === 'ArrowDown') { setH(cur - 5); e.preventDefault(); }
  });
  const ro = new ResizeObserver(pad);
  ro.observe(panel);
  const onResize = () => { if (open) floor(); pad(); };
  addEventListener('resize', onResize);

  // ------------------------------------------------------------ affichage
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const draw = () => {
    hist.innerHTML = lines.map((l, i) => `
      <li class="calc-line">
        <button type="button" class="calc-l-expr" data-i="${i}" aria-label="Reprendre la saisie ${esc(l.expr)}">${esc(l.expr)}</button>
        <button type="button" class="calc-l-res${l.approx ? ' calc-approx' : ''}" data-i="${i}" aria-label="Utiliser le résultat ${l.approx ? 'environ ' : ''}${esc(l.text)}">${l.approx ? '<span class="calc-ap" aria-hidden="true">≈</span>' : ''}${esc(l.text)}</button>
        <button type="button" class="calc-l-del" data-i="${i}" aria-label="Supprimer la ligne ${esc(l.expr)}">${icon('close')}</button>
      </li>`).join('');
    panel.classList.toggle('calc--empty', !lines.length);
    hist.parentElement!.scrollTop = hist.parentElement!.scrollHeight;
    updInsert();
  };
  const preview = () => {
    const s = inp.value.trim();
    if (!s) return void (pv.textContent = '');
    const r = calc(autoClose(s), ans);
    pv.className = 'calc-pv' + (r.ok ? '' : ' calc-pv--err');
    pv.textContent = r.ok ? `= ${r.shown.approx ? '≈ ' : ''}${r.shown.text}` : '';
  };
  /** Parenthèses ouvertes à la fin (√( … ) : on les ferme, comme une calculatrice. */
  const autoClose = (s: string) => { let d = 0; for (const c of s) { if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') d--; } return d > 0 ? s + ')'.repeat(d) : s; };

  // ------------------------------------------------------------ case réponse cible
  const answerInputs = () => [...document.querySelectorAll<HTMLInputElement>('.pt-exo-host .pt-step:not([hidden]):not(.pt-step--locked) input.pt-input')].filter((x) => !x.disabled);
  const target = (): HTMLInputElement | null => {
    const list = answerInputs();
    if (lastFocus.el && list.includes(lastFocus.el)) return lastFocus.el;
    return list.find((x) => !x.value.trim()) ?? list[0] ?? null;
  };
  const updInsert = () => {
    const t = target();
    const ok = !!t && t.dataset.keys !== 'expr' && lines.length > 0;
    insBtn.disabled = !ok;
    insBtn.title = !t ? 'Pas de case numérique à remplir pour cette question' : t.dataset.keys === 'expr' ? 'Cette case attend une expression' : '';
  };
  const onFocusIn = (e: FocusEvent) => { const x = (e.target as Element).closest?.('input.pt-input') as HTMLInputElement | null; if (x) { lastFocus.el = x; updInsert(); } };
  root.addEventListener('focusin', onFocusIn);
  const mo = new MutationObserver(() => open && updInsert());
  mo.observe(root, { subtree: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'class'], childList: true });

  /** quiet : annonce pour lecteur d'écran seulement (le résultat est déjà dans l'historique). */
  const say = (t: string, err = false, quiet = false) => { msg.textContent = t; msg.classList.toggle('calc-msg--err', err); msg.classList.toggle('calc-msg--sr', quiet); };
  const insertAt = (s: string) => {
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
    inp.setRangeText(s, a, b, 'end');
    preview();
    save();
  };
  const equals = () => {
    const raw = inp.value.trim();
    if (!raw) return;
    const r = calc(autoClose(raw), ans);
    if (!r.ok) { say(r.error, true); return; }
    lines.push({ src: autoClose(raw), expr: r.expr, text: r.shown.text, approx: r.shown.approx, v: toS(r.value) });
    ans = r.value;
    inp.value = '';
    pv.textContent = '';
    say(`${r.expr} = ${r.shown.approx ? 'environ ' : ''}${r.shown.text}`, false, true);
    draw();
    save();
  };
  const doInsert = () => {
    const t = target(), l = lines[lines.length - 1];
    if (!t || !l) return;
    if (t.dataset.keys === 'expr') return say('Cette case attend une expression : recopie-la à la main.', true);
    const r = insertText(fromS(l.v), { form: t.dataset.form, dp: t.dataset.dp !== undefined ? Number(t.dataset.dp) : undefined, decimalOk: t.dataset.dok === '1' });
    if (!r.text) return say(r.warn ?? 'Impossible d’insérer ce nombre.', true);
    t.value = t.dataset.keys?.startsWith('set') && t.value.trim() ? `${t.value.trim()} ; ${r.text}` : r.text;
    t.dispatchEvent(new Event('input', { bubbles: true }));
    t.classList.add('pt-input--filled');
    setTimeout(() => t.classList.remove('pt-input--filled'), 900);
    // la case remonte au-dessus du panneau, sans prendre le focus (pas de clavier qui s'ouvre)
    const rc = t.getBoundingClientRect(), top = panel.getBoundingClientRect().top, side = matchMedia('(min-width: 900px)').matches;
    if (!side && rc.bottom > top - 12) window.scrollBy({ top: rc.bottom - top + 24 });
    else if (rc.top < 60) window.scrollBy({ top: rc.top - 80 });
    say(`Inséré : ${r.text}${r.warn ? ' — ' + r.warn : ''}`, !!r.warn);
  };

  // ------------------------------------------------------------ événements
  panel.addEventListener('pointerdown', (e) => { if ((e.target as Element).closest('.calc-key')) e.preventDefault(); }); // le focus reste dans la saisie
  panel.addEventListener('click', (e) => {
    const t = e.target as Element;
    const k = t.closest<HTMLElement>('[data-k]')?.dataset.k;
    if (k) {
      say('');
      if (k === '=') return equals();
      if (k === 'del') { const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a; if (a !== b) inp.setRangeText('', a, b, 'end'); else if (a > 0) { const n = /(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|sin\(|cos\(|tan\(|√\(|Ans)$/.exec(inp.value.slice(0, a))?.[0].length ?? 1; inp.setRangeText('', a - n, a, 'end'); } preview(); save(); return; }
      if (k === 'ac') { inp.value = ''; preview(); save(); return; }
      if (k === 'trig') { localStorage.setItem(TRIG_KEY, trigOn() ? '0' : '1'); drawTrig(); return; }
      if (!coarse) inp.focus({ preventScroll: true });
      return insertAt(k);
    }
    const c = t.closest<HTMLElement>('[data-c]')?.dataset.c;
    if (c === 'close') return requestCloseOverlay();
    if (c === 'clear') { lines = []; ans = null; inp.value = ''; preview(); draw(); save(); say('Calculs effacés.'); return; }
    if (c === 'insert') return doInsert();
    if (c === 'keys') return setKeys(panel.classList.contains('calc--nokeys'));
    const li = t.closest<HTMLElement>('[data-i]');
    if (li) {
      const l = lines[Number(li.dataset.i)];
      if (li.classList.contains('calc-l-del')) { lines.splice(Number(li.dataset.i), 1); draw(); save(); say('Ligne supprimée.'); inp.focus({ preventScroll: true }); return; }
      if (li.classList.contains('calc-l-res')) { insertAt(l.text.replace(/\u202f/g, '').replace('−', '-')); say(`Résultat repris : ${l.approx ? '≈ ' : ''}${l.text}`); return; }
      if (li.classList.contains('calc-l-expr')) { inp.value = l.src; preview(); save(); say('Saisie reprise : modifie-la puis « = ».'); return; }
    }
  });
  /** Pavé masqué : le panneau se réduit à l'historique et à la saisie, pour lire l'énoncé. */
  const setKeys = (on: boolean) => {
    panel.classList.toggle('calc--nokeys', !on);
    const b = panel.querySelector<HTMLElement>('[data-c="keys"]')!;
    b.setAttribute('aria-pressed', String(on));
    b.innerHTML = icon(on ? 'chevronDown' : 'up');
    b.setAttribute('aria-label', on ? 'Masquer le pavé (réduire le panneau)' : 'Afficher le pavé de touches');
    floor();
    pad();
  };
  inp.addEventListener('click', () => { if (panel.classList.contains('calc--nokeys') && coarse) setKeys(true); });
  inp.addEventListener('input', () => { say(''); preview(); save(); });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || (e.key === '=' && !e.shiftKey)) { e.preventDefault(); equals(); }
  });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); requestCloseOverlay(); } });

  // ------------------------------------------------------------ ouvrir / fermer
  const show = () => {
    if (open) return;
    open = true;
    (document.activeElement as HTMLElement | null)?.blur?.(); // ferme le clavier de réponse
    panel.hidden = false;
    document.documentElement.classList.add('calc-open');
    btn.setAttribute('aria-expanded', 'true');
    pushOverlay('calc', hide);
    drawTrig();
    draw();
    preview();
    requestAnimationFrame(() => {
      floor();
      // première ouverture : la place de trois lignes de calcul au-dessus du pavé
      if (!localStorage.getItem(HKEY)) { const fl = parseFloat(panel.style.getPropertyValue('--calc-min')); setH((Math.max(fl + 92, Math.min(fl + 140, innerHeight * 0.62)) / innerHeight) * 100); }
      panel.classList.add('calc--in'); pad(); inp.focus({ preventScroll: true }); });
  };
  const hide = () => {
    if (!open) return;
    open = false;
    panel.classList.remove('calc--in');
    panel.hidden = true;
    document.documentElement.classList.remove('calc-open');
    btn.setAttribute('aria-expanded', 'false');
    pad();
    if (document.activeElement === inp || !document.activeElement || document.activeElement === document.body) btn.focus({ preventScroll: true });
  };
  btn.setAttribute('aria-controls', 'calc-panel');
  btn.setAttribute('aria-expanded', 'false');
  const onBtn = () => (open ? requestCloseOverlay() : show());
  btn.addEventListener('click', onBtn);

  let lastOk = false;
  const offSettings = onSettings(() => api.setExercise(key, lastOk));
  const api: CalcHandle = {
    setExercise(k: string, ok: boolean) {
      lastOk = ok;
      allowed = ok && opts.enabled();
      btn.hidden = !allowed;
      if (!allowed && open) requestCloseOverlay();
      if (k !== key) {
        key = k;
        lastFocus.el = null;
        const s = load(k);
        lines = s?.lines ?? [];
        ans = s?.ans ? fromS(s.ans) : null;
        inp.value = s?.draft ?? '';
        say('');
        draw();
        preview();
        save();
      } else updInsert();
    },
    disable() {
      btn.hidden = true;
      if (open) requestCloseOverlay();
    },
    isOpen: () => open,
    destroy() {
      hide();
      offSettings();
      ro.disconnect();
      mo.disconnect();
      removeEventListener('resize', onResize);
      root.removeEventListener('focusin', onFocusIn);
      btn.removeEventListener('click', onBtn);
      panel.remove();
      document.documentElement.style.removeProperty('--calc-pad');
    },
  };
  return api;
}
