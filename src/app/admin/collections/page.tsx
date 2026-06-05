'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, Eye, EyeOff, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import RichEditor from '@/components/ui/RichEditor'

async function uploadImage(file: File, slug: string, type: string) {
  const ext = file.name.split('.').pop()
  const path = 'collections/' + (slug || 'col') + '-' + type + '-' + Date.now() + '.' + ext
  const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
  if (error) { alert('Erreur upload: ' + error.message); return null }
  const { data } = supabase.storage.from('products').getPublicUrl(path)
  return data.publicUrl
}

export default function AdminCollections() {
  const [cats,    setCats]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [isNew,   setIsNew]   = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('position')
    setCats(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const startNew = () => {
    setEditing({ slug:'', name_fr:'', name_en:'', description_fr:'', description_en:'', image_url:'', banner_url:'', is_active:true, position: cats.length })
    setIsNew(true)
  }

  const save = async () => {
    setSaving(true)
    if (isNew) {
      await supabase.from('categories').insert(editing)
    } else {
      await supabase.from('categories').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id)
    }
    await load()
    setEditing(null); setIsNew(false); setSaving(false)
  }

  const toggle = async (id: string, current: boolean) => {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id)
    setCats(cs => cs.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const del = async (id: string) => {
    if (!confirm('Supprimer cette collection ?')) return
    await supabase.from('categories').delete().eq('id', id)
    setCats(cs => cs.filter(c => c.id !== id))
  }

  const upd = (field: string, val: any) => setEditing((e: any) => ({ ...e, [field]: val }))
  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
  const labelCls = "font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Collections</h1>
        <button onClick={startNew} className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85">
          <Plus size={14}/> Nouvelle collection
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          {loading ? <p className="font-sans text-[12px] text-[#aaa] py-8 text-center">Chargement...</p> : cats.map(cat => (
            <div key={cat.id} className={"bg-white border mb-2 px-4 py-3 flex items-center justify-between " + (editing?.id === cat.id ? "border-black" : "border-[#e8e8e8]")}>
              <div>
                <p className="font-sans text-[12px] font-medium text-black">{cat.name_fr}</p>
                <p className="font-sans text-[10px] text-[#888]">/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(cat.id, cat.is_active)} className={"font-sans text-[10px] bg-transparent border-0 cursor-pointer " + (cat.is_active ? "text-green-600" : "text-[#aaa]")}>
                  {cat.is_active ? <Eye size={14}/> : <EyeOff size={14}/>}
                </button>
                <button onClick={() => { setEditing(cat); setIsNew(false) }} className="text-[#888] hover:text-black bg-transparent border-0 cursor-pointer font-sans text-[11px]">
                  Modifier
                </button>
                <button onClick={() => del(cat.id)} className="text-[#aaa] hover:text-red-600 bg-transparent border-0 cursor-pointer"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="bg-white border border-[#e8e8e8] px-5 py-5">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">
              {isNew ? "Nouvelle collection" : "Modifier"}
            </p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Nom FR *</label><input value={editing.name_fr} onChange={e => upd("name_fr", e.target.value)} className={inputCls}/></div>
                <div><label className={labelCls}>Nom EN</label><input value={editing.name_en} onChange={e => upd("name_en", e.target.value)} className={inputCls}/></div>
              </div>
              <div><label className={labelCls}>Slug (URL) *</label><input value={editing.slug} onChange={e => upd("slug", e.target.value)} placeholder="wigs" className={inputCls}/></div>
              <div><label className={labelCls}>Description FR</label><RichEditor value={editing.description_fr ?? ""} onChange={(val) => upd("description_fr", val)} rows={4} /></div>
              <div><label className={labelCls}>Description EN</label><RichEditor value={editing.description_en ?? ""} onChange={(val) => upd("description_en", val)} rows={4} /></div>

              <div>
                <label className={labelCls}>Image vignette</label>
                <div className="flex gap-2">
                  <input value={editing.image_url ?? ""} onChange={e => upd("image_url", e.target.value)} placeholder="https://..." className={inputCls + " flex-1"}/>
                  <label className="flex-shrink-0 flex items-center gap-1 px-3 border border-[#e0e0e0] font-sans text-[10px] uppercase cursor-pointer hover:border-black">
                    ↑ Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      const url = await uploadImage(file, editing.slug, "vignette")
                      if (url) upd("image_url", url)
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Bannière</label>
                <div className="flex gap-2">
                  <input value={editing.banner_url ?? ""} onChange={e => upd("banner_url", e.target.value)} placeholder="https://..." className={inputCls + " flex-1"}/>
                  <label className="flex-shrink-0 flex items-center gap-1 px-3 border border-[#e0e0e0] font-sans text-[10px] uppercase cursor-pointer hover:border-black">
                    ↑ Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      const url = await uploadImage(file, editing.slug, "banniere")
                      if (url) upd("banner_url", url)
                    }} />
                  </label>
                </div>
              </div>

              <div><label className={labelCls}>Position</label><input type="number" value={editing.position} onChange={e => upd("position", parseInt(e.target.value))} className={inputCls}/></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={e => upd("is_active", e.target.checked)}/>
                <span className="font-sans text-[12px] text-[#555]">Collection active (visible)</span>
              </label>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85">
                  <Save size={13}/> {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
                <button onClick={() => { setEditing(null); setIsNew(false) }} className="font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border border-[#e0e0e0] bg-white cursor-pointer">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
