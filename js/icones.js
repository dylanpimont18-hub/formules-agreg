// Icônes SVG (tracés Lucide, licence ISC) : une seule famille, trait 2 px, couleur = currentColor.
const TRACES = {
  cible: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  sigma: '<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>',
  graphique: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  flamme: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  ampoule: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  alerte: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  ok: '<path d="M20 6 9 17l-5-5"/>',
  ko: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  oeil: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  horloge: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
};

/** Code SVG d'une icône, décorative par défaut (masquée aux lecteurs d'écran). */
export function icone(nom, classe = '') {
  return `<svg class="ic ${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TRACES[nom]}</svg>`;
}

/** Remplace chaque <i data-icone="nom"> du document par l'icône SVG correspondante. */
export function poserIcones(racine = document) {
  racine.querySelectorAll('i[data-icone]').forEach(i => { i.outerHTML = icone(i.dataset.icone, i.className); });
}
