// Supermercati specifici nella zona di Novara (mockup)
// Ogni punto vendita ha il suo ID univoco, indirizzo, distanza, orari e telefono.
// ⚠️ MOCKUP: orari e numeri sono dati d'esempio.

// Helper per comporre gli orari settimanali in modo compatto.
// Indici giorno come Date.getDay(): 0 = domenica ... 6 = sabato.
// Ogni giorno è un array di fasce { open, close } (vuoto = chiuso).
const week = (weekdays, saturday = weekdays, sunday = []) => ({
  1: weekdays,
  2: weekdays,
  3: weekdays,
  4: weekdays,
  5: weekdays,
  6: saturday,
  0: sunday,
})

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
    phone: '0321 612340',
    hours: week([{ open: '08:00', close: '21:00' }], [{ open: '08:00', close: '21:00' }], [{ open: '08:30', close: '20:00' }]),
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
    phone: '0321 455201',
    hours: week([{ open: '08:00', close: '21:00' }], [{ open: '08:00', close: '21:00' }], [{ open: '08:00', close: '20:00' }]),
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
    phone: '0321 391122',
    hours: week([{ open: '08:00', close: '20:00' }], [{ open: '08:00', close: '20:00' }], [{ open: '08:30', close: '13:00' }]),
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
    phone: '0321 627890',
    hours: week([{ open: '08:30', close: '19:30' }], [{ open: '08:30', close: '20:00' }], [{ open: '09:00', close: '13:00' }]),
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
    phone: '0321 401567',
    hours: week([{ open: '08:00', close: '12:30' }, { open: '16:00', close: '19:30' }], [{ open: '08:00', close: '19:30' }], []),
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
    phone: '0321 483310',
    hours: week([{ open: '08:30', close: '20:00' }], [{ open: '08:30', close: '20:00' }], [{ open: '09:00', close: '13:00' }]),
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
    phone: '0321 512044',
    hours: week([{ open: '08:30', close: '20:00' }], [{ open: '08:30', close: '20:00' }], []),
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
    phone: '0321 470900',
    hours: week([{ open: '08:30', close: '21:00' }], [{ open: '08:30', close: '21:00' }], [{ open: '09:00', close: '20:00' }]),
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
    phone: '0321 458812',
    hours: week([{ open: '08:00', close: '20:00' }], [{ open: '08:00', close: '20:00' }], [{ open: '08:30', close: '13:00' }]),
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
    phone: '0321 466730',
    hours: week([{ open: '08:30', close: '19:30' }], [{ open: '08:30', close: '19:30' }], []),
  },
]

// Nomi giorni indicizzati come Date.getDay() (0 = domenica)
export const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const DAY_NAMES_SHORT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']

// Ordine di visualizzazione settimanale (lun → dom) in indici getDay()
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

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

// Ottieni supermercati ordinati per distanza (reale se `userCoords`, altrimenti mock)
export function getSupermarketsByDistance(userCoords = null) {
  return [...SUPERMARKETS].sort((a, b) => distanceKm(a, userCoords) - distanceKm(b, userCoords))
}

// Calcola lo stato apertura corrente in base all'ora del dispositivo.
// Ritorna { isOpen, detail } es. { isOpen:true, detail:'chiude alle 19:30' }
// oppure { isOpen:false, detail:'apre alle 16:00' } / 'apre lun alle 08:00'.
export function getOpenStatus(supermarket, now = new Date()) {
  const hours = supermarket?.hours
  if (!hours) return null

  const day = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  const todays = hours[day] || []

  // Attualmente aperto?
  for (const r of todays) {
    if (mins >= toMinutes(r.open) && mins < toMinutes(r.close)) {
      return { isOpen: true, detail: `chiude alle ${r.close}` }
    }
  }

  // Chiuso: apre più tardi oggi? (es. dopo la pausa pranzo)
  const laterToday = todays.find(r => mins < toMinutes(r.open))
  if (laterToday) {
    return { isOpen: false, detail: `apre alle ${laterToday.open}` }
  }

  // Altrimenti cerca il prossimo giorno con orari
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    const ranges = hours[d] || []
    if (ranges.length) {
      const label = i === 1 ? 'domani' : DAY_NAMES_SHORT[d]
      return { isOpen: false, detail: `apre ${label} alle ${ranges[0].open}` }
    }
  }

  return { isOpen: false, detail: 'orari non disponibili' }
}

// Formatta le fasce di un giorno: 'Chiuso' oppure '08:00–12:30 · 16:00–19:30'
export function formatDayHours(ranges) {
  if (!ranges || ranges.length === 0) return 'Chiuso'
  return ranges.map(r => `${r.open}–${r.close}`).join(' · ')
}

// Link a Google Maps per le indicazioni stradali (da indirizzo + città)
export function getDirectionsUrl(supermarket) {
  const dest = encodeURIComponent(`${supermarket.name}, ${supermarket.address}, ${supermarket.city}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`
}

// Coordinate approssimate dei punti vendita (zona Novara) per calcolare la distanza
// reale dalla posizione dell'utente. ⚠️ MOCKUP: coordinate d'esempio nei dintorni di Novara.
const SUPERMARKET_COORDS = {
  'esselunga-viale-giulio-cesare': { lat: 45.4300, lng: 8.6400 },
  'lidl-corso-vercelli': { lat: 45.4505, lng: 8.6050 },
  'carrefour-via-verbano': { lat: 45.4650, lng: 8.6205 },
  'coop-corso-italia': { lat: 45.4480, lng: 8.6180 },
  'conad-via-san-bernardino': { lat: 45.4400, lng: 8.6300 },
  'eurospin-viale-kennedy': { lat: 45.4550, lng: 8.6400 },
  'md-via-novara': { lat: 45.4200, lng: 8.6100 },
  'bennet-centro-commerciale': { lat: 45.4700, lng: 8.6500 },
  'penny-via-biandrate': { lat: 45.4600, lng: 8.5900 },
  'aldi-corso-vercelli': { lat: 45.4520, lng: 8.6000 },
}

// Distanza in km tra due coordinate (formula dell'emisenoverso / haversine).
export function haversineKm(a, b) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Distanza di un supermercato dall'utente: reale se conosciamo la posizione e le
// coordinate del punto vendita, altrimenti il valore mock `distance`.
export function distanceKm(supermarket, userCoords) {
  const sc = SUPERMARKET_COORDS[supermarket.id]
  if (userCoords && sc) return haversineKm(userCoords, sc)
  return supermarket.distance
}
