import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  try {
    const { items, form, promoCode, locale } = await req.json()
    const supabase = createAdminClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    // Construire line_items Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: locale === 'fr' ? item.product.name_fr : item.product.name_en,
          images: item.product.images?.[0]?.url ? [item.product.images[0].url] : [],
          metadata: {
            product_id: item.product_id,
            variant_id: item.variant_id ?? '',
          },
        },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    }))

    // Frais de livraison depuis Supabase
    const subtotal = items.reduce((s: number, i: any) => s + i.total_price, 0)
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: shippingSettings } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'shipping').single()
    const shippingCost = shippingSettings?.value?.shipping_cost ?? 25
    const freeThreshold = shippingSettings?.value?.free_threshold ?? 230
    const shipping = subtotal >= freeThreshold ? 0 : shippingCost

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: locale === 'fr' ? 'Livraison' : 'Shipping',
            images: [],
            metadata: {},
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    // Vérifier code promo Stripe (coupon)
    let discounts: Stripe.Checkout.SessionCreateParams['discounts'] = []
    if (promoCode) {
      try {
        const coupon = await stripe.coupons.retrieve(promoCode)
        if (coupon) discounts = [{ coupon: coupon.id }]
      } catch {
        // Code promo non trouvé dans Stripe, on ignore
      }
    }

    // Créer commande pending en DB
    const { data: order } = await supabase
      .from('orders')
      .insert({
        guest_email:      form.email,
        status:           'pending',
        payment_status:   'unpaid',
        payment_method:   'stripe',
        subtotal,
        shipping_amount:  shipping,
        total:            subtotal + shipping,
        currency:         'EUR',
        shipping_address: form,
        billing_address:  form,
        promo_code:       promoCode ?? null,
        locale,
      })
      .select()
      .single()

    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      discounts,
      customer_email: form.email,
      success_url: `${appUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order?.id}`,
      cancel_url:  `${appUrl}/${locale}/checkout`,
      shipping_address_collection: {
        allowed_countries: ['FR','BE','NL','IT','DE','CH','LU','ES','GB','US','CA','SN','CI','BJ','CM'],
      },
      metadata: {
        order_id:  order?.id ?? '',
        locale,
        promo_code: promoCode ?? '',
      },
      locale: locale === 'fr' ? 'fr' : 'en',
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
