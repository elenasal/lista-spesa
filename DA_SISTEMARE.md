# Backlog funzionalità — App Lista della Spesa

Elenco di miglioramenti e nuove funzionalità da implementare.
Legenda effort: 🟢 piccolo · 🟡 medio · 🔴 grande.

---

## Miglioramenti UI (quick win)

### 1. Codice a barre carta fedeltà visibile subito 🟢
**Contesto:** oggi in "I miei supermercati" il codice a barre della carta fedeltà si apre solo
cliccando sulla riga del supermercato.
**Cosa fare:** mostrare il codice a barre direttamente nella riga/card del supermercato, senza
richiedere il tap di apertura.
**Fatto quando:** dalla lista "I miei supermercati" vedo il barcode della carta senza click aggiuntivi
(alla cassa lo mostro al volo).

### 2. Indicazioni stradali accessibili dalla home 🟢
**Contesto:** le indicazioni verso il supermercato sono oggi raggiungibili solo entrando nel dettaglio.
**Cosa fare:** aggiungere un accesso rapido alle indicazioni (Google Maps / app mappe) direttamente
dalla riga del supermercato in "I miei supermercati" in home.
**Fatto quando:** da home, un tap sull'icona indicazioni apre subito il percorso verso quel supermercato.

### 3. Freccina "confronto prezzi" più visibile 🟢
**Contesto:** nel dettaglio lista, ogni prodotto ha una freccina che apre la dropdown col prezzo di
quel prodotto negli altri supermercati, ma è poco riconoscibile.
**Cosa fare:** rendere il controllo più evidente (icona/etichetta più chiara, area di tocco più ampia)
così si capisce che apre il confronto prezzi.
**Fatto quando:** l'utente individua e usa senza esitazione la freccina di confronto prezzi su ogni prodotto.

### 4. Tasto rapido "indicazioni" a livello di lista 🟡
**Contesto:** una lista può coinvolgere uno o più supermercati dove andare a fare la spesa.
**Cosa fare:** in ogni lista, un pulsante rapido che apre le indicazioni stradali verso i supermercati
coinvolti (se più d'uno, permettere di scegliere o mostrare un itinerario/elenco).
**Fatto quando:** da una lista, con un tap ottengo il percorso verso il/i supermercato/i di quella spesa.

---

## Nuove funzionalità

### 5. Scontrini + dashboard spese per supermercato 🔴
**Contesto:** l'utente vuole capire quanto spende e risparmia in ciascun supermercato.
**Cosa fare:**
- possibilità di **fotografare lo scontrino** e associarlo a un supermercato (con lettura/registrazione
  della spesa — OCR o inserimento assistito);
- una **dashboard dei supermercati preferiti** che mostra, per ciascuno:
  - totale **speso**,
  - totale **risparmiato**,
  - quanto erano in **offerta** i prodotti acquistati (incrociando i prodotti aggiunti alle liste).
**Fatto quando:** dopo aver caricato scontrini, vedo per ogni supermercato speso/risparmiato/offerte
in una dashboard riepilogativa.

### 6. Catalogo prodotti sfogliabile + costruzione preferiti 🔴
**Contesto:** l'utente vuole scegliere i prodotti "a colpo d'occhio", come tra gli scaffali.
**Cosa fare:** nuova sezione in home che porta a una pagina "Sfoglia prodotti" dove:
- si filtra per prodotto, categoria e (facoltativo) supermercato;
- in base ai filtri si vedono le **foto dei prodotti**, sfogliabili come al supermercato;
- un prodotto che piace si aggiunge ai **preferiti** con un tap.
**Note:** l'utente fornirà **screenshot di riferimento** per il layout.
**Fatto quando:** posso navigare un catalogo visuale filtrabile e costruire la mia lista di preferiti.

### 7. Assistente IA per la scelta del prodotto 🔴
**Contesto:** a volte l'utente non ha le idee chiare su cosa comprare (es. cerca "patatine" per una
festa ma non sa quali).
**Cosa fare:** un assistente conversazionale che guida la scelta con domande mirate (tipo di prodotto,
supermercato, fascia di prezzo, gusto/varianti, ecc.) e propone il prodotto più adatto alle esigenze.
**Fatto quando:** da una ricerca ambigua, l'assistente mi conduce con poche domande al prodotto giusto
e me lo suggerisce/aggiunge alla lista.

### 8. Miglior prezzo assoluto in zona (oltre ai preferiti) 🔴
**Contesto:** oggi il confronto prezzi è limitato ai supermercati preferiti dell'utente.
**Cosa fare:** quando cerco un prodotto specifico (es. "latte Zymil senza lattosio"), oltre ai prezzi
dei miei preferiti (es. Coop, Carrefour, Esselunga) mostrare come **opzione extra** il **prezzo più
basso in assoluto** tra i supermercati della mia zona, anche se non è tra i preferiti (es. Lidl).
**Fatto quando:** nel confronto prezzi di un prodotto vedo, oltre ai miei supermercati, una voce
aggiuntiva "miglior prezzo in zona" con il supermercato più conveniente anche fuori dai preferiti.
**Note:** richiede dati prezzi a livello di zona/geolocalizzazione, non solo dei preferiti.

### 9. Prezzo medio di zona per prodotti generici 🔴
**Contesto:** non sempre l'utente cerca un prodotto di marca preciso; a volte scrive un termine
generico (es. "latte", "pasta", "pane").
**Cosa fare:** quando la ricerca è generica (non un prodotto specifico), mostrare un **prezzo medio**
indicativo per quel tipo di prodotto nella zona dell'utente.
**Fatto quando:** cercando un prodotto generico vedo un prezzo medio di riferimento per la mia zona.
**Note:** complementare al punto 8 (prodotto specifico → miglior prezzo assoluto; prodotto generico →
prezzo medio di zona). Richiede dati prezzi aggregati per zona.

### 10. Onboarding guidato alla prima apertura 🔴
**Contesto:** alla prima apertura l'app è vuota; serve un flusso che accompagni l'utente a configurare
il minimo indispensabile e arrivare in home già "popolata".
**Flusso proposto (in ordine consigliato):**
1. **Permesso posizione** — chiedere se l'app può accedere alla posizione (abilita i suggerimenti per zona).
2. **Supermercati preferiti** — proporre i supermercati della zona da aggiungere ai preferiti; se quello
   che vuole è distante/non elencato, l'utente lo cerca manualmente.
3. **Almeno 3 prodotti preferiti** — far selezionare un minimo di 3 prodotti tra i preferiti (seed dei
   suggerimenti), usando il **catalogo con foto** del punto 6 (si sfoglia e si aggiunge ai preferiti).
   *Meglio prima della creazione lista, così la prima lista può già usarli.*
4. **Prima lista** — creare la prima lista scegliendo se **generica** o **legata a un supermercato** specifico.
5. **Home** — atterraggio nella home già configurata.
**Fatto quando:** un nuovo utente, alla prima apertura, viene guidato passo-passo (posizione →
supermercati → prodotti preferiti → prima lista) e arriva in home con dati già impostati.
**Note UX:**
- Ogni step **saltabile** (es. "Salta per ora") per non bloccare chi ha fretta; l'onboarding non deve
  risultare troppo lungo.
- Se l'utente nega la posizione, prevedere il fallback con **ricerca manuale** del supermercato.
- Mostrare un indicatore di avanzamento (es. "Passo 2 di 4").
**Dipendenza:** lo step 3 richiede il **catalogo con foto (punto 6)**; va quindi realizzato dopo (o
insieme a) il punto 6.

### 11. Trova il prodotto nel punto vendita più vicino 🔴
**Contesto:** a volte all'utente non interessa il prezzo più basso, ma **dove trovare** un prodotto
nel punto più vicino a sé, anche fuori dai supermercati preferiti.
**Cosa fare:** cercando un prodotto, mostrare in quali punti vendita di un'area definita è **disponibile**,
ordinati per **vicinanza**, evidenziando il più vicino alla posizione dell'utente.
**Fatto quando:** cerco un prodotto e vedo la mappa/elenco dei negozi che lo hanno, dal più vicino,
anche se non sono tra i miei preferiti.
**Note:** stesso motore del punto 8 (ricerca prodotto in zona, oltre ai preferiti, con geolocalizzazione),
ma ottimizzato per **disponibilità + distanza** invece che per prezzo. Trattare 8 e 11 come due
**modalità** della stessa ricerca ("più conveniente" vs "più vicino").

---

## Fatto
<!-- Le voci completate finiscono qui, con la data -->

### 2026-07-17
- **Restyle aggiunta prodotto (bottom sheet)** — barra fissa in basso + pannello trascinabile (maniglia, chiusura a trascinamento), tile prodotto filtrate live, step dettagli con "articolo successivo", campo contenteditable (no barra autofill Android), footer azzurrino.
- **1. Barcode carta fedeltà visibile subito** 🟢 — barcode + numero inline nella card "I miei supermercati" (componente riutilizzabile `ui/Barcode`).
- **2. Indicazioni stradali dalla home** 🟢 — pulsante indicazioni sulla riga supermercato che apre Google Maps.
- **3. Freccina confronto prezzi più visibile** 🟢 — sostituita da un pulsante-pillola "⇄ Confronta prezzi ⌄" evidente su ogni prodotto.
- **Ridisegno card home** — card supermercato (header nome+stato, barcode centrato, colonna azioni con divisoria) e card lista (niente icona, pallino colore + chip supermercato/Generica).
