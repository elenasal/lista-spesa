import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

// Bottom sheet riutilizzabile: overlay scurito + pannello dal basso con maniglia e
// chiusura trascinando (solo dalla maniglia) / swipe giù / tap sullo sfondo.
// Centralizza anche la chiusura della tastiera su mobile (blur) per evitare che
// resti aperta quando si trascina giù il pannello.
//
// Props:
// - isOpen, onClose
// - fullHeight: pannello ad altezza fissa (chat/lista lunga) invece che a contenuto
// - z: classe z-index dell'overlay (default 'z-50'; usare più alto se aperto sopra un altro overlay)
// - children: contenuto (struttura flex-col: es. area scrollabile + footer)
export default function BottomSheet({ isOpen, onClose, fullHeight = false, z = 'z-50', children }) {
  const dragControls = useDragControls()

  // Blocca lo scroll del body mentre è aperto
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  const dismissKeyboard = () => {
    const el = document.activeElement
    if (el instanceof HTMLElement) el.blur()
  }

  const close = () => {
    dismissKeyboard()
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 ${z} flex flex-col justify-end`}
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
          onClick={close}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) close() }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-soft-lg flex flex-col ${
              fullHeight ? 'h-[calc(100dvh-2.5rem)]' : 'max-h-[calc(100dvh-2.5rem)]'
            }`}
          >
            {/* Maniglia — unica zona che chiude col trascinamento; chiude anche la tastiera */}
            <div
              onPointerDown={(e) => { dismissKeyboard(); dragControls.start(e) }}
              className="flex-shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="w-11 h-1.5 rounded-full bg-cloud" />
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
