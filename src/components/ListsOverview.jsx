import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Trash2, Store, Settings, Wallet, ScanBarcode, Share2, Gift, ListPlus } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useLoyaltyCards } from '../hooks/useLoyaltyCards'
import { getSupermarketById } from '../data/supermarkets'
import CardDisplayModal from './CardDisplayModal'
import LoyaltyCardModal from './LoyaltyCardModal'
import DropdownMenu from './ui/DropdownMenu'

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
  const [newListBudget, setNewListBudget] = useState('')

  // Supermercati preferiti
  const { favorites: favoriteSupermarkets, toggleFavorite } = useFavoriteSupermarkets()
  const { getCard, saveCard, removeCard, hasCard } = useLoyaltyCards()

  // Modal tessera
  const [displayingCard, setDisplayingCard] = useState(null)
  const [editingCard, setEditingCard] = useState(null)

  // Funzione per condividere lista (copia testo)
  const handleShareList = async (list, stats) => {
    const text = stats.items
      .filter(i => !i.checked)
      .map(item => {
        const unit = item.unit || 'pz'
        let line = `- ${item.name}`
        if (item.quantity > 1 || unit !== 'pz') {
          line += ` (${item.quantity} ${unit})`
        }
        if (item.price) line += ` - ${(item.price * item.quantity).toFixed(2)}€`
        return line
      })
      .join('\n')

    const fullText = `${list.name}\n\n${text || 'Lista vuota'}`

    try {
      await navigator.clipboard.writeText(fullText)
      // Feedback visivo potrebbe essere aggiunto qui
    } catch (err) {
      console.error('Errore copia:', err)
    }
  }

  // Crea lista per supermercato
  const handleCreateListForSupermarket = (supermarket) => {
    const listName = `Lista ${supermarket.name}`
    onCreateList(listName, supermarket.id)
  }

  const handleCreate = () => {
    if (newListName.trim()) {
      onCreateList(newListName, null, newListBudget || null)
      setNewListName('')
      setNewListBudget('')
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setNewListName('')
      setNewListBudget('')
    }
  }

  return (
    <div className="relative">
      {/* Wave che scende ai bordi */}
      <div className="absolute top-0 left-0 right-0 -mx-4" style={{ marginTop: '-1px' }}>
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-12 block"
        >
          <path
            d="M0,0 L0,60 Q360,120 720,60 Q1080,0 1440,60 L1440,0 Z"
            className="fill-ocean"
          />
        </svg>
      </div>

    <div className="pt-12 pb-4">
      {/* Box bianco per le liste */}
      <div className="bg-white rounded-2xl shadow-soft p-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <ShoppingCart className="w-5 h-5 text-ocean" />
          <h2 className="text-lg font-semibold text-night">Le tue liste</h2>
        </div>

        <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {lists.map((list) => {
            const stats = getListStats(list.id)
            const supermarket = list.supermarketId ? getSupermarketById(list.supermarketId) : null

            // Azioni menu per la lista
            const listActions = []
            if (stats.items.length > 0) {
              listActions.push({
                icon: <Share2 className="w-4 h-4" />,
                label: 'Condividi',
                onClick: () => handleShareList(list, stats)
              })
            }
            if (lists.length > 1) {
              listActions.push({
                icon: <Trash2 className="w-4 h-4" />,
                label: 'Elimina',
                danger: true,
                onClick: () => onDeleteList(list.id)
              })
            }

            return (
              <motion.div
                key={list.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <div
                  onClick={() => onSelectList(list.id)}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
                >
                  {/* Icona - con colore supermercato se associato */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0"
                    style={{
                      background: supermarket
                        ? `linear-gradient(135deg, ${supermarket.color}, ${supermarket.color}dd)`
                        : 'linear-gradient(135deg, #38BDF8, #0EA5E9)'
                    }}
                  >
                    {supermarket ? (
                      <Store className="w-6 h-6 text-white" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-night">{list.name}</h3>
                      {supermarket && (
                        <span
                          className="px-1.5 py-0.5 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: supermarket.color }}
                        >
                          {supermarket.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate mt-0.5">
                      {stats.unchecked === 0 ? (
                        'Nessun prodotto'
                      ) : (
                        <>
                          {stats.unchecked} prodott{stats.unchecked === 1 ? 'o' : 'i'}
                        </>
                      )}
                    </p>
                    {/* Budget/prezzo ben visibile */}
                    {(stats.totalPrice > 0 || list.budget) && (
                      <div className="flex items-center gap-2 mt-1">
                        {stats.totalPrice > 0 && (
                          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                            list.budget && stats.totalPrice > list.budget
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-sky-light/50 text-ocean'
                          }`}>
                            ~{stats.totalPrice.toFixed(2).replace('.', ',')} €
                          </span>
                        )}
                        {list.budget && (
                          <span className="text-xs text-slate-light">
                            / {list.budget.toFixed(2).replace('.', ',')} €
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Menu azioni */}
                  {listActions.length > 0 && (
                    <DropdownMenu actions={listActions} />
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Nuova lista - fascia azzurrina come AddProductForm */}
        <motion.div layout className="bg-sky-light/50 -mx-4 px-4 py-4 rounded-xl mt-4">
          {isCreating ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nome della lista..."
                  className="flex-1 min-w-0 px-4 py-3 bg-white border border-cloud rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 shadow-soft"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newListName.trim()}
                  className="px-4 py-3 bg-ocean text-white rounded-xl hover:bg-deep disabled:opacity-50 transition-all font-medium shadow-soft"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 px-4 py-2.5 bg-white border border-cloud rounded-xl shadow-soft">
                  <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={newListBudget}
                    onChange={(e) => setNewListBudget(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Budget (opzionale)"
                    className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
                  />
                  <span className="text-slate text-sm">€</span>
                </div>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewListName('')
                    setNewListBudget('')
                  }}
                  className="px-3 py-2.5 text-slate hover:text-night hover:bg-white/50 rounded-xl transition-colors text-sm font-medium"
                >
                  Annulla
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-cloud rounded-xl text-slate hover:border-sky hover:text-ocean transition-all shadow-soft"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuova lista...</span>
            </button>
          )}
        </motion.div>
        </div>
      </div>

      {/* Sezione Supermercati Preferiti */}
      <div className="bg-white rounded-2xl shadow-soft p-4 mt-4">
        <div className="flex items-center justify-between mb-4 px-1">
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

              const card = getCard(supermarket.id)
              const hasCardSaved = hasCard(supermarket.id)

              // Azioni menu per supermercato
              const supermarketActions = [
                {
                  icon: <ListPlus className="w-4 h-4" />,
                  label: 'Crea lista',
                  onClick: () => handleCreateListForSupermarket(supermarket)
                },
                {
                  icon: <Trash2 className="w-4 h-4" />,
                  label: 'Rimuovi',
                  danger: true,
                  onClick: () => toggleFavorite(supermarket.id)
                }
              ]

              // Tap sulla card: mostra tessera o apri form
              const handleSupermarketTap = () => {
                if (hasCardSaved) {
                  setDisplayingCard(supermarket)
                } else {
                  setEditingCard(supermarket)
                }
              }

              return (
                <motion.div
                  key={supermarket.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    onClick={handleSupermarketTap}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: supermarket.color }}
                    >
                      <Store className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-night">{supermarket.name}</p>
                      {hasCardSaved ? (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ScanBarcode className="w-3 h-3" />
                            {card.cardName || 'Tessera'}
                          </span>
                          {card.hasLoyaltyProgram && card.points && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Gift className="w-3 h-3" />
                              {card.points.toLocaleString('it-IT')} pt
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate mt-0.5">
                          Tocca per aggiungere tessera
                        </p>
                      )}
                    </div>

                    {/* Menu azioni */}
                    <DropdownMenu actions={supermarketActions} />
                  </div>
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

      {/* Modal visualizza tessera */}
      <CardDisplayModal
        isOpen={!!displayingCard}
        onClose={() => setDisplayingCard(null)}
        supermarket={displayingCard}
        cardData={displayingCard ? getCard(displayingCard.id) : null}
        onEdit={() => {
          setEditingCard(displayingCard)
          setDisplayingCard(null)
        }}
      />

      {/* Modal modifica tessera */}
      <LoyaltyCardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        supermarket={editingCard}
        cardData={editingCard ? getCard(editingCard.id) : null}
        onSave={(data) => saveCard(editingCard.id, data)}
        onDelete={() => removeCard(editingCard.id)}
      />
    </div>
    </div>
  )
}
