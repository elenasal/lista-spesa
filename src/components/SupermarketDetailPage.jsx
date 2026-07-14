import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Navigation, Clock, Tag, FileText, Store, ChevronRight } from 'lucide-react'
import {
  getOpenStatus,
  formatDayHours,
  getDirectionsUrl,
  DAY_NAMES,
  WEEK_ORDER,
} from '../data/supermarkets'
import { MOCK_OFFERS, getDiscountPercent } from '../data/offers'
import { getFlyersForSupermarket } from '../data/flyers'
import { getProductIcon } from '../data/productIcons'
import FlyerViewerModal from './FlyerViewerModal'

/**
 * Pagina dettaglio di un supermercato.
 * Stato apertura, orari completi, telefono, indicazioni, offerte attive e
 * volantino segnaposto (mockup).
 *
 * Props:
 * - supermarket: oggetto da SUPERMARKETS
 */
export default function SupermarketDetailPage({ supermarket }) {
  const [openFlyer, setOpenFlyer] = useState(null)

  if (!supermarket) return null

  const now = new Date()
  const today = now.getDay()
  const status = getOpenStatus(supermarket, now)
  const formatPrice = (v) => `${v.toFixed(2).replace('.', ',')} €`

  // Offerte attive di questo supermercato (dal database prezzi)
  const offers = MOCK_OFFERS.filter(o => o.supermarketId === supermarket.id)

  // Volantini finti (mockup)
  const flyers = getFlyersForSupermarket(supermarket)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-8 pb-6 space-y-5"
    >
      {/* Intestazione negozio */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft"
          style={{ backgroundColor: supermarket.color }}
        >
          <Store className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-night truncate">{supermarket.name}</h2>
          <p className="text-sm text-slate truncate">
            {supermarket.address}, {supermarket.city}
          </p>
        </div>
      </div>

      {/* Stato apertura */}
      {status && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${
              status.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {status.isOpen ? 'Aperto' : 'Chiuso'}
          </span>
          <span className="text-sm text-slate">· {status.detail}</span>
        </div>
      )}

      {/* Azioni rapide */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${supermarket.phone?.replace(/\s/g, '')}`}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-sky-light/40 text-ocean rounded-xl font-medium hover:bg-sky-light/60 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Chiama
        </a>
        <a
          href={getDirectionsUrl(supermarket)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-3 bg-sky-light/40 text-ocean rounded-xl font-medium hover:bg-sky-light/60 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Indicazioni
        </a>
      </div>

      {/* Orari */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-slate" />
          <h3 className="text-sm font-semibold text-night">Orari di apertura</h3>
        </div>
        <div className="rounded-xl border border-cloud bg-white overflow-hidden">
          {WEEK_ORDER.map((d) => {
            const isToday = d === today
            const label = formatDayHours(supermarket.hours?.[d])
            return (
              <div
                key={d}
                className={`flex items-center justify-between px-3 py-2.5 text-sm border-b border-cloud/60 last:border-0 ${
                  isToday ? 'bg-sky-light/30' : ''
                }`}
              >
                <span className={isToday ? 'font-semibold text-night' : 'text-slate'}>
                  {DAY_NAMES[d]}
                  {isToday && <span className="ml-1.5 text-xs text-ocean">· oggi</span>}
                </span>
                <span className={`${isToday ? 'font-medium text-night' : 'text-slate'} ${
                  label === 'Chiuso' ? 'text-slate-light' : ''
                }`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Offerte attive */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-4 h-4 text-slate" />
          <h3 className="text-sm font-semibold text-night">
            Offerte attive
            {offers.length > 0 && <span className="text-slate-light font-normal"> · {offers.length}</span>}
          </h3>
        </div>
        {offers.length === 0 ? (
          <p className="text-sm text-slate-light px-1">Nessuna offerta attiva al momento.</p>
        ) : (
          <div className="space-y-1.5">
            {offers.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-cloud rounded-xl"
              >
                <span className="flex-1 min-w-0 text-sm text-night truncate">{o.productName}</span>
                <span className="text-sm font-bold text-emerald-600">{formatPrice(o.newPrice)}</span>
                <span className="text-xs text-slate-light line-through">{formatPrice(o.oldPrice)}</span>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                  -{getDiscountPercent(o.oldPrice, o.newPrice)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volantini (mockup) - in fondo */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate" />
          <h3 className="text-sm font-semibold text-night">
            Volantini
            {flyers.length > 0 && <span className="text-slate-light font-normal"> · {flyers.length}</span>}
          </h3>
        </div>
        {flyers.length === 0 ? (
          <p className="text-sm text-slate-light px-1">Nessun volantino attivo.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {flyers.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOpenFlyer(f)}
                className="flex-shrink-0 w-40 rounded-xl overflow-hidden border border-cloud bg-white text-left hover:shadow-md transition-shadow"
              >
                <div className="p-2.5 text-white" style={{ backgroundColor: f.accent }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90">Volantino</p>
                  <p className="text-sm font-bold leading-tight">{f.title}</p>
                </div>
                <div className="p-2.5">
                  <div className="flex gap-1 text-2xl mb-2">
                    {f.items.slice(0, 4).map((it, i) => (
                      <span key={i}>{getProductIcon(it.name, it.category)}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate">{f.period}</p>
                  <p className="mt-1 text-xs font-medium text-ocean flex items-center gap-0.5">
                    Sfoglia <ChevronRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <FlyerViewerModal
        isOpen={!!openFlyer}
        onClose={() => setOpenFlyer(null)}
        flyer={openFlyer}
      />
    </motion.div>
  )
}
