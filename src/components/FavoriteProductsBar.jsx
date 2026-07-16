import { useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Plus, Heart, Trash2, Settings, X } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'

// Riga quick-add dei prodotti preferiti, in cima al dettaglio lista.
// Estratta dal vecchio AddProductForm quando l'aggiunta è passata al bottom sheet.
export default function FavoriteProductsBar({ onAdd, listSupermarketId = null }) {
  const { favorites: favoriteProducts, hasFavorites: hasFavoriteProducts, removeFavorite } = useFavoriteProducts()
  const [showAllFavorites, setShowAllFavorites] = useState(false)
  const dragControls = useDragControls()

  const handleQuickAddFavorite = (favProduct) => {
    onAdd(
      favProduct.name,
      favProduct.defaultQuantity || 1,
      favProduct.unit || 'pz',
      favProduct.category,
      favProduct.price,
      listSupermarketId || null
    )
  }

  if (!hasFavoriteProducts) return null

  return (
    <div className="space-y-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-current" />
          <span className="text-xs font-semibold text-slate uppercase">Preferiti</span>
          <span className="text-xs text-slate-light">({favoriteProducts.length})</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAllFavorites(true)}
          className="flex items-center gap-1 text-xs text-ocean hover:text-deep font-medium transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Gestisci
        </button>
      </div>

      {/* Riga scrollabile orizzontalmente */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {favoriteProducts.map((fav) => (
          <motion.button
            key={fav.id}
            type="button"
            onClick={() => handleQuickAddFavorite(fav)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-night hover:border-rose-300 hover:bg-rose-100 transition-all shadow-soft"
          >
            <CategoryIcon category={fav.category} className="w-4 h-4 text-ocean" />
            <span className="whitespace-nowrap">{fav.name}</span>
            <Plus className="w-4 h-4 text-slate" />
          </motion.button>
        ))}
      </div>

      {/* Modal gestione preferiti */}
      <AnimatePresence>
        {showAllFavorites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 overflow-hidden"
            onClick={() => setShowAllFavorites(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) setShowAllFavorites(false)
              }}
              className="w-full max-w-[100vw] sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Maniglia — trascina giù per chiudere */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex-shrink-0 pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="w-11 h-1.5 rounded-full bg-cloud" />
              </div>
              <div className="flex items-center justify-between px-4 pb-4 pt-1 border-b border-cloud">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                  <h3 className="text-lg font-semibold text-night">I tuoi preferiti</h3>
                  <span className="text-sm text-slate">({favoriteProducts.length})</span>
                </div>
                <button
                  onClick={() => setShowAllFavorites(false)}
                  className="p-1 text-slate hover:text-night rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 space-y-2">
                {favoriteProducts.map((fav) => (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-3 p-3 bg-snow rounded-xl min-w-0 overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon category={fav.category} className="w-5 h-5 text-ocean" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-night truncate">{fav.name}</p>
                      <p className="text-xs text-slate truncate">
                        {fav.defaultQuantity} {fav.unit}
                        {fav.price && ` · ${fav.price.toFixed(2).replace('.', ',')}€`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleQuickAddFavorite(fav)
                        setShowAllFavorites(false)
                      }}
                      className="flex-shrink-0 p-2 text-ocean hover:bg-sky-light/50 rounded-lg transition-colors"
                      title="Aggiungi alla lista"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="flex-shrink-0 p-2 text-slate hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Rimuovi dai preferiti"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {favoriteProducts.length === 0 && (
                  <div className="text-center py-8 text-slate">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-slate-light" />
                    <p>Nessun preferito salvato</p>
                    <p className="text-sm text-slate-light mt-1">
                      Clicca il cuore su un prodotto per salvarlo
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
