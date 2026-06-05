import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

interface WishlistItem {
  product_id: string
  product: Product
  added_at: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem:    (product: Product) => void
  removeItem: (productId: string) => void
  hasItem:    (productId: string) => boolean
  toggleItem: (product: Product) => void
  clearAll:   () => void
  syncWithSupabase: (customerId: string) => Promise<void>
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (get().hasItem(product.id)) return
        set(s => ({
          items: [...s.items, { product_id: product.id, product, added_at: new Date().toISOString() }],
        }))
        // Sync Supabase en background si connecté
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return
          supabase.from('customers').select('id').eq('supabase_uid', user.id).single()
            .then(({ data: customer }) => {
              if (customer) {
                supabase.from('wishlists').upsert(
                  { customer_id: customer.id, product_id: product.id },
                  { onConflict: 'customer_id,product_id' }
                )
              }
            })
        })
      },

      removeItem: (productId) => {
        set(s => ({ items: s.items.filter(i => i.product_id !== productId) }))
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return
          supabase.from('customers').select('id').eq('supabase_uid', user.id).single()
            .then(({ data: customer }) => {
              if (customer) {
                supabase.from('wishlists').delete()
                  .eq('customer_id', customer.id).eq('product_id', productId)
              }
            })
        })
      },

      hasItem: (productId) => get().items.some(i => i.product_id === productId),

      toggleItem: (product) => {
        if (get().hasItem(product.id)) get().removeItem(product.id)
        else get().addItem(product)
      },

      clearAll: () => set({ items: [] }),

      // Charger la wishlist depuis Supabase au login
      syncWithSupabase: async (customerId) => {
        const { data } = await supabase
          .from('wishlists')
          .select('*, product:products(*, images:product_images(*))')
          .eq('customer_id', customerId)
        if (data) {
          set({
            items: data.map(w => ({
              product_id: w.product_id,
              product:    w.product as Product,
              added_at:   w.created_at,
            })),
          })
        }
      },
    }),
    {
      name: 'kb-hair-wishlist',
      partialize: (s) => ({ items: s.items }),
    }
  )
)
