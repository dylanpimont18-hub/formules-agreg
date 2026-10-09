// Analyse dimensionnelle des unités écrites en LaTeX, pour éviter qu'un distracteur
// soit une unité équivalente à la bonne réponse (J et N·m, W et V·A…).
// Dimension = vecteur d'exposants [m, kg, s, A, K, mol, info]. null si unité non reconnue.

const D = (m = 0, kg = 0, s = 0, A = 0, K = 0, mol = 0, info = 0) => [m, kg, s, A, K, mol, info];
const BASE = {
  m: D(1), g: D(0, 1), s: D(0, 0, 1), A: D(0, 0, 0, 1), K: D(0, 0, 0, 0, 1), mol: D(0, 0, 0, 0, 0, 1),
  N: D(1, 1, -2), J: D(2, 1, -2), W: D(2, 1, -3), Pa: D(-1, 1, -2), bar: D(-1, 1, -2),
  V: D(2, 1, -3, -1), Ω: D(2, 1, -3, -2), C: D(0, 0, 1, 1), F: D(-2, -1, 4, 2), H: D(2, 1, -2, -2),
  T: D(0, 1, -2, -1), Wb: D(2, 1, -2, -1), Hz: D(0, 0, -1), S: D(-2, -1, 3, 2),
  Wh: D(2, 1, -2), VA: D(2, 1, -3), var: D(2, 1, -3), VAR: D(2, 1, -3), VAr: D(2, 1, -3), Ah: D(0, 0, 1, 1),
  min: D(0, 0, 1), h: D(0, 0, 1), j: D(0, 0, 1), an: D(0, 0, 1), L: D(3), l: D(3), t: D(0, 1),
  rad: D(), sr: D(), tr: D(), dB: D(), dBm: D(2, 1, -3), '%': D(), '°': D(), '°C': D(0, 0, 0, 0, 1),
  bit: D(0, 0, 0, 0, 0, 0, 1), bits: D(0, 0, 0, 0, 0, 0, 1), o: D(0, 0, 0, 0, 0, 0, 1), octet: D(0, 0, 0, 0, 0, 0, 1),
  octets: D(0, 0, 0, 0, 0, 0, 1), B: D(0, 0, 0, 0, 0, 0, 1), Bd: D(0, 0, -1), baud: D(0, 0, -1), bps: D(0, 0, -1, 0, 0, 0, 1),
  '€': null, eV: D(2, 1, -2), cd: null, lm: null, lx: null,
};
const PREFIXES = ['k', 'M', 'G', 'T', 'm', 'µ', 'μ', 'n', 'p', 'c', 'd', 'h'];

function unite(sym) {
  if (sym in BASE) return BASE[sym];
  for (const p of PREFIXES) if (sym.startsWith(p) && sym.slice(p.length) in BASE) return BASE[sym.slice(p.length)];
  return undefined;
}

export function dimension(tex) {
  if (tex === undefined || tex === null) return null;
  let s = String(tex)
    .replace(/\\(mathrm|text|textrm|operatorname)\s*/g, '')
    .replace(/\\Omega/g, 'Ω').replace(/\\mu\s*/g, 'µ').replace(/\\%/g, '%').replace(/\^\\circ|\\circ|\\degree/g, '°')
    .replace(/\\(cdot|times|,|;|:|!)|·|\*/g, ' ').replace(/~/g, ' ')
    .replace(/[{}]/g, '').replace(/°\s*C/g, '°C').replace(/\s+/g, ' ').trim();
  if (s === '' || s === '1' || /sans/i.test(s)) return D();
  const v = D();
  let signe = 1;
  // Gère « a/b » et « a/(b c) » : tout ce qui suit / est au dénominateur.
  const tokens = s.replace(/\//g, ' / ').replace(/[()]/g, ' ').split(' ').filter(Boolean);
  for (const tok of tokens) {
    if (tok === '/') { signe = -1; continue; }
    const m = tok.match(/^([^\^]+?)(?:\^(-?\d+))?$/);
    if (!m) return null;
    const u = unite(m[1]);
    if (u === undefined || u === null) return null;
    const e = signe * (m[2] ? +m[2] : 1);
    u.forEach((x, i) => { v[i] += x * e; });
  }
  return v;
}

export function memeDimension(a, b) {
  return !!a && !!b && a.every((x, i) => x === b[i]);
}
