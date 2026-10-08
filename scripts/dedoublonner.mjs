// Applique data/doublons.json aux sources : retire les doublons et fusionne leurs sources.
// Usage : node scripts/dedoublonner.mjs
import fs from 'node:fs';
const dir = 'data/src/';
const doublons = JSON.parse(fs.readFileSync('data/doublons.json', 'utf8'));
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const data = Object.fromEntries(files.map(f => [f, JSON.parse(fs.readFileSync(dir + f, 'utf8'))]));
const byId = new Map(Object.values(data).flat().map(f => [f.id, f]));
const retirer = new Set();
for (const { retirer: r, garder: g } of doublons) {
  const fr = byId.get(r), fg = byId.get(g);
  if (!fr || !fg || retirer.has(g)) { console.log('ignoré', r, '->', g); continue; }
  retirer.add(r);
  const sources = new Set(fg.source.split(/\s*;\s*/));
  fr.source.split(/\s*;\s*/).forEach(s => sources.add(s));
  if (sources.size > 1) sources.delete('Classique programme');
  fg.source = [...sources].join(' ; ');
}
for (const f of files) fs.writeFileSync(dir + f, JSON.stringify(data[f].filter(x => !retirer.has(x.id)), null, 2) + '\n');
console.log(retirer.size, 'formules retirées');
