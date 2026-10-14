/** Affichage court d'une valeur approchée : 4 décimales au plus, sans zéros inutiles (la valeur complète reste utilisée). */
export const short4 = (t: string, approx: boolean): string => {
  if (!approx) return t;
  return t.replace(/(\d),(\d{5,})(?![\d])/g, (m, a: string, d: string) => {
    const n = Number(`${a}.${d}`); if (!isFinite(n)) return m;
    // arrondit la partie décimale sans toucher aux chiffres entiers séparés
    const r = (Math.round(Number(`0.${d}`) * 1e4) / 1e4);
    if (r >= 1) return m; // très rare (0,99995…) : on garde tel quel
    const dec = r.toFixed(4).slice(2).replace(/0+$/, '');
    return dec ? `${a},${dec}` : a;
  });
};
