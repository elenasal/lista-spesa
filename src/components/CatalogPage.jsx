import { useState, useMemo, useEffect } from 'react'
import { Store, Sparkle, Heart, Plus } from 'lucide-react'
import { PRODUCTS_DATABASE, getLowestPrice } from '../data/productsDatabase'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { SUPERMARKETS } from '../data/supermarkets'
import CatalogProductCard from './CatalogProductCard'
import SelectDropdown from './ui/SelectDropdown'
import AssistantSheet from './AssistantSheet'
import LocationSearchInput from './ui/LocationSearchInput'
import ProductSearchPanel from './ProductSearchPanel'
import BottomSheet from './ui/BottomSheet'

export default function CatalogPage({ onAddToList = null, openDiscover = false, onDiscoverConsumed = null }) {
  const { favorites, isFavorite, toggleFavorite } = useFavoriteProducts()

  // Stato "dove" (contesto) posseduto dal catalogo: la ricerca prodotto vive
  // nel pannello condiviso (ProductSearchPanel), ora dentro la sheet "Scopri prodotti".
  // Qui restano il supermercato di contesto e le relative opzioni.
  const [supermarketId, setSupermarketId] = useState(null)
  // Sheet "Aggiungi prodotti" (aperta dal FAB +): ricerca/filtri/catalogo + assistente.
  // Parte già aperta se si arriva dal bottone "Aggiungi altri preferiti" della lista.
  const [showDiscover, setShowDiscover] = useState(openDiscover)
  // Assistente guidato (feature 7). Il seed segue la ricerca del pannello via onQueryChange.
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantSeed, setAssistantSeed] = useState('')

  // Consuma il flag di apertura automatica al mount, così tornando al tab
  // Prodotti dalla tab bar la sheet resta chiusa.
  useEffect(() => {
    if (openDiscover) onDiscoverConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Opzioni supermercato: TUTTI i punti vendita della zona con almeno un prodotto
  // a catalogo (non solo i preferiti), ordinati per distanza.
  const supermarketOptions = useMemo(() => {
    const present = new Set()
    for (const p of PRODUCTS_DATABASE) {
      for (const id in p.prices) present.add(id)
    }
    return SUPERMARKETS
      .filter((sm) => present.has(sm.id))
      .sort((a, b) => a.distance - b.distance)
      .map((sm) => ({ value: sm.id, label: sm.name, color: sm.color }))
  }, [])

  // Prodotti preferiti risolti verso il catalogo (per mostrarli come card).
  // Se un preferito non è a catalogo si costruisce un prodotto minimo (senza prezzo).
  const favoriteProducts = useMemo(() => {
    return favorites.map((fav) => {
      const norm = fav.name.toLowerCase().trim()
      const match =
        PRODUCTS_DATABASE.find((p) => p.name.toLowerCase().trim() === norm) ||
        PRODUCTS_DATABASE.find(
          (p) => p.name.toLowerCase().includes(norm) || norm.includes(p.name.toLowerCase())
        )
      return match || { id: fav.id, name: fav.name, category: fav.category || 'altro', prices: {} }
    })
  }, [favorites])

  const handleToggleFavorite = (product) =>
    toggleFavorite({
      name: product.name,
      category: product.category,
      price: getLowestPrice(product)?.price ?? null,
    })

  return (
    <div className="pt-20 pb-24">
      {/* Vista di default: SOLO "I miei preferiti", espansa (nessun collasso). */}
      <div className="flex items-center gap-2 px-1 mb-3">
        <Heart className="w-4 h-4 text-rose-500 fill-current flex-shrink-0" />
        <h2 className="text-lg font-semibold text-night">I miei preferiti</h2>
        {favoriteProducts.length > 0 && (
          <span className="text-sm text-slate-light">({favoriteProducts.length})</span>
        )}
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {favoriteProducts.map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              isFavorite
              onToggleFavorite={() => handleToggleFavorite(product)}
              onAddToList={onAddToList ? () => onAddToList(product) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-sky-light/50 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-ocean" />
          </div>
          <h3 className="text-lg font-semibold text-night mb-1">Nessun preferito</h3>
          <p className="text-sm text-slate max-w-xs mb-4">
            Salva qui i prodotti che compri più spesso. Premi il{' '}
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-sky to-ocean text-white align-middle">
              <Plus className="w-3.5 h-3.5" />
            </span>{' '}
            per scoprire prodotti e aggiungerli ai preferiti.
          </p>
        </div>
      )}

      {/* FAB "+" — apre la sheet "Scopri prodotti". Stile identico al FAB di AddListSheet. */}
      <button
        onClick={() => setShowDiscover(true)}
        aria-label="Aggiungi prodotti"
        title="Aggiungi prodotti"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-ocean text-white shadow-soft-lg hover:brightness-105 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Sheet "Scopri prodotti": assistente in alto + ricerca/filtri/catalogo sotto. */}
      <BottomSheet isOpen={showDiscover} onClose={() => setShowDiscover(false)} fullHeight>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-lg font-bold text-night mb-3">Aggiungi prodotti</h3>

          {/* Ingresso assistente guidato */}
          <button
            onClick={() => setShowAssistant(true)}
            className="w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-2xl bg-gradient-to-br from-violet-500 to-ocean text-white shadow-soft hover:brightness-105 active:scale-[0.99] transition-all text-left"
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/20 flex-shrink-0">
              <Sparkle className="w-5 h-5 fill-current" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold">Fatti guidare dall'assistente</span>
              <span className="block text-xs text-white/80">Poche domande e ti suggerisce i prodotti giusti</span>
            </span>
          </button>

          {/* Divider tra il CTA assistente e la ricerca — come nell'onboarding */}
          <div className="flex items-center gap-3 text-xs text-slate-light my-3">
            <div className="flex-1 h-px bg-cloud" />
            oppure cerca manualmente
            <div className="flex-1 h-px bg-cloud" />
          </div>

          {/* Ricerca prodotti + filtri + catalogo (da qui si aggiunge ai preferiti) */}
          <ProductSearchPanel
            supermarketId={supermarketId}
            showZoneAverage
            contextHasFilter={!!supermarketId}
            onResetContext={() => setSupermarketId(null)}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onAddToList={onAddToList}
            onQueryChange={setAssistantSeed}
            contextSlot={
              /* Riga contesto (secondaria): dove cerco — zona + supermercato opzionale. */
              <div className="grid grid-cols-2 gap-2">
                <LocationSearchInput placeholder="Zona..." />

                <SelectDropdown
                  value={supermarketId}
                  onChange={setSupermarketId}
                  options={supermarketOptions}
                  allLabel="Tutti i supermercati"
                  placeholder="Supermercato"
                  icon={<Store className="w-4 h-4" />}
                />
              </div>
            }
          />
        </div>
      </BottomSheet>

      {/* Assistente IA guidato (feature 7) — vive dentro la sheet "+", z-[70] > sheet */}
      <AssistantSheet
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        seedQuery={assistantSeed}
        onAddToList={onAddToList}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
}
