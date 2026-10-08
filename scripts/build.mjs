// Fusionne data/src/*.json -> data/formules.json, après validation complète.
// Usage : node scripts/build.mjs   (code de sortie 1 si erreur bloquante)
import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import { prepare, allQuestions, buildQuestion, parseTex, norm } from '../js/quiz.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const srcDir = path.join(root, 'data', 'src');
const BLOCS = ['OE1', 'OE2', 'OE3', 'TC1', 'TC2', 'TC3', 'TC4', 'TC5'];
const CHAMPS = ['id', 'bloc', 'notion', 'nom', 'tex', 'legende', 'source'];

const errors = [], warnings = [];
const all = [];
for (const file of fs.readdirSync(srcDir).filter(f => f.endsWith('.json')).sort()) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8')); }
  catch (e) { errors.push(`${file}: JSON invalide (${e.message})`); continue; }
  for (const f of arr) all.push({ ...f, _file: file });
}

const tryKatex = (tex, ctx) => {
  try { katex.renderToString(tex, { throwOnError: true, strict: false }); return true; }
  catch (e) { errors.push(`${ctx}: KaTeX — ${e.message.split('\n')[0]}`); return false; }
};

const ids = new Set(), seenFormula = new Map(), kept = [];
for (const f of all) {
  const ctx = `${f._file} ${f.id}`;
  const missing = CHAMPS.filter(c => typeof f[c] !== 'string' || !f[c].trim());
  if (missing.length) { errors.push(`${ctx}: champs manquants ${missing}`); continue; }
  if (!BLOCS.includes(f.bloc)) { errors.push(`${ctx}: bloc inconnu ${f.bloc}`); continue; }
  if (ids.has(f.id)) { errors.push(`${ctx}: id en double`); continue; }
  ids.add(f.id);
  let parts;
  try { parts = parseTex(f.tex); } catch (e) { errors.push(`${ctx}: ${e.message}`); continue; }
  const slots = parts.filter(p => p.slot);
  if (slots.length < 2) { errors.push(`${ctx}: moins de 2 cases`); continue; }
  const contents = slots.map(s => norm(s.answer));
  if (new Set(contents).size !== contents.length) { errors.push(`${ctx}: deux cases identiques`); continue; }
  const complete = parts.map(p => p.slot ? '{' + p.answer + '}' : p.text).join('');
  if (!tryKatex(complete, ctx)) continue;
  if (![...slots.flatMap(s => s.traps)].every(t => tryKatex(t, ctx + ' (piège ' + t + ')'))) continue;
  const key = norm(complete);
  if (seenFormula.has(key)) { warnings.push(`${ctx}: doublon de ${seenFormula.get(key)} (ignoré)`); continue; }
  seenFormula.set(key, f.id);
  const { _file, ...clean } = f;
  kept.push(clean);
}

kept.sort((a, b) => BLOCS.indexOf(a.bloc) - BLOCS.indexOf(b.bloc) || a.notion.localeCompare(b.notion, 'fr', { numeric: true }));

// Vérifie chaque question générée (avec plusieurs tirages).
const db = prepare(kept);
const qs = allQuestions(db);
let faibles = 0;
for (const q of qs) {
  for (let t = 0; t < 3; t++) {
    const Q = buildQuestion(db, q);
    if (Q.options.length < 4) { faibles++; warnings.push(`${q.key}: seulement ${Q.options.length} propositions`); break; }
    if (t === 0 && !tryKatex(Q.enonce, q.key + ' énoncé')) break;
    if (t === 0) Q.options.forEach(o => tryKatex(o, q.key + ' option'));
  }
}

fs.writeFileSync(path.join(root, 'data', 'formules.json'), JSON.stringify(kept, null, 1));
const parBloc = BLOCS.map(b => `${b}:${kept.filter(f => f.bloc === b).length}`).join(' ');
console.log(`Formules : ${kept.length} (${parBloc})`);
console.log(`Questions : ${qs.length} (dont ${faibles} avec < 4 propositions)`);
if (warnings.length) console.log(`\n${warnings.length} avertissement(s) :\n` + warnings.join('\n'));
if (errors.length) { console.log(`\n${errors.length} erreur(s) :\n` + errors.join('\n')); process.exit(1); }
