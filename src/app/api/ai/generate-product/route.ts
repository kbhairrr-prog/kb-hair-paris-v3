import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, categoryName } = await req.json()

    const categoryGuide: Record<string, string> = {
      'wigs': 'perruques lace wig full lace lace front 360 - decrire la transparence du lace, le bebe hair, le look naturel indetectable, la personnalisation possible',
      'wigs-colorees': 'perruques colorees ombrees - decrire la couleur precise visible, la technique de coloration sur raw hair, la tenue de la couleur',
      'wigs-braids': 'perruques tressee - decrire le type de tresses visible, la densite, la durabilite, le rendu naturel du lace',
      'bundles': 'tissages raw hair - decrire la texture precise, l origine geographique du cheveu, la longevite, la technique de couture weft recommandee',
      'frontales': 'frontales 13x4 ou 13x6 - decrire la zone de pose, le bebe hair, la colle lace recommandee, le rendu naturel sur le front',
      'closures': 'closures 4x4 ou 5x5 - decrire la finition du dessus de tete, la protection des cheveux naturels, le placement central ou lateral',
      'accessoires': 'accessoires capillaires - decrire les benefices precis du produit, la compatibilite avec le raw hair, le mode utilisation',
      'produits': 'produits capillaires - decrire la formulation, les benefices precis sur les extensions, la compatibilite avec le raw hair',
      'vip-cards': 'cartes VIP fidelite KB Hair Paris - decrire les avantages exclusifs, les reductions, acces prioritaire nouveautes',
      'services': 'services capillaires KB Hair Paris - decrire le service propose, expertise equipe, resultats attendus',
    }

    const catKey = (categoryName || '').toLowerCase().replace(/\s+/g, '-')
    const catGuide = categoryGuide[catKey] || 'extensions capillaires premium raw hair - analyser precisement ce qui est visible sur la photo'

    const prompt = `Tu es une experte en extensions capillaires premium avec 10 ans d'experience. Tu rediges pour KB Hair Paris, marque parisienne specialisee en Raw Hair authentique provenant principalement du Vietnam.

CATEGORIE : ${categoryName || 'extensions capillaires'}
GUIDE CATEGORIE : ${catGuide}

TON :
Ecris comme une experte qui decrit ce produit a une cliente en boutique - directe, precise, jamais ronflante.
Varie vraiment la longueur des phrases : certaines tres courtes (5-8 mots), d'autres plus developpees.
Decris 2-3 details concrets et specifiques visibles sur la photo (texture exacte, longueur, couleur, finition) plutot que des qualites generales.
Une seule mention de KB Hair Paris suffit si elle est bien placee. Pas besoin de forcer Paris ou France plusieurs fois.

INTERDITS ABSOLUS : de qualite, produit excellent, vous serez satisfaite, n hesitez pas, incontournable, ideal pour, decouvrez, plebiscite par, et toute phrase qui pourrait s appliquer a n importe quel produit capillaire sans rien changer.

LONGUEUR :
- Description FR et EN : 120-170 mots chacune, prose naturelle, pas de remplissage
- Titre SEO FR/EN : 55-60 caracteres avec mot-cle principal
- Meta description FR/EN : 150-160 caracteres, incitative

Reponds UNIQUEMENT en JSON valide sans markdown :
{
  "name_fr": "nom 3-6 mots decrivant exactement ce qu on voit - NE PAS repeter la categorie (ex: pas de Perruque si categorie=Wigs, pas de Tissage si categorie=Bundles) - juste la texture couleur ou specificite visible",
  "name_en": "name 3-6 words describing exactly what we see - DO NOT repeat the category name - just texture color or visible specificity",
  "short_desc_fr": "1-2 phrases percutantes max 150 caracteres accrocheuses et vraies",
  "short_desc_en": "1-2 punchy sentences max 150 characters catchy and real",
  "description_fr": "description experte 120-170 mots ton humain naturel",
  "description_en": "expert description 120-170 words natural human tone",
  "seo_title_fr": "titre SEO 55-60 caracteres avec mot-cle principal",
  "seo_title_en": "SEO title 55-60 characters with main keyword",
  "seo_desc_fr": "meta 150-160 caracteres incitative avec KB Hair Paris",
  "seo_desc_en": "meta 150-160 characters compelling with KB Hair Paris",
  "tags": "6-8 tags precis en francais separes par virgule"
}`

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
        max_tokens: 4000,
        messages,
      }),
    })

    const data = await response.json()
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 })

    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('AI generate-product error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
