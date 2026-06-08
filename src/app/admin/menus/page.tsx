'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MenuItem {
  id: string
  label_fr: string
  label_en: string
  url: string
  position: number
  is_active: boolean
  children?: MenuItem[]
  parent_id?: string | null
}

export default function AdminMenus() {
  const [items,   setItems]   = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [produits, setProduits] = useState<any[]>([])
  const [pages, setPages] = useState<any[]>([])

  useEffect(() => {
    supabase.from('products').select('name_fr, slug').eq('is_active', true).order('name_fr')
      .then(({data}) => setProduits(data ?? []))
    supabase.from('pages').select('title_fr, slug').eq('is_active', true).order('slug')
      .then(({data}) => setPages(data ?? []))
  }, [])

  const load = async () => {
    setLoading(true)
    const { data: menus } = await supabase.from('menus').select('id').eq('handle', 'main').single()
    if (!menus) {
      // Créer le menu principal s'il n'existe pas
      await supabase.from('menus').insert({ handle: 'main', label_fr: 'Menu principal', label_en: 'Main menu', position: 1 })
    }
    const menuId = menus?.id

    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', menuId)
      .order('position')

    const allItems = data ?? []
    // Construire arborescence
    const roots = allItems.filter(i => !i.parent_id)
    const built = roots.map(r => ({
      ...r,
      children: allItems.filter(i => i.parent_id === r.id).sort((a, b) => a.position - b.position),
    }))
    setItems(built)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const getMenuId = async () => {
    const { data } = await supabase.from('menus').select('id').eq('handle', 'main').single()
    return data?.id
  }

  const addItem = async (parentId?: string) => {
    const menuId  = await getMenuId()
    const position = items.length
    const { data } = await supabase.from('menu_items').insert({
      menu_id:   menuId,
      parent_id: parentId ?? null,
      label_fr:  'Nouveau lien',
      label_en:  'New link',
      url:       '',
      position,
      is_active: true,
    }).select().single()
    if (data) {
      setEditing(data)
      load()
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer ce lien et ses sous-menus ?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    await supabase.from('menu_items').delete().eq('parent_id', id)
    setEditing(null)
    load()
  }

  const saveItem = async () => {
    if (!editing) return
    setSaving(true)
    await supabase.from('menu_items').update({
      label_fr:  editing.label_fr,
      label_en:  editing.label_en,
      url:       editing.url,
      is_active: editing.is_active,
    }).eq('id', editing.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    load()
  }

  const moveItem = async (id: string, dir: 'up' | 'down') => {
    const flat = items.flatMap(i => [i, ...(i.children ?? [])])
    const idx  = flat.findIndex(i => i.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === flat.length - 1) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    await Promise.all([
      supabase.from('menu_items').update({ position: swapIdx }).eq('id', flat[idx].id),
      supabase.from('menu_items').update({ position: idx }).eq('id', flat[swapIdx].id),
    ])
    load()
  }

  const toggleItem = async (id: string, current: boolean) => {
    await supabase.from('menu_items').update({ is_active: !current }).eq('id', id)
    load()
  }

  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
  const labelCls = "font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1 block"

  // Liens suggérés
  const SUGGESTIONS = [
    { label_fr: 'Wigs',          label_en: 'Wigs',         url: '/fr/collections/wigs' },
    { label_fr: 'Bundles',       label_en: 'Bundles',      url: '/fr/collections/bundles' },
    { label_fr: 'Frontales',     label_en: 'Frontals',     url: '/fr/collections/frontales' },
    { label_fr: 'Closures',      label_en: 'Closures',     url: '/fr/collections/closures' },
    { label_fr: 'Hair Products', label_en: 'Hair Products',url: '/fr/collections/produits' },
    { label_fr: 'VIP Cards',     label_en: 'VIP Cards',    url: '/fr/collections/vip-cards' },
    { label_fr: 'Qui sommes-nous',label_en:'About Us',     url: '/fr/pages/qui-sommes-nous' },
    { label_fr: 'Livraison',     label_en: 'Shipping',     url: '/fr/pages/livraison' },
    { label_fr: 'CGV',           label_en: 'Terms',        url: '/fr/pages/cgv' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Navigation</h1>
          <p className="font-sans text-[10px] text-[#888] mt-0.5">Menu principal du header FR & EN</p>
        </div>
        {saved && <span className="font-sans text-[11px] text-green-600">✓ Sauvegardé</span>}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Arbre du menu */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">Structure du menu</p>
            <button onClick={() => addItem()}
              className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 bg-black text-white border-none cursor-pointer hover:opacity-85">
              <Plus size={12} /> Ajouter
            </button>
          </div>

          {loading ? (
            <p className="font-sans text-[12px] text-[#aaa] py-4">Chargement...</p>
          ) : items.length === 0 ? (
            <div className="bg-white border border-dashed border-[#e0e0e0] px-4 py-8 text-center">
              <p className="font-sans text-[12px] text-[#aaa] mb-3">Menu vide</p>
              <button onClick={() => addItem()} className="font-sans text-[10px] tracking-[0.15em] uppercase underline underline-offset-4 text-black bg-transparent border-0 cursor-pointer">
                Ajouter le premier lien
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item, idx) => (
                <div key={item.id}>
                  {/* Lien principal */}
                  <div
                    className={`flex items-center gap-2 bg-white border px-3 py-2.5 cursor-pointer ${editing?.id === item.id ? 'border-black' : 'border-[#e8e8e8] hover:border-[#ccc]'}`}
                    onClick={() => setEditing(item)}
                  >
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); moveItem(item.id, 'up') }} className="text-[#ccc] hover:text-black bg-transparent border-0 cursor-pointer p-0 leading-none"><ChevronUp size={11}/></button>
                      <button onClick={e => { e.stopPropagation(); moveItem(item.id, 'down') }} className="text-[#ccc] hover:text-black bg-transparent border-0 cursor-pointer p-0 leading-none"><ChevronDown size={11}/></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[12px] font-medium text-black truncate">{item.label_fr}</p>
                      <p className="font-sans text-[10px] text-[#aaa] truncate">{item.url}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); toggleItem(item.id, item.is_active) }}
                        className={`font-sans text-[8px] uppercase px-1.5 py-0.5 border cursor-pointer bg-transparent ${item.is_active ? 'text-green-600 border-green-200' : 'text-[#aaa] border-[#e0e0e0]'}`}>
                        {item.is_active ? 'Visible' : 'Masqué'}
                      </button>
                      <button onClick={e => { e.stopPropagation(); addItem(item.id) }}
                        className="text-[#ccc] hover:text-black bg-transparent border-0 cursor-pointer" title="Ajouter sous-lien">
                        <Plus size={12}/>
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteItem(item.id) }}
                        className="text-[#ccc] hover:text-red-600 bg-transparent border-0 cursor-pointer">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>

                  {/* Sous-menus */}
                  {item.children && item.children.length > 0 && (
                    <div className="ml-5 flex flex-col gap-1 mt-1">
                      {item.children.map(child => (
                        <div
                          key={child.id}
                          className={`flex items-center gap-2 bg-white border px-3 py-2 cursor-pointer ${editing?.id === child.id ? 'border-black' : 'border-[#e8e8e8] hover:border-[#ccc]'}`}
                          onClick={() => setEditing(child)}
                        >
                          <ChevronRight size={11} className="text-[#ccc] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-[11px] text-black truncate">{child.label_fr}</p>
                            <p className="font-sans text-[10px] text-[#aaa] truncate">{child.url}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={e => { e.stopPropagation(); toggleItem(child.id, child.is_active) }}
                              className={`font-sans text-[9px] bg-transparent border-0 cursor-pointer ${child.is_active ? 'text-green-600' : 'text-[#ccc]'}`}>
                              {child.is_active ? '●' : '○'}
                            </button>
                            <button onClick={e => { e.stopPropagation(); deleteItem(child.id) }}
                              className="text-[#ccc] hover:text-red-600 bg-transparent border-0 cursor-pointer">
                              <Trash2 size={11}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Liens suggérés */}
          <div className="mt-4 bg-white border border-[#e8e8e8] px-4 py-4">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">Ajouter rapidement</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s.url}
                  onClick={async () => {
                    const menuId = await getMenuId()
                    await supabase.from('menu_items').insert({
                      menu_id: menuId, label_fr: s.label_fr, label_en: s.label_en,
                      url: s.url, position: items.length, is_active: true, parent_id: null,
                    })
                    load()
                  }}
                  className="font-sans text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 border border-[#e0e0e0] hover:border-black bg-white cursor-pointer transition-colors">
                  + {s.label_fr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Éditeur du lien sélectionné */}
        <div>
          {!editing ? (
            <div className="bg-white border border-dashed border-[#e0e0e0] px-4 py-12 text-center">
              <p className="font-sans text-[12px] text-[#aaa]">Sélectionnez un lien pour le modifier</p>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e8e8] px-5 py-5">
              <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">
                Modifier le lien
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Libellé FR *</label>
                  <input value={editing.label_fr} onChange={e => setEditing(ed => ed ? {...ed, label_fr: e.target.value} : null)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Libellé EN *</label>
                  <input value={editing.label_en} onChange={e => setEditing(ed => ed ? {...ed, label_en: e.target.value} : null)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>URL *</label>
                  <input value={editing.url ?? ''} onChange={e => setEditing(ed => ed ? {...ed, url: e.target.value} : null)} placeholder="/fr/collections/wigs" className={inputCls} />
                  <p className="font-sans text-[10px] text-[#aaa] mt-1 mb-2">
                    URLs relatives : /fr/collections/wigs · Externes : https://instagram.com/...
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <p className="w-full font-sans text-[9px] text-[#888] uppercase tracking-widest mb-1">Collections</p>
                    {[{n:'Wigs',u:'/fr/collections/wigs'},{n:'Bundles',u:'/fr/collections/bundles'},{n:'Frontales',u:'/fr/collections/frontales'},{n:'Closures',u:'/fr/collections/closures'},{n:'Hair Products',u:'/fr/collections/produits'},{n:'VIP Cards',u:'/fr/collections/vip-cards'},{n:'Services',u:'/fr/collections/services'},{n:'Accueil',u:'/fr'}].map(s => (
                      <button key={s.u} type="button" onClick={() => setEditing(ed => ed ? {...ed, url: s.u} : null)} className="font-sans text-[9px] px-2 py-1 border border-[#e0e0e0] bg-white cursor-pointer hover:bg-black hover:text-white transition-colors">{s.n}</button>
                    ))}
                    <p className="w-full font-sans text-[9px] text-[#888] uppercase tracking-widest mb-1 mt-2">Produits</p>
                    {produits.map(p => (
                      <button key={p.slug} type="button" onClick={() => setEditing(ed => ed ? {...ed, url: `/fr/produits/${p.slug}`} : null)} className="font-sans text-[9px] px-2 py-1 border border-[#e0e0e0] bg-white cursor-pointer hover:bg-black hover:text-white transition-colors">{p.name_fr}</button>
                    ))}
                    <p className="w-full font-sans text-[9px] text-[#888] uppercase tracking-widest mb-1 mt-2">Pages</p>
                    {pages.map(p => (
                      <button key={p.slug} type="button" onClick={() => setEditing(ed => ed ? {...ed, url: `/fr/pages/${p.slug}`} : null)} className="font-sans text-[9px] px-2 py-1 border border-[#e0e0e0] bg-white cursor-pointer hover:bg-black hover:text-white transition-colors">{p.title_fr}</button>
                    ))}
                    <p className="w-full font-sans text-[9px] text-[#888] uppercase tracking-widest mb-1 mt-2">Groupe sans lien</p>
                    <button type="button" onClick={() => setEditing(ed => ed ? {...ed, url: '#'} : null)} className="font-sans text-[9px] px-2 py-1 border border-[#e0e0e0] bg-white cursor-pointer hover:bg-black hover:text-white transition-colors">Titre groupe (#)</button>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(ed => ed ? {...ed, is_active: e.target.checked} : null)} />
                  <span className="font-sans text-[12px] text-[#555]">Lien actif (visible)</span>
                </label>
                <div className="flex gap-2 mt-2">
                  <button onClick={saveItem} disabled={saving}
                    className="flex items-center gap-1.5 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-85 disabled:opacity-40">
                    <Save size={13}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button onClick={() => deleteItem(editing.id)}
                    className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 border border-[#e0e0e0] text-red-500 hover:border-red-300 bg-white cursor-pointer">
                    <Trash2 size={13}/> Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Note d'application */}
          <div className="mt-4 bg-[#fffbeb] border border-[#fde68a] px-4 py-3">
            <p className="font-sans text-[11px] text-[#92400e] leading-relaxed">
              ⚠️ Les modifications du menu sont sauvegardées en base de données. Pour les appliquer au header du site en temps réel, assurez-vous que le composant Header lit les menus depuis Supabase (voir documentation technique).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
