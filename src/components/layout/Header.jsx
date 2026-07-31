import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

// Header compatto unificato.
// - Variante home (isHome): fascia bassa a una riga (micro-saluto + titolo breve + azioni), senza back.
// - Variante standard: titolo (+ sottotitolo breve), back OPZIONALE (solo se `onBack`), portali avatar/azioni + wave.
export default function Header({ title, subtitle, onBack, isHome = false, rightAction }) {
  // Onda decorativa unica per home e pagine interne: forma piena h-12 che scende
  // dal bordo inferiore dell'header (assoluta, non occupa spazio nel layout).
  const wave = (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full h-12 translate-y-[98%] pointer-events-none"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(14, 165, 233, 0.15))' }}
    >
      <path
        d="M0,0 L0,60 Q360,120 720,60 Q1080,0 1440,60 L1440,0 Z"
        className="fill-ocean"
      />
    </svg>
  )

  // Classi condivise per lo slot azioni: box bianco grande (w-11 h-11, rounded-xl)
  // identico tra home e pagine interne.
  const actionSlotClasses =
    'flex items-center gap-2 [&_button]:w-11 [&_button]:h-11 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:bg-white/15 [&_button]:hover:bg-white/25 [&_button]:rounded-xl [&_button]:border [&_button]:border-white/20 [&_button]:transition-all [&_button]:text-white [&_svg]:w-6 [&_svg]:h-6 [&_svg]:text-white'

  if (isHome) {
    return (
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 overflow-visible bg-ocean"
      >
        {/* Decorazione ridotta: una sola banda chiara leggera in alto */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-sky-300/40 to-transparent" />
          <div className="absolute -top-6 right-8 w-20 h-20 bg-white/15 rounded-full blur-md" />
        </div>

        {/* Contenuto: una riga ~64px */}
        <div
          className="relative max-w-lg mx-auto px-5 pb-3 flex items-center justify-between gap-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}
        >
          <div className="min-w-0">
            <h1 className="text-white text-xl font-bold leading-tight truncate">
              {title || 'Le mie liste'}
            </h1>
            {subtitle && (
              <p className="text-sky-100/70 text-sm mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Slot azioni a destra (help + campanello) — stesso box grande delle pagine interne */}
          {rightAction && (
            <div className={`relative z-10 flex-shrink-0 ${actionSlotClasses}`}>
              {rightAction}
            </div>
          )}
        </div>

        {/* Onda unica che scende dal bordo inferiore */}
        {wave}
      </motion.header>
    )
  }

  // Header standard per le altre viste (top-level senza back, drill-down con back)
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-ocean overflow-visible"
    >
      {/* Texture leggera */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-sky-400/20 to-transparent" />
        <div className="absolute -top-4 right-12 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      </div>

      <div
        className="relative max-w-lg mx-auto px-5 pb-3 flex items-center gap-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}
      >
        {/* Back opzionale: presente solo nelle viste drill-down */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Indietro"
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-white bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-xl leading-tight truncate">
            {title || 'Lista della Spesa'}
          </h1>
          {subtitle && (
            <p className="text-sm text-sky-100/90 font-normal mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Aggancio avatar condivisione (stile neutro, non toccato dallo stile pulsanti) */}
        <div id="header-avatars-portal" className="flex items-center flex-shrink-0" />

        {/* Azioni - stile bianco con box */}
        <div className={actionSlotClasses}>
          {rightAction}
          {/* empty:hidden → quando nessuna vista inietta azioni (pagine-tab) il portale
              non occupa spazio, così il campanello resta a filo destro come in home. */}
          <div id="header-action-portal" className="empty:hidden" />
        </div>
      </div>

      {/* Onda unica che scende dal bordo inferiore */}
      {wave}
    </motion.header>
  )
}
