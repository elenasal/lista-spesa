import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, PackageOpen, LayoutGrid, Store, Tag, MapPin, Locate, Sparkle, Heart, ChevronDown } from 'lucide-react'
import { PRODUCTS_DATABASE, getLowestPrice, getBrand, getAllBrands } from '../data/productsDatabase'
import { CATEGORY_ORDER, getCategoryName } from '../data/categories'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { SUPERMARKETS } from '../data/supermarkets'
import CatalogProductCard from './CatalogProductCard'
import SelectDropdown from './ui/SelectDropdown'

export default function CatalogPage() {
  const { favorites, isFavorite, toggleFavorite } = useFavoriteProducts()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [supermarketId, setSupermarketId] = useState(null)
  const [brand, setBrand] = useState(null)
  // Sezione "I miei preferiti" espandibile/collassabile (parte collassata)
  const [showFavorites, setShowFavorites] = useState(false)
  // Zona (mockup Novara). Dà contesto al filtro supermercato: i punti vendita
  // elencati sono quelli "in questa zona". Da collegare alla geolocalizzazione reale.
  const [zone, setZone] = useState('Novara, Italia')
  // Modalità ricerca intelligente (feature 7): qui c'è solo il toggle del simbolo;
  // la logica IA la aggancerà il dev.
  const [aiSearch, setAiSearch] = useState(false)

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

  // Opzioni categoria per la dropdown: solo quelle presenti a catalogo
  const categoryOptions = useMemo(() => {
    const present = new Set(PRODUCTS_DATABASE.map((p) => p.category))
    return CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({
      value: c,
      label: getCategoryName(c),
    }))
  }, [])

  // Opzioni brand per la dropdown
  const brandOptions = useMemo(
    () => getAllBrands().map((b) => ({ value: b, label: b })),
    []
  )

  // Prodotti filtrati — filtri cumulativi (AND): parola chiave, categoria, supermercato, brand
  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    return PRODUCTS_DATABASE.filter(p => {
      if (category && p.category !== category) return false
      if (supermarketId && !p.prices[supermarketId]) return false
      if (brand && getBrand(p) !== brand) return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, category, supermarketId, brand])

  const hasFilters = !!query || !!category || !!supermarketId || !!brand

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

  return (
    <div className="pt-10 pb-24">
      {/* Ricerca prodotto — azione principale, in cima a tutta larghezza.
          A destra il toggle "ricerca intelligente" (feature 7, logica IA lato dev). */}
      <div className={`flex items-center gap-2.5 px-3 py-3 bg-white border rounded-xl transition-colors ${
        aiSearch
          ? 'border-violet-400 ring-2 ring-violet-200'
          : 'border-cloud focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20'
      }`}>
        <Search className={`w-5 h-5 flex-shrink-0 ${aiSearch ? 'text-violet-500' : 'text-slate'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={aiSearch ? 'Descrivi cosa cerchi…' : 'Cerca un prodotto...'}
          className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-0.5 text-slate hover:text-night rounded-full hover:bg-cloud transition-all flex-shrink-0"
            aria-label="Cancella ricerca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="w-px h-5 bg-cloud flex-shrink-0" />
        <button
          onClick={() => setAiSearch((v) => !v)}
          aria-pressed={aiSearch}
          title={aiSearch ? 'Ricerca intelligente attiva' : 'Attiva la ricerca intelligente'}
          aria-label={aiSearch ? 'Disattiva ricerca intelligente' : 'Attiva ricerca intelligente'}
          className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
            aiSearch
              ? 'bg-violet-100 text-violet-600'
              : 'text-slate-light hover:text-violet-500 hover:bg-violet-50'
          }`}
        >
          <Sparkle className={`w-5 h-5 transition-all ${aiSearch ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Filtri cumulativi (AND) su due righe:
          riga 1 → zona + supermercato (il "dove") · riga 2 → categoria + brand */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Zona (mockup Novara): dà contesto al filtro supermercato */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border border-cloud rounded-xl focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors">
          <MapPin className="w-4 h-4 text-ocean flex-shrink-0" />
          <input
            type="text"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Zona..."
            className="flex-1 min-w-0 bg-transparent text-sm text-night placeholder:text-slate-light focus:outline-none"
          />
          <button
            className="p-0.5 text-ocean hover:bg-sky-light rounded-full transition-all flex-shrink-0"
            title="Usa la mia posizione"
            aria-label="Usa la mia posizione"
          >
            <Locate className="w-4 h-4" />
          </button>
        </div>

        <SelectDropdown
          value={supermarketId}
          onChange={setSupermarketId}
          options={supermarketOptions}
          allLabel="Tutti i supermercati"
          placeholder="Supermercato"
          icon={<Store className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <SelectDropdown
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          allLabel="Tutte le categorie"
          placeholder="Categoria"
          icon={<LayoutGrid className="w-4 h-4" />}
        />
        <SelectDropdown
          value={brand}
          onChange={setBrand}
          options={brandOptions}
          allLabel="Tutti i brand"
          placeholder="Brand"
          icon={<Tag className="w-4 h-4" />}
        />
      </div>

      {/* Sezione "I miei preferiti" — espandibile/collassabile */}
      <div className="mt-5 bg-rose-50/60 border border-rose-100 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFavorites((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
          aria-expanded={showFavorites}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-current flex-shrink-0" />
          <span className="font-semibold text-night">I miei preferiti</span>
          <span className="text-sm text-slate-light">({favoriteProducts.length})</span>
          <ChevronDown
            className={`w-5 h-5 text-slate ml-auto flex-shrink-0 transition-transform ${showFavorites ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {showFavorites && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3">
                {favoriteProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {favoriteProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        isFavorite
                        onToggleFavorite={() =>
                          toggleFavorite({
                            name: product.name,
                            category: product.category,
                            price: getLowestPrice(product)?.price ?? null,
                          })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate text-center py-4">
                    Nessun preferito. Tocca il <Heart className="inline w-3.5 h-3.5 text-rose-400 -mt-0.5" /> sui prodotti per aggiungerli qui.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conteggio risultati */}
      <p className="text-sm text-slate mt-4 mb-3 px-1">
        <span className="font-medium text-night">{results.length}</span> prodott{results.length === 1 ? 'o' : 'i'}
        {hasFilters && (
          <button onClick={() => { setQuery(''); setCategory(null); setSupermarketId(null); setBrand(null) }} className="ml-2 text-ocean hover:text-deep font-medium">
            Azzera filtri
          </button>
        )}
      </p>

      {/* Griglia prodotti */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {results.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                supermarketId={supermarketId}
                isFavorite={isFavorite(product.name)}
                onToggleFavorite={() =>
                  toggleFavorite({
                    name: product.name,
                    category: product.category,
                    price: getLowestPrice(product)?.price ?? null,
                  })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-sky-light/50 flex items-center justify-center mb-4">
            <PackageOpen className="w-8 h-8 text-ocean" />
          </div>
          <h3 className="text-lg font-semibold text-night mb-1">Nessun prodotto trovato</h3>
          <p className="text-sm text-slate max-w-xs">Prova a modificare i filtri o la ricerca.</p>
        </div>
      )}
    </div>
  )
}
