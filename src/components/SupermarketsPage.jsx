import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Store, Check, MapPin, Search, X, Locate, ScanBarcode, Gift } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useLoyaltyCards } from '../hooks/useLoyaltyCards'
import { formatDistance } from '../data/supermarkets'
import LoyaltyCardModal from './LoyaltyCardModal'
import CardDisplayModal from './CardDisplayModal'

export default function SupermarketsPage() {
  const { supermarketsWithFavorites, toggleFavorite, hasFavorites } = useFavoriteSupermarkets()
  const { getCard, saveCard, removeCard, hasCard } = useLoyaltyCards()
  const [searchValue, setSearchValue] = useState('Novara, Italia')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Modal tessera
  const [editingCard, setEditingCard] = useState(null) // supermercato per cui editare tessera
  const [displayingCard, setDisplayingCard] = useState(null) // supermercato per cui mostrare tessera

  return (
    <div className="pt-10 pb-6">
      {/* Barra di ricerca stile Google Maps */}
      <div className="mb-6">
        <div
          className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-soft transition-all ${
            isSearchFocused ? 'ring-2 ring-sky shadow-md' : ''
          }`}
        >
          <Search className="w-5 h-5 text-slate flex-shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Cerca una posizione..."
            className="flex-1 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="p-1 text-slate hover:text-night rounded-full hover:bg-cloud transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="w-px h-6 bg-cloud" />
          <button
            className="p-1.5 text-ocean hover:bg-sky-light rounded-full transition-all"
            title="Usa la mia posizione"
          >
            <Locate className="w-5 h-5" />
          </button>
        </div>

        {/* Risultato posizione */}
        <div className="flex items-center gap-2 mt-3 px-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-night font-medium">Novara, Piemonte</span>
          <span className="text-xs text-slate">· Posizione attuale</span>
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
          {supermarketsWithFavorites.map((supermarket) => (
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
                    {/* Badge distanza */}
                    <span className="px-2 py-0.5 bg-sky-light text-ocean text-xs font-medium rounded-full">
                      {formatDistance(supermarket.distance)}
                    </span>
                  </div>
                  {/* Indirizzo */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate flex-shrink-0" />
                    <p className="text-sm text-slate truncate">
                      {supermarket.address}, {supermarket.city}
                    </p>
                  </div>
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
          ))}
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
