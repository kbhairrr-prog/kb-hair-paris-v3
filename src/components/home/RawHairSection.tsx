'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function RawHairSection({ locale }: { locale: 'fr' | 'en' }) {
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    supabase.from('homepage_sections').select('content')
      .eq('type', 'raw_hair').eq('is_active', true).single()
      .then(({ data }) => { if (data) setContent(data.content) })
  }, [])

  const label = content?.label ?? 'RAW HAIR'
  const text = locale === 'fr'
    ? content?.text_fr ?? ''
    : content?.text_en ?? ''
  const imageUrl = content?.image_url ?? ''

  return (
    <section className="bg-black px-6 py-14 text-center">
      {imageUrl ? (
        <div className="relative w-full mb-8" style={{ aspectRatio: '16/9' }}><Image src={imageUrl} alt={label} fill className="object-cover" sizes="100vw" /></div>
      ) : (
        <div className="w-full mb-8 bg-[#1a1510]" style={{ aspectRatio: '16/9' }} />
      )}
      <p className="font-sans text-[12px] font-normal tracking-[0.35em] uppercase text-white mb-3">
        {label}
      </p>
      <p className="font-sans text-[14px] font-light text-white/70 leading-relaxed">
        {text}
      </p>
    </section>
  )
}
