'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function LuxeSection({ locale }: { locale: 'fr' | 'en' }) {
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    supabase.from('homepage_sections').select('content')
      .eq('type', 'luxe').eq('is_active', true).single()
      .then(({ data }) => { if (data) setContent(data.content) })
  }, [])

  const title = content?.title ?? 'THE KB EXPERIENCE'
  const text = locale === 'fr'
    ? content?.text_fr ?? 'Nos extensions de cheveux de luxe sont soigneusement sélectionnées auprès des plus prestigieux fournisseurs.'
    : content?.text_en ?? 'Our luxury hair extensions are carefully selected from the most prestigious suppliers.'
  const imageUrl = content?.image_url ?? ''

  return (
    <section className="bg-[#111111] py-0">
      {imageUrl && (
        <div className="flex justify-center bg-[#111111] py-10">
          <div className="w-full max-w-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="KB Hair"
              className="w-full object-cover"
              style={{ filter: 'grayscale(30%)', maxHeight: '400px', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
      <div className="text-center px-6 py-16">
        <h2 className="font-serif text-[28px] md:text-[36px] font-light tracking-[0.2em] uppercase mb-4"
          style={{ color: '#C9A84C' }}>
          {title}
        </h2>
        <div className="w-10 h-px mx-auto mb-6" style={{ backgroundColor: '#C9A84C' }} />
        <p className="font-sans text-[13px] font-light leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.7)' }}>
          {text}
        </p>
      </div>
    </section>
  )
}
