import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kbhair.fr'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/fr/checkout', '/en/checkout'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
