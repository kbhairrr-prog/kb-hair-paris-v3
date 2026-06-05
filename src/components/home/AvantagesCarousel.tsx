'use client'

import { useRef, useState, useEffect } from 'react'

const AVANTAGES = {
  fr: [
    { icon: '✈️', title: 'FREE SHIPPING',   text: 'Livraison gratuite dès 230€ partout dans le monde 🌎' },
    { icon: '🚚', title: 'LIVRAISON',        text: 'Livraison via Mondial Relay pour France, Belgique, Pays-Bas, Italie et Allemagne.' },
    { icon: '💬', title: 'SERVICE CLIENT',   text: 'Un service client à votre écoute pour une expérience KB HAIR PARIS sur mesure.' },
    { icon: '🔒', title: 'SECURE PAYMENTS', text: "Paiement 100% sécurisé pour une expérience d'achat en toute confiance." },
  ],
  en: [
    { icon: '✈️', title: 'FREE SHIPPING',    text: 'Complimentary worldwide delivery on orders over €230 🌎' },
    { icon: '🚚', title: 'DELIVERY',         text: 'Delivered via Mondial Relay for France, Belgium, Netherlands, Italy and Germany.' },
    { icon: '💬', title: 'CUSTOMER SERVICE', text: 'A dedicated customer service for a tailored KB HAIR PARIS experience.' },
    { icon: '🔒', title: 'SECURE PAYMENTS',  text: '100% secure payment for a confident shopping experience.' },
  ],
}

export function AvantagesCarousel({ locale }: { locale: 'fr' | 'en' }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const items = AVANTAGES[locale]

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setCurrent(Math.min(idx, items.length - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [items.length])

  const goTo = (i: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
    setCurrent(i)
  }

  return (
    <section className="bg-[#f0f0f0] py-12">
      <div
        ref={trackRef}
        className="flex overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full flex flex-col items-center text-center px-10 min-h-[200px] justify-center"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-black mb-2.5">
              {item.title}
            </p>
            <p className="font-sans text-[13px] font-light text-[#555] leading-relaxed max-w-[280px]">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full border-none cursor-pointer transition-colors duration-200 ${i === current ? 'bg-black' : 'bg-[#ccc]'}`}
          />
        ))}
      </div>
    </section>
  )
}
