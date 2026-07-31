import { Heart, ShoppingBasket, Store, PiggyBank, Bell } from 'lucide-react'

// Bottom tab bar persistente (mobile) — pilota `currentView` in App.jsx senza react-router.
// 4 destinazioni top-level + 1 azione "Notifiche" (non è navigazione: apre la modale).
// L'attiva è derivata mappando la vista corrente sul tab.
const TABS = [
  { view: 'catalog', label: 'Prodotti', Icon: Heart },
  { view: 'home', label: 'Spesa', Icon: ShoppingBasket },
  { view: 'supermarkets', label: 'Supermercati', Icon: Store },
  { view: 'dashboard', label: 'Scontrini', Icon: PiggyBank },
]

export default function BottomTabBar({ currentView, onSelect, unreadCount = 0, onOpenNotifications }) {
  return (
    // z-40: sopra il contenuto, ma sotto i bottom sheet (z-50) e i modali (z-[60])
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigazione principale"
    >
      <div className="max-w-lg mx-auto bg-white border-t border-cloud shadow-[0_-2px_12px_rgba(14,165,233,0.10)]">
        <div className="flex items-stretch">
          {TABS.map(({ view, label, Icon }) => {
            const active = currentView === view
            return (
              <button
                key={view}
                onClick={() => onSelect(view)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-0.5 transition-colors ${
                  active ? 'text-ocean' : 'text-slate-light hover:text-slate'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[11px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            )
          })}

          {/* Azione Notifiche — stesso stile visivo dei tab, ma NON è navigazione:
              apre la modale e non ha mai stato "attivo" legato a currentView. */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifiche"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-0.5 text-slate-light hover:text-slate transition-colors"
          >
            <span className="relative">
              <Bell className="w-6 h-6" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </span>
            <span className="text-[11px] leading-none font-medium">Notifiche</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
