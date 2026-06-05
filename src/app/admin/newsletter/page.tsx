'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [localeFilter,setLocaleFilter]= useState('all')

  const load = async () => {
    setLoading(true)
    let q = supabase.from('newsletter').select('*').order('created_at', { ascending: false })
    if (localeFilter !== 'all') q = q.eq('locale', localeFilter)
    if (search) q = q.ilike('email', `%${search}%`)
    const { data } = await q
    setSubscribers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [localeFilter, search])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('newsletter').update({ is_active: !current }).eq('id', id)
    setSubscribers(ss => ss.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Désabonner et supprimer ?')) return
    await supabase.from('newsletter').delete().eq('id', id)
    setSubscribers(ss => ss.filter(s => s.id !== id))
  }

  const exportCSV = () => {
    const active = subscribers.filter(s => s.is_active)
    const csv = ['email,locale,source,date'].concat(
      active.map(s => `${s.email},${s.locale},${s.source},${new Date(s.created_at).toLocaleDateString('fr-FR')}`)
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `newsletter-kbhair-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')
  const activeCount = subscribers.filter(s => s.is_active).length

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Newsletter</h1>
          <p className="font-sans text-[11px] text-[#888] mt-0.5">{activeCount} abonné(s) actif(s)</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85">
          <Download size={14} /> Exporter CSV
        </button>
      </div>

      <div className="px-4 lg:px-6 py-5">
        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total',  value: subscribers.length },
            { label: 'Actifs', value: activeCount },
            { label: 'FR',     value: subscribers.filter(s => s.locale === 'fr' && s.is_active).length },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-[#e8e8e8] px-4 py-3 text-center">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#888] mb-1">{stat.label}</p>
              <p className="font-sans text-[22px] font-light text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un email..."
              className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black" />
          </div>
          <select value={localeFilter} onChange={e => setLocaleFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black">
            <option value="all">Toutes langues</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="bg-white border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[#e8e8e8]">
                {['Email','Langue','Source','Date','Statut',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-[#888]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[#f0f0f0] rounded animate-pulse"/></td>)}</tr>
              )) : subscribers.map(s => (
                <tr key={s.id} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-sans text-[12px] text-black">{s.email}</td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#888] uppercase">{s.locale}</td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#888]">{s.source ?? 'website'}</td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#888]">{fmtDate(s.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(s.id, s.is_active)}
                      className={`font-sans text-[10px] tracking-[0.08em] uppercase bg-transparent border-0 cursor-pointer ${s.is_active ? 'text-green-600' : 'text-[#aaa]'}`}>
                      {s.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteSubscriber(s.id)} className="text-[#aaa] hover:text-red-600 bg-transparent border-0 cursor-pointer">
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && subscribers.length === 0 && <p className="px-4 py-8 text-center font-sans text-[12px] text-[#aaa]">Aucun abonné</p>}
        </div>
      </div>
    </div>
  )
}
