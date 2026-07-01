import ShoppingList from './components/ShoppingList'
import Header from './components/layout/Header'

function App() {
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
