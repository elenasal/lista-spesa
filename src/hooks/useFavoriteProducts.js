import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lista-spesa-favorite-products'

// Carica preferiti da localStorage
function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Salva preferiti in localStorage
function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (err) {
    console.error('Errore salvataggio preferiti:', err)
  }
}

export function useFavoriteProducts() {
  const [favorites, setFavorites] = useState(() => loadFavorites())

  // Salva quando cambia
  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  // Aggiungi prodotto ai preferiti
  const addFavorite = useCallback((product) => {
    setFavorites(prev => {
      // Evita duplicati (controlla per nome normalizzato)
      const normalizedName = product.name.toLowerCase().trim()
      if (prev.some(p => p.name.toLowerCase().trim() === normalizedName)) {
        return prev
      }

      const newFavorite = {
        id: crypto.randomUUID(),
        name: product.name.trim(),
        category: product.category || 'altro',
        unit: product.unit || 'pz',
        defaultQuantity: product.quantity || 1,
        price: product.price || null,
        addedAt: new Date().toISOString()
      }

      return [newFavorite, ...prev]
    })
  }, [])

  // Rimuovi prodotto dai preferiti
  const removeFavorite = useCallback((productId) => {
    setFavorites(prev => prev.filter(p => p.id !== productId))
  }, [])

  // Rimuovi per nome (utile quando non si ha l'ID)
  const removeFavoriteByName = useCallback((productName) => {
    const normalizedName = productName.toLowerCase().trim()
    setFavorites(prev => prev.filter(p =>
      p.name.toLowerCase().trim() !== normalizedName
    ))
  }, [])

  // Controlla se un prodotto è nei preferiti
  const isFavorite = useCallback((productName) => {
    const normalizedName = productName.toLowerCase().trim()
    return favorites.some(p => p.name.toLowerCase().trim() === normalizedName)
  }, [favorites])

  // Toggle preferito
  const toggleFavorite = useCallback((product) => {
    if (isFavorite(product.name)) {
      removeFavoriteByName(product.name)
    } else {
      addFavorite(product)
    }
  }, [isFavorite, removeFavoriteByName, addFavorite])

  // Ottieni preferito per nome
  const getFavoriteByName = useCallback((productName) => {
    const normalizedName = productName.toLowerCase().trim()
    return favorites.find(p => p.name.toLowerCase().trim() === normalizedName)
  }, [favorites])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    removeFavoriteByName,
    isFavorite,
    toggleFavorite,
    getFavoriteByName,
    hasFavorites: favorites.length > 0
  }
}
