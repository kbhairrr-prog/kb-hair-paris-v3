import { notFound } from 'next/navigation'
export const revalidate = 0
export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

interface Props { params: { slug: string } }

export default async function PageLegaleEN({ params }: Props) {
  const { slug } = params
  const locale = 'en'

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!page) notFound()

  const title   = page.title_en   || page.title_fr
  const content = page.content_en || page.content_fr

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-white pt-[68px]">
        <div className="bg-[#f0f0f0] px-5 py-10 text-center border-b border-[#e0e0e0]">
          <h1 className="font-serif text-[28px] font-light tracking-[0.12em] uppercase text-black">
            {title}
          </h1>
        </div>
        <div className="max-w-2xl mx-auto px-5 py-12">
          <div
            className="font-sans text-[13px] font-light text-[#444] leading-[1.9] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        </div>
      </main>
      <Footer locale={locale} />
      <CartDrawer locale={locale} />
    </>
  )
}
