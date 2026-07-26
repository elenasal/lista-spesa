import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'lista-spesa-receipts'

// Scontrini finti di esempio: popolano la dashboard alla primissima apertura
// (finché la chiave non esiste). Cancellabili come gli altri.
const DEMO_RECEIPTS = [
  { id: 'demo-1', supermarketId: 'esselunga-viale-giulio-cesare', date: '2026-07-22', total: 47.30, saved: 8.10, photo: null, createdAt: '2026-07-22T18:20:00.000Z' },
  { id: 'demo-2', supermarketId: 'lidl-corso-vercelli', date: '2026-07-18', total: 32.90, saved: 5.40, photo: null, createdAt: '2026-07-18T11:05:00.000Z' },
  { id: 'demo-3', supermarketId: 'coop-corso-italia', date: '2026-07-12', total: 61.20, saved: 12.75, photo: null, createdAt: '2026-07-12T19:40:00.000Z' },
]

const SEED_FLAG = 'lista-spesa-receipts-seeded'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Scontrini caricati dall'utente. Ogni scontrino registra la spesa in un supermercato
// (speso, risparmiato, data, foto opzionale). L'OCR reale lo aggancerà il dev; qui
// l'inserimento è manuale/assistito.
export function useReceipts() {
  const [receipts, setReceipts] = useState(() => load())

  // Seed una tantum degli scontrini demo (solo se non ce ne sono e non già seminati)
  useEffect(() => {
    try {
      if (localStorage.getItem(SEED_FLAG)) return
      localStorage.setItem(SEED_FLAG, '1')
      setReceipts((prev) => (prev.length === 0 ? DEMO_RECEIPTS : prev))
    } catch {
      /* no-op */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
    } catch {
      /* no-op */
    }
  }, [receipts])

  const addReceipt = useCallback((data) => {
    const receipt = {
      id: crypto.randomUUID(),
      supermarketId: data.supermarketId,
      date: data.date, // 'YYYY-MM-DD'
      total: Number(data.total) || 0,
      saved: Number(data.saved) || 0,
      photo: data.photo || null,
      createdAt: new Date().toISOString(),
    }
    setReceipts((prev) => [receipt, ...prev])
    return receipt
  }, [])

  const removeReceipt = useCallback((id) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // Riepilogo per supermercato: speso, risparmiato, n. scontrini, % in offerta
  const summaryBySupermarket = useMemo(() => {
    const map = {}
    for (const r of receipts) {
      const s = (map[r.supermarketId] ??= { supermarketId: r.supermarketId, spent: 0, saved: 0, count: 0 })
      s.spent += r.total
      s.saved += r.saved
      s.count += 1
    }
    return Object.values(map).map((s) => ({
      ...s,
      // quanto era in offerta: risparmio sul prezzo pieno (speso + risparmiato)
      offerPercent: s.spent + s.saved > 0 ? Math.round((s.saved / (s.spent + s.saved)) * 100) : 0,
    }))
  }, [receipts])

  const totals = useMemo(
    () => ({
      spent: receipts.reduce((a, r) => a + r.total, 0),
      saved: receipts.reduce((a, r) => a + r.saved, 0),
      count: receipts.length,
    }),
    [receipts]
  )

  return { receipts, addReceipt, removeReceipt, summaryBySupermarket, totals }
}
