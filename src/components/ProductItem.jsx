import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Pencil, X, ChevronDown } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'

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

export default function ProductItem({ item, onToggle, onDelete, onUpdate }) {
  const { name, quantity, category, price, checked } = item
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editCategory, setEditCategory] = useState(category)
  const [showCategories, setShowCategories] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

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
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStartEdit = () => {
    setEditName(name)
    setEditCategory(category)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(item.id, {
        name: editName.trim(),
        category: editCategory
      })
    }
    setIsEditing(false)
    setShowCategories(false)
  }

  const handleCancel = () => {
    setEditName(name)
    setEditCategory(category)
    setIsEditing(false)
    setShowCategories(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const selectedCategory = CATEGORIES.find(c => c.id === editCategory)

  // Modalita' editing
  if (isEditing) {
    return (
      <motion.div
        layout
        className="flex flex-col gap-2 p-3 bg-white rounded-xl shadow-soft border-2 border-sky"
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
                  className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-soft-lg border border-cloud z-20 py-1 max-h-48 overflow-y-auto"
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
      className={`group flex items-center gap-3 p-3 bg-white rounded-xl shadow-soft transition-all ${
        checked ? 'opacity-60' : 'card-hover'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
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

      {/* Category icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
        checked ? 'bg-cloud' : 'bg-sky-light/50'
      }`}>
        <CategoryIcon category={category} className={checked ? 'text-slate' : 'text-ocean'} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate transition-all ${
          checked ? 'text-slate line-through' : 'text-night'
        }`}>
          {name}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate">
          {quantity > 1 && <span>Qtà: {quantity}</span>}
          {price && (
            <span className={checked ? '' : 'text-ocean font-medium'}>
              {(price * quantity).toFixed(2).replace('.', ',')} €
            </span>
          )}
        </div>
      </div>

      {/* Edit button */}
      {!checked && (
        <button
          onClick={handleStartEdit}
          className="flex-shrink-0 p-2 text-slate-light opacity-0 group-hover:opacity-100 hover:text-ocean hover:bg-sky-light/30 rounded-lg transition-all"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 p-2 text-slate-light opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error-light rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
