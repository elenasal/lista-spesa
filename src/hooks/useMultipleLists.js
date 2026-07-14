import { useState, useEffect, useCallback } from 'react'
import { MOCK_USERS } from '../data/users'

const LISTS_KEY = 'lista-spesa-lists'
const CURRENT_LIST_KEY = 'lista-spesa-current'
const MEMBERS_RESET_KEY = 'lista-spesa-members-reset-v1'

// Liste di default per mockup (la prima è condivisa con 2 utenti come esempio)
const DEFAULT_LISTS = [
  { id: 'default', name: 'Spesa settimanale', createdAt: new Date().toISOString(), members: ['u-giulia', 'u-marco'] },
]

function loadLists() {
  try {
    const saved = localStorage.getItem(LISTS_KEY)
    let lists = saved ? JSON.parse(saved) : DEFAULT_LISTS

    // Migrazione una-tantum: pulisce i membri accumulati e lascia 2 utenti come
    // esempio solo sulla prima lista (liste e prodotti restano intatti).
    if (!localStorage.getItem(MEMBERS_RESET_KEY)) {
      lists = lists.map((l, i) => ({ ...l, members: i === 0 ? ['u-giulia', 'u-marco'] : [] }))
      localStorage.setItem(MEMBERS_RESET_KEY, '1')
      localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
    }

    return lists
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

  // Crea nuova lista (opzionalmente associata a un supermercato e con budget)
  const createList = useCallback((name, supermarketId = null, budget = null) => {
    const newList = {
      id: crypto.randomUUID(),
      name: name.trim(),
      supermarketId,
      budget: budget ? parseFloat(budget) : null,
      members: [],
      createdAt: new Date().toISOString()
    }
    setLists(prev => [...prev, newList])
    setCurrentListId(newList.id)
    return newList
  }, [])

  // Aggiorna budget lista
  const updateListBudget = useCallback((id, budget) => {
    setLists(prev => prev.map(list =>
      list.id === id ? { ...list, budget: budget ? parseFloat(budget) : null } : list
    ))
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

  // Riordina le liste (drag & drop in home). newOrder è l'array completo riordinato.
  const reorderLists = useCallback((newOrder) => {
    setLists(newOrder)
  }, [])

  // Aggiunge alla lista il prossimo utente finto non ancora presente (mockup condivisione)
  const addMemberToList = useCallback((id) => {
    setLists(prev => prev.map(list => {
      if (list.id !== id) return list
      const members = list.members || []
      const next = MOCK_USERS.find(u => !members.includes(u.id))
      if (!next) return list
      return { ...list, members: [...members, next.id] }
    }))
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
    updateListBudget,
    reorderLists,
    addMemberToList,
  }
}
