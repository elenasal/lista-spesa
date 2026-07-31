import { useState, useEffect } from 'react'

// Ricerca località via Nominatim (OpenStreetMap), client-side, senza backend né
// chiave API. Rispetta la usage policy: debounce, min caratteri, limit, scope
// Italia, abort delle richieste stale. L'attribuzione OSM va mostrata dal
// consumer (LocationSearchInput).
//
// GOTCHA: Nominatim restituisce lat/lon come STRINGHE e usa `lon`. Qui li
// convertiamo in NUMERI e rinominiamo lon→lng, così la forma {lat,lng} numerica
// combacia con quella del GPS e di distanceKm().

const SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'
const DEBOUNCE_MS = 400
const MIN_CHARS = 3
const LIMIT = 6

// Compone un'etichetta concisa dall'oggetto `address` di Nominatim.
// Preferisce comune (city|town|village|municipality) + provincia/CAP; se manca,
// accorcia `display_name` alle prime parti.
function composeLabel(item) {
  const a = item.address || {}
  const place =
    a.city || a.town || a.village || a.municipality || a.hamlet || a.county || null
  const region = a.province || a.county || a.state || a.postcode || null

  if (place) {
    return region && region !== place ? `${place}, ${region}` : place
  }
  if (item.display_name) {
    return item.display_name.split(',').slice(0, 2).join(',').trim()
  }
  return ''
}

function parseResult(item) {
  return {
    id: String(item.place_id ?? `${item.lat},${item.lon}`),
    label: composeLabel(item),
    lat: Number(item.lat),
    lng: Number(item.lon), // lon → lng, come NUMERO
  }
}

// Reverse geocoding: da coordinate a nome-luogo reale. Ritorna la label composta
// oppure `null` in caso di errore/nessun risultato (mai lancia).
export async function reverseGeocode(lat, lng) {
  try {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lng),
      'accept-language': 'it',
      zoom: '14',
      addressdetails: '1',
    })
    const res = await fetch(`${REVERSE_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.error) return null
    const label = composeLabel(data)
    return label || null
  } catch {
    return null
  }
}

// Hook di autocomplete: dato `query`, restituisce { results, loading, error }.
// Nessuna chiamata sotto MIN_CHARS; debounce DEBOUNCE_MS; abort della richiesta
// precedente ad ogni nuova query per evitare race condition.
export function useGeocodeSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = (query || '').trim()

    if (q.length < MIN_CHARS) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    let active = true

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          countrycodes: 'it',
          addressdetails: '1',
          limit: String(LIMIT),
          'accept-language': 'it',
          q,
        })
        const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Nominatim ${res.status}`)
        const data = await res.json()
        if (!active) return
        setResults(Array.isArray(data) ? data.map(parseResult) : [])
      } catch (err) {
        if (err.name === 'AbortError' || !active) return
        setError(err)
        setResults([])
      } finally {
        if (active) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { results, loading, error }
}
