# Lista della Spesa — Guida progetto (doc core)

## Panoramica

App minimalista per gestire la lista della spesa. Design "Fresh Blue" con palette azzurro/blu.

## Struttura & Navigazione

### Modello di navigazione (niente react-router)
La navigazione è una **macchina a stati** in `App.jsx` (`src/App.jsx`): lo stato `currentView` (enum `VIEWS`) decide quale vista montare. Nessun router — cambiare tab = `setCurrentView`. Scelta voluta: meno rischio, riusa le viste esistenti (vedi *Decisioni di architettura*).

- **Bottom tab bar** (`components/layout/BottomTabBar.jsx`) — 4 tab di navigazione **+ una 5ª icona campanello** (notifiche: badge non-letti da `useNotifications`, apre `NotificationsModal`; è un'azione, non una vista). Fissa in basso, mostrata solo sulle **viste top-level** (`TOP_LEVEL_VIEWS` in `App.jsx`) e **nascosta nel drill-down** `LIST`, che usa il tasto back.
- **"Crea lista" non è una tab**: è un **FAB** (`AddListSheet`) visibile solo in `HOME`.
- **Pattern `+` / contenuti personali** — ogni tab top-level mostra di default i contenuti *personali* (liste · preferiti prodotti · supermercati preferiti · dashboard scontrini) e ha un unico **FAB `+`** che apre una bottom sheet per aggiungere/scoprire ("crea lista" · "Aggiungi prodotti" · "Trova supermercato" · aggiungi scontrino). Il **sottotitolo header apre col verbo del `+`** (es. Prodotti: "Scopri e aggiungi ai preferiti"); il titolo nel body è un pulito "I miei/Le mie [X]".
- **Header unificato** (`components/layout/Header.jsx`) — un solo componente con variante `isHome`; titoli/sottotitoli forniti da `getHeaderInfo()` in `App.jsx`. Azioni a destra: su HOME solo `HelpCircle` (rivedi onboarding), sulle altre viste nessuna (`empty:hidden`). Le notifiche NON sono più nell'header (spostate nel tab bar).

| Vista (`VIEWS`) | Componente | Tab bar |
|-----------------|-----------|---------|
| `HOME` | `ListsOverview` | **Spesa** (`ShoppingBasket`) |
| `CATALOG` | `CatalogPage` | **Prodotti** (`Heart`) |
| `SUPERMARKETS` | `SupermarketsPage` | **Supermercati** (`Store`) |
| `DASHBOARD` | `ReceiptsDashboard` | **Scontrini** (`PiggyBank`) |
| `LIST` | `ShoppingList` | — drill-down (back) |

> **Stato locale, non context**: `SupermarketsPage` possiede l'unica istanza di `useLoyaltyCards`/`useFavoriteSupermarkets` (stato per-istanza) e passa `getCard`/`hasCard` alle card figlie. La geolocalizzazione invece è condivisa via `LocationContext`.
>
> **Modali impilate**: alcuni drill-down NON sono viste ma bottom sheet stackate con z-index crescente. `SupermarketDetailPage` è una modale (`z-[70]`) dentro `SupermarketsPage`, aperta dalla sheet "Trova supermercato" (`z-50`); il back la chiude tornando alla sheet sottostante. Stesso pattern: `AssistantSheet` (`z-[70]`), modali tessera (`z-[80]`).

### Mappa moduli
```
src/
├── App.jsx                 # macchina a stati navigazione (VIEWS, header, tab bar, FAB)
├── main.jsx
├── components/
│   ├── layout/             # Header, BottomTabBar
│   ├── ui/                 # primitive: BottomSheet, CEInput, Barcode, SelectDropdown,
│   │                       #   SwipeableCard, DropdownMenu, LocationSearchInput, ShareAvatars…
│   ├── supermarkets/       # FavoriteSupermarketCard
│   ├── <viste>             # ListsOverview, CatalogPage, SupermarketsPage, ReceiptsDashboard,
│   │                       #   ShoppingList, OnboardingFlow (SupermarketDetailPage → modale)
│   └── <sheet/modali>      # AddListSheet, AddProductSheet, AddReceiptSheet, AssistantSheet,
│                           #   EditListModal, LoyaltyCardModal, NotificationsModal, ShareModal…
├── hooks/                  # useMultipleLists, useShoppingList, useReceipts, useLoyaltyCards,
│                           #   useFavoriteSupermarkets, useProductFilters, useNotifications,
│                           #   useOnboarding, useLocation, useGeocodeSearch…
├── data/                   # mock: productsDatabase, categories, supermarkets, zonePricing,
│                           #   offers, flyers, activity, users
├── contexts/               # LocationContext (attivo) · AuthContext (Fase 2, non montato)
└── lib/supabase.js         # client Supabase — Fase 2, non usato a runtime
```

## Decisioni di architettura

- **Backend rinviato alla Fase 2** — in questa fase è solo mockup front-end. Dati prodotti/supermercati mock (area Novara); **solo le distanze dei supermercati** usano coordinate reali. `lib/supabase.js` + `AuthContext`/`AuthPage` esistono ma sono scollegati (`AuthProvider` non montato in `main.jsx`). Non pianificare né implementare il backend ora.
- **Navigazione senza react-router** — macchina a stati `currentView` in `App.jsx`: meno dipendenze, riuso diretto delle viste, nessun deep-link richiesto (PWA mono-schermo).
- **4 tab di navigazione + azioni, non 5 tab di navigazione** — "crea lista" resta un FAB per-vista; le **notifiche** sono un'azione a campanello nel tab bar (5° elemento con badge, apre `NotificationsModal`), NON una vista di navigazione. (Scelta evoluta: prima erano nell'header, poi spostate nel tab bar su richiesta.)
- **Header unico** — una sola onda condivisa + variante `isHome`, invece di header duplicati per vista.

## Design System

### Colori

| Nome | Hex | Uso |
|------|-----|-----|
| snow | #F8FAFC | Background |
| cloud | #F1F5F9 | Card |
| sky | #38BDF8 | Accento |
| ocean | #0EA5E9 | Primario |
| deep | #0284C7 | Hover |
| slate | #64748B | Testo secondario / bordi |
| night | #1E293B | Testo |

### Categorie

| ID | Nome | Icona |
|----|------|-------|
| frutta-verdura | Frutta e Verdura | Apple |
| pane-cereali | Pane e Cereali | Croissant |
| latticini | Latticini | Milk |
| carne-pesce | Carne e Pesce | Beef |
| surgelati | Surgelati | Snowflake |
| dispensa | Dispensa | Package |
| bevande | Bevande | Wine |
| igiene | Igiene Personale | Sparkles |
| casa | Casa e Pulizia | Home |
| altro | Altro | ShoppingBag |

## Persistenza

Tutto in `localStorage`, chiavi namespaced `lista-spesa-*` (nessun backend attivo — vedi Fase 2). Le principali:

| Chiave | Contenuto |
|--------|-----------|
| `lista-spesa-lists` / `lista-spesa-current` | elenco liste + id lista attiva (`useMultipleLists`) |
| `lista-spesa-items-{listId}` | prodotti di una lista (`useShoppingList`) |
| `lista-spesa-history-{listId}` | storico acquisti di una lista |
| `lista-spesa-receipts` | scontrini (dashboard, `useReceipts`) |
| `lista-spesa-favorite-products` | preferiti quick-add |
| `lista-spesa-filters-{...}` | filtri catalogo |
| `lista-spesa-location` / `lista-spesa-zone` | geolocalizzazione e zona |
| `lista-spesa-onboarding-done` | onboarding completato |
| `lista-spesa-notifs-read-v*` | notifiche lette |

Forma di un item: `{ id, name, quantity, unit, category, price, checked, created_at }`.

## Roadmap

> **Legenda:** `[x]` fatto e attivo nell'app · `[~]` parziale / mockup / codice presente ma non collegato · `[ ]` da fare.
> Stato allineato al codice (ultima verifica sorgente). Dove c'è `[~]` la nota spiega cosa manca.

### Fase 1.5 - PWA ✅
- [x] Installazione `vite-plugin-pwa`
- [x] Manifest con icone e colori
- [x] Service Worker per offline
- [x] Meta tag Apple per iOS
- [x] Cache Google Fonts

### Fase 2 - Database e Auth 🚫 RINVIATA (fuori scope in questa fase)
> **Decisione:** Supabase/backend NON si tocca in questa fase. Se ne occuperà il dev in una fase successiva. Il codice già presente resta com'è, scollegato, come base di partenza per quel lavoro futuro. **Non pianificare né implementare nulla di questa fase ora.**
- [~] Progetto Supabase — client già in `src/lib/supabase.js` (legge `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`); pronto ma non usato a runtime
- [ ] Schema `shopping_items` con RLS — tutti i dati restano in `localStorage`
- [~] Auth Magic Link — in `AuthContext.jsx` + `AuthPage.jsx`, ma `AuthProvider` non è montato in `main.jsx` → l'app non richiede login
- [ ] Sync dati tra dispositivi — persistenza 100% locale
> Per attivarla (lavoro futuro del dev): montare `AuthProvider`, gate su `AuthPage`, schema Supabase + RLS, migrazione persistenza `localStorage` → Supabase.

### Fase 3 - Smart Features ✅ / ⚠️
- [x] Prodotti ricorrenti (memoria acquisti)
- [~] Suggerimenti "Aggiungi i soliti?" — attivi ma alimentati da dati mock (`MOCK_SUGGESTIONS` in `useShoppingList.js`)
- [x] Prodotti preferiti con quick-add
- [~] Storico acquisti — cronologia salvata per lista (`lista-spesa-history-*`), manca l'interfaccia dedicata completa

### Fase 4 - Avanzate ✅ / ⚠️
- [x] Liste multiple (es. "Spesa settimanale", "Party")
- [x] Calcolo totale spesa stimato
- [x] Confronto prezzi supermercati
- [x] Liste associate a supermercato
- [~] Condivisione lista con famiglia — condivisione **base** via testo/link fatta (`ShareModal`, `ShareButton`); membri e attività liste condivise sono mockup (`ShareAvatars`, `MOCK_ACTIVITY`). Condivisione real-time con account famiglia dipende dalla Fase 2.

### Fase 5 - Prossime Feature
- [ ] OCR lista cartacea (foto lista scritta → import prodotti)
- [~] Notifiche offerte — UI completa (campanello nel tab bar, `NotificationsModal`, `useNotifications`) ma dati mockup (`offers.js`, `activity.js`); manca l'aggancio a offerte reali filtrate sui prodotti in lista
- [x] Filtri per supermercato — `useProductFilters` + `FilterBar` (filtro per supermercato, offerte, preferiti, categoria)
- [x] Budget lista (impostare/modificare limite spesa, indicatore rosso se sforato)

### Fase 6 - Fidelity & Tessere ✅
- [x] Tessere fedeltà supermercati (Fidaty, Carta Insieme, etc.)
  - Associare numero tessera/barcode a ogni supermercato
  - Mostrare barcode per scansione in cassa
- [x] Raccolta punti
  - Tracciare se raccolta punti attiva per supermercato
  - Saldo punti (inserimento manuale)
  - Scadenza punti con avviso se in scadenza

### Feature numerate (riferimenti nel codice)
> Numerazione usata solo nei commenti/commit; qui la mappa per avere una fonte unica. La sequenza è parziale (mancano numeri non ancora referenziati).

| # | Feature | Stato | Dove |
|---|---------|-------|------|
| 5 | Scontrini + dashboard spese | [x] | `ReceiptsDashboard.jsx`, `useReceipts.js` |
| 7 | Assistente IA guidato | [~] mockup | `AssistantSheet.jsx`, `CatalogPage.jsx` |
| 8 | Motore prezzi/prodotti in zona | [~] dati mock | `zonePricing.js`, `ProductItem.jsx` |
| 9 | Prezzo medio in zona | [~] dati mock | `CatalogPage.jsx`, `ProductItem.jsx` |
| 11 | Prodotti in zona (parte di 8+9+11) | [~] dati mock | `zonePricing.js` |

### Altre feature già implementate
- [x] Unità di misura (pz, kg, g, L, mL, conf)
- [x] Modifica completa prodotto (quantità, unità, prezzo)
- [x] Scanner barcode con fotocamera (`BarcodeScanner.jsx`)
- [x] Navigazione a **bottom tab bar** (4 tab) + **header unificato** — vedi *Struttura & Navigazione*
- [x] Tab **Supermercati** (preferiti in cima + discovery) + pagina dettaglio
- [x] Geolocalizzazione reale (zona + distanze) — `LocationContext`, `useLocation`
- [x] Onboarding di prima apertura (`OnboardingFlow`, `useOnboarding`)
- [x] Branding "Dai sfogo alle tue liste"

### Riepilogo "da fare" reale (in ordine di peso)
> **Fase 2 / Supabase esclusa da questo elenco per scelta**: la gestirà il dev più avanti. Tutto ciò che dipende dal backend (login reale, sync, condivisione real-time, notifiche/offerte reali agganciate all'account) è quindi rinviato con lei.

1. **OCR lista cartacea** — feature nuova, indipendente dal backend
2. **Interfaccia storico acquisti** completa (Fase 3)
3. **Rifinire i mockup lato front-end** dove possibile senza backend: assistente IA (feature 7), prezzi in zona (feature 8/9/11), suggerimenti "i soliti", UI offerte/notifiche

**Rinviato con la Fase 2 (dev, fase successiva):** login reale, sync tra dispositivi, condivisione real-time con famiglia, offerte/notifiche da dati reali.
