'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  Settings, Home, BarChart3, Mail, Star, Video,
  ExternalLink, FileText, Navigation, Link2, Menu, X
} from 'lucide-react'

const NAV = [
  { href: '/admin',                    icon: LayoutDashboard, label: 'Dashboard'          },
  { href: '/admin/produits',           icon: Package,         label: 'Produits'           },
  { href: '/admin/produits-associes',  icon: Link2,           label: 'Produits associes'  },
  { href: '/admin/commandes',          icon: ShoppingBag,     label: 'Commandes'          },
  { href: '/admin/clients',            icon: Users,           label: 'Clients'            },
  { href: '/admin/collections',        icon: Tag,             label: 'Collections'        },
  { href: '/admin/homepage',           icon: Home,            label: 'Homepage'           },
  { href: '/admin/menus',              icon: Navigation,      label: 'Navigation'         },
  { href: '/admin/pages',              icon: FileText,        label: 'Pages legales'      },
  { href: '/admin/promo',              icon: BarChart3,       label: 'Codes Promo'        },
  { href: '/admin/newsletter',         icon: Mail,            label: 'Newsletter'         },
  { href: '/admin/avis',               icon: Star,            label: 'Avis clients'       },
  { href: '/admin/videos',             icon: Video,           label: 'Videos'             },
  { href: '/admin/settings',           icon: Settings,        label: 'Parametres'         },
]

function LogoutButton() {
  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }
  return (
    <button onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 font-sans text-[11px] tracking-[0.06em] text-white/30 hover:text-white/60 bg-transparent border-none cursor-pointer transition-colors w-full text-left mt-2 border-t border-white/10 pt-3">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Déconnexion
    </button>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="no-underline" onClick={onClose}>
          <span className="font-serif text-[15px] tracking-[0.2em] text-white block">KB HAIR</span>
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40">ADMIN PANEL</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto">
        {NAV.map(item => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 font-sans text-[11.5px] tracking-[0.06em] text-white/60 hover:text-white hover:bg-white/5 rounded no-underline transition-colors">
            <item.icon size={14} strokeWidth={1.5} className="flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
        <Link href="/fr" target="_blank" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 font-sans text-[11px] tracking-[0.06em] text-white/30 hover:text-white/60 no-underline transition-colors">
          <ExternalLink size={13} strokeWidth={1.5} />
          Voir le site FR
        </Link>
        <Link href="/en" target="_blank" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 font-sans text-[11px] tracking-[0.06em] text-white/30 hover:text-white/60 no-underline transition-colors">
          <ExternalLink size={13} strokeWidth={1.5} />
          Voir le site EN
        </Link>
        <LogoutButton />
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-[230px] bg-[#1a1a1a] flex-col flex-shrink-0 fixed top-0 left-0 bottom-0 z-40">
        <Sidebar />
      </aside>

      {/* Header mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Link href="/admin" className="no-underline">
          <span className="font-serif text-[14px] tracking-[0.2em] text-white">KB HAIR</span>
          <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-white/40 ml-2">ADMIN</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white bg-transparent border-none cursor-pointer">
          <Menu size={22} />
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Contenu principal */}
      <main className="flex-1 lg:ml-[230px] min-w-0 pt-[52px] lg:pt-0">
        {children}
      </main>
    </div>
  )
}
