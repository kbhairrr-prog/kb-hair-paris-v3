'use client'

import { useState, useCallback, useEffect} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import WishlistButton from '@/components/ui/WishlistButton'
import SizeGuide from '@/components/product/SizeGuide'
import ReviewsSection from '@/components/product/ReviewsSection'
import type { Product, ProductVariant, VariantOption } from '@/types'

interface ProductPageClientProps {
  product: Product
  related: Product[]
  locale: 'fr' | 'en'
}

export default function ProductPageClient({ product, related, locale }: ProductPageClientProps) {
  const [activeImg,     setActiveImg]     = useState(0)
  const [freeThreshold, setFreeThreshold] = useState(230)
  const [delayFr, setDelayFr] = useState('3 à 5 jours ouvrés')
  const [delayEn, setDelayEn] = useState('3 to 5 business days')

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('key', 'shipping').single()
      .then(({ data }) => {
        if (data?.value) {
          setFreeThreshold(data.value.free_threshold ?? 230)
          setDelayFr(data.value.delay_fr ?? '3 à 5 jours ouvrés')
          setDelayEn(data.value.delay_en ?? '3 to 5 business days')
        }
      })
  }, [])
  const [lightbox,      setLightbox]      = useState(false)
  const [selectedOpts,  setSelectedOpts]  = useState<Record<string, string>>({})
  const [qty,           setQty]           = useState(1)
  const [adding,        setAdding]        = useState(false)
  const [openFaq,       setOpenFaq]       = useState<string | null>(null)
  const addItem = useCartStore(s => s.addItem)

  const name  = locale === 'fr' ? product.name_fr  : product.name_en
  const desc  = locale === 'fr' ? product.description_fr : product.description_en
  const specs = locale === 'fr' ? product.specs_fr : product.specs_en
  const imgs  = product.images ?? []

  // Grouper options par type
  const variantTypeMap: Record<string, { typeName: string; options: VariantOption[] }> = {}
  product.variants?.forEach(v => {
    v.options?.forEach(opt => {
      if (!opt.variant_type) return
      const tid = opt.variant_type_id
      if (!variantTypeMap[tid]) {
        variantTypeMap[tid] = {
          typeName: locale === 'fr' ? opt.variant_type.name_fr : opt.variant_type.name_en,
          options: [],
        }
      }
      if (!variantTypeMap[tid].options.find(o => o.id === opt.id)) {
        variantTypeMap[tid].options.push(opt)
      }
    })
  })

  // Trouver la variante correspondant aux options sélectionnées
  const findVariant = useCallback((): ProductVariant | undefined => {
    if (!product.variants?.length) return undefined
    const requiredTypeIds = Object.keys(variantTypeMap)
    if (requiredTypeIds.length === 0) return undefined
    const allSelected = requiredTypeIds.every(typeId => selectedOpts[typeId])
    if (!allSelected) return undefined
    return product.variants.find(v =>
      requiredTypeIds.every(typeId =>
        v.options?.some(o => o.variant_type_id === typeId && o.id === selectedOpts[typeId])
      )
    )
  }, [selectedOpts, product.variants, variantTypeMap])

  const selectedVariant = findVariant()
  const price = selectedVariant?.price ?? product.price
  const comparePrice = selectedVariant?.compare_price ?? product.compare_price
  // Si une variante est selectionnee, on utilise son stock. Sinon on retombe sur le stock du produit principal (fallback).
  const stock = selectedVariant ? (selectedVariant.stock ?? 0) : (product.stock ?? 999)
  const inStock = stock > 0 || product.allow_backorder

  const handleAdd = async () => {
    if (!inStock) return
    setAdding(true)
    addItem(product, selectedVariant, qty)
    await new Promise(r => setTimeout(r, 800))
    setAdding(false)
  }

  const prevImg = () => setActiveImg(i => (i - 1 + imgs.length) % imgs.length)
  const nextImg = () => setActiveImg(i => (i + 1) % imgs.length)

  const fmt = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
  const disc = comparePrice && comparePrice > price
    ? Math.round((1 - price / comparePrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-white pt-[68px]">

      {/* ── LIGHTBOX ── */}
      {lightbox && imgs[activeImg] && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(false)}>
            <X size={28} strokeWidth={1} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white" onClick={e => { e.stopPropagation(); prevImg() }}>
            <ChevronLeft size={32} strokeWidth={1} />
          </button>
          <div className="relative w-full max-w-[90vw] max-h-[90vh]" style={{ aspectRatio: '3/4' }}>
            <Image src={imgs[activeImg].url} alt={name} fill className="object-contain" sizes="90vw" />
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white" onClick={e => { e.stopPropagation(); nextImg() }}>
            <ChevronRight size={32} strokeWidth={1} />
          </button>
        </div>
      )}

      {/* ── GALERIE + ACHAT ── */}
      <div className="flex flex-col">

        {/* GALERIE — pleine largeur mobile */}
        <div className="relative w-full bg-[#f5f5f5]" style={{ aspectRatio: '4/5' }}>
          {imgs.length > 0 ? (
            <>
              <Image
                src={imgs[activeImg]?.url}
                alt={name}
                fill priority
                className="object-cover cursor-zoom-in"
                sizes="100vw"
                onClick={() => setLightbox(true)}
              />
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {imgs.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {imgs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-1.5 h-1.5 rounded-full border-none transition-colors ${
                        i === activeImg ? 'bg-black' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#ccc] to-[#999]" />
          )}
        </div>

        {imgs.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto [scrollbar-hide::-webkit-scrollbar]:hidden bg-[#f5f5f5]">
            {imgs.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className={`relative flex-shrink-0 w-16 h-20 bg-white overflow-hidden border-2 transition-colors ${
                  i === activeImg ? 'border-black' : 'border-transparent'
                }`}
              >
                <Image src={img.url} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}

        <div className="px-5 py-6">

          {product.category && (
            <Link
              href={`/${locale}/collections/${product.category.slug}`}
              className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#888] no-underline hover:text-black mb-2 block"
            >
              {locale === 'fr' ? product.category.name_fr : product.category.name_en}
            </Link>
          )}

          <h1 className="font-sans text-[18px] font-light tracking-[0.1em] uppercase text-black mb-4 leading-snug">
            {name}
          </h1>

          <div className="flex items-center gap-3 mb-5">
            <span className="font-sans text-[18px] font-light text-black">{fmt(price)}</span>
            {disc > 0 && comparePrice && (
              <>
                <span className="font-sans text-[14px] line-through text-[#bbb]">{fmt(comparePrice)}</span>
                <span className="bg-black text-white text-[9px] tracking-widest uppercase px-1.5 py-0.5">
                  -{disc}%
                </span>
              </>
            )}
          </div>

          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-black text-sm">{'★'.repeat(Math.round(product.rating_avg))}{'☆'.repeat(5 - Math.round(product.rating_avg))}</span>
              <span className="font-sans text-[11px] text-[#888]">({product.rating_count})</span>
            </div>
          )}

          {Object.entries(variantTypeMap).map(([typeId, { typeName, options }]) => (
            <div key={typeId} className="mb-5">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-2.5">
                {typeName}
                {selectedOpts[typeId] && (
                  <span className="font-light text-[#888] ml-2 normal-case tracking-normal">
                    — {options.find(o => o.id === selectedOpts[typeId])
                        ? locale === 'fr'
                          ? options.find(o => o.id === selectedOpts[typeId])!.value_fr
                          : options.find(o => o.id === selectedOpts[typeId])!.value_en
                        : ''}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                  const label = locale === 'fr' ? opt.value_fr : opt.value_en
                  const isSelected = selectedOpts[typeId] === opt.id
                  return opt.color_hex ? (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOpts(s => ({ ...s, [typeId]: opt.id }))}
                      title={label}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        isSelected ? 'border-black scale-110' : 'border-transparent'
                      }`}
                      style={{ background: opt.color_hex }}
                    />
                  ) : (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOpts(s => ({ ...s, [typeId]: opt.id }))}
                      className={`px-3 py-1.5 font-sans text-[11px] tracking-[0.08em] uppercase border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-[#e0e0e0] hover:border-black'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 mb-5">
            <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black">
              {locale === 'fr' ? 'QUANTITÉ' : 'QUANTITY'}
            </p>
            <div className="flex items-center border border-[#e0e0e0]">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center font-light text-black hover:bg-[#f5f5f5]"
              >−</button>
              <span className="w-9 h-9 flex items-center justify-center font-sans text-[13px]">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 flex items-center justify-center font-light text-black hover:bg-[#f5f5f5]"
              >+</button>
            </div>
          </div>

          <p className={`font-sans text-[11px] tracking-[0.08em] mb-4 ${
            stock > 5 ? 'text-green-700' : stock > 0 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {stock > 5
              ? (locale === 'fr' ? '✓ En stock' : '✓ In stock')
              : stock > 0
              ? (locale === 'fr' ? `Plus que ${stock} en stock` : `Only ${stock} left`)
              : (locale === 'fr' ? 'Rupture de stock' : 'Out of stock')}
          </p>

          <div className="flex items-center justify-between mt-2 mb-5">
            <SizeGuide locale={locale} />
            <WishlistButton product={product} size="sm" />
          </div>

          <button
            onClick={handleAdd}
            disabled={!inStock || adding}
            className={`
              w-full py-4 font-sans text-[11px] font-medium tracking-[0.22em] uppercase
              transition-all duration-300 border-none cursor-pointer
              ${inStock
                ? adding
                  ? 'bg-[#333] text-white'
                  : 'bg-black text-white hover:opacity-85'
                : 'bg-[#e0e0e0] text-[#999] cursor-not-allowed'
              }
            `}
          >
            {adding
              ? (locale === 'fr' ? '✓ AJOUTÉ' : '✓ ADDED')
              : inStock
                ? (locale === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART')
                : (locale === 'fr' ? 'INDISPONIBLE' : 'UNAVAILABLE')}
          </button>

          <p className="font-sans text-[11px] font-light text-[#888] text-center mt-3 tracking-[0.06em]">
            {locale === 'fr'
              ? `✈ Livraison gratuite dès ${freeThreshold}€ · ${delayFr}`
              : `✈ Free shipping from €${freeThreshold} · ${delayEn}`}
          </p>

          {desc && (
            <div className="mt-7 pt-7 border-t border-[#e8e8e8]">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-3">
                {locale === 'fr' ? 'DESCRIPTION' : 'DESCRIPTION'}
              </p>
              <div className="font-sans text-[13px] font-light text-[#555] leading-relaxed" dangerouslySetInnerHTML={{ __html: desc ?? '' }} />
            </div>
          )}

          {specs && (
            <div className="mt-7 pt-7 border-t border-[#e8e8e8]">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-3">CARACTERISTIQUES</p>
              <ul className="font-sans text-[13px] font-light text-[#555] leading-relaxed list-none">
                {specs.split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 mb-1.5">
                    <span className="text-[#C9A84C]">-</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.faqs && product.faqs.length > 0 && (
            <div className="mt-7 pt-7 border-t border-[#e8e8e8]">
              <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-black mb-4">
                FAQ
              </p>
              <div className="flex flex-col gap-0">
                {product.faqs.map(faq => {
                  const q = locale === 'fr' ? faq.question_fr : faq.question_en
                  const a = locale === 'fr' ? faq.answer_fr   : faq.answer_en
                  const open = openFaq === faq.id
                  return (
                    <div key={faq.id} className="border-b border-[#e8e8e8]">
                      <button
                        onClick={() => setOpenFaq(open ? null : faq.id)}
                        className="w-full flex items-center justify-between py-4 text-left bg-transparent border-0 cursor-pointer"
                      >
                        <span className="font-sans text-[12px] font-normal tracking-[0.06em] text-black pr-3">{q}</span>
                        <ChevronDown size={16} className={`flex-shrink-0 text-[#888] transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      {open && (
                        <p className="font-sans text-[12px] font-light text-[#555] leading-relaxed pb-4">{a}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <ReviewsSection productId={product.id} locale={locale} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-[#f0f0f0] pt-10 pb-10 mt-4">
          <p className="text-center font-sans text-[10px] tracking-[0.3em] uppercase text-[#888] mb-2">
            {locale === 'fr' ? 'VOUS AIMEREZ AUSSI' : 'YOU MAY ALSO LIKE'}
          </p>
          <h2 className="text-center font-serif text-[26px] font-light tracking-[0.1em] uppercase text-black mb-7">
            {locale === 'fr' ? 'Produits similaires' : 'Similar products'}
          </h2>
          <div className="flex gap-3 px-4 overflow-x-auto [scrollbar-hide::-webkit-scrollbar]:hidden" style={{ scrollSnapType: 'x mandatory' }}>
            {related.map(rp => {
              const rname = locale === 'fr' ? rp.name_fr : rp.name_en
              const rimg  = rp.images?.find(i => i.is_primary) ?? rp.images?.[0]
              return (
                <Link
                  key={rp.id}
                  href={`/${locale}/produits/${rp.slug}`}
                  className="flex-shrink-0 w-[65vw] no-underline"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative w-full bg-[#e8e8e8] overflow-hidden mb-3" style={{ aspectRatio: '3/4' }}>
                    {rimg && <Image src={rimg.url} alt={rname} fill className="object-cover" sizes="65vw" />}
                    <button className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-white flex items-center justify-center text-xl font-light text-black">+</button>
                  </div>
                  <p className="font-sans text-[11px] tracking-[0.1em] uppercase text-black mb-1">{rname}</p>
                  <p className="font-sans text-[11px] font-light uppercase text-[#888]">
                    {locale === 'fr' ? 'A PARTIR DE' : 'FROM'} €{rp.price.toFixed(2).replace('.', ',')}
                  </p>
                </Link>
              )
            })}
            <div className="flex-shrink-0 w-4" aria-hidden />
          </div>
        </section>
      )}
    </div>
  )
}
