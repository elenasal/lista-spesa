import {
  Apple,
  Croissant,
  Milk,
  Beef,
  Snowflake,
  Package,
  Wine,
  Sparkles,
  Home,
  ShoppingBag,
} from 'lucide-react'

const CATEGORY_ICONS = {
  'frutta-verdura': Apple,
  'pane-cereali': Croissant,
  'latticini': Milk,
  'carne-pesce': Beef,
  'surgelati': Snowflake,
  'dispensa': Package,
  'bevande': Wine,
  'igiene': Sparkles,
  'casa': Home,
  'altro': ShoppingBag,
}

export default function CategoryIcon({ category, className = '' }) {
  const Icon = CATEGORY_ICONS[category] || ShoppingBag
  return <Icon className={`w-5 h-5 ${className}`} />
}
