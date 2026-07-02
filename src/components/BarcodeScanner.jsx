import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Zap } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

// Prodotti mockup simulati per i barcode
const MOCK_PRODUCTS = {
  // Alcuni barcode italiani comuni (esempio)
  '8001234567890': { name: 'Pasta Barilla Spaghetti 500g', category: 'pane-cereali', price: 1.29 },
  '8002345678901': { name: 'Latte Granarolo Intero 1L', category: 'latticini', price: 1.49 },
  '8003456789012': { name: 'Olio Extravergine Monini 1L', category: 'dispensa', price: 6.99 },
  '8004567890123': { name: 'Mozzarella Santa Lucia 125g', category: 'latticini', price: 1.19 },
  '8005678901234': { name: 'Passata Mutti 700g', category: 'dispensa', price: 1.89 },
}

// Genera un prodotto mockup casuale per barcode sconosciuti
const RANDOM_PRODUCTS = [
  { name: 'Prodotto alimentare', category: 'dispensa', price: 2.99 },
  { name: 'Bevanda', category: 'bevande', price: 1.49 },
  { name: 'Snack', category: 'dispensa', price: 1.99 },
  { name: 'Latticino fresco', category: 'latticini', price: 2.49 },
  { name: 'Prodotto surgelato', category: 'surgelati', price: 3.49 },
]

function getMockProduct(barcode) {
  // Se il barcode è nel database mockup, restituiscilo
  if (MOCK_PRODUCTS[barcode]) {
    return { ...MOCK_PRODUCTS[barcode], barcode }
  }

  // Altrimenti genera un prodotto random basato sul barcode
  const index = parseInt(barcode.slice(-1)) % RANDOM_PRODUCTS.length
  const randomProduct = RANDOM_PRODUCTS[index]
  return {
    ...randomProduct,
    name: `${randomProduct.name} (${barcode.slice(-4)})`,
    barcode
  }
}

export default function BarcodeScanner({ isOpen, onClose, onProductFound }) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [lastScanned, setLastScanned] = useState(null)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen])

  const startScanner = async () => {
    try {
      setError(null)
      setLastScanned(null)

      const html5QrCode = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' }, // Fotocamera posteriore
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Barcode letto con successo
          handleScan(decodedText)
        },
        () => {
          // Errore di lettura (normale, continua a scannerizzare)
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Errore avvio scanner:', err)
      setError('Impossibile accedere alla fotocamera. Verifica i permessi.')
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current = null
      } catch (err) {
        console.error('Errore stop scanner:', err)
      }
    }
    setIsScanning(false)
  }

  const handleScan = (barcode) => {
    // Evita scansioni multiple dello stesso barcode
    if (lastScanned === barcode) return
    setLastScanned(barcode)

    // Vibrazione feedback (se supportata)
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }

    // Trova/genera prodotto mockup
    const product = getMockProduct(barcode)

    // Ferma scanner e passa il prodotto
    stopScanner()
    onProductFound(product)
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-white">
              <Camera className="w-5 h-5" />
              <span className="font-medium">Scansiona codice a barre</span>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scanner area */}
          <div className="h-full flex flex-col items-center justify-center">
            {error ? (
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-white mb-4">{error}</p>
                <button
                  onClick={startScanner}
                  className="px-4 py-2 bg-sky text-white rounded-lg hover:bg-ocean transition-colors"
                >
                  Riprova
                </button>
              </div>
            ) : (
              <>
                {/* Video container */}
                <div
                  id="barcode-reader"
                  ref={scannerRef}
                  className="w-full max-w-md"
                  style={{ position: 'relative' }}
                />

                {/* Scanning indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                    <Zap className="w-4 h-4 text-sky animate-pulse" />
                    <span className="text-white text-sm">Inquadra il codice a barre</span>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-center text-white/60 text-sm">
              Posiziona il codice a barre all'interno del riquadro
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
