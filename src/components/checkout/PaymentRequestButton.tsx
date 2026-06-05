'use client'

import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cart'

interface PaymentRequestButtonProps {
  locale: 'fr' | 'en'
  onSuccess?: (paymentMethod: any) => void
}

export default function PaymentRequestButton({ locale, onSuccess }: PaymentRequestButtonProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const [available,   setAvailable]   = useState(false)
  const [prButton,    setPrButton]    = useState<any>(null)
  const [initialized, setInitialized] = useState(false)

  const total      = useCartStore(s => s.getTotal())
  const items      = useCartStore(s => s.items)
  const shipping   = useCartStore(s => s.getShipping())
  const discount   = useCartStore(s => s.getDiscount())

  useEffect(() => {
    if (initialized || !containerRef.current) return

    const init = async () => {
      try {
        const { loadStripe } = await import('@stripe/stripe-js')
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        if (!stripe) return

        const paymentRequest = stripe.paymentRequest({
          country:  'FR',
          currency: 'eur',
          total: {
            label: 'KB Hair Paris',
            amount: Math.round(total * 100),
          },
          displayItems: [
            ...items.map(item => ({
              label:  locale === 'fr' ? item.product.name_fr : item.product.name_en,
              amount: Math.round(item.total_price * 100),
            })),
            ...(shipping > 0 ? [{ label: locale === 'fr' ? 'Livraison' : 'Shipping', amount: Math.round(shipping * 100) }] : []),
            ...(discount > 0 ? [{ label: locale === 'fr' ? 'Réduction' : 'Discount',  amount: -Math.round(discount * 100) }] : []),
          ],
          requestPayerName:  true,
          requestPayerEmail: true,
          requestShipping:   true,
          shippingOptions: [
            {
              id:     'standard',
              label:  locale === 'fr' ? 'Livraison standard (3-5 jours)' : 'Standard shipping (3-5 days)',
              detail: '',
              amount: Math.round(shipping * 100),
            },
          ],
        })

        // Vérifier disponibilité Apple Pay / Google Pay
        const result = await paymentRequest.canMakePayment()
        if (!result) return

        setAvailable(true)

        // Créer le bouton Stripe
        const elements = stripe.elements()
        const button   = elements.create('paymentRequestButton', {
          paymentRequest,
          style: {
            paymentRequestButton: {
              type:   'buy',
              theme:  'dark',
              height: '48px',
            },
          },
        })

        button.mount(containerRef.current!)
        setPrButton(button)

        // Gérer le paiement
        paymentRequest.on('paymentmethod', async (e) => {
          try {
            // Créer PaymentIntent côté serveur
            const res = await fetch('/api/checkout/payment-intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({ amount: Math.round(total * 100), currency: 'eur' }),
            })
            const { clientSecret } = await res.json()

            const { paymentIntent, error } = await stripe.confirmCardPayment(
              clientSecret,
              { payment_method: e.paymentMethod.id },
              { handleActions: false }
            )

            if (error) {
              e.complete('fail')
              return
            }

            e.complete('success')
            onSuccess?.(paymentIntent)
          } catch {
            e.complete('fail')
          }
        })

        setInitialized(true)
      } catch (err) {
        console.warn('Payment Request Button non disponible:', err)
      }
    }

    init()
  }, [total, items, shipping, discount, locale, onSuccess, initialized])

  if (!available) return null

  return (
    <div className="mb-4">
      <div ref={containerRef} className="w-full" />
      <div className="flex items-center gap-3 mt-3 mb-3">
        <div className="flex-1 h-px bg-[#e0e0e0]" />
        <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#aaa]">
          {locale === 'fr' ? 'ou payer par carte' : 'or pay by card'}
        </span>
        <div className="flex-1 h-px bg-[#e0e0e0]" />
      </div>
    </div>
  )
}
