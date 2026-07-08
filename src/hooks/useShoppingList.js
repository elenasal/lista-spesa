import { useState, useEffect, useCallback } from 'react'

const getStorageKey = (listId) => listId ? `lista-spesa-items-${listId}` : 'lista-spesa-items'
const getHistoryKey = (listId) => listId ? `lista-spesa-history-${listId}` : 'lista-spesa-history'

// Configurazione suggerimenti
const MIN_PURCHASES_FOR_SUGGESTION = 3
const MAX_SUGGESTIONS = 8

// Mock data per demo/mockup - nomi specifici di prodotti
const MOCK_SUGGESTIONS = [
  { name: 'Latte Granarolo fresco', category: 'latticini', count: 15 },
  { name: 'Latte Zymil senza lattosio', category: 'latticini', count: 12 },
  { name: 'Latte parzialmente scremato', category: 'latticini', count: 10 },
  { name: 'Pane integrale', category: 'pane-cereali', count: 14 },
  { name: 'Pane di Altamura', category: 'pane-cereali', count: 8 },
  { name: 'Uova biologiche', category: 'latticini', count: 11 },
  { name: 'Uova fresche grandi', category: 'latticini', count: 7 },
  { name: 'Mozzarella di bufala', category: 'latticini', count: 9 },
  { name: 'Mozzarella Santa Lucia', category: 'latticini', count: 6 },
  { name: 'Pomodori ciliegino', category: 'frutta-verdura', count: 8 },
  { name: 'Pomodori San Marzano', category: 'frutta-verdura', count: 5 },
  { name: 'Pasta Barilla penne', category: 'pane-cereali', count: 10 },
  { name: 'Pasta De Cecco spaghetti', category: 'pane-cereali', count: 7 },
  { name: 'Acqua Levissima', category: 'bevande', count: 13 },
  { name: 'Acqua Sant Anna', category: 'bevande', count: 9 },
  { name: 'Banane Chiquita', category: 'frutta-verdura', count: 6 },
  { name: 'Yogurt Muller', category: 'latticini', count: 8 },
  { name: 'Yogurt greco Fage', category: 'latticini', count: 5 },
  { name: 'Prosciutto crudo San Daniele', category: 'carne-pesce', count: 7 },
  { name: 'Prosciutto cotto Rovagnati', category: 'carne-pesce', count: 6 },
]

// Carica items da localStorage
function loadItems(listId) {
  try {
    const saved = localStorage.getItem(getStorageKey(listId))
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Salva items in localStorage
function saveItems(items, listId) {
  try {
    localStorage.setItem(getStorageKey(listId), JSON.stringify(items))
  } catch (err) {
    console.error('Errore salvataggio:', err)
  }
}

// Carica storico da localStorage
function loadHistory(listId) {
  try {
    const saved = localStorage.getItem(getHistoryKey(listId))
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

// Salva storico in localStorage
function saveHistory(history, listId) {
  try {
    localStorage.setItem(getHistoryKey(listId), JSON.stringify(history))
  } catch (err) {
    console.error('Errore salvataggio storico:', err)
  }
}

// Normalizza nome prodotto per chiave storico (lowercase, trim)
function normalizeProductName(name) {
  return name.toLowerCase().trim()
}

export function useShoppingList(listId = null) {
  const [items, setItems] = useState(() => loadItems(listId))
  const [history, setHistory] = useState(() => loadHistory(listId))
  const [loading, setLoading] = useState(false)
  const [initializedForList, setInitializedForList] = useState(listId)

  // Ricarica quando cambia listId
  useEffect(() => {
    if (listId !== initializedForList) {
      setItems(loadItems(listId))
      setHistory(loadHistory(listId))
      setInitializedForList(listId)
    }
  }, [listId, initializedForList])

  // Salva quando items cambia
  useEffect(() => {
    if (listId === initializedForList) {
      saveItems(items, listId)
    }
  }, [items, listId, initializedForList])

  // Salva quando history cambia
  useEffect(() => {
    if (listId === initializedForList) {
      saveHistory(history, listId)
    }
  }, [history, listId, initializedForList])

  // Genera ID unico
  const generateId = () => crypto.randomUUID()

  // Aggiunge prodotto allo storico
  const addToHistory = useCallback((name, category) => {
    const key = normalizeProductName(name)

    setHistory(prev => {
      const existing = prev[key] || {
        name: name.trim(), // Mantiene la formattazione originale
        category,
        count: 0,
        lastPurchased: null
      }

      return {
        ...prev,
        [key]: {
          ...existing,
          name: name.trim(), // Aggiorna con l'ultima formattazione usata
          category, // Aggiorna con l'ultima categoria usata
          count: existing.count + 1,
          lastPurchased: new Date().toISOString()
        }
      }
    })
  }, [])

  // Add new item
  const addItem = useCallback((name, quantity = 1, unit = 'pz', category = 'altro', price = null, supermarketId = null) => {
    if (!name.trim()) return null

    const newItem = {
      id: generateId(),
      name: name.trim(),
      quantity,
      unit,
      category,
      price,
      supermarketId,
      checked: false,
      created_at: new Date().toISOString(),
    }

    setItems(prev => [newItem, ...prev])
    return newItem
  }, [])

  // Toggle item checked status
  const toggleItem = useCallback((id) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id)

      // Se stiamo spuntando (non era checked, ora lo diventa)
      if (item && !item.checked) {
        // Aggiunge allo storico quando viene completato
        addToHistory(item.name, item.category)
      }

      return prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    })
  }, [addToHistory])

  // Update item
  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  // Delete item
  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // Riordina i prodotti attivi (non completati) DENTRO una categoria.
  // Riscrive l'array mantenendo fisse le posizioni di tutti gli altri item
  // (completati e prodotti di altre categorie).
  const reorderCategoryItems = useCallback((category, orderedCatItems) => {
    setItems(prev => {
      const orderedIds = orderedCatItems.map(i => i.id)
      const byId = new Map(prev.map(i => [i.id, i]))
      let idx = 0
      return prev.map(it => {
        if (!it.checked && (it.category || 'altro') === category) {
          const nextId = orderedIds[idx++]
          return byId.get(nextId) || it
        }
        return it
      })
    })
  }, [])

  // Clear all checked items
  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.checked))
  }, [])

  // Ottieni prodotti suggeriti (frequenti), filtrati per query
  const getSuggestedProducts = useCallback((query = '') => {
    // Filtra prodotti con almeno MIN_PURCHASES_FOR_SUGGESTION acquisti
    const frequent = Object.values(history)
      .filter(item => item.count >= MIN_PURCHASES_FOR_SUGGESTION)
      // Ordina per frequenza (decrescente)
      .sort((a, b) => b.count - a.count)

    // Se non ci sono dati reali, usa i mock per demo
    const allSuggestions = frequent.length > 0 ? frequent : MOCK_SUGGESTIONS

    // Escludi prodotti già nella lista attuale
    const currentNames = items.map(i => normalizeProductName(i.name))
    let suggestions = allSuggestions.filter(item =>
      !currentNames.includes(normalizeProductName(item.name))
    )

    // Se c'è una query, filtra per nome
    if (query.trim()) {
      const queryLower = query.toLowerCase().trim()
      suggestions = suggestions.filter(item =>
        item.name.toLowerCase().includes(queryLower)
      )
    }

    // Limita risultati
    return suggestions.slice(0, MAX_SUGGESTIONS)
  }, [history, items])

  // Stats
  const totalItems = items.length
  const checkedItems = items.filter(i => i.checked).length
  const uncheckedItems = totalItems - checkedItems

  // Calcolo totale spesa stimata (solo items non completati con prezzo)
  const totalPrice = items
    .filter(i => !i.checked && i.price)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return {
    items,
    loading,
    saving: false,
    error: null,
    addItem,
    toggleItem,
    updateItem,
    deleteItem,
    reorderCategoryItems,
    clearChecked,
    refresh: () => setItems(loadItems(listId)),
    getSuggestedProducts,
    stats: {
      total: totalItems,
      checked: checkedItems,
      unchecked: uncheckedItems,
      totalPrice,
    },
  }
}
