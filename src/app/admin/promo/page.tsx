'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminPromo() {
  const [codes,   setCodes]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm,setShowForm]= useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order_amount: '0',
    max_uses: '', expires_at: '', is_influencer: false,
    influencer_name: '', influencer_email: '', description_fr: '', description_en: '',
  })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
    setCodes(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggleCode = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id)
    setCodes(cs => cs.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const deleteCode = async (id: string) => {
    if (!confirm('Supprimer ce code ?')) return
    await supabase.from('promo_codes').delete().eq('id', id)
    setCodes(cs => cs.filter(c => c.id !== id))
  }

  const handleCreate = async () => {
    const { error } = await supabase.from('promo_codes').insert({
      code:              form.code.toUpperCase().trim(),
      type:              form.type,
      value:             parseFloat(form.value),
      min_order_amount:  parseFloat(form.min_order_amount) || 0,
      max_uses:          form.max_uses ? parseInt(form.max_uses) : null,
      expires_at:        form.expires_at || null,
      is_influencer:     form.is_influencer,
      influencer_name:   form.influencer_name || null,
      influencer_email:  form.influencer_email || null,
      description_fr:    form.description_fr || null,
      description_en:    form.description_en || null,
      is_active:         true,
    })
    if (!error) { setShowForm(false); load() }
  }

  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Codes Promo</h1>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85">
          <Plus size={14}/> Nouveau code
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* Formulaire création */}
        {showForm && (
          <div className="bg-white border border-[#e8e8e8] px-5 py-5 mb-5">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">Nouveau code promo</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} placeholder="KBHAIR20" className={inputCls} />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className={inputCls}>
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (€)</option>
                  <option value="free_shipping">Livraison gratuite</option>
                </select>
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Valeur *</label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} placeholder={form.type === 'percentage' ? '20' : '15'} className={inputCls} />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Commande minimum (€)</label>
                <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({...f, min_order_amount: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Utilisations max</label>
                <input type="number" value={form.max_uses} onChange={e => setForm(f => ({...f, max_uses: e.target.value}))} placeholder="Illimité" className={inputCls} />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Expiration</label>
                <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Description FR</label>
                <input value={form.description_fr} onChange={e => setForm(f => ({...f, description_fr: e.target.value}))} placeholder="-20% sur toute la boutique" className={inputCls} />
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">Description EN</label>
                <input value={form.description_en} onChange={e => setForm(f => ({...f, description_en: e.target.value}))} placeholder="-20% sitewide" className={inputCls} />
              </div>
            </div>

            {/* Code influenceur */}
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={form.is_influencer} onChange={e => setForm(f => ({...f, is_influencer: e.target.checked}))} />
              <span className="font-sans text-[12px] text-[#555]">Code influenceur (tracking)</span>
            </label>

            {form.is_influencer && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={form.influencer_name} onChange={e => setForm(f => ({...f, influencer_name: e.target.value}))} placeholder="Nom de l'influenceur" className={inputCls} />
                <input value={form.influencer_email} onChange={e => setForm(f => ({...f, influencer_email: e.target.value}))} placeholder="Email" className={inputCls} />
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleCreate} className="bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85">
                Créer le code
              </button>
              <button onClick={() => setShowForm(false)} className="font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border border-[#e0e0e0] bg-white cursor-pointer">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste codes */}
        <div className="bg-white border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#e8e8e8]">
                {['Code','Type','Valeur','Min. commande','Utilisations','Expiration','Statut',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-[#888]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {loading ? (
                Array.from({length:3}).map((_,i) => (
                  <tr key={i}>{Array.from({length:8}).map((_,j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-[#f0f0f0] rounded animate-pulse"/></td>
                  ))}</tr>
                ))
              ) : codes.map(code => (
                <tr key={code.id} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[12px] font-medium text-black bg-[#f5f5f5] px-2 py-0.5">{code.code}</span>
                    {code.is_influencer && <span className="ml-2 font-sans text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5">influenceur</span>}
                  </td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#555]">{code.type}</td>
                  <td className="px-4 py-3 font-sans text-[12px] font-medium text-black">
                    {code.type === 'percentage' ? `${code.value}%` : code.type === 'fixed' ? `€${code.value}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#555]">€{code.min_order_amount}</td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#555]">
                    {code.used_count}{code.max_uses ? ` / ${code.max_uses}` : ' / ∞'}
                  </td>
                  <td className="px-4 py-3 font-sans text-[11px] text-[#555]">
                    {code.expires_at ? new Date(code.expires_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleCode(code.id, code.is_active)}
                      className={`flex items-center gap-1 font-sans text-[10px] uppercase bg-transparent border-0 cursor-pointer ${code.is_active ? 'text-green-600' : 'text-[#aaa]'}`}>
                      {code.is_active ? <><Eye size={12}/> Actif</> : <><EyeOff size={12}/> Inactif</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteCode(code.id)} className="text-[#aaa] hover:text-red-600 bg-transparent border-0 cursor-pointer">
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && codes.length === 0 && (
            <p className="px-4 py-8 text-center font-sans text-[12px] text-[#aaa]">Aucun code promo</p>
          )}
        </div>
      </div>
    </div>
  )
}
