// Costanti e helper condivisi per la categorizzazione dei prodotti.
// Usati sia dal vecchio AddProductForm che dal nuovo AddProductSheet.

export const CATEGORIES = [
  { id: 'frutta-verdura', name: 'Frutta e Verdura' },
  { id: 'pane-cereali', name: 'Pane e Cereali' },
  { id: 'latticini', name: 'Latticini' },
  { id: 'carne-pesce', name: 'Carne e Pesce' },
  { id: 'surgelati', name: 'Surgelati' },
  { id: 'dispensa', name: 'Dispensa' },
  { id: 'bevande', name: 'Bevande' },
  { id: 'igiene', name: 'Igiene Personale' },
  { id: 'casa', name: 'Casa e Pulizia' },
  { id: 'altro', name: 'Altro' },
]

export const UNITS = [
  { id: 'pz', name: 'pz', label: 'Pezzi' },
  { id: 'kg', name: 'kg', label: 'Chilogrammi' },
  { id: 'g', name: 'g', label: 'Grammi' },
  { id: 'L', name: 'L', label: 'Litri' },
  { id: 'mL', name: 'mL', label: 'Millilitri' },
  { id: 'conf', name: 'conf', label: 'Confezioni' },
]

// Mapping parole chiave -> categoria per auto-categorizzazione
const CATEGORY_KEYWORDS = {
  'frutta-verdura': [
    'mela', 'mele', 'banana', 'banane', 'arancia', 'arance', 'limone', 'limoni',
    'pomodoro', 'pomodori', 'insalata', 'lattuga', 'carota', 'carote', 'zucchina', 'zucchine',
    'patata', 'patate', 'cipolla', 'cipolle', 'aglio', 'peperone', 'peperoni',
    'melanzana', 'melanzane', 'cetriolo', 'cetrioli', 'spinaci', 'broccoli',
    'cavolfiore', 'cavolo', 'fragola', 'fragole', 'pera', 'pere', 'pesca', 'pesche',
    'uva', 'kiwi', 'ananas', 'mango', 'avocado', 'verdura', 'frutta', 'funghi',
    'prezzemolo', 'basilico', 'rosmarino', 'sedano', 'finocchio', 'rucola',
  ],
  'pane-cereali': [
    'pane', 'panino', 'panini', 'fette biscottate', 'crackers', 'grissini',
    'cereali', 'muesli', 'cornflakes', 'avena', 'farina', 'pasta', 'riso',
    'spaghetti', 'penne', 'fusilli', 'orzo', 'farro', 'cous cous', 'couscous',
    'brioche', 'croissant', 'focaccia', 'pizza', 'piadina', 'tortillas',
  ],
  'latticini': [
    'latte', 'yogurt', 'formaggio', 'formaggi', 'mozzarella', 'parmigiano',
    'grana', 'pecorino', 'ricotta', 'mascarpone', 'burro', 'panna', 'stracchino',
    'gorgonzola', 'fontina', 'emmental', 'philadelphia', 'crescenza', 'robiola',
    'kefir', 'skyr', 'fiocchi di latte', 'latticini', 'uova', 'uovo',
  ],
  'carne-pesce': [
    'carne', 'pollo', 'manzo', 'maiale', 'vitello', 'tacchino', 'coniglio',
    'salsiccia', 'salsicce', 'salame', 'prosciutto', 'bresaola', 'speck',
    'pancetta', 'wurstel', 'hamburger', 'bistecca', 'costine', 'arrosto',
    'pesce', 'salmone', 'tonno', 'merluzzo', 'orata', 'branzino', 'gamberi',
    'calamari', 'cozze', 'vongole', 'acciughe', 'sardine', 'sgombro', 'polpo',
  ],
  'surgelati': [
    'surgelato', 'surgelati', 'gelato', 'gelati', 'ghiaccioli', 'pizza surgelata',
    'verdure surgelate', 'bastoncini', 'findus', 'frozen', 'congelato', 'congelati',
  ],
  'dispensa': [
    'olio', 'aceto', 'sale', 'zucchero', 'pepe', 'spezie', 'dado', 'dadi',
    'passata', 'pelati', 'conserva', 'marmellata', 'nutella', 'miele',
    'caffè', 'caffe', 'tè', 'the', 'tisana', 'biscotti', 'merendine',
    'cioccolato', 'cioccolatini', 'caramelle', 'patatine', 'chips', 'snack',
    'legumi', 'fagioli', 'lenticchie', 'ceci', 'piselli', 'mais', 'tonno in scatola',
    'maionese', 'ketchup', 'senape', 'salsa', 'pesto', 'sottoli', 'sottaceti',
  ],
  'bevande': [
    'acqua', 'birra', 'vino', 'coca cola', 'fanta', 'sprite', 'aranciata',
    'succo', 'succhi', 'spremuta', 'energy drink', 'redbull', 'monster',
    'prosecco', 'spumante', 'champagne', 'aperitivo', 'aperol', 'campari',
    'whisky', 'vodka', 'gin', 'rum', 'liquore', 'amaro', 'limoncello',
  ],
  'igiene': [
    'sapone', 'shampoo', 'bagnoschiuma', 'balsamo', 'dentifricio', 'spazzolino',
    'deodorante', 'crema', 'rasoio', 'rasoi', 'lamette', 'schiuma da barba',
    'assorbenti', 'tamponi', 'pannolini', 'salviette', 'cotton fioc', 'cotone',
    'fazzoletti', 'kleenex', 'carta igienica', 'scottex', 'rotoloni',
    'trucco', 'makeup', 'mascara', 'rossetto', 'smalto', 'profumo', 'colonia',
  ],
  'casa': [
    'detersivo', 'detersivi', 'sapone piatti', 'brillantante', 'anticalcare',
    'candeggina', 'ammorbidente', 'smacchiatore', 'sgrassatore', 'vetri',
    'spugna', 'spugne', 'panno', 'panni', 'mocio', 'scopa', 'paletta',
    'sacchetti', 'buste', 'alluminio', 'pellicola', 'carta forno',
    'pile', 'batterie', 'lampadina', 'lampadine', 'candele', 'fiammiferi',
  ],
}

// Rileva la categoria da un nome prodotto (null se nessuna corrispondenza)
export function detectCategory(productName) {
  const nameLower = productName.toLowerCase().trim()

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (nameLower === keyword ||
          nameLower.startsWith(keyword + ' ') ||
          nameLower.endsWith(' ' + keyword) ||
          nameLower.includes(' ' + keyword + ' ')) {
        return categoryId
      }
    }
  }

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return categoryId
      }
    }
  }

  return null
}

// Formatta prezzo in italiano (es. "1,20€")
export function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + '€'
}
