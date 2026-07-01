# PROJECT_GUIDE - Lista della Spesa

## Panoramica

App minimalista per gestire la lista della spesa. Design "Fresh Blue" con palette azzurro/blu.

## Struttura

```
src/
├── components/
│   ├── layout/Header.jsx
│   ├── ui/CategoryIcon.jsx
│   ├── ui/EmptyState.jsx
│   ├── ui/LoadingSpinner.jsx
│   ├── AddProductForm.jsx
│   ├── ProductItem.jsx
│   └── ShoppingList.jsx
├── hooks/useShoppingList.js
├── App.jsx
├── main.jsx
└── index.css
```

## Design System

### Colori

| Nome | Hex | Uso |
|------|-----|-----|
| snow | #F8FAFC | Background |
| cloud | #F1F5F9 | Card |
| sky | #38BDF8 | Accento |
| ocean | #0EA5E9 | Primario |
| deep | #0284C7 | Hover |
| night | #1E293B | Testo |

### Categorie

| ID | Nome | Icona |
|----|------|-------|
| frutta-verdura | Frutta e Verdura | Apple |
| pane-cereali | Pane e Cereali | Croissant |
| latticini | Latticini | Milk |
| carne-pesce | Carne e Pesce | Beef |
| surgelati | Surgelati | Snowflake |
| dispensa | Dispensa | Package |
| bevande | Bevande | Wine |
| igiene | Igiene Personale | Sparkles |
| casa | Casa e Pulizia | Home |
| altro | Altro | ShoppingBag |

## Persistenza

Dati salvati in `localStorage` con chiave `lista-spesa-items`.

```javascript
// Struttura item
{
  id: "uuid",
  name: "Latte",
  quantity: 2,
  category: "latticini",
  checked: false,
  created_at: "2026-07-01T12:00:00Z"
}
```

## Evoluzione Futura

- [ ] Supabase per sync cloud
- [ ] Autenticazione utente
- [ ] Liste multiple
- [ ] Prodotti ricorrenti
- [ ] Suggerimenti smart
