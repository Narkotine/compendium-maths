/**
 * Vérifie le pliage des patrons de cube du chapitre 15 avec l'outil existant du cours
 * (compendium-maths/outils/relecture/patron-cube.py) : les 216 hexominos (toutes orientations)
 * doivent recevoir le même verdict, avec exactement 11 patrons à rotation/retournement près.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { hexominoes, fold, type Cell } from '../src/practice/ch15/common';
const all = hexominoes();
const canon = (cs: Cell[]) => {
  const fs: ((c: Cell) => Cell)[] = [([x, y]) => [x, y], ([x, y]) => [-x, y], ([x, y]) => [x, -y], ([x, y]) => [-x, -y], ([x, y]) => [y, x], ([x, y]) => [-y, x], ([x, y]) => [y, -x], ([x, y]) => [-y, -x]];
  return fs.map((f) => { const t = cs.map(f), x0 = Math.min(...t.map((c) => c[0])), y0 = Math.min(...t.map((c) => c[1])); return t.map(([x, y]) => `${x - x0},${y - y0}`).sort().join(';'); }).sort()[0];
};
const ts = all.map((c) => !!fold(c));
writeFileSync('/tmp/hexominos.json', JSON.stringify(all));
const tool = [process.env.PATRON_TOOL, 'cours/outils/relecture/patron-cube.py', '/workspace/compendium-maths/outils/relecture/patron-cube.py'].find((f) => f && existsSync(f))!;
const py = `import json,io,contextlib\nsrc=open(${JSON.stringify(tool)}).read()\nns={}\nwith contextlib.redirect_stdout(io.StringIO()): exec(src, ns)\nprint(json.dumps([ns['est_patron']([tuple(c) for c in h]) for h in json.load(open('/tmp/hexominos.json'))]))`;
const pyv: boolean[] = JSON.parse(execFileSync('python3', ['-c', py], { encoding: 'utf8' }));
let bad = 0;
all.forEach((c, i) => { if (pyv[i] !== ts[i]) { bad++; console.log('désaccord :', JSON.stringify(c), 'TS', ts[i], 'outil', pyv[i]); } });
const free = new Set(all.filter((_, i) => ts[i]).map(canon)).size, freeAll = new Set(all.map(canon)).size;
console.log(`${all.length} hexominos (${freeAll} formes libres) ; patrons : ${ts.filter(Boolean).length} orientations, ${free} formes libres ; désaccords avec l’outil : ${bad}`);
// faces opposées : couplage parfait, jamais voisines dans le patron, et dans 3 carrés alignés consécutifs les extrémités sont opposées
let badOpp = 0;
all.forEach((c, i) => {
  if (!ts[i]) return;
  const n = fold(c)!, k = c.map((x) => x.join(',')), op = (a: number) => k.findIndex((kk) => n.get(kk)!.every((v, t) => v === -n.get(k[a])![t]));
  c.forEach((x, a) => {
    const o = op(a); if (o < 0 || op(o) !== a || o === a) badOpp++;
    if (Math.abs(c[o][0] - x[0]) + Math.abs(c[o][1] - x[1]) === 1) badOpp++;
    for (const [dx, dy] of [[1, 0], [0, 1]]) { const m1 = k.indexOf(`${x[0] + dx},${x[1] + dy}`), m2 = k.indexOf(`${x[0] + 2 * dx},${x[1] + 2 * dy}`); if (m1 >= 0 && m2 >= 0 && o !== m2) badOpp++; }
  });
});
console.log(`faces opposées : ${badOpp} incohérence(s)`);
if (badOpp) { console.log('ÉCHEC'); process.exit(1); }
if (bad || free !== 11 || freeAll !== 35) { console.log('ÉCHEC'); process.exit(1); }
console.log('OK');
