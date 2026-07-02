import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, Euro, Tag, Star } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'
import { searchProducts, getBestPrice, getPricesForFavorites } from '../data/productsDatabase'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
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
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('altro')
  const [showCategories, setShowCategories] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualCategory, setManualCategory] = useState(false)
  const dropdownRef = useRef(null)
  const suggestionsRef = useRef(null)
  const inputRef = useRef(null)

  // Hook per supermercati preferiti
  const { favorites, hasFavorites } = useFavoriteSupermarkets()

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
    await onAdd(name, quantity, category, priceValue)
    setName('')
    setQuantity(1)
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

  return (
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
      <div className="flex gap-2">
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
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-cloud z-10 py-1 max-h-60 overflow-y-auto"
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

        {/* Quantity selector */}
        <div className="flex items-center gap-1 bg-white border border-cloud rounded-lg px-2">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-slate hover:text-night transition-colors"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium text-night">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-slate hover:text-night transition-colors"
          >
            +
          </button>
        </div>

        {/* Price input */}
        <div className="flex items-center gap-1 bg-white border border-cloud rounded-lg px-2">
          <Euro className="w-4 h-4 text-slate" />
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9,\.]/g, ''))}
            placeholder="0,00"
            className="w-16 py-2 text-sm text-center text-night bg-transparent focus:outline-none"
          />
        </div>
      </div>
    </form>
  )
}
