import { ShoppingBasket } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 bg-sky-light/50 rounded-2xl flex items-center justify-center mb-4">
        <ShoppingBasket className="w-10 h-10 text-ocean" />
      </div>
      <h3 className="text-lg font-semibold text-night mb-1">
        Lista vuota
      </h3>
      <p className="text-slate text-sm max-w-[200px]">
        Aggiungi il tuo primo prodotto usando il campo qui sopra
      </p>
    </motion.div>
  )
}
