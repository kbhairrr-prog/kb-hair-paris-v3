'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Footer({ locale }: { locale: 'fr' | 'en' }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

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

  return (
    <footer style={{backgroundColor:'#0A0A0A'}} className="px-6 pt-12 pb-8">
      <div className="mb-8">
        <div className="mb-3">
          <span className="font-serif text-[28px] font-bold text-white tracking-tight">KB </span>
          <span className="font-serif text-[28px] font-light italic" style={{color:'#C9A84C'}}>hair</span>
        </div>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase" style={{color:'rgba(255,255,255,0.4)'}}>RAW HAIR PREMIUM PARIS</p>
        <div className="flex gap-3 mt-4">
          <a href="https://instagram.com/kbhairparis" target="_blank" rel="noopener" className="w-9 h-9 border flex items-center justify-center" style={{borderColor:'rgba(255,255,255,0.2)'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="white"/></svg>
          </a>
          <a href="mailto:kbhairr@gmail.com" className="w-9 h-9 border flex items-center justify-center" style={{borderColor:'rgba(255,255,255,0.2)'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>
      </div>

      <div className="mb-8">
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase mb-4" style={{color:'#C9A84C'}}>COLLECTIONS</p>
        <ul className="flex flex-col gap-3">
          {collections.map(l => (
            <li key={l.href}>
              <Link href={l.href} className="font-sans text-[12px] font-light no-underline" style={{color:'rgba(255,255,255,0.5)'}}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase mb-4" style={{color:'#C9A84C'}}>INFORMATION</p>
        <ul className="flex flex-col gap-3">
          {info.map(l => (
            <li key={l.href}>
              <Link href={l.href} className="font-sans text-[12px] font-light no-underline" style={{color:'rgba(255,255,255,0.5)'}}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <p className="font-sans text-[11px] tracking-[0.2em] uppercase mb-2" style={{color:'#C9A84C'}}>NEWSLETTER</p>
        <p className="font-sans text-[11px] font-light mb-4" style={{color:'rgba(255,255,255,0.4)'}}>
          {locale === 'fr' ? 'Inscrivez-vous pour recevoir nos offres exclusives.' : 'Sign up to receive our exclusive offers.'}
        </p>
        {sent ? (
          <p className="font-sans text-[11px]" style={{color:'#C9A84C'}}>{locale === 'fr' ? 'Merci !' : 'Thank you!'}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-3 font-sans text-[12px] outline-none" style={{backgroundColor:'transparent',border:'1px solid rgba(255,255,255,0.2)',color:'white'}} />
            <button onClick={handleNewsletter} className="w-full py-3 font-sans text-[11px] tracking-[0.15em] uppercase font-medium border-none cursor-pointer" style={{backgroundColor:'#C9A84C',color:'#0A0A0A'}}>SUBSCRIBE</button>
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
    </footer>
  )
}
