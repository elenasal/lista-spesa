import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Locate, Heart, Store, ShoppingCart,
  Check, ChevronRight, ListPlus, Sparkle,
} from 'lucide-react'
import { getSupermarketsByDistance, getSupermarketById, formatDistance } from '../data/supermarkets'
import { getLowestPrice } from '../data/productsDatabase'
import { useFavoriteSupermarkets } from '../hooks/useFavoriteSupermarkets'
import { useFavoriteProducts } from '../hooks/useFavoriteProducts'
import { useLocationContext } from '../contexts/LocationContext'
import SelectDropdown from './ui/SelectDropdown'
import CEInput from './ui/CEInput'
import LocationSearchInput from './ui/LocationSearchInput'
import AssistantSheet from './AssistantSheet'
import ProductSearchPanel from './ProductSearchPanel'

const TOTAL_STEPS = 4

const STEP_META = {
  1: { title: 'Dov’è la tua zona?', subtitle: 'Per suggerirti supermercati e prezzi vicino a te.' },
  2: { title: 'Scegli i tuoi supermercati', subtitle: 'Aggiungi quelli dove fai la spesa di solito.' },
  3: { title: 'Aggiungi 3 prodotti preferiti', subtitle: 'Sfoglia e tocca il cuore: ti serviranno per riempire le liste in un attimo.' },
  4: { title: 'Crea la tua prima lista', subtitle: 'Generica o legata a un supermercato specifico.' },
}

export default function OnboardingFlow({ onComplete, onCreateList }) {
  const [step, setStep] = useState(1)

  // Step 1 — zona: posizione reale condivisa (LocationContext). Il campo di
  // ricerca (LocationSearchInput) scrive direttamente sul contesto; qui leggiamo
  // `zone` per la scrittura legacy in goNext e passiamo GPS/stato al bottone.
  const { label: zone, requestLocation, status: locStatus } = useLocationContext()

  // Step 2 — supermercati preferiti
  const { supermarketsWithFavorites, toggleFavorite: toggleFavSupermarket, favorites: favSupermarketIds } =
    useFavoriteSupermarkets()

  // Step 3 — prodotti preferiti: la ricerca (search + cascata categoria/brand)
  // vive ora nel pannello condiviso `ProductSearchPanel`. Il "dove" NON filtra
  // qui: è un riepilogo in sola lettura degli step 1-2. Teniamo solo il seed
  // per l'assistente (aggiornato via onQueryChange).
  const { isFavorite, toggleFavorite: toggleFavProduct, favorites: favProducts } = useFavoriteProducts()
  const [productSeed, setProductSeed] = useState('')
  const [showAssistant, setShowAssistant] = useState(false)

  // Nomi dei supermercati preferiti (riepilogo sola-lettura dello step 2)
  const favSupermarketNames = useMemo(
    () => favSupermarketIds.map((id) => getSupermarketById(id)?.name).filter(Boolean),
    [favSupermarketIds]
  )

  // Step 4 — prima lista
  const [listName, setListName] = useState('')
  const [listSupermarketId, setListSupermarketId] = useState(null)
  const supermarketOptions = useMemo(
    () =>
      getSupermarketsByDistance()
        .filter((sm) => favSupermarketIds.includes(sm.id))
        .map((sm) => ({ value: sm.id, label: sm.name, color: sm.color })),
    [favSupermarketIds]
  )

  const finish = (listId) => onComplete(listId)

  const goNext = () => {
    if (step === 1 && zone.trim()) {
      try { localStorage.setItem('lista-spesa-zone', zone.trim()) } catch { /* no-op */ }
    }
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else finish()
  }

  const handleCreateAndFinish = () => {
    const name = listName.trim() || 'La mia spesa'
    const newList = onCreateList(name, listSupermarketId || null)
    finish(newList?.id)
  }

  const meta = STEP_META[step]

  return (
    <div className="fixed inset-0 z-50 bg-white flex justify-center">
      <div className="w-full max-w-lg flex flex-col">
      {/* Header con avanzamento */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">
            Passo {step} di {TOTAL_STEPS}
          </span>
          <button
            onClick={() => finish()}
            className="text-sm text-slate-light hover:text-slate font-medium transition-colors"
          >
            Salta tutto
          </button>
        </div>
        {/* Barra avanzamento */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? 'bg-ocean' : 'bg-cloud'
              }`}
            />
          ))}
        </div>
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-night">{meta.title}</h1>
          <p className="text-slate mt-1">{meta.subtitle}</p>
        </div>
      </div>

      {/* Contenuto step (scrollabile) */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <StepLocation
                onUseMyLocation={requestLocation}
                status={locStatus}
              />
            )}
            {step === 2 && (
              <StepSupermarkets
                supermarkets={supermarketsWithFavorites}
                onToggle={toggleFavSupermarket}
                selectedCount={favSupermarketIds.length}
              />
            )}
            {step === 3 && (
              <StepProducts
                zoneLabel={zone}
                supermarketNames={favSupermarketNames}
                selectedCount={favProducts.length}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavProduct}
                onOpenAssistant={() => setShowAssistant(true)}
                onQueryChange={setProductSeed}
              />
            )}
            {step === 4 && (
              <StepFirstList
                listName={listName}
                setListName={setListName}
                supermarketId={listSupermarketId}
                setSupermarketId={setListSupermarketId}
                supermarketOptions={supermarketOptions}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer azioni */}
      <div className="px-5 py-4 border-t border-cloud bg-white flex items-center gap-3">
        {step < TOTAL_STEPS ? (
          <>
            <button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-deep transition-colors"
            >
              Continua
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="px-4 py-3 text-slate hover:text-night font-medium transition-colors"
            >
              Salta
            </button>
          </>
        ) : (
          <button
            onClick={handleCreateAndFinish}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-deep transition-colors"
          >
            Crea lista e inizia
          </button>
        )}
      </div>
      </div>

      {/* Assistente guidato (bottom sheet con maniglia) */}
      <AssistantSheet
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        seedQuery={productSeed}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavProduct}
        contextSupermarketIds={favSupermarketIds}
        contextZoneLabel={zone}
      />
    </div>
  )
}

// ---- Step 1: posizione ----
function StepLocation({ onUseMyLocation, status }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-2 ${status === 'granted' ? 'bg-emerald-50' : 'bg-sky-light'}`}>
          <MapPin className={`w-10 h-10 ${status === 'granted' ? 'text-emerald-500' : 'text-ocean'}`} />
        </div>
        {status === 'granted' && <p className="text-sm text-emerald-600 font-medium">Posizione rilevata ✓</p>}
        {status === 'denied' && <p className="text-sm text-rose-500">Posizione negata: cerca la zona a mano.</p>}
      </div>

      <button
        onClick={onUseMyLocation}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-light text-ocean font-semibold hover:bg-sky-light/70 transition-colors"
      >
        <Locate className={`w-5 h-5 ${status === 'loading' ? 'animate-pulse' : ''}`} />
        {status === 'loading' ? 'Rilevamento…' : status === 'granted' ? 'Aggiorna posizione' : 'Usa la mia posizione'}
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-light">
        <div className="flex-1 h-px bg-cloud" />
        oppure cerca la zona
        <div className="flex-1 h-px bg-cloud" />
      </div>

      {/* Ricerca località con autocomplete; GPS gestito dal grande bottone sopra */}
      <LocationSearchInput placeholder="Es. Novara" showGpsButton={false} />

      <p className="text-xs text-slate-light text-center px-4">
        Puoi saltare questo passo: potrai impostare la zona in seguito.
      </p>
    </div>
  )
}

// ---- Step 2: supermercati ----
function StepSupermarkets({ supermarkets, onToggle, selectedCount }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate">
        Selezionati: <span className="font-semibold text-ocean">{selectedCount}</span>
      </p>
      {supermarkets.map((sm) => (
        <button
          key={sm.id}
          onClick={() => onToggle(sm.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
            sm.isFavorite ? 'border-sky bg-sky-light/30' : 'border-cloud bg-white hover:border-sky/50'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sm.color }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-night truncate">{sm.name}</p>
            <p className="text-xs text-slate truncate">{sm.address} · {formatDistance(sm.distance)}</p>
          </div>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              sm.isFavorite ? 'bg-pink-100 text-pink-500' : 'bg-cloud text-slate'
            }`}
          >
            <Heart className={`w-5 h-5 ${sm.isFavorite ? 'fill-current' : ''}`} />
          </div>
        </button>
      ))}
    </div>
  )
}

// ---- Step 3: prodotti (pannello condiviso + riepilogo sola-lettura step 1-2) ----
function StepProducts({
  zoneLabel, supermarketNames, selectedCount, isFavorite, onToggleFavorite, onOpenAssistant, onQueryChange,
}) {
  // Riepilogo sola-lettura degli step 1-2, con fallback per step saltati.
  const zoneText = zoneLabel && zoneLabel.trim() ? zoneLabel.trim() : 'Nessuna zona impostata'
  const shownMarkets = supermarketNames.slice(0, 3)
  const extraCount = supermarketNames.length - shownMarkets.length
  const marketsText =
    supermarketNames.length > 0
      ? shownMarkets.join(', ') + (extraCount > 0 ? ` +${extraCount}` : '')
      : 'Nessun supermercato selezionato'

  const handleToggleFavorite = (product) =>
    onToggleFavorite({
      name: product.name,
      category: product.category,
      price: getLowestPrice(product)?.price ?? null,
    })

  return (
    <ProductSearchPanel
      supermarketId={null}
      isFavorite={isFavorite}
      onToggleFavorite={handleToggleFavorite}
      onQueryChange={onQueryChange}
      contextSlot={
        <div className="space-y-4">
          {/* Riepilogo SOLA LETTURA e NUMERATO degli step 1-2 (zona + supermercati
             preferiti). Non modificabile e NON filtra i risultati (supermarketId=null). */}
          <div className="space-y-2 rounded-xl border border-cloud bg-sky-light/20 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-ocean flex-shrink-0" />
              <span className="text-sm text-night truncate">
                <span className="font-semibold">1.</span> Zona: {zoneText}
              </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-4 h-4 text-ocean flex-shrink-0" />
              <span className="text-sm text-night truncate">
                <span className="font-semibold">2.</span> Supermercati: {marketsText}
              </span>
            </div>
          </div>

          {/* CTA-eroe: l'assistente come azione principale suggerita (come nel catalogo). */}
          <button
            onClick={onOpenAssistant}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-ocean text-white text-left shadow-soft-lg active:scale-[0.99] transition-transform"
          >
            <span className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkle className="w-6 h-6 fill-current" />
            </span>
            <span className="min-w-0">
              <span className="block font-bold">Fatti guidare dall'assistente</span>
              <span className="block text-sm text-white/80">Poche domande e ti suggerisce i prodotti giusti</span>
            </span>
          </button>

          {/* Divider tra il CTA-eroe e la barra di ricerca (dentro il pannello). */}
          <div className="flex items-center gap-3 text-xs text-slate-light">
            <div className="flex-1 h-px bg-cloud" />
            oppure cerca manualmente
            <div className="flex-1 h-px bg-cloud" />
          </div>
        </div>
      }
      beforeResultsSlot={
        <div className="mt-4">
          {/* Contatore "X di 3" */}
          <div className="flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
            <span className="font-semibold text-night">{selectedCount}</span>
            <span className="text-slate">di 3</span>
          </div>
        </div>
      }
    />
  )
}

// ---- Step 4: prima lista ----
function StepFirstList({ listName, setListName, supermarketId, setSupermarketId, supermarketOptions }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-20 h-20 rounded-3xl bg-sky-light flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-ocean" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate uppercase tracking-wider">Tipo di lista</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => setSupermarketId(null)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              supermarketId === null ? 'border-ocean bg-sky-light/30 text-ocean' : 'border-cloud text-slate hover:border-sky/50'
            }`}
          >
            {supermarketId === null && <Check className="w-4 h-4" />}
            Generica
          </button>
          <SelectDropdown
            value={supermarketId}
            onChange={setSupermarketId}
            options={supermarketOptions}
            allLabel="Scegli supermercato"
            placeholder="Supermercato"
            icon={<Store className="w-4 h-4" />}
          />
        </div>
        {supermarketOptions.length === 0 && (
          <p className="text-xs text-slate-light mt-2">
            Per legare la lista a un supermercato, aggiungine uno ai preferiti nel passo precedente.
          </p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate uppercase tracking-wider">Nome della lista</label>
        <div className="flex items-center gap-2.5 px-3 py-3 mt-2 bg-white border border-cloud rounded-xl focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/20 transition-colors">
          <ListPlus className="w-5 h-5 text-slate flex-shrink-0" />
          <CEInput
            autoFocus
            value={listName}
            onChange={setListName}
            placeholder="Es. Spesa della settimana"
            ariaLabel="Nome della lista"
            className="flex-1 min-w-0 text-night"
          />
        </div>
      </div>
    </div>
  )
}
