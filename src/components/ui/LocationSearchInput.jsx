import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Locate, X, Loader2 } from 'lucide-react'
import CEInput from './CEInput'
import { useGeocodeSearch } from '../../hooks/useGeocodeSearch'
import { useLocationContext } from '../../contexts/LocationContext'

/**
 * Campo di ricerca località riutilizzabile con autocomplete Nominatim.
 *
 * Comportamento chiave:
 * - La SELEZIONE di un suggerimento È la conferma: imposta label+coords nel
 *   contesto condiviso (setLocation). Nessun bottone "invia".
 * - Bottone GPS opzionale (showGpsButton): chiama requestLocation, che fa reverse
 *   geocoding per ottenere il nome-luogo reale.
 * - Fallback robusto: se nessun risultato / servizio giù, premendo Invio si usa
 *   il testo digitato come label manuale (setLabel). Il campo non si blocca mai.
 * - Attribuzione OSM mostrata nel footer del dropdown (usage policy).
 *
 * Props: placeholder, showGpsButton (default true), className (contenitore),
 * inputClassName (campo testo).
 */
export default function LocationSearchInput({
  placeholder = 'Cerca una posizione...',
  showGpsButton = true,
  className = '',
  inputClassName = '',
}) {
  const { label, status, setLocation, setLabel, requestLocation } = useLocationContext()

  // Stato locale del testo: inizializzato dalla label e risincronizzato SOLO
  // quando la label cambia dall'esterno (GPS, select), non mentre si digita.
  const [query, setQuery] = useState(label || '')
  const [open, setOpen] = useState(false)
  const prevLabel = useRef(label || '')
  const containerRef = useRef(null)

  const { results, loading, error } = useGeocodeSearch(open ? query : '')

  useEffect(() => {
    if (label !== prevLabel.current) {
      setQuery(label || '')
      prevLabel.current = label || ''
    }
  }, [label])

  // Chiudi il dropdown cliccando fuori dal componente
  useEffect(() => {
    if (!open) return
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [open])

  const handleChange = (text) => {
    setQuery(text)
    if (!open) setOpen(true)
  }

  // Selezione = conferma: label + coords atomiche nel contesto.
  const handleSelect = (sugg) => {
    setLocation({ label: sugg.label, coords: { lat: sugg.lat, lng: sugg.lng } })
    setQuery(sugg.label)
    prevLabel.current = sugg.label
    setOpen(false)
  }

  // Invio senza selezione → testo digitato come label manuale (fallback).
  const handleEnter = () => {
    const q = query.trim()
    if (q) {
      setLabel(q)
      prevLabel.current = q
    }
    setOpen(false)
  }

  const handleClear = () => {
    setLabel('')
    setQuery('')
    prevLabel.current = ''
    setOpen(false)
  }

  const showDropdown = open && query.trim().length >= 3
  const showEmpty = showDropdown && !loading && results.length === 0

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 px-3 h-[42px] box-border bg-white border border-cloud rounded-xl focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors ${className}`}
      >
        <MapPin className="w-4 h-4 text-slate flex-shrink-0" />
        <CEInput
          value={query}
          onChange={handleChange}
          onEnter={handleEnter}
          onEscape={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          ariaLabel="Cerca una posizione"
          enterKeyHint="search"
          className={`flex-1 min-w-0 text-sm text-night ${inputClassName}`}
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-slate hover:text-night flex-shrink-0"
            aria-label="Cancella"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {showGpsButton && (
          <>
            <div className="w-px h-5 bg-cloud flex-shrink-0" />
            <button
              onClick={requestLocation}
              className={`grid place-items-center w-7 h-7 -mr-1 rounded-full transition-all flex-shrink-0 ${
                status === 'granted'
                  ? 'text-emerald-500'
                  : 'text-ocean hover:bg-sky-light/60'
              }`}
              title={status === 'denied' ? 'Posizione non disponibile' : 'Usa la mia posizione'}
              aria-label="Usa la mia posizione"
            >
              <Locate className={`w-4 h-4 ${status === 'loading' ? 'animate-pulse' : ''}`} />
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-soft-lg border border-cloud z-50 overflow-hidden"
          >
            {loading && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate">
                <Loader2 className="w-4 h-4 animate-spin text-ocean flex-shrink-0" />
                Ricerca in corso…
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="max-h-64 overflow-y-auto py-1">
                {results.map((sugg) => (
                  <button
                    key={sugg.id}
                    onClick={() => handleSelect(sugg)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-sky-light/30 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-slate flex-shrink-0" />
                    <span className="flex-1 min-w-0 truncate text-night">{sugg.label}</span>
                  </button>
                ))}
              </div>
            )}

            {showEmpty && (
              <div className="px-3 py-3">
                <p className="text-sm text-night font-medium">
                  {error ? 'Servizio non raggiungibile' : 'Nessun luogo trovato'}
                </p>
                <p className="text-xs text-slate mt-0.5">
                  Premi Invio per usare «{query.trim()}» come zona.
                </p>
              </div>
            )}

            {/* Attribuzione richiesta dalla usage policy Nominatim/OSM */}
            <div className="px-3 py-1.5 border-t border-cloud bg-snow">
              <p className="text-[11px] text-slate-light text-right">Dati © OpenStreetMap</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
