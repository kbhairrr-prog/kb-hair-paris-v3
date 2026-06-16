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

        {/* Hero titre style ancienne version */}
        <div className="bg-white px-5 py-14 text-center">
          <h1 className="font-serif text-[42px] sm:text-[52px] font-light tracking-[0.18em] uppercase text-black">
            {title}
          </h1>
          <div className="mx-auto mt-4 w-10 h-[1px] bg-[#C9A84C]" />
        </div>

        <div className="border-t border-[#e8e8e8]" />

        <div className="max-w-2xl mx-auto px-6 py-14">

          {/* Citation dorée */}
          {page.quote_fr && (
            <p className="font-serif text-[22px] italic text-[#C9A84C] leading-snug mb-8">
              &ldquo;{page.quote_fr}&rdquo;
            </p>
          )}

          {/* Image optionnelle */}
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

          {/* Contenu principal - style prose serif */}
          <div
            className="
              font-serif text-[17px] font-light text-black leading-[1.95]
              prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:font-light prose-headings:text-black
              prose-h2:text-[32px] prose-h2:tracking-normal prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-[24px] prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-[17px] prose-p:leading-[1.95] prose-p:text-black
              prose-strong:font-semibold prose-strong:text-black
              prose-a:text-[#C9A84C] prose-a:no-underline hover:prose-a:underline
            "
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />

          {/* Bouton Découvrir la Fondatrice si page about */}
          {slug === 'qui-sommes-nous' && (
            <div className="mt-14">
              <a
                href="/fr/pages/la-fondatrice"
                className="block w-full bg-black text-white text-center py-5 text-[11px] tracking-[0.25em] uppercase font-light hover:bg-[#111] transition-colors"
              >
                Découvrir la Fondatrice
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
