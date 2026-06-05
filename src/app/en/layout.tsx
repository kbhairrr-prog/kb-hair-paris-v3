import Header from '@/components/layout/Header'
import CartDrawer from '@/components/cart/CartDrawer'

export default function ENLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      {children}
      <CartDrawer locale="en" />
    </>
  )
}
