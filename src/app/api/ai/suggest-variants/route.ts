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

REGLE LA PLUS IMPORTANTE - TRADUCTION OBLIGATOIRE :
Le champ "en" de chaque option DOIT TOUJOURS etre une vraie traduction anglaise du champ "fr".
Le champ "en" ne doit JAMAIS etre identique au champ "fr", SAUF pour les valeurs numeriques/codes qui sont universels (ex: "150%", "13x4", "360 Lace").
Exemples de traductions correctes a appliquer pour TOUTE couleur que tu choisis, meme si elle n'est pas dans la liste ci-dessous :
Naturel->Natural, Noir->Black, Brun->Brown, Blond->Blonde, Rouge->Red, Bordeaux->Burgundy, Caramel->Caramel, Châtain->Chestnut, Gris->Grey, Rose->Pink, Bleu->Blue, Violet->Purple, Ombre->Ombre, Doré->Golden, Cuivré->Copper.
Si tu utilises une couleur absente de cette liste, traduis-la toi-meme en anglais correct - ne la laisse jamais identique au francais.

REGLES STRICTES :
- Suggere uniquement des variantes que ce type de produit peut reellement avoir
- Pour les longueurs : FR "16 pouces", EN "16 inches" (utilise 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40). NE PAS inclure le champ "color" pour la longueur.
- Pour les textures : FR et EN identiques uniquement pour les mots techniques universels : Straight, Body Wave, Deep Wave, Curly, Kinky Curly. NE PAS inclure le champ "color" pour la texture.
- Pour la densite : FR et EN identiques (valeur numerique) : 150%, 180%, 200%, 250%. NE PAS inclure le champ "color".
- Pour le type de lace : FR et EN identiques (code technique) : 13x4, 13x6, 5x5, 360 Lace. NE PAS inclure le champ "color".
- Pour la COULEUR UNIQUEMENT : inclure le champ "color" avec un code hex representant visuellement la couleur (ex: "#1a1a1a" pour noir, "#8B4513" pour brun).
- Genere entre 3 et 6 variantes representatives — pas toutes les combinaisons possibles
- INTERDICTION ABSOLUE DE DOUBLON : chaque combinaison de valeurs (longueur+couleur+texture etc) doit etre UNIQUE dans la liste. Ne genere jamais deux fois la meme combinaison exacte.
- Chaque variante doit avoir des options coherentes entre elles
- Ne mets PAS de prix ni de stock — le gestionnaire les remplira lui-meme
- Les variantes doivent correspondre a ce qu on voit sur la photo

Les IDs des types de variantes sont (utilise EXACTEMENT ces UUIDs comme cles) :
${variantTypes.map((vt: any) => `${vt.name_fr} -> "${vt.id}"`).join('\n')}

Exemple de JSON attendu (avec les vrais UUIDs) — noter que "color" n'apparait QUE pour le type Couleur :
{
  "variants": [
    {
      "selectedOptions": {
        "UUID_TYPE_LONGUEUR": { "fr": "16 pouces", "en": "16 inches" },
        "UUID_TYPE_TEXTURE": { "fr": "Body Wave", "en": "Body Wave" },
        "UUID_TYPE_COULEUR": { "fr": "Noir Naturel", "en": "Natural Black", "color": "#1a1a1a" }
      }
    }
  ]
}

Reponds UNIQUEMENT en JSON valide sans markdown, en utilisant les vrais UUIDs ci-dessus comme cles.`
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
