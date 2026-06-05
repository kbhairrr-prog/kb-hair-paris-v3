import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kbhair.fr'

  const { data: products } = await supabase
    .from('products').select('slug,updated_at').eq('is_active', true)
  const { data: categories } = await supabase
    .from('categories').select('slug,updated_at').eq('is_active', true)

  const locales = ['fr', 'en']
  const routes: MetadataRoute.Sitemap = []

  // Pages statiques
  for (const locale of locales) {
    routes.push(
      { url: `${base}/${locale}`,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
      { url: `${base}/${locale}/collections`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
      { url: `${base}/${locale}/compte`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    )
  }

  // Catégories
  for (const cat of categories ?? []) {
    for (const locale of locales) {
      routes.push({
        url: `${base}/${locale}/collections/${cat.slug}`,
        lastModified: new Date(cat.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Produits
  for (const product of products ?? []) {
    for (const locale of locales) {
      routes.push({
        url: `${base}/${locale}/produits/${product.slug}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  return routes
}
