import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()
    const prompt = 'Tu es expert SEO KB Hair Paris. Analyse cette image et genere en JSON: {name_fr, name_en, slug, description_fr (120-140 mots, mentionner KB Hair Paris 2x, Paris 1x, premium naturel), description_en (120-140 words)}. JSON pur sans markdown.'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2000, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'url', url: imageUrl } }, { type: 'text', text: prompt }] }] }),
    })
    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })
    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim()
    return NextResponse.json(JSON.parse(text))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
