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
          <p className="font-sans text-[12px] font-light text-[#555]">Instagram : @KBHAIR PARIS</p>
          <p className="font-sans text-[12px] font-light text-[#555]">WhatsApp : +33 X XX XX XX XX</p>
          <p className="font-sans text-[12px] font-light text-[#555]">Email : contact@kbhair.fr</p>
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
