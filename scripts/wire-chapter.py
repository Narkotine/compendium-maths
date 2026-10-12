#!/usr/bin/env python3
"""Branche un chapitre d'entraînement partout : registre, métadonnées, contrôles du build, tests, échantillon.
Usage : python3 scripts/wire-chapter.py 01 01-fractions-rationnels  (idempotent)"""
import json, re, subprocess, sys
NN, slug = sys.argv[1], sys.argv[2]
ch = f'ch{NN}'
ids = subprocess.check_output(['npx', 'tsx', '-e', f"import c from './src/practice/{ch}/index'; console.log(c.generators.map(g=>g.id).join(','))"], text=True).strip().split(',')
def edit(p, f):
    s = open(p).read(); t = f(s)
    if t != s: open(p, 'w').write(t); print('modifié :', p)
# registre (ordre alphabétique des slugs)
def reg(s):
    if f"'{slug}'" in s: return s
    lines = s.split('\n'); i0 = next(i for i, l in enumerate(lines) if re.match(r"\s+'\d\d-", l))
    entries = [l for l in lines if re.match(r"\s+'\d\d-[^']+': \(\) => import", l)]
    entries.append(f"  '{slug}': () => import('./{ch}/index'),"); entries.sort()
    rest = [l for l in lines if l not in entries]
    out = rest[:i0] + entries + rest[i0:]
    return '\n'.join(out)
edit('src/practice/registry.ts', reg)
# métadonnées
m = json.load(open('content-meta.json'))
m['chapters'][slug]['practice'] = {'enabled': True, 'generators': ids}
open('content-meta.json', 'w').write(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
# contrôles du build
def chk(s):
    mm = re.search(r"const PRACTICE = \[(.*?)\];", s); cur = re.findall(r"'([^']+)'", mm.group(1))
    if slug in cur: return s
    cur = sorted(cur + [slug])
    return s.replace(mm.group(0), 'const PRACTICE = [' + ', '.join(f"'{c}'" for c in cur) + '];')
edit('scripts/check-dist.mjs', chk)
# tests de propriété, échantillon, parcours
def imp(s, anchor):
    line = f"import {ch} from '../src/practice/{ch}/index';"
    if line in s: return s
    return s.replace(anchor, anchor + '\n' + line, 1)
def gen(s):
    s = imp(s, "import ch11 from '../src/practice/ch11/index';")
    return re.sub(r"const chapters = \[([^\]]*)\]", lambda mm: mm.group(0) if ch in mm.group(1) else f"const chapters = [{mm.group(1)}, {ch}]", s)
edit('tests/generators.test.ts', gen)
def smp(s):
    s = imp(s, "import ch11 from '../src/practice/ch11/index';")
    return re.sub(r"const CHS: Record<string, ChapterPractice> = \{([^}]*)\}", lambda mm: mm.group(0) if f"'{NN}'" in mm.group(1) else f"const CHS: Record<string, ChapterPractice> = {{{mm.group(1).rstrip()}, '{NN}': {ch} }}", s)
edit('scripts/sample-chapter.mts', smp)
def tp(s):
    s = imp(s, "import ch11 from '../src/practice/ch11/index';")
    return re.sub(r"for \(const ch of \[(ch03[^\]]*)\]\)", lambda mm: mm.group(0) if ch in mm.group(1) else f"for (const ch of [{mm.group(1)}, {ch}])", s)
edit('scripts/test-practice.mts', tp)
print(NN, slug, len(ids), 'types :', ', '.join(ids))
