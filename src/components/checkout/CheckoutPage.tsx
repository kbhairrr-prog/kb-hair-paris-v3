'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Lock } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutPageProps {
  locale: 'fr' | 'en'
}

interface FormData {
  email: string
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  zip: string
  country: string
  phone: string
}

export default function CheckoutPage({ locale }: CheckoutPageProps) {
  const items      = useCartStore(s => s.items)
  const subtotal   = useCartStore(s => s.getSubtotal())
  const shipping   = useCartStore(s => s.getShipping())
  const discount   = useCartStore(s => s.getDiscount())
  const total      = useCartStore(s => s.getTotal())
  const promoCode  = useCartStore(s => s.promoCode)
  const applyPromo = useCartStore(s => s.applyPromo)
  const removePromo= useCartStore(s => s.removePromo)
  const clearCart  = useCartStore(s => s.clearCart)

  const [form, setForm]             = useState<FormData>({
    email: '', firstName: '', lastName: '',
    address1: '', address2: '', city: '', zip: '', country: 'FR', phone: '',
  })
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [loading, setLoading]       = useState(false)
  const [payMethod, setPayMethod]   = useState<'stripe' | 'paypal'>('stripe')
  const [step, setStep]             = useState<'info' | 'payment'>('info')

  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  // Valider code promo via API
  const handlePromo = async () => {
    if (!promoInput.trim()) return
    setPromoError('')
    try {
      const res  = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.toUpperCase(), subtotal }),
      })
      const data = await res.json()
      if (data.error) { setPromoError(data.error); return }
      applyPromo(data.promo)
      setPromoInput('')
    } catch {
      setPromoError(locale === 'fr' ? 'Code invalide' : 'Invalid code')
    }
  }

  // Checkout Stripe
  const handleStripeCheckout = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, form, promoCode, locale }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        const stripe = await stripePromise
        await stripe?.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Checkout PayPal
  const handlePayPalCheckout = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, form, promoCode, locale }),
      })
      const data = await res.json()
      if (data.approvalUrl) window.location.href = data.approvalUrl
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-[68px] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="font-sans text-[12px] tracking-[0.15em] uppercase text-[#888]">
          {locale === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
        </p>
        <Link href={`/${locale}`} className="font-sans text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 text-black no-underline">
          {locale === 'fr' ? 'Retour à la boutique' : 'Back to shop'}
        </Link>
      </div>
    )
  }

  const inputCls = "w-full px-3 py-3 border border-[#e0e0e0] font-sans text-[13px] font-light text-black placeholder:text-[#bbb] outline-none focus:border-black transition-colors bg-white"

  return (
    <div className="min-h-screen bg-[#f8f8f8] pt-[68px]">
      {/* Header checkout */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-1 text-[#888] no-underline">
            <ChevronLeft size={16} />
            <span className="font-sans text-[11px] tracking-[0.1em] uppercase">
              {locale === 'fr' ? 'Boutique' : 'Shop'}
            </span>
          </Link>
          <span className="font-serif text-[16px] tracking-[0.2em]">KB HAIR PARIS</span>
          <div className="flex items-center gap-1 text-[#888]">
            <Lock size={13} />
            <span className="font-sans text-[10px] tracking-[0.1em] uppercase">Sécurisé</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* ── RÉCAP COMMANDE ── */}
        <div className="bg-white border border-[#e8e8e8]">
          <div className="px-4 py-3 border-b border-[#e8e8e8]">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black">
              {locale === 'fr' ? 'MA COMMANDE' : 'MY ORDER'} ({items.reduce((a, i) => a + i.quantity, 0)})
            </p>
          </div>
          <div className="divide-y divide-[#f0f0f0]">
            {items.map(item => {
              const name = locale === 'fr' ? item.product.name_fr : item.product.name_en
              const img  = item.product.images?.[0]
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative w-14 h-16 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                    {img && <Image src={img.url} alt={name} fill className="object-cover" sizes="56px" />}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#888] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[11px] tracking-[0.08em] uppercase text-black leading-snug truncate">{name}</p>
                    {item.variant && (
                      <p className="font-sans text-[10px] text-[#888] mt-0.5">
                        {item.variant.options?.map(o => locale === 'fr' ? o.value_fr : o.value_en).join(' / ')}
                      </p>
                    )}
                  </div>
                  <p className="font-sans text-[12px] font-light text-black flex-shrink-0">{fmt(item.total_price)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CODE PROMO ── */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-4">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-3">
            {locale === 'fr' ? 'CODE PROMO' : 'PROMO CODE'}
          </p>
          {promoCode ? (
            <div className="flex items-center justify-between">
              <span className="font-sans text-[12px] tracking-[0.1em] text-black">
                ✓ {promoCode}
              </span>
              <button onClick={removePromo} className="font-sans text-[10px] tracking-[0.1em] uppercase text-[#888] underline underline-offset-2 bg-transparent border-none cursor-pointer">
                {locale === 'fr' ? 'Retirer' : 'Remove'}
              </button>
            </div>
          ) : (
            <div className="flex gap-0">
              <input
                value={promoInput}
                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handlePromo()}
                placeholder={locale === 'fr' ? 'Code promo' : 'Promo code'}
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={handlePromo}
                className="bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 border-none cursor-pointer hover:opacity-85"
              >
                {locale === 'fr' ? 'OK' : 'Apply'}
              </button>
            </div>
          )}
          {promoError && <p className="font-sans text-[11px] text-red-500 mt-2">{promoError}</p>}
        </div>

        {/* ── TOTAL ── */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between font-sans text-[12px] font-light text-[#555]">
              <span>{locale === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-sans text-[12px] font-light text-green-700">
                <span>{locale === 'fr' ? 'Réduction' : 'Discount'}</span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-sans text-[12px] font-light text-[#555]">
              <span>{locale === 'fr' ? 'Livraison' : 'Shipping'}</span>
              <span>{shipping === 0 ? (locale === 'fr' ? 'GRATUITE' : 'FREE') : fmt(shipping)}</span>
            </div>
            <div className="h-px bg-[#e8e8e8] my-1" />
            <div className="flex justify-between font-sans text-[14px] font-medium text-black">
              <span>TOTAL</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* ── FORMULAIRE INFOS ── */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-5">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-4">
            {locale === 'fr' ? 'VOS INFORMATIONS' : 'YOUR INFORMATION'}
          </p>
          <div className="flex flex-col gap-3">
            <input placeholder="Email *" type="email" value={form.email} onChange={update('email')} className={inputCls} required />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder={locale === 'fr' ? 'Prénom *' : 'First name *'} value={form.firstName} onChange={update('firstName')} className={inputCls} required />
              <input placeholder={locale === 'fr' ? 'Nom *' : 'Last name *'} value={form.lastName} onChange={update('lastName')} className={inputCls} required />
            </div>
            <input placeholder={locale === 'fr' ? 'Adresse *' : 'Address *'} value={form.address1} onChange={update('address1')} className={inputCls} required />
            <input placeholder={locale === 'fr' ? 'Complément d\'adresse' : 'Apartment, suite...'} value={form.address2} onChange={update('address2')} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder={locale === 'fr' ? 'Ville *' : 'City *'} value={form.city} onChange={update('city')} className={inputCls} required />
              <input placeholder={locale === 'fr' ? 'Code postal *' : 'ZIP code *'} value={form.zip} onChange={update('zip')} className={inputCls} required />
            </div>
            <select value={form.country} onChange={update('country')} className={inputCls}>
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="NL">Pays-Bas</option>
              <option value="IT">Italie</option>
              <option value="DE">Allemagne</option>
              <option value="CH">Suisse</option>
              <option value="LU">Luxembourg</option>
              <option value="ES">Espagne</option>
              <option value="GB">Royaume-Uni</option>
              <option value="US">États-Unis</option>
              <option value="CA">Canada</option>
              <option value="AU">Australie</option>
              <option value="JP">Japon</option>
              <option value="BR">Brésil</option>
              <option value="MX">Mexique</option>
              <option value="SN">Sénégal</option>
              <option value="CI">Côte d&apos;Ivoire</option>
              <option value="BJ">Bénin</option>
              <option value="CM">Cameroun</option>
              <option value="GH">Ghana</option>
              <option value="NG">Nigeria</option>
              <option value="MA">Maroc</option>
              <option value="TN">Tunisie</option>
              <option value="DZ">Algérie</option>
              <option value="GA">Gabon</option>
              <option value="CG">Congo</option>
              <option value="CD">RD Congo</option>
              <option value="TG">Togo</option>
              <option value="BF">Burkina Faso</option>
              <option value="ML">Mali</option>
              <option value="GN">Guinée</option>
              <option value="MG">Madagascar</option>
              <option value="RE">La Réunion</option>
              <option value="GP">Guadeloupe</option>
              <option value="MQ">Martinique</option>
              <option value="GF">Guyane</option>
              <option value="NC">Nouvelle-Calédonie</option>
              <option value="PF">Polynésie française</option>
              <option value="PT">Portugal</option>
              <option value="AT">Autriche</option>
              <option value="SE">Suède</option>
              <option value="NO">Norvège</option>
              <option value="DK">Danemark</option>
              <option value="FI">Finlande</option>
              <option value="IE">Irlande</option>
              <option value="PL">Pologne</option>
              <option value="RO">Roumanie</option>
              <option value="GR">Grèce</option>
            </select>
            <input placeholder={locale === 'fr' ? 'Téléphone' : 'Phone'} value={form.phone} onChange={update('phone')} className={inputCls} />
          </div>
        </div>

        {/* ── PAIEMENT ── */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-5">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-4">
            {locale === 'fr' ? 'PAIEMENT' : 'PAYMENT'}
          </p>

          {/* Apple Pay / Google Pay */}
          <div className="mb-2">
            {typeof window !== 'undefined' && (
              <div id="payment-request-container">
                {/* PaymentRequestButton monté dynamiquement */}
              </div>
            )}
          </div>



          {/* CTA paiement */}
          <button
            onClick={handleStripeCheckout}
            disabled={loading || !form.email || !form.firstName || !form.address1}
            className={`
              w-full py-4 font-sans text-[11px] font-medium tracking-[0.22em] uppercase
              transition-all border-none cursor-pointer
              ${loading || !form.email || !form.firstName || !form.address1
                ? 'bg-[#e0e0e0] text-[#999] cursor-not-allowed'
                : 'bg-black text-white hover:opacity-85'
              }
            `}
          >
            {loading
              ? (locale === 'fr' ? 'REDIRECTION...' : 'REDIRECTING...')
              : `${locale === 'fr' ? 'PAYER' : 'PAY'} ${fmt(total)}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 font-sans text-[10px] text-[#aaa] tracking-[0.08em] mt-3">
            <Lock size={11} />
            {locale === 'fr' ? 'Paiement 100% sécurisé · Stripe · PayPal' : '100% secure payment · Stripe · PayPal'}
          </p>
        </div>
      </div>
    </div>
  )
}
