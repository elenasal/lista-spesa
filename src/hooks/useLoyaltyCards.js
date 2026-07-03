import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'loyalty-cards'

/**
 * Struttura tessera:
 * {
 *   supermarketId: string,
 *   cardNumber: string,
 *   cardName: string (es. "Fidaty", "Carta Insieme"),
 *   hasLoyaltyProgram: boolean,
 *   points: number | null,
 *   pointsExpiry: string | null (ISO date)
 * }
 */

// Tessera demo per mostrare la funzionalità
const DEMO_CARDS = {
  'esselunga-viale-giulio-cesare': {
    supermarketId: 'esselunga-viale-giulio-cesare',
    cardNumber: '2610845739201',
    cardName: 'Fidaty',
    hasLoyaltyProgram: true,
    points: 1847,
    pointsExpiry: '2025-12-31',
  }
}

function loadCards() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
    // Prima volta: carica tessere demo
    return { ...DEMO_CARDS }
  } catch {
    return { ...DEMO_CARDS }
  }
}

function saveCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch (err) {
    console.error('Errore salvataggio tessere:', err)
  }
}

export function useLoyaltyCards() {
  // cards è un oggetto { supermarketId: cardData }
  const [cards, setCards] = useState(loadCards)

  useEffect(() => {
    saveCards(cards)
  }, [cards])

  // Ottieni tessera per supermercato
  const getCard = useCallback((supermarketId) => {
    return cards[supermarketId] || null
  }, [cards])

  // Salva/aggiorna tessera
  const saveCard = useCallback((supermarketId, cardData) => {
    setCards(prev => ({
      ...prev,
      [supermarketId]: {
        supermarketId,
        cardNumber: cardData.cardNumber || '',
        cardName: cardData.cardName || '',
        hasLoyaltyProgram: cardData.hasLoyaltyProgram || false,
        points: cardData.points || null,
        pointsExpiry: cardData.pointsExpiry || null,
      }
    }))
  }, [])

  // Rimuovi tessera
  const removeCard = useCallback((supermarketId) => {
    setCards(prev => {
      const newCards = { ...prev }
      delete newCards[supermarketId]
      return newCards
    })
  }, [])

  // Aggiorna solo i punti
  const updatePoints = useCallback((supermarketId, points, expiry = null) => {
    setCards(prev => {
      if (!prev[supermarketId]) return prev
      return {
        ...prev,
        [supermarketId]: {
          ...prev[supermarketId],
          points,
          pointsExpiry: expiry,
        }
      }
    })
  }, [])

  // Verifica se ha tessera
  const hasCard = useCallback((supermarketId) => {
    return !!cards[supermarketId]?.cardNumber
  }, [cards])

  return {
    cards,
    getCard,
    saveCard,
    removeCard,
    updatePoints,
    hasCard,
  }
}
