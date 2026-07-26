import { createContext, useContext } from 'react'
import { useLocation } from '../hooks/useLocation'

// Stato posizione condiviso in tutta l'app (catalogo, onboarding, lista, supermercati),
// così la "zona" e le distanze reali sono un'unica fonte.
const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const value = useLocation()
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocationContext() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocationContext deve stare dentro <LocationProvider>')
  return ctx
}
