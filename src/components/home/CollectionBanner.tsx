'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface CollectionBannerProps {
  locale: 'fr' | 'en'
  label?: string
  href?: string
  imageUrl?: string
}

export function CollectionBanner({ locale, label: defaultLabel, href: defaultHref, imageUrl: defaultImageUrl }: CollectionBannerProps) {
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    supabase.from('homepage_sections').select('content')
      .eq('type', 'banner').eq('is_active', true).single()
      .then(({ data }) => { if (data) setContent(data.content) })
  }, [])

  const label    = locale === 'fr' ? (content?.label_fr ?? defaultLabel ?? 'RAW HAIR ONLY') : (content?.label_en ?? defaultLabel ?? 'RAW HAIR ONLY')
  const subtitle = locale === 'fr' ? (content?.subtitle_fr ?? 'Qualité exceptionnelle, livraison Paris & International') : (content?.subtitle_en ?? 'Exceptional quality, Paris & International delivery')
  const href     = locale === 'fr' ? (content?.href_fr ?? defaultHref ?? '/fr/collections') : (content?.href_en ?? defaultHref ?? '/en/collections')
  const cta      = locale === 'fr' ? (content?.cta_fr ?? 'DÉCOUVRIR') : (content?.cta_en ?? 'DISCOVER')
  const imageUrl = content?.image_url || defaultImageUrl

  return (
    <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
      {imageUrl ? (
        <Image src={imageUrl} alt={label} fill className="object-cover" sizes="100vw" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#0d0d0d]" />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/60">
          KB HAIR PARIS
        </p>
        <h2 className="font-serif text-[32px] font-light tracking-[0.15em] uppercase text-white leading-tight">
          {label}
        </h2>
        <p className="font-sans text-[12px] font-light text-white/70 leading-relaxed max-w-[280px]">
          {subtitle}
        </p>
        <Link
          href={href}
          className="mt-2 inline-block border border-white text-white font-sans text-[10px] tracking-[0.25em] uppercase px-10 py-3 no-underline hover:bg-white hover:text-black transition-colors duration-300"
        >
          {cta}
        </Link>
      </div>
    </div>
  )
}
