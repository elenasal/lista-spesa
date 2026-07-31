import { useState } from 'react'
import { Plus, ListPlus, Wallet, Store, Check } from 'lucide-react'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { getSupermarketById } from '../data/supermarkets'
import SelectDropdown from './ui/SelectDropdown'
import BottomSheet from './ui/BottomSheet'
import CEInput from './ui/CEInput'

// Barra fissa in basso + bottom sheet per creare una nuova lista in home.
// Form nello stile del passo "Prima lista" dell'onboarding.
export default function AddListSheet({ onCreateList }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [supermarketId, setSupermarketId] = useState(null)
  const [budget, setBudget] = useState('')

  const { favorites: favSupermarketIds } = useFavoriteSupermarkets()
  const supermarketOptions = favSupermarketIds
    .map(getSupermarketById)
    .filter(Boolean)
    .map((sm) => ({ value: sm.id, label: sm.name, color: sm.color }))

  const openSheet = () => {
    setName('')
    setSupermarketId(null)
    setBudget('')
    setOpen(true)
  }

  const handleCreate = () => {
    if (!name.trim()) return
    // onCreateList crea la lista e naviga già dentro (la home + questo footer si smontano)
    onCreateList(name, supermarketId || null, budget || null)
    setOpen(false)
  }

  return (
    <>
      {/* FAB "Nuova lista" — bottom-right, appena sopra la tab bar (~64px).
          Il campanello notifiche ora vive nell'header (Phase 3), quindi il FAB
          non è più impilato su di esso: posizione bassa e pulita. */}
      <button
        onClick={openSheet}
        aria-label="Nuova lista"
        title="Nuova lista"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-ocean text-white shadow-soft-lg hover:brightness-105 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <h3 className="text-lg font-bold text-night">Nuova lista</h3>

          {/* Nome */}
          <div>
            <label className="text-xs font-semibold text-slate uppercase tracking-wider">Nome della lista</label>
            <div className="flex items-center gap-2.5 px-3 py-3 mt-2 bg-white border border-cloud rounded-xl shadow-soft focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors">
              <ListPlus className="w-5 h-5 text-slate flex-shrink-0" />
              <CEInput
                autoFocus
                value={name}
                onChange={setName}
                onEnter={handleCreate}
                placeholder="Es. Spesa della settimana"
                ariaLabel="Nome della lista"
                className="flex-1 min-w-0 text-night"
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
                type="number" inputMode="decimal" step="0.01" min="0"
                autoComplete="off" data-lpignore="true" data-form-type="other"
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
            onClick={() => setOpen(false)}
            className="px-3 h-11 flex-shrink-0 text-ocean font-semibold text-sm"
          >
            Annulla
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
