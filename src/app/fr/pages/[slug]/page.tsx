export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

interface Props { params: { slug: string } }

export default async function PageLegaleFR({ params }: Props) {
  const { slug } = params
  const locale = 'fr'

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!page) notFound()

  const title   = page.title_fr   || page.title_en
  const content = page.content_fr || page.content_en

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
          {page.image_url && (
            <div className="mb-8 flex justify-center">
              <img src={page.image_url} alt={title} className="w-full max-w-sm rounded-sm object-cover object-top" style={{maxHeight:'500px'}} />
            </div>
          )}
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
