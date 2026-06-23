'use client'
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
    <section className="bg-black px-6 pt-14 pb-8 text-center">
      {imageUrl ? (
        <div className="w-full mb-8 mx-auto overflow-hidden" style={{ aspectRatio: '2/3', maxWidth: '480px' }}>
          <img src={imageUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ) : (
        <div className="w-full mb-8 mx-auto bg-[#1a1510]" style={{ aspectRatio: '2/3', maxWidth: '480px' }} />
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
