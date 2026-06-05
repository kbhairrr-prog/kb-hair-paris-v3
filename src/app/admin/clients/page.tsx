'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const VIP_COLORS: Record<string,string> = {
  none:'bg-gray-100 text-gray-500', bronze:'bg-orange-100 text-orange-700',
  silver:'bg-gray-200 text-gray-700', gold:'bg-yellow-100 text-yellow-700',
}

export default function AdminClients() {
  const [clients,  setClients]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [vipFilter,setVipFilter]= useState('all')
  const [selected, setSelected] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(100)
    if (vipFilter !== 'all') q = q.eq('vip_level', vipFilter)
    if (search) q = q.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    const { data } = await q
    setClients(data ?? [])
    setLoading(false)
  }, [search, vipFilter])

  useEffect(() => { load() }, [load])

  const updateVip = async (id: string, level: string) => {
    await supabase.from('customers').update({ vip_level: level, updated_at: new Date().toISOString() }).eq('id', id)
    setClients(cs => cs.map(c => c.id === id ? { ...c, vip_level: level } : c))
    if (selected?.id === id) setSelected((s: any) => ({ ...s, vip_level: level }))
  }

  const fmt = (n: number) => `€${(n ?? 0).toFixed(2).replace('.', ',')}`
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex">
      {/* Liste */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4">
          <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Clients</h1>
        </div>
        <div className="px-4 py-4">
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"/>
            </div>
            <select value={vipFilter} onChange={e => setVipFilter(e.target.value)} className="px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black">
              <option value="all">Tous niveaux</option>
              <option value="none">Standard</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>

          <div className="bg-white border border-[#e8e8e8] overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-[#e8e8e8]">
                  {['Client','Email','Commandes','Total dépensé','VIP','Inscrit le'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-[#888]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {loading ? Array.from({length:5}).map((_,i) => (
                  <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[#f0f0f0] rounded animate-pulse"/></td>)}</tr>
                )) : clients.map(c => (
                  <tr key={c.id} onClick={() => setSelected(c)} className="hover:bg-[#fafafa] cursor-pointer">
                    <td className="px-4 py-3 font-sans text-[12px] font-medium text-black">
                      {c.first_name ? `${c.first_name} ${c.last_name ?? ''}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-3 font-sans text-[11px] text-[#555]">{c.email}</td>
                    <td className="px-4 py-3 font-sans text-[11px] text-[#555]">{c.order_count ?? 0}</td>
                    <td className="px-4 py-3 font-sans text-[12px] font-medium text-black">{fmt(c.total_spent)}</td>
                    <td className="px-4 py-3">
                      <select value={c.vip_level ?? 'none'} onClick={e => e.stopPropagation()} onChange={e => updateVip(c.id, e.target.value)}
                        className={`font-sans text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border-none cursor-pointer ${VIP_COLORS[c.vip_level ?? 'none']}`}>
                        <option value="none">Standard</option>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-sans text-[11px] text-[#555]">{fmtDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && clients.length === 0 && <p className="px-4 py-8 text-center font-sans text-[12px] text-[#aaa]">Aucun client</p>}
          </div>
        </div>
      </div>

      {/* Panneau détail client */}
      {selected && (
        <div className="w-72 bg-white border-l border-[#e8e8e8] p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">Détail client</p>
            <button onClick={() => setSelected(null)} className="text-[#aaa] hover:text-black bg-transparent border-0 cursor-pointer text-lg leading-none">×</button>
          </div>
          <div className="flex flex-col gap-2 text-[12px] font-sans">
            <div className="flex justify-between"><span className="text-[#888]">Nom</span><span className="text-black font-medium">{selected.first_name ?? '—'} {selected.last_name ?? ''}</span></div>
            <div className="flex justify-between"><span className="text-[#888]">Email</span><span className="text-black text-[11px] break-all">{selected.email}</span></div>
            <div className="flex justify-between"><span className="text-[#888]">Téléphone</span><span className="text-black">{selected.phone ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-[#888]">Langue</span><span className="text-black uppercase">{selected.locale ?? 'fr'}</span></div>
            <div className="h-px bg-[#e8e8e8] my-1"/>
            <div className="flex justify-between"><span className="text-[#888]">Commandes</span><span className="text-black font-medium">{selected.order_count ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#888]">Total dépensé</span><span className="text-black font-medium">{fmt(selected.total_spent)}</span></div>
            <div className="flex justify-between"><span className="text-[#888]">Points</span><span className="text-black">{selected.points ?? 0}</span></div>
            <div className="h-px bg-[#e8e8e8] my-1"/>
            <div>
              <p className="text-[#888] mb-1.5">Niveau VIP</p>
              <select value={selected.vip_level ?? 'none'} onChange={e => updateVip(selected.id, e.target.value)}
                className="w-full px-2 py-1.5 border border-[#e0e0e0] font-sans text-[11px] outline-none focus:border-black">
                <option value="none">Standard</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            {selected.notes !== undefined && (
              <div>
                <p className="text-[#888] mb-1.5">Notes admin</p>
                <textarea defaultValue={selected.notes ?? ''} rows={3}
                  onBlur={async e => {
                    await supabase.from('customers').update({ notes: e.target.value }).eq('id', selected.id)
                  }}
                  className="w-full px-2 py-1.5 border border-[#e0e0e0] font-sans text-[11px] resize-none outline-none focus:border-black" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
