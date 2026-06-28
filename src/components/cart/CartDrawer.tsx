'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'

interface CartDrawerProps {
  locale: 'fr' | 'en'
}

export default function CartDrawer({ locale }: CartDrawerProps) {
  const isOpen      = useCartStore(s => s.isOpen)
  const closeCart   = useCartStore(s => s.closeCart)
  const items       = useCartStore(s => s.items)
  const removeItem  = useCartStore(s => s.removeItem)
  const updateQty   = useCartStore(s => s.updateQuantity)
  const subtotal    = useCartStore(s => s.getSubtotal())
  const shipping    = useCartStore(s => s.getShipping())
  const [shippingCost, setShippingCost] = useState(25)
  const [freeThreshold, setFreeThreshold] = useState(230)

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('key', 'shipping').single()
      .then(({ data }) => {
        if (data?.value) {
          setShippingCost(data.value.shipping_cost ?? 25)
          setFreeThreshold(data.value.free_threshold ?? 230)
        }
      })
  }, [])
  const total       = useCartStore(s => s.getTotal())
  const itemCount   = useCartStore(s => s.getItemCount())

  const FREE_THRESHOLD = 230
  const remaining = Math.max(0, FREE_THRESHOLD - subtotal)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-[2px]"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 bottom-0 z-[90] bg-white w-full max-w-[380px]
        flex flex-col
        transform transition-transform duration-[380ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase">
              {locale === 'fr' ? 'PANIER' : 'CART'} ({itemCount})
            </span>
          </div>
          <button onClick={closeCart}>
            <X size={20} strokeWidth={1.2} />
          </button>
        </div>

        {/* Barre progression livraison gratuite */}
        {remaining > 0 && (
          <div className="px-5 py-3 bg-[#f5f5f5] border-b border-gray-100">
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-600 mb-2">
              {locale === 'fr'
                ? `Plus que ${fmt(remaining)} pour la livraison gratuite`
                : `${fmt(remaining)} away from free shipping`}
            </p>
            <div className="h-0.5 bg-gray-200 w-full">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {remaining === 0 && (
          <div className="px-5 py-3 bg-black text-center">
            <p className="text-[10px] tracking-[0.15em] uppercase text-white">
              {locale === 'fr' ? '🎉 Livraison gratuite !' : '🎉 Free shipping!'}
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} strokeWidth={0.8} className="text-gray-200" />
              <p className="text-[11px] tracking-[0.15em] uppercase text-gray-400">
                {locale === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
              </p>
              <a
                href={`/${locale}/search`}
                onClick={closeCart}
                className="text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 text-black"
              >
                {locale === 'fr' ? 'Continuer mes achats' : 'Continue shopping'}
              </a>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-24 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name_fr}
                      fill className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium tracking-[0.1em] uppercase text-black leading-snug mb-1 truncate">
                    {locale === 'fr' ? item.product.name_fr : item.product.name_en}
                  </p>
                  {item.variant && (
                    <p className="text-[10px] text-gray-400 tracking-wide mb-1">
                      {item.variant.options?.map(o =>
                        locale === 'fr' ? o.value_fr : o.value_en
                      ).join(' / ')}
                    </p>
                  )}
                  {/* Badge lot dans le panier */}
                  {item.product.bundle_size && (
                    <p className="text-[9px] tracking-[0.12em] uppercase text-[#C9A84C] mb-1">
                      {locale === 'fr'
                        ? (item.product.bundle_label_fr || `Lot de ${item.product.bundle_size}`)
                        : (item.product.bundle_label_en || `Bundle of ${item.product.bundle_size}`)}
                    </p>
                  )}
                  <p className="text-[12px] font-light text-black mb-3">
                    {fmt(item.unit_price)}
                  </p>

                  {/* Qty + supprimer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-black hover:bg-gray-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 h-7 flex items-center justify-center text-[12px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-black hover:bg-gray-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] tracking-[0.1em] uppercase text-gray-400 hover:text-black underline underline-offset-2"
                    >
                      {locale === 'fr' ? 'Retirer' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer panier */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5">
            {/* Sous-total */}
            <div className="flex justify-between text-[11px] tracking-[0.08em] uppercase mb-2">
              <span className="text-gray-500">{locale === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
              <span className="text-black font-medium">{fmt(subtotal)}</span>
            </div>
            {/* Livraison */}
            <div className="flex justify-between text-[11px] tracking-[0.08em] uppercase mb-4">
              <span className="text-gray-500">{locale === 'fr' ? 'Livraison' : 'Shipping'}</span>
              <span className="text-black font-medium">
                {shipping === 0
                  ? (locale === 'fr' ? 'GRATUITE' : 'FREE')
                  : fmt(shipping)}
              </span>
            </div>

            {/* Bouton checkout */}
            <Link
              href={`/${locale}/checkout`}
              onClick={closeCart}
              className="block w-full bg-black text-white text-center text-[11px] font-medium tracking-[0.22em] uppercase py-4 hover:opacity-85 transition-opacity no-underline"
            >
              {locale === 'fr' ? `COMMANDER — ${fmt(total)}` : `CHECKOUT — ${fmt(total)}`}
            </Link>

            {/* Paiements */}
            <p className="text-center text-[9px] tracking-[0.1em] uppercase text-gray-400 mt-3">
              {locale === 'fr' ? 'Paiement sécurisé · Stripe · PayPal' : 'Secure payment · Stripe · PayPal'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
