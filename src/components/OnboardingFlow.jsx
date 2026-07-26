import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Locate, Search, X, Heart, Store, ShoppingCart,
  Check, ChevronRight, ListPlus, Sparkle, LayoutGrid, Tag,
} from 'lucide-react'
import { SUPERMARKETS, getSupermarketsByDistance, getSupermarketById, formatDistance } from '../data/supermarkets'
import { PRODUCTS_DATABASE, getLowestPrice, getBrand, getAllBrands } from '../data/productsDatabase'
import { CATEGORY_ORDER, getCategoryName } from '../data/categories'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import CatalogProductCard from './CatalogProductCard'
import SelectDropdown from './ui/SelectDropdown'

const TOTAL_STEPS = 4

const STEP_META = {
  1: { title: 'Dov’è la tua zona?', subtitle: 'Per suggerirti supermercati e prezzi vicino a te.' },
  2: { title: 'Scegli i tuoi supermercati', subtitle: 'Aggiungi quelli dove fai la spesa di solito.' },
  3: { title: 'Aggiungi 3 prodotti preferiti', subtitle: 'Sfoglia e tocca il cuore: ti serviranno per riempire le liste in un attimo.' },
  4: { title: 'Crea la tua prima lista', subtitle: 'Generica o legata a un supermercato specifico.' },
}

export default function OnboardingFlow({ onComplete, onCreateList }) {
  const [step, setStep] = useState(1)

  // Step 1 — zona (mock; salvata per uso futuro)
  const [zone, setZone] = useState('')

  // Step 2 — supermercati preferiti
  const { supermarketsWithFavorites, toggleFavorite: toggleFavSupermarket, favorites: favSupermarketIds } =
    useFavoriteSupermarkets()

  // Step 3 — prodotti preferiti (stessi filtri del catalogo, senza zona:
  // il supermercato è tra i preferiti scelti al passo 2)
  const { isFavorite, toggleFavorite: toggleFavProduct, favorites: favProducts } = useFavoriteProducts()
  const [productQuery, setProductQuery] = useState('')
  const [productCategory, setProductCategory] = useState(null)
  const [productBrand, setProductBrand] = useState(null)
  const [productSupermarketId, setProductSupermarketId] = useState(null)
  const [productAiSearch, setProductAiSearch] = useState(false)

  const productCategoryOptions = useMemo(() => {
    const present = new Set(PRODUCTS_DATABASE.map((p) => p.category))
    return CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({ value: c, label: getCategoryName(c) }))
  }, [])
  const productBrandOptions = useMemo(() => getAllBrands().map((b) => ({ value: b, label: b })), [])
  const productSupermarketOptions = useMemo(
    () =>
      favSupermarketIds
        .map(getSupermarketById)
        .filter(Boolean)
        .map((sm) => ({ value: sm.id, label: sm.name, color: sm.color })),
    [favSupermarketIds]
  )

  const productResults = useMemo(() => {
    const q = productQuery.toLowerCase().trim()
    return PRODUCTS_DATABASE.filter((p) => {
      if (productCategory && p.category !== productCategory) return false
      if (productSupermarketId && !p.prices[productSupermarketId]) return false
      if (productBrand && getBrand(p) !== productBrand) return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [productQuery, productCategory, productBrand, productSupermarketId])

  // Step 4 — prima lista
  const [listName, setListName] = useState('')
  const [listSupermarketId, setListSupermarketId] = useState(null)
  const supermarketOptions = useMemo(
    () =>
      getSupermarketsByDistance()
        .filter((sm) => favSupermarketIds.includes(sm.id))
        .map((sm) => ({ value: sm.id, label: sm.name, color: sm.color })),
    [favSupermarketIds]
  )

  const finish = (listId) => onComplete(listId)

  const goNext = () => {
    if (step === 1 && zone.trim()) {
      try { localStorage.setItem('lista-spesa-zone', zone.trim()) } catch { /* no-op */ }
    }
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else finish()
  }

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setZone('La mia posizione attuale'),
        () => { /* negata: l'utente cerca la zona a mano */ }
      )
    }
  }

  const handleCreateAndFinish = () => {
    const name = listName.trim() || 'La mia spesa'
    const newList = onCreateList(name, listSupermarketId || null)
    finish(newList?.id)
  }

  const meta = STEP_META[step]

  return (
    <div className="fixed inset-0 z-50 bg-white flex justify-center">
      <div className="w-full max-w-lg flex flex-col">
      {/* Header con avanzamento */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">
            Passo {step} di {TOTAL_STEPS}
          </span>
          <button
            onClick={() => finish()}
            className="text-sm text-slate-light hover:text-slate font-medium transition-colors"
          >
            Salta tutto
          </button>
        </div>
        {/* Barra avanzamento */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? 'bg-ocean' : 'bg-cloud'
              }`}
            />
          ))}
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-night">{meta.title}</h1>
          <p className="text-slate mt-1">{meta.subtitle}</p>
        </div>
      </div>

      {/* Contenuto step (scrollabile) */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <StepLocation
                zone={zone}
                setZone={setZone}
                onUseMyLocation={handleUseMyLocation}
              />
            )}
            {step === 2 && (
              <StepSupermarkets
                supermarkets={supermarketsWithFavorites}
                onToggle={toggleFavSupermarket}
                selectedCount={favSupermarketIds.length}
              />
            )}
            {step === 3 && (
              <StepProducts
                query={productQuery}
                setQuery={setProductQuery}
                aiSearch={productAiSearch}
                setAiSearch={setProductAiSearch}
                category={productCategory}
                setCategory={setProductCategory}
                brand={productBrand}
                setBrand={setProductBrand}
                supermarketId={productSupermarketId}
                setSupermarketId={setProductSupermarketId}
                categoryOptions={productCategoryOptions}
                brandOptions={productBrandOptions}
                supermarketOptions={productSupermarketOptions}
                results={productResults}
                isFavorite={isFavorite}
                onToggle={toggleFavProduct}
                selectedCount={favProducts.length}
              />
            )}
            {step === 4 && (
              <StepFirstList
                listName={listName}
                setListName={setListName}
                supermarketId={listSupermarketId}
                setSupermarketId={setListSupermarketId}
                supermarketOptions={supermarketOptions}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer azioni */}
      <div className="px-5 py-4 border-t border-cloud bg-white flex items-center gap-3">
        {step < TOTAL_STEPS ? (
          <>
            <button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-deep transition-colors"
            >
              Continua
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="px-4 py-3 text-slate hover:text-night font-medium transition-colors"
            >
              Salta
            </button>
          </>
        ) : (
          <button
            onClick={handleCreateAndFinish}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-deep transition-colors"
          >
            Crea lista e inizia
          </button>
        )}
      </div>
      </div>
    </div>
  )
}

// ---- Step 1: posizione ----
function StepLocation({ zone, setZone, onUseMyLocation }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 rounded-3xl bg-sky-light flex items-center justify-center mb-2">
          <MapPin className="w-10 h-10 text-ocean" />
        </div>
      </div>

      <button
        onClick={onUseMyLocation}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-light text-ocean font-semibold hover:bg-sky-light/70 transition-colors"
      >
        <Locate className="w-5 h-5" />
        Usa la mia posizione
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-light">
        <div className="flex-1 h-px bg-cloud" />
        oppure cerca la zona
        <div className="flex-1 h-px bg-cloud" />
      </div>

      <div className="flex items-center gap-2.5 px-3 py-3 bg-white border border-cloud rounded-xl focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors">
        <Search className="w-5 h-5 text-slate flex-shrink-0" />
        <input
          type="text"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          placeholder="Es. Novara, Italia"
          className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
        />
        {zone && (
          <button onClick={() => setZone('')} className="text-slate hover:text-night" aria-label="Cancella">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-light text-center px-4">
        Puoi saltare questo passo: potrai impostare la zona in seguito.
      </p>
    </div>
  )
}

// ---- Step 2: supermercati ----
function StepSupermarkets({ supermarkets, onToggle, selectedCount }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate">
        Selezionati: <span className="font-semibold text-ocean">{selectedCount}</span>
      </p>
      {supermarkets.map((sm) => (
        <button
          key={sm.id}
          onClick={() => onToggle(sm.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
            sm.isFavorite ? 'border-sky bg-sky-light/30' : 'border-cloud bg-white hover:border-sky/50'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sm.color }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-night truncate">{sm.name}</p>
            <p className="text-xs text-slate truncate">{sm.address} · {formatDistance(sm.distance)}</p>
          </div>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              sm.isFavorite ? 'bg-pink-100 text-pink-500' : 'bg-cloud text-slate'
            }`}
          >
            <Heart className={`w-5 h-5 ${sm.isFavorite ? 'fill-current' : ''}`} />
          </div>
        </button>
      ))}
    </div>
  )
}

// ---- Step 3: prodotti (stessi filtri del catalogo, senza zona) ----
function StepProducts({
  query, setQuery, aiSearch, setAiSearch, category, setCategory, brand, setBrand, supermarketId, setSupermarketId,
  categoryOptions, brandOptions, supermarketOptions, results, isFavorite, onToggle, selectedCount,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Heart className="w-4 h-4 text-rose-500 fill-current" />
        <span className="font-semibold text-night">{selectedCount}</span>
        <span className="text-slate">di 3</span>
      </div>

      {/* Ricerca per nome + toggle ricerca intelligente (feature 7, logica IA lato dev) */}
      <div className={`flex items-center gap-2.5 px-3 py-2.5 bg-white border rounded-xl transition-colors ${
        aiSearch
          ? 'border-violet-400 ring-2 ring-violet-200'
          : 'border-cloud focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20'
      }`}>
        <Search className={`w-4 h-4 flex-shrink-0 ${aiSearch ? 'text-violet-500' : 'text-slate'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={aiSearch ? 'Descrivi cosa cerchi…' : 'Cerca un prodotto...'}
          className="flex-1 min-w-0 bg-transparent text-sm text-night placeholder:text-slate-light focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-slate hover:text-night" aria-label="Cancella">
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
            aiSearch ? 'bg-violet-100 text-violet-600' : 'text-slate-light hover:text-violet-500 hover:bg-violet-50'
          }`}
        >
          <Sparkle className={`w-5 h-5 transition-all ${aiSearch ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Filtri cumulativi: categoria + brand, poi supermercato (tra i preferiti) */}
      <div className="grid grid-cols-2 gap-2">
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
      {supermarketOptions.length > 0 && (
        <SelectDropdown
          value={supermarketId}
          onChange={setSupermarketId}
          options={supermarketOptions}
          allLabel="Tutti i miei supermercati"
          placeholder="Supermercato"
          icon={<Store className="w-4 h-4" />}
        />
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        {results.map((product) => (
          <CatalogProductCard
            key={product.id}
            product={product}
            supermarketId={supermarketId}
            isFavorite={isFavorite(product.name)}
            onToggleFavorite={() =>
              onToggle({
                name: product.name,
                category: product.category,
                price: getLowestPrice(product)?.price ?? null,
              })
            }
          />
        ))}
        {results.length === 0 && (
          <p className="col-span-2 text-sm text-slate text-center py-8">
            Nessun prodotto con questi filtri.
          </p>
        )}
      </div>
    </div>
  )
}

// ---- Step 4: prima lista ----
function StepFirstList({ listName, setListName, supermarketId, setSupermarketId, supermarketOptions }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-20 h-20 rounded-3xl bg-sky-light flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-ocean" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate uppercase tracking-wider">Nome della lista</label>
        <div className="flex items-center gap-2.5 px-3 py-3 mt-2 bg-white border border-cloud rounded-xl focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors">
          <ListPlus className="w-5 h-5 text-slate flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Es. Spesa della settimana"
            className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate uppercase tracking-wider">Tipo di lista</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => setSupermarketId(null)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              supermarketId === null ? 'border-ocean bg-sky-light/30 text-ocean' : 'border-cloud text-slate hover:border-sky/50'
            }`}
          >
            {supermarketId === null && <Check className="w-4 h-4" />}
            Generica
          </button>
          <SelectDropdown
            value={supermarketId}
            onChange={setSupermarketId}
            options={supermarketOptions}
            allLabel="Scegli supermercato"
            placeholder="Supermercato"
            icon={<Store className="w-4 h-4" />}
          />
        </div>
        {supermarketOptions.length === 0 && (
          <p className="text-xs text-slate-light mt-2">
            Per legare la lista a un supermercato, aggiungine uno ai preferiti nel passo precedente.
          </p>
        )}
      </div>
    </div>
  )
}
