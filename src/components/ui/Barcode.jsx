// Barcode decorativo generato dal numero tessera.
// ⚠️ MOCKUP: è un pattern visivo basato sul numero, non un codice realmente
// scansionabile. Condiviso tra CardDisplayModal e la card in home.

// Genera le larghezze delle linee del barcode a partire dal numero
export function generateBarcodeLines(number) {
  if (!number) return []
  const lines = []
  const chars = number.replace(/\s/g, '').split('')

  // Linee iniziali
  lines.push(2, 1, 2)

  chars.forEach((char) => {
    const code = char.charCodeAt(0)
    lines.push(
      1 + (code % 2),
      1,
      1 + ((code >> 1) % 2),
      1
    )
  })

  // Linee finali
  lines.push(2, 1, 2)

  return lines
}

// Formatta il numero tessera in gruppi di 4 cifre
export function formatCardNumber(number) {
  if (!number) return ''
  const clean = number.replace(/\s/g, '')
  return clean.match(/.{1,4}/g)?.join(' ') || clean
}

// Componente barcode: linee verticali, altezza configurabile.
export default function Barcode({ number, height = 48, className = '' }) {
  const lines = generateBarcodeLines(number)
  return (
    <div className={`flex items-end justify-center gap-[1.5px] ${className}`} style={{ height }}>
      {lines.map((width, i) => (
        <div key={i} className="bg-night" style={{ width: `${width}px`, height: '100%' }} />
      ))}
    </div>
  )
}
