'use client'

const AVANTAGES = {
  fr: [
    { icon: '✈️', title: 'FREE SHIPPING', text: 'Livraison gratuite dès 230€ partout dans le monde 🌎' },
    { icon: '🚚', title: 'LIVRAISON', text: 'Via Mondial Relay pour France, Belgique, Pays-Bas, Italie et Allemagne.' },
    { icon: '💬', title: 'SERVICE CLIENT', text: 'Un service client à votre écoute pour une expérience sur mesure.' },
    { icon: '🔒', title: 'SECURE PAYMENTS', text: 'Paiement 100% sécurisé pour une expérience en toute confiance.' },
  ],
  en: [
    { icon: '✈️', title: 'FREE SHIPPING', text: 'Complimentary worldwide delivery on orders over €230 🌎' },
    { icon: '🚚', title: 'DELIVERY', text: 'Via Mondial Relay for France, Belgium, Netherlands, Italy and Germany.' },
    { icon: '💬', title: 'CUSTOMER SERVICE', text: 'A dedicated customer service for a tailored KB HAIR PARIS experience.' },
    { icon: '🔒', title: 'SECURE PAYMENTS', text: '100% secure payment for a confident shopping experience.' },
  ],
}

export function AvantagesCarousel({ locale }: { locale: 'fr' | 'en' }) {
  const items = AVANTAGES[locale]
  return (
    <section className='bg-[#F5F5F5] py-14'>
      <div className='grid grid-cols-2 gap-0 max-w-screen-xl mx-auto'>
        {items.map((item, i) => (
          <div key={i} className='flex flex-col items-center text-center px-4 py-6 border-[#e0e0e0]' style={{borderRight: i % 2 === 0 ? '1px solid #e0e0e0' : 'none', borderBottom: i < 2 ? '1px solid #e0e0e0' : 'none'}}>
            <div className='text-2xl mb-2'>{item.icon}</div>
            <p className='font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-black mb-1'>{item.title}</p>
            <p className='font-sans text-[11px] font-light text-[#666] leading-snug max-w-[160px]'>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}