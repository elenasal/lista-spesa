// Attività finte delle liste condivise (mockup).
// type: 'item_added' (un utente ha aggiunto un prodotto)
//       'item_checked' (un utente ha comprato/checkato un prodotto)
export const MOCK_ACTIVITY = [
  { id: 'act-1', type: 'item_added', userId: 'u-giulia', listName: 'Spesa settimanale', productName: 'Latte Granarolo', hoursAgo: 1 },
  { id: 'act-2', type: 'item_checked', userId: 'u-marco', listName: 'Spesa settimanale', productName: 'Pane integrale', hoursAgo: 5 },
  { id: 'act-3', type: 'item_added', userId: 'u-marco', listName: 'Spesa settimanale', productName: 'Yogurt greco', hoursAgo: 11 },
  { id: 'act-4', type: 'item_checked', userId: 'u-giulia', listName: 'Spesa settimanale', productName: 'Uova biologiche', hoursAgo: 28 },
]
