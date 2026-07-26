import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Plus, ListPlus, Wallet, Store, Check } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { getSupermarketById } from '../data/supermarkets'
import SelectDropdown from './ui/SelectDropdown'

// Barra fissa in basso + bottom sheet (maniglia, drag-to-close) per creare una
// nuova lista in home. Stessa meccanica di AddProductSheet. Form nello stile del
// passo "Prima lista" dell'onboarding (nome · tipo generica/supermercato · budget).
export default function AddListSheet({ onCreateList }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [supermarketId, setSupermarketId] = useState(null)
  const [budget, setBudget] = useState('')
  const dragControls = useDragControls()

  const { favorites: favSupermarketIds } = useFavoriteSupermarkets()
  const supermarketOptions = favSupermarketIds
    .map(getSupermarketById)
    .filter(Boolean)
    .map((sm) => ({ value: sm.id, label: sm.name, color: sm.color }))

  // Blocca lo scroll del body mentre il pannello è aperto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const dismissKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  const openSheet = () => {
    setName('')
    setSupermarketId(null)
    setBudget('')
    setOpen(true)
  }

  const closeSheet = () => {
    dismissKeyboard()
    setOpen(false)
  }

  const handleCreate = () => {
    if (!name.trim()) return
    // onCreateList crea la lista e naviga già dentro (la home + questo footer si smontano)
    onCreateList(name, supermarketId || null, budget || null)
    setOpen(false)
  }

  return (
    <>
      {/* Barra fissa in basso (chiusa) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#c8eeff] shadow-[0_-2px_12px_rgba(14,165,233,0.10)]">
        <div className="max-w-lg mx-auto px-3 py-3">
          <button
            onClick={openSheet}
            className="w-full flex items-center gap-3 pl-4 pr-2 py-2.5 bg-white rounded-2xl shadow-soft-lg border border-cloud"
          >
            <span className="flex-1 text-left text-slate-light">Nuova lista...</span>
            <span className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-sky to-ocean text-white rounded-xl shadow-soft">
              <Plus className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>

      {/* Bottom sheet aperto */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col justify-end"
              initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
              animate={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
              onClick={closeSheet}
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
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) closeSheet()
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-soft-lg flex flex-col max-h-[calc(100dvh-2.5rem)]"
              >
                {/* Maniglia — unica zona che chiude col trascinamento */}
                <div
                  onPointerDown={(e) => { dismissKeyboard(); dragControls.start(e) }}
                  className="flex-shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
                >
                  <div className="w-11 h-1.5 rounded-full bg-cloud" />
                </div>

                {/* Contenuto */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                  <h3 className="text-lg font-bold text-night">Nuova lista</h3>

                  {/* Nome */}
                  <div>
                    <label className="text-xs font-semibold text-slate uppercase tracking-wider">Nome della lista</label>
                    <div className="flex items-center gap-2.5 px-3 py-3 mt-2 bg-white border border-cloud rounded-xl shadow-soft focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors">
                      <ListPlus className="w-5 h-5 text-slate flex-shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                        placeholder="Es. Spesa della settimana"
                        className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Tipo di lista */}
                  <div>
                    <label className="text-xs font-semibold text-slate uppercase tracking-wider">Tipo di lista</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => setSupermarketId(null)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          supermarketId === null
                            ? 'border-ocean bg-sky-light/30 text-ocean'
                            : 'border-cloud text-slate hover:border-sky/50'
                        }`}
                      >
                        {supermarketId === null && <Check className="w-4 h-4" />}
                        Generica
                      </button>
                      <SelectDropdown
                        value={supermarketId}
                        onChange={setSupermarketId}
                        options={supermarketOptions}
                        allLabel="Scegli supermercato"
                        placeholder="Supermercato"
                        icon={<Store className="w-4 h-4" />}
                      />
                    </div>
                    {supermarketOptions.length === 0 && (
                      <p className="text-xs text-slate-light mt-2">
                        Aggiungi un supermercato ai preferiti per poterci legare una lista.
                      </p>
                    )}
                  </div>

                  {/* Budget (facoltativo) */}
                  <div>
                    <label className="text-xs font-semibold text-slate uppercase tracking-wider">Budget (facoltativo)</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 mt-2 bg-white border border-cloud rounded-xl shadow-soft">
                      <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                        placeholder="0,00"
                        className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
                      />
                      <span className="text-slate text-sm flex-shrink-0">€</span>
                    </div>
                  </div>
                </div>

                {/* Footer azioni */}
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-cloud bg-[#c8eeff]">
                  <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-deep disabled:opacity-50 transition-all shadow-soft"
                  >
                    <Plus className="w-5 h-5" />
                    Crea lista
                  </button>
                  <button
                    onClick={closeSheet}
                    className="px-3 h-11 flex-shrink-0 text-ocean font-semibold text-sm"
                  >
                    Annulla
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
