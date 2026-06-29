'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

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
  const [scrollY, setScrollY] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const href = ctaUrl ?? `/${locale}/collections`

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const sec = sectionRef.current
      if (!sec) return
      const rect = sec.getBoundingClientRect()
      if (rect.bottom > 0) setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  const parallaxOffset = Math.min(scrollY * 0.3, 160)

  return (
    <section ref={sectionRef} className="relative w-full min-h-svh bg-[#1a1a1a] flex items-center justify-center overflow-hidden">

      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${parallaxOffset}px)`, top: '-5%', bottom: '-5%' }}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 kb-hero-kenburns"
          />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt="KB Hair Paris"
            fill
            priority
            className="object-cover grayscale opacity-70 kb-hero-kenburns"
            sizes="100vw"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0d0d0d]" />
        )}
      </div>

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col items-center text-center px-5">

        <div
          className="mb-10 transition-all ease-out"
          style={{
            transitionDuration: '700ms',
            transitionDelay: '0ms',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          <span className="block font-serif text-[20px] font-normal tracking-[0.25em] text-white">
            KB HAIR
          </span>
          <span className="block font-serif text-[9px] font-light tracking-[0.4em] text-white/50 mt-1">
            PARIS
          </span>
        </div>

        <h1
          className="font-serif text-[clamp(52px,15vw,88px)] font-light tracking-[0.04em] text-white uppercase leading-none mb-4 transition-all ease-out"
          style={{
            transitionDuration: '700ms',
            transitionDelay: '150ms',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {title}
        </h1>

        <p
          className="font-sans text-[11px] font-light tracking-[0.35em] uppercase text-white/70 mb-9 transition-all ease-out"
          style={{
            transitionDuration: '700ms',
            transitionDelay: '300ms',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {subtitle}
        </p>

        <Link
          href={href}
          className="
            kb-hero-cta
            inline-block
            bg-white/15 border border-white/50
            text-white font-sans text-[11px] font-normal uppercase
            px-14 py-3.5
            backdrop-blur-sm
            transition-all ease-out
            no-underline
          "
          style={{
            transitionDuration: '700ms, 300ms, 300ms',
            transitionDelay: '450ms, 0ms, 0ms',
            transitionProperty: 'opacity, transform, background-color, letter-spacing',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0) scale(1)' : 'translateY(16px) scale(1)',
            letterSpacing: '0.25em',
          }}
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center" style={{transform:"translateY(50%)", zIndex:30}}>
        <button
          onClick={scrollDown}
          aria-label="Defiler"
          className="kb-hero-scroll-btn w-12 h-12 rounded-full bg-white flex items-center justify-center border-none cursor-pointer hover:scale-110 transition-transform"
          style={{boxShadow:"0 0 0 3px rgba(255,255,255,0.9), 0 6px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)"}}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 6l5 5 5-5" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes kb-kenburns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
        .kb-hero-kenburns {
          animation: kb-kenburns 22s ease-in-out infinite alternate;
        }
        @keyframes kb-scroll-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .kb-hero-scroll-btn {
          animation: kb-scroll-breathe 2.4s ease-in-out infinite;
        }
        .kb-hero-cta:hover {
          background-color: rgba(255,255,255,0.25);
          letter-spacing: 0.32em;
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-hero-kenburns, .kb-hero-scroll-btn { animation: none; }
        }
      `}</style>
    </section>
  )
}
