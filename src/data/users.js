// Utenti finti per il mockup delle liste condivise.
// ⚠️ MOCKUP: nessun account reale. "me" è l'utente corrente.

export const CURRENT_USER = { id: 'me', name: 'Tu', color: '#0EA5E9', avatar: '🙂' }

export const MOCK_USERS = [
  { id: 'u-giulia', name: 'Giulia', color: '#F43F5E', avatar: '👩' },
  { id: 'u-marco', name: 'Marco', color: '#10B981', avatar: '🧔' },
  { id: 'u-sara', name: 'Sara', color: '#8B5CF6', avatar: '👧' },
]

const ALL_USERS = [CURRENT_USER, ...MOCK_USERS]

export function getUserById(id) {
  return ALL_USERS.find(u => u.id === id)
}

export function getInitials(name) {
  return (name || '?').trim().slice(0, 1).toUpperCase()
}
