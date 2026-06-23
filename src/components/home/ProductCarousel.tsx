'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { useCarousel } from '@/hooks/useCarousel'
import type { Product } from '@/types'

interface CarouselTab {
  key: string
  label: string
  products: Product[]
  href: string
}

interface ProductCarouselProps {
  products?: Product[]
  viewAllHref?: string
  tabs?: CarouselTab[]
  defaultTabKey?: string
  locale: 'fr' | 'en'
  title?: string
  eyebrow?: string
  viewAllLabel?: string
  bgClassName?: string
}

export default function ProductCarousel({
  products: simpleProducts,
  viewAllHref: simpleViewAllHref,
  tabs,
  defaultTabKey,
  locale,
  title,
  eyebrow,
  viewAllLabel,
  bgClassName = 'bg-[#f0f0f0]',
}: ProductCarouselProps) {
  const isTabMode = !!tabs && tabs.length > 0
  const [activeTabKey, setActiveTabKey] = useState(defaultTabKey ?? tabs?.[0]?.key ?? '')
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const activeTab = isTabMode ? tabs!.find(t => t.key === activeTabKey) ?? tabs![0] : undefined
  const products = isTabMode ? (activeTab?.products ?? []) : (simpleProducts ?? [])
  const viewAllHref = isTabMode ? activeTab?.href : simpleViewAllHref

  const { trackRef, currentIndex, goTo, handlers } = useCarousel({ itemsCount: products.length })

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleTabSwitch = useCallback((key: string) => {
    setActiveTabKey(key)
    if (trackRef.current) trackRef.current.scrollLeft = 0
  }, [trackRef])

  const goPrev = () => goTo(Math.max(0, currentIndex - 1))
  const goNext = () => goTo(Math.min(products.length - 1, currentIndex + 1))

  if (!isTabMode && (!simpleProducts || simpleProducts.length === 0)) return null

  return (
    <section className={`${bgClassName} pt-12 pb-10 relative`}>
      <div
        ref={headerRef}
        className="transition-all duration-700 ease-out"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        {!isTabMode && eyebrow && (
          <p className="text-center font-sans text-[10px] font-medium tracking-[0.3em] uppercase text-[#888] mb-1.5">
            {eyebrow}
          </p>
        )}
        {!isTabMode && title && (
          <h2 className="text-center font-serif text-[30px] font-light tracking-[0.1em] uppercase text-black mb-7">
            {title}
          </h2>
        )}

        {isTabMode && (
          <>
            <p className="text-center text-[11px] font-normal tracking-[0.25em] uppercase text-[#888] mb-3">
              {locale === 'fr' ? 'DÉCOUVREZ' : 'DISCOVER'}
            </p>
            <div className="flex gap-7 px-5 mb-7 overflow-x-auto [scrollbar-hide::-webkit-scrollbar]:hidden justify-center">
              {tabs!.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabSwitch(tab.key)}
                  className={`
                    kb-carousel-tab font-serif text-[clamp(28px,8vw,38px)] font-light tracking-[0.06em] uppercase
                    whitespace-nowrap pb-1 border-b-2 transition-all duration-300 flex-shrink-0 bg-transparent border-0 cursor-pointer
                    ${activeTabKey === tab.key
                      ? 'text-black border-b-black opacity-100'
                      : 'text-black border-b-transparent opacity-40'
                    }
                  `}
                  style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative max-w-[1600px] mx-auto">
        {products.length > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label={locale === 'fr' ? 'Precedent' : 'Previous'}
              className="kb-carousel-arrow hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-[#e0e0e0] rounded-full cursor-pointer transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex >= products.length - 1}
              aria-label={locale === 'fr' ? 'Suivant' : 'Next'}
              className="kb-carousel-arrow hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-[#e0e0e0] rounded-full cursor-pointer transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
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
            className="kb-viewall-btn inline-block bg-black text-white font-sans text-[11px] font-normal uppercase px-12 py-4 no-underline transition-all duration-300"
            style={{ letterSpacing: '0.22em' }}
          >
            {viewAllLabel ?? 'VIEW ALL'}
          </Link>
        </div>
      )}

      <style jsx>{`
        .kb-carousel-arrow:hover:not(:disabled) {
          background-color: #000;
          color: #fff;
          border-color: #000;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
          transform: translateY(-50%) scale(1.06);
        }
        .kb-carousel-tab:hover {
          opacity: 0.7;
        }
        .kb-viewall-btn:hover {
          opacity: 0.85;
          letter-spacing: 0.28em;
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-carousel-arrow, .kb-viewall-btn { transition: none !important; }
        }
      `}</style>
    </section>
  )
}
