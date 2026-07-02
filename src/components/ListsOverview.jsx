import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Trash2, Share2, ChevronRight } from 'lucide-react'

// Carica items di una lista per mostrare stats
function getListStats(listId) {
  try {
    const key = listId ? `lista-spesa-items-${listId}` : 'lista-spesa-items'
    const saved = localStorage.getItem(key)
    const items = saved ? JSON.parse(saved) : []

    const unchecked = items.filter(i => !i.checked)
    const totalPrice = unchecked
      .filter(i => i.price)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return {
      total: items.length,
      unchecked: unchecked.length,
      totalPrice
    }
  } catch {
    return { total: 0, unchecked: 0, totalPrice: 0 }
  }
}

export default function ListsOverview({
  lists,
  onSelectList,
  onCreateList,
  onDeleteList
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [copiedListId, setCopiedListId] = useState(null)

  const handleShare = async (e, list) => {
    e.stopPropagation()

    // Carica items della lista
    const key = list.id ? `lista-spesa-items-${list.id}` : 'lista-spesa-items'
    const saved = localStorage.getItem(key)
    const items = saved ? JSON.parse(saved) : []

    // Genera testo della lista
    const text = items
      .filter(i => !i.checked)
      .map(item => {
        let line = `- ${item.name}`
        if (item.quantity > 1) line += ` (x${item.quantity})`
        if (item.price) line += ` - ${(item.price * item.quantity).toFixed(2)}€`
        return line
      })
      .join('\n')

    const fullText = `${list.name}\n\n${text || '(lista vuota)'}`

    try {
      await navigator.clipboard.writeText(fullText)
      setCopiedListId(list.id)
      setTimeout(() => setCopiedListId(null), 2000)
    } catch (err) {
      console.error('Errore copia:', err)
    }
  }

  const handleCreate = () => {
    if (newListName.trim()) {
      onCreateList(newListName)
      setNewListName('')
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setNewListName('')
    }
  }

  return (
    <div className="py-6">
      <h2 className="text-lg font-semibold text-night mb-4">Le tue liste</h2>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {lists.map((list) => {
            const stats = getListStats(list.id)

            return (
              <motion.div
                key={list.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="group"
              >
                <div
                  onClick={() => onSelectList(list.id)}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-soft cursor-pointer card-hover transition-all"
                >
                  {/* Icona */}
                  <div className="w-12 h-12 bg-gradient-to-br from-sky to-ocean rounded-xl flex items-center justify-center shadow-soft">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-night truncate">{list.name}</h3>
                    <p className="text-sm text-slate">
                      {stats.unchecked === 0 ? (
                        'Nessun prodotto'
                      ) : (
                        <>
                          {stats.unchecked} prodott{stats.unchecked === 1 ? 'o' : 'i'}
                          {stats.totalPrice > 0 && (
                            <span className="text-ocean font-medium">
                              {' '}· ~{stats.totalPrice.toFixed(2).replace('.', ',')}€
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Azioni */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleShare(e, list)}
                      className={`p-2 rounded-lg transition-all ${
                        copiedListId === list.id
                          ? 'text-green-500 bg-green-50'
                          : 'text-slate hover:text-ocean hover:bg-sky-light/30'
                      }`}
                      title={copiedListId === list.id ? 'Copiato!' : 'Condividi'}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {lists.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteList(list.id)
                        }}
                        className="p-2 text-slate hover:text-error hover:bg-error-light rounded-lg transition-all"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate ml-1" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Nuova lista */}
        <motion.div layout>
          {isCreating ? (
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-soft border-2 border-sky">
              <div className="w-12 h-12 bg-sky-light rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-ocean" />
              </div>
              <input
                autoFocus
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newListName.trim()) {
                    setIsCreating(false)
                  }
                }}
                placeholder="Nome della lista..."
                className="flex-1 px-3 py-2 bg-snow border border-cloud rounded-lg text-night focus:outline-none focus:border-sky"
              />
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-deep disabled:opacity-50 transition-all"
              >
                Crea
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-4 p-4 bg-white/50 border-2 border-dashed border-cloud rounded-xl text-slate hover:border-sky hover:text-ocean transition-all"
            >
              <div className="w-12 h-12 bg-cloud rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Nuova lista</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
