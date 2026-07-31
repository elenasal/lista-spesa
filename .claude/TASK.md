# Handoff — App Lista della Spesa: bottom tab bar + rifinitura header/UI (mockup FE)

**Updated**: 2026-07-31 | **Project**: lista-spesa | **CWD**: C:\Progetti\AppListadellaSpesa

## Mission
App "Lista della Spesa" (React 18 + Vite, PWA mobile-first, design "Fresh Blue": snow/cloud/sky/ocean/deep/night/slate). Si **rifiniscono i mockup front-end**, senza backend. **Vincolo forte: Supabase/backend è RINVIATO alla Fase 2 — NON implementarlo.** Dati prodotti/supermercati sono mock su Novara (solo le distanze supermercati usano coordinate reali). In questa sessione: **split della home sovraccarica in una bottom tab bar a 4 tab** + una lunga serie di rifiniture UI (header, spaziature, FAB, naming tab).

## Current State
Tutto **su disco, build verde, NON committato** (l'utente gestisce git — non committare senza richiesta). `npm run build` passa (unico warning: chunk >500kB, preesistente). Dev server `npm run dev` gira su **:3000** (strictPort) ed **è attivo ora** con HMR — non spegnerlo, riusalo.

**Tab bar split COMPLETATO e verificato a video** (piano in `docs/IMPLEMENTATION_PLAN.md`, Phase 1-3 tutte fatte). Sopra ci sono poi molte rifiniture, tutte fatte (vedi "Do NOT Redo").

**Dove ci siamo fermati**: appena aggiunto in **Prodotti** (vista CATALOG) un **FAB stellina** per l'assistente IA. Restano solo due micro-decisioni aperte con l'utente (notifiche nel footer? titolo header del tab Prodotti?) e alcuni item parcheggiati.

## Key Decisions (with why)
- **Supabase/Fase 2 rinviata** (decisione utente) — non toccare backend/auth/sync.
- **Navigazione: bottom tab bar a 4 tab che pilota `currentView` in `App.jsx`, NIENTE react-router** — meno rischio, riusa le viste esistenti (VIEWS: HOME, LIST, SUPERMARKETS, SUPERMARKET_DETAIL, CATALOG, DASHBOARD).
- **4 tab + "crea lista" come FAB** (l'utente ha scartato 5 tab). Ordine e naming FINALI (sinistra→destra): **Prodotti** (icona `Heart`, vista CATALOG) · **Spesa** (icona `ShoppingBasket`, vista HOME/liste) · **Supermercati** (icona `Store`, vista SUPERMARKETS) · **Salvadanaio** (icona `PiggyBank`, vista DASHBOARD). L'app apre ancora su HOME/"Spesa".
- **Header unificato e compatto** — una sola onda `h-12` vive nel componente `Header` per entrambe le varianti (home + standard); tolto il duplicato dell'onda da `ListsOverview`. Bottoni azione header 44×44 uniformi ovunque (`w-11 h-11`). Campanello notifiche **a filo destro** su tutte le pagine (fix: `empty:hidden` sul `header-action-portal` vuoto).
- **Home "Spesa" = solo liste** — rimosso il box azzurro collassabile `#a6dcf2` (una sola sezione, collassarla non aveva senso): card liste dirette. Header home: titolo **"La mia spesa"** + sottotitolo **"Tutte le tue liste della spesa"**, **senza** il saluto "Ciao 👋".
- **Titoli header pagine**: DASHBOARD = **"I miei acquisti"**. (Prodotti resta "Sfoglia prodotti" — vedi Open Questions.)
- **Notifiche nell'header** su tutte le viste (non più FAB in basso) — Phase 3.
- **Assistente IA in Prodotti = FAB stellina** (`Sparkle`) in basso a destra, **stessa posizione/misura del "+" di Spesa** (`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl`, gradiente viola→ocean) — sostituisce il vecchio footer full-width che si accavallava con la tab bar. I due FAB non si sovrappongono perché stanno su viste diverse.
- **Spaziature**: header padding-top `calc(env(safe-area-inset-top) + 1.5rem)` (rispetta la notch); contenuto `pt-20` uniforme su tutte e 6 le viste (staccato dall'onda).
- **Barra ricerca zona** (`LocationSearchInput`): bottone GPS ristretto `w-9 h-9`→`w-7 h-7` (+ `-mr-1`), gap interno `gap-2.5`→`gap-2`, per dare più spazio al testo.

## Next Steps (in order)
- [x] **2 micro-decisioni RISOLTE (2026-07-31)**, entrambe "nessuna modifica": (a) **notifiche** → restano SOLO nell'header (niente footer, niente 5ª tab). (b) **titolo header tab Prodotti** → resta "Sfoglia prodotti" (descrittivo, NON allineato al nome tab). → Nessun codice da toccare. Il lavoro tab bar + rifiniture è concluso.
- [x] **FATTO (2026-07-31, via `/dok`)**: `PROJECT_GUIDE.md` **rinominato in `CLAUDE.md`** (doc core auto-caricato) e riallineato — architettura navigazione, sezione *Decisioni di architettura*, persistenza/palette corrette. Creato `docs/.index.yaml` (routing doc-search).
- [ ] (Parcheggiati) Altri mockup: suggerimenti "i soliti" (MOCK_SUGGESTIONS in `useShoppingList`), offerte/notifiche (`offers.js`/`activity.js`), auto-suggerimento nome lista dallo step 4 onboarding.

## Files & Artifacts
- `src/App.jsx` — macchina a stati navigazione; monta `<BottomTabBar>` solo sulle viste top-level (HOME/SUPERMARKETS/CATALOG/DASHBOARD), nascosta su LIST/SUPERMARKET_DETAIL; costruisce `notificationBell` e lo passa a `Header`; `getHeaderInfo` (titoli/sottotitoli/showBack); passa `isHome` e `onCreateList` alle viste. **Punto centrale navigazione.**
- `src/components/layout/BottomTabBar.jsx` (NUOVO) — 4 tab (array `TABS`: view/label/Icon), attivo = `currentView === view`, `onSelect` = `setCurrentView`. Fissa in basso, `env(safe-area-inset-bottom)`, z-40.
- `src/components/layout/Header.jsx` — header unificato: `wave` (onda h-12 condivisa) + `actionSlotClasses` (box azioni 44×44); variante `isHome` (titolo+sottotitolo, no saluto, `overflow-visible` per far debordare l'onda) e variante standard (back opzionale, portali `header-avatars-portal`/`header-action-portal` con `empty:hidden`). Padding-top con safe-area.
- `src/components/ListsOverview.jsx` — LA HOME (tab "Spesa"): solo card liste dirette (niente box/collasso). `pt-20`.
- `src/components/SupermarketsPage.jsx` — tab Supermercati unificato: blocco "I miei supermercati" (preferiti ricchi) IN CIMA + lista discovery/selezione sotto. Riceve `onCreateList`. Possiede l'UNICA istanza di `useLoyaltyCards`/`useFavoriteSupermarkets` (stato per-istanza, niente context) e passa `getCard`/`hasCard` alle card.
- `src/components/supermarkets/FavoriteSupermarketCard.jsx` (NUOVO) — card ricca preferito (barcode/tessera/punti, indicazioni Google Maps, menu crea-lista/rimuovi). È `forwardRef` (serve dentro `AnimatePresence`, come `ListCard`).
- `src/components/CatalogPage.jsx` — tab Prodotti: `ProductSearchPanel` + FAB stellina assistente (`Sparkle`) bottom-right; monta `AssistantSheet`.
- `src/components/AddListSheet.jsx` — FAB "+" (`fixed bottom-20 right-4 z-40 w-14 h-14`) mostrato solo su HOME; apre il bottom sheet crea-lista (invariato).
- `src/components/ui/LocationSearchInput.jsx` — campo ricerca zona (autocomplete Nominatim + GPS), altezza `h-[42px]`, GPS `w-7 h-7`.
- `src/components/ReceiptsDashboard.jsx` / `ShoppingList.jsx` / `SupermarketDetailPage.jsx` — `pt-20` allineato (spaziatura sotto l'onda).
- `docs/IMPLEMENTATION_PLAN.md` — piano tab bar (Approval Contract box-view + task T001-T011, Phase 1-4). ATTENZIONE: viene **sovrascritto a ogni run di `/archz`**.
- `CLAUDE.md` (ex `PROJECT_GUIDE.md`, rinominato con `git mv`) — doc core: struttura & navigazione, decisioni di architettura, design system, persistenza, roadmap (Fase 2/Supabase RINVIATA). Indicizzato in `docs/.index.yaml`.
- `vite.config.js` — `server: { port: 3000, strictPort: true, open: true }`.

## Verify / Commands
- `npm run build` — UNICO gate (NON esistono lint né test). "Passa" = build Vite completata; unico warning ammesso: chunk >500kB (preesistente).
- `npm run dev` — dev server http://localhost:3000/ (strictPort). Già attivo in sessione.
- Check visivo: fatto in sessione con `fe-debug` (script Playwright `.mjs` standalone, viewport mobile 390×844 — i tool MCP Playwright NON erano disponibili). Screenshot in `…\scratchpad\` (temp sessione).

## Gotchas & Open Questions
- **NIENTE react-router**: navigazione = `currentView` in `App.jsx`; la tab bar pilota quello stato.
- **NIENTE lint/test**: build è l'unico gate. Delegare FE a `fe-dev`/`fe-css` passando "skip tests"; NON `coder` (TDD, manca infra test). L'implementazione di questa sessione è stata delegata a fe-dev/fe-css e verificata con fe-debug.
- **Git**: l'utente committa a mano. NON committare/pushare senza richiesta. NON aggiungere co-author Claude. Tutte le modifiche di sessione sono su disco, non committate.
- **Warning preesistente NON risolto** (fuori scope): `CatalogProductCard.jsx:25` — `forwardRef` mancante dentro `AnimatePresence` di framer-motion (compare aprendo Prodotti). Solo dev, nessun effetto visivo. (La stessa cosa su `FavoriteSupermarketCard` è invece GIÀ stata sistemata.)
- **Header.jsx / ListsOverview.jsx** hanno avuto modifiche anche da linter/utente durante la sessione: lo stato valido è quello su disco.
- **Notifiche nel footer**: idea dell'utente ma indecisa — non implementare finché non dice DOVE (la tab bar ha già 4 tab, l'angolo FAB è occupato).
- **Approccio preferito dall'utente**: iterazione fitta in conversazione, molto attento ai dettagli UI (altezze, allineamenti al pixel, spaziature). Ragionare il design → delegare a fe-dev/fe-css → verificare su :3000.
- **Nominatim**: coords sempre `{lat,lng}` numerici; debounce/min-char/limit/attribuzione "© OpenStreetMap" già gestiti in `useGeocodeSearch`.

## Do NOT Redo
Già completato in sessione, build verde, verificato — NON rifare:
1. **Tab bar split** (Phase 1-3 di IMPLEMENTATION_PLAN): `BottomTabBar`, cablaggio in `App.jsx`, tab bar solo su viste top-level, drill-down (LIST/SUPERMARKET_DETAIL) con back e senza tab bar.
2. **Header refactor + compattazione**: prop esplicita `isHome`, back condizionale, header home a una riga.
3. **Home ridotta a sole liste**: rimosse le 2 CTA e la sezione supermercati; rimosso il box azzurro collassabile.
4. **Merge supermercati**: `FavoriteSupermarketCard` estratta + `forwardRef`; tab Supermercati unico (preferiti in cima + discovery sotto).
5. **Notifiche nell'header** su tutte le viste; rimosso il FAB campanello in basso.
6. **FAB "crea lista"** su HOME (AddListSheet) e **FAB stellina assistente** su Prodotti (CatalogPage).
7. **Header uniformato**: onda unica h-12, bottoni azione 44×44, campanello a filo destro (`empty:hidden`).
8. **Rinomina/riordino/icone tab**: Prodotti(Heart)·Spesa(ShoppingBasket)·Supermercati(Store)·Salvadanaio(PiggyBank).
9. **Titoli**: home "La mia spesa" + sottotitolo, dashboard "I miei acquisti", tolto "Ciao 👋".
10. **Spaziature**: header padding-top con safe-area; contenuto `pt-20` su tutte le viste.
11. **Barra ricerca zona**: GPS `w-7 h-7`, gap ridotto.
