// Database prodotti con prezzi per punto vendita specifico (mockup Novara)
// I prezzi variano per ogni singolo negozio

export const PRODUCTS_DATABASE = [
  // === LATTICINI ===
  {
    id: 'latte-zymil-1l',
    name: 'Latte Zymil Senza Lattosio 1L',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.89 },
      'lidl-corso-vercelli': { price: 1.79, onSale: true, salePrice: 1.49 },
      'carrefour-via-verbano': { price: 1.95 },
      'coop-corso-italia': { price: 1.92 },
      'conad-via-san-bernardino': { price: 1.98 },
      'eurospin-viale-kennedy': { price: 1.69 },
      'aldi-corso-vercelli': { price: 1.75 },
    }
  },
  {
    id: 'latte-granarolo-intero-1l',
    name: 'Latte Granarolo Intero 1L',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.65 },
      'lidl-corso-vercelli': { price: 1.55 },
      'carrefour-via-verbano': { price: 1.69 },
      'coop-corso-italia': { price: 1.62 },
      'conad-via-san-bernardino': { price: 1.72 },
      'bennet-centro-commerciale': { price: 1.59 },
    }
  },
  {
    id: 'latte-granarolo-ps-1l',
    name: 'Latte Granarolo Parzialmente Scremato 1L',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.59 },
      'lidl-corso-vercelli': { price: 1.49 },
      'carrefour-via-verbano': { price: 1.65 },
      'coop-corso-italia': { price: 1.55 },
      'eurospin-viale-kennedy': { price: 1.39 },
    }
  },
  {
    id: 'mozzarella-santa-lucia-125g',
    name: 'Mozzarella Santa Lucia 125g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.29 },
      'lidl-corso-vercelli': { price: 1.19 },
      'carrefour-via-verbano': { price: 1.35 },
      'coop-corso-italia': { price: 1.32 },
      'conad-via-san-bernardino': { price: 1.39 },
      'bennet-centro-commerciale': { price: 1.25 },
      'penny-via-biandrate': { price: 1.15 },
    }
  },
  {
    id: 'mozzarella-bufala-granarolo-200g',
    name: 'Mozzarella di Bufala Granarolo 200g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.49, onSale: true, salePrice: 1.99 },
      'carrefour-via-verbano': { price: 2.69 },
      'coop-corso-italia': { price: 2.59 },
      'conad-via-san-bernardino': { price: 2.75 },
      'bennet-centro-commerciale': { price: 2.45 },
    }
  },
  {
    id: 'mozzarella-vallelata-125g',
    name: 'Mozzarella Vallelata 125g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 0.99 },
      'lidl-corso-vercelli': { price: 1.05 },
      'carrefour-via-verbano': { price: 0.99 },
      'coop-corso-italia': { price: 1.09 },
      'eurospin-viale-kennedy': { price: 0.89 },
      'md-via-novara': { price: 0.85 },
    }
  },
  {
    id: 'yogurt-muller-bianco-2x125g',
    name: 'Yogurt Muller Bianco 2x125g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.49 },
      'lidl-corso-vercelli': { price: 1.39 },
      'carrefour-via-verbano': { price: 1.55 },
      'coop-corso-italia': { price: 1.45 },
      'aldi-corso-vercelli': { price: 1.35 },
    }
  },
  {
    id: 'yogurt-greco-fage-170g',
    name: 'Yogurt Greco Fage Total 0% 170g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.79 },
      'carrefour-via-verbano': { price: 1.89 },
      'coop-corso-italia': { price: 1.85 },
      'conad-via-san-bernardino': { price: 1.95 },
      'bennet-centro-commerciale': { price: 1.75 },
    }
  },
  {
    id: 'parmigiano-reggiano-200g',
    name: 'Parmigiano Reggiano DOP 200g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 4.99 },
      'lidl-corso-vercelli': { price: 4.49 },
      'carrefour-via-verbano': { price: 5.29 },
      'coop-corso-italia': { price: 4.89 },
      'conad-via-san-bernardino': { price: 5.19 },
      'eurospin-viale-kennedy': { price: 4.29 },
      'aldi-corso-vercelli': { price: 4.39 },
    }
  },
  {
    id: 'burro-president-250g',
    name: 'Burro President 250g',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.89 },
      'lidl-corso-vercelli': { price: 2.69 },
      'carrefour-via-verbano': { price: 2.99 },
      'coop-corso-italia': { price: 2.85 },
      'bennet-centro-commerciale': { price: 2.79 },
    }
  },
  {
    id: 'uova-biologiche-6pz',
    name: 'Uova Biologiche 6 pezzi',
    category: 'latticini',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.99 },
      'lidl-corso-vercelli': { price: 2.49 },
      'carrefour-via-verbano': { price: 3.19 },
      'coop-corso-italia': { price: 2.89 },
      'eurospin-viale-kennedy': { price: 2.29 },
      'aldi-corso-vercelli': { price: 2.39 },
      'penny-via-biandrate': { price: 2.35 },
    }
  },

  // === PASTA E CEREALI ===
  {
    id: 'pasta-barilla-penne-500g',
    name: 'Pasta Barilla Penne Rigate 500g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.15 },
      'lidl-corso-vercelli': { price: 0.99 },
      'carrefour-via-verbano': { price: 1.19 },
      'coop-corso-italia': { price: 1.09 },
      'conad-via-san-bernardino': { price: 1.25 },
      'eurospin-viale-kennedy': { price: 0.89 },
      'md-via-novara': { price: 0.95 },
      'penny-via-biandrate': { price: 0.99 },
    }
  },
  {
    id: 'pasta-de-cecco-spaghetti-500g',
    name: 'Pasta De Cecco Spaghetti 500g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.49 },
      'carrefour-via-verbano': { price: 1.59 },
      'coop-corso-italia': { price: 1.55 },
      'conad-via-san-bernardino': { price: 1.65 },
      'bennet-centro-commerciale': { price: 1.45 },
    }
  },
  {
    id: 'pasta-rummo-spaghetti-500g',
    name: 'Pasta Rummo Spaghetti 500g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.89 },
      'carrefour-via-verbano': { price: 1.99 },
      'coop-corso-italia': { price: 1.95 },
      'bennet-centro-commerciale': { price: 1.85 },
    }
  },
  {
    id: 'riso-scotti-arborio-1kg',
    name: 'Riso Scotti Arborio 1kg',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.49 },
      'lidl-corso-vercelli': { price: 2.29 },
      'carrefour-via-verbano': { price: 2.59 },
      'coop-corso-italia': { price: 2.45 },
      'eurospin-viale-kennedy': { price: 2.19 },
    }
  },
  {
    id: 'fette-biscottate-mulino-bianco-315g',
    name: 'Fette Biscottate Mulino Bianco 315g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.69 },
      'lidl-corso-vercelli': { price: 1.49 },
      'carrefour-via-verbano': { price: 1.79 },
      'coop-corso-italia': { price: 1.65 },
      'conad-via-san-bernardino': { price: 1.85 },
      'aldi-corso-vercelli': { price: 1.55 },
    }
  },

  // === BISCOTTI E DOLCI ===
  {
    id: 'biscotti-mulino-bianco-tarallucci-800g',
    name: 'Biscotti Mulino Bianco Tarallucci 800g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 3.29 },
      'carrefour-via-verbano': { price: 3.49 },
      'coop-corso-italia': { price: 3.39 },
      'conad-via-san-bernardino': { price: 3.55 },
      'bennet-centro-commerciale': { price: 3.19, onSale: true, salePrice: 2.69 },
    }
  },
  {
    id: 'biscotti-mulino-bianco-abbracci-350g',
    name: 'Biscotti Mulino Bianco Abbracci 350g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.19 },
      'lidl-corso-vercelli': { price: 1.99 },
      'carrefour-via-verbano': { price: 2.29 },
      'coop-corso-italia': { price: 2.15 },
      'md-via-novara': { price: 1.89 },
    }
  },
  {
    id: 'biscotti-gocciole-pavesi-500g',
    name: 'Biscotti Gocciole Pavesi 500g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.89 },
      'lidl-corso-vercelli': { price: 2.69, onSale: true, salePrice: 2.29 },
      'carrefour-via-verbano': { price: 2.99 },
      'coop-corso-italia': { price: 2.85 },
      'penny-via-biandrate': { price: 2.59 },
    }
  },
  {
    id: 'nutella-400g',
    name: 'Nutella 400g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 3.99 },
      'lidl-corso-vercelli': { price: 3.79 },
      'carrefour-via-verbano': { price: 4.19 },
      'coop-corso-italia': { price: 3.95 },
      'eurospin-viale-kennedy': { price: 3.69 },
      'md-via-novara': { price: 3.59 },
      'aldi-corso-vercelli': { price: 3.75 },
    }
  },
  {
    id: 'nutella-750g',
    name: 'Nutella 750g',
    category: 'pane-cereali',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 5.49 },
      'lidl-corso-vercelli': { price: 5.29, onSale: true, salePrice: 4.49 },
      'carrefour-via-verbano': { price: 5.79 },
      'coop-corso-italia': { price: 5.59 },
      'bennet-centro-commerciale': { price: 5.39 },
    }
  },

  // === CAFFÈ ===
  {
    id: 'caffe-lavazza-qualita-rossa-250g',
    name: 'Caffè Lavazza Qualità Rossa 250g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 3.49 },
      'lidl-corso-vercelli': { price: 3.29 },
      'carrefour-via-verbano': { price: 3.59 },
      'coop-corso-italia': { price: 3.45 },
      'conad-via-san-bernardino': { price: 3.65 },
      'eurospin-viale-kennedy': { price: 3.19 },
      'md-via-novara': { price: 3.15 },
      'bennet-centro-commerciale': { price: 3.39 },
    }
  },
  {
    id: 'caffe-lavazza-crema-gusto-250g',
    name: 'Caffè Lavazza Crema e Gusto 250g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.99 },
      'lidl-corso-vercelli': { price: 2.79 },
      'carrefour-via-verbano': { price: 3.09 },
      'coop-corso-italia': { price: 2.95 },
      'eurospin-viale-kennedy': { price: 2.69 },
      'penny-via-biandrate': { price: 2.75 },
    }
  },
  {
    id: 'caffe-illy-classico-250g',
    name: 'Caffè Illy Classico 250g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 6.99 },
      'carrefour-via-verbano': { price: 7.19 },
      'coop-corso-italia': { price: 7.09 },
      'bennet-centro-commerciale': { price: 6.89 },
    }
  },
  {
    id: 'caffe-kimbo-aroma-gold-250g',
    name: 'Caffè Kimbo Aroma Gold 250g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 4.29 },
      'lidl-corso-vercelli': { price: 3.99, onSale: true, salePrice: 3.49 },
      'carrefour-via-verbano': { price: 4.49 },
      'coop-corso-italia': { price: 4.19 },
      'conad-via-san-bernardino': { price: 4.59 },
    }
  },

  // === BEVANDE ===
  {
    id: 'acqua-levissima-6x1-5l',
    name: 'Acqua Levissima 6x1.5L',
    category: 'bevande',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 3.29 },
      'lidl-corso-vercelli': { price: 2.99 },
      'carrefour-via-verbano': { price: 3.49 },
      'coop-corso-italia': { price: 3.19 },
      'eurospin-viale-kennedy': { price: 2.79 },
      'md-via-novara': { price: 2.69 },
      'bennet-centro-commerciale': { price: 3.09 },
    }
  },
  {
    id: 'acqua-sant-anna-6x1-5l',
    name: 'Acqua Sant\'Anna 6x1.5L',
    category: 'bevande',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.99 },
      'lidl-corso-vercelli': { price: 2.79 },
      'carrefour-via-verbano': { price: 3.19 },
      'coop-corso-italia': { price: 2.95 },
      'eurospin-viale-kennedy': { price: 2.49 },
      'penny-via-biandrate': { price: 2.55 },
      'aldi-corso-vercelli': { price: 2.65 },
    }
  },
  {
    id: 'coca-cola-1-5l',
    name: 'Coca-Cola 1.5L',
    category: 'bevande',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.99 },
      'lidl-corso-vercelli': { price: 1.89 },
      'carrefour-via-verbano': { price: 2.09 },
      'coop-corso-italia': { price: 1.95 },
      'conad-via-san-bernardino': { price: 2.15 },
      'bennet-centro-commerciale': { price: 1.85, onSale: true, salePrice: 1.49 },
    }
  },
  {
    id: 'succo-skipper-ace-1l',
    name: 'Succo Skipper ACE 1L',
    category: 'bevande',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.79 },
      'lidl-corso-vercelli': { price: 1.59 },
      'carrefour-via-verbano': { price: 1.89 },
      'coop-corso-italia': { price: 1.75 },
      'md-via-novara': { price: 1.49 },
    }
  },

  // === FRUTTA E VERDURA ===
  {
    id: 'banane-chiquita-1kg',
    name: 'Banane Chiquita 1kg',
    category: 'frutta-verdura',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.29 },
      'lidl-corso-vercelli': { price: 1.99 },
      'carrefour-via-verbano': { price: 2.39 },
      'coop-corso-italia': { price: 2.19 },
      'eurospin-viale-kennedy': { price: 1.89 },
      'aldi-corso-vercelli': { price: 1.95 },
    }
  },
  {
    id: 'mele-golden-1kg',
    name: 'Mele Golden 1kg',
    category: 'frutta-verdura',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.49 },
      'lidl-corso-vercelli': { price: 1.99, onSale: true, salePrice: 1.49 },
      'carrefour-via-verbano': { price: 2.59 },
      'coop-corso-italia': { price: 2.39 },
      'eurospin-viale-kennedy': { price: 1.89 },
      'penny-via-biandrate': { price: 1.79 },
    }
  },
  {
    id: 'pomodori-ciliegino-500g',
    name: 'Pomodori Ciliegino 500g',
    category: 'frutta-verdura',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.49 },
      'lidl-corso-vercelli': { price: 2.29 },
      'carrefour-via-verbano': { price: 2.69 },
      'coop-corso-italia': { price: 2.45 },
      'conad-via-san-bernardino': { price: 2.79 },
    }
  },
  {
    id: 'insalata-iceberg',
    name: 'Insalata Iceberg',
    category: 'frutta-verdura',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 0.99 },
      'lidl-corso-vercelli': { price: 0.89 },
      'carrefour-via-verbano': { price: 1.09 },
      'coop-corso-italia': { price: 0.95 },
      'eurospin-viale-kennedy': { price: 0.79 },
      'md-via-novara': { price: 0.75 },
      'aldi-corso-vercelli': { price: 0.85 },
    }
  },
  {
    id: 'zucchine-1kg',
    name: 'Zucchine 1kg',
    category: 'frutta-verdura',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.99 },
      'lidl-corso-vercelli': { price: 2.49 },
      'carrefour-via-verbano': { price: 3.19 },
      'coop-corso-italia': { price: 2.89 },
      'eurospin-viale-kennedy': { price: 2.29 },
    }
  },
  {
    id: 'carote-1kg',
    name: 'Carote 1kg',
    category: 'frutta-verdura',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.29 },
      'lidl-corso-vercelli': { price: 0.99 },
      'carrefour-via-verbano': { price: 1.39 },
      'coop-corso-italia': { price: 1.19 },
      'eurospin-viale-kennedy': { price: 0.89 },
      'md-via-novara': { price: 0.85 },
      'penny-via-biandrate': { price: 0.95 },
    }
  },

  // === CARNE E SALUMI ===
  {
    id: 'prosciutto-crudo-san-daniele-100g',
    name: 'Prosciutto Crudo San Daniele 100g',
    category: 'carne-pesce',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 3.99 },
      'carrefour-via-verbano': { price: 4.19 },
      'coop-corso-italia': { price: 4.09 },
      'conad-via-san-bernardino': { price: 4.29 },
      'bennet-centro-commerciale': { price: 3.89 },
    }
  },
  {
    id: 'prosciutto-cotto-rovagnati-120g',
    name: 'Prosciutto Cotto Rovagnati 120g',
    category: 'carne-pesce',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.49 },
      'lidl-corso-vercelli': { price: 2.29 },
      'carrefour-via-verbano': { price: 2.59 },
      'coop-corso-italia': { price: 2.45 },
      'penny-via-biandrate': { price: 2.19 },
    }
  },
  {
    id: 'petto-pollo-1kg',
    name: 'Petto di Pollo 1kg',
    category: 'carne-pesce',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 9.99 },
      'lidl-corso-vercelli': { price: 8.99 },
      'carrefour-via-verbano': { price: 10.49 },
      'coop-corso-italia': { price: 9.79 },
      'eurospin-viale-kennedy': { price: 8.49 },
      'aldi-corso-vercelli': { price: 8.79 },
    }
  },
  {
    id: 'salmone-affumicato-100g',
    name: 'Salmone Affumicato 100g',
    category: 'carne-pesce',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 4.99, onSale: true, salePrice: 3.99 },
      'lidl-corso-vercelli': { price: 4.49 },
      'carrefour-via-verbano': { price: 5.29 },
      'coop-corso-italia': { price: 4.89 },
      'bennet-centro-commerciale': { price: 4.79 },
    }
  },

  // === SURGELATI ===
  {
    id: 'spinaci-findus-450g',
    name: 'Spinaci Findus 450g',
    category: 'surgelati',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.19 },
      'lidl-corso-vercelli': { price: 1.99 },
      'carrefour-via-verbano': { price: 2.29 },
      'coop-corso-italia': { price: 2.15 },
      'conad-via-san-bernardino': { price: 2.35 },
      'eurospin-viale-kennedy': { price: 1.89 },
    }
  },
  {
    id: 'piselli-findus-750g',
    name: 'Piselli Findus 750g',
    category: 'surgelati',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.99 },
      'lidl-corso-vercelli': { price: 2.69 },
      'carrefour-via-verbano': { price: 3.09 },
      'coop-corso-italia': { price: 2.89 },
      'md-via-novara': { price: 2.59 },
    }
  },
  {
    id: 'gelato-haagen-dazs-vanilla-460ml',
    name: 'Gelato Häagen-Dazs Vanilla 460ml',
    category: 'surgelati',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 5.99 },
      'carrefour-via-verbano': { price: 6.29 },
      'coop-corso-italia': { price: 6.19 },
      'bennet-centro-commerciale': { price: 5.79, onSale: true, salePrice: 4.99 },
    }
  },

  // === DISPENSA ===
  {
    id: 'olio-evo-monini-1l',
    name: 'Olio Extra Vergine Monini 1L',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 8.99 },
      'lidl-corso-vercelli': { price: 7.99 },
      'carrefour-via-verbano': { price: 9.29 },
      'coop-corso-italia': { price: 8.79 },
      'conad-via-san-bernardino': { price: 9.49 },
      'eurospin-viale-kennedy': { price: 7.49 },
    }
  },
  {
    id: 'passata-mutti-700g',
    name: 'Passata Mutti 700g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.69 },
      'lidl-corso-vercelli': { price: 1.49 },
      'carrefour-via-verbano': { price: 1.79 },
      'coop-corso-italia': { price: 1.65 },
      'eurospin-viale-kennedy': { price: 1.39 },
      'md-via-novara': { price: 1.35 },
      'penny-via-biandrate': { price: 1.45 },
    }
  },
  {
    id: 'pelati-mutti-400g',
    name: 'Pomodori Pelati Mutti 400g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 1.29 },
      'lidl-corso-vercelli': { price: 1.09 },
      'carrefour-via-verbano': { price: 1.39 },
      'coop-corso-italia': { price: 1.25 },
      'md-via-novara': { price: 0.99 },
    }
  },
  {
    id: 'tonno-rio-mare-3x80g',
    name: 'Tonno Rio Mare 3x80g',
    category: 'dispensa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 4.49 },
      'lidl-corso-vercelli': { price: 4.19 },
      'carrefour-via-verbano': { price: 4.69 },
      'coop-corso-italia': { price: 4.39 },
      'conad-via-san-bernardino': { price: 4.79 },
      'bennet-centro-commerciale': { price: 4.29 },
    }
  },

  // === IGIENE ===
  {
    id: 'carta-igienica-scottex-8-rotoli',
    name: 'Carta Igienica Scottex 8 rotoli',
    category: 'igiene',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 4.99 },
      'lidl-corso-vercelli': { price: 4.49 },
      'carrefour-via-verbano': { price: 5.19 },
      'coop-corso-italia': { price: 4.89 },
      'eurospin-viale-kennedy': { price: 3.99 },
      'md-via-novara': { price: 3.89 },
      'penny-via-biandrate': { price: 4.29 },
    }
  },
  {
    id: 'shampoo-pantene-225ml',
    name: 'Shampoo Pantene 225ml',
    category: 'igiene',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 3.99 },
      'lidl-corso-vercelli': { price: 3.49 },
      'carrefour-via-verbano': { price: 4.19 },
      'coop-corso-italia': { price: 3.89 },
      'bennet-centro-commerciale': { price: 3.79 },
    }
  },
  {
    id: 'dentifricio-colgate-75ml',
    name: 'Dentifricio Colgate Total 75ml',
    category: 'igiene',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.99 },
      'lidl-corso-vercelli': { price: 2.69, onSale: true, salePrice: 1.99 },
      'carrefour-via-verbano': { price: 3.19 },
      'coop-corso-italia': { price: 2.89 },
      'eurospin-viale-kennedy': { price: 2.49 },
    }
  },

  // === CASA ===
  {
    id: 'detersivo-dash-pods-16pz',
    name: 'Detersivo Dash Pods 16 pezzi',
    category: 'casa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 6.99 },
      'lidl-corso-vercelli': { price: 6.49 },
      'carrefour-via-verbano': { price: 7.29 },
      'coop-corso-italia': { price: 6.89 },
      'eurospin-viale-kennedy': { price: 5.99 },
      'bennet-centro-commerciale': { price: 6.79 },
    }
  },
  {
    id: 'ammorbidente-coccolino-750ml',
    name: 'Ammorbidente Coccolino 750ml',
    category: 'casa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.49 },
      'lidl-corso-vercelli': { price: 2.19 },
      'carrefour-via-verbano': { price: 2.59 },
      'coop-corso-italia': { price: 2.39 },
      'md-via-novara': { price: 1.99 },
      'penny-via-biandrate': { price: 2.09 },
    }
  },
  {
    id: 'sgrassatore-chante-clair-625ml',
    name: 'Sgrassatore Chanteclair 625ml',
    category: 'casa',
    prices: {
      'esselunga-viale-giulio-cesare': { price: 2.29 },
      'lidl-corso-vercelli': { price: 1.99 },
      'carrefour-via-verbano': { price: 2.39 },
      'coop-corso-italia': { price: 2.19 },
      'eurospin-viale-kennedy': { price: 1.79 },
      'md-via-novara': { price: 1.75 },
    }
  },
]

// Helper: cerca prodotti per nome (fuzzy search)
export function searchProducts(query) {
  if (!query || query.trim().length < 2) return []

  const queryLower = query.toLowerCase().trim()

  return PRODUCTS_DATABASE.filter(product =>
    product.name.toLowerCase().includes(queryLower)
  ).slice(0, 10) // Max 10 risultati
}

// Helper: trova prodotto per ID
export function getProductById(productId) {
  return PRODUCTS_DATABASE.find(p => p.id === productId)
}

// Helper: trova il prezzo migliore per un prodotto tra i supermercati preferiti
export function getBestPrice(product, favoriteSupermarkets) {
  if (!product?.prices || !favoriteSupermarkets?.length) return null

  let bestPrice = null
  let bestSupermarket = null

  favoriteSupermarkets.forEach(supermarketId => {
    const priceInfo = product.prices[supermarketId]
    if (!priceInfo) return

    const effectivePrice = priceInfo.onSale ? priceInfo.salePrice : priceInfo.price

    if (bestPrice === null || effectivePrice < bestPrice) {
      bestPrice = effectivePrice
      bestSupermarket = supermarketId
    }
  })

  return bestPrice ? { price: bestPrice, supermarketId: bestSupermarket } : null
}

// Helper: ottieni prezzi per supermercati preferiti
export function getPricesForFavorites(product, favoriteSupermarkets) {
  if (!product?.prices || !favoriteSupermarkets?.length) return []

  return favoriteSupermarkets
    .map(supermarketId => {
      const priceInfo = product.prices[supermarketId]
      if (!priceInfo) return null

      return {
        supermarketId,
        price: priceInfo.price,
        onSale: priceInfo.onSale || false,
        salePrice: priceInfo.salePrice,
        effectivePrice: priceInfo.onSale ? priceInfo.salePrice : priceInfo.price,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.effectivePrice - b.effectivePrice)
}
