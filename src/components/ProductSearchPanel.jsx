import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search, X, PackageOpen, LayoutGrid, Tag, MapPin } from 'lucide-react'
import { PRODUCTS_DATABASE, getLowestPrice, getBrand, getBrandsForProducts } from '../data/productsDatabase'
import { CATEGORY_ORDER, getCategoryName, getUniqueCategory } from '../data/categories'
import CatalogProductCard from './CatalogProductCard'
import SelectDropdown from './ui/SelectDropdown'
import CEInput from './ui/CEInput'

/**
 * ProductSearchPanel — pannello ricerca prodotti riutilizzabile (search-first).
 *
 * Possiede lo stato di ricerca prodotto (query/manualCategory/catDismissed/brand)
 * e l'intera pipeline a cascata categoria/brand estratta dal catalogo. Il "dove"
 * (zona/supermercato) è esterno: viene iniettato dal consumer tramite `contextSlot`.
 *
 * Props:
 *  · contextSlot        ReactNode reso SOPRA la barra di ricerca (filtri o riepilogo).
 *  · beforeResultsSlot  ReactNode reso tra i filtri e il conteggio/griglia.
 *  · supermarketId      string|null (default null): scoping pipeline + pricing card.
 *  · showZoneAverage    bool (default false): banner prezzo medio in zona (feature 9).
 *  · contextHasFilter   bool (default false): concorre alla visibilità di "Azzera filtri".
 *  · onResetContext     fn opz.: invocata da "Azzera filtri" per ripulire il contesto esterno.
 *  · isFavorite         fn(name)->bool: stato preferito per le card.
 *  · onToggleFavorite   fn(product) opz.: toggle preferito.
 *  · onAddToList        fn(product) opz.: aggiunta a lista.
 *  · onQueryChange      fn(query) opz.: notifica il parent a ogni cambio ricerca (seed assistente).
 */
export default function ProductSearchPanel({
  contextSlot = null,
  beforeResultsSlot = null,
  supermarketId = null,
  showZoneAverage = false,
  contextHasFilter = false,
  onResetContext = null,
  isFavorite = null,
  onToggleFavorite = null,
  onAddToList = null,
  onQueryChange = null,
}) {
  // Stato filtri — modello search-first + faccette a cascata:
  //  · query         → ricerca per nome (azione primaria)
  //  · manualCategory→ categoria scelta a mano (prevale sull'auto)
  //  · catDismissed  → l'utente ha rimosso la categoria auto-suggerita
  //  · brand         → faccetta brand (derivata dal pool corrente)
  const [query, setQuery] = useState('')
  const [manualCategory, setManualCategory] = useState(null)
  const [catDismissed, setCatDismissed] = useState(false)
  const [brand, setBrand] = useState(null)

  // Aggiornamento query centralizzato: notifica il parent (seed assistente).
  const updateQuery = (val) => {
    setQuery(val)
    onQueryChange?.(val)
  }

  // --- Pipeline di derivazione a cascata (semantica AND, ma contestuale) ---

  // 1. Match sul nome (o tutti i prodotti se la ricerca è vuota)
  const nameMatches = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return PRODUCTS_DATABASE
    return PRODUCTS_DATABASE.filter((p) => p.name.toLowerCase().includes(q))
  }, [query])

  // 2. Filtro contesto punto vendita (se impostato)
  const contextScoped = useMemo(() => {
    if (!supermarketId) return nameMatches
    return nameMatches.filter((p) => p.prices[supermarketId])
  }, [nameMatches, supermarketId])

  // 3. Categoria auto-suggerita: SOLO se la query è ≥2 caratteri e i match
  //    convergono su una sola categoria (query ambigua → nessun suggerimento).
  const uniqueCat = useMemo(
    () => (query.trim().length >= 2 ? getUniqueCategory(contextScoped) : null),
    [query, contextScoped]
  )
  const autoCat = !manualCategory && !catDismissed ? uniqueCat : null
  const effectiveCategory = manualCategory ?? autoCat

  // 4. Opzioni categoria (cascata): categorie presenti nel pool contestuale,
  //    ordinate secondo CATEGORY_ORDER.
  const categoryOptions = useMemo(() => {
    const present = new Set(contextScoped.map((p) => p.category))
    return CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({
      value: c,
      label: getCategoryName(c),
    }))
  }, [contextScoped])

  // 5. Opzioni brand (cascata): brand distinti nel pool contestuale già
  //    ristretto dalla categoria effettiva.
  const brandOptions = useMemo(() => {
    const pool = effectiveCategory
      ? contextScoped.filter((p) => p.category === effectiveCategory)
      : contextScoped
    return getBrandsForProducts(pool)
  }, [contextScoped, effectiveCategory])

  const brandSelectOptions = useMemo(
    () => brandOptions.map((b) => ({ value: b, label: b })),
    [brandOptions]
  )

  // 6. Risultati finali: pool contestuale filtrato per categoria effettiva + brand.
  const results = useMemo(() => {
    return contextScoped.filter((p) => {
      if (effectiveCategory && p.category !== effectiveCategory) return false
      if (brand && getBrand(p) !== brand) return false
      return true
    })
  }, [contextScoped, effectiveCategory, brand])

  // Reset su cambio ricerca: il pool cambia, il suggerimento va ricalcolato da capo.
  useEffect(() => {
    setManualCategory(null)
    setCatDismissed(false)
    setBrand(null)
  }, [query])

  // Brand auto-azzerato quando non è più tra le opzioni valide (a seguito di un
  // cambio a monte di categoria effettiva o supermercato).
  useEffect(() => {
    if (brand && !brandOptions.includes(brand)) setBrand(null)
  }, [effectiveCategory, supermarketId, brand, brandOptions])

  const hasFilters = !!query || !!manualCategory || !!brand || contextHasFilter

  // Feature 9 — prezzo medio in zona per ricerche generiche (termine con più prodotti):
  // media del prezzo più basso di ciascun prodotto che matcha.
  const zoneAveragePrice = useMemo(() => {
    if (!showZoneAverage) return null
    if (!query.trim() || results.length < 2) return null
    const prices = results.map((p) => getLowestPrice(p, supermarketId)?.price).filter((v) => v != null)
    if (prices.length < 2) return null
    return prices.reduce((a, b) => a + b, 0) / prices.length
  }, [showZoneAverage, query, results, supermarketId])

  // Scelta manuale dal dropdown categoria: prevale sull'auto. Selezionare
  // "Tutte le categorie" (null) equivale a rimuovere anche l'auto-suggerimento.
  const handleCategoryChange = (val) => {
    setManualCategory(val)
    if (val === null) setCatDismissed(true)
  }

  const clearAllFilters = () => {
    updateQuery('')
    setManualCategory(null)
    setCatDismissed(false)
    setBrand(null)
    onResetContext?.()
  }

  return (
    <div>
      {/* Slot di contesto (esterno al pannello): filtri zona/supermercato nel
          catalogo, riepilogo sola-lettura nell'onboarding. Reso SOPRA la ricerca. */}
      {contextSlot}

      {/* Ricerca prodotto — azione PRIMARIA: barra prominente a tutta larghezza,
          con lift dell'ombra al focus per staccarla dalla riga contesto. */}
      <div className="flex items-center gap-2.5 px-4 py-4 mt-3 bg-white border-2 border-cloud rounded-2xl shadow-soft focus-within:border-sky focus-within:shadow-soft-lg focus-within:ring-4 focus-within:ring-sky/15 transition-all">
        <Search className="w-5 h-5 text-ocean flex-shrink-0" />
        <CEInput
          value={query}
          onChange={updateQuery}
          placeholder="Cerca un prodotto..."
          ariaLabel="Cerca un prodotto"
          className="flex-1 min-w-0 text-base font-medium text-night"
        />
        {query && (
          <button
            onClick={() => updateQuery('')}
            className="grid place-items-center w-9 h-9 -mr-1 text-slate hover:text-night rounded-full hover:bg-cloud transition-all flex-shrink-0"
            aria-label="Cancella ricerca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtri fissi a cascata: Categoria + Brand su una riga stabile a 2 colonne.
          Sempre montati: al variare della ricerca cambiano solo opzioni e valore,
          senza montarsi/smontarsi (niente layout "saltellante"). Il dropdown
          categoria mostra `effectiveCategory` (l'auto-categoria appare già
          selezionata) ed è modificabile/removibile via "Tutte le categorie". */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <SelectDropdown
          value={effectiveCategory}
          onChange={handleCategoryChange}
          options={categoryOptions}
          allLabel="Tutte le categorie"
          placeholder="Categoria"
          icon={<LayoutGrid className="w-4 h-4" />}
        />
        <SelectDropdown
          value={brand}
          onChange={setBrand}
          options={brandSelectOptions}
          allLabel="Tutti i brand"
          placeholder="Brand"
          icon={<Tag className="w-4 h-4" />}
        />
      </div>

      {/* Slot tra filtri e conteggio/griglia: sezione preferiti (catalogo) o
          contatore "X di 3" (onboarding). */}
      {beforeResultsSlot}

      {/* Conteggio risultati */}
      <p className="text-sm text-slate mt-4 mb-3 px-1">
        <span className="font-medium text-night">{results.length}</span> prodott{results.length === 1 ? 'o' : 'i'}
        {hasFilters && (
          <button onClick={clearAllFilters} className="ml-2 text-ocean hover:text-deep font-medium">
            Azzera filtri
          </button>
        )}
      </p>

      {/* Feature 9 — prezzo medio in zona per ricerca generica */}
      {zoneAveragePrice != null && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-sky-light/40 border border-sky/20 rounded-xl">
          <MapPin className="w-4 h-4 text-ocean flex-shrink-0" />
          <p className="text-sm text-night">
            Prezzo medio in zona per «<span className="font-medium">{query.trim()}</span>»:{' '}
            <span className="font-semibold text-ocean">{zoneAveragePrice.toFixed(2).replace('.', ',')} €</span>
          </p>
        </div>
      )}

      {/* Griglia prodotti */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {results.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                supermarketId={supermarketId}
                isFavorite={isFavorite ? isFavorite(product.name) : false}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(product) : undefined}
                onAddToList={onAddToList ? () => onAddToList(product) : undefined}
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
