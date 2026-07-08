import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Pencil, Wallet } from 'lucide-react'

/**
 * Modal per modificare una lista (nome e budget)
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - list: { id, name, budget } | null
 * - onSave: ({ name, budget }) => void
 */
export default function EditListModal({ isOpen, onClose, list, onSave }) {
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')

  // Popola form quando si apre
  useEffect(() => {
    if (list) {
      setName(list.name || '')
      setBudget(list.budget != null ? String(list.budget) : '')
    }
  }, [list, isOpen])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), budget: budget !== '' ? budget : null })
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    else if (e.key === 'Escape') onClose()
  }

  if (!isOpen || !list) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-cloud flex items-center gap-3 bg-sky-light/40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-ocean">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-night">Modifica lista</h2>
              <p className="text-sm text-slate">Cambia nome e budget</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate hover:text-night hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-night mb-1.5">
                Nome della lista
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Es. Spesa settimanale"
                className="w-full px-3 py-2.5 bg-snow border border-cloud rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-night mb-1.5">
                Budget (opzionale)
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-snow border border-cloud rounded-xl focus-within:border-sky focus-within:ring-1 focus-within:ring-sky">
                <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0,00"
                  className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
                />
                <span className="text-slate text-sm flex-shrink-0">€</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cloud flex gap-2">
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-slate hover:bg-cloud rounded-xl font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2.5 bg-ocean text-white hover:bg-deep rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salva
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
