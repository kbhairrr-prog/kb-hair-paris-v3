'use client'

import { useState } from 'react'

export function NewsletterDark({ locale }: { locale: 'fr' | 'en' }) {
  const [email, setEmail] = useState('')
  const [sent,  setSent]  = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || loading) return
    setLoading(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-black px-6 pt-8 pb-16 text-center">
      <p className="font-sans text-[10px] font-normal tracking-[0.3em] uppercase text-white/40 mb-4">
        KEEP ME UPDATED
      </p>
      <h2 className="font-serif text-[34px] font-light tracking-[0.08em] uppercase text-white mb-3">
        NEWSLETTER
      </h2>
      <p className="font-sans text-[13px] font-light text-white/55 leading-relaxed mb-9">
        {locale === 'fr'
          ? 'Subscribe to get notified about restock,\nnew products and specials offers'
          : 'Subscribe to get notified about restock,\nnew products and specials offers'}
      </p>

      {sent ? (
        <p className="font-sans text-[12px] tracking-[0.1em] uppercase text-white/60">
          {locale === 'fr' ? 'Merci ! ✓' : 'Thank you! ✓'}
        </p>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="E-mail"
            className="block w-full max-w-[420px] mx-auto px-4 py-4 bg-transparent border border-white/25 text-white font-sans text-[13px] font-light tracking-wide placeholder:text-white/30 outline-none mb-3"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !email}
            className="block w-full max-w-[420px] mx-auto bg-white text-black font-sans text-[11px] font-medium tracking-[0.25em] uppercase py-4 border-none cursor-pointer hover:opacity-88 transition-opacity disabled:opacity-40"
          >
            {loading ? '...' : 'SUBSCRIBE'}
          </button>
        </>
      )}
    </section>
  )
}
