'use client'

import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'
import { useCarousel } from '@/hooks/useCarousel'
import type { Product } from '@/types'

interface HairProductsProps {
  products: Product[]
  locale: 'fr' | 'en'
}

export function HairProducts({ products, locale }: HairProductsProps) {
  const { trackRef, handlers } = useCarousel({ itemsCount: products.length })

  return (
    <section className="bg-[#f0f0f0] pt-12 pb-10">
      <p className="text-center font-sans text-[10px] font-medium tracking-[0.3em] uppercase text-[#888] mb-1.5">
        KB HAIR PARIS
      </p>
      <h2 className="text-center font-serif text-[30px] font-light tracking-[0.1em] uppercase text-black mb-7">
        HAIR PRODUCTS
      </h2>
      <div
        ref={trackRef}
        className="flex gap-3 px-5 overflow-x-auto cursor-grab select-none"
        style={{ scrollSnapType: 'x mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        {...handlers}
      >
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} locale={locale} priority={i === 0} />
        ))}
        <div className="flex-shrink-0 w-4" aria-hidden />
      </div>
      <div className="flex justify-center mt-7 px-5">
        <Link
          href={`/${locale}/collections/produits`}
          className="inline-block bg-black text-white font-sans text-[11px] font-normal tracking-[0.22em] uppercase px-12 py-4 no-underline hover:opacity-85 transition-opacity"
        >
          VIEW ALL
        </Link>
      </div>
    </section>
  )
}
