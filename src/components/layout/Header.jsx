import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cloud"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-sky to-ocean rounded-xl flex items-center justify-center shadow-soft">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-night">Lista della Spesa</h1>
          <p className="text-xs text-slate">I tuoi acquisti</p>
        </div>
      </div>
    </motion.header>
  )
}
