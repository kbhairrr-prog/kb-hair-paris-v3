'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalOrders:    number
  totalRevenue:   number
  totalCustomers: number
  totalProducts:  number
  pendingOrders:  number
}

export default function AdminDashboard() {
  const [stats,  setStats]  = useState<AdminStats | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    const load = async () => {
      const [
        { count: totalOrders },
        { data: revenueData },
        { count: totalCustomers },
        { count: totalProducts },
        { count: pendingOrders },
        { data: recentOrders },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*, customer:customers(first_name,last_name,email)')
                .order('created_at', { ascending: false }).limit(8),
      ])

      const totalRevenue = revenueData?.reduce((s, o) => s + (o.total ?? 0), 0) ?? 0

      setStats({
        totalOrders:    totalOrders ?? 0,
        totalRevenue,
        totalCustomers: totalCustomers ?? 0,
        totalProducts:  totalProducts ?? 0,
        pendingOrders:  pendingOrders ?? 0,
      })
      setOrders(recentOrders ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const fmt = (n: number) => 'EUR' + n.toFixed(2).replace('.', ',')

  const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    confirmed:  'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped:    'bg-indigo-100 text-indigo-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Dashboard</h1>
        <Link href="/fr" target="_blank" className="font-sans text-[11px] tracking-[0.1em] uppercase text-[#888] hover:text-black no-underline">
          Voir le site
        </Link>
      </div>

      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Commandes',  value: stats?.totalOrders },
            { label: 'Revenus',    value: stats?.totalRevenue, euro: true },
            { label: 'Clients',    value: stats?.totalCustomers },
            { label: 'Produits',   value: stats?.totalProducts },
          ].map(card => (
            <div key={card.label} className="bg-white border border-[#e8e8e8] px-4 py-4">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#888] mb-2">{card.label}</p>
              <p className="font-sans text-[22px] font-light text-black">
                {loading ? '-' : card.euro ? fmt(card.value ?? 0) : card.value ?? 0}
              </p>
            </div>
          ))}
        </div>

        {(stats?.pendingOrders ?? 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 mb-5 flex items-center justify-between">
            <p className="font-sans text-[12px] text-yellow-800">
              {stats?.pendingOrders} commande(s) en attente
            </p>
            <Link href="/admin/commandes" className="font-sans text-[11px] uppercase underline text-yellow-800 no-underline">Voir</Link>
          </div>
        )}

        <div className="bg-white border border-[#e8e8e8] mb-5">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
            <p className="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-black">Dernières commandes</p>
            <Link href="/admin/commandes" className="font-sans text-[10px] uppercase text-[#888] hover:text-black no-underline">Voir tout</Link>
          </div>
          <div className="divide-y divide-[#f0f0f0]">
            {loading ? (
              <p className="px-4 py-6 text-center font-sans text-[12px] text-[#aaa]">Chargement...</p>
            ) : orders.length === 0 ? (
              <p className="px-4 py-6 text-center font-sans text-[12px] text-[#aaa]">Aucune commande</p>
            ) : orders.map(order => (
              <Link key={order.id} href={'/admin/commandes/' + order.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] no-underline">
                <div>
                  <span className="font-sans text-[12px] font-medium text-black">{order.order_number}</span>
                  <span className="font-sans text-[11px] text-[#888] ml-3">{order.customer?.email ?? order.guest_email ?? '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={'font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ' + (STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600')}>
                    {order.status}
                  </span>
                  <span className="font-sans text-[12px] font-medium text-black">{fmt(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Nouveau produit',  href: '/admin/produits/nouveau' },
            { label: 'Gérer homepage',   href: '/admin/homepage' },
            { label: 'Codes promo',      href: '/admin/promo' },
            { label: 'Parametres',       href: '/admin/settings' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-3.5 text-center hover:opacity-85 no-underline">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
