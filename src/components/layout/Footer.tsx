'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Footer({ locale }: { locale: 'fr' | 'en' }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleNewsletter = async () => {
    if (!email) return
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) })
    setSent(true)
  }

  const collections = locale === 'fr'
    ? [{ label: 'WIGS', href: '/fr/collections/wigs' }, { label: 'BUNDLES', href: '/fr/collections/bundles' }, { label: 'CLOSURES & FRONTALS', href: '/fr/collections/closures' }, { label: 'HAIR PRODUCTS', href: '/fr/collections/produits' }]
    : [{ label: 'WIGS', href: '/en/collections/wigs' }, { label: 'BUNDLES', href: '/en/collections/bundles' }, { label: 'CLOSURES & FRONTALS', href: '/en/collections/closures' }, { label: 'HAIR PRODUCTS', href: '/en/collections/produits' }]

  const info = locale === 'fr'
    ? [{ label: 'ABOUT US', href: '/fr/pages/qui-sommes-nous' }, { label: 'THE FOUNDER', href: '/fr/pages/la-fondatrice' }, { label: 'TERMS', href: '/fr/pages/cgv' }, { label: 'RETURN POLICY', href: '/fr/pages/livraison' }, { label: 'PRIVACY POLICY', href: '/fr/pages/confidentialite' }]
    : [{ label: 'ABOUT US', href: '/en/pages/qui-sommes-nous' }, { label: 'THE FOUNDER', href: '/en/pages/la-fondatrice' }, { label: 'TERMS', href: '/en/pages/cgv' }, { label: 'RETURN POLICY', href: '/en/pages/livraison' }, { label: 'PRIVACY POLICY', href: '/en/pages/confidentialite' }]

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
          {['VISA','Mastercard','AMEX','Apple Pay','GPay','Stripe'].map(p => (
            <span key={p} className="font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-1 border" style={{borderColor:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.4)'}}>{p}</span>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 text-center" style={{borderColor:'rgba(255,255,255,0.1)'}}>
        <p className="font-sans text-[10px]" style={{color:'rgba(255,255,255,0.3)'}}>© 2026 KB Hair Paris. All rights reserved.</p>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase mt-1" style={{color:'rgba(255,255,255,0.2)'}}>RAW HAIR ONLY</p>
      </div>
    </footer>
  )
}
