import { motion } from 'framer-motion'
import { Heart, Tag } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'
import { getCategoryColor, getCategoryName } from '../data/categories'
import { getLowestPrice } from '../data/productsDatabase'
import { getSupermarketById } from '../data/supermarkets'

// Card prodotto per il catalogo "Sfoglia prodotti".
// Mostra la foto del prodotto (campo `product.image`, popolato dal dev in futuro)
// oppure un segnaposto grafico colorato per categoria. Tap sul cuore → preferito.
export default function CatalogProductCard({ product, isFavorite, onToggleFavorite, supermarketId = null }) {
  const cat = getCategoryColor(product.category)
  const best = getLowestPrice(product, supermarketId)
  const sm = best ? getSupermarketById(best.supermarketId) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col"
    >
      {/* Area immagine / segnaposto */}
      <div
        className="relative aspect-square flex items-center justify-center"
        style={{ backgroundColor: cat.bg }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-3"
          />
        ) : (
          <div style={{ color: cat.fg }} className="opacity-70">
            <CategoryIcon category={product.category} className="w-14 h-14" />
          </div>
        )}

        {/* Badge offerta */}
        {best?.onSale && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-semibold shadow-soft">
            <Tag className="w-3 h-3" />
            Offerta
          </span>
        )}

        {/* Cuore preferito */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          className={`absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full shadow-soft transition-colors ${
            isFavorite ? 'bg-pink-100 text-pink-500' : 'bg-white/90 text-slate hover:text-pink-400'
          }`}
        >
          <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Info prodotto */}
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-medium text-night leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </p>

        <span className="self-start flex items-center gap-1 px-1.5 py-0.5 rounded bg-cloud text-[11px] font-medium text-slate">
          <CategoryIcon category={product.category} className="w-3 h-3" />
          {getCategoryName(product.category)}
        </span>

        {best && (
          <div className="mt-auto pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] text-slate">da</span>
              <span className="text-base font-bold text-ocean">
                {best.price.toFixed(2).replace('.', ',')} €
              </span>
            </div>
            {sm && (
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sm.color }}
                />
                <span className="text-[11px] text-slate truncate">{sm.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
