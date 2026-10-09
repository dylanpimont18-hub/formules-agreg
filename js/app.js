// Interface : réglages, déroulé du QCM, formulaire, progrès.
import { prepare, allQuestions, buildQuestion, pickWeighted, shuffle, consigne } from './quiz.js';

const BLOCS = {
  OE1: 'Automatique', OE2: 'Électronique', OE3: 'Électrotechnique',
  TC1: 'Compétitivité des produits', TC2: 'Ingénierie des systèmes', TC3: 'Modélisation des systèmes',
  TC4: 'Simulation numérique', TC5: 'Informatique',
};
const $ = s => document.querySelector(s);
const tex = (el, s, display = true) => {
  try { katex.render(s, el, { displayMode: display, throwOnError: false, strict: false }); }
  catch { el.textContent = s; }
};

// --- Stockage local (progression par question) ---
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};
let stats = store.get('fa-stats', {});

let db, questions = [];
const session = { pool: [], n: 0, max: 20, ok: 0, current: null, Q: null, answered: false, errors: [] };

init();

async function init() {
  const formules = await (await fetch('data/formules.json')).json();
  db = prepare(formules);
  questions = allQuestions(db);
  $('#stats-global').textContent = `${formules.length} formules · ${questions.length} questions possibles`;
  renderBlocs();
  renderListe('');
  bindUI();
}

// --- Choix des thèmes ---
function renderBlocs() {
  const saved = new Set(store.get('fa-notions', []));
  const box = $('#blocs');
  for (const b of Object.keys(BLOCS)) {
    const fs = db.list.filter(f => f.bloc === b);
    if (!fs.length) continue;
    const notions = [...new Set(fs.map(f => f.notion))];
    const d = document.createElement('details');
    d.className = 'bloc';
    const nq = n => questions.filter(q => q.formule.notion === n).length;
    d.innerHTML = `<summary><label class="check"><input type="checkbox" class="bloc-cb" data-bloc="${b}">
      <b>${b}</b> ${BLOCS[b]}</label><span class="muted">${fs.length} formules</span></summary>
      <div class="notions">${notions.map(n => `<label class="check"><input type="checkbox" class="notion-cb" data-bloc="${b}" value="${esc(n)}">
      ${esc(n)} <span class="muted">(${nq(n)} q.)</span></label>`).join('')}</div>`;
    box.append(d);
    d.querySelectorAll('.notion-cb').forEach(cb => { cb.checked = saved.size ? saved.has(cb.value) : true; });
    syncBloc(b);
  }
  box.addEventListener('change', e => {
    const t = e.target;
    if (t.classList.contains('bloc-cb')) box.querySelectorAll(`.notion-cb[data-bloc="${t.dataset.bloc}"]`).forEach(cb => cb.checked = t.checked);
    syncBloc(t.dataset.bloc);
  });
}
function syncBloc(b) {
  const cbs = [...document.querySelectorAll(`.notion-cb[data-bloc="${b}"]`)];
  const head = document.querySelector(`.bloc-cb[data-bloc="${b}"]`);
  const n = cbs.filter(c => c.checked).length;
  head.checked = n === cbs.length; head.indeterminate = n > 0 && n < cbs.length;
}
const selectedNotions = () => new Set([...document.querySelectorAll('.notion-cb:checked')].map(c => c.value));

// --- Déroulé du QCM ---
function start() {
  const notions = selectedNotions();
  store.set('fa-notions', [...notions]);
  session.pool = questions.filter(q => notions.has(q.formule.notion));
  if (!session.pool.length) { alert('Coche au moins une notion.'); return; }
  Object.assign(session, { n: 0, ok: 0, errors: [], current: null, max: +$('#longueur').value, general: false });
  show('#quiz');
  next();
}

// Série générale : 20 questions, tous thèmes, un bloc tiré au sort à chaque question.
function startGeneral() {
  session.pool = questions;
  Object.assign(session, { n: 0, ok: 0, errors: [], current: null, max: 20, general: true });
  show('#quiz');
  next();
}

function next() {
  if (session.max && session.n >= session.max) return finish();
  const avoid = session.current?.key;
  let pool = session.pool;
  if (session.general) {
    const blocs = [...new Set(pool.map(q => q.formule.bloc))].filter(b => b !== session.current?.formule.bloc);
    const bloc = shuffle(blocs)[0];
    pool = pool.filter(q => q.formule.bloc === bloc);
  }
  session.current = $('#priorite').checked
    ? pickWeighted(pool, stats, avoid)
    : shuffle(pool.filter(q => q.key !== avoid || pool.length === 1))[0];
  const q = session.current, f = q.formule;
  session.Q = buildQuestion(db, q);
  session.answered = false;
  $('#q-bloc').textContent = `${f.bloc} · ${BLOCS[f.bloc]}`;
  $('#q-notion').textContent = f.notion;
  $('#q-num').textContent = `Question ${session.n + 1}${session.max ? ' / ' + session.max : ''}`;
  $('#q-nom').textContent = f.nom;
  $('#q-consigne').textContent = consigne(q);
  const s = stats[q.key];
  $('#q-historique').textContent = s
    ? `Déjà vue ${s.seen} fois · ${s.seen - s.wrong} réussite${s.seen - s.wrong > 1 ? 's' : ''}${s.streak >= 2 ? ' · acquise' : ''}`
    : 'Nouvelle question';
  $('#q-historique').className = 'historique ' + (!s ? 'new' : s.streak >= 2 ? 'ok' : s.wrong ? 'ko' : '');
  $('#q-legende').textContent = f.legende;
  $('#q-indice').open = false;
  tex($('#q-tex'), session.Q.enonce);
  const opts = $('#options');
  opts.innerHTML = '';
  session.Q.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'option';
    b.innerHTML = `<span class="num">${i + 1}</span><span class="opt-tex"></span>`;
    tex(b.querySelector('.opt-tex'), o, false);
    b.onclick = () => answer(i);
    opts.append(b);
  });
  $('#feedback').classList.add('hidden');
  updateHead();
}

function answer(i) {
  if (session.answered) return;
  session.answered = true;
  session.n++;
  const { Q, current: q } = session, ok = i === Q.correct, f = q.formule;
  const s = stats[q.key] ?? { seen: 0, wrong: 0, streak: 0 };
  s.seen++;
  if (ok) { s.streak++; session.ok++; } else { s.wrong++; s.streak = 0; session.errors.push(q); }
  stats[q.key] = s; store.set('fa-stats', stats);

  [...$('#options').children].forEach((b, j) => {
    b.disabled = true;
    if (j === Q.correct) b.classList.add('good');
    else if (j === i) b.classList.add('bad');
  });
  $('#fb-verdict').textContent = ok ? '✓ Bonne réponse' : '✗ Raté';
  $('#fb-verdict').className = 'verdict ' + (ok ? 'ok' : 'ko');
  $('#fb-nom').textContent = f.nom;
  tex($('#fb-tex'), Q.complete);
  $('#fb-legende').textContent = f.legende;
  $('#fb-source').textContent = 'Source : ' + f.source;
  $('#feedback').classList.remove('hidden');
  $('#next').focus();
  updateHead();
}

function updateHead() {
  $('#score').textContent = `${session.ok} / ${session.n}`;
  $('#bar').style.width = session.max ? `${100 * session.n / session.max}%` : '0';
}

function finish() {
  const { ok, n, errors } = session, pct = n ? Math.round(100 * ok / n) : 0;
  $('#bilan-titre').textContent = `${ok} / ${n} — ${pct} %`;
  $('#bilan-texte').textContent = pct >= 90 ? 'Excellent, ces formules sont acquises.' : pct >= 60 ? 'Bien. Les erreurs reviendront plus souvent.' : 'À retravailler : les formules ratées reviendront en priorité.';
  const box = $('#bilan-erreurs');
  box.innerHTML = errors.length ? '<h2>À revoir</h2>' : '';
  const vus = new Set();
  for (const q of errors) {
    if (vus.has(q.formule.id)) continue;
    vus.add(q.formule.id);
    box.append(formuleCard(q.formule));
  }
  show('#bilan');
}

function show(id) { ['#setup', '#quiz', '#bilan'].forEach(s => $(s).classList.toggle('hidden', s !== id)); }

// --- Formulaire ---
function formuleCard(f) {
  const d = document.createElement('div');
  d.className = 'fcard';
  d.innerHTML = `<div class="fhead"><span class="pill">${f.bloc}</span> <b>${esc(f.nom)}</b></div><div class="formula small"></div>
    <div class="muted">${esc(f.legende)}</div><div class="source">${esc(f.notion)} — ${esc(f.source)}</div>`;
  tex(d.querySelector('.formula'), f.parts.map(p => p.slot ? '{' + p.answer + '}' : p.text).join(''));
  return d;
}

function renderListe(filtre) {
  const box = $('#liste');
  box.innerHTML = '';
  const t = filtre.trim().toLowerCase();
  const fs = db.list.filter(f => !t || [f.nom, f.notion, f.legende, f.bloc, f.tex].some(x => x.toLowerCase().includes(t)));
  let notion = null;
  for (const f of fs.slice(0, 400)) {
    if (f.notion !== notion) {
      notion = f.notion;
      const h = document.createElement('h2'); h.textContent = notion; box.append(h);
    }
    box.append(formuleCard(f));
  }
  if (!fs.length) box.innerHTML = '<p class="muted">Aucune formule.</p>';
  else if (fs.length > 400) box.insertAdjacentHTML('beforeend', `<p class="muted">… ${fs.length - 400} autres, affine la recherche.</p>`);
}

// --- Progrès ---
function renderProgres() {
  const rows = Object.keys(BLOCS).map(b => {
    const qs = questions.filter(q => q.formule.bloc === b);
    if (!qs.length) return '';
    const vues = qs.filter(q => stats[q.key]);
    const acquises = qs.filter(q => (stats[q.key]?.streak ?? 0) >= 2).length;
    const seen = vues.reduce((a, q) => a + stats[q.key].seen, 0);
    const wrong = vues.reduce((a, q) => a + stats[q.key].wrong, 0);
    const pct = Math.round(100 * acquises / qs.length);
    return `<div class="prow"><div><b>${b}</b> ${BLOCS[b]}<div class="muted">${vues.length}/${qs.length} vues · ${acquises} acquises · réussite ${seen ? Math.round(100 * (seen - wrong) / seen) : 0} %</div></div>
      <div class="pbar"><div style="width:${pct}%"></div></div><span class="ppct">${pct} %</span></div>`;
  });
  $('#progres').innerHTML = rows.join('') + '<p class="muted">Une question est « acquise » après 2 bonnes réponses d\'affilée.</p>';
}

// --- Événements ---
function bindUI() {
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + t.dataset.view));
    if (t.dataset.view === 'progres') renderProgres();
  });
  $('#go').onclick = start;
  $('#next').onclick = next;
  $('#stop').onclick = () => session.n ? finish() : show('#setup');
  $('#general').onclick = startGeneral;
  $('#rejouer').onclick = () => session.general ? startGeneral() : start();
  $('#retour').onclick = () => show('#setup');
  $('#tout').onclick = () => setAll(true);
  $('#rien').onclick = () => setAll(false);
  $('#recherche').oninput = e => renderListe(e.target.value);
  $('#reset').onclick = () => {
    if (!confirm('Effacer toute ta progression ?')) return;
    stats = {}; store.set('fa-stats', stats); renderProgres();
  };
  document.addEventListener('keydown', e => {
    if ($('#quiz').classList.contains('hidden') || e.target.tagName === 'INPUT') return;
    if (!session.answered && /^[1-4]$/.test(e.key)) answer(+e.key - 1);
    else if (!session.answered && e.key.toLowerCase() === 'i') $('#q-indice').open = !$('#q-indice').open;
    else if (session.answered && e.key === 'Enter') { e.preventDefault(); next(); }
  });
}
function setAll(v) {
  document.querySelectorAll('.notion-cb').forEach(c => c.checked = v);
  Object.keys(BLOCS).forEach(b => document.querySelector(`.bloc-cb[data-bloc="${b}"]`) && syncBloc(b));
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
