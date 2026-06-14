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

    const prompt = `Tu es une experte en extensions capillaires premium avec 10 ans d experience. Tu rediges pour KB Hair Paris, marque fondee a Paris specialisee en Raw Hair authentique provenant du Cambodge, de l Inde et du Bresil.

MISSION E-E-A-T GOOGLE :
- Experience : decris ce que la cliente vivra concretement en portant ce produit
- Expertise : utilise les vrais termes techniques du secteur capillaire
- Authoritativeness : positionne KB Hair Paris comme LA reference Raw Hair a Paris
- Trust : mentionne l authenticite du cheveu, la tracabilite, les garanties

CATEGORIE : ${categoryName || 'extensions capillaires'}
GUIDE CATEGORIE : ${catGuide}

REGLES DE TON HUMAIN :
- Ecris comme une vraie experte qui parle a une amie, pas comme un robot
- Commence chaque description differemment, jamais par Decouvrez ou Bienvenue
- Melange phrases courtes percutantes et phrases descriptives detaillees
- Decris des details concrets visibles sur la photo : texture, longueur estimee, couleur, brillance
- INTERDITS ABSOLUS : de qualite, produit excellent, vous serez satisfait, n hesitez pas, incontournable, ideal pour
- Chaque affirmation doit etre justifiee par un detail concret

REGLES SEO STRICTES :
- Description FR : MINIMUM 245 mots, MAXIMUM 260 mots
- Description EN : MINIMUM 245 mots, MAXIMUM 260 mots
- Titre SEO FR : entre 55 et 60 caracteres exactement
- Titre SEO EN : entre 55 et 60 characters exactly
- Meta description FR : entre 150 et 160 caracteres exactement
- Meta description EN : entre 150 et 160 characters exactly
- KB Hair Paris mentionne au moins 3 fois naturellement dans chaque description
- Paris ou France mentionne au moins 2 fois
- Mots-cles naturels : raw hair, extensions capillaires, ${categoryName}, Paris

Reponds UNIQUEMENT en JSON valide sans markdown :
{
  "name_fr": "nom 3-6 mots precis decrivant exactement ce qu on voit",
  "name_en": "name 3-6 words precise description of what we see",
  "short_desc_fr": "1-2 phrases percutantes max 150 caracteres accrocheuses et vraies",
  "short_desc_en": "1-2 punchy sentences max 150 characters catchy and real",
  "description_fr": "description experte 245-260 mots ton humain E-E-A-T naturel",
  "description_en": "expert description 245-260 words human tone E-E-A-T natural",
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
