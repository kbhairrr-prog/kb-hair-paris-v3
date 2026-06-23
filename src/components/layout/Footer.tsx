'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Footer({ locale }: { locale: 'fr' | 'en' }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [visible, setVisible] = useState(false)
  const footerRef = useRef<HTMLElement>(null)

  const handleNewsletter = async () => {
    if (!email) return
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) })
    setSent(true)
  }

  const [cats, setCats] = useState<any[]>([])
  useEffect(() => {
    supabase.from('categories').select('slug, name_fr, name_en').eq('is_active', true).order('position')
      .then(({data}) => setCats(data ?? []))
  }, [])
  const collections = cats.map(c => ({
    label: locale === 'fr' ? c.name_fr.toUpperCase() : c.name_en.toUpperCase(),
    href: `/${locale}/collections/${c.slug}`
  }))

  const [pages, setPages] = useState<any[]>([])
  useEffect(() => {
    supabase.from('pages').select('slug, title_fr, title_en').eq('is_active', true).order('slug')
      .then(({data}) => setPages(data ?? []))
  }, [])
  const info = pages.map(p => ({
    label: locale === 'fr' ? p.title_fr.toUpperCase() : p.title_en.toUpperCase(),
    href: `/${locale}/pages/${p.slug}`
  }))

  const [contactEmail, setContactEmail] = useState('')
  const [contactWhatsapp, setContactWhatsapp] = useState('')
  useEffect(() => {
    supabase.from('site_settings').select('key, value').in('key', ['brand', 'social'])
      .then(({ data }) => {
        const brand  = data?.find(d => d.key === 'brand')?.value ?? {}
        const social = data?.find(d => d.key === 'social')?.value ?? {}
        setContactEmail(brand.email || social.email || '')
        setContactWhatsapp(social.whatsapp || brand.whatsapp || '')
      })
  }, [])

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const whatsappLink = contactWhatsapp ? `https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}` : ''

  return (
    <footer
      ref={footerRef}
      style={{backgroundColor:'#0A0A0A'}}
      className="kb-footer px-6 pt-12 pb-8 transition-all duration-700 ease-out"
    >
      <div
        className="mb-8 transition-all duration-700 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="mb-3">
          <span className="font-serif text-[28px] font-bold text-white tracking-tight">KB </span>
          <span className="font-serif text-[28px] font-light italic" style={{color:'#C9A84C'}}>hair</span>
        </div>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase" style={{color:'rgba(255,255,255,0.4)'}}>RAW HAIR PREMIUM PARIS</p>
        <div className="flex gap-3 mt-4">
          <a href="https://instagram.com/kbhairparis" target="_blank" rel="noopener" className="kb-social-icon w-9 h-9 border flex items-center justify-center transition-all duration-300" style={{borderColor:'rgba(255,255,255,0.2)'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="white"/></svg>
          </a>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="kb-social-icon w-9 h-9 border flex items-center justify-center transition-all duration-300" style={{borderColor:'rgba(255,255,255,0.2)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          )}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener" className="kb-social-icon w-9 h-9 border flex items-center justify-center transition-all duration-300" style={{borderColor:'rgba(255,255,255,0.2)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.74 13.4L3 21l3.7-1.28a8.9 8.9 0 0 0 5.36 1.62h0a8.93 8.93 0 0 0 7.95-13.02zM12.06 19.6a7.4 7.4 0 0 1-3.78-1.04l-.27-.16-2.79.96.94-2.7-.18-.28a7.45 7.45 0 1 1 13.85-3.92 7.4 7.4 0 0 1-7.77 7.14zm4.08-5.56c-.22-.11-1.31-.65-1.52-.72-.2-.08-.35-.11-.5.11-.15.22-.57.72-.7.87-.13.15-.26.16-.48.05a6 6 0 0 1-1.79-1.1 6.7 6.7 0 0 1-1.24-1.54c-.13-.22 0-.34.12-.46.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.07-.11-.62-1.5-.85-2.05-.22-.54-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01a1.04 1.04 0 0 0-.75.35 3.16 3.16 0 0 0-.99 2.35c0 1.39 1.01 2.73 1.15 2.92.14.19 1.96 2.99 4.74 4.07a5.3 5.3 0 0 0 2 .38 1.8 1.8 0 0 0 1.5-.7 2.1 2.1 0 0 0 .47-1.43c-.07-.13-.2-.2-.42-.31z"/></svg>
            </a>
          )}
        </div>
      </div>

      <div
        className="mb-8 transition-all duration-700 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '80ms' }}
      >
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase mb-4" style={{color:'#C9A84C'}}>COLLECTIONS</p>
        <ul className="flex flex-col gap-3">
          {collections.map(l => (
            <li key={l.href}>
              <Link href={l.href} className="kb-footer-link font-sans text-[12px] font-light no-underline inline-block" style={{color:'rgba(255,255,255,0.5)'}}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="mb-8 transition-all duration-700 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '160ms' }}
      >
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase mb-4" style={{color:'#C9A84C'}}>INFORMATION</p>
        <ul className="flex flex-col gap-3">
          {info.map(l => (
            <li key={l.href}>
              <Link href={l.href} className="kb-footer-link font-sans text-[12px] font-light no-underline inline-block" style={{color:'rgba(255,255,255,0.5)'}}>{l.label}</Link>
            </li>
          ))}
        </ul>
        {(contactEmail || contactWhatsapp) && (
          <div className="mt-4 flex flex-col gap-1.5">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="kb-footer-link font-sans text-[12px] font-light no-underline inline-block" style={{color:'rgba(255,255,255,0.5)'}}>{contactEmail}</a>
            )}
            {contactWhatsapp && (
              <a href={whatsappLink} target="_blank" rel="noopener" className="kb-footer-link font-sans text-[12px] font-light no-underline inline-block" style={{color:'rgba(255,255,255,0.5)'}}>{contactWhatsapp}</a>
            )}
          </div>
        )}
      </div>

      <div
        className="mb-8 transition-all duration-700 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '240ms' }}
      >
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase mb-2" style={{color:'#C9A84C'}}>NEWSLETTER</p>
        <p className="font-sans text-[11px] font-light mb-4" style={{color:'rgba(255,255,255,0.4)'}}>
          {locale === 'fr' ? 'Inscrivez-vous pour recevoir nos offres exclusives.' : 'Sign up to receive our exclusive offers.'}
        </p>
        {sent ? (
          <p className="font-sans text-[11px]" style={{color:'#C9A84C'}}>{locale === 'fr' ? 'Merci !' : 'Thank you!'}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="kb-newsletter-input w-full px-3 py-3 font-sans text-[12px] outline-none transition-all duration-300"
              style={{backgroundColor:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'white'}}
            />
            <button onClick={handleNewsletter} className="kb-subscribe-btn w-full py-3 font-sans text-[11px] uppercase font-medium border-none cursor-pointer transition-all duration-300" style={{backgroundColor:'#C9A84C',color:'#0A0A0A',letterSpacing:'0.15em'}}>SUBSCRIBE</button>
          </div>
        )}
      </div>

      <div className="border-t pt-6 mb-6" style={{borderColor:'rgba(255,255,255,0.1)'}}>
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-center mb-4" style={{color:'rgba(255,255,255,0.3)'}}>SECURE PAYMENT</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" style={{height:'18px',filter:'brightness(0) invert(1)',opacity:0.7}} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{height:'22px',opacity:0.7}} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" style={{height:'18px',filter:'brightness(0) invert(1)',opacity:0.7}} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" style={{height:'18px',filter:'brightness(0) invert(1)',opacity:0.7}} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" style={{height:'18px',opacity:0.7}} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{height:'18px',filter:'brightness(0) invert(1)',opacity:0.7}} />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{height:'18px',opacity:0.7}} />
        </div>
      </div>

      <div className="border-t pt-4 text-center" style={{borderColor:'rgba(255,255,255,0.1)'}}>
        <p className="font-sans text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>{locale === 'fr' ? '© 2026 KB Hair Paris. Tous droits réservés.' : '© 2026 KB Hair Paris. All rights reserved.'}</p>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase mt-1" style={{color:'rgba(255,255,255,0.2)'}}>RAW HAIR ONLY</p>
      </div>

      <style jsx>{`
        .kb-social-icon:hover {
          background-color: #C9A84C;
          border-color: #C9A84C;
          transform: translateY(-2px);
        }
        .kb-footer-link {
          background-image: linear-gradient(to right, #C9A84C, #C9A84C);
          background-size: 0% 1px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          padding-bottom: 2px;
          transition: background-size 350ms ease, color 350ms ease;
        }
        .kb-footer-link:hover {
          color: rgba(255,255,255,0.85) !important;
          background-size: 100% 1px;
        }
        .kb-newsletter-input:focus {
          border-color: #C9A84C !important;
          background-color: rgba(201,168,76,0.05);
        }
        .kb-subscribe-btn:hover {
          opacity: 0.88;
          letter-spacing: 0.2em;
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-footer, .kb-social-icon, .kb-footer-link, .kb-newsletter-input, .kb-subscribe-btn {
            transition: none !important;
          }
        }
      `}</style>
    </footer>
  )
}
