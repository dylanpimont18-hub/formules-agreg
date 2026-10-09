// Tests du moteur de questions : node test/quiz.test.mjs
import assert from 'node:assert/strict';
import { parseTex, prepare, allQuestions, buildQuestion, isConstant, consigne, SANS_DIM } from '../js/quiz.js';
import { dimension, memeDimension } from '../js/unites.js';
import { enregistrer, estAcquise, fileDuJour, majJour, serieActuelle } from '../js/srs.js';

const t = String.raw;

// --- Découpe ---
const p = parseTex(t`[[U]] = [[R|R^2|\frac{1}{R}]] \cdot [[x[n]|x[n-1]]]`);
assert.deepEqual(p.filter(s => s.slot).map(s => s.answer), ['U', 'R', 'x[n]']);
assert.deepEqual(p[2].traps, ['R^2', t`\frac{1}{R}`]);
assert.deepEqual(p[4].traps, ['x[n-1]']);

assert.ok(isConstant(t`\sqrt{3}`));
assert.ok(isConstant(t`2\pi`));
assert.ok(isConstant(t`\frac{1}{2}`));
assert.ok(!isConstant(t`\omega`));
assert.ok(!isConstant('R'));

// --- Questions ---
const G = (s, nom, u) => ({ s, nom, u });
const db = prepare([
  { id: 'a', bloc: 'OE3', notion: 'n', nom: 'Loi d\'Ohm', tex: t`[[U]] = [[R|R^2|\frac{1}{R}]] \cdot [[I|I^2]]`, grandeurs: [G('U', 'tension', 'V'), G('R', 'résistance', t`\Omega`), G('I', 'courant', 'A')] },
  { id: 'b', bloc: 'OE3', notion: 'n', nom: 'Puissance active', tex: t`[[P]] = [[\sqrt{3}|\sqrt{2}|3]] [[U]] [[I]] [[\cos\varphi|\sin\varphi]]`, grandeurs: [G('P', 'puissance', 'W'), G(t`\cos\varphi`, 'facteur de puissance', '')] },
  { id: 'c', bloc: 'OE3', notion: 'n', nom: 'Énergie', tex: t`[[E]] = [[P]] [[t]]`, grandeurs: [G('E', 'énergie', 'J'), G('t', 'durée', 's'), G('C', 'couple', t`N\cdot m`)] },
  { id: 'd', bloc: 'OE3', notion: 'n', nom: 'Fréquence', tex: t`[[f]] = [[\frac{1}{T}]]`, grandeurs: [G('f', 'fréquence', 'Hz')] },
]);
const qs = allQuestions(db);
const trous = qs.filter(q => q.type === 'trou');
assert.equal(trous.length, 13);
for (const q of qs) for (let k = 0; k < 20; k++) {
  const Q = buildQuestion(db, q);
  assert.equal(Q.options.length, 4, q.key);
  assert.equal(new Set(Q.options).size, 4, q.key);
  assert.ok(Q.correct >= 0, q.key);
}
for (const q of trous) for (let k = 0; k < 10; k++) {
  const Q = buildQuestion(db, q);
  assert.equal(Q.options[Q.correct], q.formule.parts[q.idx].answer);
  assert.ok(Q.enonce.includes('?'));
}
// Une constante est concurrencée par des constantes, pas par des lettres.
const qc = qs.find(q => q.key === 'b#2');
for (let k = 0; k < 20; k++) assert.ok(buildQuestion(db, qc).options.every(isConstant));

// Nom : bonne réponse = nom de la formule, options en texte.
const qn = buildQuestion(db, qs.find(q => q.key === 'a@nom'));
assert.ok(qn.texte);
assert.equal(qn.options[qn.correct], 'Loi d\'Ohm');

// Bonne écriture : 4 écritures distinctes dont la vraie.
const qf = qs.find(q => q.key === 'b@forme');
assert.ok(qf);
const Qf = buildQuestion(db, qf);
assert.equal(Qf.enonce, null);
assert.equal(Qf.options[Qf.correct], Qf.complete);

// Unités : jamais d'unité de même dimension que la réponse (J vs N·m).
const qe = qs.find(q => q.type === 'unite' && q.g.nom === 'énergie');
for (let k = 0; k < 30; k++) {
  const Q = buildQuestion(db, qe);
  assert.equal(Q.options[Q.correct], t`\mathrm{J}`);
  assert.ok(!Q.options.includes(t`\mathrm{N\cdot m}`));
}
const qsd = qs.find(q => q.type === 'unite' && q.g.u === '');
assert.equal(buildQuestion(db, qsd).options.includes(SANS_DIM), true);

// --- Consignes ---
assert.match(consigne(qs.find(q => q.key === 'b#0')), /calculer/);
assert.match(consigne(qs.find(q => q.key === 'b#2')), /constante/);
assert.match(consigne(qs.find(q => q.key === 'b#4')), /terme manque/);
assert.match(consigne(qe), /énergie/);

// --- Unités ---
assert.ok(memeDimension(dimension('J'), dimension(t`N\cdot m`)));
assert.ok(memeDimension(dimension('W'), dimension(t`V\cdot A`)));
assert.ok(memeDimension(dimension(t`W\cdot m^{-2}\cdot K^{-1}`), dimension(t`\mathrm{W/(m^2\cdot K)}`)));
assert.ok(memeDimension(dimension(t`^\circ C`), dimension('K')));
assert.ok(!memeDimension(dimension('W'), dimension('J')));
assert.equal(dimension('inconnue'), null);
assert.ok(!memeDimension(null, dimension('J')));

// --- Répétition espacée ---
const J = 864e5, t0 = new Date(2026, 9, 9, 10).getTime();
let s = enregistrer(undefined, true, t0);
assert.equal(s.box, 1);
assert.equal(s.due, new Date(2026, 9, 10).getTime()); // demain
s = enregistrer(s, true, t0 + J);
s = enregistrer(s, true, t0 + 4 * J);
assert.ok(estAcquise(s));
s = enregistrer(s, false, t0 + 11 * J);
assert.equal(s.box, 0);
assert.ok(!estAcquise(s));
assert.equal(s.due, t0 + 11 * J);
// Ancienne stat sans boîte : convertie.
assert.equal(enregistrer({ seen: 3, wrong: 0, streak: 3 }, true, t0).box, 4);

const fq = [{ key: 'x' }, { key: 'y' }, { key: 'z' }, { key: 'w' }];
const st = { x: { seen: 1, wrong: 0, streak: 1, box: 1, due: t0 - J }, y: { seen: 1, wrong: 0, streak: 1, box: 1, due: t0 + J } };
const fj = fileDuJour(fq, st, t0, 1);
assert.deepEqual(fj.dues.map(q => q.key), ['x']);
assert.equal(fj.nouvelles.length, 1);

let jr = majJour({}, t0, true);
assert.equal(jr.serie, 1);
jr = majJour(jr, t0 + J, false);
assert.equal(jr.serie, 2);
assert.equal(jr.nouvelles, 0);
assert.equal(serieActuelle(jr, t0 + 2 * J), 2);
assert.equal(serieActuelle(jr, t0 + 3 * J), 0);

console.log('OK');
