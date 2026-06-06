import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CollectionPageClient from '@/components/product/CollectionPageClient'
import type { Metadata } from 'next'

interface Props {
  params: { locale: 'fr' | 'en'; slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!cat) return {}
  const title = params.locale === 'fr' ? cat.seo_title_fr || cat.name_fr : cat.seo_title_en || cat.name_en
  const desc  = params.locale === 'fr' ? cat.seo_description_fr : cat.seo_description_en

  return { title, description: desc }
}

export default async function CollectionPage({ params }: Props) {
  const locale = 'fr'
  const { slug } = params

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) notFound()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(*, options:product_variant_options(*, option:variant_options(*, type:variant_types(*))))
    `)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <CollectionPageClient
      products={products ?? []}
      category={category}
      locale={locale}
    />
  )
}
