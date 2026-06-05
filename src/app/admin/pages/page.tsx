'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, Plus } from 'lucide-react'
import RichEditor from '@/components/ui/RichEditor'
import { supabase } from '@/lib/supabase'

const DEFAULT_PAGES = [
  { slug: 'cgv',              title_fr: 'Conditions Générales de Vente',  title_en: 'Terms of Sale' },
  { slug: 'mentions-legales', title_fr: 'Mentions Légales',               title_en: 'Legal Notice' },
  { slug: 'confidentialite',  title_fr: 'Politique de Confidentialité',   title_en: 'Privacy Policy' },
  { slug: 'livraison',        title_fr: 'Livraison & Retours',            title_en: 'Shipping & Returns' },
  { slug: 'qui-sommes-nous',  title_fr: 'Qui Sommes-Nous',               title_en: 'About Us' },
]

export default function AdminPages() {
  const [pages,   setPages]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected,setSelected]= useState<any | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [lang,    setLang]    = useState<'fr' | 'en'>('fr')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('pages').select('*').order('slug')
    // S'assurer que toutes les pages par défaut existent
    const existing = data ?? []
    const missing  = DEFAULT_PAGES.filter(dp => !existing.find(p => p.slug === dp.slug))
    if (missing.length > 0) {
      await supabase.from('pages').insert(
        missing.map(p => ({ ...p, content_fr: '<p>Contenu à compléter.</p>', content_en: '<p>Content to complete.</p>', is_active: true }))
      )
      const { data: fresh } = await supabase.from('pages').select('*').order('slug')
      setPages(fresh ?? [])
    } else {
      setPages(existing)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    await supabase.from('pages').update({
      title_fr:    selected.title_fr,
      title_en:    selected.title_en,
      content_fr:  selected.content_fr,
      content_en:  selected.content_en,
      seo_title_fr: selected.seo_title_fr,
      seo_title_en: selected.seo_title_en,
      seo_desc_fr:  selected.seo_desc_fr,
      seo_desc_en:  selected.seo_desc_en,
      is_active:   selected.is_active,
      updated_at:  new Date().toISOString(),
    }).eq('id', selected.id)
    setPages(ps => ps.map(p => p.id === selected.id ? selected : p))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const upd = (field: string, val: any) => setSelected((s: any) => ({ ...s, [field]: val }))
  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
  const labelCls = "font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {selected && (
        <div className="lg:hidden bg-white border-b border-[#e8e8e8] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="text-black bg-transparent border-none cursor-pointer font-sans text-[12px]">
            ← Retour
          </button>
          <span className="font-sans text-[12px] font-medium text-black truncate">{selected.title_fr}</span>
        </div>
      )}
      <div className="flex min-h-screen">
      <div className={(selected ? "hidden lg:flex lg:w-64" : "w-full lg:w-64") + " bg-white border-r border-[#e8e8e8] flex flex-col flex-shrink-0"}>
        <div className="px-4 py-4 border-b border-[#e8e8e8]">
          <h1 className="font-sans text-[13px] font-medium tracking-[0.1em] uppercase">Pages légales</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-4 font-sans text-[11px] text-[#aaa]">Chargement...</p>
          ) : pages.map(page => (
            <button
              key={page.id}
              onClick={() => { setSelected(page); setLang('fr') }}
              className={`w-full text-left px-4 py-3.5 border-b border-[#f0f0f0] transition-colors bg-transparent cursor-pointer ${selected?.id === page.id ? 'bg-[#f0f0f0]' : 'hover:bg-[#fafafa]'}`}
            >
              <p className="font-sans text-[12px] font-medium text-black leading-snug">{page.title_fr}</p>
              <p className="font-sans text-[10px] text-[#888] mt-0.5">/{page.slug}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`font-sans text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full ${page.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {page.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-sans text-[12px] text-[#aaa] tracking-[0.1em] uppercase">
              Sélectionnez une page à modifier
            </p>
          </div>
        ) : (
          <>
            {/* Header éditeur */}
            <div className="bg-white border-b border-[#e8e8e8] px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="font-sans text-[13px] font-medium tracking-[0.1em] uppercase text-black">
                  {selected.title_fr}
                </p>
                <p className="font-sans text-[10px] text-[#888] mt-0.5">/{selected.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                {saved && <span className="font-sans text-[11px] text-green-600">✓ Sauvegardé</span>}

                {/* Aperçu */}
                <a href={`/fr/pages/${selected.slug}`} target="_blank"
                  className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.12em] uppercase text-[#888] hover:text-black no-underline">
                  <Eye size={13} /> Aperçu
                </a>

                {/* Toggle actif */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selected.is_active} onChange={e => upd('is_active', e.target.checked)} className="w-4 h-4" />
                  <span className="font-sans text-[11px] text-[#555]">Active</span>
                </label>

                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-85 disabled:opacity-40">
                  <Save size={13} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Tabs langue */}
            <div className="flex bg-white border-b border-[#e8e8e8] flex-shrink-0">
              {(['fr', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-6 py-3 font-sans text-[10px] tracking-[0.15em] uppercase border-b-2 transition-colors bg-transparent cursor-pointer ${lang === l ? 'border-b-black text-black' : 'border-b-transparent text-[#aaa]'}`}
                  style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid' }}>
                  {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                </button>
              ))}
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

              {/* Titre */}
              <div>
                <label className={labelCls}>Titre {lang === 'fr' ? 'FR' : 'EN'}</label>
                <input
                  value={lang === 'fr' ? selected.title_fr ?? '' : selected.title_en ?? ''}
                  onChange={e => upd(lang === 'fr' ? 'title_fr' : 'title_en', e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Contenu HTML */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>Contenu {lang === 'fr' ? 'FR' : 'EN'} (HTML accepté)</label>

                  <label className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.1em] uppercase text-[#888] hover:text-black cursor-pointer border border-[#e0e0e0] px-2 py-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Photo
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !selected) return
                      const ext = file.name.split('.').pop()
                      const path = 'pages/' + selected.slug + '-' + Date.now() + '.' + ext
                      const { data, error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
                      if (error) { alert('Erreur: ' + error.message); return }
                      const { data: urlData } = supabase.storage.from('products').getPublicUrl(path)
                      const imgTag = '<img src="' + urlData.publicUrl + '" alt="" style="width:100%;max-width:500px;margin:20px auto;display:block;">'
                      const field = lang === 'fr' ? 'content_fr' : 'content_en'
                      upd(field, (selected[field] ?? '') + '\n' + imgTag)
                    }} />
                  </label>
                  <a href={`/fr/pages/${selected.slug}`} target="_blank"
                    className="font-sans text-[10px] tracking-[0.1em] uppercase text-[#888] hover:text-black no-underline">
                    Voir → 
                  </a>
                </div>
                <RichEditor
                  value={lang === 'fr' ? selected.content_fr ?? '' : selected.content_en ?? ''}
                  onChange={(val) => upd(lang === 'fr' ? 'content_fr' : 'content_en', val)}
                  rows={20}
                />
              </div>

              {/* SEO */}
              <div className="bg-[#fafafa] border border-[#e8e8e8] px-4 py-4">
                <p className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-black mb-3">SEO</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Meta titre {lang === 'fr' ? 'FR' : 'EN'}</label>
                    <input
                      value={lang === 'fr' ? selected.seo_title_fr ?? '' : selected.seo_title_en ?? ''}
                      onChange={e => upd(lang === 'fr' ? 'seo_title_fr' : 'seo_title_en', e.target.value)}
                      placeholder={lang === 'fr' ? `${selected.title_fr} | KB Hair Paris` : `${selected.title_en} | KB Hair Paris`}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Meta description {lang === 'fr' ? 'FR' : 'EN'}</label>
                    <textarea
                      value={lang === 'fr' ? selected.seo_desc_fr ?? '' : selected.seo_desc_en ?? ''}
                      onChange={e => upd(lang === 'fr' ? 'seo_desc_fr' : 'seo_desc_en', e.target.value)}
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Bouton sauvegarder bas */}
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-black text-white font-sans text-[11px] font-medium tracking-[0.22em] uppercase py-4 border-none cursor-pointer hover:opacity-85 disabled:opacity-40">
                {saving ? 'SAUVEGARDE EN COURS...' : 'SAUVEGARDER LES MODIFICATIONS'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
