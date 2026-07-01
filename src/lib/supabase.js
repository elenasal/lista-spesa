import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase credentials missing. Check .env.local file.\n' +
    'Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Helper per gestione errori
export function handleSupabaseError(error) {
  console.error('Supabase error:', error)

  const messages = {
    'Invalid login credentials': 'Email o password non validi',
    'User already registered': 'Email già registrata',
    'Email not confirmed': 'Conferma la tua email prima di accedere',
    'Invalid email': 'Indirizzo email non valido',
    'Signup requires a valid password': 'Inserisci una password valida',
    'Password should be at least 6 characters': 'La password deve avere almeno 6 caratteri',
  }

  return messages[error.message] || error.message || 'Si è verificato un errore'
}
