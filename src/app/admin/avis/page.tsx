'use client'

import { useState, useEffect } from 'react'
import { Check, X, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminAvis() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'pending' | 'approved' | 'all'>('pending')

  const load = async () => {
    setLoading(true)
    let q = supabase.from('product_reviews')
      .select('*, product:products(name_fr), customer:customers(first_name,last_name,email)')
      .order('created_at', { ascending: false })
    if (filter === 'pending')  q = q.eq('is_approved', false)
    if (filter === 'approved') q = q.eq('is_approved', true)
    const { data } = await q
    setReviews(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const approve = async (id: string) => {
    await supabase.from('product_reviews').update({ is_approved: true }).eq('id', id)
    setReviews(rs => rs.filter(r => r.id !== id))
  }

  const reject = async (id: string) => {
    await supabase.from('product_reviews').delete().eq('id', id)
    setReviews(rs => rs.filter(r => r.id !== id))
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')
  const pendingCount = reviews.filter(r => !r.is_approved).length

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Avis clients</h1>
          {filter === 'pending' && pendingCount > 0 && (
            <p className="font-sans text-[11px] text-orange-600 mt-0.5">{pendingCount} avis en attente de modération</p>
          )}
        </div>
        <div className="flex gap-2">
          {(['pending','approved','all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`font-sans text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border cursor-pointer transition-all ${filter === f ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e0e0e0] hover:border-black'}`}>
              {f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-6 py-5">
        {loading ? (
          <p className="text-center font-sans text-[12px] text-[#aaa] py-8">Chargement...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center font-sans text-[12px] text-[#aaa] py-8">Aucun avis</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-[#e8e8e8] px-4 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-black">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className={`font-sans text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.is_approved ? 'Approuvé' : 'En attente'}
                      </span>
                    </div>
                    <p className="font-sans text-[12px] font-medium text-black">{review.product?.name_fr ?? '—'}</p>
                    <p className="font-sans text-[11px] text-[#888]">
                      {review.customer?.first_name ?? '—'} {review.customer?.last_name ?? ''} · {review.customer?.email ?? ''} · {fmtDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!review.is_approved && (
                      <button onClick={() => approve(review.id)} className="flex items-center gap-1 font-sans text-[10px] tracking-[0.1em] uppercase text-green-600 hover:text-green-800 bg-transparent border-0 cursor-pointer">
                        <Check size={14}/> Approuver
                      </button>
                    )}
                    <button onClick={() => reject(review.id)} className="flex items-center gap-1 font-sans text-[10px] tracking-[0.1em] uppercase text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer">
                      <Trash2 size={14}/> Supprimer
                    </button>
                  </div>
                </div>
                {review.title && <p className="font-sans text-[12px] font-medium text-black mb-1">"{review.title}"</p>}
                {review.body  && <p className="font-sans text-[12px] font-light text-[#555] leading-relaxed">{review.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
