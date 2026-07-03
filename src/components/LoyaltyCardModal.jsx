import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ScanBarcode, Gift, Calendar, Trash2, Save, Camera, Zap } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

export default function LoyaltyCardModal({
  isOpen,
  onClose,
  supermarket,
  cardData,
  onSave,
  onDelete
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [hasLoyaltyProgram, setHasLoyaltyProgram] = useState(false)
  const [points, setPoints] = useState('')
  const [pointsExpiry, setPointsExpiry] = useState('')

  // Scanner barcode
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const html5QrCodeRef = useRef(null)

  // Popola form quando si apre
  useEffect(() => {
    if (cardData) {
      setCardNumber(cardData.cardNumber || '')
      setCardName(cardData.cardName || '')
      setHasLoyaltyProgram(cardData.hasLoyaltyProgram || false)
      setPoints(cardData.points?.toString() || '')
      setPointsExpiry(cardData.pointsExpiry || '')
    } else {
      // Suggerisci nome tessera basato sul supermercato
      setCardNumber('')
      setCardName(getDefaultCardName(supermarket?.name))
      setHasLoyaltyProgram(false)
      setPoints('')
      setPointsExpiry('')
    }
  }, [cardData, supermarket, isOpen])

  // Cleanup scanner quando si chiude
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      setScanError(null)
      setIsScanning(true)

      // Aspetta che il DOM sia pronto
      await new Promise(resolve => setTimeout(resolve, 100))

      const html5QrCode = new Html5Qrcode('card-barcode-reader')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
        },
        (decodedText) => {
          // Barcode letto
          if (navigator.vibrate) navigator.vibrate(100)
          setCardNumber(decodedText)
          stopScanner()
        },
        () => {}
      )
    } catch (err) {
      console.error('Errore scanner:', err)
      setScanError('Impossibile accedere alla fotocamera')
      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current = null
      } catch (err) {}
    }
    setIsScanning(false)
  }

  const handleSave = () => {
    onSave({
      cardNumber: cardNumber.trim(),
      cardName: cardName.trim(),
      hasLoyaltyProgram,
      points: points ? parseInt(points) : null,
      pointsExpiry: pointsExpiry || null,
    })
    onClose()
  }

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  if (!isOpen || !supermarket) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div
            className="p-4 border-b border-cloud flex items-center gap-3"
            style={{ backgroundColor: supermarket.bgColor }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: supermarket.color }}
            >
              <ScanBarcode className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-night">Tessera {supermarket.name}</h2>
              <p className="text-sm text-slate">Gestisci la tua carta fedeltà</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate hover:text-night hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Numero tessera */}
            <div>
              <label className="block text-sm font-medium text-night mb-1.5">
                Numero tessera / Codice a barre
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Es. 1234567890123"
                  className="flex-1 px-3 py-2.5 bg-snow border border-cloud rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky"
                />
                <button
                  type="button"
                  onClick={isScanning ? stopScanner : startScanner}
                  className={`px-3 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    isScanning
                      ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                      : 'bg-ocean text-white hover:bg-deep'
                  }`}
                >
                  {isScanning ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              </div>

              {/* Scanner inline */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="bg-black rounded-xl p-2 relative">
                      <div id="card-barcode-reader" className="w-full" />
                      <div className="flex items-center justify-center gap-2 py-2 text-white/80 text-sm">
                        <Zap className="w-4 h-4 animate-pulse text-sky" />
                        Inquadra il barcode della tessera
                      </div>
                    </div>
                    {scanError && (
                      <p className="text-rose-600 text-sm mt-2">{scanError}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nome tessera */}
            <div>
              <label className="block text-sm font-medium text-night mb-1.5">
                Nome tessera (opzionale)
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Es. Fidaty, Carta Insieme..."
                className="w-full px-3 py-2.5 bg-snow border border-cloud rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky"
              />
            </div>

            {/* Raccolta punti */}
            <div className="p-4 bg-snow rounded-xl border border-cloud">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLoyaltyProgram}
                  onChange={(e) => setHasLoyaltyProgram(e.target.checked)}
                  className="w-5 h-5 rounded border-cloud text-ocean focus:ring-sky"
                />
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-ocean" />
                  <span className="font-medium text-night">Raccolta punti attiva</span>
                </div>
              </label>

              {/* Campi punti - visibili solo se raccolta attiva */}
              <AnimatePresence>
                {hasLoyaltyProgram && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 pt-3 border-t border-cloud">
                      <div>
                        <label className="block text-sm text-slate mb-1">
                          Punti attuali
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={points}
                          onChange={(e) => setPoints(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white border border-cloud rounded-lg text-night focus:outline-none focus:border-sky"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-sm text-slate mb-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Scadenza punti
                        </label>
                        <input
                          type="date"
                          value={pointsExpiry}
                          onChange={(e) => setPointsExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-cloud rounded-lg text-night focus:outline-none focus:border-sky"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cloud flex gap-2">
            {cardData?.cardNumber && (
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Elimina
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleClose}
              className="px-4 py-2.5 text-slate hover:bg-cloud rounded-xl font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!cardNumber.trim()}
              className="px-4 py-2.5 bg-ocean text-white hover:bg-deep rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salva
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Suggerisci nome tessera basato sul supermercato
function getDefaultCardName(supermarketName) {
  const cardNames = {
    'Esselunga': 'Fidaty',
    'Conad': 'Carta Insieme',
    'Coop': 'Carta Socio',
    'Carrefour': 'Carta PAYBACK',
    'Lidl': 'Lidl Plus',
    'Eurospin': 'Carta Eurospin',
    'Penny': 'Carta Penny',
    'MD': 'Carta MD',
    'Aldi': 'Carta Aldi',
    'Bennet': 'Carta Bennet Club',
    'Iper': 'Carta Iper',
    'Pam': 'Carta Per Te',
    'Famila': 'Carta Famila',
  }

  if (!supermarketName) return ''

  for (const [key, value] of Object.entries(cardNames)) {
    if (supermarketName.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  return ''
}
