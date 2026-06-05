'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product, ProductVariant } from '@/types'

interface QuickAddModalProps {
  product: Product | null
  locale: 'fr' | 'en'
  onClose: () => void
}

export default function QuickAddModal({ product, locale, onClose }: QuickAddModalProps) {
  const [selectedOpts, setSelectedOpts] = useState<Record<string, string>>({})
  const [qty,          setQty]          = useState(1)
  const [adding,       setAdding]       = useState(false)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    if (product) { setSelectedOpts({}); setQty(1) }
  }, [product])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!product) return null

  const name  = locale === 'fr' ? product.name_fr : product.name_en
  const img   = product.images?.find(i => i.is_primary) ?? product.images?.[0]

  // Grouper options par type de variante
  const variantTypeMap: Record<string, { typeName: string; options: any[] }> = {}
  product.variants?.forEach(v => {
    v.options?.forEach((opt: any) => {
      if (!opt.variant_type) return
      const tid = opt.variant_type_id
      if (!variantTypeMap[tid]) variantTypeMap[tid] = { typeName: locale === 'fr' ? opt.variant_type.name_fr : opt.variant_type.name_en, options: [] }
      if (!variantTypeMap[tid].options.find((o: any) => o.id === opt.id)) variantTypeMap[tid].options.push(opt)
    })
  })

  const findVariant = (): ProductVariant | undefined =>
    product.variants?.find(v => Object.entries(selectedOpts).every(([tid, oid]) => v.options?.some((o: any) => o.variant_type_id === tid && o.id === oid)))

  const variant  = findVariant()
  const price    = variant?.price ?? product.price
  const inStock  = (variant?.stock ?? 999) > 0 || product.allow_backorder
  const allSelected = Object.keys(variantTypeMap).length === Object.keys(selectedOpts).length

  const handleAdd = async () => {
    if (!inStock || !allSelected) return
    setAdding(true)
    addItem(product, variant, qty)
    await new Promise(r => setTimeout(r, 600))
    setAdding(false)
    onClose()
  }

  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-[160] bg-white lg:absolute lg:bottom-auto lg:left-auto lg:right-0 lg:top-0 lg:w-[320px] shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
          <p className="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-black">
            {locale === 'fr' ? 'Ajout rapide' : 'Quick add'}
          </p>
          <button onClick={onClose} className="text-[#888] hover:text-black bg-transparent border-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-3 px-4 py-4 border-b border-[#f0f0f0]">
          <div className="relative w-16 h-20 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
            {img && <Image src={img.url} alt={name} fill className="object-cover" sizes="64px" />}
          </div>
          <div>
            <p className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-black leading-snug mb-1">{name}</p>
            <p className="font-sans text-[14px] font-light text-black">{fmt(price)}</p>
          </div>
        </div>

        <div className="px-4 py-4">
          {/* Variantes */}
          {Object.entries(variantTypeMap).map(([typeId, { typeName, options }]) => (
            <div key={typeId} className="mb-4">
              <p className="font-sans text-[10px] font-medium tracking-[0.18em] uppercase text-black mb-2">{typeName}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt: any) => {
                  const label = locale === 'fr' ? opt.value_fr : opt.value_en
                  const isSelected = selectedOpts[typeId] === opt.id
                  return (
                    <button key={opt.id} onClick={() => setSelectedOpts(s => ({ ...s, [typeId]: opt.id }))}
                      className={`px-3 py-1.5 font-sans text-[11px] tracking-[0.06em] uppercase border transition-all cursor-pointer ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e0e0e0] hover:border-black'}`}>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quantité */}
          <div className="flex items-center gap-3 mb-4">
            <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-black">{locale === 'fr' ? 'QTÉ' : 'QTY'}</p>
            <div className="flex items-center border border-[#e0e0e0]">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center font-light text-black hover:bg-[#f5f5f5] bg-transparent border-none cursor-pointer">−</button>
              <span className="w-8 h-8 flex items-center justify-center font-sans text-[13px]">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 flex items-center justify-center font-light text-black hover:bg-[#f5f5f5] bg-transparent border-none cursor-pointer">+</button>
            </div>
          </div>

          {/* Bouton ajouter */}
          <button onClick={handleAdd} disabled={!inStock || adding || !allSelected}
            className={`w-full py-4 font-sans text-[11px] font-medium tracking-[0.22em] uppercase border-none cursor-pointer transition-all ${!inStock || !allSelected ? 'bg-[#e0e0e0] text-[#999] cursor-not-allowed' : adding ? 'bg-[#333] text-white' : 'bg-black text-white hover:opacity-85'}`}>
            {adding ? '✓ AJOUTÉ' : !allSelected ? (locale === 'fr' ? 'CHOISIR UNE OPTION' : 'SELECT AN OPTION') : locale === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART'}
          </button>

          <Link href={`/${locale}/produits/${product.slug}`} onClick={onClose}
            className="block text-center font-sans text-[10px] tracking-[0.12em] uppercase text-[#888] hover:text-black mt-3 no-underline underline-offset-4 hover:underline">
            {locale === 'fr' ? 'Voir le produit complet' : 'View full product'}
          </Link>
        </div>
      </div>
    </>
  )
}
