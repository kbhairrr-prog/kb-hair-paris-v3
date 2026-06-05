import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant, PromoCode } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  promoCode?: string
  promoApplied?: PromoCode

  // Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (product: Product, variant?: ProductVariant, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  applyPromo: (code: PromoCode) => void
  removePromo: () => void

  // Computed
  getSubtotal: () => number
  getItemCount: () => number
  getDiscount: () => number
  getShipping: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: undefined,
      promoApplied: undefined,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, variant, qty = 1) => {
        const items = get().items
        const id = variant ? `${product.id}-${variant.id}` : product.id
        const existing = items.find((i) => i.id === id)
        const price = variant?.price ?? product.price

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === id
                ? { ...i, quantity: i.quantity + qty, total_price: (i.quantity + qty) * price }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id,
                product_id: product.id,
                variant_id: variant?.id,
                product,
                variant,
                quantity: qty,
                unit_price: price,
                total_price: qty * price,
              },
            ],
          })
        }
        set({ isOpen: true })
      },

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
          return
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: qty, total_price: qty * i.unit_price } : i
          ),
        }))
      },

      clearCart: () => set({ items: [], promoCode: undefined, promoApplied: undefined }),

      applyPromo: (code) => set({ promoCode: code.code, promoApplied: code }),
      removePromo: () => set({ promoCode: undefined, promoApplied: undefined }),

      getSubtotal: () => get().items.reduce((acc, i) => acc + i.total_price, 0),

      getItemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      getDiscount: () => {
        const promo = get().promoApplied
        const subtotal = get().getSubtotal()
        if (!promo) return 0
        if (promo.type === 'percentage') return (subtotal * promo.value) / 100
        if (promo.type === 'fixed') return Math.min(promo.value, subtotal)
        return 0
      },

      getShipping: () => {
        const subtotal = get().getSubtotal() - get().getDiscount()
        const promo = get().promoApplied
        if (promo?.type === 'free_shipping') return 0
        return subtotal >= 230 ? 0 : 6.90
      },

      getTotal: () =>
        Math.max(0, get().getSubtotal() - get().getDiscount() + get().getShipping()),
    }),
    {
      name: 'kb-hair-cart',
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode, promoApplied: s.promoApplied }),
    }
  )
)
