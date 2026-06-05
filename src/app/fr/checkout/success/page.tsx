'use client'
import { Suspense } from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'

function CheckoutSuccessFRInner() {
  const params = useSearchParams()
  const orderId = params.get('order_id')
  const clearCart = useCartStore(s => s.clearCart)
  useEffect(() => { clearCart() }, [clearCart])
  return (
    <div className="min-h-screen bg-white pt-[68px] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-2xl mb-6">✓</div>
      <h1 className="font-serif text-[28px] font-light tracking-[0.1em] uppercase text-black mb-3">Commande confirmée</h1>
      <p className="font-sans text-[13px] font-light text-[#555] mb-2">Merci pour votre commande !</p>
      {orderId && <p className="font-sans text-[11px] tracking-[0.1em] text-[#888] mb-8">Commande # {orderId.slice(0,8).toUpperCase()}</p>}
      <p className="font-sans text-[12px] font-light text-[#555] max-w-sm mb-8">
        Un email de confirmation vous a été envoyé. Votre commande sera traitée rapidement.
      </p>
      <Link href="/fr" className="bg-black text-white font-sans text-[11px] tracking-[0.22em] uppercase px-10 py-4 no-underline hover:opacity-85 transition-opacity">
        CONTINUER LES ACHATS
      </Link>
    </div>
  )
}

export default function CheckoutSuccessFR() {
  return (
    <Suspense fallback={<div/>}>
      <CheckoutSuccessFRInner />
    </Suspense>
  )
}
