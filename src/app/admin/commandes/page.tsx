'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STATUSES = ['all','pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const STATUS_FR: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En traitement',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}
const STATUS_COLORS: Record<string, string> = {
  pending:'bg-yellow-100 text-yellow-800', confirmed:'bg-blue-100 text-blue-800',
  processing:'bg-purple-100 text-purple-800', shipped:'bg-indigo-100 text-indigo-800',
  delivered:'bg-green-100 text-green-800', cancelled:'bg-red-100 text-red-800',
  refunded:'bg-gray-100 text-gray-600',
}

export default function AdminCommandes() {
  const [orders,    setOrders]    = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [status,    setStatus]    = useState('all')
  const [search,    setSearch]    = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('orders')
      .select('*, customer:customers(first_name,last_name,email)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (status !== 'all') q = q.eq('status', status)
    if (search) q = q.or(`order_number.ilike.%${search}%,guest_email.ilike.%${search}%`)
    const { data } = await q
    setOrders(data ?? [])
    setLoading(false)
  }, [status, search])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('order_status_history').insert({ order_id: id, status: newStatus, created_by: 'admin' })
    setOrders(os => os.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Commandes</h1>
      </div>

      <div className="px-4 lg:px-6 py-5">
        {/* Filtres */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Numéro, email..." className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'Tous statuts' : STATUS_FR[s]}</option>)}
          </select>
        </div>

        <div className="bg-white border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#e8e8e8]">
                {['Commande', 'Client', 'Date', 'Total', 'Paiement', 'Statut', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-[#888]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {loading ? (
                Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:7}).map((_,j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-[#f0f0f0] rounded animate-pulse"/></td>
                  ))}</tr>
                ))
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${order.id}`} className="font-sans text-[12px] font-medium text-black no-underline hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#555]">
                    {order.customer
                      ? `${order.customer.first_name ?? ''} ${order.customer.last_name ?? ''}`.trim() || order.customer.email
                      : order.guest_email ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#555]">{fmtDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-sans text-[12px] font-medium text-black">{fmt(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_FR[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="font-sans text-[10px] tracking-[0.08em] bg-transparent border border-[#e0e0e0] px-2 py-1 outline-none cursor-pointer"
                    >
                      {STATUSES.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{STATUS_FR[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <p className="px-4 py-8 text-center font-sans text-[12px] text-[#aaa]">Aucune commande</p>
          )}
        </div>
      </div>
    </div>
  )
}
