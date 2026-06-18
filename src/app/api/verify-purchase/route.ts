import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, productId } = await req.json()
    if (!email || !productId) {
      return NextResponse.json({ verified: false, error: 'Missing email or productId' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_items(product_id)')
      .eq('guest_email', email)
      .eq('payment_status', 'paid')

    if (error) {
      return NextResponse.json({ verified: false, error: error.message }, { status: 500 })
    }

    const hasPurchased = (orders ?? []).some((o: any) =>
      (o.order_items ?? []).some((it: any) => it.product_id === productId)
    )

    return NextResponse.json({ verified: hasPurchased })
  } catch (err: any) {
    return NextResponse.json({ verified: false, error: err.message }, { status: 500 })
  }
}
