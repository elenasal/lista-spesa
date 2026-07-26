import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search, X } from 'lucide-react'

/**
 * Dropdown a selezione singola, pensato per elenchi anche lunghi
 * (ricerca interna + scroll). Usato nei filtri del catalogo.
 *
 * Props:
 * - value: valore selezionato (o null = "tutti")
 * - onChange: (value|null) => void
 * - options: array di { value, label, color? }
 * - allLabel: etichetta dell'opzione che azzera il filtro (default "Tutti")
 * - placeholder: testo mostrato quando nulla è selezionato (default = allLabel)
 * - icon: nodo icona mostrato nel trigger
 * - searchable: mostra il campo di ricerca nel pannello (default true se >8 opzioni)
 */
export default function SelectDropdown({
  value,
  onChange,
  options = [],
  allLabel = 'Tutti',
  placeholder,
  icon = null,
  searchable,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  const showSearch = searchable ?? options.length > 8

  // Chiudi cliccando fuori
  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', onOutside)
      document.addEventListener('touchstart', onOutside)
    }
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [isOpen])

  // Reset ricerca alla chiusura
  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  const selected = options.find((o) => o.value === value) || null

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const handlePick = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl text-sm transition-colors ${
          isOpen ? 'border-sky ring-2 ring-sky/20' : 'border-cloud hover:border-sky'
        }`}
      >
        {selected?.color ? (
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
        ) : (
          icon && <span className="text-slate flex-shrink-0">{icon}</span>
        )}
        <span className={`flex-1 min-w-0 truncate text-left ${selected ? 'text-night font-medium' : 'text-slate'}`}>
          {selected ? selected.label : (placeholder || allLabel)}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-cloud z-50 overflow-hidden"
          >
            {showSearch && (
              <div className="p-2 border-b border-cloud">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-snow rounded-lg">
                  <Search className="w-4 h-4 text-slate flex-shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca..."
                    className="flex-1 min-w-0 bg-transparent text-sm text-night placeholder:text-slate-light focus:outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-slate hover:text-night" aria-label="Cancella">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto py-1">
              {/* Opzione "tutti" */}
              <button
                onClick={() => handlePick(null)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-sky-light/30 transition-colors"
              >
                <span className="flex-1 min-w-0 truncate text-night">{allLabel}</span>
                {value === null && <Check className="w-4 h-4 text-ocean flex-shrink-0" />}
              </button>

              {filtered.map((o) => (
                <button
                  key={o.value}
                  onClick={() => handlePick(o.value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-sky-light/30 transition-colors"
                >
                  {o.color && (
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                  )}
                  <span className={`flex-1 min-w-0 truncate ${value === o.value ? 'font-medium text-night' : 'text-slate'}`}>
                    {o.label}
                  </span>
                  {value === o.value && <Check className="w-4 h-4 text-ocean flex-shrink-0" />}
                </button>
              ))}

              {filtered.length === 0 && (
                <p className="px-3 py-4 text-sm text-slate-light text-center">Nessun risultato</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
