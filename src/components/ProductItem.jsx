import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Pencil, X, ChevronDown, Tag, Star, Euro, Heart, MoreVertical } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'
import { searchProducts, getPricesForFavorites } from '../data/productsDatabase'
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

// Formatta prezzo in italiano
function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + '€'
}

export default function ProductItem({ item, onToggle, onDelete, onUpdate }) {
  const { name, quantity, unit = 'pz', category, price, checked } = item
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editQuantity, setEditQuantity] = useState(quantity)
  const [editUnit, setEditUnit] = useState(unit)
  const [editPrice, setEditPrice] = useState(price ? price.toFixed(2).replace('.', ',') : '')
  const [editCategory, setEditCategory] = useState(category)
  const [showCategories, setShowCategories] = useState(false)
  const [showUnits, setShowUnits] = useState(false)
  const [showPrices, setShowPrices] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const unitsRef = useRef(null)
  const menuRef = useRef(null)

  // Hook per supermercati preferiti
  const { favorites, hasFavorites } = useFavoriteSupermarkets()

  // Hook per prodotti preferiti
  const { isFavorite, toggleFavorite } = useFavoriteProducts()
  const isProductFavorite = isFavorite(name)

  // Cerca il prodotto nel database per mostrare i prezzi
  const databaseProducts = searchProducts(name)
  const matchedProduct = databaseProducts.find(p =>
    p.name.toLowerCase() === name.toLowerCase()
  )
  const productPrices = matchedProduct && hasFavorites
    ? getPricesForFavorites(matchedProduct, favorites)
    : []

  // Focus input quando entra in edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategories(false)
      }
      if (unitsRef.current && !unitsRef.current.contains(event.target)) {
        setShowUnits(false)
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStartEdit = () => {
    setEditName(name)
    setEditQuantity(quantity)
    setEditUnit(unit)
    setEditPrice(price ? price.toFixed(2).replace('.', ',') : '')
    setEditCategory(category)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editName.trim()) {
      const priceValue = editPrice ? parseFloat(editPrice.replace(',', '.')) : null
      onUpdate(item.id, {
        name: editName.trim(),
        quantity: editQuantity,
        unit: editUnit,
        price: priceValue,
        category: editCategory
      })
    }
    setIsEditing(false)
    setShowCategories(false)
    setShowUnits(false)
  }

  const handleCancel = () => {
    setEditName(name)
    setEditQuantity(quantity)
    setEditUnit(unit)
    setEditPrice(price ? price.toFixed(2).replace('.', ',') : '')
    setEditCategory(category)
    setIsEditing(false)
    setShowCategories(false)
    setShowUnits(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleTogglePrices = (e) => {
    // Non aprire se stiamo cliccando su altri bottoni
    if (e.target.closest('button')) return
    if (productPrices.length > 0 && !checked) {
      setShowPrices(!showPrices)
    }
  }

  const selectedCategory = CATEGORIES.find(c => c.id === editCategory)

  // Modalita' editing
  if (isEditing) {
    return (
      <motion.div
        layout
        className="flex flex-col gap-2 p-3 bg-white rounded-xl shadow-soft border-2 border-sky relative z-40"
      >
        {/* Input nome */}
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 bg-snow border border-cloud rounded-lg text-night focus:outline-none focus:border-sky"
          placeholder="Nome prodotto..."
        />

        {/* Riga quantità + unità + prezzo */}
        <div className="flex gap-2">
          {/* Quantità */}
          <div className="flex items-center gap-1 bg-snow border border-cloud rounded-lg px-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setEditQuantity(Math.max(0.1, editQuantity - (editUnit === 'pz' || editUnit === 'conf' ? 1 : 0.1)))}
              className="w-7 h-7 flex items-center justify-center text-slate hover:text-night transition-colors"
            >
              −
            </button>
            <input
              type="text"
              value={editUnit === 'pz' || editUnit === 'conf' ? editQuantity : editQuantity.toFixed(1).replace('.0', '')}
              onChange={(e) => {
                const val = parseFloat(e.target.value.replace(',', '.'))
                if (!isNaN(val) && val > 0) setEditQuantity(val)
              }}
              className="w-8 text-center text-sm font-medium text-night bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setEditQuantity(editQuantity + (editUnit === 'pz' || editUnit === 'conf' ? 1 : 0.1))}
              className="w-7 h-7 flex items-center justify-center text-slate hover:text-night transition-colors"
            >
              +
            </button>
          </div>

          {/* Unità */}
          <div className="relative flex-shrink-0" ref={unitsRef}>
            <button
              type="button"
              onClick={() => setShowUnits(!showUnits)}
              className="flex items-center gap-1 px-2 py-2 bg-snow border border-cloud rounded-lg text-sm text-night hover:border-sky transition-all"
            >
              <span className="font-medium">{editUnit}</span>
              <ChevronDown className={`w-3 h-3 text-slate transition-transform ${showUnits ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUnits && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 mb-1 bg-white rounded-xl shadow-xl border border-cloud z-[100] py-1 min-w-[120px]"
                >
                  {UNITS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setEditUnit(u.id)
                        setShowUnits(false)
                        if (u.id === 'pz' || u.id === 'conf') {
                          setEditQuantity(Math.round(editQuantity) || 1)
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-sky-light/30 transition-colors ${
                        editUnit === u.id ? 'bg-sky-light/50 text-ocean' : 'text-night'
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

          {/* Prezzo */}
          <div className="flex items-center gap-1 bg-snow border border-cloud rounded-lg px-2 flex-1">
            <Euro className="w-4 h-4 text-slate flex-shrink-0" />
            <input
              type="text"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value.replace(/[^0-9,\.]/g, ''))}
              placeholder="0,00"
              className="w-full py-2 text-sm text-night bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Riga categoria + azioni */}
        <div className="flex gap-2">
          {/* Selettore categoria */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-snow border border-cloud rounded-lg text-sm text-night hover:border-sky transition-all"
            >
              <CategoryIcon category={editCategory} className="w-4 h-4 text-ocean" />
              <span className="flex-1 text-left truncate">{selectedCategory?.name}</span>
              <ChevronDown className={`w-4 h-4 text-slate transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-xl border border-cloud z-[100] py-1 max-h-48 overflow-y-auto"
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setEditCategory(cat.id)
                        setShowCategories(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-sky-light/30 transition-colors ${
                        editCategory === cat.id ? 'bg-sky-light/50 text-ocean' : 'text-night'
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

          {/* Pulsanti salva/annulla */}
          <button
            onClick={handleCancel}
            className="p-2 text-slate hover:text-night hover:bg-cloud rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={!editName.trim()}
            className="p-2 bg-sky text-white rounded-lg hover:bg-ocean disabled:opacity-50 transition-all"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Modalita' visualizzazione normale
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-white rounded-xl shadow-soft transition-all relative ${
        checked ? 'opacity-60' : ''
      }`}
    >
      {/* Gradient rosato per preferiti */}
      {isProductFavorite && !checked && (
        <>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-rose-200/60 via-rose-100/30 to-transparent rounded-tr-xl pointer-events-none" />
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center z-10">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </>
      )}

      {/* Riga principale */}
      <div
        onClick={handleTogglePrices}
        className={`group flex items-center gap-2 p-3 ${
          productPrices.length > 0 && !checked ? 'cursor-pointer' : ''
        } ${!checked ? 'card-hover' : ''}`}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            checked
              ? 'bg-sky border-sky'
              : 'border-slate-light hover:border-sky'
          }`}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`font-medium truncate transition-all ${
              checked ? 'text-slate line-through' : 'text-night'
            }`}>
              {name}
            </p>
            {/* Indicatore prezzi disponibili */}
            {productPrices.length > 0 && !checked && (
              <ChevronDown
                className={`w-4 h-4 text-slate transition-transform flex-shrink-0 ${
                  showPrices ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate">
            {(quantity > 1 || unit !== 'pz') && (
              <span>
                {unit === 'pz' || unit === 'conf' ? quantity : quantity.toFixed(1).replace('.0', '')} {unit}
              </span>
            )}
            {price && (
              <span className={checked ? '' : 'text-ocean font-medium'}>
                {(price * quantity).toFixed(2).replace('.', ',')} €
              </span>
            )}
          </div>
        </div>

        {/* Menu azioni */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1.5 text-slate hover:text-night hover:bg-cloud rounded-lg transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-xl border border-cloud z-[100] py-1 min-w-[140px]"
              >
                {!checked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite({ name, category, unit, quantity, price })
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-night hover:bg-sky-light/30 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isProductFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate'}`} />
                    <span>{isProductFavorite ? 'Rimuovi' : 'Preferito'}</span>
                  </button>
                )}
                {!checked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-night hover:bg-sky-light/30 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-slate" />
                    <span>Modifica</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-error-light transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Elimina</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sezione prezzi espandibile */}
      <AnimatePresence>
        {showPrices && productPrices.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-cloud/50 overflow-hidden">
              <p className="text-xs font-medium text-slate mb-2">Confronta prezzi</p>
              <div className="space-y-1.5 overflow-hidden">
                {productPrices.map((priceInfo, idx) => {
                  const supermarket = getSupermarketById(priceInfo.supermarketId)
                  const isBest = idx === 0

                  return (
                    <div
                      key={priceInfo.supermarketId}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm min-w-0 overflow-hidden ${
                        isBest
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      {/* Colore supermercato */}
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: supermarket?.color }}
                      />

                      {/* Nome e indirizzo supermercato */}
                      <div className="flex-1 min-w-0">
                        <span className={`block ${isBest ? 'font-medium text-green-800' : 'text-gray-700'}`}>
                          {supermarket?.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate block">
                          {supermarket?.address}
                        </span>
                      </div>

                      {/* Prezzo */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {priceInfo.onSale ? (
                          <>
                            <span className="line-through text-gray-400 text-xs">
                              {formatPrice(priceInfo.price)}
                            </span>
                            <span className="text-orange-600 font-medium">
                              {formatPrice(priceInfo.salePrice)}
                            </span>
                            <Tag className="w-3.5 h-3.5 text-orange-500" />
                          </>
                        ) : (
                          <span className={isBest ? 'font-medium text-green-700' : ''}>
                            {formatPrice(priceInfo.effectivePrice)}
                          </span>
                        )}
                        {isBest && <Star className="w-3.5 h-3.5 text-green-600 fill-current" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
