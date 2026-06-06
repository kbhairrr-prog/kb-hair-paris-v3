'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface FooterProps { locale: 'fr' | 'en' }

const DEFAULT_LINKS = {
  fr: [
    { label: 'Recherche', href: '/fr/search' },
    { label: 'Conditions générales de vente', href: '/fr/pages/cgv' },
    { label: 'Mentions légales', href: '/fr/pages/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/fr/pages/confidentialite' },
    { label: 'Livraison & Retours', href: '/fr/pages/livraison' },
    { label: 'La Fondatrice', href: '/fr/pages/la-fondatrice' },
    { label: 'Qui Sommes-Nous', href: '/fr/pages/qui-sommes-nous' },
  ],
  en: [
    { label: 'Search', href: '/en/search' },
    { label: 'Terms of Sale', href: '/en/pages/cgv' },
    { label: 'Legal Notice', href: '/en/pages/mentions-legales' },
    { label: 'Privacy Policy', href: '/en/pages/confidentialite' },
    { label: 'Shipping & Returns', href: '/en/pages/livraison' },
    { label: 'The Founder', href: '/en/pages/la-fondatrice' },
    { label: 'About Us', href: '/en/pages/qui-sommes-nous' },
  ],
}

export default function Footer({ locale }: FooterProps) {
  const [links, setLinks] = useState(DEFAULT_LINKS[locale])
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    // Charger les paramètres du site
    supabase.from('site_settings').select('*').then(({ data: rows }) => {
      const map: Record<string, any> = {}
      rows?.forEach(r => { map[r.key] = r.value })
      setSettings(map)
    })
  }, [])

  useEffect(() => {
    supabase
      .from('footer_links')
      .select('*')
      .eq('is_active', true)
      .order('position')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLinks(data.map(l => ({
            label: locale === 'fr' ? l.label_fr : l.label_en,
            href:  locale === 'fr' ? l.href_fr  : l.href_en,
          })))
        }
      })
  }, [locale])

  const handleNewsletter = async () => {
    if (!email) return
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, locale }),
    })
    setSent(true)
  }

  return (
    <footer className="bg-white px-6 pt-10 pb-8">
      <div className="mb-10">
        <p className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-black mb-2">
          NEWSLETTER
        </p>
        <p className="font-sans text-[11px] font-light text-[#888] mb-4">
          {locale === 'fr' ? 'Inscrivez-vous pour recevoir nos offres exclusives.' : 'Sign up to receive exclusive offers.'}
        </p>
        {sent ? (
          <p className="font-sans text-[11px] text-green-600">
            {locale === 'fr' ? 'Merci !' : 'Thank you!'}
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-3 py-2.5 border border-[#e0e0e0] font-sans text-[12px] outline-none focus:border-black"
            />
            <button
              onClick={handleNewsletter}
              className="bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85"
            >
              {locale === 'fr' ? "S'INSCRIRE" : 'SUBSCRIBE'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <p className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-black mb-4">
          MENU
        </p>
        <ul className="flex flex-col gap-3.5">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-sans text-[12px] font-light text-[#555] hover:text-black no-underline transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-black mb-3">
          JOIN US :
        </p>
        <div className="flex flex-col gap-2">
          {settings?.social?.instagram && (
            <a href={`https://instagram.com/${settings.social.instagram.replace('@','')}`} target="_blank" rel="noopener" className="flex items-center gap-2 font-sans text-[12px] font-light text-[#555] no-underline hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
              {settings.social.instagram}
            </a>
          )}
          {settings?.social?.tiktok && (
            <a href={`https://tiktok.com/@${settings.social.tiktok.replace('@','')}`} target="_blank" rel="noopener" className="flex items-center gap-2 font-sans text-[12px] font-light text-[#555] no-underline hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
              {settings.social.tiktok}
            </a>
          )}
          {settings?.social?.whatsapp && (
            <a href={`https://wa.me/${settings.social.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener" className="flex items-center gap-2 font-sans text-[12px] font-light text-[#555] no-underline hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              {settings.social.whatsapp}
            </a>
          )}
          {settings?.brand?.email && (
            <a href={`mailto:${settings.brand.email}`} className="flex items-center gap-2 font-sans text-[12px] font-light text-[#555] no-underline hover:text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {settings.brand.email}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-[#e8e8e8] pt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">{locale === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
          <span className="font-sans text-[11px] font-light text-[#888] uppercase">
            {locale === 'fr' ? 'FRANCE (EUR €)' : 'UNITED KINGDOM (EUR €)'}
          </span>
          <span className="font-sans text-[11px] font-light text-[#888] uppercase">
            {locale === 'fr' ? 'FRANÇAIS' : 'ENGLISH'}
          </span>
        </div>
        <p className="font-sans text-[10px] font-light text-[#aaa]">© 2025 · KB HAIR PARIS</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {['AMEX', 'Apple Pay', 'CB', 'Mastercard', 'PayPal', 'Shop Pay', 'VISA'].map(p => (
          <span key={p} className="font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-1 border border-[#e0e0e0] text-[#888]">
            {p}
          </span>
        ))}
      </div>
    </footer>
  )
}
