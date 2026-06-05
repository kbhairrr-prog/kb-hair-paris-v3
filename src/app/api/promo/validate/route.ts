import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: promo } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!promo) return NextResponse.json({ error: 'Code invalide' }, { status: 404 })

  // Vérifications
  const now = new Date()
  if (promo.starts_at && new Date(promo.starts_at) > now)
    return NextResponse.json({ error: 'Code pas encore actif' }, { status: 400 })
  if (promo.expires_at && new Date(promo.expires_at) < now)
    return NextResponse.json({ error: 'Code expiré' }, { status: 400 })
  if (promo.max_uses && promo.used_count >= promo.max_uses)
    return NextResponse.json({ error: 'Code épuisé' }, { status: 400 })
  if (subtotal < promo.min_order_amount)
    return NextResponse.json({
      error: `Minimum de commande : €${promo.min_order_amount}`,
    }, { status: 400 })

  return NextResponse.json({ promo })
}
