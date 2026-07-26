// Motore prezzi/prodotti in zona (feature 8+9+11).
// La "zona" al momento è l'insieme dei supermercati mock (Novara); in futuro
// verrà filtrata per geolocalizzazione reale. Espone i prezzi di un prodotto in
// TUTTI i punti vendita della zona (non solo i preferiti), con distanza, così da
// poter ordinare per "più conveniente" (prezzo) o "più vicino" (distanza) e
// calcolare il prezzo medio di zona.

import { SUPERMARKETS, distanceKm } from './supermarkets'

// Elenco { supermarketId, name, color, address, distance, price, onSale, salePrice,
// effectivePrice } dei supermercati della zona che vendono il prodotto.
// `userCoords` (se presente) rende reale la distanza.
export function getZonePrices(product, userCoords = null) {
  if (!product?.prices) return []
  return SUPERMARKETS.filter((sm) => product.prices[sm.id]).map((sm) => {
    const info = product.prices[sm.id]
    return {
      supermarketId: sm.id,
      name: sm.name,
      color: sm.color,
      address: sm.address,
      distance: distanceKm(sm, userCoords),
      price: info.price,
      onSale: !!info.onSale,
      salePrice: info.salePrice,
      effectivePrice: info.onSale ? info.salePrice : info.price,
    }
  })
}

// Ordina per prezzo effettivo crescente (a parità, più vicino prima).
export function sortByPrice(list) {
  return [...list].sort((a, b) => a.effectivePrice - b.effectivePrice || a.distance - b.distance)
}

// Ordina per distanza crescente (a parità, più conveniente prima).
export function sortByDistance(list) {
  return [...list].sort((a, b) => a.distance - b.distance || a.effectivePrice - b.effectivePrice)
}

// Prezzo medio del prodotto tra i supermercati della zona (o null).
export function getAverageInZone(product) {
  const list = getZonePrices(product)
  if (!list.length) return null
  const sum = list.reduce((acc, p) => acc + p.effectivePrice, 0)
  return sum / list.length
}
