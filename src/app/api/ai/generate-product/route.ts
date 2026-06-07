import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, categoryName } = await req.json()

    const prompt = `Tu es un expert SEO et copywriter spécialisé dans le hair care premium parisien. Tu travailles pour KB Hair Paris, marque premium de Raw Hair basée à Paris, France.

Analyse cette image de produit capillaire et génère du contenu optimisé SEO en français ET en anglais.

RÈGLES SEO STRICTES ET OBLIGATOIRES :
- Description FR : MINIMUM 245 mots, MAXIMUM 260 mots. Ne jamais couper une phrase. Compter précisément.
- Description EN : MINIMUM 245 mots, MAXIMUM 260 mots. Ne jamais couper une phrase.
- Titre SEO FR : MINIMUM 55 caractères, MAXIMUM 60 caractères exactement.
- Titre SEO EN : MINIMUM 55 caractères, MAXIMUM 60 caractères exactement.
- Meta description FR : MINIMUM 150 caractères, MAXIMUM 160 caractères exactement.
- Meta description EN : MINIMUM 150 caractères, MAXIMUM 160 caractères exactement.

RÈGLES DE TON ET CONTENU OBLIGATOIRES :
- Mentionner "KB Hair Paris" au moins 4 fois dans chaque description
- Mentionner "Paris" ou "France" au moins 3 fois dans chaque description
- Mentionner la livraison internationale depuis Paris au moins une fois
- Ton naturel, premium, authentique — jamais générique
- Éviter absolument : "de qualité", "produit excellent", "vous serez satisfait", "n'hésitez pas"
- Utiliser : noms de textures précis, origines géographiques du cheveu, techniques de pose, durabilité
- Toujours finir les phrases complètement
- Inclure des mots-clés naturellement : raw hair, extensions capillaires, perruque, Paris, livraison France

Catégorie du produit : ${categoryName || 'extensions capillaires'}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :
{
  "name_fr": "nom court du produit en français (3-6 mots)",
  "name_en": "product short name in english (3-6 words)",
  "short_desc_fr": "description courte accrocheuse 1-2 phrases maximum 150 caractères",
  "short_desc_en": "short catchy description 1-2 sentences max 150 characters",
  "description_fr": "description longue FR MINIMUM 245 mots OBLIGATOIRE sans couper les phrases",
  "description_en": "long description EN MINIMUM 245 words MANDATORY without cutting sentences",
  "seo_title_fr": "titre SEO FR entre 55 et 60 caractères exactement",
  "seo_title_en": "SEO title EN between 55 and 60 characters exactly",
  "seo_desc_fr": "meta description FR entre 150 et 160 caractères exactement",
  "seo_desc_en": "meta description EN between 150 and 160 characters exactly",
  "tags": "tag1, tag2, tag3, tag4, tag5 en français séparés par virgule"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const text = data.content[0].text.trim()
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
