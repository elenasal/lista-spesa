import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Plus, X, ScanLine, Tag, Star, Check, Minus, ChevronDown } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'
import BarcodeScanner from './BarcodeScanner'
import { searchProducts, getBestPrice, getPricesForFavorites } from '../data/productsDatabase'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { getSupermarketById } from '../data/supermarkets'
import { CATEGORIES, UNITS, detectCategory, formatPrice } from '../utils/productCategories'

// Quantità rapide proposte come chip (come nell'esempio: 1 2 3 5)
const QUICK_QUANTITIES = [1, 2, 3, 5]

export default function AddProductSheet({ onAdd, onUpdate, getSuggestions, listSupermarketId = null }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scannedProduct, setScannedProduct] = useState(null)
  const [showCategories, setShowCategories] = useState(false)

  // L'ultimo prodotto aggiunto (in fase di rifinitura nello step "dettagli")
  const [lastItem, setLastItem] = useState(null)
  // Il prodotto del database associato all'ultimo item (per le pill prezzi)
  const [lastDbProduct, setLastDbProduct] = useState(null)

  const inputRef = useRef(null)
  const dragControls = useDragControls()

  const { favorites: favoriteSupermarketIds } = useFavoriteSupermarkets()
  const { favorites: favoriteProducts } = useFavoriteProducts()

  // Prezzi mostrati: solo il supermercato della lista se legata, altrimenti i preferiti
  const priceSupermarketIds = listSupermarketId ? [listSupermarketId] : favoriteSupermarketIds
  const hasPriceSupermarkets = priceSupermarketIds.length > 0

  const trimmed = query.trim()
  // Mostra i dettagli quando non stiamo cercando e c'è un item appena aggiunto
  const showDetails = trimmed === '' && !!lastItem

  // Prodotti dal database (filtrati per supermercato se la lista è legata)
  const databaseProducts = useMemo(() => {
    if (!trimmed) return []
    return searchProducts(query).filter(
      (p) => !listSupermarketId || p.prices?.[listSupermarketId]
    )
  }, [query, trimmed, listSupermarketId])

  // Suggerimenti dallo storico / mock
  const historySuggestions = useMemo(
    () => (getSuggestions ? getSuggestions(query) : []),
    [getSuggestions, query]
  )

  // Tile da mostrare nello step ricerca.
  // Query vuota → preferiti + "compri spesso"; altrimenti risultati filtrati.
  const tiles = useMemo(() => {
    if (trimmed) {
      const dbTiles = databaseProducts.map((p) => ({
        key: `db-${p.name}`,
        name: p.name,
        category: p.category,
        fromDatabase: true,
        dbProduct: p,
      }))
      const histTiles = historySuggestions
        .filter((h) => !databaseProducts.some((p) => p.name.toLowerCase() === h.name.toLowerCase()))
        .map((h) => ({
          key: `hist-${h.name}`,
          name: h.name,
          category: h.category,
          fromDatabase: false,
        }))
      return [...dbTiles, ...histTiles].slice(0, 12)
    }

    // Stato iniziale: preferiti + frequenti
    const favTiles = favoriteProducts.map((f) => ({
      key: `fav-${f.id}`,
      name: f.name,
      category: f.category,
      favorite: f,
    }))
    const freqTiles = (getSuggestions ? getSuggestions('') : [])
      .filter((h) => !favoriteProducts.some((f) => f.name.toLowerCase() === h.name.toLowerCase()))
      .map((h) => ({
        key: `freq-${h.name}`,
        name: h.name,
        category: h.category,
        fromDatabase: false,
      }))
    return [...favTiles, ...freqTiles].slice(0, 12)
  }, [trimmed, databaseProducts, historySuggestions, favoriteProducts, getSuggestions])

  // Blocca lo scroll del body mentre il pannello è aperto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const openSheet = () => {
    setOpen(true)
    setQuery('')
    setLastItem(null)
    setLastDbProduct(null)
    setTimeout(() => inputRef.current?.focus(), 120)
  }

  const closeSheet = () => {
    setOpen(false)
    setQuery('')
    setLastItem(null)
    setLastDbProduct(null)
    setShowCategories(false)
  }

  // Crea un item e passa allo step dettagli per rifinirlo
  const commitItem = ({ name, category, quantity = 1, unit = 'pz', price = null, supermarketId = null, dbProduct = null }) => {
    const cleanName = name.trim()
    if (!cleanName) return
    const cat = category || detectCategory(cleanName) || 'altro'
    const effectiveSupermarketId = supermarketId || listSupermarketId || null
    const created = onAdd(cleanName, quantity, unit, cat, price, effectiveSupermarketId)
    if (created) {
      setLastItem(created)
      setLastDbProduct(dbProduct || searchProducts(cleanName).find((p) => p.name.toLowerCase() === cleanName.toLowerCase()) || null)
    }
    setQuery('')
    setShowCategories(false)
    inputRef.current?.focus()
  }

  // Selezione di una tile
  const handleSelectTile = (tile) => {
    if (tile.favorite) {
      const f = tile.favorite
      commitItem({
        name: f.name,
        category: f.category,
        quantity: f.defaultQuantity || 1,
        unit: f.unit || 'pz',
        price: f.price ?? null,
        dbProduct: null,
      })
      return
    }

    let price = null
    let supermarketId = null
    if (tile.fromDatabase && tile.dbProduct && hasPriceSupermarkets) {
      const best = getBestPrice(tile.dbProduct, priceSupermarketIds)
      if (best) {
        price = best.price
        supermarketId = best.supermarketId
      }
    }
    commitItem({
      name: tile.name,
      category: tile.category,
      price,
      supermarketId,
      dbProduct: tile.dbProduct || null,
    })
  }

  // Invio dell'input: se c'è testo, crea l'item con quel nome
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (trimmed) {
        commitItem({ name: trimmed })
      }
    }
  }

  // --- Modifiche allo step dettagli (aggiornano l'item già creato) ---
  const patchLast = (updates) => {
    if (!lastItem) return
    const next = { ...lastItem, ...updates }
    setLastItem(next)
    onUpdate?.(lastItem.id, updates)
  }

  const setQuantity = (q) => patchLast({ quantity: q })
  const setUnit = (u) => {
    const updates = { unit: u }
    if ((u === 'pz' || u === 'conf') && lastItem) updates.quantity = Math.round(lastItem.quantity) || 1
    patchLast(updates)
  }
  const setPriceValue = (val) => {
    const parsed = val === '' ? null : parseFloat(String(val).replace(',', '.'))
    patchLast({ price: isNaN(parsed) ? null : parsed })
  }
  const setCategoryValue = (catId) => {
    patchLast({ category: catId })
    setShowCategories(false)
  }
  const selectSupermarketPrice = (priceInfo) => {
    const effectivePrice = priceInfo.onSale ? priceInfo.salePrice : priceInfo.effectivePrice
    patchLast({ price: effectivePrice, supermarketId: priceInfo.supermarketId })
  }

  const detailsPrices = useMemo(() => {
    if (!lastDbProduct || !hasPriceSupermarkets) return []
    return getPricesForFavorites(lastDbProduct, priceSupermarketIds)
  }, [lastDbProduct, hasPriceSupermarkets, priceSupermarketIds])

  const isPzLike = lastItem && (lastItem.unit === 'pz' || lastItem.unit === 'conf')
  const priceInputValue = lastItem?.price != null ? String(lastItem.price).replace('.', ',') : ''
  const currentCategory = CATEGORIES.find((c) => c.id === lastItem?.category)

  return (
    <>
      {/* Barra fissa in basso (chiusa) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto px-3 pb-3 pointer-events-auto">
          <button
            onClick={openSheet}
            className="w-full flex items-center gap-3 pl-4 pr-2 py-2.5 bg-white rounded-2xl shadow-soft-lg border border-cloud"
          >
            <span className="flex-1 text-left text-slate-light">Aggiungi prodotto...</span>
            <span
              onClick={(e) => { e.stopPropagation(); setShowScanner(true) }}
              className="w-9 h-9 flex items-center justify-center text-slate hover:text-ocean rounded-xl transition-colors"
              title="Scansiona codice a barre"
            >
              <ScanLine className="w-5 h-5" />
            </span>
            <span className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-sky to-ocean text-white rounded-xl shadow-soft">
              <Plus className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>

      {/* Bottom sheet aperto */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col justify-end"
              initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
              onClick={closeSheet}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) closeSheet()
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-soft-lg flex flex-col h-[calc(100dvh-2.5rem)]"
              >
                {/* Maniglia — sempre visibile in alto, unica zona che chiude col trascinamento */}
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="flex-shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
                >
                  <div className="w-11 h-1.5 rounded-full bg-cloud" />
                </div>

                {/* Contenuto scrollabile: tile oppure dettagli */}
                <div className="flex-1 overflow-y-auto px-4 pt-2 pb-3 min-h-[120px]">
                  {showDetails ? (
                    /* --- STEP DETTAGLI --- */
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon category={lastItem.category} className="w-5 h-5 text-ocean" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate">Dettagli dell'articolo per</p>
                          <p className="font-semibold text-night truncate">{lastItem.name}</p>
                        </div>
                        <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Check className="w-3.5 h-3.5" /> Aggiunto
                        </span>
                      </div>

                      {/* Quantità rapida */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {QUICK_QUANTITIES.map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuantity(q)}
                            className={`min-w-[44px] h-11 px-3 rounded-xl text-sm font-semibold border transition-all ${
                              lastItem.quantity === q
                                ? 'bg-ocean text-white border-ocean'
                                : 'bg-white text-night border-cloud hover:border-sky'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                        {/* Stepper */}
                        <div className="flex items-center gap-1 bg-white border border-cloud rounded-xl px-1">
                          <button
                            onClick={() => setQuantity(Math.max(isPzLike ? 1 : 0.1, +(lastItem.quantity - (isPzLike ? 1 : 0.1)).toFixed(1)))}
                            className="w-9 h-9 flex items-center justify-center text-slate hover:text-night"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-night">
                            {isPzLike ? lastItem.quantity : lastItem.quantity.toFixed(1).replace('.0', '')}
                          </span>
                          <button
                            onClick={() => setQuantity(+(lastItem.quantity + (isPzLike ? 1 : 0.1)).toFixed(1))}
                            className="w-9 h-9 flex items-center justify-center text-slate hover:text-night"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Unità */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {UNITS.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => setUnit(u.id)}
                            className={`h-9 px-3 rounded-lg text-sm font-medium border transition-all ${
                              lastItem.unit === u.id
                                ? 'bg-sky-light/60 text-ocean border-sky'
                                : 'bg-white text-slate border-cloud hover:border-sky'
                            }`}
                          >
                            {u.name}
                          </button>
                        ))}
                      </div>

                      {/* Prezzo + pill supermercati */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 bg-white border border-cloud rounded-xl px-3 h-11">
                            <span className="text-slate text-sm">€</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              name="prezzo-prodotto"
                              value={priceInputValue}
                              onChange={(e) => setPriceValue(e.target.value.replace(/[^0-9,.]/g, ''))}
                              placeholder="0,00"
                              autoComplete="off"
                              data-lpignore="true"
                              data-form-type="other"
                              data-1p-ignore
                              className="w-16 text-sm text-night bg-transparent focus:outline-none"
                            />
                          </div>
                          {/* Categoria */}
                          <div className="relative flex-1">
                            <button
                              onClick={() => setShowCategories((s) => !s)}
                              className="w-full flex items-center gap-2 h-11 px-3 bg-white border border-cloud rounded-xl text-sm text-night hover:border-sky transition-all"
                            >
                              <CategoryIcon category={lastItem.category} className="w-4 h-4 text-ocean" />
                              <span className="flex-1 text-left truncate">{currentCategory?.name}</span>
                              <ChevronDown className={`w-4 h-4 text-slate transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {showCategories && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-soft-lg border border-cloud z-20 py-1 max-h-56 overflow-y-auto"
                                >
                                  {CATEGORIES.map((cat) => (
                                    <button
                                      key={cat.id}
                                      onClick={() => setCategoryValue(cat.id)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sky-light/30 transition-colors ${
                                        lastItem.category === cat.id ? 'bg-sky-light/50 text-ocean' : 'text-night'
                                      }`}
                                    >
                                      <CategoryIcon category={cat.id} className="w-4 h-4" />
                                      <span>{cat.name}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {detailsPrices.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {detailsPrices.slice(0, 4).map((priceInfo, idx) => {
                              const supermarket = getSupermarketById(priceInfo.supermarketId)
                              const isBest = idx === 0
                              const isSelected = lastItem.supermarketId === priceInfo.supermarketId
                              return (
                                <button
                                  key={priceInfo.supermarketId}
                                  onClick={() => selectSupermarketPrice(priceInfo)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                                    isSelected
                                      ? 'ring-2 ring-ocean bg-sky-light/40'
                                      : isBest
                                      ? 'bg-green-100 text-green-700 font-medium'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: supermarket?.color }} />
                                  <span className="truncate max-w-[64px]">{supermarket?.name}</span>
                                  {priceInfo.onSale ? (
                                    <>
                                      <span className="line-through text-gray-400">{formatPrice(priceInfo.price)}</span>
                                      <span className="text-orange-600 font-medium">{formatPrice(priceInfo.salePrice)}</span>
                                      <Tag className="w-3 h-3 text-orange-500" />
                                    </>
                                  ) : (
                                    <span>{formatPrice(priceInfo.effectivePrice)}</span>
                                  )}
                                  {isBest && <Star className="w-3 h-3 fill-current" />}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-light text-center">
                        Scrivi qui sotto per aggiungere l'articolo successivo
                      </p>
                    </div>
                  ) : (
                    /* --- STEP RICERCA: griglia di tile --- */
                    <div>
                      {!trimmed && (
                        <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                          {favoriteProducts.length > 0 ? 'Preferiti e frequenti' : 'Suggerimenti'}
                        </p>
                      )}
                      {tiles.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {tiles.map((tile) => (
                            <button
                              key={tile.key}
                              onClick={() => handleSelectTile(tile)}
                              className="aspect-square flex flex-col items-center justify-center gap-1.5 p-2 bg-snow border border-cloud rounded-2xl hover:border-sky hover:bg-sky-light/20 transition-all"
                            >
                              <CategoryIcon category={tile.category} className="w-8 h-8 text-ocean" />
                              <span className="text-xs text-center text-night leading-tight line-clamp-2">
                                {tile.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-sm text-slate">
                          {trimmed ? (
                            <>Premi <span className="font-semibold text-night">invio</span> per aggiungere «{trimmed}»</>
                          ) : (
                            'Scrivi il nome di un prodotto'
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input persistente in fondo (sopra la tastiera) */}
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-cloud bg-[#c8eeff]">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-slate hover:text-ocean bg-white border border-cloud rounded-xl transition-colors"
                    title="Scansiona codice a barre"
                  >
                    <ScanLine className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0 flex items-center gap-2 bg-white border border-cloud rounded-xl px-3 h-11 focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-all">
                    <input
                      ref={inputRef}
                      type="search"
                      name="ricerca-prodotto"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder={showDetails ? 'Articolo successivo...' : 'Mi serve...'}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      data-lpignore="true"
                      data-form-type="other"
                      data-1p-ignore
                      className="flex-1 min-w-0 text-night placeholder:text-slate-light bg-transparent focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                    />
                    {query && (
                      <button onClick={() => setQuery('')} className="flex-shrink-0 text-slate hover:text-night">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {trimmed ? (
                    <button
                      onClick={() => commitItem({ name: trimmed })}
                      className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-sky to-ocean text-white rounded-xl shadow-soft"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={closeSheet}
                      className="px-2 h-11 flex-shrink-0 text-ocean font-semibold text-sm whitespace-nowrap"
                    >
                      {lastItem ? 'Fine' : 'Annulla'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductFound={(product) => {
          setShowScanner(false)
          setScannedProduct(product)
        }}
      />

      {/* Conferma prodotto scansionato */}
      <AnimatePresence>
        {scannedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setScannedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-night">Prodotto trovato</h3>
                <button onClick={() => setScannedProduct(null)} className="p-1 text-slate hover:text-night rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-start gap-3 p-3 bg-snow rounded-xl mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon category={scannedProduct.category} className="w-6 h-6 text-ocean" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-night">{scannedProduct.name}</p>
                  <p className="text-sm text-slate">{CATEGORIES.find((c) => c.id === scannedProduct.category)?.name}</p>
                  {scannedProduct.price && (
                    <p className="text-sm font-semibold text-ocean mt-1">
                      {scannedProduct.price.toFixed(2).replace('.', ',')} €
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setScannedProduct(null)}
                  className="flex-1 py-2.5 px-4 bg-cloud text-night rounded-xl font-medium hover:bg-slate-light/30 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    onAdd(scannedProduct.name, 1, 'pz', scannedProduct.category, scannedProduct.price, listSupermarketId || null)
                    setScannedProduct(null)
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-sky to-ocean text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Aggiungi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
