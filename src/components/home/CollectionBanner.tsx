'use client'
import { useState, useEffect } from 'react'
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
  const label = locale === 'fr' ? (content?.label_fr ?? defaultLabel ?? 'NOS WIGS') : (content?.label_en ?? defaultLabel ?? 'OUR WIGS')
  const href = locale === 'fr' ? (content?.href_fr ?? defaultHref ?? '/fr/collections/wigs') : (content?.href_en ?? defaultHref ?? '/en/collections/wigs')
  const discover = locale === 'fr' ? 'DECOUVREZ' : 'DISCOVER'
  const imageUrl = content?.image_url || defaultImageUrl
  return (
    <section className='bg-[#F5F5F5] py-16'>
      <div className='max-w-screen-xl mx-auto px-4'>
        <div className='text-center mb-8'>
          <p className='font-sans text-[10px] tracking-[0.4em] uppercase text-[#888] mb-3'>{discover}</p>
          <h2 className='font-serif text-[32px] font-light tracking-[0.15em] uppercase text-black'>{label}</h2>
        </div>
        <div className='relative overflow-hidden cursor-pointer' onClick={() => window.location.href = href} style={{aspectRatio:'16/9',maxHeight:'500px'}}>
          {imageUrl ? (<img src={imageUrl} alt={label} className='w-full h-full object-cover' style={{objectPosition:'center top'}} />) : (<div className='w-full h-full bg-[#222]' />)}
          <div className='absolute inset-0 bg-black/30 flex items-end p-8'>
            <p className='font-serif text-[32px] md:text-[48px] text-white font-light tracking-[0.12em] uppercase'>{label}</p>
          </div>
        </div>
        <div className='text-center mt-8'>
          <Link href={href} className='inline-block bg-black text-white font-sans text-[11px] tracking-[0.22em] uppercase px-12 py-4 hover:opacity-85 transition-opacity no-underline'>VIEW ALL</Link>
        </div>
      </div>
    </section>
  )
}