/** Nombres en lettres (orthographe traditionnelle avec traits d'union entre dizaines et unités). */
const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const T = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
function below100(n: number): string {
  if (n < 20) return U[n];
  const t = Math.floor(n / 10), u = n % 10;
  if (t === 7 || t === 9) return `${T[t]}${u === 1 && t === 7 ? ' et ' : '-'}${U[10 + u]}`;
  if (u === 0) return t === 8 ? 'quatre-vingts' : T[t];
  if (u === 1 && t !== 8) return `${T[t]} et un`;
  return `${T[t]}-${U[u]}`;
}
function below1000(n: number, final = true): string {
  const c = Math.floor(n / 100), r = n % 100;
  let s = '';
  if (c === 1) s = 'cent';
  else if (c > 1) s = `${U[c]} cent${r === 0 && final ? 's' : ''}`;
  if (r) s += (s ? ' ' : '') + (final ? below100(r) : below100(r).replace(/^quatre-vingts$/, 'quatre-vingt'));
  return s;
}
/** Entier de 0 à 999 999 999 en lettres. */
export function words(n: number): string {
  if (n === 0) return 'zéro';
  const mil = Math.floor(n / 1e6), th = Math.floor((n % 1e6) / 1000), r = n % 1000;
  const parts: string[] = [];
  if (mil) parts.push(mil === 1 ? 'un million' : `${below1000(mil)} millions`);
  if (th) parts.push(th === 1 ? 'mille' : `${below1000(th, false)} mille`);
  if (r) parts.push(below1000(r));
  return parts.join(' ');
}
