// Offerte derivate dai dati di esempio già presenti (productsDatabase.js).
// Prende tutti i prodotti con almeno un punto vendita in promozione (onSale)
// e ne costruisce una notifica "prodotto in offerta da supermercato".
//
// ⚠️ MOCKUP: un dev collegherà offerte + DB reali e filtrerà per i prodotti
// effettivamente presenti nelle liste dell'utente.
import { PRODUCTS_DATABASE } from './productsDatabase'

export const MOCK_OFFERS = PRODUCTS_DATABASE.flatMap((product) =>
  Object.entries(product.prices)
    .filter(([, info]) => info.onSale && info.salePrice != null)
    .map(([supermarketId, info]) => ({
      id: `${product.id}__${supermarketId}`,
      productId: product.id,
      productName: product.name,
      supermarketId,
      oldPrice: info.price,
      newPrice: info.salePrice,
    }))
)

// Percentuale di sconto arrotondata
export function getDiscountPercent(oldPrice, newPrice) {
  if (!oldPrice || oldPrice <= 0) return 0
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100)
}
