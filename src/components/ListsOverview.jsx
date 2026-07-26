import { useState, forwardRef } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { useLongPressDrag } from '../hooks/useLongPressDrag'
import { Plus, Trash2, Store, Settings, ScanBarcode, Share2, Gift, ListPlus, Pencil, GripVertical, Navigation, PackageOpen, ChevronRight, ChevronDown, Receipt } from 'lucide-react'
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Pallino: colore supermercato se legata, azzurro se generica */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: supermarket ? supermarket.color : '#0EA5E9' }}
            />
            <h3 className="font-semibold text-night truncate min-w-0">{list.name}</h3>
            {supermarket ? (
              <span
                className="ml-auto flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded text-white"
                style={{ backgroundColor: supermarket.color }}
              >
                {supermarket.name}
              </span>
            ) : (
              <span className="ml-auto flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded bg-cloud text-slate">
                Generica
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

        {/* Azioni: menu */}
        <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {listActions.length > 0 && (
            <DropdownMenu actions={listActions} />
          )}
        </div>
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
  onNavigateToSupermarkets,
  onNavigateToCatalog,
  onNavigateToDashboard
}) {
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

  // Sezioni home collassabili (stato persistito, senza riquadri aggiuntivi)
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lista-spesa-home-collapsed')) || {} } catch { return {} }
  })
  const toggleCollapsed = (key) => setCollapsed((prev) => {
    const next = { ...prev, [key]: !prev[key] }
    try { localStorage.setItem('lista-spesa-home-collapsed', JSON.stringify(next)) } catch { /* no-op */ }
    return next
  })

  // Crea lista per supermercato
  const handleCreateListForSupermarket = (supermarket) => {
    const listName = `Lista ${supermarket.name}`
    onCreateList(listName, supermarket.id)
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
      {/* CTA: sfoglia il catalogo prodotti (in cima alla home) */}
      <button
        onClick={onNavigateToCatalog}
        className="w-full flex items-center gap-3 mb-6 p-4 bg-white rounded-xl shadow-soft hover:shadow-md transition-all text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-sky-light flex items-center justify-center flex-shrink-0">
          <PackageOpen className="w-6 h-6 text-ocean" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-night">Sfoglia prodotti</h3>
          <p className="text-sm text-slate">Scopri il catalogo e aggiungi ai preferiti</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-light flex-shrink-0" />
      </button>

      {/* CTA: dashboard spese / scontrini */}
      <button
        onClick={onNavigateToDashboard}
        className="w-full flex items-center gap-3 mb-6 p-4 bg-white rounded-xl shadow-soft hover:shadow-md transition-all text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Receipt className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-night">Le mie spese</h3>
          <p className="text-sm text-slate">Scontrini: speso e risparmiato per supermercato</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-light flex-shrink-0" />
      </button>

      {/* Sezione Liste (pannello azzurro che accoglie le card) */}
      <div className="mb-6 rounded-2xl bg-[#a6dcf2] p-2">
        <button
          onClick={() => toggleCollapsed('lists')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
          aria-expanded={!collapsed.lists}
        >
          <h2 className="text-lg font-semibold text-night">Le mie liste</h2>
          <span className="text-sm text-ocean/70">({lists.length})</span>
          <ChevronDown className={`w-5 h-5 text-ocean ml-auto transition-transform ${collapsed.lists ? '-rotate-90' : ''}`} />
        </button>

        {!collapsed.lists && (
          <div className="space-y-3 mt-2">
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
          </div>
        )}
      </div>

      {/* Sezione Supermercati (pannello azzurro che accoglie le card) */}
      <div className="mt-6 rounded-2xl bg-[#a6dcf2] p-2">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <button
            onClick={() => toggleCollapsed('supermarkets')}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
            aria-expanded={!collapsed.supermarkets}
          >
            <h2 className="text-lg font-semibold text-night truncate">I miei supermercati</h2>
            <span className="text-sm text-ocean/70 flex-shrink-0">({favoriteSupermarkets.length})</span>
          </button>
          <button
            onClick={onNavigateToSupermarkets}
            aria-label="Gestisci supermercati"
            title="Gestisci supermercati"
            className="mr-2 text-ocean hover:text-deep transition-colors flex-shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleCollapsed('supermarkets')}
            aria-label={collapsed.supermarkets ? 'Espandi' : 'Comprimi'}
            className="flex-shrink-0"
          >
            <ChevronDown className={`w-5 h-5 text-ocean transition-transform ${collapsed.supermarkets ? '-rotate-90' : ''}`} />
          </button>
        </div>

        {!collapsed.supermarkets && (
          <div className="mt-2">
            {favoriteSupermarkets.length > 0 ? (
        <div className="space-y-3">
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
                  className="p-3 bg-white rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
                >
                  {/* Mini header a tutta larghezza: nome (troncato) + stato, una riga */}
                  <div className="flex items-center gap-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: supermarket.color }}
                    />
                    <p className="font-semibold text-night truncate flex-1 min-w-0">{supermarket.name}</p>
                    {status && (
                      <span className="flex items-center gap-1.5 text-xs italic flex-shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 not-italic ${status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`font-semibold ${status.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {status.isOpen ? 'Aperto' : 'Chiuso'}
                        </span>
                        <span className="text-slate">· {status.detail}</span>
                      </span>
                    )}
                  </div>

                  {/* Riga inferiore: barcode (o CTA) a sinistra, azioni a destra */}
                  <div className="flex items-stretch gap-3 mt-2 pt-2 border-t border-cloud">
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center bg-[#e7eff7] rounded-lg px-3 py-2">
                      {hasCardSaved ? (
                        <>
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
                          <p className="mt-1 font-mono text-xs tracking-widest text-slate">
                            {formatCardNumber(card.cardNumber)}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-0.5 text-slate">
                          <Plus className="w-7 h-7 text-sky" strokeWidth={2.5} />
                          <span className="text-xs">Aggiungi tessera</span>
                        </div>
                      )}
                    </div>

                    {/* Azioni a destra separate da divisoria verticale */}
                    <div
                      className="flex flex-col items-center justify-center gap-1 pl-3 border-l border-cloud flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleDirections}
                        aria-label={`Indicazioni per ${supermarket.name}`}
                        title="Indicazioni stradali"
                        className="w-9 h-9 flex items-center justify-center text-ocean hover:bg-sky-light/40 rounded-lg transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                      <DropdownMenu actions={supermarketActions} />
                    </div>
                  </div>
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
        )}
      </div>

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
