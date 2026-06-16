'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, X, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  locale: 'fr' | 'en'
}

const NAV_ITEMS = {
  fr: [
    { label: 'HOME',               href: '/fr' },
    { label: 'NOS WIGS',  href: '/fr/collections/wigs' },
    { label: 'BUNDLES',   href: '/fr/collections/bundles' },
    { label: 'CLOSURES & FRONTALES', href: null, children: [
      { label: 'NOS FRONTALES', href: '/fr/collections/frontales' },
      { label: 'NOS CLOSURES',  href: '/fr/collections/closures'  },
    ]},
    { label: 'HAIR PRODUCTS',      href: '/fr/collections/produits' },
    { label: 'NOS SERVICES',       href: '/fr/collections/services' },
    { label: 'VIP CARDS',          href: '/fr/collections/vip-cards' },
    { label: 'MES FAVORIS',        href: '/fr/wishlist' },
    { label: 'À PROPOS',           href: null, children: [
      { label: 'QUI SOMMES-NOUS', href: '/fr/pages/qui-sommes-nous' },
      { label: 'LA FONDATRICE',   href: '/fr/pages/la-fondatrice'   },
    ]},
    { label: 'CGV',                href: '/fr/pages/cgv' },
  ],
  en: [
    { label: 'HOME',               href: '/en' },
    { label: 'OUR WIGS',  href: '/en/collections/wigs' },
    { label: 'BUNDLES',   href: '/en/collections/bundles' },
    { label: 'CLOSURES & FRONTALS',href: null, children: [
      { label: 'OUR FRONTALS', href: '/en/collections/frontales' },
      { label: 'OUR CLOSURES', href: '/en/collections/closures'  },
    ]},
    { label: 'HAIR PRODUCTS',      href: '/en/collections/produits' },
    { label: 'OUR SERVICES',       href: '/en/collections/services' },
    { label: 'VIP CARDS',          href: '/en/collections/vip-cards' },
    { label: 'ABOUT US',           href: null, children: [
      { label: 'WHO WE ARE',   href: '/en/pages/who-we-are'    },
      { label: 'THE FOUNDER',  href: '/en/pages/the-founder'   },
    ]},
    { label: 'T&C',                href: '/en/pages/terms' },
  ],
}

export default function Header({ locale }: HeaderProps) {
  const [dynamicNav, setDynamicNav] = useState<any[]>([])

  useEffect(() => {
    const loadMenu = async () => {
      const { data: menu } = await supabase
        .from('menus')
        .select('id')
        .eq('handle', 'main')
        .single()
      if (!menu) return
      const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_id', menu.id)
        .eq('is_active', true)
        .order('position')
      if (items && items.length > 0) {
        const activeItems = items.filter((i: any) => i.is_active)
        const roots = activeItems.filter((i: any) => !i.parent_id)
        setDynamicNav(roots.map((r: any) => {
          const children = items
            .filter((i: any) => i.parent_id === r.id && i.is_active)
            .map((c: any) => ({
              label: locale === 'fr' ? c.label_fr : c.label_en,
              href:  c.url ? c.url.replace('/fr/', `/${locale}/`).replace(/^\/fr$/, `/${locale}`) : c.url,
            }))
          return {
            label: locale === 'fr' ? r.label_fr : r.label_en,
            href:  r.url ? r.url.replace('/fr/', `/${locale}/`).replace(/^\/fr$/, `/${locale}`) : r.url,
            children: children.length > 0 ? children : undefined,
          }
        }))
      }
    }
    loadMenu()
  }, [locale])

  const navItems = dynamicNav.length > 0 ? dynamicNav : (NAV_ITEMS[locale] ?? [])

  const [menuOpen, setMenuOpen]           = useState(false)
  const [submenu, setSubmenu]             = useState<string | null>(null)
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [scrolled, setScrolled]           = useState(false)

  const itemCount = useCartStore(s => s.getItemCount())
  const openCart  = useCartStore(s => s.openCart)
  const nav       = (dynamicNav.length > 0 ? dynamicNav : NAV_ITEMS[locale]) ?? []

  // Scroll header (optionnel: pas de changement sur BHP, reste noir)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fermer menu si resize desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock scroll body quand menu ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] h-[68px] flex items-center justify-between px-4"
              style={{ boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.06)' : 'none' }}>

        {/* Hamburger gauche — exactement comme BHP */}
        <button
          onClick={() => setMenuOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] border border-white/30 flex-shrink-0"
          aria-label="Menu"
        >
          <span className="block w-[18px] h-px bg-white" />
          <span className="block w-[18px] h-px bg-white" />
          <span className="block w-[18px] h-px bg-white" />
        </button>

        {/* Logo centré — serif, comme BHP */}
        <Link
          href={`/${locale}`}
          className="absolute left-1/2 -translate-x-1/2 text-center no-underline"
        >
          <span className="block font-serif text-[17px] font-normal tracking-[0.22em] text-white leading-none">
            KB HAIR
          </span>
          <span className="block font-serif text-[9px] font-light tracking-[0.4em] text-white/50 mt-0.5">
            PARIS
          </span>
        </Link>

        {/* Icônes droite */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(s => !s)}
            className="text-white"
            aria-label="Recherche"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

          <a
            href={`/${locale}/wishlist`}
            className="text-white no-underline"
            aria-label={locale === 'fr' ? 'Favoris' : 'Wishlist'}
          >
            <span className="text-[18px] leading-none">♡</span>
          </a>

          <a
            href={`/${locale}/compte`}
            className="text-white no-underline"
            aria-label={locale === 'fr' ? 'Mon compte' : 'My account'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>

          <button
            onClick={openCart}
            className="relative text-white"
            aria-label="Panier"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* ── BARRE RECHERCHE ── */}
      {searchOpen && (
        <div className="fixed top-[68px] left-0 right-0 z-40 bg-white border-b border-[#e8e8e8] px-4 py-3 flex gap-2 shadow-sm">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setSearchOpen(false)
                window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`
              }
              if (e.key === 'Escape') setSearchOpen(false)
            }}
            placeholder={locale === 'fr' ? 'Rechercher un produit...' : 'Search a product...'}
            className="flex-1 font-sans text-[13px] font-light tracking-wide outline-none text-black placeholder:text-[#aaa]"
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                setSearchOpen(false)
                window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`
              }
            }}
            className="font-sans text-[10px] tracking-[0.15em] uppercase text-black border-none bg-transparent cursor-pointer hover:text-[#888]"
          >
            {locale === 'fr' ? 'OK' : 'GO'}
          </button>
          <button onClick={() => setSearchOpen(false)} className="text-[#888] border-none bg-transparent cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── OVERLAY MENU ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => { setMenuOpen(false); setSubmenu(null) }}
        />
      )}

      {/* ── PANNEAU MENU MOBILE ── fond blanc, style BHP exact ── */}
      <div className={`fixed top-0 left-0 bottom-0 z-[60] w-[85vw] max-w-[340px] flex flex-col transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{backgroundColor:'#0A0A0A', borderRight:'2px solid #C9A84C'}}>

        {/* Header menu — logo + fermer + langue */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div>
            <span className="font-serif text-[18px] font-bold text-white tracking-tight">KB HAIR</span>
            <span className="block font-serif text-[8px] font-light tracking-[0.4em] mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>PARIS</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMenuOpen(false); window.location.href = locale === 'fr' ? '/en' : '/fr' }}
              className="font-sans text-[10px] tracking-[0.15em] uppercase flex items-center gap-1 bg-transparent border-none cursor-pointer"
              style={{color:'rgba(255,255,255,0.5)'}}
            >
              {locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
            <button
              onClick={() => { setMenuOpen(false); setSubmenu(null) }}
              className="text-white bg-transparent border-none cursor-pointer"
              aria-label="Fermer"
            >
              <X size={20} strokeWidth={1.2} />
            </button>
          </div>
        </div>

        {/* ── SOUS-MENU (Closures/About) ── */}
        {submenu && (
          <div className="absolute inset-0 flex flex-col px-7 pt-16 pb-8 z-10" style={{backgroundColor:"#0A0A0A"}}>
            <button
              onClick={() => setSubmenu(null)}
              className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase mb-6 self-start" style={{color:"rgba(255,255,255,0.5)"}}
            >
              <ChevronRight size={12} className="rotate-180" />
              {submenu}
            </button>
            <div className="h-px mb-4" style={{backgroundColor:"rgba(255,255,255,0.08)"}} />
            {nav.find(n => n.label === submenu)?.children?.map((child: any) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => { setMenuOpen(false); setSubmenu(null) }}
                className="py-4 text-[12px] font-normal tracking-[0.15em] uppercase no-underline" style={{color:"white",borderBottom:"1px solid rgba(255,255,255,0.08)"}}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}

        {/* ── LIENS PRINCIPAUX ── */}
        <nav className="flex flex-col px-7 pt-16 pb-4 flex-1 overflow-y-auto">
          {nav.map(item => (
            item.children ? (
              <button
                key={item.label}
                onClick={() => setSubmenu(item.label)}
                className="flex items-center justify-between py-4 text-[12px] font-normal tracking-[0.15em] uppercase w-full text-left bg-transparent" style={{color:"white",borderBottom:"1px solid rgba(255,255,255,0.08)"}}
              >
                {item.label}
                <ChevronRight size={14} style={{color:"rgba(255,255,255,0.3)"}} />
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                onClick={() => setMenuOpen(false)}
                className="py-4 text-[12px] font-normal tracking-[0.15em] uppercase no-underline block" style={{color: item.href === '/fr' || item.href === '/en' ? '#C9A84C' : 'white', borderBottom:"1px solid rgba(255,255,255,0.08)"}}
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        {/* Footer menu — locale + langue, comme BHP */}
        <div className="px-7 py-5 flex items-center gap-3" style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <span className="text-lg">🇫🇷</span>
          <span className="text-[11px] font-normal tracking-[0.12em] uppercase" style={{color:"rgba(255,255,255,0.5)"}}>
            EUR €
          </span>
          <span className="" style={{color:"rgba(255,255,255,0.2)"}}>|</span>
          <Link
            href={locale === 'fr' ? '/en' : '/fr'}
            className="text-[11px] font-normal tracking-[0.12em] uppercase no-underline" style={{color:"rgba(255,255,255,0.5)"}}
          >
            {locale === 'fr' ? 'FRANÇAIS' : 'ENGLISH'}
          </Link>
        </div>
      </div>
    </>
  )
}
