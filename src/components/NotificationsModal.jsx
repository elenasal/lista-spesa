import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Tag, Store, Check, CheckCheck } from 'lucide-react'
import { getSupermarketById } from '../data/supermarkets'

/**
 * Pannello notifiche offerte (MOCKUP)
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - offers: array (da useOffers)
 * - onMarkAllRead: () => void
 */
export default function NotificationsModal({ isOpen, onClose, offers = [], onMarkRead, onMarkAllRead }) {
  if (!isOpen) return null

  const formatPrice = (v) => `${v.toFixed(2).replace('.', ',')} €`
  const unreadCount = offers.filter((o) => !o.read).length

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-cloud flex items-center gap-3 bg-sky-light/40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-ocean">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-night">Offerte per te</h2>
              <p className="text-sm text-slate">Prodotti delle tue liste in promozione</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate hover:text-night hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar azioni (stile Gmail) - subito sotto l'header, prima della lista */}
          {offers.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-cloud">
              <span className="text-sm text-slate">
                {unreadCount > 0 ? (
                  <><span className="font-semibold text-night">{unreadCount}</span> non lette</>
                ) : (
                  'Tutte lette'
                )}
              </span>
              <button
                onClick={onMarkAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-ocean rounded-lg hover:bg-sky-light/40 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <CheckCheck className="w-4 h-4" />
                Segna tutte come lette
              </button>
            </div>
          )}

          {/* Lista offerte */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {offers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="w-10 h-10 text-slate-light mx-auto mb-3" />
                <p className="text-slate font-medium">Nessuna offerta al momento</p>
                <p className="text-sm text-slate-light mt-1">
                  Ti avviseremo quando un prodotto delle tue liste va in offerta.
                </p>
              </div>
            ) : (
              offers.map((offer) => {
                const supermarket = getSupermarketById(offer.supermarketId)
                return (
                  <button
                    key={offer.id}
                    onClick={() => onMarkRead?.(offer.id)}
                    className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-colors ${
                      offer.read
                        ? 'bg-white border-cloud'
                        : 'bg-sky-light/20 border-sky-light hover:bg-sky-light/30'
                    }`}
                  >
                    {/* Icona supermercato */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: supermarket?.color || '#0EA5E9' }}
                    >
                      <Store className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Frase notifica */}
                      <p className={`text-sm leading-snug ${offer.read ? 'text-slate' : 'text-night'}`}>
                        <span className="font-semibold">{offer.productName}</span>
                        {' in offerta da '}
                        <span className="font-semibold" style={{ color: supermarket?.color }}>
                          {supermarket?.name || 'Supermercato'}
                        </span>
                      </p>

                      {/* Prezzo + sconto */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-sm font-bold text-emerald-600">
                          {formatPrice(offer.newPrice)}
                        </span>
                        <span className="text-xs text-slate-light line-through">
                          {formatPrice(offer.oldPrice)}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                          <Tag className="w-3 h-3" />
                          -{offer.discountPercent}%
                        </span>
                      </div>

                      {/* Data + stato letto/non letto */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-xs text-slate-light">{offer.dateLabel}</span>
                        {offer.read ? (
                          <span className="flex items-center gap-1 text-xs text-slate-light flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            Letta
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-ocean flex-shrink-0">
                            <span className="w-2 h-2 bg-ocean rounded-full" />
                            Non letta
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
