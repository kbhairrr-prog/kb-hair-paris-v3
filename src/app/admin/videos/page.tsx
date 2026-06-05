'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminVideos() {
  const [videos,  setVideos]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm,setShowForm]= useState(false)
  const [form, setForm] = useState({
    title:       '',
    url:         '',
    thumbnail:   '',
    caption_fr:  '',
    caption_en:  '',
    placement:   'homepage', // homepage | product
    is_active:   true,
  })
  const [saving, setSaving] = useState(false)

  // Utilise site_settings pour stocker les vidéos
  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'videos').single()
    setVideos((data?.value as any[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (newList: any[]) => {
    await supabase.from('site_settings').upsert(
      { key: 'videos', value: newList, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    setVideos(newList)
  }

  const addVideo = async () => {
    setSaving(true)
    const newVideo = { ...form, id: Date.now().toString(), created_at: new Date().toISOString() }
    await save([...videos, newVideo])
    setShowForm(false)
    setForm({ title:'', url:'', thumbnail:'', caption_fr:'', caption_en:'', placement:'homepage', is_active:true })
    setSaving(false)
  }

  const toggleVideo = async (id: string) => {
    const updated = videos.map(v => v.id === id ? { ...v, is_active: !v.is_active } : v)
    await save(updated)
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('Supprimer cette vidéo ?')) return
    await save(videos.filter(v => v.id !== id))
  }

  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
  const labelCls = "font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Vidéos</h1>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85">
          <Plus size={14}/> Ajouter une vidéo
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Formulaire */}
        {showForm && (
          <div className="bg-white border border-[#e8e8e8] px-5 py-5 mb-5">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">Nouvelle vidéo</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2"><label className={labelCls}>Titre</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Vidéo homepage" className={inputCls}/></div>
              <div className="col-span-2">
                <label className={labelCls}>URL vidéo (YouTube, Vimeo, MP4...)</label>
                <div className="flex gap-2">
                  <input value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="https://..." className={inputCls + " flex-1"}/>
                  <label className="flex-shrink-0 flex items-center gap-1 px-3 border border-[#e0e0e0] font-sans text-[10px] uppercase cursor-pointer hover:border-black">
                    ↑ MP4
                    <input type="file" accept="video/mp4,video/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      if (file.size > 50 * 1024 * 1024) { alert('Fichier trop lourd (max 50Mo). Compressez d abord avec clideo.com'); return }
                      const path = 'videos/' + Date.now() + '-' + file.name
                      const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
                      if (error) { alert('Erreur: ' + error.message); return }
                      const { data } = supabase.storage.from('products').getPublicUrl(path)
                      setForm(f => ({...f, url: data.publicUrl}))
                    }} />
                  </label>
                </div>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Image de couverture</label>
                <div className="flex gap-2">
                  <input value={form.thumbnail} onChange={e => setForm(f => ({...f, thumbnail: e.target.value}))} placeholder="https://..." className={inputCls + " flex-1"}/>
                  <label className="flex-shrink-0 flex items-center gap-1 px-3 border border-[#e0e0e0] font-sans text-[10px] uppercase cursor-pointer hover:border-black">
                    ↑ Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      const path = 'videos/thumb-' + Date.now() + '.' + file.name.split('.').pop()
                      const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
                      if (error) { alert('Erreur: ' + error.message); return }
                      const { data } = supabase.storage.from('products').getPublicUrl(path)
                      setForm(f => ({...f, thumbnail: data.publicUrl}))
                    }} />
                  </label>
                </div>
              </div>
              <div><label className={labelCls}>Légende FR</label><input value={form.caption_fr} onChange={e => setForm(f => ({...f, caption_fr: e.target.value}))} placeholder="South of Asia Raw Hair" className={inputCls}/></div>
              <div><label className={labelCls}>Légende EN</label><input value={form.caption_en} onChange={e => setForm(f => ({...f, caption_en: e.target.value}))} placeholder="South of Asia Raw Hair" className={inputCls}/></div>
              <div>
                <label className={labelCls}>Emplacement</label>
                <select value={form.placement} onChange={e => setForm(f => ({...f, placement: e.target.value}))} className={inputCls}>
                  <option value="homepage">Homepage</option>
                  <option value="product">Fiche produit</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addVideo} disabled={saving || !form.url}
                className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85 disabled:opacity-40">
                <Save size={13}/> {saving ? 'Sauvegarde...' : 'Ajouter'}
              </button>
              <button onClick={() => setShowForm(false)} className="font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border border-[#e0e0e0] bg-white cursor-pointer">Annuler</button>
            </div>
          </div>
        )}

        {/* Liste vidéos */}
        {loading ? (
          <p className="text-center font-sans text-[12px] text-[#aaa] py-8">Chargement...</p>
        ) : videos.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e0e0e0] px-4 py-12 text-center">
            <p className="font-sans text-[12px] text-[#aaa]">Aucune vidéo. Ajoutez votre première vidéo.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {videos.map(video => (
              <div key={video.id} className="bg-white border border-[#e8e8e8] px-4 py-3 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-12 bg-[#f5f5f5] flex-shrink-0 overflow-hidden relative">
                  {video.thumbnail
                    ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[#ccc] text-2xl">▶</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-medium text-black truncate">{video.title || video.url}</p>
                  <p className="font-sans text-[10px] text-[#888] mt-0.5">
                    {video.placement} · {video.caption_fr}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleVideo(video.id)}
                    className={`font-sans text-[10px] bg-transparent border-0 cursor-pointer ${video.is_active ? 'text-green-600' : 'text-[#aaa]'}`}>
                    {video.is_active ? <Eye size={15}/> : <EyeOff size={15}/>}
                  </button>
                  <button onClick={() => deleteVideo(video.id)} className="text-[#aaa] hover:text-red-600 bg-transparent border-0 cursor-pointer">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
