import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, isNew, productData, images, faqs, variants } = body

    const supabaseAdmin = createAdminClient()

    let pid = productId
    if (isNew) {
      const { data, error } = await supabaseAdmin.from('products').insert(productData).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      pid = data?.id
    } else {
      const { error } = await supabaseAdmin.from('products').update(productData).eq('id', pid)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!pid) {
      return NextResponse.json({ error: 'Product ID missing' }, { status: 400 })
    }

    // Images
    await supabaseAdmin.from('product_images').delete().eq('product_id', pid)
    if (images && images.length > 0) {
      await supabaseAdmin.from('product_images').insert(
        images.map((img: any, i: number) => ({
          product_id: pid, url: img.url, position: i,
          is_primary: img.is_primary, type: img.type ?? 'image',
          alt_fr: img.alt_fr, alt_en: img.alt_en,
        }))
      )
    }

    // FAQs
    await supabaseAdmin.from('product_faqs').delete().eq('product_id', pid)
    if (faqs && faqs.length > 0) {
      await supabaseAdmin.from('product_faqs').insert(
        faqs.map((f: any, i: number) => ({ ...f, product_id: pid, position: i }))
      )
    }

    // Variantes + options liees
    await supabaseAdmin.from('product_variants').delete().eq('product_id', pid)
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i]
        const { data: newVariant } = await supabaseAdmin.from('product_variants').insert({
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
          const isBilingual = rawValue && typeof rawValue === 'object' && 'fr' in (rawValue as any)
          const valFr = isBilingual ? String((rawValue as any).fr).trim() : String(rawValue).trim()
          const valEn = isBilingual ? String((rawValue as any).en).trim() : String(rawValue).trim()
          if (!valFr) continue

          const { data: existingOpt } = await supabaseAdmin
            .from('variant_options')
            .select('id')
            .eq('variant_type_id', typeId)
            .eq('value_fr', valFr)
            .maybeSingle()

          let optId = existingOpt?.id

          if (!optId) {
            const { data: createdOpt } = await supabaseAdmin
              .from('variant_options')
              .insert({ variant_type_id: typeId, value_fr: valFr, value_en: valEn, is_active: true })
              .select()
              .single()
            optId = createdOpt?.id
          }

          if (optId) optionIds.push(optId)
        }

        if (optionIds.length > 0) {
          await supabaseAdmin.from('product_variant_options').insert(
            optionIds.map(oid => ({ variant_id: newVariant.id, option_id: oid }))
          )
        }
      }
    }

    return NextResponse.json({ success: true, productId: pid })
  } catch (err: any) {
    console.error('save-product error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
