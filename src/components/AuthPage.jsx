import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { handleSupabaseError } from '../lib/supabase'
import { ShoppingCart, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuthPage() {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setLoading(true)
      setError('')
      await signInWithMagicLink(email)
      setSuccess(true)
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-light/30 to-snow flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky to-ocean rounded-2xl shadow-soft-lg mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-night">Lista della Spesa</h1>
          <p className="text-slate mt-1">Organizza i tuoi acquisti</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-success-light rounded-full mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-night mb-2">
                Controlla la tua email
              </h2>
              <p className="text-slate text-sm">
                Ti abbiamo inviato un link magico a<br />
                <span className="font-medium text-night">{email}</span>
              </p>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="mt-6 text-sm text-ocean hover:text-deep transition-colors"
              >
                Usa un'altra email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-night mb-2">
                Indirizzo email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@esempio.com"
                  className="w-full pl-10 pr-4 py-3 bg-cloud border border-transparent rounded-xl text-night placeholder:text-slate-light focus:outline-none focus:border-sky focus:ring-2 focus:ring-sky/20 transition-all"
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-error"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-sky to-ocean text-white font-semibold rounded-xl shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-press flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continua
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate mt-6">
          Accedi senza password con un link magico
        </p>
      </motion.div>
    </div>
  )
}
