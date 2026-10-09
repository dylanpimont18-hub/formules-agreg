// Interface : révision du jour, séries, déroulé du QCM, formulaire, progrès.
import { prepare, allQuestions, buildQuestion, pickWeighted, pickType, shuffle, consigne, completeTex, TYPES } from './quiz.js';
import { enregistrer, estAcquise, estDue, fileDuJour, majJour, serieActuelle, nouvellesDuJour } from './srs.js';

const BLOCS = {
  OE1: 'Automatique', OE2: 'Électronique', OE3: 'Électrotechnique',
  TC1: 'Compétitivité des produits', TC2: 'Ingénierie des systèmes', TC3: 'Modélisation des systèmes',
  TC4: 'Simulation numérique', TC5: 'Informatique',
};
const NOUVELLES_PAR_JOUR = 15;
const TAILLE_SERIE_JOUR = 20;
const DEPOT = 'https://github.com/dylanpimont18-hub/formules-agreg';
const $ = s => document.querySelector(s);

// --- Rendu mathématique ---
function tex(el, s, display = true) {
  try { katex.render(s, el, { displayMode: display, throwOnError: false, strict: false }); }
  catch { el.textContent = s; }
}
/** Texte avec des morceaux $...$ rendus en LaTeX inline. */
function texteRiche(el, s) {
  el.innerHTML = '';
  String(s || '').split('$').forEach((morceau, i) => {
    if (i % 2 === 0) { el.append(morceau); return; }
    const span = document.createElement('span');
    tex(span, morceau, false);
    el.append(span);
  });
}
/** Réduit la taille d'une formule pour qu'elle tienne dans la largeur de son conteneur. */
function ajuster(el) {
  if (!el || !el.isConnected) return;
  el.style.fontSize = '';
  const k = el.querySelector('.katex-html') || el.querySelector('.katex');
  if (!k) return;
  const dispo = el.clientWidth, besoin = k.scrollWidth;
  if (dispo > 0 && besoin > dispo) {
    const base = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = Math.max(base * 0.5, base * dispo / besoin * 0.98) + 'px';
  }
}
const ajusterTout = (racine = document) => racine.querySelectorAll('.formula, .opt-tex.math').forEach(ajuster);

// --- Stockage local ---
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};
let stats = store.get('fa-stats', {});
let jour = store.get('fa-jour', {});

let db, questions = [];
const session = { mode: null, file: [], pool: [], n: 0, max: 20, ok: 0, current: null, Q: null, answered: false, errors: [], revues: new Set() };

init();

async function init() {
  const formules = await (await fetch('data/formules.json')).json();
  db = prepare(formules);
  questions = allQuestions(db);
  $('#stats-global').textContent = `${formules.length} formules · ${questions.length} questions`;
  renderBlocs();
  renderTypes();
  renderAccueil();
  bindUI();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.storage?.persist?.().catch(() => {});
  document.fonts?.ready.then(() => ajusterTout());
}

// --- Accueil : révision du jour ---
const typesActifs = () => new Set([...document.querySelectorAll('.type-cb:checked')].map(c => c.value));
const questionsActives = () => { const t = typesActifs(); return questions.filter(q => t.has(q.type)); };
const aRevoir = () => questionsActives().filter(q => stats[q.key]?.wrong && !estAcquise(stats[q.key]));

function fileJour() {
  const quota = NOUVELLES_PAR_JOUR - nouvellesDuJour(jour, Date.now());
  return fileDuJour(questionsActives(), stats, Date.now(), quota);
}

function renderAccueil() {
  const { dues, nouvelles } = fileJour();
  const total = dues.length + nouvelles.length;
  $('#du-jour-nb').textContent = total;
  $('#du-jour-texte').textContent = total
    ? `${dues.length} à revoir · ${nouvelles.length} nouvelle${nouvelles.length > 1 ? 's' : ''}`
    : 'Tout est à jour pour aujourd\'hui 🎉';
  $('#daily').disabled = !total;
  $('#daily').textContent = total ? `Réviser maintenant (${Math.min(total, TAILLE_SERIE_JOUR)})` : 'Rien à réviser';
  const err = aRevoir().length;
  $('#erreurs').textContent = `Mes erreurs (${err})`;
  $('#erreurs').disabled = !err;
  const serie = serieActuelle(jour, Date.now());
  $('#flamme').textContent = serie ? `🔥 ${serie} j` : '';
}

// --- Choix des thèmes et des types ---
function renderBlocs() {
  const saved = new Set(store.get('fa-notions', []));
  const box = $('#blocs');
  for (const b of Object.keys(BLOCS)) {
    const fs = db.list.filter(f => f.bloc === b);
    if (!fs.length) continue;
    const notions = [...new Set(fs.map(f => f.notion))];
    const d = document.createElement('details');
    d.className = 'bloc';
    d.innerHTML = `<summary><label class="check"><input type="checkbox" class="bloc-cb" data-bloc="${b}">
      <b>${b}</b> ${BLOCS[b]}</label><span class="muted">${fs.length}</span></summary>
      <div class="notions">${notions.map(n => `<label class="check"><input type="checkbox" class="notion-cb" data-bloc="${b}" value="${esc(n)}">
      ${esc(n)}</label>`).join('')}</div>`;
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

function renderTypes() {
  const saved = store.get('fa-types', null);
  $('#types').innerHTML = Object.entries(TYPES).map(([k, t]) => {
    const n = questions.filter(q => q.type === k).length;
    return n ? `<label class="check"><input type="checkbox" class="type-cb" value="${k}" ${!saved || saved.includes(k) ? 'checked' : ''}> ${t.label} <span class="muted">(${n})</span></label>` : '';
  }).join('');
  $('#types').addEventListener('change', () => {
    if (!typesActifs().size) document.querySelector('.type-cb').checked = true;
    store.set('fa-types', [...typesActifs()]);
    renderAccueil();
  });
}

// --- Lancement des séries ---
function lancer(mode) {
  const s = { mode, file: [], pool: [], n: 0, ok: 0, errors: [], current: null, revues: new Set(), max: 20 };
  if (mode === 'jour') {
    const { dues, nouvelles } = fileJour();
    // Les nouvelles sont intercalées parmi les révisions.
    s.file = [...dues.slice(0, TAILLE_SERIE_JOUR)];
    nouvelles.slice(0, Math.max(0, TAILLE_SERIE_JOUR - s.file.length)).forEach(q => s.file.splice(Math.floor(Math.random() * (s.file.length + 1)), 0, q));
    s.max = s.file.length;
  } else if (mode === 'erreurs') {
    s.file = shuffle(aRevoir()).slice(0, 20);
    s.max = s.file.length;
  } else if (mode === 'general') {
    s.pool = questionsActives();
  } else {
    const notions = selectedNotions();
    store.set('fa-notions', [...notions]);
    s.pool = questionsActives().filter(q => notions.has(q.formule.notion));
    s.max = +$('#longueur').value;
  }
  if (!s.file.length && !s.pool.length) { alert('Aucune question disponible avec ces réglages.'); return; }
  Object.assign(session, s);
  show('#quiz');
  next();
}

function choisir() {
  if (session.file.length) return session.file.shift();
  const avoid = session.current?.key;
  let pool = session.pool;
  if (session.mode === 'general') {
    const blocs = [...new Set(pool.map(q => q.formule.bloc))].filter(b => b !== session.current?.formule.bloc);
    const bloc = shuffle(blocs.length ? blocs : [session.current.formule.bloc])[0];
    pool = pool.filter(q => q.formule.bloc === bloc);
  }
  const type = pickType(pool);
  pool = pool.filter(q => q.type === type);
  return $('#priorite').checked
    ? pickWeighted(pool, stats, avoid)
    : shuffle(pool.filter(q => q.key !== avoid || pool.length === 1))[0];
}

function next() {
  const fileVide = (session.mode === 'jour' || session.mode === 'erreurs') && !session.file.length;
  if ((session.max && session.n >= session.max) || fileVide) return finish();
  const q = session.current = choisir(), f = q.formule;
  session.Q = buildQuestion(db, q);
  session.answered = false;

  $('#q-bloc').textContent = `${f.bloc} · ${BLOCS[f.bloc]}`;
  $('#q-notion').textContent = f.notion;
  $('#q-num').textContent = `${session.n + 1}${session.max ? ' / ' + session.max : ''}`;
  $('#q-nom').textContent = q.type === 'nom' ? 'Quelle est cette formule ?' : f.nom;
  $('#q-consigne').textContent = consigne(q);
  const s = stats[q.key];
  $('#q-historique').textContent = !s ? 'Nouvelle' : estAcquise(s) ? 'Acquise' : `Vue ${s.seen}× · ${s.seen - s.wrong} ✓`;
  $('#q-historique').className = 'historique ' + (!s ? 'new' : estAcquise(s) ? 'ok' : s.wrong ? 'ko' : '');

  $('#q-tex').classList.toggle('hidden', session.Q.enonce === null);
  if (session.Q.enonce !== null) tex($('#q-tex'), session.Q.enonce);
  // L'indice donnerait la réponse pour une question d'unité.
  $('#q-indice').classList.toggle('hidden', q.type === 'unite');
  $('#q-indice').open = false;
  renderLegende($('#q-legende'), f);

  const opts = $('#options');
  opts.innerHTML = '';
  opts.classList.toggle('larges', q.type === 'forme' || q.type === 'nom');
  session.Q.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'option';
    b.innerHTML = `<span class="num">${i + 1}</span><span class="opt-tex"></span>`;
    const span = b.querySelector('.opt-tex');
    if (session.Q.texte) span.textContent = o;
    else { span.classList.add('math'); tex(span, '\\displaystyle ' + o, false); }
    b.onclick = () => answer(i);
    opts.append(b);
  });
  $('#feedback').classList.add('hidden');
  $('#actionbar').classList.add('hidden');
  updateHead();
  window.scrollTo({ top: 0 });
  requestAnimationFrame(() => ajusterTout($('#quiz')));
}

function answer(i) {
  if (session.answered) return;
  session.answered = true;
  session.n++;
  const { Q, current: q } = session, ok = i === Q.correct, f = q.formule, now = Date.now();
  const nouvelle = !stats[q.key];
  stats[q.key] = enregistrer(stats[q.key], ok, now);
  jour = majJour(jour, now, nouvelle);
  store.set('fa-stats', stats); store.set('fa-jour', jour);
  if (ok) session.ok++;
  else {
    session.errors.push(q);
    // Révision du jour : une question ratée revient quelques questions plus loin.
    if (session.mode === 'jour' && !session.revues.has(q.key)) {
      session.revues.add(q.key);
      session.file.splice(Math.min(3, session.file.length), 0, q);
      session.max++;
    }
  }

  [...$('#options').children].forEach((b, j) => {
    b.disabled = true;
    if (j === Q.correct) b.classList.add('good');
    else if (j === i) b.classList.add('bad');
  });
  $('#fb-verdict').textContent = ok ? '✓ Bonne réponse' : '✗ Raté';
  $('#fb-verdict').className = 'verdict ' + (ok ? 'ok' : 'ko');
  $('#fb-nom').textContent = f.nom;
  tex($('#fb-tex'), Q.complete);
  texteRiche($('#fb-legende'), f.legende);
  $('#fb-source').textContent = 'Source : ' + f.source;
  $('#fb-signaler').href = lienSignalement(q);
  $('#feedback').classList.remove('hidden');
  $('#actionbar').classList.remove('hidden');
  requestAnimationFrame(() => {
    ajuster($('#fb-tex'));
    $('#feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  updateHead();
}

function lienSignalement(q) {
  const f = q.formule;
  const titre = `Erreur : ${f.nom} (${f.id})`;
  const corps = `**Formule** : \`${f.id}\` — ${f.nom}\n**Question** : \`${q.key}\` (${TYPES[q.type].label})\n**Écriture actuelle** :\n\`\`\`\n${completeTex(f)}\n\`\`\`\n**Problème constaté** :\n\n`;
  return `${DEPOT}/issues/new?title=${encodeURIComponent(titre)}&body=${encodeURIComponent(corps)}`;
}

function renderLegende(el, f) {
  el.innerHTML = '';
  if (f.grandeurs?.length) {
    const ul = document.createElement('ul');
    ul.className = 'grandeurs';
    for (const g of f.grandeurs) {
      const li = document.createElement('li');
      const s = document.createElement('span'), u = document.createElement('span');
      tex(s, g.s, false);
      u.className = 'muted';
      if (g.u) tex(u, '\\mathrm{' + g.u + '}', false); else u.textContent = 'sans dimension';
      li.append(s, ` ${g.nom} `, u);
      ul.append(li);
    }
    el.append(ul);
  } else {
    texteRiche(el, f.legende);
  }
}

function updateHead() {
  $('#score').textContent = `${session.ok} / ${session.n}`;
  $('#bar').style.width = session.max ? `${100 * session.n / session.max}%` : '0';
}

function finish() {
  const { ok, n, errors } = session, pct = n ? Math.round(100 * ok / n) : 0;
  $('#bilan-titre').textContent = n ? `${ok} / ${n} — ${pct} %` : 'Rien à réviser';
  $('#bilan-texte').textContent = !n ? '' : pct >= 90 ? 'Excellent, ces formules sont acquises.' : pct >= 60 ? 'Bien. Les erreurs reviendront plus souvent.' : 'À retravailler : les formules ratées reviendront en priorité.';
  const box = $('#bilan-erreurs');
  box.innerHTML = errors.length ? '<h2>À revoir</h2>' : '';
  const vus = new Set();
  for (const q of errors) {
    if (vus.has(q.formule.id)) continue;
    vus.add(q.formule.id);
    box.append(formuleCard(q.formule));
  }
  show('#bilan');
  requestAnimationFrame(() => ajusterTout(box));
}

function show(id) {
  ['#setup', '#quiz', '#bilan'].forEach(s => $(s).classList.toggle('hidden', s !== id));
  document.body.classList.toggle('en-quiz', id === '#quiz');
  $('#actionbar').classList.add('hidden');
  if (id === '#setup') renderAccueil();
  window.scrollTo({ top: 0 });
}

// --- Formulaire ---
function formuleCard(f) {
  const d = document.createElement('div');
  d.className = 'fcard';
  d.innerHTML = `<div class="fhead"><span class="pill">${f.bloc}</span> <b>${esc(f.nom)}</b></div><div class="formula small"></div>
    <div class="legende"></div><div class="source">${esc(f.notion)} — ${esc(f.source)}</div>`;
  tex(d.querySelector('.formula'), completeTex(f));
  texteRiche(d.querySelector('.legende'), f.legende);
  return d;
}

function renderListe(filtre) {
  const box = $('#liste');
  box.innerHTML = '';
  const t = filtre.trim().toLowerCase();
  const fs = db.list.filter(f => !t || [f.nom, f.notion, f.legende, f.bloc, f.tex].some(x => x.toLowerCase().includes(t)));
  let notion = null;
  for (const f of fs.slice(0, 200)) {
    if (f.notion !== notion) {
      notion = f.notion;
      const h = document.createElement('h2'); h.textContent = notion; box.append(h);
    }
    box.append(formuleCard(f));
  }
  if (!fs.length) box.innerHTML = '<p class="muted">Aucune formule.</p>';
  else if (fs.length > 200) box.insertAdjacentHTML('beforeend', `<p class="muted">… ${fs.length - 200} autres, affine la recherche.</p>`);
  requestAnimationFrame(() => ajusterTout(box));
}

// --- Progrès ---
function renderProgres() {
  const now = Date.now(), actives = questionsActives();
  const acquises = actives.filter(q => estAcquise(stats[q.key])).length;
  const vues = actives.filter(q => stats[q.key]).length;
  const dues = actives.filter(q => estDue(stats[q.key], now)).length;
  $('#progres-resume').innerHTML = [
    ['🔥', serieActuelle(jour, now), 'jours d\'affilée'],
    ['✓', acquises, 'acquises'],
    ['👁', vues, 'vues'],
    ['⏰', dues, 'à revoir'],
  ].map(([i, v, l]) => `<div><span class="r-ico">${i}</span><b>${v}</b><span class="muted">${l}</span></div>`).join('');
  $('#progres').innerHTML = Object.keys(BLOCS).map(b => {
    const qs = actives.filter(q => q.formule.bloc === b);
    if (!qs.length) return '';
    const vu = qs.filter(q => stats[q.key]);
    const acq = qs.filter(q => estAcquise(stats[q.key])).length;
    const seen = vu.reduce((a, q) => a + stats[q.key].seen, 0);
    const wrong = vu.reduce((a, q) => a + stats[q.key].wrong, 0);
    const pct = Math.round(100 * acq / qs.length);
    return `<div class="prow"><div><b>${b}</b> ${BLOCS[b]}<div class="muted">${vu.length}/${qs.length} vues · réussite ${seen ? Math.round(100 * (seen - wrong) / seen) : 0} %</div></div>
      <div class="pbar"><div style="width:${pct}%"></div></div><span class="ppct">${pct} %</span></div>`;
  }).join('');
  const installee = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  $('#install-aide').textContent = installee ? '' :
    'Astuce iPhone : dans Safari, touche Partager puis « Sur l\'écran d\'accueil ». L\'appli fonctionnera hors ligne et ta progression sera conservée durablement.';
}

// --- Événements ---
function bindUI() {
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + t.dataset.view));
    if (t.dataset.view === 'progres') renderProgres();
    if (t.dataset.view === 'formulaire' && !$('#liste').children.length) renderListe('');
    if (t.dataset.view === 'entrainement' && !$('#setup').classList.contains('hidden')) renderAccueil();
    window.scrollTo({ top: 0 });
  });
  $('#daily').onclick = () => lancer('jour');
  $('#erreurs').onclick = () => lancer('erreurs');
  $('#general').onclick = () => lancer('general');
  $('#go').onclick = () => lancer('carte');
  $('#next').onclick = next;
  $('#stop').onclick = () => session.n ? finish() : show('#setup');
  $('#rejouer').onclick = () => lancer(session.mode);
  $('#retour').onclick = () => show('#setup');
  $('#tout').onclick = () => setAll(true);
  $('#rien').onclick = () => setAll(false);
  let attente;
  $('#recherche').oninput = e => { clearTimeout(attente); attente = setTimeout(() => renderListe(e.target.value), 200); };
  $('#reset').onclick = () => {
    if (!confirm('Effacer toute ta progression ?')) return;
    stats = {}; jour = {}; store.set('fa-stats', stats); store.set('fa-jour', jour); renderProgres();
  };
  document.addEventListener('keydown', e => {
    if ($('#quiz').classList.contains('hidden') || e.target.tagName === 'INPUT') return;
    if (!session.answered && /^[1-4]$/.test(e.key)) answer(+e.key - 1);
    else if (session.answered && e.key === 'Enter') { e.preventDefault(); next(); }
  });
  addEventListener('resize', () => ajusterTout());
}
function setAll(v) {
  document.querySelectorAll('.notion-cb').forEach(c => c.checked = v);
  Object.keys(BLOCS).forEach(b => document.querySelector(`.bloc-cb[data-bloc="${b}"]`) && syncBloc(b));
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
