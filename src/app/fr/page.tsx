import { supabase } from '@/lib/supabase'
import HeroSection      from '@/components/home/HeroSection'
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
      .order('created_at', { ascending: false }).limit(6)
    return (data as Product[]) ?? []
  }
  const [bundles, wigs, hairProducts] = await Promise.all([
    fetch6(bundlesCatId), fetch6(wigsCatId), fetch6(produitsCatId),
  ])
  const { data: sections } = await supabase
    .from('homepage_sections').select('*').eq('is_active', true).order('position')
  return { bundles, wigs, hairProducts, sections: sections ?? [] }
}

export default async function HomeFR() {
  const { bundles, wigs, hairProducts, sections } = await getData()
  const hero = sections.find(s => s.type === 'hero')?.content as Record<string, string> | undefined

  return (
    <main>
      <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] text-center py-2.5 px-4">
        <p className="font-sans text-[11px] tracking-[0.12em] uppercase text-black">
          PAYEZ EN PLUSIEURS FOIS AVEC <strong className="italic">STRIPE, PAYPAL</strong>
        </p>
      </div>
      <HeroSection
        locale="fr"
        imageUrl={hero?.image_url}
        videoUrl={hero?.video_url}
        title="GET THE BEST"
        subtitle="RAW HAIR"
        ctaLabel="SHOP NOW"
        ctaUrl="/fr/collections/wigs"
      />
      <Ticker text="RAW HAIR ONLY" />
      <LuxeSection locale="fr" />
      <DecouvrezSection bundles={bundles} wigs={wigs} locale="fr" />
      <CollectionBanner locale="fr" label="NOS WIGS" href="/fr/collections/wigs" />
      <VideoSection locale="fr" />
      <Ticker text="RAW HAIR ONLY" />
      <HairProducts products={hairProducts} locale="fr" />
      <OurWigs wigs={wigs} locale="fr" />
      <RawHairSection locale="fr" />
      <NewsletterDark locale="fr" />
      <AvantagesCarousel locale="fr" />
      <Footer locale="fr" />
    </main>
  )
}
