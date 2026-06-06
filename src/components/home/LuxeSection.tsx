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

  const title = content?.title ?? 'THE LUXE EXPERIENCE'
  const text = locale === 'fr'
    ? content?.text_fr ?? ''
    : content?.text_en ?? ''

  return (
    <section className="bg-[#f0f0f0] px-6 py-6 text-center">
      <h2 className="font-serif text-[20px] font-light tracking-[0.12em] uppercase text-black mb-3">
        {title}
      </h2>
      <p className="font-sans text-[12px] font-light leading-[1.6] text-[#444] max-w-[580px] mx-auto">
        {text}
      </p>
    </section>
  )
}
