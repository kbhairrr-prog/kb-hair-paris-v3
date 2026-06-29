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
    <section className="w-full" style={{backgroundColor: '#ebebeb', margin:0, padding:0}}>
      {/* Espace pour le bouton scroll */}
      <div style={{height: '28px'}} />

      {/* Photo pleine largeur avec petites marges comme Bright Hair */}
      {imageUrl && (
        <div className="relative mx-3 mb-0">
          <img
            src={imageUrl}
            alt="KB Hair"
            style={{
              width: '100%',
              height: '420px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              filter: 'grayscale(15%)',
            }}
          />
          {/* Logo superposé en bas de la photo comme Bright Hair */}
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-5"
            style={{background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)'}}
          >
            <span
              className="font-serif text-white tracking-[0.25em] uppercase"
              style={{fontSize: '22px', fontWeight: 300, letterSpacing: '0.3em'}}
            >
              KB HAIR
            </span>
            <span
              className="font-sans text-white tracking-[0.35em] uppercase"
              style={{fontSize: '9px', fontWeight: 300, opacity: 0.8}}
            >
              PARIS
            </span>
          </div>
        </div>
      )}

      {/* Texte sur fond gris clair */}
      <div className="text-center px-6 py-14">
        <h2
          className="font-serif text-[28px] font-light tracking-[0.2em] uppercase mb-4"
          style={{color: '#0A0A0A'}}
        >
          {title}
        </h2>
        <div className="w-10 h-px mx-auto mb-6" style={{backgroundColor: '#0A0A0A'}} />
        <p
          className="font-sans text-[13px] font-light leading-relaxed max-w-2xl mx-auto"
          style={{color: '#333333'}}
        >
          {text}
        </p>
      </div>
    </section>
  )
}
