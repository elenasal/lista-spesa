// Supermercati specifici nella zona di Novara (mockup)
// Ogni punto vendita ha il suo ID univoco, indirizzo e distanza

export const SUPERMARKETS = [
  {
    id: 'esselunga-viale-giulio-cesare',
    chain: 'esselunga',
    name: 'Esselunga',
    address: 'Viale Giulio Cesare 33',
    city: 'Novara',
    distance: 0.3,
    color: '#E31E24',
    bgColor: '#FEE2E2',
  },
  {
    id: 'lidl-corso-vercelli',
    chain: 'lidl',
    name: 'Lidl',
    address: 'Corso Vercelli 120',
    city: 'Novara',
    distance: 0.8,
    color: '#0050AA',
    bgColor: '#DBEAFE',
  },
  {
    id: 'carrefour-via-verbano',
    chain: 'carrefour',
    name: 'Carrefour Market',
    address: 'Via Verbano 45',
    city: 'Novara',
    distance: 1.1,
    color: '#004E9E',
    bgColor: '#DBEAFE',
  },
  {
    id: 'coop-corso-italia',
    chain: 'coop',
    name: 'Coop',
    address: 'Corso Italia 28',
    city: 'Novara',
    distance: 1.4,
    color: '#E2001A',
    bgColor: '#FEE2E2',
  },
  {
    id: 'conad-via-san-bernardino',
    chain: 'conad',
    name: 'Conad City',
    address: 'Via San Bernardino 12',
    city: 'Novara',
    distance: 1.7,
    color: '#E30613',
    bgColor: '#FEE2E2',
  },
  {
    id: 'eurospin-viale-kennedy',
    chain: 'eurospin',
    name: 'Eurospin',
    address: 'Viale Kennedy 88',
    city: 'Novara',
    distance: 2.1,
    color: '#1D4289',
    bgColor: '#DBEAFE',
  },
  {
    id: 'md-via-novara',
    chain: 'md',
    name: 'MD Discount',
    address: 'Via Novara 156',
    city: 'Novara',
    distance: 2.4,
    color: '#FFD100',
    bgColor: '#FEF3C7',
  },
  {
    id: 'bennet-centro-commerciale',
    chain: 'bennet',
    name: 'Bennet',
    address: 'Centro Comm. San Martino',
    city: 'Novara',
    distance: 3.2,
    color: '#D4001A',
    bgColor: '#FEE2E2',
  },
  {
    id: 'penny-via-biandrate',
    chain: 'penny',
    name: 'Penny Market',
    address: 'Via Biandrate 64',
    city: 'Novara',
    distance: 2.8,
    color: '#CD1719',
    bgColor: '#FEE2E2',
  },
  {
    id: 'aldi-corso-vercelli',
    chain: 'aldi',
    name: 'Aldi',
    address: 'Corso Vercelli 201',
    city: 'Novara',
    distance: 1.9,
    color: '#00005F',
    bgColor: '#E0E7FF',
  },
]

// Helper per ottenere un supermercato per ID
export function getSupermarketById(id) {
  return SUPERMARKETS.find(s => s.id === id)
}

// Helper per ottenere il nome completo del supermercato (nome + indirizzo)
export function getSupermarketFullName(id) {
  const s = getSupermarketById(id)
  return s ? `${s.name} - ${s.address}` : id
}

// Helper per formattare la distanza
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

// Ottieni supermercati ordinati per distanza
export function getSupermarketsByDistance() {
  return [...SUPERMARKETS].sort((a, b) => a.distance - b.distance)
}
