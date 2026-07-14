// Volantini finti (mockup) generati dai prodotti che un supermercato vende
// nel database prezzi. Le offerte reali (onSale) finiscono in cima.
import { PRODUCTS_DATABASE } from './productsDatabase'
import { getDiscountPercent } from './offers'

export function getFlyersForSupermarket(supermarket) {
  if (!supermarket) return []
  const id = supermarket.id

  const products = PRODUCTS_DATABASE
    .filter(p => p.prices?.[id])
    .map(p => {
      const info = p.prices[id]
      const onSale = !!info.onSale && info.salePrice != null
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: onSale ? info.salePrice : info.price,
        oldPrice: onSale ? info.price : null,
        onSale,
        discount: onSale ? getDiscountPercent(info.price, info.salePrice) : null,
      }
    })

  if (products.length === 0) return []

  // Offerte reali in cima
  const sorted = [...products].sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0))

  const flyers = [
    {
      id: `${id}-settimana`,
      title: 'Offerte della settimana',
      period: 'Valido fino a domenica',
      accent: supermarket.color,
      supermarketName: supermarket.name,
      items: sorted.slice(0, 8),
    },
  ]
  if (sorted.length > 8) {
    flyers.push({
      id: `${id}-sottocosto`,
      title: 'Sottocosto',
      period: 'Solo questa settimana',
      accent: supermarket.color,
      supermarketName: supermarket.name,
      items: sorted.slice(8, 16),
    })
  }
  return flyers
}
