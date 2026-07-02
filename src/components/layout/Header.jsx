import { ShoppingCart, ArrowLeft, Store, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header({ title, subtitle, onBack, onOpenSupermarkets }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cloud"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
        {/* Bottone indietro o icona home */}
        {onBack ? (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-night hover:text-ocean hover:bg-sky-light/30 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-orange-400 rounded-xl flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Titolo */}
        <div className="flex-1">
          <h1 className="font-bold text-night text-xl leading-tight">
            {title || 'Lista della Spesa'}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-light font-normal mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icona supermercati (solo in home) */}
        {onOpenSupermarkets && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSupermarkets}
            className="w-10 h-10 flex items-center justify-center text-slate hover:text-ocean hover:bg-sky-light/30 rounded-xl transition-all"
            title="I miei supermercati"
          >
            <Store className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}
