'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReviewsSectionProps {
  productId: string
  locale: 'fr' | 'en'
}

export default function ReviewsSection({ productId, locale }: ReviewsSectionProps) {
  const [reviews,   setReviews]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [rating,    setRating]    = useState(5)
  const [hoverStar, setHoverStar] = useState(0)
  const [title,     setTitle]     = useState('')
  const [body,      setBody]      = useState('')
  const [submitting,setSubmitting]= useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [customer,  setCustomer]  = useState<any>(null)
  const [guestEmail, setGuestEmail] = useState('')
  const [guestName,  setGuestName]  = useState('')
  const [guestVerified, setGuestVerified] = useState(false)
  const [checkingGuest, setCheckingGuest] = useState(false)
  const [guestError, setGuestError] = useState('')
  const [showGuestCheck, setShowGuestCheck] = useState(false)

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data: rv } = await supabase.from('product_reviews').select('*, customer:customers(first_name,last_name)').eq('product_id', productId).eq('is_approved', true).order('created_at', { ascending: false })
        setReviews(rv ?? [])
      } catch(e) { setReviews([]) }
    }
    const loadCustomer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: cust } = await supabase.from('customers').select('id,first_name').eq('supabase_uid', user.id).single()
          setCustomer(cust)
        }
      } catch(e) {}
    }
    Promise.all([loadReviews(), loadCustomer()]).finally(() => setLoading(false))
  }, [productId])

  const checkGuestPurchase = async () => {
    if (!guestEmail) return
    setCheckingGuest(true)
    setGuestError('')
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, guest_email, payment_status, order_items(product_id)')
        .eq('guest_email', guestEmail)
        .eq('payment_status', 'paid')
      const hasPurchased = (orders ?? []).some((o: any) =>
        (o.order_items ?? []).some((it: any) => it.product_id === productId)
      )
      if (hasPurchased) {
        setGuestVerified(true)
        setShowForm(true)
      } else {
        setGuestError(locale === 'fr' ? "Aucun achat verifie trouve avec cet email pour ce produit." : 'No verified purchase found with this email for this product.')
      }
    } catch (e) {
      setGuestError(locale === 'fr' ? 'Erreur de verification.' : 'Verification error.')
    } finally {
      setCheckingGuest(false)
    }
  }

  const submitReview = async () => {
    if (!customer && !guestVerified) return
    setSubmitting(true)
    await supabase.from('product_reviews').insert({
      product_id:  productId,
      customer_id: customer?.id ?? null,
      guest_email: customer ? null : guestEmail,
      guest_name:  customer ? null : guestName,
      rating,
      title,
      body,
      is_verified: !!customer || guestVerified,
      is_approved: false, // Modération admin
    })
    setSubmitted(true)
    setSubmitting(false)
    setShowForm(false)
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const fmtDate = (d: string) => { const dt = new Date(d); return dt.getDate() + '/' + (dt.getMonth()+1) + '/' + dt.getFullYear() }

  const StarRow = ({ value, interactive = false }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button key={i}
          type="button"
          onClick={(e) => { e.preventDefault(); if (interactive) setRating(i) }}
          onMouseEnter={() => interactive && setHoverStar(i)}
          onMouseLeave={() => interactive && setHoverStar(0)}
          className={`text-base transition-colors ${interactive ? 'cursor-pointer bg-transparent border-none' : 'cursor-default bg-transparent border-none'} ${i <= (interactive ? hoverStar || rating : value) ? 'text-black' : 'text-[#ddd]'}`}
        >★</button>
      ))}
    </div>
  )

  return (
    <div className="mt-7 pt-7 border-t border-[#e8e8e8]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-1">
            {locale === 'fr' ? 'AVIS CLIENTS' : 'CUSTOMER REVIEWS'}
          </p>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRow value={Math.round(avgRating)} />
              <span className="font-sans text-[11px] text-[#888]">
                {avgRating.toFixed(1)} / 5 ({reviews.length} {locale === 'fr' ? 'avis' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {!submitted && (
          <button onClick={() => customer ? setShowForm(s => !s) : setShowGuestCheck(s => !s)}
            className="font-sans text-[10px] tracking-[0.15em] uppercase underline underline-offset-4 text-black bg-transparent border-none cursor-pointer">
            {locale === 'fr' ? 'Laisser un avis' : 'Write a review'}
          </button>
        )}
      </div>

      {/* Verification email invite */}
      {showGuestCheck && !customer && !guestVerified && (
        <div className="bg-[#f8f8f8] border border-[#e8e8e8] p-4 mb-5">
          <p className="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-black mb-3">
            {locale === 'fr' ? 'Vérifiez votre achat' : 'Verify your purchase'}
          </p>
          <p className="font-sans text-[11px] text-[#888] mb-3">
            {locale === 'fr' ? "Entrez l'email utilisé lors de votre commande." : 'Enter the email used for your order.'}
          </p>
          <input value={guestName} onChange={e => setGuestName(e.target.value)}
            placeholder={locale === 'fr' ? 'Votre prénom' : 'Your first name'}
            className="w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black mb-2" />
          <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} type="email"
            placeholder={locale === 'fr' ? 'Votre email' : 'Your email'}
            className="w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black mb-2" />
          {guestError && <p className="font-sans text-[11px] text-red-500 mb-2">{guestError}</p>}
          <button onClick={checkGuestPurchase} disabled={checkingGuest || !guestEmail || !guestName}
            className="bg-black text-white font-sans text-[10px] tracking-[0.2em] uppercase px-6 py-3 border-none cursor-pointer hover:opacity-85 disabled:opacity-40">
            {checkingGuest ? '...' : locale === 'fr' ? 'VÉRIFIER' : 'VERIFY'}
          </button>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (customer || guestVerified) && (
        <div className="bg-[#f8f8f8] border border-[#e8e8e8] p-4 mb-5">
          <p className="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-black mb-4">
            {locale === 'fr' ? 'Votre avis' : 'Your review'}
          </p>
          <div className="mb-3">
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1.5 block">
              {locale === 'fr' ? 'Note' : 'Rating'}
            </label>
            <StarRow value={rating} interactive />
          </div>
          <div className="mb-3">
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1.5 block">
              {locale === 'fr' ? 'Titre' : 'Title'}
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder={locale === 'fr' ? 'Résumez votre avis' : 'Summarize your review'}
              className="w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black" />
          </div>
          <div className="mb-4">
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1.5 block">
              {locale === 'fr' ? 'Commentaire' : 'Comment'}
            </label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={3}
              placeholder={locale === 'fr' ? 'Partagez votre expérience...' : 'Share your experience...'}
              className="w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black resize-none" />
          </div>
          <button onClick={submitReview} disabled={submitting || !body}
            className="bg-black text-white font-sans text-[10px] tracking-[0.2em] uppercase px-6 py-3 border-none cursor-pointer hover:opacity-85 disabled:opacity-40">
            {submitting ? '...' : locale === 'fr' ? 'ENVOYER' : 'SUBMIT'}
          </button>
          <p className="font-sans text-[10px] text-[#aaa] mt-2">
            {locale === 'fr' ? 'Votre avis sera publié après modération.' : 'Your review will be published after moderation.'}
          </p>
        </div>
      )}

      {submitted && (
        <div className="bg-green-50 border border-green-200 px-4 py-3 mb-5">
          <p className="font-sans text-[12px] text-green-700">
            {locale === 'fr' ? '✓ Merci ! Votre avis sera publié après vérification.' : '✓ Thank you! Your review will be published after verification.'}
          </p>
        </div>
      )}

      {/* Liste avis */}
      {loading ? (
        <p className="font-sans text-[12px] text-[#aaa]">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</p>
      ) : reviews.length === 0 ? (
        <p className="font-sans text-[12px] text-[#aaa]">
          {locale === 'fr' ? 'Aucun avis pour le moment. Soyez le premier !' : 'No reviews yet. Be the first!'}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-[#f0f0f0] pb-5 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <StarRow value={review.rating} />
                  {review.title && <p className="font-sans text-[12px] font-medium text-black mt-1">{review.title}</p>}
                </div>
                <span className="font-sans text-[10px] text-[#aaa]">{fmtDate(review.created_at)}</span>
              </div>
              {review.body && <p className="font-sans text-[12px] font-light text-[#555] leading-relaxed mb-2">{review.body}</p>}
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] font-medium text-black">
                  {review.customer?.first_name ?? review.guest_name ?? 'Client'} {review.customer?.last_name ? review.customer.last_name[0] + '.' : ''}
                </span>
                {review.is_verified && (
                  <span className="font-sans text-[9px] tracking-[0.1em] uppercase text-green-600 bg-green-50 px-1.5 py-0.5">
                    {locale === 'fr' ? '✓ Achat vérifié' : '✓ Verified purchase'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
