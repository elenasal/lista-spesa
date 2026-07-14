import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Tag, Store, Check, CheckCheck, Plus, ShoppingCart } from 'lucide-react'
import { getSupermarketById } from '../data/supermarkets'
import { getUserById } from '../data/users'

/**
 * Feed notifiche unico e cronologico (MOCKUP): offerte + attività delle liste
 * condivise (un utente ha aggiunto o comprato un prodotto).
 *
 * Props:
 * - isOpen, onClose
 * - items: array (da useNotifications)
 * - onMarkRead, onMarkAllRead
 */
export default function NotificationsModal({ isOpen, onClose, items = [], onMarkRead, onMarkAllRead }) {
  if (!isOpen) return null

  const formatPrice = (v) => `${v.toFixed(2).replace('.', ',')} €`
  const unreadCount = items.filter((i) => !i.read).length

  // Riga OFFERTA
  const renderOffer = (item) => {
    const o = item.offer
    const supermarket = getSupermarketById(o.supermarketId)
    return (
      <div className="flex gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: supermarket?.color || '#0EA5E9' }}
        >
          <Store className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${item.read ? 'text-slate' : 'text-night'}`}>
            <span className="font-semibold">{o.productName}</span>
            {' in offerta da '}
            <span className="font-semibold" style={{ color: supermarket?.color }}>
              {supermarket?.name || 'Supermercato'}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm font-bold text-emerald-600">{formatPrice(o.newPrice)}</span>
            <span className="text-xs text-slate-light line-through">{formatPrice(o.oldPrice)}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
              <Tag className="w-3 h-3" />
              -{o.discountPercent}%
            </span>
          </div>
          {renderFooter(item)}
        </div>
      </div>
    )
  }

  // Riga ATTIVITÀ (aggiunto / comprato da un utente)
  const renderActivity = (item) => {
    const a = item.activity
    const user = getUserById(a.userId)
    const isCheck = item.type === 'item_checked'
    return (
      <div className="flex gap-3">
        {/* Avatar utente con badge tipo */}
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: (user?.color || '#94A3B8') + '33' }}
          >
            {user?.avatar || '🙂'}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
              isCheck ? 'bg-emerald-500' : 'bg-ocean'
            }`}
          >
            {isCheck ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : <Plus className="w-3 h-3 text-white" strokeWidth={3} />}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${item.read ? 'text-slate' : 'text-night'}`}>
            <span className="font-semibold">{user?.name || 'Qualcuno'}</span>
            {isCheck ? ' ha preso ' : ' ha aggiunto '}
            <span className="font-semibold">{a.productName}</span>
            {isCheck ? ' da ' : ' a '}
            <span className="inline-flex items-center gap-1 font-medium text-ocean">
              <ShoppingCart className="w-3 h-3" />
              {a.listName}
            </span>
          </p>
          {renderFooter(item)}
        </div>
      </div>
    )
  }

  // Data + stato letto/non letto (comune)
  const renderFooter = (item) => (
    <div className="flex items-center justify-between gap-2 mt-2">
      <span className="text-xs text-slate-light">{item.dateLabel}</span>
      {item.read ? (
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
  )

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
              <h2 className="font-semibold text-night">Notifiche</h2>
              <p className="text-sm text-slate">Offerte e attività delle tue liste</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate hover:text-night hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar azioni (stile Gmail) */}
          {items.length > 0 && (
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

          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="w-10 h-10 text-slate-light mx-auto mb-3" />
                <p className="text-slate font-medium">Nessuna notifica</p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onMarkRead?.(item.id)}
                  className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-colors ${
                    item.read
                      ? 'bg-white border-cloud'
                      : 'bg-sky-light/20 border-sky-light hover:bg-sky-light/30'
                  }`}
                >
                  {item.type === 'offer' ? renderOffer(item) : renderActivity(item)}
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
