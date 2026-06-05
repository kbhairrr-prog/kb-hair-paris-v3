'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'

interface OurWigsProps {
  wigs: Product[]
  locale: 'fr' | 'en'
}

export function OurWigs({ wigs, locale }: OurWigsProps) {
  const [current, setCurrent] = useState(0)
  const wig = wigs[current]

  return (
    <section className="bg-[#f0f0f0] pt-12">
      <p className="text-center font-sans text-[10px] tracking-[0.3em] uppercase text-[#888] mb-1.5">
        SHOP
      </p>
      <h2 className="text-center font-serif text-[30px] font-light tracking-[0.1em] uppercase text-black mb-6">
        {locale === 'fr' ? 'NOS WIGS' : 'OUR WIGS'}
      </h2>

      <div className="relative w-full bg-[#1a1a1a]" style={{ aspectRatio: '3/4' }}>
        {wig?.images?.[0] ? (
          <Image
            src={wig.images[0].url}
            alt={locale === 'fr' ? wig.name_fr : wig.name_en}
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#0d0d0d]" />
        )}
      </div>

      <div className="flex justify-center gap-2 py-4">
        {wigs.slice(0, 4).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full border-none transition-colors duration-200 cursor-pointer ${i === current ? 'bg-black' : 'bg-[#d0d0d0]'}`}
          />
        ))}
      </div>

      <Link
        href={`/${locale}/collections/wigs`}
        className="block w-full bg-black text-white text-center font-sans text-[11px] font-normal tracking-[0.22em] uppercase py-[18px] no-underline hover:opacity-85 transition-opacity"
      >
        {locale === 'fr' ? 'VOIR LES PRODUITS' : 'SHOP THE WIGS'}
      </Link>
    </section>
  )
}
