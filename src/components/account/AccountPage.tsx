'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, MapPin, Star, LogOut, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AccountPageProps {
  locale: 'fr' | 'en'
}

const VIP_COLORS: Record<string, string> = {
  none:   'bg-gray-100 text-gray-500',
  bronze: 'bg-orange-100 text-orange-700',
  silver: 'bg-gray-200 text-gray-700',
  gold:   'bg-yellow-100 text-yellow-700',
}
const VIP_LABELS: Record<string, string> = {
  none: 'Standard', bronze: 'Bronze', silver: 'Silver', gold: 'Gold',
}

export default function AccountPage({ locale }: AccountPageProps) {
  const [customer, setCustomer] = useState<any>(null)
  const [orders,   setOrders]   = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'orders' | 'addresses' | 'vip'>('orders')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = `/${locale}/compte/connexion`; return }

      const { data: cust } = await supabase.from('customers').select('*').eq('supabase_uid', user.id).single()
      const { data: ords } = await supabase.from('orders').select('*, items:order_items(*)').eq('customer_id', cust?.id).order('created_at', { ascending: false }).limit(10)
      setCustomer(cust)
      setOrders(ords ?? [])
      setLoading(false)
    }
    load()
  }, [locale])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = `/${locale}`
  }

  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
  const fmtDate = (d: string) => { const dt = new Date(d); return dt.getDate() + '/' + (dt.getMonth()+1) + '/' + dt.getFullYear() }

  const VIP_NEXT_THRESHOLD: Record<string, number> = { none: 200, bronze: 500, silver: 1000 }
  const nextThreshold = customer ? VIP_NEXT_THRESHOLD[customer.vip_level] : 200
  const progress = customer ? Math.min(100, (customer.total_spent / nextThreshold) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-[68px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] pt-[68px]">
      {/* Header compte */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#888] mb-1">
              {locale === 'fr' ? `Bonjour${customer?.first_name ? ' ' + customer.first_name : ''},` : `Hello${customer?.first_name ? ' ' + customer.first_name : ''},`}
            </p>
            <p className="font-sans text-[16px] font-light tracking-[0.06em] text-black">
              {customer?.first_name ? `${customer.first_name} ${customer.last_name ?? ''}`.trim() : customer?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.12em] uppercase text-[#888] hover:text-black bg-transparent border-none cursor-pointer"
          >
            <LogOut size={14} />
            {locale === 'fr' ? 'Déconnexion' : 'Logout'}
          </button>
        </div>

        {/* Badge VIP */}
        {customer?.vip_level && customer.vip_level !== 'none' && (
          <div className={`inline-block mt-3 px-3 py-1 font-sans text-[10px] font-medium tracking-[0.2em] uppercase rounded-full ${VIP_COLORS[customer.vip_level]}`}>
            ★ {VIP_LABELS[customer.vip_level]}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-[#e8e8e8]">
        {[
          { key: 'orders',    icon: Package,  label: locale === 'fr' ? 'Commandes' : 'Orders' },
          { key: 'addresses', icon: MapPin,   label: locale === 'fr' ? 'Adresses'  : 'Addresses' },
          { key: 'vip',       icon: Star,     label: 'VIP' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex-1 flex flex-col items-center gap-1 py-3.5 font-sans text-[9px] tracking-[0.15em] uppercase border-b-2 transition-colors bg-transparent border-none cursor-pointer ${
              tab === key ? 'border-b-black text-black' : 'border-b-transparent text-[#aaa]'
            }`}
            style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid' }}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5">

        {/* ── COMMANDES ── */}
        {tab === 'orders' && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={36} strokeWidth={1} className="text-[#999] mx-auto mb-3" />
                <p className="font-sans text-[12px] tracking-[0.1em] uppercase text-[#666]">
                  {locale === 'fr' ? 'Aucune commande' : 'No orders yet'}
                </p>
                <Link href={`/${locale}/search`} className="font-sans text-[11px] tracking-[0.15em] uppercase underline underline-offset-4 text-black mt-3 inline-block no-underline">
                  {locale === 'fr' ? 'Commencer mes achats' : 'Start shopping'}
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white border border-[#e8e8e8] px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-sans text-[12px] font-medium text-black">{order.order_number}</p>
                      <p className="font-sans text-[10px] text-[#888] mt-0.5">{fmtDate(order.created_at)}</p>
                    </div>
                    <span className={`font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700'
                      : order.status === 'shipped' ? 'bg-blue-100 text-blue-700'
                      : order.status === 'cancelled' ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-[12px] font-light text-[#555]">
                      {order.items?.length ?? 0} {locale === 'fr' ? 'article(s)' : 'item(s)'}
                    </p>
                    <p className="font-sans text-[13px] font-medium text-black">{fmt(order.total)}</p>
                  </div>
                  {order.tracking_number && (
                    <p className="font-sans text-[11px] text-[#888] mt-2">
                      🚚 {order.tracking_number}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── VIP ── */}
        {tab === 'addresses' && (
          <div className="text-center py-12">
            <MapPin size={36} strokeWidth={1} className="text-[#999] mx-auto mb-3" />
            <p className="font-sans text-[12px] tracking-[0.1em] uppercase text-[#666]">
              Aucune adresse
            </p>
            <p className="font-sans text-[11px] font-light text-[#888] mt-2">
              Vos adresses seront sauvegardees lors de votre prochain achat.
            </p>
          </div>
        )}

        {tab === 'vip' && (
          <div>
            {/* Carte VIP */}
            <div className="bg-black text-white px-5 py-6 mb-5">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 mb-1">KB HAIR PARIS</p>
              <p className="font-serif text-[22px] tracking-[0.15em] mb-4">
                {customer?.first_name ?? 'Client'} {customer?.last_name ?? ''}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-white/50 mb-0.5">
                    {locale === 'fr' ? 'Total dépensé' : 'Total spent'}
                  </p>
                  <p className="font-sans text-[20px] font-light">{fmt(customer?.total_spent ?? 0)}</p>
                </div>
                <div className={`px-3 py-1 font-sans text-[10px] tracking-[0.2em] uppercase font-medium ${VIP_COLORS[customer?.vip_level ?? 'none']}`}>
                  ★ {VIP_LABELS[customer?.vip_level ?? 'none']}
                </div>
              </div>
            </div>

            {/* Progression */}
            {customer?.vip_level !== 'gold' && (
              <div className="bg-white border border-[#e8e8e8] px-4 py-4 mb-5">
                <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-3">
                  {locale === 'fr' ? `Prochain niveau : ${VIP_LABELS[customer?.vip_level === 'none' ? 'bronze' : customer?.vip_level === 'bronze' ? 'silver' : 'gold']}` : 'Next level'}
                </p>
                <div className="h-1 bg-[#e8e8e8] w-full mb-2">
                  <div className="h-full bg-black transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <p className="font-sans text-[11px] font-light text-[#555]">
                  {fmt(customer?.total_spent ?? 0)} / {fmt(nextThreshold)}
                </p>
              </div>
            )}

            {/* Avantages */}
            <div className="bg-white border border-[#e8e8e8] px-4 py-4">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-black mb-4 font-medium">
                {locale === 'fr' ? 'Niveaux VIP' : 'VIP Levels'}
              </p>
              {[
                { level: 'bronze', spend: '200€', perks: locale === 'fr' ? ['-5% sur tout', 'Ventes privées'] : ['-5% on everything', 'Private sales'] },
                { level: 'silver', spend: '500€', perks: locale === 'fr' ? ['-10% sur tout', 'Accès anticipé'] : ['-10% on everything', 'Early access'] },
                { level: 'gold',   spend: '1000€',perks: locale === 'fr' ? ['-15% + livraison gratuite', 'Service prioritaire'] : ['-15% + free shipping', 'Priority service'] },
              ].map(vip => (
                <div key={vip.level} className={`flex items-start gap-3 py-3 border-b border-[#f0f0f0] last:border-0 ${customer?.vip_level === vip.level ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    vip.level === 'gold' ? 'bg-yellow-500' : vip.level === 'silver' ? 'bg-gray-400' : 'bg-orange-500'
                  }`} />
                  <div>
                    <p className="font-sans text-[11px] font-medium tracking-[0.1em] uppercase text-black">
                      {vip.level.charAt(0).toUpperCase() + vip.level.slice(1)} — dès {vip.spend}
                    </p>
                    {vip.perks.map(p => (
                      <p key={p} className="font-sans text-[11px] font-light text-[#555]">✓ {p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
