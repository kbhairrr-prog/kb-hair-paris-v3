'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist'
import { useCartStore } from '@/store/cart'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default function WishlistEN() {
  const items      = useWishlistStore(s => s.items)
  const removeItem = useWishlistStore(s => s.removeItem)
  const addItem    = useCartStore(s => s.addItem)

  return (
    <>
      <Header locale="en" />
      <main className="min-h-screen bg-white pt-[68px]">
        <div className="bg-[#f0f0f0] border-b border-[#e0e0e0] px-5 py-8 text-center">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#888] mb-2">My list</p>
          <h1 className="font-serif text-[28px] font-light tracking-[0.12em] uppercase text-black">Wishlist ({items.length})</h1>
        </div>
        <div className="max-w-[1200px] mx-auto px-5 py-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-sans text-[12px] tracking-[0.15em] uppercase text-[#aaa] mb-4">Your wishlist is empty</p>
              <Link href="/en/collections/wigs" className="bg-black text-white font-sans text-[10px] tracking-[0.2em] uppercase px-8 py-3.5 no-underline hover:opacity-85 transition-opacity">DISCOVER OUR PRODUCTS</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#e8e8e8] border border-[#e8e8e8]">
              {items.map(({ product }) => {
                const img = product.images?.find(i => i.is_primary) ?? product.images?.[0]
                return (
                  <div key={product.id} className="bg-white group relative">
                    <button onClick={() => removeItem(product.id)} className="absolute top-2 left-2 z-10 w-7 h-7 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer shadow-sm">
                      <X size={13} className="text-[#888]" />
                    </button>
                    <Link href={`/en/produits/${product.slug}`} className="block no-underline">
                      <div className="relative w-full bg-[#f5f5f5] overflow-hidden" style={{ aspectRatio: '3/4' }}>
                        {img ? <Image src={img.url} alt={product.name_en} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 50vw, 25vw" /> : <div className="absolute inset-0 bg-gradient-to-b from-[#ccc] to-[#999]" />}
                        <button onClick={e => { e.preventDefault(); addItem(product) }} className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-white flex items-center justify-center text-xl font-light text-black shadow-sm z-10">+</button>
                      </div>
                      <div className="p-3">
                        <p className="font-sans text-[11px] font-normal tracking-[0.08em] uppercase text-black mb-1 leading-snug">{product.name_en}</p>
                        <p className="font-sans text-[11px] font-light uppercase text-[#888]">FROM €{product.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </Link>
                    <button onClick={() => addItem(product)} className="w-full bg-black text-white font-sans text-[10px] tracking-[0.18em] uppercase py-3 border-none cursor-pointer hover:opacity-85 transition-opacity">ADD TO CART</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer locale="en" />
      <CartDrawer locale="en" />
    </>
  )
}
