export function LuxeSection({ locale }: { locale: 'fr' | 'en' }) {
  return (
    <section className="bg-[#f0f0f0] px-6 py-14 text-center">
      <h2 className="font-serif text-[26px] font-light tracking-[0.12em] uppercase text-black mb-6">
        THE LUXE EXPERIENCE
      </h2>
      <p className="font-sans text-[13px] font-light leading-[1.8] text-[#444] max-w-[580px] mx-auto">
        {locale === 'fr' ? (
          <>
            Nos extensions de cheveux de luxe sont soigneusement sélectionnées auprès des plus
            prestigieux fournisseurs cambodgiens et vietnamiens. D'une qualité exceptionnelle,
            nos mèches sont à la fois{' '}
            <strong className="font-semibold text-black">soyeuses, souples et durables.</strong>{' '}
            Plébiscitées par des coiffeurs renommés et adoptées par des célébrités, KB Hair Paris
            vous propose des extensions capillaires d'une{' '}
            <strong className="font-semibold text-black">longévité remarquable</strong>,
            pouvant durer plusieurs années avec un entretien adéquat.
          </>
        ) : (
          <>
            Our luxury hair extensions are carefully sourced from the most prestigious Cambodian
            and Vietnamese suppliers. Of exceptional quality, our wefts are{' '}
            <strong className="font-semibold text-black">silky, supple and durable.</strong>{' '}
            Favored by renowned stylists and celebrities, KB Hair Paris offers hair extensions
            with{' '}
            <strong className="font-semibold text-black">remarkable longevity</strong>,
            lasting several years with proper care.
          </>
        )}
      </p>
    </section>
  )
}
