export function RawHairSection({ locale }: { locale: 'fr' | 'en' }) {
  return (
    <section className="bg-black px-6 py-14 text-center">
      <div className="w-full mb-8 bg-[#1a1510]" style={{ aspectRatio: '16/9' }} />
      <p className="font-sans text-[12px] font-normal tracking-[0.35em] uppercase text-white mb-3">
        RAW HAIR
      </p>
      <p className="font-sans text-[14px] font-light text-white/70 leading-relaxed">
        {locale === 'fr'
          ? "La perfection du cheveu, inspirée par l'élégance française 🇫🇷"
          : 'Hair perfection, inspired by French elegance 🇫🇷'}
      </p>
    </section>
  )
}
