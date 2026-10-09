// Répétition espacée (boîtes de Leitner) et suivi des jours de révision.
// Module pur : les états sont des objets simples sauvegardés par app.js.

const JOUR = 864e5;
/** Intervalle (jours) avant de revoir une question selon sa boîte. Boîte 0 = à revoir le jour même. */
export const INTERVALLES = [0, 1, 3, 7, 15, 30, 60];
export const BOITE_ACQUISE = 3;

export const debutJour = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const jourIso = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/** Normalise une stat (anciennes versions sans boîte ni échéance). */
export function normaliser(s) {
  if (!s) return null;
  return { seen: s.seen || 0, wrong: s.wrong || 0, streak: s.streak || 0, box: s.box ?? Math.min(s.streak || 0, 6), due: s.due ?? 0 };
}

/** Met à jour la stat d'une question après une réponse. */
export function enregistrer(s, ok, now) {
  const n = normaliser(s) ?? { seen: 0, wrong: 0, streak: 0, box: 0, due: 0 };
  n.seen++;
  if (ok) { n.streak++; n.box = Math.min(n.box + 1, INTERVALLES.length - 1); }
  else { n.wrong++; n.streak = 0; n.box = 0; }
  n.due = n.box === 0 ? now : debutJour(now) + INTERVALLES[n.box] * JOUR;
  return n;
}

export const estAcquise = s => (normaliser(s)?.box ?? 0) >= BOITE_ACQUISE;
export const estDue = (s, now) => !!s && (normaliser(s).due <= now);

/** File du jour : questions échues (les plus en retard d'abord) puis nouvelles, dans la limite du quota. */
export function fileDuJour(questions, stats, now, quotaNouvelles, rand = Math.random) {
  const dues = questions.filter(q => estDue(stats[q.key], now))
    .sort((a, b) => normaliser(stats[a.key]).due - normaliser(stats[b.key]).due);
  const neuves = questions.filter(q => !stats[q.key]);
  for (let i = neuves.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [neuves[i], neuves[j]] = [neuves[j], neuves[i]]; }
  return { dues, nouvelles: neuves.slice(0, Math.max(0, quotaNouvelles)) };
}

/** Met à jour le suivi quotidien : série de jours consécutifs et nouvelles vues aujourd'hui. */
export function majJour(jour, now, nouvelle) {
  const auj = jourIso(now), hier = jourIso(now - JOUR);
  const j = { ...{ dernier: null, serie: 0, date: auj, nouvelles: 0 }, ...jour };
  if (j.date !== auj) { j.date = auj; j.nouvelles = 0; }
  if (j.dernier !== auj) j.serie = j.dernier === hier ? j.serie + 1 : 1;
  j.dernier = auj;
  if (nouvelle) j.nouvelles++;
  return j;
}

/** Série affichée : remise à 0 si le dernier jour de révision est avant hier. */
export function serieActuelle(jour, now) {
  if (!jour?.dernier) return 0;
  return [jourIso(now), jourIso(now - JOUR)].includes(jour.dernier) ? jour.serie : 0;
}

/** Nouvelles questions déjà introduites aujourd'hui. */
export const nouvellesDuJour = (jour, now) => (jour?.date === jourIso(now) ? jour.nouvelles : 0);
