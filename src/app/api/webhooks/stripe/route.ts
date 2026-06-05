import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Session
    const orderId = session.metadata?.order_id

    if (!orderId) return NextResponse.json({ received: true })

    // Mettre à jour statut commande
    await supabase
      .from('orders')
      .update({
        status:                 'confirmed',
        payment_status:         'paid',
        stripe_payment_intent:  session.payment_intent as string,
        updated_at:             new Date().toISOString(),
      })
      .eq('id', orderId)

    // Mettre à jour ou créer le client
    const customerEmail = session.customer_email
    if (customerEmail) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id, total_spent, order_count')
        .eq('email', customerEmail)
        .single()

      const amount = (session.amount_total ?? 0) / 100

      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_spent: customer.total_spent + amount,
            order_count: customer.order_count + 1,
            updated_at:  new Date().toISOString(),
          })
          .eq('id', customer.id)

        // Lier commande au client
        await supabase
          .from('orders')
          .update({ customer_id: customer.id })
          .eq('id', orderId)
      }
    }

    // Historique statut
    await supabase.from('order_status_history').insert({
      order_id:   orderId,
      status:     'confirmed',
      note:       'Paiement confirmé via Stripe',
      created_by: 'system',
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    await supabase
      .from('orders')
      .update({ payment_status: 'unpaid', status: 'cancelled' })
      .eq('stripe_payment_intent', pi.id)
  }

  return NextResponse.json({ received: true })
}
