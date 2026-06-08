import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { slug, title_fr } = await req.json()
    const prompt = `Tu es expert juridique et SEO pour KB Hair Paris, marque premium de Raw Hair basee a Paris France. Genere le contenu complet de la page '${title_fr}' (slug: ${slug}) adapte au e-commerce de vente d extensions capillaires en France. Respecte le droit francais (RGPD, loi consommation, etc). Ton premium KB Hair Paris. Reponds en JSON pur: {content_fr, content_en, seo_title_fr (55-60 chars), seo_title_en (55-60 chars), seo_desc_fr (150-160 chars), seo_desc_en (150-160 chars)}`
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
    })
    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim()
    return NextResponse.json(JSON.parse(text))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
