import Link from 'next/link'

interface FooterProps {
  locale: 'fr' | 'en'
}

const MENU_LINKS = {
  fr: [
    { label: 'Recherche',                     href: '/fr/search' },
    { label: 'Conditions générales de vente', href: '/fr/pages/cgv' },
    { label: 'Mentions légales',              href: '/fr/pages/mentions-legales' },
    { label: 'Politique de confidentialité',  href: '/fr/pages/confidentialite' },
    { label: 'Livraison & Retours',           href: '/fr/pages/livraison' },
  ],
  en: [
    { label: 'Search',                href: '/en/search' },
    { label: 'Terms of Sale',         href: '/en/pages/cgv' },
    { label: 'Legal Notice',          href: '/en/pages/mentions-legales' },
    { label: 'Privacy Policy',        href: '/en/pages/confidentialite' },
    { label: 'Shipping & Returns',    href: '/en/pages/livraison' },
  ],
}

export default function Footer({ locale }: FooterProps) {
  const links = MENU_LINKS[locale] ?? []

  return (
    <footer className="bg-white px-6 pt-10 pb-8">

      {/* Newsletter inline footer */}
      <div className="mb-10">
        <p className="font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-black mb-2">
          NEWSLETTER
        </p>
        <p className="font-sans text-[13px] font-light text-[#555] mb-4">
          {locale === 'fr'
            ? 'Sign up to our newsletter to receive exclusive offers.'
            : 'Sign up to our newsletter to receive exclusive offers.'}
        </p>
        <div className="flex flex-col gap-0">
          <input
            type="email"
            placeholder="E-mail"
            className="px-4 py-3.5 border border-[#e0e0e0] bg-white text-[12px] font-light text-black placeholder:text-[#aaa] outline-none w-full"
          />
          <button className="bg-black text-white text-[10px] font-medium tracking-[0.2em] uppercase px-6 py-3.5 w-fit mt-0 cursor-pointer hover:opacity-85 transition-opacity border-none">
            {locale === 'fr' ? 'S\'INSCRIRE' : 'SUBSCRIBE'}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e8e8e8] mb-8" />

      {/* MENU */}
      <div className="mb-8">
        <p className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase text-black mb-4">
          MENU
        </p>
        <ul className="flex flex-col gap-3.5">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-sans text-[13px] font-light text-[#555] no-underline hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* JOIN US */}
      <div className="mb-8">
        <p className="font-sans text-[10px] font-medium tracking-[0.25em] uppercase text-black mb-4">
          JOIN US :
        </p>
        <ul className="flex flex-col gap-3">
          <li className="font-sans text-[13px] font-light text-[#555]">
            Instagram : @KBHAIR.PARIS
          </li>
          <li className="font-sans text-[13px] font-light text-[#555]">
            WhatsApp : +33 X XX XX XX XX
          </li>
          <li className="font-sans text-[13px] font-light text-[#555]">
            Email : contact@kbhair.fr
          </li>
        </ul>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e8e8e8] mb-6" />

      {/* Locale */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button className="flex items-center gap-1.5 font-sans text-[11px] tracking-[0.1em] uppercase text-black bg-transparent border-none cursor-pointer">
          🇫🇷 {locale === 'fr' ? 'France (EUR €)' : 'France (EUR €)'} ∨
        </button>
        <span className="text-[#e0e0e0]">|</span>
        <Link
          href={locale === 'fr' ? '/en' : '/fr'}
          className="font-sans text-[11px] tracking-[0.1em] uppercase text-black no-underline"
        >
          {locale === 'fr' ? 'FRANÇAIS' : 'ENGLISH'} ∨
        </Link>
      </div>

      {/* Copyright */}
      <p className="font-sans text-[10px] font-light tracking-[0.08em] uppercase text-[#aaa] mb-5">
        © 2025 - KB HAIR PARIS
      </p>

      {/* Logos paiement — comme BHP exact */}
      <div className="flex flex-wrap gap-2 items-center">
        {['AMEX', 'Apple Pay', 'CB', 'Mastercard', 'PayPal', 'Shop Pay', 'VISA'].map(pay => (
          <span
            key={pay}
            className="inline-flex items-center justify-center h-[26px] px-2.5 bg-white border border-[#e0e0e0] rounded-[3px] text-[9px] font-medium tracking-wide text-[#444]"
          >
            {pay}
          </span>
        ))}
      </div>
    </footer>
  )
}
