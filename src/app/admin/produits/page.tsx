'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

export default function AdminProduits() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [catFilter,setCatFilter]= useState('all')
  const [cats,     setCats]     = useState<any[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(name_fr)')
      .order('created_at', { ascending: false })

    if (catFilter !== 'all') query = query.eq('category_id', catFilter)
    if (search) query = query.ilike('name_fr', `%${search}%`)

    const { data } = await query
    setProducts(data as Product[] ?? [])
    setLoading(false)
  }, [catFilter, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    supabase.from('categories').select('id,name_fr').eq('is_active', true)
      .then(({ data }) => setCats(data ?? []))
  }, [])

  const toggleActive = async (product: Product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    setProducts(ps => ps.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(ps => ps.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">Produits</h1>
        <Link
          href="/admin/produits/nouveau"
          className="flex items-center gap-2 bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 hover:opacity-85 no-underline"
        >
          <Plus size={14} /> Nouveau produit
        </Link>
      </div>

      <div className="px-4 lg:px-6 py-5">
        {/* Filtres */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] outline-none focus:border-black"
          >
            <option value="all">Toutes catégories</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#e8e8e8]">
                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-[#888]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-[#f0f0f0] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.map(product => {
                const img = product.images?.find((i: any) => i.is_primary) ?? product.images?.[0]
                const totalStock = product.variants?.reduce((s: number, v: any) => s + (v.stock ?? 0), 0) ?? 0

                return (
                  <tr key={product.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                          {img && <Image src={(img as any).url} alt={product.name_fr} fill className="object-cover" sizes="40px" />}
                        </div>
                        <div>
                          <p className="font-sans text-[12px] font-medium text-black leading-snug">
                            {product.name_fr}
                          </p>
                          <p className="font-sans text-[10px] text-[#888]">{product.sku ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-[11px] text-[#555]">
                      {(product as any).category?.name_fr ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-black">
                      €{product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-sans text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full ${
                        totalStock > 10 ? 'bg-green-100 text-green-700'
                        : totalStock > 0 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {totalStock > 0 ? totalStock : 'Épuisé'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(product)}
                        className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.08em] uppercase bg-transparent border-0 cursor-pointer"
                      >
                        {product.is_active
                          ? <><Eye size={13} className="text-green-600" /><span className="text-green-600">Actif</span></>
                          : <><EyeOff size={13} className="text-[#aaa]" /><span className="text-[#aaa]">Inactif</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/produits/${product.id}`} className="text-[#888] hover:text-black no-underline">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="text-[#888] hover:text-red-600 bg-transparent border-0 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <p className="px-4 py-8 text-center font-sans text-[12px] text-[#aaa]">
              Aucun produit trouvé
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
