'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface VideoSectionProps {
  locale: 'fr' | 'en'
}

export function VideoSection({ locale }: VideoSectionProps) {
  const [playing, setPlaying] = useState(false)
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    supabase.from('homepage_sections').select('content')
      .eq('type', 'video').eq('is_active', true).single()
      .then(({ data }) => { if (data) setContent(data.content) })
  }, [])

  const videoUrl    = content?.video_url ?? ''
  const thumbnailUrl = content?.image_url ?? ''
  const caption     = locale === 'fr' ? (content?.caption_fr ?? 'SOUTH OF ASIA RAW HAIR 🇰🇭') : (content?.caption_en ?? 'SOUTH OF ASIA RAW HAIR 🇰🇭')

  return (
    <section className="relative w-full bg-black overflow-hidden" style={{ aspectRatio: '9/14' }}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="video" className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#2a2020] to-[#0a0a0a]" />
      )}
      {videoUrl && playing ? (
        <video
          src={videoUrl}
          autoPlay
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <button
          onClick={() => videoUrl && setPlaying(true)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[60px] h-[60px] rounded-full bg-white/90 flex items-center justify-center border-none cursor-pointer"
          aria-label="Lire la vidéo"
        >
          <span style={{
            display: 'block',
            width: 0, height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderLeft: '18px solid #1a1a1a',
            marginLeft: '4px',
          }} />
        </button>
      )}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="font-sans text-[10px] font-normal tracking-[0.25em] uppercase text-white/70">
          {caption}
        </p>
      </div>
    </section>
  )
}
