import { useState, useCallback } from 'react'

const STORAGE_KEY = 'lista-spesa-onboarding-done'
const LISTS_KEY = 'lista-spesa-lists'

// Traccia se l'onboarding di prima apertura è già stato completato/saltato.
// In caso di errore localStorage si assume "fatto" per non intrappolare l'utente.
// Gli utenti che hanno già delle liste (installazione preesistente) non vedono
// l'onboarding: viene mostrato solo a chi apre l'app davvero da zero.
function isOnboardingDone() {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return true
    const savedLists = localStorage.getItem(LISTS_KEY)
    if (savedLists) {
      const lists = JSON.parse(savedLists)
      if (Array.isArray(lists) && lists.length > 0) return true
    }
    return false
  } catch {
    return true
  }
}

export function useOnboarding() {
  const [done, setDone] = useState(isOnboardingDone)

  const complete = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* no-op */
    }
    setDone(true)
  }, [])

  return { needsOnboarding: !done, complete }
}
