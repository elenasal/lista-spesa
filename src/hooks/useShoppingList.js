import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useShoppingList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Fetch items from database
  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setItems(data || [])
    } catch (err) {
      console.error('Error fetching items:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Add new item
  const addItem = async (name, quantity = 1, category = 'altro') => {
    if (!user || !name.trim()) return null

    try {
      setSaving(true)
      setError(null)

      const newItem = {
        user_id: user.id,
        name: name.trim(),
        quantity,
        category,
        checked: false,
      }

      const { data, error } = await supabase
        .from('shopping_items')
        .insert([newItem])
        .select()
        .single()

      if (error) throw error

      setItems(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding item:', err)
      setError(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  // Toggle item checked status
  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    // Optimistic update
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, checked: !i.checked } : i
    ))

    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ checked: !item.checked })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      // Rollback on error
      setItems(prev => prev.map(i =>
        i.id === id ? { ...i, checked: item.checked } : i
      ))
      console.error('Error toggling item:', err)
      setError(err.message)
    }
  }

  // Update item
  const updateItem = async (id, updates) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    // Optimistic update
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, ...updates } : i
    ))

    try {
      const { error } = await supabase
        .from('shopping_items')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      // Rollback on error
      setItems(prev => prev.map(i =>
        i.id === id ? item : i
      ))
      console.error('Error updating item:', err)
      setError(err.message)
    }
  }

  // Delete item
  const deleteItem = async (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    // Optimistic update
    setItems(prev => prev.filter(i => i.id !== id))

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      // Rollback on error
      setItems(prev => [...prev, item].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ))
      console.error('Error deleting item:', err)
      setError(err.message)
    }
  }

  // Clear all checked items
  const clearChecked = async () => {
    const checkedItems = items.filter(i => i.checked)
    if (checkedItems.length === 0) return

    // Optimistic update
    setItems(prev => prev.filter(i => !i.checked))

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('user_id', user.id)
        .eq('checked', true)

      if (error) throw error
    } catch (err) {
      // Rollback on error
      setItems(prev => [...prev, ...checkedItems].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      ))
      console.error('Error clearing checked:', err)
      setError(err.message)
    }
  }

  // Get items grouped by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'altro'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  // Stats
  const totalItems = items.length
  const checkedItems = items.filter(i => i.checked).length
  const uncheckedItems = totalItems - checkedItems

  return {
    items,
    itemsByCategory,
    loading,
    saving,
    error,
    addItem,
    toggleItem,
    updateItem,
    deleteItem,
    clearChecked,
    refresh: fetchItems,
    stats: {
      total: totalItems,
      checked: checkedItems,
      unchecked: uncheckedItems,
    },
  }
}
