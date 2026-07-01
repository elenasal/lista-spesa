import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'

const CATEGORIES = [
  { id: 'frutta-verdura', name: 'Frutta e Verdura' },
  { id: 'pane-cereali', name: 'Pane e Cereali' },
  { id: 'latticini', name: 'Latticini' },
  { id: 'carne-pesce', name: 'Carne e Pesce' },
  { id: 'surgelati', name: 'Surgelati' },
  { id: 'dispensa', name: 'Dispensa' },
  { id: 'bevande', name: 'Bevande' },
  { id: 'igiene', name: 'Igiene Personale' },
  { id: 'casa', name: 'Casa e Pulizia' },
  { id: 'altro', name: 'Altro' },
]

export default function AddProductForm({ onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('altro')
  const [showCategories, setShowCategories] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedCategory = CATEGORIES.find(c => c.id === category)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || loading) return

    setLoading(true)
    await onAdd(name, quantity, category)
    setName('')
    setQuantity(1)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Main input row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aggiungi prodotto..."
            className="w-full px-4 py-3 bg-white border border-cloud rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all shadow-soft"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-sky to-ocean text-white rounded-xl shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-press flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Options row */}
      <div className="flex gap-2">
        {/* Category selector */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-cloud rounded-lg text-sm text-night hover:border-sky transition-all"
          >
            <CategoryIcon category={category} className="w-4 h-4 text-ocean" />
            <span className="flex-1 text-left truncate">{selectedCategory?.name}</span>
            <ChevronDown className={`w-4 h-4 text-slate transition-transform ${showCategories ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-cloud z-10 py-1 max-h-60 overflow-y-auto"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id)
                      setShowCategories(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sky-light/30 transition-colors ${
                      category === cat.id ? 'bg-sky-light/50 text-ocean' : 'text-night'
                    }`}
                  >
                    <CategoryIcon category={cat.id} className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center gap-1 bg-white border border-cloud rounded-lg px-2">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-slate hover:text-night transition-colors"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium text-night">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-slate hover:text-night transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </form>
  )
}
