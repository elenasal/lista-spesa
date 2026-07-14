import { Plus } from 'lucide-react'
import { CURRENT_USER, getUserById } from '../../data/users'

// Avatar singolo: cerchio OPACO con faccina + anello bianco di separazione
// (così sovrapposti formano una pila pulita, senza cerchi che si intersecano).
function Avatar({ user, className = '', size = 'md' }) {
  if (!user) return null
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center leading-none ${className}`}
      style={{ backgroundColor: user.color || '#94A3B8', boxShadow: '0 0 0 2px #fff' }}
      title={user.name}
    >
      <span>{user.avatar || '🙂'}</span>
    </div>
  )
}

/**
 * Cluster avatar condivisione (mockup): io + membri + "+" per condividere.
 *
 * Props:
 * - members: array di id utente
 * - onAdd: () => void  (apre la condivisione)
 * - className
 */
export default function ShareAvatars({ members = [], onAdd, className = '', onDark = false, showAdd = true, size = 'md' }) {
  const overlap = size === 'sm' ? '-ml-2' : '-ml-2.5'
  const addDim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
  return (
    <div className={`flex items-center ${className}`}>
      <Avatar user={CURRENT_USER} size={size} />
      {members.map((uid) => {
        const u = getUserById(uid)
        return u ? <Avatar key={uid} user={u} size={size} className={overlap} /> : null
      })}
      {showAdd && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onAdd?.()
        }}
        aria-label="Condividi la lista con qualcuno"
        className={`${overlap} ${addDim} rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${
          onDark
            ? 'border-white/60 text-white hover:bg-white/20 hover:border-white'
            : 'border-slate-300 bg-white text-slate hover:text-ocean hover:border-ocean'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      )}
    </div>
  )
}
