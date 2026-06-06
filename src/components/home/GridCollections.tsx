'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface GridCollectionsProps {
  locale: 'fr' | 'en'
}

export function GridCollections({ locale }: GridCollectionsProps) {
  const [cats, setCats] = useState<any[]>([])

  useEffect(() => {
    supabase.from('categories')
      .select('id, slug, name_fr, name_en, image_url')
      .eq('is_active', true)
      .in('slug', ['wigs', 'bundles', 'frontales', 'closures'])
      .order('position')
      .then(({ data }) => { if (data) setCats(data) })
  }, [])

  if (!cats.length) return null

  return (
    <section className="bg-[#f0f0f0] px-4 py-8">
      <p className="text-center font-sans text-[10px] tracking-[0.3em] uppercase text-[#888] mb-2">
        {locale === 'fr' ? 'NOS COLLECTIONS' : 'OUR COLLECTIONS'}
      </p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {cats.map(cat => (
          <Link
            key={cat.id}
            href={`/${locale}/collections/${cat.slug}`}
            className="relative block no-underline overflow-hidden"
            style={{ aspectRatio: '3/4' }}
          >
            {cat.image_url ? (
              <Image src={cat.image_url} alt={locale === 'fr' ? cat.name_fr : cat.name_en} fill className="object-cover" sizes="50vw" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#0d0d0d]" />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="font-serif text-[14px] font-light tracking-[0.15em] uppercase text-white">
                {locale === 'fr' ? cat.name_fr : cat.name_en}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
