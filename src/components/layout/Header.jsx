import { ArrowLeft, Store, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header({ title, subtitle, onBack, onOpenSupermarkets, rightAction }) {
  const isHome = !onBack

  if (isHome) {
    return (
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 overflow-hidden bg-ocean"
      >
        {/* Texture leggera nella parte alta */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Banda più chiara in alto */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-sky-300/50 to-transparent" />
          {/* Cerchi decorativi più visibili */}
          <div className="absolute -top-4 right-8 w-24 h-24 bg-white/25 rounded-full blur-md" />
          <div className="absolute top-4 left-4 w-16 h-16 bg-sky-200/30 rounded-full blur-sm" />
          <div className="absolute top-0 left-1/2 w-12 h-12 bg-white/20 rounded-full blur-sm" />
        </div>

        {/* Contenuto */}
        <div className="relative max-w-lg mx-auto px-5 pt-8 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Saluto */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sky-200/90 text-sm font-medium mb-1"
              >
                Bentornato
              </motion.p>
              {/* Titolo principale */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white text-2xl font-bold leading-tight"
              >
                {title || 'La tua spesa'}
              </motion.h1>
              {/* Sottotitolo */}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sky-100/70 text-sm mt-1.5 max-w-[240px]"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            {/* Icona decorativa */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20"
            >
              <ShoppingBag className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        </div>

      </motion.header>
    )
  }

  // Header standard per altre pagine
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-ocean overflow-visible"
    >
      {/* Texture leggera */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-sky-400/20 to-transparent" />
        <div className="absolute -top-4 right-12 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-2 left-20 w-12 h-12 bg-sky-300/20 rounded-full blur-lg" />
      </div>

      <div className="relative max-w-lg mx-auto px-5 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center text-white bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-xl leading-tight truncate">
            {title || 'Lista della Spesa'}
          </h1>
          {subtitle && (
            <p className="text-sm text-sky-100/90 font-normal mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Azioni - stile bianco con box */}
        <div className="flex items-center gap-2 [&_button]:w-11 [&_button]:h-11 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:bg-white/15 [&_button]:hover:bg-white/25 [&_button]:rounded-xl [&_button]:border [&_button]:border-white/20 [&_button]:transition-all [&_button]:text-white [&_svg]:w-6 [&_svg]:h-6 [&_svg]:text-white">
          {rightAction}
          <div id="header-action-portal" />
        </div>
      </div>

      {/* Wave che scende ai bordi con ombra */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 right-0 w-full h-6 translate-y-[95%] drop-shadow-md"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(14, 165, 233, 0.15))' }}
      >
        <path
          d="M0,0 L0,60 Q360,120 720,60 Q1080,0 1440,60 L1440,0 Z"
          className="fill-ocean"
        />
      </svg>
    </motion.header>
  )
}
