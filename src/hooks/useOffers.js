import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { MOCK_OFFERS, getDiscountPercent } from '../data/offers'

// ⚠️ MOCKUP: le offerte sono derivate dai dati d'esempio (data/offers.js).
// Qui gestiamo lo stato "letto" localmente e assegniamo una data dimostrativa
// a ciascuna offerta. Un dev collegherà offerte + DB reali (con date vere).
const READ_KEY = 'lista-spesa-offers-read-v3'

// Stato demo iniziale: tutte lette TRANNE le prime due (le più recenti, "in
// cima"), per mostrare la differenza letto/non letto. Un dev userà lo stato reale.
function defaultReadIds() {
  return MOCK_OFFERS.slice(2).map(o => o.id)
}

function loadReadIds() {
  try {
    const saved = localStorage.getItem(READ_KEY)
    return saved ? JSON.parse(saved) : defaultReadIds()
  } catch {
    return defaultReadIds()
  }
}

export function useOffers() {
  const [readIds, setReadIds] = useState(() => loadReadIds())

  useEffect(() => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(readIds))
    } catch {}
  }, [readIds])

  const now = Date.now()

  // Offerte arricchite con sconto %, flag letto e data (dimostrativa)
  const offers = MOCK_OFFERS.map((o, i) => {
    // Data d'esempio: ogni offerta un po' più "vecchia" della precedente
    const receivedAt = new Date(now - (i * 7 + 3) * 60 * 60 * 1000)
    return {
      ...o,
      discountPercent: getDiscountPercent(o.oldPrice, o.newPrice),
      read: readIds.includes(o.id),
      receivedAt,
      dateLabel: formatDistanceToNow(receivedAt, { addSuffix: true, locale: it }),
    }
  })

  const unreadCount = offers.filter(o => !o.read).length

  const markRead = useCallback((id) => {
    setReadIds(prev => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds(MOCK_OFFERS.map(o => o.id))
  }, [])

  return { offers, unreadCount, markRead, markAllRead }
}
