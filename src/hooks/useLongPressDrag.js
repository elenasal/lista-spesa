import { useRef, useCallback } from 'react'

/**
 * Avvia un drag di framer-motion (Reorder) solo dopo un long press sulla maniglia,
 * così un semplice tocco/scroll non fa partire il trascinamento per sbaglio.
 *
 * - delay: ms da tenere premuto prima di agganciare il drag
 * - moveThreshold: px di movimento oltre i quali si annulla (l'utente sta scrollando)
 *
 * Ritorna gli handler da spalmare sul bottone maniglia (onPointerDown/Move/Up/Leave).
 */
export function useLongPressDrag(dragControls, { delay = 250, moveThreshold = 8 } = {}) {
  const timer = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const onPointerDown = useCallback((e) => {
    startPos.current = { x: e.clientX, y: e.clientY }
    dragging.current = false
    clearTimer()
    timer.current = setTimeout(() => {
      dragging.current = true
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15)
      dragControls.start(e)
    }, delay)
  }, [dragControls, delay, clearTimer])

  const onPointerMove = useCallback((e) => {
    if (dragging.current) return
    const dx = Math.abs(e.clientX - startPos.current.x)
    const dy = Math.abs(e.clientY - startPos.current.y)
    // Movimento prima del long press => sta scrollando: annulla
    if (dx > moveThreshold || dy > moveThreshold) clearTimer()
  }, [clearTimer, moveThreshold])

  const onPointerUp = useCallback(() => clearTimer(), [clearTimer])
  const onPointerLeave = useCallback(() => clearTimer(), [clearTimer])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave }
}
