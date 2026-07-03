import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

/**
 * Card con swipe sinistro per rivelare azioni
 *
 * Props:
 * - children: contenuto della card
 * - actions: array di { icon, label, color, bgColor, onClick }
 * - onTap: callback quando si clicca sulla card (non sulle azioni)
 * - className: classi aggiuntive per la card
 */
export default function SwipeableCard({
  children,
  actions = [],
  onTap,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const constraintsRef = useRef(null)

  const x = useMotionValue(0)

  // Calcola larghezza azioni (ogni azione ~60px)
  const actionsWidth = actions.length * 64

  // Opacità delle azioni basata sullo swipe
  const actionsOpacity = useTransform(x, [-actionsWidth, -20, 0], [1, 0.5, 0])

  const handleDragEnd = (_, info) => {
    const threshold = actionsWidth / 2

    if (info.offset.x < -threshold) {
      // Apri azioni
      animate(x, -actionsWidth, { type: 'spring', stiffness: 500, damping: 30 })
      setIsOpen(true)
    } else {
      // Chiudi
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
      setIsOpen(false)
    }
  }

  const handleTap = () => {
    if (isOpen) {
      // Se aperto, chiudi
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
      setIsOpen(false)
    } else if (onTap) {
      onTap()
    }
  }

  const handleActionClick = (action, e) => {
    e.stopPropagation()
    action.onClick()
    // Chiudi dopo azione
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
    setIsOpen(false)
  }

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Azioni nascoste dietro */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ opacity: actionsOpacity }}
      >
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={(e) => handleActionClick(action, e)}
            className="w-16 flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ backgroundColor: action.bgColor }}
          >
            <span style={{ color: action.color }}>{action.icon}</span>
            {action.label && (
              <span className="text-xs font-medium" style={{ color: action.color }}>
                {action.label}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Card principale */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        className={`relative bg-white cursor-pointer ${className}`}
      >
        {children}
      </motion.div>
    </div>
  )
}
