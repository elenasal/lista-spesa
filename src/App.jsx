import { useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import ShoppingList from './components/ShoppingList'
import Header from './components/layout/Header'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-snow">
      <Header />
      <main className="max-w-lg mx-auto px-4 pb-24">
        <ShoppingList />
      </main>
    </div>
  )
}

export default App
