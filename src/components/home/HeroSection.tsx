'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface HeroSectionProps {
  locale: 'fr' | 'en'
  imageUrl?: string
  videoUrl?: string
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl?: string
}

export default function HeroSection({
  locale,
  imageUrl,
  videoUrl,
  title     = 'GET THE BEST',
  subtitle  = 'RAW HAIR',
  ctaLabel  = 'SHOP NOW',
  ctaUrl,
}: HeroSectionProps) {
  const [loaded, setLoaded] = useState(false)
  const href = ctaUrl ?? `/${locale}/collections`

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative w-full min-h-svh bg-[#1a1a1a] flex items-center justify-center overflow-hidden">

      {/* ── MEDIA : vidéo ou image ── */}
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-70"
        />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt="KB Hair Paris"
          fill
          priority
          className="object-cover grayscale opacity-70"
          sizes="100vw"
          onLoad={() => setLoaded(true)}
        />
      ) : (
        // Placeholder gradient NB quand pas d'image encore
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0d0d0d]" />
      )}

      {/* ── OVERLAY léger ── */}
      <div className="absolute inset-0 bg-black/20" />

      {/* ── BANNIÈRE paiement (comme BHP, sous le header) ── */}
      {/* Rendu dans layout mais parfois inline sur hero */}

      {/* ── CONTENU HERO ── */}
      <div
        className={`
          relative z-10 flex flex-col items-center text-center px-5
          transition-all duration-700
          ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Logo KB Hair sur la photo — comme BHP */}
        <div className="mb-10">
          <span className="block font-serif text-[20px] font-normal tracking-[0.25em] text-white">
            KB HAIR
          </span>
          <span className="block font-serif text-[9px] font-light tracking-[0.4em] text-white/50 mt-1">
            PARIS
          </span>
        </div>

        {/* Titre grand — GET THE BEST */}
        <h1 className="font-serif text-[clamp(52px,15vw,88px)] font-light tracking-[0.04em] text-white uppercase leading-none mb-4">
          {title}
        </h1>

        {/* Sous-titre — RAW HAIR */}
        <p className="font-sans text-[11px] font-light tracking-[0.35em] uppercase text-white/70 mb-9">
          {subtitle}
        </p>

        {/* CTA — SHOP NOW, bouton demi-transparent comme BHP */}
        <Link
          href={href}
          className="
            inline-block
            bg-white/15 border border-white/50
            text-white font-sans text-[11px] font-normal tracking-[0.25em] uppercase
            px-14 py-3.5
            backdrop-blur-sm
            hover:bg-white/25 transition-colors duration-300
            no-underline
          "
        >
          {ctaLabel}
        </Link>
      </div>

      {/* fleche scroll */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center" style={{transform:"translateY(50%)", zIndex:30}}>
        <button onClick={scrollDown} aria-label="Defiler" className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-none cursor-pointer hover:scale-105 transition-transform" style={{boxShadow:"0 0 0 3px rgba(255,255,255,0.4), 0 4px 15px rgba(0,0,0,0.3)"}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 6l5 5 5-5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

    </section>
  )
}
