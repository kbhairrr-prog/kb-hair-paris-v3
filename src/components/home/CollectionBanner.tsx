import Image from 'next/image'
import Link from 'next/link'

interface CollectionBannerProps {
  locale: 'fr' | 'en'
  label: string
  href: string
  imageUrl?: string
}

export function CollectionBanner({ label, href, imageUrl }: CollectionBannerProps) {
  return (
    <Link href={href} className="relative block w-full no-underline" style={{ aspectRatio: '1/1' }}>
      {imageUrl ? (
        <Image src={imageUrl} alt={label} fill className="object-cover" sizes="100vw" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#0d0d0d]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span className="font-serif text-[26px] font-light tracking-[0.2em] uppercase text-white">
          {label}
        </span>
      </div>
    </Link>
  )
}
