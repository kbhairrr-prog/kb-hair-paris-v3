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
    ? content?.text_fr ?? 'Nos extensions de cheveux de luxe sont soigneusement selectionnees.'
    : content?.text_en ?? 'Our luxury hair extensions are carefully selected.'
  const imageUrl = content?.image_url ?? ''
  return (
    <section className="relative w-full" style={{backgroundColor:'#111111', minHeight:'70vh'}}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="KB Hair"
          className="w-full block"
          style={{
            filter: 'grayscale(40%)',
            width: '100%',
            height: '70vh',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-6 text-center">
        <h2 className="font-serif text-[28px] font-light tracking-[0.2em] uppercase mb-4"
          style={{color:'#C9A84C'}}>
          {title}
        </h2>
        <div className="w-10 h-px mx-auto mb-6" style={{backgroundColor:'#C9A84C'}} />
        <p className="font-sans text-[13px] font-light leading-relaxed max-w-2xl mx-auto"
          style={{color:'rgba(255,255,255,0.85)'}}>
          {text}
        </p>
      </div>
    </section>
  )
}
