import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Store, Check, MapPin, ScanBarcode, ChevronRight, Plus, ArrowLeft } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useLoyaltyCards } from '../hooks/useLoyaltyCards'
import { formatDistance, getOpenStatus, distanceKm } from '../data/supermarkets'
import { useLocationContext } from '../contexts/LocationContext'
import LocationSearchInput from './ui/LocationSearchInput'
import LoyaltyCardModal from './LoyaltyCardModal'
import CardDisplayModal from './CardDisplayModal'
import FavoriteSupermarketCard from './supermarkets/FavoriteSupermarketCard'
import SupermarketDetailPage from './SupermarketDetailPage'
import BottomSheet from './ui/BottomSheet'

export default function SupermarketsPage({ onCreateList }) {
  const { favorites, supermarketsWithFavorites, toggleFavorite, hasFavorites } = useFavoriteSupermarkets()
  const { getCard, saveCard, removeCard, hasCard } = useLoyaltyCards()
  const { label: searchValue, requestLocation, status: locStatus, coords } = useLocationContext()

  // Sheet "Trova supermercato" (aperta dal FAB +): ricerca per luogo + elenco/selezione.
  const [showFind, setShowFind] = useState(false)

  // Dettaglio di un singolo supermercato: modale impilata SOPRA "Trova supermercato".
  const [detailSupermarket, setDetailSupermarket] = useState(null)

  // "Crea lista" da una card preferito: crea "Lista <nome>" legata al supermercato e naviga
  const handleCreateListForFavorite = (supermarket) => {
    onCreateList?.(`Lista ${supermarket.name}`, supermarket.id)
  }

  // Ordina per distanza reale quando conosciamo la posizione
  const orderedSupermarkets = [...supermarketsWithFavorites].sort(
    (a, b) => distanceKm(a, coords) - distanceKm(b, coords)
  )

  // Modal tessera
  const [editingCard, setEditingCard] = useState(null) // supermercato per cui editare tessera
  const [displayingCard, setDisplayingCard] = useState(null) // supermercato per cui mostrare tessera

  return (
    <div className="pt-20 pb-24">
      {/* Vista di default: SOLO i supermercati preferiti (card ricche). */}
      {hasFavorites ? (
        <div>
          <div className="flex items-center gap-2 px-1 mb-3">
            <Store className="w-4 h-4 text-ocean flex-shrink-0" />
            <h2 className="text-lg font-semibold text-night">I miei supermercati</h2>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {favorites.map((supermarketId) => (
                <FavoriteSupermarketCard
                  key={supermarketId}
                  supermarketId={supermarketId}
                  getCard={getCard}
                  hasCard={hasCard}
                  onCreateList={handleCreateListForFavorite}
                  onShowCard={setDisplayingCard}
                  onEditCard={setEditingCard}
                  onRemove={toggleFavorite}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-sky-light/50 flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-ocean" />
          </div>
          <h3 className="text-lg font-semibold text-night mb-1">Nessun supermercato</h3>
          <p className="text-sm text-slate max-w-xs mb-4">
            Aggiungi i negozi dove fai la spesa per gestire tessere, indicazioni e liste. Premi il{' '}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-sky to-ocean text-white align-middle">
              <Plus className="w-3.5 h-3.5" />
            </span>{' '}
            per trovare un supermercato.
          </p>
        </div>
      )}

      {/* FAB "+" — apre la sheet "Trova supermercato". Stile identico al FAB di AddListSheet. */}
      <button
        onClick={() => setShowFind(true)}
        aria-label="Trova supermercato"
        title="Trova supermercato"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-ocean text-white shadow-soft-lg hover:brightness-105 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Sheet "Trova supermercato": ricerca per luogo + elenco con selezione preferiti.
          Lo stato preferiti/tessere è quello del componente → le selezioni fatte qui
          si riflettono subito nella vista di default. */}
      <BottomSheet isOpen={showFind} onClose={() => setShowFind(false)} fullHeight>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-lg font-bold text-night mb-3">Trova supermercato</h3>

          {/* Barra di ricerca posizione (autocomplete + GPS) */}
          <div className="mb-6">
            <LocationSearchInput placeholder="Cerca una posizione..." className="shadow-soft" />

            {/* Stato posizione */}
            <div className="flex items-center gap-2 mt-3 px-1">
              {locStatus === 'granted' ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-night font-medium">{searchValue || 'La mia posizione'}</span>
                  <span className="text-xs text-slate">· distanze reali</span>
                </>
              ) : locStatus === 'loading' ? (
                <>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate">Rilevamento posizione…</span>
                </>
              ) : (
                <button onClick={requestLocation} className="flex items-center gap-2 text-sm text-ocean hover:text-deep">
                  <div className="w-2 h-2 bg-slate-300 rounded-full" />
                  {locStatus === 'denied' ? 'Posizione negata · tocca per riprovare' : 'Usa la mia posizione per le distanze reali'}
                </button>
              )}
            </div>
          </div>

          {/* Titolo sezione */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-night">Supermercati vicino a te</h2>
            <p className="text-sm text-slate">
              {supermarketsWithFavorites.length} negozi trovati · Seleziona i tuoi preferiti
            </p>
          </div>

          {/* Lista supermercati */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {orderedSupermarkets.map((supermarket) => {
                const status = getOpenStatus(supermarket)
                return (
                <motion.div
                  key={supermarket.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div
                    onClick={() => toggleFavorite(supermarket.id)}
                    className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow-soft cursor-pointer transition-all ${
                      supermarket.isFavorite
                        ? 'ring-2 ring-sky'
                        : 'hover:shadow-md'
                    }`}
                  >
                    {/* Logo supermercato */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0"
                      style={{
                        backgroundColor: supermarket.isFavorite ? supermarket.color : supermarket.bgColor,
                      }}
                    >
                      <Store
                        className="w-6 h-6"
                        style={{
                          color: supermarket.isFavorite ? 'white' : supermarket.color,
                        }}
                      />
                    </div>

                    {/* Info supermercato */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-night">{supermarket.name}</h3>
                        {/* Badge distanza (reale se posizione nota) */}
                        <span className="px-2 py-0.5 bg-sky-light text-ocean text-xs font-medium rounded-full">
                          {formatDistance(distanceKm(supermarket, coords))}
                        </span>
                      </div>
                      {/* Indirizzo */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate flex-shrink-0" />
                        <p className="text-sm text-slate truncate">
                          {supermarket.address}, {supermarket.city}
                        </p>
                      </div>

                      {/* Riga stato apertura - tocca per il dettaglio */}
                      {status && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailSupermarket(supermarket)
                          }}
                          className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-left hover:opacity-80 transition-opacity"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={`font-semibold ${status.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {status.isOpen ? 'APERTO' : 'CHIUSO'}
                          </span>
                          <span className="text-slate">· {status.detail}</span>
                          <ChevronRight className="w-4 h-4 text-slate-light flex-shrink-0" />
                        </button>
                      )}

                      {supermarket.isFavorite && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-ocean">Selezionato</p>
                          {hasCard(supermarket.id) && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <ScanBarcode className="w-3 h-3" />
                              Tessera
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pulsanti azione */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Pulsante tessera - solo per preferiti */}
                      {supermarket.isFavorite && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (hasCard(supermarket.id)) {
                              setDisplayingCard(supermarket)
                            } else {
                              setEditingCard(supermarket)
                            }
                          }}
                          className={`p-2.5 rounded-full transition-all ${
                            hasCard(supermarket.id)
                              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                              : 'bg-cloud text-slate hover:bg-emerald-50 hover:text-emerald-500'
                          }`}
                          title={hasCard(supermarket.id) ? 'Mostra tessera' : 'Aggiungi tessera'}
                        >
                          <ScanBarcode className="w-5 h-5" />
                        </motion.button>
                      )}

                      {/* Cuore preferito */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={`p-2.5 rounded-full transition-all ${
                          supermarket.isFavorite
                            ? 'bg-pink-100 text-pink-500'
                            : 'bg-cloud text-slate hover:bg-pink-50 hover:text-pink-400'
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 transition-all ${
                            supermarket.isFavorite ? 'fill-current' : ''
                          }`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 p-4 rounded-xl ${
              hasFavorites ? 'bg-green-50 border border-green-200' : 'bg-sky-light border border-sky/30'
            }`}
          >
            {hasFavorites ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Tutto pronto!</p>
                  <p className="text-sm text-green-700">
                    Quando aggiungi un prodotto, vedrai i prezzi nei negozi selezionati.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-ocean">Seleziona almeno un supermercato</p>
                  <p className="text-sm text-slate">
                    Tocca il cuore per aggiungere i negozi dove fai la spesa.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </BottomSheet>

      {/* Dettaglio supermercato — modale impilata SOPRA "Trova supermercato" (z più alto).
          Il back/chiusura torna alla sheet di ricerca, che resta montata sotto. */}
      <BottomSheet
        isOpen={!!detailSupermarket}
        onClose={() => setDetailSupermarket(null)}
        fullHeight
        z="z-[70]"
      >
        {/* Header della modale: freccia indietro + nome supermercato */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 pb-3 border-b border-cloud">
          <button
            onClick={() => setDetailSupermarket(null)}
            aria-label="Torna a Trova supermercato"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-cloud/60 hover:bg-cloud rounded-xl text-night transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-lg text-night truncate">
            {detailSupermarket?.name}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <SupermarketDetailPage supermarket={detailSupermarket} />
        </div>
      </BottomSheet>

      {/* Modal modifica tessera */}
      <LoyaltyCardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        supermarket={editingCard}
        cardData={editingCard ? getCard(editingCard.id) : null}
        onSave={(data) => saveCard(editingCard.id, data)}
        onDelete={() => removeCard(editingCard.id)}
      />

      {/* Modal visualizza tessera */}
      <CardDisplayModal
        isOpen={!!displayingCard}
        onClose={() => setDisplayingCard(null)}
        supermarket={displayingCard}
        cardData={displayingCard ? getCard(displayingCard.id) : null}
        onEdit={() => {
          setEditingCard(displayingCard)
          setDisplayingCard(null)
        }}
      />
    </div>
  )
}
