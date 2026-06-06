'use client'

import { useState } from 'react'
import { X, Ruler } from 'lucide-react'

interface SizeGuideProps {
  locale: 'fr' | 'en'
  type?: 'bundles' | 'wigs' | 'general'
}

const GUIDE_DATA = {
  fr: {
    title: 'Guide des longueurs',
    subtitle: 'Trouvez votre longueur idéale',
    headers: ['Longueur', 'Position sur le corps', 'Style'],
    rows: [
      ['8"  — 20 cm',  'Milieu du cou',        'Bob court, chic'],
      ['10" — 25 cm',  'Épaules',              'Bob, naturel'],
      ['12" — 30 cm',  'Dessus de la poitrine','Longueur classique'],
      ['14" — 35 cm',  'Poitrine',             'Élégant, polyvalent'],
      ['16" — 40 cm',  'Dessous de poitrine',  'Glamour, féminin'],
      ['18" — 45 cm',  'Milieu du ventre',     'Romantique'],
      ['20" — 50 cm',  'Nombril',              'Diva, statement'],
      ['22" — 55 cm',  'Hanches',              'Ultra long'],
      ['24" — 60 cm',  'Milieu des hanches',   'Majestueux'],
      ['26" — 65 cm',  'Cuisses',              'Extra long'],
      ['28" — 70 cm',  'Mi-cuisses',           'Maximum longueur'],
      ['30" — 75 cm',  'Genoux',               'Exceptionnel'],
    ],
    note: '⚠️ Les mesures sont prises sur cheveux étirés. Les cheveux bouclés ou ondulés sembleront plus courts.',
    tip:  '💡 Conseil : Mesurez de votre cuir chevelu jusqu\'à l\'endroit souhaité sur votre corps pour trouver votre longueur idéale.',
  },
  en: {
    title: 'Length Guide',
    subtitle: 'Find your perfect length',
    headers: ['Length', 'Body position', 'Style'],
    rows: [
      ['8"  — 20 cm',  'Mid-neck',          'Short bob, chic'],
      ['10" — 25 cm',  'Shoulders',         'Bob, natural'],
      ['12" — 30 cm',  'Above chest',       'Classic length'],
      ['14" — 35 cm',  'Chest',             'Elegant, versatile'],
      ['16" — 40 cm',  'Below chest',       'Glamorous, feminine'],
      ['18" — 45 cm',  'Mid-stomach',       'Romantic'],
      ['20" — 50 cm',  'Navel',             'Diva, statement'],
      ['22" — 55 cm',  'Hips',              'Ultra long'],
      ['24" — 60 cm',  'Mid-hips',          'Majestic'],
      ['26" — 65 cm',  'Thighs',            'Extra long'],
      ['28" — 70 cm',  'Mid-thighs',        'Maximum length'],
      ['30" — 75 cm',  'Knees',             'Exceptional'],
    ],
    note: '⚠️ Measurements are taken on straightened hair. Curly or wavy hair will appear shorter.',
    tip:  '💡 Tip: Measure from your scalp to the desired position on your body to find your ideal length.',
  },
}

export default function SizeGuide({ locale, type = 'general' }: SizeGuideProps) {
  const [open, setOpen] = useState(false)
  const data = GUIDE_DATA[locale] ?? GUIDE_DATA['fr']

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 font-sans text-[11px] tracking-[0.1em] uppercase text-[#888] hover:text-black underline underline-offset-4 bg-transparent border-none cursor-pointer"
      >
        <Ruler size={13} />
        {locale === 'fr' ? 'Guide des tailles' : 'Size guide'}
      </button>

      {/* Modal */}
      {open && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-[210] flex items-end lg:items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8] flex-shrink-0">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[#888] mb-0.5">{data.subtitle}</p>
                  <h2 className="font-serif text-[22px] font-light tracking-[0.1em] uppercase text-black">{data.title}</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-[#888] hover:text-black bg-transparent border-none cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e8e8e8]">
                      {data.headers.map(h => (
                        <th key={h} className="text-left pb-2 font-sans text-[10px] font-medium tracking-[0.18em] uppercase text-[#888]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map(([length, position, style], i) => (
                      <tr key={i} className="border-b border-[#f5f5f5] hover:bg-[#fafafa]">
                        <td className="py-3 font-mono text-[12px] font-medium text-black">{length}</td>
                        <td className="py-3 font-sans text-[12px] font-light text-[#555]">{position}</td>
                        <td className="py-3 font-sans text-[12px] font-light text-[#888]">{style}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-5 space-y-3">
                  <p className="font-sans text-[11px] font-light text-[#666] leading-relaxed">{data.note}</p>
                  <p className="font-sans text-[11px] font-light text-[#666] leading-relaxed">{data.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
