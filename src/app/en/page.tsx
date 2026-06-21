export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import HeroSection      from '@/components/home/HeroSection'
import ProductCarousel  from '@/components/home/ProductCarousel'
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
    title: seo.title_en || 'KB Hair Paris',
    description: seo.description_en || 'Premium raw hair extensions and wigs.',
    openGraph: {
      title: seo.title_en || 'KB Hair Paris',
      description: seo.description_en || 'Premium raw hair extensions and wigs.',
      images: seo.og_image ? [seo.og_image] : undefined,
      locale: 'en_US',
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
  return { bundles, wigs, hairProducts, sections: sections ?? [] }
}

export default async function HomeEN() {
  const { bundles, wigs, hairProducts, sections } = await getData()
  const hero = sections.find(s => s.type === 'hero')?.content as Record<string, string> | undefined

  return (
    <main>
      <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] text-center py-2.5 px-4">
        <p className="font-sans text-[11px] tracking-[0.12em] uppercase text-black">
          PAY IN INSTALLMENTS WITH <strong className="italic">STRIPE, PAYPAL</strong>
        </p>
      </div>
      <HeroSection
        locale="en"
        imageUrl={hero?.image_url}
        videoUrl={hero?.video_url}
        title={hero?.title_en ?? 'GET THE BEST'}
        subtitle={hero?.subtitle_en ?? 'RAW HAIR'}
        ctaLabel={hero?.cta_en ?? 'SHOP NOW'}
        ctaUrl={hero?.cta_url ?? '/en/collections/wigs'}
      />
      <div className="bg-black h-16 w-full" />
      <LuxeSection locale="en" />
      <DecouvrezSection bundles={bundles} wigs={wigs} locale="en" />
      <CollectionBanner locale="en" label="OUR WIGS" href="/en/collections/wigs" />
      <VideoSection locale="en" />
      <Ticker text="RAW HAIR ONLY" />
      <ProductCarousel
        products={hairProducts}
        locale="en"
        eyebrow="KB HAIR PARIS"
        title="HAIR PRODUCTS"
        viewAllHref="/en/collections/produits"
        viewAllLabel="VIEW ALL"
        bgClassName="bg-[#f0f0f0]"
      />
      <OurWigs wigs={wigs} locale="en" />
      <RawHairSection locale="en" />
      <NewsletterDark locale="en" />
      <AvantagesCarousel locale="en" />
      <Footer locale="en" />
    </main>
  )
}
