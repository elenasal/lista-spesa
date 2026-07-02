import { useState, useEffect, useCallback, useMemo } from 'react'

const getStorageKey = (listId) => listId ? `lista-spesa-filters-${listId}` : 'lista-spesa-filters'

const DEFAULT_FILTERS = {
  supermarketId: null,
  onlyOnSale: false,
  onlyFavorites: false,
  category: null,
}

// Carica filtri da localStorage
function loadFilters(listId) {
  try {
    const saved = localStorage.getItem(getStorageKey(listId))
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_FILTERS, ...parsed }
    }
  } catch {
    // Ignora errori
  }
  return { ...DEFAULT_FILTERS }
}

// Salva filtri in localStorage
function saveFilters(filters, listId) {
  try {
    localStorage.setItem(getStorageKey(listId), JSON.stringify(filters))
  } catch (err) {
    console.error('Errore salvataggio filtri:', err)
  }
}

export function useProductFilters(listId = null) {
  const [filters, setFilters] = useState(() => loadFilters(listId))
  const [initializedForList, setInitializedForList] = useState(listId)

  // Ricarica quando cambia lista
  useEffect(() => {
    if (listId !== initializedForList) {
      setFilters(loadFilters(listId))
      setInitializedForList(listId)
    }
  }, [listId, initializedForList])

  // Salva quando cambiano i filtri
  useEffect(() => {
    if (listId === initializedForList) {
      saveFilters(filters, listId)
    }
  }, [filters, listId, initializedForList])

  // Imposta un filtro specifico
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  // Rimuovi un filtro specifico
  const clearFilter = useCallback((key) => {
    setFilters(prev => ({
      ...prev,
      [key]: DEFAULT_FILTERS[key],
    }))
  }, [])

  // Rimuovi tutti i filtri
  const clearAllFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
  }, [])

  // Verifica se ci sono filtri attivi
  const hasActiveFilters = useMemo(() => {
    return (
      filters.supermarketId !== null ||
      filters.onlyOnSale === true ||
      filters.onlyFavorites === true ||
      filters.category !== null
    )
  }, [filters])

  // Conta filtri attivi
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.supermarketId) count++
    if (filters.onlyOnSale) count++
    if (filters.onlyFavorites) count++
    if (filters.category) count++
    return count
  }, [filters])

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  }
}
