'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Table de liaison produits associés - à ajouter en SQL
// CREATE TABLE product_related (
//   product_id UUID REFERENCES products(id) ON DELETE CASCADE,
//   related_id  UUID REFERENCES products(id) ON DELETE CASCADE,
//   position    INTEGER DEFAULT 0,
//   PRIMARY KEY (product_id, related_id)
// );

export default function AdminProduitsAssocies() {
  const [products, setProducts]   = useState<any[]>([])
  const [selected, setSelected]   = useState<any | null>(null)
  const [related,  setRelated]    = useState<any[]>([])
  const [search,   setSearch]     = useState('')
  const [results,  setResults]    = useState<any[]>([])
  const [loading,  setLoading]    = useState(true)

  // Charger tous les produits
  useEffect(() => {
    supabase.from('products').select('id, name_fr, images:product_images(url, is_primary), category:categories(name_fr)')
      .eq('is_active', true).order('name_fr')
      .then(({ data }) => { setProducts(data ?? []); setLoading(false) })
  }, [])

  // Charger produits associés du produit sélectionné
  const loadRelated = useCallback(async (productId: string) => {
    // Essayer de lire depuis product_related si elle existe, sinon fallback
    const { data, error } = await supabase
      .from('product_related')
      .select('related:related_id(id, name_fr, images:product_images(url, is_primary))')
      .eq('product_id', productId)
      .order('position')

    if (error) {
      // Table pas encore créée - afficher message
      setRelated([])
    } else {
      setRelated(data?.map((r: any) => r.related) ?? [])
    }
  }, [])

  useEffect(() => {
    if (selected) loadRelated(selected.id)
  }, [selected, loadRelated])

  // Recherche produits à associer
  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    const filtered = products.filter(p =>
      p.id !== selected?.id &&
      !related.find((r: any) => r.id === p.id) &&
      p.name_fr.toLowerCase().includes(search.toLowerCase())
    )
    setResults(filtered.slice(0, 8))
  }, [search, products, selected, related])

  const addRelated = async (relatedProduct: any) => {
    if (!selected) return
    const { error } = await supabase.from('product_related').insert({
      product_id: selected.id,
      related_id: relatedProduct.id,
      position:   related.length,
    })
    if (!error) {
      setRelated(r => [...r, relatedProduct])
      setSearch('')
      setResults([])
    }
  }

  const removeRelated = async (relatedId: string) => {
    await supabase.from('product_related')
      .delete().eq('product_id', selected.id).eq('related_id', relatedId)
    setRelated(r => r.filter((p: any) => p.id !== relatedId))
  }

  const getImg = (p: any) => p.images?.find((i: any) => i.is_primary)?.url ?? p.images?.[0]?.url

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col lg:flex-row">
      {/* Liste produits */}
      <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#e8e8e8] flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-[#e8e8e8]">
          <h1 className="font-sans text-[13px] font-medium tracking-[0.1em] uppercase">Produits associés</h1>
          <p className="font-sans text-[10px] text-[#888] mt-0.5">Configurer les recommandations</p>
        </div>



        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-4 font-sans text-[11px] text-[#aaa]">Chargement...</p>
          ) : products.map(product => (
            <button key={product.id} onClick={() => setSelected(product)}
              className={`w-full text-left px-4 py-3 border-b border-[#f5f5f5] flex items-center gap-3 transition-colors bg-transparent cursor-pointer ${selected?.id === product.id ? 'bg-[#f0f0f0]' : 'hover:bg-[#fafafa]'}`}>
              <div className="relative w-8 h-10 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                {getImg(product) && <Image src={getImg(product)} alt="" fill className="object-cover" sizes="32px" />}
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[11px] font-medium text-black truncate">{product.name_fr}</p>
                <p className="font-sans text-[9px] text-[#888]">{product.category?.name_fr}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex-1 px-5 py-5 min-w-0">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-sans text-[12px] text-[#aaa] tracking-[0.1em] uppercase">
              Sélectionnez un produit
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#888] mb-1">Produit sélectionné</p>
              <h2 className="font-sans text-[16px] font-light tracking-[0.08em] uppercase text-black">{selected.name_fr}</h2>
            </div>

            {/* Produits associés actuels */}
            <div className="mb-5">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-3">
                Produits associés ({related.length})
              </p>
              {related.length === 0 ? (
                <p className="font-sans text-[12px] text-[#aaa]">
                  Aucun produit associé. Utilisez la recherche ci-dessous pour en ajouter.
                </p>
              ) : (
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {related.map((r: any) => (
                    <div key={r.id} className="bg-white border border-[#e8e8e8] relative group">
                      <div className="relative w-full bg-[#f5f5f5] overflow-hidden" style={{ aspectRatio: '3/4' }}>
                        {getImg(r) && <Image src={getImg(r)} alt={r.name_fr} fill className="object-cover" sizes="120px" />}
                      </div>
                      <p className="font-sans text-[10px] tracking-[0.06em] uppercase text-black p-2 truncate">{r.name_fr}</p>
                      <button onClick={() => removeRelated(r.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer">
                        <X size={11} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recherche pour ajouter */}
            <div className="bg-white border border-[#e8e8e8] px-4 py-4">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-[#888] mb-3">
                Ajouter un produit associé
              </p>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un produit à associer..."
                  className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] font-sans text-[12px] outline-none focus:border-black" />
              </div>
              {results.length > 0 && (
                <div className="flex flex-col gap-1">
                  {results.map(r => (
                    <button key={r.id} onClick={() => addRelated(r)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[#f5f5f5] text-left transition-colors w-full bg-transparent border border-[#f0f0f0] cursor-pointer">
                      <div className="relative w-8 h-10 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                        {getImg(r) && <Image src={getImg(r)} alt="" fill className="object-cover" sizes="32px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[12px] font-medium text-black truncate">{r.name_fr}</p>
                        <p className="font-sans text-[10px] text-[#888]">{r.category?.name_fr}</p>
                      </div>
                      <Plus size={14} className="text-[#888] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
