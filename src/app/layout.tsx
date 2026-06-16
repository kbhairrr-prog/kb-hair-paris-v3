import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'KB Hair Paris — Extensions & Perruques Premium',
    template: '%s | KB Hair Paris',
  },
  description: 'Découvrez KB Hair Paris, votre destination premium pour extensions capillaires et perruques de qualité supérieure.',
  keywords: ['extensions capillaires', 'perruques', 'wigs', 'bundles', 'frontales', 'closures', 'paris', 'hair extensions'],
  openGraph: {
    title: 'KB Hair Paris',
    description: 'Extensions & Perruques Premium — Paris',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'KB Hair Paris',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KB Hair Paris',
    description: 'Extensions & Perruques Premium — Paris',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: '1FZOwAkZN7GnnXB4xcpj1xeqhtI3duEuek2bUqv3O5k',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
