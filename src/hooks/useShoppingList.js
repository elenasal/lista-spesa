import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'lista-spesa-items'

// Carica items da localStorage
function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Salva items in localStorage
function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.error('Errore salvataggio:', err)
  }
}

export function useShoppingList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Carica al mount
  useEffect(() => {
    setItems(loadItems())
    setLoading(false)
  }, [])

  // Salva quando items cambia
  useEffect(() => {
    if (!loading) {
      saveItems(items)
    }
  }, [items, loading])

  // Genera ID unico
  const generateId = () => crypto.randomUUID()

  // Add new item
  const addItem = useCallback((name, quantity = 1, category = 'altro') => {
    if (!name.trim()) return null

    const newItem = {
      id: generateId(),
      name: name.trim(),
      quantity,
      category,
      checked: false,
      created_at: new Date().toISOString(),
    }

    setItems(prev => [newItem, ...prev])
    return newItem
  }, [])

  // Toggle item checked status
  const toggleItem = useCallback((id) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }, [])

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

  // Clear all checked items
  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.checked))
  }, [])

  // Stats
  const totalItems = items.length
  const checkedItems = items.filter(i => i.checked).length
  const uncheckedItems = totalItems - checkedItems

  return {
    items,
    loading,
    saving: false,
    error: null,
    addItem,
    toggleItem,
    updateItem,
    deleteItem,
    clearChecked,
    refresh: () => setItems(loadItems()),
    stats: {
      total: totalItems,
      checked: checkedItems,
      unchecked: uncheckedItems,
    },
  }
}
