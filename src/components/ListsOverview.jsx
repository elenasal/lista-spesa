import { useState, forwardRef } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { useLongPressDrag } from '../hooks/useLongPressDrag'
import { ShoppingCart, Plus, Trash2, Store, Settings, Wallet, ScanBarcode, Share2, Gift, ListPlus, Pencil, X, GripVertical, Navigation } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useLoyaltyCards } from '../hooks/useLoyaltyCards'
import { getSupermarketById, getOpenStatus } from '../data/supermarkets'
import ShareAvatars from './ui/ShareAvatars'
import CardDisplayModal from './CardDisplayModal'
import Barcode, { formatCardNumber } from './ui/Barcode'
import LoyaltyCardModal from './LoyaltyCardModal'
import EditListModal from './EditListModal'
import ShareModal from './ShareModal'
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

// Card di una singola lista (estratta per poter usare useDragControls per riga)
// forwardRef: AnimatePresence passa un ref per animare l'uscita della card.
const ListCard = forwardRef(function ListCard({ list, canDelete, canReorder, onSelect, onEdit, onShare, onDelete }, ref) {
  const dragControls = useDragControls()
  const longPress = useLongPressDrag(dragControls)
  const stats = getListStats(list.id)
  const supermarket = list.supermarketId ? getSupermarketById(list.supermarketId) : null

  const listActions = []
  listActions.push({
    icon: <Pencil className="w-4 h-4" />,
    label: 'Modifica',
    onClick: () => onEdit(list),
  })
  if (stats.items.length > 0) {
    listActions.push({
      icon: <Share2 className="w-4 h-4" />,
      label: 'Condividi',
      onClick: () => onShare({ name: list.name, items: stats.items, members: list.members || [] }),
    })
  }
  if (canDelete) {
    listActions.push({
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Elimina',
      danger: true,
      onClick: () => onDelete(list.id),
    })
  }

  // Radice: Reorder.Item quando riordinabile (2+ liste), altrimenti motion.div
  const Root = canReorder ? Reorder.Item : motion.div
  const rootProps = canReorder
    ? {
        as: 'div',
        value: list,
        dragListener: false,
        dragControls,
        whileDrag: { scale: 1.02, boxShadow: '0 12px 28px rgba(2,132,199,0.18)' },
      }
    : {}

  return (
    <Root
      ref={ref}
      {...rootProps}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <div
        onClick={() => onSelect(list.id)}
        className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
      >
        {/* Maniglia drag - solo con 2+ liste */}
        {canReorder && (
          <button
            {...longPress}
            onClick={(e) => e.stopPropagation()}
            aria-label="Tieni premuto per trascinare"
            className="flex-shrink-0 -ml-1.5 -mr-2 p-0.5 text-slate-300 hover:text-slate cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Icona - con colore supermercato se associato */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0"
          style={{
            background: supermarket
              ? `linear-gradient(135deg, ${supermarket.color}, ${supermarket.color}dd)`
              : 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
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

          {/* Condivisione (mockup): io + membri + "+" per condividere */}
          <ShareAvatars
            members={list.members}
            onAdd={() => onShare({ name: list.name, items: stats.items, members: list.members || [] })}
            className="mt-2"
          />
        </div>

        {/* Menu azioni */}
        {listActions.length > 0 && (
          <DropdownMenu actions={listActions} />
        )}
      </div>
    </Root>
  )
})

export default function ListsOverview({
  lists,
  onSelectList,
  onCreateList,
  onDeleteList,
  onEditList,
  onReorderLists,
  onNavigateToSupermarkets
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListBudget, setNewListBudget] = useState('')

  // Lista in modifica (apre EditListModal)
  const [editingList, setEditingList] = useState(null)

  // Lista da condividere (apre ShareModal) — { name, items }
  const [sharingList, setSharingList] = useState(null)

  // Supermercati preferiti
  const { favorites: favoriteSupermarkets, toggleFavorite } = useFavoriteSupermarkets()
  const { getCard, saveCard, removeCard, hasCard } = useLoyaltyCards()

  // Modal tessera
  const [displayingCard, setDisplayingCard] = useState(null)
  const [editingCard, setEditingCard] = useState(null)

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
      {/* Wave che scende ai bordi - full bleed fino ai bordi dello schermo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen" style={{ marginTop: '-1px' }}>
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

    <div className="relative pt-16 pb-4">
      {/* Sezione Liste */}
      <div className="flex items-center gap-2 mb-5 ml-4">
        <ShoppingCart className="w-5 h-5 text-ocean" />
        <h2 className="text-lg font-semibold text-night">Le mie liste</h2>
      </div>

      <div className="space-y-3">
        {lists.length > 1 ? (
          <Reorder.Group
            as="div"
            axis="y"
            values={lists}
            onReorder={onReorderLists}
            className="space-y-3"
          >
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                canDelete={lists.length > 1}
                canReorder
                onSelect={onSelectList}
                onEdit={setEditingList}
                onShare={setSharingList}
                onDelete={onDeleteList}
              />
            ))}
          </Reorder.Group>
        ) : (
          <AnimatePresence mode="popLayout">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                canDelete={false}
                canReorder={false}
                onSelect={onSelectList}
                onEdit={setEditingList}
                onShare={setSharingList}
                onDelete={onDeleteList}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Nuova lista */}
        <motion.div layout className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgb(57 183 239 / 29%)' }}>
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
                <div className="flex items-center gap-2 flex-1 min-w-0 px-4 py-2.5 bg-white border border-cloud rounded-xl shadow-soft">
                  <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={newListBudget}
                    onChange={(e) => setNewListBudget(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Budget"
                    className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
                  />
                  <span className="text-slate text-sm flex-shrink-0">€</span>
                </div>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewListName('')
                    setNewListBudget('')
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-ocean hover:text-deep hover:bg-white/60 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
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

      {/* Sezione Supermercati Preferiti */}
      <div className="flex items-center justify-between mt-10 mb-5 mx-4">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-ocean" />
          <h2 className="text-lg font-semibold text-night">I miei supermercati</h2>
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
            const status = getOpenStatus(supermarket)

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

            const handleSupermarketTap = () => {
              if (hasCardSaved) {
                setDisplayingCard(supermarket)
              } else {
                setEditingCard(supermarket)
              }
            }

            // Indicazioni stradali: Google Maps verso l'indirizzo del punto vendita
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${supermarket.name} ${supermarket.address}, ${supermarket.city}`
            )}`
            const handleDirections = (e) => {
              e.stopPropagation()
              window.open(directionsUrl, '_blank', 'noopener,noreferrer')
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
                  className="p-4 bg-white rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: supermarket.color }}
                    >
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-night">{supermarket.name}</p>
                      {/* Orario - sempre visibile */}
                      {status && (
                        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`font-semibold ${status.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {status.isOpen ? 'APERTO' : 'CHIUSO'}
                          </span>
                          <span className="text-slate">· {status.detail}</span>
                        </p>
                      )}
                      {!hasCardSaved && (
                        <p className="text-xs text-slate mt-0.5">
                          Tocca per aggiungere tessera
                        </p>
                      )}
                    </div>
                    {/* Indicazioni stradali rapide */}
                    <button
                      onClick={handleDirections}
                      aria-label={`Indicazioni per ${supermarket.name}`}
                      title="Indicazioni stradali"
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-ocean hover:bg-sky-light/40 rounded-lg transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                    <DropdownMenu actions={supermarketActions} />
                  </div>

                  {/* Barcode carta fedeltà visibile subito (senza aprire il dettaglio) */}
                  {hasCardSaved && (
                    <div className="mt-2 pt-2 border-t border-cloud">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ScanBarcode className="w-3 h-3 text-slate" />
                        <span className="text-[10px] font-semibold text-slate uppercase tracking-wider">
                          {card.cardName || 'Tessera'}
                        </span>
                        {card.hasLoyaltyProgram && card.points && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600">
                            <Gift className="w-2.5 h-2.5" />
                            {card.points.toLocaleString('it-IT')} pt
                          </span>
                        )}
                      </div>
                      <Barcode number={card.cardNumber} height={36} className="max-w-full overflow-hidden" />
                      <p className="mt-1 text-center font-mono text-xs tracking-widest text-slate">
                        {formatCardNumber(card.cardNumber)}
                      </p>
                    </div>
                  )}
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

      <EditListModal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        list={editingList}
        onSave={(data) => onEditList(editingList.id, data)}
      />

      <ShareModal
        isOpen={!!sharingList}
        onClose={() => setSharingList(null)}
        items={sharingList?.items || []}
        listName={sharingList?.name || 'Lista'}
        members={sharingList?.members || []}
      />

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
