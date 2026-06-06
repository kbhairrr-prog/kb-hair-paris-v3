'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Save, Trash2 } from 'lucide-react'

export default function AdminFooter() {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('footer_links').select('*').order('position')
    setLinks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const upd = (id: string, field: string, val: any) => {
    setLinks(ls => ls.map(l => l.id === id ? { ...l, [field]: val } : l))
  }

  const save = async () => {
    setSaving(true)
    for (const link of links) {
      const { isNew, ...data } = link
      if (isNew) {
        await supabase.from('footer_links').insert(data)
      } else {
        await supabase.from('footer_links').update(data).eq('id', data.id)
      }
    }
    await load()
    setSaving(false)
    alert('Sauvegardé !')
  }

  const add = () => {
    setLinks(ls => [...ls, {
      id: crypto.randomUUID(),
      label_fr: '', label_en: '',
      href_fr: '/fr/pages/', href_en: '/en/pages/',
      position: ls.length, is_active: true, isNew: true
    }])
  }

  const del = async (id: string, isNew: boolean) => {
    if (!isNew) await supabase.from('footer_links').delete().eq('id', id)
    setLinks(ls => ls.filter(l => l.id !== id))
  }

  const inputCls = "w-full px-3 py-2 border border-[#e0e0e0] font-sans text-[11px] outline-none focus:border-black"
  const labelCls = "font-sans text-[9px] tracking-[0.15em] uppercase text-[#888] mb-0.5 block"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Liens Footer</h1>
          <p className="font-sans text-[10px] text-[#888] mt-0.5">Gérer les liens affichés en bas du site</p>
        </div>
        <div className="flex gap-2">
          <button onClick={add} className="flex items-center gap-2 bg-white text-black font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border border-black cursor-pointer hover:bg-black hover:text-white transition-colors">
            <Plus size={13}/> Ajouter
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85">
            <Save size={13}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <p className="font-sans text-[12px] text-[#aaa] text-center py-8">Chargement...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map((link, i) => (
              <div key={link.id} className="bg-white border border-[#e8e8e8] px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans text-[10px] text-[#aaa]">Lien #{i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={link.is_active} onChange={e => upd(link.id, 'is_active', e.target.checked)}/>
                      <span className="font-sans text-[10px] text-[#555]">Actif</span>
                    </label>
                    <button onClick={() => del(link.id, link.isNew)} className="text-[#aaa] hover:text-red-600 bg-transparent border-none cursor-pointer">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Libellé FR</label>
                    <input value={link.label_fr} onChange={e => upd(link.id, 'label_fr', e.target.value)} className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Libellé EN</label>
                    <input value={link.label_en} onChange={e => upd(link.id, 'label_en', e.target.value)} className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>URL FR</label>
                    <input value={link.href_fr} onChange={e => upd(link.id, 'href_fr', e.target.value)} className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>URL EN</label>
                    <input value={link.href_en} onChange={e => upd(link.id, 'href_en', e.target.value)} className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Position</label>
                    <input type="number" value={link.position} onChange={e => upd(link.id, 'position', parseInt(e.target.value))} className={inputCls}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
