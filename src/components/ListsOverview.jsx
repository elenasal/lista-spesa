import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Trash2, ChevronRight, Store, Settings, X } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { getSupermarketById } from '../data/supermarkets'
import ShareButton from './ShareButton'

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
      totalPrice,
      items // Restituisce anche gli items per ShareButton
    }
  } catch {
    return { total: 0, unchecked: 0, totalPrice: 0, items: [] }
  }
}

export default function ListsOverview({
  lists,
  onSelectList,
  onCreateList,
  onDeleteList,
  onNavigateToSupermarkets
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')

  // Supermercati preferiti
  const { favorites: favoriteSupermarkets, toggleFavorite } = useFavoriteSupermarkets()

  // Crea lista per supermercato
  const handleCreateListForSupermarket = (supermarket) => {
    const listName = `Lista ${supermarket.name}`
    onCreateList(listName, supermarket.id)
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
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-ocean" />
        <h2 className="text-lg font-semibold text-night">Le tue liste</h2>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {lists.map((list) => {
            const stats = getListStats(list.id)
            const supermarket = list.supermarketId ? getSupermarketById(list.supermarketId) : null

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
                  {/* Icona - con colore supermercato se associato */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-soft"
                    style={{
                      background: supermarket
                        ? `linear-gradient(135deg, ${supermarket.color}, ${supermarket.color}dd)`
                        : 'linear-gradient(135deg, #38BDF8, #0EA5E9)'
                    }}
                  >
                    {supermarket ? (
                      <Store className="w-5 h-5 text-white" />
                    ) : (
                      <ShoppingCart className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-night truncate">{list.name}</h3>
                      {supermarket && (
                        <span
                          className="px-1.5 py-0.5 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: supermarket.color }}
                        >
                          {supermarket.name}
                        </span>
                      )}
                    </div>
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
                    <div onClick={(e) => e.stopPropagation()}>
                      <ShareButton items={stats.items} listName={list.name} />
                    </div>
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
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-soft border-2 border-sky overflow-hidden">
              <div className="w-10 h-10 bg-sky-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-ocean" />
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
                className="flex-1 min-w-0 px-3 py-2 bg-snow border border-cloud rounded-lg text-night focus:outline-none focus:border-sky"
              />
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="flex-shrink-0 px-3 py-2 bg-ocean text-white rounded-lg hover:bg-deep disabled:opacity-50 transition-all text-sm font-medium"
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

      {/* Sezione Supermercati Preferiti */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-ocean" />
            <h2 className="text-lg font-semibold text-night">I tuoi supermercati</h2>
          </div>
          <button
            onClick={onNavigateToSupermarkets}
            className="flex items-center gap-1 text-sm text-ocean hover:text-deep font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Gestisci
          </button>
        </div>

        {favoriteSupermarkets.length > 0 ? (
          <div className="space-y-2">
            {favoriteSupermarkets.map((supermarketId) => {
              const supermarket = getSupermarketById(supermarketId)
              if (!supermarket) return null

              return (
                <motion.div
                  key={supermarket.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-soft"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: supermarket.color }}
                  >
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-night flex-1">{supermarket.name}</p>
                  <button
                    onClick={() => handleCreateListForSupermarket(supermarket)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-ocean hover:bg-sky-light/50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crea lista</span>
                  </button>
                  <button
                    onClick={() => toggleFavorite(supermarket.id)}
                    className="p-2 text-slate-light hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Rimuovi dai preferiti"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="p-4 bg-white/50 border-2 border-dashed border-cloud rounded-xl text-center">
            <Store className="w-8 h-8 text-slate-light mx-auto mb-2" />
            <p className="text-slate text-sm">Nessun supermercato preferito</p>
            <button
              onClick={onNavigateToSupermarkets}
              className="mt-2 text-sm text-ocean hover:text-deep font-medium"
            >
              Aggiungi supermercati
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
