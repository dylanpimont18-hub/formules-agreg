// Moteur de questions : découpe des formules en cases, génération des QCM.
// Module pur (sans DOM) : utilisable dans le navigateur et sous Node.

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

/** Prépare les formules : parse + index par notion/bloc. */
export function prepare(formules) {
  const list = formules.map(f => ({ ...f, parts: parseTex(f.tex) }));
  const byNotion = new Map(), byBloc = new Map();
  for (const f of list) {
    const slots = f.parts.filter(p => p.slot).map(p => p.answer);
    push(byNotion, f.notion, slots);
    push(byBloc, f.bloc, slots);
  }
  return { list, byNotion, byBloc };
}
function push(map, k, vals) { if (!map.has(k)) map.set(k, []); map.get(k).push(...vals); }

/** Toutes les questions possibles : une par case de chaque formule. */
export function allQuestions(db, blocs) {
  const qs = [];
  for (const f of db.list) {
    if (blocs && !blocs.has(f.bloc)) continue;
    f.parts.forEach((p, idx) => { if (p.slot) qs.push({ key: f.id + '#' + idx, formule: f, idx }); });
  }
  return qs;
}

/** Génère le QCM : énoncé LaTeX, 4 propositions, index de la bonne. */
export function buildQuestion(db, q, rand = Math.random) {
  const f = q.formule, target = f.parts[q.idx];
  const answer = target.answer, nAns = norm(answer);
  const enonce = f.parts.map((p, i) =>
    !p.slot ? p.text : i === q.idx ? '{\\color{#e11d48}\\boxed{\\;?\\;}}' : '{' + p.answer + '}'
  ).join('');

  const chosen = [], seen = new Set([nAns]);
  const take = (pool, max) => {
    for (const c of shuffle(pool, rand)) {
      if (chosen.length >= 3 || max <= 0) break;
      const n = norm(c);
      if (!c || seen.has(n)) continue;
      seen.add(n); chosen.push(c); max--;
    }
  };
  const constant = isConstant(answer);
  const sameKind = arr => arr.filter(c => isConstant(c) === constant);
  const others = f.parts.filter((p, i) => p.slot && i !== q.idx).map(p => p.answer);

  take(target.traps, 2);
  take(sameKind(others), 3);
  take(target.traps, 3);
  take(sameKind(db.byNotion.get(f.notion) || []), 3);
  if (constant) take(CONSTANTES, 3);
  take(sameKind(db.byBloc.get(f.bloc) || []), 3);
  take(others, 3);
  take(db.byBloc.get(f.bloc) || [], 3);

  const options = shuffle([answer, ...chosen], rand);
  return { enonce, options, correct: options.indexOf(answer), complete: f.parts.map(p => p.slot ? '{' + p.answer + '}' : p.text).join('') };
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
