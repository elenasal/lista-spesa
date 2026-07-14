import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Heart, Tag, Store, Grid3X3 } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { getSupermarketById } from '../data/supermarkets'
import CategoryIcon from './ui/CategoryIcon'

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
  'igiene': 'Igiene',
  'casa': 'Casa',
  'altro': 'Altro',
}

export default function FilterBar({
  filters,
  setFilter,
  clearFilter,
  clearAllFilters,
  hasActiveFilters,
  activeFilterCount,
  lockedSupermarketId = null,
}) {
  const { favoriteSupermarkets, hasFavorites: hasFavoriteSupermarkets } = useFavoriteSupermarkets()
  const [isExpanded, setIsExpanded] = useState(false)

  // Ottieni nome supermercato per chip
  const getSupermercatoName = (id) => {
    const sm = getSupermarketById(id)
    return sm?.name || id
  }

  return (
    <>
      {/* Barra filtri collassata */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {/* Pulsante Filtra */}
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
            hasActiveFilters
              ? 'bg-ocean text-white'
              : 'bg-white text-slate border border-cloud hover:border-sky hover:text-ocean'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtra</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Chip filtri attivi */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {filters.supermarketId && !lockedSupermarketId && (
              <FilterChip
                label={getSupermercatoName(filters.supermarketId)}
                icon={<Store className="w-3 h-3" />}
                onRemove={() => clearFilter('supermarketId')}
              />
            )}
            {filters.onlyOnSale && (
              <FilterChip
                label="Offerte"
                icon={<Tag className="w-3 h-3" />}
                onRemove={() => clearFilter('onlyOnSale')}
                color="orange"
              />
            )}
            {filters.onlyFavorites && (
              <FilterChip
                label="Preferiti"
                icon={<Heart className="w-3 h-3" />}
                onRemove={() => clearFilter('onlyFavorites')}
                color="rose"
              />
            )}
            {filters.category && (
              <FilterChip
                label={CATEGORY_NAMES[filters.category] || filters.category}
                icon={<CategoryIcon category={filters.category} className="w-3 h-3" />}
                onRemove={() => clearFilter('category')}
              />
            )}

            {/* Rimuovi tutti */}
            <button
              onClick={clearAllFilters}
              className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate bg-slate-100 hover:bg-red-50 hover:text-error rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
              Rimuovi
            </button>
          </div>
        )}
      </div>

      {/* Modal filtri espanso */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 overflow-hidden"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[100vw] sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-cloud">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-ocean" />
                  <h3 className="text-lg font-semibold text-night">Filtra prodotti</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-slate hover:text-night rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenuto filtri */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Sezione Supermercato (nascosta nelle liste legate a un supermercato) */}
                {!lockedSupermarketId && hasFavoriteSupermarkets && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Store className="w-4 h-4 text-ocean" />
                      <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                        Supermercato
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilter('supermarketId', null)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          filters.supermarketId === null
                            ? 'bg-ocean text-white'
                            : 'bg-cloud text-slate hover:bg-sky-light hover:text-ocean'
                        }`}
                      >
                        Tutti
                      </button>
                      {favoriteSupermarkets.map((sm) => (
                        <button
                          key={sm.id}
                          onClick={() => setFilter('supermarketId', sm.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            filters.supermarketId === sm.id
                              ? 'text-white'
                              : 'bg-cloud text-slate hover:bg-sky-light hover:text-ocean'
                          }`}
                          style={filters.supermarketId === sm.id ? { backgroundColor: sm.color } : {}}
                        >
                          {sm.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sezione Stato */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Grid3X3 className="w-4 h-4 text-ocean" />
                    <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                      Stato
                    </span>
                  </div>
                  <div className="space-y-2">
                    {/* Toggle Offerte */}
                    <button
                      onClick={() => setFilter('onlyOnSale', !filters.onlyOnSale)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        filters.onlyOnSale
                          ? 'bg-orange-50 border-2 border-orange-300'
                          : 'bg-snow border-2 border-transparent hover:border-cloud'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        filters.onlyOnSale ? 'bg-orange-100' : 'bg-cloud'
                      }`}>
                        <Tag className={`w-5 h-5 ${filters.onlyOnSale ? 'text-orange-600' : 'text-slate'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${filters.onlyOnSale ? 'text-orange-700' : 'text-night'}`}>
                          Solo offerte
                        </p>
                        <p className="text-xs text-slate">
                          Mostra solo prodotti in promozione
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        filters.onlyOnSale
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-cloud'
                      }`}>
                        {filters.onlyOnSale && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Toggle Preferiti */}
                    <button
                      onClick={() => setFilter('onlyFavorites', !filters.onlyFavorites)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        filters.onlyFavorites
                          ? 'bg-rose-50 border-2 border-rose-300'
                          : 'bg-snow border-2 border-transparent hover:border-cloud'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        filters.onlyFavorites ? 'bg-rose-100' : 'bg-cloud'
                      }`}>
                        <Heart className={`w-5 h-5 ${filters.onlyFavorites ? 'text-rose-500 fill-rose-500' : 'text-slate'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${filters.onlyFavorites ? 'text-rose-700' : 'text-night'}`}>
                          Solo preferiti
                        </p>
                        <p className="text-xs text-slate">
                          Mostra solo prodotti con cuore
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        filters.onlyFavorites
                          ? 'bg-rose-500 border-rose-500'
                          : 'border-cloud'
                      }`}>
                        {filters.onlyFavorites && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sezione Categoria */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon category="altro" className="w-4 h-4 text-ocean" />
                    <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                      Categoria
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilter('category', null)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        filters.category === null
                          ? 'bg-ocean text-white'
                          : 'bg-cloud text-slate hover:bg-sky-light hover:text-ocean'
                      }`}
                    >
                      Tutte
                    </button>
                    {CATEGORY_ORDER.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilter('category', cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                          filters.category === cat
                            ? 'bg-ocean text-white'
                            : 'bg-cloud text-slate hover:bg-sky-light hover:text-ocean'
                        }`}
                      >
                        <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                        <span>{CATEGORY_NAMES[cat]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-cloud flex gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearAllFilters()
                    }}
                    className="flex-1 py-2.5 rounded-xl text-slate hover:text-error hover:bg-red-50 transition-colors font-medium"
                  >
                    Rimuovi filtri
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className={`py-2.5 rounded-xl bg-ocean text-white font-medium transition-colors hover:bg-deep ${
                    hasActiveFilters ? 'flex-1' : 'w-full'
                  }`}
                >
                  {hasActiveFilters ? 'Applica' : 'Chiudi'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Componente Chip filtro
function FilterChip({ label, icon, onRemove, color = 'ocean' }) {
  const colorClasses = {
    ocean: 'bg-sky-light/70 text-ocean border-sky',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  }

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${colorClasses[color]}`}
    >
      {icon}
      <span className="truncate max-w-[80px]">{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="ml-0.5 hover:opacity-70"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  )
}
