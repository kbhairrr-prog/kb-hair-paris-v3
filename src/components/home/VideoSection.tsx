'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function VideoSection({ locale }: { locale: 'fr' | 'en' }) {
  const [playing, setPlaying] = useState(false)
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    supabase.from('homepage_sections').select('content')
      .eq('type', 'video').eq('is_active', true).single()
      .then(({ data }) => { if (data) setContent(data.content) })
  }, [])

  const videoUrl = content?.video_url ?? ''
  const thumbnailUrl = content?.image_url ?? ''
  const clickText = locale === 'fr' ? 'CLIQUEZ POUR VOIR LA VIDÉO' : 'CLICK TO WATCH THE VIDEO'

  return (
    <section className='relative w-full bg-black overflow-hidden' style={{minHeight:'500px'}}>
      {thumbnailUrl ? (
        <Image src={thumbnailUrl} alt='video' fill className='object-cover opacity-70 grayscale' sizes='100vw' />
      ) : (
        <div className='absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]' />
      )}
      <div className='absolute inset-0 bg-black/40' />
      {videoUrl && playing ? (
        <video src={videoUrl} autoPlay controls className='absolute inset-0 w-full h-full object-cover' />
      ) : (
        <button onClick={() => videoUrl && setPlaying(true)} className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[60px] h-[60px] rounded-full bg-white/90 flex items-center justify-center border-none cursor-pointer' aria-label='Lire la vidéo'>
          <span style={{display:'block',width:0,height:0,borderTop:'10px solid transparent',borderBottom:'10px solid transparent',borderLeft:'18px solid #1a1a1a',marginLeft:'4px'}} />
        </button>
      )}
      <div className='absolute bottom-6 left-0 right-0 text-center z-10'>
        <p className='font-sans text-[10px] font-normal tracking-[0.35em] uppercase text-white/60'>{clickText}</p>
      </div>
    </section>
  )
}