'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { useCarousel } from '@/hooks/useCarousel'
import type { Product } from '@/types'

interface DecouvrezSectionProps {
  bundles: Product[]
  wigs: Product[]
  locale: 'fr' | 'en'
}

const TABS = {
  fr: [
    { key: 'bundles', label: 'NOS BUNDLES', href: '/fr/collections/bundles' },
    { key: 'wigs',    label: 'NOS WIGS',    href: '/fr/collections/wigs'    },
  ],
  en: [
    { key: 'bundles', label: 'OUR BUNDLES', href: '/en/collections/bundles' },
    { key: 'wigs',    label: 'OUR WIGS',    href: '/en/collections/wigs'    },
  ],
}

export default function DecouvrezSection({ bundles, wigs, locale }: DecouvrezSectionProps) {
  const [activeTab, setActiveTab] = useState<'bundles' | 'wigs'>('bundles')

  const products = activeTab === 'bundles' ? bundles : wigs
  const tabs = TABS[locale]

  const { trackRef, currentIndex, goTo, handlers } = useCarousel({
    itemsCount: products.length,
  })

  const handleTabSwitch = useCallback((key: 'bundles' | 'wigs') => {
    setActiveTab(key)
    // Reset carousel position
    if (trackRef.current) {
      trackRef.current.scrollLeft = 0
    }
  }, [trackRef])

  const viewAllHref = activeTab === 'bundles'
    ? (locale === 'fr' ? '/fr/collections/bundles' : '/en/collections/bundles')
    : (locale === 'fr' ? '/fr/collections/wigs'    : '/en/collections/wigs')

  const viewAllLabel = locale === 'fr' ? 'VIEW ALL' : 'VIEW ALL'

  return (
    <section className="bg-[#f0f0f0] pt-12 pb-10">

      {/* Label DÉCOUVREZ */}
      <p className="text-center text-[11px] font-normal tracking-[0.25em] uppercase text-[#888] mb-3">
        {locale === 'fr' ? 'DÉCOUVREZ' : 'DISCOVER'}
      </p>

      {/* Tabs — grands titres serif, tab actif souligné */}
      <div className="flex gap-7 px-5 mb-7 overflow-x-auto [scrollbar-hide::-webkit-scrollbar]:hidden">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabSwitch(tab.key as 'bundles' | 'wigs')}
            className={`
              font-serif text-[clamp(28px,8vw,38px)] font-light tracking-[0.06em] uppercase
              whitespace-nowrap pb-1 border-b-2 transition-all duration-200 flex-shrink-0 bg-transparent border-0 cursor-pointer
              ${activeTab === tab.key
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

      {/* Carousel — swipeable, 1.5 produit visible */}
      <div
        ref={trackRef}
        className="flex gap-3 px-5 overflow-x-auto [scrollbar-hide::-webkit-scrollbar]:hidden cursor-grab select-none"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        {...handlers}
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            priority={i === 0}
          />
        ))}

        {/* Carte vide fantôme pour effet peek du dernier élément */}
        <div className="flex-shrink-0 w-4" aria-hidden />
      </div>

      {/* Indicateurs carousel */}
      <div className="flex justify-center gap-2 mt-5 px-5">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
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

      {/* Bouton VIEW ALL — noir centré */}
      <div className="flex justify-center mt-5 px-5">
        <Link
          href={viewAllHref}
          className="inline-block bg-black text-white text-[11px] font-normal tracking-[0.22em] uppercase px-12 py-4 hover:opacity-85 transition-opacity"
        >
          {viewAllLabel}
        </Link>
      </div>
    </section>
  )
}
