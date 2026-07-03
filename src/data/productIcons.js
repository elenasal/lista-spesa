// Mappa delle icone emoji per prodotti specifici
// L'ordine è importante: le regole più specifiche prima

const PRODUCT_ICONS = [
  // Latticini
  { match: ['latte', 'milk'], icon: '🥛' },
  { match: ['mozzarella'], icon: '🧀' },
  { match: ['parmigiano', 'grana', 'pecorino'], icon: '🧀' },
  { match: ['yogurt'], icon: '🥛' },
  { match: ['burro'], icon: '🧈' },
  { match: ['formaggio', 'cheese', 'ricotta', 'mascarpone', 'stracchino'], icon: '🧀' },
  { match: ['uova', 'uovo', 'eggs'], icon: '🥚' },
  { match: ['panna'], icon: '🥛' },

  // Frutta
  { match: ['mela', 'mele', 'apple'], icon: '🍎' },
  { match: ['banana', 'banane'], icon: '🍌' },
  { match: ['arancia', 'arance', 'orange'], icon: '🍊' },
  { match: ['limone', 'limoni', 'lemon'], icon: '🍋' },
  { match: ['fragola', 'fragole', 'strawberry'], icon: '🍓' },
  { match: ['uva', 'grape'], icon: '🍇' },
  { match: ['pesca', 'pesche', 'peach'], icon: '🍑' },
  { match: ['ciliegia', 'ciliegie', 'cherry'], icon: '🍒' },
  { match: ['anguria', 'cocomero', 'watermelon'], icon: '🍉' },
  { match: ['melone'], icon: '🍈' },
  { match: ['kiwi'], icon: '🥝' },
  { match: ['pera', 'pere', 'pear'], icon: '🍐' },
  { match: ['ananas', 'pineapple'], icon: '🍍' },
  { match: ['cocco', 'coconut'], icon: '🥥' },
  { match: ['avocado'], icon: '🥑' },
  { match: ['mango'], icon: '🥭' },

  // Verdura
  { match: ['pomodoro', 'pomodori', 'tomato'], icon: '🍅' },
  { match: ['carota', 'carote', 'carrot'], icon: '🥕' },
  { match: ['patata', 'patate', 'potato'], icon: '🥔' },
  { match: ['cipolla', 'cipolle', 'onion'], icon: '🧅' },
  { match: ['aglio', 'garlic'], icon: '🧄' },
  { match: ['peperone', 'peperoni', 'pepper'], icon: '🫑' },
  { match: ['peperoncino', 'chili'], icon: '🌶️' },
  { match: ['melanzana', 'melanzane', 'eggplant'], icon: '🍆' },
  { match: ['zucchina', 'zucchine', 'zucchini'], icon: '🥒' },
  { match: ['cetriolo', 'cetrioli', 'cucumber'], icon: '🥒' },
  { match: ['broccoli', 'broccolo'], icon: '🥦' },
  { match: ['lattuga', 'insalata', 'salad', 'lettuce'], icon: '🥬' },
  { match: ['spinaci', 'spinach'], icon: '🥬' },
  { match: ['mais', 'corn'], icon: '🌽' },
  { match: ['funghi', 'fungo', 'mushroom'], icon: '🍄' },
  { match: ['olive'], icon: '🫒' },
  { match: ['piselli'], icon: '🫛' },
  { match: ['fagioli', 'beans'], icon: '🫘' },

  // Pane e cereali
  { match: ['pane', 'bread'], icon: '🍞' },
  { match: ['baguette'], icon: '🥖' },
  { match: ['croissant', 'cornetto'], icon: '🥐' },
  { match: ['pretzel'], icon: '🥨' },
  { match: ['pancake'], icon: '🥞' },
  { match: ['waffle'], icon: '🧇' },
  { match: ['riso', 'rice'], icon: '🍚' },
  { match: ['pasta', 'spaghetti', 'penne', 'fusilli', 'rigatoni'], icon: '🍝' },
  { match: ['cereali', 'cereal', 'muesli', 'granola'], icon: '🥣' },
  { match: ['farina', 'flour'], icon: '🌾' },
  { match: ['crackers', 'cracker'], icon: '🍘' },
  { match: ['biscotti', 'biscotto', 'cookie'], icon: '🍪' },

  // Carne
  { match: ['pollo', 'chicken'], icon: '🍗' },
  { match: ['manzo', 'beef', 'bistecca', 'steak'], icon: '🥩' },
  { match: ['maiale', 'pork', 'salsiccia', 'sausage'], icon: '🥓' },
  { match: ['bacon', 'pancetta'], icon: '🥓' },
  { match: ['prosciutto', 'ham'], icon: '🍖' },
  { match: ['tacchino', 'turkey'], icon: '🦃' },
  { match: ['salame', 'salumi'], icon: '🍖' },
  { match: ['hamburger', 'burger'], icon: '🍔' },
  { match: ['hot dog', 'wurstel'], icon: '🌭' },

  // Pesce
  { match: ['pesce', 'fish'], icon: '🐟' },
  { match: ['salmone', 'salmon'], icon: '🍣' },
  { match: ['tonno', 'tuna'], icon: '🐟' },
  { match: ['gamberi', 'shrimp', 'gamberetti'], icon: '🦐' },
  { match: ['granchio', 'crab'], icon: '🦀' },
  { match: ['aragosta', 'lobster'], icon: '🦞' },
  { match: ['calamari', 'squid'], icon: '🦑' },
  { match: ['polpo', 'octopus'], icon: '🐙' },
  { match: ['ostriche', 'oyster'], icon: '🦪' },

  // Bevande
  { match: ['acqua', 'water'], icon: '💧' },
  { match: ['caffè', 'caffe', 'coffee'], icon: '☕' },
  { match: ['tè', 'tea', 'the'], icon: '🍵' },
  { match: ['succo', 'juice'], icon: '🧃' },
  { match: ['vino', 'wine'], icon: '🍷' },
  { match: ['birra', 'beer'], icon: '🍺' },
  { match: ['coca', 'cola', 'soda', 'fanta', 'sprite'], icon: '🥤' },
  { match: ['champagne', 'prosecco', 'spumante'], icon: '🍾' },
  { match: ['whisky', 'whiskey'], icon: '🥃' },
  { match: ['cocktail'], icon: '🍹' },

  // Dolci e snack
  { match: ['cioccolato', 'chocolate', 'nutella'], icon: '🍫' },
  { match: ['caramella', 'caramelle', 'candy'], icon: '🍬' },
  { match: ['lollipop'], icon: '🍭' },
  { match: ['torta', 'cake'], icon: '🎂' },
  { match: ['gelato', 'ice cream'], icon: '🍦' },
  { match: ['miele', 'honey'], icon: '🍯' },
  { match: ['marmellata', 'jam', 'confettura'], icon: '🍯' },
  { match: ['patatine', 'chips'], icon: '🍟' },
  { match: ['popcorn'], icon: '🍿' },
  { match: ['ciambella', 'donut'], icon: '🍩' },

  // Condimenti e altro
  { match: ['olio', 'oil'], icon: '🫒' },
  { match: ['aceto', 'vinegar'], icon: '🍶' },
  { match: ['sale', 'salt'], icon: '🧂' },
  { match: ['pepe', 'pepper'], icon: '🌶️' },
  { match: ['zucchero', 'sugar'], icon: '🍬' },
  { match: ['salsa', 'sauce', 'ketchup', 'maionese', 'mayo'], icon: '🥫' },
  { match: ['senape', 'mustard'], icon: '🟡' },

  // Surgelati
  { match: ['pizza'], icon: '🍕' },
  { match: ['sushi'], icon: '🍣' },
  { match: ['surgelat'], icon: '🧊' },

  // Casa e igiene
  { match: ['sapone', 'soap'], icon: '🧼' },
  { match: ['shampoo'], icon: '🧴' },
  { match: ['dentifricio', 'toothpaste'], icon: '🪥' },
  { match: ['carta igienica', 'toilet paper'], icon: '🧻' },
  { match: ['detersivo', 'detergent'], icon: '🧹' },
  { match: ['spugna', 'sponge'], icon: '🧽' },
]

// Icone di fallback per categoria
const CATEGORY_FALLBACK_ICONS = {
  'frutta-verdura': '🥗',
  'pane-cereali': '🌾',
  'latticini': '🥛',
  'carne-pesce': '🍖',
  'surgelati': '🧊',
  'dispensa': '🥫',
  'bevande': '🥤',
  'igiene': '🧴',
  'casa': '🏠',
  'altro': '📦',
}

/**
 * Trova l'icona emoji per un prodotto
 * @param {string} productName - Nome del prodotto
 * @param {string} category - Categoria del prodotto (fallback)
 * @returns {string} Emoji icon
 */
export function getProductIcon(productName, category = 'altro') {
  const nameLower = productName.toLowerCase()

  // Cerca una corrispondenza specifica
  for (const rule of PRODUCT_ICONS) {
    for (const keyword of rule.match) {
      if (nameLower.includes(keyword)) {
        return rule.icon
      }
    }
  }

  // Fallback alla categoria
  return CATEGORY_FALLBACK_ICONS[category] || '🛒'
}

export default getProductIcon
