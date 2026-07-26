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

export function getCategoryName(category) {
  return CATEGORY_NAMES[category] || 'Altro'
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.altro
}
