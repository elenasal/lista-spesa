// Metadati categorie condivisi: nome leggibile, ordine di visualizzazione e
// colori tenui usati per le tessere segnaposto del catalogo (quando un prodotto
// non ha ancora una foto). Gli ID categoria coincidono con quelli in productsDatabase.

export const CATEGORY_ORDER = [
  'frutta-verdura',
  'pane-cereali',
  'latticini',
  'carne-pesce',
  'surgelati',
  'dispensa',
  'bevande',
  'igiene',
  'casa',
  'altro',
]

export const CATEGORY_NAMES = {
  'frutta-verdura': 'Frutta e Verdura',
  'pane-cereali': 'Pane e Cereali',
  'latticini': 'Latticini',
  'carne-pesce': 'Carne e Pesce',
  'surgelati': 'Surgelati',
  'dispensa': 'Dispensa',
  'bevande': 'Bevande',
  'igiene': 'Igiene',
  'casa': 'Casa',
  'altro': 'Altro',
}

// Colori (sfondo tenue + accento icona) per i segnaposto prodotto senza foto.
export const CATEGORY_COLORS = {
  'frutta-verdura': { bg: '#ECFDF5', fg: '#059669' },
  'pane-cereali': { bg: '#FEF3C7', fg: '#B45309' },
  'latticini': { bg: '#EFF6FF', fg: '#2563EB' },
  'carne-pesce': { bg: '#FFE4E6', fg: '#E11D48' },
  'surgelati': { bg: '#E0F2FE', fg: '#0284C7' },
  'dispensa': { bg: '#F5F3FF', fg: '#7C3AED' },
  'bevande': { bg: '#FCE7F3', fg: '#DB2777' },
  'igiene': { bg: '#ECFEFF', fg: '#0891B2' },
  'casa': { bg: '#F1F5F9', fg: '#475569' },
  'altro': { bg: '#F1F5F9', fg: '#64748B' },
}

// Parole-chiave per risalire dalla ricerca di un prodotto alle categorie plausibili
// (es. "patate" → verdura, surgelati, dispensa). Mockup: nella versione reale questa
// mappatura la fornirà il catalogo/dev. Un termine può stare in più categorie.
const CATEGORY_KEYWORDS = {
  'frutta-verdura': ['patat', 'pomodor', 'insalata', 'frutta', 'verdura', 'banana', 'mela', 'zucchin', 'carot', 'cipolla', 'spinaci', 'limone', 'arancia'],
  'pane-cereali': ['pane', 'fette', 'cereali', 'cracker', 'grissini', 'farina'],
  'latticini': ['latte', 'yogurt', 'formaggio', 'mozzarella', 'burro', 'uova', 'uovo', 'parmigiano', 'panna'],
  'carne-pesce': ['pollo', 'carne', 'pesce', 'salmone', 'prosciutto', 'manzo', 'tacchino', 'salsiccia', 'tonno fresco'],
  'surgelati': ['surgelat', 'gelato', 'patat', 'bastoncini', 'piselli', 'minestrone', 'pizza surgelata'],
  'dispensa': ['patat', 'chips', 'pasta', 'riso', 'olio', 'sugo', 'pelati', 'passata', 'tonno', 'biscott', 'caffè', 'nutella', 'zucchero', 'sale', 'legumi', 'scatolame'],
  'bevande': ['acqua', 'coca', 'succo', 'bibita', 'vino', 'birra', 'aranciata', 'tè', 'the'],
  'igiene': ['shampoo', 'dentifricio', 'sapone', 'deodorante', 'bagnoschiuma', 'spazzolino'],
  'casa': ['detersiv', 'carta igienica', 'ammorbidente', 'sgrassatore', 'pulizia', 'scottex', 'tovagliol'],
}

// Ritorna gli id categoria plausibili per un termine di ricerca (>= 2 caratteri).
export function suggestCategoriesByKeyword(term) {
  const q = (term || '').toLowerCase().trim()
  if (q.length < 2) return []
  const out = []
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => k.includes(q) || q.includes(k))) out.push(cat)
  }
  return out
}

// Ritorna l'id categoria condiviso da TUTTI i prodotti dell'array (cascata),
// oppure null se l'array è vuoto o le categorie sono miste. Funzione pura.
export function getUniqueCategory(products) {
  if (!Array.isArray(products) || products.length === 0) return null
  const first = products[0]?.category ?? null
  if (first == null) return null
  for (const p of products) {
    if (p?.category !== first) return null
  }
  return first
}

export function getCategoryName(category) {
  return CATEGORY_NAMES[category] || 'Altro'
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.altro
}
