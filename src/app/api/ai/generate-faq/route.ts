import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name_fr, name_en, description_fr, description_en, categoryName } = await req.json()

    const prompt = `Tu es un expert SEO et copywriter pour KB Hair Paris, marque premium de Raw Hair basee a Paris, France.

Tu vas generer des FAQ pour un produit KB Hair Paris. Ces FAQ doivent etre coherentes avec la description du produit fournie. Jamais de contradictions, jamais de mensonges, jamais de tournures robotiques ou generiques.

PRODUIT :
Nom FR : ${name_fr}
Nom EN : ${name_en}
Categorie : ${categoryName}
Description FR : ${description_fr}

REGLES STRICTES :
- Genere exactement 6 FAQ
- Chaque question doit etre naturelle, comme une vraie cliente qui se pose une vraie question
- Chaque reponse doit etre coherente avec la description fournie — jamais inventer
- Mentionner KB Hair Paris au moins 3 fois au total dans les reponses
- Mentionner Paris ou France au moins 2 fois
- Ton premium, humain, chaleureux — pas robotique
- Eviter absolument : "n hesitez pas", "excellent produit", "vous serez satisfait", "de qualite"
- Les reponses doivent etre specifiques au produit, pas generiques
- Longueur reponse : 2-4 phrases naturelles et completes
- Inclure des FAQ sur : entretien, duree de vie, livraison, origine du cheveu, pose, garantie

Reponds UNIQUEMENT en JSON valide sans markdown sans backticks :
{
  "faqs": [
    {
      "question_fr": "question naturelle en francais",
      "question_en": "natural question in english",
      "answer_fr": "reponse coherente avec la description en francais 2-4 phrases",
      "answer_en": "consistent answer with description in english 2-4 sentences"
    }
  ]
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
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
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
    console.error('AI FAQ error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
