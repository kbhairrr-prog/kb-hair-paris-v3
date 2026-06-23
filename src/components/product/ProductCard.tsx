'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
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
  const [added, setAdded] = useState(false)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const addItem = useCartStore(s => s.addItem)

  const name = locale === 'fr' ? product.name_fr : product.name_en
  const imgs = product.images ?? []
  const primaryImg = imgs.find(i => i.is_primary) ?? imgs[0]
  const secondaryImg = imgs[1]

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    // Si deja visible immediatement (au-dessus du fold), pas besoin d'observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdded(true)
    setTimeout(() => setAdded(false), 600)
    if (!product.variants?.length) {
      addItem(product)
      return
    }
    window.location.href = `/${locale}/produits/${product.slug}`
  }

  return (
    <Link
      ref={cardRef}
      href={`/${locale}/produits/${product.slug}`}
      data-card
      className="kb-card flex-shrink-0 w-[72vw] max-w-[320px] cursor-pointer transition-all duration-700 ease-out"
      style={{
        scrollSnapAlign: 'start',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
      }}
      onMouseEnter={() => { setHovered(true); setImgIdx(1) }}
      onMouseLeave={() => { setHovered(false); setImgIdx(0) }}
    >
      {/* Image wrapper */}
      <div className="relative w-full bg-[#f5f5f5] overflow-hidden mb-3"
           style={{ aspectRatio: '3/4' }}>

        {/* Image principale — leger zoom au hover */}
        {primaryImg ? (
          <Image
            src={primaryImg.url}
            alt={locale === 'fr' ? primaryImg.alt_fr ?? name : primaryImg.alt_en ?? name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              hovered && secondaryImg ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            priority={priority}
            sizes="(max-width: 768px) 72vw, 320px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#ccc] to-[#999]" />
        )}

        {/* Image secondaire (hover) — meme zoom */}
        {secondaryImg && (
          <Image
            src={secondaryImg.url}
            alt={locale === 'fr' ? secondaryImg.alt_fr ?? name : secondaryImg.alt_en ?? name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            sizes="(max-width: 768px) 72vw, 320px"
          />
        )}

        {/* Bouton + — feedback visuel au clic (pulse + check) */}
        <button
          onClick={handlePlus}
          className="kb-plus-btn absolute bottom-2.5 right-2.5 w-10 h-10 bg-white flex items-center justify-center text-2xl font-light text-black shadow-sm transition-all duration-300 z-10"
          style={{ transform: added ? 'scale(1.15)' : 'scale(1)' }}
          aria-label="Add to cart"
        >
          <span style={{ display: 'inline-block', transition: 'transform 300ms ease', transform: added ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            {added ? '✓' : '+'}
          </span>
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

      {/* Infos produit — nom avec soulignement anime au hover */}
      <div>
        <p className="kb-card-name text-[11.5px] font-normal tracking-[0.12em] uppercase text-black mb-1 leading-snug inline-block">
          {name}
        </p>
        <p className="text-[11px] font-light tracking-[0.08em] uppercase text-[#888]">
          {locale === 'fr' ? 'A PARTIR DE' : 'FROM'} €{(product.price ?? 0).toFixed(2).replace('.', ',')}
        </p>
        {product.rating_count > 0 && (
          <p className="text-[10px] text-[#888] mt-1">
            ({product.rating_avg.toFixed(1)})
          </p>
        )}
      </div>

      <style jsx>{`
        .kb-plus-btn:hover {
          background-color: #fafafa;
        }
        .kb-card-name {
          background-image: linear-gradient(to right, currentColor, currentColor);
          background-size: 0% 1px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          padding-bottom: 2px;
          transition: background-size 350ms ease;
        }
        .kb-card:hover .kb-card-name {
          background-size: 100% 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-card, .kb-card-name { transition: none !important; }
        }
      `}</style>
    </Link>
  )
}
