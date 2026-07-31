import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Receipt, Wallet, Tag, Plus, Trash2, Camera } from 'lucide-react'
import { useReceipts } from '../hooks/useReceipts'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { getSupermarketById } from '../data/supermarkets'
import AddReceiptSheet from './AddReceiptSheet'

const euro = (n) => `${(n || 0).toFixed(2).replace('.', ',')} €`
const today = () => new Date().toISOString().slice(0, 10)
const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function ReceiptsDashboard() {
  const { receipts, addReceipt, removeReceipt, summaryBySupermarket, totals } = useReceipts()
  const { favorites: favoriteIds } = useFavoriteSupermarkets()
  const [showAdd, setShowAdd] = useState(false)

  // Supermercati da mostrare: preferiti + quelli con scontrini
  const cards = useMemo(() => {
    const byId = Object.fromEntries(summaryBySupermarket.map((s) => [s.supermarketId, s]))
    const ids = new Set([...favoriteIds, ...summaryBySupermarket.map((s) => s.supermarketId)])
    return [...ids]
      .map((id) => ({ supermarket: getSupermarketById(id), summary: byId[id] || { spent: 0, saved: 0, count: 0, offerPercent: 0 } }))
      .filter((c) => c.supermarket)
      .sort((a, b) => b.summary.spent - a.summary.spent)
  }, [summaryBySupermarket, favoriteIds])

  return (
    <div className="pt-20 pb-24">
      {/* Totali complessivi */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Speso" value={euro(totals.spent)} icon={<Wallet className="w-4 h-4" />} tone="ocean" />
        <StatTile label="Risparmiato" value={euro(totals.saved)} icon={<Tag className="w-4 h-4" />} tone="emerald" />
        <StatTile label="Scontrini" value={String(totals.count)} icon={<Receipt className="w-4 h-4" />} tone="slate" />
      </div>

      {/* Card per supermercato */}
      {cards.length > 0 ? (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate uppercase tracking-wider px-1">Per supermercato</h2>
          {cards.map(({ supermarket, summary }) => (
            <div key={supermarket.id} className="p-4 bg-white rounded-xl shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: supermarket.color }} />
                <p className="font-semibold text-night flex-1 min-w-0 truncate">{supermarket.name}</p>
                <span className="text-xs text-slate">{summary.count} scontrin{summary.count === 1 ? 'o' : 'i'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Speso" value={euro(summary.spent)} className="text-ocean" />
                <MiniStat label="Risparmiato" value={euro(summary.saved)} className="text-emerald-600" />
                <MiniStat label="In offerta" value={`${summary.offerPercent}%`} className="text-orange-600" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-sky-light/50 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-ocean" />
          </div>
          <h3 className="text-lg font-semibold text-night mb-1">Nessuno scontrino</h3>
          <p className="text-sm text-slate max-w-xs mb-4">
            Fotografa uno scontrino e associa la spesa a un supermercato per vedere speso, risparmiato e offerte.
          </p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean text-white font-semibold shadow-soft">
            <Plus className="w-5 h-5" /> Aggiungi il primo scontrino
          </button>
        </div>
      )}

      {/* Elenco scontrini */}
      {receipts.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-slate uppercase tracking-wider px-1">Scontrini</h2>
          <AnimatePresence mode="popLayout">
            {receipts.map((r) => {
              const sm = getSupermarketById(r.supermarketId)
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-soft"
                >
                  <div className="w-12 h-12 rounded-lg bg-cloud flex items-center justify-center overflow-hidden flex-shrink-0">
                    {r.photo ? <img src={r.photo} alt="" className="w-full h-full object-cover" /> : <Receipt className="w-5 h-5 text-slate" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {sm && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sm.color }} />}
                      <p className="font-medium text-night truncate">{sm?.name || 'Supermercato'}</p>
                    </div>
                    <p className="text-xs text-slate">{fmtDate(r.date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-ocean">{euro(r.total)}</p>
                    {r.saved > 0 && <p className="text-xs text-emerald-600">-{euro(r.saved)}</p>}
                  </div>
                  <button
                    onClick={() => removeReceipt(r.id)}
                    className="p-1.5 text-slate hover:text-error hover:bg-error-light rounded-lg transition-colors flex-shrink-0"
                    aria-label="Elimina scontrino"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAB "+" — apre la sheet "Aggiungi scontrino". Stile identico al FAB di AddListSheet. */}
      <button
        onClick={() => setShowAdd(true)}
        aria-label="Aggiungi scontrino"
        title="Aggiungi scontrino"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky to-ocean text-white shadow-soft-lg hover:brightness-105 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

      <AddReceiptSheet
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addReceipt}
        defaultDate={today()}
      />
    </div>
  )
}

function StatTile({ label, value, icon, tone }) {
  const tones = {
    ocean: 'text-ocean',
    emerald: 'text-emerald-600',
    slate: 'text-slate',
  }
  return (
    <div className="p-3 bg-white rounded-xl shadow-soft text-center">
      <div className={`flex items-center justify-center gap-1 ${tones[tone]}`}>{icon}</div>
      <p className={`text-lg font-bold mt-1 ${tones[tone]}`}>{value}</p>
      <p className="text-[11px] text-slate uppercase tracking-wider">{label}</p>
    </div>
  )
}

function MiniStat({ label, value, className }) {
  return (
    <div>
      <p className={`font-semibold ${className}`}>{value}</p>
      <p className="text-[11px] text-slate">{label}</p>
    </div>
  )
}
