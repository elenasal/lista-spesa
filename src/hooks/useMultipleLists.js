import { useState, useEffect, useCallback } from 'react'

const LISTS_KEY = 'lista-spesa-lists'
const CURRENT_LIST_KEY = 'lista-spesa-current'

// Liste di default per mockup
const DEFAULT_LISTS = [
  { id: 'default', name: 'Spesa settimanale', createdAt: new Date().toISOString() },
]

function loadLists() {
  try {
    const saved = localStorage.getItem(LISTS_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_LISTS
  } catch {
    return DEFAULT_LISTS
  }
}

function saveLists(lists) {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
  } catch (err) {
    console.error('Errore salvataggio liste:', err)
  }
}

function loadCurrentListId() {
  try {
    return localStorage.getItem(CURRENT_LIST_KEY) || 'default'
  } catch {
    return 'default'
  }
}

function saveCurrentListId(id) {
  try {
    localStorage.setItem(CURRENT_LIST_KEY, id)
  } catch (err) {
    console.error('Errore salvataggio lista corrente:', err)
  }
}

export function useMultipleLists() {
  // Inizializza direttamente con i dati salvati per evitare race condition
  const [lists, setLists] = useState(() => loadLists())
  const [currentListId, setCurrentListId] = useState(() => loadCurrentListId())
  const [loading, setLoading] = useState(false)

  // Salva liste quando cambiano (solo se ci sono liste)
  useEffect(() => {
    if (lists.length > 0) {
      saveLists(lists)
    }
  }, [lists])

  // Salva lista corrente quando cambia
  useEffect(() => {
    if (currentListId) {
      saveCurrentListId(currentListId)
    }
  }, [currentListId])

  const currentList = lists.find(l => l.id === currentListId) || lists[0]

  // Crea nuova lista
  const createList = useCallback((name) => {
    const newList = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    }
    setLists(prev => [...prev, newList])
    setCurrentListId(newList.id)
    return newList
  }, [])

  // Rinomina lista
  const renameList = useCallback((id, newName) => {
    setLists(prev => prev.map(list =>
      list.id === id ? { ...list, name: newName.trim() } : list
    ))
  }, [])

  // Elimina lista
  const deleteList = useCallback((id) => {
    // Non permettere di eliminare l'ultima lista
    if (lists.length <= 1) return false

    setLists(prev => prev.filter(list => list.id !== id))

    // Se stiamo eliminando la lista corrente, passa alla prima
    if (currentListId === id) {
      const remaining = lists.filter(l => l.id !== id)
      setCurrentListId(remaining[0]?.id || 'default')
    }

    // Pulisci anche gli items della lista eliminata
    try {
      localStorage.removeItem(`lista-spesa-items-${id}`)
      localStorage.removeItem(`lista-spesa-history-${id}`)
    } catch {}

    return true
  }, [lists, currentListId])

  // Cambia lista corrente
  const switchList = useCallback((id) => {
    setCurrentListId(id)
  }, [])

  return {
    lists,
    currentList,
    currentListId,
    loading,
    createList,
    renameList,
    deleteList,
    switchList,
  }
}
