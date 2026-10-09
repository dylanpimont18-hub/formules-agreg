// Tests du moteur de questions : node test/quiz.test.mjs
import assert from 'node:assert/strict';
import { parseTex, prepare, allQuestions, buildQuestion, isConstant, consigne } from '../js/quiz.js';

const p = parseTex(String.raw`[[U]] = [[R|R^2|\frac{1}{R}]] \cdot [[x[n]|x[n-1]]]`);
assert.deepEqual(p.filter(s => s.slot).map(s => s.answer), ['U', 'R', 'x[n]']);
assert.deepEqual(p[2].traps, ['R^2', String.raw`\frac{1}{R}`]);
assert.deepEqual(p[4].traps, ['x[n-1]']);

assert.ok(isConstant(String.raw`\sqrt{3}`));
assert.ok(isConstant(String.raw`2\pi`));
assert.ok(isConstant(String.raw`\frac{1}{2}`));
assert.ok(!isConstant(String.raw`\omega`));
assert.ok(!isConstant('R'));

const db = prepare([
  { id: 'a', bloc: 'OE3', notion: 'n', tex: String.raw`[[U]] = [[R|R^2]] \cdot [[I]]` },
  { id: 'b', bloc: 'OE3', notion: 'n', tex: String.raw`[[P]] = [[\sqrt{3}|\sqrt{2}]] [[U]] [[I]] [[\cos\varphi|\sin\varphi]]` },
]);
const qs = allQuestions(db);
assert.equal(qs.length, 8);
for (const q of qs) for (let k = 0; k < 20; k++) {
  const Q = buildQuestion(db, q);
  assert.equal(Q.options.length, 4, q.key);
  assert.equal(new Set(Q.options).size, 4);
  assert.equal(Q.options[Q.correct], q.formule.parts[q.idx].answer);
  assert.ok(Q.enonce.includes('?'));
}
// Une constante est concurrencée par des constantes, pas par des lettres.
const qc = qs.find(q => q.key === 'b#2');
for (let k = 0; k < 20; k++) assert.ok(buildQuestion(db, qc).options.every(isConstant));
// Consigne selon la case masquée.
assert.match(consigne(qs.find(q => q.key === 'b#0')), /calculer/);
assert.match(consigne(qs.find(q => q.key === 'b#2')), /constante/);
assert.match(consigne(qs.find(q => q.key === 'b#4')), /terme manque/);
console.log('OK');
