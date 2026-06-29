export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import HeroSection      from '@/components/home/HeroSection'
import ProductCarousel  from '@/components/home/ProductCarousel'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import Ticker           from '@/components/ui/Ticker'
import DecouvrezSection from '@/components/home/DecouvrezSection'
import Footer           from '@/components/layout/Footer'
import {
  LuxeSection,
  CollectionBanner,
  VideoSection,
  HairProducts,
  OurWigs,
  RawHairSection,
  NewsletterDark,
  AvantagesCarousel,
} from '@/components/home/HomeComponents'
import type { Product } from '@/types'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'seo').single()
  const seo = data?.value ?? {}
  return {
    title: seo.title_fr || 'KB Hair Paris',
    description: seo.description_fr || 'Extensions et perruques raw hair premium.',
    openGraph: {
      title: seo.title_fr || 'KB Hair Paris',
      description: seo.description_fr || 'Extensions et perruques raw hair premium.',
      images: seo.og_image ? [seo.og_image] : undefined,
      locale: 'fr_FR',
      type: 'website',
      siteName: 'KB Hair Paris',
    },
  }
}


async function getData() {
  const getCatId = async (slug: string) => {
    const { data } = await supabase.from('categories').select('id').eq('slug', slug).single()
    return data?.id
  }
  const [bundlesCatId, wigsCatId, produitsCatId] = await Promise.all([
    getCatId('bundles'), getCatId('wigs'), getCatId('produits'),
  ])
  const fetch6 = async (catId?: string) => {
    if (!catId) return []
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('category_id', catId).eq('is_active', true)
      .order('display_order', { ascending: true }).order('created_at', { ascending: false }).limit(6)
    return (data as Product[]) ?? []
  }
  const [bundles, wigs, hairProducts] = await Promise.all([
    fetch6(bundlesCatId), fetch6(wigsCatId), fetch6(produitsCatId),
  ])
  const { data: sections } = await supabase
    .from('homepage_sections').select('*').eq('is_active', true).order('position')
  const { data: settingsData } = await supabase.from('site_settings').select('*').eq('key', 'promo_banner').single()
  const promoBanner = settingsData?.value ?? null
  return { bundles, wigs, hairProducts, sections: sections ?? [], promoBanner }
}

export default async function HomeFR() {
  const { bundles, wigs, hairProducts, sections, promoBanner } = await getData()
  const hero = sections.find(s => s.type === 'hero')?.content as Record<string, string> | undefined

  return (
    <main>
      <HeroSection
        locale="fr"
        imageUrl={hero?.image_url}
        videoUrl={hero?.video_url}
        title={hero?.title_fr ?? 'GET THE BEST'}
        subtitle={hero?.subtitle_fr ?? 'RAW HAIR'}
        ctaLabel={hero?.cta_fr ?? 'SHOP NOW'}
        ctaUrl={hero?.cta_url ?? '/fr/collections/wigs'}
      />
      <LuxeSection locale="fr" />
      <DecouvrezSection bundles={bundles} wigs={wigs} locale="fr" />
      <CollectionBanner locale="fr" label="NOS WIGS" href="/fr/collections/wigs" />
      <VideoSection locale="fr" />
      <Ticker text="RAW HAIR ONLY" />
      <ProductCarousel
        products={hairProducts}
        locale="fr"
        eyebrow="KB HAIR PARIS"
        title="HAIR PRODUCTS"
        viewAllHref="/fr/collections/produits"
        viewAllLabel="VIEW ALL"
        bgClassName="bg-[#f0f0f0]"
      />
      {promoBanner?.active && (
        <div className="bg-[#1a1a1a] py-4 px-4 text-center">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase" style={{color:'#C9A84C'}}>{promoBanner.text_fr}</p>
        </div>
      )}
      <RawHairSection locale="fr" />
      <TestimonialsSection locale="fr" />
      <NewsletterDark locale="fr" />
      <AvantagesCarousel locale="fr" />
      <Footer locale="fr" />
    </main>
  )
}
