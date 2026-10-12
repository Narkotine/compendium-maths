/**
 * Clavier mathématique à l'écran : chiffres, virgule, signe moins, barre de fraction, effacer, valider
 * (+ « ; » pour plusieurs solutions, « √ » pour les racines). Les touches ne prennent pas le focus :
 * la case reste active et le clavier du téléphone ne s'ouvre pas (inputmode="none").
 * Un bouton permet de repasser au clavier du téléphone.
 */
import { keypadOn } from '../engine/stats';

interface Key {
  k: string;
  label: string;
  aria: string;
  cls?: string;
}
const DIG = (d: string): Key => ({ k: d, label: d, aria: d });
const BASE: Key[][] = [
  [DIG('7'), DIG('8'), DIG('9'), { k: 'del', label: '⌫', aria: 'Effacer', cls: 'kp-fn' }],
  [DIG('4'), DIG('5'), DIG('6'), { k: '-', label: '−', aria: 'Moins', cls: 'kp-op' }],
  [DIG('1'), DIG('2'), DIG('3'), { k: '/', label: '/', aria: 'Barre de fraction', cls: 'kp-op' }],
  [DIG('0'), { k: ',', label: ',', aria: 'Virgule', cls: 'kp-op' }, { k: 'x', label: '', aria: '' }, { k: 'ok', label: 'OK', aria: 'Valider', cls: 'kp-ok' }],
];

export interface KeypadHandle {
  destroy(): void;
  hide(): void;
}

export function attachKeypad(root: HTMLElement, onSubmit: (input: HTMLInputElement) => void): KeypadHandle {
  const pad = document.createElement('div');
  pad.className = 'keypad';
  pad.setAttribute('role', 'group');
  pad.setAttribute('aria-label', 'Clavier mathématique');
  pad.hidden = true;
  document.body.appendChild(pad);
  let target: HTMLInputElement | null = null;
  let extra = '';

  const buildExpr = (v: string) => {
    const K = (k: string, label: string, aria: string, cls = 'kp-op'): Key => ({ k, label, aria, cls });
    const rows: Key[][] = [
      [DIG('7'), DIG('8'), DIG('9'), K('(', '(', 'Parenthèse ouvrante'), K(')', ')', 'Parenthèse fermante')],
      [DIG('4'), DIG('5'), DIG('6'), K('+', '+', 'Plus'), K('-', '−', 'Moins')],
      [DIG('1'), DIG('2'), DIG('3'), K('×', '×', 'Fois'), K('²', '■²', 'Au carré')],
      [DIG('0'), K(',', ',', 'Virgule'), K(v, v, `Lettre ${v}`, 'kp-var'), { k: 'del', label: '⌫', aria: 'Effacer', cls: 'kp-fn' }, { k: 'ok', label: 'OK', aria: 'Valider', cls: 'kp-ok' }],
    ];
    pad.innerHTML = `
      <div class="kp-bar">
        <button type="button" class="kp-small" data-k="native" tabindex="-1">Clavier du téléphone</button>
        <button type="button" class="kp-small" data-k="hide" tabindex="-1" aria-label="Masquer le clavier">Masquer</button>
      </div>
      <div class="kp-grid kp-grid--5">${rows
        .flat()
        .map((key) => `<button type="button" tabindex="-1" class="kp-key ${key.cls ?? ''}" data-k="${key.k}" aria-label="${key.aria}">${key.label}</button>`)
        .join('')}</div>`;
    extra = 'expr:' + v;
  };
  const build = (mode: string) => {
    const ex: Key = mode === 'set' ? { k: ';', label: ';', aria: 'Point-virgule (solution suivante)', cls: 'kp-op' } : mode === 'sqrt' || mode === 'setsqrt' ? { k: '√', label: '√', aria: 'Racine carrée', cls: 'kp-op' } : { k: '', label: '', aria: '' };
    const rows = BASE.map((r) => r.map((key) => (key.k === 'x' ? ex : key)));
    if (mode === 'setsqrt') rows[2][3] = { k: ';', label: ';', aria: 'Point-virgule (solution suivante)', cls: 'kp-op' };
    pad.innerHTML = `
      <div class="kp-bar">
        <button type="button" class="kp-small" data-k="native" tabindex="-1">Clavier du téléphone</button>
        <button type="button" class="kp-small" data-k="hide" tabindex="-1" aria-label="Masquer le clavier">Masquer</button>
      </div>
      <div class="kp-grid">${rows
        .flat()
        .map((key) => (key.k ? `<button type="button" tabindex="-1" class="kp-key ${key.cls ?? ''}" data-k="${key.k}" aria-label="${key.aria}">${key.label}</button>` : '<span class="kp-key kp-empty"></span>'))
        .join('')}</div>`;
    extra = mode;
  };

  const show = (inp: HTMLInputElement) => {
    target = inp;
    const mode = inp.dataset.keys || 'num';
    if (mode === 'expr') {
      if (extra !== 'expr:' + (inp.dataset.v || 'x') || !pad.firstChild) buildExpr(inp.dataset.v || 'x');
    } else if (mode !== extra || !pad.firstChild) build(mode);
    pad.hidden = false;
    document.documentElement.classList.add('kp-open');
    // la case reste visible au-dessus du clavier
    requestAnimationFrame(() => {
      const r = inp.getBoundingClientRect();
      const top = pad.getBoundingClientRect().top;
      if (r.bottom > top - 12) window.scrollBy({ top: r.bottom - top + 24 });
    });
  };
  const hide = () => {
    pad.hidden = true;
    document.documentElement.classList.remove('kp-open');
  };

  const onFocusIn = (e: FocusEvent) => {
    const inp = (e.target as Element).closest?.('input.pt-input') as HTMLInputElement | null;
    if (!inp) return;
    if (keypadOn() && inp.dataset.native !== '1') {
      inp.inputMode = 'none';
      show(inp);
    } else {
      inp.inputMode = 'text';
      hide();
    }
  };
  const onFocusOut = () => {
    setTimeout(() => {
      const a = document.activeElement;
      if (!(a instanceof HTMLInputElement && a.classList.contains('pt-input') && root.contains(a))) hide();
    }, 0);
  };
  const insert = (s: string) => {
    if (!target) return;
    const a = target.selectionStart ?? target.value.length, b = target.selectionEnd ?? a;
    target.setRangeText(s, a, b, 'end');
    target.dispatchEvent(new Event('input', { bubbles: true }));
  };
  pad.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('button')) e.preventDefault(); // garde le focus dans la case
  });
  pad.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-k]');
    if (!b || !target) return;
    const k = b.dataset.k!;
    if (k === 'del') {
      const a = target.selectionStart ?? target.value.length, z = target.selectionEnd ?? a;
      if (a !== z) target.setRangeText('', a, z, 'end');
      else if (a > 0) target.setRangeText('', a - 1, a, 'end');
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (k === 'ok') onSubmit(target);
    else if (k === 'hide') {
      hide();
      target.blur();
    } else if (k === 'native') {
      const t = target;
      t.dataset.native = '1';
      t.inputMode = 'text';
      hide();
      t.blur();
      setTimeout(() => t.focus(), 30);
    } else insert(k === ';' ? ' ; ' : k);
  });
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  return {
    hide,
    destroy() {
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      hide();
      pad.remove();
    },
  };
}
