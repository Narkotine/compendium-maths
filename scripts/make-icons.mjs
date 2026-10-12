#!/usr/bin/env node
/** Génère les icônes de l'appli (SVG → PNG) dans public/icons/. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const motif = (s = 1) => {
  // triangle rectangle (angle droit en bas à gauche), hypoténuse jaune
  const t = (x, y) => `${256 + (x - 256) * s},${256 + (y - 256) * s}`;
  const w = 30 * s;
  return `
  <polygon points="${t(148, 352)} ${t(364, 352)} ${t(148, 152)}" fill="rgba(255,255,255,0.14)"/>
  <polyline points="${t(364, 352)} ${t(148, 352)} ${t(148, 152)}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="${t(196, 352)} ${t(196, 304)} ${t(148, 304)}" fill="none" stroke="#fff" stroke-width="${14 * s}" stroke-linejoin="round"/>
  <line x1="${t(364, 352).split(',')[0]}" y1="${t(364, 352).split(',')[1]}" x2="${t(148, 152).split(',')[0]}" y2="${t(148, 152).split(',')[1]}" stroke="#ffd166" stroke-width="${w}" stroke-linecap="round"/>`;
};
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a6fbe"/><stop offset="1" stop-color="#16467f"/></linearGradient></defs>`;
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<rect width="512" height="512" rx="116" fill="url(#g)"/>${motif(1)}</svg>`;
const full = (s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${grad}<rect width="512" height="512" fill="url(#g)"/>${motif(s)}</svg>`;

fs.writeFileSync(path.join(OUT, 'favicon.svg'), rounded);
fs.writeFileSync(path.join(OUT, 'icon.svg'), rounded);
const png = (svg, size, name) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
await Promise.all([
  png(rounded, 192, 'icon-192.png'),
  png(rounded, 512, 'icon-512.png'),
  png(full(0.78), 512, 'maskable-512.png'), // zone sûre : cercle de 80 %
  png(full(0.78), 192, 'maskable-192.png'),
  png(full(0.9), 180, 'apple-touch-icon.png'), // iOS arrondit lui-même les coins
  png(rounded, 32, 'favicon-32.png'),
]);
console.log('Icônes écrites dans', OUT, fs.readdirSync(OUT).join(', '));
