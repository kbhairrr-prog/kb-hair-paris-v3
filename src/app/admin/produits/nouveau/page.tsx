import ProductForm from '@/components/admin/ProductForm'
import { createAdminClient } from '@/lib/supabase'

export default async function NouveauProduit() {
  const supabaseAdmin = createAdminClient()
  const { data: variantTypes } = await supabaseAdmin.from('variant_types').select('*').order('position')
  return <ProductForm initialVariantTypes={variantTypes ?? []} />
}
