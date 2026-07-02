import { useState } from 'react'
import ShoppingList from './components/ShoppingList'
import ListsOverview from './components/ListsOverview'
import Header from './components/layout/Header'
import { useMultipleLists } from './hooks/useMultipleLists'

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

  // null = vista overview, string = vista dettaglio lista
  const [selectedListId, setSelectedListId] = useState(null)

  const handleSelectList = (listId) => {
    switchList(listId)
    setSelectedListId(listId)
  }

  const handleBack = () => {
    setSelectedListId(null)
  }

  const handleCreateList = (name) => {
    const newList = createList(name)
    // Apri subito la nuova lista
    setSelectedListId(newList.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky/30 border-t-sky rounded-full animate-spin" />
      </div>
    )
  }

  const selectedList = lists.find(l => l.id === selectedListId)

  return (
    <div className="min-h-screen bg-snow">
      <Header
        currentList={selectedList}
        onBack={selectedListId ? handleBack : null}
      />
      <main className="max-w-lg mx-auto px-4 pb-24">
        {selectedListId ? (
          <ShoppingList
            listId={selectedListId}
            listName={selectedList?.name}
          />
        ) : (
          <ListsOverview
            lists={lists}
            onSelectList={handleSelectList}
            onCreateList={handleCreateList}
            onDeleteList={deleteList}
          />
        )}
      </main>
    </div>
  )
}

export default App
