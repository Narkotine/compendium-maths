/**
 * Un exercice interactif : énoncé, étapes (saisie, validation, indice, erreurs typiques),
 * corrigé pas à pas. L'état est sérialisable (reprise après retour sur la page).
 */
import type { Exercise, Step, CourseLink, Generator } from '../engine/types';
import type { Rel } from '../engine/expr';
import { checkStep, maxAttempts, reveal, type Input } from '../engine/check';
import { parseNumber } from '../engine/answers';
import { texQ } from '../engine/expr';
import type { Result } from '../engine/stats';
import { rich, richParas, tex, plain } from '../engine/render';
import { parseExpr, astTex } from '../engine/algebra';
import { numberLineSvg, sideFromClick, type Side } from './numberline';
import { orderHtml, mountOrder, type OrderCtrl } from './order';

export interface ExoState {
  step: number;
  attempts: number[];
  failed: boolean[];
  inputs: (Input | null)[];
  peeked: boolean;
  done: boolean;
  result?: Result;
  /** saisie en cours (pas encore validée) */
  draft?: Input | null;
}
export const freshState = (ex: Exercise): ExoState => ({
  step: 0,
  attempts: ex.steps.map(() => 0),
  failed: ex.steps.map(() => false),
  inputs: ex.steps.map(() => null),
  peeked: false,
  done: false,
});

export interface ExoHooks {
  onChange(s: ExoState): void;
  onDone(r: Result, s: ExoState): void;
  /** clavier : valider depuis la touche OK */
  label: string;
  gen: Generator;
}

const STARS = (n: number) => '★'.repeat(n);
const RELS: [Rel, string, string, string][] = [
  ['<', '<', 'strictement inférieur à', 'lt'],
  ['<=', '\\leqslant', 'inférieur ou égal à', 'le'],
  ['>', '>', 'strictement supérieur à', 'gt'],
  ['>=', '\\geqslant', 'supérieur ou égal à', 'ge'],
];
const relOfCode = (c: string | undefined): Rel | null => RELS.find((r) => r[3] === c)?.[0] ?? null;
const codeOfRel = (r: Rel) => RELS.find((x) => x[0] === r)![3];
let uid = 0;

export function mountExercise(host: HTMLElement, ex: Exercise, st: ExoState, hooks: ExoHooks) {
  const id = `ex${++uid}`;
  const links: CourseLink[] = [hooks.gen.course, ...(hooks.gen.links ?? [])];
  host.innerHTML = `
    <article class="pt-ex" aria-labelledby="${id}-t">
      <header class="pt-ex-head">
        <span class="pt-badge">${hooks.label}</span>
        <span class="pt-type">${rich(hooks.gen.title)}</span>
        <span class="pt-stars" aria-label="Niveau ${ex.level} sur 3">${STARS(ex.level)}</span>
      </header>
      <h2 class="pt-ex-title" id="${id}-t" tabindex="-1">${rich(ex.title)}</h2>
      ${ex.statement ? `<div class="pt-statement">${richParas(ex.statement)}</div>` : ''}
      ${ex.display ? `<div class="pt-display">${tex(ex.display, true)}</div>` : ''}
      ${ex.figure ? `<figure class="pt-figure">${ex.figure}</figure>` : ''}
      ${ex.form ? `<p class="pt-form">${rich(ex.form)}</p>` : ''}
      <ol class="pt-steps${ex.steps.length > 1 ? '' : ' pt-steps--one'}">
        ${ex.steps.map((s, i) => stepHtml(s, i, id)).join('')}
      </ol>
      <div class="pt-peek" hidden><button type="button" class="btn btn--ghost" data-act="peek">Voir le corrigé</button></div>
      <section class="pt-solution" hidden aria-labelledby="${id}-sol">
        <h3 id="${id}-sol">Corrigé</h3>
        <div class="pt-sol-lines">${ex.solution.map((l) => (l.startsWith('[[ray:') ? `<div class="pt-sol-ray">${rich(l)}</div>` : `<p>${rich(l)}</p>`)).join('')}</div>
        <p class="pt-course">Revoir le cours : ${links.map((l) => `<a href="${l.href}">${rich(l.label)}</a>`).join(' · ')}</p>
      </section>
    </article>`;
  const art = host.querySelector<HTMLElement>('.pt-ex')!;
  const stepEls = [...art.querySelectorAll<HTMLElement>('.pt-step')];
  const orders: (OrderCtrl | null)[] = ex.steps.map((s, i) => {
    if (s.answer.kind !== 'order') return null;
    return mountOrder(stepEls[i].querySelector<HTMLElement>('.po')!, s.answer, () => {
      fbClearIfHint(i);
      saveDraft(i);
    });
  });
  const fbClearIfHint = (i: number) => {
    const f = stepEls[i].querySelector<HTMLElement>('.pt-feedback')!;
    if (f.classList.contains('pt-fb--info')) (f.className = 'pt-feedback'), (f.innerHTML = '');
  };

  // ---------------------------------------------------------------- saisie
  const read = (i: number): Input => {
    const s = ex.steps[i], el = stepEls[i];
    const a = s.answer;
    switch (a.kind) {
      case 'num':
        return { kind: 'num', raws: [...el.querySelectorAll<HTMLInputElement>('input.pt-input')].map((x) => x.value) };
      case 'set':
        return { kind: 'set', raw: el.querySelector<HTMLInputElement>('input.pt-input')!.value, none: el.querySelector('.pt-none')!.getAttribute('aria-pressed') === 'true' };
      case 'ineq':
        return { kind: 'ineq', rel: relOfCode((el.querySelector('[data-rel][aria-checked="true"]') as HTMLElement | null)?.dataset.rel), raw: el.querySelector<HTMLInputElement>('input.pt-input')!.value };
      case 'ray':
        return {
          kind: 'ray',
          side: ((el.querySelector('[data-side][aria-checked="true"]') as HTMLElement | null)?.dataset.side as Side) ?? null,
          incl: (() => {
            const b = el.querySelector<HTMLElement>('[data-incl][aria-checked="true"]');
            return b ? b.dataset.incl === '1' : null;
          })(),
        };
      case 'choice':
        return { kind: 'choice', index: -1 };
      case 'expr':
        return { kind: 'expr', raw: el.querySelector<HTMLInputElement>('input.pt-input')!.value };
      case 'order':
        return { kind: 'order', order: orders[i]!.get(), moved: orders[i]!.moved };
    }
  };
  const write = (i: number, inp: Input) => {
    const el = stepEls[i];
    if (inp.kind === 'num') el.querySelectorAll<HTMLInputElement>('input.pt-input').forEach((x, j) => ((x.value = inp.raws[j] ?? ''), preview(x)));
    if (inp.kind === 'set') {
      el.querySelector<HTMLInputElement>('input.pt-input')!.value = inp.raw;
      setNone(el, inp.none);
    }
    if (inp.kind === 'expr') {
      const x = el.querySelector<HTMLInputElement>('input.pt-input')!;
      x.value = inp.raw;
      preview(x);
    }
    if (inp.kind === 'ineq') {
      el.querySelector<HTMLInputElement>('input.pt-input')!.value = inp.raw;
      if (inp.rel) radio(el, `[data-rel="${codeOfRel(inp.rel)}"]`);
    }
    if (inp.kind === 'order') orders[i]?.set(inp.order);
    if (inp.kind === 'ray') {
      if (inp.side) radio(el, `[data-side="${inp.side}"]`);
      if (inp.incl !== null) radio(el, `[data-incl="${inp.incl ? 1 : 0}"]`);
      drawRay(i);
    }
  };
  const radio = (el: HTMLElement, sel: string) => {
    const b = el.querySelector<HTMLElement>(sel);
    if (!b) return;
    b.parentElement!.querySelectorAll('[role=radio]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  };
  const setNone = (el: HTMLElement, v: boolean) => {
    const b = el.querySelector<HTMLElement>('.pt-none')!;
    b.setAttribute('aria-pressed', String(v));
    const inp = el.querySelector<HTMLInputElement>('input.pt-input')!;
    inp.disabled = v;
    if (v) inp.value = '';
  };
  const drawRay = (i: number) => {
    const s = ex.steps[i];
    if (s.answer.kind !== 'ray') return;
    const inp = read(i) as Extract<Input, { kind: 'ray' }>;
    stepEls[i].querySelector('.pt-ray-svg')!.innerHTML = numberLineSvg({ bound: s.answer.bound, side: inp.side, incl: inp.incl }, { interactive: true });
  };
  /** Aperçu de la valeur lue (5/2 → ½ affiché en fraction) : l'élève voit ce que l'appli a compris. */
  const preview = (x: HTMLInputElement) => {
    const out = x.parentElement!.querySelector<HTMLElement>('.pt-preview');
    if (!out) return;
    const v = x.value.trim();
    if (x.dataset.keys === 'expr') {
      const r = v ? parseExpr(v, x.dataset.v || 'x') : null;
      out.innerHTML = r?.ok ? `<span class="pt-pv-l">Lu :</span> ${tex(astTex(r.ast, x.dataset.v || 'x'))}` : '';
      return;
    }
    if (!v || !/[/√]/.test(v)) return void (out.innerHTML = '');
    const parts = x.dataset.keys?.startsWith('set') ? v.split(/\s*;\s*/) : [v];
    const tx = parts
      .map((p) => {
        const r = parseNumber(p, { sqrt: true });
        if (!r.ok) return null;
        return r.v.sqrt ? `${r.v.sqrt.s < 0 ? '-' : ''}\\sqrt{${texQ(r.v.sqrt.r, 'dec')}}` : r.v.form === 'frac' ? fracTex(p) : null;
      })
      .filter(Boolean);
    out.innerHTML = tx.length === parts.length ? tex(tx.join(' \\;;\\; ')) : '';
  };
  const fracTex = (p: string) => {
    const m = /^\s*([+-−]?)\s*\(?\s*([\d\s.,]+)\s*\)?\s*\/\s*\(?\s*([+-−]?)\s*([\d\s.,]+)\)?\s*$/.exec(p.replace(/[−–]/g, '-'));
    if (!m) return null;
    const neg = (m[1] === '-') !== (m[3] === '-');
    return `${neg ? '-' : ''}\\dfrac{${m[2].trim().replace(',', '{,}')}}{${m[4].trim().replace(',', '{,}')}}`;
  };

  // ---------------------------------------------------------------- état et affichage
  const fb = (i: number, kind: 'ok' | 'ko' | 'info' | 'hint', html: string) => {
    const f = stepEls[i].querySelector<HTMLElement>('.pt-feedback')!;
    f.className = `pt-feedback pt-fb--${kind}`;
    f.innerHTML = html;
  };
  const lock = (i: number) => {
    const el = stepEls[i];
    el.classList.add('pt-step--locked');
    el.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((x) => {
      if (x.classList.contains('pt-choice')) x.setAttribute('aria-disabled', 'true');
      x.disabled = true;
    });
  };
  const showStep = (i: number) => stepEls.forEach((el, j) => (el.hidden = j > i));
  const showSolution = () => {
    art.querySelector<HTMLElement>('.pt-solution')!.hidden = false;
    art.querySelector<HTMLElement>('.pt-peek')!.hidden = true;
  };
  const finish = (focus = true) => {
    const r: Result = st.failed.some(Boolean) || st.peeked ? 'fail' : st.attempts.some((a) => a > 0) ? 'hint' : 'ok';
    st.done = true;
    st.result = r;
    stepEls.forEach((_, i) => lock(i));
    if (r !== 'ok') showSolution();
    else {
      const pk = art.querySelector<HTMLElement>('.pt-peek')!;
      pk.hidden = false;
      pk.querySelector('button')!.textContent = 'Voir le corrigé rédigé';
    }
    hooks.onChange(st);
    hooks.onDone(r, st);
    if (focus && r !== 'ok') art.querySelector<HTMLElement>('.pt-solution h3')?.setAttribute('tabindex', '-1');
  };
  const advance = (i: number) => {
    if (i + 1 < ex.steps.length) {
      st.step = i + 1;
      showStep(st.step);
      hooks.onChange(st);
      const nxt = stepEls[st.step].querySelector<HTMLElement>('input.pt-input:not([disabled]), [role=radio], .pt-choice');
      // pas d'ouverture automatique du clavier : on amène l'étape à l'écran et on y met le focus
      stepEls[st.step].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (nxt && !(nxt instanceof HTMLInputElement)) nxt.focus({ preventScroll: true });
      else stepEls[st.step].querySelector<HTMLElement>('.pt-prompt')?.focus({ preventScroll: true });
    } else finish();
  };

  const validate = (i: number, input?: Input) => {
    if (st.done || i !== st.step) return;
    const s = ex.steps[i];
    const inp = input ?? read(i);
    const v = checkStep(s, inp);
    const el = stepEls[i];
    el.querySelectorAll('input.pt-input').forEach((x) => x.removeAttribute('aria-invalid'));
    if (v.status === 'retry') {
      fb(i, 'info', rich(v.msg ?? 'Réponse non reconnue.'));
      return;
    }
    if (v.status === 'ok') {
      st.inputs[i] = inp;
      st.draft = null;
      if (s.answer.kind === 'choice') markChoice(i, inp.kind === 'choice' ? inp.index : -1, true);
      orders[i]?.mark('ok');
      fb(i, 'ok', `<strong>Juste${st.attempts[i] ? '' : ' !'}</strong>${v.msg ? ' ' + rich(v.msg) : ''}`);
      lock(i);
      advance(i);
      return;
    }
    st.attempts[i]++;
    const max = maxAttempts(s);
    if (s.answer.kind === 'num' && v.wrong) {
      const ins = el.querySelectorAll('input.pt-input');
      v.wrong.forEach((j) => ins[j]?.setAttribute('aria-invalid', 'true'));
    }
    if (s.answer.kind === 'choice' && inp.kind === 'choice') markChoice(i, inp.index, false);
    if (s.answer.kind === 'order') orders[i]?.mark(v.wrong ?? null);
    if (st.attempts[i] < max) {
      const parts = [`<strong>${v.mistake ? 'Pas tout à fait.' : 'Ce n’est pas ça.'}</strong>${v.msg ? ' ' + rich(v.msg) : ''}`];
      if (s.hint) parts.push(`<span class="pt-hint"><strong>Indice.</strong> ${rich(s.hint)}</span>`);
      parts.push(`<span class="pt-again">Corrige, puis valide à nouveau.</span>`);
      fb(i, 'hint', parts.join(''));
      art.querySelector<HTMLElement>('.pt-peek')!.hidden = false;
      hooks.onChange(st);
      const inpEl = el.querySelector<HTMLInputElement>('input.pt-input[aria-invalid], input.pt-input');
      if (inpEl && document.activeElement === inpEl) inpEl.select();
      return;
    }
    // échec de l'étape : on montre la bonne réponse et on continue
    st.failed[i] = true;
    st.inputs[i] = inp;
    if (s.answer.kind === 'choice') markChoice(i, s.answer.correct, true);
    const rv = reveal(s);
    fb(i, 'ko', `<strong>Faux.</strong>${v.msg ? ' ' + rich(v.msg) : ''}<span class="pt-reveal">La bonne réponse : ${rich(rv)}</span>`);
    lock(i);
    advance(i);
  };
  const markChoice = (i: number, idx: number, good: boolean) => {
    const b = stepEls[i].querySelector<HTMLButtonElement>(`.pt-choice[data-i="${idx}"]`);
    if (!b) return;
    b.classList.add(good ? 'pt-choice--ok' : 'pt-choice--ko');
    if (!good) b.disabled = true;
    b.setAttribute('aria-pressed', 'true');
  };

  // ---------------------------------------------------------------- événements
  art.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = (e.target as Element).closest<HTMLElement>('.pt-step');
    if (f) validate(Number(f.dataset.i));
  });
  art.addEventListener('click', (e) => {
    const t = e.target as Element;
    const ch = t.closest<HTMLButtonElement>('.pt-choice');
    if (ch && !ch.disabled) {
      const i = Number(ch.closest<HTMLElement>('.pt-step')!.dataset.i);
      validate(i, { kind: 'choice', index: Number(ch.dataset.i) });
      return;
    }
    const r = t.closest<HTMLElement>('[role=radio]');
    if (r && !(r as HTMLButtonElement).disabled) {
      r.parentElement!.querySelectorAll('[role=radio]').forEach((x) => x.setAttribute('aria-checked', String(x === r)));
      const i = Number(r.closest<HTMLElement>('.pt-step')!.dataset.i);
      drawRay(i);
      saveDraft(i);
    }
    const none = t.closest<HTMLElement>('.pt-none');
    if (none && !(none as HTMLButtonElement).disabled) {
      const el = none.closest<HTMLElement>('.pt-step')!;
      setNone(el, none.getAttribute('aria-pressed') !== 'true');
      saveDraft(Number(el.dataset.i));
    }
    const svg = t.closest<SVGSVGElement>('svg.nl--edit');
    if (svg) {
      const el = svg.closest<HTMLElement>('.pt-step')!;
      const i = Number(el.dataset.i);
      const s = ex.steps[i];
      if (s.answer.kind === 'ray' && !el.classList.contains('pt-step--locked')) {
        radio(el, `[data-side="${sideFromClick(svg, (e as MouseEvent).clientX, s.answer.bound)}"]`);
        drawRay(i);
        saveDraft(i);
      }
    }
    if (t.closest('[data-act="peek"]')) {
      if (!st.done) {
        st.peeked = true;
        finish(false);
      }
      showSolution();
      art.querySelector<HTMLElement>('.pt-solution')!.scrollIntoView({ behavior: 'smooth', block: 'start' });
      hooks.onChange(st);
    }
  });
  // flèches dans les groupes radio
  art.addEventListener('keydown', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[role=radio]');
    if (!b || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const all = [...b.parentElement!.querySelectorAll<HTMLElement>('[role=radio]')];
    const n = all[(all.indexOf(b) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    n.focus();
    n.click();
    e.preventDefault();
  });
  art.addEventListener('input', (e) => {
    const x = e.target as HTMLInputElement;
    if (!x.classList.contains('pt-input')) return;
    x.removeAttribute('aria-invalid');
    preview(x);
    saveDraft(Number(x.closest<HTMLElement>('.pt-step')!.dataset.i));
  });
  const saveDraft = (i: number) => {
    if (i !== st.step || st.done) return;
    st.draft = read(i);
    hooks.onChange(st);
  };

  // ---------------------------------------------------------------- reprise
  ex.steps.forEach((s, i) => {
    if (s.answer.kind === 'ray') drawRay(i);
    const inp = st.inputs[i];
    if (i < st.step || (st.done && inp)) {
      if (inp) write(i, inp);
      if (s.answer.kind === 'choice' && inp?.kind === 'choice') markChoice(i, st.failed[i] ? s.answer.correct : inp.index, true);
      if (s.answer.kind === 'order' && inp?.kind === 'order') {
        const v = checkStep(s, inp);
        orders[i]?.mark(v.status === 'ok' ? 'ok' : (v.wrong ?? null));
      }
      fb(i, st.failed[i] ? 'ko' : 'ok', st.failed[i] ? `<strong>Faux.</strong><span class="pt-reveal">La bonne réponse : ${rich(reveal(s))}</span>` : '<strong>Juste</strong>');
      lock(i);
    }
  });
  if (!st.done) {
    if (st.draft && st.draft.kind !== 'choice') write(st.step, st.draft);
    if (st.attempts[st.step] > 0) {
      const s = ex.steps[st.step];
      fb(st.step, 'hint', `${s.hint ? `<span class="pt-hint"><strong>Indice.</strong> ${rich(s.hint)}</span>` : ''}<span class="pt-again">Corrige, puis valide à nouveau.</span>`);
      art.querySelector<HTMLElement>('.pt-peek')!.hidden = false;
    }
  }
  showStep(st.done ? ex.steps.length - 1 : st.step);
  if (st.done) {
    stepEls.forEach((_, i) => lock(i));
    if (st.result !== 'ok' || st.peeked) showSolution();
    else {
      const pk = art.querySelector<HTMLElement>('.pt-peek')!;
      pk.hidden = false;
      pk.querySelector('button')!.textContent = 'Voir le corrigé rédigé';
    }
  }

  return {
    el: art,
    validateFromKeypad(input: HTMLInputElement) {
      const s = input.closest<HTMLElement>('.pt-step');
      if (s) validate(Number(s.dataset.i));
    },
    focusTitle() {
      art.querySelector<HTMLElement>('.pt-ex-title')!.focus({ preventScroll: true });
    },
  };
}

// ------------------------------------------------------------------ gabarits des étapes
function stepHtml(s: Step, i: number, id: string): string {
  const a = s.answer;
  const fid = `${id}-s${i}`;
  let w = '';
  const inputAttrs = (keys: string, label: string) =>
    `class="pt-input" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" data-keys="${keys}" aria-label="${plain(label).replace(/"/g, '')}"`;
  switch (a.kind) {
    case 'num':
      w = `<div class="pt-fields">${a.fields
        .map(
          (f, j) =>
            `<div class="pt-field"><label for="${fid}-${j}">${rich(f.label)}</label><span class="pt-inwrap"><input id="${fid}-${j}" ${inputAttrs('num', `${f.label} ${f.unit ?? ''}`)} data-form="${f.form ?? 'any'}"${f.decimalOk ? ' data-dok="1"' : ''}${f.approx ? ` data-dp="${f.approx.dp}"` : ''}>${f.unit ? `<span class="pt-unit">${f.unit}</span>` : ''}</span><output class="pt-preview" aria-hidden="true"></output></div>`,
        )
        .join('')}</div>`;
      break;
    case 'set':
      w = `<div class="pt-fields"><div class="pt-field pt-field--wide"><label for="${fid}-0">Solutions :</label><span class="pt-inwrap"><input id="${fid}-0" ${inputAttrs(a.sqrt ? 'setsqrt' : 'set', 'Solutions, séparées par point-virgule')} placeholder="${a.sqrt ? 'ex. √5 ; −√5' : 'ex. 3 ; −5/2'}"></span><output class="pt-preview" aria-hidden="true"></output></div>
        <button type="button" class="pt-none" aria-pressed="false">Aucune solution</button></div>`;
      break;
    case 'choice':
      w = `<div class="pt-choices" role="group" aria-label="Choix">${a.options.map((o, j) => `<button type="button" class="pt-choice" data-i="${j}" aria-pressed="false">${rich(o)}</button>`).join('')}</div>`;
      break;
    case 'ineq':
      w = `<div class="pt-ineq">
        <span class="pt-ineq-x" aria-hidden="true">${tex(a.v)}</span>
        <div class="segmented pt-rel" role="radiogroup" aria-label="Symbole">${RELS.map(([, t, l, c]) => `<button type="button" class="seg" role="radio" aria-checked="false" data-rel="${c}" aria-label="${l}">${tex(t)}</button>`).join('')}</div>
        <span class="pt-inwrap"><input id="${fid}-0" ${inputAttrs('num', 'Borne')} placeholder="borne"></span><output class="pt-preview" aria-hidden="true"></output>
      </div>`;
      break;
    case 'expr':
      w = `<div class="pt-fields"><div class="pt-field pt-field--wide pt-field--expr">${a.label ? `<label for="${fid}-0">${rich(a.label)}</label>` : ''}<span class="pt-inwrap"><input id="${fid}-0" ${inputAttrs('expr', a.label ? plain(a.label) : 'Expression')} data-v="${a.v}" placeholder="ex. ${a.form === 'fact' ? '3(2' + a.v + ' + 1)' : '2' + a.v + '² − 5' + a.v + ' + 3'}"></span><output class="pt-preview" aria-hidden="true"></output></div></div>`;
      break;
    case 'order':
      w = orderHtml(a, fid);
      break;
    case 'ray':
      w = `<div class="pt-ray">
        <div class="pt-ray-svg"></div>
        <div class="pt-ray-ctrl">
          <div class="segmented" role="radiogroup" aria-label="Côté des solutions"><button type="button" class="seg" role="radio" aria-checked="false" data-side="left">← À gauche</button><button type="button" class="seg" role="radio" aria-checked="false" data-side="right">À droite →</button></div>
          <div class="segmented" role="radiogroup" aria-label="Borne"><button type="button" class="seg" role="radio" aria-checked="false" data-incl="1">Borne incluse</button><button type="button" class="seg" role="radio" aria-checked="false" data-incl="0">Borne exclue</button></div>
        </div>
      </div>`;
      break;
  }
  const needsBtn = a.kind !== 'choice';
  return `<li class="pt-step" data-i="${i}">
    <form class="pt-form-step" novalidate>
      ${s.prompt ? `<p class="pt-prompt" tabindex="-1">${rich(s.prompt)}</p>` : '<p class="pt-prompt sr-only" tabindex="-1">Ta réponse</p>'}
      <div class="pt-answer">${w}</div>
      ${needsBtn ? `<div class="pt-actions"><button type="submit" class="btn pt-validate">Valider</button></div>` : ''}
      <div class="pt-feedback" role="status" aria-live="polite"></div>
    </form>
  </li>`;
}
