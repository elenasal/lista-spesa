import { useAuth } from '../../contexts/AuthContext'
import { ShoppingCart, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cloud"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky to-ocean rounded-xl flex items-center justify-center shadow-soft">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-night">Lista della Spesa</h1>
            <p className="text-xs text-slate truncate max-w-[150px]">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="p-2 text-slate hover:text-error hover:bg-error-light rounded-lg transition-colors"
          title="Esci"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  )
}
