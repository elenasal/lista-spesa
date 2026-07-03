import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical } from 'lucide-react'

/**
 * Menu dropdown con tre puntini
 *
 * Props:
 * - actions: array di { icon, label, color, onClick, danger }
 */
export default function DropdownMenu({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (action) => {
    setIsOpen(false)
    action.onClick()
  }

  if (actions.length === 0) return null

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-2 text-slate hover:text-night hover:bg-cloud rounded-lg transition-colors"
        aria-label="Menu azioni"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 min-w-[160px] bg-white rounded-xl shadow-lg border border-cloud z-50 py-1 overflow-hidden"
          >
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(action)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  action.danger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-night hover:bg-sky-light/30'
                }`}
              >
                <span className={action.danger ? 'text-rose-500' : 'text-slate'}>
                  {action.icon}
                </span>
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
