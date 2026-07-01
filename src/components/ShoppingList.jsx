import { useState } from 'react'
import { useShoppingList } from '../hooks/useShoppingList'
import ProductItem from './ProductItem'
import AddProductForm from './AddProductForm'
import EmptyState from './ui/EmptyState'
import LoadingSpinner from './ui/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle2 } from 'lucide-react'

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

export default function ShoppingList() {
  const {
    items,
    itemsByCategory,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    clearChecked,
    stats,
  } = useShoppingList()

  const [showChecked, setShowChecked] = useState(true)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Separa items checked e unchecked
  const uncheckedItems = items.filter(i => !i.checked)
  const checkedItems = items.filter(i => i.checked)

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
      <AddProductForm onAdd={addItem} />

      {/* Stats bar */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-6 mb-4"
        >
          <p className="text-sm text-slate">
            <span className="font-medium text-night">{stats.unchecked}</span> da comprare
            {stats.checked > 0 && (
              <span className="text-slate-light"> · {stats.checked} completati</span>
            )}
          </p>

          {stats.checked > 0 && (
            <button
              onClick={clearChecked}
              className="text-sm text-slate hover:text-error flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Svuota
            </button>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {items.length === 0 && <EmptyState />}

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
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
