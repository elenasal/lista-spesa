import { useState, useCallback } from 'react'
import { reverseGeocode } from './useGeocodeSearch'

const STORAGE_KEY = 'lista-spesa-location'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { coords: null, label: '' }
  } catch {
    return { coords: null, label: '' }
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* no-op */
  }
}

// Gestisce la posizione dell'utente: richiesta reale via Geolocation API,
// etichetta zona (testo) e persistenza. Le distanze reali si calcolano altrove
// (supermarkets.distanceKm) usando `coords`.
export function useLocation() {
  const initial = load()
  const [coords, setCoords] = useState(initial.coords) // { lat, lng } | null
  const [label, setLabelState] = useState(initial.label || '')
  const [status, setStatus] = useState(initial.coords ? 'granted' : 'idle') // idle|loading|granted|denied

  const setLabel = useCallback((next) => {
    setLabelState(next)
    persist({ coords, label: next })
  }, [coords])

  // Imposta coords E label atomicamente (usato dalla selezione di un suggerimento
  // di ricerca: la select È la conferma) e persiste. `coords` in formato
  // { lat, lng } numerico, compatibile con distanceKm().
  const setLocation = useCallback(({ coords: nextCoords, label: nextLabel }) => {
    setCoords(nextCoords ?? null)
    setLabelState(nextLabel ?? '')
    setStatus(nextCoords ? 'granted' : 'idle')
    persist({ coords: nextCoords ?? null, label: nextLabel ?? '' })
  }, [])

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('denied')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(next)
        setStatus('granted')
        // Reverse geocoding → nome-luogo reale; fallback "La mia posizione" se
        // il reverse fallisce. Le coords sono comunque già impostate.
        let nextLabel = 'La mia posizione'
        try {
          const resolved = await reverseGeocode(next.lat, next.lng)
          if (resolved) nextLabel = resolved
        } catch {
          /* fallback già pronto */
        }
        setLabelState(nextLabel)
        persist({ coords: next, label: nextLabel })
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  return { coords, label, status, setLabel, setLocation, requestLocation }
}
