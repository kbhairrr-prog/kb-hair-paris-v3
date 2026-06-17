import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProductPageClient from '@/components/product/ProductPageClient'

interface Props {
  params: { locale: 'fr' | 'en'; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('products').select('*').eq('slug', params.slug).single()
  if (!data) return {}
  const title = data.seo_title_fr || data.name_fr
  const desc = data.seo_desc_fr
  return { title, description: desc }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = params
  const locale = 'fr' as const

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      faqs:product_faqs(*),
      variants:product_variants(
        *,
        options:product_variant_options(
          *,
          option:variant_options(*, type:variant_types(*))
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // Produits associés — manuels d'abord, puis auto par catégorie
  let related: any[] = []

  // 1. Essayer les produits associés configurés manuellement
  const { data: manualRelated } = await supabase
    .from('product_related' as any)
    .select('related:related_id(*, images:product_images(*))')
    .eq('product_id', product.id)
    .order('position')
    .limit(6)

  if (manualRelated && manualRelated.length > 0) {
    related = manualRelated.map((r: any) => r.related).filter(Boolean)
  }

  // 2. Compléter avec la même catégorie si moins de 6
  if (related.length < 6 && product.category_id) {
    const existingIds = related.map((r: any) => r.id)
    const { data: autoRelated } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', product.id)
      .not('id', 'in', existingIds.length > 0 ? `(${existingIds.join(',')})` : '(null)')
      .limit(6 - related.length)

    related = [...related, ...(autoRelated ?? [])]
  }

  // Normaliser variantes
  const normalizedProduct = {
    ...product,
    variants: product.variants?.map((v: any) => ({
      ...v,
      options: v.options?.map((o: any) => ({
        ...o.option,
        variant_type: o.option?.type,
      })) ?? [],
    })) ?? [],
    images: product.images?.sort((a: any, b: any) => a.position - b.position) ?? [],
    faqs:   product.faqs?.sort((a: any, b: any) => a.position - b.position)   ?? [],
  }

  return (
    <ProductPageClient
      product={normalizedProduct}
      related={related ?? []}
      locale={locale}
    />
  )
}
