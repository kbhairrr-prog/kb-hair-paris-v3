'use client'

import ProductCarousel from '@/components/home/ProductCarousel'
import type { Product } from '@/types'

interface DecouvrezSectionProps {
  bundles: Product[]
  wigs: Product[]
  locale: 'fr' | 'en'
}

export default function DecouvrezSection({ bundles, wigs, locale }: DecouvrezSectionProps) {
  const tabs = [
    {
      key: 'bundles',
      label: locale === 'fr' ? 'NOS BUNDLES' : 'OUR BUNDLES',
      products: bundles,
      href: locale === 'fr' ? '/fr/collections/bundles' : '/en/collections/bundles',
    },
    {
      key: 'wigs',
      label: locale === 'fr' ? 'NOS WIGS' : 'OUR WIGS',
      products: wigs,
      href: locale === 'fr' ? '/fr/collections/wigs' : '/en/collections/wigs',
    },
  ]

  return (
    <ProductCarousel
      tabs={tabs}
      defaultTabKey="bundles"
      locale={locale}
      viewAllLabel="VIEW ALL"
      bgClassName="bg-[#f0f0f0]"
    />
  )
}
