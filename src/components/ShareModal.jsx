import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Link as LinkIcon, Copy, Check, Send } from 'lucide-react'

/**
 * Modal di condivisione lista con doppia modalità: testo e link.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - items: array (prodotti della lista)
 * - listName: string
 */
export default function ShareModal({ isOpen, onClose, items = [], listName = 'Lista' }) {
  const [copied, setCopied] = useState(null) // 'text' | 'link' | null

  const buildText = () => {
    const lines = items
      .filter(i => !i.checked)
      .map(item => {
        const unit = item.unit || 'pz'
        let line = `- ${item.name}`
        if (item.quantity > 1 || unit !== 'pz') {
          const qtyDisplay = unit === 'pz' || unit === 'conf'
            ? item.quantity
            : item.quantity.toFixed(1).replace('.0', '')
          line += ` (${qtyDisplay} ${unit})`
        }
        if (item.price) line += ` - ${(item.price * item.quantity).toFixed(2).replace('.', ',')}€`
        return line
      })
      .join('\n')
    return `${listName}\n\n${lines || 'Lista vuota'}`
  }

  const buildLink = () => {
    const shareData = {
      name: listName,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || 'pz',
        category: item.category,
        price: item.price,
      })),
    }
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)))
    return `${window.location.origin}?lista=${encoded}`
  }

  const copy = async (value, mode) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(mode)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: listName, text: buildText() })
    } catch {
      // utente ha annullato o non supportato: ignora
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  if (!isOpen) return null

  const previewText = buildText()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-cloud flex items-center gap-3 bg-sky-light/40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-ocean">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-night truncate">Condividi «{listName}»</h2>
              <p className="text-sm text-slate">Scegli come condividere</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate hover:text-night hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenuto */}
          <div className="p-4 space-y-3 overflow-y-auto">
            {/* Condivisione nativa (mobile) */}
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 p-3 bg-ocean text-white rounded-xl hover:bg-deep transition-colors"
              >
                <Send className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Condividi…</span>
              </button>
            )}

            {/* Copia come testo */}
            <button
              onClick={() => copy(previewText, 'text')}
              className="w-full flex items-center gap-3 p-3 bg-snow border border-cloud rounded-xl hover:border-sky text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                <Copy className="w-4 h-4 text-ocean" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-night">Copia come testo</p>
                <p className="text-xs text-slate">Incolla in WhatsApp, note, ecc.</p>
              </div>
              {copied === 'text' && (
                <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium flex-shrink-0">
                  <Check className="w-4 h-4" /> Copiato
                </span>
              )}
            </button>

            {/* Copia link */}
            <button
              onClick={() => copy(buildLink(), 'link')}
              className="w-full flex items-center gap-3 p-3 bg-snow border border-cloud rounded-xl hover:border-sky text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-light/50 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-4 h-4 text-ocean" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-night">Copia link</p>
                <p className="text-xs text-slate">Chi lo apre importa la lista</p>
              </div>
              {copied === 'link' && (
                <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium flex-shrink-0">
                  <Check className="w-4 h-4" /> Copiato
                </span>
              )}
            </button>

            {/* Anteprima testo */}
            <div>
              <p className="text-xs font-semibold text-slate uppercase mb-1.5">Anteprima</p>
              <pre className="text-xs text-night bg-snow border border-cloud rounded-xl p-3 whitespace-pre-wrap break-words max-h-40 overflow-y-auto font-sans">
                {previewText}
              </pre>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
