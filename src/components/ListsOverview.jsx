import { useState, forwardRef } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { useLongPressDrag } from '../hooks/useLongPressDrag'
import { Trash2, Share2, Pencil, GripVertical, ShoppingBasket } from 'lucide-react'
import { getSupermarketById } from '../data/supermarkets'
import ShareAvatars from './ui/ShareAvatars'
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
  onDeleteList,
  onEditList,
  onReorderLists,
}) {
  // Lista in modifica (apre EditListModal)
  const [editingList, setEditingList] = useState(null)

  // Lista da condividere (apre ShareModal) — { name, items }
  const [sharingList, setSharingList] = useState(null)

  return (
    <div className="relative">
      {/* L'onda decorativa ora arriva dall'header (variante home). Qui solo il
          padding-top per non far finire le card sotto l'onda. */}
    <div className="relative pt-20 pb-4">
      {/* Titolo sezione — stesso stile di "I miei preferiti" in CatalogPage */}
      <div className="flex items-center gap-2 px-1 mb-3">
        <ShoppingBasket className="w-4 h-4 text-ocean flex-shrink-0" />
        <h2 className="text-lg font-semibold text-night">Le mie liste</h2>
        {lists.length > 0 && (
          <span className="text-sm text-slate-light">({lists.length})</span>
        )}
      </div>

      {/* Card liste dirette: nessun box/collasso (è l'unica sezione della home) */}
      <div className="space-y-3 mb-6">
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
    </div>
    </div>
  )
}
