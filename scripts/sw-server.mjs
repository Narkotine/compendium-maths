/**
 * Petit serveur statique pour tester les mises à jour du service worker : sert le dossier pointé par le
 * lien symbolique <root>/current (on bascule d'une version à l'autre sans changer d'adresse).
 * Servi sous le sous-chemin PREFIX (défaut /compendium-maths/, comme GitHub Pages). En-têtes : ceux de dist/_headers
 * s'il existe, sinon « max-age=600 » partout (défaut de GitHub Pages). /jeux-sw.js : faux service worker d'un autre site à la racine.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.argv[2], PORT = Number(process.argv[3] || 4300), PREFIX = process.env.PREFIX ?? '/compendium-maths/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
function rules(dir) {
  const f = path.join(dir, '_headers');
  if (!fs.existsSync(f)) return [];
  const out = []; let cur = null;
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    if (!l.trim() || l.startsWith('#')) continue;
    if (!/^\s/.test(l)) { cur = { pat: l.trim(), h: {} }; out.push(cur); }
    else if (cur) { const [k, ...v] = l.trim().split(':'); cur.h[k.trim()] = v.join(':').trim(); }
  }
  return out;
}
const match = (pat, p) => new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(p);
http.createServer((req, res) => {
  const dir = fs.realpathSync(path.join(ROOT, 'current'));
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/jeux-sw.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); return res.end("self.addEventListener('fetch', () => {});"); }
  if (p === '/' || p === '/jeux.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<!doctype html><title>jeux</title>jeux'); }
  if (!p.startsWith(PREFIX)) { res.writeHead(404); return res.end('404'); }
  p = '/' + p.slice(PREFIX.length);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(dir, p);
  if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const h = { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'max-age=600' };
  for (const r of rules(dir)) if (match(r.pat, p)) for (const [k, v] of Object.entries(r.h)) h[k.toLowerCase()] = v;
  res.writeHead(200, h);
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('sw-server', PORT));
