import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, Euro, Tag, Star, ScanLine, X, Check, Heart, Trash2 } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'
import BarcodeScanner from './BarcodeScanner'
import { searchProducts, getBestPrice, getPricesForFavorites } from '../data/productsDatabase'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { getSupermarketById } from '../data/supermarkets'

const CATEGORIES = [
  { id: 'frutta-verdura', name: 'Frutta e Verdura' },
  { id: 'pane-cereali', name: 'Pane e Cereali' },
  { id: 'latticini', name: 'Latticini' },
  { id: 'carne-pesce', name: 'Carne e Pesce' },
  { id: 'surgelati', name: 'Surgelati' },
  { id: 'dispensa', name: 'Dispensa' },
  { id: 'bevande', name: 'Bevande' },
  { id: 'igiene', name: 'Igiene Personale' },
  { id: 'casa', name: 'Casa e Pulizia' },
  { id: 'altro', name: 'Altro' },
]

const UNITS = [
  { id: 'pz', name: 'pz', label: 'Pezzi' },
  { id: 'kg', name: 'kg', label: 'Chilogrammi' },
  { id: 'g', name: 'g', label: 'Grammi' },
  { id: 'L', name: 'L', label: 'Litri' },
  { id: 'mL', name: 'mL', label: 'Millilitri' },
  { id: 'conf', name: 'conf', label: 'Confezioni' },
]

// Mapping parole chiave -> categoria per auto-categorizzazione
const CATEGORY_KEYWORDS = {
  'frutta-verdura': [
    'mela', 'mele', 'banana', 'banane', 'arancia', 'arance', 'limone', 'limoni',
    'pomodoro', 'pomodori', 'insalata', 'lattuga', 'carota', 'carote', 'zucchina', 'zucchine',
    'patata', 'patate', 'cipolla', 'cipolle', 'aglio', 'peperone', 'peperoni',
    'melanzana', 'melanzane', 'cetriolo', 'cetrioli', 'spinaci', 'broccoli',
    'cavolfiore', 'cavolo', 'fragola', 'fragole', 'pera', 'pere', 'pesca', 'pesche',
    'uva', 'kiwi', 'ananas', 'mango', 'avocado', 'verdura', 'frutta', 'funghi',
    'prezzemolo', 'basilico', 'rosmarino', 'sedano', 'finocchio', 'rucola',
  ],
  'pane-cereali': [
    'pane', 'panino', 'panini', 'fette biscottate', 'crackers', 'grissini',
    'cereali', 'muesli', 'cornflakes', 'avena', 'farina', 'pasta', 'riso',
    'spaghetti', 'penne', 'fusilli', 'orzo', 'farro', 'cous cous', 'couscous',
    'brioche', 'croissant', 'focaccia', 'pizza', 'piadina', 'tortillas',
  ],
  'latticini': [
    'latte', 'yogurt', 'formaggio', 'formaggi', 'mozzarella', 'parmigiano',
    'grana', 'pecorino', 'ricotta', 'mascarpone', 'burro', 'panna', 'stracchino',
    'gorgonzola', 'fontina', 'emmental', 'philadelphia', 'crescenza', 'robiola',
    'kefir', 'skyr', 'fiocchi di latte', 'latticini', 'uova', 'uovo',
  ],
  'carne-pesce': [
    'carne', 'pollo', 'manzo', 'maiale', 'vitello', 'tacchino', 'coniglio',
    'salsiccia', 'salsicce', 'salame', 'prosciutto', 'bresaola', 'speck',
    'pancetta', 'wurstel', 'hamburger', 'bistecca', 'costine', 'arrosto',
    'pesce', 'salmone', 'tonno', 'merluzzo', 'orata', 'branzino', 'gamberi',
    'calamari', 'cozze', 'vongole', 'acciughe', 'sardine', 'sgombro', 'polpo',
  ],
  'surgelati': [
    'surgelato', 'surgelati', 'gelato', 'gelati', 'ghiaccioli', 'pizza surgelata',
    'verdure surgelate', 'bastoncini', 'findus', 'frozen', 'congelato', 'congelati',
  ],
  'dispensa': [
    'olio', 'aceto', 'sale', 'zucchero', 'pepe', 'spezie', 'dado', 'dadi',
    'passata', 'pelati', 'conserva', 'marmellata', 'nutella', 'miele',
    'caffè', 'caffe', 'tè', 'the', 'tisana', 'biscotti', 'merendine',
    'cioccolato', 'cioccolatini', 'caramelle', 'patatine', 'chips', 'snack',
    'legumi', 'fagioli', 'lenticchie', 'ceci', 'piselli', 'mais', 'tonno in scatola',
    'maionese', 'ketchup', 'senape', 'salsa', 'pesto', 'sottoli', 'sottaceti',
  ],
  'bevande': [
    'acqua', 'birra', 'vino', 'coca cola', 'fanta', 'sprite', 'aranciata',
    'succo', 'succhi', 'spremuta', 'energy drink', 'redbull', 'monster',
    'prosecco', 'spumante', 'champagne', 'aperitivo', 'aperol', 'campari',
    'whisky', 'vodka', 'gin', 'rum', 'liquore', 'amaro', 'limoncello',
  ],
  'igiene': [
    'sapone', 'shampoo', 'bagnoschiuma', 'balsamo', 'dentifricio', 'spazzolino',
    'deodorante', 'crema', 'rasoio', 'rasoi', 'lamette', 'schiuma da barba',
    'assorbenti', 'tamponi', 'pannolini', 'salviette', 'cotton fioc', 'cotone',
    'fazzoletti', 'kleenex', 'carta igienica', 'scottex', 'rotoloni',
    'trucco', 'makeup', 'mascara', 'rossetto', 'smalto', 'profumo', 'colonia',
  ],
  'casa': [
    'detersivo', 'detersivi', 'sapone piatti', 'brillantante', 'anticalcare',
    'candeggina', 'ammorbidente', 'smacchiatore', 'sgrassatore', 'vetri',
    'spugna', 'spugne', 'panno', 'panni', 'mocio', 'scopa', 'paletta',
    'sacchetti', 'buste', 'alluminio', 'pellicola', 'carta forno',
    'pile', 'batterie', 'lampadina', 'lampadine', 'candele', 'fiammiferi',
  ],
}

function detectCategory(productName) {
  const nameLower = productName.toLowerCase().trim()

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Match se il nome contiene la keyword come parola intera o all'inizio
      if (nameLower === keyword ||
          nameLower.startsWith(keyword + ' ') ||
          nameLower.endsWith(' ' + keyword) ||
          nameLower.includes(' ' + keyword + ' ')) {
        return categoryId
      }
    }
  }

  // Se non trova match esatto, prova match parziale
  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return categoryId
      }
    }
  }

  return null // Nessuna categoria rilevata
}

// Formatta prezzo in italiano
function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + '€'
}

export default function AddProductForm({ onAdd, getSuggestions }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('pz')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('altro')
  const [showCategories, setShowCategories] = useState(false)
  const [showUnits, setShowUnits] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualCategory, setManualCategory] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scannedProduct, setScannedProduct] = useState(null)
  const [showAllFavorites, setShowAllFavorites] = useState(false)
  const dropdownRef = useRef(null)
  const unitsRef = useRef(null)
  const suggestionsRef = useRef(null)
  const inputRef = useRef(null)

  // Hook per supermercati preferiti
  const { favorites, hasFavorites } = useFavoriteSupermarkets()

  // Hook per prodotti preferiti
  const { favorites: favoriteProducts, hasFavorites: hasFavoriteProducts, removeFavorite } = useFavoriteProducts()

  const selectedCategory = CATEGORIES.find(c => c.id === category)

  // Cerca prodotti nel database
  const databaseProducts = searchProducts(name)

  // Ottieni anche suggerimenti basati sullo storico (se disponibile)
  const historySuggestions = getSuggestions ? getSuggestions(name) : []

  // Combina: prima i prodotti dal database, poi lo storico (evitando duplicati)
  const allSuggestions = [
    ...databaseProducts.map(p => ({
      ...p,
      fromDatabase: true,
    })),
    ...historySuggestions
      .filter(h => !databaseProducts.some(p => p.name.toLowerCase() === h.name.toLowerCase()))
      .map(h => ({
        ...h,
        fromDatabase: false,
      })),
  ].slice(0, 8) // Max 8 suggerimenti totali

  // Auto-detect categoria quando cambia il nome (solo se non selezionata manualmente)
  useEffect(() => {
    if (!manualCategory && name.trim()) {
      const detected = detectCategory(name)
      if (detected) {
        setCategory(detected)
      }
    }
  }, [name, manualCategory])

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategories(false)
      }
      if (unitsRef.current && !unitsRef.current.contains(event.target)) {
        setShowUnits(false)
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    // Mostra suggerimenti se c'è testo
    setShowSuggestions(value.trim().length > 0)
    // Reset manual flag se l'utente cancella tutto
    if (!value.trim()) {
      setManualCategory(false)
      setCategory('altro')
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    setName(suggestion.name)
    setCategory(suggestion.category)
    setManualCategory(true)
    setShowSuggestions(false)

    // Se il prodotto è dal database, imposta il prezzo migliore
    if (suggestion.fromDatabase && hasFavorites) {
      const bestPrice = getBestPrice(suggestion, favorites)
      if (bestPrice) {
        setPrice(bestPrice.price.toFixed(2).replace('.', ','))
      }
    }

    // Focus sull'input per continuare
    inputRef.current?.focus()
  }

  const handleCategorySelect = (catId) => {
    setCategory(catId)
    setManualCategory(true) // L'utente ha scelto manualmente
    setShowCategories(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || loading) return

    setLoading(true)
    const priceValue = price ? parseFloat(price.replace(',', '.')) : null
    await onAdd(name, quantity, unit, category, priceValue)
    setName('')
    setQuantity(1)
    setUnit('pz')
    setPrice('')
    setCategory('altro')
    setManualCategory(false)
    setLoading(false)
  }

  // Render prezzi per un prodotto del database
  const renderProductPrices = (product) => {
    if (!hasFavorites || !product.fromDatabase) return null

    const prices = getPricesForFavorites(product, favorites)
    if (prices.length === 0) return null

    const bestPrice = prices[0] // Già ordinati per prezzo

    return (
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {prices.slice(0, 3).map((priceInfo, idx) => {
          const supermarket = getSupermarketById(priceInfo.supermarketId)
          const isBest = idx === 0

          return (
            <span
              key={priceInfo.supermarketId}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                isBest
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: supermarket?.color }}
              />
              <span className="truncate max-w-[60px]">{supermarket?.name}</span>
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
            </span>
          )
        })}
      </div>
    )
  }

  // Quick add preferito
  const handleQuickAddFavorite = async (favProduct) => {
    await onAdd(
      favProduct.name,
      favProduct.defaultQuantity || 1,
      favProduct.unit || 'pz',
      favProduct.category,
      favProduct.price
    )
  }

  return (
    <div className="space-y-3">
      {/* Sezione preferiti quick-add */}
      {hasFavoriteProducts && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span className="text-xs font-semibold text-slate uppercase">Preferiti</span>
              <span className="text-xs text-slate-light">({favoriteProducts.length})</span>
            </div>
            {favoriteProducts.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllFavorites(true)}
                className="text-xs text-ocean hover:text-deep font-medium transition-colors"
              >
                Vedi tutti
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteProducts.slice(0, 2).map((fav) => (
              <motion.button
                key={fav.id}
                type="button"
                onClick={() => handleQuickAddFavorite(fav)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-cloud rounded-full text-sm text-night hover:border-rose-300 hover:bg-rose-50 transition-all shadow-soft"
              >
                <CategoryIcon category={fav.category} className="w-3.5 h-3.5 text-ocean" />
                <span className="truncate max-w-[120px]">{fav.name}</span>
                <Plus className="w-3.5 h-3.5 text-slate" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
      {/* Main input row */}
      <div className="flex gap-2">
        <div className="flex-1 relative" ref={inputRef}>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onFocus={() => {
              setShowCategories(false)
              if (name.trim()) setShowSuggestions(true)
            }}
            placeholder="Aggiungi prodotto..."
            className="w-full px-4 py-3 bg-white border border-cloud rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all shadow-soft"
            disabled={loading}
          />

          {/* Suggerimenti autocomplete */}
          <AnimatePresence>
            {showSuggestions && allSuggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-cloud z-20 py-1 max-h-80 overflow-y-auto"
              >
                {/* Sezione prodotti dal database */}
                {databaseProducts.length > 0 && (
                  <>
                    <p className="px-3 py-1.5 text-xs font-semibold text-slate uppercase">
                      Prodotti {hasFavorites && '· Confronta prezzi'}
                    </p>
                    {allSuggestions
                      .filter(s => s.fromDatabase)
                      .map((suggestion, index) => (
                        <button
                          key={`db-${index}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full flex flex-col items-start px-3 py-2 text-sm text-night hover:bg-sky-light/30 transition-colors border-b border-cloud/50 last:border-0"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <CategoryIcon category={suggestion.category} className="w-4 h-4 text-ocean flex-shrink-0" />
                            <span className="flex-1 text-left font-medium">{suggestion.name}</span>
                          </div>
                          {renderProductPrices(suggestion)}
                        </button>
                      ))}
                  </>
                )}

                {/* Sezione storico */}
                {historySuggestions.length > 0 && allSuggestions.some(s => !s.fromDatabase) && (
                  <>
                    <p className="px-3 py-1.5 text-xs font-semibold text-slate uppercase mt-1">
                      Compri spesso
                    </p>
                    {allSuggestions
                      .filter(s => !s.fromDatabase)
                      .map((suggestion, index) => (
                        <button
                          key={`hist-${index}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-night hover:bg-sky-light/30 transition-colors"
                        >
                          <CategoryIcon category={suggestion.category} className="w-4 h-4 text-ocean" />
                          <span className="flex-1 text-left">{suggestion.name}</span>
                        </button>
                      ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Barcode scanner button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="flex-shrink-0 w-12 h-12 bg-white border border-cloud text-slate hover:text-ocean hover:border-sky rounded-xl shadow-soft transition-all flex items-center justify-center"
          title="Scansiona codice a barre"
        >
          <ScanLine className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-sky to-ocean text-white rounded-xl shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-press flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Options row */}
      <div className="flex flex-wrap gap-2">
        {/* Category selector */}
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-cloud rounded-lg text-sm text-night hover:border-sky transition-all"
          >
            <CategoryIcon category={category} className="w-4 h-4 text-ocean" />
            <span className="flex-1 text-left truncate">{selectedCategory?.name}</span>
            <ChevronDown className={`w-4 h-4 text-slate transition-transform ${showCategories ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-cloud z-[100] py-1 max-h-60 overflow-y-auto"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sky-light/30 transition-colors ${
                      category === cat.id ? 'bg-sky-light/50 text-ocean' : 'text-night'
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

        {/* Quantity selector with unit */}
        <div className="flex items-center gap-1 bg-white border border-cloud rounded-lg px-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(0.1, quantity - (unit === 'pz' || unit === 'conf' ? 1 : 0.1)))}
            className="w-8 h-8 flex items-center justify-center text-slate hover:text-night transition-colors"
          >
            −
          </button>
          <input
            type="text"
            value={unit === 'pz' || unit === 'conf' ? quantity : quantity.toFixed(1).replace('.0', '')}
            onChange={(e) => {
              const val = parseFloat(e.target.value.replace(',', '.'))
              if (!isNaN(val) && val > 0) setQuantity(val)
            }}
            className="w-10 text-center text-sm font-medium text-night bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + (unit === 'pz' || unit === 'conf' ? 1 : 0.1))}
            className="w-8 h-8 flex items-center justify-center text-slate hover:text-night transition-colors"
          >
            +
          </button>
        </div>

        {/* Unit selector */}
        <div className="relative flex-shrink-0" ref={unitsRef}>
          <button
            type="button"
            onClick={() => setShowUnits(!showUnits)}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-cloud rounded-lg text-sm text-night hover:border-sky transition-all min-w-[60px]"
          >
            <span className="font-medium">{unit}</span>
            <ChevronDown className={`w-3 h-3 text-slate transition-transform ${showUnits ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showUnits && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-cloud z-[100] py-1 min-w-[140px]"
              >
                {UNITS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUnit(u.id)
                      setShowUnits(false)
                      // Reset quantità a valore intero se pz/conf
                      if (u.id === 'pz' || u.id === 'conf') {
                        setQuantity(Math.round(quantity) || 1)
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-sky-light/30 transition-colors ${
                      unit === u.id ? 'bg-sky-light/50 text-ocean' : 'text-night'
                    }`}
                  >
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-slate">{u.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price input */}
        <div className="flex items-center gap-1 bg-white border border-cloud rounded-lg px-2 flex-shrink-0">
          <Euro className="w-4 h-4 text-slate flex-shrink-0" />
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9,\.]/g, ''))}
            placeholder="0,00"
            className="w-14 py-2 text-sm text-center text-night bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductFound={(product) => {
          setShowScanner(false)
          setScannedProduct(product)
        }}
      />

      {/* Modal conferma prodotto scansionato */}
      <AnimatePresence>
        {scannedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
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
                <button
                  onClick={() => setScannedProduct(null)}
                  className="p-1 text-slate hover:text-night rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start gap-3 p-3 bg-snow rounded-xl mb-4">
                <div className="w-12 h-12 rounded-lg bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon category={scannedProduct.category} className="w-6 h-6 text-ocean" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-night">{scannedProduct.name}</p>
                  <p className="text-sm text-slate">
                    {CATEGORIES.find(c => c.id === scannedProduct.category)?.name}
                  </p>
                  {scannedProduct.price && (
                    <p className="text-sm font-semibold text-ocean mt-1">
                      {scannedProduct.price.toFixed(2).replace('.', ',')} €
                    </p>
                  )}
                  <p className="text-xs text-slate-light mt-1">
                    Barcode: {scannedProduct.barcode}
                  </p>
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
                  onClick={async () => {
                    await onAdd(
                      scannedProduct.name,
                      1,
                      'pz',
                      scannedProduct.category,
                      scannedProduct.price
                    )
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

      {/* Modal tutti i preferiti */}
      <AnimatePresence>
        {showAllFavorites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 overflow-hidden"
            onClick={() => setShowAllFavorites(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[100vw] sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-cloud">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                  <h3 className="text-lg font-semibold text-night">I tuoi preferiti</h3>
                  <span className="text-sm text-slate">({favoriteProducts.length})</span>
                </div>
                <button
                  onClick={() => setShowAllFavorites(false)}
                  className="p-1 text-slate hover:text-night rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista preferiti */}
              <div className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 space-y-2">
                {favoriteProducts.map((fav) => (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-3 p-3 bg-snow rounded-xl min-w-0 overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon category={fav.category} className="w-5 h-5 text-ocean" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-night truncate">{fav.name}</p>
                      <p className="text-xs text-slate truncate">
                        {fav.defaultQuantity} {fav.unit}
                        {fav.price && ` · ${fav.price.toFixed(2).replace('.', ',')}€`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleQuickAddFavorite(fav)
                        setShowAllFavorites(false)
                      }}
                      className="flex-shrink-0 p-2 text-ocean hover:bg-sky-light/50 rounded-lg transition-colors"
                      title="Aggiungi alla lista"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="flex-shrink-0 p-2 text-slate hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Rimuovi dai preferiti"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {favoriteProducts.length === 0 && (
                  <div className="text-center py-8 text-slate">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-slate-light" />
                    <p>Nessun preferito salvato</p>
                    <p className="text-sm text-slate-light mt-1">
                      Clicca il cuore su un prodotto per salvarlo
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </form>
    </div>
  )
}
