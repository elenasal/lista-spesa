import { useState, useMemo } from 'react'
import { Sparkles, X, RotateCcw, Search, Send } from 'lucide-react'
import { PRODUCTS_DATABASE, getLowestPrice, getBrand, suggestBrandsForTerm } from '../data/productsDatabase'
import { CATEGORY_ORDER, getCategoryName, suggestCategoriesByKeyword } from '../data/categories'
import { getSupermarketsByDistance } from '../data/supermarkets'
import CatalogProductCard from './CatalogProductCard'
import BottomSheet from './ui/BottomSheet'

// Assistente IA (feature 7) — MOCKUP. Guida la scelta con poche domande mirate e
// propone i prodotti più adatti. La vera logica conversazionale la aggancerà il dev;
// qui il flusso è scriptato e filtra il catalogo in base alle risposte.

const PRICE_OPTIONS = [
  { value: 'cheap', label: 'Il più economico' },
  { value: 'value', label: 'Buon rapporto qualità/prezzo' },
  { value: 'any', label: 'Non importa' },
]

const SALE_OPTIONS = [
  { value: true, label: 'Sì, solo offerte' },
  { value: false, label: 'No, indifferente' },
]

export default function AssistantSheet({
  isOpen,
  onClose,
  seedQuery = '',
  onAddToList = null,
  isFavorite,
  onToggleFavorite,
}) {
  const seed = seedQuery.trim()
  const [answers, setAnswers] = useState({})
  const [stepIndex, setStepIndex] = useState(0)
  const [optionQuery, setOptionQuery] = useState('') // input libero / filtro liste lunghe
  const [showAllCats, setShowAllCats] = useState(false) // "nessuna di queste" → scegli tra tutte

  // Categorie presenti a catalogo (per la domanda "tipo di prodotto")
  const categoryOptions = useMemo(() => {
    const present = new Set(PRODUCTS_DATABASE.map((p) => p.category))
    return CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({ value: c, label: getCategoryName(c) }))
  }, [])

  const supermarketOptions = useMemo(
    () => [
      { value: null, label: 'Indifferente' },
      ...getSupermarketsByDistance().map((sm) => ({ value: sm.id, label: sm.name })),
    ],
    []
  )

  // Termine cercato: dal seed (ricerca precedente) o digitato nel primo step.
  const term = (seed || answers.term || '').trim()

  // Marchi proposti: coerenti col termine (es. patatine → Amica Chips, San Carlo…);
  // in mancanza, i marchi presenti nella categoria scelta. Sempre + "Indifferente".
  const brandOptions = useMemo(() => {
    const suggested = suggestBrandsForTerm(term)
    let brands
    if (suggested.length) {
      brands = suggested
    } else {
      const cat = answers.category
      const set = new Set()
      for (const p of PRODUCTS_DATABASE) {
        if (cat && p.category !== cat) continue
        const b = getBrand(p)
        if (b) set.add(b)
      }
      brands = [...set].sort((a, b) => a.localeCompare(b, 'it'))
    }
    return [{ value: null, label: 'Indifferente' }, ...brands.map((b) => ({ value: b, label: b }))]
  }, [term, answers.category])

  // Categorie plausibili dedotte dal termine (parole-chiave + nomi prodotto del DB).
  // Ne proponiamo al massimo 3 (come nelle app reali: pochi candidati tra cui scegliere).
  const deducedCategories = useMemo(() => {
    const t = term.toLowerCase()
    if (!t) return []
    const cats = new Set(suggestCategoriesByKeyword(t))
    for (const p of PRODUCTS_DATABASE) {
      if (p.name.toLowerCase().includes(t)) cats.add(p.category)
    }
    return categoryOptions.filter((o) => cats.has(o.value)).slice(0, 3)
  }, [term, categoryOptions])

  // Sequenza: (termine se non c'è un seed) → categoria → prezzo → supermercato → offerte
  const steps = useMemo(() => {
    const s = []
    if (!seed) s.push({ key: 'term', kind: 'text' })
    s.push({ key: 'category', kind: 'category' })
    s.push({ key: 'brand', kind: 'chips', q: 'Hai preferenza di marchio?', options: brandOptions })
    s.push({ key: 'price', kind: 'chips', q: 'Che priorità dai al prezzo?', options: PRICE_OPTIONS })
    s.push({ key: 'supermarket', kind: 'chips', q: 'Preferisci un supermercato?', options: supermarketOptions })
    s.push({ key: 'sale', kind: 'chips', q: 'Solo prodotti in offerta?', options: SALE_OPTIONS })
    return s
  }, [seed, brandOptions, supermarketOptions])

  const done = stepIndex >= steps.length

  // Suggerimenti finali. Priorità: prodotti reali coerenti col termine (match anche
  // per singola parola); se il DB mock non li copre, si sintetizzano prodotti coerenti
  // col termine + marchi (così il mockup "regge": chiedi patatine → vedi patatine).
  const suggestions = useMemo(() => {
    if (!done) return []

    const topN = (arr) =>
      arr
        .map((p) => ({ p, best: getLowestPrice(p, answers.supermarket || null) }))
        .sort((a, b) => (a.best?.price ?? Infinity) - (b.best?.price ?? Infinity))
        .slice(0, 4)
        .map((x) => x.p)

    const words = term.toLowerCase().split(/\s+/).filter((w) => w.length >= 4)
    const nameMatches = (p) => {
      if (!term) return true
      const n = p.name.toLowerCase()
      return n.includes(term.toLowerCase()) || words.some((w) => n.includes(w))
    }

    // Prodotti sintetici coerenti col termine per i marchi indicati
    const buildSynth = (brands) => {
      const capTerm = term ? term.charAt(0).toUpperCase() + term.slice(1) : 'Prodotto'
      const cat = answers.category || deducedCategories[0]?.value || 'dispensa'
      const smList = getSupermarketsByDistance()
      const smIds = answers.supermarket ? [answers.supermarket] : smList.slice(0, 3).map((s) => s.id)
      return brands.map((brand, i) => {
        const base = 1.19 + i * 0.2
        const prices = {}
        smIds.forEach((smId, j) => {
          const p = +(base + j * 0.1).toFixed(2)
          prices[smId] = answers.sale && j === 0
            ? { price: +(p + 0.5).toFixed(2), onSale: true, salePrice: p }
            : { price: p }
        })
        return {
          id: `synth-${i}-${brand || 'generic'}`,
          name: brand ? `${brand} ${capTerm}` : capTerm,
          category: cat,
          prices,
        }
      })
    }

    // Base reale filtrata per categoria/supermercato/offerte
    let base = PRODUCTS_DATABASE
    if (answers.category) base = base.filter((p) => p.category === answers.category)
    if (answers.supermarket) base = base.filter((p) => p.prices[answers.supermarket])
    if (answers.sale) base = base.filter((p) => Object.values(p.prices).some((pr) => pr.onSale))

    // Marchio scelto: se c'è un prodotto reale di quel marchio coerente → usalo,
    // altrimenti sintetizza con QUEL marchio (per non tradire la scelta).
    if (answers.brand) {
      const real = base.filter((p) => getBrand(p) === answers.brand && nameMatches(p))
      if (real.length) return topN(real)
      return topN(buildSynth([answers.brand]))
    }

    // Senza marchio: prima i prodotti reali che matchano il termine
    const nameMatched = base.filter(nameMatches)
    if (nameMatched.length) return topN(nameMatched)

    // Nessun reale: sintetizza sui marchi plausibili del termine (o generico)
    if (term) {
      const hinted = suggestBrandsForTerm(term).slice(0, 4)
      return topN(buildSynth(hinted.length ? hinted : [null]))
    }

    return topN(base)
  }, [done, term, answers, deducedCategories])

  const advance = () => {
    setStepIndex((i) => i + 1)
    setOptionQuery('')
    setShowAllCats(false)
  }

  const pick = (step, value) => {
    setAnswers((prev) => ({ ...prev, [step.key]: value }))
    advance()
  }

  const submitTerm = () => {
    const t = optionQuery.trim()
    if (!t) return
    setAnswers((prev) => ({ ...prev, term: t }))
    advance()
  }

  const restart = () => {
    setAnswers({})
    setStepIndex(0)
    setOptionQuery('')
    setShowAllCats(false)
  }

  const transcriptLabel = (step) => {
    if (step.key === 'term') return answers.term
    if (step.key === 'category') return answers.category ? getCategoryName(answers.category) : 'Nessuna in particolare'
    return step.options.find((o) => o.value === answers[step.key])?.label ?? String(answers[step.key])
  }

  const handleClose = () => {
    onClose()
    // reset per la prossima apertura
    setTimeout(restart, 200)
  }

  // Testo della domanda (anche per il transcript). term = termine corrente.
  const questionText = (step, t) => {
    if (step.key === 'term') return 'Cosa stai cercando?'
    if (step.key === 'category') return t ? `In quale categoria rientra «${t}»?` : 'In quale categoria?'
    return step.q
  }

  // Stato della barra di scrittura ancorata in basso (stile chat):
  // 'term' = scrivi il termine · 'filter' = filtra le opzioni · 'disabled' = scegli un chip
  const cur = done ? null : steps[stepIndex]
  const useAllCats = cur?.kind === 'category' && (showAllCats || deducedCategories.length === 0)
  const chipSearchable = cur?.kind === 'chips' && cur.options.length > 8
  const barMode = !cur
    ? 'disabled'
    : cur.kind === 'text'
      ? 'term'
      : useAllCats || chipSearchable
        ? 'filter'
        : 'disabled'
  const barPlaceholder =
    barMode === 'term'
      ? 'Es. patatine rustiche, latte senza lattosio…'
      : barMode === 'filter'
        ? (cur.kind === 'category' ? 'Cerca una categoria…' : 'Scrivi per cercare…')
        : 'Scegli un\'opzione qui sopra'

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} fullHeight z="z-[70]">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 pb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-ocean text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-night leading-tight">Assistente</h2>
                <p className="text-xs text-slate">Ti aiuto a scegliere il prodotto giusto</p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Chiudi assistente"
                className="w-8 h-8 flex items-center justify-center text-slate hover:text-night hover:bg-cloud rounded-lg transition-all flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversazione */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Bolla iniziale */}
              <Bubble from="bot">
                {seed
                  ? <>Cerchi «<span className="font-semibold">{seed}</span>». Ti faccio un paio di domande per scegliere il migliore.</>
                  : 'Ciao! Dimmi cosa cerchi e ti aiuto a scegliere.'}
              </Bubble>

              {/* Transcript delle domande già risposte */}
              {steps.slice(0, stepIndex).map((step) => (
                <div key={step.key} className="space-y-3">
                  <Bubble from="bot">{questionText(step, term)}</Bubble>
                  <Bubble from="user">{transcriptLabel(step)}</Bubble>
                </div>
              ))}

              {/* Domanda corrente (gli input testuali sono nella barra in basso) */}
              {!done && cur.kind === 'text' && (
                <Bubble from="bot">{questionText(cur, term)}</Bubble>
              )}

              {!done && cur.kind === 'category' && (() => {
                const q = optionQuery.toLowerCase().trim()
                const allFiltered = q
                  ? categoryOptions.filter((o) => o.label.toLowerCase().includes(q))
                  : categoryOptions
                const list = useAllCats ? allFiltered.slice(0, 12) : deducedCategories
                return (
                  <div className="space-y-3">
                    <Bubble from="bot">
                      {useAllCats
                        ? <>In quale categoria rientra «<span className="font-semibold">{term}</span>»?</>
                        : <>«<span className="font-semibold">{term}</span>» è in una di queste categorie?</>}
                    </Bubble>
                    <div className="flex flex-wrap gap-2">
                      {list.map((opt) => (
                        <button
                          key={String(opt.value)}
                          onClick={() => pick(cur, opt.value)}
                          className="px-3 py-2 rounded-full bg-white border border-violet-200 text-sm font-medium text-violet-700 hover:bg-violet-50 active:scale-95 transition-all"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {useAllCats && allFiltered.length > list.length && (
                      <p className="text-xs text-slate-light">+{allFiltered.length - list.length} altre… scrivi per filtrare</p>
                    )}
                    {!useAllCats ? (
                      <button onClick={() => setShowAllCats(true)} className="text-sm text-slate underline underline-offset-2 hover:text-night">
                        Nessuna di queste, la scelgo io
                      </button>
                    ) : (
                      <button onClick={() => pick(cur, null)} className="text-sm text-slate underline underline-offset-2 hover:text-night">
                        Salta (nessuna categoria)
                      </button>
                    )}
                  </div>
                )
              })()}

              {!done && cur.kind === 'chips' && (() => {
                const q = optionQuery.toLowerCase().trim()
                const filtered = chipSearchable && q
                  ? cur.options.filter((o) => o.label.toLowerCase().includes(q))
                  : cur.options
                const shown = filtered.slice(0, 12)
                return (
                  <div className="space-y-3">
                    <Bubble from="bot">{cur.q}</Bubble>
                    <div className="flex flex-wrap gap-2">
                      {shown.map((opt) => (
                        <button
                          key={String(opt.value)}
                          onClick={() => pick(cur, opt.value)}
                          className="px-3 py-2 rounded-full bg-white border border-violet-200 text-sm font-medium text-violet-700 hover:bg-violet-50 active:scale-95 transition-all"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {chipSearchable && filtered.length > shown.length && (
                      <p className="text-xs text-slate-light">+{filtered.length - shown.length} altri… scrivi per filtrare</p>
                    )}
                  </div>
                )
              })()}

              {/* Risultati */}
              {done && (
                <div className="space-y-3">
                  <Bubble from="bot">
                    {suggestions.length > 0
                      ? 'Ecco cosa ti consiglio:'
                      : 'Non ho trovato nulla con questi criteri. Prova a ridurre i filtri.'}
                  </Bubble>

                  {suggestions.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {suggestions.map((product) => (
                        <CatalogProductCard
                          key={product.id}
                          product={product}
                          supermarketId={answers.supermarket || null}
                          isFavorite={isFavorite(product.name)}
                          onToggleFavorite={() =>
                            onToggleFavorite({
                              name: product.name,
                              category: product.category,
                              price: getLowestPrice(product)?.price ?? null,
                            })
                          }
                          onAddToList={onAddToList ? () => onAddToList(product) : undefined}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={restart}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Ricomincia
                  </button>
                </div>
              )}
            </div>

            {/* Barra di scrittura ancorata in basso (stile chat) */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-cloud bg-white">
              <div
                className={`flex-1 min-w-0 flex items-center gap-2 bg-white border rounded-xl px-3 h-11 transition-all ${
                  barMode === 'disabled'
                    ? 'border-cloud opacity-60'
                    : 'border-violet-200 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100'
                }`}
              >
                {barMode === 'filter' && <Search className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                <input
                  value={optionQuery}
                  onChange={(e) => setOptionQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && barMode === 'term') submitTerm() }}
                  disabled={barMode === 'disabled'}
                  placeholder={barPlaceholder}
                  className="flex-1 min-w-0 bg-transparent text-sm text-night placeholder:text-slate-light focus:outline-none disabled:cursor-not-allowed"
                />
                {barMode !== 'disabled' && optionQuery && (
                  <button onClick={() => setOptionQuery('')} className="text-slate hover:text-night flex-shrink-0" aria-label="Cancella">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {barMode === 'term' && (
                <button
                  onClick={submitTerm}
                  disabled={!optionQuery.trim()}
                  aria-label="Invia"
                  className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-ocean text-white rounded-xl disabled:opacity-50 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
    </BottomSheet>
  )
}

function Bubble({ from, children }) {
  const isBot = from === 'bot'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
          isBot
            ? 'bg-violet-50 text-night rounded-tl-sm'
            : 'bg-ocean text-white rounded-tr-sm'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
