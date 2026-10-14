/**
 * Clavier unifié de l'entraînement (v0.10) : un seul panneau ancré en bas de l'écran (colonne de droite sur
 * grand écran). En bas, les touches de réponse propres à la case (chiffres, virgule, signe, fraction, x…) ;
 * le bouton « Calculatrice » de la barre déplie au-dessus l'historique, la ligne de calcul et les opérateurs.
 *
 * Un seul « destinataire » à la fois, toujours visible : la case réponse active ou la ligne de calcul
 * (contour épais + étiquette « Touches → … » dans la barre, annoncée aux lecteurs d'écran). On bascule en
 * touchant l'une ou l'autre. « → Réponse » envoie un résultat dans la case active, mis au format attendu
 * (virgule, arrondi demandé avec mention, fraction exacte) ; rien n'est validé automatiquement.
 * Pendant le calcul, un résumé de l'énoncé (avec la figure en miniature) reste épinglé en haut.
 */
import { calc, insertText, type Val } from '../calc/engine';
import { keypadOn } from '../engine/stats';
import { pushOverlay, requestCloseOverlay } from '../../nav';
import { onSettings } from '../../store';
import { icon } from '../../icons';

interface Line { src: string; expr: string; text: string; approx: boolean; v: SVal }
type SVal = { q: [string, string] } | { f: number };
const toS = (v: Val): SVal => ('q' in v ? { q: [String(v.q[0]), String(v.q[1])] } : { f: v.f });
const fromS = (v: SVal): Val => ('q' in v ? { q: [BigInt(v.q[0]), BigInt(v.q[1])] } : { f: v.f });
interface Saved { key: string; lines: Line[]; ans: SVal | null; draft: string; open?: boolean }
const SKEY = 'compendium-maths.calc';
const TRIG_KEY = 'compendium-maths.calc.trig';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const B = (k: string, label: string, aria: string, cls = '') => `<button type="button" tabindex="-1" class="kp-key ${cls}" data-k="${k}" aria-label="${aria}">${label}</button>`;
const C = (k: string, label: string, aria: string, cls = '') => `<button type="button" tabindex="-1" class="calc-key ${cls}" data-k="${k}" aria-label="${aria}">${label}</button>`;
const DIG = (d: string) => B(d, d, d);
const DEL = B('del', '⌫', 'Effacer', 'kp-fn');
const OK = B('ok', 'OK', 'Valider la réponse', 'kp-ok');
const VAR = (v: string) => B(v, v, `Lettre ${v}`, 'kp-var');

/** Touches de réponse selon la case (data-keys). */
function answerKeys(mode: string, v: string): { cols: number; html: string } {
  if (mode === 'expr') {
    return { cols: 5, html: [DIG('7'), DIG('8'), DIG('9'), B('(', '(', 'Parenthèse ouvrante', 'kp-op'), B(')', ')', 'Parenthèse fermante', 'kp-op'),
      DIG('4'), DIG('5'), DIG('6'), B('+', '+', 'Plus', 'kp-op'), B('-', '−', 'Moins', 'kp-op'),
      DIG('1'), DIG('2'), DIG('3'), B('×', '×', 'Fois', 'kp-op'), B('²', '■²', 'Au carré', 'kp-op'),
      DIG('0'), B(',', ',', 'Virgule', 'kp-op'), VAR(v), DEL, OK].join('') };
  }
  const semi = B(';', ';', 'Point-virgule (solution suivante)', 'kp-op'), root = B('√', '√', 'Racine carrée', 'kp-op');
  const extra = mode === 'set' ? semi : mode === 'sqrt' || mode === 'setsqrt' ? root : '<span class="kp-key kp-empty"></span>';
  return { cols: 4, html: [DIG('7'), DIG('8'), DIG('9'), DEL,
    DIG('4'), DIG('5'), DIG('6'), B('-', '−', 'Moins', 'kp-op'),
    DIG('1'), DIG('2'), DIG('3'), mode === 'setsqrt' ? semi : B('/', '/', 'Barre de fraction', 'kp-op'),
    DIG('0'), B(',', ',', 'Virgule', 'kp-op'), extra, OK].join('') };
}
const CALC_GRID = [
  C('7', '7', '7'), C('8', '8', '8'), C('9', '9', '9'), C('÷', '÷', 'Divisé par', 'calc-op'), C('del', '⌫', 'Effacer le dernier caractère', 'calc-fn'),
  C('4', '4', '4'), C('5', '5', '5'), C('6', '6', '6'), C('×', '×', 'Fois', 'calc-op'), C('ac', 'AC', 'Effacer le calcul', 'calc-fn'),
  C('1', '1', '1'), C('2', '2', '2'), C('3', '3', '3'), C('−', '−', 'Moins', 'calc-op'), C('Ans', 'Ans', 'Résultat précédent', 'calc-op calc-ans'),
  C('0', '0', '0'), C(',', ',', 'Virgule', 'calc-op'), C('π', 'π', 'Pi', 'calc-op'), C('+', '+', 'Plus', 'calc-op'), C('=', '=', 'Calculer et ajouter la ligne', 'calc-eq'),
].join('');
const CALC_OPS = [
  C('trig', '<span class="calc-trig-l">sin<br>cos</span>', 'Touches de trigonométrie', 'calc-fn calc-trigbtn'), C('(', '(', 'Parenthèse ouvrante', 'calc-op'), C(')', ')', 'Parenthèse fermante', 'calc-op'),
  C('√(', '√', 'Racine carrée', 'calc-op calc-big'), C('²', 'x²', 'Au carré', 'calc-op calc-big'), C('^', 'xⁿ', 'Puissance', 'calc-op'),
].join('');
const TRIG = [C('sin(', 'sin', 'sinus'), C('cos(', 'cos', 'cosinus'), C('tan(', 'tan', 'tangente'), C('sin⁻¹(', 'sin⁻¹', 'arc sinus (inverse du sinus)'), C('cos⁻¹(', 'cos⁻¹', 'arc cosinus'), C('tan⁻¹(', 'tan⁻¹', 'arc tangente')].join('');
const RANK = ['à l’unité', 'au dixième', 'au centième', 'au millième'];

export interface DockHandle {
  /** Nouvel exercice (ou le même) : clé, calculatrice permise par la politique du type. */
  setExercise(key: string, allowed: boolean): void;
  /** Bilan de série : plus de clavier. */
  disable(): void;
  isOpen(): boolean;
  destroy(): void;
}

export function attachDock(root: HTMLElement, opts: { trigDefault: boolean; enabled: () => boolean; onSubmit: (inp: HTMLInputElement) => void }): DockHandle {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const dock = document.createElement('section');
  dock.className = 'dock';
  dock.hidden = true;
  dock.setAttribute('aria-label', 'Clavier');
  dock.innerHTML = `
    <div class="dock-calc" id="calc-panel" role="group" aria-label="Calculatrice" hidden>
      <div class="calc-hist-wrap"><ol class="calc-hist" aria-label="Lignes de calcul"></ol>
        <p class="calc-empty">Tape un calcul puis « = ». « → Réponse » envoie un résultat dans la case active.</p></div>
      <div class="calc-entry">
        <input class="calc-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="Ligne de calcul" aria-describedby="calc-pv" placeholder="ex. 12² − 6²">
        <output class="calc-pv" id="calc-pv"></output>
        <button type="button" class="calc-send calc-send--cur" data-c="send-cur" tabindex="-1" hidden aria-label="Envoyer le résultat courant vers la réponse">→ Réponse</button>
      </div>
      <p class="calc-msg" role="status" aria-live="polite"></p>
      <div class="calc-ops-wrap"><div class="calc-row-trig" hidden>${TRIG}</div><div class="calc-ops">${CALC_OPS}</div></div>
    </div>
    <div class="dock-bar">
      <span class="dock-to" aria-live="polite"></span>
      <button type="button" class="dock-btn dock-calcbtn" data-act="calc" aria-controls="calc-panel" aria-expanded="false" hidden>${icon('calc')}<span>Calculatrice</span></button>
      <button type="button" class="dock-btn dock-small" data-k="native" tabindex="-1" hidden aria-label="Utiliser le clavier du téléphone" title="Clavier du téléphone">⌨</button>
      <button type="button" class="dock-btn dock-small" data-k="hide" aria-expanded="true" aria-label="Masquer les touches">${icon('chevronDown')}</button>
    </div>
    <div class="dock-keys"><div class="kp-grid" role="group" aria-label="Touches de réponse"></div><div class="calc-grid" role="group" aria-label="Touches de calcul" hidden>${CALC_GRID}</div></div>`;
  document.body.appendChild(dock);
  const $ = <T extends HTMLElement>(s: string) => dock.querySelector<T>(s)!;
  const calcBox = $<HTMLElement>('.dock-calc'), inp = $<HTMLInputElement>('.calc-input'), hist = $<HTMLOListElement>('.calc-hist');
  const pv = $<HTMLElement>('.calc-pv'), msg = $<HTMLElement>('.calc-msg'), sendCur = $<HTMLButtonElement>('.calc-send--cur');
  const toL = $<HTMLElement>('.dock-to'), btn = $<HTMLButtonElement>('[data-act="calc"]'), natBtn = $<HTMLButtonElement>('[data-k="native"]'), hideBtn = $<HTMLButtonElement>('[data-k="hide"]');
  const ansGrid = $<HTMLElement>('.kp-grid'), calcGrid = $<HTMLElement>('.calc-grid'), trigRow = $<HTMLElement>('.calc-row-trig');
  if (coarse) inp.inputMode = 'none';
  const pin = document.createElement('div');
  pin.className = 'pt-pin';
  pin.hidden = true;
  root.querySelector('.appbar')?.after(pin);

  let key = '', allowed = false, open = false, keysHidden = false, disabled = false;
  let lines: Line[] = [], ans: Val | null = null;
  let to: 'answer' | 'calc' = 'answer';
  let answer: HTMLInputElement | null = null; // case réponse active
  let gridMode = '';
  let stmtOff = false; // l'énoncé est sorti de l'écran (on l'épingle en résumé)
  let fresh = false; // premier affichage de l'exercice
  const isSide = () => matchMedia('(min-width: 900px)').matches;
  const side = isSide;

  // ------------------------------------------------------------ mémoire (session)
  const save = () => { try { sessionStorage.setItem(SKEY, JSON.stringify({ key, lines, ans: ans ? toS(ans) : null, draft: inp.value, open } satisfies Saved)); } catch { /* */ } };
  const load = (k: string): Saved | null => { try { const s = JSON.parse(sessionStorage.getItem(SKEY) || 'null') as Saved | null; return s && s.key === k ? s : null; } catch { return null; } };
  const trigOn = () => { const v = localStorage.getItem(TRIG_KEY); return v === null ? opts.trigDefault : v === '1'; };
  const drawTrig = () => { const on = trigOn(); trigRow.hidden = !on; dock.querySelector('.calc-trigbtn')!.setAttribute('aria-pressed', String(on)); };

  // ------------------------------------------------------------ cases réponse
  const inputs = () => [...root.querySelectorAll<HTMLInputElement>('.pt-exo-host .pt-step:not([hidden]):not(.pt-step--locked) input.pt-input')].filter((x) => !x.disabled);
  const fieldName = (x: HTMLInputElement) => {
    const t = (x.getAttribute('aria-label') || 'réponse').replace(/\s+/g, ' ').trim();
    const step = x.closest('.pt-step');
    const all = step ? [...step.querySelectorAll('input.pt-input')] : [];
    return all.length > 1 ? `case ${all.indexOf(x) + 1}/${all.length}${t && t.length < 14 ? ` (${t})` : ''}` : t.length < 18 ? t : 'réponse';
  };
  const ansKeysOn = () => keypadOn() && !!answer && answer.dataset.native !== '1';

  // ------------------------------------------------------------ affichage
  const render = () => {
    const list = inputs();
    if (answer && !list.includes(answer)) answer = null;
    if (!answer) answer = list.find((x) => !x.value.trim()) ?? list[0] ?? null;
    const calcBtn = allowed && opts.enabled() && !disabled;
    if (!calcBtn && open) collapse(true);
    const visible = !disabled && (calcBtn || (!!answer && keypadOn()));
    dock.hidden = !visible;
    btn.hidden = !calcBtn;
    if (!open && to === 'calc') to = 'answer';
    if (!answer && open) to = 'calc';
    // touches
    const mode = answer ? `${answer.dataset.keys || 'num'}:${answer.dataset.v || 'x'}` : '';
    if (mode && mode !== gridMode) { const [m, v] = mode.split(':'); const g = answerKeys(m, v); ansGrid.innerHTML = g.html; ansGrid.style.setProperty('--cols', String(g.cols)); gridMode = mode; }
    const showAns = to === 'answer' && ansKeysOn();
    ansGrid.hidden = !showAns;
    calcGrid.hidden = !(open && to === 'calc');
    $<HTMLElement>('.calc-ops-wrap').hidden = !(open && to === 'calc');
    const anyKeys = !ansGrid.hidden || !calcGrid.hidden;
    $<HTMLElement>('.dock-keys').hidden = keysHidden || !anyKeys;
    hideBtn.hidden = !anyKeys;
    hideBtn.setAttribute('aria-expanded', String(!keysHidden));
    hideBtn.setAttribute('aria-label', keysHidden ? 'Afficher les touches' : 'Masquer les touches');
    hideBtn.innerHTML = icon(keysHidden ? 'up' : 'chevronDown');
    natBtn.hidden = !(coarse && !keysHidden && to === 'answer' && !!answer && keypadOn() && answer.dataset.native !== '1');
    // destinataire
    for (const x of root.querySelectorAll('input.pt-input--to')) x.classList.remove('pt-input--to');
    if (to === 'answer' && answer) answer.classList.add('pt-input--to');
    dock.classList.toggle('dock--to-calc', to === 'calc');
    const name = to === 'calc' ? 'la ligne de calcul' : answer && !(keysHidden && !open) ? fieldName(answer) : '';
    const label = name ? `<span class="dock-vh">Les touches écrivent dans </span><span aria-hidden="true">→ ${name === 'la ligne de calcul' ? 'calcul' : esc(name)}</span>` : answer ? 'Touche une case' : '';
    if (toL.dataset.l !== label) { toL.dataset.l = label; toL.innerHTML = label; }
    dock.classList.toggle('dock--nolabel', !open && !label);
    updSend();
    document.documentElement.classList.toggle('dock-on', visible);
    document.documentElement.classList.toggle('dock-calc', visible && open);
    const wasPin = !pin.hidden;
    pin.hidden = !(visible && !side() && (open || (stmtOff && !keysHidden)));
    if (!pin.hidden && !wasPin) buildPin();
    requestAnimationFrame(pad);
  };
  const pad = () => {
    const side = isSide();
    document.documentElement.style.setProperty('--dock-h', dock.hidden || side ? '0px' : Math.ceil(dock.getBoundingClientRect().height) + 'px');
    document.documentElement.style.setProperty('--pin-h', pin.hidden || side ? '0px' : Math.ceil(pin.getBoundingClientRect().height) + 'px');
  };
  const ro = new ResizeObserver(() => { pad(); if (open && to === 'calc') reveal(answer); });
  ro.observe(dock);
  ro.observe(pin);
  addEventListener('resize', pad);
  /** Bas du bloc énoncé (titre, texte, données, figure) : au-dessus de la barre d'appli → résumé épinglé. */
  const onScroll = () => {
    const ex = root.querySelector('.pt-ex');
    const blocks = ex ? [...ex.querySelectorAll<HTMLElement>('.pt-ex-title, .pt-statement, .pt-display')] : [];
    const top = root.querySelector('.appbar')?.getBoundingClientRect().bottom ?? 56;
    const off = blocks.some((b) => b.getBoundingClientRect().top < top);
    if (off !== stmtOff) { stmtOff = off; render(); }
  };
  addEventListener('scroll', onScroll, { passive: true });

  /** La case active reste visible entre le résumé épinglé et le clavier. */
  const reveal = (x: HTMLElement | null) => requestAnimationFrame(() => {
    if (!x || dock.hidden || matchMedia('(min-width: 900px)').matches) return;
    const r = (x.closest('.pt-field') ?? x).getBoundingClientRect();
    const top = (pin.hidden ? (root.querySelector('.appbar')?.getBoundingClientRect().bottom ?? 56) : pin.getBoundingClientRect().bottom) + 8;
    const bottom = dock.getBoundingClientRect().top - 8;
    if (r.bottom > bottom) window.scrollBy({ top: r.bottom - bottom });
    else if (r.top < top) window.scrollBy({ top: r.top - top });
  });

  const buildPin = () => {
    const ex = root.querySelector('.pt-ex');
    if (!ex) return void (pin.innerHTML = '');
    const parts = ['.pt-ex-title', '.pt-statement', '.pt-display'].map((s) => ex.querySelector(s)?.innerHTML ?? '').filter(Boolean);
    const step = ex.querySelector('.pt-step:not(.pt-step--locked):not([hidden]) .pt-prompt');
    if (step) parts.push(step.innerHTML);
    const fig = ex.querySelector('.pt-figure svg');
    pin.innerHTML = `<button type="button" class="pt-pin-b" aria-expanded="false" aria-label="Énoncé (toucher pour déplier)">${fig ? `<span class="pt-pin-fig">${fig.outerHTML}</span>` : ''}<span class="pt-pin-t">${parts.map((p) => `<span class="pt-pin-p">${p}</span>`).join(' ')}</span></button>`;
    pin.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
  };
  pin.addEventListener('click', () => {
    const b = pin.querySelector('.pt-pin-b');
    if (!b) return;
    const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(on));
    pin.classList.toggle('pt-pin--open', on);
  });

  // ------------------------------------------------------------ calculatrice
  const say = (t: string, err = false, quiet = false) => { msg.textContent = t; msg.classList.toggle('calc-msg--err', err); msg.classList.toggle('calc-msg--sr', quiet); };
  const autoClose = (s: string) => { let d = 0; for (const c of s) { if (c === '(') d++; else if (c === ')') d--; } return d > 0 ? s + ')'.repeat(d) : s; };
  const draw = () => {
    hist.innerHTML = lines.map((l, i) => `
      <li class="calc-line">
        <button type="button" class="calc-l-expr" data-i="${i}" tabindex="-1" aria-label="Reprendre la saisie ${esc(l.expr)}">${esc(l.expr)}</button>
        <button type="button" class="calc-l-res${l.approx ? ' calc-approx' : ''}" data-i="${i}" tabindex="-1" aria-label="Réutiliser le résultat ${l.approx ? 'environ ' : ''}${esc(l.text)}">${l.approx ? '<span class="calc-ap" aria-hidden="true">≈</span>' : ''}${esc(l.text)}</button>
        <button type="button" class="calc-send" data-i="${i}" tabindex="-1" aria-label="Envoyer ${l.approx ? 'environ ' : ''}${esc(l.text)} vers la réponse">→ Réponse</button>
        <button type="button" class="calc-l-del" data-i="${i}" tabindex="-1" aria-label="Supprimer la ligne ${esc(l.expr)}">${icon('close')}</button>
      </li>`).join('');
    calcBox.classList.toggle('calc--empty', !lines.length);
    const w = hist.parentElement!;
    w.scrollTop = w.scrollHeight;
    updSend();
  };
  const current = () => { const s = inp.value.trim(); return s ? calc(autoClose(s), ans) : null; };
  const preview = () => {
    const r = current();
    pv.className = 'calc-pv' + (r && !r.ok ? ' calc-pv--err' : '');
    pv.textContent = r?.ok ? `= ${r.shown.approx ? '≈ ' : ''}${r.shown.text}` : '';
    updSend();
  };
  const updSend = () => {
    const can = !!answer && answer.dataset.keys !== 'expr';
    dock.querySelectorAll<HTMLButtonElement>('.calc-send').forEach((b) => { b.disabled = !can; b.title = !answer ? 'Pas de case réponse à remplir ici' : !can ? 'Cette case attend une expression' : ''; });
    const r = current();
    sendCur.hidden = !(r && r.ok);
  };
  const insertCalc = (s: string) => {
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
    inp.setRangeText(s, a, b, 'end');
    preview();
    save();
  };
  const equals = (): Line | null => {
    const raw = inp.value.trim();
    if (!raw) return null;
    const r = calc(autoClose(raw), ans);
    if (!r.ok) { say(r.error, true); return null; }
    const l: Line = { src: autoClose(raw), expr: r.expr, text: r.shown.text, approx: r.shown.approx, v: toS(r.value) };
    lines.push(l);
    ans = r.value;
    inp.value = '';
    pv.textContent = '';
    say(`${r.expr} = ${r.shown.approx ? 'environ ' : ''}${r.shown.text}`, false, true);
    draw();
    save();
    return l;
  };
  /** Envoie une valeur dans la case réponse active, au format attendu ; la validation reste à l'élève. */
  const send = (l: Line) => {
    const t = answer;
    if (!t) return say('Pas de case réponse à remplir pour cette question.', true);
    if (t.dataset.keys === 'expr') return say('Cette case attend une expression : écris-la à la main.', true);
    const dp = t.dataset.dp !== undefined ? Number(t.dataset.dp) : undefined;
    const v = fromS(l.v);
    const r = insertText(v, { form: t.dataset.form, dp, decimalOk: t.dataset.dok === '1' });
    if (!r.text) return say(r.warn ?? 'Impossible d’envoyer ce nombre.', true);
    let note = r.warn ?? '';
    if (dp !== undefined) {
      const exact = insertText(v, { form: 'decimal' }).text;
      if (l.approx || exact.replace(/,?0+$/, '') !== r.text.replace(/,?0+$/, '')) note = `arrondi ${RANK[dp] ?? `à ${dp} décimales`} (${l.approx ? '≈ ' : ''}${l.text} → ${r.text})`;
    }
    t.value = t.dataset.keys?.startsWith('set') && t.value.trim() ? `${t.value.trim()} ; ${r.text}` : r.text;
    t.dispatchEvent(new Event('input', { bubbles: true }));
    t.classList.add('pt-input--filled');
    setTimeout(() => t.classList.remove('pt-input--filled'), 900);
    setTo('answer', false);
    reveal(t);
    say(`Envoyé dans ${fieldName(t)} : ${r.text}${note ? ` — ${note}` : ''}. Vérifie, puis valide.`, !!r.warn && dp === undefined);
  };

  // ------------------------------------------------------------ destinataire
  const setTo = (w: 'answer' | 'calc', focus = true) => {
    to = w;
    render();
    if (!focus) return;
    if (w === 'calc') inp.focus({ preventScroll: true });
    else if (answer) { answer.focus({ preventScroll: true }); reveal(answer); }
  };

  // ------------------------------------------------------------ ouvrir / replier la calculatrice
  const expand = () => {
    if (open || !allowed) return;
    open = true;
    keysHidden = false;
    calcBox.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    pushOverlay('calc', () => collapse(true));
    drawTrig();
    draw();
    preview();
    buildPin();
    save();
    setTo('calc');
    setTimeout(() => reveal(answer), 80);
  };
  /** silent : déjà retiré de l'historique (bouton Retour) ou exercice sans calculatrice. */
  function collapse(silent = false) {
    if (!open) return;
    if (!silent) return requestCloseOverlay();
    open = false;
    calcBox.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    to = 'answer';
    save();
    render();
    if (document.activeElement === inp) (answer && keypadOn() ? answer : btn).focus({ preventScroll: true });
  }

  // ------------------------------------------------------------ événements
  // le focus ne quitte pas le destinataire ; on note où l'appui a commencé (anti « clic fantôme »)
  let downOn: Element | null = null;
  dock.addEventListener('pointerdown', (e) => { downOn = (e.target as Element).closest('button'); if (downOn) e.preventDefault(); });
  pin.addEventListener('pointerdown', (e) => e.preventDefault());
  const answerKey = (k: string) => {
    const t = answer;
    if (!t) return;
    if (document.activeElement !== t) t.focus({ preventScroll: true });
    if (k === 'ok') return opts.onSubmit(t);
    const a = t.selectionStart ?? t.value.length, z = t.selectionEnd ?? a;
    if (k === 'del') { if (a !== z) t.setRangeText('', a, z, 'end'); else if (a > 0) t.setRangeText('', a - 1, a, 'end'); }
    else t.setRangeText(k === ';' ? ' ; ' : k, a, z, 'end');
    t.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const calcKey = (k: string) => {
    say('');
    if (document.activeElement !== inp && !coarse) inp.focus({ preventScroll: true });
    if (k === '=') return void equals();
    if (k === 'del') { const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a; if (a !== b) inp.setRangeText('', a, b, 'end'); else if (a > 0) { const n = /(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|sin\(|cos\(|tan\(|√\(|Ans)$/.exec(inp.value.slice(0, a))?.[0].length ?? 1; inp.setRangeText('', a - n, a, 'end'); } preview(); save(); return; }
    if (k === 'ac') { inp.value = ''; preview(); save(); return; }
    if (k === 'trig') { localStorage.setItem(TRIG_KEY, trigOn() ? '0' : '1'); drawTrig(); return; }
    insertCalc(k);
  };
  dock.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('[data-act="calc"]')) return open ? collapse() : expand();
    const kb = t.closest<HTMLElement>('[data-k]');
    const pressed = downOn;
    downOn = null;
    // clic synthétisé sur une touche apparue sous le doigt (l'appui a commencé ailleurs, sur la case) : ignoré
    if (kb && e.detail > 0 && pressed !== kb) return;
    if (kb) {
      const k = kb.dataset.k!;
      if (k === 'hide') { keysHidden = !keysHidden; render(); return; }
      if (k === 'native') {
        const a = answer;
        if (!a) return;
        a.dataset.native = '1';
        a.inputMode = 'text';
        a.blur();
        render();
        setTimeout(() => a.focus(), 30);
        return;
      }
      return kb.classList.contains('calc-key') ? calcKey(k) : answerKey(k);
    }
    if (t.closest('[data-c="send-cur"]')) { const l = equals(); if (l) send(l); return; }
    const li = t.closest<HTMLElement>('[data-i]');
    if (li) {
      const i = Number(li.dataset.i), l = lines[i];
      if (li.classList.contains('calc-send')) return send(l);
      if (li.classList.contains('calc-l-del')) { lines.splice(i, 1); draw(); save(); say('Ligne supprimée.'); return; }
      to !== 'calc' && setTo('calc');
      if (li.classList.contains('calc-l-res')) { insertCalc(l.text.replace(/\u202f/g, '').replace('−', '-')); say(`Résultat repris : ${l.approx ? '≈ ' : ''}${l.text}`); return; }
      if (li.classList.contains('calc-l-expr')) { inp.value = l.src; preview(); save(); say('Saisie reprise : modifie-la puis « = ».'); return; }
    }
    if (t.closest('.calc-entry')) setTo('calc');
  });
  inp.addEventListener('focus', () => { if (to !== 'calc') { to = 'calc'; render(); } });
  inp.addEventListener('input', () => { say(''); preview(); save(); });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || (e.key === '=' && !e.shiftKey)) { e.preventDefault(); equals(); } });
  dock.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { e.preventDefault(); collapse(); } });

  const onFocusIn = (e: FocusEvent) => {
    const x = (e.target as Element).closest?.('input.pt-input') as HTMLInputElement | null;
    if (!x) return;
    x.inputMode = keypadOn() && x.dataset.native !== '1' ? 'none' : 'text';
    answer = x;
    to = 'answer';
    keysHidden = false;
    render();
    reveal(x);
  };
  root.addEventListener('focusin', onFocusIn);
  // nouvelle étape, case verrouillée, exercice remonté… : on recalcule
  let pend = 0;
  const mo = new MutationObserver(() => { if (!pend) pend = requestAnimationFrame(() => { pend = 0; render(); if (open) buildPin(); }); });
  mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'class'] });

  let lastOk = false;
  const offSettings = onSettings(() => api.setExercise(key, lastOk));
  const api: DockHandle = {
    setExercise(k: string, ok: boolean) {
      lastOk = ok;
      disabled = false;
      allowed = ok && opts.enabled();
      if (k !== key) {
        key = k;
        answer = null;
        const s = load(k);
        lines = s?.lines ?? [];
        ans = s?.ans ? fromS(s.ans) : null;
        inp.value = s?.draft ?? '';
        say('');
        draw();
        preview();
        if (open && !allowed) collapse(true);
        save();
      }
      render();
      if (open) buildPin();
      if (k === key && fresh) return;
      fresh = true;
      // la case active est sous le clavier au premier affichage : on replie les touches (pas de toucher fantôme)
      setTimeout(() => {
        fresh = false;
        if (!answer || open || dock.hidden || isSide()) return;
        if (answer.getBoundingClientRect().bottom > dock.getBoundingClientRect().top - 4 && document.activeElement !== answer) { keysHidden = true; render(); }
      }, 60);
    },
    disable() { disabled = true; if (open) collapse(); render(); },
    isOpen: () => open,
    destroy() {
      if (open) collapse();
      offSettings();
      ro.disconnect();
      mo.disconnect();
      removeEventListener('resize', pad);
      removeEventListener('scroll', onScroll);
      root.removeEventListener('focusin', onFocusIn);
      dock.remove();
      pin.remove();
      for (const c of ['dock-on', 'dock-calc']) document.documentElement.classList.remove(c);
      document.documentElement.style.removeProperty('--dock-h');
      document.documentElement.style.removeProperty('--pin-h');
    },
  };
  return api;
}
