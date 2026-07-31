import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, ScanBarcode, Gift, ListPlus, Navigation } from 'lucide-react'
import { getSupermarketById, getOpenStatus } from '../../data/supermarkets'
import Barcode, { formatCardNumber } from '../ui/Barcode'
import DropdownMenu from '../ui/DropdownMenu'

/**
 * Card ricca di un supermercato preferito: mini-header (nome + stato aperto/chiuso),
 * riquadro tessera/barcode (o CTA "Aggiungi tessera"), indicazioni Google Maps e
 * menu "Crea lista"/"Rimuovi".
 *
 * Lo stato tessera/preferiti è mock e vive nel genitore (un'unica istanza di
 * useLoyaltyCards/useFavoriteSupermarkets): getCard/hasCard arrivano via props così
 * la card si aggiorna quando il genitore salva/rimuove una tessera.
 *
 * Props:
 * - supermarketId: string
 * - getCard(id) -> cardData | null
 * - hasCard(id) -> boolean
 * - onCreateList(supermarket)
 * - onShowCard(supermarket)   apre il modale di visualizzazione tessera
 * - onEditCard(supermarket)   apre il modale di modifica/aggiunta tessera
 * - onRemove(supermarketId)   toglie dai preferiti
 */
// forwardRef: dentro AnimatePresence framer-motion passa un ref per animare l'uscita
// della card (stesso pattern di ListCard in ListsOverview).
const FavoriteSupermarketCard = forwardRef(function FavoriteSupermarketCard({
  supermarketId,
  getCard,
  hasCard,
  onCreateList,
  onShowCard,
  onEditCard,
  onRemove,
}, ref) {
  const supermarket = getSupermarketById(supermarketId)
  if (!supermarket) return null

  const card = getCard(supermarket.id)
  const hasCardSaved = hasCard(supermarket.id)
  const status = getOpenStatus(supermarket)

  const actions = [
    {
      icon: <ListPlus className="w-4 h-4" />,
      label: 'Crea lista',
      onClick: () => onCreateList(supermarket),
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Rimuovi',
      danger: true,
      onClick: () => onRemove(supermarket.id),
    },
  ]

  const handleTap = () => {
    if (hasCardSaved) {
      onShowCard(supermarket)
    } else {
      onEditCard(supermarket)
    }
  }

  // Indicazioni stradali: Google Maps verso l'indirizzo del punto vendita
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${supermarket.name} ${supermarket.address}, ${supermarket.city}`
  )}`
  const handleDirections = (e) => {
    e.stopPropagation()
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <div
        onClick={handleTap}
        className="p-3 bg-white rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
      >
        {/* Mini header a tutta larghezza: nome (troncato) + stato, una riga */}
        <div className="flex items-center gap-x-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: supermarket.color }}
          />
          <p className="font-semibold text-night truncate flex-1 min-w-0">{supermarket.name}</p>
          {status && (
            <span className="flex items-center gap-1.5 text-xs italic flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 not-italic ${status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={`font-semibold ${status.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                {status.isOpen ? 'Aperto' : 'Chiuso'}
              </span>
              <span className="text-slate">· {status.detail}</span>
            </span>
          )}
        </div>

        {/* Riga inferiore: barcode (o CTA) a sinistra, azioni a destra */}
        <div className="flex items-stretch gap-3 mt-2 pt-2 border-t border-cloud">
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center bg-[#e7eff7] rounded-lg px-3 py-2">
            {hasCardSaved ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ScanBarcode className="w-3 h-3 text-slate" />
                  <span className="text-[10px] font-semibold text-slate uppercase tracking-wider">
                    {card.cardName || 'Tessera'}
                  </span>
                  {card.hasLoyaltyProgram && card.points && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600">
                      <Gift className="w-2.5 h-2.5" />
                      {card.points.toLocaleString('it-IT')} pt
                    </span>
                  )}
                </div>
                <Barcode number={card.cardNumber} height={36} className="max-w-full overflow-hidden" />
                <p className="mt-1 font-mono text-xs tracking-widest text-slate">
                  {formatCardNumber(card.cardNumber)}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-0.5 text-slate">
                <Plus className="w-7 h-7 text-sky" strokeWidth={2.5} />
                <span className="text-xs">Aggiungi tessera</span>
              </div>
            )}
          </div>

          {/* Azioni a destra separate da divisoria verticale */}
          <div
            className="flex flex-col items-center justify-center gap-1 pl-3 border-l border-cloud flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDirections}
              aria-label={`Indicazioni per ${supermarket.name}`}
              title="Indicazioni stradali"
              className="w-9 h-9 flex items-center justify-center text-ocean hover:bg-sky-light/40 rounded-lg transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <DropdownMenu actions={actions} />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

export default FavoriteSupermarketCard
