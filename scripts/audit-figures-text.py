#!/usr/bin/env python3
"""Taille effective du texte des figures sur téléphone.
Pour chaque SVG du compendium : échelle d'affichage = min(1, 350 / largeur, 590 / hauteur)
(largeur utile d'un téléphone de 390 px ; hauteur max 70vh sur 844 px), puis taille effective
de chaque <text> = font-size (hérité) × échelle × transformations scale().
Usage : python3 audit-figures-text.py [seuil=11] [--all]"""
import sys, glob, os, re
import xml.etree.ElementTree as ET
SRC = os.environ.get('COMPENDIUM_SRC', '/workspace/compendium-maths')
TH = float(next((a for a in sys.argv[1:] if not a.startswith('--')), 11))
SHOW_ALL = '--all' in sys.argv
NS = '{http://www.w3.org/2000/svg}'
def num(v, d=None):
    if v is None: return d
    m = re.match(r'\s*([\d.]+)', str(v)); return float(m.group(1)) if m else d
def tscale(t):
    s = 1.0
    for m in re.finditer(r'scale\(\s*([\d.]+)(?:[ ,]+([\d.]+))?\s*\)', t or ''):
        s *= float(m.group(1))
    for m in re.finditer(r'matrix\(\s*([-\d.]+)[ ,]+([-\d.]+)', t or ''):
        s *= (float(m.group(1))**2 + float(m.group(2))**2) ** 0.5
    return s
def style_fs(el):
    m = re.search(r'font-size:\s*([\d.]+)', el.get('style', '')); return float(m.group(1)) if m else None
rows = []
for p in sorted(glob.glob(os.path.join(SRC, '[01]*', os.environ.get('FIG_DIR', 'figures'), '*.svg'))):
    root = ET.parse(p).getroot()
    vb = [float(x) for x in re.split(r'[ ,]+', root.get('viewBox', '').strip())] if root.get('viewBox') else None
    W = vb[2] if vb else num(root.get('width')); H = vb[3] if vb else num(root.get('height'))
    disp_w = min(num(root.get('width'), W), 350)
    k = min(disp_w / W, 590 / H * (W / disp_w) * (disp_w / W) if H * disp_w / W > 590 else disp_w / W)
    sizes = []
    def walk(el, fs, sc):
        fs = style_fs(el) or num(el.get('font-size'), fs); sc = sc * tscale(el.get('transform'))
        if el.tag in (NS + 'text', NS + 'tspan') and (el.text or '').strip():
            sizes.append((fs * sc * k, (el.text or '').strip()[:30]))
        for c in el: walk(c, fs, sc)
    walk(root, 16.0, 1.0)
    if not sizes: continue
    small = [s for s in sizes if s[0] < TH]
    rel = os.path.relpath(p, SRC)
    rows.append((rel, W, H, k, min(s[0] for s in sizes), len(small), len(sizes), small, [s[0] for s in sizes]))
bad = [r for r in rows if r[5]]
for rel, W, H, k, mn, ns, nt, small, _a in (rows if SHOW_ALL else bad):
    ex = ', '.join(sorted({f'{s[1]!r}' for s in small})[:4])
    print(f'{"✗" if ns else "✓"} {rel:58s} {W:.0f}×{H:.0f} échelle {k:.2f}  min {mn:4.1f}px  {ns}/{nt} textes < {TH:g}px  {ex}')
print(f'\n{len(bad)} figure(s) sur {len(rows)} avec du texte sous {TH:g} px effectifs (largeur 350 px).')
if os.environ.get('AUDIT_JSON'):
    import json, statistics
    json.dump({r[0].replace('/' + os.environ.get('FIG_DIR', 'figures') + '/', '/'): {'min': round(r[4], 2), 'med': round(statistics.median(r[8]), 2), 'n_small': r[5], 'n': r[6]} for r in rows}, open(os.environ['AUDIT_JSON'], 'w'), ensure_ascii=False, indent=0)
