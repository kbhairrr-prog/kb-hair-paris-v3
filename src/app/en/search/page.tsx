'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

function SearchPageENInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [query,   setQuery]   = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(name_en,slug)')
      .eq('is_active', true)
      .or(`name_fr.ilike.%${q}%,name_en.ilike.%${q}%,description_en.ilike.%${q}%`)
      .limit(24)
    setResults(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
    doSearch(q)
  }, [searchParams, doSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/en/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <Header locale="en" />
      <main className="min-h-screen bg-white pt-[68px]">
        <div className="bg-[#f0f0f0] border-b border-[#e0e0e0] px-5 py-8">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex items-center border border-[#ccc] bg-white">
              <Search size={16} className="ml-4 text-[#aaa] flex-shrink-0" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search a product..." className="flex-1 px-3 py-4 font-sans text-[13px] font-light outline-none bg-transparent" />
              {query && <button type="button" onClick={() => { setQuery(''); setResults([]) }} className="mr-2 text-[#aaa] hover:text-black bg-transparent border-none cursor-pointer"><X size={16}/></button>}
              <button type="submit" className="bg-black text-white font-sans text-[10px] tracking-[0.2em] uppercase px-5 py-4 border-none cursor-pointer hover:opacity-85 flex-shrink-0">GO</button>
            </form>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-5 py-8">
          {searchParams.get('q') && (
            <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-[#888] mb-6">
              {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${searchParams.get('q')}"`}
            </p>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#e8e8e8] border border-[#e8e8e8]">
              {results.map(product => {
                const img = product.images?.find((i: any) => i.is_primary) ?? product.images?.[0]
                return (
                  <div key={product.id} className="bg-white group">
                    <Link href={`/en/produits/${product.slug}`} className="block no-underline">
                      <div className="relative w-full bg-[#f5f5f5] overflow-hidden" style={{ aspectRatio: '3/4' }}>
                        {img ? <Image src={img.url} alt={product.name_en} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 50vw, 25vw" /> : <div className="absolute inset-0 bg-gradient-to-b from-[#ccc] to-[#999]" />}
                        <button onClick={e => { e.preventDefault(); addItem(product) }} className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-white flex items-center justify-center text-xl font-light text-black shadow-sm z-10">+</button>
                      </div>
                      <div className="p-3">
                        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#888] mb-1">{product.category?.name_en ?? ''}</p>
                        <p className="font-sans text-[11px] font-normal tracking-[0.08em] uppercase text-black mb-1 leading-snug">{product.name_en}</p>
                        <p className="font-sans text-[11px] font-light uppercase text-[#888]">FROM €{product.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
          {!loading && searchParams.get('q') && results.length === 0 && (
            <div className="text-center py-20">
              <p className="font-sans text-[12px] tracking-[0.15em] uppercase text-[#aaa] mb-4">No results for "{searchParams.get('q')}"</p>
              <Link href="/en/collections/wigs" className="bg-black text-white font-sans text-[10px] tracking-[0.2em] uppercase px-8 py-3.5 no-underline hover:opacity-85 transition-opacity">VIEW COLLECTIONS</Link>
            </div>
          )}
          {!searchParams.get('q') && <div className="text-center py-20"><p className="font-sans text-[12px] tracking-[0.15em] uppercase text-[#aaa]">What are you looking for?</p></div>}
        </div>
      </main>
      <Footer locale="en" />
      <CartDrawer locale="en" />
    </>
  )
}

export default function SearchPageEN() {
  return (
    <Suspense fallback={<div/>}>
      <SearchPageENInner />
    </Suspense>
  )
}
