import { motion } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import CategoryIcon from './ui/CategoryIcon'

export default function ProductItem({ item, onToggle, onDelete }) {
  const { name, quantity, category, checked } = item

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
        {quantity > 1 && (
          <p className="text-xs text-slate">
            Quantità: {quantity}
          </p>
        )}
      </div>

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
