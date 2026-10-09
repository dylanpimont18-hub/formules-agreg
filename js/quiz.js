// Moteur de questions : découpe des formules en cases, génération des QCM.
// Module pur (sans DOM) : utilisable dans le navigateur et sous Node.
import { dimension, memeDimension } from './unites.js';

/** Types de questions et part de chacun dans une série mélangée. */
export const TYPES = {
  trou: { label: 'Trous dans la formule', poids: 0.55 },
  forme: { label: 'Bonne écriture', poids: 0.2 },
  nom: { label: 'Nom de la formule', poids: 0.15 },
  unite: { label: 'Unités', poids: 0.1 },
};

/** Découpe un tex "[[U]] = [[R|R^2]] \cdot [[I]]" en segments texte / case. */
export function parseTex(tex) {
  const parts = [];
  let i = 0, buf = '';
  while (i < tex.length) {
    if (tex.startsWith('[[', i)) {
      let j = i + 2, depth = 0, inner = '';
      while (j < tex.length) {
        if (depth === 0 && tex.startsWith(']]', j)) break;
        const c = tex[j];
        if (c === '[') depth++;
        else if (c === ']') depth--;
        inner += c; j++;
      }
      if (j >= tex.length) throw new Error('Case non fermée : ' + tex);
      if (buf) parts.push({ text: buf }), buf = '';
      const [answer, ...traps] = splitTopLevel(inner);
      parts.push({ slot: true, answer: answer.trim(), traps: traps.map(t => t.trim()).filter(Boolean) });
      i = j + 2;
    } else {
      buf += tex[i++];
    }
  }
  if (buf) parts.push({ text: buf });
  return parts;
}

// Coupe sur les "|" hors accolades (pour autoriser d'éventuels {|} imbriqués).
function splitTopLevel(s) {
  const out = []; let depth = 0, cur = '';
  for (const c of s) {
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (c === '|' && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out;
}

export const norm = s => s.replace(/\s+/g, '').replace(/\\left|\\right/g, '');

/** Une case est "constante" si elle ne contient aucune lettre hors commandes LaTeX. */
export function isConstant(s) {
  const t = s.replace(/\\(pi|frac|dfrac|tfrac|sqrt|cdot|times|left|right)(?![a-zA-Z])/g, '');
  return !/[a-zA-Z]/.test(t);
}

const CONSTANTES = ['2', '\\frac{1}{2}', '\\sqrt{2}', '\\sqrt{3}', '3', '4', '\\pi', '2\\pi', '\\frac{1}{\\sqrt{2}}', '\\frac{\\pi}{4}'];
const TROU = '{\\color{#e11d48}\\boxed{\\;?\\;}}';
export const SANS_DIM = '\\text{sans dimension}';
const uniteTex = u => (u ? '\\mathrm{' + u + '}' : SANS_DIM);

/** Formule complète (cases remplies par la bonne réponse), éventuellement une case remplacée. */
export function completeTex(f, idx = -1, remplacement = '') {
  return f.parts.map((p, i) => !p.slot ? p.text : '{' + (i === idx ? remplacement : p.answer) + '}').join('');
}

/** Prépare les formules : parse + index par notion/bloc. */
export function prepare(formules) {
  const list = formules.map(f => ({ ...f, grandeurs: f.grandeurs || [], parts: parseTex(f.tex) }));
  const idx = () => ({ notion: new Map(), bloc: new Map() });
  const slots = idx(), noms = idx(), unites = idx();
  for (const f of list) {
    const add = (ix, vals) => { push(ix.notion, f.notion, vals); push(ix.bloc, f.bloc, vals); };
    add(slots, f.parts.filter(p => p.slot).map(p => p.answer));
    add(noms, [f.nom]);
    add(unites, f.grandeurs.map(g => uniteTex(g.u)));
  }
  const toutesUnites = [...new Set(list.flatMap(f => f.grandeurs.map(g => uniteTex(g.u))))];
  return { list, slots, noms, unites, toutesUnites };
}
function push(map, k, vals) { if (!map.has(k)) map.set(k, []); map.get(k).push(...vals); }

/** Variantes fausses d'une formule : une case remplacée par un de ses pièges. */
function variantes(f) {
  const out = [];
  f.parts.forEach((p, i) => { if (p.slot) p.traps.forEach(t => out.push({ i, tex: completeTex(f, i, t) })); });
  return out;
}

/** Toutes les questions possibles, tous types confondus. */
export function allQuestions(db) {
  const qs = [], unitesVues = new Set();
  for (const f of db.list) {
    f.parts.forEach((p, idx) => { if (p.slot) qs.push({ key: f.id + '#' + idx, type: 'trou', formule: f, idx }); });
    qs.push({ key: f.id + '@nom', type: 'nom', formule: f });
    if (new Set(variantes(f).map(v => norm(v.tex))).size >= 3 && norm(completeTex(f)).length <= 110) qs.push({ key: f.id + '@forme', type: 'forme', formule: f });
    for (const g of f.grandeurs) {
      const k = 'u:' + norm(g.s) + '|' + g.nom.toLowerCase();
      if (unitesVues.has(k)) continue;
      unitesVues.add(k);
      qs.push({ key: k, type: 'unite', formule: f, g });
    }
  }
  return qs;
}

/** Génère le QCM : { type, enonce (LaTeX ou null), options, texte (options en texte brut ?), correct, complete }. */
export function buildQuestion(db, q, rand = Math.random) {
  const f = q.formule, complete = completeTex(f);
  const chosen = [];
  const take = (pool, max, seen, ok = () => true) => {
    for (const c of shuffle(pool, rand)) {
      if (chosen.length >= 3 || max <= 0) break;
      const n = norm(c).toLowerCase();
      if (!c || seen.has(n) || !ok(c)) continue;
      seen.add(n); chosen.push(c); max--;
    }
  };
  const fin = (enonce, answer, texte = false) => {
    const options = shuffle([answer, ...chosen], rand);
    return { type: q.type, enonce, options, texte, correct: options.indexOf(answer), complete };
  };

  if (q.type === 'nom') {
    const seen = new Set([norm(f.nom).toLowerCase()]);
    take(db.noms.notion.get(f.notion) || [], 3, seen);
    take(db.noms.bloc.get(f.bloc) || [], 3, seen);
    return fin(complete, f.nom, true);
  }

  if (q.type === 'forme') {
    const vs = shuffle(variantes(f), rand), seen = new Set([norm(complete).toLowerCase()]), cases = new Set();
    // D'abord des variantes portant sur des cases différentes, puis le reste.
    take(vs.filter(v => !cases.has(v.i) && cases.add(v.i)).map(v => v.tex), 3, seen);
    take(vs.map(v => v.tex), 3, seen);
    return fin(null, complete);
  }

  if (q.type === 'unite') {
    const answer = uniteTex(q.g.u), dim = dimension(q.g.u);
    const seen = new Set([norm(answer).toLowerCase()]);
    const ok = u => !memeDimension(dim, dimension(u === SANS_DIM ? '' : u));
    take(db.unites.notion.get(f.notion) || [], 2, seen, ok);
    take(db.unites.bloc.get(f.bloc) || [], 3, seen, ok);
    take(db.toutesUnites, 3, seen, ok);
    return fin(`\\left[\\,${q.g.s}\\,\\right] = ${TROU}`, answer);
  }

  // Trou dans la formule.
  const target = f.parts[q.idx], answer = target.answer;
  const enonce = f.parts.map((p, i) => !p.slot ? p.text : i === q.idx ? TROU : '{' + p.answer + '}').join('');
  const seen = new Set([norm(answer).toLowerCase()]);
  const constant = isConstant(answer);
  const sameKind = arr => arr.filter(c => isConstant(c) === constant);
  const others = f.parts.filter((p, i) => p.slot && i !== q.idx).map(p => p.answer);
  take(target.traps, 2, seen);
  take(sameKind(db.slots.notion.get(f.notion) || []), 1, seen);
  take(target.traps, 3, seen);
  if (constant) take(CONSTANTES, 3, seen);
  take(sameKind(db.slots.notion.get(f.notion) || []), 3, seen);
  take(sameKind(others), 3, seen);
  take(sameKind(db.slots.bloc.get(f.bloc) || []), 3, seen);
  take(others, 3, seen);
  take(db.slots.bloc.get(f.bloc) || [], 3, seen);
  return fin(enonce, answer);
}

/** Consigne lisible selon le type et la case masquée. */
export function consigne(q) {
  if (q.type === 'nom') return 'Comment s\'appelle cette relation ?';
  if (q.type === 'forme') return 'Quelle est l\'écriture correcte ?';
  if (q.type === 'unite') return `Quelle est l'unité SI de cette grandeur : ${q.g.nom} ?`;
  const parts = q.formule.parts, answer = parts[q.idx].answer;
  if (isConstant(answer)) return 'Quel coefficient ou quelle constante numérique manque ?';
  const rel = parts.findIndex(p => !p.slot && /=|\\approx|\\simeq|\\le|\\ge|<|>|\\propto|\\equiv|\\Leftrightarrow|\\Rightarrow/.test(p.text));
  if (rel !== -1 && q.idx < rel) return 'Quelle grandeur cette relation permet-elle de calculer ?';
  return 'Quel terme manque dans la relation ?';
}

/** Choisit un type selon les poids, parmi ceux présents dans le lot. */
export function pickType(questions, rand = Math.random) {
  const presents = Object.keys(TYPES).filter(t => questions.some(q => q.type === t));
  let r = rand() * presents.reduce((a, t) => a + TYPES[t].poids, 0);
  for (const t of presents) { r -= TYPES[t].poids; if (r <= 0) return t; }
  return presents[presents.length - 1];
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tirage pondéré : les questions ratées ou jamais vues sortent plus souvent. */
export function pickWeighted(questions, stats, avoidKey, rand = Math.random) {
  const w = questions.map(q => {
    if (q.key === avoidKey && questions.length > 1) return 0;
    const s = stats[q.key];
    if (!s) return 3;
    const errRate = (s.wrong + 1) / (s.seen + 2);
    return 0.3 + 6 * errRate / (1 + (s.streak || 0));
  });
  let r = rand() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < questions.length; i++) { r -= w[i]; if (r <= 0) return questions[i]; }
  return questions[questions.length - 1];
}
