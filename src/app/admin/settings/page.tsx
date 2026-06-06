'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Tab = 'brand' | 'shipping' | 'social' | 'seo'

export default function AdminSettings() {
  const [tab,     setTab]     = useState<Tab>('brand')
  const [data,    setData]    = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data: rows }) => {
      const map: Record<string, any> = {}
      rows?.forEach(r => { map[r.key] = r.value })
      setData(map)
      setLoading(false)
    })
  }, [])

  const updateField = (section: string, field: string, value: any) => {
    setData(d => ({ ...d, [section]: { ...d[section], [field]: value } }))
  }

  const save = async (section: string) => {
    setSaving(true)
    await supabase.from('site_settings').upsert(
      { key: section, value: data[section], updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
  const labelCls = "font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block"

  const TABS: { key: Tab; label: string }[] = [
    { key: 'brand',    label: 'Marque' },
    { key: 'shipping', label: 'Livraison' },
    { key: 'social',   label: 'Réseaux sociaux' },
    { key: 'seo',      label: 'SEO Global' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Paramètres du site</h1>
        {saved && <span className="font-sans text-[11px] text-green-600">✓ Sauvegardé</span>}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Tabs */}
        <div className="flex bg-white border border-[#e8e8e8] mb-5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-3 font-sans text-[10px] tracking-[0.15em] uppercase whitespace-nowrap border-b-2 transition-colors bg-transparent cursor-pointer ${tab === t.key ? 'border-b-black text-black' : 'border-b-transparent text-[#aaa]'}`}
              style={{ borderBottomWidth: '2px', borderBottomStyle: 'solid' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-center font-sans text-[12px] text-[#aaa] py-8">Chargement...</p> : (

          <div className="bg-white border border-[#e8e8e8] px-5 py-5">

            {/* ── MARQUE ── */}
            {tab === 'brand' && (
              <div className="flex flex-col gap-4">
                <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">Identité de marque</p>
                {[
                  { field: 'name',       label: 'Nom de la marque',   ph: 'KB Hair Paris' },
                  { field: 'tagline_fr', label: 'Slogan FR',          ph: 'L\'art de la beauté capillaire' },
                  { field: 'tagline_en', label: 'Slogan EN',          ph: 'The art of hair beauty' },
                  { field: 'email',      label: 'Email de contact',   ph: 'contact@kbhair.fr' },
                  { field: 'phone',      label: 'Téléphone / WhatsApp',ph: '+33 7 00 00 00 00' },
                  { field: 'address',    label: 'Adresse',            ph: 'Paris, France' },
                ].map(({ field, label, ph }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <input value={data.brand?.[field] ?? ''} onChange={e => updateField('brand', field, e.target.value)} placeholder={ph} className={inputCls} />
                  </div>
                ))}
                <button onClick={() => save('brand')} disabled={saving} className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85 w-fit">
                  <Save size={13}/> Sauvegarder
                </button>
              </div>
            )}

            {/* ── LIVRAISON ── */}
            {tab === 'shipping' && (
              <div className="flex flex-col gap-4">
                <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">Livraison</p>
                <div>
                  <label className={labelCls}>Seuil livraison gratuite (€)</label>
                  <input type="number" value={data.shipping?.free_threshold ?? 230} onChange={e => updateField('shipping', 'free_threshold', parseFloat(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Prix de livraison (€)</label>
                  <input type="number" value={data.shipping?.shipping_cost ?? 25} onChange={e => updateField('shipping', 'shipping_cost', parseFloat(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Délai FR</label>
                  <input value={data.shipping?.delay_fr ?? '3 à 5 jours ouvrés'} onChange={e => updateField('shipping', 'delay_fr', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Délai EN</label>
                  <input value={data.shipping?.delay_en ?? '3 to 5 business days'} onChange={e => updateField('shipping', 'delay_en', e.target.value)} className={inputCls} />
                </div>
                <button onClick={() => save('shipping')} disabled={saving} className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85 w-fit">
                  <Save size={13}/> Sauvegarder
                </button>
              </div>
            )}

            {/* ── RÉSEAUX SOCIAUX ── */}
            {tab === 'social' && (
              <div className="flex flex-col gap-4">
                <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">Réseaux sociaux</p>
                {[
                  { field: 'instagram', label: 'Instagram URL', ph: 'https://instagram.com/kbhairparis' },
                  { field: 'tiktok',    label: 'TikTok URL',    ph: 'https://tiktok.com/@kbhairparis' },
                  { field: 'facebook',  label: 'Facebook URL',  ph: 'https://facebook.com/kbhairparis' },
                  { field: 'youtube',   label: 'YouTube URL',   ph: 'https://youtube.com/@kbhairparis' },
                  { field: 'whatsapp',  label: 'WhatsApp',      ph: '+33 7 00 00 00 00' },
                ].map(({ field, label, ph }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <input value={data.social?.[field] ?? ''} onChange={e => updateField('social', field, e.target.value)} placeholder={ph} className={inputCls} />
                  </div>
                ))}
                <button onClick={() => save('social')} disabled={saving} className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85 w-fit">
                  <Save size={13}/> Sauvegarder
                </button>
              </div>
            )}

            {/* ── SEO ── */}
            {tab === 'seo' && (
              <div className="flex flex-col gap-4">
                <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">SEO Global</p>
                {[
                  { field: 'title_fr',       label: 'Meta titre FR',       ph: 'KB Hair Paris — Extensions & Perruques Premium' },
                  { field: 'title_en',       label: 'Meta titre EN',       ph: 'KB Hair Paris — Premium Hair Extensions & Wigs' },
                  { field: 'description_fr', label: 'Meta description FR', ph: '' },
                  { field: 'description_en', label: 'Meta description EN', ph: '' },
                  { field: 'og_image',       label: 'Image Open Graph', ph: 'https://...' },
                ].map(({ field, label, ph }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    {field.includes('description') ? (
                      <textarea value={data.seo?.[field] ?? ''} onChange={e => updateField('seo', field, e.target.value)} placeholder={ph} rows={2} className={`${inputCls} resize-none`} />
                    ) : field === 'og_image' ? (
                      <div className="flex gap-2">
                        <input value={data.seo?.[field] ?? ''} onChange={e => updateField('seo', field, e.target.value)} placeholder={ph} className={inputCls + ' flex-1'} />
                        <label className="flex-shrink-0 flex items-center gap-1 px-3 border border-[#e0e0e0] font-sans text-[10px] uppercase cursor-pointer hover:border-black">
                          ↑ Photo
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return
                            const path = 'seo/og-image-' + Date.now() + '.' + file.name.split('.').pop()
                            const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
                            if (error) { alert('Erreur: ' + error.message); return }
                            const { data: urlData } = supabase.storage.from('products').getPublicUrl(path)
                            updateField('seo', 'og_image', urlData.publicUrl)
                          }} />
                        </label>
                      </div>
                    ) : (
                      <input value={data.seo?.[field] ?? ''} onChange={e => updateField('seo', field, e.target.value)} placeholder={ph} className={inputCls} />
                    )}
                  </div>
                ))}
                <button onClick={() => save('seo')} disabled={saving} className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85 w-fit">
                  <Save size={13}/> Sauvegarder
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
