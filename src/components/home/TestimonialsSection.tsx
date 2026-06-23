'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCarousel } from '@/hooks/useCarousel'

interface Testimonial {
  id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
  customer_name: string
  product_name: string | null
}

export default function TestimonialsSection({ locale }: { locale: 'fr' | 'en' }) {
  const [reviews, setReviews] = useState<Testimonial[]>([])
  const [loaded, setLoaded] = useState(false)
  const [sectionActive, setSectionActive] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: section } = await supabase
        .from('homepage_sections')
        .select('is_active')
        .eq('type', 'testimonials')
        .eq('is_active', true)
        .maybeSingle()

      const isActive = !!section
      setSectionActive(isActive)

      if (!isActive) { setLoaded(true); return }

      const { data } = await supabase
        .from('product_reviews')
        .select(`
          id, rating, title, body, created_at, guest_name,
          customer:customers(first_name, last_name),
          product:products(name_fr, name_en)
        `)
        .eq('is_approved', true)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(12)

      const mapped: Testimonial[] = (data ?? []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        created_at: r.created_at,
        customer_name: r.customer?.first_name
          ? `${r.customer.first_name} ${r.customer.last_name ? r.customer.last_name[0] + '.' : ''}`
          : (r.guest_name ?? (locale === 'fr' ? 'Client' : 'Customer')),
        product_name: locale === 'fr' ? r.product?.name_fr : r.product?.name_en,
      }))

      setReviews(mapped)
      setLoaded(true)
    }
    load()
  }, [locale])

  const { trackRef, currentIndex, goTo, handlers } = useCarousel({ itemsCount: reviews.length })
  const goPrev = useCallback(() => goTo(Math.max(0, currentIndex - 1)), [currentIndex, goTo])
  const goNext = useCallback(() => goTo(Math.min(reviews.length - 1, currentIndex + 1)), [currentIndex, reviews.length, goTo])

  const fmtDate = (d: string) => {
    const dt = new Date(d)
    return dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear()
  }

  // Rien tant que chargement pas termine, pour eviter un flash de section vide
  if (!loaded) return null
  // Section masquee depuis l'admin, ou aucun avis valide pour le moment
  if (!sectionActive || reviews.length === 0) return null

  return (
    <section className="bg-white pt-12 pb-10">
      <p className="text-center font-sans text-[10px] font-medium tracking-[0.3em] uppercase text-[#888] mb-1.5">
        {locale === 'fr' ? 'ILS NOUS FONT CONFIANCE' : 'TRUSTED BY OUR CUSTOMERS'}
      </p>
      <h2 className="text-center font-serif text-[30px] font-light tracking-[0.1em] uppercase text-black mb-7">
        {locale === 'fr' ? 'AVIS CLIENTS' : 'CUSTOMER REVIEWS'}
      </h2>

      <div className="relative max-w-[1600px] mx-auto">
        {reviews.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label={locale === 'fr' ? 'Precedent' : 'Previous'}
              className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-[#e0e0e0] rounded-full cursor-pointer hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex >= reviews.length - 1}
              aria-label={locale === 'fr' ? 'Suivant' : 'Next'}
              className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-[#e0e0e0] rounded-full cursor-pointer hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <div
          ref={trackRef}
          className="flex gap-3 px-5 overflow-x-auto [scrollbar-hide::-webkit-scrollbar]:hidden cursor-grab select-none lg:justify-center"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          {...handlers}
        >
          {reviews.map(r => (
            <div
              key={r.id}
              data-card
              className="flex-shrink-0 w-[78vw] max-w-[340px] lg:w-[320px] bg-[#f8f8f8] border border-[#e8e8e8] p-5 flex flex-col"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < r.rating ? '#C9A84C' : 'none'}
                    stroke={i < r.rating ? '#C9A84C' : '#ccc'}
                  />
                ))}
              </div>
              {r.title && (
                <p className="font-sans text-[13px] font-medium text-black mb-2">{r.title}</p>
              )}
              {r.body && (
                <p className="font-sans text-[12px] font-light text-[#555] leading-relaxed mb-4 flex-1 line-clamp-5">
                  {r.body}
                </p>
              )}
              <div className="mt-auto pt-3 border-t border-[#e8e8e8]">
                <p className="font-sans text-[11px] font-medium text-black">{r.customer_name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  {r.product_name && (
                    <p className="font-sans text-[10px] text-[#999] truncate pr-2">{r.product_name}</p>
                  )}
                  <p className="font-sans text-[10px] text-[#999] flex-shrink-0">{fmtDate(r.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="flex-shrink-0 w-4" aria-hidden />
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="flex lg:hidden justify-center gap-2 mt-5 px-5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${locale === 'fr' ? 'Aller a' : 'Go to'} ${i + 1}`}
              className="border-none cursor-pointer p-0 transition-all duration-300"
              style={{
                height: '4px',
                width: i === currentIndex ? '32px' : '12px',
                borderRadius: '2px',
                backgroundColor: i === currentIndex ? '#C9A84C' : 'rgba(201,168,76,0.3)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
