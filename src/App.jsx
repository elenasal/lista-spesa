import { useState } from 'react'
import ShoppingList from './components/ShoppingList'
import ListsOverview from './components/ListsOverview'
import SupermarketsPage from './components/SupermarketsPage'
import CatalogPage from './components/CatalogPage'
import ReceiptsDashboard from './components/ReceiptsDashboard'
import OnboardingFlow from './components/OnboardingFlow'
import AddListSheet from './components/AddListSheet'
import Header from './components/layout/Header'
import BottomTabBar from './components/layout/BottomTabBar'
import NotificationsModal from './components/NotificationsModal'
import { useMultipleLists } from './hooks/useMultipleLists'
import { useNotifications } from './hooks/useNotifications'
import { useOnboarding } from './hooks/useOnboarding'
import { HelpCircle } from 'lucide-react'

// Viste disponibili
const VIEWS = {
  HOME: 'home',
  LIST: 'list',
  SUPERMARKETS: 'supermarkets',
  CATALOG: 'catalog',
  DASHBOARD: 'dashboard',
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
  // Se true, aprendo il tab Prodotti la sheet "Aggiungi prodotti" parte già aperta
  // (arrivo dal bottone "Aggiungi altri preferiti" nella lista). Consumato al mount.
  const [catalogAutoDiscover, setCatalogAutoDiscover] = useState(false)

  // Notifiche (mockup): feed unico offerte + attività liste condivise
  const { items: notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

  // Onboarding di prima apertura (+ riapertura manuale dal "?" nell'header, per demo)
  const { needsOnboarding, complete: completeOnboarding } = useOnboarding()
  const [replayOnboarding, setReplayOnboarding] = useState(false)

  const handleSelectList = (listId) => {
    switchList(listId)
    setSelectedListId(listId)
    setCurrentView(VIEWS.LIST)
  }

  const handleBack = () => {
    // Unico drill-down con back: LIST → HOME.
    setSelectedListId(null)
    setCurrentView(VIEWS.HOME)
  }

  const handleCreateList = (name, supermarketId = null, budget = null) => {
    const newList = createList(name, supermarketId, budget)
    // Apri subito la nuova lista
    setSelectedListId(newList.id)
    setCurrentView(VIEWS.LIST)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky/30 border-t-sky rounded-full animate-spin" />
      </div>
    )
  }

  // Prima apertura: mostra l'onboarding al posto dell'app finché non è completato/saltato.
  // Alla chiusura la home monta e rilegge i preferiti appena salvati da localStorage.
  if (needsOnboarding || replayOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(listId) => {
          completeOnboarding()
          setReplayOnboarding(false)
          // Se è stata creata una lista, atterra già dentro quella lista
          if (listId) {
            switchList(listId)
            setSelectedListId(listId)
            setCurrentView(VIEWS.LIST)
          }
        }}
        onCreateList={createList}
      />
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
          subtitle: 'Trova e salva i tuoi supermercati',
          showBack: false,
        }
      case VIEWS.CATALOG:
        return {
          title: 'Sfoglia prodotti',
          subtitle: 'Scopri e aggiungi ai preferiti',
          showBack: false,
        }
      case VIEWS.DASHBOARD:
        return {
          title: 'I miei acquisti',
          subtitle: "Aggiungi scontrini e tieni d'occhio i risparmi",
          showBack: false,
        }
      default:
        return {
          title: 'La mia spesa',
          subtitle: 'Crea e organizza le tue liste',
          showBack: false,
        }
    }
  }

  const headerInfo = getHeaderInfo()

  const isHome = currentView === VIEWS.HOME

  // Viste top-level: mostrano la bottom tab bar. LIST è il drill-down
  // (back, senza tab bar).
  const TOP_LEVEL_VIEWS = [VIEWS.HOME, VIEWS.SUPERMARKETS, VIEWS.CATALOG, VIEWS.DASHBOARD]
  const showTabBar = TOP_LEVEL_VIEWS.includes(currentView)

  return (
    <div className={`min-h-screen ${isHome ? 'bg-[#c8eeff]' : 'bg-white'}`} style={{ overflowX: 'clip' }}>
      <Header
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        isHome={isHome}
        onBack={headerInfo.showBack ? handleBack : null}
        rightAction={isHome ? (
          <button
            onClick={() => setReplayOnboarding(true)}
            aria-label="Rivedi gli step introduttivi"
            title="Rivedi gli step introduttivi"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        ) : null}
      />
      <main className={`relative max-w-lg mx-auto px-3 ${showTabBar ? 'pb-28' : 'pb-8'}`}>
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
            listMembers={selectedList?.members}
            onUpdateBudget={(budget) => updateListBudget(selectedListId, budget)}
            onGoToProducts={() => { setCatalogAutoDiscover(true); setCurrentView(VIEWS.CATALOG) }}
          />
        )}
        {currentView === VIEWS.SUPERMARKETS && (
          <SupermarketsPage onCreateList={handleCreateList} />
        )}
        {currentView === VIEWS.CATALOG && (
          <CatalogPage
            openDiscover={catalogAutoDiscover}
            onDiscoverConsumed={() => setCatalogAutoDiscover(false)}
          />
        )}
        {currentView === VIEWS.DASHBOARD && <ReceiptsDashboard />}
        {currentView === VIEWS.HOME && (
          <ListsOverview
            lists={lists}
            onSelectList={handleSelectList}
            onDeleteList={deleteList}
            onEditList={(id, { name, budget }) => {
              renameList(id, name)
              updateListBudget(id, budget)
            }}
            onReorderLists={reorderLists}
          />
        )}
      </main>

      {/* Bottom tab bar — solo sulle viste top-level (nascosta in drill-down) */}
      {showTabBar && (
        <BottomTabBar
          currentView={currentView}
          onSelect={setCurrentView}
          unreadCount={unreadCount}
          onOpenNotifications={() => setShowNotifications(true)}
        />
      )}

      {/* FAB "Nuova lista" (bottom sheet) — solo in home, sopra la tab bar */}
      {isHome && <AddListSheet onCreateList={handleCreateList} />}

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        items={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </div>
  )
}

export default App
