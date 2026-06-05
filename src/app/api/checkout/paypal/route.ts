import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

async function getPayPalAccessToken() {
  const clientId     = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const base64       = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${base64}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token as string
}

export async function POST(req: NextRequest) {
  try {
    const { items, form, promoCode, locale } = await req.json()
    const supabase = createAdminClient()
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL!

    const subtotal = items.reduce((s: number, i: any) => s + i.total_price, 0)
    const shipping  = subtotal >= 230 ? 0 : 6.90
    const total     = subtotal + shipping

    // Créer commande pending
    const { data: order } = await supabase
      .from('orders')
      .insert({
        guest_email: form.email, status: 'pending', payment_status: 'unpaid',
        payment_method: 'paypal', subtotal, shipping_amount: shipping,
        total, currency: 'EUR', shipping_address: form, billing_address: form,
        promo_code: promoCode ?? null, locale,
      })
      .select().single()

    const accessToken = await getPayPalAccessToken()

    // Créer commande PayPal
    const paypalOrder = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'EUR', value: total.toFixed(2) },
          description: 'KB Hair Paris',
          custom_id: order?.id,
        }],
        application_context: {
          return_url: `${appUrl}/${locale}/checkout/success?order_id=${order?.id}`,
          cancel_url:  `${appUrl}/${locale}/checkout`,
          brand_name:  'KB Hair Paris',
          locale:      locale === 'fr' ? 'fr-FR' : 'en-US',
        },
      }),
    }).then(r => r.json())

    // Sauvegarder ID PayPal
    if (order?.id) {
      await supabase.from('orders').update({ paypal_order_id: paypalOrder.id }).eq('id', order.id)
    }

    const approvalUrl = paypalOrder.links?.find((l: any) => l.rel === 'approve')?.href
    return NextResponse.json({ approvalUrl, orderId: paypalOrder.id })
  } catch (err: any) {
    console.error('PayPal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
