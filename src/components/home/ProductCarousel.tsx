'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { useCarousel } from '@/hooks/useCarousel'
import type { Product } from '@/types'

interface ProductCarouselProps {
  products: Product[]
  locale: 'fr' | 'en'
  title?: string
  eyebrow?: string
  viewAllHref?: string
  viewAllLabel?: string
  bgClassName?: string
}

export default function ProductCarousel({
  products,
  locale,
  title,
  eyebrow,
  viewAllHref,
  viewAllLabel,
  bgClassName = 'bg-[#f0f0f0]',
}: ProductCarouselProps) {
  const { trackRef, currentIndex, goTo, handlers } = useCarousel({ itemsCount: products.length })

  const goPrev = () => goTo(Math.max(0, currentIndex - 1))
  const goNext = () => goTo(Math.min(products.length - 1, currentIndex + 1))

  if (!products || products.length === 0) return null

  return (
    <section className={`${bgClassName} pt-12 pb-10 relative`}>
      {eyebrow && (
        <p className="text-center font-sans text-[10px] font-medium tracking-[0.3em] uppercase text-[#888] mb-1.5">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="text-center font-serif text-[30px] font-light tracking-[0.1em] uppercase text-black mb-7">
          {title}
        </h2>
      )}

      <div className="relative max-w-[1600px] mx-auto">
        {/* Fleches desktop uniquement */}
        {products.length > 1 && (
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
              disabled={currentIndex >= products.length - 1}
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
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} locale={locale} priority={i === 0} />
          ))}
          <div className="flex-shrink-0 w-4" aria-hidden />
        </div>
      </div>

      {/* Indicateurs - mobile uniquement, desktop a deja les fleches */}
      {products.length > 1 && (
        <div className="flex lg:hidden justify-center gap-2 mt-5 px-5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${locale === 'fr' ? 'Aller a image' : 'Go to slide'} ${i + 1}`}
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

      {viewAllHref && (
        <div className="flex justify-center mt-5 px-5">
          <Link
            href={viewAllHref}
            className="inline-block bg-black text-white font-sans text-[11px] font-normal tracking-[0.22em] uppercase px-12 py-4 no-underline hover:opacity-85 transition-opacity"
          >
            {viewAllLabel ?? 'VIEW ALL'}
          </Link>
        </div>
      )}
    </section>
  )
}
