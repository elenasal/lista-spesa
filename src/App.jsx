import { useState } from 'react'
import ShoppingList from './components/ShoppingList'
import ListsOverview from './components/ListsOverview'
import SupermarketsPage from './components/SupermarketsPage'
import Header from './components/layout/Header'
import { useMultipleLists } from './hooks/useMultipleLists'

// Viste disponibili
const VIEWS = {
  HOME: 'home',
  LIST: 'list',
  SUPERMARKETS: 'supermarkets',
}

function App() {
  const {
    lists,
    currentList,
    currentListId,
    loading,
    createList,
    deleteList,
    switchList,
  } = useMultipleLists()

  // Vista corrente e ID lista selezionata
  const [currentView, setCurrentView] = useState(VIEWS.HOME)
  const [selectedListId, setSelectedListId] = useState(null)

  const handleSelectList = (listId) => {
    switchList(listId)
    setSelectedListId(listId)
    setCurrentView(VIEWS.LIST)
  }

  const handleBack = () => {
    setSelectedListId(null)
    setCurrentView(VIEWS.HOME)
  }

  const handleCreateList = (name, supermarketId = null) => {
    const newList = createList(name, supermarketId)
    // Apri subito la nuova lista
    setSelectedListId(newList.id)
    setCurrentView(VIEWS.LIST)
  }

  const handleOpenSupermarkets = () => {
    setCurrentView(VIEWS.SUPERMARKETS)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky/30 border-t-sky rounded-full animate-spin" />
      </div>
    )
  }

  const selectedList = lists.find(l => l.id === selectedListId)

  // Determina titolo e sottotitolo per Header
  const getHeaderInfo = () => {
    switch (currentView) {
      case VIEWS.LIST:
        return {
          title: selectedList?.name || 'Lista',
          subtitle: 'I tuoi acquisti',
          showBack: true,
        }
      case VIEWS.SUPERMARKETS:
        return {
          title: 'Supermercati',
          subtitle: 'Confronta i prezzi',
          showBack: true,
        }
      default:
        return {
          title: 'Spesa a ruota libera',
          subtitle: 'Tutte le tue liste, nei supermercati che ami.',
          showBack: false,
        }
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <div className="min-h-screen bg-snow">
      <Header
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        onBack={headerInfo.showBack ? handleBack : null}
      />
      <main className="max-w-lg mx-auto px-4 pb-24">
        {currentView === VIEWS.LIST && (
          <ShoppingList
            listId={selectedListId}
            listName={selectedList?.name}
          />
        )}
        {currentView === VIEWS.SUPERMARKETS && (
          <SupermarketsPage />
        )}
        {currentView === VIEWS.HOME && (
          <ListsOverview
            lists={lists}
            onSelectList={handleSelectList}
            onCreateList={handleCreateList}
            onDeleteList={deleteList}
            onNavigateToSupermarkets={handleOpenSupermarkets}
          />
        )}
      </main>
    </div>
  )
}

export default App
