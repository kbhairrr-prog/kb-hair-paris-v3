import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, locale = 'fr' } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  const supabase = createAdminClient()
  const { error } = await supabase.from('newsletter').upsert(
    { email: email.toLowerCase().trim(), locale, is_active: true, source: 'website' },
    { onConflict: 'email' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
