import { useState } from 'react'
import ShoppingList from './components/ShoppingList'
import ListsOverview from './components/ListsOverview'
import SupermarketsPage from './components/SupermarketsPage'
import Header from './components/layout/Header'
import NotificationsModal from './components/NotificationsModal'
import { useMultipleLists } from './hooks/useMultipleLists'
import { useOffers } from './hooks/useOffers'
import { Bell } from 'lucide-react'

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
    renameList,
    updateListBudget,
    reorderLists,
  } = useMultipleLists()

  // Vista corrente e ID lista selezionata
  const [currentView, setCurrentView] = useState(VIEWS.HOME)
  const [selectedListId, setSelectedListId] = useState(null)

  // Notifiche offerte (mockup)
  const { offers, unreadCount, markRead, markAllRead } = useOffers()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSelectList = (listId) => {
    switchList(listId)
    setSelectedListId(listId)
    setCurrentView(VIEWS.LIST)
  }

  const handleBack = () => {
    setSelectedListId(null)
    setCurrentView(VIEWS.HOME)
  }

  const handleCreateList = (name, supermarketId = null, budget = null) => {
    const newList = createList(name, supermarketId, budget)
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
          subtitle: null,
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
          title: 'Dai sfogo alle tue liste',
          subtitle: 'Tutte le tue liste, nei supermercati che ami.',
          showBack: false,
        }
    }
  }

  const headerInfo = getHeaderInfo()

  const isHome = currentView === VIEWS.HOME

  return (
    <div className={`min-h-screen ${isHome ? 'bg-[#c8eeff]' : 'bg-white'}`} style={{ overflowX: 'clip' }}>
      <Header
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        onBack={headerInfo.showBack ? handleBack : null}
      />
      <main className="relative max-w-lg mx-auto px-3 pb-24">
        {/* Fascia azzurrina in alto per continuità con l'header (solo pagine interne) */}
        {!isHome && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-40 pointer-events-none -z-10"
            style={{ background: 'linear-gradient(to bottom, #c8eeff, transparent)' }}
          />
        )}
        {currentView === VIEWS.LIST && (
          <ShoppingList
            listId={selectedListId}
            listName={selectedList?.name}
            listBudget={selectedList?.budget}
            listSupermarketId={selectedList?.supermarketId}
            onUpdateBudget={(budget) => updateListBudget(selectedListId, budget)}
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
            onEditList={(id, { name, budget }) => {
              renameList(id, name)
              updateListBudget(id, budget)
            }}
            onReorderLists={reorderLists}
            onNavigateToSupermarkets={handleOpenSupermarkets}
          />
        )}
      </main>

      {/* Campanello notifiche offerte — FAB fisso in basso a destra (mockup) */}
      {!showNotifications && (
        <button
          onClick={() => setShowNotifications(true)}
          aria-label="Notifiche offerte"
          className="fixed bottom-6 right-4 z-40 w-14 h-14 rounded-2xl bg-ocean text-white shadow-soft-lg flex items-center justify-center hover:bg-deep active:scale-95 transition-all"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 flex items-center justify-center text-[11px] font-bold text-white bg-rose-500 rounded-full border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        offers={offers}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </div>
  )
}

export default App
