import ProductForm from '@/components/admin/ProductForm'

export default function EditProduit({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />
}
