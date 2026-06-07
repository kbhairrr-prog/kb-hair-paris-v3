import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, name_fr, categoryName, variantTypes } = await req.json()

    const variantTypesList = variantTypes.map((vt: any) => vt.name_fr).join(', ')

    const prompt = `Tu es un expert en extensions capillaires premium pour KB Hair Paris, marque basee a Paris France.

Analyse ce produit capillaire et suggere des variantes realistes et coherentes.

PRODUIT : ${name_fr}
CATEGORIE : ${categoryName}
TYPES DE VARIANTES DISPONIBLES : ${variantTypesList}

REGLES STRICTES :
- Suggere uniquement des variantes que ce type de produit peut reellement avoir
- Pour les longueurs : utilise les pouces (12, 14, 16, 18, 20, 22, 24 pouces)
- Pour les textures : Straight, Body Wave, Deep Wave, Curly, Kinky Curly
- Pour les couleurs : Naturel, Ombre, Blond, Brun, Noir
- Pour la densite : 150%, 180%, 200%, 250%
- Pour le type de lace : 13x4, 13x6, 5x5, 360 Lace
- Genere entre 3 et 6 variantes representatives — pas toutes les combinaisons possibles
- Chaque variante doit avoir des options coherentes entre elles
- Ne mets PAS de prix ni de stock — le gestionnaire les remplira lui-meme
- Les variantes doivent correspondre a ce qu on voit sur la photo

Reponds UNIQUEMENT en JSON valide sans markdown :
{
  "variants": [
    {
      "selectedOptions": {
        "ID_TYPE_LONGUEUR": "16 pouces",
        "ID_TYPE_TEXTURE": "Straight",
        "ID_TYPE_COULEUR": "Naturel"
      }
    }
  ]
}

Les IDs des types de variantes sont :
${variantTypes.map((vt: any) => `${vt.name_fr} -> "${vt.id}"`).join('\n')}
`

    const messages: any[] = []
    
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: imageUrl } },
          { type: 'text', text: prompt }
        ]
      })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages,
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })

    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('AI suggest-variants error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
