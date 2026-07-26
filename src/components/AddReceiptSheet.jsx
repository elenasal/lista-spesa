import { useState, useEffect, useRef, useMemo } from 'react'
import { Camera, Wallet, Tag, Calendar, Store, Check, ScanLine } from 'lucide-react'
import { getSupermarketsByDistance } from '../data/supermarkets'
import SelectDropdown from './ui/SelectDropdown'
import BottomSheet from './ui/BottomSheet'

// Aggiunta scontrino: foto + inserimento assistito. L'OCR reale (prefill da foto) = dev.
export default function AddReceiptSheet({ isOpen, onClose, onAdd, defaultDate }) {
  const [supermarketId, setSupermarketId] = useState(null)
  const [date, setDate] = useState(defaultDate)
  const [total, setTotal] = useState('')
  const [saved, setSaved] = useState('')
  const [photo, setPhoto] = useState(null)
  const fileRef = useRef(null)

  const supermarketOptions = useMemo(
    () => getSupermarketsByDistance().map((sm) => ({ value: sm.id, label: sm.name, color: sm.color })),
    []
  )

  // Reset dei campi ad ogni apertura
  useEffect(() => {
    if (!isOpen) return
    setSupermarketId(null)
    setDate(defaultDate)
    setTotal('')
    setSaved('')
    setPhoto(null)
  }, [isOpen, defaultDate])

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const canSave = supermarketId && (Number(total) || 0) > 0

  const handleSave = () => {
    if (!canSave) return
    onAdd({ supermarketId, date, total, saved, photo })
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <h3 className="text-lg font-bold text-night">Aggiungi scontrino</h3>

        {/* Foto scontrino */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-cloud text-slate hover:border-sky hover:text-ocean transition-colors overflow-hidden"
        >
          {photo ? (
            <img src={photo} alt="Scontrino" className="max-h-40 rounded-lg object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-1">
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">Fotografa lo scontrino</span>
              <span className="text-[11px] text-slate-light flex items-center gap-1">
                <ScanLine className="w-3 h-3" /> lettura automatica in arrivo
              </span>
            </span>
          )}
        </button>

        {/* Supermercato */}
        <div>
          <label className="text-xs font-semibold text-slate uppercase tracking-wider">Supermercato</label>
          <div className="mt-2">
            <SelectDropdown
              value={supermarketId}
              onChange={setSupermarketId}
              options={supermarketOptions}
              allLabel="Scegli supermercato"
              placeholder="Supermercato"
              icon={<Store className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Data */}
        <div>
          <label className="text-xs font-semibold text-slate uppercase tracking-wider">Data</label>
          <div className="flex items-center gap-2 px-3 py-2.5 mt-2 bg-white border border-cloud rounded-xl">
            <Calendar className="w-4 h-4 text-slate flex-shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-night focus:outline-none"
            />
          </div>
        </div>

        {/* Speso + Risparmiato */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-slate uppercase tracking-wider">Speso</label>
            <div className="flex items-center gap-2 px-3 py-2.5 mt-2 bg-white border border-cloud rounded-xl">
              <Wallet className="w-4 h-4 text-ocean flex-shrink-0" />
              <input
                type="number" inputMode="decimal" step="0.01" min="0"
                autoComplete="off" data-lpignore="true" data-form-type="other"
                value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0,00"
                className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
              />
              <span className="text-slate text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate uppercase tracking-wider">Risparmiato</label>
            <div className="flex items-center gap-2 px-3 py-2.5 mt-2 bg-white border border-cloud rounded-xl">
              <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <input
                type="number" inputMode="decimal" step="0.01" min="0"
                autoComplete="off" data-lpignore="true" data-form-type="other"
                value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0,00"
                className="flex-1 min-w-0 bg-transparent text-night placeholder:text-slate-light focus:outline-none"
              />
              <span className="text-slate text-sm">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer azioni */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-cloud bg-white">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-deep disabled:opacity-50 transition-all shadow-soft"
        >
          <Check className="w-5 h-5" />
          Salva scontrino
        </button>
        <button onClick={onClose} className="px-3 h-11 flex-shrink-0 text-ocean font-semibold text-sm">
          Annulla
        </button>
      </div>
    </BottomSheet>
  )
}
