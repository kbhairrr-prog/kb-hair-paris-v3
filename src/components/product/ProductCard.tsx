'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/types'
import { useCartStore } from '@/store/cart'

interface ProductCardProps {
  product: Product
  locale: 'fr' | 'en'
  priority?: boolean
}

export default function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const addItem = useCartStore(s => s.addItem)

  const name = locale === 'fr' ? product.name_fr : product.name_en
  const primaryImg = product.images?.find(i => i.is_primary) ?? product.images?.[0]
  const secondaryImg = product.images?.[1]

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Si pas de variantes → ajoute directement
    if (!product.variants?.length) {
      addItem(product)
      return
    }
    // Sinon → ouvre la fiche produit (redirect)
    window.location.href = `/${locale}/produits/${product.slug}`
  }

  return (
    <Link
      href={`/${locale}/produits/${product.slug}`}
      data-card
      className="flex-shrink-0 w-[72vw] max-w-[320px] cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
      onMouseEnter={() => { setHovered(true); setImgIdx(1) }}
      onMouseLeave={() => { setHovered(false); setImgIdx(0) }}
    >
      {/* Image wrapper */}
      <div className="relative w-full bg-[#f5f5f5] overflow-hidden mb-3"
           style={{ aspectRatio: '3/4' }}>

        {/* Image principale */}
        {primaryImg ? (
          <Image
            src={primaryImg.url}
            alt={locale === 'fr' ? primaryImg.alt_fr ?? name : primaryImg.alt_en ?? name}
            fill
            className={`object-cover transition-opacity duration-500 ${
              hovered && secondaryImg ? 'opacity-0' : 'opacity-100'
            }`}
            priority={priority}
            sizes="(max-width: 768px) 72vw, 320px"
          />
        ) : (
          // Placeholder si pas d'image
          <div className="absolute inset-0 bg-gradient-to-b from-[#ccc] to-[#999]" />
        )}

        {/* Image secondaire (hover) */}
        {secondaryImg && (
          <Image
            src={secondaryImg.url}
            alt={locale === 'fr' ? secondaryImg.alt_fr ?? name : secondaryImg.alt_en ?? name}
            fill
            className={`object-cover transition-opacity duration-500 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 72vw, 320px"
          />
        )}

        {/* Bouton + blanc — bas droite, exactement comme BHP */}
        <button
          onClick={handlePlus}
          className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-white flex items-center justify-center text-2xl font-light text-black shadow-sm hover:bg-gray-50 transition-colors z-10"
          aria-label="Ajouter au panier"
        >
          +
        </button>

        {/* Badge nouveau / bestseller */}
        {product.is_new && (
          <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-medium tracking-widest uppercase px-2 py-1">
            NEW
          </span>
        )}
        {product.is_bestseller && !product.is_new && (
          <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-medium tracking-widest uppercase px-2 py-1">
            BEST
          </span>
        )}
      </div>

      {/* Infos produit — style BHP exact */}
      <div>
        <p className="text-[11.5px] font-normal tracking-[0.12em] uppercase text-black mb-1 leading-snug">
          {name}
        </p>
        <p className="text-[11px] font-light tracking-[0.08em] uppercase text-[#888]">
          {locale === 'fr' ? 'A PARTIR DE' : 'FROM'} €{product.price.toFixed(2).replace('.', ',')}
        </p>
        {/* Rating si dispo */}
        {product.rating_count > 0 && (
          <p className="text-[10px] text-[#888] mt-1">
            ({product.rating_avg.toFixed(1)})
          </p>
        )}
      </div>
    </Link>
  )
}
