import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Calendar, AlertCircle, Pencil } from 'lucide-react'
import { format, isPast, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'
import Barcode, { formatCardNumber } from './ui/Barcode'

export default function CardDisplayModal({
  isOpen,
  onClose,
  supermarket,
  cardData,
  onEdit
}) {
  if (!isOpen || !supermarket || !cardData) return null

  const hasPoints = cardData.hasLoyaltyProgram && cardData.points != null
  const hasExpiry = cardData.pointsExpiry
  const isExpired = hasExpiry && isPast(new Date(cardData.pointsExpiry))
  const daysUntilExpiry = hasExpiry && !isExpired
    ? differenceInDays(new Date(cardData.pointsExpiry), new Date())
    : null
  const expiringsoon = daysUntilExpiry !== null && daysUntilExpiry <= 30

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Header con colore supermercato */}
          <div
            className="p-6 text-center text-white"
            style={{ backgroundColor: supermarket.color }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold">{supermarket.name}</h2>
            {cardData.cardName && (
              <p className="text-white/80 mt-1">{cardData.cardName}</p>
            )}
          </div>

          {/* Codice tessera */}
          <div className="p-6 bg-snow">
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-cloud text-center">
              <p className="text-xs text-slate mb-2 uppercase tracking-wider">
                Mostra alla cassa
              </p>
              <p className="text-3xl font-mono font-bold text-night tracking-widest">
                {formatCardNumber(cardData.cardNumber)}
              </p>
            </div>

            {/* Barcode (decorativo, generato dal numero) */}
            <div className="mt-4">
              <Barcode number={cardData.cardNumber} height={64} />
            </div>
          </div>

          {/* Sezione punti */}
          {cardData.hasLoyaltyProgram && (
            <div className="p-4 border-t border-cloud">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-ocean" />
                  <span className="font-medium text-night">Punti</span>
                </div>
                <span className="text-2xl font-bold text-ocean">
                  {hasPoints ? cardData.points.toLocaleString('it-IT') : '—'}
                </span>
              </div>

              {/* Scadenza */}
              {hasExpiry && (
                <div className={`flex items-center gap-2 mt-2 text-sm ${
                  isExpired
                    ? 'text-rose-600'
                    : expiringsoon
                      ? 'text-amber-600'
                      : 'text-slate'
                }`}>
                  {(isExpired || expiringsoon) && (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isExpired
                      ? 'Punti scaduti il '
                      : expiringsoon
                        ? `Scadono tra ${daysUntilExpiry} giorni - `
                        : 'Scadenza: '
                    }
                    {format(new Date(cardData.pointsExpiry), 'd MMMM yyyy', { locale: it })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pulsanti */}
          <div className="p-4 border-t border-cloud flex gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose()
                  onEdit()
                }}
                className="flex-1 py-3 bg-cloud text-night font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Modifica
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-ocean text-white font-medium rounded-xl hover:bg-deep transition-colors"
            >
              Chiudi
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
