import { useState, useEffect, useCallback } from 'react'
import { SUPERMARKETS, getSupermarketsByDistance } from '../data/supermarkets'

const STORAGE_KEY = 'favorite-supermarkets'

// Supermercati preferiti di default (demo)
const DEFAULT_FAVORITES = ['esselunga-viale-giulio-cesare']

// Carica preferiti da localStorage
function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Verifica che siano ID validi
      return parsed.filter(id => SUPERMARKETS.some(s => s.id === id))
    }
  } catch {
    // Ignora errori
  }
  // Default: Esselunga come demo
  return DEFAULT_FAVORITES
}

// Salva preferiti in localStorage
function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (err) {
    console.error('Errore salvataggio preferiti:', err)
  }
}

export function useFavoriteSupermarkets() {
  const [favorites, setFavorites] = useState(loadFavorites)

  // Salva quando cambia
  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  // Toggle preferito
  const toggleFavorite = useCallback((supermarketId) => {
    setFavorites(prev => {
      if (prev.includes(supermarketId)) {
        return prev.filter(id => id !== supermarketId)
      } else {
        return [...prev, supermarketId]
      }
    })
  }, [])

  // Verifica se è preferito
  const isFavorite = useCallback((supermarketId) => {
    return favorites.includes(supermarketId)
  }, [favorites])

  // Ottieni lista supermercati ordinati per distanza con stato preferito
  const supermarketsWithFavorites = getSupermarketsByDistance().map(s => ({
    ...s,
    isFavorite: favorites.includes(s.id),
  }))

  // Ottieni solo i preferiti (oggetti completi), ordinati per distanza
  const favoriteSupermarkets = getSupermarketsByDistance().filter(s => favorites.includes(s.id))

  return {
    favorites, // Array di ID
    favoriteSupermarkets, // Array di oggetti supermercato
    supermarketsWithFavorites, // Tutti i supermercati con flag isFavorite (ordinati per distanza)
    toggleFavorite,
    isFavorite,
    hasFavorites: favorites.length > 0,
  }
}
