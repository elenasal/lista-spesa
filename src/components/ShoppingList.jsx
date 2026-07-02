import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useShoppingList } from '../hooks/useShoppingList'
import { useProductFilters } from '../hooks/useProductFilters'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import ProductItem from './ProductItem'
import AddProductForm from './AddProductForm'
import ShareButton from './ShareButton'
import FilterBar from './FilterBar'
import EmptyState from './ui/EmptyState'
import LoadingSpinner from './ui/LoadingSpinner'
import { PRODUCTS_DATABASE } from '../data/productsDatabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle2, FilterX } from 'lucide-react'

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

    // 3. Filtro supermercato
    if (filters.supermarketId) {
      const dbProduct = findProductInDatabase(item.name)
      if (!dbProduct || !dbProduct.prices[filters.supermarketId]) {
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

export default function ShoppingList({ listId, listName = 'Lista della Spesa' }) {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    updateItem,
    deleteItem,
    clearChecked,
    getSuggestedProducts,
    stats,
  } = useShoppingList(listId)

  const { filters, hasActiveFilters, clearAllFilters } = useProductFilters(listId)
  const { favorites: favoriteProducts } = useFavoriteProducts()
  const { favorites: favoriteSupermarketIds } = useFavoriteSupermarkets()

  const [showChecked, setShowChecked] = useState(true)
  const [portalContainer, setPortalContainer] = useState(null)

  // Crea Set dei preferiti per lookup veloce
  const favoritesSet = useMemo(() => {
    return new Set(favoriteProducts.map(p => p.name.toLowerCase().trim()))
  }, [favoriteProducts])

  // Applica filtri agli items
  const filteredItems = useMemo(() => {
    if (!hasActiveFilters) return items

    return filterShoppingItems(items, filters, {
      favoritesSet,
      favoriteSupermarkets: favoriteSupermarketIds,
    })
  }, [items, filters, hasActiveFilters, favoritesSet, favoriteSupermarketIds])

  // Calcola quanti prodotti sono nascosti
  const hiddenCount = items.length - filteredItems.length

  // Trova il container per il portal nell'header
  useEffect(() => {
    const container = document.getElementById('header-action-portal')
    setPortalContainer(container)
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
    <div className="py-6">
      {/* Add form */}
      <AddProductForm onAdd={addItem} getSuggestions={getSuggestedProducts} />

      {/* Stats bar */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-6 mb-4"
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
            {stats.totalPrice > 0 && (
              <span className="text-sm font-semibold text-ocean bg-sky-light/50 px-2 py-0.5 rounded-full">
                ~{stats.totalPrice.toFixed(2).replace('.', ',')} €
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {stats.checked > 0 && (
              <button
                onClick={clearChecked}
                className="text-sm text-slate hover:text-error flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Svuota
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Filter bar */}
      {items.length > 0 && (
        <FilterBar listId={listId} />
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
        {sortedCategories.map(category => (
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
            <div className="space-y-2">
              {uncheckedByCategory[category].map(item => (
                <ProductItem
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onUpdate={updateItem}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Checked items */}
      {checkedItems.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowChecked(!showChecked)}
            className="flex items-center gap-2 text-sm text-slate hover:text-night transition-colors mb-2 px-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completati ({checkedItems.length})</span>
            <span className="text-xs">{showChecked ? '▼' : '▶'}</span>
          </button>

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

      {/* ShareButton nell'header via portal */}
      {portalContainer && createPortal(
        <ShareButton items={items} listName={listName} />,
        portalContainer
      )}
    </div>
  )
}
