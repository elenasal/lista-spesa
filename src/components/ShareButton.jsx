import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Check, Link, Copy } from 'lucide-react'

export default function ShareButton({ items, listName }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateShareData = () => {
    const shareData = {
      name: listName,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        price: item.price
      }))
    }
    return btoa(encodeURIComponent(JSON.stringify(shareData)))
  }

  const generateShareLink = () => {
    const data = generateShareData()
    return `${window.location.origin}?lista=${data}`
  }

  const handleCopyLink = async () => {
    const link = generateShareLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback per browser che non supportano clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyText = async () => {
    const text = items
      .filter(i => !i.checked)
      .map(item => {
        let line = `- ${item.name}`
        if (item.quantity > 1) line += ` (x${item.quantity})`
        if (item.price) line += ` - ${(item.price * item.quantity).toFixed(2)}€`
        return line
      })
      .join('\n')

    const fullText = `${listName}\n\n${text}`

    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Errore copia:', err)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate hover:text-ocean hover:bg-sky-light/30 rounded-lg transition-all"
        title="Condividi lista"
      >
        <Share2 className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay per chiudere */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-soft-lg border border-cloud z-20 py-2"
            >
              <p className="px-3 py-1 text-xs font-semibold text-slate uppercase">
                Condividi
              </p>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-night hover:bg-sky-light/30 transition-colors"
              >
                <Link className="w-4 h-4 text-ocean" />
                <span>Copia link</span>
                {copied && <Check className="w-4 h-4 text-green-500 ml-auto" />}
              </button>

              <button
                onClick={handleCopyText}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-night hover:bg-sky-light/30 transition-colors"
              >
                <Copy className="w-4 h-4 text-ocean" />
                <span>Copia come testo</span>
              </button>

              {copied && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-1 text-xs text-green-600"
                >
                  Copiato negli appunti!
                </motion.p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
