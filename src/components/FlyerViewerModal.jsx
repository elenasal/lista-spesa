import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag } from 'lucide-react'
import { getProductIcon } from '../data/productIcons'

/**
 * Visualizzatore volantino (mockup) a schermo intero.
 *
 * Props:
 * - isOpen, onClose
 * - flyer: { title, period, accent, supermarketName, items[] }
 */
export default function FlyerViewerModal({ isOpen, onClose, flyer }) {
  if (!isOpen || !flyer) return null

  const formatPrice = (v) => `${v.toFixed(2).replace('.', ',')} €`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md h-[92vh] sm:h-[88vh] sm:rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Testata volantino */}
          <div className="p-4 text-white flex items-start gap-3" style={{ backgroundColor: flyer.accent }}>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-90">
                Volantino · {flyer.supermarketName}
              </p>
              <h2 className="text-xl font-bold leading-tight">{flyer.title}</h2>
              <p className="text-sm opacity-90 mt-0.5">{flyer.period}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-1 -mt-1 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Griglia offerte */}
          <div className="flex-1 overflow-y-auto p-3 bg-snow">
            <div className="grid grid-cols-2 gap-2">
              {flyer.items.map((it) => (
                <div
                  key={it.id}
                  className="relative bg-white border border-cloud rounded-xl p-3 flex flex-col items-center text-center"
                >
                  {it.onSale && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-full">
                      <Tag className="w-2.5 h-2.5" />
                      -{it.discount}%
                    </span>
                  )}
                  <div className="text-4xl mb-2">{getProductIcon(it.name, it.category)}</div>
                  <p className="text-xs text-night font-medium leading-snug line-clamp-2 min-h-[2rem]">
                    {it.name}
                  </p>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className={`text-lg font-extrabold ${it.onSale ? 'text-rose-600' : 'text-night'}`}>
                      {formatPrice(it.price)}
                    </span>
                    {it.oldPrice && (
                      <span className="text-xs text-slate-light line-through">
                        {formatPrice(it.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-slate-light italic mt-4">
              Volantino dimostrativo · prezzi di esempio
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
