import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { MOCK_OFFERS, getDiscountPercent } from '../data/offers'
import { MOCK_ACTIVITY } from '../data/activity'

// ⚠️ MOCKUP: feed notifiche unico e cronologico che unisce offerte e attività
// delle liste condivise (aggiunte/acquisti di altri utenti).
const READ_KEY = 'lista-spesa-notifs-read-v1'

// Base statica (senza data/stato letto), costruita una sola volta.
const BASE = [
  ...MOCK_OFFERS.map((o, i) => ({
    id: `offer-${o.id}`,
    type: 'offer',
    hoursAgo: i * 7 + 3,
    offer: { ...o, discountPercent: getDiscountPercent(o.oldPrice, o.newPrice) },
  })),
  ...MOCK_ACTIVITY.map((a) => ({
    id: a.id,
    type: a.type,
    hoursAgo: a.hoursAgo,
    activity: a,
  })),
]

// Demo: le 3 notifiche più recenti non lette, il resto già lette
function defaultReadIds() {
  return [...BASE].sort((a, b) => a.hoursAgo - b.hoursAgo).slice(3).map((x) => x.id)
}

function loadReadIds() {
  try {
    const saved = localStorage.getItem(READ_KEY)
    return saved ? JSON.parse(saved) : defaultReadIds()
  } catch {
    return defaultReadIds()
  }
}

export function useNotifications() {
  const [readIds, setReadIds] = useState(() => loadReadIds())

  useEffect(() => {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(readIds))
    } catch {}
  }, [readIds])

  const now = Date.now()

  const items = BASE
    .map((x) => {
      const receivedAt = new Date(now - x.hoursAgo * 60 * 60 * 1000)
      return {
        ...x,
        receivedAt,
        read: readIds.includes(x.id),
        dateLabel: formatDistanceToNow(receivedAt, { addSuffix: true, locale: it }),
      }
    })
    .sort((a, b) => b.receivedAt - a.receivedAt)

  const unreadCount = items.filter((i) => !i.read).length

  const markRead = useCallback((id) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds(BASE.map((x) => x.id))
  }, [])

  return { items, unreadCount, markRead, markAllRead }
}
