import Header from '@/components/layout/Header'
import CartDrawer from '@/components/cart/CartDrawer'

export default function FRLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="fr" />
      {children}
      <CartDrawer locale="fr" />
    </>
  )
}
