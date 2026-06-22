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
              <img
                src={page.image_url}
                alt={title}
                className="w-full max-w-sm rounded-sm object-cover object-top"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}
          <style dangerouslySetInnerHTML={{ __html: `
            .kb-content p:first-child {
              font-family: inherit;
              font-size: 1.4rem;
              font-style: italic;
              color: #C9A84C;
              line-height: 1.4;
              margin-bottom: 2rem;
            }
            #kb-page-content h2, #kb-page-content h2 * {
              font-family: inherit;
              font-size: 2rem;
              font-weight: 300;
              color: #000;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
              text-transform: none !important;
              letter-spacing: 0.01em !important;
              font-size: 1.9rem !important;
              font-weight: 300 !important;
            }
            .kb-content p {
              font-size: 1rem;
              font-weight: 300;
              color: #000;
              line-height: 1.9;
              margin-bottom: 1rem;
            }
          ` }} />
          <div
            id="kb-page-content"
            className="kb-content font-serif"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
          {slug === 'qui-sommes-nous' && (
            <div className="mt-14">
              <a
                href="/fr/pages/le-fondateur"
                className="block w-full bg-black text-white text-center py-5 text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#111] transition-colors"
              >
                Découvrir le Fondateur
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
