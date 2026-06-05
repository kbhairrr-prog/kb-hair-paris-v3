'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminCommandeDetail({ params }: { params: { id: string } }) {
  const router  = useRouter()
  const [order,  setOrder]   = useState<any>(null)
  const [history,setHistory] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [tracking,setTracking] = useState('')
  const [note,   setNote]    = useState('')
  const [saving, setSaving]  = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: ord }, { data: hist }] = await Promise.all([
        supabase.from('orders').select('*, items:order_items(*), customer:customers(*)').eq('id', params.id).single(),
        supabase.from('order_status_history').select('*').eq('order_id', params.id).order('created_at', { ascending: false }),
      ])
      setOrder(ord)
      setTracking(ord?.tracking_number ?? '')
      setNote(ord?.admin_note ?? '')
      setHistory(hist ?? [])
      setLoading(false)
    }
    load()
  }, [params.id])

  const updateOrder = async (updates: any) => {
    setSaving(true)
    await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', params.id)
    setOrder((o: any) => ({ ...o, ...updates }))
    setSaving(false)
  }

  const changeStatus = async (status: string) => {
    await updateOrder({ status })
    await supabase.from('order_status_history').insert({ order_id: params.id, status, created_by: 'admin' })
    setHistory((h: any[]) => [{ status, created_at: new Date().toISOString(), created_by: 'admin' }, ...h])
  }

  const fmt = (n: number) => `€${(n ?? 0).toFixed(2).replace('.', ',')}`
  const fmtDate = (d: string) => new Date(d).toLocaleString('fr-FR')

  const STATUS_COLORS: Record<string,string> = {
    pending:'bg-yellow-100 text-yellow-800', confirmed:'bg-blue-100 text-blue-800',
    processing:'bg-purple-100 text-purple-800', shipped:'bg-indigo-100 text-indigo-800',
    delivered:'bg-green-100 text-green-800', cancelled:'bg-red-100 text-red-800',
  }

  if (loading) return <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"/></div>
  if (!order)  return <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center"><p className="font-sans text-[12px] text-[#aaa]">Commande introuvable</p></div>

  const addr = order.shipping_address

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#888] hover:text-black bg-transparent border-none cursor-pointer"><ChevronLeft size={18}/></button>
        <div>
          <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">{order.order_number}</h1>
          <p className="font-sans text-[11px] text-[#888]">{fmtDate(order.created_at)}</p>
        </div>
        <span className={`ml-auto font-sans text-[10px] tracking-[0.1em] uppercase px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 grid gap-4">

        {/* Actions statut */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-4">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Changer le statut</p>
          <div className="flex flex-wrap gap-2">
            {['confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
              <button key={s} onClick={() => changeStatus(s)}
                className={`font-sans text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border cursor-pointer transition-all ${order.status === s ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e0e0e0] hover:border-black'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Infos commande */}
        <div className="grid grid-cols-2 gap-4">
          {/* Produits */}
          <div className="bg-white border border-[#e8e8e8] px-4 py-4 col-span-2">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Articles ({order.items?.length})</p>
            <div className="flex flex-col gap-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-0">
                  <div>
                    <p className="font-sans text-[12px] font-medium text-black">{item.product_name}</p>
                    {item.variant_label && <p className="font-sans text-[10px] text-[#888]">{item.variant_label}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[12px] text-black">×{item.quantity}</p>
                    <p className="font-sans text-[11px] text-[#888]">{fmt(item.total_price)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex flex-col gap-1">
                <div className="flex justify-between font-sans text-[11px] text-[#555]"><span>Sous-total</span><span>{fmt(order.subtotal)}</span></div>
                {order.discount_amount > 0 && <div className="flex justify-between font-sans text-[11px] text-green-700"><span>Réduction</span><span>-{fmt(order.discount_amount)}</span></div>}
                <div className="flex justify-between font-sans text-[11px] text-[#555]"><span>Livraison</span><span>{order.shipping_amount === 0 ? 'Gratuite' : fmt(order.shipping_amount)}</span></div>
                <div className="flex justify-between font-sans text-[13px] font-medium text-black border-t border-[#e8e8e8] pt-2 mt-1"><span>TOTAL</span><span>{fmt(order.total)}</span></div>
              </div>
            </div>
          </div>

          {/* Adresse livraison */}
          {addr && (
            <div className="bg-white border border-[#e8e8e8] px-4 py-4">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Livraison</p>
              <div className="font-sans text-[12px] font-light text-[#555] leading-relaxed">
                <p className="font-medium text-black">{addr.firstName} {addr.lastName}</p>
                <p>{addr.address1}</p>
                {addr.address2 && <p>{addr.address2}</p>}
                <p>{addr.zip} {addr.city}</p>
                <p>{addr.country}</p>
                {addr.phone && <p>{addr.phone}</p>}
              </div>
            </div>
          )}

          {/* Client */}
          <div className="bg-white border border-[#e8e8e8] px-4 py-4">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Client</p>
            <div className="font-sans text-[12px] font-light text-[#555] leading-relaxed">
              <p className="font-medium text-black">{order.customer?.first_name ?? ''} {order.customer?.last_name ?? ''}</p>
              <p>{order.customer?.email ?? order.guest_email}</p>
              <p>Paiement : {order.payment_method}</p>
              {order.promo_code && <p>Code promo : <strong>{order.promo_code}</strong></p>}
            </div>
          </div>
        </div>

        {/* Numéro de suivi */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-4">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Numéro de suivi</p>
          <div className="flex gap-2">
            <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Ex: 1Z999AA10123456784"
              className="flex-1 px-3 py-2.5 border border-[#e0e0e0] font-sans text-[12px] outline-none focus:border-black" />
            <button onClick={() => updateOrder({ tracking_number: tracking, status: tracking ? 'shipped' : order.status })} disabled={saving}
              className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 border-none cursor-pointer hover:opacity-85">
              <Save size={13}/> Sauvegarder
            </button>
          </div>
        </div>

        {/* Note admin */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-4">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Note interne</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Note visible uniquement par l'admin..."
            className="w-full px-3 py-2.5 border border-[#e0e0e0] font-sans text-[12px] outline-none focus:border-black resize-none mb-2" />
          <button onClick={() => updateOrder({ admin_note: note })} disabled={saving}
            className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2 border-none cursor-pointer hover:opacity-85">
            <Save size={13}/> Sauvegarder
          </button>
        </div>

        {/* Historique statuts */}
        {history.length > 0 && (
          <div className="bg-white border border-[#e8e8e8] px-4 py-4">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Historique</p>
            <div className="flex flex-col gap-2">
              {history.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between font-sans text-[11px]">
                  <span className="text-black font-medium uppercase tracking-[0.08em]">{h.status}</span>
                  <span className="text-[#888]">{fmtDate(h.created_at)} — {h.created_by}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
