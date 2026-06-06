'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product, Category } from '@/types'

interface CollectionPageClientProps {
  products: Product[]
  category: Category
  locale: 'fr' | 'en'
}

const SORT_OPTIONS = {
  fr: [
    { value: 'newest',    label: 'Les plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc',label: 'Prix décroissant' },
    { value: 'popular',   label: 'Populaires' },
  ],
  en: [
    { value: 'newest',    label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc',label: 'Price: High to Low' },
    { value: 'popular',   label: 'Most Popular' },
  ],
}

export default function CollectionPageClient({
  products, category, locale,
}: CollectionPageClientProps) {
  const [sorted, setSorted]       = useState(products)
  const [sortBy, setSortBy]       = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const addItem = useCartStore(s => s.addItem)

  const name = locale === 'fr' ? category.name_fr : category.name_en

  useEffect(() => {
    const copy = [...products]
    if (sortBy === 'price_asc')  copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sortBy === 'price_desc') copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    if (sortBy === 'popular')    copy.sort((a, b) => (b.total_sold ?? 0) - (a.total_sold ?? 0))
    setSorted(copy)
  }, [sortBy, products])

  const sortOpts = SORT_OPTIONS[locale] ?? SORT_OPTIONS['fr']

  return (
    <div className="min-h-screen bg-white pt-[68px]">

      {/* Banner catégorie */}
      {category.banner_url ? (
        <div className="relative w-full h-[220px] bg-[#1a1a1a]">
          <Image src={category.banner_url} alt={name} fill className="object-cover opacity-70 grayscale" />
          <div className="absolute inset-0 flex items-end justify-center pb-8">
            <h1 className="font-serif text-[32px] font-light tracking-[0.15em] uppercase text-white">
              {name}
            </h1>
          </div>
        </div>
      ) : (
        <div className="bg-[#f0f0f0] px-5 py-10 text-center border-b border-[#e0e0e0]">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#888] mb-2">
            {locale === 'fr' ? 'COLLECTION' : 'COLLECTION'}
          </p>
          <h1 className="font-serif text-[32px] font-light tracking-[0.12em] uppercase text-black">
            {name}
          </h1>
          {(category.description_fr || category.description_en) && (
            <p className="font-sans text-[12px] font-light text-[#666] mt-3 max-w-md mx-auto leading-relaxed">
              {locale === 'fr' ? category.description_fr : category.description_en}
            </p>
          )}
        </div>
      )}

      {/* Barre tri + filtre */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
        <p className="font-sans text-[11px] font-light tracking-[0.08em] text-[#888]">
          {sorted.length} {locale === 'fr' ? 'produits' : 'products'}
        </p>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none font-sans text-[11px] tracking-[0.1em] uppercase text-black bg-transparent border-none outline-none pr-5 cursor-pointer"
            >
              {sortOpts.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grille produits — 2 colonnes mobile comme BHP */}
      <div className="grid grid-cols-2 gap-[1px] bg-[#e8e8e8] border border-[#e8e8e8]">
        {sorted.map((product, i) => {
          const pname   = locale === 'fr' ? product.name_fr : product.name_en
          const primary = product.images?.find(img => img.is_primary) ?? product.images?.[0]
          const second  = product.images?.[1]
          const isHov   = hoveredId === product.id

          return (
            <div
              key={product.id}
              className="relative bg-white"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link href={`/${locale}/produits/${product.slug}`} className="block no-underline">

                {/* Image */}
                <div className="relative w-full bg-[#f5f5f5] overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {primary ? (
                    <>
                      <Image
                        src={primary.url}
                        alt={pname}
                        fill priority={i < 4}
                        className={`object-cover transition-opacity duration-500 ${isHov && second ? 'opacity-0' : 'opacity-100'}`}
                        sizes="50vw"
                      />
                      {second && (
                        <Image
                          src={second.url}
                          alt={pname}
                          fill
                          className={`object-cover transition-opacity duration-500 ${isHov ? 'opacity-100' : 'opacity-0'}`}
                          sizes="50vw"
                        />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ccc] to-[#999]" />
                  )}

                  {/* Bouton + */}
                  <button
                    onClick={e => {
                      e.preventDefault()
                      if (!product.variants?.length) addItem(product)
                      else window.location.href = `/${locale}/produits/${product.slug}`
                    }}
                    className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-white flex items-center justify-center text-xl font-light text-black shadow-sm z-10"
                  >
                    +
                  </button>

                  {/* Badges */}
                  {product.is_new && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[8px] tracking-widest uppercase px-1.5 py-0.5">
                      NEW
                    </span>
                  )}
                  {product.compare_price && (product.compare_price ?? 0) > (product.price ?? 0) && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[8px] tracking-widest uppercase px-1.5 py-0.5">
                      SALE
                    </span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-3 pb-4">
                  <p className="font-sans text-[11px] font-normal tracking-[0.1em] uppercase text-black mb-1 leading-snug">
                    {pname}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-[11px] font-light tracking-[0.06em] uppercase text-[#888]">
                      {locale === 'fr' ? 'A PARTIR DE' : 'FROM'} €{(product.price ?? 0).toFixed(2).replace('.', ',')}
                    </p>
                    {product.compare_price && (product.compare_price ?? 0) > (product.price ?? 0) && (
                      <p className="font-sans text-[10px] line-through text-[#bbb]">
                        €{product.compare_price.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                  {product.rating_count > 0 && (
                    <p className="font-sans text-[10px] text-[#888] mt-1">
                      ({product.rating_avg.toFixed(1)})
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* État vide */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="font-sans text-[12px] tracking-[0.15em] uppercase text-[#aaa]">
            {locale === 'fr' ? 'Aucun produit disponible' : 'No products available'}
          </p>
        </div>
      )}
    </div>
  )
}
