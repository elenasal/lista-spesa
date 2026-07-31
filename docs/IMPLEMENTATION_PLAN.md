# Implementation Plan — Split della home in bottom tab bar (4 tab + FAB)

## Summary
- **What**: Ristrutturare la navigazione dell'app "Lista della Spesa" introducendo una **bottom tab bar persistente a 4 tab** (Liste · Supermercati · Sfoglia · Spese) che pilota lo stato `currentView` in `App.jsx`. Alleggerire la home alle sole liste, trasformare "crea lista" in un **FAB**, unificare le due superfici "supermercati" e spostare le notifiche nell'header.
- **Stack**: React 18 + Vite, Tailwind (design "Fresh Blue"), framer-motion, lucide-react. **NESSUN backend** (Supabase rinviato a Fase 2 — non toccare). **NESSUN react-router** (navigazione = macchina a stati `currentView`).
- **Complexity**: complex (nuovo confine di navigazione + merge di superfici sovrapposte, ~6 file). Token effort medio (~40-60k in implementazione).
- **Cost**: €0/mo (solo FE mockup, nessun servizio esterno nuovo).
- **Gate**: `npm run build` (unico gate; niente lint/test). Dev server `npm run dev` su :3000 (strictPort).

## Requirements
- **R1** — Bottom tab bar persistente a 4 tab (Liste · Supermercati · Sfoglia · Spese) che pilota `currentView`, senza react-router.
- **R2** — Home alleggerita alle sole liste (rimuovere le 2 CTA di navigazione e la sezione supermercati).
- **R3** — "Crea lista" come **FAB** (non tab), riusando il bottom sheet/form esistente di `AddListSheet`.
- **R4** — Unificare le due superfici "supermercati" (sezione home + `SupermarketsPage`) in un unico tab che sia sia discovery/selezione preferiti sia gestione (tessere/barcode/indicazioni/crea-lista).
- **R5** — Riconciliare la zona bassa (tab bar + FAB + notifiche) senza sovrapposizioni; spostare il campanello notifiche nell'header.
- **R6** — Le viste di dettaglio (lista aperta, dettaglio supermercato) restano drill-down con back, **senza** tab bar.
- **R7** — Header **compatto e unificato** (home inclusa): ridurre l'ingombro verticale ora che la tab bar fornisce identità/navigazione — rimuovere il grande blocco saluto in home e ridurre i padding/decorazioni, mantenendo lo stile "Fresh Blue".

## Approval Contract (box-view)

| Component | C4 level | Responsibility | requirement_ids | Contract (in → out) | connects_to | concept_tags | Rationale | Hotspot |
|-----------|----------|----------------|-----------------|---------------------|-------------|--------------|-----------|---------|
| `app-shell` | container | Possiede la macchina a stati `currentView`, decide la chrome (tab bar vs header-back vs FAB) per ogni vista | R1,R5,R6 | eventi navigazione → vista attiva + chrome | `bottom-tab-bar`, `lists-home`, `supermarkets-tab`, `create-list-fab`, `notifications-bell`, `app-header` | state-machine, navigation | È già il punto unico di navigazione (`App.jsx`); riusarlo evita react-router (R1) e centralizza le regole tab/drill-down (R6) | medium — logica "quando mostrare cosa" tocca tutte le viste |
| `bottom-tab-bar` | component | Rende 4 tab, evidenzia l'attiva da `currentView`, emette la selezione | R1 | (currentView, onSelect) → tab UI + eventi nav | `app-shell` | tabs, bottom-nav | R1 chiede una nav principale a 4 destinazioni top-level su mobile | low — componente presentazionale nuovo |
| `app-header` | component | Header **compatto** unificato: variante home (identità sintetica) e standard (titolo + back opzionale + azioni) | R5,R6,R7 | (isHome, title, onBack?, rightAction) → header UI | `app-shell`, `notifications-bell` | layout, header | Oggi la variante è dedotta da `onBack`; scorporarla serve per header top-level senza back (R6) e per ospitare le notifiche (R5); la tab bar rende superfluo il grande saluto home → si compatta (R7) | medium — refactor che tocca tutte le viste |
| `lists-home` | component | Mostra SOLO le liste (card, selezione, riordino, modifica, condivisione) | R2 | (lists) → card liste + azioni | `app-shell` | list-management | R2: la home va ridotta alle liste; CTA e supermercati escono | low — rimozione di sezioni esistenti |
| `create-list-fab` | component | FAB "+" sul tab Liste che apre il bottom sheet di creazione lista (form invariato) | R3 | (tap) → nuova lista via onCreateList | `app-shell` | fab, form-sheet | R3: creare lista è un'azione, non una destinazione → FAB, non tab | low — split trigger/sheet in componente esistente |
| `supermarkets-tab` | component | Superficie unica: blocco "I miei supermercati" (gestione preferiti) sopra la lista discovery/selezione | R4 | (posizione, preferiti) → gestione + selezione | `app-shell`, `favorite-supermarket-card` | discovery, favorites | R4: eliminare la doppia superficie fondendo home-section + `SupermarketsPage` | medium — assorbe logica da due file |
| `favorite-supermarket-card` | component | Card ricca di un preferito: barcode/tessera/punti, indicazioni, crea-lista, rimuovi | R4 | (supermarketId, callbacks) → card + azioni | `supermarkets-tab` | loyalty-card, barcode | Estrarre la card ricca (oggi in `ListsOverview`) permette di spostarla nel tab senza duplicarla | low — estrazione di JSX esistente |
| `notifications-bell` | component | Campanello notifiche + badge non-letti, nell'header (non più FAB) | R5 | (unreadCount, onOpen) → bell UI | `app-shell`, `app-header` | notifications | R5: liberare la zona bassa già occupata da tab bar + FAB | low — spostamento di un elemento esistente |

**Flow**: `bottom-tab-bar → app-shell (currentView) → {lists-home | supermarkets-tab | catalog | dashboard}`; drill-down `lists-home → LIST` e `supermarkets-tab → SUPERMARKET_DETAIL` nascondono la tab bar e mostrano il back in `app-header`; `create-list-fab` visibile solo su Liste; `notifications-bell` vive in `app-header` su tutte le viste.

**Story**: la tab bar diventa l'unica barra di navigazione top-level e pilota `currentView`; la home resta solo liste, i supermercati hanno un tab unico, creare una lista è un FAB e le notifiche salgono nell'header — così la zona bassa ospita solo tab bar (+ FAB contestuale) senza affollamento.

---

## Phase 1 — Tab bar + FAB + home senza CTA

### [T001-FE] Componente BottomTabBar
- **Files**: `src/components/layout/BottomTabBar.jsx` (nuovo)
- **Cosa**: barra fissa in basso, `max-w-lg mx-auto`, stile "Fresh Blue" (bg bianco/ocean, active in ocean, inattivi in slate). 4 tab con icona + label: Liste (`ClipboardList`), Supermercati (`Store`), Sfoglia (`PackageOpen`), Spese (`Receipt`). Props: `currentView`, `onSelect(view)`. L'attiva è derivata da `currentView` mappando HOME→Liste, SUPERMARKETS→Supermercati, CATALOG→Sfoglia, DASHBOARD→Spese.
- **Acceptance**: rende 4 tab; la tab corrispondente a `currentView` è evidenziata; il tap chiama `onSelect(view)`; z-index sopra il contenuto, sotto i bottom sheet/modali.
- **Tests**: nessuno (no infra test) — verifica in build + visivo.

### [T002-FE] Refactor + compattazione Header (home inclusa)
- **Files**: `src/components/layout/Header.jsx`, `src/App.jsx`
- **Cosa**:
  1. **Variante esplicita**: sostituire la deduzione `isHome = !onBack` con una **prop esplicita** (es. `isHome`). Nella variante standard rendere il **back button condizionale** (solo se `onBack` presente), così una vista top-level (Supermercati/Sfoglia/Spese) usa l'header standard **senza back** e **senza** saluto.
  2. **Compattazione home** (R7): rimuovere il grande blocco saluto "Bentornato / titolo XL / sottotitolo lungo" e la texture pesante (cerchi/blur/watermark alti). L'header home diventa una **fascia bassa a una riga** ~56-64px: identità sintetica a sinistra (titolo breve, es. "Le mie liste"; niente pretitle "Bentornato", sottotitolo omesso o minimo) + azioni a destra (help + campanello). Mantenere colore ocean e, se serve, una wave/decorazione **ridotta**.
  3. **Compattazione standard**: ridurre i padding verticali dell'header standard mantenendo titolo (+ sottotitolo breve), back opzionale, portali avatar/azioni e la wave esistente.
- **Depends**: —
- **Acceptance**: HOME → header compatto una-riga (titolo breve + azioni), niente blocco saluto grande; SUPERMARKETS/CATALOG/DASHBOARD → header standard compatto con titolo, senza back; LIST/SUPERMARKET_DETAIL → header standard compatto con back. Portali `header-avatars-portal`/`header-action-portal` e wave preservati; nessuna rottura di layout sulle viste interne.
- **Tests**: build + visivo su :3000 (controllare l'altezza guadagnata in home e la coerenza tra viste).

### [T003-FE] Cablare la tab bar in App.jsx
- **Files**: `src/App.jsx`
- **Cosa**: definire l'insieme delle viste top-level `{HOME, SUPERMARKETS, CATALOG, DASHBOARD}`. Rendere `<BottomTabBar currentView onSelect={setCurrentView} />` **solo** su queste; nasconderla su LIST e SUPERMARKET_DETAIL (R6). Aggiornare `getHeaderInfo`: per SUPERMARKETS/CATALOG/DASHBOARD `showBack:false` (ma `isHome` true solo per HOME); LIST/SUPERMARKET_DETAIL invariati con back. Aumentare il `padding-bottom` del `<main>` per non far coprire il contenuto dalla tab bar (mantenere ≥ altezza tab bar + safe-area).
- **Depends**: T001, T002
- **Acceptance**: switch tra i 4 tab cambia vista e header correttamente; su lista aperta e dettaglio supermercato la tab bar sparisce e compare il back; il contenuto in fondo non finisce sotto la tab bar.
- **Tests**: build + visivo su :3000.

### [T004-FE] "Crea lista" come FAB sul tab Liste
- **Files**: `src/components/AddListSheet.jsx`, `src/App.jsx`
- **Cosa**: sostituire la barra fissa full-width "Nuova lista..." con un **FAB "+"** (bottom-right) mostrato **solo** quando `currentView === HOME`, posizionato **sopra** la tab bar. Il bottom sheet/form di creazione resta identico (nome/tipo/budget). `App.jsx` continua a montare `AddListSheet` solo in home.
- **Depends**: T003
- **Acceptance**: sul tab Liste appare il FAB "+"; il tap apre il bottom sheet esistente; creando una lista si naviga in LIST (tab bar nascosta); su altri tab il FAB non c'è.
- **Tests**: build + visivo.

### [T005-FE] Rimuovere le 2 CTA dalla home
- **Files**: `src/components/ListsOverview.jsx`, `src/App.jsx`
- **Cosa**: rimuovere i due bottoni CTA "Sfoglia prodotti" e "Le mie spese" (ora raggiungibili via tab) e le prop/handler collegati non più usati (`onNavigateToCatalog`, `onNavigateToDashboard` in `ListsOverview`; se restano orfani, ripulire `handleOpenCatalog`/`handleOpenDashboard` in `App.jsx` — la navigazione ora passa da `setCurrentView` della tab bar). **NON** toccare ancora la sezione supermercati (spostata in Phase 2).
- **Depends**: T003
- **Acceptance**: la home non mostra più le 2 CTA; Sfoglia/Spese restano raggiungibili solo via tab; build verde, nessun import/prop orfano che rompe la build.
- **Tests**: build + visivo.

## Phase 2 — Unificare le superfici "supermercati"

### [T006-FE] Estrarre FavoriteSupermarketCard
- **Files**: `src/components/supermarkets/FavoriteSupermarketCard.jsx` (nuovo), estraendo da `src/components/ListsOverview.jsx`
- **Cosa**: estrarre la card ricca del preferito (mini-header nome+stato aperto/chiuso, riquadro barcode/tessera con punti o CTA "Aggiungi tessera", bottone indicazioni Google Maps, menu con "Crea lista"/"Rimuovi") in un componente autonomo. Props: `supermarketId`, `onCreateList(supermarket)`, e i callback tessera (display/edit). Il componente gestisce internamente `getCard/hasCard/getOpenStatus` come oggi.
- **Depends**: — (legge il JSX ancora presente in `ListsOverview`)
- **Acceptance**: il componente rende una card identica all'attuale sezione home per un preferito dato; nessun uso ancora rimosso da `ListsOverview` in questo task.
- **Tests**: build.

### [T007-FE] Montare i preferiti nel tab Supermercati
- **Files**: `src/components/SupermarketsPage.jsx`, `src/App.jsx`
- **Cosa**: in cima a `SupermarketsPage` (tab Supermercati) aggiungere un blocco "**I miei supermercati**" che rende `FavoriteSupermarketCard` per ogni preferito (con i relativi modali tessera e "crea lista"), **sopra** la lista discovery/selezione già esistente. Passare `onCreateList` da `App.jsx` → `SupermarketsPage` (riuso di `handleCreateList`). I preferiti restano visibili anche nella lista discovery sottostante (dove si tolgono col cuore) — il blocco in alto serve alle azioni tessera/indicazioni/crea-lista.
- **Depends**: T006
- **Acceptance**: sul tab Supermercati compaiono in alto le card ricche dei preferiti (barcode/indicazioni/crea-lista funzionanti) e sotto la lista completa per selezionare/deselezionare; "crea lista" da qui naviga nella nuova lista.
- **Tests**: build + visivo.

### [T008-FE] Rimuovere la sezione supermercati dalla home
- **Files**: `src/components/ListsOverview.jsx`, `src/App.jsx`
- **Cosa**: rimuovere da `ListsOverview` l'intera sezione "I miei supermercati" e tutto ciò che diventa orfano solo per essa (import `useFavoriteSupermarkets`/`useLoyaltyCards`, modali tessera, `handleCreateListForSupermarket`, prop `onNavigateToSupermarkets`, icone inutilizzate). La home resta **solo liste** (R2). Ripulire in `App.jsx` la prop `onNavigateToSupermarkets` se non più usata altrove.
- **Depends**: T007 (la funzionalità deve già vivere nel tab prima di toglierla dalla home)
- **Acceptance**: la home mostra solo il pannello liste + FAB; nessun riferimento orfano; build verde.
- **Tests**: build + visivo.

## Phase 3 — Riconciliare la zona bassa e le notifiche

### [T009-FE] Notifiche dal FAB all'header
- **Files**: `src/App.jsx`, `src/components/layout/Header.jsx`
- **Cosa**: spostare il campanello notifiche (con badge non-letti) dal FAB bottom-right dentro l'header come azione a destra, su tutte le viste. Su HOME l'header ospita `HelpCircle` **+** campanello (passare un fragment con entrambi in `rightAction`); sull'header standard il campanello entra tra le azioni (eredita lo stile a box bianco). Rimuovere il vecchio bottone campanello FAB in fondo.
- **Depends**: T003
- **Acceptance**: il campanello è nell'header su tutte le viste con badge corretto; il tap apre `NotificationsModal`; niente più campanello in basso a destra.
- **Tests**: build + visivo.

### [T010-FE] Rifinitura spaziature zona bassa
- **Files**: `src/App.jsx`
- **Cosa**: ora che il campanello non è più in basso, rimuovere gli offset `bottom-24` residui e verificare che FAB (solo Liste) e tab bar non si sovrappongano e non coprano contenuto; uniformare il `padding-bottom` del `<main>` a tab bar + safe-area.
- **Depends**: T004, T009
- **Acceptance**: nessuna sovrapposizione tra tab bar, FAB e contenuto su tutte le viste; margini coerenti.
- **Tests**: build + visivo.

## Phase 4 — Verifica

### [T011-TST] Verifica build + visiva
- **Cosa**: `npm run build` verde (unico gate; l'unico warning chunk >500kB è preesistente). Check visivo su :3000: i 4 tab navigano e l'attivo è evidenziato; drill-down (lista, dettaglio supermercato) nasconde la tab bar e mostra il back; FAB "crea lista" solo su Liste; notifiche nell'header; tab Supermercati con preferiti in alto + discovery sotto; home solo liste.
- **Depends**: T001–T010
- **Acceptance**: build verde e tutti i punti del check visivo superati.

## Execution Order
1. **Phase 1** (T001, T002 → T003 → T004, T005): tab bar navigabile, FAB, home senza CTA.
2. **Phase 2** (T006 → T007 → T008): tab Supermercati unificato, home solo liste.
3. **Phase 3** (T009 → T010): notifiche in header, zona bassa pulita.
4. **Phase 4** (T011): verifica finale.

Ogni fase è indipendentemente buildabile e verificabile su :3000.

## Definition of Done
- [ ] Tab bar a 4 tab pilota `currentView`, senza react-router; attivo evidenziato (R1).
- [ ] Home = solo liste (R2); nessuna CTA, nessuna sezione supermercati.
- [ ] "Crea lista" è un FAB sul tab Liste, riusa il bottom sheet esistente (R3).
- [ ] Tab Supermercati unico: gestione preferiti (barcode/indicazioni/crea-lista) + discovery/selezione (R4); niente doppia superficie.
- [ ] Notifiche nell'header; zona bassa senza sovrapposizioni (R5).
- [ ] Drill-down (lista, dettaglio supermercato) senza tab bar, con back (R6).
- [ ] Header compatto su tutte le viste, home inclusa (niente più blocco saluto grande) (R7).
- [ ] `npm run build` verde.

## Notes / Gotchas
- **Header**: la variante era dedotta da `onBack` (`isHome = !onBack`) — reso esplicito in T002, altrimenti le viste-tab senza back mostrerebbero l'header "Bentornato". La **rimozione del blocco saluto in home** e la compattazione (R7) sono **approvate dall'utente** in questa sessione.
- **Doppia superficie transitoria**: dopo Phase 1 la home mostra ancora la sezione supermercati mentre esiste il tab Supermercati; la duplicazione è temporanea e si chiude in T008 (staging per non perdere il JSX da estrarre in T006).
- **Preferiti visibili due volte nel tab** (blocco in alto + lista discovery): scelta accettata (pinned + lista completa); eventuale rifinitura futura, non bloccante.
- **No test/lint**: build è l'unico gate. Delegare a `fe-dev`/`fe-css` (passare "skip tests"); niente `coder` TDD (manca infra test).
- **Git**: l'utente committa a mano; non committare/pushare; nessun co-author Claude.
