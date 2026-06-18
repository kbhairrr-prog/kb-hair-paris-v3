'use client'
import RichEditor from '@/components/ui/RichEditor'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash2, GripVertical, Upload, X, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProductFormProps {
  productId?: string // undefined = nouveau produit
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router  = useRouter()
  const isNew   = !productId
  const [saving, setSaving] = useState(false)
  const [cats,   setCats]   = useState<any[]>([])
  const [variantTypes, setVariantTypes] = useState<any[]>([])

  // Form state
  const [form, setForm] = useState({
    name_fr: '', name_en: '', slug: '',
    description_fr: '', description_en: '',
    short_desc_fr: '', short_desc_en: '',
    price: '', compare_price: '', cost_price: '',
    sku: '', category_id: '',
    is_active: true, is_featured: false, is_new: false, is_bestseller: false,
    track_inventory: true, allow_backorder: false,
    seo_title_fr: '', seo_title_en: '', seo_desc_fr: '', seo_desc_en: '',
    tags: '',
    specs_fr: '', specs_en: '',
  })

  const [images,   setImages]   = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [faqs,     setFaqs]     = useState<any[]>([])
  const [uploading,setUploading]= useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingFaq, setGeneratingFaq] = useState(false)
  const [suggestingVariants, setSuggestingVariants] = useState(false)

  const suggestVariantsWithAI = async () => {
    const firstImage = images[0]?.url
    if (!firstImage && !form.name_fr) { alert('Uploadez une image ou remplissez le nom'); return }
    setSuggestingVariants(true)
    try {
      const res = await fetch('/api/ai/suggest-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: firstImage ?? '', name_fr: form.name_fr, categoryName: cats.find(c => c.id === form.category_id)?.name_fr ?? '', variantTypes }),
      })
      const data = await res.json()
      if (data.error) { alert('Erreur IA: ' + data.error); return }
      if (data.variants && Array.isArray(data.variants)) {
        setVariants(data.variants.map((v: any) => ({ ...v, price: '', stock: 0, is_active: true, sku: '' })))
      }
    } catch (err) {
      alert('Erreur lors de la suggestion')
    } finally {
      setSuggestingVariants(false)
      await supabase.auth.refreshSession()
    }
  }

  const generateFAQWithAI = async () => {
    if (!form.name_fr && !form.description_fr) {
      alert('Generez d abord la description du produit')
      return
    }
    setGeneratingFaq(true)
    try {
      const res = await fetch('/api/ai/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_fr: form.name_fr,
          name_en: form.name_en,
          description_fr: form.description_fr,
          description_en: form.description_en,
          categoryName: cats.find(c => c.id === form.category_id)?.name_fr ?? '',
        }),
      })
      const data = await res.json()
      if (data.error) { alert('Erreur IA: ' + data.error); return }
      if (data.faqs && Array.isArray(data.faqs)) {
        setFaqs(data.faqs)
      }
    } catch (err) {
      alert('Erreur lors de la generation des FAQ')
    } finally {
      setGeneratingFaq(false)
      await supabase.auth.refreshSession()
    }
  }

  const generateWithAI = async () => {
    const firstImage = images[0]?.url
    if (!firstImage) { alert('Uploadez une image en premier'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: firstImage, categoryName: cats.find(c => c.id === form.category_id)?.name_fr ?? '' }),
      })
      const data = await res.json()
      if (data.error) { alert('Erreur IA: ' + data.error); return }
      setForm(f => ({
        ...f,
        name_fr: data.name_fr || f.name_fr,
        name_en: data.name_en || f.name_en,
        description_fr: data.description_fr || f.description_fr,
        description_en: data.description_en || f.description_en,
        short_desc_fr: data.short_desc_fr || f.short_desc_fr,
        short_desc_en: data.short_desc_en || f.short_desc_en,
        seo_title_fr: data.seo_title_fr || f.seo_title_fr,
        seo_title_en: data.seo_title_en || f.seo_title_en,
        seo_desc_fr: data.seo_desc_fr || f.seo_desc_fr,
        seo_desc_en: data.seo_desc_en || f.seo_desc_en,
        tags: data.tags || f.tags,
        slug: (data.name_fr || f.name_fr).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }))
    } catch (err) {
      alert('Erreur lors de la generation')
    } finally {
      setGenerating(false)
      await supabase.auth.refreshSession()
    }
  }

  // Charger catégories et types de variantes
  useEffect(() => {
    supabase.from('categories').select('id,name_fr').eq('is_active',true).then(({data}) => setCats(data ?? []))
    supabase.from('variant_types').select('*').order('position').then(({data}) => { console.log('variantTypes loaded:', data); setVariantTypes(data ?? []) })
  }, [])

  // Charger produit si édition
  useEffect(() => {
    if (!productId) return
    supabase.from('products')
      .select('*, images:product_images(*), variants:product_variants(*, options:product_variant_options(*, option:variant_options(*))), faqs:product_faqs(*)')
      .eq('id', productId).single()
      .then(({ data }) => {
        if (!data) return
        setForm({
          name_fr: data.name_fr ?? '', name_en: data.name_en ?? '',
          slug: data.slug ?? '', description_fr: data.description_fr ?? '',
          description_en: data.description_en ?? '',
          short_desc_fr: data.short_desc_fr ?? '', short_desc_en: data.short_desc_en ?? '',
          price: String(data.price ?? ''), compare_price: String(data.compare_price ?? ''),
          cost_price: String(data.cost_price ?? ''), sku: data.sku ?? '',
          category_id: data.category_id ?? '',
          is_active: data.is_active, is_featured: data.is_featured,
          is_new: data.is_new, is_bestseller: data.is_bestseller,
          track_inventory: data.track_inventory, allow_backorder: data.allow_backorder,
          seo_title_fr: data.seo_title_fr ?? '', seo_title_en: data.seo_title_en ?? '',
          seo_desc_fr: data.seo_desc_fr ?? '', seo_desc_en: data.seo_desc_en ?? '',
          tags: (data.tags ?? []).join(', '),
          specs_fr: data.specs_fr ?? '', specs_en: data.specs_en ?? '',
        })
        setImages(data.images?.sort((a: any, b: any) => a.position - b.position) ?? [])
        // Reconstruire selectedOptions a partir des options chargees depuis la base
        const loadedVariants = (data.variants ?? []).map((v: any) => {
          const selectedOptions: Record<string, string> = {}
          ;(v.options ?? []).forEach((po: any) => {
            const opt = po.option
            if (opt?.variant_type_id) {
              selectedOptions[opt.variant_type_id] = opt.value_fr ?? ''
            }
          })
          return {
            id: v.id,
            sku: v.sku ?? '',
            price: v.price != null ? String(v.price) : '',
            stock: v.stock ?? 0,
            is_active: v.is_active,
            selectedOptions,
          }
        })
        setVariants(loadedVariants)
        setFaqs(data.faqs?.sort((a: any, b: any) => a.position - b.position) ?? [])
      })
  }, [productId])

  // Auto-slug depuis name_fr
  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value
    setForm(f => {
      const next = { ...f, [field]: val }
      if (field === 'name_fr' && isNew) {
        next.slug = val.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }
      return next
    })
  }

  const toggleField = (field: string) => () => setForm(f => ({ ...f, [field]: !(f as any)[field] }))

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const ext  = file.name.split('.').pop()
      const path = `products/${productId ?? 'new'}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file)
      if (error) continue
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
      setImages(imgs => [...imgs, {
        url: publicUrl, position: imgs.length,
        is_primary: imgs.length === 0, type: 'image',
      }])
    }
    setUploading(false)
  }

  const removeImage = (idx: number) => setImages(imgs => imgs.filter((_, i) => i !== idx))
  const setPrimary  = (idx: number) => setImages(imgs => imgs.map((img, i) => ({ ...img, is_primary: i === idx })))

  // Variantes
  const addVariant = () => {
    if (variantTypes.length === 0) {
      supabase.from('variant_types').select('*').eq('is_active', true).order('position')
        .then(({data}) => {
          if (data) setVariantTypes(data)
          setVariants(vs => [...vs, { sku: '', price: '', stock: 0, is_active: true, selectedOptions: {} }])
        })
    } else {
      setVariants(vs => [...vs, { sku: '', price: '', stock: 0, is_active: true, selectedOptions: {} }])
    }
  }
  const removeVariant = (idx: number) => setVariants(vs => vs.filter((_, i) => i !== idx))
  const updateVariant = (idx: number, field: string, val: any) =>
    setVariants(vs => vs.map((v, i) => i === idx ? { ...v, [field]: val } : v))

  // FAQs
  const addFaq = () => setFaqs(fs => [...fs, { question_fr: '', question_en: '', answer_fr: '', answer_en: '' }])
  const removeFaq = (idx: number) => setFaqs(fs => fs.filter((_, i) => i !== idx))
  const updateFaq = (idx: number, field: string, val: string) =>
    setFaqs(fs => fs.map((f, i) => i === idx ? { ...f, [field]: val } : f))

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.auth.refreshSession()
      const productData = {
        name_fr: form.name_fr, name_en: form.name_en || form.name_fr,
        slug: form.slug,
        description_fr: form.description_fr, description_en: form.description_en,
        short_desc_fr: form.short_desc_fr, short_desc_en: form.short_desc_en,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        sku: form.sku || null, category_id: form.category_id || null,
        is_active: form.is_active, is_featured: form.is_featured,
        is_new: form.is_new, is_bestseller: form.is_bestseller,
        track_inventory: form.track_inventory, allow_backorder: form.allow_backorder,
        seo_title_fr: form.seo_title_fr, seo_title_en: form.seo_title_en,
        seo_desc_fr: form.seo_desc_fr, seo_desc_en: form.seo_desc_en,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        specs_fr: form.specs_fr || null, specs_en: form.specs_en || null,
        updated_at: new Date().toISOString(),
      }

      let pid = productId
      if (isNew) {
        const { data } = await supabase.from('products').insert(productData).select().single()
        pid = data?.id
      } else {
        await supabase.from('products').update(productData).eq('id', pid)
      }

      if (!pid) throw new Error('Product ID missing')

      // Sauvegarder images
      await supabase.from('product_images').delete().eq('product_id', pid)
      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((img, i) => ({
            product_id: pid, url: img.url, position: i,
            is_primary: img.is_primary, type: img.type ?? 'image',
            alt_fr: img.alt_fr, alt_en: img.alt_en,
          }))
        )
      }

      // Sauvegarder FAQs
      await supabase.from('product_faqs').delete().eq('product_id', pid)
      if (faqs.length > 0) {
        await supabase.from('product_faqs').insert(
          faqs.map((f, i) => ({ ...f, product_id: pid, position: i }))
        )
      }

      // Sauvegarder variantes (et leurs options liees)
      await supabase.from('product_variants').delete().eq('product_id', pid)
      if (variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i]
          const { data: newVariant } = await supabase.from('product_variants').insert({
            product_id: pid,
            sku: v.sku || null,
            price: v.price ? parseFloat(v.price) : null,
            stock: v.stock ?? 0,
            is_active: v.is_active ?? true,
            position: i,
          }).select().single()

          if (!newVariant) continue

          const optionIds: string[] = []
          for (const [typeId, rawValue] of Object.entries(v.selectedOptions ?? {})) {
            // Support format {fr, en} (IA) ou string simple (manuel)
            const isBilingual = rawValue && typeof rawValue === 'object' && 'fr' in (rawValue as any)
            const valFr = isBilingual ? String((rawValue as any).fr).trim() : String(rawValue).trim()
            const valEn = isBilingual ? String((rawValue as any).en).trim() : String(rawValue).trim()
            if (!valFr) continue

            const { data: existingOpt } = await supabase
              .from('variant_options')
              .select('id')
              .eq('variant_type_id', typeId)
              .eq('value_fr', valFr)
              .maybeSingle()

            let optId = existingOpt?.id

            if (!optId) {
              const { data: createdOpt } = await supabase
                .from('variant_options')
                .insert({ variant_type_id: typeId, value_fr: valFr, value_en: valEn, is_active: true })
                .select()
                .single()
              optId = createdOpt?.id
            }

            if (optId) optionIds.push(optId)
          }

          if (optionIds.length > 0) {
            await supabase.from('product_variant_options').insert(
              optionIds.map(oid => ({ variant_id: newVariant.id, option_id: oid }))
            )
          }
        }
      }

      router.push('/admin/produits')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full px-3 py-2.5 border border-[#e0e0e0] bg-white font-sans text-[12px] font-light text-black placeholder:text-[#bbb] outline-none focus:border-black transition-colors"
  const labelCls = "font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-[#555] mb-1.5 block"

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-sans text-[14px] font-medium tracking-[0.1em] uppercase">
          {isNew ? 'Nouveau produit' : 'Modifier le produit'}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="font-sans text-[11px] tracking-[0.1em] uppercase text-[#888] hover:text-black bg-transparent border-none cursor-pointer">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white font-sans text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 hover:opacity-85 border-none cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-5">

        {/* INFOS GÉNÉRALES */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">
              Informations générales
            </p>
            <button
              type="button"
              onClick={generateWithAI}
              disabled={generating || images.length === 0}
              className="flex items-center gap-2 px-4 py-2 font-sans text-[10px] tracking-[0.12em] uppercase border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style={{backgroundColor:'#C9A84C', color:'white'}}
              title={images.length === 0 ? 'Uploadez une image dabord' : 'Generer avec IA'}
            >
              {generating ? 'Generation...' : 'Generer avec IA'}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nom FR *</label>
                <input value={form.name_fr} onChange={updateField('name_fr')} placeholder="Nom en français" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nom EN</label>
                <input value={form.name_en} onChange={updateField('name_en')} placeholder="Name in English" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Slug (URL)</label>
              <input value={form.slug} onChange={updateField('slug')} placeholder="mon-produit" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Description FR</label>
                <RichEditor value={form.description_fr} onChange={(val) => setForm(f => ({...f, description_fr: val}))} rows={6} />
              </div>
              <div>
                <label className={labelCls}>Description EN</label>
                <RichEditor value={form.description_en} onChange={(val) => setForm(f => ({...f, description_en: val}))} rows={6} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Catégorie</label>
                <select value={form.category_id} onChange={updateField('category_id')} className={inputCls}>
                  <option value="">— Choisir —</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                </select>
                {form.category_id && (() => {
                  const catDescriptions: Record<string, string> = {
                    'wigs': 'Perruques lace front, full lace, 360°, tressées ou colorées.',
                    'bundles': 'Tissages raw hair cambodgien, indien, brésilien. Cheveux non traités.',
                    'frontales': 'Frontales 13x4 ou 13x6. Se pose sur le front avec colle lace.',
                    'closures': 'Closures 4x4 ou 5x5. Finition du dessus de tête.',
                    'produits': 'Produits d entretien pour extensions : shampoings, soins, colles.',
                    'accessoires': 'Accessoires capillaires : outils, filets, bonnets, aiguilles.',
                    'vip-cards': 'Cartes fidélité VIP avec avantages exclusifs pour les clientes.',
                    'services': 'Services proposés en boutique : pose, entretien, conseil.',
                  }
                  const selectedCat = cats.find(c => c.id === form.category_id)
                  const desc = selectedCat ? catDescriptions[selectedCat.slug] : null
                  return desc ? <p className="font-sans text-[10px] text-[#888] mt-1 italic">{desc}</p> : null
                })()}
              </div>
              <div>
                <label className={labelCls}>SKU</label>
                <input value={form.sku} onChange={updateField('sku')} placeholder="KB-001" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Tags (séparés par virgule)</label>
              <input value={form.tags} onChange={updateField('tags')} placeholder="raw hair, cambodge, wave" className={inputCls} />
            </div>
          </div>
        </div>

        {/* PRIX */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">Prix</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Prix de vente (€) *</label>
              <input type="number" step="0.01" value={form.price} onChange={updateField('price')} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Prix barré (€)</label>
              <input type="number" step="0.01" value={form.compare_price} onChange={updateField('compare_price')} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Coût (€)</label>
              <input type="number" step="0.01" value={form.cost_price} onChange={updateField('cost_price')} placeholder="0.00" className={inputCls} />
            </div>
          </div>
        </div>

        {/* CARACTERISTIQUES */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">Caracteristiques (optionnel)</p>
          <p className="font-sans text-[11px] text-[#888] mb-3">Une info par ligne, ex: Longueur : 20 pouces</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Caracteristiques FR</label>
              <textarea value={form.specs_fr} onChange={updateField('specs_fr')} rows={4} placeholder={"Longueur : 20 pouces\nTexture : Lisse\nCouleur : Naturel\nDensite : 150%\nType de lace : 13x4\nOrigine : Vietnam"} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Caracteristiques EN</label>
              <textarea value={form.specs_en} onChange={updateField('specs_en')} rows={4} placeholder={"Length: 20 inches\nTexture: Straight\nColor: Natural\nDensity: 150%\nLace type: 13x4\nOrigin: Vietnam"} className={inputCls} />
            </div>
          </div>
        </div>
        {/* IMAGES */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">Images</p>

          {/* Upload zone */}
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#e0e0e0] cursor-pointer hover:border-black transition-colors mb-4">
            <Upload size={20} className="text-[#aaa] mb-1" />
            <span className="font-sans text-[11px] text-[#aaa]">
              {uploading ? 'Upload en cours...' : 'Cliquer pour ajouter des images'}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Grille images */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <div className={`relative w-full bg-[#f5f5f5] overflow-hidden border-2 transition-colors ${img.is_primary ? 'border-black' : 'border-transparent'}`} style={{ aspectRatio: '3/4' }}>
                    <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
                    {img.is_primary && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center text-[8px] tracking-widest uppercase py-0.5">
                        Principal
                      </div>
                    )}
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setPrimary(i)} className="w-5 h-5 bg-white text-[8px] flex items-center justify-center border border-[#e0e0e0]" title="Image principale">★</button>
                    <button onClick={() => removeImage(i)} className="w-5 h-5 bg-white flex items-center justify-center border border-[#e0e0e0]">
                      <X size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VARIANTES */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">Variantes</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={suggestVariantsWithAI} disabled={suggestingVariants} className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border-none cursor-pointer disabled:opacity-40 hover:opacity-80" style={{backgroundColor:'#C9A84C',color:'white'}}>
                {suggestingVariants ? 'Analyse...' : 'IA Variantes'}
              </button>
              <button onClick={addVariant} className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.1em] uppercase text-black border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors bg-transparent cursor-pointer">
                <Plus size={12} /> Ajouter
              </button>
            </div>
          </div>
          {variants.length === 0 ? (
            <p className="font-sans text-[12px] text-[#aaa] text-center py-4">
              Aucune variante — le produit sera vendu sans options
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {variants.map((v, i) => (
                <div key={i} className="border border-[#e8e8e8] p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {variantTypes.map(vt => (
                      <div key={vt.id}>
                        <label className={labelCls}>{vt.name_fr}</label>
                        <input
                          value={v.selectedOptions?.[vt.id] ?? ''}
                          onChange={e => updateVariant(i, 'selectedOptions', { ...v.selectedOptions, [vt.id]: e.target.value })}
                          placeholder={vt.name_fr === 'Longueur' ? 'ex: 16 pouces' : vt.name_fr === 'Texture' ? 'ex: Straight' : vt.name_fr === 'Couleur' ? 'ex: Naturel' : vt.name_fr === 'Densité' ? 'ex: 150%' : 'ex: 13x4'}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <label className={labelCls}>Prix (€)</label>
                      <input type="number" step="0.01" value={v.price ?? ''} onChange={e => updateVariant(i, 'price', e.target.value)} placeholder="0.00" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Stock</label>
                      <input type="number" value={v.stock ?? 0} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value))} placeholder="0" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>SKU variante</label>
                      <input value={v.sku ?? ''} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="KB-001-16" className={inputCls} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={v.is_active} onChange={e => updateVariant(i, 'is_active', e.target.checked)} />
                      <span className="font-sans text-[11px] text-[#555]">Active</span>
                    </label>
                    <button onClick={() => removeVariant(i)} className="text-[#aaa] hover:text-red-600 bg-transparent border-none cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black">FAQ</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateFAQWithAI}
                disabled={generatingFaq || (!form.name_fr && !form.description_fr)}
                className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
                style={{backgroundColor:'#C9A84C', color:'white'}}
              >
                {generatingFaq ? 'Generation...' : 'IA FAQ'}
              </button>
              <button onClick={addFaq} className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.1em] uppercase text-black border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors bg-transparent cursor-pointer">
                <Plus size={12} /> Ajouter
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((f, i) => (
              <div key={i} className="border border-[#e8e8e8] p-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={f.question_fr} onChange={e => updateFaq(i, 'question_fr', e.target.value)} placeholder="Question FR" className={inputCls} />
                  <input value={f.question_en} onChange={e => updateFaq(i, 'question_en', e.target.value)} placeholder="Question EN" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <textarea value={f.answer_fr} onChange={e => updateFaq(i, 'answer_fr', e.target.value)} placeholder="Réponse FR" rows={2} className={`${inputCls} resize-none`} />
                  <textarea value={f.answer_en} onChange={e => updateFaq(i, 'answer_en', e.target.value)} placeholder="Answer EN" rows={2} className={`${inputCls} resize-none`} />
                </div>
                <button onClick={() => removeFaq(i)} className="text-[#aaa] hover:text-red-600 bg-transparent border-none cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">SEO</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Meta titre FR</label>
              <input value={form.seo_title_fr} onChange={updateField('seo_title_fr')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Meta titre EN</label>
              <input value={form.seo_title_en} onChange={updateField('seo_title_en')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Meta description FR</label>
              <textarea value={form.seo_desc_fr} onChange={updateField('seo_desc_fr')} rows={2} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Meta description EN</label>
              <textarea value={form.seo_desc_en} onChange={updateField('seo_desc_en')} rows={2} className={`${inputCls} resize-none`} />
            </div>
          </div>
        </div>

        {/* STATUT */}
        <div className="bg-white border border-[#e8e8e8] px-5 py-5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-black mb-4">Statut & Options</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { field: 'is_active',     label: 'Produit actif (visible sur le site)' },
              { field: 'is_featured',   label: 'Mis en avant' },
              { field: 'is_new',        label: 'Badge Nouveau' },
              { field: 'is_bestseller', label: 'Badge Bestseller' },
              { field: 'track_inventory', label: 'Suivre le stock' },
              { field: 'allow_backorder', label: 'Commande même si épuisé' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form as any)[field]}
                  onChange={toggleField(field)}
                  className="w-4 h-4"
                />
                <span className="font-sans text-[12px] font-light text-[#555]">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bouton bas */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-black text-white font-sans text-[11px] font-medium tracking-[0.22em] uppercase py-4 hover:opacity-85 border-none cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Sauvegarde en cours...' : isNew ? 'CRÉER LE PRODUIT' : 'ENREGISTRER LES MODIFICATIONS'}
        </button>
      </div>
    </div>
  )
}
