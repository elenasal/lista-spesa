import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useShoppingList } from '../hooks/useShoppingList'
import { useProductFilters } from '../hooks/useProductFilters'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import ProductItem from './ProductItem'
import AddProductSheet from './AddProductSheet'
import FavoriteProductsBar from './FavoriteProductsBar'
import ShareModal from './ShareModal'
import ShareAvatars from './ui/ShareAvatars'
import FilterBar from './FilterBar'
import EmptyState from './ui/EmptyState'
import LoadingSpinner from './ui/LoadingSpinner'
import { PRODUCTS_DATABASE } from '../data/productsDatabase'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Trash2, CheckCircle2, FilterX, Wallet, Pencil, Check, X, Share2 } from 'lucide-react'

// Ordine delle categorie per la visualizzazione
const CATEGORY_ORDER = [
  'frutta-verdura',
  'pane-cereali',
  'latticini',
  'carne-pesce',
  'surgelati',
  'dispensa',
  'bevande',
  'igiene',
  'casa',
  'altro',
]

const CATEGORY_NAMES = {
  'frutta-verdura': 'Frutta e Verdura',
  'pane-cereali': 'Pane e Cereali',
  'latticini': 'Latticini',
  'carne-pesce': 'Carne e Pesce',
  'surgelati': 'Surgelati',
  'dispensa': 'Dispensa',
  'bevande': 'Bevande',
  'igiene': 'Igiene Personale',
  'casa': 'Casa e Pulizia',
  'altro': 'Altro',
}

// Funzione helper per trovare prodotto nel database
function findProductInDatabase(itemName) {
  const nameLower = itemName.toLowerCase().trim()
  return PRODUCTS_DATABASE.find(p =>
    p.name.toLowerCase().includes(nameLower) ||
    nameLower.includes(p.name.toLowerCase().split(' ')[0])
  )
}

// Funzione per applicare i filtri
function filterShoppingItems(items, filters, context) {
  const { favoritesSet, favoriteSupermarkets } = context

  return items.filter(item => {
    // 1. Filtro categoria (più veloce, prima)
    if (filters.category && item.category !== filters.category) {
      return false
    }

    // 2. Filtro preferiti
    if (filters.onlyFavorites) {
      if (!favoritesSet.has(item.name.toLowerCase().trim())) {
        return false
      }
    }

    // 3. Filtro supermercato - mostra solo prodotti assegnati a questo supermercato
    if (filters.supermarketId) {
      if (item.supermarketId !== filters.supermarketId) {
        return false
      }
    }

    // 4. Filtro offerte
    if (filters.onlyOnSale) {
      const dbProduct = findProductInDatabase(item.name)
      if (!dbProduct) return false

      const hasAnySale = favoriteSupermarkets.some(smId => {
        const priceInfo = dbProduct.prices[smId]
        return priceInfo?.onSale === true
      })
      if (!hasAnySale) return false
    }

    return true
  })
}

export default function ShoppingList({ listId, listName = 'Lista della Spesa', listBudget, listSupermarketId = null, listMembers = [], onUpdateBudget }) {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    updateItem,
    deleteItem,
    reorderCategoryItems,
    clearChecked,
    getSuggestedProducts,
    stats,
  } = useShoppingList(listId)

  const { filters, setFilter, clearFilter, clearAllFilters, hasActiveFilters, activeFilterCount } = useProductFilters(listId)
  const { favorites: favoriteProducts } = useFavoriteProducts()
  const { favorites: favoriteSupermarketIds } = useFavoriteSupermarkets()

  const [showChecked, setShowChecked] = useState(true)
  const [actionPortal, setActionPortal] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')

  // Crea Set dei preferiti per lookup veloce
  const favoritesSet = useMemo(() => {
    return new Set(favoriteProducts.map(p => p.name.toLowerCase().trim()))
  }, [favoriteProducts])

  // In una lista legata a un supermercato, il vincolo è SEMPRE quel supermercato:
  // se un filtro supermercato è rimasto salvato (o è stato impostato), lo azzero
  // perché il vincolo lo gestiamo noi in modo forzato qui sotto.
  useEffect(() => {
    if (listSupermarketId && filters.supermarketId) {
      clearFilter('supermarketId')
    }
  }, [listSupermarketId, filters.supermarketId, clearFilter])

  // Applica filtri agli items. Per le liste-supermercato forziamo il filtro
  // supermercato a quel supermercato (non aggirabile), come per la lista Coop.
  const filteredItems = useMemo(() => {
    const effectiveFilters = listSupermarketId
      ? { ...filters, supermarketId: listSupermarketId }
      : filters
    const active = hasActiveFilters || !!listSupermarketId
    if (!active) return items

    return filterShoppingItems(items, effectiveFilters, {
      favoritesSet,
      favoriteSupermarkets: favoriteSupermarketIds,
    })
  }, [items, filters, hasActiveFilters, listSupermarketId, favoritesSet, favoriteSupermarketIds])

  // Calcola quanti prodotti sono nascosti
  const hiddenCount = items.length - filteredItems.length

  // Trova il container per l'icona condividi nell'header
  useEffect(() => {
    setActionPortal(document.getElementById('header-action-portal'))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Separa items checked e unchecked (usa filteredItems)
  const uncheckedItems = filteredItems.filter(i => !i.checked)
  const checkedItems = filteredItems.filter(i => i.checked)

  // Raggruppa unchecked per categoria
  const uncheckedByCategory = uncheckedItems.reduce((acc, item) => {
    const category = item.category || 'altro'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  // Ordina categorie
  const sortedCategories = CATEGORY_ORDER.filter(cat => uncheckedByCategory[cat]?.length > 0)

  return (
    <div className="pt-10 pb-24">
      {/* Barra + pannello di aggiunta prodotto (ancorati in basso) */}
      <AddProductSheet
        onAdd={addItem}
        onUpdate={updateItem}
        getSuggestions={getSuggestedProducts}
        listSupermarketId={listSupermarketId}
      />

      {/* Riga prodotti preferiti (quick-add) in cima */}
      <FavoriteProductsBar onAdd={addItem} listSupermarketId={listSupermarketId} />

      {/* Stats bar */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start justify-between gap-3 mt-6 mb-4"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-slate">
              <span className="font-medium text-night">{uncheckedItems.length}</span> da comprare
              {checkedItems.length > 0 && (
                <span className="text-slate-light"> · {checkedItems.length} completati</span>
              )}
              {hasActiveFilters && hiddenCount > 0 && (
                <span className="text-slate-light"> · {hiddenCount} nascosti</span>
              )}
            </p>
            {(stats.totalPrice > 0 || listBudget) && (
              <div className="flex items-center gap-2">
                {stats.totalPrice > 0 && (
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    listBudget && stats.totalPrice > listBudget
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-ocean bg-sky-light/50'
                  }`}>
                    ~{stats.totalPrice.toFixed(2).replace('.', ',')} €
                  </span>
                )}
                {listBudget && !isEditingBudget && (
                  <button
                    onClick={() => {
                      setBudgetInput(listBudget.toString())
                      setIsEditingBudget(true)
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    {listBudget.toFixed(2).replace('.', ',')} €
                  </button>
                )}
                {!listBudget && !isEditingBudget && (
                  <button
                    onClick={() => {
                      setBudgetInput('')
                      setIsEditingBudget(true)
                    }}
                    className="flex items-center gap-1 text-xs text-slate hover:text-emerald-600 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Imposta budget
                  </button>
                )}
                {isEditingBudget && (
                  <div className="flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <input
                      autoFocus
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateBudget(budgetInput || null)
                          setIsEditingBudget(false)
                        } else if (e.key === 'Escape') {
                          setIsEditingBudget(false)
                        }
                      }}
                      placeholder="0,00"
                      className="w-20 px-2 py-0.5 text-sm bg-white border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-sm text-slate">€</span>
                    <button
                      onClick={() => {
                        onUpdateBudget(budgetInput || null)
                        setIsEditingBudget(false)
                      }}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingBudget(false)}
                      className="p-1 text-slate hover:bg-slate-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pila avatar condivisione - allineata alla riga "N da comprare" */}
          <button
            onClick={() => setShowShare(true)}
            aria-label="Persone sulla lista"
            className="flex-shrink-0 -mt-0.5"
          >
            <ShareAvatars members={listMembers} showAdd={false} size="sm" />
          </button>
        </motion.div>
      )}

      {/* Filter bar */}
      {items.length > 0 && (
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilter={clearFilter}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          lockedSupermarketId={listSupermarketId}
        />
      )}

      {/* Empty state - lista vuota */}
      {items.length === 0 && <EmptyState />}

      {/* Empty state - tutti filtrati */}
      {items.length > 0 && filteredItems.length === 0 && hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-sky-light/50 flex items-center justify-center mb-4">
            <FilterX className="w-8 h-8 text-ocean" />
          </div>
          <h3 className="text-lg font-semibold text-night mb-2">
            Nessun prodotto trovato
          </h3>
          <p className="text-sm text-slate mb-4 max-w-xs">
            I filtri attivi nascondono tutti i {items.length} prodotti nella lista
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-ocean text-white rounded-xl font-medium hover:bg-deep transition-colors"
          >
            Rimuovi filtri
          </button>
        </motion.div>
      )}

      {/* Unchecked items by category */}
      <AnimatePresence mode="popLayout">
        {sortedCategories.map(category => {
          const catItems = uncheckedByCategory[category]
          // Riordino attivo solo con 2+ prodotti e senza filtri (che nasconderebbero item)
          const canReorder = catItems.length > 1 && !hasActiveFilters

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <h3 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2 px-1">
                {CATEGORY_NAMES[category]}
              </h3>
              {canReorder ? (
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={catItems}
                  onReorder={(newOrder) => reorderCategoryItems(category, newOrder)}
                  className="space-y-2"
                >
                  {catItems.map(item => (
                    <ProductItem
                      key={item.id}
                      item={item}
                      reorderable
                      listSupermarketId={listSupermarketId}
                      onToggle={() => toggleItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onUpdate={updateItem}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <div className="space-y-2">
                  {catItems.map(item => (
                    <ProductItem
                      key={item.id}
                      item={item}
                      listSupermarketId={listSupermarketId}
                      onToggle={() => toggleItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onUpdate={updateItem}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Checked items */}
      {checkedItems.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              onClick={() => setShowChecked(!showChecked)}
              className="flex items-center gap-2 text-sm text-slate hover:text-night transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completati ({checkedItems.length})</span>
              <span className="text-xs">{showChecked ? '▼' : '▶'}</span>
            </button>
            <button
              onClick={clearChecked}
              className="flex items-center gap-1 text-xs text-slate hover:text-error transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Svuota</span>
            </button>
          </div>

          <AnimatePresence>
            {showChecked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {checkedItems.map(item => (
                  <ProductItem
                    key={item.id}
                    item={item}
                    listSupermarketId={listSupermarketId}
                    onToggle={() => toggleItem(item.id)}
                    onDelete={() => deleteItem(item.id)}
                    onUpdate={updateItem}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Icona condividi nell'header (via portal) — apre la stessa ShareModal */}
      {actionPortal && createPortal(
        <button onClick={() => setShowShare(true)} aria-label="Condividi lista" title="Condividi lista">
          <Share2 />
        </button>,
        actionPortal
      )}

      {/* Modal condivisione (fuori dal portal → leggibile) */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        items={items}
        listName={listName}
        members={listMembers}
      />
    </div>
  )
}
