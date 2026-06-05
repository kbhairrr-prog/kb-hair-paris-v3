'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Edit2, Save, X, Plus, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SECTION_TYPES = [
  { type: 'hero',         label: 'Hero principal' },
  { type: 'banner',       label: 'Bannière texte' },
  { type: 'collection',   label: 'Grille collections' },
  { type: 'carousel',     label: 'Carrousel produits' },
  { type: 'video',        label: 'Section vidéo' },
  { type: 'text',         label: 'Bloc texte' },
  { type: 'testimonials', label: 'Avis clients' },
  { type: 'newsletter',   label: 'Newsletter' },
]

export default function AdminHomepage() {
  const [sections, setSections] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    supabase.from('homepage_sections').select('*').order('position')
      .then(({ data }) => { setSections(data ?? []); setLoading(false) })
  }, [])

  const toggleSection = async (id: string, current: boolean) => {
    await supabase.from('homepage_sections').update({ is_active: !current }).eq('id', id)
    setSections(ss => ss.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const startEdit = (section: any) => {
    setEditing(section.id)
    setEditData(section.content)
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('homepage_sections').update({ content: editData, updated_at: new Date().toISOString() }).eq('id', editing)
    setSections(ss => ss.map(s => s.id === editing ? { ...s, content: editData } : s))
    setEditing(null)
    setSaving(false)
  }

  const moveSection = async (id: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === sections.length - 1) return
    const next = [...sections]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    // Mettre à jour positions
    const updates = next.map((s, i) => supabase.from('homepage_sections').update({ position: i }).eq('id', s.id))
    await Promise.all(updates)
    setSections(next.map((s, i) => ({ ...s, position: i })))
  }

  const addSection = async (type: string) => {
    const position = sections.length
    const defaultContent: Record<string, any> = {
      hero:    { title_fr: 'Nouveau hero', title_en: 'New hero', cta_url: '/fr/collections', image_url: '' },
      banner:  { text_fr: 'Votre texte ici', text_en: 'Your text here', bg_color: '#1a1a1a', text_color: '#ffffff' },
      video:   { video_url: '', caption_fr: '', caption_en: '' },
      text:    { title_fr: '', title_en: '', content_fr: '', content_en: '' },
    }
    const { data } = await supabase.from('homepage_sections').insert({
      type, position, is_active: false,
      content: defaultContent[type] ?? {},
    }).select().single()
    if (data) setSections(ss => [...ss, data])
  }

  const deleteSection = async (id: string) => {
    if (!confirm('Supprimer cette section ?')) return
    await supabase.from('homepage_sections').delete().eq('id', id)
    setSections(ss => ss.filter(s => s.id !== id))
  }

  const inputCls = "w-full px-3 py-2 border border-[#e0e0e0] font-sans text-[12px] outline-none focus:border-black"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Page Builder — Homepage</h1>
        <a href="/fr" target="_blank" className="font-sans text-[11px] tracking-[0.1em] uppercase text-[#888] hover:text-black no-underline">
          Voir le site →
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-3">

        {/* Ajouter section */}
        <div className="bg-white border border-[#e8e8e8] px-4 py-4">
          <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Ajouter une section</p>
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map(st => (
              <button key={st.type} onClick={() => addSection(st.type)}
                className="flex items-center gap-1 font-sans text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-[#e0e0e0] hover:border-black bg-white cursor-pointer transition-colors">
                <Plus size={11} /> {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste sections */}
        {loading ? (
          <p className="text-center font-sans text-[12px] text-[#aaa] py-8">Chargement...</p>
        ) : sections.map((section, idx) => (
          <div key={section.id} className={`bg-white border ${section.is_active ? 'border-[#e8e8e8]' : 'border-dashed border-[#ddd]'}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0} className="text-[#aaa] hover:text-black disabled:opacity-20 bg-transparent border-0 cursor-pointer text-xs leading-none">▲</button>
                  <button onClick={() => moveSection(section.id, 'down')} disabled={idx === sections.length-1} className="text-[#aaa] hover:text-black disabled:opacity-20 bg-transparent border-0 cursor-pointer text-xs leading-none">▼</button>
                </div>
                <div>
                  <p className="font-sans text-[11px] font-medium tracking-[0.1em] uppercase text-black">
                    {SECTION_TYPES.find(t => t.type === section.type)?.label ?? section.type}
                  </p>
                  <p className="font-sans text-[10px] text-[#aaa]">Position {section.position + 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSection(section.id, section.is_active)}
                  className={`flex items-center gap-1 font-sans text-[10px] tracking-[0.08em] uppercase bg-transparent border-0 cursor-pointer ${section.is_active ? 'text-green-600' : 'text-[#aaa]'}`}>
                  {section.is_active ? <Eye size={13}/> : <EyeOff size={13}/>}
                  {section.is_active ? 'Visible' : 'Masquée'}
                </button>
                <button onClick={() => startEdit(section)} className="text-[#888] hover:text-black bg-transparent border-0 cursor-pointer"><Edit2 size={14}/></button>
                <button onClick={() => deleteSection(section.id)} className="text-[#888] hover:text-red-600 bg-transparent border-0 cursor-pointer">×</button>
              </div>
            </div>

            {/* Éditeur inline */}
            {editing === section.id && (
              <div className="px-4 py-4">
                <div className="flex flex-col gap-3">
                  {Object.entries(editData).map(([key, value]) => (
                    <div key={key}>
                      <label className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block">{key}</label>
                      {(key === 'image_url' || key === 'video_url') ? (
                        <div className="flex gap-2">
                          <input value={value as string}
                            onChange={e => setEditData((d: any) => ({ ...d, [key]: e.target.value }))}
                            placeholder="https://..." className={inputCls + ' flex-1'} />
                          <label className="flex-shrink-0 flex items-center gap-1 px-3 border border-[#e0e0e0] font-sans text-[10px] uppercase cursor-pointer hover:border-black">
                            {key === 'video_url' ? '↑ MP4' : '↑ Photo'}
                            <input type="file" accept={key === 'video_url' ? 'video/*' : 'image/*'} className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]; if (!file) return
                                if (key === 'video_url' && file.size > 50 * 1024 * 1024) { alert('Max 50Mo'); return }
                                const { supabase: sb } = await import('@/lib/supabase')
                                const path = 'homepage/' + key + '-' + Date.now() + '.' + file.name.split('.').pop()
                                const { error } = await sb.storage.from('products').upload(path, file, { upsert: true })
                                if (error) { alert('Erreur: ' + error.message); return }
                                const { data } = sb.storage.from('products').getPublicUrl(path)
                                setEditData((d: any) => ({ ...d, [key]: data.publicUrl }))
                              }} />
                          </label>
                        </div>
                      ) : typeof value === 'string' && value.length > 60 ? (
                        <textarea value={value as string} rows={3}
                          onChange={e => setEditData((d: any) => ({ ...d, [key]: e.target.value }))}
                          className={`${inputCls} resize-none`} />
                      ) : typeof value === 'boolean' ? (
                        <input type="checkbox" checked={value as boolean}
                          onChange={e => setEditData((d: any) => ({ ...d, [key]: e.target.checked }))} />
                      ) : (
                        <input value={String(value)} type={key.includes('color') ? 'color' : 'text'}
                          onChange={e => setEditData((d: any) => ({ ...d, [key]: e.target.value }))}
                          className={inputCls} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={saveEdit} disabled={saving}
                    className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85">
                    <Save size={13}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border border-[#e0e0e0] bg-white cursor-pointer hover:border-black">
                    <X size={13}/> Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
