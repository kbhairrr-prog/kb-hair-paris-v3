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
  const content = (page.content_en && page.content_en.length > 10) ? page.content_en : page.content_fr
  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-white pt-[68px]">
        <div className="bg-white px-5 py-12 text-center">
          <h1 className="font-serif text-[28px] sm:text-[38px] font-light tracking-[0.15em] uppercase text-black leading-tight">
            {title}
          </h1>
          <div className="mx-auto mt-5 w-10 h-[1px] bg-[#C9A84C]" />
        </div>
        <div className="border-t border-[#e8e8e8]" />
        <div className="max-w-2xl mx-auto px-6 py-14">
          {page.image_url && (
            <div className="mb-10 flex justify-center">
              <img src={page.image_url} alt={title} className="w-full max-w-sm rounded-sm object-cover object-top" style={{ maxHeight: '500px' }} />
            </div>
          )}
          <style dangerouslySetInnerHTML={{ __html: `
            .kb-content-en p:first-child {
              font-family: inherit;
              font-size: 1.4rem;
              font-style: italic;
              color: #C9A84C;
              line-height: 1.4;
              margin-bottom: 2rem;
            }
            .kb-content-en p {
              font-size: 1rem;
              font-weight: 300;
              color: #000;
              line-height: 1.9;
              margin-bottom: 1rem;
            }
          ` }} />
          <div id="kb-page-content-en" className="kb-content-en font-serif" dangerouslySetInnerHTML={{ __html: content ?? '' }} />
          {slug === 'who-we-are' && (
            <div className="mt-14">
              <a href="/en/pages/the-founder" className="block w-full bg-black text-white text-center py-5 text-[11px] tracking-[0.25em] uppercase font-light transition-colors">
                Discover the Founder
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
      <CartDrawer locale={locale} />
    </>
  )
}